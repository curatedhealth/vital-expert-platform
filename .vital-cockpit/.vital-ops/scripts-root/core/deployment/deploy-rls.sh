#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Deploying RLS Policies to VITAL AI Engine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Load environment if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Determine environment
ENV_NAME="${1:-dev}"
echo "📍 Environment: $ENV_NAME"

# Set DATABASE_URL based on environment
case $ENV_NAME in
    dev)
        DB_URL="${DATABASE_URL_DEV:-$DATABASE_URL}"
        ;;
    preview)
        DB_URL="${DATABASE_URL_PREVIEW}"
        ;;
    production)
        DB_URL="${DATABASE_URL_PROD}"
        ;;
    *)
        echo "❌ Invalid environment: $ENV_NAME"
        echo "Usage: ./deploy-rls.sh [dev|preview|production]"
        exit 1
        ;;
esac

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL not set for environment: $ENV_NAME"
    echo ""
    echo "Please set one of:"
    echo "  - DATABASE_URL_DEV for dev environment"
    echo "  - DATABASE_URL_PREVIEW for preview environment"
    echo "  - DATABASE_URL_PROD for production environment"
    exit 1
fi

echo "🗄️  Database: ${DB_URL%%@*}@***"
echo ""

# Confirm for production
if [ "$ENV_NAME" = "production" ]; then
    echo "⚠️  WARNING: You are about to deploy RLS policies to PRODUCTION"
    echo "   This will enforce tenant isolation at the database level."
    echo ""
    read -p "   Type 'yes' to confirm: " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
    echo ""
fi

# Check if migration file exists
MIGRATION_FILE="database/sql/migrations/001_enable_rls_comprehensive.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Apply migration
echo "📦 Applying RLS migration..."
echo ""

psql "$DB_URL" < "$MIGRATION_FILE"

PSQL_EXIT_CODE=$?

echo ""
if [ $PSQL_EXIT_CODE -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ RLS deployment complete for $ENV_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next steps:"
    echo "1. Run verification: ./scripts/verify-rls.sh $ENV_NAME"
    echo "2. Check health endpoint: curl http://localhost:8000/health"
    echo "3. Run security tests: pytest tests/security/"
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ RLS deployment failed for $ENV_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit $PSQL_EXIT_CODE
fi

