import { createRouter, createWebHistory } from 'vue-router'
import { useCrmStore } from '@/stores/crm'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leads',
    name: 'Leads',
    component: () => import('@/pages/Leads.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leads/new',
    name: 'NewLead',
    component: () => import('@/pages/NewLead.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leads/:id',
    name: 'LeadDetail',
    component: () => import('@/pages/LeadDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import('@/pages/Accounts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts/new',
    name: 'NewAccount',
    component: () => import('@/pages/NewAccount.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts/:id',
    name: 'AccountDetail',
    component: () => import('@/pages/AccountDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('@/pages/Contacts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contacts/new',
    name: 'NewContact',
    component: () => import('@/pages/NewContact.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contacts/:id',
    name: 'ContactDetail',
    component: () => import('@/pages/ContactDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/deals',
    name: 'Deals',
    component: () => import('@/pages/Deals.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/deals/new',
    name: 'NewDeal',
    component: () => import('@/pages/NewDeal.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/deals/:id',
    name: 'DealDetail',
    component: () => import('@/pages/DealDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/deals/kanban',
    name: 'DealsKanban',
    component: () => import('@/pages/DealsKanban.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/pages/Tasks.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/new',
    name: 'NewTask',
    component: () => import('@/pages/NewTask.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('@/pages/TaskDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/pages/Activities.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activities/new',
    name: 'NewActivity',
    component: () => import('@/pages/NewActivity.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activities/:id',
    name: 'ActivityDetail',
    component: () => import('@/pages/ActivityDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/pages/Reports.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: { 
      requiresAuth: true,
      requiresRole: ['Admin']
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/Search.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const crmStore = useCrmStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    if (!crmStore.isAuthenticated) {
      return next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }
    
    // Load user profile if not loaded
    if (!crmStore.user) {
      try {
        await crmStore.loadUserProfile()
      } catch (error) {
        console.error('Failed to load user profile:', error)
        return next({ name: 'Login' })
      }
    }
    
    // Check role-based access
    if (to.meta.requiresRole && to.meta.requiresRole.length > 0) {
      const userRole = crmStore.user?.role
      if (!userRole || !to.meta.requiresRole.includes(userRole)) {
        crmStore.showMessage('Access denied. Insufficient permissions.', 'error')
        return next({ name: 'Dashboard' })
      }
    }
  }
  
  // Redirect authenticated users away from login page
  if (to.name === 'Login' && crmStore.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }
  
  next()
})

export default router