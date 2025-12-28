/**
 * 认证中间件
 * 验证 JWT 令牌并提取用户信息
 */
import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/tokenService';

interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 认证中间件
 * 要求请求必须包含有效的 JWT 令牌
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
        code: 'NO_TOKEN',
      });
    }

    // 使用令牌服务验证令牌（包括黑名单检查）
    const result = tokenService.verifyToken(token);

    if (!result.valid) {
      let message = '无效的认证令牌';
      let code = 'INVALID_TOKEN';

      if (result.error === 'TOKEN_EXPIRED') {
        message = '认证令牌已过期';
        code = 'TOKEN_EXPIRED';
      } else if (result.error === 'TOKEN_INVALIDATED') {
        message = '认证令牌已失效';
        code = 'TOKEN_INVALIDATED';
      }

      return res.status(401).json({
        success: false,
        message,
        code,
      });
    }

    // 将用户信息附加到请求对象
    req.user = result.payload;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    return res.status(401).json({
      success: false,
      message: '认证失败',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * 可选认证中间件
 * 如果提供了令牌则验证，但不强制要求
 * 用于可以匿名访问但登录后有额外功能的端点
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // 没有令牌，继续处理但不设置 user
      return next();
    }

    // 验证令牌
    const result = tokenService.verifyToken(token);

    if (result.valid && result.payload) {
      // 令牌有效，设置用户信息
      req.user = result.payload;
    }

    // 无论令牌是否有效，都继续处理
    next();
  } catch (error) {
    console.error('可选认证错误:', error);
    // 发生错误时继续处理，不设置 user
    next();
  }
};

