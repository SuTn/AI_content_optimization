'use client';

import { useState, useCallback } from 'react';
import { AIConfig, TemplateId, OptimizedVersion } from '@/types/ai';
import { generateId } from '@/lib/utils';

interface OptimizationState {
  isOptimizing: boolean;
  isStreaming: boolean;
  optimizedContent: string;
  error: string | null;
  progress: {
    current: number;
    total: number;
  } | null;
}

interface UseAIOptimizeOptions {
  articleId: string;
  onSave?: () => void;
}

export function useAIOptimize({ articleId, onSave }: UseAIOptimizeOptions) {
  const [state, setState] = useState<OptimizationState>({
    isOptimizing: false,
    isStreaming: false,
    optimizedContent: '',
    error: null,
    progress: null,
  });

  const [history, setHistory] = useState<OptimizedVersion[]>([]);

  // Load history from localStorage
  const loadHistory = useCallback(() => {
    try {
      const key = `mopai_ai_history_${articleId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const versions = JSON.parse(data) as OptimizedVersion[];
        setHistory(versions);
      }
    } catch (error) {
      console.error('Failed to load optimization history:', error);
    }
  }, [articleId]);

  // Save version to history
  const saveToHistory = useCallback((
    originalContent: string,
    optimizedContent: string,
    templateId: TemplateId
  ) => {
    const version: OptimizedVersion = {
      id: generateId(),
      articleId,
      originalContent,
      optimizedContent,
      templateId,
      createdAt: Date.now(),
    };

    const newHistory = [version, ...history].slice(0, 10); // Keep max 10 versions
    setHistory(newHistory);

    try {
      const key = `mopai_ai_history_${articleId}`;
      localStorage.setItem(key, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save optimization history:', error);
    }
  }, [articleId, history]);

  // Restore from history
  const restoreFromHistory = useCallback((versionId: string) => {
    const version = history.find(v => v.id === versionId);
    if (version) {
      setState(prev => ({
        ...prev,
        optimizedContent: version.optimizedContent,
        error: null,
      }));
      return version.optimizedContent;
    }
    return null;
  }, [history]);

  // Start optimization
  const optimize = useCallback(async (
    content: string,
    templateId: TemplateId,
    config: AIConfig
  ) => {
    setState({
      isOptimizing: true,
      isStreaming: true,
      optimizedContent: '',
      error: null,
      progress: null,
    });

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          templateId,
          config,
          useChunking: true,
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      // Check if needs chunking
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        // JSON response means chunking is needed
        const data = await response.json();
        if (data.needsChunking) {
          setState(prev => ({
            ...prev,
            error: data.message,
            isOptimizing: false,
          }));
          return null;
        }
      }

      // Stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (!reader) {
        throw new Error('无法读取响应');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'content') {
              accumulatedContent += parsed.data;
              setState(prev => ({
                ...prev,
                optimizedContent: accumulatedContent,
              }));
            } else if (parsed.type === 'error') {
              throw new Error(parsed.data);
            } else if (parsed.type === 'done') {
              setState(prev => ({
                ...prev,
                isStreaming: false,
                isOptimizing: false,
              }));

              // Save to history
              saveToHistory(content, accumulatedContent, templateId);

              return accumulatedContent;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      return accumulatedContent;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '优化失败',
        isOptimizing: false,
        isStreaming: false,
      }));
      return null;
    }
  }, [saveToHistory]);

  // Apply optimization
  const applyOptimization = useCallback((content: string) => {
    onSave?.();
    return content;
  }, [onSave]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isOptimizing: false,
      isStreaming: false,
      optimizedContent: '',
      error: null,
      progress: null,
    });
  }, []);

  // Test connection
  const testConnection = useCallback(async (config: AIConfig) => {
    try {
      const response = await fetch('/api/optimize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '测试失败',
      };
    }
  }, []);

  return {
    ...state,
    history,
    optimize,
    applyOptimization,
    restoreFromHistory,
    reset,
    loadHistory,
    testConnection,
  };
}
