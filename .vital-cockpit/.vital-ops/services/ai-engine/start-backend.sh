#!/bin/bash
# Start VITAL AI Engine Backend (Port 8080)

cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Set PYTHONPATH
export PYTHONPATH="${PWD}/src"

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Start uvicorn
python3 -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8080


