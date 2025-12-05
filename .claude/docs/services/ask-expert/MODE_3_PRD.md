# Mode 3: Manual Autonomous - Product Requirements Document (PRD)

## Document Information
- **Version:** 1.0
- **Date:** December 4, 2025
- **Status:** Active Development
- **Owner:** VITAL Platform Team

---

## 1. Executive Summary

Mode 3 (Manual Autonomous) is VITAL's agentic AI mode where users manually select an expert agent from the 1000+ Agent Store, then the system executes goals autonomously with Human-In-The-Loop (HITL) approval checkpoints. This mode combines the precision of manual agent selection with the power of autonomous, goal-driven execution similar to AutoGPT and Deep Research systems.

### 1.1 Golden Matrix Position

```
┌─────────────────────┬───────────────────┬───────────────────────────┐
│                     │ MANUAL SELECTION  │ AUTOMATIC SELECTION       │
├─────────────────────┼───────────────────┼───────────────────────────┤
│ INTERACTIVE         │ Mode 1            │ Mode 2                    │
│ (Chat/Multi-Turn)   │ User picks agent  │ System picks agent        │
├─────────────────────┼───────────────────┼───────────────────────────┤
│ AUTONOMOUS          │ ★ MODE 3          │ Mode 4                    │
│ (ReAct/CoT/Goals)   │ User picks agent  │ System picks agent        │
└─────────────────────┴───────────────────┴───────────────────────────┘
```

---

## 2. Business Objectives

### 2.1 Primary Goals
1. **Enable Complex Multi-Step Workflows** - Allow users to delegate complex pharmaceutical tasks to AI with human oversight
2. **Ensure Safety Through HITL** - 5 approval checkpoints prevent autonomous agents from making critical decisions without human review
3. **Leverage Agent Expertise** - Users select domain experts (regulatory, clinical, market access) from 1000+ specialized agents
4. **Provide Deep Research Capabilities** - Tree-of-Thoughts planning and ReAct execution for thorough analysis

### 2.2 Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Task Completion Rate | >90% | Completed tasks / Total requests |
| HITL Approval Rate | >85% | User approvals / HITL prompts |
| User Satisfaction | >4.2/5 | Post-task survey |
| Response Time | 60-120 seconds | P95 latency |
| Accuracy (Tier 3) | >95% | Expert validation |

---

## 3. User Stories

### 3.1 Primary Use Cases

**UC-3.1: Regulatory Submission Strategy**
> "As a Regulatory Affairs Manager, I want to design a complete 510(k) submission strategy, so that I have a comprehensive plan approved at each step."

**UC-3.2: Clinical Trial Data Analysis**
> "As a Clinical Operations Director, I want to analyze clinical trial data and receive actionable recommendations, so that I can make informed decisions with tool execution oversight."

**UC-3.3: FMEA Development**
> "As a Quality Assurance Engineer, I want to create a comprehensive FMEA for a medical device, so that I have structured risk analysis with sub-agent coordination approval."

**UC-3.4: Market Access Dossier**
> "As a Market Access Specialist, I want an AI agent to compile payer evidence dossiers, so that I can review and approve each evidence source before inclusion."

---

## 4. Functional Requirements

### 4.1 Agent Selection (Manual)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1.1 | User must select an agent from the Agent Store before task execution | P0 |
| FR-3.1.2 | Agent Store displays 1000+ agents with filtering by department, function, tier | P0 |
| FR-3.1.3 | Selected agent tier defaults to Tier 2 minimum for autonomous work | P0 |
| FR-3.1.4 | System validates agent has required capabilities for the requested task | P1 |

### 4.2 HITL Approval System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.2.1 | Plan Approval - User must approve multi-step execution plan before execution | P0 |
| FR-3.2.2 | Tool Approval - User must approve before executing external tools (databases, APIs) | P0 |
| FR-3.2.3 | Sub-Agent Approval - User must approve spawning of L3/L4/L5 agents | P0 |
| FR-3.2.4 | Critical Decision Approval - User must approve high-stakes business decisions | P0 |
| FR-3.2.5 | Final Review - User must approve response before delivery | P1 |
| FR-3.2.6 | Safety levels: strict, balanced, permissive (configurable per user) | P1 |

### 4.3 Agentic Patterns

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.3.1 | Tree-of-Thoughts (ToT) planning for Tier 3 queries | P0 |
| FR-3.3.2 | ReAct execution with reasoning + action + observation loops | P0 |
| FR-3.3.3 | Constitutional AI validation at each step | P0 |
| FR-3.3.4 | Chain-of-Thought explicit step-by-step reasoning | P1 |
| FR-3.3.5 | Goal-driven execution toward defined objectives | P0 |

### 4.4 Deep Agent Hierarchy (5-Level)

| Level | Role | Capabilities |
|-------|------|--------------|
| L1 | Master Agent | Task coordination, HITL triggers, L1→Human escalation |
| L2 | Expert Agent (User-Selected) | Domain expertise, L2→L3 delegation, L3→L2 escalation |
| L3 | Specialist Agent (Spawned) | Sub-domain tasks, L3→L4 delegation |
| L4 | Worker Agent (Parallel) | Parallel task execution, tool requests |
| L5 | Tool Agent | RAG, Web Search, Code Execution, Database queries |

### 4.5 Tool & Code Execution

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.5.1 | Python code execution with HITL approval | P0 |
| FR-3.5.2 | R code execution for statistical analysis | P1 |
| FR-3.5.3 | SAS code execution for regulatory submissions | P2 |
| FR-3.5.4 | RAG retrieval from Unified RAG Service (Vector DB) | P0 |
| FR-3.5.5 | Web search with source verification | P1 |
| FR-3.5.6 | Database queries (read-only by default) | P0 |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Target |
|-------------|--------|
| Response Time (P50) | <60 seconds |
| Response Time (P95) | <120 seconds |
| HITL Prompt Latency | <2 seconds |
| Concurrent Users | 100+ simultaneous sessions |
| Agent Spawn Time | <5 seconds per sub-agent |

### 5.2 Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.9% |
| Checkpoint Recovery | Resume from any HITL checkpoint |
| Session Persistence | 24+ hours |
| Error Recovery | Graceful fallback to Mode 1 |

### 5.3 Security & Compliance

| Requirement | Target |
|-------------|--------|
| Tenant Isolation | 100% (multi-tenant architecture) |
| HIPAA Compliance | Required for PHI handling |
| Audit Trail | Complete execution logs |
| Data Classification | Support for confidential/restricted |

---

## 6. Frontend Integration

### 6.1 UI Parameters
```typescript
interface Mode3Config {
  isAutomatic: false;       // Manual agent selection
  isAutonomous: true;       // Goal-driven execution
  hitlEnabled: true;        // HITL checkpoints active
  selectedAgents: string[]; // User pre-selects agent(s)
  hitlSafetyLevel: 'strict' | 'balanced' | 'permissive';
  maxExecutionTime: number; // Timeout in seconds
}
```

### 6.2 HITL UI Components
1. **Plan Approval Modal** - Shows multi-step plan, allows edit/approve/reject
2. **Tool Execution Card** - Shows tool request, parameters, risks
3. **Sub-Agent Approval** - Shows agent to spawn, capabilities, justification
4. **Progress Tracker** - Real-time execution status with pause/resume
5. **Final Review Panel** - Complete response with sources and evidence

---

## 7. API Specification

### 7.1 Endpoint
```
POST /api/mode3/autonomous-manual
```

### 7.2 Request Schema
```json
{
  "agent_id": "uuid",
  "message": "string",
  "session_id": "uuid",
  "tenant_id": "uuid",
  "enable_rag": true,
  "hitl_enabled": true,
  "hitl_safety_level": "balanced",
  "max_execution_time": 120
}
```

### 7.3 Response (Streaming SSE)
```json
{
  "type": "hitl_request" | "token" | "tool_call" | "done",
  "checkpoint_type": "plan" | "tool" | "subagent" | "decision" | "final",
  "approval_request": {...},
  "content": "...",
  "citations": [...],
  "execution_trace": [...]
}
```

---

## 8. Golden Rules Compliance

| Rule | Implementation |
|------|----------------|
| Golden Rule #1 | LangGraph StateGraph for all workflow execution |
| Golden Rule #2 | Caching at all nodes (agent config, conversation) |
| Golden Rule #3 | Tenant isolation enforced at every layer |
| Golden Rule #4 | RAG/Tools enabled by default with HITL approval |
| Golden Rule #5 | Evidence-based responses with citation requirements |

---

## 9. Tier System

| Tier | Model | Use Case | Cost |
|------|-------|----------|------|
| Tier 2 (Default) | GPT-4-Turbo | Standard autonomous tasks | $0.12/query |
| Tier 3 (Complex) | GPT-4 / Claude-3-Opus | High-stakes, regulatory, complex planning | $0.35-0.40/query |

**Tier Assessment Logic:**
- Base: Tier 2 for all Mode 3 requests (higher accuracy requirement)
- Upgrade to Tier 3 if: 3+ complexity indicators, >50 words, multi-step plan required

---

## 10. Known Limitations

1. **Response Time** - Autonomous execution takes 60-120 seconds (not suitable for quick answers)
2. **HITL Dependency** - Requires active user for checkpoint approvals
3. **Code Execution** - Limited to sandboxed environments
4. **Token Limits** - Long reasoning chains may hit context limits

---

## 11. Dependencies

| Dependency | Status |
|------------|--------|
| LangGraph StateGraph | ✅ Implemented |
| Unified RAG Service | ✅ Implemented |
| HITL Service | ✅ Implemented (requires fix) |
| Tree-of-Thoughts Agent | ✅ Implemented |
| ReAct Agent | ✅ Implemented |
| Constitutional AI Agent | ✅ Implemented |
| DeepAgents Tools | ✅ Implemented |
| Agent Hierarchy Service | ✅ Implemented |

---

## 12. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Mode3 Workflow | ✅ Complete | 1467 lines, full implementation |
| API Endpoint | ✅ Complete | `/api/mode3/autonomous-manual` |
| HITL Integration | ⚠️ Blocked | Missing `get_optional_user` (FIXED) |
| Pattern Agents | ✅ Complete | ToT, ReAct, Constitutional |
| Frontend Integration | 🔲 Pending | Awaiting HITL UI components |

---

## 13. Appendix

### A. Example User Flow

1. User opens Agent Store, filters by "Regulatory Affairs"
2. User selects "FDA 510(k) Submission Expert" (L2 agent)
3. User enters goal: "Design complete 510(k) submission strategy for Class II device"
4. System generates multi-step plan → User approves
5. Agent executes step 1 → Requests RAG tool → User approves
6. Agent spawns "Predicate Device Analyst" (L3) → User approves
7. Sub-agent completes analysis → Results return to L2
8. Agent completes remaining steps with HITL at critical decisions
9. Final response presented → User approves
10. Task marked complete, full audit trail logged

### B. Related Documents

- [MODE_3_ARD.md](./MODE_3_ARD.md) - Architecture Requirements Document
- [HITL_SERVICE_SPEC.md](./HITL_SERVICE_SPEC.md) - HITL Service Specification
- [AGENT_HIERARCHY_GUIDE.md](./AGENT_HIERARCHY_GUIDE.md) - 5-Level Agent System
