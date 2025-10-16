import dotenv from "dotenv"
dotenv.config()

import { connectDB } from "./config/db.js"
import app from "./app.js"

const PORT = process.env.PORT || 5000
app.get('/', (req, res) => {
  res.send('Hello World!');
});
async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`)
    console.log(`[docs] Swagger at http://localhost:${PORT}/api-docs`)
  })
}

start().catch((err) => {
  console.error("[server] Failed to start:", err)
  process.exit(1)
})
