# VITAL Platform - Multi-Tenant Architecture Audit Report
**Date:** October 26, 2025
**Audit Scope:** Current Implementation vs. Gold Standard Architecture
**Status:** 🔴 CRITICAL GAPS IDENTIFIED

---

## EXECUTIVE SUMMARY

### Current State: ⚠️ INCOMPLETE MULTI-TENANT IMPLEMENTATION

The VITAL Platform has **basic tenant isolation** but is **missing 80% of the gold standard multi-tenant architecture** required for production SaaS deployment.

**Critical Finding:** The codebase was designed for **single-tenant (digital-health-startup)** deployment, NOT multi-tenant SaaS. The gold standard documents describe a comprehensive multi-tenant system that does NOT currently exist in the codebase.

### Gap Analysis Summary

| Component | Gold Standard | Current Status | Gap Severity |
|-----------|---------------|----------------|--------------|
| **Tenants Table** | Full tenant management with types | ❌ Only `rag_tenants` (limited) | 🔴 CRITICAL |
| **Tenant Types** | 4 types (client, solution, industry, platform) | ❌ Only 2 types (super_admin, user) | 🔴 CRITICAL |
| **Shared Resources** | Platform-wide agent/tool sharing | ❌ NO IMPLEMENTATION | 🔴 CRITICAL |
| **Resource Sharing Modes** | Global, selective, private | ❌ NO IMPLEMENTATION | 🔴 CRITICAL |
| **Tenant Context Middleware** | Full context extraction | ⚠️ Basic auth only | 🟡 HIGH |
| **RLS Policies** | Tenant isolation + sharing | ⚠️ Basic isolation only | 🟡 HIGH |
| **API Tenant Context** | All routes tenant-aware | ❌ NO IMPLEMENTATION | 🔴 CRITICAL |
| **Resource Access Matrix** | By tenant type | ❌ NO IMPLEMENTATION | 🔴 CRITICAL |

---

## DETAILED FINDINGS

### 1. DATABASE SCHEMA ANALYSIS

#### ❌ MISSING: Full Tenants Table

**Gold Standard Requires:**
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    domain VARCHAR(255) UNIQUE,  -- e.g., "takeda.vital.expert"
    type VARCHAR(50) CHECK (type IN ('client', 'solution', 'industry', 'platform')),
    parent_tenant_id UUID,
    subscription_tier VARCHAR(50),
    resource_access_config JSONB,
    branding JSONB,
    features JSONB,
    hipaa_compliant BOOLEAN,
    gdpr_compliant BOOLEAN,
    ...
);
```

**Current Implementation:**
```sql
-- ONLY EXISTS: rag_tenants (limited scope)
CREATE TABLE rag_tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    domain VARCHAR(255),
    tenant_type VARCHAR(50) CHECK (tenant_type IN ('super_admin', 'user')),  -- ⚠️ Only 2 types!
    user_id UUID,
    subscription_tier VARCHAR(50),
    settings JSONB,
    ...
);
```

**Gap:**
- ❌ No full `tenants` table for platform-wide tenant management
- ❌ Missing 4 tenant types: client, solution, industry, platform
- ❌ No `resource_access_config` for controlling what tenants can access
- ❌ No subdomain-based tenant resolution (takeda.vital.expert)
- ❌ No parent-child tenant relationships
- ❌ No branding/customization per tenant

---

#### ❌ MISSING: Shared Resource Schema

**Gold Standard Requires:**
All resource tables (agents, tools, prompts, RAG) need these columns:
```sql
ALTER TABLE agents ADD COLUMN:
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    is_shared BOOLEAN DEFAULT false,
    sharing_mode VARCHAR(50) CHECK (sharing_mode IN ('private', 'global', 'selective')),
    shared_with UUID[] DEFAULT '{}',
    resource_type VARCHAR(50) DEFAULT 'custom'  -- 'platform', 'solution', 'custom'
```

**Current Implementation:**
```sql
-- agents table (from comprehensive_agents_schema.sql)
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    ...
    -- ❌ NO tenant_id column!
    -- ❌ NO is_shared column!
    -- ❌ NO sharing_mode column!
    -- ❌ NO shared_with column!
    -- ❌ NO resource_type column!

    created_by UUID,  -- ⚠️ Only user ownership, not tenant ownership
    is_custom BOOLEAN,  -- ⚠️ Different semantic than resource_type
    ...
);
```

**Gap:**
- ❌ Agents table has NO tenant isolation
- ❌ NO mechanism for platform to share agents with all tenants
- ❌ NO mechanism for Takeda to create private agents
- ❌ NO mechanism for selective sharing between tenants
- ❌ Same gaps exist for tools, prompts, workflows, RAG tables

---

#### ⚠️ INCOMPLETE: RLS Policies

**Gold Standard Requires:**
```sql
-- SELECT: Own resources + platform shared + selectively shared
CREATE POLICY "agents_select_with_sharing" ON agents
    FOR SELECT
    USING (
        tenant_id = current_setting('app.tenant_id')::UUID
        OR (is_shared = true AND sharing_mode = 'global')
        OR (is_shared = true AND sharing_mode = 'selective'
            AND current_setting('app.tenant_id')::UUID = ANY(shared_with))
    );
```

**Current Implementation:**
```sql
-- From comprehensive_agents_schema.sql
CREATE POLICY "Public agents are viewable by everyone"
    ON agents FOR SELECT
    USING (data_classification = 'public');

CREATE POLICY "Authenticated users can view internal agents"
    ON agents FOR SELECT
    TO authenticated
    USING (data_classification IN ('public', 'internal'));
```

**Gap:**
- ⚠️ Uses `data_classification` instead of `tenant_id` for isolation
- ❌ NO tenant-based isolation
- ❌ NO shared resource access logic
- ❌ NO `app.tenant_id` session variable support
- ❌ NO selective sharing logic

---

### 2. MIDDLEWARE & TENANT CONTEXT

#### ❌ MISSING: Tenant Context Extraction

**Gold Standard Requires:**
```typescript
// middleware.ts should extract tenant context from:
// 1. Subdomain (takeda.vital.expert)
// 2. Custom headers (X-Tenant-ID)
// 3. JWT claims

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tenantType: 'client' | 'solution' | 'industry' | 'platform';
  resourceAccess: {
    canCreateCustomAgents: boolean;
    canShareResources: boolean;
    maxCustomAgents: number;
  };
}

// Set tenant context in headers for downstream API routes
response.headers.set('X-Tenant-ID', tenantId);
response.headers.set('X-Tenant-Type', tenantType);
```

**Current Implementation:**
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // ❌ NO tenant extraction logic
  // ❌ NO subdomain parsing
  // ❌ NO tenant context headers
  // ✅ Only basic auth check

  const supabase = createServerClient(...);
  await supabase.auth.getUser();
  return response;
}
```

**Gap:**
- ❌ NO tenant identification logic
- ❌ NO tenant context propagation to API routes
- ❌ NO tenant type determination
- ❌ NO resource access validation
- ❌ NO multi-tenant routing (all routes serve single tenant)

---

### 3. API ROUTES & TENANT ISOLATION

#### ❌ MISSING: Tenant-Aware API Routes

**Gold Standard Requires:**
```typescript
// Every API route should:
export async function GET(req: NextRequest) {
  const { tenantId, tenantType, resourceAccess } = getTenantContext(req);
  const supabase = createTenantClient(tenantId);  // Sets app.tenant_id

  // Query respects RLS - only returns tenant's resources + shared
  const { data } = await supabase
    .from('agents')
    .select('*');  // RLS automatically filters by tenant

  return NextResponse.json({ data });
}
```

**Current Implementation:**
```typescript
// src/app/api/agents/route.ts (example)
export async function GET(req: NextRequest) {
  // ❌ NO tenant context extraction
  // ❌ NO tenant-aware Supabase client
  // ❌ Queries return ALL agents (no tenant filtering)

  const supabase = createClient(...);  // Uses service role key
  const { data } = await supabase
    .from('agents')
    .select('*');  // ⚠️ Returns ALL agents globally!

  return NextResponse.json({ data });
}
```

**Gap:**
- ❌ API routes are NOT tenant-aware
- ❌ NO tenant context validation
- ❌ NO automatic tenant filtering via RLS
- ❌ NO resource access enforcement
- ⚠️ ALL API queries return global data (security risk!)

---

### 4. SHARED RESOURCES SYSTEM

#### ❌ MISSING: Platform Resource Sharing

**Gold Standard Requires:**
```
Platform creates 136+ agents marked as:
  - is_shared = true
  - sharing_mode = 'global'
  - tenant_id = 'super-admin-tenant-id'

Result: ALL tenants (Takeda, Pfizer, etc.) can use these agents

When Takeda queries agents:
  - Gets 136 platform agents (shared)
  - Gets 5 Takeda custom agents (own)
  - Gets 2 partner agents (selectively shared)
  - Total: 143 agents available
```

**Current Implementation:**
```
❌ NO shared resources system exists
❌ NO platform agents concept
❌ NO tenant-specific agents concept
❌ NO sharing mechanism

Current behavior:
  - All 250 agents exist in single namespace
  - No tenant ownership
  - No sharing logic
  - Every user sees the same agents
```

**Gap:**
- ❌ Cannot create platform-wide shared agents
- ❌ Cannot create tenant-specific private agents
- ❌ Cannot share agents between tenants
- ❌ No resource discovery API
- ❌ No resource access validation

---

### 5. FRONTEND INTEGRATION

#### ❌ MISSING: Tenant Context Provider

**Gold Standard Requires:**
```typescript
// contexts/TenantContext.tsx
export function TenantProvider({ children }) {
  const { tenant, loading } = useTenant();

  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

// Usage in components
const { tenant } = useTenant();
console.log(tenant.name);  // "Takeda Pharmaceuticals"
console.log(tenant.type);  // "client"
console.log(tenant.resourceAccess.maxCustomAgents);  // 100
```

**Current Implementation:**
```
❌ NO TenantContext exists
❌ NO useTenant hook
❌ NO tenant awareness in frontend
❌ Components assume single-tenant environment
```

**Gap:**
- ❌ Cannot display tenant-specific branding
- ❌ Cannot enforce tenant-specific resource limits
- ❌ Cannot filter resources by tenant
- ❌ Cannot show "Platform" vs "Your Agents" vs "Shared"

---

## IMPACT ASSESSMENT

### 🔴 CRITICAL RISKS (Production Blockers)

1. **Data Leakage Risk**
   - Current: ALL tenants can see ALL agents
   - Missing: Tenant isolation at database level
   - Impact: **Confidential data exposed across tenants**

2. **Cannot Onboard Multiple Clients**
   - Current: Only supports single tenant (digital-health-startup)
   - Missing: Multi-tenant infrastructure
   - Impact: **Cannot serve Takeda, Pfizer, etc. as separate customers**

3. **No Resource Sharing**
   - Current: Cannot share platform agents with all tenants
   - Missing: Shared resources system
   - Impact: **Every tenant must create their own agents (defeats SaaS model)**

4. **No Tenant Types**
   - Current: Only "user" tenants
   - Missing: Client, solution, industry, platform types
   - Impact: **Cannot differentiate enterprise vs solution vs industry customers**

### 🟡 HIGH RISKS (Architecture Gaps)

5. **No Tenant Context Propagation**
   - API routes don't know which tenant is calling
   - No automatic tenant filtering
   - Manual tenant checking required everywhere

6. **Incomplete RLS Policies**
   - RLS exists but uses wrong isolation model
   - Uses `data_classification` instead of `tenant_id`
   - Doesn't support shared resources

---

## IMPLEMENTATION GAP SUMMARY

### What EXISTS ✅
1. ✅ Basic `rag_tenants` table (limited scope)
2. ✅ Basic RLS policies (wrong isolation model)
3. ✅ Basic authentication middleware
4. ✅ Agents table with rich schema
5. ✅ Organizational structure tables

### What is MISSING ❌
1. ❌ Full `tenants` table with 4 tenant types
2. ❌ Tenant ID columns on all resource tables
3. ❌ Shared resources columns (`is_shared`, `sharing_mode`, `shared_with`)
4. ❌ Tenant context middleware
5. ❌ Tenant-aware API routes
6. ❌ Tenant-aware Supabase client
7. ❌ RLS policies for tenant isolation + sharing
8. ❌ Resource sharing APIs
9. ❌ Frontend tenant context
10. ❌ Subdomain-based tenant resolution
11. ❌ Resource access validation
12. ❌ Tenant type-based access control
13. ❌ Cross-tenant resource sharing
14. ❌ Resource usage analytics by tenant
15. ❌ Tenant audit logging

---

## PRIORITY RECOMMENDATIONS

### Phase 1: CRITICAL - Tenant Foundation (Week 1)
**Goal:** Enable basic multi-tenant operation

1. **Create Full Tenants Table**
   - Add `tenants` table with 4 types
   - Migrate `rag_tenants` data to new table
   - Create super admin platform tenant

2. **Add Tenant ID to Resource Tables**
   - Add `tenant_id`, `is_shared`, `sharing_mode`, `shared_with` to:
     - `agents`
     - `tools` (if exists)
     - `prompts` (if exists)
     - `rag_knowledge_sources`

3. **Update RLS Policies**
   - Rewrite policies to use `tenant_id`
   - Add shared resource access logic
   - Support `app.tenant_id` session variable

### Phase 2: HIGH - Tenant Context (Week 2)
**Goal:** Make all routes tenant-aware

4. **Implement Tenant Context Middleware**
   - Extract tenant from subdomain/headers
   - Validate tenant exists and is active
   - Set tenant context headers

5. **Create Tenant-Aware Supabase Client**
   - Set `app.tenant_id` for RLS
   - Auto-filter queries by tenant

6. **Update API Routes**
   - Extract tenant context
   - Use tenant-aware client
   - Validate resource access

### Phase 3: MEDIUM - Shared Resources (Week 3)
**Goal:** Enable platform resource sharing

7. **Mark Platform Resources**
   - Identify 136+ agents to share
   - Set `is_shared = true`, `sharing_mode = 'global'`
   - Assign to platform tenant

8. **Create Resource Sharing APIs**
   - `GET /api/resources/discover` - list accessible resources
   - `PATCH /api/agents/[id]/share` - manage sharing
   - `GET /api/tenants/[id]/resources` - tenant's resources

9. **Add Frontend Tenant Context**
   - Create TenantContext provider
   - Add `useTenant()` hook
   - Filter resources by source (platform/own/shared)

---

## MIGRATION COMPLEXITY

**Estimated Effort:** 3-4 weeks (1 engineer)

| Phase | Effort | Risk | Blockers |
|-------|--------|------|----------|
| Phase 1: Foundation | 40 hours | HIGH | Data migration, breaking changes |
| Phase 2: Context | 30 hours | MEDIUM | All API routes need updates |
| Phase 3: Sharing | 30 hours | LOW | Depends on Phase 1 & 2 |
| **Total** | **100 hours** | **HIGH** | **Full system refactor required** |

---

## CONCLUSION

**The VITAL Platform is currently a SINGLE-TENANT application masquerading as multi-tenant.**

The gold standard documents describe a sophisticated multi-tenant SaaS architecture that **does not exist** in the current codebase. To deploy VITAL as described (with tenants like Takeda, Pfizer, Launch Excellence solution, etc.), a **complete multi-tenant refactor** is required.

### Options:

**Option A: Full Multi-Tenant Refactor** (Recommended for SaaS)
- Implement all 3 phases above
- Timeline: 3-4 weeks
- Result: True multi-tenant SaaS platform

**Option B: Enhanced Single-Tenant** (Quick path)
- Keep current architecture
- Add basic tenant filtering
- Timeline: 1 week
- Result: Better single-tenant, not true multi-tenant

**Option C: Hybrid Approach** (Pragmatic)
- Implement Phase 1 & 2 (tenant foundation + context)
- Defer Phase 3 (sharing) until needed
- Timeline: 2 weeks
- Result: Multi-tenant capable, manual resource sharing

---

**Next Steps:**
1. **Decide**: Which option aligns with business goals?
2. **Plan**: If refactoring, create detailed migration plan
3. **Execute**: Start with Phase 1 (tenant foundation)

**Prepared by:** Claude (Anthropic)
**Date:** October 26, 2025
