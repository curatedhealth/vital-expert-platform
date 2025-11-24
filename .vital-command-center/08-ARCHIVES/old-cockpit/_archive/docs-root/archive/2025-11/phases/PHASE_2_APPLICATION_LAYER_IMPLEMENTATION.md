# Phase 2: Application Layer Implementation - Complete

## Overview

Phase 2 implements the **Application Layer** of the multi-tenant architecture, providing tenant-aware services, hooks, and UI components for the VITAL Platform.

**Status:** ✅ **COMPLETE**

---

## What Was Built

### 1. Core Type Definitions

**File:** `packages/shared/src/types/tenant.types.ts`

**Purpose:** Central type definitions for multi-tenant system

**Key Types:**
```typescript
- Tenant: Complete tenant entity
- TenantType: 'client' | 'solution' | 'industry' | 'platform'
- TenantContext: React context interface
- AgentWithTenant: Agent with tenant metadata
- TenantResource: Base interface for shared resources
```

**Constants:**
- `PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001'`
- `DEFAULT_RESOURCE_LIMITS` for each subscription tier

**Helper Functions:**
- `isTenantResource()`: Type guard
- `isPlatformTenant()`: Check if platform tenant
- `canAccessResource()`: Resource access validation

---

### 2. Tenant Context Management

**File:** `packages/shared/src/lib/tenant-context.ts`

**Purpose:** Server-side tenant context operations

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `setTenantContext()` | Set tenant context in Supabase session (propagates to RLS) |
| `getCurrentTenantContext()` | Get active tenant from session |
| `getUserTenants()` | Get all tenants user has access to |
| `getDefaultTenant()` | Get user's default tenant |
| `switchTenant()` | Switch user's active tenant |
| `isPlatformAdmin()` | Check if user is platform admin |
| `getTenantBySlug()` | Lookup tenant by subdomain |
| `getTenantByDomain()` | Lookup tenant by custom domain |
| `extractTenantIdentifier()` | Parse tenant from hostname/URL |

**Usage Example:**
```typescript
import { setTenantContext, getUserTenants } from '@vital/shared/lib/tenant-context';

// Set tenant context for RLS
await setTenantContext(supabase, tenantId);

// Get user's tenants
const tenants = await getUserTenants(supabase, userId);
```

---

### 3. Next.js Middleware

**File:** `apps/digital-health-startup/src/middleware/tenant-middleware.ts`

**Purpose:** Automatically extract and set tenant context from request

**How It Works:**

1. Extracts hostname from request
2. Attempts to identify tenant from:
   - Query parameter `?tenant=xxx` (dev/test)
   - Custom domain (e.g., `takeda.vital.expert`)
   - Subdomain (e.g., `digital-health-startup.vital.expert`)
3. Sets tenant context in Supabase session
4. Adds tenant info to response headers:
   - `x-tenant-id`
   - `x-tenant-slug`
   - `x-tenant-type`

**Configuration:**
```typescript
// Applies to all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)',
  ],
};
```

---

### 4. Tenant-Aware Supabase Client

**File:** `apps/digital-health-startup/src/lib/supabase/tenant-aware-client.ts`

**Purpose:** Wrapper for Supabase client with automatic tenant context

**Classes:**

#### `TenantAwareSupabaseClient`
Wrapper class that automatically applies tenant context to queries.

**Methods:**
```typescript
// Get all agents (filtered by RLS)
await client.getAgents({ includeShared: true, includePrivate: true });

// Get platform agents
await client.getPlatformAgents();

// Get tenant-specific agents
await client.getTenantAgents();

// Create agent for tenant
await client.createAgent({ name, description, ... });

// Switch tenant
await client.setTenant(newTenantId);
```

**Factory Functions:**
- `createTenantAwareClient()`: For client components
- `createTenantAwareServerClient()`: For server components
- `useTenantAwareClient()`: For React hooks

---

### 5. React Tenant Context & Hooks

**File:** `apps/digital-health-startup/src/contexts/TenantContext.tsx`

**Purpose:** Global tenant state management via React Context

**Provider:**
```typescript
<TenantProvider>
  {/* Your app */}
</TenantProvider>
```

**Hooks:**

| Hook | Returns | Purpose |
|------|---------|---------|
| `useTenantContext()` | Full context | Complete tenant state |
| `useTenant()` | Current tenant | Get active tenant |
| `useIsPlatformAdmin()` | boolean | Check admin status |
| `useAvailableTenants()` | Tenant[] | Get accessible tenants |

**Context Properties:**
```typescript
interface TenantContext {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  userRole: 'owner' | 'admin' | 'member' | 'viewer' | null;
  isPlatformAdmin: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}
```

**Features:**
- Automatic tenant loading on mount
- LocalStorage persistence of selected tenant
- Automatic tenant context propagation to Supabase

---

### 6. Tenant-Aware Agent Service

**File:** `apps/digital-health-startup/src/lib/services/tenant-aware-agent-service.ts`

**Purpose:** High-level API for agent operations with tenant awareness

**Class:** `TenantAwareAgentService`

**Methods:**

| Method | Purpose |
|--------|---------|
| `getAgents(filters?)` | Get all accessible agents |
| `getPlatformAgents()` | Get globally shared platform agents |
| `getTenantAgents()` | Get tenant-specific agents only |
| `getSharedAgents()` | Get agents shared with tenant |
| `getAgentById(id)` | Get single agent (with access check) |
| `createAgent(data)` | Create agent for current tenant |
| `updateAgent(id, updates)` | Update agent (permission checked via RLS) |
| `deleteAgent(id)` | Delete agent (permission checked via RLS) |
| `shareAgent(id, tenantIds)` | Share agent with specific tenants |
| `makeGloballyShared(id)` | Make agent globally accessible |
| `makePrivate(id)` | Remove sharing from agent |
| `getAgentStats()` | Get agent statistics |

**Usage Example:**
```typescript
import { createTenantAwareAgentService } from '@/lib/services/tenant-aware-agent-service';

const agentService = createTenantAwareAgentService(supabase, tenantId);

// Get all accessible agents
const agents = await agentService.getAgents({
  includeShared: true,
  search: 'regulatory',
});

// Get statistics
const stats = await agentService.getAgentStats();
// { total: 254, platform: 254, custom: 0, shared: 0 }
```

---

### 7. Tenant Switcher UI Component

**File:** `apps/digital-health-startup/src/components/tenant/TenantSwitcher.tsx`

**Purpose:** UI for switching between tenants

**Components:**

#### `<TenantSwitcher />`
Dropdown menu for switching tenants

**Features:**
- Lists all accessible tenants
- Shows current tenant with checkmark
- Displays tenant type and subscription tier
- Color-coded by tenant type
- Platform admin: Shows "Manage Tenants" link
- Hidden if user only has 1 tenant

#### `<TenantBadge />`
Compact badge showing current tenant

**Features:**
- Color-coded dot by tenant type
- Tenant name and type badge
- Useful for headers/navigation

**Usage:**
```tsx
import { TenantSwitcher, TenantBadge } from '@/components/tenant/TenantSwitcher';

// In navigation
<nav>
  <TenantBadge />
  <TenantSwitcher />
</nav>
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐      ┌──────────────────┐              │
│  │  Middleware     │──────▶ Extract Tenant   │              │
│  │  (Every Request)│      │  from URL/Domain  │              │
│  └─────────────────┘      └──────────────────┘              │
│           │                        │                          │
│           ▼                        ▼                          │
│  ┌─────────────────────────────────────────┐                │
│  │    Set Tenant Context in Supabase       │                │
│  │    (Propagates to RLS Policies)         │                │
│  └─────────────────────────────────────────┘                │
│                      │                                        │
│       ┌──────────────┼──────────────┐                       │
│       ▼              ▼               ▼                        │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐                 │
│  │ React   │  │ Tenant-  │  │  Agent     │                 │
│  │ Context │  │ Aware    │  │  Service   │                 │
│  │ Provider│  │ Client   │  │            │                 │
│  └─────────┘  └──────────┘  └────────────┘                 │
│       │              │               │                        │
│       └──────────────┼───────────────┘                       │
│                      ▼                                        │
│            ┌──────────────────┐                              │
│            │  UI Components   │                              │
│            │  (TenantSwitcher)│                              │
│            └──────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase (Remote)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────┐                    │
│  │     RLS Policies (Tenant Isolation) │                    │
│  │  - Check app.tenant_id session var  │                    │
│  │  - Filter agents by tenant access   │                    │
│  │  - Apply sharing rules              │                    │
│  └─────────────────────────────────────┘                    │
│                    │                                          │
│                    ▼                                          │
│  ┌──────────────────────────────────────┐                   │
│  │        Tenants & Agents Tables       │                   │
│  │  - 2 tenants (Platform + DH Startup)│                   │
│  │  - 254 agents (all globally shared)  │                   │
│  └──────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Guide

### Step 1: Wrap App with TenantProvider

```tsx
// app/layout.tsx
import { TenantProvider } from '@/contexts/TenantContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SupabaseProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
```

### Step 2: Enable Middleware

```typescript
// middleware.ts
import { tenantMiddleware } from '@/middleware/tenant-middleware';

export default tenantMiddleware;
export { config } from '@/middleware/tenant-middleware';
```

### Step 3: Use Tenant-Aware Hooks

```tsx
'use client';

import { useTenant, useTenantContext } from '@/contexts/TenantContext';
import { createTenantAwareAgentService } from '@/lib/services/tenant-aware-agent-service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export function AgentList() {
  const supabase = useSupabaseClient();
  const tenant = useTenant();
  const { isPlatformAdmin } = useTenantContext();

  const agentService = createTenantAwareAgentService(supabase, tenant?.id || null);

  const [agents, setAgents] = useState([]);

  useEffect(() => {
    agentService.getAgents().then(setAgents);
  }, [tenant]);

  return (
    <div>
      <h1>Agents for {tenant?.name}</h1>
      {isPlatformAdmin && <Badge>Platform Admin</Badge>}
      {/* Render agents */}
    </div>
  );
}
```

### Step 4: Add Tenant Switcher to Navigation

```tsx
// components/nav.tsx
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';

export function Navigation() {
  return (
    <nav>
      <Logo />
      <TenantSwitcher />
      <UserMenu />
    </nav>
  );
}
```

---

## Testing Guide

### Test 1: Verify Tenant Context Propagation

```typescript
import { setTenantContext, getCurrentTenantContext } from '@vital/shared/lib/tenant-context';

// Set tenant
await setTenantContext(supabase, 'TENANT_ID');

// Verify it was set
const currentTenantId = await getCurrentTenantContext(supabase);
console.assert(currentTenantId === 'TENANT_ID');
```

### Test 2: Verify RLS Filtering

```typescript
const agentService = createTenantAwareAgentService(supabase, tenantId);

// Get agents - should only return accessible ones
const agents = await agentService.getAgents();

// All agents should either:
// 1. Belong to current tenant (agent.tenant_id === tenantId)
// 2. Be globally shared (agent.is_shared === true && agent.sharing_mode === 'global')
// 3. Be selectively shared with tenant (tenant in agent.shared_with array)

agents.forEach(agent => {
  const isAccessible =
    agent.tenant_id === tenantId ||
    (agent.is_shared && agent.sharing_mode === 'global') ||
    (agent.is_shared && agent.sharing_mode === 'selective' && agent.shared_with.includes(tenantId));

  console.assert(isAccessible, 'Agent should not be accessible');
});
```

### Test 3: Verify Tenant Switching

```typescript
const { switchTenant, currentTenant } = useTenantContext();

const tenantId1 = 'TENANT_1';
const tenantId2 = 'TENANT_2';

// Switch to tenant 1
await switchTenant(tenantId1);
expect(currentTenant.id).toBe(tenantId1);

// Verify agents are filtered for tenant 1
const agents1 = await agentService.getAgents();

// Switch to tenant 2
await switchTenant(tenantId2);
expect(currentTenant.id).toBe(tenantId2);

// Verify agents are different for tenant 2
const agents2 = await agentService.getAgents();

// Platform agents should be accessible from both tenants
const platformAgents1 = agents1.filter(a => a.resource_type === 'platform');
const platformAgents2 = agents2.filter(a => a.resource_type === 'platform');
expect(platformAgents1.length).toBe(platformAgents2.length); // Both should see all 254
```

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `packages/shared/src/types/tenant.types.ts` | 200 | Type definitions |
| `packages/shared/src/lib/tenant-context.ts` | 250 | Tenant context utilities |
| `apps/digital-health-startup/src/middleware/tenant-middleware.ts` | 80 | Request middleware |
| `apps/digital-health-startup/src/lib/supabase/tenant-aware-client.ts` | 150 | Supabase wrapper |
| `apps/digital-health-startup/src/contexts/TenantContext.tsx` | 200 | React context |
| `apps/digital-health-startup/src/lib/services/tenant-aware-agent-service.ts` | 250 | Agent service |
| `apps/digital-health-startup/src/components/tenant/TenantSwitcher.tsx` | 150 | UI components |
| **Total** | **1,280 lines** | **7 files** |

---

## Next Steps (Phase 3)

1. ✅ Update authentication flow to assign default tenant on signup
2. ✅ Create admin UI for tenant management (create, edit, delete tenants)
3. ✅ Create admin UI for user-tenant assignments
4. ✅ Add audit logging for tenant operations
5. ✅ Implement tenant resource limits enforcement
6. ✅ Add tenant usage analytics

---

## Dependencies

**Phase 2 Requires:**
- Phase 1 (Database migrations) must be complete
- Migrations 1-4 executed on remote Supabase
- 254 agents restored and assigned to platform tenant

**Phase 3 Will Build On:**
- All Phase 2 infrastructure
- React Context & Hooks
- Tenant-aware services

---

**Status:** ✅ **PHASE 2 COMPLETE**
**Prepared By:** Claude (Anthropic)
**Date:** October 26, 2025
