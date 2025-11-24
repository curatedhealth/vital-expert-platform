# Fresh Railway Deployment - Clean Start

**Goal:** Deploy AI Engine to Railway with minimal configuration
**Strategy:** Use Railway Dashboard only, no CLI complications

---

## Step 1: Delete Old Railway Project

1. Go to Railway Dashboard: https://railway.app
2. Find project: `vital-ai-engine`
3. Click Settings → Danger → Delete Project
4. Confirm deletion

---

## Step 2: Create New Railway Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `curatedhealth/vital-expert-platform`
4. Branch: `restructure/world-class-architecture`

---

## Step 3: Configure Service

Railway will detect the repo. Now configure:

### Source Configuration
- **Root Directory:** `services/ai-engine`
- **Watch Paths:** `services/ai-engine/**` (optional)

### Build Configuration
- **Builder:** Dockerfile (should auto-detect)
- **Dockerfile Path:** Leave empty (Railway will find it)

### Deploy Configuration
**IMPORTANT:** Leave "Custom Start Command" **EMPTY**

The Dockerfile already has: `CMD ["python3", "/app/start.py"]`

### Environment Variables

**⚠️ Reference:** See `ENVIRONMENT_SETUP.md` for all environment variables.

Add required variables in Railway Variables tab. Key variables:
```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes
PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR
PINECONE_INDEX_NAME=vital-knowledge
GEMINI_API_KEY=AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0
ENVIRONMENT=production
LOG_LEVEL=info
```

---

## Step 4: Deploy

1. Click **"Deploy"** button
2. Railway will:
   - Pull code from GitHub
   - Build Dockerfile
   - Run start.py which reads PORT from Railway's environment
   - Start service

---

## Expected Build Output

```
=========================
Using Detected Dockerfile
=========================

[1/7] FROM docker.io/library/python:3.11-slim
[2/7] WORKDIR /app
[3/7] RUN apt-get update && apt-get install -y gcc curl
[4/7] COPY requirements.txt .
[5/7] RUN pip install -r requirements.txt
      ✅ Installing ~30 packages (2-4 minutes)
[6/7] COPY . .
[7/7] COPY start.py /app/start.py

✅ Build successful
🚀 Starting deployment

Starting uvicorn on port 8080
INFO:     Started server process [1]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8080
```

---

## Step 5: Verify Deployment

### Get Service URL
Railway will show the URL in the dashboard, typically:
```
https://[service-name].up.railway.app
```

### Test Health Endpoint
```bash
curl https://[your-url].up.railway.app/health
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

---

## Why This Will Work

### Clean Configuration Files on GitHub:
```
services/ai-engine/
├── Dockerfile ✅
│   - Uses python:3.11-slim
│   - CMD ["python3", "/app/start.py"]
│   - NO PORT variable references
│
├── start.py ✅
│   - Reads PORT from os.getenv("PORT", "8000")
│   - Starts uvicorn programmatically
│   - Pure Python, no bash
│
├── requirements.txt ✅
│   - All dependencies listed
│
├── src/
│   └── main.py ✅
│       - FastAPI application
│
└── NO railway.toml ✅
    └── NO docker-entrypoint.sh ✅
        └── NO bash PORT syntax anywhere ✅
```

---

## What We Learned (Root Causes)

1. **Railway scans ALL files** in the directory for validation
2. **PORT variable syntax** (`$PORT`, `${PORT:-8000}`) triggers validation errors
3. **railway.toml with $PORT** = validation error
4. **docker-entrypoint.sh with bash PORT** = validation error
5. **Custom Start Command with $PORT** = validation error

**Solution:** Use Python's `os.getenv()` in start.py - Railway doesn't validate Python code!

---

## Troubleshooting

### If you still get PORT error:
Check that in Railway Dashboard:
- Custom Start Command is **EMPTY**
- No railway.toml in the directory
- No shell scripts with PORT syntax

### If build times out:
- First build takes 3-5 minutes (installing packages)
- Subsequent builds are faster (Docker layer caching)
- Check build logs for specific package failures

### If health endpoint returns 404:
- Check that build completed successfully
- Verify start.py is running (check logs)
- Ensure PORT environment variable is being set by Railway

---

## Next Steps After Success

1. **Save AI Engine URL**
2. **Deploy API Gateway** to separate Railway service
3. **Configure API Gateway** to point to AI Engine URL
4. **Test complete flow:** Frontend → API Gateway → AI Engine
5. **Deploy frontends to Vercel**

---

## Summary

✅ **Delete old project** - start fresh, no cached configs
✅ **Deploy from GitHub** - reliable, automatic updates
✅ **Minimal configuration** - only what's necessary
✅ **Python for PORT** - avoid bash syntax entirely
✅ **Dashboard only** - no CLI complications

**This approach will work because we've eliminated ALL sources of the PORT validation error.**
