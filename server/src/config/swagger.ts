/**
 * Swagger API 文档配置
 */
import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '好词 API 文档',
      version: '1.0.0',
      description: '好词 API 接口文档',
      contact: {
        name: 'API Support',
        email: 'support@lingyu.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '开发环境 - 后端API服务器'
      },
      {
        url: 'http://localhost:3000',
        description: '前端开发服务器(仅用于CORS测试)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '请在请求头中添加 JWT Token'
        }
      },
      schemas: {
        // 通用响应
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: '操作成功' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: '操作失败' },
            error: { type: 'string' }
          }
        },
        // 分页
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 }
          }
        },
        // 用户
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxxx123' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: '张三' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // 内容
        Content: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxxx123' },
            title: { type: 'string', example: '英语单词学习' },
            content: { type: 'string', example: '今天学习了 10 个新单词...' },
            type: { type: 'string', enum: ['TEXT', 'AUDIO', 'VIDEO'], example: 'TEXT' },
            tags: { type: 'array', items: { type: 'string' }, example: ['英语', '词汇'] },
            userId: { type: 'string', example: 'clxxx123' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // 聊天会话
        ChatSession: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxxx123' },
            userId: { type: 'string', example: 'clxxx123' },
            title: { type: 'string', example: '新对话' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // 聊天消息
        ChatMessage: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxxx123' },
            sessionId: { type: 'string', example: 'clxxx123' },
            role: { type: 'string', enum: ['user', 'assistant'], example: 'user' },
            content: { type: 'string', example: '你好' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // 学习记录
        StudySession: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxxx123' },
            userId: { type: 'string', example: 'clxxx123' },
            duration: { type: 'integer', example: 30, description: '学习时长（分钟）' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // 推荐问题
        RecommendedQuestion: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            question: { type: 'string', example: '如何快速记住这个单词的多个含义?' },
            gradient: { type: 'string', example: 'from-[#DBEAFE] to-[#BFDBFE]' },
            textColor: { type: 'string', example: 'text-[#1E3A8A]' },
            icon: { type: 'string', enum: ['book', 'message', 'lightbulb', 'sparkles'] },
            category: { type: 'string', example: '词汇学习' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // 扫描所有路由文件中的注释
  apis: [
    './src/routes/**/*.ts',
    './src/routes/**/*.js'
  ]
}

export const swaggerSpec = swaggerJsdoc(options)
