'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Eye, EyeOff, History, Share2, Download, Upload } from 'lucide-react';
import { CustomTemplateConfig, AnyTemplateConfig } from '@/types/ai';
import { EnhancedTextarea } from './EnhancedTextarea';
import { TemplateVersionHistory } from './TemplateVersionHistory';
import { TemplateShareModal } from './TemplateShareModal';
import { TemplateImportModal } from './TemplateImportModal';
import { cn } from '@/lib/utils';

interface TemplateEditorProps {
  template?: AnyTemplateConfig;
  onSave: (template: CustomTemplateConfig) => void;
  onCancel: () => void;
}

type TabType = 'basic' | 'prompts' | 'layout' | 'ai' | 'preview';

const ICON_OPTIONS = [
  '📝', '💼', '🎨', '📚', '📰', '✨', '🚀', '💡',
  '🎯', '🔥', '⚡', '🌟', '💎', '🎭', '🎪', '🎢',
];

const CARD_STYLES = [
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主色' },
  { value: 'gradient', label: '渐变' },
  { value: 'shadow', label: '阴影' },
  { value: 'bordered', label: '边框' },
  { value: 'glass', label: '毛玻璃' },
];

const INFO_BOX_TYPES = [
  { value: 'tip', label: '提示' },
  { value: 'warning', label: '警告' },
  { value: 'success', label: '成功' },
  { value: 'error', label: '错误' },
  { value: 'note', label: '笔记' },
  { value: 'quote', label: '引用' },
];

const HIGHLIGHT_AREAS = [
  { value: 'numbered', label: '编号列表' },
  { value: 'process', label: '流程步骤' },
  { value: 'timeline', label: '时间线' },
  { value: 'callout', label: '引出框' },
  { value: 'comparison', label: '对比表' },
];

const DIVIDER_STYLES = [
  { value: 'solid', label: '实线' },
  { value: 'dashed', label: '虚线' },
  { value: 'dotted', label: '点线' },
  { value: 'gradient', label: '渐变' },
];

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [showPreview, setShowPreview] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CustomTemplateConfig>({
    id: `custom_${Date.now()}`,
    name: '',
    description: '',
    icon: '📝',
    systemPrompt: '',
    layoutPrompt: '',
    exampleOutput: '',
    features: [],
    source: 'custom',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  });

  // AI config override
  const [aiConfig, setAiConfig] = useState({
    temperature: 0.7,
    maxTokens: 8000,
  });

  // Layout preferences
  const [layoutPrefs, setLayoutPrefs] = useState({
    cardStyle: 'default',
    infoBoxTypes: ['tip', 'note'],
    highlightAreas: ['numbered'],
    dividerStyles: ['solid'],
    decorativeElements: false,
  });

  // Initialize from template
  useEffect(() => {
    if (template) {
      const isCustom = 'source' in template;
      setFormData({
        id: isCustom ? template.id : `custom_${Date.now()}`,
        name: template.name,
        description: template.description,
        icon: template.icon,
        systemPrompt: template.systemPrompt || '',
        layoutPrompt: isCustom ? (template.layoutPrompt || '') : '',
        exampleOutput: template.exampleOutput || '',
        features: template.features || [],
        source: 'custom',
        createdAt: isCustom ? template.createdAt : Date.now(),
        updatedAt: Date.now(),
        version: isCustom ? template.version + 1 : 1,
      });

      if (isCustom && template.aiConfig) {
        setAiConfig({
          temperature: template.aiConfig.temperature ?? 0.7,
          maxTokens: template.aiConfig.maxTokens ?? 8000,
        });
      }

      if (isCustom && template.layoutPreferences) {
        setLayoutPrefs({
          cardStyle: template.layoutPreferences.cardStyle || 'default',
          infoBoxTypes: template.layoutPreferences.infoBoxTypes || [],
          highlightAreas: template.layoutPreferences.highlightAreas || [],
          dividerStyles: template.layoutPreferences.dividerStyles || [],
          decorativeElements: template.layoutPreferences.decorativeElements || false,
        });
      }
    }
  }, [template]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData, aiConfig, layoutPrefs]);

  // Update form field
  const updateField = useCallback(<K extends keyof CustomTemplateConfig>(
    key: K,
    value: CustomTemplateConfig[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Toggle feature
  const toggleFeature = useCallback((feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  }, []);

  // Toggle layout preference array
  const toggleLayoutArray = useCallback(
    (key: keyof typeof layoutPrefs, value: string) => {
      setLayoutPrefs((prev) => {
        const currentArray = prev[key] as string[];
        return {
          ...prev,
          [key]: currentArray.includes(value)
            ? currentArray.filter((v) => v !== value)
            : [...currentArray, value],
        };
      });
    },
    []
  );

  // Handle save
  const handleSave = useCallback(() => {
    const templateToSave: CustomTemplateConfig = {
      ...formData,
      aiConfig,
      layoutPreferences: {
        cardStyle: layoutPrefs.cardStyle as any,
        infoBoxTypes: layoutPrefs.infoBoxTypes,
        highlightAreas: layoutPrefs.highlightAreas,
        dividerStyles: layoutPrefs.dividerStyles,
        decorativeElements: layoutPrefs.decorativeElements,
      },
    };
    onSave(templateToSave);
    setHasUnsavedChanges(false);
  }, [formData, aiConfig, layoutPrefs, onSave]);

  // Quick feature suggestions based on selected options
  const suggestedFeatures = [
    ...layoutPrefs.infoBoxTypes.map((t) => {
      const found = INFO_BOX_TYPES.find((f) => f.value === t);
      return found?.label || t;
    }),
    ...layoutPrefs.highlightAreas.map((a) => {
      const found = HIGHLIGHT_AREAS.find((h) => h.value === a);
      return found?.label || a;
    }),
  ];

  const TABS = [
    { id: 'basic' as TabType, label: '基本信息', icon: '📋' },
    { id: 'prompts' as TabType, label: '提示词配置', icon: '✍️' },
    { id: 'layout' as TabType, label: '布局偏好', icon: '🎨' },
    { id: 'ai' as TabType, label: 'AI参数', icon: '⚙️' },
    { id: 'preview' as TabType, label: '预览', icon: '👁️' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {template ? '编辑模板' : '新建模板'}
            </h2>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                未保存
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {template && 'source' in template && (
              <button
                type="button"
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <History size={16} />
                版本历史
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <Share2 size={16} />
              分享
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <Upload size={16} />
              导入
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-gray-200 bg-gray-50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm rounded transition-colors',
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="p-6 max-w-3xl">
              <h3 className="text-lg font-medium text-gray-800 mb-4">基本信息</h3>

              {/* Icon selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择图标
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => updateField('icon', icon)}
                      className={cn(
                        'p-3 text-2xl rounded-lg border-2 transition-all',
                        formData.icon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模板名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="例如：科技风格"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模板描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder="简要描述这个模板的用途和特点..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  功能标签
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={cn(
                        'px-3 py-1 text-sm rounded border transition-colors',
                        formData.features.includes(feature)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {feature}
                    </button>
                  ))}
                  {formData.features
                    .filter((f) => !suggestedFeatures.includes(f))
                    .map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={cn(
                          'px-3 py-1 text-sm rounded border transition-colors',
                          'border-blue-500 bg-blue-50 text-blue-700'
                        )}
                      >
                        {feature}
                      </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  选择功能标签或在布局偏好中配置后自动生成
                </p>
              </div>
            </div>
          )}

          {/* Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-medium text-gray-800">提示词配置</h3>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  系统提示词
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  定义AI的角色和整体风格指导
                </p>
                <EnhancedTextarea
                  value={formData.systemPrompt}
                  onChange={(value) => updateField('systemPrompt', value)}
                  placeholder="你是一个专业的公众号排版优化助手，擅长将内容优化为特定风格..."
                  rows={4}
                />
              </div>

              {/* Layout Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  布局指导提示词
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  指导AI使用哪些布局组件和如何组织内容结构
                </p>
                <EnhancedTextarea
                  value={formData.layoutPrompt}
                  onChange={(value) => updateField('layoutPrompt', value)}
                  placeholder="## 推荐组件&#10;- **卡片**: 使用 default 变体&#10;- **信息框**: tip, note&#10;..."
                  rows={6}
                />
              </div>

              {/* Example Output */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  示例输出
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  提供一个完整的示例供AI参考
                </p>
                <EnhancedTextarea
                  value={formData.exampleOutput}
                  onChange={(value) => updateField('exampleOutput', value)}
                  placeholder="# 文章标题&#10;&#10;简要介绍...&#10;&#10;---&#10;&#10;## 主要内容&#10;..."
                  rows={8}
                />
              </div>
            </div>
          )}

          {/* Layout Preferences Tab */}
          {activeTab === 'layout' && (
            <div className="p-6 max-w-3xl">
              <h3 className="text-lg font-medium text-gray-800 mb-4">布局组件偏好</h3>

              {/* Card Style */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  卡片样式
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CARD_STYLES.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        setLayoutPrefs((prev) => ({ ...prev, cardStyle: style.value }))
                      }
                      className={cn(
                        'px-3 py-2 text-sm rounded border transition-colors',
                        layoutPrefs.cardStyle === style.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box Types */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  信息框类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {INFO_BOX_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleLayoutArray('infoBoxTypes', type.value)}
                      className={cn(
                        'px-3 py-2 text-sm rounded border transition-colors',
                        layoutPrefs.infoBoxTypes.includes(type.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlight Areas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  重点区域
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HIGHLIGHT_AREAS.map((area) => (
                    <button
                      key={area.value}
                      type="button"
                      onClick={() => toggleLayoutArray('highlightAreas', area.value)}
                      className={cn(
                        'px-3 py-2 text-sm rounded border transition-colors',
                        layoutPrefs.highlightAreas.includes(area.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider Styles */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分割线样式
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DIVIDER_STYLES.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => toggleLayoutArray('dividerStyles', style.value)}
                      className={cn(
                        'px-3 py-2 text-sm rounded border transition-colors',
                        layoutPrefs.dividerStyles.includes(style.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">装饰元素</div>
                  <div className="text-sm text-gray-600">
                    启用emoji、图标等视觉增强元素
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLayoutPrefs((prev) => ({
                      ...prev,
                      decorativeElements: !prev.decorativeElements,
                    }))
                  }
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    layoutPrefs.decorativeElements
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                      layoutPrefs.decorativeElements ? 'left-6.5' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          )}

          {/* AI Parameters Tab */}
          {activeTab === 'ai' && (
            <div className="p-6 max-w-3xl">
              <h3 className="text-lg font-medium text-gray-800 mb-4">AI参数配置（可选）</h3>

              <div className="space-y-6">
                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Temperature (温度)
                    </label>
                    <span className="text-sm text-gray-600">{aiConfig.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={(e) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        temperature: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    较低的值使输出更确定性，较高的值使输出更创造性
                  </p>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Max Tokens (最大令牌数)
                    </label>
                    <span className="text-sm text-gray-600">{aiConfig.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="16000"
                    step="1000"
                    value={aiConfig.maxTokens}
                    onChange={(e) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        maxTokens: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    控制AI输出的最大长度
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ 这些参数会覆盖全局AI设置。如果不需要特定配置，请保持默认值。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">实时预览</h3>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPreview ? '隐藏预览' : '显示预览'}
                </button>
              </div>

              {showPreview && (
                <div className="space-y-6">
                  {/* Template Card Preview */}
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{formData.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{formData.name || '模板名称'}</h4>
                        <p className="text-sm text-gray-600">{formData.description || '模板描述'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(formData.features.length > 0 ? formData.features : ['功能标签']).map((f) => (
                        <span key={f} className="px-2 py-0.5 text-xs bg-gray-200 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* System Prompt Preview */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">系统提示词</h5>
                    <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-48 text-sm">
                      {formData.systemPrompt || '(未设置)'}
                    </pre>
                  </div>

                  {/* Layout Prompt Preview */}
                  {formData.layoutPrompt && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">布局指导</h5>
                      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-48 text-sm">
                        {formData.layoutPrompt}
                      </pre>
                    </div>
                  )}

                  {/* Example Output Preview */}
                  {formData.exampleOutput && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">示例输出</h5>
                      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-48 text-sm">
                        {formData.exampleOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {formData.id && `ID: ${formData.id}`}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              保存模板
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showVersionHistory && template && 'source' in template && (
        <TemplateVersionHistory
          isOpen={showVersionHistory}
          templateId={template.id}
          templateName={template.name}
          onClose={() => setShowVersionHistory(false)}
          onRestore={(versionId) => {
            // Handle restore
            setShowVersionHistory(false);
          }}
        />
      )}

      {showShareModal && template && (
        <TemplateShareModal
          isOpen={showShareModal}
          template={template}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showImportModal && (
        <TemplateImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={() => {
            setShowImportModal(false);
            // Reload templates after import
          }}
        />
      )}
    </div>
  );
}
