<template>
  <v-card elevation="2" class="activities-card">
    <v-card-title class="pa-4">
      <v-row align="center" class="w-100">
        <v-col cols="12" sm="4">
          <span class="text-h6 d-flex align-center">
            <v-icon left color="primary">mdi-calendar-check</v-icon>
            Activities
            <v-badge
              v-if="showBadge && totalTasks > 0"
              :content="totalTasks > 99 ? '99+' : totalTasks.toString()"
              color="primary"
              class="ml-2"
            />
          </span>
        </v-col>
        <v-col cols="12" sm="7">
          <v-select
            density="compact"
            hide-details
            variant="outlined"
            :items="employees"
            item-title="label"
            item-value="value"
            v-model="selectedEmployee"
            @update:model-value="handleEmployeeChange"
            label="Filter by Employee"
            prepend-inner-icon="mdi-account-filter"
            clearable
            :disabled="loading"
          />
        </v-col>
        <v-col cols="12" sm="1" class="text-right">
          <v-btn 
            icon 
            color="primary"
            @click="handleAddActivity"
            title="Add Activity"
            :disabled="loading"
          >
            <v-icon>mdi-plus-circle</v-icon>
          </v-btn>
        </v-col>
      </v-row>
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
            @click="loadActivities"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>

      <!-- Content -->
      <div v-else>
        <!-- Filter Tabs -->
        <v-tabs 
          v-model="activeTab" 
          background-color="transparent" 
          color="primary"
          grow
          class="px-4 pt-2"
        >
          <v-tab 
            v-for="(tab, index) in tabs" 
            :key="index"
            :value="index"
            class="text-caption"
          >
            {{ tab.label }}
            <v-badge
              v-if="tab.count > 0"
              :content="tab.count > 99 ? '99+' : tab.count.toString()"
              color="error"
              class="ml-1"
              size="x-small"
            />
          </v-tab>
        </v-tabs>

        <!-- Tasks Content -->
        <v-window v-model="activeTab" class="pa-4">
          <v-window-item 
            v-for="(tab, tabIndex) in tabs" 
            :key="tabIndex" 
            :value="tabIndex"
          >
            <div class="tasks-container">
              <v-list v-if="getTasksForTab(tabIndex).length" density="compact" class="pa-0">
                <v-list-item 
                  v-for="(task, taskIndex) in getTasksForTab(tabIndex)" 
                  :key="task.id || taskIndex"
                  class="task-item"
                  :class="{ 
                    'overdue-task': tabIndex === 0,
                    'due-today-task': tabIndex === 1,
                    'upcoming-task': tabIndex === 2
                  }"
                  @click="handleTaskClick(task)"
                >
                  <template #prepend>
                    <v-checkbox
                      v-model="task.completed"
                      @click.stop="handleTaskToggle(task)"
                      :loading="task.updating"
                      color="success"
                      hide-details
                      class="mr-2"
                    />
                    <v-avatar :color="getPriorityColor(task.priority)" size="32">
                      <v-icon color="white" size="16">
                        {{ getTaskIcon(task.type) }}
                      </v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-content>
                    <v-list-item-title 
                      class="text-body-2 font-weight-medium"
                      :class="{ 'text-decoration-line-through': task.completed }"
                    >
                      {{ task.title }}
                      <v-chip 
                        v-if="task.priority === 'high'" 
                        color="error" 
                        size="x-small" 
                        class="ml-2"
                      >
                        High
                      </v-chip>
                    </v-list-item-title>
                    
                    <v-list-item-subtitle class="text-caption">
                      <div class="d-flex align-center mt-1">
                        <v-icon size="12" class="mr-1">mdi-calendar-clock</v-icon>
                        {{ formatDueDate(task.dueDate) }}
                        <span v-if="task.employee" class="ml-2">
                          • {{ task.employee }}
                        </span>
                      </div>
                      <div v-if="task.description" class="text-caption mt-1">
                        {{ task.description }}
                      </div>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <template #append>
                    <div class="d-flex align-center">
                      <v-btn 
                        icon 
                        size="small"
                        variant="text"
                        @click.stop="handleEditTask(task)"
                        title="Edit task"
                        :disabled="task.updating"
                      >
                        <v-icon size="16">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn 
                        icon 
                        size="small"
                        variant="text"
                        color="error"
                        @click.stop="handleDeleteTask(task)"
                        title="Delete task"
                        :loading="task.deleting"
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
                No tasks {{ tab.label.toLowerCase() }}.
              </v-alert>
            </div>
          </v-window-item>
        </v-window>
      </div>
    </v-card-text>
    
    <!-- Summary Footer -->
    <v-card-actions v-if="totalTasks > 0 && !loading" class="pa-4 pt-0">
      <div class="d-flex align-center">
        <v-icon size="16" class="mr-2">mdi-calendar-check</v-icon>
        <span class="text-caption">
          {{ completedTasks }} completed of {{ totalTasks }} total tasks
        </span>
      </div>
      <v-spacer />
      <v-btn 
        variant="text" 
        color="primary"
        @click="handleViewAll"
      >
        View All Activities
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface Employee {
  label: string
  value: string
  id?: number
}

interface Task {
  id?: number
  title: string
  description?: string
  dueDate: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
  type?: 'task' | 'meeting' | 'deadline' | 'reminder' | 'follow-up'
  employee?: string
  employeeId?: string
  category?: string
  updating?: boolean
  deleting?: boolean
}

interface Tab {
  label: string
  count: number
  filter: (task: Task) => boolean
}

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
  apiEndpoint: '/api/activities'
})

// Emits
const emit = defineEmits<{
  'add-activity': []
  'edit-task': [task: Task]
  'delete-task': [task: Task]
  'task-click': [task: Task]
  'complete-task': [task: Task]
  'task-toggle': [task: Task]
  'employee-change': [employeeId: string]
  'view-all': []
  'load-error': [error: string]
}>()

// Reactive data
const selectedEmployee = ref<string>('')
const activeTab = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// Sample employees data
const employees = ref<Employee[]>([
  { label: 'All Employees', value: '', id: 0 },
  { label: 'Wang, Jason', value: '28419', id: 28419 },
  { label: 'Smith, Sarah', value: '28420', id: 28420 },
  { label: 'Johnson, Mike', value: '28421', id: 28421 },
  { label: 'Davis, Lisa', value: '28422', id: 28422 }
])

// Sample tasks data (fallback when API is not available)
const tasks = ref<Task[]>([
  {
    id: 1,
    title: 'Review student applications',
    description: 'Review pending applications for Advanced Massage Therapy',
    dueDate: '2025-06-23T17:00:00Z',
    completed: false,
    priority: 'high',
    type: 'task',
    employee: 'Wang, Jason',
    employeeId: '28419',
    category: 'Admissions'
  },
  {
    id: 2,
    title: 'Faculty meeting preparation',
    description: 'Prepare agenda and materials for monthly faculty meeting',
    dueDate: '2025-06-24T14:00:00Z',
    completed: false,
    priority: 'medium',
    type: 'meeting',
    employee: 'Smith, Sarah',
    employeeId: '28420',
    category: 'Staff'
  },
  {
    id: 3,
    title: 'Equipment inventory check',
    description: 'Complete monthly inventory check of massage equipment',
    dueDate: '2025-06-25T16:00:00Z',
    completed: false,
    priority: 'low',
    type: 'task',
    employee: 'Johnson, Mike',
    employeeId: '28421',
    category: 'Facilities'
  },
  {
    id: 4,
    title: 'Student progress reports',
    description: 'Generate and review student progress reports',
    dueDate: '2025-06-22T17:00:00Z',
    completed: true,
    priority: 'medium',
    type: 'deadline',
    employee: 'Davis, Lisa',
    employeeId: '28422',
    category: 'Academics'
  },
  {
    id: 5,
    title: 'Course material updates',
    description: 'Update course materials for Swedish Massage course',
    dueDate: '2025-06-26T15:00:00Z',
    completed: false,
    priority: 'high',
    type: 'task',
    employee: 'Wang, Jason',
    employeeId: '28419',
    category: 'Curriculum'
  },
  {
    id: 6,
    title: 'Budget review meeting',
    description: 'Monthly budget review and planning session',
    dueDate: '2025-06-27T10:00:00Z',
    completed: false,
    priority: 'medium',
    type: 'meeting',
    employee: 'Smith, Sarah',
    employeeId: '28420',
    category: 'Finance'
  }
])

// Tab configuration
const tabs = computed<Tab[]>(() => [
  {
    label: 'Past Due',
    count: getTasksForTab(0).length,
    filter: (task: Task) => {
      if (task.completed) return false
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return dueDate < today
    }
  },
  {
    label: 'Due Today',
    count: getTasksForTab(1).length,
    filter: (task: Task) => {
      if (task.completed) return false
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
      return dueDate >= startOfDay && dueDate <= endOfDay
    }
  },
  {
    label: 'Due in Next 7 Days',
    count: getTasksForTab(2).length,
    filter: (task: Task) => {
      if (task.completed) return false
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return dueDate > today && dueDate <= nextWeek
    }
  }
])

// Computed properties
const filteredTasks = computed(() => {
  if (!selectedEmployee.value) {
    return tasks.value
  }
  return tasks.value.filter(task => task.employeeId === selectedEmployee.value)
})

const totalTasks = computed(() => filteredTasks.value.length)

const completedTasks = computed(() => {
  return filteredTasks.value.filter(task => task.completed).length
})

// API Methods
const loadActivities = async (): Promise<void> => {
  if (!props.apiEndpoint) return
  
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call - replace with actual API endpoint
    const response = await fetch(props.apiEndpoint)
    
    if (!response.ok) {
      throw new Error(`Failed to load activities: ${response.statusText}`)
    }
    
    const data = await response.json()
    tasks.value = data.tasks || data
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load activities'
    error.value = errorMessage
    emit('load-error', errorMessage)
    console.error('Error loading activities:', err)
  } finally {
    loading.value = false
  }
}

const updateTask = async (task: Task, updates: Partial<Task>): Promise<void> => {
  if (!props.apiEndpoint) {
    // Update locally if no API
    Object.assign(task, updates)
    return
  }
  
  try {
    const response = await fetch(`${props.apiEndpoint}/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`)
    }
    
    const updatedTask = await response.json()
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updatedTask }
    }
    
  } catch (err) {
    console.error('Error updating task:', err)
    // Fallback to local update
    Object.assign(task, updates)
  }
}

const deleteTask = async (task: Task): Promise<void> => {
  if (!props.apiEndpoint) {
    // Remove locally if no API
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
    return
  }
  
  try {
    const response = await fetch(`${props.apiEndpoint}/${task.id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`)
    }
    
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
    
  } catch (err) {
    console.error('Error deleting task:', err)
    // Fallback to local removal
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }
}

// Methods
const getTasksForTab = (tabIndex: number): Task[] => {
  const tab = tabs.value[tabIndex]
  return filteredTasks.value.filter(tab.filter)
}

const handleEmployeeChange = (employeeId: string): void => {
  emit('employee-change', employeeId)
  console.log('Employee filter changed:', employeeId)
}

const handleAddActivity = (): void => {
  emit('add-activity')
  console.log('Add activity clicked')
}

const handleEditTask = (task: Task): void => {
  emit('edit-task', task)
  console.log('Edit task:', task.title)
}

const handleDeleteTask = async (task: Task): Promise<void> => {
  emit('delete-task', task)
  console.log('Delete task:', task.title)
  
  task.deleting = true
  await deleteTask(task)
  task.deleting = false
}

const handleTaskClick = (task: Task): void => {
  emit('task-click', task)
  console.log('Task clicked:', task.title)
}

const handleTaskToggle = async (task: Task): Promise<void> => {
  emit('task-toggle', task)
  console.log('Task toggle:', task.title)
  
  task.updating = true
  await updateTask(task, { completed: task.completed })
  task.updating = false
}

const handleCompleteTask = async (task: Task): Promise<void> => {
  emit('complete-task', task)
  console.log('Task completed:', task.title)
  
  task.updating = true
  await updateTask(task, { completed: true })
  task.updating = false
}

const handleViewAll = (): void => {
  emit('view-all')
  console.log('View all activities clicked')
}

const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate)
  const now = new Date()
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''} overdue`
  } else if (diffInDays === 0) {
    return 'Due today'
  } else if (diffInDays === 1) {
    return 'Due tomorrow'
  } else if (diffInDays <= 7) {
    return `Due in ${diffInDays} days`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
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

const getTaskIcon = (type?: string): string => {
  switch (type) {
    case 'meeting':
      return 'mdi-account-group'
    case 'deadline':
      return 'mdi-calendar-clock'
    case 'reminder':
      return 'mdi-bell'
    case 'follow-up':
      return 'mdi-phone'
    default:
      return 'mdi-checkbox-marked-circle-outline'
  }
}

// Lifecycle
onMounted(() => {
  if (props.autoLoad) {
    loadActivities()
  }
})
</script>

<style scoped>
.activities-card {
  border-radius: 12px;
}

.tasks-container {
  max-height: v-bind(maxHeight);
  overflow-y: auto;
}

.task-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.task-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.overdue-task {
  background-color: rgba(244, 67, 54, 0.04);
  border-left: 3px solid #f44336;
}

.due-today-task {
  background-color: rgba(255, 152, 0, 0.04);
  border-left: 3px solid #ff9800;
}

.upcoming-task {
  background-color: rgba(76, 175, 80, 0.04);
  border-left: 3px solid #4caf50;
}

.v-list-item-content {
  padding-right: 8px;
}

/* Custom scrollbar for tasks container */
.tasks-container::-webkit-scrollbar {
  width: 6px;
}

.tasks-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tasks-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tasks-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Tab styling */
.v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.v-tab {
  font-size: 0.75rem;
}
</style> 