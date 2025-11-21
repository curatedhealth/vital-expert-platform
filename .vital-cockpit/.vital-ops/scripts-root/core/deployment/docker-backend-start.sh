#!/bin/bash
# Start VITAL Backend Services with Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}🐳 Starting VITAL Backend Services${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example if exists...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your actual values before continuing${NC}"
    else
        echo -e "${RED}✗ .env.example not found. Please create .env file manually${NC}"
        exit 1
    fi
fi

# Create logs and data directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p logs/python logs/gateway data/models
echo -e "${GREEN}✓ Directories created${NC}"

# Build and start services
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose -f docker-compose.backend.yml build --no-cache

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f docker-compose.backend.yml up -d

echo ""
echo -e "${GREEN}✅ Backend services started!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.backend.yml ps

echo ""
echo -e "${BLUE}📍 Service URLs:${NC}"
echo "  API Gateway:    http://localhost:3001"
echo "  Python AI Engine: http://localhost:8000"
echo "  Redis:          localhost:6379"
echo ""
echo -e "${BLUE}🔍 Useful commands:${NC}"
echo "  View logs:      docker-compose -f docker-compose.backend.yml logs -f"
echo "  Stop services:  docker-compose -f docker-compose.backend.yml down"
echo "  Restart:        docker-compose -f docker-compose.backend.yml restart"
echo ""
echo -e "${BLUE}📋 Health Checks:${NC}"
echo "  API Gateway:    curl http://localhost:3001/health"
echo "  AI Engine:      curl http://localhost:8000/health"

