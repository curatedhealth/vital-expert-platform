# VITAL Platform — Agent OS, Fusion Search, and Autonomous Value Map

This note summarizes the key mental models for Agent OS, Fusion Search, enterprise ontology, and how missions/tasks flow to workflows and solutions. Diagrams are lightweight ASCII so they render in Markdown.

## Agent OS: 5-Level Stack (simple view)
- **L1 Master (Orchestrators):** strategy + delegation across the stack.  
- **L2 Experts:** domain specialists that interface with users and missions.  
- **L3 Specialists:** focused executors for sub-domains.  
- **L4 Workers:** shared task executors (data, clinical, regulatory, etc.).  
- **L5 Tools:** atomic capabilities (RAG, web, medical references, transformations).  

```
User / Mission
    │
┌───▼─────────────┐
│ L1 Master       │  Sets strategy, chooses experts/specialists
└───┬─────────────┘
    ▼
┌───▼─────────────┐
│ L2 Experts      │  Own user intent, call specialists/workers
└───┬─────────────┘
    ▼
┌───▼─────────────┐
│ L3 Specialists  │  Focused reasoning for sub-tasks
└───┬─────────────┘
    ▼
┌───▼─────────────┐
│ L4 Workers      │  Execute repeatable operations
└───┬─────────────┘
    ▼
┌───▼─────────────┐
│ L5 Tools        │  Atomic actions (search, retrieve, transform)
└─────────────────┘
```

Reference:
```
902:908:.claude/CATALOGUE.md
**🎯 5-Level Agent Hierarchy**:
- **L1 MASTER** (24 agents) - Strategic orchestrators
- **L2 EXPERT** (110 agents) - Domain specialists
- **L3 SPECIALIST** (266 agents) - Focused experts
- **L4 WORKER** (39 agents) - Task executors
- **L5 TOOL** (50 agents) - Automated functions
```

## Agent Selection: Fusion Search (GraphRAG)
- **What it does:** auto-selects the best agent (Mode 2/4) by fusing GraphRAG context, hybrid search, and evidence scoring.
- **Core services:** `hybrid_agent_search` (semantic+keyword), `graphrag_selector` (graph context), `evidence_based_selector` (scoring), `recommendation_engine` (rank), `confidence_calculator` (confidence).
- **Flow (simplified):**
  1) User query → graph + vector + keyword retrieval  
  2) Reciprocal Rank Fusion (RRF) merges candidate agents  
  3) Evidence + confidence scored  
  4) Top agent(s) returned to workflow / UI

```
Query → GraphRAG retrieval → Fusion (RRF) → Evidence scoring → Agent pick
```

References:
```
976:988:docs/ask-expert/ASK_EXPERT_UNIFIED_BACKEND_OVERVIEW.md
#### Fusion Search & Agent Selection (Backend)
| `hybrid_agent_search.py` | Hybrid semantic + keyword agent search |
| `graphrag_selector.py` | GraphRAG-based agent selection |
| `evidence_based_selector.py` | Evidence-scored agent selection |
| `medical_affairs_agent_selector.py` | Medical affairs domain selector |
| `recommendation_engine.py` | Agent recommendation engine |
| `confidence_calculator.py` | Confidence scoring for selections |
```
```
40:45:.claude.md
| **Mode 2** | Interactive Auto | ... | Mode 1 + GraphRAG fusion search |
| **Mode 4** | Autonomous Auto | ... | Mode 3 + GraphRAG fusion search |
**Key Insight**: Mode 2 = Mode 1 + Fusion Search, Mode 4 = Mode 3 + Fusion Search
```

## Enterprise Ontology: 8 Layers (L0–L7)
- L0 Domain Knowledge (foundational corpus)
- L1 Organizational Structure (functions, departments, roles)
- L2 Process & Workflow (JTBD processes)
- L3 Task & Activity (JTBD tasks)
- L4 Agent Coordination (agent layer)
- L5 Execution (workload execution)
- L6 Analytics (distributed analytics)
- L7 Value Transformation (impact tracking)

```
39:48:.claude/docs/platform/enterprise_ontology/README.md
| L0 | Domain Knowledge | Foundation knowledge layer |
| L1 | Organizational Structure | Org hierarchy definitions |
| L2 | Process & Workflow | (In jtbds/) |
| L3 | Task & Activity | (In jtbds/) |
| L4 | Agent Coordination | (In agents/) |
| L5 | Execution | Execution layer definitions |
| L6 | Analytics | (Distributed) |
| L7 | Value Transformation | Value impact tracking |
```

```
Ontology alignment
┌───────────────┬───────────────────────────────────────┐
│ Layers        │ Source folders                        │
├───────────────┼───────────────────────────────────────┤
│ L0-L1         │ enterprise_ontology/01-core-layers    │
│ L2-L3         │ platform/jtbds/ (process & tasks)     │
│ L4            │ platform/agents/ (5-level hierarchy)  │
│ L5            │ runners/ + workflows/ execution layer │
│ L6-L7         │ monitoring/value frameworks           │
└───────────────┴───────────────────────────────────────┘
```

## Modes 2 & 3: Task Equation and Mode Matrix
- **Mode matrix:** Interactive vs Autonomous, Manual vs Auto selection. Mode 2 = interactive auto (Fusion Search). Mode 3 = autonomous manual (mission templates + HITL safety).

```
601:618:docs/ask-expert/ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md
                    │  (Conversation) │    (Mission)    │
┌───────────────────┼─────────────────┼─────────────────┤
│   MANUAL          │     MODE 1      │     MODE 3      │
│                   │  Basic flow     │  Full safety    │
│                   │  NO runners     │  + Runners      │
├───────────────────┼─────────────────┼─────────────────┤
│   AUTOMATIC       │     MODE 2      │     MODE 4      │
│                   │  Basic flow     │  Full safety    │
│                   │  NO runners     │  + Runners      │
└───────────────────┴─────────────────┴─────────────────┘
```

- **Task equation (autonomous runners):** the runner library encodes `TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT`. For VITAL missions, map this to **TASK = Agent (persona) + Skills + Knowledge + Mission context**, which is what Modes 3/4 compile into LangGraph workflows.

```
5:12:services/ai-engine/docs/MISSION_RUNNER_LIBRARY.md
The Mission Runner Library implements the core formula for autonomous mission execution:
TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT
... 24 specialized runners ...
```

## Mission → Task → Workflow → Solution
- **Mission templates:** 24 templates grouped into 7 runner families (deep research, evaluation, strategy, investigation, monitoring, problem solving, communication).
- **Workflow builder:** `MissionWorkflowBuilder` enforces autonomous modes (3/4), routes the mission template to the correct runner family, and manages HITL checkpoints.
- **Runner execution:** `WorkflowRunner` executes compiled LangGraph workflows with persistence and streaming; outputs get converted to user-facing solutions (reports, briefs, plans).

```
621:646:docs/ask-expert/ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md
MissionRegistry (24 Templates → 7 Runner Families)
... MissionWorkflowBuilder (enforces: mode must be 3 or 4)
... WorkflowRunner (executes compiled LangGraph workflows)
```

Flow sketch:
```
Mission (template + budget + safety) 
    → Runner family (PLAN / INVESTIGATE / EVALUATE / ...) 
        → LangGraph workflow (nodes = runners, quality gates, HITL) 
            → Solutions (reports, decisions, plans) streamed to user
```

## Value of the VITAL Platform (visual cheat sheet)
```
Enterprise Ontology (L0-L7) ─┬─> Agent OS (L1-L5 library)
                             │
                             ├─> Fusion Search (GraphRAG) picks best agent/team
                             │
                             └─> Missions/Tasks compiled into LangGraph workflows
                                      │
                                      ├─> Quality + HITL gates (Mode 3/4)
                                      └─> Solutions with traceability & analytics
```

Use this as a one-pager anchor for onboarding or sharing the value proposition.

