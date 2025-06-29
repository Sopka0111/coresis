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
                Welcome back! Here's an overview of your massage school management system.
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
              <v-icon size="48" color="primary" class="mb-2">mdi-account-group</v-icon>
              <div class="text-h4 font-weight-bold text-primary">{{ stats.totalStudents }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Students</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="success" class="mb-2">mdi-account-check</v-icon>
              <div class="text-h4 font-weight-bold text-success">{{ stats.activeStudents }}</div>
              <div class="text-body-2 text-medium-emphasis">Active Students</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="warning" class="mb-2">mdi-clock-outline</v-icon>
              <div class="text-h4 font-weight-bold text-warning">{{ stats.pendingApprovals }}</div>
              <div class="text-body-2 text-medium-emphasis">Pending Approvals</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="info" class="mb-2">mdi-currency-usd</v-icon>
              <div class="text-h4 font-weight-bold text-info">${{ stats.totalRevenue.toLocaleString() }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Revenue</div>
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
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import RoleSelector from '@/components/RoleSelector.vue'
import BarChart from '@/components/BarChart.vue'
import ActivitiesCard from '@/components/ActivitiesCard.vue'
import AnnouncementsCard from '@/components/AnnouncementsCard.vue'
import TodoListCard from '@/components/TodoListCard.vue'
import NotificationsCard from '@/components/NotificationsCard.vue'
import DocumentsCard from '@/components/DocumentsCard.vue'

// Auth composable
const { userRole, canManageStudents, canManageFinance } = useAuth()

// Dashboard stats
const stats = ref({
  totalStudents: 156,
  activeStudents: 142,
  pendingApprovals: 8,
  totalRevenue: 245000
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

// Initialize with default role
onMounted(() => {
  // Set default role to admin for demo
  if (!userRole.value) {
    // This would be handled by the auth composable
  }
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