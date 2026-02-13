/**
 * Template-specific layout configurations
 * Defines the preferred styling options for each template
 */

import type { TemplateId } from '@/types/layout';

/**
 * Template layout configurations (simplified)
 */
export const TEMPLATE_LAYOUTS: Record<TemplateId, {
  useEmojiDecorations: boolean;
  primaryColor: string;
  colorSchemes: string[];
}> = {
  simple: {
    useEmojiDecorations: false,
    primaryColor: '#333333',
    colorSchemes: ['#f0f9ff', '#fafafa'],
  },

  business: {
    useEmojiDecorations: false,
    primaryColor: '#1890ff',
    colorSchemes: ['#f0f9ff', '#f7fbff', '#f9f0ff'],
  },

  lively: {
    useEmojiDecorations: true,
    primaryColor: '#ff6b6b',
    colorSchemes: ['#f0f9ff', '#fff9db', '#f0fdf4'],
  },

  academic: {
    useEmojiDecorations: false,
    primaryColor: '#5c4b8a',
    colorSchemes: ['#fafafa', '#f9f0ff'],
  },

  magazine: {
    useEmojiDecorations: true,
    primaryColor: '#e91e63',
    colorSchemes: ['#f9f0ff', '#f0f9ff'],
  },
};

/**
 * Get layout configuration for a template
 */
export function getTemplateLayoutConfig(templateId: TemplateId): {
  useEmojiDecorations: boolean;
  primaryColor: string;
  colorSchemes: string[];
} {
  return TEMPLATE_LAYOUTS[templateId] || TEMPLATE_LAYOUTS.simple;
}

/**
 * Get primary color for a template
 */
export function getTemplatePrimaryColor(templateId: TemplateId): string {
  return getTemplateLayoutConfig(templateId).primaryColor;
}

/**
 * Get HTML style examples for a template
 */
export function getTemplateHtmlExamples(templateId: TemplateId): string {
  const config = getTemplateLayoutConfig(templateId);
  const primaryColor = getTemplatePrimaryColor(templateId);

  let examples = '';

  // Info box example
  if (config.useEmojiDecorations) {
    examples += `
## 信息框示例

\`\`\`html
<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.1em;">💡 提示：</strong><br>
  这里是提示信息内容...
</div>
\`\`\`

`;
  } else {
    examples += `
## 信息框示例

\`\`\`html
<div style="background-color: ${config.colorSchemes[0]}; border-left: 4px solid ${primaryColor}; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.1em;">提示：</strong><br>
  这里是提示信息内容...
</div>
\`\`\`

`;
  }

  // Card example
  examples += `
## 卡片示例

\`\`\`html
<div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #ffffff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px;">卡片标题</strong>
  卡片内容...
</div>
\`\`\`

`;

  // Steps example
  examples += `
## 步骤列表示例

\`\`\`html
<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 第一步：准备工作
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">⏳</span> 第二步：执行操作
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">🎉</span> 第三步：完成验证
  </div>
</div>
\`\`\`

`;

  return examples;
}

/**
 * Get AI prompt template for layout generation
 */
export function getLayoutPrompt(templateId: TemplateId): string {
  const config = getTemplateLayoutConfig(templateId);
  const primaryColor = getTemplatePrimaryColor(templateId);
  const examples = getTemplateHtmlExamples(templateId);

  const styleName = templateId === 'simple' ? '简约风格' :
    templateId === 'business' ? '商务风格' :
    templateId === 'lively' ? '活泼风格' :
    templateId === 'academic' ? '学术风格' : '杂志风格';

  return `# ${styleName}排版指南

## 配色方案
- 主色调：${primaryColor}
- 背景色系：${config.colorSchemes.join(', ')}

## 使用建议
${config.useEmojiDecorations ? '- 适当使用 emoji 增强表达\n- 使用轻松友好的语调' : '- 避免使用 emoji，保持专业\n- 使用简洁的配色方案'}

## HTML 示例

${examples}

## 注意事项
1. 所有样式使用内嵌 style 属性
2. 确保兼容微信公众号的 HTML 限制
3. 使用十六进制颜色值（#ffffff）
4. 避免使用 CSS 渐变、box-shadow 等不支持的属性
`;
}
