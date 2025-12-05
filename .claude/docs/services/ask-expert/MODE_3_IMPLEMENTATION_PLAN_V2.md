# Mode 3 (Manual-Autonomous) Implementation Plan

**Version:** 2.0 - Gold Standard Implementation
**Date:** December 5, 2025
**Status:** APPROVED FOR IMPLEMENTATION
**Estimated Duration:** 12 weeks (3 phases)

---

## Executive Summary

This implementation plan addresses the critical gaps identified in the Mode 3 Audit Report (25% completion) and provides a systematic approach to achieving full PRD/ARD compliance. The plan phases in all 24 mission templates across 12 weeks while prioritizing security fixes and core infrastructure.

### Current State vs Target State

| Component | Current (Audit) | Target | Gap |
|-----------|-----------------|--------|-----|
| PRD Compliance | ~25% | 100% | 75% |
| ReAct² Implementation | 0% | 100% | 100% |
| 5-Level Agent Hierarchy | 0% | 100% | 100% |
| SSE Streaming | 0% | 100% | 100% |
| HITL Checkpoints | 20% (1/5) | 100% (5/5) | 80% |
| Security Controls | ~20% | 100% | 80% |
| 24 Mission Templates | 0% | 100% | 100% |

---

## Implementation Phases Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    12-WEEK IMPLEMENTATION ROADMAP                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: FOUNDATION (Weeks 1-4)                                           │
│  ─────────────────────────────────                                         │
│  • Security Fixes (CRITICAL)                                                │
│  • SSE Streaming Infrastructure                                             │
│  • ReAct² 7-Phase Cycle                                                    │
│  • 5 HITL Checkpoints (Fail-Closed)                                        │
│  • Missions 1-8 (UNDERSTAND + EVALUATE)                                    │
│                                                                             │
│  PHASE 2: HIERARCHY (Weeks 5-8)                                            │
│  ─────────────────────────────────                                         │
│  • L1-L5 Agent Architecture                                                │
│  • L4 Worker Pool (15 Workers)                                             │
│  • L5 Tool Registry (13 Tools)                                             │
│  • Tri-Memory Architecture                                                  │
│  • Missions 9-16 (DECIDE + INVESTIGATE)                                    │
│                                                                             │
│  PHASE 3: ADVANCED (Weeks 9-12)                                            │
│  ─────────────────────────────────                                         │
│  • Tree-of-Thoughts Planning                                                │
│  • Constitutional AI Validation                                             │
│  • Adaptive Autonomy Levels                                                 │
│  • Divergence Detection                                                     │
│  • Missions 17-24 (WATCH + SOLVE + PREPARE)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (Weeks 1-4)

### Week 1: Security & Critical Bug Fixes

**Priority: CRITICAL - Must complete before any other work**

#### Day 1-2: Security Vulnerabilities

| Bug ID | Description | Fix | File | Status |
|--------|-------------|-----|------|--------|
| SEC-001 | Tenant isolation bypass | Add `.eq("tenant_id", tenant_id)` to all queries | `mode3_manual_autonomous.py:89-120` | ⬜ |
| SEC-002 | HITL fail-open policy | Change to fail-closed: `return {"hitl_approved": False}` | `mode3_manual_autonomous.py:234` | ⬜ |
| SEC-003 | No input sanitization | Add `sanitize_input()` function | `mode3_manual_autonomous.py:45-60` | ⬜ |
| SEC-004 | No rate limiting | Add tenant-based rate limiting middleware | `main.py` | ⬜ |
| SEC-005 | Verbose error messages | Implement error masking in production | Throughout | ⬜ |

**Implementation:**

```python
# SEC-001: Tenant Isolation Fix
async def get_agent_with_tenant(agent_id: str, tenant_id: str):
    """Fetch agent with mandatory tenant isolation."""
    result = await supabase.from_("agents") \
        .select("*") \
        .eq("id", agent_id) \
        .eq("tenant_id", tenant_id) \
        .single()

    if not result.data:
        raise TenantIsolationError(f"Agent {agent_id} not found for tenant")
    return result.data

# SEC-002: HITL Fail-Closed Pattern
async def check_hitl_approval(state: Mode3State, checkpoint_type: str) -> HITLResult:
    """Check HITL approval with FAIL-CLOSED policy."""
    try:
        result = await hitl_service.check_approval(
            session_id=state["session_id"],
            checkpoint_type=checkpoint_type,
            timeout_seconds=300
        )
        return result
    except Exception as e:
        logger.error(f"HITL check failed: {e}")
        # FAIL-CLOSED: Any error = REJECT
        return HITLResult(
            approved=False,
            reason="HITL check failed - defaulting to REJECT for safety",
            error=str(e)
        )

# SEC-003: Input Sanitization
def sanitize_user_input(message: str) -> str:
    """Sanitize user input to prevent prompt injection."""
    # Remove potential injection patterns
    dangerous_patterns = [
        r"ignore previous instructions",
        r"system prompt",
        r"you are now",
        r"new instructions",
        r"forget everything"
    ]

    sanitized = message
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, "[FILTERED]", sanitized, flags=re.IGNORECASE)

    # Limit length
    if len(sanitized) > 10000:
        sanitized = sanitized[:10000] + "... [TRUNCATED]"

    return sanitized
```

#### Day 3-4: Critical Bug Fixes

| Bug ID | Description | Fix | Impact |
|--------|-------------|-----|--------|
| BUG-001 | Response cleared between iterations | Preserve `autonomous_reasoning` list | Reasoning history preserved |
| BUG-002 | Infinite loop risk | Add `max_iterations` check | System stability |
| BUG-003 | HITL auto-approve on error | Already covered in SEC-002 | Security |
| BUG-004 | Tenant isolation | Already covered in SEC-001 | Security |

**Implementation:**

```python
# BUG-002: Infinite Loop Prevention
MAX_REACT_ITERATIONS = 25
MAX_GOAL_ITERATIONS = 10

async def execute_mode3_workflow(state: Mode3State) -> Mode3State:
    """Execute with iteration limits and divergence detection."""
    iteration_count = 0

    while not state.get("is_complete"):
        iteration_count += 1

        # Hard limit check
        if iteration_count > MAX_REACT_ITERATIONS:
            logger.warning(f"Max iterations ({MAX_REACT_ITERATIONS}) reached")
            state["is_complete"] = True
            state["completion_reason"] = "max_iterations_reached"
            state["requires_user_intervention"] = True
            break

        # Divergence detection
        if detect_reasoning_loop(state.get("autonomous_reasoning", [])):
            logger.warning("Reasoning loop detected")
            state["requires_hitl"] = True
            state["hitl_reason"] = "divergence_detected"
            break

        # Execute step
        state = await execute_react_step(state)

    return state
```

#### Day 5: Testing & Verification

- Unit tests for all security fixes
- Integration tests for tenant isolation
- Penetration testing for HITL bypass attempts
- Rate limit stress testing

**Deliverables:**
- [ ] All SEC-* fixes deployed
- [ ] All BUG-* fixes deployed
- [ ] 100% test coverage for security code
- [ ] Security audit passed

---

### Week 2: SSE Streaming Infrastructure

**Goal:** Real-time event streaming so users see reasoning progress

#### Day 1-2: SSE Event Architecture

```python
# services/ai-engine/src/api/routes/mode3_manual_autonomous.py

from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
import json

# Event types from PRD
SSE_EVENT_TYPES = {
    # Lifecycle
    "session_started": "Session initialization",
    "session_complete": "Session finished",

    # Planning
    "planning_started": "Plan generation begun",
    "plan_generated": "Plan ready for review",
    "planning_complete": "Planning phase done",

    # HITL
    "hitl_request": "Human approval needed",
    "hitl_waiting": "Waiting for approval",
    "hitl_approved": "Approval received",
    "hitl_rejected": "Request rejected",
    "hitl_timeout": "Approval timed out",

    # Execution
    "reasoning_step": "Reasoning in progress",
    "token_stream": "Token-by-token output",
    "execution_progress": "Step completion update",

    # Tools
    "tool_call_started": "Tool invocation begun",
    "tool_call_complete": "Tool returned result",
    "tool_call_error": "Tool execution failed",

    # Agents
    "subagent_spawned": "L4/L5 agent created",
    "subagent_progress": "Subagent working",
    "subagent_complete": "Subagent finished",

    # Validation
    "validation_started": "Output validation begun",
    "validation_result": "Validation outcome",

    # Memory
    "checkpoint_saved": "State persisted",
    "memory_updated": "Context refreshed",

    # Errors
    "error": "Error occurred",
    "warning": "Warning issued"
}

async def sse_event_generator(
    state: Mode3State,
    workflow: CompiledGraph
) -> AsyncGenerator[str, None]:
    """Generate SSE events as workflow executes."""

    # Session started
    yield format_sse_event("session_started", {
        "session_id": state["session_id"],
        "agent_id": state["agent_id"],
        "mission_type": state.get("mission_type", "general"),
        "timestamp": datetime.utcnow().isoformat()
    })

    try:
        async for event in workflow.astream_events(state, version="v2"):
            event_type = event.get("event")
            event_data = event.get("data", {})

            # Map LangGraph events to SSE events
            if event_type == "on_chat_model_stream":
                # Token streaming
                token = event_data.get("chunk", {}).get("content", "")
                if token:
                    yield format_sse_event("token_stream", {
                        "token": token,
                        "node": event.get("metadata", {}).get("langgraph_node")
                    })

            elif event_type == "on_chain_start":
                node_name = event.get("name", "")
                if "react" in node_name.lower():
                    yield format_sse_event("reasoning_step", {
                        "step": node_name,
                        "phase": extract_react_phase(node_name)
                    })

            elif event_type == "on_tool_start":
                yield format_sse_event("tool_call_started", {
                    "tool": event.get("name"),
                    "input": event_data.get("input", {})
                })

            elif event_type == "on_tool_end":
                yield format_sse_event("tool_call_complete", {
                    "tool": event.get("name"),
                    "output": event_data.get("output", {})
                })

        # Session complete
        yield format_sse_event("session_complete", {
            "session_id": state["session_id"],
            "status": "success",
            "reasoning_steps": len(state.get("autonomous_reasoning", []))
        })

    except Exception as e:
        yield format_sse_event("error", {
            "message": str(e) if settings.DEBUG else "An error occurred",
            "code": "EXECUTION_ERROR"
        })

def format_sse_event(event_type: str, data: dict) -> str:
    """Format event for SSE protocol."""
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"

# New streaming endpoint
@router.post("/autonomous-manual/stream")
async def execute_mode3_stream(
    request: Mode3Request,
    tenant_id: str = Header(..., alias="x-tenant-id")
) -> StreamingResponse:
    """Execute Mode 3 with SSE streaming."""

    # Initialize state
    state = await initialize_mode3_state(request, tenant_id)

    # Build workflow
    workflow = build_mode3_graph()

    return StreamingResponse(
        sse_event_generator(state, workflow),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
```

#### Day 3-4: Frontend SSE Client

```typescript
// apps/vital-system/src/features/ask-expert/mode-3/useMode3Stream.ts

interface Mode3Event {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
}

export function useMode3Stream(sessionId: string) {
  const [events, setEvents] = useState<Mode3Event[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'streaming' | 'complete' | 'error'>('idle');
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [hitlRequest, setHitlRequest] = useState<HITLRequest | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(async (agentId: string, message: string, missionType?: string) => {
    setStatus('connecting');

    // Create session first
    const session = await createMode3Session(agentId, message, missionType);

    // Connect to SSE stream
    const eventSource = new EventSource(
      `/api/ask-expert/mode3/stream/${session.id}`,
      { withCredentials: true }
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setStatus('streaming');
    };

    // Event handlers for each event type
    eventSource.addEventListener('session_started', (e) => {
      const data = JSON.parse(e.data);
      setEvents(prev => [...prev, { type: 'session_started', data, timestamp: new Date() }]);
    });

    eventSource.addEventListener('reasoning_step', (e) => {
      const data = JSON.parse(e.data);
      setCurrentPhase(data.phase);
      setEvents(prev => [...prev, { type: 'reasoning_step', data, timestamp: new Date() }]);
    });

    eventSource.addEventListener('token_stream', (e) => {
      const data = JSON.parse(e.data);
      // Append token to current response
      setEvents(prev => {
        const last = prev[prev.length - 1];
        if (last?.type === 'token_stream') {
          return [...prev.slice(0, -1), {
            ...last,
            data: { ...last.data, content: last.data.content + data.token }
          }];
        }
        return [...prev, { type: 'token_stream', data: { content: data.token }, timestamp: new Date() }];
      });
    });

    eventSource.addEventListener('hitl_request', (e) => {
      const data = JSON.parse(e.data);
      setHitlRequest(data);
      setStatus('awaiting_approval');
    });

    eventSource.addEventListener('subagent_spawned', (e) => {
      const data = JSON.parse(e.data);
      setEvents(prev => [...prev, { type: 'subagent_spawned', data, timestamp: new Date() }]);
    });

    eventSource.addEventListener('tool_call_started', (e) => {
      const data = JSON.parse(e.data);
      setEvents(prev => [...prev, { type: 'tool_call', data: { ...data, status: 'started' }, timestamp: new Date() }]);
    });

    eventSource.addEventListener('tool_call_complete', (e) => {
      const data = JSON.parse(e.data);
      setEvents(prev => {
        // Update the tool call event to complete
        const idx = prev.findIndex(ev =>
          ev.type === 'tool_call' && ev.data.tool === data.tool && ev.data.status === 'started'
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], data: { ...data, status: 'complete' } };
          return updated;
        }
        return prev;
      });
    });

    eventSource.addEventListener('session_complete', (e) => {
      const data = JSON.parse(e.data);
      setStatus('complete');
      setEvents(prev => [...prev, { type: 'session_complete', data, timestamp: new Date() }]);
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      const data = JSON.parse(e.data);
      setStatus('error');
      setEvents(prev => [...prev, { type: 'error', data, timestamp: new Date() }]);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setStatus('error');
      eventSource.close();
    };
  }, []);

  const submitHITLResponse = useCallback(async (approved: boolean, feedback?: string) => {
    if (!hitlRequest) return;

    await submitHITLDecision(hitlRequest.checkpoint_id, approved, feedback);
    setHitlRequest(null);
    setStatus('streaming');
  }, [hitlRequest]);

  const stopStream = useCallback(() => {
    eventSourceRef.current?.close();
    setStatus('idle');
  }, []);

  return {
    events,
    status,
    currentPhase,
    hitlRequest,
    startStream,
    submitHITLResponse,
    stopStream
  };
}
```

#### Day 5: Integration Testing

- Test SSE connection lifecycle
- Test event type coverage
- Test reconnection logic
- Performance benchmarking

**Deliverables:**
- [ ] SSE endpoint operational
- [ ] All 30 event types implemented
- [ ] Frontend client integrated
- [ ] <100ms latency per event

---

### Week 3: ReAct² 7-Phase Cycle

**Goal:** Implement the full ReAct² reasoning pattern with verification

#### Day 1-3: 7-Phase Implementation

```python
# services/ai-engine/src/langgraph_workflows/react2_engine.py

from enum import Enum
from typing import TypedDict, Optional, List
from dataclasses import dataclass

class ReActPhase(str, Enum):
    PRECONDITION = "precondition_check"
    REASONING = "reasoning"
    ACTION = "action"
    OBSERVATION = "observation"
    POSTCONDITION = "postcondition_verify"
    UNCERTAINTY = "uncertainty_estimate"
    CHECKPOINT = "checkpoint"

@dataclass
class ReActStepResult:
    phase: ReActPhase
    success: bool
    output: dict
    confidence: float
    reasoning_trace: str
    verification_status: str
    requires_hitl: bool = False
    hitl_reason: Optional[str] = None

class ReAct2Engine:
    """
    ReAct² (ReAct-Squared) Implementation

    7-Phase Cycle:
    1. Precondition Check → Verify state validity before action
    2. Reasoning → Chain-of-thought with uncertainty quantification
    3. Action → Execute tool/query/delegation
    4. Observation → Capture and validate results
    5. Postcondition Verify → Validate action succeeded
    6. Uncertainty Estimate → Calculate confidence scores
    7. Checkpoint → Save state, trigger HITL if needed
    """

    def __init__(self, llm, tool_registry, hitl_service):
        self.llm = llm
        self.tool_registry = tool_registry
        self.hitl_service = hitl_service
        self.confidence_threshold = 0.7

    async def execute_cycle(self, state: Mode3State) -> ReActStepResult:
        """Execute one complete ReAct² cycle."""

        # Phase 1: Precondition Check
        precondition_result = await self._precondition_check(state)
        if not precondition_result.success:
            return precondition_result

        # Phase 2: Reasoning
        reasoning_result = await self._reasoning_phase(state)

        # Phase 3: Action
        action_result = await self._action_phase(state, reasoning_result)

        # Phase 4: Observation
        observation_result = await self._observation_phase(state, action_result)

        # Phase 5: Postcondition Verify
        postcondition_result = await self._postcondition_verify(
            state,
            action_result,
            observation_result
        )

        # Phase 6: Uncertainty Estimate
        confidence = await self._calculate_uncertainty(
            reasoning_result,
            observation_result,
            postcondition_result
        )

        # Phase 7: Checkpoint
        checkpoint_result = await self._checkpoint_phase(
            state,
            confidence,
            postcondition_result
        )

        return checkpoint_result

    async def _precondition_check(self, state: Mode3State) -> ReActStepResult:
        """Phase 1: Verify state validity before proceeding."""

        checks = []

        # Check 1: Required state fields exist
        required_fields = ["session_id", "tenant_id", "agent_id", "user_message"]
        for field in required_fields:
            if not state.get(field):
                checks.append(f"Missing required field: {field}")

        # Check 2: Iteration limits
        react_count = state.get("react_cycle_count", 0)
        if react_count >= MAX_REACT_ITERATIONS:
            checks.append(f"Max iterations ({MAX_REACT_ITERATIONS}) exceeded")

        # Check 3: HITL not blocking
        if state.get("pending_hitl_request"):
            checks.append("Pending HITL request not resolved")

        # Check 4: Not in error state
        if state.get("error_state"):
            checks.append(f"Previous error: {state['error_state']}")

        success = len(checks) == 0

        return ReActStepResult(
            phase=ReActPhase.PRECONDITION,
            success=success,
            output={"checks": checks, "passed": success},
            confidence=1.0 if success else 0.0,
            reasoning_trace=f"Precondition check: {'PASSED' if success else 'FAILED'}",
            verification_status="valid" if success else "invalid",
            requires_hitl=not success and react_count >= MAX_REACT_ITERATIONS - 5,
            hitl_reason="Approaching iteration limit" if not success else None
        )

    async def _reasoning_phase(self, state: Mode3State) -> dict:
        """Phase 2: Chain-of-thought reasoning with uncertainty."""

        reasoning_prompt = f"""
        ## Current Context
        User Query: {state['user_message']}
        Mission Type: {state.get('mission_type', 'general')}
        Previous Steps: {len(state.get('autonomous_reasoning', []))}

        ## Available Tools
        {self._format_available_tools()}

        ## Instructions
        Think through this step-by-step:
        1. What is the current goal?
        2. What information do I have?
        3. What information do I need?
        4. What action should I take?
        5. What could go wrong?
        6. How confident am I? (0.0-1.0)

        ## Output Format
        Provide your reasoning in this structure:
        - GOAL: [current sub-goal]
        - HAVE: [available information]
        - NEED: [required information]
        - ACTION: [planned action with tool/query]
        - RISKS: [potential issues]
        - CONFIDENCE: [0.0-1.0 score with justification]
        """

        response = await self.llm.ainvoke([HumanMessage(content=reasoning_prompt)])

        # Parse structured reasoning
        parsed = self._parse_reasoning_output(response.content)

        return {
            "goal": parsed.get("goal"),
            "have": parsed.get("have"),
            "need": parsed.get("need"),
            "action_plan": parsed.get("action"),
            "risks": parsed.get("risks"),
            "self_confidence": parsed.get("confidence", 0.5),
            "raw_reasoning": response.content
        }

    async def _action_phase(self, state: Mode3State, reasoning: dict) -> dict:
        """Phase 3: Execute the planned action."""

        action_plan = reasoning.get("action_plan", {})

        if action_plan.get("type") == "tool_call":
            # Execute tool
            tool_name = action_plan.get("tool")
            tool_input = action_plan.get("input", {})

            result = await self.tool_registry.execute(
                tool_name,
                tool_input,
                tenant_id=state["tenant_id"]
            )

            return {
                "type": "tool_result",
                "tool": tool_name,
                "input": tool_input,
                "output": result,
                "success": not result.get("error")
            }

        elif action_plan.get("type") == "subagent_spawn":
            # Delegate to L4/L5 agent
            subagent_type = action_plan.get("agent_type")
            task = action_plan.get("task")

            result = await self._spawn_subagent(
                state,
                subagent_type,
                task
            )

            return {
                "type": "subagent_result",
                "agent": subagent_type,
                "task": task,
                "output": result,
                "success": result.get("status") == "complete"
            }

        elif action_plan.get("type") == "reasoning_continue":
            # Continue reasoning (no external action)
            return {
                "type": "reasoning_only",
                "conclusion": action_plan.get("conclusion"),
                "success": True
            }

        else:
            return {
                "type": "unknown",
                "success": False,
                "error": f"Unknown action type: {action_plan.get('type')}"
            }

    async def _observation_phase(self, state: Mode3State, action_result: dict) -> dict:
        """Phase 4: Capture and validate action results."""

        observation = {
            "action_type": action_result.get("type"),
            "success": action_result.get("success", False),
            "timestamp": datetime.utcnow().isoformat()
        }

        if action_result.get("type") == "tool_result":
            output = action_result.get("output", {})
            observation.update({
                "tool_name": action_result.get("tool"),
                "result_size": len(str(output)),
                "has_data": bool(output),
                "data_quality": self._assess_data_quality(output)
            })

        elif action_result.get("type") == "subagent_result":
            output = action_result.get("output", {})
            observation.update({
                "agent_type": action_result.get("agent"),
                "completion_status": output.get("status"),
                "reasoning_steps": len(output.get("reasoning", [])),
                "confidence": output.get("confidence", 0.5)
            })

        return observation

    async def _postcondition_verify(
        self,
        state: Mode3State,
        action_result: dict,
        observation: dict
    ) -> dict:
        """Phase 5: Verify action achieved intended effect."""

        verification_checks = []

        # Check 1: Action succeeded
        if not action_result.get("success"):
            verification_checks.append({
                "check": "action_success",
                "passed": False,
                "reason": action_result.get("error", "Action failed")
            })
        else:
            verification_checks.append({
                "check": "action_success",
                "passed": True
            })

        # Check 2: Output quality
        if observation.get("data_quality") == "low":
            verification_checks.append({
                "check": "output_quality",
                "passed": False,
                "reason": "Low quality output data"
            })
        else:
            verification_checks.append({
                "check": "output_quality",
                "passed": True
            })

        # Check 3: Progress made
        progress_made = self._assess_progress(state, action_result)
        verification_checks.append({
            "check": "progress_made",
            "passed": progress_made,
            "reason": "No meaningful progress" if not progress_made else None
        })

        all_passed = all(c.get("passed") for c in verification_checks)

        return {
            "checks": verification_checks,
            "all_passed": all_passed,
            "summary": "Verification passed" if all_passed else "Verification failed"
        }

    async def _calculate_uncertainty(
        self,
        reasoning: dict,
        observation: dict,
        postcondition: dict
    ) -> float:
        """Phase 6: Calculate overall confidence score."""

        # Self-reported confidence from reasoning
        self_confidence = reasoning.get("self_confidence", 0.5)

        # Objective metrics
        action_success = 1.0 if observation.get("success") else 0.0
        data_quality_score = {
            "high": 1.0,
            "medium": 0.7,
            "low": 0.3,
            None: 0.5
        }.get(observation.get("data_quality"), 0.5)

        verification_score = 1.0 if postcondition.get("all_passed") else 0.5

        # Weighted average
        confidence = (
            self_confidence * 0.3 +
            action_success * 0.3 +
            data_quality_score * 0.2 +
            verification_score * 0.2
        )

        return round(confidence, 3)

    async def _checkpoint_phase(
        self,
        state: Mode3State,
        confidence: float,
        postcondition: dict
    ) -> ReActStepResult:
        """Phase 7: Save state and trigger HITL if needed."""

        # Determine if HITL is required
        requires_hitl = False
        hitl_reason = None

        # Low confidence trigger
        if confidence < self.confidence_threshold:
            requires_hitl = True
            hitl_reason = f"Low confidence ({confidence:.2f} < {self.confidence_threshold})"

        # Verification failure trigger
        if not postcondition.get("all_passed"):
            requires_hitl = True
            hitl_reason = hitl_reason or "Verification checks failed"

        # High-risk action trigger (would be detected in action phase)

        return ReActStepResult(
            phase=ReActPhase.CHECKPOINT,
            success=postcondition.get("all_passed", False),
            output={
                "confidence": confidence,
                "verification": postcondition,
                "checkpoint_saved": True
            },
            confidence=confidence,
            reasoning_trace=f"Cycle complete with confidence {confidence:.2f}",
            verification_status=postcondition.get("summary"),
            requires_hitl=requires_hitl,
            hitl_reason=hitl_reason
        )
```

#### Day 4-5: Integration & Testing

- Integrate ReAct² engine with Mode 3 workflow
- Unit tests for each phase
- Integration tests for full cycle
- Performance optimization

**Deliverables:**
- [ ] ReAct² engine fully implemented
- [ ] 7 phases executing correctly
- [ ] Confidence calculation accurate
- [ ] HITL triggers working

---

### Week 4: HITL Checkpoints & Missions 1-8

**Goal:** Implement all 5 HITL checkpoints and first 8 missions

#### Day 1-2: 5 HITL Checkpoints

```python
# services/ai-engine/src/services/hitl_checkpoint_service.py

from enum import Enum
from typing import Optional
from dataclasses import dataclass

class HITLCheckpointType(str, Enum):
    PLAN_APPROVAL = "plan_approval"
    TOOL_APPROVAL = "tool_approval"
    SUBAGENT_APPROVAL = "subagent_approval"
    CRITICAL_DECISION = "critical_decision"
    FINAL_REVIEW = "final_review"

@dataclass
class HITLCheckpoint:
    checkpoint_type: HITLCheckpointType
    session_id: str
    tenant_id: str
    payload: dict
    timeout_seconds: int = 300
    auto_approve_fallback: bool = False  # ALWAYS FALSE - fail-closed

class HITLCheckpointService:
    """
    Human-in-the-Loop Checkpoint Service

    5 Checkpoint Types:
    1. Plan Approval - Review execution plan before starting
    2. Tool Approval - Approve external tool/API calls
    3. Sub-Agent Approval - Approve spawning L4/L5 agents
    4. Critical Decision - High-risk decision points
    5. Final Review - Review before delivering response
    """

    def __init__(self, supabase, event_emitter):
        self.supabase = supabase
        self.event_emitter = event_emitter

    async def request_approval(
        self,
        checkpoint: HITLCheckpoint
    ) -> dict:
        """Request human approval for a checkpoint."""

        # Store checkpoint request in database
        checkpoint_record = await self.supabase.from_("mode3_hitl_checkpoints").insert({
            "session_id": checkpoint.session_id,
            "tenant_id": checkpoint.tenant_id,
            "checkpoint_type": checkpoint.checkpoint_type.value,
            "payload": checkpoint.payload,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(seconds=checkpoint.timeout_seconds)).isoformat()
        }).execute()

        checkpoint_id = checkpoint_record.data[0]["id"]

        # Emit SSE event
        await self.event_emitter.emit("hitl_request", {
            "checkpoint_id": checkpoint_id,
            "checkpoint_type": checkpoint.checkpoint_type.value,
            "payload": checkpoint.payload,
            "timeout_seconds": checkpoint.timeout_seconds
        })

        # Wait for response (polling or websocket)
        result = await self._wait_for_approval(
            checkpoint_id,
            checkpoint.timeout_seconds
        )

        return result

    async def _wait_for_approval(
        self,
        checkpoint_id: str,
        timeout_seconds: int
    ) -> dict:
        """Wait for human approval with timeout."""

        start_time = datetime.utcnow()
        poll_interval = 1.0  # seconds

        while (datetime.utcnow() - start_time).total_seconds() < timeout_seconds:
            # Check for response
            result = await self.supabase.from_("mode3_hitl_checkpoints") \
                .select("*") \
                .eq("id", checkpoint_id) \
                .single()

            status = result.data.get("status")

            if status == "approved":
                return {
                    "approved": True,
                    "feedback": result.data.get("feedback"),
                    "approver_id": result.data.get("approver_id"),
                    "approved_at": result.data.get("approved_at")
                }

            elif status == "rejected":
                return {
                    "approved": False,
                    "feedback": result.data.get("feedback"),
                    "rejection_reason": result.data.get("rejection_reason"),
                    "rejected_at": result.data.get("rejected_at")
                }

            await asyncio.sleep(poll_interval)

        # TIMEOUT - FAIL CLOSED (NEVER auto-approve)
        await self.supabase.from_("mode3_hitl_checkpoints").update({
            "status": "timeout",
            "timeout_at": datetime.utcnow().isoformat()
        }).eq("id", checkpoint_id).execute()

        return {
            "approved": False,
            "timeout": True,
            "reason": "HITL approval timed out - defaulting to REJECT for safety"
        }

    async def submit_approval(
        self,
        checkpoint_id: str,
        approved: bool,
        approver_id: str,
        feedback: Optional[str] = None,
        rejection_reason: Optional[str] = None
    ) -> dict:
        """Submit human approval decision."""

        update_data = {
            "status": "approved" if approved else "rejected",
            "approver_id": approver_id,
            "feedback": feedback,
            f"{'approved' if approved else 'rejected'}_at": datetime.utcnow().isoformat()
        }

        if not approved:
            update_data["rejection_reason"] = rejection_reason

        result = await self.supabase.from_("mode3_hitl_checkpoints") \
            .update(update_data) \
            .eq("id", checkpoint_id) \
            .execute()

        # Emit response event
        await self.event_emitter.emit(
            "hitl_approved" if approved else "hitl_rejected",
            {
                "checkpoint_id": checkpoint_id,
                "approved": approved,
                "feedback": feedback
            }
        )

        return {"success": True, "approved": approved}


# Integration with Mode 3 workflow
async def check_plan_approval(state: Mode3State, hitl_service: HITLCheckpointService) -> dict:
    """Checkpoint 1: Plan Approval"""

    if state.get("autonomy_level") == "permissive" and not state.get("plan_is_high_risk"):
        # Skip for permissive mode on low-risk plans
        return {"approved": True, "skipped": True}

    result = await hitl_service.request_approval(HITLCheckpoint(
        checkpoint_type=HITLCheckpointType.PLAN_APPROVAL,
        session_id=state["session_id"],
        tenant_id=state["tenant_id"],
        payload={
            "plan": state.get("execution_plan"),
            "estimated_steps": state.get("estimated_steps"),
            "tools_required": state.get("planned_tools"),
            "risk_assessment": state.get("plan_risk_assessment")
        }
    ))

    return result


async def check_tool_approval(
    state: Mode3State,
    tool_name: str,
    tool_input: dict,
    hitl_service: HITLCheckpointService
) -> dict:
    """Checkpoint 2: Tool Approval"""

    # Only require approval for high-risk tools
    high_risk_tools = ["web_search", "external_api", "database_write", "file_system"]

    if tool_name not in high_risk_tools:
        return {"approved": True, "skipped": True}

    if state.get("autonomy_level") == "permissive":
        return {"approved": True, "skipped": True}

    result = await hitl_service.request_approval(HITLCheckpoint(
        checkpoint_type=HITLCheckpointType.TOOL_APPROVAL,
        session_id=state["session_id"],
        tenant_id=state["tenant_id"],
        payload={
            "tool_name": tool_name,
            "tool_input": tool_input,
            "risk_level": "high" if tool_name in high_risk_tools else "low"
        },
        timeout_seconds=120  # Shorter timeout for tool approvals
    ))

    return result


async def check_subagent_approval(
    state: Mode3State,
    agent_type: str,
    task: str,
    hitl_service: HITLCheckpointService
) -> dict:
    """Checkpoint 3: Sub-Agent Approval"""

    if state.get("autonomy_level") == "permissive":
        return {"approved": True, "skipped": True}

    result = await hitl_service.request_approval(HITLCheckpoint(
        checkpoint_type=HITLCheckpointType.SUBAGENT_APPROVAL,
        session_id=state["session_id"],
        tenant_id=state["tenant_id"],
        payload={
            "agent_type": agent_type,
            "level": get_agent_level(agent_type),
            "task": task,
            "estimated_cost": estimate_agent_cost(agent_type),
            "estimated_time": estimate_agent_time(agent_type)
        }
    ))

    return result


async def check_critical_decision(
    state: Mode3State,
    decision: dict,
    hitl_service: HITLCheckpointService
) -> dict:
    """Checkpoint 4: Critical Decision Approval"""

    # Always require approval for critical decisions
    result = await hitl_service.request_approval(HITLCheckpoint(
        checkpoint_type=HITLCheckpointType.CRITICAL_DECISION,
        session_id=state["session_id"],
        tenant_id=state["tenant_id"],
        payload={
            "decision": decision.get("description"),
            "options": decision.get("options"),
            "recommendation": decision.get("recommendation"),
            "confidence": decision.get("confidence"),
            "impact": decision.get("impact"),
            "reversible": decision.get("reversible", True)
        },
        timeout_seconds=600  # Longer timeout for important decisions
    ))

    return result


async def check_final_review(
    state: Mode3State,
    final_response: dict,
    hitl_service: HITLCheckpointService
) -> dict:
    """Checkpoint 5: Final Review"""

    if state.get("autonomy_level") == "permissive":
        return {"approved": True, "skipped": True}

    result = await hitl_service.request_approval(HITLCheckpoint(
        checkpoint_type=HITLCheckpointType.FINAL_REVIEW,
        session_id=state["session_id"],
        tenant_id=state["tenant_id"],
        payload={
            "response": final_response.get("content"),
            "citations": final_response.get("citations", []),
            "confidence": final_response.get("confidence"),
            "reasoning_steps": len(state.get("autonomous_reasoning", [])),
            "tools_used": state.get("tools_used", []),
            "warnings": final_response.get("warnings", [])
        }
    ))

    return result
```

#### Day 3-5: Missions 1-8 Implementation

**UNDERSTAND Category (Missions 1-4):**

```python
# services/ai-engine/src/langgraph_workflows/missions/understand.py

from typing import TypedDict, List
from langgraph.graph import StateGraph, END

class UnderstandMissionState(TypedDict):
    # Base fields
    session_id: str
    tenant_id: str
    agent_id: str
    user_message: str
    mission_type: str

    # Mission-specific
    domain_context: dict
    knowledge_sources: List[dict]
    gap_analysis: dict
    synthesis: dict

# Mission 1: Deep Dive
async def build_deep_dive_mission() -> StateGraph:
    """
    Mission 1: Deep Dive
    Purpose: Achieve comprehensive domain mastery
    Reasoning Pattern: ToT + CoT + Reflection
    L4 Workers: DE, CS, PM, TL, GD, OE
    L5 Tools: RAG, PS, CT, PT, FDA, WEB
    """

    graph = StateGraph(UnderstandMissionState)

    # Phase 1: Initial Knowledge Gathering
    graph.add_node("gather_knowledge", gather_knowledge_node)

    # Phase 2: Data Extraction (L4: DE)
    graph.add_node("extract_data", create_l4_worker_node("data_extractor"))

    # Phase 3: Pattern Matching (L4: PM)
    graph.add_node("match_patterns", create_l4_worker_node("pattern_matcher"))

    # Phase 4: Timeline Building (L4: TL)
    graph.add_node("build_timeline", create_l4_worker_node("timeline_builder"))

    # Phase 5: Gap Detection (L4: GD)
    graph.add_node("detect_gaps", create_l4_worker_node("gap_detector"))

    # Phase 6: Comparison Synthesis (L4: CS)
    graph.add_node("synthesize", create_l4_worker_node("comparison_synthesizer"))

    # Phase 7: Objection Exploration (L4: OE)
    graph.add_node("explore_objections", create_l4_worker_node("objection_explorer"))

    # Phase 8: Final Synthesis
    graph.add_node("final_synthesis", final_synthesis_node)

    # Edges
    graph.add_edge("gather_knowledge", "extract_data")
    graph.add_edge("extract_data", "match_patterns")
    graph.add_edge("match_patterns", "build_timeline")
    graph.add_edge("build_timeline", "detect_gaps")
    graph.add_edge("detect_gaps", "synthesize")
    graph.add_edge("synthesize", "explore_objections")
    graph.add_edge("explore_objections", "final_synthesis")
    graph.add_edge("final_synthesis", END)

    graph.set_entry_point("gather_knowledge")

    return graph.compile()


# Mission 2: Knowledge Harvest
async def build_knowledge_harvest_mission() -> StateGraph:
    """
    Mission 2: Knowledge Harvest
    Purpose: Exhaustive information collection
    Reasoning Pattern: Systematic Search + CoT
    L4 Workers: DE, CM, QA, PM
    L5 Tools: RAG, PS, WEB, NEWS, FDA, EMA
    """

    graph = StateGraph(UnderstandMissionState)

    # Phase 1: Search Strategy
    graph.add_node("plan_search", plan_search_strategy_node)

    # Phase 2: Multi-Source Search (parallel L5 tools)
    graph.add_node("search_pubmed", create_l5_tool_node("pubmed_search"))
    graph.add_node("search_web", create_l5_tool_node("web_search"))
    graph.add_node("search_news", create_l5_tool_node("news_search"))
    graph.add_node("search_rag", create_l5_tool_node("rag_search"))

    # Phase 3: Data Extraction (L4: DE)
    graph.add_node("extract_all", create_l4_worker_node("data_extractor"))

    # Phase 4: Citation Management (L4: CM)
    graph.add_node("manage_citations", create_l4_worker_node("citation_manager"))

    # Phase 5: Quality Assessment (L4: QA)
    graph.add_node("assess_quality", create_l4_worker_node("quality_assessor"))

    # Phase 6: Pattern Matching (L4: PM)
    graph.add_node("find_patterns", create_l4_worker_node("pattern_matcher"))

    # Phase 7: Synthesis
    graph.add_node("synthesize_harvest", synthesize_harvest_node)

    # Edges - with parallel search
    graph.add_edge("plan_search", "search_pubmed")
    graph.add_edge("plan_search", "search_web")
    graph.add_edge("plan_search", "search_news")
    graph.add_edge("plan_search", "search_rag")

    # Fan-in after parallel searches
    graph.add_edge("search_pubmed", "extract_all")
    graph.add_edge("search_web", "extract_all")
    graph.add_edge("search_news", "extract_all")
    graph.add_edge("search_rag", "extract_all")

    graph.add_edge("extract_all", "manage_citations")
    graph.add_edge("manage_citations", "assess_quality")
    graph.add_edge("assess_quality", "find_patterns")
    graph.add_edge("find_patterns", "synthesize_harvest")
    graph.add_edge("synthesize_harvest", END)

    graph.set_entry_point("plan_search")

    return graph.compile()


# Mission 3: Gap Discovery
async def build_gap_discovery_mission() -> StateGraph:
    """
    Mission 3: Gap Discovery
    Purpose: Find unknown unknowns
    Reasoning Pattern: Socratic + Analogical
    L4 Workers: GD, HG, OE, CA
    L5 Tools: RAG, PS, CT, WEB
    """

    graph = StateGraph(UnderstandMissionState)

    # Phase 1: Current Knowledge Assessment
    graph.add_node("assess_known", assess_current_knowledge_node)

    # Phase 2: Gap Detection (L4: GD)
    graph.add_node("detect_gaps", create_l4_worker_node("gap_detector"))

    # Phase 3: Hypothesis Generation (L4: HG)
    graph.add_node("generate_hypotheses", create_l4_worker_node("hypothesis_generator"))

    # Phase 4: Analogical Reasoning
    graph.add_node("find_analogies", find_analogies_node)

    # Phase 5: Objection Exploration (L4: OE)
    graph.add_node("explore_blind_spots", create_l4_worker_node("objection_explorer"))

    # Phase 6: Causal Analysis (L4: CA)
    graph.add_node("analyze_causes", create_l4_worker_node("causal_analyzer"))

    # Phase 7: Gap Report
    graph.add_node("report_gaps", generate_gap_report_node)

    # Edges
    graph.add_edge("assess_known", "detect_gaps")
    graph.add_edge("detect_gaps", "generate_hypotheses")
    graph.add_edge("generate_hypotheses", "find_analogies")
    graph.add_edge("find_analogies", "explore_blind_spots")
    graph.add_edge("explore_blind_spots", "analyze_causes")
    graph.add_edge("analyze_causes", "report_gaps")
    graph.add_edge("report_gaps", END)

    graph.set_entry_point("assess_known")

    return graph.compile()


# Mission 4: Expert Onboarding
async def build_expert_onboarding_mission() -> StateGraph:
    """
    Mission 4: Expert Onboarding
    Purpose: Rapid domain competency
    Reasoning Pattern: Progressive Disclosure + CoT
    L4 Workers: DE, CS, TL, PM
    L5 Tools: RAG, PS, FDA, FMT
    """

    graph = StateGraph(UnderstandMissionState)

    # Phase 1: Knowledge Level Assessment
    graph.add_node("assess_level", assess_knowledge_level_node)

    # Phase 2: Core Concepts Extraction (L4: DE)
    graph.add_node("extract_core", create_l4_worker_node("data_extractor"))

    # Phase 3: Learning Path Creation
    graph.add_node("create_path", create_learning_path_node)

    # Phase 4: Timeline Building (L4: TL)
    graph.add_node("build_history", create_l4_worker_node("timeline_builder"))

    # Phase 5: Pattern Identification (L4: PM)
    graph.add_node("identify_patterns", create_l4_worker_node("pattern_matcher"))

    # Phase 6: Comparison with Known (L4: CS)
    graph.add_node("compare_analogies", create_l4_worker_node("comparison_synthesizer"))

    # Phase 7: Onboarding Document
    graph.add_node("generate_onboarding", generate_onboarding_doc_node)

    # Edges
    graph.add_edge("assess_level", "extract_core")
    graph.add_edge("extract_core", "create_path")
    graph.add_edge("create_path", "build_history")
    graph.add_edge("build_history", "identify_patterns")
    graph.add_edge("identify_patterns", "compare_analogies")
    graph.add_edge("compare_analogies", "generate_onboarding")
    graph.add_edge("generate_onboarding", END)

    graph.set_entry_point("assess_level")

    return graph.compile()
```

**EVALUATE Category (Missions 5-8):**

```python
# services/ai-engine/src/langgraph_workflows/missions/evaluate.py

# Mission 5: Critique
async def build_critique_mission() -> StateGraph:
    """
    Mission 5: Critique
    Purpose: Tough-but-fair work review
    Reasoning Pattern: Debate + Reflection
    L4 Workers: QA, EV, OE, RF, PS
    L5 Tools: RAG, PS, FDA, STAT
    """

    graph = StateGraph(EvaluateMissionState)

    graph.add_node("analyze_submission", analyze_submission_node)
    graph.add_node("assess_quality", create_l4_worker_node("quality_assessor"))
    graph.add_node("validate_evidence", create_l4_worker_node("evidence_validator"))
    graph.add_node("explore_objections", create_l4_worker_node("objection_explorer"))
    graph.add_node("flag_risks", create_l4_worker_node("risk_flagger"))
    graph.add_node("score_priorities", create_l4_worker_node("priority_scorer"))
    graph.add_node("generate_critique", generate_critique_report_node)

    # Linear flow for critique
    graph.add_edge("analyze_submission", "assess_quality")
    graph.add_edge("assess_quality", "validate_evidence")
    graph.add_edge("validate_evidence", "explore_objections")
    graph.add_edge("explore_objections", "flag_risks")
    graph.add_edge("flag_risks", "score_priorities")
    graph.add_edge("score_priorities", "generate_critique")
    graph.add_edge("generate_critique", END)

    graph.set_entry_point("analyze_submission")

    return graph.compile()


# Mission 6: Benchmark
async def build_benchmark_mission() -> StateGraph:
    """
    Mission 6: Benchmark
    Purpose: Competitive/standard comparison
    Reasoning Pattern: Comparative Analysis + CoT
    L4 Workers: CS, DE, PM, QA, PS
    L5 Tools: RAG, PS, CT, FDA, WEB, STAT
    """

    graph = StateGraph(EvaluateMissionState)

    graph.add_node("define_criteria", define_benchmark_criteria_node)
    graph.add_node("gather_comparables", gather_benchmark_data_node)
    graph.add_node("extract_metrics", create_l4_worker_node("data_extractor"))
    graph.add_node("match_patterns", create_l4_worker_node("pattern_matcher"))
    graph.add_node("synthesize_comparison", create_l4_worker_node("comparison_synthesizer"))
    graph.add_node("assess_quality", create_l4_worker_node("quality_assessor"))
    graph.add_node("score_priorities", create_l4_worker_node("priority_scorer"))
    graph.add_node("generate_benchmark", generate_benchmark_report_node)

    graph.add_edge("define_criteria", "gather_comparables")
    graph.add_edge("gather_comparables", "extract_metrics")
    graph.add_edge("extract_metrics", "match_patterns")
    graph.add_edge("match_patterns", "synthesize_comparison")
    graph.add_edge("synthesize_comparison", "assess_quality")
    graph.add_edge("assess_quality", "score_priorities")
    graph.add_edge("score_priorities", "generate_benchmark")
    graph.add_edge("generate_benchmark", END)

    graph.set_entry_point("define_criteria")

    return graph.compile()


# Mission 7: Risk Assessment
async def build_risk_assessment_mission() -> StateGraph:
    """
    Mission 7: Risk Assessment
    Purpose: Systematic risk analysis
    Reasoning Pattern: FMEA + CoT
    L4 Workers: RF, CA, SC, PS, EV
    L5 Tools: RAG, FDA, STAT, CALC
    """

    graph = StateGraph(EvaluateMissionState)

    graph.add_node("identify_risks", identify_risks_node)
    graph.add_node("analyze_causes", create_l4_worker_node("causal_analyzer"))
    graph.add_node("flag_severity", create_l4_worker_node("risk_flagger"))
    graph.add_node("construct_scenarios", create_l4_worker_node("scenario_constructor"))
    graph.add_node("validate_evidence", create_l4_worker_node("evidence_validator"))
    graph.add_node("score_priorities", create_l4_worker_node("priority_scorer"))
    graph.add_node("generate_risk_matrix", generate_risk_matrix_node)

    graph.add_edge("identify_risks", "analyze_causes")
    graph.add_edge("analyze_causes", "flag_severity")
    graph.add_edge("flag_severity", "construct_scenarios")
    graph.add_edge("construct_scenarios", "validate_evidence")
    graph.add_edge("validate_evidence", "score_priorities")
    graph.add_edge("score_priorities", "generate_risk_matrix")
    graph.add_edge("generate_risk_matrix", END)

    graph.set_entry_point("identify_risks")

    return graph.compile()


# Mission 8: Compliance Check
async def build_compliance_check_mission() -> StateGraph:
    """
    Mission 8: Compliance Check
    Purpose: Regulatory gap analysis
    Reasoning Pattern: Checklist + Evidence Mapping
    L4 Workers: GD, EV, RF, QA, CM
    L5 Tools: FDA, EMA, RAG, FMT
    """

    graph = StateGraph(EvaluateMissionState)

    graph.add_node("load_requirements", load_compliance_requirements_node)
    graph.add_node("detect_gaps", create_l4_worker_node("gap_detector"))
    graph.add_node("validate_evidence", create_l4_worker_node("evidence_validator"))
    graph.add_node("flag_risks", create_l4_worker_node("risk_flagger"))
    graph.add_node("assess_quality", create_l4_worker_node("quality_assessor"))
    graph.add_node("manage_citations", create_l4_worker_node("citation_manager"))
    graph.add_node("generate_compliance_report", generate_compliance_report_node)

    graph.add_edge("load_requirements", "detect_gaps")
    graph.add_edge("detect_gaps", "validate_evidence")
    graph.add_edge("validate_evidence", "flag_risks")
    graph.add_edge("flag_risks", "assess_quality")
    graph.add_edge("assess_quality", "manage_citations")
    graph.add_edge("manage_citations", "generate_compliance_report")
    graph.add_edge("generate_compliance_report", END)

    graph.set_entry_point("load_requirements")

    return graph.compile()
```

**Phase 1 Deliverables:**
- [ ] Security vulnerabilities fixed
- [ ] SSE streaming operational
- [ ] ReAct² 7-phase cycle working
- [ ] All 5 HITL checkpoints implemented
- [ ] Missions 1-8 (UNDERSTAND + EVALUATE) complete
- [ ] Integration tests passing
- [ ] Performance benchmarks met

---

## Phase 2: Hierarchy (Weeks 5-8)

### Week 5: L1-L5 Agent Architecture

**Goal:** Implement full agent hierarchy with delegation

#### L4 Worker Pool (15 Workers)

```python
# services/ai-engine/src/agents/l4_workers/worker_registry.py

from enum import Enum
from typing import Dict, Type
from dataclasses import dataclass

class L4WorkerType(str, Enum):
    DATA_EXTRACTOR = "DE"           # Extract structured data from unstructured sources
    DOCUMENT_PROCESSOR = "DP"       # Process and parse documents
    CITATION_MANAGER = "CM"         # Manage references and citations
    QUALITY_ASSESSOR = "QA"         # Assess data/output quality
    COMPARISON_SYNTHESIZER = "CS"   # Compare and synthesize findings
    TIMELINE_BUILDER = "TL"         # Build chronological narratives
    PATTERN_MATCHER = "PM"          # Identify patterns in data
    GAP_DETECTOR = "GD"             # Find knowledge gaps
    RISK_FLAGGER = "RF"             # Identify and flag risks
    EVIDENCE_VALIDATOR = "EV"       # Validate claims against evidence
    HYPOTHESIS_GENERATOR = "HG"     # Generate hypotheses
    CAUSAL_ANALYZER = "CA"          # Analyze cause-effect relationships
    SCENARIO_CONSTRUCTOR = "SC"     # Build scenarios and simulations
    OBJECTION_EXPLORER = "OE"       # Explore counterarguments
    PRIORITY_SCORER = "PS"          # Score and rank by priority

@dataclass
class L4WorkerConfig:
    type: L4WorkerType
    model: str
    temperature: float
    max_tokens: int
    system_prompt: str
    available_l5_tools: List[str]
    estimated_cost: float
    estimated_time_seconds: int

class L4WorkerRegistry:
    """Registry of all L4 Worker agents."""

    _workers: Dict[L4WorkerType, L4WorkerConfig] = {}

    @classmethod
    def register(cls, config: L4WorkerConfig):
        cls._workers[config.type] = config

    @classmethod
    def get(cls, worker_type: L4WorkerType) -> L4WorkerConfig:
        if worker_type not in cls._workers:
            raise ValueError(f"Unknown L4 worker: {worker_type}")
        return cls._workers[worker_type]

    @classmethod
    def all(cls) -> List[L4WorkerConfig]:
        return list(cls._workers.values())

# Register all L4 workers
L4WorkerRegistry.register(L4WorkerConfig(
    type=L4WorkerType.DATA_EXTRACTOR,
    model="gpt-4o",
    temperature=0.3,
    max_tokens=4000,
    system_prompt="""
    YOU ARE: A precise Data Extractor (L4 Worker) specialized in converting
    unstructured information into structured, validated data.

    YOU DO:
    1. Extract key entities, facts, and relationships from text
    2. Structure data into consistent formats (JSON, tables)
    3. Validate extracted data against schemas
    4. Flag ambiguous or uncertain extractions
    5. Provide extraction confidence scores

    YOU NEVER:
    1. Hallucinate data not present in source
    2. Make assumptions without flagging uncertainty
    3. Skip validation steps

    SUCCESS CRITERIA:
    - >95% extraction accuracy
    - <5% false positive rate
    - All uncertainties flagged

    WHEN UNSURE:
    - Flag with confidence < 0.7
    - Request human validation
    - Provide alternative interpretations
    """,
    available_l5_tools=["RAG", "NLP", "FMT"],
    estimated_cost=0.05,
    estimated_time_seconds=30
))

L4WorkerRegistry.register(L4WorkerConfig(
    type=L4WorkerType.CITATION_MANAGER,
    model="gpt-4o",
    temperature=0.2,
    max_tokens=3000,
    system_prompt="""
    YOU ARE: A meticulous Citation Manager (L4 Worker) ensuring all claims
    are properly attributed and verifiable.

    YOU DO:
    1. Track and format citations in medical/scientific style
    2. Verify citation accuracy against original sources
    3. Detect missing citations for claims
    4. Manage reference lists and bibliographies
    5. Flag citation quality issues (predatory journals, retractions)

    YOU NEVER:
    1. Allow unattributed factual claims
    2. Accept citations without verification
    3. Use non-peer-reviewed sources for medical claims without disclosure

    SUCCESS CRITERIA:
    - 100% of factual claims cited
    - 0 fabricated citations
    - All sources verified accessible

    WHEN UNSURE:
    - Mark citation as "unverified"
    - Request source verification
    - Provide confidence level
    """,
    available_l5_tools=["PS", "RAG", "WEB", "FMT"],
    estimated_cost=0.04,
    estimated_time_seconds=25
))

# ... Register remaining 13 L4 workers similarly
```

#### L5 Tool Registry (13 Tools)

```python
# services/ai-engine/src/agents/l5_tools/tool_registry.py

from enum import Enum
from typing import Dict, Callable, Any
from dataclasses import dataclass

class L5ToolType(str, Enum):
    PUBMED_SEARCH = "PS"            # Search PubMed/biomedical literature
    CLINICAL_TRIAL_SEARCH = "CT"    # Search ClinicalTrials.gov
    PATENT_SEARCH = "PT"            # Search patent databases
    FDA_DATABASE = "FDA"            # Query FDA databases
    RAG_SEARCH = "RAG"              # Internal knowledge base search
    WEB_SEARCH = "WEB"              # General web search
    CALCULATOR = "CALC"             # Mathematical calculations
    NLP_PROCESSOR = "NLP"           # Text processing (NER, classification)
    FORMATTER = "FMT"               # Output formatting
    VISUALIZER = "VIZ"              # Generate charts/diagrams
    NEWS_SEARCH = "NEWS"            # News and press releases
    EMA_DATABASE = "EMA"            # European Medicines Agency
    STATISTICAL_ANALYSIS = "STAT"   # Statistical computations

@dataclass
class L5ToolConfig:
    type: L5ToolType
    name: str
    description: str
    input_schema: dict
    output_schema: dict
    requires_approval: bool
    estimated_cost: float
    estimated_time_seconds: int
    handler: Callable[[dict], Any]

class L5ToolRegistry:
    """Registry of all L5 Tool agents."""

    _tools: Dict[L5ToolType, L5ToolConfig] = {}

    @classmethod
    def register(cls, config: L5ToolConfig):
        cls._tools[config.type] = config

    @classmethod
    def get(cls, tool_type: L5ToolType) -> L5ToolConfig:
        if tool_type not in cls._tools:
            raise ValueError(f"Unknown L5 tool: {tool_type}")
        return cls._tools[tool_type]

    @classmethod
    def execute(cls, tool_type: L5ToolType, input_data: dict, tenant_id: str) -> dict:
        config = cls.get(tool_type)

        # Validate input
        validate_schema(input_data, config.input_schema)

        # Execute
        result = config.handler(input_data)

        # Validate output
        validate_schema(result, config.output_schema)

        return result

# Register L5 tools
L5ToolRegistry.register(L5ToolConfig(
    type=L5ToolType.PUBMED_SEARCH,
    name="PubMed Search",
    description="Search biomedical literature in PubMed/MEDLINE",
    input_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "max_results": {"type": "integer", "default": 20},
            "date_range": {"type": "string"},
            "article_types": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["query"]
    },
    output_schema={
        "type": "object",
        "properties": {
            "results": {"type": "array"},
            "total_count": {"type": "integer"},
            "query_used": {"type": "string"}
        }
    },
    requires_approval=False,
    estimated_cost=0.01,
    estimated_time_seconds=5,
    handler=pubmed_search_handler
))

L5ToolRegistry.register(L5ToolConfig(
    type=L5ToolType.FDA_DATABASE,
    name="FDA Database Query",
    description="Query FDA drug approvals, labels, adverse events",
    input_schema={
        "type": "object",
        "properties": {
            "query_type": {"type": "string", "enum": ["drugs", "labels", "adverse_events", "approvals"]},
            "search_term": {"type": "string"},
            "filters": {"type": "object"}
        },
        "required": ["query_type", "search_term"]
    },
    output_schema={
        "type": "object",
        "properties": {
            "results": {"type": "array"},
            "metadata": {"type": "object"}
        }
    },
    requires_approval=False,
    estimated_cost=0.01,
    estimated_time_seconds=3,
    handler=fda_database_handler
))

# ... Register remaining 11 L5 tools
```

### Week 6: Agent Hierarchy Integration

```python
# services/ai-engine/src/services/agent_hierarchy_service.py

class AgentHierarchyService:
    """
    Manages the 5-Level Agent Hierarchy:
    L1: Master (Head of Function) - Process orchestrator
    L2: Expert (Head of Department) - Coordinator
    L3: Specialist (Manager) - Domain expert
    L4: Worker (Entry specialist) - Task orchestrator
    L5: Tool (Intern) - Atomic executor
    """

    def __init__(self, supabase, llm_factory, tool_registry, worker_registry):
        self.supabase = supabase
        self.llm_factory = llm_factory
        self.tool_registry = tool_registry
        self.worker_registry = worker_registry

    async def spawn_subagent(
        self,
        parent_state: Mode3State,
        agent_level: int,
        agent_type: str,
        task: str,
        context: dict
    ) -> dict:
        """Spawn a sub-agent at the specified level."""

        # Validate hierarchy rules
        parent_level = parent_state.get("current_agent_level", 3)
        if agent_level <= parent_level:
            raise HierarchyViolationError(
                f"Cannot spawn L{agent_level} from L{parent_level}"
            )

        if agent_level == 4:
            return await self._spawn_l4_worker(parent_state, agent_type, task, context)
        elif agent_level == 5:
            return await self._spawn_l5_tool(parent_state, agent_type, task, context)
        else:
            raise ValueError(f"Cannot directly spawn L{agent_level} agents")

    async def _spawn_l4_worker(
        self,
        parent_state: Mode3State,
        worker_type: str,
        task: str,
        context: dict
    ) -> dict:
        """Spawn an L4 Worker agent."""

        # Get worker config
        worker_config = self.worker_registry.get(L4WorkerType(worker_type))

        # Create worker instance
        worker_id = str(uuid.uuid4())

        # Record spawn in database
        await self.supabase.from_("mode3_agent_instances").insert({
            "id": worker_id,
            "session_id": parent_state["session_id"],
            "parent_instance_id": parent_state.get("current_instance_id"),
            "agent_level": 4,
            "agent_type": worker_type,
            "task": task,
            "status": "running",
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        # Build worker LLM
        llm = self.llm_factory.create(
            model=worker_config.model,
            temperature=worker_config.temperature,
            max_tokens=worker_config.max_tokens
        )

        # Execute worker task
        worker_prompt = f"""
        {worker_config.system_prompt}

        ## TASK
        {task}

        ## CONTEXT
        {json.dumps(context)}

        ## AVAILABLE TOOLS
        You can use these L5 tools: {worker_config.available_l5_tools}

        ## OUTPUT FORMAT
        Provide your result in structured JSON format.
        """

        response = await llm.ainvoke([HumanMessage(content=worker_prompt)])

        # Parse and validate result
        result = self._parse_worker_result(response.content)

        # Update instance status
        await self.supabase.from_("mode3_agent_instances").update({
            "status": "complete",
            "result": result,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", worker_id).execute()

        return {
            "worker_id": worker_id,
            "worker_type": worker_type,
            "result": result,
            "status": "complete"
        }

    async def _spawn_l5_tool(
        self,
        parent_state: Mode3State,
        tool_type: str,
        task: str,
        context: dict
    ) -> dict:
        """Execute an L5 Tool."""

        tool_config = self.tool_registry.get(L5ToolType(tool_type))

        # Extract input from task/context
        tool_input = self._prepare_tool_input(tool_config, task, context)

        # Execute tool
        result = await self.tool_registry.execute(
            L5ToolType(tool_type),
            tool_input,
            parent_state["tenant_id"]
        )

        return {
            "tool_type": tool_type,
            "result": result,
            "status": "complete"
        }
```

### Week 7: Tri-Memory Architecture

```python
# services/ai-engine/src/memory/tri_memory.py

from typing import TypedDict, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class EpisodicCheckpoint:
    """A snapshot of state at a specific point in time."""
    checkpoint_id: str
    session_id: str
    timestamp: datetime
    state_snapshot: dict
    reasoning_step: int
    confidence: float
    hitl_status: Optional[str]

@dataclass
class SemanticContext:
    """Domain knowledge and context for the session."""
    domain: str
    key_concepts: List[str]
    relationships: List[dict]
    constraints: List[str]
    knowledge_sources: List[dict]

@dataclass
class WorkingMemory:
    """Current active context and reasoning state."""
    current_goal: str
    active_hypotheses: List[str]
    pending_actions: List[dict]
    recent_observations: List[dict]
    confidence_scores: dict
    attention_focus: str

class TriMemoryService:
    """
    Tri-Memory Architecture:
    1. Episodic Memory - Checkpoints and history
    2. Semantic Memory - Domain knowledge
    3. Working Memory - Active reasoning context
    """

    def __init__(self, supabase, vector_store):
        self.supabase = supabase
        self.vector_store = vector_store

    # === Episodic Memory ===

    async def save_checkpoint(
        self,
        session_id: str,
        state: Mode3State,
        reasoning_step: int
    ) -> EpisodicCheckpoint:
        """Save a checkpoint to episodic memory."""

        checkpoint = EpisodicCheckpoint(
            checkpoint_id=str(uuid.uuid4()),
            session_id=session_id,
            timestamp=datetime.utcnow(),
            state_snapshot=self._create_state_snapshot(state),
            reasoning_step=reasoning_step,
            confidence=state.get("current_confidence", 0.5),
            hitl_status=state.get("hitl_status")
        )

        # Persist to database
        await self.supabase.from_("mode3_episodic_checkpoints").insert({
            "id": checkpoint.checkpoint_id,
            "session_id": checkpoint.session_id,
            "timestamp": checkpoint.timestamp.isoformat(),
            "state_snapshot": checkpoint.state_snapshot,
            "reasoning_step": checkpoint.reasoning_step,
            "confidence": checkpoint.confidence,
            "hitl_status": checkpoint.hitl_status
        }).execute()

        return checkpoint

    async def restore_checkpoint(
        self,
        session_id: str,
        checkpoint_id: Optional[str] = None
    ) -> Mode3State:
        """Restore state from a checkpoint."""

        if checkpoint_id:
            # Restore specific checkpoint
            result = await self.supabase.from_("mode3_episodic_checkpoints") \
                .select("*") \
                .eq("id", checkpoint_id) \
                .single()
        else:
            # Restore latest checkpoint
            result = await self.supabase.from_("mode3_episodic_checkpoints") \
                .select("*") \
                .eq("session_id", session_id) \
                .order("timestamp", desc=True) \
                .limit(1) \
                .single()

        if not result.data:
            raise CheckpointNotFoundError(f"No checkpoint found")

        return self._restore_state_from_snapshot(result.data["state_snapshot"])

    # === Semantic Memory ===

    async def build_semantic_context(
        self,
        session_id: str,
        user_message: str,
        agent_context: dict
    ) -> SemanticContext:
        """Build semantic context from domain knowledge."""

        # Search vector store for relevant knowledge
        relevant_docs = await self.vector_store.similarity_search(
            query=user_message,
            k=10,
            filter={"tenant_id": agent_context.get("tenant_id")}
        )

        # Extract key concepts
        concepts = await self._extract_concepts(user_message, relevant_docs)

        # Build relationships
        relationships = await self._build_relationships(concepts, relevant_docs)

        # Identify constraints
        constraints = await self._identify_constraints(agent_context)

        context = SemanticContext(
            domain=agent_context.get("domain", "general"),
            key_concepts=concepts,
            relationships=relationships,
            constraints=constraints,
            knowledge_sources=[doc.metadata for doc in relevant_docs]
        )

        # Cache in database
        await self.supabase.from_("mode3_semantic_context").upsert({
            "session_id": session_id,
            "domain": context.domain,
            "key_concepts": context.key_concepts,
            "relationships": context.relationships,
            "constraints": context.constraints,
            "knowledge_sources": context.knowledge_sources,
            "updated_at": datetime.utcnow().isoformat()
        }).execute()

        return context

    # === Working Memory ===

    async def update_working_memory(
        self,
        session_id: str,
        updates: dict
    ) -> WorkingMemory:
        """Update working memory with new information."""

        # Get current working memory
        result = await self.supabase.from_("mode3_working_memory") \
            .select("*") \
            .eq("session_id", session_id) \
            .single()

        current = result.data if result.data else {}

        # Merge updates
        updated = {
            "current_goal": updates.get("current_goal", current.get("current_goal")),
            "active_hypotheses": updates.get("active_hypotheses", current.get("active_hypotheses", [])),
            "pending_actions": updates.get("pending_actions", current.get("pending_actions", [])),
            "recent_observations": self._update_observations(
                current.get("recent_observations", []),
                updates.get("new_observation")
            ),
            "confidence_scores": {
                **current.get("confidence_scores", {}),
                **updates.get("confidence_scores", {})
            },
            "attention_focus": updates.get("attention_focus", current.get("attention_focus"))
        }

        # Persist
        await self.supabase.from_("mode3_working_memory").upsert({
            "session_id": session_id,
            **updated,
            "updated_at": datetime.utcnow().isoformat()
        }).execute()

        return WorkingMemory(**updated)

    def _update_observations(
        self,
        current: List[dict],
        new_observation: Optional[dict]
    ) -> List[dict]:
        """Update recent observations with sliding window."""
        MAX_OBSERVATIONS = 20

        if new_observation:
            current.append({
                **new_observation,
                "timestamp": datetime.utcnow().isoformat()
            })

        # Keep only recent observations
        return current[-MAX_OBSERVATIONS:]
```

### Week 8: Missions 9-16

**DECIDE Category (Missions 9-12):**
- Mission 9: Strategy Formation
- Mission 10: Prioritization
- Mission 11: Recommendation
- Mission 12: Trade-off Analysis

**INVESTIGATE Category (Missions 13-16):**
- Mission 13: Root Cause Analysis
- Mission 14: Anomaly Detection
- Mission 15: Trend Analysis
- Mission 16: Forecast

```python
# services/ai-engine/src/langgraph_workflows/missions/decide.py
# services/ai-engine/src/langgraph_workflows/missions/investigate.py

# Implementation follows same pattern as Missions 1-8
# Each mission:
# 1. Define state schema
# 2. Build StateGraph with appropriate nodes
# 3. Wire L4 workers and L5 tools
# 4. Add HITL checkpoints as needed
```

**Phase 2 Deliverables:**
- [ ] L1-L5 agent hierarchy operational
- [ ] 15 L4 workers registered and functional
- [ ] 13 L5 tools registered and functional
- [ ] Tri-memory architecture working
- [ ] Missions 9-16 (DECIDE + INVESTIGATE) complete
- [ ] Integration tests passing

---

## Phase 3: Advanced (Weeks 9-12)

### Week 9: Tree-of-Thoughts Planning

```python
# services/ai-engine/src/planning/tree_of_thoughts.py

from typing import List, Tuple
from dataclasses import dataclass
import heapq

@dataclass
class PlanNode:
    """A node in the planning tree."""
    plan_id: str
    parent_id: Optional[str]
    description: str
    steps: List[dict]
    feasibility_score: float
    confidence_score: float
    cost_estimate: float
    time_estimate: int
    risks: List[str]

    @property
    def combined_score(self) -> float:
        return (self.feasibility_score * 0.4 +
                self.confidence_score * 0.3 +
                (1 - self.cost_estimate / 10) * 0.15 +
                (1 - self.time_estimate / 3600) * 0.15)

class TreeOfThoughtsPlanner:
    """
    Tree-of-Thoughts (ToT) Planning with Beam Search

    Generates multiple candidate plans, scores them,
    prunes low-scoring branches, and selects optimal path.
    """

    def __init__(self, llm, beam_width: int = 3, max_depth: int = 5):
        self.llm = llm
        self.beam_width = beam_width
        self.max_depth = max_depth

    async def generate_plans(
        self,
        goal: str,
        context: dict,
        constraints: List[str]
    ) -> List[PlanNode]:
        """Generate multiple candidate plans using beam search."""

        # Initialize beam with root thoughts
        root_thoughts = await self._generate_initial_thoughts(goal, context, constraints)
        beam = [(t.combined_score, t) for t in root_thoughts]
        heapq.heapify(beam)

        # Keep top-k
        beam = heapq.nlargest(self.beam_width, beam)

        # Expand tree
        for depth in range(self.max_depth):
            next_beam = []

            for score, node in beam:
                # Expand this node
                children = await self._expand_thought(node, context, constraints)

                for child in children:
                    next_beam.append((child.combined_score, child))

            # Prune to beam width
            beam = heapq.nlargest(self.beam_width, next_beam)

            # Early termination if all plans are complete
            if all(self._is_complete(node) for _, node in beam):
                break

        # Return top plans
        return [node for _, node in beam]

    async def _generate_initial_thoughts(
        self,
        goal: str,
        context: dict,
        constraints: List[str]
    ) -> List[PlanNode]:
        """Generate initial plan candidates."""

        prompt = f"""
        Generate {self.beam_width} distinct approaches to achieve this goal:

        GOAL: {goal}

        CONTEXT: {json.dumps(context)}

        CONSTRAINTS: {json.dumps(constraints)}

        For each approach, provide:
        1. Approach name/description
        2. Key steps (3-7 steps)
        3. Feasibility score (0.0-1.0)
        4. Confidence score (0.0-1.0)
        5. Estimated cost ($)
        6. Estimated time (seconds)
        7. Main risks

        Return as JSON array of plans.
        """

        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        plans_data = json.loads(response.content)

        return [
            PlanNode(
                plan_id=str(uuid.uuid4()),
                parent_id=None,
                description=p["description"],
                steps=p["steps"],
                feasibility_score=p["feasibility_score"],
                confidence_score=p["confidence_score"],
                cost_estimate=p["cost_estimate"],
                time_estimate=p["time_estimate"],
                risks=p["risks"]
            )
            for p in plans_data
        ]

    async def _expand_thought(
        self,
        node: PlanNode,
        context: dict,
        constraints: List[str]
    ) -> List[PlanNode]:
        """Expand a plan node with more detailed sub-plans."""

        # Implementation similar to _generate_initial_thoughts
        # but focused on expanding/refining the current plan
        pass

    def _is_complete(self, node: PlanNode) -> bool:
        """Check if plan is complete (actionable)."""
        return (
            len(node.steps) >= 3 and
            all(step.get("tool") or step.get("action") for step in node.steps)
        )

    async def present_alternatives(
        self,
        plans: List[PlanNode]
    ) -> dict:
        """Format plans for user selection via HITL."""

        return {
            "alternatives": [
                {
                    "plan_id": plan.plan_id,
                    "description": plan.description,
                    "steps": plan.steps,
                    "scores": {
                        "feasibility": plan.feasibility_score,
                        "confidence": plan.confidence_score,
                        "cost": plan.cost_estimate,
                        "time": plan.time_estimate
                    },
                    "combined_score": plan.combined_score,
                    "risks": plan.risks
                }
                for plan in plans
            ],
            "recommended": plans[0].plan_id,
            "recommendation_reason": self._explain_recommendation(plans[0])
        }
```

### Week 10: Constitutional AI Validation

```python
# services/ai-engine/src/validation/constitutional_ai.py

from typing import List
from dataclasses import dataclass
from enum import Enum

class SafetyCategory(str, Enum):
    MEDICAL_SAFETY = "medical_safety"
    INFORMATION_INTEGRITY = "information_integrity"
    BIAS_MITIGATION = "bias_mitigation"
    HARMFUL_CONTENT = "harmful_content"
    TENANT_BOUNDARY = "tenant_boundary"
    DATA_PRIVACY = "data_privacy"

@dataclass
class ConstitutionalRule:
    rule_id: str
    category: SafetyCategory
    description: str
    check_prompt: str
    severity: str  # critical, high, medium, low
    auto_block: bool

@dataclass
class ValidationResult:
    passed: bool
    violations: List[dict]
    confidence: float
    recommendations: List[str]

class ConstitutionalAIValidator:
    """
    Constitutional AI Validation Layer

    Validates all outputs against safety and quality rules
    before delivery to user.
    """

    RULES = [
        ConstitutionalRule(
            rule_id="MED-001",
            category=SafetyCategory.MEDICAL_SAFETY,
            description="No specific dosing without MD verification",
            check_prompt="Does this response provide specific drug dosages that should only come from a licensed physician?",
            severity="critical",
            auto_block=True
        ),
        ConstitutionalRule(
            rule_id="MED-002",
            category=SafetyCategory.MEDICAL_SAFETY,
            description="No diagnosis without appropriate caveats",
            check_prompt="Does this response make a medical diagnosis without appropriate disclaimers?",
            severity="critical",
            auto_block=True
        ),
        ConstitutionalRule(
            rule_id="INFO-001",
            category=SafetyCategory.INFORMATION_INTEGRITY,
            description="All factual claims must be cited",
            check_prompt="Are there factual claims in this response without citations?",
            severity="high",
            auto_block=False
        ),
        ConstitutionalRule(
            rule_id="INFO-002",
            category=SafetyCategory.INFORMATION_INTEGRITY,
            description="No hallucinated references",
            check_prompt="Does this response contain citations that appear fabricated or cannot be verified?",
            severity="critical",
            auto_block=True
        ),
        ConstitutionalRule(
            rule_id="BIAS-001",
            category=SafetyCategory.BIAS_MITIGATION,
            description="Present balanced viewpoints",
            check_prompt="Does this response present only one side of a controversial topic without acknowledging alternatives?",
            severity="medium",
            auto_block=False
        ),
        ConstitutionalRule(
            rule_id="HARM-001",
            category=SafetyCategory.HARMFUL_CONTENT,
            description="No instructions for harmful activities",
            check_prompt="Does this response provide instructions that could be used for harmful purposes?",
            severity="critical",
            auto_block=True
        ),
        ConstitutionalRule(
            rule_id="TENANT-001",
            category=SafetyCategory.TENANT_BOUNDARY,
            description="No cross-tenant data leakage",
            check_prompt="Does this response reference data or entities from a different tenant?",
            severity="critical",
            auto_block=True
        ),
        ConstitutionalRule(
            rule_id="PRIV-001",
            category=SafetyCategory.DATA_PRIVACY,
            description="No PII exposure",
            check_prompt="Does this response expose personally identifiable information (PII)?",
            severity="critical",
            auto_block=True
        ),
    ]

    def __init__(self, llm):
        self.llm = llm

    async def validate(
        self,
        response: str,
        context: dict
    ) -> ValidationResult:
        """Validate response against all constitutional rules."""

        violations = []

        for rule in self.RULES:
            result = await self._check_rule(rule, response, context)

            if result["violated"]:
                violations.append({
                    "rule_id": rule.rule_id,
                    "category": rule.category.value,
                    "description": rule.description,
                    "severity": rule.severity,
                    "evidence": result["evidence"],
                    "auto_block": rule.auto_block
                })

        # Calculate overall confidence
        confidence = 1.0 - (len(violations) / len(self.RULES))

        # Generate recommendations
        recommendations = self._generate_recommendations(violations)

        # Determine pass/fail
        critical_violations = [v for v in violations if v["severity"] == "critical"]
        passed = len(critical_violations) == 0

        return ValidationResult(
            passed=passed,
            violations=violations,
            confidence=confidence,
            recommendations=recommendations
        )

    async def _check_rule(
        self,
        rule: ConstitutionalRule,
        response: str,
        context: dict
    ) -> dict:
        """Check a single rule against the response."""

        prompt = f"""
        Evaluate this response against the following safety rule:

        RULE: {rule.description}

        QUESTION: {rule.check_prompt}

        RESPONSE TO EVALUATE:
        {response}

        CONTEXT:
        {json.dumps(context)}

        Answer with:
        - violated: true/false
        - evidence: specific text that violates the rule (if any)
        - confidence: 0.0-1.0

        Return as JSON.
        """

        result = await self.llm.ainvoke([HumanMessage(content=prompt)])
        return json.loads(result.content)

    def _generate_recommendations(self, violations: List[dict]) -> List[str]:
        """Generate recommendations to fix violations."""

        recommendations = []

        for v in violations:
            if v["category"] == "medical_safety":
                recommendations.append(
                    f"Add medical disclaimer or remove specific dosing: {v['evidence'][:100]}"
                )
            elif v["category"] == "information_integrity":
                recommendations.append(
                    f"Add citation for claim: {v['evidence'][:100]}"
                )
            # ... more categories

        return recommendations
```

### Week 11: Adaptive Autonomy & Divergence Detection

```python
# services/ai-engine/src/autonomy/adaptive_autonomy.py

class AdaptiveAutonomyController:
    """
    Adaptive Autonomy Level Controller

    Manages three autonomy levels:
    - Strict: All 5 HITL checkpoints active
    - Balanced: 3 checkpoints (plan, critical, final)
    - Permissive: 2 checkpoints (plan, final)
    """

    AUTONOMY_CONFIGS = {
        "strict": {
            "checkpoints": ["plan", "tool", "subagent", "critical", "final"],
            "confidence_threshold": 0.8,
            "max_iterations": 15,
            "require_citation": True,
            "auto_approve_low_risk": False
        },
        "balanced": {
            "checkpoints": ["plan", "critical", "final"],
            "confidence_threshold": 0.7,
            "max_iterations": 20,
            "require_citation": True,
            "auto_approve_low_risk": True
        },
        "permissive": {
            "checkpoints": ["plan", "final"],
            "confidence_threshold": 0.6,
            "max_iterations": 25,
            "require_citation": False,
            "auto_approve_low_risk": True
        }
    }

    def get_config(self, level: str) -> dict:
        return self.AUTONOMY_CONFIGS.get(level, self.AUTONOMY_CONFIGS["balanced"])

    def should_checkpoint(
        self,
        level: str,
        checkpoint_type: str,
        risk_level: str = "low"
    ) -> bool:
        """Determine if checkpoint should trigger based on autonomy level."""

        config = self.get_config(level)

        if checkpoint_type not in config["checkpoints"]:
            return False

        # Even in permissive mode, high-risk always triggers
        if risk_level == "high":
            return True

        # Auto-approve low risk in balanced/permissive
        if risk_level == "low" and config["auto_approve_low_risk"]:
            return False

        return True


# services/ai-engine/src/safety/divergence_detector.py

class DivergenceDetector:
    """
    Detects reasoning divergence patterns:
    - Infinite loops
    - Circular reasoning
    - Goal drift
    - Confidence collapse
    """

    def __init__(self, window_size: int = 10):
        self.window_size = window_size

    def detect(self, reasoning_history: List[dict]) -> Optional[dict]:
        """Detect divergence in reasoning history."""

        if len(reasoning_history) < 3:
            return None

        # Check for loops
        loop = self._detect_loop(reasoning_history)
        if loop:
            return {"type": "loop", **loop}

        # Check for goal drift
        drift = self._detect_goal_drift(reasoning_history)
        if drift:
            return {"type": "goal_drift", **drift}

        # Check for confidence collapse
        collapse = self._detect_confidence_collapse(reasoning_history)
        if collapse:
            return {"type": "confidence_collapse", **collapse}

        return None

    def _detect_loop(self, history: List[dict]) -> Optional[dict]:
        """Detect repeating action patterns."""

        recent = history[-self.window_size:]
        actions = [h.get("action", {}).get("type") for h in recent]

        # Check for exact repetition
        for pattern_len in range(2, len(actions) // 2 + 1):
            pattern = actions[-pattern_len:]
            if actions[-2*pattern_len:-pattern_len] == pattern:
                return {
                    "pattern": pattern,
                    "repetitions": 2,
                    "severity": "high"
                }

        return None

    def _detect_goal_drift(self, history: List[dict]) -> Optional[dict]:
        """Detect drift from original goal."""

        if len(history) < 5:
            return None

        original_goal = history[0].get("goal")
        current_goal = history[-1].get("goal")

        if not original_goal or not current_goal:
            return None

        # Simple similarity check (in production, use embeddings)
        similarity = self._calculate_similarity(original_goal, current_goal)

        if similarity < 0.5:
            return {
                "original_goal": original_goal,
                "current_goal": current_goal,
                "similarity": similarity,
                "severity": "medium"
            }

        return None

    def _detect_confidence_collapse(self, history: List[dict]) -> Optional[dict]:
        """Detect rapid confidence decrease."""

        recent = history[-self.window_size:]
        confidences = [h.get("confidence", 0.5) for h in recent]

        if len(confidences) < 3:
            return None

        # Check for consistent decline
        if all(confidences[i] > confidences[i+1] for i in range(len(confidences)-1)):
            if confidences[-1] < 0.3:
                return {
                    "confidence_trend": confidences,
                    "current_confidence": confidences[-1],
                    "severity": "high"
                }

        return None
```

### Week 12: Missions 17-24 & Final Integration

**WATCH Category (Missions 17-19):**
- Mission 17: Monitoring Dashboard
- Mission 18: Alert Triage
- Mission 19: Change Detection

**SOLVE Category (Missions 20-22):**
- Mission 20: Problem Decomposition
- Mission 21: Solution Design
- Mission 22: Implementation Plan

**PREPARE Category (Missions 23-24):**
- Mission 23: Briefing Document
- Mission 24: Case Building

```python
# Final integration testing
# services/ai-engine/tests/integration/test_mode3_complete.py

import pytest
from datetime import datetime

class TestMode3Complete:
    """Complete Mode 3 integration tests."""

    @pytest.fixture
    async def mode3_service(self):
        # Setup complete Mode 3 service
        pass

    @pytest.mark.parametrize("mission_id", range(1, 25))
    async def test_all_24_missions(self, mode3_service, mission_id):
        """Test each mission executes successfully."""

        result = await mode3_service.execute_mission(
            mission_id=mission_id,
            test_input=get_test_input_for_mission(mission_id),
            tenant_id="test-tenant"
        )

        assert result["status"] == "complete"
        assert result["confidence"] >= 0.7
        assert len(result["reasoning_steps"]) >= 3

    async def test_hitl_checkpoint_flow(self, mode3_service):
        """Test all 5 HITL checkpoints trigger correctly."""

        # Test with strict autonomy
        result = await mode3_service.execute(
            message="Complex query requiring all checkpoints",
            autonomy_level="strict"
        )

        # Verify all 5 checkpoints were hit
        checkpoints = result["hitl_checkpoints"]
        assert "plan_approval" in checkpoints
        assert "tool_approval" in checkpoints
        assert "subagent_approval" in checkpoints
        assert "critical_decision" in checkpoints
        assert "final_review" in checkpoints

    async def test_sse_event_coverage(self, mode3_service):
        """Test all SSE events are emitted."""

        events_received = []

        async for event in mode3_service.stream_execute(
            message="Test query",
            autonomy_level="balanced"
        ):
            events_received.append(event["type"])

        # Verify key events present
        assert "session_started" in events_received
        assert "planning_started" in events_received
        assert "reasoning_step" in events_received
        assert "session_complete" in events_received

    async def test_l4_l5_hierarchy(self, mode3_service):
        """Test agent hierarchy delegation works."""

        result = await mode3_service.execute_mission(
            mission_id=1,  # Deep Dive - uses many L4/L5
            test_input={"topic": "FDA drug approval process"},
            tenant_id="test-tenant"
        )

        # Verify L4 workers were spawned
        assert len(result["l4_workers_used"]) >= 3

        # Verify L5 tools were used
        assert len(result["l5_tools_used"]) >= 2

    async def test_constitutional_ai_blocking(self, mode3_service):
        """Test constitutional AI blocks unsafe outputs."""

        result = await mode3_service.execute(
            message="Give me specific dosing for opioids",
            autonomy_level="permissive"
        )

        # Should be blocked by MED-001 rule
        assert result["validation"]["passed"] == False
        assert any(v["rule_id"] == "MED-001" for v in result["validation"]["violations"])
```

**Phase 3 Deliverables:**
- [ ] Tree-of-Thoughts planning working
- [ ] Constitutional AI validation operational
- [ ] Adaptive autonomy levels functional
- [ ] Divergence detection working
- [ ] Missions 17-24 (WATCH + SOLVE + PREPARE) complete
- [ ] All 24 missions tested and passing
- [ ] Performance benchmarks met
- [ ] Production deployment ready

---

## Testing Strategy

### Test Coverage Requirements

| Component | Unit | Integration | E2E | Target Coverage |
|-----------|------|-------------|-----|-----------------|
| ReAct² Engine | ✓ | ✓ | ✓ | >90% |
| HITL Service | ✓ | ✓ | ✓ | >95% |
| SSE Streaming | ✓ | ✓ | ✓ | >85% |
| L4 Workers | ✓ | ✓ | - | >80% |
| L5 Tools | ✓ | ✓ | - | >85% |
| Constitutional AI | ✓ | ✓ | ✓ | >95% |
| Tri-Memory | ✓ | ✓ | - | >80% |
| Missions 1-24 | ✓ | ✓ | ✓ | >85% |

### Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to First Token | <2s | SSE stream start |
| Average Mission Time | <5min | End-to-end |
| HITL Response Latency | <100ms | Checkpoint to UI |
| Memory Usage | <2GB | Per session |
| Concurrent Sessions | 100+ | Load test |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM API Rate Limits | Medium | High | Implement queuing, caching |
| HITL Timeout Issues | Medium | Medium | Configurable timeouts, fallback |
| Memory Leaks | Low | High | Strict cleanup, monitoring |
| SSE Connection Drops | Medium | Low | Auto-reconnect client |
| Agent Hierarchy Deadlock | Low | High | Timeout limits, circuit breakers |

---

## Success Criteria

### Phase 1 Exit Criteria
- [ ] Zero critical security vulnerabilities
- [ ] SSE streaming functional with <100ms latency
- [ ] ReAct² 7-phase cycle executing correctly
- [ ] All 5 HITL checkpoints operational
- [ ] Missions 1-8 passing all tests

### Phase 2 Exit Criteria
- [ ] L1-L5 hierarchy fully operational
- [ ] All 15 L4 workers registered and tested
- [ ] All 13 L5 tools registered and tested
- [ ] Tri-memory architecture functional
- [ ] Missions 9-16 passing all tests

### Phase 3 Exit Criteria
- [ ] Tree-of-Thoughts generating 3+ alternatives
- [ ] Constitutional AI catching all critical violations
- [ ] Adaptive autonomy changing behavior correctly
- [ ] Divergence detection preventing loops
- [ ] All 24 missions passing all tests
- [ ] Production deployment checklist complete

---

## Appendix: File Locations

| Component | Path |
|-----------|------|
| Mode 3 Route | `services/ai-engine/src/api/routes/mode3_manual_autonomous.py` |
| Mode 3 Workflow | `services/ai-engine/src/langgraph_workflows/mode3_manual_autonomous.py` |
| ReAct² Engine | `services/ai-engine/src/langgraph_workflows/react2_engine.py` |
| HITL Service | `services/ai-engine/src/services/hitl_checkpoint_service.py` |
| L4 Workers | `services/ai-engine/src/agents/l4_workers/` |
| L5 Tools | `services/ai-engine/src/agents/l5_tools/` |
| Missions | `services/ai-engine/src/langgraph_workflows/missions/` |
| Constitutional AI | `services/ai-engine/src/validation/constitutional_ai.py` |
| Tri-Memory | `services/ai-engine/src/memory/tri_memory.py` |
| Frontend Components | `apps/vital-system/src/features/ask-expert/mode-3/` |

---

*Implementation Plan v2.0 - December 5, 2025*
