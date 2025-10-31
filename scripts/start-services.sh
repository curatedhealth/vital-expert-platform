#!/bin/bash
# Start VITAL Platform Services
# This script starts the API Gateway and Python AI Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${GREEN}🚀 Starting VITAL Platform Services${NC}"
echo "Project root: $PROJECT_ROOT"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if API Gateway is running
echo -e "${YELLOW}Checking API Gateway (port 3001)...${NC}"
if check_port 3001; then
    echo -e "${GREEN}✓ API Gateway is already running on port 3001${NC}"
else
    echo -e "${YELLOW}Starting API Gateway...${NC}"
    cd "$PROJECT_ROOT/services/api-gateway"
    npm install --silent 2>/dev/null || echo "Dependencies already installed"
    nohup npm start > "$PROJECT_ROOT/logs/api-gateway.log" 2>&1 &
    API_GATEWAY_PID=$!
    echo $API_GATEWAY_PID > "$PROJECT_ROOT/logs/api-gateway.pid"
    echo -e "${GREEN}✓ API Gateway started (PID: $API_GATEWAY_PID)${NC}"
    sleep 2  # Give it time to start
fi

# Check if Python AI Engine is running
echo -e "${YELLOW}Checking Python AI Engine (port 8000)...${NC}"
if check_port 8000; then
    echo -e "${GREEN}✓ Python AI Engine is already running on port 8000${NC}"
else
    echo -e "${YELLOW}Starting Python AI Engine...${NC}"
    cd "$PROJECT_ROOT/services/ai-engine"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating Python virtual environment...${NC}"
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies if needed
    if [ ! -f "venv/.installed" ]; then
        echo -e "${YELLOW}Installing Python dependencies...${NC}"
        # First, install setuptools and wheel (required for building packages)
        pip install --quiet --upgrade pip setuptools wheel
        # Then install requirements
        pip install --quiet -r requirements.txt
        touch venv/.installed
    fi
    
    # Start the AI Engine
    nohup python src/main.py > "$PROJECT_ROOT/logs/ai-engine.log" 2>&1 &
    AI_ENGINE_PID=$!
    echo $AI_ENGINE_PID > "$PROJECT_ROOT/logs/ai-engine.pid"
    echo -e "${GREEN}✓ Python AI Engine started (PID: $AI_ENGINE_PID)${NC}"
    sleep 3  # Give it time to start
fi

# Verify services are running
echo ""
echo -e "${YELLOW}Verifying services...${NC}"

if check_port 3001; then
    echo -e "${GREEN}✓ API Gateway is running on http://localhost:3001${NC}"
else
    echo -e "${RED}✗ API Gateway failed to start${NC}"
    echo "Check logs: $PROJECT_ROOT/logs/api-gateway.log"
fi

if check_port 8000; then
    echo -e "${GREEN}✓ Python AI Engine is running on http://localhost:8000${NC}"
else
    echo -e "${RED}✗ Python AI Engine failed to start${NC}"
    echo "Check logs: $PROJECT_ROOT/logs/ai-engine.log"
fi

echo ""
echo -e "${GREEN}✅ Services started!${NC}"
echo ""
echo "To view logs:"
echo "  API Gateway: tail -f $PROJECT_ROOT/logs/api-gateway.log"
echo "  AI Engine:   tail -f $PROJECT_ROOT/logs/ai-engine.log"
echo ""
echo "To stop services:"
echo "  ./scripts/stop-services.sh"

