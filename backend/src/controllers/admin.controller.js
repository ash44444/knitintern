import { User } from "../models/user.model.js"
import { logAdminAction, logError } from "../utils/logger.js"

export async function listUsers(req, res) {
  try {
    const users = await User.find().select("-password")

    logAdminAction(req.user._id, 'List Users', {
      count: users.length
    })

    res.json({
      success: true,
      data: { users },
    })
  } catch (error) {
    logError(error, { context: 'listUsers', adminId: req.user._id })
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    })
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params
    const { role } = req.body

    // Prevent admin from changing their own role
    if (id === req.user._id.toString()) {
      logAdminAction(req.user._id, 'Update User Role Failed - Cannot modify own role', {
        targetUserId: id,
        requestedRole: role
      }, 'failure')
      return res.status(400).json({
        success: false,
        message: "Cannot modify your own role",
      })
    }

    const user = await User.findById(id)
    if (!user) {
      logAdminAction(req.user._id, 'Update User Role Failed - User Not Found', {
        targetUserId: id,
        requestedRole: role
      }, 'failure')
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    user.role = role
    await user.save()

    logAdminAction(req.user._id, 'Update User Role Success', {
      targetUserId: id,
      oldRole: user.role,
      newRole: role
    })

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
    logError(error, { 
      context: 'updateUserRole',
      adminId: req.user._id,
      targetUserId: req.params.id,
      requestedRole: req.body.role
    })
    res.status(500).json({
      success: false,
      message: "Error updating user role",
    })
  }
}