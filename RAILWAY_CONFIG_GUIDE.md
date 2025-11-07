# RAILWAY BACKEND CONFIGURATION GUIDE

**Issue**: Frontend trying to connect to `localhost:4000` but needs Railway backend
**Status**: Need to update `.env.local` with Railway URLs

---

## 🔍 CURRENT CONFIGURATION

**From `.env.local`**:
```
API_GATEWAY_URL=http://localhost:4000
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000
```

**Mode 1 Handler** uses:
```typescript
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:3001'; // Default fallback
```

**Current behavior**: Using `localhost:4000` (not Railway)

---

## ✅ SOLUTION: UPDATE .env.local

### Step 1: Get Your Railway URLs

You need:
1. **API Gateway URL** (Railway) - e.g., `https://your-gateway.railway.app`
2. **AI Engine URL** (Railway) - e.g., `https://your-ai-engine.railway.app`

### Step 2: Update `.env.local`

**File**: `apps/digital-health-startup/.env.local`

**Replace**:
```bash
API_GATEWAY_URL=http://localhost:4000
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000
```

**With**:
```bash
# Railway Backend (Production)
API_GATEWAY_URL=https://your-gateway.railway.app
NEXT_PUBLIC_API_GATEWAY_URL=https://your-gateway.railway.app

# AI Engine (if needed separately)
PYTHON_AI_ENGINE_URL=https://your-ai-engine.railway.app
```

### Step 3: Restart Dev Server

```bash
# Kill current server
lsof -ti:3000 | xargs kill -9

# Restart with new env
cd apps/digital-health-startup
PORT=3000 npm run dev
```

---

## 📋 MODE 1 ARCHITECTURE

```
Frontend (localhost:3000)
    ↓
POST /api/ask-expert/orchestrate
    ↓
mode1-manual-interactive.ts
    ↓
fetch(`${API_GATEWAY_URL}/api/mode1/manual`)
    ↓
Railway API Gateway (your-gateway.railway.app)
    ↓
Railway AI Engine (your-ai-engine.railway.app)
    ↓
Response streams back
```

---

## 🎯 WHAT TO UPDATE

**File**: `.env.local`

**Add/Update**:
```bash
# Railway Backend
API_GATEWAY_URL=https://YOUR-RAILWAY-GATEWAY-URL.railway.app
NEXT_PUBLIC_API_GATEWAY_URL=https://YOUR-RAILWAY-GATEWAY-URL.railway.app

# Optional: Direct AI Engine (if bypassing gateway)
PYTHON_AI_ENGINE_URL=https://YOUR-RAILWAY-AI-ENGINE-URL.railway.app
```

---

## 🔍 HOW TO FIND YOUR RAILWAY URLs

1. **Go to Railway Dashboard**
2. **Find your API Gateway service**
3. **Copy the public URL** (e.g., `https://api-gateway-production-xxxx.up.railway.app`)
4. **Find your AI Engine service**
5. **Copy the public URL** (e.g., `https://ai-engine-production-xxxx.up.railway.app`)

---

## ✅ VERIFICATION

After updating `.env.local` and restarting:

1. **Check console logs**:
   ```
   [Mode1] Calling AI Engine: https://your-gateway.railway.app/api/mode1/manual
   ```

2. **Test Mode 1**:
   - Select agent
   - Send query
   - Should connect to Railway ✅

---

## 🚨 COMMON ISSUES

### Issue 1: Still using localhost
**Cause**: `.env.local` not reloaded
**Fix**: Restart dev server

### Issue 2: CORS error
**Cause**: Railway not allowing localhost:3000
**Fix**: Add CORS headers in Railway API Gateway

### Issue 3: 404 Not Found
**Cause**: Wrong Railway URL or wrong endpoint
**Fix**: Verify Railway URL and endpoint path

---

**Please provide your Railway API Gateway URL and I'll help you update the config!** 🚀

