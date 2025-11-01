# Railway Deployment Guide - Phase 2 & 3

## 🚂 Deploy VITAL AI Engine to Railway with Docker

**Target:** Phase 2 (Memory) + Phase 3 (Self-Continuation)  
**Method:** Docker Build  
**Platform:** Railway.app  
**Time:** 15 minutes

---

## 📋 PREREQUISITES

- [ ] Railway account (https://railway.app)
- [ ] GitHub repository access
- [ ] Supabase project with migrations applied
- [ ] OpenAI API key
- [ ] Redis instance (optional, can use Railway's)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Prepare Database

**1.1 Run Migrations in Supabase**

```sql
-- In Supabase SQL Editor, run:
-- database/sql/migrations/2025/20251101120000_session_memories.sql

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('session_memories', 'autonomous_control_state');
```

**Expected:** 2 rows returned

---

### Step 2: Create Railway Project

**2.1 Via Railway Dashboard**

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize GitHub access
5. Select repository: `curatedhealth/vital-expert-platform`
6. Select branch: `restructure/world-class-architecture`

**2.2 Via Railway CLI (Alternative)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd services/ai-engine
railway init

# Link to GitHub
railway link
```

---

### Step 3: Configure Service

**3.1 Set Root Directory**

In Railway Dashboard:
- Go to your service
- Settings → Root Directory
- Set to: `services/ai-engine`

**3.2 Set Build Configuration**

Railway should auto-detect the Dockerfile. Verify:
- Settings → Build
- Builder: Docker
- Dockerfile Path: `Dockerfile` (relative to root directory)

---

### Step 4: Environment Variables

**4.1 Required Variables**

In Railway Dashboard → Variables, add:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Server (Railway auto-provides PORT)
# Don't set PORT - Railway provides it automatically
LOG_LEVEL=info
WORKERS=0

# Python
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# Phase 2 & 3 Configuration
MEMORY_CACHE_TTL=86400
EMBEDDING_MODEL=all-mpnet-base-v2
AUTONOMOUS_COST_LIMIT=10.0
AUTONOMOUS_RUNTIME_LIMIT=30

# Optional: Redis (if you have Railway Redis)
REDIS_URL=${{Redis.REDIS_URL}}
```

**4.2 Optional: Add Railway Redis**

1. In your project, click "+ New"
2. Select "Database" → "Redis"
3. Railway will auto-create `REDIS_URL` variable
4. Reference it in your service: `${{Redis.REDIS_URL}}`

---

### Step 5: Deploy

**5.1 Trigger Deployment**

Railway will automatically deploy when you:
- Push to the linked branch
- Or click "Deploy" in the dashboard

**5.2 Monitor Build**

Watch the build logs:
```
Building Docker image...
[+] Building 245.3s (17/17) FINISHED
```

Expected output:
```
✅ sentence-transformers installed
✅ faiss-cpu installed
✅ All dependencies installed
✅ Application code copied
✅ Image built successfully
```

**5.3 Monitor Deployment**

Watch deployment logs for:
```
🚀 VITAL AI Engine Startup Script
📂 Script directory: /app
📦 Importing uvicorn...
✅ Uvicorn imported successfully
📦 Attempting to import main module...
✅ Main module imported successfully
🌐 Starting server on 0.0.0.0:XXXX
```

---

### Step 6: Verify Deployment

**6.1 Check Health Endpoint**

Railway provides a public URL (e.g., `https://your-service.up.railway.app`)

```bash
# Check health
curl https://your-service.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "VITAL AI Engine",
  "version": "2.0.0",
  "timestamp": "2025-11-01T..."
}
```

**6.2 Test Memory Endpoint**

```bash
# Test that sentence-transformers is loaded
curl -X POST https://your-service.up.railway.app/api/mode1/manual \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test-agent",
    "message": "Hello, test memory",
    "enable_rag": true,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**6.3 Test Autonomous Stop API**

```bash
# Test new Phase 3 endpoint
curl https://your-service.up.railway.app/api/autonomous/status/test_session

# Expected: 404 (session not found) or 200 with status
```

---

## ⚙️ RAILWAY-SPECIFIC CONFIGURATION

### Dockerfile Optimizations for Railway

Your existing `Dockerfile` is already optimized:

✅ **Multi-stage build** - Smaller final image
✅ **Health check** - `HEALTHCHECK` directive
✅ **Non-root user** - Security best practice
✅ **PORT from env** - `start.py` reads `$PORT`
✅ **Proper logging** - Unbuffered output

### Railway.json Configuration

Your `railway.json`:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "startCommand": "python3 start.py"
  }
}
```

### Health Check Configuration

Railway expects:
- **Path:** `/health`
- **Timeout:** 100s (allows time for dependencies to load)
- **Start Period:** 40s (from Dockerfile)
- **Interval:** 30s

---

## 🐛 TROUBLESHOOTING

### Issue 1: Build Fails - "sentence-transformers not found"

**Solution:**
- Verify `sentence-transformers==2.2.2` is in `requirements.txt` ✅ (already there)
- Check build logs for dependency installation errors

### Issue 2: Health Check Fails

**Symptoms:**
```
Health check failed: Connection refused
```

**Solution:**
1. Check logs for startup errors:
   ```bash
   railway logs
   ```

2. Verify `start.py` is running:
   ```
   🚀 VITAL AI Engine Startup Script
   ✅ Main module imported successfully
   🌐 Starting server on 0.0.0.0:XXXX
   ```

3. Check if port is bound:
   ```
   INFO: Uvicorn running on http://0.0.0.0:XXXX
   ```

### Issue 3: "Module 'sentence_transformers' not found"

**Solution:**
1. Verify build completed successfully
2. Check if all dependencies installed:
   ```bash
   railway run pip list | grep sentence-transformers
   ```

3. Rebuild from scratch:
   - Railway Dashboard → Settings → "Redeploy"

### Issue 4: Database Connection Fails

**Symptoms:**
```
❌ Database check failed: Connection refused
```

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_KEY` are set
2. Check Supabase is accessible from Railway:
   ```bash
   railway run curl https://your-project.supabase.co/rest/v1/
   ```

3. Verify migrations were run (Step 1)

### Issue 5: Out of Memory

**Symptoms:**
```
Killed: Out of memory
```

**Solution:**
- sentence-transformers models are ~400MB
- Upgrade Railway plan if needed
- Or use lighter model:
  ```bash
  EMBEDDING_MODEL=all-MiniLM-L6-v2  # ~80MB instead of ~400MB
  ```

---

## 📊 MONITORING

### Railway Metrics

View in Dashboard → Metrics:
- **CPU Usage:** Should be < 50% idle
- **Memory:** ~1-1.5GB with sentence-transformers
- **Network:** Monitor request volume

### Application Logs

```bash
# Via CLI
railway logs --follow

# Look for:
✅ EmbeddingService initialized
✅ SessionMemoryService initialized
✅ AutonomousController ready
```

### Database Queries

Monitor in Supabase:

```sql
-- Memory usage
SELECT COUNT(*) as total_memories,
       AVG(importance) as avg_importance
FROM session_memories;

-- Active autonomous sessions
SELECT COUNT(*) as active_sessions
FROM autonomous_control_state
WHERE expires_at > NOW();
```

---

## 💰 COST ESTIMATION

### Railway Costs

**Starter Plan ($5/month):**
- 512 MB RAM
- 1 vCPU
- $5 credit included
- **May be tight** for sentence-transformers

**Developer Plan ($20/month):**
- 8 GB RAM
- 8 vCPU shared
- $10 credit included
- **Recommended** for production

**Pro Plan ($50/month):**
- 32 GB RAM
- 32 vCPU shared
- $50 credit included
- Best for high traffic

### Resource Usage

Expected with Phase 2 & 3:
- **Memory:** 1-1.5 GB (sentence-transformers models)
- **CPU:** <20% average, spikes during embedding generation
- **Storage:** ~500 MB (models + code)

---

## ✅ DEPLOYMENT CHECKLIST

Pre-Deployment:
- [ ] Supabase migrations applied
- [ ] `requirements.txt` includes sentence-transformers
- [ ] `railway.json` configured
- [ ] GitHub branch up to date

Railway Configuration:
- [ ] Root directory set to `services/ai-engine`
- [ ] Environment variables configured
- [ ] Redis added (optional)
- [ ] Health check path set to `/health`

Post-Deployment:
- [ ] Health endpoint responds (200 OK)
- [ ] Application logs show successful startup
- [ ] Database connection verified
- [ ] Memory endpoints tested
- [ ] Autonomous stop API tested

---

## 🎯 SUCCESS CRITERIA

✅ **Build Successful**
- Docker image builds without errors
- All dependencies installed
- sentence-transformers downloaded (~400MB)

✅ **Deployment Successful**
- Health check passes
- Server starts on Railway's PORT
- Logs show "✅ Main module imported successfully"

✅ **Phase 2 Working**
- EmbeddingService initialized
- 768-dimensional embeddings generated
- session_memories table accessible

✅ **Phase 3 Working**
- AutonomousController initialized
- `/api/autonomous/stop` responds
- `/api/autonomous/status` responds

---

## 🚀 QUICK DEPLOY COMMANDS

```bash
# 1. Ensure latest code is pushed
git add -A
git commit -m "feat: Railway deployment ready with Phase 2 & 3"
git push origin restructure/world-class-architecture

# 2. Create Railway project (one-time)
railway init
railway link

# 3. Deploy
railway up

# 4. Set environment variables
railway variables set SUPABASE_URL=your-url
railway variables set SUPABASE_KEY=your-key
railway variables set OPENAI_API_KEY=your-key

# 5. View logs
railway logs --follow

# 6. Get public URL
railway domain
```

---

## 📞 SUPPORT

**Railway Issues:**
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app

**Application Issues:**
- Check logs: `railway logs`
- Check health: `curl https://your-app.up.railway.app/health`
- Review: `DEPLOYMENT_GUIDE_PHASE2_3.md`

---

## 🎉 DEPLOYMENT COMPLETE

Once deployed, you'll have:

✅ **Phase 2 Memory** running in production
✅ **Phase 3 Self-Continuation** enabled
✅ **Auto-scaling** via Railway
✅ **Monitoring** via Railway dashboard
✅ **Public HTTPS** endpoint
✅ **Zero-downtime** deployments

**Your AutoGPT is now live! 🚀**

---

**Estimated Deployment Time:** 15 minutes  
**Difficulty:** Medium  
**Cost:** $20-50/month (Railway Developer/Pro)

