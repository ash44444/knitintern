import { Router } from "express"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import productRoutes from "./product.routes.js"
import adminRoutes from "./admin.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/products", productRoutes)
router.use("/admin", adminRoutes)

export default router
