import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['Admin', 'Sales Rep', 'Marketing Agent'],
    default: 'Sales Rep'
  },
  permissions: [{
    type: String,
    enum: [
      'view_students',
      'edit_students',
      'delete_students',
      'view_finance',
      'edit_finance',
      'view_reports',
      'edit_reports',
      'view_placement',
      'edit_placement',
      'view_courses',
      'edit_courses',
      'view_users',
      'edit_users',
      'system_admin'
    ]
  }],
  
  // Department and Position
  department: {
    type: String,
    enum: ['Admissions', 'Registrar', 'Finance', 'Placement', 'Academic', 'Administration'],
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  
  // Student Information (if user is a student)
  studentId: {
    type: String,
    ref: 'Student',
    sparse: true
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Security
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Profile
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // System Fields
  createdBy: {
    type: String
  },
  lastModifiedBy: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
userSchema.index({ username: 1 })
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ studentId: 1 })

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.username
})

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Pre-save middleware to set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    this.permissions = this.getDefaultPermissions(this.role)
  }
  next()
})

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to get default permissions
userSchema.methods.getDefaultPermissions = function(role) {
  const permissionMap = {
    Admin: [
      'view_students', 'edit_students', 'delete_students',
      'view_finance', 'edit_finance',
      'view_reports', 'edit_reports',
      'view_placement', 'edit_placement',
      'view_courses', 'edit_courses',
      'view_users', 'edit_users', 'system_admin'
    ],
    'Sales Rep': [
      'view_students', 'edit_students',
      'view_courses', 'edit_courses',
      'view_reports'
    ],
    'Marketing Agent': [
      'view_students',
      'view_finance', 'edit_finance',
      'view_reports'
    ]
  }
  
  return permissionMap[role] || []
}

// Instance method to check permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.permissions.includes('system_admin')
}

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    })
  }
  
  const updates = { $inc: { loginAttempts: 1 } }
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }
  
  return this.updateOne(updates)
}

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  })
}

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true })
}

// Static method to find by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true })
}

// JSON transform
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export default mongoose.model('User', userSchema) 