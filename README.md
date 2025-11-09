# 个人语言学习库

基于 RAG（检索增强生成）技术的私人化定制语言学习应用。

## 功能特性

- 🧠 **私人化知识库**：构建专属的个人语言知识库
- 🤖 **AI 学习助手**：基于个人知识库的智能问答
- 📊 **学习进度追踪**：可视化学习进度和效果
- 🔄 **智能复习提醒**：基于遗忘曲线的复习建议
- 🏷️ **标签分类管理**：灵活的内容组织方式

## 技术栈

- **前端**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **后端**: Next.js API Routes
- **AI**: OpenAI GPT-4o-mini, text-embedding-3-small
- **数据库**: Supabase (PostgreSQL + pgvector)
- **RAG**: LangChain

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入你的配置：

```bash
cp .env.example .env.local
```

需要配置：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_KEY`: Supabase 匿名密钥
- `OPENAI_API_KEY`: OpenAI API 密钥
- `OPENAI_API_BASE_URL`: OpenAI API 地址（可选）

### 3. 设置 Supabase 数据库

在 Supabase SQL 编辑器中执行 `supabase/schema.sql` 文件中的 SQL 语句。

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                    # Next.js 15 App Router
│   ├── api/               # API 路由
│   │   └── learning/      # 学习相关 API
│   ├── library/           # 知识库管理页面
│   ├── quiz/              # 学习测试页面
│   ├── progress/          # 进度统计页面
│   └── page.tsx           # 主学习页面
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── LearningChat.tsx  # 学习对话组件
│   ├── QuickAdd.tsx      # 快速添加组件
│   └── ContentList.tsx   # 内容列表组件
├── lib/                   # 工具函数
│   ├── supabase.ts       # Supabase 客户端
│   ├── openai.ts         # OpenAI 客户端
│   └── utils.ts          # 通用工具函数
├── types/                 # TypeScript 类型定义
└── supabase/             # Supabase 配置
    └── schema.sql        # 数据库架构
```

## 使用说明

### 添加学习内容

1. 在主页的"快速添加"区域输入学习内容
2. 选择内容类型（单词、语法、笔记、例句）
3. 添加标签（可选）
4. 点击"添加"按钮

### AI 学习助手

1. 在对话框中输入你的问题
2. AI 会基于你的个人知识库回答
3. 支持多轮对话和上下文理解

### 管理知识库

1. 访问"知识库"页面查看所有学习内容
2. 使用筛选器按类型、标签查找内容
3. 支持编辑、删除和批量操作

### 复习提醒

系统会根据遗忘曲线自动计算需要复习的内容，并在主页展示。

## 部署

### Vercel 部署

```bash
npm run build
vercel deploy
```

在 Vercel 后台配置环境变量。

## 许可证
...
MIT

