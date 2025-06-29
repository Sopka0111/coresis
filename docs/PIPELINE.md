# CoreSIS CI/CD Pipeline Documentation

## 🚀 Pipeline Overview

CoreSIS uses GitHub Actions for continuous integration and deployment, ensuring reliable, automated delivery from development to production.

### Pipeline Stages
1. **Build & Test** - Code compilation and automated testing
2. **Quality Assurance** - Code quality checks and security scanning
3. **Staging Deployment** - Automated deployment to staging environment
4. **Production Deployment** - Manual deployment to production
5. **Monitoring** - Health checks and performance monitoring

---

## 🔧 Pipeline Configuration

### GitHub Actions Workflow

#### Main Workflow (.github/workflows/main.yml)

```yaml
name: CoreSIS CI/CD Pipeline

on:
  push:
    branches: [ main, staging, develop ]
  pull_request:
    branches: [ main, staging ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Build and Test Job
  build-and-test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand(\"ping\").ok'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          sis-backend/package-lock.json
          frontend/package-lock.json

    - name: Install backend dependencies
      working-directory: ./sis-backend
      run: npm ci

    - name: Install frontend dependencies
      working-directory: ./frontend
      run: npm ci

    - name: Run backend tests
      working-directory: ./sis-backend
      run: |
        npm run test:unit
        npm run test:integration
      env:
        NODE_ENV: test
        MONGO_URI: mongodb://localhost:27017/coresis_test

    - name: Run frontend tests
      working-directory: ./frontend
      run: |
        npm run test:unit
        npm run test:e2e

    - name: Run security audit
      run: |
        cd sis-backend && npm audit --audit-level moderate
        cd ../frontend && npm audit --audit-level moderate

    - name: Run code quality checks
      run: |
        cd sis-backend && npm run lint
        cd ../frontend && npm run lint

  # Build Docker Images
  build-images:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push backend image
      uses: docker/build-push-action@v5
      with:
        context: ./sis-backend
        file: ./sis-backend/Dockerfile
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }}
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push frontend image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        file: ./frontend/Dockerfile
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    needs: build-images
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    environment: staging
    
    steps:
    - name: Deploy to staging
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /var/www/coresis
          git pull origin staging
          docker-compose -f docker-compose.staging.yml pull
          docker-compose -f docker-compose.staging.yml up -d
          docker system prune -f

    - name: Run health checks
      run: |
        sleep 30
        curl -f https://staging.coresis.app/api/health || exit 1
        curl -f https://staging.coresis.app/ || exit 1

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        text: 'CoreSIS deployed to staging successfully! 🚀'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  # Deploy to Production
  deploy-production:
    needs: build-images
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /var/www/coresis
          git pull origin main
          docker-compose -f docker-compose.production.yml pull
          docker-compose -f docker-compose.production.yml up -d
          docker system prune -f

    - name: Run health checks
      run: |
        sleep 30
        curl -f https://coresis.app/api/health || exit 1
        curl -f https://coresis.app/ || exit 1

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        text: 'CoreSIS deployed to production successfully! 🎉'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Environment-Specific Configurations

#### Staging Environment
```yaml
# .github/environments/staging.yml
name: staging
url: https://staging.coresis.app

protection_rules:
  - required_reviewers: 1
  - wait_timer: 5
```

#### Production Environment
```yaml
# .github/environments/production.yml
name: production
url: https://coresis.app

protection_rules:
  - required_reviewers: 2
  - wait_timer: 10
  - deployment_branch_policy:
      protected_branches: true
      custom_branch_policies: false
```

---

## 🐳 Docker Configuration

### Backend Dockerfile

```dockerfile
# sis-backend/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S coresis -u 1001

# Change ownership
RUN chown -R coresis:nodejs /app
USER coresis

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configurations

#### Development (docker-compose.yml)
```yaml
version: '3.8'

services:
  backend:
    build: ./sis-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGO_URI=mongodb://mongo:27017/coresis_dev
    depends_on:
      - mongo
    volumes:
      - ./sis-backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

#### Staging (docker-compose.staging.yml)
```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/your-org/coresis/backend:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=staging
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    depends_on:
      - mongo
    restart: unless-stopped

  frontend:
    image: ghcr.io/your-org/coresis/frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASS}
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

#### Production (docker-compose.production.yml)
```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/your-org/coresis/backend:latest
    expose:
      - "5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    depends_on:
      - mongo
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  frontend:
    image: ghcr.io/your-org/coresis/frontend:latest
    expose:
      - "80"
    depends_on:
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'

  mongo:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASS}
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

---

## 🔍 Testing Strategy

### Unit Tests

#### Backend Tests
```javascript
// sis-backend/tests/unit/auth.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  test('should login with valid credentials', async () => {
    // Create test user
    await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'student'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});
```

#### Frontend Tests
```javascript
// frontend/tests/unit/LoginForm.test.js
import { mount } from '@vue/test-utils';
import LoginForm from '@/components/LoginForm.vue';

describe('LoginForm', () => {
  test('renders login form correctly', () => {
    const wrapper = mount(LoginForm);
    
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  test('validates required fields', async () => {
    const wrapper = mount(LoginForm);
    
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.text()).toContain('Email is required');
    expect(wrapper.text()).toContain('Password is required');
  });
});
```

### Integration Tests

```javascript
// sis-backend/tests/integration/student.test.js
const request = require('supertest');
const app = require('../server');
const Student = require('../models/Student');
const { generateToken } = require('../utils/auth');

describe('Student API', () => {
  let adminToken;

  beforeEach(async () => {
    await Student.deleteMany({});
    adminToken = generateToken({ id: 'admin123', role: 'admin' });
  });

  test('should create a new student', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        dateOfBirth: '1995-01-01',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.firstName).toBe('John');
  });
});
```

### End-to-End Tests

```javascript
// frontend/tests/e2e/login.spec.js
describe('Login Flow', () => {
  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('admin@coresis.app');
    cy.get('[data-testid="password-input"]').type('Temp2025!');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
```

---

## 🔒 Security Scanning

### Security Workflow

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main, staging ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

    - name: Run OWASP ZAP scan
      uses: zaproxy/action-full-scan@v0.8.0
      with:
        target: 'https://staging.coresis.app'

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'ghcr.io/your-org/coresis/backend:latest'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: 'trivy-results.sarif'
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints

#### Backend Health Check
```javascript
// sis-backend/routes/health.js
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check external services
    const emailService = await checkEmailService();
    const fileStorage = await checkFileStorage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      services: {
        database: 'healthy',
        email: emailService ? 'healthy' : 'unhealthy',
        storage: fileStorage ? 'healthy' : 'unhealthy'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

#### Frontend Health Check
```javascript
// frontend/public/health.html
<!DOCTYPE html>
<html>
<head>
    <title>CoreSIS Health Check</title>
</head>
<body>
    <h1>CoreSIS Frontend</h1>
    <p>Status: Healthy</p>
    <p>Version: 1.0.0</p>
    <p>Timestamp: <span id="timestamp"></span></p>
    <script>
        document.getElementById('timestamp').textContent = new Date().toISOString();
    </script>
</body>
</html>
```

### Monitoring Configuration

#### Prometheus Metrics
```javascript
// sis-backend/middleware/metrics.js
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to collect metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  
  next();
};

module.exports = { metricsMiddleware, prometheus };
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "CoreSIS Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

---

## 🚨 Alerting & Notifications

### Alert Configuration

#### Slack Notifications
```yaml
# .github/workflows/alerts.yml
name: Alerts

on:
  workflow_run:
    workflows: ["CoreSIS CI/CD Pipeline"]
    types:
      - completed
      - failure

jobs:
  notify:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    
    steps:
    - name: Notify failure
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#alerts'
        text: 'CoreSIS deployment failed! 🚨'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

#### Email Notifications
```javascript
// sis-backend/utils/alerts.js
const sendAlert = async (level, message, details) => {
  const alertEmail = {
    to: process.env.ALERT_EMAIL,
    subject: `[${level.toUpperCase()}] CoreSIS Alert`,
    html: `
      <h2>CoreSIS Alert</h2>
      <p><strong>Level:</strong> ${level}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Details:</strong></p>
      <pre>${JSON.stringify(details, null, 2)}</pre>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    `
  };
  
  await sendEmail(alertEmail);
};

module.exports = { sendAlert };
```

---

## 📈 Performance Monitoring

### Performance Metrics

#### Backend Performance
```javascript
// sis-backend/middleware/performance.js
const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
    }
  });
  
  next();
};

module.exports = performanceMiddleware;
```

#### Frontend Performance
```javascript
// frontend/src/utils/performance.js
export const trackPageLoad = () => {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    
    // Send to analytics
    if (loadTime > 3000) {
      console.warn(`Slow page load: ${loadTime}ms`);
    }
  });
};
```

---

## 🔄 Rollback Strategy

### Automated Rollback

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    
    steps:
    - name: Rollback deployment
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets[format('{0}_HOST', inputs.environment)] }}
        username: ${{ secrets[format('{0}_USER', inputs.environment)] }}
        key: ${{ secrets[format('{0}_SSH_KEY', inputs.environment)] }}
        script: |
          cd /var/www/coresis
          git checkout ${{ inputs.version }}
          docker-compose -f docker-compose.${{ inputs.environment }}.yml up -d

    - name: Verify rollback
      run: |
        sleep 30
        curl -f https://${{ inputs.environment }}.coresis.app/api/health || exit 1

    - name: Notify rollback
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        text: 'CoreSIS rolled back to version ${{ inputs.version }} on ${{ inputs.environment }}'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security scans completed
- [ ] Code review approved
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup completed

### Deployment
- [ ] Docker images built and pushed
- [ ] Environment deployed
- [ ] Health checks passing
- [ ] Performance monitoring active
- [ ] Alerts configured

### Post-Deployment
- [ ] User acceptance testing
- [ ] Performance validation
- [ ] Security verification
- [ ] Documentation updated
- [ ] Team notified

---

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose build --no-cache

# Check dependencies
npm audit
npm outdated
```

#### Deployment Failures
```bash
# Check deployment status
docker-compose ps

# Check logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rollback to previous version
git checkout HEAD~1
docker-compose up -d
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Check database performance
mongosh --eval "db.currentOp()"

# Check network connectivity
curl -v https://coresis.app/api/health
```

---

## 📞 Support

### Pipeline Support
- **Email**: devops@coresis.app
- **Slack**: #devops channel
- **Documentation**: https://docs.coresis.app/pipeline

### Emergency Contacts
- **Lead DevOps**: +1 (555) 123-4567
- **Backup DevOps**: +1 (555) 123-4568
- **System Administrator**: +1 (555) 123-4569

---

*CoreSIS CI/CD Pipeline v1.0*  
*Last Updated: July 2025*  
*For questions or support, contact devops@coresis.app*

**CoreSIS** - Powering Pathways. Fueling Futures. 🚀 