# Vercel Deployment Guide - VITAL Platform

## Overview

Deploy the VITAL platform frontend applications to Vercel with proper multi-tenant and monorepo configuration.

**Deployment Architecture:**
- **Backend (AI Engine):** Railway - https://railway.com/project/1874a0cf-6c1c-4077-a5f1-92567064b3df
- **Frontend Apps:** Vercel (this guide)
  - Main Platform: `apps/digital-health-startup`
  - Consulting: `apps/consulting`
  - Pharma: `apps/pharma`
  - Payers: `apps/payers`

---

## Current Vercel Project

**Project ID:** `prj_EU5pFau6V9FImRSnUEr55g9JPR9e`
**Team:** `team_3vU0A4ymkup3TWpoomMrVGoa`
**Project Name:** `vital-expert`

---

## Step 1: Prepare Frontend Build

Before deploying, ensure the frontend builds successfully:

```bash
# Install dependencies
pnpm install

# Build the main platform app
cd apps/digital-health-startup
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          120 kB
└ ○ /chat                               10.5 kB          125 kB
```

---

## Step 2: Environment Variables Setup

### Required Environment Variables for Vercel:

```bash
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes

# OpenAI Configuration
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Pinecone Vector Database
PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR
PINECONE_INDEX_NAME=vital-knowledge

# Gemini API
GEMINI_API_KEY=AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://square-halibut-35639.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYs3AAIncDE1Y2RmMGUwYmY1Mzk0YTU4OWFhNjAzMjk0MWVjYzhmM3AxMzU2Mzk

# LangFuse Monitoring
LANGFUSE_PUBLIC_KEY=b1fe4bae-221e-4c74-8e97-6bd73c0ab30e
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com

# Application Configuration
NEXT_PUBLIC_APP_URL=https://vital.expert
NEXT_PUBLIC_APP_NAME=VITAL Expert

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# Multi-Tenant Configuration
NEXT_PUBLIC_DEFAULT_TENANT_ID=digital-health-providers
NEXT_PUBLIC_ENABLE_TENANT_SWITCHING=true
NEXT_PUBLIC_ENABLE_MULTI_TENANT=true

# Build Configuration
IS_BUILD_TIME=false
NODE_ENV=production

# Backend API URLs (Railway)
NEXT_PUBLIC_EXPERT_API_URL=https://[your-railway-url].up.railway.app
NEXT_PUBLIC_PANEL_API_URL=https://[your-railway-url].up.railway.app
NEXT_PUBLIC_AGENT_API_URL=https://[your-railway-url].up.railway.app
NEXT_PUBLIC_PLATFORM_API_URL=https://[your-railway-url].up.railway.app

# Security & Compliance
ALLOW_ANONYMOUS_VERIFICATION=false
HIPAA_MODE=strict
FDA_VALIDATION_MODE=enabled
MEDICAL_SAFETY_CHECKS=enabled
```

### Add Environment Variables via Vercel CLI:

```bash
# Navigate to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Set environment variables for production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://xazinxsiglqokwfmogyk.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY

# Continue for all other variables...
```

**Or use the Vercel Dashboard:**
1. Go to https://vercel.com/crossroads-catalysts-projects/vital-expert
2. Settings → Environment Variables
3. Add all variables from the list above

---

## Step 3: Configure Monorepo Deployment

Create `vercel.json` at the root to specify the main app:

```json
{
  "version": 2,
  "public": false,
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false
  },
  "git": {
    "deploymentEnabled": {
      "restructure/world-class-architecture": true
    }
  },
  "builds": [
    {
      "src": "apps/digital-health-startup/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/digital-health-startup/$1"
    }
  ]
}
```

---

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   https://vercel.com/crossroads-catalysts-projects/vital-expert

2. **Settings → General:**
   - **Root Directory:** `apps/digital-health-startup`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. **Deploy:**
   - Go to Deployments tab
   - Click "Deploy"
   - Select branch: `restructure/world-class-architecture`
   - Wait for build to complete (3-5 minutes)

### Option B: Deploy via CLI

```bash
# Make sure you're in the project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

**CLI will ask:**
- "Set up and deploy?" → Yes
- "Which scope?" → crossroads-catalysts-projects
- "Link to existing project?" → Yes
- "What's the name?" → vital-expert
- "In which directory is your code?" → `apps/digital-health-startup`
- "Want to override settings?" → Yes
- "Build Command:" → `npm run build`
- "Output Directory:" → `.next`
- "Development Command:" → `npm run dev`

---

## Step 5: Configure Custom Domains

### Primary Domain Setup:

1. **Main Platform:**
   - Domain: `app.vital.expert`
   - Points to: `apps/digital-health-startup`

2. **Wildcard for Multi-Tenant:**
   - Domain: `*.vital.expert`
   - Points to: `apps/digital-health-startup`
   - Enables: `pharma.vital.expert`, `payers.vital.expert`, `consulting.vital.expert`

### Add Domains in Vercel:

```bash
# Add main domain
vercel domains add app.vital.expert

# Add wildcard domain
vercel domains add *.vital.expert
```

**Or via Dashboard:**
1. Go to Settings → Domains
2. Add Domain: `app.vital.expert`
3. Add Domain: `*.vital.expert`
4. Follow DNS configuration instructions

### DNS Configuration:

Add these records to your DNS provider:

```
Type    Name    Value
CNAME   app     cname.vercel-dns.com
CNAME   *       cname.vercel-dns.com
```

---

## Step 6: Deploy Additional Tenant Apps (Optional)

If you want separate deployments for each tenant:

### Consulting App:
```bash
cd apps/consulting
vercel --prod
```

### Pharma App:
```bash
cd apps/pharma
vercel --prod
```

### Payers App:
```bash
cd apps/payers
vercel --prod
```

---

## Step 7: Connect Frontend to Railway Backend

Once Railway AI Engine deployment is complete:

1. **Get Railway Service URL:**
   ```bash
   cd services/ai-engine
   railway domain
   ```

   **Expected Output:**
   ```
   https://vital-ai-engine-v2.up.railway.app
   ```

2. **Update Vercel Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_EXPERT_API_URL production
   # Paste: https://vital-ai-engine-v2.up.railway.app

   vercel env add NEXT_PUBLIC_PANEL_API_URL production
   # Paste: https://vital-ai-engine-v2.up.railway.app

   vercel env add NEXT_PUBLIC_AGENT_API_URL production
   # Paste: https://vital-ai-engine-v2.up.railway.app

   vercel env add NEXT_PUBLIC_PLATFORM_API_URL production
   # Paste: https://vital-ai-engine-v2.up.railway.app
   ```

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## Step 8: Verify Deployment

### Test Health Endpoints:

```bash
# Frontend health
curl https://app.vital.expert/

# Backend health
curl https://vital-ai-engine-v2.up.railway.app/health
```

### Test Multi-Tenant Routing:

```bash
# Test pharma subdomain
curl https://pharma.vital.expert/

# Test payers subdomain
curl https://payers.vital.expert/

# Test consulting subdomain
curl https://consulting.vital.expert/
```

---

## Troubleshooting

### Build Fails with TypeScript Errors

**Fix:** Ensure all dependencies are installed
```bash
cd apps/digital-health-startup
npm install
npm run type-check
```

### Environment Variables Not Working

**Fix:** Check environment variable scope (Production vs Preview)
```bash
vercel env ls
```

### 404 on Custom Domain

**Fix:** Check DNS propagation (can take 24-48 hours)
```bash
dig app.vital.expert
```

### API Calls Failing

**Fix:** Verify Railway backend URL is correct
```bash
curl https://[your-railway-url].up.railway.app/health
```

---

## Deployment Checklist

- [ ] Frontend builds successfully locally
- [ ] All environment variables added to Vercel
- [ ] Railway AI Engine deployment complete
- [ ] Railway service URL obtained
- [ ] Backend API URLs updated in Vercel
- [ ] Main app deployed to Vercel
- [ ] Custom domains configured
- [ ] DNS records updated
- [ ] Frontend can reach backend API
- [ ] Multi-tenant routing working

---

## Next Steps After Deployment

1. **Monitor Performance:**
   - Vercel Analytics: https://vercel.com/crossroads-catalysts-projects/vital-expert/analytics
   - Railway Logs: `railway logs`

2. **Setup CI/CD:**
   - Automatic deployments on push to `restructure/world-class-architecture`
   - Preview deployments for pull requests

3. **Security:**
   - Enable Vercel Authentication
   - Configure CORS for Railway backend
   - Review and rotate API keys

4. **Monitoring:**
   - Setup LangFuse monitoring
   - Configure error tracking (Sentry)
   - Enable Vercel Web Vitals

---

## Summary

**Frontend (Vercel):**
- ✅ Main Platform: `apps/digital-health-startup`
- ✅ Custom Domain: `app.vital.expert` + `*.vital.expert`
- ✅ Multi-tenant support via wildcard routing

**Backend (Railway):**
- ✅ AI Engine: Python FastAPI service
- ✅ URL: `https://vital-ai-engine-v2.up.railway.app`

**Integration:**
- Environment variables connect frontend to backend
- Supabase for authentication and database
- Pinecone for vector search
- OpenAI for LLM capabilities
