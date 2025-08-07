<template>
  <v-card class="transaction-detail-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">
        <v-icon left color="primary">mdi-receipt</v-icon>
        Transaction Details
      </span>
      <div class="d-flex gap-2">
        <v-btn 
          v-if="canView" 
          icon 
          color="primary" 
          @click="handleDownloadInvoice"
          :loading="isGeneratingPdf"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-tabs v-model="activeTab" grow>
        <v-tab value="overview">Overview</v-tab>
        <v-tab value="details">Details</v-tab>
        <v-tab value="history">History</v-tab>
        <v-tab v-if="canView" value="notes">Internal Notes</v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-4">
        <!-- Overview Tab -->
        <v-window-item value="overview">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Transaction Summary</h3>
                  <v-chip
                    :color="getStatusColor(record.status)"
                    size="small"
                  >
                    {{ record.status }}
                  </v-chip>
                </div>
                
                <div class="space-y-3">
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Amount:</span>
                    <span 
                      class="font-weight-bold text-h6"
                      :class="record.amount >= 0 ? 'text-success' : 'text-error'"
                    >
                      {{ record.amount >= 0 ? '+' : '' }}${{ Math.abs(record.amount).toFixed(2) }}
                    </span>
                  </div>
                  
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Type:</span>
                    <v-chip
                      :color="getTypeColor(record.type)"
                      size="small"
                      variant="outlined"
                    >
                      {{ record.type }}
                    </v-chip>
                  </div>
                  
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Category:</span>
                    <span class="font-weight-medium">{{ record.category }}</span>
                  </div>
                  
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Date:</span>
                    <span>{{ new Date(record.date).toLocaleDateString() }}</span>
                  </div>
                  
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Reference:</span>
                    <span class="font-weight-medium">{{ record.reference }}</span>
                  </div>
                </div>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4">
                <h3 class="text-h6 mb-4">Description</h3>
                <p class="text-body-1">{{ record.description }}</p>
                
                <v-divider class="my-4"></v-divider>
                
                <div v-if="record.studentName" class="space-y-2">
                  <h4 class="text-subtitle-1 font-weight-medium">Related Student</h4>
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="primary" class="mr-3">
                      <span class="text-caption text-white">
                        {{ getInitials(record.studentName) }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ record.studentName }}</div>
                      <div class="text-caption text-medium-emphasis">ID: {{ record.studentId }}</div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Details Tab -->
        <v-window-item value="details">
          <v-row>
            <v-col cols="12">
              <v-card variant="outlined" class="pa-4">
                <h3 class="text-h6 mb-4">Transaction Details</h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="record.id"
                      label="Transaction ID"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="record.reference"
                      label="Reference Number"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="record.date"
                      label="Transaction Date"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="record.amount"
                      label="Amount"
                      variant="outlined"
                      density="compact"
                      readonly
                      :prefix="record.amount >= 0 ? '+' : ''"
                      suffix="$"
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="record.type"
                      :items="typeOptions"
                      label="Transaction Type"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="record.category"
                      :items="categoryOptions"
                      label="Category"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="record.status"
                      :items="statusOptions"
                      label="Status"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="record.archived"
                      label="Archived"
                      readonly
                    />
                  </v-col>
                  
                  <v-col cols="12">
                    <v-textarea
                      v-model="record.description"
                      label="Description"
                      variant="outlined"
                      density="compact"
                      readonly
                      rows="3"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- History Tab -->
        <v-window-item value="history">
          <v-card variant="outlined" class="pa-4">
            <h3 class="text-h6 mb-4">Transaction History</h3>
            
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-for="(event, index) in transactionHistory"
                :key="index"
                :dot-color="event.color"
                size="small"
              >
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <div class="font-weight-medium">{{ event.title }}</div>
                    <div class="text-caption text-medium-emphasis">{{ event.description }}</div>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ new Date(event.timestamp).toLocaleString() }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card>
        </v-window-item>

        <!-- Internal Notes Tab -->
        <v-window-item v-if="canView" value="notes">
          <v-card variant="outlined" class="pa-4">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6">Internal Notes</h3>
              <v-btn
                color="primary"
                size="small"
                @click="addNote"
              >
                <v-icon left>mdi-plus</v-icon>
                Add Note
              </v-btn>
            </div>
            
            <div v-if="internalNotes.length === 0" class="text-center pa-8">
              <v-icon size="48" color="grey-lighten-1" class="mb-4">mdi-note-text</v-icon>
              <div class="text-h6 text-grey-lighten-1">No internal notes</div>
              <div class="text-body-2 text-medium-emphasis mt-2">
                Add notes for internal reference
              </div>
            </div>
            
            <div v-else class="space-y-3">
              <v-card
                v-for="note in internalNotes"
                :key="note.id"
                variant="outlined"
                class="pa-3"
              >
                <div class="d-flex justify-space-between align-start mb-2">
                  <div class="font-weight-medium">{{ note.author }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ new Date(note.timestamp).toLocaleString() }}
                  </div>
                </div>
                <p class="text-body-2">{{ note.content }}</p>
              </v-card>
            </div>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer />
      <v-btn variant="text" @click="$emit('close')">Close</v-btn>
      <v-btn 
        v-if="canView"
        color="primary" 
        @click="editTransaction"
      >
        Edit Transaction
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePdfExport } from '@/composables/usePdfExport'

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

interface TransactionHistory {
  id: string
  title: string
  description: string
  timestamp: string
  color: string
}

interface InternalNote {
  id: string
  author: string
  content: string
  timestamp: string
}

interface Props {
  record: Transaction
  canView: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'update': [record: Transaction]
}>()

// PDF export composable
const { downloadInvoice } = usePdfExport()

// Reactive data
const activeTab = ref('overview')
const isGeneratingPdf = ref(false)

// Mock data
const transactionHistory = ref<TransactionHistory[]>([
  {
    id: '1',
    title: 'Transaction Created',
    description: 'Transaction was created in the system',
    timestamp: props.record.date,
    color: 'primary'
  },
  {
    id: '2',
    title: 'Status Updated',
    description: 'Status changed to completed',
    timestamp: new Date().toISOString(),
    color: 'success'
  }
])

const internalNotes = ref<InternalNote[]>([
  {
    id: '1',
    author: 'Finance Manager',
    content: 'Payment received via bank transfer. All documentation verified.',
    timestamp: new Date().toISOString()
  }
])

// Options for form fields
const typeOptions = [
  { title: 'Revenue', value: 'revenue' },
  { title: 'Expense', value: 'expense' }
]

const categoryOptions = [
  { title: 'Tuition', value: 'Tuition' },
  { title: 'Course Fees', value: 'Course Fees' },
  { title: 'Supplies', value: 'Supplies' },
  { title: 'Equipment', value: 'Equipment' },
  { title: 'Utilities', value: 'Utilities' },
  { title: 'Rent', value: 'Rent' },
  { title: 'Other', value: 'Other' }
]

const statusOptions = [
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
  { title: 'Failed', value: 'failed' }
]

// Computed properties
const record = computed(() => props.record)

// Helper functions
const getStatusColor = (status: string) => {
  const colors = {
    completed: 'success',
    pending: 'warning',
    failed: 'error'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getTypeColor = (type: string) => {
  return type === 'revenue' ? 'success' : 'error'
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Methods
const handleDownloadInvoice = async () => {
  if (!props.canView) return
  
  isGeneratingPdf.value = true
  try {
    // Mock student data for invoice
    const mockStudent = {
      studentId: props.record.studentId || 'N/A',
      name: props.record.studentName || 'Unknown Student',
      email: 'student@example.com',
      program: 'Massage Therapy',
      balance: props.record.amount,
      transactions: [props.record]
    }
    
    await downloadInvoice(mockStudent)
  } catch (error) {
    console.error('Error generating invoice:', error)
  } finally {
    isGeneratingPdf.value = false
  }
}

const addNote = () => {
  // In a real app, this would open a dialog to add a note
  const newNote: InternalNote = {
    id: Date.now().toString(),
    author: 'Current User',
    content: 'New internal note',
    timestamp: new Date().toISOString()
  }
  internalNotes.value.unshift(newNote)
}

const editTransaction = () => {
  // In a real app, this would open an edit modal or navigate to edit page
  console.log('Edit transaction:', props.record)
}
</script>

<style scoped>
.transaction-detail-card {
  border-radius: 12px;
}

.space-y-3 > * + * {
  margin-top: 12px;
}

.space-y-2 > * + * {
  margin-top: 8px;
}

.v-timeline-item {
  min-height: 60px;
}
</style> 