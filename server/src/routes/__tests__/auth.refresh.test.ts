/**
 * 令牌刷新端点测试
 */
import { prisma } from '../../index';
import { passwordService } from '../../services/passwordService';
import { tokenService } from '../../services/tokenService';

describe('Token Refresh Endpoint', () => {
  let testUser: any;
  let refreshToken: string;

  beforeEach(async () => {
    // 清理测试数据
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});

    // 创建测试用户
    const hashedPassword = await passwordService.hash('Test123!');
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        password: hashedPassword,
      },
    });

    // 生成刷新令牌
    refreshToken = await tokenService.generateRefreshToken(testUser.id);
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/refresh', () => {
    it('应该使用有效的刷新令牌生成新的访问令牌', async () => {
      const result = await tokenService.refreshAccessToken(refreshToken);

      expect(result).toBeDefined();
      expect(result?.accessToken).toBeDefined();
      expect(typeof result?.accessToken).toBe('string');
      expect(result?.user).toBeDefined();
      expect(result?.user.userId).toBe(testUser.id);
    });

    it('应该返回用户信息', async () => {
      const result = await tokenService.refreshAccessToken(refreshToken);

      expect(result?.user).toBeDefined();
      expect(result?.user.userId).toBe(testUser.id);
      expect(result?.user.email).toBe(testUser.email);
    });

    it('应该验证新的访问令牌有效', async () => {
      const result = await tokenService.refreshAccessToken(refreshToken);

      const verifyResult = tokenService.verifyToken(result!.accessToken);

      expect(verifyResult.valid).toBe(true);
      expect(verifyResult.payload).toBeDefined();
      expect(verifyResult.payload?.userId).toBe(testUser.id);
      expect(verifyResult.payload?.email).toBe(testUser.email);
    });

    it('应该拒绝无效的刷新令牌', async () => {
      const invalidToken = 'invalid-token-123';
      const result = await tokenService.refreshAccessToken(invalidToken);

      expect(result).toBeNull();
    });

    it('应该拒绝过期的刷新令牌', async () => {
      // 手动设置令牌为已过期
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: {
          expiresAt: new Date(Date.now() - 1000), // 1秒前过期
        },
      });

      const result = await tokenService.refreshAccessToken(refreshToken);

      expect(result).toBeNull();
    });

    it('应该验证刷新令牌属于正确的用户', async () => {
      const userId = await tokenService.verifyRefreshToken(refreshToken);

      expect(userId).toBe(testUser.id);
    });

    it('应该处理不存在的刷新令牌', async () => {
      const nonExistentToken = 'a'.repeat(64);
      const result = await tokenService.refreshAccessToken(nonExistentToken);

      expect(result).toBeNull();
    });

    it('应该处理用户不存在的情况', async () => {
      // 删除用户
      await prisma.user.delete({
        where: { id: testUser.id },
      });

      const result = await tokenService.refreshAccessToken(refreshToken);

      expect(result).toBeNull();
    });
  });

  describe('刷新令牌验证', () => {
    it('应该验证有效的刷新令牌', async () => {
      const userId = await tokenService.verifyRefreshToken(refreshToken);

      expect(userId).toBe(testUser.id);
    });

    it('应该拒绝无效的刷新令牌', async () => {
      const userId = await tokenService.verifyRefreshToken('invalid-token');

      expect(userId).toBeNull();
    });

    it('应该检查令牌过期时间', async () => {
      const token = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      expect(token).toBeDefined();
      expect(token!.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('刷新令牌生成', () => {
    it('应该生成唯一的刷新令牌', async () => {
      const token1 = await tokenService.generateRefreshToken(testUser.id);
      const token2 = await tokenService.generateRefreshToken(testUser.id);

      expect(token1).not.toBe(token2);
    });

    it('应该设置正确的过期时间（30天）', async () => {
      const beforeGenerate = new Date();
      const token = await tokenService.generateRefreshToken(testUser.id);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
      });

      const expectedExpiry = new Date(beforeGenerate);
      expectedExpiry.setDate(expectedExpiry.getDate() + 30);

      // 允许几秒的误差
      const timeDiff = Math.abs(
        storedToken!.expiresAt.getTime() - expectedExpiry.getTime()
      );
      expect(timeDiff).toBeLessThan(5000); // 5秒误差
    });

    it('应该存储刷新令牌到数据库', async () => {
      const token = await tokenService.generateRefreshToken(testUser.id);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
      });

      expect(storedToken).toBeDefined();
      expect(storedToken?.userId).toBe(testUser.id);
    });

    it('应该生成64字符的十六进制令牌', async () => {
      const token = await tokenService.generateRefreshToken(testUser.id);

      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[0-9a-f]+$/); // 只包含十六进制字符
    });
  });
});

