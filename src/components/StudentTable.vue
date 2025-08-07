<template>
  <v-card elevation="2" class="student-table">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 d-flex align-center">
        <v-icon left color="primary">mdi-account-group</v-icon>
        Student Directory
        <v-badge
          v-if="showBadge && students.length > 0"
          :content="students.length.toString()"
          color="primary"
          class="ml-2"
        />
      </span>
      <div class="d-flex align-center">
        <v-btn
          icon
          size="small"
          variant="text"
          @click="refreshTable"
          title="Refresh"
          :disabled="loading"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn
          color="primary"
          @click="handleAddStudent"
          class="ml-2"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Student
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="pa-0">
      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center align-center pa-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Error State -->
      <v-alert 
        v-else-if="error" 
        type="error" 
        border="start" 
        elevation="1" 
        class="ma-4"
      >
        <template #prepend>
          <v-icon>mdi-alert-circle</v-icon>
        </template>
        {{ error }}
        <template #append>
          <v-btn 
            variant="text" 
            color="error"
            @click="refreshTable"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>

      <!-- Data Table -->
      <div v-else>
        <v-data-table
          :headers="headers"
          :items="students"
          :loading="loading"
          :search="searchQuery"
          :items-per-page="itemsPerPage"
          :items-per-page-options="[10, 25, 50, 100]"
          class="elevation-0"
          hover
          @click:row="handleRowClick"
          @update:options="handleTableUpdate"
        >
          <!-- Status Column -->
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Program Column -->
          <template #item.program="{ item }">
            <v-chip
              color="primary"
              size="small"
              variant="outlined"
            >
              {{ item.program }}
            </v-chip>
          </template>

          <!-- Campus Column -->
          <template #item.campus="{ item }">
            <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
            {{ item.campus }}
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  v-bind="props"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="handleViewStudent(item)">
                  <template #prepend>
                    <v-icon>mdi-eye</v-icon>
                  </template>
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleEditStudent(item)">
                  <template #prepend>
                    <v-icon>mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item @click="handleDeleteStudent(item)" color="error">
                  <template #prepend>
                    <v-icon color="error">mdi-delete</v-icon>
                  </template>
                  <v-list-item-title class="text-error">Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <!-- No Data -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-off</v-icon>
              <div class="text-h6 text-grey-lighten-1 mb-2">No Students Found</div>
              <div class="text-body-2 text-grey-lighten-1 mb-4">
                Try adjusting your filters or add a new student
              </div>
              <v-btn
                color="primary"
                @click="handleAddStudent"
              >
                <v-icon left>mdi-plus</v-icon>
                Add First Student
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

interface TableOptions {
  page: number
  itemsPerPage: number
  sortBy: string[]
  sortDesc: boolean[]
}

// Props
interface Props {
  students: Student[]
  loading?: boolean
  error?: string | null
  showBadge?: boolean
  searchQuery?: string
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  students: () => [],
  loading: false,
  error: null,
  showBadge: true,
  searchQuery: '',
  itemsPerPage: 25
})

// Emits
const emit = defineEmits<{
  'select': [student: Student]
  'view': [student: Student]
  'edit': [student: Student]
  'delete': [student: Student]
  'add': []
  'refresh': []
  'table-update': [options: TableOptions]
}>()

// Table headers
const headers = [
  { 
    title: 'Name', 
    key: 'name', 
    sortable: true,
    width: '200px'
  },
  { 
    title: 'Student ID', 
    key: 'studentId', 
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Program', 
    key: 'program', 
    sortable: true,
    width: '150px'
  },
  { 
    title: 'Status', 
    key: 'status', 
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Campus', 
    key: 'campus', 
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Email', 
    key: 'email', 
    sortable: true,
    width: '200px'
  },
  { 
    title: 'Actions', 
    key: 'actions', 
    sortable: false,
    width: '80px'
  }
]

// Methods
const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'pending': 'warning',
    'enrolled': 'info',
    'active': 'success',
    'graduated': 'primary',
    'withdrawn': 'error',
    'on-hold': 'orange',
    'inactive': 'grey'
  }
  return statusColors[status.toLowerCase()] || 'grey'
}

const handleRowClick = (event: Event, item: Student): void => {
  emit('select', item)
  console.log('Row clicked:', item)
}

const handleViewStudent = (student: Student): void => {
  emit('view', student)
  console.log('View student:', student)
}

const handleEditStudent = (student: Student): void => {
  emit('edit', student)
  console.log('Edit student:', student)
}

const handleDeleteStudent = (student: Student): void => {
  emit('delete', student)
  console.log('Delete student:', student)
}

const handleAddStudent = (): void => {
  emit('add')
  console.log('Add student clicked')
}

const refreshTable = (): void => {
  emit('refresh')
  console.log('Refresh table')
}

const handleTableUpdate = (options: TableOptions): void => {
  emit('table-update', options)
  console.log('Table options updated:', options)
}
</script>

<style scoped>
.student-table {
  border-radius: 12px;
}

.v-data-table {
  border-radius: 12px;
}

/* Custom table styling */
:deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

:deep(.v-data-table-header) {
  background-color: #f5f5f5;
}

:deep(.v-data-table__tr:hover) {
  background-color: #f8f9fa;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-card-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>