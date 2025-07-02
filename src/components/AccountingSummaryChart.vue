<template>
  <v-card class="accounting-summary-chart">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">
        <v-icon left color="primary">mdi-chart-pie</v-icon>
        Financial Summary
      </span>
      <div class="d-flex gap-2">
        <v-btn-group variant="outlined" density="compact">
          <v-btn
            :color="chartType === 'pie' ? 'primary' : undefined"
            @click="setChartType('pie')"
            size="small"
          >
            Pie
          </v-btn>
          <v-btn
            :color="chartType === 'doughnut' ? 'primary' : undefined"
            @click="setChartType('doughnut')"
            size="small"
          >
            Doughnut
          </v-btn>
          <v-btn
            :color="chartType === 'bar' ? 'primary' : undefined"
            @click="setChartType('bar')"
            size="small"
          >
            Bar
          </v-btn>
        </v-btn-group>
        <v-btn
          color="primary"
          variant="outlined"
          @click="refreshChart"
          :loading="isLoading"
          size="small"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <!-- Chart Legend -->
      <div class="chart-legend mt-4">
        <div class="d-flex flex-wrap gap-4 justify-center">
          <div
            v-for="(label, index) in chartData.labels"
            :key="index"
            class="d-flex align-center"
          >
            <div
              class="legend-color mr-2"
              :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
            ></div>
            <span class="text-body-2 font-weight-medium">
              {{ label }}: ${{ chartData.datasets[0].data[index]?.toLocaleString() || '0' }}
            </span>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Summary Cards -->
    <v-card-actions class="pa-4">
      <v-row class="w-100">
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center">
            <div class="text-h6 font-weight-bold text-success">
              ${{ totalRevenue.toLocaleString() }}
            </div>
            <div class="text-caption text-medium-emphasis">Total Revenue</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center">
            <div class="text-h6 font-weight-bold text-error">
              ${{ totalExpenses.toLocaleString() }}
            </div>
            <div class="text-caption text-medium-emphasis">Total Expenses</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center">
            <div class="text-h6 font-weight-bold text-info">
              ${{ netIncome.toLocaleString() }}
            </div>
            <div class="text-caption text-medium-emphasis">Net Income</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center">
            <div class="text-h6 font-weight-bold text-warning">
              {{ pendingCount }}
            </div>
            <div class="text-caption text-medium-emphasis">Pending Transactions</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables, ChartConfiguration } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

interface ChartData {
  labels: string[]
  datasets: Array<{
    backgroundColor: string[]
    data: number[]
    label: string
  }>
}

interface Props {
  data: ChartData
}

const props = defineProps<Props>()

// Reactive data
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartType = ref<'pie' | 'doughnut' | 'bar'>('pie')
const isLoading = ref(false)
let chartInstance: Chart | null = null

// Computed properties
const chartData = computed(() => props.data)

const totalRevenue = computed(() => {
  const revenueIndex = chartData.value.labels.indexOf('Revenue')
  return revenueIndex !== -1 ? chartData.value.datasets[0].data[revenueIndex] : 0
})

const totalExpenses = computed(() => {
  const expensesIndex = chartData.value.labels.indexOf('Expenses')
  return expensesIndex !== -1 ? chartData.value.datasets[0].data[expensesIndex] : 0
})

const netIncome = computed(() => totalRevenue.value - totalExpenses.value)

const pendingCount = computed(() => {
  const pendingIndex = chartData.value.labels.indexOf('Pending')
  return pendingIndex !== -1 ? chartData.value.datasets[0].data[pendingIndex] : 0
})

// Chart configuration
const getChartConfig = (): ChartConfiguration => {
  const isBarChart = chartType.value === 'bar'
  
  return {
    type: chartType.value,
    data: {
      labels: chartData.value.labels,
      datasets: [{
        label: chartData.value.datasets[0].label,
        data: chartData.value.datasets[0].data,
        backgroundColor: isBarChart ? chartData.value.datasets[0].backgroundColor[0] : chartData.value.datasets[0].backgroundColor,
        borderColor: isBarChart ? undefined : chartData.value.datasets[0].backgroundColor,
        borderWidth: isBarChart ? undefined : 2,
        hoverBackgroundColor: isBarChart ? undefined : chartData.value.datasets[0].backgroundColor.map(color => color + 'CC'),
        hoverBorderColor: isBarChart ? undefined : chartData.value.datasets[0].backgroundColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // We have custom legend
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || context.raw
              const numValue = typeof value === 'number' ? value : 0
              return `${label}: $${numValue.toLocaleString()}`
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
      } : undefined,
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
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

const setChartType = async (type: 'pie' | 'doughnut' | 'bar') => {
  chartType.value = type
  await initializeChart()
}

const refreshChart = async (): Promise<void> => {
  isLoading.value = true
  
  try {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real app, this would fetch new data
    // const newData = await fetchChartData()
    // chartData.value = newData
    
    await initializeChart()
  } catch (error) {
    console.error('Error refreshing chart:', error)
  } finally {
    isLoading.value = false
  }
}

const handleResize = (): void => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

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

// Watch for data changes
watch(() => props.data, () => {
  initializeChart()
}, { deep: true })

// Watch for chart type changes
watch(chartType, () => {
  initializeChart()
})
</script>

<style scoped>
.accounting-summary-chart {
  border-radius: 12px;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.chart-legend {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .chart-container {
    height: 300px;
  }
}

.v-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style> 