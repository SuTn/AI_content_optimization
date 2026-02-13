/**
 * AI Prompts for layout generation
 * Provides template-specific guidance for AI to generate structured content with HTML inline styles
 */

import type { TemplateId, AnyTemplateId } from '@/types/ai';
import { getTemplateById } from '@/lib/templateStorage';

/**
 * HTML inline style guide for AI
 * This guide teaches AI to generate WeChat-compatible HTML with inline styles
 */
const HTML_STYLE_GUIDE = `# HTML 内嵌样式指南

## 样式原则

1. **所有样式必须使用内嵌 \`style\` 属性**
2. **不使用外部 CSS 类或自定义标签**
3. **确保兼容微信公众号的 HTML 限制**

## 可用的样式模式

### 信息框（Info Box）

使用带边框和背景色的 \`div\` 元素：

\`\`\`html
<!-- 蓝色提示框 -->
<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.1em;">💡 提示：</strong><br>
  这里是提示信息内容...
</div>

<!-- 黄色警告框 -->
<div style="background-color: #fff9db; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  ⚠️ <strong>注意：</strong> 这里是警告信息
</div>

<!-- 绿色成功框 -->
<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  ✅ <strong>成功：</strong> 操作已完成
</div>

<!-- 红色错误框 -->
<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  ✕ <strong>错误：</strong> 发生错误
</div>

<!-- 灰色笔记框 -->
<div style="background-color: #fafafa; border-left: 4px solid #8c8c8c; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  📝 <strong>笔记：</strong> 记录内容
</div>

<!-- 紫色引用框 -->
<div style="background-color: #f9f0ff; border-left: 4px solid #722ed1; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
  "这是**引用的金句**内容"
</div>
\`\`\`

### 卡片（Card）

使用带边框和内边距的 \`div\` 元素：

\`\`\`html
<!-- 默认卡片 -->
<div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #ffffff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px;">卡片标题</strong>
  卡片内容...
</div>

<!-- 品牌色边框卡片 -->
<div style="border: 2px solid #1890ff; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #f7fbff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px; color: #1890ff;">重要提示</strong>
  卡片内容...
</div>

<!-- 浅色背景卡片 -->
<div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 16px 0; background-color: #fafafa;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 12px;">卡片内容</strong>
  这是浅色背景的卡片样式...
</div>
\`\`\`

### 分割线（Divider）

使用 \`hr\` 或带样式的 \`div\`：

\`\`\`html
<!-- 实线分割线 -->
<hr>

<!-- 虚线分割线 -->
<div style="border-top: 1px dashed #ccc; margin: 20px 0;"></div>

<!-- 点线分割线 -->
<div style="border-top: 1px dotted #ccc; margin: 20px 0;"></div>

<!-- 带文字的分割线（使用 table） -->
<table style="width: 100%; margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td style="border-top: 1px solid #e8e8e8;"></td>
    <td style="padding: 0 16px; color: #666; font-size: 14px; white-space: nowrap;">章节标题</td>
    <td style="border-top: 1px solid #e8e8e8;"></td>
  </tr>
</table>
\`\`\`

### 步骤列表（Steps）

使用 flex 布局的 \`div\` 容器：

\`\`\`html
<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 步骤一：准备工作
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">⏳</span> 步骤二：执行操作
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">🎉</span> 步骤三：完成验证
  </div>
</div>
\`\`\`

### 时间线（Timeline）

使用类似的 flex 布局：

\`\`\`html
<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">2020年</span>
    <span>项目启动</span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">2021年</span>
    <span>产品发布</span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">2022年</span>
    <span>用户增长</span>
  </div>
</div>
\`\`\`

### 对比表格（Comparison）

使用标准 HTML \`table\`：

\`\`\`html
<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
  <tr>
    <th style="background-color: #1890ff; color: #fff; padding: 12px; font-weight: bold;">选项 A</th>
    <th style="background-color: #1890ff; color: #fff; padding: 12px; font-weight: bold;">选项 B</th>
  </tr>
  <tr>
    <td style="padding: 12px; border: 1px solid #e8e8e8;">优点内容</td>
    <td style="padding: 12px; border: 1px solid #e8e8e8;">优点内容</td>
  </tr>
</table>
\`\`\`

## 微信公众号样式限制

- ❌ 不支持：CSS 渐变（linear-gradient）、box-shadow、overflow、rgba 颜色
- ✅ 支持：内嵌 style 属性、基础 CSS 属性
- ✅ 使用：十六进制颜色值（#ffffff）
- ✅ 使用：em、px、% 单位
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

  const basePrompt = `${HTML_STYLE_GUIDE}

${templatePrompt}

`;

  if (userContent) {
    return `${basePrompt}

---

# 待优化内容

${userContent}

# 要求
请根据以上内容和${styleName}风格要求，使用合适的 HTML 内嵌样式重新组织和呈现内容。
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

## 推荐样式
- **信息框**: 使用蓝色、灰色提示框
- **卡片**: 使用默认白色背景卡片
- **分割线**: 使用标准 hr 标签
- **配色**: 使用浅灰色系（#f0f9ff, #fafafa）

## 示例结构
\`\`\`html
<h1>文章标题</h1>

<p>简要介绍文章主题...</p>

<hr>

<h2>主要内容</h2>

<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.1em;">💡 提示：</strong><br>
  这里是重要的提示信息
</div>

<p>正文段落使用<strong>加粗</strong>强调重点...</p>

<hr>

<h2>核心要点</h2>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 第一点：关键内容说明
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 第二点：详细解释
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 第三点：补充信息
  </div>
</div>

<hr>

<h2>总结</h2>

<p>总结全文内容...</p>
\`\`\`

## 注意事项
- 保持简洁，避免过度装饰
- 优先使用基础组件
- 使用浅色配色方案
`,

    business: `# 商务风格排版指南

## 特点
- 专业稳重，结构化表达
- 使用规范的章节编号
- 添加摘要和总结
- 适合展示数据和专业观点

## 推荐样式
- **信息框**: 使用蓝色、紫色提示框和引用框
- **卡片**: 使用品牌色边框卡片
- **分割线**: 使用实线或虚线
- **配色**: 使用专业蓝色系（#1890ff, #f0f9ff）

## 示例结构
\`\`\`html
<h1>文章标题</h1>

<div style="border: 2px solid #1890ff; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #f7fbff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px; color: #1890ff;">摘要</strong>
  本文概述<strong>核心观点</strong>和主要内容...
</div>

<hr>

<h2>01 前言</h2>

<p>介绍背景和目的...</p>

<hr>

<h2>02 核心观点</h2>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">1️⃣</span> 观点一：详细说明
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">2️⃣</span> 观点二：补充解释
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">3️⃣</span> 观点三：总结提炼
  </div>
</div>

<hr>

<h2>03 对比分析</h2>

<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
  <tr>
    <th style="background-color: #1890ff; color: #fff; padding: 12px; font-weight: bold;">传统方案</th>
    <th style="background-color: #1890ff; color: #fff; padding: 12px; font-weight: bold;">创新方案</th>
  </tr>
  <tr>
    <td style="padding: 12px; border: 1px solid #e8e8e8;"><strong>特点1</strong></td>
    <td style="padding: 12px; border: 1px solid #e8e8e8;"><strong>特点1</strong></td>
  </tr>
  <tr>
    <td style="padding: 12px; border: 1px solid #e8e8e8;"><strong>优势1</strong></td>
    <td style="padding: 12px; border: 1px solid #e8e8e8;"><strong>优势1</strong></td>
  </tr>
</table>

<hr>

<h2>04 结语</h2>

<p>总结全文并展望...</p>
\`\`\`

## 注意事项
- 使用章节编号（01、02、03...）
- 添加引用框展示观点
- 使用表格展示数据
- 保持专业严谨的语调
`,

    lively: `# 活泼风格排版指南

## 特点
- 轻松有趣，视觉丰富
- 使用 emoji 和图标
- 引导互动的结尾
- 使用彩色信息框

## 推荐样式
- **信息框**: 使用蓝色、黄色、绿色彩色信息框
- **卡片**: 使用品牌色边框卡片
- **分割线**: 使用虚线
- **配色**: 使用多彩配色（#f0f9ff, #fff9db, #f0fdf4）

## 示例结构
\`\`\`html
<h1>🎯 文章标题</h1>

<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.2em;">💡 开篇</strong><br>
  引人入胜的<strong>开头内容</strong>...
</div>

<hr>

<h2>📖 章节标题</h2>

<div style="background-color: #fff9db; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  ⚠️ <strong>注意：</strong> 实用的小贴士
</div>

<p>正文内容... ✨ 使用<strong>加粗</strong>强调</p>

<hr>

<h2>🚀 行动步骤</h2>

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

<hr>

<h2>💬 互动时间</h2>

<p>你有什么想法？欢迎在评论区分享！</p>

<p>👍 觉得有用就点个赞吧！</p>

<p>相关标签：GLM-5、AI智能体、黑科技</p>
\`\`\`

## 注意事项
- 适当使用 emoji 增强表达
- 使用轻松友好的语调
- 使用彩色信息框
- 添加引导互动的元素
`,

    academic: `# 学术风格排版指南

## 特点
- 严谨规范，逻辑严密
- 使用引用和脚注
- 添加摘要和关键词
- 专业术语注释

## 推荐样式
- **信息框**: 使用灰色笔记框和紫色引用框
- **卡片**: 使用双线边框卡片
- **分割线**: 使用标准实线
- **配色**: 使用专业灰色系（#fafafa, #f9f0ff）

## 示例结构
\`\`\`html
<h1>文章标题</h1>

<div style="border: 3px double #d4d4d4; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #fafafa;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 12px;">摘要</strong>
  本研究探讨<strong>核心问题</strong>...<br><br>
  <strong>关键词：</strong>关键词1、关键词2、关键词3
</div>

<hr>

<h2>01 引言</h2>

<p>研究背景和问题陈述...</p>

<div style="background-color: #fafafa; border-left: 4px solid #8c8c8c; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  📝 <strong>术语定义：</strong> 重要概念的学术定义
</div>

<hr>

<h2>02 文献综述</h2>

<div style="background-color: #f9f0ff; border-left: 4px solid #722ed1; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
  "这是<strong>引用的学术观点</strong>或研究结论"
</div>

<hr>

<h2>03 研究历程</h2>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">2020年</span>
    <span>相关研究<strong>起步</strong></span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">2021年</span>
    <span>理论<strong>突破</strong></span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">2022年</span>
    <span>实践<strong>应用</strong></span>
  </div>
</div>

<hr>

<h2>04 结论</h2>

<p>研究总结...</p>

<div style="background-color: #fafafa; border-left: 4px solid #8c8c8c; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  📝 <strong>启示：</strong> 对未来研究的启示
</div>

<p>相关研究：学术研究、理论框架</p>
\`\`\`

## 注意事项
- 使用规范的引用格式
- 专业术语首次出现时注释
- 保持客观中立语调
- 使用脚注标注数据来源
`,

    magazine: `# 杂志风格排版指南

## 特点
- 精美排版，视觉层次
- 使用大标题和引用
- 多样化的视觉元素
- 控制阅读节奏

## 推荐样式
- **信息框**: 使用紫色引用框和蓝色提示框
- **卡片**: 使用品牌色边框卡片
- **分割线**: 使用实线或带文字的分割线
- **配色**: 使用优雅配色（#f9f0ff, #f0f9ff）

## 示例结构
\`\`\`html
<h1>文章标题</h1>

<div style="background-color: #f9f0ff; border-left: 4px solid #722ed1; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
  "导语：用一两句话概括<strong>文章精华</strong>内容"
</div>

<hr>

<h2>第一章：章节标题</h2>

<div style="border: 2px solid #1890ff; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #f7fbff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px; color: #1890ff;">💡 核心观点</strong>
  重要观点的<strong>详细阐述</strong>...
</div>

<hr>

<h3>关键洞察</h3>

<div style="border: 2px solid #1890ff; background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 12px; color: #1890ff;">为什么重要</strong>
  解释<strong>重要性</strong>和影响...
</div>

<hr>

<h2>发展历程</h2>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">起源</span>
    <span>故事的<strong>开始</strong></span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">发展</span>
    <span>过程中的<strong>转折</strong></span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">现在</span>
    <span>当前的<strong>状态</strong></span>
  </div>
</div>

<hr>

<h2>延伸阅读</h2>

<p>推荐相关内容...</p>

<p>相关主题：深度阅读、专题探讨</p>
\`\`\`

## 注意事项
- 使用吸引人的导语
- 用视觉元素控制阅读节奏
- 关键段落使用特殊标记
- 添加延伸阅读推荐
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

## 任务说明

请将以下内容优化为结构清晰、视觉美观的公众号文章，使用适当的 HTML 内嵌样式。

${getLayoutPrompt(templateId, content)}`;
}

/**
 * Get layout quick reference for AI
 */
export function getLayoutQuickReference(): string {
  return `# HTML 内嵌样式快速参考

## 信息框
\`<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px;">...\div>\`

## 卡片
\`<div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px;">...</div>\`

## 分割线
\`<hr>\` 或 \`<div style="border-top: 1px dashed #ccc; margin: 20px 0;"></div>\`

## 步骤列表
\`<div style="display: flex; align-items: baseline;"><span>✅</span> 内容</div>\`

## 时间线
\`<div style="display: flex; align-items: baseline;"><span style="min-width: 100px;">时间</span><span>事件</span></div>\`

## 对比表格
\`<table style="width: 100%; border-collapse: collapse;">...</table>\`
`;
}
