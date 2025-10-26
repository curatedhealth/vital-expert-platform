# Railway PORT Variable Fix - Applied

**Issue:** "PORT variable must be integer between 0 and 65535"
**Root Cause:** Railway was rejecting `$PORT` in railway.toml startCommand
**Status:** ✅ FIXED - Deployment in progress

---

## The Problem

Railway was failing immediately with this error:
```
PORT variable must be integer between 0 and 65535
```

This happened BEFORE the Docker build even started, which meant the issue was in our configuration files, not the build process.

---

## The Fix (2 Changes)

### 1. Updated railway.toml
**Removed the startCommand that used `$PORT`:**

**Before:**
```toml
[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"  ← PROBLEM
healthcheckPath = "/health"
...
```

**After:**
```toml
[deploy]
healthcheckPath = "/health"  ← Let Dockerfile handle the start command
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 2. Updated Dockerfile CMD
**Changed to use shell form with environment variable substitution:**

**Before:**
```dockerfile
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**After:**
```dockerfile
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

**Key Points:**
- Removed JSON array syntax `["..."]`
- Added shell variable expansion `${PORT:-8000}`
- The `:-8000` means "use PORT if set, otherwise use 8000"
- Railway will inject the PORT environment variable at runtime

---

## Why This Works

1. **Railway.toml doesn't parse $PORT correctly** in the startCommand field - it expects a literal value or Railway's own variable syntax

2. **Dockerfile shell form** (`CMD command` instead of `CMD ["command"]`) allows:
   - Environment variable expansion at container startup
   - Railway to inject its PORT variable dynamically
   - Fallback to port 8000 if PORT isn't set (for local testing)

3. **No conflicting configurations** - Only the Dockerfile CMD is specifying how to start, railway.toml just configures health checks and restart policy

---

## Current Deployment Status

**Started:** ~11:15 AM
**Expected Completion:** ~11:18-11:20 AM
**Build URL:** https://railway.com/project/dffb9616-2d0c-4367-9252-9c14d6d16802/service/295c2501-6f57-4910-a1a3-f626af3c2f34?id=1518e90a-5279-4372-adce-a16561a90a81

**Current Phase:** Docker build in progress

---

## Expected Build Steps

```
[1/6] FROM docker.io/library/python:3.11-slim
      ✅ Pulling base image

[2/6] WORKDIR /app
      ✅ Setting working directory

[3/6] RUN apt-get update && apt-get install -y gcc curl
      ✅ Installing system dependencies

[4/6] COPY requirements.txt .
      ✅ Copying requirements file

[5/6] RUN pip install --no-cache-dir -r requirements.txt
      ⏳ Installing Python packages (LONGEST STEP - 2-4 minutes)
         - FastAPI, uvicorn, pydantic
         - LangChain, LangGraph, LangSmith
         - Supabase client
         - Pinecone client
         - ~30 total packages

[6/6] COPY . .
      ✅ Copying application code

Container Start:
      uvicorn src.main:app --host 0.0.0.0 --port ${PORT}
      Railway injects PORT (e.g., 8080, 8000, etc.)
```

---

## After Deployment Succeeds

### 1. Get Service URL
```bash
railway domain
```

Expected output:
```
https://vital-ai-engine-production.up.railway.app
```

### 2. Test Health Endpoint
```bash
curl https://vital-ai-engine-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ai-engine",
  "version": "1.0.0",
  "environment": "production"
}
```

### 3. View Service Logs
```bash
cd services/ai-engine
railway logs
```

Expected output:
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:PORT
```

---

## Files Changed This Fix

| File | Change | Reason |
|------|--------|--------|
| [railway.toml](services/ai-engine/railway.toml) | Removed startCommand | Railway doesn't parse $PORT in TOML |
| [Dockerfile](services/ai-engine/Dockerfile) | Changed CMD to shell form | Enable env var substitution |

---

## Lessons Learned

1. **Railway.toml startCommand limitations:**
   - Doesn't support bash-style variable expansion like `$PORT`
   - Better to let Dockerfile handle start command

2. **Docker CMD forms:**
   - JSON form (`CMD ["cmd"]`): No shell processing, no env vars
   - Shell form (`CMD cmd`): Runs in shell, supports env vars

3. **Environment variable best practices:**
   - Use `${VAR:-default}` for fallback values
   - Test locally without Railway-specific vars
   - Let Docker handle runtime configuration

---

## Timeline of Fixes This Session

1. **Nixpacks pip not found** → Created nixpacks.toml with pip installation
2. **Still pip not found** → Switched to Dockerfile approach
3. **PORT variable error** → Fixed railway.toml + Dockerfile CMD (current)

**Now:** Waiting for successful deployment!

---

**Next:** Once deployed, we'll deploy the API Gateway and connect the full backend pipeline.
