# VITAL AI Engine: Gold Standard Backend Architecture
## Current State Analysis & Migration Roadmap

**Version:** 1.0
**Date:** December 2025
**Status:** CANONICAL - Reference for all backend restructuring

---

# Executive Summary

This document provides a comprehensive analysis of the current AI engine backend structure and defines the migration path to the world-class 8-layer architecture. It serves as the authoritative reference for:

1. **Current State** - What exists today (709 Python files, 256 directories)
2. **Target State** - The gold standard 8-layer architecture
3. **Gap Analysis** - What's missing, redundant, or misplaced
4. **Migration Plan** - Step-by-step restructuring guide

---

# Part 1: Current State Analysis

## 1.1 Directory Structure Overview

```
/services/ai-engine/src/           # 709 Python files, 256 directories
├── agents/                        # Agent-related code
├── api/                           # API layer (69 files)
│   ├── graphql/
│   ├── middleware/                # 4 files
│   ├── routers/
│   ├── routes/                    # 28 files
│   ├── schemas/                   # 8 files
│   └── sse/                       # 4 files
├── config/                        # Configuration
├── core/                          # Cross-cutting concerns (18 files)
├── data/                          # Data layer
├── domain/                        # Domain layer (exists but incomplete)
│   ├── entities/                  # 2 files
│   ├── events/                    # 3 files
│   ├── services/                  # 3 files
│   └── value_objects/             # 3 files
├── fusion/                        # Data fusion
├── graphrag/                      # GraphRAG implementation (21 files)
│   ├── api/
│   ├── clients/
│   └── search/
├── infrastructure/                # Infrastructure layer (exists but minimal)
│   ├── database/                  # 5 files
│   ├── external/                  # Empty
│   ├── llm/                       # 6 files
│   └── queue/                     # Empty
├── integrations/                  # External integrations
├── langgraph_compilation/         # LangGraph compilation
├── langgraph_workflows/           # ⭐ Main workflow layer (200+ files)
│   ├── ask_expert/                # 7 files
│   ├── ask_panel_enhanced/        # 3 files
│   ├── modes34/                   # Mode 3/4 implementation
│   │   ├── runners/               # 8 FAMILY RUNNERS
│   │   ├── resilience/            # 4 files
│   │   ├── templates/             # 11 files
│   │   ├── validation/            # 4 files
│   │   └── wrappers/              # 8 files
│   ├── shared/                    # 3 files
│   └── task_runners/              # 132 COGNITIVE RUNNERS (22 categories)
├── middleware/                    # Middleware (duplicate location?)
├── models/                        # Data models
├── modules/                       # Feature modules
│   ├── ask_expert/                # 3 files
│   ├── companion/                 # Empty
│   ├── execution/                 # 5 files
│   ├── expert/                    # 11 files
│   ├── knowledge/                 # Empty
│   ├── ontology/                  # Empty
│   ├── panels/                    # 5 files
│   ├── solutions/                 # Empty
│   └── translator/                # 7 files (ReactFlow → LangGraph)
├── monitoring/                    # Monitoring
├── protocols/                     # Protocol definitions
├── repositories/                  # Repository layer
├── runners/                       # ❌ Partial facade (19 files)
│   ├── core/
│   └── pharma/
├── scripts/                       # Utility scripts
├── services/                      # ❌ FLAT SERVICE LAYER (80+ files!)
├── streaming/                     # Streaming (5 files)
├── tests/                         # Test files
├── tools/                         # LLM tools (5 files)
├── utils/                         # Utilities
├── vital_shared/                  # Shared kernel (empty subdirs)
├── vital_shared_kernel/           # Shared kernel alt
├── workers/                       # Background workers (3 files)
│   └── tasks/                     # 7 files
└── workflows/                     # Workflows (duplicate location?)
```

## 1.2 Key Metrics

| Category | Count | Notes |
|----------|-------|-------|
| Total Python files | 709 | |
| Total directories | 256 | |
| Family Runners | 8 | In `modes34/runners/` |
| Cognitive Runners | 132 | In `task_runners/` (22 categories) |
| Flat Service Files | 80 | ❌ Needs reorganization |
| API Routes | 28 | Well organized |
| Translator Module | 7 | ReactFlow → LangGraph |

## 1.3 Runner Location Analysis

### Current Runner Locations

| Location | Type | Count | Status |
|----------|------|-------|--------|
| `langgraph_workflows/modes34/runners/` | Family | 8 | ✅ Active |
| `langgraph_workflows/task_runners/` | Cognitive | 132 | ✅ Active |
| `runners/` | Facade | 19 | ⚠️ Partial |
| `runners/pharma/` | Pharma | ~10 | ⚠️ Incomplete |

### Family Runners (8)

```
langgraph_workflows/modes34/runners/
├── base_family_runner.py          # Base class
├── deep_research_runner.py        # RESEARCH family
├── strategy_runner.py             # STRATEGY family
├── evaluation_runner.py           # EVALUATION family
├── investigation_runner.py        # INVESTIGATION family
├── problem_solving_runner.py      # PROBLEM_SOLVING family
├── communication_runner.py        # COMMUNICATION family
├── monitoring_runner.py           # MONITORING family
├── generic_runner.py              # GENERIC fallback
├── registry.py                    # Runner registry
└── output_validation.py           # Output validation
```

### Cognitive Runner Categories (22)

```
langgraph_workflows/task_runners/
├── adapt/          # Transformation
├── align/          # Consensus building
├── create/         # Content generation
├── decide/         # Decision making
├── design/         # Structure design
├── discover/       # Opportunity finding
├── engage/         # Stakeholder engagement
├── evaluate/       # Quality assessment
├── execute/        # Operations
├── govern/         # Compliance
├── influence/      # Persuasion
├── investigate/    # Causal analysis
├── plan/           # Planning
├── predict/        # Forecasting
├── prepare/        # Readiness
├── refine/         # Optimization
├── secure/         # Security
├── solve/          # Problem resolution
├── synthesize/     # Integration
├── understand/     # Knowledge acquisition
├── validate/       # Verification (missing?)
└── watch/          # Monitoring (missing?)
```

---

# Part 2: Gap Analysis

## 2.1 Critical Gaps

### GAP-1: Flat Services Directory (CRITICAL)

**Current:** 80+ service files directly in `services/`
**Target:** Organized by domain (ask_expert/, ask_panel/, workflows/, etc.)

```
Current (FLAT):                    Target (ORGANIZED):
services/                          services/
├── ab_testing_framework.py        ├── ask_expert/
├── agent_db_skills_service.py     │   ├── service.py
├── agent_enrichment_service.py    │   ├── mode_router.py
├── agent_hierarchy_service.py     │   └── modes/
├── agent_instantiation_service.py ├── ask_panel/
├── agent_orchestrator.py          │   ├── service.py
├── agent_pool_manager.py          │   └── orchestrator.py
├── agent_service.py               ├── agents/
├── ... (72 more files)            │   ├── enrichment_service.py
                                   │   ├── hierarchy_service.py
                                   │   └── instantiation_service.py
                                   └── shared/
                                       ├── cache_manager.py
                                       └── cost_tracker.py
```

### GAP-2: Missing Orchestration Layer

**Current:** No `orchestration/` directory
**Target:** 8 orchestration patterns + execution engine

```
Target: orchestration/
├── patterns/
│   ├── sequential.py              # Pattern 1
│   ├── fan_out_fan_in.py          # Pattern 2
│   ├── monitoring_loop.py         # Pattern 3
│   ├── conditional.py             # Pattern 4
│   ├── iterative_refinement.py    # Pattern 5
│   ├── generator_critic.py        # Pattern 6
│   ├── saga.py                    # Pattern 7
│   └── event_driven.py            # Pattern 8
├── execution/
│   ├── mission_executor.py
│   ├── workflow_engine.py
│   └── task_executor.py
├── hitl/
│   └── approval_handler.py
└── state/
    ├── schemas.py
    └── reducers.py
```

### GAP-3: Missing Libraries Layer

**Current:** No `libraries/` directory
**Target:** Task Formula assets (prompts, skills, knowledge)

```
Target: libraries/
├── prompts/
│   ├── loader.py
│   ├── composer.py
│   └── templates/
│       ├── agents/
│       └── runners/
├── skills/
│   ├── loader.py
│   └── definitions/
├── knowledge/
│   ├── retriever.py
│   └── domains/
└── workflows/
    ├── loader.py
    └── templates/
```

### GAP-4: Scattered Runner Locations

**Current:** Runners in 3 different locations
**Target:** All runners in unified `runners/` directory

```
Current:                           Target:
langgraph_workflows/               runners/
├── modes34/runners/  (8)          ├── base/
├── task_runners/     (132)        ├── families/      (8)
runners/              (19)         ├── cognitive/     (132)
                                   └── pharma/        (119)
```

### GAP-5: Incomplete Domain Layer

**Current:** Domain layer exists but minimal (11 files)
**Target:** Full DDD domain layer with entities, value objects, events

```
Current:                           Target:
domain/                            domain/
├── entities/      (2 files)       ├── entities/
├── events/        (3 files)       │   ├── agent.py
├── services/      (3 files)       │   ├── mission.py
└── value_objects/ (3 files)       │   ├── panel.py
                                   │   ├── skill.py
                                   │   ├── task.py
                                   │   └── workflow.py
                                   ├── value_objects/
                                   │   ├── runner_input.py
                                   │   ├── runner_output.py
                                   │   └── execution_context.py
                                   └── events/
                                       ├── mission_events.py
                                       └── workflow_events.py
```

### GAP-6: Incomplete Infrastructure Layer

**Current:** Infrastructure layer has empty directories
**Target:** Full infrastructure with adapters

```
Current:                           Target:
infrastructure/                    infrastructure/
├── database/      (5 files)       ├── database/
├── external/      (empty)         │   ├── connection.py
├── llm/           (6 files)       │   └── repositories/
└── queue/         (empty)         ├── llm/
                                   │   ├── provider.py
                                   │   ├── openai_client.py
                                   │   └── anthropic_client.py
                                   ├── vector_stores/
                                   │   ├── pinecone_client.py
                                   │   └── pgvector_client.py
                                   ├── graph/
                                   │   └── neo4j_client.py
                                   ├── cache/
                                   │   └── redis_client.py
                                   └── messaging/
                                       └── task_queue.py
```

## 2.2 Redundancies

| Item | Locations | Resolution |
|------|-----------|------------|
| Middleware | `api/middleware/` + `middleware/` | Consolidate to `api/middleware/` |
| Workflows | `langgraph_workflows/` + `workflows/` | Consolidate to `langgraph_workflows/` |
| Runners | 3 locations | Consolidate to `runners/` |
| Services | `services/` + `domain/services/` | Separate concerns |

---

# Part 3: Target Architecture (Gold Standard)

## 3.1 The 8-Layer Architecture

```
src/
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 1: RUNNERS (The Cognitive Operations)
│   ═══════════════════════════════════════════════════════════════════
│
├── runners/                            # 215+ Total Runners
│   ├── __init__.py
│   ├── registry.py                     # UnifiedRunnerRegistry
│   │
│   ├── base/                           # Abstract base classes
│   │   ├── task_runner.py              # TaskRunner[InputT, OutputT]
│   │   ├── family_runner.py            # BaseFamilyRunner[StateT]
│   │   └── mixins.py                   # Streaming, HITL mixins
│   │
│   ├── families/                       # 8 Family Runners
│   │   ├── deep_research.py
│   │   ├── strategy.py
│   │   ├── evaluation.py
│   │   ├── investigation.py
│   │   ├── problem_solving.py
│   │   ├── communication.py
│   │   ├── monitoring.py
│   │   └── generic.py
│   │
│   ├── cognitive/                      # 88+ Task Runners (22 categories)
│   │   ├── understand/
│   │   ├── evaluate/
│   │   ├── decide/
│   │   ├── create/
│   │   ├── synthesize/
│   │   ├── validate/
│   │   ├── plan/
│   │   ├── watch/
│   │   ├── investigate/
│   │   ├── solve/
│   │   ├── prepare/
│   │   ├── refine/
│   │   ├── predict/
│   │   ├── engage/
│   │   ├── align/
│   │   ├── influence/
│   │   ├── adapt/
│   │   ├── discover/
│   │   ├── design/
│   │   ├── govern/
│   │   ├── execute/
│   │   └── secure/
│   │
│   └── pharma/                         # 119 Pharma-specific Runners
│       ├── foresight/
│       ├── brand_strategy/
│       ├── digital_health/
│       ├── medical_affairs/
│       ├── market_access/
│       └── design_thinking/
│
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 2: LIBRARIES (Task Formula Assets)
│   ═══════════════════════════════════════════════════════════════════
│
├── libraries/
│   ├── prompts/                        # WHO - Agent Prompts
│   │   ├── loader.py
│   │   ├── composer.py
│   │   └── templates/
│   ├── skills/                         # HOW - Skill Definitions
│   │   ├── loader.py
│   │   └── definitions/
│   ├── knowledge/                      # WITH - Knowledge Domains
│   │   ├── retriever.py
│   │   └── domains/
│   └── workflows/                      # Workflow Templates
│       ├── loader.py
│       └── templates/
│
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 3: ORCHESTRATION (8 Patterns + Execution)
│   ═══════════════════════════════════════════════════════════════════
│
├── orchestration/
│   ├── patterns/                       # 8 Orchestration Patterns
│   │   ├── base_pattern.py
│   │   ├── sequential.py
│   │   ├── fan_out_fan_in.py
│   │   ├── monitoring_loop.py
│   │   ├── conditional.py
│   │   ├── iterative_refinement.py
│   │   ├── generator_critic.py
│   │   ├── saga.py
│   │   └── event_driven.py
│   ├── execution/                      # Workflow Execution
│   │   ├── mission_executor.py
│   │   ├── workflow_engine.py
│   │   └── task_executor.py
│   ├── hitl/                           # Human-in-the-Loop
│   │   └── approval_handler.py
│   └── state/                          # State Management
│       ├── schemas.py
│       └── reducers.py
│
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 4: SERVICES (Business Logic)
│   ═══════════════════════════════════════════════════════════════════
│
├── services/
│   ├── ask_expert/                     # Ask Expert Service (Modes 1-4)
│   │   ├── service.py
│   │   ├── mode_router.py
│   │   ├── agent_selector.py
│   │   └── modes/
│   │       ├── mode1_interactive.py
│   │       ├── mode2_auto_select.py
│   │       ├── mode3_deep_research.py
│   │       └── mode4_background.py
│   ├── ask_panel/                      # Ask Panel Service
│   │   ├── service.py
│   │   ├── orchestrator.py
│   │   └── synthesizer.py
│   ├── agents/                         # Agent Services
│   │   ├── enrichment_service.py
│   │   ├── hierarchy_service.py
│   │   └── instantiation_service.py
│   ├── workflows/                      # Workflow Service
│   │   ├── service.py
│   │   └── template_service.py
│   ├── solutions/                      # Solution Service
│   │   └── service.py
│   └── shared/                         # Shared Service Utilities
│       ├── cache_manager.py
│       ├── cost_tracker.py
│       └── quality_checker.py
│
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 5: DOMAIN (Core Entities)
│   ═══════════════════════════════════════════════════════════════════
│
├── domain/
│   ├── entities/
│   │   ├── agent.py
│   │   ├── mission.py
│   │   ├── panel.py
│   │   ├── skill.py
│   │   ├── task.py
│   │   └── workflow.py
│   ├── value_objects/
│   │   ├── runner_input.py
│   │   ├── runner_output.py
│   │   └── execution_context.py
│   └── events/
│       ├── mission_events.py
│       └── workflow_events.py
│
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 6: INFRASTRUCTURE (External Dependencies)
│   ═══════════════════════════════════════════════════════════════════
│
├── infrastructure/
│   ├── database/
│   │   ├── connection.py
│   │   └── repositories/
│   ├── llm/
│   │   ├── provider.py
│   │   ├── openai_client.py
│   │   └── anthropic_client.py
│   ├── vector_stores/
│   │   ├── pinecone_client.py
│   │   └── pgvector_client.py
│   ├── graph/
│   │   └── neo4j_client.py
│   ├── cache/
│   │   └── redis_client.py
│   └── messaging/
│       └── task_queue.py
│
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 7: API (HTTP Endpoints)
│   ═══════════════════════════════════════════════════════════════════
│
├── api/
│   ├── main.py
│   ├── routes/
│   │   ├── health.py
│   │   ├── ask_expert.py
│   │   ├── ask_panel.py
│   │   ├── missions.py
│   │   ├── workflows.py
│   │   └── streaming.py
│   ├── middleware/
│   │   ├── auth.py
│   │   └── tenant.py
│   ├── schemas/
│   │   ├── request/
│   │   └── response/
│   └── dependencies/
│
├── ═══════════════════════════════════════════════════════════════════
│   LAYER 8: MODULES (Workflow Designer Translation)
│   ═══════════════════════════════════════════════════════════════════
│
└── modules/
    └── translator/                     # ReactFlow → LangGraph
        ├── parser.py
        ├── validator.py
        ├── registry.py
        ├── compiler.py
        └── exceptions.py
```

---

# Part 4: Migration Plan

## 4.1 Migration Phases

### Phase 1: Create New Layer Structure (Non-breaking)

```bash
# Create new directories without moving files
mkdir -p src/runners/{base,families,cognitive,pharma}
mkdir -p src/libraries/{prompts,skills,knowledge,workflows}
mkdir -p src/orchestration/{patterns,execution,hitl,state}
```

**Files to Create:**
- `src/runners/__init__.py` - Registry re-exports
- `src/libraries/__init__.py` - Library exports
- `src/orchestration/__init__.py` - Pattern exports

### Phase 2: Consolidate Runners (High Priority)

```python
# Migration mapping for runners
RUNNER_MIGRATION = {
    # Family runners
    "langgraph_workflows/modes34/runners/deep_research_runner.py":
        "runners/families/deep_research.py",
    "langgraph_workflows/modes34/runners/strategy_runner.py":
        "runners/families/strategy.py",
    # ... (repeat for all 8)

    # Cognitive runners (22 categories)
    "langgraph_workflows/task_runners/understand/":
        "runners/cognitive/understand/",
    "langgraph_workflows/task_runners/evaluate/":
        "runners/cognitive/evaluate/",
    # ... (repeat for all 22)
}
```

**Update imports:**
```python
# Old
from langgraph_workflows.modes34.runners import DeepResearchRunner

# New
from runners.families import DeepResearchRunner
```

### Phase 3: Reorganize Services (Medium Priority)

```python
# Migration mapping for services
SERVICE_MIGRATION = {
    # Agent services
    "services/agent_enrichment_service.py":
        "services/agents/enrichment_service.py",
    "services/agent_hierarchy_service.py":
        "services/agents/hierarchy_service.py",
    "services/agent_instantiation_service.py":
        "services/agents/instantiation_service.py",

    # Shared services
    "services/cache_manager.py":
        "services/shared/cache_manager.py",
    "services/confidence_calculator.py":
        "services/shared/confidence_calculator.py",

    # Ask Expert services
    "services/autonomous_controller.py":
        "services/ask_expert/autonomous_controller.py",
}
```

### Phase 4: Create Orchestration Layer (Medium Priority)

**Extract from existing code:**
- `core/parallel.py` → `orchestration/patterns/fan_out_fan_in.py`
- `core/reducers.py` → `orchestration/state/reducers.py`
- `langgraph_workflows/state_schemas.py` → `orchestration/state/schemas.py`

**Create new pattern files:**
```python
# orchestration/patterns/base_pattern.py
class BaseOrchestrationPattern(ABC):
    """Abstract base for orchestration patterns."""

    @abstractmethod
    async def execute(self, workflow_state: WorkflowState) -> WorkflowState:
        pass

# orchestration/patterns/sequential.py
class SequentialPattern(BaseOrchestrationPattern):
    """Pattern 1: Sequential Pipeline"""
    pass

# ... (repeat for all 8 patterns)
```

### Phase 5: Create Libraries Layer (Lower Priority)

**Extract from existing code:**
- Prompt templates from various services
- Skill definitions from modules/
- Knowledge retrieval from graphrag/

### Phase 6: Complete Infrastructure Layer (Lower Priority)

**Move existing code:**
- `graphrag/clients/` → `infrastructure/graph/`
- `core/caching.py` → `infrastructure/cache/`

---

# Part 5: Service Classification

## 5.1 Current Services (80 files) → Target Organization

| Current File | Target Location | Category |
|-------------|-----------------|----------|
| `ab_testing_framework.py` | `services/shared/ab_testing.py` | Shared |
| `agent_db_skills_service.py` | `services/agents/db_skills.py` | Agents |
| `agent_enrichment_service.py` | `services/agents/enrichment.py` | Agents |
| `agent_hierarchy_service.py` | `services/agents/hierarchy.py` | Agents |
| `agent_instantiation_service.py` | `services/agents/instantiation.py` | Agents |
| `agent_orchestrator.py` | `services/agents/orchestrator.py` | Agents |
| `agent_pool_manager.py` | `services/agents/pool_manager.py` | Agents |
| `agent_service.py` | `services/agents/service.py` | Agents |
| `agent_usage_tracker.py` | `services/shared/usage_tracker.py` | Shared |
| `artifact_generator.py` | `services/ask_expert/artifact_generator.py` | Ask Expert |
| `ask_panel_config.py` | `services/ask_panel/config.py` | Ask Panel |
| `autonomous_controller.py` | `services/ask_expert/autonomous_controller.py` | Ask Expert |
| `autonomous_enhancements.py` | `services/ask_expert/enhancements.py` | Ask Expert |
| `cache_manager.py` | `services/shared/cache_manager.py` | Shared |
| `checkpoint_store.py` | `orchestration/state/checkpoint_store.py` | Orchestration |
| `citation_prompt_enhancer.py` | `libraries/prompts/citation_enhancer.py` | Libraries |
| `comparison_matrix_builder.py` | `services/ask_panel/comparison_matrix.py` | Ask Panel |
| `compliance_service.py` | `services/shared/compliance.py` | Shared |
| `confidence_calculator.py` | `services/shared/confidence.py` | Shared |
| `consensus_analyzer.py` | `services/ask_panel/consensus_analyzer.py` | Ask Panel |
| `consensus_calculator.py` | `services/ask_panel/consensus_calculator.py` | Ask Panel |
| `conversation_history_analyzer.py` | `services/ask_expert/history_analyzer.py` | Ask Expert |
| `conversation_manager.py` | `services/shared/conversation_manager.py` | Shared |
| `copyright_checker.py` | `services/shared/copyright_checker.py` | Shared |
| `data_sanitizer.py` | `services/shared/data_sanitizer.py` | Shared |

## 5.2 Service Categories Summary

| Category | File Count | Target Directory |
|----------|------------|------------------|
| Agents | 8 | `services/agents/` |
| Ask Expert | 6 | `services/ask_expert/` |
| Ask Panel | 5 | `services/ask_panel/` |
| Workflows | 3 | `services/workflows/` |
| Shared | 15 | `services/shared/` |
| Libraries | 5 | `libraries/` |
| Orchestration | 3 | `orchestration/` |
| Other | ~35 | To be classified |

---

# Part 6: Dependency Graph

## 6.1 Layer Dependencies (Allowed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LAYER DEPENDENCY RULES                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Layer 7: API                                                            │
│      ↓ depends on                                                        │
│  Layer 4: Services                                                       │
│      ↓ depends on                                                        │
│  Layer 3: Orchestration                                                  │
│      ↓ depends on                                                        │
│  Layer 1: Runners + Layer 2: Libraries                                   │
│      ↓ depends on                                                        │
│  Layer 5: Domain                                                         │
│      ↓ depends on                                                        │
│  Layer 6: Infrastructure                                                 │
│                                                                          │
│  Layer 8: Modules (can depend on any layer for translation)              │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                           DEPENDENCY RULES                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ ALLOWED:                                                             │
│  - Higher layers → Lower layers                                          │
│  - Services → Orchestration → Runners                                    │
│  - Any layer → Domain                                                    │
│  - Any layer → Infrastructure (via interfaces)                           │
│                                                                          │
│  ❌ FORBIDDEN:                                                           │
│  - Lower layers → Higher layers                                          │
│  - Runners → Services                                                    │
│  - Domain → Services                                                     │
│  - Infrastructure → Services                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Import Examples

```python
# ✅ CORRECT: API imports Services
# api/routes/missions.py
from services.ask_expert import AskExpertService

# ✅ CORRECT: Services imports Orchestration
# services/ask_expert/service.py
from orchestration.patterns import SequentialPattern
from orchestration.execution import MissionExecutor

# ✅ CORRECT: Orchestration imports Runners
# orchestration/execution/mission_executor.py
from runners.families import DeepResearchRunner
from runners.cognitive.evaluate import CritiqueRunner

# ✅ CORRECT: Runners imports Domain
# runners/families/deep_research.py
from domain.entities import Mission
from domain.value_objects import RunnerInput, RunnerOutput

# ❌ WRONG: Runners imports Services
# runners/families/deep_research.py
from services.cache_manager import CacheManager  # ❌ FORBIDDEN

# ❌ WRONG: Domain imports Services
# domain/entities/mission.py
from services.autonomous_controller import ...  # ❌ FORBIDDEN
```

---

# Part 7: Migration Commands

## 7.1 Phase 1: Create Structure

```bash
# Create new layer directories
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine/src

# Layer 1: Runners
mkdir -p runners/{base,families,cognitive,pharma}
mkdir -p runners/cognitive/{understand,evaluate,decide,create,synthesize,validate,plan,watch,investigate,solve,prepare,refine,predict,engage,align,influence,adapt,discover,design,govern,execute,secure}

# Layer 2: Libraries
mkdir -p libraries/{prompts/templates,skills/definitions,knowledge/domains,workflows/templates}

# Layer 3: Orchestration
mkdir -p orchestration/{patterns,execution,hitl,state}

# Layer 4: Services (reorganize)
mkdir -p services/{ask_expert/modes,ask_panel,agents,workflows,solutions,shared}
```

## 7.2 Phase 2: Move Runners

```bash
# Move family runners
mv langgraph_workflows/modes34/runners/deep_research_runner.py runners/families/deep_research.py
mv langgraph_workflows/modes34/runners/strategy_runner.py runners/families/strategy.py
mv langgraph_workflows/modes34/runners/evaluation_runner.py runners/families/evaluation.py
mv langgraph_workflows/modes34/runners/investigation_runner.py runners/families/investigation.py
mv langgraph_workflows/modes34/runners/problem_solving_runner.py runners/families/problem_solving.py
mv langgraph_workflows/modes34/runners/communication_runner.py runners/families/communication.py
mv langgraph_workflows/modes34/runners/monitoring_runner.py runners/families/monitoring.py
mv langgraph_workflows/modes34/runners/generic_runner.py runners/families/generic.py
mv langgraph_workflows/modes34/runners/base_family_runner.py runners/base/family_runner.py

# Move cognitive runners (each category)
for category in understand evaluate decide create synthesize validate plan watch investigate solve prepare refine predict engage align influence adapt discover design govern execute secure; do
    if [ -d "langgraph_workflows/task_runners/$category" ]; then
        mv langgraph_workflows/task_runners/$category/* runners/cognitive/$category/
    fi
done
```

## 7.3 Update Script Template

```python
#!/usr/bin/env python3
"""
Migration script for updating imports after restructuring.
Run from: /services/ai-engine/src/
"""
import os
import re
from pathlib import Path

# Import mappings
IMPORT_MAPPINGS = {
    # Family runners
    r"from langgraph_workflows\.modes34\.runners import (\w+)":
        r"from runners.families import \1",
    r"from langgraph_workflows\.modes34\.runners\.(\w+) import":
        r"from runners.families.\1 import",

    # Cognitive runners
    r"from langgraph_workflows\.task_runners\.(\w+) import":
        r"from runners.cognitive.\1 import",

    # Base classes
    r"from langgraph_workflows\.modes34\.runners\.base_family_runner import":
        r"from runners.base.family_runner import",
}

def update_imports(file_path: Path) -> bool:
    """Update imports in a single file."""
    content = file_path.read_text()
    modified = False

    for pattern, replacement in IMPORT_MAPPINGS.items():
        new_content, count = re.subn(pattern, replacement, content)
        if count > 0:
            content = new_content
            modified = True

    if modified:
        file_path.write_text(content)
        print(f"Updated: {file_path}")

    return modified

def main():
    """Run migration on all Python files."""
    src_dir = Path(".")
    updated = 0

    for py_file in src_dir.rglob("*.py"):
        if update_imports(py_file):
            updated += 1

    print(f"\nTotal files updated: {updated}")

if __name__ == "__main__":
    main()
```

---

# Part 8: Verification Checklist

## 8.1 Post-Migration Verification

- [ ] All imports resolve correctly
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] API endpoints work
- [ ] Streaming works
- [ ] Mode 3 deep research works
- [ ] Mode 4 background missions work
- [ ] Ask Panel works
- [ ] Workflow designer translation works

## 8.2 Layer Compliance Check

```python
# Verify no forbidden imports
# Run: python -m scripts.verify_layer_compliance

FORBIDDEN_IMPORTS = {
    "runners/": ["services/", "api/"],
    "domain/": ["services/", "api/", "orchestration/"],
    "infrastructure/": ["services/", "api/", "orchestration/"],
}
```

---

# Related Documentation

| Document | Purpose |
|----------|---------|
| `WORLD_CLASS_PROJECT_STRUCTURE.md` | Target architecture definition |
| `RUNNER_PACKAGE_ARCHITECTURE.md` | 13-component runner package |
| `TASK_COMPOSITION_ARCHITECTURE.md` | 8 orchestration patterns |
| `WORKFLOW_DESIGNER_RUNNER_INTEGRATION.md` | ReactFlow integration |

---

**Version History:**
- v1.0 (December 2025): Initial gold standard architecture document

---

*End of Document*
