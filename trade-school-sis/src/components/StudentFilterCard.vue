<template>
  <v-card elevation="2" class="student-filter-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 d-flex align-center">
        <v-icon left color="primary">mdi-account-search</v-icon>
        Student Search & Filters
        <v-badge
          v-if="showBadge && totalResults > 0"
          :content="totalResults > 999 ? '999+' : totalResults.toString()"
          color="primary"
          class="ml-2"
        />
      </span>
      <div class="d-flex align-center">
        <v-btn 
          icon 
          size="small"
          variant="text"
          @click="resetFilters"
          title="Reset Filters"
          :disabled="loading"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn 
          icon 
          color="primary"
          @click="handleAdvancedSearch"
          title="Advanced Search"
          :disabled="loading"
        >
          <v-icon>mdi-magnify</v-icon>
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
            @click="performSearch"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>

      <!-- Filter Content -->
      <div v-else>
        <!-- Search Bar -->
        <div class="pa-4 pb-2">
          <v-text-field
            v-model="searchQuery"
            label="Search Students"
            placeholder="Search by name, email, phone, or ID..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="handleSearchChange"
            @keyup.enter="performSearch"
          />
        </div>

        <!-- Filter Grid -->
        <div class="pa-4 pt-0">
          <v-row>
            <!-- Campus Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.campus"
                :items="campusOptions"
                label="Campus"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Term Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.term"
                :items="termOptions"
                label="Term"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Program Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.program"
                :items="programOptions"
                label="Program"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Session Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.session"
                :items="sessionOptions"
                label="Session"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Student Status Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.studentStatus"
                :items="studentStatusOptions"
                label="Student Status"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Student Group Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.studentGroup"
                :items="studentGroupOptions"
                label="Student Group"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Lead Source Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.leadSource"
                :items="leadSourceOptions"
                label="Lead Source"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Admission Rep Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.admissionRep"
                :items="admissionRepOptions"
                label="Admission Rep"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- ID Type Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.idType"
                :items="idTypeOptions"
                label="ID Type"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- ID Number Filter -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="filters.idNumber"
                label="ID Number"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Lead Entry Start Date -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="filters.leadEntryStartDate"
                label="Lead Entry Start Date"
                type="date"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>

            <!-- Lead Entry End Date -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="filters.leadEntryEndDate"
                label="Lead Entry End Date"
                type="date"
                density="compact"
                variant="outlined"
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>
          </v-row>

          <!-- Checkbox Controls -->
          <v-row class="mt-4">
            <v-col cols="12" sm="6" md="3">
              <v-checkbox
                v-model="filters.showArchived"
                label="Show Archived"
                density="compact"
                @update:model-value="handleFilterChange"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-checkbox
                v-model="filters.showUnassigned"
                label="Show Unassigned"
                density="compact"
                @update:model-value="handleFilterChange"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-checkbox
                v-model="filters.studentsInRegistrar"
                label="Students In Registrar"
                density="compact"
                @update:model-value="handleFilterChange"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-checkbox
                v-model="filters.includeInactive"
                label="Include Inactive"
                density="compact"
                @update:model-value="handleFilterChange"
              />
            </v-col>
          </v-row>

          <!-- Action Buttons -->
          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end">
              <v-btn
                variant="outlined"
                color="secondary"
                @click="resetFilters"
                :disabled="loading"
                class="mr-2"
              >
                <v-icon left>mdi-refresh</v-icon>
                Reset
              </v-btn>
              <v-btn
                color="primary"
                @click="performSearch"
                :loading="loading"
              >
                <v-icon left>mdi-magnify</v-icon>
                Search
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Results Summary -->
        <v-divider v-if="hasResults" />
        <div v-if="hasResults" class="pa-4 pt-2">
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-account-group</v-icon>
              <span class="text-body-2">
                {{ totalResults }} student{{ totalResults !== 1 ? 's' : '' }} found
              </span>
            </div>
            <v-btn
              variant="text"
              color="primary"
              @click="handleViewAll"
            >
              View All Results
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// Types
interface StudentFilters {
  campus: string
  term: string
  program: string
  session: string
  studentStatus: string
  studentGroup: string
  leadSource: string
  admissionRep: string
  idType: string
  idNumber: string
  leadEntryStartDate: string
  leadEntryEndDate: string
  showArchived: boolean
  showUnassigned: boolean
  studentsInRegistrar: boolean
  includeInactive: boolean
}

interface SearchResult {
  id: string
  name: string
  email: string
  phone: string
  campus: string
  program: string
  status: string
  leadSource: string
  admissionRep: string
  leadEntryDate: string
}

// Props
interface Props {
  showBadge?: boolean
  autoSearch?: boolean
  apiEndpoint?: string
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  showBadge: true,
  autoSearch: false,
  apiEndpoint: '/api/students/search',
  debounceMs: 500
})

// Emits
const emit = defineEmits<{
  'search': [filters: StudentFilters, query: string]
  'filter-change': [filters: StudentFilters]
  'reset': []
  'view-all': []
  'search-error': [error: string]
}>()

// Reactive data
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const totalResults = ref(0)
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Filter options
const filters = ref<StudentFilters>({
  campus: '',
  term: '',
  program: '',
  session: '',
  studentStatus: '',
  studentGroup: '',
  leadSource: '',
  admissionRep: '',
  idType: '',
  idNumber: '',
  leadEntryStartDate: '',
  leadEntryEndDate: '',
  showArchived: false,
  showUnassigned: false,
  studentsInRegistrar: false,
  includeInactive: false
})

// Sample filter options
const campusOptions = [
  { title: 'Main Campus', value: 'main' },
  { title: 'Downtown Campus', value: 'downtown' },
  { title: 'Online Campus', value: 'online' }
]

const termOptions = [
  { title: 'Fall 2025', value: 'fall-2025' },
  { title: 'Spring 2025', value: 'spring-2025' },
  { title: 'Summer 2025', value: 'summer-2025' }
]

const programOptions = [
  { title: 'Massage Therapy', value: 'massage-therapy' },
  { title: 'Advanced Massage', value: 'advanced-massage' },
  { title: 'Spa Management', value: 'spa-management' },
  { title: 'Wellness Coaching', value: 'wellness-coaching' }
]

const sessionOptions = [
  { title: 'Morning Session', value: 'morning' },
  { title: 'Afternoon Session', value: 'afternoon' },
  { title: 'Evening Session', value: 'evening' },
  { title: 'Weekend Session', value: 'weekend' }
]

const studentStatusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'Graduated', value: 'graduated' },
  { title: 'Withdrawn', value: 'withdrawn' },
  { title: 'On Hold', value: 'on-hold' }
]

const studentGroupOptions = [
  { title: 'New Students', value: 'new' },
  { title: 'Returning Students', value: 'returning' },
  { title: 'International Students', value: 'international' },
  { title: 'Veterans', value: 'veterans' }
]

const leadSourceOptions = [
  { title: 'Website', value: 'website' },
  { title: 'Social Media', value: 'social-media' },
  { title: 'Referral', value: 'referral' },
  { title: 'Advertisement', value: 'advertisement' },
  { title: 'Walk-in', value: 'walk-in' }
]

const admissionRepOptions = [
  { title: 'All Representatives', value: '' },
  { title: 'Wang, Jason', value: 'wang-jason' },
  { title: 'Smith, Sarah', value: 'smith-sarah' },
  { title: 'Johnson, Mike', value: 'johnson-mike' }
]

const idTypeOptions = [
  { title: 'ADM ID', value: 'adm-id' },
  { title: 'SIS Number', value: 'sis-number' },
  { title: 'SSN', value: 'ssn' },
  { title: 'Student ID', value: 'student-id' }
]

// Computed properties
const hasResults = computed(() => totalResults.value > 0)

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => 
    value !== '' && value !== false
  ) || searchQuery.value !== ''
})

// Methods
const performSearch = async (): Promise<void> => {
  if (!props.apiEndpoint) {
    // Simulate search results
    totalResults.value = Math.floor(Math.random() * 100) + 10
    return
  }

  loading.value = true
  error.value = null

  try {
    const searchParams = new URLSearchParams({
      q: searchQuery.value,
      ...Object.fromEntries(
        Object.entries(filters.value).filter(([_, value]) => 
          value !== '' && value !== false
        )
      )
    })

    const response = await fetch(`${props.apiEndpoint}?${searchParams}`)
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    totalResults.value = data.total || data.length || 0
    
    emit('search', filters.value, searchQuery.value)
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Search failed'
    error.value = errorMessage
    emit('search-error', errorMessage)
    console.error('Search error:', err)
  } finally {
    loading.value = false
  }
}

const handleSearchChange = (): void => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (props.autoSearch) {
    searchTimeout.value = setTimeout(() => {
      performSearch()
    }, props.debounceMs)
  }
}

const handleFilterChange = (): void => {
  emit('filter-change', filters.value)
  
  if (props.autoSearch) {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    searchTimeout.value = setTimeout(() => {
      performSearch()
    }, props.debounceMs)
  }
}

const resetFilters = (): void => {
  searchQuery.value = ''
  filters.value = {
    campus: '',
    term: '',
    program: '',
    session: '',
    studentStatus: '',
    studentGroup: '',
    leadSource: '',
    admissionRep: '',
    idType: '',
    idNumber: '',
    leadEntryStartDate: '',
    leadEntryEndDate: '',
    showArchived: false,
    showUnassigned: false,
    studentsInRegistrar: false,
    includeInactive: false
  }
  
  totalResults.value = 0
  error.value = null
  
  emit('reset')
  console.log('Filters reset')
}

const handleAdvancedSearch = (): void => {
  performSearch()
  console.log('Advanced search triggered')
}

const handleViewAll = (): void => {
  emit('view-all')
  console.log('View all results clicked')
}

// Lifecycle
onMounted(() => {
  console.log('StudentFilterCard mounted')
})

// Watch for filter changes
watch(filters, () => {
  handleFilterChange()
}, { deep: true })
</script>

<style scoped>
.student-filter-card {
  border-radius: 12px;
}

.v-select,
.v-text-field {
  font-size: 0.875rem;
}

.v-checkbox {
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