/**
 * 统一错误处理中间件
 * 提供一致的错误响应格式和日志记录
 */
import { Request, Response, NextFunction } from 'express';

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 认证相关错误
  NO_TOKEN = 'NO_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALIDATED = 'TOKEN_INVALIDATED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  AUTH_FAILED = 'AUTH_FAILED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // 验证相关错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  MISSING_EMAIL = 'MISSING_EMAIL',
  MISSING_NAME = 'MISSING_NAME',
  INVALID_NAME_TYPE = 'INVALID_NAME_TYPE',
  NAME_TOO_SHORT = 'NAME_TOO_SHORT',
  NAME_TOO_LONG = 'NAME_TOO_LONG',

  // 用户相关错误
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_OLD_PASSWORD = 'INVALID_OLD_PASSWORD',
  SAME_PASSWORD = 'SAME_PASSWORD',

  // 令牌相关错误
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  TOKEN_ALREADY_USED = 'TOKEN_ALREADY_USED',
  MISSING_REFRESH_TOKEN = 'MISSING_REFRESH_TOKEN',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',

  // 服务器错误
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.SERVER_ERROR,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 统一错误响应接口
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: any[];
  stack?: string;
}

/**
 * 敏感信息过滤
 * 从日志中移除密码、令牌等敏感信息
 */
function sanitizeForLogging(data: any): any {
  if (!data) return data;

  const sensitiveFields = [
    'password',
    'oldPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    'resetToken',
  ];

  if (typeof data === 'object') {
    const sanitized = { ...data };
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * 错误日志记录
 * 不记录敏感信息
 */
function logError(error: Error | AppError, req: Request): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // 构建日志对象
  const logData: any = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    message: error.message,
  };

  // 添加错误代码（如果是 AppError）
  if (error instanceof AppError) {
    logData.code = error.code;
    logData.statusCode = error.statusCode;
  }

  // 在开发环境中添加堆栈跟踪
  if (!isProduction && error.stack) {
    logData.stack = error.stack;
  }

  // 清理请求体中的敏感信息
  if (req.body && Object.keys(req.body).length > 0) {
    logData.body = sanitizeForLogging(req.body);
  }

  // 清理查询参数中的敏感信息
  if (req.query && Object.keys(req.query).length > 0) {
    logData.query = sanitizeForLogging(req.query);
  }

  // 记录错误
  console.error('Error:', JSON.stringify(logData, null, 2));
}

/**
 * 统一错误处理中间件
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 记录错误（不包含敏感信息）
  logError(error, req);

  // 确定状态码
  const statusCode =
    error instanceof AppError ? error.statusCode : 500;

  // 确定错误代码
  const code =
    error instanceof AppError ? error.code : ErrorCode.SERVER_ERROR;

  // 构建错误响应
  const errorResponse: ErrorResponse = {
    success: false,
    message: error.message || '服务器内部错误',
    code,
  };

  // 在开发环境中添加详细信息
  if (process.env.NODE_ENV !== 'production') {
    if (error instanceof AppError && error.details) {
      errorResponse.errors = error.details;
    }
    if (error.stack) {
      errorResponse.stack = error.stack;
    }
  }

  // 发送响应
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 错误处理
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new AppError(
    `路由 ${req.originalUrl} 不存在`,
    404,
    ErrorCode.SERVER_ERROR
  );
  next(error);
}

/**
 * 异步路由处理器包装器
 * 自动捕获异步错误并传递给错误处理中间件
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
