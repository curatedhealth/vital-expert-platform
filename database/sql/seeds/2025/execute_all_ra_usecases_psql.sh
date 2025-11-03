#!/bin/bash
# =====================================================================================
# Execute ALL Regulatory Affairs Use Cases using psql
# =====================================================================================

set -e

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

echo ""
echo "========================================="
echo "  REGULATORY AFFAIRS USE CASES"
echo "  Seeding All 10 Use Cases via psql"
echo "========================================="
echo ""

# Change to seeds directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Database connection details
# You need to get your database password from:
# https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/settings/database
# Click "Show" next to "Database password"

echo "⚠️  Please enter your Supabase database password:"
echo "   (Get it from: Supabase Dashboard > Settings > Database > Database password)"
echo ""
read -s -p "Password: " DB_PASSWORD
echo ""
echo ""

# Connection string
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres"

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
    
    if psql "$DB_URL" -f "$SQL_FILE" 2>&1; then
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

