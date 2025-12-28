/**
 * 令牌服务单元测试
 */
import { tokenService, TokenPayload } from '../tokenService';
import { prisma } from '../../index';
import jwt from 'jsonwebtoken';

// Mock prisma
jest.mock('../../index', () => ({
  prisma: {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('TokenService', () => {
  const mockPayload: TokenPayload = {
    userId: 'user123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 清理令牌黑名单（通过创建新实例）
    // 注意：由于我们使用单例，这里无法完全清理
    // 但我们可以确保每个测试使用不同的令牌
  });

  describe('generateAccessToken', () => {
    it('应该生成有效的 JWT 令牌', () => {
      const token = tokenService.generateAccessToken(mockPayload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      // 验证令牌可以被解码
      const decoded = jwt.decode(token) as TokenPayload;
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('应该生成包含过期时间的令牌', () => {
      const token = tokenService.generateAccessToken(mockPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
    });
  });

  describe('verifyToken', () => {
    it('应该验证有效的令牌', () => {
      const token = tokenService.generateAccessToken(mockPayload);
      const result = tokenService.verifyToken(token);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(mockPayload.userId);
      expect(result.payload?.email).toBe(mockPayload.email);
    });

    it('应该拒绝无效的令牌', () => {
      const result = tokenService.verifyToken('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_TOKEN');
    });

    it('应该拒绝已失效的令牌', () => {
      const token = tokenService.generateAccessToken(mockPayload);
      tokenService.invalidateToken(token);

      const result = tokenService.verifyToken(token);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOKEN_INVALIDATED');
    });

    it('应该拒绝过期的令牌', () => {
      // 生成一个已过期的令牌
      const expiredToken = jwt.sign(
        mockPayload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '0s' }
      );

      // 等待一小段时间确保令牌过期
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = tokenService.verifyToken(expiredToken);
          expect(result.valid).toBe(false);
          expect(result.error).toBe('TOKEN_EXPIRED');
          resolve(undefined);
        }, 100);
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('应该生成刷新令牌并存储到数据库', async () => {
      const mockCreate = prisma.refreshToken.create as jest.Mock;
      mockCreate.mockResolvedValue({
        id: 'token123',
        token: 'refresh-token',
        userId: mockPayload.userId,
        expiresAt: new Date(),
      });

      const token = await tokenService.generateRefreshToken(mockPayload.userId);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            token: expect.any(String),
            userId: mockPayload.userId,
            expiresAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('应该验证有效的刷新令牌', async () => {
      const mockToken = 'valid-refresh-token';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const mockFindUnique = prisma.refreshToken.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValue({
        id: 'token123',
        token: mockToken,
        userId: mockPayload.userId,
        expiresAt: futureDate,
      });

      const userId = await tokenService.verifyRefreshToken(mockToken);

      expect(userId).toBe(mockPayload.userId);
    });

    it('应该拒绝不存在的刷新令牌', async () => {
      const mockFindUnique = prisma.refreshToken.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValue(null);

      const userId = await tokenService.verifyRefreshToken('non-existent-token');

      expect(userId).toBeNull();
    });

    it('应该拒绝并删除过期的刷新令牌', async () => {
      const mockToken = 'expired-refresh-token';
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockFindUnique = prisma.refreshToken.findUnique as jest.Mock;
      const mockDelete = prisma.refreshToken.delete as jest.Mock;

      mockFindUnique.mockResolvedValue({
        id: 'token123',
        token: mockToken,
        userId: mockPayload.userId,
        expiresAt: pastDate,
      });

      const userId = await tokenService.verifyRefreshToken(mockToken);

      expect(userId).toBeNull();
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'token123' },
      });
    });
  });

  describe('invalidateToken', () => {
    it('应该将令牌添加到黑名单', () => {
      // 使用唯一的 payload 确保令牌不会与其他测试冲突
      const uniquePayload = {
        userId: 'unique-user-' + Date.now(),
        email: 'unique@example.com',
      };
      const token = tokenService.generateAccessToken(uniquePayload);

      // 令牌应该是有效的
      let result = tokenService.verifyToken(token);
      expect(result.valid).toBe(true);

      // 使令牌失效
      tokenService.invalidateToken(token);

      // 令牌应该无效
      result = tokenService.verifyToken(token);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOKEN_INVALIDATED');
    });
  });

  describe('invalidateUserTokens', () => {
    it('应该删除用户的所有刷新令牌', async () => {
      const mockDeleteMany = prisma.refreshToken.deleteMany as jest.Mock;
      mockDeleteMany.mockResolvedValue({ count: 3 });

      await tokenService.invalidateUserTokens(mockPayload.userId);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: { userId: mockPayload.userId },
      });
    });

    it('应该使当前访问令牌失效', async () => {
      const token = tokenService.generateAccessToken(mockPayload);
      const mockDeleteMany = prisma.refreshToken.deleteMany as jest.Mock;
      mockDeleteMany.mockResolvedValue({ count: 0 });

      await tokenService.invalidateUserTokens(mockPayload.userId, token);

      // 令牌应该无效
      const result = tokenService.verifyToken(token);
      expect(result.valid).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('应该使用有效的刷新令牌生成新的访问令牌', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const mockFindUniqueToken = prisma.refreshToken.findUnique as jest.Mock;
      const mockFindUniqueUser = prisma.user.findUnique as jest.Mock;

      mockFindUniqueToken.mockResolvedValue({
        id: 'token123',
        token: mockRefreshToken,
        userId: mockPayload.userId,
        expiresAt: futureDate,
      });

      mockFindUniqueUser.mockResolvedValue({
        id: mockPayload.userId,
        email: mockPayload.email,
      });

      const result = await tokenService.refreshAccessToken(mockRefreshToken);

      expect(result).toBeDefined();
      expect(result?.accessToken).toBeTruthy();
      expect(result?.user.userId).toBe(mockPayload.userId);
      expect(result?.user.email).toBe(mockPayload.email);
    });

    it('应该拒绝无效的刷新令牌', async () => {
      const mockFindUnique = prisma.refreshToken.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValue(null);

      const result = await tokenService.refreshAccessToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('应该删除所有过期的刷新令牌', async () => {
      const mockDeleteMany = prisma.refreshToken.deleteMany as jest.Mock;
      mockDeleteMany.mockResolvedValue({ count: 5 });

      const count = await tokenService.cleanupExpiredTokens();

      expect(count).toBe(5);
      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe('decodeToken', () => {
    it('应该解码有效的令牌', () => {
      const token = tokenService.generateAccessToken(mockPayload);
      const decoded = tokenService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
    });

    it('应该返回 null 对于无效的令牌', () => {
      const decoded = tokenService.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('getTokenExpiration', () => {
    it('应该返回令牌的过期时间', () => {
      const token = tokenService.generateAccessToken(mockPayload);
      const expiration = tokenService.getTokenExpiration(token);

      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });

    it('应该返回 null 对于无效的令牌', () => {
      const expiration = tokenService.getTokenExpiration('invalid-token');
      expect(expiration).toBeNull();
    });
  });
});
