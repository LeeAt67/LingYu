#### 更改提交

# LingYu - 个人语言学习平台

一个基于 React + Node.js 的现代化全栈语言学习平台，支持个人知识库管理和 AI 智能学习助手。采用 Monorepo 架构，前后端分离，遵循 DRY 原则和最佳实践。

## ✨ 技术栈

### 前端

- **React 19** - 最新版本的现代化 UI 框架
- **React Router v7** - 客户端路由（Hash 路由模式）
- **TypeScript 5.7** - 类型安全开发
- **Vite 6** - 极速构建工具
- **TailwindCSS 3.4** - 原子化 CSS 框架
- **Zustand 5** - 轻量级状态管理
- **React Query 5** - 数据获取和缓存
- **React Hook Form 7** - 表单管理
- **Zod 3** - 数据验证
- **Radix UI** - 无障碍组件库
- **Lucide React** - 现代图标库
- **React Markdown** - Markdown 渲染

### 后端

- **Node.js + Express 4** - 服务器框架
- **TypeScript 5** - 类型安全
- **Prisma ORM 5** - 数据库 ORM
- **PostgreSQL** - 关系型数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Winston 3** - 日志管理
- **OpenAI API 4** - AI 功能集成
- **LangChain** - AI 应用开发框架
- **WebSocket (ws)** - 实时通信
- **Qwen-Omni** - 阿里云实时语音模型

## 🎯 功能特性

### 核心功能

- **📚 个人知识库管理** - 支持文本、音频、视频等多种内容类型的管理
- **🤖 AI 智能学习助手** - 基于个人知识库的智能对话和学习辅导
- **🎤 实时语音通话** - 与 AI 进行自然的语音对话，支持实时转录和语音打断
- **📊 学习进度追踪** - 详细的学习统计和进度分析
- **🔄 智能复习系统** - 智能复习提醒和内容推荐
- **🏷️ 标签分类系统** - 灵活的内容分类和检索
- **🔍 全局搜索** - 快速查找学习内容和聊天记录

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 13
- **pnpm** (推荐) 或 npm

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd Neo
```

#### 2. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm run setup
```

#### 3. 配置环境变量

```bash
# 复制环境变量模板
cp server/.env.example server/.env

# 编辑 server/.env 文件，配置以下内容：
# - DATABASE_URL: PostgreSQL 数据库连接地址
# - JWT_SECRET: JWT 密钥
# - OPENAI_API_KEY: OpenAI API 密钥（可选）
# - DASHSCOPE_API_KEY: 阿里云DashScope API密钥（语音通话功能）
# - PORT: 后端服务器端口（默认5000）
```

#### 4. 设置数据库

```bash
cd server
pnpm run db:generate  # 生成 Prisma Client
pnpm run db:push      # 推送数据库模式
```

#### 5. 启动开发服务器

```bash
# 在项目根目录
pnpm run dev
```

这将同时启动：

- **前端开发服务器**: http://localhost:3000
- **后端 API 服务器**: http://localhost:5000

### 测试账号

开发环境默认测试账号：

- **密码**: `1234a.`

## 📁 项目结构

```
Neo/
├── client/                      # 前端应用 (React + Vite)
│   ├── src/
│   │   ├── api/                # API 接口层
│   │   ├── components/         # 可复用组件
│   │   │   ├── common/        # 通用组件
│   │   │   ├── layout/        # 布局组件
│   │   │   └── ui/            # UI 组件库
│   │   ├── pages/             # 页面组件
│   │   │   ├── auth/          # 认证页面
│   │   │   ├── library/       # 知识库页面
│   │   │   ├── chat/          # 聊天页面
│   │   │   ├── profile/       # 个人中心
│   │   │   └── settings/      # 设置页面
│   │   ├── stores/            # Zustand 状态管理
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── router/            # 路由配置
│   │   ├── lib/               # 工具库
│   │   └── types/             # TypeScript 类型定义
│   ├── public/                # 静态资源
│   └── package.json
│
├── server/                      # 后端应用 (Node.js + Express)
│   ├── src/
│   │   ├── routes/            # API 路由
│   │   ├── middleware/        # 中间件
│   │   ├── services/          # 业务逻辑层
│   │   ├── utils/             # 工具函数
│   │   └── types/             # TypeScript 类型定义
│   ├── prisma/                # Prisma ORM
│   │   ├── schema.prisma     # 数据库模型
│   │   └── migrations/       # 数据库迁移
│   └── package.json
│
├── .github/                     # GitHub 配置
├── CODE_COMMENT_STANDARDS.md   # 代码注释规范
├── PROJECT_STRUCTURE.md        # 项目结构详细文档
├── UI_DESIGN_SPEC.md           # UI 设计规范
├── RAG_FEATURES.md             # RAG 功能文档
├── ROUTES.md                   # 路由文档
├── pnpm-workspace.yaml         # pnpm 工作区配置
└── package.json                # 根项目配置
```

> 💡 详细的项目结构说明请查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 📖 开发指南

### 代码规范

#### 命名规范

- **组件**: PascalCase (如 `LearningChat.tsx`)
- **文件/目录**: camelCase (如 `useAuth.ts`)
- **Hooks**: camelCase + use 前缀 (如 `useAuthStore.ts`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **类型/接口**: PascalCase (如 `UserProfile`)

#### DRY 原则

- 视图与逻辑分离
- 组件负责视图，业务逻辑放在 store 中
- 工具函数放在 utils 中，接口放在 api 中
- 静态文件放在 assets 中的相应职责文件夹
- 避免重复调用 API，使用 Store 统一管理

#### 技术要求

- 使用 ESLint 进行代码检查
- 遵循 TypeScript 严格模式
- 使用 ES6+ 语法
- 使用 import 而非 require
- 优先使用已封装的函数，避免重复造轮子

### Git 提交规范

使用 Conventional Commits 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具链相关

### 可用脚本

#### 根目录

```bash
pnpm run dev          # 同时启动前后端开发服务器
pnpm run build        # 构建前后端
pnpm run start        # 启动生产服务器
pnpm run lint         # 运行代码检查
```

#### 前端 (client/)

```bash
pnpm run dev          # 启动开发服务器
pnpm run build        # 构建生产版本
pnpm run preview      # 预览生产版本
pnpm run lint         # 运行 ESLint
```

#### 后端 (server/)

```bash
pnpm run dev          # 启动开发服务器 (nodemon)
pnpm run build        # 编译 TypeScript
pnpm run start        # 启动生产服务器
pnpm run db:generate  # 生成 Prisma Client
pnpm run db:push      # 推送数据库模式
pnpm run db:migrate   # 运行数据库迁移
pnpm run db:studio    # 打开 Prisma Studio
```

## 🚢 部署

### 生产环境构建

```bash
# 构建前后端
pnpm run build
```

### 启动生产服务器

```bash
# 启动后端服务器
pnpm start
```

### 环境变量配置

确保生产环境配置了以下环境变量：

- `DATABASE_URL`: 生产数据库连接地址
- `JWT_SECRET`: 强密钥
- `NODE_ENV=production`
- `OPENAI_API_KEY`: OpenAI API 密钥（如需 AI 功能）

## 📚 相关文档

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - 详细的项目目录结构和最佳实践
- **[UI_DESIGN_SPEC.md](./UI_DESIGN_SPEC.md)** - UI 设计规范和组件库
- **[CODE_COMMENT_STANDARDS.md](./CODE_COMMENT_STANDARDS.md)** - 代码注释规范
- **[RAG_FEATURES.md](./RAG_FEATURES.md)** - RAG 功能实现文档
- **[ROUTES.md](./ROUTES.md)** - 路由配置文档
- **[docs/VOICE_CALL_GUIDE.md](./docs/VOICE_CALL_GUIDE.md)** - 语音通话功能使用指南

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循代码规范进行开发
4. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 创建 Pull Request

### 开发建议

- 在提交 PR 前运行 `pnpm run lint` 检查代码
- 确保遵循 DRY 原则和项目规范
- 为新功能添加适当的注释和文档
- 保持代码简洁、可读性强

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📮 联系方式

如有问题或建议，请：

- 创建 [Issue](../../issues)
- 提交 [Pull Request](../../pulls)
- 联系开发团队

---

**最后更新**: 2024-12-28  
**维护者**: LeeAt67/LingYu Team  
**版本**: 1.0.0
