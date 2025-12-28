import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

// 保存转录验证 schema
const saveTranscriptionSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
  role: z.enum(['user', 'assistant'], { required_error: '角色必须是 user 或 assistant' }),
  content: z.string().min(1, '内容不能为空'),
});

// 创建语音会话验证 schema
const createVoiceSessionSchema = z.object({
  chatId: z.string().optional(),
  model: z.string().optional(),
});

/**
 * @swagger
 * /api/voice-chat/sessions:
 *   post:
 *     summary: 创建语音会话
 *     description: 创建一个新的语音通话会话
 *     tags: [语音聊天]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: 关联的聊天会话ID（可选）
 *               model:
 *                 type: string
 *                 default: qwen3-omni-flash-realtime
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/sessions', async (req, res) => {
  try {
    const validatedData = createVoiceSessionSchema.parse(req.body);
    const userId = req.user!.userId;

    const session = await prisma.voiceSession.create({
      data: {
        userId,
        chatId: validatedData.chatId,
        model: validatedData.model || 'qwen3-omni-flash-realtime',
      },
    });

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: session,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors,
      });
    }

    console.error('创建语音会话错误:', error);
    res.status(500).json({
      success: false,
      message: '创建语音会话失败',
    });
  }
});

/**
 * @swagger
 * /api/voice-chat/transcription:
 *   post:
 *     summary: 保存语音转录
 *     description: 保存语音通话的转录文本
 *     tags: [语音聊天]
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
 *               - role
 *               - content
 *             properties:
 *               sessionId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, assistant]
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 保存成功
 */
router.post('/transcription', async (req, res) => {
  try {
    const validatedData = saveTranscriptionSchema.parse(req.body);
    const userId = req.user!.userId;
    const { sessionId, role, content } = validatedData;

    // 验证会话是否属于当前用户
    const session = await prisma.voiceSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '语音会话不存在',
      });
    }

    // 创建语音消息
    const message = await prisma.voiceMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });

    res.json({
      success: true,
      message: '保存成功',
      data: {
        messageId: message.id,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors,
      });
    }

    console.error('保存转录错误:', error);
    res.status(500).json({
      success: false,
      message: '保存转录失败',
    });
  }
});

/**
 * @swagger
 * /api/voice-chat/session/{sessionId}:
 *   get:
 *     summary: 获取语音会话详情
 *     description: 获取指定语音会话的详细信息和转录消息
 *     tags: [语音聊天]
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
 *         description: 成功获取会话详情
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    // 验证会话是否属于当前用户
    const session = await prisma.voiceSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '语音会话不存在',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('获取语音会话错误:', error);
    res.status(500).json({
      success: false,
      message: '获取语音会话失败',
    });
  }
});

/**
 * @swagger
 * /api/voice-chat/history/{userId}:
 *   get:
 *     summary: 获取用户语音历史
 *     description: 获取用户的所有语音会话历史
 *     tags: [语音聊天]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取历史记录
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId: requestedUserId } = req.params;
    const currentUserId = req.user!.userId;

    // 只能查询自己的历史
    if (requestedUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: '无权访问其他用户的历史记录',
      });
    }

    const sessions = await prisma.voiceSession.findMany({
      where: { userId: currentUserId },
      include: {
        messages: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('获取语音历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取语音历史失败',
    });
  }
});

/**
 * @swagger
 * /api/voice-chat/session/{sessionId}/end:
 *   put:
 *     summary: 结束语音会话
 *     description: 标记语音会话为已结束，记录结束时间和时长
 *     tags: [语音聊天]
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
 *         description: 会话已结束
 */
router.put('/session/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    // 验证会话是否属于当前用户
    const session = await prisma.voiceSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '语音会话不存在',
      });
    }

    // 计算时长（秒）
    const endedAt = new Date();
    const duration = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);

    // 更新会话
    const updatedSession = await prisma.voiceSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        duration,
      },
    });

    res.json({
      success: true,
      message: '会话已结束',
      data: updatedSession,
    });
  } catch (error) {
    console.error('结束语音会话错误:', error);
    res.status(500).json({
      success: false,
      message: '结束语音会话失败',
    });
  }
});

export default router;
