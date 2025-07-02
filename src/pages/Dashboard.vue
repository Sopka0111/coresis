<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="mb-6">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">
        Dashboard Overview
      </h1>
      <p class="text-h6 text-medium-emphasis">
        Welcome to your Trade School Student Information System
      </p>
    </div>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total Students"
          :value="stats.totalStudents"
          icon="mdi-account-group"
          color="primary"
          :change="8.2"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Active Programs"
          :value="stats.activePrograms"
          icon="mdi-school"
          color="wellness"
          :change="2.1"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Completion Rate"
          :value="stats.completionRate"
          unit="%"
          icon="mdi-certificate"
          color="success"
          :change="3.5"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Monthly Revenue"
          :value="stats.monthlyRevenue"
          unit="$"
          icon="mdi-chart-line"
          color="info"
          :change="12.8"
          :precision="0"
        />
      </v-col>
    </v-row>

    <!-- Main Content Grid -->
    <v-row>
      <!-- Left Column -->
      <v-col cols="12" lg="8">
        <!-- Enrollment Trends Chart -->
        <v-card class="mb-6" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-chart-line" color="primary" class="mr-3" />
            Enrollment Trends
          </v-card-title>
          <v-card-text>
            <canvas ref="enrollmentChart" height="100"></canvas>
          </v-card-text>
        </v-card>

        <!-- Recent Activities -->
        <ActivityCard 
          title="Recent Activities"
          :activities="recentActivities"
          @refresh="loadActivities"
          @activity-click="handleActivityClick"
          @view-all="viewAllActivities"
        />
      </v-col>

      <!-- Right Column -->
      <v-col cols="12" lg="4">
        <!-- Quick Actions -->
        <v-card class="mb-6" elevation="2">
          <v-card-title>
            <v-icon icon="mdi-lightning-bolt" color="primary" class="mr-3" />
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-btn
              v-for="action in quickActions"
              :key="action.title"
              :color="action.color"
              variant="outlined"
              block
              class="mb-3"
              @click="handleQuickAction(action)"
            >
              <v-icon :icon="action.icon" class="mr-2" />
              {{ action.title }}
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Upcoming Events -->
        <v-card class="mb-6" elevation="2">
          <v-card-title>
            <v-icon icon="mdi-calendar" color="primary" class="mr-3" />
            Upcoming Events
          </v-card-title>
          <v-list>
            <v-list-item
              v-for="event in upcomingEvents"
              :key="event.id"
            >
              <template #prepend>
                <v-avatar :color="event.color" size="32">
                  <v-icon :icon="event.icon" color="white" size="16" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ event.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ event.date }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- System Status -->
        <v-card elevation="2">
          <v-card-title>
            <v-icon icon="mdi-server" color="primary" class="mr-3" />
            System Status
          </v-card-title>
          <v-list>
            <v-list-item
              v-for="status in systemStatus"
              :key="status.name"
            >
              <template #prepend>
                <v-icon 
                  :icon="status.status === 'online' ? 'mdi-check-circle' : 'mdi-alert-circle'"
                  :color="status.status === 'online' ? 'success' : 'error'"
                />
              </template>
              <v-list-item-title>{{ status.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ status.description }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
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
import { Chart, registerables } from 'chart.js'

// Auth composable
const { userRole, canManageStudents, canManageFinance } = useAuth()

// Dashboard stats
const stats = ref({
  totalStudents: 156,
  activePrograms: 8,
  completionRate: 92,
  monthlyRevenue: 28500
})

// Recent activities data
const recentActivities = ref([
  {
    id: 1,
    title: 'New Student Enrollment',
    description: 'Sarah Johnson enrolled in Massage Therapy program',
    user: 'Admissions',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'enrollment',
    priority: 'medium',
    read: false
  },
  {
    id: 2,
    title: 'Payment Received',
    description: 'Tuition payment of $2,500 received from Michael Chen',
    user: 'Finance',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    type: 'payment',
    priority: 'low',
    read: true
  },
  {
    id: 3,
    title: 'Grade Submitted',
    description: 'Final grades submitted for Advanced Techniques course',
    user: 'Dr. Williams',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    type: 'grade',
    priority: 'medium',
    read: true
  }
])

// Quick actions
const quickActions = ref([
  {
    title: 'Add New Student',
    icon: 'mdi-account-plus',
    color: 'primary',
    action: 'add-student'
  },
  {
    title: 'Schedule Class',
    icon: 'mdi-calendar-plus',
    color: 'wellness',
    action: 'schedule-class'
  },
  {
    title: 'Send Announcement',
    icon: 'mdi-bullhorn',
    color: 'info',
    action: 'send-announcement'
  },
  {
    title: 'Generate Report',
    icon: 'mdi-file-chart',
    color: 'secondary',
    action: 'generate-report'
  }
])

// Upcoming events
const upcomingEvents = ref([
  {
    id: 1,
    title: 'Spring Semester Starts',
    date: 'January 15, 2024',
    icon: 'mdi-school',
    color: 'primary'
  },
  {
    id: 2,
    title: 'Faculty Meeting',
    date: 'January 20, 2024',
    icon: 'mdi-account-group',
    color: 'info'
  },
  {
    id: 3,
    title: 'Graduation Ceremony',
    date: 'March 15, 2024',
    icon: 'mdi-school-outline',
    color: 'success'
  }
])

// System status
const systemStatus = ref([
  {
    name: 'Student Database',
    status: 'online',
    description: 'All systems operational'
  },
  {
    name: 'Payment Gateway',
    status: 'online',
    description: 'Processing normally'
  },
  {
    name: 'Email Service',
    status: 'online',
    description: 'Sending notifications'
  }
])

// Chart reference
const enrollmentChart = ref(null)

// Methods
const loadActivities = () => {
  console.log('Refreshing activities...')
}

const handleActivityClick = (activity) => {
  console.log('Activity clicked:', activity)
  activity.read = true
}

const viewAllActivities = () => {
  console.log('View all activities')
}

const handleQuickAction = (action) => {
  console.log('Quick action:', action.action)
}

// Create enrollment chart
const createEnrollmentChart = () => {
  if (!enrollmentChart.value) return

  const ctx = enrollmentChart.value.getContext('2d')
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'New Enrollments',
        data: [12, 19, 15, 25, 22, 18],
        borderColor: '#8BC34A',
        backgroundColor: 'rgba(139, 195, 74, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  createEnrollmentChart()
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