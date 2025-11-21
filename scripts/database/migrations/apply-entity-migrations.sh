#!/bin/bash

# Apply Entity Extraction Migrations
# This script applies the entity extraction database migrations

set -e

echo "🔧 Applying Entity Extraction Migrations..."
echo "=========================================="

# Check if Supabase is running
if ! npx supabase status > /dev/null 2>&1; then
  echo "❌ Supabase is not running. Starting Supabase..."
  npx supabase start
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 2

# Apply migration
MIGRATION_FILE="database/sql/migrations/2025/20250125000002_create_entity_extraction_tables.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📋 Applying migration: $MIGRATION_FILE"

# Apply migration using Supabase CLI
PGPASSWORD=postgres psql \
  -h 127.0.0.1 \
  -p 54322 \
  -U postgres \
  -d postgres \
  -f "$MIGRATION_FILE"

# Verify tables were created
echo ""
echo "✅ Verifying tables..."

PGPASSWORD=postgres psql \
  -h 127.0.0.1 \
  -p 54322 \
  -U postgres \
  -d postgres \
  -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%entity%' ORDER BY tablename;"

echo ""
echo "✅ Entity extraction migrations applied successfully!"
echo ""
echo "📊 Created tables:"
echo "  - extracted_entities"
echo "  - entity_relationships"
echo "  - entity_verification_queue"
echo "  - entity_medical_codes"
echo "  - entity_extraction_audit_log"
echo ""
echo "🎯 Next steps:"
echo "  1. Test entity extraction: npm run test:extraction"
echo "  2. Verify in Supabase Studio: http://localhost:54323"
echo ""
