# ✅ RAILWAY DEPLOYMENT - QUICK START CHECKLIST

**Use this checklist to set up DEV + STAGING environments in Railway**

---

## 🎯 **PHASE 1: DEV ENVIRONMENT** (10 minutes)

### **1.1 Rename Service**
- [ ] Go to Railway Dashboard
- [ ] Click on existing service
- [ ] Settings → Service Name → Rename to `ai-engine-dev`
- [ ] Save

### **1.2 Configure Branch**
- [ ] Settings → Source
- [ ] Branch: `restructure/world-class-architecture`
- [ ] Root Directory: `services/ai-engine`
- [ ] Auto-Deploy: ✅ ON
- [ ] Save

### **1.3 Set Environment Variables**
Copy these into Railway → Variables:

```bash
ENVIRONMENT=development
LOG_LEVEL=debug
ENABLE_CORS=true
CORS_ORIGINS=*
SUPABASE_URL=<your-dev-supabase-url>
SUPABASE_KEY=<your-dev-service-role-key>
OPENAI_API_KEY=<your-openai-key>
LANGCHAIN_API_KEY=<your-langsmith-key>
LANGCHAIN_PROJECT=vital-dev
LANGCHAIN_TRACING_V2=true
```

### **1.4 Deploy & Test**
- [ ] Wait for auto-deploy (~5 min)
- [ ] Copy Railway URL from dashboard
- [ ] Test: `curl https://YOUR-DEV-URL.railway.app/health`
- [ ] Verify: `{"status": "healthy", "environment": "development"}`

✅ **DEV COMPLETE** when health check passes

---

## 🎯 **PHASE 2: STAGING ENVIRONMENT** (10 minutes)

### **2.1 Create New Service**
- [ ] Railway Dashboard → Click project name
- [ ] Click "+ New" button
- [ ] Select "GitHub Repo"
- [ ] Choose: `curatedhealth/vital-expert-platform`
- [ ] Name: `ai-engine-staging`
- [ ] Click "Add Service"

### **2.2 Configure Branch**
- [ ] Settings → Source
- [ ] Branch: `main`
- [ ] Root Directory: `services/ai-engine`
- [ ] Auto-Deploy: ✅ ON
- [ ] Save

### **2.3 Set Environment Variables**
Copy these into Railway → Variables:

```bash
ENVIRONMENT=staging
LOG_LEVEL=info
ENABLE_CORS=true
CORS_ORIGINS=https://staging.vitalexpert.ai,https://dev.vitalexpert.ai
SUPABASE_URL=<your-staging-supabase-url>
SUPABASE_KEY=<your-staging-service-role-key>
OPENAI_API_KEY=<your-openai-key>
LANGCHAIN_API_KEY=<your-langsmith-key>
LANGCHAIN_PROJECT=vital-staging
LANGCHAIN_TRACING_V2=true
RATE_LIMIT_ENABLED=true
```

### **2.4 Deploy & Test**
- [ ] Merge dev branch to main (or wait until stable)
- [ ] Wait for auto-deploy (~5 min)
- [ ] Copy Railway URL from dashboard
- [ ] Test: `curl https://YOUR-STAGING-URL.railway.app/health`
- [ ] Verify: `{"status": "healthy", "environment": "staging"}`

✅ **STAGING COMPLETE** when health check passes

---

## 🎯 **PHASE 3: GIT WORKFLOW** (5 minutes)

### **3.1 Update Branch Strategy**

**Daily Development:**
```bash
# Work on dev branch
git checkout restructure/world-class-architecture
git pull origin restructure/world-class-architecture

# Make changes
git add .
git commit -m "feat: your feature"

# Push → triggers DEV deploy
git push origin restructure/world-class-architecture

# Test in DEV, if stable → merge to main
```

**When Stable:**
```bash
# Merge to staging
git checkout main
git pull origin main
git merge restructure/world-class-architecture
git push origin main  # Triggers STAGING deploy

# Test in STAGING
```

- [ ] Document workflow for team
- [ ] Test one push to dev branch
- [ ] Verify DEV auto-deploys
- [ ] Test one merge to main
- [ ] Verify STAGING auto-deploys

✅ **WORKFLOW COMPLETE** when auto-deploys work

---

## 🧪 **VERIFICATION TESTS**

### **Run After Setup:**

```bash
# Set your URLs (from Railway dashboard)
DEV_URL="https://your-dev.railway.app"
STAGING_URL="https://your-staging.railway.app"

# Test DEV
echo "Testing DEV..."
curl $DEV_URL/health

# Test STAGING
echo "Testing STAGING..."
curl $STAGING_URL/health

# Both should return:
# {"status": "healthy", "environment": "development/staging"}
```

- [ ] DEV health check passes
- [ ] STAGING health check passes
- [ ] DEV shows `"environment": "development"`
- [ ] STAGING shows `"environment": "staging"`

✅ **ALL TESTS PASS** = Ready to use!

---

## 📊 **FINAL CHECKLIST**

- [ ] DEV service configured and deployed
- [ ] STAGING service configured and deployed
- [ ] Both health checks passing
- [ ] Git workflow documented
- [ ] Team knows which env to use:
  - **DEV**: Active development, crashes OK
  - **STAGING**: Pre-production testing, should be stable
- [ ] URLs saved somewhere accessible
- [ ] Environment variables secured (not in git)

---

## 🎯 **WHAT'S NEXT?**

**Today:**
- [ ] Complete checklist above
- [ ] Test one simple API call in DEV
- [ ] Verify logs in Railway dashboard

**This Week:**
- [ ] Test all 4 modes in DEV
- [ ] Fix bugs found in testing
- [ ] Merge stable code to STAGING
- [ ] Test thoroughly in STAGING

**When Ready for Users:**
- [ ] Create PROD environment
- [ ] Set up custom domain
- [ ] Configure monitoring
- [ ] Announce launch

---

## 🚨 **IF SOMETHING GOES WRONG**

**Build fails:**
1. Check Root Directory = `services/ai-engine`
2. Check Dockerfile exists
3. Review build logs
4. See `RAILWAY_CRASH_DEBUG.md`

**Health check fails:**
1. Check if app started ("Uvicorn running" in logs)
2. Verify environment variables are set
3. Check for Python errors in logs
4. See `RAILWAY_DEPLOYMENT_VERIFICATION.md`

**Can't access service:**
1. Check deployment status (should be green "Deployed")
2. Copy URL from Railway dashboard (not guessed)
3. Wait 30 seconds after deploy completes
4. Check Railway logs for errors

---

## 📚 **FULL DOCUMENTATION**

See `RAILWAY_DEV_STAGING_SETUP.md` for:
- Detailed explanations
- Troubleshooting guide
- Security best practices
- Cost estimates
- Testing strategies

---

**Estimated Total Time:** 20-30 minutes  
**Current Status:** Ready to begin  
**Next Action:** Start Phase 1 (DEV Environment)

🚀 **Let's go!**
