#!/bin/bash
# Helper script to load agents to Neo4j with environment variables
# SECURITY: Load credentials from .env file - NEVER hardcode

SCRIPT_DIR="$(dirname "$0")"
ENV_FILE="$SCRIPT_DIR/../.env"

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
    echo "📦 Loading environment from .env..."
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo "⚠️  No .env file found at $ENV_FILE"
    echo "   Please create one with: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_KEY"
    exit 1
fi

# Verify required vars
if [ -z "$NEO4J_URI" ] || [ -z "$NEO4J_PASSWORD" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Missing required environment variables!"
    echo "   Required: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_KEY"
    exit 1
fi

echo "✅ Environment variables loaded from .env"
echo "🚀 Running Neo4j loading script..."

# Run the script
python3 "$(dirname "$0")/load_agents_to_neo4j.py" "$@"

