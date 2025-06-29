<template>
  <v-container fluid>
    <!-- Header with role selector and search -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-3" size="32" color="primary">mdi-cog</v-icon>
            <div>
              <h2 class="text-h5 mb-1">Management Portal</h2>
              <p class="text-body-2 text-medium-emphasis">
                Administrative tools and system management
              </p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-body-2 text-medium-emphasis">Current Role</div>
              <div class="text-h6">{{ userRole }}</div>
            </div>
            <v-btn
              color="primary"
              variant="outlined"
              @click="showRoleSelector = true"
            >
              <v-icon left>mdi-account-switch</v-icon>
              Switch Role
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search and Filter -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search management tools..."
          variant="outlined"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedSection"
          :items="sectionOptions"
          label="Filter by section"
          variant="outlined"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Management Sections -->
    <v-row>
      <v-col 
        cols="12" 
        v-for="section in filteredSections" 
        :key="section.title"
        class="mb-6"
      >
        <v-card class="management-section-card">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" :icon="section.icon" color="primary"></v-icon>
            {{ section.title }}
            <v-chip 
              class="ml-2" 
              size="small" 
              color="primary" 
              variant="outlined"
            >
              {{ section.items.length }} tools
            </v-chip>
            <v-spacer />
            <v-btn
              v-if="section.quickActions"
              size="small"
              variant="outlined"
              @click="showQuickActions(section)"
            >
              Quick Actions
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col
                cols="12" 
                sm="6" 
                md="4" 
                lg="3"
                v-for="item in section.items"
                :key="item.label"
              >
                <v-card 
                  class="management-item-card"
                  :class="{ 'disabled-card': !hasPermission(item.permission) }"
                  elevation="2"
                  hover
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon 
                      :icon="item.icon" 
                      size="48" 
                      :color="hasPermission(item.permission) ? 'primary' : 'grey'"
                      class="mb-3"
                    />
                    <div class="text-h6 mb-2">{{ item.label }}</div>
                    <div class="text-body-2 text-medium-emphasis mb-3">
                      {{ item.description }}
                    </div>
                    
                    <!-- Status indicators -->
                    <div class="d-flex justify-center mb-3" v-if="item.status">
                      <v-chip
                        :color="getStatusColor(item.status)"
                        size="small"
                        variant="outlined"
                      >
                        {{ item.status }}
                      </v-chip>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="d-flex gap-2">
                      <v-btn
                        block
                        color="primary"
                        :to="item.route"
                        :disabled="!hasPermission(item.permission)"
                        @click="item.action && item.action()"
                        :loading="item.loading"
                      >
                        <v-icon left>mdi-arrow-right</v-icon>
                        Access
                      </v-btn>
                      
                      <v-btn
                        v-if="item.quickAccess"
                        icon
                        size="small"
                        variant="outlined"
                        color="secondary"
                        @click="quickAccess(item)"
                        :disabled="!hasPermission(item.permission)"
                      >
                        <v-icon>mdi-lightning-bolt</v-icon>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Role Selector Dialog -->
    <v-dialog v-model="showRoleSelector" max-width="400">
      <v-card>
        <v-card-title>Switch Role</v-card-title>
        <v-card-text>
          <v-radio-group v-model="selectedRole">
            <v-radio
              v-for="role in availableRoles"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showRoleSelector = false">Cancel</v-btn>
          <v-btn color="primary" @click="switchRole">Switch</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Quick Actions Dialog -->
    <v-dialog v-model="quickActionsDialog" max-width="600">
      <v-card>
        <v-card-title>{{ selectedSection?.title }} - Quick Actions</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="action in selectedSection?.quickActions"
              :key="action.label"
              @click="executeQuickAction(action)"
            >
              <template v-slot:prepend>
                <v-icon :icon="action.icon" color="primary"></v-icon>
              </template>
              <v-list-item-title>{{ action.label }}</v-list-item-title>
              <v-list-item-subtitle>{{ action.description }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="quickActionsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Types
interface ManagementItem {
  label: string
  description: string
  route?: string
  permission: string
  icon: string
  status?: string
  loading?: boolean
  quickAccess?: boolean
  action?: () => void
}

interface QuickAction {
  label: string
  description: string
  icon: string
  action: () => void
}

interface ManagementSection {
  title: string
  icon: string
  items: ManagementItem[]
  quickActions?: QuickAction[]
}

interface Role {
  label: string
  value: string
}

// Composables
const { userRole, setUserRole } = useAuth()

// Reactive data
const searchQuery = ref('')
const selectedSection = ref('')
const showRoleSelector = ref(false)
const quickActionsDialog = ref(false)
const selectedRole = ref(userRole.value)
const selectedSectionData = ref<ManagementSection | null>(null)

// Available roles
const availableRoles: Role[] = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Finance Manager', value: 'finance' },
  { label: 'Registrar', value: 'registrar' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Student', value: 'student' }
]

// Management sections
const sections = ref<ManagementSection[]>([
  {
    title: 'Admissions',
    icon: 'mdi-account-plus',
    items: [
      {
        label: 'Documents',
        description: 'Manage admission documents and requirements',
        route: '/admissions/documents',
        permission: 'admin',
        icon: 'mdi-file-document-multiple',
        status: 'Active'
      },
      {
        label: 'Tasks',
        description: 'Track and manage admission-related tasks',
        route: '/admissions/tasks',
        permission: 'all',
        icon: 'mdi-checkbox-marked-circle-outline',
        quickAccess: true
      }
    ],
    quickActions: [
      {
        label: 'Bulk Document Import',
        description: 'Import multiple documents at once',
        icon: 'mdi-upload-multiple',
        action: () => alert('Bulk import initiated')
      },
      {
        label: 'Task Assignment',
        description: 'Assign tasks to team members',
        icon: 'mdi-account-multiple-plus',
        action: () => alert('Task assignment opened')
      }
    ]
  },
  {
    title: 'Registrar',
    icon: 'mdi-school',
    items: [
      {
        label: 'Attendance',
        description: 'Track student attendance and participation',
        route: '/registrar/attendance',
        permission: 'registrar',
        icon: 'mdi-calendar-check',
        status: 'Live'
      },
      {
        label: 'Student Portal - Users',
        description: 'Manage student portal access and accounts',
        route: '/registrar/portal-users',
        permission: 'admin',
        icon: 'mdi-account-group',
        quickAccess: true
      }
    ]
  },
  {
    title: 'Finance',
    icon: 'mdi-currency-usd',
    items: [
      {
        label: 'ISIR Import',
        description: 'Import financial aid data from ISIR',
        route: '/finance/isir',
        permission: 'finance',
        icon: 'mdi-database-import',
        status: 'Ready'
      },
      {
        label: 'FVT / GE Reporting',
        description: 'Generate FVT and GE compliance reports',
        route: '/finance/fvt',
        permission: 'finance',
        icon: 'mdi-chart-line',
        quickAccess: true
      }
    ]
  },
  {
    title: 'Accounting',
    icon: 'mdi-calculator',
    items: [
      {
        label: 'Ledger Overview',
        description: 'View and manage financial ledgers',
        route: '/accounting/ledger',
        permission: 'finance',
        icon: 'mdi-book-open-variant',
        status: 'Updated'
      },
      {
        label: 'Reconciliation',
        description: 'Reconcile accounts and transactions',
        route: '/accounting/reconcile',
        permission: 'finance',
        icon: 'mdi-scale-balance',
        quickAccess: true
      }
    ]
  },
  {
    title: 'Placement',
    icon: 'mdi-briefcase',
    items: [
      {
        label: 'Placement Outcomes',
        description: 'Track and manage student placement results',
        route: '/placement/outcomes',
        permission: 'placement',
        icon: 'mdi-target',
        status: 'Active'
      }
    ]
  },
  {
    title: 'Bulk Updates',
    icon: 'mdi-update',
    items: [
      {
        label: 'Mass Student Status',
        description: 'Update multiple student statuses at once',
        route: '/tools/bulk-status',
        permission: 'admin',
        icon: 'mdi-account-multiple-check',
        quickAccess: true
      }
    ]
  },
  {
    title: 'Compliance',
    icon: 'mdi-shield-check',
    items: [
      {
        label: 'Title IV Reporting',
        description: 'Generate Title IV compliance reports',
        route: '/compliance/title4',
        permission: 'finance',
        icon: 'mdi-government',
        status: 'Required'
      },
      {
        label: 'FERPA Tracker',
        description: 'Track FERPA compliance and releases',
        route: '/compliance/ferpa',
        permission: 'registrar',
        icon: 'mdi-lock-check',
        quickAccess: true
      }
    ]
  },
  {
    title: 'Data Tools',
    icon: 'mdi-database',
    items: [
      {
        label: 'Data Export',
        description: 'Export data in various formats',
        route: '/data/export',
        permission: 'admin',
        icon: 'mdi-database-export',
        quickAccess: true
      },
      {
        label: 'Custom Query',
        description: 'Create and run custom database queries',
        route: '/data/custom-query',
        permission: 'admin',
        icon: 'mdi-code-braces',
        status: 'Advanced'
      }
    ]
  },
  {
    title: 'LMS',
    icon: 'mdi-monitor-dashboard',
    items: [
      {
        label: 'Course Sync',
        description: 'Synchronize courses with LMS',
        route: '/lms/sync',
        permission: 'all',
        icon: 'mdi-sync',
        status: 'Connected'
      },
      {
        label: 'Roster Import',
        description: 'Import student rosters to LMS',
        route: '/lms/import',
        permission: 'admin',
        icon: 'mdi-account-multiple-plus',
        quickAccess: true
      }
    ]
  }
])

// Computed properties
const sectionOptions = computed(() => 
  sections.value.map(section => ({ title: section.title, value: section.title }))
)

const filteredSections = computed(() => {
  let filtered = sections.value

  // Filter by section
  if (selectedSection.value) {
    filtered = filtered.filter(section => section.title === selectedSection.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })).filter(section => section.items.length > 0)
  }

  return filtered
})

// Methods
function hasPermission(permission: string): boolean {
  return permission === 'all' || userRole.value === permission
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Active': 'success',
    'Live': 'info',
    'Ready': 'warning',
    'Updated': 'primary',
    'Required': 'error',
    'Advanced': 'secondary'
  }
  return colors[status] || 'grey'
}

function switchRole(): void {
  setUserRole(selectedRole.value)
  showRoleSelector.value = false
}

function showQuickActions(section: ManagementSection): void {
  selectedSectionData.value = section
  quickActionsDialog.value = true
}

function quickAccess(item: ManagementItem): void {
  alert(`Quick access to ${item.label}`)
}

function executeQuickAction(action: QuickAction): void {
  action.action()
  quickActionsDialog.value = false
}
</script>

<style scoped>
.management-section-card {
  border-left: 4px solid var(--v-primary-base);
}

.management-item-card {
  transition: all 0.3s ease;
  height: 100%;
}

.management-item-card:hover {
  transform: translateY(-2px);
}

.disabled-card {
  opacity: 0.6;
  pointer-events: none;
}

.gap-2 {
  gap: 8px;
}
</style> 