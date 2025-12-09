import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * @swagger
 * /api/battle/start:
 *   post:
 *     summary: 开始对战
 *     description: 创建一个新的对战记录并匹配对手
 *     tags: [对战]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wordCount
 *             properties:
 *               wordCount:
 *                 type: integer
 *                 description: 对战词汇量
 *                 example: 30
 *     responses:
 *       200:
 *         description: 成功创建对战
 */
router.post('/start', async (req, res) => {
  try {
    const { wordCount } = req.body;
    const userId = req.user!.userId;

    if (!wordCount || wordCount <= 0) {
      return res.status(400).json({
        success: false,
        message: '词汇量必须大于0',
      });
    }

    // 创建对战记录
    const battle = await prisma.battleRecord.create({
      data: {
        userId,
        wordCount,
        status: 'MATCHING',
      },
    });

    // 模拟匹配延迟后更新状态
    setTimeout(async () => {
      await prisma.battleRecord.update({
        where: { id: battle.id },
        data: { status: 'IN_PROGRESS' },
      });
    }, 2000);

    res.json({
      success: true,
      data: battle,
    });
  } catch (error) {
    console.error('开始对战错误:', error);
    res.status(500).json({
      success: false,
      message: '创建对战失败',
    });
  }
});

/**
 * @swagger
 * /api/battle/{battleId}/words:
 *   get:
 *     summary: 获取对战单词列表
 *     description: 获取指定对战的单词列表
 *     tags: [对战]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取对战单词
 */
router.get('/:battleId/words', async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user!.userId;

    // 获取对战记录
    const battle = await prisma.battleRecord.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: '对战不存在',
      });
    }

    if (battle.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权访问此对战',
      });
    }

    // 获取随机单词
    const totalWords = await prisma.word.count();
    const skip = Math.max(0, Math.floor(Math.random() * (totalWords - battle.wordCount)));

    const words = await prisma.word.findMany({
      skip,
      take: battle.wordCount,
      include: {
        options: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        userWords: {
          where: { userId },
          select: {
            seenCount: true,
          },
        },
      },
    });

    const wordsWithStats = words.map(word => ({
      id: word.id,
      word: word.word,
      options: word.options.map(opt => ({
        type: opt.type,
        meaning: opt.meaning,
      })),
      seenCount: word.userWords[0]?.seenCount || 0,
    }));

    res.json({
      success: true,
      data: {
        battleId: battle.id,
        words: wordsWithStats,
        wordCount: battle.wordCount,
      },
    });
  } catch (error) {
    console.error('获取对战单词错误:', error);
    res.status(500).json({
      success: false,
      message: '获取对战单词失败',
    });
  }
});

/**
 * @swagger
 * /api/battle/{battleId}/answer:
 *   post:
 *     summary: 提交对战答案
 *     description: 提交对战中单个单词的答案
 *     tags: [对战]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: battleId
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
 *               - wordId
 *               - isCorrect
 *               - timeSpent
 *             properties:
 *               wordId:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *               timeSpent:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 成功提交答案
 */
router.post('/:battleId/answer', async (req, res) => {
  try {
    const { battleId } = req.params;
    const { wordId, isCorrect, timeSpent } = req.body;
    const userId = req.user!.userId;

    if (!wordId || typeof isCorrect !== 'boolean' || !timeSpent) {
      return res.status(400).json({
        success: false,
        message: '参数不完整',
      });
    }

    // 记录对战单词答题
    const battleWord = await prisma.battleWord.create({
      data: {
        battleId,
        wordId,
        userId,
        isCorrect,
        timeSpent,
      },
    });

    // 更新对战分数
    if (isCorrect) {
      await prisma.battleRecord.update({
        where: { id: battleId },
        data: {
          userScore: {
            increment: 1,
          },
        },
      });
    }

    // 模拟对手答题
    const opponentCorrect = Math.random() > 0.3; // 70%正确率
    if (opponentCorrect) {
      await prisma.battleRecord.update({
        where: { id: battleId },
        data: {
          opponentScore: {
            increment: 1,
          },
        },
      });
    }

    res.json({
      success: true,
      data: battleWord,
    });
  } catch (error) {
    console.error('提交对战答案错误:', error);
    res.status(500).json({
      success: false,
      message: '提交答案失败',
    });
  }
});

/**
 * @swagger
 * /api/battle/{battleId}/complete:
 *   post:
 *     summary: 完成对战
 *     description: 标记对战为已完成并计算结果
 *     tags: [对战]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 对战完成
 */
router.post('/:battleId/complete', async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user!.userId;

    const battle = await prisma.battleRecord.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: '对战不存在',
      });
    }

    if (battle.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权访问此对战',
      });
    }

    // 计算对战时长
    const duration = Math.floor((new Date().getTime() - battle.createdAt.getTime()) / 1000);

    // 更新对战状态
    const updatedBattle = await prisma.battleRecord.update({
      where: { id: battleId },
      data: {
        status: 'COMPLETED',
        isWin: battle.userScore > battle.opponentScore,
        duration,
      },
    });

    res.json({
      success: true,
      data: updatedBattle,
    });
  } catch (error) {
    console.error('完成对战错误:', error);
    res.status(500).json({
      success: false,
      message: '完成对战失败',
    });
  }
});

/**
 * @swagger
 * /api/battle/history:
 *   get:
 *     summary: 获取对战历史
 *     description: 获取用户的对战历史记录
 *     tags: [对战]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取对战历史
 */
router.get('/history', async (req, res) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const userId = req.user!.userId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [battles, total] = await Promise.all([
      prisma.battleRecord.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.battleRecord.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        battles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('获取对战历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取对战历史失败',
    });
  }
});

/**
 * @swagger
 * /api/battle/stats:
 *   get:
 *     summary: 获取对战统计
 *     description: 获取用户的对战统计信息
 *     tags: [对战]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const [totalBattles, wins, totalScore] = await Promise.all([
      prisma.battleRecord.count({
        where: { userId, status: 'COMPLETED' },
      }),
      prisma.battleRecord.count({
        where: { userId, status: 'COMPLETED', isWin: true },
      }),
      prisma.battleRecord.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: {
          userScore: true,
        },
      }),
    ]);

    const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalBattles,
        wins,
        losses: totalBattles - wins,
        winRate: Math.round(winRate * 100) / 100,
        totalScore: totalScore._sum.userScore || 0,
      },
    });
  } catch (error) {
    console.error('获取对战统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
    });
  }
});

export default router;
