# Multi-Tenant Agent Architecture
## Agents as Shared Resources in VITAL Platform

**Version**: 1.0
**Last Updated**: 2025-11-24
**Status**: Active - Core Architecture Pattern

---

## Table of Contents
1. [Overview](#overview)
2. [Multi-Tenant Design Principles](#multi-tenant-design-principles)
3. [Database Architecture](#database-architecture)
4. [Access Control (RLS)](#access-control-rls)
5. [Agent Store UI Considerations](#agent-store-ui-considerations)
6. [API Design](#api-design)
7. [Code Organization](#code-organization)
8. [Best Practices](#best-practices)

---

## Overview

### Core Concept
**Agents are SHARED RESOURCES across multiple tenants, not tenant-specific entities.**

- **One Agent Definition** serves multiple tenants
- **Tenant-specific mappings** via junction tables
- **Row-Level Security (RLS)** enforces tenant isolation
- **Centralized management** with distributed access

### Current State
- **489 agents** in the platform
- **5-level hierarchy** (Master, Expert, Specialist, Worker, Tool)
- **Multiple tenants**: Vital System (sees all), Pharma (sees subset), etc.
- **Junction table**: `tenant_agents` maps agents to tenants

---

## Multi-Tenant Design Principles

### 1. Single Source of Truth
```
❌ WRONG: One agent per tenant (duplication)
agents
├── agent_123_vital_system
├── agent_123_pharma_tenant
└── agent_123_another_tenant

✅ CORRECT: One agent, multiple tenant mappings
agents
└── agent_123

tenant_agents (junction table)
├── (vital_system, agent_123, enabled=true)
├── (pharma_tenant, agent_123, enabled=true)
└── (another_tenant, agent_123, enabled=false)
```

**Benefits**:
- No data duplication
- Single point of update
- Consistent agent definitions
- Easier maintenance

### 2. Tenant Isolation via RLS

**Database-level security** ensures tenants only see their authorized agents:

```sql
-- RLS Policy on agents table
CREATE POLICY "tenant_can_view_assigned_agents" ON agents
FOR SELECT
USING (
  -- Vital System sees ALL agents
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.tenant_key = 'vital-system'
  )
  OR
  -- Other tenants see only assigned agents (active/testing status)
  EXISTS (
    SELECT 1 FROM tenant_agents ta
    JOIN profiles p ON p.tenant_id = ta.tenant_id
    WHERE ta.agent_id = agents.id
    AND p.id = auth.uid()
    AND ta.is_enabled = true
    AND agents.status IN ('active', 'testing')
  )
);
```

**Key Features**:
- Vital System (super-admin) sees all 489 agents
- Other tenants see only assigned + active/testing agents
- Status filter: active/testing (not development/inactive)
- Junction table controls visibility

### 3. Tenant-Specific Overrides

**Base Definition** (agents table):
```typescript
interface Agent {
  id: string;
  name: string; // "Clinical Pharmacist"
  description: string; // Base description
  system_prompt: string; // Default prompt
  base_model: string; // "gpt-4"
  temperature: number; // 0.2
  agent_level_id: string;
  status: 'active' | 'development' | 'inactive' | 'testing';
  // ... other base attributes
}
```

**Tenant-Specific Overrides** (tenant_agents table):
```typescript
interface TenantAgentMapping {
  tenant_id: string;
  agent_id: string;
  is_enabled: boolean; // Tenant can disable specific agents
  custom_name?: string; // Override name for this tenant
  custom_description?: string; // Override description
  custom_system_prompt?: string; // Override prompt
  tenant_specific_config?: Record<string, any>; // Additional config
  usage_priority?: number; // Order in tenant's UI
  cost_allocation_tag?: string; // For billing
}
```

**Effective Agent** (computed):
```typescript
const effectiveAgent = {
  ...baseAgent,
  ...(tenantMapping.custom_name && { name: tenantMapping.custom_name }),
  ...(tenantMapping.custom_description && { description: tenantMapping.custom_description }),
  ...(tenantMapping.custom_system_prompt && { system_prompt: tenantMapping.custom_system_prompt }),
};
```

---

## Database Architecture

### Core Tables

#### 1. `agents` (Shared Resource)
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tagline TEXT,
  title TEXT,
  avatar_url TEXT,
  avatar_description TEXT,

  -- Hierarchy
  agent_level_id UUID REFERENCES agent_levels(id),

  -- Configuration
  system_prompt TEXT,
  base_model TEXT NOT NULL,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  communication_style TEXT,

  -- Organization (optional, for context)
  function_name TEXT,
  department_name TEXT,
  role_name TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'development',
  CHECK (status IN ('active', 'development', 'inactive', 'testing')),

  -- Metadata
  expertise_level TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
```

#### 2. `agent_levels` (Hierarchy Definition)
```sql
CREATE TABLE agent_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "Master", "Expert", "Specialist", "Worker", "Tool"
  slug TEXT UNIQUE NOT NULL,
  level_number INTEGER UNIQUE NOT NULL CHECK (level_number BETWEEN 1 AND 5),
  description TEXT,

  -- Spawning rules
  can_spawn_lower_levels BOOLEAN DEFAULT false,
  can_spawn_specialists BOOLEAN DEFAULT false,
  can_spawn_workers BOOLEAN DEFAULT false,
  can_spawn_tools BOOLEAN DEFAULT false,
  max_spawned_agents INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO agent_levels (name, slug, level_number, description, can_spawn_lower_levels) VALUES
('Master', 'master', 1, 'Orchestrator agents that coordinate complex workflows', true),
('Expert', 'expert', 2, 'Domain expert agents with deep specialized knowledge', true),
('Specialist', 'specialist', 3, 'Specialized agents for specific sub-domains', true),
('Worker', 'worker', 4, 'Task execution agents for specific operations', true),
('Tool', 'tool', 5, 'Integration and utility agents', false);
```

#### 3. `tenant_agents` (Junction Table)
```sql
CREATE TABLE tenant_agents (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Access control
  is_enabled BOOLEAN DEFAULT true,

  -- Tenant-specific overrides
  custom_name TEXT,
  custom_description TEXT,
  custom_system_prompt TEXT,
  tenant_specific_config JSONB DEFAULT '{}',

  -- UI/UX customization
  usage_priority INTEGER, -- Sort order in tenant's UI
  is_featured BOOLEAN DEFAULT false, -- Show in featured section
  category_override TEXT, -- Custom categorization

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Billing
  cost_allocation_tag TEXT, -- For cost tracking per tenant

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (tenant_id, agent_id)
);

-- Enable RLS
ALTER TABLE tenant_agents ENABLE ROW LEVEL SECURITY;

-- Index for performance
CREATE INDEX idx_tenant_agents_tenant ON tenant_agents(tenant_id);
CREATE INDEX idx_tenant_agents_agent ON tenant_agents(agent_id);
CREATE INDEX idx_tenant_agents_enabled ON tenant_agents(is_enabled) WHERE is_enabled = true;
```

#### 4. `tenants` (Organization/Customer)
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tenant_key TEXT UNIQUE NOT NULL, -- 'vital-system', 'pharma-co', etc.

  -- Configuration
  is_super_admin BOOLEAN DEFAULT false, -- Vital System = true
  can_view_all_agents BOOLEAN DEFAULT false, -- Override RLS

  -- Branding
  logo_url TEXT,
  primary_color TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Seed data
INSERT INTO tenants (name, tenant_key, is_super_admin, can_view_all_agents) VALUES
('Vital System', 'vital-system', true, true), -- Super admin sees all
('Pharma Corporation', 'pharma-corp', false, false);
```

### RLS Policies

#### Agents Table Policies
```sql
-- Policy 1: Vital System sees all agents
CREATE POLICY "super_admin_sees_all_agents" ON agents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = profiles.tenant_id
      AND tenants.is_super_admin = true
    )
  )
);

-- Policy 2: Regular tenants see assigned agents
CREATE POLICY "tenant_sees_assigned_agents" ON agents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tenant_agents ta
    JOIN profiles p ON p.tenant_id = ta.tenant_id
    WHERE ta.agent_id = agents.id
    AND p.id = auth.uid()
    AND ta.is_enabled = true
    AND agents.status IN ('active', 'testing')
  )
);

-- Policy 3: Service role bypass (for backend operations)
CREATE POLICY "service_role_all_access" ON agents
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');
```

#### Tenant Agents Table Policies
```sql
-- Policy 1: Users see their tenant's agent mappings
CREATE POLICY "users_see_own_tenant_agents" ON tenant_agents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.tenant_id = tenant_agents.tenant_id
  )
);

-- Policy 2: Super admin sees all mappings
CREATE POLICY "super_admin_sees_all_mappings" ON tenant_agents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN tenants t ON t.id = p.tenant_id
    WHERE p.id = auth.uid()
    AND t.is_super_admin = true
  )
);
```

### Views for Convenience

#### Effective Agents View (with tenant overrides)
```sql
CREATE OR REPLACE VIEW v_effective_agents AS
SELECT
  a.*,
  ta.tenant_id,
  COALESCE(ta.custom_name, a.name) AS effective_name,
  COALESCE(ta.custom_description, a.description) AS effective_description,
  COALESCE(ta.custom_system_prompt, a.system_prompt) AS effective_system_prompt,
  ta.is_enabled,
  ta.usage_priority,
  ta.is_featured,
  ta.usage_count,
  ta.last_used_at
FROM agents a
JOIN tenant_agents ta ON ta.agent_id = a.id
WHERE ta.is_enabled = true;

-- Query example: Get all effective agents for current user's tenant
-- SELECT * FROM v_effective_agents WHERE tenant_id = (
--   SELECT tenant_id FROM profiles WHERE id = auth.uid()
-- );
```

---

## Access Control (RLS)

### Security Layers

1. **Database-Level (RLS Policies)**
   - Enforced at PostgreSQL level
   - Cannot be bypassed by application code
   - Applies to all queries (SELECT, INSERT, UPDATE, DELETE)

2. **Application-Level (API)**
   - Additional validation
   - Business logic enforcement
   - Audit logging

3. **UI-Level**
   - Role-based UI rendering
   - Feature flags per tenant
   - Custom branding

### Tenant Context Flow

```
User Authentication
        ↓
JWT Token with Claims
        ↓
        {
          sub: "user-uuid",
          role: "authenticated",
          tenant_id: "tenant-uuid",
          tenant_key: "pharma-corp"
        }
        ↓
RLS Policies Evaluate
        ↓
        - Check tenant_id from JWT
        - Filter agents via tenant_agents
        - Apply status filters
        ↓
Authorized Agent List
        ↓
API Response to Frontend
```

### Testing RLS

```sql
-- Test as super admin (Vital System)
SET LOCAL request.jwt.claim.tenant_id = 'vital-system-tenant-id';
SELECT COUNT(*) FROM agents; -- Should return 489

-- Test as regular tenant (Pharma)
SET LOCAL request.jwt.claim.tenant_id = 'pharma-tenant-id';
SELECT COUNT(*) FROM agents; -- Should return only assigned agents (e.g., 111)

-- Test status filtering
SET LOCAL request.jwt.claim.tenant_id = 'pharma-tenant-id';
SELECT COUNT(*) FROM agents WHERE status = 'development'; -- Should return 0 (filtered out)
SELECT COUNT(*) FROM agents WHERE status = 'active'; -- Should return active agents only
```

---

## Agent Store UI Considerations

### Multi-Tenant UI Features

#### 1. Tenant-Aware Filtering
```typescript
// Frontend automatically filters based on authenticated user's tenant
const { data: agents } = await agentService.getAgents({
  // No need to pass tenant_id - RLS handles it
  status: 'all', // Vital System sees all, others see active/testing only
  levels: [1, 2, 3],
});

// Response automatically filtered by RLS
// Vital System user: 489 agents
// Pharma user: 111 agents
```

#### 2. Tenant-Specific Branding
```typescript
interface TenantBranding {
  logo_url: string;
  primary_color: string;
  agent_store_title: string; // "Pharma AI Agents" vs "VITAL Agent Library"
  featured_agents: string[]; // Agent IDs to feature
}

// UI adapts based on tenant
const AgentStoreHeader = () => {
  const { tenant } = useTenant();

  return (
    <header style={{ borderColor: tenant.primary_color }}>
      <img src={tenant.logo_url} alt={tenant.name} />
      <h1>{tenant.agent_store_title}</h1>
    </header>
  );
};
```

#### 3. Tenant-Specific Agent Cards
```typescript
const AgentCard = ({ agent }: { agent: Agent }) => {
  const { tenant } = useTenant();
  const tenantMapping = useTenantAgentMapping(agent.id);

  // Use tenant-specific overrides if available
  const displayName = tenantMapping?.custom_name || agent.name;
  const displayDescription = tenantMapping?.custom_description || agent.description;

  // Show featured badge for tenant-featured agents
  const isFeatured = tenantMapping?.is_featured;

  return (
    <Card>
      {isFeatured && <Badge>Featured</Badge>}
      <h3>{displayName}</h3>
      <p>{displayDescription}</p>
    </Card>
  );
};
```

#### 4. Admin View (Vital System Only)
```typescript
// Super admin sees additional controls
const AgentStoreAdmin = () => {
  const { isSuperAdmin } = useTenant();

  if (!isSuperAdmin) return <AgentStoreUser />;

  return (
    <AdminLayout>
      {/* See all 489 agents */}
      {/* See all tenants */}
      {/* Manage tenant-agent mappings */}
      {/* View usage analytics per tenant */}
      <TenantAgentAssignmentMatrix />
      <AgentUsageByTenant />
    </AdminLayout>
  );
};
```

### UI States

| User Type | Agents Visible | Status Filter | Edit Rights |
|-----------|---------------|---------------|-------------|
| **Vital System (Super Admin)** | All 489 | All statuses | Full |
| **Tenant Admin** | Assigned only | active/testing | Tenant overrides only |
| **Tenant User** | Assigned only | active only | None |

---

## API Design

### Agent Service Layer

```typescript
// apps/vital-system/src/features/agents/services/agent-service.ts

import { createClient } from '@supabase/supabase-js';

export class AgentService {
  private supabase;

  constructor() {
    // Use authenticated client (includes user's JWT with tenant context)
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get agents for current user's tenant
   * RLS automatically filters based on tenant_id in JWT
   */
  async getAgents(filters?: AgentFilters): Promise<Agent[]> {
    let query = this.supabase
      .from('agents')
      .select(`
        *,
        agent_levels (
          id, name, slug, level_number, description,
          can_spawn_lower_levels, can_spawn_specialists,
          can_spawn_workers, can_spawn_tools, max_spawned_agents
        )
      `);

    // Apply filters (RLS handles tenant filtering automatically)
    if (filters?.levels?.length) {
      query = query.in('agent_levels.level_number', filters.levels);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get effective agent with tenant-specific overrides
   */
  async getEffectiveAgent(agentId: string): Promise<EffectiveAgent> {
    const { data, error } = await this.supabase
      .from('v_effective_agents') // View combines agent + tenant_agents
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get tenant-agent mapping (for admin UI)
   */
  async getTenantAgentMapping(agentId: string): Promise<TenantAgentMapping | null> {
    const { data, error } = await this.supabase
      .from('tenant_agents')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  }

  /**
   * Update tenant-specific overrides (tenant admin only)
   */
  async updateTenantAgentConfig(
    agentId: string,
    config: Partial<TenantAgentMapping>
  ): Promise<void> {
    // Get current user's tenant_id from profile
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('tenant_id')
      .single();

    if (!profile) throw new Error('User profile not found');

    const { error } = await this.supabase
      .from('tenant_agents')
      .upsert({
        tenant_id: profile.tenant_id,
        agent_id: agentId,
        ...config,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }
}

// Usage in component
const agentService = new AgentService();
const agents = await agentService.getAgents({ levels: [1, 2], status: 'active' });
```

### API Routes (Server-Side)

```typescript
// apps/vital-system/src/app/api/agents/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'active';

  // For tenant-specific queries, use authenticated client
  // For admin queries, use service role client

  let query = supabaseAdmin
    .from('agents')
    .select(`
      *,
      agent_levels (*)
    `);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    agents: data || [],
    count: data?.length || 0,
  });
}
```

---

## Code Organization

### Folder Structure for Shared Agent Resources

```
apps/vital-system/src/
├── features/
│   └── agents/                    ← Agents feature module (shared resource)
│       ├── components/
│       │   ├── AgentCard.tsx
│       │   ├── AgentGrid.tsx
│       │   ├── AgentDetailModal.tsx
│       │   ├── LevelFilterBar.tsx
│       │   ├── SearchInput.tsx
│       │   ├── HierarchyTreeView.tsx
│       │   ├── knowledge-graph-view.tsx
│       │   └── tenant/            ← Tenant-specific components
│       │       ├── TenantAgentCard.tsx
│       │       ├── TenantBrandingWrapper.tsx
│       │       └── AdminTenantAgentMatrix.tsx
│       ├── hooks/
│       │   ├── useAgents.ts
│       │   ├── useAgentSearch.ts
│       │   ├── useAgentFilters.ts
│       │   ├── useTenant.ts       ← Tenant context hook
│       │   └── useTenantAgentMapping.ts
│       ├── services/
│       │   ├── agent-service.ts   ← Multi-tenant aware
│       │   └── tenant-service.ts
│       ├── types/
│       │   ├── agent.types.ts
│       │   ├── agent-level.types.ts
│       │   └── tenant.types.ts    ← Tenant-specific types
│       └── stores/
│           ├── agent-store.ts     ← Zustand store
│           └── tenant-store.ts
├── core/                          ← Shared core modules
│   └── multi-tenant/
│       ├── TenantProvider.tsx     ← Tenant context provider
│       ├── rls-utils.ts           ← RLS helper functions
│       └── tenant-utils.ts
└── app/
    └── (app)/
        └── agents/                ← Agent Store page
            ├── page.tsx
            ├── layout.tsx
            └── [agentId]/         ← Agent detail page
                └── page.tsx
```

### Documentation Structure

```
.claude/
├── docs/
│   └── platform/
│       └── agents/
│           ├── MULTI_TENANT_ARCHITECTURE.md  ← This document
│           ├── AGENT_STORE_REDESIGN_SPEC.md  ← UI redesign spec
│           ├── 00-AGENT_REGISTRY.md
│           ├── 01-masters/
│           ├── 02-experts/
│           ├── 03-specialists/
│           ├── 04-workers/
│           └── 05-tools/
└── agents/                        ← Claude Code agent prompts
    ├── frontend-ui-architect.md
    ├── sql-supabase-specialist.md
    └── ...
```

---

## Best Practices

### 1. Always Use Tenant Context

```typescript
// ✅ CORRECT: Tenant-aware query
const { data: agents } = await supabase
  .from('agents')
  .select('*'); // RLS automatically filters by tenant

// ❌ WRONG: Trying to bypass RLS
const { data: agents } = await supabaseAdmin
  .from('agents')
  .select('*')
  .eq('tenant_id', userTenantId); // No tenant_id column on agents!
```

### 2. Use Junction Table for Mappings

```typescript
// ✅ CORRECT: Query through junction table
const { data: tenantAgents } = await supabase
  .from('tenant_agents')
  .select(`
    *,
    agent:agents (*)
  `)
  .eq('tenant_id', currentTenantId)
  .eq('is_enabled', true);

// ❌ WRONG: Trying to filter agents directly by tenant
const { data: agents } = await supabase
  .from('agents')
  .select('*')
  .eq('tenant_id', currentTenantId); // No tenant_id on agents!
```

### 3. Respect Status Filters

```typescript
// ✅ CORRECT: Status-aware query
const getAgentsForTenant = async (status: AgentStatus = 'active') => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, tenant_key')
    .single();

  let query = supabase.from('agents').select('*');

  // Vital System sees all statuses
  if (profile.tenant_key === 'vital-system') {
    if (status !== 'all') {
      query = query.eq('status', status);
    }
  } else {
    // Other tenants see only active/testing
    query = query.in('status', ['active', 'testing']);
  }

  return query;
};

// ❌ WRONG: Exposing development agents to all tenants
const { data: agents } = await supabase
  .from('agents')
  .select('*'); // Includes development agents!
```

### 4. Use Effective Views for Overrides

```typescript
// ✅ CORRECT: Query effective view
const { data: effectiveAgent } = await supabase
  .from('v_effective_agents')
  .select('*')
  .eq('agent_id', agentId)
  .single();

// Automatically gets tenant-specific overrides:
// - custom_name (if set)
// - custom_description (if set)
// - custom_system_prompt (if set)

// ❌ WRONG: Manually merging overrides
const agent = await getAgent(agentId);
const mapping = await getTenantMapping(agentId);
const merged = { ...agent, ...mapping }; // Fragile, error-prone
```

### 5. Audit Tenant Access

```typescript
// ✅ CORRECT: Log agent usage per tenant
const logAgentUsage = async (agentId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single();

  await supabase
    .from('tenant_agents')
    .update({
      usage_count: supabase.rpc('increment_usage', { agent_id: agentId }),
      last_used_at: new Date().toISOString(),
    })
    .eq('tenant_id', profile.tenant_id)
    .eq('agent_id', agentId);
};

// Enables:
// - Usage tracking per tenant
// - Billing per tenant
// - Analytics per tenant
// - Most-used agents per tenant
```

### 6. Test Multi-Tenant Scenarios

```typescript
// Test suite should cover:
describe('Multi-Tenant Agent Access', () => {
  it('Vital System sees all 489 agents', async () => {
    const { data } = await getAgentsAs('vital-system-user');
    expect(data).toHaveLength(489);
  });

  it('Pharma tenant sees only assigned agents', async () => {
    const { data } = await getAgentsAs('pharma-user');
    expect(data).toHaveLength(111); // Only assigned agents
  });

  it('Pharma tenant does not see development agents', async () => {
    const { data } = await getAgentsAs('pharma-user');
    const devAgents = data.filter(a => a.status === 'development');
    expect(devAgents).toHaveLength(0);
  });

  it('Tenant-specific overrides are applied', async () => {
    const agent = await getEffectiveAgentAs('pharma-user', 'agent-123');
    expect(agent.effective_name).toBe('Pharma Clinical Specialist'); // Custom name
  });
});
```

---

## Summary

### Key Takeaways

1. **Agents are shared resources** - One agent serves multiple tenants
2. **Junction table controls access** - `tenant_agents` maps agents to tenants
3. **RLS enforces isolation** - Database-level security, not application-level
4. **Tenant overrides** - Custom names, descriptions, prompts per tenant
5. **Vital System is super admin** - Sees all agents, all statuses
6. **Status filtering** - Regular tenants see only active/testing agents

### Architecture Benefits

- ✅ **No duplication**: Single source of truth for agent definitions
- ✅ **Scalable**: Add new tenants without duplicating agents
- ✅ **Secure**: Database-level RLS enforcement
- ✅ **Flexible**: Tenant-specific overrides when needed
- ✅ **Maintainable**: Update agent once, affects all tenants
- ✅ **Auditable**: Track usage per tenant for billing/analytics

### Next Steps

1. Review this architecture document
2. Review [AGENT_STORE_REDESIGN_SPEC.md](./AGENT_STORE_REDESIGN_SPEC.md) for UI implementation
3. Implement tenant context in frontend
4. Test multi-tenant scenarios thoroughly
5. Deploy with proper RLS policies

---

**Related Documentation**:
- [Agent Store Redesign Specification](./AGENT_STORE_REDESIGN_SPEC.md)
- [AgentOS 3.0 Five-Level Hierarchy](/AGENTOS_3.0_FIVE_LEVEL_AGENT_HIERARCHY.md)
- [Database Schema Reference](/.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)

**Document Owner**: Platform Architecture Team
**Review Cycle**: Quarterly
**Last Reviewed**: 2025-11-24
