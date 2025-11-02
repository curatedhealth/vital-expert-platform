# 🚀 RAILWAY DEV + STAGING DEPLOYMENT SETUP

**Date:** November 2, 2025  
**Purpose:** Proper environment separation for professional deployment  
**Time Required:** ~20-30 minutes  

---

## 🎯 **ARCHITECTURE OVERVIEW**

```
GitHub Repository: curatedhealth/vital-expert-platform
│
├── Branch: restructure/world-class-architecture (DEV)
│   └── Railway Service: ai-engine-dev
│       ├── Auto-deploy: ON (every push)
│       ├── Environment: DEV
│       └── URL: https://vital-ai-dev-xxxxx.railway.app
│
└── Branch: main (STAGING)
    └── Railway Service: ai-engine-staging
        ├── Auto-deploy: ON (on merge)
        ├── Environment: STAGING
        └── URL: https://vital-ai-staging-xxxxx.railway.app
```

**Benefits:**
- ✅ Safe testing in DEV (crashes OK)
- ✅ Stable STAGING for pre-production testing
- ✅ Clear promotion path (DEV → STAGING → PROD)
- ✅ Professional engineering practice

---

## 📋 **STEP-BY-STEP SETUP**

### **PHASE 1: SETUP DEV SERVICE** (10 minutes)

#### **Step 1.1: Rename Existing Service**

**In Railway Dashboard:**

1. Open your current project
2. Click on your existing service
3. Click "Settings" (⚙️ icon)
4. Under "Service Name", click "Edit"
5. Rename to: `ai-engine-dev`
6. Click "Save"

#### **Step 1.2: Configure DEV Environment**

**In Railway Dashboard → Service → Variables:**

Click "New Variable" and add these:

```bash
# Environment Identification
ENVIRONMENT=development
NODE_ENV=development

# Logging
LOG_LEVEL=debug
ENABLE_STRUCTURED_LOGGING=true

# CORS (Allow all for dev)
ENABLE_CORS=true
CORS_ORIGINS=*

# Feature Flags
ENABLE_DEBUG_ENDPOINTS=true
ENABLE_MOCK_DATA=false

# Database (Supabase - DEV instance)
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_KEY=your-dev-service-role-key
SUPABASE_JWT_SECRET=your-dev-jwt-secret

# OpenAI (use dev key or same key with usage tracking)
OPENAI_API_KEY=sk-your-openai-key

# Redis (optional for dev)
REDIS_URL=redis://default:xxxxx@redis-dev.railway.internal:6379

# LangSmith (Dev tracing)
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=vital-dev
LANGCHAIN_TRACING_V2=true

# Rate Limiting (Relaxed for dev)
RATE_LIMIT_ENABLED=false
```

#### **Step 1.3: Configure Build Settings**

**In Railway Dashboard → Service → Settings:**

**Root Directory:**
```
services/ai-engine
```

**Watch Paths (Advanced):**
```
services/ai-engine/**
```

**Dockerfile Path:**
```
Dockerfile
```

**Branch:**
```
restructure/world-class-architecture
```

**Auto-Deploy:**
- ✅ Enable Auto-Deploy
- Trigger: "On every commit to branch"

#### **Step 1.4: Verify DEV Deployment**

**Wait for deployment (~5 minutes), then test:**

```bash
# Get your Railway URL from dashboard
DEV_URL="https://your-service.up.railway.app"

# Test health endpoint
curl $DEV_URL/health

# Expected response:
# {
#   "status": "healthy",
#   "environment": "development",
#   "version": "...",
#   "timestamp": "..."
# }
```

**If health check passes:** ✅ DEV environment is ready!

---

### **PHASE 2: SETUP STAGING SERVICE** (10 minutes)

#### **Step 2.1: Create New Service**

**In Railway Dashboard:**

1. Click your project name (top left)
2. Click "+ New" button
3. Select "GitHub Repo"
4. Choose repository: `curatedhealth/vital-expert-platform`
5. Service name: `ai-engine-staging`
6. Click "Add Service"

#### **Step 2.2: Configure STAGING Build**

**In Railway Dashboard → ai-engine-staging → Settings:**

**Root Directory:**
```
services/ai-engine
```

**Watch Paths:**
```
services/ai-engine/**
```

**Dockerfile Path:**
```
Dockerfile
```

**Branch:**
```
main
```

**Auto-Deploy:**
- ✅ Enable Auto-Deploy
- Trigger: "On every commit to branch"

#### **Step 2.3: Configure STAGING Environment**

**In Railway Dashboard → ai-engine-staging → Variables:**

```bash
# Environment Identification
ENVIRONMENT=staging
NODE_ENV=production

# Logging
LOG_LEVEL=info
ENABLE_STRUCTURED_LOGGING=true

# CORS (Restrict to your frontend domains)
ENABLE_CORS=true
CORS_ORIGINS=https://staging.vitalexpert.ai,https://dev.vitalexpert.ai

# Feature Flags
ENABLE_DEBUG_ENDPOINTS=false
ENABLE_MOCK_DATA=false

# Database (Supabase - STAGING instance)
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_KEY=your-staging-service-role-key
SUPABASE_JWT_SECRET=your-staging-jwt-secret

# OpenAI (use same key or separate staging key)
OPENAI_API_KEY=sk-your-openai-key

# Redis (staging instance)
REDIS_URL=redis://default:xxxxx@redis-staging.railway.internal:6379

# LangSmith (Staging tracing)
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=vital-staging
LANGCHAIN_TRACING_V2=true

# Rate Limiting (Enabled for staging)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=1
```

#### **Step 2.4: Initial STAGING Deployment**

**Option A: Deploy from current main branch**

If `main` is behind `restructure/world-class-architecture`:

```bash
# In your local repo
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Make sure dev branch is up to date
git checkout restructure/world-class-architecture
git pull origin restructure/world-class-architecture

# Merge to main (if main is stable enough)
git checkout main
git pull origin main
git merge restructure/world-class-architecture

# Push to trigger staging deploy
git push origin main
```

**Option B: Wait until DEV is stable**

If current dev branch needs more testing:

1. Keep testing in DEV
2. Fix any issues
3. When stable, merge to `main`
4. Staging auto-deploys

---

### **PHASE 3: SETUP GIT WORKFLOW** (5 minutes)

#### **Step 3.1: Branch Strategy**

```
restructure/world-class-architecture (DEV)
├── Feature: Active development
├── Deploy: Auto-deploy to DEV on every push
└── Testing: Can break, crashes OK

main (STAGING)
├── Feature: Stable, tested code only
├── Deploy: Auto-deploy to STAGING on merge
└── Testing: Should be stable, pre-production

production (FUTURE PROD)
├── Feature: Production-ready only
├── Deploy: Manual or on merge from main
└── Testing: Must be stable, real users
```

#### **Step 3.2: Deployment Workflow**

**Daily Development:**

```bash
# 1. Work on dev branch
git checkout restructure/world-class-architecture

# 2. Make changes, commit
git add .
git commit -m "feat: your feature"

# 3. Push to trigger DEV deploy
git push origin restructure/world-class-architecture

# 4. Wait ~5 min, test in DEV
# https://vital-ai-dev-xxxxx.railway.app

# 5. If stable, create PR to main
# (via GitHub UI or gh CLI)

# 6. Merge to main when PR approved
# Triggers STAGING deploy automatically

# 7. Test in STAGING
# https://vital-ai-staging-xxxxx.railway.app

# 8. If staging passes, ready for PROD (future)
```

---

## 🧪 **TESTING CHECKLIST**

### **DEV Environment Tests:**

```bash
DEV_URL="https://your-dev.railway.app"

# 1. Health check
curl $DEV_URL/health

# 2. API docs (if enabled)
curl $DEV_URL/docs

# 3. Test a simple endpoint
curl -X POST $DEV_URL/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 4. Check logs in Railway dashboard
# Look for: No errors, successful requests
```

### **STAGING Environment Tests:**

```bash
STAGING_URL="https://your-staging.railway.app"

# 1. Health check
curl $STAGING_URL/health

# 2. Test Mode 1 (simplest workflow)
curl -X POST $STAGING_URL/api/ask-expert \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is FDA IND?",
    "mode": 1,
    "tenant_id": "your-tenant-id",
    "user_id": "test-user"
  }'

# 3. Verify response quality
# 4. Check logs for errors
# 5. Monitor performance metrics
```

---

## 📊 **ENVIRONMENT COMPARISON**

| Feature | DEV | STAGING | PROD (Future) |
|---------|-----|---------|---------------|
| **Branch** | `restructure/...` | `main` | `production` |
| **Auto-Deploy** | ✅ Yes | ✅ Yes | ❌ Manual |
| **Log Level** | `debug` | `info` | `warning` |
| **CORS** | `*` (all) | Specific domains | Specific domains |
| **Debug Endpoints** | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| **Rate Limiting** | ❌ Disabled | ✅ Enabled | ✅ Strict |
| **Database** | Dev DB | Staging DB | Prod DB |
| **Crashes OK?** | ✅ Yes | ⚠️ No | ❌ Never |
| **Purpose** | Active dev | Pre-prod testing | Real users |

---

## 🔐 **SECURITY CHECKLIST**

### **Environment Variables:**

**✅ REQUIRED for all environments:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENAI_API_KEY`

**✅ DIFFERENT per environment:**
- `ENVIRONMENT` (development/staging/production)
- `LOG_LEVEL` (debug/info/warning)
- `CORS_ORIGINS` (restrict in staging/prod)
- `LANGCHAIN_PROJECT` (separate tracing)

**✅ SECURE:**
- Never commit secrets to git
- Use Railway's variable management
- Rotate keys regularly
- Use different Supabase projects per env

---

## 💰 **COST ESTIMATE**

**Railway Pricing:**

```
DEV Service:
- Compute: ~$5-10/month (with sleep when idle)
- Database: Free (Supabase free tier)
- Total: ~$5-10/month

STAGING Service:
- Compute: ~$5-10/month (less active than dev)
- Database: Free or ~$5/month
- Total: ~$5-15/month

Combined: ~$10-25/month
```

**Worth it?**
- ✅ Yes - prevents "test in production" disasters
- ✅ Professional engineering practice
- ✅ Easy to scale when ready

---

## 🚨 **TROUBLESHOOTING**

### **Problem: Build fails in new environment**

**Solution:**
1. Check Root Directory is correct: `services/ai-engine`
2. Verify Dockerfile exists in that directory
3. Check branch is correct
4. Review build logs for specific errors

### **Problem: Environment variables not working**

**Solution:**
1. Verify variables are set in Railway dashboard
2. Check for typos in variable names
3. Restart service after adding variables
4. Check logs for "missing environment variable" errors

### **Problem: Health check fails**

**Solution:**
1. Check if app is starting (look for "Uvicorn running")
2. Verify PORT environment variable (Railway sets automatically)
3. Check health endpoint path is `/health`
4. Review startup logs for errors

### **Problem: Can't connect to Supabase**

**Solution:**
1. Verify `SUPABASE_URL` is correct
2. Check `SUPABASE_KEY` is service role key (not anon key)
3. Test connection from Railway (not just locally)
4. Check Supabase project is not paused

---

## 📋 **POST-SETUP CHECKLIST**

**After completing setup:**

- [ ] DEV service renamed and configured
- [ ] DEV environment variables set
- [ ] DEV deploys successfully
- [ ] DEV health check passes
- [ ] STAGING service created
- [ ] STAGING environment variables set
- [ ] STAGING branch configured (main)
- [ ] Git workflow documented
- [ ] Team knows which environment to use
- [ ] Monitoring/logging configured
- [ ] Cost tracking enabled

---

## 🎯 **NEXT STEPS**

**Immediate (Today):**
1. ✅ Complete DEV + STAGING setup
2. ✅ Deploy and test both environments
3. ✅ Verify health checks pass
4. ✅ Test one simple endpoint in each

**This Week:**
1. Test all 4 modes in DEV
2. Fix any bugs found
3. Merge stable code to STAGING
4. Test in STAGING thoroughly

**Future (When Ready for Users):**
1. Create PROD environment
2. Set up custom domain
3. Configure monitoring/alerts
4. Add CI/CD pipeline
5. Set up automated testing

---

## 📚 **RESOURCES**

**Railway Documentation:**
- [Environments](https://docs.railway.app/deploy/environments)
- [Deployments](https://docs.railway.app/deploy/deployments)
- [Environment Variables](https://docs.railway.app/develop/variables)

**Internal Documentation:**
- `RAILWAY_ENV_QUICK_SETUP.md` - Environment variables guide
- `RAILWAY_DEPLOYMENT_VERIFICATION.md` - Testing guide
- `RAILWAY_CRASH_DEBUG.md` - Troubleshooting guide

---

## ✅ **DEPLOYMENT VERIFICATION**

**Run these tests after setup:**

```bash
# DEV Environment
DEV_URL="https://your-dev.railway.app"
curl $DEV_URL/health
# Expected: {"status": "healthy", "environment": "development"}

# STAGING Environment  
STAGING_URL="https://your-staging.railway.app"
curl $STAGING_URL/health
# Expected: {"status": "healthy", "environment": "staging"}
```

**If both pass:** 🎉 **DEPLOYMENT COMPLETE!**

---

**Ready to proceed with setup?** 🚀

