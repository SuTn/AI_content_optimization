'use client';

import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Article } from '@/types';

interface ArticleListProps {
  articles: Article[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ArticleList({
  articles,
  currentId,
  onSelect,
  onDelete,
  onClose,
}: ArticleListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这篇文章吗？')) {
      onDelete(id);
    }
  };

  const displayArticles = articles.slice(0, 10);

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-auto"
    >
      <div className="p-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">历史文章</h3>
      </div>

      {displayArticles.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">暂无文章</div>
      ) : (
        <ul>
          {displayArticles.map((article) => (
            <li
              key={article.id}
              onClick={() => onSelect(article.id)}
              className={`group flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                article.id === currentId ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {article.title}
                </div>
                <div className="text-xs text-gray-500">
                  {article.relativeTime}
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, article.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
