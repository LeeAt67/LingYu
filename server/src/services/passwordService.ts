/**
 * 密码服务
 * 提供密码哈希、验证、强度检查和重置令牌生成功能
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * 密码强度验证结果
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
}

/**
 * 密码服务类
 */
class PasswordService {
  private readonly SALT_ROUNDS = 10;
  private readonly MIN_LENGTH = 8;
  private readonly RESET_TOKEN_LENGTH = 32;

  /**
   * 验证密码强度
   * 要求：至少8个字符，包含大写字母、小写字母、数字和特殊字符
   * @param password - 待验证的密码
   * @returns 验证结果
   */
  validateStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = [];
    let score = 0;

    // 检查长度
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`密码长度至少为 ${this.MIN_LENGTH} 个字符`);
    } else {
      score++;
    }

    // 检查大写字母
    if (!/[A-Z]/.test(password)) {
      feedback.push('密码必须包含至少一个大写字母');
    } else {
      score++;
    }

    // 检查小写字母
    if (!/[a-z]/.test(password)) {
      feedback.push('密码必须包含至少一个小写字母');
    } else {
      score++;
    }

    // 检查数字
    if (!/[0-9]/.test(password)) {
      feedback.push('密码必须包含至少一个数字');
    } else {
      score++;
    }

    // 检查特殊字符
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('密码必须包含至少一个特殊字符');
    } else {
      score++;
    }

    const isValid = feedback.length === 0;

    return {
      isValid,
      score: isValid ? 4 : score,
      feedback,
    };
  }

  /**
   * 对密码进行哈希
   * 使用 bcrypt 算法，salt rounds 为 10
   * @param password - 明文密码
   * @returns 哈希后的密码
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * 验证密码是否匹配
   * @param password - 明文密码
   * @param hash - 哈希密码
   * @returns 是否匹配
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 生成密码重置令牌
   * 生成一个安全的随机令牌
   * @returns 重置令牌（十六进制字符串）
   */
  generateResetToken(): string {
    return crypto.randomBytes(this.RESET_TOKEN_LENGTH).toString('hex');
  }

  /**
   * 检查密码是否符合最低要求（用于快速验证）
   * @param password - 待检查的密码
   * @returns 是否符合要求
   */
  meetsMinimumRequirements(password: string): boolean {
    return (
      password.length >= this.MIN_LENGTH &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
  }
}

// 导出单例实例
export const passwordService = new PasswordService();
