import { verifyToken } from "../utils/jwt.js"
import { User } from "../models/user.model.js"

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || ""
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
    if (!token) return res.status(401).json({ success: false, message: "Missing token" })

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.sub).lean()
    if (!user) return res.status(401).json({ success: false, message: "Invalid token" })

    // Ensure consistent user object with both _id and id properties
    req.user = { 
      _id: user._id.toString(), 
      id: user._id.toString(), 
      role: user.role, 
      email: user.email, 
      name: user.name 
    }
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" })
  }
  next()
}
