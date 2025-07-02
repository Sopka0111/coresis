<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Financial Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage student finances, payments, and balance tracking
        </p>
      </v-col>
    </v-row>

    <!-- Enhanced Filter Bar -->
    <FinanceFilterBar 
      :loading="loading"
      :results-count="filteredStudents.length"
      @applyFilters="handleFilters"
      @resetFilters="resetFilters"
      @savePreset="saveFilterPreset"
      @refreshData="refreshData"
    />

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- View Mode Toggle -->
    <v-row class="mb-4">
      <v-col cols="auto">
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          color="primary"
        >
          <v-btn value="data">
            <v-icon left>mdi-table</v-icon>
            Data View
          </v-btn>
          <v-btn value="summary">
            <v-icon left>mdi-chart-pie</v-icon>
            Summary
          </v-btn>
          <v-btn value="graph">
            <v-icon left>mdi-chart-line</v-icon>
            Graph Mode
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn 
              color="primary" 
              v-bind="props"
              prepend-icon="mdi-dots-horizontal"
            >
              Bulk Actions
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="exportToCSV">
              <template v-slot:prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>Export to CSV</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendFeeNotices">
              <template v-slot:prepend>
                <v-icon color="warning">mdi-email</v-icon>
              </template>
              <v-list-item-title>Send Fee Notices</v-list-item-title>
            </v-list-item>
            <v-list-item @click="generateFinancialReport">
              <template v-slot:prepend>
                <v-icon color="info">mdi-file-chart</v-icon>
              </template>
              <v-list-item-title>Generate Report</v-list-item-title>
            </v-list-item>
            <v-list-item @click="bulkPaymentReminder">
              <template v-slot:prepend>
                <v-icon color="success">mdi-credit-card</v-icon>
              </template>
              <v-list-item-title>Bulk Payment Reminders</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <!-- Data View -->
    <div v-if="viewMode === 'data'">
      <!-- FINANCIAL STATS CARDS -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="success" class="mb-2">mdi-currency-usd</v-icon>
            <div class="text-h4 font-weight-bold text-success">${{ formatCurrency(stats.totalRevenue) }}</div>
            <div class="text-subtitle-2">Total Revenue</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="error" class="mb-2">mdi-alert-circle</v-icon>
            <div class="text-h4 font-weight-bold text-error">${{ formatCurrency(stats.outstandingBalance) }}</div>
            <div class="text-subtitle-2">Outstanding Balance</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="warning" class="mb-2">mdi-clock</v-icon>
            <div class="text-h4 font-weight-bold text-warning">{{ stats.pendingPayments }}</div>
            <div class="text-subtitle-2">Pending Payments</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="info" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h4 font-weight-bold text-info">{{ stats.totalStudents }}</div>
            <div class="text-subtitle-2">Total Students</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- FINANCE TABLE -->
      <v-card class="mb-6">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Student Financial Records</span>
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
            <!-- Balance Column -->
            <template v-slot:item.balance="{ item }">
              <span 
                class="font-weight-bold"
                :class="getBalanceTextColor(item.balance)"
              >
                ${{ formatCurrency(item.balance) }}
              </span>
            </template>

            <!-- Status Column -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                :text="item.status"
                size="small"
                variant="elevated"
              />
            </template>

            <!-- Funding Column -->
            <template v-slot:item.funding="{ item }">
              <v-chip
                :color="getFundingColor(item.funding)"
                :text="item.funding"
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
                  <v-list-item @click="processPayment(item)">
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-credit-card</v-icon>
                    </template>
                    <v-list-item-title>Process Payment</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="sendReminder(item)" v-if="item.balance > 0">
                    <template v-slot:prepend>
                      <v-icon color="warning">mdi-email</v-icon>
                    </template>
                    <v-list-item-title>Send Reminder</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Summary View -->
    <div v-if="viewMode === 'summary'">
      <v-row>
        <v-col cols="12" md="8">
          <FinanceChart :data="chartData" />
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
    </div>

    <!-- Graph Mode -->
    <div v-if="viewMode === 'graph'">
      <BalanceChart 
        :data="balanceChartData"
        :summary="chartSummary"
        :breakdown="balanceBreakdown"
        :top-programs="topPrograms"
      />
    </div>

    <!-- STUDENT FINANCIAL PROFILE MODAL -->
    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Student Financial Profile</span>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>
        <v-card-text>
          <StudentFinanceCard 
            :student="selectedStudent" 
            @close="dialog = false"
            @edit="editStudent"
            @payment="processPayment"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import FinanceFilterBar from '@/components/FinanceFilterBar.vue'
import StudentFinanceCard from '@/components/StudentFinanceCard.vue'
import FinanceChart from '@/components/FinanceChart.vue'
import BalanceChart from '@/components/BalanceChart.vue'

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
  funding: string
  balance: number
  tuitionPaid?: number
  tuitionTotal?: number
  outstandingBalance?: number
  scholarshipAmount?: number
  isArchived?: boolean
  isLead?: boolean
  isMultiEnrolled?: boolean
}

interface Filters {
  campus?: string
  program?: string
  status?: string
  funding?: string
  search?: string
  balanceRange?: string
  term?: string
  session?: string
  group?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
}

interface Stats {
  totalRevenue: number
  outstandingBalance: number
  pendingPayments: number
  totalStudents: number
}

// Table headers
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Student ID', key: 'studentId', sortable: true },
  { title: 'Campus', key: 'campus', sortable: true },
  { title: 'First Term', key: 'firstTerm', sortable: true },
  { title: 'Funding', key: 'funding', sortable: true },
  { title: 'Program', key: 'program', sortable: true },
  { title: 'Session', key: 'session', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Group', key: 'group', sortable: true },
  { title: 'Balance', key: 'balance', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Reactive data
const dialog = ref(false)
const selectedStudent = ref<Student | null>(null)
const allStudents = ref<Student[]>([])
const filteredStudents = ref<Student[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentFilters = ref<Filters>({})
const viewMode = ref('data')

// Stats
const stats = computed<Stats>(() => {
  const total = allStudents.value.length
  const totalRevenue = allStudents.value.reduce((sum, s) => sum + (s.tuitionPaid || 0), 0)
  const outstandingBalance = allStudents.value.reduce((sum, s) => sum + Math.max(0, s.balance), 0)
  const pendingPayments = allStudents.value.filter(s => s.balance > 0).length

  return {
    totalRevenue,
    outstandingBalance,
    pendingPayments,
    totalStudents: total
  }
})

// Chart data
const chartData = computed(() => ({
  labels: ['Positive Balance', 'Zero Balance', 'Outstanding Dues'],
  datasets: [{
    backgroundColor: ['#00c292', '#022561', '#e46a76'],
    data: [
      allStudents.value.filter(s => s.balance < 0).length,
      allStudents.value.filter(s => s.balance === 0).length,
      allStudents.value.filter(s => s.balance > 0).length
    ],
    label: 'Student Balances'
  }]
}))

// Balance chart data
const balanceChartData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Revenue',
    data: [45000, 52000, 48000, 61000, 55000, 68000],
    backgroundColor: 'rgba(0, 194, 146, 0.2)',
    borderColor: '#00c292',
    borderWidth: 2,
    fill: true,
    tension: 0.4
  }]
}))

const chartSummary = computed(() => ({
  totalRevenue: 325000,
  outstandingBalance: 45000,
  totalStudents: 156,
  pendingPayments: 23,
  revenueGrowth: 12.5,
  balanceReduction: 8.3,
  newStudents: 18,
  avgPaymentTime: 3.2
}))

const balanceBreakdown = computed(() => ({
  negativeCount: 45,
  zeroCount: 89,
  positiveCount: 22,
  negativePercentage: 29,
  zeroPercentage: 57,
  positivePercentage: 14
}))

const topPrograms = computed(() => [
  { name: 'Massage Therapy', revenue: 180000, percentage: 55, color: '#00c292' },
  { name: 'Ayurveda', revenue: 85000, percentage: 26, color: '#fb9678' },
  { name: 'Energy Healing', revenue: 45000, percentage: 14, color: '#022561' },
  { name: 'Holistic Nutrition', revenue: 15000, percentage: 5, color: '#e46a76' }
])

// API Methods
const fetchFinancialData = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/students/finance')
    allStudents.value = response.data
    filteredStudents.value = response.data
  } catch (err) {
    console.error('Error fetching financial data:', err)
    error.value = 'Failed to load financial data. Please try again.'
    // Fallback to sample data if API fails
    loadSampleData()
  } finally {
    loading.value = false
  }
}

// Sample data fallback
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
      funding: 'Self-Pay',
      balance: -2500,
      tuitionPaid: 2500,
      tuitionTotal: 5000,
      outstandingBalance: 0,
      scholarshipAmount: 0
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
      funding: 'Financial Aid',
      balance: 0,
      tuitionPaid: 6000,
      tuitionTotal: 6000,
      outstandingBalance: 0,
      scholarshipAmount: 1000
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
      funding: 'Self-Pay',
      balance: 1500,
      tuitionPaid: 1000,
      tuitionTotal: 5000,
      outstandingBalance: 1500,
      scholarshipAmount: 0
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
      funding: 'Self-Pay',
      balance: 500,
      tuitionPaid: 2000,
      tuitionTotal: 5000,
      outstandingBalance: 500,
      scholarshipAmount: 0,
      isArchived: true
    },
    {
      studentId: 'STU005',
      name: 'David Wilson',
      campus: 'Downtown',
      firstTerm: 'Spring 2024',
      program: 'Ayurveda',
      session: 'Morning',
      status: 'Enrolled',
      group: 'Group B',
      funding: 'Scholarship',
      balance: -3000,
      tuitionPaid: 3000,
      tuitionTotal: 6000,
      outstandingBalance: 0,
      scholarshipAmount: 3000,
      isMultiEnrolled: true
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

const saveFilterPreset = (filters: Filters, name: string): void => {
  // TODO: Implement save preset functionality
  console.log('Saving preset:', name, filters)
}

const refreshData = async (): Promise<void> => {
  await fetchFinancialData()
}

const applyFilters = (): void => {
  let filtered = [...allStudents.value]

  // Apply search filters
  if (currentFilters.value.campus) {
    filtered = filtered.filter(s => s.campus === currentFilters.value.campus)
  }

  if (currentFilters.value.program) {
    filtered = filtered.filter(s => s.program === currentFilters.value.program)
  }

  if (currentFilters.value.status) {
    filtered = filtered.filter(s => s.status === currentFilters.value.status)
  }

  if (currentFilters.value.funding) {
    filtered = filtered.filter(s => s.funding === currentFilters.value.funding)
  }

  if (currentFilters.value.search) {
    const search = currentFilters.value.search.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.studentId.toLowerCase().includes(search)
    )
  }

  filteredStudents.value = filtered
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Enrolled': 'success',
    'Graduated': 'primary',
    'Withdrawn': 'warning',
    'Dismissed': 'error',
    'Lead': 'info'
  }
  return colors[status] || 'grey'
}

const getFundingColor = (funding: string): string => {
  const colors: Record<string, string> = {
    'Self-Pay': 'primary',
    'Financial Aid': 'success',
    'Scholarship': 'info',
    'Grant': 'warning'
  }
  return colors[funding] || 'grey'
}

const getBalanceTextColor = (balance: number): string => {
  if (balance > 0) return 'text-error'
  if (balance < 0) return 'text-success'
  return 'text-warning'
}

const formatCurrency = (amount: number): string => {
  return Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const viewStudent = (student: Student): void => {
  selectedStudent.value = student
  dialog.value = true
}

const editStudent = (student: Student): void => {
  // TODO: Implement edit functionality
  console.log('Edit student:', student)
}

const processPayment = (student: Student): void => {
  // TODO: Implement payment processing
  console.log('Process payment for:', student)
}

const sendReminder = (student: Student): void => {
  // TODO: Implement reminder functionality
  console.log('Send reminder to:', student)
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

// Bulk actions
const exportToCSV = (): void => {
  // TODO: Implement CSV export
  console.log('Export to CSV')
}

const sendFeeNotices = (): void => {
  // TODO: Implement fee notices
  console.log('Send fee notices')
}

const generateFinancialReport = (): void => {
  // TODO: Implement financial report
  console.log('Generate financial report')
}

const bulkPaymentReminder = (): void => {
  // TODO: Implement bulk reminders
  console.log('Bulk payment reminders')
}

// Lifecycle
onMounted(async () => {
  await fetchFinancialData()
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