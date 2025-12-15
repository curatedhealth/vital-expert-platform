#!/bin/bash
# ============================================================================
# Quick Fix: Apply User Panels Migrations
# ============================================================================
# This script opens Supabase dashboard and shows you exactly what to do
#
# Usage: ./scripts/fix-panels-now.sh

set -e

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║      🚀 Quick Fix: User Panels Migration                      ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This will guide you through applying the database migrations."
echo ""

# Check if migration file exists
if [ ! -f "scripts/apply-all-user-panels-migrations.sql" ]; then
    echo "❌ Error: Migration file not found"
    echo "   Expected: scripts/apply-all-user-panels-migrations.sql"
    exit 1
fi

echo "✅ Migration file found"
echo ""
echo "📋 Steps to fix the save panel error:"
echo ""
echo "1. Opening Supabase Dashboard in your browser..."
echo "2. Then copy the SQL migration file to your clipboard"
echo ""
echo "Press ENTER to continue..."
read

# Open Supabase dashboard
echo "Opening Supabase Dashboard..."
open "https://supabase.com/dashboard" 2>/dev/null || echo "Please open: https://supabase.com/dashboard"

echo ""
echo "Copying migration SQL to clipboard..."

# Copy migration file to clipboard
if command -v pbcopy &> /dev/null; then
    cat database/postgres/migrations/apply-all-user-panels-migrations.sql | pbcopy
    echo "✅ Migration SQL copied to clipboard!"
else
    echo "⚠️  Could not copy to clipboard automatically"
    echo "   Please manually copy: database/postgres/migrations/apply-all-user-panels-migrations.sql"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📝 INSTRUCTIONS                                               ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  In the Supabase Dashboard:                                    ║"
echo "║                                                                ║"
echo "║  1. Click 'SQL Editor' in the left sidebar                    ║"
echo "║  2. Click 'New Query'                                          ║"
echo "║  3. Press Cmd+V to paste the migration SQL                    ║"
echo "║  4. Click 'Run' (or press Cmd+Enter)                          ║"
echo "║  5. Wait for success message: ✅ All migrations applied!      ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "After running the SQL:"
echo ""
echo "  • Restart your dev server: npm run dev"
echo "  • Test saving a panel in the Workflow Designer"
echo ""
echo "The migration SQL is also available at:"
echo "  database/postgres/migrations/apply-all-user-panels-migrations.sql"
echo ""
echo "Press ENTER when you've run the SQL in Supabase..."
read

echo ""
echo "Great! Let's verify the migration worked..."
echo ""

# Offer to open verification query
echo "Would you like to verify the migration? (y/n)"
read -r verify

if [ "$verify" = "y" ] || [ "$verify" = "Y" ]; then
    if command -v pbcopy &> /dev/null; then
        cat database/postgres/queries/verify-user-panels-schema.sql | pbcopy
        echo "✅ Verification SQL copied to clipboard!"
        echo ""
        echo "Paste this into a new SQL Editor query to verify."
        echo "You should see 'workflow_definition' column listed."
    else
        echo "Run this SQL to verify:"
        echo "  database/postgres/queries/verify-user-panels-schema.sql"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ DONE!                                                      ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Next steps:                                                   ║"
echo "║                                                                ║"
echo "║  1. Restart your dev server                                    ║"
echo "║  2. Go to Workflow Designer                                    ║"
echo "║  3. Create a workflow with agent nodes                         ║"
echo "║  4. Click 'Save as Custom Panel'                              ║"
echo "║  5. Panel should save successfully! 🎉                        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
