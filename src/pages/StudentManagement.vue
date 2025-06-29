<template>
  <div class="student-management">
    <!-- Page Header -->
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">
        Student Management System
      </h1>
      <p class="text-body-1 text-medium-emphasis mt-2">
        Comprehensive student information, filtering, and analytics dashboard.
      </p>
    </div>

    <!-- Filter Bar -->
    <FilterBar 
      @filter="applyFilters"
      @reset="resetFilters"
      class="mb-4"
    />

    <!-- Student Table -->
    <StudentTable 
      :students="filteredStudents"
      :loading="tableLoading"
      :error="tableError"
      :search-query="searchQuery"
      @select="viewStudent"
      @view="viewStudent"
      @edit="editStudent"
      @delete="deleteStudent"
      @add="addStudent"
      @refresh="refreshStudents"
      @table-update="handleTableUpdate"
      class="mb-6"
    />

    <!-- Student Details Dialog -->
    <v-dialog 
      v-model="detailDialog" 
      max-width="900px"
      persistent
    >
      <StudentDetailCard 
        :student="selectedStudent"
        @close="detailDialog = false"
        @edit="editStudent"
        @delete="deleteStudent"
        @view-transcript="viewTranscript"
        @send-email="sendEmail"
        @view-schedule="viewSchedule"
      />
    </v-dialog>

    <!-- Student Stats Chart -->
    <StudentStatsChart 
      :data="chartData"
      :loading="chartLoading"
      :error="chartError"
      @refresh="refreshChartData"
      @chart-click="handleChartClick"
      class="mb-6"
    />

    <!-- Advanced Student Filter Card -->
    <StudentFilterCard 
      :show-badge="true"
      :auto-search="false"
      @search="handleAdvancedSearch"
      @filter-change="handleAdvancedFilterChange"
      @reset="handleAdvancedFilterReset"
      @view-all="handleViewAllStudents"
      @search-error="handleAdvancedSearchError"
      class="mb-6"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// Types
interface Student {
  id: string
  name: string
  email: string
  phone?: string
  studentId: string
  program: string
  status: string
  campus: string
  enrollmentDate?: string
  graduationDate?: string
  gpa?: number
  credits?: number
}

interface FilterCriteria {
  program: string[]
  status: string[]
  campus: string[]
  search: string
}

interface TableOptions {
  page: number
  itemsPerPage: number
  sortBy: string[]
  sortDesc: boolean[]
}

// Reactive data
const allStudents = ref<Student[]>([])
const filteredStudents = ref<Student[]>([])
const selectedStudent = ref<Student | null>(null)
const detailDialog = ref(false)
const searchQuery = ref('')

// Loading states
const tableLoading = ref(false)
const chartLoading = ref(false)
const tableError = ref<string | null>(null)
const chartError = ref<string | null>(null)

// Chart data
const chartData = ref({
  labels: ['Pending', 'Enrolled', 'Active', 'Graduated', 'Withdrawn'],
  datasets: [{
    label: 'Students',
    data: [23, 45, 67, 34, 12],
    backgroundColor: [
      '#FF9800', // Orange for Pending
      '#2196F3', // Blue for Enrolled
      '#4CAF50', // Green for Active
      '#9C27B0', // Purple for Graduated
      '#F44336'  // Red for Withdrawn
    ],
    borderColor: [
      '#E68900',
      '#1976D2',
      '#388E3C',
      '#7B1FA2',
      '#D32F2F'
    ],
    borderWidth: 2
  }]
})

// Sample data for demonstration
const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    studentId: 'STU001',
    program: 'Massage Therapy',
    status: 'Active',
    campus: 'Main Campus',
    enrollmentDate: '2023-09-15',
    graduationDate: '2024-06-15',
    gpa: 3.8,
    credits: 45
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    studentId: 'STU002',
    program: 'Advanced Massage',
    status: 'Enrolled',
    campus: 'Downtown Campus',
    enrollmentDate: '2024-01-10',
    gpa: 3.6,
    credits: 30
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    studentId: 'STU003',
    program: 'Spa Management',
    status: 'Pending',
    campus: 'Online Campus',
    enrollmentDate: '2024-02-01'
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@email.com',
    phone: '(555) 345-6789',
    studentId: 'STU004',
    program: 'Massage Therapy',
    status: 'Graduated',
    campus: 'Main Campus',
    enrollmentDate: '2022-09-01',
    graduationDate: '2023-06-15',
    gpa: 3.9,
    credits: 60
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    studentId: 'STU005',
    program: 'Wellness Coaching',
    status: 'Withdrawn',
    campus: 'West Campus',
    enrollmentDate: '2023-03-15'
  }
]

// Methods
const loadStudents = async (): Promise<void> => {
  tableLoading.value = true
  tableError.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    allStudents.value = [...sampleStudents]
    filteredStudents.value = [...sampleStudents]
    console.log('Students loaded:', allStudents.value.length)
  } catch (error) {
    tableError.value = 'Failed to load students. Please try again.'
    console.error('Error loading students:', error)
  } finally {
    tableLoading.value = false
  }
}

const applyFilters = (criteria: FilterCriteria): void => {
  console.log('Applying filters:', criteria)
  
  let filtered = [...allStudents.value]
  
  // Program filter
  if (criteria.program.length > 0) {
    filtered = filtered.filter(student => 
      criteria.program.includes(student.program.toLowerCase())
    )
  }
  
  // Status filter
  if (criteria.status.length > 0) {
    filtered = filtered.filter(student => 
      criteria.status.includes(student.status.toLowerCase())
    )
  }
  
  // Campus filter
  if (criteria.campus.length > 0) {
    filtered = filtered.filter(student => 
      criteria.campus.includes(student.campus.toLowerCase())
    )
  }
  
  // Search filter
  if (criteria.search.trim()) {
    const searchTerm = criteria.search.toLowerCase()
    filtered = filtered.filter(student =>
      student.name.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm) ||
      student.studentId.toLowerCase().includes(searchTerm)
    )
  }
  
  filteredStudents.value = filtered
  console.log('Filtered students:', filtered.length)
}

const resetFilters = (): void => {
  console.log('Filters reset')
  filteredStudents.value = [...allStudents.value]
}

const viewStudent = (student: Student): void => {
  selectedStudent.value = student
  detailDialog.value = true
  console.log('Viewing student:', student.name)
}

const editStudent = (student: Student): void => {
  console.log('Editing student:', student.name)
  // Implement edit functionality
  alert(`Edit functionality for ${student.name} would be implemented here`)
}

const deleteStudent = (student: Student): void => {
  console.log('Deleting student:', student.name)
  if (confirm(`Are you sure you want to delete ${student.name}?`)) {
    // Remove from arrays
    allStudents.value = allStudents.value.filter(s => s.id !== student.id)
    filteredStudents.value = filteredStudents.value.filter(s => s.id !== student.id)
    
    // Close dialog if open
    if (selectedStudent.value?.id === student.id) {
      detailDialog.value = false
      selectedStudent.value = null
    }
    
    console.log('Student deleted:', student.name)
  }
}

const addStudent = (): void => {
  console.log('Adding new student')
  // Implement add functionality
  alert('Add student functionality would be implemented here')
}

const refreshStudents = (): void => {
  console.log('Refreshing students')
  loadStudents()
}

const handleTableUpdate = (options: TableOptions): void => {
  console.log('Table options updated:', options)
  // Implement pagination, sorting, etc.
}

const refreshChartData = (): void => {
  console.log('Refreshing chart data')
  // Implement chart data refresh
}

const handleChartClick = (label: string, value: number): void => {
  console.log('Chart clicked:', label, value)
  // Filter students by clicked category
  const status = label.toLowerCase()
  filteredStudents.value = allStudents.value.filter(student => 
    student.status.toLowerCase() === status
  )
}

// Advanced filter handlers
const handleAdvancedSearch = (results: any): void => {
  console.log('Advanced search results:', results)
}

const handleAdvancedFilterChange = (filters: any): void => {
  console.log('Advanced filter change:', filters)
}

const handleAdvancedFilterReset = (): void => {
  console.log('Advanced filters reset')
}

const handleViewAllStudents = (): void => {
  console.log('View all students')
  filteredStudents.value = [...allStudents.value]
}

const handleAdvancedSearchError = (error: string): void => {
  console.error('Advanced search error:', error)
}

// Lifecycle
onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.student-management {
  padding: 24px;
}

.page-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 16px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .student-management {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .student-management {
    padding: 12px;
  }
  
  .page-header h1 {
    font-size: 1.75rem;
  }
}
</style> 