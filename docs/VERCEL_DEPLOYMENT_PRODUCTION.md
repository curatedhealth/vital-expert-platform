# Vercel Deployment - Production Configuration

**Status:** Production Ready ✅  
**Date:** February 1, 2025  
**Phase:** 8.2 (Vercel Deployment Configuration)

---

## Overview

This document provides production deployment configuration for the VITAL Platform frontend and API Gateway on Vercel.

---

## Deployment Architecture

### Components Deployed to Vercel

1. **Frontend (Next.js)**
   - Location: `apps/digital-health-startup`
   - Framework: Next.js 14 (App Router)
   - Runtime: Node.js 22.x

2. **API Routes (Next.js API Routes)**
   - Location: `apps/digital-health-startup/src/app/api`
   - Runtime: Node.js (serverless functions)
   - Timeout: Configurable per route (10s - 300s)

3. **API Gateway (Express.js)**
   - **Note:** API Gateway runs separately (Railway/Modal/Docker)
   - Frontend routes proxy requests to API Gateway via `API_GATEWAY_URL`

---

## Vercel Configuration

### Project Settings

**Root Directory:** `apps/digital-health-startup`

**Build Settings:**
- Build Command: `cd ../.. && pnpm install && cd apps/digital-health-startup && pnpm run build`
- Install Command: `cd ../.. && pnpm install --filter=@vital/digital-health-startup...`
- Output Directory: `.next`
- Framework: Next.js

**Node.js Version:** 22.x

---

## Function Timeout Configuration

API routes have different timeout requirements based on their operations:

### Short Timeout (10 seconds)
- **Orchestration API** (`/api/orchestrate`) - Simple orchestration

### Medium Timeout (60 seconds)
- **Panel APIs** (`/api/panel/*`) - Panel consultation
  - Risk Assessment
  - Action Items

### Long Timeout (300 seconds / 5 minutes)
- **Knowledge Upload** (`/api/knowledge/upload`) - Large file processing
- **Ask Expert APIs** (`/api/ask-expert/*`) - Complex AI operations
- **All other API routes** - Default timeout

**Configuration in `vercel.json`:**
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300
    },
    "src/app/api/knowledge/upload/route.ts": {
      "maxDuration": 300
    },
    "src/app/api/panel/**/*.ts": {
      "maxDuration": 60
    },
    "src/app/api/orchestrate/route.ts": {
      "maxDuration": 10
    },
    "src/app/api/ask-expert/**/*.ts": {
      "maxDuration": 300
    }
  }
}
```

---

## Environment Variables

### Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**API Gateway:**
```
NEXT_PUBLIC_API_GATEWAY_URL=https://api-gateway.your-domain.com
API_GATEWAY_URL=https://api-gateway.your-domain.com
```

**Application:**
```
NEXT_PUBLIC_APP_URL=https://www.vital.expert
NODE_ENV=production
```

### Optional Environment Variables

**LLM Providers (if not using API Gateway):**
```
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
GEMINI_API_KEY=your-gemini-key
```

**Other Services:**
```
REDIS_URL=your-redis-url
TAVILY_API_KEY=your-tavily-key
```

**Select Environments:**
- ✓ Production
- ✓ Preview
- ✓ Development

---

## Subdomain Routing

### Multi-Tenant Subdomain Detection

The API Gateway middleware (`services/api-gateway/src/middleware/tenant.js`) automatically detects tenants from subdomains:

**Format:** `{tenant-slug}.vital.expert`

**Example:**
- `digital-health-startup.vital.expert` → Tenant ID extracted from `tenants` table
- `www.vital.expert` → Platform tenant (default)
- `api.vital.expert` → Platform tenant (default)

**Configuration in Vercel:**
1. Add domain: `vital.expert`
2. Add wildcard: `*.vital.expert`
3. Vercel automatically routes subdomains to the same deployment

**Tenant Detection Priority:**
1. `x-tenant-id` header (highest priority)
2. Subdomain lookup
3. Cookie (`tenant_id`)
4. Platform tenant fallback

---

## Security Headers

Security headers are configured in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## Deployment Workflow

### Option 1: GitHub Integration (Recommended)

1. **Connect Repository:**
   - Go to Vercel Dashboard
   - Import Git Repository
   - Select: `curatedhealth/vital-expert-platform` (or your repo)

2. **Configure Project:**
   - Root Directory: `apps/digital-health-startup`
   - Framework: Next.js
   - Build settings: Auto-detected

3. **Set Environment Variables:**
   - Add all required variables (see above)
   - Select: Production, Preview, Development

4. **Deploy:**
   - Automatic on push to `main` branch
   - Preview deployments for pull requests

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
cd apps/digital-health-startup
vercel --prod

# Or deploy to preview
vercel
```

---

## Performance Optimization

### Next.js Optimizations

1. **Static Generation:** Pages pre-rendered at build time
2. **Image Optimization:** Automatic image optimization
3. **Bundle Analysis:** `npm run build:analyze`
4. **Code Splitting:** Automatic with Next.js App Router

### Vercel Optimizations

1. **Edge Network:** Global CDN distribution
2. **Serverless Functions:** Auto-scaling based on traffic
3. **Caching:** Automatic caching for static assets
4. **Compression:** Automatic gzip/brotli compression

---

## Monitoring

### Vercel Analytics

**Enable in Dashboard:**
- Settings → Analytics
- Enable Vercel Analytics
- View metrics in dashboard

**Metrics Tracked:**
- Page views
- Performance (Core Web Vitals)
- Function execution time
- Error rates

### Custom Monitoring

**API Gateway Logs:**
- All requests logged with tenant context
- Error tracking via structured logging
- Metrics exported to Prometheus

**Health Checks:**
- Frontend: Automatic via Vercel
- API Gateway: `/health` endpoint
- Python AI Engine: `/health` endpoint

---

## Troubleshooting

### Build Failures

**Issue:** Build timeout
**Solution:** Increase build timeout in Vercel dashboard (Settings → General → Build & Development Settings)

**Issue:** Memory limit exceeded
**Solution:** Optimize build (remove unused dependencies, reduce bundle size)

### Function Timeouts

**Issue:** API route exceeds timeout
**Solution:**
1. Increase timeout in `vercel.json` for that route
2. Optimize function execution time
3. Consider moving long-running operations to background jobs

### Subdomain Routing Issues

**Issue:** Subdomain not resolving
**Solution:**
1. Verify DNS configuration
2. Check domain added to Vercel project
3. Verify wildcard DNS record: `*.vital.expert` → Vercel

### Environment Variables

**Issue:** Missing environment variables
**Solution:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify variables set for correct environment (Production/Preview/Development)
3. Redeploy after adding variables

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Domain configured (`vital.expert` + `*.vital.expert`)
- [ ] Function timeouts configured correctly
- [ ] Security headers enabled
- [ ] Build passes locally: `npm run build`

### Post-Deployment

- [ ] Health check passing: `curl https://www.vital.expert/health`
- [ ] API Gateway accessible: `curl https://api-gateway.your-domain.com/health`
- [ ] Subdomain routing working: `curl https://digital-health-startup.vital.expert`
- [ ] Tenant detection working (check logs)
- [ ] Analytics tracking enabled
- [ ] Error monitoring configured

---

## Rollback Procedure

**If deployment fails:**

1. **Via Dashboard:**
   - Go to Deployments
   - Find last successful deployment
   - Click "..." → "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel rollback
   ```

---

## Next Steps

After Vercel deployment:

1. **Phase 8.3:** Set up monitoring & observability (Prometheus + Grafana)
2. **Phase 8.4:** Security hardening (rate limiting, CORS, HTTPS)
3. **Phase 9:** Final testing & validation

---

**Last Updated:** February 1, 2025  
**Status:** Production Ready ✅

