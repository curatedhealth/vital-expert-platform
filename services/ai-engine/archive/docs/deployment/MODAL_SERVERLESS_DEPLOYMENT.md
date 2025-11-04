# 🚀 Modal Serverless Deployment Guide

## What is Modal?

**Modal** is a **serverless container platform** specifically designed for Python workloads. It provides:

✅ **True Serverless:** Scales to zero when idle, pays only for usage  
✅ **Fast Cold Starts:** Optimized for Python containers  
✅ **Automatic Scaling:** Handles traffic spikes automatically  
✅ **Simple Deployment:** No Docker configuration needed  
✅ **Built-in Secrets:** Secure environment variable management  
✅ **Global CDN:** Fast response times worldwide  

---

## Quick Start

### Step 1: Install Modal

```bash
pip install modal
```

### Step 2: Authenticate

```bash
modal setup
```

This will:
1. Open browser for authentication
2. Create Modal account (if needed)
3. Configure local credentials

### Step 3: Create Secrets

**Option A: Via Modal Dashboard (Recommended)**

1. Go to: https://modal.com/secrets
2. Click "Create Secret"
3. Name: `vital-ai-engine-secrets`
4. Add these environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=vital-knowledge
LOG_LEVEL=info
```

**Option B: Via CLI**

```bash
modal secret create vital-ai-engine-secrets \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_ANON_KEY=your_anon_key \
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  DATABASE_URL=postgresql://... \
  OPENAI_API_KEY=sk-... \
  PINECONE_API_KEY=your-pinecone-key \
  PINECONE_INDEX_NAME=vital-knowledge
```

### Step 4: Update Modal Configuration

The `modal_deploy.py` is already configured. Just verify it looks correct:

- ✅ Python 3.12
- ✅ All dependencies installed
- ✅ FastAPI app mounted
- ✅ Health check configured

### Step 5: Deploy

```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

**Expected Output:**
```
✓ Created objects.
→ Initializing... 
✓ App initialized in X seconds
→ View app: https://modal.com/apps/vital-ai-engine
→ Health: https://your-username--vital-ai-engine-fastapi-app.modal.run/health
→ Main API: https://your-username--vital-ai-engine-fastapi-app.modal.run
```

---

## Deployment Features

### Resource Configuration

**Current Settings:**
- **CPU:** 2.0 cores
- **Memory:** 4GB RAM
- **Concurrent Requests:** 10
- **Container Idle Timeout:** 5 minutes (scales to zero after 5 min idle)
- **Request Timeout:** 5 minutes

### Auto-Scaling

Modal automatically:
- ✅ Scales up when traffic increases
- ✅ Scales down to zero when idle
- ✅ Handles traffic spikes
- ✅ Distributes load across regions

### Cost Model

**Pay only for:**
- Compute time (per second)
- Memory allocated
- Requests handled

**Free tier includes:**
- $30/month credit
- Perfect for development/testing

---

## Advantages Over Railway

### 1. **Serverless (Scale to Zero)**
- **Railway:** Always running (costs even when idle)
- **Modal:** Scales to zero (pays only when serving requests)

### 2. **Faster Cold Starts**
- **Railway:** ~30-60 seconds to start
- **Modal:** ~2-5 seconds cold start (optimized for Python)

### 3. **Automatic Scaling**
- **Railway:** Manual scaling configuration
- **Modal:** Auto-scales based on traffic

### 4. **Global Distribution**
- **Railway:** Single region deployment
- **Modal:** Global CDN, automatic edge deployment

### 5. **Built-in Secrets Management**
- **Railway:** Manual environment variable setup
- **Modal:** Secure secrets management via dashboard/CLI

---

## Deployment Process

### 1. **First Deployment**

```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

**First time:** Takes ~3-5 minutes (builds image)  
**Subsequent:** Takes ~30-60 seconds (uses cached image)

### 2. **View Logs**

```bash
modal logs vital-ai-engine
```

Or via dashboard: https://modal.com/apps/vital-ai-engine

### 3. **Update Deployment**

```bash
# Just redeploy - Modal detects changes automatically
modal deploy modal_deploy.py
```

### 4. **Check Status**

```bash
modal app list
modal app show vital-ai-engine
```

---

## URL Structure

After deployment, Modal provides:

**Health Check:**
```
https://your-username--vital-ai-engine-fastapi-app.modal.run/health
```

**Main API:**
```
https://your-username--vital-ai-engine-fastapi-app.modal.run
```

**All FastAPI Routes:**
- `/health` → Health check
- `/metrics` → Prometheus metrics
- `/api/*` → All API endpoints
- `/docs` → Swagger documentation

---

## Configuration

### Update Frontend

**In `apps/digital-health-startup/.env.local`:**
```bash
AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
NEXT_PUBLIC_AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
```

**In `services/api-gateway/.env`:**
```bash
AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
```

### Custom Domain (Optional)

To use a custom domain:

1. **Update `modal_deploy.py`:**
```python
@modal.asgi_app(
    label="vital-ai-engine",
    custom_domains=["api.vital.expert"]  # Add your domain
)
```

2. **Configure DNS:**
   - Add CNAME record pointing to Modal's domain
   - Modal will handle SSL certificates automatically

---

## Monitoring

### Dashboard

**View:**
- Request metrics
- Error rates
- Response times
- Resource usage
- Logs

**URL:** https://modal.com/apps/vital-ai-engine

### Logs

```bash
# Real-time logs
modal logs vital-ai-engine --follow

# Filter logs
modal logs vital-ai-engine --filter "error"
```

---

## Cost Comparison

### Railway
- **Always-on:** ~$5-20/month minimum
- **Scaling:** Manual configuration
- **Overage:** Pay per usage

### Modal
- **Pay-per-use:** $0 when idle
- **Scaling:** Automatic
- **Free tier:** $30/month credit
- **Typical cost:** $0.10-0.50 per 1000 requests

**For development/testing:** Modal is likely **free** (within $30/month credit)

---

## Troubleshooting

### Issue: Import Errors

**Fix:** Ensure paths are correct in `modal_deploy.py`:
```python
sys.path.insert(0, "/app/src")
os.chdir("/app/src")
from main import app
```

### Issue: Secrets Not Found

**Fix:** Verify secret name matches:
```python
modal.Secret.from_name("vital-ai-engine-secrets")
```

Create it in dashboard: https://modal.com/secrets

### Issue: Cold Start Too Slow

**Fix:** Increase `container_idle_timeout`:
```python
container_idle_timeout=600,  # 10 minutes
```

### Issue: Timeout Errors

**Fix:** Increase `timeout`:
```python
timeout=600,  # 10 minutes max
```

---

## Migration from Railway

### Step 1: Deploy to Modal

```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

### Step 2: Test Health Endpoint

```bash
curl https://your-username--vital-ai-engine-fastapi-app.modal.run/health
```

### Step 3: Update Frontend URLs

Update `.env.local` and `.env` files with Modal URL

### Step 4: Verify API Gateway

Test API Gateway → Modal communication

### Step 5: Keep Railway as Backup

You can run both simultaneously for redundancy!

---

## Next Steps

1. ✅ Deploy to Modal
2. ✅ Test health endpoint
3. ✅ Update frontend URLs
4. ✅ Verify API Gateway integration
5. ✅ Monitor usage and costs

---

## Resources

- **Modal Docs:** https://modal.com/docs
- **Modal Dashboard:** https://modal.com/dashboard
- **Modal Secrets:** https://modal.com/secrets
- **Modal Pricing:** https://modal.com/pricing

---

**Ready to deploy? Run:**
```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

