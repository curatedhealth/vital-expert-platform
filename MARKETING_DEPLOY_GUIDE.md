# Marketing Site Deployment Guide (vital.expert)

## Overview

Deploy the VITAL marketing landing page to Vercel for **vital.expert** (main marketing site for all tenants).

**Strategy:** Use the existing `apps/digital-health-startup` but deploy only the public landing page (no authentication required).

---

## Step 1: Create New Vercel Project for Marketing

1. **Go to Vercel Dashboard:**
   https://vercel.com/crossroads-catalysts-projects

2. **Click "Add New..." → Project**

3. **Import Git Repository:**
   - Select your GitHub repository: `VITAL path`
   - Click "Import"

4. **Configure Project:**
   - **Project Name:** `vital-marketing`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/digital-health-startup`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. **Environment Variables** (Add these - minimal for public site):

```env
# Supabase (Public keys only - for contact form if needed)
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY

# App Configuration
NEXT_PUBLIC_APP_URL=https://vital.expert
NEXT_PUBLIC_APP_NAME=VITAL Expert

# Feature Flags (Marketing only - no complex features)
NEXT_PUBLIC_ENABLE_MOCK_API=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# Build Configuration
NODE_ENV=production
```

6. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (3-5 minutes)

---

## Step 2: Configure Custom Domain

Once deployment succeeds:

1. **Go to Project Settings → Domains**

2. **Add Domain:**
   - Enter: `vital.expert`
   - Click "Add"

3. **Add WWW Subdomain:**
   - Enter: `www.vital.expert`
   - Click "Add"

4. **DNS Configuration** (at your DNS provider):

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

5. **Wait for DNS Propagation** (can take up to 48 hours, usually 10-30 minutes)

---

## Step 3: Verify Deployment

### Test the Marketing Site:

```bash
# Test main domain
curl -I https://vital.expert
# Should return: HTTP/2 200

# Test WWW
curl -I https://www.vital.expert
# Should return: HTTP/2 200

# Test landing page loads
curl https://vital.expert | grep "VITAL Expert"
# Should return HTML with "VITAL Expert" in title
```

### Check in Browser:

1. Visit https://vital.expert
2. Should see the enhanced landing page
3. Check:
   - [ ] Page loads without errors
   - [ ] Images display correctly
   - [ ] CTA buttons work
   - [ ] "Get Started" redirects to app.vital.expert (will set up next)
   - [ ] Mobile responsive
   - [ ] Fast load time (<2s)

---

## Step 4: Configure Redirects (Optional)

If you want "Get Started" button to redirect to the platform app:

Create `vercel.json` in project root:

```json
{
  "redirects": [
    {
      "source": "/app",
      "destination": "https://app.vital.expert",
      "permanent": false
    },
    {
      "source": "/login",
      "destination": "https://app.vital.expert/login",
      "permanent": false
    },
    {
      "source": "/signup",
      "destination": "https://app.vital.expert/signup",
      "permanent": false
    }
  ]
}
```

---

## Step 5: Performance Optimization

### Enable Vercel Features:

1. **Analytics:**
   - Go to Project → Analytics
   - Click "Enable Analytics"
   - Monitor Core Web Vitals

2. **Image Optimization:**
   - Already enabled by default
   - Vercel automatically optimizes images

3. **Edge Functions:**
   - Already handled by Next.js middleware

### Test Performance:

```bash
# Run Lighthouse audit
npx lighthouse https://vital.expert --view

# Expected scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 95
# SEO: > 90
```

---

## Deployment Checklist

- [ ] Vercel project created (`vital-marketing`)
- [ ] Root directory set to `apps/digital-health-startup`
- [ ] Environment variables added (minimal public keys)
- [ ] Build succeeds without errors
- [ ] Custom domain `vital.expert` added
- [ ] WWW subdomain `www.vital.expert` added
- [ ] DNS records configured
- [ ] DNS propagated (test with `dig vital.expert`)
- [ ] HTTPS certificate issued (automatic via Vercel)
- [ ] Landing page loads in browser
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance score > 90

---

## Next Steps

After marketing site is deployed:

1. **Step 2:** Fix MVP errors in digital-health-startup
2. **Step 3:** Deploy platform app to NEW Vercel project (`vital-platform`)
3. **Step 4:** Configure wildcard domains (`*.vital.expert` → platform app)
4. **Step 5:** Connect frontend to Railway backend

---

## Troubleshooting

### Build Fails

**Error:** TypeScript compilation errors

**Fix:** The landing page component should build fine. If not, temporarily disable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

### Domain Not Working

**Error:** 404 or DNS_PROBE_FINISHED_NXDOMAIN

**Fix:**
1. Check DNS propagation: `dig vital.expert`
2. Wait 24-48 hours for full propagation
3. Try clearing DNS cache: `sudo dscacheutil -flushcache` (Mac)

### Images Not Loading

**Error:** 404 on image paths

**Fix:** Ensure images are in `public/` directory and paths start with `/`:

```tsx
<Image src="/logo.png" alt="VITAL" />  // ✅ Correct
<Image src="logo.png" alt="VITAL" />   // ❌ Wrong
```

---

## Quick Deploy via CLI (Alternative)

If you prefer CLI deployment:

```bash
# Navigate to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Login to Vercel
vercel login

# Deploy to preview
cd apps/digital-health-startup
vercel

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: vital-marketing
# - Want to override settings? Yes
# - Build Command: npm run build
# - Output Directory: .next
```

---

## Environment Variables Reference

For the marketing site, we only need **public** environment variables (no secrets):

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xazinxsiglqokwfmogyk.supabase.co | Supabase public URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbG... | Public anon key (safe to expose) |
| `NEXT_PUBLIC_APP_URL` | https://vital.expert | Current site URL |
| `NEXT_PUBLIC_ENABLE_MOCK_API` | true | Use mock data for landing page |
| `NODE_ENV` | production | Production mode |

**Note:** We're NOT adding sensitive keys like `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to the marketing site since it's public-facing only.

---

**Status:** Ready to deploy
**Estimated Time:** 15-20 minutes
**Next:** Deploy platform app with full features
