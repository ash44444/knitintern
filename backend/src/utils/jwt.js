import jwt from "jsonwebtoken"

export function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d"
  return jwt.sign(payload, secret, { expiresIn, ...options })
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET
  return jwt.verify(token, secret)
}
