# VITAL Platform - Production Deployment Guide

**Version:** 1.0
**Date:** October 26, 2025
**Status:** Ready for Deployment

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Railway Backend Deployment](#part-1-railway-backend-deployment)
4. [Part 2: Vercel Frontend Deployment](#part-2-vercel-frontend-deployment)
5. [Part 3: Integration & Testing](#part-3-integration--testing)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Overview

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    VITAL Platform                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Vercel)                                        │
│  ├─ vital.expert (Marketing)                             │
│  └─ *.vital.expert (Multi-tenant Platform)               │
│                                                           │
│  Backend (Railway)                                        │
│  ├─ ai-engine (Python FastAPI)                           │
│  ├─ api-gateway (Node.js Express)                        │
│  └─ Redis (Cache)                                        │
│                                                           │
│  Database (Supabase)                                      │
│  └─ PostgreSQL with RLS                                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Monthly Cost Estimate

| Service | Provider | Cost |
|---------|----------|------|
| Frontend - Marketing | Vercel Pro | $20 |
| Frontend - Platform | Vercel Pro | $20 |
| AI Engine | Railway | $20 |
| API Gateway | Railway | $5 |
| Redis Cache | Railway | $5 |
| Database | Supabase Pro | $25 |
| OpenAI API | Usage-based | ~$500 |
| **Total** | | **~$595-610/month** |

---

## Prerequisites

### Required Accounts

- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Supabase account (existing)
- [ ] OpenAI API key
- [ ] Domain DNS access (vital.expert)

### Required Tools

```bash
# Install Railway CLI
npm install -g @railway/cli

# Install Vercel CLI
npm install -g vercel

# Verify installations
railway --version
vercel --version
```

### Environment Variables to Prepare

Create a secure file to store these values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# Platform
NEXT_PUBLIC_PLATFORM_TENANT_ID=00000000-0000-0000-0000-000000000001
```

---

## Part 1: Railway Backend Deployment

### Step 1.1: Deploy AI Engine (Python FastAPI)

**Directory:** `services/ai-engine`

1. **Login to Railway**
```bash
cd services/ai-engine
railway login
```

2. **Create New Project**
```bash
railway init
# Project name: vital-ai-engine
# Select: Create new project
```

3. **Link to Project**
```bash
railway link
```

4. **Set Environment Variables**

Via Railway Dashboard (https://railway.app):
- Go to your project → ai-engine service → Variables
- Add the following:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
ENVIRONMENT=production
LOG_LEVEL=info
MAX_TOKENS=4096
TEMPERATURE=0.7

# Redis (will be added after Redis setup)
REDIS_URL=${{Redis.REDIS_URL}}
```

5. **Deploy**
```bash
railway up
```

6. **Get Service URL**
```bash
railway domain
# Example: https://ai-engine-production.up.railway.app
```

7. **Test Health Endpoint**
```bash
curl https://ai-engine-production.up.railway.app/health
# Expected: {"status": "healthy", ...}
```

---

### Step 1.2: Deploy API Gateway (Node.js)

**Directory:** `services/api-gateway`

1. **Navigate and Initialize**
```bash
cd services/api-gateway
railway init
# Project name: vital-api-gateway
```

2. **Set Environment Variables**

Via Railway Dashboard:

```env
# AI Engine (use URL from Step 1.1)
AI_ENGINE_URL=https://ai-engine-production.up.railway.app

# Supabase
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
NODE_ENV=production
PORT=3001

# Redis (will be added after Redis setup)
REDIS_URL=${{Redis.REDIS_URL}}
```

3. **Deploy**
```bash
railway up
```

4. **Get Service URL**
```bash
railway domain
# Example: https://api-gateway-production.up.railway.app
```

5. **Test Health Endpoint**
```bash
curl https://api-gateway-production.up.railway.app/health
# Expected: {"status": "healthy", "connections": {...}}
```

---

### Step 1.3: Deploy Redis Cache

1. **In Railway Dashboard**
   - Click "New Service"
   - Select "Database" → "Redis"
   - Name: `vital-redis`

2. **Get Connection URL**
   - Go to Redis service → Variables
   - Copy `REDIS_URL` value

3. **Add Redis URL to Other Services**
   - Go to ai-engine → Variables → Add `REDIS_URL`
   - Go to api-gateway → Variables → Add `REDIS_URL`

4. **Verify Connection**
```bash
# From ai-engine logs:
railway logs --service ai-engine
# Should see: "Redis connected"

# From api-gateway logs:
railway logs --service api-gateway
# Should see: "Redis: Connected"
```

---

### Step 1.4: Verify Backend Stack

**Test Complete Backend Flow:**

```bash
# Test AI Engine health
curl https://ai-engine-production.up.railway.app/health

# Test API Gateway health
curl https://api-gateway-production.up.railway.app/health

# Test chat completion through gateway
curl -X POST https://api-gateway-production.up.railway.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "messages": [{"role": "user", "content": "Hello, test message"}],
    "model": "gpt-4-turbo-preview"
  }'
```

**Expected Response:**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "..."
      }
    }
  ]
}
```

---

## Part 2: Vercel Frontend Deployment

### Step 2.1: Deploy Marketing Site

**Directory:** `apps/digital-health-startup`

1. **Login to Vercel**
```bash
cd apps/digital-health-startup
vercel login
```

2. **Deploy to Production**
```bash
vercel --prod
# Project name: vital-marketing
# Framework: Next.js
# Root directory: .
```

3. **Set Environment Variables**

Via Vercel Dashboard (https://vercel.com/dashboard):
- Go to Project Settings → Environment Variables
- Add for **Production**, **Preview**, and **Development**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# Backend APIs (from Railway)
NEXT_PUBLIC_API_GATEWAY_URL=https://api-gateway-production.up.railway.app
AI_ENGINE_URL=https://ai-engine-production.up.railway.app

# Multi-tenant
NEXT_PUBLIC_PLATFORM_TENANT_ID=00000000-0000-0000-0000-000000000001
ENABLE_TENANT_ISOLATION=true
```

4. **Configure Custom Domain**

In Vercel Dashboard → Project → Settings → Domains:
- Add domain: `vital.expert`
- Add domain: `www.vital.expert`

5. **Configure DNS**

In your DNS provider (e.g., Cloudflare):
```
Type  Name     Value                      TTL
A     @        76.76.21.21                Auto
CNAME www      cname.vercel-dns.com       Auto
```

6. **Redeploy to Apply Variables**
```bash
vercel --prod
```

7. **Test Marketing Site**
```bash
# Wait for DNS propagation (5-10 minutes)
curl -I https://vital.expert
# Expected: HTTP/2 200
```

---

### Step 2.2: Deploy Platform (Multi-Tenant)

**Option A: Same Project with Wildcard Domain**

1. **Add Wildcard Domain**

In Vercel Dashboard → vital-marketing → Settings → Domains:
- Add domain: `*.vital.expert`
- Add domain: `app.vital.expert`

2. **Configure Wildcard DNS**
```
Type  Name  Value                TTL
CNAME *     cname.vercel-dns.com Auto
```

3. **Test Wildcard**
```bash
curl -I https://app.vital.expert
curl -I https://acme.vital.expert
# Both should return HTTP/2 200
```

**Option B: Separate Vercel Project (Recommended)**

1. **Create Second Deployment**
```bash
cd apps/digital-health-startup
vercel --prod
# Project name: vital-platform
```

2. **Configure Same Environment Variables** (as Step 2.1.3)

3. **Add Wildcard Domain** (as Option A)

4. **Update Frontend Code**

Ensure [middleware.ts](apps/digital-health-startup/src/middleware.ts) handles subdomain detection:

```typescript
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  console.log('🔍 Middleware - Subdomain detected:', subdomain);

  let response = NextResponse.next();
  response = await tenantMiddleware(request, response);

  return response;
}
```

---

### Step 2.3: Verify Frontend Deployment

**Test All Routes:**

```bash
# Marketing site
curl -I https://vital.expert
curl -I https://www.vital.expert

# Platform (default)
curl -I https://app.vital.expert

# Subdomain (tenant)
curl -I https://acme.vital.expert
curl -I https://test.vital.expert
```

**Browser Testing:**

1. Visit https://vital.expert - Marketing page should load
2. Visit https://app.vital.expert - Platform dashboard should load
3. Open DevTools → Network tab
4. Reload page
5. Check request headers for `x-tenant-id`
6. Verify API calls go to Railway backend

---

## Part 3: Integration & Testing

### Test Scenario 1: Anonymous User Journey

```
1. Visit https://vital.expert
2. Click "Get Started" or "Sign Up"
3. Create account
4. Verify redirect to https://app.vital.expert/dashboard
5. Verify Platform Tenant ID assigned
```

### Test Scenario 2: Authenticated Chat Flow

```
1. Login at https://app.vital.expert
2. Navigate to /chat
3. Select agent (e.g., "FDA Regulatory Strategist")
4. Send message: "What are the requirements for 510(k) submission?"
5. Verify:
   - Response streams from Railway
   - x-tenant-id header present
   - No errors in console
```

### Test Scenario 3: Multi-Tenant Isolation

```
1. Create test tenant in Supabase:
   INSERT INTO tenants (id, name, slug, type, is_active)
   VALUES (
     gen_random_uuid(),
     'Acme Corp',
     'acme',
     'client',
     true
   );

2. Visit https://acme.vital.expert
3. Login with user assigned to Acme tenant
4. Verify:
   - Middleware detects subdomain
   - x-tenant-id = Acme tenant ID (not Platform)
   - Only sees agents assigned to Acme + globally shared agents
```

### Performance Testing

```bash
# Test response times
curl -w "@curl-format.txt" -o /dev/null -s https://app.vital.expert

# Create curl-format.txt:
cat > curl-format.txt <<EOF
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
EOF

# Expected:
# time_total < 2.0s (good)
# time_total < 1.0s (excellent)
```

---

## Troubleshooting

### Issue: Railway Service Won't Start

**Symptoms:** Service shows "Deploying..." indefinitely

**Solutions:**
```bash
# Check logs
railway logs --service ai-engine

# Common issues:
# 1. Missing environment variables
railway variables

# 2. Port binding error (ensure using 0.0.0.0)
# In Dockerfile: CMD [..., "--host", "0.0.0.0"]

# 3. Health check failing
curl https://your-service.railway.app/health
```

### Issue: Vercel Build Fails

**Symptoms:** "Build failed" in Vercel deployment

**Solutions:**
```bash
# Test build locally
cd apps/digital-health-startup
npm run build

# Check environment variables
vercel env ls

# View build logs
vercel inspect [deployment-url]
```

### Issue: CORS Errors

**Symptoms:** Browser shows "blocked by CORS policy"

**Solutions:**

1. Check api-gateway CORS config includes your domain:
```javascript
// services/api-gateway/src/index.js
cors({
  origin: [
    'https://vital.expert',
    'https://app.vital.expert',
    /^https:\/\/.*\.vital\.expert$/  // Wildcard
  ],
})
```

2. Redeploy api-gateway:
```bash
cd services/api-gateway
railway up
```

### Issue: Tenant Not Detected

**Symptoms:** Always shows Platform Tenant ID

**Solutions:**

1. Check middleware logs:
```javascript
// middleware.ts
console.log('🔍 Hostname:', hostname);
console.log('🔍 Subdomain:', subdomain);
```

2. Verify DNS propagation:
```bash
dig acme.vital.expert
# Should return Vercel IP
```

3. Check tenant exists in database:
```sql
SELECT * FROM tenants WHERE slug = 'acme';
```

---

## Rollback Procedures

### Rollback Frontend (Vercel)

**Via Dashboard:**
1. Go to Vercel → Project → Deployments
2. Find previous working deployment
3. Click "⋯" menu → "Promote to Production"

**Via CLI:**
```bash
vercel rollback [deployment-url]
```

### Rollback Backend (Railway)

**Via Dashboard:**
1. Go to Railway → Service → Deployments
2. Click previous deployment
3. Click "Redeploy"

**Via CLI:**
```bash
railway rollback
```

### Emergency Rollback

If both frontend and backend need rollback:

```bash
# 1. Rollback backend first (to avoid API version mismatch)
cd services/api-gateway
railway rollback

cd services/ai-engine
railway rollback

# 2. Then rollback frontend
cd apps/digital-health-startup
vercel rollback [previous-deployment-url]
```

---

## Monitoring & Maintenance

### Railway Monitoring

**Built-in Metrics:**
- CPU usage
- Memory usage
- Network I/O
- Request count

Access: Railway Dashboard → Service → Metrics

### Vercel Analytics

**Built-in Metrics:**
- Visitor count
- Core Web Vitals
- Page load times

Access: Vercel Dashboard → Project → Analytics

### Custom Logging

**View Logs:**
```bash
# Railway
railway logs --service ai-engine
railway logs --service api-gateway

# Vercel
vercel logs [deployment-url]
```

### Health Checks

**Automated Monitoring (Optional - UptimeRobot):**

Free tier monitors every 5 minutes:
- https://api-gateway-production.up.railway.app/health
- https://ai-engine-production.up.railway.app/health
- https://vital.expert
- https://app.vital.expert

---

## Next Steps

After successful deployment:

- [ ] Set up automated backups (Supabase: Dashboard → Settings → Backups)
- [ ] Configure custom error pages (Vercel: Create `pages/404.tsx`, `pages/500.tsx`)
- [ ] Add analytics (Google Analytics, PostHog, or Plausible)
- [ ] Set up error tracking (Sentry)
- [ ] Configure rate limiting per tenant
- [ ] Create staging environments
- [ ] Document API endpoints (Swagger/OpenAPI)
- [ ] Set up CI/CD pipeline (GitHub Actions)

---

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **VITAL Platform Docs:** [UNIFIED_DEPLOYMENT_PLAN.md](UNIFIED_DEPLOYMENT_PLAN.md)

---

**Last Updated:** October 26, 2025
**Version:** 1.0
**Status:** Production Ready
**Estimated Deployment Time:** 2-3 hours
