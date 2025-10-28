# Phase 1: Marketing Site - CORRECTED Domain Configuration

## ✅ Corrected Domain Strategy

### Marketing Site (vital-marketing project):
- **Primary Domain:** `www.vital.expert`
- **Secondary:** `vital.expert` → redirects to `www.vital.expert`

### Platform App (Phase 2 - separate project):
- **Wildcard:** `*.vital.expert` (all tenant subdomains)

---

## Vercel Dashboard Settings Update

### Step 1: Go to Settings
https://vercel.com/crossroads-catalysts-projects/vital-marketing/settings/general

### Step 2: Update Build Configuration

**Root Directory:**
```
(leave empty - deploy from monorepo root)
```

**Install Command:** ✅ OVERRIDE
```
pnpm install
```

**Build Command:** ✅ OVERRIDE
```
cd apps/digital-health-startup && pnpm run build
```

**Output Directory:**
```
apps/digital-health-startup/.next
```

**Node.js Version:**
```
22.x
```

Click **"Save"** after each change.

---

## Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Watch build logs - should succeed in 2-3 minutes

**Expected success output:**
```
Running "pnpm install"
✓ Installed dependencies
Running "cd apps/digital-health-startup && pnpm run build"
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Step 4: Add Custom Domains

After build succeeds:

1. Go to **Settings** → **Domains**
2. Click **"Add"**

### Primary Domain:
```
www.vital.expert
```
Click "Add"

### Root Domain (with redirect):
```
vital.expert
```
- Click "Add"
- Select "Redirect to www.vital.expert"
- Click "Add"

---

## Step 5: Configure DNS

At your DNS provider (Cloudflare, Route53, Namecheap, etc.):

### DNS Records:
```
Type    Name    Value                     TTL
A       @       76.76.21.21              Auto (or 3600)
CNAME   www     cname.vercel-dns.com     Auto (or 3600)
```

**Important:** Do NOT add the wildcard (`*`) CNAME yet - that's for Phase 2 (platform app).

---

## Step 6: Verify Deployment

### Test Preview URL (while DNS propagates):
```bash
# Test the Vercel preview URL first
curl -I https://vital-marketing-[random-id].vercel.app

# Should return: HTTP/2 200
```

### Test Custom Domains (after DNS propagates - 10-30 minutes):
```bash
# Check DNS propagation
dig www.vital.expert

# Test HTTPS
curl -I https://www.vital.expert

# Test root domain redirects to www
curl -I https://vital.expert
# Should return: HTTP/2 301 or 308 (redirect)
```

### Browser Test:
1. Visit https://www.vital.expert
2. Should see VITAL landing page
3. Check browser console (F12) - no critical errors
4. Test mobile responsive (resize browser)

---

## Success Criteria ✅

Phase 1 is complete when:

- [ ] Vercel build succeeds (green checkmark)
- [ ] Preview URL works: `https://vital-marketing-[id].vercel.app`
- [ ] Custom domain `www.vital.expert` added
- [ ] Root domain `vital.expert` redirects to www
- [ ] DNS records configured (A + CNAME)
- [ ] HTTPS certificate issued (automatic via Vercel)
- [ ] Site loads at https://www.vital.expert
- [ ] Landing page displays correctly
- [ ] No console errors
- [ ] Mobile responsive

---

## DNS Propagation Timeline

- **Fast DNS providers** (Cloudflare): 2-10 minutes
- **Standard providers**: 10-30 minutes
- **Maximum**: Up to 48 hours (rare)

**Check propagation:**
```bash
dig www.vital.expert
# Should show Vercel CNAME
```

---

## Phase 2 Preview (Coming Next)

After Phase 1 is complete, we'll deploy the platform app:

**Platform Project** (vital-platform):
- Wildcard domain: `*.vital.expert`
- Examples:
  - `acme.vital.expert`
  - `pharma.vital.expert`
  - `app.vital.expert`
- Full authentication
- Multi-tenant routing
- Agent chat interface
- Connected to Railway backend

**Additional DNS Record for Phase 2:**
```
Type    Name    Value
CNAME   *       cname.vercel-dns.com     (wildcard)
```

---

## Troubleshooting

### Build Still Fails with "workspace" Error?

**Solution:** Ensure Install Command is set to `pnpm install` (not npm)

### Domain Shows "Domain Not Found"?

**Solution:** Wait for DNS propagation (check with `dig www.vital.expert`)

### Site Loads but Looks Broken?

**Solution:** Check browser console for errors, verify environment variables are set

---

## Quick Commands

```bash
# Verify Vercel project
vercel ls

# Check latest deployment
vercel inspect

# View logs
vercel logs vital-marketing

# Test DNS
dig www.vital.expert

# Test HTTPS
curl -I https://www.vital.expert
```

---

**Status:** Ready for deployment
**Current Step:** Update Vercel Dashboard settings
**Next Step:** Redeploy and verify build
**Estimated Time:** 15-20 minutes

🚀 **Let's get www.vital.expert live!**
