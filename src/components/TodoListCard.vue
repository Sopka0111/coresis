<template>
  <v-card elevation="2" class="todo-list-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">
        <v-icon left color="primary">mdi-checkbox-marked-circle-outline</v-icon>
        To Do List
      </span>
      <div class="d-flex align-center">
        <v-chip 
          :color="getFilterColor(currentFilter)" 
          size="small" 
          class="mr-2"
        >
          {{ getFilterLabel(currentFilter) }}
        </v-chip>
        <v-btn 
          icon 
          color="primary"
          @click="handleAddTask"
          title="Add Task"
        >
          <v-icon>mdi-plus-circle</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
      <div class="todo-container">
        <!-- Filter Tabs -->
        <v-tabs 
          v-model="currentFilter" 
          density="compact" 
          color="primary"
          class="px-4 pt-2"
        >
          <v-tab value="all">All</v-tab>
          <v-tab value="pending">Pending</v-tab>
          <v-tab value="completed">Completed</v-tab>
          <v-tab value="overdue">Overdue</v-tab>
        </v-tabs>

        <!-- Tasks List -->
        <v-list v-if="filteredTasks.length" class="pa-0">
          <v-list-item 
            v-for="(task, index) in filteredTasks" 
            :key="task.id || index"
            class="todo-item"
            :class="{ 
              'completed-task': task.completed,
              'overdue-task': isOverdue(task) && !task.completed
            }"
          >
            <template #prepend>
              <v-checkbox 
                v-model="task.completed" 
                color="primary"
                @change="handleTaskToggle(task)"
                hide-details
              />
            </template>
            
            <v-list-item-content>
              <v-list-item-title 
                class="text-body-1 font-weight-medium"
                :class="{ 'text-decoration-line-through': task.completed }"
              >
                {{ task.title }}
                <v-chip 
                  v-if="task.priority" 
                  :color="getPriorityColor(task.priority)" 
                  size="x-small" 
                  class="ml-2"
                >
                  {{ task.priority }}
                </v-chip>
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-caption">
                <v-icon size="12" class="mr-1">mdi-calendar</v-icon>
                {{ formatDate(task.dueDate) }}
                <span v-if="task.category" class="ml-2">
                  • {{ task.category }}
                </span>
                <span v-if="isOverdue(task) && !task.completed" class="ml-2 text-error">
                  • Overdue
                </span>
              </v-list-item-subtitle>
              
              <v-list-item-subtitle 
                v-if="task.description" 
                class="text-body-2 mt-1 text-truncate"
              >
                {{ task.description }}
              </v-list-item-subtitle>
            </v-list-item-content>
            
            <template #append>
              <div class="d-flex align-center">
                <v-btn 
                  icon 
                  size="small"
                  variant="text"
                  @click.stop="handleEditTask(task)"
                  title="Edit Task"
                >
                  <v-icon size="16">mdi-pencil</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  size="small"
                  variant="text"
                  color="error"
                  @click.stop="handleDeleteTask(task)"
                  title="Delete Task"
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
          No tasks available for this filter.
        </v-alert>
      </div>
    </v-card-text>
    
    <!-- Progress Summary -->
    <v-card-actions v-if="tasks.length" class="pa-4 pt-0">
      <div class="d-flex align-center">
        <v-progress-circular
          :model-value="completionPercentage"
          :color="getProgressColor(completionPercentage)"
          size="24"
          class="mr-2"
        />
        <span class="text-caption">
          {{ completedTasks.length }} of {{ tasks.length }} completed
        </span>
      </div>
      <v-spacer />
      <v-btn 
        variant="text" 
        color="primary"
        @click="handleViewAll"
      >
        View All Tasks
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Types
interface Task {
  id?: number
  title: string
  description?: string
  dueDate: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
  category?: string
  createdAt?: string
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue'

// Props
interface Props {
  maxHeight?: string
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: '400px',
  showProgress: true
})

// Emits
const emit = defineEmits<{
  'add-task': []
  'edit-task': [task: Task]
  'delete-task': [task: Task]
  'task-toggle': [task: Task]
  'view-all': []
}>()

// Reactive data
const currentFilter = ref<FilterType>('all')

// Sample tasks data
const tasks = ref<Task[]>([
  {
    id: 1,
    title: 'Email follow-up with lead',
    description: 'Follow up with potential student about enrollment',
    dueDate: '2025-06-28',
    completed: false,
    priority: 'high',
    category: 'Admissions'
  },
  {
    id: 2,
    title: 'Review applications',
    description: 'Review pending student applications',
    dueDate: '2025-06-29',
    completed: true,
    priority: 'medium',
    category: 'Administration'
  },
  {
    id: 3,
    title: 'Update course materials',
    description: 'Update Swedish massage course materials',
    dueDate: '2025-06-25',
    completed: false,
    priority: 'low',
    category: 'Curriculum'
  },
  {
    id: 4,
    title: 'Schedule faculty meeting',
    description: 'Schedule monthly faculty meeting',
    dueDate: '2025-06-20',
    completed: false,
    priority: 'medium',
    category: 'Staff'
  },
  {
    id: 5,
    title: 'Order supplies',
    description: 'Order massage oils and supplies',
    dueDate: '2025-06-30',
    completed: false,
    priority: 'high',
    category: 'Facilities'
  }
])

// Computed properties
const filteredTasks = computed(() => {
  switch (currentFilter.value) {
    case 'pending':
      return tasks.value.filter(task => !task.completed && !isOverdue(task))
    case 'completed':
      return tasks.value.filter(task => task.completed)
    case 'overdue':
      return tasks.value.filter(task => isOverdue(task) && !task.completed)
    default:
      return tasks.value
  }
})

const completedTasks = computed(() => {
  return tasks.value.filter(task => task.completed)
})

const completionPercentage = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedTasks.value.length / tasks.value.length) * 100)
})

// Methods
const handleAddTask = (): void => {
  emit('add-task')
  console.log('Add task clicked')
}

const handleEditTask = (task: Task): void => {
  emit('edit-task', task)
  console.log('Edit task:', task.title)
}

const handleDeleteTask = (task: Task): void => {
  emit('delete-task', task)
  console.log('Delete task:', task.title)
}

const handleTaskToggle = (task: Task): void => {
  emit('task-toggle', task)
  console.log('Task toggled:', task.title, task.completed)
}

const handleViewAll = (): void => {
  emit('view-all')
  console.log('View all tasks clicked')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const isOverdue = (task: Task): boolean => {
  if (task.completed) return false
  const dueDate = new Date(task.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
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

const getFilterColor = (filter: FilterType): string => {
  switch (filter) {
    case 'pending':
      return 'primary'
    case 'completed':
      return 'success'
    case 'overdue':
      return 'error'
    default:
      return 'primary'
  }
}

const getFilterLabel = (filter: FilterType): string => {
  switch (filter) {
    case 'pending':
      return 'Pending'
    case 'completed':
      return 'Completed'
    case 'overdue':
      return 'Overdue'
    default:
      return 'All'
  }
}

const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return 'success'
  if (percentage >= 50) return 'warning'
  return 'error'
}
</script>

<style scoped>
.todo-list-card {
  border-radius: 12px;
}

.todo-container {
  max-height: v-bind(maxHeight);
  overflow-y: auto;
}

.todo-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: background-color 0.2s ease;
}

.todo-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.todo-item:first-child {
  margin-top: 8px;
}

.todo-item:last-child {
  margin-bottom: 8px;
}

.completed-task {
  opacity: 0.6;
}

.overdue-task {
  border-left: 3px solid #f44336;
}

.v-list-item-content {
  padding-right: 8px;
}

/* Custom scrollbar for todo container */
.todo-container::-webkit-scrollbar {
  width: 6px;
}

.todo-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.todo-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.todo-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Tab styling */
.v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style> 