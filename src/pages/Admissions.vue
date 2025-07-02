<template>
  <MainLayout>
    <template #content>
      <!-- Page Header -->
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 mb-6 text-center">Admissions Management</h1>
        </v-col>
      </v-row>
      
      <!-- Stats Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="primary" dark>
            <v-card-title class="text-h6">
              <v-icon left>mdi-account-plus</v-icon>
              New Applications
            </v-card-title>
            <v-card-text>
              <div class="text-h4">24</div>
              <div class="text-subtitle-2">+5 this week</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="success" dark>
            <v-card-title class="text-h6">
              <v-icon left>mdi-check-circle</v-icon>
              Approved
            </v-card-title>
            <v-card-text>
              <div class="text-h4">18</div>
              <div class="text-subtitle-2">75% approval rate</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="warning" dark>
            <v-card-title class="text-h6">
              <v-icon left>mdi-clock</v-icon>
              Pending Review
            </v-card-title>
            <v-card-text>
              <div class="text-h4">6</div>
              <div class="text-subtitle-2">Awaiting decision</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="info" dark>
            <v-card-title class="text-h6">
              <v-icon left>mdi-calendar</v-icon>
              Interviews
            </v-card-title>
            <v-card-text>
              <div class="text-h4">12</div>
              <div class="text-subtitle-2">Scheduled this week</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Application List -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              Recent Applications
              <v-btn color="primary" @click="addNewApplication">
                <v-icon left>mdi-plus</v-icon>
                New Application
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="applications"
                :items-per-page="10"
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="getStatusColor(item.status)"
                    :text-color="getStatusTextColor(item.status)"
                    small
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon
                    small
                    color="primary"
                    @click="viewApplication(item)"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    color="success"
                    @click="approveApplication(item)"
                  >
                    <v-icon>mdi-check</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    color="error"
                    @click="rejectApplication(item)"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Quick Actions -->
      <v-row class="mt-6">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item @click="scheduleInterview">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-calendar-plus</v-icon>
                  </template>
                  <v-list-item-title>Schedule Interview</v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="sendFollowUp">
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>Send Follow-up Email</v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="generateReport">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-file-chart</v-icon>
                  </template>
                  <v-list-item-title>Generate Report</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Recent Activity</v-card-title>
            <v-card-text>
              <v-timeline>
                <v-timeline-item
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  :color="activity.color"
                  :icon="activity.icon"
                  small
                >
                  <v-card>
                    <v-card-title class="text-h6">{{ activity.title }}</v-card-title>
                    <v-card-text>{{ activity.description }}</v-card-text>
                    <v-card-text class="text-caption">{{ activity.time }}</v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// MainLayout is globally available!

// Table headers
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Program', key: 'program' },
  { title: 'Status', key: 'status' },
  { title: 'Applied Date', key: 'appliedDate' },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Sample applications data
const applications = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    program: 'Massage Therapy',
    status: 'Pending',
    appliedDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '(555) 234-5678',
    program: 'Deep Tissue',
    status: 'Approved',
    appliedDate: '2024-01-14'
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '(555) 345-6789',
    program: 'Swedish Massage',
    status: 'Interview Scheduled',
    appliedDate: '2024-01-13'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '(555) 456-7890',
    program: 'Sports Massage',
    status: 'Rejected',
    appliedDate: '2024-01-12'
  }
])

// Recent activity data
const recentActivity = ref([
  {
    id: 1,
    title: 'Application Approved',
    description: 'Sarah Johnson\'s application for Massage Therapy was approved',
    time: '2 hours ago',
    color: 'success',
    icon: 'mdi-check-circle'
  },
  {
    id: 2,
    title: 'Interview Scheduled',
    description: 'Interview scheduled with Mike Chen for tomorrow at 2 PM',
    time: '4 hours ago',
    color: 'info',
    icon: 'mdi-calendar'
  },
  {
    id: 3,
    title: 'New Application',
    description: 'Emily Davis submitted a new application for Swedish Massage',
    time: '6 hours ago',
    color: 'primary',
    icon: 'mdi-account-plus'
  }
])

// Methods
const getStatusColor = (status: string): string => {
  const colors = {
    'Pending': 'warning',
    'Approved': 'success',
    'Rejected': 'error',
    'Interview Scheduled': 'info'
  }
  return colors[status] || 'grey'
}

const getStatusTextColor = (status: string): string => {
  return status === 'Pending' ? 'white' : 'white'
}

const addNewApplication = (): void => {
  console.log('Add new application')
}

const viewApplication = (item: any): void => {
  console.log('View application:', item)
}

const approveApplication = (item: any): void => {
  console.log('Approve application:', item)
}

const rejectApplication = (item: any): void => {
  console.log('Reject application:', item)
}

const scheduleInterview = (): void => {
  console.log('Schedule interview')
}

const sendFollowUp = (): void => {
  console.log('Send follow-up email')
}

const generateReport = (): void => {
  console.log('Generate report')
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.v-timeline-item {
  margin-bottom: 16px;
}
</style> 