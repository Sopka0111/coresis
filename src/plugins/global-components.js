// Global Components Registration

// Import all components
import MainLayout from '../layouts/MainLayout.vue'
import RouterLayout from '../layouts/RouterLayout.vue'
import DashboardCards from '../components/DashboardCards.vue'
import BarChart from '@/components/BarChart.vue'
import ActivitiesCard from '@/components/ActivitiesCard.vue'
import AnnouncementsCard from '@/components/AnnouncementsCard.vue'
import TodoListCard from '@/components/TodoListCard.vue'
import NotificationsCard from '@/components/NotificationsCard.vue'
import DocumentsCard from '@/components/DocumentsCard.vue'
import CalendarView from '@/components/CalendarView.vue'
import StudentFilterCard from '@/components/StudentFilterCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import StudentTable from '@/components/StudentTable.vue'
import StudentDetailCard from '@/components/StudentDetailCard.vue'
import StudentStatsChart from '@/components/StudentStatsChart.vue'
import StatusChart from '@/components/StatusChart.vue'
import StudentFinanceCard from '@/components/StudentFinanceCard.vue'
import FinanceChart from '@/components/FinanceChart.vue'
import BalanceChart from '@/components/BalanceChart.vue'
import FinanceFilterBar from '@/components/FinanceFilterBar.vue'
import RoleSelector from '@/components/RoleSelector.vue'
import AppBar from '../components/AppBar.vue'
import NavigationDrawer from '../components/NavigationDrawer.vue'
import HeaderBar from '../components/HeaderBar.vue'
import SidebarNav from '../components/SidebarNav.vue'
import SamplePage from '../components/SamplePage.vue'

// Import new accounting components
import AccountingFilterBar from '@/components/AccountingFilterBar.vue'
import AccountingTable from '@/components/AccountingTable.vue'
import TransactionDetailCard from '@/components/TransactionDetailCard.vue'
import AccountingSummaryChart from '@/components/AccountingSummaryChart.vue'
import PlacementFilterBar from '@/components/PlacementFilterBar.vue'
import PlacementTable from '@/components/PlacementTable.vue'
import StudentPlacementCard from '@/components/StudentPlacementCard.vue'
import PlacementSummaryChart from '@/components/PlacementSummaryChart.vue'

// Import pages
import Dashboard from '@/pages/Dashboard.vue'
import HomeView from '@/pages/HomeView.vue'
import StudentManagement from '@/pages/StudentManagement.vue'
import RegistrarPage from '@/pages/RegistrarPage.vue'
import FinancePage from '@/pages/FinancePage.vue'
import AccountingPage from '@/pages/AccountingPage.vue'
import PlacementPage from '@/pages/PlacementPage.vue'
import ReportsPage from '@/pages/ReportsPage.vue'
import ManagementPage from '@/pages/ManagementPage.vue'
import SetupPage from '@/pages/SetupPage.vue'
import Admissions from '@/pages/Admissions.vue'

// Import composables
import { useAuth } from '../composables/useAuth'
import { usePdfExport } from '../composables/usePdfExport'

// Export plugin function for proper Vue app initialization
export default function globalComponents(app) {
  // Register layouts globally
  app.component('MainLayout', MainLayout)
  app.component('RouterLayout', RouterLayout)

  // Register components globally
  app.component('DashboardCards', DashboardCards)
  app.component('BarChart', BarChart)
  app.component('ActivitiesCard', ActivitiesCard)
  app.component('AnnouncementsCard', AnnouncementsCard)
  app.component('TodoListCard', TodoListCard)
  app.component('NotificationsCard', NotificationsCard)
  app.component('DocumentsCard', DocumentsCard)
  app.component('CalendarView', CalendarView)
  app.component('StudentFilterCard', StudentFilterCard)
  app.component('FilterBar', FilterBar)
  app.component('StudentTable', StudentTable)
  app.component('StudentDetailCard', StudentDetailCard)
  app.component('StudentStatsChart', StudentStatsChart)
  app.component('StatusChart', StatusChart)
  app.component('StudentFinanceCard', StudentFinanceCard)
  app.component('FinanceChart', FinanceChart)
  app.component('BalanceChart', BalanceChart)
  app.component('FinanceFilterBar', FinanceFilterBar)
  app.component('RoleSelector', RoleSelector)
  app.component('AppBar', AppBar)
  app.component('NavigationDrawer', NavigationDrawer)
  app.component('HeaderBar', HeaderBar)
  app.component('SidebarNav', SidebarNav)
  app.component('SamplePage', SamplePage)
  app.component('AccountingFilterBar', AccountingFilterBar)
  app.component('AccountingTable', AccountingTable)
  app.component('TransactionDetailCard', TransactionDetailCard)
  app.component('AccountingSummaryChart', AccountingSummaryChart)
  app.component('PlacementFilterBar', PlacementFilterBar)
  app.component('PlacementTable', PlacementTable)
  app.component('StudentPlacementCard', StudentPlacementCard)
  app.component('PlacementSummaryChart', PlacementSummaryChart)

  // Register pages globally
  app.component('Dashboard', Dashboard)
  app.component('HomeView', HomeView)
  app.component('StudentManagement', StudentManagement)
  app.component('RegistrarPage', RegistrarPage)
  app.component('FinancePage', FinancePage)
  app.component('AccountingPage', AccountingPage)
  app.component('PlacementPage', PlacementPage)
  app.component('ReportsPage', ReportsPage)
  app.component('ManagementPage', ManagementPage)
  app.component('SetupPage', SetupPage)
  app.component('Admissions', Admissions)

  // Provide composables globally
  app.provide('useAuth', useAuth)
  app.provide('usePdfExport', usePdfExport)
}