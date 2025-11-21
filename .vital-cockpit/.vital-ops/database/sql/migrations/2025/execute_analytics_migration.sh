#!/bin/bash

# ============================================================================
# Execute Unified Analytics Migration
# This script applies the TimescaleDB analytics schema to your database
# ============================================================================

set -e  # Exit on error

echo "🚀 VITAL Unified Analytics - Migration Execution"
echo "=================================================="
echo ""

# Check for required environment variables
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: SUPABASE_DB_URL environment variable not set"
    echo ""
    echo "Please set your Supabase database URL:"
    echo "  export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres'"
    echo ""
    exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql not found"
    echo ""
    echo "Please install PostgreSQL client tools:"
    echo "  macOS:   brew install postgresql"
    echo "  Ubuntu:  sudo apt-get install postgresql-client"
    echo ""
    exit 1
fi

echo "📋 Pre-migration checks..."
echo ""

# Test database connection
echo "🔌 Testing database connection..."
if ! psql "$SUPABASE_DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "❌ Error: Could not connect to database"
    echo ""
    echo "Please verify your SUPABASE_DB_URL is correct"
    exit 1
fi
echo "✅ Database connection successful"
echo ""

# Check if TimescaleDB extension is available
echo "🔍 Checking for TimescaleDB extension..."
TIMESCALE_AVAILABLE=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM pg_available_extensions WHERE name = 'timescaledb';")
if [ "$TIMESCALE_AVAILABLE" -eq 0 ]; then
    echo "⚠️  Warning: TimescaleDB extension not available"
    echo "   The migration will create regular tables instead"
    echo "   For production, consider using a database with TimescaleDB support"
    echo ""
else
    echo "✅ TimescaleDB extension available"
    echo ""
fi

# Confirm migration
echo "📝 Migration details:"
echo "   - Creates analytics schema"
echo "   - Creates platform_events table (with TimescaleDB if available)"
echo "   - Creates tenant_cost_events table (with TimescaleDB if available)"
echo "   - Creates agent_executions table (with TimescaleDB if available)"
echo "   - Creates materialized views for fast queries"
echo "   - Creates helper functions"
echo ""

read -p "🤔 Proceed with migration? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Executing migration..."
echo ""

# Execute migration
MIGRATION_FILE="database/sql/migrations/2025/20251104000000_unified_analytics_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

if psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Analytics tables created:"
    echo "   - analytics.platform_events"
    echo "   - analytics.tenant_cost_events"
    echo "   - analytics.agent_executions"
    echo ""
    echo "📈 Materialized views created:"
    echo "   - analytics.tenant_daily_summary"
    echo "   - analytics.tenant_cost_summary"
    echo "   - analytics.agent_performance_summary"
    echo ""
    echo "⚡ Continuous aggregates created:"
    echo "   - analytics.tenant_metrics_realtime (5-minute rollup)"
    echo "   - analytics.cost_metrics_realtime (5-minute rollup)"
    echo ""
    echo "🎉 Your unified analytics warehouse is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Start your development server: npm run dev"
    echo "2. Navigate to /admin?view=rate-limits"
    echo "3. Navigate to /admin?view=abuse-detection"
    echo "4. Navigate to /admin?view=cost-analytics"
    echo ""
else
    echo ""
    echo "❌ Migration failed"
    echo ""
    echo "Please check the error messages above and try again"
    exit 1
fi

