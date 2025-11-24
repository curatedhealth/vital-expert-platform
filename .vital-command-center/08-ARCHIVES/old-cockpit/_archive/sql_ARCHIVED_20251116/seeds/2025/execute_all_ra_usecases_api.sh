#!/bin/bash
# =====================================================================================
# Execute ALL Regulatory Affairs Use Cases (UC_RA_001 through UC_RA_010)
# Using Supabase REST API (no psql required)
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

# Load environment variables
SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"

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
    SQL_FILE="${UC}.sql"
    echo "📁 Executing: ${SQL_FILE}"
    
    # Read SQL file and execute via REST API
    SQL_CONTENT=$(cat "${SQL_FILE}")
    
    # Execute via Supabase REST API
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(jq -Rs . <<< "$SQL_CONTENT")}" 2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo "✅ ${UC} completed"
        ((SUCCESS_COUNT++))
    else
        echo "❌ ${UC} failed (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
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

