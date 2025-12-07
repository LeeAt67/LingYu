import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

// 创建内容验证 schema
const createContentSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  type: z.enum(['TEXT', 'AUDIO', 'VIDEO']).default('TEXT'),
  tags: z.array(z.string()).default([]),
});

// 更新内容验证 schema
const updateContentSchema = z.object({
  title: z.string().min(1, '标题不能为空').optional(),
  content: z.string().min(1, '内容不能为空').optional(),
  type: z.enum(['TEXT', 'AUDIO', 'VIDEO']).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: 获取用户的所有内容
 *     description: 分页获取当前用户的学习内容列表，支持按类型和标签筛选
 *     tags: [内容管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [TEXT, AUDIO, VIDEO]
 *         description: 内容类型筛选
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 标签筛选
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取内容列表
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
 *                     contents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Content'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', async (req, res) => {
  try {
    const { type, tag, page = '1', limit = '10' } = req.query;
    const userId = req.user!.userId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = { userId };
    if (type) where.type = type;
    if (tag) where.tags = { has: tag };

    // 查询内容
    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.content.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        contents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('获取内容列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取内容列表失败',
    });
  }
});

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: 获取单个内容详情
 *     description: 根据 ID 获取内容详细信息
 *     tags: [内容管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 内容 ID
 *     responses:
 *       200:
 *         description: 成功获取内容详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Content'
 *       404:
 *         description: 内容不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const content = await prisma.content.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: '内容不存在',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('获取内容详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取内容详情失败',
    });
  }
});

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: 创建新内容
 *     description: 创建一条新的学习内容
 *     tags: [内容管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: 英语单词学习
 *               content:
 *                 type: string
 *                 example: 今天学习了 10 个新单词...
 *               type:
 *                 type: string
 *                 enum: [TEXT, AUDIO, VIDEO]
 *                 default: TEXT
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [英语, 词汇]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 创建成功
 *                 data:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = createContentSchema.parse(req.body);
    const userId = req.user!.userId;

    const content = await prisma.content.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: content,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors,
      });
    }

    console.error('创建内容错误:', error);
    res.status(500).json({
      success: false,
      message: '创建内容失败',
    });
  }
});

/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: 更新内容
 *     description: 更新指定 ID 的学习内容
 *     tags: [内容管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 内容 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: 英语语法学习
 *               content:
 *                 type: string
 *                 example: 更新后的内容...
 *               type:
 *                 type: string
 *                 enum: [TEXT, AUDIO, VIDEO]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [英语, 语法]
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 内容不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const validatedData = updateContentSchema.parse(req.body);

    // 检查内容是否存在且属于当前用户
    const existingContent = await prisma.content.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: '内容不存在',
      });
    }

    // 更新内容
    const content = await prisma.content.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      message: '更新成功',
      data: content,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors,
      });
    }

    console.error('更新内容错误:', error);
    res.status(500).json({
      success: false,
      message: '更新内容失败',
    });
  }
});

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: 删除内容
 *     description: 删除指定 ID 的学习内容
 *     tags: [内容管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 内容 ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 删除成功
 *       404:
 *         description: 内容不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // 检查内容是否存在且属于当前用户
    const existingContent = await prisma.content.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: '内容不存在',
      });
    }

    // 删除内容
    await prisma.content.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除内容错误:', error);
    res.status(500).json({
      success: false,
      message: '删除内容失败',
    });
  }
});

/**
 * @swagger
 * /api/content/batch-delete:
 *   post:
 *     summary: 批量删除内容
 *     description: 批量删除多个学习内容
 *     tags: [内容管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["id1", "id2", "id3"]
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 成功删除 3 条内容
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user!.userId;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的内容ID列表',
      });
    }

    // 删除属于当前用户的内容
    const result = await prisma.content.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    res.json({
      success: true,
      message: `成功删除 ${result.count} 条内容`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error('批量删除内容错误:', error);
    res.status(500).json({
      success: false,
      message: '批量删除失败',
    });
  }
});

export default router;
