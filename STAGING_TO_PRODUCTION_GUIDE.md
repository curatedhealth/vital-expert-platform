# 🎯 Staging to Production Deployment Strategy

**Best Practice**: Test in staging → Verify → Promote to production

---

## 📊 Current Setup

### Vercel Environments
Vercel automatically creates 3 environments:
1. **Development** - Local development
2. **Preview** - Automatic for every Git branch/PR
3. **Production** - Main/master branch

### Railway Environments  
Railway has:
1. **Development** - Feature branches
2. **Preview** - PR environments
3. **Production** - Main branch

---

## 🚀 **Deployment Strategy**

### Option A: Branch-Based Staging (Recommended)

Create a staging branch that mirrors production:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Create staging branch from main
git checkout -b staging
git push -u origin staging

# Now you have:
# - main branch → Production
# - staging branch → Staging/Preview
# - feature branches → Development
```

---

### Option B: Vercel Preview Deployment (Fastest)

Use Vercel's automatic preview deployments:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Create a feature branch
git checkout -b test-sentry-integration

# Push to trigger preview deployment
git push -u origin test-sentry-integration

# Vercel will automatically create a preview URL
```

---

## 🎯 **Recommended Approach: Preview First**

### Step 1: Deploy to Vercel Preview (Staging)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Option 1: Via Vercel Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Click "Deployments"
# 4. Find the latest deployment
# 5. Click on it to get preview URL

# Option 2: Create preview branch
git checkout -b preview/test-monitoring
git push -u origin preview/test-monitoring
```

**Result**: Vercel automatically deploys this as a **Preview** environment

**Preview URL will be**: 
```
https://vital-marketing-site-[branch-hash]-crossroads-catalysts-projects.vercel.app
```

### Step 2: Test in Preview Environment

Once preview is deployed:

#### A. Test Sentry Frontend
```javascript
// Open preview URL
// Press F12 → Console
throw new Error("Sentry preview test");

// Check: https://sentry.io → vital-frontend
// Error should show preview URL in breadcrumbs
```

#### B. Test Application Features
- ✅ Authentication works
- ✅ Ask Expert loads
- ✅ Ask Panel functions
- ✅ Dashboard navigation
- ✅ No console errors

#### C. Run E2E Tests Against Preview
```bash
cd apps/digital-health-startup

# Point tests to preview URL
PLAYWRIGHT_TEST_BASE_URL=https://vital-marketing-site-[your-preview].vercel.app \
  npx playwright test

# Or update playwright.config.ts temporarily
```

### Step 3: Verify Backend (Already in Production)

Your backend is already on Railway production, but verify:

```bash
# Test health endpoint
curl https://vital-ai-engine.railway.app/health

# Test any other endpoint
curl https://vital-ai-engine.railway.app/frameworks/info

# Check Sentry for any errors
# https://sentry.io → vital-backend
```

### Step 4: Promote Preview to Production

Once testing passes:

#### Option A: Via Vercel Dashboard
1. Go to your preview deployment
2. Click **"Promote to Production"** button
3. Confirm promotion
4. Done! ✅

#### Option B: Merge to Main Branch
```bash
# Merge your preview branch to main
git checkout main
git merge preview/test-monitoring
git push origin main

# Vercel automatically deploys main to production
```

---

## 🏗️ **Complete Staging Environment Setup**

### For Long-Term Staging Environment

Create a dedicated staging setup:

#### 1. Create Staging Branch
```bash
git checkout -b staging
git push -u origin staging
```

#### 2. Configure Vercel Staging
In Vercel Dashboard:
1. Project Settings → Git
2. Set **Production Branch**: `main`
3. **Preview Branches**: All other branches (including `staging`)

#### 3. Set Staging Environment Variables
```bash
# In Vercel Dashboard for staging:
NEXT_PUBLIC_SENTRY_DSN=<your-frontend-dsn>
NEXT_PUBLIC_ENV=staging
NEXT_PUBLIC_API_URL=https://vital-ai-engine-staging.railway.app
```

#### 4. Configure Railway Staging
In Railway:
1. Create new service: `vital-ai-engine-staging`
2. Connect to `staging` branch
3. Set environment variables
4. Deploy

---

## 📋 **Testing Checklist (Staging)**

### Before Promoting to Production

- [ ] Preview deployment successful
- [ ] No build errors in logs
- [ ] App loads correctly
- [ ] Sentry error tracking works
- [ ] Authentication works
- [ ] Ask Expert feature works
- [ ] Ask Panel feature works
- [ ] Dashboard navigation works
- [ ] No console errors
- [ ] Mobile responsive works
- [ ] Performance is acceptable
- [ ] E2E tests pass (optional)

---

## 🎯 **Quick Start: Deploy to Preview NOW**

### Fastest Path (5 minutes):

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Your changes are already committed
# Just push to create preview

# Option 1: Current branch becomes preview
git push

# Go to Vercel Dashboard → Deployments
# Find your deployment → Get preview URL
# Test it!

# If everything works:
# Click "Promote to Production"
```

---

## 🔄 **Deployment Flow**

### Recommended Workflow

```
1. Develop locally
   ↓
2. Commit to feature/preview branch
   ↓
3. Push → Vercel creates Preview
   ↓
4. Test preview environment
   ↓
5. E2E tests (optional)
   ↓
6. Promote to Production
   OR
   Merge to main branch
   ↓
7. Production deployment
   ↓
8. Verify production
   ↓
9. Monitor with Sentry
```

---

## 🚨 **Rollback Plan**

If production has issues:

### Vercel Rollback
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"
4. Done!

### Railway Rollback
```bash
cd services/ai-engine
railway rollback
```

---

## 📊 **Environment Summary**

| Environment | Frontend (Vercel) | Backend (Railway) | Purpose |
|-------------|-------------------|-------------------|---------|
| **Development** | localhost:3000 | localhost:8000 | Local dev |
| **Preview** | Auto-generated URL | N/A | Testing |
| **Production** | your-domain.com | railway.app | Live users |

---

## ✅ **Recommended Next Steps**

### Option 1: Quick Preview Test (5 min)
1. Push current code (already done)
2. Get preview URL from Vercel
3. Test preview
4. Promote to production

### Option 2: Full Staging Setup (30 min)
1. Create `staging` branch
2. Configure Vercel for staging
3. Set up Railway staging
4. Test thoroughly
5. Merge to production

---

## 🎯 **What I Recommend**

Given that your changes are:
- ✅ Error tracking (safe, non-breaking)
- ✅ Test files (don't affect runtime)
- ✅ Documentation (no impact)
- ✅ Backup scripts (standalone)

**Recommended**: Use **Preview Deployment**

1. Check Vercel Dashboard for existing preview
2. Test the preview URL
3. If good → Promote to production
4. **Low risk, high value!**

---

**Next**: Tell me which option you prefer:
- **A**: Quick preview test (5 min)
- **B**: Full staging environment (30 min)
- **C**: Direct to production (if confident)

Let me know and I'll guide you through! 🚀

