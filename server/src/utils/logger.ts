import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lingyu-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `${level}: ${message}`
        
        // 如果message是对象,格式化输出
        if (typeof message === 'object') {
          msg = `${level}: ${JSON.stringify(message, null, 2)}`
        }
        
        // 如果有额外的metadata,也输出
        if (Object.keys(metadata).length > 0) {
          msg += ` ${JSON.stringify(metadata)}`
        }
        
        return msg
      })
    )
  }))
}

export default logger
