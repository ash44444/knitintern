import { Router } from "express"
import { signup, login, logout } from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validate.js"
import { signupSchema, loginSchema } from "../validations/auth.validation.js"

const router = Router()

router.post("/signup", validate(signupSchema), signup)
router.post("/login", validate(loginSchema), login)
router.post("/logout", logout)

export default router
