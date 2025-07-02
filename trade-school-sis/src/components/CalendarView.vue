<template>
  <v-card elevation="2" class="calendar-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 d-flex align-center">
        <v-icon left color="primary">mdi-calendar-month</v-icon>
        Calendar
        <v-badge
          v-if="showBadge && totalEvents > 0"
          :content="totalEvents > 99 ? '99+' : totalEvents.toString()"
          color="primary"
          class="ml-2"
        />
      </span>
      <div class="d-flex align-center">
        <v-btn 
          icon 
          size="small"
          variant="text"
          @click="refreshCalendar"
          title="Refresh Calendar"
          :loading="loading"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn 
          icon 
          color="primary"
          @click="handleAddEvent"
          title="Add Event"
          :disabled="loading"
        >
          <v-icon>mdi-plus-circle</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
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
            @click="loadEvents"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>

      <!-- Calendar Content -->
      <div v-else>
        <!-- Filter Controls -->
        <div class="pa-4 pb-2">
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedView"
                :items="viewOptions"
                density="compact"
                hide-details
                variant="outlined"
                label="View"
                @update:model-value="handleViewChange"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedCategory"
                :items="categoryOptions"
                density="compact"
                hide-details
                variant="outlined"
                label="Category"
                clearable
                @update:model-value="handleCategoryChange"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedEmployee"
                :items="employeeOptions"
                density="compact"
                hide-details
                variant="outlined"
                label="Employee"
                clearable
                @update:model-value="handleEmployeeChange"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-btn
                variant="outlined"
                color="primary"
                @click="goToToday"
                :disabled="loading"
              >
                <v-icon left>mdi-calendar-today</v-icon>
                Today
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- FullCalendar Component -->
        <div class="calendar-container">
          <div ref="calendarRef" class="fullcalendar-wrapper">
            <!-- FullCalendar will be mounted here -->
            <div class="calendar-placeholder">
              <v-icon size="64" color="primary" class="mb-4">mdi-calendar-month</v-icon>
              <h3 class="text-h6 mb-2">Calendar View</h3>
              <p class="text-body-2 text-medium-emphasis">
                FullCalendar component will be loaded here once dependencies are installed.
              </p>
              <v-btn 
                color="primary" 
                class="mt-4"
                @click="handleAddEvent"
              >
                <v-icon left>mdi-plus</v-icon>
                Add Event
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Event Details Dialog -->
    <v-dialog v-model="showEventDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Event Details</span>
          <v-btn icon @click="showEventDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="selectedEvent">
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-calendar</v-icon>
              </template>
              <v-list-item-title>{{ selectedEvent.title }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedEvent.description">
              <template #prepend>
                <v-icon color="info">mdi-text</v-icon>
              </template>
              <v-list-item-title>{{ selectedEvent.description }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon color="warning">mdi-clock</v-icon>
              </template>
              <v-list-item-title>
                {{ formatEventTime(selectedEvent.start) }}
                <span v-if="selectedEvent.end">
                  - {{ formatEventTime(selectedEvent.end) }}
                </span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedEvent.category">
              <template #prepend>
                <v-icon color="success">mdi-tag</v-icon>
              </template>
              <v-list-item-title>{{ selectedEvent.category }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedEvent.employee">
              <template #prepend>
                <v-icon color="secondary">mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ selectedEvent.employee }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="handleEditEvent"
            :disabled="!selectedEvent"
          >
            Edit
          </v-btn>
          <v-btn 
            variant="text" 
            color="error"
            @click="handleDeleteEvent"
            :disabled="!selectedEvent"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// Types
interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  description?: string
  category?: string
  employee?: string
  employeeId?: string
  color?: string
  backgroundColor?: string
  borderColor?: string
  allDay?: boolean
  editable?: boolean
}

interface Employee {
  label: string
  value: string
  id?: number
}

// Props
interface Props {
  showBadge?: boolean
  autoLoad?: boolean
  apiEndpoint?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBadge: true,
  autoLoad: true,
  apiEndpoint: '/api/calendar/events',
  height: '600px'
})

// Emits
const emit = defineEmits<{
  'add-event': []
  'edit-event': [event: CalendarEvent]
  'delete-event': [event: CalendarEvent]
  'event-click': [event: CalendarEvent]
  'date-select': [start: string, end: string]
  'view-change': [view: string]
  'load-error': [error: string]
}>()

// Reactive data
const calendarRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedView = ref('dayGridMonth')
const selectedCategory = ref<string>('')
const selectedEmployee = ref<string>('')
const showEventDialog = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

// Sample data (fallback when API is not available)
const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: 'Faculty Meeting',
    start: '2025-06-24T14:00:00Z',
    end: '2025-06-24T15:00:00Z',
    description: 'Monthly faculty meeting to discuss curriculum updates',
    category: 'Staff',
    employee: 'Wang, Jason',
    employeeId: '28419',
    backgroundColor: '#1976D2',
    borderColor: '#1565C0'
  },
  {
    id: '2',
    title: 'Student Orientation',
    start: '2025-06-25T10:00:00Z',
    end: '2025-06-25T12:00:00Z',
    description: 'New student orientation session',
    category: 'Admissions',
    employee: 'Smith, Sarah',
    employeeId: '28420',
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C'
  },
  {
    id: '3',
    title: 'Equipment Maintenance',
    start: '2025-06-26T09:00:00Z',
    end: '2025-06-26T11:00:00Z',
    description: 'Scheduled maintenance of massage equipment',
    category: 'Facilities',
    employee: 'Johnson, Mike',
    employeeId: '28421',
    backgroundColor: '#FF9800',
    borderColor: '#F57C00'
  },
  {
    id: '4',
    title: 'Course Completion',
    start: '2025-06-27T16:00:00Z',
    end: '2025-06-27T17:00:00Z',
    description: 'Swedish Massage course completion ceremony',
    category: 'Academics',
    employee: 'Davis, Lisa',
    employeeId: '28422',
    backgroundColor: '#9C27B0',
    borderColor: '#7B1FA2'
  }
])

// Filter options
const viewOptions = [
  { title: 'Month', value: 'dayGridMonth' },
  { title: 'Week', value: 'timeGridWeek' },
  { title: 'Day', value: 'timeGridDay' }
]

const categoryOptions = [
  { title: 'Staff', value: 'Staff' },
  { title: 'Admissions', value: 'Admissions' },
  { title: 'Facilities', value: 'Facilities' },
  { title: 'Academics', value: 'Academics' },
  { title: 'Finance', value: 'Finance' },
  { title: 'IT', value: 'IT' }
]

const employeeOptions = ref<Employee[]>([
  { label: 'All Employees', value: '', id: 0 },
  { label: 'Wang, Jason', value: '28419', id: 28419 },
  { label: 'Smith, Sarah', value: '28420', id: 28420 },
  { label: 'Johnson, Mike', value: '28421', id: 28421 },
  { label: 'Davis, Lisa', value: '28422', id: 28422 }
])

// Computed properties
const totalEvents = computed(() => events.value.length)

const filteredEvents = computed(() => {
  let filtered = events.value

  if (selectedCategory.value) {
    filtered = filtered.filter(event => event.category === selectedCategory.value)
  }

  if (selectedEmployee.value) {
    filtered = filtered.filter(event => event.employeeId === selectedEmployee.value)
  }

  return filtered
})

// API Methods
const loadEvents = async (): Promise<void> => {
  if (!props.apiEndpoint) return
  
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call - replace with actual API endpoint
    const response = await fetch(props.apiEndpoint)
    
    if (!response.ok) {
      throw new Error(`Failed to load events: ${response.statusText}`)
    }
    
    const data = await response.json()
    events.value = data.events || data
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load events'
    error.value = errorMessage
    emit('load-error', errorMessage)
    console.error('Error loading events:', err)
  } finally {
    loading.value = false
  }
}

const updateEvent = async (event: CalendarEvent, updates: Partial<CalendarEvent>): Promise<void> => {
  if (!props.apiEndpoint) {
    // Update locally if no API
    const index = events.value.findIndex(e => e.id === event.id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updates }
    }
    return
  }
  
  try {
    const response = await fetch(`${props.apiEndpoint}/${event.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`)
    }
    
    const updatedEvent = await response.json()
    const index = events.value.findIndex(e => e.id === event.id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updatedEvent }
    }
    
  } catch (err) {
    console.error('Error updating event:', err)
    // Fallback to local update
    const index = events.value.findIndex(e => e.id === event.id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updates }
    }
  }
}

const deleteEvent = async (event: CalendarEvent): Promise<void> => {
  if (!props.apiEndpoint) {
    // Remove locally if no API
    const index = events.value.findIndex(e => e.id === event.id)
    if (index !== -1) {
      events.value.splice(index, 1)
    }
    return
  }
  
  try {
    const response = await fetch(`${props.apiEndpoint}/${event.id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`)
    }
    
    const index = events.value.findIndex(e => e.id === event.id)
    if (index !== -1) {
      events.value.splice(index, 1)
    }
    
  } catch (err) {
    console.error('Error deleting event:', err)
    // Fallback to local removal
    const index = events.value.findIndex(e => e.id === event.id)
    if (index !== -1) {
      events.value.splice(index, 1)
    }
  }
}

// Event handlers
const handleEventClick = (event: CalendarEvent): void => {
  selectedEvent.value = event
  showEventDialog.value = true
  emit('event-click', event)
  console.log('Event clicked:', event.title)
}

const handleDateSelect = (start: string, end: string): void => {
  emit('date-select', start, end)
  console.log('Date selected:', start, 'to', end)
}

const handleViewChange = (view: string): void => {
  selectedView.value = view
  emit('view-change', view)
  console.log('View changed to:', view)
}

const handleCategoryChange = (category: string): void => {
  selectedCategory.value = category
  console.log('Category filter changed:', category)
}

const handleEmployeeChange = (employeeId: string): void => {
  selectedEmployee.value = employeeId
  console.log('Employee filter changed:', employeeId)
}

const handleAddEvent = (): void => {
  emit('add-event')
  console.log('Add event clicked')
}

const handleEditEvent = (): void => {
  if (selectedEvent.value) {
    emit('edit-event', selectedEvent.value)
    console.log('Edit event:', selectedEvent.value.title)
  }
  showEventDialog.value = false
}

const handleDeleteEvent = async (): Promise<void> => {
  if (selectedEvent.value) {
    emit('delete-event', selectedEvent.value)
    console.log('Delete event:', selectedEvent.value.title)
    
    await deleteEvent(selectedEvent.value)
    showEventDialog.value = false
  }
}

const refreshCalendar = async (): Promise<void> => {
  await loadEvents()
  console.log('Calendar refreshed')
}

const goToToday = (): void => {
  console.log('Go to today clicked')
  // This will be implemented when FullCalendar is properly integrated
}

// Utility methods
const formatEventTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Lifecycle
onMounted(async () => {
  if (props.autoLoad) {
    await loadEvents()
  }
  
  await nextTick()
  console.log('CalendarView mounted')
})
</script>

<style scoped>
.calendar-card {
  border-radius: 12px;
}

.calendar-container {
  padding: 0 16px 16px;
}

.fullcalendar-wrapper {
  border-radius: 8px;
  overflow: hidden;
  min-height: 600px;
  border: 1px solid #e0e0e0;
}

.calendar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 600px;
  background-color: #fafafa;
  color: #666;
  text-align: center;
  padding: 2rem;
}

/* FullCalendar custom styling (when loaded) */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-toolbar) {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px 8px 0 0;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1976D2;
}

:deep(.fc-button) {
  background-color: #1976D2;
  border-color: #1976D2;
  color: white;
  font-weight: 500;
  text-transform: none;
  border-radius: 4px;
  padding: 8px 16px;
}

:deep(.fc-button:hover) {
  background-color: #1565C0;
  border-color: #1565C0;
}

:deep(.fc-button-active) {
  background-color: #0D47A1;
  border-color: #0D47A1;
}

:deep(.fc-daygrid-day) {
  border-color: #e0e0e0;
}

:deep(.fc-daygrid-day-number) {
  color: #424242;
  font-weight: 500;
}

:deep(.fc-day-today) {
  background-color: rgba(25, 118, 210, 0.04);
}

:deep(.fc-event) {
  border-radius: 4px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.fc-event:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:deep(.fc-event-title) {
  font-weight: 600;
}

:deep(.fc-event-time) {
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .calendar-container {
    padding: 0 8px 8px;
  }
  
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 8px;
  }
  
  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
  }
}
</style> 