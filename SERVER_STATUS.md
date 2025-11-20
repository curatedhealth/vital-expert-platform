# 🚀 VITAL Mode 1 - Server Status & Quick Start

## Current Status

### ✅ Frontend Running
- **App**: vital-system
- **URL**: http://vital-system.localhost:3001/ask-expert
- **Port**: 3001
- **Status**: ✅ WORKING

### ⚠️ Backend Issues
- **Port**: 8080
- **Status**: ❌ NOT RESPONDING (import errors being fixed)
- **Issue**: Python dependency compatibility (Pydantic v2 migration)

---

## 🛠️ Quick Fix & Restart

### Step 1: Fix Remaining Import Errors

The backend has Pydantic v2 migration issues. Run this:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# Find all files using old pydantic imports
grep -r "from pydantic import BaseSettings" src/ 

# They need to be changed to:
# from pydantic_settings import BaseSettings
```

### Step 2: Kill All Servers

```bash
pkill -9 -f "uvicorn"
pkill -9 -f "next dev"
```

### Step 3: Start Backend (Terminal 1)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
export PYTHONPATH="${PWD}/src"
python3 -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8080
```

### Step 4: Start Frontend (Terminal 2)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/vital-system"
npm run dev
```

---

## ✅ Access the App

Once both servers are running:

**Frontend**: http://vital-system.localhost:3001/ask-expert

(Note: Port 3001 because 3000 was in use)

---

## 🐛 Current Known Issues

### 1. Backend Import Errors
**Error**: `BaseSettings has been moved to pydantic-settings`

**Files to fix**:
```bash
services/ai-engine/src/core/rag_config.py ✅ FIXED
services/ai-engine/src/core/settings.py (if exists) ❌ CHECK
services/ai-engine/src/api/routes/*.py (any others) ❌ CHECK
```

**Fix**:
```python
# OLD (Pydantic v1)
from pydantic import BaseSettings, Field

# NEW (Pydantic v2)
from pydantic_settings import BaseSettings
from pydantic import Field
```

### 2. Frontend Error
**Error**: "Failed to fetch user agents: Service Unavailable"

**Cause**: Backend not responding yet

**Solution**: Fix backend imports first, then restart

---

## 📝 Environment Variables

### Backend (.env.local) ✅ CONFIGURED
```bash
PORT=8080
SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-proj-cAM5gtLayHANkHy2wUMi...
PINECONE_API_KEY=pcsk_5hYvkJ...
```

### Frontend (.env.local) ❌ NEEDS CREATION
Create: `apps/vital-system/.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AI_ENGINE_URL=http://localhost:8080
NEXT_PUBLIC_TENANT_ID=vital-system
NEXT_PUBLIC_APP_URL=http://vital-system.localhost:3001
```

---

##  📊 Verification Commands

```bash
# Check backend
curl http://localhost:8080/health

# Check frontend  
curl http://localhost:3001

# Check subdomain resolution
ping vital-system.localhost

# Check processes
ps aux | grep -E "(uvicorn|next)" | grep -v grep

# Check ports
lsof -i:8080 -i:3001
```

---

## 🎯 Next Steps

1. ✅ Fix all Pydantic import errors in backend
2. ✅ Restart backend successfully
3. ✅ Create frontend `.env.local` for vital-system
4. ✅ Test Mode 1 end-to-end
5. ✅ Verify multi-tenant isolation

---

## 📞 Quick Test

Once servers are running:

```bash
# Open in browser
open http://vital-system.localhost:3001/ask-expert

# Test backend API
curl -X POST http://localhost:8080/api/mode1/interactive \
  -H "Content-Type: application/json" \
  -d '{"session_id": null, "agent_id": "test", "message": "Hello"}'
```

---

**Status**: Backend needs Pydantic v2 migration fixes  
**Priority**: Fix import errors in all Python files  
**ETA**: 5-10 minutes once imports are fixed



