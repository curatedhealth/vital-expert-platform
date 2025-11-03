# 🔄 MIGRATION GUIDE: .env.vercel → Railway/Modal

**Status:** ✅ You already have environment variables!  
**Source:** `.env.vercel`  
**Target:** Railway or Modal deployment  
**Time Required:** 10-15 minutes  

---

## ✅ STEP 1: VERIFY YOUR EXISTING VARIABLES

### Your `.env.vercel` Should Contain:

**Critical Variables (Backend AI Services Need These):**
```bash
# These are REQUIRED for AI engine:
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=eyJhbG...  # ← Backend needs this!

# Optional but recommended:
TAVILY_API_KEY=tvly-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
```

**Variables You May Have (Frontend-Specific):**
```bash
# These are for Next.js frontend:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## ✅ STEP 2: MAPPING TO RAILWAY

### Option A: Copy via Railway Dashboard (Easiest)

1. **Open your `.env.vercel`** (wherever it's stored)
2. **Go to Railway Dashboard** → Your Project → Service → Variables
3. **Click "Raw Editor"**
4. **Copy-paste relevant variables** from `.env.vercel`
5. **Add any missing backend-specific vars** (see below)

### Option B: Use Railway CLI

```bash
# Set variables one by one
railway variables set OPENAI_API_KEY=sk-...
railway variables set SUPABASE_URL=https://...
railway variables set SUPABASE_SERVICE_KEY=...
railway variables set TAVILY_API_KEY=tvly-...
railway variables set LANGFUSE_PUBLIC_KEY=pk-lf-...
railway variables set LANGFUSE_SECRET_KEY=sk-lf-...
```

---

## ⚠️ CRITICAL: BACKEND-SPECIFIC VARIABLES

### Variables Backend Needs (That Vercel Frontend Doesn't):

```bash
# ============================================
# BACKEND AI ENGINE SPECIFIC
# ============================================

# Database (Backend needs direct connection)
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
# Get from: Supabase → Settings → Database → Connection String

# Service Key (Backend needs full permissions)
SUPABASE_SERVICE_KEY=eyJhbG...  # NOT the anon key!
# Get from: Supabase → Settings → API → service_role key

# Redis (Railway auto-provides this)
REDIS_URL=${{Redis.REDIS_URL}}  # Railway fills this automatically

# Application
PORT=${{PORT}}  # Railway fills this automatically
ENVIRONMENT=production
LOG_LEVEL=INFO

# Security
CORS_ORIGINS=https://your-vercel-app.vercel.app
RATE_LIMIT_ENABLED=true
ADMIN_API_KEY=[generate-secure-key]  # Generate with: openssl rand -base64 32

# Performance
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT_SECONDS=300
```

---

## ✅ STEP 3: VERIFY CRITICAL KEYS EXIST

### Checklist - Make Sure You Have:

**From OpenAI:**
- [ ] `OPENAI_API_KEY` (starts with `sk-proj-` or `sk-`)
- [ ] Format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**From Supabase:**
- [ ] `SUPABASE_URL` (format: `https://xxxxx.supabase.co`)
- [ ] `SUPABASE_ANON_KEY` (JWT token, starts with `eyJhbG...`)
- [ ] `SUPABASE_SERVICE_KEY` (JWT token, starts with `eyJhbG...` - **different from anon!**)
- [ ] `DATABASE_URL` (format: `postgresql://postgres:...@db.xxx.supabase.co:5432/postgres`)

**From Tavily (Optional but Recommended):**
- [ ] `TAVILY_API_KEY` (starts with `tvly-`)

**From LangFuse (Optional but Recommended):**
- [ ] `LANGFUSE_PUBLIC_KEY` (starts with `pk-lf-`)
- [ ] `LANGFUSE_SECRET_KEY` (starts with `sk-lf-`)

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: Missing SERVICE_KEY

**Problem:**
`.env.vercel` might only have `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend safe key), but backend needs `SUPABASE_SERVICE_KEY` (admin key).

**Solution:**
```bash
# Get service key from Supabase:
1. Go to your Supabase project
2. Settings → API
3. Find "service_role" key (NOT anon/public)
4. Copy and add to Railway:
   SUPABASE_SERVICE_KEY=eyJhbGciOi... [the long JWT token]
```

### Issue 2: Missing DATABASE_URL

**Problem:**
Frontend doesn't need direct database access, but backend does.

**Solution:**
```bash
# Get from Supabase:
1. Settings → Database
2. Connection String → URI
3. Copy and replace [YOUR-PASSWORD]:
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Issue 3: NEXT_PUBLIC_ Prefix

**Problem:**
Vercel uses `NEXT_PUBLIC_` prefix for frontend, but backend uses raw names.

**Solution:**
```bash
# In Railway, use WITHOUT prefix:
✅ SUPABASE_URL (not NEXT_PUBLIC_SUPABASE_URL)
✅ SUPABASE_ANON_KEY (not NEXT_PUBLIC_SUPABASE_ANON_KEY)
✅ OPENAI_API_KEY (backend never exposes to frontend)
```

### Issue 4: Missing CORS Configuration

**Problem:**
Backend needs to know which frontend domains to allow.

**Solution:**
```bash
# Add your Vercel domain:
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-staging.vercel.app

# Or if you have custom domain:
CORS_ORIGINS=https://app.yourdomain.com,https://staging.yourdomain.com
```

---

## ✅ STEP 4: DEPLOY TO RAILWAY

### Quick Deploy Process:

```bash
# 1. Install Railway CLI (if not already)
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate to AI engine
cd /path/to/VITAL/services/ai-engine

# 4. Initialize Railway project
railway init

# 5. Add Redis (automatic)
railway add --plugin redis

# 6. Set all variables (see Step 2)
railway variables set OPENAI_API_KEY=...
# ... (set all from your .env.vercel)

# 7. Deploy!
railway up

# 8. Watch logs
railway logs --follow
```

---

## ✅ STEP 5: VERIFY DEPLOYMENT

### Test 1: Health Check
```bash
# Get your Railway URL
railway domain

# Test health
curl https://your-service.up.railway.app/health

# Expected:
{
  "status": "healthy",
  "service": "vital-path-ai-services"
}
```

### Test 2: Quick API Test
```bash
curl -X POST https://your-service.up.railway.app/api/v1/ask-expert/mode1 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "query": "What is FDA?",
    "agent_id": "regulatory-expert",
    "user_id": "test-user",
    "enable_rag": true
  }'
```

### Test 3: Connect Frontend
```bash
# In your Vercel frontend, add:
NEXT_PUBLIC_AI_ENGINE_URL=https://your-service.up.railway.app
```

---

## 🎯 DEPLOYMENT READINESS CHECKLIST

### Before Deploying, Verify:

**Environment Variables:**
- [ ] All vars from `.env.vercel` reviewed ✅
- [ ] `SUPABASE_SERVICE_KEY` added (backend needs this) ✅
- [ ] `DATABASE_URL` added (if missing) ✅
- [ ] `TAVILY_API_KEY` added (for web search) ✅
- [ ] `LANGFUSE_*` keys added (for monitoring) ✅
- [ ] `CORS_ORIGINS` set to your Vercel domain ✅
- [ ] `ADMIN_API_KEY` generated (secure) ✅

**Infrastructure:**
- [ ] Railway account created ✅
- [ ] Redis plugin added ✅
- [ ] All variables set in Railway ✅

**Testing:**
- [ ] Health endpoint responds ✅
- [ ] API test works ✅
- [ ] Frontend can connect ✅

**If all checked, you're ready!** 🚀

---

## 📊 EXPECTED ARCHITECTURE

```
┌─────────────────────────┐
│   Vercel Frontend       │
│   (Next.js)             │
│   - Uses .env.vercel    │
│   - NEXT_PUBLIC_* vars  │
└─────────┬───────────────┘
          │
          │ HTTPS API calls
          │
          ▼
┌─────────────────────────┐
│   Railway Backend       │
│   (Python/FastAPI)      │
│   - AI Engine           │
│   - Uses same keys      │
│   - Plus SERVICE_KEY    │
└─────────┬───────────────┘
          │
          ├─────► OpenAI (LLM)
          ├─────► Supabase (Database)
          ├─────► Redis (Cache)
          ├─────► Tavily (Web Search)
          └─────► LangFuse (Monitoring)
```

---

## 💡 PRO TIPS

### Tip 1: Use Railway's Variable References
```bash
# Railway auto-provides these:
REDIS_URL=${{Redis.REDIS_URL}}  # ← Railway fills this
PORT=${{PORT}}  # ← Railway sets this
```

### Tip 2: Different Keys for Staging/Prod
```bash
# Best practice: separate environments
# Staging:
railway project create vital-ai-staging
railway variables set ENVIRONMENT=staging

# Production:
railway project create vital-ai-production
railway variables set ENVIRONMENT=production
```

### Tip 3: Test with Staging First
```bash
# Deploy to staging, test, then production:
1. Deploy to staging Railway
2. Point Vercel preview to staging backend
3. Test thoroughly
4. Then deploy to production Railway
5. Update Vercel production to use prod backend
```

### Tip 4: Monitor Costs
```bash
# Railway:
- Check usage in dashboard
- Set budget alerts

# OpenAI:
- Check usage at platform.openai.com
- Set monthly limits

# LangFuse:
- Monitor trace counts
- Check free tier limits (50k/month)
```

---

## 🚨 SECURITY CHECKLIST

### Before Going Live:

- [ ] ✅ No `.env` files committed to git
- [ ] ✅ `SUPABASE_SERVICE_KEY` only in Railway (never in frontend)
- [ ] ✅ Different API keys for staging/production
- [ ] ✅ `CORS_ORIGINS` restricted to your domains (not *)
- [ ] ✅ `ADMIN_API_KEY` is strong (32+ characters)
- [ ] ✅ Rate limiting enabled
- [ ] ✅ All secrets rotated in last 90 days

---

## ✅ SUCCESS CRITERIA

### Deployment Successful If:

1. ✅ Railway service running (no crashes)
2. ✅ Health endpoint returns 200
3. ✅ API test returns valid response
4. ✅ Vercel frontend can call Railway backend
5. ✅ Tenant isolation working
6. ✅ Rate limiting active
7. ✅ Monitoring traces appearing in LangFuse
8. ✅ No critical errors in logs

**If all pass, you're live!** 🎉

---

## 📞 QUICK REFERENCE

### Railway URLs:
- Dashboard: https://railway.app/dashboard
- CLI Docs: https://docs.railway.app/develop/cli
- Status: https://status.railway.app

### Your Vercel URLs:
- Dashboard: https://vercel.com/dashboard
- Deployments: https://vercel.com/[your-team]/deployments

### API Service URLs:
- OpenAI: https://platform.openai.com
- Supabase: https://app.supabase.com
- Tavily: https://app.tavily.com
- LangFuse: https://cloud.langfuse.com

---

## 🎯 BOTTOM LINE

**You already have the hard part done!** ✅

Your `.env.vercel` contains most of what you need. Just:

1. ✅ Copy vars to Railway (10 min)
2. ✅ Add missing backend-specific vars (5 min)
3. ✅ Deploy (30-60 min)
4. ✅ Test and monitor (ongoing)

**No need to gather keys from scratch - you already have them!** 🎉

---

**Document Status:** ✅ READY TO USE  
**Estimated Time:** 15-30 minutes (since you have keys)  
**Difficulty:** EASY (just copy-paste vars)  
**Next Step:** Open Railway, paste vars, deploy

**You're literally 15 minutes away from deployment.** 🚀

