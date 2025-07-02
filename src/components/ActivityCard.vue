<template>
  <v-card 
    class="activity-card"
    :elevation="elevation"
    variant="elevated"
  >
    <v-card-title class="d-flex align-center pa-4 pb-2">
      <v-icon 
        :icon="titleIcon" 
        color="primary" 
        class="mr-3" 
        size="24"
      />
      <span class="text-h6">{{ title }}</span>
      <v-spacer />
      <v-btn
        v-if="showRefresh"
        icon
        variant="text"
        size="small"
        @click="handleRefresh"
      >
        <v-icon icon="mdi-refresh" />
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
      <v-list 
        class="activity-list"
        :max-height="maxHeight"
        style="overflow-y: auto;"
      >
        <template v-for="(activity, index) in activities" :key="activity.id || index">
          <v-list-item
            class="activity-item pa-4"
            :class="{ 'activity-unread': !activity.read }"
            @click="handleActivityClick(activity)"
          >
            <template #prepend>
              <v-avatar
                :size="avatarSize"
                :color="getActivityColor(activity.type)"
                class="activity-avatar"
              >
                <v-icon 
                  :icon="getActivityIcon(activity.type)"
                  color="white"
                  :size="avatarSize - 16"
                />
              </v-avatar>
            </template>

            <v-list-item-title class="activity-title text-subtitle-2 font-weight-medium">
              {{ activity.title }}
            </v-list-item-title>

            <v-list-item-subtitle class="activity-description mt-1">
              {{ activity.description }}
            </v-list-item-subtitle>

            <div class="activity-meta d-flex align-center justify-space-between mt-2">
              <div class="activity-user text-caption text-medium-emphasis">
                <v-icon icon="mdi-account" size="small" class="mr-1" />
                {{ activity.user }}
              </div>
              <div class="activity-time text-caption text-medium-emphasis">
                {{ formatTime(activity.timestamp) }}
              </div>
            </div>

            <!-- Activity tags/badges -->
            <div v-if="activity.tags?.length" class="activity-tags mt-2">
              <v-chip
                v-for="tag in activity.tags"
                :key="tag"
                size="x-small"
                variant="tonal"
                color="primary"
                class="mr-1"
              >
                {{ tag }}
              </v-chip>
            </div>

            <!-- Priority indicator -->
            <v-icon
              v-if="activity.priority === 'high'"
              icon="mdi-alert-circle"
              color="error"
              size="small"
              class="activity-priority"
            />
            <v-icon
              v-else-if="activity.priority === 'medium'"
              icon="mdi-alert"
              color="warning"
              size="small"
              class="activity-priority"
            />
          </v-list-item>

          <v-divider 
            v-if="index < activities.length - 1" 
            :key="`divider-${index}`"
          />
        </template>

        <!-- Empty state -->
        <div 
          v-if="!activities.length"
          class="activity-empty d-flex flex-column align-center justify-center pa-8"
        >
          <v-icon 
            icon="mdi-timeline-outline" 
            size="48" 
            color="grey-lighten-1"
            class="mb-4"
          />
          <div class="text-h6 text-medium-emphasis">No Activities</div>
          <div class="text-body-2 text-disabled text-center">
            Recent activities will appear here
          </div>
        </div>
      </v-list>
    </v-card-text>

    <!-- Footer actions -->
    <v-card-actions v-if="showActions" class="pa-4 pt-2">
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        @click="handleViewAll"
      >
        View All Activities
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface Activity {
  id?: string | number
  title: string
  description: string
  user: string
  timestamp: string | Date
  type: 'student' | 'enrollment' | 'payment' | 'grade' | 'attendance' | 'document' | 'system' | 'announcement'
  priority?: 'low' | 'medium' | 'high'
  read?: boolean
  tags?: string[]
  data?: any
}

interface Props {
  title?: string
  titleIcon?: string
  activities: Activity[]
  elevation?: number
  maxHeight?: string | number
  avatarSize?: number
  showRefresh?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Recent Activities',
  titleIcon: 'mdi-timeline',
  elevation: 2,
  maxHeight: 400,
  avatarSize: 40,
  showRefresh: true,
  showActions: true
})

const emit = defineEmits<{
  refresh: []
  activityClick: [activity: Activity]
  viewAll: []
}>()

// Methods
const getActivityIcon = (type: Activity['type']): string => {
  const iconMap = {
    student: 'mdi-account-plus',
    enrollment: 'mdi-school',
    payment: 'mdi-credit-card',
    grade: 'mdi-star',
    attendance: 'mdi-calendar-check',
    document: 'mdi-file-document',
    system: 'mdi-cog',
    announcement: 'mdi-bullhorn'
  }
  return iconMap[type] || 'mdi-information'
}

const getActivityColor = (type: Activity['type']): string => {
  const colorMap = {
    student: 'primary',
    enrollment: 'wellness-dark',
    payment: 'success',
    grade: 'warning',
    attendance: 'info',
    document: 'secondary',
    system: 'grey',
    announcement: 'primary'
  }
  return colorMap[type] || 'primary'
}

const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

const handleRefresh = (): void => {
  emit('refresh')
}

const handleActivityClick = (activity: Activity): void => {
  emit('activityClick', activity)
}

const handleViewAll = (): void => {
  emit('viewAll')
}
</script>

<style scoped>
.activity-card {
  transition: all 0.3s ease;
}

.activity-list {
  position: relative;
}

.activity-item {
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: rgba(139, 195, 74, 0.04);
}

.activity-unread {
  background-color: rgba(139, 195, 74, 0.08);
}

.activity-unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #8BC34A;
}

.activity-avatar {
  flex-shrink: 0;
}

.activity-title {
  line-height: 1.2;
}

.activity-description {
  line-height: 1.3;
}

.activity-meta {
  font-size: 0.75rem;
}

.activity-tags {
  margin-top: 8px;
}

.activity-priority {
  position: absolute;
  top: 16px;
  right: 16px;
}

.activity-empty {
  min-height: 200px;
}

/* Custom scrollbar */
.activity-list::-webkit-scrollbar {
  width: 4px;
}

.activity-list::-webkit-scrollbar-track {
  background: transparent;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(139, 195, 74, 0.3);
  border-radius: 2px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 195, 74, 0.5);
}
</style>