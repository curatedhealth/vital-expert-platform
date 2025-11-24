#!/bin/bash
# Start VITAL Python AI Engine with Docker

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

echo -e "${BLUE}🐳 Starting VITAL Python AI Engine${NC}"
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

# Create logs directory
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p logs/python
echo -e "${GREEN}✓ Directories created${NC}"

# Build and start service
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker-compose -f docker-compose.python-only.yml build --no-cache

echo -e "${YELLOW}🚀 Starting service...${NC}"
docker-compose -f docker-compose.python-only.yml up -d

echo ""
echo -e "${GREEN}✅ Python AI Engine started!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.python-only.yml ps

echo ""
echo -e "${BLUE}📍 Service URL:${NC}"
echo "  Python AI Engine: http://localhost:8000"
echo ""
echo -e "${BLUE}🔍 Useful commands:${NC}"
echo "  View logs:      docker-compose -f docker-compose.python-only.yml logs -f"
echo "  Stop service:   docker-compose -f docker-compose.python-only.yml down"
echo "  Restart:        docker-compose -f docker-compose.python-only.yml restart"
echo ""
echo -e "${BLUE}📋 Health Check:${NC}"
echo "  curl http://localhost:8000/health"
