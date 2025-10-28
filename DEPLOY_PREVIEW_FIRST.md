# Deploy to Preview/Staging First - Correct Approach

## Your Workflow

1. **Preview/Pre-production** - Test everything first
2. **Production** - Only after preview is verified

You're absolutely right! Let's deploy to preview first.

---

## Deploy to Preview via Vercel Dashboard

### Step 1: Import from GitHub
https://vercel.com/new

- Import repository: `curatedhealth/vital-expert-platform`
- Branch: `restructure/world-class-architecture`

### Step 2: Configure Project

**Project Name:**
```
vital-app-preview
```

**Root Directory:**
```
apps/digital-health-startup
```

**Environment Variables** (4 minimum for preview):
```
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
NEXT_PUBLIC_APP_URL=https://vital-app-preview.vercel.app
NODE_ENV=development
```

**Important:** Select environments:
- ✓ Preview
- ✓ Development
- ✗ Production (uncheck this!)

### Step 3: Deploy to Preview

Click **"Deploy"** - this creates a **preview deployment** (not production)

---

## What You Get

**Preview URL:** `https://vital-app-preview-[random].vercel.app`

This is your **staging environment** where you can:
- Test all features
- Verify everything works
- Share with team for review
- Check performance
- Test multi-tenant routing

---

## After Preview is Verified

### Option A: Promote Preview to Production

1. Go to Vercel dashboard
2. Find the preview deployment
3. Click "Promote to Production"

### Option B: Deploy Separate Production Project

1. Create new project: `vital-app-production`
2. Same configuration
3. Environment: Production only
4. Add custom domains

---

## CLI Alternative (Preview Only)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Deploy to preview (NOT --prod flag)
vercel

# This creates a preview deployment
# No production, no custom domains
# Just testing URL
```

---

## Your Environments Strategy

```
┌─────────────────────────────────────────┐
│  Development (Local)                     │
│  localhost:3000                          │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Preview/Staging (Vercel)                │
│  vital-app-preview.vercel.app            │
│  - Test all features                     │
│  - Share with team                       │
│  - Verify before prod                    │
└─────────────────────────────────────────┘
           ↓ (after approval)
┌─────────────────────────────────────────┐
│  Production (Vercel)                     │
│  www.vital.expert                        │
│  *.vital.expert                          │
│  - Live for users                        │
│  - Custom domains                        │
│  - Full environment variables            │
└─────────────────────────────────────────┘
```

---

## Quick Start

**Go to:**
https://vercel.com/new

**Import your repo, configure as above, and deploy to PREVIEW only.**

No `--prod` flag, no production environment, just testing!
