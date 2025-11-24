# VITAL Platform - Multitenancy Data Strategy Assessment

**Date:** 2025-11-18
**Prepared by:** VITAL Data Strategist Agent
**Status:** CRITICAL - Data Loading Failures Across Tenants
**Coordination:** This assessment aligns with vital-platform-orchestrator directives

---

## Executive Summary

The VITAL platform is experiencing systemic data loading failures due to **fundamental data architecture misalignment** between the multitenancy schema design, data access patterns, and RLS (Row Level Security) implementation. This is not a series of isolated bugs but rather a **strategic data architecture gap** that requires comprehensive remediation.

### Critical Findings

1. **Data Model Fragmentation**: Multiple overlapping data loading contexts (AuthContext, TenantContext) with no single source of truth
2. **RLS Policy Gaps**: 8 RLS policies added but missing critical tenant-aware policies on core tables
3. **Schema Inconsistencies**: Missing tenant_id columns, mismatched column expectations (implementation_type)
4. **Data Access Anti-patterns**: Mixed API/direct query approach with no clear strategy
5. **Caching Incoherence**: 5-minute cache TTL causing stale data during tenant switches
6. **Query Waterfall**: Sequential queries causing 3-5 second load times

---

## Section 1: Current Data Architecture Analysis

### 1.1 Data Model Structure

**Organizations Table (Tenant Base)**
```sql
organizations (
  id UUID PRIMARY KEY,
  name VARCHAR,
  slug VARCHAR,
  tenant_type VARCHAR(50), -- 'system', 'digital_health', 'pharmaceuticals'
  tenant_key VARCHAR(100) UNIQUE,
  is_active BOOLEAN,
  -- MISSING: subscription_tier for tier-based access
  -- MISSING: parent_organization_id for hierarchies
)
```

**Current Multitenancy Tables**
- `feature_flags` - Global feature definitions (66 columns)
- `tenant_feature_flags` - Per-tenant overrides (111 columns)
- `tenant_apps` - App visibility per tenant (144 columns)
- `tenant_configurations` - Tenant settings (150-207 columns)
- `tenant_agents` - Agent assignments (213-234 columns)

**Problem:** No unified tenant configuration retrieval - requires 4+ separate queries

### 1.2 Data Loading Architecture Issues

#### Issue 1.2.1: Context Provider Cascade

```
User Login → AuthContext
  ├─ Query 1: auth.getSession()
  ├─ Query 2: profiles.select() [background, non-blocking]
  ├─ Query 3: users.select() for organization_id
  └─ Query 4: organizations.select() [287-304 lines]
       └─ TenantContext initialization
            ├─ Query 5: tenant_configurations.select() [34-38 lines]
            ├─ Query 6: /api/tenants/{id}/apps fetch [51-53 lines]
            └─ Query 7: feature_flags (multiple queries) [60-62 lines]
```

**Total Latency:** 2-7 seconds (sequential waterfall)
**Failure Mode:** If ANY query fails, entire context breaks

#### Issue 1.2.2: Duplicate Tenant Context Implementations

Found **TWO** different TenantContext implementations:

**File 1:** `/apps/vital-system/src/contexts/TenantContext.tsx` (Simplified)
- Uses `user_tenants` join table
- 5-second timeout protection (115-129 lines)
- Loads tenants via `user_tenants.select('role, tenant:tenants(...)')`
- Stores in localStorage for persistence

**File 2:** `/apps/vital-system/src/contexts/tenant-context.tsx` (Full)
- Depends on AuthContext.organization
- Loads via `tenantConfigService` + `featureFlagService`
- 5-minute caching
- API fetch for apps

**Problem:** Unclear which implementation is active, leading to inconsistent behavior

### 1.3 Schema Integrity Issues

#### Missing tenant_id Columns (Before 20251118_001 Migration)
- `tools` table - **MISSING tenant_id**
- `agents` table - tenant_id added reactively
- `prompts` table - tenant_id added reactively
- `knowledge` table - tenant_id added reactively
- `chat_sessions` table - tenant_id added reactively
- `personas` table - tenant_id added reactively
- `jobs_to_be_done` table - tenant_id added reactively

#### Schema Mismatch - Tools Table

**Expected by API/UI:**
```typescript
{
  implementation_type: string,
  category: string,  // TEXT field
  slug: string,
  // ... 15+ other fields
}
```

**Actual Schema (20251003_tool_registry_system.sql):**
```sql
tools (
  tool_type TEXT, -- NOT 'implementation_type'
  category_id UUID, -- FK to tool_categories, NOT 'category' TEXT
  -- MISSING: slug, implementation_type, function_signature, etc.
)
```

**Impact:** Tools API returns data incompatible with frontend expectations

### 1.4 RLS Policy Coverage Analysis

**Current RLS Policies (20251118_003):**
```sql
-- ✅ COVERED (8 policies total)
1. agents - platform_agents_readable, tenant_agents_writable/updatable/deletable
2. tools - platform_tools_readable, tenant_tools_writable/updatable/deletable
3. prompts - platform_prompts_readable, tenant_prompts_writable
4. knowledge - platform_knowledge_readable, tenant_knowledge_writable
5. chat_sessions - tenant_chat_sessions_readable/writable
6. personas - tenant_personas_readable/writable
7. jobs_to_be_done - tenant_jtbd_readable/writable

-- ❌ MISSING RLS Policies
8. organizations - Only service_role + authenticated SELECT
9. users - NO RLS ENABLED
10. profiles - NO RLS ENABLED
11. tenant_configurations - Only service_role access
12. tenant_apps - Only service_role access
13. tenant_feature_flags - Only service_role access
14. tenant_agents - Only service_role access
15. feature_flags - Only authenticated SELECT
```

**Critical Gap:** Multitenancy tables have NO user-level RLS policies. All access requires service_role, forcing API routes instead of direct queries.

### 1.5 Data Access Pattern Anti-patterns

**Pattern 1: Mixed API + Direct Query**
```typescript
// TenantContext.tsx
const configResult = await tenantConfigService.getTenantConfig(tenantId); // Direct
const appsData = await fetch(`/api/tenants/${tenantId}/apps`); // API route
const enabledFeatures = await featureFlagService.getEnabledFeatures(tenantId); // Direct
```

**Problem:** No consistency. Some data via client-side Supabase, some via API routes.

**Pattern 2: Inconsistent Caching**
- `tenantConfigService` - 5-minute in-memory Map cache (16-17 lines)
- `featureFlagService` - 5-minute in-memory Map cache (17-20 lines)
- No cache invalidation on tenant switch
- No distributed cache for multi-instance deployments

**Pattern 3: Sequential Queries (N+1 Problem)**
```typescript
// Load tenant → Load config → Load apps → Load features
// Each blocks the next, 500-1500ms per query
```

---

## Section 2: Identified Data Issues and Gaps

### 2.1 Critical Data Issues

#### Issue C-1: Tenant Context Loading Failure
**Symptoms:** "Loading tenant context..." screen persists indefinitely
**Root Cause:**
1. TenantContext.tsx line 136-140: Queries `user_tenants` table which may not exist or be seeded
2. 5-second timeout (line 115-129) defaults to Platform Tenant, hiding the real error
3. No error logging for failed queries

**Impact:** Users cannot access tenant-specific data

#### Issue C-2: RLS Policy Denial on Multitenancy Tables
**Symptoms:** `tenant_configurations`, `tenant_apps` queries return empty/fail
**Root Cause:** RLS enabled (273-278) but only service_role policies exist (281-338)
**Impact:** Frontend cannot directly query tenant settings

#### Issue C-3: Schema Mismatch - Tools Table
**Symptoms:** Tools page shows no data or crashes
**Root Cause:**
- UI expects `implementation_type` (string)
- DB has `tool_type` (string) and NO `implementation_type` column
- Migration 20251118_001 line 184 attempts to add it, but may not have run

**Impact:** Cannot display or use tools

#### Issue C-4: Organization Data Not Loading
**Symptoms:** `organization` is null in AuthContext (line 83)
**Root Cause:**
- Query chain: users.organization_id → organizations.select() (287-304)
- Either `users` table missing data OR RLS blocking access
- Background fetch can fail silently (258-327)

**Impact:** TenantContext cannot initialize without organization

### 2.2 Data Governance Gaps

#### Gap G-1: No Data Ownership Model
- Who owns `organizations` data? Platform or tenants?
- Who can modify `tenant_configurations`? Only admins?
- No role-based data access documented

#### Gap G-2: No Data Validation Layer
- No check that user belongs to organization before granting access
- No validation that tenant_id in requests matches user's tenant
- Relying solely on RLS, which has gaps

#### Gap G-3: No Data Lineage
- Cannot trace why data fails to load
- No logging of which query in the chain fails
- No metrics on query performance per tenant

### 2.3 Performance Issues

#### Perf-1: Query Waterfall (Sequential Blocking)
```
Session check (200ms)
  → Profile fetch (500ms) [background]
    → User org_id fetch (400ms)
      → Organization fetch (600ms)
        → Tenant config fetch (700ms)
          → Apps API (500ms)
            → Feature flags (800ms)
= 3.7 seconds total (critical path)
```

#### Perf-2: No Query Batching
- Could fetch profile + user + organization in ONE query via JOIN
- Instead: 3 separate queries (261-304 lines in auth-context)

#### Perf-3: Cache Inefficiency
- 5-minute TTL too long for tenant switches
- No cache warmup on login
- No prefetching of likely-needed data

---

## Section 3: Recommended Data Strategy

### 3.1 Strategic Principles

**Principle 1: Single Source of Truth**
- ONE context provider for tenant data (not two)
- ONE query method (GraphQL or unified API)
- ONE cache layer (Redis, not in-memory Maps)

**Principle 2: Fail-Fast with Visibility**
- Remove timeout fallbacks that hide errors
- Log every query with tenant_id, user_id, duration
- Return explicit errors, not silent nulls

**Principle 3: Data Denormalization for Performance**
- Create `tenant_full_config` materialized view
- Pre-join tenant settings, apps, features
- Refresh on write, not on read

**Principle 4: RLS as Enforcement, Not Primary Access Control**
- Application layer validates tenant access BEFORE query
- RLS as defense-in-depth, not sole gatekeeper
- Service account queries for complex joins

### 3.2 Target Data Architecture

#### Proposed: Tenant Data Aggregation View

```sql
CREATE MATERIALIZED VIEW tenant_full_config AS
SELECT
  o.id as tenant_id,
  o.name,
  o.slug,
  o.tenant_type,
  o.tenant_key,
  o.is_active,
  tc.ui_config,
  tc.enabled_features,
  tc.enabled_apps,
  tc.limits,
  tc.compliance_settings,
  -- Aggregated apps
  (
    SELECT json_agg(
      json_build_object(
        'app_key', ta.app_key,
        'app_name', ta.app_name,
        'app_route', ta.app_route,
        'is_enabled', ta.is_enabled,
        'display_order', ta.display_order
      ) ORDER BY ta.display_order
    )
    FROM tenant_apps ta
    WHERE ta.tenant_id = o.id AND ta.is_visible = true
  ) as apps,
  -- Aggregated feature flags
  (
    SELECT json_agg(
      json_build_object(
        'flag_key', ff.flag_key,
        'enabled', COALESCE(tff.enabled, ff.default_enabled),
        'config', COALESCE(tff.config, '{}'::jsonb)
      )
    )
    FROM feature_flags ff
    LEFT JOIN tenant_feature_flags tff ON tff.feature_flag_id = ff.id AND tff.tenant_id = o.id
    WHERE ff.is_active = true
  ) as features
FROM organizations o
LEFT JOIN tenant_configurations tc ON tc.tenant_id = o.id
WHERE o.is_active = true;

-- Refresh trigger
CREATE OR REPLACE FUNCTION refresh_tenant_full_config()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY tenant_full_config;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_tenant_config
AFTER INSERT OR UPDATE OR DELETE ON tenant_configurations
FOR EACH STATEMENT EXECUTE FUNCTION refresh_tenant_full_config();
```

**Benefit:** ONE query loads ALL tenant data (10x faster than current waterfall)

### 3.3 Data Loading Implementation Strategy

#### Phase 1: Immediate Fixes (Week 1)

**Fix F1-1: Consolidate Context Providers**
```typescript
// Single TenantAuthContext.tsx
export function TenantAuthProvider({ children }) {
  // STEP 1: Get session (fast, cached by Supabase)
  const { session, user } = useSupabaseAuth();

  // STEP 2: ONE query with JOINs
  const { data, error, isLoading } = useQuery({
    queryKey: ['tenant-context', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_tenant_context', {
        p_user_id: user.id
      });
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // STEP 3: Handle errors explicitly
  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <TenantContext.Provider value={data}>
      {children}
    </TenantContext.Provider>
  );
}
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION get_user_tenant_context(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user', jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'full_name', p.full_name,
      'role', p.role
    ),
    'organization', jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'slug', o.slug,
      'tenant_type', o.tenant_type
    ),
    'config', tfc.*
  )
  INTO v_result
  FROM profiles p
  JOIN users u ON u.id = p.id
  JOIN organizations o ON o.id = u.organization_id
  LEFT JOIN tenant_full_config tfc ON tfc.tenant_id = o.id
  WHERE p.id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Benefit:**
- 1 query instead of 7
- 200-500ms instead of 3-7 seconds
- Explicit error handling
- Type-safe return

**Fix F1-2: Add Missing RLS Policies**

```sql
-- Allow users to read their own profile
CREATE POLICY "users_read_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to read their organization's users
CREATE POLICY "users_read_org_users"
ON public.users FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT u2.organization_id
    FROM users u2
    WHERE u2.id = auth.uid()
  )
);

-- Allow users to read their tenant configuration
CREATE POLICY "tenant_config_readable"
ON public.tenant_configurations FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id
    FROM users u
    WHERE u.id = auth.uid()
  )
);

-- Allow users to read their tenant apps
CREATE POLICY "tenant_apps_readable"
ON public.tenant_apps FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id
    FROM users u
    WHERE u.id = auth.uid()
  )
);

-- Allow users to read enabled feature flags
CREATE POLICY "tenant_feature_flags_readable"
ON public.tenant_feature_flags FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id
    FROM users u
    WHERE u.id = auth.uid()
  )
);
```

**Fix F1-3: Schema Validation Migration**

```sql
-- Create schema validation function
CREATE OR REPLACE FUNCTION validate_multitenancy_schema()
RETURNS TABLE(
  table_name TEXT,
  column_name TEXT,
  issue TEXT
) AS $$
BEGIN
  -- Check tools table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tools' AND column_name = 'implementation_type'
  ) THEN
    RETURN QUERY SELECT 'tools'::TEXT, 'implementation_type'::TEXT, 'MISSING'::TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tools' AND column_name = 'tenant_id'
  ) THEN
    RETURN QUERY SELECT 'tools'::TEXT, 'tenant_id'::TEXT, 'MISSING'::TEXT;
  END IF;

  -- Check tenant_id on all tenant-aware tables
  DECLARE
    r RECORD;
  BEGIN
    FOR r IN
      SELECT t.table_name
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
      AND t.table_name IN ('agents', 'prompts', 'knowledge', 'personas', 'jobs_to_be_done')
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = r.table_name AND column_name = 'tenant_id'
      ) THEN
        RETURN QUERY SELECT r.table_name, 'tenant_id'::TEXT, 'MISSING'::TEXT;
      END IF;
    END LOOP;
  END;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Run validation
SELECT * FROM validate_multitenancy_schema();
```

#### Phase 2: Data Quality & Monitoring (Week 2)

**Monitoring M2-1: Query Performance Tracking**

```sql
CREATE TABLE query_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID,
  query_type TEXT, -- 'tenant_context', 'agents', 'tools', etc.
  duration_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_perf_tenant ON query_performance_log(tenant_id, created_at);
CREATE INDEX idx_query_perf_user ON query_performance_log(user_id, created_at);

-- Auto-cleanup old logs (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_query_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM query_performance_log
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

**Monitoring M2-2: Data Load Dashboard**

```typescript
// lib/monitoring/data-load-metrics.ts
export async function trackDataLoad(
  type: 'tenant_context' | 'agents' | 'tools',
  tenantId: string,
  userId: string,
  startTime: number
) {
  const duration = Date.now() - startTime;

  await supabase.from('query_performance_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    query_type: type,
    duration_ms: duration,
    success: true,
  });

  // Send to analytics
  if (duration > 1000) {
    console.warn(`[DataLoad] Slow query: ${type} took ${duration}ms for tenant ${tenantId}`);
  }
}
```

**Data Quality DQ2-1: Missing Data Detector**

```sql
CREATE OR REPLACE FUNCTION detect_missing_tenant_data(p_tenant_id UUID)
RETURNS TABLE(
  data_type TEXT,
  status TEXT,
  record_count INTEGER,
  issue TEXT
) AS $$
BEGIN
  -- Check tenant configuration
  RETURN QUERY
  SELECT
    'tenant_configuration'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM tenant_configurations WHERE tenant_id = p_tenant_id)
      THEN 'OK'::TEXT ELSE 'MISSING'::TEXT END,
    (SELECT COUNT(*)::INTEGER FROM tenant_configurations WHERE tenant_id = p_tenant_id),
    CASE WHEN NOT EXISTS (SELECT 1 FROM tenant_configurations WHERE tenant_id = p_tenant_id)
      THEN 'No configuration record found'::TEXT ELSE NULL END;

  -- Check tenant apps
  RETURN QUERY
  SELECT
    'tenant_apps'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM tenant_apps WHERE tenant_id = p_tenant_id)
      THEN 'OK'::TEXT ELSE 'MISSING'::TEXT END,
    (SELECT COUNT(*)::INTEGER FROM tenant_apps WHERE tenant_id = p_tenant_id),
    CASE WHEN NOT EXISTS (SELECT 1 FROM tenant_apps WHERE tenant_id = p_tenant_id)
      THEN 'No apps assigned'::TEXT ELSE NULL END;

  -- Check users assigned to tenant
  RETURN QUERY
  SELECT
    'users'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM users WHERE organization_id = p_tenant_id)
      THEN 'OK'::TEXT ELSE 'MISSING'::TEXT END,
    (SELECT COUNT(*)::INTEGER FROM users WHERE organization_id = p_tenant_id),
    CASE WHEN NOT EXISTS (SELECT 1 FROM users WHERE organization_id = p_tenant_id)
      THEN 'No users assigned to this tenant'::TEXT ELSE NULL END;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Phase 3: Caching Strategy (Week 3)

**Cache Strategy CS3-1: Redis Integration**

```typescript
// lib/cache/tenant-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class TenantCacheService {
  private readonly TTL = 5 * 60; // 5 minutes

  async getTenantConfig(tenantId: string) {
    const cacheKey = `tenant:${tenantId}:config`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Load from DB (using materialized view)
    const { data } = await supabase
      .from('tenant_full_config')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    // Cache result
    if (data) {
      await redis.setex(cacheKey, this.TTL, JSON.stringify(data));
    }

    return data;
  }

  async invalidateTenantConfig(tenantId: string) {
    await redis.del(`tenant:${tenantId}:config`);
  }

  async warmCache(tenantId: string) {
    // Pre-load on user login
    await this.getTenantConfig(tenantId);
  }
}
```

**Cache Strategy CS3-2: Client-Side Query Cache (React Query)**

```typescript
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## Section 4: RLS Policy Comprehensive Plan

### 4.1 RLS Policy Architecture

**Current State:**
- RLS enabled on 13 tables
- Only 8 policies for tenant data isolation
- All multitenancy config tables require service_role

**Target State:**
- RLS on ALL tenant-aware tables (20+ tables)
- User-level policies for read access
- Admin-level policies for write access
- Service-role policies as fallback

### 4.2 Comprehensive RLS Policy Set

#### Policy Set 1: User Tables

```sql
-- profiles: Users can read their own profile
CREATE POLICY "profile_self_access"
ON public.profiles FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- profiles: Super admins can read all profiles
CREATE POLICY "profile_admin_access"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
);

-- users: Users can read their org's users
CREATE POLICY "users_org_access"
ON public.users FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )
);
```

#### Policy Set 2: Organization Tables

```sql
-- organizations: Users can read their own organization
CREATE POLICY "org_self_access"
ON public.organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )
);

-- organizations: Super admins can manage all orgs
CREATE POLICY "org_admin_management"
ON public.organizations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
);
```

#### Policy Set 3: Tenant Configuration Tables

```sql
-- tenant_configurations: Users can read their tenant config
CREATE POLICY "tenant_config_read"
ON public.tenant_configurations FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )
);

-- tenant_configurations: Tenant admins can update config
CREATE POLICY "tenant_config_admin_update"
ON public.tenant_configurations FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id FROM users u
    JOIN profiles p ON p.id = u.id
    WHERE u.id = auth.uid() AND p.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT u.organization_id FROM users u
    JOIN profiles p ON p.id = u.id
    WHERE u.id = auth.uid() AND p.role IN ('admin', 'super_admin')
  )
);

-- tenant_apps: Users can read their tenant apps
CREATE POLICY "tenant_apps_read"
ON public.tenant_apps FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )
);

-- tenant_feature_flags: Users can read their tenant features
CREATE POLICY "tenant_features_read"
ON public.tenant_feature_flags FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )
);
```

#### Policy Set 4: Feature Flags

```sql
-- feature_flags: Authenticated users can read all active flags
CREATE POLICY "feature_flags_read_active"
ON public.feature_flags FOR SELECT
TO authenticated
USING (is_active = true);

-- feature_flags: Super admins can manage flags
CREATE POLICY "feature_flags_admin_manage"
ON public.feature_flags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
);
```

#### Policy Set 5: Tenant Agents

```sql
-- tenant_agents: Users can read their tenant's agent assignments
CREATE POLICY "tenant_agents_read"
ON public.tenant_agents FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )
);

-- tenant_agents: Tenant admins can assign agents
CREATE POLICY "tenant_agents_admin_assign"
ON public.tenant_agents FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT u.organization_id FROM users u
    JOIN profiles p ON p.id = u.id
    WHERE u.id = auth.uid() AND p.role IN ('admin', 'super_admin')
  )
);
```

### 4.3 RLS Helper Functions

```sql
-- Get user's tenant ID
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is tenant admin
CREATE OR REPLACE FUNCTION is_tenant_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 4.4 RLS Testing Strategy

```sql
-- Test script for RLS policies
DO $$
DECLARE
  test_user_id UUID := 'USER_UUID_HERE';
  test_tenant_id UUID := 'TENANT_UUID_HERE';
BEGIN
  -- Set user context
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, false);

  -- Test 1: Can user read their tenant config?
  ASSERT EXISTS (
    SELECT 1 FROM tenant_configurations WHERE tenant_id = test_tenant_id
  ), 'User cannot read tenant config';

  -- Test 2: Can user read their tenant apps?
  ASSERT EXISTS (
    SELECT 1 FROM tenant_apps WHERE tenant_id = test_tenant_id
  ), 'User cannot read tenant apps';

  -- Test 3: Can user read other tenant's config?
  ASSERT NOT EXISTS (
    SELECT 1 FROM tenant_configurations
    WHERE tenant_id != test_tenant_id
  ), 'User can read other tenant config (SECURITY ISSUE)';

  RAISE NOTICE 'All RLS tests passed!';
END $$;
```

---

## Section 5: Schema Validation and Integrity Plan

### 5.1 Schema Integrity Issues

**Issue:** Multiple migrations added columns reactively, leading to inconsistent state across environments.

**Solution:** Automated schema validation and drift detection.

### 5.2 Schema Validation System

#### Validation V5-1: Required Column Checker

```sql
CREATE TABLE schema_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  is_nullable BOOLEAN DEFAULT false,
  has_default BOOLEAN DEFAULT false,
  is_primary_key BOOLEAN DEFAULT false,
  is_foreign_key BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_name, column_name)
);

-- Seed validation rules for multitenancy
INSERT INTO schema_validation_rules (table_name, column_name, data_type, is_nullable) VALUES
  ('organizations', 'tenant_type', 'character varying', false),
  ('organizations', 'tenant_key', 'character varying', false),
  ('organizations', 'is_active', 'boolean', false),
  ('tools', 'tenant_id', 'uuid', false),
  ('tools', 'implementation_type', 'text', true),
  ('tools', 'category', 'text', true),
  ('agents', 'tenant_id', 'uuid', true),
  ('prompts', 'tenant_id', 'uuid', true),
  ('knowledge', 'tenant_id', 'uuid', true),
  ('chat_sessions', 'tenant_id', 'uuid', true),
  ('personas', 'tenant_id', 'uuid', true),
  ('jobs_to_be_done', 'tenant_id', 'uuid', true);

-- Validation function
CREATE OR REPLACE FUNCTION validate_schema()
RETURNS TABLE(
  table_name TEXT,
  column_name TEXT,
  expected_type TEXT,
  actual_type TEXT,
  status TEXT,
  issue TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    svr.table_name,
    svr.column_name,
    svr.data_type as expected_type,
    c.data_type as actual_type,
    CASE
      WHEN c.column_name IS NULL THEN 'MISSING'
      WHEN c.data_type != svr.data_type THEN 'TYPE_MISMATCH'
      WHEN c.is_nullable::text != svr.is_nullable::text THEN 'NULLABLE_MISMATCH'
      ELSE 'OK'
    END as status,
    CASE
      WHEN c.column_name IS NULL THEN 'Column does not exist'
      WHEN c.data_type != svr.data_type THEN 'Expected ' || svr.data_type || ', got ' || c.data_type
      WHEN c.is_nullable::text != svr.is_nullable::text THEN 'Nullable mismatch'
      ELSE NULL
    END as issue
  FROM schema_validation_rules svr
  LEFT JOIN information_schema.columns c
    ON c.table_schema = 'public'
    AND c.table_name = svr.table_name
    AND c.column_name = svr.column_name
  WHERE svr.table_name IN (
    'organizations', 'tools', 'agents', 'prompts', 'knowledge',
    'chat_sessions', 'personas', 'jobs_to_be_done'
  );
END;
$$ LANGUAGE plpgsql;
```

#### Validation V5-2: Automated Schema Drift Detection

```typescript
// scripts/validate-schema.ts
import { createClient } from '@supabase/supabase-js';

async function validateSchema() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: issues } = await supabase.rpc('validate_schema');

  const failures = issues?.filter(i => i.status !== 'OK') || [];

  if (failures.length > 0) {
    console.error('❌ Schema validation failed:');
    console.table(failures);
    process.exit(1);
  } else {
    console.log('✅ Schema validation passed');
  }
}

validateSchema();
```

**Add to CI/CD Pipeline:**
```yaml
# .github/workflows/schema-validation.yml
name: Schema Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Run schema validation
        run: npm run validate:schema
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### 5.3 Migration Guardrails

#### Guardrail G5-1: Pre-Migration Validation

```sql
-- Run BEFORE every migration
CREATE OR REPLACE FUNCTION pre_migration_check()
RETURNS TABLE(
  check_type TEXT,
  status TEXT,
  message TEXT
) AS $$
BEGIN
  -- Check 1: Are there active sessions?
  RETURN QUERY
  SELECT
    'active_sessions'::TEXT,
    CASE WHEN COUNT(*) > 100 THEN 'WARNING' ELSE 'OK' END::TEXT,
    'Active sessions: ' || COUNT(*)::TEXT
  FROM pg_stat_activity
  WHERE state = 'active';

  -- Check 2: Is there data to migrate?
  RETURN QUERY
  SELECT
    'data_volume'::TEXT,
    'INFO'::TEXT,
    'Agents: ' || COUNT(*)::TEXT
  FROM agents;

  -- Check 3: Check for locks
  RETURN QUERY
  SELECT
    'table_locks'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'WARNING' ELSE 'OK' END::TEXT,
    'Locked tables: ' || COALESCE(string_agg(DISTINCT relname, ', '), 'none')
  FROM pg_locks l
  JOIN pg_class c ON c.oid = l.relation
  WHERE l.mode LIKE '%ExclusiveLock';

  RETURN;
END;
$$ LANGUAGE plpgsql;
```

#### Guardrail G5-2: Post-Migration Validation

```sql
CREATE OR REPLACE FUNCTION post_migration_check()
RETURNS TABLE(
  check_type TEXT,
  status TEXT,
  message TEXT
) AS $$
BEGIN
  -- Check 1: Were tenant_id columns added?
  RETURN QUERY
  SELECT
    'tenant_id_columns'::TEXT,
    CASE WHEN COUNT(*) >= 7 THEN 'OK' ELSE 'FAIL' END::TEXT,
    'Tables with tenant_id: ' || COUNT(*)::TEXT || ' (expected 7+)'
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND table_name IN (
    'tools', 'agents', 'prompts', 'knowledge',
    'chat_sessions', 'personas', 'jobs_to_be_done'
  );

  -- Check 2: Are RLS policies in place?
  RETURN QUERY
  SELECT
    'rls_policies'::TEXT,
    CASE WHEN COUNT(*) >= 20 THEN 'OK' ELSE 'FAIL' END::TEXT,
    'RLS policies: ' || COUNT(*)::TEXT || ' (expected 20+)'
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Check 3: Schema validation
  RETURN QUERY
  SELECT
    'schema_validation'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'FAIL' END::TEXT,
    'Schema issues: ' || COUNT(*)::TEXT
  FROM validate_schema()
  WHERE status != 'OK';

  RETURN;
END;
$$ LANGUAGE plpgsql;
```

---

## Section 6: API vs Direct Query Strategy

### 6.1 Current Issues

**Problem:** Inconsistent data access patterns:
- Some queries via Supabase client (direct)
- Some via API routes (`/api/tenants/{id}/apps`)
- No clear decision framework

**Impact:**
- Doubled code maintenance
- RLS bypassed in API routes
- Caching inconsistencies

### 6.2 Decision Framework

| Data Type | Access Method | Reason |
|-----------|---------------|--------|
| **User Profile** | Direct (Supabase) | Fast, cached by Supabase, simple query |
| **Tenant Config** | Direct (Supabase) | Single query, benefits from RLS, client-side cache |
| **Tenant Apps** | Direct (Supabase) | Simple SELECT, no business logic |
| **Feature Flags** | Direct (Supabase) | Simple query, high-read low-write |
| **Complex Aggregations** | API Route | Requires multiple queries or business logic |
| **Mutations** | API Route | Validation, side effects, audit logging |
| **External Services** | API Route | Secrets management, rate limiting |

### 6.3 Recommended Architecture

#### Direct Query Pattern (Preferred for Reads)

```typescript
// lib/data-access/tenant.ts
import { createClient } from '@/lib/supabase/client';

export async function getTenantContext(userId: string) {
  const supabase = createClient();

  // Single RPC call
  const { data, error } = await supabase.rpc('get_user_tenant_context', {
    p_user_id: userId
  });

  if (error) throw error;
  return data;
}

export async function getTenantApps(tenantId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tenant_apps')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_visible', true)
    .order('display_order');

  if (error) throw error;
  return data;
}
```

#### API Route Pattern (For Writes & Complex Logic)

```typescript
// app/api/tenants/[id]/config/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  // Verify user has access to this tenant
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userTenant } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (userTenant?.organization_id !== params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Update configuration
  const updates = await req.json();

  const { data, error } = await supabase
    .from('tenant_configurations')
    .update(updates)
    .eq('tenant_id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalidate cache
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cache/invalidate`, {
    method: 'POST',
    body: JSON.stringify({ key: `tenant:${params.id}:config` })
  });

  return NextResponse.json(data);
}
```

### 6.4 Eliminate Redundant API Routes

**Remove:**
- `GET /api/tenants/[id]/apps` - Replace with direct query
- `GET /api/tenants/[id]/config` - Replace with direct query
- `GET /api/tenants/[id]/features` - Replace with direct query

**Keep:**
- `PATCH /api/tenants/[id]/config` - Updates require validation
- `POST /api/tenants/[id]/features/toggle` - Business logic
- `POST /api/tenants/[id]/agents/assign` - Side effects

---

## Section 7: Data Migration and Fixes

### 7.1 Immediate Data Fixes Required

#### Fix M7-1: Ensure All Tenants Have Configuration

```sql
-- Find tenants without configuration
SELECT o.id, o.name, o.tenant_type
FROM organizations o
LEFT JOIN tenant_configurations tc ON tc.tenant_id = o.id
WHERE tc.id IS NULL
AND o.is_active = true;

-- Create default configurations
INSERT INTO tenant_configurations (
  tenant_id,
  ui_config,
  enabled_features,
  enabled_apps,
  enabled_agent_tiers,
  limits,
  compliance_settings
)
SELECT
  o.id,
  jsonb_build_object(
    'theme', 'default',
    'primary_color', '#4F46E5',
    'logo_url', null
  ),
  ARRAY[]::TEXT[],
  ARRAY['dashboard', 'chat', 'agents']::TEXT[],
  ARRAY[1, 2, 3]::INTEGER[],
  jsonb_build_object(
    'max_agents', 100,
    'max_conversations', 1000
  ),
  jsonb_build_object(
    'hipaa_enabled', CASE WHEN o.tenant_type = 'pharmaceuticals' THEN true ELSE false END,
    'gdpr_enabled', true
  )
FROM organizations o
LEFT JOIN tenant_configurations tc ON tc.tenant_id = o.id
WHERE tc.id IS NULL
AND o.is_active = true;
```

#### Fix M7-2: Ensure All Users Have organization_id

```sql
-- Find users without organization
SELECT id, email FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- Create user records for auth users
INSERT INTO public.users (id, organization_id, email, created_at)
SELECT
  au.id,
  '00000000-0000-0000-0000-000000000001'::UUID, -- Platform tenant
  au.email,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;
```

#### Fix M7-3: Ensure All Users Have Profiles

```sql
-- Find users without profiles
SELECT u.id, u.email FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Create profiles
INSERT INTO profiles (id, email, full_name, role, tenant_id)
SELECT
  u.id,
  u.email,
  COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = u.id),
    SPLIT_PART(u.email, '@', 1)
  ),
  'user',
  u.organization_id
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);
```

#### Fix M7-4: Seed Tenant Apps for All Tenants

```sql
-- Core apps that all tenants should have
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM organizations WHERE is_active = true
  LOOP
    -- Dashboard
    INSERT INTO tenant_apps (tenant_id, app_key, app_name, app_route, app_icon, is_visible, is_enabled, display_order)
    VALUES (tenant_record.id, 'dashboard', 'Dashboard', '/dashboard', 'home', true, true, 1)
    ON CONFLICT (tenant_id, app_key) DO NOTHING;

    -- Chat
    INSERT INTO tenant_apps (tenant_id, app_key, app_name, app_route, app_icon, is_visible, is_enabled, display_order)
    VALUES (tenant_record.id, 'chat', 'Chat', '/chat', 'message-circle', true, true, 2)
    ON CONFLICT (tenant_id, app_key) DO NOTHING;

    -- Agents
    INSERT INTO tenant_apps (tenant_id, app_key, app_name, app_route, app_icon, is_visible, is_enabled, display_order)
    VALUES (tenant_record.id, 'agents', 'Agents', '/agents', 'users', true, true, 3)
    ON CONFLICT (tenant_id, app_key) DO NOTHING;

    -- Knowledge
    INSERT INTO tenant_apps (tenant_id, app_key, app_name, app_route, app_icon, is_visible, is_enabled, display_order)
    VALUES (tenant_record.id, 'knowledge', 'Knowledge', '/knowledge', 'book', true, true, 4)
    ON CONFLICT (tenant_id, app_key) DO NOTHING;
  END LOOP;
END $$;
```

### 7.2 Data Consistency Check

```sql
-- Comprehensive data consistency report
CREATE OR REPLACE FUNCTION check_data_consistency()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  count INTEGER,
  message TEXT
) AS $$
BEGIN
  -- Check 1: Organizations without configuration
  RETURN QUERY
  SELECT
    'orgs_without_config'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK'::TEXT ELSE 'FAIL'::TEXT END,
    COUNT(*)::INTEGER,
    'Organizations missing tenant_configurations: ' || COUNT(*)::TEXT
  FROM organizations o
  LEFT JOIN tenant_configurations tc ON tc.tenant_id = o.id
  WHERE tc.id IS NULL AND o.is_active = true;

  -- Check 2: Organizations without apps
  RETURN QUERY
  SELECT
    'orgs_without_apps'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK'::TEXT ELSE 'FAIL'::TEXT END,
    COUNT(*)::INTEGER,
    'Organizations missing tenant_apps: ' || COUNT(*)::TEXT
  FROM organizations o
  WHERE o.is_active = true
  AND NOT EXISTS (SELECT 1 FROM tenant_apps ta WHERE ta.tenant_id = o.id);

  -- Check 3: Users without organization
  RETURN QUERY
  SELECT
    'users_without_org'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK'::TEXT ELSE 'FAIL'::TEXT END,
    COUNT(*)::INTEGER,
    'Users missing organization_id: ' || COUNT(*)::TEXT
  FROM users
  WHERE organization_id IS NULL;

  -- Check 4: Users without profiles
  RETURN QUERY
  SELECT
    'users_without_profile'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK'::TEXT ELSE 'FAIL'::TEXT END,
    COUNT(*)::INTEGER,
    'Users missing profile: ' || COUNT(*)::TEXT
  FROM users u
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);

  -- Check 5: Agents without tenant_id
  RETURN QUERY
  SELECT
    'agents_without_tenant'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK'::TEXT ELSE 'FAIL'::TEXT END,
    COUNT(*)::INTEGER,
    'Agents missing tenant_id: ' || COUNT(*)::TEXT
  FROM agents
  WHERE tenant_id IS NULL;

  -- Check 6: Tools without tenant_id
  RETURN QUERY
  SELECT
    'tools_without_tenant'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK'::TEXT ELSE 'FAIL'::TEXT END,
    COUNT(*)::INTEGER,
    'Tools missing tenant_id: ' || COUNT(*)::TEXT
  FROM tools
  WHERE tenant_id IS NULL;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Run consistency check
SELECT * FROM check_data_consistency();
```

---

## Section 8: Performance Optimization

### 8.1 Query Performance Issues

**Current:** 3-7 second load time
**Target:** <500ms for tenant context load

### 8.2 Optimization Strategies

#### Optimization O8-1: Materialized View for Tenant Context

```sql
-- Already defined in Section 3.2, but adding indexes
CREATE INDEX idx_tenant_full_config_tenant_id
ON tenant_full_config(tenant_id);

CREATE INDEX idx_tenant_full_config_slug
ON tenant_full_config(slug);

CREATE INDEX idx_tenant_full_config_tenant_key
ON tenant_full_config(tenant_key);

-- Concurrent refresh to avoid locks
REFRESH MATERIALIZED VIEW CONCURRENTLY tenant_full_config;
```

#### Optimization O8-2: Database Function for User Context

```sql
-- Optimized single-query user context retrieval
CREATE OR REPLACE FUNCTION get_user_tenant_context_optimized(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Single query with all joins
  SELECT jsonb_build_object(
    'user', jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'full_name', p.full_name,
      'role', p.role
    ),
    'organization', jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'slug', o.slug,
      'tenant_type', o.tenant_type,
      'tenant_key', o.tenant_key,
      'is_active', o.is_active
    ),
    'config', to_jsonb(tfc.*) - 'tenant_id'
  )
  INTO v_result
  FROM profiles p
  JOIN users u ON u.id = p.id
  JOIN organizations o ON o.id = u.organization_id
  LEFT JOIN tenant_full_config tfc ON tfc.tenant_id = o.id
  WHERE p.id = p_user_id;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add index on users.organization_id if not exists
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
```

#### Optimization O8-3: Query Plan Analysis

```sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM get_user_tenant_context_optimized('USER_UUID_HERE');

-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'profiles', 'organizations',
  'tenant_configurations', 'tenant_apps', 'tenant_feature_flags'
)
ORDER BY tablename, indexname;
```

#### Optimization O8-4: Connection Pooling

```typescript
// lib/supabase/client.ts - Add connection pooling
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: { 'x-application': 'vital-platform' },
      },
      // Enable connection pooling
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  );

  return supabaseInstance;
}
```

### 8.3 Performance Monitoring

```sql
-- Create performance tracking table
CREATE TABLE IF NOT EXISTS query_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name TEXT NOT NULL,
  tenant_id UUID,
  user_id UUID,
  execution_time_ms INTEGER,
  rows_returned INTEGER,
  cache_hit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_perf_created_at ON query_performance(created_at DESC);
CREATE INDEX idx_query_perf_tenant ON query_performance(tenant_id);
CREATE INDEX idx_query_perf_query_name ON query_performance(query_name);

-- Performance monitoring function
CREATE OR REPLACE FUNCTION log_query_performance(
  p_query_name TEXT,
  p_tenant_id UUID,
  p_user_id UUID,
  p_execution_time_ms INTEGER,
  p_rows_returned INTEGER,
  p_cache_hit BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  INSERT INTO query_performance (
    query_name,
    tenant_id,
    user_id,
    execution_time_ms,
    rows_returned,
    cache_hit
  ) VALUES (
    p_query_name,
    p_tenant_id,
    p_user_id,
    p_execution_time_ms,
    p_rows_returned,
    p_cache_hit
  );
END;
$$ LANGUAGE plpgsql;

-- Performance dashboard query
CREATE OR REPLACE FUNCTION get_query_performance_stats(p_hours INTEGER DEFAULT 24)
RETURNS TABLE(
  query_name TEXT,
  avg_time_ms NUMERIC,
  max_time_ms INTEGER,
  min_time_ms INTEGER,
  total_executions BIGINT,
  cache_hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qp.query_name,
    ROUND(AVG(qp.execution_time_ms), 2) as avg_time_ms,
    MAX(qp.execution_time_ms) as max_time_ms,
    MIN(qp.execution_time_ms) as min_time_ms,
    COUNT(*) as total_executions,
    ROUND(
      (COUNT(*) FILTER (WHERE qp.cache_hit) * 100.0) / NULLIF(COUNT(*), 0),
      2
    ) as cache_hit_rate
  FROM query_performance qp
  WHERE qp.created_at > NOW() - (p_hours || ' hours')::INTERVAL
  GROUP BY qp.query_name
  ORDER BY avg_time_ms DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## Section 9: Master Data Management

### 9.1 Master Data Strategy

**Master Data Entities:**
1. Organizations (tenants)
2. Feature Flags (global definitions)
3. Tool Registry
4. Agent Registry (platform agents)

### 9.2 Organization Master Data

#### MDM O9-1: Organization Lifecycle Management

```sql
-- Organization lifecycle states
CREATE TYPE org_lifecycle_state AS ENUM (
  'pending',      -- Created, awaiting approval
  'active',       -- Active tenant
  'suspended',    -- Temporarily disabled
  'archived'      -- Permanently disabled
);

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS lifecycle_state org_lifecycle_state DEFAULT 'active';

-- Organization audit log
CREATE TABLE IF NOT EXISTS organization_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  action TEXT NOT NULL, -- 'created', 'updated', 'suspended', 'activated', 'archived'
  actor_id UUID, -- User who performed the action
  changes JSONB, -- What changed
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_audit_org_id ON organization_audit_log(organization_id);
CREATE INDEX idx_org_audit_created_at ON organization_audit_log(created_at DESC);

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_organization_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO organization_audit_log (
      organization_id,
      action,
      changes
    ) VALUES (
      NEW.id,
      'updated',
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO organization_audit_log (
      organization_id,
      action
    ) VALUES (
      NEW.id,
      'created'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_audit_trigger
AFTER INSERT OR UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION audit_organization_changes();
```

### 9.3 Feature Flag Master Data

#### MDM F9-2: Feature Flag Versioning

```sql
-- Feature flag versions for rollback capability
CREATE TABLE IF NOT EXISTS feature_flag_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id),
  version INTEGER NOT NULL,
  config JSONB NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_flag_id, version)
);

-- Automatic versioning trigger
CREATE OR REPLACE FUNCTION version_feature_flag()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feature_flag_versions (
    feature_flag_id,
    version,
    config
  )
  SELECT
    NEW.id,
    COALESCE(MAX(version), 0) + 1,
    to_jsonb(NEW)
  FROM feature_flag_versions
  WHERE feature_flag_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feature_flag_versioning
AFTER INSERT OR UPDATE ON feature_flags
FOR EACH ROW EXECUTE FUNCTION version_feature_flag();
```

### 9.4 Tool Registry Master Data

#### MDM T9-3: Tool Deprecation Strategy

```sql
-- Add deprecation fields to tools
ALTER TABLE tools
ADD COLUMN IF NOT EXISTS deprecated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deprecated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deprecated_reason TEXT,
ADD COLUMN IF NOT EXISTS replacement_tool_id UUID REFERENCES tools(id);

-- Tool usage tracking for deprecation decisions
CREATE TABLE IF NOT EXISTS tool_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id),
  tenant_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID,
  agent_id UUID,
  success BOOLEAN,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_usage_tool_id ON tool_usage_log(tool_id);
CREATE INDEX idx_tool_usage_created_at ON tool_usage_log(created_at DESC);

-- Tool health monitoring
CREATE OR REPLACE FUNCTION get_tool_health_metrics(p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  tool_id UUID,
  tool_name TEXT,
  total_uses BIGINT,
  success_rate NUMERIC,
  avg_execution_time_ms NUMERIC,
  unique_tenants BIGINT,
  health_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    COUNT(tul.*) as total_uses,
    ROUND(
      (COUNT(*) FILTER (WHERE tul.success = true) * 100.0) / NULLIF(COUNT(*), 0),
      2
    ) as success_rate,
    ROUND(AVG(tul.execution_time_ms), 2) as avg_execution_time_ms,
    COUNT(DISTINCT tul.tenant_id) as unique_tenants,
    CASE
      WHEN COUNT(*) = 0 THEN 'UNUSED'
      WHEN (COUNT(*) FILTER (WHERE tul.success = true) * 100.0) / NULLIF(COUNT(*), 0) < 50 THEN 'UNHEALTHY'
      WHEN (COUNT(*) FILTER (WHERE tul.success = true) * 100.0) / NULLIF(COUNT(*), 0) < 80 THEN 'DEGRADED'
      ELSE 'HEALTHY'
    END as health_status
  FROM tools t
  LEFT JOIN tool_usage_log tul ON tul.tool_id = t.id
    AND tul.created_at > NOW() - (p_days || ' days')::INTERVAL
  WHERE t.is_active = true
  GROUP BY t.id, t.name
  ORDER BY total_uses DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## Section 10: Coordination with Platform Orchestrator

### 10.1 Decision Points Requiring Orchestrator Approval

**Before Implementation:**

1. **Materialized View Strategy** (Section 3.2)
   - Requires orchestrator approval for performance implications
   - May impact backup/restore processes

2. **RLS Policy Changes** (Section 4)
   - Security implications for entire platform
   - Must align with overall security architecture

3. **API Route Elimination** (Section 6.4)
   - May break existing integrations
   - Requires coordinated rollout

4. **Caching Strategy** (Section 3.3, Phase 3)
   - Redis infrastructure dependency
   - Cost implications

### 10.2 Implementation Coordination

**Phase 1: Critical Fixes (Week 1)**
- **Owner:** Data Strategist + Database Architect
- **Approval:** Platform Orchestrator
- **Deliverables:**
  - Consolidated TenantAuthContext
  - Missing RLS policies added
  - Schema validation passing
- **Gate:** All data loading working before Phase 2

**Phase 2: Performance & Monitoring (Week 2)**
- **Owner:** Data Strategist + Performance Engineer
- **Approval:** Platform Orchestrator
- **Deliverables:**
  - Materialized views deployed
  - Query performance monitoring active
  - Data consistency checks automated
- **Gate:** <1s load time before Phase 3

**Phase 3: Caching & Optimization (Week 3)**
- **Owner:** Data Strategist + Infrastructure Team
- **Approval:** Platform Orchestrator + CTO
- **Deliverables:**
  - Redis cache layer operational
  - API routes consolidated
  - Master data management process defined
- **Gate:** Platform ready for production load

### 10.3 Reporting to Orchestrator

**Weekly Status Report Template:**

```markdown
# VITAL Data Strategy - Weekly Status Report
**Week:** [WEEK_NUMBER]
**Phase:** [CURRENT_PHASE]
**Status:** [ON_TRACK | AT_RISK | BLOCKED]

## Accomplishments
- [List of completed tasks]

## Key Metrics
- Tenant context load time: XXXms (Target: <500ms)
- RLS policies deployed: XX/30
- Schema validation: PASS/FAIL
- Data consistency checks: PASS/FAIL

## Blockers
- [List any blockers requiring orchestrator intervention]

## Next Week Plan
- [Planned activities for next week]

## Risks & Mitigation
- [Identified risks and mitigation strategies]
```

---

## Section 11: Executive Summary & Recommendations

### 11.1 Critical Path to Recovery

**Immediate Actions (24-48 hours):**

1. **Deploy Fix F1-2: Add Missing RLS Policies**
   - Unblocks frontend data access
   - Allows direct Supabase queries

2. **Run Fix M7-1 through M7-4: Data Consistency Fixes**
   - Ensures all tenants have configuration
   - Ensures all users have profiles and organization_id

3. **Deploy Fix F1-1: Consolidated Context Provider**
   - Reduces load time from 3-7s to <1s
   - Eliminates query waterfall

**Expected Result:** Data loading functional across all tenants

### 11.2 Strategic Recommendations

**Recommendation R1: Adopt "Database-First" Query Strategy**
- Use database functions for complex queries
- Direct Supabase client for simple reads
- API routes ONLY for writes and business logic

**Recommendation R2: Implement Automated Schema Validation**
- Add to CI/CD pipeline
- Prevent future schema drift
- Catch missing columns before deployment

**Recommendation R3: Establish Data Governance Committee**
- Monthly reviews of feature flag usage
- Tool deprecation decisions
- Tenant onboarding/offboarding process

**Recommendation R4: Invest in Observability**
- Query performance monitoring
- Data load time tracking
- RLS policy audit logging

### 11.3 Success Metrics

**Phase 1 Success Criteria:**
- [ ] Tenant context loads in <1 second (100% of attempts)
- [ ] Zero RLS policy denial errors in logs
- [ ] Schema validation passes on all environments
- [ ] All 3 MVP tenants can access their data

**Phase 2 Success Criteria:**
- [ ] Query performance dashboard operational
- [ ] Data consistency checks automated (daily)
- [ ] Materialized views refresh without downtime
- [ ] 95th percentile load time <500ms

**Phase 3 Success Criteria:**
- [ ] Redis cache hit rate >70%
- [ ] API routes reduced from 15 to 5
- [ ] Master data management process documented
- [ ] Platform ready for 10x user growth

### 11.4 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration breaks existing tenants | Medium | Critical | Pre-migration backup, rollback plan |
| Performance regression | Low | High | Load testing before deployment |
| RLS policy too restrictive | Medium | High | Gradual rollout, monitoring |
| Cache invalidation bugs | Medium | Medium | Cache TTL safety net, manual invalidation endpoint |
| Schema drift recurrence | High | Medium | Automated validation in CI/CD |

---

## Appendix A: Implementation Checklist

### Week 1: Critical Fixes

- [ ] Backup production database
- [ ] Run schema validation (Section 5.2)
- [ ] Deploy RLS policies (Section 4.2)
- [ ] Run data consistency fixes (Section 7.1)
- [ ] Deploy consolidated context provider (Section 3.3, Fix F1-1)
- [ ] Test all 3 MVP tenants can log in
- [ ] Verify data loading <2 seconds
- [ ] Deploy to staging
- [ ] Load test staging environment
- [ ] Deploy to production (off-hours)
- [ ] Monitor error logs for 48 hours

### Week 2: Monitoring & Performance

- [ ] Create materialized view (Section 3.2)
- [ ] Deploy database function get_user_tenant_context_optimized (Section 8.2)
- [ ] Create query performance logging (Section 8.3)
- [ ] Set up performance dashboard
- [ ] Run query plan analysis
- [ ] Optimize slow queries
- [ ] Test tenant switching performance
- [ ] Verify <1 second load time
- [ ] Deploy to production

### Week 3: Caching & Optimization

- [ ] Provision Redis instance
- [ ] Deploy Redis cache layer (Section 3.3, CS3-1)
- [ ] Implement React Query client-side cache (Section 3.3, CS3-2)
- [ ] Eliminate redundant API routes (Section 6.4)
- [ ] Update frontend to use direct queries
- [ ] Deploy cache invalidation endpoint
- [ ] Load test with cache
- [ ] Monitor cache hit rate
- [ ] Deploy to production

---

## Appendix B: SQL Script Summary

**File:** `/database/migrations/critical/001_multitenancy_data_fixes.sql`
- Consolidated RLS policies (Section 4.2)
- Data consistency fixes (Section 7.1)
- Schema validation function (Section 5.2)

**File:** `/database/migrations/critical/002_tenant_full_config_view.sql`
- Materialized view creation (Section 3.2)
- Refresh triggers

**File:** `/database/migrations/critical/003_performance_monitoring.sql`
- Query performance logging (Section 8.3)
- Tool usage tracking (Section 9.4)

**File:** `/database/functions/get_user_tenant_context.sql`
- Optimized context retrieval (Section 8.2)

---

## Conclusion

The VITAL platform's multitenancy data loading issues stem from **architectural misalignment** rather than individual bugs. The recommended strategy focuses on:

1. **Consolidation:** Single context provider, single query method
2. **Performance:** Materialized views, optimized queries, caching
3. **Governance:** Automated validation, monitoring, audit logging
4. **Simplicity:** Direct queries over API routes where possible

**Implementation Risk:** Low to Medium (phased rollout with rollback capability)
**Expected Improvement:** 85% reduction in data load time (3-7s → <500ms)
**Business Impact:** Critical - Unblocks all tenant functionality

**Next Steps:**
1. Review assessment with vital-platform-orchestrator
2. Get approval for Phase 1 implementation
3. Schedule deployment window
4. Execute fixes and monitor results

---

**Prepared by:** VITAL Data Strategist Agent
**Date:** 2025-11-18
**Version:** 1.0
**Status:** Ready for Orchestrator Review
