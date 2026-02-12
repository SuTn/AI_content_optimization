'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { getTemplateVersions } from '@/lib/templateStorage';
import { TemplateVersion } from '@/types/ai';
import { cn } from '@/lib/utils';

interface TemplateVersionHistoryProps {
  isOpen: boolean;
  templateId: string;
  templateName: string;
  onClose: () => void;
  onRestore: (versionId: string) => void;
}

export function TemplateVersionHistory({
  isOpen,
  templateId,
  templateName,
  onClose,
  onRestore,
}: TemplateVersionHistoryProps) {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadedVersions = getTemplateVersions(templateId);
      setVersions(loadedVersions);
    }
  }, [isOpen, templateId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">版本历史</h2>
            <p className="text-sm text-gray-600">{templateName}</p>
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
          {versions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无版本历史</p>
              <p className="text-sm mt-1">保存模板时会自动创建版本快照</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    index === 0
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">
                          {index === 0 ? '当前版本' : `版本 ${versions.length - index}`}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            最新
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(version.createdAt).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {version.changeDescription && (
                        <div className="text-sm text-gray-700 mt-1">
                          {version.changeDescription}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        v{version.config.version}
                      </div>
                    </div>

                    {index > 0 && (
                      <button
                        onClick={() => onRestore(version.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      >
                        <RotateCcw size={14} />
                        恢复
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
