<template>
  <v-card class="placement-chart-card">
    <v-card-title class="d-flex align-center">
      <v-icon left color="primary">mdi-chart-pie</v-icon>
      Placement Summary
      <v-spacer />
      <v-btn-group>
        <v-btn 
          :color="chartType === 'doughnut' ? 'primary' : 'default'"
          variant="outlined"
          size="small"
          @click="chartType = 'doughnut'"
        >
          <v-icon left>mdi-chart-donut</v-icon>
          Doughnut
        </v-btn>
        <v-btn 
          :color="chartType === 'bar' ? 'primary' : 'default'"
          variant="outlined"
          size="small"
          @click="chartType = 'bar'"
        >
          <v-icon left>mdi-chart-bar</v-icon>
          Bar
        </v-btn>
      </v-btn-group>
    </v-card-title>
    
    <v-card-text>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer />
      <v-btn 
        color="secondary" 
        variant="outlined"
        @click="exportChart"
      >
        <v-icon left>mdi-download</v-icon>
        Export Image
      </v-btn>
      <v-btn 
        color="primary" 
        variant="outlined"
        @click="refreshChart"
      >
        <v-icon left>mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { Chart, registerables, ChartConfiguration } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Types
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

interface Props {
  data: ChartData
}

const props = defineProps<Props>()

// Reactive data
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartType = ref<'doughnut' | 'bar'>('doughnut')
let chartInstance: Chart | null = null

// Chart colors
const chartColors = [
  '#00c292', // Success green
  '#fec107', // Warning yellow
  '#03a9f4', // Info blue
  '#e46a76', // Error red
  '#6c757d', // Grey
  '#17a2b8'  // Cyan
]

// Default chart options
const getDefaultOptions = (): ChartConfiguration['options'] => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || context.raw
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  if (chartType.value === 'doughnut') {
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins.legend,
          position: 'right' as const
        }
      }
    }
  } else {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            stepSize: 1
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
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

  // Prepare chart data
  const chartData = {
    labels: props.data.labels,
    datasets: [{
      label: props.data.datasets[0].label,
      data: props.data.datasets[0].data,
      backgroundColor: chartColors.slice(0, props.data.labels.length),
      borderColor: chartColors.slice(0, props.data.labels.length).map(color => 
        color + '80' // Add transparency
      ),
      borderWidth: 2
    }]
  }

  // Create new chart
  chartInstance = new Chart(chartCanvas.value, {
    type: chartType.value,
    data: chartData,
    options: getDefaultOptions()
  })
}

// Refresh chart data
const refreshChart = async (): Promise<void> => {
  if (chartInstance) {
    // Simulate data refresh
    const newData = props.data.datasets[0].data.map(() => 
      Math.floor(Math.random() * 50) + 10
    )
    
    chartInstance.data.datasets[0].data = newData
    chartInstance.update('active')
  }
}

// Export chart as image
const exportChart = (): void => {
  if (chartInstance) {
    const canvas = chartInstance.canvas
    const link = document.createElement('a')
    link.download = `placement-summary-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
}

// Handle window resize
const handleResize = (): void => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// Watch for chart type changes
watch(chartType, () => {
  initializeChart()
})

// Watch for data changes
watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.data = {
      labels: props.data.labels,
      datasets: [{
        label: props.data.datasets[0].label,
        data: props.data.datasets[0].data,
        backgroundColor: chartColors.slice(0, props.data.labels.length),
        borderColor: chartColors.slice(0, props.data.labels.length).map(color => 
          color + '80'
        ),
        borderWidth: 2
      }]
    }
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
.placement-chart-card {
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

.v-btn-group {
  border-radius: 8px;
  overflow: hidden;
}

.v-btn-group .v-btn {
  border-radius: 0;
  margin: 0;
}

.v-btn-group .v-btn:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.v-btn-group .v-btn:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style> 