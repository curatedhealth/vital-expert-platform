#!/bin/bash
# =====================================================================================
# Execute ALL Regulatory Affairs Use Cases using psql
# Alternative method: Using connection pooler (easier authentication)
# =====================================================================================

set -e

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

echo ""
echo "========================================="
echo "  REGULATORY AFFAIRS USE CASES"
echo "  Seeding All 10 Use Cases"
echo "========================================="
echo ""

cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

echo "📝 INSTRUCTIONS:"
echo ""
echo "Please go to your Supabase Dashboard and get the connection string:"
echo "https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/settings/database"
echo ""
echo "1. Scroll to 'Connection string'"
echo "2. Select the 'URI' tab (NOT Session mode)"
echo "3. Click 'Copy' - it will look like:"
echo "   postgresql://postgres.xazinxsiglqokwfmogyk:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
echo ""
echo "4. Paste the FULL connection string below:"
echo ""
read -p "Connection String: " DB_URL
echo ""

# Verify the connection first
echo "🔍 Testing connection..."
if psql "$DB_URL" -c "SELECT 1;" &>/dev/null; then
    echo "✅ Connection successful!"
    echo ""
else
    echo "❌ Connection failed. Please check your connection string and try again."
    exit 1
fi

# Array of use cases
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
    SQL_FILE="${UC}.sql"
    echo "📁 Executing: ${SQL_FILE}"
    
    if psql "$DB_URL" -f "$SQL_FILE" > "${UC}_output.log" 2>&1; then
        # Show the verification output
        grep -A 5 "========================================" "${UC}_output.log" | tail -6
        echo "✅ ${UC} completed"
        ((SUCCESS_COUNT++))
    else
        echo "❌ ${UC} failed"
        echo "   See ${UC}_output.log for details"
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
    echo "📊 Verify in Supabase Dashboard:"
    echo "   - Table Editor > dh_use_case (should show 10 RA use cases)"
    echo "   - Table Editor > dh_task (should show 68 tasks)"
    echo ""
fi

