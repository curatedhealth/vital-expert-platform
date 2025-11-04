# 🔧 Railway Root Directory Fix

## Current Issue

**Railway Dashboard shows:**
- Root Directory: `/service` ❌

**Should be:**
- Root Directory: `services/ai-engine` ✅

---

## 🎯 Why This Matters

Railway is looking for:
- `Dockerfile` in `/service/` (doesn't exist)
- `requirements.txt` in `/service/` (doesn't exist)

But your code is in:
- `services/ai-engine/Dockerfile` ✅ (exists on GitHub)
- `services/ai-engine/requirements.txt` ✅ (exists on GitHub)

---

## ✅ Fix in Railway Dashboard

### Step 1: Open Settings

**Direct Link:**
```
https://railway.app/project/1874a0cf-6c1c-4077-a5f1-92567064b3df/service/eca0aebf-eada-497d-9275-474c648c88fd/settings
```

Or:
1. Go to Railway Dashboard
2. Project: `vital-ai-engine-v2`
3. Service: `vital-ai-engine`
4. Tab: **Settings**
5. Section: **Source**

### Step 2: Update Root Directory

1. Find **Root Directory** field
2. **Current:** `/service`
3. **Change to:** `services/ai-engine`
4. Click ✓ (checkmark) to save
5. Railway will auto-redeploy

---

## 📋 Verification

### On GitHub

**Repository:** `curatedhealth/vital-expert-platform`  
**Branch:** `restructure/world-class-architecture`  
**Path:** `services/ai-engine/`

**Files on GitHub:**
- ✅ `services/ai-engine/Dockerfile`
- ✅ `services/ai-engine/requirements.txt`
- ✅ `services/ai-engine/src/`
- ✅ `services/ai-engine/railway.toml` (may need to push latest)

**GitHub URL:**
```
https://github.com/curatedhealth/vital-expert-platform/tree/restructure/world-class-architecture/services/ai-engine
```

---

## 🚀 After Fix

Once Root Directory is set to `services/ai-engine`:

1. Railway will find `Dockerfile`
2. Railway will find `requirements.txt`
3. Build will succeed
4. Service will start
5. Health endpoint will work

**Test:**
```bash
curl https://vital-ai-engine-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0"
}
```

---

## ⚡ Quick Action

**Change this in Railway Dashboard NOW:**

**Root Directory:** `/service` → `services/ai-engine`

Then wait for auto-redeploy (~5-10 minutes) ✅

