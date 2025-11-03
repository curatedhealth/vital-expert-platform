#!/bin/bash

# AI Engine Startup Script with Proper Python Path

cd "$(dirname "$0")"
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

echo "🚀 VITAL AI Engine Startup"
echo "=========================="
echo ""

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Run: python3 -m venv venv"
    exit 1
fi

# Add src directory to PYTHONPATH so imports work
export PYTHONPATH="${PWD}/src:${PYTHONPATH}"
echo "✅ PYTHONPATH set to: $PYTHONPATH"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Some features may not work without environment variables"
    echo ""
fi

# Start the server
echo "🚀 Starting AI Engine on port 8000..."
echo "   Access health check: http://localhost:8000/health"
echo "   Access docs: http://localhost:8000/docs"
echo ""

# Run uvicorn with proper module path
python3 -m uvicorn main:app --reload --port 8000 --app-dir src

