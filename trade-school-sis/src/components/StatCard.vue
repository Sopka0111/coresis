<template>
  <v-card 
    class="stat-card"
    :elevation="elevation"
    :color="cardColor"
    :variant="variant"
  >
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="stat-content">
          <div class="stat-label text-subtitle-2 text-medium-emphasis mb-1">
            {{ label }}
          </div>
          <div class="stat-value text-h4 font-weight-bold">
            {{ formattedValue }}
          </div>
          <div 
            v-if="change !== undefined" 
            class="stat-change d-flex align-center mt-1"
            :class="changeClass"
          >
            <v-icon 
              :icon="changeIcon" 
              size="small" 
              class="mr-1"
            />
            <span class="text-caption">{{ changeText }}</span>
          </div>
        </div>
        
        <div class="stat-icon">
          <v-avatar 
            :size="iconSize"
            :color="iconBackground"
            class="elevation-1"
          >
            <v-icon 
              :icon="icon" 
              :size="iconSize - 16"
              :color="iconColor"
            />
          </v-avatar>
        </div>
      </div>
      
      <!-- Optional progress bar -->
      <v-progress-linear
        v-if="showProgress && progress !== undefined"
        :model-value="progress"
        :color="progressColor"
        class="mt-3"
        height="4"
        rounded
      />
      
      <!-- Optional sparkline chart -->
      <div v-if="chartData && chartData.length" class="mt-3">
        <canvas 
          ref="chartCanvas"
          class="stat-chart"
          height="40"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  label: string
  value: number | string
  icon: string
  change?: number
  unit?: string
  precision?: number
  color?: string
  variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
  elevation?: number
  iconSize?: number
  showProgress?: boolean
  progress?: number
  chartData?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  color: 'surface',
  variant: 'elevated',
  elevation: 2,
  iconSize: 56,
  showProgress: false,
  precision: 0
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

// Computed properties
const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  const num = Number(props.value)
  if (isNaN(num)) return props.value
  
  let formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: props.precision,
    maximumFractionDigits: props.precision
  })
  
  if (props.unit) {
    formatted += ` ${props.unit}`
  }
  
  return formatted
})

const changeClass = computed(() => {
  if (props.change === undefined) return ''
  return props.change >= 0 ? 'text-success' : 'text-error'
})

const changeIcon = computed(() => {
  if (props.change === undefined) return ''
  return props.change >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
})

const changeText = computed(() => {
  if (props.change === undefined) return ''
  const abs = Math.abs(props.change)
  const direction = props.change >= 0 ? 'increase' : 'decrease'
  return `${abs.toFixed(1)}% ${direction}`
})

const cardColor = computed(() => {
  if (props.color === 'primary') return 'primary'
  if (props.color === 'secondary') return 'secondary'
  if (props.color === 'wellness') return 'wellness-light'
  return 'surface'
})

const iconBackground = computed(() => {
  if (props.color === 'primary') return 'primary'
  if (props.color === 'secondary') return 'secondary'
  if (props.color === 'wellness') return 'wellness-dark'
  return 'primary'
})

const iconColor = computed(() => {
  return 'white'
})

const progressColor = computed(() => {
  if (props.color === 'primary') return 'primary'
  if (props.color === 'secondary') return 'secondary'
  if (props.color === 'wellness') return 'wellness-dark'
  return 'primary'
})

// Chart creation
const createChart = () => {
  if (!chartCanvas.value || !props.chartData?.length) return
  
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: props.chartData.map((_, i) => i),
      datasets: [{
        data: props.chartData,
        borderColor: '#8BC34A',
        backgroundColor: 'rgba(139, 195, 74, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  if (props.chartData?.length) {
    createChart()
  }
})

watch(() => props.chartData, () => {
  createChart()
}, { deep: true })
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  line-height: 1.2;
}

.stat-chart {
  width: 100%;
}

.stat-change {
  font-weight: 500;
}
</style>