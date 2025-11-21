# Quick Deploy Python AI Engine - Today's Guide

**Goal:** Deploy Python AI Engine to Railway/Modal so you can develop locally  
**Estimated Time:** 15-30 minutes  
**Difficulty:** Easy ⭐⭐

---

## Option 1: Railway (Recommended - Fastest) 🚀

Railway is the easiest option for quick deployment.

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### Step 3: Initialize Project

```bash
cd services/ai-engine
railway init
```

**Questions Railway will ask:**
- **Project Name:** `vital-ai-engine` (or your choice)
- **Environment:** `Production`
- **Detected Dockerfile:** Yes (use it)

### Step 4: Set Environment Variables

```bash
# Set required variables one by one
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_ANON_KEY=your_anon_key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
railway variables set OPENAI_API_KEY=your_openai_key
railway variables set PINECONE_API_KEY=your_pinecone_key
railway variables set PINECONE_INDEX_NAME=vital-knowledge

# Optional variables
railway variables set PORT=8000
railway variables set LOG_LEVEL=info
railway variables set EMBEDDING_PROVIDER=openai
```

**Or set all at once via Railway Dashboard:**
1. Go to: https://railway.app/dashboard
2. Select your project
3. Go to **Variables** tab
4. Add all variables (see list below)

### Step 5: Deploy

```bash
railway up
```

This will:
1. Build the Docker image
2. Deploy to Railway
3. Provide you with a URL (e.g., `https://vital-ai-engine-production.up.railway.app`)

### Step 6: Test Deployment

```bash
# Get your deployment URL
railway domain

# Test health endpoint
curl https://your-project.up.railway.app/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0"
}
```

### Step 7: Get Your Deployment URL

```bash
railway domain
```

**Save this URL!** You'll use it as `AI_ENGINE_URL` in your local development.

---

## Option 2: Modal (Serverless - Alternative)

If Railway doesn't work or you prefer serverless.

### Step 1: Install Modal

```bash
pip install modal
modal setup
```

### Step 2: Create Secrets in Modal Dashboard

1. Go to: https://modal.com/secrets
2. Create new secret: `vital-ai-engine-secrets`
3. Add these keys:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME`

### Step 3: Deploy

```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

### Step 4: Get Your URL

Modal will provide you with a URL like: `https://your-username--vital-ai-engine.modal.run`

---

## Environment Variables Required

### Required Variables

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Pinecone
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=vital-knowledge
```

### Optional Variables

```bash
# Server
PORT=8000
LOG_LEVEL=info

# Embedding Provider
EMBEDDING_PROVIDER=openai  # or 'huggingface'
HUGGINGFACE_API_KEY=your_hf_key  # if using HuggingFace

# Vector Configuration
VECTOR_DIMENSION=1536
SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=10

# Redis (optional)
REDIS_URL=redis://your-redis-url

# Database (optional - usually auto-configured from Supabase)
DATABASE_URL=postgresql://...
```

---

## After Deployment

### 1. Update Local Development Config

**Update `.env.local` in your frontend:**
```bash
# In apps/digital-health-startup/.env.local
AI_ENGINE_URL=https://your-railway-or-modal-url
NEXT_PUBLIC_AI_ENGINE_URL=https://your-railway-or-modal-url
```

**Update `services/api-gateway/.env`:**
```bash
# In services/api-gateway/.env
AI_ENGINE_URL=https://your-railway-or-modal-url
```

### 2. Test Local Development

```bash
# Start your local frontend/API Gateway
cd apps/digital-health-startup
npm run dev

# Test that it connects to deployed AI Engine
curl http://localhost:3000/api/health
```

### 3. Verify Deployment

```bash
# Test health endpoint
curl https://your-deployed-url/health

# Test metrics endpoint
curl https://your-deployed-url/metrics

# Test a simple API call
curl -X POST https://your-deployed-url/api/mode1/manual \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "agent_id": "test-agent",
    "message": "Hello"
  }'
```

---

## Troubleshooting

### Deployment Fails

**Issue:** Build timeout  
**Solution:** Check Railway/Modal logs, ensure `Dockerfile` is correct

**Issue:** Missing environment variables  
**Solution:** Verify all required variables are set in Railway/Modal dashboard

**Issue:** Health check failing  
**Solution:** Check logs, verify service is starting correctly

### Can't Connect from Local

**Issue:** CORS errors  
**Solution:** Ensure your local URL is in CORS origins in Python AI Engine

**Issue:** Connection refused  
**Solution:** Verify `AI_ENGINE_URL` is correct in local `.env` files

### Service Not Starting

**Issue:** Port conflict  
**Solution:** Ensure `PORT` environment variable is set correctly (default: 8000)

**Issue:** Database connection failed  
**Solution:** Verify Supabase credentials are correct

---

## Quick Reference

### Railway Commands
```bash
railway login          # Login to Railway
railway init           # Initialize project
railway up             # Deploy
railway logs           # View logs
railway variables      # List environment variables
railway domain         # Get deployment URL
```

### Modal Commands
```bash
modal setup            # Initial setup
modal deploy           # Deploy
modal logs             # View logs
modal app list         # List apps
```

---

## Next Steps

1. ✅ Deploy Python AI Engine (this guide)
2. ✅ Get deployment URL
3. ✅ Update local `.env` files with `AI_ENGINE_URL`
4. ✅ Test local development connects to deployed service
5. ✅ Continue developing locally! 🎉

---

**Need Help?** Check:
- `services/ai-engine/DEPLOYMENT.md` - Full deployment guide
- Railway docs: https://docs.railway.app
- Modal docs: https://modal.com/docs

