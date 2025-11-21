#!/bin/bash
# ============================================================================
# PHASE 2 DATABASE MIGRATION SCRIPT
# ============================================================================
# Purpose: Run Phase 2 (Long-Term Memory) database migrations on Supabase
# Usage: ./scripts/run_phase2_migration.sh
# ============================================================================

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PHASE 2: LONG-TERM MEMORY - DATABASE MIGRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "⚠️  No .env file found. Using environment variables."
fi

# Check if SUPABASE_URL and SUPABASE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_KEY must be set"
    echo ""
    echo "Please set them in .env or export them:"
    echo "  export SUPABASE_URL='https://your-project.supabase.co'"
    echo "  export SUPABASE_KEY='your-service-role-key'"
    exit 1
fi

echo "📊 Supabase Connection:"
echo "   URL: $SUPABASE_URL"
echo "   Key: ${SUPABASE_KEY:0:20}..."
echo ""

# Migration file path
MIGRATION_FILE="database/sql/migrations/2025/20251101120000_session_memories.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📁 Migration file: $MIGRATION_FILE"
echo ""

# Read the migration file
MIGRATION_SQL=$(cat "$MIGRATION_FILE")

echo "🔄 Executing migration via Supabase REST API..."
echo ""

# Execute migration via Supabase REST API
RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}")

# Check response
if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ Migration failed:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo "✅ Migration executed successfully!"
echo ""

# Verification queries
echo "🔍 Verifying migration..."
echo ""

# Check if table exists
TABLE_CHECK=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/session_memories?select=id&limit=1" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY")

if echo "$TABLE_CHECK" | grep -q "error"; then
    echo "❌ session_memories table not found or not accessible"
    echo "$TABLE_CHECK" | jq '.'
    exit 1
else
    echo "✅ session_memories table verified"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PHASE 2 MIGRATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "   1. Python dependencies already in requirements.txt:"
echo "      - sentence-transformers==2.2.2"
echo "      - faiss-cpu==1.7.4"
echo "   2. EmbeddingService: ✅ Already implemented"
echo "   3. SessionMemoryService: ✅ Already implemented"
echo "   4. Integration: Next step in the plan"
echo ""
echo "🎯 Ready for Phase 2.2: Verify Services"
echo ""

