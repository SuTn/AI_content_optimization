import { Article, Settings, StorageData, DEFAULT_SETTINGS, MAX_ARTICLES, STORAGE_KEY } from '@/types';

// Template storage keys
export const STORAGE_KEY_TEMPLATES = 'mopai_templates';
export const STORAGE_KEY_TEMPLATE_VERSIONS_PREFIX = 'mopai_template_versions_';

/**
 * Get all data from localStorage
 */
export function getStorageData(): StorageData {
  if (typeof window === 'undefined') {
    return {
      currentId: null,
      articles: [],
      settings: DEFAULT_SETTINGS,
    };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        currentId: null,
        articles: [],
        settings: DEFAULT_SETTINGS,
      };
    }

    const parsed = JSON.parse(data) as StorageData;
    return {
      currentId: parsed.currentId || null,
      articles: parsed.articles || [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch (error) {
    console.error('Failed to parse storage data:', error);
    return {
      currentId: null,
      articles: [],
      settings: DEFAULT_SETTINGS,
    };
  }
}

/**
 * Save all data to localStorage
 */
export function setStorageData(data: StorageData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save storage data:', error);
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('存储空间已满，请删除一些旧文章');
    }
  }
}

/**
 * Get current article ID
 */
export function getCurrentId(): string | null {
  const data = getStorageData();
  return data.currentId;
}

/**
 * Set current article ID
 */
export function setCurrentId(id: string | null): void {
  const data = getStorageData();
  data.currentId = id;
  setStorageData(data);
}

/**
 * Get all articles
 */
export function getArticles(): Article[] {
  const data = getStorageData();
  return data.articles;
}

/**
 * Get article by ID
 */
export function getArticleById(id: string): Article | undefined {
  const articles = getArticles();
  return articles.find((a) => a.id === id);
}

/**
 * Save or update article
 */
export function saveArticle(article: Article): void {
  const data = getStorageData();
  const index = data.articles.findIndex((a) => a.id === article.id);

  if (index >= 0) {
    data.articles[index] = article;
  } else {
    data.articles.unshift(article);
  }

  // Limit to max articles
  if (data.articles.length > MAX_ARTICLES) {
    // Sort by updatedAt and remove oldest
    data.articles.sort((a, b) => b.updatedAt - a.updatedAt);
    data.articles = data.articles.slice(0, MAX_ARTICLES);
  }

  setStorageData(data);
}

/**
 * Delete article by ID
 */
export function deleteArticle(id: string): void {
  const data = getStorageData();
  data.articles = data.articles.filter((a) => a.id !== id);

  // If deleted article was current, clear current ID
  if (data.currentId === id) {
    data.currentId = data.articles.length > 0 ? data.articles[0].id : null;
  }

  setStorageData(data);
}

/**
 * Get settings
 */
export function getSettings(): Settings {
  const data = getStorageData();
  return data.settings;
}

/**
 * Save settings
 */
export function saveSettings(settings: Settings): void {
  const data = getStorageData();
  data.settings = settings;
  setStorageData(data);
}

/**
 * Create new article
 */
export function createArticle(content: string = '# 新文章\n\n开始写作...'): Article {
  return {
    id: String(Date.now()),
    title: '新文章',
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
