import { ref, computed } from 'vue'

// Global auth state
const userRole = ref('Administrator')
const isAuthenticated = ref(true)
const currentUser = ref({
  id: 1,
  name: 'Admin User',
  email: 'admin@tradeschool.edu',
  role: 'Administrator',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
})

// Auth composable
export function useAuth() {
  // Computed permissions based on role
  const canManageStudents = computed(() => {
    return ['Administrator', 'Registrar'].includes(userRole.value)
  })
  
  const canManageFinance = computed(() => {
    return ['Administrator', 'Finance'].includes(userRole.value)
  })
  
  const canManageAdmissions = computed(() => {
    return ['Administrator', 'Registrar'].includes(userRole.value)
  })
  
  const canManageScheduling = computed(() => {
    return ['Administrator', 'Registrar', 'Instructor'].includes(userRole.value)
  })
  
  const canManageCommunications = computed(() => {
    return ['Administrator', 'Registrar'].includes(userRole.value)
  })
  
  const canViewReports = computed(() => {
    return ['Administrator', 'Registrar', 'Finance'].includes(userRole.value)
  })
  
  const canManageDocuments = computed(() => {
    return ['Administrator', 'Registrar'].includes(userRole.value)
  })
  
  const isStudent = computed(() => {
    return userRole.value === 'Student'
  })
  
  const isAdmin = computed(() => {
    return userRole.value === 'Administrator'
  })
  
  // Methods
  const setUserRole = (role) => {
    userRole.value = role
    // Update current user role
    currentUser.value.role = role
    
    // In a real app, this would make an API call to update the user's session
    console.log(`Role changed to: ${role}`)
  }
  
  const login = async (credentials) => {
    // Mock login - in real app, this would authenticate with backend
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      isAuthenticated.value = true
      currentUser.value = {
        id: 1,
        name: credentials.name || 'User',
        email: credentials.email,
        role: credentials.role || 'Student'
      }
      userRole.value = currentUser.value.role
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }
  
  const logout = () => {
    isAuthenticated.value = false
    userRole.value = null
    currentUser.value = null
  }
  
  const hasPermission = (permission) => {
    // Define permission mappings
    const permissions = {
      'manage_students': canManageStudents.value,
      'manage_finance': canManageFinance.value,
      'manage_admissions': canManageAdmissions.value,
      'manage_scheduling': canManageScheduling.value,
      'manage_communications': canManageCommunications.value,
      'view_reports': canViewReports.value,
      'manage_documents': canManageDocuments.value
    }
    
    return permissions[permission] || false
  }
  
  const canAccessPage = (page) => {
    const pagePermissions = {
      'dashboard': ['Administrator', 'Registrar', 'Finance', 'Instructor'],
      'student-portal': ['Student', 'Administrator'],
      'admissions': ['Administrator', 'Registrar'],
      'academic': ['Administrator', 'Registrar', 'Instructor'],
      'scheduling': ['Administrator', 'Registrar', 'Instructor'],
      'communications': ['Administrator', 'Registrar'],
      'financial': ['Administrator', 'Finance'],
      'documents': ['Administrator', 'Registrar', 'Student'],
      'compliance': ['Administrator', 'Registrar']
    }
    
    return pagePermissions[page]?.includes(userRole.value) || false
  }
  
  return {
    // State
    userRole,
    isAuthenticated,
    currentUser,
    
    // Computed permissions
    canManageStudents,
    canManageFinance,
    canManageAdmissions,
    canManageScheduling,
    canManageCommunications,
    canViewReports,
    canManageDocuments,
    isStudent,
    isAdmin,
    
    // Methods
    setUserRole,
    login,
    logout,
    hasPermission,
    canAccessPage
  }
}