import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { parseLayoutComponents, parseDividers } from '@/lib/layoutParser';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Adjust color opacity
 */
function addAlpha(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  if (color.startsWith('rgb')) {
    return color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  }
  return color;
}

/**
 * Get divider styles
 */
function getDividerStyles(style: string, primaryColor: string, customColor?: string): Record<string, string> {
  const color = customColor || primaryColor;
  const baseStyle: Record<string, string> = {
    height: '1px',
    border: 'none',
  };

  switch (style) {
    case 'solid':
      return { ...baseStyle, backgroundColor: '#e8e8e8' };
    case 'dashed':
      return { ...baseStyle, borderTop: `1px dashed ${color}`, backgroundColor: 'transparent' };
    case 'dotted':
      return { ...baseStyle, borderTop: `1px dotted ${color}`, backgroundColor: 'transparent' };
    case 'gradient':
      return { ...baseStyle, background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`, height: '2px' };
    default:
      return baseStyle;
  }
}

/**
 * Local markdown to HTML converter
 */
function markdownToHtmlLocal(markdown: string): string {
  return marked(markdown) as string;
}

/**
 * Configure marked options
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Parse markdown to HTML
 */
export function markdownToHtml(markdown: string): string {
  const html = marked(markdown) as string;
  return html;
}

/**
 * Sanitize HTML with DOMPurify
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'span',
      'div',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'img',
      'code',
      'pre',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'section',
    ],
    ALLOWED_ATTR: ['style', 'href', 'src', 'alt', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Parse markdown and sanitize - Basic parsing for WeChat
 */
export function parseMarkdown(markdown: string): string {
  const html = markdownToHtml(markdown);
  return sanitizeHtml(html);
}

/**
 * Check if markdown contains layout components
 */
export function hasLayoutComponents(markdown: string): boolean {
  return /:::\w+/.test(markdown) || /---style=/.test(markdown);
}

/**
 * Smart parse markdown - uses layout parsing when detected
 */
export function smartParseMarkdown(markdown: string, primaryColor: string): string {
  // Check if markdown contains layout components
  if (hasLayoutComponents(markdown)) {
    return parseMarkdownWithLayout(markdown, primaryColor);
  }
  // Use basic parsing for regular markdown
  return parseMarkdown(markdown);
}

/**
 * Parse markdown with layout components using smart segment parsing
 * Handles custom syntax like :::card:::, :::tip:::, etc.
 *
 * Key insight: Only call marked() on text segments, NOT on component-generated HTML
 */
export function parseMarkdownWithLayout(markdown: string, primaryColor: string = '#1890ff'): string {
  // Parse both dividers and layout components from the original markdown
  const dividers = parseDividers(markdown);
  const layoutComponents = parseLayoutComponents(markdown);

  // Combine all component positions
  interface ComponentItem {
    start: number;
    end: number;
    html: string;
  }

  const allComponents: ComponentItem[] = [
    ...dividers.map(d => ({
      start: d.start,
      end: d.end,
      html: generateDividerHtmlFromConfig(d.config, primaryColor),
    })),
    ...layoutComponents.map(c => ({
      start: c.start,
      end: c.end,
      html: generateComponentHtmlFromComponent(c, primaryColor),
    })),
  ];

  // Sort by position (ascending)
  allComponents.sort((a, b) => a.start - b.start);

  // Build result by processing segments between components
  let result = '';
  let lastEnd = 0;

  for (const component of allComponents) {
    // Process text segment BEFORE this component with marked()
    if (component.start > lastEnd) {
      const textSegment = markdown.slice(lastEnd, component.start);
      // Only non-empty text segments need markdown parsing
      if (textSegment.trim()) {
        result += markdownToHtml(textSegment);
      } else {
        result += textSegment; // Preserve whitespace
      }
    }

    // Add component HTML directly (DON'T parse again!)
    result += component.html;

    lastEnd = component.end;
  }

  // Process remaining text AFTER all components
  if (lastEnd < markdown.length) {
    const textSegment = markdown.slice(lastEnd);
    if (textSegment.trim()) {
      result += markdownToHtml(textSegment);
    } else {
      result += textSegment;
    }
  }

  // Sanitize the final HTML
  return sanitizeHtml(result);
}

/**
 * Generate divider HTML from config (local helper)
 */
function generateDividerHtmlFromConfig(config: { style: string; text?: string; color?: string }, primaryColor: string): string {
  const dividerStyles = getDividerStyles(config.style as any, primaryColor, config.color);
  const styleAttr = Object.entries(dividerStyles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  if (config.text) {
    return `<div style="display: flex; align-items: center; margin: 24px 0;">
      <div style="flex: 1; ${styleAttr}"></div>
      <span style="padding: 0 16px; color: #666; font-size: 14px;">${config.text}</span>
      <div style="flex: 1; ${styleAttr}"></div>
    </div>`;
  }

  return `<div style="${styleAttr}; margin: 24px 0;"></div>`;
}

/**
 * Generate component HTML from component (local helper)
 */
function generateComponentHtmlFromComponent(component: any, primaryColor: string): string {
  // Generate HTML based on component type
  switch (component.type) {
    case 'callout': {
      const { title = '' } = component.params;
      const renderedContent = markdownToHtmlLocal(component.content);
      return `<div style="border: 2px solid ${primaryColor}; background: ${addAlpha(primaryColor, 0.05)}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        ${title ? `<div style="font-size: 18px; font-weight: bold; color: ${primaryColor}; margin-bottom: 12px;">${title}</div>` : ''}
        ${renderedContent}
      </div>`;
    }

    case 'numbered': {
      const items = component.content.split('\n').filter((line: string) => line.trim());
      let listNumber = 0;
      const listItems = items.map((item: string) => {
        if (!/^[-*]\s*/.test(item)) {
          const renderedItem = markdownToHtmlLocal(item);
          return `<div style="margin: 12px 0; padding-left: 40px;">${renderedItem}</div>`;
        }
        listNumber++;
        const cleanItem = item.replace(/^[-*]\s*/, '');
        const renderedItem = markdownToHtmlLocal(cleanItem);
        return `<div style="margin: 12px 0;">
          <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background: ${primaryColor}; color: #fff; border-radius: 50%; margin-right: 12px; font-weight: bold; font-size: 14px;">${listNumber}</span>
          <span style="display: inline-block; vertical-align: top; width: calc(100% - 40px); margin-top: 4px;">${renderedItem}</span>
        </div>`;
      }).join('');
      return `<div style="padding: 16px 0;">${listItems}</div>`;
    }

    case 'tip':
    case 'warning':
    case 'success':
    case 'error':
    case 'note':
    case 'quote': {
      const type = component.type;
      const { title = '', icon = '' } = component.params;

      const configs: Record<string, { color: string; bg: string; icon: string }> = {
        tip: { color: primaryColor, bg: addAlpha(primaryColor, 0.08), icon: '💡' },
        warning: { color: '#fa8c16', bg: '#fff7e6', icon: '⚠️' },
        success: { color: '#52c41a', bg: '#f6ffed', icon: '✓' },
        error: { color: '#ff4d4f', bg: '#fff1f0', icon: '✕' },
        note: { color: '#8c8c8c', bg: '#fafafa', icon: '📝' },
        quote: { color: '#722ed1', bg: '#f9f0ff', icon: '"' },
      };

      const { color, bg, icon: defaultIcon } = configs[type];
      const boxIcon = icon || defaultIcon;
      const renderedContent = markdownToHtmlLocal(component.content);

      return `<div style="border-left: 4px solid ${color}; background-color: ${bg}; padding: 16px; margin: 16px 0; border-radius: 4px;">
        ${title ? `<div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: ${color};">${boxIcon} ${title}</div>` : `<div style="margin-bottom: 8px; font-weight: bold; color: ${color};">${boxIcon}</div>`}
        ${renderedContent}
      </div>`;
    }

    case 'process': {
      const items = component.content.split('\n').filter((line: string) => line.trim());
      const steps = items.map((item: string, index: number) => {
        const cleanItem = item.replace(/^[-*]\s*/, '');
        const renderedItem = markdownToHtmlLocal(cleanItem);
        const arrow = index < items.length - 1 ?
          `<div style="text-align: center; color: ${primaryColor}; font-size: 20px; margin: 4px 0;">↓</div>` : '';
        return `<div style="border: 1px solid ${primaryColor}; background: ${addAlpha(primaryColor, 0.05)}; border-radius: 8px; padding: 16px; margin: 8px 0; text-align: center;">
          <span style="display: inline-block; min-width: 24px; height: 24px; line-height: 24px; background: ${primaryColor}; color: #fff; border-radius: 4px; padding: 0 8px; margin-right: 8px; font-size: 14px; font-weight: bold;">${index + 1}</span>
          <span style="font-size: 15px;">${renderedItem}</span>
        </div>${arrow}`;
      }).join('');
      return `<div style="padding: 8px 0;">${steps}</div>`;
    }

    case 'timeline': {
      const items = component.content.split('\n').filter((line: string) => line.trim());
      const timelineItems = items.map((item: string, index: number) => {
        const cleanItem = item.replace(/^[-*]\s*/, '');
        const renderedItem = markdownToHtmlLocal(cleanItem);
        return `<div style="position: relative; margin: 16px 0; padding-left: 28px;">
          ${index < items.length - 1 ? `<div style="position: absolute; left: 5px; top: 12px; bottom: -16px; width: 2px; background: #e8e8e8;"></div>` : ''}
          <span style="display: inline-block; width: 12px; height: 12px; background: ${primaryColor}; border-radius: 50%; margin-right: 16px; margin-left: ${index === 0 ? '0' : '6px'}; vertical-align: top;"></span>
          <div style="display: inline-block; vertical-align: top; width: calc(100% - 28px);">${renderedItem}</div>
        </div>`;
      }).join('');
      return `<div style="padding: 8px 0;">${timelineItems}</div>`;
    }

    case 'comparison': {
      const items = component.content.split('\n').filter((line: string) => line.trim());
      const rows = items.map((item: string, index: number) => {
        const cols = item.split('|').map((col: string) => col.trim()).filter((col: string) => col);
        const isHeader = index === 0;
        const cellStyle = isHeader ?
          `background: ${primaryColor}; color: #fff; padding: 12px; font-weight: bold;` :
          `padding: 12px; border: 1px solid #e8e8e8;`;
        const cells = cols.map((col: string) => {
          const renderedCell = markdownToHtmlLocal(col);
          return `<td style="${cellStyle}">${renderedCell}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">${rows}</table>`;
    }

    case 'card': {
      const { variant = 'default', title = '', icon = '' } = component.params;
      const baseStyle = 'border-radius: 12px; padding: 20px; margin: 16px 0; box-sizing: border-box;';

      let variantStyle = '';
      switch (variant) {
        case 'default':
          variantStyle = 'border: 1px solid #e8e8e8; background-color: #ffffff;';
          break;
        case 'primary':
          variantStyle = `border: 2px solid ${primaryColor}; background-color: #fafafa;`;
          break;
        case 'gradient':
          variantStyle = `border: none; background: linear-gradient(135deg, ${addAlpha(primaryColor, 0.15)} 0%, ${addAlpha(primaryColor, 0.05)} 100%);`;
          break;
        case 'shadow':
          variantStyle = 'border: 1px solid #e8e8e8; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);';
          break;
        case 'bordered':
          variantStyle = 'border: 3px double #d4d4d4; background-color: #fafafa;';
          break;
        case 'glass':
          variantStyle = 'border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px);';
          break;
        default:
          variantStyle = 'border: 1px solid #e8e8e8; background-color: #ffffff;';
      }

      const titleColor = (variant === 'primary' || variant === 'gradient') ? primaryColor : '#333';
      const titleHtml = title ?
        `<div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: ${titleColor};">
          ${icon ? `${icon} ` : ''}${title}
        </div>` : '';

      const renderedContent = markdownToHtmlLocal(component.content);
      return `<div style="${baseStyle} ${variantStyle}">${titleHtml}${renderedContent}</div>`;
    }

    case 'spacer': {
      const { height = '20' } = component.params;
      return `<div style="height: ${height}px; overflow: hidden;"></div>`;
    }

    case 'badge': {
      const { text = '', variant = 'soft', color } = component.params;
      const badgeColor = color || primaryColor;

      let variantStyle = '';
      switch (variant) {
        case 'filled':
          variantStyle = `background-color: ${badgeColor}; color: #fff;`;
          break;
        case 'outlined':
          variantStyle = `border: 1px solid ${badgeColor}; color: ${badgeColor}; background-color: transparent;`;
          break;
        case 'soft':
        default:
          variantStyle = `background-color: ${addAlpha(badgeColor, 0.1)}; color: ${badgeColor};`;
          break;
      }

      const baseStyle = 'display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; margin: 4px;';
      return `<span style="${baseStyle} ${variantStyle}">${text || component.content}</span>`;
    }

    case 'button': {
      const { text = component.content, url = '', variant = 'primary' } = component.params;

      let variantStyle = '';
      switch (variant) {
        case 'primary':
          variantStyle = `background-color: ${primaryColor}; color: #fff;`;
          break;
        case 'secondary':
          variantStyle = 'background-color: #f0f0f0; color: #333;';
          break;
        case 'outline':
          variantStyle = `border: 2px solid ${primaryColor}; color: ${primaryColor}; background-color: transparent;`;
          break;
        default:
          variantStyle = `background-color: ${primaryColor}; color: #fff;`;
      }

      const baseStyle = 'display: inline-block; padding: 10px 24px; border-radius: 6px; font-size: 15px; font-weight: bold; text-align: center; cursor: pointer; text-decoration: none; margin: 8px 4px;';
      const renderedText = text ? markdownToHtmlLocal(text).replace(/^<p>|<\/p>$/g, '') : markdownToHtmlLocal(component.content).replace(/^<p>|<\/p>$/g, '');

      const href = url ? `href="${url}"` : '';
      const tag = url ? 'a' : 'div';

      return `<${tag} ${href} style="${baseStyle} ${variantStyle}">${renderedText}</${tag}>`;
    }

    case 'progress': {
      const { percent = '50', height = '8', color } = component.params;
      const barColor = color || primaryColor;
      const barHeight = parseInt(height, 10);
      const clampedPercent = Math.min(100, Math.max(0, parseInt(percent, 10)));

      return `<div style="width: 100%; height: ${barHeight}px; background: #f0f0f0; border-radius: ${barHeight / 2}px; overflow: hidden; margin: 12px 0;">
        <div style="height: 100%; width: ${clampedPercent}%; background: ${barColor}; border-radius: ${barHeight / 2}px; transition: width 0.3s ease;"></div>
      </div>`;
    }

    default:
      // For other component types, return the content as-is
      return component.content;
  }
}
