# Vercel Deployment - Quick Start Guide

## Current Status

**Railway Backend (AI Engine):** Deployed and running
**Frontend Build:** Ready (experimental routes disabled)
**Vercel Projects:**
- Existing: `vital-expert` (prj_EU5pFau6V9FImRSnUEr55g9JPR9e)
- Need: New project for multi-tenant platform

---

## Step 1: Clean Up Existing Vercel Configuration

Currently you have one Vercel project (`vital-expert`) that we'll reconfigure:

### Option A: Use Existing Project for Platform (Recommended)
Keep `vital-expert` for the multi-tenant platform app

### Option B: Create Two Separate Projects
- Create new project for platform: `vital-platform`
- Keep existing for marketing: `vital-marketing`

**For this guide, we'll go with Option A (simpler).**

---

## Step 2: Update Vercel Project Settings

1. **Go to Vercel Dashboard:**
   https://vercel.com/crossroads-catalysts-projects/vital-expert/settings

2. **Update Root Directory:**
   - Settings → General → Root Directory
   - Set to: `apps/digital-health-startup`
   - Click "Save"

3. **Update Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

4. **Node.js Version:**
   - Set to: `22.x` (already configured)

---

## Step 3: Update Environment Variables

Go to: Settings → Environment Variables

### Add/Update These Variables:

**⚠️ See `ENVIRONMENT_SETUP.md` for complete environment variable list**

Key variables for Vercel:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes

# OpenAI
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Pinecone
PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR
PINECONE_INDEX_NAME=vital-knowledge

# Gemini
GEMINI_API_KEY=AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0
```

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://square-halibut-35639.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYs3AAIncDE1Y2RmMGUwYmY1Mzk0YTU4OWFhNjAzMjk0MWVjYzhmM3AxMzU2Mzk

# LangFuse
LANGFUSE_PUBLIC_KEY=b1fe4bae-221e-4c74-8e97-6bd73c0ab30e
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://app.vital.expert
NEXT_PUBLIC_APP_NAME=VITAL Expert

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# Multi-Tenant
NEXT_PUBLIC_DEFAULT_TENANT_ID=digital-health-providers
NEXT_PUBLIC_ENABLE_TENANT_SWITCHING=true
NEXT_PUBLIC_ENABLE_MULTI_TENANT=true

# Build Configuration
IS_BUILD_TIME=false
NODE_ENV=production

# Railway Backend (Update after Railway deployment complete)
NEXT_PUBLIC_EXPERT_API_URL=https://[railway-url].up.railway.app
NEXT_PUBLIC_PANEL_API_URL=https://[railway-url].up.railway.app
NEXT_PUBLIC_AGENT_API_URL=https://[railway-url].up.railway.app
NEXT_PUBLIC_PLATFORM_API_URL=https://[railway-url].up.railway.app

# Security
ALLOW_ANONYMOUS_VERIFICATION=false
```

**Important:** Set environment for: Production, Preview, Development

---

## Step 4: Deploy via CLI

```bash
# Navigate to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Make sure we're on the right branch
git status
# Should show: On branch restructure/world-class-architecture

# Deploy to production
vercel --prod

# Or to preview first
vercel
```

**Vercel CLI will:**
1. Detect Next.js project
2. Use settings from dashboard
3. Build from `apps/digital-health-startup`
4. Deploy to production

---

## Step 5: Configure Custom Domains

### Main Platform Domain:
1. Go to: Settings → Domains
2. Add domain: `app.vital.expert`
3. Follow DNS instructions

### Wildcard for Multi-Tenant:
4. Add domain: `*.vital.expert`
5. Configure DNS with wildcard CNAME

### DNS Records (at your DNS provider):
```
Type    Name    Value
A       @       76.76.21.21 (Vercel)
CNAME   app     cname.vercel-dns.com
CNAME   *       cname.vercel-dns.com
```

---

## Step 6: Verify Deployment

### Test Endpoints:
```bash
# Main app
curl https://app.vital.expert

# Wildcard subdomain
curl https://acme.vital.expert

# Health check
curl https://app.vital.expert/api/health
```

### Check Deployment Logs:
```bash
vercel logs [deployment-url]
```

---

## Step 7: Connect to Railway Backend

Once Railway AI Engine is fully deployed:

1. **Get Railway URL:**
```bash
cd services/ai-engine
railway domain
```

2. **Update Vercel Environment Variables:**
Go to Settings → Environment Variables

Update these 4 variables with the Railway URL:
- `NEXT_PUBLIC_EXPERT_API_URL`
- `NEXT_PUBLIC_PANEL_API_URL`
- `NEXT_PUBLIC_AGENT_API_URL`
- `NEXT_PUBLIC_PLATFORM_API_URL`

3. **Redeploy:**
```bash
vercel --prod
```

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check that root directory is correct

### 404 Errors
- Verify DNS propagation: `dig app.vital.expert`
- Check domain configuration in Vercel
- Wait 24-48 hours for full DNS propagation

### API Calls Failing
- Verify Railway backend is running
- Check CORS configuration
- Verify environment variables match

---

## Quick Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Rollback deployment
vercel rollback [url]

# Check domains
vercel domains ls
```

---

## Next Steps After Deployment

1. Monitor Vercel Analytics
2. Setup error tracking (Sentry)
3. Configure CI/CD for automatic deployments
4. Test multi-tenant routing
5. Performance optimization

---

**Created:** October 26, 2025
**Status:** Ready to deploy
**Railway Backend:** In progress (should be complete in 2-4 minutes)
