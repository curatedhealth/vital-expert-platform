# 🚨 Railway Deployment Failure - Root Cause Analysis Report

**Project**: VITAL Path AI Engine  
**Date**: November 3, 2025, 8:30 PM  
**Status**: ❌ **DEPLOYMENT FAILING** - Health Check Never Passes  
**Severity**: 🔴 **CRITICAL** - Blocking Production Deployment

---

## 📋 EXECUTIVE SUMMARY

The VITAL Path AI Engine successfully builds on Railway (11-minute build time) but **consistently fails health checks** during deployment. The application never becomes "healthy" within the 60-second timeout window, despite multiple fixes applied to:

- ✅ Docker configuration (CACHE_BUST removed, checkpoint directory added)
- ✅ Health check timeout (increased from 30s to 60s)
- ✅ User creation order (appuser created before chown)
- ✅ Startup command (switched to minimal diagnostic server)

**Current Situation**: Even the **minimal diagnostic FastAPI server** (with zero external dependencies) fails to respond to health checks, suggesting a fundamental infrastructure or runtime issue.

---

## 🏗️ PROJECT CONTEXT

### **What We're Deploying**
- **Service**: VITAL Path AI Engine (Python FastAPI application)
- **Purpose**: Medical AI Agent Orchestration with LangChain, LangGraph, and Supabase
- **Architecture**: Monorepo structure with AI engine in `services/ai-engine/`
- **Platform**: Railway.app (Docker-based deployment)
- **Repository**: `curatedhealth/vital-expert-platform`

### **Technology Stack**
- **Runtime**: Python 3.13
- **Framework**: FastAPI + Uvicorn
- **AI/ML**: LangChain, LangGraph, OpenAI, Sentence Transformers
- **Database**: Supabase (PostgreSQL + pgvector)
- **Vector DB**: Pinecone
- **Cache**: Redis
- **Deployment**: Docker multi-stage build

### **Deployment Goal**
Deploy the AI Engine to Railway's production environment with:
- ✅ Multi-tenant security (RLS enabled)
- ✅ Health monitoring (LangFuse observability)
- ✅ Auto-scaling based on health checks
- ✅ 60-second startup tolerance for cold starts

---

## 🔴 THE PROBLEM

### **Symptom**
```
[91m2/2 replicas never became healthy![0m
[91mHealthcheck failed![0m
```

**Health Check Behavior**:
- ✅ Build completes successfully (662 seconds)
- ✅ Docker image created (~5.2 GB with all dependencies)
- ❌ App never responds to `GET /health` endpoint
- ❌ All retry attempts fail with "service unavailable"
- ❌ Deployment marked as failed after 60 seconds

**Timeline of Health Check Attempts**:
```
Attempt #1 failed - 29s remaining
Attempt #2 failed - 28s remaining
Attempt #3 failed - 26s remaining
Attempt #4 failed - 22s remaining
Attempt #5 failed - 14s remaining
...continues until timeout
```

### **What This Means**
The application is **not starting** or **crashing immediately** upon launch. The health endpoint is never reachable, indicating:
1. **Container crashes on startup** (before FastAPI can initialize)
2. **Port binding issue** (app not listening on correct port)
3. **Critical startup error** (missing environment variable, import failure)
4. **Resource exhaustion** (memory/CPU limits preventing startup)

---

## 🕵️ INVESTIGATION HISTORY

### **Phase 1: Initial Deployment Attempt**
**Date**: November 3, 2025 ~6:00 PM

**Issue**: Build failed with Docker errors
- ❌ `shared-kernel` dependency issue (relative path in requirements.txt)
- ❌ Root directory misconfiguration

**Fix Applied**:
- Created `railway.toml` at repo root
- Configured `dockerfilePath = "services/ai-engine/Dockerfile"`
- Set Railway dashboard root directory to `services/ai-engine`

**Result**: ✅ Build succeeded, ❌ Health check failed

---

### **Phase 2: Docker Configuration Fixes**
**Date**: November 3, 2025 ~7:45 PM

**Issues Identified** (from audit documents):
1. ❌ Docker `CACHE_BUST` variable preventing proper layer caching
2. ❌ LangGraph checkpoint directory missing (crashes on state persistence)
3. ❌ 30-second health check timeout too short for cold starts

**Fixes Applied**:
```dockerfile
# Removed CACHE_BUST environment variable
# Added checkpoint directory creation
RUN mkdir -p /app/data/checkpoints && \
    chmod 755 /app/data
    
# Increased health check timeout
healthcheckTimeout = 60  # in railway.toml
```

**Result**: ✅ Build succeeded, ❌ Health check still failed

---

### **Phase 3: User Creation Order Fix**
**Date**: November 3, 2025 ~8:00 PM

**Issue**: Build failed with `chown: invalid user: 'appuser:appuser'`
- Creating checkpoint directory and attempting to chown **before** user existed

**Fix Applied**:
```dockerfile
# Reordered Dockerfile steps:
# 1. Create directories
RUN mkdir -p /app/data/checkpoints && chmod 755 /app/data

# 2. Create user
RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1000 appuser

# 3. Change ownership
RUN chown -R appuser:appuser /app
```

**Result**: ✅ Build succeeded, ❌ Health check still failed

---

### **Phase 4: Diagnostic Server Deployment**
**Date**: November 3, 2025 ~8:15 PM

**Strategy**: Deploy minimal FastAPI server to isolate the issue
- Created `start_minimal.py` with basic `/health` and `/debug` endpoints
- Zero external dependencies (no Supabase, Redis, OpenAI, LangGraph)
- Should start in <1 second

**Issue Discovered**: Railway.toml `startCommand` was overriding Dockerfile `CMD`
```toml
# railway.toml was using:
startCommand = "cd services/ai-engine && python start.py"  # Full app!

# But Dockerfile had:
CMD ["python3", "start_minimal.py"]  # Diagnostic server
```

**Fix Applied**:
```toml
startCommand = "cd services/ai-engine && python start_minimal.py"
```

**Result**: ✅ Build succeeded (cached, 2 minutes), ❌ **Health check STILL failed**

---

## 💥 CRITICAL INSIGHT

**Even the minimal diagnostic server fails!**

This is **extremely significant** because:

1. **`start_minimal.py` has NO external dependencies**
   - No Supabase connection
   - No Redis connection
   - No OpenAI API calls
   - No LangGraph initialization
   - Just pure FastAPI + Uvicorn

2. **The minimal server is literally 30 lines of code**:
   ```python
   import uvicorn
   from fastapi import FastAPI
   
   app = FastAPI(title="Minimal Diagnostic AI Engine")
   
   @app.get("/health")
   async def health_check():
       return {"status": "healthy", "ready": True}
   
   if __name__ == "__main__":
       port = int(os.getenv("PORT", "8000"))
       uvicorn.run(app, host="0.0.0.0", port=port)
   ```

3. **This should start in <1 second**
   - FastAPI loads instantly
   - No database connections to wait for
   - No models to download
   - No API keys to validate

**Conclusion**: The issue is NOT related to:
- ❌ Application code complexity
- ❌ External service dependencies
- ❌ Slow initialization
- ❌ Missing API keys

**The issue IS related to**:
- ✅ Container runtime environment
- ✅ Port binding / networking
- ✅ Railway platform configuration
- ✅ Critical missing environment variable affecting Python/Uvicorn startup
- ✅ Resource constraints (memory/CPU)

---

## 🔍 CURRENT DEPLOYMENT CONFIGURATION

### **Railway Configuration** (`railway.toml`)
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "services/ai-engine/Dockerfile"
watchPatterns = ["services/ai-engine/**"]

[deploy]
startCommand = "cd services/ai-engine && python start_minimal.py"
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### **Dockerfile Configuration** (Relevant Sections)
```dockerfile
# Base image
FROM python:3.13-slim-bookworm

# Multi-stage build (builder + runtime)
# Dependencies: ~200+ Python packages including PyTorch (900MB)
# Final image size: ~5.2 GB

# Port exposure
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# User
USER appuser

# Startup
CMD ["python3", "start_minimal.py"]
```

### **Application Startup** (`start_minimal.py`)
```python
# Reads PORT from environment (defaults to 8000)
# Binds to 0.0.0.0:$PORT
# Provides /health and /debug endpoints
```

---

## 🤔 HYPOTHESIS: ROOT CAUSES

### **Hypothesis #1: PORT Environment Variable Missing** (🔴 HIGH PROBABILITY)
**Theory**: Railway assigns a dynamic `PORT`, but the container isn't receiving it.

**Evidence**:
- Railway uses dynamic port assignment
- App defaults to port 8000 if `PORT` not set
- Health check might be hitting wrong port

**Test**: Check Railway environment variables in dashboard

**Fix**: Ensure `PORT` is set in Railway or app reads Railway's assigned port

---

### **Hypothesis #2: App Crashes Before Binding to Port** (🔴 HIGH PROBABILITY)
**Theory**: Python script crashes during import or initialization.

**Evidence**:
- Even minimal server fails
- No response at all (not even connection refused)
- Could be import error, syntax error, or missing file

**Test**: Check Railway deployment logs for Python errors

**Fix**: Review full application logs (not just health check logs)

---

### **Hypothesis #3: Working Directory Issue** (🟡 MEDIUM PROBABILITY)
**Theory**: `cd services/ai-engine` in startCommand might not work as expected.

**Evidence**:
- Railway containers may not preserve directory structure
- `start_minimal.py` might not be found at expected path

**Test**: Verify file existence and paths in Railway container

**Fix**: Use absolute paths or remove `cd` command

---

### **Hypothesis #4: Railway Health Check Configuration Mismatch** (🟡 MEDIUM PROBABILITY)
**Theory**: Railway's health check configuration conflicts with app configuration.

**Evidence**:
- Health check defined in both Dockerfile and railway.toml
- Possible timing/path mismatches

**Test**: Review Railway dashboard health check settings

**Fix**: Align all health check configurations

---

### **Hypothesis #5: Resource Constraints** (🟢 LOW PROBABILITY)
**Theory**: Container doesn't have enough memory/CPU to start.

**Evidence**:
- Large Docker image (5.2 GB)
- PyTorch and ML dependencies are heavy
- Railway free/hobby tier might have limits

**Test**: Check Railway resource usage during deployment

**Fix**: Increase memory limits in railway.toml or upgrade Railway plan

---

### **Hypothesis #6: User Permissions Issue** (🟢 LOW PROBABILITY)
**Theory**: `appuser` doesn't have permission to bind to port or access files.

**Evidence**:
- Running as non-root user (appuser)
- Port 8000 should be accessible to non-root

**Test**: Try running as root temporarily

**Fix**: Adjust file permissions or user configuration

---

## 📊 DATA POINTS

### **Build Statistics**
- ✅ Build Success Rate: 100% (last 3 attempts)
- ⏱️ Build Time: ~662 seconds (~11 minutes)
- 📦 Image Size: ~5.2 GB
- 🐳 Base Image: python:3.13-slim-bookworm
- 📚 Dependencies: ~200 Python packages

### **Health Check Statistics**
- ❌ Success Rate: 0% (0/20+ attempts)
- ⏱️ Timeout: 60 seconds
- 🔄 Retry Attempts: 5-6 per deployment
- 📍 Endpoint: `GET /health`
- 🎯 Expected Response: `{"status": "healthy"}`

### **Deployment Timeline**
- 6:00 PM - First deployment attempt (build failure)
- 7:00 PM - Build fixes (root directory, railway.toml)
- 7:45 PM - Docker optimizations (CACHE_BUST, checkpoint dir)
- 8:00 PM - User creation order fix
- 8:15 PM - Minimal diagnostic server deployment
- 8:30 PM - **STILL FAILING** (current status)

---

## 🎯 RECOMMENDED NEXT STEPS

### **Immediate Actions** (Next 30 minutes)

#### **Step 1: Get Deployment Logs** 🔴 **CRITICAL**
```bash
# In Railway dashboard:
# 1. Click on failed deployment
# 2. Go to "Logs" tab
# 3. Look for Python errors, import errors, or startup failures
# 4. Check for "ModuleNotFoundError", "ImportError", or exceptions
```

**What to look for**:
- Python stack traces
- `uvicorn` startup messages
- Port binding errors
- File not found errors

#### **Step 2: Verify Environment Variables** 🔴 **CRITICAL**
```bash
# In Railway dashboard:
# 1. Go to "Variables" tab
# 2. Check if PORT is set (Railway sets this automatically)
# 3. Verify no required variables are missing
```

**Required variables** (even for minimal server):
- `PORT` (usually auto-set by Railway)

**Optional variables** (not needed for minimal server):
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

#### **Step 3: Test with Even Simpler Server** 🟡 **HIGH PRIORITY**
Create absolute bare-bones test:

```python
# test_server.py
import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Server running on port {PORT}")
    httpd.serve_forever()
```

Update railway.toml:
```toml
startCommand = "cd services/ai-engine && python -m http.server 8000"
```

**Purpose**: Test if ANY Python server can start

---

### **Investigation Actions** (Next 1-2 hours)

#### **Action 1: SSH into Railway Container** (if possible)
Some Railway plans allow shell access:
```bash
railway shell
cd services/ai-engine
ls -la
python start_minimal.py  # Test manually
```

#### **Action 2: Add Extensive Logging to start_minimal.py**
```python
import sys
import os

print("=" * 80, flush=True)
print("🚀 MINIMAL DIAGNOSTIC SERVER STARTING", flush=True)
print("=" * 80, flush=True)
print(f"Python version: {sys.version}", flush=True)
print(f"Working directory: {os.getcwd()}", flush=True)
print(f"Files in current dir: {os.listdir('.')}", flush=True)
print(f"PORT env var: {os.getenv('PORT', 'NOT SET')}", flush=True)

try:
    print("Importing uvicorn...", flush=True)
    import uvicorn
    print("✅ Uvicorn imported", flush=True)
    
    print("Importing FastAPI...", flush=True)
    from fastapi import FastAPI
    print("✅ FastAPI imported", flush=True)
    
    print("Creating FastAPI app...", flush=True)
    app = FastAPI()
    print("✅ App created", flush=True)
    
    @app.get("/health")
    async def health():
        return {"status": "healthy"}
    
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting server on 0.0.0.0:{port}...", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port)
    
except Exception as e:
    print(f"❌ FATAL ERROR: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)
```

#### **Action 3: Check Railway Resource Limits**
In Railway dashboard → Settings → Resources:
- Memory limit: Should be at least 2GB
- CPU limit: Should be at least 1 core

#### **Action 4: Simplify Dockerfile Temporarily**
Test with absolute minimal Dockerfile:
```dockerfile
FROM python:3.13-slim
WORKDIR /app
RUN pip install fastapi uvicorn
COPY start_minimal.py .
CMD ["python", "start_minimal.py"]
```

---

### **Alternative Approaches**

#### **Option A: Deploy to Different Platform** (Verification)
Test deployment on:
- **Render.com** (similar to Railway)
- **Fly.io** (Docker-native)
- **Google Cloud Run** (serverless containers)

**Purpose**: Determine if issue is Railway-specific or application-specific

#### **Option B: Use Railway's Built-in Python Support**
Instead of Dockerfile, use Railway's native Python buildpack:
- Remove Dockerfile
- Use `requirements.txt` directly
- Let Railway handle the build

**Purpose**: Eliminate Docker as a variable

#### **Option C: Contact Railway Support**
With deployment ID and logs, ask Railway team:
- Why health checks fail even for minimal server
- Any platform-specific requirements
- Known issues with Python 3.13 or FastAPI

---

## 📝 KEY QUESTIONS TO ANSWER

1. **Does the Python process start at all?**
   - Check Railway logs for `"MINIMAL DIAGNOSTIC SERVER STARTING"`
   - Look for ANY output from start_minimal.py

2. **Is the PORT environment variable set correctly?**
   - Railway dashboard → Variables → PORT
   - Should be set automatically by Railway

3. **Can we see ANY application logs?**
   - Not just health check failures
   - Actual stdout/stderr from Python process

4. **Is the health check hitting the right port?**
   - Railway's internal port routing
   - Health check configuration alignment

5. **Are there any Railway platform limitations?**
   - Memory/CPU during startup
   - Network policies
   - Docker command restrictions

---

## 🎓 LESSONS LEARNED

### **What Worked**
✅ Multi-stage Docker builds (fast rebuild with caching)  
✅ Monorepo configuration with railway.toml  
✅ Systematic debugging approach (minimal server strategy)  
✅ Git-based deployment workflow  

### **What Didn't Work**
❌ Assuming Dockerfile CMD would be used (Railway uses startCommand)  
❌ 30-second health check timeout (too short for ML apps)  
❌ Attempting to chown before creating user  

### **What We Don't Know Yet** (🔴 BLOCKING)
❓ Why even the minimal server fails health checks  
❓ Whether the Python process starts at all  
❓ What errors appear in full deployment logs  
❓ If Railway-specific configuration is missing  

---

## 📚 APPENDIX

### **Relevant Files**
- `services/ai-engine/Dockerfile` - Docker build configuration
- `services/ai-engine/start_minimal.py` - Minimal diagnostic server
- `services/ai-engine/start.py` - Full application startup
- `railway.toml` - Railway deployment configuration
- `services/ai-engine/requirements.txt` - Python dependencies

### **Relevant Documentation**
- Railway Healthcheck Docs: https://docs.railway.app/deploy/healthchecks
- Railway Dockerfile Docs: https://docs.railway.app/deploy/dockerfiles
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/docker/

### **Related Audit Documents**
- `RAILWAY_DEPLOYMENT_AUDIT.md` - Pre-deployment readiness audit
- `AUDIT_FIXES_APPLIED.md` - Summary of fixes applied
- `LANGFUSE_SETUP_GUIDE.md` - LangFuse configuration (not yet added)

---

## 🚀 SUCCESS CRITERIA

**Deployment will be considered successful when**:
1. ✅ Build completes without errors
2. ✅ Python process starts and stays running
3. ✅ Health check endpoint returns 200 OK
4. ✅ Railway marks deployment as "healthy"
5. ✅ Service is publicly accessible

**Current Status**: 1/5 complete (build succeeds, rest fails)

---

**Report Generated**: November 3, 2025, 8:35 PM  
**Next Update**: After retrieving full deployment logs  
**Priority**: 🔴 **CRITICAL** - Production deployment blocked

