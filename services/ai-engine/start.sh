#!/bin/bash
# AI Engine Startup Script with proper PYTHONPATH

set -e  # Exit on error

echo "🚀 Starting VITAL AI Engine..."
echo ""

# Navigate to AI Engine directory
cd "$(dirname "$0")"
AI_ENGINE_DIR="$(pwd)"

echo "📁 Working directory: $AI_ENGINE_DIR"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Set PYTHONPATH to include src directory
export PYTHONPATH="${AI_ENGINE_DIR}/src:${PYTHONPATH}"
echo "✅ PYTHONPATH set to: $PYTHONPATH"
echo ""

# Kill any existing AI Engine process on port 8000
echo "🛑 Checking for existing processes on port 8000..."
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "   Killing existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start the AI Engine
echo "🚀 Starting AI Engine on port 8000..."
cd src
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Note: --reload will auto-restart on code changes

