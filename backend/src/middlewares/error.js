import { logError } from "../utils/logger.js"

export function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  error.status = 404
  next(error)
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.status || 500

  // Log the error with context
  logError(err, {
    path: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
    userRole: req.user?.role,
    requestBody: req.body,
    requestQuery: req.query
  })

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}
