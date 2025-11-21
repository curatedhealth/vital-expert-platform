# 🎯 Phase 0: Ask Panel Integration Plan
## Using Existing VITAL Infrastructure

**Date**: November 1, 2025  
**Status**: Ready for Implementation  
**Approach**: Integration, Not Duplication

---

## 📋 Executive Summary

Instead of creating a separate `ask-panel-service`, we will **integrate Ask Panel functionality into the existing `ai-engine` service** using your current infrastructure:

- ✅ Existing FastAPI service (`services/ai-engine`)
- ✅ Existing database tables (board_session, board_reply, board_synthesis)
- ✅ Existing middleware (tenant isolation, rate limiting)
- ✅ Existing services (agent orchestrator, RAG, caching)
- ✅ Existing .env configuration

---

## 🗄️ Database Status: ALREADY EXISTS

### Tables Already Created

```sql
-- ✅ board_session (panel discussions)
-- ✅ board_reply (expert responses)  
-- ✅ board_synthesis (consensus building)
-- ✅ board_panel_member (panel membership)
-- ✅ evidence_pack (RAG knowledge packs)
```

**Migration File**: `supabase/migrations/20251003_create_advisory_board_tables.sql`

### What's Missing

- Row-Level Security (RLS) policies for multi-tenancy
- Additional indexes for performance
- Tenant isolation for board tables

---

## 🏗️ Current AI-Engine Architecture

```
services/ai-engine/
├── src/
│   ├── main.py                          # ✅ FastAPI app (has basic panel endpoint)
│   ├── core/
│   │   ├── config.py                    # ✅ Settings
│   │   ├── monitoring.py                # ✅ Metrics
│   │   ├── rag_config.py                # ✅ RAG config
│   │   └── websocket_manager.py         # ✅ WebSocket support
│   ├── middleware/
│   │   ├── tenant_context.py            # ✅ Tenant context
│   │   ├── tenant_isolation.py          # ✅ Tenant RLS
│   │   └── rate_limiting.py             # ✅ Rate limits
│   ├── services/
│   │   ├── agent_orchestrator.py        # ✅ Agent execution
│   │   ├── unified_rag_service.py       # ✅ RAG service
│   │   ├── supabase_client.py           # ✅ Database client
│   │   ├── cache_manager.py             # ✅ Redis caching
│   │   ├── conversation_manager.py      # ✅ Chat history
│   │   └── ...                          # Other services
│   ├── langgraph_workflows/
│   │   ├── base_workflow.py             # ✅ Base LangGraph pattern
│   │   ├── mode1_interactive_auto_workflow.py  # ✅ Mode 1 workflow
│   │   ├── checkpoint_manager.py        # ✅ Checkpoints
│   │   └── observability.py             # ✅ Tracing
│   └── models/
│       ├── requests.py                  # ✅ Request models
│       └── responses.py                 # ✅ Response models
```

---

## 🎯 Phase 0 Implementation Tasks

### Task 1: Add Ask Panel Environment Variables

**Action**: Document the additional env vars needed for Ask Panel  
**File**: Create `docs/Ask Panel/ENV_VARIABLES.md`

```bash
# Ask Panel Specific Configuration
ASK_PANEL_MAX_EXPERTS=12
ASK_PANEL_MAX_ROUNDS=5
ASK_PANEL_DEFAULT_TIMEOUT=300000
ASK_PANEL_MIN_CONSENSUS=0.70
ASK_PANEL_ENABLE_STREAMING=true
ASK_PANEL_ENABLE_HYBRID=false
```

**Status**: ⏳ Pending  
**Duration**: 15 minutes

---

### Task 2: Add Database RLS Policies for Panels

**Action**: Create RLS policies for board tables  
**File**: Create `scripts/database/ask-panel/01_enable_panel_rls.sql`

```sql
-- Enable RLS on board tables
ALTER TABLE board_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_panel_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_pack ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view panels in their organization"
  ON board_session FOR SELECT
  USING (
    created_by IN (
      SELECT id FROM auth.users 
      WHERE organization_id = (
        SELECT organization_id FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Add more policies...
```

**Status**: ⏳ Pending  
**Duration**: 1 hour

---

### Task 3: Create Panel Service Layer

**Action**: Add panel orchestration service to existing ai-engine  
**File**: Create `services/ai-engine/src/services/panel_orchestrator.py`

```python
"""
Panel Orchestration Service
Multi-expert advisory board coordination
"""
from typing import List, Dict, Any, Optional
from uuid import UUID
import structlog
from services.agent_orchestrator import AgentOrchestrator
from services.supabase_client import SupabaseClient
from services.cache_manager import CacheManager

logger = structlog.get_logger()

class PanelOrchestrator:
    """
    Orchestrates multi-expert panel discussions
    Integrates with existing agent orchestration infrastructure
    """
    
    def __init__(
        self,
        agent_orchestrator: AgentOrchestrator,
        supabase: SupabaseClient,
        cache: CacheManager
    ):
        self.agent_orchestrator = agent_orchestrator
        self.supabase = supabase
        self.cache = cache
    
    async def create_panel(
        self,
        tenant_id: UUID,
        user_id: UUID,
        query: str,
        panel_type: str,
        agent_ids: List[str],
        config: Dict[str, Any]
    ) -> UUID:
        """Create a new panel session"""
        # Implementation
        pass
    
    async def execute_panel(
        self,
        panel_id: UUID,
        stream: bool = False
    ) -> AsyncGenerator:
        """Execute panel discussion"""
        # Implementation
        pass
    
    async def build_consensus(
        self,
        panel_id: UUID,
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build consensus from expert responses"""
        # Implementation
        pass
```

**Status**: ⏳ Pending  
**Duration**: 4 hours

---

### Task 4: Create Panel LangGraph Workflow

**Action**: Add panel workflow using existing LangGraph patterns  
**File**: Create `services/ai-engine/src/langgraph_workflows/panel_workflow.py`

```python
"""
Panel Orchestration LangGraph Workflow
Based on existing mode1_interactive_auto_workflow.py pattern
"""
from langgraph.graph import StateGraph, END
from .base_workflow import BaseWorkflow
from .state_schemas import PanelState

class PanelWorkflow(BaseWorkflow):
    """
    LangGraph workflow for multi-expert panel orchestration
    
    Workflow:
    1. validate_tenant
    2. load_panel_config
    3. select_experts
    4. execute_round_1
    5. analyze_responses
    6. build_consensus [decision point]
        - consensus_reached → generate_report
        - need_more_rounds → execute_next_round
    7. generate_report
    8. store_results
    """
    
    def create_graph(self) -> StateGraph:
        graph = StateGraph(PanelState)
        
        # Add nodes
        graph.add_node("validate_tenant", self.validate_tenant)
        graph.add_node("load_panel_config", self.load_panel_config)
        graph.add_node("select_experts", self.select_experts)
        graph.add_node("execute_round", self.execute_round)
        graph.add_node("analyze_responses", self.analyze_responses)
        graph.add_node("build_consensus", self.build_consensus)
        graph.add_node("generate_report", self.generate_report)
        graph.add_node("store_results", self.store_results)
        
        # Add edges
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "load_panel_config")
        graph.add_edge("load_panel_config", "select_experts")
        graph.add_edge("select_experts", "execute_round")
        graph.add_edge("execute_round", "analyze_responses")
        graph.add_edge("analyze_responses", "build_consensus")
        
        # Conditional edge for consensus check
        graph.add_conditional_edges(
            "build_consensus",
            self.should_continue,
            {
                "continue": "execute_round",
                "finish": "generate_report"
            }
        )
        
        graph.add_edge("generate_report", "store_results")
        graph.add_edge("store_results", END)
        
        return graph.compile()
```

**Status**: ⏳ Pending  
**Duration**: 6 hours

---

### Task 5: Enhance Panel API Endpoints

**Action**: Expand existing `/api/panel/orchestrate` endpoint  
**File**: Modify `services/ai-engine/src/main.py`

```python
# Add to main.py

from services.panel_orchestrator import PanelOrchestrator
from langgraph_workflows.panel_workflow import PanelWorkflow

# Enhanced Panel Endpoints

@app.post("/api/v1/panels", response_model=PanelCreateResponse)
async def create_panel(
    request: PanelCreateRequest,
    tenant_id: UUID = Depends(get_tenant_id)
):
    """Create a new expert panel"""
    panel_orchestrator = get_panel_orchestrator()
    panel_id = await panel_orchestrator.create_panel(
        tenant_id=tenant_id,
        user_id=request.user_id,
        query=request.query,
        panel_type=request.panel_type,
        agent_ids=request.agent_ids,
        config=request.config
    )
    return {"panel_id": panel_id}

@app.post("/api/v1/panels/{panel_id}/execute")
async def execute_panel(
    panel_id: UUID,
    stream: bool = False,
    tenant_id: UUID = Depends(get_tenant_id)
):
    """Execute panel discussion"""
    panel_workflow = PanelWorkflow()
    
    if stream:
        return StreamingResponse(
            panel_workflow.stream_execution(panel_id),
            media_type="text/event-stream"
        )
    else:
        result = await panel_workflow.run(panel_id)
        return {"result": result}

@app.get("/api/v1/panels/{panel_id}")
async def get_panel(
    panel_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id)
):
    """Get panel details and results"""
    # Implementation
    pass

@app.get("/api/v1/panels/user/{user_id}")
async def list_user_panels(
    user_id: UUID,
    limit: int = 10,
    offset: int = 0,
    tenant_id: UUID = Depends(get_tenant_id)
):
    """List panels for a user"""
    # Implementation
    pass
```

**Status**: ⏳ Pending  
**Duration**: 3 hours

---

### Task 6: Create Panel Request/Response Models

**Action**: Add Pydantic models for panel operations  
**File**: Add to `services/ai-engine/src/models/requests.py`

```python
class PanelCreateRequest(BaseModel):
    """Request to create a new panel"""
    query: str = Field(..., min_length=10, max_length=1000)
    panel_type: str = Field(..., regex="^(structured|open|socratic|adversarial|delphi|hybrid)$")
    agent_ids: List[str] = Field(..., min_items=2, max_items=12)
    config: Dict[str, Any] = Field(default_factory=dict)
    evidence_pack_id: Optional[UUID] = None

class PanelExecuteRequest(BaseModel):
    """Request to execute a panel"""
    stream: bool = Field(default=True)
    max_rounds: int = Field(default=3, ge=1, le=10)
    min_consensus: float = Field(default=0.7, ge=0.0, le=1.0)
```

**Status**: ⏳ Pending  
**Duration**: 1 hour

---

### Task 7: Add Panel Tests

**Action**: Create tests for panel functionality  
**File**: Create `services/ai-engine/src/tests/test_panel_orchestrator.py`

```python
"""
Tests for Panel Orchestrator
"""
import pytest
from services.panel_orchestrator import PanelOrchestrator

@pytest.mark.asyncio
async def test_create_panel():
    """Test panel creation"""
    pass

@pytest.mark.asyncio
async def test_execute_panel():
    """Test panel execution"""
    pass

@pytest.mark.asyncio
async def test_build_consensus():
    """Test consensus building"""
    pass
```

**Status**: ⏳ Pending  
**Duration**: 2 hours

---

## 📊 Phase 0 Implementation Summary

| Task | Component | Duration | Status |
|------|-----------|----------|--------|
| 1 | Document env variables | 15 min | ⏳ Pending |
| 2 | Add database RLS policies | 1 hour | ⏳ Pending |
| 3 | Create PanelOrchestrator service | 4 hours | ⏳ Pending |
| 4 | Create LangGraph workflow | 6 hours | ⏳ Pending |
| 5 | Enhance API endpoints | 3 hours | ⏳ Pending |
| 6 | Create Pydantic models | 1 hour | ⏳ Pending |
| 7 | Add tests | 2 hours | ⏳ Pending |
| **TOTAL** | | **17-18 hours** | **~2-3 days** |

---

## ✅ What We're Reusing

1. ✅ **Existing FastAPI Service** (`services/ai-engine`)
2. ✅ **Existing Database** (Supabase with board tables)
3. ✅ **Existing Middleware** (tenant isolation, rate limiting)
4. ✅ **Existing Services** (AgentOrchestrator, UnifiedRAGService, CacheManager)
5. ✅ **Existing LangGraph Patterns** (base_workflow.py, observability)
6. ✅ **Existing .env Configuration**
7. ✅ **Existing Tests Infrastructure** (pytest, fixtures)
8. ✅ **Existing Deployment** (Railway/Modal)

---

## 🚫 What We're NOT Creating

1. ❌ Separate `ask-panel-service` directory
2. ❌ Duplicate middleware
3. ❌ Duplicate database connection
4. ❌ Duplicate configuration
5. ❌ Duplicate deployment setup
6. ❌ New .env file

---

## 🎯 Next Steps

### Immediate (Phase 0)
1. Delete the unnecessary setup script (`scripts/ask-panel/setup-structure.sh`)
2. Create environment variables documentation
3. Add RLS policies to existing board tables
4. Create `PanelOrchestrator` service class

### Phase 1 (Week 1)
1. Implement LangGraph panel workflow
2. Add panel API endpoints
3. Create request/response models
4. Add unit tests

### Phase 2 (Week 2)
1. Integrate with frontend components
2. Add streaming support
3. Implement consensus algorithms
4. Add integration tests

---

## 📝 File Structure (Integration Approach)

```
services/ai-engine/src/
├── services/
│   ├── panel_orchestrator.py          # NEW: Panel coordination
│   ├── consensus_builder.py           # NEW: Consensus algorithms
│   └── (existing services...)         # REUSE
├── langgraph_workflows/
│   ├── panel_workflow.py              # NEW: Panel LangGraph
│   └── (existing workflows...)        # REUSE
├── models/
│   ├── requests.py                    # ENHANCE: Add panel models
│   ├── responses.py                   # ENHANCE: Add panel responses
│   └── panel_state.py                 # NEW: Panel state schema
├── main.py                            # ENHANCE: Add panel endpoints
└── tests/
    ├── test_panel_orchestrator.py     # NEW: Panel tests
    └── (existing tests...)            # REUSE
```

---

## 🔄 Migration from Separate Service Approach

If you had started with a separate `ask-panel-service`, here's how to migrate:

1. **Don't create** `services/ask-panel-service/`
2. **Instead add** panel functionality to `services/ai-engine/src/services/`
3. **Reuse** existing middleware, config, database clients
4. **Integrate** with existing LangGraph workflows
5. **Extend** existing API routes instead of creating new service

---

## 💡 Key Integration Benefits

1. **No Duplication**: Reuse all existing infrastructure
2. **Single Deployment**: One service to deploy and maintain
3. **Shared Configuration**: One .env file, one config system
4. **Unified Monitoring**: All metrics in one place
5. **Consistent Patterns**: Follow established code patterns
6. **Faster Development**: Build on existing foundation
7. **Easier Testing**: Use existing test infrastructure
8. **Single Database Connection**: No connection pool overhead

---

## ✅ Phase 0 Completion Checklist

- [ ] Delete unnecessary setup script
- [ ] Document Ask Panel environment variables
- [ ] Create RLS policies SQL script
- [ ] Create `PanelOrchestrator` service
- [ ] Create `PanelWorkflow` LangGraph class
- [ ] Add panel API endpoints to main.py
- [ ] Create panel Pydantic models
- [ ] Add panel unit tests
- [ ] Update README with panel documentation
- [ ] Verify integration with existing services

---

**Status**: Ready to begin implementation  
**Approach**: Integration > Duplication  
**Timeline**: 2-3 days for Phase 0  
**Next**: Begin Task 1 - Document environment variables

---

**Created**: November 1, 2025  
**Version**: 1.0  
**Approach**: VITAL Infrastructure Integration

