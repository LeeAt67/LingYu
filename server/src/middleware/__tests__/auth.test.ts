/**
 * 认证中间件单元测试
 */
import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth } from '../auth';
import { tokenService } from '../../services/tokenService';

// Mock tokenService
jest.mock('../../services/tokenService', () => ({
  tokenService: {
    verifyToken: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('应该拒绝没有令牌的请求', () => {
      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'NO_TOKEN',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该接受有效的令牌', () => {
      mockReq.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockReturnValue({
        valid: true,
        payload: {
          userId: 'user123',
          email: 'test@example.com',
        },
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        userId: 'user123',
        email: 'test@example.com',
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该拒绝无效的令牌', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockReturnValue({
        valid: false,
        error: 'INVALID_TOKEN',
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'INVALID_TOKEN',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该拒绝过期的令牌', () => {
      mockReq.headers = {
        authorization: 'Bearer expired-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockReturnValue({
        valid: false,
        error: 'TOKEN_EXPIRED',
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: '认证令牌已过期',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该拒绝已失效的令牌（黑名单）', () => {
      mockReq.headers = {
        authorization: 'Bearer invalidated-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockReturnValue({
        valid: false,
        error: 'TOKEN_INVALIDATED',
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'TOKEN_INVALIDATED',
          message: '认证令牌已失效',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该正确提取 Bearer 令牌', () => {
      mockReq.headers = {
        authorization: 'Bearer my-token-123',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockReturnValue({
        valid: true,
        payload: {
          userId: 'user123',
          email: 'test@example.com',
        },
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockVerify).toHaveBeenCalledWith('my-token-123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该处理验证过程中的错误', () => {
      mockReq.headers = {
        authorization: 'Bearer error-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'AUTH_FAILED',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('应该在没有令牌时继续处理', () => {
      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该在有效令牌时设置用户信息', () => {
      mockReq.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockReturnValue({
        valid: true,
        payload: {
          userId: 'user123',
          email: 'test@example.com',
        },
      });

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        userId: 'user123',
        email: 'test@example.com',
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该在无效令牌时继续处理但不设置用户', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockReturnValue({
        valid: false,
        error: 'INVALID_TOKEN',
      });

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该在发生错误时继续处理', () => {
      mockReq.headers = {
        authorization: 'Bearer error-token',
      };

      const mockVerify = tokenService.verifyToken as jest.Mock;
      mockVerify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
