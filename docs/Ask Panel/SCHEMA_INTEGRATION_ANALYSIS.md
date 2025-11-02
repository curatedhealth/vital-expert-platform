# Schema Integration Analysis

**Date**: November 2, 2025  
**Discovery**: Existing Ask Panel schema in Supabase  
**Impact**: Significant simplification of MVP roadmap

---

## 🔍 What We Found

### Existing Tables (Production Ready)

1. **tenants** - Multi-tenant core
   - settings, features, branding (JSONB)
   - subscription_tier, status
   - Full tenant configuration

2. **tenant_users** - User-tenant mapping  
   - roles: owner, admin, member, guest
   - status: active, inactive, invited

3. **panels** - Core panel sessions
   - 6 panel types: structured, open, socratic, adversarial, delphi, hybrid
   - 4 states: created, running, completed, failed
   - configuration, agents (JSONB)

4. **panel_responses** - Expert responses
   - 4 response types: analysis, statement, rebuttal, question
   - confidence_score, metadata

5. **panel_consensus** - Consensus tracking
   - consensus_level (0-1)
   - agreement_points, disagreement_points (JSONB)
   - dissenting_opinions, recommendation

6. **agent_usage** - Usage metrics
   - tokens_used, execution_time_ms, cost_usd
   - Full usage tracking already designed

**RLS**: All tables already have Row-Level Security enabled

---

## ✅ What This Means

### Positive Impacts

1. **No Schema Design Needed**
   - Tables exist and are production-ready
   - Column names are well-chosen
   - Relationships properly defined
   - JSONB fields for flexibility

2. **RLS Already Configured**
   - Tenant isolation at DB level
   - Don't need to write policies
   - Just need to ensure X-Tenant-ID header

3. **Clear Data Model**
   - Enums defined (panel_type, status, roles)
   - Confidence scores standardized
   - Usage tracking built-in

4. **Faster Implementation**
   - Skip migration writing
   - Skip table testing
   - Start with domain logic immediately

### What We Still Need

1. **Application Logic** (the main work)
   - Panel orchestration workflow
   - Consensus calculation algorithms
   - Expert selection logic
   - SSE streaming implementation

2. **Integration**
   - Connect FastAPI to existing tables
   - Use TenantAwareSupabaseClient we built
   - Implement panel repository
   - Build API endpoints

3. **Frontend**
   - UI components matching schema
   - SSE client for streaming
   - Panel creation/viewing
   - Dashboard and analytics

---

## 🔄 Updated Implementation Strategy

### Before (Original Plan)
```
Week 1: Create schema + RLS + indexes
Week 2: Build orchestration
Week 3: Build API
Week 4: Build frontend
```

### After (Updated Plan)
```
Week 1: 
  Day 1-2: ✅ Tenant DB client (done)
  Day 3: Agent usage tracking (use existing table)
  Day 4-5: Panel domain models (match schema)

Week 2:
  Build simplified orchestration
  Use existing panel/response/consensus tables
  
Week 3:
  API endpoints matching schema
  SSE streaming for real-time
  
Week 4:
  Frontend components
  Testing and polish
```

**Time Saved**: ~2 days (schema design + migration + testing)  
**Confidence**: Higher (schema is proven)  
**Risk**: Lower (no schema evolution during MVP)

---

## 📋 Schema-Driven Development Tasks

### Day 3: Agent Usage Tracking (UPDATED)

**Before**: Design usage tracking system  
**After**: Use existing `agent_usage` table

```python
# Simply insert to existing table
await tenant_aware_client.insert("agent_usage", {
    "agent_id": "regulatory_expert_001",
    "panel_id": panel_id,
    "tokens_used": 1500,
    "execution_time_ms": 2340,
    "cost_usd": 0.023
})

# Query usage
usage = await tenant_aware_client.list_all(
    "agent_usage",
    filters={"panel_id": panel_id}
)

total_cost = sum(u["cost_usd"] for u in usage)
```

### Day 4-5: Panel Domain Models (UPDATED)

**Task**: Create Python models matching existing schema

```python
# Match panels table exactly
class Panel:
    id: UUID
    tenant_id: UUID
    user_id: UUID
    query: str
    panel_type: Literal['structured', 'open', 'socratic', 
                        'adversarial', 'delphi', 'hybrid']
    status: Literal['created', 'running', 'completed', 'failed']
    configuration: dict
    agents: List[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

# Match panel_responses table
class PanelResponse:
    id: UUID
    tenant_id: UUID
    panel_id: UUID
    agent_id: str
    agent_name: str
    round_number: int
    response_type: Literal['analysis', 'statement', 
                           'rebuttal', 'question']
    content: str
    confidence_score: float
    created_at: datetime
    metadata: dict

# Match panel_consensus table
class PanelConsensus:
    id: UUID
    tenant_id: UUID
    panel_id: UUID
    round_number: int
    consensus_level: float  # 0-1
    agreement_points: dict
    disagreement_points: dict
    recommendation: str
    dissenting_opinions: dict
    created_at: datetime
```

### Week 2: Orchestration (UPDATED)

**Task**: Implement workflow that uses existing tables

```python
async def execute_panel_workflow(panel_id: UUID):
    """
    Simple panel execution using existing schema
    """
    # 1. Load from panels table
    panel = await panel_repo.get(panel_id)
    
    # 2. Update status: created -> running
    await panel_repo.update(panel_id, {
        "status": "running",
        "started_at": datetime.now(timezone.utc)
    })
    
    # 3. Execute experts
    responses = await execute_experts(panel.query, panel.agents[:5])
    
    # 4. Save to panel_responses table
    for response in responses:
        await response_repo.insert({
            "panel_id": panel_id,
            "agent_id": response.agent_id,
            "agent_name": response.name,
            "round_number": 1,
            "response_type": "analysis",
            "content": response.content,
            "confidence_score": response.confidence,
            "metadata": {}
        })
    
    # 5. Calculate consensus
    consensus = calculate_consensus(responses)
    
    # 6. Save to panel_consensus table
    await consensus_repo.insert({
        "panel_id": panel_id,
        "round_number": 1,
        "consensus_level": consensus.level,
        "agreement_points": consensus.agreements,
        "disagreement_points": consensus.disagreements,
        "recommendation": consensus.recommendation,
        "dissenting_opinions": consensus.dissents
    })
    
    # 7. Update status: running -> completed
    await panel_repo.update(panel_id, {
        "status": "completed",
        "completed_at": datetime.now(timezone.utc)
    })
```

---

## 🎯 Alignment Check

### Schema Design Decisions
✅ Multi-tenant from start (tenant_id everywhere)  
✅ Status tracking (created -> running -> completed)  
✅ Flexible configuration (JSONB fields)  
✅ Rich consensus data (agreements, disagreements, dissents)  
✅ Usage metrics (tokens, time, cost)  
✅ User roles (owner, admin, member, guest)  

### Our Implementation Must
✅ Use TenantAwareSupabaseClient for all DB ops  
✅ Respect panel_type enum (6 types)  
✅ Respect status enum (4 states)  
✅ Calculate consensus_level (0-1 float)  
✅ Track usage in agent_usage table  
✅ Support configuration JSONB properly  

---

## 🚨 Potential Issues

### 1. Schema Assumptions
**Risk**: Schema might have constraints we don't know about  
**Mitigation**: Test with real inserts early, validate constraints

### 2. RLS Policies
**Risk**: Policies might be stricter than expected  
**Mitigation**: Use service role key for backend, test with tenant headers

### 3. JSONB Field Structures
**Risk**: Unknown expected structure for configuration, metadata, etc.  
**Mitigation**: Start with simple dicts, expand as needed

### 4. Missing Indexes
**Risk**: Some queries might be slow without proper indexes  
**Mitigation**: Monitor query performance, add indexes if needed

---

## ✅ Action Items

### Immediate (Day 3)
- [x] Document existing schema
- [ ] Create agent usage tracker using `agent_usage` table
- [ ] Test insert/query with TenantAwareSupabaseClient
- [ ] Verify RLS policies work as expected

### Short-term (Day 4-5)
- [ ] Create Python models matching all 6 tables
- [ ] Build panel repository with full CRUD
- [ ] Test multi-tenant isolation with real data
- [ ] Validate JSONB field usage

### Medium-term (Week 2)
- [ ] Implement panel workflow using schema
- [ ] Test complete panel execution end-to-end
- [ ] Verify consensus calculation and storage
- [ ] Validate usage tracking accuracy

---

## 📊 Updated Risk Assessment

**Before Discovery**:
- Schema design: Medium risk
- Migration execution: Medium risk  
- RLS policy correctness: High risk

**After Discovery**:
- Schema exists: Low risk ✅
- Just use existing: Low risk ✅
- RLS pre-configured: Low risk ✅

**New Risks**:
- Schema constraints unknown: Low-Medium risk
- JSONB structure expectations: Low risk
- Performance of existing indexes: Low risk

**Overall**: Risk significantly reduced

---

## 💡 Key Takeaways

1. **Good News**: Schema is well-designed and ready to use
2. **Time Savings**: Skip 2 days of schema work
3. **Focus Shift**: More time for orchestration logic
4. **Confidence**: Production schema gives us validation
5. **Simplification**: No migration versioning needed for MVP

**Status**: Discovery complete, integrating into updated roadmap

