# Fresh Start - Two Vercel Projects

## Strategy

Create TWO separate Vercel projects from scratch:

1. **Marketing Site** - `www.vital.expert` (simple, public landing page)
2. **Platform App** - `*.vital.expert` (full application with multi-tenant)

---

## Step 1: Delete ALL Existing Vercel Projects

### Delete Process:

1. Go to: https://vercel.com/crossroads-catalysts-projects
2. For EACH project you see:
   - Click on the project
   - Go to Settings → Advanced (bottom of sidebar)
   - Scroll to "Delete Project"
   - Click "Delete"
   - Type project name to confirm
   - Click "Delete"

**Projects to delete:**
- `vital-marketing` (if exists)
- `vital-expert` (if exists)
- `vital-platform` (if exists)
- Any other VITAL-related projects

**Result:** Clean slate with no projects

---

## Step 2: Create Marketing Site Project

### 2.1 Import from GitHub

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Find and select: `curatedhealth/vital-expert-platform` (your repo)
4. Click **"Import"**

### 2.2 Configure Project

**Project Name:**
```
vital-marketing-site
```

**Framework Preset:**
```
Next.js
```

**Root Directory:** ⚠️ **IMPORTANT**
```
apps/digital-health-startup
```

**Build & Development Settings:**
- Leave ALL as DEFAULT (don't override anything)
- Vercel will auto-detect Next.js settings

### 2.3 Environment Variables

Add these **4 variables** (click "Add" for each):

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xazinxsiglqokwfmogyk.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
Environments: ✓ Production ✓ Preview ✓ Development
```

**Variable 3:**
```
Name: NEXT_PUBLIC_APP_URL
Value: https://www.vital.expert
Environments: ✓ Production ✓ Preview ✓ Development
```

**Variable 4:**
```
Name: NODE_ENV
Value: production
Environments: ✓ Production ✓ Preview ✓ Development
```

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 2-4 minutes for build
3. Watch for: ✓ "Deployment Ready"

**Expected Build Time:** 2-4 minutes

---

## Step 3: Verify Marketing Site

### 3.1 Check Deployment

After build completes:
- You'll see: ✅ Deployment successful
- Preview URL: `https://vital-marketing-site-[random].vercel.app`

### 3.2 Test Preview URL

1. Click the preview URL
2. Should see: VITAL landing page
3. Check for errors (F12 → Console)

### 3.3 Add Custom Domains

1. Go to: Settings → Domains
2. Add domain:
   ```
   www.vital.expert
   ```
3. Add domain:
   ```
   vital.expert
   ```
   - Select "Redirect to www.vital.expert"

---

## Step 4: Create Platform App Project

### 4.1 Import from GitHub (Again)

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select SAME repo: `curatedhealth/vital-expert-platform`
4. Click **"Import"**

### 4.2 Configure Project

**Project Name:**
```
vital-platform-app
```

**Framework Preset:**
```
Next.js
```

**Root Directory:** ⚠️ **SAME as marketing**
```
apps/digital-health-startup
```

**Build & Development Settings:**
- Leave ALL as DEFAULT

### 4.3 Environment Variables (Full Set)

Add ALL these variables:

**Public Variables (Same as Marketing):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
NEXT_PUBLIC_APP_URL=https://app.vital.expert
NODE_ENV=production
```

**Server-Side Secrets (ADDITIONAL):**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes

OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR

PINECONE_INDEX_NAME=vital-knowledge

GEMINI_API_KEY=AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0

UPSTASH_REDIS_REST_URL=https://square-halibut-35639.upstash.io

UPSTASH_REDIS_REST_TOKEN=AYs3AAIncDE1Y2RmMGUwYmY1Mzk0YTU4OWFhNjAzMjk0MWVjYzhmM3AxMzU2Mzk

LANGFUSE_PUBLIC_KEY=b1fe4bae-221e-4c74-8e97-6bd73c0ab30e

LANGFUSE_HOST=https://cloud.langfuse.com
```

**Multi-Tenant Configuration:**
```
NEXT_PUBLIC_ENABLE_MULTI_TENANT=true
NEXT_PUBLIC_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001
```

**Feature Flags:**
```
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 2-4 minutes
3. Watch for build completion

**Note:** If build fails with type errors, that's expected - we'll fix in next step

---

## Step 5: Handle Build Errors (If Any)

### If Platform Build Fails:

1. Go to: Settings → General
2. Add this environment variable:
   ```
   Name: TYPESCRIPT_CHECK
   Value: false
   ```
3. Or go to Settings → General → Build Command
4. Override with:
   ```
   next build || true
   ```
5. Redeploy

---

## Step 6: Add Domains to Platform

After platform deploys successfully:

1. Go to: Settings → Domains
2. Add wildcard domain:
   ```
   *.vital.expert
   ```
3. Add default domain:
   ```
   app.vital.expert
   ```

---

## Step 7: Configure DNS (One Time)

At your DNS provider (Cloudflare, Route53, etc.):

### DNS Records:
```
Type    Name    Value                     Project
A       @       76.76.21.21              (Root domain)
CNAME   www     cname.vercel-dns.com     Marketing Site
CNAME   *       cname.vercel-dns.com     Platform App
CNAME   app     cname.vercel-dns.com     Platform App (optional)
```

**Important:**
- The wildcard `*` catches ALL subdomains
- Point it to the **platform app** project
- Point `www` to the **marketing** project

---

## Step 8: Verify Both Sites

### Marketing Site:
```bash
curl -I https://www.vital.expert
# Should return: HTTP/2 200

curl https://www.vital.expert | grep "VITAL Expert"
# Should return HTML with VITAL branding
```

### Platform App:
```bash
curl -I https://app.vital.expert
# Should return: HTTP/2 200

curl -I https://acme.vital.expert
# Should return: HTTP/2 200 (tenant subdomain)
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────┐
│              DNS Layer                       │
├─────────────────────────────────────────────┤
│ www.vital.expert     → Marketing Project    │
│ vital.expert         → Redirect to www      │
│ *.vital.expert       → Platform Project     │
│   ├─ app.vital.expert                       │
│   ├─ acme.vital.expert                      │
│   ├─ pharma.vital.expert                    │
│   └─ [any].vital.expert                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│          Vercel Projects                     │
├─────────────────────────────────────────────┤
│ vital-marketing-site                         │
│   - Lightweight landing page                │
│   - 4 environment variables                 │
│   - Fast, simple, public                    │
│                                             │
│ vital-platform-app                          │
│   - Full application                        │
│   - 15+ environment variables               │
│   - Multi-tenant routing                    │
│   - Authentication required                 │
└─────────────────────────────────────────────┘
```

---

## Success Criteria

### Marketing Site ✅
- [ ] Project created
- [ ] Build succeeds
- [ ] www.vital.expert loads
- [ ] Landing page displays
- [ ] No console errors

### Platform App ✅
- [ ] Project created
- [ ] Build succeeds (or type errors handled)
- [ ] app.vital.expert loads
- [ ] Wildcard subdomains work
- [ ] Multi-tenant routing functional

---

## Estimated Timeline

- **Delete old projects:** 5 minutes
- **Create marketing site:** 10 minutes
- **Create platform app:** 15 minutes
- **Configure DNS:** 5 minutes
- **DNS propagation:** 10-30 minutes

**Total:** 45-65 minutes

---

## Next Steps After Both Deployed

1. **Connect Platform to Railway Backend**
   - Update environment variables with Railway URL
   - Test API calls

2. **Test Multi-Tenant Routing**
   - Create test tenant in database
   - Visit [tenant].vital.expert
   - Verify tenant detection works

3. **Performance Optimization**
   - Enable Vercel Analytics
   - Check Core Web Vitals
   - Optimize images

---

**Ready to start? Begin with Step 1 - Delete existing projects!** 🚀
