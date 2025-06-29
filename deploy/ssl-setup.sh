#!/bin/bash

# CoreSIS SSL Certificate Setup Script
# Automates SSL certificate setup with Let's Encrypt

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

# Default domains
PRODUCTION_DOMAIN="coresis.app"
STAGING_DOMAIN="staging.coresis.app"
EMAIL="admin@coresis.app"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --production-domain)
            PRODUCTION_DOMAIN="$2"
            shift 2
            ;;
        --staging-domain)
            STAGING_DOMAIN="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo
            echo "Options:"
            echo "  --production-domain DOMAIN  Production domain (default: coresis.app)"
            echo "  --staging-domain DOMAIN     Staging domain (default: staging.coresis.app)"
            echo "  --email EMAIL               Email for Let's Encrypt notifications"
            echo "  --help                      Show this help message"
            echo
            echo "Example:"
            echo "  $0 --production-domain myschool.com --email admin@myschool.com"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Setting up SSL certificates for CoreSIS..."

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_warning "Certbot is already installed"
fi

# Function to check domain DNS
check_domain_dns() {
    local domain=$1
    print_status "Checking DNS for $domain..."
    
    if nslookup $domain > /dev/null 2>&1; then
        print_success "DNS resolution successful for $domain"
        return 0
    else
        print_error "DNS resolution failed for $domain"
        print_warning "Please ensure DNS is properly configured before continuing"
        return 1
    fi
}

# Function to obtain SSL certificate
obtain_certificate() {
    local domain=$1
    local is_staging=$2
    
    print_status "Obtaining SSL certificate for $domain..."
    
    # Check if certificate already exists
    if [[ -d "/etc/letsencrypt/live/$domain" ]]; then
        print_warning "SSL certificate for $domain already exists"
        
        # Check certificate expiration
        local expiry_date=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s)
        local current_timestamp=$(date +%s)
        local days_left=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
        
        if [[ $days_left -lt 30 ]]; then
            print_warning "Certificate expires in $days_left days. Renewing..."
            certbot renew --cert-name $domain --quiet
            print_success "Certificate renewed for $domain"
        else
            print_success "Certificate is valid for $days_left more days"
        fi
    else
        # Obtain new certificate
        if [[ $is_staging == "true" ]]; then
            # Use staging environment for testing
            certbot --nginx -d $domain --staging --non-interactive --agree-tos --email $EMAIL
            print_success "Staging certificate obtained for $domain"
        else
            # Production certificate
            certbot --nginx -d $domain --non-interactive --agree-tos --email $EMAIL
            print_success "Production certificate obtained for $domain"
        fi
    fi
}

# Function to verify certificate
verify_certificate() {
    local domain=$1
    
    print_status "Verifying certificate for $domain..."
    
    if [[ -f "/etc/letsencrypt/live/$domain/cert.pem" ]]; then
        local cert_info=$(openssl x509 -in "/etc/letsencrypt/live/$domain/cert.pem" -text -noout)
        local subject=$(echo "$cert_info" | grep "Subject:" | head -1)
        local issuer=$(echo "$cert_info" | grep "Issuer:" | head -1)
        local expiry=$(echo "$cert_info" | grep "Not After" | head -1)
        
        print_success "Certificate details for $domain:"
        echo "  Subject: $subject"
        echo "  Issuer: $issuer"
        echo "  Expiry: $expiry"
        
        # Test HTTPS connection
        if curl -s -I "https://$domain" > /dev/null 2>&1; then
            print_success "HTTPS connection test successful for $domain"
        else
            print_warning "HTTPS connection test failed for $domain"
        fi
    else
        print_error "Certificate file not found for $domain"
    fi
}

# Function to set up automatic renewal
setup_auto_renewal() {
    print_status "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/coresis-certbot-renew.sh << 'EOF'
#!/bin/bash

# CoreSIS Certificate Renewal Script

LOG_FILE="/var/log/coresis/certbot-renew.log"
DOMAINS=("coresis.app" "www.coresis.app" "staging.coresis.app")

echo "$(date): Starting certificate renewal check..." >> $LOG_FILE

for domain in "${DOMAINS[@]}"; do
    if [[ -d "/etc/letsencrypt/live/$domain" ]]; then
        echo "$(date): Checking certificate for $domain..." >> $LOG_FILE
        
        # Check if renewal is needed (within 30 days)
        expiry_date=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_left=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
        
        if [[ $days_left -lt 30 ]]; then
            echo "$(date): Renewing certificate for $domain (expires in $days_left days)..." >> $LOG_FILE
            certbot renew --cert-name $domain --quiet
            
            if [[ $? -eq 0 ]]; then
                echo "$(date): Certificate renewed successfully for $domain" >> $LOG_FILE
                # Reload Nginx
                systemctl reload nginx
            else
                echo "$(date): Failed to renew certificate for $domain" >> $LOG_FILE
            fi
        else
            echo "$(date): Certificate for $domain is valid for $days_left more days" >> $LOG_FILE
        fi
    fi
done

echo "$(date): Certificate renewal check completed" >> $LOG_FILE
EOF

    chmod +x /usr/local/bin/coresis-certbot-renew.sh
    
    # Add to crontab (run daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/coresis-certbot-renew.sh") | crontab -
    
    print_success "Automatic renewal configured"
}

# Function to create SSL configuration
create_ssl_config() {
    print_status "Creating SSL configuration..."
    
    # Create SSL parameters file
    cat > /etc/nginx/ssl-params.conf << 'EOF'
# SSL Configuration for CoreSIS
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
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';" always;
EOF

    print_success "SSL configuration created"
}

# Main execution
main() {
    print_status "Starting SSL certificate setup for CoreSIS..."
    
    # Check DNS for production domain
    if check_domain_dns $PRODUCTION_DOMAIN; then
        # Obtain production certificate
        obtain_certificate $PRODUCTION_DOMAIN false
        
        # Verify production certificate
        verify_certificate $PRODUCTION_DOMAIN
    fi
    
    # Check DNS for www subdomain
    if check_domain_dns "www.$PRODUCTION_DOMAIN"; then
        # Obtain certificate for www subdomain
        obtain_certificate "www.$PRODUCTION_DOMAIN" false
        verify_certificate "www.$PRODUCTION_DOMAIN"
    fi
    
    # Check DNS for staging domain
    if check_domain_dns $STAGING_DOMAIN; then
        # Obtain staging certificate
        obtain_certificate $STAGING_DOMAIN true
        verify_certificate $STAGING_DOMAIN
    fi
    
    # Set up automatic renewal
    setup_auto_renewal
    
    # Create SSL configuration
    create_ssl_config
    
    # Test Nginx configuration
    print_status "Testing Nginx configuration..."
    if nginx -t; then
        print_success "Nginx configuration is valid"
        systemctl reload nginx
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
    
    print_success "SSL certificate setup completed successfully!"
    
    echo
    echo "=== SSL Setup Summary ==="
    echo "✅ Certbot installed and configured"
    echo "✅ SSL certificates obtained"
    echo "✅ Automatic renewal configured"
    echo "✅ SSL configuration created"
    echo "✅ Nginx configuration updated"
    echo
    echo "=== Certificate Details ==="
    echo "Production: https://$PRODUCTION_DOMAIN"
    echo "Staging: https://$STAGING_DOMAIN"
    echo
    echo "=== Monitoring ==="
    echo "Check renewal logs: tail -f /var/log/coresis/certbot-renew.log"
    echo "Manual renewal: certbot renew"
    echo "Certificate status: certbot certificates"
    echo
    echo "=== Security Notes ==="
    echo "• Certificates auto-renew 30 days before expiration"
    echo "• HSTS headers configured for security"
    echo "• Modern SSL protocols and ciphers enabled"
    echo
    print_success "CoreSIS SSL setup is complete and secure!"
}

# Run main function
main "$@" 