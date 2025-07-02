<template>
  <v-card class="student-detail-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Student Details</span>
      <div class="d-flex gap-2">
        <v-btn 
          v-if="canViewSensitiveData" 
          icon 
          color="primary" 
          @click="downloadInvoice"
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
        <v-tab value="transactions">Transactions</v-tab>
        <v-tab v-if="canViewSensitiveData" value="internal">Internal Notes</v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-4">
        <!-- Overview Tab -->
        <v-window-item value="overview">
          <div class="overview-content">
            <v-row>
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item>
                    <v-list-item-title><strong>Student ID:</strong></v-list-item-title>
                    <v-list-item-subtitle>{{ student.studentId }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><strong>Name:</strong></v-list-item-title>
                    <v-list-item-subtitle>{{ student.name }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><strong>Email:</strong></v-list-item-title>
                    <v-list-item-subtitle>{{ student.email }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><strong>Program:</strong></v-list-item-title>
                    <v-list-item-subtitle>{{ student.program }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><strong>Status:</strong></v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip 
                        :color="student.status === 'active' ? 'success' : 'warning'"
                        size="small"
                      >
                        {{ student.status }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item>
                    <v-list-item-title><strong>Enrollment Date:</strong></v-list-item-title>
                    <v-list-item-subtitle>{{ student.enrollmentDate }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><strong>Funding:</strong></v-list-item-title>
                    <v-list-item-subtitle>{{ student.funding }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="canViewSensitiveData">
                    <v-list-item-title><strong>Balance:</strong></v-list-item-title>
                    <v-list-item-subtitle class="text-h6" :class="student.balance > 0 ? 'text-error' : 'text-success'">
                      ${{ student.balance.toFixed(2) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><strong>Total Transactions:</strong></v-list-item-title>
                    <v-list-item-subtitle>{{ student.transactions?.length || 0 }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </div>
        </v-window-item>

        <!-- Transactions Tab -->
        <v-window-item value="transactions">
          <div class="transactions-content">
            <v-data-table
              :headers="transactionHeaders"
              :items="student.transactions || []"
              :loading="isLoading"
              class="elevation-1"
              density="compact"
            >
              <template v-slot:item.amount="{ item }">
                <span :class="item.amount < 0 ? 'text-success' : 'text-error'">
                  ${{ Math.abs(item.amount).toFixed(2) }}
                </span>
              </template>
              <template v-slot:item.date="{ item }">
                {{ new Date(item.date).toLocaleDateString() }}
              </template>
            </v-data-table>
          </div>
        </v-window-item>

        <!-- Internal Notes Tab -->
        <v-window-item v-if="canViewSensitiveData" value="internal">
          <div class="internal-notes-content">
            <v-textarea
              v-model="internalNotes"
              label="Internal Notes"
              placeholder="Add internal notes about this student..."
              rows="4"
              variant="outlined"
            ></v-textarea>
            <v-btn 
              color="primary" 
              @click="saveNotes"
              :loading="isSavingNotes"
              class="mt-2"
            >
              Save Notes
            </v-btn>
          </div>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { usePdfExport } from '@/composables/usePdfExport'

interface Transaction {
  id: string
  date: string
  type: string
  amount: number
  description?: string
}

interface Student {
  studentId: string
  name: string
  email: string
  program: string
  status: string
  enrollmentDate: string
  funding: string
  balance: number
  transactions?: Transaction[]
}

interface Props {
  student: Student
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<{
  close: []
  updateNotes: [notes: string]
}>()

// Auth composable
const { canViewSensitiveData } = useAuth()

// PDF export composable
const { downloadInvoice } = usePdfExport()

// Local state
const activeTab = ref('overview')
const internalNotes = ref('')
const isGeneratingPdf = ref(false)
const isSavingNotes = ref(false)

// Transaction table headers
const transactionHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Amount', key: 'amount', sortable: true, align: 'end' }
]

// Download invoice function
const handleDownloadInvoice = async () => {
  if (!canViewSensitiveData.value) return
  
  isGeneratingPdf.value = true
  try {
    await downloadInvoice(props.student)
  } catch (error) {
    console.error('Error generating PDF:', error)
  } finally {
    isGeneratingPdf.value = false
  }
}

// Save internal notes
const saveNotes = async () => {
  isSavingNotes.value = true
  try {
    emit('updateNotes', internalNotes.value)
    // In a real app, you would save to the backend here
  } catch (error) {
    console.error('Error saving notes:', error)
  } finally {
    isSavingNotes.value = false
  }
}

// Expose methods for parent component
defineExpose({
  downloadInvoice: handleDownloadInvoice
})
</script>

<style scoped>
.student-detail-card {
  max-width: 800px;
  margin: 0 auto;
}

.overview-content,
.transactions-content,
.internal-notes-content {
  padding: 16px 0;
}

.v-list-item {
  padding: 8px 0;
}

.v-list-item-title {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.v-list-item-subtitle {
  color: rgba(0, 0, 0, 0.6);
}
</style> 