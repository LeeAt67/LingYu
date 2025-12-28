/**
 * 安全中间件
 * 提供输入清理、安全头配置和 CSRF 保护
 */
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * XSS 输入清理中间件
 * 清理请求体、查询参数和路径参数中的潜在 XSS 脚本
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 清理函数：移除潜在的 XSS 脚本
    const sanitize = (value: any): any => {
      if (typeof value === 'string') {
        // 移除 HTML 标签和脚本
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
          .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // 移除事件处理器
          .replace(/javascript:/gi, '') // 移除 javascript: 协议
          .trim();
      } else if (Array.isArray(value)) {
        return value.map(sanitize);
      } else if (value !== null && typeof value === 'object') {
        const sanitized: any = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            sanitized[key] = sanitize(value[key]);
          }
        }
        return sanitized;
      }
      return value;
    };

    // 清理请求体
    if (req.body) {
      req.body = sanitize(req.body);
    }

    // 清理查询参数
    if (req.query) {
      req.query = sanitize(req.query);
    }

    // 清理路径参数
    if (req.params) {
      req.params = sanitize(req.params);
    }

    next();
  } catch (error) {
    console.error('输入清理错误:', error);
    // 发生错误时继续处理请求
    next();
  }
};

/**
 * 配置 Helmet 安全头
 * 设置各种 HTTP 安全头以防止常见的 Web 漏洞
 */
export const securityHeaders = helmet({
  // Content Security Policy - 防止 XSS 攻击
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // X-Content-Type-Options - 防止 MIME 类型嗅探
  noSniff: true,
  // X-Frame-Options - 防止点击劫持
  frameguard: {
    action: 'deny',
  },
  // X-XSS-Protection - 启用浏览器的 XSS 过滤器
  xssFilter: true,
  // Strict-Transport-Security - 强制使用 HTTPS
  hsts: {
    maxAge: 31536000, // 1 年
    includeSubDomains: true,
    preload: true,
  },
  // Referrer-Policy - 控制 Referer 头的发送
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  // X-Permitted-Cross-Domain-Policies - 限制跨域策略
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
  // X-DNS-Prefetch-Control - 控制 DNS 预取
  dnsPrefetchControl: {
    allow: false,
  },
});

/**
 * CSRF 保护中间件（简化版）
 * 验证请求来源，防止跨站请求伪造
 * 注意：这是一个简化的实现，生产环境建议使用 csurf 包
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 跳过 GET、HEAD、OPTIONS 请求
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 检查 Origin 或 Referer 头
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5000',
  ];

  if (origin) {
    const originUrl = new URL(origin);
    const isAllowed = allowedOrigins.some((allowed) => {
      const allowedUrl = new URL(allowed);
      return (
        originUrl.protocol === allowedUrl.protocol &&
        originUrl.host === allowedUrl.host
      );
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: '禁止的请求来源',
        code: 'FORBIDDEN_ORIGIN',
      });
    }
  }

  next();
};

/**
 * 组合安全中间件
 * 按顺序应用所有安全中间件
 */
export const applySecurity = [
  securityHeaders,
  sanitizeInput,
  // csrfProtection 可选，根据需要启用
];
