'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article } from '@/types';
import { getArticles, deleteArticle as deleteArticleFromStorage } from '@/lib/storage';
import { formatRelativeTime } from '@/lib/utils';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Load articles list
  const refreshArticles = useCallback(() => {
    const loaded = getArticles();
    setArticles(loaded);
  }, []);

  useEffect(() => {
    refreshArticles();
  }, [refreshArticles]);

  // Set current article ID
  const setCurrentArticleId = useCallback((id: string | null) => {
    setCurrentId(id);
  }, []);

  // Delete article
  const deleteArticle = useCallback((id: string) => {
    deleteArticleFromStorage(id);
    refreshArticles();
  }, [refreshArticles]);

  // Get articles with formatted time
  const articlesWithTime = articles.map((article) => ({
    ...article,
    relativeTime: formatRelativeTime(article.updatedAt),
  }));

  return {
    articles: articlesWithTime,
    currentId,
    setCurrentArticleId,
    deleteArticle,
    refreshArticles,
  };
}
