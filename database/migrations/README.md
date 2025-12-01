# VITAL Database Migrations

This directory contains all database migrations for the VITAL Platform, organized by type and execution order.

---

## Quick Start

```bash
# Run 5 critical security migrations
./scripts/run-security-migrations.sh local

# Run 3-phase schema standardization (Phase 1 only)
./scripts/run-3-phase-migrations.sh 1 local

# Check migration status
psql $DATABASE_URL -c "\d agents"  # Verify schema changes
```

---

## Migration Categories

### 1. Security Migrations (CRITICAL)

**Purpose**: Implement multi-tenant isolation and prevent cross-organization data access

**Files**:
- `20251126_004_add_user_organization_validation.sql` - User-organization membership validation
- `20251126_005_fix_rls_context_setting.sql` - Automatic RLS context setting

**Status**: ✅ COMPLETE (Deployed)

**Script**: `./scripts/run-security-migrations.sh`

**Coverage**:
- User-organization membership validation function
- Unauthorized access attempt logging (audit table)
- RLS context setting/getting functions
- PostgreSQL session variable management

---

### 2. Schema Standardization Migrations (3-PHASE)

**Purpose**: Standardize column naming (`tenant_id` → `organization_id`) and expand RLS coverage

**Files**:
- `20251126_006_phase1_add_standardized_columns.sql` - Add new columns with sync triggers
- `20251126_007_phase2_migrate_data_dual_write.sql` - Migrate data and update RLS policies
- `20251126_008_phase3_drop_old_columns.sql` - Drop old columns and cleanup

**Status**: ⏳ READY (Not yet deployed)

**Script**: `./scripts/run-3-phase-migrations.sh [phase] [environment]`

**Timeline**:
- Phase 1: Add columns (1 week monitoring)
- Phase 2: Migrate data (1-2 weeks monitoring)
- Phase 3: Drop old columns (after validation)

---

## Migration Execution

### Security Migrations (Already Deployed)

```bash
# Local
./scripts/run-security-migrations.sh local

# Staging
./scripts/run-security-migrations.sh staging

# Production
./scripts/run-security-migrations.sh production
```

### 3-Phase Schema Standardization

#### Phase 1: Add Standardized Columns

```bash
# Local
./scripts/run-3-phase-migrations.sh 1 local

# Staging (after local validation)
./scripts/run-3-phase-migrations.sh 1 staging

# Production (after staging validation)
./scripts/run-3-phase-migrations.sh 1 production
```

**What it does**:
- Adds `owner_organization_id` to `agents` table
- Adds `organization_id` to `workflows`, `prompts`, `audit_logs` tables
- Creates sync triggers (keep old and new columns in sync)
- NO data migration yet
- Zero downtime (application continues using old columns)

**Validation**:
```sql
-- Check new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'agents' AND column_name = 'owner_organization_id';

-- Verify triggers active
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%';
```

**Monitor for**: 24-48 hours before Phase 2

---

#### Phase 2: Migrate Data & Update RLS Policies

```bash
# Local
./scripts/run-3-phase-migrations.sh 2 local

# Staging (after local validation + 48h monitoring)
./scripts/run-3-phase-migrations.sh 2 staging

# Production (after staging validation + 1 week monitoring)
./scripts/run-3-phase-migrations.sh 2 production
```

**What it does**:
- Copies data from old columns to new columns
- Validates data consistency (0 mismatches required)
- Updates RLS policies to use new columns
- Adds RLS policies to `prompts`, `audit_logs`, `user_organizations` tables
- Creates indexes on new columns

**Validation**:
```sql
-- Check data consistency
SELECT COUNT(*) FROM agents
WHERE tenant_id IS NOT NULL
  AND owner_organization_id IS NOT NULL
  AND tenant_id != owner_organization_id;
-- Expected: 0

-- Verify RLS policies updated
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('agents', 'workflows', 'prompts', 'audit_logs');
```

**Application Deployment Required**:
- Deploy code to read from new columns
- Triggers ensure dual-write continues

**Monitor for**: 1-2 weeks before Phase 3

**Run Tests**:
```bash
pnpm test apps/vital-system/src/__tests__/security
```

---

#### Phase 3: Drop Old Columns & Cleanup

**⚠️ CRITICAL WARNING**: This phase is IRREVERSIBLE without backup

```bash
# Local ONLY (test first)
./scripts/run-3-phase-migrations.sh 3 local

# Staging (after 1-2 weeks validation in production with Phase 2)
./scripts/run-3-phase-migrations.sh 3 staging

# Production (after full validation)
./scripts/run-3-phase-migrations.sh 3 production
```

**Prerequisites**:
1. ✅ Phase 2 deployed and stable for 1-2 weeks
2. ✅ Security tests passing 100%
3. ✅ No cross-organization data leaks reported
4. ✅ Application stable using new columns
5. ✅ Database backup created
6. ✅ Approval from Tech Lead / DBA

**What it does**:
- Removes sync triggers (no longer needed)
- Drops old columns (`tenant_id`)
- Vacuums tables to reclaim space
- Analyzes tables for query planner

**Validation**:
```sql
-- Verify old columns removed
SELECT column_name FROM information_schema.columns
WHERE table_name = 'agents' AND column_name = 'tenant_id';
-- Expected: No rows returned

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

**Rollback**: Requires restore from backup

---

## Migration File Naming Convention

```
YYYYMMDD_NNN_descriptive_name.sql
```

Example:
- `20251126_004` - Date: 2025-11-26, Sequence: 004
- `add_user_organization_validation` - Descriptive name

---

## Rollback Procedures

### Security Migrations Rollback

Security migrations are **designed to be additive** and safe to rollback:

```sql
-- Rollback user-organization validation
DROP FUNCTION IF EXISTS validate_user_organization_membership(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_organizations(UUID);
DROP TABLE IF EXISTS unauthorized_access_attempts;

-- Rollback RLS context functions
DROP FUNCTION IF EXISTS set_organization_context(UUID);
DROP FUNCTION IF EXISTS get_current_organization_context();
```

### 3-Phase Migration Rollback

#### Phase 1 Rollback (Safe)

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_sync_agents_organization_id ON agents;
DROP FUNCTION IF EXISTS sync_agents_organization_id();

-- Drop new columns
ALTER TABLE agents DROP COLUMN IF EXISTS owner_organization_id;
ALTER TABLE workflows DROP COLUMN IF EXISTS organization_id;
```

#### Phase 2 Rollback (Requires coordination)

```sql
-- Revert RLS policies to use old columns
DROP POLICY agents_isolation ON agents;
CREATE POLICY agents_isolation ON agents
  USING (tenant_id = get_current_organization_context()::UUID);

-- Deploy application code to read from old columns
-- Keep triggers active for data consistency
```

#### Phase 3 Rollback (Restore from backup)

```bash
# Stop application
# Restore database from backup
psql $DATABASE_URL < backup_before_phase3_YYYYMMDD.sql

# Restart application
# Verify data integrity
```

---

## Validation Queries

### Check RLS Policies

```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
ORDER BY tablename;

-- Check if RLS is enabled on a table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Data Consistency (Phase 2)

```sql
-- Agents consistency
SELECT COUNT(*) as inconsistent_count
FROM agents
WHERE tenant_id != owner_organization_id
  AND tenant_id IS NOT NULL
  AND owner_organization_id IS NOT NULL;

-- Workflows consistency
SELECT COUNT(*) as inconsistent_count
FROM workflows
WHERE tenant_id != organization_id
  AND tenant_id IS NOT NULL
  AND organization_id IS NOT NULL;
```

### Check Triggers

```sql
-- List all triggers
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%'
ORDER BY event_object_table;
```

### Check Functions

```sql
-- List all custom functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%organization%'
ORDER BY routine_name;
```

---

## Migration Checklist

### Pre-Migration

- [ ] Database backup created
- [ ] Migration plan reviewed
- [ ] Rollback procedure documented
- [ ] Validation queries prepared
- [ ] Stakeholders notified

### During Migration

- [ ] Migration script runs without errors
- [ ] Validation queries pass
- [ ] Application logs monitored
- [ ] No user-facing errors

### Post-Migration

- [ ] All validation checks pass
- [ ] Security tests pass 100%
- [ ] Application performance stable
- [ ] Documentation updated
- [ ] Team notified of completion

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Cause**: Migration was partially run before

**Fix**:
```sql
-- Check what was created
\d table_name

-- If needed, manually drop and re-run
DROP TABLE IF EXISTS table_name CASCADE;
```

### Issue: Data inconsistencies after Phase 2

**Cause**: Triggers not syncing correctly

**Fix**:
```sql
-- Manually sync data
UPDATE agents SET owner_organization_id = tenant_id
WHERE tenant_id != owner_organization_id;

-- Verify consistency
SELECT COUNT(*) FROM agents
WHERE tenant_id != owner_organization_id;
```

### Issue: RLS policies blocking legitimate access

**Cause**: Organization context not set correctly

**Fix**:
```sql
-- Check current context
SELECT get_current_organization_context();

-- Manually set context for debugging
SELECT set_organization_context('org-id-here'::UUID);

-- Query to verify
SELECT * FROM agents WHERE id = 'agent-id';
```

---

## Documentation

- **Migration Plan**: `MIGRATION_PLAN_3_PHASE.md`
- **Security Architecture**: `.vital-docs/vital-expert-docs/01-strategy/MULTI_TENANT_SECURITY_ARCHITECTURE.md`
- **Test Guide**: `.claude/docs/testing/testing/SECURITY_TESTING_GUIDE.md`

---

**Last Updated**: 2025-11-26
**Owner**: VITAL Platform Team
**Contact**: platform-team@vital.ai
