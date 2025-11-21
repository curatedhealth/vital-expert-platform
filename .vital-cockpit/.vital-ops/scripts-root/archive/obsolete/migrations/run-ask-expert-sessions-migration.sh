#!/bin/bash
# Run Ask Expert Sessions Migration
# This script applies the ask_expert_sessions table migration to Supabase

set -e

echo "🚀 Running Ask Expert Sessions Migration"
echo "=========================================="

# Check for required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_URL is not set"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set"
    exit 1
fi

# Migration file
MIGRATION_FILE="supabase/migrations/20250129000001_create_ask_expert_sessions.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ ERROR: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo "🔗 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Check if using Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI detected"
    echo "📦 Applying migration via Supabase CLI..."
    supabase db push --file "$MIGRATION_FILE"
else
    echo "⚠️  Supabase CLI not found. Using direct SQL execution..."
    echo ""
    echo "To apply the migration:"
    echo "1. Open Supabase Dashboard: $NEXT_PUBLIC_SUPABASE_URL"
    echo "2. Go to SQL Editor"
    echo "3. Copy and paste the contents of: $MIGRATION_FILE"
    echo "4. Execute the migration"
    echo ""
    echo "Or install Supabase CLI:"
    echo "  npm install -g supabase"
    echo "  supabase login"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    
    # Show migration preview
    echo "📋 Migration Preview (first 50 lines):"
    echo "-----------------------------------"
    head -n 50 "$MIGRATION_FILE"
    echo "..."
    echo ""
fi

echo "✅ Migration script completed"
echo ""
echo "📊 Next steps:"
echo "1. Verify tables created: ask_expert_sessions, ask_expert_messages"
echo "2. Check indexes are created"
echo "3. Verify triggers are set up"
echo ""
echo "🧪 Test the migration:"
echo "  SELECT COUNT(*) FROM ask_expert_sessions;"
echo "  SELECT COUNT(*) FROM ask_expert_messages;"

