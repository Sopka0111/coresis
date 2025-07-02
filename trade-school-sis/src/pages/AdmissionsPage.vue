<template>
  <div class="admissions-page">
    <h1 class="text-h3 font-weight-bold text-primary mb-6">
      Admissions & Lead Management
    </h1>

    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title>Lead Pipeline</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="leadHeaders"
              :items="leads"
              :items-per-page="10"
            >
              <template #item.stage="{ item }">
                <v-chip
                  :color="getStageColor(item.stage)"
                  size="small"
                  variant="tonal"
                >
                  {{ item.stage }}
                </v-chip>
              </template>
              <template #item.priority="{ item }">
                <v-icon
                  :icon="getPriorityIcon(item.priority)"
                  :color="getPriorityColor(item.priority)"
                />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-btn color="primary" variant="elevated" block class="mb-3">
              Add New Lead
            </v-btn>
            <v-btn color="secondary" variant="outlined" block>
              Import Leads
            </v-btn>
          </v-card-text>
        </v-card>
        
        <v-card elevation="2">
          <v-card-title>Lead Statistics</v-card-title>
          <v-card-text>
            <StatCard
              label="Total Leads"
              :value="leadStats.total"
              icon="mdi-account-multiple"
              color="primary"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatCard from '@/components/StatCard.vue'

const leadHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Program', key: 'program' },
  { title: 'Stage', key: 'stage' },
  { title: 'Priority', key: 'priority' },
  { title: 'Last Contact', key: 'lastContact' }
]

const leads = ref([
  { name: 'Emma Wilson', program: 'Massage Therapy', stage: 'Inquiry', priority: 'high', lastContact: '2024-01-15' },
  { name: 'James Rodriguez', program: 'Advanced Therapy', stage: 'Applied', priority: 'medium', lastContact: '2024-01-12' }
])

const leadStats = ref({
  total: 24,
  inquiry: 8,
  applied: 6,
  enrolled: 10
})

const getStageColor = (stage) => {
  const colors = { Inquiry: 'info', Applied: 'warning', Enrolled: 'success' }
  return colors[stage] || 'grey'
}

const getPriorityIcon = (priority) => {
  const icons = { high: 'mdi-alert-circle', medium: 'mdi-alert', low: 'mdi-information' }
  return icons[priority] || 'mdi-information'
}

const getPriorityColor = (priority) => {
  const colors = { high: 'error', medium: 'warning', low: 'success' }
  return colors[priority] || 'grey'
}
</script>