# 🚀 Modal Quick Deploy Guide

## Prerequisites

✅ Python 3.12+  
✅ GitHub account (for Modal authentication)  
✅ Environment variables ready (Supabase, OpenAI, etc.)  

---

## Step-by-Step Deployment

### Step 1: Install Modal

```bash
pip install modal
```

### Step 2: Authenticate (Interactive - You Must Run This)

```bash
modal setup
```

**This will:**
1. Open your browser
2. Ask you to sign in with GitHub
3. Create a Modal account (if needed)
4. Configure local credentials

**⚠️ You must run this command yourself - it requires browser authentication!**

---

### Step 3: Create Secrets in Modal Dashboard

**Go to:** https://modal.com/secrets

**Create new secret:** `vital-ai-engine-secrets`

**Add these environment variables:**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-your-openai-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=vital-knowledge
LOG_LEVEL=info
```

**Optional (if using):**
```
HUGGINGFACE_API_KEY=your_hf_key
GOOGLE_API_KEY=your-google-key
ANTHROPIC_API_KEY=sk-ant-...
```

---

### Step 4: Deploy to Modal

```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

**First deployment:**
- Takes ~3-5 minutes (builds image)
- Downloads all dependencies
- Builds container

**Subsequent deployments:**
- Takes ~30-60 seconds (uses cached image)

---

### Step 5: Get Your URLs

After deployment, Modal will show:

```
✓ Created objects.
→ App initialized in X seconds
→ View app: https://modal.com/apps/vital-ai-engine
→ Health: https://your-username--vital-ai-engine-fastapi-app.modal.run/health
→ Main API: https://your-username--vital-ai-engine-fastapi-app.modal.run
```

**Save these URLs!**

---

### Step 6: Test Health Endpoint

```bash
curl https://your-username--vital-ai-engine-fastapi-app.modal.run/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "timestamp": 1234567890.123,
  "services": {
    "supabase": "healthy" | "unavailable",
    "agent_orchestrator": "healthy" | "unavailable",
    ...
  }
}
```

---

### Step 7: Update Frontend Configuration

**In `apps/digital-health-startup/.env.local`:**
```bash
AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
NEXT_PUBLIC_AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
```

**In `services/api-gateway/.env`:**
```bash
AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
```

---

## Deployment Commands Summary

```bash
# 1. Install Modal
pip install modal

# 2. Authenticate (YOU MUST RUN THIS - opens browser)
modal setup

# 3. Deploy
cd services/ai-engine
modal deploy modal_deploy.py

# 4. View logs
modal logs vital-ai-engine --follow

# 5. Check status
modal app list
modal app show vital-ai-engine
```

---

## Troubleshooting

### Issue: "modal: command not found"

**Fix:**
```bash
pip install modal
# Or if using venv:
source venv/bin/activate  # or your venv path
pip install modal
```

### Issue: "Authentication failed"

**Fix:**
```bash
modal setup
# Make sure browser opens and you sign in with GitHub
```

### Issue: "Secret not found"

**Fix:**
1. Go to: https://modal.com/secrets
2. Create secret: `vital-ai-engine-secrets`
3. Add all required environment variables
4. Redeploy: `modal deploy modal_deploy.py`

### Issue: "Import errors"

**Fix:**
The `modal_deploy.py` is already configured correctly. If you see import errors:
1. Check that `src/` directory exists
2. Verify `requirements.txt` is in the same directory as `modal_deploy.py`
3. Check Modal logs: `modal logs vital-ai-engine`

### Issue: "Health check fails"

**Fix:**
1. Check logs: `modal logs vital-ai-engine`
2. Verify secrets are set correctly
3. Check if services are initializing (might take 10-30 seconds)

---

## Useful Commands

```bash
# View logs in real-time
modal logs vital-ai-engine --follow

# View recent logs
modal logs vital-ai-engine --tail 100

# List all apps
modal app list

# Show app details
modal app show vital-ai-engine

# Delete app (if needed)
modal app delete vital-ai-engine

# View dashboard
# Go to: https://modal.com/apps/vital-ai-engine
```

---

## Expected Behavior

### First Deployment
1. ✅ Modal builds container image (~3-5 minutes)
2. ✅ Installs all dependencies from `requirements.txt`
3. ✅ Copies `src/` directory
4. ✅ Deploys FastAPI app
5. ✅ Provides URLs

### Health Check
1. ✅ `/health` endpoint responds immediately
2. ✅ Services initialize in background
3. ✅ App remains responsive even during initialization

### Subsequent Deployments
1. ✅ Uses cached image (~30-60 seconds)
2. ✅ Only rebuilds if code changed
3. ✅ No downtime during deployment

---

## Next Steps After Deployment

1. ✅ Test health endpoint
2. ✅ Test a real API endpoint (e.g., `/api/agents/select`)
3. ✅ Update frontend `.env.local` files
4. ✅ Test frontend → API Gateway → Modal flow
5. ✅ Monitor usage in Modal dashboard

---

**Ready? Run these commands:**

```bash
# 1. Install Modal
pip install modal

# 2. Authenticate (opens browser - YOU must run this)
modal setup

# 3. Create secrets at: https://modal.com/secrets

# 4. Deploy
cd services/ai-engine
modal deploy modal_deploy.py
```

