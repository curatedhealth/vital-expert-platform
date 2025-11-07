# Mode 1 Issue - Complete Fix Plan 🔧

**Date:** 2025-11-05 16:00 CET  
**Status:** Root causes identified, fixes in progress

---

## 🐛 The Complete Issue Chain

### Flow Analysis
```
User selects "Brand Strategy Director" in UI
    ↓
Frontend sends to /api/ask-expert/orchestrate (mode: 'manual')
    ↓
Orchestrate routes to executeMode1 (agentId: ???)
    ↓
executeMode1 calls AI Engine /api/mode1/manual (agent_id: ???)
    ↓
AI Engine converts agent_id → selected_agents: [agent_id]
    ↓
Workflow receives selected_agents: [] ❌ EMPTY!
    ↓
Workflow error: "No agents selected by user"
    ↓
Returns empty response
```

**Breaking Point:** The agentId is not being passed from UI → orchestrate → Mode1 service

---

## 🔍 Root Cause Analysis

### Issue 1: Agent ID Not Passed from UI ⚠️ **CRITICAL**
**Evidence from screenshot:**
- User selected: "Brand Strategy Director"
- Console shows: `selected_agents: []`

**Where it breaks:**
1. UI selection of "Brand Strategy Director"
2. `handleSend` function in `ask-expert/page.tsx` (line 1026)
3. `agentId` variable not set correctly

**Need to check:**
```typescript
// In ask-expert/page.tsx
// What is `agentId` when user sends message?
console.log('🔍 Agent ID being sent:', agentId);
```

### Issue 2: Tenant ID Format
**Evidence:**
```
"tenant_id": "vital-default-tenant" ❌
```

**Should be:**
```
"tenant_id": "00000000-0000-0000-0000-000000000001" ✅
```

### Issue 3: Supabase Client Failed
**Evidence:**
```
"event": "❌ All Supabase initialization methods failed"
"event": "Client.__init__() got an unexpected keyword argument 'proxy'"
```

**Impact:**
- Cannot validate agents
- Cannot retrieve RAG results
- Cannot load memory

### Issue 4: Invalid Pinecone API Key
**Evidence:**
```
"error": "(401) Unauthorized: Invalid API Key"
```

---

## ✅ Complete Fix Plan

### Fix 1: Ensure Agent ID is Passed from UI
**File:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Check line 1026:**
```typescript
agentId: (mode === 'manual' || mode === 'multi-expert') ? agentId : undefined
```

**Questions:**
1. What is the value of `agentId` when "Brand Strategy Director" is selected?
2. Is `selectedAgent` state being set correctly?
3. Is `selectedAgent.id` the correct format?

**Likely issue:**
The `agentId` variable is not being set when the user selects an agent from the dropdown.

**Expected flow:**
```typescript
// User clicks "Brand Strategy Director" → 
// setSelectedAgent({id: "brand_strategy_director", name: "Brand Strategy Director"}) →
// agentId = selectedAgent.id = "brand_strategy_director" →
// Send to orchestrate
```

**Possible fix:**
```typescript
// In handleSend function
const resolvedAgentId = selectedAgent?.id || agentId;

// In fetch payload
agentId: (mode === 'manual' || mode === 'multi-expert') ? resolvedAgentId : undefined
```

### Fix 2: Update Pinecone API Key
**File:** `.env.local` or `.env.vercel`

**Add/Update:**
```bash
PINECONE_API_KEY=pcsk_6B4sVX_3WkUSw4xggc1k5w18FGxKhA3264v2yE3FuoeUHufUTRFuWr6n2AUkjenDSRt5PK
```

**Restart AI Engine:**
```bash
cd services/ai-engine
export PORT=8080
python src/main.py
```

### Fix 3: Verify Tenant ID
**File:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Check tenantId resolution:**
```typescript
// Should get from profile
tenantId = profile?.tenant_id || undefined

// Should be UUID format
```

**If not available, use default:**
```typescript
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
```

### Fix 4: Supabase Client (Already Attempted)
**File:** `services/ai-engine/src/services/supabase_client.py`

**Status:** Already has fallback logic, should work even if client init fails.

---

##  🧪 Testing Plan

### Step 1: Add Debug Logging
**Add to `ask-expert/page.tsx` before `handleSend`:**
```typescript
console.log('🔍 Debug Mode 1:', {
  mode,
  agentId,
  selectedAgent,
  selectedAgentId: selectedAgent?.id,
  enableRAG,
  enableTools,
});
```

### Step 2: Test Agent Selection
1. Open browser console
2. Select "Brand Strategy Director"
3. Check console: Does `selectedAgent.id` show?
4. Send a message
5. Check console: Is `agentId` included in payload?

### Step 3: Verify Backend Receives Agent ID
```bash
# Watch AI Engine logs
tail -f /tmp/ai-engine-8080.log | grep -E "agent_id|selected_agents"

# Should see:
# "agent_id": "brand_strategy_director"
# "selected_agents": ["brand_strategy_director"]
```

### Step 4: Full Integration Test
1. Select agent in UI
2. Enable RAG
3. Enable Tools
4. Send test query
5. Verify response is not empty

---

## 📊 Expected vs Actual

### Expected Request to AI Engine:
```json
{
  "agent_id": "brand_strategy_director",
  "message": "I want to monitor signal Statistical Detection",
  "enable_rag": true,
  "enable_tools": true,
  "tenant_id": "00000000-0000-0000-0000-000000000001"
}
```

### Actual Request (Current):
```json
{
  "agent_id": ???,  // ❌ Not being set
  "message": "I want to monitor signal Statistical Detection",
  "enable_rag": true,
  "enable_tools": true,
  "tenant_id": "vital-default-tenant"  // ❌ Wrong format
}
```

### Expected Workflow State:
```json
{
  "selected_agents": ["brand_strategy_director"],
  "tenant_id": "00000000-0000-0000-0000-000000000001"
}
```

### Actual Workflow State (Current):
```json
{
  "selected_agents": [],  // ❌ EMPTY!
  "tenant_id": "11111111"  // ⚠️ Truncated
}
```

---

## 🚀 Quick Fix to Test Now

**Option A: Hardcode Agent ID (Quick Test)**
```typescript
// In ask-expert/page.tsx, line 1026
agentId: (mode === 'manual' || mode === 'multi-expert') 
  ? (agentId || 'brand_strategy_director')  // ✅ Fallback to test
  : undefined
```

**Option B: Use selectedAgent.id**
```typescript
// In ask-expert/page.tsx, line 1026
agentId: (mode === 'manual' || mode === 'multi-expert') 
  ? (selectedAgent?.id || agentId)  // ✅ Use selectedAgent first
  : undefined
```

---

## 📝 Files to Check/Modify

1. ✅ `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx` - Agent ID passing
2. ✅ `.env.local` - Pinecone API key
3. ✅ `services/ai-engine/src/main.py` - Already correct (converts agent_id → selected_agents)
4. ✅ `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py` - Already correct

---

**Last Updated:** 2025-11-05 16:00 CET  
**Status:** Ready to implement fixes  
**Priority:** Fix agent ID passing first (most critical)

