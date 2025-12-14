<!-- PRODUCTION_TAG: PRODUCTION_READY -->
<!-- LAST_VERIFIED: 2025-01-27 -->
<!-- CATEGORY: documentation -->
<!-- DEPENDENCIES: [services/ai-engine, apps/vital-system, packages/] -->
<!-- VERSION: 3.2.1 -->

# Ask Expert Service - Codebase Structure & File Inventory

**Version:** 3.2.1 STRUCTURE REFACTORED
**Date:** January 27, 2025
**Author:** Claude Code
**Scope:** Complete codebase structure, file inventory, and organization

> **Document Refactored:** January 27, 2025
> - Extracted from unified implementation overview
> - Focus: Codebase structure, file inventory, organization
> - Comprehensive file listing included

---

## Executive Summary

| Layer | Active Files | Test Files | Archive Files | Total |
|-------|-------------|------------|---------------|-------|
| **Backend (Python)** | 425 | 47 | 96 | 568 |
| **Frontend (TypeScript)** | 1,394 | 18 | 0 | 1,412 |
| **Packages (TypeScript)** | 223 | 0 | 0 | 223 |
| **Grand Total** | **2,042** | **65** | **96** | **2,203** |

---

## Part 1: Codebase Structure Overview

### 1.1 Monorepo Structure

```
VITAL path/
├── services/
│   └── ai-engine/              # Python FastAPI backend
│       └── src/
│           ├── agents/         # L1-L5 agent hierarchy
│           ├── api/            # FastAPI routes
│           ├── core/           # Core utilities
│           ├── langgraph_workflows/  # Workflow definitions
│           ├── services/       # Business logic
│           └── ...
├── apps/
│   └── vital-system/           # Next.js frontend
│       └── src/
│           ├── app/            # Next.js pages
│           ├── components/     # UI components
│           ├── features/       # Feature modules
│           └── ...
└── packages/
    ├── vital-ai-ui/            # VITAL AI UI library
    ├── ui/                     # Core UI components
    └── protocol/               # Shared protocol definitions
```

---

## Part 2: Backend File Inventory

### 2.1 Backend File Inventory (services/ai-engine/src/)

#### ACTIVE CODE - KEEP ✅

| Directory | Files | Purpose | Status |
|-----------|-------|---------|--------|
| `agents/` | 66 | L1-L5 agent hierarchy (orchestrators, experts, specialists, workers, tools) | Production |
| `api/` | 66 | FastAPI routes, schemas, middleware, GraphQL | Production |
| `core/` | 17 | Config, security, streaming, validation, resilience | Production |
| `domain/` | 11 | Domain entities, events, services, value objects | Production |
| `fusion/` | 7 | GraphRAG fusion engine (RRF, retrievers) | Production |
| `graphrag/` | 31 | Knowledge graph, chunking, citation, search | Production |
| `infrastructure/` | 12 | Database repos, LLM clients, tokenizer | Production |
| `langgraph_workflows/` | 40 | Mode 1-4 workflows, checkpointing, quality gates | Production |
| `middleware/` | 5 | Admin auth, rate limiting, tenant isolation | Production |
| `models/` | 7 | Data models (artifacts, missions, requests) | Production |
| `modules/` | 41 | Expert module, panels, translator, execution | Production |
| `monitoring/` | 8 | Clinical monitoring, drift detection, metrics | Production |
| `protocols/` | 5 | Pharma protocols, demo protocols | Production |
| `runners/` | 19 | Mission runners (core, pharma specializations) | Production |
| `services/` | 71 | Business logic (RAG, agents, sessions, HITL) | Production |
| `streaming/` | 5 | SSE formatters, token streaming | Production |
| `tools/` | 6 | Agent tools (RAG, web, medical research) | Production |
| `workers/` | 8 | Background tasks (cleanup, discovery, sync) | Production |
| **SUBTOTAL** | **425** | | |

#### TESTS - KEEP ✅

| Directory | Files | Purpose |
|-----------|-------|---------|
| `tests/` | 47 | Unit tests, integration tests, fixtures |

#### ARCHIVE - CONSIDER REMOVAL 🗑️

| Directory | Files | Purpose | Recommendation |
|-----------|-------|---------|----------------|
| `_backup_phase1/` | 27 | Phase 1 refactoring backups | Remove after confirming production stable |
| `_legacy_archive/` | 69 | Deprecated implementations | Remove after 30-day observation period |
| **SUBTOTAL** | **96** | | |

### 2.2 Ask Expert Service Files - Backend

**Backend (Python) - Unified Architecture (December 12, 2025):**
```
langgraph_workflows/ask_expert/
├── __init__.py                           # Module exports, mode registry, factory functions
├── unified_interactive_workflow.py       # Mode 1 & 2 unified base (AgentSelectionStrategy)
├── unified_agent_selector.py             # FusionSearchSelector for Mode 2/4 auto-selection
├── ask_expert_mode1_workflow.py          # Legacy Mode 1 (backward compatibility)
├── ask_expert_mode2_workflow.py          # Legacy Mode 2 (backward compatibility)
├── archive/                              # 📦 Deprecated files
│   ├── __init__.py
│   ├── README.md                         # Migration guide
│   ├── ask_expert_mode3_workflow.py      # DEPRECATED - use modes34/unified_autonomous_workflow
│   ├── ask_expert_mode4_workflow.py      # DEPRECATED - use modes34/unified_autonomous_workflow
│   └── unified_autonomous_workflow_deprecated.py  # Old ask_expert version, archived
└── shared/
    ├── __init__.py
    ├── state_factory.py
    ├── mixins/streaming.py
    └── nodes/
        ├── error_handler.py
        ├── input_processor.py
        ├── l3_context_engineer.py
        ├── parallel_tools_executor.py
        ├── rag_retriever.py
        └── response_formatter.py

langgraph_workflows/modes34/              # 🆕 Production Mode 3 & 4 Workflows
├── __init__.py                           # Package exports
├── unified_autonomous_workflow.py        # ⭐ PRODUCTION Mode 3 & 4 workflow
├── research_quality.py                   # Quality assessment and refinement
├── state.py                              # Mode 3/4 state definitions
└── runners/
    ├── __init__.py
    └── registry.py                       # Runner registry with lazy imports

modules/expert/                           # Mission/Runner System (Mode 3 & 4 ONLY)
├── workflows/
│   └── mission_workflow.py               # MissionWorkflowBuilder (enforces mode=3/4)
└── registry/
    └── mission_registry.py               # Maps 24 templates → 7 runner families

modules/execution/
└── runner.py                             # WorkflowRunner (sync/async execution)

api/routes/
├── ask_expert_interactive.py  (Mode 1/2 API)
├── ask_expert_autonomous.py   (Mode 3/4 API)
└── mode1_manual_interactive.py
└── mode2_auto_interactive.py
└── mode3_deep_research.py

api/sse/
├── event_transformer.py  (SSE transformation)
└── mission_events.py     (Mission event helpers)

services/
├── session_memory_service.py
├── agent_usage_tracker.py
├── mission_service.py
├── mission_repository.py
├── hitl_service.py
└── autonomous_controller.py
```

### 2.3 Critical Backend Services

#### LangGraph Workflow Files (Backend - Active)

**Ask Expert Workflows (services/ai-engine/src/langgraph_workflows/ask_expert/):**

| File | Purpose |
|------|---------|
| `__init__.py` | Workflow exports, mode registry, factory functions |
| `unified_interactive_workflow.py` | Mode 1 & 2 unified interactive base |
| `unified_agent_selector.py` | FusionSearchSelector for Mode 2/4 auto-selection |
| `ask_expert_mode1_workflow.py` | Mode 1 legacy (backward compatibility) |
| `ask_expert_mode2_workflow.py` | Mode 2 legacy (backward compatibility) |
| `shared/__init__.py` | Shared workflow utilities |
| `shared/state_factory.py` | State factory for workflows |
| `shared/mixins/streaming.py` | Streaming mixin |
| `shared/nodes/__init__.py` | Node exports |
| `shared/nodes/input_processor.py` | Input processing node |
| `shared/nodes/error_handler.py` | Error handling node |
| `shared/nodes/response_formatter.py` | Response formatting node |
| `shared/nodes/parallel_tools_executor.py` | Parallel tool execution |
| `shared/nodes/l3_context_engineer.py` | L3 context engineering |

**Mode 3 & 4 Workflows (services/ai-engine/src/langgraph_workflows/modes34/):**

| File | Purpose |
|------|---------|
| `__init__.py` | Package exports for Mode 3/4 |
| `unified_autonomous_workflow.py` | ⭐ **PRODUCTION** Mode 3 & 4 workflow |
| `research_quality.py` | Quality assessment, RACE/FACT metrics |
| `state.py` | Mode 3/4 state definitions |
| `runners/__init__.py` | Runner package exports |
| `runners/registry.py` | Runner registry with lazy imports, template caching |

**LangGraph Core (services/ai-engine/src/langgraph_workflows/):**

| File | Purpose |
|------|---------|
| `__init__.py` | Core workflow exports |
| `base_workflow.py` | Base workflow class |
| `checkpoint_manager.py` | Checkpoint management |
| `postgres_checkpointer.py` | PostgreSQL checkpointing |
| `observability.py` | Workflow observability |
| `state_schemas.py` | State schema definitions |
| `ontology_investigator.py` | Ontology investigation workflow |
| `value_investigator.py` | Value investigation workflow |

**LangGraph Compilation (services/ai-engine/src/langgraph_compilation/):**

| File | Purpose |
|------|---------|
| `__init__.py` | Compilation exports |
| `state.py` | Compilation state |
| `checkpointer.py` | Compilation checkpointing |
| `panel_service.py` | Panel compilation service |
| `nodes/__init__.py` | Node type exports |
| `nodes/agent_nodes.py` | Agent node compiler |
| `nodes/router_nodes.py` | Router node compiler |
| `nodes/panel_nodes.py` | Panel node compiler |
| `nodes/human_nodes.py` | Human node compiler |
| `nodes/skill_nodes.py` | Skill node compiler |
| `nodes/tool_nodes.py` | Tool node compiler |
| `patterns/__init__.py` | Pattern exports |
| `patterns/react.py` | ReAct pattern |
| `patterns/tree_of_thoughts.py` | Tree of Thoughts pattern |
| `patterns/constitutional_ai.py` | Constitutional AI pattern |

#### Agent Hierarchy (Backend - L1-L5)

**L1 Orchestrators (services/ai-engine/src/agents/l1_orchestrators/):**

| File | Purpose |
|------|---------|
| `__init__.py` | L1 exports |
| `l1_master.py` | Master orchestrator |
| `prompts/__init__.py` | Prompt exports |
| `prompts/l1_system_prompt.py` | L1 system prompt template |

**L2 Domain Experts (services/ai-engine/src/agents/l2_experts/):**

| File | Purpose |
|------|---------|
| `__init__.py` | L2 exports |
| `l2_base.py` | Base L2 expert class |
| `l2_clinical.py` | Clinical domain expert |
| `l2_regulatory.py` | Regulatory domain expert |
| `l2_safety.py` | Safety domain expert |
| `l2_domain_lead.py` | Domain lead coordinator |

**L3 Specialists (services/ai-engine/src/agents/l3_specialists/):**

| File | Purpose |
|------|---------|
| `__init__.py` | L3 exports |
| `l3_base.py` | Base L3 specialist class |
| `l3_domain_analyst.py` | Domain analysis specialist |
| `l3_context_specialist.py` | Context engineering specialist |

**L4 Workers (services/ai-engine/src/agents/l4_workers/) - 24 files:**

| File | Purpose |
|------|---------|
| `__init__.py` | L4 exports |
| `l4_base.py` | Base L4 worker class |
| `worker_factory.py` | Worker factory pattern |
| `l4_clinical.py` | Clinical operations worker |
| `l4_regulatory.py` | Regulatory worker |
| `l4_data.py` | Data processing worker |
| `l4_strategic.py` | Strategic planning worker |
| `l4_analysis.py` | Analysis worker |
| `l4_risk.py` | Risk assessment worker |
| `l4_heor.py` | Health economics worker |
| `l4_rwe.py` | Real-world evidence worker |
| `l4_design.py` | Design worker |
| `l4_design_thinking.py` | Design thinking worker |
| `l4_context_engineer.py` | Context engineering worker |
| `l4_agile.py` | Agile methodology worker |
| `l4_bioinformatics.py` | Bioinformatics worker |
| `l4_commercial.py` | Commercial operations worker |
| `l4_communication.py` | Communication worker |
| `l4_decision.py` | Decision support worker |
| `l4_digital_health.py` | Digital health worker |
| `l4_evidence.py` | Evidence synthesis worker |
| `l4_financial.py` | Financial analysis worker |
| `l4_innovation.py` | Innovation worker |
| `l4_medical_affairs.py` | Medical affairs worker |
| `l4_operational.py` | Operational worker |
| `l4_data_processor.py` | Data processor worker |

**L5 Tools (services/ai-engine/src/agents/l5_tools/) - 21 files:**

| File | Purpose |
|------|---------|
| `__init__.py` | L5 exports |
| `l5_base.py` | Base L5 tool class |
| `tool_registry.py` | Tool registry service |
| `l5_academic.py` | Academic search tools |
| `l5_ai_frameworks.py` | AI framework tools |
| `l5_bioinformatics.py` | Bioinformatics tools |
| `l5_clinical_systems.py` | Clinical system tools |
| `l5_data_quality.py` | Data quality tools |
| `l5_digital_health.py` | Digital health tools |
| `l5_ehr.py` | EHR integration tools |
| `l5_general.py` | General purpose tools |
| `l5_heor.py` | HEOR analysis tools |
| `l5_imaging.py` | Medical imaging tools |
| `l5_literature.py` | Literature search tools |
| `l5_medical.py` | Medical reference tools |
| `l5_nlp.py` | NLP processing tools |
| `l5_privacy.py` | Privacy compliance tools |
| `l5_regulatory.py` | Regulatory compliance tools |
| `l5_rwe.py` | Real-world evidence tools |
| `l5_statistics.py` | Statistical analysis tools |
| `scientific/pubmed_tool.py` | PubMed integration |

#### Fusion Search & Agent Selection (Backend)

**Agent Selection Services (services/ai-engine/src/services/):**

| File | Purpose |
|------|---------|
| `hybrid_agent_search.py` | Hybrid semantic + keyword agent search |
| `graphrag_selector.py` | GraphRAG-based agent selection |
| `evidence_based_selector.py` | Evidence-scored agent selection |
| `medical_affairs_agent_selector.py` | Medical affairs domain selector |
| `recommendation_engine.py` | Agent recommendation engine |
| `confidence_calculator.py` | Confidence scoring for selections |
| `multi_domain_evidence_detector.py` | Cross-domain evidence detection |
| `evidence_detector.py` | Evidence classification |
| `evidence_scoring_service.py` | Evidence ranking service |

**Agent Orchestration Services:**

| File | Purpose |
|------|---------|
| `agent_orchestrator.py` | Main agent orchestration |
| `agent_pool_manager.py` | Agent pool lifecycle |
| `agent_hierarchy_service.py` | L1-L5 hierarchy management |
| `agent_instantiation_service.py` | Agent instance creation |
| `sub_agent_spawner.py` | Sub-agent spawning |
| `unified_agent_loader.py` | Unified agent loading |
| `agent_db_skills_service.py` | Agent skills from database |
| `agent_usage_tracker.py` | Agent usage analytics |
| `agent_enrichment_service.py` | Agent context enrichment |

#### Backend Shared Services (services/ai-engine/src/)

**Core Layer (17 files) - Shared across all modules:**

| File | Purpose | Lines |
|------|---------|-------|
| `core/config.py` | Environment config, SecurityConfig | 17K |
| `core/security.py` | Input sanitization, rate limiting, tenant isolation | 19K |
| `core/resilience.py` | Circuit breaker, retry logic | 18K |
| `core/streaming.py` | SSE streaming utilities | 22K |
| `core/validation.py` | Input/output validation | 27K |
| `core/caching.py` | Redis/in-memory caching | 22K |
| `core/cost_tracking.py` | Token budget tracking | 22K |
| `core/model_factory.py` | LLM model selection | 21K |
| `core/parallel.py` | Async parallel execution | 21K |
| `core/tracing.py` | OpenTelemetry tracing | 20K |
| `core/reducers.py` | State reducers for LangGraph | 14K |
| `core/context.py` | Request context management | 8K |
| `core/logging.py` | Structured logging | 8K |
| `core/rag_config.py` | RAG configuration | 8K |
| `core/monitoring.py` | Prometheus metrics | 3K |
| `core/websocket_manager.py` | WebSocket connections | 10K |

**Domain Layer (11 files):**

| File | Purpose |
|------|---------|
| `domain/entities/` | Domain entity definitions |
| `domain/events/budget_events.py` | Budget event types |
| `domain/exceptions.py` | Custom exception classes |
| `domain/services/budget_service.py` | Budget management service |
| `domain/value_objects/token_usage.py` | Token usage value object |
| `domain/panel_models.py` | Panel consultation models |
| `domain/panel_types.py` | Panel type definitions |

**Infrastructure Layer (12 files):**

| File | Purpose |
|------|---------|
| `infrastructure/database/agent_loader.py` | Load agents from Supabase |
| `infrastructure/database/tool_loader.py` | Load tools from Supabase |
| `infrastructure/database/repositories/conversation_repo.py` | Conversation persistence |
| `infrastructure/database/repositories/job_repo.py` | Job persistence |
| `infrastructure/llm/client.py` | Multi-provider LLM client |
| `infrastructure/llm/config_service.py` | LLM configuration |
| `infrastructure/llm/tokenizer.py` | Token counting |
| `infrastructure/llm/tracking.py` | Usage tracking |

**Services Layer (71 files) - Key shared services:**

| Service | Purpose |
|---------|---------|
| `services/tenant_aware_supabase.py` | Multi-tenant database client |
| `services/session_memory_service.py` | Conversation memory |
| `services/agent_usage_tracker.py` | Agent usage analytics |
| `services/unified_rag_service.py` | Unified RAG search |
| `services/embedding_service.py` | Vector embeddings |
| `services/hitl_service.py` | Human-in-the-loop |
| `services/mission_service.py` | Mission management |
| `services/autonomous_controller.py` | Autonomous execution |
| `services/confidence_calculator.py` | Confidence scoring |

---

## Part 3: Frontend File Inventory

### 3.1 Frontend File Inventory (apps/vital-system/src/)

#### ACTIVE CODE - KEEP ✅

| Directory | Files | Purpose | Status |
|-----------|-------|---------|--------|
| `app/` | 281 | Next.js 14 pages, API routes, layouts | Production |
| `agents/` | 27 | Frontend agent definitions (Tier 1-3) | Production |
| `components/` | 385 | UI components (admin, AI, chat, panels, etc.) | Production |
| `features/` | 344 | Feature modules (agents, ask-expert, chat, RAG, etc.) | Production |
| `lib/` | 175 | Utilities, services, database, security | Production |
| `shared/` | 141 | Shared components, hooks, services, types | Production |
| `contexts/` | 11 | React contexts (tenant, dashboard, filters) | Production |
| `middleware/` | 10 | Auth, security, validation middleware | Production |
| `types/` | 20 | TypeScript type definitions | Production |
| **SUBTOTAL** | **1,394** | | |

#### TESTS - KEEP ✅

| Directory | Files | Purpose |
|-----------|-------|---------|
| `__tests__/` | 18 | Unit, integration, e2e, security tests |

### 3.2 Ask Expert Service Files - Frontend

**Frontend (TypeScript):**
```
app/(app)/ask-expert/
├── page.tsx              (Mode selector)
├── mode-1/page.tsx       (Interactive Manual)
├── mode-2/page.tsx       (Interactive Auto)
├── autonomous/page.tsx   (Autonomous missions)
├── interactive/page.tsx  (Interactive chat)
├── missions/
│   ├── page.tsx          (Mission list)
│   └── [id]/page.tsx     (Mission detail)
└── templates/page.tsx    (Template gallery)

features/ask-expert/
├── components/
│   ├── MissionInput.tsx
│   ├── artifacts/
│   └── autonomous/
├── hooks/
│   ├── useSSEStream.ts
│   ├── useBaseInteractive.ts
│   ├── useBaseAutonomous.ts
│   ├── useMode1Chat.ts
│   ├── useMode2Auto.ts
│   ├── useMode3Mission.ts
│   └── useMode4Background.ts
├── services/
└── types/

components/vital-ai-ui/
├── agents/           (8 components)
├── artifacts/        (3 components)
├── conversation/     (6 components)
├── data/             (2 components)
├── documents/        (5 components)
├── error/            (1 component)
├── fusion/           (5 components)
├── layout/           (6 components)
├── reasoning/        (7 components)
└── workflow/         (9 components)
```

### 3.3 Frontend Shared Components

#### Frontend Shared Components (apps/vital-system/src/shared/)

**Total: 141 files**

| Category | Files | Components |
|----------|-------|------------|
| **UI Components** | 55 | button, card, dialog, input, select, tabs, etc. |
| **AI Components** | 12 | reasoning, response, prompt-input, streaming |
| **Chat Components** | 3 | chat-messages, enhanced-chat-input, prompt-enhancer |
| **LLM Components** | 5 | provider dashboard, medical models, usage analytics |
| **Prompt Components** | 2 | PromptEditor, PromptLibrary |
| **Hooks** | 8 | useAuth, useAgentFilters, useLLMProviders, etc. |
| **Types** | 14 | agent, chat, database, orchestration, prism |
| **Utils** | 4 | icon-mapping, database-library-loader |
| **Experts** | 2 | healthcare-experts, additional-experts |

### 3.4 Critical Frontend Services

#### RAG & Knowledge Services (Frontend)

**API Routes (apps/vital-system/src/app/api/):**

| Route | File | Purpose |
|-------|------|---------|
| `/api/rag/search-hybrid` | `rag/search-hybrid/route.ts` | Hybrid semantic + keyword search |
| `/api/rag/enhanced` | `rag/enhanced/route.ts` | Enhanced RAG with re-ranking |
| `/api/rag/medical` | `rag/medical/route.ts` | Medical domain-specific RAG |
| `/api/rag/domain` | `rag/domain/route.ts` | Domain-specific RAG routing |
| `/api/rag/domain/coverage` | `rag/domain/coverage/route.ts` | Domain coverage analytics |
| `/api/rag/domain/recommend` | `rag/domain/recommend/route.ts` | Domain recommendations |
| `/api/rag/domain/stats` | `rag/domain/stats/route.ts` | Domain statistics |
| `/api/rag/evaluate` | `rag/evaluate/route.ts` | RAG evaluation metrics |
| `/api/rag/ab-test` | `rag/ab-test/route.ts` | A/B testing for RAG |
| `/api/knowledge/search` | `knowledge/search/route.ts` | Knowledge base search |
| `/api/knowledge/hybrid-search` | `knowledge/hybrid-search/route.ts` | Hybrid knowledge search |
| `/api/knowledge/unified-search` | `knowledge/unified-search/route.ts` | Unified search across sources |
| `/api/knowledge/documents` | `knowledge/documents/route.ts` | Document management |
| `/api/knowledge/upload` | `knowledge/upload/route.ts` | Document upload processing |
| `/api/knowledge/process` | `knowledge/process/route.ts` | Document processing pipeline |
| `/api/knowledge/analytics` | `knowledge/analytics/route.ts` | Knowledge analytics |
| `/api/knowledge/duplicates` | `knowledge/duplicates/route.ts` | Duplicate detection |

**RAG Feature Services (apps/vital-system/src/features/rag/):**

| File | Purpose |
|------|---------|
| `services/enhanced-rag-service.ts` | Enhanced RAG with multi-retriever fusion |
| `services/cached-rag-service.ts` | Redis-cached RAG service |
| `chunking/semantic-chunking-service.ts` | Semantic document chunking |
| `evaluation/ragas-evaluator.ts` | RAGAS evaluation framework |
| `testing/ab-testing-framework.ts` | RAG A/B testing |
| `caching/redis-cache-service.ts` | Redis caching layer |

**RAG Library Services (apps/vital-system/src/lib/):**

| File | Purpose |
|------|---------|
| `rag/supabase-rag-service.ts` | Supabase pgvector RAG |
| `services/rag/unified-rag-service.ts` | Unified RAG across providers |
| `services/rag/domain-specific-rag-service.ts` | Domain-aware RAG routing |
| `services/rag/agent-rag-integration.ts` | Agent-RAG context injection |
| `services/knowledge/index.ts` | Knowledge service exports |
| `services/knowledge/search-cache.ts` | Knowledge search caching |

#### Prompt Services (Frontend)

**API Routes:**

| Route | File | Purpose |
|-------|------|---------|
| `/api/prompts` | `prompts/route.ts` | CRUD for prompts |
| `/api/prompts/[id]` | `prompts/[id]/route.ts` | Single prompt operations |
| `/api/prompts/generate` | `prompts/generate/route.ts` | AI prompt generation |
| `/api/prompts/generate-hybrid` | `prompts/generate-hybrid/route.ts` | Hybrid prompt generation |
| `/api/prompts/advanced` | `prompts/advanced/route.ts` | Advanced prompt features |
| `/api/prompt-enhancer` | `prompt-enhancer/route.ts` | Prompt enhancement service |
| `/api/prompt-starters` | `prompt-starters/route.ts` | Prompt starters management |
| `/api/agents/[id]/prompts` | `agents/[id]/prompts/route.ts` | Agent-specific prompts |
| `/api/agents/[id]/prompt-starters` | `agents/[id]/prompt-starters/route.ts` | Agent prompt starters |
| `/api/batch/prompts` | `batch/prompts/route.ts` | Batch prompt operations |
| `/api/prompts-crud` | `prompts-crud/route.ts` | Prompt CRUD operations |

**Prompt Components (apps/vital-system/src/shared/components/prompts/):**

| File | Purpose |
|------|---------|
| `PromptEditor.tsx` | Rich prompt editing UI |
| `PromptLibrary.tsx` | Prompt library browser |
| `index.ts` | Prompt component exports |

**Prompt Library (apps/vital-system/src/lib/prompts/):**

| File | Purpose |
|------|---------|
| `prism-loader.ts` | PRISM prompt system loader |

#### Fusion Search UI Components (packages/vital-ai-ui/src/fusion/)

| File | Purpose |
|------|---------|
| `VitalDecisionTrace.tsx` | Decision tracing visualization |
| `VitalFusionExplanation.tsx` | Fusion search explanation UI |
| `VitalRetrieverResults.tsx` | Retriever results display |
| `VitalRRFVisualization.tsx` | Reciprocal Rank Fusion visualization |
| `VitalTeamRecommendation.tsx` | Team recommendation display |

#### HITL Components (packages/vital-ai-ui/src/hitl/)

| File | Purpose |
|------|---------|
| `VitalHITLControls.tsx` | Human-in-the-loop control panel |
| `VitalHITLCheckpointModal.tsx` | HITL checkpoint modal |
| `VitalSubAgentApprovalCard.tsx` | Sub-agent approval UI |
| `VitalPlanApprovalModal.tsx` | Plan approval modal |
| `VitalUserPromptModal.tsx` | User prompt input modal |
| `VitalFinalReviewPanel.tsx` | Final review before submission |
| `VitalToolApproval.tsx` | AI SDK tool approval workflow |
| `index.ts` | HITL component exports |

---

## Part 4: Packages File Inventory

### 4.1 Packages File Inventory (packages/)

| Package | Files | Purpose | Status |
|---------|-------|---------|--------|
| `protocol/` | 15 | Shared protocol definitions, JSON schemas | Production |
| `ui/` | 67 | Core UI components (shadcn/ui base) | Production |
| `vital-ai-ui/` | 141 | VITAL AI UI library (47 components) | Production |
| **SUBTOTAL** | **223** | | |

### 4.2 VITAL-AI-UI Package (packages/vital-ai-ui/)

**Total: 141 files across 14 domains**

| Domain | Files | Key Components |
|--------|-------|----------------|
| **agents/** | 24 | VitalAgentCard (5 variants), VitalLevelBadge, VitalTeamView |
| **canvas/** | 11 | VitalFlow, VitalNode, VitalEdge, VitalControls |
| **chat/** | 5 | VitalAdvancedChatInput, VitalNextGenChatInput |
| **conversation/** | 12 | VitalMessage, VitalStreamText, VitalQuickActions |
| **data/** | 4 | VitalDataTable, VitalMetricCard, VitalTokenContext |
| **documents/** | 9 | VitalCodeBlock, VitalFileUpload, VitalDocumentation |
| **fusion/** | 6 | VitalRRFVisualization, VitalDecisionTrace |
| **hitl/** | 8 | VitalHITLControls, VitalCheckpointModal, VitalToolApproval |
| **layout/** | 9 | VitalChatLayout, VitalSidebar, VitalSplitPanel |
| **mission/** | 5 | VitalMissionTemplateSelector, VitalTeamAssemblyView |
| **reasoning/** | 15 | VitalThinking, VitalCitation, VitalEvidencePanel |
| **workflow/** | 18 | VitalProgressTimeline, VitalCircuitBreaker, VitalTask |
| **advanced/** | 5 | VitalAnnotationLayer, VitalDiffView, VitalThreadBranch |
| **v0/** | 7 | VitalV0GeneratorPanel, VitalV0PreviewFrame |

### 4.3 UI Package (packages/ui/)

**Total: 67 files**

| Category | Files | Components |
|----------|-------|------------|
| **Core UI** | 35 | button, card, dialog, input, select, tabs (shadcn/ui) |
| **Agents** | 10 | agent-cards, agent-lifecycle-card, agent-status-icon |
| **AI** | 6 | code-block, conversation, message, prompt-input |
| **Visual** | 7 | avatar-grid, icon-picker, super-agent-icon |
| **Types** | 2 | agent.types, index |

---

## Part 5: File Inventory by Feature Area

### 5.1 Ask Expert Service Files

**Complete File Structure:**

```
services/ai-engine/src/
├── langgraph_workflows/
│   ├── ask_expert/              # Mode 1 & 2 workflows
│   └── modes34/                 # Mode 3 & 4 workflows
├── modules/expert/              # Mission/Runner system
├── api/routes/                  # API endpoints
└── services/                    # Business logic

apps/vital-system/src/
├── app/(app)/ask-expert/        # Next.js pages
├── features/ask-expert/         # Feature components & hooks
└── components/vital-ai-ui/      # Platform components

packages/
├── vital-ai-ui/                 # VITAL AI UI library
└── ui/                          # Core UI components
```

### 5.2 File Count Summary by Category

| Category | Backend | Frontend | Packages | Total |
|----------|---------|----------|----------|-------|
| **Workflows** | 40 | - | - | 40 |
| **API Routes** | 66 | 281 | - | 347 |
| **Components** | - | 385 | 208 | 593 |
| **Services** | 71 | 175 | - | 246 |
| **Agents** | 66 | 27 | - | 93 |
| **Hooks** | - | 8 | - | 8 |
| **Types** | - | 20 | 2 | 22 |
| **Tests** | 47 | 18 | - | 65 |
| **Archive** | 96 | - | - | 96 |

---

## Part 6: Archive Cleanup Recommendation

### 6.1 Safe to Remove (96 files)

1. **`_backup_phase1/` (27 files)** - Phase 1 refactoring backups
   - Created: December 5-7, 2025
   - Purpose: Pre-architecture backup
   - Risk: Low - all code has been migrated
   - Action: Remove after 30 days

2. **`_legacy_archive/` (69 files)** - Legacy implementations
   - Created: November-December 2025
   - Purpose: Deprecated code archive
   - Risk: Low - newer implementations active
   - Action: Remove after 30 days

**Recommended .gitignore additions:**
```gitignore
# Archive directories (remove from repo after cleanup)
services/ai-engine/src/_backup_phase1/
services/ai-engine/src/_legacy_archive/
```

### 6.2 Deprecated Files (19 frontend files with @deprecated)

| File | Replacement |
|------|-------------|
| `src/app/api/agents-crud/route.ts` | Use batch API routes |
| `src/lib/services/langgraph-orchestrator.ts` | Use LangGraph workflows directly |
| `src/features/agents/types/agent.types.ts` | Use `@vital/types` package |
| `src/features/agents/components/AgentCard.tsx` | Use `EnhancedAgentCard` from `@vital/ui` |
| `src/features/streaming/hooks/useStreamingChat.ts` | Use mode-specific hooks |
| `src/shared/components/ui/ai/streaming-markdown.tsx` | Use `VitalStreamText` |
| `src/shared/components/ui/ai/streaming-response.tsx` | Use `VitalStreamText` |
| `src/features/ask-expert/hooks/useLangGraphOrchestration.ts` | Use mode-specific hooks |
| `src/features/ask-expert/hooks/useAskExpertChat.ts` | Use mode-specific hooks |
| `src/features/ask-expert/services/streaming-service.ts` | Use hooks instead |

---

## Part 7: Production File Registry

### 7.1 File Tagging System

| Tag | Meaning | Cleanup Action |
|-----|---------|----------------|
| `PRODUCTION_READY` | Fully tested, documented, and deployed | Keep as-is |
| `PRODUCTION_CORE` | Critical infrastructure, must keep | Keep as-is |
| `NEEDS_REVIEW` | Works but needs refactoring/cleanup | Review for optimization |
| `EXPERIMENTAL` | Prototype or experimental code | Consider removal |
| `DEPRECATED` | Old implementation, superseded | Safe to remove |
| `ARCHIVE` | Kept for reference only | Move to archive |
| `STUB` | Placeholder implementation | Complete or remove |

### 7.2 Registry Summary (132 Files Tagged)

| Category | Production Ready | Needs Review | Deprecated | Total |
|----------|-----------------|--------------|------------|-------|
| API Routes | 15 | 8 | 3 | 26 |
| LangGraph Workflows | 8 | 6 | 4 | 18 |
| Streaming | 6 | 0 | 0 | 6 |
| Services | 22 | 15 | 5 | 42 |
| GraphRAG | 12 | 8 | 2 | 22 |
| Core Infrastructure | 14 | 4 | 0 | 18 |
| **Total** | **77** | **41** | **14** | **132** |

### 7.3 File Tagging Convention

Add this comment at the top of each production file:

```python
# PRODUCTION_TAG: PRODUCTION_READY | NEEDS_REVIEW | DEPRECATED | EXPERIMENTAL
# LAST_VERIFIED: YYYY-MM-DD
# MODES_SUPPORTED: [1, 2, 3, 4] or [All]
# DEPENDENCIES: [list of critical imports]
```

**Example:**
```python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-01-27
# MODES_SUPPORTED: [1, 2]
# DEPENDENCIES: [streaming, graphrag, services.confidence_calculator]
```

---

## Part 8: Directory Structure Reference

### 8.1 Backend Directory Structure

```
services/ai-engine/src/
├── agents/                    # 66 files - L1-L5 agent hierarchy
│   ├── l1_orchestrators/
│   ├── l2_experts/
│   ├── l3_specialists/
│   ├── l4_workers/
│   └── l5_tools/
├── api/                       # 66 files - FastAPI routes
│   ├── routes/
│   ├── schemas/
│   ├── middleware/
│   └── sse/
├── core/                      # 17 files - Core utilities
│   ├── security.py
│   ├── resilience.py
│   ├── streaming.py
│   └── ...
├── langgraph_workflows/       # 40 files - Workflow definitions
│   ├── ask_expert/
│   ├── modes34/
│   └── ...
├── services/                  # 71 files - Business logic
│   ├── session_memory_service.py
│   ├── agent_usage_tracker.py
│   ├── hitl_service.py
│   └── ...
└── tests/                     # 47 files - Test suite
```

### 8.2 Frontend Directory Structure

```
apps/vital-system/src/
├── app/                       # 281 files - Next.js pages
│   ├── (app)/ask-expert/
│   └── api/
├── components/                # 385 files - UI components
│   ├── vital-ai-ui/
│   ├── langgraph-gui/
│   └── ui/
├── features/                  # 344 files - Feature modules
│   ├── ask-expert/
│   ├── agents/
│   └── rag/
├── lib/                       # 175 files - Utilities
│   ├── services/
│   └── rag/
└── shared/                    # 141 files - Shared components
```

### 8.3 Packages Directory Structure

```
packages/
├── vital-ai-ui/               # 141 files - VITAL AI UI library
│   ├── agents/
│   ├── conversation/
│   ├── workflow/
│   └── ...
├── ui/                        # 67 files - Core UI components
└── protocol/                  # 15 files - Shared protocols
```

---

**Report Generated:** January 27, 2025
**Document Version:** 3.2.1 STRUCTURE REFACTORED
**Status:** PRODUCTION READY

*This document provides comprehensive codebase structure and file inventory. For backend implementation details, see `ASK_EXPERT_UNIFIED_BACKEND_OVERVIEW.md`. For frontend implementation details, see `ASK_EXPERT_UNIFIED_FRONTEND_OVERVIEW.md`.*
