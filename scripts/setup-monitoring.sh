#!/bin/bash

# VITAL AI Monitoring Setup Script
# This script sets up comprehensive monitoring infrastructure

set -e

echo "🚀 Setting up VITAL AI Monitoring Infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create monitoring directory structure
print_status "Creating monitoring directory structure..."
mkdir -p monitoring/{prometheus/rules,grafana/{provisioning/{datasources,dashboards},dashboards}}

# Set up Prometheus configuration
print_status "Setting up Prometheus configuration..."
if [ ! -f "monitoring/prometheus/prometheus.yml" ]; then
    print_warning "Prometheus configuration not found. Please ensure prometheus.yml is in place."
fi

# Set up Grafana configuration
print_status "Setting up Grafana configuration..."
if [ ! -f "monitoring/grafana/provisioning/datasources/prometheus.yml" ]; then
    print_warning "Grafana datasource configuration not found. Please ensure datasources are configured."
fi

# Create environment file for monitoring
print_status "Creating monitoring environment file..."
cat > monitoring/.env << EOF
# VITAL AI Monitoring Environment Variables

# Prometheus Configuration
PROMETHEUS_RETENTION_TIME=90d
PROMETHEUS_STORAGE_PATH=/prometheus

# Grafana Configuration
GF_SECURITY_ADMIN_PASSWORD=admin123
GF_USERS_ALLOW_SIGN_UP=false
GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel

# Jaeger Configuration
COLLECTOR_OTLP_ENABLED=true

# Elasticsearch Configuration
ES_JAVA_OPTS=-Xms1g -Xmx1g
xpack.security.enabled=false

# Redis Configuration
REDIS_MAXMEMORY=2gb
REDIS_MAXMEMORY_POLICY=allkeys-lru
EOF

# Start monitoring services
print_status "Starting monitoring services..."
cd monitoring
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null; then
    print_success "Prometheus is running on http://localhost:9090"
else
    print_warning "Prometheus health check failed"
fi

# Check Grafana
if curl -s http://localhost:3001/api/health > /dev/null; then
    print_success "Grafana is running on http://localhost:3001"
    print_status "Grafana credentials: admin / admin123"
else
    print_warning "Grafana health check failed"
fi

# Check Jaeger
if curl -s http://localhost:16686/api/services > /dev/null; then
    print_success "Jaeger is running on http://localhost:16686"
else
    print_warning "Jaeger health check failed"
fi

# Check Redis
if docker exec vital-redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is running on localhost:6379"
else
    print_warning "Redis health check failed"
fi

# Check Elasticsearch
if curl -s http://localhost:9200/_cluster/health > /dev/null; then
    print_success "Elasticsearch is running on http://localhost:9200"
else
    print_warning "Elasticsearch health check failed"
fi

# Check Kibana
if curl -s http://localhost:5601/api/status > /dev/null; then
    print_success "Kibana is running on http://localhost:5601"
else
    print_warning "Kibana health check failed"
fi

# Create monitoring dashboard URLs
print_status "Creating monitoring dashboard URLs..."
cat > monitoring/dashboard-urls.txt << EOF
VITAL AI Monitoring Dashboards
==============================

Prometheus Metrics: http://localhost:9090
Grafana Dashboards: http://localhost:3001 (admin/admin123)
Jaeger Tracing: http://localhost:16686
Kibana Logs: http://localhost:5601
Redis Monitor: redis-cli -h localhost -p 6379

Application Metrics Endpoints:
- General Metrics: http://localhost:3000/api/metrics
- Healthcare Metrics: http://localhost:3000/api/healthcare-metrics
- Agent Metrics: http://localhost:3000/api/agent-metrics
- RAG Metrics: http://localhost:3000/api/rag-metrics
- Security Metrics: http://localhost:3000/api/security-metrics

Grafana Dashboard URLs:
- System Overview: http://localhost:3001/d/vital-overview
- Healthcare Dashboard: http://localhost:3001/d/vital-healthcare
- Agent Performance: http://localhost:3001/d/vital-agents
- RAG System: http://localhost:3001/d/vital-rag
- Security Dashboard: http://localhost:3001/d/vital-security
EOF

print_success "Monitoring infrastructure setup complete!"
print_status "Dashboard URLs saved to monitoring/dashboard-urls.txt"

# Display service status
print_status "Service Status:"
docker-compose ps

echo ""
print_success "🎉 VITAL AI Monitoring Infrastructure is ready!"
echo ""
print_status "Next steps:"
echo "1. Access Grafana at http://localhost:3001 (admin/admin123)"
echo "2. Import dashboards from monitoring/grafana/dashboards/"
echo "3. Configure alerting rules in Prometheus"
echo "4. Set up log shipping to Elasticsearch"
echo "5. Configure tracing in your application"
echo ""
print_status "For more information, see monitoring/dashboard-urls.txt"
