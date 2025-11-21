#!/bin/bash
# Run Step 2 Migration: Map Critical Domains
# Usage: ./scripts/run-step2-migration.sh

set -e

echo "🚀 Running Step 2 Migration: Map Critical Domains..."
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "   Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo "⚠️  Warning: No .env file found. Make sure SUPABASE_DB_URL is set."
fi

# Get migration file path
MIGRATION_FILE="database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Option 1: Use Supabase CLI (if linked to project)
if supabase status &> /dev/null; then
    echo "✅ Supabase project linked. Using Supabase CLI..."
    echo ""
    
    # Check if db push is available (for remote)
    if supabase db remote &> /dev/null; then
        echo "🌐 Pushing migration to remote database..."
        supabase db push --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < "$MIGRATION_FILE"
    else
        echo "📤 Applying migration via SQL..."
        supabase db execute -f "$MIGRATION_FILE"
    fi
else
    echo "⚠️  Supabase project not linked locally."
    echo "   Option A: Use Supabase Dashboard SQL Editor (recommended)"
    echo "   Option B: Link project: supabase link --project-ref <your-project-ref>"
    echo ""
    echo "📋 Migration file location:"
    echo "   $MIGRATION_FILE"
    echo ""
    echo "📝 Copy and paste the SQL into Supabase Dashboard → SQL Editor"
    exit 1
fi

echo ""
echo "✅ Step 2 migration completed!"
echo ""
echo "🔍 Verify with:"
echo "   SELECT * FROM verify_critical_domains_mapping();"

