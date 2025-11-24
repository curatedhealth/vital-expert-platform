# 🔧 RAILWAY ROOT DIRECTORY FIX

**Issue**: Railway can't find `/services/ai-engine` because it's deploying from the monorepo root.

**Solution**: Set the Root Directory in Railway dashboard.

---

## ⚡ QUICK FIX (2 Minutes)

### Step 1: Open Railway Dashboard

```bash
railway open
```

Or visit: https://railway.com/project/1874a0cf-6c1c-4077-a5f1-92567064b3df

### Step 2: Configure Root Directory

1. **Click on your service**: `ai-engine`
2. **Go to**: **Settings** tab (gear icon)
3. **Scroll to**: **Source** section
4. **Find**: **Root Directory** field
5. **Set to**: `services/ai-engine`
6. **Click**: **Deploy** button

---

## 📸 VISUAL GUIDE

```
Railway Dashboard
├── Select Project: vital-ai-engine-v2
├── Select Service: ai-engine
├── Click: Settings ⚙️
└── Source Section:
    ├── Root Directory: [services/ai-engine]  ← SET THIS
    └── Click: Deploy
```

---

## ✅ VERIFICATION

After setting and redeploying, check:

### 1. Build Logs Should Show:

```
✅ Building from: services/ai-engine
✅ Found Dockerfile
✅ Installing Python dependencies
✅ Starting FastAPI
```

### 2. Health Check (Wait 3-5 min):

```bash
curl https://ai-engine-production-1c26.up.railway.app/health
```

**Expected**: `{"status": "healthy", ...}`

---

## 🎯 ALTERNATIVE: Deploy from Monorepo Root

If you want to deploy from the root instead, update the Dockerfile:

**Current Dockerfile**: Assumes it's in `services/ai-engine/`

**For Monorepo Root**: Would need to update paths like:
```dockerfile
COPY services/ai-engine/ /app/
WORKDIR /app
```

**Recommendation**: ✅ **Set Root Directory** (easier and cleaner)

---

## 📋 COMMANDS AFTER FIX

```bash
# Monitor deployment
railway logs --follow

# Check status
railway status

# Test health
curl https://ai-engine-production-1c26.up.railway.app/health

# Test API
curl -X POST https://ai-engine-production-1c26.up.railway.app/api/mode1/manual \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "message": "What is a SaMD?",
    "agent_id": "agent-ra-001",
    "session_id": "test",
    "user_id": "test",
    "enable_rag": true,
    "model": "gpt-4"
  }'
```

---

## 🎊 AFTER SUCCESSFUL DEPLOYMENT

Your AI Engine will be live at:
- **URL**: https://ai-engine-production-1c26.up.railway.app
- **Health**: https://ai-engine-production-1c26.up.railway.app/health
- **RLS**: 41 policies active
- **Modes**: All 4 AI modes ready

---

**ACTION REQUIRED**: 

1. Run: `railway open`
2. Settings → Source → Root Directory: `services/ai-engine`
3. Click: Deploy

**TIME**: 2 minutes to configure + 3-5 minutes to build

---

*Generated: November 3, 2025*  
*Status: Configuration Fix Needed*

