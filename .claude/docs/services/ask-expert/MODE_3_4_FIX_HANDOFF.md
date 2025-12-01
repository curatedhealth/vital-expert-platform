# Mode 3 & Mode 4 Performance Fix Handoff Document

**Version:** 1.0.0
**Date:** December 1, 2025
**Status:** HANDOFF - Ready for Implementation
**Owner:** Assigned Agent
**Priority:** HIGH - Performance Critical

---

## Executive Summary

Mode 3 and Mode 4 are experiencing significant performance issues due to:
1. **Mode 3:** Response time of ~2000ms (target: <400ms)
2. **Mode 4:** Agent selector returning too many agents (observed 128 agents, target: 3-5)

This document provides detailed technical specifications for fixing both issues.

---

## Issue #1: Mode 3 Performance (1951ms → <400ms target)

### Current State
- **Current Response Time:** 1951ms (15% improved from 2285ms baseline)
- **Target Response Time:** <400ms
- **Gap:** ~1500ms (need 75% reduction)

### File Location
```
services/ai-engine/src/langgraph_workflows/mode3_manual_chat_autonomous.py
```

### Root Causes

1. **Pattern Chain Overhead**
   - Tree-of-Thoughts (ToT) + ReAct + Constitutional AI patterns all execute
   - Each pattern adds ~300-500ms overhead
   - **Fix:** Implement smart pattern skipping for simple queries

2. **Agent Config Loading**
   - Agent configuration loaded fresh on each request
   - Database round-trip adds ~100-200ms
   - **Fix:** Implement caching with 5-minute TTL (code exists at line 240-241, needs activation)

3. **No Query Classification**
   - All queries treated as complex
   - Simple queries don't need ToT/ReAct
   - **Fix:** Add query complexity classification

### Specific Code Changes Required

#### Change 1: Activate Agent Config Caching (Lines 239-242)
The cache exists but may not be properly utilized:
```python
# OPTIMIZATION: Cache for frequently accessed data
self._agent_config_cache = {}
self._conversation_cache = {}
```

**Action:** Ensure `_load_agent_config_cached()` method is used everywhere instead of direct database calls.

#### Change 2: Add Query Complexity Classification
```python
def _should_use_deep_patterns(self, query: str, complexity: str = None) -> bool:
    """
    Determine if query needs ToT/ReAct patterns.

    Simple queries (single-turn, factual) should skip expensive patterns.
    Complex queries (multi-step, analytical) need full pattern chain.
    """
    # Simple heuristics
    simple_keywords = ['what is', 'define', 'list', 'name', 'how many']
    complex_keywords = ['analyze', 'compare', 'design', 'strategy', 'comprehensive']

    query_lower = query.lower()

    # Skip patterns for simple queries
    if any(kw in query_lower for kw in simple_keywords) and len(query) < 100:
        return False

    # Force patterns for complex queries
    if any(kw in query_lower for kw in complex_keywords):
        return True

    # Use complexity hint if provided
    return complexity in ['high', 'critical']
```

#### Change 3: Conditional Pattern Execution
In the `execute_autonomous_reasoning` node, add conditional pattern skip:
```python
# Before executing patterns
use_deep_patterns = self._should_use_deep_patterns(
    state['query'],
    state.get('complexity')
)

if not use_deep_patterns:
    # Skip ToT, use only ReAct or direct response
    logger.info("Skipping ToT for simple query")
    state['skip_tot'] = True
```

### Performance Optimization Checklist

- [ ] Activate agent config caching (5-min TTL)
- [ ] Add query complexity classification
- [ ] Implement conditional ToT/ReAct skipping
- [ ] Add execution timeout wrappers (10s per operation)
- [ ] Profile and eliminate any synchronous database calls

---

## Issue #2: Mode 4 Agent Selector (128 agents → 3-5 target)

### Current State
- **Observed Agent Count:** 128 agents selected
- **Target Agent Count:** 3-5 agents
- **Impact:** 4665ms response time (target: <2000ms)

### File Locations
```
services/ai-engine/src/langgraph_workflows/mode4_auto_chat_autonomous.py
services/ai-engine/src/services/agent_selector_service.py
services/ai-engine/src/services/graphrag_selector.py
```

### Root Cause Analysis

The issue is that `select_agents_hybrid()` is returning more agents than expected. Looking at the code:

1. **In mode4_auto_chat_autonomous.py (line 669):**
   ```python
   max_agents = state.get('recommended_expert_count', 3)  # Default is 3
   ```
   This correctly defaults to 3.

2. **In mode4_auto_chat_autonomous.py (line 674-680):**
   ```python
   selected_agents = await self.agent_selector.select_agents_hybrid(
       query=query,
       tenant_id=tenant_id,
       mode="mode4",
       max_agents=max_agents,
       min_confidence=0.55
   )
   ```
   This correctly passes max_agents=3.

3. **The Problem:** The `select_agents_hybrid` method or `graphrag_selector.select_agents` method may be returning all agents that pass the min_confidence threshold, NOT respecting the max_agents limit.

### Specific Code Changes Required

#### Change 1: Enforce max_agents in graphrag_selector.py (Line 146)
**Current Code:**
```python
# Select top-k agents
selected = filtered_agents[:max_agents]
```

**Verification:** The limit IS being applied. However, if `filtered_agents` has 128 items and min_confidence is low (0.55), many agents pass.

**Fix:** Ensure min_confidence threshold is enforced BEFORE the slice:
```python
# Filter by confidence threshold
filtered_agents = [a for a in filtered_agents if a.get('confidence_score', 0) >= min_confidence]

# Sort by score descending
filtered_agents.sort(key=lambda x: x.get('fused_score', 0), reverse=True)

# Select top-k agents (ENFORCE LIMIT)
selected = filtered_agents[:max_agents]

# CRITICAL: Log actual count
logger.info(f"Returning {len(selected)} agents (max was {max_agents})")
```

#### Change 2: Add Hard Limit in agent_selector_service.py (Line 346-356)
Add explicit enforcement after GraphRAG returns:
```python
agents = await self.graphrag_selector.select_agents(
    query=query,
    tenant_id=tenant_id,
    mode=mode,
    max_agents=max_agents,
    min_confidence=min_confidence
)

# CRITICAL: Hard enforce limit (failsafe)
if len(agents) > max_agents:
    logger.warning(f"GraphRAG returned {len(agents)} agents, truncating to {max_agents}")
    agents = agents[:max_agents]
```

#### Change 3: Fix Mode 4 Execution Limiting (Line 986-988)
**Current Code (mode4_auto_chat_autonomous.py):**
```python
# OPTIMIZATION: Limit to 3 experts max for optimal speed/quality balance
agents_to_execute = selected_agents[:3]
logger.info(f"Limiting execution to {len(agents_to_execute)} experts for performance")
```

This is already limiting execution to 3, BUT the selection phase may have already selected 128. The fix needs to be **upstream** in the selection phase.

### Investigation Steps

1. Add logging to verify where 128 agents come from:
   ```python
   logger.info(f"GraphRAG returned {len(results)} raw results")
   logger.info(f"After filtering: {len(filtered_agents)} agents")
   logger.info(f"After limit: {len(selected)} agents")
   ```

2. Check if fallback methods are returning all agents:
   - `_fallback_select_experts()` falls back to database query with `limit=3`
   - Verify this limit is honored

3. Check Postgres function `search_agents_fulltext`:
   - Does it respect `result_limit` parameter?
   - May be returning all matches instead of top-k

### Performance Impact Calculation

- **Current:** 128 agents × 35ms/agent = 4480ms (just for loading)
- **Target:** 3 agents × 35ms/agent = 105ms
- **Savings:** ~4375ms (97% reduction in agent loading time)

---

## Testing Instructions

### Mode 3 Testing
```bash
# Test simple query (should skip ToT)
curl -X POST http://localhost:8000/v1/ask-expert/mode3 \
  -H "Content-Type: application/json" \
  -d '{"query": "What is aspirin?", "agent_id": "test-agent", "tenant_id": "platform"}'

# Verify: Response time should be <500ms

# Test complex query (should use ToT)
curl -X POST http://localhost:8000/v1/ask-expert/mode3 \
  -H "Content-Type: application/json" \
  -d '{"query": "Design a comprehensive clinical trial strategy for a novel immunotherapy drug targeting solid tumors", "agent_id": "test-agent", "tenant_id": "platform"}'

# Verify: Response time can be 1-2s (acceptable for complex queries)
```

### Mode 4 Testing
```bash
# Test agent selection count
curl -X POST http://localhost:8000/v1/ask-expert/mode4 \
  -H "Content-Type: application/json" \
  -d '{"query": "Analyze the FDA regulatory pathway for a Class II medical device", "tenant_id": "platform"}'

# Verify in logs:
# - "Returning X agents (max was 3)"
# - X should be ≤ 3
# - Response time should be <2000ms
```

---

## Success Criteria

### Mode 3
| Metric | Before | Target | Method to Verify |
|--------|--------|--------|------------------|
| Simple query response time | 1951ms | <500ms | API timing |
| Complex query response time | 1951ms | <1500ms | API timing |
| Cache hit rate | 0% | >80% | Logging |

### Mode 4
| Metric | Before | Target | Method to Verify |
|--------|--------|--------|------------------|
| Agents selected | 128 | 3-5 | Log inspection |
| Response time | 4665ms | <2000ms | API timing |
| Agent load time | 4480ms | <150ms | Log inspection |

---

## Files to Modify

| File | Changes Required | Priority |
|------|------------------|----------|
| `mode3_manual_chat_autonomous.py` | Query classification, pattern skipping | HIGH |
| `mode4_auto_chat_autonomous.py` | Logging, hard limit enforcement | HIGH |
| `agent_selector_service.py` | Hard limit after GraphRAG | HIGH |
| `graphrag_selector.py` | Confidence filtering, limit enforcement | HIGH |
| `unified_rag_service.py` | Verify Postgres function limits | MEDIUM |

---

## Rollback Plan

If performance degrades after changes:
1. Revert pattern skipping (keep all patterns on)
2. Remove hard agent limits (allow full selection)
3. Monitor for 24 hours
4. Incrementally re-apply fixes

---

## Contact & Escalation

- **Original Author:** Value Investigator Implementation Session
- **Handoff Date:** December 1, 2025
- **Escalation Path:** If fixes don't achieve targets, escalate to System Architecture Architect

---

**Document Status:** Ready for implementation by assigned agent.
