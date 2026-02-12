/**
 * AI Prompts for layout generation
 * Provides template-specific guidance for AI to generate structured content with layout components
 */

import type { TemplateId, AnyTemplateId } from '@/types/ai';
import { getTemplateById } from '@/lib/templateStorage';

/**
 * Base layout syntax documentation for AI
 */
const LAYOUT_SYNTAX_DOCS = `# 可用布局组件语法

## ⚠️ 重要格式要求

1. **列表格式**：在布局组件内使用连字符（-）开头的无序列表，不要使用 A. B. C. 或 1. 2. 3. 格式
2. **标签格式**：文章末尾的标签应该使用普通文本格式，不要使用井号（#）前缀
3. **组件内容**：组件内的内容使用标准 Markdown 语法，包括加粗、斜体、代码等

## 卡片组件 (Card)
用于包装相关内容，提供视觉分组

\`\`\`markdown
:::card variant="default" title="标题"
卡片内的**加粗内容**和*斜体内容*
:::

:::card variant="primary" title="重要提示"
使用品牌色边框的卡片
:::

:::card variant="gradient" title="渐变卡片"
带有渐变背景的卡片
:::
\`\`\`

## 信息框组件 (Info Box)
用于突出显示提示、警告、笔记等信息

\`\`\`markdown
:::tip
**提示**：这是重要的提示信息
:::

:::warning
⚠️ **警告**：请注意检查
:::

:::success
✓ **成功**：操作完成
:::

:::error
✕ **错误**：出错了
:::

:::note
📝 **笔记**：记录内容
:::

:::quote
"这是**引用的金句**内容"
:::
\`\`\`

## 重点区域组件 (Highlight)
用于展示结构化内容

### 编号列表 (使用 - 开头，不要用数字)
\`\`\`markdown
:::numbered
- 第一点：说明内容
- 第二点：**重点强调**
- 第三点：继续说明
:::
\`\`\`

### 流程步骤
\`\`\`markdown
:::process
- 第一步：准备工作
- 第二步：执行操作
- 第三步：完成验证
:::
\`\`\`

### 时间线
\`\`\`markdown
:::timeline
- 2020年：项目启动
- 2021年：产品发布
- 2022年：用户增长
:::
\`\`\`

### 引出框
\`\`\`markdown
:::callout title="核心观点"
重要的**核心观点**内容，可以使用markdown格式
:::
\`\`\`

### 对比表格
\`\`\`markdown
:::comparison
选项 A | 选项 B
**优点1** | **优点1**
**缺点1** | **缺点1**
:::
\`\`\`

## 分割线组件 (Divider)
用于分隔不同章节

\`\`\`markdown
---style=solid---
---style=dashed---
---style=dotted---
---style=gradient---
---style=dashed text="章节标题"---
\`\`\`

## 使用原则
1. 根据内容类型选择合适的组件
2. 不要过度使用布局组件（通常3-5个组件即可）
3. 布局组件应该服务于内容表达，而非纯装饰
4. 保持整体视觉风格一致
5. **所有列表使用 - 开头，不要用 A. B. C. 或数字编号**
`;

/**
 * Get comprehensive AI prompt for layout generation
 */
export function getLayoutPrompt(templateId: AnyTemplateId, userContent?: string): string {
  // Check if it's a custom template
  const customTemplate = getTemplateById(templateId);
  const isCustom = customTemplate && 'source' in customTemplate;

  let templatePrompt: string;
  let styleName = '';

  if (isCustom) {
    // Use custom template's layout prompt if available, otherwise fall back to system prompt
    templatePrompt = customTemplate.layoutPrompt || customTemplate.systemPrompt || '';
    styleName = customTemplate.name;
  } else {
    templatePrompt = getTemplateLayoutPrompt(templateId as TemplateId);
    styleName = templateId === 'simple' ? '简约' : templateId === 'business' ? '商务' : templateId === 'lively' ? '活泼' : templateId === 'academic' ? '学术' : '杂志';
  }

  const basePrompt = `${LAYOUT_SYNTAX_DOCS}

${templatePrompt}

`;

  if (userContent) {
    return `${basePrompt}

# 输出格式提醒

在生成内容前，请再次确认：
- 所有列表使用 \`-\` 开头，不要用 A. B. C. 或 1. 2. 3.
- 标签使用普通文本，如"相关标签：技术、AI"
- 组件内可使用 **加粗**、*斜体* 等markdown语法

---

# 待优化内容

${userContent}

# 要求
请根据以上内容和${styleName}风格要求，使用合适的布局组件重新组织和呈现内容。
`;
  }

  return basePrompt;
}

/**
 * Get template-specific layout prompt
 */
function getTemplateLayoutPrompt(templateId: TemplateId): string {
  const prompts: Record<TemplateId, string> = {
    simple: `# 简约风格排版指南

## 特点
- 清晰简洁，注重信息传达
- 使用基础的卡片和信息框
- 简洁的实线分割线
- 避免过度装饰

## 推荐组件
- **卡片**: 使用 default 变体
- **信息框**: tip, note
- **重点区域**: numbered
- **分割线**: solid

## 示例结构
\`\`\`markdown
# 文章标题

简要介绍文章主题...

---

## 主要内容

:::tip
**提示**：这里是重要的提示信息
:::

正文段落使用**加粗**强调重点...

---

## 核心要点

:::numbered
- 第一点：**关键内容**说明
- 第二点：详细解释
- 第三点：补充信息
:::

---

## 总结

总结全文内容...
\`\`\`

## 注意事项
- 保持简洁，避免过度装饰
- 优先使用基础组件
- 不要使用渐变和阴影效果
- 列表使用 - 开头，不要用 A. B. C.
`,

    business: `# 商务风格排版指南

## 特点
- 专业稳重，结构化表达
- 使用规范的章节编号
- 添加摘要和总结
- 适合展示数据和专业观点

## 推荐组件
- **卡片**: primary, bordered
- **信息框**: tip, note, quote
- **重点区域**: numbered, process, comparison
- **分割线**: solid, dashed

## 示例结构
\`\`\`markdown
# 文章标题

:::card variant="bordered" title="摘要"
本文概述**核心观点**和主要内容...
:::

---

## 01 前言

介绍背景和目的...

---

## 02 核心观点

:::numbered
- 观点一：**详细说明**
- 观点二：补充解释
- 观点三：总结提炼
:::

---

## 03 对比分析

:::comparison
传统方案 | 创新方案
**特点1** | **特点1**
**优势1** | **优势1**
**局限性** | **突破点**
:::

---

## 04 结语

总结全文并展望...

\`\`\`

## 注意事项
- 使用章节编号（01、02、03...）
- 添加引用框展示观点
- 使用表格展示数据
- 保持专业严谨的语调
- 列表使用 - 开头格式
`,

    lively: `# 活泼风格排版指南

## 特点
- 轻松有趣，视觉丰富
- 使用 emoji 和图标
- 渐变和阴影效果
- 引导互动的结尾

## 推荐组件
- **卡片**: gradient, shadow, primary
- **信息框**: tip, warning, success
- **重点区域**: callout, numbered
- **分割线**: dashed, gradient

## 示例结构
\`\`\`markdown
# 🎯 文章标题

:::card variant="gradient" title="💡 开篇"
引人入胜的**开头内容**...
:::

---

## 📖 章节标题

:::tip
**小贴士**：实用的提示信息
:::

正文内容... ✨ 使用**加粗**强调

---

## 🚀 行动步骤

:::process
- 第一步：**准备**工作说明
- 第二步：**执行**详细步骤
- 第三步：**验证**结果
:::

---

## 💬 互动时间

你有什么想法？欢迎在评论区分享！

👍 觉得有用就点个赞吧！

相关标签：GLM-5、AI智能体、黑科技
\`\`\`

## 注意事项
- 适当使用 emoji 增强表达
- 使用轻松友好的语调
- 可以使用渐变和阴影效果
- 添加引导互动的元素
- 标签使用普通文本格式，不要用#号
- 列表使用 - 开头
`,

    academic: `# 学术风格排版指南

## 特点
- 严谨规范，逻辑严密
- 使用引用和脚注
- 添加摘要和关键词
- 专业术语注释

## 推荐组件
- **卡片**: bordered, default
- **信息框**: note, quote
- **重点区域**: timeline, comparison
- **分割线**: solid

## 示例结构
\`\`\`markdown
# 文章标题

:::card variant="bordered" title="摘要"
本研究探讨**核心问题**...

**关键词**：关键词1、关键词2、关键词3
:::

---

## 01 引言

研究背景和问题陈述...

:::note
📝 **术语定义**：重要概念的学术定义
:::

---

## 02 文献综述

:::quote
"这是**引用的学术观点**或研究结论"
:::

---

## 03 研究历程

:::timeline
- 2020年：相关研究**起步**
- 2021年：理论**突破**
- 2022年：实践**应用**
:::

---

## 04 结论

研究总结...

:::note
**启示**：对未来研究的启示
:::

相关研究：学术研究、理论框架
\`\`\`

## 注意事项
- 使用规范的引用格式
- 专业术语首次出现时注释
- 保持客观中立语调
- 使用脚注标注数据来源
- 列表使用 - 开头格式
- 关键词用普通文本
`,

    magazine: `# 杂志风格排版指南

## 特点
- 精美排版，视觉层次
- 使用大标题和引用
- 多样化的视觉元素
- 控制阅读节奏

## 推荐组件
- **卡片**: shadow, glass, gradient
- **信息框**: quote, tip
- **重点区域**: callout, timeline
- **分割线**: gradient, solid

## 示例结构
\`\`\`markdown
# 文章标题

:::quote
"导语：用一两句话概括**文章精华**内容"
:::

---style=gradient---

## 第一章：章节标题

:::card variant="shadow" title="核心观点"
重要观点的**详细阐述**...
:::

---

### 关键洞察

:::callout title="为什么重要"
解释**重要性**和影响...
:::

---

## 发展历程

:::timeline
- 起源：故事的**开始**
- 发展：过程中的**转折**
- 现在：当前的**状态**
:::

---style=gradient---

## 延伸阅读

推荐相关内容...

相关主题：深度阅读、专题探讨
\`\`\`

## 注意事项
- 使用吸引人的导语
- 用视觉元素控制阅读节奏
- 关键段落使用特殊标记
- 添加延伸阅读推荐
- 使用毛玻璃和阴影效果
- 列表使用 - 开头
- 主题标签用普通文本
`,
  };

  return prompts[templateId] || prompts.simple;
}

/**
 * Get layout optimization prompt for AI
 */
export function getLayoutOptimizationPrompt(
  templateId: AnyTemplateId,
  content: string
): string {
  return `# 布局优化任务

## ⚠️ 关键格式要求（必须遵守）

1. **列表格式**：所有列表（编号列表、流程步骤、时间线等）必须使用 \`-\` 或 \`*\` 开头，**严禁使用** A. B. C. 或 1. 2. 3. 格式
   - ✅ 正确：\`- 第一点内容\`
   - ❌ 错误：\`A. 第一点内容\` 或 \`1. 第一点内容\`

2. **标签格式**：文章末尾的标签使用普通文本格式，不要用 \`\`#标签\`\` 格式
   - ✅ 正确：\`相关标签：人工智能、深度学习\`
   - ❌ 错误：\`#人工智能 #深度学习\`

3. **组件内Markdown**：布局组件内的内容使用标准Markdown语法
   - **加粗**：\`\`**文字**\`\`
   - *斜体*：\`\`*文字*\`\`
   - \`代码\`：\`\`\`代码\`\`\`

## 任务说明

请将以下内容优化为结构清晰、视觉美观的公众号文章，使用适当的布局组件。

${getLayoutPrompt(templateId, content)}`;
}

/**
 * Get layout quick reference for AI
 */
export function getLayoutQuickReference(): string {
  return `# 布局组件快速参考

## 卡片
:::card variant="default|primary|gradient|shadow|bordered|glass" title="标题"
内容
:::

## 信息框
:::tip|warning|success|error|note|quote
内容
:::

## 重点区域
:::numbered|process|timeline|callout|comparison
内容
:::

## 分割线
---style=solid|dashed|dotted|gradient---
`;
}
