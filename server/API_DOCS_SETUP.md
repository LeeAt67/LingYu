# API 文档自动生成工具 - Swagger 配置指南

## 📦 安装依赖

```bash
cd server
pnpm add swagger-jsdoc swagger-ui-express
pnpm add -D @types/swagger-jsdoc @types/swagger-ui-express
```

## 🚀 使用方法

### 1. 启动服务器

```bash
cd server
pnpm dev
```

### 2. 访问 API 文档

打开浏览器访问: **http://localhost:5000/api-docs**

### 3. 获取 JSON 格式文档

访问: **http://localhost:5000/api-docs.json**

## ✍️ 编写 API 文档注释

### 基本格式

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: 接口简介
 *     description: 详细描述
 *     tags: [标签名]
 *     parameters:
 *       - in: query
 *         name: 参数名
 *         schema:
 *           type: string
 *         description: 参数描述
 *     responses:
 *       200:
 *         description: 成功响应
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.get('/your-endpoint', async (req, res) => {
  // 实现逻辑
})
```

### 完整示例

参考 `src/routes/recommendations.ts` 中的注释

## 📝 常用注释模板

### GET 请求

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 获取用户信息
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功
 *       404:
 *         description: 用户不存在
 */
```

### POST 请求

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 创建用户
 *     tags: [用户管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数错误
 */
```

### 需要认证的接口

```typescript
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: 获取个人资料
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 */
```

## 🎨 自定义配置

### 修改主题颜色

编辑 `src/index.ts`:

```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #6366f1 }
  `,
  customSiteTitle: 'LingYu API 文档',
  customfavIcon: '/icon-192.svg'
}))
```

### 添加更多服务器环境

编辑 `src/config/swagger.ts`:

```typescript
servers: [
  {
    url: 'http://localhost:5000',
    description: '本地开发'
  },
  {
    url: 'https://api-dev.lingyu.com',
    description: '测试环境'
  },
  {
    url: 'https://api.lingyu.com',
    description: '生产环境'
  }
]
```

## 📚 其他推荐工具

### 1. **Postman** (API 测试)
- 导入 Swagger JSON: `http://localhost:5000/api-docs.json`
- 自动生成测试集合

### 2. **Redoc** (更美观的文档)

```bash
pnpm add redoc-express
```

```typescript
import { redoc } from 'redoc-express'

app.use('/docs', redoc({
  title: 'LingYu API 文档',
  specUrl: '/api-docs.json'
}))
```

### 3. **TypeDoc** (TypeScript 代码文档)

```bash
pnpm add -D typedoc
```

```json
// package.json
{
  "scripts": {
    "docs": "typedoc --out docs src"
  }
}
```

## 🔥 最佳实践

1. ✅ **每个路由都添加 Swagger 注释**
2. ✅ **使用统一的响应格式**
3. ✅ **定义可复用的 Schema**
4. ✅ **添加示例数据**
5. ✅ **标注必填参数**
6. ✅ **说明错误码含义**

## 📖 参考资源

- [Swagger 官方文档](https://swagger.io/docs/)
- [OpenAPI 规范](https://spec.openapis.org/oas/v3.0.0)
- [swagger-jsdoc GitHub](https://github.com/Surnet/swagger-jsdoc)
