import winston from 'winston'
import 'winston-daily-rotate-file'
import path from 'path'

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
)

// Application logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.DailyRotateFile({
      filename: process.env.LOG_FILE || 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
})

// Audit logger for user actions
const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.DailyRotateFile({
      filename: process.env.AUDIT_LOG_FILE || 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
})

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// Log user actions
export function logUserAction(userId, action, details, status = 'success') {
  auditLogger.info('User Action', {
    type: 'user_action',
    userId,
    action,
    details,
    status
  })
}

// Log admin actions
export function logAdminAction(adminId, action, details, status = 'success') {
  auditLogger.info('Admin Action', {
    type: 'admin_action',
    adminId,
    action,
    details,
    status
  })
}

// Log authentication events
export function logAuthEvent(userId, event, status, details = {}) {
  auditLogger.info('Authentication Event', {
    type: 'auth_event',
    userId,
    event,
    status,
    details
  })
}

// Log system events
export function logSystemEvent(event, details = {}, level = 'info') {
  logger[level]('System Event', {
    type: 'system_event',
    event,
    details
  })
}

// Log errors
export function logError(error, context = {}) {
  logger.error('Error', {
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context
  })
}

export { logger }
