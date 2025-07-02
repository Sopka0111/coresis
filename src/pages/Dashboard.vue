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
          <StatCard
            label="Total Students"
            :value="stats.totalStudents"
            icon="mdi-account-group"
            color="primary"
            :change="8.2"
            :chart-data="[120, 135, 140, 145, 150, 156]"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Active Students"
            :value="stats.activeStudents"
            icon="mdi-account-check"
            color="wellness"
            :change="5.4"
            :progress="(stats.activeStudents / stats.totalStudents) * 100"
            show-progress
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Completion Rate"
            :value="stats.completionRate"
            unit="%"
            icon="mdi-certificate"
            color="success"
            :change="2.1"
            :chart-data="[85, 87, 89, 88, 90, 92]"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Monthly Revenue"
            :value="stats.monthlyRevenue"
            unit="$"
            icon="mdi-chart-line"
            color="info"
            :change="12.5"
            :precision="0"
            :chart-data="[15000, 18000, 22000, 19000, 25000, 28000]"
          />
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
              <ActivityCard 
                title="Recent Activity Feed"
                :activities="recentActivities"
                @refresh="loadRecentActivities"
                @activity-click="handleActivityClick"
                @view-all="viewAllActivities"
              />
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
import StatCard from '@/components/StatCard.vue'
import BarChart from '@/components/BarChart.vue'
import ActivityCard from '@/components/ActivityCard.vue'
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
  completionRate: 92,
  monthlyRevenue: 28000,
  pendingApprovals: 8,
  totalRevenue: 245000
})

// Recent activities data
const recentActivities = ref([
  {
    id: 1,
    title: 'New Student Enrollment',
    description: 'Sarah Johnson enrolled in Massage Therapy Certification program',
    user: 'Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: 'enrollment',
    priority: 'medium',
    read: false,
    tags: ['enrollment', 'new-student']
  },
  {
    id: 2,
    title: 'Payment Received',
    description: 'Tuition payment of $2,000 received from Michael Chen',
    user: 'Finance Dept',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: 'payment',
    priority: 'low',
    read: true,
    tags: ['payment', 'tuition']
  },
  {
    id: 3,
    title: 'Grade Submitted',
    description: 'Final grades submitted for Advanced Swedish Massage course',
    user: 'Dr. Williams',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    type: 'grade',
    priority: 'medium',
    read: true,
    tags: ['grades', 'course-completion']
  },
  {
    id: 4,
    title: 'Document Upload',
    description: 'Student transcript uploaded to Alex Rodriguez\'s profile',
    user: 'Registrar',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    type: 'document',
    priority: 'low',
    read: true,
    tags: ['documents', 'transcript']
  },
  {
    id: 5,
    title: 'Attendance Alert',
    description: 'Low attendance alert for 3 students in Anatomy & Physiology',
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    type: 'attendance',
    priority: 'high',
    read: false,
    tags: ['attendance', 'alert']
  }
])

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

// Activity methods
const loadRecentActivities = () => {
  console.log('Refreshing activities...')
  // In a real app, this would fetch from API
}

const handleActivityClick = (activity: any) => {
  console.log('Activity clicked:', activity)
  // Mark as read and navigate to detail
  activity.read = true
}

const viewAllActivities = () => {
  console.log('View all activities')
  // Navigate to activities page
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
  background-color: #F1F8E9; /* Wellness background color */
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

/* Wellness theme enhancements */
.text-primary {
  color: #8BC34A !important;
}
</style> 