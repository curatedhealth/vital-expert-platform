# VITAL Platform: Phased Multi-Tenant Architecture Strategy
**Date:** November 26, 2025
**Status:** APPROVED - Startup Phase
**Next Review:** When 10+ organizations onboarded

---

## Strategic Approach: Start Simple, Scale Smart

### Phase 1: Single Database + RLS (NOW - Startup)
**Timeline:** Months 1-12 (until 10-20 organizations)
**Goal:** Prove product-market fit with bulletproof security
**Architecture:** One PostgreSQL database with Row-Level Security

### Phase 2: Vertical Databases (FUTURE - Scale)
**Timeline:** Months 12+ (when 20+ organizations, multiple verticals)
**Goal:** Separate compliance requirements, better isolation
**Architecture:** Separate databases per industry vertical

---

## Phase 1: Single Database Architecture (CURRENT FOCUS)

### Why Single Database First?

✅ **Advantages for Startups:**
- **Lower infrastructure cost**: ~$200/month vs ~$5K/month for multiple DBs
- **Simpler operations**: One database to backup, monitor, optimize
- **Faster development**: No cross-database queries complexity
- **Easier testing**: Single database for all test scenarios
- **Better for MVP**: Focus on product, not infrastructure

⚠️ **Trade-offs Accepted:**
- All tenants share database resources (CPU, memory, connections)
- Security relies 100% on RLS policies (must be perfect)
- Compliance audits more complex (single DB with mixed PHI types)
- Performance impact if one tenant runs heavy queries

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│          Single PostgreSQL Database                  │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  organizations table (3-level hierarchy)   │    │
│  │                                             │    │
│  │  Platform (vital-system)                    │    │
│  │    ├─ Tenant: Pharma                       │    │
│  │    │   ├─ Org: Novartis ◄─── RLS          │    │
│  │    │   └─ Org: Pfizer   ◄─── RLS          │    │
│  │    └─ Tenant: Digital Health               │    │
│  │        └─ Org: Startup  ◄─── RLS          │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Resource Tables (agents, RAGs, prompts)   │    │
│  │                                             │    │
│  │  • owner_organization_id (FK)               │    │
│  │  • sharing_scope (platform/tenant/org)     │    │
│  │  • RLS policies enforce isolation          │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  RLS Policies (automatic enforcement)      │    │
│  │                                             │    │
│  │  ✓ Organization isolation (Novartis ≠ Pfizer)│  │
│  │  ✓ Tenant sharing (pharma-wide resources)  │    │
│  │  ✓ Platform resources (all tenants)        │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Critical Success Factors

For single DB + RLS to work, we **MUST**:

1. ✅ **Perfect RLS policies** - Zero bypass opportunities
2. ✅ **User-organization validation** - Server-side membership checks
3. ✅ **Comprehensive testing** - Automated isolation tests in CI/CD
4. ✅ **Audit logging** - Track all data access (HIPAA requirement)
5. ✅ **Performance monitoring** - Ensure RLS doesn't slow queries >50ms
6. ✅ **Connection pooling** - Prevent one tenant from consuming all connections

---

## Phase 1 Implementation Plan

### Step 1: Fix Critical Security Vulnerabilities (Week 1-2)

**8 Critical Issues to Fix:**

1. **Remove client-controllable tenant selection** 🔴 CRITICAL
   - File: `apps/vital-system/src/middleware/tenant-middleware.ts`
   - Action: Remove x-tenant-id header and tenant_id cookie acceptance
   - Risk: HIGH (cross-org data access)

2. **Implement user-organization validation** 🔴 CRITICAL
   - Create: `user_organizations` table
   - Add: Server-side membership check in all API routes
   - Risk: HIGH (unauthorized access)

3. **Remove development bypass** 🔴 CRITICAL
   - Files: `agent-auth.ts`, `agents-crud/route.ts`
   - Action: Strict environment checks, never in production
   - Risk: HIGH (total security bypass)

4. **Fix RLS context setting** 🔴 CRITICAL
   - Issue: `app.current_organization_id` not set automatically
   - Action: Middleware sets context on every request
   - Risk: HIGH (RLS not enforced)

5. **Fix column naming** 🔴 CRITICAL
   - Issue: `organization_id` in table vs `tenant_id` in RLS policies
   - Action: Standardize on `owner_organization_id`
   - Risk: HIGH (silent RLS bypass)

6. **Harden cookie security** 🟡 HIGH
   - Change: sameSite 'lax' → 'strict', 30 days → 15 minutes
   - Remove: client-readable vital-tenant-key cookie
   - Risk: MEDIUM (CSRF, session hijacking)

7. **Remove admin bypass** 🟡 HIGH
   - Issue: vital-system tenant uses service role key
   - Action: Use RLS even for admins, audit all actions
   - Risk: MEDIUM (no audit trail)

8. **Add isolation tests** 🟡 HIGH
   - Create: Automated tests for cross-org access prevention
   - CI/CD: Run on every PR
   - Risk: MEDIUM (undetected regressions)

### Step 2: Implement Hierarchical Schema (Week 2-3)

**3-Phase Migration** (from Database Architect specs):

**Phase 1: Add Columns** (Non-breaking, zero downtime)
```sql
ALTER TABLE organizations ADD COLUMN parent_organization_id UUID;
ALTER TABLE organizations ADD COLUMN organization_type TEXT;
ALTER TABLE organizations ADD COLUMN slug TEXT;

ALTER TABLE agents ADD COLUMN owner_organization_id UUID;
ALTER TABLE agents ADD COLUMN sharing_scope TEXT DEFAULT 'organization';
-- Repeat for all resource tables
```

**Phase 2: Backfill Data** (Safe, reversible)
```sql
-- Map existing tenants to hierarchy
UPDATE organizations SET
  organization_type = 'tenant',
  parent_organization_id = (SELECT id FROM organizations WHERE tenant_key = 'vital-system')
WHERE tenant_type IN ('digital_health', 'pharmaceuticals');

-- Set sharing scopes
UPDATE agents SET sharing_scope = 'platform' WHERE is_public = true;
UPDATE agents SET sharing_scope = 'organization' WHERE is_public = false;
```

**Phase 3: Add Constraints** (After validation)
```sql
ALTER TABLE organizations ADD CONSTRAINT fk_parent_org
  FOREIGN KEY (parent_organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

ALTER TABLE agents ADD CONSTRAINT fk_owner_org
  FOREIGN KEY (owner_organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
```

### Step 3: Deploy RLS Policies (Week 3-4)

**Universal RLS Pattern:**
```sql
CREATE POLICY "multi_level_access_agents" ON agents
FOR ALL USING (
  -- Platform resources (visible to all)
  sharing_scope = 'platform'

  OR

  -- Tenant resources (visible to all orgs in same tenant)
  (sharing_scope = 'tenant' AND
   owner_organization_id IN (
     SELECT id FROM organizations
     WHERE parent_organization_id = (
       SELECT parent_organization_id FROM organizations
       WHERE id = current_setting('app.current_organization_id')::UUID
     )
   ))

  OR

  -- Organization resources (visible only to own org)
  (sharing_scope = 'organization' AND
   owner_organization_id = current_setting('app.current_organization_id')::UUID)
);
```

**Repeat for all resource tables**: RAGs, prompts, workflows, conversations, use_cases

### Step 4: Testing & Validation (Week 4-5)

**Automated Test Suite:**
```typescript
describe('Multi-Tenant Isolation', () => {
  test('Novartis cannot see Pfizer agents', async () => {
    // Set context to Novartis
    await setOrgContext('novartis-org-id');
    const agents = await db.agents.findMany();

    // Should NOT contain Pfizer agents
    expect(agents.every(a => a.owner_organization_id !== 'pfizer-org-id')).toBe(true);
  });

  test('Both pharma orgs see tenant-shared agents', async () => {
    // Create pharma-wide agent
    await db.agents.create({
      owner_organization_id: 'pharma-tenant-id',
      sharing_scope: 'tenant'
    });

    // Novartis can see it
    await setOrgContext('novartis-org-id');
    expect(await db.agents.count({ sharing_scope: 'tenant' })).toBeGreaterThan(0);

    // Pfizer can see it
    await setOrgContext('pfizer-org-id');
    expect(await db.agents.count({ sharing_scope: 'tenant' })).toBeGreaterThan(0);
  });

  test('Digital health org cannot see pharma agents', async () => {
    await setOrgContext('startup-org-id');
    const agents = await db.agents.findMany();

    // Should NOT contain pharma agents
    expect(agents.every(a => a.owner_organization_id !== 'novartis-org-id')).toBe(true);
  });
});
```

---

## Phase 2: Vertical Databases (FUTURE)

### When to Migrate?

**Trigger Conditions** (any one):
- ✅ 20+ organizations across multiple verticals
- ✅ Different compliance requirements causing audit complexity
- ✅ Performance degradation (queries >200ms p95)
- ✅ One tenant consuming >50% database resources
- ✅ Data residency requirements (EU pharma needs EU DB)

### Migration Strategy

**Zero-Downtime Migration:**

```
┌──────────────────────┐
│   Current Single DB  │
│                      │
│   Platform           │
│   ├─ Pharma Tenants  │  ─┐
│   └─ Digital Health  │   │  CDC Replication
└──────────────────────┘   │  (Change Data Capture)
                           │
                           ├──► ┌──────────────┐
                           │    │  Pharma DB   │
                           │    └──────────────┘
                           │
                           └──► ┌──────────────┐
                                │ Digital      │
                                │ Health DB    │
                                └──────────────┘
```

**Steps:**
1. Create new vertical databases
2. Set up CDC from single DB → vertical DBs (PostgreSQL logical replication)
3. Dual-write mode (write to both old and new)
4. Validate data consistency (row counts, checksums)
5. Cutover: Point app to new DBs
6. Keep old DB read-only for 7 days (rollback safety)

**Why This Works:**
- Our schema already has `organization_type` and `parent_organization_id`
- RLS policies work same way in separate DBs
- Sharing model transitions smoothly (tenant resources move to vertical DB)
- Zero code changes required (same queries work)

---

## Cost Analysis

### Phase 1: Single Database (Now)

**Infrastructure:**
- PostgreSQL (Supabase Pro): $25/month
- Connection pooler (PgBouncer): Included
- Backups (daily): Included
- **Total: ~$25-$100/month** (depending on storage/compute)

**Engineering Time:**
- Security fixes: 1 engineer × 2 weeks = $8K
- Schema migration: 1 engineer × 2 weeks = $8K
- RLS policies: 1 engineer × 1 week = $4K
- Testing: 1 engineer × 1 week = $4K
- **Total: ~$24K one-time**

### Phase 2: Vertical Databases (Future)

**Infrastructure (example with 2 verticals):**
- Platform DB: $100/month
- Pharma DB: $200/month (higher compliance needs)
- Digital Health DB: $200/month
- **Total: ~$500-$1K/month**

**Engineering Time:**
- CDC setup: 1 engineer × 1 week = $4K
- Migration scripts: 1 engineer × 2 weeks = $8K
- Testing: 1 engineer × 1 week = $4K
- Monitoring: 1 engineer × 1 week = $4K
- **Total: ~$20K one-time**

**Cost Savings by Delaying:**
- Infrastructure: ~$400/month × 12 months = ~$4,800/year
- Engineering: ~$20K delayed until needed
- **Total savings: ~$25K in first year**

---

## Decision Summary

| Aspect | Phase 1 (Now) | Phase 2 (Future) |
|--------|---------------|------------------|
| **Architecture** | Single DB + RLS | Separate DBs per vertical |
| **Cost** | ~$100/month | ~$1K/month |
| **Complexity** | Low | Medium |
| **Compliance** | Shared audit | Separate audit per vertical |
| **Performance** | Shared resources | Isolated resources |
| **When** | 1-20 organizations | 20+ organizations |
| **Security** | RLS (must be perfect) | RLS + database separation |

**Approved Strategy:** ✅ Start Phase 1, migrate to Phase 2 when needed

---

## Next Steps (This Week)

1. ✅ **Get your approval** on this phased approach
2. ⏳ **Create migration scripts** for hierarchical schema (Phase 1-3)
3. ⏳ **Fix critical vulnerabilities** (remove client control, add user validation)
4. ⏳ **Implement RLS policies** for 3-level hierarchy
5. ⏳ **Create test suite** for isolation verification
6. ⏳ **Deploy to staging** for validation
7. ⏳ **Production deployment** after full testing

**Estimated Timeline:** 4-5 weeks to production-ready

**Your Approval Needed:**
- ✅ Single DB approach for Phase 1
- ⏳ Proceed with implementation?
- ⏳ Any changes to the plan?

---

## References

- [Hierarchical Schema Design](../.vital-docs/vital-expert-docs/11-data-schema/HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md)
- [Enterprise Data Strategy](../.vital-docs/data-strategy/ENTERPRISE_DATA_ARCHITECTURE_STRATEGY.md)
- [Security & Compliance Review](../.vital-docs/security/MULTI_TENANT_SECURITY_COMPLIANCE_REVIEW.md)
- [Threat Model](../.vital-docs/security/3_LEVEL_MULTI_TENANT_THREAT_MODEL.md)
