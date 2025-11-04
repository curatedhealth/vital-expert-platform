# Railway Deployment Troubleshooting - Complete Timeline

**Service:** vital-ai-engine
**Status:** Multiple deployment attempts - all failing
**Latest Attempt:** Build ID 82c086d1-fdb6-4023-bf78-78c4cc6f560a

---

## All Attempts Made

### Attempt 1: Nixpacks with pip package
**Config:** nixpacks.toml with `python311Packages.pip`
**Error:** `/root/.nix-profile/bin/python3: No module named pip`
**Issue:** Nix package system not finding pip despite explicit inclusion

### Attempt 2: Nixpacks with get-pip.py
**Config:** Download pip via curl bootstrap
**Error:** `PORT variable must be integer between 0 and 65535`
**Issue:** Railway rejecting $PORT variable syntax

### Attempt 3: Dockerfile + railway.toml with startCommand
**Config:** Dockerfile + railway.toml startCommand with `$PORT`
**Error:** `PORT variable must be integer between 0 and 65535`
**Issue:** Same PORT variable error

### Attempt 4: Dockerfile without startCommand in railway.toml
**Config:** Removed startCommand from railway.toml, used Dockerfile CMD only
**Error:** Still showing `Using Nixpacks` in logs
**Issue:** Railway ignoring railway.toml builder setting

### Attempt 5: Remove nixpacks.toml and Procfile
**Config:** Deleted nixpacks.toml and Procfile to force Dockerfile
**Error:** TBD - currently deploying
**Build ID:** 82c086d1-fdb6-4023-bf78-78c4cc6f560a

---

## Current Configuration

### Files Present:
```
services/ai-engine/
├── Dockerfile ✅ (using python:3.11-slim)
├── railway.toml ✅ (builder = "DOCKERFILE")
├── requirements.txt ✅
├── src/
│   └── main.py ✅
├── Procfile ❌ (deleted)
└── nixpacks.toml ❌ (deleted)
```

### Dockerfile Content:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc curl
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### railway.toml Content:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## Key Issues Identified

### Issue 1: Railway Ignoring builder = "DOCKERFILE"
Even with `builder = "DOCKERFILE"` explicitly set in railway.toml, logs show "Using Nixpacks". This suggests:
- Railway might be caching build configuration
- Need to manually set builder in Dashboard
- railway.toml might not be respected for existing services

### Issue 2: PORT Variable Handling
Railway's PORT variable injection is failing with:
```
PORT variable must be integer between 0 and 65535
```

This error appears BEFORE any build starts, suggesting a configuration validation issue.

### Issue 3: Nixpacks Persistence
Despite removing nixpacks.toml and Procfile, Railway might still default to Nixpacks due to:
- Python files detected in project
- Cached service configuration
- Dashboard settings overriding railway.toml

---

## Diagnostic Questions

To resolve this, we need to confirm:

1. **Is the latest deploy actually using Docker?**
   - Check build logs at: https://railway.com/project/dffb9616-2d0c-4367-9252-9c14d6d16802/service/295c2501-6f57-4910-a1a3-f626af3c2f34?id=82c086d1-fdb6-4023-bf78-78c4cc6f560a
   - Look for "Using Nixpacks" vs Docker build steps

2. **Does src/main.py exist and is it valid?**
   - Path: `services/ai-engine/src/main.py`
   - Should contain FastAPI app

3. **Is Railway Dashboard overriding builder settings?**
   - Check service Settings > Build
   - Might need to manually select "Dockerfile" in Dashboard

---

## Next Steps to Try

### Option A: Force Dockerfile via Dashboard
1. Go to Railway Dashboard
2. Click on vital-ai-engine service
3. Go to Settings > Deploy
4. Find "Builder" setting
5. Manually select "Dockerfile"
6. Redeploy

### Option B: Create New Service
If Railway has cached bad configuration:
1. Delete current service
2. Create new service from scratch
3. Deploy with Dockerfile from the start
4. Set environment variables fresh

### Option C: Use Railway Dashboard Deploy
Instead of `railway up` CLI:
1. Connect GitHub repository to Railway
2. Let Railway deploy from git
3. Configure via Dashboard UI
4. May avoid CLI/config file conflicts

---

## Environment Variables Set

All environment variables are configured:
- ✅ OPENAI_API_KEY
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ PINECONE_API_KEY
- ✅ PINECONE_INDEX_NAME
- ✅ GEMINI_API_KEY
- ✅ ENVIRONMENT=production
- ✅ LOG_LEVEL=info

---

## Expected vs Actual

### Expected Build Output:
```
[Region: europe-west4]
==============
Using Dockerfile
==============

[1/6] FROM docker.io/library/python:3.11-slim
[2/6] WORKDIR /app
[3/6] RUN apt-get update && apt-get install -y gcc curl
[4/6] COPY requirements.txt .
[5/6] RUN pip install -r requirements.txt
[6/6] COPY . .

✅ Build successful
```

### Actual Build Output (from previous attempts):
```
[Region: europe-west4]
==============
Using Nixpacks  ← WRONG!
==============

PORT variable must be integer between 0 and 65535
Deploy failed
```

---

## Files to Check

If needed, verify these files exist and are correct:

### 1. Check Dockerfile exists
```bash
cat services/ai-engine/Dockerfile
```

### 2. Check railway.toml
```bash
cat services/ai-engine/railway.toml
```

### 3. Check src/main.py exists
```bash
ls -la services/ai-engine/src/main.py
```

### 4. Check requirements.txt
```bash
cat services/ai-engine/requirements.txt | head -20
```

### 5. Verify no nixpacks files
```bash
ls services/ai-engine/ | grep -E "nixpacks|Procfile"
# Should return nothing
```

---

## Alternative: Minimal Working Example

If all else fails, create a minimal test deployment:

### Minimal Dockerfile:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN pip install fastapi uvicorn
COPY . .
CMD ["uvicorn", "test:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Minimal test.py:
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}
```

Deploy this first to confirm Railway + Dockerfile works, then add complexities.

---

## Summary

**What We Know:**
- ✅ Files are correctly configured locally
- ✅ Environment variables are set
- ❌ Railway keeps using Nixpacks despite Dockerfile
- ❌ PORT variable error blocking deployments

**What We Need:**
- Confirmation of latest build logs (Docker vs Nixpacks)
- Possibly manual Dashboard configuration
- May need to create fresh service

**Current Status:**
⏳ Waiting for build 82c086d1 to complete to see if removing nixpacks.toml/Procfile forced Dockerfile usage.

Check build logs at:
https://railway.com/project/dffb9616-2d0c-4367-9252-9c14d6d16802/service/295c2501-6f57-4910-a1a3-f626af3c2f34?id=82c086d1-fdb6-4023-bf78-78c4cc6f560a
