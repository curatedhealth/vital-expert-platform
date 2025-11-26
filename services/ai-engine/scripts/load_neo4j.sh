#!/bin/bash
# Helper script to load agents to Neo4j with environment variables

# Set Neo4j credentials (using bolt for custom SSL context)
export NEO4J_URI="bolt://13067bdb.databases.neo4j.io"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="kkCxQgpcanSUDv-dKzOzDPcYIhvJHRQRa4tuiNa2Mek"

# Set Supabase credentials
export SUPABASE_URL="https://bomltkhixeatxuoxmolq.supabase.co"
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

echo "✅ Environment variables set"
echo "🚀 Running Neo4j loading script..."

# Run the script
python3 "$(dirname "$0")/load_agents_to_neo4j.py" "$@"

