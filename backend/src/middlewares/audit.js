import { logUserAction, logAdminAction, logAuthEvent } from '../utils/logger.js'

export function auditMiddleware(req, res, next) {
  // Store the original send function
  const originalSend = res.send

  // Get the start time
  const startTime = Date.now()

  // Override the send function to log the response
  res.send = function (body) {
    const responseTime = Date.now() - startTime
    const user = req.user
    const path = req.originalUrl
    const method = req.method
    const statusCode = res.statusCode
    const userAgent = req.get('user-agent')
    const ip = req.ip

    // Basic request details
    const requestDetails = {
      path,
      method,
      statusCode,
      responseTime: `${responseTime}ms`,
      userAgent,
      ip
    }

    // Log based on the type of action
    if (user) {
      if (path.startsWith('/api/v1/auth')) {
        logAuthEvent(
          user._id,
          `${method} ${path}`,
          statusCode < 400 ? 'success' : 'failure',
          requestDetails
        )
      } else if (user.role === 'admin') {
        logAdminAction(
          user._id,
          `${method} ${path}`,
          requestDetails,
          statusCode < 400 ? 'success' : 'failure'
        )
      } else {
        logUserAction(
          user._id,
          `${method} ${path}`,
          requestDetails,
          statusCode < 400 ? 'success' : 'failure'
        )
      }
    }

    // Call the original send function
    originalSend.apply(res, arguments)
  }

  next()
}