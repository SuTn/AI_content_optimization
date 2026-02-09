 已收到，以下是纯PRD文档，不含代码：

---

# 墨排 MVP PRD（最终版）

## 1. 产品定义

**一句话描述**：本地运行的浏览器端Markdown编辑器，一键生成微信兼容HTML。

**核心场景**：用户在浏览器打开本地页面 → 写Markdown → 实时预览 → 复制HTML粘贴到公众号后台。

---

## 2. 技术规格

| 项目 | 确定方案 |
|---|---|
| 技术栈 | TypeScript + Next.js 14 (App Router) |
| 运行环境 | 本地开发服务器 (`npm run dev`) |
| 数据存储 | localStorage only |
| 编辑器 | 原生 `<textarea>` |
| 图片 | 仅外链URL |
| 样式配置 | 字体大小、行距、主色调三变量可调 |

---

## 3. 功能架构

```
app/
├── page.tsx              # 主页面（唯一页面）
├── layout.tsx            # 根布局
└── globals.css           # 基础样式

components/
├── Editor.tsx            # 左侧编辑器（textarea + 工具栏）
├── Preview.tsx           # 右侧预览区
├── Toolbar.tsx           # 顶部工具栏（新建/历史/导出/设置）
├── ArticleList.tsx       # 历史文章下拉/弹窗
├── SettingPanel.tsx      # 样式设置面板（字体/行距/颜色）
└── ExportModal.tsx       # 导出确认弹窗

lib/
├── markdown.ts           # marked配置 + 渲染
├── wechatStyle.ts        # 微信HTML样式生成器
├── storage.ts            # localStorage操作封装
└── utils.ts              # 工具函数

types/
└── index.ts              # 类型定义

hooks/
├── useArticle.ts         # 当前文章状态管理
├── useArticles.ts        # 文章列表管理
└── useSettings.ts        # 用户设置管理
```

---

## 4. 数据模型

| 实体 | 字段 | 说明 |
|---|---|---|
| **Article** | id | 时间戳生成 |
| | title | 自动提取第一行#标题，默认"未命名" |
| | content | Markdown原文 |
| | createdAt | 创建时间戳 |
| | updatedAt | 更新时间戳 |
| **Settings** | fontSize | 14-20px，默认16 |
| | lineHeight | 1.4-2.0，默认1.75 |
| | primaryColor | 主色调，默认#576b95（微信蓝） |
| **AppState** | currentId | 当前编辑的文章ID |
| | articles | 文章数组，最多保留50篇 |
| | settings | 用户样式设置 |

---

## 5. 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  [墨排]  [+新建] [历史▼]                    [设置] [复制HTML] │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  # 文章标题               │        渲染后的微信预览           │
│                          │                                  │
│  正文内容支持 **粗体**     │        （带完整微信样式）          │
│  和 [链接](url)           │                                  │
│                          │                                  │
│  > 引用内容               │                                  │
│                          │                                  │
│  - 列表项                 │                                  │
│                          │                                  │
│  `代码`                  │                                  │
│                          │                                  │
│  ![图](url)              │                                  │
│                          │                                  │
├──────────────────────────┴──────────────────────────────────┤
│  字数: 1,234 | 最后保存: 12:05                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 核心功能详细设计

### 6.1 编辑器（Editor）

**位置**：左侧固定宽度（50%）

**实现**：原生`<textarea>`，等宽字体，白色背景

**功能**：
- 纯文本输入，支持Tab缩进（自动转2个空格）
- 自动保存：停止输入1秒后保存到localStorage
- 默认内容：新建文章时显示模板`# 新文章\n\n开始写作...`

**工具栏按钮**（顶部）：
| 按钮 | 功能 | 插入语法 |
|---|---|---|
| B | 粗体 | `**选中文本**` 或 `**粗体**` |
| I | 斜体 | `*选中文本*` 或 `*斜体*` |
| H1 | 一级标题 | `# ` 在行首 |
| H2 | 二级标题 | `## ` 在行首 |
| " | 引用 | `> ` 在行首 |
| - | 无序列表 | `- ` 在行首 |
| Link | 链接 | `[选中文本](url)` 或 `[链接](url)` |
| Img | 图片 | `![alt](url)` |
| Code | 代码块 | ` ```\n选中文本\n``` ` |

**光标处理**：插入后自动定位到内容中间或语法闭合位置

---

### 6.2 实时预览（Preview）

**位置**：右侧（50%），灰色背景模拟微信环境

**渲染流程**：
1. 使用marked解析Markdown为HTML
2. 根据当前Settings生成内联样式
3. 使用dangerouslySetInnerHTML渲染
4. 容器固定宽度（模拟手机屏宽），居中显示

**安全处理**：使用DOMPurify过滤危险标签和属性

---

### 6.3 微信样式生成器

**输入**：原始HTML + Settings配置

**输出**：全内联样式的微信兼容HTML

**样式规则**：

| 元素 | 动态样式 |
|---|---|
| 基础容器 | `font-family: -apple-system...; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #333;` |
| h1 | `font-size: ${fontSize+8}px; font-weight: bold; margin: 1.5em 0 0.5em;` |
| h2 | `font-size: ${fontSize+4}px; font-weight: bold; margin: 1.3em 0 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em;` |
| h3 | `font-size: ${fontSize+2}px; font-weight: bold; margin: 1.2em 0 0.5em;` |
| p | `margin: 1em 0;` |
| a | `color: ${primaryColor}; text-decoration: none;` |
| blockquote | `border-left: 4px solid ${primaryColor}; margin: 1em 0; padding: 0.5em 1em; background: #f9f9f9; color: #666;` |
| img | `max-width: 100%; height: auto; display: block; margin: 1em auto;` |
| code（行内） | `background: #f3f3f3; padding: 0.2em 0.4em; border-radius: 3px; font-size: 90%; font-family: monospace;` |
| pre/code（块） | `background: #f8f8f8; padding: 1em; overflow-x: auto; font-size: 14px; line-height: 1.5;` |
| ul/ol | `margin: 1em 0; padding-left: 2em;` |
| li | 继承列表样式 |
| table | `border-collapse: collapse; width: 100%; margin: 1em 0;` |
| th/td | `border: 1px solid #ddd; padding: 8px;` |

---

### 6.4 设置面板（SettingPanel）

**触发**：点击右上角[设置]按钮，右侧滑出抽屉

**控件**：

**字体大小**
- 选项：14, 15, 16, 17, 18, 19, 20 px
- 默认：16px
- 交互：点击选中，即时生效

**行距**
- 选项：1.4, 1.5, 1.6, 1.75, 2.0
- 默认：1.75
- 交互：点击选中，即时生效

**主色调**
- 输入：颜色选择器 + 文本输入（hex格式）
- 预设按钮：
  - 微信蓝 #576b95
  - 珊瑚红 #ff6b6b
  - 翠绿 #52c41a
  - 深灰 #333333
- 默认：#576b95
- 交互：选择后即时生效

**实时生效**：所有修改立即更新预览区和导出HTML

---

### 6.5 导出功能

**按钮**：右上角[复制HTML]

**流程**：
1. 获取当前Markdown内容
2. 使用当前Settings渲染为完整HTML（带内联样式）
3. 使用DOMPurify净化（白名单模式）
4. 创建ClipboardItem写入剪贴板（text/html格式）
5. 按钮文字变为"已复制"（2秒后恢复）

**白名单标签**：p, br, span, div, strong, b, em, i, u, h1-h6, ul, ol, li, blockquote, a, img, code, pre, table, thead, tbody, tr, th, td, section

**白名单属性**：style, href, src, alt, title

---

### 6.6 文章管理

**新建（+新建按钮）**
- 创建新Article对象
- 内容：`# 新文章\n\n开始写作...`
- 自动聚焦编辑器
- 插入到文章列表首位

**历史下拉（历史▼）**
- 显示最近10篇文章
- 每项显示：标题 + 最后修改时间（相对时间，如"2小时前"）
- 点击切换：保存当前文章，加载选中文章
- 悬停显示删除图标，点击确认后删除
- 当前文章高亮显示

**自动标题提取**
- 规则：匹配第一行`# 标题内容`
- 截取前20字符，超出加省略号
- 无匹配时显示"未命名文章"

**自动保存策略**
- 触发：输入停止1秒后
- 行为：保存当前文章content和updatedAt到localStorage
- 防抖：重新输入时取消上次定时器

---

## 7. localStorage结构

**Key**: `mopai_v1`

**Value结构**：
```json
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
```

**容量管理**：
- 文章最多保留50篇，超出时删除最旧的（按updatedAt）
- 单篇文章content无硬性限制（依赖localStorage 5MB总限制）

---

## 8. 依赖清单

| 包名 | 版本 | 用途 |
|---|---|---|
| next | 14.0.0 | 框架 |
| react | ^18.0.0 | UI库 |
| marked | ^9.0.0 | Markdown解析 |
| dompurify | ^3.0.0 | HTML净化 |
| lucide-react | ^0.300.0 | 图标库 |
| @types/node | ^20.0.0 | TS类型 |
| @types/react | ^18.0.0 | TS类型 |
| @types/dompurify | ^3.0.0 | TS类型 |
| typescript | ^5.0.0 | 语言 |

---

## 9. 启动命令

```bash
# 初始化项目
npx create-next-app@14 mopai --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# 进入目录
cd mopai

# 安装依赖
npm install marked dompurify lucide-react
npm install -D @types/dompurify

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 10. 边界情况处理

| 场景 | 处理方案 |
|---|---|
| localStorage已满 | 提示用户删除旧文章，或导出后清理 |
| 浏览器无痕模式 | 正常可用，关闭后数据丢失（符合预期） |
| 粘贴非法HTML | DOMPurify自动过滤，保留纯文本 |
| 图片链接失效 | 不做处理，微信端显示裂图 |
| Markdown语法错误 | marked容错解析，尽量渲染 |
| 切换文章未保存 | 自动保存机制，1秒内已保存 |
| 多标签页同时编辑 | 以最后操作为准，无冲突检测（MVP简化） |

---

## 11. 验收标准

- [ ] 左侧输入Markdown，右侧实时渲染微信样式
- [ ] 点击工具栏按钮正确插入语法，光标位置合理
- [ ] 修改字体/行距/颜色后预览即时更新
- [ ] 点击复制HTML后，粘贴到公众号后台显示一致
- [ ] 新建/切换/删除文章功能正常
- [ ] 刷新页面后数据不丢失
- [ ] 文章超过50篇时自动清理最旧文章

---

PRD完成。