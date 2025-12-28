/**
 * 错误处理中间件测试
 */
import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  ErrorCode,
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from '../errorHandler';

describe('ErrorHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      url: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
      body: {},
      query: {},
      originalUrl: '/api/test',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // 模拟 console.error 以避免测试输出污染
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('AppError', () => {
    it('应该创建带有正确属性的 AppError', () => {
      const error = new AppError(
        'Test error',
        400,
        ErrorCode.VALIDATION_ERROR
      );

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.isOperational).toBe(true);
    });

    it('应该使用默认值创建 AppError', () => {
      const error = new AppError('Test error');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe(ErrorCode.SERVER_ERROR);
    });

    it('应该支持详细信息', () => {
      const details = { field: 'email', message: 'Invalid email' };
      const error = new AppError(
        'Validation failed',
        400,
        ErrorCode.VALIDATION_ERROR,
        details
      );

      expect(error.details).toEqual(details);
    });
  });

  describe('errorHandler', () => {
    it('应该处理 AppError 并返回正确的响应', () => {
      const error = new AppError(
        'Test error',
        400,
        ErrorCode.VALIDATION_ERROR
      );

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Test error',
          code: ErrorCode.VALIDATION_ERROR,
        })
      );
    });

    it('应该处理普通 Error 并返回 500', () => {
      const error = new Error('Unexpected error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Unexpected error',
          code: ErrorCode.SERVER_ERROR,
        })
      );
    });

    it('应该在开发环境中包含堆栈跟踪', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('应该在生产环境中不包含堆栈跟踪', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall).not.toHaveProperty('stack');

      process.env.NODE_ENV = originalEnv;
    });

    it('应该记录错误但不包含敏感信息', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'secret123',
        token: 'abc123',
      };

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][1]);

      expect(loggedData.body.email).toBe('test@example.com');
      expect(loggedData.body.password).toBe('[REDACTED]');
      expect(loggedData.body.token).toBe('[REDACTED]');
    });

    it('应该清理查询参数中的敏感信息', () => {
      mockRequest.query = {
        userId: '123',
        token: 'secret-token',
      };

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][1]);

      expect(loggedData.query.userId).toBe('123');
      expect(loggedData.query.token).toBe('[REDACTED]');
    });
  });

  describe('notFoundHandler', () => {
    it('应该创建 404 错误并调用 next', () => {
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('/api/test'),
          statusCode: 404,
        })
      );
    });
  });

  describe('asyncHandler', () => {
    it('应该处理成功的异步函数', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(asyncFn).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该捕获异步错误并调用 next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('敏感信息保护', () => {
    const sensitiveFields = [
      'password',
      'oldPassword',
      'newPassword',
      'token',
      'refreshToken',
      'accessToken',
      'resetToken',
    ];

    sensitiveFields.forEach((field) => {
      it(`应该清理 ${field} 字段`, () => {
        mockRequest.body = {
          [field]: 'sensitive-value',
          normalField: 'normal-value',
        };

        const error = new Error('Test error');

        errorHandler(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
        const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][1]);

        expect(loggedData.body[field]).toBe('[REDACTED]');
        expect(loggedData.body.normalField).toBe('normal-value');
      });
    });
  });
});
