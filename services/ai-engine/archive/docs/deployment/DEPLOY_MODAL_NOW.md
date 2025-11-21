# 🚀 Deploy to Modal Now - Step by Step

## Current Status

✅ **Modal installed:** `/Library/Frameworks/Python.framework/Versions/3.13/bin/modal`  
❌ **Not authenticated:** Need to run `modal setup`  

---

## Deployment Steps

### Step 1: Authenticate with Modal (Required - Interactive)

**You must run this command - it will open a browser:**

```bash
modal setup
```

**OR if you prefer token-based authentication:**

```bash
modal token new
```

**This will:**
1. Open your browser
2. Ask you to sign in with GitHub
3. Create Modal account (if first time)
4. Configure local credentials automatically

**⚠️ I cannot run this for you - it requires browser interaction!**

---

### Step 2: Verify Authentication

After authentication, verify it works:

```bash
modal app list
```

**Expected output:** Empty list (no apps yet) or list of existing apps

---

### Step 3: Create Secrets in Modal Dashboard

**Go to:** https://modal.com/secrets

**Click "Create Secret"**

**Name:** `vital-ai-engine-secrets`

**Add these environment variables:**

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-your-key
PINECONE_API_KEY=your-key
PINECONE_INDEX_NAME=vital-knowledge
LOG_LEVEL=info
```

**Click "Create"**

---

### Step 4: Deploy to Modal

Once authenticated and secrets are created:

```bash
cd services/ai-engine
modal deploy modal_deploy.py
```

**Expected output:**
```
Building image...
✓ Created objects.
→ App initialized in X seconds
→ View app: https://modal.com/apps/vital-ai-engine
→ Health: https://your-username--vital-ai-engine-fastapi-app.modal.run/health
→ Main API: https://your-username--vital-ai-engine-fastapi-app.modal.run
```

**First deployment:** Takes ~3-5 minutes  
**Subsequent deployments:** Takes ~30-60 seconds

---

### Step 5: Test Deployment

```bash
# Test health endpoint
curl https://your-username--vital-ai-engine-fastapi-app.modal.run/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "services": {...}
}
```

---

### Step 6: View Logs (if needed)

```bash
modal logs vital-ai-engine --follow
```

---

## Complete Command Sequence

Run these commands in order:

```bash
# 1. Authenticate (opens browser - YOU must run this)
modal setup

# 2. Verify authentication
modal app list

# 3. Create secrets at: https://modal.com/secrets
#    Name: vital-ai-engine-secrets
#    Add all environment variables

# 4. Deploy
cd services/ai-engine
modal deploy modal_deploy.py

# 5. Test
curl https://your-username--vital-ai-engine-fastapi-app.modal.run/health
```

---

## What Happens During Deployment

1. ✅ Modal reads `modal_deploy.py`
2. ✅ Builds Docker container with Python 3.12
3. ✅ Installs all dependencies from `requirements.txt`
4. ✅ Copies `src/` directory to `/app/src`
5. ✅ Copies `start.py` to `/app/start.py`
6. ✅ Loads secrets from Modal dashboard
7. ✅ Deploys FastAPI app as ASGI application
8. ✅ Provides public URLs

---

## Troubleshooting

### Issue: "Token missing" or "Not authenticated"

**Fix:**
```bash
modal setup
# Follow browser prompts to sign in with GitHub
```

### Issue: "Secret not found: vital-ai-engine-secrets"

**Fix:**
1. Go to: https://modal.com/secrets
2. Create secret: `vital-ai-engine-secrets`
3. Add all required environment variables
4. Redeploy: `modal deploy modal_deploy.py`

### Issue: "Import errors" during deployment

**Fix:**
The config is already correct. If you see import errors:
1. Verify `src/main.py` exists
2. Verify `requirements.txt` exists in same directory as `modal_deploy.py`
3. Check Modal logs: `modal logs vital-ai-engine`

### Issue: "Module not found: main"

**Fix:**
The `modal_deploy.py` is already configured to:
- Set working directory to `/app/src`
- Import `from main import app`

This should work. If not, check Modal logs.

---

## After Deployment

### 1. Update Frontend Configuration

**In `apps/digital-health-startup/.env.local`:**
```bash
AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
NEXT_PUBLIC_AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
```

**In `services/api-gateway/.env`:**
```bash
AI_ENGINE_URL=https://your-username--vital-ai-engine-fastapi-app.modal.run
```

### 2. Test Full Stack

1. ✅ Test health endpoint
2. ✅ Test API Gateway → Modal communication
3. ✅ Test frontend → API Gateway → Modal flow

### 3. Monitor

**Dashboard:** https://modal.com/apps/vital-ai-engine

**View:**
- Request metrics
- Error rates
- Response times
- Resource usage
- Logs

---

## Advantages of Modal Over Railway

| Feature | Railway | Modal |
|--------|---------|-------|
| **Cost when idle** | ~$5-20/month | $0 (scales to zero) |
| **Cold start** | 30-60s | 2-5s |
| **Scaling** | Manual | Automatic |
| **Free tier** | Limited | $30/month credit |
| **Health check** | Failing currently | Should work immediately |

---

## Next Actions

**You need to run these commands manually:**

1. **Authenticate:** `modal setup` (opens browser)
2. **Create secrets:** https://modal.com/secrets
3. **Deploy:** `modal deploy modal_deploy.py`

**Once you've authenticated, let me know and I can help verify the deployment!**

