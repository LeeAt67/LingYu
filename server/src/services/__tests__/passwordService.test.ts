/**
 * 密码服务单元测试
 */
import { passwordService } from '../passwordService';

describe('PasswordService', () => {
  describe('validateStrength', () => {
    it('应该拒绝太短的密码', () => {
      const result = passwordService.validateStrength('Test1!');
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('密码长度至少为 8 个字符');
    });

    it('应该拒绝没有大写字母的密码', () => {
      const result = passwordService.validateStrength('test123!@#');
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('密码必须包含至少一个大写字母');
    });

    it('应该拒绝没有小写字母的密码', () => {
      const result = passwordService.validateStrength('TEST123!@#');
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('密码必须包含至少一个小写字母');
    });

    it('应该拒绝没有数字的密码', () => {
      const result = passwordService.validateStrength('TestTest!@#');
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('密码必须包含至少一个数字');
    });

    it('应该拒绝没有特殊字符的密码', () => {
      const result = passwordService.validateStrength('Test1234');
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('密码必须包含至少一个特殊字符');
    });

    it('应该接受符合所有要求的密码', () => {
      const result = passwordService.validateStrength('Test123!@#');
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(4);
      expect(result.feedback).toHaveLength(0);
    });

    it('应该接受包含各种特殊字符的密码', () => {
      const passwords = [
        'Test123!',
        'Test123@',
        'Test123#',
        'Test123$',
        'Test123%',
        'Test123^',
        'Test123&',
        'Test123*',
      ];

      passwords.forEach((password) => {
        const result = passwordService.validateStrength(password);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('hash', () => {
    it('应该使用 bcrypt 对密码进行哈希', async () => {
      const password = 'Test123!@#';
      const hash = await passwordService.hash(password);

      // bcrypt 哈希应该以 $2a$, $2b$, 或 $2y$ 开头
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('应该为相同密码生成不同的哈希（因为使用了随机 salt）', async () => {
      const password = 'Test123!@#';
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('应该验证正确的密码', async () => {
      const password = 'Test123!@#';
      const hash = await passwordService.hash(password);
      const isValid = await passwordService.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'Test123!@#';
      const wrongPassword = 'Wrong123!@#';
      const hash = await passwordService.hash(password);
      const isValid = await passwordService.verify(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateResetToken', () => {
    it('应该生成一个十六进制字符串', () => {
      const token = passwordService.generateResetToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('应该生成足够长的令牌（64个字符，32字节）', () => {
      const token = passwordService.generateResetToken();
      expect(token.length).toBe(64);
    });

    it('应该生成唯一的令牌', () => {
      const token1 = passwordService.generateResetToken();
      const token2 = passwordService.generateResetToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('meetsMinimumRequirements', () => {
    it('应该快速验证符合要求的密码', () => {
      expect(passwordService.meetsMinimumRequirements('Test123!@#')).toBe(true);
    });

    it('应该快速拒绝不符合要求的密码', () => {
      expect(passwordService.meetsMinimumRequirements('test')).toBe(false);
      expect(passwordService.meetsMinimumRequirements('Test123')).toBe(false);
      expect(passwordService.meetsMinimumRequirements('test123!')).toBe(false);
    });
  });
});
