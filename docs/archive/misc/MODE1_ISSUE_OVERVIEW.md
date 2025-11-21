# Mode 1 Issue Overview & Fixes Attempted

**Date:** 2025-01-27  
**Status:** ❌ Still Not Working - Empty Response  
**Agent:** Biomarker Strategy Advisor  
**Mode:** Mode 1 (Manual Interactive)

---

## 🐛 Current Issue

### Primary Symptom
**Empty AI Response** - The agent returns an empty response with no content, sources, or tools used.

### Console Evidence (from browser)
```
Content length: 0
Content preview: (empty)
Has sources: 0
Has reasoning: 0
Is streaming: false
Has branches: 1

Full metadata:
- ragSummary: { totalSources: 0, domains: ["Digital Health", "Regulatory Affairs"], cacheHit: false }
- toolSummary: { allowed: ["calculator", "database_query", "web_search"], used: [], totals: {calls: 0, success: 0, failure: 0, totalTimeMs: 0} }
- sources: []
- reasoning: []
```

### Frontend Logs
```
[Mode1] Calling AI Engine directly: http://localhost:8000/api/mode1/manual
[Mode1] Base URL: http://localhost:8000 | AI Engine URL: http://localhost:8000
```

**Problem:** Frontend is calling `localhost:8000` but AI Engine is running on `localhost:8080`

**Note:** Code shows `AI_ENGINE_URL = 'http://localhost:8080'` (line 61), but logs show port 8000. This suggests:
- Environment variable `PYTHON_AI_ENGINE_URL` or `NEXT_PUBLIC_PYTHON_AI_ENGINE_URL` is set to port 8000
- Frontend wasn't restarted after code change
- Cached/compiled version is being used

---

## 🔍 Root Cause Analysis

### Issues Identified

1. **Port Mismatch** ⚠️ **CRITICAL**
   - Frontend Mode 1 service hardcoded to `localhost:8000`
   - AI Engine running on `localhost:8080`
   - **Result:** Requests fail or timeout

2. **Empty Response Extraction**
   - Workflow may be returning content but in wrong state key
   - Need to check `agent_response`, `response`, `final_response`

3. **RAG Not Retrieving Sources**
   - `totalSources: 0` despite RAG enabled
   - Domains configured: ["Digital Health", "Regulatory Affairs"]
   - **Possible causes:**
     - Domain namespace mapping not working
     - Pinecone namespace not synced
     - Supabase query failing

4. **Tools Not Executing**
   - `used: []` - no tools called despite being allowed
   - Tools available: ["calculator", "database_query", "web_search"]
   - **Possible causes:**
     - Tool registry not initialized
     - Tool names mismatch
     - Tool execution failing silently

---

## ✅ Fixes Attempted

### 1. Port Mismatch Fix
**File:** `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts`

**Change:**
```typescript
// Before
const AI_ENGINE_URL = 'http://localhost:8000';

// After
const AI_ENGINE_URL = 'http://localhost:8080';
```

**Status:** ⚠️ **PARTIALLY FIXED** - Code shows port 8080 (line 61), but logs show port 8000

**Issue:** 
- Code change was applied (line 61 shows `'http://localhost:8080'`)
- But frontend logs show it's calling port 8000
- **Possible causes:**
  1. Environment variable `PYTHON_AI_ENGINE_URL` or `NEXT_PUBLIC_PYTHON_AI_ENGINE_URL` is set to `http://localhost:8000`
  2. Frontend wasn't restarted after code change
  3. Next.js cached/compiled version is being used
  4. There's another code path that's being used

**Action Needed:** Check environment variables and restart frontend with cache clear

---

### 2. Conversation History Fix
**File:** `services/ai-engine/src/main.py`

**Change:**
```python
# Before
conversation_history=[]

# After
conversation_history=request.conversation_history or []
```

**Status:** ✅ Fixed

---

### 3. Empty Response Extraction Fix
**File:** `services/ai-engine/src/main.py`

**Change:**
```python
# Before
content = result.get('response', '') or result.get('final_response', '')

# After
content = result.get('agent_response', '') or result.get('response', '') or result.get('final_response', '')
```

**Status:** ✅ Fixed

---

### 4. Sources/Citations Fix
**File:** `services/ai-engine/src/main.py`

**Change:**
```python
# Before
sources = result.get('sources', [])

# After
sources = result.get('citations', []) or result.get('sources', [])
if not sources and result.get('retrieved_documents'):
    # Convert retrieved_documents to sources format
    sources = [...]
```

**Status:** ✅ Fixed

---

### 5. Tool Registry Initialization Fix
**File:** `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

**Change:**
```python
# Added check for tool_registry initialization
if not hasattr(self, 'tool_registry') or not self.tool_registry:
    logger.warning("Tool registry not initialized, skipping tool execution")
    break
```

**Status:** ✅ Fixed

---

### 6. Format Output Node Fix
**File:** `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

**Change:**
```python
# Added citations conversion from retrieved_documents
if result.get('retrieved_documents'):
    citations = [...]
    result['citations'] = citations
```

**Status:** ✅ Fixed

---

### 7. Indentation Error Fix
**File:** `services/ai-engine/src/services/unified_rag_service.py`

**Issue:** IndentationError at lines 63-87

**Fix:** Corrected indentation for Pinecone initialization block

**Status:** ✅ Fixed

---

### 7. Uvicorn Bootstrap Fix ✅ **NEW**
**File:** `services/ai-engine/src/main.py` (line 2474)

**Issue:** Uvicorn bootstrap was hardcoded to port 8000, ignoring `PORT` environment variable

**Fix:** Updated uvicorn bootstrap to read from environment variables:
- `PORT` (default: 8000, now can be set to 8080)
- `HOST` (default: 0.0.0.0)
- `LOG_LEVEL` (from environment)
- `UVICORN_RELOAD` (default: enabled, set to `false` to disable)

**Change:**
```python
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    log_level = os.getenv("LOG_LEVEL", "info")
    reload_env = os.getenv("UVICORN_RELOAD", "true").lower()
    reload_enabled = reload_env not in {"0", "false", "no"}

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload_enabled,
        log_level=log_level,
    )
```

**Status:** ✅ Fixed in code (line 2474)

**Launch Instructions:**
```bash
# Kill existing processes
lsof -ti :8000 -sTCP:LISTEN | xargs kill 2>/dev/null || true

# From services/ai-engine directory
cd services/ai-engine
source venv/bin/activate
export PORT=8080
python src/main.py

# Verify log shows: "Uvicorn running on http://0.0.0.0:8080"
```

**Note:** 
- The log should now say "Uvicorn running on http://0.0.0.0:8080"
- Restart Next.js dev server so updated `NEXT_PUBLIC_PYTHON_AI_ENGINE_URL` is picked up
- Redis/Supabase/Pinecone warnings in logs are from missing services or invalid keys; they won't prevent the port fix, but need to be sorted separately to restore RAG and tooling functionality

---

## 🖥️ Current Server Status

### AI Engine
- **Port:** 8080
- **Status:** ✅ Running and Healthy
- **Health Check:** `http://localhost:8080/health` returns:
  ```json
  {
    "status": "healthy",
    "service": "vital-path-ai-services",
    "version": "2.0.0",
    "services": {
      "supabase": "healthy",
      "agent_orchestrator": "healthy",
      "rag_pipeline": "healthy",
      "unified_rag_service": "healthy"
    },
    "ready": true
  }
  ```

### Frontend
- **Port:** 3000
- **Status:** ✅ Running
- **Access:** `http://localhost:3000`

---

## 🔗 Request Flow

### Current Flow (Broken)
```
Frontend (Mode 1) 
  → http://localhost:8000/api/mode1/manual  ❌ (Wrong port)
  → Timeout or connection error
  → Empty response
```

### Expected Flow
```
Frontend (Mode 1)
  → http://localhost:8080/api/mode1/manual  ✅ (Correct port)
  → AI Engine processes request
  → Returns response with content, sources, tools
```

---

## 📋 Files Modified

### Frontend
1. `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts`
   - Changed port from 8000 to 8080

### Backend
1. `services/ai-engine/src/main.py`
   - Fixed conversation history passing
   - Fixed response extraction (multiple keys)
   - Fixed sources/citations conversion

2. `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`
   - Fixed tool registry initialization check
   - Fixed format_output_node to include citations

3. `services/ai-engine/src/services/unified_rag_service.py`
   - Fixed indentation error

---

## 🔍 Debugging Steps Taken

1. ✅ Killed all servers and restarted
2. ✅ Fixed indentation error preventing AI Engine from starting
3. ✅ Verified AI Engine health endpoint
4. ✅ Verified frontend is running
5. ✅ Checked console logs for error messages
6. ⚠️ **NOT VERIFIED:** Frontend actually using port 8080 (logs show 8000)

---

## 🚨 Remaining Issues

### Critical
1. **Port Mismatch - FIXED IN CODE** ✅
   - **UPDATE:** Uvicorn bootstrap in `services/ai-engine/src/main.py` (line 2474) now reads `PORT`, `HOST`, `LOG_LEVEL`, and `UVICORN_RELOAD` from environment variables
   - **Fix:** Export `PORT=8080` before running `python src/main.py`
   - **Action needed:** 
     - Kill existing processes on port 8000
     - Start AI Engine with `export PORT=8080 && python src/main.py`
     - Restart Next.js dev server to pick up updated `NEXT_PUBLIC_PYTHON_AI_ENGINE_URL`

2. **Empty Response**
   - Even if port is fixed, response is empty
   - Need to trace workflow execution to see where content is lost

### Medium Priority
3. **RAG Not Working**
   - No sources retrieved despite domains configured
   - Need to check:
     - Domain namespace mappings in Pinecone
     - Supabase document_chunks table
     - RAG service query logic

4. **Tools Not Executing**
   - Tools allowed but not used
   - Need to check:
     - Tool registry initialization
     - Tool name matching
     - Tool execution logic

---

## 🧪 Testing Attempted

### Integration Tests
- **Status:** ⏸️ SKIPPED
- **Reason:** Test has `pytestmark` decorator that skips if `OPENAI_API_KEY` not set
- **Issue:** Even with `OPENAI_API_KEY` set, test is still skipped (pytest evaluation order)

### Manual Testing
- **Status:** ❌ Not Working
- **Result:** Empty response, no sources, no tools

---

## 📝 Environment Variables

### Required for AI Engine
- `OPENAI_API_KEY` ✅ (set)
- `SUPABASE_URL` ✅ (set)
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (set)
- `PINECONE_API_KEY` ✅ (set)
- `PINECONE_AGENTS_INDEX_NAME` ✅ (set: vital-knowledge)
- `PINECONE_RAG_INDEX_NAME` ✅ (set: vital-rag-production)
- `PORT` ✅ (set: 8080)

### Frontend Environment Variables (Check These!)
**⚠️ CRITICAL:** These may be overriding the code default:

- `PYTHON_AI_ENGINE_URL` - If set to `http://localhost:8000`, will override code
- `NEXT_PUBLIC_PYTHON_AI_ENGINE_URL` - If set to `http://localhost:8000`, will override code

**Check command:**
```bash
# Check .env.local or .env.vercel
grep -E "PYTHON_AI_ENGINE_URL|NEXT_PUBLIC_PYTHON_AI_ENGINE_URL" apps/digital-health-startup/.env.local
grep -E "PYTHON_AI_ENGINE_URL|NEXT_PUBLIC_PYTHON_AI_ENGINE_URL" apps/digital-health-startup/.env.vercel
```

**Fix:** Either:
1. Remove these variables from .env files (let code default to 8080)
2. Or set them to `http://localhost:8080`
3. Restart frontend after changing

---

## 🔧 Next Steps for Debugging

### 1. ✅ Start AI Engine on Port 8080 (FIXED)
```bash
# Kill existing processes
lsof -ti :8000 -sTCP:LISTEN | xargs kill 2>/dev/null || true
lsof -ti :8080 -sTCP:LISTEN | xargs kill 2>/dev/null || true

# From services/ai-engine directory
cd services/ai-engine
source venv/bin/activate
export PORT=8080
python src/main.py

# Verify log shows: "Uvicorn running on http://0.0.0.0:8080"
```

### 2. Verify Frontend Environment Variables
```bash
# Check environment variables (CRITICAL!)
grep -E "PYTHON_AI_ENGINE_URL|NEXT_PUBLIC_PYTHON_AI_ENGINE_URL" apps/digital-health-startup/.env.local
grep -E "PYTHON_AI_ENGINE_URL|NEXT_PUBLIC_PYTHON_AI_ENGINE_URL" apps/digital-health-startup/.env.vercel

# Should be set to: http://localhost:8080
# If set to port 8000, update to 8080 or remove (let code default)

# Clear Next.js cache and restart
cd apps/digital-health-startup
rm -rf .next
npm run dev
```

### 3. Check AI Engine Logs
```bash
# Check AI Engine logs for incoming requests
tail -f /tmp/ai-engine.log | grep "mode1/manual"

# Should show requests coming in
# If no requests, port mismatch confirmed
```

### 4. Test Direct API Call
```bash
curl -X POST http://localhost:8080/api/mode1/manual \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: vital-default-tenant" \
  -d '{
    "agent_id": "8a75445b-f3f8-4cf8-9a6b-0265aeab9caa",
    "message": "What are the key requirements for FDA IND submission?",
    "enable_rag": true,
    "enable_tools": true,
    "session_id": "test-session-123",
    "user_id": "test-user-123",
    "tenant_id": "vital-default-tenant"
  }'
```

### 5. Check Workflow Execution
- Add logging to `mode1_manual_workflow.py` to trace state changes
- Check if `agent_response` is being set
- Check if RAG retrieval is happening
- Check if tool execution is happening

### 6. Check RAG Service
- Verify domain namespace mappings are loaded
- Check if Pinecone namespaces exist for "digital-health" and "regulatory-affairs"
- Verify Supabase has document chunks for these domains

---

## 📊 Code Locations

### Frontend Mode 1 Service
- **File:** `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts`
- **Line 61:** AI Engine URL configuration

### Backend Mode 1 Endpoint
- **File:** `services/ai-engine/src/main.py`
- **Line ~842:** `/api/mode1/manual` endpoint

### Mode 1 Workflow
- **File:** `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`
- **Class:** `Mode1ManualWorkflow`

### RAG Service
- **File:** `services/ai-engine/src/services/unified_rag_service.py`
- **Class:** `UnifiedRAGService`

---

## 💡 Hypothesis

**Primary Hypothesis:** Port mismatch is preventing requests from reaching the AI Engine, causing timeout and empty response.

**Secondary Hypothesis:** Even if port is fixed, workflow execution may be failing silently, returning empty state.

**Tertiary Hypothesis:** RAG and tools are not being called due to initialization or configuration issues.

---

## 📎 Related Files

- `MODE1_ROOT_CAUSE_ANALYSIS.md` - Previous root cause analysis
- `MODE1_RESTART_AND_TEST_SUMMARY.md` - Server restart summary
- `apps/digital-health-startup/src/features/ask-expert/utils/mode-mapper.ts` - Mode configuration
- `services/ai-engine/src/langgraph_workflows/base_workflow.py` - Base workflow class

---

## 🎯 Success Criteria

Mode 1 is working when:
1. ✅ Request reaches AI Engine on port 8080
2. ✅ Agent response has content (length > 0)
3. ✅ RAG sources are retrieved (totalSources > 0)
4. ✅ Tools are executed when needed (used.length > 0)
5. ✅ Response is displayed in frontend

---

## 📞 Quick Reference

**AI Engine Health:** `http://localhost:8080/health`  
**Frontend:** `http://localhost:3000/ask-expert`  
**Mode 1 Endpoint:** `http://localhost:8080/api/mode1/manual`  
**Logs:** `/tmp/ai-engine.log`

---

**Last Updated:** 2025-01-27  
**Status:** 🔧 Port Fix Applied - Need to restart AI Engine with PORT=8080 and verify frontend connects correctly

**Latest Update:**
- ✅ Uvicorn bootstrap now reads PORT from environment (line 2474 in main.py)
- ✅ Code defaults fixed to port 8080 in frontend
- ⏳ Need to restart AI Engine with `export PORT=8080` before running
- ⏳ Need to restart Next.js dev server to pick up environment changes

