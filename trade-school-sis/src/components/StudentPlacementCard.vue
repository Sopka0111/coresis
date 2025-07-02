<template>
  <v-card class="student-placement-card">
    <v-card-title class="d-flex align-center">
      <v-icon left color="primary">mdi-account-details</v-icon>
      Student Placement Details
      <v-spacer />
      <v-btn 
        icon 
        @click="$emit('close')"
        variant="text"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text v-if="student">
      <!-- Student Header Info -->
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <div class="d-flex align-center mb-4">
            <v-avatar size="64" class="mr-4">
              <v-img 
                :src="getAvatarUrl(student.name)" 
                :alt="student.name"
                fallback-src="https://via.placeholder.com/64"
              />
            </v-avatar>
            <div>
              <h2 class="text-h4 font-weight-bold">{{ student.name }}</h2>
              <div class="text-h6 text-medium-emphasis">{{ student.studentId }}</div>
              <div class="text-body-1">{{ student.program }} - {{ student.session }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex flex-column gap-2">
            <v-chip 
              :color="getEmployedStatusColor(student.employedStatus)"
              size="large"
              class="font-weight-medium"
            >
              <v-icon left>{{ getEmployedStatusIcon(student.employedStatus) }}</v-icon>
              {{ student.employedStatus }}
            </v-chip>
            <v-chip 
              :color="getPlacementStatusColor(student.placementStatus)"
              size="large"
              class="font-weight-medium"
            >
              <v-icon left>{{ getPlacementStatusIcon(student.placementStatus) }}</v-icon>
              {{ student.placementStatus }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" color="primary" grow>
        <v-tab value="overview">
          <v-icon left>mdi-information</v-icon>
          Overview
        </v-tab>
        <v-tab value="employment">
          <v-icon left>mdi-briefcase</v-icon>
          Employment
        </v-tab>
        <v-tab value="documents">
          <v-icon left>mdi-file-document</v-icon>
          Documents
        </v-tab>
        <v-tab value="notes">
          <v-icon left>mdi-note-text</v-icon>
          Notes & Feedback
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-4">
        <!-- Overview Tab -->
        <v-window-item value="overview">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-h6">
                  <v-icon left>mdi-account</v-icon>
                  Personal Information
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-email</v-icon>
                      </template>
                      <v-list-item-title>{{ student.email }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-phone</v-icon>
                      </template>
                      <v-list-item-title>{{ student.phone }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-school</v-icon>
                      </template>
                      <v-list-item-title>Graduated: {{ formatDate(student.graduationDate) }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-h6">
                  <v-icon left>mdi-school</v-icon>
                  Academic Information
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>{{ student.campus }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>First Term: {{ student.firstTerm }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-account-group</v-icon>
                      </template>
                      <v-list-item-title>Group: {{ student.group }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Employment Tab -->
        <v-window-item value="employment">
          <div v-if="student.employer">
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon left>mdi-briefcase</v-icon>
                Current Employment
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-domain</v-icon>
                        </template>
                        <v-list-item-title class="font-weight-medium">{{ student.employer.name }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-account-tie</v-icon>
                        </template>
                        <v-list-item-title>{{ student.employer.position }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-calendar-start</v-icon>
                        </template>
                        <v-list-item-title>Started: {{ formatDate(student.employer.startDate) }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-clock</v-icon>
                        </template>
                        <v-list-item-title>{{ student.employer.jobType }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-currency-usd</v-icon>
                        </template>
                        <v-list-item-title v-if="canView">${{ formatSalary(student.employer.salary) }}</v-list-item-title>
                        <v-list-item-title v-else class="text-grey">Salary information hidden</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-account</v-icon>
                        </template>
                        <v-list-item-title>Contact: {{ student.employer.contact }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
          
          <div v-else>
            <v-card variant="outlined" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-briefcase-off</v-icon>
              <div class="text-h6 text-grey">No employment information</div>
              <div class="text-body-2 text-grey-lighten-1 mt-2">
                This student is currently {{ student.employedStatus.toLowerCase() }}
              </div>
            </v-card>
          </div>
        </v-window-item>

        <!-- Documents Tab -->
        <v-window-item value="documents">
          <v-card variant="outlined">
            <v-card-title class="text-h6">
              <v-icon left>mdi-file-document</v-icon>
              Documents & Files
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-if="student.resume">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-file-pdf-box</v-icon>
                  </template>
                  <v-list-item-title>Resume</v-list-item-title>
                  <template v-slot:append>
                    <v-btn 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                      @click="downloadResume"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Download
                    </v-btn>
                  </template>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-file-certificate</v-icon>
                  </template>
                  <v-list-item-title>Graduation Certificate</v-list-item-title>
                  <template v-slot:append>
                    <v-btn 
                      color="success" 
                      variant="outlined" 
                      size="small"
                      @click="downloadCertificate"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Download
                    </v-btn>
                  </template>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-file-document-outline</v-icon>
                  </template>
                  <v-list-item-title>Placement Verification</v-list-item-title>
                  <template v-slot:append>
                    <v-btn 
                      color="info" 
                      variant="outlined" 
                      size="small"
                      @click="generateVerification"
                    >
                      <v-icon left>mdi-plus</v-icon>
                      Generate
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Notes Tab -->
        <v-window-item value="notes">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-h6">
                  <v-icon left>mdi-note-text</v-icon>
                  Internal Notes
                </v-card-title>
                <v-card-text>
                  <div v-if="student.notes && student.notes.length > 0">
                    <v-list density="compact">
                      <v-list-item v-for="(note, index) in student.notes" :key="index">
                        <template v-slot:prepend>
                          <v-icon size="small">mdi-circle-small</v-icon>
                        </template>
                        <v-list-item-title>{{ note }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div v-else class="text-center pa-4">
                    <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-note-off</v-icon>
                    <div class="text-grey">No notes available</div>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn 
                    color="primary" 
                    variant="outlined"
                    @click="addNote"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Add Note
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-h6">
                  <v-icon left>mdi-comment-text</v-icon>
                  Employer Feedback
                </v-card-title>
                <v-card-text>
                  <div v-if="student.feedback && student.feedback.length > 0">
                    <v-list density="compact">
                      <v-list-item v-for="(feedback, index) in student.feedback" :key="index">
                        <template v-slot:prepend>
                          <v-icon size="small" color="success">mdi-check-circle</v-icon>
                        </template>
                        <v-list-item-title>{{ feedback }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div v-else class="text-center pa-4">
                    <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-comment-off</v-icon>
                    <div class="text-grey">No feedback available</div>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn 
                    color="success" 
                    variant="outlined"
                    @click="addFeedback"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Add Feedback
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn 
        color="secondary" 
        variant="outlined"
        @click="$emit('close')"
      >
        Close
      </v-btn>
      <v-btn 
        color="primary" 
        @click="editStudent"
      >
        <v-icon left>mdi-pencil</v-icon>
        Edit Student
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Types
interface Student {
  id: string
  name: string
  studentId: string
  campus: string
  firstTerm: string
  program: string
  session: string
  status: string
  group: string
  employedStatus: string
  placementStatus: string
  email: string
  phone: string
  graduationDate: string
  employer?: {
    name: string
    contact: string
    position: string
    startDate: string
    jobType: string
    salary: number
  }
  resume?: string
  notes?: string[]
  feedback?: string[]
}

// Props
interface Props {
  student: Student | null
  canView?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canView: true
})

// Emits
const emit = defineEmits<{
  close: []
  update: [student: Student]
}>()

// Reactive data
const activeTab = ref('overview')

// Methods
const getAvatarUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1976D2&color=fff&size=64`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatSalary = (salary: number) => {
  return salary.toLocaleString()
}

const getEmployedStatusColor = (status: string) => {
  const colors = {
    'Employed': 'success',
    'Seeking': 'warning',
    'Not Seeking': 'error',
    'Self-Employed': 'info'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getEmployedStatusIcon = (status: string) => {
  const icons = {
    'Employed': 'mdi-briefcase-check',
    'Seeking': 'mdi-account-search',
    'Not Seeking': 'mdi-account-remove',
    'Self-Employed': 'mdi-account-tie'
  }
  return icons[status as keyof typeof icons] || 'mdi-help-circle'
}

const getPlacementStatusColor = (status: string) => {
  const colors = {
    'Placed': 'success',
    'Pending': 'warning',
    'Referred': 'info',
    'Not Placed': 'error'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getPlacementStatusIcon = (status: string) => {
  const icons = {
    'Placed': 'mdi-check-circle',
    'Pending': 'mdi-clock-outline',
    'Referred': 'mdi-account-arrow-right',
    'Not Placed': 'mdi-close-circle'
  }
  return icons[status as keyof typeof icons] || 'mdi-help-circle'
}

const downloadResume = () => {
  if (props.student?.resume) {
    const link = document.createElement('a')
    link.href = props.student.resume
    link.download = `${props.student.name}-resume.pdf`
    link.click()
  }
}

const downloadCertificate = () => {
  // Mock certificate download
  alert('Certificate download functionality would be implemented here.')
}

const generateVerification = () => {
  // Mock verification generation
  alert('Placement verification generation would be implemented here.')
}

const addNote = () => {
  const note = prompt('Enter a new note:')
  if (note && props.student) {
    const updatedStudent = {
      ...props.student,
      notes: [...(props.student.notes || []), note]
    }
    emit('update', updatedStudent)
  }
}

const addFeedback = () => {
  const feedback = prompt('Enter employer feedback:')
  if (feedback && props.student) {
    const updatedStudent = {
      ...props.student,
      feedback: [...(props.student.feedback || []), feedback]
    }
    emit('update', updatedStudent)
  }
}

const editStudent = () => {
  // Mock edit functionality
  alert('Edit student functionality would be implemented here.')
}
</script>

<style scoped>
.student-placement-card {
  border-radius: 12px;
  max-width: 900px;
  margin: 0 auto;
}

.v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.v-window {
  min-height: 400px;
}
</style> 