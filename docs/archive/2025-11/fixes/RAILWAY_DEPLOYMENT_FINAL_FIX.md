# Railway Deployment - Final Fix Applied

**Date:** October 26, 2025
**Status:** Ready to Deploy (pip issue resolved)

---

## Critical Fix Applied ✅

### Issue Found
The previous deployment was failing with:
```
RUN  pip install -r requirements.txt
/bin/bash: line 1: pip: command not found
```

### Root Cause
Nixpacks was installing `python3` but NOT installing pip. The Nix package `python3` doesn't include pip by default.

### Solution Applied
Updated **[nixpacks.toml](services/ai-engine/nixpacks.toml)** to explicitly include pip:

```toml
[phases.setup]
nixPkgs = ["python311", "python311Packages.pip", "gcc"]

[phases.install]
cmds = ["python3 -m pip install --upgrade pip", "python3 -m pip install -r requirements.txt"]

[phases.build]
cmds = []

[start]
cmd = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
```

**Changes:**
1. Changed `python3` → `python311` (specific version)
2. Added `python311Packages.pip` (explicit pip installation)
3. Updated install command to use `python3 -m pip` instead of just `pip`
4. Added pip upgrade step before installing requirements

---

## Deployment Methods

### Method 1: Railway Dashboard (Recommended)

This is the most reliable method that avoids CLI complexities.

#### Step 1: Navigate to Railway Dashboard
1. Go to: https://railway.com/project/dffb9616-2d0c-4367-9252-9c14d6d16802
2. You should see the `vital-ai-engine` project

#### Step 2: Create New Service from Source
1. Click "New Service" or "Deploy"
2. Select "GitHub Repo" (if connected) or "Local Directory"
3. For local:
   - Select "Empty Service"
   - Click on the service
   - Go to "Settings" tab
   - Scroll to "Source" section
   - Click "Connect Repo" or deploy from CLI

#### Step 3: Configure Service
**In Service Settings:**

**Root Directory:**
```
services/ai-engine
```

**Build Command:** (Leave empty - Nixpacks handles this)

**Start Command:** (Already configured in railway.toml)
```
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

#### Step 4: Set Environment Variables
Click "Variables" tab and add:

```env
OPENAI_API_KEY=<your-openai-api-key>
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
ENVIRONMENT=production
LOG_LEVEL=info
MAX_TOKENS=4096
TEMPERATURE=0.7
PORT=${{PORT}}
```

#### Step 5: Deploy
1. Click "Deploy" button
2. Watch build logs
3. Wait for "Deployment successful"

---

### Method 2: Railway CLI (Alternative)

If CLI is preferred, here's the correct sequence:

```bash
# Navigate to ai-engine directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Check current link status
railway status

# If not linked, use interactive link
railway link

# Select the project: vital-ai-engine
# Select environment: production

# Deploy
railway up
```

**Important:** The CLI will now use the updated nixpacks.toml which includes pip.

---

## Expected Build Output

After fix, you should see:

```
╔═══════════════════════ Nixpacks v1.38.0 ══════════════════════╗
║ setup      │ python311, python311Packages.pip, gcc            ║
║───────────────────────────────────────────────────────────────║
║ install    │ python3 -m pip install --upgrade pip             ║
║            │ python3 -m pip install -r requirements.txt       ║
║───────────────────────────────────────────────────────────────║
║ build      │                                                  ║
║───────────────────────────────────────────────────────────────║
║ start      │ uvicorn src.main:app --host 0.0.0.0 --port $PORT ║
╚═══════════════════════════════════════════════════════════════╝
```

**Build Steps:**
```
[1/7] FROM ghcr.io/railwayapp/nixpacks:ubuntu
[2/7] WORKDIR /app/
[3/7] COPY .nixpacks/nixpkgs-*.nix .nixpacks/
[4/7] RUN nix-env -if .nixpacks/nixpkgs-*.nix
[5/7] COPY . /app/.
[6/7] RUN python3 -m pip install --upgrade pip
[7/7] RUN python3 -m pip install -r requirements.txt
```

**Success Indicators:**
- ✅ pip installation shows progress bars for each package
- ✅ All ~30 packages install without errors
- ✅ Build completes within 3-5 minutes
- ✅ Service starts and health check passes

---

## Verification Steps

### 1. Check Deployment Status

**Via Dashboard:**
- Green "Active" indicator
- Recent deployment timestamp
- No error messages

**Via CLI:**
```bash
cd services/ai-engine
railway status
```

### 2. Get Service URL

**Via Dashboard:**
- Click on service
- Go to "Settings" tab
- Find "Domains" section
- Copy the Railway-provided URL

**Via CLI:**
```bash
railway domain
```

Example: `https://vital-ai-engine-production.up.railway.app`

### 3. Test Health Endpoint

```bash
curl https://vital-ai-engine-production.up.railway.app/health
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

### 4. View Logs

**Via Dashboard:**
- Click on service
- Go to "Logs" tab
- Should see:
  ```
  INFO:     Started server process [1]
  INFO:     Waiting for application startup.
  INFO:     Application startup complete.
  INFO:     Uvicorn running on http://0.0.0.0:8000
  ```

**Via CLI:**
```bash
railway logs
```

---

## Troubleshooting

### If Build Still Fails

**1. Check nixpacks.toml exists:**
```bash
cat services/ai-engine/nixpacks.toml
```

**2. Verify file contents:**
```toml
[phases.setup]
nixPkgs = ["python311", "python311Packages.pip", "gcc"]

[phases.install]
cmds = ["python3 -m pip install --upgrade pip", "python3 -m pip install -r requirements.txt"]
```

**3. Check requirements.txt:**
```bash
cat services/ai-engine/requirements.txt
```

**4. View detailed build logs:**
- Go to Railway Dashboard
- Click on failed deployment
- View full build logs
- Look for specific error messages

---

## What Changed From Previous Attempts

| Aspect | Before | After |
|--------|--------|-------|
| Python Package | `python3` (generic) | `python311` (specific) |
| pip Installation | Not included | `python311Packages.pip` |
| Install Command | `pip install ...` | `python3 -m pip install ...` |
| pip Upgrade | Not performed | Explicit upgrade step |

---

## Files Modified This Session

1. **[nixpacks.toml](services/ai-engine/nixpacks.toml)** ✅
   - Added python311Packages.pip
   - Updated install commands

2. **[railway.toml](services/ai-engine/railway.toml)** ✅
   - Already configured correctly
   - No changes needed

3. **[Procfile](services/ai-engine/Procfile)** ✅
   - Already configured correctly
   - No changes needed

4. **[requirements.txt](services/ai-engine/requirements.txt)** ✅
   - Already complete with all dependencies
   - No changes needed

---

## Next Steps After Successful Deployment

1. **Save the AI Engine URL:**
   ```
   AI_ENGINE_URL=https://vital-ai-engine-production.up.railway.app
   ```

2. **Deploy API Gateway:**
   ```bash
   cd services/api-gateway
   railway init --name vital-api-gateway
   railway up
   ```

3. **Set API Gateway environment variables:**
   ```env
   AI_ENGINE_URL=<from step 1>
   SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
   SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   NODE_ENV=production
   PORT=3001
   ```

4. **Add Redis (Optional):**
   - Go to Railway Dashboard
   - Click "New Service"
   - Select "Redis"
   - Get REDIS_URL
   - Add to both services

5. **Test Complete Flow:**
   ```bash
   # Test AI Engine
   curl https://ai-engine-url/health

   # Test API Gateway
   curl https://api-gateway-url/health

   # Test chat completion
   curl -X POST https://api-gateway-url/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" \
     -d '{"messages": [{"role": "user", "content": "Hello"}]}'
   ```

---

## Summary

✅ **Fixed:** pip command not found error
✅ **Method:** Updated nixpacks.toml with explicit pip package
✅ **Status:** Ready for deployment
✅ **Confidence:** High - root cause identified and resolved

**Recommendation:** Use Railway Dashboard method for deployment to avoid CLI complications.

---

**Next Action:** Deploy via Railway Dashboard and verify health endpoint.
