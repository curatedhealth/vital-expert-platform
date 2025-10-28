# Multi-Tenant Completion - Action Plan

**Status:** 80% Complete → 100% Complete
**Timeline:** 2-3 hours
**Objective:** Complete multi-tenant implementation and deploy with subdomain routing

---

## Current Status ✅

**Working:**
- ✅ Dev server running: http://localhost:3000
- ✅ Database schema complete (tenants, user_tenants, RLS policies)
- ✅ TenantContext complete (loading, switching, persistence)
- ✅ Basic middleware working (Platform Tenant)
- ✅ Middleware compiled: 202 modules
- ✅ Homepage compiled: 1672 modules
- ✅ HTTP 200 OK responses

**Minor Issues:**
- ⚠️ styled-jsx error on /_error page (non-critical, doesn't affect main pages)

**Remaining Work:**
- ❌ Full tenant detection (subdomain/header/cookie)
- ❌ Browser testing
- ❌ End-to-end testing
- ❌ Deployment with wildcard domains

---

## Step-by-Step Completion Plan

### Step 1: Browser Testing (15 minutes)

**Objective:** Verify the UI works correctly before making changes

**Actions:**
1. Open http://localhost:3000 in browser
2. Check DevTools Console for JavaScript errors
3. Verify homepage loads
4. Check if TenantSwitcher appears in navigation
5. Test authentication (login/logout)
6. Open Network tab, check for `x-tenant-id` header in requests

**Success Criteria:**
- [ ] Homepage loads without errors
- [ ] No critical JavaScript errors in console
- [ ] Navigation works
- [ ] `x-tenant-id` header present in API requests
- [ ] styled-jsx error is only on error page (can ignore)

**If Issues Found:**
- Document in browser console
- Screenshot any visible errors
- Note which pages/features don't work

---

### Step 2: Implement Full Tenant Detection (45 minutes)

**Objective:** Add subdomain/header/cookie detection to middleware

**File to Edit:** `apps/digital-health-startup/src/middleware/tenant-middleware.ts`

**Current Code:**
```typescript
// Simplified - Always returns Platform Tenant
const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function tenantMiddleware(request, response) {
  const tenantId = PLATFORM_TENANT_ID;  // Hardcoded
  response.headers.set('x-tenant-id', tenantId);
  return response;
}
```

**New Code to Implement:**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function tenantMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  let tenantId = PLATFORM_TENANT_ID;

  // 1. SUBDOMAIN DETECTION (highest priority)
  // Example: acme.vital.expert → query for tenant with slug="acme"
  const hostname = request.headers.get('host') || '';
  const parts = hostname.split('.');

  // Check if subdomain exists and is not www/vital
  if (parts.length >= 3) {
    const subdomain = parts[0];

    if (subdomain && subdomain !== 'www' && subdomain !== 'vital' && subdomain !== 'app') {
      try {
        // Query Supabase for tenant by slug
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: tenant, error } = await supabase
          .from('tenants')
          .select('id')
          .eq('slug', subdomain)
          .eq('is_active', true)
          .single();

        if (tenant && !error) {
          tenantId = tenant.id;
          console.log(`[Tenant Middleware] Detected tenant from subdomain: ${subdomain} → ${tenantId}`);
        } else {
          console.warn(`[Tenant Middleware] No tenant found for subdomain: ${subdomain}`);
        }
      } catch (error) {
        console.error('[Tenant Middleware] Error querying tenant:', error);
      }
    }
  }

  // 2. HEADER DETECTION (second priority)
  // Allow clients to override with x-tenant-id header
  if (tenantId === PLATFORM_TENANT_ID) {
    const headerTenantId = request.headers.get('x-tenant-id');
    if (headerTenantId && headerTenantId !== PLATFORM_TENANT_ID) {
      tenantId = headerTenantId;
      console.log(`[Tenant Middleware] Detected tenant from header: ${tenantId}`);
    }
  }

  // 3. COOKIE DETECTION (third priority)
  // Check for tenant_id cookie
  if (tenantId === PLATFORM_TENANT_ID) {
    const cookieTenantId = request.cookies.get('tenant_id')?.value;
    if (cookieTenantId && cookieTenantId !== PLATFORM_TENANT_ID) {
      tenantId = cookieTenantId;
      console.log(`[Tenant Middleware] Detected tenant from cookie: ${tenantId}`);
    }
  }

  // 4. FALLBACK to Platform Tenant (default)
  if (!tenantId) {
    tenantId = PLATFORM_TENANT_ID;
    console.log('[Tenant Middleware] Using Platform Tenant (fallback)');
  }

  // Create response with tenant header
  const newResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Set tenant ID in response headers (for client-side access)
  newResponse.headers.set('x-tenant-id', tenantId);

  // Set tenant ID cookie (for persistence across requests)
  newResponse.cookies.set('tenant_id', tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return newResponse;
}
```

**Testing After Implementation:**

```bash
# Test 1: Default (should use Platform Tenant)
curl -I http://localhost:3000

# Test 2: Header-based tenant
curl -H "x-tenant-id: test-tenant-123" http://localhost:3000/api/agents

# Test 3: Check cookie is set
curl -v http://localhost:3000 2>&1 | grep "Set-Cookie"
```

**Success Criteria:**
- [ ] Code compiles without errors
- [ ] Console logs show tenant detection
- [ ] x-tenant-id header present in responses
- [ ] tenant_id cookie is set
- [ ] Dev server restarts successfully

---

### Step 3: Create Test Tenants (20 minutes)

**Objective:** Add test tenants to database for E2E testing

**SQL Script:** Create file `scripts/create-test-tenants.sql`

```sql
-- Create test tenant: Acme Corp
INSERT INTO tenants (id, name, slug, type, is_active, metadata)
VALUES (
  'acme-corp-tenant-id-123',
  'Acme Corp',
  'acme',
  'client',
  true,
  '{"industry": "pharma", "employees": 500}'
)
ON CONFLICT (slug) DO NOTHING;

-- Create test tenant: Beta Health
INSERT INTO tenants (id, name, slug, type, is_active, metadata)
VALUES (
  'beta-health-tenant-id-456',
  'Beta Health',
  'beta',
  'client',
  true,
  '{"industry": "payer", "employees": 200}'
)
ON CONFLICT (slug) DO NOTHING;

-- Create test user for Acme Corp
-- (Replace with actual user ID from Supabase Auth)
INSERT INTO user_tenants (user_id, tenant_id, role)
VALUES (
  'YOUR_TEST_USER_ID',  -- Get from Supabase Auth users table
  'acme-corp-tenant-id-123',
  'admin'
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Grant Platform Tenant access to test user
INSERT INTO user_tenants (user_id, tenant_id, role)
VALUES (
  'YOUR_TEST_USER_ID',
  '00000000-0000-0000-0000-000000000001',
  'member'
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;
```

**Run SQL:**
```bash
# Copy SQL to clipboard, then run in Supabase SQL Editor
# OR use psql if you have local Supabase:
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f scripts/create-test-tenants.sql
```

**Verify:**
```sql
-- Check tenants created
SELECT id, name, slug, type FROM tenants WHERE slug IN ('acme', 'beta');

-- Check user-tenant relationships
SELECT ut.user_id, t.name, ut.role
FROM user_tenants ut
JOIN tenants t ON ut.tenant_id = t.id
WHERE ut.user_id = 'YOUR_TEST_USER_ID';
```

**Success Criteria:**
- [ ] 2 test tenants created (acme, beta)
- [ ] Test user assigned to tenants
- [ ] Can query tenants successfully

---

### Step 4: Test Subdomain Routing (20 minutes)

**Objective:** Verify tenant detection works with different subdomains

**Setup Local DNS:**

Option A: Edit /etc/hosts (recommended for testing)
```bash
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 acme.localhost
127.0.0.1 beta.localhost
127.0.0.1 app.localhost
```

Option B: Use real DNS with localhost (if you control a domain)

**Test Scenarios:**

```bash
# Scenario 1: Platform Tenant (default)
curl http://localhost:3000 -v 2>&1 | grep "x-tenant-id"
# Expected: x-tenant-id: 00000000-0000-0000-0000-000000000001

# Scenario 2: Acme subdomain
curl http://acme.localhost:3000 -v 2>&1 | grep "x-tenant-id"
# Expected: x-tenant-id: acme-corp-tenant-id-123

# Scenario 3: Beta subdomain
curl http://beta.localhost:3000 -v 2>&1 | grep "x-tenant-id"
# Expected: x-tenant-id: beta-health-tenant-id-456

# Scenario 4: Header override
curl -H "x-tenant-id: custom-tenant-id" http://localhost:3000 -v 2>&1 | grep "x-tenant-id"
# Expected: x-tenant-id: custom-tenant-id
```

**Browser Testing:**
1. Open http://localhost:3000 (should show Platform Tenant)
2. Open http://acme.localhost:3000 (should show Acme Corp tenant)
3. Open http://beta.localhost:3000 (should show Beta Health tenant)
4. Check DevTools → Network → Response Headers for `x-tenant-id`

**Success Criteria:**
- [ ] Platform tenant works (localhost:3000)
- [ ] Acme tenant detected (acme.localhost:3000)
- [ ] Beta tenant detected (beta.localhost:3000)
- [ ] x-tenant-id header changes per subdomain
- [ ] Console logs show correct tenant detection
- [ ] No 500 errors

---

### Step 5: End-to-End Testing (30 minutes)

**Objective:** Verify tenant isolation and data security

**Test Case 1: Platform Tenant User**
```
1. Login as user with Platform Tenant access
2. Navigate to /agents page
3. Verify sees ALL agents (no filtering)
4. Create a test conversation
5. Check database: conversation.tenant_id should be Platform ID
6. Verify can see conversation in UI
```

**Test Case 2: Client Tenant User (Acme)**
```
1. Login as user assigned to Acme tenant only
2. Access via http://acme.localhost:3000
3. Navigate to /agents page
4. Verify sees only:
   - Acme-specific agents (where agents.tenant_id = 'acme-corp-tenant-id-123')
   - Globally shared agents (where agents.is_global = true)
5. Verify CANNOT see agents from Beta tenant
6. Create conversation
7. Check database: conversation.tenant_id should be Acme ID
8. Try accessing Beta tenant data (should fail):
   curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/agents?tenant_id=beta-health-tenant-id-456
   Expected: Empty array or 403 Forbidden
```

**Test Case 3: Multi-Tenant User**
```
1. Login as user assigned to both Acme and Beta
2. Access via http://acme.localhost:3000
3. Verify sees Acme data
4. Use TenantSwitcher to switch to Beta
5. Verify sees Beta data
6. Check localStorage: tenant_id should change
7. Verify x-tenant-id header updates
```

**Test Case 4: RLS Policy Enforcement**
```sql
-- Impersonate user and test RLS
SET LOCAL auth.uid = 'YOUR_TEST_USER_ID';
SET LOCAL request.headers.tenant_id = 'acme-corp-tenant-id-123';

-- Should return only Acme agents
SELECT id, name, tenant_id FROM agents
WHERE tenant_id = 'acme-corp-tenant-id-123' OR is_global = true;

-- Should return empty (user not assigned to Beta)
SET LOCAL request.headers.tenant_id = 'beta-health-tenant-id-456';
SELECT id, name FROM agents;
```

**Success Criteria:**
- [ ] Platform users see all data
- [ ] Client users see only their tenant's data
- [ ] Multi-tenant users can switch and see correct data
- [ ] RLS policies prevent unauthorized access
- [ ] No data leakage between tenants
- [ ] All database queries include tenant_id

---

### Step 6: Deploy to Vercel (60 minutes)

**Objective:** Deploy with wildcard domain support

#### 6.1: Prepare for Deployment

**Update Environment Variables:**

Create `apps/digital-health-startup/.env.production` (DO NOT COMMIT):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_PLATFORM_TENANT_ID=00000000-0000-0000-0000-000000000001
NODE_ENV=production
```

**Test Production Build:**
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run build

# Should complete without critical errors
# styled-jsx error is OK
```

#### 6.2: Deploy to Vercel

**Option A: Via CLI (Recommended)**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy from app directory
cd apps/digital-health-startup
vercel --prod

# Project name: vital-platform
# Framework: Next.js
# Root directory: ./
```

**Option B: Via GitHub Integration**

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure project settings
4. Deploy

#### 6.3: Configure Domains in Vercel

**In Vercel Dashboard:**

1. Go to Project → Settings → Domains
2. Add domains:
   - `app.vital.expert` (primary domain)
   - `*.vital.expert` (wildcard for all subdomains)
   - `www.vital.expert` (optional, redirect to app)

**DNS Configuration:**

In your DNS provider (e.g., Cloudflare, Namecheap):

```
Type   Name    Value
A      @       76.76.21.21 (Vercel IP)
CNAME  *       cname.vercel-dns.com
CNAME  app     cname.vercel-dns.com
CNAME  www     cname.vercel-dns.com
```

#### 6.4: Add Environment Variables in Vercel

**In Vercel Dashboard → Settings → Environment Variables:**

Add all variables from `.env.production`:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- NEXT_PUBLIC_PLATFORM_TENANT_ID

**Important:** Set environment to "Production"

#### 6.5: Test Production Deployment

```bash
# Test platform tenant
curl -I https://app.vital.expert

# Test subdomain routing
curl -I https://acme.vital.expert

# Test API
curl https://app.vital.expert/api/agents | jq '.length'
```

**Browser Testing:**
1. Visit https://app.vital.expert
2. Check SSL certificate (should be valid)
3. Login and test functionality
4. Visit https://acme.vital.expert
5. Verify tenant detection works
6. Check Network tab for `x-tenant-id` header

**Success Criteria:**
- [ ] SSL certificates valid
- [ ] Platform domain works (app.vital.expert)
- [ ] Wildcard works (acme.vital.expert, beta.vital.expert)
- [ ] Tenant detection works in production
- [ ] Authentication works
- [ ] All features functional
- [ ] Lighthouse score > 80

---

## Rollback Plan

### If Deployment Fails:

**Vercel:**
```bash
# In Vercel Dashboard:
# 1. Go to Deployments tab
# 2. Find previous working deployment
# 3. Click "Promote to Production"

# Or via CLI:
vercel rollback
```

**If Tenant Detection Breaks:**
1. Revert tenant-middleware.ts to simplified version:
```typescript
const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export async function tenantMiddleware(request, response) {
  const tenantId = PLATFORM_TENANT_ID;
  response.headers.set('x-tenant-id', tenantId);
  return response;
}
```
2. Redeploy
3. Debug locally before trying again

---

## Success Checklist

### Multi-Tenant Implementation Complete ✅
- [ ] Full tenant detection implemented (subdomain/header/cookie)
- [ ] Browser testing passed
- [ ] Test tenants created in database
- [ ] Subdomain routing works locally
- [ ] End-to-end testing passed (all 4 test cases)
- [ ] RLS policies enforced
- [ ] No data leakage between tenants

### Deployment Complete ✅
- [ ] Production build succeeds
- [ ] Deployed to Vercel
- [ ] Wildcard domains configured
- [ ] DNS records updated
- [ ] SSL certificates valid
- [ ] Platform domain works (app.vital.expert)
- [ ] Subdomain routing works in production
- [ ] All environment variables set
- [ ] Lighthouse score > 80

---

## Timeline Estimate

| Task | Estimated Time | Actual Time |
|------|---------------|-------------|
| Browser Testing | 15 min | |
| Implement Full Tenant Detection | 45 min | |
| Create Test Tenants | 20 min | |
| Test Subdomain Routing | 20 min | |
| End-to-End Testing | 30 min | |
| Deploy to Vercel | 60 min | |
| **Total** | **3 hours** | |

---

## Resources

### Documentation
- [MULTITENANT_STATUS_CURRENT.md](MULTITENANT_STATUS_CURRENT.md) - Current status
- [UNIFIED_DEPLOYMENT_PLAN.md](UNIFIED_DEPLOYMENT_PLAN.md) - Original deployment plan
- [LOCALHOST_DEPLOYMENT_SUCCESS.md](LOCALHOST_DEPLOYMENT_SUCCESS.md) - Localhost setup

### Key Files
- **Middleware:** [tenant-middleware.ts](apps/digital-health-startup/src/middleware/tenant-middleware.ts)
- **Context:** [TenantContext.tsx](apps/digital-health-startup/src/contexts/TenantContext.tsx)
- **Config:** [next.config.mjs](apps/digital-health-startup/next.config.mjs)

### Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Test tenant detection
curl -H "x-tenant-id: test" http://localhost:3000 -v
```

---

## Next Session

After completing multi-tenant:
1. Deploy backend to Railway (see UNIFIED_DEPLOYMENT_PLAN.md Phase 6)
2. Connect frontend to Railway backend
3. End-to-end integration testing
4. Performance optimization
5. Monitoring setup

---

**Created:** October 26, 2025
**Status:** Ready to execute
**Estimated Completion:** 3 hours from start
**Current Server:** ✅ Running on http://localhost:3000
