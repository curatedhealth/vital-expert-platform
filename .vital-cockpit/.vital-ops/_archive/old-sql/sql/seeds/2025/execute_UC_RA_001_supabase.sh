#!/bin/bash
# =====================================================================================
# Execute UC_RA_001 using Supabase CLI
# =====================================================================================

set -e

echo ""
echo "========================================="
echo "UC_RA_001: FDA Software Classification"
echo "========================================="
echo ""

# Change to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ ERROR: Supabase CLI not found"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

echo "📁 Executing: UC_RA_001.sql"
echo ""

# Execute using Supabase CLI (linked project)
supabase db execute --file "database/sql/seeds/2025/UC_RA_001.sql" --linked

echo ""
echo "✅ Execution complete!"
echo ""

