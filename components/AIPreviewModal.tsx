'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Check, Copy } from 'lucide-react';
import { OptimizedVersion } from '@/types/ai';
import { parseMarkdown } from '@/lib/markdown';
import { generateWechatHtml } from '@/lib/wechatStyle';
import { Settings } from '@/types';

interface AIPreviewModalProps {
  isOpen: boolean;
  originalContent: string;
  optimizedContent: string;
  settings: Settings;
  isStreaming: boolean;
  history: OptimizedVersion[];
  onApply: (content: string) => void;
  onCancel: () => void;
  onRestore: (versionId: string) => void;
}

export function AIPreviewModal({
  isOpen,
  originalContent,
  optimizedContent,
  settings,
  isStreaming,
  history,
  onApply,
  onCancel,
  onRestore,
}: AIPreviewModalProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      // Use basic markdown parsing
      const content = showOriginal ? originalContent : optimizedContent;
      const html = parseMarkdown(content);
      const styledHtml = generateWechatHtml(html, settings);
      previewRef.current.innerHTML = styledHtml;
    }
  }, [originalContent, optimizedContent, settings, showOriginal]);

  const handleCopy = async () => {
    const content = showOriginal ? originalContent : optimizedContent;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {isStreaming ? 'AI 正在优化...' : '优化预览'}
            </h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowOriginal(false)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  !showOriginal
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                优化后
              </button>
              <button
                onClick={() => setShowOriginal(true)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  showOriginal
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                原文
              </button>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div className="max-w-lg mx-auto bg-white min-h-full shadow-sm">
              <div
                ref={previewRef}
                className="p-4"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              />
            </div>
          </div>

          {/* History sidebar */}
          {history.length > 0 && (
            <div className="w-64 border-l border-gray-200 overflow-auto bg-white">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">历史版本</h3>
              </div>
              <div className="p-2 space-y-1">
                {history.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => onRestore(version.id)}
                    className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm text-gray-800 truncate">
                      {version.templateId}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(version.createdAt).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              disabled={isStreaming}
            >
              取消
            </button>
            <button
              onClick={() => onApply(optimizedContent)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isStreaming || !optimizedContent}
            >
              <Check size={18} />
              应用优化
            </button>
          </div>
        </div>

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            AI 正在优化中...
          </div>
        )}
      </div>
    </div>
  );
}
