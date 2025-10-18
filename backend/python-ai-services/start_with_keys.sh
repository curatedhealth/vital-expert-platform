#!/bin/bash

# Script to start real LangGraph backend with API keys
echo "🚀 Starting Real LangGraph Backend with API Keys"

# Check if API keys are provided
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. Please set your OpenAI API key:"
    echo "export OPENAI_API_KEY='your-openai-key-here'"
    echo ""
    echo "Or run this script with:"
    echo "OPENAI_API_KEY='your-key' ./start_with_keys.sh"
    exit 1
fi

if [ -z "$HUGGINGFACE_API_KEY" ]; then
    echo "⚠️  HUGGINGFACE_API_KEY not set. Please set your HuggingFace API key:"
    echo "export HUGGINGFACE_API_KEY='your-huggingface-key-here'"
    echo ""
    echo "Or run this script with:"
    echo "HUGGINGFACE_API_KEY='your-key' ./start_with_keys.sh"
    exit 1
fi

echo "✅ API Keys detected"
echo "🔧 Starting Real LangGraph Backend on port 8002..."

# Start the backend
python3 real_langgraph_backend.py
