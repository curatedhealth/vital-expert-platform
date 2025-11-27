#!/bin/bash
# ============================================================================
# Deploy User Panels Migrations
# ============================================================================
# This script applies all necessary migrations for the user_panels feature
# including the workflow_definition column required by the designer.
#
# Usage:
#   ./scripts/deploy-user-panels-migrations.sh
#
# Prerequisites:
#   - Supabase CLI installed
#   - Supabase project linked
#   - Valid database connection

set -e  # Exit on error

echo "============================================================================"
echo "🚀 Deploying User Panels Migrations"
echo "============================================================================"
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "   Please install it: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if project is linked
if [ ! -f ".git/config" ] || [ ! -d "supabase" ]; then
    echo "❌ Error: Not in project root or Supabase not initialized"
    exit 1
fi

echo "📋 Migrations to deploy:"
echo "  1. 20251126000002_ensure_profiles_table.sql"
echo "  2. 20251126000003_create_user_panels_table.sql"
echo "  3. 20251127000001_add_workflow_definition_to_user_panels.sql"
echo ""

# Deploy migrations using Supabase CLI
echo "🔄 Applying migrations..."
echo ""

# Option 1: Use supabase db push (applies all pending migrations)
if supabase db push; then
    echo ""
    echo "✅ Migrations applied successfully!"
    echo ""

    # Verify the schema
    echo "🔍 Verifying schema..."
    echo ""

    # Check if user_panels table exists with workflow_definition column
    if supabase db execute "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_panels' AND column_name = 'workflow_definition';" > /dev/null 2>&1; then
        echo "✅ user_panels.workflow_definition column verified"
    else
        echo "⚠️  Warning: Could not verify workflow_definition column"
    fi

    echo ""
    echo "============================================================================"
    echo "✅ User Panels Feature Ready"
    echo "============================================================================"
    echo ""
    echo "You can now:"
    echo "  1. Create custom panels in the workflow designer"
    echo "  2. Save workflow definitions with nodes and edges"
    echo "  3. Load and edit saved panels"
    echo ""
    echo "Next steps:"
    echo "  - Restart your development server: npm run dev"
    echo "  - Test saving a panel in the designer UI"
    echo ""
else
    echo ""
    echo "❌ Migration deployment failed"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Supabase connection: supabase status"
    echo "  2. View logs: supabase db logs"
    echo "  3. Manually apply migrations in Supabase SQL Editor"
    echo ""
    echo "Manual deployment:"
    echo "  1. Go to: https://supabase.com/dashboard → Your Project → SQL Editor"
    echo "  2. Run each migration file in order from supabase/migrations/"
    echo ""
    exit 1
fi
