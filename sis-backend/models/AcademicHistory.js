import mongoose from 'mongoose'

const academicHistorySchema = new mongoose.Schema({
  // Student Reference
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    ref: 'Student'
  },
  
  // Course Information
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    ref: 'Course'
  },
  courseTitle: {
    type: String,
    required: [true, 'Course title is required']
  },
  
  // Academic Period
  term: {
    type: String,
    required: [true, 'Term is required']
  },
  session: {
    type: String,
    required: [true, 'Session is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  
  // Grades and Performance
  grade: {
    type: String,
    enum: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W', 'P', 'NP'],
    required: [true, 'Grade is required']
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [0, 'Credits cannot be negative']
  },
  
  // Attendance and Participation
  attendance: {
    totalSessions: {
      type: Number,
      default: 0
    },
    attendedSessions: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Detailed Scores
  scores: {
    assignments: {
      type: Number,
      min: 0,
      max: 100
    },
    quizzes: {
      type: Number,
      min: 0,
      max: 100
    },
    exams: {
      type: Number,
      min: 0,
      max: 100
    },
    participation: {
      type: Number,
      min: 0,
      max: 100
    },
    clinical: {
      type: Number,
      min: 0,
      max: 100
    },
    final: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['Enrolled', 'Completed', 'Withdrawn', 'Incomplete', 'Audit'],
    default: 'Enrolled'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  withdrawalDate: {
    type: Date
  },
  
  // Instructor Information
  instructor: {
    name: String,
    email: String
  },
  
  // Comments and Notes
  comments: {
    instructor: String,
    student: String,
    academic: String
  },
  
  // Retake Information
  isRetake: {
    type: Boolean,
    default: false
  },
  originalGrade: {
    type: String
  },
  retakeReason: {
    type: String
  },
  
  // Transfer Credit
  isTransferCredit: {
    type: Boolean,
    default: false
  },
  transferInstitution: {
    type: String
  },
  transferDate: {
    type: Date
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
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
academicHistorySchema.index({ studentId: 1 })
academicHistorySchema.index({ courseCode: 1 })
academicHistorySchema.index({ term: 1, session: 1 })
academicHistorySchema.index({ grade: 1 })
academicHistorySchema.index({ status: 1 })

// Virtual for GPA calculation
academicHistorySchema.virtual('gpaPoints').get(function() {
  if (!this.gradePoints || !this.credits) return 0
  return this.gradePoints * this.credits
})

// Virtual for attendance percentage
academicHistorySchema.virtual('attendancePercentage').get(function() {
  if (!this.attendance.totalSessions) return 0
  return Math.round((this.attendance.attendedSessions / this.attendance.totalSessions) * 100)
})

// Virtual for overall score
academicHistorySchema.virtual('overallScore').get(function() {
  const scores = this.scores
  if (!scores) return null
  
  const validScores = Object.values(scores).filter(score => score !== null && score !== undefined)
  if (validScores.length === 0) return null
  
  return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
})

// Pre-save middleware to calculate attendance percentage
academicHistorySchema.pre('save', function(next) {
  if (this.attendance.totalSessions > 0) {
    this.attendance.percentage = Math.round(
      (this.attendance.attendedSessions / this.attendance.totalSessions) * 100
    )
  }
  
  // Set completion date if status is completed
  if (this.status === 'Completed' && !this.completionDate) {
    this.completionDate = new Date()
  }
  
  // Set withdrawal date if status is withdrawn
  if (this.status === 'Withdrawn' && !this.withdrawalDate) {
    this.withdrawalDate = new Date()
  }
  
  next()
})

// Static method to calculate student GPA
academicHistorySchema.statics.calculateGPA = async function(studentId) {
  const records = await this.find({
    studentId,
    isActive: true,
    status: 'Completed',
    grade: { $nin: ['I', 'W', 'P', 'NP'] }
  })
  
  if (records.length === 0) return 0
  
  const totalPoints = records.reduce((sum, record) => sum + record.gpaPoints, 0)
  const totalCredits = records.reduce((sum, record) => sum + record.credits, 0)
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0
}

// Static method to find failing grades
academicHistorySchema.statics.findFailingGrades = function() {
  return this.find({
    grade: { $in: ['F', 'D', 'D-'] },
    isActive: true
  })
}

// Instance method to update grade
academicHistorySchema.methods.updateGrade = function(newGrade, gradePoints, comments = '') {
  this.grade = newGrade
  this.gradePoints = gradePoints
  if (comments) {
    this.comments.academic = comments
  }
  return this.save()
}

// Instance method to mark as incomplete
academicHistorySchema.methods.markIncomplete = function(reason) {
  this.status = 'Incomplete'
  this.grade = 'I'
  this.comments.academic = reason
  return this.save()
}

export default mongoose.model('AcademicHistory', academicHistorySchema) 