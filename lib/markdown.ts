import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
  return /:::(\w+)|---style=\w+---/.test(markdown);
}

/**
 * Smart parse markdown - currently uses basic parsing only
 */
export function smartParseMarkdown(markdown: string, primaryColor: string): string {
  // Use basic parsing to avoid content errors
  return parseMarkdown(markdown);
}

/**
 * Parse markdown with layout components - DISABLED for now
 * Using basic parsing to prevent content errors
 */
export function parseMarkdownWithLayout(markdown: string, primaryColor: string = '#1890ff'): string {
  // Currently disabled - use basic parsing
  return parseMarkdown(markdown);
}
