# Deployment Troubleshooting

## Current Issue

**Error:** `404 - Application not found`  
**Status:** Deployment URL exists but application not running

---

## Possible Causes

1. **Build Failed** - Docker build didn't complete successfully
2. **Root Directory Not Set** - Railway building from wrong directory
3. **Deployment Failed** - Service crashed on startup
4. **Still Deploying** - Deployment in progress

---

## Check Deployment Status

### 1. View Latest Logs

```bash
cd services/ai-engine
railway logs --tail 100
```

### 2. Check Railway Dashboard

**Dashboard URL:**
```
https://railway.app/project/1874a0cf-6c1c-4077-a5f1-92567064b3df/service/eca0aebf-eada-497d-9275-474c648c88fd
```

**Check:**
- Deployment status (Building/Running/Failed)
- Recent deployments
- Build logs
- Runtime logs

### 3. Verify Root Directory

**Go to:** Settings → Source

**Ensure:** Root Directory = `services/ai-engine`

If not set:
1. Set Root Directory = `services/ai-engine`
2. Click Save
3. Railway will auto-redeploy

---

## Common Fixes

### Fix 1: Set Root Directory

**Issue:** Railway building from repo root instead of `services/ai-engine`

**Fix:**
1. Railway Dashboard → Settings → Source
2. Set **Root Directory** = `services/ai-engine`
3. Save (auto-redeploys)

### Fix 2: Check Build Logs

**Check for:**
- `requirements.txt not found` → Root directory not set
- `Module not found` → Missing dependencies
- `Port already in use` → Port conflict
- `Permission denied` → File permissions issue

### Fix 3: Verify Environment Variables

**Required variables:**
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY
- ✅ PINECONE_API_KEY
- ✅ PINECONE_INDEX_NAME

**Check:**
```bash
railway variables
```

### Fix 4: Redeploy Manually

```bash
cd services/ai-engine
railway redeploy
```

Or in Railway Dashboard:
1. Go to Deployments
2. Click "Redeploy"
3. Watch build logs

---

## Expected Successful Deployment

### Build Logs Should Show:
```
✓ Building Docker image
✓ Installing dependencies
✓ Copying files
✓ Starting application
```

### Runtime Logs Should Show:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Health Endpoint Should Return:
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0"
}
```

---

## Next Steps

1. **Check Railway Dashboard** for deployment status
2. **Verify Root Directory** is set correctly
3. **View Build Logs** for error messages
4. **Check Environment Variables** are all set
5. **Redeploy** if needed

---

**Current Status:** `404 - Application not found`  
**Action Required:** Check Railway Dashboard for deployment status and errors

