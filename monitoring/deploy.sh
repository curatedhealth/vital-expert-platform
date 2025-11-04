#!/bin/bash

# ============================================================================
# VITAL Monitoring Stack Deployment Script
# Deploys Prometheus, Grafana, Alertmanager, and LangFuse
# ============================================================================

set -e  # Exit on error

echo "🚀 VITAL Monitoring Stack - Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo ""
    echo "Creating .env file from template..."
    cp env.example .env
    echo ""
    echo -e "${YELLOW}📝 Please edit monitoring/.env with your configuration:${NC}"
    echo "   - SUPABASE_HOST and SUPABASE_PASSWORD"
    echo "   - LANGFUSE_* secrets (generate with: openssl rand -hex 32)"
    echo "   - SLACK_WEBHOOK_URL (optional)"
    echo "   - PAGERDUTY_SERVICE_KEY (optional)"
    echo ""
    echo "After configuring, run this script again."
    exit 1
fi

# Load environment variables
source .env

# Validate required variables
REQUIRED_VARS=("SUPABASE_HOST" "SUPABASE_PASSWORD" "LANGFUSE_DB_PASSWORD" "LANGFUSE_NEXTAUTH_SECRET" "LANGFUSE_SALT")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these in monitoring/.env"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p prometheus grafana/dashboards alertmanager
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose pull
echo -e "${GREEN}✅ Images pulled${NC}"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers (if any)..."
docker-compose down
echo ""

# Start services
echo "🚀 Starting monitoring stack..."
docker-compose up -d
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."
echo ""

# Check Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo -e "${GREEN}✅ Prometheus is healthy${NC} (http://localhost:9090)"
else
    echo -e "${RED}❌ Prometheus is not responding${NC}"
fi

# Check Grafana
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Grafana is healthy${NC} (http://localhost:3001)"
else
    echo -e "${RED}❌ Grafana is not responding${NC}"
fi

# Check Alertmanager
if curl -s http://localhost:9093/-/healthy > /dev/null; then
    echo -e "${GREEN}✅ Alertmanager is healthy${NC} (http://localhost:9093)"
else
    echo -e "${RED}❌ Alertmanager is not responding${NC}"
fi

# Check LangFuse
if curl -s http://localhost:3002/api/public/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ LangFuse is healthy${NC} (http://localhost:3002)"
else
    echo -e "${YELLOW}⚠️  LangFuse is starting (may take a minute)${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Monitoring Stack Deployed Successfully!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 Access Points:"
echo "   • Grafana:       http://localhost:3001"
echo "     Username: admin"
echo "     Password: vital_admin_2025"
echo ""
echo "   • Prometheus:    http://localhost:9090"
echo "   • Alertmanager:  http://localhost:9093"
echo "   • LangFuse:      http://localhost:3002"
echo ""
echo "📚 Next Steps:"
echo "   1. Log into Grafana and explore dashboards"
echo "   2. Configure Slack webhook for alerts (optional)"
echo "   3. Set up PagerDuty integration (optional)"
echo "   4. Import custom dashboards from grafana/dashboards/"
echo ""
echo "🔧 Useful Commands:"
echo "   • View logs:     docker-compose logs -f [service-name]"
echo "   • Stop stack:    docker-compose down"
echo "   • Restart:       docker-compose restart [service-name]"
echo ""

