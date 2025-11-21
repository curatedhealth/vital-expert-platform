#!/bin/bash

# SQL Migration Execution Script
# Runs all migration files in the correct order

echo "========================================"
echo "VITAL Multi-Tenant Migration"
echo "========================================"
echo ""

# Database connection details
HOST="db.bomltkhixeatxuoxmolq.supabase.co"
USER="postgres"
DB="postgres"

# Migration files in execution order
FILES=(
    "000_pre_migration_validation.sql"
    "001_schema_fixes.sql"
    "002_tenant_setup.sql"
    "003_platform_data_migration.sql"
    "004_tenant_data_migration.sql"
    "005_post_migration_validation.sql"
)

# Check if password is provided
if [ -z "$PGPASSWORD" ]; then
    echo "WARNING: PGPASSWORD environment variable not set"
    echo "Usage: PGPASSWORD=your_password ./run-migrations.sh"
    echo ""
    read -sp "Enter database password: " PASSWORD
    echo ""
    export PGPASSWORD=$PASSWORD
fi

# Confirmation prompt
echo "This will execute the following migrations:"
for FILE in "${FILES[@]}"; do
    echo "  - $FILE"
done
echo ""
echo "Database: $DB@$HOST"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Starting migration..."
echo "========================================"
echo ""

FAILED=0
CURRENT=0

for FILE in "${FILES[@]}"; do
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/${#FILES[@]}] Executing $FILE ..."

    # Execute with error handling
    if psql -h $HOST -U $USER -d $DB -f "$FILE" -v ON_ERROR_STOP=1; then
        echo "  ✓ $FILE completed successfully"
    else
        echo "  ✗ $FILE FAILED"
        FAILED=1
        echo ""
        echo "Migration failed at $FILE"
        echo "Please review the error above and fix before continuing."
        exit 1
    fi
    echo ""
done

echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo "✓ All migrations completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review the output above for any warnings"
    echo "2. Check the migration_tracking table for status"
    echo "3. Verify tenant data in the database"
else
    echo "✗ Migration failed"
fi
echo "========================================"

exit $FAILED
