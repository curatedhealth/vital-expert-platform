# VITAL Platform - Unified Deployment & Multi-Tenant Completion Plan

**Date:** October 26, 2025
**Status:** 75% Multi-Tenant Complete | Ready for Deployment Planning
**Target:** Complete multi-tenant + Deploy to Vercel (Frontend) + Railway (Backend)

---

## Executive Summary

This plan combines the remaining 25% of multi-tenant implementation with a production deployment strategy:

- **Multi-Tenant Completion:** 1-2 hours of work remaining
- **Frontend Deployment:** 2 Vercel projects (Marketing + Platform)
- **Backend Deployment:** Railway (Python AI services + Node.js gateway)
- **Total Timeline:** 2-3 days for full deployment
- **Monthly Cost:** ~$610/month for unlimited tenants

---

## Phase 4: Complete Multi-Tenant Implementation (1-2 hours)

### Task 4.1: Fix TenantContext Imports (15 minutes)

**File:** [TenantContext.tsx](apps/digital-health-startup/src/contexts/TenantContext.tsx)

**Problem:** Imports from `@vital/shared/src/types/tenant.types` may not resolve correctly

**Fix:**
```typescript
// BEFORE:
import type { Tenant, UserTenant } from '@vital/shared/src/types/tenant.types';

// AFTER:
import type { Tenant, UserTenant } from '@vital/shared/types/tenant.types';
```

**Verification:**
```bash
npm run build
# Should compile without module resolution errors
```

---

### Task 4.2: Browser Testing (20 minutes)

**Objective:** Verify multi-tenant UI works in browser

**Steps:**

1. **Start Dev Server**
```bash
cd apps/digital-health-startup
npm run dev
# Server: http://localhost:3000
```

2. **Visual Verification**
- Navigate to http://localhost:3000/dashboard
- Verify TenantSwitcher appears in top navigation
- Check for React errors in console

3. **Check Tenant Headers**
- Open DevTools → Network tab
- Navigate to any page
- Click on a request → Headers
- Verify `x-tenant-id: 00000000-0000-0000-0000-000000000001` present

4. **Test Tenant Context**
- Open browser console
- Type: `console.log(window.__TENANT_DEBUG__)`
- Should show current tenant info (if implemented)

**Success Criteria:**
- ✅ No JavaScript errors in console
- ✅ TenantSwitcher renders visually
- ✅ `x-tenant-id` header present in requests
- ✅ Page loads without 500 errors

---

### Task 4.3: Restore Full Tenant Detection (30 minutes)

**File:** [tenant-middleware.ts](apps/digital-health-startup/src/middleware/tenant-middleware.ts)

**Current State:** Hardcoded to Platform Tenant
**Target State:** Detect from subdomain → header → cookie → fallback

**Implementation:**

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

  // 1. Try subdomain detection (e.g., acme.vital.expert)
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  if (subdomain && subdomain !== 'www' && subdomain !== 'vital') {
    // Query database for tenant by slug
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

  // 2. Try x-tenant-id header
  if (!tenantId || tenantId === PLATFORM_TENANT_ID) {
    const headerTenantId = request.headers.get('x-tenant-id');
    if (headerTenantId) {
      tenantId = headerTenantId;
    }
  }

  // 3. Try cookie
  if (!tenantId || tenantId === PLATFORM_TENANT_ID) {
    const cookieTenantId = request.cookies.get('tenant_id')?.value;
    if (cookieTenantId) {
      tenantId = cookieTenantId;
    }
  }

  // 4. Fallback to Platform Tenant
  if (!tenantId) {
    tenantId = PLATFORM_TENANT_ID;
  }

  // Create response with tenant header
  const newResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  newResponse.headers.set('x-tenant-id', tenantId);

  // Also set cookie for persistence
  newResponse.cookies.set('tenant_id', tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return newResponse;
}
```

**Testing:**
```bash
# Test with different scenarios
curl -H "x-tenant-id: test-tenant-id" http://localhost:3000
curl http://acme.localhost:3000  # Subdomain test (requires DNS setup)
```

---

### Task 4.4: Optional - Update Agent Services (1 hour)

**Goal:** Replace direct Supabase calls with TenantAwareAgentService

**Files to Update:**
- `src/features/agents/services/agent-service.ts`
- Any component using `loadAvailableAgents()`

**Example Refactor:**

```typescript
// BEFORE:
import { loadAvailableAgents } from '@/features/agents/services/agent-service';

const agents = await loadAvailableAgents();

// AFTER:
import { TenantAwareAgentService } from '@/lib/services/tenant-aware-agent-service';
import { useTenant } from '@/contexts/TenantContext';

const { currentTenant } = useTenant();
const agentService = new TenantAwareAgentService(currentTenant.id);
const agents = await agentService.getAgents();
```

**Priority:** Low (RLS already handles filtering automatically)

---

## Phase 5: Vercel Frontend Deployment (3-4 hours)

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  DNS Configuration                   │
├─────────────────────────────────────────────────────┤
│ vital.expert          → Vercel Project 1 (Marketing)│
│ www.vital.expert      → Vercel Project 1 (Marketing)│
│ *.vital.expert        → Vercel Project 2 (Platform) │
│   ├─ app.vital.expert    (main app)                 │
│   ├─ acme.vital.expert   (tenant: Acme Corp)        │
│   └─ pharma.vital.expert (tenant: Pharma Co)        │
└─────────────────────────────────────────────────────┘
```

---

### Deployment 5.1: Marketing Site (Project 1)

**App:** `apps/marketing` (to be created) OR use `apps/digital-health-startup` landing page

**Vercel Configuration:**

1. **Create Vercel Project**
```bash
cd apps/digital-health-startup  # Or apps/marketing
vercel login
vercel --prod
# Follow prompts:
# - Project name: vital-marketing
# - Framework: Next.js
# - Root directory: apps/digital-health-startup
```

2. **Environment Variables** (Vercel Dashboard → Settings → Environment Variables)

```env
# Public
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://api-gateway-production.up.railway.app

# Secret (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
```

3. **Custom Domain Setup**

In Vercel Dashboard:
- Go to Project Settings → Domains
- Add domain: `vital.expert`
- Add domain: `www.vital.expert`
- Vercel provides DNS instructions

4. **Build Configuration** (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

5. **Deploy**
```bash
vercel --prod
```

**Verify:**
- Visit https://vital.expert
- Check SSL certificate valid
- Test page load speed

---

### Deployment 5.2: Multi-Tenant Platform (Project 2)

**App:** `apps/digital-health-startup` (full platform)

**Vercel Configuration:**

1. **Create Second Vercel Project**
```bash
cd apps/digital-health-startup
vercel --prod
# Project name: vital-platform
```

2. **Environment Variables** (Same as Marketing + Additional)

```env
# All previous variables, PLUS:

# Multi-tenant specific
NEXT_PUBLIC_PLATFORM_TENANT_ID=00000000-0000-0000-0000-000000000001
ENABLE_TENANT_ISOLATION=true
ALLOWED_TENANT_DOMAINS=*.vital.expert

# AI Backend (Railway)
AI_ENGINE_URL=https://ai-engine-production.up.railway.app
API_GATEWAY_URL=https://api-gateway-production.up.railway.app

# Redis (Railway)
REDIS_URL=redis://default:password@redis.railway.internal:6379
```

3. **Wildcard Domain Setup**

In Vercel Dashboard:
- Go to Project Settings → Domains
- Add domain: `app.vital.expert` (default)
- Add domain: `*.vital.expert` (wildcard)

**DNS Configuration:**
```
Type  Name     Value
A     @        76.76.21.21 (Vercel IP)
CNAME www      cname.vercel-dns.com
CNAME *        cname.vercel-dns.com  ← WILDCARD
```

4. **Middleware Configuration for Subdomains**

Update [middleware.ts](apps/digital-health-startup/src/middleware.ts):

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tenantMiddleware } from './middleware/tenant-middleware';

export async function middleware(request: NextRequest) {
  // Extract subdomain
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // If subdomain is a tenant slug, detect it
  let response = NextResponse.next();

  // Apply tenant middleware
  response = await tenantMiddleware(request, response);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

5. **Deploy**
```bash
vercel --prod
```

**Verify:**
- Visit https://app.vital.expert (default tenant)
- Visit https://acme.vital.expert (should detect subdomain)
- Check `x-tenant-id` header changes per subdomain

---

### Deployment 5.3: Frontend Testing Checklist

**Functional Tests:**
- [ ] Marketing site loads (https://vital.expert)
- [ ] Platform app loads (https://app.vital.expert)
- [ ] Subdomain routing works (https://test.vital.expert)
- [ ] Authentication flow works
- [ ] API calls reach Railway backend
- [ ] Tenant switching UI works
- [ ] All 254 agents load correctly

**Performance Tests:**
- [ ] Lighthouse score > 90
- [ ] Time to First Byte < 200ms
- [ ] Core Web Vitals pass
- [ ] Image optimization works

**Security Tests:**
- [ ] SSL/TLS certificates valid
- [ ] CORS configured correctly
- [ ] Environment variables not exposed
- [ ] RLS policies enforced

---

## Phase 6: Railway Backend Deployment (2-3 hours)

### Architecture Overview

```
┌────────────────────────────────────────────────────┐
│              Railway Infrastructure                 │
├────────────────────────────────────────────────────┤
│ Service 1: ai-engine (Python FastAPI)             │
│   - LangChain/LangGraph AI orchestration          │
│   - Long-running inference tasks                  │
│   - No timeout limits                             │
│                                                    │
│ Service 2: api-gateway (Node.js Express)          │
│   - Route requests to ai-engine                   │
│   - Authentication/authorization                  │
│   - Rate limiting                                 │
│                                                    │
│ Service 3: Redis (Managed)                        │
│   - Cache layer                                   │
│   - Session storage                               │
│   - Rate limit counters                           │
└────────────────────────────────────────────────────┘
```

---

### Deployment 6.1: AI Engine (Python FastAPI)

**Project:** `backend/ai-engine`

**Prerequisites:**

1. **Create Dockerfile** (`backend/ai-engine/Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Create requirements.txt** (`backend/ai-engine/requirements.txt`)

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
langchain==0.1.0
langchain-openai==0.0.2
langgraph==0.0.20
pydantic==2.5.0
supabase==2.0.0
redis==5.0.1
python-dotenv==1.0.0
httpx==0.25.2
```

3. **Railway CLI Setup**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link
```

4. **Create Railway Project**

```bash
cd backend/ai-engine
railway init

# Project name: vital-ai-engine
# Select: Create new project
```

5. **Configure Environment Variables** (Railway Dashboard)

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Redis
REDIS_URL=redis://default:password@redis.railway.internal:6379

# App Config
ENVIRONMENT=production
LOG_LEVEL=info
MAX_TOKENS=4096
TEMPERATURE=0.7
```

6. **Deploy**

```bash
railway up
```

**Verify:**
```bash
# Get service URL
railway domain

# Test health endpoint
curl https://ai-engine-production.up.railway.app/health
# Expected: {"status": "healthy", "version": "1.0.0"}

# Test inference endpoint
curl -X POST https://ai-engine-production.up.railway.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

---

### Deployment 6.2: API Gateway (Node.js)

**Project:** `backend/api-gateway`

**Prerequisites:**

1. **Create Dockerfile** (`backend/api-gateway/Dockerfile`)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Run Node.js server
CMD ["node", "index.js"]
```

2. **Create package.json** (`backend/api-gateway/package.json`)

```json
{
  "name": "vital-api-gateway",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "redis": "^4.6.11",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

3. **Create Express Server** (`backend/api-gateway/index.js`)

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'https://vital.expert',
    'https://app.vital.expert',
    /^https:\/\/.*\.vital\.expert$/
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway' });
});

// Proxy to AI Engine
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.AI_ENGINE_URL}/v1/chat/completions`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': req.headers['x-tenant-id']
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

4. **Deploy to Railway**

```bash
cd backend/api-gateway
railway init

# Project name: vital-api-gateway
railway up
```

5. **Configure Environment Variables** (Railway Dashboard)

```env
AI_ENGINE_URL=https://ai-engine-production.up.railway.app
REDIS_URL=redis://default:password@redis.railway.internal:6379
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

**Verify:**
```bash
curl https://api-gateway-production.up.railway.app/health
```

---

### Deployment 6.3: Redis Cache

**Setup:**

1. **In Railway Dashboard**
- Click "New Service"
- Select "Database" → "Redis"
- Name: `vital-redis`

2. **Get Connection String**
- Copy `REDIS_URL` from service variables
- Add to both ai-engine and api-gateway environments

3. **Test Connection** (from ai-engine)

```python
import redis
import os

r = redis.from_url(os.getenv('REDIS_URL'))
r.set('test', 'hello')
print(r.get('test'))  # Should print: b'hello'
```

---

### Deployment 6.4: Backend Testing Checklist

**Functional Tests:**
- [ ] AI Engine health check responds
- [ ] API Gateway health check responds
- [ ] Redis connection works
- [ ] Chat completion endpoint works
- [ ] Tenant headers passed correctly
- [ ] Rate limiting works

**Performance Tests:**
- [ ] Response time < 2s for inference
- [ ] No timeout errors on long requests
- [ ] Redis cache hit rate > 80%

**Integration Tests:**
- [ ] Frontend can call API Gateway
- [ ] API Gateway can call AI Engine
- [ ] Tenant isolation works end-to-end

---

## Phase 7: End-to-End Integration (2 hours)

### Integration 7.1: Connect Frontend to Backend

**Update Frontend Environment Variables** (Vercel)

```env
# Add these to vital-platform project
NEXT_PUBLIC_API_GATEWAY_URL=https://api-gateway-production.up.railway.app
AI_ENGINE_URL=https://ai-engine-production.up.railway.app
```

**Update API Calls** (Frontend)

Example: Update chat service to use Railway backend

```typescript
// src/lib/services/chat-service.ts

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001';

export async function sendChatMessage(
  message: string,
  tenantId: string,
  agentId: string
) {
  const response = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      agent_id: agentId,
    }),
  });

  return response.json();
}
```

---

### Integration 7.2: Test Complete Flow

**Test Scenario 1: Anonymous User → Marketing Site**
```
1. Visit https://vital.expert
2. Click "Get Started"
3. Sign up for account
4. Redirected to https://app.vital.expert/dashboard
5. Verify Platform Tenant ID assigned
```

**Test Scenario 2: Authenticated User → Platform**
```
1. Login at https://app.vital.expert
2. Navigate to Chat
3. Select an agent (e.g., FDA Regulatory Strategist)
4. Send message
5. Verify:
   - Message sent to Railway API Gateway
   - API Gateway forwards to AI Engine
   - Response streams back
   - x-tenant-id header present in all requests
```

**Test Scenario 3: Multi-Tenant Subdomain**
```
1. Create test tenant: "Acme Corp" with slug "acme"
2. Visit https://acme.vital.expert
3. Login with user assigned to Acme tenant
4. Verify:
   - Middleware detects subdomain
   - x-tenant-id = Acme tenant ID
   - Only sees Acme agents + globally shared agents
   - Cannot see other tenants' private agents
```

---

### Integration 7.3: Monitoring Setup

**Vercel Analytics** (Built-in)
- Enable in Project Settings → Analytics
- Monitor Core Web Vitals, visitor count

**Railway Observability**
- Built-in metrics for CPU, memory, network
- View in Railway Dashboard → Service → Metrics

**Custom Logging**

Add to ai-engine:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# In endpoints:
logger.info(f"Received chat request from tenant: {tenant_id}")
```

**Error Tracking** (Optional - Sentry)
```bash
# Install
npm install @sentry/nextjs  # Frontend
pip install sentry-sdk  # Backend

# Configure
SENTRY_DSN=https://...@sentry.io/...
```

---

## Phase 8: Cost Breakdown & Scaling

### Monthly Cost Analysis

| Service | Provider | Cost | Notes |
|---------|----------|------|-------|
| **Frontend - Marketing** | Vercel Pro | $20/month | Unlimited bandwidth |
| **Frontend - Platform** | Vercel Pro | $20/month | Wildcard domains |
| **Backend - AI Engine** | Railway | $20/month | 8GB RAM, no timeouts |
| **Backend - API Gateway** | Railway | $5/month | 2GB RAM |
| **Backend - Redis** | Railway | $5/month | 256MB |
| **Database - Supabase** | Pro Plan | $25/month | 8GB storage, 100K MAU |
| **LLM API - OpenAI** | Usage-based | ~$500/month | Estimate: 1M tokens/day |
| **DNS - Cloudflare** | Free | $0 | DNS + CDN |
| **Monitoring - Railway** | Included | $0 | Built-in metrics |

**Total: ~$595-610/month for unlimited tenants**

---

### Scaling Considerations

**Frontend (Vercel):**
- Auto-scales infinitely
- No configuration needed
- CDN edge caching worldwide

**Backend (Railway):**

**Current Tier:**
- AI Engine: $20/month (8GB RAM)
- API Gateway: $5/month (2GB RAM)

**Scale-Up Path:**
```
Growth Stage → Railway Professional
- AI Engine: $50/month (32GB RAM)
- Add: AI Engine Replica #2 ($50/month) - Load balancing
- Redis: $10/month (1GB) - Increased cache
```

**Enterprise Tier:**
- Move to Kubernetes (GKE/EKS)
- Horizontal autoscaling
- Multi-region deployment

**Database (Supabase):**
- Current: Pro Plan ($25/month) - 8GB storage
- Next: Team Plan ($599/month) - 500GB storage
- Enterprise: Custom pricing

---

## Timeline & Milestones

### Day 1: Multi-Tenant Completion + Frontend Deploy
**Morning (2 hours)**
- [ ] Fix TenantContext imports
- [ ] Test multi-tenant in browser
- [ ] Restore full tenant detection

**Afternoon (2 hours)**
- [ ] Deploy Marketing site to Vercel
- [ ] Configure DNS records
- [ ] Test marketing site live

**Evening (1 hour)**
- [ ] Deploy Platform to Vercel (without backend integration)
- [ ] Configure wildcard domains

---

### Day 2: Backend Deployment
**Morning (3 hours)**
- [ ] Create Dockerfiles for ai-engine and api-gateway
- [ ] Deploy ai-engine to Railway
- [ ] Deploy api-gateway to Railway
- [ ] Deploy Redis to Railway

**Afternoon (2 hours)**
- [ ] Configure environment variables
- [ ] Test backend endpoints independently
- [ ] Verify Railway services communicate

**Evening (1 hour)**
- [ ] Update frontend to call Railway backend
- [ ] Redeploy frontend with new API URLs

---

### Day 3: Testing & Refinement
**Morning (2 hours)**
- [ ] End-to-end testing (all 3 scenarios)
- [ ] Performance testing
- [ ] Security audit

**Afternoon (2 hours)**
- [ ] Fix any issues found
- [ ] Set up monitoring alerts
- [ ] Create runbook documentation

**Evening (1 hour)**
- [ ] Final smoke tests
- [ ] Go-live announcement
- [ ] Monitor for first 24 hours

---

## Rollback Procedures

### Frontend Rollback (Vercel)
```bash
# Vercel keeps all previous deployments
# In Vercel Dashboard:
# 1. Go to Deployments tab
# 2. Find previous working deployment
# 3. Click "Promote to Production"

# Or via CLI:
vercel rollback [deployment-url]
```

### Backend Rollback (Railway)
```bash
# Railway keeps deployment history
# In Railway Dashboard:
# 1. Go to service → Deployments
# 2. Click previous deployment
# 3. Click "Redeploy"

# Or via CLI:
railway rollback
```

### Database Rollback (If needed)
```sql
-- Restore from Supabase backup
-- In Supabase Dashboard:
-- 1. Database → Backups
-- 2. Select backup timestamp
-- 3. Click "Restore"
```

---

## Success Criteria

### ✅ Multi-Tenant Completion
- [ ] TenantContext imports fixed
- [ ] Browser testing passed
- [ ] Full tenant detection working
- [ ] Subdomain routing functional

### ✅ Frontend Deployment
- [ ] vital.expert accessible (Marketing)
- [ ] app.vital.expert accessible (Platform)
- [ ] Wildcard domains work (*.vital.expert)
- [ ] SSL certificates valid
- [ ] Lighthouse score > 90

### ✅ Backend Deployment
- [ ] AI Engine responding to requests
- [ ] API Gateway routing correctly
- [ ] Redis caching working
- [ ] No timeout errors on long requests
- [ ] Response time < 2s

### ✅ Integration
- [ ] Frontend → API Gateway → AI Engine flow works
- [ ] Tenant headers flow correctly
- [ ] RLS policies enforced
- [ ] All 254 agents accessible
- [ ] Tenant isolation verified

### ✅ Production Readiness
- [ ] Monitoring dashboards configured
- [ ] Error tracking enabled
- [ ] Backup procedures documented
- [ ] Rollback tested
- [ ] Team trained on deployment process

---

## Quick Command Reference

### Vercel Commands
```bash
# Deploy
vercel --prod

# Check status
vercel ls

# View logs
vercel logs [deployment-url]

# Add environment variable
vercel env add [NAME]

# Rollback
vercel rollback [deployment-url]
```

### Railway Commands
```bash
# Deploy
railway up

# Check status
railway status

# View logs
railway logs

# Add environment variable
railway variables set [NAME]=[VALUE]

# Rollback
railway rollback

# Get service URL
railway domain
```

### Testing Commands
```bash
# Test frontend
curl https://vital.expert
curl https://app.vital.expert

# Test backend
curl https://api-gateway-production.up.railway.app/health
curl https://ai-engine-production.up.railway.app/health

# Test tenant detection
curl -H "x-tenant-id: test-id" https://app.vital.expert/api/agents
```

---

## Next Steps

**Immediate (Start Now):**
1. Review this plan with team
2. Set up Vercel and Railway accounts
3. Begin Task 4.1 (Fix TenantContext imports)

**Within 24 Hours:**
4. Complete multi-tenant testing
5. Deploy marketing site to Vercel

**Within 48 Hours:**
6. Deploy backend to Railway
7. Connect frontend to backend

**Within 72 Hours:**
8. Complete end-to-end testing
9. Go live with production system

---

## Support Resources

**Vercel Documentation:**
- https://vercel.com/docs
- https://vercel.com/docs/concepts/projects/domains

**Railway Documentation:**
- https://docs.railway.app
- https://docs.railway.app/deploy/deployments

**VITAL Platform Docs:**
- [MULTI_TENANT_REMAINING_TASKS.md](MULTI_TENANT_REMAINING_TASKS.md)
- [PYTHON_HOSTING_OPTIONS_COMPARISON.md](PYTHON_HOSTING_OPTIONS_COMPARISON.md)
- [VITAL_VERCEL_DEPLOYMENT_RECOMMENDATIONS.md](VITAL_VERCEL_DEPLOYMENT_RECOMMENDATIONS.md)

---

**Document Created:** October 26, 2025
**Version:** 1.0
**Status:** Ready for Implementation
**Estimated Completion:** 2-3 days
**Total Cost:** ~$610/month
