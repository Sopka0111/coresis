<template>
  <v-card elevation="2" class="student-stats-chart">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 d-flex align-center">
        <v-icon left color="primary">mdi-chart-bar</v-icon>
        Student Statistics
      </span>
      <div class="d-flex align-center">
        <v-btn-toggle
          v-model="selectedChartType"
          mandatory
          density="compact"
          class="mr-2"
        >
          <v-btn value="bar" size="small">
            <v-icon>mdi-chart-bar</v-icon>
          </v-btn>
          <v-btn value="pie" size="small">
            <v-icon>mdi-chart-pie</v-icon>
          </v-btn>
          <v-btn value="doughnut" size="small">
            <v-icon>mdi-chart-donut</v-icon>
          </v-btn>
        </v-btn-toggle>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="refreshChart"
          title="Refresh Chart"
          :disabled="loading"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="pa-4">
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
        class="mb-4"
      >
        <template #prepend>
          <v-icon>mdi-alert-circle</v-icon>
        </template>
        {{ error }}
        <template #append>
          <v-btn 
            variant="text" 
            color="error"
            @click="refreshChart"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>

      <!-- Chart Container -->
      <div v-else class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- Summary Cards -->
      <v-row class="mt-6" v-if="!loading && !error">
        <v-col cols="12" sm="6" md="3" v-for="stat in summaryStats" :key="stat.label">
          <v-card variant="outlined" class="text-center pa-3">
            <div class="text-h5 font-weight-bold" :class="`text-${stat.color}`">
              {{ stat.value }}
            </div>
            <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables, ChartConfiguration } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Types
interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

interface SummaryStat {
  label: string
  value: number | string
  color: string
}

interface Props {
  data?: ChartData
  loading?: boolean
  error?: string | null
  chartType?: 'bar' | 'pie' | 'doughnut'
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    labels: ['Pending', 'Enrolled', 'Active', 'Graduated', 'Withdrawn'],
    datasets: [{
      label: 'Students',
      data: [23, 45, 67, 34, 12],
      backgroundColor: [
        '#FF9800', // Orange for Pending
        '#2196F3', // Blue for Enrolled
        '#4CAF50', // Green for Active
        '#9C27B0', // Purple for Graduated
        '#F44336'  // Red for Withdrawn
      ],
      borderColor: [
        '#E68900',
        '#1976D2',
        '#388E3C',
        '#7B1FA2',
        '#D32F2F'
      ],
      borderWidth: 2
    }]
  }),
  loading: false,
  error: null,
  chartType: 'bar'
})

// Emits
const emit = defineEmits<{
  'refresh': []
  'chart-click': [label: string, value: number]
}>()

// Reactive data
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const selectedChartType = ref(props.chartType)
let chartInstance: Chart | null = null

// Computed properties
const summaryStats = computed((): SummaryStat[] => {
  if (!props.data || !props.data.datasets[0]) return []
  
  const data = props.data.datasets[0].data
  const labels = props.data.labels
  
  return [
    {
      label: 'Total Students',
      value: data.reduce((sum, val) => sum + val, 0),
      color: 'primary'
    },
    {
      label: 'Active Students',
      value: data[labels.indexOf('Active')] || 0,
      color: 'success'
    },
    {
      label: 'Pending Applications',
      value: data[labels.indexOf('Pending')] || 0,
      color: 'warning'
    },
    {
      label: 'Graduated',
      value: data[labels.indexOf('Graduated')] || 0,
      color: 'info'
    }
  ]
})

// Chart configuration
const getChartConfig = (): ChartConfiguration => {
  const isBarChart = selectedChartType.value === 'bar'
  
  return {
    type: selectedChartType.value as any,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !isBarChart,
          position: 'bottom' as const
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed.y || context.parsed
              return `${label}: ${value} students`
            }
          }
        }
      },
      scales: isBarChart ? {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: (value) => `${value} students`
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      } : undefined,
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const element = elements[0]
          const label = props.data.labels[element.index]
          const value = props.data.datasets[0].data[element.index]
          emit('chart-click', label, value)
        }
      }
    }
  }
}

// Methods
const initializeChart = async (): Promise<void> => {
  if (!chartCanvas.value) return

  await nextTick()

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Create new chart
  chartInstance = new Chart(chartCanvas.value, getChartConfig())
}

const refreshChart = (): void => {
  emit('refresh')
  console.log('Chart refresh requested')
}

const handleResize = (): void => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// Watchers
watch(selectedChartType, () => {
  initializeChart()
})

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
.student-stats-chart {
  border-radius: 12px;
}

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

.v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Custom chart styling */
:deep(.chart-container canvas) {
  border-radius: 8px;
}
</style> 