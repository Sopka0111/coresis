<template>
  <div>
    <!-- Stats Cards Row -->
    <v-row>
      <v-col 
        v-for="card in statsCards" 
        :key="card.title"
        cols="12" 
        sm="6" 
        md="3"
      >
        <v-card 
          class="pa-4 h-100" 
          :color="card.color" 
          dark
          elevation="4"
          @click="handleCardClick(card)"
        >
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon left size="24">{{ card.icon }}</v-icon>
            {{ card.title }}
          </v-card-title>
          <v-card-text>
            <div class="text-h4 font-weight-bold mb-2">{{ card.value }}</div>
            <div class="text-subtitle-2 d-flex align-center">
              <v-icon 
                :color="card.trend === 'up' ? 'success' : 'error'"
                size="16"
                class="mr-1"
              >
                {{ card.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down' }}
              </v-icon>
              {{ card.change }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions Row -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col 
                v-for="action in quickActions" 
                :key="action.title"
                cols="12" 
                sm="6" 
                md="3"
              >
                <v-btn
                  block
                  :color="action.color"
                  variant="outlined"
                  size="large"
                  class="mb-2"
                  @click="handleQuickAction(action)"
                >
                  <v-icon left>{{ action.icon }}</v-icon>
                  {{ action.title }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity Row -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon left color="info">mdi-clock-outline</v-icon>
            Recent Activity
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar :color="activity.color" size="32">
                    <v-icon color="white" size="16">{{ activity.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ activity.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ activity.time }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon left color="success">mdi-calendar-check</v-icon>
            Upcoming Events
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item 
                v-for="event in upcomingEvents" 
                :key="event.id"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar :color="event.color" size="32">
                    <v-icon color="white" size="16">{{ event.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ event.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ event.date }} • {{ event.time }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Emits
const emit = defineEmits<{
  'card-click': [card: any]
  'quick-action': [action: any]
}>()

// Stats Cards Data
const statsCards = ref([
  {
    title: 'Total Students',
    value: '1,234',
    change: '+15% this month',
    trend: 'up',
    icon: 'mdi-account-group',
    color: 'primary'
  },
  {
    title: 'Active Courses',
    value: '24',
    change: '+3 new courses',
    trend: 'up',
    icon: 'mdi-book-open-variant',
    color: 'success'
  },
  {
    title: 'Revenue',
    value: '$45,678',
    change: '+12% from last month',
    trend: 'up',
    icon: 'mdi-currency-usd',
    color: 'warning'
  },
  {
    title: 'Completion Rate',
    value: '94%',
    change: '+2% improvement',
    trend: 'up',
    icon: 'mdi-chart-line',
    color: 'info'
  }
])

// Quick Actions Data
const quickActions = ref([
  {
    title: 'Add Student',
    icon: 'mdi-account-plus',
    color: 'primary'
  },
  {
    title: 'Create Course',
    icon: 'mdi-book-plus',
    color: 'success'
  },
  {
    title: 'Generate Report',
    icon: 'mdi-file-chart',
    color: 'warning'
  },
  {
    title: 'Send Notification',
    icon: 'mdi-bell-plus',
    color: 'info'
  }
])

// Recent Activities Data
const recentActivities = ref([
  {
    id: 1,
    title: 'New student registration: Sarah Johnson',
    time: '2 minutes ago',
    icon: 'mdi-account-plus',
    color: 'success'
  },
  {
    id: 2,
    title: 'Payment received: $1,200 from Mike Chen',
    time: '15 minutes ago',
    icon: 'mdi-currency-usd',
    color: 'primary'
  },
  {
    id: 3,
    title: 'Course completed: Massage Therapy 101',
    time: '1 hour ago',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    id: 4,
    title: 'New course created: Advanced Techniques',
    time: '2 hours ago',
    icon: 'mdi-book-plus',
    color: 'info'
  }
])

// Upcoming Events Data
const upcomingEvents = ref([
  {
    id: 1,
    title: 'Anatomy & Physiology Class',
    date: 'Today',
    time: '2:00 PM',
    icon: 'mdi-calendar',
    color: 'primary'
  },
  {
    id: 2,
    title: 'Student Orientation',
    date: 'Tomorrow',
    time: '10:00 AM',
    icon: 'mdi-account-group',
    color: 'success'
  },
  {
    id: 3,
    title: 'Faculty Meeting',
    date: 'Dec 15',
    time: '3:00 PM',
    icon: 'mdi-account-multiple',
    color: 'warning'
  },
  {
    id: 4,
    title: 'Graduation Ceremony',
    date: 'Dec 20',
    time: '6:00 PM',
    icon: 'mdi-school',
    color: 'info'
  }
])

// Methods
const handleCardClick = (card: any): void => {
  emit('card-click', card)
  console.log('Card clicked:', card.title)
}

const handleQuickAction = (action: any): void => {
  emit('quick-action', action)
  console.log('Quick action clicked:', action.title)
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.h-100 {
  height: 100%;
}
</style> 