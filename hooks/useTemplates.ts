'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getAllTemplates,
  getTemplateById,
  saveCustomTemplate,
  deleteCustomTemplate,
  duplicateTemplate,
  getTemplateVersions,
  saveTemplateVersion,
  restoreTemplateVersion,
  exportTemplate,
  exportAllTemplates,
  importTemplate,
  getTemplateStorageInfo,
} from '@/lib/templateStorage';
import {
  CustomTemplateConfig,
  AnyTemplateConfig,
  TemplateVersion,
} from '@/types/ai';

export function useTemplates() {
  const [builtinTemplates, setBuiltinTemplates] = useState<AnyTemplateConfig[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });

  // Load all templates
  const loadTemplates = useCallback(() => {
    setIsLoading(true);
    try {
      const { builtin, custom } = getAllTemplates();
      setBuiltinTemplates(builtin);
      setCustomTemplates(custom);
      setStorageInfo(getTemplateStorageInfo());
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Get template by ID
  const getTemplate = useCallback((id: string): AnyTemplateConfig | undefined => {
    return getTemplateById(id);
  }, []);

  // Save or update a custom template
  const saveTemplate = useCallback((template: CustomTemplateConfig) => {
    saveCustomTemplate(template);
    loadTemplates();
  }, [loadTemplates]);

  // Delete a custom template
  const deleteTemplate = useCallback((id: string) => {
    const success = deleteCustomTemplate(id);
    if (success) {
      loadTemplates();
    }
    return success;
  }, [loadTemplates]);

  // Duplicate a template
  const duplicateTemplateById = useCallback((id: string, newName?: string) => {
    const newTemplate = duplicateTemplate(id, newName);
    if (newTemplate) {
      loadTemplates();
    }
    return newTemplate;
  }, [loadTemplates]);

  // Get version history
  const getVersions = useCallback((templateId: string): TemplateVersion[] => {
    return getTemplateVersions(templateId);
  }, []);

  // Save a version snapshot
  const saveVersion = useCallback((
    templateId: string,
    config: CustomTemplateConfig,
    changeDescription?: string
  ) => {
    saveTemplateVersion(templateId, config, changeDescription);
  }, []);

  // Restore from a version
  const restoreVersion = useCallback((templateId: string, versionId: string) => {
    const restored = restoreTemplateVersion(templateId, versionId);
    if (restored) {
      loadTemplates();
    }
    return restored;
  }, [loadTemplates]);

  // Export a single template
  const exportSingleTemplate = useCallback((templateId: string): string | null => {
    return exportTemplate(templateId);
  }, []);

  // Export all custom templates
  const exportAllCustomTemplates = useCallback((): string | null => {
    return exportAllTemplates();
  }, []);

  // Import templates
  const importTemplates = useCallback((jsonString: string) => {
    const result = importTemplate(jsonString);
    if (result.success) {
      loadTemplates();
    }
    return result;
  }, [loadTemplates]);

  // Download JSON as file
  const downloadJsonFile = useCallback((jsonString: string, filename: string) => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    builtinTemplates,
    customTemplates,
    allTemplates: [...builtinTemplates, ...customTemplates],
    isLoading,
    storageInfo,
    loadTemplates,
    getTemplate,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate: duplicateTemplateById,
    getVersions,
    saveVersion,
    restoreVersion,
    exportSingleTemplate,
    exportAllCustomTemplates,
    importTemplates,
    downloadJsonFile,
  };
}
