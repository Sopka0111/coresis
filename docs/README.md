# CoreSIS - Powering Pathways. Fueling Futures.

> A comprehensive Student Information System designed for career-driven learning institutions.

## 🎯 Mission

CoreSIS empowers educational institutions to deliver exceptional student experiences through integrated learning management, financial tracking, and outcome analytics. Built for schools that train the trades, CoreSIS provides the tools needed to guide students from enrollment to successful career placement.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vue 3 + Vuetify 3 + TypeScript
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT + Role-based Access Control
- **Deployment**: Docker + Nginx + GitHub Actions
- **Monitoring**: UptimeRobot + Error Logging

### Core Modules
- **Admissions**: Student enrollment, demographics, lead tracking
- **Finance**: Tuition management, payment processing, accounting
- **Registrar**: Course management, grade tracking, academic history
- **Placement**: Job placement tracking, employer relationships
- **LMS**: Assignments, materials, submissions, forums
- **Reports**: Analytics, exports, scheduled reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/coresis.git
   cd coresis
   ```

2. **Backend Setup**
   ```bash
   cd sis-backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # In backend directory
   npm run seed:all
   ```

### Docker Deployment

```bash
# Clone and setup
git clone https://github.com/your-org/coresis.git
cd coresis

# Copy environment file
cp .env.example .env
# Edit .env with production values

# Deploy with Docker Compose
docker-compose up -d

# Seed initial data
docker-compose exec backend npm run seed:all
```

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full system access, user management
- **Registrar**: Course management, academic records
- **Finance**: Financial transactions, billing
- **Instructor**: Course materials, grading
- **Student**: Personal dashboard, assignments

### Default Accounts
- **Admin**: `admin@coresis.app` / `Temp2025!`
- **Student**: `demo.student@coresis.app` / `student2025`

## 📱 Features

### Student Dashboard
- 📚 Course overview and assignments
- 📊 Grade tracking and progress
- 💰 Financial status and payments
- 📅 Class schedule and calendar
- 💬 Course forums and messaging

### Instructor Tools
- 📝 Assignment creation and grading
- 📚 Course material management
- 👥 Student progress monitoring
- 📊 Grade analytics and reporting

### Administrative Features
- 👤 User management and role assignment
- 📈 System analytics and reporting
- 🔧 Configuration and settings
- 📋 Audit trails and logging

## 🌐 API Documentation

### Base URL
```
https://api.coresis.app
```

### Authentication
```bash
# Include JWT token in headers
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/students` - Student management
- `GET /api/courses` - Course management
- `GET /api/finance` - Financial records
- `GET /api/reports` - Analytics and reporting

## 🚀 Deployment

### Production Deployment
1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGO_URI=mongodb://your-mongo-uri
   export JWT_SECRET=your-super-secret-key
   ```

2. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **SSL Certificate**
   ```bash
   # Using Let's Encrypt
   certbot --nginx -d coresis.app
   ```

### CI/CD Pipeline
- **Staging**: Automatic deployment on `staging` branch
- **Production**: Manual deployment from `main` branch
- **Testing**: Automated tests on pull requests

## 📊 Monitoring & Health

### Health Checks
- **API Health**: `GET /api/health`
- **Database**: MongoDB connection status
- **Frontend**: Vue app loading status

### Monitoring Tools
- **Uptime**: UptimeRobot monitoring
- **Logs**: Centralized logging with error tracking
- **Performance**: Response time monitoring

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGO_URI=mongodb://localhost:27017/coresis

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
NODE_ENV=production
PORT=5000
CLIENT_URL=https://coresis.app
```

## 📚 Documentation

- [Installation Guide](INSTALL.md) - Detailed setup instructions
- [API Reference](API.md) - Complete API documentation
- [User Guide](USER_GUIDE.md) - End-user documentation
- [Admin Guide](ADMIN_GUIDE.md) - Administrative functions
- [Deployment Guide](DEPLOYMENT.md) - Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.coresis.app](https://docs.coresis.app)
- **Issues**: [GitHub Issues](https://github.com/your-org/coresis/issues)
- **Email**: support@coresis.app

## 🗺️ Roadmap

### Version 1.1 (Q3 2025)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with external LMS
- [ ] Multi-language support

### Version 1.2 (Q4 2025)
- [ ] AI-powered insights
- [ ] Advanced reporting engine
- [ ] API marketplace
- [ ] White-label solutions

---

**CoreSIS** - Powering Pathways. Fueling Futures. 🚀

Built with ❤️ for educational institutions worldwide. 