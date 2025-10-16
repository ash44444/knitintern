import { ok } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).lean()
    return ok(res, { id: user._id, name: user.name, email: user.email, role: user.role })
  } catch (e) {
    next(e)
  }
}
