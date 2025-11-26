#!/bin/bash

# Load environment variables from .env file
if [ -f "../../.env" ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' ../../.env | grep -E '^(SUPABASE_URL|SUPABASE_SERVICE_KEY|NEO4J_URI|NEO4J_USER|NEO4J_PASSWORD)=' | xargs)
else
    echo "⚠️  .env file not found at ../../.env"
    echo "Please ensure your .env file exists in the project root"
    exit 1
fi

# Run the script
echo "Running Neo4j loading script..."
python3 scripts/load_agents_to_neo4j.py "$@"
