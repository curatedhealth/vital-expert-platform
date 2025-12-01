# 🎯 PHASE 4 IMPLEMENTATION - COMPLETION GUIDE

**Purpose**: Complete remaining Mode 2-4 enhancements  
**Time Remaining**: ~3 hours  
**Status**: Mode 1 Complete (25%), Mode 2-4 Pending (75%)

---

## ✅ **MODE 1 COMPLETE - REFERENCE PATTERN**

Mode 1 successfully enhanced with:
- Tier assessment (assess_tier_node)
- Pattern execution (execute_with_patterns_node)
- Conditional branching (should_use_patterns)
- Graceful fallbacks

**Use Mode 1 as the template for Mode 2-4 enhancements.**

---

## 📋 **MODE 2 ENHANCEMENT (45 min)**

**File**: `services/ai-engine/src/langgraph_workflows/mode2_auto_query.py`

### **Step 1: Update Docstring**
Replace lines 1-37 with:
```python
"""
Mode 2: Auto-Interactive (Auto Selection + Interactive Chat)

AI automatically selects best expert using Evidence-Based Selection + GraphRAG.

**PHASE 4 ENHANCEMENTS:**
- ✅ Evidence-Based Agent Selection (8-factor scoring)
- ✅ GraphRAG Hybrid Search (30/50/20 fusion)
- ✅ Tier-aware pattern execution
- ✅ Deep Agent Patterns (ReAct + Constitutional for Tier 3)

PRD Specification:
- Interaction: INTERACTIVE (Multi-turn conversation)
- Selection: AUTO (Evidence-Based + GraphRAG)
- Response Time: 25-40 seconds
- Experts: 1 best expert automatically selected
- **NEW**: GraphRAG discovery, Tier determination
...
"""
```

### **Step 2: Add Phase 4 Imports**
Add after line 69 (before `logger = ...`):
```python
# PHASE 4: Evidence-Based Selector + GraphRAG
try:
    from services.evidence_based_selector import (
        get_evidence_based_selector,
        VitalService,
        AgentTier
    )
    EVIDENCE_BASED_AVAILABLE = True
except ImportError:
    EVIDENCE_BASED_AVAILABLE = False

# PHASE 4: Deep Agent Patterns
try:
    from langgraph_compilation.patterns.react import ReActAgent
    from langgraph_compilation.patterns.constitutional_ai import ConstitutionalAgent
    PATTERNS_AVAILABLE = True
except ImportError:
    PATTERNS_AVAILABLE = False

logger = structlog.get_logger()
```

### **Step 3: Update `__init__` Method**
Add Phase 4 services after existing initialization:
```python
# Initialize compliance & safety services
self.compliance_service = compliance_service or ComplianceService(supabase_client)
self.human_validator = human_validator or HumanInLoopValidator()

# PHASE 4: Initialize Evidence-Based Selector
self.evidence_selector = get_evidence_based_selector() if EVIDENCE_BASED_AVAILABLE else None

# PHASE 4: Initialize deep agent patterns
self.react_agent = ReActAgent() if PATTERNS_AVAILABLE else None
self.constitutional_agent = ConstitutionalAgent() if PATTERNS_AVAILABLE else None

logger.info("✅ Mode2AutoQueryWorkflow initialized",
           evidence_based_enabled=EVIDENCE_BASED_AVAILABLE,
           patterns_enabled=PATTERNS_AVAILABLE)
```

### **Step 4: Replace Agent Selection Node**
Find `select_experts_node` method and replace with Evidence-Based Selection:
```python
@trace_node("mode2_select_expert_evidence_based")
async def select_experts_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    PHASE 4: Node - Select best expert using Evidence-Based Selector + GraphRAG

    Uses:
    - GraphRAG Hybrid Search (30% Postgres + 50% Pinecone + 20% Neo4j)
    - 8-factor scoring matrix
    - Tier determination
    """
    if not EVIDENCE_BASED_AVAILABLE:
        logger.warning("Evidence-Based Selector not available, using fallback")
        return await self._select_experts_fallback(state)

    tenant_id = state['tenant_id']
    query = state['query']

    try:
        # Evidence-Based Selection with GraphRAG
        result = await self.evidence_selector.select_for_service(
            service=VitalService.ASK_EXPERT,
            query=query,
            context={
                'mode': 'auto_interactive',
                'conversation_history': state.get('messages', [])
            },
            tenant_id=tenant_id,
            max_agents=1  # Single best expert for interactive chat
        )

        if not result.agents:
            return {
                **state,
                'status': ExecutionStatus.FAILED,
                'errors': state.get('errors', []) + ["No suitable expert found"]
            }

        selected_agent = result.agents[0]
        tier = result.tier
        confidence_breakdown = result.confidence_breakdown

        logger.info(
            "Expert selected via Evidence-Based + GraphRAG",
            agent_id=selected_agent.id,
            agent_name=selected_agent.name,
            tier=tier.value,
            confidence=selected_agent.final_score,
            breakdown=confidence_breakdown
        )

        return {
            **state,
            'selected_agents': [selected_agent.id],
            'current_agent_id': selected_agent.id,
            'current_agent_type': selected_agent.name,
            'agent_tier': tier.value,
            'tier': tier.level,  # 1, 2, or 3
            'selection_confidence': selected_agent.final_score,
            'confidence_breakdown': confidence_breakdown,
            'selection_method': 'evidence_based_graphrag',
            'current_node': 'select_experts'
        }

    except Exception as e:
        logger.error("Evidence-Based selection failed", error=str(e))
        return await self._select_experts_fallback(state)

async def _select_experts_fallback(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Fallback to basic agent selection if Evidence-Based unavailable"""
    # Use existing AgentSelectorService as fallback
    agent_selector = AgentSelectorService(self.supabase)
    selected = await agent_selector.select_agents(
        query=state['query'],
        tenant_id=state['tenant_id'],
        max_agents=1
    )
    
    return {
        **state,
        'selected_agents': [selected[0]['id']],
        'current_agent_id': selected[0]['id'],
        'tier': 1,  # Default to Tier 1
        'selection_method': 'fallback',
        'current_node': 'select_experts'
    }
```

### **Step 5: Add Tier Assessment Node**
Copy the `assess_tier_node` from Mode 1 (lines 288-359 in mode1_manual_query.py).

### **Step 6: Add Pattern Execution Node**
Copy the `execute_with_patterns_node` from Mode 1 (lines 701-789 in mode1_manual_query.py).

### **Step 7: Update build_graph Method**
Add tier assessment and pattern branching:
```python
def build_graph(self) -> StateGraph:
    """
    Build LangGraph workflow for Mode 2.

    **PHASE 4 ENHANCED FLOW:**
    1. Validate tenant
    2. **NEW**: Select expert (Evidence-Based + GraphRAG)
    3. **NEW**: Assess tier
    4. RAG retrieval
    5. Tool execution
    6. Execute expert → **BRANCH**: Tier 3 uses patterns
    7. Format output

    Returns:
        Configured StateGraph
    """
    graph = StateGraph(UnifiedWorkflowState)

    # Add nodes
    graph.add_node("validate_tenant", self.validate_tenant_node)
    graph.add_node("select_experts", self.select_experts_node)  # PHASE 4: Enhanced
    graph.add_node("assess_tier", self.assess_tier_node)  # PHASE 4: NEW
    graph.add_node("analyze_query_complexity", self.analyze_query_complexity_node)
    graph.add_node("rag_retrieval", self.rag_retrieval_node)
    graph.add_node("skip_rag", self.skip_rag_node)
    graph.add_node("execute_tools", self.execute_tools_node)
    graph.add_node("skip_tools", self.skip_tools_node)
    graph.add_node("execute_expert_agent", self.execute_expert_agent_node)
    graph.add_node("execute_with_patterns", self.execute_with_patterns_node)  # PHASE 4: NEW
    graph.add_node("format_output", self.format_output_node)

    # Define flow
    graph.set_entry_point("validate_tenant")
    graph.add_edge("validate_tenant", "select_experts")
    graph.add_edge("select_experts", "assess_tier")  # PHASE 4: NEW
    graph.add_edge("assess_tier", "analyze_query_complexity")

    # RAG branch
    graph.add_conditional_edges(
        "analyze_query_complexity",
        self.should_use_rag,
        {"use_rag": "rag_retrieval", "skip_rag": "skip_rag"}
    )

    # Tool branch
    graph.add_conditional_edges(
        "rag_retrieval",
        self.should_use_tools,
        {"use_tools": "execute_tools", "skip_tools": "skip_tools"}
    )

    graph.add_conditional_edges(
        "skip_rag",
        self.should_use_tools,
        {"use_tools": "execute_tools", "skip_tools": "skip_tools"}
    )

    # PHASE 4: Pattern branch
    graph.add_conditional_edges(
        "execute_tools",
        self.should_use_patterns,  # PHASE 4: NEW
        {"use_patterns": "execute_with_patterns", "standard": "execute_expert_agent"}
    )

    graph.add_conditional_edges(
        "skip_tools",
        self.should_use_patterns,  # PHASE 4: NEW
        {"use_patterns": "execute_with_patterns", "standard": "execute_expert_agent"}
    )

    # Converge to output
    graph.add_edge("execute_expert_agent", "format_output")
    graph.add_edge("execute_with_patterns", "format_output")
    graph.add_edge("format_output", END)

    return graph
```

### **Step 8: Add Conditional Edge Function**
Copy `should_use_patterns` from Mode 1.

---

## 📋 **MODE 3 ENHANCEMENT (60 min)**

**File**: `services/ai-engine/src/langgraph_workflows/mode3_manual_chat_autonomous.py`

Mode 3 = Mode 1 + HITL + ToT

### **Additional Imports**:
```python
# PHASE 4: HITL System
try:
    from services.hitl_service import (
        create_hitl_service,
        HITLSafetyLevel,
        PlanApprovalRequest,
        ToolExecutionApprovalRequest,
        SubAgentApprovalRequest,
        CriticalDecisionApprovalRequest
    )
    HITL_AVAILABLE = True
except ImportError:
    HITL_AVAILABLE = False

# PHASE 4: Tree-of-Thoughts
try:
    from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
    from langgraph_compilation.patterns.react import ReActAgent
    from langgraph_compilation.patterns.constitutional_ai import ConstitutionalAgent
    PATTERNS_AVAILABLE = True
except ImportError:
    PATTERNS_AVAILABLE = False
```

### **New Nodes**:
1. `initialize_hitl_node` - Set up HITL service based on state
2. `plan_with_tot_node` - Generate plan using Tree-of-Thoughts
3. `request_plan_approval_node` - HITL Checkpoint 1
4. `execute_autonomous_step_node` - Execute each plan step
5. `request_tool_approval_node` - HITL Checkpoint 2 (conditional)
6. `request_subagent_approval_node` - HITL Checkpoint 3 (conditional)
7. `synthesize_results_node` - Combine all step results
8. `request_decision_approval_node` - HITL Checkpoint 4

### **Graph Flow**:
```
validate_tenant → validate_agent_selection → initialize_hitl → 
assess_tier (default Tier 2+) → plan_with_tot → request_plan_approval →
[FOR EACH STEP]:
  → (request_tool_approval?) → execute_autonomous_step → 
  → (request_subagent_approval?) → 
→ synthesize_results → request_decision_approval → format_output
```

---

## 📋 **MODE 4 ENHANCEMENT (75 min)**

**File**: `services/ai-engine/src/langgraph_workflows/mode4_auto_chat_autonomous.py`

Mode 4 = Mode 2 + Mode 3 (Evidence-Based + HITL + Full Patterns)

### **Combines**:
- Evidence-Based Selector (from Mode 2)
- HITL System (from Mode 3)
- Full pattern chain (ToT + ReAct + Constitutional + optional Panel)

### **Key Difference**:
Mode 4 can use **Panel** for very complex Tier 3 cases:
```python
if tier == 3 and requires_panel:
    # Spawn panel of 3-5 experts
    panel_response = await self.panel_service.execute_panel(...)
```

---

## 🧪 **TESTING (30 min)**

Create `tests/integration/test_phase4_modes.py`:

```python
import pytest
from langgraph_workflows.mode1_manual_query import Mode1ManualQueryWorkflow
from langgraph_workflows.mode2_auto_query import Mode2AutoQueryWorkflow
from langgraph_workflows.mode3_manual_chat_autonomous import Mode3ManualAutonomousWorkflow
from langgraph_workflows.mode4_auto_chat_autonomous import Mode4AutoAutonomousWorkflow

@pytest.mark.asyncio
async def test_mode1_tier_assessment():
    """Test Mode 1 tier assessment"""
    workflow = Mode1ManualQueryWorkflow(supabase_client)
    
    # Tier 1 query (simple)
    state = {'query': 'What is FDA?', 'tenant_id': 'test', 'selected_agents': ['agent-1']}
    result = await workflow.assess_tier_node(state)
    assert result['tier'] == 1

    # Tier 3 query (regulatory + complex)
    state = {'query': 'Comprehensive FDA 510(k) submission strategy with risk analysis', 'tenant_id': 'test', 'selected_agents': ['agent-1'], 'complexity_score': 0.8}
    result = await workflow.assess_tier_node(state)
    assert result['tier'] == 3
    assert result['requires_patterns'] == True

@pytest.mark.asyncio
async def test_mode2_evidence_based_selection():
    """Test Mode 2 Evidence-Based agent selection"""
    workflow = Mode2AutoQueryWorkflow(supabase_client)
    
    state = {'query': 'FDA regulatory pathway', 'tenant_id': 'test'}
    result = await workflow.select_experts_node(state)
    
    assert 'current_agent_id' in result
    assert result['selection_method'] == 'evidence_based_graphrag'
    assert 'tier' in result
    assert 'confidence_breakdown' in result

# ... more tests for Mode 3 & 4
```

---

## 📚 **DOCUMENTATION (15 min)**

1. **ARD Enhancement** (`PHASE4_ARD_ENHANCEMENTS.md`)
2. **Integration Guide** (`PHASE4_INTEGRATION_GUIDE.md`)
3. **Testing Guide** (`PHASE4_TESTING_GUIDE.md`)

---

## ✅ **COMPLETION CHECKLIST**

- [✅] Mode 1: Enhanced with Phase 4 (DONE)
- [ ] Mode 2: Add Evidence-Based + GraphRAG + Patterns
- [ ] Mode 3: Add HITL + ToT + Full Pattern Chain
- [ ] Mode 4: Combine Mode 2 + Mode 3
- [ ] ARD: Create Phase 4 architecture document
- [ ] Tests: Integration tests for all 4 modes
- [ ] Docs: User guides and API documentation

---

**Total Remaining**: ~3 hours

**Next Step**: Continue with Mode 2 enhancement following the steps above.

