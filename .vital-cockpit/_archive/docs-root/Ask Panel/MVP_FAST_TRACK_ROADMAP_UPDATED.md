# MVP Fast Track Roadmap - UPDATED with Actual Schema

**Goal**: Working Ask Panel prototype in 4-6 weeks  
**Updated**: November 2, 2025 - Integrated with existing Supabase schema  
**Current Progress**: Phase 0 ✅, Phase 1 ✅, Week 1 Day 1-2 ✅ Complete

---

## 🔄 MAJOR UPDATE: Schema Already Exists

### What Changed
- **Discovered**: Complete Ask Panel schema already in Supabase
- **Tables**: `tenants`, `tenant_users`, `panels`, `panel_responses`, `panel_consensus`, `agent_usage`
- **Impact**: Skip table creation, focus on using existing schema
- **Benefit**: Faster implementation, schema is production-ready

### Existing Schema Overview

```
tenants (multi-tenant core)
├── settings (JSONB: panel limits, streaming config)
├── features (JSONB: panel type flags)
└── branding (JSONB: colors, logo, fonts)

tenant_users (user-tenant mapping)
├── role: owner, admin, member, guest
└── status: active, inactive, invited

panels (core panel sessions)
├── panel_type: structured, open, socratic, adversarial, delphi, hybrid
├── status: created, running, completed, failed
├── configuration (JSONB)
└── agents (JSONB[])

panel_responses (expert responses)
├── response_type: analysis, statement, rebuttal, question
├── confidence_score: FLOAT
└── metadata (JSONB)

panel_consensus (consensus tracking)
├── consensus_level: FLOAT (0-1)
├── agreement_points (JSONB)
├── disagreement_points (JSONB)
└── dissenting_opinions (JSONB)

agent_usage (usage metrics)
├── tokens_used: INTEGER
├── execution_time_ms: INTEGER
└── cost_usd: NUMERIC
```

**RLS**: All tables have Row-Level Security enabled

---

## 📅 UPDATED 4-Week Sprint Plan

### Week 0: Foundation ✅ COMPLETE
- [x] Database schema (already exists in Supabase)
- [x] Multi-tenant core (TenantId, TenantContext)
- [x] Integration with ai-engine middleware

### Week 1: Tenant-Aware Infrastructure (UPDATED)

#### ✅ Day 1-2: COMPLETE
- [x] Enhanced TenantIsolationMiddleware with shared-kernel
- [x] TenantAwareSupabaseClient (automatic filtering)
- [x] Test suite (11 tests, 100% pass)

#### ⏳ Day 3: Agent Usage Tracking (SIMPLIFIED)
**Goal**: Track AI usage per tenant using existing `agent_usage` table

**Tasks**:
1. Create `AgentUsageTracker` service
   - Insert records to `agent_usage` table
   - Track tokens, execution time, cost
   - Automatic tenant_id injection
   
2. Integrate with existing agent orchestrator
   - Wrap AI calls with usage tracking
   - Calculate token counts
   - Estimate costs
   
3. Basic usage queries
   - Get usage by tenant
   - Get usage by panel
   - Cost summaries

**Files**:
- `services/ai-engine/src/services/agent_usage_tracker.py`
- `services/ai-engine/tests/services/test_agent_usage_tracker.py`

**No Redis needed yet** - Defer to post-MVP

#### ⏳ Day 4-5: Panel Domain Model (UPDATED)
**Goal**: Create domain models matching existing schema

**Tasks**:
1. Panel value objects
   - PanelType enum (6 types from schema)
   - PanelStatus enum (4 states from schema)
   - ResponseType enum (4 types from schema)
   
2. Panel aggregate
   - Panel entity matching `panels` table
   - PanelResponse entity matching `panel_responses`
   - PanelConsensus entity matching `panel_consensus`
   
3. Panel repository
   - CRUD operations using TenantAwareSupabaseClient
   - Query builders for filtering
   - Relationship loading

**Files**:
- `services/ai-engine/src/domain/panel_types.py`
- `services/ai-engine/src/domain/panel_aggregate.py`
- `services/ai-engine/src/repositories/panel_repository.py`

**Deliverable**: Type-safe panel domain layer

---

### Week 2: Core Orchestration (SIMPLIFIED)

#### Day 6-8: LangGraph Workflow (SIMPLIFIED)
**Goal**: Working 3-5 expert panel with simple consensus

**Workflow States** (matching `panels.status`):
1. created → running
2. Execute 3-5 experts in parallel
3. Collect responses → `panel_responses` table
4. Calculate simple consensus → `panel_consensus` table
5. running → completed

**Implementation**:
```python
class SimplePanelWorkflow:
    """
    Simplified panel workflow for MVP
    Uses existing schema, simple algorithms
    """
    
    states = ["created", "running", "completed", "failed"]
    
    async def execute_panel(panel_id: UUID):
        # 1. Load panel from DB
        panel = await panel_repo.get(panel_id)
        
        # 2. Update status to 'running'
        await panel_repo.update_status(panel_id, "running")
        
        # 3. Execute experts in parallel (3-5 agents)
        responses = await execute_experts_parallel(
            panel.query,
            panel.agents[:5]  # Limit to 5 for MVP
        )
        
        # 4. Save responses to panel_responses table
        for response in responses:
            await response_repo.insert({
                "panel_id": panel_id,
                "agent_id": response.agent_id,
                "content": response.content,
                "confidence_score": response.confidence,
                "round_number": 1  # MVP: single round only
            })
        
        # 5. Calculate simple consensus (majority agreement)
        consensus = calculate_simple_consensus(responses)
        
        # 6. Save consensus to panel_consensus table
        await consensus_repo.insert({
            "panel_id": panel_id,
            "round_number": 1,
            "consensus_level": consensus.level,
            "agreement_points": consensus.agreements,
            "disagreement_points": consensus.disagreements,
            "recommendation": consensus.recommendation
        })
        
        # 7. Update status to 'completed'
        await panel_repo.update_status(panel_id, "completed")
```

**Consensus Algorithm (Simplified)**:
- Extract key points from each response
- Find common themes (simple keyword matching)
- Calculate agreement % (how many agree)
- consensus_level = agreement_count / total_experts
- If consensus_level > 0.7: strong consensus
- Generate simple recommendation

**NO advanced features yet**:
- ❌ No multiple rounds
- ❌ No debate/rebuttal
- ❌ No quantum consensus
- ❌ No evidence packs (post-MVP)

**Files**:
- `services/ai-engine/src/workflows/simple_panel_workflow.py`
- `services/ai-engine/src/services/consensus_calculator.py`
- `services/ai-engine/tests/workflows/test_simple_panel.py`

#### Day 9-10: Panel Repository & Integration Tests
**Goal**: Solid data layer with integration tests

**Tasks**:
1. Complete panel repository
   - All CRUD operations
   - Relationship queries (panel + responses + consensus)
   - Tenant filtering on all queries
   
2. Integration tests
   - End-to-end panel execution
   - Multi-tenant isolation tests
   - Concurrent panel execution
   - Error handling

**Deliverable**: Working panel orchestration with persistence

---

### Week 3: API & Streaming

#### Day 11-13: REST API (UPDATED)
**Goal**: API endpoints matching existing schema

**Endpoints**:
```python
POST   /api/v1/panels
  Body: {
    "query": "...",
    "panel_type": "structured",
    "agents": ["agent1", "agent2", "agent3"]
  }
  Response: { "id": "...", "status": "created" }

GET    /api/v1/panels/{id}
  Response: {
    "id": "...",
    "status": "running",
    "query": "...",
    "responses": [...],
    "consensus": {...}
  }

GET    /api/v1/panels
  Query: ?status=completed&limit=10
  Response: { "panels": [...], "total": 42 }

GET    /api/v1/panels/{id}/responses
  Response: { "responses": [...] }

GET    /api/v1/panels/{id}/consensus
  Response: { "consensus": {...} }

GET    /api/v1/usage
  Response: {
    "tokens_used": 150000,
    "cost_usd": 2.50,
    "panels_count": 10
  }
```

**Files**:
- `services/ai-engine/src/api/v1/panel_routes.py`
- `services/ai-engine/src/api/v1/schemas.py`
- `services/ai-engine/tests/api/test_panel_api.py`

#### Day 14-15: Server-Sent Events (SSE)
**Goal**: Real-time panel updates

**SSE Events**:
```python
GET /api/v1/panels/{id}/stream

Events:
  event: panel_started
  data: {"panel_id": "...", "status": "running"}

  event: expert_speaking
  data: {"agent_id": "...", "agent_name": "..."}

  event: response_added
  data: {"response_id": "...", "content": "...", "confidence": 0.85}

  event: consensus_calculated
  data: {"consensus_level": 0.75, "recommendation": "..."}

  event: panel_completed
  data: {"panel_id": "...", "status": "completed"}
```

**Files**:
- `services/ai-engine/src/api/v1/panel_streaming.py`
- `services/ai-engine/tests/api/test_panel_streaming.py`

**Deliverable**: Working API with real-time updates

---

### Week 4: Frontend & Testing

#### Day 16-17: Panel Creation UI
**Goal**: Create panels from frontend

**Components** (using existing schema):
```typescript
// Panel creation form
<CreatePanelForm>
  <PanelTypeSelector types={[
    'structured', 'open', 'socratic', 
    'adversarial', 'delphi', 'hybrid'
  ]} />
  <QueryInput maxLength={500} />
  <AgentSelector agents={availableAgents} max={5} />
  <SubmitButton />
</CreatePanelForm>

// Uses existing schema fields
interface PanelCreate {
  query: string;
  panel_type: PanelType;  // From schema enum
  agents: string[];
  configuration?: Record<string, any>;
}
```

**Files**:
- `apps/web/components/panels/CreatePanelForm.tsx`
- `apps/web/hooks/useCreatePanel.ts`
- `apps/web/lib/supabase/client.ts` (tenant-aware)

#### Day 18-19: Panel Stream Viewer
**Goal**: Watch panel execution in real-time

**Components**:
```typescript
<PanelStreamView panelId={id}>
  <PanelHeader status={panel.status} type={panel.panel_type} />
  
  <ResponseStream>
    {responses.map(r => 
      <ExpertResponse 
        agent={r.agent_name}
        content={r.content}
        confidence={r.confidence_score}
      />
    )}
  </ResponseStream>
  
  <ConsensusDisplay 
    level={consensus.consensus_level}
    agreements={consensus.agreement_points}
    disagreements={consensus.disagreement_points}
  />
  
  <Recommendation>
    {consensus.recommendation}
  </Recommendation>
</PanelStreamView>
```

**Files**:
- `apps/web/components/panels/PanelStreamView.tsx`
- `apps/web/lib/streaming/sse-client.ts`

#### Day 20: Dashboard & Polish
**Goal**: Panel list and basic analytics

**Features**:
- List panels with filters (status, type, date)
- Panel cards showing key info
- Basic usage stats from `agent_usage` table
- Navigation and routing

#### Day 21-22: Testing & Bug Fixes
**Goal**: Stable MVP

**Testing**:
- End-to-end tests for complete flow
- Multi-tenant isolation verification
- Error handling
- Performance testing (5 concurrent panels)

**Deliverable**: Working end-to-end MVP

---

## 📊 Updated Architecture

```
Frontend (Next.js)
  ↓ POST /api/v1/panels
  ↓ SSE /api/v1/panels/{id}/stream
  
FastAPI Backend
  ↓ TenantIsolationMiddleware (extracts tenant)
  ↓ TenantContext.set(tenant_id)
  
Panel API Routes
  ↓ PanelRepository (tenant-aware)
  
SimplePanelWorkflow
  • Load panel from panels table
  • Execute 3-5 experts in parallel
  • Save to panel_responses table
  • Calculate simple consensus
  • Save to panel_consensus table
  • Track usage in agent_usage table
  
TenantAwareSupabaseClient
  • Auto-filter all queries by tenant_id
  • Insert with tenant_id
  • Validate tenant ownership
  
Supabase (Existing Schema)
  • tenants, panels, panel_responses
  • panel_consensus, agent_usage
  • RLS policies (already enabled)
```

---

## 🎯 Updated MVP Scope

### Building (MVP Features)
✅ Multi-expert panel (3-5 experts)  
✅ Parallel expert execution  
✅ Simple consensus (majority vote)  
✅ Single round only  
✅ REST API (CRUD panels)  
✅ Real-time SSE streaming  
✅ Basic frontend UI  
✅ Tenant isolation  
✅ Usage tracking  

### Deferring (Post-MVP)
⏸️ Multiple discussion rounds  
⏸️ Advanced consensus algorithms (quantum, weighted)  
⏸️ Evidence packs with citations  
⏸️ Redis caching  
⏸️ Advanced rate limiting  
⏸️ Debate/rebuttal features  
⏸️ Performance optimization  
⏸️ Comprehensive security audit  

---

## 🚀 Updated Timeline

| Week | Focus | Days | Status |
|------|-------|------|--------|
| 0 | Foundation | - | ✅ Complete |
| 1 Day 1-2 | Tenant DB Client | 2 | ✅ Complete |
| 1 Day 3 | Usage Tracking | 1 | ⏳ Next |
| 1 Day 4-5 | Panel Domain | 2 | ⏳ |
| 2 | Simple Orchestration | 5 | ⏳ |
| 3 | API + SSE | 5 | ⏳ |
| 4 | Frontend + Testing | 5 | ⏳ |

**Total**: 20 working days (4 weeks)  
**Current**: Day 3 of 20 (15% complete)

---

## 📝 Key Simplifications vs Original Plan

1. **No Table Creation**: Schema exists, just use it
2. **No LangGraph Complexity**: Simple workflow, no state machine initially
3. **Single Round Only**: No multi-round debates for MVP
4. **Simple Consensus**: Keyword matching, not ML/quantum
5. **No Redis**: Direct DB queries for MVP
6. **5 Expert Limit**: Keep it simple and fast

---

## ✅ Success Criteria (Updated)

### Functional
- [ ] Create panel via UI
- [ ] System selects and executes 3-5 experts
- [ ] Experts respond in parallel
- [ ] Simple consensus calculated
- [ ] Real-time updates via SSE
- [ ] View panel results
- [ ] All operations tenant-isolated

### Technical
- [ ] Panel creation <3s
- [ ] Expert responses complete <30s  
- [ ] SSE updates <1s latency
- [ ] Zero cross-tenant leaks
- [ ] Integration tests pass
- [ ] Works with existing schema

---

**Next Up**: Day 3 - Agent Usage Tracking using existing `agent_usage` table

