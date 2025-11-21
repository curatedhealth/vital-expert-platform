#!/bin/bash
# =====================================================================================
# Run All Transformed Seed Files
# =====================================================================================

set -e

DB_PASSWORD="flusd9fqEb4kkTJ1"
DB_HOST="db.bomltkhixeatxuoxmolq.supabase.co"
DB_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/postgres"

echo "================================================================================"
echo "🚀 Loading Transformed Seed Files into NEW DB"
echo "================================================================================"
echo ""

# Run each file in order
files=(
    "00_foundation_agents.sql"
    "01_foundation_personas.sql"
    "02_COMPREHENSIVE_TOOLS_ALL.sql"
    "05_COMPREHENSIVE_PROMPTS_ALL.sql"
    "06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql"
    "20_medical_affairs_personas.sql"
    "21_phase2_jtbds.sql"
    "22_digital_health_jtbds.sql"
)

count=0
total=${#files[@]}

for file in "${files[@]}"; do
    count=$((count + 1))
    echo "[${count}/${total}] Loading ${file}..."

    if PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" -c "\set ON_ERROR_STOP on" -f "${file}" > /dev/null 2>&1; then
        echo "   ✅ SUCCESS"
    else
        echo "   ❌ FAILED"
        echo "   Error loading ${file}. Check the file and try again."
        exit 1
    fi
    echo ""
done

echo "================================================================================"
echo "✅ All seed files loaded successfully!"
echo "================================================================================"
