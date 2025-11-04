# 🔧 Railway Dockerfile Fix

## Issue

**Error:** `Dockerfile 'Dockerfile' does not exist`

**Status:**
- ✅ Dockerfile exists at: `services/ai-engine/Dockerfile`
- ✅ railway.toml exists at: `services/ai-engine/railway.toml`
- ⚠️ Railway can't find it

---

## Root Cause

Railway needs the **Root Directory** to be set in the Dashboard, not just in CLI/config.

---

## ✅ Fix: Railway Dashboard Configuration

### Step 1: Open Railway Dashboard

1. Go to: https://railway.app/dashboard
2. Select project: `vital-ai-engine-v2`
3. Select service: `vital-ai-engine`

### Step 2: Configure Source Settings

**Go to:** Settings → **Source**

**Set:**
- **Root Directory:** `services/ai-engine` (NO leading slash!)
- **Watch Paths:** Leave default or set to `services/ai-engine/**`
- **Branch:** `restructure/world-class-architecture`

**Click "Save"**

### Step 3: Configure Build Settings

**Go to:** Settings → **Build**

**Set:**
- **Builder:** `Dockerfile` or `DOCKERFILE`
- **Dockerfile Path:** Leave **EMPTY** (let it auto-detect) OR set to `Dockerfile` (just filename)
  - Don't use `./Dockerfile` or `/Dockerfile`
  - Just: `Dockerfile`

**Click "Save"**

### Step 4: Verify Configuration

**Expected settings:**
- **Source → Root Directory:** `services/ai-engine`
- **Build → Builder:** `Dockerfile`
- **Build → Dockerfile Path:** Empty or `Dockerfile`

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** or Railway will auto-redeploy

---

## 🔍 Verification

After fixing, check Railway logs:

```bash
cd services/ai-engine
railway logs
```

**Should see:**
```
Using Detected Dockerfile
[internal] load build definition from Dockerfile
```

---

## 📋 Current Configuration

**What's been done:**
- ✅ Updated `railway.toml` to remove `dockerfilePath` (let Railway auto-detect)
- ✅ Dockerfile exists and is correct (Python 3.11)
- ✅ All fixes committed to GitHub

**What you need to do:**
1. Railway Dashboard → Settings → **Source**
2. Set **Root Directory:** `services/ai-engine`
3. Settings → **Build**
4. Set **Dockerfile Path:** Empty or `Dockerfile`
5. Save and redeploy

---

## 🚀 Quick Checklist

- [ ] Root Directory = `services/ai-engine` (no `/` prefix)
- [ ] Dockerfile Path = Empty or `Dockerfile` (not `./Dockerfile`)
- [ ] Builder = `Dockerfile`
- [ ] Branch = `restructure/world-class-architecture`
- [ ] Saved settings
- [ ] Triggered redeploy

---

**Action:** Configure Root Directory and Dockerfile Path in Railway Dashboard! 🔧

