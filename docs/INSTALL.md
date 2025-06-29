# CoreSIS Installation Guide

Complete setup instructions for deploying CoreSIS in development and production environments.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 12+ / Windows 10+
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 20GB available space
- **Network**: Internet connection for dependencies

### Software Requirements
- **Node.js**: 18.x or higher
- **MongoDB**: 6.0 or higher
- **Docker**: 20.10+ (for containerized deployment)
- **Git**: 2.30+
- **Nginx**: 1.18+ (for production)

## 🚀 Quick Installation

### Option 1: Automated Installer (Recommended)

```bash
# Download and run the installer
curl -fsSL https://install.coresis.app | bash

# Follow the interactive prompts
# The installer will:
# - Check system requirements
# - Install dependencies
# - Configure environment
# - Start services
# - Seed initial data
```

### Option 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/your-org/coresis.git
cd coresis

# Run setup script
chmod +x install.sh
./install.sh
```

## 🐳 Docker Installation

### Single Server Deployment

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/coresis.git
   cd coresis
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Verify Installation**
   ```bash
   # Check services
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   
   # Access application
   open http://localhost:8080
   ```

### Production Docker Setup

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Set up SSL with Let's Encrypt
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

## 🔧 Manual Installation

### Step 1: Install Dependencies

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

#### CentOS/RHEL
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install MongoDB
sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

sudo yum install -y mongodb-org-6.0
```

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node@18
brew install mongodb/brew/mongodb-community
brew install nginx
npm install -g pm2
```

### Step 2: Setup Database

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongosh
use coresis
db.createUser({
  user: "coresis_user",
  pwd: "your_secure_password",
  roles: ["readWrite"]
})
exit
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd sis-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env
```

**Environment Configuration (.env)**
```bash
# Database
MONGO_URI=mongodb://coresis_user:your_secure_password@localhost:27017/coresis

# Server
NODE_ENV=production
PORT=5000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
CLIENT_URL=https://coresis.app
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://coresis.app
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/coresis
```

**Nginx Configuration**
```nginx
server {
    listen 80;
    server_name coresis.app www.coresis.app;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name coresis.app www.coresis.app;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/coresis.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/coresis.app/privkey.pem;
    
    # Frontend
    location / {
        root /var/www/coresis/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Step 5: Start Services

```bash
# Start backend with PM2
cd sis-backend
pm2 start server.js --name "coresis-backend"
pm2 save
pm2 startup

# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/coresis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Seed initial data
npm run seed:all
```

## 🔐 SSL Certificate Setup

### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d coresis.app -d www.coresis.app

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/coresis.key \
  -out /etc/ssl/certs/coresis.crt
```

## 📊 Monitoring Setup

### PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

### Log Management

```bash
# View application logs
pm2 logs coresis-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Health Checks

```bash
# API health check
curl https://coresis.app/api/health

# Database connection
curl https://coresis.app/api/health/db

# Frontend status
curl -I https://coresis.app
```

## 🔄 Updates and Maintenance

### Automatic Updates

```bash
# Create update script
nano update.sh
```

```bash
#!/bin/bash
# Update script content
cd /var/www/coresis
git pull origin main
cd sis-backend
npm install
pm2 restart coresis-backend
cd ../frontend
npm install
npm run build
echo "CoreSIS updated successfully"
```

```bash
chmod +x update.sh
```

### Backup Strategy

```bash
# Database backup
mongodump --db coresis --out /backup/$(date +%Y%m%d)

# Application backup
tar -czf /backup/coresis-$(date +%Y%m%d).tar.gz /var/www/coresis

# Automated backup script
nano /etc/cron.daily/coresis-backup
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :5000
   
   # Kill process
   sudo kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Restart MongoDB
   sudo systemctl restart mongod
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R www-data:www-data /var/www/coresis
   sudo chmod -R 755 /var/www/coresis
   ```

4. **SSL Certificate Issues**
   ```bash
   # Test SSL configuration
   sudo nginx -t
   
   # Renew certificate
   sudo certbot renew
   ```

### Log Analysis

```bash
# Check PM2 logs
pm2 logs coresis-backend --lines 100

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check system logs
sudo journalctl -u nginx -f
```

## 📞 Support

If you encounter issues during installation:

1. **Check Documentation**: [docs.coresis.app](https://docs.coresis.app)
2. **Community Forum**: [community.coresis.app](https://community.coresis.app)
3. **GitHub Issues**: [github.com/your-org/coresis/issues](https://github.com/your-org/coresis/issues)
4. **Email Support**: support@coresis.app

## ✅ Verification Checklist

- [ ] Backend API responding on port 5000
- [ ] Frontend accessible on port 80/443
- [ ] Database connection established
- [ ] SSL certificate installed and valid
- [ ] Initial data seeded successfully
- [ ] Admin account created and accessible
- [ ] Email notifications working
- [ ] File uploads functioning
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented

---

**CoreSIS Installation Complete!** 🎉

Your CoreSIS instance is now ready for use. Access it at `https://coresis.app` and start powering pathways, fueling futures. 