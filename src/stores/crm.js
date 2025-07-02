import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Configure axios defaults
axios.defaults.baseURL = API_BASE
axios.defaults.headers.common['Content-Type'] = 'application/json'

export const useCrmStore = defineStore('crm', () => {
  // Authentication State
  const user = ref(null)
  const token = ref(localStorage.getItem('crm_token'))
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  // Loading States
  const loading = ref(false)
  const pageLoading = ref(false)

  // Snackbar State
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
    timeout: 4000
  })

  // Data States
  const leads = ref([])
  const accounts = ref([])
  const contacts = ref([])
  const deals = ref([])
  const tasks = ref([])
  const activities = ref([])

  // Pagination States
  const pagination = ref({
    leads: { page: 1, limit: 20, total: 0, pages: 0 },
    accounts: { page: 1, limit: 20, total: 0, pages: 0 },
    contacts: { page: 1, limit: 20, total: 0, pages: 0 },
    deals: { page: 1, limit: 20, total: 0, pages: 0 },
    tasks: { page: 1, limit: 20, total: 0, pages: 0 },
    activities: { page: 1, limit: 20, total: 0, pages: 0 }
  })

  // Filter States
  const filters = ref({
    leads: {},
    accounts: {},
    contacts: {},
    deals: {},
    tasks: {},
    activities: {}
  })

  // Statistics
  const stats = ref({
    leads: {},
    deals: {},
    pipeline: {}
  })

  // Set axios authorization header
  const setAuthHeader = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      localStorage.setItem('crm_token', authToken)
      token.value = authToken
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('crm_token')
      token.value = null
    }
  }

  // Initialize auth header on store creation
  if (token.value) {
    setAuthHeader(token.value)
  }

  // Show notification
  const showMessage = (message, color = 'success', timeout = 4000) => {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout
    }
  }

  // Authentication Actions
  const login = async (email, password) => {
    try {
      loading.value = true
      const response = await axios.post('/auth/login', { email, password })
      
      const { token: authToken, user: userData } = response.data
      user.value = userData
      setAuthHeader(authToken)
      
      showMessage('Login successful!', 'success')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      const response = await axios.post('/auth/register', userData)
      
      const { token: authToken, user: newUser } = response.data
      user.value = newUser
      setAuthHeader(authToken)
      
      showMessage('Registration successful!', 'success')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    user.value = null
    setAuthHeader(null)
    
    // Clear all data
    leads.value = []
    accounts.value = []
    contacts.value = []
    deals.value = []
    tasks.value = []
    activities.value = []
    
    showMessage('Logged out successfully', 'info')
  }

  const loadUserProfile = async () => {
    if (!token.value) return
    
    try {
      const response = await axios.get('/auth/profile')
      user.value = response.data.user
    } catch (error) {
      console.error('Failed to load user profile:', error)
      if (error.response?.status === 401) {
        logout()
      }
    }
  }

  // Leads Actions
  const fetchLeads = async (page = 1, filters = {}) => {
    try {
      pageLoading.value = true
      const params = { page, limit: 20, ...filters }
      const response = await axios.get('/leads', { params })
      
      leads.value = response.data.leads
      pagination.value.leads = response.data.pagination
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch leads'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      pageLoading.value = false
    }
  }

  const createLead = async (leadData) => {
    try {
      loading.value = true
      const response = await axios.post('/leads', leadData)
      
      leads.value.unshift(response.data.lead)
      showMessage('Lead created successfully!', 'success')
      
      return { success: true, data: response.data.lead }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create lead'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const updateLead = async (leadId, leadData) => {
    try {
      loading.value = true
      const response = await axios.put(`/leads/${leadId}`, leadData)
      
      const index = leads.value.findIndex(l => l._id === leadId)
      if (index !== -1) {
        leads.value[index] = response.data.lead
      }
      
      showMessage('Lead updated successfully!', 'success')
      return { success: true, data: response.data.lead }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update lead'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const convertLead = async (leadId, accountData) => {
    try {
      loading.value = true
      const response = await axios.post(`/leads/${leadId}/convert`, accountData)
      
      // Update lead in the list
      const index = leads.value.findIndex(l => l._id === leadId)
      if (index !== -1) {
        leads.value[index] = response.data.lead
      }
      
      // Add new account and contact to their respective arrays
      if (response.data.account) {
        accounts.value.unshift(response.data.account)
      }
      if (response.data.contact) {
        contacts.value.unshift(response.data.contact)
      }
      
      showMessage('Lead converted successfully!', 'success')
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to convert lead'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Deals Actions
  const fetchDeals = async (page = 1, filters = {}) => {
    try {
      pageLoading.value = true
      const params = { page, limit: 20, ...filters }
      const response = await axios.get('/deals', { params })
      
      deals.value = response.data.deals
      pagination.value.deals = response.data.pagination
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch deals'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      pageLoading.value = false
    }
  }

  const fetchKanbanDeals = async () => {
    try {
      const response = await axios.get('/deals/kanban')
      return { success: true, data: response.data.kanban }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch kanban data'
      showMessage(message, 'error')
      return { success: false, error: message }
    }
  }

  const createDeal = async (dealData) => {
    try {
      loading.value = true
      const response = await axios.post('/deals', dealData)
      
      deals.value.unshift(response.data.deal)
      showMessage('Deal created successfully!', 'success')
      
      return { success: true, data: response.data.deal }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create deal'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const updateDeal = async (dealId, dealData) => {
    try {
      loading.value = true
      const response = await axios.put(`/deals/${dealId}`, dealData)
      
      const index = deals.value.findIndex(d => d._id === dealId)
      if (index !== -1) {
        deals.value[index] = response.data.deal
      }
      
      showMessage('Deal updated successfully!', 'success')
      return { success: true, data: response.data.deal }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update deal'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const closeDealWon = async (dealId, data = {}) => {
    try {
      loading.value = true
      const response = await axios.put(`/deals/${dealId}/close-won`, data)
      
      const index = deals.value.findIndex(d => d._id === dealId)
      if (index !== -1) {
        deals.value[index] = response.data.deal
      }
      
      showMessage('Deal closed as won!', 'success')
      return { success: true, data: response.data.deal }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to close deal'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const closeDealLost = async (dealId, data) => {
    try {
      loading.value = true
      const response = await axios.put(`/deals/${dealId}/close-lost`, data)
      
      const index = deals.value.findIndex(d => d._id === dealId)
      if (index !== -1) {
        deals.value[index] = response.data.deal
      }
      
      showMessage('Deal closed as lost', 'warning')
      return { success: true, data: response.data.deal }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to close deal'
      showMessage(message, 'error')
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Statistics Actions
  const fetchLeadStats = async () => {
    try {
      const response = await axios.get('/leads/stats/summary')
      stats.value.leads = response.data.summary
      return { success: true }
    } catch (error) {
      console.error('Failed to fetch lead stats:', error)
      return { success: false }
    }
  }

  const fetchPipelineStats = async () => {
    try {
      const response = await axios.get('/deals/stats/pipeline')
      stats.value.pipeline = response.data.summary
      return { success: true }
    } catch (error) {
      console.error('Failed to fetch pipeline stats:', error)
      return { success: false }
    }
  }

  // Dashboard Actions
  const fetchDashboardData = async () => {
    try {
      pageLoading.value = true
      await Promise.all([
        fetchLeadStats(),
        fetchPipelineStats()
      ])
    } finally {
      pageLoading.value = false
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    pageLoading,
    snackbar,
    leads,
    accounts,
    contacts,
    deals,
    tasks,
    activities,
    pagination,
    filters,
    stats,

    // Actions
    showMessage,
    login,
    register,
    logout,
    loadUserProfile,
    fetchLeads,
    createLead,
    updateLead,
    convertLead,
    fetchDeals,
    fetchKanbanDeals,
    createDeal,
    updateDeal,
    closeDealWon,
    closeDealLost,
    fetchLeadStats,
    fetchPipelineStats,
    fetchDashboardData
  }
})