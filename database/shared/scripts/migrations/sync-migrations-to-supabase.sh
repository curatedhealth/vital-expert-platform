#!/bin/bash
# ============================================================================
# Sync Database Migrations to Supabase Directory
# ============================================================================
# This script syncs database/postgres/migrations/ and database/postgres/seeds/ to supabase/
# for Supabase CLI compatibility (supabase db push expects files in supabase/)
#
# Usage:
#   ./scripts/sync-migrations-to-supabase.sh
#
# Note: This is a one-way sync (database/ → supabase/)
#       database/ remains the single source of truth

set -e  # Exit on error

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "============================================================================"
echo "🔄 Syncing Database Migrations to Supabase"
echo "============================================================================"
echo ""

# Ensure supabase directories exist
mkdir -p "$PROJECT_ROOT/supabase/migrations"
mkdir -p "$PROJECT_ROOT/supabase/seeds"

# Sync migrations
echo "📦 Syncing migrations..."
if [ -d "$PROJECT_ROOT/database/postgres/migrations" ]; then
    mkdir -p "$PROJECT_ROOT/supabase/migrations"
    cp -r "$PROJECT_ROOT/database/postgres/migrations"/* "$PROJECT_ROOT/supabase/migrations/" 2>/dev/null || true
    echo "   ✅ Migrations synced: $(find "$PROJECT_ROOT/supabase/migrations" -name "*.sql" | wc -l | tr -d ' ') files"
else
    echo "   ⚠️  database/postgres/migrations/ not found"
fi

# Sync seeds
echo "🌱 Syncing seeds..."
if [ -d "$PROJECT_ROOT/database/postgres/seeds" ]; then
    mkdir -p "$PROJECT_ROOT/supabase/seeds"
    cp -r "$PROJECT_ROOT/database/postgres/seeds"/* "$PROJECT_ROOT/supabase/seeds/" 2>/dev/null || true
    echo "   ✅ Seeds synced: $(find "$PROJECT_ROOT/supabase/seeds" -name "*.sql" -o -name "*.py" | wc -l | tr -d ' ') files"
else
    echo "   ⚠️  database/postgres/seeds/ not found"
fi

echo ""
echo "✅ Sync complete!"
echo ""
echo "Note: database/postgres/ remains the single source of truth."
echo "      Run this script before 'supabase db push' if needed."
echo ""
