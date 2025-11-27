#!/bin/bash
# Start Full AI Engine with LangGraph Workflows (Development Mode)

set -e

echo "🚀 Starting FULL AI Engine with LangGraph Workflows (Dev Mode)"
echo ""

cd "$(dirname "$0")"
AI_ENGINE_DIR="$(pwd)"

# Check venv
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    exit 1
fi

# Activate venv
source venv/bin/activate

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
    echo "✅ Environment variables loaded"
fi

# Set PYTHONPATH
export PYTHONPATH="${AI_ENGINE_DIR}/src:${PYTHONPATH}"

# Fix SSL certificate path for Python 3.9
export SSL_CERT_FILE=$(python3 -c "import certifi; print(certifi.where())")
echo "🔒 SSL_CERT_FILE: $SSL_CERT_FILE"

# Set development mode (skip heavy dependencies)
export SKIP_REDIS_INIT=true
export SKIP_PINECONE_INIT=true
export SKIP_HEAVY_DEPS=true

# Kill existing
echo "🛑 Stopping any existing AI Engine..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "🚀 Starting AI Engine on port 8000..."
cd src
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
AI_PID=$!

echo "✅ AI Engine started (PID: $AI_PID)"
echo "📋 Logs: tail -f /tmp/ai-engine.log"
echo ""
sleep 5

# Test
if lsof -ti:8000 > /dev/null; then
    echo "✅ AI Engine is running on port 8000"
    echo ""
    echo "Test it:"
    echo "  curl http://localhost:8000/health"
else
    echo "❌ AI Engine failed to start"
    exit 1
fi

