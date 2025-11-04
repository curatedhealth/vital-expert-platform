# Phase 1: Marketing Site Deployment - Step-by-Step Checklist

**Objective:** Deploy vital.expert landing page
**Time Required:** 15-20 minutes
**Difficulty:** Easy ⭐

---

## Before You Start

**Open These Links:**
1. Vercel Dashboard: https://vercel.com/crossroads-catalysts-projects
2. GitHub Repository: Your VITAL path repo
3. This checklist (keep it open!)

---

## Step 1: Create Vercel Project (5 minutes)

### 1.1 Start New Project
- [ ] Go to https://vercel.com/crossroads-catalysts-projects
- [ ] Click **"Add New..."** button (top right)
- [ ] Select **"Project"**

### 1.2 Import Repository
- [ ] Click **"Import"** next to your GitHub repository
- [ ] If not visible, click "Import Git Repository" and authorize GitHub

### 1.3 Configure Project Settings

**Fill in these fields:**

| Field | Value |
|-------|-------|
| **Project Name** | `vital-marketing` |
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/digital-health-startup` |
| **Build Command** | Leave default: `npm run build` |
| **Output Directory** | Leave default: `.next` |
| **Install Command** | Leave default: `npm install` |
| **Node.js Version** | 22.x |

- [ ] All fields filled correctly

---

## Step 2: Add Environment Variables (3 minutes)

Click **"Environment Variables"** section and add these **4 variables**:

### Variable 1:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xazinxsiglqokwfmogyk.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```
- [ ] Added

### Variable 2:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
Environments: ✓ Production ✓ Preview ✓ Development
```
- [ ] Added

### Variable 3:
```
Name: NEXT_PUBLIC_APP_URL
Value: https://vital.expert
Environments: ✓ Production ✓ Preview ✓ Development
```
- [ ] Added

### Variable 4:
```
Name: NODE_ENV
Value: production
Environments: ✓ Production ✓ Preview ✓ Development
```
- [ ] Added

- [ ] **All 4 environment variables added**

---

## Step 3: Deploy (5 minutes)

### 3.1 Start Deployment
- [ ] Click **"Deploy"** button
- [ ] Vercel will now:
  - Clone your repository
  - Install dependencies
  - Build Next.js app
  - Deploy to CDN

### 3.2 Monitor Build
- [ ] Watch build logs (they stream in real-time)
- [ ] Wait for "Building..." to complete (2-4 minutes)
- [ ] Look for **"✓ Build Completed"** message

### 3.3 Check Deployment Status

**Expected Success Indicators:**
- ✅ Green checkmark on deployment
- ✅ "Ready" status
- ✅ Preview URL displayed (e.g., `vital-marketing-abc123.vercel.app`)

- [ ] Deployment succeeded
- [ ] Copy the preview URL: `____________________________`

---

## Step 4: Test Preview Deployment (2 minutes)

### 4.1 Open Preview URL
- [ ] Click on the preview URL from Step 3.3
- [ ] Or visit: `https://vital-marketing-[your-id].vercel.app`

### 4.2 Verify Page Loads
- [ ] Landing page loads without errors
- [ ] No blank screen or 500 errors
- [ ] "VITAL Expert" branding visible
- [ ] Images load correctly
- [ ] Page is responsive (resize browser window)

### 4.3 Check Browser Console
- [ ] Press F12 (Developer Tools)
- [ ] Go to Console tab
- [ ] No critical errors (warnings are OK)
- [ ] Take screenshot if any errors

---

## Step 5: Configure Custom Domain (5 minutes)

### 5.1 Add Domain
- [ ] In Vercel project, go to **Settings** → **Domains**
- [ ] Click **"Add"**
- [ ] Enter: `vital.expert`
- [ ] Click **"Add"**

### 5.2 Add WWW Subdomain
- [ ] Click **"Add"** again
- [ ] Enter: `www.vital.expert`
- [ ] Click **"Add"**

### 5.3 Configure DNS

Vercel will show you DNS instructions. You need to add these records at your DNS provider:

**Required DNS Records:**
```
Type    Name    Value                     TTL
A       @       76.76.21.21              Auto
CNAME   www     cname.vercel-dns.com     Auto
```

- [ ] Added A record for `@` (root domain)
- [ ] Added CNAME record for `www`
- [ ] DNS records saved at provider

### 5.4 Wait for Verification
- [ ] Vercel shows "Pending" status (this is normal)
- [ ] DNS propagation takes 10-30 minutes (can be up to 48 hours)
- [ ] Vercel will auto-verify when DNS propagates

---

## Step 6: Verify Live Site (After DNS Propagation)

### 6.1 Test Domain
```bash
# Check DNS propagation
dig vital.expert

# Test HTTPS
curl -I https://vital.expert
```

- [ ] DNS resolves to Vercel IP
- [ ] HTTPS certificate issued (automatic)
- [ ] Site loads at https://vital.expert
- [ ] Site loads at https://www.vital.expert

### 6.2 Final Checks
- [ ] Marketing site is live
- [ ] Fast load time (< 2 seconds)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Analytics tracking (if enabled)

---

## Troubleshooting

### ❌ Build Fails with Error

**Symptom:** Red X on deployment, build logs show errors

**Most Common Causes:**
1. **TypeScript errors** - Expected, we'll fix in Phase 2
2. **Missing dependencies** - Check package.json
3. **Environment variable typos** - Double-check spelling

**Solution:**
- Check the build logs for specific error
- For TypeScript errors, add this env var:
  ```
  NEXT_PUBLIC_ENABLE_MOCK_API=true
  ```
- Redeploy by clicking "Redeploy" button

### ❌ Domain Shows 404

**Symptom:** Preview URL works, but vital.expert shows 404

**Cause:** DNS not propagated yet

**Solution:**
- Wait 10-30 minutes
- Check DNS: `dig vital.expert`
- Should see Vercel IP: `76.76.21.21`
- If not, verify DNS records at your provider

### ❌ Blank Page or White Screen

**Symptom:** Site loads but shows nothing

**Cause:** Missing landing page component or JS error

**Solution:**
1. Open browser console (F12)
2. Look for error messages
3. Check if files are loading (Network tab)
4. Verify environment variables are set

---

## Success Criteria ✅

**Phase 1 is complete when:**
- [x] Vercel project `vital-marketing` created
- [x] Build succeeded (green checkmark)
- [x] Preview URL works
- [x] Custom domain `vital.expert` configured
- [x] DNS records added
- [x] HTTPS certificate issued (automatic)
- [x] Site loads at https://vital.expert
- [x] Landing page displays correctly
- [x] No critical console errors
- [x] Mobile responsive

---

## Next Steps

Once Phase 1 is complete:

**→ Move to Phase 2:** [Fix MVP Build Errors & Deploy Platform]

Phase 2 tasks:
1. Disable experimental API routes
2. Fix remaining build errors
3. Deploy platform app to new Vercel project
4. Configure wildcard domains (*.vital.expert)
5. Connect to Railway backend

---

## Need Help?

**If build fails:**
- Check build logs in Vercel dashboard
- Look for specific error message
- Share error with development team

**If domain issues:**
- Verify DNS records at your DNS provider
- Wait 24-48 hours for full propagation
- Use `dig vital.expert` to check status

**If site has errors:**
- Check browser console (F12)
- Verify all environment variables are set
- Try incognito/private browsing mode

---

**Status:** Ready to Deploy
**Estimated Time:** 15-20 minutes
**Difficulty:** Easy ⭐

**Good luck! 🚀**
