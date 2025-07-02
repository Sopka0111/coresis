<template>
  <v-app>
    <!-- App Bar -->
    <AppBar 
      @toggle-drawer="toggleDrawer"
      @logout="handleLogout"
    />

    <!-- Navigation Drawer -->
    <NavigationDrawer 
      v-model="drawer"
      @navigation="handleNavigation"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-0">
        <!-- Role Selector -->
        <RoleSelector 
          v-model="currentRole"
          @role-change="handleRoleChange"
          class="ma-4"
        />

        <!-- Page Content -->
        <div class="pa-4">
          <!-- Dashboard -->
          <Dashboard v-if="currentPage === 'dashboard'" />
          
          <!-- Admissions -->
          <Admissions v-else-if="currentPage === 'admissions'" />
          
          <!-- Registrar -->
          <RegistrarPage v-else-if="currentPage === 'registrar'" />
          
          <!-- Finance -->
          <FinancePage v-else-if="currentPage === 'finance'" />
          
          <!-- Accounting -->
          <AccountingPage v-else-if="currentPage === 'accounting'" />
          
          <!-- Placement -->
          <PlacementPage v-else-if="currentPage === 'placement'" />
          
          <!-- Reports -->
          <ReportsPage v-else-if="currentPage === 'reports'" />
          
          <!-- Management -->
          <ManagementPage v-else-if="currentPage === 'management'" />
          
          <!-- Setup -->
          <SetupPage v-else-if="currentPage === 'setup'" />
          
          <!-- Student Management -->
          <StudentManagement v-else-if="currentPage === 'student-management'" />
          
          <!-- Default Dashboard -->
          <Dashboard v-else />
        </div>
      </v-container>
    </v-main>

    <!-- Global Snackbar for notifications -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarMessage }}
      
      <template #actions>
        <v-btn
          color="white"
          text
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth, type UserRole } from '@/composables/useAuth'

// Import components
import AppBar from '@/components/AppBar.vue'
import NavigationDrawer from '@/components/NavigationDrawer.vue'
import RoleSelector from '@/components/RoleSelector.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Admissions from '@/pages/Admissions.vue'
import RegistrarPage from '@/pages/RegistrarPage.vue'
import FinancePage from '@/pages/FinancePage.vue'
import AccountingPage from '@/pages/AccountingPage.vue'
import PlacementPage from '@/pages/PlacementPage.vue'
import ReportsPage from '@/pages/ReportsPage.vue'
import ManagementPage from '@/pages/ManagementPage.vue'
import SetupPage from '@/pages/SetupPage.vue'
import StudentManagement from '@/pages/StudentManagement.vue'

// Composables
const { userRole, setUserRole } = useAuth()

// Reactive data
const drawer = ref(true)
const currentPage = ref('dashboard')
const currentRole = ref(userRole.value)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Methods
const toggleDrawer = (): void => {
  drawer.value = !drawer.value
}

const handleNavigation = (href: string): void => {
  // Map navigation hrefs to page components
  const pageMap: Record<string, string> = {
    'dashboard': 'dashboard',
    'admissions': 'admissions',
    'registrar': 'registrar',
    'finance': 'finance',
    'accounting': 'accounting',
    'placement': 'placement',
    'reports': 'reports',
    'management': 'management',
    'setup': 'setup',
    'student-management': 'student-management'
  }
  
  const newPage = pageMap[href]
  if (newPage) {
    currentPage.value = newPage
    showNotification(`Navigated to ${href}`, 'info')
  }
}

const handleRoleChange = (newRole: UserRole): void => {
  setUserRole(newRole)
  currentRole.value = newRole
  showNotification(`Role changed to ${newRole}`, 'success')
}

const handleLogout = (): void => {
  showNotification('Logging out...', 'warning')
  // Add your logout logic here
  setTimeout(() => {
    showNotification('Logged out successfully', 'success')
  }, 1000)
}

const showNotification = (message: string, color: string = 'success'): void => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Lifecycle
onMounted(() => {
  showNotification('Welcome to Massage School Management Dashboard!', 'success')
})
</script>

<style>
/* Global styles */
.v-application {
  font-family: 'Roboto', sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Smooth transitions */
.v-card {
  transition: all 0.3s ease;
}

.v-btn {
  transition: all 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-container {
    padding: 8px !important;
  }
}
</style> 