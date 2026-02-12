/**
 * Layout component types for WeChat article optimization
 */

/**
 * Card component variants
 */
export type CardVariant =
  | 'default'      // White background, gray border
  | 'primary'      // Brand color border
  | 'gradient'     // Background gradient
  | 'shadow'       // Shadow effect
  | 'bordered'     // Decorative border
  | 'glass';       // Glass effect

/**
 * Info box types
 */
export type InfoBoxType =
  | 'tip'          // Blue tip box
  | 'warning'      // Orange warning box
  | 'success'      // Green success box
  | 'error'        // Red error box
  | 'note'         // Gray note box
  | 'quote';       // Decorative quote box

/**
 * Highlight component types
 */
export type HighlightType =
  | 'callout'      // Callout box
  | 'numbered'     // Numbered list
  | 'timeline'     // Timeline
  | 'process'      // Process steps
  | 'comparison';  // Comparison table

/**
 * Divider styles
 */
export type DividerStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'gradient';

/**
 * Layout component types
 */
export type LayoutComponentType =
  | 'card'
  | 'infobox'
  | 'highlight'
  | 'divider'
  | 'spacer'
  | 'badge'
  | 'button'
  | 'progress';

/**
 * Card component configuration
 */
export interface CardConfig {
  variant: CardVariant;
  title?: string;
  icon?: string;
}

/**
 * Info box configuration
 */
export interface InfoBoxConfig {
  type: InfoBoxType;
  title?: string;
  icon?: string;
}

/**
 * Highlight component configuration
 */
export interface HighlightConfig {
  type: HighlightType;
  title?: string;
  items?: string[];
}

/**
 * Divider configuration
 */
export interface DividerConfig {
  style: DividerStyle;
  text?: string;
  color?: string;
}

/**
 * Spacer configuration
 */
export interface SpacerConfig {
  height: number;
}

/**
 * Badge configuration
 */
export interface BadgeConfig {
  text: string;
  color?: string;
  variant?: 'filled' | 'outlined' | 'soft';
}

/**
 * Button configuration
 */
export interface ButtonConfig {
  text: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Progress bar configuration
 */
export interface ProgressConfig {
  percent: number;
  color?: string;
  height?: number;
}

/**
 * Base layout component configuration
 */
export interface LayoutComponentConfig {
  type: LayoutComponentType;
  config: CardConfig | InfoBoxConfig | HighlightConfig | DividerConfig | SpacerConfig | BadgeConfig | ButtonConfig | ProgressConfig;
}

/**
 * Template-specific layout preferences
 */
export interface TemplateLayoutConfig {
  /** Preferred card variants for this template */
  preferredCardVariants: CardVariant[];
  /** Preferred info box types for this template */
  preferredInfoBoxTypes: InfoBoxType[];
  /** Preferred highlight types for this template */
  preferredHighlightTypes: HighlightType[];
  /** Preferred divider styles for this template */
  preferredDividerStyles: DividerStyle[];
  /** Default component configurations */
  defaultComponents: Partial<LayoutComponentConfig>[];
  /** Whether to use emoji decorations */
  useEmojiDecorations: boolean;
  /** Whether to use gradient effects */
  useGradients: boolean;
}

/**
 * Parsed layout component from markdown
 */
export interface ParsedLayoutComponent {
  type: string; // Use string to allow all component subtypes
  params: Record<string, string>;
  content: string;
  start: number;
  end: number;
}

/**
 * Layout parser options
 */
export interface LayoutParserOptions {
  /** Custom syntax prefix */
  prefix?: string;
  /** Custom syntax suffix */
  suffix?: string;
  /** Whether to parse inline components */
  parseInline?: boolean;
}

/**
 * Generated HTML with inline styles
 */
export interface StyledLayoutComponent {
  html: string;
  styles: Record<string, string>;
}

/**
 * Template ID type
 */
export type TemplateId = 'simple' | 'business' | 'lively' | 'academic' | 'magazine';
