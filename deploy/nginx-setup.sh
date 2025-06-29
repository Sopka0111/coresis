#!/bin/bash

# CoreSIS Nginx Setup Script
# This script sets up Nginx with SSL certificates for CoreSIS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root"
    exit 1
fi

print_status "Setting up Nginx for CoreSIS..."

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt-get update
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx installed"
else
    print_warning "Nginx is already installed"
fi

# Install Certbot for SSL certificates
if ! command -v certbot &> /dev/null; then
    print_status "Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_warning "Certbot is already installed"
fi

# Create CoreSIS web directory
print_status "Creating web directories..."
mkdir -p /var/www/coresis
mkdir -p /var/www/coresis-staging
chown -R www-data:www-data /var/www/coresis*
chmod -R 755 /var/www/coresis*

# Copy Nginx configuration
print_status "Configuring Nginx..."
cp nginx/coresis.conf /etc/nginx/sites-available/coresis

# Remove default site
if [[ -f /etc/nginx/sites-enabled/default ]]; then
    rm /etc/nginx/sites-enabled/default
fi

# Enable CoreSIS site
ln -sf /etc/nginx/sites-available/coresis /etc/nginx/sites-enabled/

# Test Nginx configuration
print_status "Testing Nginx configuration..."
if nginx -t; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
systemctl reload nginx
print_success "Nginx configuration applied"

# SSL Certificate Setup
print_status "Setting up SSL certificates..."

# Check if domains are provided
if [[ -z "$1" ]]; then
    print_warning "No domain provided. SSL certificate setup skipped."
    print_warning "To set up SSL certificates, run:"
    print_warning "  sudo certbot --nginx -d coresis.app -d www.coresis.app"
    print_warning "  sudo certbot --nginx -d staging.coresis.app"
else
    DOMAIN=$1
    print_status "Setting up SSL certificate for $DOMAIN..."
    
    # Check if certificate already exists
    if [[ -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
        print_warning "SSL certificate for $DOMAIN already exists"
    else
        # Obtain SSL certificate
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@coresis.app
        print_success "SSL certificate obtained for $DOMAIN"
    fi
fi

# Set up automatic certificate renewal
print_status "Setting up automatic certificate renewal..."
cat > /etc/cron.d/certbot-renew << 'EOF'
0 12 * * * /usr/bin/certbot renew --quiet
EOF

# Create log directories
mkdir -p /var/log/nginx/coresis
chown www-data:www-data /var/log/nginx/coresis

# Set up log rotation
cat > /etc/logrotate.d/coresis-nginx << 'EOF'
/var/log/nginx/coresis/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

# Security hardening
print_status "Applying security hardening..."

# Create SSL configuration
cat > /etc/nginx/ssl-params.conf << 'EOF'
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
EOF

# Create firewall rules (if ufw is available)
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    ufw allow 'Nginx Full'
    ufw allow ssh
    print_success "Firewall configured"
fi

# Performance optimization
print_status "Optimizing Nginx performance..."

# Update nginx.conf with performance settings
cat >> /etc/nginx/nginx.conf << 'EOF'

# CoreSIS Performance Settings
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
}

http {
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Cache Settings
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # Buffer Settings
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
}
EOF

# Create monitoring script
cat > /usr/local/bin/coresis-nginx-monitor.sh << 'EOF'
#!/bin/bash

# CoreSIS Nginx Monitoring Script

LOG_FILE="/var/log/coresis/nginx-monitor.log"
NGINX_STATUS=$(systemctl is-active nginx)

echo "$(date): Nginx status: $NGINX_STATUS" >> $LOG_FILE

if [[ "$NGINX_STATUS" != "active" ]]; then
    echo "$(date): Nginx is not running. Attempting to restart..." >> $LOG_FILE
    systemctl restart nginx
    
    if systemctl is-active nginx > /dev/null; then
        echo "$(date): Nginx restarted successfully" >> $LOG_FILE
    else
        echo "$(date): Failed to restart Nginx" >> $LOG_FILE
        # Send alert email or notification here
    fi
fi

# Check SSL certificate expiration
for domain in coresis.app www.coresis.app staging.coresis.app; do
    if [[ -d "/etc/letsencrypt/live/$domain" ]]; then
        EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" | cut -d= -f2)
        EXPIRY_DATE=$(date -d "$EXPIRY" +%s)
        CURRENT_DATE=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))
        
        if [[ $DAYS_LEFT -lt 30 ]]; then
            echo "$(date): SSL certificate for $domain expires in $DAYS_LEFT days" >> $LOG_FILE
        fi
    fi
done
EOF

chmod +x /usr/local/bin/coresis-nginx-monitor.sh

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/coresis-nginx-monitor.sh") | crontab -

print_success "Nginx setup completed successfully!"

echo
echo "=== Setup Summary ==="
echo "✅ Nginx installed and configured"
echo "✅ CoreSIS site enabled"
echo "✅ Security headers configured"
echo "✅ Performance optimizations applied"
echo "✅ Monitoring script installed"
echo "✅ Log rotation configured"
echo
echo "=== Next Steps ==="
echo "1. Deploy your CoreSIS application to /var/www/coresis/dist"
echo "2. Set up SSL certificates:"
echo "   sudo certbot --nginx -d coresis.app -d www.coresis.app"
echo "   sudo certbot --nginx -d staging.coresis.app"
echo "3. Test the configuration:"
echo "   sudo nginx -t"
echo "4. Monitor logs:"
echo "   sudo tail -f /var/log/nginx/access.log"
echo
echo "=== URLs ==="
echo "Production: https://coresis.app"
echo "Staging: https://staging.coresis.app"
echo
print_success "CoreSIS Nginx setup is ready!" 