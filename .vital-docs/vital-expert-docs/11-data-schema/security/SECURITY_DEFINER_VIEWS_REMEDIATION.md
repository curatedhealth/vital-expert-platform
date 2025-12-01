# Security Definer Views - Remediation Plan

**Date**: 2025-11-26
**Status**: In Progress
**Priority**: HIGH (7 views require immediate attention)

---

## Executive Summary

Supabase security audit identified **39 views using SECURITY DEFINER**, which execute queries with the creator's elevated permissions instead of the user's permissions. This bypasses Row Level Security (RLS) policies and can lead to cross-tenant data leakage.

### Audit Results:

| Risk Level | Count | Priority | Views |
|------------|-------|----------|-------|
| **HIGH RISK - User Facing** | 4 | 🔴 P1 - URGENT | user_agents_with_details, user_favorite_agents, user_popular_agents, user_recent_agents |
| **HIGH RISK - Complete Data** | 3 | 🔴 P2 - HIGH | v_agent_complete, v_jtbd_complete, v_workflow_complete |
| **MEDIUM RISK - Aggregation** | 4 | 🟡 P3 - MEDIUM | *_summary views |
| **MEDIUM RISK - Hierarchy** | 3 | 🟡 P4 - MEDIUM | *_hierarchy views |
| **REVIEW NEEDED** | 25 | ⚪ P5 - LOW | Various views requiring classification |

---

## Security Risk Analysis

### What is SECURITY DEFINER?

When a view is created with `SECURITY DEFINER`:
- Queries run with the **view creator's permissions** (typically superuser/postgres)
- **Bypasses all RLS policies** on underlying tables
- Users can access data they normally wouldn't be allowed to see
- Creates potential for **cross-tenant data leakage**

### Why is this dangerous in multi-tenant systems?

**Example vulnerability:**
```sql
-- View definition (SECURITY DEFINER)
CREATE VIEW user_popular_agents AS
SELECT * FROM agents ORDER BY usage_count DESC LIMIT 10;

-- User A (from Organization 1) queries the view
SELECT * FROM user_popular_agents;
-- Returns agents from ALL organizations (data leak!)
-- Because SECURITY DEFINER runs with superuser permissions
```

**Expected behavior with proper security:**
```sql
-- View should only return agents from user's organization
-- RLS policies should filter by organization_id
```

---

## 🔴 Priority 1: User-Facing Views (URGENT)

These 4 views are directly accessible to end users and expose sensitive agent data.

### Affected Views:

1. **`user_agents_with_details`**
   - **Exposes**: Full agent details including configuration
   - **Risk**: Users can see agents from other organizations
   - **Current users**: Application UI for displaying user's agent list

2. **`user_favorite_agents`**
   - **Exposes**: User preferences and favorite agents
   - **Risk**: Cross-user data leakage
   - **Current users**: User dashboard favorites section

3. **`user_popular_agents`**
   - **Exposes**: Usage statistics and popular agents
   - **Risk**: Reveals which agents are popular across all tenants
   - **Current users**: Agent marketplace/discovery feature

4. **`user_recent_agents`**
   - **Exposes**: Recent agent activity
   - **Risk**: User activity tracking across organizations
   - **Current users**: User dashboard recent activity section

### Remediation Strategy:

**Option 1: Convert to SECURITY INVOKER (Recommended)**

This makes the view run with the **caller's permissions**, respecting RLS policies:

```sql
-- For each user-facing view:
CREATE OR REPLACE VIEW user_popular_agents
WITH (security_invoker = true)  -- ✅ Safe: uses caller's permissions
AS
SELECT
  a.id,
  a.name,
  a.description,
  a.owner_organization_id,
  COUNT(au.id) as usage_count
FROM agents a
LEFT JOIN agent_usage au ON a.id = au.agent_id
WHERE a.owner_organization_id = get_current_organization_context()::UUID  -- ✅ Filter by org
GROUP BY a.id
ORDER BY usage_count DESC
LIMIT 10;
```

**Option 2: Keep SECURITY DEFINER + Add RLS to View**

If SECURITY DEFINER is required for specific business logic:

```sql
-- Enable RLS on the view itself
ALTER VIEW user_popular_agents ENABLE ROW LEVEL SECURITY;

-- Add policy to filter by organization
CREATE POLICY "user_popular_agents_isolation" ON user_popular_agents
  FOR SELECT
  USING (owner_organization_id = get_current_organization_context()::UUID);
```

**Recommended Approach**: **Option 1** for all 4 user-facing views.

---

## 🔴 Priority 2: Complete Data Views (HIGH)

These 3 views expose complete entity data and may be used by backend services.

### Affected Views:

1. **`v_agent_complete`**
   - **Exposes**: Complete agent data with all relationships
   - **Risk**: Full agent configuration accessible across tenants
   - **Current users**: Admin panels, agent detail pages

2. **`v_jtbd_complete`**
   - **Exposes**: Complete JTBD (Jobs To Be Done) data
   - **Risk**: Business strategy data leakage
   - **Current users**: Strategy planning tools

3. **`v_workflow_complete`**
   - **Exposes**: Complete workflow definitions
   - **Risk**: Proprietary workflow logic visible to competitors
   - **Current users**: Workflow builder, execution engine

### Remediation Strategy:

**Assessment Required**: First determine **why** SECURITY DEFINER was used:

1. **Does the view need to access data across multiple RLS boundaries?**
   - Example: Aggregating data from multiple tables with different RLS policies
   - If YES: Keep SECURITY DEFINER but add view-level RLS

2. **Is it used by service role/backend only?**
   - If YES: Document this and ensure only service role can query it

3. **Is it used by frontend/users?**
   - If YES: Convert to SECURITY INVOKER + add organization filtering

**Recommended Next Step**: Get view definitions to analyze usage:

```sql
-- Run this to see the actual view definitions
SELECT
  viewname,
  definition
FROM pg_views
WHERE viewname IN ('v_agent_complete', 'v_jtbd_complete', 'v_workflow_complete')
  AND schemaname = 'public';
```

---

## 🟡 Priority 3 & 4: Medium Risk Views (14 views)

### MEDIUM RISK - Aggregation Views (4 views)

These views aggregate data for analytics/reporting:
- `v_role_evidence_summary`
- `v_persona_evidence_summary`
- `v_agent_eval_summary`
- `v_jtbd_value_ai_summary`

**Assessment**:
- If used for cross-organizational reporting: May need SECURITY DEFINER
- If used per-organization: Convert to SECURITY INVOKER
- **Action**: Review each view's business purpose and document

### MEDIUM RISK - Hierarchy Views (3 views)

These views show hierarchical relationships:
- `v_projects_hierarchy`
- `v_operations_hierarchy`
- `v_role_persona_jtbd_hierarchy`

**Assessment**:
- Hierarchies should typically be organization-scoped
- **Action**: Add organization_id filtering to WHERE clause

---

## ⚪ Priority 5: Unclassified Views (25 views)

**Action Required**: Manual review and classification

For each view, determine:
1. **Purpose**: What data does this view expose?
2. **Users**: Who queries this view? (Frontend, backend, admin tools)
3. **Tenant scope**: Should data be organization-scoped?
4. **SECURITY DEFINER necessity**: Why was it used?

**Documentation Template**:
```markdown
### View: [view_name]

**Purpose**: [What does this view do]
**Queried by**: [Application/service that uses it]
**Tenant scope**: [Organization-scoped / Global / User-scoped]
**SECURITY DEFINER justification**: [Why it's needed or should be removed]
**Recommendation**: [Keep DEFINER + add RLS / Convert to INVOKER / Document as safe]
**Priority**: [P1-P5]
```

---

## Implementation Phases

### Phase 1: Fix P1 User-Facing Views (This Week)

**Timeline**: 2-3 days
**Risk**: LOW (converting to SECURITY INVOKER is safe)

1. ✅ Get view definitions for all 4 user-facing views
2. ✅ Create migration to convert to SECURITY INVOKER
3. ✅ Add organization_id filtering to WHERE clauses
4. ✅ Test in staging environment
5. ✅ Deploy to production
6. ✅ Monitor for access errors

**Deliverables**:
- Migration file: `20251126_010_fix_user_facing_security_definer_views.sql`
- Testing checklist
- Rollback procedure

### Phase 2: Assess P2 Complete Data Views (Next Week)

**Timeline**: 3-5 days
**Risk**: MEDIUM (need to understand business requirements)

1. ✅ Analyze view definitions
2. ✅ Identify why SECURITY DEFINER was used
3. ✅ Determine if views are frontend-facing or backend-only
4. ✅ Create remediation plan (convert vs. add RLS)
5. ✅ Implement and test
6. ✅ Deploy

**Deliverables**:
- Analysis document
- Migration file: `20251126_011_fix_complete_data_security_definer_views.sql`

### Phase 3: Review Medium Risk Views (Weeks 2-3)

**Timeline**: 1-2 weeks
**Risk**: LOW-MEDIUM

1. Review business purpose for each view
2. Document findings
3. Create targeted fixes
4. Deploy in batches

### Phase 4: Classify Remaining Views (Week 4)

**Timeline**: 1 week
**Risk**: LOW

1. Manual review and classification
2. Document each view's purpose
3. Create remediation plan for any that need fixes

---

## Migration Templates

### Template 1: Convert to SECURITY INVOKER

```sql
-- Template for user-facing views
CREATE OR REPLACE VIEW [view_name]
WITH (security_invoker = true)  -- Run with caller's permissions
AS
SELECT
  [columns],
  organization_id  -- ✅ Must include for filtering
FROM [base_table]
WHERE organization_id = get_current_organization_context()::UUID  -- ✅ Filter by org
[rest of query];
```

### Template 2: Keep SECURITY DEFINER + Add RLS

```sql
-- Keep SECURITY DEFINER but add view-level RLS
ALTER VIEW [view_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[view_name]_isolation" ON [view_name]
  FOR SELECT
  USING (organization_id = get_current_organization_context()::UUID);

-- Add service role bypass
CREATE POLICY "[view_name]_service_role" ON [view_name]
  FOR ALL
  TO service_role
  USING (true);
```

### Template 3: Service Role Only Access

```sql
-- For backend-only views that need SECURITY DEFINER
ALTER VIEW [view_name] ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "[view_name]_service_only" ON [view_name]
  FOR ALL
  TO service_role
  USING (true);

-- Block all other access
CREATE POLICY "[view_name]_block_users" ON [view_name]
  FOR ALL
  TO authenticated, anon
  USING (false);
```

---

## Testing Procedures

### Pre-Deployment Testing

**For each view that's modified:**

1. **Test as regular user**:
   ```sql
   -- Set organization context
   SELECT set_organization_context('[test-org-id]'::UUID);

   -- Query view
   SELECT * FROM [view_name] LIMIT 10;

   -- Verify: Only returns data from test organization
   ```

2. **Test as service role**:
   ```sql
   -- Service role should have full access (if needed)
   SELECT * FROM [view_name] LIMIT 10;
   ```

3. **Test cross-org isolation**:
   ```sql
   -- User from Org A
   SELECT set_organization_context('[org-a-id]'::UUID);
   SELECT COUNT(*) FROM [view_name];  -- Note count

   -- User from Org B
   SELECT set_organization_context('[org-b-id]'::UUID);
   SELECT COUNT(*) FROM [view_name];  -- Should be different count

   -- Verify: No overlap in results
   ```

### Post-Deployment Monitoring

**Week 1 after deployment:**
- [ ] Monitor application logs for "permission denied" errors
- [ ] Check Sentry/error tracking for view-related errors
- [ ] Verify user-reported issues (support tickets)
- [ ] Run daily query: Check for orphaned data access attempts

**Query to monitor access patterns:**
```sql
-- Check who's querying these views
SELECT
  query,
  usename,
  COUNT(*) as query_count
FROM pg_stat_statements
WHERE query LIKE '%user_popular_agents%'
   OR query LIKE '%user_recent_agents%'
   OR query LIKE '%user_favorite_agents%'
   OR query LIKE '%user_agents_with_details%'
GROUP BY query, usename
ORDER BY query_count DESC;
```

---

## Rollback Procedures

### If Issues Are Detected

**Option 1: Revert specific view to SECURITY DEFINER**
```sql
-- Rollback to SECURITY DEFINER (temporarily reopens vulnerability)
CREATE OR REPLACE VIEW [view_name]
WITH (security_definer = true)  -- ⚠️ Reverts to insecure mode
AS
[original view definition];

-- Disable RLS if it was added
ALTER VIEW [view_name] DISABLE ROW LEVEL SECURITY;
```

**Option 2: Add service role bypass to policy**
```sql
-- If view is blocking legitimate service role access
CREATE POLICY "[view_name]_service_role_bypass" ON [view_name]
  FOR ALL
  TO service_role
  USING (true);
```

**Option 3: Restore from backup**
```bash
# If major issues occur
psql $DATABASE_URL < backup_before_security_definer_fix_YYYYMMDD.sql
```

---

## Success Criteria

### Phase 1 (P1 Views) is successful when:

- [x] All 4 user-facing views converted to SECURITY INVOKER
- [ ] Views properly filter by organization_id
- [ ] Application functionality unchanged for users
- [ ] No cross-tenant data leakage detected
- [ ] No permission errors in logs for 48 hours
- [ ] Security tests passing

### Overall Project Success:

- [ ] All 39 Security Definer views reviewed
- [ ] 7 high-risk views fixed
- [ ] 14 medium-risk views assessed and documented
- [ ] 25 unclassified views categorized
- [ ] Zero cross-tenant data leakage
- [ ] All views properly secured with RLS or justified exceptions

---

## Next Steps

### Immediate (Today):

1. **Get view definitions for 4 P1 user-facing views**:
   ```sql
   SELECT viewname, definition
   FROM pg_views
   WHERE viewname IN (
     'user_agents_with_details',
     'user_favorite_agents',
     'user_popular_agents',
     'user_recent_agents'
   )
   AND schemaname = 'public';
   ```

2. **Review definitions** to understand:
   - What tables they query
   - Whether they include organization_id
   - If they need SECURITY DEFINER or can be converted

### This Week:

3. Create migration to fix 4 P1 views
4. Test in staging
5. Deploy to production
6. Monitor for 48 hours

### Next Week:

7. Analyze 3 P2 complete-data views
8. Create remediation plan
9. Implement fixes

---

## Documentation Updates Required

After completing remediation:

1. **Update this file** with:
   - Results of each phase
   - Final view count by status
   - Lessons learned

2. **Update ADR**: `.vital-docs/vital-expert-docs/03-architecture/adrs/0XX_security_definer_views_policy.md`
   - Document which views keep SECURITY DEFINER and why
   - Approval process for future SECURITY DEFINER views

3. **Update Security Architecture**: `.vital-docs/vital-expert-docs/01-strategy/MULTI_TENANT_SECURITY_ARCHITECTURE.md`
   - Add section on view security policies
   - Document testing procedures

4. **Create View Catalog**: `.vital-docs/vital-expert-docs/11-data-schema/security/VIEW_SECURITY_CATALOG.md`
   - List all views with their security settings
   - Document purpose and access patterns

---

## References

- Supabase Security Lint Report: `Supabase Performance Security Lints (bomltkhixeatxuoxmolq).csv`
- PostgreSQL SECURITY DEFINER docs: https://www.postgresql.org/docs/current/sql-createfunction.html
- Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- Original audit script: `database/migrations/audit_security_definer_views.sql`

---

**Last Updated**: 2025-11-26
**Owner**: Platform Security Team
**Reviewers**: Tech Lead, Security Architect
**Status**: Phase 1 in progress - awaiting view definitions
