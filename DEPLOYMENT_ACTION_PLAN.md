# VITAL Platform - Deployment Action Plan

**Date:** October 26, 2025
**Strategy:** Two-phase deployment (Marketing first, then Platform MVP)

---

## Phase 1: Marketing Site (DO THIS FIRST) ✅

**Goal:** Get vital.expert live with the landing page

### Quick Steps:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/crossroads-catalysts-projects
   - Click "Add New..." → "Project"

2. **Import Repository:**
   - Select your GitHub repo
   - **Root Directory:** `apps/digital-health-startup`
   - **Project Name:** `vital-marketing`

3. **Add Environment Variables** (only these 4):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
   NEXT_PUBLIC_APP_URL=https://vital.expert
   NODE_ENV=production
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait 3-5 minutes

5. **Add Domain:**
   - Settings → Domains
   - Add: `vital.expert` and `www.vital.expert`
   - Configure DNS as instructed

**Result:** Marketing site live at https://vital.expert

**Time:** 15-20 minutes

---

## Phase 2: Platform MVP (DO THIS SECOND) 🚧

**Goal:** Get app.vital.expert live with MVP features (no complex AI routes)

### Before Deploying - Fix Build Errors:

The app currently has build errors in these files:
- `src/app/api/chat/orchestrator/contextual-helpers.ts` (missing variable)
- `src/app/api/chat/enhanced/route.ts` (wrong number of arguments)
- `src/app/api/chat/huggingface*/route.ts` (type errors)
- `src/app/api/chat/langchain-enhanced/route.ts` (unknown type)

### Strategy: Disable Experimental Routes

**Disable these directories** (rename with `.disabled` extension):
```bash
cd apps/digital-health-startup/src/app/api/chat

# Disable experimental routes
mv orchestrator orchestrator.disabled
mv enhanced enhanced.disabled
mv huggingface huggingface.disabled
mv huggingface-local huggingface-local.disabled
mv langchain-enhanced langchain-enhanced.disabled
```

**Keep these routes** (MVP functionality):
- `route.ts` (main chat endpoint)
- `autonomous/route.ts` (if no errors)
- Any other working routes

### Test Build:

```bash
cd apps/digital-health-startup
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          120 kB
└ ○ /chat                               10.5 kB          125 kB
```

### Deploy Platform MVP:

1. **Create New Vercel Project:**
   - Name: `vital-platform`
   - Root: `apps/digital-health-startup`

2. **Add ALL Environment Variables** (from .env.local)

3. **Deploy**

4. **Add Domains:**
   - `app.vital.expert`
   - `*.vital.expert` (wildcard for multi-tenant)

**Result:** Platform live at https://app.vital.expert

**Time:** 30-45 minutes (including fixes)

---

## Phase 3: Connect to Railway Backend 🔌

Once Railway AI Engine is deployed:

1. **Get Railway URL:**
   ```bash
   cd services/ai-engine
   railway domain
   ```

2. **Update Vercel Environment Variables:**
   - `NEXT_PUBLIC_EXPERT_API_URL=[railway-url]`
   - `NEXT_PUBLIC_AGENT_API_URL=[railway-url]`

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## Current Status

### ✅ Completed:
- Railway AI Engine deployment (in progress - should be done)
- Deployment guides created
- Todo list organized

### ⏳ Pending:
- Deploy marketing site (Phase 1) - **START HERE**
- Fix build errors (Phase 2)
- Deploy platform MVP (Phase 2)
- Connect to Railway (Phase 3)

---

## Quick Reference

### Vercel Dashboard:
https://vercel.com/crossroads-catalysts-projects

### Railway Dashboard:
https://railway.com/project/1874a0cf-6c1c-4077-a5f1-92567064b3df

### Deployment Guides:
- [MARKETING_DEPLOY_GUIDE.md](MARKETING_DEPLOY_GUIDE.md) - Step-by-step for Phase 1
- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Complete reference
- [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md) - Quick steps

---

## What to Do Right Now

**1. Deploy Marketing Site** (15 minutes)
   - Follow [MARKETING_DEPLOY_GUIDE.md](MARKETING_DEPLOY_GUIDE.md)
   - This is the easiest win and gets vital.expert live

**2. Fix Build Errors** (20 minutes)
   - Disable experimental API routes
   - Test build passes
   - Commit changes

**3. Deploy Platform MVP** (20 minutes)
   - Create new Vercel project
   - Deploy with working routes only
   - Configure wildcard domains

**Total Time:** ~1 hour to get both sites live

---

**Let's start with Phase 1 - Marketing Site!**
