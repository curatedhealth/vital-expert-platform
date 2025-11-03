# Multi-Tenant Setup Instructions

## Current Status: ✅ Middleware Implemented

### What's Been Completed

1. **Tenant Middleware** - Full subdomain-based tenant detection with 4-tier priority:
   - Subdomain detection (queries Supabase for tenant by slug)
   - x-tenant-id header
   - tenant_id cookie
   - Platform Tenant fallback

2. **Access Control** - Client-only pages now restricted to non-platform tenants:
   - `/agents` - Redirects to `/` when accessed on Platform Tenant
   - `/ask-expert` - Client tenant only
   - `/ask-panel` - Client tenant only
   - `/chat` - Client tenant only

3. **API Route** - `/api/agents-crud` created to fetch 254 agents from remote Supabase

4. **Test Tenants Created in Remote Supabase:**
   - VITAL Platform (platform tenant) - `vital-platform`
   - Digital Health Startups (client tenant) - `digital-health-startups`
   - Pharma Companies (client tenant) - `pharma`

---

## Next Steps to Complete Testing

### Step 1: Add /etc/hosts Entries

**You need to manually add these entries** (requires sudo password):

```bash
sudo nano /etc/hosts
```

Add these lines at the end:

```
# VITAL Platform - Local Tenant Subdomains
127.0.0.1 digital-health-startups.localhost
127.0.0.1 pharma.localhost
```

Save and exit (Ctrl+X, then Y, then Enter).

Or run the provided script:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
./scripts/setup-local-tenants.sh
```

---

### Step 2: Verify Subdomain Routing

Test tenant detection with curl:

```bash
# Test Platform Tenant (localhost)
curl -v http://localhost:3000/ 2>&1 | grep "x-tenant-id"
# Should show: x-tenant-id: 00000000-0000-0000-0000-000000000001

# Test Digital Health Startups Tenant
curl -v http://digital-health-startups.localhost:3000/ 2>&1 | grep "x-tenant-id"
# Should show: x-tenant-id: <actual-tenant-id>

# Test Pharma Tenant
curl -v http://pharma.localhost:3000/ 2>&1 | grep "x-tenant-id"
# Should show: x-tenant-id: <actual-tenant-id>
```

---

### Step 3: Test Browser Access

#### Platform Tenant (Marketing Website):

- **URL:** http://localhost:3000/
- **Expected:** Marketing website loads
- **Expected:** Accessing http://localhost:3000/agents redirects to /

#### Digital Health Startups Tenant:

- **URL:** http://digital-health-startups.localhost:3000/
- **Expected:** Tenant home page loads
- **Expected:** http://digital-health-startups.localhost:3000/agents loads agents page with 254 agents

#### Pharma Tenant:

- **URL:** http://pharma.localhost:3000/
- **Expected:** Tenant home page loads
- **Expected:** http://pharma.localhost:3000/agents loads agents page with 254 agents

---

## Current Architecture

### Platform Tenant (localhost:3000)
**Purpose:** Marketing website for VITAL Expert platform
**Pages:**
- `/` - Marketing home
- `/platform` - Platform information
- `/services` - Services overview
- `/framework` - Framework documentation

**Restricted Pages:** (automatically redirect to `/`)
- `/agents` ❌
- `/ask-expert` ❌
- `/ask-panel` ❌
- `/chat` ❌

### Client Tenants (*.localhost:3000)
**Purpose:** Full application features for paying customers
**Pages:** All pages available including:
- `/` - Tenant dashboard
- `/agents` ✅ - Agent management
- `/ask-expert` ✅ - Expert consultation
- `/ask-panel` ✅ - Panel management
- `/chat` ✅ - Chat interface

---

## Tenant Detection Flow

```
Request arrives
   ↓
1. Check subdomain
   → Query Supabase for tenant by slug
   → If found, use tenant_id
   ↓
2. Check x-tenant-id header
   → If present, use header value
   ↓
3. Check tenant_id cookie
   → If present, use cookie value
   ↓
4. Fallback to Platform Tenant
   → Use 00000000-0000-0000-0000-000000000001
   ↓
Set response headers:
   - x-tenant-id
   - x-tenant-detection-method
   ↓
Set tenant_id cookie (30 days)
   ↓
Check if page is client-only
   → If Platform Tenant accessing client page: redirect to /
   → Otherwise: allow access
```

---

## Files Modified

### Core Middleware
- `apps/digital-health-startup/src/middleware.ts` - Main routing middleware with client-only page restrictions
- `apps/digital-health-startup/src/middleware/tenant-middleware.ts` - Tenant detection logic

### API Routes
- `apps/digital-health-startup/src/app/api/agents-crud/route.ts` - Agent fetching endpoint (newly created)

### Scripts
- `scripts/setup-local-tenants.sh` - Helper script to add /etc/hosts entries
- `scripts/create-remote-test-tenants.js` - Created test tenants in remote Supabase

---

## Environment Variables

Required in `.env.local`:

```bash
# Supabase (Remote Production Database)
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=VITAL Expert
```

---

## Testing Checklist

- [ ] /etc/hosts entries added
- [ ] Dev server running (`npm run dev`)
- [ ] Platform Tenant (localhost:3000) shows marketing website
- [ ] Platform Tenant blocks access to /agents (redirects to /)
- [ ] Digital Health Startups subdomain detects correct tenant
- [ ] Digital Health Startups /agents page loads with 254 agents
- [ ] Pharma subdomain detects correct tenant
- [ ] Pharma /agents page loads with 254 agents
- [ ] Tenant ID cookie persists across requests
- [ ] Tenant detection logs appear in console

---

## Troubleshooting

### Subdomain not resolving
**Symptom:** `digital-health-startups.localhost` doesn't load
**Fix:** Verify /etc/hosts entries with `cat /etc/hosts | grep localhost`

### Still seeing Platform Tenant on subdomain
**Symptom:** Subdomain shows Platform Tenant ID
**Fix:** Clear cookies and refresh browser

### Agents API returning 500
**Symptom:** Agents not loading, API error 500
**Fix:** Check Supabase credentials in `.env.local`

### Middleware not triggering
**Symptom:** No tenant logs in console
**Fix:** Restart dev server to pick up middleware changes

---

## Production Deployment

When deploying to production:

1. **Configure Vercel for wildcard domains:**
   - Add domain: `vital.expert`
   - Add wildcard: `*.vital.expert`

2. **Update environment variables:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://vital.expert
   ```

3. **Test with real subdomains:**
   - https://vital.expert (Platform Tenant)
   - https://digital-health-startups.vital.expert (Tenant 1)
   - https://pharma.vital.expert (Tenant 2)

---

## Dev Server Status

**Current Status:** ✅ Running on http://localhost:3000
**Middleware:** ✅ Active and blocking /agents on Platform Tenant
**Tenant Detection:** ✅ Working with fallback to Platform Tenant

**Log Output:**
```
[Tenant Middleware] Using Platform Tenant (fallback)
[Middleware] Blocking access to /agents on Platform Tenant - redirecting to /
```

This confirms the middleware is correctly detecting the Platform Tenant and blocking access to client-only pages.

---

## Next Action Required from You

**Please add the /etc/hosts entries** (requires your sudo password):

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
./scripts/setup-local-tenants.sh
```

Then test in browser:
1. http://localhost:3000/ (should show marketing)
2. http://localhost:3000/agents (should redirect to /)
3. http://digital-health-startups.localhost:3000/agents (should show agents)
