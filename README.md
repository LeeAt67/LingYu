# HaoCi (好词) - 智能语言学习平台

一个功能强大的全栈语言学习平台，集成 AI 智能助手、实时语音对话、单词练习和个人知识库管理。

## 项目简介

HaoCi (好词) 是一个基于 React + Node.js 的现代化全栈语言学习平台，专注于提供智能化、个性化的语言学习体验。

### 核心特色

-  **双 AI 引擎支持** - 集成 OpenAI GPT 和本地 Ollama 模型
-  **实时语音对话** - 基于阿里云 Qwen-Omni 的语音通话功能
-  **智能知识库** - RAG 检索增强生成，个性化问答
-  **单词练习系统** - 智能出题、进度追踪、复习提醒
-  **企业级安全** - JWT 认证、速率限制、密码加密
-  **响应式设计** - 完美适配移动端和桌面端

## 技术栈

### 前端
- React 19 + TypeScript 5.7
- Vite 6 + TailwindCSS 3.4
- Zustand 5 + React Query 5
- Radix UI + Lucide Icons

### 后端
- Node.js 18+ + Express 4
- Prisma ORM 5 + PostgreSQL
- JWT + bcryptjs
- OpenAI API + Ollama
- WebSocket + Socket.IO

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 13
- pnpm (推荐)

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd HaoCi
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp server/.env.example server/.env
# 编辑 server/.env 配置数据库和 API 密钥
```

4. 设置数据库
```bash
cd server
pnpm run db:generate
pnpm run db:push
```

5. 启动服务
```bash
pnpm run dev
```

6. 访问应用
- 前端: http://localhost:3000
- 后端: http://localhost:5000
- API 文档: http://localhost:5000/api-docs

## 主要功能

### 1. AI 智能助手
- OpenAI GPT 和 Ollama 双引擎支持
- 基于个人知识库的上下文对话
- RAG 检索增强生成
- 实时流式输出

### 2. 实时语音通话
- 实时语音识别和转录
- AI 语音回复
- 语音打断功能
- 音频可视化

### 3. 单词练习系统
- 智能出题和进度追踪
- 基于遗忘曲线的复习提醒
- 错题本和统计分析

### 4. 个人知识库
- 多种内容类型支持
- 标签分类和全文搜索
- 内容管理和导入导出

### 5. 安全认证
- JWT 访问令牌 + 刷新令牌
- 密码加密和重置
- 速率限制和会话管理

## 项目结构

```
HaoCi/
 client/          # 前端应用
    src/
       api/    # API 接口
       components/  # 组件
       pages/  # 页面
       stores/ # 状态管理
       router/ # 路由配置
    package.json
 server/          # 后端应用
    src/
       routes/     # API 路由
       services/   # 业务逻辑
       middleware/ # 中间件
       utils/      # 工具函数
    prisma/    # 数据库模型
    package.json
 docs/           # 项目文档
```

## 开发指南

### 代码规范
- 组件: PascalCase
- 文件: camelCase
- 常量: UPPER_SNAKE_CASE
- 遵循 DRY 原则
- 使用 TypeScript 严格模式

### Git 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- refactor: 代码重构

### 可用脚本
```bash
pnpm run dev      # 启动开发服务器
pnpm run build    # 构建生产版本
pnpm run test     # 运行测试
pnpm run lint     # 代码检查
```

## 相关文档

- [项目结构详解](./PROJECT_STRUCTURE.md)
- [代码注释规范](./CODE_COMMENT_STANDARDS.md)
- [RAG 功能文档](./RAG_FEATURES.md)
- [语音通话指南](./docs/VOICE_CALL_GUIDE.md)
- [安全登录快速开始](./docs/SECURE_LOGIN_QUICKSTART.md)

## 贡献指南

欢迎贡献！请遵循以下流程：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 常见问题

### 数据库连接失败
```bash
pg_isready
createdb haoci
```

### Ollama 服务不可用
```bash
ollama serve
ollama pull qwen2.5:0.5b
```

## 许可证

MIT License

## 联系方式

- 创建 Issue
- 提交 Pull Request
- 联系开发团队

---

**最后更新**: 2026-01-08  
**维护者**: HaoCi Team  
**版本**: 1.0.0

Made with  by HaoCi Team
