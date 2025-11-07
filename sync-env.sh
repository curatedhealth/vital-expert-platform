#!/bin/bash
# ============================================================================
# 🔑 UNIFIED ENVIRONMENT CONFIGURATION SYNC
# ============================================================================
# TAG: ENV_SYNC_SCRIPT
# This script ensures ALL services use the SAME API keys from the master .env.local
#
# MASTER SOURCE: apps/digital-health-startup/.env.local
# SYNCED TO:
#   - services/ai-engine/.env
#   - services/api-gateway/.env  
#   - Root .env.local
#
# WHY: Prevents "Invalid API key" errors when keys are updated in one place
# but not others.
#
# USAGE: ./sync-env.sh
# ============================================================================

set -e

PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"
MASTER_ENV="$PROJECT_ROOT/apps/digital-health-startup/.env.local"

echo "🔗 Syncing environment variables from master .env.local..."
echo ""

# Check if master exists
if [ ! -f "$MASTER_ENV" ]; then
    echo "❌ ERROR: Master .env.local not found at: $MASTER_ENV"
    exit 1
fi

echo "✅ Master .env.local found"
echo ""

# Extract critical keys from master
export OPENAI_API_KEY=$(grep "^OPENAI_API_KEY=" "$MASTER_ENV" | cut -d'=' -f2-)
export OPENAI_ORG_ID=$(grep "^OPENAI_ORG_ID=" "$MASTER_ENV" | cut -d'=' -f2-)
export PINECONE_API_KEY=$(grep "^PINECONE_API_KEY=" "$MASTER_ENV" | cut -d'=' -f2-)
export PINECONE_INDEX_NAME=$(grep "^PINECONE_INDEX_NAME=" "$MASTER_ENV" | cut -d'=' -f2-)
export PINECONE_ENVIRONMENT=$(grep "^PINECONE_ENVIRONMENT=" "$MASTER_ENV" | cut -d'=' -f2-)
export SUPABASE_SERVICE_ROLE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$MASTER_ENV" | cut -d'=' -f2-)
export NEXT_PUBLIC_SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$MASTER_ENV" | cut -d'=' -f2-)
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$MASTER_ENV" | cut -d'=' -f2-)
export ANTHROPIC_API_KEY=$(grep "^ANTHROPIC_API_KEY=" "$MASTER_ENV" | cut -d'=' -f2-)

echo "📦 Critical keys extracted:"
echo "   ✅ OPENAI_API_KEY: ${OPENAI_API_KEY:0:30}..."
echo "   ✅ PINECONE_API_KEY: ${PINECONE_API_KEY:0:30}..."
echo "   ✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:30}..."
echo ""

# Function to update or add key in .env file
update_env_key() {
    local file=$1
    local key=$2
    local value=$3
    
    if [ -z "$value" ]; then
        # If value is empty, keep existing or add commented
        if ! grep -q "^${key}=" "$file" 2>/dev/null; then
            echo "# ${key}=" >> "$file"
        fi
        return
    fi
    
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        # Key exists, update it (macOS compatible)
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file" && rm "${file}.bak"
    else
        # Key doesn't exist, add it
        echo "${key}=${value}" >> "$file"
    fi
}

# Sync to AI Engine
echo "🔧 Syncing to: services/ai-engine/.env"
AI_ENGINE_ENV="$PROJECT_ROOT/services/ai-engine/.env"
mkdir -p "$(dirname "$AI_ENGINE_ENV")"
touch "$AI_ENGINE_ENV"

# Add header comment
if ! grep -q "TAG: ENV_SYNCED_FROM_MASTER" "$AI_ENGINE_ENV"; then
    echo "# ============================================================================" > "$AI_ENGINE_ENV.tmp"
    echo "# 🔑 TAG: ENV_SYNCED_FROM_MASTER" >> "$AI_ENGINE_ENV.tmp"
    echo "# Auto-synced from: apps/digital-health-startup/.env.local" >> "$AI_ENGINE_ENV.tmp"
    echo "# DO NOT EDIT API KEYS HERE - Edit master .env.local and run: ./sync-env.sh" >> "$AI_ENGINE_ENV.tmp"
    echo "# ============================================================================" >> "$AI_ENGINE_ENV.tmp"
    echo "" >> "$AI_ENGINE_ENV.tmp"
    cat "$AI_ENGINE_ENV" >> "$AI_ENGINE_ENV.tmp" 2>/dev/null || true
    mv "$AI_ENGINE_ENV.tmp" "$AI_ENGINE_ENV"
fi

update_env_key "$AI_ENGINE_ENV" "OPENAI_API_KEY" "$OPENAI_API_KEY"
update_env_key "$AI_ENGINE_ENV" "OPENAI_ORG_ID" "$OPENAI_ORG_ID"
update_env_key "$AI_ENGINE_ENV" "PINECONE_API_KEY" "$PINECONE_API_KEY"
update_env_key "$AI_ENGINE_ENV" "PINECONE_INDEX_NAME" "$PINECONE_INDEX_NAME"
update_env_key "$AI_ENGINE_ENV" "PINECONE_ENVIRONMENT" "$PINECONE_ENVIRONMENT"
update_env_key "$AI_ENGINE_ENV" "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
update_env_key "$AI_ENGINE_ENV" "SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
update_env_key "$AI_ENGINE_ENV" "SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
update_env_key "$AI_ENGINE_ENV" "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"
update_env_key "$AI_ENGINE_ENV" "PORT" "8080"
echo "   ✅ AI Engine synced"

# Sync to API Gateway
echo "🔧 Syncing to: services/api-gateway/.env"
API_GATEWAY_ENV="$PROJECT_ROOT/services/api-gateway/.env"
mkdir -p "$(dirname "$API_GATEWAY_ENV")"
touch "$API_GATEWAY_ENV"

update_env_key "$API_GATEWAY_ENV" "OPENAI_API_KEY" "$OPENAI_API_KEY"
update_env_key "$API_GATEWAY_ENV" "PINECONE_API_KEY" "$PINECONE_API_KEY"
update_env_key "$API_GATEWAY_ENV" "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
update_env_key "$API_GATEWAY_ENV" "SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
echo "   ✅ API Gateway synced"

# Sync to Root
echo "🔧 Syncing to: .env.local (root)"
ROOT_ENV="$PROJECT_ROOT/.env.local"
touch "$ROOT_ENV"

update_env_key "$ROOT_ENV" "OPENAI_API_KEY" "$OPENAI_API_KEY"
update_env_key "$ROOT_ENV" "PINECONE_API_KEY" "$PINECONE_API_KEY"
update_env_key "$ROOT_ENV" "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
echo "   ✅ Root synced"

echo ""
echo "✅ Environment sync complete!"
echo ""
echo "📋 Summary:"
echo "   Master: apps/digital-health-startup/.env.local"
echo "   Synced: services/ai-engine/.env"
echo "   Synced: services/api-gateway/.env"
echo "   Synced: .env.local (root)"
echo ""
echo "🔄 To apply changes, restart all services:"
echo "   Frontend: cd apps/digital-health-startup && pnpm dev"
echo "   Backend:  cd services/ai-engine && python3 src/main.py"

