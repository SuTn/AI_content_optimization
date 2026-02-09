'use client';

import { useState } from 'react';
import { Plus, Clock, Settings, Copy, Check } from 'lucide-react';
import { ArticleList } from './ArticleList';
import { SettingPanel } from './SettingPanel';
import { AIConfigPanel } from './AIConfigPanel';
import { AIOptimizeButton } from './AIOptimizeButton';
import { Settings as SettingsType, Article } from '@/types';
import { AIConfig } from '@/types/ai';

interface ToolbarProps {
  articles: Article[];
  currentId: string | null;
  settings: SettingsType;
  aiConfig: AIConfig;
  onNewArticle: () => void;
  onSelectArticle: (id: string) => void;
  onDeleteArticle: (id: string) => void;
  onSettingsChange: (settings: SettingsType) => void;
  onAIConfigChange: (config: AIConfig) => void;
  onExportHtml: () => void;
  wordCount: number;
  currentContent: string;
  onContentChange: (content: string) => void;
}

export function Toolbar({
  articles,
  currentId,
  settings,
  aiConfig,
  onNewArticle,
  onSelectArticle,
  onDeleteArticle,
  onSettingsChange,
  onAIConfigChange,
  onExportHtml,
  wordCount,
  currentContent,
  onContentChange,
}: ToolbarProps) {
  const [showArticleList, setShowArticleList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    onExportHtml();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        {/* Logo and title */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">墨排</h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* New article */}
          <button
            onClick={onNewArticle}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            <span>新建</span>
          </button>

          {/* History dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowArticleList(!showArticleList)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Clock size={16} />
              <span>历史</span>
            </button>

            {showArticleList && (
              <ArticleList
                articles={articles}
                currentId={currentId}
                onSelect={(id) => {
                  onSelectArticle(id);
                  setShowArticleList(false);
                }}
                onDelete={(id) => {
                  onDeleteArticle(id);
                }}
                onClose={() => setShowArticleList(false)}
              />
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="样式设置"
          >
            <Settings size={20} />
          </button>

          {/* AI Optimize */}
          <AIOptimizeButton
            articleId={currentId || ''}
            content={currentContent}
            aiConfig={aiConfig}
            onContentChange={onContentChange}
            onOpenConfig={() => setShowAIConfig(true)}
          />

          {/* Export */}
          <button
            onClick={handleExport}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? '已复制' : '复制HTML'}</span>
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <SettingPanel
          settings={settings}
          onChange={(newSettings) => {
            onSettingsChange(newSettings);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* AI Config panel */}
      <AIConfigPanel
        config={aiConfig}
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        onSave={onAIConfigChange}
      />

      {/* Word count footer */}
      <div className="px-4 py-1 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
        <span>字数: {wordCount.toLocaleString()}</span>
      </div>
    </>
  );
}
