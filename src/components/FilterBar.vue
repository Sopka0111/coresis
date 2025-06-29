<template>
  <v-card elevation="2" class="filter-bar">
    <v-card-text class="pa-4">
      <v-row dense>
        <!-- Program Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.program"
            :items="programOptions"
            label="Program"
            density="compact"
            variant="outlined"
            multiple
            chips
            closable-chips
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>

        <!-- Status Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Status"
            density="compact"
            variant="outlined"
            multiple
            chips
            closable-chips
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>

        <!-- Campus Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.campus"
            :items="campusOptions"
            label="Campus"
            density="compact"
            variant="outlined"
            multiple
            chips
            closable-chips
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>

        <!-- Search Field -->
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.search"
            label="Search Students"
            placeholder="Name, email, or ID..."
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:model-value="handleSearchChange"
            @keyup.enter="handleFilterChange"
          />
        </v-col>
      </v-row>

      <!-- Action Buttons -->
      <v-row class="mt-3">
        <v-col cols="12" class="d-flex justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="resetFilters"
            class="mr-2"
          >
            <v-icon left>mdi-refresh</v-icon>
            Reset
          </v-btn>
          <v-btn
            color="primary"
            @click="handleFilterChange"
          >
            <v-icon left>mdi-filter</v-icon>
            Apply Filters
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

// Types
interface FilterCriteria {
  program: string[]
  status: string[]
  campus: string[]
  search: string
}

// Props
interface Props {
  autoApply?: boolean
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoApply: true,
  debounceMs: 300
})

// Emits
const emit = defineEmits<{
  'filter': [criteria: FilterCriteria]
  'reset': []
}>()

// Reactive data
const filters = reactive<FilterCriteria>({
  program: [],
  status: [],
  campus: [],
  search: ''
})

let searchTimeout = ref<NodeJS.Timeout | null>(null)

// Filter options
const programOptions = [
  { title: 'Massage Therapy', value: 'massage-therapy' },
  { title: 'Advanced Massage', value: 'advanced-massage' },
  { title: 'Spa Management', value: 'spa-management' },
  { title: 'Wellness Coaching', value: 'wellness-coaching' },
  { title: 'Sports Massage', value: 'sports-massage' },
  { title: 'Therapeutic Massage', value: 'therapeutic-massage' }
]

const statusOptions = [
  { title: 'Pending', value: 'pending' },
  { title: 'Enrolled', value: 'enrolled' },
  { title: 'Active', value: 'active' },
  { title: 'Graduated', value: 'graduated' },
  { title: 'Withdrawn', value: 'withdrawn' },
  { title: 'On Hold', value: 'on-hold' },
  { title: 'Inactive', value: 'inactive' }
]

const campusOptions = [
  { title: 'Main Campus', value: 'main' },
  { title: 'Downtown Campus', value: 'downtown' },
  { title: 'Online Campus', value: 'online' },
  { title: 'West Campus', value: 'west' }
]

// Methods
const handleFilterChange = (): void => {
  emit('filter', { ...filters })
  console.log('Filters applied:', filters)
}

const handleSearchChange = (): void => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (props.autoApply) {
    searchTimeout.value = setTimeout(() => {
      handleFilterChange()
    }, props.debounceMs)
  }
}

const resetFilters = (): void => {
  filters.program = []
  filters.status = []
  filters.campus = []
  filters.search = ''
  
  emit('reset')
  emit('filter', { ...filters })
  console.log('Filters reset')
}

// Watch for filter changes
watch(filters, () => {
  if (props.autoApply) {
    handleFilterChange()
  }
}, { deep: true })
</script>

<style scoped>
.filter-bar {
  border-radius: 12px;
  margin-bottom: 16px;
}

.v-select,
.v-text-field {
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-col {
    padding: 8px;
  }
}

@media (max-width: 600px) {
  .v-col {
    padding: 4px;
  }
}
</style> 