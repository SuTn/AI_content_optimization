import { Settings } from '@/types';

/**
 * Generate inline style string for WeChat HTML
 */
export function generateWechatHtml(html: string, settings: Settings): string {
  const { fontSize, lineHeight, primaryColor } = settings;

  // Create a temporary DOM element to parse HTML
  if (typeof document === 'undefined') {
    return html;
  }

  const container = document.createElement('div');
  container.innerHTML = html;

  // Apply styles to each element
  applyStyles(container, fontSize, lineHeight, primaryColor);

  return container.innerHTML;
}

/**
 * Check if element is a layout component (has data-wechat-layout marker)
 */
function isLayoutComponent(el: Element): boolean {
  // Only check div and table containers for layout component marker
  const tag = el.tagName.toLowerCase();
  if (tag !== 'div' && tag !== 'table') return false;
  return el.getAttribute('data-wechat-layout') === 'true';
}

/**
 * Apply inline styles to elements
 * Only applies to elements WITHOUT existing styles to avoid overriding layout components
 */
function applyStyles(container: HTMLElement, fontSize: number, lineHeight: number, primaryColor: string): void {
  // Process each element type
  const elements = container.querySelectorAll('*');

  elements.forEach((el) => {
    const existingStyle = el.getAttribute('style') || '';
    const tag = el.tagName.toLowerCase();

    // CRITICAL: Skip elements with existing styles (including layout components)
    // This prevents overriding carefully crafted layout component styles
    if (existingStyle) {
      return; // Completely skip - do nothing
    }

    // Only apply styles to elements without any existing styles
    // Cast to HTMLElement since we're working with DOM elements
    applyElementStyles(el as HTMLElement, tag, fontSize, lineHeight, primaryColor);
  });
}

/**
 * Apply element-specific styles for elements without existing styles
 */
function applyElementStyles(el: HTMLElement, tag: string, fontSize: number, lineHeight: number, primaryColor: string): void {
  // Base font settings
  const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  switch (tag) {
    case 'h1':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize + 8}px; font-weight: bold; margin: 1.5em 0 0.5em; line-height: 1.3; color: #333;`);
      break;
    case 'h2':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize + 4}px; font-weight: bold; margin: 1.3em 0 0.5em; line-height: 1.3; border-bottom: 1px solid #eee; padding-bottom: 0.3em; color: #333;`);
      break;
    case 'h3':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize + 2}px; font-weight: bold; margin: 1.2em 0 0.5em; line-height: 1.3; color: #333;`);
      break;
    case 'h4':
    case 'h5':
    case 'h6':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize + 1}px; font-weight: bold; margin: 1em 0 0.5em; line-height: 1.3; color: #333;`);
      break;
    case 'p':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1em 0; color: #333;`);
      break;
    case 'span':
      // Spans should inherit parent styles, only set if needed
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #333;`);
      break;
    case 'div':
      // Divs without styles get minimal base styles
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 0.5em 0; color: #333;`);
      break;
    case 'a':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; color: ${primaryColor}; text-decoration: none; word-break: break-all;`);
      break;
    case 'blockquote':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; border-left: 4px solid ${primaryColor}; margin: 1em 0; padding: 0.5em 1em; background: #f9f9f9; color: #666;`);
      break;
    case 'img':
      el.setAttribute('style', `max-width: 100%; height: auto; display: block; margin: 1em auto;`);
      break;
    case 'code':
      // Check if it's inside pre (code block) or inline code
      if (el.parentElement?.tagName.toLowerCase() === 'pre') {
        el.setAttribute('style', `background: #f8f8f8; padding: 0; font-family: monospace; font-size: 14px; line-height: 1.5; color: #333;`);
      } else {
        el.setAttribute('style', `background: #f3f3f3; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 90%; color: #333;`);
      }
      break;
    case 'pre':
      el.setAttribute('style', `background: #f8f8f8; padding: 1em; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.5; margin: 1em 0; color: #333;`);
      break;
    case 'ul':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1em 0; padding-left: 2em; list-style-type: disc; color: #333;`);
      break;
    case 'ol':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1em 0; padding-left: 2em; list-style-type: decimal; color: #333;`);
      break;
    case 'li':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 0.5em 0; color: #333;`);
      break;
    case 'table':
      // Tables may be layout components, but if they have no style, apply basic table styles
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; border-collapse: collapse; width: 100%; margin: 1em 0; color: #333;`);
      break;
    case 'th':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f9f9f9; color: #333;`);
      break;
    case 'td':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; border: 1px solid #ddd; padding: 8px; color: #333;`);
      break;
    case 'strong':
    case 'b':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; font-weight: bold; color: #333;`);
      break;
    case 'em':
    case 'i':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; font-style: italic; color: #333;`);
      break;
    case 'u':
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; text-decoration: underline; color: #333;`);
      break;
    case 'hr':
      el.setAttribute('style', `border: none; border-top: 1px solid #eee; margin: 2em 0;`);
      break;
    case 'section':
      // Section elements are used for layout components
      // Only apply if it's not a layout component (no data-wechat-layout marker)
      if (!isLayoutComponent(el)) {
        el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1.5em 0; color: #333;`);
      }
      break;
    default:
      // Apply minimal base styles to any other element not explicitly handled
      el.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #333;`);
      break;
  }
}

/**
 * Generate complete HTML document for export
 */
export function generateExportHtml(html: string, settings: Settings): string {
  const styledHtml = generateWechatHtml(html, settings);

  return styledHtml;
}
