# Comprehensive RLS Enablement Plan
# All Tables Security Rollout

**Created:** 2025-11-26
**Status:** ✅ BLANKET RLS COMPLETE - 100% COVERAGE ACHIEVED
**Scope:** Enable RLS on all 524 tables

---

## Executive Summary

**Migration 012 Completed:** 2025-11-26

- **Total tables in database**: 524
- **Currently protected**: **524 tables (100% coverage)** ✅
- **Unprotected**: **0 tables**
- **Achievement**: Blanket RLS enablement with service role bypass deployed

**Current State:**
- ✅ All 524 tables have RLS enabled
- ✅ Service role bypass policies ensure application stability
- ✅ Zero data exposure at database level
- 📋 Next: Add proper isolation policies (Phases 4A-4E)

---

## RLS Strategy Categories

Tables will be categorized and protected using different strategies:

### Category 1: Organization-Scoped Tables (Estimated ~200 tables)

**Description**: Data that belongs to a specific organization (customer)

**RLS Strategy**: Filter by `owner_organization_id` or `organization_id`

**Examples**:
- JTBD tables (jtbd, jtbd_functions, jtbd_departments, etc.)
- Custom workflows, agents, personas
- Organization-specific configurations

**Policy Template**:
```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Organization isolation policy
CREATE POLICY "[table]_isolation" ON [table_name]
  FOR ALL
  USING (organization_id = get_current_organization_context()::UUID);

-- Service role bypass
CREATE POLICY "[table]_service_role" ON [table_name]
  FOR ALL
  TO service_role
  USING (true);
```

---

### Category 2: Tenant-Scoped Tables (Estimated ~50 tables)

**Description**: Data shared across organizations within an industry vertical

**RLS Strategy**: Filter by `tenant_id`

**Examples**:
- Industry-specific templates
- Tenant-level configurations
- Shared reference data within industry

**Policy Template**:
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY "[table]_tenant_isolation" ON [table_name]
  FOR ALL
  USING (
    tenant_id IN (
      SELECT t.id
      FROM tenants t
      JOIN organizations o ON t.slug = o.tenant_key
      WHERE o.id = get_current_organization_context()::UUID
    )
  );

-- Service role bypass
CREATE POLICY "[table]_service_role" ON [table_name]
  FOR ALL
  TO service_role
  USING (true);
```

---

### Category 3: User-Scoped Tables (Estimated ~30 tables)

**Description**: Data that belongs to individual users

**RLS Strategy**: Filter by `user_id` or `created_by`

**Examples**:
- user_agents (already has RLS via views)
- user_preferences
- user_settings
- user_notifications

**Policy Template**:
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- User isolation policy
CREATE POLICY "[table]_user_isolation" ON [table_name]
  FOR ALL
  USING (user_id = get_current_user_id()::UUID);

-- Service role bypass
CREATE POLICY "[table]_service_role" ON [table_name]
  FOR ALL
  TO service_role
  USING (true);
```

---

### Category 4: Global Reference Data (Estimated ~50 tables)

**Description**: Read-only reference data accessible to all (geographies, industries, etc.)

**RLS Strategy**: Public read, service role write

**Examples**:
- geographies
- industries
- therapeutic_areas
- functions
- departments
- knowledge_domains (already protected)

**Policy Template**:
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "[table]_public_read" ON [table_name]
  FOR SELECT
  USING (true);  -- Everyone can read

-- Service role write access
CREATE POLICY "[table]_service_write" ON [table_name]
  FOR INSERT
  TO service_role
  USING (true);

CREATE POLICY "[table]_service_update" ON [table_name]
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "[table]_service_delete" ON [table_name]
  FOR DELETE
  TO service_role
  USING (true);
```

---

### Category 5: Junction Tables (Estimated ~37 tables)

**Description**: Many-to-many relationship tables

**RLS Strategy**: Inherit from parent table filtering

**Examples**:
- role_skills
- persona_tools
- jtbd_functions
- agent_tenant_access

**Policy Template**:
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Inherit from parent organization filtering
CREATE POLICY "[table]_inherit_org" ON [table_name]
  FOR ALL
  USING (
    -- Check if parent entity is accessible
    EXISTS (
      SELECT 1
      FROM [parent_table] p
      WHERE p.id = [table_name].[parent_id]
        AND p.organization_id = get_current_organization_context()::UUID
    )
  );

-- Service role bypass
CREATE POLICY "[table]_service_role" ON [table_name]
  FOR ALL
  TO service_role
  USING (true);
```

---

## Implementation Phases

### Phase 4A: Organization-Scoped Tables (Priority: HIGH)

**Timeline**: Week 1-2
**Tables**: ~200 tables
**Risk**: MEDIUM (may need schema changes to add organization_id)

**Steps**:
1. Identify tables without `organization_id` column
2. Add `organization_id` column where missing
3. Backfill organization_id from related tables
4. Enable RLS with organization isolation
5. Validate no data leakage

**Prerequisites**:
- [ ] Complete table inventory
- [ ] Identify missing organization_id columns
- [ ] Create backfill migration strategy

---

### Phase 4B: User-Scoped Tables (Priority: MEDIUM)

**Timeline**: Week 2-3
**Tables**: ~30 tables
**Risk**: LOW (user_id usually exists)

**Steps**:
1. Enable RLS on user-scoped tables
2. Add user isolation policies
3. Test user data isolation
4. Deploy

---

### Phase 4C: Global Reference Data (Priority: LOW)

**Timeline**: Week 3
**Tables**: ~50 tables
**Risk**: VERY LOW (public read access)

**Steps**:
1. Enable RLS
2. Add public read policies
3. Restrict writes to service role

---

### Phase 4D: Junction Tables (Priority: MEDIUM)

**Timeline**: Week 4
**Tables**: ~37 tables
**Risk**: MEDIUM (complex inheritance logic)

**Steps**:
1. Map junction tables to parent entities
2. Create inheritance policies
3. Test cascading isolation
4. Deploy

---

### Phase 4E: Tenant-Scoped Tables (Priority: MEDIUM)

**Timeline**: Week 4-5
**Tables**: ~50 tables
**Risk**: MEDIUM (tenant relationship complexity)

**Steps**:
1. Identify tenant-scoped tables
2. Validate tenant_id columns exist
3. Enable RLS with tenant filtering
4. Test cross-tenant isolation

---

## Migration Script Structure

### Master Migration File (Generated)

```sql
/**
 * Phase 4A: Enable RLS on Organization-Scoped Tables
 *
 * SCOPE: ~200 tables
 * STRATEGY: Filter by organization_id
 */

-- ============================================================================
-- VALIDATION: Check for missing organization_id columns
-- ============================================================================

DO $$
DECLARE
  missing_org_id_tables TEXT[];
BEGIN
  -- Find tables that should have organization_id but don't
  SELECT ARRAY_AGG(tablename)
  INTO missing_org_id_tables
  FROM pg_tables t
  WHERE schemaname = 'public'
    AND tablename IN ([list of org-scoped tables])
    AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_name = t.tablename
        AND c.column_name = 'organization_id'
    );

  IF ARRAY_LENGTH(missing_org_id_tables, 1) > 0 THEN
    RAISE NOTICE 'Tables missing organization_id column:';
    FOR i IN 1..ARRAY_LENGTH(missing_org_id_tables, 1) LOOP
      RAISE NOTICE '  - %', missing_org_id_tables[i];
    END LOOP;
    RAISE EXCEPTION 'Cannot enable RLS without organization_id column';
  ELSE
    RAISE NOTICE '✓ All tables have organization_id column';
  END IF;
END $$;

-- ============================================================================
-- ENABLE RLS: Organization-Scoped Tables
-- ============================================================================

-- Table 1: jtbd
ALTER TABLE jtbd ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jtbd_isolation" ON jtbd
  FOR ALL
  USING (organization_id = get_current_organization_context()::UUID);

CREATE POLICY "jtbd_service_role" ON jtbd
  FOR ALL
  TO service_role
  USING (true);

-- Table 2: personas
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personas_isolation" ON personas
  FOR ALL
  USING (organization_id = get_current_organization_context()::UUID);

CREATE POLICY "personas_service_role" ON personas
  FOR ALL
  TO service_role
  USING (true);

-- ... (repeat for all ~200 tables)

-- ============================================================================
-- VALIDATION: Verify RLS enabled
-- ============================================================================

DO $$
DECLARE
  enabled_count INTEGER;
  total_count INTEGER := 200;  -- Expected count
BEGIN
  SELECT COUNT(*)
  INTO enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ([list of tables])
    AND rowsecurity = true;

  RAISE NOTICE 'RLS enabled on % / % tables', enabled_count, total_count;

  IF enabled_count != total_count THEN
    RAISE WARNING 'Not all tables have RLS enabled!';
  END IF;
END $$;
```

---

## Automated Script Generation

To avoid manually writing 367 policy definitions, we'll generate migrations programmatically:

### Step 1: Table Inventory Query

```sql
-- Export table inventory with metadata
COPY (
  SELECT
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = t.tablename AND column_name = 'organization_id') as has_org_id,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = t.tablename AND column_name = 'tenant_id') as has_tenant_id,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = t.tablename AND column_name = 'user_id') as has_user_id,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
  FROM pg_tables t
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
  ORDER BY tablename
) TO STDOUT WITH CSV HEADER;
```

### Step 2: Generate Migration Script

```javascript
// scripts/generate-rls-migrations.js
const tables = require('./table-inventory.json');

for (const table of tables) {
  if (table.has_org_id && !table.rls_enabled) {
    generateOrgScopedPolicy(table.tablename);
  } else if (table.has_user_id && !table.rls_enabled) {
    generateUserScopedPolicy(table.tablename);
  } else if (table.has_tenant_id && !table.rls_enabled) {
    generateTenantScopedPolicy(table.tablename);
  } else {
    console.warn(`Table ${table.tablename} needs manual review`);
  }
}
```

---

## Testing Strategy

### Pre-Deployment Testing

**For each category:**

1. **Test isolation in staging**:
   ```sql
   -- Org A creates data
   SELECT set_organization_context('[org-a-uuid]');
   INSERT INTO [table] (name, organization_id) VALUES ('Test', '[org-a-uuid]');

   -- Org B tries to access
   SELECT set_organization_context('[org-b-uuid]');
   SELECT * FROM [table] WHERE name = 'Test';
   -- Expected: 0 rows (blocked by RLS)
   ```

2. **Test service role bypass**:
   ```sql
   -- Service role should see all data
   SELECT COUNT(*) FROM [table];
   -- Expected: All rows across all organizations
   ```

3. **Test performance**:
   ```bash
   # Measure query latency before/after RLS
   ab -n 1000 -c 10 /api/[endpoint]
   # Expected: <10% latency increase
   ```

### Post-Deployment Monitoring

**Week 1 after each phase:**
- [ ] Monitor error rates (should be unchanged)
- [ ] Monitor query performance (should be <10% slower)
- [ ] Check for permission denied errors
- [ ] Verify no cross-org data access in logs

---

## Risk Mitigation

### High-Risk Scenarios

1. **Missing organization_id columns**
   - **Risk**: Cannot filter without column
   - **Mitigation**: Add column + backfill migration first
   - **Rollback**: Drop column if backfill fails

2. **Application breaks due to RLS**
   - **Risk**: Queries fail with permission denied
   - **Mitigation**: Gradual rollout, test each phase
   - **Rollback**: DISABLE ROW LEVEL SECURITY (temporary)

3. **Performance degradation**
   - **Risk**: RLS subqueries slow down queries
   - **Mitigation**: Add indexes on filter columns
   - **Rollback**: N/A (optimize queries instead)

### Rollback Procedures

**Emergency rollback for entire phase:**
```sql
-- Disable RLS on all tables in phase
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ([phase 4A tables])
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
    RAISE NOTICE 'Disabled RLS on %', tbl;
  END LOOP;
END $$;
```

**Better approach: Fix policies instead of disabling RLS**

---

## Success Criteria

### Phase 4 Complete Success:
- [ ] All 367 unprotected tables have RLS enabled
- [ ] All tables have appropriate isolation policies
- [ ] Zero cross-organization data leakage
- [ ] Application performance <10% impact
- [ ] No permission denied errors for legitimate users
- [ ] Comprehensive testing passed

### Overall Security Posture:
- [ ] **400+ tables protected** (100% coverage)
- [ ] Multi-dimensional isolation (org + tenant + user)
- [ ] Service role properly restricted
- [ ] Audit trail complete
- [ ] HIPAA/GDPR compliant
- [ ] Security testing suite passing

---

## Timeline

**Total Duration**: 4-6 weeks

| Phase | Duration | Tables | Risk | Status |
|-------|----------|--------|------|--------|
| **Blanket RLS** | **Day 1** | **524** | **LOW** | **✅ COMPLETE** |
| 4A: Org-Scoped | Week 1-2 | ~200 | MEDIUM | 📋 PENDING |
| 4B: User-Scoped | Week 2-3 | ~30 | LOW | 📋 PENDING |
| 4C: Global Ref | Week 3 | ~50 | VERY LOW | 📋 PENDING |
| 4D: Junction | Week 4 | ~37 | MEDIUM | 📋 PENDING |
| 4E: Tenant-Scoped | Week 4-5 | ~50 | MEDIUM | 📋 PENDING |
| Testing & Validation | Week 6 | All | N/A | 📋 PENDING |

---

## Next Steps

### ✅ Completed (2025-11-26):
1. ✅ Run table inventory query
2. ✅ Export CSV of all tables with metadata
3. ✅ Deploy Migration 012 - Blanket RLS enablement
4. ✅ Achieve 100% RLS coverage (524/524 tables)

### Immediate (This Week):
5. 🔍 Monitor application for 24-48 hours (ensure no errors)
6. 📊 Categorize tables into 5 strategies (org/user/tenant/global/junction)
7. 🔧 Identify tables missing organization_id column
8. 📝 Create Phase 4A migration (org-scoped policies)

### Next 2-4 Weeks:
9. 🚀 Deploy Phase 4A: Organization-scoped policies (~200 tables)
10. 🚀 Deploy Phases 4B, 4C, 4D, 4E sequentially
11. ✅ Comprehensive security testing

---

**Document Version:** 2.0
**Last Updated:** 2025-11-26 (Migration 012 Complete)
**Owner:** Platform Security Team
**Completion Date:** 2025-11-26 (Blanket RLS), 2026-01-15 (All isolation policies)
