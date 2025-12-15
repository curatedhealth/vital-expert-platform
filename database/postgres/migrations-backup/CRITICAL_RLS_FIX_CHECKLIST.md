# Critical RLS Fix - Execution Checklist

**Priority**: P0 - CRITICAL SECURITY FIX
**Date**: 2025-11-26
**Status**: Ready for Execution

---

## Issue Summary

Supabase security linter detected **408 critical security issues**:
- ❌ **3 tables** have RLS policies but RLS is NOT ENABLED (policies ignored)
- ⚠️ **39 views** use SECURITY DEFINER (bypass RLS)
- ❌ **367 tables** exposed without ANY RLS protection

This checklist addresses the **3 most critical tables** first.

---

## Step 1: Enable RLS on 3 Critical Tables

### Affected Tables:
1. `knowledge_domains` - Has 3 policies but RLS disabled
2. `tenants` - Has 1 policy but RLS disabled
3. `users` - Has 2 policies but RLS disabled

### Impact:
- **Current state**: All policies are ignored, any user can access all data
- **After fix**: Existing policies immediately enforced, proper tenant isolation

### Risk Assessment:
- **Migration risk**: VERY LOW (no schema changes, just enables existing policies)
- **Business risk**: MEDIUM (may expose improperly configured policies)
- **Rollback**: Easy (disable RLS)

### Execution:

```bash
# Start database if not running
npx supabase start

# Execute critical RLS fix
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  < database/migrations/20251126_009_critical_enable_rls_on_policy_tables.sql
```

### Expected Output:

```
============================================
CRITICAL SECURITY FIX: Enable RLS
============================================

This migration enables RLS on 3 critical tables:
  1. knowledge_domains
  2. tenants
  3. users

✓ Safety check passed:
  - knowledge_domains: 3 policies found
  - tenants: 1 policies found
  - users: 2 policies found

✓ Enabled RLS on knowledge_domains table
  Active policies:
    - Allow public read access to knowledge_domains
    - Allow service role to manage knowledge_domains
    - Superadmins have full access to knowledge_domains

✓ Enabled RLS on tenants table
  Active policies:
    - Superadmins have full access to tenants

✓ Enabled RLS on users table
  Active policies:
    - super_admins_read_all_users
    - users_read_org_users

============================================
CRITICAL SECURITY FIX: COMPLETE
============================================
✓ RLS enabled on knowledge_domains
✓ RLS enabled on tenants
✓ RLS enabled on users

All existing policies are now actively enforced.
```

### Validation Queries:

```sql
-- Connect to database
psql "postgresql://postgres:postgres@localhost:54322/postgres"

-- 1. Verify RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('knowledge_domains', 'tenants', 'users')
  AND schemaname = 'public';
-- Expected: All show rls_enabled = true

-- 2. List active policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename IN ('knowledge_domains', 'tenants', 'users')
ORDER BY tablename, policyname;
-- Expected: All policies listed

-- 3. Test query behavior (should respect policies)
-- Test as regular user (not superuser/service_role)
SELECT COUNT(*) FROM knowledge_domains;
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
-- Expected: Results filtered by active policies

\q
```

### Post-Deployment Monitoring:

**Immediate (First 30 minutes):**
- [ ] Check application logs for "permission denied" errors
- [ ] Verify users can still access their own organization's data
- [ ] Test key workflows: user login, agent listing, workflow viewing

**24-Hour Monitoring:**
- [ ] Monitor for access denied errors in application logs
- [ ] Check support tickets for user access issues
- [ ] Validate no cross-tenant data access (run security tests)

**If Issues Detected:**

```sql
-- Emergency rollback (reopens security hole!)
ALTER TABLE knowledge_domains DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Better approach: Fix the policies
-- Example: Add bypass for service role
CREATE POLICY "service_role_bypass" ON knowledge_domains
  FOR ALL
  TO service_role
  USING (true);
```

---

## Step 2: Audit Security Definer Views

### Execution:

```bash
# Run audit script
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  < database/migrations/audit_security_definer_views.sql \
  > security_definer_audit_report.txt

# Review generated CSV
open security_definer_views_audit.csv
```

### Manual Review Tasks:

For each of the 39 views, document:
1. **Purpose**: What data does this view expose?
2. **Access pattern**: Who queries this view?
3. **Risk level**: HIGH/MEDIUM/LOW
4. **Recommendation**: Keep DEFINER / Convert to INVOKER / Add RLS
5. **Action required**: Yes/No

### High Priority Views to Review First:

**User-Facing Views (Highest Risk):**
- [ ] `user_popular_agents` - Exposes agent usage data
- [ ] `user_recent_agents` - Exposes user activity
- [ ] `user_favorite_agents` - Exposes user preferences
- [ ] `user_agents_with_details` - Exposes full agent details
- [ ] `v_agent_marketplace` - Public marketplace view

**Complete/Detail Views (High Risk):**
- [ ] `v_agent_complete` - Complete agent data
- [ ] `v_workflow_complete` - Complete workflow data
- [ ] `v_persona_complete_context` - Complete persona data
- [ ] `v_jtbd_complete` - Complete JTBD data

### Remediation Options:

**Option 1: Convert to SECURITY INVOKER (Safest)**
```sql
CREATE OR REPLACE VIEW view_name
WITH (security_invoker = true)
AS
SELECT ... (existing query);
```

**Option 2: Add RLS Policies to View**
```sql
ALTER VIEW view_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON view_name
  FOR SELECT
  USING (organization_id = get_current_organization_context()::UUID);
```

**Option 3: Document & Accept Risk**
- Document business justification for SECURITY DEFINER
- Add code comments explaining why it's safe
- Review annually

### Deliverable:

Create: `.vital-docs/vital-expert-docs/11-data-schema/security/SECURITY_DEFINER_VIEWS_REVIEW.md`

Document findings and decisions for all 39 views.

---

## Step 3: Prepare Phase 2 Migration

Phase 2 is already prepared in:
- File: `database/migrations/20251126_007_phase2_migrate_data_dual_write.sql`
- Status: Ready to execute (after 48+ hours of Phase 1 stability)

**Prerequisites:**
- [x] Phase 1 migration completed successfully
- [ ] Phase 1 validated (24-48 hours monitoring)
- [ ] No data inconsistencies detected
- [ ] Application stable using old columns

**Phase 2 Will:**
- Copy data from old columns to new columns
- Update RLS policies to use new standardized columns
- Add RLS policies to additional tables (prompts, audit_logs, user_organizations)
- Create indexes on new columns

**Execution** (after Phase 1 validation):
```bash
./scripts/run-3-phase-migrations.sh 2 local
```

---

## Step 4: Plan Comprehensive RLS Rollout

### Create Phase 4 Migration Plan

Document in: `.vital-docs/vital-expert-docs/11-data-schema/06-migrations/PHASE4_COMPREHENSIVE_RLS.md`

**Scope**: Enable RLS on remaining **367 unprotected tables**

**Categorization Strategy:**

1. **Tenant-Scoped Tables** (~250 tables)
   - Need `organization_id` column + RLS policy
   - Example: jtbd, workflows, agents, personas, roles

2. **Global Reference Data** (~50 tables)
   - Service role only access
   - Example: geographies, industries, therapeutic_areas

3. **User-Scoped Tables** (~30 tables)
   - Need `user_id` RLS policy
   - Example: user_preferences, user_settings

4. **Public Read-Only** (~20 tables)
   - SELECT policy for all, INSERT/UPDATE/DELETE for service role
   - Example: knowledge_base, help_content

5. **Junction Tables** (~17 tables already identified)
   - Inherit RLS from parent tables
   - Example: role_skills, persona_tools

**Migration Strategy:**

Phase 4A: Tenant-scoped tables (highest priority)
Phase 4B: User-scoped tables
Phase 4C: Reference data
Phase 4D: Junction tables

**Timeline:**
- Week 1-2: Categorize all 367 tables
- Week 3: Create Phase 4A migration scripts
- Week 4: Execute Phase 4A in local + staging
- Week 5-6: Execute Phase 4A in production + monitor
- Week 7-8: Phase 4B, 4C, 4D

---

## Success Criteria

### Critical RLS Fix (Step 1):
- [x] Migration script created
- [ ] Migration executed successfully
- [ ] All 3 tables have RLS enabled
- [ ] All existing policies active
- [ ] No application errors for 24 hours
- [ ] Security tests passing

### Security Definer Audit (Step 2):
- [x] Audit script created
- [ ] Audit executed, report generated
- [ ] All 39 views categorized by risk
- [ ] High-risk views (5) reviewed first
- [ ] Remediation plan documented
- [ ] Timeline for fixes established

### Phase 2 Preparation (Step 3):
- [x] Phase 2 migration already prepared
- [ ] Phase 1 validated (48+ hours stable)
- [ ] Application deployment plan ready
- [ ] Rollback procedure documented

### Phase 4 Planning (Step 4):
- [ ] All 367 tables categorized
- [ ] Migration scripts drafted
- [ ] Risk assessment completed
- [ ] Timeline approved
- [ ] Stakeholders informed

---

## Timeline

**Week 1 (Now):**
- ✅ Day 1: Create critical RLS fix migration
- ✅ Day 1: Create Security Definer audit script
- 🔄 Day 1-2: Execute critical RLS fix
- 🔄 Day 2-3: Run Security Definer audit
- ⏳ Day 3-7: Monitor critical RLS fix (24-48 hours)

**Week 2:**
- ⏳ Day 1-2: Review Security Definer audit findings
- ⏳ Day 3-5: Execute Phase 2 migration (after Phase 1 stable)
- ⏳ Day 6-7: Monitor Phase 2 migration

**Week 3-4:**
- ⏳ Categorize 367 unprotected tables
- ⏳ Create Phase 4 migration plan
- ⏳ Draft Phase 4 migration scripts

**Week 5-8:**
- ⏳ Execute Phase 4 migrations (staged rollout)
- ⏳ Comprehensive security testing
- ⏳ Production deployment

---

## Rollback Procedures

### Critical RLS Fix Rollback:

```sql
-- Disable RLS (reopens security hole!)
ALTER TABLE knowledge_domains DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify rollback
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('knowledge_domains', 'tenants', 'users');
```

**Only use if:**
- Policies are blocking legitimate access
- Critical application functionality broken
- Cannot fix policies quickly

**Better approach:**
- Fix the policies rather than disabling RLS
- Add service role bypass if needed
- Refine USING/WITH CHECK expressions

---

## Documentation Updates

After completing each step, update:

1. **Migration Status**
   - File: `database/migrations/README.md`
   - Document execution date, results, any issues

2. **Security Architecture**
   - File: `.vital-docs/vital-expert-docs/01-strategy/MULTI_TENANT_SECURITY_ARCHITECTURE.md`
   - Update RLS coverage status

3. **Testing Guide**
   - File: `.claude/docs/testing/SECURITY_TESTING_GUIDE.md`
   - Add new test cases for critical tables

4. **ADR (Architecture Decision Record)**
   - Create: `.vital-docs/vital-expert-docs/03-architecture/adrs/0XX_security_definer_views_policy.md`
   - Document decisions on each Security Definer view

---

## Next Steps

After completing the critical RLS fix:

1. **Immediate** (Today):
   - [ ] Execute critical RLS fix
   - [ ] Run validation queries
   - [ ] Start 24-hour monitoring

2. **Short-Term** (This Week):
   - [ ] Run Security Definer audit
   - [ ] Review high-risk views
   - [ ] Validate Phase 1 migration
   - [ ] Execute Phase 2 migration

3. **Medium-Term** (Next 2-4 Weeks):
   - [ ] Complete Security Definer remediation
   - [ ] Categorize 367 unprotected tables
   - [ ] Create Phase 4 migration plan

4. **Long-Term** (Next 2 months):
   - [ ] Execute Phase 4 migrations
   - [ ] Comprehensive security audit
   - [ ] Production deployment

---

**Status**: ⏳ Ready to execute critical RLS fix
**Next Action**: Run `npx supabase start` → Execute migration script
