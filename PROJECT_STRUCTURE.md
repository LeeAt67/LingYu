# LingYu 项目目录管理最佳实践

## 📋 目录概览

本项目采用 **Monorepo** 架构,前后端分离,遵循 DRY (Don't Repeat Yourself) 原则。

```
lingYu-refactored/
├── client/                 # 前端应用 (React + Vite)
├── server/                 # 后端应用 (Node.js + Express)
├── docs/                   # 项目文档 (建议新增)
├── shared/                 # 共享代码 (建议新增)
├── .gitignore             # Git 忽略配置
├── package.json           # 根项目配置
├── README.md              # 项目说明
└── RAG_FEATURES.md        # RAG 功能文档
```

---

## 🎯 核心原则

### 1. **职责单一原则 (Single Responsibility)**
每个文件、目录只负责一个明确的功能模块。

### 2. **DRY 原则 (Don't Repeat Yourself)**
- 避免重复代码
- 提取公共逻辑到 `utils/` 或 `shared/`
- 复用组件而非重写

### 3. **关注点分离 (Separation of Concerns)**
- 视图层 (components) - 只负责 UI 展示
- 业务逻辑层 (stores/services) - 状态管理和业务逻辑
- 数据层 (api/routes) - 数据获取和接口调用
- 工具层 (utils) - 纯函数工具

### 4. **可扩展性 (Scalability)**
- 模块化设计,易于添加新功能
- 清晰的目录结构,便于团队协作

---

## 📁 前端目录结构 (Client)

```
client/
├── public/                     # 静态资源 (不经过构建)
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── api/                    # API 接口层
│   │   ├── client.ts          # Axios 实例配置
│   │   ├── chat.ts            # 聊天相关 API
│   │   ├── auth.ts            # 认证相关 API
│   │   └── learning.ts        # 学习相关 API
│   │
│   ├── assets/                 # 静态资源 (经过构建)
│   │   ├── images/            # 图片资源
│   │   ├── icons/             # 图标资源
│   │   ├── fonts/             # 字体文件
│   │   └── styles/            # 全局样式
│   │
│   ├── components/             # 可复用组件
│   │   ├── common/            # 通用组件
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── types.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Loading/
│   │   │
│   │   ├── layout/            # 布局组件
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   └── Footer/
│   │   │
│   │   └── business/          # 业务组件
│   │       ├── LearningChat/
│   │       ├── SmartLearningAssistant/
│   │       └── ContentEditor/
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Home/
│   │   │   ├── index.tsx
│   │   │   └── Home.module.css
│   │   ├── SmartLearning/
│   │   ├── Library/
│   │   └── Profile/
│   │
│   ├── stores/                 # 状态管理 (Zustand)
│   │   ├── useAuthStore.ts    # 认证状态
│   │   ├── useLearningStore.ts # 学习状态
│   │   ├── useUIStore.ts      # UI 状态
│   │   └── index.ts           # 统一导出
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useAuth.ts
│   │
│   ├── utils/                  # 工具函数
│   │   ├── format.ts          # 格式化工具
│   │   ├── validate.ts        # 验证工具
│   │   ├── storage.ts         # 本地存储工具
│   │   └── constants.ts       # 常量定义
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   ├── api.ts             # API 类型
│   │   ├── models.ts          # 数据模型类型
│   │   └── common.ts          # 通用类型
│   │
│   ├── router/                 # 路由配置
│   │   ├── index.tsx          # 路由主文件
│   │   └── routes.ts          # 路由配置
│   │
│   ├── App.tsx                 # 根组件
│   ├── main.tsx               # 入口文件
│   └── index.css              # 全局样式
│
├── .env.example               # 环境变量示例
├── index.html                 # HTML 模板
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 配置
└── tailwind.config.js         # Tailwind CSS 配置
```

### 📝 前端命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `LearningChat.tsx` |
| 组件目录 | PascalCase | `components/LearningChat/` |
| Hooks | camelCase + use前缀 | `useAuth.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 类型/接口 | PascalCase | `UserProfile` |
| Store | camelCase + use前缀 | `useAuthStore.ts` |

---

## 🔧 后端目录结构 (Server)

```
server/
├── prisma/                     # Prisma ORM
│   ├── schema.prisma          # 数据库模型定义
│   ├── migrations/            # 数据库迁移
│   └── seed.ts                # 数据库种子数据
│
├── src/
│   ├── routes/                 # 路由层
│   │   ├── index.ts           # 路由汇总
│   │   ├── auth.ts            # 认证路由
│   │   ├── rag.ts             # RAG 路由
│   │   ├── learning.ts        # 学习路由
│   │   └── user.ts            # 用户路由
│   │
│   ├── controllers/            # 控制器层 (建议新增)
│   │   ├── authController.ts
│   │   ├── ragController.ts
│   │   └── learningController.ts
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── authService.ts     # 认证服务
│   │   ├── ragService.ts      # RAG 服务
│   │   ├── learningService.ts # 学习服务
│   │   └── emailService.ts    # 邮件服务
│   │
│   ├── models/                 # 数据模型层 (建议新增)
│   │   ├── User.ts
│   │   ├── Content.ts
│   │   └── ChatSession.ts
│   │
│   ├── middleware/             # 中间件
│   │   ├── auth.ts            # 认证中间件
│   │   ├── errorHandler.ts    # 错误处理
│   │   ├── validator.ts       # 请求验证
│   │   └── logger.ts          # 日志中间件
│   │
│   ├── utils/                  # 工具函数
│   │   ├── logger.ts          # 日志工具
│   │   ├── jwt.ts             # JWT 工具
│   │   ├── encryption.ts      # 加密工具
│   │   └── constants.ts       # 常量定义
│   │
│   ├── types/                  # TypeScript 类型
│   │   ├── express.d.ts       # Express 类型扩展
│   │   ├── api.ts             # API 类型
│   │   └── models.ts          # 模型类型
│   │
│   ├── config/                 # 配置文件
│   │   ├── database.ts        # 数据库配置
│   │   ├── redis.ts           # Redis 配置
│   │   └── openai.ts          # OpenAI 配置
│   │
│   └── index.ts               # 应用入口
│
├── tests/                      # 测试文件
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── e2e/                   # 端到端测试
│
├── .env.example               # 环境变量示例
├── package.json               # 依赖配置
└── tsconfig.json              # TypeScript 配置
```

### 📝 后端命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 路由文件 | camelCase | `auth.ts`, `rag.ts` |
| 控制器 | camelCase + Controller后缀 | `authController.ts` |
| 服务 | camelCase + Service后缀 | `ragService.ts` |
| 中间件 | camelCase | `auth.ts`, `errorHandler.ts` |
| 工具函数 | camelCase | `logger.ts`, `jwt.ts` |
| 常量 | UPPER_SNAKE_CASE | `JWT_SECRET` |
| 类型/接口 | PascalCase | `UserPayload` |

---

## 🔄 分层架构

### 前端分层
```
用户交互 → Pages → Components → Stores/Hooks → API → 后端
```

### 后端分层
```
客户端请求 → Routes → Controllers → Services → Models → Database
```

---

## 📦 共享代码管理 (建议新增)

```
shared/
├── types/                      # 前后端共享类型
│   ├── api.ts                 # API 接口类型
│   ├── models.ts              # 数据模型类型
│   └── enums.ts               # 枚举类型
│
├── constants/                  # 共享常量
│   ├── errorCodes.ts          # 错误码
│   └── statusCodes.ts         # 状态码
│
└── utils/                      # 共享工具函数
    ├── validation.ts          # 验证函数
    └── format.ts              # 格式化函数
```

---

## 🎨 组件开发规范

### 组件目录结构
```
ComponentName/
├── index.tsx                   # 组件主文件
├── ComponentName.module.css   # 组件样式 (CSS Modules)
├── types.ts                   # 组件类型定义
├── hooks.ts                   # 组件专用 Hooks
├── utils.ts                   # 组件专用工具函数
└── __tests__/                 # 组件测试
    └── ComponentName.test.tsx
```

### 组件模板
```tsx
// index.tsx
import { FC } from 'react';
import styles from './ComponentName.module.css';
import { ComponentNameProps } from './types';

export const ComponentName: FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // 组件逻辑
  
  return (
    <div className={styles.container}>
      {/* 组件内容 */}
    </div>
  );
};

export default ComponentName;
```

---

## 🔐 环境变量管理

### 前端 (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=LingYu
VITE_ENABLE_ANALYTICS=false
```

### 后端 (.env)
```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/lingyu

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-xxx

# 服务器
PORT=3001
NODE_ENV=development
```

---

## 📚 文档管理

```
docs/
├── api/                        # API 文档
│   ├── authentication.md
│   ├── rag.md
│   └── learning.md
│
├── architecture/               # 架构文档
│   ├── overview.md
│   ├── database-design.md
│   └── system-flow.md
│
├── development/                # 开发文档
│   ├── setup.md
│   ├── coding-standards.md
│   └── git-workflow.md
│
└── deployment/                 # 部署文档
    ├── production.md
    └── ci-cd.md
```

---

## 🚀 最佳实践建议

### 1. **代码组织**
- ✅ 按功能模块组织,而非按文件类型
- ✅ 相关文件放在同一目录下
- ✅ 使用 `index.ts` 统一导出

### 2. **导入顺序**
```typescript
// 1. 第三方库
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 内部模块 (绝对路径)
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/useAuthStore';

// 3. 相对路径
import { formatDate } from './utils';
import styles from './Component.module.css';

// 4. 类型导入
import type { UserProfile } from '@/types/models';
```

### 3. **文件大小控制**
- 单个文件不超过 300 行
- 组件超过 200 行考虑拆分
- 复杂逻辑提取到 hooks 或 utils

### 4. **命名一致性**
- 文件名与导出名称保持一致
- 目录名与功能模块对应
- 避免缩写,使用完整单词

### 5. **避免循环依赖**
- 使用依赖注入
- 提取共享代码到独立模块
- 检查导入路径

### 6. **类型安全**
- 所有 API 响应定义类型
- 避免使用 `any`
- 使用严格的 TypeScript 配置

---

## 🔍 代码审查检查清单

- [ ] 文件放在正确的目录下
- [ ] 遵循命名规范
- [ ] 没有重复代码
- [ ] 职责单一,功能明确
- [ ] 有适当的类型定义
- [ ] 导入路径正确
- [ ] 没有循环依赖
- [ ] 代码格式化正确

---

## 🛠️ 工具推荐

### VS Code 插件
- **ES7+ React/Redux/React-Native snippets** - 代码片段
- **Prettier** - 代码格式化
- **ESLint** - 代码检查
- **Path Intellisense** - 路径自动补全
- **Auto Import** - 自动导入
- **Better Comments** - 注释高亮

### 开发工具
- **Husky** - Git hooks
- **lint-staged** - 提交前检查
- **commitlint** - 提交信息规范

---

## 📖 参考资源

- [React 官方文档](https://react.dev/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**最后更新**: 2025-12-05
**维护者**: LingYu Team
