/**
 * AI optimization feature types
 */

export type AIProvider = 'openai' | 'qwen' | 'wenxin' | 'doubao' | 'glm' | 'custom';

export type TemplateId = 'simple' | 'business' | 'lively' | 'academic' | 'magazine';

// Template source type
export type TemplateSource = 'builtin' | 'custom';

// Template ID type that includes custom IDs
export type AnyTemplateId = TemplateId | `custom_${number}`;

// Layout component preferences for templates
export interface TemplateLayoutConfig {
  cardStyle?: 'default' | 'primary' | 'gradient' | 'shadow' | 'bordered' | 'glass';
  infoBoxTypes?: string[];
  highlightAreas?: string[];
  dividerStyles?: string[];
  decorativeElements?: boolean;
}

/**
 * Custom template configuration
 */
export interface CustomTemplateConfig {
  id: string;                    // Format: custom_<timestamp>
  name: string;
  description: string;
  icon: string;

  // Fully configurable content
  systemPrompt: string;            // AI system prompt
  layoutPrompt: string;            // Layout guidance prompt
  exampleOutput: string;           // Example output
  features: string[];              // Feature tags

  // Optional configuration
  aiConfig?: Partial<AIConfig>;     // AI parameter override
  layoutPreferences?: TemplateLayoutConfig;  // Layout component preferences

  // Metadata
  source: TemplateSource;
  createdAt: number;
  updatedAt: number;
  version: number;
}

/**
 * Template version entry for version history
 */
export interface TemplateVersion {
  id: string;
  templateId: string;
  config: CustomTemplateConfig;
  createdAt: number;
  changeDescription?: string;
}

// Union type for both builtin and custom templates
export type AnyTemplateConfig = TemplateConfig | CustomTemplateConfig;

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
  templateId: AnyTemplateId;
  createdAt: number;
}

export interface OptimizationRequest {
  content: string;
  templateId: AnyTemplateId;
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

<p>简要介绍文章主题...</p>

<hr>

<h2>章节标题</h2>

<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.1em;">提示信息</strong>
</div>

<p>正文内容，<strong>重点词汇加粗</strong>。</p>

<hr>

<h2>另一个章节</h2>

<h3>子章节</h3>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 要点一
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 要点二
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 要点三
  </div>
</div>`,
  },
  business: {
    id: 'business',
    name: '商务风格',
    description: '专业稳重，适合商业分析、行业报告等专业内容',
    icon: '💼',
    features: ['结构化表达', '数据展示', '专业严谨', '卡片布局'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为商务专业风格。',
    exampleOutput: `# 文章标题

<div style="border: 2px solid #1890ff; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #f7fbff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px; color: #1890ff;">摘要</strong>
  本期聚焦：核心主题概览
</div>

<hr>

<h2>01 前言</h2>

<p>简要介绍文章背景和目的...</p>

<hr>

<h2>02 核心观点</h2>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">1️⃣</span> 观点一：详细说明
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">2️⃣</span> 观点二：详细说明
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">3️⃣</span> 观点三：详细说明
  </div>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
  <tr>
    <th style="background-color: #1890ff; color: #fff; padding: 12px; font-weight: bold;">传统方案</th>
    <th style="background-color: #1890ff; color: #fff; padding: 12px; font-weight: bold;">创新方案</th>
  </tr>
  <tr>
    <td style="padding: 12px; border: 1px solid #e8e8e8;">特点说明</td>
    <td style="padding: 12px; border: 1px solid #e8e8e8;">特点说明</td>
  </tr>
</table>

<hr>

<h2>03 结语</h2>

<p>总结性陈述...</p>`,
  },
  lively: {
    id: 'lively',
    name: '活泼风格',
    description: '轻松有趣，使用emoji增强表达，适合生活方式类内容',
    icon: '🎨',
    features: ['Emoji点缀', '轻松语调', '视觉丰富', '渐变卡片'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为活泼有趣风格。',
    exampleOutput: `# 🎯 标题

<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.2em;">💡 开篇</strong><br>
  吸引人的开头...
</div>

<hr>

<h2>📖 01 章节标题</h2>

<p>正文内容... ✨</p>

<div style="background-color: #fff9db; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  ⚠️ <strong>注意：</strong> 重要提醒
</div>

<hr>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 步骤一：开始
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">⏳</span> 步骤二：进行中
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">🎉</span> 步骤三：完成
  </div>
</div>

<hr>

<h2>💬 互动时间</h2>

<p>你有什么想法？欢迎在评论区分享！</p>

<p>👍 觉得有用就点个赞吧！</p>`,
  },
  academic: {
    id: 'academic',
    name: '学术风格',
    description: '严谨规范，适合学术论文、研究报告等严肃内容',
    icon: '📚',
    features: ['引用规范', '术语标注', '逻辑严密', '边框卡片'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为学术严谨风格。',
    exampleOutput: `# 文章标题

<div style="border: 3px double #d4d4d4; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #fafafa;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 12px;">摘要</strong>
  <strong>摘要</strong>：简要概述研究内容和结论...<br><br>
  <strong>关键词</strong>：关键词1、关键词2、关键词3
</div>

<hr>

<h2>01 引言</h2>

<p>研究背景和目的...</p>

<div style="background-color: #fafafa; border-left: 4px solid #8c8c8c; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  📝 <strong>术语定义：</strong> 重要术语的学术定义
</div>

<hr>

<h2>02 文献综述</h2>

<div style="background-color: #f9f0ff; border-left: 4px solid #722ed1; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
  "引用的重要观点"
</div>

<hr>

<h2>03 研究方法</h2>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">📊</span> 数据收集
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">📈</span> 数据分析
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✓</span> 结果验证
  </div>
</div>

<hr>

<h2>04 结论</h2>

<p>研究总结...</p>

<div style="background-color: #fafafa; border-left: 4px solid #8c8c8c; padding: 12px 15px; margin: 10px 0; border-radius: 0 6px 6px 0;">
  📝 <strong>启示：</strong> 对未来研究的启示
</div>`,
  },
  magazine: {
    id: 'magazine',
    name: '杂志风格',
    description: '精美排版，视觉丰富，适合深度报道、人物专访等内容',
    icon: '📰',
    features: ['视觉层次', '引用增强', '阅读节奏', '阴影卡片'],
    systemPrompt: '你是一个专业的公众号排版优化助手，擅长将内容优化为杂志精美风格。',
    exampleOutput: `# 文章标题

<div style="background-color: #f9f0ff; border-left: 4px solid #722ed1; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0;">
  "导语：用一两句话概括文章精华，吸引读者继续阅读"
</div>

<hr>

<h2>第一章：章节标题</h2>

<div style="border: 2px solid #1890ff; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #f7fbff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px; color: #1890ff;">💡 核心观点</strong>
  正文内容...
</div>

<hr>

<h3>关键洞察</h3>

<div style="border: 2px solid #1890ff; background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 12px; color: #1890ff;">为什么重要</strong>
  解释内容的重要性
</div>

<hr>

<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">起源</span>
    <span>开始的故事</span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">转折</span>
    <span>关键时刻</span>
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
    <span style="min-width: 100px; color: #666; font-size: 14px;">现在</span>
    <span>当前的状态</span>
  </div>
</div>

<hr>

<h2>延伸阅读</h2>

<p>推荐相关内容链接或书籍</p>`,
  },
};
