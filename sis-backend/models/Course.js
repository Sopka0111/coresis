import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  // Course Information
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Academic Information
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [0, 'Credits cannot be negative']
  },
  hours: {
    lecture: {
      type: Number,
      default: 0
    },
    lab: {
      type: Number,
      default: 0
    },
    clinical: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: [true, 'Total hours are required']
    }
  },
  
  // Term and Session
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
  
  // Instructor Information
  instructor: {
    name: {
      type: String,
      required: [true, 'Instructor name is required']
    },
    email: {
      type: String,
      required: [true, 'Instructor email is required'],
      lowercase: true
    },
    phone: String,
    department: String
  },
  
  // Schedule Information
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: String,
    endTime: String,
    room: String,
    building: String
  },
  
  // Enrollment Information
  enrollmentLimit: {
    type: Number,
    required: [true, 'Enrollment limit is required'],
    min: [1, 'Enrollment limit must be at least 1']
  },
  enrolledStudents: [{
    studentId: {
      type: String,
      ref: 'Student'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Enrolled', 'Dropped', 'Completed', 'Withdrawn'],
      default: 'Enrolled'
    }
  }],
  
  // Prerequisites
  prerequisites: [{
    courseCode: {
      type: String,
      ref: 'Course'
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F', 'Pass', 'Fail']
    }
  }],
  
  // Course Materials
  materials: [{
    type: {
      type: String,
      enum: ['Textbook', 'Equipment', 'Software', 'Other']
    },
    name: String,
    description: String,
    cost: Number,
    required: {
      type: Boolean,
      default: true
    }
  }],
  
  // Grading Information
  gradingPolicy: {
    assignments: {
      type: Number,
      default: 0
    },
    quizzes: {
      type: Number,
      default: 0
    },
    exams: {
      type: Number,
      default: 0
    },
    participation: {
      type: Number,
      default: 0
    },
    clinical: {
      type: Number,
      default: 0
    }
  },
  
  // Course Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Cancelled', 'Completed'],
    default: 'Active'
  },
  
  // Additional Information
  notes: {
    type: String
  },
  syllabus: {
    type: String
  },
  
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
courseSchema.index({ courseCode: 1 })
courseSchema.index({ term: 1, session: 1 })
courseSchema.index({ instructor: 1 })
courseSchema.index({ status: 1 })
courseSchema.index({ title: 'text', description: 'text' })

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.filter(student => student.status === 'Enrolled').length
})

// Virtual for available seats
courseSchema.virtual('availableSeats').get(function() {
  return this.enrollmentLimit - this.enrollmentCount
})

// Virtual for enrollment percentage
courseSchema.virtual('enrollmentPercentage').get(function() {
  return Math.round((this.enrollmentCount / this.enrollmentLimit) * 100)
})

// Virtual for course duration
courseSchema.virtual('duration').get(function() {
  if (!this.schedule.startTime || !this.schedule.endTime) return null
  
  const start = new Date(`2000-01-01 ${this.schedule.startTime}`)
  const end = new Date(`2000-01-01 ${this.schedule.endTime}`)
  const diffMs = end - start
  const diffHours = diffMs / (1000 * 60 * 60)
  
  return diffHours
})

// Pre-save middleware to validate enrollment limit
courseSchema.pre('save', function(next) {
  if (this.enrollmentCount > this.enrollmentLimit) {
    return next(new Error('Enrollment count cannot exceed enrollment limit'))
  }
  next()
})

// Static method to find courses by term
courseSchema.statics.findByTerm = function(term, session) {
  return this.find({ term, session, isActive: true })
}

// Static method to find courses by instructor
courseSchema.statics.findByInstructor = function(instructorEmail) {
  return this.find({ 'instructor.email': instructorEmail, isActive: true })
}

// Instance method to enroll student
courseSchema.methods.enrollStudent = function(studentId) {
  if (this.enrollmentCount >= this.enrollmentLimit) {
    throw new Error('Course is full')
  }
  
  const existingEnrollment = this.enrolledStudents.find(
    enrollment => enrollment.studentId === studentId
  )
  
  if (existingEnrollment) {
    throw new Error('Student is already enrolled')
  }
  
  this.enrolledStudents.push({
    studentId,
    enrollmentDate: new Date(),
    status: 'Enrolled'
  })
  
  return this.save()
}

// Instance method to drop student
courseSchema.methods.dropStudent = function(studentId) {
  const enrollment = this.enrolledStudents.find(
    enrollment => enrollment.studentId === studentId
  )
  
  if (!enrollment) {
    throw new Error('Student is not enrolled in this course')
  }
  
  enrollment.status = 'Dropped'
  return this.save()
}

export default mongoose.model('Course', courseSchema) 