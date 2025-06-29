<template>
  <v-card class="placement-table-card">
    <v-card-title class="d-flex align-center">
      <v-icon left color="primary">mdi-table</v-icon>
      Student Placement Records
      <v-spacer />
      <v-chip color="primary" variant="outlined">
        {{ records.length }} Students
      </v-chip>
    </v-card-title>
    
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="records"
        :loading="loading"
        :search="search"
        :sort-by="sortBy"
        :sort-desc="sortDesc"
        :items-per-page="itemsPerPage"
        :items-per-page-options="[10, 25, 50, 100]"
        class="elevation-1"
        item-value="id"
        @click:row="handleRowClick"
        @update:options="handleTableUpdate"
      >
        <!-- Custom header for search -->
        <template v-slot:top>
          <v-row class="pa-4" dense>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="search"
                label="Search students..."
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="itemsPerPage"
                :items="[10, 25, 50, 100]"
                label="Items per page"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" class="d-flex align-center">
              <v-btn 
                color="secondary" 
                variant="outlined"
                @click="exportTableData"
                :disabled="records.length === 0"
              >
                <v-icon left>mdi-download</v-icon>
                Export
              </v-btn>
            </v-col>
          </v-row>
        </template>

        <!-- Custom cell for Name -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3">
              <v-img 
                :src="getAvatarUrl(item.name)" 
                :alt="item.name"
                fallback-src="https://via.placeholder.com/32"
              />
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Custom cell for Student ID -->
        <template v-slot:item.studentId="{ item }">
          <v-chip 
            size="small" 
            color="primary" 
            variant="outlined"
            class="font-weight-medium"
          >
            {{ item.studentId }}
          </v-chip>
        </template>

        <!-- Custom cell for Campus -->
        <template v-slot:item.campus="{ item }">
          <v-chip 
            size="small" 
            :color="getCampusColor(item.campus)"
            variant="tonal"
          >
            <v-icon left size="small">{{ getCampusIcon(item.campus) }}</v-icon>
            {{ item.campus }}
          </v-chip>
        </template>

        <!-- Custom cell for Program -->
        <template v-slot:item.program="{ item }">
          <div class="font-weight-medium">{{ item.program }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.session }}</div>
        </template>

        <!-- Custom cell for Status -->
        <template v-slot:item.status="{ item }">
          <v-chip 
            size="small" 
            :color="getStatusColor(item.status)"
            variant="tonal"
          >
            <v-icon left size="small">{{ getStatusIcon(item.status) }}</v-icon>
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Custom cell for Employed Status -->
        <template v-slot:item.employedStatus="{ item }">
          <v-chip 
            size="small" 
            :color="getEmployedStatusColor(item.employedStatus)"
            variant="tonal"
          >
            <v-icon left size="small">{{ getEmployedStatusIcon(item.employedStatus) }}</v-icon>
            {{ item.employedStatus }}
          </v-chip>
        </template>

        <!-- Custom cell for Placement Status -->
        <template v-slot:item.placementStatus="{ item }">
          <v-chip 
            size="small" 
            :color="getPlacementStatusColor(item.placementStatus)"
            variant="tonal"
          >
            <v-icon left size="small">{{ getPlacementStatusIcon(item.placementStatus) }}</v-icon>
            {{ item.placementStatus }}
          </v-chip>
        </template>

        <!-- Custom cell for Actions -->
        <template v-slot:item.actions="{ item }">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn 
                icon 
                size="small"
                v-bind="props"
                variant="text"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="selectRecord(item)">
                <template v-slot:prepend>
                  <v-icon>mdi-eye</v-icon>
                </template>
                <v-list-item-title>View Details</v-list-item-title>
              </v-list-item>
              
              <v-list-item @click="editRecord(item)">
                <template v-slot:prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>Edit Record</v-list-item-title>
              </v-list-item>
              
              <v-list-item @click="downloadResume(item)">
                <template v-slot:prepend>
                  <v-icon>mdi-download</v-icon>
                </template>
                <v-list-item-title>Download Resume</v-list-item-title>
              </v-list-item>
              
              <v-list-item @click="sendEmail(item)">
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>Send Email</v-list-item-title>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item @click="deleteRecord(item)" color="error">
                <template v-slot:prepend>
                  <v-icon color="error">mdi-delete</v-icon>
                </template>
                <v-list-item-title class="text-error">Delete Record</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- No data template -->
        <template v-slot:no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-database-off</v-icon>
            <div class="text-h6 text-grey">No placement records found</div>
            <div class="text-body-2 text-grey-lighten-1 mt-2">
              Try adjusting your filters or search criteria
            </div>
          </div>
        </template>

        <!-- Loading template -->
        <template v-slot:loading>
          <div class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-body-2 text-grey mt-2">Loading placement data...</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

// Props
interface Props {
  records: Student[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  selectRecord: [student: Student]
  updateRecord: [student: Student]
  deleteRecord: [studentId: string]
}>()

// Reactive data
const search = ref('')
const sortBy = ref('name')
const sortDesc = ref(false)
const itemsPerPage = ref(25)

// Table headers
const headers = [
  { 
    title: 'Name', 
    key: 'name', 
    sortable: true,
    width: '250px'
  },
  { 
    title: 'Student ID', 
    key: 'studentId', 
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
    title: 'Program', 
    key: 'program', 
    sortable: true,
    width: '200px'
  },
  { 
    title: 'Status', 
    key: 'status', 
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Group', 
    key: 'group', 
    sortable: true,
    width: '80px'
  },
  { 
    title: 'Employed', 
    key: 'employedStatus', 
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Placement', 
    key: 'placementStatus', 
    sortable: true,
    width: '120px'
  },
  { 
    title: 'Actions', 
    key: 'actions', 
    sortable: false,
    width: '80px'
  }
]

// Methods
const handleRowClick = (event: any, item: Student) => {
  selectRecord(item)
}

const handleTableUpdate = (options: any) => {
  sortBy.value = options.sortBy?.[0] || 'name'
  sortDesc.value = options.sortDesc?.[0] || false
  itemsPerPage.value = options.itemsPerPage || 25
}

const selectRecord = (student: Student) => {
  emit('selectRecord', student)
}

const editRecord = (student: Student) => {
  emit('updateRecord', student)
}

const deleteRecord = (student: Student) => {
  if (confirm(`Are you sure you want to delete ${student.name}'s record?`)) {
    emit('deleteRecord', student.id)
  }
}

const downloadResume = (student: Student) => {
  if (student.resume) {
    // Mock download functionality
    const link = document.createElement('a')
    link.href = student.resume
    link.download = `${student.name}-resume.pdf`
    link.click()
  } else {
    alert('No resume available for this student.')
  }
}

const sendEmail = (student: Student) => {
  // Mock email functionality
  window.open(`mailto:${student.email}?subject=Placement Update - ${student.name}`)
}

const exportTableData = () => {
  const csvContent = [
    // Header row
    ['Name', 'Student ID', 'Campus', 'Program', 'Status', 'Employed Status', 'Placement Status', 'Email', 'Phone'],
    // Data rows
    ...props.records.map(student => [
      student.name,
      student.studentId,
      student.campus,
      student.program,
      student.status,
      student.employedStatus,
      student.placementStatus,
      student.email,
      student.phone
    ])
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `placement-data-${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Helper methods for styling
const getAvatarUrl = (name: string) => {
  // Mock avatar URL generation
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1976D2&color=fff&size=32`
}

const getCampusColor = (campus: string) => {
  const colors = {
    'Downtown': 'primary',
    'West Campus': 'success',
    'East Campus': 'info',
    'Online': 'warning'
  }
  return colors[campus as keyof typeof colors] || 'grey'
}

const getCampusIcon = (campus: string) => {
  const icons = {
    'Downtown': 'mdi-city',
    'West Campus': 'mdi-school',
    'East Campus': 'mdi-school',
    'Online': 'mdi-laptop'
  }
  return icons[campus as keyof typeof icons] || 'mdi-map-marker'
}

const getStatusColor = (status: string) => {
  const colors = {
    'Graduated': 'success',
    'In Progress': 'info',
    'Withdrawn': 'error',
    'Suspended': 'warning'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons = {
    'Graduated': 'mdi-school',
    'In Progress': 'mdi-progress-clock',
    'Withdrawn': 'mdi-account-remove',
    'Suspended': 'mdi-pause-circle'
  }
  return icons[status as keyof typeof icons] || 'mdi-help-circle'
}

const getEmployedStatusColor = (status: string) => {
  const colors = {
    'Employed': 'success',
    'Seeking': 'warning',
    'Not Seeking': 'error',
    'Self-Employed': 'info'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getEmployedStatusIcon = (status: string) => {
  const icons = {
    'Employed': 'mdi-briefcase-check',
    'Seeking': 'mdi-account-search',
    'Not Seeking': 'mdi-account-remove',
    'Self-Employed': 'mdi-account-tie'
  }
  return icons[status as keyof typeof icons] || 'mdi-help-circle'
}

const getPlacementStatusColor = (status: string) => {
  const colors = {
    'Placed': 'success',
    'Pending': 'warning',
    'Referred': 'info',
    'Not Placed': 'error'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getPlacementStatusIcon = (status: string) => {
  const icons = {
    'Placed': 'mdi-check-circle',
    'Pending': 'mdi-clock-outline',
    'Referred': 'mdi-account-arrow-right',
    'Not Placed': 'mdi-close-circle'
  }
  return icons[status as keyof typeof icons] || 'mdi-help-circle'
}
</script>

<style scoped>
.placement-table-card {
  border-radius: 12px;
}

.v-data-table {
  border-radius: 8px;
}

.v-chip {
  font-size: 0.75rem;
}

.v-list-item {
  min-height: 40px;
}

.v-list-item-title {
  font-size: 0.875rem;
}
</style> 