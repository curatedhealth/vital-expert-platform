# 🔧 Fix Root Directory - Step by Step

## Error

```
Could not find root directory: /services/ai-engine
```

## Problem

Railway Root Directory has a **leading slash** (`/services/ai-engine`) ❌

**Should be:** `services/ai-engine` (NO leading slash) ✅

---

## ✅ Quick Fix (2 Minutes)

### Step 1: Open Railway Dashboard

**Direct Link:**
```
https://railway.app/dashboard
```

**Or navigate:**
1. Go to https://railway.app/dashboard
2. Select project: `vital-ai-engine-v2`
3. Select service: `vital-expert-platform` (your service name)
4. Click **Settings** tab (right sidebar)

### Step 2: Find Root Directory Field

1. In Settings tab, scroll to **Source** section
2. Find **Root Directory** input field
3. You'll see current value: `/services/ai-engine` (WRONG)

### Step 3: Fix the Value

1. **Click** in the Root Directory field
2. **Select all** (Cmd+A or Ctrl+A)
3. **Delete** the value
4. **Type exactly:** `services/ai-engine` (NO leading slash!)
5. Click **✓** (checkmark) to save

### Step 4: Verify

**After saving:**
- Root Directory should show: `services/ai-engine` (no `/`)
- Railway will show "1 change pending" or auto-redeploy
- Build should start automatically

---

## 📋 Exact Value to Enter

**Copy this:**
```
services/ai-engine
```

**DO NOT include:**
- ❌ Leading slash: `/services/ai-engine`
- ❌ Trailing slash: `services/ai-engine/`
- ❌ Dot-slash: `./services/ai-engine`

---

## ✅ Verification

After fixing, check build logs:

1. **Build should find:**
   - ✅ `Dockerfile` in `services/ai-engine/`
   - ✅ `requirements.txt` in `services/ai-engine/`
   - ✅ `src/` directory in `services/ai-engine/`

2. **Build logs should show:**
   ```
   [builder 4/5] COPY requirements.txt .
   [stage-1 5/9] COPY src/ ./src/
   ```

3. **No errors about:**
   - ❌ "requirements.txt not found"
   - ❌ "Could not find root directory"

---

## 🎯 Visual Guide

**Before (WRONG):**
```
┌─────────────────────────────────┐
│ Root Directory                   │
│ [ /services/ai-engine ]     ✓ ✗  │
└─────────────────────────────────┘
```

**After (CORRECT):**
```
┌─────────────────────────────────┐
│ Root Directory                   │
│ [ services/ai-engine ]     ✓ ✗  │
└─────────────────────────────────┘
```

**Just remove the `/` at the start!**

---

## 🚀 After Fix

Once Root Directory is correct:
1. Railway will auto-redeploy
2. Build will succeed
3. Service will start
4. Health check will pass

---

**Action:** Go to Railway Dashboard → Settings → Source → Root Directory → Change `/services/ai-engine` to `services/ai-engine` → Save! 🚀

