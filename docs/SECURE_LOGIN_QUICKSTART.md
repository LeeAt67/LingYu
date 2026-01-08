# Neo 安全登录功能 - 快速开始指南

## 🚀 5 分钟快速上手

本指南将帮助你快速启动和测试 Neo 的安全登录功能。

---

## 📋 前置要求

- Node.js 18+
- PostgreSQL 数据库
- pnpm 包管理器

---

## 🔧 快速设置

### 1. 配置环境变量

```bash
# 进入服务器目录
cd Neo/server

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# 必须设置以下变量：
```

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/neo"

# JWT 密钥（生产环境请使用强随机字符串）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 服务器配置
PORT=5000
NODE_ENV=development
```

### 2. 安装依赖并运行迁移

```bash
# 安装后端依赖
cd Neo/server
pnpm install

# 生成 Prisma 客户端
pnpm run db:generate

# 执行数据库迁移
pnpm run db:push

# 启动后端服务器
pnpm run dev
```

### 3. 启动前端

```bash
# 新开一个终端
cd Neo/client
pnpm install

# 启动前端开发服务器
pnpm run dev
```

---

## ✅ 验证安装

### 测试后端 API

```bash
# 测试注册接口
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "测试用户",
    "password": "Test123!@#"
  }'

# 应该返回：
# {
#   "success": true,
#   "message": "注册成功",
#   "data": {
#     "user": { ... },
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }
```

```bash
# 测试登录接口
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 运行测试套件

```bash
cd Neo/server

# 运行所有测试
pnpm test

# 应该看到：
# Test Suites: 9 passed, 9 total
# Tests:       129 passed, 129 total
```

---

## 📱 使用前端

1. 打开浏览器访问 `http://localhost:5173`
2. 可以访问以下页面：
   - `/auth/login` - 登录页面
   - `/auth/register` - 注册页面
   - `/auth/forgot-password` - 忘记密码
   - `/auth/reset-password?token=xxx` - 重置密码
   - `/profile/edit` - 编辑个人资料
3. 填写表单并提交
4. 成功后会自动跳转到相应页面

---

## 🔑 API 端点速查

### 认证相关

| 端点                 | 方法 | 描述         | 需要认证 |
| -------------------- | ---- | ------------ | -------- |
| `/api/auth/register` | POST | 用户注册     | ❌       |
| `/api/auth/login`    | POST | 用户登录     | ❌       |
| `/api/auth/logout`   | POST | 退出登录     | ✅       |
| `/api/auth/me`       | GET  | 获取当前用户 | ✅       |
| `/api/auth/refresh`  | POST | 刷新令牌     | ❌       |

### 个人资料

| 端点                 | 方法 | 描述         | 需要认证 |
| -------------------- | ---- | ------------ | -------- |
| `/api/auth/profile`  | PUT  | 更新个人资料 | ✅       |
| `/api/auth/password` | PUT  | 修改密码     | ✅       |

### 密码重置

| 端点                       | 方法 | 描述         | 需要认证 |
| -------------------------- | ---- | ------------ | -------- |
| `/api/auth/reset-request`  | POST | 请求密码重置 | ❌       |
| `/api/auth/reset-password` | POST | 重置密码     | ❌       |

---

## 💡 常见使用场景

### 场景 1：用户注册

```typescript
// 前端代码
import { useAuthStore } from "@/stores/useAuthStore";

const { register, isLoading, error } = useAuthStore();

const handleRegister = async () => {
  try {
    await register({
      email: "user@example.com",
      name: "张三",
      password: "SecurePass123!",
    });
    // 注册成功，自动登录
    navigate("/");
  } catch (error) {
    // 错误已在 store 中处理
    console.error("注册失败:", error);
  }
};
```

### 场景 2：用户登录

```typescript
// 前端代码
import { useAuthStore } from "@/stores/useAuthStore";

const { login, isLoading, error } = useAuthStore();

const handleLogin = async () => {
  try {
    await login({
      email: "user@example.com",
      password: "SecurePass123!",
    });
    // 登录成功
    navigate("/");
  } catch (error) {
    // 错误已在 store 中处理
    console.error("登录失败:", error);
  }
};
```

### 场景 3：修改密码

```typescript
// 前端代码
import { useAuthStore } from "@/stores/useAuthStore";

const { changePassword, isLoading, error } = useAuthStore();

const handleChangePassword = async () => {
  try {
    await changePassword({
      oldPassword: "OldPass123!",
      newPassword: "NewPass123!",
    });
    // 密码修改成功，令牌已自动更新
    alert("密码修改成功");
  } catch (error) {
    console.error("修改密码失败:", error);
  }
};
```

### 场景 4：获取当前用户

```typescript
// 前端代码
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

const { user, getCurrentUser } = useAuthStore();

useEffect(() => {
  if (!user) {
    getCurrentUser();
  }
}, []);
```

### 场景 6：更新个人资料

```typescript
// 前端代码
import { useAuthStore } from "@/stores/useAuthStore";

const { updateProfile, isLoading, error } = useAuthStore();

const handleUpdateProfile = async () => {
  try {
    await updateProfile({
      name: "新姓名",
    });
    alert("个人资料更新成功");
  } catch (error) {
    console.error("更新失败:", error);
  }
};
```

### 场景 7：请求密码重置

```typescript
// 前端代码
import { authApi } from "@/api/auth";

const handleForgotPassword = async () => {
  try {
    const response = await authApi.requestPasswordReset("user@example.com");
    console.log("重置令牌:", response.resetToken); // 开发环境
    alert("重置链接已发送");
  } catch (error) {
    console.error("请求失败:", error);
  }
};
```

### 场景 8：重置密码

```typescript
// 前端代码
import { authApi } from "@/api/auth";

const handleResetPassword = async (token: string) => {
  try {
    await authApi.resetPassword({
      token,
      newPassword: "NewSecurePass123!",
    });
    alert("密码重置成功");
    navigate("/auth/login");
  } catch (error) {
    console.error("重置失败:", error);
  }
};
```

### 场景 9：退出登录

```typescript
// 前端代码
import { useAuthStore } from "@/stores/useAuthStore";

const { logout } = useAuthStore();

const handleLogout = async () => {
  await logout();
  navigate("/login");
};
```

```typescript
// 前端代码
import { useAuthStore } from "@/stores/useAuthStore";

const { logout } = useAuthStore();

const handleLogout = async () => {
  await logout();
  navigate("/login");
};
```

---

## 🔒 密码要求

用户密码必须满足以下条件：

- ✅ 至少 8 个字符
- ✅ 至少 1 个大写字母
- ✅ 至少 1 个小写字母
- ✅ 至少 1 个数字
- ✅ 至少 1 个特殊字符 (!@#$%^&\*()等)

**示例有效密码：**

- `Test123!@#`
- `SecurePass123!`
- `MyP@ssw0rd`

---

## 🛡️ 安全特性

### 自动启用的安全措施

1. **速率限制**

   - 登录接口：5 次/15 分钟（每个 IP）
   - 超过限制返回 429 错误

2. **令牌管理**

   - 访问令牌：7 天有效期
   - 刷新令牌：30 天有效期
   - 密码修改后所有令牌失效

3. **输入验证**

   - 邮箱格式验证
   - 密码强度验证
   - XSS 攻击防护

4. **错误处理**
   - 通用错误消息（防止用户枚举）
   - 敏感信息不记录日志
   - 开发/生产环境区分

---

## 🐛 故障排除

### 问题 1：数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
pg_isready

# 检查数据库是否存在
psql -l | grep neo

# 创建数据库（如果不存在）
createdb neo
```

### 问题 2：JWT_SECRET 未设置

```bash
# 错误信息：JWT_SECRET is not defined

# 解决方案：在 .env 文件中设置
JWT_SECRET="your-secret-key-here"
```

### 问题 3：端口已被占用

```bash
# 错误信息：Port 5000 is already in use

# 解决方案：修改 .env 中的 PORT
PORT=5001
```

### 问题 4：Prisma 客户端未生成

```bash
# 错误信息：Cannot find module '@prisma/client'

# 解决方案：生成 Prisma 客户端
cd Neo/server
pnpm run db:generate
```

---

## 📚 下一步

- 📖 阅读 [实施总结文档](./SECURE_LOGIN_IMPLEMENTATION_SUMMARY.md)
- 🔍 查看 [需求文档](../.kiro/specs/secure-login/requirements.md)
- 🎨 查看 [设计文档](../.kiro/specs/secure-login/design.md)
- ✅ 查看 [任务列表](../.kiro/specs/secure-login/tasks.md)

---

## 💬 获取帮助

如果遇到问题：

1. 检查控制台错误信息
2. 查看服务器日志
3. 运行测试套件确认功能正常
4. 查看相关文档

---

## 🎉 开始使用

现在你已经准备好使用 Neo 的安全登录功能了！

```bash
# 启动后端
cd Neo/server && pnpm run dev

# 启动前端
cd Neo/client && pnpm run dev

# 访问应用
open http://localhost:5173
```

祝你使用愉快！🚀
