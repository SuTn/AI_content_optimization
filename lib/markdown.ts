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
 * Adjust color opacity (removed - WeChat doesn't support rgba)
 * Use lightenColor instead for light backgrounds
 */
function lightenColor(color: string, amount: number = 0.9): string {
  // For WeChat compatibility, return a very light hex color or named color
  // This is a simplified version - blends with white
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 6) {
      // Mix with white for lighter version
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      const newR = Math.round(r + (255 - r) * amount);
      const newG = Math.round(g + (255 - g) * amount);
      const newB = Math.round(b + (255 - b) * amount);

      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
  }
  return color;
}

/**
 * Adjust color opacity (deprecated - kept for backward compatibility)
 * Use lightenColor instead
 */
function addAlpha(color: string, opacity: number): string {
  return lightenColor(color, 1 - opacity);
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
      // WeChat doesn't support linear-gradient, use solid color instead
      return { ...baseStyle, backgroundColor: color, height: '2px' };
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
    ALLOWED_ATTR: ['style', 'href', 'src', 'alt', 'title', 'target', 'data-wechat-layout'],
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
    // Use table layout instead of flex for WeChat compatibility
    return `<table data-wechat-layout="true" style="width: 100%; margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="${styleAttr}"></td>
        <td style="padding: 0 16px; color: #666; font-size: 14px; white-space: nowrap;">${config.text}</td>
        <td style="${styleAttr}"></td>
      </tr>
    </table>`;
  }

  return `<div data-wechat-layout="true" style="${styleAttr}; margin: 24px 0;"></div>`;
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
      // WeChat doesn't support rgba, use hex color with pre-calculated opacity
      const bgColor = lightenColor(primaryColor, 0.95); // Very light version
      return `<div data-wechat-layout="true" style="border: 2px solid ${primaryColor}; background: ${bgColor}; border-radius: 8px; padding: 20px; margin: 20px 0;">
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
          return `<tr><td colspan="2" style="padding: 4px 0;">${renderedItem}</td></tr>`;
        }
        listNumber++;
        const cleanItem = item.replace(/^[-*]\s*/, '');
        const renderedItem = markdownToHtmlLocal(cleanItem);
        return `<tr>
          <td style="padding: 4px 8px 4px 0; vertical-align: top;">
            <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background: ${primaryColor}; color: #fff; border-radius: 50%; font-weight: bold; font-size: 14px;">${listNumber}</span>
          </td>
          <td style="padding: 4px 0;">${renderedItem}</td>
        </tr>`;
      }).join('');
      return `<table data-wechat-layout="true" style="width: 100%; margin: 12px 0; border-collapse: collapse;">${listItems}</table>`;
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
        tip: { color: primaryColor, bg: lightenColor(primaryColor, 0.92), icon: '💡' },
        warning: { color: '#fa8c16', bg: '#fff7e6', icon: '⚠️' },
        success: { color: '#52c41a', bg: '#f6ffed', icon: '✓' },
        error: { color: '#ff4d4f', bg: '#fff1f0', icon: '✕' },
        note: { color: '#8c8c8c', bg: '#fafafa', icon: '📝' },
        quote: { color: '#722ed1', bg: '#f9f0ff', icon: '"' },
      };

      const { color, bg, icon: defaultIcon } = configs[type];
      const boxIcon = icon || defaultIcon;
      const renderedContent = markdownToHtmlLocal(component.content);

      return `<div data-wechat-layout="true" style="border-left: 4px solid ${color}; background-color: ${bg}; padding: 16px; margin: 16px 0; border-radius: 4px;">
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
        return `<div style="border: 1px solid ${primaryColor}; background: ${lightenColor(primaryColor, 0.95)}; border-radius: 8px; padding: 16px; margin: 8px 0; text-align: center;">
          <span style="display: inline-block; min-width: 24px; height: 24px; line-height: 24px; background: ${primaryColor}; color: #fff; border-radius: 4px; padding: 0 8px; margin-right: 8px; font-size: 14px; font-weight: bold;">${index + 1}</span>
          <span style="font-size: 15px;">${renderedItem}</span>
        </div>${arrow}`;
      }).join('');
      return `<div data-wechat-layout="true" style="padding: 8px 0;">${steps}</div>`;
    }

    case 'timeline': {
      const items = component.content.split('\n').filter((line: string) => line.trim());
      const timelineItems = items.map((item: string, index: number) => {
        const cleanItem = item.replace(/^[-*]\s*/, '');
        const renderedItem = markdownToHtmlLocal(cleanItem);
        // Use table layout instead of inline-block for WeChat compatibility
        return `<table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
          <tr>
            <td style="width: 32px; padding: 0; vertical-align: top; text-align: center;">
              <span style="display: inline-block; width: 12px; height: 12px; background: ${primaryColor}; border-radius: 50%;"></span>
            </td>
            <td style="padding: 0 0 0 8px; vertical-align: top;">
              <div style="border-left: 2px solid #e8e8e8; padding-left: 12px; margin-left: -4px;">${renderedItem}</div>
            </td>
          </tr>
        </table>`;
      }).join('');
      return `<div data-wechat-layout="true" style="padding: 8px 0;">${timelineItems}</div>`;
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
      return `<table data-wechat-layout="true" style="width: 100%; border-collapse: collapse; margin: 16px 0;">${rows}</table>`;
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
          // WeChat doesn't support linear-gradient, use light solid color
          variantStyle = `border: 1px solid ${lightenColor(primaryColor, 0.85)}; background-color: ${lightenColor(primaryColor, 0.95)};`;
          break;
        case 'shadow':
          // WeChat doesn't support box-shadow, use border instead
          variantStyle = 'border: 2px solid #e8e8e8; background-color: #ffffff;';
          break;
        case 'bordered':
          variantStyle = 'border: 3px double #d4d4d4; background-color: #fafafa;';
          break;
        case 'glass':
          // WeChat doesn't support rgba, use solid colors
          variantStyle = 'border: 1px solid #d4d4d4; background: #ffffff;';
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
      return `<div data-wechat-layout="true" style="${baseStyle} ${variantStyle}">${titleHtml}${renderedContent}</div>`;
    }

    case 'spacer': {
      const { height = '20' } = component.params;
      return `<div data-wechat-layout="true" style="height: ${height}px;"></div>`;
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
          // WeChat doesn't support rgba, use lightenColor
          variantStyle = `background-color: ${lightenColor(badgeColor, 0.9)}; color: ${badgeColor};`;
          break;
      }

      const baseStyle = 'display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; margin: 4px;';
      return `<span data-wechat-layout="true" style="${baseStyle} ${variantStyle}">${text || component.content}</span>`;
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

      return `<${tag} data-wechat-layout="true" ${href} style="${baseStyle} ${variantStyle}">${renderedText}</${tag}>`;
    }

    case 'progress': {
      const { percent = '50', height = '8', color } = component.params;
      const barColor = color || primaryColor;
      const barHeight = parseInt(height, 10);
      const clampedPercent = Math.min(100, Math.max(0, parseInt(percent, 10)));

      // WeChat doesn't support transition or overflow:hidden, removed both
      return `<div data-wechat-layout="true" style="width: 100%; height: ${barHeight}px; background: #f0f0f0; border-radius: ${barHeight / 2}px; margin: 12px 0;">
        <div style="height: 100%; width: ${clampedPercent}%; background: ${barColor}; border-radius: ${barHeight / 2}px;"></div>
      </div>`;
    }

    default:
      // For other component types, return the content as-is
      return component.content;
  }
}
