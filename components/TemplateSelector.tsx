'use client';

import { X } from 'lucide-react';
import { TEMPLATES, TemplateId } from '@/types/ai';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  isOpen: boolean;
  selectedId?: TemplateId;
  onSelect: (templateId: TemplateId) => void;
  onClose: () => void;
}

export function TemplateSelector({ isOpen, selectedId, onSelect, onClose }: TemplateSelectorProps) {
  if (!isOpen) return null;

  const templateList = Object.values(TEMPLATES);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">选择优化风格</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateList.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template.id)}
                className={cn(
                  'text-left p-4 rounded-lg border-2 transition-all hover:shadow-md',
                  selectedId === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Example preview */}
          {selectedId && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">示例输出格式</h4>
              <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                {TEMPLATES[selectedId].exampleOutput}
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
