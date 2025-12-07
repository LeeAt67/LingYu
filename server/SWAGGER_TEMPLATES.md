# Swagger 注释模板

## Chat.ts 接口注释

### GET /api/chat/sessions
```javascript
/**
 * @swagger
 * /api/chat/sessions:
 *   get:
 *     summary: 获取聊天会话列表
 *     description: 获取当前用户的所有聊天会话
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取会话列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatSession'
 */
```

### POST /api/chat/sessions
```javascript
/**
 * @swagger
 * /api/chat/sessions:
 *   post:
 *     summary: 创建新的聊天会话
 *     description: 创建一个新的对话会话
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: 新对话
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ChatSession'
 */
```

### GET /api/chat/sessions/:sessionId/messages
```javascript
/**
 * @swagger
 * /api/chat/sessions/{sessionId}/messages:
 *   get:
 *     summary: 获取会话的所有消息
 *     description: 获取指定会话的消息历史
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取消息列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       $ref: '#/components/schemas/ChatSession'
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChatMessage'
 */
```

### POST /api/chat/messages
```javascript
/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     summary: 发送消息
 *     description: 在指定会话中发送消息
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - content
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: clxxx123
 *               content:
 *                 type: string
 *                 example: 你好
 *     responses:
 *       200:
 *         description: 消息发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userMessage:
 *                       $ref: '#/components/schemas/ChatMessage'
 *                     assistantMessage:
 *                       $ref: '#/components/schemas/ChatMessage'
 */
```

### DELETE /api/chat/sessions/:sessionId
```javascript
/**
 * @swagger
 * /api/chat/sessions/{sessionId}:
 *   delete:
 *     summary: 删除会话
 *     description: 删除指定的聊天会话及其所有消息
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 */
```

### PUT /api/chat/sessions/:sessionId
```javascript
/**
 * @swagger
 * /api/chat/sessions/{sessionId}:
 *   put:
 *     summary: 更新会话标题
 *     description: 修改聊天会话的标题
 *     tags: [聊天]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: 英语学习讨论
 *     responses:
 *       200:
 *         description: 更新成功
 */
```

## Stats.ts 接口注释

### GET /api/stats/overview
```javascript
/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: 获取用户统计数据
 *     description: 获取用户学习数据的总体概览
 *     tags: [统计]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 */
```

### GET /api/stats/content-types
```javascript
/**
 * @swagger
 * /api/stats/content-types:
 *   get:
 *     summary: 获取内容类型分布
 *     description: 获取用户内容按类型的分布统计
 *     tags: [统计]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取内容类型分布
 */
```

### GET /api/stats/study-trend
```javascript
/**
 * @swagger
 * /api/stats/study-trend:
 *   get:
 *     summary: 获取学习趋势
 *     description: 获取指定天数内的学习趋势数据
 *     tags: [统计]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: 统计天数
 *     responses:
 *       200:
 *         description: 成功获取学习趋势
 */
```

### POST /api/stats/study-session
```javascript
/**
 * @swagger
 * /api/stats/study-session:
 *   post:
 *     summary: 创建学习记录
 *     description: 记录一次学习会话
 *     tags: [统计]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *             properties:
 *               duration:
 *                 type: integer
 *                 example: 30
 *                 description: 学习时长（分钟）
 *     responses:
 *       201:
 *         description: 学习记录创建成功
 */
```

### GET /api/stats/tags
```javascript
/**
 * @swagger
 * /api/stats/tags:
 *   get:
 *     summary: 获取标签统计
 *     description: 获取所有标签及其使用频率
 *     tags: [统计]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取标签统计
 */
```

## RAG.ts 接口注释

### POST /api/rag/qa
```javascript
/**
 * @swagger
 * /api/rag/qa:
 *   post:
 *     summary: 个性化问答
 *     description: 基于用户学习内容的个性化问答
 *     tags: [RAG]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - question
 *             properties:
 *               userId:
 *                 type: string
 *               question:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功获取答案
 */
```

### GET /api/rag/related/:contentId
```javascript
/**
 * @swagger
 * /api/rag/related/{contentId}:
 *   get:
 *     summary: 知识关联
 *     description: 查找与指定内容相关的其他内容
 *     tags: [RAG]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: 成功获取相关内容
 */
```

### GET /api/rag/recommendations/:userId
```javascript
/**
 * @swagger
 * /api/rag/recommendations/{userId}:
 *   get:
 *     summary: 学习建议
 *     description: 基于学习历史生成个性化学习建议
 *     tags: [RAG]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取学习建议
 */
```

### POST /api/rag/search
```javascript
/**
 * @swagger
 * /api/rag/search:
 *   post:
 *     summary: 智能搜索
 *     description: 在用户内容中进行智能搜索
 *     tags: [RAG]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - query
 *             properties:
 *               userId:
 *                 type: string
 *               query:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: 搜索成功
 */
```
