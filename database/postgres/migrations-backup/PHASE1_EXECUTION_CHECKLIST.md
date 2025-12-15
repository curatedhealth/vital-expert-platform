# Phase 1 Migration - Execution Checklist

**Migration**: Add Standardized Columns
**Environment**: Local Development
**Date**: 2025-11-26
**Status**: Ready for Execution

---

## ✅ Pre-Flight Checklist

### 1. Environment Setup

- [ ] **Docker running**
  ```bash
  # Check Docker status
  docker ps
  ```

- [ ] **Supabase started**
  ```bash
  cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
  npx supabase start

  # Verify Supabase is running
  npx supabase status
  ```

- [ ] **Database connection verified**
  ```bash
  # Test connection
  psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1"
  ```

### 2. Migration Files Ready

- [x] **Phase 1 migration file exists**
  - File: `database/migrations/20251126_006_phase1_add_standardized_columns.sql`
  - Size: 12KB
  - Status: ✅ Created

- [x] **Execution script exists**
  - File: `scripts/run-3-phase-migrations.sh`
  - Status: ✅ Executable

### 3. Backup Preparation

- [ ] **Backup directory exists**
  ```bash
  mkdir -p backups
  ```

- [ ] **pg_dump available**
  ```bash
  which pg_dump
  ```

---

## 🚀 Execution Steps

### Step 1: Create Pre-Migration Backup

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Manual backup (if script doesn't create one)
pg_dump "postgresql://postgres:postgres@localhost:54322/postgres" > \
  backups/backup_before_phase1_$(date +%Y%m%d_%H%M%S).sql

echo "✓ Backup created"
```

### Step 2: Run Phase 1 Migration

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Execute Phase 1
./scripts/run-3-phase-migrations.sh 1 local
```

**Expected Output**:
```
============================================
VITAL 3-Phase Migration Executor
============================================

Phase: 1
Environment: local

Creating database backup before Phase 1...
✓ Backup created: vital_backup_phase1_YYYYMMDD_HHMMSS.sql

============================================
Running Phase 1 Migration
============================================

Executing migration: database/migrations/20251126_006_phase1_add_standardized_columns.sql

✓ Added foreign key: agents.owner_organization_id -> organizations.id
✓ Created sync trigger for agents table
✓ Added foreign key: workflows.organization_id -> organizations.id
✓ Created sync trigger for workflows table
✓ Added foreign key: prompts.organization_id -> organizations.id
✓ Created sync trigger for prompts table
✓ Added foreign key: audit_logs.organization_id -> organizations.id
✓ Created sync trigger for audit_logs table

============================================
PHASE 1: VALIDATION PASSED
============================================
✓ All columns added successfully
✓ All triggers created successfully
✓ All foreign keys added

Next Steps:
1. Monitor application for 24-48 hours
2. Verify no errors in application logs
3. Verify triggers are syncing data correctly
4. Run: SELECT * FROM agents WHERE tenant_id != owner_organization_id
5. If stable, proceed to Phase 2
```

### Step 3: Validate Migration

```bash
# Connect to database
psql "postgresql://postgres:postgres@localhost:54322/postgres"
```

**Validation Queries**:

```sql
-- 1. Verify new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agents'
  AND column_name IN ('tenant_id', 'owner_organization_id');
-- Expected: Both columns exist

-- 2. Verify triggers active
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%'
ORDER BY event_object_table;
-- Expected: 4 triggers (agents, workflows, prompts, audit_logs)

-- 3. Verify foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname LIKE '%organization%'
  AND contype = 'f';
-- Expected: 4 foreign keys

-- 4. Check data consistency (should be empty initially)
SELECT COUNT(*) as inconsistent_rows
FROM agents
WHERE tenant_id IS NOT NULL
  AND owner_organization_id IS NOT NULL
  AND tenant_id != owner_organization_id;
-- Expected: 0

-- Exit psql
\q
```

### Step 4: Test Trigger Functionality

```sql
-- Connect to database
psql "postgresql://postgres:postgres@localhost:54322/postgres"

-- Test 1: Insert with tenant_id, verify owner_organization_id syncs
INSERT INTO agents (id, name, tenant_id, sharing_scope)
VALUES (gen_random_uuid(), 'Test Agent',
        '00000000-0000-0000-0000-000000000001'::UUID, 'organization')
RETURNING id, tenant_id, owner_organization_id;
-- Expected: Both columns have same value

-- Test 2: Update owner_organization_id, verify tenant_id syncs
UPDATE agents
SET owner_organization_id = '00000000-0000-0000-0000-000000000002'::UUID
WHERE name = 'Test Agent'
RETURNING tenant_id, owner_organization_id;
-- Expected: Both columns updated to same value

-- Cleanup test data
DELETE FROM agents WHERE name = 'Test Agent';

-- Exit
\q
```

---

## 📊 Post-Migration Monitoring

### Immediate Checks (First 30 minutes)

- [ ] **No application errors**
  ```bash
  # Check application logs
  tail -f logs/app.log | grep -i error
  ```

- [ ] **Database queries working**
  ```sql
  -- Test query
  SELECT COUNT(*) FROM agents;
  ```

- [ ] **Triggers syncing correctly**
  ```sql
  SELECT COUNT(*) FROM agents
  WHERE tenant_id != owner_organization_id;
  -- Expected: 0
  ```

### 24-Hour Monitoring

- [ ] **Application stable**
- [ ] **No performance degradation**
- [ ] **Triggers syncing all new data**
- [ ] **No data inconsistencies**

### 48-Hour Validation

- [ ] **All validation queries still pass**
- [ ] **No user-reported issues**
- [ ] **Ready to proceed to Phase 2**

---

## 🔄 Rollback Procedure (If Needed)

If any issues are detected:

### Rollback SQL

```sql
-- Connect to database
psql "postgresql://postgres:postgres@localhost:54322/postgres"

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_sync_agents_organization_id ON agents;
DROP TRIGGER IF EXISTS trigger_sync_workflows_organization_id ON workflows;
DROP TRIGGER IF EXISTS trigger_sync_prompts_organization_id ON prompts;
DROP TRIGGER IF EXISTS trigger_sync_audit_logs_organization_id ON audit_logs;

-- Drop functions
DROP FUNCTION IF EXISTS sync_agents_organization_id();
DROP FUNCTION IF EXISTS sync_workflows_organization_id();
DROP FUNCTION IF EXISTS sync_prompts_organization_id();
DROP FUNCTION IF EXISTS sync_audit_logs_organization_id();

-- Drop foreign keys
ALTER TABLE agents DROP CONSTRAINT IF EXISTS fk_agents_owner_organization;
ALTER TABLE workflows DROP CONSTRAINT IF EXISTS fk_workflows_organization;
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS fk_prompts_organization;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS fk_audit_logs_organization;

-- Drop columns
ALTER TABLE agents DROP COLUMN IF EXISTS owner_organization_id;
ALTER TABLE workflows DROP COLUMN IF EXISTS organization_id;
ALTER TABLE prompts DROP COLUMN IF EXISTS organization_id;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS organization_id;

-- Verify rollback
SELECT column_name FROM information_schema.columns
WHERE table_name = 'agents' AND column_name = 'owner_organization_id';
-- Expected: No rows (column removed)

\q
```

### Restore from Backup (Alternative)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Find backup file
ls -lh backups/backup_before_phase1_*.sql

# Restore
psql "postgresql://postgres:postgres@localhost:54322/postgres" < \
  backups/backup_before_phase1_YYYYMMDD_HHMMSS.sql

echo "✓ Database restored from backup"
```

---

## 📝 Success Criteria

Phase 1 is considered successful when:

1. ✅ All new columns added
2. ✅ All triggers active and syncing
3. ✅ All foreign keys in place
4. ✅ No data inconsistencies
5. ✅ Application stable for 24-48 hours
6. ✅ No performance degradation

---

## 🎯 Next Steps After Phase 1

Once Phase 1 is validated (24-48 hours):

1. **Document Results**
   - Update migration status
   - Note any issues encountered
   - Record performance metrics

2. **Prepare for Phase 2**
   - Review Phase 2 migration script
   - Plan application deployment (to use new columns)
   - Schedule Phase 2 execution

3. **Stakeholder Communication**
   - Notify team of Phase 1 completion
   - Share validation results
   - Provide Phase 2 timeline

---

## 📞 Support

If you encounter any issues:

1. **Check Logs**
   ```bash
   # Database logs
   docker logs supabase_db_VITAL_path

   # Application logs
   tail -f logs/app.log
   ```

2. **Run Diagnostics**
   ```sql
   -- Check triggers
   SELECT * FROM information_schema.triggers
   WHERE trigger_name LIKE '%sync%';

   -- Check data consistency
   SELECT table_name,
          (SELECT COUNT(*) FROM table_name WHERE tenant_id != organization_id)
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

3. **Review Documentation**
   - Migration Plan: `database/migrations/MIGRATION_PLAN_3_PHASE.md`
   - README: `database/migrations/README.md`

---

**Status**: ⏳ Awaiting Docker/Supabase startup
**Next Action**: Start Docker Desktop → Start Supabase → Execute Phase 1
