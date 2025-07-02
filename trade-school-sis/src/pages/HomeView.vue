<template>
  <div class="home-view">
    <!-- Page Header -->
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">
        Welcome to Massage School Management
      </h1>
      <p class="text-body-1 text-medium-emphasis mt-2">
        Your comprehensive dashboard for managing student information, courses, and school operations.
      </p>
    </div>

    <!-- Student Search & Filters Section -->
    <StudentFilterCard 
      class="mb-6"
      :show-badge="true"
      :auto-search="false"
      @search="handleStudentSearch"
      @filter-change="handleStudentFilterChange"
      @reset="handleStudentFilterReset"
      @view-all="handleViewAllStudents"
      @search-error="handleStudentSearchError"
    />

    <!-- Main Content Grid -->
    <v-row>
      <!-- Left Column - Dashboard Cards -->
      <v-col cols="12" lg="8">
        <DashboardCards class="mb-6" />
        
        <!-- Quick Stats Row -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="text-center pa-4">
              <v-icon size="32" color="primary" class="mb-2">mdi-account-group</v-icon>
              <div class="text-h5 font-weight-bold">156</div>
              <div class="text-caption text-medium-emphasis">Total Students</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="text-center pa-4">
              <v-icon size="32" color="success" class="mb-2">mdi-book-open-variant</v-icon>
              <div class="text-h5 font-weight-bold">12</div>
              <div class="text-caption text-medium-emphasis">Active Courses</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="text-center pa-4">
              <v-icon size="32" color="warning" class="mb-2">mdi-calendar-clock</v-icon>
              <div class="text-h5 font-weight-bold">8</div>
              <div class="text-caption text-medium-emphasis">Today's Classes</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="text-center pa-4">
              <v-icon size="32" color="info" class="mb-2">mdi-currency-usd</v-icon>
              <div class="text-h5 font-weight-bold">$24.5K</div>
              <div class="text-caption text-medium-emphasis">Monthly Revenue</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activity Section -->
        <v-card elevation="2" class="mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon left color="primary">mdi-clock-outline</v-icon>
            Recent Activity
          </v-card-title>
          <v-card-text>
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :dot-color="activity.color"
                size="small"
              >
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ activity.title }}</div>
                    <div class="text-caption text-medium-emphasis">{{ activity.time }}</div>
                  </div>
                  <v-chip :color="activity.color" size="x-small" variant="tonal">
                    {{ activity.category }}
                  </v-chip>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>

        <!-- Activities Card -->
        <ActivitiesCard 
          @add-activity="handleAddActivity"
          @edit-task="handleEditActivityTask"
          @delete-task="handleDeleteActivityTask"
          @task-click="handleActivityTaskClick"
          @complete-task="handleCompleteActivityTask"
          @employee-change="handleEmployeeChange"
          @view-all="handleViewAllActivities"
        />

        <!-- Calendar View -->
        <CalendarView 
          class="mt-6"
          @add-event="handleAddEvent"
          @edit-event="handleEditEvent"
          @delete-event="handleDeleteEvent"
          @event-click="handleEventClick"
          @date-select="handleDateSelect"
          @view-change="handleViewChange"
        />
      </v-col>

      <!-- Right Column - Sidebar Cards -->
      <v-col cols="12" lg="4">
        <!-- Notifications Card -->
        <NotificationsCard 
          class="mb-6"
          @add-notification="handleAddNotification"
          @edit-notification="handleEditNotification"
          @delete-notification="handleDeleteNotification"
          @notification-click="handleNotificationClick"
          @mark-read="handleMarkRead"
          @mark-all-read="handleMarkAllRead"
          @view-all="handleViewAllNotifications"
        />

        <!-- Announcements Card -->
        <AnnouncementsCard 
          class="mb-6"
          @add-announcement="handleAddAnnouncement"
          @edit-announcement="handleEditAnnouncement"
          @announcement-click="handleAnnouncementClick"
          @view-all="handleViewAllAnnouncements"
        />

        <!-- Documents Card -->
        <DocumentsCard 
          class="mb-6"
          @add-document="handleAddDocument"
          @edit-document="handleEditDocument"
          @delete-document="handleDeleteDocument"
          @document-click="handleDocumentClick"
          @download-document="handleDownloadDocument"
          @upload-document="handleUploadDocument"
          @category-change="handleDocumentCategoryChange"
          @view-all="handleViewAllDocuments"
        />

        <!-- Todo List Card -->
        <TodoListCard 
          @add-task="handleAddTask"
          @edit-task="handleEditTask"
          @delete-task="handleDeleteTask"
          @task-toggle="handleTaskToggle"
          @view-all="handleViewAllTasks"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
// Sample data for recent activities
const recentActivities = [
  {
    title: 'New student enrolled in Advanced Massage Therapy',
    time: '2 hours ago',
    category: 'Admissions',
    color: 'success'
  },
  {
    title: 'Payment received from Sarah Johnson',
    time: '3 hours ago',
    category: 'Finance',
    color: 'info'
  },
  {
    title: 'Course completion: Introduction to Swedish Massage',
    time: '5 hours ago',
    category: 'Academics',
    color: 'primary'
  },
  {
    title: 'Faculty meeting scheduled for tomorrow',
    time: '1 day ago',
    category: 'Staff',
    color: 'warning'
  }
]

// Event handlers for StudentFilterCard
const handleStudentSearch = (filters: any, query: string): void => {
  console.log('Student search performed:', { filters, query })
  // Implement student search logic
  // This would typically call an API to search for students
  // and update the results display
}

const handleStudentFilterChange = (filters: any): void => {
  console.log('Student filters changed:', filters)
  // Implement filter change logic
  // This could trigger real-time filtering or prepare search parameters
}

const handleStudentFilterReset = (): void => {
  console.log('Student filters reset')
  // Implement filter reset logic
  // Clear any stored filter state and refresh the student list
}

const handleViewAllStudents = (): void => {
  console.log('View all students clicked')
  // Implement view all students logic
  // Navigate to a comprehensive student list page
}

const handleStudentSearchError = (error: string): void => {
  console.error('Student search error:', error)
  // Implement error handling logic
  // Show user-friendly error messages or retry mechanisms
}

// Event handlers for ActivitiesCard
const handleAddActivity = (): void => {
  console.log('Add activity clicked')
  // Implement activity creation logic
}

const handleEditActivityTask = (task: any): void => {
  console.log('Edit activity task:', task)
  // Implement activity task editing logic
}

const handleDeleteActivityTask = (task: any): void => {
  console.log('Delete activity task:', task)
  // Implement activity task deletion logic
}

const handleActivityTaskClick = (task: any): void => {
  console.log('Activity task clicked:', task)
  // Implement activity task click logic
}

const handleCompleteActivityTask = (task: any): void => {
  console.log('Activity task completed:', task)
  // Implement activity task completion logic
}

const handleEmployeeChange = (employeeId: string): void => {
  console.log('Employee filter changed:', employeeId)
  // Implement employee filter logic
}

const handleViewAllActivities = (): void => {
  console.log('View all activities clicked')
  // Implement view all activities logic
}

// Event handlers for NotificationsCard
const handleAddNotification = (): void => {
  console.log('Add notification clicked')
  // Implement notification creation logic
}

const handleEditNotification = (notification: any): void => {
  console.log('Edit notification:', notification)
  // Implement notification editing logic
}

const handleDeleteNotification = (notification: any): void => {
  console.log('Delete notification:', notification)
  // Implement notification deletion logic
}

const handleNotificationClick = (notification: any): void => {
  console.log('Notification clicked:', notification)
  // Implement notification click logic
}

const handleMarkRead = (notification: any): void => {
  console.log('Mark as read:', notification)
  // Implement mark as read logic
}

const handleMarkAllRead = (): void => {
  console.log('Mark all as read')
  // Implement mark all as read logic
}

const handleViewAllNotifications = (): void => {
  console.log('View all notifications')
  // Implement view all notifications logic
}

// Event handlers for AnnouncementsCard
const handleAddAnnouncement = (): void => {
  console.log('Add announcement clicked')
  // Implement announcement creation logic
}

const handleEditAnnouncement = (announcement: any): void => {
  console.log('Edit announcement:', announcement)
  // Implement announcement editing logic
}

const handleAnnouncementClick = (announcement: any): void => {
  console.log('Announcement clicked:', announcement)
  // Implement announcement click logic
}

const handleViewAllAnnouncements = (): void => {
  console.log('View all announcements')
  // Implement view all announcements logic
}

// Event handlers for DocumentsCard
const handleAddDocument = (): void => {
  console.log('Add document clicked')
  // Implement document creation logic
}

const handleEditDocument = (document: any): void => {
  console.log('Edit document:', document)
  // Implement document editing logic
}

const handleDeleteDocument = (document: any): void => {
  console.log('Delete document:', document)
  // Implement document deletion logic
}

const handleDocumentClick = (document: any): void => {
  console.log('Document clicked:', document)
  // Implement document click logic
}

const handleDownloadDocument = (document: any): void => {
  console.log('Download document:', document)
  // Implement document download logic
}

const handleUploadDocument = (file: File, category: string, description: string): void => {
  console.log('Upload document:', { file, category, description })
  // Implement document upload logic
}

const handleDocumentCategoryChange = (category: string): void => {
  console.log('Document category changed:', category)
  // Implement document category filter logic
}

const handleViewAllDocuments = (): void => {
  console.log('View all documents')
  // Implement view all documents logic
}

// Event handlers for TodoListCard
const handleAddTask = (): void => {
  console.log('Add task clicked')
  // Implement task creation logic
}

const handleEditTask = (task: any): void => {
  console.log('Edit task:', task)
  // Implement task editing logic
}

const handleDeleteTask = (task: any): void => {
  console.log('Delete task:', task)
  // Implement task deletion logic
}

const handleTaskToggle = (task: any): void => {
  console.log('Task toggle:', task)
  // Implement task toggle logic
}

const handleViewAllTasks = (): void => {
  console.log('View all tasks')
  // Implement view all tasks logic
}

// Event handlers for CalendarView
const handleAddEvent = (): void => {
  console.log('Add event clicked')
  // Implement event creation logic
}

const handleEditEvent = (event: any): void => {
  console.log('Edit event:', event)
  // Implement event editing logic
}

const handleDeleteEvent = (event: any): void => {
  console.log('Delete event:', event)
  // Implement event deletion logic
}

const handleEventClick = (event: any): void => {
  console.log('Event clicked:', event)
  // Implement event click logic
}

const handleDateSelect = (start: string, end: string): void => {
  console.log('Date selected:', start, 'to', end)
  // Implement date selection logic
}

const handleViewChange = (view: string): void => {
  console.log('View changed:', view)
  // Implement view change logic
}
</script>

<style scoped>
.home-view {
  padding: 24px;
}

.page-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 16px;
}

@media (max-width: 960px) {
  .home-view {
    padding: 16px;
  }
}

.v-card {
  border-radius: 12px;
}

.v-timeline-item {
  min-height: 60px;
}
</style> 