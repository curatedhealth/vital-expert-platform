# 🚀 ASK PANEL LOCAL SETUP GUIDE
## Using Local AI-Engine with Local Configuration

**Configuration:** Local Backend + Local Frontend + Existing Environment Variables  
**Date:** November 2, 2025  

---

## 📋 CURRENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (localhost:3002)                              │
│  digital-health-startup Next.js app                     │
│  Uses: .env.vercel                                      │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  Backend (localhost:8000)                               │
│  ai-engine FastAPI service (LOCAL)                      │
│  Uses: services/ai-engine/.env.local (from .env.vercel) │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  Database (Remote Supabase)                             │
│  Multi-tenant PostgreSQL with RLS                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 ENVIRONMENT CONFIGURATION

### ✅ Using Existing `.env.vercel` File

**Great news!** All your API keys and credentials are already configured in `.env.vercel` at the project root.

### 1. Backend Configuration (ai-engine)

**Option A: Symlink (Recommended)**
```bash
# Link to existing .env.vercel from ai-engine
cd services/ai-engine
ln -s ../../.env.vercel .env.local
```

**Option B: Copy (Alternative)**
```bash
# Copy .env.vercel to ai-engine
cp .env.vercel services/ai-engine/.env.local
```

**Required Variables in .env.vercel:**
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - For backend database access
- ✅ `ANTHROPIC_API_KEY` - For Claude models
- ✅ `OPENAI_API_KEY` - For OpenAI models
- ✅ `DATABASE_URL` - PostgreSQL connection string

### 2. Frontend Configuration (digital-health-startup)

**Option A: Symlink (Recommended)**
```bash
# Link to existing .env.vercel from frontend
cd apps/digital-health-startup
ln -s ../../.env.vercel .env.local
```

**Option B: Update Existing .env.local**
```bash
# Edit apps/digital-health-startup/.env.local
# Add this line:
NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000
```

**Required Frontend Variables:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - From .env.vercel
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From .env.vercel
- ⚠️ `NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000` - **ADD THIS**

---

## 🏃 ONE-TIME SETUP (Do this once)

### Step 1: Create Symlinks

```bash
# From project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Link ai-engine to .env.vercel
cd services/ai-engine
ln -sf ../../.env.vercel .env.local
cd ../..

# Link frontend to .env.vercel (or add NEXT_PUBLIC_AI_ENGINE_URL)
cd apps/digital-health-startup

# Option A: Symlink (if .env.local doesn't exist)
ln -sf ../../.env.vercel .env.local

# Option B: Edit existing .env.local (if it already exists)
echo "NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000" >> .env.local

cd ../..
```

### Step 2: Verify Symlinks
```bash
# Check ai-engine
ls -la services/ai-engine/.env.local
# Should show: .env.local -> ../../.env.vercel

# Check frontend
ls -la apps/digital-health-startup/.env.local
# Should show: .env.local -> ../../.env.vercel (if symlinked)
```

---

## 🏃 DAILY STARTUP SEQUENCE

### Terminal 1: Start Backend (ai-engine)

```bash
# Navigate to ai-engine
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Activate virtual environment (if using venv)
source venv/bin/activate  # macOS/Linux

# Install dependencies (first time only)
# pip install -r requirements.txt

# Start FastAPI server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [xxxxx] using StatReload
# INFO:     Started server process [xxxxx]
# INFO:     Waiting for application startup.
# ✅ Supabase client initialized
# ✅ Ask Panel dependencies initialized
# ✅ Ask Panel routes registered
# INFO:     Application startup complete.
```

### Terminal 2: Start Frontend (digital-health-startup)

```bash
# In a NEW terminal
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Install dependencies (first time only)
# pnpm install

# Start Next.js dev server
pnpm dev

# Expected output:
# > digital-health-startup@0.1.0 dev
# > next dev -p 3002
# 
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3002
# - Environments: .env.local
# 
# ✓ Ready in 2.5s
```

### Step 3: Verify Setup

**Backend Health Check:**
```bash
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-02T10:00:00Z",
  "services": {
    "supabase": "connected",
    "database": "connected"
  }
}
```

**Backend API Docs:**
```bash
open http://localhost:8000/docs
# Should open FastAPI Swagger UI
```

**Frontend:**
```bash
open http://localhost:3002/ask-panel
# Should load the Ask Panel page
```

---

## 🧪 TESTING THE INTEGRATION

### Test 1: Panel Creation

**Using the UI:**
1. Navigate to `http://localhost:3002/ask-panel`
2. Select "Scientific Advisory Board" archetype
3. Select "Symbiotic" fusion model
4. Choose "Regulatory Affairs" → "Regulatory Submissions" → "510(k) Clearance Strategy"
5. Wait for panel creation (should see toast notification)

**Expected Backend Logs:**
```
INFO: POST /api/v1/panels/ - Panel creation request
INFO: Tenant ID: {tenant_id}, User ID: {user_id}
INFO: Creating panel with 3 experts
INFO: Panel created successfully: {panel_id}
```

**Verify in Supabase:**
```sql
SELECT id, tenant_id, user_id, panel_type, status, created_at 
FROM panels 
ORDER BY created_at DESC 
LIMIT 1;
```

### Test 2: Panel Execution

**Using the UI:**
1. Enter a question: "What regulatory pathway should we pursue for our AI diagnostic device?"
2. Click "Ask Panel"
3. Wait for response (10-60 seconds)
4. Verify consensus display

**Expected Backend Logs:**
```
INFO: POST /api/v1/panels/{panel_id}/execute - Panel execution request
INFO: Executing panel with 3 experts in parallel mode
INFO: Expert 1 completed in 12.3s
INFO: Expert 2 completed in 15.1s
INFO: Expert 3 completed in 14.8s
INFO: Consensus calculated: 0.85 (85%)
INFO: Panel execution completed in 45.2s
```

**Verify in Supabase:**
```sql
-- Check panel status updated
SELECT id, status, completed_at FROM panels WHERE id = '{panel_id}';

-- Check responses created
SELECT count(*) FROM panel_responses WHERE panel_id = '{panel_id}';

-- Check consensus created
SELECT consensus_level, agreement_points, disagreement_points 
FROM panel_consensus 
WHERE panel_id = '{panel_id}';

-- Check usage tracked
SELECT sum(tokens_used), sum(cost_usd) 
FROM agent_usage 
WHERE panel_id = '{panel_id}';
```

### Test 3: Sidebar Data

**Using the UI:**
1. Check the sidebar on the left
2. Verify "Recent Panels" shows the created panel
3. Verify "Usage This Month" shows analytics

**Expected API Calls:**
```
GET /api/v1/panels/?limit=10
Response: { panels: [...], total: 1 }

GET /api/v1/analytics/usage
Response: { 
  total_panels: 1, 
  total_consultations: 1,
  total_cost_usd: 0.47,
  avg_consensus: 0.85
}
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Backend Can't Connect to Supabase

**Symptom:**
```
ERROR: Failed to initialize Supabase client
ERROR: Invalid API key or URL
```

**Solution:**
1. Verify `SUPABASE_URL` is correct (check Supabase dashboard)
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (Settings → API)
3. Check if Supabase project is active (not paused)
4. Test connection directly:
   ```bash
   curl https://your-project.supabase.co/rest/v1/ \
     -H "apikey: your-anon-key" \
     -H "Authorization: Bearer your-service-role-key"
   ```

### Issue 2: Frontend Can't Reach Backend

**Symptom:**
```
Failed to fetch
Network Error
ERR_CONNECTION_REFUSED
```

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_AI_ENGINE_URL` in `.env.local`
3. Verify CORS is configured in backend (should allow `http://localhost:3002`)
4. Check browser console for CORS errors

### Issue 3: Panel Creation Returns 401 Unauthorized

**Symptom:**
```
Panel API Error: 401 Unauthorized
X-Tenant-ID header is required
```

**Solution:**
1. Verify you're logged in to the frontend
2. Check `TenantContext` is providing `currentTenant.id`
3. Check `useAuth()` is providing `user.id`
4. Verify JWT token is being sent:
   ```javascript
   // In browser console
   const supabase = createClient();
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Access Token:', session?.access_token);
   ```

### Issue 4: RLS Blocks Panel Access

**Symptom:**
```
Panel created but not visible in list
Empty panels array returned
```

**Solution:**
1. Verify RLS policies are set up correctly in Supabase
2. Check user has `tenant_users` entry:
   ```sql
   SELECT * FROM tenant_users WHERE user_id = auth.uid();
   ```
3. Verify `X-Tenant-ID` matches user's tenant:
   ```sql
   SELECT tenant_id FROM tenant_users WHERE user_id = '{user_id}';
   ```
4. Test query directly in Supabase SQL editor:
   ```sql
   SELECT * FROM panels WHERE tenant_id = '{tenant_id}';
   ```

### Issue 5: Expert Responses Not Appearing

**Symptom:**
```
Panel executes but no responses in UI
Console shows empty expert_responses array
```

**Solution:**
1. Check backend logs for expert execution errors
2. Verify LLM API keys are set (ANTHROPIC_API_KEY, OPENAI_API_KEY)
3. Check if LLM API rate limits are hit
4. Test expert call directly:
   ```bash
   curl -X POST http://localhost:8000/api/v1/agents/test \
     -H "Content-Type: application/json" \
     -d '{"query": "Test query"}'
   ```

---

## 📊 MONITORING & DEBUGGING

### Backend Logs

**View in Terminal:**
```bash
# Backend logs show real-time activity
tail -f logs/ai-engine.log  # if logging to file

# Or just watch terminal output
```

**Key Log Patterns:**
```
✅ Success: "Panel created successfully"
⚠️ Warning: "Panel execution timeout"
❌ Error: "Failed to connect to Supabase"
🎯 Info: "Consensus calculated: 0.85"
```

### Frontend Network Tab

**Chrome DevTools → Network:**
1. Filter by `Fetch/XHR`
2. Look for requests to `localhost:8000`
3. Check request headers (should have X-Tenant-ID, X-User-ID)
4. Check response status (200, 201 = success)

**Expected Requests:**
```
POST   /api/v1/panels/                    201 Created
POST   /api/v1/panels/{id}/execute        200 OK
GET    /api/v1/panels/?limit=10           200 OK
GET    /api/v1/analytics/usage            200 OK
```

### Supabase Dashboard

**Monitor Database Activity:**
1. Go to Supabase Dashboard → Database → Query Stats
2. Check for slow queries
3. Monitor connection pool usage
4. Check table activity (Logs)

**View Recent Inserts:**
```sql
-- Recent panels
SELECT * FROM panels ORDER BY created_at DESC LIMIT 10;

-- Recent responses
SELECT * FROM panel_responses ORDER BY created_at DESC LIMIT 20;

-- Recent usage
SELECT * FROM agent_usage ORDER BY created_at DESC LIMIT 20;
```

---

## 🔐 SECURITY NOTES

### Local Development is Safe
- ✅ Service role key is only used server-side (ai-engine)
- ✅ Frontend uses anon key + RLS for security
- ✅ Supabase RLS enforces tenant isolation
- ✅ JWT tokens verify user identity

### DO NOT Commit
- ❌ `.env.local` files (in .gitignore)
- ❌ Service role keys (never expose)
- ❌ API keys (LLM providers)
- ❌ Database passwords

### Production Deployment
For production, you'll need:
- 🚀 Deploy ai-engine to Modal.com or similar
- 🌐 Update `NEXT_PUBLIC_AI_ENGINE_URL` to production URL
- 🔒 Use environment variables, not `.env` files
- 📊 Enable proper logging and monitoring

---

## ✅ QUICK CHECKLIST

Before starting development, verify:

- [ ] Backend `.env.local` configured with Supabase credentials
- [ ] Frontend `.env.local` configured with `NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000`
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3002`
- [ ] Can access `/health` endpoint
- [ ] Can access `/ask-panel` page
- [ ] Logged in with valid user
- [ ] User has tenant assigned in Supabase

---

## 🎯 TYPICAL DEVELOPMENT WORKFLOW

```bash
# Terminal 1: Backend
cd services/ai-engine
source venv/bin/activate
uvicorn src.main:app --reload --port 8000

# Terminal 2: Frontend
cd apps/digital-health-startup
pnpm dev

# Terminal 3: Watch logs or run tests
cd services/ai-engine
pytest tests/ -v

# Browser
open http://localhost:3002/ask-panel
```

---

## 📚 ADDITIONAL RESOURCES

- **Backend API Docs:** http://localhost:8000/docs (FastAPI Swagger UI)
- **Backend Redoc:** http://localhost:8000/redoc (Alternative docs)
- **Supabase Dashboard:** https://app.supabase.com/project/{your-project}
- **Frontend Build:** http://localhost:3002

---

**Status:** ✅ Ready for Local Development  
**Configuration:** Local Backend + Remote Database  
**Next Step:** Start both servers and test panel creation!

