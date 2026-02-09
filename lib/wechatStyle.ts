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
 * Apply inline styles to elements
 */
function applyStyles(container: HTMLElement, fontSize: number, lineHeight: number, primaryColor: string): void {
  // Base styles for the container
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  container.style.fontSize = `${fontSize}px`;
  container.style.lineHeight = String(lineHeight);
  container.style.color = '#333';

  // Process each element type
  const elements = container.querySelectorAll('*');

  elements.forEach((el) => {
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1':
        el.setAttribute('style', `font-size: ${fontSize + 8}px; font-weight: bold; margin: 1.5em 0 0.5em; color: #333;`);
        break;
      case 'h2':
        el.setAttribute('style', `font-size: ${fontSize + 4}px; font-weight: bold; margin: 1.3em 0 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; color: #333;`);
        break;
      case 'h3':
        el.setAttribute('style', `font-size: ${fontSize + 2}px; font-weight: bold; margin: 1.2em 0 0.5em; color: #333;`);
        break;
      case 'h4':
      case 'h5':
      case 'h6':
        el.setAttribute('style', `font-size: ${fontSize + 1}px; font-weight: bold; margin: 1em 0 0.5em; color: #333;`);
        break;
      case 'p':
        el.setAttribute('style', `margin: 1em 0;`);
        break;
      case 'a':
        el.setAttribute('style', `color: ${primaryColor}; text-decoration: none; word-break: break-all;`);
        break;
      case 'blockquote':
        el.setAttribute('style', `border-left: 4px solid ${primaryColor}; margin: 1em 0; padding: 0.5em 1em; background: #f9f9f9; color: #666;`);
        break;
      case 'img':
        el.setAttribute('style', `max-width: 100%; height: auto; display: block; margin: 1em auto;`);
        break;
      case 'code':
        // Check if it's inside pre (code block) or inline code
        if (el.parentElement?.tagName.toLowerCase() === 'pre') {
          el.setAttribute('style', `background: #f8f8f8; padding: 0; font-family: monospace; font-size: 14px; line-height: 1.5;`);
        } else {
          el.setAttribute('style', `background: #f3f3f3; padding: 0.2em 0.4em; border-radius: 3px; font-size: 90%; font-family: monospace;`);
        }
        break;
      case 'pre':
        el.setAttribute('style', `background: #f8f8f8; padding: 1em; overflow-x: auto; font-size: 14px; line-height: 1.5; margin: 1em 0;`);
        break;
      case 'ul':
      case 'ol':
        el.setAttribute('style', `margin: 1em 0; padding-left: 2em;`);
        break;
      case 'li':
        el.setAttribute('style', `margin: 0.5em 0;`);
        break;
      case 'table':
        el.setAttribute('style', `border-collapse: collapse; width: 100%; margin: 1em 0;`);
        break;
      case 'th':
        el.setAttribute('style', `border: 1px solid #ddd; padding: 8px; font-weight: bold; background: #f9f9f9;`);
        break;
      case 'td':
        el.setAttribute('style', `border: 1px solid #ddd; padding: 8px;`);
        break;
      case 'strong':
      case 'b':
        el.setAttribute('style', `font-weight: bold;`);
        break;
      case 'em':
      case 'i':
        el.setAttribute('style', `font-style: italic;`);
        break;
      case 'u':
        el.setAttribute('style', `text-decoration: underline;`);
        break;
      case 'hr':
        el.setAttribute('style', `border: none; border-top: 1px solid #eee; margin: 2em 0;`);
        break;
    }
  });
}

/**
 * Generate complete HTML document for export
 */
export function generateExportHtml(html: string, settings: Settings): string {
  const styledHtml = generateWechatHtml(html, settings);

  return styledHtml;
}
