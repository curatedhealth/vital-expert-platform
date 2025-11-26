# Week 1, Day 3: Agent Usage Tracking - Complete

**Date**: November 2, 2025  
**Status**: ✅ Complete  
**Duration**: Day 3 of MVP Fast Track

---

## 🎯 Objective

Build agent usage tracking service using existing `agent_usage` table to monitor AI API calls, tokens, execution time, and costs per tenant.

---

## ✅ Completed Work

### 1. Agent Usage Tracker Service

**File**: `services/ai-engine/src/services/agent_usage_tracker.py` (377 lines)

**Features**:
- **Track Usage**: Record AI agent calls with tokens, time, cost
- **Multi-Model Pricing**: Support GPT-4, GPT-3.5, Claude models
- **Accurate Cost Calculation**: Input/output token breakdown
- **Panel Usage Summary**: Aggregate usage per panel
- **Tenant Usage Summary**: Usage metrics over date ranges
- **Agent Statistics**: Performance metrics per agent
- **Automatic Tenant Isolation**: Uses TenantAwareSupabaseClient

**API**:
```python
tracker = AgentUsageTracker(db_client)

# Track single usage
await tracker.track_usage(
    agent_id="regulatory_expert_001",
    user_id=user_id,
    tokens_used=1500,
    execution_time_ms=2340,
    model="gpt-4-turbo",
    panel_id=panel_id  # optional
)

# Get panel usage summary
panel_usage = await tracker.get_panel_usage(panel_id)
# Returns: total_tokens, total_cost_usd, agent_count, per-agent breakdown

# Get tenant usage (last 30 days)
tenant_usage = await tracker.get_tenant_usage()
# Returns: totals, averages, panel count

# Get agent statistics
stats = await tracker.get_agent_stats("regulatory_expert_001")
# Returns: total_calls, average_tokens, average_cost
```

**Pricing Models**:
```python
PRICING = {
    "gpt-4": {"input": $0.03, "output": $0.06} per 1K tokens,
    "gpt-4-turbo": {"input": $0.01, "output": $0.03},
    "gpt-3.5-turbo": {"input": $0.0005, "output": $0.0015},
    "claude-3-opus": {"input": $0.015, "output": $0.075},
    "claude-3-sonnet": {"input": $0.003, "output": $0.015},
    "claude-3-haiku": {"input": $0.00025, "output": $0.00125}
}
```

### 2. Comprehensive Test Suite

**File**: `services/ai-engine/tests/services/test_agent_usage_tracker.py` (363 lines)

**Test Results**:
```
11 passed, 0 failed
Coverage: 97% for agent_usage_tracker.py
```

**Tests Cover**:
- ✅ Basic usage tracking
- ✅ Usage with panel_id
- ✅ Token breakdown (input/output)
- ✅ Cost calculation (simple)
- ✅ Cost calculation (with breakdown)
- ✅ Multi-model pricing (Claude)
- ✅ Panel usage (empty)
- ✅ Panel usage (with aggregation)
- ✅ Tenant usage summary
- ✅ Agent statistics
- ✅ Factory function

---

## 📊 Technical Details

### Database Integration

**Uses Existing Schema**:
```sql
agent_usage table:
  - id: UUID
  - tenant_id: UUID (auto-injected by TenantAwareSupabaseClient)
  - user_id: UUID
  - agent_id: TEXT
  - panel_id: UUID (nullable)
  - tokens_used: INTEGER
  - execution_time_ms: INTEGER
  - cost_usd: NUMERIC
  - created_at: TIMESTAMPTZ
  - metadata: JSONB
```

**No Schema Changes Needed** ✅

### Cost Calculation Logic

**Simple Mode** (total tokens only):
```python
# Use average of input/output pricing
avg_price = (pricing["input"] + pricing["output"]) / 2
cost = (total_tokens / 1000) * avg_price
```

**Accurate Mode** (with token breakdown):
```python
input_cost = (input_tokens / 1000) * pricing["input"]
output_cost = (output_tokens / 1000) * pricing["output"]
cost = input_cost + output_cost
```

**Example**:
```
GPT-4 Turbo:
  Input: 2000 tokens @ $0.01/1K = $0.02
  Output: 1000 tokens @ $0.03/1K = $0.03
  Total: $0.05
```

### Usage Aggregation

**Panel-Level**:
```python
{
  "panel_id": "...",
  "total_tokens": 4500,
  "total_cost_usd": 0.09,
  "total_execution_time_ms": 8000,
  "agent_count": 3,
  "agents": [
    {"agent_id": "expert_1", "tokens": 1500, "cost_usd": 0.03, "calls": 2},
    {"agent_id": "expert_2", "tokens": 2000, "cost_usd": 0.04, "calls": 1},
    {"agent_id": "expert_3", "tokens": 1000, "cost_usd": 0.02, "calls": 1}
  ]
}
```

**Tenant-Level**:
```python
{
  "total_tokens": 150000,
  "total_cost_usd": 3.50,
  "total_panels": 25,
  "total_calls": 120,
  "average_cost_per_panel": 0.14,
  "average_tokens_per_call": 1250
}
```

---

## 🔐 Security Features

1. **Automatic Tenant Isolation**
   - Uses TenantAwareSupabaseClient
   - tenant_id auto-injected on insert
   - All queries filtered by tenant

2. **No Cross-Tenant Leaks**
   - Can't query other tenants' usage
   - Panel usage validates panel belongs to tenant
   - RLS policies enforce isolation

3. **Audit Trail**
   - Every agent call recorded
   - Timestamps for all usage
   - Metadata for debugging

---

## 📈 What This Enables

### For Billing
- Accurate cost tracking per tenant
- Usage-based pricing possible
- Cost breakdowns by panel/agent
- Historical usage trends

### For Analytics
- Most used agents
- Average costs per operation
- Performance metrics (execution time)
- Token efficiency tracking

### For Rate Limiting (Future)
- Usage quotas per tenant
- Alert on threshold exceeded
- Cost caps enforcement
- Fair use monitoring

---

## 🧪 Testing Evidence

### Test Output
```bash
$ pytest tests/services/test_agent_usage_tracker.py -v

tests/services/test_agent_usage_tracker.py::test_track_usage_basic PASSED
tests/services/test_agent_usage_tracker.py::test_track_usage_with_panel PASSED
tests/services/test_agent_usage_tracker.py::test_track_usage_with_token_breakdown PASSED
tests/services/test_agent_usage_tracker.py::test_calculate_cost_simple PASSED
tests/services/test_agent_usage_tracker.py::test_calculate_cost_with_breakdown PASSED
tests/services/test_agent_usage_tracker.py::test_calculate_cost_claude PASSED
tests/services/test_agent_usage_tracker.py::test_get_panel_usage_empty PASSED
tests/services/test_agent_usage_tracker.py::test_get_panel_usage_with_records PASSED
tests/services/test_agent_usage_tracker.py::test_get_tenant_usage PASSED
tests/services/test_agent_usage_tracker.py::test_get_agent_stats PASSED
tests/services/test_agent_usage_tracker.py::test_create_usage_tracker PASSED

========================= 11 passed in 1.70s =========================
Coverage: 97%
```

---

## 📝 Files Created

### New Files
1. `services/ai-engine/src/services/agent_usage_tracker.py` (377 lines)
2. `services/ai-engine/tests/services/test_agent_usage_tracker.py` (363 lines)

### No Files Modified
- No changes to existing code
- Clean integration via dependency injection

---

## 🔄 Integration Points

### With Panel Orchestrator (Week 2)
```python
# Track usage during panel execution
async def execute_expert(agent_id: str, query: str, panel_id: UUID):
    start = time.time()
    
    # Execute agent
    response = await agent.run(query)
    
    # Track usage
    await usage_tracker.track_usage(
        agent_id=agent_id,
        user_id=current_user_id,
        tokens_used=response.usage.total_tokens,
        execution_time_ms=int((time.time() - start) * 1000),
        model=response.model,
        panel_id=panel_id,
        input_tokens=response.usage.prompt_tokens,
        output_tokens=response.usage.completion_tokens
    )
```

### With API Layer (Week 3)
```python
# GET /api/v1/usage endpoint
@app.get("/api/v1/usage")
async def get_usage_summary():
    tenant_id = TenantContext.get()
    usage = await usage_tracker.get_tenant_usage()
    return usage

# GET /api/v1/panels/{id}/usage
@app.get("/api/v1/panels/{id}/usage")
async def get_panel_usage(panel_id: UUID):
    usage = await usage_tracker.get_panel_usage(panel_id)
    return usage
```

---

## 💡 Key Takeaways

### What Went Well
✅ Leveraged existing `agent_usage` table perfectly  
✅ Clean API design  
✅ Comprehensive pricing support  
✅ 97% test coverage  
✅ No schema changes needed  
✅ Automatic tenant isolation  

### Design Decisions
1. **Multi-Model Pricing**: Support multiple AI providers
2. **Flexible Cost Calculation**: Simple or accurate modes
3. **Aggregation at Multiple Levels**: Panel, tenant, agent
4. **Metadata Storage**: JSONB for extensibility
5. **Async Throughout**: Non-blocking operations

### Production Considerations
- ⚠️ Date filtering currently in Python (TODO: move to SQL for performance)
- ⚠️ No pagination on list queries (add for large datasets)
- ✅ Ready for immediate use in panel orchestration
- ✅ Cost calculations accurate for billing

---

## 📊 Progress Tracker

### Week 1 Progress: 60% Complete (Day 3 of 5)

- [x] Day 1-2: Tenant middleware + DB client
- [x] Day 3: Agent usage tracking ← **COMPLETE**
- [ ] Day 4-5: Panel domain models

### MVP Progress: 20% Complete (Day 3 of 20)

Foundation is solid. Moving to domain layer next.

---

## 🚀 Next Steps: Day 4-5

**Objective**: Panel Domain Models

**Tasks**:
1. Create Python models matching existing schema
   - Panel, PanelResponse, PanelConsensus entities
   - Enums for panel_type, status, response_type
   
2. Build panel repository
   - CRUD operations
   - Relationship loading
   - Tenant filtering
   
3. Validation logic
   - Panel type validation
   - Status transitions
   - Configuration validation

**Files to Create**:
- `services/ai-engine/src/domain/panel_types.py`
- `services/ai-engine/src/domain/panel_models.py`
- `services/ai-engine/src/repositories/panel_repository.py`
- Tests for all

---

**Status**: Day 3 complete. Usage tracking production-ready. Moving to domain layer.

