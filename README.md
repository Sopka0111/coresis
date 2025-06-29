# Massage School Management Dashboard

A comprehensive Vue 3 dashboard for managing massage school operations, built with Vuetify 3, Chart.js, and TypeScript.

## 🚀 Features

### Core Dashboard
- **Real-time Analytics**: Interactive charts and statistics
- **Student Management**: Complete student lifecycle management
- **Financial Tracking**: Comprehensive financial and accounting tools
- **Role-based Access Control**: Secure access based on user roles
- **Responsive Design**: Mobile-first approach with Vuetify 3

### Role-Based Access Control
- **Admin**: Full system access and configuration
- **Finance**: Financial management and accounting tools
- **Registrar**: Academic records and student management
- **Instructor**: Course and student interaction tools
- **Student**: Limited access to personal information

### Advanced Features
- **PDF Export**: Generate invoices and financial reports using jsPDF
- **Real-time Data**: Live updates and notifications
- **Advanced Filtering**: Multi-criteria search and filtering
- **Interactive Charts**: Dynamic data visualization with Chart.js

## 📊 Dashboard Components

### Student Management
- **StudentTable**: Comprehensive student listing with advanced filtering
- **StudentDetailCard**: Detailed student information display
- **StudentFilterCard**: Advanced filtering and search capabilities
- **StudentStatsChart**: Visual student statistics and trends
- **StatusChart**: Student status distribution visualization

### Financial Management
- **FinancePage**: Complete financial overview and management
- **FinanceChart**: Revenue and expense visualization
- **BalanceChart**: Financial balance tracking
- **FinanceFilterBar**: Financial data filtering tools
- **StudentFinanceCard**: Individual student financial information

### Accounting System
- **AccountingPage**: Comprehensive accounting management
- **AccountingTable**: Transaction listing with advanced features
- **AccountingFilterBar**: Multi-criteria transaction filtering
- **TransactionDetailCard**: Detailed transaction information
- **AccountingSummaryChart**: Financial summary visualization

### Placement Management
- **PlacementPage**: Student placement and employment tracking
- **PlacementTable**: Placement data with filtering and sorting
- **PlacementFilterBar**: Advanced placement data filtering
- **StudentPlacementCard**: Individual student placement details
- **PlacementSummaryChart**: Placement outcomes visualization

### Reports System
- **ReportsPage**: Comprehensive reporting interface
- **Role-based Report Access**: Reports filtered by user permissions
- **Multiple Export Formats**: PDF, CSV, XLSX export options
- **Scheduled Reports**: Email-based report scheduling
- **Search and Filter**: Find reports by category or keyword

### Management Portal
- **ManagementPage**: Administrative tools and system management
- **Dynamic Role Switching**: Real-time role-based interface updates
- **Quick Actions**: Rapid access to common administrative tasks
- **Section-based Organization**: Logical grouping of management tools
- **Permission-based Access**: Tools filtered by user role

### System Setup
- **SetupPage**: Comprehensive system configuration interface
- **Setup Progress Tracking**: Visual progress indicators
- **Quick Setup Wizards**: Guided configuration processes
- **Category-based Organization**: Logical grouping of settings
- **Configuration Status**: Real-time setup completion tracking

## 🛠️ Technical Stack

- **Vue 3**: Progressive JavaScript framework
- **Vuetify 3**: Material Design component library
- **Chart.js**: Interactive chart library
- **TypeScript**: Type-safe JavaScript development
- **jsPDF**: PDF generation for reports and invoices
- **Vue Router**: Client-side routing
- **Composition API**: Modern Vue 3 reactivity system

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── charts/         # Chart.js components
│   ├── cards/          # Information display cards
│   ├── tables/         # Data table components
│   └── filters/        # Filter and search components
├── pages/              # Main application pages
│   ├── Dashboard.vue
│   ├── StudentManagement.vue
│   ├── FinancePage.vue
│   ├── AccountingPage.vue
│   ├── PlacementPage.vue
│   ├── ReportsPage.vue
│   ├── ManagementPage.vue
│   └── SetupPage.vue
├── composables/        # Reusable composition functions
├── layouts/            # Page layout components
└── plugins/            # Vue plugins and configurations
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd massage-school-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=your_api_base_url
VITE_APP_TITLE=Massage School Dashboard
```

### Role Configuration
User roles are managed through the `useAuth` composable:
- Modify `src/composables/useAuth.ts` to integrate with your authentication system
- Update role permissions in individual components as needed

## 📈 Features in Detail

### Reports System
The Reports page provides comprehensive reporting capabilities:

- **Category-based Organization**: Reports organized by functional areas
- **Role-based Access**: Reports filtered by user permissions
- **Multiple Export Formats**: PDF, CSV, and XLSX export options
- **Scheduled Reports**: Email-based report scheduling
- **Search and Filter**: Find reports by category or keyword
- **Quick Actions**: Rapid access to common reports

### Management Portal
The Management page offers administrative tools:

- **Dynamic Role Switching**: Real-time interface updates based on role
- **Section-based Organization**: Logical grouping of management tools
- **Quick Actions**: Rapid access to common administrative tasks
- **Permission-based Access**: Tools filtered by user role
- **Status Indicators**: Visual status of system components

### System Setup
The Setup page provides comprehensive configuration:

- **Setup Progress Tracking**: Visual progress indicators
- **Quick Setup Wizards**: Guided configuration processes
- **Category-based Organization**: Logical grouping of settings
- **Configuration Status**: Real-time setup completion tracking
- **Permission-based Access**: Settings filtered by user role

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔮 Roadmap

- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] API integration improvements
- [ ] Enhanced security features
- [ ] Performance optimizations
- [ ] Additional chart types and visualizations 