/**
 * Ollama API 路由
 * 提供本地 AI 模型对话功能
 */
import { Router, Request, Response } from 'express'
import { ollamaService } from '../services/ollamaService'

const router: Router = Router()

/**
 * @swagger
 * /api/ollama/health:
 *   get:
 *     summary: 检查 Ollama 服务状态
 *     tags: [Ollama]
 *     responses:
 *       200:
 *         description: 服务可用
 *       503:
 *         description: 服务不可用
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await ollamaService.checkHealth()
    
    if (isHealthy) {
      res.json({
        success: true,
        message: 'Ollama 服务正常运行'
      })
    } else {
      res.status(503).json({
        success: false,
        message: 'Ollama 服务不可用，请确保 Ollama 已启动'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '检查服务状态失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * @swagger
 * /api/ollama/models:
 *   get:
 *     summary: 获取已安装的模型列表
 *     tags: [Ollama]
 *     responses:
 *       200:
 *         description: 成功获取模型列表
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = await ollamaService.listModels()
    
    res.json({
      success: true,
      data: models
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取模型列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * @swagger
 * /api/ollama/chat:
 *   post:
 *     summary: 与 AI 对话
 *     tags: [Ollama]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 用户消息
 *               context:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 学习内容上下文
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *                 description: 对话历史
 *     responses:
 *       200:
 *         description: 成功获取 AI 回复
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, context = [], history = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      })
    }

    const response = await ollamaService.chat(message, context, history)

    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Ollama 聊天错误:', error)
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'AI 服务暂时不可用',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * @swagger
 * /api/ollama/chat/stream:
 *   post:
 *     summary: 与 AI 对话（流式输出）
 *     tags: [Ollama]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               context:
 *                 type: array
 *                 items:
 *                   type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: 流式返回 AI 回复
 */
router.post('/chat/stream', async (req: Request, res: Response) => {
  try {
    const { message, context = [], history = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      })
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // 流式输出
    try {
      for await (const chunk of ollamaService.chatStream(message, context, history)) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
      }
      
      // 发送结束标记
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
    } catch (streamError) {
      res.write(`data: ${JSON.stringify({ error: '流式输出失败' })}\n\n`)
      res.end()
    }
  } catch (error) {
    console.error('Ollama 流式聊天错误:', error)
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'AI 服务暂时不可用'
    })
  }
})

/**
 * @swagger
 * /api/ollama/recommendations:
 *   post:
 *     summary: 生成学习推荐问题
 *     tags: [Ollama]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contents:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 用户的学习内容
 *     responses:
 *       200:
 *         description: 成功生成推荐问题
 */
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { contents = [] } = req.body

    const recommendations = await ollamaService.generateRecommendations(contents)

    res.json({
      success: true,
      data: recommendations
    })
  } catch (error) {
    console.error('生成推荐问题错误:', error)
    
    res.status(500).json({
      success: false,
      message: '生成推荐问题失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
