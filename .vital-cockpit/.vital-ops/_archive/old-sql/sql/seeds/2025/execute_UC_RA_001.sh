#!/bin/bash
# =====================================================================================
# Execute UC_RA_001: FDA Software Classification (SaMD)
# =====================================================================================

set -e  # Exit on any error

echo ""
echo "========================================="
echo "UC_RA_001: FDA Software Classification"
echo "========================================="
echo ""

# Get DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL=$(grep SUPABASE_DB_URL ../../.env.local 2>/dev/null | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set"
  echo ""
  echo "Please set it manually:"
  echo "  export DATABASE_URL='postgresql://...'"
  echo ""
  exit 1
fi

echo "📁 Executing: UC_RA_001.sql"
echo ""

# Execute the SQL file
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f UC_RA_001.sql

echo ""
echo "✅ Execution complete!"
echo ""

