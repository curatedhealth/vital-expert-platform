# 🎯 PHASE 4 (REVISED): ASK EXPERT SERVICE - DEEP PATTERNS INTEGRATION

## 📊 **DISCOVERY: Ask Expert Already Has 4 Modes!**

Found the complete Ask Expert implementation with all 4 modes:

| Mode | Type | Selection | File | Status |
|------|------|-----------|------|--------|
| **Mode 1** | Query (One-Shot) | Manual | `mode1_manual_query.py` | ✅ Exists (802 LOC) |
| **Mode 2** | Query (One-Shot) | Automatic | `mode2_auto_query.py` | ✅ Exists (~700 LOC) |
| **Mode 3** | Chat (Multi-Turn) | Manual | `mode3_manual_chat_autonomous.py` | ✅ Exists (~800 LOC) |
| **Mode 4** | Chat (Multi-Turn) | Automatic | `mode4_auto_chat_autonomous.py` | ✅ Exists (~800 LOC) |

---

## 🎯 **REVISED OBJECTIVE**

**Integrate Evidence-Based Agent Selection + Deep Agent Patterns into the existing 4-mode Ask Expert service.**

---

## 📋 **ASK EXPERT 4-MODE MATRIX**

```
                    AUTOMATIC Selection  │  MANUAL Selection
                    (AI Picks Experts)   │  (User Picks Expert)
                                        │
QUERY         ┌──────────────────────────┼──────────────────────────┐
(One-Shot)    │  MODE 2: Query-Auto     │  MODE 1: Query-Manual   │
              │  Multi-agent synthesis   │  Single expert answer   │
              │  15-25s response time    │  15-25s response time   │
              │  3-5 experts             │  1 expert               │
              └──────────────────────────┼──────────────────────────┘
                                        │
CHAT          ┌──────────────────────────┼──────────────────────────┐
(Multi-Turn)  │  MODE 4: Chat-Auto      │  MODE 3: Chat-Manual    │
              │  Dynamic expert switching│  Single expert dialogue │
              │  20-30s response time    │  2-4s response time     │
              │  2-5 experts (dynamic)   │  1 expert               │
              └──────────────────────────┼──────────────────────────┘
```

---

## 🔍 **CURRENT STATE ANALYSIS**

### ✅ **What Exists**

1. **4 Mode Workflows** (3,100+ LOC)
   - All 4 modes implemented with LangGraph
   - Deep agent support (5-level hierarchy)
   - RAG, tools, multimodal support
   - Caching, observability, monitoring

2. **Deep Agent Patterns** (1,000 LOC)
   - Tree-of-Thoughts
   - ReAct
   - Constitutional AI

3. **Evidence-Based Selector** (1,109 LOC)
   - 8-factor scoring
   - 3-tier system
   - Safety gates

### ❌ **What's Missing**

1. **No integration** between Evidence-Based Selector and 4 modes
2. **No integration** between Deep Patterns and 4 modes
3. **No automatic pattern selection** based on tier/complexity
4. **No hierarchical pattern execution** with agent delegation

---

## 📋 **IMPLEMENTATION PLAN (FOCUSED)**

### **Phase 4.1: Integrate Evidence-Based Selector (Week 1)**

#### **Task 1.1: Update Mode 2 (Query-Auto) - Automatic Selection** 🔵
**File**: `mode2_auto_query.py`

**Current**: Uses basic agent selection  
**New**: Use `EvidenceBasedAgentSelector` with 8-factor scoring

**Changes**:
1. Replace existing agent selection with Evidence-Based Selector
2. Get tier recommendation
3. Get pattern recommendation
4. Select 3-5 agents based on tier
5. Apply safety gates

**Code Change**:
```python
# OLD (line ~100)
selected_agents = await self.agent_selector.select_agents(query, mode="auto")

# NEW
from services.evidence_based_selector import get_evidence_based_selector, VitalService

selector = get_evidence_based_selector()
result = await selector.select_for_service(
    service=VitalService.ASK_EXPERT,
    query=state['query'],
    context={
        'mode': 'query_auto',
        'user_id': state.get('user_id'),
        'session_id': state.get('session_id')
    },
    tenant_id=state['tenant_id'],
    max_agents=5  # Mode 2 uses 3-5 agents
)

# Use result.agents (with tier, pattern recommendation, safety gates)
state['selected_agents'] = result.agents
state['tier'] = result.tier.value
state['pattern_recommendation'] = result.selection_metadata.get('pattern')
state['requires_human_oversight'] = result.requires_human_oversight
```

---

#### **Task 1.2: Update Mode 4 (Chat-Auto) - Automatic Selection** 🟣
**File**: `mode4_auto_chat_autonomous.py`

**Current**: Uses basic agent selection for each turn  
**New**: Use Evidence-Based Selector with dynamic agent switching

**Changes**:
1. Use Evidence-Based Selector for initial agents
2. Re-evaluate agents on topic shifts
3. Apply tier-based constraints
4. Enable pattern execution for Tier 3

**Code Change**:
```python
# Initial agent selection (NEW)
result = await selector.select_for_service(
    service=VitalService.ASK_EXPERT,
    query=state['query'],
    context={
        'mode': 'chat_auto',
        'conversation_history': state.get('messages', [])
    },
    tenant_id=state['tenant_id'],
    max_agents=3  # Start with 3, can add more dynamically
)

# Dynamic agent switching on topic shift
if topic_shift_detected:
    new_result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query=new_topic_query,
        context={'previous_agents': state['active_agents']},
        tenant_id=state['tenant_id'],
        max_agents=2  # Add 1-2 new specialists
    )
```

---

### **Phase 4.2: Integrate Deep Patterns (Week 2)**

#### **Task 2.1: Create Pattern Executor** 🎬
**File**: `services/ai-engine/src/services/pattern_executor.py`

**Purpose**: Execute deep patterns based on tier and mode

```python
class PatternExecutor:
    """Execute deep agent patterns for Ask Expert modes"""
    
    async def execute_for_mode(
        self,
        mode: str,  # 'mode1', 'mode2', 'mode3', 'mode4'
        tier: AgentTier,
        agents: List[AgentScore],
        query: str,
        context: Dict
    ) -> PatternExecutionResult:
        """
        Execute appropriate pattern based on mode and tier
        
        Mode 1 (Query-Manual):
          Tier 1: Standard execution
          Tier 2: ReAct (if tools needed)
          Tier 3: ReAct + Constitutional
        
        Mode 2 (Query-Auto):
          Tier 1: Standard multi-agent
          Tier 2: ReAct for each agent
          Tier 3: ToT (planning) + ReAct (execution) + Constitutional (safety)
        
        Mode 3 (Chat-Manual):
          Tier 1: Standard conversation
          Tier 2: ReAct for tool-heavy turns
          Tier 3: ReAct + Constitutional
        
        Mode 4 (Chat-Auto):
          Tier 1: Standard multi-agent chat
          Tier 2: ReAct + Dynamic switching
          Tier 3: ToT (strategy) + ReAct (execution) + Constitutional (safety)
        """
```

---

#### **Task 2.2: Integrate Patterns into Mode 1** 🔵
**File**: `mode1_manual_query.py`

**Changes**:
1. Add tier determination
2. Execute pattern based on tier
3. Apply Constitutional AI for Tier 3

**Code**:
```python
# After agent selection
tier = self._determine_tier(state)

if tier == AgentTier.TIER_3:
    # Use ReAct + Constitutional
    pattern_result = await self.pattern_executor.execute_for_mode(
        mode='mode1',
        tier=tier,
        agents=[selected_agent],
        query=state['query'],
        context=state
    )
    state['response'] = pattern_result.safe_response
    state['used_pattern'] = 'react_constitutional'
elif tier == AgentTier.TIER_2:
    # Use ReAct if tools needed
    if tools_required:
        pattern_result = await self.pattern_executor.execute_react(
            agent=selected_agent,
            query=state['query'],
            tools=available_tools
        )
        state['response'] = pattern_result.response
else:
    # Tier 1: Standard execution
    state['response'] = await self._standard_execution(state)
```

---

#### **Task 2.3: Integrate Patterns into Mode 2** 🔵
**File**: `mode2_auto_query.py`

**Changes**:
1. Use ToT for Tier 3 (planning which agents to use)
2. Use ReAct for execution
3. Apply Constitutional for safety
4. Synthesize multi-agent responses

**Code**:
```python
if tier == AgentTier.TIER_3:
    # Step 1: ToT for planning
    planning_result = await self.pattern_executor.execute_tot(
        query=state['query'],
        agents=selected_agents,
        max_depth=3
    )
    
    # Step 2: ReAct for execution with each agent
    agent_responses = []
    for agent in planning_result.selected_agents:
        response = await self.pattern_executor.execute_react(
            agent=agent,
            query=state['query'],
            plan=planning_result.best_plan
        )
        agent_responses.append(response)
    
    # Step 3: Synthesize responses
    synthesis = await self._synthesize_responses(agent_responses)
    
    # Step 4: Constitutional AI for safety
    final = await self.pattern_executor.execute_constitutional(
        response=synthesis,
        query=state['query']
    )
    
    state['response'] = final.safe_response
    state['used_patterns'] = ['tot', 'react', 'constitutional']
```

---

#### **Task 2.4: Integrate Patterns into Mode 3** 🟣
**File**: `mode3_manual_chat_autonomous.py`

**Changes**:
1. Use ReAct for tool-heavy turns
2. Apply Constitutional for all Tier 3 responses

---

#### **Task 2.5: Integrate Patterns into Mode 4** 🟣
**File**: `mode4_auto_chat_autonomous.py`

**Changes**:
1. Use ToT for conversation strategy
2. Use ReAct for agent execution
3. Apply Constitutional for safety
4. Dynamic pattern selection per turn

---

### **Phase 4.3: Testing & Validation (Week 3)**

#### **Task 3.1: Integration Tests** 🧪
**File**: `tests/integration/test_ask_expert_patterns.py`

**Tests**:
1. ✅ Mode 1 with Tier 3 uses Constitutional
2. ✅ Mode 2 with Tier 3 uses ToT + ReAct + Constitutional
3. ✅ Mode 3 uses ReAct for tools
4. ✅ Mode 4 uses dynamic patterns
5. ✅ Evidence-Based Selector works in all modes
6. ✅ Safety gates enforced in Tier 3

---

#### **Task 3.2: End-to-End Tests** 🔗
**File**: `tests/e2e/test_ask_expert_e2e.py`

**Scenarios**:
1. User asks simple question (Mode 1, Tier 1)
2. User asks complex FDA question (Mode 1, Tier 3) → Constitutional enforced
3. System selects 5 experts for multi-domain question (Mode 2, Tier 3) → ToT + ReAct + Constitutional
4. User has extended chat with expert (Mode 3, Tier 2) → ReAct for tools
5. System orchestrates dynamic expert switching (Mode 4, Tier 3) → Full pattern chain

---

### **Phase 4.4: Documentation (Week 4)**

#### **Task 4.1: Integration Guide** 📚
**File**: `ASK_EXPERT_PATTERNS_INTEGRATION.md`

**Contents**:
- How patterns are selected per mode
- Tier-based pattern execution
- Safety gate enforcement
- Performance benchmarks
- Usage examples

---

#### **Task 4.2: API Documentation** 📖
**File**: Update `ASK_EXPERT_API.md`

**Changes**:
- Add `tier` to response
- Add `pattern_used` to response
- Add `safety_gates_applied` to response
- Update examples

---

## 📊 **DELIVERABLES**

| Deliverable | Files | LOC | Status |
|-------------|-------|-----|--------|
| Evidence-Based Integration | 4 mode files | ~400 | ⏳ |
| Pattern Executor | 1 new file | ~500 | ⏳ |
| Pattern Integration | 4 mode files | ~600 | ⏳ |
| Integration Tests | 2 new files | ~400 | ⏳ |
| Documentation | 2 new files | ~600 | ⏳ |
| **TOTAL** | **13 files** | **~2,500** | **⏳** |

---

## ⏱️ **TIMELINE**

| Phase | Tasks | Duration | Deliverables |
|-------|-------|----------|--------------|
| **Phase 4.1** | Evidence-Based Integration | 3 days | Mode 2 & 4 updated |
| **Phase 4.2** | Pattern Integration | 4 days | Pattern Executor + All 4 modes |
| **Phase 4.3** | Testing | 2 days | Integration + E2E tests |
| **Phase 4.4** | Documentation | 1 day | 2 comprehensive docs |
| **TOTAL** | - | **10 days** | **13 files updated/created** |

---

## 🎯 **SUCCESS CRITERIA**

1. ✅ All 4 modes use Evidence-Based Agent Selector
2. ✅ Tier 3 queries always use Constitutional AI
3. ✅ Mode 2 Tier 3 uses full pattern chain (ToT → ReAct → Constitutional)
4. ✅ Safety gates enforced 100% in Tier 3
5. ✅ Response quality improves for Tier 3 (target: 95%+ accuracy)
6. ✅ All tests passing (>80% coverage)

---

## 🚀 **EXECUTION APPROACH**

**Recommended: Incremental Mode-by-Mode**

### **Sprint 1 (Days 1-3): Mode 2 (Query-Auto)**
- Integrate Evidence-Based Selector
- Add Pattern Executor
- Implement ToT + ReAct + Constitutional for Tier 3
- Test Mode 2

### **Sprint 2 (Days 4-6): Mode 4 (Chat-Auto)**
- Integrate Evidence-Based Selector
- Add dynamic pattern switching
- Test Mode 4

### **Sprint 3 (Days 7-8): Modes 1 & 3**
- Add simpler pattern integration
- Test Modes 1 & 3

### **Sprint 4 (Days 9-10): Testing & Docs**
- Comprehensive testing
- Documentation

---

## ❓ **YOUR DECISION**

**Which approach do you prefer?**

1. **Full Implementation** (10 days, all 4 modes)
2. **Start with Mode 2 Only** (3 days, Query-Auto with full patterns)
3. **Start with Modes 2 & 4** (6 days, both automatic modes)
4. **Custom** (tell me your priorities)

**My Recommendation**: **Option 2 - Start with Mode 2**
- Highest complexity (multi-agent + Tier 3)
- Demonstrates full pattern chain (ToT → ReAct → Constitutional)
- Quick win (3 days)
- Easy to extend to other modes

**What would you like to proceed with?**

