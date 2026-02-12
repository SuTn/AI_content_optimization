/**
 * Layout component library for WeChat articles
 * All styles are inline for WeChat compatibility
 */

import type {
  CardVariant,
  CardConfig,
  InfoBoxType,
  InfoBoxConfig,
  HighlightType,
  HighlightConfig,
  DividerStyle,
  DividerConfig,
  SpacerConfig,
  BadgeConfig,
  ButtonConfig,
  ProgressConfig,
  StyledLayoutComponent,
} from '@/types/layout';

// Import marked directly to avoid circular dependency
import { marked } from 'marked';

/**
 * Configure marked
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Parse markdown to HTML (local version to avoid circular dependency)
 */
function markdownToHtmlLocal(markdown: string): string {
  return marked(markdown) as string;
}

/**
 * Convert style object to inline style string
 */
function styleToString(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Adjust color opacity (WeChat doesn't support rgba)
 * Use lightenColor for light backgrounds instead
 */
function lightenColor(color: string, amount: number = 0.9): string {
  // For WeChat compatibility, return a very light hex color
  // This blends with white for lighter version
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
 * WeChat doesn't support rgba, use lightenColor instead
 */
function addAlpha(color: string, opacity: number): string {
  return lightenColor(color, 1 - opacity);
}

/**
 * Generate gradient CSS (WeChat doesn't support linear-gradient)
 * Returns a solid light color instead
 */
function generateGradient(color: string, direction: number = 135): string {
  // WeChat doesn't support linear-gradient, return solid light color
  return lightenColor(color, 0.95);
}

// ============================================================================
// Card Components
// ============================================================================

/**
 * Generate card component HTML with inline styles
 */
export function generateCard(content: string, config: CardConfig, primaryColor: string): string {
  const styles = getCardStyles(config.variant, primaryColor);
  const styleAttr = styleToString(styles);

  const titleHtml = config.title ?
    `<div style="${styleToString(getCardTitleStyles(config.variant, primaryColor))}">${config.icon ? `${config.icon} ` : ''}${config.title}</div>` : '';

  // Render content markdown to HTML
  const renderedContent = markdownToHtmlLocal(content);

  return `<div data-wechat-layout="true" style="${styleAttr}">${titleHtml}${renderedContent}</div>`;
}

/**
 * Get card styles based on variant
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
      // WeChat doesn't support linear-gradient, use solid light color
      backgroundColor: generateGradient(primaryColor),
    },
    shadow: {
      ...baseStyle,
      // WeChat doesn't support box-shadow, use stronger border instead
      border: '2px solid #e8e8e8',
      backgroundColor: '#ffffff',
    },
    bordered: {
      ...baseStyle,
      border: '3px double #d4d4d4',
      backgroundColor: '#fafafa',
    },
    glass: {
      ...baseStyle,
      // WeChat doesn't support rgba, use solid colors
      border: '1px solid #d4d4d4',
      backgroundColor: '#ffffff',
    },
  };

  return variantStyles[variant];
}

/**
 * Get card title styles
 */
function getCardTitleStyles(variant: CardVariant, primaryColor: string): Record<string, string> {
  const baseStyle: Record<string, string> = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
  };

  const variantStyles: Record<CardVariant, Record<string, string>> = {
    default: {
      ...baseStyle,
      color: '#333',
    },
    primary: {
      ...baseStyle,
      color: primaryColor,
    },
    gradient: {
      ...baseStyle,
      color: primaryColor,
    },
    shadow: {
      ...baseStyle,
      color: '#333',
    },
    bordered: {
      ...baseStyle,
      color: '#666',
    },
    glass: {
      ...baseStyle,
      color: '#333',
    },
  };

  return variantStyles[variant];
}

// ============================================================================
// Info Box Components
// ============================================================================

/**
 * Generate info box component HTML with inline styles
 */
export function generateInfoBox(content: string, config: InfoBoxConfig, primaryColor: string): string {
  const styles = getInfoBoxStyles(config.type, primaryColor);
  const containerStyle = styleToString(styles.container);
  const icon = config.icon || styles.icon;

  const titleHtml = config.title ?
    `<div style="${styleToString({
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: styles.color,
    })}">${icon} ${config.title}</div>` : '';

  const contentPrefix = !config.title ? `<div style="margin-bottom: 8px; font-weight: bold; color: ${styles.color};">${icon}</div>` : '';

  // Render content markdown to HTML
  const renderedContent = markdownToHtmlLocal(content);

  return `<div data-wechat-layout="true" style="${containerStyle}">${titleHtml}${contentPrefix}${renderedContent}</div>`;
}

/**
 * Get info box styles based on type
 */
function getInfoBoxStyles(type: InfoBoxType, primaryColor: string): {
  container: Record<string, string>;
  color: string;
  icon: string;
} {
  const configs: Record<InfoBoxType, { color: string; bg: string; icon: string }> = {
    tip: { color: primaryColor, bg: lightenColor(primaryColor, 0.92), icon: '💡' },
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

// ============================================================================
// Highlight Components
// ============================================================================

/**
 * Generate highlight component HTML with inline styles
 */
export function generateHighlight(content: string, config: HighlightConfig, primaryColor: string): string {
  switch (config.type) {
    case 'callout':
      return generateCallout(content, config, primaryColor);
    case 'numbered':
      return generateNumberedList(content, config, primaryColor);
    case 'timeline':
      return generateTimeline(content, config, primaryColor);
    case 'process':
      return generateProcess(content, config, primaryColor);
    case 'comparison':
      return generateComparison(content, config, primaryColor);
    default:
      return content;
  }
}

/**
 * Generate callout box
 */
function generateCallout(content: string, config: HighlightConfig, primaryColor: string): string {
  const styles = {
    border: `2px solid ${primaryColor}`,
    // WeChat doesn't support rgba, use lightenColor
    backgroundColor: lightenColor(primaryColor, 0.95),
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  };

  const titleHtml = config.title ?
    `<div style="font-size: 18px; font-weight: bold; color: ${primaryColor}; margin-bottom: 12px;">
      ${config.title}
    </div>` : '';

  // Render content markdown to HTML
  const renderedContent = markdownToHtmlLocal(content);

  return `<div data-wechat-layout="true" style="${styleToString(styles)}">${titleHtml}${renderedContent}</div>`;
}

/**
 * Generate numbered list
 */
function generateNumberedList(content: string, config: HighlightConfig, primaryColor: string): string {
  const items = content.split('\n').filter(line => line.trim());

  const listItems = items.map((item, index) => {
    const cleanItem = item.replace(/^[-*]\s*/, '');
    // Render each list item's markdown
    const renderedItem = markdownToHtmlLocal(cleanItem);

    const numStyles = {
      display: 'inline-block',
      width: '28px',
      height: '28px',
      lineHeight: '28px',
      textAlign: 'center',
      backgroundColor: primaryColor,
      color: '#fff',
      borderRadius: '50%',
      fontWeight: 'bold',
      fontSize: '14px',
    };

    return `<tr>
      <td style="padding: 4px 8px 4px 0; vertical-align: top;">
        <span style="${styleToString(numStyles)}">${index + 1}</span>
      </td>
      <td style="padding: 4px 0;">${renderedItem}</td>
    </tr>`;
  }).join('');

  const tableStyle = 'width: 100%; margin: 12px 0; border-collapse: collapse;';

  return `<table data-wechat-layout="true" style="${tableStyle}">${listItems}</table>`;
}

/**
 * Generate timeline
 */
function generateTimeline(content: string, config: HighlightConfig, primaryColor: string): string {
  const items = content.split('\n').filter(line => line.trim());

  const timelineItems = items.map((item, index) => {
    const cleanItem = item.replace(/^[-*]\s*/, '');
    // Render each timeline item's markdown
    const renderedItem = markdownToHtmlLocal(cleanItem);

    const dotStyles = {
      display: 'inline-block',
      width: '12px',
      height: '12px',
      backgroundColor: primaryColor,
      borderRadius: '50%',
    };

    return `<table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
      <tr>
        <td style="width: 32px; padding: 0; vertical-align: top; text-align: center;">
          <span style="${styleToString(dotStyles)}"></span>
        </td>
        <td style="padding: 0 0 0 8px; vertical-align: top;">
          <div style="border-left: 2px solid #e8e8e8; padding-left: 12px; margin-left: -4px;">${renderedItem}</div>
        </td>
      </tr>
    </table>`;
  }).join('');

  return `<div data-wechat-layout="true" style="padding: 8px 0;">${timelineItems}</div>`;
}

/**
 * Generate process steps
 */
function generateProcess(content: string, config: HighlightConfig, primaryColor: string): string {
  const items = content.split('\n').filter(line => line.trim());

  const steps = items.map((item, index) => {
    const stepBoxStyles = {
      border: `1px solid ${primaryColor}`,
      // WeChat doesn't support rgba, use lightenColor
      backgroundColor: lightenColor(primaryColor, 0.95),
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      textAlign: 'center',
    };

    const stepNumStyles = {
      display: 'inline-block',
      minWidth: '24px',
      height: '24px',
      lineHeight: '24px',
      backgroundColor: primaryColor,
      color: '#fff',
      borderRadius: '4px',
      padding: '0 8px',
      marginRight: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
    };

    const arrowHtml = index < items.length - 1 ?
      `<div style="text-align: center; color: ${primaryColor}; font-size: 20px; margin: 4px 0;">↓</div>` : '';

    const cleanItem = item.replace(/^[-*]\s*/, '');
    // Render each step's markdown
    const renderedItem = markdownToHtmlLocal(cleanItem);

    return `<div style="${styleToString(stepBoxStyles)}">
      <span style="${styleToString(stepNumStyles)}">${index + 1}</span>
      <span style="font-size: 15px;">${renderedItem}</span>
    </div>${arrowHtml}`;
  }).join('');

  return `<div data-wechat-layout="true" style="padding: 8px 0;">${steps}</div>`;
}

/**
 * Generate comparison table
 */
function generateComparison(content: string, config: HighlightConfig, primaryColor: string): string {
  const items = content.split('\n').filter(line => line.trim());

  const rows = items.map((item, index) => {
    const cols = item.split('|').map(col => col.trim()).filter(col => col);

    const isHeader = index === 0;
    const cellStyle = isHeader ?
      `background: ${primaryColor}; color: #fff; padding: 12px; font-weight: bold;` :
      `padding: 12px; border: 1px solid #e8e8e8;`;

    // Render each cell's markdown
    const cells = cols.map(col => {
      const renderedCell = markdownToHtmlLocal(col);
      return `<td style="${cellStyle}">${renderedCell}</td>`;
    }).join('');

    return `<tr>${cells}</tr>`;
  }).join('');

  const tableStyle = 'width: 100%; border-collapse: collapse; margin: 16px 0;';

  return `<table data-wechat-layout="true" style="${tableStyle}">${rows}</table>`;
}

// ============================================================================
// Divider Components
// ============================================================================

/**
 * Generate divider HTML with inline styles
 */
export function generateDivider(config: DividerConfig, primaryColor: string): string {
  const styles = getDividerStyles(config.style, primaryColor, config.color);

  if (config.text) {
    return `<table data-wechat-layout="true" style="width: 100%; margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="${styleToString(styles)}"></td>
        <td style="padding: 0 16px; color: #666; font-size: 14px; white-space: nowrap;">${config.text}</td>
        <td style="${styleToString(styles)}"></td>
      </tr>
    </table>`;
  }

  return `<div data-wechat-layout="true" style="${styleToString({ ...styles, margin: '24px 0' })}"></div>`;
}

/**
 * Get divider styles based on style type
 */
function getDividerStyles(style: DividerStyle, primaryColor: string, customColor?: string): Record<string, string> {
  const color = customColor || primaryColor;
  const baseStyle: Record<string, string> = {
    height: '1px',
    border: 'none',
  };

  switch (style) {
    case 'solid':
      return {
        ...baseStyle,
        backgroundColor: '#e8e8e8',
      };
    case 'dashed':
      return {
        ...baseStyle,
        borderTop: `1px dashed ${color}`,
        backgroundColor: 'transparent',
      };
    case 'dotted':
      return {
        ...baseStyle,
        borderTop: `1px dotted ${color}`,
        backgroundColor: 'transparent',
      };
    case 'gradient':
      // WeChat doesn't support linear-gradient, use solid color
      return {
        ...baseStyle,
        backgroundColor: color,
        height: '2px',
      };
    default:
      return baseStyle;
  }
}

// ============================================================================
// Spacer Components
// ============================================================================

/**
 * Generate spacer HTML
 */
export function generateSpacer(config: SpacerConfig): string {
  return `<div data-wechat-layout="true" style="height: ${config.height}px;"></div>`;
}

// ============================================================================
// Badge Components
// ============================================================================

/**
 * Generate badge HTML
 */
export function generateBadge(config: BadgeConfig, primaryColor: string): string {
  const styles = getBadgeStyles(config.variant || 'soft', config.color || primaryColor);

  return `<span data-wechat-layout="true" style="${styleToString(styles)}">${config.text}</span>`;
}

/**
 * Get badge styles
 */
function getBadgeStyles(variant: 'filled' | 'outlined' | 'soft', color: string): Record<string, string> {
  const baseStyle: Record<string, string> = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    margin: '4px',
  };

  switch (variant) {
    case 'filled':
      return {
        ...baseStyle,
        backgroundColor: color,
        color: '#fff',
      };
    case 'outlined':
      return {
        ...baseStyle,
        border: `1px solid ${color}`,
        color: color,
        backgroundColor: 'transparent',
      };
    case 'soft':
      // WeChat doesn't support rgba, use lightenColor
      return {
        ...baseStyle,
        backgroundColor: lightenColor(color, 0.9),
        color: color,
      };
    default:
      return baseStyle;
  }
}

// ============================================================================
// Button Components
// ============================================================================

/**
 * Generate button HTML
 */
export function generateButton(config: ButtonConfig, primaryColor: string): string {
  const styles = getButtonStyles(config.variant || 'primary', primaryColor);
  const href = config.url ? `href="${config.url}"` : '';
  const tag = config.url ? 'a' : 'div';

  return `<${tag} data-wechat-layout="true" ${href} style="${styleToString(styles)}">${config.text}</${tag}>`;
}

/**
 * Get button styles
 */
function getButtonStyles(variant: 'primary' | 'secondary' | 'outline', color: string): Record<string, string> {
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
      return {
        ...baseStyle,
        backgroundColor: color,
        color: '#fff',
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: '#f0f0f0',
        color: '#333',
      };
    case 'outline':
      return {
        ...baseStyle,
        border: `2px solid ${color}`,
        color: color,
        backgroundColor: 'transparent',
      };
    default:
      return baseStyle;
  }
}

// ============================================================================
// Progress Components
// ============================================================================

/**
 * Generate progress bar HTML
 */
export function generateProgress(config: ProgressConfig, primaryColor: string): string {
  const height = config.height || 8;
  const color = config.color || primaryColor;

  const containerStyles = {
    width: '100%',
    height: `${height}px`,
    backgroundColor: '#f0f0f0',
    borderRadius: `${height / 2}px`,
    // WeChat doesn't support overflow:hidden
    margin: '12px 0',
  };

  const barStyles = {
    height: '100%',
    width: `${Math.min(100, Math.max(0, config.percent))}%`,
    backgroundColor: color,
    borderRadius: `${height / 2}px`,
    // WeChat doesn't support transition, removed
  };

  return `<div data-wechat-layout="true" style="${styleToString(containerStyles)}">
    <div style="${styleToString(barStyles)}"></div>
  </div>`;
}
