'use client';

import { useState } from 'react';
import type {
  CardVariant,
  InfoBoxType,
  HighlightType,
  DividerStyle,
  LayoutComponentType,
} from '@/types/layout';

interface LayoutComponentSelectorProps {
  onInsert: (syntax: string) => void;
  primaryColor?: string;
  onClose?: () => void;
}

export function LayoutComponentSelector({
  onInsert,
  primaryColor = '#1890ff',
  onClose,
}: LayoutComponentSelectorProps) {
  const [activeTab, setActiveTab] = useState<LayoutComponentType>('card');
  const [selectedVariant, setSelectedVariant] = useState<string>('default');

  const handleInsert = () => {
    let syntax = '';

    switch (activeTab) {
      case 'card':
        syntax = `:::card variant="${selectedVariant}" title="标题"\n内容\n:::\n`;
        break;
      case 'infobox':
        syntax = `:::${selectedVariant}\n内容\n:::\n`;
        break;
      case 'highlight':
        syntax = `:::${selectedVariant}\n- 项目一\n- 项目二\n:::\n`;
        break;
      case 'divider':
        syntax = `---style=${selectedVariant}---\n`;
        break;
    }

    onInsert(syntax);
    onClose?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">插入布局组件</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <Tab
          active={activeTab === 'card'}
          onClick={() => {
            setActiveTab('card');
            setSelectedVariant('default');
          }}
        >
          卡片
        </Tab>
        <Tab
          active={activeTab === 'infobox'}
          onClick={() => {
            setActiveTab('infobox');
            setSelectedVariant('tip');
          }}
        >
          信息框
        </Tab>
        <Tab
          active={activeTab === 'highlight'}
          onClick={() => {
            setActiveTab('highlight');
            setSelectedVariant('numbered');
          }}
        >
          重点
        </Tab>
        <Tab
          active={activeTab === 'divider'}
          onClick={() => {
            setActiveTab('divider');
            setSelectedVariant('solid');
          }}
        >
          分割线
        </Tab>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'card' && (
          <VariantGrid
            variants={CARD_VARIANTS}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
            primaryColor={primaryColor}
          />
        )}
        {activeTab === 'infobox' && (
          <VariantGrid
            variants={INFOBOX_TYPES}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
            primaryColor={primaryColor}
          />
        )}
        {activeTab === 'highlight' && (
          <VariantGrid
            variants={HIGHLIGHT_TYPES}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
            primaryColor={primaryColor}
          />
        )}
        {activeTab === 'divider' && (
          <VariantGrid
            variants={DIVIDER_STYLES}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
            primaryColor={primaryColor}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleInsert}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          插入
        </button>
      </div>
    </div>
  );
}

interface TabProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function Tab({ active, children, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
        active
          ? 'text-blue-500 border-blue-500'
          : 'text-gray-500 border-transparent hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

interface VariantGridProps {
  variants: VariantItem[];
  selected: string;
  onSelect: (value: string) => void;
  primaryColor: string;
}

interface VariantItem {
  value: string;
  label: string;
  icon: string;
  description: string;
}

function VariantGrid({ variants, selected, onSelect, primaryColor }: VariantGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {variants.map((variant) => (
        <VariantCard
          key={variant.value}
          variant={variant}
          selected={selected === variant.value}
          onClick={() => onSelect(variant.value)}
          primaryColor={primaryColor}
        />
      ))}
    </div>
  );
}

interface VariantCardProps {
  variant: VariantItem;
  selected: boolean;
  onClick: () => void;
  primaryColor: string;
}

function VariantCard({ variant, selected, onClick, primaryColor }: VariantCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      style={selected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : {}}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{variant.icon}</span>
        <span className="text-sm font-medium text-gray-800">{variant.label}</span>
      </div>
      <p className="text-xs text-gray-500">{variant.description}</p>
    </button>
  );
}

// Variant definitions
const CARD_VARIANTS: VariantItem[] = [
  { value: 'default', label: '默认卡片', icon: '📄', description: '白底灰边，简洁明了' },
  { value: 'primary', label: '主色卡片', icon: '🎨', description: '品牌色边框' },
  { value: 'gradient', label: '渐变卡片', icon: '🌈', description: '背景渐变效果' },
  { value: 'shadow', label: '阴影卡片', icon: '📦', description: '带阴影效果' },
  { value: 'bordered', label: '装饰边框', icon: '🖼️', description: '双线边框装饰' },
  { value: 'glass', label: '毛玻璃', icon: '✨', description: '半透明效果' },
];

const INFOBOX_TYPES: VariantItem[] = [
  { value: 'tip', label: '提示框', icon: '💡', description: '蓝色提示信息' },
  { value: 'warning', label: '警告框', icon: '⚠️', description: '橙色警告信息' },
  { value: 'success', label: '成功框', icon: '✓', description: '绿色成功信息' },
  { value: 'error', label: '错误框', icon: '✕', description: '红色错误信息' },
  { value: 'note', label: '笔记框', icon: '📝', description: '灰色笔记内容' },
  { value: 'quote', label: '引用框', icon: '💬', description: '装饰性引用' },
];

const HIGHLIGHT_TYPES: VariantItem[] = [
  { value: 'numbered', label: '编号列表', icon: '1️⃣', description: '数字编号要点' },
  { value: 'process', label: '流程步骤', icon: '🔄', description: '流程化展示' },
  { value: 'timeline', label: '时间线', icon: '📅', description: '时间轴展示' },
  { value: 'callout', label: '引出框', icon: '📢', description: '突出重点内容' },
  { value: 'comparison', label: '对比表格', icon: '⚖️', description: '并排对比展示' },
];

const DIVIDER_STYLES: VariantItem[] = [
  { value: 'solid', label: '实线', icon: '─', description: '实线分割' },
  { value: 'dashed', label: '虚线', icon: '┄', description: '虚线分割' },
  { value: 'dotted', label: '点线', icon: '┈', description: '点线分割' },
  { value: 'gradient', label: '渐变线', icon: '🌈', description: '渐变分割' },
];
