<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Registrar Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage student registrations, approvals, and status tracking
        </p>
      </v-col>
    </v-row>

    <!-- FILTER BAR -->
    <v-card class="mb-4">
      <v-card-text>
        <FilterBar @applyFilters="handleFilters" @resetFilters="resetFilters" />
      </v-card-text>
    </v-card>

    <!-- STATS CARDS -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="success" class="mb-2">mdi-school</v-icon>
          <div class="text-h4 font-weight-bold text-success">{{ stats.totalStudents }}</div>
          <div class="text-subtitle-2">Total Students</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="primary" class="mb-2">mdi-account-check</v-icon>
          <div class="text-h4 font-weight-bold text-primary">{{ stats.enrolled }}</div>
          <div class="text-subtitle-2">Enrolled</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="warning" class="mb-2">mdi-clock</v-icon>
          <div class="text-h4 font-weight-bold text-warning">{{ stats.pendingApproval }}</div>
          <div class="text-subtitle-2">Pending Approval</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="success" class="mb-2">mdi-certificate</v-icon>
          <div class="text-h4 font-weight-bold text-success">{{ stats.graduated }}</div>
          <div class="text-subtitle-2">Graduated</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- REGISTRAR TABLE -->
    <v-card class="mb-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Student Registry</span>
        <div>
          <v-btn 
            color="primary" 
            prepend-icon="mdi-plus"
            @click="addNewStudent"
          >
            Add Student
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="filteredStudents"
          :loading="loading"
          class="elevation-1"
          item-value="studentId"
          @click:row="selectStudent"
        >
          <!-- Status Column -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              :text="item.status"
              size="small"
              variant="elevated"
            />
          </template>

          <!-- Approval Status Column -->
          <template v-slot:item.approvalStatus="{ item }">
            <v-chip
              :color="getApprovalColor(item.approvalStatus)"
              :text="item.approvalStatus"
              size="small"
              variant="elevated"
            />
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <v-list>
                <v-list-item @click="viewStudent(item)">
                  <template v-slot:prepend>
                    <v-icon>mdi-eye</v-icon>
                  </template>
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
                <v-list-item @click="editStudent(item)">
                  <template v-slot:prepend>
                    <v-icon>mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="approveStudent(item)" v-if="item.approvalStatus === 'Pending'">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check</v-icon>
                  </template>
                  <v-list-item-title>Approve</v-list-item-title>
                </v-list-item>
                <v-list-item @click="rejectStudent(item)" v-if="item.approvalStatus === 'Pending'">
                  <template v-slot:prepend>
                    <v-icon color="error">mdi-close</v-icon>
                  </template>
                  <v-list-item-title>Reject</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- STUDENT DETAIL DIALOG -->
    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Student Details</span>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>
        <v-card-text>
          <StudentDetailCard v-if="selectedStudent" :student="selectedStudent" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn v-if="selectedStudent" color="primary" @click="editStudent(selectedStudent)">
            Edit Student
          </v-btn>
          <v-btn variant="outlined" @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- STATUS DISTRIBUTION CHART -->
    <v-row>
      <v-col cols="12" md="8">
        <StatusChart :data="chartData" />
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <v-card-title class="text-h6 mb-4">
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item @click="exportData">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-download</v-icon>
                </template>
                <v-list-item-title>Export Data</v-list-item-title>
              </v-list-item>
              <v-list-item @click="generateReport">
                <template v-slot:prepend>
                  <v-icon color="info">mdi-file-chart</v-icon>
                </template>
                <v-list-item-title>Generate Report</v-list-item-title>
              </v-list-item>
              <v-list-item @click="bulkApproval">
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-all</v-icon>
                </template>
                <v-list-item-title>Bulk Approval</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import StudentDetailCard from '@/components/StudentDetailCard.vue'
import StatusChart from '@/components/StatusChart.vue'

// Type definitions
interface Student {
  studentId: string
  name: string
  campus: string
  firstTerm: string
  program: string
  session: string
  status: string
  group: string
  approvalStatus: string
  email: string
  phone?: string
  address?: string
  enrollmentDate: string
  graduationDate?: string
  funding: string
  balance: number
  transactions?: Array<{
    id: string
    date: string
    type: string
    amount: number
    description?: string
  }>
}

interface Filters {
  campus?: string
  program?: string
  status?: string
  search?: string
}

interface Stats {
  totalStudents: number
  enrolled: number
  pendingApproval: number
  graduated: number
}

// Table headers
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Student ID', key: 'studentId', sortable: true },
  { title: 'Campus', key: 'campus', sortable: true },
  { title: 'First Term', key: 'firstTerm', sortable: true },
  { title: 'Program', key: 'program', sortable: true },
  { title: 'Session', key: 'session', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Group', key: 'group', sortable: true },
  { title: 'Approval', key: 'approvalStatus', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Reactive data
const dialog = ref(false)
const selectedStudent = ref<Student | null>(null)
const allStudents = ref<Student[]>([])
const filteredStudents = ref<Student[]>([])
const loading = ref(false)
const currentFilters = ref<Filters>({})

// Stats
const stats = computed<Stats>(() => {
  const total = allStudents.value.length
  const enrolled = allStudents.value.filter(s => s.status === 'Enrolled').length
  const pendingApproval = allStudents.value.filter(s => s.approvalStatus === 'Pending').length
  const graduated = allStudents.value.filter(s => s.status === 'Graduated').length

  return {
    totalStudents: total,
    enrolled,
    pendingApproval,
    graduated
  }
})

// Chart data
const chartData = computed(() => ({
  labels: ['Graduated', 'Withdrawn', 'Enrolled', 'Dismissed'],
  datasets: [{
    backgroundColor: ['#00c292', '#fb9678', '#022561', '#e46a76'],
    data: [
      allStudents.value.filter(s => s.status === 'Graduated').length,
      allStudents.value.filter(s => s.status === 'Withdrawn').length,
      allStudents.value.filter(s => s.status === 'Enrolled').length,
      allStudents.value.filter(s => s.status === 'Dismissed').length
    ],
    label: 'Status Distribution'
  }]
}))

// Sample data
const loadSampleData = (): void => {
  const sampleStudents: Student[] = [
    {
      studentId: 'STU001',
      name: 'John Smith',
      campus: 'Main Campus',
      firstTerm: 'Fall 2024',
      program: 'Massage Therapy',
      session: 'Morning',
      status: 'Enrolled',
      group: 'Group A',
      approvalStatus: 'Approved',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, City, State 12345',
      enrollmentDate: '2024-09-01',
      graduationDate: '2025-06-15',
      funding: 'Self-Pay',
      balance: 1500.00
    },
    {
      studentId: 'STU002',
      name: 'Sarah Johnson',
      campus: 'Downtown',
      firstTerm: 'Spring 2024',
      program: 'Ayurveda',
      session: 'Evening',
      status: 'Graduated',
      group: 'Group B',
      approvalStatus: 'Approved',
      email: 'sarah.johnson@email.com',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, City, State 12345',
      enrollmentDate: '2024-01-15',
      graduationDate: '2024-12-20',
      funding: 'Financial Aid',
      balance: 0.00
    },
    {
      studentId: 'STU003',
      name: 'Michael Brown',
      campus: 'Main Campus',
      firstTerm: 'Fall 2024',
      program: 'Energy Healing',
      session: 'Afternoon',
      status: 'Enrolled',
      group: 'Group C',
      approvalStatus: 'Pending',
      email: 'michael.brown@email.com',
      phone: '(555) 345-6789',
      address: '789 Pine Rd, City, State 12345',
      enrollmentDate: '2024-09-01',
      funding: 'Veterans Benefits',
      balance: 750.00
    },
    {
      studentId: 'STU004',
      name: 'Emily Davis',
      campus: 'Online',
      firstTerm: 'Summer 2024',
      program: 'Massage Therapy',
      session: 'Online',
      status: 'Withdrawn',
      group: 'Group A',
      approvalStatus: 'Approved',
      email: 'emily.davis@email.com',
      phone: '(555) 456-7890',
      address: '321 Elm St, City, State 12345',
      enrollmentDate: '2024-06-01',
      funding: 'Self-Pay',
      balance: 2250.00
    },
    {
      studentId: 'STU005',
      name: 'David Wilson',
      campus: 'Downtown',
      firstTerm: 'Spring 2024',
      program: 'Ayurveda',
      session: 'Morning',
      status: 'Dismissed',
      group: 'Group B',
      approvalStatus: 'Rejected',
      email: 'david.wilson@email.com',
      phone: '(555) 567-8901',
      address: '654 Maple Dr, City, State 12345',
      enrollmentDate: '2024-01-15',
      funding: 'Scholarship',
      balance: 0.00
    }
  ]

  allStudents.value = sampleStudents
  filteredStudents.value = sampleStudents
}

// Methods
const selectStudent = (student: Student): void => {
  selectedStudent.value = student
  dialog.value = true
}

const handleFilters = (filters: Filters): void => {
  currentFilters.value = filters
  applyFilters()
}

const resetFilters = (): void => {
  currentFilters.value = {}
  filteredStudents.value = allStudents.value
}

const applyFilters = (): void => {
  let filtered = [...allStudents.value]

  if (currentFilters.value.campus) {
    filtered = filtered.filter(s => s.campus === currentFilters.value.campus)
  }

  if (currentFilters.value.program) {
    filtered = filtered.filter(s => s.program === currentFilters.value.program)
  }

  if (currentFilters.value.status) {
    filtered = filtered.filter(s => s.status === currentFilters.value.status)
  }

  if (currentFilters.value.search) {
    const search = currentFilters.value.search.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.studentId.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search)
    )
  }

  filteredStudents.value = filtered
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Enrolled': 'success',
    'Graduated': 'primary',
    'Withdrawn': 'warning',
    'Dismissed': 'error'
  }
  return colors[status] || 'grey'
}

const getApprovalColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Approved': 'success',
    'Pending': 'warning',
    'Rejected': 'error'
  }
  return colors[status] || 'grey'
}

const viewStudent = (student: Student): void => {
  selectedStudent.value = student
  dialog.value = true
}

const editStudent = (student: Student): void => {
  // TODO: Implement edit functionality
  console.log('Edit student:', student)
}

const approveStudent = (student: Student): void => {
  student.approvalStatus = 'Approved'
  // TODO: Update in backend
  console.log('Approved student:', student)
}

const rejectStudent = (student: Student): void => {
  student.approvalStatus = 'Rejected'
  // TODO: Update in backend
  console.log('Rejected student:', student)
}

const addNewStudent = (): void => {
  // TODO: Implement add new student functionality
  console.log('Add new student')
}

const exportData = (): void => {
  // TODO: Implement export functionality
  console.log('Export data')
}

const generateReport = (): void => {
  // TODO: Implement report generation
  console.log('Generate report')
}

const bulkApproval = (): void => {
  // TODO: Implement bulk approval
  console.log('Bulk approval')
}

// Lifecycle
onMounted(() => {
  loadSampleData()
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.v-card {
  border-radius: 12px;
}
</style> 