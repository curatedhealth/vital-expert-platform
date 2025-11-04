# 🚀 OPTION C: BOTH LOCAL + RAILWAY SETUP

**Status:** ✅ Dependencies installed, ready to configure  
**Time Required:** 7-10 minutes total  

---

## ✅ PART 1: LOCAL DEVELOPMENT (5 minutes)

### Step 1: Create `.env` File

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Copy the template
cp .env.template .env

# Now edit .env with your actual values from .env.vercel
# You can use any editor:
code .env        # VS Code
nano .env        # Terminal editor
vim .env         # Vim
open -e .env     # TextEdit (Mac)
```

**Required values to copy from `.env.vercel`:**
- `OPENAI_API_KEY` (starts with `sk-proj-` or `sk-`)
- `SUPABASE_URL` (format: `https://xxxxx.supabase.co`)
- `SUPABASE_SERVICE_KEY` (long JWT token)
- `TAVILY_API_KEY` (optional, starts with `tvly-`)
- `LANGFUSE_PUBLIC_KEY` (optional, starts with `pk-lf-`)
- `LANGFUSE_SECRET_KEY` (optional, starts with `sk-lf-`)

---

### Step 2: Start Local Server

```bash
# Make sure you're in the ai-engine directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Activate virtual environment
source venv/bin/activate

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Will watch for changes in these directories: ['/Users/...']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

### Step 3: Test Local Server

**Open a NEW terminal** (keep the server running) and run:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"vital-path-ai-services"}

# Test detailed health
curl http://localhost:8000/health/detailed

# Test Mode 1 API
curl -X POST http://localhost:8000/api/v1/ask-expert/mode1 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "query": "What is the FDA?",
    "agent_id": "regulatory-expert",
    "user_id": "test-user",
    "enable_rag": true
  }'
```

**If all tests pass:** ✅ Local development is ready!

---

## 🌐 PART 2: RAILWAY PRODUCTION (2 minutes)

### Step 1: Verify Railway Variables

Go to Railway dashboard:
1. **Your Project:** `vital-ai-engine-v2`
2. **Service:** `ai-engine`
3. **Tab:** Variables

**Verify these are set:**
- ✅ `OPENAI_API_KEY`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `TAVILY_API_KEY` (recommended)
- ✅ `LANGFUSE_PUBLIC_KEY` (recommended)
- ✅ `LANGFUSE_SECRET_KEY` (recommended)
- ✅ `ENVIRONMENT=production`
- ✅ `CORS_ORIGINS=https://your-vercel-app.vercel.app`

**If any are missing, add them now!**

---

### Step 2: Check Public Domain

Your Railway service URL:
```
https://ai-engine-production-17c7.up.railway.app
```

**If domain is active, test it:**

```bash
# Test Railway health
curl https://ai-engine-production-17c7.up.railway.app/health

# Expected: {"status":"healthy","service":"vital-path-ai-services"}

# Test Railway API
curl -X POST https://ai-engine-production-17c7.up.railway.app/api/v1/ask-expert/mode1 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "query": "What is the FDA?",
    "agent_id": "regulatory-expert",
    "user_id": "test-user",
    "enable_rag": true
  }'
```

---

### Step 3: Check Railway Logs

```bash
# Via Railway CLI (if installed)
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway logs --follow

# Or via Dashboard:
# Railway → Your Service → Logs tab
```

**Look for:**
- ✅ "Application startup complete"
- ✅ No error messages
- ⚠️ Any warnings about missing env vars

---

## 📊 SUCCESS CHECKLIST

### Local Development:
- [ ] `.env` file created with real values ✅
- [ ] Server starts without errors ✅
- [ ] `/health` returns 200 OK ✅
- [ ] Mode 1 API works ✅
- [ ] Can see logs in terminal ✅

### Railway Production:
- [ ] All environment variables set ✅
- [ ] Public domain active ✅
- [ ] `/health` returns 200 OK ✅
- [ ] Mode 1 API works ✅
- [ ] No errors in Railway logs ✅

---

## 🎯 WHEN BOTH ARE READY

### Use Local for:
- ✅ Development and testing
- ✅ Debugging (see logs immediately)
- ✅ Fast iteration (auto-reload on code changes)
- ✅ No deployment wait time
- ✅ Free (no Railway costs)

### Use Railway for:
- ✅ Production workloads
- ✅ Connecting to Vercel frontend
- ✅ Beta user testing
- ✅ Always-on availability
- ✅ Scalability

---

## 🚨 COMMON ISSUES

### Issue 1: Local server won't start
```bash
# Check if .env exists and has values:
cat .env | grep OPENAI_API_KEY

# If empty, edit .env and add your keys
nano .env
```

### Issue 2: "Module not found" error
```bash
# Reinstall dependencies:
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
source venv/bin/activate
pip install -r requirements.txt
```

### Issue 3: Railway domain not accessible
- Wait 1-2 minutes for DNS propagation
- Check Railway Logs for errors
- Verify environment variables are set

### Issue 4: API returns errors
- Check logs (local: terminal, Railway: dashboard)
- Verify OpenAI API key is valid
- Verify Supabase URL and key are correct

---

## 📝 QUICK REFERENCE

### Start Local Server:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Test Local:
```bash
curl http://localhost:8000/health
```

### Test Railway:
```bash
curl https://ai-engine-production-17c7.up.railway.app/health
```

### View Logs:
```bash
# Local: visible in terminal where server is running
# Railway: railway logs --follow (or dashboard)
```

---

## 🎉 YOU'RE DONE WHEN:

✅ Local server running on `http://localhost:8000`  
✅ Railway running on `https://ai-engine-production-17c7.up.railway.app`  
✅ Both respond to `/health` with 200 OK  
✅ Both can handle API requests  

**Then you have:**
- 🏠 Local dev environment for fast iteration
- 🌐 Production environment for real users
- 🎯 Best of both worlds!

---

**Next:** Let me know when you've edited `.env` and I'll help you start and test both! 🚀

