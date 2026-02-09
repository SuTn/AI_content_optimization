'use client';

import { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  Link2,
  Image,
  Code,
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [content]);

  // Insert markdown syntax at cursor position
  const insertSyntax = (syntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    let newText = '';
    let newCursorPosition = 0;

    switch (syntax) {
      case 'bold':
        newText = `**${textToInsert}**`;
        newCursorPosition = start + 2;
        break;
      case 'italic':
        newText = `*${textToInsert}*`;
        newCursorPosition = start + 1;
        break;
      case 'h1':
        newText = `# ${textToInsert}`;
        newCursorPosition = start + 2;
        break;
      case 'h2':
        newText = `## ${textToInsert}`;
        newCursorPosition = start + 3;
        break;
      case 'quote':
        newText = `> ${textToInsert}`;
        newCursorPosition = start + 2;
        break;
      case 'list':
        newText = `- ${textToInsert}`;
        newCursorPosition = start + 2;
        break;
      case 'link':
        newText = `[${textToInsert}](url)`;
        newCursorPosition = start + textToInsert.length + 4;
        break;
      case 'image':
        newText = `![${textToInsert}](url)`;
        newCursorPosition = start + textToInsert.length + 5;
        break;
      case 'code':
        newText = `\`\`\`\n${textToInsert}\n\`\`\``;
        newCursorPosition = start + 4;
        break;
      default:
        newText = textToInsert;
        newCursorPosition = start;
    }

    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = before + newText + after;

    onChange(newContent);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectedText ? newCursorPosition + textToInsert.length : newCursorPosition,
        selectedText ? newCursorPosition + textToInsert.length : newCursorPosition
      );
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key - insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = content.substring(0, start);
      const after = content.substring(end);
      const newContent = before + '  ' + after;

      onChange(newContent);

      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap bg-gray-50">
        <ToolbarButton
          icon={<Bold size={18} />}
          tooltip="粗体"
          onClick={() => insertSyntax('bold', '粗体')}
        />
        <ToolbarButton
          icon={<Italic size={18} />}
          tooltip="斜体"
          onClick={() => insertSyntax('italic', '斜体')}
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          icon={<Heading1 size={18} />}
          tooltip="一级标题"
          onClick={() => insertSyntax('h1', '标题')}
        />
        <ToolbarButton
          icon={<Heading2 size={18} />}
          tooltip="二级标题"
          onClick={() => insertSyntax('h2', '标题')}
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          icon={<Quote size={18} />}
          tooltip="引用"
          onClick={() => insertSyntax('quote', '引用内容')}
        />
        <ToolbarButton
          icon={<List size={18} />}
          tooltip="列表"
          onClick={() => insertSyntax('list', '列表项')}
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          icon={<Link2 size={18} />}
          tooltip="链接"
          onClick={() => insertSyntax('link', '链接文字')}
        />
        <ToolbarButton
          icon={<Image size={18} />}
          tooltip="图片"
          onClick={() => insertSyntax('image', '图片描述')}
        />
        <ToolbarButton
          icon={<Code size={18} />}
          tooltip="代码块"
          onClick={() => insertSyntax('code', '代码')}
        />
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm leading-relaxed"
        placeholder="开始写作..."
        spellCheck={false}
      />
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
      className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-700"
      title={tooltip}
    >
      {icon}
    </button>
  );
}
