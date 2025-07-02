<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      color="primary"
      theme="dark"
    >
      <v-list-item
        prepend-avatar="/logo.png"
        :title="user?.fullName || 'CRM User'"
        :subtitle="user?.role || 'User'"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
            size="small"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <!-- Dashboard -->
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          to="/dashboard"
        ></v-list-item>

        <!-- Leads -->
        <v-list-item
          prepend-icon="mdi-account-plus"
          title="Leads"
          value="leads"
          to="/leads"
        ></v-list-item>

        <!-- Accounts -->
        <v-list-item
          prepend-icon="mdi-domain"
          title="Accounts"
          value="accounts"
          to="/accounts"
        ></v-list-item>

        <!-- Contacts -->
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Contacts"
          value="contacts"
          to="/contacts"
        ></v-list-item>

        <!-- Deals -->
        <v-list-item
          prepend-icon="mdi-handshake"
          title="Deals"
          value="deals"
          to="/deals"
        ></v-list-item>

        <!-- Tasks -->
        <v-list-item
          prepend-icon="mdi-checkbox-marked-circle"
          title="Tasks"
          value="tasks"
          to="/tasks"
        ></v-list-item>

        <!-- Activities -->
        <v-list-item
          prepend-icon="mdi-timeline"
          title="Activities"
          value="activities"
          to="/activities"
        ></v-list-item>

        <!-- Reports -->
        <v-list-item
          prepend-icon="mdi-chart-box"
          title="Reports"
          value="reports"
          to="/reports"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Settings (Admin only) -->
        <v-list-item
          v-if="user?.role === 'Admin'"
          prepend-icon="mdi-cog"
          title="Settings"
          value="settings"
          to="/settings"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar elevation="1" color="white">
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="d-lg-none"
      ></v-app-bar-nav-icon>
      
      <v-app-bar-title class="text-primary font-weight-bold">
        School Transportation CRM
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Search -->
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Search..."
        variant="outlined"
        density="compact"
        hide-details
        class="mr-4"
        style="max-width: 300px"
        @keyup.enter="performSearch"
      ></v-text-field>

      <!-- Notifications -->
      <v-btn icon @click="showNotifications = !showNotifications">
        <v-badge
          :content="notificationCount"
          :model-value="notificationCount > 0"
          color="error"
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="32">
              <v-img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.fullName"
              ></v-img>
              <v-icon v-else>mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item to="/profile">
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>

    <!-- Notifications Sidebar -->
    <v-navigation-drawer
      v-model="showNotifications"
      location="right"
      temporary
      width="400"
    >
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Notifications</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="showNotifications = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-list>
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          class="border-b"
        >
          <template v-slot:prepend>
            <v-icon :color="notification.type">
              {{ getNotificationIcon(notification.type) }}
            </v-icon>
          </template>
          <v-list-item-title>{{ notification.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
          <v-list-item-subtitle class="text-caption">
            {{ formatTime(notification.createdAt) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- Snackbar for Messages -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCrmStore } from '@/stores/crm'
import { storeToRefs } from 'pinia'

const router = useRouter()
const crmStore = useCrmStore()
const { user, loading, snackbar } = storeToRefs(crmStore)

// Navigation state
const drawer = ref(true)
const rail = ref(false)
const showNotifications = ref(false)
const searchQuery = ref('')

// Notifications (mock data for now)
const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: 'New Lead Assigned',
    message: 'You have been assigned a new lead from Springfield School District',
    createdAt: new Date()
  },
  {
    id: 2,
    type: 'warning',
    title: 'Task Due Soon',
    message: 'Follow up call with Jefferson Elementary due in 2 hours',
    createdAt: new Date()
  },
  {
    id: 3,
    type: 'success',
    title: 'Deal Closed Won',
    message: 'Congratulations! Madison County deal closed for $75,000',
    createdAt: new Date()
  }
])

const notificationCount = computed(() => notifications.value.length)

// Methods
const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const logout = async () => {
  await crmStore.logout()
  router.push('/login')
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'info': return 'mdi-information'
    case 'warning': return 'mdi-alert'
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    default: return 'mdi-bell'
  }
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString()
}

onMounted(async () => {
  // Load user profile on app start
  await crmStore.loadUserProfile()
})
</script>

<style scoped>
.v-navigation-drawer {
  z-index: 1006;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style> 