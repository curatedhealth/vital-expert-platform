#!/bin/bash
# VITAL Python AI Engine - Deployment & Test Script
# Deploys Python AI Engine with shared framework endpoints

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║     🚀 VITAL Python AI Engine - Deployment & Test               ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Change to AI Engine directory
cd "$(dirname "$0")"
echo "📂 Working directory: $(pwd)"
echo ""

# ============================================================================
# Step 1: Check Python Version
# ============================================================================
echo "🔍 Step 1: Checking Python version..."
python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
echo "   Python version: $python_version"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi
echo "✅ Python 3 is installed"
echo ""

# ============================================================================
# Step 2: Create Virtual Environment (if not exists)
# ============================================================================
echo "🔍 Step 2: Setting up virtual environment..."
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# ============================================================================
# Step 3: Activate Virtual Environment
# ============================================================================
echo "🔍 Step 3: Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# ============================================================================
# Step 4: Install Dependencies
# ============================================================================
echo "🔍 Step 4: Installing dependencies..."
echo "   This includes your CuratedHealth AutoGen fork!"
echo ""

# Upgrade pip first
pip install --upgrade pip

# Install from langgraph-requirements.txt (includes AutoGen fork)
if [ -f "langgraph-requirements.txt" ]; then
    echo "   Installing from langgraph-requirements.txt..."
    pip install -r langgraph-requirements.txt
    echo "✅ LangGraph dependencies installed (includes AutoGen fork)"
else
    echo "⚠️  langgraph-requirements.txt not found, installing from requirements.txt..."
    pip install -r requirements.txt
fi
echo ""

# ============================================================================
# Step 5: Verify AutoGen Fork Installation
# ============================================================================
echo "🔍 Step 5: Verifying AutoGen fork installation..."
python3 << 'EOF'
try:
    import autogen
    print(f"✅ AutoGen installed")
    print(f"   Version: {autogen.__version__ if hasattr(autogen, '__version__') else 'Unknown'}")
    print(f"   Location: {autogen.__file__}")
    
    # Check if it's your fork by looking for specific attributes
    if hasattr(autogen, 'AssistantAgent'):
        print("✅ AutoGen fork loaded successfully (CuratedHealth)")
    else:
        print("⚠️  AutoGen loaded but structure may be different")
except ImportError as e:
    print(f"❌ AutoGen not installed: {e}")
    exit(1)
EOF
echo ""

# ============================================================================
# Step 6: Verify Frameworks Router
# ============================================================================
echo "🔍 Step 6: Verifying frameworks router..."
python3 << 'EOF'
import sys
import os

# Add paths
sys.path.insert(0, os.path.join(os.getcwd(), 'app'))
sys.path.insert(0, os.getcwd())

try:
    from app.api.frameworks import router
    print("✅ Frameworks router imported successfully")
    print(f"   Routes: {len(router.routes)}")
    
    # List all routes
    for route in router.routes:
        if hasattr(route, 'path'):
            print(f"   - {route.path}")
except ImportError as e:
    print(f"❌ Could not import frameworks router: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
EOF
echo ""

# ============================================================================
# Step 7: Start Server
# ============================================================================
echo "🔍 Step 7: Starting Python AI Engine..."
echo "   Port: ${PORT:-8000}"
echo "   Access at: http://localhost:${PORT:-8000}"
echo ""
echo "📝 Available endpoints:"
echo "   GET  /frameworks/info             - Framework information"
echo "   POST /frameworks/langgraph/execute - Execute LangGraph workflow"
echo "   POST /frameworks/autogen/execute   - Execute AutoGen workflow (YOUR FORK!)"
echo "   POST /frameworks/crewai/execute    - Execute CrewAI workflow"
echo ""
echo "🚀 Starting server..."
echo "   Press Ctrl+C to stop"
echo ""

# Start the server
python3 start.py

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║     ✅ Python AI Engine Stopped                                  ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"

