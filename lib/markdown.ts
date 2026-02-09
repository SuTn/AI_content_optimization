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
 * Parse markdown and sanitize
 */
export function parseMarkdown(markdown: string): string {
  const html = markdownToHtml(markdown);
  return sanitizeHtml(html);
}
