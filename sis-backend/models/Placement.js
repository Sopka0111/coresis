import mongoose from 'mongoose'

const placementSchema = new mongoose.Schema({
  // Student Information
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    ref: 'Student'
  },
  
  // Job Information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    industry: {
      type: String,
      enum: ['Healthcare', 'Wellness', 'Spa', 'Fitness', 'Rehabilitation', 'Education', 'Other']
    },
    size: {
      type: String,
      enum: ['Small (1-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)']
    },
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA'
      }
    }
  },
  
  // Position Details
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Freelance'],
    required: [true, 'Job type is required']
  },
  department: String,
  
  // Employment Details
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  hoursPerWeek: {
    type: Number,
    min: [0, 'Hours cannot be negative']
  },
  
  // Compensation
  salary: {
    amount: {
      type: Number,
      min: [0, 'Salary cannot be negative']
    },
    type: {
      type: String,
      enum: ['Hourly', 'Salary', 'Commission', 'Other']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  benefits: [{
    type: String,
    enum: ['Health Insurance', 'Dental Insurance', 'Vision Insurance', '401k', 'PTO', 'Flexible Schedule', 'Other']
  }],
  
  // Status and Progress
  status: {
    type: String,
    enum: ['Applied', 'Interviewing', 'Offered', 'Employed', 'Rejected', 'Withdrawn', 'Not Seeking'],
    default: 'Applied'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  
  // Contact Information
  employerContact: {
    name: {
      type: String,
      required: [true, 'Contact name is required']
    },
    title: String,
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true
    },
    phone: String
  },
  
  // Application Process
  applicationMethod: {
    type: String,
    enum: ['Online', 'In-Person', 'Referral', 'Career Fair', 'Networking', 'Other']
  },
  resumeSubmitted: {
    type: Boolean,
    default: false
  },
  coverLetterSubmitted: {
    type: Boolean,
    default: false
  },
  
  // Interview Information
  interviews: [{
    date: Date,
    type: {
      type: String,
      enum: ['Phone', 'Video', 'In-Person', 'Panel', 'Technical', 'Other']
    },
    interviewer: String,
    notes: String,
    outcome: {
      type: String,
      enum: ['Passed', 'Failed', 'Pending', 'Cancelled']
    }
  }],
  
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  verificationMethod: {
    type: String,
    enum: ['Email', 'Phone', 'Document', 'In-Person', 'Other']
  },
  verificationSource: String,
  
  // Performance and Feedback
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    evaluationDate: Date
  },
  
  // Additional Information
  notes: {
    type: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['Offer Letter', 'Contract', 'Performance Review', 'Certificate', 'Other']
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
  createdBy: {
    type: String
  },
  lastModifiedBy: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
placementSchema.index({ studentId: 1 })
placementSchema.index({ status: 1 })
placementSchema.index({ 'company.name': 1 })
placementSchema.index({ startDate: -1 })
placementSchema.index({ applicationDate: -1 })

// Virtual for employment duration
placementSchema.virtual('employmentDuration').get(function() {
  if (!this.startDate || !this.endDate) return null
  
  const start = new Date(this.startDate)
  const end = new Date(this.endDate)
  const diffTime = end - start
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
})

// Virtual for formatted salary
placementSchema.virtual('formattedSalary').get(function() {
  if (!this.salary.amount) return 'Not specified'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.salary.currency || 'USD'
  }).format(this.salary.amount)
})

// Virtual for days since application
placementSchema.virtual('daysSinceApplication').get(function() {
  if (!this.applicationDate) return 0
  
  const today = new Date()
  const applicationDate = new Date(this.applicationDate)
  const diffTime = today - applicationDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to set verification date
placementSchema.pre('save', function(next) {
  if (this.verified && !this.verificationDate) {
    this.verificationDate = new Date()
  }
  next()
})

// Static method to find employed students
placementSchema.statics.findEmployed = function() {
  return this.find({ 
    status: 'Employed', 
    isActive: true,
    verified: true
  })
}

// Static method to find pending applications
placementSchema.statics.findPending = function() {
  return this.find({
    status: { $in: ['Applied', 'Interviewing'] },
    isActive: true
  })
}

// Instance method to update status
placementSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n${notes}` : notes
  }
  return this.save()
}

// Instance method to add interview
placementSchema.methods.addInterview = function(interviewData) {
  this.interviews.push(interviewData)
  return this.save()
}

// Instance method to verify placement
placementSchema.methods.verify = function(method, source) {
  this.verified = true
  this.verificationMethod = method
  this.verificationSource = source
  this.verificationDate = new Date()
  return this.save()
}

export default mongoose.model('Placement', placementSchema) 