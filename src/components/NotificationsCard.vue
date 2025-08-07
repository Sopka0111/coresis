<template>
  <v-card elevation="2" class="notifications-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 d-flex align-center">
        <v-icon left color="primary">mdi-bell-outline</v-icon>
        Notifications
        <v-badge
          v-if="showBadge && unreadCount > 0"
          :content="unreadCount > 99 ? '99+' : unreadCount.toString()"
          color="error"
          class="ml-2"
        />
      </span>
      <div class="d-flex align-center">
        <v-btn 
          icon 
          size="small"
          variant="text"
          @click="markAllAsRead"
          title="Mark all as read"
          :disabled="unreadCount === 0 || loading"
        >
          <v-icon>mdi-check-all</v-icon>
        </v-btn>
        <v-btn 
          icon 
          color="primary"
          @click="handleAddNotification"
          title="Add Notification"
          :disabled="loading"
        >
          <v-icon>mdi-plus-circle</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
      <div class="notifications-container">
        <!-- Loading State -->
        <div v-if="loading" class="d-flex justify-center align-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Error State -->
        <v-alert 
          v-else-if="error" 
          type="error" 
          border="start" 
          elevation="1" 
          class="ma-4"
        >
          <template #prepend>
            <v-icon>mdi-alert-circle</v-icon>
          </template>
          {{ error }}
          <template #append>
            <v-btn 
              variant="text" 
              color="error"
              @click="loadNotifications"
            >
              Retry
            </v-btn>
          </template>
        </v-alert>

        <!-- Content -->
        <div v-else>
          <!-- Filter Tabs -->
          <v-tabs 
            v-model="currentFilter" 
            density="compact" 
            color="primary"
            class="px-4 pt-2"
          >
            <v-tab value="all">All</v-tab>
            <v-tab value="unread">Unread</v-tab>
            <v-tab value="important">Important</v-tab>
          </v-tabs>

          <!-- Notifications List -->
          <v-list v-if="filteredNotifications.length" class="pa-0">
            <v-list-item 
              v-for="(notification, index) in filteredNotifications" 
              :key="notification.id || index"
              class="notification-item"
              :class="{ 
                'unread-notification': !notification.read,
                'important-notification': notification.important
              }"
              @click="handleNotificationClick(notification)"
            >
              <template #prepend>
                <v-avatar :color="getTypeColor(notification.type)" size="32">
                  <v-icon color="white" size="16">
                    {{ getTypeIcon(notification.type) }}
                  </v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-content>
                <v-list-item-title 
                  class="text-body-1 font-weight-medium"
                  :class="{ 'font-weight-bold': !notification.read }"
                >
                  {{ notification.title }}
                  <v-chip 
                    v-if="notification.important" 
                    color="error" 
                    size="x-small" 
                    class="ml-2"
                  >
                    Important
                  </v-chip>
                </v-list-item-title>
                
                <v-list-item-subtitle 
                  v-if="notification.message" 
                  class="text-body-2 mt-1"
                >
                  {{ notification.message }}
                </v-list-item-subtitle>
                
                <v-list-item-subtitle class="text-caption">
                  <v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
                  {{ formatTime(notification.timestamp) }}
                  <span v-if="notification.category" class="ml-2">
                    • {{ notification.category }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
              
              <template #append>
                <div class="d-flex align-center">
                  <v-btn 
                    v-if="!notification.read"
                    icon 
                    size="small"
                    variant="text"
                    @click.stop="markAsRead(notification)"
                    title="Mark as read"
                    :loading="notification.markingAsRead"
                  >
                    <v-icon size="16">mdi-check</v-icon>
                  </v-btn>
                  <v-btn 
                    icon 
                    size="small"
                    variant="text"
                    @click.stop="handleEditNotification(notification)"
                    title="Edit Notification"
                  >
                    <v-icon size="16">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn 
                    icon 
                    size="small"
                    variant="text"
                    color="error"
                    @click.stop="handleDeleteNotification(notification)"
                    title="Delete Notification"
                    :loading="notification.deleting"
                  >
                    <v-icon size="16">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
          
          <v-alert 
            v-else 
            type="info" 
            border="start" 
            elevation="1" 
            class="ma-4"
          >
            <template #prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            No notifications available for this filter.
          </v-alert>
        </div>
      </div>
    </v-card-text>
    
    <!-- View All Button -->
    <v-card-actions v-if="notifications.length && !loading" class="pa-4 pt-0">
      <div class="d-flex align-center">
        <v-icon size="16" class="mr-2">mdi-bell</v-icon>
        <span class="text-caption">
          {{ unreadCount }} unread of {{ notifications.length }} total
        </span>
      </div>
      <v-spacer />
      <v-btn 
        variant="text" 
        color="primary"
        @click="handleViewAll"
      >
        View All Notifications
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface Notification {
  id?: number
  title: string
  message?: string
  timestamp: string
  read: boolean
  important?: boolean
  type?: 'info' | 'success' | 'warning' | 'error' | 'default'
  category?: string
  href?: string
  action?: string
  markingAsRead?: boolean
  deleting?: boolean
}

type FilterType = 'all' | 'unread' | 'important'

// Props
interface Props {
  maxHeight?: string
  showBadge?: boolean
  autoLoad?: boolean
  apiEndpoint?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: '400px',
  showBadge: true,
  autoLoad: true,
  apiEndpoint: '/api/notifications'
})

// Emits
const emit = defineEmits<{
  'add-notification': []
  'edit-notification': [notification: Notification]
  'delete-notification': [notification: Notification]
  'notification-click': [notification: Notification]
  'mark-read': [notification: Notification]
  'mark-all-read': []
  'view-all': []
  'load-error': [error: string]
}>()

// Reactive data
const currentFilter = ref<FilterType>('all')
const loading = ref(false)
const error = ref<string | null>(null)

// Sample notifications data (fallback when API is not available)
const notifications = ref<Notification[]>([
  {
    id: 1,
    title: 'New student enrolled',
    message: 'Sarah Johnson has enrolled in Advanced Massage Therapy course',
    timestamp: '2025-06-24T10:30:00Z',
    read: false,
    important: true,
    type: 'success',
    category: 'Admissions'
  },
  {
    id: 2,
    title: 'Payment received',
    message: 'Tuition payment received from Michael Chen',
    timestamp: '2025-06-24T09:15:00Z',
    read: false,
    type: 'info',
    category: 'Finance'
  },
  {
    id: 3,
    title: 'Course completion',
    message: 'Introduction to Swedish Massage completed by 15 students',
    timestamp: '2025-06-23T16:45:00Z',
    read: true,
    type: 'success',
    category: 'Academics'
  },
  {
    id: 4,
    title: 'Equipment maintenance',
    message: 'Scheduled maintenance completed on massage tables',
    timestamp: '2025-06-23T14:20:00Z',
    read: true,
    type: 'info',
    category: 'Facilities'
  },
  {
    id: 5,
    title: 'Faculty meeting reminder',
    message: 'Monthly faculty meeting scheduled for tomorrow at 2 PM',
    timestamp: '2025-06-23T11:00:00Z',
    read: false,
    important: true,
    type: 'warning',
    category: 'Staff'
  },
  {
    id: 6,
    title: 'System update',
    message: 'Student portal will be unavailable for maintenance tonight',
    timestamp: '2025-06-22T20:30:00Z',
    read: true,
    type: 'warning',
    category: 'IT'
  }
])

// Computed properties
const filteredNotifications = computed(() => {
  switch (currentFilter.value) {
    case 'unread':
      return notifications.value.filter(notification => !notification.read)
    case 'important':
      return notifications.value.filter(notification => notification.important)
    default:
      return notifications.value
  }
})

const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.read).length
})

// API Methods
const loadNotifications = async (): Promise<void> => {
  if (!props.apiEndpoint) return
  
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call - replace with actual API endpoint
    const response = await fetch(props.apiEndpoint)
    
    if (!response.ok) {
      throw new Error(`Failed to load notifications: ${response.statusText}`)
    }
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('Content-Type')
    if (contentType && contentType.includes('text/html')) {
      throw new Error('API endpoint not available - received HTML response instead of JSON')
    }
    
    const data = await response.json()
    notifications.value = data.notifications || data
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications'
    error.value = errorMessage
    emit('load-error', errorMessage)
    console.error('Error loading notifications:', err)
  } finally {
    loading.value = false
  }
}

const updateNotification = async (notification: Notification, updates: Partial<Notification>): Promise<void> => {
  if (!props.apiEndpoint) {
    // Update locally if no API
    Object.assign(notification, updates)
    return
  }
  
  try {
    const response = await fetch(`${props.apiEndpoint}/${notification.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update notification: ${response.statusText}`)
    }
    
    const updatedNotification = await response.json()
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value[index] = { ...notifications.value[index], ...updatedNotification }
    }
    
  } catch (err) {
    console.error('Error updating notification:', err)
    // Fallback to local update
    Object.assign(notification, updates)
  }
}

const deleteNotification = async (notification: Notification): Promise<void> => {
  if (!props.apiEndpoint) {
    // Remove locally if no API
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
    return
  }
  
  try {
    const response = await fetch(`${props.apiEndpoint}/${notification.id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`)
    }
    
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
    
  } catch (err) {
    console.error('Error deleting notification:', err)
    // Fallback to local removal
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
}

// Event handlers
const handleAddNotification = (): void => {
  emit('add-notification')
  console.log('Add notification clicked')
}

const handleEditNotification = (notification: Notification): void => {
  emit('edit-notification', notification)
  console.log('Edit notification:', notification.title)
}

const handleDeleteNotification = async (notification: Notification): Promise<void> => {
  emit('delete-notification', notification)
  console.log('Delete notification:', notification.title)
  
  notification.deleting = true
  await deleteNotification(notification)
  notification.deleting = false
}

const handleNotificationClick = (notification: Notification): void => {
  emit('notification-click', notification)
  console.log('Notification clicked:', notification.title)
  
  // Mark as read if not already read
  if (!notification.read) {
    markAsRead(notification)
  }
}

const markAsRead = async (notification: Notification): Promise<void> => {
  emit('mark-read', notification)
  console.log('Marked as read:', notification.title)
  
  notification.markingAsRead = true
  await updateNotification(notification, { read: true })
  notification.markingAsRead = false
}

const markAllAsRead = async (): Promise<void> => {
  emit('mark-all-read')
  console.log('Marked all notifications as read')
  
  const unreadNotifications = notifications.value.filter(n => !n.read)
  
  for (const notification of unreadNotifications) {
    notification.markingAsRead = true
    await updateNotification(notification, { read: true })
    notification.markingAsRead = false
  }
}

const handleViewAll = (): void => {
  emit('view-all')
  console.log('View all notifications clicked')
}

// Utility methods
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }
}

const getTypeColor = (type?: string): string => {
  switch (type) {
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
      return 'error'
    case 'info':
      return 'info'
    default:
      return 'primary'
  }
}

const getTypeIcon = (type?: string): string => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle'
    case 'warning':
      return 'mdi-alert'
    case 'error':
      return 'mdi-alert-circle'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-bell'
  }
}

// Lifecycle
onMounted(() => {
  if (props.autoLoad) {
    loadNotifications()
  }
})
</script>

<style scoped>
.notifications-card {
  border-radius: 12px;
}

.notifications-container {
  max-height: v-bind(maxHeight);
  overflow-y: auto;
}

.notification-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.notification-item:first-child {
  margin-top: 8px;
}

.notification-item:last-child {
  margin-bottom: 8px;
}

.unread-notification {
  background-color: rgba(25, 118, 210, 0.04);
  border-left: 3px solid #1976D2;
}

.important-notification {
  background-color: rgba(244, 67, 54, 0.04);
}

.important-notification.unread-notification {
  border-left: 3px solid #f44336;
}

.v-list-item-content {
  padding-right: 8px;
}

/* Custom scrollbar for notifications container */
.notifications-container::-webkit-scrollbar {
  width: 6px;
}

.notifications-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.notifications-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notifications-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Tab styling */
.v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style> 