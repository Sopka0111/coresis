<template>
  <v-app-bar app color="primary" dark elevation="2">
    <!-- Sidebar Toggle -->
    <v-app-bar-nav-icon 
      @click="toggleSidebar"
      class="mr-2"
    />
    
    <!-- Logo and Title -->
    <v-app-bar-title class="d-flex align-center">
      <v-icon class="mr-2" size="32">mdi-school</v-icon>
      <span class="text-h6 font-weight-bold">Center for Natural Wellness</span>
      <span class="text-subtitle-2 ml-2">School of Massage</span>
    </v-app-bar-title>

    <v-spacer />

    <!-- Action Buttons -->
    <v-btn 
      color="white" 
      variant="outlined" 
      class="mr-2"
      @click="handleNewLead"
    >
      <v-icon left>mdi-plus</v-icon>
      New Lead
    </v-btn>

    <v-btn 
      color="white" 
      variant="outlined" 
      class="mr-2"
      @click="handleHelp"
    >
      <v-icon left>mdi-help-circle</v-icon>
      Help
    </v-btn>

    <!-- Notifications -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          class="mr-2"
        >
          <v-badge 
            :content="notificationCount" 
            :model-value="notificationCount > 0"
            color="error"
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>
      
      <v-list>
        <v-list-item 
          v-for="notification in notifications" 
          :key="notification.id"
          @click="handleNotification(notification)"
        >
          <v-list-item-title>{{ notification.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
        </v-list-item>
        
        <v-divider />
        
        <v-list-item @click="viewAllNotifications">
          <v-list-item-title>View All Notifications</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Availability Toggle -->
    <v-switch
      v-model="isAvailable"
      color="success"
      hide-details
      class="mr-4"
      @change="handleAvailabilityChange"
    >
      <template v-slot:label>
        <span class="text-caption">Available</span>
      </template>
    </v-switch>

    <!-- User Menu -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
        >
          <v-avatar size="32">
            <v-img src="https://randomuser.me/api/portraits/men/1.jpg" />
          </v-avatar>
        </v-btn>
      </template>
      
      <v-list>
        <v-list-item @click="handleProfile">
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="handleSettings">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
        
        <v-divider />
        
        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Emits
const emit = defineEmits<{
  'toggle-sidebar': []
  'new-lead': []
  'help': []
  'notification': [notification: any]
  'availability-change': [available: boolean]
  'profile': []
  'settings': []
  'logout': []
}>()

// Reactive data
const isAvailable = ref(true)
const notificationCount = ref(3)

// Sample notifications
const notifications = ref([
  {
    id: 1,
    title: 'New Student Registration',
    message: 'Sarah Johnson has registered for Massage Therapy course'
  },
  {
    id: 2,
    title: 'Payment Received',
    message: 'Payment of $1,200 received from Mike Chen'
  },
  {
    id: 3,
    title: 'Class Reminder',
    message: 'Anatomy & Physiology class starts in 30 minutes'
  }
])

// Methods
const toggleSidebar = (): void => {
  emit('toggle-sidebar')
}

const handleNewLead = (): void => {
  emit('new-lead')
  console.log('New Lead button clicked')
}

const handleHelp = (): void => {
  emit('help')
  console.log('Help button clicked')
}

const handleNotification = (notification: any): void => {
  emit('notification', notification)
  console.log('Notification clicked:', notification)
}

const viewAllNotifications = (): void => {
  console.log('View all notifications')
}

const handleAvailabilityChange = (): void => {
  emit('availability-change', isAvailable.value)
  console.log('Availability changed to:', isAvailable.value)
}

const handleProfile = (): void => {
  emit('profile')
  console.log('Profile button clicked')
}

const handleSettings = (): void => {
  emit('settings')
  console.log('Settings button clicked')
}

const handleLogout = (): void => {
  emit('logout')
  console.log('Logout button clicked')
}
</script>

<style scoped>
.v-app-bar {
  z-index: 1000;
}

.v-switch {
  margin-top: 0;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style> 