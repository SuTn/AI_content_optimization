'use client';

import { useEffect, useRef } from 'react';
import { parseMarkdown } from '@/lib/markdown';
import { generateWechatHtml } from '@/lib/wechatStyle';
import { Settings } from '@/types';

interface PreviewProps {
  content: string;
  settings: Settings;
}

export function Preview({ content, settings }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const html = parseMarkdown(content);
    const styledHtml = generateWechatHtml(html, settings);
    containerRef.current.innerHTML = styledHtml;
  }, [content, settings]);

  return (
    <div className="h-full bg-gray-100 overflow-auto">
      <div className="max-w-lg mx-auto bg-white min-h-full shadow-sm">
        <div
          ref={containerRef}
          className="p-4"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        />
      </div>
    </div>
  );
}
