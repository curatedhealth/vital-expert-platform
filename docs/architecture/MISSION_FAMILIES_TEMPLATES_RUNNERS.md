# Mission Families, Templates & Runners Architecture

> **Version:** 1.0
> **Last Updated:** December 13, 2025
> **Status:** Production Documentation

## Overview

This document describes the architecture for Mode 3/4 autonomous missions in the VITAL Platform. The system uses a **Family → Template → Runner** hierarchy where mission templates are loaded from the database and mapped to graph factories (runners) that execute the mission workflow.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Mission Families](#mission-families)
3. [Mission Templates](#mission-templates)
4. [Runner System](#runner-system)
5. [Backend File Structure](#backend-file-structure)
6. [API Routes](#api-routes)
7. [Extension Guide](#extension-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MISSION EXECUTION ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   FAMILY        │────▶│   TEMPLATE      │────▶│   RUNNER        │       │
│  │   (Category)    │     │   (Config)      │     │   (Executor)    │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                              │
│  Examples:                                                                   │
│  - DEEP_RESEARCH        - comprehensive_analysis    - build_master_graph()  │
│  - STRATEGY             - tradeoff_analysis         - (unified workflow)    │
│  - INVESTIGATION        - due_diligence             - (LangGraph)           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Database                     Backend                    Execution           │
│  ─────────                    ─────────                  ──────────          │
│                                                                              │
│  mission_templates     →     TemplateCache      →      StateGraph            │
│  (Supabase)                  (registry.py)              (11 nodes)           │
│                                                                              │
│  ┌──────────────┐           ┌──────────────┐          ┌──────────────┐      │
│  │ id           │           │ slug→config  │          │ initialize   │      │
│  │ name         │    Load   │ TTL: 5min    │   Build  │ decompose    │      │
│  │ family       │──────────▶│ refresh()    │─────────▶│ plan         │      │
│  │ category     │           │              │          │ select_team  │      │
│  │ complexity   │           └──────────────┘          │ execute_step │      │
│  │ tasks        │                                     │ ...          │      │
│  │ checkpoints  │                                     └──────────────┘      │
│  └──────────────┘                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mission Families

Families are logical groupings of related mission templates. Each family represents a distinct category of autonomous work.

### Family Definitions

| Family | Purpose | Typical Complexity | Active Templates |
|--------|---------|-------------------|------------------|
| **DEEP_RESEARCH** | Comprehensive analysis and knowledge gathering | high-critical | 3 ✅ |
| **EVALUATION** | Assessment, benchmarking, and review | medium-high | 0 |
| **GENERIC** | Simple queries and general-purpose tasks | low | 1 ✅ |
| **INVESTIGATION** | Due diligence and forensic analysis | high-critical | 0 |
| **MONITORING** | Ongoing surveillance and trigger detection | low-medium | 0 |
| **PREPARATION** | Meeting prep and document assembly | low-high | 0 |
| **PROBLEM_SOLVING** | Unblocking and alternative finding | medium-high | 0 |
| **STRATEGY** | Decision framing and option exploration | medium-high | 0 |

### Family Characteristics

```
DEEP_RESEARCH
├── Multi-step iterative refinement
├── Citation verification required
├── Confidence gating (>0.8 threshold)
└── Quality gates (RACE/FACT metrics)

EVALUATION
├── Structured assessment frameworks
├── Comparative analysis
└── Scoring/rating outputs

INVESTIGATION
├── Evidence chain tracking
├── Audit trail required
└── High HITL involvement

MONITORING
├── Periodic re-execution
├── Trigger-based alerts
└── Low latency requirements

PREPARATION
├── Document synthesis
├── Meeting context gathering
└── Stakeholder-aware outputs

PROBLEM_SOLVING
├── Constraint identification
├── Alternative generation
└── Trade-off analysis

STRATEGY
├── Multi-perspective analysis
├── Scenario planning
└── Decision frameworks
```

---

## Mission Templates

Templates are database-stored configurations that define how a mission should be executed.

### Template Schema

```sql
CREATE TABLE mission_templates (
    id              VARCHAR PRIMARY KEY,      -- e.g., 'comprehensive_analysis'
    name            VARCHAR NOT NULL,         -- Human-readable name
    family          VARCHAR NOT NULL,         -- Family grouping
    category        VARCHAR NOT NULL,         -- Subcategory
    complexity      VARCHAR NOT NULL,         -- low | medium | high | critical
    description     TEXT,                     -- Template description
    tasks           JSONB,                    -- Default task list
    default_checkpoints JSONB,                -- HITL checkpoint definitions
    estimated_duration_hours FLOAT,           -- Time estimate
    difficulty_level VARCHAR,                 -- User-facing difficulty
    is_active       BOOLEAN DEFAULT false,    -- Enable/disable
    metadata        JSONB,                    -- Additional config
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);
```

### All Templates (23 Total)

#### DEEP_RESEARCH (3 templates - all active)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `comprehensive_analysis` | Comprehensive Analysis | critical | Full multi-source research with citation verification |
| `deep_dive` | Deep Dive Analysis | high | Focused deep exploration of a specific topic |
| `knowledge_harvest` | Knowledge Harvest | high | Systematic extraction of insights from sources |

#### EVALUATION (4 templates - inactive)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `benchmark` | Benchmark Analysis | medium | Compare against industry standards |
| `critique` | Critique & Review | medium | Critical evaluation of documents/proposals |
| `feasibility_study` | Feasibility Study | high | Assess viability of proposed approaches |
| `risk_assessment` | Risk Assessment | high | Identify and evaluate potential risks |

#### GENERIC (1 template - active)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `generic_query` | Generic Query | low | Simple question-answer without research pipeline |

#### INVESTIGATION (3 templates - inactive)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `due_diligence` | Due Diligence | critical | Thorough investigation with evidence chain |
| `failure_forensics` | Failure Forensics | high | Root cause analysis of failures |
| `signal_chasing` | Signal Chasing | medium | Follow leads and verify signals |

#### MONITORING (3 templates - inactive)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `competitive_watch` | Competitive Watch | medium | Track competitor activities |
| `horizon_scan` | Horizon Scan | medium | Monitor emerging trends |
| `trigger_monitoring` | Trigger Monitoring | low | Alert on specific conditions |

#### PREPARATION (3 templates - inactive)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `case_building` | Case Building | high | Assemble evidence for proposals |
| `meeting_prep` | Meeting Preparation | medium | Prepare context for meetings |
| `prework_assembly` | Pre-work Assembly | low | Gather materials for tasks |

#### PROBLEM_SOLVING (3 templates - inactive)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `alternative_finding` | Alternative Finding | medium | Generate alternative approaches |
| `get_unstuck` | Get Unstuck | medium | Help overcome blockers |
| `path_finding` | Path Finding | high | Strategic route planning |

#### STRATEGY (3 templates - inactive)

| ID | Name | Complexity | Description |
|----|------|------------|-------------|
| `decision_framing` | Decision Framing | medium | Structure decision criteria |
| `option_exploration` | Option Exploration | medium | Explore available choices |
| `tradeoff_analysis` | Trade-off Analysis | high | Analyze trade-offs between options |

---

## Runner System

The Runner System maps templates to executable LangGraph workflows.

### Core Components

```
langgraph_workflows/modes34/
├── runners/
│   └── registry.py          # Template cache + graph factory mapping
├── unified_autonomous_workflow.py   # Master graph builder
├── research_quality.py      # 6 research enhancements
├── agent_selector.py        # GraphRAG Fusion selection
├── state.py                 # MissionState definition
└── wrappers/                # L2/L3/L4 delegation
```

### TemplateCache (registry.py)

```python
class TemplateCache:
    """In-memory cache for mission templates with TTL."""

    def __init__(self, ttl_seconds: int = 300):  # 5 minute default
        self._templates: Dict[str, Dict[str, Any]] = {}
        self._last_refresh: float = 0.0
        self._ttl = ttl_seconds

    @property
    def is_stale(self) -> bool:
        return (time.time() - self._last_refresh) > self._ttl
```

### Graph Factory Pattern

```python
# Default: All templates use the unified master graph
def get_graph_factory(template_id: str) -> Callable:
    """Get graph factory for a template."""

    # 1. Check custom builders first
    if template_id in CUSTOM_GRAPH_BUILDERS:
        return CUSTOM_GRAPH_BUILDERS[template_id]

    # 2. Check template metadata for custom builder
    template = _template_cache.get(template_id)
    if template:
        builder_name = template.get("metadata", {}).get("graph_builder")
        if builder_name in CUSTOM_GRAPH_BUILDERS:
            return CUSTOM_GRAPH_BUILDERS[builder_name]

    # 3. Default to master graph
    return build_master_graph
```

### Master Graph (11 Nodes)

```
┌─────────────────────────────────────────────────────────────────┐
│                    11-NODE STATEGRAPH                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  START                                                          │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────┐                                               │
│  │ initialize  │ ── Set defaults, reset counters               │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ decompose_query │ ── Break complex queries into sub-queries │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────┐                                                  │
│  │   plan   │ ── Create execution plan with steps              │
│  └────┬─────┘                                                  │
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────┐   (Mode 4 only)                               │
│  │ select_team │ ── GraphRAG Fusion agent selection            │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐◀────────────────────────────────┐            │
│  │ execute_step │ ── Run current step             │            │
│  └──────┬───────┘                                 │            │
│         │                                         │            │
│         ▼                                         │            │
│  ┌─────────────────┐                              │            │
│  │ confidence_gate │ ── Check confidence >= 0.8   │            │
│  └────────┬────────┘                              │            │
│           │                                       │            │
│     ┌─────┴─────┐                                 │            │
│     │ <0.8      │ >=0.8                           │            │
│     ▼           │                                 │            │
│  ┌───────────────┐                                │            │
│  │ refine_search │ ── Re-search (max 3x)  ────────┘            │
│  └───────────────┘                                              │
│           │ (if iterations exhausted)                           │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ verify_citations │ ── PubMed/CrossRef validation            │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────┐                                              │
│  │ quality_gate │ ── RACE/FACT metrics check                   │
│  └──────┬───────┘                                              │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ reflection_gate │ ── Self-review (Phase 2)                  │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────┐                                                  │
│  │ finalize │ ── Compile final response                        │
│  └────┬─────┘                                                  │
│       │                                                         │
│       ▼                                                         │
│     END                                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend File Structure

### Core Mode 3/4 Implementation

```
services/ai-engine/src/langgraph_workflows/modes34/
├── unified_autonomous_workflow.py   # 1,288 lines - Master 11-node graph
├── research_quality.py              # 2,130 lines - 6 Research Enhancements
├── agent_selector.py                #   359 lines - GraphRAG Fusion
├── state.py                         #    87 lines - MissionState TypedDict
├── __init__.py                      #   128 lines - Module exports
│
├── runners/
│   └── registry.py                  #   381 lines - Template cache + factories
│
├── wrappers/
│   ├── l2_wrapper.py                #   337 lines - L2 Expert delegation
│   ├── l3_wrapper.py                #   145 lines - L3 Specialist delegation
│   ├── l4_wrapper.py                #   184 lines - L4 Worker delegation
│   ├── l5_tool_mapper.py            #   644 lines - L5 Tool mapping
│   ├── registry.py                  #    52 lines - Wrapper registration
│   ├── utils.py                     #    12 lines - Utilities
│   └── __init__.py                  #    42 lines - Exports
│
└── complete_impl/
    └── l2_wrapper.py                #   490 lines - Full L2 streaming
```

### Total Lines of Code

| Component | Lines | Purpose |
|-----------|-------|---------|
| **unified_autonomous_workflow.py** | 1,288 | Master graph orchestration |
| **research_quality.py** | 2,130 | Research enhancements |
| **wrappers/** | 1,264 | Agent delegation (L2-L5) |
| **runners/registry.py** | 381 | Template loading |
| **agent_selector.py** | 359 | GraphRAG selection |
| **state.py + __init__.py** | 215 | State + exports |
| **complete_impl/** | 490 | Full implementations |
| **TOTAL** | **6,127** | Mode 3/4 backend |

---

## API Routes

### Mission Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/missions/stream` | POST | Start mission + stream SSE events |
| `/api/missions/checkpoint` | POST | Respond to HITL checkpoints |
| `/api/mode3/deep-research` | POST | Dedicated deep research endpoint |
| `/api/ask-expert/v2/missions/templates` | GET | List available templates |

### Request Schema (MissionStreamRequest)

```python
class MissionStreamRequest(BaseModel):
    mission_id: Optional[str]           # Client-provided ID
    mode: int                           # 3 or 4
    goal: str                           # Mission goal (10-5000 chars)
    title: Optional[str]                # Display title
    template_id: Optional[str]          # Template to use
    expert_id: Optional[str]            # Required for Mode 3
    budget_limit: Optional[float]       # Soft cap ($0-$1000)
    user_context: Dict[str, Any]        # Additional context
```

### SSE Events

| Event | Purpose |
|-------|---------|
| `plan` | Mission plan ready |
| `progress` | Step progress update |
| `thinking` | Agent thinking indicator |
| `reasoning` | Extended reasoning content |
| `token` | Streaming token |
| `agent_selected` | Agent selection (Mode 4) |
| `delegation` | L2/L3/L4 delegation |
| `checkpoint` | HITL checkpoint |
| `sources` | Citation sources |
| `done` | Mission complete |

---

## Extension Guide

### Adding a New Template

1. **Insert into database:**
```sql
INSERT INTO mission_templates (id, name, family, category, complexity, is_active)
VALUES ('my_template', 'My Template', 'STRATEGY', 'Strategy', 'medium', true);
```

2. **Template will auto-load** via TemplateCache (next refresh)

3. **Default behavior:** Uses `build_master_graph()` (unified workflow)

### Adding a Custom Graph Builder

1. **Create builder function:**
```python
# In langgraph_workflows/modes34/custom_graphs/my_graph.py
def build_my_custom_graph() -> CompiledStateGraph:
    graph = StateGraph(MissionState)
    # ... custom nodes ...
    return graph.compile(checkpointer=_get_checkpointer())
```

2. **Register in registry.py:**
```python
from .custom_graphs.my_graph import build_my_custom_graph

CUSTOM_GRAPH_BUILDERS: Dict[str, Callable] = {
    "my_template": build_my_custom_graph,
}
```

3. **Or via template metadata:**
```sql
UPDATE mission_templates
SET metadata = '{"graph_builder": "my_template"}'
WHERE id = 'my_template';
```

### Adding a New Family

1. **Define family characteristics** (documentation)
2. **Create templates** with new family value
3. **Optionally create** custom graph builder for family
4. **Update this document** with family details

---

## References

- **Production Code:** `services/ai-engine/src/langgraph_workflows/modes34/`
- **API Routes:** `services/ai-engine/src/api/routes/missions.py`
- **Database Table:** `mission_templates` (Supabase)
- **Unified Overview:** `docs/architecture/ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-13 | Initial documentation |
