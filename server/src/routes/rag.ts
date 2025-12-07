import express from 'express';
import { ragService } from '../services/ragService';

const router: express.Router = express.Router();

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
 *                 example: clxxx123
 *               question:
 *                 type: string
 *                 example: 如何快速记忆单词？
 *     responses:
 *       200:
 *         description: 成功获取答案
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/qa', async (req, res) => {
  try {
    const { userId, question } = req.body;

    if (!userId || !question) {
      return res.status(400).json({
        success: false,
        message: '用户ID和问题不能为空',
      });
    }

    const answer = await ragService.personalizedQA(userId, question);

    res.json({
      success: true,
      data: {
        question,
        answer,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('个性化问答API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

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
 *         description: 内容 ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: 返回数量
 *     responses:
 *       200:
 *         description: 成功获取相关内容
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     contentId:
 *                       type: string
 *                     relatedContents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Content'
 *                     count:
 *                       type: integer
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/related/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { userId, limit = 5 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空',
      });
    }

    const relatedContents = await ragService.findRelatedContents(
      userId as string,
      contentId,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: {
        contentId,
        relatedContents,
        count: relatedContents.length,
      },
    });
  } catch (error) {
    console.error('知识关联API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

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
 *         description: 用户 ID
 *     responses:
 *       200:
 *         description: 成功获取学习建议
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const recommendations = await ragService.generateLearningRecommendations(userId);

    res.json({
      success: true,
      data: {
        userId,
        ...recommendations,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('学习建议API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

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
 *                 example: clxxx123
 *               query:
 *                 type: string
 *                 example: 英语语法
 *               type:
 *                 type: string
 *                 example: TEXT
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: string
 *                     type:
 *                       type: string
 *                     result:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/search', async (req, res) => {
  try {
    const { userId, query, type } = req.body;

    if (!userId || !query) {
      return res.status(400).json({
        success: false,
        message: '用户ID和搜索查询不能为空',
      });
    }

    // 这里可以实现更复杂的搜索逻辑
    // 目前先使用个性化问答作为搜索结果
    const searchResult = await ragService.personalizedQA(userId, `搜索关于"${query}"的内容`);

    res.json({
      success: true,
      data: {
        query,
        type,
        result: searchResult,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('智能搜索API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

export default router;
