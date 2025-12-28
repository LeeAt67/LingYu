import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import swaggerUi from 'swagger-ui-express'
import logger from './utils/logger'
import authRoutes from './routes/auth'
import contentRoutes from './routes/content'
import chatRoutes from './routes/chat'
import statsRoutes from './routes/stats'
import ragRoutes from './routes/rag'
import recommendationsRoutes from './routes/recommendations'
import ollamaRoutes from './routes/ollama'
import wordsRoutes from './routes/words'
import practiceRoutes from './routes/practice'
import voiceChatRoutes from './routes/voiceChat'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { swaggerSpec } from './config/swagger'
import { setupVoiceProxy } from './ws/voiceProxy'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const prisma = new PrismaClient()
const PORT = process.env.PORT || 5000

// 初始化Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// 初始化Voice WebSocket Proxy
setupVoiceProxy(httpServer)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'LingYu API 文档'
}))

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Root route - API 信息
app.get('/', (req, res) => {
  res.json({
    name: 'LingYu Learning Platform API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      apiDocs: '/api-docs',
      api: {
        auth: '/api/auth',
        content: '/api/content',
        chat: '/api/chat',
        stats: '/api/stats',
        rag: '/api/rag',
        recommendations: '/api/recommendations',
        ollama: '/api/ollama',
        words: '/api/words',
        practice: '/api/practice',
        voiceChat: '/api/voice-chat'
      }
    },
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/rag', ragRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/ollama', ollamaRoutes)
app.use('/api/words', wordsRoutes)
app.use('/api/practice', practiceRoutes)
app.use('/api/voice-chat', voiceChatRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Socket.IO server initialized`)
})

export { prisma, io }
