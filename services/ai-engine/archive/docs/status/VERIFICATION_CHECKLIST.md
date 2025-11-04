# ✅ Railway Deployment Verification Checklist

## Expected Startup Logs

When the service starts successfully, you should see these logs:

```
🚀 Starting VITAL AI Engine on port XXXX
✅ Uvicorn imported successfully
✅ Main module imported successfully
🚀 Launching uvicorn server...
✅ FastAPI app ready - services initializing in background
✅ Health endpoint available at /health
```

---

## 🔍 Verification Steps

### Step 1: Check Railway Service Status

```bash
cd services/ai-engine
railway status
```

**Expected Output:**
- Should show project name and service name
- If it shows "the linked service doesn't exist", you need to link the service

### Step 2: Link Service (If Needed)

```bash
railway service
```

**Follow the prompts:**
1. Select project: `vital-ai-engine-v2`
2. Select or create service: `vital-ai-engine`
3. Confirm linking

### Step 3: View Deployment Logs

```bash
railway logs --tail 100
```

**Look for:**
- ✅ Docker build logs
- ✅ Application startup logs (the ones you mentioned)
- ❌ Any error messages

### Step 4: Get Deployment URL

```bash
railway domain
```

**Save the URL!** Example: `https://vital-ai-engine-production.up.railway.app`

### Step 5: Test Health Endpoint

```bash
# Replace with your actual URL from railway domain
curl https://your-url.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "timestamp": 1234567890.123,
  "services": {
    "supabase": "unavailable",
    "agent_orchestrator": "unavailable",
    "rag_pipeline": "unavailable",
    "unified_rag_service": "unavailable"
  },
  "ready": true
}
```

### Step 6: Test Root Endpoint

```bash
curl https://your-url.up.railway.app/
```

**Expected Response:**
```json
{
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "status": "running",
  "health": "/health",
  "docs": "/docs"
}
```

---

## 🚨 Troubleshooting

### Issue: "No deployments found"

**Possible Causes:**
1. Service not linked to Railway
2. No deployments triggered yet
3. Wrong project/service selected

**Fix:**
```bash
railway service  # Link or create service
railway up       # Trigger deployment
```

### Issue: "Service not linked"

**Fix:**
```bash
railway service
# Follow interactive prompts to link/create
```

### Issue: Health check fails

**Check:**
1. Railway logs for startup errors
2. Port configuration (should be from PORT env var)
3. Health endpoint responds: `curl http://localhost:8000/health` (if testing locally)

### Issue: Service starts but health check fails

**Possible Causes:**
1. Port not binding correctly
2. Health endpoint path mismatch
3. Service crashing after startup

**Fix:**
- Check Railway logs for errors after startup
- Verify PORT env var is set correctly
- Check if there are any import errors

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Railway logs show the startup messages you mentioned
2. ✅ `/health` endpoint returns `{"status": "healthy", "ready": true}`
3. ✅ `/` endpoint returns service info
4. ✅ Railway dashboard shows service as "Active"
5. ✅ No errors in Railway logs

---

## 📋 Next Steps After Successful Deployment

1. **Update Local Development Config**
   
   **`apps/digital-health-startup/.env.local`:**
   ```bash
   AI_ENGINE_URL=https://your-railway-url.up.railway.app
   NEXT_PUBLIC_AI_ENGINE_URL=https://your-railway-url.up.railway.app
   ```

   **`services/api-gateway/.env`:**
   ```bash
   AI_ENGINE_URL=https://your-railway-url.up.railway.app
   ```

2. **Test Integration**
   - Test API Gateway → AI Engine communication
   - Test Frontend → API Gateway → AI Engine flow
   - Verify all endpoints work

3. **Monitor Performance**
   - Check Railway dashboard metrics
   - Monitor logs for errors
   - Verify health checks pass consistently

---

**Status:** Ready to verify! Follow the steps above to confirm deployment. 🚀

