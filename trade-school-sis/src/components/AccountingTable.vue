<template>
  <v-card class="accounting-table">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">
        <v-icon left color="primary">mdi-table</v-icon>
        Transactions
      </span>
      <div class="d-flex gap-2">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search transactions..."
          variant="outlined"
          density="compact"
          hide-details
          class="search-field"
          @update:model-value="handleSearch"
        />
        <v-btn
          color="primary"
          variant="outlined"
          @click="refreshTable"
          :loading="loading"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="filteredRecords"
        :loading="loading"
        :search="search"
        :items-per-page="itemsPerPage"
        :items-per-page-options="[10, 25, 50, 100]"
        class="elevation-1"
        density="compact"
        hover
        @update:options="handleTableUpdate"
      >
        <!-- Date Column -->
        <template v-slot:item.date="{ item }">
          <span class="font-weight-medium">
            {{ new Date(item.date).toLocaleDateString() }}
          </span>
        </template>

        <!-- Type Column -->
        <template v-slot:item.type="{ item }">
          <v-chip
            :color="getTypeColor(item.type)"
            size="small"
            variant="outlined"
          >
            <v-icon left size="16">{{ getTypeIcon(item.type) }}</v-icon>
            {{ item.type }}
          </v-chip>
        </template>

        <!-- Amount Column -->
        <template v-slot:item.amount="{ item }">
          <span 
            class="font-weight-bold"
            :class="item.amount >= 0 ? 'text-success' : 'text-error'"
          >
            {{ item.amount >= 0 ? '+' : '' }}${{ Math.abs(item.amount).toFixed(2) }}
          </span>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            <v-icon left size="16">{{ getStatusIcon(item.status) }}</v-icon>
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Category Column -->
        <template v-slot:item.category="{ item }">
          <v-chip
            color="primary"
            size="small"
            variant="outlined"
          >
            {{ item.category }}
          </v-chip>
        </template>

        <!-- Student Column -->
        <template v-slot:item.studentName="{ item }">
          <div v-if="item.studentName" class="d-flex align-center">
            <v-avatar size="24" color="primary" class="mr-2">
              <span class="text-caption text-white">
                {{ getInitials(item.studentName) }}
              </span>
            </v-avatar>
            <span class="text-body-2">{{ item.studentName }}</span>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon
              size="small"
              color="primary"
              variant="text"
              @click="viewRecord(item)"
              title="View Details"
            >
              <v-icon size="18">mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="info"
              variant="text"
              @click="editRecord(item)"
              title="Edit Record"
            >
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="warning"
              variant="text"
              @click="duplicateRecord(item)"
              title="Duplicate"
            >
              <v-icon size="18">mdi-content-copy</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="error"
              variant="text"
              @click="deleteRecord(item)"
              title="Delete Record"
            >
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- No Data -->
        <template v-slot:no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-database-off</v-icon>
            <div class="text-h6 text-grey-lighten-1">No transactions found</div>
            <div class="text-body-2 text-medium-emphasis mt-2">
              Try adjusting your filters or search terms
            </div>
          </div>
        </template>

        <!-- Loading -->
        <template v-slot:loading>
          <div class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-body-2 text-medium-emphasis mt-2">Loading transactions...</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon left color="error">mdi-alert</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this transaction?
          <br><br>
          <strong>{{ recordToDelete?.description }}</strong>
          <br>
          <span class="text-medium-emphasis">This action cannot be undone.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn 
            color="error" 
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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

interface Props {
  records: Transaction[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'select-record': [record: Transaction]
  'update-record': [record: Transaction]
  'delete-record': [recordId: string]
}>()

// Reactive data
const search = ref('')
const itemsPerPage = ref(25)
const deleteDialog = ref(false)
const recordToDelete = ref<Transaction | null>(null)
const isDeleting = ref(false)

// Table headers
const headers = [
  { title: 'Date', key: 'date', sortable: true, width: '120px' },
  { title: 'Type', key: 'type', sortable: true, width: '100px' },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true, align: 'end', width: '120px' },
  { title: 'Category', key: 'category', sortable: true, width: '120px' },
  { title: 'Status', key: 'status', sortable: true, width: '100px' },
  { title: 'Reference', key: 'reference', sortable: true, width: '120px' },
  { title: 'Student', key: 'studentName', sortable: true, width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
]

// Computed properties
const filteredRecords = computed(() => {
  if (!search.value) return props.records
  
  const searchTerm = search.value.toLowerCase()
  return props.records.filter(record => 
    record.description.toLowerCase().includes(searchTerm) ||
    record.reference.toLowerCase().includes(searchTerm) ||
    record.category.toLowerCase().includes(searchTerm) ||
    (record.studentName && record.studentName.toLowerCase().includes(searchTerm))
  )
})

// Helper functions
const getTypeColor = (type: string) => {
  return type === 'revenue' ? 'success' : 'error'
}

const getTypeIcon = (type: string) => {
  return type === 'revenue' ? 'mdi-arrow-up' : 'mdi-arrow-down'
}

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'success',
    pending: 'warning',
    failed: 'error'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons = {
    completed: 'mdi-check-circle',
    pending: 'mdi-clock',
    failed: 'mdi-close-circle'
  }
  return icons[status as keyof typeof icons] || 'mdi-help-circle'
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
const handleSearch = () => {
  // Search is handled by v-data-table
}

const handleTableUpdate = (options: any) => {
  // Handle table options updates if needed
  console.log('Table options updated:', options)
}

const refreshTable = () => {
  // Emit refresh event or call parent method
  emit('select-record', {} as Transaction) // This would trigger a refresh in parent
}

const viewRecord = (record: Transaction) => {
  emit('select-record', record)
}

const editRecord = (record: Transaction) => {
  // In a real app, this would open an edit modal or navigate to edit page
  console.log('Edit record:', record)
}

const duplicateRecord = (record: Transaction) => {
  // Create a copy of the record for editing
  const duplicate = { ...record, id: `copy-${Date.now()}`, reference: `${record.reference}-COPY` }
  emit('update-record', duplicate)
}

const deleteRecord = (record: Transaction) => {
  recordToDelete.value = record
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!recordToDelete.value) return
  
  isDeleting.value = true
  try {
    emit('delete-record', recordToDelete.value.id)
    deleteDialog.value = false
    recordToDelete.value = null
  } catch (error) {
    console.error('Error deleting record:', error)
  } finally {
    isDeleting.value = false
  }
}

// Watch for records changes
watch(() => props.records, () => {
  // Reset search when records change
  search.value = ''
}, { deep: true })

// Expose methods for parent component
defineExpose({
  refreshTable,
  clearSearch: () => { search.value = '' }
})
</script>

<style scoped>
.accounting-table {
  border-radius: 12px;
}

.search-field {
  max-width: 300px;
}

.v-data-table {
  border-radius: 8px;
}

.v-chip {
  font-weight: 500;
}
</style> 