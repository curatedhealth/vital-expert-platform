#!/bin/bash
# Start VITAL AI Engine Backend with Environment Variables

set -e

cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Load environment variables from .env.local
if [ -f .env.local ]; then
    echo "Loading environment variables from .env.local..."
    export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
else
    echo "❌ .env.local not found!"
    exit 1
fi

# Set PYTHONPATH
export PYTHONPATH="${PWD}/src"

# Verify critical env vars
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set!"
    exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not set!"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "✅ PYTHONPATH: $PYTHONPATH"
echo "✅ PORT: ${PORT:-8000}"
echo ""
echo "🚀 Starting uvicorn on port ${PORT:-8000}..."
echo ""

# Start uvicorn
python3 -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port ${PORT:-8000}
