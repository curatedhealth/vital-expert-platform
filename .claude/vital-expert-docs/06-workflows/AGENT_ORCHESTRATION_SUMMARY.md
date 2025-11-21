# Agent Orchestration Implementation Summary

**Date**: November 21, 2025
**Status**: Design Complete, Ready for Implementation

---

## Overview

This document summarizes the complete LangGraph agent orchestration architecture for Ask Expert workflows (Modes 1-4). All design documents and implementation code have been created.

---

## Deliverables

### 1. Architecture Documentation

**File**: `/Users/amine/Desktop/vital/.claude/vital-expert-docs/06-workflows/LANGGRAPH_AGENT_ORCHESTRATION_ARCHITECTURE.md`

**Contents**:
- Complete agent selection API contract (frontend ↔ backend)
- Agent loading mechanism design
- State schema specifications for all 4 modes
- Agent coordination patterns (single, multi, sub-agent, handoff)
- Integration points (API endpoints, database schemas, event streaming)
- Error handling strategies
- Testing approach

**Key Sections**:
1. Agent Selection API Contract
2. Unified Agent Loader Service
3. Complete State Schemas (Mode 1-4)
4. Agent Coordination Patterns
5. Integration Points
6. Implementation Examples
7. Error Handling
8. Testing Strategy

### 2. Implementation Code

#### UnifiedAgentLoader Service

**File**: `/Users/amine/Desktop/vital/services/ai-engine/src/services/unified_agent_loader.py`

**Purpose**: Single, reusable service for loading agents across all modes

**Key Features**:
- Load agents by ID with tenant isolation
- Load default agents for domains (fallback mechanism)
- Load sub-agent pools (Level 3 specialists)
- Graceful degradation with fallback agents
- Comprehensive error handling

**Main Classes**:
- `AgentProfile` - Complete agent profile model (Pydantic)
- `UnifiedAgentLoader` - Main loader service
- `AgentLoadError` - Custom exception

**Methods**:
- `load_agent_by_id()` - Load specific agent (Mode 1 & 3)
- `load_default_agent_for_domain()` - Load fallback agent
- `load_sub_agent_pool()` - Load specialists for parent agent

#### AgentPoolManager Service

**File**: `/Users/amine/Desktop/vital/services/ai-engine/src/services/agent_pool_manager.py`

**Purpose**: Manage agent pools and automatic selection (Mode 2 & 4)

**Key Features**:
- Query available agents with filters (domain, tier)
- Score agents for query relevance
- Automatic agent selection with confidence scoring
- Handle agent availability and ranking

**Main Classes**:
- `AgentPoolManager` - Pool management and scoring

**Methods**:
- `get_available_agents()` - Get agents for tenant
- `score_agents_for_query()` - Score agents for relevance
- `get_agent_for_domain_auto()` - High-level auto-selection

**Scoring Algorithm**:
```
Score =
  + 0.3 per matching capability keyword
  + 0.1 per matching description word
  + 0.4 if domain keyword in query
  + 0.2 tier bonus (tier 1)
  + 0.1 tier bonus (tier 2)
  + priority bonus (0.0-0.1)
```

---

## API Contract

### Frontend Request Format

```typescript
POST /api/ask-expert/orchestrate

{
  // Session
  mode: 'mode_1_interactive_manual' | 'mode_2_interactive_auto' | ...,
  user_id: string,
  tenant_id: string,
  session_id?: string,

  // Agent Selection
  agent_selection: {
    // Mode 1 & 3: Manual selection
    selected_agent_id?: string,

    // Mode 2 & 4: Auto selection
    auto_select?: boolean,
    preferred_domain?: string,
    preferred_tier?: 1 | 2 | 3,
    excluded_agents?: string[]
  },

  // Query
  query: string,

  // Config
  config?: {
    enable_rag?: boolean,
    enable_tools?: boolean,
    enable_sub_agents?: boolean,
    streaming?: boolean
  }
}
```

### Backend Response (SSE Events)

```typescript
// Agent selection
data: {"type": "agent_selected", "data": {"agent_id": "...", "agent_name": "...", "confidence": 0.95}}

// Agent loading
data: {"type": "agent_loading", "data": {"step": "loading_profile", "progress": 0.33}}

// Agent execution
data: {"type": "agent_thinking", "data": {"thinking_step": "Analyzing query..."}}

// Sub-agent spawning
data: {"type": "specialist_spawned", "data": {"sub_agent_id": "...", "specialty": "..."}}

// Response streaming
data: {"type": "response_token", "data": {"token": "Based"}}

// Completion
data: {"type": "response_complete", "data": {"response": "...", "confidence": 0.92}}
```

---

## State Schema Design

### Mode 1 State (Example)

```python
class Mode1State(TypedDict):
    # Session
    session_id: str
    user_id: str
    tenant_id: str  # REQUIRED (Golden Rule #3)
    mode: str

    # Agent Selection
    selected_agent_id: str  # From frontend
    agent: Optional[Dict[str, Any]]  # Loaded profile
    agent_persona_message: Optional[BaseMessage]
    sub_agent_pool: List[Dict[str, Any]]

    # Conversation
    messages: Annotated[List[BaseMessage], operator.add]
    current_message: str
    conversation_history: List[Dict[str, Any]]
    turn_count: int

    # Context
    context_window: str
    rag_context: List[Dict[str, Any]]
    uploaded_documents: List[str]

    # Sub-Agents
    needs_specialists: bool
    specialists_to_spawn: List[str]
    spawned_specialist_ids: List[str]
    specialist_results: List[Dict[str, Any]]

    # Tools
    needs_tools: bool
    tools_to_use: List[str]
    tool_results: List[Dict[str, Any]]

    # Generation
    thinking_steps: List[Dict[str, str]]
    response: str
    citations: List[Dict[str, Any]]
    confidence_score: float

    # Control
    workflow_step: str
    continue_conversation: bool
    error: Optional[str]

    # Metadata
    tokens_used: Dict[str, int]
    estimated_cost: float
    response_time_ms: int
```

---

## Workflow Integration

### Mode 1: Interactive Manual

**Workflow**:
```
START → load_agent → load_context → update_context → agent_reasoning
                                                           ↓
                                                  check_specialist_need
                                                     ↓              ↓
                                          spawn_specialists    check_tools_need
                                                     ↓              ↓
                                                     └→ check_tools_need
                                                            ↓              ↓
                                                   tool_execution   generate_response
                                                            ↓              ↓
                                                            └→ generate_response
                                                                      ↓
                                                               update_memory → END
```

**Agent Loading Node**:
```python
async def load_agent_node(state: Mode1State) -> Mode1State:
    agent_loader = UnifiedAgentLoader(supabase)

    # Load agent profile
    agent_profile = await agent_loader.load_agent_by_id(
        agent_id=state["selected_agent_id"],
        tenant_id=state["tenant_id"]
    )

    # Build persona message
    persona_message = SystemMessage(content=agent_profile.system_prompt)

    # Load sub-agents
    sub_agents = await agent_loader.load_sub_agent_pool(
        parent_agent=agent_profile,
        tenant_id=state["tenant_id"]
    )

    return {
        **state,
        "agent": agent_profile.dict(),
        "agent_persona_message": persona_message,
        "sub_agent_pool": [sa.dict() for sa in sub_agents]
    }
```

### Mode 2: Interactive Automatic

**Workflow**:
```
START → select_agents → load_agent → ... (same as Mode 1)
```

**Agent Selection Node**:
```python
async def select_agents_node(state: Mode2State) -> Mode2State:
    pool_manager = AgentPoolManager(supabase, agent_loader)

    # Get available agents
    agents = await pool_manager.get_available_agents(
        tenant_id=state["tenant_id"],
        domain=state.get("preferred_domain")
    )

    # Score for relevance
    scored_agents = await pool_manager.score_agents_for_query(
        query=state["current_message"],
        agents=agents
    )

    # Select best
    best_agent, score = scored_agents[0]

    return {
        **state,
        "selected_agent_id": best_agent.id,
        "agent": best_agent.dict(),
        "agent_selection_confidence": score
    }
```

---

## Database Schema Requirements

```sql
-- Agents table (existing, enhanced metadata)
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    base_model TEXT DEFAULT 'gpt-4',
    temperature FLOAT DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    specializations TEXT[],
    metadata JSONB,  -- Contains:
        -- display_name, domain_expertise, tier, priority,
        -- knowledge_base_ids, sub_agents, is_custom, etc.
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    color_scheme JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_tenant_status ON agents(tenant_id, status);
CREATE INDEX idx_agents_metadata_domain ON agents USING GIN ((metadata->'domain_expertise'));
CREATE INDEX idx_agents_metadata_tier ON agents((metadata->>'tier'));

-- Sessions table
CREATE TABLE ask_expert_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    mode TEXT NOT NULL,
    selected_agent_id UUID,  -- For manual modes
    current_agent_id UUID,  -- Currently active agent
    agent_history JSONB,  -- History of agents used
    conversation_state JSONB,  -- State snapshot
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE ask_expert_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES ask_expert_sessions(id),
    role TEXT NOT NULL,  -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    agent_id UUID,  -- Which agent generated this
    metadata JSONB,  -- Confidence, citations, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent executions tracking
CREATE TABLE ask_expert_agent_executions (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id),
    query TEXT NOT NULL,
    response TEXT,
    confidence FLOAT,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    execution_time_ms INTEGER,
    specialist_ids TEXT[],  -- Sub-agents spawned
    tool_executions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Error Handling

### Agent Loading Errors

| Error | Handling Strategy |
|-------|------------------|
| Agent not found | Return clear error to user, suggest available agents |
| Agent inactive/deprecated | Filter at query level, use fallback if needed |
| Agent not accessible (tenant) | Enforce via RLS, return 404 |
| Sub-agent load failure | Log warning, continue with available sub-agents |

### Auto-Selection Errors

| Error | Handling Strategy |
|-------|------------------|
| No agents available | Load general fallback agent |
| All scores below threshold | Use fallback, confidence = 0.5 |
| Query too ambiguous | Return top agent with low confidence |

---

## Testing Requirements

### Unit Tests

```python
# Test agent loading
- test_load_agent_by_id_success()
- test_load_agent_by_id_not_found()
- test_load_agent_tenant_isolation()
- test_load_default_agent_for_domain()
- test_load_sub_agent_pool()

# Test agent pool management
- test_get_available_agents()
- test_score_agents_for_query()
- test_auto_select_agent()

# Test agent coordination
- test_spawn_specialists()
- test_agent_handoff()
```

### Integration Tests

```python
# Test mode workflows
- test_mode1_workflow_with_agent_loading()
- test_mode2_workflow_with_auto_selection()
- test_mode1_workflow_with_sub_agents()
- test_agent_pool_exhaustion_handling()
```

### E2E Tests

```python
# Test full user flows
- test_user_selects_agent_and_sends_query()
- test_auto_selection_returns_relevant_agent()
- test_sub_agent_spawning_for_complex_query()
```

---

## Next Steps

### Phase 1: Core Implementation (Week 1-2)

1. Deploy `unified_agent_loader.py` to services/ai-engine
2. Deploy `agent_pool_manager.py` to services/ai-engine
3. Update Mode 1 workflow to use agent loader
4. Add `load_agent` node to Mode 1 state machine
5. Test agent loading with existing agents in database

### Phase 2: Auto-Selection (Week 2-3)

1. Implement Mode 2 `select_agents` node
2. Integrate agent pool manager
3. Add agent selection confidence to state
4. Test auto-selection with various queries
5. Tune scoring algorithm based on results

### Phase 3: Sub-Agent Integration (Week 3-4)

1. Update `spawn_specialists` node to use loaded sub-agent pool
2. Add sub-agent execution tracking
3. Implement specialist result aggregation
4. Test complex queries requiring specialists

### Phase 4: Testing & Optimization (Week 4-5)

1. Write comprehensive unit tests
2. Run integration tests against test database
3. Perform E2E testing with frontend
4. Optimize scoring algorithm
5. Add performance monitoring

### Phase 5: Documentation & Deployment (Week 5-6)

1. Update API documentation
2. Create developer guide
3. Add usage examples
4. Deploy to staging
5. Monitor and iterate

---

## Success Metrics

### Performance Targets

- Agent loading latency: <500ms
- Auto-selection latency: <1000ms
- Sub-agent pool loading: <1000ms
- Total overhead: <2s added to workflow

### Quality Targets

- Agent selection accuracy (Mode 2/4): >85%
- Sub-agent availability: >95%
- Fallback usage rate: <5%
- Error rate: <0.1%

### Business Metrics

- User satisfaction with agent selection: >4.5/5
- Agent diversity (different agents used): >70% of available agents
- Multi-turn conversation retention: >80%
- Custom agent usage: >20% of queries

---

## Related Documentation

1. **Architecture**: `LANGGRAPH_AGENT_ORCHESTRATION_ARCHITECTURE.md`
2. **Mode 1 Specification**: `MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md`
3. **Mode 1 Audit**: `MODE_1_IMPLEMENTATION_AUDIT_REPORT.md`
4. **ReactFlow Integration**: `MODE_1_REACTFLOW_IMPLEMENTATION_GUIDE.md`
5. **State Schemas**: `services/ai-engine/src/langgraph_workflows/state_schemas.py`

---

## Support

For questions about this implementation:

1. Review the architecture document
2. Check implementation code comments
3. Run example usage scripts in each file
4. Contact: LangGraph Orchestration Team

---

**Status**: ✅ Design Complete, Ready for Implementation
**Version**: 1.0
**Last Updated**: November 21, 2025
