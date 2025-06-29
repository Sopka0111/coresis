<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ student?.name }} - Financial Details</span>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')" />
    </v-card-title>
    
    <v-card-text>
      <!-- Basic Information -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-h6 mb-3">Student Information</v-card-title>
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account</v-icon>
                </template>
                <v-list-item-title><strong>Student ID:</strong> {{ student?.studentId }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-school</v-icon>
                </template>
                <v-list-item-title><strong>Program:</strong> {{ student?.program }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title><strong>Campus:</strong> {{ student?.campus }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="warning">mdi-clock</v-icon>
                </template>
                <v-list-item-title><strong>Session:</strong> {{ student?.session }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-h6 mb-3">Financial Summary</v-card-title>
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-currency-usd</v-icon>
                </template>
                <v-list-item-title><strong>Funding Type:</strong> {{ student?.funding }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :color="getStatusColor(student?.status)">mdi-circle</v-icon>
                </template>
                <v-list-item-title><strong>Status:</strong> {{ student?.status }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-account-group</v-icon>
                </template>
                <v-list-item-title><strong>Group:</strong> {{ student?.group }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :color="getBalanceColor(student?.balance)">mdi-wallet</v-icon>
                </template>
                <v-list-item-title>
                  <strong>Current Balance:</strong> 
                  <span :class="getBalanceTextColor(student?.balance)">
                    ${{ formatCurrency(student?.balance) }}
                  </span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <!-- Financial Details -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-h6 mb-3">Financial Breakdown</v-card-title>
            <v-row>
              <v-col cols="12" md="3">
                <div class="text-center pa-3">
                  <div class="text-h5 font-weight-bold text-success">${{ formatCurrency(student?.tuitionPaid || 0) }}</div>
                  <div class="text-subtitle-2">Tuition Paid</div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-center pa-3">
                  <div class="text-h5 font-weight-bold text-primary">${{ formatCurrency(student?.tuitionTotal || 0) }}</div>
                  <div class="text-subtitle-2">Total Tuition</div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-center pa-3">
                  <div class="text-h5 font-weight-bold text-warning">${{ formatCurrency(student?.outstandingBalance || 0) }}</div>
                  <div class="text-subtitle-2">Outstanding</div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-center pa-3">
                  <div class="text-h5 font-weight-bold text-info">${{ formatCurrency(student?.scholarshipAmount || 0) }}</div>
                  <div class="text-subtitle-2">Scholarships</div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Payment History -->
      <v-row>
        <v-col cols="12">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-h6 mb-3 d-flex justify-space-between align-center">
              <span>Payment History</span>
              <v-btn color="primary" size="small" prepend-icon="mdi-plus">
                Add Payment
              </v-btn>
            </v-card-title>
            <v-data-table
              :headers="paymentHeaders"
              :items="student?.paymentHistory || []"
              :items-per-page="5"
              class="elevation-0"
            >
              <template v-slot:item.amount="{ item }">
                <span class="font-weight-bold" :class="item.type === 'Payment' ? 'text-success' : 'text-error'">
                  {{ item.type === 'Payment' ? '-' : '+' }}${{ formatCurrency(item.amount) }}
                </span>
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getPaymentStatusColor(item.status)"
                  :text="item.status"
                  size="small"
                  variant="elevated"
                />
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="editFinancials">
        <v-icon left>mdi-pencil</v-icon>
        Edit Financials
      </v-btn>
      <v-btn color="success" @click="processPayment">
        <v-icon left>mdi-credit-card</v-icon>
        Process Payment
      </v-btn>
      <v-btn variant="outlined" @click="$emit('close')">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Type definitions
interface Payment {
  id: string
  date: string
  description: string
  amount: number
  type: 'Payment' | 'Charge'
  status: 'Completed' | 'Pending' | 'Failed'
  method?: string
}

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
  paymentHistory?: Payment[]
}

// Props
const props = defineProps<{
  student?: Student | null
}>()

// Emits
const emit = defineEmits<{
  close: []
  edit: [student: Student]
  payment: [student: Student]
}>()

// Payment table headers
const paymentHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Method', key: 'method', sortable: true }
]

// Methods
const getStatusColor = (status?: string): string => {
  const colors: Record<string, string> = {
    'Enrolled': 'success',
    'Graduated': 'primary',
    'Withdrawn': 'warning',
    'Dismissed': 'error',
    'Pending': 'info'
  }
  return colors[status || ''] || 'grey'
}

const getBalanceColor = (balance?: number): string => {
  if (!balance) return 'grey'
  if (balance > 0) return 'error'
  if (balance < 0) return 'success'
  return 'warning'
}

const getBalanceTextColor = (balance?: number): string => {
  if (!balance) return ''
  if (balance > 0) return 'text-error'
  if (balance < 0) return 'text-success'
  return 'text-warning'
}

const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Completed': 'success',
    'Pending': 'warning',
    'Failed': 'error'
  }
  return colors[status] || 'grey'
}

const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '0.00'
  return Math.abs(amount).toFixed(2)
}

const editFinancials = (): void => {
  if (props.student) {
    emit('edit', props.student)
  }
}

const processPayment = (): void => {
  if (props.student) {
    emit('payment', props.student)
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-data-table {
  border-radius: 8px;
}
</style> 