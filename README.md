# 墨排 (Mopai)

> 本地运行的浏览器端 Markdown 编辑器，一键生成微信兼容 HTML，支持 AI 智能优化排版

**设计理念**：采用纯 HTML + 内嵌样式，确保微信公众号完美兼容

![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 特性

### 核心功能
- **实时预览**：左侧 Markdown 编辑，右侧实时显示微信样式预览
- **一键导出**：生成带完整内联样式的微信兼容 HTML，直接粘贴到公众号后台
- **本地存储**：所有数据存储在浏览器 localStorage，无需服务器
- **自动保存**：停止输入 1 秒后自动保存，永不丢失内容
- **文章管理**：支持新建、切换、删除文章，最多保留 50 篇历史

### 编辑器功能
- 原生 textarea，支持 Tab 缩进（自动转 2 空格）
- 工具栏快捷插入：粗体、斜体、标题、引用、列表、链接、图片、代码块
- 光标自动定位到插入内容
- 字数统计实时显示

### 样式自定义
- **字体大小**：14-20px 可调
- **行距**：1.4-2.0 可调
- **主色调**：预设颜色 + 自定义选择器
- 实时预览样式效果

### AI 智能优化 🚀
- **多模型支持**：OpenAI、通义千问、文心一言、豆包、智谱 AI、自定义
- **风格模板**：简约、商务、活泼、学术、杂志五种内置风格
- **自定义模板**：完全可配置的自定义模板系统
  - 自定义系统提示词、布局指导、示例输出
  - 配置布局组件偏好（卡片样式、信息框、重点区域等）
  - 版本历史管理（最多10个版本）
  - 导入/导出模板（JSON格式）
  - 模板分享功能
- **流式输出**：实时显示 AI 生成内容
- **历史版本**：保存优化历史，支持一键回退
- **智能分段**：长文自动分段处理，保持上下文连贯

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2 | React 框架，App Router |
| TypeScript | 5.0 | 类型安全 |
| Tailwind CSS | 3.4 | 样式框架 |
| marked | 9.1 | Markdown 解析 |
| DOMPurify | 3.0 | HTML 净化 |
| lucide-react | 0.300 | 图标库 |

## 📁 项目结构

```
wechat/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── optimize/
│   │       └── route.ts      # AI 优化 API 接口
│   ├── templates/
│   │   └── page.tsx        # 模板管理页面
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 主页面
│   └── globals.css           # 全局样式
│
├── components/               # React 组件
│   ├── Editor.tsx            # Markdown 编辑器
│   ├── Preview.tsx           # 微信样式预览
│   ├── Toolbar.tsx           # 顶部工具栏
│   ├── ArticleList.tsx       # 文章历史列表
│   ├── SettingPanel.tsx      # 样式设置面板
│   ├── AIConfigPanel.tsx     # AI 配置面板
│   ├── AIOptimizeButton.tsx  # AI 优化按钮
│   ├── TemplateSelector.tsx  # 风格模板选择器
│   ├── TemplateCard.tsx      # 模板卡片组件
│   ├── TemplateEditor.tsx    # 模板编辑器
│   ├── TemplateVersionHistory.tsx # 版本历史弹窗
│   ├── TemplateShareModal.tsx     # 模板分享弹窗
│   ├── TemplateImportModal.tsx    # 模板导入弹窗
│   └── AIPreviewModal.tsx    # 优化结果预览弹窗
│
├── hooks/                    # 自定义 Hooks
│   ├── useArticle.ts         # 当前文章状态管理
│   ├── useArticles.ts        # 文章列表管理
│   ├── useSettings.ts        # 用户设置管理
│   ├── useAIConfig.ts        # AI 配置管理
│   ├── useAIOptimize.ts      # AI 优化状态管理
│   └── useTemplates.ts      # 模板状态管理
│
├── lib/                      # 工具库
│   ├── storage.ts            # localStorage 操作封装
│   ├── templateStorage.ts    # 模板存储操作
│   ├── markdown.ts           # Markdown 基础解析（marked + DOMPurify）
│   ├── wechatStyle.ts        # 微信样式生成器（字体、行距、颜色）
│   ├── templateLayouts.ts    # 模板布局配置
│   ├── layoutComponents.ts   # 布局组件库（参考用，生成内嵌样式HTML）
│   ├── prompts/             # AI 提示词模板
│   │   └── layoutPrompts.ts # HTML 内嵌样式指南
│   └── utils.ts             # 工具函数
│
├── types/                    # TypeScript 类型定义
│   ├── index.ts              # 基础类型（Article, Settings 等）
│   └── ai.ts                 # AI 相关类型
│
├── .env.example              # 环境变量示例
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── tailwind.config.ts        # Tailwind CSS 配置
└── next.config.js            # Next.js 配置
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用

### 构建生产版本

```bash
npm run build
npm start
```

## ⚙️ 配置说明

### AI 优化配置

AI 优化功能需要配置大模型 API。在应用中点击「AI优化」按钮，选择「配置」：

1. **选择服务商**：自动填充默认配置
2. **输入 API Key**：从对应平台获取
3. **配置 API 地址**：使用默认或自定义中转地址
4. **选择模型**：根据服务商选择可用模型
5. **测试连接**：验证配置是否正确

#### 支持的服务商

| 服务商 | 默认 API 地址 | 推荐模型 |
|--------|-------------|---------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| 文心一言 | `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop` | `ernie-bot-4` |
| 豆包 | `https://ark.cn-beijing.volces.com/api/v3` | `doubao-pro-32k` |
| 智谱AI | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` |

#### 环境变量（可选）

创建 `.env` 文件（可选，也可在界面配置）：

```bash
# 通义千问示例
QWEN_API_KEY=sk-xxxxx
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen-plus
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=8000
```

## 📖 使用指南

### 基础编辑

1. **新建文章**：点击「新建」按钮创建新文章
2. **编辑内容**：左侧编辑器输入 Markdown 或 HTML
3. **实时预览**：右侧实时显示微信样式
4. **插入语法**：使用工具栏快捷插入 Markdown 语法
5. **自动保存**：停止输入 1 秒后自动保存

### HTML 样式指南

项目使用**纯 HTML + 内嵌样式**，确保与微信公众号完美兼容。AI 会自动生成带样式的 HTML，你也可以手动编写：

#### 信息框示例
```html
<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  <strong style="font-size: 1.1em;">💡 提示：</strong><br>
  这里是提示信息内容...
</div>
```

#### 卡片示例
```html
<div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #ffffff;">
  <strong style="font-size: 1.1em; display: block; margin-bottom: 8px;">卡片标题</strong>
  卡片内容...
</div>
```

#### 步骤列表示例
```html
<div style="margin: 15px 0;">
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">✅</span> 步骤一：准备工作
  </div>
  <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
    <span style="margin-right: 8px;">⏳</span> 步骤二：执行操作
  </div>
</div>
```

### 样式调整

1. 点击「设置」按钮打开样式面板
2. 调整字体大小、行距、主色调
3. 实时预览调整效果
4. 调整会自动应用到导出的 HTML

### 导出 HTML

1. 点击「复制HTML」按钮
2. 使用 Ctrl+V 粘贴到公众号后台
3. 样式完整保留，无需二次编辑

### AI 优化

1. 点击「AI优化」按钮
2. 选择优化风格模板（简约/商务/活泼/学术/杂志）或自定义模板
3. AI 会自动生成带内嵌样式的 HTML
4. 预览对比优化效果
5. 点击「应用优化」或选择历史版本

**AI 输出特点**：
- 直接生成带内嵌 `style` 属性的 HTML
- 所有样式都兼容微信公众号限制
- 不使用 CSS 渐变、rgba、box-shadow 等不支持的属性
- 使用十六进制颜色值（#ffffff）

### 模板管理 🎨

点击工具栏的文件图标进入模板管理页面，或选择模板时点击「管理模板」链接：

**内置模板**
- 查看5种预设风格模板
- 点击「复制」创建基于内置模板的自定义版本

**创建自定义模板**
1. 点击「新建模板」
2. 填写基本信息（图标、名称、描述）
3. 配置提示词：
   - **系统提示词**：定义 AI 角色和风格
   - **布局指导**：指定使用的 HTML 样式模式（信息框、卡片、步骤列表等）
   - **示例输出**：提供参考 HTML 示例
4. 配置 AI 参数（可选）
5. 预览并保存

**提示词指南**：
- AI 直接生成带内嵌 `style` 属性的 HTML
- 所有样式使用十六进制颜色值（#ffffff）
- 使用 `display: flex` 实现步骤列表和时间线
- 使用 `table` 标签实现对比表格
- 避免使用 `linear-gradient`、`box-shadow`、`overflow`、`rgba` 等微信不支持的属性

**模板操作**
- **编辑**：修改现有模板
- **复制**：快速创建模板副本
- **删除**：删除不需要的自定义模板
- **版本历史**：查看和恢复历史版本
- **导出**：导出单个或全部模板为 JSON
- **导入**：从 JSON 文件或剪贴板导入模板
- **分享**：复制模板 JSON 分享给他人

## 🏗️ 开发指南

### 添加新的优化风格

1. 在 `types/ai.ts` 中添加新的 `TemplateId` 类型
2. 在 `TEMPLATES` 中添加模板配置（包含 `exampleOutput` 的 HTML 示例）
3. 在 `lib/prompts/layoutPrompts.ts` 的 `getTemplateLayoutPrompt` 函数中添加对应的 prompt 模板
4. 在 `lib/templateLayouts.ts` 中添加模板的配色和 emoji 配置

### 添加新的大模型支持

1. 在 `types/ai.ts` 中添加新的 `AIProvider`
2. 在 `PROVIDER_CONFIGS` 中添加配置
3. 如需特殊处理，在 `app/api/optimize/route.ts` 中添加适配逻辑

### 自定义 HTML 样式

所有样式都通过内嵌 `style` 属性实现，确保微信兼容：

**信息框样式**
```html
<div style="background-color: #f0f9ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 0 8px 8px 0; margin: 10px 0;">
  内容
</div>
```

**卡片样式**
```html
<div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin: 12px 0; background-color: #ffffff;">
  内容
</div>
```

**步骤列表**
```html
<div style="display: flex; align-items: baseline; margin-bottom: 8px;">
  <span style="margin-right: 8px;">✅</span> 步骤内容
</div>
```

**注意**：微信公众号不支持以下 CSS 属性
- `linear-gradient`（使用纯色代替）
- `box-shadow`（使用边框代替）
- `overflow: hidden`
- `rgba` 颜色（使用十六进制颜色代替）

### localStorage 数据结构

```typescript
// 文章数据
Key: "mopai_v1"
{
  "currentId": "1707654321000",
  "articles": [
    {
      "id": "1707654321000",
      "title": "文章标题",
      "content": "# 文章标题\n\n正文...",
      "createdAt": 1707654321000,
      "updatedAt": 1707654389000
    }
  ],
  "settings": {
    "fontSize": 16,
    "lineHeight": 1.75,
    "primaryColor": "#576b95"
  }
}

// AI 配置
Key: "mopai_ai_config"
{
  "enabled": true,
  "provider": "qwen",
  "apiKey": "sk-xxx",
  "baseUrl": "https://...",
  "model": "qwen-plus",
  "temperature": 0.7,
  "maxTokens": 8000
}

// 优化历史
Key: "mopai_ai_history_{articleId}"
[
  {
    "id": "xxx",
    "articleId": "xxx",
    "originalContent": "...",
    "optimizedContent": "...",
    "templateId": "simple",
    "createdAt": 1707654321000
  }
]

// 模板数据
Key: "mopai_templates"
{
  "custom": [
    {
      "id": "custom_1707654321000",
      "name": "科技风格",
      "description": "适合科技类内容的排版",
      "icon": "🚀",
      "systemPrompt": "你是一个专业的排版助手...",
      "layoutPrompt": "## 推荐样式...",
      "exampleOutput": "<div style=\"...\">...</div>",
      "features": ["卡片", "信息框"],
      "source": "custom",
      "createdAt": 1707654321000,
      "updatedAt": 1707654389000,
      "version": 1
    }
  ],
  "builtin": ["simple", "business", "lively", "academic", "magazine"]
}

// 模板版本历史
Key: "mopai_template_versions_{templateId}"
{
  "templateId": "custom_1707654321000",
  "versions": [
    {
      "id": "v_xxx",
      "templateId": "custom_1707654321000",
      "config": { /* 完整的模板配置 */ },
      "createdAt": 1707654321000,
      "changeDescription": "修改了系统提示词"
    }
  ]
}
```

### API 接口

#### POST /api/optimize

AI 优化接口，支持流式输出

**请求体：**
```json
{
  "content": "待优化的 Markdown 内容",
  "templateId": "simple",
  "config": {
    "provider": "qwen",
    "apiKey": "sk-xxx",
    "baseUrl": "https://...",
    "model": "qwen-plus",
    "temperature": 0.7,
    "maxTokens": 8000
  }
}
```

**响应：** text/event-stream 流式响应

#### PUT /api/optimize

测试 AI 连接

**请求体：**
```json
{
  "config": { /* AIConfig */ }
}
```

**响应：**
```json
{
  "success": true,
  "message": "连接成功",
  "reply": "AI 回复内容"
}
```

## 🔧 常见问题

### Q: AI 优化连接失败怎么办？
A: 检查以下几点：
1. API Key 是否正确
2. API 地址是否可访问（注意中转地址）
3. 模型名称是否正确
4. 是否有足够的配额
5. 查看控制台错误信息获取详细提示

### Q: 导出的 HTML 样式不对？
A: 确保：
1. 使用「复制HTML」按钮而非手动复制
2. 公众号后台使用「源码模式」粘贴
3. 检查是否安装了可能干扰的浏览器插件

### Q: 数据会丢失吗？
A: 所有数据存储在浏览器 localStorage 中：
- 正常关闭浏览器不会丢失
- 清除浏览器数据会丢失
- 建议定期导出重要文章备份

### Q: 支持多设备同步吗？
A: 目前不支持，所有数据存储在本地。如需多设备使用，建议：
1. 使用文章列表导出功能
2. 或使用浏览器同步功能

## 📝 待办事项

- [ ] 支持导出 Markdown 文件
- [ ] 支持导入本地 Markdown 文件
- [ ] 添加图片上传功能（图床集成）
- [ ] 支持云存储同步
- [ ] 添加更多内置优化风格模板
- [x] 支持自定义优化 prompt ✅
- [ ] 添加文章统计功能（阅读时间估算等）
- [ ] 支持快捷键操作
- [ ] 添加暗黑模式
- [ ] 支持多语言

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请提交 [Issue](https://github.com/xxx/mopai/issues)

---

**墨排** - 让公众号排版更简单
