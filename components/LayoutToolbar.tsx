'use client';

import {
  Square,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Quote,
  ListOrdered,
  GitMerge,
  Minus,
  Sparkles,
} from 'lucide-react';

interface LayoutToolbarProps {
  onInsert: (syntax: string) => void;
  primaryColor?: string;
}

export function LayoutToolbar({ onInsert, primaryColor = '#1890ff' }: LayoutToolbarProps) {
  const insertCard = (variant: string) => {
    const syntax = `:::card variant="${variant}" title="标题"\n内容\n:::\n`;
    onInsert(syntax);
  };

  const insertInfoBox = (type: string) => {
    const syntax = `:::${type}\n内容\n:::\n`;
    onInsert(syntax);
  };

  const insertHighlight = (type: string) => {
    const syntax = `:::${type}\n- 项目一\n- 项目二\n:::\n`;
    onInsert(syntax);
  };

  const insertDivider = (style: string) => {
    const syntax = `---style=${style}---\n`;
    onInsert(syntax);
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap bg-gray-50">
      <span className="text-xs font-medium text-gray-500 px-2">布局</span>

      {/* Card Components */}
      <ToolbarGroup title="卡片">
        <ToolbarButton
          icon={<Square size={16} />}
          tooltip="默认卡片"
          onClick={() => insertCard('default')}
        />
        <ToolbarButton
          icon={<Square size={16} style={{ stroke: primaryColor }} />}
          tooltip="主色卡片"
          onClick={() => insertCard('primary')}
        />
        <ToolbarButton
          icon={<Square size={16} style={{ background: `linear-gradient(135deg, ${primaryColor}40, transparent)` }} />}
          tooltip="渐变卡片"
          onClick={() => insertCard('gradient')}
        />
      </ToolbarGroup>

      {/* Info Box Components */}
      <ToolbarGroup title="信息框">
        <ToolbarButton
          icon={<Info size={16} />}
          tooltip="提示框"
          onClick={() => insertInfoBox('tip')}
        />
        <ToolbarButton
          icon={<AlertCircle size={16} />}
          tooltip="警告框"
          onClick={() => insertInfoBox('warning')}
        />
        <ToolbarButton
          icon={<CheckCircle size={16} />}
          tooltip="成功框"
          onClick={() => insertInfoBox('success')}
        />
        <ToolbarButton
          icon={<XCircle size={16} />}
          tooltip="错误框"
          onClick={() => insertInfoBox('error')}
        />
        <ToolbarButton
          icon={<Quote size={16} />}
          tooltip="引用框"
          onClick={() => insertInfoBox('quote')}
        />
      </ToolbarGroup>

      {/* Highlight Components */}
      <ToolbarGroup title="重点区域">
        <ToolbarButton
          icon={<ListOrdered size={16} />}
          tooltip="编号列表"
          onClick={() => insertHighlight('numbered')}
        />
        <ToolbarButton
          icon={<GitMerge size={16} />}
          tooltip="流程步骤"
          onClick={() => insertHighlight('process')}
        />
      </ToolbarGroup>

      {/* Divider Components */}
      <ToolbarGroup title="分割线">
        <ToolbarButton
          icon={<Minus size={16} />}
          tooltip="实线"
          onClick={() => insertDivider('solid')}
        />
        <ToolbarButton
          icon={<Minus size={16} style={{ strokeDasharray: '4 2' }} />}
          tooltip="虚线"
          onClick={() => insertDivider('dashed')}
        />
        <ToolbarButton
          icon={<Sparkles size={16} />}
          tooltip="渐变线"
          onClick={() => insertDivider('gradient')}
        />
      </ToolbarGroup>
    </div>
  );
}

interface ToolbarGroupProps {
  title: string;
  children: React.ReactNode;
}

function ToolbarGroup({ title, children }: ToolbarGroupProps) {
  return (
    <div className="flex items-center gap-1 px-1 border-l border-gray-300 first:border-l-0">
      {children}
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}

function ToolbarButton({ icon, tooltip, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700"
      title={tooltip}
    >
      {icon}
    </button>
  );
}
