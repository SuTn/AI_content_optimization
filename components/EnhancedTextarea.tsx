'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  showFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  readOnly?: boolean;
}

export function EnhancedTextarea({
  value,
  onChange,
  placeholder = '',
  className,
  rows = 4,
  maxLength,
  showCharCount = true,
  showFullscreen = true,
  onFullscreenChange,
  readOnly = false,
}: EnhancedTextareaProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    onFullscreenChange?.(newFullscreen);

    // Focus textarea after state update
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [isFullscreen, onFullscreenChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl/Cmd + K to toggle fullscreen
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleFullscreenToggle();
      }
    },
    [handleFullscreenToggle]
  );

  // Auto-resize based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && !isFullscreen) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, isFullscreen]);

  // Calculate character count
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const remaining = maxLength ? maxLength - charCount : null;

  return (
    <div
      className={cn(
        'relative',
        isFullscreen && 'fixed inset-0 z-50 bg-white p-8 flex flex-col',
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={isFullscreen ? undefined : rows}
        maxLength={maxLength}
        className={cn(
          'w-full resize-none rounded-lg border border-gray-300 p-3 text-sm font-mono leading-relaxed transition-colors',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'placeholder:text-gray-400',
          isFullscreen
            ? 'flex-1 min-h-0 text-base'
            : 'min-h-[100px] overflow-hidden',
          readOnly && 'bg-gray-50 cursor-default'
        )}
        style={isFullscreen ? {} : { minHeight: `${rows * 24}px` }}
      />

      {/* Footer bar */}
      <div
        className={cn(
          'flex items-center justify-between mt-2 text-xs text-gray-500',
          isFullscreen && 'border-t pt-3'
        )}
      >
        {/* Character/word count */}
        <div className="flex items-center gap-3">
          {showCharCount && (
            <>
              <span>{charCount} 字符</span>
              <span>{wordCount} 词</span>
              {remaining !== null && (
                <span className={cn(remaining < 0 ? 'text-red-500' : '')}>
                  {remaining} 剩余
                </span>
              )}
            </>
          )}
        </div>

        {/* Fullscreen toggle */}
        {showFullscreen && !readOnly && (
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors',
              'text-gray-600 hover:text-gray-900'
            )}
            title={isFullscreen ? '退出全屏 (Esc)' : '全屏编辑 (Ctrl+K)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={14} />
                <span>退出全屏</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                <span>全屏</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Helper text for fullscreen mode */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          按 Ctrl+K 退出全屏
        </div>
      )}
    </div>
  );
}
