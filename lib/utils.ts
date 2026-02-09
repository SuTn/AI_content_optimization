type ClassValue = string | number | boolean | undefined | null | ClassValue[];

function toVal(mix: ClassValue): string {
  if (typeof mix === 'string' || typeof mix === 'number') {
    return String(mix);
  }
  if (!mix) return '';
  if (Array.isArray(mix)) {
    return mix.map(toVal).filter(Boolean).join(' ');
  }
  return '';
}

// Simple clsx replacement for tailwind merge
export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toVal).filter(Boolean).join(' ');
}

/**
 * Extract title from markdown content
 * Looks for first line starting with #
 */
export function extractTitle(content: string): string {
  const lines = content.trim().split('\n');
  const firstLine = lines[0]?.trim();

  if (firstLine?.startsWith('#')) {
    const title = firstLine.replace(/^#+\s*/, '').trim();
    return title.length > 0 ? title : '未命名文章';
  }

  return '未命名文章';
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Count characters in content
 */
export function countChars(content: string): number {
  return content.length;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate unique ID using timestamp
 */
export function generateId(): string {
  return String(Date.now());
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
