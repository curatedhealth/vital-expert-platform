#!/bin/bash

# VITAL Multi-Tenant Migration Execution Script
# ==============================================

set -e  # Exit on any error

# Database connection
DB_HOST="db.bomltkhixeatxuoxmolq.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"
DB_PASSWORD="flusd9fqEb4kkTJ1"

export PGPASSWORD="$DB_PASSWORD"

echo "============================================"
echo "VITAL Multi-Tenant Migration"
echo "============================================"
echo ""

# Create logs directory
mkdir -p logs

echo "Step 1: Executing schema fixes..."
echo "-------------------------------------------"
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f 001_schema_fixes.sql 2>&1 | tee logs/001_schema_fixes.log

echo ""
echo "✅ Schema fixes completed!"
echo ""
echo "Check logs/001_schema_fixes.log for details"
echo ""
echo "============================================"
echo "Migration Step 1 Complete"
echo "============================================"

