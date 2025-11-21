#!/bin/bash
# Test deployment script with dry-run mode

DB_URL="postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"
SQL_FILE="DEPLOY_MA_V5_COMPLETE.sql"

echo "========================================"
echo "Dry-Run Test of Medical Affairs v5.0"
echo "========================================"
echo ""
echo "This will test the SQL but ROLLBACK at the end"
echo ""

# Create a test version with ROLLBACK
cat > TEST_DEPLOY_MA_V5.sql << 'EOF'
-- DRY RUN TEST - Will rollback at the end

EOF

# Append the original SQL but replace COMMIT with ROLLBACK
sed 's/^COMMIT;$/ROLLBACK; -- DRY RUN - No changes made/' "$SQL_FILE" >> TEST_DEPLOY_MA_V5.sql

echo "Running dry-run test..."
echo ""

psql "$DB_URL" -f TEST_DEPLOY_MA_V5.sql 2>&1 | tee test_deployment.log

echo ""
echo "========================================"
echo "Dry-run complete!"
echo "Check test_deployment.log for details"
echo ""
echo "If no errors, run actual deployment:"
echo "  psql \$DB_URL -f DEPLOY_MA_V5_COMPLETE.sql"
echo "========================================"
