'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Upload, Download, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { useTemplates } from '@/hooks/useTemplates';
import { TemplateCard } from '@/components/TemplateCard';
import { TemplateEditor } from '@/components/TemplateEditor';
import { TemplateImportModal } from '@/components/TemplateImportModal';
import { CustomTemplateConfig, AnyTemplateConfig } from '@/types/ai';

export default function TemplatesPage() {
  const {
    builtinTemplates,
    customTemplates,
    isLoading,
    storageInfo,
    loadTemplates,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate: duplicateTemplateById,
    exportAllCustomTemplates,
    importTemplates,
    downloadJsonFile,
  } = useTemplates();

  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AnyTemplateConfig | undefined>();
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

  // Handle create new template
  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setShowEditor(true);
  };

  // Handle edit template
  const handleEdit = (template: AnyTemplateConfig) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  // Handle save template
  const handleSave = (template: CustomTemplateConfig) => {
    saveTemplate(template);
    setShowEditor(false);
    setEditingTemplate(undefined);
  };

  // Handle duplicate template
  const handleDuplicate = (id: string) => {
    const newTemplate = duplicateTemplateById(id);
    if (newTemplate) {
      // Could show a success message here
    }
  };

  // Handle delete template
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个模板吗？此操作无法撤销。')) {
      const success = deleteTemplate(id);
      if (!success) {
        alert('删除失败');
      }
    }
  };

  // Handle export all
  const handleExportAll = () => {
    const jsonData = exportAllCustomTemplates();
    if (jsonData) {
      downloadJsonFile(jsonData, `mopai_templates_${Date.now()}.json`);
    } else {
      alert('没有自定义模板可导出');
    }
  };

  // Handle import
  const handleImport = () => {
    setShowImportModal(true);
  };

  // Toggle preview
  const togglePreview = (id: string) => {
    setExpandedPreviewId(expandedPreviewId === id ? null : id);
  };

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(undefined);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">模板管理</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Storage indicator */}
              {storageInfo.percentage > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <HardDrive className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">
                    {Math.round(storageInfo.percentage)}% 已使用
                  </span>
                </div>
              )}

              <button
                onClick={handleExportAll}
                disabled={customTemplates.length === 0}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">导出全部</span>
              </button>

              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">导入</span>
              </button>

              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建模板
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Builtin Templates Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">内置模板</h2>
                <p className="text-sm text-gray-600">
                  系统预设的模板，可以复制后自定义修改
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {builtinTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isBuiltin={true}
                    showPreview={expandedPreviewId === template.id}
                    onTogglePreview={() => togglePreview(template.id)}
                    onDuplicate={() => handleDuplicate(template.id)}
                  />
                ))}
              </div>
            </section>

            {/* Custom Templates Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    自定义模板
                  </h2>
                  <p className="text-sm text-gray-600">
                    {customTemplates.length === 0
                      ? '还没有自定义模板，点击上方按钮创建'
                      : `共 ${customTemplates.length} 个自定义模板`}
                  </p>
                </div>
              </div>

              {customTemplates.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    还没有自定义模板
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    创建您自己的模板，完全自定义提示词和布局偏好
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    创建第一个模板
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isBuiltin={false}
                      showPreview={expandedPreviewId === template.id}
                      onTogglePreview={() => togglePreview(template.id)}
                      onEdit={() => handleEdit(template)}
                      onDuplicate={() => handleDuplicate(template.id)}
                      onDelete={() => handleDelete(template.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <TemplateImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={() => {
            loadTemplates();
            setShowImportModal(false);
          }}
        />
      )}
    </div>
  );
}
