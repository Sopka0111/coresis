<template>
  <v-card class="pa-4">
    <v-card-title class="text-h5 mb-4">
      Sales Data
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
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { Chart, registerables, ChartConfiguration } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Type definitions
interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string
    borderColor?: string
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
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sales',
      data: [40, 55, 30, 70, 45, 80],
      backgroundColor: '#1976D2',
      borderColor: '#1565C0',
      borderWidth: 1
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
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
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
    type: 'bar',
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
      data: props.data.datasets[0].data.map(() => Math.floor(Math.random() * 100))
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