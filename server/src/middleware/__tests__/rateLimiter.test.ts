/**
 * 速率限制中间件单元测试
 */
import { Request, Response, NextFunction } from 'express';
import { RateLimiter, resetRateLimit } from '../rateLimiter';
import { prisma } from '../../index';

// Mock prisma
jest.mock('../../index', () => ({
  prisma: {
    rateLimit: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('RateLimiter', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      ip: '127.0.0.1',
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('middleware', () => {
    it('应该允许第一次请求通过', async () => {
      const rateLimiter = new RateLimiter({
        windowMs: 15 * 60 * 1000,
        maxAttempts: 5,
        blockDurationMs: 15 * 60 * 1000,
      });

      const futureDate = new Date(Date.now() + 15 * 60 * 1000);

      const mockFindUnique = prisma.rateLimit.findUnique as jest.Mock;
      const mockUpsert = prisma.rateLimit.upsert as jest.Mock;
      const mockUpdate = prisma.rateLimit.update as jest.Mock;

      mockFindUnique.mockResolvedValue(null);
      mockUpsert.mockResolvedValue({
        id: 'rate1',
        key: '127.0.0.1',
        attempts: 0,
        resetAt: futureDate,
        blockedUntil: null,
      });
      mockUpdate.mockResolvedValue({
        id: 'rate1',
        key: '127.0.0.1',
        attempts: 1,
        resetAt: futureDate,
        blockedUntil: null,
      });

      const middleware = rateLimiter.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该在超过限制后阻止请求', async () => {
      const rateLimiter = new RateLimiter({
        windowMs: 15 * 60 * 1000,
        maxAttempts: 5,
        blockDurationMs: 15 * 60 * 1000,
      });

      const futureDate = new Date(Date.now() + 15 * 60 * 1000);
      const blockedUntil = new Date(Date.now() + 15 * 60 * 1000);

      const mockFindUnique = prisma.rateLimit.findUnique as jest.Mock;

      // 第一次调用：检查是否被阻止
      mockFindUnique.mockResolvedValueOnce({
        id: 'rate1',
        key: '127.0.0.1',
        attempts: 5,
        resetAt: futureDate,
        blockedUntil: blockedUntil,
      });

      const middleware = rateLimiter.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: expect.any(Number),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该设置正确的响应头', async () => {
      const rateLimiter = new RateLimiter({
        windowMs: 15 * 60 * 1000,
        maxAttempts: 5,
        blockDurationMs: 15 * 60 * 1000,
      });

      const futureDate = new Date(Date.now() + 15 * 60 * 1000);

      const mockFindUnique = prisma.rateLimit.findUnique as jest.Mock;
      const mockUpsert = prisma.rateLimit.upsert as jest.Mock;
      const mockUpdate = prisma.rateLimit.update as jest.Mock;

      mockFindUnique.mockResolvedValue(null);
      mockUpsert.mockResolvedValue({
        id: 'rate1',
        key: '127.0.0.1',
        attempts: 0,
        resetAt: futureDate,
        blockedUntil: null,
      });
      mockUpdate.mockResolvedValue({
        id: 'rate1',
        key: '127.0.0.1',
        attempts: 2,
        resetAt: futureDate,
        blockedUntil: null,
      });

      const middleware = rateLimiter.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        3
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(Number)
      );
    });

    it('应该使用 X-Forwarded-For 头作为 IP', async () => {
      const rateLimiter = new RateLimiter();

      mockReq.headers = {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      };

      const futureDate = new Date(Date.now() + 15 * 60 * 1000);

      const mockFindUnique = prisma.rateLimit.findUnique as jest.Mock;
      const mockUpsert = prisma.rateLimit.upsert as jest.Mock;
      const mockUpdate = prisma.rateLimit.update as jest.Mock;

      mockFindUnique.mockResolvedValue(null);
      mockUpsert.mockResolvedValue({
        id: 'rate1',
        key: '192.168.1.1',
        attempts: 0,
        resetAt: futureDate,
        blockedUntil: null,
      });
      mockUpdate.mockResolvedValue({
        id: 'rate1',
        key: '192.168.1.1',
        attempts: 1,
        resetAt: futureDate,
        blockedUntil: null,
      });

      const middleware = rateLimiter.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: '192.168.1.1' },
        })
      );
    });

    it('应该在发生错误时继续处理请求', async () => {
      const rateLimiter = new RateLimiter();

      const mockFindUnique = prisma.rateLimit.findUnique as jest.Mock;
      mockFindUnique.mockRejectedValue(new Error('Database error'));

      const middleware = rateLimiter.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // 即使发生错误，也应该调用 next()
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('resetLimit', () => {
    it('应该重置速率限制', async () => {
      const rateLimiter = new RateLimiter();

      const mockUpsert = prisma.rateLimit.upsert as jest.Mock;
      mockUpsert.mockResolvedValue({
        id: 'rate1',
        key: '127.0.0.1',
        attempts: 0,
        resetAt: new Date(),
        blockedUntil: null,
      });

      await rateLimiter.resetLimit('127.0.0.1');

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: '127.0.0.1' },
          update: expect.objectContaining({
            attempts: 0,
            blockedUntil: null,
          }),
        })
      );
    });
  });

  describe('resetRateLimit helper', () => {
    it('应该重置请求的速率限制', async () => {
      const mockReqWithKey = {
        ...mockReq,
        rateLimitKey: '127.0.0.1',
      };

      const mockUpsert = prisma.rateLimit.upsert as jest.Mock;
      mockUpsert.mockResolvedValue({
        id: 'rate1',
        key: '127.0.0.1',
        attempts: 0,
        resetAt: new Date(),
        blockedUntil: null,
      });

      await resetRateLimit(mockReqWithKey as Request);

      expect(mockUpsert).toHaveBeenCalled();
    });

    it('应该在没有 key 时不执行任何操作', async () => {
      const mockUpsert = prisma.rateLimit.upsert as jest.Mock;

      await resetRateLimit(mockReq as Request);

      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });
});
