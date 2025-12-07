/**
 * 推荐问题路由
 */
import { Router } from 'express'

const router: Router = Router()

/**
 * @swagger
 * /api/recommendations/questions:
 *   get:
 *     summary: 获取个性化推荐问题
 *     description: 根据用户学习记录和偏好,返回个性化的推荐问题卡片
 *     tags: [推荐系统]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         description: 返回问题数量
 *     responses:
 *       200:
 *         description: 成功获取推荐问题
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
 *                     $ref: '#/components/schemas/RecommendedQuestion'
 *             example:
 *               success: true
 *               data:
 *                 - id: "1"
 *                   question: "如何快速记住这个单词的多个含义?"
 *                   gradient: "from-[#DBEAFE] to-[#BFDBFE]"
 *                   textColor: "text-[#1E3A8A]"
 *                   icon: "book"
 *                   category: "词汇学习"
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/questions', async (req, res) => {
  try {
    const { limit = 4 } = req.query

    // TODO: 实现个性化推荐逻辑
    const mockData = [
      {
        id: '1',
        question: '如何快速记住这个单词的多个含义?',
        gradient: 'from-[#DBEAFE] to-[#BFDBFE]',
        textColor: 'text-[#1E3A8A]',
        icon: 'book',
        category: '词汇学习'
      },
      {
        id: '2',
        question: '这个单词在句子中应该怎么用?',
        gradient: 'from-[#FCE7F3] to-[#FBCFE8]',
        textColor: 'text-[#831843]',
        icon: 'message',
        category: '语法应用'
      },
      {
        id: '3',
        question: '有什么好的记忆技巧吗?',
        gradient: 'from-[#FEF3C7] to-[#FDE68A]',
        textColor: 'text-[#78350F]',
        icon: 'lightbulb',
        category: '学习方法'
      },
      {
        id: '4',
        question: '帮我解释这个词组的文化背景',
        gradient: 'from-[#E0E7FF] to-[#C7D2FE]',
        textColor: 'text-[#3730A3]',
        icon: 'sparkles',
        category: '文化拓展'
      }
    ]

    res.json({
      success: true,
      data: mockData.slice(0, Number(limit))
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取推荐问题失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
