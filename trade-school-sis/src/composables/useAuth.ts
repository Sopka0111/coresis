import { ref, computed, readonly } from 'vue'

export type UserRole = 'admin' | 'finance' | 'registrar' | 'instructor' | 'student'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

const currentUser = ref<User | null>(null)
const isAuthenticated = ref(false)

export function useAuth() {
  // Set user role (for demo purposes - in real app this would come from login)
  const setUserRole = (role: UserRole) => {
    currentUser.value = {
      id: '1',
      name: 'Demo User',
      email: 'demo@massageschool.com',
      role,
      permissions: getPermissionsForRole(role)
    }
    isAuthenticated.value = true
  }

  // Get permissions for a specific role
  const getPermissionsForRole = (role: UserRole): string[] => {
    const permissions = {
      admin: ['view_all', 'edit_all', 'delete_all', 'view_sensitive_data', 'export_data', 'manage_users'],
      finance: ['view_finance', 'edit_finance', 'view_sensitive_data', 'export_data'],
      registrar: ['view_students', 'edit_students', 'view_basic_data'],
      instructor: ['view_students', 'view_basic_data'],
      student: ['view_own_data']
    }
    return permissions[role] || []
  }

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!currentUser.value) return false
    return currentUser.value.permissions.includes(permission)
  }

  // Check if user can view sensitive data
  const canViewSensitiveData = computed(() => {
    return hasPermission('view_sensitive_data')
  })

  // Check if user can export data
  const canExportData = computed(() => {
    return hasPermission('export_data')
  })

  // Check if user can manage students
  const canManageStudents = computed(() => {
    return hasPermission('view_students') || hasPermission('edit_students')
  })

  // Check if user can manage finance
  const canManageFinance = computed(() => {
    return hasPermission('view_finance') || hasPermission('edit_finance')
  })

  // Get current user role
  const userRole = computed(() => currentUser.value?.role || 'student')

  // Logout function
  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
  }

  return {
    currentUser: readonly(currentUser),
    isAuthenticated: readonly(isAuthenticated),
    userRole,
    setUserRole,
    hasPermission,
    canViewSensitiveData,
    canExportData,
    canManageStudents,
    canManageFinance,
    logout
  }
} 