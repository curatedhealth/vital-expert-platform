# Phase 2: Application Layer Integration - Implementation Plan

**Status:** Ready to Execute
**Prerequisites:** ✅ Phase 1 Complete (All 4 migrations executed)
**Goal:** Integrate multi-tenant functionality into the Next.js application

---

## Overview

Phase 2 integrates the database multi-tenant architecture (Phase 1) with the application layer, enabling:
- Automatic tenant detection from URL
- React Context for tenant state management
- Tenant-aware database queries
- UI components for tenant switching
- Middleware for automatic tenant context propagation

---

## Pre-Integration Checklist

### Before Starting
- [x] Phase 1 migrations complete (verified)
- [x] 254 agents assigned to platform tenant
- [x] RLS policies active
- [ ] Current build passing (fix existing TypeScript errors first)
- [ ] No uncommitted changes (backup current state)

---

## Phase 2 Files Overview

### Files Already Created (Ready to Integrate)

**1. Type Definitions**
```
File: packages/shared/src/types/tenant.types.ts
Lines: 200
Purpose: Central type definitions for multi-tenant system
Status: ✅ Created
```

**2. Server Utilities**
```
File: packages/shared/src/lib/tenant-context.ts
Lines: 250
Purpose: Server-side tenant context management
Status: ✅ Created
```

**3. Middleware**
```
File: apps/digital-health-startup/src/middleware/tenant-middleware.ts
Lines: 80
Purpose: Automatic tenant detection from URL
Status: ✅ Created
```

**4. Supabase Client Wrapper**
```
File: apps/digital-health-startup/src/lib/supabase/tenant-aware-client.ts
Lines: 150
Purpose: Supabase client with automatic tenant filtering
Status: ✅ Created
```

**5. React Context**
```
File: apps/digital-health-startup/src/contexts/TenantContext.tsx
Lines: 200
Purpose: Global tenant state in React
Status: ✅ Created
```

**6. Agent Service**
```
File: apps/digital-health-startup/src/lib/services/tenant-aware-agent-service.ts
Lines: 250
Purpose: High-level API for tenant-aware agent operations
Status: ✅ Created
```

**7. UI Components**
```
File: apps/digital-health-startup/src/components/tenant/TenantSwitcher.tsx
Lines: 150
Purpose: Tenant switching UI component
Status: ✅ Created
```

**Total:** 7 files, 1,280+ lines of TypeScript/React code

---

## Integration Steps

### Step 1: Fix Existing Build Errors (CURRENT STEP)

**Goal:** Clean build before adding new code

**Actions:**
1. Run build and identify all TypeScript errors
2. Fix errors one by one
3. Verify clean build: `npm run build`

**Common Errors to Fix:**
- Missing function implementations
- Type mismatches
- Import errors
- Undefined variables

**Status:** 🔄 IN PROGRESS

---

### Step 2: Verify Phase 2 Files Exist

**Goal:** Confirm all 7 files are present

**Command:**
```bash
# Check all 7 files exist
ls -la packages/shared/src/types/tenant.types.ts
ls -la packages/shared/src/lib/tenant-context.ts
ls -la apps/digital-health-startup/src/middleware/tenant-middleware.ts
ls -la apps/digital-health-startup/src/lib/supabase/tenant-aware-client.ts
ls -la apps/digital-health-startup/src/contexts/TenantContext.tsx
ls -la apps/digital-health-startup/src/lib/services/tenant-aware-agent-service.ts
ls -la apps/digital-health-startup/src/components/tenant/TenantSwitcher.tsx
```

**Expected:** All 7 files exist

**Status:** ⏳ PENDING

---

### Step 3: Update App Root with TenantProvider

**Goal:** Wrap app with TenantProvider for global tenant state

**File to Update:** `apps/digital-health-startup/src/app/layout.tsx`

**Changes:**
```typescript
// Add import
import { TenantProvider } from '@/contexts/TenantContext';

// Wrap children with TenantProvider
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
```

**Verification:**
```bash
# Check TenantProvider is imported and used
grep -n "TenantProvider" apps/digital-health-startup/src/app/layout.tsx
```

**Status:** ⏳ PENDING

---

### Step 4: Enable Tenant Middleware

**Goal:** Automatic tenant detection on every request

**File to Update:** `apps/digital-health-startup/src/middleware.ts`

**Changes:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { tenantMiddleware } from './middleware/tenant-middleware';

export async function middleware(request: NextRequest) {
  // Run tenant middleware
  const tenantResponse = await tenantMiddleware(request);

  // If tenant middleware returns a response, use it
  if (tenantResponse) {
    return tenantResponse;
  }

  // Otherwise continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Verification:**
```bash
# Check middleware imports tenantMiddleware
grep -n "tenantMiddleware" apps/digital-health-startup/src/middleware.ts
```

**Status:** ⏳ PENDING

---

### Step 5: Update Agent Service

**Goal:** Use TenantAwareAgentService instead of direct Supabase queries

**Files to Update:**
- `apps/digital-health-startup/src/app/(app)/agents/page.tsx`
- Any file that queries agents table

**Changes:**
```typescript
// Before:
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
const { data: agents } = await supabase.from('agents').select('*');

// After:
import { TenantAwareAgentService } from '@/lib/services/tenant-aware-agent-service';
import { useTenantContext } from '@/contexts/TenantContext';

const { currentTenant } = useTenantContext();
const agentService = new TenantAwareAgentService(supabase, currentTenant?.id || null);
const agents = await agentService.getAgents();
```

**Verification:**
```bash
# Check TenantAwareAgentService is imported
grep -r "TenantAwareAgentService" apps/digital-health-startup/src/app/
```

**Status:** ⏳ PENDING

---

### Step 6: Add TenantSwitcher to Navigation

**Goal:** Allow users to switch tenants via UI

**File to Update:** Main navigation component (e.g., `src/components/ui/top-nav.tsx`)

**Changes:**
```typescript
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';

// Add to navigation
<nav>
  {/* Existing nav items */}
  <TenantSwitcher />
</nav>
```

**Verification:**
```bash
# Check TenantSwitcher is imported
grep -r "TenantSwitcher" apps/digital-health-startup/src/components/
```

**Status:** ⏳ PENDING

---

### Step 7: Update Environment Variables

**Goal:** Ensure Supabase credentials are available

**File:** `apps/digital-health-startup/.env.local`

**Required Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Verification:**
```bash
# Check env vars exist
grep -E "SUPABASE_URL|SUPABASE.*KEY" apps/digital-health-startup/.env.local
```

**Status:** ⏳ PENDING

---

### Step 8: Build and Test

**Goal:** Verify integration works

**Commands:**
```bash
# Clean build
cd apps/digital-health-startup
npm run build

# If build succeeds, run dev server
npm run dev
```

**Test Checklist:**
- [ ] App loads without errors
- [ ] Console shows no tenant-related errors
- [ ] TenantSwitcher appears in navigation
- [ ] Can switch between tenants
- [ ] Agent list shows 254 platform agents
- [ ] Creating a new agent assigns it to current tenant

**Status:** ⏳ PENDING

---

## Testing Plan

### Test 1: Verify Platform Tenant Access

**Steps:**
1. Open app: `http://localhost:3000`
2. Open DevTools Console
3. Check tenant context:
   ```javascript
   // Should see Platform Tenant loaded
   console.log(window.__TENANT_CONTEXT__);
   ```
4. Navigate to `/agents`
5. Verify: See all 254 agents

**Expected:** All platform agents visible

---

### Test 2: Verify Digital Health Startup Tenant

**Steps:**
1. Use TenantSwitcher to switch to "Digital Health Startup"
2. Navigate to `/agents`
3. Verify: Still see all 254 platform agents (globally shared)
4. Create a new agent
5. Verify: New agent assigned to DH Startup tenant

**Expected:**
- 254 platform agents + 1 custom agent = 255 total
- New agent has `tenant_id` = DH Startup tenant ID

---

### Test 3: Verify RLS Enforcement

**Steps:**
1. Open Supabase SQL Editor
2. Set tenant context to DH Startup:
   ```sql
   SELECT set_tenant_context('DH-STARTUP-TENANT-UUID');
   SELECT COUNT(*) FROM agents;
   ```
3. Expected: See 254 or 255 agents (platform + custom)
4. Try to query without tenant context:
   ```sql
   SELECT set_tenant_context(NULL);
   SELECT COUNT(*) FROM agents;
   ```
5. Expected: See 0 agents (RLS blocks access without tenant)

**Expected:** RLS properly enforces tenant isolation

---

### Test 4: Verify Tenant Switching

**Steps:**
1. Switch to Platform Tenant
2. Note: Agent count = 254
3. Switch to DH Startup Tenant
4. Note: Agent count = 254 or 255
5. Create agent in DH Startup
6. Switch back to Platform Tenant
7. Verify: Cannot see DH Startup's custom agent

**Expected:** Tenant isolation works correctly

---

## Rollback Plan

### If Integration Fails

**Step 1: Revert Code Changes**
```bash
# If using git
git checkout -- .
git clean -fd

# Or restore from backup
cp -r /path/to/backup/* .
```

**Step 2: Remove Phase 2 Files**
```bash
rm packages/shared/src/types/tenant.types.ts
rm packages/shared/src/lib/tenant-context.ts
rm apps/digital-health-startup/src/middleware/tenant-middleware.ts
rm apps/digital-health-startup/src/lib/supabase/tenant-aware-client.ts
rm apps/digital-health-startup/src/contexts/TenantContext.tsx
rm apps/digital-health-startup/src/lib/services/tenant-aware-agent-service.ts
rm -r apps/digital-health-startup/src/components/tenant/
```

**Step 3: Restore Original Files**
```bash
# Restore original middleware, layout, etc.
git checkout HEAD -- apps/digital-health-startup/src/middleware.ts
git checkout HEAD -- apps/digital-health-startup/src/app/layout.tsx
```

**Step 4: Rebuild**
```bash
npm run build
```

**Note:** Database migrations (Phase 1) remain intact. Only application code is rolled back.

---

## Common Issues and Solutions

### Issue 1: TenantProvider Hydration Errors

**Symptom:** React hydration mismatch errors

**Solution:**
```typescript
// In TenantContext.tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return null; // or loading state
}
```

---

### Issue 2: Middleware Infinite Loops

**Symptom:** Too many redirects

**Solution:**
```typescript
// In tenant-middleware.ts
// Skip middleware for static files
if (request.nextUrl.pathname.startsWith('/_next/')) {
  return NextResponse.next();
}
```

---

### Issue 3: Agent Queries Return Empty

**Symptom:** No agents shown even though 254 exist

**Solution:**
```typescript
// Check tenant context is set
const { currentTenant } = useTenantContext();
console.log('Current tenant:', currentTenant);

// Verify RLS policies
// In Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'agents';
```

---

### Issue 4: Cannot Create Agents

**Symptom:** Insert fails with RLS error

**Solution:**
```typescript
// Ensure created_by_user_id is set
const { data: { user } } = await supabase.auth.getUser();
const newAgent = {
  ...agentData,
  tenant_id: currentTenant?.id,
  created_by_user_id: user?.id,
};
```

---

## Success Criteria

Phase 2 is complete when:

- [x] All 7 Phase 2 files integrated
- [ ] Build passes with no errors
- [ ] App runs without console errors
- [ ] TenantProvider wraps app root
- [ ] Tenant middleware active
- [ ] TenantSwitcher visible in UI
- [ ] Can switch between tenants
- [ ] Agent list shows 254 platform agents
- [ ] Creating agent assigns to current tenant
- [ ] RLS enforces tenant isolation
- [ ] All 4 tests pass (see Testing Plan)

---

## Next Steps After Phase 2

### Option A: Production Deployment
- Deploy to staging environment
- Test with real users
- Monitor for issues
- Deploy to production

### Option B: Implement Migrations 5-7
- Migration 5: Complete schema sync (67 columns)
- Migration 6: Resource tables (tools, prompts, workflows)
- Migration 7: Tenant management (subscription, billing)

---

## Timeline Estimate

| Step | Estimated Time | Status |
|------|---------------|---------|
| 1. Fix existing errors | 30 min | 🔄 In Progress |
| 2. Verify files exist | 5 min | ⏳ Pending |
| 3. Update app root | 10 min | ⏳ Pending |
| 4. Enable middleware | 15 min | ⏳ Pending |
| 5. Update agent service | 20 min | ⏳ Pending |
| 6. Add TenantSwitcher | 10 min | ⏳ Pending |
| 7. Update env vars | 5 min | ⏳ Pending |
| 8. Build and test | 30 min | ⏳ Pending |
| **Total** | **~2 hours** | - |

---

## Contact and Support

**Questions:** Contact development team
**Documentation:** See PHASE_2_APPLICATION_LAYER_IMPLEMENTATION.md
**Migration Report:** See PHASE_1_MIGRATION_COMPLETION_REPORT.md
**Deferred Features:** See DEFERRED_FEATURES_REFERENCE.md

---

**STATUS: READY TO EXECUTE**
**NEXT ACTION: Fix existing build errors, then proceed with Step 2**
