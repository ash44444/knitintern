import { Router } from "express"
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js"
import { validate } from "../middlewares/validate.js"
import { productCreateSchema, productUpdateSchema } from "../validations/product.validation.js"
import { requireAuth, requireAdmin } from "../middlewares/auth.js"

const router = Router()

// View allowed for authenticated users (adjust if you want public)
router.get("/", requireAuth, listProducts)
router.get("/:id", requireAuth, getProduct)

// Admin-only modifications
router.post("/", requireAuth, requireAdmin, validate(productCreateSchema), createProduct)
router.patch("/:id", requireAuth, requireAdmin, validate(productUpdateSchema), updateProduct)
router.delete("/:id", requireAuth, requireAdmin, deleteProduct)

export default router
