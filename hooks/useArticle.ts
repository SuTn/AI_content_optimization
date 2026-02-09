'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article } from '@/types';
import {
  getCurrentId,
  setCurrentId,
  getArticleById,
  saveArticle,
  createArticle,
} from '@/lib/storage';
import { extractTitle, generateId } from '@/lib/utils';
import { debounce } from '@/lib/utils';

export function useArticle() {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current article on mount
  useEffect(() => {
    const currentId = getCurrentId();
    if (currentId) {
      const loaded = getArticleById(currentId);
      if (loaded) {
        setArticle(loaded);
      } else {
        // Create new article if current ID not found
        const newArticle = createArticle();
        setArticle(newArticle);
        setCurrentId(newArticle.id);
        saveArticle(newArticle);
      }
    } else {
      // Create first article
      const newArticle = createArticle();
      setArticle(newArticle);
      setCurrentId(newArticle.id);
      saveArticle(newArticle);
    }
    setIsLoading(false);
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((articleToSave: Article) => {
      saveArticle(articleToSave);
    }, 1000),
    []
  );

  // Update article content
  const updateContent = useCallback((content: string) => {
    setArticle((prev) => {
      if (!prev) return null;

      const title = extractTitle(content);
      const updated: Article = {
        ...prev,
        title,
        content,
        updatedAt: Date.now(),
      };

      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  // Load article by ID
  const loadArticle = useCallback((id: string) => {
    const loaded = getArticleById(id);
    if (loaded) {
      setArticle(loaded);
      setCurrentId(id);
    }
  }, []);

  // Create new article
  const newArticle = useCallback(() => {
    const newArt = createArticle();
    setArticle(newArt);
    setCurrentId(newArt.id);
    saveArticle(newArt);
  }, []);

  return {
    article,
    isLoading,
    updateContent,
    loadArticle,
    newArticle,
  };
}
