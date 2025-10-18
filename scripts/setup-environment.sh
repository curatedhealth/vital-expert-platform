#!/bin/bash

# VITAL Expert Consultation Environment Setup Script
# This script helps configure the environment for the expert consultation service

set -e

echo "🔧 Setting up VITAL Expert Consultation Environment..."

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

# Check if .env file exists
check_env_file() {
    if [ -f ".env.production" ]; then
        print_status "Environment file .env.production already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Keeping existing .env.production file"
            return 0
        fi
    fi
    
    return 1
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration file..."
    
    cat > .env.production << EOF
# VITAL Expert Consultation Service Environment Variables

# Database Configuration
DATABASE_URL=postgresql://vital:password@localhost:5432/vital_expert_consultation
REDIS_URL=redis://localhost:6379

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=4000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Tavily Search API
TAVILY_API_KEY=your_tavily_api_key_here

# Service Configuration
SERVICE_PORT=8001
SERVICE_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Cost Management
DEFAULT_BUDGET=50.0
MAX_BUDGET=500.0
COST_WARNING_THRESHOLD=0.8

# Execution Configuration
MAX_ITERATIONS=10
DEFAULT_TIMEOUT=300
REASONING_MODE=react

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30
EOF

    print_success "Environment file created: .env.production"
}

# Prompt for API keys
prompt_for_keys() {
    print_status "Please provide your API keys and configuration:"
    echo ""
    
    # OpenAI API Key
    read -p "Enter your OpenAI API Key: " OPENAI_KEY
    if [ ! -z "$OPENAI_KEY" ]; then
        sed -i.bak "s/your_openai_api_key_here/$OPENAI_KEY/g" .env.production
        print_success "OpenAI API Key configured"
    fi
    
    # Supabase URL
    read -p "Enter your Supabase URL: " SUPABASE_URL
    if [ ! -z "$SUPABASE_URL" ]; then
        sed -i.bak "s|your_supabase_url_here|$SUPABASE_URL|g" .env.production
        print_success "Supabase URL configured"
    fi
    
    # Supabase Anon Key
    read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
    if [ ! -z "$SUPABASE_ANON_KEY" ]; then
        sed -i.bak "s/your_supabase_anon_key_here/$SUPABASE_ANON_KEY/g" .env.production
        print_success "Supabase Anon Key configured"
    fi
    
    # Supabase Service Role Key
    read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_KEY
    if [ ! -z "$SUPABASE_SERVICE_KEY" ]; then
        sed -i.bak "s/your_supabase_service_role_key_here/$SUPABASE_SERVICE_KEY/g" .env.production
        print_success "Supabase Service Role Key configured"
    fi
    
    # Tavily API Key
    read -p "Enter your Tavily API Key (optional): " TAVILY_KEY
    if [ ! -z "$TAVILY_KEY" ]; then
        sed -i.bak "s/your_tavily_api_key_here/$TAVILY_KEY/g" .env.production
        print_success "Tavily API Key configured"
    fi
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    sed -i.bak "s/your_jwt_secret_here/$JWT_SECRET/g" .env.production
    sed -i.bak "s/your_encryption_key_here/$ENCRYPTION_KEY/g" .env.production
    
    print_success "Security keys generated"
    
    # Clean up backup files
    rm -f .env.production.bak
}

# Validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    # Check if required keys are set
    if grep -q "your_openai_api_key_here" .env.production; then
        print_warning "OpenAI API Key not configured"
    fi
    
    if grep -q "your_supabase_url_here" .env.production; then
        print_warning "Supabase URL not configured"
    fi
    
    if grep -q "your_supabase_anon_key_here" .env.production; then
        print_warning "Supabase Anon Key not configured"
    fi
    
    print_success "Configuration validation completed"
}

# Create monitoring configuration
create_monitoring_config() {
    print_status "Creating monitoring configuration..."
    
    # Create Prometheus configuration
    mkdir -p monitoring/prometheus
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'expert-consultation'
    static_configs:
      - targets: ['expert-consultation:8001']
    metrics_path: '/metrics'
    scrape_interval: 30s
EOF

    # Create Grafana datasource configuration
    mkdir -p monitoring/grafana/datasources
    cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    print_success "Monitoring configuration created"
}

# Main setup function
main() {
    echo "=========================================="
    echo "VITAL Expert Consultation Environment Setup"
    echo "=========================================="
    echo ""
    
    if check_env_file; then
        print_status "Using existing environment file"
    else
        create_env_file
        prompt_for_keys
    fi
    
    validate_config
    create_monitoring_config
    
    print_success "🎉 Environment setup completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Review and update .env.production with your configuration"
    echo "2. Run: ./scripts/deploy-expert-consultation.sh"
    echo "3. Access the service at http://localhost:8001"
    echo ""
    print_warning "Make sure to keep your API keys secure and never commit them to version control!"
}

# Handle command line arguments
case "${1:-}" in
    "validate")
        validate_config
        ;;
    "monitoring")
        create_monitoring_config
        ;;
    *)
        main
        ;;
esac
