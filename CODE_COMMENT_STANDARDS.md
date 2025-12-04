# LingYu 代码注释规范

## 📝 注释类型

### 1. **文件头注释**
每个文件顶部应包含文件说明:

```typescript
/**
 * @file 用户认证服务
 * @description 处理用户登录、注册、JWT验证等认证相关功能
 * @author LingYu Team
 * @created 2024-12-05
 * @lastModified 2024-12-05
 */
```

### 2. **函数/方法注释**
使用 JSDoc 格式:

```typescript
/**
 * 根据用户ID获取用户信息
 * @param userId - 用户唯一标识符
 * @returns 用户信息对象,如果用户不存在则返回 null
 * @throws {NotFoundError} 当用户ID格式无效时抛出
 * @example
 * const user = await getUserById('user_123');
 * console.log(user.email);
 */
async function getUserById(userId: string): Promise<User | null> {
  // 实现代码
}
```

### 3. **类注释**
```typescript
/**
 * RAG 服务类
 * @description 负责处理检索增强生成(RAG)相关功能,包括向量存储、相似度搜索等
 * @class
 */
export class RagService {
  // 类实现
}
```

### 4. **接口/类型注释**
```typescript
/**
 * 用户信息接口
 * @interface
 */
interface User {
  /** 用户唯一标识符 */
  id: string;
  
  /** 用户邮箱地址 */
  email: string;
  
  /** 用户昵称,可选 */
  nickname?: string;
  
  /** 账户创建时间 */
  createdAt: Date;
}
```

### 5. **行内注释**
```typescript
// 使用 JWT 验证用户身份
const token = jwt.sign(payload, SECRET_KEY);

// TODO: 添加邮箱验证功能
// FIXME: 修复密码加密算法的安全漏洞
// NOTE: 这里使用了缓存来提高性能
// HACK: 临时解决方案,等待上游库修复
// WARNING: 不要在生产环境中使用此配置
```

### 6. **块注释**
```typescript
/*
 * 复杂的业务逻辑说明:
 * 1. 首先验证用户权限
 * 2. 检查数据完整性
 * 3. 执行数据库事务
 * 4. 发送通知邮件
 */
```

---

## 💻 TypeScript/JavaScript 注释规范

### 函数注释模板

```typescript
/**
 * 函数简短描述(一句话概括功能)
 * 
 * 详细描述(可选):
 * - 功能点1
 * - 功能点2
 * 
 * @param paramName - 参数描述
 * @param options - 配置项对象
 * @param options.option1 - 配置项1说明
 * @param options.option2 - 配置项2说明
 * @returns 返回值描述
 * @throws {ErrorType} 错误描述
 * 
 * @example
 * // 使用示例
 * const result = await functionName('param', { option1: true });
 * 
 * @see {@link RelatedFunction} 相关函数
 * @since 1.0.0
 * @deprecated 使用 newFunction 替代
 */
async function functionName(
  paramName: string,
  options: Options
): Promise<Result> {
  // 实现代码
}
```

### 常用 JSDoc 标签

| 标签 | 说明 | 示例 |
|------|------|------|
| `@param` | 参数说明 | `@param userId - 用户ID` |
| `@returns` | 返回值说明 | `@returns 用户对象` |
| `@throws` | 异常说明 | `@throws {Error} 错误信息` |
| `@example` | 使用示例 | `@example const x = fn()` |
| `@description` | 详细描述 | `@description 这是详细说明` |
| `@see` | 参考链接 | `@see https://example.com` |
| `@since` | 版本信息 | `@since 1.0.0` |
| `@deprecated` | 废弃标记 | `@deprecated 使用新方法` |
| `@todo` | 待办事项 | `@todo 添加错误处理` |
| `@async` | 异步函数 | `@async` |
| `@private` | 私有方法 | `@private` |
| `@public` | 公开方法 | `@public` |

### 复杂逻辑注释

```typescript
/**
 * 计算用户学习进度的掌握度分数
 * 
 * 算法说明:
 * 1. 基础分 = 复习次数 * 10
 * 2. 时间衰减 = Math.exp(-天数 / 30)
 * 3. 最终分数 = 基础分 * 时间衰减 * 难度系数
 * 
 * @param reviewCount - 复习次数
 * @param lastReviewDate - 最后复习日期
 * @param difficulty - 难度系数 (1-5)
 * @returns 掌握度分数 (0-100)
 */
function calculateMasteryScore(
  reviewCount: number,
  lastReviewDate: Date,
  difficulty: number
): number {
  // 计算距离上次复习的天数
  const daysSinceReview = getDaysDiff(lastReviewDate, new Date());
  
  // 基础分数计算
  const baseScore = Math.min(reviewCount * 10, 100);
  
  // 时间衰减因子 (30天半衰期)
  const timeDecay = Math.exp(-daysSinceReview / 30);
  
  // 难度调整 (难度越高,分数增长越慢)
  const difficultyFactor = 1 / difficulty;
  
  // 最终分数
  return Math.round(baseScore * timeDecay * difficultyFactor);
}
```

---

## ⚛️ React 组件注释规范

### 组件文件注释

```typescript
/**
 * @file 学习聊天组件
 * @description 提供AI学习助手的聊天界面,支持实时对话和历史记录
 * @component
 */

import { FC, useState } from 'react';

/**
 * 学习聊天组件的 Props 接口
 */
interface LearningChatProps {
  /** 用户ID */
  userId: string;
  
  /** 会话ID,可选,不传则创建新会话 */
  sessionId?: string;
  
  /** 初始消息列表 */
  initialMessages?: Message[];
  
  /** 消息发送成功回调 */
  onMessageSent?: (message: Message) => void;
  
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 学习聊天组件
 * 
 * 功能特性:
 * - 实时AI对话
 * - 消息历史记录
 * - 支持Markdown渲染
 * - 自动滚动到最新消息
 * 
 * @component
 * @example
 * ```tsx
 * <LearningChat 
 *   userId="user_123"
 *   sessionId="session_456"
 *   onMessageSent={(msg) => console.log(msg)}
 * />
 * ```
 */
export const LearningChat: FC<LearningChatProps> = ({
  userId,
  sessionId,
  initialMessages = [],
  onMessageSent,
  className
}) => {
  // 组件状态
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 处理消息发送
   * 
   * 流程:
   * 1. 验证输入内容
   * 2. 添加用户消息到列表
   * 3. 调用API获取AI回复
   * 4. 更新消息列表
   */
  const handleSendMessage = async () => {
    // 实现代码
  };

  return (
    <div className={className}>
      {/* 组件JSX */}
    </div>
  );
};
```

### Hooks 注释

```typescript
/**
 * 用户认证状态管理 Hook
 * 
 * 提供用户登录、登出、状态查询等功能
 * 
 * @returns 认证状态和操作方法
 * 
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * // 登录
 * await login(email, password);
 * 
 * // 检查认证状态
 * if (isAuthenticated) {
 *   console.log(user.email);
 * }
 * ```
 */
export function useAuth() {
  // Hook 实现
}
```

---

## 🔌 API 接口注释规范

### Express 路由注释

```typescript
/**
 * @route POST /api/auth/login
 * @description 用户登录接口
 * @access Public
 * 
 * @body {string} email - 用户邮箱
 * @body {string} password - 用户密码
 * 
 * @returns {object} 200 - 登录成功
 * @returns {string} 200.token - JWT访问令牌
 * @returns {object} 200.user - 用户信息
 * 
 * @returns {object} 401 - 认证失败
 * @returns {string} 401.message - 错误信息
 * 
 * @example
 * // 请求示例
 * POST /api/auth/login
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * // 响应示例
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "user_123",
 *     "email": "user@example.com",
 *     "name": "John Doe"
 *   }
 * }
 */
router.post('/login', async (req, res) => {
  // 路由处理逻辑
});
```

### API 服务函数注释

```typescript
/**
 * 创建新的学习内容
 * 
 * @param userId - 用户ID
 * @param data - 内容数据
 * @param data.title - 内容标题
 * @param data.content - 内容正文
 * @param data.type - 内容类型 (TEXT | AUDIO | VIDEO)
 * @param data.tags - 标签数组
 * 
 * @returns 创建的内容对象
 * 
 * @throws {ValidationError} 当数据验证失败时
 * @throws {DatabaseError} 当数据库操作失败时
 * 
 * @example
 * const content = await createContent('user_123', {
 *   title: '英语语法笔记',
 *   content: '现在完成时的用法...',
 *   type: 'TEXT',
 *   tags: ['grammar', 'english']
 * });
 */
export async function createContent(
  userId: string,
  data: CreateContentInput
): Promise<Content> {
  // 实现代码
}
```

---

## 🗄️ 数据库模型注释规范

### Prisma Schema 注释

```prisma
/// 用户表
/// 存储系统用户的基本信息和认证数据
model User {
  /// 用户唯一标识符 (CUID)
  id        String   @id @default(cuid())
  
  /// 用户邮箱地址,用于登录和通知
  email     String   @unique
  
  /// 用户昵称/显示名称
  name      String
  
  /// 加密后的密码 (使用 bcrypt)
  password  String
  
  /// 账户创建时间
  createdAt DateTime @default(now())
  
  /// 最后更新时间
  updatedAt DateTime @updatedAt

  // 关联关系
  /// 用户创建的学习内容
  contents Content[]
  
  /// 用户的聊天会话
  chatSessions ChatSession[]
  
  /// 用户的学习记录
  studySessions StudySession[]

  @@map("users")
}

/// 学习内容表
/// 存储用户添加的各类学习材料
model Content {
  /// 内容唯一标识符
  id          String      @id @default(cuid())
  
  /// 内容标题
  title       String
  
  /// 内容正文
  content     String
  
  /// 内容类型 (文本/音频/视频)
  type        ContentType @default(TEXT)
  
  /// 内容标签,用于分类和检索
  tags        String[]
  
  /// 所属用户ID
  userId      String
  
  /// 创建时间
  createdAt   DateTime    @default(now())
  
  /// 更新时间
  updatedAt   DateTime    @updatedAt

  // 关联关系
  /// 内容所属用户
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("contents")
}

/// 内容类型枚举
enum ContentType {
  TEXT   /// 文本内容
  AUDIO  /// 音频内容
  VIDEO  /// 视频内容
}
```

---

## 🎨 注释最佳实践

### ✅ 好的注释示例

```typescript
// 1. 解释复杂的业务逻辑
/**
 * 使用间隔重复算法计算下次复习时间
 * 基于 SuperMemo SM-2 算法的简化版本
 */
function calculateNextReview(masteryLevel: number): Date {
  const intervals = [1, 3, 7, 14, 30, 90]; // 天数
  const days = intervals[Math.min(masteryLevel, intervals.length - 1)];
  return addDays(new Date(), days);
}

// 2. 说明非显而易见的决策
// 使用 setTimeout 而非 setInterval,避免任务堆积
setTimeout(checkUpdates, INTERVAL);

// 3. 标记临时解决方案
// HACK: 临时禁用严格模式,等待 TypeScript 5.0 升级
// @ts-ignore

// 4. 记录重要的约束条件
/**
 * 注意: 此函数必须在用户认证后调用
 * 依赖: 需要有效的 JWT token 在请求头中
 */

// 5. 提供使用示例
/**
 * @example
 * // 基础用法
 * const result = await fetchData('/api/users');
 * 
 * // 带参数
 * const result = await fetchData('/api/users', { 
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 */
```

## 🏷️ 特殊标记注释

### TODO 注释
```typescript
// TODO: 添加输入验证
// TODO(张三): 优化查询性能
// TODO [2024-12-31]: 在年底前完成重构
```

### FIXME 注释
```typescript
// FIXME: 修复内存泄漏问题
// FIXME(urgent): 紧急修复登录bug
```

### NOTE 注释
```typescript
// NOTE: 这个API在生产环境有速率限制
// NOTE: 修改此处需要同步更新文档
```

### HACK 注释
```typescript
// HACK: 临时解决方案,等待上游库修复
// HACK: 绕过TypeScript类型检查,已提交issue #123
```

### WARNING 注释
```typescript
// WARNING: 不要在循环中调用此函数
// WARNING: 此方法会修改原数组
```

### OPTIMIZE 注释
```typescript
// OPTIMIZE: 可以使用缓存提升性能
// OPTIMIZE: 考虑使用虚拟滚动处理大列表
```

---

## 🛠️ 注释工具推荐

### VS Code 插件

#### 1. **Better Comments**
高亮不同类型的注释:
```typescript
// * 重要信息
// ! 警告信息
// ? 疑问
// TODO: 待办事项
// @param 参数说明
```

#### 2. **Document This**
自动生成 JSDoc 注释:
- 快捷键: `Ctrl+Alt+D` (Windows) / `Cmd+Alt+D` (Mac)
- 自动识别函数参数和返回值

#### 3. **Comment Translate**
翻译注释:
- 支持中英文互译
- 鼠标悬停显示翻译

#### 4. **TODO Highlight**
高亮 TODO/FIXME 等标记:
- 自定义高亮颜色
- 快速跳转到标记位置

#### 5. **JSDoc Generator**
智能生成 JSDoc:
- 支持 TypeScript
- 自动推断类型

### 配置示例

```json
// .vscode/settings.json
{
  "better-comments.tags": [
    {
      "tag": "!",
      "color": "#FF2D00",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "?",
      "color": "#3498DB",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "//",
      "color": "#474747",
      "strikethrough": true,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "todo",
      "color": "#FF8C00",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    },
    {
      "tag": "*",
      "color": "#98C379",
      "strikethrough": false,
      "underline": false,
      "backgroundColor": "transparent",
      "bold": false,
      "italic": false
    }
  ]
}
```

---

## 📚 注释模板库

### 函数模板
```typescript
/**
 * [函数简短描述]
 * 
 * [详细说明 - 可选]
 * 
 * @param param1 - [参数1说明]
 * @param param2 - [参数2说明]
 * @returns [返回值说明]
 * @throws {ErrorType} [异常说明]
 * 
 * @example
 * ```typescript
 * [使用示例代码]
 * ```
 */
```

### 类模板
```typescript
/**
 * [类名称]
 * 
 * @description [类的详细描述]
 * @class
 * 
 * @example
 * ```typescript
 * const instance = new ClassName();
 * instance.method();
 * ```
 */
```

### 接口模板
```typescript
/**
 * [接口名称]
 * 
 * @interface
 * 
 * @property {Type} propertyName - [属性说明]
 */
```

### API 路由模板
```typescript
/**
 * @route [METHOD] [PATH]
 * @description [接口描述]
 * @access [Public/Private/Admin]
 * 
 * @param {Type} paramName - [路径参数说明]
 * @query {Type} queryName - [查询参数说明]
 * @body {Type} bodyField - [请求体字段说明]
 * 
 * @returns {Type} [状态码] - [响应说明]
 * 
 * @example
 * [请求示例]
 * [响应示例]
 */
```
