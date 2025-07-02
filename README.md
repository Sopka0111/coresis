# 🌿 Trade School SIS - Student Information System

A modern, responsive Student Information System specifically designed for trade schools, wellness institutes, and massage therapy programs. Built from the ground up with Vue 3, Vuetify 3, and Chart.js featuring a beautiful wellness-inspired theme.

## ✨ Features

### � Wellness-Inspired Design
- **Primary Color**: #8BC34A (Light green - wellness primary)
- **Secondary Color**: #C5E1A5 (Light green secondary)  
- **Background**: #F1F8E9 (Light green background)
- **Fully responsive** design (desktop/tablet/mobile)
- **Material Design** components with Vuetify 3

### 📊 Dashboard & Analytics
- **Interactive Dashboard** with real-time statistics
- **StatCard Components** with trend indicators
- **Activity Feed** showing recent system activities
- **Chart.js Integration** for beautiful data visualizations
- **Role-based Access Control** with different views

### 👥 Core Modules

#### 🎓 Student Portal
- **Personal Dashboard** for students
- **Schedule View** with class information
- **Grade Tracking** with GPA display
- **Financial Overview** with account balance
- **Announcements** from administration

#### � Admissions & Lead Tracking
- **Lead Management** with pipeline tracking
- **Application Processing** (inquiry → applied → enrolled)
- **Follow-up Management** and notes
- **Conversion Analytics** 

#### � Academic Records
- **Course Management** and enrollment tracking
- **Grade Entry** and GPA calculation
- **Progress Monitoring** and milestones
- **Transcript Management**

#### 📅 Class Scheduling
- **Calendar Integration** for class schedules
- **Room and Instructor** assignment
- **Availability Management**
- **Event Planning** for school activities

#### 🔔 Communications
- **Announcement System** with priority levels
- **Message Management** between staff and students
- **Notification Center** for important alerts
- **Email/SMS Integration** ready

#### � Financial Management
- **Tuition Tracking** and payment processing
- **Account Balance** management
- **Payment History** and reporting
- **Financial Aid** tracking

#### 📄 Document Center
- **File Upload System** for student documents
- **Document Organization** by category
- **Access Control** and permissions
- **Download Management**

#### 📊 Compliance & Reporting
- **Attendance Reports** with analytics
- **Completion Rate** tracking
- **Hours Logged** for certifications
- **Export Capabilities** for accreditation

## 🛠️ Technical Stack

- **Vue 3** - Modern reactive framework with Composition API
- **Vuetify 3** - Material Design component library
- **Chart.js** - Beautiful, responsive charts
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client for API integration

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Clone or navigate to the Trade School SIS directory:**
```bash
cd trade-school-sis
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser to:**
```
http://localhost:4000
```

### Build for Production
```bash
npm run build
```

## � User Roles & Access

### Administrator
- Full system access
- All modules and features
- User management capabilities
- System configuration

### Registrar  
- Student enrollment and records
- Academic tracking
- Attendance monitoring
- Transcript management

### Finance
- Payment processing
- Financial reporting
- Account management
- Billing operations

### Instructor
- Grade entry
- Attendance tracking
- Student progress viewing
- Course management

### Student
- Personal dashboard access
- Schedule and grade viewing
- Financial status monitoring
- Document downloads
- Announcement reading

## 📱 Responsive Design

The system works beautifully across all devices:
- **Desktop** - Full sidebar navigation with multi-column layouts
- **Tablet** - Optimized layouts with collapsible navigation
- **Mobile** - Touch-friendly interface with drawer navigation

## 🎨 Customization

### Theme Colors
Easily customize the wellness color palette in `src/plugins/vuetify.js`:

```javascript
colors: {
  primary: '#8BC34A',      // Your brand color
  secondary: '#C5E1A5',    // Secondary brand color
  background: '#F1F8E9',   // Background color
  'wellness-light': '#DCEDC8',
  'wellness-dark': '#689F38'
}
```

### Adding New Features
The modular architecture makes it easy to extend:

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update navigation in `src/App.vue`
4. Add composables in `src/composables/` for data management

## 📊 Sample Data

The system includes realistic sample data:
- Student records and profiles
- Course schedules and grades
- Financial transactions
- Lead tracking examples
- Activity feeds and announcements

## 🔧 API Integration

Ready for backend integration. Update components to connect to your API:

```javascript
// Example API integration
const fetchStudents = async () => {
  const response = await axios.get('/api/students')
  students.value = response.data
}
```

## 📈 Key Features in Detail

### StatCard Component
- Displays metrics with trend indicators
- Optional progress bars
- Color-coded by importance
- Hover animations

### ActivityCard Component  
- Real-time activity feed
- Filterable by type and user
- Priority indicators
- Time formatting

### Role-Based Navigation
- Dynamic menu based on user role
- Permissions-based access control
- Seamless role switching (demo)

### Wellness Theme
- Calming green color palette
- Smooth transitions and animations
- Accessibility-focused design
- Professional appearance

## 🚀 Production Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Deploy the `dist` folder** to your web server

3. **Configure environment variables** for API endpoints

4. **Set up authentication** and user management

5. **Configure database** connections for real data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Vuetify team for the beautiful components
- Chart.js for visualization capabilities
- Trade school community for requirements and feedback

## 📞 Support

For questions, feature requests, or support:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**🌿 Built with care for trade schools and wellness institutes**

### 🎯 Quick Start Guide

1. **Access the system** at `http://localhost:4000`
2. **Switch roles** using the dropdown in the top-right
3. **Explore modules** using the sidebar navigation
4. **View Student Portal** by switching to "Student" role
5. **Check Dashboard** for overview statistics and activities

**Current Status:** ✅ Fully functional standalone system ready for development and customization! 