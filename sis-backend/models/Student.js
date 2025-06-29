import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  
  // Academic Information
  campus: {
    type: String,
    required: [true, 'Campus is required']
  },
  program: {
    type: String,
    required: [true, 'Program is required']
  },
  session: {
    type: String,
    required: [true, 'Session is required']
  },
  firstTerm: {
    type: Date,
    required: [true, 'First term date is required']
  },
  expectedGraduation: {
    type: Date
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['Prospective', 'Enrolled', 'Active', 'Graduated', 'Withdrawn', 'Suspended'],
    default: 'Prospective'
  },
  enrollmentStatus: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Online', 'Hybrid'],
    default: 'Full-time'
  },
  
  // Lead and Marketing
  leadSource: {
    type: String,
    enum: ['Website', 'Social Media', 'Referral', 'Advertisement', 'Career Fair', 'Other']
  },
  group: {
    type: String
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  // Financial Information
  fundingSource: {
    type: String,
    enum: ['Self-Pay', 'Federal Aid', 'Private Loan', 'Scholarship', 'Employer', 'Other']
  },
  
  // Additional Information
  notes: {
    type: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['Transcript', 'ID', 'Resume', 'Certificate', 'Other']
    },
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
studentSchema.index({ studentId: 1 })
studentSchema.index({ email: 1 })
studentSchema.index({ status: 1 })
studentSchema.index({ program: 1 })
studentSchema.index({ campus: 1 })
studentSchema.index({ name: 'text', email: 'text' })

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return this.name
})

// Virtual for age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(this.dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
})

// Pre-save middleware to generate student ID if not provided
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    const year = new Date().getFullYear().toString().slice(-2)
    const count = await mongoose.model('Student').countDocuments()
    this.studentId = `STU${year}${(count + 1).toString().padStart(4, '0')}`
  }
  next()
})

// Static method to find active students
studentSchema.statics.findActive = function() {
  return this.find({ isActive: true, status: { $in: ['Enrolled', 'Active'] } })
}

// Instance method to update status
studentSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus
  return this.save()
}

export default mongoose.model('Student', studentSchema) 