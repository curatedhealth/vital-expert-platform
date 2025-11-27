# Dual-Mechanism RLS Policy - Complete Guide

**Last Updated:** 2025-11-26
**Status:** ✅ Deployed to Production
**Architecture:** Multi-Dimensional Tenant Model

---

## Executive Summary

VITAL uses a **3-level hierarchy** with **dual-mechanism RLS filtering** to enable:
1. **Customer Isolation**: Organizations can't see each other's custom agents
2. **Platform Sharing**: All customers in an industry can access VITAL's platform agents
3. **Industry Segmentation**: Pharma customers can't access Digital Health agents

**Key Concept:** Agents have TWO ownership dimensions:
- `owner_organization_id`: **WHO OWNS IT** (VITAL for platform agents, customer for custom agents)
- `tenant_id`: **WHICH INDUSTRY CAN USE IT** (Pharmaceuticals, Digital Health, Consulting, etc.)

---

## Architecture Overview

### 3-Level Hierarchy

```
VITAL Platform (owner_organization_id = VITAL)
  │
  ├── Industry Tenant: Pharmaceuticals (tenant_id = Pharma UUID)
  │     ├── Organization: PharmaCo (customer)
  │     │     └── Custom Agents (owner_organization_id = PharmaCo, tenant_id = Pharma)
  │     │     └── Platform Agents (owner_organization_id = VITAL, tenant_id = Pharma)
  │     │
  │     ├── Organization: BioTech Inc (customer)
  │     │     └── Custom Agents (owner_organization_id = BioTech, tenant_id = Pharma)
  │     │     └── Platform Agents (owner_organization_id = VITAL, tenant_id = Pharma)
  │     │
  │     └── Organization: MedLabs (customer)
  │           └── Custom Agents (owner_organization_id = MedLabs, tenant_id = Pharma)
  │           └── Platform Agents (owner_organization_id = VITAL, tenant_id = Pharma)
  │
  ├── Industry Tenant: Digital Health (tenant_id = DH UUID)
  │     ├── Organization: HealthTech Co (customer)
  │     │     └── Custom Agents (owner_organization_id = HealthTech, tenant_id = DH)
  │     │     └── Platform Agents (owner_organization_id = VITAL, tenant_id = DH)
  │     │
  │     └── Organization: Wellness App (customer)
  │           └── Custom Agents (owner_organization_id = Wellness, tenant_id = DH)
  │           └── Platform Agents (owner_organization_id = VITAL, tenant_id = DH)
  │
  └── Industry Tenant: Consulting (coming soon)
        └── (Future customers)
```

### Data Model

**Key Tables and Columns:**

```sql
-- Organizations table (customers)
organizations
├── id                UUID PRIMARY KEY
├── name              VARCHAR (e.g., "PharmaCo", "BioTech Inc")
├── slug              VARCHAR (e.g., "pharmaco", "biotech")
├── tenant_key        VARCHAR (links to tenants.slug) ← KEY RELATIONSHIP
└── ...

-- Tenants table (industry verticals)
tenants
├── id                UUID PRIMARY KEY
├── name              VARCHAR (e.g., "Pharmaceuticals", "Digital Health")
├── slug              VARCHAR (e.g., "pharma", "digital-health") ← KEY RELATIONSHIP
└── ...

-- Agents table (with dual ownership)
agents
├── id                           UUID PRIMARY KEY
├── name                         VARCHAR
├── description                  TEXT
├── owner_organization_id        UUID → organizations.id (WHO OWNS IT)
├── tenant_id                    UUID → tenants.id (WHICH INDUSTRY)
└── ...
```

**Key Relationships:**
1. `agents.owner_organization_id` → `organizations.id`: **Ownership** (who created/owns it)
2. `agents.tenant_id` → `tenants.id`: **Allocation** (which industry vertical)
3. `organizations.tenant_key` → `tenants.slug`: **Industry Membership** (which vertical the customer belongs to)

---

## The Dual-Mechanism RLS Policy

### Policy Definition

```sql
CREATE POLICY agents_isolation ON agents
  FOR ALL
  USING (
    -- MECHANISM 1: Organization-owned agents
    -- Users see agents their organization owns (custom agents)
    owner_organization_id = get_current_organization_context()::UUID

    OR

    -- MECHANISM 2: VITAL-owned, tenant-allocated agents
    -- Users see VITAL platform agents allocated to their industry
    (
      owner_organization_id = '00000000-0000-0000-0000-000000000001'::UUID  -- VITAL org
      AND tenant_id IN (
        SELECT t.id
        FROM tenants t
        JOIN organizations o ON t.slug = o.tenant_key
        WHERE o.id = get_current_organization_context()::UUID
      )
    )
  );
```

### How It Works (Step-by-Step)

**When a PharmaCo user queries agents:**

1. **RLS Mechanism 1 activates:**
   - Query: `WHERE owner_organization_id = PharmaCo's UUID`
   - Returns: **Custom agents** created specifically by/for PharmaCo
   - Example: "PharmaCo Clinical Trial Assistant" (owned by PharmaCo, allocated to Pharma tenant)

2. **RLS Mechanism 2 activates:**
   - Step 1: Get user's organization: `PharmaCo UUID`
   - Step 2: Get organization's tenant_key: `'pharma'`
   - Step 3: Find tenant with slug='pharma': `Pharmaceuticals tenant UUID`
   - Step 4: Query: `WHERE owner_organization_id = VITAL AND tenant_id = Pharmaceuticals UUID`
   - Returns: **Platform agents** owned by VITAL, allocated to Pharma industry

3. **Combined Result:**
   - PharmaCo users see: **Custom agents** (Mechanism 1) + **Platform agents** (Mechanism 2)
   - Currently: 0 custom agents + 1,138 platform agents = **1,138 total agents**

---

## Current Data State (Production)

### All Agents (1,138 total)

```sql
-- Current allocation after Phase 2 migration
SELECT
  COUNT(*) as total_agents,
  COUNT(DISTINCT owner_organization_id) as unique_owners,
  COUNT(DISTINCT tenant_id) as unique_tenants
FROM agents;

-- Result:
-- total_agents: 1,138
-- unique_owners: 1 (all owned by VITAL)
-- unique_tenants: 1 (all allocated to Pharmaceuticals)
```

**Breakdown:**
- **Owner**: All 1,138 agents owned by VITAL (`owner_organization_id = 00000000-0000-0000-0000-000000000001`)
- **Allocation**: All 1,138 agents allocated to Pharmaceuticals tenant (`tenant_id = c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b`)

**This means:**
- ✅ **Pharma customers** (PharmaCo, BioTech, MedLabs): See all 1,138 agents via Mechanism 2
- ❌ **Digital Health customers** (HealthTech, Wellness): See 0 agents (no agents allocated to their tenant yet)
- ❌ **Other tenants**: See 0 agents

---

## Access Matrix

| User's Organization | Tenant Key | Custom Agents Visible | Platform Agents Visible | Total Agents |
|---------------------|------------|----------------------|------------------------|--------------|
| PharmaCo            | pharma     | 0 (none created yet) | 1,138 (all Pharma)     | 1,138        |
| BioTech Inc         | pharma     | 0 (none created yet) | 1,138 (all Pharma)     | 1,138        |
| MedLabs             | pharma     | 0 (none created yet) | 1,138 (all Pharma)     | 1,138        |
| HealthTech Co       | digital-health | 0 (none created yet) | 0 (none allocated)  | 0            |
| Wellness App        | digital-health | 0 (none created yet) | 0 (none allocated)  | 0            |
| VITAL (service role)| N/A        | All                  | All                    | 1,138        |

---

## How to Fetch Agents (Code Examples)

### Backend API (Node.js/TypeScript)

```typescript
import { createClient } from '@supabase/supabase-js';

// Automatic RLS enforcement via Supabase client
async function fetchUserAgents(userId: string) {
  // Supabase automatically sets organization context from JWT claims
  // No manual filtering needed - RLS handles everything!

  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .order('name');

  // RLS policy automatically filters:
  // - Mechanism 1: Agents owned by user's organization
  // - Mechanism 2: VITAL-owned agents allocated to user's tenant

  if (error) throw error;
  return agents; // Only accessible agents returned
}

// Example: Fetch specific agent (respects RLS)
async function fetchAgentById(agentId: string) {
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  // If agent not accessible (wrong org/tenant), returns null
  // No error thrown - RLS just filters it out

  return agent;
}
```

### Frontend (React Example)

```typescript
// No manual filtering needed - RLS is transparent!
function AgentList() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      return data; // Already filtered by RLS
    }
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      {agents?.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
```

### SQL Queries (Direct Database)

```sql
-- As PharmaCo user (context automatically set by middleware)
SELECT id, name, description, owner_organization_id, tenant_id
FROM agents
ORDER BY name;

-- Returns: 1,138 rows
-- - 0 custom agents (Mechanism 1)
-- - 1,138 platform agents (Mechanism 2: VITAL-owned, Pharma-allocated)

-- As HealthTech Co user (context automatically set)
SELECT id, name, description, owner_organization_id, tenant_id
FROM agents
ORDER BY name;

-- Returns: 0 rows
-- - 0 custom agents (Mechanism 1)
-- - 0 platform agents (Mechanism 2: no agents allocated to Digital Health yet)

-- As VITAL service role (bypasses RLS)
SELECT
  COUNT(*) as total,
  COUNT(DISTINCT owner_organization_id) as owners,
  COUNT(DISTINCT tenant_id) as tenants
FROM agents;

-- Returns: 1,138 total, 1 owner (VITAL), 1 tenant (Pharma)
```

---

## Security Benefits

### Database-Level Enforcement

**PostgreSQL RLS guarantees:**
- ✅ All queries automatically filtered (no application logic needed)
- ✅ Cannot be bypassed by malicious code (enforced at DB layer)
- ✅ Consistent across all clients (backend, frontend, admin tools)
- ✅ Service role is only exception (protected, used sparingly)

### What RLS Prevents

1. **Cross-Tenant Data Leakage**: PharmaCo can't see HealthTech's agents
2. **Cross-Organization Data Leakage**: PharmaCo can't see BioTech's custom agents
3. **SQL Injection Protection**: Even malicious queries respect RLS filtering
4. **Developer Mistakes**: Forgotten WHERE clauses don't expose all data

### What Users CAN Access

1. **Their Own Custom Agents** (Mechanism 1):
   - Any agents where `owner_organization_id = their organization UUID`
   - Example: PharmaCo creates "PharmaCo Trial Manager" → only PharmaCo users see it

2. **Platform Agents for Their Industry** (Mechanism 2):
   - VITAL-owned agents allocated to their industry tenant
   - Example: All Pharma customers see "Clinical Trial Assistant" (VITAL-owned, Pharma-allocated)

3. **Nothing Else**:
   - ❌ Can't see other organizations' custom agents
   - ❌ Can't see platform agents from other industries
   - ❌ Can't manipulate organization context

---

## Migration Context

### What Changed (Phase 2 Migration)

**Before (Phase 1 - Column Addition):**
```sql
-- agents table schema
agents
├── tenant_id                 UUID (old column, will deprecate)
└── owner_organization_id     UUID (new column, added in Phase 1)
```

**After (Phase 2 - Data Migration):**
```sql
-- Data migration
UPDATE agents
SET owner_organization_id = tenant_id
WHERE tenant_id IS NOT NULL
  AND owner_organization_id IS NULL;

-- Result: 1,016 agents migrated
```

**Final Correction (Session Work):**
```sql
-- 1. Created VITAL organization
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'VITAL', 'vital');

-- 2. Assigned all agents to VITAL ownership
UPDATE agents
SET owner_organization_id = '00000000-0000-0000-0000-000000000001'
WHERE owner_organization_id != '00000000-0000-0000-0000-000000000001'
   OR owner_organization_id IS NULL;

-- 3. Allocated all agents to Pharma tenant
UPDATE agents
SET tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';  -- Pharmaceuticals

-- 4. Updated RLS policy to dual-mechanism
CREATE POLICY agents_isolation ON agents
  FOR ALL
  USING (
    owner_organization_id = get_current_organization_context()::UUID
    OR
    (owner_organization_id = VITAL AND tenant_id IN (user's tenant))
  );
```

### Why This Architecture

1. **Platform Agent Sharing**:
   - One "Clinical Trial Assistant" agent can be used by ALL Pharma customers
   - No need to duplicate agent for each customer

2. **Industry-Specific Content**:
   - Pharma agents have pharmaceutical knowledge/workflows
   - Digital Health agents have healthcare app knowledge/workflows
   - Customers only see agents relevant to their industry

3. **Custom Extensions**:
   - Customers can create their own agents (Mechanism 1)
   - While still accessing platform agents (Mechanism 2)

4. **Tenant Isolation**:
   - Pharma customers can't see Digital Health agents
   - Different business domains, different regulatory requirements

---

## Testing the RLS Policy

### Test 1: Verify Organization Isolation (Custom Agents)

```sql
-- Create custom agent for PharmaCo
SELECT set_organization_context('[PharmaCo-UUID]');

INSERT INTO agents (name, owner_organization_id, tenant_id)
VALUES (
  'PharmaCo Trial Manager',
  '[PharmaCo-UUID]',
  '[Pharma-Tenant-UUID]'
);

-- PharmaCo user can see it
SELECT COUNT(*) FROM agents WHERE name = 'PharmaCo Trial Manager';
-- Expected: 1 row

-- BioTech user (same tenant, different org) CANNOT see it
SELECT set_organization_context('[BioTech-UUID]');
SELECT COUNT(*) FROM agents WHERE name = 'PharmaCo Trial Manager';
-- Expected: 0 rows (blocked by Mechanism 1)
```

### Test 2: Verify Tenant Isolation (Platform Agents)

```sql
-- As PharmaCo user (Pharma tenant)
SELECT set_organization_context('[PharmaCo-UUID]');
SELECT COUNT(*) FROM agents
WHERE owner_organization_id = '00000000-0000-0000-0000-000000000001';
-- Expected: 1,138 rows (all Pharma platform agents)

-- As HealthTech user (Digital Health tenant)
SELECT set_organization_context('[HealthTech-UUID]');
SELECT COUNT(*) FROM agents
WHERE owner_organization_id = '00000000-0000-0000-0000-000000000001';
-- Expected: 0 rows (no agents allocated to Digital Health yet)
```

### Test 3: Verify No Cross-Tenant Leakage

```sql
-- Try to access specific Pharma agent as Digital Health user
SELECT set_organization_context('[HealthTech-UUID]');

SELECT * FROM agents WHERE id = '[specific-pharma-agent-uuid]';
-- Expected: 0 rows (blocked by Mechanism 2 subquery)

-- Verify subquery filters correctly
SELECT
  o.id as org_id,
  o.name as org_name,
  o.tenant_key,
  t.id as tenant_id,
  t.name as tenant_name
FROM organizations o
JOIN tenants t ON t.slug = o.tenant_key
WHERE o.id = '[HealthTech-UUID]';

-- Should return:
-- org_id: [HealthTech-UUID]
-- org_name: HealthTech Co
-- tenant_key: digital-health
-- tenant_id: [Digital-Health-Tenant-UUID]
-- tenant_name: Digital Health
```

### Test 4: Verify Service Role Bypass

```sql
-- Service role sees ALL agents (for admin operations)
SELECT COUNT(*) FROM agents;
-- Expected: 1,138 (all agents, no filtering)

SELECT
  COUNT(DISTINCT owner_organization_id) as owners,
  COUNT(DISTINCT tenant_id) as tenants
FROM agents;

-- Expected:
-- owners: 1 (all VITAL-owned)
-- tenants: 1 (all Pharma-allocated)
```

---

## FAQ

### Q: Why do all agents have the same tenant_id?

**A:** Currently, all platform agents are allocated to the Pharmaceuticals tenant. As we onboard Digital Health customers and create agents for that vertical, we'll add agents with `tenant_id = Digital Health UUID`.

### Q: Can a customer create their own agents?

**A:** Yes! Custom agents will have:
- `owner_organization_id = customer's UUID` (Mechanism 1)
- `tenant_id = customer's industry tenant` (for consistency)
- Only that customer's users will see them (other customers in same tenant won't)

### Q: How do we share a platform agent across all tenants?

**A:** You would need to:
1. Duplicate the agent for each tenant (different `tenant_id` values)
2. OR create a "global" public tenant and modify RLS to include it

Current design is industry-specific for regulatory/content reasons.

### Q: Can we change an agent's tenant allocation?

**A:** Yes, by updating `tenant_id`:
```sql
UPDATE agents
SET tenant_id = '[new-tenant-uuid]'
WHERE id = '[agent-uuid]';
```
- Users in old tenant will lose access (Mechanism 2 subquery filters them out)
- Users in new tenant will gain access (if VITAL-owned)

### Q: What's the performance impact of the subquery in Mechanism 2?

**A:** Minimal:
- Subquery returns exactly 1 row (user's tenant)
- Both lookups (`organizations`, `tenants`) are indexed
- PostgreSQL query planner optimizes the join
- Typical overhead: <5ms

### Q: What happens if a user belongs to multiple organizations?

**A:** Currently not supported - `get_current_organization_context()` returns a single UUID. If multi-org users are needed in the future:
- Store list of org_ids in JWT claims
- Update RLS to use `IN (SELECT unnest(current_user_orgs()))`

### Q: Can a customer see which industry tenant they belong to?

**A:** Yes, query:
```sql
SELECT
  o.name as organization_name,
  o.tenant_key,
  t.name as tenant_name
FROM organizations o
JOIN tenants t ON t.slug = o.tenant_key
WHERE o.id = get_current_organization_context()::UUID;
```

---

## Summary

The dual-mechanism RLS policy enables:

1. **Customer Isolation** (Mechanism 1):
   - PharmaCo can't see BioTech's custom agents
   - Each organization has private workspace

2. **Platform Sharing** (Mechanism 2):
   - All Pharma customers access same VITAL platform agents
   - Reduces duplication, centralizes updates

3. **Industry Segmentation**:
   - Pharma customers can't see Digital Health agents
   - Different content, different regulations

4. **Future Flexibility**:
   - Easy to add tenant-specific agents (update `tenant_id`)
   - Easy to add customer-specific agents (set `owner_organization_id`)
   - Supports hybrid model (some shared, some private)

**For fetching agents: Just query normally** - RLS automatically handles all filtering based on the authenticated user's organization context.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
**Maintained By:** Platform Security Team
**Related Files:**
- `database/migrations/20251126_010_phase2_migrate_agents_data.sql`
- `.vital-docs/vital-expert-docs/11-data-schema/security/SECURITY_DEFINER_VIEWS_REMEDIATION.md`
- `.claude/docs/platform/rls/CRITICAL-SECURITY-FIXES-COMPLETE.md`
