import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, optionalAuth } from '../middleware/auth';
import { passwordService } from '../services/passwordService';
import { tokenService } from '../services/tokenService';
import { loginRateLimiter, resetRateLimit } from '../middleware/rateLimiter';

const router: express.Router = express.Router();

// 注册验证 schema
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  name: z.string().min(2, '姓名至少2个字符'),
  password: z.string().min(8, '密码至少8个字符'),
});

// 登录验证 schema
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 创建新用户账号
 *     tags: [认证]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: 张三
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: 注册成功
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
 *                   example: 注册成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: 数据验证失败或邮箱已存在
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
router.post('/register', async (req, res) => {
  try {
    // 验证请求数据
    const validatedData = registerSchema.parse(req.body);
    const { email, name, password } = validatedData;

    // 验证密码强度
    const passwordValidation = passwordService.validateStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: '密码强度不足',
        code: 'WEAK_PASSWORD',
        errors: passwordValidation.feedback.map((msg) => ({
          field: 'password',
          message: msg,
        })),
      });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册',
        code: 'EMAIL_EXISTS',
      });
    }

    // 使用密码服务加密密码
    const hashedPassword = await passwordService.hash(password);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // 使用令牌服务生成 JWT token
    const token = tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user,
        token,
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

    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 使用邮箱和密码登录
 *     tags: [认证]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 登录成功
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
 *                   example: 登录成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: 邮箱或密码错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginRateLimiter.middleware(), async (req, res) => {
  try {
    // 验证请求数据
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 使用通用错误消息防止用户枚举
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 使用密码服务验证密码
    const isPasswordValid = await passwordService.verify(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 使用令牌服务生成 JWT token
    const token = tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    // 登录成功，重置速率限制计数器
    await resetRateLimit(req);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        code: 'VALIDATION_ERROR',
        errors: error.errors,
      });
    }

    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     description: 获取已登录用户的详细信息
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        // 明确排除密码字段
        password: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: 更新用户信息
 *     description: 更新当前用户的个人资料
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: 李四
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
 *                   $ref: '#/components/schemas/User'
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
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    // 验证姓名字段存在
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '姓名不能为空',
        code: 'MISSING_NAME',
      });
    }

    // 验证姓名类型
    if (typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: '姓名必须是字符串',
        code: 'INVALID_NAME_TYPE',
      });
    }

    // 去除首尾空格
    const trimmedName = name.trim();

    // 验证姓名长度（至少2个字符）
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: '姓名至少2个字符',
        code: 'NAME_TOO_SHORT',
      });
    }

    // 验证姓名长度（最多50个字符）
    if (trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: '姓名最多50个字符',
        code: 'NAME_TOO_LONG',
      });
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name: trimmedName },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        updatedAt: true,
        // 明确排除密码字段
        password: false,
      },
    });

    res.json({
      success: true,
      message: '更新成功',
      data: user,
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新失败',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/auth/password:
 *   put:
 *     summary: 修改密码
 *     description: 修改当前用户的登录密码
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpass123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: newpass123
 *     responses:
 *       200:
 *         description: 密码修改成功
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
 *                   example: 密码修改成功
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 旧密码错误或未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '旧密码和新密码不能为空',
        code: 'MISSING_FIELDS',
      });
    }

    // 验证新密码强度
    const passwordValidation = passwordService.validateStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: '新密码强度不足',
        code: 'WEAK_PASSWORD',
        errors: passwordValidation.feedback.map((msg) => ({
          field: 'newPassword',
          message: msg,
        })),
      });
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND',
      });
    }

    // 使用密码服务验证旧密码
    const isPasswordValid = await passwordService.verify(
      oldPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '旧密码错误',
        code: 'INVALID_OLD_PASSWORD',
      });
    }

    // 检查新密码是否与旧密码相同
    const isSamePassword = await passwordService.verify(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: '新密码不能与旧密码相同',
        code: 'SAME_PASSWORD',
      });
    }

    // 使用密码服务加密新密码
    const hashedPassword = await passwordService.hash(newPassword);

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 获取当前令牌
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    // 使该用户的所有令牌失效
    await tokenService.invalidateUserTokens(user.id, currentToken);

    // 生成新令牌
    const newToken = tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      success: true,
      message: '密码修改成功',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 退出登录
 *     description: 使当前令牌失效
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出成功
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
 *                   example: 退出登录成功
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', optionalAuth, async (req, res) => {
  try {
    // 获取当前令牌（如果存在）
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token && req.user) {
      // 如果有令牌且已认证，使令牌失效（添加到黑名单）
      tokenService.invalidateToken(token);
    }

    res.json({
      success: true,
      message: '退出登录成功',
    });
  } catch (error) {
    console.error('退出登录错误:', error);
    res.status(500).json({
      success: false,
      message: '退出登录失败',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-request:
 *   post:
 *     summary: 请求密码重置
 *     description: 生成密码重置令牌（注：实际生产环境应发送邮件）
 *     tags: [认证]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 重置令牌已生成
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
 *                   example: 密码重置令牌已生成
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: 重置令牌（生产环境应通过邮件发送）
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 邮箱不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '邮箱不能为空',
        code: 'MISSING_EMAIL',
      });
    }

    // 验证邮箱格式
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
    } catch {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确',
        code: 'INVALID_EMAIL',
      });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '该邮箱未注册',
        code: 'EMAIL_NOT_FOUND',
      });
    }

    // 生成重置令牌（64字符的随机十六进制字符串）
    const resetToken = passwordService.generateResetToken();

    // 设置令牌过期时间（1小时后）
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 删除该用户之前的所有未使用的重置令牌
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // 存储重置令牌到数据库
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // 注：在实际生产环境中，应该通过邮件发送重置链接
    // 这里直接返回令牌仅用于开发和测试
    res.json({
      success: true,
      message: '密码重置令牌已生成',
      data: {
        token: resetToken,
        // 在生产环境中不应返回令牌，而是发送邮件
      },
    });
  } catch (error) {
    console.error('密码重置请求错误:', error);
    res.status(500).json({
      success: false,
      message: '密码重置请求失败',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 重置密码
 *     description: 使用重置令牌设置新密码
 *     tags: [认证]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123...
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: NewPass123!
 *     responses:
 *       200:
 *         description: 密码重置成功
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
 *                   example: 密码重置成功
 *       400:
 *         description: 数据验证失败或令牌无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 令牌不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '令牌和新密码不能为空',
        code: 'MISSING_FIELDS',
      });
    }

    // 验证新密码强度
    const passwordValidation = passwordService.validateStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: '新密码强度不足',
        code: 'WEAK_PASSWORD',
        errors: passwordValidation.feedback.map((msg) => ({
          field: 'newPassword',
          message: msg,
        })),
      });
    }

    // 查找重置令牌
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(404).json({
        success: false,
        message: '重置令牌不存在',
        code: 'TOKEN_NOT_FOUND',
      });
    }

    // 检查令牌是否已使用
    if (resetToken.used) {
      return res.status(400).json({
        success: false,
        message: '该重置令牌已被使用',
        code: 'TOKEN_ALREADY_USED',
      });
    }

    // 检查令牌是否过期
    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({
        success: false,
        message: '重置令牌已过期',
        code: 'TOKEN_EXPIRED',
      });
    }

    // 加密新密码
    const hashedPassword = await passwordService.hash(newPassword);

    // 更新用户密码
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // 标记令牌为已使用
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    // 使该用户的所有现有 JWT 令牌失效
    await tokenService.invalidateUserTokens(resetToken.userId);

    res.json({
      success: true,
      message: '密码重置成功',
    });
  } catch (error) {
    console.error('密码重置错误:', error);
    res.status(500).json({
      success: false,
      message: '密码重置失败',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 刷新访问令牌
 *     description: 使用刷新令牌获取新的访问令牌
 *     tags: [认证]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: abc123...
 *     responses:
 *       200:
 *         description: 令牌刷新成功
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
 *                   example: 令牌刷新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       example: def456...
 *       400:
 *         description: 缺少刷新令牌
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 刷新令牌无效或已过期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '刷新令牌不能为空',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    // 使用 tokenService 刷新令牌
    const result = await tokenService.refreshAccessToken(refreshToken);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: '刷新令牌无效或已过期',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    console.error('令牌刷新错误:', error);
    res.status(500).json({
      success: false,
      message: '令牌刷新失败',
      code: 'SERVER_ERROR',
    });
  }
});

export default router;
