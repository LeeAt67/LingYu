import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * @swagger
 * /api/practice/words:
 *   get:
 *     summary: 获取练习单词列表
 *     description: 获取用于练习的单词列表，包含选项
 *     tags: [练习]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 获取单词数量
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: 词汇等级
 *     responses:
 *       200:
 *         description: 成功获取练习单词
 */
router.get('/words', async (req, res) => {
  try {
    const { count = '10', level } = req.query;
    const userId = req.user!.userId;
    const wordCount = parseInt(count as string);

    const where: any = {};
    if (level) where.level = level;

    // 获取随机单词
    const totalWords = await prisma.word.count({ where });
    const skip = Math.max(0, Math.floor(Math.random() * (totalWords - wordCount)));

    const words = await prisma.word.findMany({
      where,
      skip,
      take: wordCount,
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
            correctCount: true,
            wrongCount: true,
          },
        },
      },
    });

    // 为每个单词添加练习次数信息
    const wordsWithStats = words.map(word => ({
      id: word.id,
      word: word.word,
      phonetic: word.phonetic,
      meaning: word.meaning,
      type: word.type,
      options: word.options.map(opt => ({
        type: opt.type,
        meaning: opt.meaning,
        isCorrect: opt.isCorrect,
      })),
      practiceCount: word.userWords[0]?.seenCount || 0,
      correctCount: word.userWords[0]?.correctCount || 0,
    }));

    res.json({
      success: true,
      data: {
        words: wordsWithStats,
        total: wordCount,
      },
    });
  } catch (error) {
    console.error('获取练习单词错误:', error);
    res.status(500).json({
      success: false,
      message: '获取练习单词失败',
    });
  }
});

/**
 * @swagger
 * /api/practice/submit:
 *   post:
 *     summary: 提交练习答案
 *     description: 提交单词练习的答案并记录结果
 *     tags: [练习]
 *     security:
 *       - bearerAuth: []
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
 *                 description: 答题耗时(秒)
 *     responses:
 *       200:
 *         description: 成功提交答案
 */
router.post('/submit', async (req, res) => {
  try {
    const { wordId, isCorrect, timeSpent } = req.body;
    const userId = req.user!.userId;

    if (!wordId || typeof isCorrect !== 'boolean' || !timeSpent) {
      return res.status(400).json({
        success: false,
        message: '参数不完整',
      });
    }

    // 记录练习结果
    const practiceRecord = await prisma.practiceRecord.create({
      data: {
        userId,
        wordId,
        isCorrect,
        timeSpent,
      },
    });

    // 更新用户单词统计
    await prisma.userWord.upsert({
      where: {
        userId_wordId: {
          userId,
          wordId,
        },
      },
      update: {
        seenCount: {
          increment: 1,
        },
        correctCount: isCorrect ? { increment: 1 } : undefined,
        wrongCount: !isCorrect ? { increment: 1 } : undefined,
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        wordId,
        seenCount: 1,
        correctCount: isCorrect ? 1 : 0,
        wrongCount: !isCorrect ? 1 : 0,
        lastSeenAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: practiceRecord,
    });
  } catch (error) {
    console.error('提交练习答案错误:', error);
    res.status(500).json({
      success: false,
      message: '提交答案失败',
    });
  }
});

/**
 * @swagger
 * /api/practice/history:
 *   get:
 *     summary: 获取练习历史
 *     description: 获取用户的练习历史记录
 *     tags: [练习]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: 成功获取练习历史
 */
router.get('/history', async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const userId = req.user!.userId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      prisma.practiceRecord.findMany({
        where: { userId },
        skip,
        take: limitNum,
        include: {
          word: {
            select: {
              word: true,
              meaning: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.practiceRecord.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('获取练习历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取练习历史失败',
    });
  }
});

/**
 * @swagger
 * /api/practice/stats:
 *   get:
 *     summary: 获取练习统计
 *     description: 获取用户的练习统计信息
 *     tags: [练习]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const [totalPractice, correctCount, todayPractice] = await Promise.all([
      prisma.practiceRecord.count({ where: { userId } }),
      prisma.practiceRecord.count({ where: { userId, isCorrect: true } }),
      prisma.practiceRecord.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const accuracy = totalPractice > 0 ? (correctCount / totalPractice) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalPractice,
        correctCount,
        todayPractice,
        accuracy: Math.round(accuracy * 100) / 100,
      },
    });
  } catch (error) {
    console.error('获取练习统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
    });
  }
});

export default router;
