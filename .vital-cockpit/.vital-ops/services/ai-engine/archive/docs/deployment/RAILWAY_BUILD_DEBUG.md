# 🔍 Railway Build Debugging

## Current Status

**Error:** Service failing (29 seconds ago)  
**Dockerfile Path:** `./Dockerfile` (in Railway settings)  
**Watch Paths:** `/services/ai-engine`  
**Config Source:** `services/ai-engine/railway.toml`

---

## 🔍 Check Railway Logs

The most important thing is to see the **actual error message** from Railway logs.

**Run:**
```bash
cd services/ai-engine
railway logs --tail 100
```

**Look for:**
- Dockerfile not found errors
- Build failures
- Path errors
- Dependency errors

---

## 🎯 Common Issues & Fixes

### Issue 1: Dockerfile Path Format

**Current in Railway:** `./Dockerfile`  
**Try:** Just `Dockerfile` (remove `./`)

**In Railway Dashboard:**
1. Settings → Build
2. Change Dockerfile Path: `./Dockerfile` → `Dockerfile`
3. Save and redeploy

---

### Issue 2: Root Directory Still Wrong

**Verify in Railway Dashboard:**
1. Settings → Source
2. Root Directory should be: `services/ai-engine` (NO leading slash)
3. If it's `/services/ai-engine` → Remove leading `/`

---

### Issue 3: Railway Reading Wrong Config

Railway shows: "The value is set in services/ai-engine/railway.toml"

**Check railway.toml:**
- Dockerfile path should be: `Dockerfile` (not `./Dockerfile`)
- Builder should be: `DOCKERFILE`

**If Railway Dashboard shows `./Dockerfile`:**
- It's reading from railway.toml
- Update railway.toml to use `Dockerfile` (no `./`)
- Push to GitHub
- Railway should auto-update

---

## 🚀 Quick Fix Steps

1. **Update railway.toml:**
   - Change `dockerfilePath = "./Dockerfile"` to `dockerfilePath = "Dockerfile"`
   - Commit and push

2. **Or manually in Railway Dashboard:**
   - Settings → Build
   - Dockerfile Path: Change from `./Dockerfile` to `Dockerfile`
   - Save

3. **Verify Root Directory:**
   - Settings → Source
   - Root Directory = `services/ai-engine` (no `/` prefix)

4. **Redeploy**

---

## 📋 Next Steps

1. Check Railway logs for the exact error
2. Fix Dockerfile path (try `Dockerfile` without `./`)
3. Verify Root Directory is correct
4. Redeploy

---

**Action:** Check Railway logs first to see the actual error message! 🔍

