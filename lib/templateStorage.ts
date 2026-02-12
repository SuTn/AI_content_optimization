/**
 * Template Storage Module
 * Manages storage and operations for custom AI templates
 */

import {
  TEMPLATES,
  CustomTemplateConfig,
  TemplateConfig,
  AnyTemplateConfig,
  TemplateVersion,
  TemplateSource,
} from '@/types/ai';
import { STORAGE_KEY_TEMPLATES, STORAGE_KEY_TEMPLATE_VERSIONS_PREFIX } from '@/lib/storage';

/**
 * Template storage structure
 */
interface TemplateStorageData {
  custom: CustomTemplateConfig[];
  builtin: string[]; // IDs of builtin templates that user has interacted with
}

/**
 * Get all templates (builtin + custom)
 */
export function getAllTemplates(): { builtin: TemplateConfig[]; custom: CustomTemplateConfig[] } {
  if (typeof window === 'undefined') {
    return {
      builtin: Object.values(TEMPLATES),
      custom: [],
    };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!data) {
      return {
        builtin: Object.values(TEMPLATES),
        custom: [],
      };
    }

    const parsed = JSON.parse(data) as TemplateStorageData;
    return {
      builtin: Object.values(TEMPLATES),
      custom: parsed.custom || [],
    };
  } catch (error) {
    console.error('Failed to load templates:', error);
    return {
      builtin: Object.values(TEMPLATES),
      custom: [],
    };
  }
}

/**
 * Get template by ID (builtin or custom)
 */
export function getTemplateById(id: string): AnyTemplateConfig | undefined {
  // Check if it's a builtin template
  if (TEMPLATES[id as keyof typeof TEMPLATES]) {
    return TEMPLATES[id as keyof typeof TEMPLATES];
  }

  // Check custom templates
  const { custom } = getAllTemplates();
  return custom.find((t) => t.id === id);
}

/**
 * Save a custom template
 */
export function saveCustomTemplate(template: CustomTemplateConfig): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    const storageData: TemplateStorageData = data
      ? JSON.parse(data)
      : { custom: [], builtin: [] };

    const index = storageData.custom.findIndex((t) => t.id === template.id);

    // Update existing or add new
    if (index >= 0) {
      storageData.custom[index] = {
        ...template,
        updatedAt: Date.now(),
        version: template.version + 1,
      };
    } else {
      storageData.custom.push({
        ...template,
        updatedAt: Date.now(),
        version: 1,
      });
    }

    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save template:', error);
    throw error;
  }
}

/**
 * Delete a custom template
 */
export function deleteCustomTemplate(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const data = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!data) return false;

    const storageData = JSON.parse(data) as TemplateStorageData;
    const initialLength = storageData.custom.length;
    storageData.custom = storageData.custom.filter((t) => t.id !== id);

    if (storageData.custom.length < initialLength) {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(storageData));

      // Also delete version history
      deleteTemplateVersions(id);

      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to delete template:', error);
    return false;
  }
}

/**
 * Duplicate a template (builtin -> custom or custom -> custom)
 */
export function duplicateTemplate(id: string, newName?: string): CustomTemplateConfig | null {
  const template = getTemplateById(id);
  if (!template) return null;

  const now = Date.now();
  const newTemplate: CustomTemplateConfig = {
    id: `custom_${now}`,
    name: newName || `${template.name} (副本)`,
    description: template.description,
    icon: template.icon,
    systemPrompt: template.systemPrompt || '',
    layoutPrompt: '', // Will be populated from builtin prompts
    exampleOutput: template.exampleOutput,
    features: [...template.features],
    source: 'custom',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  saveCustomTemplate(newTemplate);
  return newTemplate;
}

/**
 * Get version history for a template
 */
export function getTemplateVersions(templateId: string): TemplateVersion[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = STORAGE_KEY_TEMPLATE_VERSIONS_PREFIX + templateId;
    const data = localStorage.getItem(key);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return parsed.versions || [];
  } catch (error) {
    console.error('Failed to load template versions:', error);
    return [];
  }
}

/**
 * Save a template version snapshot
 */
export function saveTemplateVersion(
  templateId: string,
  config: CustomTemplateConfig,
  changeDescription?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const key = STORAGE_KEY_TEMPLATE_VERSIONS_PREFIX + templateId;
    const data = localStorage.getItem(key);
    const versionsData = data ? JSON.parse(data) : { templateId, versions: [] };

    const version: TemplateVersion = {
      id: `v_${Date.now()}`,
      templateId,
      config: { ...config },
      createdAt: Date.now(),
      changeDescription,
    };

    // Add to beginning and keep only max 10 versions
    versionsData.versions = [version, ...versionsData.versions].slice(0, 10);

    localStorage.setItem(key, JSON.stringify(versionsData));
  } catch (error) {
    console.error('Failed to save template version:', error);
  }
}

/**
 * Restore a template from a previous version
 */
export function restoreTemplateVersion(
  templateId: string,
  versionId: string
): CustomTemplateConfig | null {
  const versions = getTemplateVersions(templateId);
  const version = versions.find((v) => v.id === versionId);

  if (!version) return null;

  // Create a new version from the restored one
  const restored: CustomTemplateConfig = {
    ...version.config,
    id: templateId,
    updatedAt: Date.now(),
    version: version.config.version + 1,
  };

  saveCustomTemplate(restored);
  return restored;
}

/**
 * Delete all versions for a template
 */
function deleteTemplateVersions(templateId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = STORAGE_KEY_TEMPLATE_VERSIONS_PREFIX + templateId;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to delete template versions:', error);
  }
}

/**
 * Export a template to JSON string
 */
export function exportTemplate(templateId: string): string | null {
  const template = getTemplateById(templateId);
  if (!template) return null;

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    template,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export all custom templates
 */
export function exportAllTemplates(): string | null {
  const { custom } = getAllTemplates();

  if (custom.length === 0) return null;

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    templates: custom,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import a template from JSON string
 */
export function importTemplate(
  jsonString: string
): { success: boolean; template?: CustomTemplateConfig; error?: string } {
  try {
    const data = JSON.parse(jsonString);

    // Validate structure
    if (!data.template && !data.templates) {
      return { success: false, error: '无效的模板数据格式' };
    }

    // Handle single template import
    if (data.template) {
      const validationResult = validateTemplateData(data.template);
      if (!validationResult.valid) {
        return { success: false, error: validationResult.error };
      }

      // Generate new ID to avoid conflicts
      const newTemplate: CustomTemplateConfig = {
        ...validationResult.template!,
        id: `custom_${Date.now()}`,
        source: 'custom',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };

      saveCustomTemplate(newTemplate);
      return { success: true, template: newTemplate };
    }

    // Handle multiple templates import
    if (data.templates && Array.isArray(data.templates)) {
      let importedCount = 0;

      for (const tmpl of data.templates) {
        const validationResult = validateTemplateData(tmpl);
        if (validationResult.valid && validationResult.template) {
          const newTemplate: CustomTemplateConfig = {
            ...validationResult.template,
            id: `custom_${Date.now()}_${importedCount}`,
            source: 'custom',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
          };

          saveCustomTemplate(newTemplate);
          importedCount++;
        }
      }

      if (importedCount === 0) {
        return { success: false, error: '没有有效的模板可导入' };
      }

      return { success: true, error: `成功导入 ${importedCount} 个模板` };
    }

    return { success: false, error: '未知的模板数据格式' };
  } catch (error) {
    console.error('Failed to import template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '导入失败',
    };
  }
}

/**
 * Validate template data structure
 */
export function validateTemplateData(
  data: any
): { valid: boolean; template?: CustomTemplateConfig; error?: string } {
  // Check required fields
  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, error: '缺少有效的模板名称' };
  }

  if (!data.description || typeof data.description !== 'string') {
    return { valid: false, error: '缺少有效的模板描述' };
  }

  if (!data.icon || typeof data.icon !== 'string') {
    return { valid: false, error: '缺少有效的模板图标' };
  }

  if (!data.systemPrompt || typeof data.systemPrompt !== 'string') {
    return { valid: false, error: '缺少有效的系统提示词' };
  }

  // Security check: prevent script injection
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onload=, etc.
  ];

  const allStrings = [
    data.name,
    data.description,
    data.icon,
    data.systemPrompt,
    data.layoutPrompt || '',
    data.exampleOutput || '',
  ];

  for (const str of allStrings) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(str)) {
        return { valid: false, error: '检测到不安全的内容，请检查后再试' };
      }
    }
  }

  // Build valid template object
  const template: CustomTemplateConfig = {
    id: data.id || `custom_${Date.now()}`,
    name: data.name.trim(),
    description: data.description.trim(),
    icon: data.icon.trim(),
    systemPrompt: data.systemPrompt,
    layoutPrompt: data.layoutPrompt || '',
    exampleOutput: data.exampleOutput || '',
    features: Array.isArray(data.features) ? data.features : [],
    aiConfig: data.aiConfig,
    layoutPreferences: data.layoutPreferences,
    source: 'custom',
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now(),
    version: data.version || 1,
  };

  return { valid: true, template };
}

/**
 * Get storage usage info
 */
export function getTemplateStorageInfo(): { used: number; total: number; percentage: number } {
  if (typeof window === 'undefined') {
    return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
  }

  try {
    let totalSize = 0;

    // Calculate size of templates
    const templatesData = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (templatesData) {
      totalSize += new Blob([templatesData]).size;
    }

    // Calculate size of all version histories
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_TEMPLATE_VERSIONS_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }
    }

    const totalLimit = 5 * 1024 * 1024; // 5MB typical localStorage limit
    return {
      used: totalSize,
      total: totalLimit,
      percentage: (totalSize / totalLimit) * 100,
    };
  } catch (error) {
    console.error('Failed to calculate storage info:', error);
    return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
  }
}
