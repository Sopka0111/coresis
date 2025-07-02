<template>
  <v-navigation-drawer 
    v-model="drawer" 
    app 
    permanent 
    color="primary" 
    dark
    :width="drawerWidth"
  >
    <!-- User Profile Section -->
    <v-list-item class="pa-4">
      <v-list-item-avatar size="56">
        <v-img 
          src="https://randomuser.me/api/portraits/men/1.jpg" 
          alt="User Avatar"
        />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="text-h6">Jason Wang</v-list-item-title>
        <v-list-item-subtitle>Administrator</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider class="mb-2" />

    <!-- Navigation Menu -->
    <v-list dense>
      <!-- Profile Group -->
      <v-list-group no-action>
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account-circle"
            title="My Profile"
          />
        </template>

        <v-list-item 
          link 
          @click="handleNavigation('profile')"
          :active="isActive('profile')"
        >
          <template #prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>View Profile</v-list-item-title>
        </v-list-item>

        <v-list-item 
          link 
          @click="handleLogout"
        >
          <template #prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list-group>

      <v-divider class="my-2" />
      <v-subheader>Navigation</v-subheader>

      <!-- Main Navigation Items -->
      <v-list-item
        v-for="item in navigationItems"
        :key="item.title"
        :active="isActive(item.href)"
        link
        @click="handleNavigation(item.href)"
        class="mb-1"
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- Drawer Toggle Button (Mobile) -->
    <template #append>
      <v-list-item 
        v-if="isMobile"
        @click="toggleDrawer"
        class="mt-auto"
      >
        <template #prepend>
          <v-icon>{{ drawer ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
        </template>
        <v-list-item-title>Toggle Menu</v-list-item-title>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

// Props
interface NavigationItem {
  title: string
  href: string
  icon: string
}

interface Props {
  modelValue?: boolean
  items?: NavigationItem[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  items: () => []
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'navigation': [href: string]
  'logout': []
}>()

// Vuetify composables
const { mdAndDown } = useDisplay()

// Reactive data
const drawer = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const isMobile = computed(() => mdAndDown.value)

// Navigation items
const navigationItems = computed((): NavigationItem[] => {
  if (props.items.length > 0) {
    return props.items
  }
  
  return [
    { title: 'Dashboard', href: '/dashboard', icon: 'mdi-speedometer' },
    { title: 'Admissions', href: '/admissions', icon: 'mdi-account-plus' },
    { title: 'Registrar', href: '/registrar', icon: 'mdi-buffer' },
    { title: 'Finance', href: '/finance', icon: 'mdi-currency-usd' },
    { title: 'Accounting', href: '/accounting', icon: 'mdi-calculator' },
    { title: 'Placement', href: '/placement', icon: 'mdi-briefcase' },
    { title: 'Reports', href: '/reports', icon: 'mdi-chart-bar' },
    { title: 'Management', href: '/management', icon: 'mdi-apps' },
    { title: 'Setup', href: '/setup', icon: 'mdi-cog' }
  ]
})

// Computed properties
const drawerWidth = computed(() => {
  return drawer.value ? 280 : 56
})

// Methods
const isActive = (path: string): boolean => {
  if (typeof window !== 'undefined') {
    return window.location.pathname === path
  }
  return false
}

const handleNavigation = (href: string): void => {
  emit('navigation', href)
  
  // Handle different navigation types
  if (href.startsWith('http')) {
    window.open(href, '_blank')
  } else if (href.startsWith('#')) {
    // Handle internal navigation
    console.log('Navigate to:', href)
  } else {
    // Handle route navigation (you can integrate with Vue Router here)
    console.log('Navigate to route:', href)
    // Example with Vue Router:
    // router.push(href)
  }
}

const handleLogout = (): void => {
  emit('logout')
  
  // Add your logout logic here
  console.log('Logging out...')
  
  // Example: redirect to logout page
  // window.location.href = '/logout'
}

const toggleDrawer = (): void => {
  drawer.value = !drawer.value
}

// Lifecycle
onMounted(() => {
  // Initialize drawer state based on screen size
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth < 960
    if (isMobile) {
      drawer.value = false
    }
  }
})
</script>

<style scoped>
.v-navigation-drawer {
  transition: width 0.3s ease;
}

.v-list-item {
  border-radius: 8px;
  margin: 2px 8px;
}

.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.v-list-group__items .v-list-item {
  margin-left: 16px;
  margin-right: 8px;
}

.v-subheader {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}
</style> 