#!/bin/bash
# =====================================================================================
# Execute ALL Regulatory Affairs Use Cases (UC_RA_001 through UC_RA_010)
# =====================================================================================

set -e

echo ""
echo "========================================="
echo "  REGULATORY AFFAIRS USE CASES"
echo "  Seeding All 10 Use Cases"
echo "========================================="
echo ""

# Change to seeds directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ ERROR: Supabase CLI not found"
    exit 1
fi

# Array of use cases to execute
USE_CASES=(
    "UC_RA_001"
    "UC_RA_002"
    "UC_RA_003"
    "UC_RA_004"
    "UC_RA_005"
    "UC_RA_006"
    "UC_RA_007"
    "UC_RA_008"
    "UC_RA_009"
    "UC_RA_010"
)

SUCCESS_COUNT=0
FAILED_COUNT=0

# Execute each use case
for UC in "${USE_CASES[@]}"; do
    echo "📁 Executing: ${UC}.sql"
    if supabase db execute --file "${UC}.sql" --linked 2>&1; then
        echo "✅ ${UC} completed"
        ((SUCCESS_COUNT++))
    else
        echo "❌ ${UC} failed"
        ((FAILED_COUNT++))
    fi
    echo ""
done

echo "========================================="
echo "  EXECUTION SUMMARY"
echo "========================================="
echo "✅ Successful: ${SUCCESS_COUNT}/10"
echo "❌ Failed: ${FAILED_COUNT}/10"
echo "========================================="

if [ $FAILED_COUNT -eq 0 ]; then
    echo ""
    echo "🎉 All 10 Regulatory Affairs use cases seeded successfully!"
    echo ""
fi

