'use client';

import { useArticle } from '@/hooks/useArticle';
import { useArticles } from '@/hooks/useArticles';
import { useSettings } from '@/hooks/useSettings';
import { useAIConfig } from '@/hooks/useAIConfig';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { parseMarkdown, sanitizeHtml } from '@/lib/markdown';
import { generateWechatHtml } from '@/lib/wechatStyle';
import { countChars } from '@/lib/utils';

export default function Home() {
  const { article, isLoading, updateContent, loadArticle, newArticle } = useArticle();
  const { articles, currentId, setCurrentArticleId, deleteArticle, refreshArticles } = useArticles();
  const { settings, updateSetting, updateSettings } = useSettings();
  const { aiConfig, updateAIConfig } = useAIConfig();

  // Sync current article ID
  if (article && article.id !== currentId) {
    setCurrentArticleId(article.id);
  }

  const handleSelectArticle = (id: string) => {
    // Save current article before switching
    if (article) {
      updateContent(article.content);
    }
    loadArticle(id);
    refreshArticles();
  };

  const handleDeleteArticle = (id: string) => {
    deleteArticle(id);
    if (article?.id === id) {
      newArticle();
    }
    refreshArticles();
  };

  const handleExportHtml = async () => {
    if (!article) return;

    const html = parseMarkdown(article.content);
    const cleanHtml = sanitizeHtml(html);
    const styledHtml = generateWechatHtml(cleanHtml, settings);

    try {
      // Use Clipboard API with text/html format
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([styledHtml], { type: 'text/html' }),
        'text/plain': new Blob([article.content], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback to older method
      const textarea = document.createElement('textarea');
      textarea.value = styledHtml;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        articles={articles}
        currentId={currentId}
        settings={settings}
        aiConfig={aiConfig}
        onNewArticle={newArticle}
        onSelectArticle={handleSelectArticle}
        onDeleteArticle={handleDeleteArticle}
        onSettingsChange={updateSettings}
        onAIConfigChange={updateAIConfig}
        onExportHtml={handleExportHtml}
        wordCount={article ? countChars(article.content) : 0}
        currentContent={article?.content || ''}
        onContentChange={updateContent}
      />

      <div className="flex-1 flex overflow-hidden">
        <Editor
          content={article?.content || ''}
          onChange={updateContent}
        />
        <Preview
          content={article?.content || ''}
          settings={settings}
        />
      </div>
    </div>
  );
}
