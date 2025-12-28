/**
 * 速率限制中间件
 * 防止暴力破解攻击，限制每个 IP 地址的请求频率
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

/**
 * 速率限制配置选项
 */
export interface RateLimiterOptions {
  windowMs: number; // 时间窗口（毫秒）
  maxAttempts: number; // 最大尝试次数
  blockDurationMs: number; // 阻止时长（毫秒）
  keyGenerator?: (req: Request) => string; // 自定义键生成器
  skipSuccessfulRequests?: boolean; // 成功请求是否跳过计数
}

/**
 * 默认配置：15 分钟内最多 5 次尝试
 */
const DEFAULT_OPTIONS: RateLimiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 分钟
  maxAttempts: 5,
  blockDurationMs: 15 * 60 * 1000, // 15 分钟
  keyGenerator: (req: Request) => {
    // 优先使用 X-Forwarded-For，否则使用 req.ip
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : forwarded[0];
    }
    return req.ip || 'unknown';
  },
  skipSuccessfulRequests: false,
};

/**
 * 速率限制器类
 */
export class RateLimiter {
  private options: RateLimiterOptions;

  constructor(options: Partial<RateLimiterOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 获取或创建速率限制记录
   */
  private async getOrCreateRateLimit(key: string) {
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.options.windowMs);

    // 查找现有记录
    let rateLimit = await prisma.rateLimit.findUnique({
      where: { key },
    });

    // 如果不存在或已过期，创建新记录
    if (!rateLimit || rateLimit.resetAt < now) {
      rateLimit = await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          attempts: 0,
          resetAt,
        },
        update: {
          attempts: 0,
          resetAt,
          blockedUntil: null,
        },
      });
    }

    return rateLimit;
  }

  /**
   * 增加尝试次数
   */
  private async incrementAttempts(key: string) {
    const rateLimit = await this.getOrCreateRateLimit(key);
    const now = new Date();

    // 增加计数
    const newAttempts = rateLimit.attempts + 1;

    // 如果超过限制，设置阻止时间
    const blockedUntil =
      newAttempts >= this.options.maxAttempts
        ? new Date(now.getTime() + this.options.blockDurationMs)
        : rateLimit.blockedUntil;

    return prisma.rateLimit.update({
      where: { key },
      data: {
        attempts: newAttempts,
        blockedUntil,
      },
    });
  }

  /**
   * 重置速率限制
   */
  async resetLimit(key: string): Promise<void> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.options.windowMs);

    await prisma.rateLimit.upsert({
      where: { key },
      create: {
        key,
        attempts: 0,
        resetAt,
      },
      update: {
        attempts: 0,
        resetAt,
        blockedUntil: null,
      },
    });
  }

  /**
   * 检查是否被阻止
   */
  private async isBlocked(key: string): Promise<{
    blocked: boolean;
    blockedUntil?: Date;
  }> {
    const rateLimit = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!rateLimit || !rateLimit.blockedUntil) {
      return { blocked: false };
    }

    const now = new Date();
    if (rateLimit.blockedUntil > now) {
      return {
        blocked: true,
        blockedUntil: rateLimit.blockedUntil,
      };
    }

    return { blocked: false };
  }

  /**
   * 创建中间件
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.options.keyGenerator!(req);

        // 检查是否被阻止
        const { blocked, blockedUntil } = await this.isBlocked(key);

        if (blocked && blockedUntil) {
          const retryAfter = Math.ceil(
            (blockedUntil.getTime() - Date.now()) / 1000
          );

          return res.status(429).json({
            success: false,
            message: '请求过于频繁，请稍后再试',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          });
        }

        // 增加尝试次数
        const rateLimit = await this.incrementAttempts(key);

        // 设置响应头
        res.setHeader('X-RateLimit-Limit', this.options.maxAttempts);
        res.setHeader(
          'X-RateLimit-Remaining',
          Math.max(0, this.options.maxAttempts - rateLimit.attempts)
        );
        res.setHeader(
          'X-RateLimit-Reset',
          Math.ceil(rateLimit.resetAt.getTime() / 1000)
        );

        // 如果刚好达到限制，设置 Retry-After 头
        if (rateLimit.attempts >= this.options.maxAttempts) {
          const retryAfter = Math.ceil(this.options.blockDurationMs / 1000);
          res.setHeader('Retry-After', retryAfter);
        }

        // 将 key 附加到请求对象，以便后续重置
        (req as any).rateLimitKey = key;

        next();
      } catch (error) {
        console.error('速率限制错误:', error);
        // 发生错误时不阻止请求
        next();
      }
    };
  }
}

/**
 * 创建登录速率限制中间件
 * 15 分钟内最多 5 次尝试
 */
export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 分钟
  maxAttempts: 5,
  blockDurationMs: 15 * 60 * 1000, // 15 分钟
});

/**
 * 重置速率限制的辅助函数
 * 在成功登录后调用
 */
export const resetRateLimit = async (req: Request): Promise<void> => {
  const key = (req as any).rateLimitKey;
  if (key) {
    await loginRateLimiter.resetLimit(key);
  }
};
