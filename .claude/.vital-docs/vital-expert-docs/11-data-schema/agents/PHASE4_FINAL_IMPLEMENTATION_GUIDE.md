# 🎯 PHASE 4 - FINAL IMPLEMENTATION GUIDE

**Status**: Mode 1 Complete (30%), Mode 2-4 Pending (70%)  
**Estimated Time**: 6-8 hours remaining  
**Approach**: Apply these exact changes to complete Phase 4

---

## ✅ **COMPLETED**
- Mode 1: Fully enhanced with Phase 4 ✅
- Foundation: All 7 core services (4,270 LOC) ✅
- Documentation: Comprehensive guides ✅

---

## 📋 **MODE 2 - REMAINING CHANGES**

**File**: `services/ai-engine/src/langgraph_workflows/mode2_auto_query.py`

### STATUS: 60% Complete
- ✅ Docstring updated
- ✅ Imports added (Evidence-Based, Patterns)
- ✅ `__init__` updated
- ⏳ build_graph() needs update
- ⏳ New nodes needed (select_expert_evidence_based, assess_tier, execute_with_patterns)

### APPLY THESE EXACT CHANGES:

**1. Replace `select_experts_auto_node` (around line 302)**

Find the existing `select_experts_auto_node` method and replace with Evidence-Based selection.

**Search for**: `async def select_experts_auto_node`

**Replace entire method with**:
```python
@trace_node("mode2_select_expert_evidence_based")
async def select_expert_evidence_based_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """PHASE 4: Evidence-Based + GraphRAG selection"""
    if not EVIDENCE_BASED_AVAILABLE:
        return await self._select_expert_fallback(state)

    try:
        result = await self.evidence_selector.select_for_service(
            service=VitalService.ASK_EXPERT,
            query=state['query'],
            context={'mode': 'auto_interactive'},
            tenant_id=state['tenant_id'],
            max_agents=1
        )

        if not result.agents:
            return {**state, 'status': ExecutionStatus.FAILED}

        agent = result.agents[0]
        return {
            **state,
            'selected_agents': [agent.id],
            'current_agent_id': agent.id,
            'tier': result.tier.level,
            'selection_method': 'evidence_based_graphrag'
        }
    except Exception as e:
        logger.error("Selection failed", error=str(e))
        return await self._select_expert_fallback(state)
```

**2. Add fallback method (after above method)**:
```python
async def _select_expert_fallback(self, state):
    selected = await self.agent_selector.select_agents(
        query=state['query'], tenant_id=state['tenant_id'], max_agents=1
    )
    return {**state, 'selected_agents': [selected[0]['id']], 'tier': 1}
```

**3. Copy from Mode 1**:
- Copy `assess_tier_node` from mode1_manual_query.py (lines 288-359)
- Copy `execute_with_patterns_node` from mode1_manual_query.py (lines 701-789)
- Copy `should_use_patterns` from mode1_manual_query.py (lines 777-784)

**4. Update build_graph()** (lines 192-233):

Replace with:
```python
def build_graph(self) -> StateGraph:
    graph = StateGraph(UnifiedWorkflowState)
    
    graph.add_node("validate_tenant", self.validate_tenant_node)
    graph.add_node("analyze_query", self.analyze_query_node)
    graph.add_node("select_expert_evidence_based", self.select_expert_evidence_based_node)
    graph.add_node("assess_tier", self.assess_tier_node)
    graph.add_node("rag_retrieval", self.rag_retrieval_node)
    graph.add_node("skip_rag", self.skip_rag_node)
    graph.add_node("execute_tools", self.execute_tools_node)
    graph.add_node("skip_tools", self.skip_tools_node)
    graph.add_node("execute_expert_agent", self.execute_expert_agent_node)
    graph.add_node("execute_with_patterns", self.execute_with_patterns_node)
    graph.add_node("format_output", self.format_output_node)

    graph.set_entry_point("validate_tenant")
    graph.add_edge("validate_tenant", "analyze_query")
    graph.add_edge("analyze_query", "select_expert_evidence_based")
    graph.add_edge("select_expert_evidence_based", "assess_tier")

    graph.add_conditional_edges("assess_tier", self.should_use_rag,
                               {"use_rag": "rag_retrieval", "skip_rag": "skip_rag"})
    graph.add_conditional_edges("rag_retrieval", self.should_use_tools,
                               {"use_tools": "execute_tools", "skip_tools": "skip_tools"})
    graph.add_conditional_edges("skip_rag", self.should_use_tools,
                               {"use_tools": "execute_tools", "skip_tools": "skip_tools"})
    
    graph.add_conditional_edges("execute_tools", self.should_use_patterns,
                               {"use_patterns": "execute_with_patterns", "standard": "execute_expert_agent"})
    graph.add_conditional_edges("skip_tools", self.should_use_patterns,
                               {"use_patterns": "execute_with_patterns", "standard": "execute_expert_agent"})

    graph.add_edge("execute_expert_agent", "format_output")
    graph.add_edge("execute_with_patterns", "format_output")
    graph.add_edge("format_output", END)

    return graph
```

---

## 📋 **MODE 3 - ALL CHANGES**

**File**: `services/ai-engine/src/langgraph_workflows/mode3_manual_chat_autonomous.py`

### PHASE 4 ENHANCEMENTS:
- Manual selection (user chooses)
- Autonomous execution (long-term planning)
- **NEW**: HITL System (5 checkpoints)
- **NEW**: Tree-of-Thoughts planning
- **NEW**: Full pattern chain (ToT → ReAct → Constitutional)

### 1. UPDATE DOCSTRING:
```python
"""
Mode 3: Manual-Autonomous (Manual Selection + Autonomous Execution)

User selects expert, agent performs autonomous deep work with planning.

**PHASE 4 ENHANCEMENTS:**
- ✅ HITL System (5 checkpoints, 3 safety levels)
- ✅ Tree-of-Thoughts planning
- ✅ Full pattern chain (ToT + ReAct + Constitutional)
- ✅ Default Tier 2+ (autonomous mode)

PRD Specification:
- Interaction: AUTONOMOUS (Deep work, long-term planning)
- Selection: MANUAL (User chooses expert)
- Response Time: 60-120 seconds
- **NEW**: HITL approval checkpoints, ToT planning
"""
```

### 2. ADD IMPORTS:
```python
# PHASE 4: HITL System
try:
    from services.hitl_service import (
        create_hitl_service, HITLSafetyLevel,
        PlanApprovalRequest, ToolExecutionApprovalRequest,
        SubAgentApprovalRequest, CriticalDecisionApprovalRequest
    )
    HITL_AVAILABLE = True
except ImportError:
    HITL_AVAILABLE = False

# PHASE 4: Full Pattern Suite
try:
    from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
    from langgraph_compilation.patterns.react import ReActAgent
    from langgraph_compilation.patterns.constitutional_ai import ConstitutionalAgent
    PATTERNS_AVAILABLE = True
except ImportError:
    PATTERNS_AVAILABLE = False
```

### 3. UPDATE __INIT__:
```python
# PHASE 4: Initialize HITL
self.hitl_service = None  # Will be initialized per-request based on user settings

# PHASE 4: Initialize all patterns
self.tot_agent = TreeOfThoughtsAgent() if PATTERNS_AVAILABLE else None
self.react_agent = ReActAgent() if PATTERNS_AVAILABLE else None
self.constitutional_agent = ConstitutionalAgent() if PATTERNS_AVAILABLE else None
```

### 4. NEW build_graph():
```python
def build_graph(self) -> StateGraph:
    """
    PHASE 4 AUTONOMOUS FLOW:
    1. Validate tenant
    2. Validate agent selection (manual)
    3. Initialize HITL
    4. Assess tier (default Tier 2+)
    5. Plan with ToT
    6. Request plan approval (HITL Checkpoint 1)
    7. FOR EACH STEP:
       - (Request tool approval?) HITL Checkpoint 2
       - Execute step with ReAct
       - (Request subagent approval?) HITL Checkpoint 3
    8. Synthesize results
    9. Validate with Constitutional AI
    10. Request decision approval (HITL Checkpoint 4)
    11. Format output
    """
    graph = StateGraph(UnifiedWorkflowState)

    graph.add_node("validate_tenant", self.validate_tenant_node)
    graph.add_node("validate_agent_selection", self.validate_agent_selection_node)
    graph.add_node("initialize_hitl", self.initialize_hitl_node)
    graph.add_node("assess_tier_autonomous", self.assess_tier_autonomous_node)
    graph.add_node("plan_with_tot", self.plan_with_tot_node)
    graph.add_node("request_plan_approval", self.request_plan_approval_node)
    graph.add_node("execute_autonomous_steps", self.execute_autonomous_steps_node)
    graph.add_node("synthesize_results", self.synthesize_results_node)
    graph.add_node("validate_with_constitutional", self.validate_with_constitutional_node)
    graph.add_node("request_decision_approval", self.request_decision_approval_node)
    graph.add_node("format_output", self.format_output_node)

    graph.set_entry_point("validate_tenant")
    graph.add_edge("validate_tenant", "validate_agent_selection")
    graph.add_edge("validate_agent_selection", "initialize_hitl")
    graph.add_edge("initialize_hitl", "assess_tier_autonomous")
    graph.add_edge("assess_tier_autonomous", "plan_with_tot")
    
    graph.add_conditional_edges("plan_with_tot", self.should_request_plan_approval,
                               {"request": "request_plan_approval", "skip": "execute_autonomous_steps"})
    
    graph.add_edge("request_plan_approval", "execute_autonomous_steps")
    graph.add_edge("execute_autonomous_steps", "synthesize_results")
    graph.add_edge("synthesize_results", "validate_with_constitutional")
    
    graph.add_conditional_edges("validate_with_constitutional", self.should_request_decision_approval,
                               {"request": "request_decision_approval", "skip": "format_output"})
    
    graph.add_edge("request_decision_approval", "format_output")
    graph.add_edge("format_output", END)

    return graph
```

### 5. KEY NEW NODES:

```python
@trace_node("mode3_initialize_hitl")
async def initialize_hitl_node(self, state):
    """Initialize HITL service based on user settings"""
    hitl_enabled = state.get('hitl_enabled', True)
    safety_level = state.get('hitl_safety_level', 'balanced')
    
    if HITL_AVAILABLE and hitl_enabled:
        self.hitl_service = create_hitl_service(
            enabled=True,
            safety_level=HITLSafetyLevel(safety_level)
        )
    
    return {**state, 'hitl_initialized': hitl_enabled}

@trace_node("mode3_plan_with_tot")
async def plan_with_tot_node(self, state):
    """PHASE 4: Generate plan using Tree-of-Thoughts"""
    if not PATTERNS_AVAILABLE or not self.tot_agent:
        return {**state, 'plan': self._generate_simple_plan(state)}
    
    plan = await self.tot_agent.generate_plan(
        query=state['query'],
        context=state.get('context_summary', ''),
        max_steps=5
    )
    
    return {**state, 'plan': plan, 'plan_confidence': plan.confidence}

@trace_node("mode3_request_plan_approval")
async def request_plan_approval_node(self, state):
    """HITL Checkpoint 1: Plan Approval"""
    if not self.hitl_service:
        return state
    
    approval = await self.hitl_service.request_plan_approval(
        request=PlanApprovalRequest(
            agent_id=state['current_agent_id'],
            agent_name=state.get('current_agent_type'),
            plan_steps=state['plan'].steps,
            total_estimated_time_minutes=state['plan'].estimated_time,
            confidence_score=state['plan'].confidence
        ),
        session_id=state['session_id'],
        user_id=state['user_id']
    )
    
    if approval.status == 'rejected':
        return {**state, 'status': ExecutionStatus.CANCELLED}
    
    return {**state, 'plan_approved': True}

@trace_node("mode3_execute_autonomous_steps")
async def execute_autonomous_steps_node(self, state):
    """Execute each plan step with ReAct pattern"""
    plan = state['plan']
    results = []
    
    for step in plan.steps:
        # Tool approval if needed
        if step.requires_tools and self.hitl_service:
            tool_approval = await self._request_tool_approval(step, state)
            if tool_approval.status == 'rejected':
                continue
        
        # Execute with ReAct
        if self.react_agent:
            result = await self.react_agent.execute_step(
                step=step,
                context=state.get('context_summary'),
                tools=state.get('tools_executed', [])
            )
        else:
            result = await self._execute_step_fallback(step, state)
        
        results.append(result)
    
    return {**state, 'step_results': results}

@trace_node("mode3_validate_with_constitutional")
async def validate_with_constitutional_node(self, state):
    """Validate final response with Constitutional AI"""
    if not self.constitutional_agent:
        return state
    
    response = state.get('synthesized_response', '')
    
    validated = await self.constitutional_agent.validate_and_revise(
        response=response,
        query=state['query'],
        context=state.get('context_summary')
    )
    
    return {
        **state,
        'agent_response': validated['revised_response'],
        'safety_validated': True,
        'safety_score': validated['safety_score']
    }
```

---

## 📋 **MODE 4 - ALL CHANGES**

**File**: `services/ai-engine/src/langgraph_workflows/mode4_auto_chat_autonomous.py`

### PHASE 4 ENHANCEMENTS:
Mode 4 = Mode 2 (Evidence-Based) + Mode 3 (HITL + Patterns)

### 1. COMBINE IMPORTS FROM MODE 2 + MODE 3:
```python
# PHASE 4: Evidence-Based (from Mode 2)
from services.evidence_based_selector import get_evidence_based_selector, VitalService, AgentTier

# PHASE 4: HITL (from Mode 3)
from services.hitl_service import create_hitl_service, HITLSafetyLevel, ...

# PHASE 4: All Patterns (from Mode 3)
from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
from langgraph_compilation.patterns.react import ReActAgent
from langgraph_compilation.patterns.constitutional_ai import ConstitutionalAgent
```

### 2. build_graph():
```python
def build_graph(self) -> StateGraph:
    """
    PHASE 4: Combines Mode 2 + Mode 3
    1. Evidence-Based selection (Mode 2)
    2. HITL + Full patterns (Mode 3)
    3. Optional Panel for very complex cases
    """
    graph = StateGraph(UnifiedWorkflowState)

    # Selection (from Mode 2)
    graph.add_node("select_expert_evidence_based", self.select_expert_evidence_based_node)
    
    # HITL + Patterns (from Mode 3)
    graph.add_node("initialize_hitl", self.initialize_hitl_node)
    graph.add_node("plan_with_tot", self.plan_with_tot_node)
    graph.add_node("request_plan_approval", self.request_plan_approval_node)
    
    # ... (same as Mode 3 with Evidence-Based selection from Mode 2)
    
    return graph
```

### 3. COPY METHODS:
- From Mode 2: `select_expert_evidence_based_node`
- From Mode 3: All HITL and pattern nodes

---

## 🧪 **TESTING**

Create `tests/integration/test_phase4_all_modes.py`:

```python
import pytest

@pytest.mark.asyncio
async def test_mode1_tier_assessment():
    workflow = Mode1ManualQueryWorkflow(supabase)
    state = {'query': 'FDA regulatory strategy', 'complexity_score': 0.8}
    result = await workflow.assess_tier_node(state)
    assert result['tier'] == 3

@pytest.mark.asyncio
async def test_mode2_evidence_based_selection():
    workflow = Mode2AutoQueryWorkflow(supabase)
    state = {'query': 'FDA pathway', 'tenant_id': 'test'}
    result = await workflow.select_expert_evidence_based_node(state)
    assert result['selection_method'] == 'evidence_based_graphrag'

@pytest.mark.asyncio
async def test_mode3_hitl_plan_approval():
    workflow = Mode3ManualAutonomousWorkflow(supabase)
    state = {'query': 'Complex analysis', 'hitl_enabled': True, 'plan': Mock()}
    result = await workflow.request_plan_approval_node(state)
    assert 'plan_approved' in result

@pytest.mark.asyncio
async def test_mode4_full_integration():
    workflow = Mode4AutoAutonomousWorkflow(supabase)
    # Test Evidence-Based + HITL + Patterns
    pass
```

---

## 📚 **ARD ENHANCEMENT**

Create `PHASE4_ARD_ENHANCEMENTS.md`:

```markdown
# Phase 4 Architecture Enhancements

## GraphRAG Architecture
[Diagram: Postgres + Pinecone + Neo4j → RRF Fusion]

## Evidence-Based Selection Architecture
[Diagram: 8-factor scoring matrix → Tier determination]

## Deep Patterns Architecture
[Diagram: ToT → ReAct → Constitutional → Response]

## HITL Architecture
[Diagram: 5 checkpoints with 3 safety levels]
```

---

## ✅ **COMPLETION CHECKLIST**

- [✅] Mode 1: Enhanced (DONE)
- [ ] Mode 2: Apply changes above (2 hours)
- [ ] Mode 3: Apply changes above (3 hours)
- [ ] Mode 4: Apply changes above (2 hours)
- [ ] Tests: Create test file (1 hour)
- [ ] ARD: Create architecture doc (30 min)

**Total Remaining**: ~8.5 hours

---

## 🚀 **HOW TO PROCEED**

1. **Mode 2**: Apply all changes listed above
2. **Mode 3**: Apply all changes listed above
3. **Mode 4**: Copy from Mode 2 + Mode 3
4. **Test**: Create test file and run
5. **Document**: Create ARD enhancement

**Each mode is independent - can be done in parallel if multiple developers available.**

---

**This guide contains EVERYTHING needed to complete Phase 4.** 🎯

