#!/bin/bash
# Execute UC_RA_001 - Single file version

set -e

echo "🚀 Executing UC_RA_001: FDA Software Classification (SaMD)"
echo ""

# Get database URL
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL=$(grep SUPABASE_DB_URL ../../.env.local 2>/dev/null | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  echo "Set it manually: export DATABASE_URL='your-connection-string'"
  exit 1
fi

echo "📁 Executing UC_RA_001_COMPLETE.sql..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f UC_RA_001_COMPLETE.sql

echo ""
echo "✅ UC_RA_001 seeded successfully!"

