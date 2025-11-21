# VITAL Multi-Tenant Data Migration
## Execution Guide

**⚠️ CRITICAL: Read this entire document before executing any scripts!**

---

## Overview

This migration transforms the VITAL platform from single-tenant to multi-tenant architecture with three distinct tenants:

- **Platform** (`00000000-0000-0000-0000-000000000001`) - Admin & shared resources
- **Digital Health Startup** (`11111111-1111-1111-1111-111111111111`) - Digital health focused
- **Pharmaceuticals** (`f7aa6fd4-0af9-4706-8b31-034f1f7accda`) - Pharma & regulatory focused

---

## Pre-Requisites

### 1. Database Access
```bash
# Verify you have access
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"
psql $SUPABASE_DB_URL -c "SELECT version();"
```

### 2. Backup Database
```bash
# Create full backup
pg_dump $SUPABASE_DB_URL > vital_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file
ls -lh vital_backup_*.sql
```

### 3. Stop All Applications
```bash
# Stop all running instances
pm2 stop all

# Or if using Docker
docker-compose down
```

### 4. Verify Current State
```bash
psql $SUPABASE_DB_URL -f 000_pre_migration_validation.sql
```

Review output carefully. Save this for comparison after migration.

---

## Migration Execution Order

### Option A: Execute All at Once (Recommended for first-time migration)

```bash
#!/bin/bash
set -e  # Exit on any error

export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"

echo "Starting VITAL Multi-Tenant Migration..."
echo "========================================"

# Pre-validation
echo "Step 0: Pre-migration validation"
psql $SUPABASE_DB_URL -f 000_pre_migration_validation.sql > logs/000_pre_validation.log 2>&1

# Schema fixes
echo "Step 1: Schema fixes"
psql $SUPABASE_DB_URL -f 001_schema_fixes.sql > logs/001_schema_fixes.log 2>&1

# Tenant setup
echo "Step 2: Tenant setup"
psql $SUPABASE_DB_URL -f 002_tenant_setup.sql > logs/002_tenant_setup.log 2>&1

# Platform data migration
echo "Step 3: Platform data migration"
psql $SUPABASE_DB_URL -f 003_platform_data_migration.sql > logs/003_platform_data.log 2>&1

# Tenant data migration
echo "Step 4: Tenant data migration"
psql $SUPABASE_DB_URL -f 004_tenant_data_migration.sql > logs/004_tenant_data.log 2>&1

# Post-validation
echo "Step 5: Post-migration validation"
psql $SUPABASE_DB_URL -f 005_post_migration_validation.sql > logs/005_post_validation.log 2>&1

echo "========================================"
echo "Migration complete! Review logs in logs/ directory"
echo "Check 005_post_validation.log for any failures"
```

### Option B: Step-by-Step Execution (Recommended for production)

Execute each script one at a time, validating results before proceeding:

```bash
# Create logs directory
mkdir -p logs

# Step 0: Pre-migration validation
psql $SUPABASE_DB_URL -f 000_pre_migration_validation.sql | tee logs/000_pre_validation.log

# ⏸️ PAUSE: Review output, verify expected counts

# Step 1: Schema fixes
psql $SUPABASE_DB_URL -f 001_schema_fixes.sql | tee logs/001_schema_fixes.log

# ⏸️ PAUSE: Verify schema changes applied successfully

# Step 2: Tenant setup
psql $SUPABASE_DB_URL -f 002_tenant_setup.sql | tee logs/002_tenant_setup.log

# ⏸️ PAUSE: Verify all 3 tenants exist

# Step 3: Platform data migration
psql $SUPABASE_DB_URL -f 003_platform_data_migration.sql | tee logs/003_platform_data.log

# ⏸️ PAUSE: Verify platform data migrated

# Step 4: Tenant data migration
psql $SUPABASE_DB_URL -f 004_tenant_data_migration.sql | tee logs/004_tenant_data.log

# ⏸️ PAUSE: Verify tenant-specific data assigned

# Step 5: Post-migration validation
psql $SUPABASE_DB_URL -f 005_post_migration_validation.sql | tee logs/005_post_validation.log

# ⏸️ PAUSE: Review all validation tests
```

---

## Validation Checkpoints

After each step, verify success:

### After Schema Fixes (001)
```sql
-- Verify tools table has category column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tools' AND column_name IN ('category', 'category_id');

-- Should show both columns
```

### After Tenant Setup (002)
```sql
-- Verify all 3 tenants exist
SELECT id, name, slug, is_active
FROM tenants
WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
);

-- Should return 3 rows
```

### After Platform Migration (003)
```sql
-- Verify platform data
SELECT
    (SELECT COUNT(*) FROM tools WHERE tenant_id = '00000000-0000-0000-0000-000000000001') as platform_tools,
    (SELECT COUNT(*) FROM agents WHERE tenant_id = '00000000-0000-0000-0000-000000000001' AND tier IN ('tier_1', 'tier_2')) as platform_agents;

-- platform_tools should be > 0, platform_agents should be > 0
```

### After Tenant Migration (004)
```sql
-- Verify data distribution
SELECT
    t.name,
    COUNT(DISTINCT a.id) as agents,
    COUNT(DISTINCT p.id) as prompts,
    COUNT(DISTINCT kb.id) as knowledge
FROM tenants t
LEFT JOIN agents a ON a.tenant_id = t.id
LEFT JOIN prompts p ON p.tenant_id = t.id
LEFT JOIN knowledge_base kb ON kb.tenant_id = t.id
WHERE t.id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
GROUP BY t.name;

-- All three tenants should have data
```

---

## Troubleshooting

### Issue: Schema migration fails

**Cause:** Conflicting schema changes or missing prerequisites

**Solution:**
```bash
# Check error message in logs
tail -50 logs/001_schema_fixes.log

# Rollback if needed
psql $SUPABASE_DB_URL -c "ROLLBACK;"

# Restore from backup
psql $SUPABASE_DB_URL < vital_backup_YYYYMMDD_HHMMSS.sql
```

### Issue: Data migration assigns data incorrectly

**Cause:** Classification logic doesn't match your data

**Solution:**
1. Review `004_tenant_data_migration.sql`
2. Adjust classification rules for your data
3. Re-run only step 004 (data is idempotent)

### Issue: Validation tests fail

**Cause:** Data integrity issues or missing references

**Solution:**
```bash
# Review specific failed tests
grep "FAIL" logs/005_post_validation.log

# Run individual validation queries
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM agents WHERE tenant_id IS NULL;"
```

### Issue: API returns 500 errors after migration

**Cause:** Missing columns or incorrect tenant filtering

**Solution:**
1. Check API logs for specific error
2. Verify schema changes applied:
```sql
-- Verify tools.category column exists
SELECT * FROM information_schema.columns
WHERE table_name = 'tools' AND column_name = 'category';
```
3. Test API queries manually:
```sql
-- Simulate API query
SELECT id, name, category, tenant_id
FROM tools
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
   OR tenant_id = '00000000-0000-0000-0000-000000000001';
```

---

## Rollback Procedure

If migration fails and you need to rollback:

### Full Rollback
```bash
# Stop applications
pm2 stop all

# Restore from backup
psql $SUPABASE_DB_URL < vital_backup_YYYYMMDD_HHMMSS.sql

# Verify restoration
psql $SUPABASE_DB_URL -f 000_pre_migration_validation.sql

# Restart applications
pm2 start all
```

### Partial Rollback (Single Step)
```bash
# If step 004 failed, rollback just that step
psql $SUPABASE_DB_URL <<EOF
BEGIN;
-- Undo tenant data assignments
UPDATE agents SET tenant_id = NULL WHERE tier = 'tier_3';
UPDATE prompts SET tenant_id = NULL WHERE created_by IS NOT NULL;
UPDATE knowledge_base SET tenant_id = NULL WHERE domain NOT IN ('general_medicine', 'healthcare_standards');
COMMIT;
EOF
```

---

## Post-Migration Steps

### 1. Restart Applications
```bash
pm2 start all

# Or with Docker
docker-compose up -d
```

### 2. Test API Endpoints
```bash
# Test tools endpoint
curl -H "x-tenant-id: 11111111-1111-1111-1111-111111111111" \
  http://localhost:3000/api/tools-crud

# Test prompts endpoint
curl -H "x-tenant-id: f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  http://localhost:3000/api/prompts-crud

# Test knowledge domains
curl http://localhost:3000/api/knowledge-domains
```

### 3. Update Application Configuration

Update environment variables:
```bash
# .env for each app
NEXT_PUBLIC_TENANT_ID=11111111-1111-1111-1111-111111111111  # Digital Health
NEXT_PUBLIC_TENANT_ID=f7aa6fd4-0af9-4706-8b31-034f1f7accda  # Pharma
NEXT_PUBLIC_TENANT_ID=00000000-0000-0000-0000-000000000001  # Platform
```

### 4. Monitor for 24 Hours

```bash
# Check application logs
pm2 logs

# Monitor database connections
psql $SUPABASE_DB_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check for errors in API
grep "ERROR" /var/log/nginx/vital-*.log
```

### 5. Update Documentation

- [ ] Update API documentation with tenant_id requirements
- [ ] Update onboarding guides for new tenants
- [ ] Document any custom migration adjustments made
- [ ] Create runbook for future tenant additions

---

## Success Criteria

Migration is successful when:

- ✅ All validation tests pass (005_post_migration_validation.sql)
- ✅ No NULL tenant_id in critical tables
- ✅ All API endpoints return data correctly
- ✅ Tenant isolation is enforced (can't see other tenant's data)
- ✅ Platform resources are accessible to all tenants
- ✅ No 500 errors in application logs
- ✅ Data counts match pre-migration baseline

---

## Support

If you encounter issues:

1. Check logs in `logs/` directory
2. Review troubleshooting section above
3. Contact: vital-data-strategist@vital.ai
4. Coordinate with: vital-platform-orchestrator@vital.ai

---

## Migration Tracking

Migration progress is tracked in the `migration_tracking` table:

```sql
-- Check migration status
SELECT
    migration_name,
    phase,
    status,
    started_at,
    completed_at,
    metrics
FROM migration_tracking
WHERE migration_name = 'multi_tenant_migration'
ORDER BY started_at;
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-18
**Prepared By:** VITAL Data Strategist Agent
**Reviewed By:** [Pending Review by vital-platform-orchestrator]
