# Railway Deployment - In Progress

**Status:** Building with Dockerfile approach
**Time:** ~3-5 minutes expected
**Build URL:** https://railway.com/project/dffb9616-2d0c-4367-9252-9c14d6d16802/service/295c2501-6f57-4910-a1a3-f626af3c2f34

---

## What's Happening Now

The AI Engine is deploying to Railway using a **Dockerfile** instead of Nixpacks.

### Files Active:
1. **[Dockerfile](services/ai-engine/Dockerfile)** - Uses `python:3.11-slim` with pip pre-installed
2. **[railway.toml](services/ai-engine/railway.toml)** - Configured for DOCKERFILE builder
3. **[requirements.txt](services/ai-engine/requirements.txt)** - ~30 Python packages

### Environment Variables Set:
✅ OPENAI_API_KEY
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ PINECONE_API_KEY
✅ PINECONE_INDEX_NAME
✅ GEMINI_API_KEY
✅ ENVIRONMENT=production
✅ LOG_LEVEL=info

---

## Expected Build Process

### Step 1: Base Image
```
FROM python:3.11-slim
```
- Downloads official Python 3.11 slim image (~50MB)
- Includes pip by default ✅

### Step 2: System Dependencies
```
RUN apt-get update && apt-get install -y gcc curl
```
- Installs compiler and curl
- Needed for some Python packages

### Step 3: Install Python Packages
```
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```
- This is where the build will spend most time
- Installing: FastAPI, LangChain, Supabase, Pinecone, etc.

### Step 4: Copy Application
```
COPY . .
```
- Copies all source code

### Step 5: Start Service
```
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
- Starts FastAPI server on port 8000
- Railway will inject $PORT environment variable

---

## What to Watch For in Build Logs

### ✅ Success Indicators:
```
[1/6] FROM docker.io/library/python:3.11-slim
[2/6] WORKDIR /app
[3/6] RUN apt-get update && apt-get install -y gcc curl
[4/6] COPY requirements.txt .
[5/6] RUN pip install --no-cache-dir -r requirements.txt
  Collecting fastapi==0.104.1
  Downloading fastapi-0.104.1...
  ... (all packages installing)
  Successfully installed (30+ packages)
[6/6] COPY . .

==> Build successful!
==> Starting deployment...
```

### ❌ Failure Indicators:
```
ERROR: Could not find a version that satisfies...
ERROR: No matching distribution found for...
timeout during pip install
Deploy failed
```

---

## After Successful Deployment

### 1. Get Service URL
The Railway deployment will provide a URL like:
```
https://vital-ai-engine-production.up.railway.app
```

### 2. Test Health Endpoint
```bash
curl https://your-url.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "ai-engine",
  "version": "1.0.0",
  "environment": "production"
}
```

### 3. Check Service Logs
```bash
cd services/ai-engine
railway logs
```

**Expected Output:**
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## If Build Fails

### Common Issues & Solutions:

**Issue 1: Package Installation Timeout**
- **Cause:** Too many dependencies
- **Solution:** Split requirements.txt or use pre-built wheels

**Issue 2: Missing System Dependencies**
- **Cause:** Some Python packages need system libraries
- **Solution:** Add to `apt-get install` in Dockerfile

**Issue 3: Import Errors at Runtime**
- **Cause:** src/main.py not found or has errors
- **Solution:** Check file exists at `services/ai-engine/src/main.py`

---

## Next Steps After Success

### 1. Save the AI Engine URL
```bash
export AI_ENGINE_URL="https://your-url.up.railway.app"
```

### 2. Deploy API Gateway
```bash
cd ../api-gateway
railway init
# Set environment variables including AI_ENGINE_URL
railway up
```

### 3. Test Complete Flow
```bash
# Test AI Engine directly
curl https://ai-engine-url/health

# Test API Gateway
curl https://api-gateway-url/health

# Test chat completion through gateway
curl -X POST https://api-gateway-url/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "gpt-4-turbo-preview"
  }'
```

---

## Why Dockerfile Instead of Nixpacks?

**Previous Attempts with Nixpacks:**
1. ❌ Attempt 1: `pip: command not found`
2. ❌ Attempt 2: Added `python311Packages.pip` - still failed
3. ❌ Attempt 3: Tried downloading pip via curl - complexity increased

**Dockerfile Advantages:**
- ✅ `python:3.11-slim` has pip pre-installed
- ✅ Standard Docker build process
- ✅ Better control over build steps
- ✅ Easier to debug
- ✅ More predictable behavior

---

## Current Configuration

### Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc curl
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### railway.toml
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## Timeline

- **11:05 AM:** Linked to Railway project
- **11:06 AM:** Set environment variables
- **11:07 AM:** Started deployment with Dockerfile
- **11:10 AM:** Build in progress...
- **Expected completion:** 11:10-11:12 AM

---

## Monitoring

**Check build progress:**
1. Browser window opened automatically with build logs
2. Or visit: https://railway.com/project/dffb9616-2d0c-4367-9252-9c14d6d16802
3. Click on "vital-ai-engine" service
4. View "Deployments" tab

**Real-time logs:**
```bash
cd services/ai-engine
railway logs
```

---

## Contact Points

- **Railway Dashboard:** https://railway.app
- **Project ID:** dffb9616-2d0c-4367-9252-9c14d6d16802
- **Service:** vital-ai-engine
- **Environment:** production
- **Region:** europe-west4

---

**Status:** ⏳ Waiting for build to complete...
**Next Check:** Review build logs in browser or run `railway status`
