<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      color="primary"
      prominent
      dark
      flat
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      
      <v-toolbar-title class="text-h5 font-weight-bold">
        🌿 Trade School SIS
      </v-toolbar-title>

      <v-spacer />

      <!-- Role Selector -->
      <v-select
        v-model="currentRole"
        :items="roles"
        variant="outlined"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-account"
        class="mr-4"
        style="max-width: 200px;"
        @update:model-value="handleRoleChange"
      />

      <!-- User Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="36">
              <v-img src="https://randomuser.me/api/portraits/men/1.jpg" />
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
            <template #prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      color="wellness-light"
      permanent
      :width="280"
    >
      <!-- User Profile Section -->
      <v-list-item class="pa-4">
        <template #prepend>
          <v-avatar size="56">
            <v-img src="https://randomuser.me/api/portraits/men/1.jpg" />
          </v-avatar>
        </template>
        <v-list-item-title class="text-h6">Admin User</v-list-item-title>
        <v-list-item-subtitle>{{ currentRole }}</v-list-item-subtitle>
      </v-list-item>

      <v-divider class="mb-2" />

      <!-- Navigation Menu -->
      <v-list density="compact">
        <v-list-item
          v-for="item in filteredNavigation"
          :key="item.title"
          :active="currentPage === item.page"
          @click="navigateTo(item.page)"
          class="mb-1"
        >
          <template #prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <!-- Dashboard -->
        <Dashboard v-if="currentPage === 'dashboard'" />
        
        <!-- Student Portal -->
        <StudentPortal v-else-if="currentPage === 'student-portal'" />
        
        <!-- Admissions -->
        <AdmissionsPage v-else-if="currentPage === 'admissions'" />
        
        <!-- Academic Records -->
        <AcademicRecords v-else-if="currentPage === 'academic'" />
        
        <!-- Scheduling -->
        <SchedulingPage v-else-if="currentPage === 'scheduling'" />
        
        <!-- Communications -->
        <CommunicationsPage v-else-if="currentPage === 'communications'" />
        
        <!-- Financial Management -->
        <FinancialPage v-else-if="currentPage === 'financial'" />
        
        <!-- Documents -->
        <DocumentsPage v-else-if="currentPage === 'documents'" />
        
        <!-- Compliance Reports -->
        <CompliancePage v-else-if="currentPage === 'compliance'" />
        
        <!-- Default Dashboard -->
        <Dashboard v-else />
      </v-container>
    </v-main>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarMessage }}
      <template #actions>
        <v-btn color="white" text @click="showSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Import components
import Dashboard from '@/pages/Dashboard.vue'
import StudentPortal from '@/pages/StudentPortal.vue'
import AdmissionsPage from '@/pages/AdmissionsPage.vue'
import AcademicRecords from '@/pages/AcademicRecords.vue'
import SchedulingPage from '@/pages/SchedulingPage.vue'
import CommunicationsPage from '@/pages/CommunicationsPage.vue'
import FinancialPage from '@/pages/FinancialPage.vue'
import DocumentsPage from '@/pages/DocumentsPage.vue'
import CompliancePage from '@/pages/CompliancePage.vue'

// Composables
const { userRole, setUserRole } = useAuth()

// Reactive data
const drawer = ref(true)
const currentPage = ref('dashboard')
const currentRole = ref(userRole.value)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Available roles
const roles = [
  'Administrator',
  'Registrar',
  'Finance',
  'Instructor',
  'Student'
]

// Navigation items
const navigation = [
  {
    title: 'Dashboard',
    icon: 'mdi-speedometer',
    page: 'dashboard',
    roles: ['Administrator', 'Registrar', 'Finance', 'Instructor']
  },
  {
    title: 'Student Portal',
    icon: 'mdi-account-school',
    page: 'student-portal',
    roles: ['Student', 'Administrator']
  },
  {
    title: 'Admissions & Leads',
    icon: 'mdi-account-plus',
    page: 'admissions',
    roles: ['Administrator', 'Registrar']
  },
  {
    title: 'Academic Records',
    icon: 'mdi-school',
    page: 'academic',
    roles: ['Administrator', 'Registrar', 'Instructor']
  },
  {
    title: 'Class Scheduling',
    icon: 'mdi-calendar',
    page: 'scheduling',
    roles: ['Administrator', 'Registrar', 'Instructor']
  },
  {
    title: 'Communications',
    icon: 'mdi-bullhorn',
    page: 'communications',
    roles: ['Administrator', 'Registrar']
  },
  {
    title: 'Financial Management',
    icon: 'mdi-currency-usd',
    page: 'financial',
    roles: ['Administrator', 'Finance']
  },
  {
    title: 'Document Center',
    icon: 'mdi-file-document',
    page: 'documents',
    roles: ['Administrator', 'Registrar', 'Student']
  },
  {
    title: 'Compliance Reports',
    icon: 'mdi-chart-bar',
    page: 'compliance',
    roles: ['Administrator', 'Registrar']
  }
]

// Computed properties
const filteredNavigation = computed(() => {
  return navigation.filter(item => item.roles.includes(currentRole.value))
})

// Methods
const navigateTo = (page) => {
  currentPage.value = page
  showNotification(`Navigated to ${page}`, 'info')
}

const handleRoleChange = (newRole) => {
  setUserRole(newRole)
  currentRole.value = newRole
  showNotification(`Role changed to ${newRole}`, 'success')
  
  // If switching to student role, go to student portal
  if (newRole === 'Student') {
    currentPage.value = 'student-portal'
  } else if (currentPage.value === 'student-portal' && newRole !== 'Student') {
    currentPage.value = 'dashboard'
  }
}

const logout = () => {
  showNotification('Logged out successfully', 'warning')
}

const showNotification = (message, color = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}
</script>

<style>
/* Global styles */
.v-application {
  font-family: 'Roboto', sans-serif;
  background-color: #F1F8E9;
}

.v-navigation-drawer {
  background: linear-gradient(180deg, #DCEDC8 0%, #F1F8E9 100%);
}

.v-list-item--active {
  background-color: rgba(139, 195, 74, 0.2) !important;
  border-right: 4px solid #8BC34A;
}

.v-list-item:hover {
  background-color: rgba(139, 195, 74, 0.1) !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #8BC34A;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #689F38;
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