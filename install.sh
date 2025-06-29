#!/bin/bash

# CoreSIS Installation Script
# Powering Pathways. Fueling Futures.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CORESIS_VERSION="1.0.0"
CORESIS_REPO="https://github.com/your-org/coresis.git"
INSTALL_DIR="/opt/coresis"
BACKUP_DIR="/opt/coresis/backups"
LOG_FILE="/var/log/coresis-install.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Function to check system requirements
check_system_requirements() {
    print_status "Checking system requirements..."
    
    # Check OS
    if [[ ! -f /etc/os-release ]]; then
        print_error "Unsupported operating system"
        exit 1
    fi
    
    source /etc/os-release
    print_status "Detected OS: $PRETTY_NAME"
    
    # Check available memory
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    
    if [[ $MEMORY_GB -lt 4 ]]; then
        print_error "Insufficient memory. Required: 4GB, Available: ${MEMORY_GB}GB"
        exit 1
    fi
    
    print_success "Memory check passed: ${MEMORY_GB}GB available"
    
    # Check available disk space
    DISK_SPACE=$(df / | awk 'NR==2 {print $4}')
    DISK_SPACE_GB=$((DISK_SPACE / 1024 / 1024))
    
    if [[ $DISK_SPACE_GB -lt 20 ]]; then
        print_error "Insufficient disk space. Required: 20GB, Available: ${DISK_SPACE_GB}GB"
        exit 1
    fi
    
    print_success "Disk space check passed: ${DISK_SPACE_GB}GB available"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    case $ID in
        ubuntu|debian)
            apt-get update
            apt-get install -y \
                curl \
                wget \
                git \
                unzip \
                software-properties-common \
                apt-transport-https \
                ca-certificates \
                gnupg \
                lsb-release
            ;;
        centos|rhel|fedora)
            yum update -y
            yum install -y \
                curl \
                wget \
                git \
                unzip \
                yum-utils \
                device-mapper-persistent-data \
                lvm2
            ;;
        *)
            print_error "Unsupported operating system: $ID"
            exit 1
            ;;
    esac
    
    print_success "System dependencies installed"
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_warning "Docker is already installed"
        return
    fi
    
    case $ID in
        ubuntu|debian)
            # Add Docker's official GPG key
            curl -fsSL https://download.docker.com/linux/$ID/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            # Add Docker repository
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$ID $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io
            ;;
        centos|rhel|fedora)
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io
            systemctl start docker
            systemctl enable docker
            ;;
    esac
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker installed successfully"
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_warning "Node.js is already installed: $NODE_VERSION"
        return
    fi
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    print_success "Node.js installed successfully"
}

# Function to install MongoDB
install_mongodb() {
    print_status "Installing MongoDB..."
    
    if command -v mongod &> /dev/null; then
        print_warning "MongoDB is already installed"
        return
    fi
    
    case $ID in
        ubuntu|debian)
            wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            apt-get update
            apt-get install -y mongodb-org
            systemctl start mongod
            systemctl enable mongod
            ;;
        centos|rhel|fedora)
            cat > /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF
            yum install -y mongodb-org
            systemctl start mongod
            systemctl enable mongod
            ;;
    esac
    
    print_success "MongoDB installed successfully"
}

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    if command -v nginx &> /dev/null; then
        print_warning "Nginx is already installed"
        return
    fi
    
    case $ID in
        ubuntu|debian)
            apt-get install -y nginx
            systemctl start nginx
            systemctl enable nginx
            ;;
        centos|rhel|fedora)
            yum install -y nginx
            systemctl start nginx
            systemctl enable nginx
            ;;
    esac
    
    print_success "Nginx installed successfully"
}

# Function to create CoreSIS user
create_coresis_user() {
    print_status "Creating CoreSIS user..."
    
    if id "coresis" &>/dev/null; then
        print_warning "CoreSIS user already exists"
        return
    fi
    
    useradd -r -s /bin/bash -d "$INSTALL_DIR" coresis
    usermod -aG docker coresis
    
    print_success "CoreSIS user created"
}

# Function to clone CoreSIS repository
clone_repository() {
    print_status "Cloning CoreSIS repository..."
    
    if [[ -d "$INSTALL_DIR" ]]; then
        print_warning "Installation directory already exists"
        read -p "Do you want to backup and reinstall? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            backup_existing_installation
            rm -rf "$INSTALL_DIR"
        else
            print_error "Installation cancelled"
            exit 1
        fi
    fi
    
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    git clone "$CORESIS_REPO" .
    
    print_success "Repository cloned successfully"
}

# Function to backup existing installation
backup_existing_installation() {
    print_status "Creating backup of existing installation..."
    
    BACKUP_NAME="coresis-backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_PATH"
    
    if [[ -d "$INSTALL_DIR" ]]; then
        cp -r "$INSTALL_DIR" "$BACKUP_PATH/"
    fi
    
    # Backup database
    if command -v mongodump &> /dev/null; then
        mongodump --out "$BACKUP_PATH/database"
    fi
    
    print_success "Backup created: $BACKUP_PATH"
}

# Function to configure environment
configure_environment() {
    print_status "Configuring environment..."
    
    cd "$INSTALL_DIR"
    
    # Copy environment template
    if [[ ! -f .env ]]; then
        cp docs/ENVIRONMENT.example .env
        print_warning "Environment file created. Please configure it before starting CoreSIS"
    fi
    
    # Set proper permissions
    chown -R coresis:coresis "$INSTALL_DIR"
    chmod 755 "$INSTALL_DIR"
    
    print_success "Environment configured"
}

# Function to build and start services
build_and_start_services() {
    print_status "Building and starting CoreSIS services..."
    
    cd "$INSTALL_DIR"
    
    # Build Docker images
    docker-compose build
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check service health
    if curl -f http://localhost:5000/api/health &>/dev/null; then
        print_success "Backend service is healthy"
    else
        print_error "Backend service health check failed"
        return 1
    fi
    
    if curl -f http://localhost:3000 &>/dev/null; then
        print_success "Frontend service is healthy"
    else
        print_error "Frontend service health check failed"
        return 1
    fi
    
    print_success "All services started successfully"
}

# Function to seed demo data
seed_demo_data() {
    print_status "Seeding demo data..."
    
    cd "$INSTALL_DIR"
    
    # Run database migrations
    docker-compose exec backend npm run migrate
    
    # Seed demo data
    docker-compose exec backend npm run seed
    
    print_success "Demo data seeded successfully"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    cat > /etc/nginx/sites-available/coresis << 'EOF'
server {
    listen 80;
    server_name coresis.local;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:5000/api/health;
        access_log off;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/coresis /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    print_success "Nginx configured successfully"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    cd "$INSTALL_DIR"
    
    # Start monitoring stack
    docker-compose -f docker-compose.monitoring.yml up -d
    
    print_success "Monitoring setup completed"
}

# Function to create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."
    
    cat > /etc/systemd/system/coresis.service << EOF
[Unit]
Description=CoreSIS Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=coresis
Group=coresis

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable coresis
    
    print_success "Systemd service created"
}

# Function to setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    if command -v certbot &> /dev/null; then
        print_warning "Certbot is already installed"
    else
        # Install Certbot
        case $ID in
            ubuntu|debian)
                apt-get install -y certbot python3-certbot-nginx
                ;;
            centos|rhel|fedora)
                yum install -y certbot python3-certbot-nginx
                ;;
        esac
    fi
    
    print_warning "SSL certificate setup requires domain configuration"
    print_warning "Run: certbot --nginx -d your-domain.com"
    
    print_success "SSL setup instructions provided"
}

# Function to display installation summary
display_summary() {
    print_success "CoreSIS installation completed successfully!"
    echo
    echo "=== Installation Summary ==="
    echo "Installation Directory: $INSTALL_DIR"
    echo "Backup Directory: $BACKUP_DIR"
    echo "Log File: $LOG_FILE"
    echo
    echo "=== Service URLs ==="
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:5000"
    echo "Health Check: http://localhost:5000/api/health"
    echo
    echo "=== Monitoring URLs ==="
    echo "Grafana: http://localhost:3000 (admin/admin)"
    echo "Prometheus: http://localhost:9090"
    echo "Kibana: http://localhost:5601"
    echo "Jaeger: http://localhost:16686"
    echo
    echo "=== Default Credentials ==="
    echo "Admin: admin@coresis.app / Temp2025!"
    echo "Student: student@coresis.app / student2025"
    echo
    echo "=== Next Steps ==="
    echo "1. Configure environment variables in $INSTALL_DIR/.env"
    echo "2. Set up SSL certificate with Certbot"
    echo "3. Configure domain and DNS settings"
    echo "4. Review security settings"
    echo "5. Set up backup procedures"
    echo
    echo "=== Support ==="
    echo "Documentation: https://docs.coresis.app"
    echo "Support: support@coresis.app"
    echo "Community: https://community.coresis.app"
    echo
    print_success "CoreSIS is ready to use!"
}

# Function to handle errors
handle_error() {
    print_error "Installation failed at step: $1"
    print_error "Check the log file: $LOG_FILE"
    exit 1
}

# Main installation function
main() {
    echo "=========================================="
    echo "    CoreSIS Installation Script v$CORESIS_VERSION"
    echo "    Powering Pathways. Fueling Futures."
    echo "=========================================="
    echo
    
    # Initialize log file
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    
    log_message "Starting CoreSIS installation"
    
    # Run installation steps
    {
        check_root
        check_system_requirements
        install_dependencies
        install_docker
        install_nodejs
        install_mongodb
        install_nginx
        create_coresis_user
        clone_repository
        configure_environment
        build_and_start_services
        seed_demo_data
        configure_nginx
        setup_monitoring
        create_systemd_service
        setup_ssl
    } || handle_error "Installation step failed"
    
    log_message "CoreSIS installation completed successfully"
    display_summary
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --version  Show version information"
    echo "  --backup       Create backup before installation"
    echo "  --no-monitoring Skip monitoring setup"
    echo "  --no-ssl       Skip SSL setup"
    echo
    echo "Examples:"
    echo "  $0                    # Full installation"
    echo "  $0 --backup          # Installation with backup"
    echo "  $0 --no-monitoring   # Installation without monitoring"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--version)
            echo "CoreSIS Installation Script v$CORESIS_VERSION"
            exit 0
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        --no-monitoring)
            SKIP_MONITORING=true
            shift
            ;;
        --no-ssl)
            SKIP_SSL=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Run main installation
main "$@" 