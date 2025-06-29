<template>
  <v-card class="pa-4">
    <v-card-title class="text-h5 mb-4">
      Financial Balance Overview
    </v-card-title>
    <v-card-text>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn 
        color="primary" 
        variant="outlined"
        @click="refreshChart"
      >
        <v-icon left>mdi-refresh</v-icon>
        Refresh Data
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { Chart, registerables, ChartConfiguration } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Type definitions
interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor?: string[]
    borderWidth?: number
  }>
}

interface ChartProps {
  data?: ChartData
  options?: ChartConfiguration['options']
}

// Props for customization
const props = withDefaults(defineProps<ChartProps>(), {
  data: () => ({
    labels: ['Positive Balance', 'Zero Balance', 'Outstanding Dues'],
    datasets: [{
      label: 'Student Balances',
      data: [35, 21, 14],
      backgroundColor: ['#00c292', '#022561', '#e46a76'],
      borderColor: ['#00a884', '#011f4a', '#d45a66'],
      borderWidth: 2
    }]
  }),
  options: () => ({})
})

// Template refs
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Default chart options
const defaultOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} students (${percentage}%)`
        }
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
    type: 'doughnut',
    data: props.data,
    options: {
      ...defaultOptions,
      ...props.options
    }
  })
}

// Refresh chart data
const refreshChart = async (): Promise<void> => {
  // Simulate data refresh
  const newData = {
    ...props.data,
    datasets: [{
      ...props.data.datasets[0],
      data: props.data.datasets[0].data.map(() => Math.floor(Math.random() * 50) + 1)
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

.v-card-actions {
  padding: 16px;
}
</style> 