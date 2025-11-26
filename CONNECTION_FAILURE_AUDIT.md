# 🔍 Connection Failure Audit Report

**Date**: November 24, 2025
**Issue**: "Cannot connect to the workflow execution service"
**Status**: 🔴 **CRITICAL - API Endpoint Mismatch**

---

## 🎯 Root Cause Analysis

### **Problem Summary**
The frontend Next.js API routes are trying to connect to **non-existent backend endpoints**. The URL paths don't match between frontend and backend.

---

## 📊 Detailed Findings

### 1. ✅ **Python AI Engine Status**
- **Status**: ✅ **RUNNING**
- **Process**: Python (PID 54345) listening on port 8000
- **Health Check**: `curl http://localhost:8000/` → ✅ Returns `{"service":"vital-path-ai-services","version":"2.0.0","status":"running"}`
- **Docs Available**: http://localhost:8000/docs

**Evidence**:
```bash
$ ps aux | grep python
Python  54345 amine  ... *:8000 (LISTEN)

$ curl http://localhost:8000/
{"service":"vital-path-ai-services","version":"2.0.0","status":"running","health":"/health","docs":"/docs"}
```

### 2. 🔴 **Endpoint Mismatch (CRITICAL)**

#### **Frontend Calls**:
```typescript
// File: apps/vital-system/src/app/api/langgraph-gui/execute/route.ts
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
response = await fetch(`${AI_ENGINE_URL}/langgraph-gui/execute`, { ... })
//                                        ^^^^^^^^^^^^^^^^^^^^^^^^
//                                        ❌ This endpoint does NOT exist!
```

#### **Backend Reality**:
```bash
$ curl http://localhost:8000/openapi.json | grep paths

Available endpoints:
✅ /frameworks/langgraph/execute   (EXISTS)
❌ /langgraph-gui/execute          (DOES NOT EXIST)
```

**Impact**: Frontend gets 404 Not Found, interprets as "service not running"

---

## 🗺️ Complete Endpoint Mapping

### **Backend Endpoints (FastAPI)**
Based on OpenAPI spec (`http://localhost:8000/openapi.json`):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/frameworks/langgraph/execute` | POST | ✅ Execute LangGraph workflows |
| `/frameworks/autogen/execute` | POST | ✅ Execute AutoGen workflows |
| `/frameworks/crewai/execute` | POST | ✅ Execute CrewAI workflows |
| `/api/mode1/manual` | POST | ✅ Mode 1 manual agent selection |
| `/api/mode2/automatic` | POST | ✅ Mode 2 automatic agent selection |
| `/api/mode3/autonomous-automatic` | POST | ✅ Mode 3 autonomous + automatic |
| `/api/mode4/autonomous-manual` | POST | ✅ Mode 4 autonomous + manual |
| `/api/v1/panels/execute` | POST | ✅ Execute panel workflows |
| `/api/panel/orchestrate` | POST | ✅ Panel orchestration |
| `/api/v1/panels/templates` | GET | ✅ Get panel templates |

### **Frontend API Routes (Next.js)**
Located in `apps/vital-system/src/app/api/`:

| Frontend Route | Calls Backend | Status |
|----------------|---------------|--------|
| `/api/langgraph-gui/execute` | `/langgraph-gui/execute` | ❌ Wrong URL |
| `/api/langgraph-gui/panels/execute` | `/langgraph-gui/panels/execute` | ❌ Wrong URL |
| `/api/frameworks/langgraph/execute` | `/frameworks/langgraph/execute` | ✅ Correct (if exists) |
| `/api/frameworks/autogen/execute` | `/frameworks/autogen/execute` | ✅ Correct |
| `/api/frameworks/crewai/execute` | `/frameworks/crewai/execute` | ✅ Correct |

---

## 🔧 Issues Identified

### **Issue #1: Wrong Backend URL Path**
**Severity**: 🔴 **CRITICAL**

**File**: `apps/vital-system/src/app/api/langgraph-gui/execute/route.ts` (line 46)

**Current (WRONG)**:
```typescript
response = await fetch(`${AI_ENGINE_URL}/langgraph-gui/execute`, {
```

**Should Be**:
```typescript
response = await fetch(`${AI_ENGINE_URL}/frameworks/langgraph/execute`, {
```

---

### **Issue #2: Panel Execute Endpoint Mismatch**
**Severity**: 🔴 **CRITICAL**

**File**: `apps/vital-system/src/app/api/langgraph-gui/panels/execute/route.ts`

**Current**:
```typescript
await fetch(`${AI_ENGINE_URL}/langgraph-gui/panels/execute`, {
```

**Should Be**:
```typescript
await fetch(`${AI_ENGINE_URL}/api/v1/panels/execute`, {
```

---

### **Issue #3: Environment Variable Not Loaded**
**Severity**: 🟡 **MEDIUM**

**Investigation**:
```typescript
// apps/vital-system/src/app/api/langgraph-gui/execute/route.ts:12
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
```

**Problem**: In Next.js, server-side API routes only see variables prefixed with `NEXT_PUBLIC_` if accessed client-side, OR non-prefixed variables if server-side.

**Current `.env.local`**:
```bash
NEXT_PUBLIC_PYTHON_AI_ENGINE_URL=http://localhost:8000   # ✅ For client components
AI_ENGINE_URL=http://localhost:8000                       # ✅ For API routes
```

**Status**: ✅ Correct configuration, but need to verify loading

---

### **Issue #4: Request Schema Mismatch**
**Severity**: 🟠 **HIGH**

**Frontend Sends**:
```typescript
{
  query: string,
  openai_api_key: string,
  pinecone_api_key?: string,
  provider?: 'openai' | 'ollama',
  enabled_agents: string[]
}
```

**Backend Expects** (ExecutionRequest schema):
```python
# Need to verify exact schema from OpenAPI spec
```

**Action Required**: Check if request body matches backend expectations

---

## 🔬 Environment Variable Verification

### **Check 1: Frontend Environment**

**File**: `.env.local` (line 76-77)
```bash
NEXT_PUBLIC_PYTHON_AI_ENGINE_URL=http://localhost:8000
AI_ENGINE_URL=http://localhost:8000
```
✅ **Status**: Correctly configured

### **Check 2: Backend Environment**

**File**: `services/ai-engine/.env` or environment
```bash
# Backend doesn't need AI_ENGINE_URL (it IS the AI engine)
# But needs other vars like:
SUPABASE_URL=...
OPENAI_API_KEY=...
```

---

## 🧪 Connectivity Tests

### **Test 1: Backend Health**
```bash
$ curl http://localhost:8000/health
```
**Expected**: `{"status": "healthy", ...}`
**Actual**: ✅ **PASS**

### **Test 2: LangGraph Execute Endpoint**
```bash
$ curl -X POST http://localhost:8000/frameworks/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "workflow": {}}'
```
**Expected**: Valid response or validation error
**Actual**: Need to test

### **Test 3: Panel Templates Endpoint**
```bash
$ curl http://localhost:8000/api/v1/panels/templates
```
**Expected**: Array of 6 panel templates
**Actual**: Need to test

---

## 📋 CORS Configuration Check

**File**: `services/ai-engine/src/main.py` (line 660-672)

```python
cors_origins = (
    settings.cors_origins if isinstance(settings.cors_origins, list)
    else (settings.cors_origins.split(",") if isinstance(settings.cors_origins, str)
          else ["http://localhost:3000", "http://localhost:3001"])
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "x-tenant-id", "x-user-id"],
)
```

✅ **Status**: CORS properly configured for localhost:3000

---

## 🛠️ Fix Implementation Plan

### **Priority 1: Fix Endpoint URLs**

#### **Fix #1: Update execute route**
**File**: `apps/vital-system/src/app/api/langgraph-gui/execute/route.ts`

**Change line 46**:
```typescript
// OLD
response = await fetch(`${AI_ENGINE_URL}/langgraph-gui/execute`, {

// NEW
response = await fetch(`${AI_ENGINE_URL}/frameworks/langgraph/execute`, {
```

#### **Fix #2: Update panel execute route**
**File**: `apps/vital-system/src/app/api/langgraph-gui/panels/execute/route.ts`

**Find and replace**:
```typescript
// OLD
await fetch(`${AI_ENGINE_URL}/langgraph-gui/panels/execute`, {

// NEW
await fetch(`${AI_ENGINE_URL}/api/v1/panels/execute`, {
```

### **Priority 2: Verify Request Schemas**

Check that frontend request bodies match backend expectations for:
- `/frameworks/langgraph/execute`
- `/api/v1/panels/execute`

### **Priority 3: Test End-to-End**

1. Restart Next.js dev server (to reload .env.local)
2. Ensure Python AI Engine is running
3. Test mode execution from UI
4. Test panel execution from UI

---

## ✅ Verification Checklist

- [x] Python AI Engine is running on port 8000
- [x] Backend health endpoint responds
- [x] OpenAPI spec lists available endpoints
- [x] CORS configured for localhost:3000
- [x] Environment variables set in .env.local
- [ ] Frontend endpoints updated to match backend
- [ ] Request schemas validated
- [ ] End-to-end test successful

---

## 📝 Summary

### **Root Cause**
The frontend is calling `/langgraph-gui/*` endpoints that don't exist. The backend has `/frameworks/langgraph/*` and `/api/v1/panels/*` instead.

### **Impact**
- ❌ Mode execution fails with "Cannot connect" error
- ❌ Panel execution fails with same error
- ✅ Backend is running and healthy
- ✅ CORS is configured correctly
- ✅ Environment variables are set

### **Solution**
Update 2 frontend files to use correct backend endpoint paths:
1. `langgraph-gui/execute/route.ts` → use `/frameworks/langgraph/execute`
2. `langgraph-gui/panels/execute/route.ts` → use `/api/v1/panels/execute`

### **Estimated Fix Time**: 5-10 minutes

---

**Report Generated**: November 24, 2025
**Audited Services**: Frontend API routes, Backend FastAPI endpoints, Environment config, CORS, Connectivity
