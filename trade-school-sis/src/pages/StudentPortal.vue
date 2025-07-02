<template>
  <div class="student-portal">
    <!-- Welcome Header -->
    <div class="portal-header mb-6">
      <v-card color="primary" variant="elevated" class="text-white">
        <v-card-text class="pa-6">
          <div class="d-flex align-center">
            <v-avatar size="80" class="mr-4">
              <v-img 
                src="https://randomuser.me/api/portraits/women/1.jpg"
                alt="Student Photo"
              />
            </v-avatar>
            <div class="flex-grow-1">
              <h1 class="text-h4 mb-2">Welcome back, Sarah!</h1>
              <div class="text-h6 text-white-lighten-2">
                Massage Therapy Program • Student ID: ST2024001
              </div>
              <div class="text-body-1 text-white-lighten-3 mt-1">
                Active Student • 68% Complete
              </div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <v-progress-linear
            :model-value="68"
            color="white"
            class="mt-4"
            height="8"
            rounded
          />
        </v-card-text>
      </v-card>
    </div>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="GPA"
          :value="3.7"
          icon="mdi-star"
          color="wellness"
          :precision="2"
          :change="0.2"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Credits Earned"
          :value="45"
          unit="/ 60"
          icon="mdi-school"
          color="primary"
          :progress="75"
          show-progress
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Attendance Rate"
          :value="92"
          unit="%"
          icon="mdi-calendar-check"
          color="success"
          :change="2.1"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Account Balance"
          :value="1250"
          unit="$"
          icon="mdi-credit-card"
          color="error"
          :precision="2"
        />
      </v-col>
    </v-row>

    <!-- Content Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-4">
      <v-tab value="schedule">
        <v-icon icon="mdi-calendar" class="mr-2" />
        Schedule
      </v-tab>
      <v-tab value="grades">
        <v-icon icon="mdi-school" class="mr-2" />
        Grades
      </v-tab>
      <v-tab value="finances">
        <v-icon icon="mdi-credit-card" class="mr-2" />
        Finances
      </v-tab>
      <v-tab value="announcements">
        <v-icon icon="mdi-bullhorn" class="mr-2" />
        Announcements
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- Schedule Tab -->
      <v-tabs-window-item value="schedule">
        <v-card>
          <v-card-title>My Class Schedule</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="class_ in schedule"
                :key="class_.id"
              >
                <template #prepend>
                  <v-avatar color="primary">
                    <v-icon icon="mdi-school" color="white" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ class_.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ class_.time }} - {{ class_.room }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Grades Tab -->
      <v-tabs-window-item value="grades">
        <v-card>
          <v-card-title>Course Grades</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="gradeHeaders"
              :items="grades"
              :items-per-page="10"
            >
              <template #item.grade="{ item }">
                <v-chip
                  :color="getGradeColor(item.grade)"
                  size="small"
                  variant="tonal"
                >
                  {{ item.grade }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Finances Tab -->
      <v-tabs-window-item value="finances">
        <v-card>
          <v-card-title>Financial Information</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="financial-summary">
                  <div class="d-flex justify-space-between mb-2">
                    <span>Total Tuition:</span>
                    <span class="font-weight-medium">$8,000</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Payments Made:</span>
                    <span class="font-weight-medium text-success">$6,750</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Financial Aid:</span>
                    <span class="font-weight-medium text-info">$1,500</span>
                  </div>
                  <v-divider class="my-3" />
                  <div class="d-flex justify-space-between">
                    <span class="text-h6">Balance Due:</span>
                    <span class="text-h6 font-weight-bold text-error">$1,250</span>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="elevated">
              Make Payment
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tabs-window-item>

      <!-- Announcements Tab -->
      <v-tabs-window-item value="announcements">
        <v-card>
          <v-card-title>School Announcements</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="announcement in announcements"
                :key="announcement.id"
              >
                <template #prepend>
                  <v-avatar color="primary">
                    <v-icon icon="mdi-bullhorn" color="white" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ announcement.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ announcement.date }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatCard from '@/components/StatCard.vue'

const activeTab = ref('schedule')

const schedule = ref([
  { id: 1, name: 'Anatomy & Physiology', time: 'Mon, Wed 9:00 AM', room: 'Room 101' },
  { id: 2, name: 'Swedish Massage Techniques', time: 'Tue, Thu 1:00 PM', room: 'Lab A' },
  { id: 3, name: 'Deep Tissue Massage', time: 'Fri 10:00 AM', room: 'Lab B' }
])

const gradeHeaders = [
  { title: 'Course', key: 'course' },
  { title: 'Credits', key: 'credits' },
  { title: 'Grade', key: 'grade' }
]

const grades = ref([
  { course: 'Anatomy & Physiology', credits: 4, grade: 'A' },
  { course: 'Swedish Massage', credits: 3, grade: 'A-' },
  { course: 'Deep Tissue Techniques', credits: 3, grade: 'B+' },
  { course: 'Ethics & Practice', credits: 2, grade: 'A' }
])

const announcements = ref([
  { id: 1, title: 'Spring Break Schedule Change', date: 'January 10, 2024' },
  { id: 2, title: 'New Library Hours', date: 'January 8, 2024' },
  { id: 3, title: 'Graduation Ceremony Details', date: 'January 5, 2024' }
])

const getGradeColor = (grade) => {
  if (grade.startsWith('A')) return 'success'
  if (grade.startsWith('B')) return 'primary'
  if (grade.startsWith('C')) return 'warning'
  return 'error'
}
</script>

<style scoped>
.student-portal {
  max-width: 1400px;
  margin: 0 auto;
}

.portal-header .v-card {
  background: linear-gradient(135deg, #8BC34A 0%, #689F38 100%);
}

.financial-summary {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}
</style>