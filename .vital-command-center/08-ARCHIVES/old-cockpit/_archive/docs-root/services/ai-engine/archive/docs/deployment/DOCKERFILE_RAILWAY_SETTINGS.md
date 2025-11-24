# 🔧 Railway Dockerfile Settings Fix

## Issue

**Error:** `Dockerfile 'Dockerfile' does not exist`

**But Dockerfile EXISTS:**
- ✅ Local: `services/ai-engine/Dockerfile`
- ✅ GitHub: `services/ai-engine/Dockerfile`

---

## 🔧 Fix in Railway Dashboard

Railway might not be reading `railway.toml` correctly, or the Build settings in the dashboard override it.

### Step 1: Check Railway Build Settings

**Go to Railway Dashboard:**
1. Project: `vital-ai-engine-v2`
2. Service: `vital-ai-engine`
3. Settings → **Build** (right sidebar)

### Step 2: Configure Build Settings

**In Build Settings, ensure:**

1. **Builder:** `Dockerfile` (or `DOCKERFILE`)
2. **Dockerfile Path:** Leave EMPTY or set to `Dockerfile`
   - Don't use `/Dockerfile` or `./Dockerfile`
   - Just: `Dockerfile` (filename only)

3. **Root Directory:** Should be `services/ai-engine` (from Source settings)
   - This is set in Settings → Source

### Step 3: If Using Config-as-Code

**Go to:** Settings → **Config-as-code**

**Check:**
- Is `railway.toml` detected?
- If yes, Railway should read Dockerfile path from there
- If no, configure manually in Build settings

---

## ✅ Expected Configuration

**Settings → Source:**
- Root Directory: `services/ai-engine`

**Settings → Build:**
- Builder: `Dockerfile`
- Dockerfile Path: `Dockerfile` (or leave empty)

**When Root Directory = `services/ai-engine`:**
- Railway will look for `Dockerfile` in `services/ai-engine/`
- Which exists at: `services/ai-engine/Dockerfile` ✅

---

## 🔍 Verification

After configuring:

1. **Save settings**
2. **Redeploy** (or Railway auto-redeploys)
3. **Check logs** - should see:
   ```
   Using Detected Dockerfile
   [internal] load build definition from Dockerfile
   ```

---

## 🚀 Quick Action

**Most likely fix:**

1. Railway Dashboard → Settings → **Build**
2. Set **Dockerfile Path:** `Dockerfile` (just filename)
3. Verify **Root Directory** = `services/ai-engine` (in Source settings)
4. Save
5. Redeploy

---

**Action:** Check Railway Build settings and ensure Dockerfile path is set correctly! 🔧

