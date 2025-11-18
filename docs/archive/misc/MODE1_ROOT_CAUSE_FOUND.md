# Mode 1 Root Cause Analysis - FOUND ✅

**Date:** 2025-11-05 15:50 CET  
**Status:** Root causes identified

---

## 🔍 Root Causes Found

### Issue 1: Empty `selected_agents` Array
**Log Evidence:**
```json
{"selected_agents": [], "event": "Validating user agent selection"}
{"event": "No agents selected by user"}
```

**Root Cause:**
The workflow is receiving an empty `selected_agents` array even though the user selected "Brand Strategy Director" in the UI.

**Why:**
The frontend is sending `agent_id` (string) but the Python backend is expecting `selected_agents` (list). The conversion in `main.py` line 877 should work, but something is breaking.

**Location:**
- Frontend: `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts` line 144
- Backend: `services/ai-engine/src/main.py` line 877
- Workflow: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py` line 409

---

### Issue 2: Invalid Tenant ID Format
**Log Evidence:**
```json
{"tenant_id": "vital-default-tenant", "error": "Invalid tenant ID format: vital-default-tenant"}
```

**Root Cause:**
The tenant ID must be a UUID format, but the frontend is sending `"vital-default-tenant"` (string).

**Expected Format:**
```
00000000-0000-0000-0000-000000000001
```

**Location:**
- Frontend: `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts` line 171
- DEFAULT_TENANT_ID: line 78-81

---

### Issue 3: Supabase Initialization Failed
**Log Evidence:**
```json
{"event": "❌ All Supabase initialization methods failed"}
{"event": "Client.__init__() got an unexpected keyword argument 'proxy'"}
```

**Root Cause:**
Supabase client library version incompatibility with `proxy` parameter.

**Impact:**
- RAG retrieval fails
- Agent validation fails
- Memory retrieval fails

**Location:**
- `services/ai-engine/src/services/supabase_client.py`

---

### Issue 4: Invalid Pinecone API Key
**Log Evidence:**
```json
{"error": "(401) Unauthorized: Invalid API Key"}
{"event": "⚠️ Pinecone agents index not found"}
{"event": "⚠️ Pinecone RAG index not found"}
```

**Root Cause:**
The Pinecone API key in the environment is invalid or expired.

**Impact:**
- No vector search
- RAG falls back to Supabase only (which is also broken)

---

## 🎯 Fixes Needed

### Fix 1: Frontend Agent ID Mapping
**File:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

Need to ensure the agent ID from UI is correctly passed to Mode 1 service.

**Check:**
- How is "Brand Strategy Director" being converted to agent_id?
- Is the agent_id correct (e.g., `brand_strategy_director` or UUID)?

### Fix 2: Tenant ID Format
**File:** `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts`

**Change:**
```typescript
// Line 78-81
const DEFAULT_TENANT_ID =
  process.env.API_GATEWAY_TENANT_ID ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
  '00000000-0000-0000-0000-000000000001';  // ✅ Already UUID format
```

**But need to check:**
- What is `config.tenantId` being set to in the frontend?
- Is it being passed correctly from the Ask Expert page?

### Fix 3: Supabase Client Initialization
**File:** `services/ai-engine/src/services/supabase_client.py`

**Already attempted to fix** but need to verify the fix is working.

### Fix 4: Pinecone API Key
**File:** `.env.local` or `.env.vercel`

**Update:**
```bash
PINECONE_API_KEY=pcsk_6B4sVX_3WkUSw4xggc1k5w18FGxKhA3264v2yE3FuoeUHufUTRFuWr6n2AUkjenDSRt5PK
```

---

## 🔧 Debugging Steps

### Step 1: Check Frontend Agent Selection
```javascript
// In browser console, check what's being sent:
console.log('Agent ID:', agentId);
console.log('Selected Agents:', selectedAgents);
```

### Step 2: Check Backend Request
```bash
# AI Engine logs
tail -f /tmp/ai-engine-8080.log | grep -E "agent_id|selected_agents"
```

### Step 3: Test with Correct Format
```bash
curl -X POST http://localhost:8080/api/mode1/manual \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "agent_id": "brand_strategy_director",
    "message": "Test query",
    "enable_rag": true,
    "enable_tools": true
  }'
```

---

## 📊 Current Status

### What Works
✅ AI Engine is running on port 8080
✅ Frontend is running on port 3000
✅ TypeScript errors are fixed
✅ Mode 1 workflow imports successfully

### What Doesn't Work
❌ Agent ID not being passed to workflow
❌ Tenant ID format issue
❌ Supabase client initialization
❌ Pinecone API key invalid
❌ Empty response returned

---

## 🎯 Next Actions

1. **Check frontend agent ID** - Verify how "Brand Strategy Director" is being passed
2. **Fix Pinecone API key** - Update with the new key
3. **Test with correct tenant ID** - Use UUID format
4. **Verify Supabase fix** - Ensure initialization works

---

**Last Updated:** 2025-11-05 15:50 CET

