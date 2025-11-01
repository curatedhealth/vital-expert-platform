#!/bin/bash
# Quick Start Script for Phase 2 & 3 Deployment
# Run this script to automatically set up and verify the deployment

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Phase 2 & 3 Quick Start Deployment"
echo "  Long-Term Memory + Self-Continuation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Python version
echo "Step 1: Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "  ✓ Python version: $PYTHON_VERSION"
echo ""

# Step 2: Check if in correct directory
if [ ! -f "services/ai-engine/src/main.py" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root${NC}"
    echo "   Current directory: $(pwd)"
    exit 1
fi
echo "  ✓ In correct directory"
echo ""

# Step 3: Install Python dependencies
echo "Step 2: Installing Python dependencies..."
cd services/ai-engine

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}  Creating virtual environment...${NC}"
    python3 -m venv venv
fi

echo "  Activating virtual environment..."
source venv/bin/activate

echo "  Installing dependencies..."
pip install -q sentence-transformers==2.2.2
pip install -q faiss-cpu==1.7.4

echo -e "${GREEN}  ✓ Dependencies installed${NC}"
echo ""

# Step 4: Run verification
echo "Step 3: Running deployment verification..."
python3 verify_deployment.py

VERIFICATION_EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $VERIFICATION_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run database migration (see DEPLOYMENT_GUIDE_PHASE2_3.md)"
    echo "  2. Start the server:"
    echo "     cd services/ai-engine"
    echo "     source venv/bin/activate"
    echo "     uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "  3. Test the endpoints:"
    echo "     curl http://localhost:8000/health"
    echo ""
else
    echo -e "${RED}❌ DEPLOYMENT VERIFICATION FAILED${NC}"
    echo ""
    echo "Please review the errors above and:"
    echo "  1. Ensure database migrations are run"
    echo "  2. Check .env configuration"
    echo "  3. Review DEPLOYMENT_GUIDE_PHASE2_3.md"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

