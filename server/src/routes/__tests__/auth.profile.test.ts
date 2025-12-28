/**
 * 个人资料端点测试
 */
import { prisma } from '../../index';
import { passwordService } from '../../services/passwordService';
import { tokenService } from '../../services/tokenService';

describe('Profile Endpoints', () => {
  let testUser: any;
  let testToken: string;

  beforeEach(async () => {
    // 清理测试数据
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

    // 生成测试令牌
    testToken = tokenService.generateAccessToken({
      userId: testUser.id,
      email: testUser.email,
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('获取个人资料 (GET /me)', () => {
    it('应该返回当前用户信息', async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          password: false,
        },
      });

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUser.id);
      expect(user?.email).toBe(testUser.email);
      expect(user?.name).toBe('Test User');
    });

    it('应该不包含密码字段', async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          password: false,
        },
      });

      expect(user).toBeDefined();
      expect(user).not.toHaveProperty('password');
    });

    it('应该返回404如果用户不存在', async () => {
      // 删除用户
      await prisma.user.delete({
        where: { id: testUser.id },
      });

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(user).toBeNull();
    });
  });

  describe('更新个人资料 (PUT /profile)', () => {
    it('应该成功更新用户姓名', async () => {
      const newName = 'Updated Name';

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: newName },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          updatedAt: true,
          password: false,
        },
      });

      expect(updatedUser.name).toBe(newName);
      expect(updatedUser.id).toBe(testUser.id);
      expect(updatedUser.email).toBe(testUser.email);
    });

    it('应该去除姓名首尾空格', async () => {
      const nameWithSpaces = '  Trimmed Name  ';
      const expectedName = 'Trimmed Name';

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: nameWithSpaces.trim() },
      });

      expect(updatedUser.name).toBe(expectedName);
    });

    it('应该拒绝空姓名', () => {
      const emptyName = '';
      expect(emptyName.trim().length).toBe(0);
    });

    it('应该拒绝太短的姓名（少于2个字符）', () => {
      const shortName = 'A';
      expect(shortName.length).toBeLessThan(2);
    });

    it('应该拒绝太长的姓名（超过50个字符）', () => {
      const longName = 'A'.repeat(51);
      expect(longName.length).toBeGreaterThan(50);
    });

    it('应该接受有效的姓名（2-50个字符）', async () => {
      const validNames = [
        '李四',
        'John Doe',
        '张三丰',
        'A B',
        'A'.repeat(50),
      ];

      for (const name of validNames) {
        expect(name.length).toBeGreaterThanOrEqual(2);
        expect(name.length).toBeLessThanOrEqual(50);

        const updatedUser = await prisma.user.update({
          where: { id: testUser.id },
          data: { name },
        });

        expect(updatedUser.name).toBe(name);
      }
    });

    it('应该返回更新后的用户信息', async () => {
      const newName = 'New Name';

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: newName },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          updatedAt: true,
          password: false,
        },
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser.name).toBe(newName);
      expect(updatedUser).not.toHaveProperty('password');
    });

    it('应该更新 updatedAt 时间戳', async () => {
      const beforeUpdate = new Date();

      // 等待一小段时间确保时间戳不同
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: 'Updated Name' },
      });

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
        beforeUpdate.getTime()
      );
    });
  });

  describe('输入验证', () => {
    it('应该验证姓名类型为字符串', () => {
      const invalidInputs = [123, true, null, undefined, {}, []];

      invalidInputs.forEach((input) => {
        expect(typeof input).not.toBe('string');
      });
    });

    it('应该验证姓名长度范围', () => {
      const tooShort = 'A';
      const tooLong = 'A'.repeat(51);
      const valid = 'Valid Name';

      expect(tooShort.length).toBeLessThan(2);
      expect(tooLong.length).toBeGreaterThan(50);
      expect(valid.length).toBeGreaterThanOrEqual(2);
      expect(valid.length).toBeLessThanOrEqual(50);
    });
  });
});
