<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">Financial Filters</span>
      <v-btn 
        color="primary" 
        variant="outlined" 
        size="small"
        @click="toggleAdvanced"
      >
        <v-icon left>{{ showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        {{ showAdvanced ? 'Hide' : 'Show' }} Advanced
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <!-- Basic Filters -->
      <v-row dense>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.campus"
            :items="campusOptions"
            label="Campus"
            clearable
            variant="outlined"
            density="compact"
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.program"
            :items="programOptions"
            label="Program"
            clearable
            variant="outlined"
            density="compact"
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Status"
            clearable
            variant="outlined"
            density="compact"
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.funding"
            :items="fundingOptions"
            label="Funding Type"
            clearable
            variant="outlined"
            density="compact"
            @update:model-value="applyFilters"
          />
        </v-col>
      </v-row>

      <!-- Search Bar -->
      <v-row dense class="mt-2">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.search"
            label="Search Students"
            placeholder="Name, Student ID, or Email"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.balanceRange"
            :items="balanceRangeOptions"
            label="Balance Range"
            variant="outlined"
            density="compact"
            @update:model-value="applyFilters"
          />
        </v-col>
      </v-row>

      <!-- Advanced Filters -->
      <v-expand-transition>
        <div v-show="showAdvanced">
          <v-divider class="my-4" />
          
          <v-row dense>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.term"
                :items="termOptions"
                label="Term"
                clearable
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.session"
                :items="sessionOptions"
                label="Session"
                clearable
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.group"
                :items="groupOptions"
                label="Student Group"
                clearable
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.paymentStatus"
                :items="paymentStatusOptions"
                label="Payment Status"
                clearable
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>
          </v-row>

          <!-- Balance Range Slider -->
          <v-row dense class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined" class="pa-3">
                <v-card-title class="text-subtitle-2 mb-2">Balance Range</v-card-title>
                <v-range-slider
                  v-model="balanceRange"
                  :min="-10000"
                  :max="10000"
                  :step="100"
                  show-ticks="always"
                  :tick-labels="['-$10K', '-$5K', '$0', '$5K', '$10K']"
                  @update:model-value="updateBalanceRange"
                />
                <div class="d-flex justify-space-between text-caption">
                  <span>${{ formatCurrency(balanceRange[0]) }}</span>
                  <span>${{ formatCurrency(balanceRange[1]) }}</span>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Date Range -->
          <v-row dense class="mt-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="filters.dateFrom"
                label="From Date"
                type="date"
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="filters.dateTo"
                label="To Date"
                type="date"
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>
          </v-row>

          <!-- Quick Filters -->
          <v-row dense class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined" class="pa-3">
                <v-card-title class="text-subtitle-2 mb-2">Quick Filters</v-card-title>
                <v-chip-group>
                  <v-chip
                    v-for="filter in quickFilters"
                    :key="filter.label"
                    :color="filter.active ? 'primary' : 'default'"
                    variant="elevated"
                    @click="toggleQuickFilter(filter)"
                  >
                    {{ filter.label }}
                  </v-chip>
                </v-chip-group>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <!-- Action Buttons -->
      <v-row dense class="mt-4">
        <v-col cols="auto">
          <v-btn 
            color="primary" 
            @click="applyFilters"
            :loading="loading"
          >
            <v-icon left>mdi-filter</v-icon>
            Apply Filters
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="secondary" 
            variant="outlined"
            @click="resetFilters"
          >
            <v-icon left>mdi-refresh</v-icon>
            Reset
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="info" 
            variant="outlined"
            @click="saveFilterPreset"
          >
            <v-icon left>mdi-content-save</v-icon>
            Save Preset
          </v-btn>
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <v-chip color="info" variant="elevated">
            {{ resultsCount }} results
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// Type definitions
interface Filters {
  campus?: string
  program?: string
  status?: string
  funding?: string
  search?: string
  balanceRange?: string
  term?: string
  session?: string
  group?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
}

interface QuickFilter {
  label: string
  key: string
  active: boolean
  filters: Partial<Filters>
}

// Props
const props = defineProps<{
  loading?: boolean
  resultsCount?: number
}>()

// Emits
const emit = defineEmits<{
  applyFilters: [filters: Filters]
  resetFilters: []
  savePreset: [filters: Filters, name: string]
}>()

// Reactive data
const showAdvanced = ref(false)
const balanceRange = ref([-5000, 5000])

const filters = reactive<Filters>({
  campus: '',
  program: '',
  status: '',
  funding: '',
  search: '',
  balanceRange: '',
  term: '',
  session: '',
  group: '',
  paymentStatus: '',
  dateFrom: '',
  dateTo: ''
})

// Filter options
const campusOptions = ['Main Campus', 'Downtown', 'Online', 'North Campus', 'South Campus']
const programOptions = ['Massage Therapy', 'Ayurveda', 'Energy Healing', 'Holistic Nutrition', 'Yoga Therapy']
const statusOptions = ['Enrolled', 'Graduated', 'Withdrawn', 'Dismissed', 'On Hold', 'Lead']
const fundingOptions = ['Self-Pay', 'Financial Aid', 'Scholarship', 'Grant', 'Veteran Benefits', 'Employer Sponsored']
const balanceRangeOptions = [
  { title: 'All Balances', value: '' },
  { title: 'Negative Balance (Owed)', value: 'negative' },
  { title: 'Zero Balance (Paid)', value: 'zero' },
  { title: 'Positive Balance (Credit)', value: 'positive' },
  { title: 'Custom Range', value: 'custom' }
]
const termOptions = ['Fall 2024', 'Spring 2024', 'Summer 2024', 'Fall 2023', 'Spring 2023']
const sessionOptions = ['Morning', 'Afternoon', 'Evening', 'Online', 'Weekend']
const groupOptions = ['Group A', 'Group B', 'Group C', 'Group D', 'Individual']
const paymentStatusOptions = ['Current', 'Past Due', 'Overdue', 'In Collections', 'Payment Plan']

// Quick filters
const quickFilters = ref<QuickFilter[]>([
  {
    label: 'Past Due',
    key: 'pastDue',
    active: false,
    filters: { paymentStatus: 'Past Due' }
  },
  {
    label: 'High Balance',
    key: 'highBalance',
    active: false,
    filters: { balanceRange: 'negative' }
  },
  {
    label: 'New Students',
    key: 'newStudents',
    active: false,
    filters: { term: 'Fall 2024' }
  },
  {
    label: 'Graduates',
    key: 'graduates',
    active: false,
    filters: { status: 'Graduated' }
  },
  {
    label: 'Financial Aid',
    key: 'financialAid',
    active: false,
    filters: { funding: 'Financial Aid' }
  }
])

// Methods
const toggleAdvanced = (): void => {
  showAdvanced.value = !showAdvanced.value
}

const applyFilters = (): void => {
  emit('applyFilters', { ...filters })
}

const resetFilters = (): void => {
  Object.keys(filters).forEach(key => {
    filters[key as keyof Filters] = ''
  })
  balanceRange.value = [-5000, 5000]
  quickFilters.value.forEach(filter => filter.active = false)
  emit('resetFilters')
}

const updateBalanceRange = (): void => {
  filters.balanceRange = 'custom'
  applyFilters()
}

const toggleQuickFilter = (filter: QuickFilter): void => {
  filter.active = !filter.active
  
  if (filter.active) {
    // Apply quick filter
    Object.assign(filters, filter.filters)
  } else {
    // Remove quick filter
    Object.keys(filter.filters).forEach(key => {
      if (filters[key as keyof Filters] === filter.filters[key as keyof Filters]) {
        filters[key as keyof Filters] = ''
      }
    })
  }
  
  applyFilters()
}

const saveFilterPreset = (): void => {
  const presetName = prompt('Enter preset name:')
  if (presetName) {
    emit('savePreset', { ...filters }, presetName)
  }
}

const formatCurrency = (amount: number): string => {
  return Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = (): void => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

// Lifecycle
onMounted(() => {
  // Set default date range to current month
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  filters.dateFrom = firstDay.toISOString().split('T')[0]
  filters.dateTo = lastDay.toISOString().split('T')[0]
})
</script>

<style scoped>
.v-range-slider {
  margin-top: 8px;
}

.v-chip-group {
  gap: 8px;
}
</style> 