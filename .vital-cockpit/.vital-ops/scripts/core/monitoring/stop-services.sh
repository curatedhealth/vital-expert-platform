#!/bin/bash
# Stop VITAL Platform Services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${YELLOW}🛑 Stopping VITAL Platform Services${NC}"
echo ""

# Stop API Gateway
if [ -f "$PROJECT_ROOT/logs/api-gateway.pid" ]; then
    PID=$(cat "$PROJECT_ROOT/logs/api-gateway.pid")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID 2>/dev/null || true
        echo -e "${GREEN}✓ API Gateway stopped (PID: $PID)${NC}"
    fi
    rm -f "$PROJECT_ROOT/logs/api-gateway.pid"
fi

# Stop Python AI Engine
if [ -f "$PROJECT_ROOT/logs/ai-engine.pid" ]; then
    PID=$(cat "$PROJECT_ROOT/logs/ai-engine.pid")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID 2>/dev/null || true
        echo -e "${GREEN}✓ Python AI Engine stopped (PID: $PID)${NC}"
    fi
    rm -f "$PROJECT_ROOT/logs/ai-engine.pid"
fi

# Also kill by port if still running
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo -e "${GREEN}✅ Services stopped${NC}"

