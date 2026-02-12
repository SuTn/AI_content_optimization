/**
 * AI optimization feature types
 */

export type AIProvider = 'openai' | 'qwen' | 'wenxin' | 'doubao' | 'glm' | 'custom';

export type TemplateId = 'simple' | 'business' | 'lively' | 'academic' | 'magazine';

export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  exampleOutput: string;
  features: string[];
}

export interface OptimizedVersion {
  id: string;
  articleId: string;
  originalContent: string;
  optimizedContent: string;
  templateId: TemplateId;
  createdAt: number;
}

export interface OptimizationRequest {
  content: string;
  templateId: TemplateId;
  config: AIConfig;
}

export interface OptimizationStreamChunk {
  type: 'content' | 'error' | 'done';
  data: string;
}

export interface ChunkInfo {
  index: number;
  total: number;
  content: string;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: false,
  provider: 'qwen',
  apiKey: '',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-plus',
  temperature: 0.7,
  maxTokens: 8000,
};

export const PROVIDER_CONFIGS: Record<AIProvider, { defaultBaseUrl: string; defaultModel: string; name: string }> = {
  openai: {
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    name: 'OpenAI',
  },
  qwen: {
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    name: '通义千问',
  },
  wenxin: {
    defaultBaseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    defaultModel: 'ernie-bot-4',
    name: '文心一言',
  },
  doubao: {
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-32k',
    name: '豆包',
  },
  glm: {
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    name: '智谱AI',
  },
  custom: {
    defaultBaseUrl: '',
    defaultModel: '',
    name: '自定义',
  },
};

export const MAX_INPUT_TOKENS = 12000; // Limit for input, reserve space for output
export const CHUNK_OVERLAP = 500; // Overlap between chunks for context
export const MAX_HISTORY_VERSIONS = 10; // Maximum optimization versions to keep

/**
 * Template configurations for AI optimization
 */
export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  simple: {
    id: 'simple',
    name: '简约风格',
    description: '清晰简洁，注重信息传达，适合技术文章和教程',
    icon: '📝',
    features: ['简洁分隔线', '重点加粗', '结构清晰', '基础卡片'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为简约清晰风格。',
    exampleOutput: `# 标题

---

## 章节标题

:::tip
提示信息
:::

正文内容，**重点词汇加粗**。

---

## 另一个章节

### 子章节

:::numbered
- 要点一
- 要点二
- 要点三
:::`,
  },
  business: {
    id: 'business',
    name: '商务风格',
    description: '专业稳重，适合商业分析、行业报告等专业内容',
    icon: '💼',
    features: ['结构化表达', '数据展示', '专业严谨', '卡片布局'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为商务专业风格。',
    exampleOutput: `# 文章标题

:::card variant="bordered" title="摘要"
本期聚焦：核心主题概览
:::

---

## 01 前言

简要介绍文章背景和目的...

---

## 02 核心观点

:::numbered
- 观点一：详细说明
- 观点二：详细说明
- 观点三：详细说明
:::

:::comparison
传统方案 | 创新方案
特点说明 | 特点说明
:::

---

## 03 结语

总结性陈述...`,
  },
  lively: {
    id: 'lively',
    name: '活泼风格',
    description: '轻松有趣，使用emoji增强表达，适合生活方式类内容',
    icon: '🎨',
    features: ['Emoji点缀', '轻松语调', '视觉丰富', '渐变卡片'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为活泼有趣风格。',
    exampleOutput: `# 🎯 标题

:::card variant="gradient" title="💡 开篇"
吸引人的开头...
:::

---

## 📖 01 章节标题

正文内容... ✨

:::warning
⚠️ 注意：重要提醒
:::

---

:::process
- 步骤一：开始
- 步骤二：进行中
- 步骤三：完成
:::

---

## 💬 互动时间

你有什么想法？欢迎在评论区分享！

👍 觉得有用就点个赞吧！`,
  },
  academic: {
    id: 'academic',
    name: '学术风格',
    description: '严谨规范，适合学术论文、研究报告等严肃内容',
    icon: '📚',
    features: ['引用规范', '术语标注', '逻辑严密', '边框卡片'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为学术严谨风格。',
    exampleOutput: `# 文章标题

:::card variant="bordered" title="摘要"
**摘要**：简要概述研究内容和结论...

**关键词**：关键词1、关键词2、关键词3
:::

---

## 01 引言

研究背景和目的...

:::note
📝 **术语定义**：重要术语的学术定义
:::

---

## 02 文献综述

:::quote
"引用的重要观点"
:::

---

## 03 研究方法

:::process
- 数据收集
- 数据分析
- 结果验证
:::

---

## 04 结论

研究总结...

:::note
**启示**：对未来研究的启示
:::`,
  },
  magazine: {
    id: 'magazine',
    name: '杂志风格',
    description: '精美排版，视觉丰富，适合深度报道、人物专访等内容',
    icon: '📰',
    features: ['视觉层次', '引用增强', '阅读节奏', '阴影卡片'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为杂志精美风格。',
    exampleOutput: `# 文章标题

---style=gradient---

:::quote
"导语：用一两句话概括文章精华，吸引读者继续阅读"
:::

---

## 第一章：章节标题

:::card variant="shadow" title="核心观点"
正文内容...
:::

---

### 关键洞察

:::callout title="为什么重要"
解释内容的重要性
:::

---

:::timeline
- 起源：开始的故事
- 转折：关键时刻
- 现在：当前的状态
:::

---style=gradient---

## 延伸阅读

推荐相关内容链接或书籍`,
  },
};
