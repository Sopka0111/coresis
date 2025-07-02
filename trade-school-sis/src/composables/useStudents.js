import { ref, computed, readonly } from 'vue'

const students = ref([
  {
    id: '1',
    studentId: 'ST2024001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1995-08-15',
    address: '123 Main St, City, State 12345',
    emergencyContact: {
      name: 'Mary Johnson',
      phone: '(555) 123-4568',
      relationship: 'Mother'
    },
    enrollmentStatus: 'Active',
    program: 'Massage Therapy Certification',
    enrollmentDate: '2024-01-15',
    expectedGraduation: '2024-12-15',
    gpa: 3.7,
    creditsEarned: 45,
    totalCredits: 60,
    attendanceRate: 92,
    accountBalance: -1250.00,
    documents: [
      {
        id: '1',
        name: 'Transcript.pdf',
        type: 'Academic',
        uploadDate: '2024-01-10',
        size: '245 KB'
      }
    ],
    notes: [
      {
        id: '1',
        date: '2024-01-10',
        author: 'Admin',
        content: 'Student showing excellent progress in practical courses.',
        type: 'academic'
      }
    ]
  },
  {
    id: '2',
    studentId: 'ST2024002',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1992-03-22',
    address: '456 Oak Ave, City, State 12345',
    emergencyContact: {
      name: 'Linda Chen',
      phone: '(555) 234-5679',
      relationship: 'Wife'
    },
    enrollmentStatus: 'Active',
    program: 'Advanced Massage Therapy',
    enrollmentDate: '2023-09-01',
    expectedGraduation: '2024-08-30',
    gpa: 3.9,
    creditsEarned: 75,
    totalCredits: 80,
    attendanceRate: 96,
    accountBalance: 0,
    documents: [],
    notes: []
  }
])

const leads = ref([
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@example.com',
    phone: '(555) 345-6789',
    source: 'Website',
    program: 'Massage Therapy Certification',
    stage: 'inquiry',
    lastContact: '2024-01-15',
    nextFollowUp: '2024-01-20',
    notes: 'Interested in evening classes',
    priority: 'high'
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Rodriguez',
    email: 'james.rodriguez@example.com',
    phone: '(555) 456-7890',
    source: 'Referral',
    program: 'Advanced Massage Therapy',
    stage: 'applied',
    lastContact: '2024-01-12',
    notes: 'Has previous experience in wellness',
    priority: 'medium'
  }
])

export function useStudents() {
  // Computed properties
  const activeStudents = computed(() => 
    students.value.filter(s => s.enrollmentStatus === 'Active')
  )

  const totalCreditsEarned = computed(() =>
    students.value.reduce((total, student) => total + student.creditsEarned, 0)
  )

  const averageGPA = computed(() => {
    const activeGPAs = activeStudents.value.map(s => s.gpa)
    return activeGPAs.length > 0 
      ? activeGPAs.reduce((sum, gpa) => sum + gpa, 0) / activeGPAs.length 
      : 0
  })

  const averageAttendance = computed(() => {
    const attendanceRates = activeStudents.value.map(s => s.attendanceRate)
    return attendanceRates.length > 0
      ? attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length
      : 0
  })

  const totalOutstandingBalance = computed(() =>
    students.value.reduce((total, student) => total + Math.max(0, student.accountBalance), 0)
  )

  // Methods
  const getStudentById = (id) => {
    return students.value.find(s => s.id === id)
  }

  const getStudentByStudentId = (studentId) => {
    return students.value.find(s => s.studentId === studentId)
  }

  const addStudent = (student) => {
    const newStudent = {
      ...student,
      id: Date.now().toString()
    }
    students.value.push(newStudent)
    return newStudent
  }

  const updateStudent = (id, updates) => {
    const index = students.value.findIndex(s => s.id === id)
    if (index !== -1) {
      students.value[index] = { ...students.value[index], ...updates }
      return students.value[index]
    }
    return null
  }

  const deleteStudent = (id) => {
    const index = students.value.findIndex(s => s.id === id)
    if (index !== -1) {
      students.value.splice(index, 1)
      return true
    }
    return false
  }

  const addStudentNote = (studentId, note) => {
    const student = getStudentById(studentId)
    if (student) {
      const newNote = {
        ...note,
        id: Date.now().toString()
      }
      student.notes.push(newNote)
      return true
    }
    return false
  }

  const getStudentsByProgram = (program) => {
    return students.value.filter(s => s.program === program)
  }

  const getStudentsByStatus = (status) => {
    return students.value.filter(s => s.enrollmentStatus === status)
  }

  const searchStudents = (query) => {
    const lowercaseQuery = query.toLowerCase()
    return students.value.filter(student =>
      student.firstName.toLowerCase().includes(lowercaseQuery) ||
      student.lastName.toLowerCase().includes(lowercaseQuery) ||
      student.email.toLowerCase().includes(lowercaseQuery) ||
      student.studentId.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Lead management
  const getLeadById = (id) => {
    return leads.value.find(l => l.id === id)
  }

  const addLead = (lead) => {
    const newLead = {
      ...lead,
      id: Date.now().toString()
    }
    leads.value.push(newLead)
    return newLead
  }

  const updateLead = (id, updates) => {
    const index = leads.value.findIndex(l => l.id === id)
    if (index !== -1) {
      leads.value[index] = { ...leads.value[index], ...updates }
      return leads.value[index]
    }
    return null
  }

  const convertLeadToStudent = (leadId) => {
    const lead = getLeadById(leadId)
    if (!lead) return null

    const studentData = {
      studentId: `ST${new Date().getFullYear()}${String(students.value.length + 1).padStart(3, '0')}`,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      dateOfBirth: '', // This would need to be collected separately
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      enrollmentStatus: 'Active',
      program: lead.program,
      enrollmentDate: new Date().toISOString().split('T')[0],
      expectedGraduation: '',
      gpa: 0,
      creditsEarned: 0,
      totalCredits: 60, // Default for most programs
      attendanceRate: 100,
      accountBalance: 0,
      documents: [],
      notes: [
        {
          id: '1',
          date: new Date().toISOString().split('T')[0],
          author: 'System',
          content: `Converted from lead. Original inquiry: ${lead.notes}`,
          type: 'general'
        }
      ]
    }

    const newStudent = addStudent(studentData)
    
    // Update lead status
    updateLead(leadId, { stage: 'enrolled' })
    
    return newStudent
  }

  return {
    // State
    students: readonly(students),
    leads: readonly(leads),
    
    // Computed
    activeStudents,
    totalCreditsEarned,
    averageGPA,
    averageAttendance,
    totalOutstandingBalance,
    
    // Student methods
    getStudentById,
    getStudentByStudentId,
    addStudent,
    updateStudent,
    deleteStudent,
    addStudentNote,
    getStudentsByProgram,
    getStudentsByStatus,
    searchStudents,
    
    // Lead methods
    getLeadById,
    addLead,
    updateLead,
    convertLeadToStudent
  }
}