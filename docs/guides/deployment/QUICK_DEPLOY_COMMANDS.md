# ⚡ QUICK DEPLOY COMMANDS - Copy & Paste

**Prerequisite:** You have `.env.vercel` with all your keys ✅  
**Time to Deploy:** 15-30 minutes  
**Platform:** Railway (Recommended)

---

## 🚀 OPTION 1: RAILWAY DASHBOARD (EASIEST)

### Step 1: Create Project (2 minutes)
1. Go to: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your VITAL repository
4. Choose `services/ai-engine` as root directory

### Step 2: Add Redis (1 minute)
1. Click "New" → "Database" → "Add Redis"
2. Done! Railway auto-configures `REDIS_URL`

### Step 3: Copy Variables (10 minutes)
1. Click your service → "Variables" tab
2. Click "Raw Editor"
3. Copy-paste from your `.env.vercel`:

```bash
# Copy these from your .env.vercel:
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=eyJhbG...
TAVILY_API_KEY=tvly-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...

# Add these new ones:
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://your-vercel-app.vercel.app
RATE_LIMIT_ENABLED=true
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT_SECONDS=300
```

### Step 4: Generate Admin Key (1 minute)
```bash
# Run locally to generate secure key:
openssl rand -base64 32

# Copy output and add to Railway:
ADMIN_API_KEY=[paste-generated-key]
```

### Step 5: Deploy! (1 click)
Railway auto-deploys when you save variables. Watch the logs!

---

## 🚀 OPTION 2: RAILWAY CLI (FASTEST IF YOU KNOW CLI)

### Installation & Setup:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to AI engine
cd services/ai-engine

# Create project
railway init

# Link to existing project (if already created)
railway link
```

### Add Redis:
```bash
railway add --plugin redis
```

### Set Variables (copy from your .env.vercel):
```bash
# Critical vars (from your .env.vercel):
railway variables set OPENAI_API_KEY="sk-proj-..."
railway variables set SUPABASE_URL="https://xxx.supabase.co"
railway variables set SUPABASE_SERVICE_KEY="eyJhbG..."
railway variables set TAVILY_API_KEY="tvly-..."
railway variables set LANGFUSE_PUBLIC_KEY="pk-lf-..."
railway variables set LANGFUSE_SECRET_KEY="sk-lf-..."

# New backend-specific vars:
railway variables set ENVIRONMENT="production"
railway variables set LOG_LEVEL="INFO"
railway variables set CORS_ORIGINS="https://your-app.vercel.app"
railway variables set RATE_LIMIT_ENABLED="true"
railway variables set MAX_CONCURRENT_REQUESTS="10"
railway variables set REQUEST_TIMEOUT_SECONDS="300"

# Generate and set admin key:
export ADMIN_KEY=$(openssl rand -base64 32)
railway variables set ADMIN_API_KEY="$ADMIN_KEY"
echo "Admin key: $ADMIN_KEY"  # Save this somewhere!
```

### Deploy:
```bash
railway up
```

### Monitor:
```bash
railway logs --follow
```

---

## ✅ VERIFY DEPLOYMENT (5 minutes)

### Get Your Service URL:
```bash
# Via CLI:
railway domain

# Or get from dashboard:
# https://railway.app → Your Project → Settings → Domains
```

### Test 1: Health Check
```bash
# Replace with your actual Railway URL:
export RAILWAY_URL="https://your-service.up.railway.app"

curl $RAILWAY_URL/health

# Expected response:
# {"status":"healthy","service":"vital-path-ai-services"}
```

### Test 2: Detailed Health
```bash
curl $RAILWAY_URL/health/detailed

# Should show:
# - status: healthy
# - database: connected
# - cache: connected
```

### Test 3: Quick API Test
```bash
curl -X POST $RAILWAY_URL/api/v1/ask-expert/mode1 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant-001" \
  -d '{
    "query": "What is FDA?",
    "agent_id": "regulatory-expert",
    "user_id": "test-user",
    "session_id": "test-session",
    "enable_rag": true
  }'

# Should return JSON with answer and citations
```

### Test 4: Autonomous Mode (The Real Test)
```bash
curl -X POST $RAILWAY_URL/api/v1/ask-expert/mode3 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant-001" \
  -d '{
    "query": "Research FDA guidance on digital therapeutics and summarize",
    "user_id": "test-user",
    "session_id": "test-session-2",
    "enable_rag": true,
    "enable_memory": true,
    "budget": {
      "max_cost_dollars": 0.50,
      "max_runtime_seconds": 120
    }
  }'

# Should show multi-step execution with tool usage
```

---

## 🔗 CONNECT FRONTEND TO BACKEND

### Update Your Vercel Frontend:

```bash
# In your Vercel project settings or .env.vercel:
NEXT_PUBLIC_AI_ENGINE_URL=https://your-service.up.railway.app

# Redeploy Vercel:
vercel --prod
```

### Or via Vercel Dashboard:
1. Go to Vercel project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_AI_ENGINE_URL` = `https://your-service.up.railway.app`
3. Redeploy

---

## 🔍 MONITORING COMMANDS

### Watch Logs:
```bash
# Real-time logs
railway logs --follow

# Last 100 lines
railway logs --tail 100

# Filter for errors
railway logs --grep error
```

### Check Service Status:
```bash
railway status
```

### Check Resource Usage:
```bash
# View in dashboard:
# Railway → Your Service → Metrics
# Shows: CPU, Memory, Network, Request count
```

### Check Costs:
```bash
# Railway costs:
# Dashboard → Usage

# OpenAI costs:
# https://platform.openai.com/usage

# LangFuse traces:
# https://cloud.langfuse.com → Your Project → Dashboard
```

---

## 🚨 TROUBLESHOOTING COMMANDS

### Service Won't Start:
```bash
# Check logs for errors:
railway logs --tail 100

# Common issues:
# - Missing environment variable
# - Database connection failed
# - Port already in use

# Fix: Check all variables set correctly
railway variables
```

### Deployment Failed:
```bash
# Check build logs:
railway logs --deployment [deployment-id]

# Redeploy:
railway up --detach

# Rollback if needed:
railway rollback
```

### High Memory Usage:
```bash
# Check metrics in dashboard
# Increase memory limit:
railway service update --memory 2048  # 2GB
```

### Slow Responses:
```bash
# Check if Redis connected:
railway logs --grep redis

# Verify caching working:
railway logs --grep "cache hit"

# Increase timeout if needed:
railway variables set REQUEST_TIMEOUT_SECONDS="600"
```

---

## 📊 LOAD TESTING (After Successful Deploy)

### Simple Load Test:
```bash
# Install hey (HTTP load testing tool)
go install github.com/rakyll/hey@latest

# Run load test (10 concurrent, 100 requests)
hey -n 100 -c 10 -m POST \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{"query":"test","agent_id":"regulatory-expert","user_id":"test","enable_rag":true}' \
  $RAILWAY_URL/api/v1/ask-expert/mode1
```

### Monitor During Load Test:
```bash
# In another terminal:
railway logs --follow
```

---

## 🎯 POST-DEPLOYMENT CHECKLIST

**Immediate (First Hour):**
- [ ] Health endpoint responds ✅
- [ ] All 4 modes tested ✅
- [ ] Frontend can connect ✅
- [ ] Monitoring active (LangFuse) ✅
- [ ] No critical errors in logs ✅

**First 24 Hours:**
- [ ] Monitor logs for errors
- [ ] Test with 1-2 beta users
- [ ] Check cost tracking
- [ ] Verify rate limiting works
- [ ] Document any issues

**First Week:**
- [ ] Fix bugs as found
- [ ] Optimize performance
- [ ] Tune cache settings
- [ ] Expand to 5-10 users
- [ ] Collect feedback

---

## 🎉 SUCCESS!

**If all tests pass, you've successfully deployed!** 

Your architecture is now:
```
Vercel Frontend (Next.js)
    ↓
Railway Backend (Python/FastAPI)
    ↓
├─ OpenAI (LLM)
├─ Supabase (Database)
├─ Redis (Cache)
├─ Tavily (Web Search)
└─ LangFuse (Monitoring)
```

**Next Steps:**
1. ✅ Share Railway URL with team
2. ✅ Onboard first beta user
3. ✅ Monitor closely for 24 hours
4. ✅ Fix any issues found
5. ✅ Scale gradually (2 → 5 → 10 users)

---

## 📞 QUICK HELP

### If Something Goes Wrong:

**Option 1: Check Logs**
```bash
railway logs --tail 200 | grep -i error
```

**Option 2: Rollback**
```bash
railway rollback
```

**Option 3: Restart Service**
```bash
railway service restart
```

**Option 4: Check Status Pages**
- Railway: https://status.railway.app
- OpenAI: https://status.openai.com
- Supabase: https://status.supabase.com

---

**Document Status:** ✅ READY TO USE  
**Estimated Time:** 15-30 minutes  
**Difficulty:** EASY (mostly copy-paste)

**You're one `railway up` command away from being live!** 🚀

