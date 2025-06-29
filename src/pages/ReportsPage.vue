<template>
  <v-container fluid>
    <!-- Header with search and filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search reports..."
          variant="outlined"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedCategory"
          :items="categoryOptions"
          label="Filter by category"
          variant="outlined"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Reports Grid -->
    <v-row>
      <v-col 
        cols="12" 
        v-for="category in filteredCategories" 
        :key="category.name"
        class="mb-6"
      >
        <v-card class="report-category-card">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" :icon="category.icon"></v-icon>
            {{ category.name }}
            <v-chip 
              class="ml-2" 
              size="small" 
              color="primary" 
              variant="outlined"
            >
              {{ category.reports.length }} reports
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col 
                cols="12" 
                sm="6" 
                md="4" 
                lg="3" 
                v-for="report in category.reports" 
                :key="report.name"
              >
                <v-card 
                  class="report-card" 
                  :class="{ 'disabled-card': !hasAccess(report.permission) }"
                  elevation="2"
                  hover
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon 
                      :icon="report.icon" 
                      size="48" 
                      :color="hasAccess(report.permission) ? 'primary' : 'grey'"
                      class="mb-3"
                    />
                    <div class="text-h6 mb-2">{{ report.name }}</div>
                    <div class="text-body-2 text-medium-emphasis mb-3">
                      {{ report.description }}
                    </div>
                    
                    <!-- Export Options -->
                    <div class="d-flex justify-center gap-2 mb-3" v-if="hasAccess(report.permission)">
                      <v-btn
                        v-for="format in report.formats"
                        :key="format"
                        :icon="getFormatIcon(format)"
                        size="small"
                        variant="outlined"
                        color="primary"
                        @click="exportReport(report, format)"
                        :title="`Export as ${format.toUpperCase()}`"
                      />
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="d-flex gap-2">
                      <v-btn
                        block
                        color="primary"
                        :disabled="!hasAccess(report.permission)"
                        @click="openReport(report)"
                        :loading="report.loading"
                      >
                        <v-icon left>mdi-eye</v-icon>
                        View Report
                      </v-btn>
                      
                      <v-btn
                        v-if="report.scheduleable"
                        icon
                        size="small"
                        variant="outlined"
                        color="secondary"
                        @click="scheduleReport(report)"
                        :disabled="!hasAccess(report.permission)"
                      >
                        <v-icon>mdi-clock-outline</v-icon>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Schedule Report Dialog -->
    <v-dialog v-model="scheduleDialog" max-width="500">
      <v-card>
        <v-card-title>Schedule Report</v-card-title>
        <v-card-text>
          <v-form ref="scheduleForm">
            <v-select
              v-model="scheduleData.frequency"
              :items="['Daily', 'Weekly', 'Monthly', 'Quarterly']"
              label="Frequency"
              required
            />
            <v-text-field
              v-model="scheduleData.email"
              label="Email Address"
              type="email"
              required
            />
            <v-textarea
              v-model="scheduleData.notes"
              label="Notes (Optional)"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="scheduleDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmSchedule">Schedule</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Types
interface Report {
  name: string
  description: string
  permission: string
  icon: string
  formats: string[]
  scheduleable: boolean
  loading?: boolean
  route?: string
}

interface Category {
  name: string
  icon: string
  reports: Report[]
}

interface ScheduleData {
  frequency: string
  email: string
  notes: string
}

// Composables
const { userRole } = useAuth()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const scheduleDialog = ref(false)
const scheduleData = ref<ScheduleData>({
  frequency: 'Weekly',
  email: '',
  notes: ''
})

// Report categories
const categories = ref<Category[]>([
  {
    name: 'Admissions',
    icon: 'mdi-account-plus',
    reports: [
      {
        name: 'Admissions Rep Statistics',
        description: 'Track performance metrics for admissions representatives',
        permission: 'admin',
        icon: 'mdi-chart-line',
        formats: ['pdf', 'csv', 'xlsx'],
        scheduleable: true
      },
      {
        name: 'Lead Source Statistics',
        description: 'Analyze effectiveness of different lead sources',
        permission: 'admin',
        icon: 'mdi-source-branch',
        formats: ['pdf', 'csv'],
        scheduleable: true
      },
      {
        name: 'Tasks',
        description: 'View and manage admission-related tasks',
        permission: 'all',
        icon: 'mdi-checkbox-marked-circle-outline',
        formats: ['pdf'],
        scheduleable: false
      }
    ]
  },
  {
    name: 'Registrar',
    icon: 'mdi-school',
    reports: [
      {
        name: 'Academic Calendar',
        description: 'View academic calendar and important dates',
        permission: 'registrar',
        icon: 'mdi-calendar',
        formats: ['pdf', 'csv'],
        scheduleable: true
      },
      {
        name: 'Grades',
        description: 'Student grade reports and academic performance',
        permission: 'registrar',
        icon: 'mdi-grade',
        formats: ['pdf', 'xlsx'],
        scheduleable: true
      },
      {
        name: 'Transcripts',
        description: 'Generate official student transcripts',
        permission: 'registrar',
        icon: 'mdi-file-document',
        formats: ['pdf'],
        scheduleable: false
      },
      {
        name: 'Student Summary',
        description: 'Comprehensive student information summary',
        permission: 'all',
        icon: 'mdi-account-details',
        formats: ['pdf', 'csv'],
        scheduleable: true
      }
    ]
  },
  {
    name: 'Finance',
    icon: 'mdi-currency-usd',
    reports: [
      {
        name: 'Balance Sheet',
        description: 'Financial position and balance sheet report',
        permission: 'finance',
        icon: 'mdi-chart-bar',
        formats: ['pdf', 'xlsx'],
        scheduleable: true
      },
      {
        name: 'Payments Due',
        description: 'Track outstanding payments and due dates',
        permission: 'finance',
        icon: 'mdi-clock-alert',
        formats: ['pdf', 'csv'],
        scheduleable: true
      },
      {
        name: 'Title IV Recipients',
        description: 'Federal financial aid recipient reports',
        permission: 'finance',
        icon: 'mdi-government',
        formats: ['pdf', 'xlsx'],
        scheduleable: true
      }
    ]
  },
  {
    name: 'Accounting',
    icon: 'mdi-calculator',
    reports: [
      {
        name: 'Student Ledger',
        description: 'Detailed student financial ledger',
        permission: 'finance',
        icon: 'mdi-book-open-variant',
        formats: ['pdf', 'csv', 'xlsx'],
        scheduleable: true
      },
      {
        name: 'Transaction Detail',
        description: 'Complete transaction history and details',
        permission: 'finance',
        icon: 'mdi-receipt',
        formats: ['pdf', 'csv'],
        scheduleable: true
      },
      {
        name: 'Ledger Export',
        description: 'Export ledger data for external systems',
        permission: 'finance',
        icon: 'mdi-database-export',
        formats: ['csv', 'xlsx'],
        scheduleable: false
      }
    ]
  },
  {
    name: 'Placement',
    icon: 'mdi-briefcase',
    reports: [
      {
        name: 'Graduate Employment',
        description: 'Employment outcomes for graduates',
        permission: 'placement',
        icon: 'mdi-account-tie',
        formats: ['pdf', 'csv'],
        scheduleable: true
      },
      {
        name: 'Student Detail',
        description: 'Detailed placement information by student',
        permission: 'placement',
        icon: 'mdi-account-details-outline',
        formats: ['pdf', 'xlsx'],
        scheduleable: true
      }
    ]
  },
  {
    name: 'General',
    icon: 'mdi-cog',
    reports: [
      {
        name: 'User Activity',
        description: 'System usage and user activity logs',
        permission: 'admin',
        icon: 'mdi-account-clock',
        formats: ['pdf', 'csv'],
        scheduleable: true
      },
      {
        name: 'Duplicate Emails',
        description: 'Identify and manage duplicate email addresses',
        permission: 'admin',
        icon: 'mdi-email-alert',
        formats: ['csv'],
        scheduleable: false
      },
      {
        name: 'Document Generator',
        description: 'Generate custom documents and forms',
        permission: 'all',
        icon: 'mdi-file-plus',
        formats: ['pdf'],
        scheduleable: false
      }
    ]
  }
])

// Computed properties
const categoryOptions = computed(() => 
  categories.value.map(cat => ({ title: cat.name, value: cat.name }))
)

const filteredCategories = computed(() => {
  let filtered = categories.value

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(cat => cat.name === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.map(category => ({
      ...category,
      reports: category.reports.filter(report =>
        report.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })).filter(category => category.reports.length > 0)
  }

  return filtered
})

// Methods
function hasAccess(permission: string): boolean {
  return permission === 'all' || userRole.value === permission
}

function getFormatIcon(format: string): string {
  const icons: Record<string, string> = {
    pdf: 'mdi-file-pdf-box',
    csv: 'mdi-file-delimited',
    xlsx: 'mdi-file-excel'
  }
  return icons[format] || 'mdi-file'
}

function openReport(report: Report): void {
  if (report.route) {
    window.location.href = report.route
  } else {
    // Simulate report generation
    report.loading = true
    setTimeout(() => {
      report.loading = false
      alert(`Opening ${report.name}...`)
    }, 1000)
  }
}

function exportReport(report: Report, format: string): void {
  alert(`Exporting ${report.name} as ${format.toUpperCase()}...`)
}

function scheduleReport(report: Report): void {
  scheduleDialog.value = true
}

function confirmSchedule(): void {
  // Handle report scheduling
  alert('Report scheduled successfully!')
  scheduleDialog.value = false
  scheduleData.value = {
    frequency: 'Weekly',
    email: '',
    notes: ''
  }
}
</script>

<style scoped>
.report-category-card {
  border-left: 4px solid var(--v-primary-base);
}

.report-card {
  transition: all 0.3s ease;
  height: 100%;
}

.report-card:hover {
  transform: translateY(-2px);
}

.disabled-card {
  opacity: 0.6;
  pointer-events: none;
}

.gap-2 {
  gap: 8px;
}
</style> 