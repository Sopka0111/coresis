<template>
  <div class="placement-page">
    <v-container fluid>
      <!-- Page Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <div>
              <h1 class="text-h3 font-weight-bold text-primary">
                <v-icon left size="32">mdi-briefcase</v-icon>
                Student Placement Management
              </h1>
              <p class="text-body-1 text-medium-emphasis mt-2">
                Track employment outcomes, manage placement status, and monitor graduate success.
              </p>
            </div>
            <v-chip 
              :color="getRoleColor(userRole)" 
              size="large"
              class="font-weight-medium"
            >
              <v-icon left>{{ getRoleIcon(userRole) }}</v-icon>
              {{ getRoleLabel(userRole) }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- FILTERS -->
      <v-row class="mb-4">
        <v-col cols="12">
          <PlacementFilterBar 
            @apply-filters="applyFilters" 
            :loading="isLoading"
          />
        </v-col>
      </v-row>

      <!-- ACTION BUTTONS -->
      <v-row class="mb-4" dense>
        <v-col cols="auto">
          <v-btn 
            color="primary" 
            @click="exportPlacementData"
            :loading="isExporting"
            :disabled="!canExportData"
          >
            <v-icon left>mdi-download</v-icon>
            Export Data
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="info" 
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            <v-icon left>mdi-filter-off</v-icon>
            Clear Filters
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="secondary" 
            @click="toggleDataView"
            variant="outlined"
          >
            <v-icon left>{{ dataView ? 'mdi-chart-pie' : 'mdi-table' }}</v-icon>
            {{ dataView ? 'Switch to Summary View' : 'Switch to Data View' }}
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="success" 
            @click="generatePlacementReport"
            :loading="isGeneratingReport"
            :disabled="!canExportData"
          >
            <v-icon left>mdi-file-pdf-box</v-icon>
            Generate Report
          </v-btn>
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <v-btn 
            color="secondary" 
            variant="outlined"
            @click="refreshData"
            :loading="isLoading"
          >
            <v-icon left>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-col>
      </v-row>

      <!-- Summary Cards -->
      <v-row class="mb-6" v-if="!dataView">
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="success" class="mb-2">mdi-briefcase-check</v-icon>
              <div class="text-h4 font-weight-bold text-success">
                {{ summary.employed }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Employed</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="warning" class="mb-2">mdi-account-search</v-icon>
              <div class="text-h4 font-weight-bold text-warning">
                {{ summary.seeking }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Seeking Employment</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="info" class="mb-2">mdi-account-clock</v-icon>
              <div class="text-h4 font-weight-bold text-info">
                {{ summary.pending }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Pending Placement</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="error" class="mb-2">mdi-account-remove</v-icon>
              <div class="text-h4 font-weight-bold text-error">
                {{ summary.notSeeking }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Not Seeking</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- PLACEMENT TABLE -->
      <v-row class="mb-6" v-if="dataView">
        <v-col cols="12">
          <PlacementTable 
            :records="filteredStudents" 
            :loading="isLoading"
            @select-record="selectStudent"
            @update-record="updateStudent"
            @delete-record="deleteStudent"
          />
        </v-col>
      </v-row>

      <!-- STUDENT DETAIL MODAL -->
      <v-dialog v-model="dialog" max-width="900px" persistent>
        <StudentPlacementCard 
          :student="selectedStudent" 
          :can-view="canViewSensitiveData"
          @close="closeDialog"
          @update="updateStudent"
        />
      </v-dialog>

      <!-- PLACEMENT CHART -->
      <v-row class="mt-5" v-if="!dataView">
        <v-col cols="12">
          <PlacementSummaryChart :data="chartData" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { usePdfExport } from '@/composables/usePdfExport'

// Types
interface Student {
  id: string
  name: string
  studentId: string
  campus: string
  firstTerm: string
  program: string
  session: string
  status: string
  group: string
  employedStatus: string
  placementStatus: string
  email: string
  phone: string
  graduationDate: string
  employer?: {
    name: string
    contact: string
    position: string
    startDate: string
    jobType: string
    salary: number
  }
  resume?: string
  notes?: string[]
  feedback?: string[]
}

interface Summary {
  employed: number
  seeking: number
  pending: number
  notSeeking: number
}

interface ChartData {
  labels: string[]
  datasets: Array<{
    backgroundColor: string[]
    data: number[]
    label: string
  }>
}

// Auth composable
const { userRole, canViewSensitiveData, canExportData } = useAuth()

// PDF export composable
const { downloadPlacementReport } = usePdfExport()

// Reactive data
const allStudents = ref<Student[]>([])
const filteredStudents = ref<Student[]>([])
const selectedStudent = ref<Student | null>(null)
const dialog = ref(false)
const dataView = ref(true)
const isLoading = ref(false)
const isExporting = ref(false)
const isGeneratingReport = ref(false)

// Summary data
const summary = ref<Summary>({
  employed: 0,
  seeking: 0,
  pending: 0,
  notSeeking: 0
})

// Chart data
const chartData = ref<ChartData>({
  labels: ['Employed', 'Seeking', 'Pending', 'Not Seeking'],
  datasets: [{
    backgroundColor: ['#00c292', '#fec107', '#03a9f4', '#e46a76'],
    data: [0, 0, 0, 0],
    label: 'Placement Outcomes'
  }]
})

// Role display helpers
const getRoleColor = (role: string) => {
  const colors = {
    admin: 'error',
    finance: 'success',
    registrar: 'info',
    instructor: 'warning',
    student: 'grey'
  }
  return colors[role as keyof typeof colors] || 'grey'
}

const getRoleIcon = (role: string) => {
  const icons = {
    admin: 'mdi-shield-crown',
    finance: 'mdi-calculator',
    registrar: 'mdi-account-group',
    instructor: 'mdi-teach',
    student: 'mdi-account'
  }
  return icons[role as keyof typeof icons] || 'mdi-account'
}

const getRoleLabel = (role: string) => {
  const labels = {
    admin: 'Administrator',
    finance: 'Finance',
    registrar: 'Registrar',
    instructor: 'Instructor',
    student: 'Student'
  }
  return labels[role as keyof typeof labels] || 'User'
}

// Computed properties
const hasActiveFilters = computed(() => {
  // This would check if any filters are active
  return false // Placeholder
})

// Methods
const fetchData = async () => {
  isLoading.value = true
  try {
    // Mock data for demo
    const mockData: Student[] = [
      {
        id: '1',
        name: 'John Doe',
        studentId: 'STU-001',
        campus: 'Downtown',
        firstTerm: 'Fall 2023',
        program: 'Massage Therapy',
        session: 'Full-time',
        status: 'Graduated',
        group: 'A',
        employedStatus: 'Employed',
        placementStatus: 'Placed',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        graduationDate: '2024-01-15',
        employer: {
          name: 'Wellness Spa Center',
          contact: 'Sarah Johnson',
          position: 'Licensed Massage Therapist',
          startDate: '2024-02-01',
          jobType: 'Full-time',
          salary: 45000
        },
        notes: ['Excellent performance during internship'],
        feedback: ['Highly recommended by employer']
      },
      {
        id: '2',
        name: 'Jane Smith',
        studentId: 'STU-002',
        campus: 'Downtown',
        firstTerm: 'Fall 2023',
        program: 'Massage Therapy',
        session: 'Part-time',
        status: 'Graduated',
        group: 'B',
        employedStatus: 'Seeking',
        placementStatus: 'Pending',
        email: 'jane.smith@email.com',
        phone: '(555) 234-5678',
        graduationDate: '2024-01-15',
        notes: ['Interested in sports massage'],
        feedback: ['Strong technical skills']
      },
      {
        id: '3',
        name: 'Mike Johnson',
        studentId: 'STU-003',
        campus: 'West Campus',
        firstTerm: 'Spring 2023',
        program: 'Massage Therapy',
        session: 'Full-time',
        status: 'Graduated',
        group: 'A',
        employedStatus: 'Not Seeking',
        placementStatus: 'Not Placed',
        email: 'mike.johnson@email.com',
        phone: '(555) 345-6789',
        graduationDate: '2023-12-15',
        notes: ['Planning to start own practice']
      }
    ]
    
    allStudents.value = mockData
    filteredStudents.value = mockData
    updateSummary()
    updateChartData()
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const updateSummary = () => {
  const students = filteredStudents.value
  summary.value = {
    employed: students.filter(s => s.employedStatus === 'Employed').length,
    seeking: students.filter(s => s.employedStatus === 'Seeking').length,
    pending: students.filter(s => s.placementStatus === 'Pending').length,
    notSeeking: students.filter(s => s.employedStatus === 'Not Seeking').length
  }
}

const updateChartData = () => {
  chartData.value.datasets[0].data = [
    summary.value.employed,
    summary.value.seeking,
    summary.value.pending,
    summary.value.notSeeking
  ]
}

const applyFilters = (filters: any) => {
  let filtered = [...allStudents.value]
  
  // Apply campus filter
  if (filters.campus && filters.campus !== 'all') {
    filtered = filtered.filter(student => student.campus === filters.campus)
  }
  
  // Apply program filter
  if (filters.program && filters.program !== 'all') {
    filtered = filtered.filter(student => student.program === filters.program)
  }
  
  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(student => student.status === filters.status)
  }
  
  // Apply employed status filter
  if (filters.employedStatus && filters.employedStatus !== 'all') {
    filtered = filtered.filter(student => student.employedStatus === filters.employedStatus)
  }
  
  // Apply placement status filter
  if (filters.placementStatus && filters.placementStatus !== 'all') {
    filtered = filtered.filter(student => student.placementStatus === filters.placementStatus)
  }
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(student => 
      student.name.toLowerCase().includes(searchTerm) ||
      student.studentId.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm)
    )
  }
  
  filteredStudents.value = filtered
  updateSummary()
  updateChartData()
}

const clearFilters = () => {
  filteredStudents.value = [...allStudents.value]
  updateSummary()
  updateChartData()
}

const toggleDataView = () => {
  dataView.value = !dataView.value
}

const exportPlacementData = async () => {
  if (!canExportData.value) return
  
  isExporting.value = true
  try {
    // Mock CSV export
    const csvContent = filteredStudents.value.map(student => 
      `${student.name},${student.studentId},${student.campus},${student.program},${student.employedStatus},${student.placementStatus}`
    ).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `placement-data-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
  } catch (error) {
    console.error('Error exporting data:', error)
  } finally {
    isExporting.value = false
  }
}

const generatePlacementReport = async () => {
  if (!canExportData.value) return
  
  isGeneratingReport.value = true
  try {
    await downloadPlacementReport(filteredStudents.value, 'Student Placement Report')
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    isGeneratingReport.value = false
  }
}

const selectStudent = (student: Student) => {
  selectedStudent.value = student
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  selectedStudent.value = null
}

const updateStudent = (student: Student) => {
  const index = allStudents.value.findIndex(s => s.id === student.id)
  if (index !== -1) {
    allStudents.value[index] = student
    applyFilters({}) // Reapply filters
  }
}

const deleteStudent = async (studentId: string) => {
  try {
    allStudents.value = allStudents.value.filter(s => s.id !== studentId)
    applyFilters({}) // Reapply filters
  } catch (error) {
    console.error('Error deleting student:', error)
  }
}

const refreshData = () => {
  fetchData()
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.placement-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.summary-card {
  transition: transform 0.2s ease;
  border-radius: 12px;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.v-card {
  border-radius: 12px;
}
</style> 