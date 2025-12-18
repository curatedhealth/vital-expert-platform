# Ontology-Driven Backend Structure Analysis

> **Version**: 1.1.0
> **Created**: December 17, 2025
> **Updated**: December 17, 2025
> **Status**: Analysis Complete

## Related Documents

| Document | Description |
|----------|-------------|
| [UNIFIED_AI_COMPANION_SERVICE.md](./UNIFIED_AI_COMPANION_SERVICE.md) | Unified AI Companion architecture |
| [UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md](./UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md) | AI Companion backend code structure |
| [UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md](./UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md) | AI Companion ontology integration |
| [BACKEND_SERVICE_REORGANIZATION.md](./BACKEND_SERVICE_REORGANIZATION.md) | Detailed migration guide for 85 files |

---

## Executive Summary

This document analyzes how the 8-layer Enterprise Ontology model should inform the VITAL backend project structure. The goal is to align the codebase organization with the semantic architecture that powers the platform, ensuring consistency between data models and service implementations.

---

## Part 1: Current State Analysis

### 1.1 Existing Backend Structure (709 Python Files)

```
services/ai-engine/src/
├── agents/                    # Agent hierarchy (l1-l5)
│   ├── l1_orchestrators/      # Top-level orchestration
│   ├── l2_experts/            # Domain experts
│   ├── l3_specialists/        # Specialized agents
│   ├── l4_workers/            # Task workers
│   └── l5_tools/              # Tool implementations
├── api/                       # API layer
│   ├── routes/                # FastAPI routes (30 files)
│   ├── routers/enterprise_ontology/  # Ontology endpoints
│   ├── schemas/               # Request/response schemas
│   └── middleware/            # API middleware
├── core/                      # Core utilities (20 files)
│   ├── caching.py             # Cache management
│   ├── config.py              # Configuration
│   ├── security.py            # Security utilities
│   └── streaming.py           # Streaming support
├── domain/                    # Domain-driven design
│   ├── entities/              # Domain entities
│   ├── events/                # Domain events
│   ├── services/              # Domain services
│   └── value_objects/         # Value objects
├── graphrag/                  # GraphRAG implementation
│   ├── clients/               # External clients
│   ├── search/                # Search strategies
│   └── api/                   # GraphRAG endpoints
├── infrastructure/            # External integrations
│   ├── database/              # DB repositories
│   ├── llm/                   # LLM providers
│   └── external/              # External services
├── langgraph_workflows/       # LangGraph workflows
│   ├── ask_expert/            # Mode 1/2 workflows
│   ├── modes34/               # Mode 3/4 autonomous
│   ├── task_runners/          # Task runner implementations
│   └── shared/                # Shared workflow utilities
├── modules/                   # Feature modules
│   ├── ask_expert/            # Ask Expert module
│   ├── companion/             # AI Companion (empty)
│   ├── execution/             # Execution module
│   ├── expert/                # Expert module
│   ├── knowledge/             # Knowledge module (empty)
│   ├── ontology/              # Ontology module (empty)
│   ├── panels/                # Panel module
│   ├── solutions/             # Solutions module (empty)
│   └── translator/            # Translator module
├── runners/                   # Task runners
│   ├── core/                  # Core runners
│   └── pharma/                # Pharma-specific runners
├── services/                  # Business services (85 files)
│   ├── agent_*.py             # Agent services
│   ├── graphrag_*.py          # GraphRAG services
│   ├── *_service.py           # Various services
│   └── knowledge/             # Knowledge services
├── streaming/                 # SSE streaming
├── tools/                     # Tool implementations
├── vital_shared/              # Shared utilities
└── workers/                   # Background workers
```

### 1.2 Detailed Component Mapping

#### Agents (60+ files)

```
agents/
├── base_agent.py                    # Base agent class
├── clinical_researcher.py           # Concrete agent implementation
├── medical_specialist.py            # Concrete agent implementation
├── regulatory_expert.py             # Concrete agent implementation
│
├── l1_orchestrators/                # Top-level orchestration agents
│   └── (orchestration logic)
│
├── l2_experts/                      # Domain expert agents
│   └── (domain expertise)
│
├── l3_specialists/                  # Specialized agents
│   └── (specialized tasks)
│
├── l4_workers/                      # Task worker agents (27 files)
│   ├── l4_clinical.py
│   ├── l4_regulatory.py
│   ├── l4_heor.py
│   ├── l4_commercial.py
│   ├── l4_digital_health.py
│   ├── l4_evidence.py
│   ├── l4_data.py
│   └── ... (19 more workers)
│
└── l5_tools/                        # Tool implementations (23 files)
    └── (tool wrappers)
```

#### Runners (3 locations - FRAGMENTED)

**Location 1: `runners/` (Framework + Domain)**
```
runners/
├── base.py                          # BaseRunner class
├── executor.py                      # Runner execution logic
├── assembler.py                     # Runner assembly
├── registry.py                      # Runner registration
│
├── core/                            # Core runners (generic)
│   ├── critique.py                  # Critique runner
│   ├── decompose.py                 # Decomposition runner
│   ├── investigate.py               # Investigation runner
│   ├── recommend.py                 # Recommendation runner
│   ├── synthesize.py                # Synthesis runner
│   └── validate.py                  # Validation runner
│
└── pharma/                          # Pharma-specific runners
    ├── brand_strategy.py
    ├── market_access.py
    ├── medical_affairs.py
    ├── digital_health.py
    ├── design_thinking.py
    └── foresight.py
```

**Location 2: `langgraph_workflows/task_runners/` (28 families)**
```
langgraph_workflows/task_runners/
├── base_task_runner.py              # Base class for task runners
├── registry.py                      # Task runner registry
├── unified_registry.py              # Unified registration
│
├── families/                        # Runner family definitions
│
├── investigate/                     # INVESTIGATE family
├── synthesize/                      # SYNTHESIZE family
├── validate/                        # VALIDATE family
├── create/                          # CREATE family
├── design/                          # DESIGN family
├── evaluate/                        # EVALUATE family
├── plan/                            # PLAN family
├── execute/                         # EXECUTE family
├── discover/                        # DISCOVER family
├── adapt/                           # ADAPT family
├── align/                           # ALIGN family
├── decide/                          # DECIDE family
├── engage/                          # ENGAGE family
├── govern/                          # GOVERN family
├── influence/                       # INFLUENCE family
├── predict/                         # PREDICT family
├── prepare/                         # PREPARE family
├── refine/                          # REFINE family
├── secure/                          # SECURE family
├── solve/                           # SOLVE family
├── understand/                      # UNDERSTAND family
└── watch/                           # WATCH family
```

**Location 3: `langgraph_workflows/modes34/runners/` (Mode-specific)**
```
langgraph_workflows/modes34/runners/
└── (Mode 3/4 specific runners for autonomous workflows)
```

#### Workflows (2 locations)

**Location 1: `workflows/` (Legacy)**
```
workflows/
└── simple_panel_workflow.py         # Legacy panel workflow
```

**Location 2: `langgraph_workflows/` (Current - Main)**
```
langgraph_workflows/
├── base_workflow.py                 # Base LangGraph workflow class
├── checkpoint_manager.py            # State persistence
├── state_schemas.py                 # Workflow state definitions
├── observability.py                 # Tracing and monitoring
│
├── ask_expert/                      # Mode 1/2 workflows
│   └── (interactive expert flows)
│
├── ask_panel_enhanced/              # Panel workflows
│   └── (multi-expert consultation)
│
├── modes34/                         # Mode 3/4 autonomous workflows
│   ├── unified_autonomous_workflow.py  # Main autonomous workflow
│   ├── agent_selector.py            # Agent selection logic
│   ├── research_quality.py          # Quality assessment
│   ├── state.py                     # Workflow state
│   ├── templates/                   # Workflow templates
│   ├── wrappers/                    # L4/L5 wrappers
│   ├── resilience/                  # Error handling
│   └── validation/                  # Validation logic
│
├── task_runners/                    # Task runner families (see above)
│
└── shared/                          # Shared workflow utilities
    └── events.py                    # Event definitions
```

#### Modules (Feature organization)

```
modules/
├── execution/                       # Execution module
│   ├── context.py                   # Execution context
│   ├── runner.py                    # Module runner
│   ├── result_collector.py          # Result aggregation
│   └── stream_manager.py            # Streaming management
│
├── expert/                          # Expert module (20+ files)
│   ├── agents/                      # Expert agents
│   ├── modes/                       # Mode implementations
│   ├── registry/                    # Expert registry
│   ├── services/                    # Expert services
│   ├── fusion/                      # Response fusion
│   ├── safety/                      # Safety checks
│   └── schemas/                     # Data schemas
│
├── panels/                          # Panel module
├── ask_expert/                      # Ask Expert module
├── translator/                      # Translator module
│
└── (empty placeholders)
    ├── companion/                   # AI Companion (empty)
    ├── knowledge/                   # Knowledge (empty)
    ├── ontology/                    # Ontology (empty)
    └── solutions/                   # Solutions (empty)
```

### 1.3 Component Location Summary

| Component | Current Location(s) | File Count | Issue |
|-----------|---------------------|------------|-------|
| **Agents** | `agents/l1-l5/` | ~60 | Internal hierarchy conflicts with ontology |
| **Agent Services** | `services/agent_*.py` | 15 | Scattered in flat services/ |
| **Core Runners** | `runners/core/` | 6 | Framework separate from implementations |
| **Pharma Runners** | `runners/pharma/` | 6 | Domain runners separate |
| **Task Runner Families** | `langgraph_workflows/task_runners/` | 28 dirs | Rich but separate location |
| **Mode 3/4 Runners** | `langgraph_workflows/modes34/runners/` | ~10 | Mode-specific, third location |
| **LangGraph Workflows** | `langgraph_workflows/` | 15+ | Main workflow location |
| **Legacy Workflows** | `workflows/` | 1 | Should be migrated/removed |
| **Execution Module** | `modules/execution/` | 4 | Well-organized |
| **Expert Module** | `modules/expert/` | 20+ | Feature-complete |
| **Mission Services** | `services/mission_*.py` | 2 | In flat services/ |

### 1.4 Key Structural Issues

1. **Runners Fragmented Across 3 Locations**
   - `runners/` - Framework and base implementations
   - `langgraph_workflows/task_runners/` - 28 task families
   - `langgraph_workflows/modes34/runners/` - Mode-specific
   - **Recommendation**: Consolidate under `ontology/l5_execution/runners/`

2. **Agent Hierarchy Naming Conflict**
   - Backend uses `l1-l5` (orchestrators → tools)
   - Ontology uses `L0-L7` (domain → value)
   - **Recommendation**: Rename to `orchestrators/`, `experts/`, `specialists/`, `workers/`, `tools/`

3. **Empty Module Placeholders**
   - `modules/companion/`, `knowledge/`, `ontology/`, `solutions/` are empty
   - **Recommendation**: Either populate or remove

4. **No JTBD Layer (L3)**
   - Task runners exist but no JTBD mapping
   - **Recommendation**: Create `ontology/l3_jtbd/` with job-to-runner mapping

5. **No Value Layer (L7)**
   - ROI calculator exists but no VPANES/ODI integration
   - **Recommendation**: Create `ontology/l7_value/` with value tracking

---

### 1.5 Enterprise Ontology 8-Layer Model

| Layer | Name | Purpose | SQL Location |
|-------|------|---------|--------------|
| **L0** | Domain Knowledge | Foundation RAG references | `001_L0_domain_knowledge.sql` |
| **L1** | Organizational Structure | Org hierarchy | `002_L1_organizational_structure.sql` |
| **L2** | Process & Workflow | Workflow templates | (In jtbds/) |
| **L3** | Task & Activity | JTBDs and tasks | (In jtbds/) |
| **L4** | Agent Coordination | Agent orchestration | (In agents/) |
| **L5** | Execution | Runtime execution | `005_L5_execution.sql` |
| **L6** | Analytics | Metrics and insights | (Distributed) |
| **L7** | Value Transformation | VPANES + ODI scoring | `007_L7_value_transformation.sql` |

---

## Part 2: Gap Analysis

### 2.1 Layer-by-Layer Mapping

#### L0: Domain Knowledge (RAG References)

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| `l0_therapeutic_areas` | `graphrag/namespace_config.py` | Partial - hardcoded, not DB-driven |
| `l0_diseases` | N/A | **MISSING** - no disease taxonomy service |
| `l0_products` | N/A | **MISSING** - no product catalog service |
| `l0_evidence_types` | `services/evidence_detector.py` | Partial - types hardcoded |
| `l0_stakeholder_types` | N/A | **MISSING** - no stakeholder service |
| `l0_regulatory_jurisdictions` | Hardcoded patterns | **MISSING** - no jurisdiction service |

**Gap Score: 30%** - GraphRAG exists but not aligned with L0 tables.

#### L1: Organizational Structure

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| `org_business_functions` | `api/routers/enterprise_ontology/ontology.py` | Partial - read-only API |
| `org_departments` | Same | Partial |
| `org_roles` | Same | Partial |
| `org_teams` | N/A | **MISSING** |
| `org_geographies` | N/A | **MISSING** |
| `role_responsibilities` | N/A | **MISSING** |
| `role_kpi_definitions` | N/A | **MISSING** |

**Gap Score: 40%** - Basic API exists but no service layer.

#### L2: Process & Workflow

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| `workflow_templates` | `langgraph_workflows/base_workflow.py` | Partial - code-defined, not DB-driven |
| `workflow_stages` | Hard-coded in workflows | **MISSING** - no stage service |
| `workflow_tasks` | `runners/` | Partial - not linked to templates |

**Gap Score: 35%** - Workflows exist but not ontology-driven.

#### L3: Task & Activity (JTBDs)

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| `jtbds` table | N/A | **MISSING** - no JTBD service |
| `jtbd_functions` | N/A | **MISSING** |
| `jtbd_roles` | N/A | **MISSING** |
| `jtbd_pain_points` | N/A | **MISSING** |
| `jtbd_desired_outcomes` | N/A | **MISSING** |

**Gap Score: 10%** - JTBD layer almost completely missing in backend.

#### L4: Agent Coordination

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| Agent hierarchy | `agents/l1-l5` | **MISMATCH** - Different naming |
| Agent-JTBD mapping | N/A | **MISSING** |
| Agent selection | `services/medical_affairs_agent_selector.py` | Partial - not ontology-aware |
| Agent orchestration | `services/agent_orchestrator.py` | Partial |

**Gap Score: 50%** - Agents exist but naming doesn't match ontology.

#### L5: Execution

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| Execution tracking | `modules/execution/` | Good |
| Mission management | `services/mission_*.py` | Good |
| Task runners | `runners/`, `langgraph_workflows/task_runners/` | Good |

**Gap Score: 75%** - Best aligned layer.

#### L6: Analytics

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| Session analytics | `services/session_analytics_service.py` | Partial |
| Usage tracking | `services/agent_usage_tracker.py` | Partial |
| Performance metrics | N/A | **MISSING** - no metrics service |
| Quality scoring | `services/response_quality.py` | Partial |

**Gap Score: 40%** - Analytics scattered, not consolidated.

#### L7: Value Transformation

| Ontology Definition | Current Implementation | Gap |
|---------------------|----------------------|-----|
| Value drivers | `api/routes/value_framework.py` | Minimal |
| VPANES scoring | N/A | **MISSING** |
| ODI scoring | N/A | **MISSING** |
| ROI calculation | `services/roi_calculator_service.py` | Isolated |

**Gap Score: 20%** - Value layer poorly represented in backend.

### 2.2 Overall Gap Summary

| Layer | Gap Score | Priority |
|-------|-----------|----------|
| L0 Domain Knowledge | 30% | HIGH |
| L1 Organizational | 40% | MEDIUM |
| L2 Process/Workflow | 35% | MEDIUM |
| L3 Task/JTBD | **10%** | **CRITICAL** |
| L4 Agent Coord | 50% | HIGH |
| L5 Execution | 75% | LOW |
| L6 Analytics | 40% | MEDIUM |
| L7 Value Transform | **20%** | **CRITICAL** |

---

## Part 3: Structural Misalignments

### 3.1 Naming Conflicts

**Agent Hierarchy Confusion:**
- **Ontology L4**: "Agent Coordination" refers to agent-to-agent orchestration
- **Backend agents/**: Uses `l1_orchestrators`, `l2_experts`, `l3_specialists`, `l4_workers`, `l5_tools`
- **Problem**: Backend "l1-l5" conflicts with ontology "L0-L7"

**Recommendation**: Rename backend agent folders to avoid L-prefix confusion:
```
agents/
├── orchestrators/     # Was l1_orchestrators
├── experts/           # Was l2_experts
├── specialists/       # Was l3_specialists
├── workers/           # Was l4_workers
└── tools/             # Was l5_tools
```

### 3.2 Module Organization Issues

**Empty Placeholder Modules:**
- `modules/companion/` - Empty
- `modules/knowledge/` - Empty
- `modules/ontology/` - Empty
- `modules/solutions/` - Empty

**Recommendation**: Either populate or remove to avoid confusion.

### 3.3 Service Sprawl

The `services/` directory has **85 files** with no organization:
```
services/
├── ab_testing_framework.py
├── agent_db_skills_service.py
├── agent_enrichment_service.py
├── agent_hierarchy_service.py
├── agent_instantiation_service.py
├── agent_orchestrator.py
├── agent_pool_manager.py
├── agent_service.py
├── agent_usage_tracker.py
├── artifact_generator.py
├── ... (75 more files)
```

**Recommendation**: Organize by ontology layer (see Part 4).

---

## Part 4: Proposed Ontology-Aligned Structure

### 4.1 New Directory Structure

```
services/ai-engine/src/
├── ontology/                           # NEW: Ontology-aligned modules
│   ├── l0_domain/                      # L0: Domain Knowledge
│   │   ├── therapeutic_areas.py        # Therapeutic area service
│   │   ├── diseases.py                 # Disease taxonomy
│   │   ├── products.py                 # Product catalog
│   │   ├── evidence_types.py           # Evidence type registry
│   │   ├── stakeholders.py             # Stakeholder types
│   │   ├── jurisdictions.py            # Regulatory jurisdictions
│   │   └── rag_pointers.py             # RAG collection pointers
│   │
│   ├── l1_organization/                # L1: Organizational Structure
│   │   ├── functions.py                # Business functions
│   │   ├── departments.py              # Department hierarchy
│   │   ├── roles.py                    # Role definitions
│   │   ├── teams.py                    # Team structures
│   │   ├── geography.py                # Geographic hierarchy
│   │   └── responsibilities.py         # Role responsibilities
│   │
│   ├── l2_process/                     # L2: Process & Workflow
│   │   ├── workflow_templates.py       # DB-driven templates
│   │   ├── workflow_stages.py          # Stage definitions
│   │   ├── workflow_tasks.py           # Task specifications
│   │   └── workflow_engine.py          # Execution engine adapter
│   │
│   ├── l3_jtbd/                        # L3: Task & Activity (NEW)
│   │   ├── jobs.py                     # JTBD definitions
│   │   ├── job_mappings.py             # Function/role/dept mappings
│   │   ├── pain_points.py              # Pain point registry
│   │   ├── outcomes.py                 # Desired outcomes
│   │   ├── kpis.py                     # KPI definitions
│   │   └── success_criteria.py         # Success metrics
│   │
│   ├── l4_agents/                      # L4: Agent Coordination
│   │   ├── agent_registry.py           # Agent definitions (from DB)
│   │   ├── agent_jtbd_mapping.py       # Agent-to-JTBD links
│   │   ├── selection_strategy.py       # Ontology-aware selection
│   │   ├── orchestration.py            # Multi-agent orchestration
│   │   └── synergy_calculator.py       # Agent synergy scoring
│   │
│   ├── l5_execution/                   # L5: Execution (existing + enhanced)
│   │   ├── mission_manager.py          # Mission lifecycle
│   │   ├── task_executor.py            # Task execution
│   │   ├── checkpoint_manager.py       # State persistence
│   │   └── event_publisher.py          # Event streaming
│   │
│   ├── l6_analytics/                   # L6: Analytics (NEW)
│   │   ├── session_analytics.py        # Session metrics
│   │   ├── agent_performance.py        # Agent KPIs
│   │   ├── quality_metrics.py          # Response quality
│   │   ├── usage_tracking.py           # Usage patterns
│   │   └── insights_generator.py       # AI-driven insights
│   │
│   └── l7_value/                       # L7: Value Transformation (NEW)
│       ├── value_drivers.py            # Value driver hierarchy
│       ├── vpanes_scorer.py            # VPANES scoring
│       ├── odi_calculator.py           # ODI opportunity scoring
│       ├── roi_analyzer.py             # ROI impact analysis
│       └── value_realization.py        # Value tracking
│
├── agents/                             # Agent implementations (renamed)
│   ├── orchestrators/                  # Top-level (was l1_)
│   ├── experts/                        # Domain (was l2_)
│   ├── specialists/                    # Specialized (was l3_)
│   ├── workers/                        # Task (was l4_)
│   └── tools/                          # Tools (was l5_)
│
├── api/                                # API layer (reorganized)
│   ├── routes/
│   │   ├── ontology/                   # Ontology CRUD endpoints
│   │   │   ├── l0_domain.py
│   │   │   ├── l1_organization.py
│   │   │   ├── l2_process.py
│   │   │   ├── l3_jtbd.py
│   │   │   ├── l4_agents.py
│   │   │   ├── l5_execution.py
│   │   │   ├── l6_analytics.py
│   │   │   └── l7_value.py
│   │   ├── services/                   # Service endpoints
│   │   └── companion/                  # AI Companion endpoints
│   ├── schemas/                        # Pydantic schemas
│   │   └── ontology/                   # Ontology schemas
│   └── middleware/
│
├── core/                               # Core utilities (unchanged)
├── domain/                             # DDD layer (unchanged)
├── graphrag/                           # GraphRAG (enhanced)
│   └── ontology_aware/                 # L0-integrated search
├── infrastructure/                     # Infrastructure (unchanged)
├── langgraph_workflows/                # Workflows (unchanged)
├── runners/                            # Task runners (unchanged)
├── streaming/                          # SSE streaming (unchanged)
└── workers/                            # Background workers (unchanged)
```

### 4.2 Migration Path

#### Phase 1: Create Ontology Module (Week 1-2)
1. Create `ontology/` directory structure
2. Implement L0-L7 service classes
3. Add Pydantic models for each layer

#### Phase 2: Migrate Existing Services (Week 3-4)
1. Move scattered services to appropriate layers:
   - `evidence_detector.py` → `ontology/l0_domain/evidence_types.py`
   - `roi_calculator_service.py` → `ontology/l7_value/roi_analyzer.py`
   - `session_analytics_service.py` → `ontology/l6_analytics/session_analytics.py`
2. Add deprecation wrappers for old imports

#### Phase 3: Rename Agent Hierarchy (Week 4)
1. Rename `agents/l1-l5` to semantic names
2. Update all imports
3. Add backward compatibility aliases

#### Phase 4: Wire Up Database (Week 5-6)
1. Connect ontology services to Supabase tables
2. Add caching layer for frequently accessed data
3. Implement change detection for cache invalidation

### 4.3 Cross-Layer Integration Pattern

```python
# ontology/resolver.py
class OntologyResolver:
    """Cross-layer resolution for contextual queries."""

    def __init__(self):
        self.l0 = L0DomainService()
        self.l1 = L1OrganizationService()
        self.l2 = L2ProcessService()
        self.l3 = L3JTBDService()
        self.l4 = L4AgentService()
        self.l5 = L5ExecutionService()
        self.l6 = L6AnalyticsService()
        self.l7 = L7ValueService()

    async def resolve_context(
        self,
        query: str,
        user_role_id: str | None = None,
        therapeutic_area_id: str | None = None
    ) -> OntologyContext:
        """Build full context traversing all layers."""

        # L0: Domain context
        domain = await self.l0.resolve_domain(query, therapeutic_area_id)

        # L1: Organization context
        org = await self.l1.resolve_organization(user_role_id)

        # L3: Relevant JTBDs
        jtbds = await self.l3.find_relevant_jtbds(
            query=query,
            role_id=org.role_id,
            function_id=org.function_id
        )

        # L4: Best agents for these JTBDs
        agents = await self.l4.select_agents_for_jtbds(jtbds)

        # L7: Value context
        value = await self.l7.get_value_context(jtbds)

        return OntologyContext(
            domain=domain,
            organization=org,
            jtbds=jtbds,
            agents=agents,
            value=value
        )
```

---

## Part 5: Benefits of Ontology-Aligned Structure

### 5.1 Technical Benefits

| Benefit | Impact |
|---------|--------|
| **Single Source of Truth** | Database drives behavior, not hardcoded patterns |
| **Consistent Naming** | No more L1-L5 vs L0-L7 confusion |
| **Clear Boundaries** | Each layer has dedicated services |
| **Easier Testing** | Layer isolation enables unit testing |
| **Better Discoverability** | New developers can navigate by ontology layer |

### 5.2 Business Benefits

| Benefit | Impact |
|---------|--------|
| **JTBD Integration** | Backend can recommend agents by job-to-be-done |
| **Value Tracking** | Every execution can measure value impact |
| **Organization Awareness** | Services adapt to user's role/function |
| **Compliance** | Jurisdiction-aware processing from L0 |

### 5.3 Operational Benefits

| Benefit | Impact |
|---------|--------|
| **Cache Strategy** | Each layer can have appropriate TTLs |
| **Monitoring** | Per-layer metrics and health checks |
| **Scaling** | Layers can be scaled independently |
| **Debugging** | Clear call chains through layers |

---

## Part 6: Integration with Unified AI Companion

The Unified AI Companion Service (documented in `UNIFIED_AI_COMPANION_SERVICE.md`) should leverage the ontology structure:

```python
# Unified AI Companion using ontology layers
class UnifiedAICompanion:
    def __init__(self):
        self.ontology = OntologyResolver()

    async def process_request(self, request: CompanionRequest) -> CompanionResponse:
        # Get full ontology context
        context = await self.ontology.resolve_context(
            query=request.input,
            user_role_id=request.user_role_id,
            therapeutic_area_id=request.therapeutic_area_id
        )

        # Use context for all sub-services
        if request.type == "prompt_enhancement":
            return await self.enhance_prompt(request.input, context)
        elif request.type == "agent_recommendation":
            return await self.recommend_agents(context)
        elif request.type == "value_estimation":
            return await self.estimate_value(request.input, context)
```

---

## Part 7: Immediate Action Items

### Priority 1 (Critical)
- [ ] Create `ontology/l3_jtbd/` module - JTBD layer is 10% complete
- [ ] Create `ontology/l7_value/` module - Value layer is 20% complete
- [ ] Implement `OntologyResolver` for cross-layer queries

### Priority 2 (High)
- [ ] Rename `agents/l1-l5` to semantic names
- [ ] Create `ontology/l0_domain/` with DB-driven configs
- [ ] Migrate scattered analytics to `ontology/l6_analytics/`

### Priority 3 (Medium)
- [ ] Populate empty modules or remove them
- [ ] Organize `services/` by ontology layer
- [ ] Add API routes for each ontology layer

### Priority 4 (Low)
- [ ] Add caching layer for ontology data
- [ ] Implement change detection
- [ ] Add layer-specific monitoring

---

## Appendix A: File Count Analysis

| Directory | Current Files | Proposed Files | Delta |
|-----------|--------------|----------------|-------|
| services/ | 85 | 40 | -45 (moved to ontology/) |
| ontology/ | 0 | 35 | +35 |
| agents/ | 13 | 13 | 0 (renamed only) |
| api/routes/ | 30 | 35 | +5 |
| modules/ | 13 | 8 | -5 (remove empty) |
| **Total** | **709** | **~700** | ~0 |

---

## Appendix B: Ontology Layer SQL Reference

```
.claude/docs/platform/enterprise_ontology/01-core-layers/
├── 001_L0_domain_knowledge.sql       # 15 therapeutic areas, evidence types, jurisdictions
├── 002_L1_organizational_structure.sql  # 9 functions, departments, roles
├── 005_L5_execution.sql              # Execution tracking tables
├── 007_L7_value_transformation.sql   # VPANES, ODI, value drivers
├── 008_change_management_ld.sql      # Change management
└── 010_knowledge_graph_views.sql     # Graph views
```

---

*Last Updated: December 17, 2025*
*Status: Analysis Complete - Pending Implementation Decision*
