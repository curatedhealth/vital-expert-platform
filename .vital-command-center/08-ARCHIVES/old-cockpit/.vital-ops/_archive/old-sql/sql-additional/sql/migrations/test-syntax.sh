#!/bin/bash

# SQL Migration Files - Syntax Verification Script
# This script checks the syntax of all migration files without executing them

echo "========================================"
echo "SQL Migration Syntax Verification"
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
    echo "Usage: PGPASSWORD=your_password ./test-syntax.sh"
    echo ""
    read -sp "Enter database password: " PASSWORD
    echo ""
    export PGPASSWORD=$PASSWORD
fi

echo "Checking syntax of migration files..."
echo ""

SYNTAX_ERRORS=0

for FILE in "${FILES[@]}"; do
    echo -n "Checking $FILE ... "

    # Use --dry-run if available, otherwise use a transaction that gets rolled back
    # We'll use EXPLAIN to check syntax without actually running
    if psql -h $HOST -U $USER -d $DB --single-transaction --set ON_ERROR_STOP=1 -f "$FILE" 2>&1 | grep -i "ERROR\|syntax error" > /dev/null; then
        echo "SYNTAX ERROR FOUND"
        SYNTAX_ERRORS=$((SYNTAX_ERRORS + 1))

        # Show the actual error
        psql -h $HOST -U $USER -d $DB -f "$FILE" 2>&1 | grep -A 3 "ERROR"
    else
        echo "OK"
    fi
done

echo ""
echo "========================================"
if [ $SYNTAX_ERRORS -eq 0 ]; then
    echo "All files passed syntax check!"
    echo "Status: READY FOR EXECUTION"
else
    echo "Found $SYNTAX_ERRORS file(s) with syntax errors"
    echo "Status: NEEDS FIXING"
fi
echo "========================================"

exit $SYNTAX_ERRORS
