# LingYu - 个人语言学习平台

一个基于 React + Node.js 的现代化全栈语言学习平台，支持个人知识库管理和AI智能学习助手。

## 技术栈

### 前端
- **React 18** - 现代化UI框架
- **React Router v6** - 客户端路由
- **TailwindCSS** - 原子化CSS框架
- **Zustand** - 轻量级状态管理
- **React Query** - 数据获取和缓存
- **React Hook Form** - 表单管理
- **Zod** - 数据验证
- **Radix UI** - 无障碍组件库
- **Vite** - 快速构建工具

### 后端
- **Node.js + Express** - 服务器框架
- **TypeScript** - 类型安全
- **Prisma ORM** - 数据库ORM
- **PostgreSQL** - 关系型数据库
- **JWT** - 身份认证
- **Winston** - 日志管理
- **OpenAI API** - AI功能集成

## 功能特性

- **个人知识库管理** - 支持文本、音频、视频内容
- **AI学习助手** - 基于个人知识库的智能对话
- **学习进度追踪** - 详细的学习统计和进度分析
- **复习系统** - 智能复习提醒和内容推荐
- **标签分类** - 灵活的内容分类和检索
- **响应式设计** - 完美适配各种设备

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm 或 pnpm

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd lingYu-refactored
```

2. **安装依赖**
```bash
npm run setup
# 或者分别安装
npm install
cd client && npm install
cd ../server && npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp server/.env.example server/.env
# 编辑 server/.env 文件，填入你的配置
```

4. **设置数据库**
```bash
cd server
npm run db:generate
npm run db:push
```

5. **启动开发服务器**
```bash
# 在项目根目录
npm run dev
```

这将同时启动：
- 前端开发服务器: http://localhost:3000
- 后端API服务器: http://localhost:5000

## 项目结构

```
lingYu-refactored/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Zustand状态管理
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript类型定义
│   ├── public/            # 静态资源
│   └── package.json
├── server/                # 后端应用
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── middleware/    # 中间件
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript类型定义
│   ├── prisma/            # 数据库模式
│   └── package.json
└── package.json           # 根项目配置
```

## 开发指南

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 组件使用 PascalCase 命名
- 文件和目录使用 camelCase 命名

### 提交规范
使用 Conventional Commits 规范：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构

## 部署

### 生产环境构建
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请创建 Issue 或联系开发团队。
