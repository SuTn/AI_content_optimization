'use client';

import { useState, useEffect, useCallback } from 'react';
import { AIConfig, DEFAULT_AI_CONFIG } from '@/types/ai';

const AI_CONFIG_KEY = 'mopai_ai_config';

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load config on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AI_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AIConfig;
        setConfig({ ...DEFAULT_AI_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
    setIsLoaded(true);
  }, []);

  // Update config
  const updateAIConfig = useCallback((newConfig: AIConfig) => {
    setConfig(newConfig);

    try {
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save AI config:', error);
    }
  }, []);

  return {
    aiConfig: config,
    updateAIConfig,
    isLoaded,
  };
}
