import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { logAuthEvent, logError } from "../utils/logger.js"

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      logAuthEvent(null, 'Signup Failed - Email Exists', 'failure', { email })
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      })
    }

    // Hash password directly (let the model's pre-save hook handle it)
    // Create user - the model's pre-save hook will hash the password
    const user = await User.create({
      name: name || email.split('@')[0], // Use name or fallback to email username
      email,
      password: password, // Model will hash this
      role: "user",
    })

    // Generate JWT token
    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    logAuthEvent(user._id, 'Signup Success', 'success', { email })

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    logError(error, { context: 'signup', email: req.body.email })
    res.status(500).json({
      success: false,
      message: "Error creating user",
    })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      logAuthEvent(null, 'Login Failed - User Not Found', 'failure', { email })
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password - use the comparePassword method from the model
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password)
    } catch (error) {
      logError(error, { context: 'login-password-compare', email: email })
      return res.status(500).json({
        success: false,
        message: "Error during authentication",
      })
    }
    
    if (!isMatch) {
      logAuthEvent(user._id, 'Login Failed - Invalid Password', 'failure', { email })
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    logAuthEvent(user._id, 'Login Success', 'success', { email })

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    logError(error, { context: 'login', email: req.body.email })
    res.status(500).json({
      success: false,
      message: "Error logging in",
    })
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      logAuthEvent(req.user._id, 'Get Profile Failed - User Not Found', 'failure')
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    logAuthEvent(user._id, 'Get Profile Success', 'success')

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    logError(error, { context: 'getMe', userId: req.user._id })
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    })
  }
}

export async function logout(req, res) {
  try {
    // Log the logout event
    logAuthEvent(req.user?._id, 'Logout Success', 'success')

    res.json({
      success: true,
      message: "Successfully logged out",
    })
  } catch (error) {
    logError(error, { context: 'logout', userId: req.user?._id })
    res.status(500).json({
      success: false,
      message: "Error during logout",
    })
  }
}
