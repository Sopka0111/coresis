# School Transportation CRM System

A comprehensive Customer Relationship Management (CRM) system specifically designed for school transportation sales and marketing teams. This application helps manage leads, track deals, automate outreach, and centralize client communications with school districts and educational institutions.

## 🚌 Overview

This CRM system is tailored for the education, EdTech, and school transportation industry, providing specialized tools to manage relationships with school districts, track transportation deals, and streamline sales processes.

## 🛠 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component library
- **Chart.js** - Data visualization and analytics
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## 🎨 Design

- **Color Palette**: Light green and blue theme
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Material Design**: Clean, intuitive user interface
- **Accessibility**: WCAG 2.1 compliant

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All CRM features

### Sales Rep
- Lead and deal management
- Account and contact management
- Activity tracking
- Task management
- Pipeline reporting

### Marketing Agent
- Lead generation and qualification
- Campaign management
- Activity logging
- Basic reporting

## 📋 Core Features

### 🎯 Lead Management
- Capture leads from multiple sources (events, referrals, website, etc.)
- Lead scoring and qualification
- Status tracking: New → Contacted → Qualified → Proposal → Closed Won/Lost
- Lead conversion to accounts and contacts
- Advanced filtering and search

### 🏢 Account Management
- School district and organization profiles
- Contact management within accounts
- Relationship tracking
- Account hierarchy support
- Revenue tracking

### 👤 Contact Management
- Individual contact profiles
- Role-based categorization (Decision Maker, Influencer, User, etc.)
- Communication preferences
- Engagement scoring
- Interaction history

### 💼 Deal Pipeline
- Visual Kanban board for deal tracking
- Customizable sales stages
- Probability and value tracking
- Deal progression automation
- Win/loss analysis

### ✅ Task Management
- Task assignment and tracking
- Due date reminders
- Recurring tasks
- Priority levels
- Task automation

### 📊 Activity Logging
- Call, email, meeting, and note tracking
- Automatic activity creation
- Communication history
- Follow-up scheduling
- Attachment support

### 📈 Reporting & Analytics
- Sales pipeline analytics
- Lead source performance
- Conversion rate tracking
- Revenue forecasting
- User performance metrics
- Custom dashboard views

### 🔄 Automation Tools
- Lead scoring automation
- Task generation for new deals
- Follow-up reminders
- Email templates
- Workflow automation

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd sis-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/school-transport-crm
DB_NAME=school_transport_crm

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=3001
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Lead Endpoints
- `GET /api/leads` - Get leads with filtering
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead
- `POST /api/leads/:id/convert` - Convert lead to account
- `DELETE /api/leads/:id` - Delete lead

### Deal Endpoints
- `GET /api/deals` - Get deals with filtering
- `GET /api/deals/kanban` - Get deals in Kanban format
- `POST /api/deals` - Create new deal
- `GET /api/deals/:id` - Get deal details
- `PUT /api/deals/:id` - Update deal
- `PUT /api/deals/:id/close-won` - Close deal as won
- `PUT /api/deals/:id/close-lost` - Close deal as lost

## 🎯 Usage Examples

### Creating a New Lead
1. Navigate to Leads section
2. Click "Add New Lead"
3. Fill in lead information:
   - Name and contact details
   - School district information
   - Lead source
   - Estimated value
4. Assign to team member
5. Save and begin qualification process

### Converting a Lead
1. Open qualified lead
2. Click "Convert Lead"
3. Create associated account (school district)
4. Contact is automatically created
5. Lead status updated to "Closed Won"

### Managing Deal Pipeline
1. Use Kanban view for visual pipeline management
2. Drag deals between stages
3. Update deal values and probabilities
4. Set close dates and next steps
5. Track win/loss reasons

### Generating Reports
1. Access Reports section
2. Select date range and filters
3. View metrics:
   - Pipeline value
   - Conversion rates
   - Lead source performance
   - Team performance

## � Mobile Responsiveness

The CRM is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## 🎨 Customization

### Theme Customization
The color scheme can be customized in `src/plugins/vuetify.js`:
- Primary color: Light Green (#4CAF50)
- Secondary color: Blue (#2196F3)
- Accent colors for different states

### Adding Custom Fields
1. Update database models in `sis-backend/models/`
2. Add fields to frontend forms
3. Update API endpoints as needed

## 🔧 Deployment

### Production Build
```bash
# Frontend
npm run build

# Backend
npm start
```

### Environment Variables for Production
Update `.env` files with production values:
- Database URLs
- JWT secrets
- Email configuration
- Domain settings

## 📊 Demo Data

The system includes demo credentials for testing:
- **Admin**: admin@crm.com / admin123
- **Sales Rep**: sales@crm.com / sales123
- **Marketing Agent**: marketing@crm.com / marketing123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## � License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions and support:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🚀 Future Enhancements

Planned features for future versions:
- Email integration (Gmail, Outlook)
- Calendar synchronization
- Document management
- Advanced reporting
- Mobile applications
- Integration with QuickBooks
- HubSpot connector
- SMS capabilities
- AI-powered insights

---

Built with ❤️ for the school transportation industry 