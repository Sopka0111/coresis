import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { validationResult } from 'express-validator'
import { sendEmail } from '../utils/email.js'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h'

// Register new user
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, role, department, position } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department,
      position
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position
        }
      }
    })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is locked. Please try again later.'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts()
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts()

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    )

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          permissions: user.permissions
        }
      }
    })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    })
  }
}

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000 // 1 hour

    user.passwordResetToken = resetToken
    user.passwordResetExpires = resetTokenExpiry
    await user.save()

    // Send reset email
    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
    
    await sendEmail({
      to: user.email,
      subject: '🔐 Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    })

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent'
    })
  } catch (error) {
    console.error('Error requesting password reset:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    })
  }
}

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    user.password = hashedPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    })
  }
}

// Request email verification
export const requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    user.emailVerificationToken = verificationToken
    user.emailVerificationExpires = verificationExpiry
    await user.save()

    // Send verification email
    const verificationURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`
    
    await sendEmail({
      to: user.email,
      subject: '📧 Verify Your Email Address',
      html: `
        <h2>Email Verification</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationURL}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
      `
    })

    res.json({
      success: true,
      message: 'Verification email sent'
    })
  } catch (error) {
    console.error('Error requesting email verification:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    })
  }
}

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      })
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    console.error('Error verifying email:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    })
  }
}

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, preferences } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Update allowed fields
    if (name) user.name = name
    if (phone) user.phone = phone
    if (bio) user.bio = bio
    if (preferences) user.preferences = { ...user.preferences, ...preferences }

    await user.save()

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        preferences: user.preferences
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedNewPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    })
  }
}

// Logout (client-side token removal)
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement a blacklist here if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Error during logout:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message
    })
  }
}

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Get user
    const user = await User.findById(decoded.id).select('-password')
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    // Generate new token
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    )

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          permissions: user.permissions
        }
      }
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    })
  }
} 