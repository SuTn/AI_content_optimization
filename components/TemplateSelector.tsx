'use client';

import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { TEMPLATES, TemplateId, AnyTemplateId, AnyTemplateConfig } from '@/types/ai';
import { getAllTemplates } from '@/lib/templateStorage';
import { cn } from '@/lib/utils';
import { useMemo, useEffect, useState } from 'react';

interface TemplateSelectorProps {
  isOpen: boolean;
  selectedId?: AnyTemplateId;
  onSelect: (templateId: AnyTemplateId) => void;
  onClose: () => void;
}

export function TemplateSelector({ isOpen, selectedId, onSelect, onClose }: TemplateSelectorProps) {
  const [allTemplates, setAllTemplates] = useState<{
    builtin: AnyTemplateConfig[];
    custom: AnyTemplateConfig[];
  }>({ builtin: [], custom: [] });

  // Load templates on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      const templates = getAllTemplates();
      setAllTemplates(templates);
    }
  }, [isOpen]);

  const templateList = useMemo(() => {
    return [...allTemplates.builtin, ...allTemplates.custom];
  }, [allTemplates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-800">选择优化风格</h2>
            <Link
              href="/templates"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              管理模板
              <ExternalLink size={14} />
            </Link>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Builtin Templates */}
          {allTemplates.builtin.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">内置模板</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allTemplates.builtin.map((template) => (
                  <TemplateButton
                    key={template.id}
                    template={template}
                    isSelected={selectedId === template.id}
                    onClick={() => onSelect(template.id as AnyTemplateId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Templates */}
          {allTemplates.custom.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                自定义模板 ({allTemplates.custom.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allTemplates.custom.map((template) => (
                  <TemplateButton
                    key={template.id}
                    template={template}
                    isSelected={selectedId === template.id}
                    onClick={() => onSelect(template.id as AnyTemplateId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state for custom templates */}
          {allTemplates.custom.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">还没有自定义模板</p>
              <Link
                href="/templates"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                前往创建 →
              </Link>
            </div>
          )}

          {/* Example preview */}
          {selectedId && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">示例输出格式</h4>
              <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                {(TEMPLATES[selectedId as TemplateId] || allTemplates.custom.find(t => t.id === selectedId))?.exampleOutput || ''}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// Template button sub-component
interface TemplateButtonProps {
  template: AnyTemplateConfig;
  isSelected: boolean;
  onClick: () => void;
}

function TemplateButton({ template, isSelected, onClick }: TemplateButtonProps) {
  const isCustom = 'source' in template;

  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left p-4 rounded-lg border-2 transition-all hover:shadow-md',
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800 truncate">
              {template.name}
            </h3>
            {isCustom && (
              <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded flex-shrink-0">
                自定义
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {template.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {template.features?.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {feature}
              </span>
            ))}
            {(template.features?.length || 0) > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                +{(template.features?.length || 0) - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
