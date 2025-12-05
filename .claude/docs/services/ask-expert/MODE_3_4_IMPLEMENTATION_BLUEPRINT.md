# Mode 3/4 Implementation Blueprint

**Date:** December 5, 2025
**Status:** SYNTHESIZED EXPERT RECOMMENDATIONS
**Source Agents:** vital-code-reviewer, frontend-ui-architect, visual-design-brand-strategist, data-architecture-expert, python-ai-ml-engineer

---

## Executive Summary

All 5 specialized agents have reviewed the Mode 3/4 architecture proposal and the critical audit report. This document synthesizes their recommendations into a unified implementation blueprint.

### Unanimous Critical Finding

**⛔ BLOCK ALL DEVELOPMENT until security vulnerabilities are fixed:**

| ID | Severity | Description | Impact |
|----|----------|-------------|--------|
| SEC-001 | CRITICAL | Tenant isolation bypass | Cross-tenant data access |
| SEC-002 | CRITICAL | HITL fail-open policy | Security bypass on error |
| SEC-003 | HIGH | No input sanitization | Prompt injection |
| SEC-004 | HIGH | No rate limiting | DoS vulnerability |
| SEC-005 | MEDIUM | Verbose error messages | Information leakage |

---

## Part 1: Security Fixes (P0 - Mandatory Before Any Development)

### 1.1 Fail-Closed HITL Pattern (SEC-002 Fix)

**Current (DANGEROUS):**
```python
except Exception as e:
    logger.error(f"HITL check failed: {e}")
    return {"hitl_approved": True}  # FAIL-OPEN!
```

**Required (SECURE):**
```python
async def check_hitl_approval(
    state: Mode3State,
    checkpoint_type: HITLCheckpointType,
    config: RunnableConfig
) -> HITLDecision:
    """FAIL-CLOSED HITL checkpoint - always reject on error."""
    try:
        # Check if checkpoint required based on autonomy level
        autonomy_level = state.get("autonomy_level", "balanced")

        if not requires_hitl(checkpoint_type, autonomy_level):
            return HITLDecision(
                approved=True,
                checkpoint_type=checkpoint_type,
                auto_approved=True,
                reason="not_required_for_autonomy_level"
            )

        # Request human approval
        pending_request = HITLRequest(
            checkpoint_type=checkpoint_type,
            context=build_checkpoint_context(state, checkpoint_type),
            timeout_seconds=300,
            auto_reject_on_timeout=True  # FAIL-CLOSED
        )

        state["pending_hitl_requests"].append(pending_request)

        # Emit SSE event for frontend
        await emit_sse(state["emitter"], SSEEventType.HITL_REQUEST, {
            "request_id": pending_request.id,
            "checkpoint_type": checkpoint_type.value,
            "context": pending_request.context,
            "timeout": pending_request.timeout_seconds
        })

        # Wait for response with timeout
        response = await wait_for_hitl_response(
            request_id=pending_request.id,
            timeout=pending_request.timeout_seconds
        )

        if response is None:
            # Timeout - FAIL-CLOSED
            return HITLDecision(
                approved=False,
                checkpoint_type=checkpoint_type,
                reason="timeout",
                auto_rejected=True
            )

        return response

    except Exception as e:
        # ANY error = FAIL-CLOSED (reject)
        logger.error(f"HITL check failed: {e}", exc_info=True)
        return HITLDecision(
            approved=False,
            checkpoint_type=checkpoint_type,
            reason="error",
            auto_rejected=True,
            error_message=str(e)
        )
```

### 1.2 Tenant Isolation (SEC-001 Fix)

**Required: Add tenant_id to ALL queries:**
```python
# Agent query
agent = await supabase.from_("agents") \
    .select("*") \
    .eq("id", agent_id) \
    .eq("tenant_id", tenant_id) \
    .single()

# Session query
session = await supabase.from_("autonomous_sessions") \
    .select("*") \
    .eq("session_id", session_id) \
    .eq("tenant_id", tenant_id) \
    .single()

# Knowledge query
docs = await supabase.from_("knowledge_documents") \
    .select("*") \
    .eq("tenant_id", tenant_id) \
    .limit(100)
```

### 1.3 Input Sanitization (SEC-003 Fix)

```python
class QuerySanitizer:
    """Sanitize user input to prevent prompt injection."""

    INJECTION_PATTERNS = [
        r"ignore\s+(previous|above|all)\s+instructions",
        r"system\s*:\s*",
        r"<\|im_start\|>",
        r"<\|endoftext\|>",
        r"\[INST\]",
        r"<<SYS>>",
        r"OVERRIDE:",
        r"ADMIN:",
        r"ROOT:",
    ]

    @classmethod
    def sanitize(cls, query: str) -> tuple[str, list[str]]:
        """Return (sanitized_query, detected_issues)."""
        issues = []
        sanitized = query

        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, query, re.IGNORECASE):
                issues.append(f"Potential injection pattern: {pattern}")
                sanitized = re.sub(pattern, "[FILTERED]", sanitized, flags=re.IGNORECASE)

        # Length limit
        if len(sanitized) > 10000:
            issues.append("Query truncated (max 10000 chars)")
            sanitized = sanitized[:10000]

        return sanitized, issues
```

### 1.4 Rate Limiting (SEC-004 Fix)

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/mode3/stream")
@limiter.limit("10/minute")  # 10 requests per minute per IP
@limiter.limit("100/hour")   # 100 requests per hour per IP
async def stream_mode3(request: Request, ...):
    pass
```

---

## Part 2: JTBD Template Architecture

### 2.1 Eight JTBD Templates

| Template | Goal | Key Behavior | Output |
|----------|------|--------------|--------|
| **Deep Research** | Comprehensive analysis with citations | Multi-source RAG, citation tracking | Research report with sources |
| **Strategy Shaping** | Strategic options with trade-offs | Option generation, SWOT analysis | Decision matrix |
| **Tactical Planning** | Step-by-step execution plan | Task decomposition, dependencies | Project plan |
| **Evaluation/Critique** | Critical analysis | Multi-perspective review | Scored assessment |
| **Creative Ideation** | Novel solutions | Divergent thinking, brainstorming | Ranked ideas |
| **Monitoring/Alerting** | Watchlist tracking | Trigger detection, threshold checking | Alert report |
| **Decision Memo** | Executive decision support | Evidence synthesis, recommendation | Decision memo |
| **Risk Assessment** | Safety/risk analysis | Risk matrix, mitigation strategies | Risk register |

### 2.2 Template Schema

```python
@dataclass
class JTBDTemplate:
    """Declarative JTBD workflow definition."""

    id: str                           # e.g., "deep_research"
    name: str                         # e.g., "Deep Research / Investigation"
    description: str

    # Agent hierarchy config
    agent_levels: AgentLevelConfig    # L1-L5 assignment

    # Workflow phases
    phases: List[PhaseConfig]         # Ordered execution phases

    # HITL configuration
    hitl_checkpoints: List[HITLCheckpointType]
    autonomy_default: AutonomyLevel   # strict/balanced/permissive

    # Reasoning config
    reasoning_strategy: str           # "react2" | "tree_of_thoughts" | "chain_of_thought"
    max_iterations: int
    confidence_threshold: float

    # Output config
    output_format: str                # "report" | "matrix" | "plan" | etc.
    required_sections: List[str]

    # Resource limits
    max_tokens: int
    max_tools: int
    timeout_seconds: int
```

### 2.3 Template Registry

```python
class JTBDTemplateRegistry:
    """Central registry for JTBD templates."""

    _templates: Dict[str, JTBDTemplate] = {}

    @classmethod
    def register(cls, template: JTBDTemplate) -> None:
        cls._templates[template.id] = template

    @classmethod
    def get(cls, template_id: str) -> JTBDTemplate:
        if template_id not in cls._templates:
            raise ValueError(f"Unknown template: {template_id}")
        return cls._templates[template_id]

    @classmethod
    def list_all(cls) -> List[JTBDTemplate]:
        return list(cls._templates.values())

# Register templates
JTBDTemplateRegistry.register(DEEP_RESEARCH_TEMPLATE)
JTBDTemplateRegistry.register(STRATEGY_SHAPING_TEMPLATE)
JTBDTemplateRegistry.register(TACTICAL_PLANNING_TEMPLATE)
JTBDTemplateRegistry.register(EVALUATION_TEMPLATE)
JTBDTemplateRegistry.register(CREATIVE_IDEATION_TEMPLATE)
JTBDTemplateRegistry.register(MONITORING_TEMPLATE)
JTBDTemplateRegistry.register(DECISION_MEMO_TEMPLATE)
JTBDTemplateRegistry.register(RISK_ASSESSMENT_TEMPLATE)
```

---

## Part 3: LangGraph Architecture (Python AI/ML Engineer)

### 3.1 ReAct² 7-Phase Cycle

```python
class ReActPhase(str, Enum):
    """7-phase ReAct² cycle."""
    PRECONDITION = "precondition"      # Phase 1: Verify state validity
    REASONING = "reasoning"            # Phase 2: Chain-of-thought
    ACTION = "action"                  # Phase 3: Execute tool/query
    OBSERVATION = "observation"        # Phase 4: Capture results
    POSTCONDITION = "postcondition"    # Phase 5: Validate action succeeded
    UNCERTAINTY = "uncertainty"        # Phase 6: Calculate confidence
    CHECKPOINT = "checkpoint"          # Phase 7: HITL decision point

async def execute_react_cycle(
    state: Mode3State,
    config: RunnableConfig
) -> Mode3State:
    """Execute single ReAct² 7-phase cycle."""

    # Phase 1: Precondition Check
    precondition_result = await check_preconditions(state)
    if not precondition_result.valid:
        return state | {"error": precondition_result.reason, "should_continue": False}

    state["current_phase"] = ReActPhase.PRECONDITION
    await emit_phase(state, "precondition", precondition_result)

    # Phase 2: Reasoning (Chain-of-Thought)
    state["current_phase"] = ReActPhase.REASONING
    reasoning = await generate_reasoning(state)
    state["reasoning_trace"].append(reasoning)
    await emit_phase(state, "reasoning", reasoning)

    # Phase 3: Action Selection
    state["current_phase"] = ReActPhase.ACTION
    action = await select_action(state, reasoning)

    # HITL checkpoint for tool approval (if strict mode)
    if requires_tool_approval(state, action):
        hitl_decision = await check_hitl_approval(
            state,
            HITLCheckpointType.TOOL_EXECUTION,
            config
        )
        if not hitl_decision.approved:
            return state | {"hitl_rejected": True, "should_continue": False}

    # Phase 4: Observation
    state["current_phase"] = ReActPhase.OBSERVATION
    observation = await execute_action(action, state)
    state["observations"].append(observation)
    await emit_phase(state, "observation", observation)

    # Phase 5: Postcondition Verification
    state["current_phase"] = ReActPhase.POSTCONDITION
    postcondition = await verify_postconditions(state, action, observation)
    if not postcondition.valid:
        state["verification_failures"].append(postcondition)
    await emit_phase(state, "postcondition", postcondition)

    # Phase 6: Uncertainty Estimation
    state["current_phase"] = ReActPhase.UNCERTAINTY
    confidence = await estimate_confidence(state)
    state["current_confidence"] = confidence
    await emit_phase(state, "uncertainty", {"confidence": confidence})

    # Phase 7: Checkpoint Decision
    state["current_phase"] = ReActPhase.CHECKPOINT

    # Check if goal achieved
    if confidence >= state["confidence_threshold"]:
        state["goal_achieved"] = True
        state["should_continue"] = False

    # Check iteration limit
    state["react_cycle_count"] += 1
    if state["react_cycle_count"] >= state["max_iterations"]:
        state["max_iterations_reached"] = True
        state["should_continue"] = False

    # Check divergence
    divergence = await detect_divergence(state)
    if divergence.severity >= DivergenceSeverity.HIGH:
        state["divergence_detected"] = True
        state["should_continue"] = False
        # Request HITL for divergence resolution
        await check_hitl_approval(state, HITLCheckpointType.CRITICAL_DECISION, config)

    return state
```

### 3.2 L1-L5 Agent Hierarchy

```python
class AgentLevel(str, Enum):
    L1_ROUTER = "l1_router"           # Query analysis, agent selection
    L2_SPECIALIST = "l2_specialist"   # Domain expert coordination
    L3_ULTRA = "l3_ultra"             # Deep domain expertise
    L4_CONTEXT = "l4_context"         # Context engineering
    L5_TOOL = "l5_tool"               # Atomic tool execution

@dataclass
class AgentLevelConfig:
    """Configuration for L1-L5 agent hierarchy."""
    l1_model: str = "gpt-3.5-turbo"   # Fast routing
    l2_model: str = "gpt-4"           # Expert coordination
    l3_model: str = "gpt-4"           # Deep expertise
    l4_model: str = "gpt-3.5-turbo"   # Context formatting
    l5_model: str = "gpt-3.5-turbo"   # Tool execution

    l1_temperature: float = 0.3
    l2_temperature: float = 0.4
    l3_temperature: float = 0.2       # Low for accuracy
    l4_temperature: float = 0.3
    l5_temperature: float = 0.1       # Very low for tools

    allow_l2_spawn: bool = True
    allow_l3_spawn: bool = True
    max_concurrent_agents: int = 5
```

### 3.3 Complete LangGraph StateGraph

```python
def build_mode3_graph(template: JTBDTemplate) -> StateGraph:
    """Build LangGraph StateGraph from JTBD template."""

    graph = StateGraph(Mode3State)

    # Add nodes
    graph.add_node("initialize", initialize_session)
    graph.add_node("analyze_query", analyze_query)
    graph.add_node("generate_plan", generate_plan)
    graph.add_node("hitl_plan_approval", hitl_plan_approval)
    graph.add_node("execute_react_cycle", execute_react_cycle)
    graph.add_node("check_continuation", check_continuation)
    graph.add_node("synthesize_response", synthesize_response)
    graph.add_node("hitl_final_review", hitl_final_review)
    graph.add_node("finalize", finalize_session)
    graph.add_node("handle_error", handle_error)

    # Set entry point
    graph.set_entry_point("initialize")

    # Add edges
    graph.add_edge("initialize", "analyze_query")
    graph.add_edge("analyze_query", "generate_plan")
    graph.add_edge("generate_plan", "hitl_plan_approval")

    # HITL plan approval routing
    graph.add_conditional_edges(
        "hitl_plan_approval",
        lambda s: "execute" if s.get("plan_approved") else "reject",
        {
            "execute": "execute_react_cycle",
            "reject": "finalize"
        }
    )

    # ReAct cycle loop
    graph.add_edge("execute_react_cycle", "check_continuation")
    graph.add_conditional_edges(
        "check_continuation",
        lambda s: "continue" if s.get("should_continue") else "synthesize",
        {
            "continue": "execute_react_cycle",
            "synthesize": "synthesize_response"
        }
    )

    # Final review
    graph.add_edge("synthesize_response", "hitl_final_review")
    graph.add_conditional_edges(
        "hitl_final_review",
        lambda s: "approved" if s.get("final_approved") else "revise",
        {
            "approved": "finalize",
            "revise": "execute_react_cycle"
        }
    )

    graph.add_edge("finalize", END)

    # Error handling from any node
    for node in ["initialize", "analyze_query", "generate_plan",
                 "execute_react_cycle", "synthesize_response"]:
        graph.add_conditional_edges(
            node,
            lambda s: "error" if s.get("error") else "normal",
            {"error": "handle_error", "normal": node}  # Continue normally
        )

    graph.add_edge("handle_error", "finalize")

    return graph.compile()
```

---

## Part 4: Database Schema (Data Architecture Expert)

### 4.1 Core Tables

```sql
-- Autonomous sessions table
CREATE TABLE IF NOT EXISTS autonomous_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Mode configuration
    mode TEXT NOT NULL CHECK (mode IN ('mode_3', 'mode_4')),
    jtbd_template_id TEXT NOT NULL,
    autonomy_level TEXT NOT NULL DEFAULT 'balanced'
        CHECK (autonomy_level IN ('strict', 'balanced', 'permissive')),

    -- State tracking
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'completed', 'failed', 'timeout')),
    current_phase TEXT,
    react_cycle_count INTEGER DEFAULT 0,

    -- Confidence tracking
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    current_confidence DECIMAL(3,2),

    -- HITL tracking
    hitl_pending BOOLEAN DEFAULT FALSE,
    hitl_checkpoint_type TEXT,

    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    timeout_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_confidence CHECK (
        current_confidence IS NULL OR
        (current_confidence >= 0 AND current_confidence <= 1)
    )
);

-- HITL decisions table
CREATE TABLE IF NOT EXISTS hitl_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES autonomous_sessions(session_id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Decision details
    checkpoint_type TEXT NOT NULL,
    approved BOOLEAN NOT NULL,
    reason TEXT,
    auto_rejected BOOLEAN DEFAULT FALSE,

    -- Context at decision time
    context JSONB NOT NULL DEFAULT '{}',

    -- User who made decision (NULL if auto-rejected)
    decided_by UUID REFERENCES auth.users(id),

    -- Timing
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    timeout_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session tasks (plan items)
CREATE TABLE IF NOT EXISTS session_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES autonomous_sessions(session_id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Task details
    task_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),

    -- Execution details
    agent_level TEXT,  -- L1-L5
    tool_used TEXT,

    -- Results
    result JSONB,
    confidence DECIMAL(3,2),
    error_message TEXT,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(session_id, task_index)
);

-- Reasoning trace
CREATE TABLE IF NOT EXISTS session_reasoning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES autonomous_sessions(session_id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Reasoning details
    phase TEXT NOT NULL,
    cycle_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    confidence DECIMAL(3,2),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gathered facts/insights
CREATE TABLE IF NOT EXISTS session_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES autonomous_sessions(session_id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Insight details
    insight_type TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    confidence DECIMAL(3,2),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_autonomous_sessions_tenant
    ON autonomous_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_sessions_status
    ON autonomous_sessions(status);
CREATE INDEX IF NOT EXISTS idx_autonomous_sessions_hitl_pending
    ON autonomous_sessions(hitl_pending) WHERE hitl_pending = TRUE;
CREATE INDEX IF NOT EXISTS idx_hitl_decisions_session
    ON hitl_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_session_tasks_session
    ON session_tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_session_reasoning_session
    ON session_reasoning(session_id);
```

### 4.2 Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE autonomous_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitl_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reasoning ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_insights ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY tenant_isolation_autonomous_sessions
    ON autonomous_sessions
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation_hitl_decisions
    ON hitl_decisions
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation_session_tasks
    ON session_tasks
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation_session_reasoning
    ON session_reasoning
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation_session_insights
    ON session_insights
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

---

## Part 5: Frontend Architecture (Frontend UI Architect)

### 5.1 Component Hierarchy

```
src/features/ask-expert/mode-3/
├── components/
│   ├── Mode3Container.tsx           # Main container
│   ├── TaskListPanel.tsx            # Left panel - task list
│   ├── ConversationPanel.tsx        # Center - chat + reasoning
│   ├── InsightsPanel.tsx            # Right panel - insights
│   ├── HITLDrawer.tsx               # Bottom drawer for HITL
│   ├── ProgressIndicator.tsx        # Top progress bar
│   ├── ReasoningAccordion.tsx       # Expandable reasoning steps
│   ├── TaskCard.tsx                 # Individual task display
│   ├── InsightCard.tsx              # Individual insight display
│   └── ConfidenceMeter.tsx          # Visual confidence indicator
├── hooks/
│   ├── useMode3Session.ts           # Session management
│   ├── useSSEStream.ts              # SSE event handling
│   ├── useHITLApproval.ts           # HITL interaction
│   └── useTaskProgress.ts           # Task tracking
├── stores/
│   └── mode3Store.ts                # Zustand store
└── types/
    └── mode3.types.ts               # TypeScript types
```

### 5.2 Zustand Store

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Mode3State {
  // Session
  sessionId: string | null;
  status: 'idle' | 'planning' | 'executing' | 'hitl_pending' | 'completed' | 'error';

  // Plan
  plan: Plan | null;
  tasks: Task[];
  currentTaskIndex: number;

  // Progress
  currentPhase: string | null;
  reactCycleCount: number;
  confidence: number;
  confidenceThreshold: number;

  // Reasoning
  reasoningSteps: ReasoningStep[];

  // Insights
  insights: Insight[];

  // HITL
  pendingHITL: HITLRequest | null;
  hitlHistory: HITLDecision[];

  // Streaming
  isStreaming: boolean;
  streamingContent: string;

  // Errors
  errors: string[];

  // Actions
  actions: {
    startSession: (agentId: string, query: string) => Promise<void>;
    handleSSEEvent: (event: SSEEvent) => void;
    approveHITL: (approved: boolean, feedback?: string) => Promise<void>;
    cancelSession: () => Promise<void>;
    reset: () => void;
  };
}

export const useMode3Store = create<Mode3State>()(
  immer((set, get) => ({
    // Initial state
    sessionId: null,
    status: 'idle',
    plan: null,
    tasks: [],
    currentTaskIndex: 0,
    currentPhase: null,
    reactCycleCount: 0,
    confidence: 0,
    confidenceThreshold: 0.85,
    reasoningSteps: [],
    insights: [],
    pendingHITL: null,
    hitlHistory: [],
    isStreaming: false,
    streamingContent: '',
    errors: [],

    actions: {
      startSession: async (agentId, query) => {
        set((state) => {
          state.status = 'planning';
          state.errors = [];
        });

        // Start SSE stream
        const eventSource = new EventSource(
          `/api/ask-expert/mode3/stream?agent_id=${agentId}&query=${encodeURIComponent(query)}`
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          get().actions.handleSSEEvent(data);
        };

        eventSource.onerror = () => {
          set((state) => {
            state.status = 'error';
            state.errors.push('Connection lost');
          });
          eventSource.close();
        };
      },

      handleSSEEvent: (event) => {
        set((state) => {
          switch (event.type) {
            case 'plan_created':
              state.plan = event.data.plan;
              state.tasks = event.data.plan.tasks;
              state.status = 'hitl_pending';
              state.pendingHITL = {
                type: 'plan_approval',
                context: event.data.plan
              };
              break;

            case 'task_status_change':
              const taskIndex = state.tasks.findIndex(t => t.id === event.data.task_id);
              if (taskIndex >= 0) {
                state.tasks[taskIndex].status = event.data.status;
              }
              state.currentTaskIndex = event.data.task_index;
              break;

            case 'reasoning_step':
              state.reasoningSteps.push(event.data);
              state.currentPhase = event.data.phase;
              break;

            case 'confidence_update':
              state.confidence = event.data.confidence;
              state.reactCycleCount = event.data.cycle;
              break;

            case 'insight_generated':
              state.insights.push(event.data);
              break;

            case 'hitl_request':
              state.status = 'hitl_pending';
              state.pendingHITL = event.data;
              break;

            case 'token':
              state.isStreaming = true;
              state.streamingContent += event.data.token;
              break;

            case 'complete':
              state.status = 'completed';
              state.isStreaming = false;
              break;

            case 'error':
              state.status = 'error';
              state.errors.push(event.data.message);
              break;
          }
        });
      },

      approveHITL: async (approved, feedback) => {
        const { sessionId, pendingHITL } = get();

        await fetch('/api/ask-expert/mode3/hitl-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            checkpoint_type: pendingHITL?.type,
            approved,
            feedback
          })
        });

        set((state) => {
          state.hitlHistory.push({
            ...state.pendingHITL!,
            approved,
            feedback,
            decidedAt: new Date().toISOString()
          });
          state.pendingHITL = null;
          state.status = approved ? 'executing' : 'completed';
        });
      },

      cancelSession: async () => {
        const { sessionId } = get();
        if (sessionId) {
          await fetch(`/api/ask-expert/mode3/cancel?session_id=${sessionId}`, {
            method: 'POST'
          });
        }
        get().actions.reset();
      },

      reset: () => {
        set((state) => {
          state.sessionId = null;
          state.status = 'idle';
          state.plan = null;
          state.tasks = [];
          state.currentTaskIndex = 0;
          state.currentPhase = null;
          state.reactCycleCount = 0;
          state.confidence = 0;
          state.reasoningSteps = [];
          state.insights = [];
          state.pendingHITL = null;
          state.isStreaming = false;
          state.streamingContent = '';
          state.errors = [];
        });
      }
    }
  }))
);
```

### 5.3 Three-Panel Layout

```tsx
// Mode3Container.tsx
export function Mode3Container() {
  const { status, pendingHITL } = useMode3Store();

  return (
    <div className="flex h-screen">
      {/* Left Panel - Tasks */}
      <div className="w-80 border-r bg-slate-50 dark:bg-slate-900">
        <TaskListPanel />
      </div>

      {/* Center Panel - Conversation + Reasoning */}
      <div className="flex-1 flex flex-col">
        <ProgressIndicator />
        <ConversationPanel />
      </div>

      {/* Right Panel - Insights (collapsible) */}
      <div className="w-96 border-l bg-slate-50 dark:bg-slate-900">
        <InsightsPanel />
      </div>

      {/* Bottom Drawer - HITL Checkpoints */}
      {pendingHITL && (
        <HITLDrawer checkpoint={pendingHITL} />
      )}
    </div>
  );
}
```

---

## Part 6: Visual Design (Visual Design & Brand Strategist)

### 6.1 Color System

```css
/* Design tokens for Mode 3/4 */
:root {
  /* Task status colors */
  --task-pending: #94a3b8;      /* slate-400 */
  --task-in-progress: #3b82f6;  /* blue-500 */
  --task-completed: #22c55e;    /* green-500 */
  --task-failed: #ef4444;       /* red-500 */

  /* Confidence colors */
  --confidence-low: #ef4444;    /* <60% */
  --confidence-medium: #f59e0b; /* 60-80% */
  --confidence-high: #22c55e;   /* >80% */

  /* HITL accent */
  --hitl-accent: #8b5cf6;       /* violet-500 */
  --hitl-background: #f5f3ff;   /* violet-50 */

  /* Reasoning phases */
  --phase-precondition: #06b6d4;  /* cyan-500 */
  --phase-reasoning: #8b5cf6;     /* violet-500 */
  --phase-action: #3b82f6;        /* blue-500 */
  --phase-observation: #22c55e;   /* green-500 */
  --phase-checkpoint: #f59e0b;    /* amber-500 */
}
```

### 6.2 Animation Specifications

```css
/* Task list animations */
@keyframes task-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.task-in-progress {
  animation: task-pulse 2s ease-in-out infinite;
  border-left: 3px solid var(--task-in-progress);
}

/* HITL drawer slide-up */
@keyframes drawer-slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.hitl-drawer {
  animation: drawer-slide-up 0.3s ease-out;
}

/* Confidence meter */
.confidence-meter {
  transition: width 0.5s ease-out;
}

/* Reasoning accordion expand */
@keyframes accordion-expand {
  from { max-height: 0; opacity: 0; }
  to { max-height: 500px; opacity: 1; }
}
```

### 6.3 Task Card Design

```tsx
// TaskCard.tsx - Visual design specification
interface TaskCardProps {
  task: Task;
  isActive: boolean;
}

export function TaskCard({ task, isActive }: TaskCardProps) {
  const statusColors = {
    pending: 'bg-slate-100 border-slate-300',
    in_progress: 'bg-blue-50 border-blue-500 border-l-4',
    completed: 'bg-green-50 border-green-500',
    failed: 'bg-red-50 border-red-500'
  };

  const statusIcons = {
    pending: <Circle className="text-slate-400" />,
    in_progress: <Loader2 className="text-blue-500 animate-spin" />,
    completed: <CheckCircle className="text-green-500" />,
    failed: <XCircle className="text-red-500" />
  };

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-all duration-200',
        statusColors[task.status],
        isActive && 'ring-2 ring-blue-500 shadow-md'
      )}
    >
      <div className="flex items-center gap-2">
        {statusIcons[task.status]}
        <span className="font-medium text-sm">{task.title}</span>
      </div>

      {task.status === 'in_progress' && (
        <div className="mt-2">
          <Progress value={task.progress} className="h-1" />
        </div>
      )}

      {task.status === 'completed' && task.confidence && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <span>Confidence:</span>
          <ConfidenceBadge value={task.confidence} />
        </div>
      )}
    </div>
  );
}
```

---

## Part 7: Implementation Phases

### Phase 0: Security Fixes (Week 1) - MANDATORY

| Task | Priority | Effort |
|------|----------|--------|
| Fix HITL fail-open (SEC-002) | P0 | 1 day |
| Add tenant isolation (SEC-001) | P0 | 1 day |
| Implement input sanitization (SEC-003) | P0 | 1 day |
| Add rate limiting (SEC-004) | P0 | 0.5 day |
| Security review & testing | P0 | 1.5 days |

### Phase 1: Template Infrastructure (Week 2)

| Task | Priority | Effort |
|------|----------|--------|
| Create JTBDTemplate dataclass | P1 | 0.5 day |
| Build TemplateRegistry | P1 | 0.5 day |
| Implement 8 JTBD templates | P1 | 2 days |
| Create template selection API | P1 | 1 day |
| Database migration for templates | P1 | 1 day |

### Phase 2: LangGraph Core (Week 3-4)

| Task | Priority | Effort |
|------|----------|--------|
| ReAct² 7-phase implementation | P1 | 3 days |
| L1-L5 agent hierarchy | P1 | 3 days |
| State persistence (AsyncPostgresSaver) | P1 | 2 days |
| Divergence detection | P1 | 1 day |
| Error recovery | P1 | 1 day |

### Phase 3: SSE Streaming (Week 4)

| Task | Priority | Effort |
|------|----------|--------|
| SSE endpoint implementation | P1 | 2 days |
| 15+ event types | P1 | 1 day |
| Frontend SSE handling | P1 | 1 day |
| Reconnection logic | P1 | 0.5 day |

### Phase 4: Frontend Components (Week 5)

| Task | Priority | Effort |
|------|----------|--------|
| Three-panel layout | P1 | 1 day |
| TaskListPanel | P1 | 1 day |
| ConversationPanel | P1 | 1 day |
| HITLDrawer | P1 | 1 day |
| InsightsPanel | P1 | 1 day |

### Phase 5: HITL System (Week 6)

| Task | Priority | Effort |
|------|----------|--------|
| 5 HITL checkpoint types | P1 | 2 days |
| Approval workflow | P1 | 1 day |
| Timeout handling | P1 | 0.5 day |
| Feedback collection | P1 | 0.5 day |
| HITL analytics | P2 | 1 day |

### Phase 6: Testing & QA (Week 7)

| Task | Priority | Effort |
|------|----------|--------|
| Unit tests (all components) | P1 | 2 days |
| Integration tests | P1 | 2 days |
| Security testing | P0 | 1 day |
| Performance testing | P1 | 1 day |

---

## Appendix A: SSE Event Types

```typescript
enum SSEEventType {
  // Planning
  PLAN_CREATED = 'plan_created',
  PLAN_UPDATED = 'plan_updated',
  TASK_STATUS_CHANGE = 'task_status_change',

  // Reasoning
  REASONING_STEP = 'reasoning_step',
  PHASE_CHANGE = 'phase_change',
  CONFIDENCE_UPDATE = 'confidence_update',

  // HITL
  HITL_REQUEST = 'hitl_request',
  HITL_RESPONSE = 'hitl_response',
  HITL_TIMEOUT = 'hitl_timeout',

  // Execution
  ACTION_START = 'action_start',
  ACTION_COMPLETE = 'action_complete',
  TOOL_CALL = 'tool_call',
  TOOL_RESULT = 'tool_result',

  // Data
  RAG_DOCUMENTS = 'rag_documents',
  INSIGHT_GENERATED = 'insight_generated',

  // Streaming
  TOKEN = 'token',
  THINKING = 'thinking',

  // Terminal
  COMPLETE = 'complete',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}
```

---

## Appendix B: File Locations

| Component | Location |
|-----------|----------|
| JTBD Templates | `services/ai-engine/src/jtbd_templates/` |
| LangGraph Workflows | `services/ai-engine/src/langgraph_workflows/` |
| API Routes | `services/ai-engine/src/api/routes/` |
| Frontend Components | `apps/vital-system/src/features/ask-expert/mode-3/` |
| Store | `apps/vital-system/src/features/ask-expert/mode-3/stores/` |
| Database Migrations | `supabase/migrations/` |
| Documentation | `.claude/docs/services/ask-expert/` |

---

## Appendix C: Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| PRD Compliance | 100% | Feature checklist |
| ARD Compliance | 100% | Architecture review |
| Security Vulnerabilities | 0 critical/high | Security scan |
| Test Coverage | >80% | Jest/pytest coverage |
| HITL Response Time | <2s | P95 latency |
| SSE Event Latency | <100ms | P95 latency |
| Session Completion Rate | >95% | Analytics |
| User Satisfaction | >4.0/5.0 | Feedback survey |

---

*Generated from synthesis of 5 specialized agent reviews on December 5, 2025*
