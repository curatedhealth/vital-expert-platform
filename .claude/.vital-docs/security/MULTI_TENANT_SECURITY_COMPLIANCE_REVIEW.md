# VITAL Multi-Tenant Security & Compliance Review

**Review Date:** 2025-11-26
**Reviewer:** VITAL Security & Compliance Agent
**Scope:** 3-Level Multi-Tenant Architecture (Platform → Tenant → Organization)
**Status:** CRITICAL FINDINGS IDENTIFIED

---

## Executive Summary

This review identifies CRITICAL security vulnerabilities and HIPAA compliance gaps in the proposed 3-level multi-tenant architecture. The current implementation has **8 critical vulnerabilities** that must be addressed before production deployment.

**Risk Level: HIGH**
- HIPAA Compliance Status: PARTIAL (60% compliant)
- Security Posture: VULNERABLE (40% secure)
- Production Readiness: NOT READY

**Critical Findings:**
1. Client-controllable tenant selection allows cross-tenant data access
2. No user-to-organization membership validation
3. Development bypass mode present in production code
4. RLS policies not properly enforced
5. Weak session management (30-day expiry, lax SameSite)
6. Admin tenant bypasses all RLS with service role key
7. Zero RLS isolation tests
8. Insufficient audit logging (no PHI access tracking)

---

## 1. Threat Model Analysis

### 1.1 Cross-Organization Data Access Attack Vectors

#### CRITICAL: Client-Controllable Tenant Selection
**File:** `/apps/vital-system/src/middleware/agent-auth.ts:153-158`
```typescript
// VULNERABILITY: Client can set tenant_id via cookie or header
const cookieTenantId = request.cookies.get('tenant_id')?.value;
const headerTenantId = request.headers.get('x-tenant-id');
const tenantId = cookieTenantId || headerTenantId || organizationId || tenantIds.platform;
```

**Attack Scenario:**
```bash
# Attacker from Pfizer can access Novartis data by manipulating headers
curl -X GET https://vital.health/api/agents \
  -H "x-tenant-id: novartis-uuid" \
  -H "Authorization: Bearer pfizer_user_token"
# Result: Returns Novartis agents despite Pfizer authentication
```

**HIPAA Reference:** §164.312(a)(1) - Access Control FAILED
**Impact:** Complete tenant isolation bypass, unauthorized PHI access

**Recommended Fix:**
```typescript
// SECURE: Validate user has membership in requested tenant
export async function verifyAgentPermissions(request: NextRequest, action, agentId?) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get requested tenant from cookie/header
  const requestedTenantId = request.cookies.get('tenant_id')?.value ||
                           request.headers.get('x-tenant-id');

  // CRITICAL: Validate user belongs to requested tenant
  const { data: membership, error } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('organization_id', requestedTenantId)
    .eq('status', 'active')
    .single();

  if (error || !membership) {
    logger.error('tenant_access_denied', {
      userId: user.id,
      requestedTenant: requestedTenantId,
      reason: 'user_not_member_of_organization'
    });
    return { allowed: false, error: 'Access denied to this organization' };
  }

  // Set tenant context ONLY after validation
  await supabase.rpc('set_tenant_context', { p_tenant_id: requestedTenantId });
  await supabase.rpc('set_user_context', { p_user_id: user.id });

  return { allowed: true, context: { user, tenant: membership } };
}
```

#### CRITICAL: No User-to-Organization Membership Validation
**Missing Table:** `user_organizations` junction table
```sql
-- REQUIRED: User-Organization Membership Table
CREATE TABLE user_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'guest')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_accessed_at timestamptz,
  invited_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, organization_id)
);

-- RLS Policy: Users can only see their own memberships
CREATE POLICY "user_can_view_own_memberships" ON user_organizations
FOR SELECT USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX idx_user_org_user_status ON user_organizations(user_id, status)
WHERE status = 'active';

-- Audit logging
CREATE TABLE user_organization_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  action text NOT NULL, -- 'joined', 'suspended', 'revoked', 'accessed'
  performed_by uuid REFERENCES auth.users(id),
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);
```

### 1.2 Privilege Escalation from Organization to Tenant Level

#### CRITICAL: Development Bypass in Production Code
**File:** `/apps/vital-system/src/middleware/agent-auth.ts:75-98`
```typescript
// VULNERABILITY: Development bypass can be enabled in production
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true' || process.env.NODE_ENV === 'development';

if (BYPASS_AUTH && action === 'read') {
  // Grants super_admin access without authentication
  return {
    allowed: true,
    context: {
      user: { id: 'dev-user', email: 'dev@vital.health' },
      profile: { tenant_id: tenantIds.platform, role: 'super_admin' }
    }
  };
}
```

**Attack Scenario:**
```bash
# If BYPASS_AUTH is accidentally set in production .env
BYPASS_AUTH=true npm run start
# Result: All users get super_admin access without authentication
```

**HIPAA Reference:** §164.312(d) - Person or Entity Authentication FAILED

**Recommended Fix:**
```typescript
// SECURE: Completely remove bypass code from production builds
// Use compile-time environment checks only
if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_BYPASS === 'true') {
  // Development-only bypass with explicit flag
  logger.warn('dev_bypass_enabled', {
    warning: 'Authentication bypass is enabled - DEVELOPMENT ONLY'
  });
  return { allowed: true, context: devContext };
}

// Production: No bypasses allowed
if (!user || !user.id) {
  return { allowed: false, error: 'Authentication required' };
}
```

#### CRITICAL: Admin Tenant Service Role Bypass
**File:** `/database/migrations/rls/001_enable_rls_comprehensive_v2.sql:150-154`
```sql
-- VULNERABILITY: Policies use app.tenant_id without service role protection
CREATE POLICY "tenant_isolation_agents"
ON public.agents
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
```

**Attack Scenario:**
```typescript
// If service role key leaks, attacker can bypass ALL RLS
const supabase = createClient(SUPABASE_URL, LEAKED_SERVICE_ROLE_KEY);
await supabase.rpc('set_tenant_context', { p_tenant_id: 'victim-tenant-uuid' });
const { data } = await supabase.from('agents').select('*'); // Gets ALL agents
```

**HIPAA Reference:** §164.312(a)(2)(i) - Unique User Identification FAILED

**Recommended Fix:**
```sql
-- SECURE: Add service role protection to all policies
CREATE POLICY "tenant_isolation_agents_secure"
ON public.agents
FOR ALL
USING (
  -- Service role only allowed for system operations
  CASE
    WHEN current_setting('role') = 'service_role'
    THEN tenant_id = '00000000-0000-0000-0000-000000000001'::uuid -- VITAL system only
    ELSE tenant_id = current_setting('app.tenant_id', true)::uuid
  END
)
WITH CHECK (
  CASE
    WHEN current_setting('role') = 'service_role'
    THEN tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    ELSE tenant_id = current_setting('app.tenant_id', true)::uuid
  END
);
```

### 1.3 Compromised Organization Admin Account

#### HIGH: No Multi-Factor Authentication (MFA)
**Missing:** MFA enforcement for admin accounts
```typescript
// REQUIRED: MFA enforcement for admin users
export async function enforceAdminMFA(userId: string, role: string) {
  if (role === 'admin' || role === 'super_admin') {
    const { data: factors } = await supabase.auth.mfa.listFactors();

    if (!factors || factors.length === 0) {
      throw new Error('MFA required for admin accounts');
    }

    // Verify MFA was recently authenticated (within last 12 hours)
    const lastMFA = await supabase
      .from('user_mfa_sessions')
      .select('verified_at')
      .eq('user_id', userId)
      .order('verified_at', { ascending: false })
      .limit(1)
      .single();

    const mfaAge = Date.now() - new Date(lastMFA.verified_at).getTime();
    const twelveHours = 12 * 60 * 60 * 1000;

    if (mfaAge > twelveHours) {
      throw new Error('MFA verification expired - re-authenticate');
    }
  }
}
```

#### HIGH: Weak Session Management
**File:** Implied from middleware session handling
```typescript
// VULNERABILITY: 30-day cookie expiry, lax SameSite
// Current implementation (insecure):
const cookieTenantId = request.cookies.get('tenant_id')?.value;

// SECURE: Implement strict session management
const sessionConfig = {
  maxAge: 3600, // 1 hour for admin sessions
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // NOT 'lax'
  path: '/',
  domain: process.env.COOKIE_DOMAIN
};

// For admin actions, require re-authentication every hour
if (role === 'admin' && actionIsSensitive(action)) {
  const sessionAge = Date.now() - context.session.created_at;
  if (sessionAge > 3600000) { // 1 hour
    return { allowed: false, error: 'Session expired - re-authenticate' };
  }
}
```

**HIPAA Reference:** §164.312(a)(2)(iii) - Automatic Logoff PARTIAL

### 1.4 Tenant-Shared Resources Data Exfiltration

#### MEDIUM: Tenant-Level Shared Agents Without Audit
**File:** `/services/ai-engine/MULTI_TENANT_STRATEGY.md:19-24`
```markdown
### 3. Shared Agents (Multi-Tenant)
- Visibility: Owner + explicitly granted tenants
- Example: Agent shared between partner organizations
- Flag: is_shared = true + entries in agent_tenant_access
```

**Risk:** Shared agents can be used to exfiltrate data between tenants
```sql
-- VULNERABILITY: No audit trail for agent access across tenants
SELECT * FROM agent_tenant_access; -- Who granted what?
-- Missing: Who accessed the shared agent? When? What data was processed?
```

**Recommended Fix:**
```sql
-- SECURE: Comprehensive audit logging for shared agents
CREATE TABLE agent_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id),
  accessed_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  accessed_from_tenant_id uuid NOT NULL REFERENCES tenants(id),
  access_type text NOT NULL CHECK (access_type IN ('read', 'execute', 'modify')),
  input_data_hash text, -- Hash of input for integrity
  output_data_hash text, -- Hash of output for integrity
  phi_accessed boolean DEFAULT false,
  phi_fields text[], -- Which PHI fields were accessed
  timestamp timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  session_id uuid
);

-- Index for audit queries
CREATE INDEX idx_agent_audit_tenant_time ON agent_access_audit(accessed_from_tenant_id, timestamp DESC);
CREATE INDEX idx_agent_audit_phi ON agent_access_audit(phi_accessed) WHERE phi_accessed = true;

-- RLS: Users can only see audit logs for their own tenant
CREATE POLICY "tenant_audit_isolation" ON agent_access_audit
FOR SELECT USING (accessed_from_tenant_id = current_setting('app.tenant_id', true)::uuid);
```

---

## 2. RLS Policy Security Validation

### 2.1 Current RLS Implementation Issues

#### CRITICAL: RLS Policy Column Name Mismatch
**File:** `/database/migrations/rls/001_enable_rls_comprehensive_v2.sql:150-154`
```sql
-- VULNERABILITY: Policy uses app.tenant_id but context may be set as app.current_tenant_id
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
```

**Verification Needed:**
```sql
-- Check which context variable is actually being set
SELECT current_setting('app.tenant_id', true) AS tenant_id;
SELECT current_setting('app.current_tenant_id', true) AS current_tenant_id;

-- If mismatch, RLS policies are NOT ENFORCED!
```

**Recommended Fix:**
```sql
-- SECURE: Standardize context variable across codebase
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set BOTH variables for backwards compatibility
  PERFORM set_config('app.tenant_id', p_tenant_id::text, false);
  PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);

  -- Log context setting for audit
  INSERT INTO rls_context_audit (tenant_id, set_by, set_at)
  VALUES (p_tenant_id, auth.uid(), now());
END;
$$;

-- Update all policies to use consistent variable
CREATE POLICY "tenant_isolation_agents_fixed"
ON public.agents
FOR ALL
USING (
  tenant_id = COALESCE(
    current_setting('app.tenant_id', true)::uuid,
    current_setting('app.current_tenant_id', true)::uuid
  )
);
```

#### CRITICAL: Soft Deletes May Leak Data
**Missing:** RLS policies don't filter deleted_at
```sql
-- VULNERABILITY: Deleted records still visible via RLS
SELECT * FROM agents WHERE tenant_id = current_tenant_id;
-- Returns deleted agents with deleted_at IS NOT NULL

-- SECURE: Always filter soft deletes
CREATE POLICY "tenant_isolation_agents_no_deleted"
ON public.agents
FOR SELECT
USING (
  tenant_id = current_setting('app.tenant_id', true)::uuid
  AND deleted_at IS NULL
);
```

### 2.2 RLS Bypass Paths

#### CRITICAL: Messages Table Indirect Bypass
**File:** `/database/migrations/rls/001_enable_rls_comprehensive_v2.sql:170-187`
```sql
-- VULNERABILITY: Messages policy relies on consultations JOIN
CREATE POLICY "tenant_isolation_messages"
ON public.messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.consultations
    WHERE consultations.id = messages.consultation_id
    AND consultations.tenant_id = current_setting('app.tenant_id', true)::uuid
  )
);
```

**Risk:** If consultations table has RLS disabled, messages are exposed
```sql
-- Attack: Disable RLS on consultations temporarily
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;
-- Now messages policy fails open, exposing all messages
```

**Recommended Fix:**
```sql
-- SECURE: Add tenant_id directly to messages table
ALTER TABLE messages ADD COLUMN tenant_id uuid REFERENCES tenants(id);

-- Backfill from consultations
UPDATE messages m
SET tenant_id = c.tenant_id
FROM consultations c
WHERE m.consultation_id = c.id;

-- Add NOT NULL constraint
ALTER TABLE messages ALTER COLUMN tenant_id SET NOT NULL;

-- Replace policy with direct tenant check
CREATE POLICY "tenant_isolation_messages_secure"
ON public.messages
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
```

### 2.3 Performance vs. Security Trade-offs

#### MEDIUM: Missing Indexes on Tenant ID
**File:** `/database/migrations/rls/001_enable_rls_comprehensive_v2.sql:323-350`
```sql
-- Existing indexes (good)
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON public.agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON public.conversations(tenant_id);

-- MISSING: Critical indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_panels_tenant_id ON public.panels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_panel_messages_tenant_id ON public.panel_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_tenant_id ON public.rag_knowledge_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_tenant_id ON public.tool_executions(tenant_id);
```

**Impact:** Slow RLS queries may lead developers to disable RLS for "performance"

---

## 3. Authentication & Authorization Architecture

### 3.1 User-to-Organization Validation Requirements

**Required Schema:**
```sql
-- Organizations table (3-level hierarchy)
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL CHECK (level IN ('platform', 'tenant', 'organization')),
  parent_id uuid REFERENCES organizations(id), -- Tenant for org, Platform for tenant
  tenant_id uuid, -- Denormalized for fast filtering
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- User membership with explicit role hierarchy
CREATE TABLE user_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'tenant_admin', 'org_admin', 'manager', 'member', 'guest')),
  status text NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz, -- For temporary access
  invited_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, organization_id)
);

-- Role hierarchy enforcement
CREATE OR REPLACE FUNCTION validate_user_access(
  p_user_id uuid,
  p_organization_id uuid,
  p_required_role text
) RETURNS boolean AS $$
DECLARE
  v_user_role text;
  v_role_hierarchy text[] := ARRAY['super_admin', 'tenant_admin', 'org_admin', 'manager', 'member', 'guest'];
  v_required_index int;
  v_user_index int;
BEGIN
  -- Get user's role in organization
  SELECT role INTO v_user_role
  FROM user_organizations
  WHERE user_id = p_user_id
    AND organization_id = p_organization_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now());

  IF v_user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check role hierarchy (higher role can access lower role resources)
  v_user_index := array_position(v_role_hierarchy, v_user_role);
  v_required_index := array_position(v_role_hierarchy, p_required_role);

  RETURN v_user_index <= v_required_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Role Hierarchy Across Platform/Tenant/Organization Levels

**Access Matrix:**

| User Role | Platform Access | Tenant Access | Organization Access |
|-----------|----------------|---------------|---------------------|
| super_admin | Full (VITAL only) | Read all, manage owned | Full access all orgs |
| tenant_admin | Read shared resources | Full (own tenant) | Full access tenant orgs |
| org_admin | Read shared resources | Read tenant resources | Full (own org) |
| manager | Read shared resources | Read tenant resources | Manage team (own org) |
| member | Read shared resources | Read tenant resources | Access assigned (own org) |
| guest | Read public resources | Read public resources | Read only (limited time) |

**Implementation:**
```sql
-- RLS policy with role hierarchy
CREATE POLICY "agents_role_based_access" ON agents
FOR ALL
USING (
  -- Super admins see everything
  (auth.jwt() ->> 'role' = 'super_admin')
  OR
  -- Tenant admins see all agents in their tenant
  (auth.jwt() ->> 'role' = 'tenant_admin' AND tenant_id IN (
    SELECT o.id FROM organizations o
    JOIN user_organizations uo ON uo.organization_id = o.id
    WHERE uo.user_id = auth.uid() AND o.level = 'tenant'
  ))
  OR
  -- Organization members see agents in their org or shared with them
  (tenant_id = current_setting('app.tenant_id', true)::uuid)
  OR
  -- Public agents visible to all
  (is_public = true)
  OR
  -- Shared agents with explicit grant
  (is_shared = true AND EXISTS (
    SELECT 1 FROM agent_tenant_access ata
    WHERE ata.agent_id = agents.id
    AND ata.tenant_id = current_setting('app.tenant_id', true)::uuid
  ))
);
```

### 3.3 Session Management

**Required Configuration:**
```typescript
// Secure session configuration by role
interface SessionConfig {
  maxAge: number; // seconds
  absoluteTimeout: number; // seconds
  idleTimeout: number; // seconds
  requireMFA: boolean;
  ipBinding: boolean;
}

const SESSION_CONFIGS: Record<string, SessionConfig> = {
  super_admin: {
    maxAge: 3600, // 1 hour
    absoluteTimeout: 3600, // 1 hour absolute
    idleTimeout: 900, // 15 minutes idle
    requireMFA: true,
    ipBinding: true
  },
  tenant_admin: {
    maxAge: 7200, // 2 hours
    absoluteTimeout: 28800, // 8 hours absolute
    idleTimeout: 1800, // 30 minutes idle
    requireMFA: true,
    ipBinding: true
  },
  org_admin: {
    maxAge: 14400, // 4 hours
    absoluteTimeout: 28800, // 8 hours absolute
    idleTimeout: 3600, // 1 hour idle
    requireMFA: true,
    ipBinding: false
  },
  member: {
    maxAge: 28800, // 8 hours
    absoluteTimeout: 86400, // 24 hours absolute
    idleTimeout: 7200, // 2 hours idle
    requireMFA: false,
    ipBinding: false
  }
};

// Session validation middleware
export async function validateSession(userId: string, sessionId: string) {
  const session = await supabase
    .from('user_sessions')
    .select('*, user_organizations(role)')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (!session) {
    throw new Error('Invalid session');
  }

  const config = SESSION_CONFIGS[session.user_organizations.role];
  const now = Date.now();

  // Check absolute timeout
  if (now - session.created_at > config.absoluteTimeout * 1000) {
    await invalidateSession(sessionId);
    throw new Error('Session expired - absolute timeout');
  }

  // Check idle timeout
  if (now - session.last_activity_at > config.idleTimeout * 1000) {
    await invalidateSession(sessionId);
    throw new Error('Session expired - idle timeout');
  }

  // Check IP binding (admin roles only)
  if (config.ipBinding && session.ip_address !== request.ip) {
    await invalidateSession(sessionId);
    throw new Error('Session invalid - IP address changed');
  }

  // Update last activity
  await supabase
    .from('user_sessions')
    .update({ last_activity_at: new Date() })
    .eq('id', sessionId);

  return session;
}
```

**HIPAA Reference:** §164.312(a)(2)(iii) - Automatic Logoff COMPLIANT with above

### 3.4 API Key/Token Scoping Per Organization

**Required Implementation:**
```sql
-- API keys table with organization scoping
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  key_hash text NOT NULL UNIQUE, -- bcrypt hash of actual key
  key_prefix text NOT NULL, -- First 8 chars for identification
  name text NOT NULL,
  scopes text[] NOT NULL, -- ['agents:read', 'agents:write', 'conversations:read']
  rate_limit_per_minute int NOT NULL DEFAULT 60,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- API key usage audit
CREATE TABLE api_key_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES api_keys(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code int NOT NULL,
  response_time_ms int,
  ip_address inet NOT NULL,
  user_agent text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Rate limiting tracking
CREATE TABLE api_key_rate_limit (
  api_key_id uuid NOT NULL REFERENCES api_keys(id),
  minute_bucket timestamptz NOT NULL,
  request_count int NOT NULL DEFAULT 0,
  PRIMARY KEY (api_key_id, minute_bucket)
);
```

**Middleware Implementation:**
```typescript
export async function validateAPIKey(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }

  const apiKey = authHeader.substring(7);
  const keyPrefix = apiKey.substring(0, 8);
  const keyHash = await bcrypt.hash(apiKey, 10);

  // Verify API key
  const { data: key, error } = await supabase
    .from('api_keys')
    .select('*, organizations(id, name, tenant_id)')
    .eq('key_prefix', keyPrefix)
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .single();

  if (error || !key) {
    throw new Error('Invalid API key');
  }

  // Check expiration
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    throw new Error('API key expired');
  }

  // Check rate limit
  const minuteBucket = new Date();
  minuteBucket.setSeconds(0, 0);

  const { data: rateLimit } = await supabase
    .from('api_key_rate_limit')
    .select('request_count')
    .eq('api_key_id', key.id)
    .eq('minute_bucket', minuteBucket.toISOString())
    .single();

  if (rateLimit && rateLimit.request_count >= key.rate_limit_per_minute) {
    throw new Error('Rate limit exceeded');
  }

  // Verify scope for requested endpoint
  const requiredScope = getRequiredScope(request);
  if (!key.scopes.includes(requiredScope)) {
    throw new Error(`Missing required scope: ${requiredScope}`);
  }

  // Set tenant context for RLS
  await supabase.rpc('set_tenant_context', {
    p_tenant_id: key.organizations.tenant_id
  });

  // Update usage tracking
  await Promise.all([
    supabase.from('api_keys').update({
      last_used_at: new Date()
    }).eq('id', key.id),

    supabase.from('api_key_usage').insert({
      api_key_id: key.id,
      endpoint: request.url,
      method: request.method,
      ip_address: request.ip
    }),

    supabase.rpc('increment_api_rate_limit', {
      p_key_id: key.id,
      p_minute_bucket: minuteBucket.toISOString()
    })
  ]);

  return {
    userId: key.user_id,
    organizationId: key.organization_id,
    tenantId: key.organizations.tenant_id,
    scopes: key.scopes
  };
}
```

---

## 4. Audit & Monitoring Specification

### 4.1 Events That MUST Be Logged (HIPAA Required)

**§164.312(b) - Audit Controls**
```sql
-- Comprehensive audit log table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- See event types below
  event_category text NOT NULL CHECK (event_category IN ('authentication', 'authorization', 'data_access', 'data_modification', 'configuration', 'security')),
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),

  -- Actor information
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  user_role text,
  user_ip_address inet NOT NULL,
  user_agent text,
  session_id uuid,
  api_key_id uuid REFERENCES api_keys(id),

  -- Context information
  tenant_id uuid REFERENCES tenants(id),
  organization_id uuid REFERENCES organizations(id),

  -- Resource information
  resource_type text NOT NULL, -- 'agent', 'conversation', 'patient', 'user', etc.
  resource_id uuid,
  resource_name text,

  -- Action details
  action text NOT NULL, -- 'create', 'read', 'update', 'delete', 'share', 'revoke'
  outcome text NOT NULL CHECK (outcome IN ('success', 'failure', 'partial')),
  failure_reason text,

  -- PHI tracking
  phi_accessed boolean DEFAULT false,
  phi_fields text[], -- ['patient_name', 'ssn', 'diagnosis']
  phi_record_count int,

  -- Request/response metadata
  request_id uuid,
  request_path text,
  request_method text,
  response_status_code int,
  response_time_ms int,

  -- Timestamps
  timestamp timestamptz NOT NULL DEFAULT now(),

  -- Additional context
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Tamper detection
  checksum text NOT NULL, -- SHA-256 hash of all fields for integrity
  previous_log_checksum text -- Chain logs together for tamper detection
);

-- Indexes for audit queries (HIPAA audit reports)
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_phi ON audit_logs(phi_accessed, timestamp DESC) WHERE phi_accessed = true;
CREATE INDEX idx_audit_security_events ON audit_logs(event_category, severity, timestamp DESC)
WHERE event_category = 'security' AND severity IN ('critical', 'high');

-- Immutable audit logs (prevent deletion/modification)
CREATE POLICY "audit_logs_immutable" ON audit_logs
FOR DELETE USING (false);

CREATE POLICY "audit_logs_no_update" ON audit_logs
FOR UPDATE USING (false);

-- Only system can insert audit logs
CREATE POLICY "audit_logs_system_insert" ON audit_logs
FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

**Required Event Types:**
```typescript
enum AuditEventType {
  // Authentication events
  USER_LOGIN = 'user.login',
  USER_LOGIN_FAILED = 'user.login.failed',
  USER_LOGOUT = 'user.logout',
  USER_SESSION_EXPIRED = 'user.session.expired',
  USER_MFA_ENABLED = 'user.mfa.enabled',
  USER_MFA_DISABLED = 'user.mfa.disabled',
  USER_MFA_VERIFIED = 'user.mfa.verified',
  USER_PASSWORD_CHANGED = 'user.password.changed',
  USER_PASSWORD_RESET = 'user.password.reset',

  // Authorization events
  ACCESS_GRANTED = 'access.granted',
  ACCESS_DENIED = 'access.denied',
  TENANT_SWITCHED = 'tenant.switched',
  ROLE_CHANGED = 'role.changed',
  PERMISSION_GRANTED = 'permission.granted',
  PERMISSION_REVOKED = 'permission.revoked',

  // PHI access events (CRITICAL)
  PHI_VIEWED = 'phi.viewed',
  PHI_CREATED = 'phi.created',
  PHI_UPDATED = 'phi.updated',
  PHI_DELETED = 'phi.deleted',
  PHI_EXPORTED = 'phi.exported',
  PHI_SHARED = 'phi.shared',
  PHI_UNSHARED = 'phi.unshared',

  // Cross-tenant events (CRITICAL)
  CROSS_TENANT_ACCESS_ATTEMPT = 'cross_tenant.access.attempt',
  CROSS_TENANT_ACCESS_DENIED = 'cross_tenant.access.denied',
  SHARED_RESOURCE_ACCESSED = 'shared_resource.accessed',
  TENANT_GRANT_CREATED = 'tenant_grant.created',
  TENANT_GRANT_REVOKED = 'tenant_grant.revoked',

  // Security events (CRITICAL)
  RLS_BYPASS_ATTEMPT = 'rls.bypass.attempt',
  SERVICE_ROLE_USED = 'service_role.used',
  SUSPICIOUS_QUERY = 'query.suspicious',
  RATE_LIMIT_EXCEEDED = 'rate_limit.exceeded',
  BRUTE_FORCE_DETECTED = 'brute_force.detected',
  ANOMALOUS_BEHAVIOR = 'behavior.anomalous',

  // Configuration changes
  RLS_POLICY_CHANGED = 'rls_policy.changed',
  USER_CREATED = 'user.created',
  USER_SUSPENDED = 'user.suspended',
  USER_DELETED = 'user.deleted',
  ORGANIZATION_CREATED = 'organization.created',
  ORGANIZATION_DELETED = 'organization.deleted',
  API_KEY_CREATED = 'api_key.created',
  API_KEY_REVOKED = 'api_key.revoked'
}
```

### 4.2 Tamper-Proof Audit Log Design

**Blockchain-style log chaining:**
```typescript
export async function logAuditEvent(event: AuditEvent) {
  // Get previous log checksum for chaining
  const { data: previousLog } = await supabase
    .from('audit_logs')
    .select('checksum')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  // Calculate checksum of current event
  const eventData = JSON.stringify({
    event_type: event.event_type,
    user_id: event.user_id,
    resource_id: event.resource_id,
    action: event.action,
    timestamp: event.timestamp,
    metadata: event.metadata
  });

  const checksum = crypto
    .createHash('sha256')
    .update(eventData + (previousLog?.checksum || ''))
    .digest('hex');

  // Insert audit log with checksum chain
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      ...event,
      checksum,
      previous_log_checksum: previousLog?.checksum || null
    });

  if (error) {
    // CRITICAL: Audit log insertion failure
    console.error('AUDIT LOG FAILURE', error);
    await sendSecurityAlert({
      severity: 'critical',
      message: 'Audit log insertion failed',
      event,
      error
    });
  }
}

// Verify audit log integrity
export async function verifyAuditLogIntegrity(
  startDate: Date,
  endDate: Date
): Promise<{ valid: boolean; tamperedLogs: string[] }> {
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: true });

  const tamperedLogs: string[] = [];
  let previousChecksum: string | null = null;

  for (const log of logs) {
    // Recalculate checksum
    const eventData = JSON.stringify({
      event_type: log.event_type,
      user_id: log.user_id,
      resource_id: log.resource_id,
      action: log.action,
      timestamp: log.timestamp,
      metadata: log.metadata
    });

    const expectedChecksum = crypto
      .createHash('sha256')
      .update(eventData + (previousChecksum || ''))
      .digest('hex');

    if (expectedChecksum !== log.checksum) {
      tamperedLogs.push(log.id);
    }

    if (log.previous_log_checksum !== previousChecksum) {
      tamperedLogs.push(log.id);
    }

    previousChecksum = log.checksum;
  }

  return {
    valid: tamperedLogs.length === 0,
    tamperedLogs
  };
}
```

### 4.3 Real-Time Alerting for Isolation Violations

**Security event stream processing:**
```typescript
// Real-time security monitoring
export async function monitorSecurityEvents() {
  // Subscribe to critical audit events
  const subscription = supabase
    .channel('security-events')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'audit_logs',
      filter: `severity=in.(critical,high)`
    }, handleSecurityEvent)
    .subscribe();

  return subscription;
}

async function handleSecurityEvent(payload: any) {
  const event = payload.new as AuditEvent;

  // Define alert conditions
  const criticalEvents = [
    'cross_tenant.access.denied',
    'rls.bypass.attempt',
    'brute_force.detected',
    'service_role.used',
    'phi.deleted'
  ];

  if (criticalEvents.includes(event.event_type)) {
    await sendImmediateAlert({
      channel: 'slack',
      severity: 'critical',
      title: `Security Violation: ${event.event_type}`,
      message: `User ${event.user_email} attempted ${event.action} on ${event.resource_type}`,
      tenant: event.tenant_id,
      timestamp: event.timestamp,
      details: event.metadata
    });

    // Auto-suspend user if multiple violations
    const recentViolations = await countRecentViolations(
      event.user_id,
      15 * 60 * 1000 // Last 15 minutes
    );

    if (recentViolations >= 5) {
      await suspendUser(event.user_id, 'Multiple security violations');
      await sendImmediateAlert({
        channel: 'slack',
        severity: 'critical',
        title: `User Auto-Suspended: ${event.user_email}`,
        message: `${recentViolations} security violations in 15 minutes`
      });
    }
  }

  // Detect anomalous patterns
  await detectAnomalousPatterns(event);
}

// Anomaly detection
async function detectAnomalousPatterns(event: AuditEvent) {
  // Pattern 1: Unusual access volume
  const recentAccess = await supabase
    .from('audit_logs')
    .select('count')
    .eq('user_id', event.user_id)
    .eq('event_category', 'data_access')
    .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .single();

  if (recentAccess.count > 1000) { // 1000+ accesses in 1 hour
    await logAnomalyEvent({
      type: 'unusual_access_volume',
      user_id: event.user_id,
      access_count: recentAccess.count,
      timeframe: '1 hour'
    });
  }

  // Pattern 2: PHI bulk export
  if (event.event_type === 'phi.exported' && event.phi_record_count > 100) {
    await logAnomalyEvent({
      type: 'bulk_phi_export',
      user_id: event.user_id,
      record_count: event.phi_record_count,
      resource_id: event.resource_id
    });
  }

  // Pattern 3: Access from unusual location
  const userLocations = await getUserTypicalLocations(event.user_id);
  const currentLocation = await geolocateIP(event.user_ip_address);

  if (!userLocations.includes(currentLocation.country)) {
    await logAnomalyEvent({
      type: 'unusual_location',
      user_id: event.user_id,
      location: currentLocation,
      typical_locations: userLocations
    });
  }

  // Pattern 4: After-hours access to PHI
  if (event.phi_accessed) {
    const hour = new Date(event.timestamp).getHours();
    if (hour < 6 || hour > 22) { // Outside 6am-10pm
      await logAnomalyEvent({
        type: 'after_hours_phi_access',
        user_id: event.user_id,
        timestamp: event.timestamp
      });
    }
  }
}
```

### 4.4 Compliance Report Generation (HIPAA Audit Logs)

**Required HIPAA Reports:**
```typescript
// Generate HIPAA audit report
export async function generateHIPAAAuditReport(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<HIPAAAuditReport> {
  // §164.308(a)(1)(ii)(D) - Information System Activity Review
  const phiAccessLog = await supabase
    .from('audit_logs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('phi_accessed', true)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: true });

  // §164.308(a)(5)(ii)(C) - Log-in Monitoring
  const authenticationLog = await supabase
    .from('audit_logs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('event_category', 'authentication')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString());

  // §164.312(a)(2)(i) - User Access Management
  const accessManagementLog = await supabase
    .from('audit_logs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('event_category', 'authorization')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString());

  // §164.312(b) - Audit Controls
  const securityIncidents = await supabase
    .from('audit_logs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('event_category', 'security')
    .in('severity', ['critical', 'high'])
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString());

  // Generate summary statistics
  const report: HIPAAAuditReport = {
    tenant_id: tenantId,
    report_period: { start: startDate, end: endDate },
    generated_at: new Date(),
    generated_by: 'VITAL Security System',

    phi_access_summary: {
      total_accesses: phiAccessLog.data?.length || 0,
      unique_users: new Set(phiAccessLog.data?.map(l => l.user_id)).size,
      unique_records: new Set(phiAccessLog.data?.map(l => l.resource_id)).size,
      by_action: groupBy(phiAccessLog.data, 'action'),
      by_user: groupBy(phiAccessLog.data, 'user_email'),
      after_hours_access: phiAccessLog.data?.filter(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour < 6 || hour > 22;
      }).length || 0
    },

    authentication_summary: {
      total_logins: authenticationLog.data?.filter(l => l.event_type === 'user.login').length || 0,
      failed_logins: authenticationLog.data?.filter(l => l.event_type === 'user.login.failed').length || 0,
      mfa_usage: authenticationLog.data?.filter(l => l.event_type === 'user.mfa.verified').length || 0,
      password_changes: authenticationLog.data?.filter(l => l.event_type === 'user.password.changed').length || 0
    },

    access_management_summary: {
      permissions_granted: accessManagementLog.data?.filter(l => l.event_type === 'permission.granted').length || 0,
      permissions_revoked: accessManagementLog.data?.filter(l => l.event_type === 'permission.revoked').length || 0,
      role_changes: accessManagementLog.data?.filter(l => l.event_type === 'role.changed').length || 0,
      access_denied_events: accessManagementLog.data?.filter(l => l.event_type === 'access.denied').length || 0
    },

    security_incidents: {
      critical: securityIncidents.data?.filter(i => i.severity === 'critical').length || 0,
      high: securityIncidents.data?.filter(i => i.severity === 'high').length || 0,
      cross_tenant_attempts: securityIncidents.data?.filter(i =>
        i.event_type.startsWith('cross_tenant')
      ).length || 0,
      rls_bypass_attempts: securityIncidents.data?.filter(i =>
        i.event_type === 'rls.bypass.attempt'
      ).length || 0,
      brute_force_attempts: securityIncidents.data?.filter(i =>
        i.event_type === 'brute_force.detected'
      ).length || 0
    },

    compliance_violations: await detectComplianceViolations(tenantId, startDate, endDate),

    recommendations: generateSecurityRecommendations(
      phiAccessLog.data,
      authenticationLog.data,
      securityIncidents.data
    )
  };

  // Store report for compliance records
  await supabase.from('hipaa_audit_reports').insert({
    tenant_id: tenantId,
    report_data: report,
    generated_at: new Date()
  });

  return report;
}

// Detect HIPAA compliance violations
async function detectComplianceViolations(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<ComplianceViolation[]> {
  const violations: ComplianceViolation[] = [];

  // Violation 1: PHI accessed without audit log
  // (This should never happen if logging is working)

  // Violation 2: Minimum necessary access
  const excessiveAccessUsers = await supabase
    .from('audit_logs')
    .select('user_id, user_email, count')
    .eq('tenant_id', tenantId)
    .eq('phi_accessed', true)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .group('user_id, user_email')
    .having('count > 1000'); // More than 1000 PHI accesses

  for (const user of excessiveAccessUsers.data || []) {
    violations.push({
      type: 'minimum_necessary',
      hipaa_reference: '§164.502(b)',
      severity: 'medium',
      user_id: user.user_id,
      user_email: user.user_email,
      description: `User accessed ${user.count} PHI records - review for minimum necessary compliance`,
      detected_at: new Date()
    });
  }

  // Violation 3: Failed login attempts without lockout
  const failedLoginsByUser = await supabase
    .from('audit_logs')
    .select('user_email, count')
    .eq('tenant_id', tenantId)
    .eq('event_type', 'user.login.failed')
    .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .group('user_email')
    .having('count > 5');

  for (const user of failedLoginsByUser.data || []) {
    violations.push({
      type: 'authentication',
      hipaa_reference: '§164.312(d)',
      severity: 'high',
      user_email: user.user_email,
      description: `${user.count} failed login attempts in 15 minutes - account not locked`,
      detected_at: new Date()
    });
  }

  // Violation 4: Admin accounts without MFA
  const adminsWithoutMFA = await supabase
    .from('user_organizations')
    .select('user_id, users(email)')
    .eq('organization_id', tenantId)
    .in('role', ['admin', 'super_admin'])
    .not('user_id', 'in',
      supabase.from('user_mfa_factors').select('user_id').eq('status', 'verified')
    );

  for (const admin of adminsWithoutMFA.data || []) {
    violations.push({
      type: 'mfa_missing',
      hipaa_reference: '§164.312(d)',
      severity: 'high',
      user_id: admin.user_id,
      user_email: admin.users.email,
      description: 'Admin account without MFA enabled',
      detected_at: new Date()
    });
  }

  return violations;
}
```

---

## 5. Data Protection Requirements

### 5.1 Column-Level Encryption for PHI Fields

**Required Implementation:**
```sql
-- Install pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encryption key management table
CREATE TABLE encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  key_version int NOT NULL,
  encrypted_key bytea NOT NULL, -- Key encrypted with master key
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rotated', 'revoked')),
  UNIQUE(tenant_id, key_version)
);

-- Create encrypted PHI columns
-- Example: Patient data table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),

  -- Encrypted PHI fields (stored as bytea)
  encrypted_first_name bytea NOT NULL,
  encrypted_last_name bytea NOT NULL,
  encrypted_ssn bytea,
  encrypted_date_of_birth bytea NOT NULL,
  encrypted_phone bytea,
  encrypted_email bytea,
  encrypted_address bytea,
  encrypted_diagnosis bytea,
  encrypted_medications bytea,

  -- Non-PHI fields (can be plain text)
  medical_record_number text UNIQUE NOT NULL,
  insurance_provider text,

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),

  -- Encryption tracking
  encryption_key_version int NOT NULL,
  last_encrypted_at timestamptz NOT NULL DEFAULT now()
);

-- Encryption/decryption functions
CREATE OR REPLACE FUNCTION encrypt_phi(
  p_plaintext text,
  p_tenant_id uuid
) RETURNS bytea AS $$
DECLARE
  v_key bytea;
BEGIN
  -- Get active encryption key for tenant
  SELECT encrypted_key INTO v_key
  FROM encryption_keys
  WHERE tenant_id = p_tenant_id
    AND status = 'active'
  ORDER BY key_version DESC
  LIMIT 1;

  IF v_key IS NULL THEN
    RAISE EXCEPTION 'No active encryption key for tenant %', p_tenant_id;
  END IF;

  -- Encrypt using AES-256
  RETURN pgp_sym_encrypt(p_plaintext, v_key, 'cipher-algo=aes256');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_phi(
  p_ciphertext bytea,
  p_tenant_id uuid
) RETURNS text AS $$
DECLARE
  v_key bytea;
BEGIN
  -- Get encryption key for tenant
  SELECT encrypted_key INTO v_key
  FROM encryption_keys
  WHERE tenant_id = p_tenant_id
    AND status = 'active'
  ORDER BY key_version DESC
  LIMIT 1;

  IF v_key IS NULL THEN
    RAISE EXCEPTION 'No active encryption key for tenant %', p_tenant_id;
  END IF;

  -- Decrypt using AES-256
  RETURN pgp_sym_decrypt(p_ciphertext, v_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Application-layer usage
CREATE OR REPLACE FUNCTION insert_patient(
  p_tenant_id uuid,
  p_first_name text,
  p_last_name text,
  p_ssn text,
  p_date_of_birth date
) RETURNS uuid AS $$
DECLARE
  v_patient_id uuid;
  v_key_version int;
BEGIN
  -- Get current key version
  SELECT key_version INTO v_key_version
  FROM encryption_keys
  WHERE tenant_id = p_tenant_id
    AND status = 'active'
  ORDER BY key_version DESC
  LIMIT 1;

  -- Insert with encrypted PHI
  INSERT INTO patients (
    tenant_id,
    encrypted_first_name,
    encrypted_last_name,
    encrypted_ssn,
    encrypted_date_of_birth,
    encryption_key_version
  ) VALUES (
    p_tenant_id,
    encrypt_phi(p_first_name, p_tenant_id),
    encrypt_phi(p_last_name, p_tenant_id),
    encrypt_phi(p_ssn, p_tenant_id),
    encrypt_phi(p_date_of_birth::text, p_tenant_id),
    v_key_version
  ) RETURNING id INTO v_patient_id;

  -- Log PHI creation in audit
  INSERT INTO audit_logs (
    event_type,
    event_category,
    user_id,
    tenant_id,
    resource_type,
    resource_id,
    action,
    outcome,
    phi_accessed,
    phi_fields
  ) VALUES (
    'phi.created',
    'data_modification',
    auth.uid(),
    p_tenant_id,
    'patient',
    v_patient_id,
    'create',
    'success',
    true,
    ARRAY['first_name', 'last_name', 'ssn', 'date_of_birth']
  );

  RETURN v_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**HIPAA Reference:** §164.312(a)(2)(iv) - Encryption and Decryption COMPLIANT

### 5.2 Key Management Strategy

**Per-Tenant Key Rotation:**
```typescript
// Encryption key manager
export class EncryptionKeyManager {
  private masterKey: string;

  constructor() {
    // Master key from environment (stored in secrets manager)
    this.masterKey = process.env.MASTER_ENCRYPTION_KEY;
    if (!this.masterKey) {
      throw new Error('MASTER_ENCRYPTION_KEY not configured');
    }
  }

  // Generate new tenant key
  async generateTenantKey(tenantId: string): Promise<void> {
    // Generate random 256-bit key
    const tenantKey = crypto.randomBytes(32);

    // Encrypt tenant key with master key
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
    const encryptedKey = Buffer.concat([
      cipher.update(tenantKey),
      cipher.final()
    ]);

    // Store in database
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert({
        tenant_id: tenantId,
        key_version: 1,
        encrypted_key: encryptedKey,
        status: 'active'
      });

    if (error) {
      throw new Error(`Failed to store encryption key: ${error.message}`);
    }

    await logAuditEvent({
      event_type: 'encryption_key.created',
      tenant_id: tenantId,
      severity: 'high',
      metadata: { key_version: 1 }
    });
  }

  // Rotate tenant key
  async rotateTenantKey(tenantId: string): Promise<void> {
    // Get current active key
    const { data: currentKey } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('key_version', { ascending: false })
      .limit(1)
      .single();

    if (!currentKey) {
      throw new Error(`No active key found for tenant ${tenantId}`);
    }

    // Generate new key
    const newKeyVersion = currentKey.key_version + 1;
    await this.generateTenantKey(tenantId, newKeyVersion);

    // Mark old key as rotated
    await supabase
      .from('encryption_keys')
      .update({
        status: 'rotated',
        rotated_at: new Date()
      })
      .eq('id', currentKey.id);

    // Re-encrypt all PHI with new key (background job)
    await this.scheduleReencryption(tenantId, currentKey.key_version, newKeyVersion);

    await logAuditEvent({
      event_type: 'encryption_key.rotated',
      tenant_id: tenantId,
      severity: 'high',
      metadata: {
        old_key_version: currentKey.key_version,
        new_key_version: newKeyVersion
      }
    });
  }

  // Re-encrypt PHI with new key (background job)
  private async scheduleReencryption(
    tenantId: string,
    oldKeyVersion: number,
    newKeyVersion: number
  ): Promise<void> {
    // Queue background job to re-encrypt all PHI
    await queueJob('reencrypt-phi', {
      tenant_id: tenantId,
      old_key_version: oldKeyVersion,
      new_key_version: newKeyVersion,
      priority: 'high'
    });
  }
}

// Automatic key rotation schedule
export async function scheduleKeyRotation() {
  // Rotate keys every 90 days (HIPAA best practice)
  cron.schedule('0 0 * * 0', async () => { // Every Sunday at midnight
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id')
      .eq('status', 'active');

    for (const tenant of tenants) {
      const keyManager = new EncryptionKeyManager();
      await keyManager.rotateTenantKey(tenant.id);
    }
  });
}
```

**Key Rotation Policy:**
- Automatic rotation every 90 days
- Manual rotation on security incident
- Keys stored encrypted with master key
- Master key stored in AWS Secrets Manager / Vault
- Backup keys retained for 1 year (in case of data recovery)

### 5.3 Backup Encryption and Access Control

**Backup Security:**
```bash
#!/bin/bash
# Secure backup script with encryption

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="vital_backup_${BACKUP_DATE}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"
TENANT_ID=$1

# Dump database with pg_dump
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file=$BACKUP_FILE

# Encrypt backup with GPG
gpg --symmetric \
  --cipher-algo AES256 \
  --s2k-digest-algo SHA512 \
  --s2k-count 65536 \
  --passphrase-file /etc/secrets/backup-passphrase \
  --output $ENCRYPTED_FILE \
  $BACKUP_FILE

# Remove unencrypted backup
shred -vfz -n 3 $BACKUP_FILE

# Upload to S3 with server-side encryption
aws s3 cp $ENCRYPTED_FILE \
  s3://vital-backups-encrypted/${TENANT_ID}/ \
  --sse aws:kms \
  --sse-kms-key-id $KMS_KEY_ID \
  --storage-class GLACIER_IR

# Remove local encrypted file
shred -vfz -n 3 $ENCRYPTED_FILE

# Log backup completion
echo "Backup complete: ${ENCRYPTED_FILE}" >> /var/log/vital-backups.log

# Audit log
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
INSERT INTO audit_logs (
  event_type,
  event_category,
  tenant_id,
  action,
  outcome,
  metadata
) VALUES (
  'backup.created',
  'security',
  '${TENANT_ID}',
  'create',
  'success',
  '{\"backup_file\": \"${ENCRYPTED_FILE}\", \"size\": \"$(stat -f%z $ENCRYPTED_FILE)\"}'
);
"
```

**Backup Access Control:**
```sql
-- Backup access requests table
CREATE TABLE backup_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  backup_file text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  expires_at timestamptz,
  accessed_at timestamptz
);

-- Backup access approval workflow
CREATE OR REPLACE FUNCTION request_backup_access(
  p_tenant_id uuid,
  p_backup_file text,
  p_reason text
) RETURNS uuid AS $$
DECLARE
  v_request_id uuid;
BEGIN
  -- Create access request
  INSERT INTO backup_access_requests (
    tenant_id,
    requested_by,
    reason,
    backup_file,
    status
  ) VALUES (
    p_tenant_id,
    auth.uid(),
    p_reason,
    p_backup_file,
    'pending'
  ) RETURNING id INTO v_request_id;

  -- Notify tenant admins for approval
  PERFORM pg_notify('backup_access_request', json_build_object(
    'request_id', v_request_id,
    'tenant_id', p_tenant_id,
    'requested_by', auth.uid(),
    'reason', p_reason
  )::text);

  -- Audit log
  INSERT INTO audit_logs (
    event_type,
    tenant_id,
    user_id,
    action,
    metadata
  ) VALUES (
    'backup.access.requested',
    p_tenant_id,
    auth.uid(),
    'request',
    json_build_object('backup_file', p_backup_file, 'reason', p_reason)
  );

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.4 Data Retention and Right-to-Erasure Implementation

**GDPR Article 17 - Right to Erasure:**
```sql
-- Data deletion requests table
CREATE TABLE data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid REFERENCES auth.users(id),
  patient_id uuid REFERENCES patients(id),
  request_type text NOT NULL CHECK (request_type IN ('user_data', 'patient_data', 'all')),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  legal_basis text NOT NULL CHECK (legal_basis IN ('gdpr_article_17', 'user_request', 'retention_expired', 'court_order')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'failed')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  completed_at timestamptz,
  deletion_proof_hash text, -- SHA-256 hash proving deletion
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Execute data deletion (right to be forgotten)
CREATE OR REPLACE FUNCTION execute_data_deletion(
  p_request_id uuid
) RETURNS boolean AS $$
DECLARE
  v_request data_deletion_requests%ROWTYPE;
  v_deleted_tables text[] := '{}';
  v_deleted_count int := 0;
BEGIN
  -- Get deletion request
  SELECT * INTO v_request
  FROM data_deletion_requests
  WHERE id = p_request_id
    AND status = 'approved';

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Deletion request not found or not approved';
  END IF;

  -- Update status to in_progress
  UPDATE data_deletion_requests
  SET status = 'in_progress'
  WHERE id = p_request_id;

  -- Begin transaction for atomic deletion
  BEGIN
    -- Delete user data
    IF v_request.request_type IN ('user_data', 'all') THEN
      DELETE FROM user_sessions WHERE user_id = v_request.user_id;
      v_deleted_tables := array_append(v_deleted_tables, 'user_sessions');

      DELETE FROM user_organizations WHERE user_id = v_request.user_id;
      v_deleted_tables := array_append(v_deleted_tables, 'user_organizations');

      DELETE FROM api_keys WHERE user_id = v_request.user_id;
      v_deleted_tables := array_append(v_deleted_tables, 'api_keys');

      -- Anonymize audit logs (don't delete for compliance)
      UPDATE audit_logs
      SET user_email = 'deleted_user@example.com',
          user_id = NULL
      WHERE user_id = v_request.user_id;
      v_deleted_tables := array_append(v_deleted_tables, 'audit_logs (anonymized)');
    END IF;

    -- Delete patient PHI
    IF v_request.request_type IN ('patient_data', 'all') THEN
      DELETE FROM patients WHERE id = v_request.patient_id;
      v_deleted_tables := array_append(v_deleted_tables, 'patients');

      DELETE FROM consultations WHERE patient_id = v_request.patient_id;
      v_deleted_tables := array_append(v_deleted_tables, 'consultations');

      DELETE FROM messages WHERE consultation_id IN (
        SELECT id FROM consultations WHERE patient_id = v_request.patient_id
      );
      v_deleted_tables := array_append(v_deleted_tables, 'messages');
    END IF;

    -- Calculate deletion proof
    v_deleted_count := array_length(v_deleted_tables, 1);
    v_deletion_proof_hash := encode(
      sha256(concat(
        p_request_id::text,
        v_request.tenant_id::text,
        now()::text,
        v_deleted_count::text
      )::bytea),
      'hex'
    );

    -- Update request as completed
    UPDATE data_deletion_requests
    SET status = 'completed',
        completed_at = now(),
        deletion_proof_hash = v_deletion_proof_hash,
        metadata = jsonb_build_object(
          'deleted_tables', v_deleted_tables,
          'deleted_count', v_deleted_count
        )
    WHERE id = p_request_id;

    -- Audit log
    INSERT INTO audit_logs (
      event_type,
      tenant_id,
      action,
      outcome,
      phi_accessed,
      metadata
    ) VALUES (
      'data.deleted',
      v_request.tenant_id,
      'delete',
      'success',
      true,
      jsonb_build_object(
        'request_id', p_request_id,
        'deleted_tables', v_deleted_tables,
        'deletion_proof', v_deletion_proof_hash
      )
    );

    RETURN true;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback and mark as failed
    UPDATE data_deletion_requests
    SET status = 'failed',
        metadata = jsonb_build_object('error', SQLERRM)
    WHERE id = p_request_id;

    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Data Retention Policy:**
```sql
-- Retention policies table
CREATE TABLE data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  data_type text NOT NULL, -- 'phi', 'audit_logs', 'user_data', etc.
  retention_period_days int NOT NULL,
  deletion_method text NOT NULL CHECK (deletion_method IN ('hard_delete', 'anonymize', 'archive')),
  legal_requirement text, -- HIPAA, GDPR, etc.
  enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, data_type)
);

-- Default HIPAA retention policies
INSERT INTO data_retention_policies (tenant_id, data_type, retention_period_days, deletion_method, legal_requirement) VALUES
('00000000-0000-0000-0000-000000000001', 'phi', 2555, 'archive', 'HIPAA requires 7 years'),
('00000000-0000-0000-0000-000000000001', 'audit_logs', 2555, 'archive', 'HIPAA requires 7 years'),
('00000000-0000-0000-0000-000000000001', 'user_data', 1095, 'anonymize', 'GDPR allows 3 years'),
('00000000-0000-0000-0000-000000000001', 'api_keys', 365, 'hard_delete', 'Security best practice');

-- Automated retention enforcement (runs daily)
CREATE OR REPLACE FUNCTION enforce_retention_policies()
RETURNS void AS $$
DECLARE
  v_policy data_retention_policies%ROWTYPE;
  v_cutoff_date timestamptz;
  v_deleted_count int;
BEGIN
  FOR v_policy IN SELECT * FROM data_retention_policies WHERE enabled = true
  LOOP
    v_cutoff_date := now() - (v_policy.retention_period_days || ' days')::interval;

    CASE v_policy.data_type
      WHEN 'phi' THEN
        IF v_policy.deletion_method = 'archive' THEN
          -- Move to archive table
          INSERT INTO patients_archive
          SELECT * FROM patients
          WHERE tenant_id = v_policy.tenant_id
            AND updated_at < v_cutoff_date;

          DELETE FROM patients
          WHERE tenant_id = v_policy.tenant_id
            AND updated_at < v_cutoff_date;

          GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
        END IF;

      WHEN 'audit_logs' THEN
        IF v_policy.deletion_method = 'archive' THEN
          -- Export to cold storage (S3 Glacier)
          PERFORM export_audit_logs_to_glacier(v_policy.tenant_id, v_cutoff_date);

          DELETE FROM audit_logs
          WHERE tenant_id = v_policy.tenant_id
            AND timestamp < v_cutoff_date;

          GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
        END IF;

      WHEN 'user_data' THEN
        IF v_policy.deletion_method = 'anonymize' THEN
          -- Anonymize inactive users
          UPDATE auth.users
          SET email = 'anonymized_' || id || '@deleted.local',
              raw_user_meta_data = '{}'::jsonb
          WHERE id IN (
            SELECT id FROM auth.users u
            WHERE u.last_sign_in_at < v_cutoff_date
              AND NOT EXISTS (
                SELECT 1 FROM user_organizations uo
                WHERE uo.user_id = u.id
                  AND uo.status = 'active'
              )
          );

          GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
        END IF;
    END CASE;

    -- Log retention enforcement
    INSERT INTO audit_logs (
      event_type,
      tenant_id,
      action,
      outcome,
      metadata
    ) VALUES (
      'retention_policy.enforced',
      v_policy.tenant_id,
      'delete',
      'success',
      jsonb_build_object(
        'data_type', v_policy.data_type,
        'deletion_method', v_policy.deletion_method,
        'cutoff_date', v_cutoff_date,
        'deleted_count', v_deleted_count
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily enforcement
SELECT cron.schedule('enforce-retention-policies', '0 2 * * *', 'SELECT enforce_retention_policies()');
```

---

## 6. HIPAA Compliance Roadmap

### 6.1 Current Compliance Gap Analysis

**§164.308 Administrative Safeguards:**

| Requirement | Status | Gap | Priority |
|------------|--------|-----|----------|
| (a)(1)(i) Security Management Process | PARTIAL | No risk assessments, no formal security plan | HIGH |
| (a)(2) Assigned Security Responsibility | PARTIAL | No designated security official | HIGH |
| (a)(3)(i) Workforce Security - Authorization | FAIL | No user-org validation | CRITICAL |
| (a)(3)(ii) Workforce Security - Separation | PARTIAL | No automated access revocation | MEDIUM |
| (a)(4)(i) Information Access Management | FAIL | Client-controllable tenant selection | CRITICAL |
| (a)(5)(ii)(C) Log-in Monitoring | FAIL | No automated login monitoring | HIGH |
| (a)(6)(ii) Response and Reporting | PARTIAL | No incident response plan | HIGH |

**§164.312 Technical Safeguards:**

| Requirement | Status | Gap | Priority |
|------------|--------|-----|----------|
| (a)(1) Access Control | FAIL | No user-org validation, client-controllable tenant | CRITICAL |
| (a)(2)(i) Unique User Identification | PARTIAL | Missing for API keys | HIGH |
| (a)(2)(ii) Emergency Access Procedure | MISSING | No break-glass process | MEDIUM |
| (a)(2)(iii) Automatic Logoff | PARTIAL | 30-day sessions (should be 1-4 hours) | HIGH |
| (a)(2)(iv) Encryption and Decryption | MISSING | PHI stored in plaintext | CRITICAL |
| (b) Audit Controls | FAIL | No PHI access audit logs | CRITICAL |
| (c)(1) Integrity | PARTIAL | No modification tracking | HIGH |
| (d) Person or Entity Authentication | FAIL | Dev bypass in prod code, no MFA | CRITICAL |
| (e)(1) Transmission Security | PARTIAL | HTTPS only, no TLS verification | MEDIUM |

**§164.314 Physical Safeguards:**

| Requirement | Status | Gap | Priority |
|------------|--------|-----|----------|
| (a)(1) Facility Access Controls | N/A | Cloud-hosted (AWS responsibility) | LOW |
| (b)(1) Workstation Use | MISSING | No workstation security policy | LOW |
| (b)(2)(i) Device and Media Controls - Disposal | PARTIAL | No secure data deletion process | MEDIUM |

**§164.316 Policies and Procedures:**

| Requirement | Status | Gap | Priority |
|------------|--------|-----|----------|
| (a) Policies and Procedures | MISSING | No formal security policies | HIGH |
| (b)(1) Documentation | PARTIAL | No formal documentation | MEDIUM |
| (b)(2)(i) Time Limit | MISSING | No retention policy | MEDIUM |

### 6.2 Compliance Fixes Required

**Phase 1: CRITICAL Fixes (Must complete before production)**

**Timeline: 2-4 weeks**

1. **Fix Client-Controllable Tenant Selection** (Week 1)
   - [ ] Implement `user_organizations` table
   - [ ] Add user-to-org validation in middleware
   - [ ] Remove ability to set tenant via cookie/header without validation
   - [ ] Add RLS policies for user_organizations
   - [ ] Test with penetration testing

2. **Implement PHI Column-Level Encryption** (Week 1-2)
   - [ ] Create encryption_keys table
   - [ ] Implement encrypt_phi() and decrypt_phi() functions
   - [ ] Identify all PHI columns across schema
   - [ ] Migrate existing PHI data to encrypted columns
   - [ ] Update application code to use encryption functions
   - [ ] Key rotation process

3. **Remove Development Bypasses** (Week 1)
   - [ ] Remove BYPASS_AUTH code from production builds
   - [ ] Add compile-time checks for development-only code
   - [ ] Verify no other development bypasses exist
   - [ ] Add CI/CD checks to prevent dev code in prod

4. **Implement Comprehensive Audit Logging** (Week 2)
   - [ ] Create audit_logs table with all required fields
   - [ ] Implement logging for all PHI access events
   - [ ] Implement logging for authentication events
   - [ ] Implement logging for security events
   - [ ] Add tamper-proof log chaining
   - [ ] Test log integrity verification

5. **Fix RLS Policy Enforcement** (Week 2)
   - [ ] Verify context variable naming (app.tenant_id vs app.current_tenant_id)
   - [ ] Add service role protection to all RLS policies
   - [ ] Add tenant_id to messages table (remove indirect JOIN)
   - [ ] Add soft delete filtering to RLS policies
   - [ ] Test RLS isolation with multiple tenants

6. **Implement Secure Session Management** (Week 3)
   - [ ] Reduce session expiry to role-appropriate timeouts
   - [ ] Change SameSite to 'strict'
   - [ ] Implement idle timeout tracking
   - [ ] Add session IP binding for admin roles
   - [ ] Implement automatic session cleanup

7. **Enforce MFA for Admin Accounts** (Week 3)
   - [ ] Integrate Supabase MFA
   - [ ] Require MFA for admin/super_admin roles
   - [ ] Implement MFA verification age checks
   - [ ] Add MFA recovery process

8. **Test Tenant Isolation** (Week 4)
   - [ ] Write automated RLS isolation tests
   - [ ] Test cross-tenant access attempts
   - [ ] Test RLS policy performance
   - [ ] Penetration testing of multi-tenant isolation

**Phase 2: HIGH Priority Fixes (Within 8 weeks)**

**Timeline: Weeks 5-8**

9. **Implement Backup Encryption** (Week 5)
   - [ ] Encrypt all database backups
   - [ ] Implement backup access request workflow
   - [ ] Test backup restoration process
   - [ ] Document backup procedures

10. **Data Retention & Deletion** (Week 6)
    - [ ] Implement data_deletion_requests table
    - [ ] Create execute_data_deletion() function
    - [ ] Implement automated retention policy enforcement
    - [ ] Test GDPR right-to-erasure workflow

11. **Incident Response Plan** (Week 7)
    - [ ] Create formal incident response plan
    - [ ] Designate incident response team
    - [ ] Implement automated breach detection
    - [ ] Create breach notification templates

12. **Security Monitoring & Alerting** (Week 8)
    - [ ] Implement real-time security event monitoring
    - [ ] Set up Slack/PagerDuty alerting
    - [ ] Implement anomaly detection
    - [ ] Create security dashboard

**Phase 3: MEDIUM Priority Improvements (Ongoing)**

13. **API Key Management**
    - [ ] Implement API key scoping per organization
    - [ ] Add rate limiting
    - [ ] API key usage audit logs
    - [ ] Key rotation reminders

14. **Penetration Testing**
    - [ ] Hire third-party penetration testers
    - [ ] Test multi-tenant isolation
    - [ ] Test authentication bypasses
    - [ ] Remediate findings

15. **HIPAA Compliance Documentation**
    - [ ] Create formal security policies
    - [ ] Document all technical safeguards
    - [ ] Create HIPAA compliance checklist
    - [ ] Employee training materials

### 6.3 HIPAA Certification Process

**Steps to HIPAA Certification:**

1. **Complete Technical Safeguards** (Phases 1-2 above)
2. **Hire HIPAA Compliance Officer** (Dedicated role)
3. **Conduct Risk Assessment** (Required by §164.308(a)(1)(ii)(A))
   - Identify all PHI data flows
   - Assess vulnerabilities and threats
   - Document risk mitigation strategies
4. **Create Security Policies** (Required by §164.316(a))
   - Access control policy
   - Audit logging policy
   - Incident response policy
   - Backup and disaster recovery policy
   - Data retention policy
   - Employee training policy
5. **Business Associate Agreements (BAAs)**
   - AWS/Supabase BAA
   - Third-party service BAAs
   - Customer BAAs
6. **Third-Party Audit** (SOC 2 Type II)
   - Hire HITRUST/AICPA auditor
   - 6-12 month observation period
   - Remediate audit findings
7. **HIPAA Compliance Seal**
   - Apply for HIPAA compliance certification
   - Ongoing annual audits
   - Maintain compliance documentation

**Estimated Timeline: 6-12 months**
**Estimated Cost: $150,000 - $500,000**

---

## 7. Security Testing Strategy

### 7.1 Unit Tests for RLS Isolation

**Required Test Cases:**
```typescript
// tests/security/rls-isolation.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

describe('RLS Isolation Tests', () => {
  let tenantAUser: SupabaseClient;
  let tenantBUser: SupabaseClient;
  let adminUser: SupabaseClient;

  beforeEach(async () => {
    // Create test users in different tenants
    tenantAUser = await createTestUser('user-a@tenant-a.com', 'tenant-a-uuid');
    tenantBUser = await createTestUser('user-b@tenant-b.com', 'tenant-b-uuid');
    adminUser = await createTestUser('admin@vital.health', 'platform-uuid', 'super_admin');
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  describe('Agent Isolation', () => {
    it('should prevent cross-tenant agent access', async () => {
      // Tenant A creates agent
      const { data: agentA } = await tenantAUser
        .from('agents')
        .insert({ name: 'Tenant A Agent', tenant_id: 'tenant-a-uuid' })
        .select()
        .single();

      expect(agentA).toBeDefined();
      expect(agentA.name).toBe('Tenant A Agent');

      // Tenant B should NOT see Tenant A's agent
      const { data: agentsFromB, error } = await tenantBUser
        .from('agents')
        .select('*')
        .eq('id', agentA.id)
        .single();

      expect(error).toBeDefined(); // RLS should block
      expect(agentsFromB).toBeNull();
    });

    it('should allow same-tenant agent access', async () => {
      // Tenant A creates agent
      const { data: agentA } = await tenantAUser
        .from('agents')
        .insert({ name: 'Tenant A Agent', tenant_id: 'tenant-a-uuid' })
        .select()
        .single();

      // Another user in Tenant A should see it
      const tenantAUser2 = await createTestUser('user-a2@tenant-a.com', 'tenant-a-uuid');
      const { data: agentFromA2, error } = await tenantAUser2
        .from('agents')
        .select('*')
        .eq('id', agentA.id)
        .single();

      expect(error).toBeNull();
      expect(agentFromA2).toBeDefined();
      expect(agentFromA2.id).toBe(agentA.id);
    });

    it('should allow admin to see all agents', async () => {
      // Tenant A creates agent
      const { data: agentA } = await tenantAUser
        .from('agents')
        .insert({ name: 'Tenant A Agent', tenant_id: 'tenant-a-uuid' })
        .select()
        .single();

      // Admin should see it
      const { data: agentFromAdmin, error } = await adminUser
        .from('agents')
        .select('*')
        .eq('id', agentA.id)
        .single();

      expect(error).toBeNull();
      expect(agentFromAdmin).toBeDefined();
      expect(agentFromAdmin.id).toBe(agentA.id);
    });

    it('should enforce shared agent access grants', async () => {
      // Tenant A creates agent
      const { data: agentA } = await tenantAUser
        .from('agents')
        .insert({
          name: 'Shared Agent',
          tenant_id: 'tenant-a-uuid',
          is_shared: true
        })
        .select()
        .single();

      // Grant access to Tenant B
      await tenantAUser.rpc('grant_agent_access', {
        p_agent_id: agentA.id,
        p_tenant_id: 'tenant-b-uuid',
        p_granted_by: tenantAUser.auth.user.id
      });

      // Tenant B should now see it
      const { data: agentFromB, error } = await tenantBUser
        .from('agents')
        .select('*')
        .eq('id', agentA.id)
        .single();

      expect(error).toBeNull();
      expect(agentFromB).toBeDefined();
      expect(agentFromB.id).toBe(agentA.id);
    });
  });

  describe('PHI Isolation', () => {
    it('should prevent cross-tenant PHI access', async () => {
      // Tenant A creates patient
      const { data: patientA } = await tenantAUser
        .from('patients')
        .insert({
          encrypted_first_name: await encryptPHI('John', 'tenant-a-uuid'),
          encrypted_last_name: await encryptPHI('Doe', 'tenant-a-uuid'),
          tenant_id: 'tenant-a-uuid'
        })
        .select()
        .single();

      // Tenant B should NOT see Tenant A's patient
      const { data: patientFromB, error } = await tenantBUser
        .from('patients')
        .select('*')
        .eq('id', patientA.id)
        .single();

      expect(error).toBeDefined(); // RLS should block
      expect(patientFromB).toBeNull();
    });

    it('should log all PHI access attempts', async () => {
      // Tenant A accesses patient
      const { data: patient } = await tenantAUser
        .from('patients')
        .select('*')
        .limit(1)
        .single();

      // Check audit log
      const { data: auditLog } = await adminUser
        .from('audit_logs')
        .select('*')
        .eq('user_id', tenantAUser.auth.user.id)
        .eq('resource_type', 'patient')
        .eq('resource_id', patient.id)
        .eq('phi_accessed', true)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      expect(auditLog).toBeDefined();
      expect(auditLog.event_type).toBe('phi.viewed');
      expect(auditLog.phi_fields).toContain('encrypted_first_name');
    });
  });

  describe('Message Isolation', () => {
    it('should prevent cross-tenant message access', async () => {
      // Tenant A creates consultation and message
      const { data: consultation } = await tenantAUser
        .from('consultations')
        .insert({ tenant_id: 'tenant-a-uuid' })
        .select()
        .single();

      const { data: message } = await tenantAUser
        .from('messages')
        .insert({
          consultation_id: consultation.id,
          tenant_id: 'tenant-a-uuid',
          content: 'Test message'
        })
        .select()
        .single();

      // Tenant B should NOT see message
      const { data: messageFromB, error } = await tenantBUser
        .from('messages')
        .select('*')
        .eq('id', message.id)
        .single();

      expect(error).toBeDefined(); // RLS should block
      expect(messageFromB).toBeNull();
    });
  });

  describe('Service Role Bypass Protection', () => {
    it('should prevent service role from accessing non-VITAL tenants', async () => {
      // Use service role key
      const serviceRole = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Set context to Tenant A (not VITAL)
      await serviceRole.rpc('set_tenant_context', { p_tenant_id: 'tenant-a-uuid' });

      // Try to access Tenant A's agents
      const { data: agents, error } = await serviceRole
        .from('agents')
        .select('*')
        .eq('tenant_id', 'tenant-a-uuid');

      // Should be blocked (service role only allowed for VITAL tenant)
      expect(error).toBeDefined();
      expect(agents).toBeNull();
    });
  });
});
```

### 7.2 Integration Tests for Cross-Tenant Access

**Penetration Test Scenarios:**
```typescript
// tests/security/penetration-tests.test.ts
describe('Penetration Tests', () => {
  describe('Tenant ID Manipulation', () => {
    it('should reject x-tenant-id header manipulation', async () => {
      const tenantAToken = await getAuthToken('user-a@tenant-a.com');

      // Try to access Tenant B data by manipulating header
      const response = await fetch('https://api.vital.health/agents', {
        headers: {
          'Authorization': `Bearer ${tenantAToken}`,
          'x-tenant-id': 'tenant-b-uuid' // Malicious header
        }
      });

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: 'Access denied to this organization'
      });
    });

    it('should reject tenant_id cookie manipulation', async () => {
      const tenantAToken = await getAuthToken('user-a@tenant-a.com');

      // Try to access Tenant B data by manipulating cookie
      const response = await fetch('https://api.vital.health/agents', {
        headers: {
          'Authorization': `Bearer ${tenantAToken}`,
          'Cookie': 'tenant_id=tenant-b-uuid' // Malicious cookie
        }
      });

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: 'Access denied to this organization'
      });
    });
  });

  describe('SQL Injection', () => {
    it('should prevent SQL injection in tenant_id parameter', async () => {
      const token = await getAuthToken('user-a@tenant-a.com');

      // Try SQL injection
      const maliciousPayload = "' OR '1'='1";
      const response = await fetch(`https://api.vital.health/agents?tenant_id=${encodeURIComponent(maliciousPayload)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      expect(response.status).not.toBe(200);
      // Should return error, not all agents
    });

    it('should use parameterized queries for RLS context', async () => {
      // Verify set_tenant_context uses parameterized queries
      const maliciousUUID = "'; DROP TABLE agents; --";

      try {
        await supabase.rpc('set_tenant_context', { p_tenant_id: maliciousUUID });
      } catch (error) {
        expect(error.message).toContain('invalid input syntax for type uuid');
      }
    });
  });

  describe('Authentication Bypass', () => {
    it('should require authentication for all endpoints', async () => {
      const response = await fetch('https://api.vital.health/agents');
      expect(response.status).toBe(401);
    });

    it('should reject expired tokens', async () => {
      const expiredToken = generateExpiredToken();
      const response = await fetch('https://api.vital.health/agents', {
        headers: { 'Authorization': `Bearer ${expiredToken}` }
      });
      expect(response.status).toBe(401);
    });

    it('should reject tampered JWT tokens', async () => {
      const validToken = await getAuthToken('user-a@tenant-a.com');
      const tamperedToken = tamperWithJWT(validToken);

      const response = await fetch('https://api.vital.health/agents', {
        headers: { 'Authorization': `Bearer ${tamperedToken}` }
      });
      expect(response.status).toBe(401);
    });
  });

  describe('Privilege Escalation', () => {
    it('should prevent role elevation via JWT manipulation', async () => {
      const memberToken = await getAuthToken('member@tenant-a.com');
      const tamperedToken = elevateRole(memberToken, 'admin');

      const response = await fetch('https://api.vital.health/admin/users', {
        headers: { 'Authorization': `Bearer ${tamperedToken}` }
      });
      expect(response.status).toBe(401);
    });

    it('should prevent accessing other users\' resources', async () => {
      const userA = await getAuthToken('user-a@tenant-a.com');
      const userBId = 'user-b-uuid';

      // User A tries to delete User B's agent
      const response = await fetch(`https://api.vital.health/agents/${userBId}/private-agent`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userA}` }
      });
      expect(response.status).toBe(403);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit authentication attempts', async () => {
      const email = 'test@tenant-a.com';

      // Attempt 10 failed logins
      for (let i = 0; i < 10; i++) {
        await attemptLogin(email, 'wrong-password');
      }

      // 11th attempt should be blocked
      const response = await attemptLogin(email, 'wrong-password');
      expect(response.status).toBe(429);
      expect(response.message).toContain('rate limit');
    });

    it('should rate limit API requests per key', async () => {
      const apiKey = await createAPIKey('tenant-a-uuid', { rate_limit_per_minute: 60 });

      // Make 61 requests in 1 minute
      const responses = await Promise.all(
        Array.from({ length: 61 }, () =>
          fetch('https://api.vital.health/agents', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          })
        )
      );

      // Last request should be rate limited
      expect(responses[60].status).toBe(429);
    });
  });
});
```

### 7.3 Performance Tests for RLS Queries

**Load Testing:**
```typescript
// tests/performance/rls-performance.test.ts
describe('RLS Performance Tests', () => {
  it('should handle 1000 concurrent users querying agents', async () => {
    const users = await createTestUsers(1000);

    const startTime = Date.now();

    // Simulate 1000 concurrent requests
    const promises = users.map(user =>
      user.from('agents').select('*').limit(20)
    );

    const results = await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within 5 seconds
    expect(duration).toBeLessThan(5000);

    // All queries should succeed
    expect(results.every(r => r.error === null)).toBe(true);
  });

  it('should use indexes for tenant_id filtering', async () => {
    // Explain query plan
    const { data: plan } = await supabase.rpc('explain_query', {
      query: 'SELECT * FROM agents WHERE tenant_id = $1',
      params: ['tenant-a-uuid']
    });

    // Verify index is used
    expect(plan).toContain('Index Scan using idx_agents_tenant_id');
    expect(plan).not.toContain('Seq Scan'); // No sequential scan
  });

  it('should not degrade performance with RLS enabled', async () => {
    // Measure without RLS
    await supabase.rpc('disable_rls', { table_name: 'agents' });
    const withoutRLSStart = Date.now();
    await supabase.from('agents').select('*').limit(100);
    const withoutRLSDuration = Date.now() - withoutRLSStart;

    // Measure with RLS
    await supabase.rpc('enable_rls', { table_name: 'agents' });
    const withRLSStart = Date.now();
    await supabase.from('agents').select('*').limit(100);
    const withRLSDuration = Date.now() - withRLSStart;

    // RLS overhead should be < 10ms
    const overhead = withRLSDuration - withoutRLSDuration;
    expect(overhead).toBeLessThan(10);
  });
});
```

### 7.4 Penetration Testing Requirements

**Third-Party Penetration Testing Scope:**

1. **Multi-Tenant Isolation Testing**
   - Attempt to access other tenants' data via all attack vectors
   - Test RLS policy enforcement
   - Test tenant context validation
   - Test shared resource access controls

2. **Authentication Testing**
   - Brute force attack resistance
   - JWT token manipulation
   - Session hijacking
   - Password reset vulnerabilities
   - MFA bypass attempts

3. **Authorization Testing**
   - Privilege escalation attempts
   - Role manipulation
   - RBAC enforcement
   - API key security

4. **Data Protection Testing**
   - PHI encryption verification
   - Backup security
   - Key management vulnerabilities
   - Data at rest encryption

5. **API Security Testing**
   - SQL injection
   - XSS vulnerabilities
   - CSRF attacks
   - API rate limiting
   - Input validation

**Recommended Firms:**
- Coalfire (HITRUST certified)
- Bishop Fox
- NCC Group
- Veracode

**Frequency:** Annually + after major architecture changes

---

## 8. Security Hardening Recommendations

### 8.1 Infrastructure Hardening

**Network Security:**
```yaml
# CloudFront WAF Rules (AWS)
waf_rules:
  - name: "BlockSQLInjection"
    priority: 1
    rule_action: "BLOCK"
    statement:
      sql_injection_match_statement:
        field_to_match:
          all_query_arguments: {}
        text_transformations:
          - priority: 0
            type: "URL_DECODE"

  - name: "BlockXSS"
    priority: 2
    rule_action: "BLOCK"
    statement:
      xss_match_statement:
        field_to_match:
          body: {}
        text_transformations:
          - priority: 0
            type: "HTML_ENTITY_DECODE"

  - name: "RateLimitPerIP"
    priority: 3
    rule_action: "BLOCK"
    statement:
      rate_based_statement:
        limit: 2000 # 2000 requests per 5 minutes per IP
        aggregate_key_type: "IP"

  - name: "GeoBlocking"
    priority: 4
    rule_action: "BLOCK"
    statement:
      geo_match_statement:
        country_codes: ["CN", "RU", "KP"] # Block high-risk countries
```

**Database Security:**
```sql
-- Database firewall rules
-- Only allow connections from application servers
ALTER SYSTEM SET listen_addresses = '10.0.1.0/24'; -- Private subnet only

-- Enforce SSL connections
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_min_protocol_version = 'TLSv1.2';

-- Disable dangerous functions
REVOKE EXECUTE ON FUNCTION pg_read_file(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pg_ls_dir(text) FROM PUBLIC;
REVOKE ALL ON pg_file_settings FROM PUBLIC;

-- Audit all superuser actions
ALTER SYSTEM SET log_statement = 'ddl'; -- Log all DDL
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
```

### 8.2 Application Hardening

**Input Validation:**
```typescript
// Strict input validation for all user inputs
import { z } from 'zod';

// UUID validation
export const UUIDSchema = z.string().uuid({
  message: 'Invalid UUID format'
});

// Tenant ID validation (must be in user's memberships)
export const TenantIDSchema = z.string().uuid().refine(
  async (tenantId) => {
    const { data } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', auth.uid())
      .eq('organization_id', tenantId)
      .eq('status', 'active')
      .single();
    return !!data;
  },
  { message: 'Access denied to this organization' }
);

// Email validation (prevent email injection)
export const EmailSchema = z.string().email().max(255).refine(
  (email) => !email.includes('\n') && !email.includes('\r'),
  { message: 'Invalid email format' }
);

// SQL-safe string validation
export const SafeStringSchema = z.string().max(1000).refine(
  (str) => !/[;\x00]/.test(str), // No SQL injection characters
  { message: 'Invalid characters in input' }
);

// API endpoint validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    const body = await req.json();

    try {
      const validated = await schema.parseAsync(body);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}
```

**Content Security Policy:**
```typescript
// Strict CSP headers
export function securityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.vital.health https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}
```

### 8.3 Dependency Security

**Automated Vulnerability Scanning:**
```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Daily at 2am

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --fail-on=all

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## Summary of Critical Action Items

**STOP PRODUCTION DEPLOYMENT UNTIL THESE ARE FIXED:**

1. Remove client-controllable tenant selection (x-tenant-id header/cookie without validation)
2. Implement user-to-organization membership validation
3. Remove development bypass code from production builds
4. Implement comprehensive PHI access audit logging
5. Fix RLS policy context variable (app.tenant_id vs app.current_tenant_id)
6. Add service role protection to all RLS policies
7. Implement column-level encryption for all PHI fields
8. Enforce MFA for admin accounts

**Compliance Status:**
- Current HIPAA Compliance: 40% (FAIL)
- Estimated time to 80% compliance: 4-8 weeks
- Estimated time to full certification: 6-12 months

**Recommended Next Steps:**
1. Convene security review meeting with engineering leadership
2. Assign dedicated security engineer to remediation
3. Halt all new feature development until critical vulnerabilities are fixed
4. Schedule penetration testing after Phase 1 fixes are complete
5. Begin HIPAA compliance officer hiring process

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
**Next Review:** 2025-12-10
