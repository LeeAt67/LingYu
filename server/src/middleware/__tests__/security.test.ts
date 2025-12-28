/**
 * 安全中间件单元测试
 */
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput, csrfProtection } from '../security';

describe('Security Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      headers: {},
      method: 'POST',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('sanitizeInput', () => {
    it('应该移除请求体中的 script 标签', () => {
      mockReq.body = {
        name: 'Test<script>alert("xss")</script>User',
        email: 'test@example.com',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.name).toBe('TestUser');
      expect(mockReq.body.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该移除请求体中的 iframe 标签', () => {
      mockReq.body = {
        content: 'Hello<iframe src="evil.com"></iframe>World',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.content).toBe('HelloWorld');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该移除请求体中的事件处理器', () => {
      mockReq.body = {
        text: '<div onclick="alert(1)">Click me</div>',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.text).toBe('<div >Click me</div>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该移除 javascript: 协议', () => {
      mockReq.body = {
        link: 'javascript:alert("xss")',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.link).toBe('alert("xss")');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该清理嵌套对象', () => {
      mockReq.body = {
        user: {
          name: 'Test<script>alert(1)</script>',
          profile: {
            bio: '<iframe src="evil.com"></iframe>Bio',
          },
        },
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.user.name).toBe('Test');
      expect(mockReq.body.user.profile.bio).toBe('Bio');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该清理数组', () => {
      mockReq.body = {
        tags: [
          'normal',
          '<script>alert(1)</script>',
          'another<iframe></iframe>',
        ],
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.tags).toEqual(['normal', '', 'another']);
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该清理查询参数', () => {
      mockReq.query = {
        search: '<script>alert(1)</script>test',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query.search).toBe('test');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该清理路径参数', () => {
      mockReq.params = {
        id: '<script>alert(1)</script>123',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.params.id).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该保留正常的 HTML 标签（非危险标签）', () => {
      mockReq.body = {
        content: '<div>Hello <strong>World</strong></div>',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      // 注意：我们的清理器只移除危险标签，保留其他标签
      expect(mockReq.body.content).toBe('<div>Hello <strong>World</strong></div>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该处理 null 和 undefined 值', () => {
      mockReq.body = {
        name: 'Test',
        value: null,
        other: undefined,
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.name).toBe('Test');
      expect(mockReq.body.value).toBeNull();
      expect(mockReq.body.other).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('csrfProtection', () => {
    beforeEach(() => {
      process.env.CLIENT_URL = 'http://localhost:3000';
    });

    it('应该允许 GET 请求通过', () => {
      mockReq.method = 'GET';

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该允许 HEAD 请求通过', () => {
      mockReq.method = 'HEAD';

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该允许 OPTIONS 请求通过', () => {
      mockReq.method = 'OPTIONS';

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该允许来自允许列表的 Origin', () => {
      mockReq.method = 'POST';
      mockReq.headers = {
        origin: 'http://localhost:3000',
      };

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该拒绝来自未授权的 Origin', () => {
      mockReq.method = 'POST';
      mockReq.headers = {
        origin: 'http://evil.com',
      };

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'FORBIDDEN_ORIGIN',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该检查 Referer 头（如果没有 Origin）', () => {
      mockReq.method = 'POST';
      mockReq.headers = {
        referer: 'http://localhost:3000/page',
      };

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该在没有 Origin 或 Referer 时允许请求通过', () => {
      mockReq.method = 'POST';
      mockReq.headers = {};

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      // 没有 origin/referer 时，我们允许请求通过
      // 这是为了兼容某些客户端（如移动应用）
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
