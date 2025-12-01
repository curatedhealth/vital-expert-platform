# Manual Root Directory Setup

## Issue

Railway's suggested directories don't show `services/ai-engine`, but it EXISTS on GitHub.

**Solution:** Type it manually!

---

## 🔧 Step-by-Step Fix

### Step 1: Find Root Directory Field

In Railway Dashboard:
1. Project: `vital-ai-engine-v2`
2. Service: `vital-ai-engine`
3. Tab: **Settings**
4. Section: **Source** (right sidebar)
5. Find: **Root Directory** field

---

### Step 2: Clear Current Value

1. Click in the **Root Directory** input field
2. Current value: `/` (or `/service`)
3. **Select all text** (Cmd+A or Ctrl+A)
4. **Delete it** (so field is empty)

---

### Step 3: Type Manually

Type exactly this (no trailing slash):

```
services/ai-engine
```

**NOT:**
- ❌ `/services/ai-engine` (no leading slash)
- ❌ `services/ai-engine/` (no trailing slash)
- ❌ `./services/ai-engine` (no ./)

**YES:**
- ✅ `services/ai-engine` (correct!)

---

### Step 4: Save

1. Click the ✓ (checkmark) button next to the field
2. Or press Enter
3. Railway will show "Apply 1 change" at the top
4. Click **"Deploy"** or **"Apply 1 change"**

---

## 🎯 Visual Guide

**Before:**
```
Root Directory: [ /              ] ✓ ✗
```

**After typing:**
```
Root Directory: [ services/ai-engine  ] ✓ ✗
```

**Then click ✓**

---

## ✅ Verification

After saving, Railway will:
1. Show "1 Change" pending
2. Auto-redeploy (or click "Deploy")
3. In build logs, you should see it finds:
   - `Dockerfile` ✅
   - `requirements.txt` ✅
   - `src/` directory ✅

---

## 🔍 If It Doesn't Work

### Check GitHub Connection

1. Verify **Source Repo** shows: `curatedhealth/vital-expert-platform`
2. If it says "Problem processing request", reconnect:
   - Click **"Disconnect"**
   - Reconnect to GitHub repo
   - Select branch: `restructure/world-class-architecture`

### Verify Branch

Ensure branch is set to:
```
restructure/world-class-architecture
```

---

## 📋 Exact Value to Enter

```
services/ai-engine
```

**Copy-paste this into the Root Directory field!** ✅

---

**Action:** Type `services/ai-engine` manually in Root Directory field → Click ✓ → Deploy! 🚀

