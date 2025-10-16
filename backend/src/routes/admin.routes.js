import { Router } from "express"
import { listUsers, updateUserRole } from "../controllers/admin.controller.js"
import { requireAuth, requireAdmin } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { updateUserRoleSchema } from "../validations/admin.validation.js"

const router = Router()

router.use(requireAuth, requireAdmin)

router.get("/users", listUsers)
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole)

export default router