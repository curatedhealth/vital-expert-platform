# Railway CLI Deployment Guide

## ⚠️ Limitation

**Railway CLI cannot configure:**
- Root Directory (must be set in Dashboard)
- Dockerfile Path (must be set in Dashboard)

**Railway CLI can:**
- ✅ View logs
- ✅ Redeploy (but requires interactive terminal)
- ✅ Upload/deploy code
- ✅ View status

---

## 🔧 Current Issue

**Error:** `Dockerfile 'Dockerfile' does not exist`

**Root Cause:** Railway can't find Dockerfile despite correct configuration.

**This is a Railway Dashboard configuration issue**, not something CLI can fix.

---

## ✅ What CLI Can Do

### Monitor Deployment

```bash
cd services/ai-engine
railway logs --tail 100
railway status
```

### Trigger Redeploy (via Git Push)

```bash
git add -A
git commit -m "trigger: Redeploy"
git push origin restructure/world-class-architecture
```

Railway will auto-detect the push and redeploy.

---

## 🎯 Solution: Dashboard Configuration

**The fix must be done in Railway Dashboard:**

1. **Settings → Source:**
   - Root Directory = `services/ai-engine` ✅

2. **Settings → Build:**
   - Dockerfile Path = `Dockerfile` (or leave blank for auto-detect)
   - If blank doesn't work, try: `services/ai-engine/Dockerfile` (full path from repo root)

3. **Save and Redeploy**

---

## 📋 Alternative: railway.toml Location

Railway might expect `railway.toml` at the **repository root**, not in `services/ai-engine/`.

**Try:**
1. Copy `services/ai-engine/railway.toml` to repository root
2. Or configure explicitly in Dashboard (recommended)

---

**Status:** CLI can't configure Railway settings. Must use Dashboard for Root Directory and Dockerfile Path configuration. 🔧

