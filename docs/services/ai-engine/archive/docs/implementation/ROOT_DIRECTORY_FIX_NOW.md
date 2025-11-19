# 🔧 URGENT: Fix Root Directory Now

## Error

**Railway Error:**
```
Could not find root directory: /services/ai-engine
```

## Problem

Railway is looking for `/services/ai-engine` (with leading slash) ❌

**Should be:** `services/ai-engine` (NO leading slash) ✅

---

## ✅ Quick Fix

### Step 1: Open Railway Dashboard

1. Go to: https://railway.app/dashboard
2. Select project: `vital-ai-engine-v2`
3. Select service: `vital-expert-platform` (or your service name)
4. Click **Settings** tab

### Step 2: Fix Root Directory

1. Find **Source** section (right sidebar)
2. Find **Root Directory** field
3. **Current (WRONG):** `/services/ai-engine` or `/service`
4. **Delete the leading slash** or clear the field
5. **Type exactly:** `services/ai-engine` (NO leading slash!)
6. Click ✓ (checkmark) to save

### Step 3: Verify

**After saving, verify:**
- Root Directory shows: `services/ai-engine` (no `/` at start)
- Railway shows "1 change pending" or auto-deploys
- Build logs should find Dockerfile

---

## 📋 Exact Value

**Copy this exactly:**
```
services/ai-engine
```

**NOT:**
- ❌ `/services/ai-engine` (no leading slash!)
- ❌ `services/ai-engine/` (no trailing slash!)
- ❌ `./services/ai-engine` (no `./`!)

---

## 🚀 After Fix

Railway will:
1. ✅ Find `services/ai-engine/Dockerfile`
2. ✅ Find `services/ai-engine/requirements.txt`
3. ✅ Find `services/ai-engine/src/`
4. ✅ Build successfully
5. ✅ Deploy and start service

---

## ⚡ Visual Guide

**Before (WRONG):**
```
Root Directory: [ /services/ai-engine ] ✓ ✗
```

**After (CORRECT):**
```
Root Directory: [ services/ai-engine ] ✓ ✗
```

**Just remove the `/` at the start!**

---

**Status:** Fix Root Directory in Railway Dashboard → Remove leading slash → Save! 🚀

