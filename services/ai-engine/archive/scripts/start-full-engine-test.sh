#!/bin/bash

# Start full AI Engine on port 8001 for testing (while minimal runs on 8000)

cd "$(dirname "$0")"

echo "🚀 Starting Full AI Engine (LangGraph) on port 8001..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment from .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found - using defaults"
fi

# Set PYTHONPATH to include src directory
export PYTHONPATH="${PWD}/src:${PYTHONPATH}"
echo "✅ PYTHONPATH set to: $PYTHONPATH"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
elif [ -d ".venv" ]; then
    echo "✅ Activating virtual environment..."
    source .venv/bin/activate
else
    echo "⚠️  No virtual environment found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Port: 8001 (test port)"
echo "Supabase URL: ${SUPABASE_URL:-'Not set'}"
echo "Redis URL: ${REDIS_URL:-'Not set'}"
echo "OpenAI Key: ${OPENAI_API_KEY:+'Set'}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kill any existing process on port 8001
if lsof -ti:8001 > /dev/null 2>&1; then
    echo "⚠️  Killing existing process on port 8001..."
    lsof -ti:8001 | xargs kill -9
    sleep 1
fi

# Start the full AI Engine
echo "🚀 Starting full AI Engine with LangGraph workflows..."
echo ""
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload --log-level info

