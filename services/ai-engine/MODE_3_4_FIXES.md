# Mode 3 & Mode 4 Fixes

**Date:** 2025-11-27
**Status:** ✅ Mode 3 Fixed | ⚠️ Mode 4 Needs Investigation

---

## Problem Summary

- **Mode 1** ✅ Working
- **Mode 2** ✅ Working
- **Mode 3** ❌ Object attribute error
- **Mode 4** ❌ Empty message

---

## Mode 3: Expert Recommendation - FIXED ✅

### Root Cause
The API route was trying to access dictionary values as object attributes:

```python
# WRONG - treating dict as object
response["expert_recommendation"] = {
    "recommended_experts": result["expert_recommendation"].recommended_experts,  # ❌
    "match_scores": result["expert_recommendation"].match_scores,  # ❌
    "reasoning": result["expert_recommendation"].reasoning  # ❌
}
```

The unified workflow returns dictionaries, not objects.

### Fix Applied

**File:** `/Users/amine/Desktop/vital/services/ai-engine/src/api/routes/ask_expert.py`
**Lines:** 303-313

```python
# FIXED - dict is already in correct format
if mode == ExecutionMode.SINGLE_EXPERT and result.get("expert_response"):
    response["expert_response"] = result["expert_response"]

elif mode == ExecutionMode.MULTI_EXPERT_PANEL and result.get("aggregated_response"):
    response["aggregated_response"] = result["aggregated_response"]

elif mode == ExecutionMode.EXPERT_RECOMMENDATION and result.get("expert_recommendation"):
    response["expert_recommendation"] = result["expert_recommendation"]

elif mode == ExecutionMode.CUSTOM_WORKFLOW and result.get("step_results"):
    response["step_results"] = result["step_results"]
```

### Verification

Backend restarted successfully:

```bash
$ curl http://localhost:8000/v1/ai/ask-expert/health
{
    "status": "healthy",
    "workflow": "available",
    "modes": ["single_expert", "multi_expert_panel", "expert_recommendation", "custom_workflow"]
}
```

**Test Mode 3:**
```bash
curl -X POST http://localhost:8000/v1/ai/ask-expert/unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "I need help with FDA submission requirements",
    "mode": "expert_recommendation",
    "tenant_id": "00000000-0000-0000-0000-000000000001"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "mode": "expert_recommendation",
  "session_id": "...",
  "expert_recommendation": {
    "recommended_experts": [
      {
        "expert_id": "expert_fda_001",
        "expert_name": "FDA Regulatory Strategist",
        "tier": 2,
        "match_score": 0.95,
        "reasoning": "Best match for regulatory queries"
      }
    ],
    "match_scores": [0.95, 0.87, 0.83],
    "reasoning": "Based on query analysis: domain=regulatory, complexity=2"
  }
}
```

---

## Mode 4: Custom Workflow - NEEDS INVESTIGATION ⚠️

### Current Behavior
Mode 4 returns empty message.

### Analysis from Logs

From `/tmp/ai-engine.log`:

```
2025-11-27 11:37:04 - Mode 4 graph built with Phase 4 enhancements
2025-11-27 11:37:08 - evidence_based_selection_failed: 'EmbeddingService' object has no attribute 'embed_query'
2025-11-27 11:37:08 - Fallback selection also failed: 'AgentSelectorService' object has no attribute 'select_multiple_experts_diverse'
2025-11-27 11:37:09 - Agent not found: regulatory_expert
2025-11-27 11:37:17 - All expert executions failed
2025-11-27 11:37:17 - content_length: 0, citations: 0, confidence: 0.0
```

### Diagnosis

**Issue 1: Wrong Endpoint**
- Frontend is calling `/api/mode4/autonomous-manual` (old Mode 4 workflow)
- Should be calling `/v1/ai/ask-expert/unified` with `mode: "custom_workflow"`

**Issue 2: Missing EmbeddingService Method**
- `EmbeddingService` lacks `embed_query()` method
- Falls back to `AgentSelectorService.select_multiple_experts_diverse()` which also doesn't exist

**Issue 3: Agent Selection Failing**
- Tries to use agent name "regulatory_expert" but agent doesn't exist in database
- All expert executions fail

### Recommended Fixes

#### Option A: Use Unified Workflow (Recommended)

Update frontend to call unified endpoint:

```typescript
// BEFORE (broken)
const response = await fetch('/api/mode4/autonomous-manual', { ... });

// AFTER (fixed)
const response = await fetch('/v1/ai/ask-expert/unified', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: userQuery,
    mode: 'custom_workflow',
    workflow_steps: [
      { type: 'query_expert', expert_id: 'expert_001' },
      { type: 'aggregate_experts', expert_ids: ['expert_002', 'expert_003'] },
      { type: 'retrieve_knowledge', query: 'supplemental context' }
    ],
    tenant_id: currentTenantId
  })
});
```

#### Option B: Fix Old Mode 4 Workflow

If you need to keep the old Mode 4:

1. **Fix EmbeddingService:**
   ```python
   # Add to services/embedding_service.py
   def embed_query(self, query: str) -> List[float]:
       return self.embeddings.embed_query(query)
   ```

2. **Fix AgentSelectorService:**
   ```python
   # Add to services/agent_selector_service.py
   async def select_multiple_experts_diverse(self, query: str, max_agents: int = 3):
       # Implementation here
       pass
   ```

3. **Fix Agent Database:**
   ```sql
   -- Ensure regulatory_expert exists
   SELECT id, name, display_name FROM agents WHERE name = 'regulatory_expert';
   -- If not found, create or use valid agent ID
   ```

---

## Testing Checklist

After fixes:

- [x] ✅ Mode 1: Single expert (working)
- [x] ✅ Mode 2: Multi-expert panel (working)
- [ ] ⏳ Mode 3: Expert recommendation (fixed, needs testing)
- [ ] ⏳ Mode 4: Custom workflow (needs frontend update OR old workflow fixes)

---

## Next Steps

1. **Test Mode 3** with the unified endpoint
2. **For Mode 4:** Choose one of:
   - **Option A (Recommended):** Update frontend to use `/v1/ai/ask-expert/unified` with `mode: "custom_workflow"`
   - **Option B:** Fix the old Mode 4 workflow's missing methods and agent issues

---

## Files Modified

**Fixed:**
- `/Users/amine/Desktop/vital/services/ai-engine/src/api/routes/ask_expert.py` (lines 303-313)

**Backend Status:**
- ✅ Running on port 8000
- ✅ Unified workflow available
- ✅ Health check passing

---

**Ready to test Mode 3!** Try it now from the frontend. For Mode 4, decide which approach you prefer and I can implement it.
