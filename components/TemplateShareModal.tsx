'use client';

import { useState, useCallback } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import { AnyTemplateConfig } from '@/types/ai';

interface TemplateShareModalProps {
  isOpen: boolean;
  template: AnyTemplateConfig;
  onClose: () => void;
}

export function TemplateShareModal({ isOpen, template, onClose }: TemplateShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate export JSON
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    template,
  };
  const jsonString = JSON.stringify(exportData, null, 2);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [jsonString]);

  // Download as file
  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name}_template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [jsonString, template.name]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">分享模板</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Template Info */}
          <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">模板数据 (JSON)</h4>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-64 text-sm">
              {jsonString}
            </pre>
          </div>

          {/* Info message */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 您可以复制JSON数据分享给他人，或下载为文件保存到本地。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              copied
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            下载文件
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
