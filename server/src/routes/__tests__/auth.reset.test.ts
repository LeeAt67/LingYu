/**
 * 密码重置功能测试
 */
import { prisma } from '../../index';
import { passwordService } from '../../services/passwordService';

describe('Password Reset Functionality', () => {
  let testUser: any;
  let testEmail: string;

  beforeEach(async () => {
    // 清理测试数据
    await prisma.passwordResetToken.deleteMany({});
    await prisma.user.deleteMany({});

    // 创建测试用户
    testEmail = `test-${Date.now()}@example.com`;
    const hashedPassword = await passwordService.hash('OldPass123!');
    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.passwordResetToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('生成重置令牌', () => {
    it('应该为有效邮箱生成重置令牌', async () => {
      const resetToken = passwordService.generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const token = await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: testUser.id,
          expiresAt,
        },
      });

      expect(token).toBeDefined();
      expect(token.token).toBe(resetToken);
      expect(token.userId).toBe(testUser.id);
      expect(token.used).toBe(false);
      expect(token.token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('应该删除用户之前的未使用令牌', async () => {
      // 创建第一个令牌
      const token1 = passwordService.generateResetToken();
      await prisma.passwordResetToken.create({
        data: {
          token: token1,
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      // 删除旧令牌并创建新令牌
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: testUser.id,
          used: false,
        },
      });

      const token2 = passwordService.generateResetToken();
      await prisma.passwordResetToken.create({
        data: {
          token: token2,
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      // 验证第一个令牌已被删除
      const oldToken = await prisma.passwordResetToken.findUnique({
        where: { token: token1 },
      });
      expect(oldToken).toBeNull();

      // 验证第二个令牌存在
      const newToken = await prisma.passwordResetToken.findUnique({
        where: { token: token2 },
      });
      expect(newToken).toBeDefined();
    });

    it('应该设置令牌过期时间为1小时', async () => {
      const beforeCreate = new Date();
      const resetToken = passwordService.generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const token = await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: testUser.id,
          expiresAt,
        },
      });

      const expectedExpiry = new Date(beforeCreate);
      expectedExpiry.setHours(expectedExpiry.getHours() + 1);

      // 允许几秒的误差
      const timeDiff = Math.abs(
        token.expiresAt.getTime() - expectedExpiry.getTime()
      );
      expect(timeDiff).toBeLessThan(5000); // 5秒误差
    });
  });

  describe('验证重置令牌', () => {
    let resetToken: string;

    beforeEach(async () => {
      resetToken = passwordService.generateResetToken();
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 3600000), // 1小时后
        },
      });
    });

    it('应该验证有效的重置令牌', async () => {
      const token = await prisma.passwordResetToken.findUnique({
        where: { token: resetToken },
      });

      expect(token).toBeDefined();
      expect(token?.used).toBe(false);
      expect(new Date() < token!.expiresAt).toBe(true);
    });

    it('应该拒绝不存在的令牌', async () => {
      const token = await prisma.passwordResetToken.findUnique({
        where: { token: 'invalid-token-123' },
      });

      expect(token).toBeNull();
    });

    it('应该拒绝已使用的令牌', async () => {
      // 标记令牌为已使用
      await prisma.passwordResetToken.update({
        where: { token: resetToken },
        data: { used: true },
      });

      const token = await prisma.passwordResetToken.findUnique({
        where: { token: resetToken },
      });

      expect(token?.used).toBe(true);
    });

    it('应该拒绝过期的令牌', async () => {
      // 设置令牌为已过期
      await prisma.passwordResetToken.update({
        where: { token: resetToken },
        data: {
          expiresAt: new Date(Date.now() - 1000), // 1秒前过期
        },
      });

      const token = await prisma.passwordResetToken.findUnique({
        where: { token: resetToken },
      });

      expect(new Date() > token!.expiresAt).toBe(true);
    });
  });

  describe('重置密码', () => {
    let resetToken: string;

    beforeEach(async () => {
      resetToken = passwordService.generateResetToken();
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
    });

    it('应该使用有效令牌重置密码', async () => {
      const newPassword = 'NewPass123!';

      // 验证新密码强度
      const validation = passwordService.validateStrength(newPassword);
      expect(validation.isValid).toBe(true);

      // 加密新密码
      const hashedPassword = await passwordService.hash(newPassword);

      // 更新用户密码
      await prisma.user.update({
        where: { id: testUser.id },
        data: { password: hashedPassword },
      });

      // 标记令牌为已使用
      await prisma.passwordResetToken.update({
        where: { token: resetToken },
        data: { used: true },
      });

      // 验证密码已更新
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      const isPasswordValid = await passwordService.verify(
        newPassword,
        updatedUser!.password
      );
      expect(isPasswordValid).toBe(true);

      // 验证令牌已标记为已使用
      const usedToken = await prisma.passwordResetToken.findUnique({
        where: { token: resetToken },
      });
      expect(usedToken?.used).toBe(true);
    });

    it('应该拒绝弱密码', async () => {
      const weakPassword = 'weak';
      const validation = passwordService.validateStrength(weakPassword);

      expect(validation.isValid).toBe(false);
      expect(validation.feedback.length).toBeGreaterThan(0);
    });

    it('应该验证令牌单次使用', async () => {
      // 第一次使用令牌
      await prisma.passwordResetToken.update({
        where: { token: resetToken },
        data: { used: true },
      });

      // 尝试再次使用
      const token = await prisma.passwordResetToken.findUnique({
        where: { token: resetToken },
      });

      expect(token?.used).toBe(true);
    });
  });
});
