# Railway Deployment Fix

## Issue

Railway is building from the repository root, but the Dockerfile expects to be run from `services/ai-engine` directory.

**Error:**
```
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref rqe1mgs1d5vvdmt3fiakl2ta2::ysj9ktgaw02vt5gzsz9mwtkyl: "/requirements.txt": not found
```

## Solution

Set the **Root Directory** for the service in Railway Dashboard:

### Step 1: Open Railway Dashboard

1. Go to: https://railway.app/dashboard
2. Select project: `vital-ai-engine-v2`
3. Select service: `vital-ai-engine`

### Step 2: Configure Root Directory

1. Go to **Settings** tab
2. Find **Source** section
3. Set **Root Directory** to: `services/ai-engine`
4. Click **Save**

### Step 3: Redeploy

After setting the root directory:

1. Go to **Deployments** tab
2. Click **Redeploy** button
3. Or Railway will auto-deploy after saving

---

## Alternative: Fix Dockerfile (If above doesn't work)

If Railway can't use root directory, we can modify the Dockerfile to work from the repository root:

```dockerfile
# Change COPY paths to be relative to repo root
COPY services/ai-engine/requirements.txt .
COPY services/ai-engine/src ./src
COPY services/ai-engine/start.py .
```

**But this is not recommended** - it's better to set the root directory in Railway.

---

## Verify Configuration

After setting root directory, verify:

1. Railway builds from `services/ai-engine/`
2. Dockerfile finds `requirements.txt`
3. Build succeeds
4. Service starts correctly

---

**Action Required:** Set Root Directory to `services/ai-engine` in Railway Dashboard! 🔧

