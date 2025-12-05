# Mode 3: Manual Autonomous - Architecture Requirements Document (ARD)

## Document Information
- **Version:** 1.0
- **Date:** December 4, 2025
- **Status:** Active Development
- **Owner:** VITAL Platform Team
- **Related PRD:** [MODE_3_PRD.md](./MODE_3_PRD.md)

---

## 1. Architecture Overview

### 1.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VITAL PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐         ┌─────────────────────────────────────────────┐   │
│  │   Frontend  │         │              AI Engine (FastAPI)            │   │
│  │  (Next.js)  │◄───────►│  ┌─────────────────────────────────────────┐│   │
│  │             │   SSE   │  │       Mode 3 Workflow (LangGraph)       ││   │
│  └─────────────┘         │  │  ┌───────┐ ┌───────┐ ┌───────────────┐ ││   │
│                          │  │  │  ToT  │→│ ReAct │→│Constitutional ││ ││   │
│                          │  │  └───────┘ └───────┘ └───────────────┘ ││   │
│                          │  │              ↓                          ││   │
│                          │  │  ┌────────────────────────────────────┐││   │
│                          │  │  │      HITL Service (5 Checkpoints)  │││   │
│                          │  │  └────────────────────────────────────┘││   │
│                          │  │              ↓                          ││   │
│                          │  │  ┌────────────────────────────────────┐││   │
│                          │  │  │   Deep Agent Hierarchy (L1-L5)     │││   │
│                          │  │  └────────────────────────────────────┘││   │
│                          │  └─────────────────────────────────────────┘│   │
│                          └─────────────────────────────────────────────┘   │
│                                         ↓                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Data & Services Layer                         │   │
│  │  ┌──────────┐ ┌────────────┐ ┌───────────┐ ┌────────────────────┐  │   │
│  │  │ Supabase │ │ Pinecone   │ │ OpenAI    │ │ LangFuse Monitor   │  │   │
│  │  │ (Agents) │ │ (Vectors)  │ │ (LLM)     │ │ (Observability)    │  │   │
│  │  └──────────┘ └────────────┘ └───────────┘ └────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Golden Rules Compliance

| Rule | Implementation | File Location |
|------|----------------|---------------|
| #1 LangGraph StateGraph | `Mode3ManualAutonomousWorkflow` extends `BaseWorkflow` | `mode3_manual_autonomous.py:177` |
| #2 Caching | Agent config cache, conversation cache | `mode3_manual_autonomous.py:274-275` |
| #3 Tenant Isolation | Tenant ID validated in all state operations | `state_schemas.py` |
| #4 RAG/Tools | `UnifiedRAGService`, `ToolRegistry` | `mode3_manual_autonomous.py:108-109` |
| #5 Evidence-Based | `EvidenceDetector`, `MultiDomainEvidenceDetector` | `mode3_manual_autonomous.py:131-134` |

---

## 2. Component Architecture

### 2.1 Mode 3 Workflow Class

**File:** `services/ai-engine/src/langgraph_workflows/mode3_manual_autonomous.py`

```python
class Mode3ManualAutonomousWorkflow(BaseWorkflow):
    """
    Primary workflow class for Mode 3: Manual Autonomous

    Inheritance: BaseWorkflow → Mode3ManualAutonomousWorkflow
    Pattern: LangGraph StateGraph with conditional routing
    """

    def __init__(self, ...):
        # Core Services
        self.supabase              # Database client
        self.agent_orchestrator    # Agent execution (AgentOrchestrator)
        self.sub_agent_spawner     # Sub-agent lifecycle (SubAgentSpawner)
        self.rag_service           # RAG retrieval (UnifiedRAGService)
        self.tool_registry         # Tool management (ToolRegistry)
        self.conversation_manager  # History (EnhancedConversationManager)
        self.session_memory_service # Long-term memory (SessionMemoryService)

        # Pattern Agents (Phase 4)
        self.tot_agent             # Tree-of-Thoughts (planning)
        self.react_agent           # ReAct (execution)
        self.constitutional_agent  # Constitutional AI (validation)

        # Deep Agents Tools
        self.deepagents_tools      # TodoManager, VirtualFS, SubagentManager

        # HITL Service (initialized per-request)
        self.hitl_service          # HITLService instance
```

### 2.2 LangGraph StateGraph Definition

```python
def build_workflow(self) -> StateGraph:
    """
    Mode 3 Workflow Graph Structure

    Nodes: 12 (including HITL checkpoints)
    Edges: Conditional routing based on tier, HITL status
    """
    graph = StateGraph(UnifiedWorkflowState)

    # Node Definitions
    graph.add_node("initialize_hitl", self.initialize_hitl_node)
    graph.add_node("validate_input", self.validate_input_node)
    graph.add_node("load_agent_config", self.load_agent_config_node)
    graph.add_node("load_conversation_history", self.load_conversation_history_node)
    graph.add_node("assess_tier_autonomous", self.assess_tier_autonomous_node)
    graph.add_node("plan_with_tot", self.plan_with_tot_node)
    graph.add_node("hitl_plan_approval", self.hitl_plan_approval_node)
    graph.add_node("execute_with_react", self.execute_with_react_node)
    graph.add_node("hitl_tool_approval", self.hitl_tool_approval_node)
    graph.add_node("validate_with_constitutional", self.validate_with_constitutional_node)
    graph.add_node("hitl_final_review", self.hitl_final_review_node)
    graph.add_node("format_response", self.format_response_node)

    # Edge Definitions (simplified)
    graph.set_entry_point("initialize_hitl")
    graph.add_edge("initialize_hitl", "validate_input")
    graph.add_edge("validate_input", "load_agent_config")
    graph.add_edge("load_agent_config", "load_conversation_history")
    graph.add_edge("load_conversation_history", "assess_tier_autonomous")

    # Conditional: ToT for Tier 3
    graph.add_conditional_edges(
        "assess_tier_autonomous",
        lambda s: "plan_with_tot" if s.get('requires_tot') else "execute_with_react"
    )

    graph.add_edge("plan_with_tot", "hitl_plan_approval")
    graph.add_edge("hitl_plan_approval", "execute_with_react")
    graph.add_edge("execute_with_react", "hitl_tool_approval")
    graph.add_edge("hitl_tool_approval", "validate_with_constitutional")
    graph.add_edge("validate_with_constitutional", "hitl_final_review")
    graph.add_edge("hitl_final_review", "format_response")
    graph.add_edge("format_response", END)

    return graph.compile()
```

### 2.3 Node Flow Diagram

```
                    ┌─────────────────┐
                    │  START          │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ initialize_hitl │ → HITL Service setup
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ validate_input  │ → Query validation
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │load_agent_config│ → Load user-selected agent
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │load_conversation│ → Retrieve history
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │assess_tier_auto │ → Determine Tier 2 or 3
                    └────────┬────────┘
                             ↓
                  ┌──────────┴──────────┐
                  │ requires_tot?       │
                  └──────────┬──────────┘
             YES ↙           ↘ NO
    ┌─────────────────┐       │
    │  plan_with_tot  │       │
    └────────┬────────┘       │
             ↓                │
    ┌─────────────────┐       │
    │hitl_plan_approve│ ← HITL Checkpoint #1
    └────────┬────────┘       │
             ↓                │
             └────────┬───────┘
                      ↓
             ┌─────────────────┐
             │execute_with_react│ → ReAct loop
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │hitl_tool_approve│ ← HITL Checkpoint #2
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │validate_constit │ → Safety validation
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │hitl_final_review│ ← HITL Checkpoint #5
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │ format_response │ → Prepare output
             └────────┬────────┘
                      ↓
                    ┌─────────────────┐
                    │      END        │
                    └─────────────────┘
```

---

## 3. Deep Agent Hierarchy Architecture

### 3.1 5-Level Agent System

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HUMAN ←─── L1→Human (HITL approval at 5 checkpoints)                   │
│   ↓                                                                     │
│ L1: MASTER AGENTS (Autonomous Task Coordinator)                         │
│   ├── Role: Task decomposition, coordination, HITL triggers            │
│   ├── Delegation: L1→L2 (route to user-selected expert)                │
│   ├── Escalation: L2→L1 (cross-domain, complexity exceeded)            │
│   └── Service: AgentHierarchyService.orchestrate_l1()                  │
│                                                                         │
│ L2: EXPERT AGENTS (USER-SELECTED from 1000+ Agent Store)               │
│   ├── Role: Domain expertise, task execution                           │
│   ├── Delegation: L2→L3 (spawn specialists during execution)           │
│   ├── Escalation: L3→L2 (task exceeds specialization)                  │
│   └── Selection: Manual by user from Agent Store UI                    │
│                                                                         │
│ L3: SPECIALIST AGENTS (Spawned on-demand with HITL approval)           │
│   ├── Role: Sub-domain tasks, parallel execution                       │
│   ├── Delegation: L3→L4 (parallel workers for tasks)                   │
│   ├── Escalation: L4→L3 (resource limits)                              │
│   └── Approval: HITL Checkpoint #3 (sub-agent spawning)                │
│                                                                         │
│ L4: WORKER AGENTS (Parallel task executors)                            │
│   ├── Role: Task execution, data processing                            │
│   ├── Delegation: L4→L5 (tool execution with approval)                 │
│   └── Escalation: L5→L4 (tool failures)                                │
│                                                                         │
│ L5: TOOL AGENTS (RAG, Web Search, Code Execution, Database)            │
│   ├── Role: Atomic tool operations                                     │
│   ├── Tools: UnifiedRAGService, CodeExecutor, WebSearcher              │
│   └── Approval: HITL Checkpoint #2 (tool execution)                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Delegation & Escalation Patterns

**File:** `services/ai-engine/src/services/agent_hierarchy_service.py`

| Pattern | Direction | Trigger | HITL Required |
|---------|-----------|---------|---------------|
| Vertical Delegation | L1→L2→L3→L4→L5 | Task decomposition | L3, L5 |
| Horizontal Delegation | L4↔L4 | Parallel tasks | No |
| Priority Escalation | L5→L4→L3→L2→L1 | Failures, limits | Optional |
| Human Escalation | L1→Human | Critical decisions | Yes |

---

## 4. HITL System Architecture

### 4.1 HITL Service

**File:** `services/ai-engine/src/services/hitl_service.py`

```python
class HITLService:
    """
    Human-In-The-Loop approval service for Mode 3

    Safety Levels:
    - strict: Approve every tool, sub-agent, and decision
    - balanced: Approve plans, high-risk tools, critical decisions
    - permissive: Approve only critical decisions
    """

    def __init__(self, enabled: bool, safety_level: HITLSafetyLevel):
        self.enabled = enabled
        self.safety_level = safety_level

    async def request_plan_approval(self, plan: PlanApprovalRequest) -> bool:
        """HITL Checkpoint #1: Plan approval before execution"""

    async def request_tool_execution(self, tool: ToolExecutionApprovalRequest) -> bool:
        """HITL Checkpoint #2: Tool execution approval"""

    async def request_sub_agent_spawn(self, agent: SubAgentApprovalRequest) -> bool:
        """HITL Checkpoint #3: Sub-agent spawning approval"""

    async def request_critical_decision(self, decision: CriticalDecisionApprovalRequest) -> bool:
        """HITL Checkpoint #4: High-stakes decision approval"""

    async def request_final_review(self, response: FinalReviewRequest) -> bool:
        """HITL Checkpoint #5: Final response approval"""
```

### 4.2 HITL Checkpoints Matrix

| Checkpoint | Node | Safety Level Required | Timeout |
|------------|------|----------------------|---------|
| #1 Plan Approval | `hitl_plan_approval_node` | balanced, strict | 300s |
| #2 Tool Execution | `hitl_tool_approval_node` | strict | 60s |
| #3 Sub-Agent Spawn | (within execute) | balanced, strict | 120s |
| #4 Critical Decision | (within execute) | all | 180s |
| #5 Final Review | `hitl_final_review_node` | balanced, strict | 120s |

---

## 5. Pattern Agents Architecture

### 5.1 Tree-of-Thoughts (ToT) Agent

**File:** `langgraph_compilation/patterns/tree_of_thoughts.py`

```python
class TreeOfThoughtsAgent:
    """
    Multi-path reasoning for complex planning tasks

    Flow:
    1. Generate N initial thoughts (branches)
    2. Evaluate each thought for viability
    3. Expand promising branches
    4. Synthesize optimal path
    5. Return structured plan
    """

    async def generate_plan(self, query: str, context: dict) -> Plan:
        thoughts = await self._generate_initial_thoughts(query, n=3)
        evaluated = await self._evaluate_thoughts(thoughts)
        expanded = await self._expand_best_thoughts(evaluated, depth=2)
        return await self._synthesize_plan(expanded)
```

### 5.2 ReAct Agent

**File:** `langgraph_compilation/patterns/react.py`

```python
class ReActAgent:
    """
    Reasoning + Acting execution loop

    Loop:
    1. Thought: Reason about current state
    2. Action: Select tool or sub-action
    3. Observation: Process result
    4. Repeat until task complete
    """

    async def execute(self, plan: Plan, tools: ToolRegistry) -> ExecutionResult:
        while not self._is_complete():
            thought = await self._generate_thought()
            action = await self._select_action(thought, tools)
            observation = await self._execute_action(action)
            self._update_state(observation)
        return self._finalize()
```

### 5.3 Constitutional AI Agent

**File:** `langgraph_compilation/patterns/constitutional_ai.py`

```python
class ConstitutionalAgent:
    """
    Safety validation at each step

    Principles:
    - No harmful content
    - Factual accuracy
    - Evidence-based claims
    - Regulatory compliance
    - Tenant data isolation
    """

    async def validate(self, content: str, context: dict) -> ValidationResult:
        violations = await self._check_principles(content)
        if violations:
            revision = await self._generate_revision(content, violations)
            return ValidationResult(valid=False, revision=revision)
        return ValidationResult(valid=True, content=content)
```

---

## 6. State Schema

**File:** `services/ai-engine/src/langgraph_workflows/state_schemas.py`

```python
class UnifiedWorkflowState(TypedDict):
    # Core Identifiers
    session_id: str
    tenant_id: str
    agent_id: str

    # Query & Context
    query: str
    conversation_history: List[dict]

    # Agent Configuration
    agent_config: dict
    tier: int  # 2 or 3 for Mode 3

    # Execution State
    current_node: str
    execution_status: ExecutionStatus

    # HITL State
    hitl_enabled: bool
    hitl_initialized: bool
    hitl_safety_level: str
    pending_approval: Optional[dict]

    # Pattern State
    requires_tot: bool
    requires_constitutional: bool
    plan: Optional[Plan]

    # Response
    response: str
    citations: List[dict]
    evidence: List[dict]

    # Execution Trace
    execution_trace: List[dict]
    errors: List[str]
```

---

## 7. Service Dependencies

### 7.1 Internal Services

| Service | Purpose | File |
|---------|---------|------|
| `AgentOrchestrator` | Agent execution with LangChain | `services/agent_orchestrator.py` |
| `SubAgentSpawner` | Sub-agent lifecycle management | `services/sub_agent_spawner.py` |
| `UnifiedRAGService` | Vector DB retrieval | `services/unified_rag_service.py` |
| `ToolRegistry` | Tool management & execution | `services/tool_registry.py` |
| `EnhancedConversationManager` | Conversation history | `services/enhanced_conversation_manager.py` |
| `SessionMemoryService` | Long-term session memory | `services/session_memory_service.py` |
| `ComplianceService` | HIPAA/regulatory compliance | `services/compliance_service.py` |
| `AgentHierarchyService` | 5-level hierarchy management | `services/agent_hierarchy_service.py` |
| `LangFuseMonitor` | Observability & tracing | `services/langfuse_monitor.py` |
| `EvidenceDetector` | Evidence classification | `services/evidence_detector.py` |
| `DeepAgentsTools` | TodoManager, VirtualFS, SubagentManager | `services/deepagents_tools.py` |

### 7.2 External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| Supabase | Agent storage, sessions | `SUPABASE_URL`, `SUPABASE_KEY` |
| Pinecone | Vector embeddings | `PINECONE_API_KEY`, `PINECONE_ENV` |
| OpenAI | LLM inference | `OPENAI_API_KEY` |
| LangFuse | Observability | `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` |

---

## 8. API Architecture

### 8.1 Endpoint Definition

**File:** `services/ai-engine/src/api/routers/mode3_router.py`

```python
@router.post("/api/mode3/autonomous-manual")
async def mode3_autonomous_manual(
    request: Mode3Request,
    tenant_id: str = Header(..., alias="x-tenant-id"),
    user: Optional[dict] = Depends(get_optional_user)
) -> StreamingResponse:
    """
    Mode 3: Manual Autonomous endpoint

    Returns: Server-Sent Events (SSE) stream
    """
    workflow = Mode3ManualAutonomousWorkflow(supabase)

    async def event_generator():
        async for event in workflow.run_streaming(request, tenant_id):
            if event['type'] == 'hitl_request':
                yield f"data: {json.dumps(event)}\n\n"
            elif event['type'] == 'token':
                yield f"data: {json.dumps(event)}\n\n"
            elif event['type'] == 'done':
                yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

### 8.2 Request/Response Schemas

```python
class Mode3Request(BaseModel):
    agent_id: UUID
    message: str
    session_id: Optional[UUID] = None
    enable_rag: bool = True
    hitl_enabled: bool = True
    hitl_safety_level: Literal['strict', 'balanced', 'permissive'] = 'balanced'
    max_execution_time: int = 120

class Mode3StreamEvent(BaseModel):
    type: Literal['hitl_request', 'token', 'tool_call', 'done']
    checkpoint_type: Optional[str] = None
    approval_request: Optional[dict] = None
    content: Optional[str] = None
    citations: Optional[List[dict]] = None
    execution_trace: Optional[List[dict]] = None
```

---

## 9. Error Handling & Recovery

### 9.1 Error Types

| Error | Handler | Recovery Strategy |
|-------|---------|-------------------|
| HITL Timeout | Workflow pauses | Resume from checkpoint |
| LLM Rate Limit | Exponential backoff | Retry 3x, then fail |
| Tool Execution Failed | Log, escalate | Fallback to L3 escalation |
| Sub-Agent Spawn Failed | Log, notify | Continue without sub-agent |
| Constitutional Violation | Regenerate | Revise response |

### 9.2 Checkpoint Recovery

```python
async def resume_from_checkpoint(self, session_id: str, checkpoint_id: str):
    """
    Resume workflow from a stored checkpoint

    Checkpoints are stored in SessionMemoryService with full state
    """
    state = await self.session_memory_service.load_checkpoint(
        session_id, checkpoint_id
    )
    return await self.workflow.invoke(state)
```

---

## 10. Observability

### 10.1 LangFuse Integration

**File:** `services/ai-engine/src/services/langfuse_monitor.py`

```python
class LangFuseMonitor:
    """
    Observability for all Mode 3 executions

    Traces:
    - Full workflow execution
    - Individual node execution times
    - LLM calls with tokens
    - Tool executions
    - HITL checkpoint wait times
    """

    @trace_node("mode3_execute")
    async def trace_execution(self, state: dict, node_name: str):
        self.langfuse.trace(
            name=f"mode3_{node_name}",
            input=state,
            metadata={
                'tier': state.get('tier'),
                'hitl_enabled': state.get('hitl_enabled')
            }
        )
```

### 10.2 Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `mode3_execution_time` | Total workflow time | P95 < 120s |
| `mode3_hitl_wait_time` | Time waiting for HITL | P50 < 30s |
| `mode3_llm_tokens` | Total tokens used | Track for cost |
| `mode3_tool_calls` | Number of tool invocations | Track |
| `mode3_subagent_spawns` | Sub-agents spawned | Track |

---

## 11. Security Considerations

### 11.1 Authentication

| Layer | Method |
|-------|--------|
| API Gateway | JWT validation |
| AI Engine | `get_optional_user` for HITL endpoints |
| Database | Row-level security (RLS) by tenant |

### 11.2 Data Classification

| Classification | Handling |
|----------------|----------|
| Public | Standard logging |
| Confidential | Encrypted at rest, audit trail |
| Restricted | No logging of content, encrypted |
| PHI | HIPAA compliance, encrypted, audit |

---

## 12. Deployment Configuration

### 12.1 Environment Variables

```bash
# Core
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=xxx

# Vector DB
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=xxx

# Observability
LANGFUSE_PUBLIC_KEY=xxx
LANGFUSE_SECRET_KEY=xxx
LANGFUSE_HOST=https://cloud.langfuse.com

# Mode 3 Specific
MODE3_DEFAULT_TIER=2
MODE3_MAX_EXECUTION_TIME=120
MODE3_HITL_DEFAULT_SAFETY=balanced
```

### 12.2 Resource Requirements

| Resource | Development | Production |
|----------|-------------|------------|
| CPU | 2 cores | 8 cores |
| Memory | 4GB | 16GB |
| Workers | 2 | 8 |
| Timeout | 120s | 300s |

---

## 13. Testing Strategy

### 13.1 Unit Tests

| Component | Test File |
|-----------|-----------|
| Mode3Workflow | `tests/test_mode3_workflow.py` |
| HITL Service | `tests/test_hitl_service.py` |
| ToT Agent | `tests/test_tree_of_thoughts.py` |
| ReAct Agent | `tests/test_react_agent.py` |

### 13.2 Integration Tests

| Scenario | Description |
|----------|-------------|
| Happy Path | Full workflow with all HITL approvals |
| HITL Timeout | Verify checkpoint recovery |
| Sub-Agent Spawn | Verify L3 agent spawning |
| Constitutional Violation | Verify response revision |

---

## 14. Known Issues & Fixes Applied

| Issue | Root Cause | Fix | Status |
|-------|------------|-----|--------|
| HITL router import error | Missing `get_optional_user` | Added to `auth.py` | ✅ Fixed |
| Value Investigator crash | `langchain_anthropic` not installed | Added OpenAI fallback | ✅ Fixed |
| Checkpoint manager error | AsyncGenerator misuse | Falls back to memory | ⚠️ Workaround |

---

## 15. Appendix

### A. File References

| Component | Path |
|-----------|------|
| Mode 3 Workflow | `services/ai-engine/src/langgraph_workflows/mode3_manual_autonomous.py` |
| State Schemas | `services/ai-engine/src/langgraph_workflows/state_schemas.py` |
| Base Workflow | `services/ai-engine/src/langgraph_workflows/base_workflow.py` |
| HITL Service | `services/ai-engine/src/services/hitl_service.py` |
| Agent Hierarchy | `services/ai-engine/src/services/agent_hierarchy_service.py` |
| Auth Module | `services/ai-engine/src/api/auth.py` |
| Mode 3 Router | `services/ai-engine/src/api/routers/mode3_router.py` |

### B. Related Documents

- [MODE_3_PRD.md](./MODE_3_PRD.md) - Product Requirements Document
- [AGENT_0S_BUSINESS_GUIDE.md](../AGENT_0S_BUSINESS_GUIDE.md) - Agent Hierarchy Guide
- [WORKFLOW_GOLD_STANDARD_CROSSCHECK.md](./WORKFLOW_GOLD_STANDARD_CROSSCHECK.md) - Golden Rules
