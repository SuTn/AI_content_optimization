'use client';

import { Copy, Trash2, Eye, Edit2 } from 'lucide-react';
import { TemplateConfig, CustomTemplateConfig } from '@/types/ai';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: TemplateConfig | CustomTemplateConfig;
  isBuiltin: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  showPreview?: boolean;
  onTogglePreview?: () => void;
}

export function TemplateCard({
  template,
  isBuiltin,
  isSelected = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  showPreview = false,
  onTogglePreview,
}: TemplateCardProps) {
  const isCustom = !isBuiltin;

  return (
    <div
      className={cn(
        'group relative rounded-lg border-2 transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md',
        onSelect && 'cursor-pointer'
      )}
    >
      {/* Main content */}
      <div
        className={cn(
          'p-4',
          onSelect && 'cursor-pointer'
        )}
        onClick={onSelect}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl flex-shrink-0">{template.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800 truncate">
                {template.name}
              </h3>
              {isCustom && (
                <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded flex-shrink-0">
                  自定义
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {template.description}
            </p>
          </div>
        </div>

        {/* Features */}
        {template.features && template.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {feature}
              </span>
            ))}
            {template.features.length > 4 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                +{template.features.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Example preview */}
        {showPreview && template.exampleOutput && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">示例输出格式</div>
            <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-auto max-h-32">
              {template.exampleOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2 border-t border-gray-100',
          'bg-gray-50/50 rounded-b-lg'
        )}
      >
        {/* Left: Preview toggle */}
        {onTogglePreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePreview();
            }}
            className={cn(
              'flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900',
              'transition-colors'
            )}
          >
            <Eye size={14} />
            {showPreview ? '隐藏示例' : '查看示例'}
          </button>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {isCustom ? (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className={cn(
                    'p-1.5 rounded hover:bg-gray-200 transition-colors',
                    'text-gray-600 hover:text-gray-900'
                  )}
                  title="编辑"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  className={cn(
                    'p-1.5 rounded hover:bg-gray-200 transition-colors',
                    'text-gray-600 hover:text-gray-900'
                  )}
                  title="复制"
                >
                  <Copy size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className={cn(
                    'p-1.5 rounded hover:bg-red-100 transition-colors',
                    'text-gray-600 hover:text-red-600'
                  )}
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          ) : (
            onDuplicate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className={cn(
                  'p-1.5 rounded hover:bg-gray-200 transition-colors',
                  'text-gray-600 hover:text-gray-900'
                )}
                title="基于此创建自定义模板"
              >
                <Copy size={14} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Metadata for custom templates */}
      {isCustom && (template as CustomTemplateConfig).updatedAt && (
        <div className="px-4 pb-3 pt-0">
          <div className="text-xs text-gray-400">
            v{(template as CustomTemplateConfig).version} · 更新于{' '}
            {new Date((template as CustomTemplateConfig).updatedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
