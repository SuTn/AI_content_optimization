/**
 * Custom Markdown parser for layout components
 * Parses custom syntax like :::card:::, :::tip:::, etc.
 */

import type {
  ParsedLayoutComponent,
  LayoutParserOptions,
  CardVariant,
  InfoBoxType,
  HighlightType,
  DividerStyle,
} from '@/types/layout';

/**
 * Default parser options
 */
const DEFAULT_OPTIONS: Required<LayoutParserOptions> = {
  prefix: ':::',
  suffix: ':::',
  parseInline: false,
};

/**
 * Parse layout components from markdown text
 */
export function parseLayoutComponents(
  markdown: string,
  options: LayoutParserOptions = {}
): ParsedLayoutComponent[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const components: ParsedLayoutComponent[] = [];

  // Regular expression to match layout component blocks
  // Format: :::type param1="value1" param2="value2"\ncontent\n:::
  const regex = new RegExp(
    `${escapeRegex(opts.prefix)}(\\w+)(\\s[^\\n]*?)?\\n([\\s\\S]*?)${escapeRegex(opts.suffix)}`,
    'g'
  );

  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const [fullMatch, type, paramsStr, content] = match;

    const component: ParsedLayoutComponent = {
      type: type.toLowerCase() as any,
      params: parseParams(paramsStr),
      content: content.trim(),
      start: match.index,
      end: match.index + fullMatch.length,
    };

    components.push(component);
  }

  return components;
}

/**
 * Parse dividers from markdown text
 */
export function parseDividers(markdown: string): Array<{ start: number; end: number; config: any }> {
  const dividers: Array<{ start: number; end: number; config: any }> = [];

  // Regex for custom divider syntax: ---style=type--- or ---style=type text="text"---
  const regex = /---(\S+?)---/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const [fullMatch] = match;

    // Parse the divider config
    const config = parseDividerConfig(fullMatch);

    dividers.push({
      start: match.index,
      end: match.index + fullMatch.length,
      config,
    });
  }

  return dividers;
}

/**
 * Parse divider configuration from syntax
 */
function parseDividerConfig(syntax: string): { style: DividerStyle; text?: string; color?: string } {
  const config: { style: DividerStyle; text?: string; color?: string } = {
    style: 'solid',
  };

  // Extract style parameter
  const styleMatch = syntax.match(/style=(\w+)/);
  if (styleMatch) {
    config.style = styleMatch[1] as DividerStyle;
  }

  // Extract text parameter
  const textMatch = syntax.match(/text="([^"]*)"/);
  if (textMatch) {
    config.text = textMatch[1];
  }

  // Extract color parameter
  const colorMatch = syntax.match(/color=(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/);
  if (colorMatch) {
    config.color = colorMatch[1];
  }

  return config;
}

/**
 * Parse parameters from component syntax
 */
function parseParams(paramsStr: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!paramsStr || !paramsStr.trim()) {
    return params;
  }

  // Match key="value" pairs
  const regex = /(\w+)="([^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(paramsStr)) !== null) {
    const [, key, value] = match;
    params[key] = value;
  }

  return params;
}

/**
 * Convert parsed layout components to HTML
 */
export function componentsToHtml(
  markdown: string,
  components: ParsedLayoutComponent[],
  primaryColor: string
): { html: string; replacements: number } {
  let html = markdown;
  let replacements = 0;

  // Sort components by position (reverse order to avoid index issues)
  const sortedComponents = [...components].sort((a, b) => b.start - a.start);

  for (const component of sortedComponents) {
    const componentHtml = generateComponentHtml(component, primaryColor);

    // Replace the original markdown with HTML
    html =
      html.slice(0, component.start) +
      componentHtml +
      html.slice(component.end);

    replacements++;
  }

  return { html, replacements };
}

/**
 * Generate HTML for a parsed layout component
 */
function generateComponentHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  switch (component.type) {
    case 'card':
      return generateCardHtml(component, primaryColor);

    case 'tip':
    case 'warning':
    case 'success':
    case 'error':
    case 'note':
    case 'quote':
      return generateInfoBoxHtml(component, primaryColor);

    case 'numbered':
    case 'process':
    case 'timeline':
    case 'callout':
    case 'comparison':
      return generateHighlightHtml(component, primaryColor);

    case 'divider':
      return generateDividerHtml(component, primaryColor);

    case 'spacer':
      return generateSpacerHtml(component);

    case 'badge':
      return generateBadgeHtml(component, primaryColor);

    case 'button':
      return generateButtonHtml(component, primaryColor);

    case 'progress':
      return generateProgressHtml(component, primaryColor);

    default:
      // Unknown component, return original content
      return component.content;
  }
}

/**
 * Generate card component HTML
 */
function generateCardHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  const { variant = 'default', title = '', icon = '' } = component.params;

  const styles = getCardStyles(variant as CardVariant, primaryColor);
  const styleAttr = Object.entries(styles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  const titleHtml = title ?
    `<div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: ${variant === 'primary' || variant === 'gradient' ? primaryColor : '#333'};">
      ${icon ? `${icon} ` : ''}${title}
    </div>` : '';

  return `<div style="${styleAttr}">${titleHtml}${component.content}</div>`;
}

/**
 * Generate info box HTML
 */
function generateInfoBoxHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  const type = component.type as InfoBoxType;
  const { title = '', icon = '' } = component.params;

  const styles = getInfoBoxStyles(type, primaryColor);
  const containerStyle = Object.entries(styles.container)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  const boxIcon = icon || styles.icon;

  const titleHtml = title ?
    `<div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: ${styles.color};">
      ${boxIcon} ${title}
    </div>` :
    `<div style="margin-bottom: 8px; font-weight: bold; color: ${styles.color};">${boxIcon}</div>`;

  return `<div style="${containerStyle}">${titleHtml}${component.content}</div>`;
}

/**
 * Generate highlight component HTML
 */
function generateHighlightHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  const type = component.type as HighlightType;
  const { title = '' } = component.params;

  switch (type) {
    case 'callout':
      return `<div style="border: 2px solid ${primaryColor}; background: ${addAlpha(primaryColor, 0.05)}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        ${title ? `<div style="font-size: 18px; font-weight: bold; color: ${primaryColor}; margin-bottom: 12px;">${title}</div>` : ''}
        ${component.content}
      </div>`;

    case 'numbered': {
      const items = component.content.split('\n').filter(line => line.trim());
      const listItems = items.map((item, index) => {
        return `<div style="margin: 12px 0;">
          <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background: ${primaryColor}; color: #fff; border-radius: 50%; margin-right: 12px; font-weight: bold; font-size: 14px;">${index + 1}</span>
          <span style="display: inline-block; vertical-align: top; width: calc(100% - 40px); margin-top: 4px;">${item.replace(/^[-*]\s*/, '')}</span>
        </div>`;
      }).join('');
      return `<div style="padding: 16px 0;">${listItems}</div>`;
    }

    case 'process': {
      const items = component.content.split('\n').filter(line => line.trim());
      const steps = items.map((item, index) => {
        const arrow = index < items.length - 1 ?
          `<div style="text-align: center; color: ${primaryColor}; font-size: 20px; margin: 4px 0;">↓</div>` : '';
        return `<div style="border: 1px solid ${primaryColor}; background: ${addAlpha(primaryColor, 0.05)}; border-radius: 8px; padding: 16px; margin: 8px 0; text-align: center;">
          <span style="display: inline-block; min-width: 24px; height: 24px; line-height: 24px; background: ${primaryColor}; color: #fff; border-radius: 4px; padding: 0 8px; margin-right: 8px; font-size: 14px; font-weight: bold;">${index + 1}</span>
          <span style="font-size: 15px;">${item.replace(/^[-*]\s*/, '')}</span>
        </div>${arrow}`;
      }).join('');
      return `<div style="padding: 8px 0;">${steps}</div>`;
    }

    case 'timeline': {
      const items = component.content.split('\n').filter(line => line.trim());
      const timelineItems = items.map((item, index) => {
        return `<div style="position: relative; margin: 16px 0; padding-left: 28px;">
          ${index < items.length - 1 ? `<div style="position: absolute; left: 5px; top: 12px; bottom: -16px; width: 2px; background: #e8e8e8;"></div>` : ''}
          <span style="display: inline-block; width: 12px; height: 12px; background: ${primaryColor}; border-radius: 50%; margin-right: 16px; margin-left: ${index === 0 ? '0' : '6px'}; vertical-align: top;"></span>
          <div style="display: inline-block; vertical-align: top; width: calc(100% - 28px);">${item.replace(/^[-*]\s*/, '')}</div>
        </div>`;
      }).join('');
      return `<div style="padding: 8px 0;">${timelineItems}</div>`;
    }

    case 'comparison': {
      const items = component.content.split('\n').filter(line => line.trim());
      const rows = items.map((item, index) => {
        const cols = item.split('|').map(col => col.trim()).filter(col => col);
        const isHeader = index === 0;
        const cellStyle = isHeader ?
          `background: ${primaryColor}; color: #fff; padding: 12px; font-weight: bold;` :
          `padding: 12px; border: 1px solid #e8e8e8;`;
        const cells = cols.map(col => `<td style="${cellStyle}">${col}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">${rows}</table>`;
    }

    default:
      return component.content;
  }
}

/**
 * Generate divider HTML
 */
function generateDividerHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  const { style = 'solid', text = '', color } = component.params;

  const dividerStyles = getDividerStyles(style as DividerStyle, primaryColor, color);
  const styleAttr = Object.entries(dividerStyles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  if (text) {
    return `<div style="display: flex; align-items: center; margin: 24px 0;">
      <div style="flex: 1; ${styleAttr}"></div>
      <span style="padding: 0 16px; color: #666; font-size: 14px;">${text}</span>
      <div style="flex: 1; ${styleAttr}"></div>
    </div>`;
  }

  return `<div style="${styleAttr}; margin: 24px 0;"></div>`;
}

/**
 * Generate spacer HTML
 */
function generateSpacerHtml(component: ParsedLayoutComponent): string {
  const { height = '20' } = component.params;
  return `<div style="height: ${height}px; overflow: hidden;"></div>`;
}

/**
 * Generate badge HTML
 */
function generateBadgeHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  const { text = '', variant = 'soft', color } = component.params;
  const badgeColor = color || primaryColor;

  const styles = getBadgeStyles(variant as any, badgeColor);
  const styleAttr = Object.entries(styles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  return `<span style="${styleAttr}">${text || component.content}</span>`;
}

/**
 * Generate button HTML
 */
function generateButtonHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  const { text = component.content, url = '', variant = 'primary' } = component.params;

  const styles = getButtonStyles(variant as any, primaryColor);
  const styleAttr = Object.entries(styles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  const href = url ? `href="${url}"` : '';
  const tag = url ? 'a' : 'div';

  return `<${tag} ${href} style="${styleAttr}">${text}</${tag}>`;
}

/**
 * Generate progress bar HTML
 */
function generateProgressHtml(component: ParsedLayoutComponent, primaryColor: string): string {
  const { percent = '50', height = '8', color } = component.params;
  const barColor = color || primaryColor;
  const barHeight = parseInt(height, 10);

  return `<div style="width: 100%; height: ${barHeight}px; background: #f0f0f0; border-radius: ${barHeight / 2}px; overflow: hidden; margin: 12px 0;">
    <div style="height: 100%; width: ${Math.min(100, Math.max(0, parseInt(percent, 10)))}%; background: ${barColor}; border-radius: ${barHeight / 2}px; transition: width 0.3s ease;"></div>
  </div>`;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
 * Get card styles
 */
function getCardStyles(variant: CardVariant, primaryColor: string): Record<string, string> {
  const baseStyle: Record<string, string> = {
    borderRadius: '12px',
    padding: '20px',
    margin: '16px 0',
    boxSizing: 'border-box',
  };

  const variantStyles: Record<CardVariant, Record<string, string>> = {
    default: {
      ...baseStyle,
      border: '1px solid #e8e8e8',
      backgroundColor: '#ffffff',
    },
    primary: {
      ...baseStyle,
      border: `2px solid ${primaryColor}`,
      backgroundColor: '#fafafa',
    },
    gradient: {
      ...baseStyle,
      border: 'none',
      background: `linear-gradient(135deg, ${addAlpha(primaryColor, 0.15)} 0%, ${addAlpha(primaryColor, 0.05)} 100%)`,
    },
    shadow: {
      ...baseStyle,
      border: '1px solid #e8e8e8',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    bordered: {
      ...baseStyle,
      border: '3px double #d4d4d4',
      backgroundColor: '#fafafa',
    },
    glass: {
      ...baseStyle,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
  };

  return variantStyles[variant];
}

/**
 * Get info box styles
 */
function getInfoBoxStyles(type: InfoBoxType, primaryColor: string): {
  container: Record<string, string>;
  color: string;
  icon: string;
} {
  const configs: Record<InfoBoxType, { color: string; bg: string; icon: string }> = {
    tip: { color: primaryColor, bg: addAlpha(primaryColor, 0.08), icon: '💡' },
    warning: { color: '#fa8c16', bg: '#fff7e6', icon: '⚠️' },
    success: { color: '#52c41a', bg: '#f6ffed', icon: '✓' },
    error: { color: '#ff4d4f', bg: '#fff1f0', icon: '✕' },
    note: { color: '#8c8c8c', bg: '#fafafa', icon: '📝' },
    quote: { color: '#722ed1', bg: '#f9f0ff', icon: '"' },
  };

  const { color, bg, icon } = configs[type];

  return {
    container: {
      borderLeft: `4px solid ${color}`,
      backgroundColor: bg,
      padding: '16px',
      margin: '16px 0',
      borderRadius: '4px',
    },
    color,
    icon,
  };
}

/**
 * Get divider styles
 */
function getDividerStyles(style: DividerStyle, primaryColor: string, customColor?: string): Record<string, string> {
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
 * Get badge styles
 */
function getBadgeStyles(variant: string, color: string): Record<string, string> {
  const baseStyle: Record<string, string> = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    margin: '4px',
  };

  switch (variant) {
    case 'filled':
      return { ...baseStyle, backgroundColor: color, color: '#fff' };
    case 'outlined':
      return { ...baseStyle, border: `1px solid ${color}`, color: color, backgroundColor: 'transparent' };
    case 'soft':
      return { ...baseStyle, backgroundColor: addAlpha(color, 0.1), color: color };
    default:
      return baseStyle;
  }
}

/**
 * Get button styles
 */
function getButtonStyles(variant: string, color: string): Record<string, string> {
  const baseStyle: Record<string, string> = {
    display: 'inline-block',
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    margin: '8px 4px',
  };

  switch (variant) {
    case 'primary':
      return { ...baseStyle, backgroundColor: color, color: '#fff' };
    case 'secondary':
      return { ...baseStyle, backgroundColor: '#f0f0f0', color: '#333' };
    case 'outline':
      return { ...baseStyle, border: `2px solid ${color}`, color: color, backgroundColor: 'transparent' };
    default:
      return baseStyle;
  }
}
