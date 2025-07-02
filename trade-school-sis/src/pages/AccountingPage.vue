<template>
  <div class="accounting-page">
    <v-container fluid>
      <!-- Page Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <div>
              <h1 class="text-h3 font-weight-bold text-primary">
                <v-icon left size="32">mdi-calculator</v-icon>
                Accounting Management
              </h1>
              <p class="text-body-1 text-medium-emphasis mt-2">
                Manage financial transactions, generate reports, and reconcile accounts.
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

      <!-- FILTERS & CONTROLS -->
      <v-row class="mb-4">
        <v-col cols="12">
          <AccountingFilterBar 
            @apply-filters="applyFilters" 
            :loading="isLoading"
          />
        </v-col>
      </v-row>

      <!-- Action Buttons -->
      <v-row class="mb-4" dense>
        <v-col cols="auto">
          <v-btn 
            color="primary" 
            @click="exportCSV"
            :loading="isExporting"
            :disabled="!canExportData"
          >
            <v-icon left>mdi-download</v-icon>
            Export CSV
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="info" 
            @click="toggleArchived"
            :disabled="!canViewSensitiveData"
          >
            <v-icon left>{{ showArchived ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            {{ showArchived ? 'Hide' : 'Show' }} Archived
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="warning" 
            @click="reconcile"
            :loading="isReconciling"
            :disabled="!canViewSensitiveData"
          >
            <v-icon left>mdi-refresh</v-icon>
            Reconcile Accounts
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="success" 
            @click="generateFinancialReport"
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
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="success" class="mb-2">mdi-currency-usd</v-icon>
              <div class="text-h4 font-weight-bold text-success">
                ${{ summary.totalRevenue.toLocaleString() }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Total Revenue</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="error" class="mb-2">mdi-account-arrow-right</v-icon>
              <div class="text-h4 font-weight-bold text-error">
                ${{ summary.totalExpenses.toLocaleString() }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Total Expenses</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="info" class="mb-2">mdi-chart-line</v-icon>
              <div class="text-h4 font-weight-bold text-info">
                ${{ summary.netIncome.toLocaleString() }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Net Income</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="summary-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="warning" class="mb-2">mdi-clock-outline</v-icon>
              <div class="text-h4 font-weight-bold text-warning">
                {{ summary.pendingTransactions }}
              </div>
              <div class="text-body-2 text-medium-emphasis">Pending Transactions</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ACCOUNTING TABLE -->
      <v-row class="mb-6">
        <v-col cols="12">
          <AccountingTable 
            :records="filteredRecords" 
            :loading="isLoading"
            @select-record="selectRecord"
            @update-record="updateRecord"
            @delete-record="deleteRecord"
          />
        </v-col>
      </v-row>

      <!-- FINANCIAL REPORT MODAL -->
      <v-dialog v-model="dialog" max-width="900px" persistent>
        <TransactionDetailCard 
          :record="selectedRecord" 
          :can-view="canViewSensitiveData"
          @close="closeDialog"
          @update="updateRecord"
        />
      </v-dialog>

      <!-- FINANCIAL OVERVIEW CHART -->
      <v-row class="mt-5">
        <v-col cols="12">
          <AccountingSummaryChart :data="chartData" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { usePdfExport } from '@/composables/usePdfExport'
import axios from 'axios'

// Import components
import AccountingFilterBar from '@/components/AccountingFilterBar.vue'
import AccountingTable from '@/components/AccountingTable.vue'
import TransactionDetailCard from '@/components/TransactionDetailCard.vue'
import AccountingSummaryChart from '@/components/AccountingSummaryChart.vue'

// Types
interface Transaction {
  id: string
  date: string
  type: string
  description: string
  amount: number
  category: string
  status: string
  reference: string
  archived: boolean
  studentId?: string
  studentName?: string
}

interface Summary {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  pendingTransactions: number
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
const { downloadFinancialReport } = usePdfExport()

// Reactive data
const allRecords = ref<Transaction[]>([])
const filteredRecords = ref<Transaction[]>([])
const dialog = ref(false)
const selectedRecord = ref<Transaction | null>(null)
const showArchived = ref(false)
const isLoading = ref(false)
const isExporting = ref(false)
const isReconciling = ref(false)
const isGeneratingReport = ref(false)

// Summary data
const summary = ref<Summary>({
  totalRevenue: 0,
  totalExpenses: 0,
  netIncome: 0,
  pendingTransactions: 0
})

// Chart data
const chartData = ref<ChartData>({
  labels: ['Revenue', 'Expenses', 'Pending'],
  datasets: [{
    backgroundColor: ['#00c292', '#fb9678', '#e46a76'],
    data: [0, 0, 0],
    label: 'Financial Summary'
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

// Methods
const fetchData = async () => {
  isLoading.value = true
  try {
    // Mock data for demo
    const mockData: Transaction[] = [
      {
        id: '1',
        date: '2024-01-15',
        type: 'revenue',
        description: 'Tuition Payment - John Doe',
        amount: 2500,
        category: 'Tuition',
        status: 'completed',
        reference: 'TXN-001',
        archived: false,
        studentId: 'STU-001',
        studentName: 'John Doe'
      },
      {
        id: '2',
        date: '2024-01-14',
        type: 'expense',
        description: 'Office Supplies',
        amount: -150,
        category: 'Supplies',
        status: 'completed',
        reference: 'TXN-002',
        archived: false
      },
      {
        id: '3',
        date: '2024-01-13',
        type: 'revenue',
        description: 'Course Fee - Jane Smith',
        amount: 1800,
        category: 'Course Fees',
        status: 'pending',
        reference: 'TXN-003',
        archived: false,
        studentId: 'STU-002',
        studentName: 'Jane Smith'
      }
    ]
    
    allRecords.value = mockData
    filteredRecords.value = mockData
    updateSummary()
    updateChartData()
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const updateSummary = () => {
  const records = filteredRecords.value
  summary.value = {
    totalRevenue: records
      .filter(r => r.type === 'revenue' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0),
    totalExpenses: Math.abs(records
      .filter(r => r.type === 'expense' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0)),
    netIncome: 0,
    pendingTransactions: records.filter(r => r.status === 'pending').length
  }
  summary.value.netIncome = summary.value.totalRevenue - summary.value.totalExpenses
}

const updateChartData = () => {
  chartData.value.datasets[0].data = [
    summary.value.totalRevenue,
    summary.value.totalExpenses,
    summary.value.pendingTransactions * 1000 // Mock pending amount
  ]
}

const applyFilters = (filters: any) => {
  let filtered = [...allRecords.value]
  
  // Apply date range filter
  if (filters.dateRange && filters.dateRange.length === 2) {
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= filters.dateRange[0] && recordDate <= filters.dateRange[1]
    })
  }
  
  // Apply type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(record => record.type === filters.type)
  }
  
  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(record => record.status === filters.status)
  }
  
  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(record => record.category === filters.category)
  }
  
  // Apply archived filter
  if (!showArchived.value) {
    filtered = filtered.filter(record => !record.archived)
  }
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(record => 
      record.description.toLowerCase().includes(searchTerm) ||
      record.reference.toLowerCase().includes(searchTerm) ||
      (record.studentName && record.studentName.toLowerCase().includes(searchTerm))
    )
  }
  
  filteredRecords.value = filtered
  updateSummary()
  updateChartData()
}

const toggleArchived = () => {
  showArchived.value = !showArchived.value
  applyFilters({}) // Reapply current filters
}

const exportCSV = async () => {
  if (!canExportData.value) return
  
  isExporting.value = true
  try {
    // Mock CSV export
    const csvContent = filteredRecords.value.map(record => 
      `${record.date},${record.type},${record.description},${record.amount},${record.category},${record.status}`
    ).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `accounting-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
  } catch (error) {
    console.error('Error exporting CSV:', error)
  } finally {
    isExporting.value = false
  }
}

const reconcile = async () => {
  if (!canViewSensitiveData.value) return
  
  isReconciling.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Mock delay
    console.log('Reconciliation completed')
  } catch (error) {
    console.error('Error during reconciliation:', error)
  } finally {
    isReconciling.value = false
  }
}

const generateFinancialReport = async () => {
  if (!canExportData.value) return
  
  isGeneratingReport.value = true
  try {
    // Mock student data for report
    const mockStudents = filteredRecords.value
      .filter(r => r.studentId)
      .map(r => ({
        studentId: r.studentId!,
        name: r.studentName!,
        email: `${r.studentName?.toLowerCase().replace(' ', '.')}@example.com`,
        program: 'Massage Therapy',
        balance: r.amount,
        transactions: [r]
      }))
    
    await downloadFinancialReport(mockStudents, 'Accounting Financial Report')
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    isGeneratingReport.value = false
  }
}

const selectRecord = (record: Transaction) => {
  selectedRecord.value = record
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  selectedRecord.value = null
}

const updateRecord = (record: Transaction) => {
  const index = allRecords.value.findIndex(r => r.id === record.id)
  if (index !== -1) {
    allRecords.value[index] = record
    applyFilters({}) // Reapply filters
  }
}

const deleteRecord = async (recordId: string) => {
  try {
    allRecords.value = allRecords.value.filter(r => r.id !== recordId)
    applyFilters({}) // Reapply filters
  } catch (error) {
    console.error('Error deleting record:', error)
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
.accounting-page {
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