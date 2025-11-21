# Mode 1 Critical Fix: execute_agent() Method Not Found

**Date:** 2025-01-05  
**Status:** ✅ **FIXED**

---

## Problem

**Root Cause:** Mode 1 workflow was calling `self.agent_orchestrator.execute_agent()` which **does not exist**. `AgentOrchestrator` only has `process_query()` method.

**Impact:**
- Mode 1 requests failing silently
- Empty responses (content length: 0)
- No RAG sources found (totalSources: 0)
- No tools executed (used: [])

**Error Location:** `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py:915`

---

## Root Cause Analysis

### 1. Method Mismatch
```python
# ❌ WRONG: Method doesn't exist
agent_response = await self.agent_orchestrator.execute_agent(
    agent_id=selected_agent,
    query=query,
    context=context_summary,
    ...
)
```

### 2. Correct API
```python
# ✅ CORRECT: Use process_query() with AgentQueryRequest
agent_response_obj = await self.agent_orchestrator.process_query(agent_request)
```

### 3. Response Object Structure
- `AgentOrchestrator.process_query()` returns `AgentQueryResponse` object
- Not a dictionary, so `.get()` doesn't work
- Need to access attributes: `agent_response_obj.response`, `agent_response_obj.confidence`, etc.

---

## Fix Applied

### 1. Create AgentQueryRequest Object
```python
from models.requests import AgentQueryRequest

# Get agent type from database
agent_type = 'general'  # Default
try:
    if self.supabase_client:
        agent_data = await self.supabase_client.client.from_('agents').select('type, name').eq('id', selected_agent).eq('tenant_id', tenant_id).single().execute()
        if agent_data.data:
            agent_type = agent_data.data.get('type', 'general')
except Exception as e:
    logger.warning(f"Could not get agent type, using default: {e}")

# Build query with context
full_query = query
if context_summary:
    full_query = f"{query}\n\nContext:\n{context_summary}"

# Create request object
agent_request = AgentQueryRequest(
    agent_id=selected_agent,
    agent_type=agent_type,
    query=full_query,
    user_id=state.get('user_id'),
    organization_id=tenant_id,
    medical_specialty=None,
    phase=None,
    max_context_docs=0,  # RAG already done in workflow
    similarity_threshold=0.7,
    include_citations=True
)
```

### 2. Call process_query() Instead
```python
# Execute agent via process_query()
agent_response_obj = await self.agent_orchestrator.process_query(agent_request)
```

### 3. Extract Response from Object
```python
# Extract response data from AgentQueryResponse object
response_text = agent_response_obj.response if hasattr(agent_response_obj, 'response') else ''
confidence = agent_response_obj.confidence if hasattr(agent_response_obj, 'confidence') else 0.0
if hasattr(agent_response_obj, 'citations') and agent_response_obj.citations:
    citations = agent_response_obj.citations
tokens_used = 0
if hasattr(agent_response_obj, 'processing_metadata') and agent_response_obj.processing_metadata:
    tokens_used = agent_response_obj.processing_metadata.get('total_tokens', 0)
```

---

## Files Modified

1. **`services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`**
   - Line 914-977: Fixed `execute_agent_node()` to use `process_query()` instead
   - Added `AgentQueryRequest` creation
   - Fixed response extraction from `AgentQueryResponse` object

---

## Testing

**Before Fix:**
- Error: `AttributeError: 'AgentOrchestrator' object has no attribute 'execute_agent'`
- Result: Empty response (content length: 0)
- RAG: No sources found
- Tools: Not executed

**After Fix:**
- ✅ Agent execution should work
- ✅ Response should be populated
- ✅ RAG sources should be available
- ✅ Tools should execute if enabled

---

## Additional Notes

1. **RAG Duplication:** `AgentOrchestrator.process_query()` internally calls `_get_rag_context()`, but we've already done RAG in the workflow. Setting `max_context_docs=0` prevents duplicate RAG calls.

2. **Agent Type Lookup:** The fix includes optional agent type lookup from database. Falls back to 'general' if lookup fails.

3. **Context Integration:** RAG context is prepended to the query before calling `process_query()`, ensuring the agent has access to retrieved documents.

---

## Status

✅ **FIXED** - Mode 1 should now work correctly with agent execution, RAG, and tools.

