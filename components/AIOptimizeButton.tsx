'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAIOptimize } from '@/hooks/useAIOptimize';
import { TemplateSelector } from './TemplateSelector';
import { AIPreviewModal } from './AIPreviewModal';
import { AIConfig, AnyTemplateId } from '@/types/ai';

interface AIOptimizeButtonProps {
  articleId: string;
  content: string;
  aiConfig: AIConfig;
  onContentChange: (content: string) => void;
  onOpenConfig: () => void;
}

export function AIOptimizeButton({
  articleId,
  content,
  aiConfig,
  onContentChange,
  onOpenConfig,
}: AIOptimizeButtonProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const {
    isOptimizing,
    isStreaming,
    optimizedContent,
    error,
    history,
    optimize,
    loadHistory,
    restoreFromHistory,
    reset,
  } = useAIOptimize({
    articleId,
    onSave: () => setShowPreviewModal(false),
  });

  const handleStartOptimize = () => {
    if (!aiConfig.enabled) {
      onOpenConfig();
      return;
    }

    if (!aiConfig.apiKey) {
      onOpenConfig();
      return;
    }

    setShowTemplateSelector(true);
  };

  const handleSelectTemplate = async (templateId: AnyTemplateId) => {
    setShowTemplateSelector(false);
    loadHistory();

    const result = await optimize(content, templateId, aiConfig);

    if (result) {
      setShowPreviewModal(true);
    }
  };

  const handleApply = (newContent: string) => {
    onContentChange(newContent);
    setShowPreviewModal(false);
    reset();
  };

  const handleCancel = () => {
    setShowPreviewModal(false);
    reset();
  };

  const handleRestore = (versionId: string) => {
    const restoredContent = restoreFromHistory(versionId);
    if (restoredContent) {
      onContentChange(restoredContent);
    }
  };

  return (
    <>
      <button
        onClick={handleStartOptimize}
        disabled={isOptimizing}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
          !aiConfig.enabled || !aiConfig.apiKey
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
        title={!aiConfig.enabled ? '请先在设置中启用 AI 优化' : !aiConfig.apiKey ? '请先配置 API Key' : 'AI 优化'}
      >
        {isOptimizing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>优化中...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>AI优化</span>
          </>
        )}
      </button>

      {showTemplateSelector && (
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelect={handleSelectTemplate}
        />
      )}

      {showPreviewModal && (
        <AIPreviewModal
          isOpen={showPreviewModal}
          originalContent={content}
          optimizedContent={optimizedContent}
          settings={{
            fontSize: 16,
            lineHeight: 1.75,
            primaryColor: '#576b95',
          }}
          isStreaming={isStreaming}
          history={history}
          onApply={handleApply}
          onCancel={handleCancel}
          onRestore={handleRestore}
        />
      )}
    </>
  );
}
