<template>
  <div class="student-portal">
    <!-- Welcome Header -->
    <div class="portal-header mb-6">
      <v-card color="primary" variant="elevated" class="text-white">
        <v-card-text class="pa-6">
          <div class="d-flex align-center">
            <v-avatar size="80" class="mr-4">
              <v-img 
                :src="studentProfile.photo || '/api/placeholder/80/80'" 
                :alt="studentProfile.name"
              />
            </v-avatar>
            <div class="flex-grow-1">
              <h1 class="text-h4 mb-2">Welcome back, {{ studentProfile.firstName }}!</h1>
              <div class="text-h6 text-white-lighten-2">
                {{ studentProfile.program }} • Student ID: {{ studentProfile.studentId }}
              </div>
              <div class="text-body-1 text-white-lighten-3 mt-1">
                {{ studentProfile.enrollmentStatus }} • {{ studentProfile.completionPercentage }}% Complete
              </div>
            </div>
            <div class="text-right">
              <v-btn
                icon
                variant="text"
                color="white"
                @click="editProfile = true"
              >
                <v-icon icon="mdi-pencil" />
              </v-btn>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <v-progress-linear
            :model-value="studentProfile.completionPercentage"
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
          :value="studentProfile.gpa"
          icon="mdi-star"
          color="wellness"
          :precision="2"
          :change="0.2"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Credits Earned"
          :value="studentProfile.creditsEarned"
          :unit="`/ ${studentProfile.totalCredits}`"
          icon="mdi-school"
          color="primary"
          :progress="(studentProfile.creditsEarned / studentProfile.totalCredits) * 100"
          show-progress
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Attendance Rate"
          :value="studentProfile.attendanceRate"
          unit="%"
          icon="mdi-calendar-check"
          color="success"
          :change="2.1"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Account Balance"
          :value="Math.abs(studentProfile.accountBalance)"
          unit="$"
          icon="mdi-credit-card"
          :color="studentProfile.accountBalance >= 0 ? 'success' : 'error'"
          :precision="2"
        />
      </v-col>
    </v-row>

    <!-- Main Content Tabs -->
    <v-tabs
      v-model="activeTab"
      color="primary"
      class="mb-4"
    >
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
      <v-tab value="documents">
        <v-icon icon="mdi-file-document" class="mr-2" />
        Documents
      </v-tab>
      <v-tab value="announcements">
        <v-icon icon="mdi-bullhorn" class="mr-2" />
        Announcements
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- Schedule Tab -->
      <v-tabs-window-item value="schedule">
        <v-row>
          <v-col cols="12" lg="8">
            <v-card title="My Schedule" variant="elevated" class="mb-4">
              <v-card-text>
                <CalendarView
                  :events="scheduleEvents"
                  view="week"
                  :editable="false"
                />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="4">
            <v-card title="Upcoming Classes" variant="elevated" class="mb-4">
              <v-list>
                <v-list-item
                  v-for="event in upcomingClasses"
                  :key="event.id"
                  :prepend-icon="getClassIcon(event.type)"
                >
                  <v-list-item-title>{{ event.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDateTime(event.start) }} - {{ event.room }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-chip
                      :color="getEventColor(event.type)"
                      size="small"
                      variant="tonal"
                    >
                      {{ event.type }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
            
            <v-card title="Attendance Summary" variant="elevated">
              <v-card-text>
                <div class="text-center mb-4">
                  <div class="text-h3 text-primary">{{ studentProfile.attendanceRate }}%</div>
                  <div class="text-body-2 text-medium-emphasis">Overall Attendance</div>
                </div>
                <v-progress-circular
                  :model-value="studentProfile.attendanceRate"
                  color="primary"
                  size="120"
                  width="8"
                  class="d-block mx-auto mb-4"
                >
                  {{ studentProfile.attendanceRate }}%
                </v-progress-circular>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- Grades Tab -->
      <v-tabs-window-item value="grades">
        <v-row>
          <v-col cols="12" lg="8">
            <v-card title="Course Grades" variant="elevated">
              <v-data-table
                :headers="gradeHeaders"
                :items="studentGrades"
                :items-per-page="10"
                class="elevation-0"
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
                <template #item.progress="{ item }">
                  <v-progress-linear
                    :model-value="item.progress"
                    color="primary"
                    height="6"
                    rounded
                  />
                </template>
              </v-data-table>
            </v-card>
          </v-col>
          <v-col cols="12" lg="4">
            <v-card title="Grade Summary" variant="elevated" class="mb-4">
              <v-card-text>
                <div class="grade-summary">
                  <div class="text-center mb-4">
                    <div class="text-h2 text-primary">{{ studentProfile.gpa }}</div>
                    <div class="text-body-1 text-medium-emphasis">Current GPA</div>
                  </div>
                  
                  <v-divider class="my-4" />
                  
                  <div class="grade-breakdown">
                    <div 
                      v-for="grade in gradeBreakdown" 
                      :key="grade.letter"
                      class="d-flex justify-space-between align-center mb-2"
                    >
                      <span>{{ grade.letter }}</span>
                      <v-chip 
                        :color="getGradeColor(grade.letter)"
                        size="small"
                        variant="tonal"
                      >
                        {{ grade.count }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card title="Certification Progress" variant="elevated">
              <v-card-text>
                <div 
                  v-for="cert in certificationProgress"
                  :key="cert.name"
                  class="mb-4"
                >
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-subtitle-2">{{ cert.name }}</span>
                    <span class="text-caption">{{ cert.progress }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="cert.progress"
                    color="wellness-dark"
                    height="8"
                    rounded
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- Finances Tab -->
      <v-tabs-window-item value="finances">
        <v-row>
          <v-col cols="12" lg="8">
            <v-card title="Payment History" variant="elevated">
              <v-data-table
                :headers="paymentHeaders"
                :items="paymentHistory"
                :items-per-page="10"
                class="elevation-0"
              >
                <template #item.amount="{ item }">
                  <span class="font-weight-medium">
                    ${{ item.amount.toLocaleString() }}
                  </span>
                </template>
                <template #item.status="{ item }">
                  <v-chip
                    :color="getPaymentStatusColor(item.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
          <v-col cols="12" lg="4">
            <v-card title="Account Summary" variant="elevated" class="mb-4">
              <v-card-text>
                <div class="financial-summary">
                  <div class="summary-item mb-3">
                    <div class="d-flex justify-space-between">
                      <span>Tuition Total</span>
                      <span class="font-weight-medium">${{ financialSummary.totalTuition.toLocaleString() }}</span>
                    </div>
                  </div>
                  <div class="summary-item mb-3">
                    <div class="d-flex justify-space-between">
                      <span>Payments Made</span>
                      <span class="font-weight-medium text-success">${{ financialSummary.totalPaid.toLocaleString() }}</span>
                    </div>
                  </div>
                  <div class="summary-item mb-3">
                    <div class="d-flex justify-space-between">
                      <span>Financial Aid</span>
                      <span class="font-weight-medium text-info">${{ financialSummary.financialAid.toLocaleString() }}</span>
                    </div>
                  </div>
                  <v-divider class="my-3" />
                  <div class="summary-item">
                    <div class="d-flex justify-space-between">
                      <span class="text-h6">Balance Due</span>
                      <span 
                        class="text-h6 font-weight-bold"
                        :class="financialSummary.balance >= 0 ? 'text-error' : 'text-success'"
                      >
                        ${{ Math.abs(financialSummary.balance).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" variant="elevated" block>
                  Make Payment
                </v-btn>
              </v-card-actions>
            </v-card>

            <v-card title="Financial Aid" variant="elevated">
              <v-list>
                <v-list-item
                  v-for="aid in financialAid"
                  :key="aid.type"
                >
                  <v-list-item-title>{{ aid.type }}</v-list-item-title>
                  <v-list-item-subtitle>{{ aid.description }}</v-list-item-subtitle>
                  <template #append>
                    <span class="font-weight-medium">${{ aid.amount.toLocaleString() }}</span>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- Documents Tab -->
      <v-tabs-window-item value="documents">
        <v-row>
          <v-col cols="12">
            <DocumentsCard 
              :documents="studentDocuments"
              @download="handleDocumentDownload"
              @upload="handleDocumentUpload"
            />
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- Announcements Tab -->
      <v-tabs-window-item value="announcements">
        <v-row>
          <v-col cols="12" lg="8">
            <v-card title="School Announcements" variant="elevated">
              <v-card-text class="pa-0">
                <v-list>
                  <template v-for="(announcement, index) in announcements" :key="announcement.id">
                    <v-list-item
                      class="pa-4"
                      @click="openAnnouncement(announcement)"
                    >
                      <template #prepend>
                        <v-avatar
                          :color="getPriorityColor(announcement.priority)"
                          size="40"
                        >
                          <v-icon icon="mdi-bullhorn" color="white" />
                        </v-avatar>
                      </template>

                      <v-list-item-title class="text-subtitle-1 font-weight-medium">
                        {{ announcement.title }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="mt-1">
                        {{ announcement.preview }}
                      </v-list-item-subtitle>
                      
                      <div class="mt-2 d-flex align-center gap-2">
                        <v-chip
                          :color="getPriorityColor(announcement.priority)"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ announcement.priority }}
                        </v-chip>
                        <span class="text-caption text-medium-emphasis">
                          {{ formatDate(announcement.date) }}
                        </span>
                      </div>

                      <template #append>
                        <v-icon 
                          v-if="!announcement.read"
                          icon="mdi-circle"
                          color="primary"
                          size="small"
                        />
                      </template>
                    </v-list-item>
                    <v-divider v-if="index < announcements.length - 1" />
                  </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="4">
            <AnnouncementsCard />
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Announcement Modal -->
    <AnnouncementModal
      v-model="showAnnouncementModal"
      :announcement="selectedAnnouncement"
      :can-edit="false"
      :can-delete="false"
    />

    <!-- Profile Edit Dialog -->
    <v-dialog v-model="editProfile" max-width="600">
      <v-card title="Edit Profile">
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="studentProfile.phone"
              label="Phone Number"
              variant="outlined"
              prepend-inner-icon="mdi-phone"
            />
            <v-text-field
              v-model="studentProfile.email"
              label="Email Address"
              variant="outlined"
              prepend-inner-icon="mdi-email"
            />
            <v-textarea
              v-model="studentProfile.address"
              label="Address"
              variant="outlined"
              rows="3"
              prepend-inner-icon="mdi-map-marker"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editProfile = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveProfile">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import CalendarView from '@/components/CalendarView.vue'
import DocumentsCard from '@/components/DocumentsCard.vue'
import AnnouncementsCard from '@/components/AnnouncementsCard.vue'
import AnnouncementModal from '@/components/AnnouncementModal.vue'

// Reactive data
const activeTab = ref('schedule')
const editProfile = ref(false)
const showAnnouncementModal = ref(false)
const selectedAnnouncement = ref(null)

// Mock student data
const studentProfile = ref({
  studentId: 'ST2024001',
  firstName: 'Sarah',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  phone: '(555) 123-4567',
  address: '123 Main St, City, State 12345',
  photo: null,
  program: 'Massage Therapy Certification',
  enrollmentStatus: 'Active',
  completionPercentage: 68,
  gpa: 3.7,
  creditsEarned: 45,
  totalCredits: 60,
  attendanceRate: 92,
  accountBalance: -1250.00
})

// Sample data
const scheduleEvents = ref([
  {
    id: 1,
    title: 'Anatomy & Physiology',
    start: '2024-01-15T09:00:00',
    end: '2024-01-15T11:00:00',
    type: 'lecture',
    room: 'Room 101',
    instructor: 'Dr. Smith'
  },
  {
    id: 2,
    title: 'Swedish Massage Techniques',
    start: '2024-01-15T13:00:00',
    end: '2024-01-15T16:00:00',
    type: 'practical',
    room: 'Practice Room A',
    instructor: 'Prof. Johnson'
  }
])

const upcomingClasses = computed(() => {
  return scheduleEvents.value.slice(0, 5)
})

const gradeHeaders = [
  { title: 'Course', key: 'course' },
  { title: 'Credits', key: 'credits' },
  { title: 'Grade', key: 'grade' },
  { title: 'Progress', key: 'progress' }
]

const studentGrades = ref([
  { course: 'Anatomy & Physiology', credits: 4, grade: 'A', progress: 85 },
  { course: 'Swedish Massage', credits: 3, grade: 'A-', progress: 92 },
  { course: 'Deep Tissue Techniques', credits: 3, grade: 'B+', progress: 78 },
  { course: 'Ethics & Professional Practice', credits: 2, grade: 'A', progress: 95 }
])

const gradeBreakdown = ref([
  { letter: 'A', count: 8 },
  { letter: 'A-', count: 3 },
  { letter: 'B+', count: 2 },
  { letter: 'B', count: 1 }
])

const certificationProgress = ref([
  { name: 'Basic Massage Therapy', progress: 85 },
  { name: 'Advanced Techniques', progress: 60 },
  { name: 'Business Practices', progress: 45 }
])

const paymentHeaders = [
  { title: 'Date', key: 'date' },
  { title: 'Description', key: 'description' },
  { title: 'Amount', key: 'amount' },
  { title: 'Status', key: 'status' }
]

const paymentHistory = ref([
  { date: '2024-01-01', description: 'Tuition Payment', amount: 2000, status: 'Paid' },
  { date: '2023-12-01', description: 'Registration Fee', amount: 150, status: 'Paid' },
  { date: '2023-11-15', description: 'Lab Materials', amount: 75, status: 'Paid' }
])

const financialSummary = ref({
  totalTuition: 8000,
  totalPaid: 6750,
  financialAid: 1500,
  balance: 1250
})

const financialAid = ref([
  { type: 'Pell Grant', description: 'Federal Grant', amount: 1000 },
  { type: 'State Grant', description: 'State Education Grant', amount: 500 }
])

const studentDocuments = ref([
  { id: 1, name: 'Transcript.pdf', type: 'Academic', size: '245 KB', date: '2024-01-10' },
  { id: 2, name: 'Insurance_Card.pdf', type: 'Insurance', size: '180 KB', date: '2024-01-05' }
])

const announcements = ref([
  {
    id: 1,
    title: 'Spring Break Schedule Change',
    preview: 'Classes will be rescheduled due to spring break...',
    priority: 'high',
    date: '2024-01-10',
    read: false
  },
  {
    id: 2,
    title: 'New Library Hours',
    preview: 'The campus library will now be open extended hours...',
    priority: 'medium',
    date: '2024-01-08',
    read: true
  }
])

// Methods
const getClassIcon = (type: string): string => {
  const icons = {
    lecture: 'mdi-school',
    practical: 'mdi-hand-heart',
    lab: 'mdi-flask',
    clinic: 'mdi-hospital-building'
  }
  return icons[type] || 'mdi-book'
}

const getEventColor = (type: string): string => {
  const colors = {
    lecture: 'primary',
    practical: 'wellness-dark',
    lab: 'info',
    clinic: 'success'
  }
  return colors[type] || 'primary'
}

const getGradeColor = (grade: string): string => {
  if (grade.startsWith('A')) return 'success'
  if (grade.startsWith('B')) return 'primary'
  if (grade.startsWith('C')) return 'warning'
  return 'error'
}

const getPaymentStatusColor = (status: string): string => {
  const colors = {
    'Paid': 'success',
    'Pending': 'warning',
    'Overdue': 'error'
  }
  return colors[status] || 'grey'
}

const getPriorityColor = (priority: string): string => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'error'
  }
  return colors[priority] || 'primary'
}

const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

const openAnnouncement = (announcement: any): void => {
  selectedAnnouncement.value = announcement
  showAnnouncementModal.value = true
  // Mark as read
  announcement.read = true
}

const handleDocumentDownload = (document: any): void => {
  console.log('Downloading document:', document)
  // Implement download logic
}

const handleDocumentUpload = (files: FileList): void => {
  console.log('Uploading documents:', files)
  // Implement upload logic
}

const saveProfile = (): void => {
  editProfile.value = false
  // Implement save logic
}

// Lifecycle
onMounted(() => {
  // Load student data
  console.log('Student portal loaded')
})
</script>

<style scoped>
.student-portal {
  max-width: 1400px;
  margin: 0 auto;
}

.portal-header .v-card {
  background: linear-gradient(135deg, #8BC34A 0%, #689F38 100%);
}

.grade-summary {
  text-align: center;
}

.financial-summary .summary-item {
  padding: 8px 0;
}
</style>