#!/bin/bash

# Load environment variables from .env file
if [ -f "../../.env" ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' ../../.env | grep -E '^(SUPABASE_URL|SUPABASE_SERVICE_KEY|PINECONE_API_KEY|OPENAI_API_KEY)=' | xargs)
else
    echo "⚠️  .env file not found at ../../.env"
    echo "Please ensure your .env file exists in the project root"
    exit 1
fi

# Run the script
echo "Running Pinecone loading script..."
python3 scripts/load_agents_to_pinecone.py "$@"
