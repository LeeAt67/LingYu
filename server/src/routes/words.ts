import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * @swagger
 * /api/words/random:
 *   get:
 *     summary: 获取随机单词
 *     description: 从单词库中随机获取一个单词用于首页展示
 *     tags: [单词]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取随机单词
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
 *                     word:
 *                       type: string
 *                       example: Edge
 *                     meaning:
 *                       type: string
 *                       example: 边缘；优势
 */
router.get('/random', async (req, res) => {
  try {
    const count = await prisma.word.count();
    const skip = Math.floor(Math.random() * count);
    
    const word = await prisma.word.findFirst({
      skip,
      select: {
        word: true,
        meaning: true,
      },
    });

    if (!word) {
      return res.status(404).json({
        success: false,
        message: '暂无单词数据',
      });
    }

    res.json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('获取随机单词错误:', error);
    res.status(500).json({
      success: false,
      message: '获取随机单词失败',
    });
  }
});

/**
 * @swagger
 * /api/words:
 *   get:
 *     summary: 获取单词列表
 *     description: 分页获取单词列表，支持按等级筛选
 *     tags: [单词]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: 词汇等级筛选(四级、六级、考研等)
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
 *         description: 成功获取单词列表
 */
router.get('/', async (req, res) => {
  try {
    const { level, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (level) where.level = level;

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          options: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.word.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        words,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('获取单词列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取单词列表失败',
    });
  }
});

/**
 * @swagger
 * /api/words/{id}:
 *   get:
 *     summary: 获取单词详情
 *     description: 根据ID获取单词的详细信息，包括选项和用户学习记录
 *     tags: [单词]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取单词详情
 *       404:
 *         description: 单词不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const word = await prisma.word.findUnique({
      where: { id },
      include: {
        options: true,
        userWords: {
          where: { userId },
        },
      },
    });

    if (!word) {
      return res.status(404).json({
        success: false,
        message: '单词不存在',
      });
    }

    res.json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('获取单词详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取单词详情失败',
    });
  }
});

/**
 * @swagger
 * /api/words/user/stats:
 *   get:
 *     summary: 获取用户单词学习统计
 *     description: 获取用户的单词学习统计信息
 *     tags: [单词]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计信息
 */
router.get('/user/stats', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const [totalWords, studiedWords, practiceCount] = await Promise.all([
      prisma.word.count(),
      prisma.userWord.count({ where: { userId } }),
      prisma.practiceRecord.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        totalWords,
        studiedWords,
        practiceCount,
      },
    });
  } catch (error) {
    console.error('获取用户单词统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
    });
  }
});

/**
 * @swagger
 * /api/words/{wordId}/seen:
 *   post:
 *     summary: 记录单词被查看
 *     description: 记录用户查看了某个单词，更新见过次数
 *     tags: [单词]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功记录
 */
router.post('/:wordId/seen', async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.user!.userId;

    const userWord = await prisma.userWord.upsert({
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
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        wordId,
        seenCount: 1,
        lastSeenAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: userWord,
    });
  } catch (error) {
    console.error('记录单词查看错误:', error);
    res.status(500).json({
      success: false,
      message: '记录失败',
    });
  }
});

export default router;
