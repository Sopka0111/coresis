<template>
  <v-app>
    <!-- Header Bar -->
    <HeaderBar 
      @toggle-sidebar="toggleSidebar"
      @new-lead="handleNewLead"
      @help="handleHelp"
      @notification="handleNotification"
      @availability-change="handleAvailabilityChange"
      @profile="handleProfile"
      @settings="handleSettings"
      @logout="handleLogout"
    />
    
    <!-- Sidebar Navigation -->
    <SidebarNav 
      v-model="sidebarOpen"
      @navigation="handleNavigation"
      @logout="handleLogout"
    />
    
    <!-- Main Content Area -->
    <v-main class="pa-4">
      <!-- Router View for page content -->
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import SidebarNav from '@/components/SidebarNav.vue'

// Sidebar state
const sidebarOpen = ref(true)

// Methods
const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleNavigation = (href: string): void => {
  console.log('Navigation to:', href)
  // Add your navigation logic here
  // You can integrate with Vue Router or handle external links
}

const handleNewLead = (): void => {
  console.log('New Lead requested')
  // Add your new lead logic here
}

const handleHelp = (): void => {
  console.log('Help requested')
  // Add your help logic here
}

const handleNotification = (notification: any): void => {
  console.log('Notification clicked:', notification)
  // Add your notification handling logic here
}

const handleAvailabilityChange = (available: boolean): void => {
  console.log('Availability changed to:', available)
  // Add your availability change logic here
}

const handleProfile = (): void => {
  console.log('Profile requested')
  // Add your profile logic here
}

const handleSettings = (): void => {
  console.log('Settings requested')
  // Add your settings logic here
}

const handleLogout = (): void => {
  console.log('Logout requested')
  // Add your logout logic here
  // Example: redirect to logout page
  // window.location.href = '/logout'
}
</script>

<style scoped>
.v-main {
  padding-top: 64px; /* Account for app bar height */
  min-height: calc(100vh - 64px); /* Full height minus app bar */
}
</style> 