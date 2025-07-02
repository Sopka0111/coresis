<template>
  <v-card class="pa-4">
    <v-card-title class="d-flex justify-space-between align-center mb-4">
      <span class="text-h5">Financial Trends & Balance Analysis</span>
      <div class="d-flex align-center gap-2">
        <v-select
          v-model="selectedChartType"
          :items="chartTypeOptions"
          variant="outlined"
          density="compact"
          style="width: 150px"
          @update:model-value="updateChartType"
        />
        <v-btn 
          color="primary" 
          variant="outlined"
          size="small"
          @click="refreshChart"
        >
          <v-icon left>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </div>
    </v-card-title>
    
    <v-card-text>
      <!-- Summary Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-3">
            <div class="text-h6 font-weight-bold text-success">${{ formatCurrency(summary.totalRevenue) }}</div>
            <div class="text-subtitle-2">Total Revenue</div>
            <div class="text-caption text-success">
              <v-icon size="small">mdi-trending-up</v-icon>
              +{{ summary.revenueGrowth }}% this month
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-3">
            <div class="text-h6 font-weight-bold text-error">${{ formatCurrency(summary.outstandingBalance) }}</div>
            <div class="text-subtitle-2">Outstanding Balance</div>
            <div class="text-caption text-error">
              <v-icon size="small">mdi-trending-down</v-icon>
              -{{ summary.balanceReduction }}% this month
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-3">
            <div class="text-h6 font-weight-bold text-primary">{{ summary.totalStudents }}</div>
            <div class="text-subtitle-2">Active Students</div>
            <div class="text-caption text-primary">
              <v-icon size="small">mdi-account-plus</v-icon>
              +{{ summary.newStudents }} new this month
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-3">
            <div class="text-h6 font-weight-bold text-warning">{{ summary.pendingPayments }}</div>
            <div class="text-subtitle-2">Pending Payments</div>
            <div class="text-caption text-warning">
              <v-icon size="small">mdi-clock</v-icon>
              {{ summary.avgPaymentTime }} days avg
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Chart Container -->
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- Chart Controls -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-subtitle-2 mb-2">Time Period</v-card-title>
            <v-btn-toggle
              v-model="selectedPeriod"
              mandatory
              @update:model-value="updatePeriod"
            >
              <v-btn value="7d">7 Days</v-btn>
              <v-btn value="30d">30 Days</v-btn>
              <v-btn value="90d">90 Days</v-btn>
              <v-btn value="1y">1 Year</v-btn>
            </v-btn-toggle>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-subtitle-2 mb-2">Data Type</v-card-title>
            <v-btn-toggle
              v-model="selectedDataType"
              mandatory
              @update:model-value="updateDataType"
            >
              <v-btn value="balance">Balance</v-btn>
              <v-btn value="revenue">Revenue</v-btn>
              <v-btn value="payments">Payments</v-btn>
            </v-btn-toggle>
          </v-card>
        </v-col>
      </v-row>

      <!-- Balance Breakdown -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-subtitle-2 mb-2">Balance Distribution</v-card-title>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption">Negative Balance (Owed)</span>
              <span class="text-caption font-weight-bold text-error">
                {{ breakdown.negativeCount }} students
              </span>
            </div>
            <v-progress-linear
              :model-value="breakdown.negativePercentage"
              color="error"
              height="8"
              rounded
            />
            
            <div class="d-flex justify-space-between align-center mb-2 mt-3">
              <span class="text-caption">Zero Balance (Paid)</span>
              <span class="text-caption font-weight-bold text-success">
                {{ breakdown.zeroCount }} students
              </span>
            </div>
            <v-progress-linear
              :model-value="breakdown.zeroPercentage"
              color="success"
              height="8"
              rounded
            />
            
            <div class="d-flex justify-space-between align-center mb-2 mt-3">
              <span class="text-caption">Positive Balance (Credit)</span>
              <span class="text-caption font-weight-bold text-info">
                {{ breakdown.positiveCount }} students
              </span>
            </div>
            <v-progress-linear
              :model-value="breakdown.positivePercentage"
              color="info"
              height="8"
              rounded
            />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-subtitle-2 mb-2">Top Programs by Revenue</v-card-title>
            <div v-for="program in topPrograms" :key="program.name" class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption">{{ program.name }}</span>
                <span class="text-caption font-weight-bold">${{ formatCurrency(program.revenue) }}</span>
              </div>
              <v-progress-linear
                :model-value="program.percentage"
                :color="program.color"
                height="6"
                rounded
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch, computed } from 'vue'
import { Chart, registerables, ChartConfiguration } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Type definitions
interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
  }>
}

interface Summary {
  totalRevenue: number
  outstandingBalance: number
  totalStudents: number
  pendingPayments: number
  revenueGrowth: number
  balanceReduction: number
  newStudents: number
  avgPaymentTime: number
}

interface Breakdown {
  negativeCount: number
  zeroCount: number
  positiveCount: number
  negativePercentage: number
  zeroPercentage: number
  positivePercentage: number
}

interface TopProgram {
  name: string
  revenue: number
  percentage: number
  color: string
}

interface ChartProps {
  data?: ChartData
  options?: ChartConfiguration['options']
  summary?: Summary
  breakdown?: Breakdown
  topPrograms?: TopProgram[]
}

// Props for customization
const props = withDefaults(defineProps<ChartProps>(), {
  data: () => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [45000, 52000, 48000, 61000, 55000, 68000],
      backgroundColor: 'rgba(0, 194, 146, 0.2)',
      borderColor: '#00c292',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  }),
  options: () => ({}),
  summary: () => ({
    totalRevenue: 325000,
    outstandingBalance: 45000,
    totalStudents: 156,
    pendingPayments: 23,
    revenueGrowth: 12.5,
    balanceReduction: 8.3,
    newStudents: 18,
    avgPaymentTime: 3.2
  }),
  breakdown: () => ({
    negativeCount: 45,
    zeroCount: 89,
    positiveCount: 22,
    negativePercentage: 29,
    zeroPercentage: 57,
    positivePercentage: 14
  }),
  topPrograms: () => [
    { name: 'Massage Therapy', revenue: 180000, percentage: 55, color: '#00c292' },
    { name: 'Ayurveda', revenue: 85000, percentage: 26, color: '#fb9678' },
    { name: 'Energy Healing', revenue: 45000, percentage: 14, color: '#022561' },
    { name: 'Holistic Nutrition', revenue: 15000, percentage: 5, color: '#e46a76' }
  ]
})

// Template refs
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Reactive data
const selectedChartType = ref('line')
const selectedPeriod = ref('30d')
const selectedDataType = ref('balance')

// Chart type options
const chartTypeOptions = [
  { title: 'Line Chart', value: 'line' },
  { title: 'Bar Chart', value: 'bar' },
  { title: 'Area Chart', value: 'area' },
  { title: 'Doughnut Chart', value: 'doughnut' }
]

// Computed properties
const summary = computed(() => props.summary)
const breakdown = computed(() => props.breakdown)
const topPrograms = computed(() => props.topPrograms)

// Default chart options
const defaultOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || ''
          const value = context.parsed.y || context.parsed
          return `${label}: $${value.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString()
        }
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}

// Initialize chart
const initializeChart = async (): Promise<void> => {
  if (!chartCanvas.value) return

  await nextTick()

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Create new chart
  chartInstance = new Chart(chartCanvas.value, {
    type: selectedChartType.value as any,
    data: props.data,
    options: {
      ...defaultOptions,
      ...props.options
    }
  })
}

// Update chart type
const updateChartType = (): void => {
  if (chartInstance) {
    chartInstance.destroy()
    initializeChart()
  }
}

// Update period
const updatePeriod = (): void => {
  // TODO: Implement period change logic
  console.log('Period changed to:', selectedPeriod.value)
  refreshChart()
}

// Update data type
const updateDataType = (): void => {
  // TODO: Implement data type change logic
  console.log('Data type changed to:', selectedDataType.value)
  refreshChart()
}

// Refresh chart data
const refreshChart = async (): Promise<void> => {
  // Simulate data refresh
  const newData = {
    ...props.data,
    datasets: [{
      ...props.data.datasets[0],
      data: props.data.datasets[0].data.map(() => Math.floor(Math.random() * 100000) + 20000)
    }]
  }
  
  if (chartInstance) {
    chartInstance.data = newData
    chartInstance.update('active')
  }
}

// Handle window resize
const handleResize = (): void => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// Format currency
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Watch for data changes
watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.data = props.data
    chartInstance.update('active')
  }
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  initializeChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

@media (max-width: 600px) {
  .chart-container {
    height: 300px;
  }
}

.gap-2 {
  gap: 8px;
}
</style> 