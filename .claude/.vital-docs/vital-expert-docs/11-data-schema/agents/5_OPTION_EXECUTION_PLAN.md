# 🚀 5-OPTION EXECUTION PLAN

**Status**: In Progress  
**Current**: Option A (Testing & Validation)  
**Timeline**: 2-3 weeks for full completion

---

## ✅ **OPTION A: TESTING & VALIDATION** (In Progress)

### **A.1: Linting Validation** ✅ COMPLETE
**Status**: ✅ All 4 modes have no linter errors  
**Verified**:
- Mode 1: No errors
- Mode 2: No errors
- Mode 3: No errors
- Mode 4: No errors

### **A.2: Unit Tests** (Next)
**Files to Create**:
```
services/ai-engine/tests/langgraph_workflows/
├── test_mode1_phase4.py (Tier + Patterns)
├── test_mode2_phase4.py (Evidence-Based + GraphRAG)
├── test_mode3_phase4.py (HITL + ToT + Full Patterns)
├── test_mode4_phase4.py (All Phase 4 features)
└── test_phase4_integration.py (E2E tests)
```

**Test Coverage**:
- Tier assessment logic (all 4 modes)
- Pattern execution (ReAct, Constitutional, ToT)
- Evidence-Based selection (Mode 2 & 4)
- HITL approval flow (Mode 3 & 4)
- Graph structure validation
- Conditional routing logic
- Error handling & fallbacks

**Commands**:
```bash
cd services/ai-engine
python3 -m pytest tests/langgraph_workflows/test_mode*_phase4.py -v
```

### **A.3: Smoke Tests**
**Quick validation**:
- Initialize all 4 workflow instances
- Verify pattern agents available
- Check Evidence-Based selector
- Validate HITL service

---

## 🔌 **OPTION B: BACKEND INTEGRATION** (After A)

### **B.1: Update Ask Expert API Endpoint**
**File**: `services/ai-engine/src/api/routes/ask_expert.py`

**Implementation**:
```python
from langgraph_workflows.mode1_manual_query import Mode1ManualInteractiveWorkflow
from langgraph_workflows.mode2_auto_query import Mode2AutoInteractiveWorkflow
from langgraph_workflows.mode3_manual_chat_autonomous import Mode3ManualChatAutonomousWorkflow
from langgraph_workflows.mode4_auto_chat_autonomous import Mode4AutoChatAutonomousWorkflow

@router.post("/v1/ai/ask-expert")
async def ask_expert(
    request: AskExpertRequest,
    user: User = Depends(get_current_user)
) -> AskExpertResponse:
    """
    Ask Expert endpoint with 4-mode system.
    
    Mode Selection:
    - isAutomatic=False, isAutonomous=False → Mode 1 (Manual-Interactive)
    - isAutomatic=True, isAutonomous=False → Mode 2 (Auto-Interactive)
    - isAutomatic=False, isAutonomous=True → Mode 3 (Manual-Autonomous)
    - isAutomatic=True, isAutonomous=True → Mode 4 (Auto-Autonomous)
    """
    # Determine mode
    if request.isAutomatic and request.isAutonomous:
        workflow_class = Mode4AutoChatAutonomousWorkflow
        mode_name = "Auto-Autonomous"
    elif not request.isAutomatic and request.isAutonomous:
        workflow_class = Mode3ManualChatAutonomousWorkflow
        mode_name = "Manual-Autonomous"
    elif request.isAutomatic and not request.isAutonomous:
        workflow_class = Mode2AutoInteractiveWorkflow
        mode_name = "Auto-Interactive"
    else:
        workflow_class = Mode1ManualInteractiveWorkflow
        mode_name = "Manual-Interactive"
    
    logger.info(f"Ask Expert request", mode=mode_name, user_id=user.id)
    
    # Initialize workflow
    workflow = workflow_class(
        supabase_client=supabase,
        rag_pipeline=rag_pipeline,
        # ... other dependencies
    )
    
    # Build state
    initial_state = {
        'query': request.query,
        'tenant_id': user.tenant_id,
        'user_id': user.id,
        'session_id': request.session_id or str(uuid.uuid4()),
        'selected_agents': request.selectedAgents or [],
        'hitl_enabled': request.hitlEnabled if hasattr(request, 'hitlEnabled') else True,
        'hitl_safety_level': request.hitlSafetyLevel if hasattr(request, 'hitlSafetyLevel') else 'balanced',
        'model': request.model or 'gpt-4',
        'messages': request.messages or []
    }
    
    # Execute workflow
    graph = workflow.build_graph()
    compiled = graph.compile()
    result = await compiled.ainvoke(initial_state)
    
    # Format response
    return AskExpertResponse(
        response=result.get('agent_response', ''),
        citations=result.get('citations', []),
        confidence=result.get('response_confidence', 0.0),
        tier=result.get('tier', 1),
        mode=mode_name,
        selected_agents=result.get('selected_agents', []),
        pattern_applied=result.get('pattern_applied', 'none'),
        safety_validated=result.get('safety_validated', False),
        session_id=result.get('session_id')
    )
```

### **B.2: Create API Schemas**
**File**: `services/ai-engine/src/api/schemas/ask_expert.py`

**Schemas**:
```python
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class HITLSafetyLevel(str, Enum):
    CONSERVATIVE = "conservative"
    BALANCED = "balanced"
    MINIMAL = "minimal"

class AskExpertRequest(BaseModel):
    """Ask Expert request schema"""
    query: str = Field(..., description="User query")
    session_id: Optional[str] = Field(None, description="Session ID for multi-turn")
    messages: Optional[List[dict]] = Field(default=[], description="Conversation history")
    
    # Mode selection
    isAutomatic: bool = Field(False, description="True = AI selects agent, False = User selects")
    isAutonomous: bool = Field(False, description="True = Deep work mode, False = Interactive chat")
    selectedAgents: Optional[List[str]] = Field(default=[], description="Pre-selected agent IDs (Manual modes)")
    
    # Phase 4 options
    hitlEnabled: bool = Field(True, description="Enable HITL approval checkpoints")
    hitlSafetyLevel: HITLSafetyLevel = Field(HITLSafetyLevel.BALANCED, description="HITL safety level")
    
    # LLM settings
    model: Optional[str] = Field("gpt-4", description="LLM model")
    temperature: Optional[float] = Field(0.7, description="LLM temperature")

class AskExpertResponse(BaseModel):
    """Ask Expert response schema"""
    response: str = Field(..., description="Agent response")
    citations: List[dict] = Field(default=[], description="Evidence citations")
    confidence: float = Field(..., description="Response confidence (0-1)")
    tier: int = Field(..., description="Execution tier (1-3)")
    mode: str = Field(..., description="Mode used (e.g., 'Auto-Autonomous')")
    selected_agents: List[str] = Field(..., description="Selected agent IDs")
    pattern_applied: str = Field(..., description="Pattern applied (e.g., 'react_constitutional')")
    safety_validated: bool = Field(..., description="Constitutional AI validation")
    session_id: str = Field(..., description="Session ID")
    
    # Phase 4 metadata
    selection_reasoning: Optional[str] = Field(None, description="Why these agents were selected")
    tier_reasoning: Optional[str] = Field(None, description="Why this tier was chosen")
    plan: Optional[dict] = Field(None, description="ToT plan (if Mode 3/4)")
```

### **B.3: OpenAPI Documentation**
**Add to API docs**:
- 4-mode matrix explanation
- HITL system guide
- Tier system guide
- Request/response examples for each mode

---

## 🎨 **OPTION C: FRONTEND INTEGRATION** (After B)

### **C.1: Mode Selector UI Component**
**File**: `apps/vital-system/src/components/ask-expert/ModeSelector.tsx`

**Features**:
- 2x2 toggle matrix (Automatic/Manual × Interactive/Autonomous)
- Visual mode descriptions
- Real-time mode preview
- Mode recommendation based on query

### **C.2: HITL Approval UI Components**
**Files**:
```
apps/vital-system/src/components/ask-expert/hitl/
├── HITLToggle.tsx (Enable/disable HITL)
├── SafetyLevelSelector.tsx (Conservative/Balanced/Minimal)
├── PlanApprovalModal.tsx (Approve/reject plan)
├── ToolApprovalModal.tsx (Approve/reject tool)
├── SubAgentApprovalModal.tsx (Approve/reject sub-agent)
└── DecisionApprovalModal.tsx (Approve/reject final decision)
```

**Features**:
- Approval modals with plan preview
- Safety level selector with explanations
- Approval history log
- Reject with feedback

### **C.3: Tier & Pattern Indicators**
**Components**:
- Tier badge (Tier 1/2/3 with color coding)
- Pattern execution progress (ToT → ReAct → Constitutional)
- Evidence-Based selection explanation
- GraphRAG search visualization

---

## 📊 **OPTION D: MONITORING & OBSERVABILITY** (After C)

### **D.1: Clinical AI Monitor**
**File**: `services/ai-engine/src/monitoring/clinical_monitor.py`

**Metrics**:
- Diagnostic metrics (sensitivity, specificity, precision, F1, AUROC)
- Drift detection (Kolmogorov-Smirnov test)
- Response time by tier
- Accuracy by tier
- Escalation rate

### **D.2: Fairness Monitor**
**File**: `services/ai-engine/src/monitoring/fairness_monitor.py`

**Metrics**:
- Demographic parity
- Equalized odds
- Bias detection by protected attributes
- Fairness alerts

### **D.3: Grafana Dashboards**
**Files**:
```
services/ai-engine/grafana-dashboards/
├── agentos-performance.json (Response times, throughput)
├── agentos-quality.json (Accuracy, confidence, tier distribution)
├── agentos-safety.json (HITL approvals, rejections, safety gates)
└── agentos-fairness.json (Demographic parity, bias alerts)
```

**Dashboards**:
1. **Performance**: Response time by mode, tier, pattern
2. **Quality**: Accuracy by tier, confidence distribution
3. **Safety**: HITL approval rate, rejection reasons
4. **Fairness**: Demographic parity, bias alerts

---

## 🚀 **OPTION E: COMPLETE AGENTOS 3.0** (After D)

### **E.1: Phase 5 - Monitoring & Safety** (Week 9-10)
**Tasks**:
- Clinical AI Monitor (complete)
- Fairness Monitor (complete)
- Monitoring dashboards (complete)
- Prometheus integration
- Langfuse tracing

### **E.2: Phase 6 - Integration & Testing** (Week 11-12)
**Tasks**:
- Comprehensive testing (unit + integration + performance)
- Load testing (100 concurrent users)
- Tier performance validation
- Evidence chain validation
- Escalation compliance testing
- Staging deployment
- User acceptance testing (UAT)
- Production deployment (canary)

---

## 📋 **PROGRESS TRACKING**

| Option | Status | Progress | ETA |
|--------|--------|----------|-----|
| **A: Testing** | 🔄 In Progress | 25% | 2 hours |
| **B: Backend** | ⏳ Pending | 0% | 3 hours |
| **C: Frontend** | ⏳ Pending | 0% | 4 hours |
| **D: Monitoring** | ⏳ Pending | 0% | 1 week |
| **E: AgentOS 3.0** | ⏳ Pending | 0% | 2 weeks |
| **TOTAL** | 🔄 In Progress | 5% | 2-3 weeks |

---

## 🎯 **SUCCESS CRITERIA**

**Option A Complete**:
- [✅] No linter errors
- [ ] All unit tests passing (>80% coverage)
- [ ] Smoke tests passing
- [ ] Integration tests passing

**Option B Complete**:
- [ ] API endpoint updated with 4-mode routing
- [ ] Request/response schemas created
- [ ] OpenAPI documentation complete
- [ ] End-to-end test passing

**Option C Complete**:
- [ ] Mode selector UI functional
- [ ] HITL approval UI functional
- [ ] Tier/pattern indicators visible
- [ ] User testing successful

**Option D Complete**:
- [ ] Clinical monitor operational
- [ ] Fairness monitor operational
- [ ] All 4 dashboards operational
- [ ] Metrics streaming to Prometheus

**Option E Complete**:
- [ ] Phase 5 complete (Monitoring & Safety)
- [ ] Phase 6 complete (Integration & Testing)
- [ ] Production deployment successful
- [ ] All AgentOS 3.0 goals met

---

## 📝 **NEXT IMMEDIATE ACTIONS**

1. ✅ Create unit test files for all 4 modes
2. ✅ Run tests and fix any failures
3. ✅ Create smoke test script
4. ✅ Update API endpoint with 4-mode routing
5. ✅ Create API schemas
6. Continue with Options C, D, E in sequence

---

**Status**: Option A in progress (Linting ✅, Tests next)  
**Current Focus**: Creating comprehensive unit tests for Phase 4 enhancements

