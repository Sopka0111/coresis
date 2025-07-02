<template>
  <v-card class="filter-bar">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">
        <v-icon left color="primary">mdi-filter</v-icon>
        Filter Transactions
      </span>
      <v-btn 
        variant="text" 
        @click="clearFilters"
        :disabled="!hasActiveFilters"
      >
        Clear All
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <!-- Date Range Filter -->
        <v-col cols="12" md="4">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-model="dateRangeText"
                label="Date Range"
                prepend-inner-icon="mdi-calendar"
                readonly
                v-bind="props"
                variant="outlined"
                density="compact"
                :loading="loading"
              />
            </template>
            <v-date-picker
              v-model="filters.dateRange"
              range
              @update:model-value="handleDateChange"
            />
          </v-menu>
        </v-col>

        <!-- Transaction Type Filter -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.type"
            :items="typeOptions"
            label="Type"
            variant="outlined"
            density="compact"
            :loading="loading"
            @update:model-value="handleFilterChange"
          />
        </v-col>

        <!-- Status Filter -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Status"
            variant="outlined"
            density="compact"
            :loading="loading"
            @update:model-value="handleFilterChange"
          />
        </v-col>

        <!-- Category Filter -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.category"
            :items="categoryOptions"
            label="Category"
            variant="outlined"
            density="compact"
            :loading="loading"
            @update:model-value="handleFilterChange"
          />
        </v-col>

        <!-- Amount Range Filter -->
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.minAmount"
            label="Min Amount"
            type="number"
            variant="outlined"
            density="compact"
            :loading="loading"
            @update:model-value="handleFilterChange"
            prepend-inner-icon="mdi-currency-usd"
          />
        </v-col>
      </v-row>

      <v-row>
        <!-- Search Filter -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.search"
            label="Search transactions..."
            variant="outlined"
            density="compact"
            :loading="loading"
            @update:model-value="handleSearchChange"
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>

        <!-- Student Filter -->
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.studentId"
            :items="studentOptions"
            label="Student"
            variant="outlined"
            density="compact"
            :loading="loading"
            @update:model-value="handleFilterChange"
            clearable
          />
        </v-col>

        <!-- Reference Filter -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.reference"
            label="Reference"
            variant="outlined"
            density="compact"
            :loading="loading"
            @update:model-value="handleFilterChange"
            prepend-inner-icon="mdi-tag"
            clearable
          />
        </v-col>
      </v-row>

      <!-- Quick Filter Chips -->
      <v-row class="mt-2">
        <v-col cols="12">
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="chip in quickFilterChips"
              :key="chip.value"
              :color="chip.active ? 'primary' : 'default'"
              variant="outlined"
              @click="applyQuickFilter(chip)"
              :disabled="loading"
            >
              {{ chip.label }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Results Count -->
      <v-row class="mt-3">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2 text-medium-emphasis">
              Showing {{ resultsCount }} transactions
            </span>
            <v-btn 
              color="primary" 
              @click="applyFilters"
              :loading="loading"
              :disabled="!hasActiveFilters"
            >
              Apply Filters
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Filters {
  dateRange: string[]
  type: string
  status: string
  category: string
  minAmount: string
  search: string
  studentId: string
  reference: string
}

interface QuickFilterChip {
  label: string
  value: string
  active: boolean
  filters: Partial<Filters>
}

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'apply-filters': [filters: Filters]
}>()

// Reactive data
const dateMenu = ref(false)
const filters = ref<Filters>({
  dateRange: [],
  type: 'all',
  status: 'all',
  category: 'all',
  minAmount: '',
  search: '',
  studentId: '',
  reference: ''
})

// Filter options
const typeOptions = [
  { title: 'All Types', value: 'all' },
  { title: 'Revenue', value: 'revenue' },
  { title: 'Expense', value: 'expense' }
]

const statusOptions = [
  { title: 'All Statuses', value: 'all' },
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
  { title: 'Failed', value: 'failed' }
]

const categoryOptions = [
  { title: 'All Categories', value: 'all' },
  { title: 'Tuition', value: 'Tuition' },
  { title: 'Course Fees', value: 'Course Fees' },
  { title: 'Supplies', value: 'Supplies' },
  { title: 'Equipment', value: 'Equipment' },
  { title: 'Utilities', value: 'Utilities' },
  { title: 'Rent', value: 'Rent' },
  { title: 'Other', value: 'Other' }
]

const studentOptions = [
  { title: 'John Doe', value: 'STU-001' },
  { title: 'Jane Smith', value: 'STU-002' },
  { title: 'Mike Johnson', value: 'STU-003' }
]

// Quick filter chips
const quickFilterChips = ref<QuickFilterChip[]>([
  {
    label: 'This Month',
    value: 'this-month',
    active: false,
    filters: {
      dateRange: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ]
    }
  },
  {
    label: 'This Quarter',
    value: 'this-quarter',
    active: false,
    filters: {
      dateRange: [
        new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ]
    }
  },
  {
    label: 'Revenue Only',
    value: 'revenue-only',
    active: false,
    filters: { type: 'revenue' }
  },
  {
    label: 'Expenses Only',
    value: 'expenses-only',
    active: false,
    filters: { type: 'expense' }
  },
  {
    label: 'Pending',
    value: 'pending',
    active: false,
    filters: { status: 'pending' }
  }
])

// Computed properties
const dateRangeText = computed(() => {
  if (!filters.value.dateRange || filters.value.dateRange.length === 0) {
    return 'Select date range'
  }
  if (filters.value.dateRange.length === 1) {
    return new Date(filters.value.dateRange[0]).toLocaleDateString()
  }
  return `${new Date(filters.value.dateRange[0]).toLocaleDateString()} - ${new Date(filters.value.dateRange[1]).toLocaleDateString()}`
})

const hasActiveFilters = computed(() => {
  return filters.value.dateRange.length > 0 ||
         filters.value.type !== 'all' ||
         filters.value.status !== 'all' ||
         filters.value.category !== 'all' ||
         filters.value.minAmount !== '' ||
         filters.value.search !== '' ||
         filters.value.studentId !== '' ||
         filters.value.reference !== ''
})

const resultsCount = ref(0)

// Methods
const handleDateChange = () => {
  dateMenu.value = false
  handleFilterChange()
}

const handleFilterChange = () => {
  // Reset quick filter chips
  quickFilterChips.value.forEach(chip => chip.active = false)
}

const handleSearchChange = () => {
  // Debounced search could be implemented here
  handleFilterChange()
}

const applyQuickFilter = (chip: QuickFilterChip) => {
  // Toggle chip active state
  chip.active = !chip.active
  
  // Apply or remove quick filter
  if (chip.active) {
    Object.assign(filters.value, chip.filters)
  } else {
    // Reset to default values
    if (chip.filters.dateRange) filters.value.dateRange = []
    if (chip.filters.type) filters.value.type = 'all'
    if (chip.filters.status) filters.value.status = 'all'
  }
  
  handleFilterChange()
}

const clearFilters = () => {
  filters.value = {
    dateRange: [],
    type: 'all',
    status: 'all',
    category: 'all',
    minAmount: '',
    search: '',
    studentId: '',
    reference: ''
  }
  
  // Reset quick filter chips
  quickFilterChips.value.forEach(chip => chip.active = false)
  
  emit('apply-filters', filters.value)
}

const applyFilters = () => {
  emit('apply-filters', filters.value)
}

// Watch for filter changes and emit events
watch(filters, () => {
  // In a real app, you might want to debounce this
}, { deep: true })

// Expose methods for parent component
defineExpose({
  clearFilters,
  applyFilters
})
</script>

<style scoped>
.filter-bar {
  border-radius: 12px;
  margin-bottom: 16px;
}

.v-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
}
</style> 