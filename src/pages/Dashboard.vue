<template>
  <div class="dashboard">
    <v-container fluid>
      <!-- Role Selector for Demo -->
      <RoleSelector />
      
      <!-- Dashboard Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <div>
              <h1 class="text-h3 font-weight-bold text-primary">
                Dashboard
              </h1>
              <p class="text-body-1 text-medium-emphasis mt-2">
                Welcome back, {{ user?.firstName }}! Here's your CRM overview.
              </p>
            </div>
            <div class="d-flex align-center gap-2">
              <v-chip 
                :color="getRoleColor(userRole)" 
                size="large"
                class="font-weight-medium"
              >
                <v-icon left>{{ getRoleIcon(userRole) }}</v-icon>
                {{ getRoleLabel(userRole) }}
              </v-chip>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Quick Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="primary" class="mb-2">mdi-account-plus</v-icon>
              <div class="text-h4 font-weight-bold text-primary">{{ stats.leads?.total || 0 }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Leads</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="secondary" class="mb-2">mdi-handshake</v-icon>
              <div class="text-h4 font-weight-bold text-secondary">{{ stats.pipeline?.total || 0 }}</div>
              <div class="text-body-2 text-medium-emphasis">Active Deals</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="success" class="mb-2">mdi-currency-usd</v-icon>
              <div class="text-h4 font-weight-bold text-success">${{ formatCurrency(stats.pipeline?.weightedValue || 0) }}</div>
              <div class="text-body-2 text-medium-emphasis">Pipeline Value</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="warning" class="mb-2">mdi-target</v-icon>
              <div class="text-h4 font-weight-bold text-warning">{{ conversionRate }}%</div>
              <div class="text-body-2 text-medium-emphasis">Conversion Rate</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Content Grid -->
      <v-row>
        <!-- Left Column -->
        <v-col cols="12" lg="8">
          <!-- Sales Chart -->
          <v-row class="mb-6">
            <v-col cols="12">
              <BarChart />
            </v-col>
          </v-row>

          <!-- Recent Activities -->
          <v-row class="mb-6">
            <v-col cols="12">
              <ActivitiesCard />
            </v-col>
          </v-row>

          <!-- Student Management Section (Role-based) -->
          <v-row v-if="canManageStudents">
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span class="text-h6">
                    <v-icon left color="primary">mdi-account-group</v-icon>
                    Student Management
                  </span>
                  <v-btn 
                    color="primary" 
                    variant="outlined"
                    @click="navigateToStudents"
                  >
                    View All Students
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <p class="text-body-2 text-medium-emphasis">
                    Manage student registrations, view details, and track progress.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Finance Section (Role-based) -->
          <v-row v-if="canManageFinance" class="mt-6">
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span class="text-h6">
                    <v-icon left color="primary">mdi-calculator</v-icon>
                    Financial Management
                  </span>
                  <v-btn 
                    color="primary" 
                    variant="outlined"
                    @click="navigateToFinance"
                  >
                    View Financial Data
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <p class="text-body-2 text-medium-emphasis">
                    Access financial reports, manage payments, and generate invoices.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" lg="4">
          <!-- Announcements -->
          <v-row class="mb-6">
            <v-col cols="12">
              <AnnouncementsCard />
            </v-col>
          </v-row>

          <!-- Todo List -->
          <v-row class="mb-6">
            <v-col cols="12">
              <TodoListCard />
            </v-col>
          </v-row>

          <!-- Notifications -->
          <v-row class="mb-6">
            <v-col cols="12">
              <NotificationsCard />
            </v-col>
          </v-row>

          <!-- Documents -->
          <v-row>
            <v-col cols="12">
              <DocumentsCard />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useCrmStore } from '@/stores/crm'
import { storeToRefs } from 'pinia'
import RoleSelector from '@/components/RoleSelector.vue'
import BarChart from '@/components/BarChart.vue'
import ActivitiesCard from '@/components/ActivitiesCard.vue'
import AnnouncementsCard from '@/components/AnnouncementsCard.vue'
import TodoListCard from '@/components/TodoListCard.vue'
import NotificationsCard from '@/components/NotificationsCard.vue'
import DocumentsCard from '@/components/DocumentsCard.vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const { userRole, canManageStudents, canManageFinance } = useAuth()
const crmStore = useCrmStore()
const { user, stats, pageLoading } = storeToRefs(crmStore)

// Chart refs
const pipelineChart = ref(null)
const leadSourceChart = ref(null)

// Chart instances
let pipelineChartInstance = null
let leadSourceChartInstance = null

// Mock data for demo purposes
const recentActivities = ref([
  {
    id: 1,
    type: 'Call',
    title: 'Called Springfield School District',
    description: 'Discussed transportation needs for next school year',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 2,
    type: 'Email',
    title: 'Sent proposal to Jefferson Elementary',
    description: 'Forwarded detailed proposal for special needs transportation',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: 3,
    type: 'Meeting',
    title: 'Demo scheduled with Madison County',
    description: 'Set up GPS tracking system demonstration',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    id: 4,
    type: 'Note',
    title: 'Lead updated',
    description: 'Updated Lincoln Elementary lead status to qualified',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  }
])

const tasksDueToday = ref([
  {
    id: 1,
    title: 'Follow up with Central High School',
    description: 'Check on decision timeline for new route proposal',
    priority: 'High',
    status: 'Not Started'
  },
  {
    id: 2,
    title: 'Send contract to Riverside District',
    description: 'Final contract for athletic transportation services',
    priority: 'Medium',
    status: 'In Progress'
  },
  {
    id: 3,
    title: 'Prepare demo for Valley Schools',
    description: 'Set up GPS tracking demonstration materials',
    priority: 'Normal',
    status: 'Not Started'
  }
])

// Computed properties
const conversionRate = computed(() => {
  const totalLeads = stats.value.leads?.total || 0
  const convertedLeads = stats.value.leads?.byStatus?.['Closed Won']?.count || 0
  return totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
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

// Navigation functions
const navigateToStudents = () => {
  // In a real app, this would use Vue Router
  console.log('Navigate to students page')
}

const navigateToFinance = () => {
  // In a real app, this would use Vue Router
  console.log('Navigate to finance page')
}

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getActivityColor = (type) => {
  const colors = {
    Call: 'primary',
    Email: 'secondary',
    Meeting: 'success',
    Note: 'info',
    Demo: 'warning',
    Follow: 'primary'
  }
  return colors[type] || 'grey'
}

const getActivityIcon = (type) => {
  const icons = {
    Call: 'mdi-phone',
    Email: 'mdi-email',
    Meeting: 'mdi-calendar',
    Note: 'mdi-note',
    Demo: 'mdi-presentation',
    Follow: 'mdi-account-arrow-right'
  }
  return icons[type] || 'mdi-information'
}

const getPriorityColor = (priority) => {
  const colors = {
    Low: 'success',
    Normal: 'info',
    Medium: 'warning',
    High: 'error',
    Urgent: 'error'
  }
  return colors[priority] || 'grey'
}

const toggleTaskComplete = (task) => {
  task.status = task.status === 'Completed' ? 'Not Started' : 'Completed'
  // Here you would normally call an API to update the task
}

const refreshDashboard = async () => {
  await crmStore.fetchDashboardData()
  await nextTick()
  updateCharts()
}

const createPipelineChart = () => {
  if (!pipelineChart.value) return

  const ctx = pipelineChart.value.getContext('2d')
  
  // Sample pipeline data
  const pipelineData = {
    labels: ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Decision'],
    datasets: [{
      label: 'Deal Count',
      data: [12, 8, 6, 4, 3, 2],
      backgroundColor: [
        '#E3F2FD',
        '#F3E5F5',
        '#E0F2F1',
        '#FFF3E0',
        '#FCE4EC',
        '#F1F8E9'
      ],
      borderColor: [
        '#2196F3',
        '#9C27B0',
        '#009688',
        '#FF9800',
        '#E91E63',
        '#8BC34A'
      ],
      borderWidth: 2
    }]
  }

  pipelineChartInstance = new Chart(ctx, {
    type: 'bar',
    data: pipelineData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            afterLabel: (context) => {
              const values = [250000, 180000, 120000, 85000, 65000, 45000]
              return `Value: $${values[context.dataIndex].toLocaleString()}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 2
          }
        }
      }
    }
  })
}

const createLeadSourceChart = () => {
  if (!leadSourceChart.value) return

  const ctx = leadSourceChart.value.getContext('2d')
  
  const leadSourceData = {
    labels: ['Website', 'Referral', 'Trade Show', 'Cold Outreach', 'Advertisement'],
    datasets: [{
      data: [30, 25, 20, 15, 10],
      backgroundColor: [
        '#4CAF50',
        '#2196F3',
        '#FF9800',
        '#9C27B0',
        '#F44336'
      ],
      borderWidth: 0
    }]
  }

  leadSourceChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: leadSourceData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  })
}

const updateCharts = () => {
  if (pipelineChartInstance) {
    pipelineChartInstance.destroy()
  }
  if (leadSourceChartInstance) {
    leadSourceChartInstance.destroy()
  }
  
  nextTick(() => {
    createPipelineChart()
    createLeadSourceChart()
  })
}

onMounted(async () => {
  await crmStore.fetchDashboardData()
  await nextTick()
  createPipelineChart()
  createLeadSourceChart()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.v-card {
  border-radius: 12px;
}
</style> 