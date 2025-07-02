<template>
  <v-card class="filter-card">
    <v-card-title class="d-flex align-center">
      <v-icon left color="primary">mdi-filter-variant</v-icon>
      Placement Filters
      <v-spacer />
      <v-btn 
        icon 
        @click="toggleExpanded"
        :aria-label="expanded ? 'Collapse filters' : 'Expand filters'"
      >
        <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-expand-transition>
      <div v-show="expanded">
        <v-card-text>
          <v-row dense>
            <!-- Campus Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.campus"
                :items="campusOptions"
                label="Campus"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- First Term Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.firstTerm"
                :items="termOptions"
                label="First Term"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- Program Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.program"
                :items="programOptions"
                label="Program"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- Session Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.session"
                :items="sessionOptions"
                label="Session"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- Status Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.status"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- Group Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.group"
                :items="groupOptions"
                label="Group"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- Employed Status Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.employedStatus"
                :items="employedStatusOptions"
                label="Employed Status"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- Placement Status Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.placementStatus"
                :items="placementStatusOptions"
                label="Placement Status"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
            
            <!-- Date Range Filter -->
            <v-col cols="12" sm="6" md="3">
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
                    label="Graduation Date Range"
                    variant="outlined"
                    density="compact"
                    readonly
                    v-bind="props"
                    prepend-inner-icon="mdi-calendar"
                    clearable
                    @click:clear="clearDateRange"
                  />
                </template>
                <v-date-picker
                  v-model="filters.dateRange"
                  range
                  @update:model-value="onDateRangeChange"
                />
              </v-menu>
            </v-col>
            
            <!-- Search Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="filters.search"
                label="Search Students"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                clearable
                @update:model-value="applyFilters"
                placeholder="Name, ID, or Email"
              />
            </v-col>
            
            <!-- Quick Filters -->
            <v-col cols="12">
              <v-chip-group>
                <v-chip
                  v-for="quickFilter in quickFilters"
                  :key="quickFilter.key"
                  :color="quickFilter.active ? 'primary' : 'default'"
                  variant="outlined"
                  @click="toggleQuickFilter(quickFilter.key)"
                  :disabled="loading"
                >
                  <v-icon left size="small">{{ quickFilter.icon }}</v-icon>
                  {{ quickFilter.label }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn 
            color="secondary" 
            variant="outlined"
            @click="resetFilters"
            :disabled="loading"
          >
            <v-icon left>mdi-refresh</v-icon>
            Reset All
          </v-btn>
          <v-btn 
            color="primary" 
            @click="applyFilters"
            :loading="loading"
          >
            <v-icon left>mdi-filter</v-icon>
            Apply Filters
          </v-btn>
        </v-card-actions>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// Props
interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  applyFilters: [filters: any]
}>()

// Reactive data
const expanded = ref(true)
const dateMenu = ref(false)

// Filter options
const campusOptions = [
  { title: 'Downtown', value: 'Downtown' },
  { title: 'West Campus', value: 'West Campus' },
  { title: 'East Campus', value: 'East Campus' },
  { title: 'Online', value: 'Online' }
]

const termOptions = [
  { title: 'Fall 2023', value: 'Fall 2023' },
  { title: 'Spring 2023', value: 'Spring 2023' },
  { title: 'Summer 2023', value: 'Summer 2023' },
  { title: 'Fall 2022', value: 'Fall 2022' },
  { title: 'Spring 2022', value: 'Spring 2022' }
]

const programOptions = [
  { title: 'Massage Therapy', value: 'Massage Therapy' },
  { title: 'Advanced Massage', value: 'Advanced Massage' },
  { title: 'Sports Massage', value: 'Sports Massage' },
  { title: 'Therapeutic Massage', value: 'Therapeutic Massage' }
]

const sessionOptions = [
  { title: 'Full-time', value: 'Full-time' },
  { title: 'Part-time', value: 'Part-time' },
  { title: 'Evening', value: 'Evening' },
  { title: 'Weekend', value: 'Weekend' }
]

const statusOptions = [
  { title: 'Graduated', value: 'Graduated' },
  { title: 'In Progress', value: 'In Progress' },
  { title: 'Withdrawn', value: 'Withdrawn' },
  { title: 'Suspended', value: 'Suspended' }
]

const groupOptions = [
  { title: 'Group A', value: 'A' },
  { title: 'Group B', value: 'B' },
  { title: 'Group C', value: 'C' },
  { title: 'Group D', value: 'D' }
]

const employedStatusOptions = [
  { title: 'Employed', value: 'Employed' },
  { title: 'Seeking', value: 'Seeking' },
  { title: 'Not Seeking', value: 'Not Seeking' },
  { title: 'Self-Employed', value: 'Self-Employed' }
]

const placementStatusOptions = [
  { title: 'Placed', value: 'Placed' },
  { title: 'Pending', value: 'Pending' },
  { title: 'Referred', value: 'Referred' },
  { title: 'Not Placed', value: 'Not Placed' }
]

// Quick filters
const quickFilters = ref([
  { key: 'recentGraduates', label: 'Recent Graduates', icon: 'mdi-school', active: false },
  { key: 'unemployed', label: 'Unemployed', icon: 'mdi-account-remove', active: false },
  { key: 'seeking', label: 'Seeking Work', icon: 'mdi-account-search', active: false },
  { key: 'employed', label: 'Employed', icon: 'mdi-briefcase-check', active: false },
  { key: 'overdue', label: 'Overdue Placement', icon: 'mdi-alert', active: false }
])

// Filters state
const filters = ref({
  campus: '',
  firstTerm: '',
  program: '',
  session: '',
  status: '',
  group: '',
  employedStatus: '',
  placementStatus: '',
  dateRange: [] as string[],
  search: ''
})

// Computed properties
const dateRangeText = computed(() => {
  if (!filters.value.dateRange || filters.value.dateRange.length === 0) {
    return ''
  }
  if (filters.value.dateRange.length === 1) {
    return new Date(filters.value.dateRange[0]).toLocaleDateString()
  }
  if (filters.value.dateRange.length === 2) {
    const start = new Date(filters.value.dateRange[0]).toLocaleDateString()
    const end = new Date(filters.value.dateRange[1]).toLocaleDateString()
    return `${start} - ${end}`
  }
  return ''
})

// Methods
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const applyFilters = () => {
  const activeFilters = { ...filters.value }
  
  // Apply quick filters
  quickFilters.value.forEach(qf => {
    if (qf.active) {
      switch (qf.key) {
        case 'recentGraduates':
          activeFilters.dateRange = [
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          ]
          break
        case 'unemployed':
          activeFilters.employedStatus = 'Not Seeking'
          break
        case 'seeking':
          activeFilters.employedStatus = 'Seeking'
          break
        case 'employed':
          activeFilters.employedStatus = 'Employed'
          break
        case 'overdue':
          activeFilters.placementStatus = 'Pending'
          break
      }
    }
  })
  
  emit('applyFilters', activeFilters)
}

const resetFilters = () => {
  filters.value = {
    campus: '',
    firstTerm: '',
    program: '',
    session: '',
    status: '',
    group: '',
    employedStatus: '',
    placementStatus: '',
    dateRange: [],
    search: ''
  }
  
  quickFilters.value.forEach(qf => qf.active = false)
  
  applyFilters()
}

const clearDateRange = () => {
  filters.value.dateRange = []
  applyFilters()
}

const onDateRangeChange = () => {
  dateMenu.value = false
  applyFilters()
}

const toggleQuickFilter = (key: string) => {
  const quickFilter = quickFilters.value.find(qf => qf.key === key)
  if (quickFilter) {
    quickFilter.active = !quickFilter.active
    applyFilters()
  }
}

// Watch for loading state changes
watch(() => props.loading, (newLoading) => {
  if (!newLoading) {
    // Reset loading states if needed
  }
})

// Initial filter application
onMounted(() => {
  applyFilters()
})
</script>

<style scoped>
.filter-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.v-chip-group {
  margin-top: 8px;
}

.v-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
}
</style> 