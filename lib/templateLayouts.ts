/**
 * Template-specific layout configurations
 * Defines the preferred layout components and styling for each template
 */

import type { TemplateLayoutConfig, TemplateId } from '@/types/layout';

/**
 * Template layout configurations
 */
export const TEMPLATE_LAYOUTS: Record<TemplateId, TemplateLayoutConfig> = {
  simple: {
    preferredCardVariants: ['default'],
    preferredInfoBoxTypes: ['note', 'tip'],
    preferredHighlightTypes: ['numbered'],
    preferredDividerStyles: ['solid'],
    defaultComponents: [],
    useEmojiDecorations: false,
    useGradients: false,
  },

  business: {
    preferredCardVariants: ['bordered', 'primary'],
    preferredInfoBoxTypes: ['tip', 'note', 'quote'],
    preferredHighlightTypes: ['numbered', 'process', 'comparison'],
    preferredDividerStyles: ['solid', 'dashed'],
    defaultComponents: [
      {
        type: 'infobox',
        config: {
          type: 'tip',
          title: '核心要点',
        },
      },
    ],
    useEmojiDecorations: false,
    useGradients: false,
  },

  lively: {
    preferredCardVariants: ['gradient', 'shadow', 'primary'],
    preferredInfoBoxTypes: ['tip', 'warning', 'success'],
    preferredHighlightTypes: ['callout', 'numbered'],
    preferredDividerStyles: ['dashed', 'gradient'],
    defaultComponents: [
      {
        type: 'infobox',
        config: {
          type: 'tip',
          title: '小贴士',
        },
      },
      {
        type: 'divider',
        config: {
          style: 'dashed',
        },
      },
    ],
    useEmojiDecorations: true,
    useGradients: true,
  },

  academic: {
    preferredCardVariants: ['bordered', 'default'],
    preferredInfoBoxTypes: ['note', 'quote'],
    preferredHighlightTypes: ['timeline', 'comparison'],
    preferredDividerStyles: ['solid'],
    defaultComponents: [
      {
        type: 'card',
        config: {
          variant: 'bordered',
          title: '摘要',
        },
      },
    ],
    useEmojiDecorations: false,
    useGradients: false,
  },

  magazine: {
    preferredCardVariants: ['shadow', 'glass', 'gradient'],
    preferredInfoBoxTypes: ['quote', 'tip'],
    preferredHighlightTypes: ['callout', 'timeline'],
    preferredDividerStyles: ['gradient', 'solid'],
    defaultComponents: [
      {
        type: 'infobox',
        config: {
          type: 'quote',
          title: '导语',
        },
      },
      {
        type: 'divider',
        config: {
          style: 'gradient',
        },
      },
    ],
    useEmojiDecorations: true,
    useGradients: true,
  },
};

/**
 * Get layout configuration for a template
 */
export function getTemplateLayoutConfig(templateId: TemplateId): TemplateLayoutConfig {
  return TEMPLATE_LAYOUTS[templateId] || TEMPLATE_LAYOUTS.simple;
}

/**
 * Get default primary color for a template
 */
export function getTemplatePrimaryColor(templateId: TemplateId): string {
  const colors: Record<TemplateId, string> = {
    simple: '#333333',
    business: '#1890ff',
    lively: '#ff6b6b',
    academic: '#5c4b8a',
    magazine: '#e91e63',
  };
  return colors[templateId] || colors.simple;
}

/**
 * Get markdown syntax examples for a template
 */
export function getTemplateSyntaxExamples(templateId: TemplateId): string {
  const config = getTemplateLayoutConfig(templateId);
  const primaryColor = getTemplatePrimaryColor(templateId);

  let examples = '';

  // Card examples
  if (config.preferredCardVariants.length > 0) {
    const variant = config.preferredCardVariants[0];
    examples += `\n## 卡片示例\n\n:::card variant="${variant}" title="卡片标题"\n卡片内容\n:::\n\n`;
  }

  // Info box examples
  if (config.preferredInfoBoxTypes.length > 0) {
    const type = config.preferredInfoBoxTypes[0];
    const titles: Record<string, string> = {
      tip: '提示',
      warning: '注意',
      success: '成功',
      error: '错误',
      note: '笔记',
      quote: '引用',
    };
    examples += `:::${type}\n${titles[type] || '信息'}内容\n:::\n\n`;
  }

  // Highlight examples
  if (config.preferredHighlightTypes.includes('numbered')) {
    examples += `:::numbered\n- 第一点\n- 第二点\n- 第三点\n:::\n\n`;
  }

  if (config.preferredHighlightTypes.includes('process')) {
    examples += `:::process\n- 步骤一\n- 步骤二\n- 步骤三\n:::\n\n`;
  }

  // Divider examples
  if (config.preferredDividerStyles.length > 0) {
    const style = config.preferredDividerStyles[0];
    examples += `---style=${style}---\n\n`;
  }

  return examples;
}

/**
 * Get AI prompt template for layout generation
 */
export function getLayoutPrompt(templateId: TemplateId): string {
  const config = getTemplateLayoutConfig(templateId);
  const examples = getTemplateSyntaxExamples(templateId);

  return `请使用以下布局组件语法来优化内容结构：

## 可用布局组件

### 卡片 (Card)
\`\`\`markdown
:::card variant="default|primary|gradient|shadow|bordered|glass" title="标题"
卡片内容
:::
\`\`\`

### 信息框 (Info Box)
\`\`\`markdown
:::tip
提示信息
:::

:::warning
警告信息
:::

:::success
成功信息
:::

:::error
错误信息
:::

:::note
笔记内容
:::

:::quote
引用内容
:::
\`\`\`

### 重点区域 (Highlight)
\`\`\`markdown
:::numbered
- 第一点
- 第二点
:::

:::process
- 步骤一
- 步骤二
:::

:::timeline
- 事件一
- 事件二
:::

:::callout title="标题"
内容
:::
\`\`\`

### 分割线 (Divider)
\`\`\`markdown
---style=solid---
---style=dashed---
---style=dotted---
---style=gradient---
---style=dashed text="文字"---
\`\`\`

## ${templateId === 'simple' ? '简约风格' : templateId === 'business' ? '商务风格' : templateId === 'lively' ? '活泼风格' : templateId === 'academic' ? '学术风格' : '杂志风格'}示例

${examples || '使用简洁的 Markdown 格式，保持内容清晰易读。'}

## 注意事项
1. 根据内容类型选择合适的布局组件
2. 不要过度使用布局组件，保持内容简洁
3. 确保布局组件服务于内容表达，而非装饰
4. ${config.useEmojiDecorations ? '适当使用 emoji 增强表达' : '避免使用 emoji，保持专业'}
5. ${config.useGradients ? '可以使用渐变效果增强视觉吸引力' : '使用简洁的配色方案'}
`;
}
