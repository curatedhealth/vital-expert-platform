# VITAL Platform - Domain Strategy (CORRECTED)

## Overview

Two Vercel projects with clear domain separation:

---

## Project 1: Marketing Site (vital-marketing)

**Purpose:** Public landing page - entry point for ALL tenants

### Domains:
- **Primary:** `www.vital.expert`
- **Redirect:** `vital.expert` → `www.vital.expert`

### Content:
- VITAL platform overview
- Features and benefits
- Pricing information
- "Get Started" CTA
- Contact information
- Links to tenant-specific portals

### Environment Variables (Minimal - Public Only):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://www.vital.expert
NODE_ENV=production
```

### DNS Configuration:
```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

**Vercel Domain Settings:**
- Add: `www.vital.expert` (primary)
- Add: `vital.expert` (with redirect to www)

---

## Project 2: Platform App (vital-platform) - Phase 2

**Purpose:** Multi-tenant application platform

### Domains:
- **Wildcard:** `*.vital.expert`

### Examples:
- `acme.vital.expert` - Acme Corp tenant portal
- `pharma.vital.expert` - Pharmaceutical company tenant
- `payers.vital.expert` - Payers/insurance tenant
- `consulting.vital.expert` - Consulting firm tenant
- `app.vital.expert` - Default/platform tenant (fallback)

### Features:
- Full authentication
- Agent chat interface
- Multi-tenant routing via subdomain
- User dashboards
- Expert panels
- RAG/AI capabilities

### Environment Variables (Full Stack):
```env
# All public variables from marketing site, PLUS:

# Backend APIs (Railway)
NEXT_PUBLIC_EXPERT_API_URL=https://[railway-url].up.railway.app
NEXT_PUBLIC_AGENT_API_URL=https://[railway-url].up.railway.app

# Server-side secrets
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=pcsk_...
GEMINI_API_KEY=AIza...

# Multi-tenant config
NEXT_PUBLIC_ENABLE_MULTI_TENANT=true
NEXT_PUBLIC_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001
```

### DNS Configuration:
```
Type    Name    Value
CNAME   *       cname.vercel-dns.com (wildcard)
```

**Vercel Domain Settings:**
- Add: `*.vital.expert` (wildcard - catches all subdomains)
- Add: `app.vital.expert` (optional - for default tenant)

---

## User Journey Flow

### New Visitor:
```
1. Visit www.vital.expert
   ↓
2. See marketing landing page
   ↓
3. Click "Get Started" or tenant-specific link
   ↓
4. Redirected to [tenant].vital.expert
   ↓
5. Login/Signup on tenant subdomain
   ↓
6. Access full platform features
```

### Existing User:
```
1. Visit [their-tenant].vital.expert directly
   ↓
2. Login if needed
   ↓
3. Access platform
```

### Tenant Administrator:
```
1. Visit admin.vital.expert (or specific admin subdomain)
   ↓
2. Manage tenant settings
   ↓
3. Configure branding, users, agents
```

---

## Middleware Tenant Detection

The platform app uses middleware to detect tenant:

```typescript
// apps/digital-health-startup/src/middleware.ts

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // Extract tenant from subdomain
  let tenantId = PLATFORM_TENANT_ID; // default

  if (subdomain && subdomain !== 'www' && subdomain !== 'vital') {
    // Query database for tenant by slug
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', subdomain)
      .eq('is_active', true)
      .single();

    if (tenant) {
      tenantId = tenant.id;
    }
  }

  // Add tenant ID to headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenantId);
  return response;
}
```

---

## Example Tenant Subdomains

### Healthcare Providers:
- `mayoclinic.vital.expert`
- `clevelandclinic.vital.expert`
- `johnshopkins.vital.expert`

### Pharma Companies:
- `pfizer.vital.expert`
- `modernatx.vital.expert`
- `jnj.vital.expert`

### Payers/Insurance:
- `uhc.vital.expert`
- `anthem.vital.expert`
- `cigna.vital.expert`

### Consulting Firms:
- `mckinsey.vital.expert`
- `bcg.vital.expert`
- `deloitte.vital.expert`

### Digital Health Startups:
- `acme-health.vital.expert`
- `healthtech-startup.vital.expert`

---

## Phase 1: Marketing Site Deployment (Current)

**Objective:** Get `www.vital.expert` live

**Steps:**
1. Fix Vercel monorepo build (update dashboard settings)
2. Deploy marketing site successfully
3. Add custom domains: `www.vital.expert` and `vital.expert`
4. Configure DNS records
5. Verify site loads

**Time:** 15-20 minutes

---

## Phase 2: Platform App Deployment (Next)

**Objective:** Get `*.vital.expert` live with multi-tenant support

**Steps:**
1. Fix remaining build errors (disable experimental routes)
2. Create new Vercel project: `vital-platform`
3. Deploy with full environment variables
4. Add wildcard domain: `*.vital.expert`
5. Test tenant subdomain routing
6. Connect to Railway backend

**Time:** 30-45 minutes

---

## DNS Records Summary

At your DNS provider (e.g., Cloudflare, Route53, Namecheap):

```
Type    Name    Value                     Purpose
A       @       76.76.21.21              Root domain (vital.expert)
CNAME   www     cname.vercel-dns.com     Marketing site
CNAME   *       cname.vercel-dns.com     All tenant subdomains
```

**Note:** The wildcard (`*`) CNAME catches ALL subdomains and routes them to the platform app.

---

## Benefits of This Strategy

### ✅ Clear Separation:
- Marketing on `www` (public, fast, simple)
- Platform on subdomains (authenticated, complex, multi-tenant)

### ✅ SEO Optimized:
- `www.vital.expert` is the canonical marketing URL
- Better for search engine indexing

### ✅ Scalability:
- Add new tenants instantly (just create database record)
- No Vercel configuration needed per tenant

### ✅ Performance:
- Marketing site is lightweight (no heavy dependencies)
- Platform app only loads when needed

### ✅ Security:
- Marketing site has minimal environment variables
- Platform app has full secrets (behind authentication)

---

## Current Status

**Phase 1 (Marketing):**
- ⏳ Vercel build configuration needs update
- ⏳ Deployment pending
- ⏳ Domain configuration pending

**Phase 2 (Platform):**
- ⏳ Build errors need fixing
- ⏳ Not yet deployed

**Railway Backend:**
- ⏳ Deployment in progress
- ⏳ Environment variables set

---

## Next Immediate Steps

1. **Update Vercel Dashboard Settings** for `vital-marketing` project:
   - Install Command: `pnpm install`
   - Build Command: `cd apps/digital-health-startup && pnpm run build`
   - Root Directory: (empty)

2. **Redeploy** and watch build succeed

3. **Add Domains:**
   - `www.vital.expert` (primary)
   - `vital.expert` (redirect to www)

4. **Configure DNS** at your provider

---

**Document Created:** October 26, 2025
**Last Updated:** October 26, 2025
**Status:** Ready for Phase 1 deployment
