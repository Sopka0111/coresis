<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :max-width="maxWidth"
    :persistent="persistent"
    scrollable
  >
    <v-card class="announcement-modal">
      <!-- Header -->
      <v-card-title class="pa-4 pb-2">
        <div class="d-flex align-center">
          <v-icon 
            :icon="announcement ? 'mdi-bullhorn' : 'mdi-plus-circle'" 
            color="primary" 
            class="mr-3" 
            size="24"
          />
          <span class="text-h6">
            {{ announcement ? 'Announcement Details' : 'Create Announcement' }}
          </span>
        </div>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          @click="handleClose"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Content -->
      <v-card-text class="pa-4">
        <v-form v-if="!announcement || isEditing" ref="form" v-model="isFormValid">
          <!-- Title -->
          <v-text-field
            v-model="formData.title"
            label="Announcement Title"
            variant="outlined"
            :rules="titleRules"
            class="mb-4"
            prepend-inner-icon="mdi-text"
          />

          <!-- Content -->
          <v-textarea
            v-model="formData.content"
            label="Announcement Content"
            variant="outlined"
            :rules="contentRules"
            rows="4"
            class="mb-4"
            prepend-inner-icon="mdi-text-box"
          />

          <!-- Priority -->
          <v-select
            v-model="formData.priority"
            label="Priority"
            variant="outlined"
            :items="priorityOptions"
            class="mb-4"
            prepend-inner-icon="mdi-flag"
          />

          <!-- Target Audience -->
          <v-select
            v-model="formData.audience"
            label="Target Audience"
            variant="outlined"
            :items="audienceOptions"
            multiple
            chips
            class="mb-4"
            prepend-inner-icon="mdi-account-group"
          />

          <!-- Schedule -->
          <v-expansion-panels class="mb-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon icon="mdi-calendar-clock" class="mr-3" />
                Schedule Options
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="d-flex gap-4 mb-4">
                  <v-text-field
                    v-model="formData.publishDate"
                    label="Publish Date"
                    type="date"
                    variant="outlined"
                    class="flex-grow-1"
                  />
                  <v-text-field
                    v-model="formData.publishTime"
                    label="Publish Time"
                    type="time"
                    variant="outlined"
                    class="flex-grow-1"
                  />
                </div>
                <v-text-field
                  v-model="formData.expirationDate"
                  label="Expiration Date (Optional)"
                  type="date"
                  variant="outlined"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Notification Options -->
          <v-expansion-panels class="mb-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon icon="mdi-bell" class="mr-3" />
                Notification Settings
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.sendEmail"
                      label="Send Email Notification"
                      color="primary"
                      inset
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.sendSMS"
                      label="Send SMS Notification"
                      color="primary"
                      inset
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.pinToTop"
                      label="Pin to Top"
                      color="primary"
                      inset
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.requireConfirmation"
                      label="Require Read Confirmation"
                      color="primary"
                      inset
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Attachments -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1 pa-3">
              <v-icon icon="mdi-attachment" class="mr-2" />
              Attachments
            </v-card-title>
            <v-card-text class="pa-3 pt-0">
              <v-file-input
                v-model="formData.attachments"
                label="Upload Files"
                variant="outlined"
                multiple
                chips
                show-size
                prepend-icon=""
                prepend-inner-icon="mdi-paperclip"
              />
            </v-card-text>
          </v-card>
        </v-form>

        <!-- View Mode -->
        <div v-else class="announcement-view">
          <!-- Header info -->
          <div class="announcement-header mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-chip
                :color="getPriorityColor(announcement.priority)"
                size="small"
                variant="tonal"
              >
                {{ announcement.priority.toUpperCase() }}
              </v-chip>
              <div class="text-caption text-medium-emphasis">
                {{ formatDate(announcement.createdAt) }}
              </div>
            </div>
            <h2 class="text-h5 mb-2">{{ announcement.title }}</h2>
            <div class="text-body-2 text-medium-emphasis mb-2">
              By {{ announcement.author }} • {{ announcement.audience.join(', ') }}
            </div>
          </div>

          <!-- Content -->
          <div class="announcement-content mb-4">
            <div class="text-body-1" style="white-space: pre-wrap;">
              {{ announcement.content }}
            </div>
          </div>

          <!-- Attachments -->
          <div v-if="announcement.attachments?.length" class="announcement-attachments mb-4">
            <v-divider class="mb-3" />
            <h4 class="text-subtitle-1 mb-2">
              <v-icon icon="mdi-attachment" class="mr-2" />
              Attachments
            </h4>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="attachment in announcement.attachments"
                :key="attachment.name"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-file"
                @click="downloadAttachment(attachment)"
              >
                {{ attachment.name }}
              </v-chip>
            </div>
          </div>

          <!-- Stats -->
          <div v-if="announcement.stats" class="announcement-stats">
            <v-divider class="mb-3" />
            <h4 class="text-subtitle-1 mb-2">
              <v-icon icon="mdi-chart-line" class="mr-2" />
              Delivery Stats
            </h4>
            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div class="text-h6 text-primary">{{ announcement.stats.sent }}</div>
                  <div class="text-caption text-medium-emphasis">Sent</div>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div class="text-h6 text-success">{{ announcement.stats.read }}</div>
                  <div class="text-caption text-medium-emphasis">Read</div>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div class="text-h6 text-info">{{ announcement.stats.clicked }}</div>
                  <div class="text-caption text-medium-emphasis">Clicked</div>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div class="text-h6 text-warning">{{ announcement.stats.pending }}</div>
                  <div class="text-caption text-medium-emphasis">Pending</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        
        <template v-if="!announcement || isEditing">
          <v-btn
            variant="text"
            @click="handleClose"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!isFormValid"
            :loading="loading"
            @click="handleSave"
          >
            {{ announcement ? 'Update' : 'Publish' }} Announcement
          </v-btn>
        </template>

        <template v-else>
          <v-btn
            variant="text"
            @click="handleClose"
          >
            Close
          </v-btn>
          <v-btn
            v-if="canEdit"
            color="primary"
            variant="text"
            @click="isEditing = true"
          >
            Edit
          </v-btn>
          <v-btn
            v-if="canDelete"
            color="error"
            variant="text"
            @click="handleDelete"
          >
            Delete
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

export interface AnnouncementData {
  id?: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  audience: string[]
  publishDate?: string
  publishTime?: string
  expirationDate?: string
  sendEmail: boolean
  sendSMS: boolean
  pinToTop: boolean
  requireConfirmation: boolean
  attachments?: File[]
  author?: string
  createdAt?: string
  stats?: {
    sent: number
    read: number
    clicked: number
    pending: number
  }
}

interface Props {
  modelValue: boolean
  announcement?: AnnouncementData
  maxWidth?: string | number
  persistent?: boolean
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 800,
  persistent: false,
  loading: false,
  canEdit: true,
  canDelete: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: AnnouncementData]
  delete: [id: string]
  downloadAttachment: [attachment: any]
}>()

// Reactive data
const form = ref()
const isFormValid = ref(false)
const isEditing = ref(false)

const formData = reactive<AnnouncementData>({
  title: '',
  content: '',
  priority: 'medium',
  audience: [],
  publishDate: '',
  publishTime: '',
  expirationDate: '',
  sendEmail: true,
  sendSMS: false,
  pinToTop: false,
  requireConfirmation: false,
  attachments: []
})

// Form validation rules
const titleRules = [
  (v: string) => !!v || 'Title is required',
  (v: string) => v.length <= 100 || 'Title must be less than 100 characters'
]

const contentRules = [
  (v: string) => !!v || 'Content is required',
  (v: string) => v.length <= 2000 || 'Content must be less than 2000 characters'
]

// Options
const priorityOptions = [
  { title: 'Low', value: 'low' },
  { title: 'Medium', value: 'medium' },
  { title: 'High', value: 'high' }
]

const audienceOptions = [
  'All Students',
  'Current Students',
  'Prospective Students',
  'Faculty',
  'Staff',
  'Administration',
  'Parents/Guardians'
]

// Computed
const getPriorityColor = (priority: string): string => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'error'
  }
  return colors[priority as keyof typeof colors] || 'primary'
}

// Methods
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleClose = (): void => {
  isEditing.value = false
  emit('update:modelValue', false)
}

const handleSave = async (): Promise<void> => {
  if (!form.value?.validate()) return
  
  emit('save', { ...formData })
}

const handleDelete = (): void => {
  if (props.announcement?.id) {
    emit('delete', props.announcement.id)
  }
}

const downloadAttachment = (attachment: any): void => {
  emit('downloadAttachment', attachment)
}

const resetForm = (): void => {
  Object.assign(formData, {
    title: '',
    content: '',
    priority: 'medium',
    audience: [],
    publishDate: '',
    publishTime: '',
    expirationDate: '',
    sendEmail: true,
    sendSMS: false,
    pinToTop: false,
    requireConfirmation: false,
    attachments: []
  })
}

// Watchers
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.announcement) {
      Object.assign(formData, props.announcement)
    } else {
      resetForm()
      // Set default publish date/time to now
      const now = new Date()
      formData.publishDate = now.toISOString().split('T')[0]
      formData.publishTime = now.toTimeString().slice(0, 5)
    }
    isEditing.value = false
  }
})
</script>

<style scoped>
.announcement-modal {
  max-height: 90vh;
}

.announcement-view {
  max-height: 60vh;
  overflow-y: auto;
}

.announcement-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 16px;
}

.announcement-content {
  line-height: 1.6;
}

.announcement-attachments .v-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.announcement-attachments .v-chip:hover {
  transform: translateY(-1px);
}

.announcement-stats .text-h6 {
  font-weight: 600;
}
</style>