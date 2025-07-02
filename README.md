# Trade School Student Information System (SIS)

A modern, responsive Student Information System specifically designed for trade schools, wellness institutes, and massage therapy programs. Built with Vue 3, Vuetify 3, and Chart.js with a beautiful wellness-inspired theme.

## 🌿 Wellness-Inspired Design

The system features a calming green color palette perfect for wellness and trade school environments:
- **Primary**: #8BC34A (Light green)
- **Secondary**: #C5E1A5 (Light green secondary)
- **Background**: #F1F8E9 (Light green background)
- **Accent**: #66BB6A (Complementary green)

## ✨ Features

### 📊 Dashboard & Analytics
- **Interactive Dashboard** with real-time statistics
- **StatCard Components** with sparkline charts and trend indicators
- **Activity Feed** showing recent system activities
- **Chart.js Integration** for beautiful data visualizations
- **Role-based Access Control** with different views for different user types

### 👥 Student Management
- **Complete Student Profiles** with photos, contact info, emergency contacts
- **Academic Records** tracking courses, grades, and certifications
- **Attendance Monitoring** with automated alerts
- **Document Management** for transcripts, licenses, and IDs
- **Student Notes System** for tracking progress and issues

### 🎓 Student Portal
- **Personal Dashboard** for students to view their information
- **Schedule View** with calendar integration
- **Grade Tracking** with GPA calculation and certification progress
- **Financial Overview** including payment history and account balance
- **Document Access** for downloading transcripts and certificates
- **Announcements** from school administration

### 💰 Financial Management
- **Tuition Tracking** with payment schedules
- **Account Balances** and outstanding amounts
- **Payment History** with detailed transaction records
- **Financial Aid Management** including scholarships and grants
- **Invoice Generation** and automated billing
- **Reporting** for financial analysis

### 📝 Admissions & Lead Tracking
- **Lead Management** with intake forms and custom fields
- **Application Tracking** through different stages (inquiry → applied → enrolled)
- **Follow-up Reminders** and automated workflows
- **Conversion Analytics** from leads to enrolled students
- **Source Tracking** for marketing ROI analysis

### 📅 Scheduling & Calendar
- **Class Scheduling** with instructor and room assignments
- **Room Availability** tracking
- **Student Schedule View** with upcoming classes
- **Instructor Calendars** with teaching assignments
- **Event Management** for school activities

### 🔔 Communication Tools
- **Announcement System** with priority levels and targeting
- **In-app Messaging** between staff and students
- **Email/SMS Integration** for notifications
- **Notification Center** for important alerts
- **Read Confirmations** for critical announcements

### 📋 Academic Records
- **Course Management** with credit tracking
- **Grade Entry** and GPA calculation
- **Certification Milestones** and progress tracking
- **Transcript Generation** 
- **Academic Probation** alerts and monitoring

### 📄 Document Center
- **File Upload System** for student documents
- **Document Categories** (transcripts, licenses, IDs, etc.)
- **Download Management** with access controls
- **Document Expiration** tracking for licenses
- **Bulk Document Operations**

### 📊 Compliance & Reporting
- **Attendance Reports** with percentage calculations
- **Completion Rate Analytics** by program
- **Hours Logged** for certification requirements
- **Export Capabilities** (PDF/Excel) for accreditation
- **Custom Report Builder** for specific needs

## 🛠️ Technical Stack

### Frontend
- **Vue 3** - Modern, reactive JavaScript framework
- **Vuetify 3** - Material Design component library
- **Chart.js** - Beautiful, responsive charts
- **Vite** - Fast build tool and development server
- **TypeScript/JavaScript** - Type-safe development

### Components Architecture
- **StatCard** - Configurable statistics cards with charts
- **ActivityCard** - Activity feed with filtering and interactions
- **AnnouncementModal** - Comprehensive announcement creation/viewing
- **CalendarView** - Integrated calendar for scheduling
- **DocumentsCard** - File management interface

### State Management
- **Composables** - Vue 3 composition API for data management
- **useStudents** - Student and lead management
- **useAuth** - Authentication and role-based access
- **usePdfExport** - Report generation capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trade-school-sis
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 📱 Responsive Design

The system is fully responsive and works beautifully on:
- **Desktop** - Full feature access with sidebars and multiple columns
- **Tablet** - Optimized layouts with collapsible navigation
- **Mobile** - Touch-friendly interface with bottom navigation

## � User Roles & Permissions

### Administrator
- Full system access
- User management
- System configuration
- All reports and analytics

### Registrar
- Student enrollment and records
- Academic tracking
- Transcript management
- Attendance monitoring

### Finance
- Payment processing
- Financial reporting
- Account management
- Billing and invoicing

### Instructor
- Grade entry
- Attendance taking
- Student progress viewing
- Course material access

### Student
- Personal dashboard
- Schedule viewing
- Grade access
- Document downloads
- Announcement reading

## 🎨 Customization

### Theming
The system uses Vuetify's theming system. Colors can be easily customized in `src/plugins/vuetify.js`:

```javascript
themes: {
  light: {
    colors: {
      primary: '#8BC34A',      // Your brand color
      secondary: '#C5E1A5',    // Secondary brand color
      background: '#F1F8E9',   // Background color
      // ... other colors
    }
  }
}
```

### Adding New Features
The modular architecture makes it easy to add new features:

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Extend composables in `src/composables/`
4. Register components in `src/plugins/global-components.js`

## 📊 Sample Data

The system comes with comprehensive sample data including:
- Student records with realistic information
- Course schedules and grades
- Financial transactions
- Announcements and activities
- Lead tracking examples

## 🔧 API Integration

The system is designed to work with REST APIs. Update the composables to connect to your backend:

```javascript
// In composables/useStudents.js
const loadStudents = async () => {
  const response = await fetch('/api/students')
  const data = await response.json()
  students.value = data
}
```

## 📈 Analytics & Reporting

Built-in analytics include:
- **Student Metrics** - Enrollment, retention, completion rates
- **Financial Analytics** - Revenue, outstanding balances, payment trends
- **Academic Performance** - GPA distributions, course success rates
- **Attendance Patterns** - Chronic absenteeism, attendance trends
- **Lead Conversion** - Marketing effectiveness, source analysis

## 🛡️ Security Features

- **Role-based Access Control** - Different permissions for different users
- **Input Validation** - All forms include proper validation
- **XSS Protection** - Safe rendering of user content
- **File Upload Security** - File type and size restrictions
- **Session Management** - Secure authentication handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Vuetify team for the beautiful component library
- Chart.js for the visualization capabilities
- The open-source community for inspiration and support

## � Support

For support, feature requests, or bug reports, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for trade schools and wellness institutes** 