/**
 * 令牌服务
 * 提供 JWT 生成、验证、失效和刷新令牌管理功能
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../index';

/**
 * JWT Payload 接口
 */
export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * JWT 验证结果
 */
export interface VerifyResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * 令牌服务类
 */
class TokenService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_DAYS = 30;
  private tokenBlacklist: Set<string>;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    this.tokenBlacklist = new Set<string>();

    if (this.JWT_SECRET === 'your-secret-key') {
      console.warn('⚠️  警告: 使用默认 JWT_SECRET，请在生产环境中设置安全的密钥');
    }
  }

  /**
   * 生成访问令牌（JWT）
   * @param payload - 令牌载荷（用户 ID 和邮箱）
   * @returns JWT 令牌字符串
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.JWT_SECRET,
      {
        expiresIn: this.JWT_EXPIRES_IN,
      } as jwt.SignOptions
    );
  }

  /**
   * 生成刷新令牌
   * 刷新令牌存储在数据库中，有效期为 30 天
   * @param userId - 用户 ID
   * @returns 刷新令牌字符串
   */
  async generateRefreshToken(userId: string): Promise<string> {
    // 生成安全的随机令牌
    const token = crypto.randomBytes(32).toString('hex');

    // 计算过期时间（30天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRES_DAYS);

    // 存储到数据库
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * 验证访问令牌
   * @param token - JWT 令牌
   * @returns 验证结果
   */
  verifyToken(token: string): VerifyResult {
    try {
      // 检查令牌是否在黑名单中
      if (this.tokenBlacklist.has(token)) {
        return {
          valid: false,
          error: 'TOKEN_INVALIDATED',
        };
      }

      // 验证 JWT
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'TOKEN_EXPIRED',
        };
      }

      if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          error: 'INVALID_TOKEN',
        };
      }

      return {
        valid: false,
        error: 'VERIFICATION_FAILED',
      };
    }
  }

  /**
   * 验证刷新令牌
   * @param token - 刷新令牌
   * @returns 用户 ID（如果有效）或 null
   */
  async verifyRefreshToken(token: string): Promise<string | null> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      return null;
    }

    // 检查是否过期
    if (refreshToken.expiresAt < new Date()) {
      // 删除过期的令牌
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      return null;
    }

    return refreshToken.userId;
  }

  /**
   * 使当前令牌失效（添加到黑名单）
   * @param token - 要失效的令牌
   */
  invalidateToken(token: string): void {
    this.tokenBlacklist.add(token);
  }

  /**
   * 使用户的所有令牌失效
   * 删除数据库中的所有刷新令牌，并将当前会话的访问令牌加入黑名单
   * @param userId - 用户 ID
   * @param currentAccessToken - 当前的访问令牌（可选）
   */
  async invalidateUserTokens(userId: string, currentAccessToken?: string): Promise<void> {
    // 删除所有刷新令牌
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // 如果提供了当前访问令牌，将其加入黑名单
    if (currentAccessToken) {
      this.invalidateToken(currentAccessToken);
    }

    // 注意：由于访问令牌是无状态的，我们无法立即使所有访问令牌失效
    // 它们会在过期时间到达后自然失效
    // 在生产环境中，应该使用 Redis 存储黑名单，并定期清理过期的令牌
  }

  /**
   * 删除过期的刷新令牌（清理任务）
   * 应该定期调用此方法来清理数据库
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * 刷新访问令牌
   * 使用刷新令牌获取新的访问令牌
   * @param refreshToken - 刷新令牌
   * @returns 新的访问令牌和用户信息，如果刷新令牌无效则返回 null
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    user: TokenPayload;
  } | null> {
    // 验证刷新令牌
    const userId = await this.verifyRefreshToken(refreshToken);

    if (!userId) {
      return null;
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return null;
    }

    // 生成新的访问令牌
    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        userId: user.id,
        email: user.email,
      },
    };
  }

  /**
   * 解码令牌（不验证签名）
   * 用于调试或获取令牌信息
   * @param token - JWT 令牌
   * @returns 解码后的载荷
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * 获取令牌过期时间
   * @param token - JWT 令牌
   * @returns 过期时间（Date 对象）或 null
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }
}

// 导出单例实例
export const tokenService = new TokenService();
