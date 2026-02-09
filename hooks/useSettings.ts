'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS } from '@/types';
import { getSettings, saveSettings } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
    setIsLoaded(true);
  }, []);

  // Update setting
  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  // Update all settings at once
  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  return {
    settings,
    isLoaded,
    updateSetting,
    updateSettings,
  };
}
