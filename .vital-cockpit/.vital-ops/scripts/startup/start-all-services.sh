#!/bin/bash

echo "🚀 VITAL Platform - Starting All Services"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Function to check if port is in use
check_port() {
    lsof -i:$1 > /dev/null 2>&1
    return $?
}

echo "📋 Checking current service status..."
echo "--------------------------------------"

# Check Next.js (port 3001)
if check_port 3001; then
    echo -e "${GREEN}✅ Next.js (3001): RUNNING${NC}"
else
    echo -e "${RED}❌ Next.js (3001): NOT RUNNING${NC}"
fi

# Check API Gateway (port 4000)
if check_port 4000; then
    echo -e "${GREEN}✅ API Gateway (4000): RUNNING${NC}"
else
    echo -e "${RED}❌ API Gateway (4000): NOT RUNNING${NC}"
    NEED_GATEWAY=true
fi

# Check Python AI Engine (port 8000)
if check_port 8000; then
    echo -e "${GREEN}✅ Python AI Engine (8000): RUNNING${NC}"
else
    echo -e "${RED}❌ Python AI Engine (8000): NOT RUNNING${NC}"
    NEED_PYTHON=true
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$NEED_GATEWAY" = true ] || [ "$NEED_PYTHON" = true ]; then
    echo -e "${YELLOW}⚠️  Some services are not running!${NC}"
    echo ""
    
    if [ "$NEED_GATEWAY" = true ]; then
        echo "📦 Starting API Gateway (port 4000)..."
        echo "--------------------------------------"
        cd "$BASE_DIR/services/api-gateway"
        
        # Check if node_modules exists
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        fi
        
        echo "Starting API Gateway in background..."
        npm start > "$BASE_DIR/api-gateway.log" 2>&1 &
        GATEWAY_PID=$!
        echo -e "${GREEN}✅ API Gateway started (PID: $GATEWAY_PID)${NC}"
        echo "   Log: $BASE_DIR/api-gateway.log"
        echo ""
    fi
    
    if [ "$NEED_PYTHON" = true ]; then
        echo "🐍 Starting Python AI Engine (port 8000)..."
        echo "-------------------------------------------"
        cd "$BASE_DIR/services/ai-engine"
        
        # Check if venv exists
        if [ ! -d "venv" ]; then
            echo "Creating Python virtual environment..."
            python3 -m venv venv
            source venv/bin/activate
            echo "Installing Python dependencies..."
            pip install -r requirements.txt
        else
            source venv/bin/activate
        fi
        
        echo "Starting Python AI Engine in background..."
        python src/main.py > "$BASE_DIR/ai-engine.log" 2>&1 &
        PYTHON_PID=$!
        echo -e "${GREEN}✅ Python AI Engine started (PID: $PYTHON_PID)${NC}"
        echo "   Log: $BASE_DIR/ai-engine.log"
        echo ""
    fi
    
    echo "⏳ Waiting 5 seconds for services to start..."
    sleep 5
    echo ""
    
    echo "📋 Final Status Check:"
    echo "----------------------"
    
    if check_port 4000; then
        echo -e "${GREEN}✅ API Gateway (4000): RUNNING${NC}"
    else
        echo -e "${RED}❌ API Gateway (4000): FAILED TO START${NC}"
        echo "   Check log: $BASE_DIR/api-gateway.log"
    fi
    
    if check_port 8000; then
        echo -e "${GREEN}✅ Python AI Engine (8000): RUNNING${NC}"
    else
        echo -e "${RED}❌ Python AI Engine (8000): FAILED TO START${NC}"
        echo "   Check log: $BASE_DIR/ai-engine.log"
    fi
    
else
    echo -e "${GREEN}✅ All services are already running!${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Service startup complete!"
echo ""
echo "📊 Service URLs:"
echo "   • Next.js:         http://localhost:3001"
echo "   • API Gateway:     http://localhost:4000"
echo "   • Python AI:       http://localhost:8000"
echo ""
echo "📝 To stop services:"
echo "   kill \$GATEWAY_PID \$PYTHON_PID"
echo "   (or use: pkill -f 'node.*api-gateway' && pkill -f 'python.*main.py')"
echo ""

