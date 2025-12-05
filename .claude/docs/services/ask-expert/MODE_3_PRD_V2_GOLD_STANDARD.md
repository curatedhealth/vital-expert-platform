# Mode 3: Manual Autonomous - Product Requirements Document (PRD)

**Version:** 2.0 Gold Standard
**Date:** December 5, 2025
**Status:** APPROVED FOR IMPLEMENTATION
**Owner:** VITAL Platform Team

---

## 1. Executive Summary

Mode 3 (Manual Autonomous) delivers an **AutoGPT-like deep research experience** where users select an expert agent (L2/L3) who then autonomously orchestrates a multi-step investigation with full visibility into reasoning, progress, and Human-in-the-Loop (HITL) checkpoints.

### Vision Statement

*"Enable pharmaceutical professionals to initiate complex research queries, watch an AI expert systematically investigate using specialized worker agents and tools, while maintaining strategic control through approval checkpoints."*

### Key Differentiators

| Feature | Mode 1 (Interactive) | Mode 3 (Manual Autonomous) |
|---------|---------------------|---------------------------|
| Agent Selection | User selects | User selects L2/L3 expert |
| Execution | Single response | Multi-step autonomous |
| Visibility | Final answer only | Full reasoning trace |
| Control | None during execution | HITL checkpoints |
| Depth | Surface level | Deep research with citations |
| Agent Hierarchy | Single agent | L2→L3→L4→L5 orchestration |

---

## 2. L1-L5 Agent Hierarchy (CORRECTED DEFINITION)

### 2.1 Hierarchy Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ L1: MASTER AGENT (Head of Function)                                      │
│ Role: Process Orchestrator | Model: Claude-3-Opus | Temp: 0.2           │
│ Purpose: Routes queries to appropriate L2 experts, manages escalations  │
│ Example: "Medical Affairs Master", "Regulatory Master"                  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
┌────────▼────────┐                       ┌─────────▼────────┐
│ L2: EXPERT AGENT│                       │ L2: EXPERT AGENT │
│ (Head of Dept)  │                       │ (Head of Dept)   │
│ Model: GPT-4    │                       │ Model: GPT-4     │
│ Temp: 0.3       │                       │ Temp: 0.3        │
│ e.g. "Medical   │                       │ e.g. "Regulatory │
│ Communications  │                       │ Strategy Expert" │
│ Expert"         │                       │                  │
└────────┬────────┘                       └────────┬─────────┘
         │                                         │
    ┌────┴────┐                              ┌─────┴─────┐
    │         │                              │           │
┌───▼───┐ ┌───▼───┐                    ┌────▼───┐ ┌─────▼─────┐
│  L3   │ │  L3   │                    │  L3    │ │    L3     │
│Spec-  │ │Spec-  │                    │Spec-   │ │ Spec-     │
│ialist │ │ialist │                    │ialist  │ │ ialist    │
│Domain │ │Domain │                    │Domain  │ │ Domain    │
│Expert │ │Expert │                    │Expert  │ │ Expert    │
└───┬───┘ └───┬───┘                    └───┬────┘ └────┬──────┘
    │         │                            │           │
    └────┬────┘                            └─────┬─────┘
         │                                       │
    ┌────▼────────────────────────────────────────▼────┐
    │           L4: WORKER AGENTS                       │
    │    (Entry-Level Task Specialists)                 │
    │ • Literature Review Worker                        │
    │ • Report Writing Worker                           │
    │ • Data Synthesis Worker                           │
    │ • Evidence Grading Worker                         │
    │ Each L4 orchestrates multiple L5 tools            │
    └──────────────────────────┬───────────────────────┘
                               │
    ┌──────────────────────────▼───────────────────────┐
    │              L5: TOOL AGENTS                      │
    │         (Atomic Tool Executors)                   │
    │ • PubMed Search Tool                              │
    │ • Web Search Tool                                 │
    │ • RAG Knowledge Retrieval Tool                    │
    │ • CSV/Excel Formatter Tool                        │
    │ • Citation Generator Tool                         │
    │ • PDF Parser Tool                                 │
    │ • Statistical Calculator Tool                     │
    └──────────────────────────────────────────────────┘
```

### 2.2 Agent Level Specifications

#### L1: Master Agent (Head of Function)
- **Role:** Process orchestrator, query router, escalation manager
- **Organizational Analog:** VP/Head of Function (e.g., Head of Medical Affairs)
- **Capabilities:**
  - Routes incoming queries to appropriate L2 experts
  - Manages cross-department coordination
  - Handles escalations from L2 experts
  - Sets strategic context for investigations
- **Model:** Claude-3-Opus or GPT-4 (highest reasoning)
- **Temperature:** 0.2 (precise routing)
- **Max Tokens:** 4000
- **When Used:** Mode 4 (automatic routing), complex multi-department queries

#### L2: Expert Agent (Head of Department)
- **Role:** Expert coordinator, investigation planner, quality reviewer
- **Organizational Analog:** Director/Head of Department
- **Capabilities:**
  - Creates investigation plans
  - Selects appropriate L3 specialists
  - Reviews and synthesizes specialist outputs
  - Makes strategic recommendations
  - Requests HITL approval at key decision points
- **Model:** GPT-4
- **Temperature:** 0.3
- **Max Tokens:** 4000
- **When Used:** Mode 3 primary entry point (user-selected)

#### L3: Specialist Agent (Manager Level Domain Expert)
- **Role:** Deep domain expertise, specialized analysis
- **Organizational Analog:** Manager/Senior Specialist
- **Capabilities:**
  - Performs specialized domain analysis
  - Directs L4 workers on specific tasks
  - Validates evidence quality
  - Provides expert opinion within domain
- **Model:** GPT-4 or domain-specific (e.g., BioGPT for biomedical)
- **Temperature:** 0.2 (accuracy-focused)
- **Max Tokens:** 3000
- **When Used:** Complex domain-specific subtasks

#### L4: Worker Agent (Entry-Level Task Specialist)
- **Role:** Task execution, tool orchestration
- **Organizational Analog:** Entry-level specialist / Research Associate
- **Capabilities:**
  - Executes specific task types (literature review, report writing, etc.)
  - Orchestrates multiple L5 tools to complete tasks
  - Formats outputs according to templates
  - Reports results back to L3/L2
- **Model:** GPT-3.5-Turbo or GPT-4-Turbo (cost-effective)
- **Temperature:** 0.3
- **Max Tokens:** 2000
- **When Used:** All task execution

**L4 Worker Types:**
| Worker Type | Task | L5 Tools Used |
|-------------|------|---------------|
| Literature Review Worker | Systematic literature search | PubMed Search, Web Search, RAG Retrieval |
| Report Writing Worker | Document generation | Citation Generator, Template Engine, Formatter |
| Data Synthesis Worker | Evidence aggregation | Statistical Calculator, Data Aggregator |
| Evidence Grading Worker | Quality assessment | GRADE Framework Tool, Bias Assessment |
| Summarization Worker | Content condensation | Summarizer, Key Point Extractor |

#### L5: Tool Agent (Atomic Tool Executor)
- **Role:** Single-purpose tool execution
- **Organizational Analog:** Intern / Tool operator
- **Capabilities:**
  - Executes exactly one atomic operation
  - Returns structured results
  - No reasoning or decision-making
- **Model:** GPT-3.5-Turbo (fastest, cheapest)
- **Temperature:** 0.1 (deterministic)
- **Max Tokens:** 1000
- **When Used:** All tool operations

**L5 Tool Types:**
| Tool | Input | Output | API/Service |
|------|-------|--------|-------------|
| PubMed Search | Query string | Article list with abstracts | NCBI E-utilities |
| Web Search | Query string | URLs with snippets | Tavily/SerpAPI |
| RAG Retrieval | Query + namespace | Relevant chunks | Pinecone/Supabase |
| Citation Generator | Article metadata | Formatted citation | Internal |
| PDF Parser | PDF URL/bytes | Extracted text + structure | PyPDF2/pdfplumber |
| Statistical Calculator | Data + formula | Calculated results | NumPy/SciPy |
| CSV Formatter | Data | Formatted CSV/Excel | pandas |

---

## 3. Mode 3 Execution Flow

### 3.1 High-Level Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        MODE 3: MANUAL AUTONOMOUS                          │
└──────────────────────────────────────────────────────────────────────────┘

User Query → [User Selects L2 Expert] → L2 Expert Receives Query
                                              │
                              ┌───────────────▼───────────────┐
                              │  PHASE 1: QUERY ANALYSIS       │
                              │  • Understand intent           │
                              │  • Identify complexity         │
                              │  • Determine domain scope      │
                              └───────────────┬───────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │  PHASE 2: PLAN CREATION        │
                              │  • Decompose into tasks        │
                              │  • Select L3 specialists       │
                              │  • Estimate effort/confidence  │
                              └───────────────┬───────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │  ★ HITL CHECKPOINT 1 ★         │
                              │  Plan Approval                 │
                              │  [Approve] [Modify] [Reject]   │
                              └───────────────┬───────────────┘
                                              │
                    ┌─────────────────────────▼─────────────────────────┐
                    │                EXECUTION LOOP                      │
                    │  ┌───────────────────────────────────────────┐    │
                    │  │ For each task in plan:                    │    │
                    │  │   1. L2 assigns task to L3 specialist     │    │
                    │  │   2. L3 breaks task into L4 work items    │    │
                    │  │   3. L4 workers execute using L5 tools    │    │
                    │  │   4. Results bubble up: L5→L4→L3→L2       │    │
                    │  │   5. Emit SSE events for each step        │    │
                    │  └───────────────────────────────────────────┘    │
                    │                                                    │
                    │  ★ HITL Checkpoints during execution:              │
                    │  • Tool Approval (when risky tools invoked)       │
                    │  • Sub-Agent Approval (when spawning L3)          │
                    │  • Critical Decision (when uncertain)             │
                    └─────────────────────────┬─────────────────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │  PHASE 3: SYNTHESIS            │
                              │  • L2 aggregates all results   │
                              │  • Generates comprehensive     │
                              │    response with citations     │
                              │  • Calculates confidence       │
                              └───────────────┬───────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │  ★ HITL CHECKPOINT 5 ★         │
                              │  Final Review                  │
                              │  [Accept] [Request Revision]   │
                              └───────────────┬───────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │  RESPONSE DELIVERED            │
                              │  • Comprehensive answer        │
                              │  • Full citation list          │
                              │  • Confidence score            │
                              │  • Audit trail                 │
                              └────────────────────────────────┘
```

### 3.2 ReAct² 7-Phase Reasoning Cycle

Each L2/L3 agent uses the ReAct² pattern for reasoning:

```
┌────────────────────────────────────────────────────────────────┐
│                    ReAct² 7-PHASE CYCLE                         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ 1. PRE-     │ →  │ 2. REASON   │ →  │ 3. ACTION   │        │
│  │ CONDITION   │    │ (Chain of   │    │ (Select     │        │
│  │ CHECK       │    │  Thought)   │    │  next step) │        │
│  └─────────────┘    └─────────────┘    └──────┬──────┘        │
│                                               │               │
│                                               ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ 7. CHECK-   │ ←  │ 6. UNCERT-  │ ←  │ 4. OBSERVE  │        │
│  │ POINT       │    │ AINTY       │    │ (Capture    │        │
│  │ (HITL if    │    │ ESTIMATE    │    │  results)   │        │
│  │  needed)    │    │             │    └──────┬──────┘        │
│  └──────┬──────┘    └─────────────┘           │               │
│         │                  ▲                  │               │
│         │           ┌──────┴──────┐           │               │
│         │           │ 5. POST-    │ ←─────────┘               │
│         │           │ CONDITION   │                           │
│         │           │ VERIFY      │                           │
│         │           └─────────────┘                           │
│         │                                                     │
│         └──────────────── Continue? ──────────────────────────│
│                      (if confidence < threshold               │
│                       and iterations < max)                   │
└────────────────────────────────────────────────────────────────┘
```

**Phase Details:**

| Phase | Purpose | Actions |
|-------|---------|---------|
| 1. Precondition Check | Verify state validity | Check dependencies, validate inputs |
| 2. Reasoning | Chain-of-thought analysis | Generate structured reasoning trace |
| 3. Action | Select and execute next step | Call L3/L4/L5 agent or tool |
| 4. Observation | Capture results | Store outputs, update context |
| 5. Postcondition Verify | Validate action succeeded | Check outputs meet expectations |
| 6. Uncertainty Estimate | Calculate confidence | Score based on evidence quality |
| 7. Checkpoint | HITL decision point | Request approval if uncertain |

---

## 4. HITL Checkpoint System

### 4.1 Five Checkpoint Types

| Checkpoint | Trigger | Options | Autonomy Levels |
|------------|---------|---------|-----------------|
| **Plan Approval** | Plan created | Approve/Modify/Reject | All levels |
| **Tool Approval** | Risky tool invoked | Allow/Deny/Modify params | Strict only |
| **Sub-Agent Approval** | L3 spawn requested | Approve/Deny | Strict, Balanced |
| **Critical Decision** | Confidence < threshold | Approve/Modify/Escalate | All levels |
| **Final Review** | Response synthesized | Accept/Request revision | All levels |

### 4.2 Autonomy Levels

| Level | Description | Active Checkpoints |
|-------|-------------|-------------------|
| **Strict** | Maximum human oversight | All 5 checkpoints |
| **Balanced** | Strategic control | Plan, Critical Decision, Final |
| **Permissive** | Minimal interruption | Plan, Final only |

### 4.3 Checkpoint Data Structure

```typescript
interface HITLCheckpoint {
  id: string;
  session_id: string;
  checkpoint_type: 'plan_approval' | 'tool_approval' | 'subagent_approval' | 'critical_decision' | 'final_review';

  // Display
  title: string;
  description: string;

  // Context
  context: {
    current_state: object;
    reasoning: string;
    confidence: number;
    risk_assessment?: string;
  };

  // Options
  options: Array<{
    id: string;
    label: string;
    action: 'approve' | 'modify' | 'reject' | 'escalate';
    is_default: boolean;
    description?: string;
  }>;

  // Timing
  timeout_seconds: number;  // Default: 300
  auto_action_on_timeout: 'reject' | 'approve_default';  // MUST be 'reject' for security

  // Metadata
  created_at: string;
  decided_at?: string;
  decision?: {
    option_id: string;
    action: string;
    modifications?: string;
    decided_by: string;
  };
}
```

---

## 5. SSE Event System

### 5.1 Event Categories

```typescript
enum SSEEventType {
  // === PLANNING EVENTS ===
  PLAN_CREATED = 'plan_created',           // Initial task list generated
  PLAN_UPDATED = 'plan_updated',           // Plan modified mid-execution
  TASK_STATUS_CHANGE = 'task_status_change', // Task state transition

  // === AGENT HIERARCHY EVENTS ===
  AGENT_ASSIGNED = 'agent_assigned',       // L3/L4 agent selected for task
  AGENT_STARTED = 'agent_started',         // Agent began work
  AGENT_COMPLETED = 'agent_completed',     // Agent finished task
  AGENT_ESCALATED = 'agent_escalated',     // Agent escalated to higher level

  // === REASONING EVENTS ===
  REASONING_STEP = 'reasoning_step',       // ReAct² phase completed
  THINKING = 'thinking',                   // Chain-of-thought visible
  CONFIDENCE_UPDATE = 'confidence_update', // Confidence score changed

  // === TOOL EVENTS ===
  TOOL_INVOKED = 'tool_invoked',          // L5 tool called
  TOOL_RESULT = 'tool_result',            // L5 tool returned

  // === DATA DISCOVERY EVENTS ===
  RAG_SEARCH_STARTED = 'rag_search_started',
  RAG_DOCUMENTS_FOUND = 'rag_documents_found',
  WEB_SEARCH_STARTED = 'web_search_started',
  WEB_SOURCES_FOUND = 'web_sources_found',
  PUBMED_SEARCH_STARTED = 'pubmed_search_started',
  PUBMED_ARTICLES_FOUND = 'pubmed_articles_found',
  INSIGHT_GENERATED = 'insight_generated',

  // === HITL EVENTS ===
  CHECKPOINT_PLAN_APPROVAL = 'checkpoint_plan_approval',
  CHECKPOINT_TOOL_APPROVAL = 'checkpoint_tool_approval',
  CHECKPOINT_SUBAGENT_APPROVAL = 'checkpoint_subagent_approval',
  CHECKPOINT_DECISION = 'checkpoint_decision',
  CHECKPOINT_FINAL_REVIEW = 'checkpoint_final_review',
  USER_RESPONSE = 'user_response',

  // === ITERATION EVENTS ===
  ITERATION_START = 'iteration_start',
  ITERATION_COMPLETE = 'iteration_complete',

  // === PROGRESS EVENTS ===
  PHASE_START = 'phase_start',
  PHASE_COMPLETE = 'phase_complete',
  PROGRESS_UPDATE = 'progress_update',

  // === RESPONSE EVENTS ===
  TOKEN = 'token',                         // Streaming token
  CITATION_ADDED = 'citation_added',       // New citation
  COMPLETE = 'complete',                   // Final response
  ERROR = 'error',                         // Error occurred
}
```

### 5.2 Event Payload Examples

**Plan Created Event:**
```json
{
  "type": "plan_created",
  "timestamp": "2025-12-05T10:30:00Z",
  "session_id": "sess_abc123",
  "data": {
    "plan": {
      "id": "plan_xyz",
      "goal": "Research the FDA approval pathway for cell and gene therapies",
      "tasks": [
        {
          "id": "task_1",
          "title": "Literature Review",
          "description": "Search PubMed and internal knowledge for relevant regulatory guidance",
          "status": "pending",
          "assigned_agent_level": "L4",
          "assigned_agent_type": "literature_review_worker",
          "estimated_duration_ms": 30000
        },
        {
          "id": "task_2",
          "title": "FDA Guidance Analysis",
          "description": "Analyze specific FDA guidance documents for cell/gene therapies",
          "status": "pending",
          "assigned_agent_level": "L3",
          "assigned_agent_type": "regulatory_specialist",
          "estimated_duration_ms": 45000
        }
      ],
      "total_estimated_duration_ms": 120000
    }
  }
}
```

**Agent Hierarchy Event:**
```json
{
  "type": "agent_assigned",
  "timestamp": "2025-12-05T10:30:05Z",
  "session_id": "sess_abc123",
  "data": {
    "task_id": "task_1",
    "agent_level": "L4",
    "agent_type": "literature_review_worker",
    "agent_name": "Literature Review Specialist",
    "parent_agent": {
      "level": "L3",
      "type": "regulatory_specialist",
      "name": "Regulatory Intelligence Specialist"
    },
    "tools_available": [
      "pubmed_search",
      "rag_retrieval",
      "web_search"
    ]
  }
}
```

---

## 6. 24 Mission Templates

### 6.1 Mission Categories Overview

Mode 3 supports **24 autonomous mission templates** organized into 7 categories:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           24 MISSION TEMPLATES                               │
├───────────────┬────────────────────────────────────────────────────────────┤
│  UNDERSTAND   │  1. Deep Dive          - Comprehensive domain mastery      │
│  (Discovery)  │  2. Knowledge Harvest  - Exhaustive information collection │
│               │  3. Gap Discovery      - Find unknown unknowns             │
│               │  4. Expert Onboarding  - Rapid domain competency           │
├───────────────┼────────────────────────────────────────────────────────────┤
│  EVALUATE     │  5. Critique           - Tough-but-fair work review        │
│  (Assessment) │  6. Benchmark          - Performance comparison            │
│               │  7. Risk Assessment    - FMEA + probability analysis       │
│               │  8. Feasibility Check  - Viability evaluation              │
├───────────────┼────────────────────────────────────────────────────────────┤
│  DECIDE       │  9. Decision Framing   - Structure complex decisions       │
│  (Choice)     │  10. Option Exploration - Divergent option generation      │
│               │  11. Trade-off Analysis - Multi-criteria comparison        │
│               │  12. Go/No-Go          - Binary decision support           │
├───────────────┼────────────────────────────────────────────────────────────┤
│  INVESTIGATE  │  13. Failure Forensics - Root cause analysis               │
│  (Root Cause) │  14. Signal Chasing    - Causal pattern investigation      │
│               │  15. Due Diligence     - Comprehensive evaluation          │
│               │  16. Pattern Mining    - Cross-case pattern extraction     │
├───────────────┼────────────────────────────────────────────────────────────┤
│  WATCH        │  17. Horizon Scanning  - Future signal detection           │
│  (Monitoring) │  18. Competitive Watch - Competitor intelligence           │
│               │  19. Trigger Monitoring - Event-based alerting             │
├───────────────┼────────────────────────────────────────────────────────────┤
│  SOLVE        │  20. Get Unstuck       - Problem reframing                 │
│  (Problem)    │  21. Alternative Finding - Rapid option generation         │
│               │  22. Path Finding      - Optimal route to goal             │
├───────────────┼────────────────────────────────────────────────────────────┤
│  PREPARE      │  23. Meeting Prep      - Comprehensive meeting readiness   │
│  (Deliverable)│  24. Case Building     - Persuasive argument construction  │
└───────────────┴────────────────────────────────────────────────────────────┘
```

### 6.2 Mission Quick Reference

| # | Mission | Reasoning Pattern | L4 Workers | L5 Tools | Est. Cost | Est. Time |
|---|---------|-------------------|------------|----------|-----------|-----------|
| 1 | Deep Dive | ToT + CoT + Reflection | DE, CS, PM, TL, GD, OE | RAG, PS, CT, PT, FDA, WEB | $0.15-0.30 | 15-25 min |
| 2 | Knowledge Harvest | ReAct + Decomposition | DE, DP, QA, CM, GD, EV | RAG, PS, CT, FDA, WEB, NLP | $0.10-0.25 | 10-20 min |
| 3 | Gap Discovery | Decomposition + Adversarial | GD, PS, OE, CS, RF | RAG, PS, CT, NEWS, PT, WEB | $0.08-0.15 | 8-15 min |
| 4 | Expert Onboarding | Pedagogical + Analogical | DP, CS, SC, PM, OE | RAG, PS, VIZ, WEB | $0.05-0.10 | 10-15 min |
| 5 | Critique | Rubric + Devil's Advocate | QA, GD, EV, CS, OE, RF | RAG, PS, FDA, CALC | $0.05-0.15 | 5-15 min |
| 6 | Benchmark | Comparative + Root Cause | CS, PS, CA, DE, PM | RAG, PS, WEB, CALC, CT | $0.08-0.15 | 8-15 min |
| 7 | Risk Assessment | FMEA + Monte Carlo | RF, SC, PS, CA, EV | RAG, FDA, PS, CALC, STAT | $0.10-0.20 | 10-20 min |
| 8 | Feasibility Check | Decomposition + Constraint | QA, RF, PS, SC, CA | RAG, CALC, WEB, CT | $0.08-0.15 | 8-15 min |
| 9 | Decision Framing | Decision Analysis | SC, PS, OE, CA, RF | RAG, CALC, WEB | $0.08-0.15 | 8-15 min |
| 10 | Option Exploration | Divergent + Feasibility | HG, SC, QA, PS, OE | RAG, PS, WEB, PT | $0.08-0.12 | 8-12 min |
| 11 | Trade-off Analysis | Multi-Criteria + Sensitivity | CS, PS, CA, SC | RAG, CALC, STAT, VIZ | $0.08-0.15 | 8-15 min |
| 12 | Go/No-Go | Decision Tree + Evidence | EV, RF, PS, QA | RAG, FDA, CALC, PS | $0.10-0.20 | 10-20 min |
| 13 | Failure Forensics | Root Cause + Hypothesis | CA, HG, EV, TL, PM | RAG, FDA, PS, CT, STAT | $0.12-0.25 | 15-25 min |
| 14 | Signal Chasing | Causal + Pattern | CA, PM, EV, RF, HG | FDA, PS, RAG, STAT, CT | $0.10-0.20 | 10-20 min |
| 15 | Due Diligence | Comprehensive + Risk-Adj | DE, QA, RF, GD, EV, CS | RAG, FDA, PS, CT, PT, WEB | $0.20-0.40 | 25-40 min |
| 16 | Pattern Mining | Pattern + Statistical | PM, CA, DE, QA | RAG, STAT, NLP, VIZ | $0.10-0.20 | 10-20 min |
| 17 | Horizon Scanning | Environmental + Impact | PM, RF, PS, TL, HG | WEB, NEWS, PS, PT, RAG | $0.08-0.15 | 10-15 min |
| 18 | Competitive Watch | Intelligence + Predictive | DE, TL, PM, HG, CS | NEWS, WEB, CT, FDA, PT, RAG | $0.10-0.20 | 10-20 min |
| 19 | Trigger Monitoring | Event + Threshold | RF, PM, PS | RAG, NEWS, FDA, CT | $0.05-0.10 | 5-10 min |
| 20 | Get Unstuck | Reframing + Socratic | HG, SC, OE, PS | RAG, WEB, PS | $0.05-0.10 | 5-10 min |
| 21 | Alternative Finding | Rapid Gen + Feasibility | HG, QA, CS, PS | RAG, PS, WEB, PT | $0.05-0.10 | 5-10 min |
| 22 | Path Finding | Optimization + Constraint | SC, PS, RF, TL | RAG, CALC, VIZ | $0.05-0.10 | 5-10 min |
| 23 | Meeting Prep | Gap Analysis + Anticipatory | GD, OE, DE, SC | RAG, PS, NEWS, WEB | $0.05-0.10 | 5-10 min |
| 24 | Case Building | Argument + Evidence | EV, OE, CS, PS, CM | RAG, PS, FDA, FMT, VIZ | $0.08-0.15 | 8-15 min |

**L4 Worker Key:** DE=Data Extractor, DP=Document Processor, CM=Citation Manager, QA=Quality Assessor, CS=Comparison Synthesizer, TL=Timeline Builder, PM=Pattern Matcher, GD=Gap Detector, RF=Risk Flagger, EV=Evidence Validator, HG=Hypothesis Generator, CA=Causal Analyzer, SC=Scenario Constructor, OE=Objection Explorer, PS=Priority Scorer

**L5 Tool Key:** PS=PubMed Search, CT=Clinical Trial Search, PT=Patent Search, FDA=FDA Database, RAG=RAG Search, WEB=Web Fetch, CALC=Calculator, NLP=NLP Processor, FMT=Formatter, VIZ=Visualizer, NEWS=News Search, EMA=EMA Database, STAT=Statistical Analysis

### 6.2 Template Specifications

#### Template 1: Deep Research / Investigation

```yaml
id: deep_research
name: Deep Research / Investigation
description: Comprehensive multi-source investigation with full citations

agent_hierarchy:
  l2_expert: research_coordinator
  l3_specialists:
    - domain_expert
    - evidence_specialist
  l4_workers:
    - literature_review_worker
    - data_synthesis_worker
    - citation_worker
  l5_tools:
    - pubmed_search
    - rag_retrieval
    - web_search
    - citation_generator

phases:
  - name: query_analysis
    description: Understand research question and scope
    hitl_checkpoint: false

  - name: planning
    description: Create research plan
    hitl_checkpoint: true  # Plan approval
    checkpoint_type: plan_approval

  - name: literature_search
    description: Systematic literature search across sources
    hitl_checkpoint: false
    l4_worker: literature_review_worker
    l5_tools: [pubmed_search, rag_retrieval, web_search]

  - name: evidence_analysis
    description: Analyze and grade evidence quality
    hitl_checkpoint: false
    l3_specialist: evidence_specialist
    l4_worker: evidence_grading_worker

  - name: synthesis
    description: Synthesize findings with citations
    hitl_checkpoint: false
    l3_specialist: domain_expert
    l4_worker: data_synthesis_worker

  - name: final_review
    description: Present findings for approval
    hitl_checkpoint: true  # Final review
    checkpoint_type: final_review

output_format:
  type: research_report
  sections:
    - executive_summary
    - methodology
    - findings
    - evidence_quality_assessment
    - conclusions
    - references
  required_citations: minimum_5

reasoning_config:
  strategy: react2
  max_iterations: 5
  confidence_threshold: 0.85
  uncertainty_triggers_hitl: true

autonomy_default: balanced
max_tokens: 8000
timeout_seconds: 600
```

#### Template 2: Strategy / Option Shaping

```yaml
id: strategy_shaping
name: Strategy / Option Shaping
description: Strategic analysis with multiple options and trade-offs

agent_hierarchy:
  l2_expert: strategy_advisor
  l3_specialists:
    - strategic_analyst
    - market_specialist
  l4_workers:
    - competitive_analysis_worker
    - scenario_modeling_worker
    - recommendation_writer
  l5_tools:
    - web_search
    - rag_retrieval
    - financial_calculator

phases:
  - name: situation_analysis
    description: Understand current state and constraints
    hitl_checkpoint: false

  - name: option_generation
    description: Generate strategic options
    hitl_checkpoint: true
    checkpoint_type: plan_approval

  - name: option_evaluation
    description: Evaluate each option against criteria
    hitl_checkpoint: false
    l3_specialist: strategic_analyst

  - name: trade_off_analysis
    description: Compare options with SWOT/decision matrix
    hitl_checkpoint: true
    checkpoint_type: critical_decision

  - name: recommendation
    description: Synthesize recommendation with rationale
    hitl_checkpoint: true
    checkpoint_type: final_review

output_format:
  type: decision_matrix
  sections:
    - situation_summary
    - options_overview (3-5 options)
    - evaluation_criteria
    - trade_off_matrix
    - recommendation
    - implementation_considerations

reasoning_config:
  strategy: tree_of_thoughts  # Multiple paths considered
  max_iterations: 4
  confidence_threshold: 0.80

autonomy_default: strict
```

#### Template 3: Tactical Planning / Execution Path

```yaml
id: tactical_planning
name: Tactical Planning / Execution Path
description: Detailed execution plan with timeline and dependencies

agent_hierarchy:
  l2_expert: project_planner
  l3_specialists:
    - operations_specialist
    - resource_planner
  l4_workers:
    - task_decomposition_worker
    - timeline_builder_worker
    - dependency_mapper_worker
  l5_tools:
    - gantt_generator
    - resource_calculator

phases:
  - name: scope_definition
    description: Define deliverables and success criteria
    hitl_checkpoint: true
    checkpoint_type: plan_approval

  - name: task_breakdown
    description: Decompose into actionable tasks
    hitl_checkpoint: false

  - name: dependency_mapping
    description: Identify task dependencies
    hitl_checkpoint: false

  - name: timeline_creation
    description: Build timeline with milestones
    hitl_checkpoint: true
    checkpoint_type: critical_decision

  - name: resource_allocation
    description: Assign resources and owners
    hitl_checkpoint: false

  - name: final_plan
    description: Present complete execution plan
    hitl_checkpoint: true
    checkpoint_type: final_review

output_format:
  type: project_plan
  sections:
    - executive_summary
    - scope_statement
    - work_breakdown_structure
    - timeline_with_milestones
    - resource_requirements
    - risk_considerations
    - success_metrics

autonomy_default: balanced
```

*(Templates 4-8 follow similar structure - abbreviated for space)*

---

## 7. User Experience Requirements

### 7.1 Three-Panel Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐ ┌────────────────────────────┐ ┌──────────────────┐  │
│  │ TASK LIST    │ │ CONVERSATION + REASONING   │ │ INSIGHTS PANEL   │  │
│  │              │ │                            │ │                  │  │
│  │ ○ Task 1     │ │ User: "Research FDA..."    │ │ 📄 Documents (5) │  │
│  │ ● Task 2     │ │                            │ │  - FDA Guidance  │  │
│  │   (Running)  │ │ 🧠 Thinking...             │ │  - ICH M7...     │  │
│  │ ○ Task 3     │ │ "Analyzing regulatory..."  │ │                  │  │
│  │ ○ Task 4     │ │                            │ │ 💡 Insights (3)  │  │
│  │              │ │ [Agent reasoning visible]  │ │  - Key finding 1 │  │
│  │ ────────     │ │                            │ │  - Key finding 2 │  │
│  │ Progress:    │ │ 📊 Confidence: 72%         │ │                  │  │
│  │ [████░░] 40% │ │ 🔄 Iteration: 2/5          │ │ 📈 Confidence    │  │
│  │              │ │                            │ │    History       │  │
│  └──────────────┘ └────────────────────────────┘ └──────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────┤
│  │ ⚠️ HITL CHECKPOINT: Plan Approval Required                         │  │
│  │                                                                     │  │
│  │ I've created a 4-step research plan. Please review:                │  │
│  │ [View Details]                                                      │  │
│  │                                                                     │  │
│  │ [✓ Approve Plan]  [✏️ Modify]  [✗ Reject]                          │  │
│  └─────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Key UX Elements

| Element | Purpose | Behavior |
|---------|---------|----------|
| Task List | Show execution progress | Updates in real-time, shows agent assignments |
| Reasoning Accordion | Display thinking process | Expandable per-phase reasoning |
| Confidence Meter | Track certainty | Visual progress toward threshold |
| HITL Drawer | Approval interface | Slides up, requires action, has timeout |
| Insights Panel | Show discoveries | Accumulates insights, citations |
| Agent Cards | Show who's working | Display active L2/L3/L4 agents |

---

## 8. Security Requirements

### 8.1 Mandatory Security Controls

| Control | Requirement | Implementation |
|---------|-------------|----------------|
| Tenant Isolation | All queries filter by tenant_id | RLS policies + query enforcement |
| HITL Fail-Closed | Errors reject, never approve | Default to rejection on exception |
| Input Sanitization | Prevent prompt injection | QuerySanitizer with pattern detection |
| Rate Limiting | Prevent abuse | 10/min, 100/hour per user |
| Audit Trail | Track all actions | Complete action log in database |
| Tool Permissions | Restrict tool access | Per-tenant tool whitelist |

### 8.2 HITL Security Pattern

```python
# MANDATORY: Fail-closed pattern
async def check_hitl_approval(checkpoint: HITLCheckpoint) -> HITLDecision:
    try:
        decision = await wait_for_user_response(checkpoint, timeout=300)
        return decision
    except TimeoutError:
        return HITLDecision(approved=False, reason="timeout", auto_rejected=True)
    except Exception as e:
        # CRITICAL: ANY error = REJECT
        logger.error(f"HITL error: {e}")
        return HITLDecision(approved=False, reason="error", auto_rejected=True)
```

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query Completion Rate | >95% | Sessions reaching final_review |
| HITL Response Time | <2 minutes | P95 of user response latency |
| Citation Accuracy | >90% | Manual audit of citations |
| User Satisfaction | >4.0/5.0 | Post-session survey |
| Confidence Calibration | ±10% | Correlation of confidence to accuracy |
| Agent Hierarchy Usage | Measurable | Distribution of L2→L5 calls |

---

## 10. Out of Scope

- Real-time collaboration (multi-user same session)
- Voice interface
- Mobile-optimized layout (desktop-first)
- Agent customization by users (admin only)
- Integration with external workflow systems

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| L1 Master | Head of Function agent, routes queries |
| L2 Expert | Head of Department agent, coordinates investigation |
| L3 Specialist | Manager-level domain expert |
| L4 Worker | Entry-level task executor, orchestrates L5 tools |
| L5 Tool | Atomic tool executor (PubMed, RAG, etc.) |
| HITL | Human-in-the-Loop checkpoint |
| ReAct² | 7-phase reasoning pattern |
| JTBD | Jobs-to-be-Done template |

---

*PRD Version 2.0 - December 5, 2025*
