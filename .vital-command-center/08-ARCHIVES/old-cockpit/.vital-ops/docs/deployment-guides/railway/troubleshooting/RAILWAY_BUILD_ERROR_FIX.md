# 🔧 RAILWAY BUILD ERROR FIX

**Error**: `ERROR: ../shared-kernel[dev] is not a valid editable requirement`

**Root Cause**: Railway is using a cached/old `requirements.txt` file

---

## ✅ SOLUTION (3 Steps in Railway Dashboard)

### Step 1: Set Root Directory

1. Open: https://railway.com/project/1874a0cf-6c1c-4077-a5f1-92567064b3df
2. Click service: **`ai-engine`**
3. Go to: **Settings** ⚙️
4. Scroll to: **Source** section
5. Set **Root Directory**: `services/ai-engine`
6. **DON'T deploy yet** - continue to Step 2

### Step 2: Clear Build Cache

In the same Settings page:
1. Scroll to: **Danger Zone** (bottom)
2. Click: **"Restart Deployment"** or **"Clear Build Cache"**
3. Confirm the action

### Step 3: Deploy with Clean Cache

1. Go back to: **Deployments** tab
2. Click: **"Deploy"** button (top right)
3. Or run from terminal:
   ```bash
   cd services/ai-engine
   railway up --detach
   ```

---

## 🔍 WHY THIS HAPPENS

The old `requirements.txt` had a line like:
```
-e ../shared-kernel[dev]
```

This was removed, but Railway cached the old file. Setting the root directory + clearing cache fixes this.

---

## ✅ VERIFICATION

After deployment, check build logs for:

```
✅ Building from: services/ai-engine
✅ Found Dockerfile
✅ Installing dependencies from requirements.txt
✅ Successfully installed fastapi uvicorn langchain...
✅ Starting FastAPI server
```

**No more `shared-kernel` errors!**

---

## 🎯 ALTERNATIVE: Manual Deploy from Local

If Railway dashboard is slow, deploy from terminal with force rebuild:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Push latest changes
git push origin main

# Wait 10 seconds for Railway auto-deploy
# OR force rebuild:
railway up --detach
```

---

## 📋 CHECKLIST

Before deploying, verify in Railway dashboard:

- ✅ Branch: `main`
- ✅ Root Directory: `services/ai-engine`
- ✅ Build cache cleared (or restart deployment)
- ✅ Latest commit: d774848f ("fix(railway): Configure root directory...")

---

## 🧪 TEST AFTER DEPLOYMENT

```bash
# Wait 3-5 minutes for build to complete, then:
curl https://ai-engine-production-1c26.up.railway.app/health

# Expected:
# {"status": "healthy", "ready": true, ...}
```

---

## 🚨 IF STILL FAILS

Check build logs for the actual requirements.txt being used:

1. Railway Dashboard → Deployments → Latest → Build Logs
2. Search for: "Collecting" or "Installing"
3. Verify it's NOT trying to install `shared-kernel`

If it still mentions `shared-kernel`:
- Verify Root Directory is set correctly
- Try: Settings → Danger Zone → "Delete Service" → Re-create service
- Or: Contact Railway support (usually instant on Discord)

---

**ACTION REQUIRED**: 

1. Open Railway dashboard: https://railway.com/project/1874a0cf-6c1c-4077-a5f1-92567064b3df
2. Service: `ai-engine` → Settings
3. Set Root Directory: `services/ai-engine`
4. Danger Zone → Restart Deployment
5. Deployments → Deploy

**TIME**: 2 minutes to configure + 3-5 minutes to build

---

*Fix committed in: d774848f*  
*Date: November 3, 2025*

