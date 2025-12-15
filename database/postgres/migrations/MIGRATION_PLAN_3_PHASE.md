# 3-Phase Database Migration Plan

**Version**: 1.0
**Created**: 2025-11-26
**Status**: Planning
**Owner**: VITAL Platform Team

---

## Executive Summary

This document outlines a **zero-downtime, reversible 3-phase migration strategy** to standardize the VITAL database schema and expand RLS policy coverage. The migration addresses column naming inconsistencies discovered during the security audit and ensures complete multi-tenant isolation across all tables.

### Migration Objectives

1. **Standardize column naming** - Align `tenant_id` and `organization_id` usage
2. **Expand RLS coverage** - Apply RLS policies to ALL multi-tenant tables
3. **Zero downtime** - No service interruption during migration
4. **Reversible** - Each phase can be rolled back safely
5. **Data integrity** - No data loss, full validation at each phase

---

## Current State Analysis

### Schema Inconsistencies

| Table | Current Column | Correct Column | Issue |
|-------|---------------|----------------|-------|
| `agents` | `tenant_id` | `owner_organization_id` | Mixed usage |
| `workflows` | `tenant_id` | `organization_id` | Inconsistent naming |
| `prompts` | `tenant_id` | `organization_id` | Inconsistent naming |
| `user_organizations` | N/A | N/A | Missing RLS policy |
| `audit_logs` | `tenant_id` | `organization_id` | Inconsistent naming |

### RLS Policy Coverage Gaps

| Table | Has RLS Policy | Multi-Tenant | Priority |
|-------|----------------|--------------|----------|
| `agents` | ✅ Yes | Yes | N/A (covered) |
| `workflows` | ✅ Yes | Yes | N/A (covered) |
| `prompts` | ❌ No | Yes | HIGH |
| `user_organizations` | ❌ No | Yes | CRITICAL |
| `audit_logs` | ❌ No | Yes | MEDIUM |
| `sessions` | ❌ No | Yes | HIGH |
| `api_keys` | ❌ No | Yes | CRITICAL |

**Risk**: Tables without RLS policies could leak data across organizations if application-level checks fail.

---

## 3-Phase Migration Strategy

### Phase 1: Audit & Add Columns (Week 1)

**Goal**: Identify all inconsistencies and add standardized columns alongside existing ones

**Actions**:
1. Audit all tables for `tenant_id`, `organization_id`, `owner_organization_id` columns
2. Add new standardized columns (e.g., `organization_id` where missing)
3. Create triggers to keep old and new columns in sync
4. NO data migration yet (dual-write to both columns)

**Migration File**: `20251126_006_phase1_add_standardized_columns.sql`

**Rollback**: Drop newly added columns, remove triggers

**Validation**:
- All new columns exist
- Triggers are active
- No data loss
- Application continues using old columns

**Zero-Downtime**: ✅ Application continues using old columns

---

### Phase 2: Data Migration & Sync (Week 2)

**Goal**: Migrate data to new columns, verify consistency, keep both columns in sync

**Actions**:
1. Copy data from old columns to new columns
2. Validate data integrity (checksums, row counts)
3. Update RLS policies to use new column names
4. Deploy application code to read from new columns (write to both)
5. Monitor for 48 hours

**Migration File**: `20251126_007_phase2_migrate_data_dual_write.sql`

**Rollback**:
- Update RLS policies back to old columns
- Deploy application code to read from old columns
- Keep triggers active for safety

**Validation**:
- Data consistency: `SELECT COUNT(*) FROM table WHERE old_col != new_col` = 0
- RLS policies enforcing on new columns
- Application queries using new columns
- Performance metrics stable

**Zero-Downtime**: ✅ Dual-write ensures consistency during migration

---

### Phase 3: Deprecate & Clean (Week 3-4)

**Goal**: Remove old columns after confirming new columns work correctly

**Actions**:
1. Monitor application for 1-2 weeks using new columns
2. Remove triggers (no longer needed)
3. Drop old columns
4. Update indexes to use new columns only
5. Vacuum tables to reclaim space

**Migration File**: `20251126_008_phase3_drop_old_columns.sql`

**Rollback**:
- **IMPORTANT**: This phase is NOT reversible without backup
- Backup database before executing
- Create migration to re-add old columns if needed

**Validation**:
- Old columns removed
- No application errors
- Performance stable or improved
- Disk space reclaimed

**Zero-Downtime**: ✅ Application already using new columns

---

## Detailed Migration Steps

### Phase 1: Add Standardized Columns

#### Step 1.1: Agents Table

```sql
-- Add standardized column
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS owner_organization_id UUID;

-- Add foreign key constraint
ALTER TABLE agents
ADD CONSTRAINT fk_agents_organization
FOREIGN KEY (owner_organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

-- Create sync trigger
CREATE OR REPLACE FUNCTION sync_agents_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Sync from tenant_id to owner_organization_id
    IF NEW.tenant_id IS NOT NULL THEN
      NEW.owner_organization_id := NEW.tenant_id;
    END IF;
    -- Sync from owner_organization_id to tenant_id (reverse)
    IF NEW.owner_organization_id IS NOT NULL THEN
      NEW.tenant_id := NEW.owner_organization_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_agents_organization_id
BEFORE INSERT OR UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION sync_agents_organization_id();
```

#### Step 1.2: Workflows Table

```sql
-- Add standardized column
ALTER TABLE workflows
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add foreign key constraint
ALTER TABLE workflows
ADD CONSTRAINT fk_workflows_organization
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE CASCADE;

-- Create sync trigger
CREATE OR REPLACE FUNCTION sync_workflows_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.tenant_id IS NOT NULL THEN
      NEW.organization_id := NEW.tenant_id;
    END IF;
    IF NEW.organization_id IS NOT NULL THEN
      NEW.tenant_id := NEW.organization_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_workflows_organization_id
BEFORE INSERT OR UPDATE ON workflows
FOR EACH ROW
EXECUTE FUNCTION sync_workflows_organization_id();
```

#### Step 1.3: Add RLS Policies (New Tables)

```sql
-- Enable RLS on user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own organization memberships
CREATE POLICY user_organizations_isolation ON user_organizations
  USING (organization_id = get_current_organization_context()::UUID);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see audit logs for their organization
CREATE POLICY audit_logs_isolation ON audit_logs
  USING (organization_id = get_current_organization_context()::UUID);
```

---

### Phase 2: Data Migration & Sync

#### Step 2.1: Migrate Existing Data

```sql
-- Migrate agents data
UPDATE agents
SET owner_organization_id = tenant_id
WHERE owner_organization_id IS NULL AND tenant_id IS NOT NULL;

-- Validate migration
DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM agents
  WHERE tenant_id IS NOT NULL
    AND owner_organization_id IS NOT NULL
    AND tenant_id != owner_organization_id;

  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'Data inconsistency detected: % rows', inconsistent_count;
  END IF;

  RAISE NOTICE 'Agents migration validated: 0 inconsistencies';
END $$;

-- Migrate workflows data
UPDATE workflows
SET organization_id = tenant_id
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;

-- Validate migration
DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM workflows
  WHERE tenant_id IS NOT NULL
    AND organization_id IS NOT NULL
    AND tenant_id != organization_id;

  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'Data inconsistency detected: % rows', inconsistent_count;
  END IF;

  RAISE NOTICE 'Workflows migration validated: 0 inconsistencies';
END $$;
```

#### Step 2.2: Update RLS Policies

```sql
-- Update agents RLS policy to use new column
DROP POLICY IF EXISTS agents_isolation ON agents;

CREATE POLICY agents_isolation ON agents
  USING (
    owner_organization_id = get_current_organization_context()::UUID
    OR sharing_scope = 'platform'
    OR (
      sharing_scope = 'tenant'
      AND EXISTS (
        SELECT 1 FROM organizations o1, organizations o2
        WHERE o1.id = agents.owner_organization_id
          AND o2.id = get_current_organization_context()::UUID
          AND o1.parent_organization_id = o2.parent_organization_id
      )
    )
  );

-- Update workflows RLS policy to use new column
DROP POLICY IF EXISTS workflows_isolation ON workflows;

CREATE POLICY workflows_isolation ON workflows
  USING (organization_id = get_current_organization_context()::UUID);
```

---

### Phase 3: Deprecate & Clean

#### Step 3.1: Remove Sync Triggers

```sql
-- Drop triggers (no longer needed)
DROP TRIGGER IF EXISTS trigger_sync_agents_organization_id ON agents;
DROP TRIGGER IF EXISTS trigger_sync_workflows_organization_id ON workflows;

-- Drop trigger functions
DROP FUNCTION IF EXISTS sync_agents_organization_id();
DROP FUNCTION IF EXISTS sync_workflows_organization_id();
```

#### Step 3.2: Drop Old Columns

```sql
-- Backup verification
DO $$
BEGIN
  RAISE NOTICE 'CRITICAL: Ensure database backup exists before proceeding';
  RAISE NOTICE 'Run: pg_dump > backup_before_phase3_$(date +%%Y%%m%%d).sql';
END $$;

-- Drop old columns
ALTER TABLE agents DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE workflows DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE prompts DROP COLUMN IF EXISTS tenant_id;

-- Vacuum tables to reclaim space
VACUUM FULL agents;
VACUUM FULL workflows;
VACUUM FULL prompts;
```

#### Step 3.3: Update Indexes

```sql
-- Add indexes on new columns
CREATE INDEX IF NOT EXISTS idx_agents_owner_organization_id
ON agents(owner_organization_id);

CREATE INDEX IF NOT EXISTS idx_workflows_organization_id
ON workflows(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id
ON audit_logs(organization_id);

-- Analyze tables for query planner
ANALYZE agents;
ANALYZE workflows;
ANALYZE audit_logs;
```

---

## Validation Checklist

### Phase 1 Validation

- [ ] All new columns added successfully
- [ ] Foreign key constraints created
- [ ] Sync triggers active
- [ ] Application continues using old columns
- [ ] No application errors
- [ ] No data loss

### Phase 2 Validation

- [ ] Data migrated successfully (checksums match)
- [ ] RLS policies updated to new columns
- [ ] Application code deployed (reads from new columns)
- [ ] Dual-write working (both columns in sync)
- [ ] No cross-organization data leaks
- [ ] Performance metrics stable
- [ ] 48-hour monitoring period passed

### Phase 3 Validation

- [ ] Database backup created
- [ ] Triggers removed
- [ ] Old columns dropped
- [ ] Indexes created on new columns
- [ ] Tables vacuumed
- [ ] Application stable for 1-2 weeks
- [ ] No rollback requests
- [ ] Disk space reclaimed

---

## Rollback Procedures

### Phase 1 Rollback

```sql
-- Remove triggers
DROP TRIGGER IF EXISTS trigger_sync_agents_organization_id ON agents;
DROP FUNCTION IF EXISTS sync_agents_organization_id();

-- Drop new columns
ALTER TABLE agents DROP COLUMN IF EXISTS owner_organization_id;
ALTER TABLE workflows DROP COLUMN IF EXISTS organization_id;
```

### Phase 2 Rollback

```sql
-- Revert RLS policies to old columns
DROP POLICY agents_isolation ON agents;
CREATE POLICY agents_isolation ON agents
  USING (tenant_id = get_current_organization_context()::UUID);

-- Deploy application code to read from old columns
-- Keep triggers active for safety
```

### Phase 3 Rollback

```sql
-- CRITICAL: This requires database restore from backup
-- Phase 3 is NOT reversible without backup

-- To restore:
psql $DATABASE_URL < backup_before_phase3_YYYYMMDD.sql
```

---

## Timeline

| Phase | Duration | Start Date | End Date |
|-------|----------|------------|----------|
| **Phase 1** | 1 week | 2025-12-02 | 2025-12-06 |
| **Phase 2** | 1 week + 48h monitoring | 2025-12-09 | 2025-12-18 |
| **Phase 3** | 2 weeks monitoring + cleanup | 2025-12-19 | 2026-01-03 |

**Total Duration**: 4-5 weeks

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Data loss during migration** | LOW | CRITICAL | Backup before each phase, validation queries |
| **Application downtime** | LOW | HIGH | Zero-downtime strategy, dual-write |
| **Performance degradation** | MEDIUM | MEDIUM | Monitor metrics, indexes on new columns |
| **RLS policy errors** | MEDIUM | CRITICAL | Comprehensive testing, staged rollout |
| **Trigger sync failures** | LOW | HIGH | Validation queries, alerts on inconsistencies |

---

## Success Criteria

1. ✅ All tables use standardized column names
2. ✅ All multi-tenant tables have RLS policies
3. ✅ Zero data loss (validated with checksums)
4. ✅ Zero downtime during migration
5. ✅ Application performance stable or improved
6. ✅ Security tests pass 100%
7. ✅ No cross-organization data leaks

---

**Document Classification**: Internal
**Next Review Date**: After Phase 1 completion
**Contact**: platform-team@vital.ai
