<template>
  <v-card elevation="2" class="announcements-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">
        <v-icon left color="primary">mdi-bullhorn</v-icon>
        Announcements
      </span>
      <v-btn 
        icon 
        color="primary"
        @click="handleAddAnnouncement"
        title="Add Announcement"
      >
        <v-icon>mdi-plus-circle</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
      <div class="announcements-container">
        <v-list v-if="announcements.length" class="pa-0">
          <v-list-item 
            v-for="(item, index) in announcements" 
            :key="item.id || index"
            class="announcement-item"
            @click="handleAnnouncementClick(item)"
          >
            <template #prepend>
              <v-avatar :color="getPriorityColor(item.priority)" size="32">
                <v-icon color="white" size="16">
                  {{ getPriorityIcon(item.priority) }}
                </v-icon>
              </v-avatar>
            </template>
            
            <v-list-item-content>
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ item.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                <v-icon size="12" class="mr-1">mdi-calendar</v-icon>
                {{ formatDate(item.date) }}
                <span v-if="item.author" class="ml-2">
                  • by {{ item.author }}
                </span>
              </v-list-item-subtitle>
              <v-list-item-subtitle 
                v-if="item.excerpt" 
                class="text-body-2 mt-1 text-truncate"
              >
                {{ item.excerpt }}
              </v-list-item-subtitle>
            </v-list-item-content>
            
            <template #append>
              <v-btn 
                icon 
                size="small"
                variant="text"
                @click.stop="handleEditAnnouncement(item)"
                title="Edit Announcement"
              >
                <v-icon size="16">mdi-pencil</v-icon>
              </v-btn>
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
          No announcements available at this time.
        </v-alert>
      </div>
    </v-card-text>
    
    <!-- View All Button -->
    <v-card-actions v-if="announcements.length" class="pa-4 pt-0">
      <v-spacer />
      <v-btn 
        variant="text" 
        color="primary"
        @click="handleViewAll"
      >
        View All Announcements
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Types
interface Announcement {
  id?: number
  title: string
  date: string
  author?: string
  excerpt?: string
  priority?: 'low' | 'medium' | 'high'
  content?: string
}

// Props
interface Props {
  maxHeight?: string
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: '400px',
  showActions: true
})

// Emits
const emit = defineEmits<{
  'add-announcement': []
  'edit-announcement': [announcement: Announcement]
  'announcement-click': [announcement: Announcement]
  'view-all': []
}>()

// Sample announcements data
const announcements = ref<Announcement[]>([
  {
    id: 1,
    title: 'Welcome back to the new semester!',
    date: '2025-06-24',
    author: 'Administration',
    excerpt: 'We are excited to welcome all students back for the new semester. Please review the updated schedule and policies.',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Holiday schedule released',
    date: '2025-06-22',
    author: 'Registrar',
    excerpt: 'The holiday schedule for the upcoming semester has been posted. Please check your student portal for details.',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'New massage therapy equipment available',
    date: '2025-06-20',
    author: 'Facilities',
    excerpt: 'We have added new state-of-the-art massage tables and equipment to enhance your learning experience.',
    priority: 'low'
  },
  {
    id: 4,
    title: 'Student orientation session reminder',
    date: '2025-06-18',
    author: 'Student Services',
    excerpt: 'Don\'t forget to attend the mandatory orientation session for new students this Friday at 2 PM.',
    priority: 'high'
  }
])

// Methods
const handleAddAnnouncement = (): void => {
  emit('add-announcement')
  console.log('Add announcement clicked')
}

const handleEditAnnouncement = (announcement: Announcement): void => {
  emit('edit-announcement', announcement)
  console.log('Edit announcement:', announcement.title)
}

const handleAnnouncementClick = (announcement: Announcement): void => {
  emit('announcement-click', announcement)
  console.log('Announcement clicked:', announcement.title)
}

const handleViewAll = (): void => {
  emit('view-all')
  console.log('View all announcements clicked')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getPriorityColor = (priority?: string): string => {
  switch (priority) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'primary'
  }
}

const getPriorityIcon = (priority?: string): string => {
  switch (priority) {
    case 'high':
      return 'mdi-alert-circle'
    case 'medium':
      return 'mdi-information'
    case 'low':
      return 'mdi-check-circle'
    default:
      return 'mdi-bullhorn'
  }
}
</script>

<style scoped>
.announcements-card {
  border-radius: 12px;
}

.announcements-container {
  max-height: v-bind(maxHeight);
  overflow-y: auto;
}

.announcement-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.announcement-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.announcement-item:first-child {
  margin-top: 8px;
}

.announcement-item:last-child {
  margin-bottom: 8px;
}

.v-list-item-content {
  padding-right: 8px;
}

/* Custom scrollbar for announcements container */
.announcements-container::-webkit-scrollbar {
  width: 6px;
}

.announcements-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.announcements-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.announcements-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 