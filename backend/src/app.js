import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import rateLimit from "express-rate-limit"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { createClient } from "redis" // 🧩 Redis

import v1Router from "./routes/index.js"
import { notFound, errorHandler } from "./middlewares/error.js"
import { swaggerServe, swaggerSetup } from "./docs/swagger.js"
import { logger, logSystemEvent } from "./utils/logger.js"
import { auditMiddleware } from "./middlewares/audit.js"

dotenv.config() // 🧩 Load .env variables

const app = express()

// 🧩 Redis connection setup
export const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully")
  logSystemEvent("Redis Connected", { url: process.env.REDIS_URL })
})

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err)
  logSystemEvent("Redis Connection Error", { error: err.message }, "error")
})

await redisClient.connect()
// 🧩 End Redis connection setup

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}

// Security & performance
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: false,
  }),
)
app.use(compression())

// Logging setup
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }))
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logSystemEvent('Rate Limit Exceeded', {
      ip: req.ip,
      path: req.path
    }, 'warn')
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    })
  }
})
app.use(limiter)

// Parsers
app.use(express.json({
  limit: "1mb",
  verify: (req, res, buf) => {
    req.rawBody = buf.toString()
  }
}))
app.use(express.urlencoded({ extended: true }))

// Audit logging for all API routes
app.use('/api', auditMiddleware)

// Health check
app.get("/health", (_req, res) => {
  logSystemEvent('Health Check', { status: 'ok' })
  res.json({ ok: true })
})

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Swagger docs
app.use("/api-docs", swaggerServe, swaggerSetup)

// Versioned API
app.use("/api/v1", v1Router)

// Log unhandled routes
app.use((req, res, next) => {
  logSystemEvent('Unhandled Route', {
    path: req.path,
    method: req.method,
    ip: req.ip
  }, 'warn')
  next()
})

// 404 and centralized error handling
app.use(notFound)
app.use(errorHandler)

// Log application startup
logSystemEvent('Application Started', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT
})

export default app
