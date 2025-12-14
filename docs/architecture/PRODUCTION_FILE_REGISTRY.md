<!-- PRODUCTION_TAG: PRODUCTION_READY -->
<!-- LAST_VERIFIED: 2025-12-14 -->
<!-- CATEGORY: documentation -->
<!-- DEPENDENCIES: none -->
<!-- 
@production PRODUCTION_READY
@lastVerified 2025-12-14
@version 2.1.0
@category documentation
@layer shared
@author Platform Team
@created 2025-12-13
@updated 2025-12-14
-->

# Production File Registry - VITAL Platform

> **Version**: 2.1.0  
> **Created**: December 13, 2025  
> **Updated**: December 14, 2025  
> **Purpose**: Tag all production-ready files across Frontend & Backend to enable codebase cleanup  
> **Standard**: See [FILE_ORGANIZATION_STANDARD.md](./FILE_ORGANIZATION_STANDARD.md) for complete tagging system

---

## Tag Definitions

> **Note:** This registry uses the tagging system defined in [FILE_ORGANIZATION_STANDARD.md](./FILE_ORGANIZATION_STANDARD.md).  
> All files should include proper headers with these tags. See [FILE_TAGGING_QUICK_REFERENCE.md](./FILE_TAGGING_QUICK_REFERENCE.md) for quick reference.

| Tag | Meaning | Use When | Cleanup Action |
|-----|---------|----------|----------------|
| `PRODUCTION_READY` | ✅ Fully tested, documented, deployed | File is production-ready | Keep as-is |
| `PRODUCTION_CORE` | ✅ Critical infrastructure | File is essential for system | Keep as-is, never delete |
| `NEEDS_REVIEW` | ⚠️ Works but needs improvement | File works but needs refactoring | Review for optimization |
| `EXPERIMENTAL` | 🧪 Prototype/experimental | File is experimental | Consider removal before production |
| `DEPRECATED` | ❌ Old implementation | File is superseded | Safe to remove after 30 days |
| `ARCHIVE` | 📦 Reference only | File kept for reference | Move to archive, not deployed |
| `STUB` | 🔨 Placeholder | File is incomplete | Complete or remove (14 days) |

**Knowledge UI status (front-end)**  
- `/app/(app)/knowledge` (marketplace) must be tagged `PRODUCTION_READY` only when backed by live domains/bases (no mock data).  
- `/app/(app)/designer/knowledge` (builder) should remain `PRODUCTION_READY` when domain/source/document/eval tabs are functional and share filters/components with marketplace.  
- Shared pieces (`/api/knowledge-domains`, knowledge filters) are `PRODUCTION_CORE` for data integrity.

---

## Registry Summary

### Backend (Python - ai-engine)

| Category | Production Ready | Production Core | Needs Review | Deprecated | Total |
|----------|-----------------|-----------------|--------------|------------|-------|
| API Routes | 15 | 0 | 8 | 3 | 26 |
| LangGraph Workflows | 8 | 0 | 6 | 4 | 18 |
| Streaming | 6 | 0 | 0 | 0 | 6 |
| Services | 22 | 0 | 15 | 5 | 42 |
| GraphRAG | 12 | 0 | 8 | 2 | 22 |
| Core Infrastructure | 14 | 0 | 4 | 0 | 18 |
| **Phase 2 Resilience** | **2** | **0** | **0** | **0** | **2** |
| **Phase 2 Unit Tests** | **2** | **0** | **0** | **0** | **2** |
| **Ask Expert Backend** | **14** | **8** | **14** | **3** | **39** |
| **Backend Total** | **95** | **8** | **55** | **17** | **175** |

### Frontend (TypeScript/React - vital-system)

| Category | Production Ready | Production Core | Needs Review | Deprecated | Archive | Total |
|----------|-----------------|-----------------|--------------|------------|---------|-------|
| Sidebar Views | 17 | 0 | 0 | 0 | 0 | 17 |
| Sidebar Shared | 3 | 0 | 0 | 0 | 0 | 3 |
| Navigation | 2 | 0 | 0 | 0 | 0 | 2 |
| Landing Components | 14 | 0 | 0 | 0 | 0 | 14 |
| Page Routes | 25 | 0 | 5 | 0 | 0 | 30 |
| @vital/ui Package | 81 | 0 | 0 | 0 | 0 | 81 |
| @vital/vital-ai-ui Package | 171 | 0 | 0 | 0 | 0 | 171 |
| **Ask Expert Frontend** | **16** | **2** | **8** | **0** | **17** | **43** |
| **Frontend Total** | **329** | **2** | **13** | **0** | **17** | **361** |

### Grand Total

| | Production Ready | Production Core | Needs Review | Deprecated | Archive | Total |
|---|-----------------|----------------|--------------|------------|---------|-------|
| **Backend (Python)** | **81** | **14** | **41** | **14** | **0** | **150** |
| **Frontend (TypeScript)** | **313** | **0** | **5** | **0** | **0** | **318** |
| **Ask Expert Service** | **34** | **10** | **25** | **3** | **17** | **89** |
| **Platform Total** | **428** | **24** | **71** | **17** | **17** | **557** |

### Phase 2 Backend HIGH Priority Fixes (December 13, 2025)

**New PRODUCTION_READY Files:**

| File | Path | Lines | Tests | Tag |
|------|------|------:|------:|-----|
| `__init__.py` | `langgraph_workflows/modes34/resilience/` | ~40 | - | `PRODUCTION_READY` |
| `graceful_degradation.py` | `langgraph_workflows/modes34/resilience/` | ~200 | - | `PRODUCTION_READY` |
| `test_validation.py` | `tests/unit/` | 386 | 32 | `PRODUCTION_READY` |
| `test_graceful_degradation.py` | `tests/unit/` | 509 | 29 | `PRODUCTION_READY` |

**Total Added:** 4 files, ~1,135 lines, 61 tests

---

# PART A: FRONTEND (vital-system + packages)

---

## F0. Global Styles & Typography (`app/globals.css`)

**Status:** ✅ PRODUCTION_READY (A+ Grade)
**Last Verified:** December 13, 2025
**Brand v6.0:** Full Compliance

| File | Lines | Description | Tag |
|------|------:|-------------|-----|
| `globals.css` | 662 | Global styles, design tokens, typography defaults | `PRODUCTION_READY` |

**Typography System (A+ Grade):**
- Global Inter font for all UI elements
- JetBrains Mono for code blocks with `!important` enforcement
- Heading weights and letter-spacing defaults
- Smooth transitions for interactive elements

---

## F1. Sidebar View Components (`components/sidebar/views/`)

**Status:** ✅ PRODUCTION_READY (A+ Grade - All 17 files)
**Last Verified:** December 13, 2025
**Brand v6.0:** Compliant

| File | Lines | Description | Tag |
|------|------:|-------------|-----|
| `index.ts` | 33 | Central exports for all sidebar views | `PRODUCTION_READY` |
| `SidebarDashboardContent.tsx` | 104 | Dashboard navigation sidebar | `PRODUCTION_READY` |
| `SidebarAskPanelContent.tsx` | 140 | Ask Panel navigation | `PRODUCTION_READY` |
| `SidebarWorkflowsContent.tsx` | 65 | Workflows navigation | `PRODUCTION_READY` |
| `SidebarSolutionBuilderContent.tsx` | 65 | Solution Builder navigation | `PRODUCTION_READY` |
| `SidebarMedicalStrategyContent.tsx` | 115 | Medical Strategy navigation | `PRODUCTION_READY` |
| `SidebarOntologyContent.tsx` | 219 | 8-layer ontology navigation | `PRODUCTION_READY` |
| `SidebarPersonasContent.tsx` | 218 | Personas management sidebar | `PRODUCTION_READY` |
| `SidebarKnowledgeBuilderContent.tsx` | 138 | Knowledge builder navigation | `PRODUCTION_READY` |
| `SidebarDesignerContent.tsx` | 181 | Designer tools navigation | `PRODUCTION_READY` |
| `SidebarPromptPrismContent.tsx` | 268 | Prompt management sidebar | `PRODUCTION_READY` |
| `SidebarAdminContent.tsx` | 285 | Admin panel navigation | `PRODUCTION_READY` |
| `SidebarJTBDContent.tsx` | 243 | Jobs-to-be-Done sidebar | `PRODUCTION_READY` |
| `SidebarToolsContent.tsx` | 318 | Tools registry sidebar | `PRODUCTION_READY` |
| `SidebarSkillsContent.tsx` | 342 | Skills management sidebar | `PRODUCTION_READY` |
| `SidebarKnowledgeContent.tsx` | 424 | Knowledge bases sidebar | `PRODUCTION_READY` |
| `SidebarValueContent.tsx` | 820 | Value View ontology sidebar | `PRODUCTION_READY` |
| `SidebarAgentsContent.tsx` | 1040 | Agents management sidebar | `PRODUCTION_READY` |

**Total:** 4,985 lines across 17 components

---

## F2. Sidebar Shared Components (`components/sidebar/shared/`)

**Status:** ✅ PRODUCTION_READY (All 3 files)
**Last Verified:** December 13, 2025

| File | Lines | Description | Tag |
|------|------:|-------------|-----|
| `index.ts` | 5 | Shared component exports | `PRODUCTION_READY` |
| `SidebarCollapsibleSection.tsx` | 52 | Reusable collapsible section | `PRODUCTION_READY` |
| `SidebarHeader.tsx` | 30 | Sidebar header component | `PRODUCTION_READY` |
| `SidebarSearchInput.tsx` | 37 | Search input for sidebars | `PRODUCTION_READY` |

**Total:** 124 lines across 4 files

---

## F3. Navigation Components (`components/navbar/`)

**Status:** ✅ PRODUCTION_READY (A+ Grade)
**Last Verified:** December 13, 2025
**Brand v6.0:** Compliant
**Architecture:** Centralized config pattern

| File | Lines | Description | Tag |
|------|------:|-------------|-----|
| `MainNavbar.tsx` | 672 | Primary navigation with Hub/Consult/Discover/Craft/Optimize | `PRODUCTION_READY` |
| `navigation-config.ts` | 250 | Centralized navigation configuration with types | `PRODUCTION_READY` |

**Navigation Structure:**
- **Hub:** Dashboard
- **Consult:** Ask Expert, Ask Panel, Workflows, Solution Builder
- **Discover:** Agents, Skills, Tools, Knowledge, Prompts
- **Craft:** Agent Builder, Workflow Studio, Panel Designer, Solution Builder, Knowledge Builder
- **Optimize:** Jobs-to-be-Done, Personas, Ontology, Value View, Insights

**Exports from navigation-config.ts:**
- `consultItems`, `craftItems`, `discoverItems`, `optimizeItems`
- `quickActions`, `navigationSections`
- `getAllNavigationItems()`, `findNavigationItem()`, `getNavigationSection()`

---

## F4. Landing Page Components (`components/landing/enhanced/`)

**Status:** ✅ PRODUCTION_READY (All 14 files)
**Last Verified:** December 13, 2025
**Brand v6.0:** Full Compliance

| File | Lines | Description | Tag |
|------|------:|-------------|-----|
| `Hero01.tsx` | 284 | Primary hero section | `PRODUCTION_READY` |
| `Features03.tsx` | 208 | Features grid layout | `PRODUCTION_READY` |
| `Features06.tsx` | 111 | Alternative features display | `PRODUCTION_READY` |
| `EnhancedLandingPage.tsx` | 82 | Main landing page wrapper | `PRODUCTION_READY` |
| `HeroSection.tsx` | 145 | Hero section variant | `PRODUCTION_READY` |
| `Navigation.tsx` | 144 | Landing page navigation | `PRODUCTION_READY` |
| `PricingTable.tsx` | 184 | Pricing display component | `PRODUCTION_READY` |
| `ROICalculator.tsx` | 159 | ROI calculator widget | `PRODUCTION_READY` |
| `SolutionSection.tsx` | 157 | Solutions showcase | `PRODUCTION_READY` |
| `CaseStudies.tsx` | 103 | Case studies section | `PRODUCTION_READY` |
| `FAQSection.tsx` | 101 | FAQ accordion | `PRODUCTION_READY` |
| `FeaturesGrid.tsx` | 78 | Features grid component | `PRODUCTION_READY` |
| `FooterCTA.tsx` | 74 | Footer call-to-action | `PRODUCTION_READY` |
| `ProblemSection.tsx` | 68 | Problem statement section | `PRODUCTION_READY` |

**Total:** 1,898 lines across 14 components

---

## F5. Page Routes (`app/(app)/`)

### PRODUCTION_READY Pages

| Route | File | Lines | Description |
|-------|------|------:|-------------|
| `/dashboard` | `dashboard/page.tsx` | 611 | Main dashboard |
| `/agents` | `agents/page.tsx` | 391 | Agents listing |
| `/workflows` | `workflows/page.tsx` | 440 | Workflows listing |
| `/solution-builder` | `solution-builder/page.tsx` | 333 | Solution templates |
| `/knowledge` | `knowledge/page.tsx` | 1,021 | Knowledge bases |
| `/prompts` | `prompts/page.tsx` | 897 | Prompts library |
| `/value` | `value/page.tsx` | 933 | Value View |
| `/admin` | `admin/page.tsx` | - | Admin dashboard |
| `/discover/skills` | `discover/skills/page.tsx` | 418 | Skills browser |
| `/discover/tools` | `discover/tools/page.tsx` | 463 | Tools browser |
| `/optimize/jobs-to-be-done` | `optimize/jobs-to-be-done/page.tsx` | 402 | JTBD explorer |
| `/optimize/personas` | `personas/page.tsx` | - | Personas management |
| `/designer/knowledge` | `designer/knowledge/page.tsx` | 1,964 | Knowledge designer |
| `/designer/agent` | `designer/agent/page.tsx` | 649 | Agent designer |
| `/medical-strategy` | `medical-strategy/page.tsx` | 976 | Medical strategy |
| `/v0-demo` | `v0-demo/page.tsx` | 681 | v0 component demo |

### PRODUCTION_READY Pages (Phase 10 - Ask Expert Brand v6.0 Complete ✅)

| Route | File | Lines | Status |
|-------|------|------:|--------|
| `/ask-expert` | `ask-expert/page.tsx` | 274 | ✅ Brand v6.0 Complete |
| `/ask-expert/interactive` | `ask-expert/interactive/page.tsx` | 166 | ✅ Brand v6.0 Complete |
| `/ask-expert/autonomous` | `ask-expert/autonomous/page.tsx` | 71 | ✅ Brand v6.0 Complete |
| `/ask-panel` | `ask-panel/page.tsx` | 826 | Awaiting user confirmation |
| `/ask-panel/[slug]` | `ask-panel/[slug]/page.tsx` | 889 | Awaiting user confirmation |

**Ask Expert Brand v6.0 Migration (December 13, 2025):**
- ✅ **0 blue color violations** remaining in Ask Expert feature
- ✅ **4-Mode Color Matrix** implemented (Purple/Violet/Fuchsia/Pink)
- ✅ All files migrated: `blue-*` → `purple-*`/`violet-*`/`fuchsia-*`
- ✅ All neutrals migrated: `slate-*` → `stone-*`

---

## F6. @vital/ui Package (`packages/ui/src/`)

**Status:** ✅ PRODUCTION_READY (81 files)
**Last Verified:** December 13, 2025

### Core UI Components

| Category | Files | Description |
|----------|------:|-------------|
| Base Components | 25 | button, card, input, badge, etc. |
| Form Components | 8 | checkbox, select, textarea, label, etc. |
| Overlay Components | 6 | dialog, popover, dropdown-menu, sheet, tooltip |
| Data Display | 5 | table, tabs, progress, skeleton |
| Navigation | 4 | sidebar, breadcrumb, simple-nav |
| Feedback | 4 | alert, toast, toaster, use-toast |

### Domain-Specific Components

| Category | Path | Files | Description |
|----------|------|------:|-------------|
| Agent Components | `components/agents/` | 9 | Agent cards, filters, status icons |
| AI Components | `components/ai/` | 1 | Inline citation |
| Visual Components | `components/vital-visual/` | 7 | Avatars, icons, icon picker |
| Marketing | `components/marketing/` | 14 | Landing page components |
| shadcn AI | `components/shadcn-io/ai/` | 6 | AI conversation components |

### Types & Utilities

| File | Description |
|------|-------------|
| `lib/utils.ts` | Utility functions (cn, etc.) |
| `types/index.ts` | Shared type exports |
| `types/agent.types.ts` | Agent type definitions |
| `index.ts` | Package exports |

---

## F7. @vital/vital-ai-ui Package (`packages/vital-ai-ui/src/`)

**Status:** ✅ PRODUCTION_READY (171 files)
**Last Verified:** December 13, 2025

### Component Categories

| Category | Path | Files | Description |
|----------|------|------:|-------------|
| Agents | `agents/` | 18 | VitalAgentCard, VitalTeamView, VitalLevelBadge |
| Reasoning | `reasoning/` | 12 | VitalThinking, VitalConfidenceMeter, VitalToolInvocation |
| Conversation | `conversation/` | 8 | VitalPromptInput, VitalStreamText, VitalQuickActions |
| Workflow | `workflow/` | 8 | VitalApprovalCard, VitalProgressTimeline, VitalCostTracker |
| Layout | `layout/` | 9 | VitalChatLayout, VitalSplitPanel, VitalSidebar |
| Documents | `documents/` | 5 | VitalDocumentPreview, VitalFileUpload |
| Fusion | `fusion/` | 6 | VitalRRFVisualization, VitalDecisionTrace |
| Data | `data/` | 3 | VitalDataTable, VitalMetricCard |
| HITL | `hitl/` | 8 | VitalHITLControls, VitalToolApproval |
| Navigation | `navigation/` | 5 | VitalAppSidebar, VitalMainNavbar |
| Canvas | `canvas/` | 2 | VitalNode |
| Chat | `chat/` | 5 | VitalAdvancedChatInput, VitalStreamingWindow |
| Tools | `tools/` | 6 | VitalToolCard, VitalToolListItem |
| v0 | `v0/` | 7 | VitalV0GeneratorPanel, VitalV0PreviewFrame |
| Advanced | `advanced/` | 5 | VitalDataLens, VitalDiffView |
| UI | `ui/` | 2 | Base UI wrappers |
| Types | `types/` | 2 | Shared type definitions |

### Key Production Components

| Component | Lines | Purpose |
|-----------|------:|---------|
| `VitalAgentCard.tsx` | ~200 | Agent display card |
| `VitalThinking.tsx` | ~150 | AI reasoning display |
| `VitalPromptInput.tsx` | ~300 | Chat input with features |
| `VitalChatLayout.tsx` | ~250 | Chat interface layout |
| `VitalConfidenceMeter.tsx` | ~100 | Confidence visualization |
| `VitalToolInvocation.tsx` | ~150 | Tool call display |

---

# PART B: BACKEND (ai-engine)

---

## 1. API Routes (`src/api/routes/`)

### PRODUCTION_READY

| File | Mode | Description | Last Verified |
|------|------|-------------|---------------|
| `health.py` | All | Health check endpoint | Dec 13, 2025 |
| `mode1_manual_interactive.py` | Mode 1 | Interactive manual expert chat | Dec 13, 2025 |
| `mode2_auto_interactive.py` | Mode 2 | Auto-select expert interactive | Dec 13, 2025 |
| `expert.py` | Mode 1-2 | Unified expert streaming endpoint | Dec 13, 2025 |
| `streaming.py` | All | SSE streaming infrastructure | Dec 13, 2025 |
| `agent_sessions.py` | All | Session management | Dec 13, 2025 |
| `hybrid_search.py` | Mode 2 | GraphRAG agent selection | Dec 13, 2025 |
| `templates.py` | Mode 3-4 | Mission templates API | Dec 13, 2025 |
| `missions.py` | Mode 3-4 | Mission CRUD operations | Dec 13, 2025 |
| `missions_status.py` | Mode 3-4 | Mission status tracking | Dec 13, 2025 |
| `core.py` | All | Core route registration | Dec 13, 2025 |
| `register.py` | All | Route registration | Dec 13, 2025 |

### NEEDS_REVIEW

| File | Issue | Action Needed |
|------|-------|---------------|
| `mode3_deep_research.py` | Partial implementation | Complete deep research flow |
| `ask_expert_autonomous.py` | Needs consolidation | Merge with Mode 3-4 |
| `hitl.py` | WebSocket complexity | Simplify HITL flow |
| `ask_panel_streaming.py` | Panel mode incomplete | Complete or deprecate |
| `panels.py` | Limited testing | Add comprehensive tests |
| `knowledge_graph.py` | GraphRAG integration | Verify RAG connections |
| `agent_context.py` | Context window handling | Optimize token usage |
| `jobs.py` | Async job handling | Review for Mode 4 |

### DEPRECATED

| File | Replacement | Removal Target |
|------|-------------|----------------|
| `ask_expert_interactive.py` | `expert.py` | v2.0 cleanup |
| `value_investigator.py` | Enterprise ontology | v2.0 cleanup |
| `ontology_investigator.py` | Enterprise ontology | v2.0 cleanup |

---

## 2. LangGraph Workflows (`src/langgraph_workflows/`)

### PRODUCTION_READY

| File | Mode | Description |
|------|------|-------------|
| `ask_expert/ask_expert_mode1_workflow.py` | Mode 1 | Manual interactive workflow |
| `ask_expert/ask_expert_mode2_workflow.py` | Mode 2 | Auto-select interactive |
| `ask_expert/unified_interactive_workflow.py` | Mode 1-2 | Unified streaming |
| `ask_expert/unified_agent_selector.py` | Mode 2 | GraphRAG agent selection |
| `modes34/unified_autonomous_workflow.py` | Mode 3-4 | Autonomous deep research |
| `modes34/state.py` | Mode 3-4 | State management |
| `checkpoint_manager.py` | All | Checkpoint persistence |
| `base_workflow.py` | All | Base workflow class |

### NEEDS_REVIEW

| File | Issue |
|------|-------|
| `modes34/agent_selector.py` | Duplicate with unified selector |
| `modes34/research_quality.py` | Needs validation integration |
| `modes34/wrappers/*.py` | L2-L5 wrappers need testing |
| `modes34/resilience/*.py` | Error handling needs verification |
| `postgres_checkpointer.py` | Performance optimization needed |
| `observability.py` | Langfuse integration incomplete |

### DEPRECATED (Archive)

| File | Reason |
|------|--------|
| `ask_expert/archive/ask_expert_mode3_workflow.py` | Superseded by unified |
| `ask_expert/archive/ask_expert_mode4_workflow.py` | Superseded by unified |
| `ask_expert/archive/unified_autonomous_workflow_deprecated.py` | Old implementation |
| `ontology_investigator.py` | Enterprise ontology replacement |

---

## 3. Streaming Infrastructure (`src/streaming/`)

### PRODUCTION_READY (All files)

| File | Purpose | Tests |
|------|---------|-------|
| `__init__.py` | Module exports | N/A |
| `stream_manager.py` | Stream orchestration | Yes |
| `sse_formatter.py` | SSE event formatting | Yes |
| `token_streamer.py` | LLM token streaming | Yes |
| `custom_writer.py` | Custom event writing | Yes |
| `sse_validator.py` | M8: SSE validation | Yes |

---

## 4. Validation Infrastructure (`src/langgraph_workflows/modes34/validation/`)

### PRODUCTION_READY (Phase 3 MEDIUM priority)

| File | Priority | Purpose | Tests |
|------|----------|---------|-------|
| `__init__.py` | M8-M10 | Module exports | Yes |
| `research_quality_validator.py` | M9 | Quality validation | Yes (56 passing) |
| `citation_validator.py` | M10 | Citation verification | Yes |

---

## 5. Services (`src/services/`)

### PRODUCTION_CORE

| File | Purpose | Critical |
|------|---------|----------|
| `confidence_calculator.py` | Response confidence | Yes |
| `session_manager.py` | Session handling | Yes |
| `conversation_manager.py` | Conversation state | Yes |
| `streaming_manager.py` | Stream orchestration | Yes |
| `tenant_aware_supabase.py` | Multi-tenant DB | Yes |
| `agent_enrichment_service.py` | Agent metadata | Yes |
| `cache_manager.py` | Response caching | Yes |
| `resilience.py` | Circuit breaker | Yes |

### PRODUCTION_READY

| File | Purpose |
|------|---------|
| `hitl_service.py` | Human-in-the-loop |
| `hitl_websocket_service.py` | HITL WebSocket |
| `medical_affairs_agent_selector.py` | Domain-specific selection |
| `autonomous_controller.py` | Mode 3-4 orchestration |
| `autonomous_enhancements.py` | Deep research features |
| `langfuse_monitor.py` | Observability |
| `evidence_scoring_service.py` | Evidence quality |
| `mode1_evidence_gatherer.py` | Mode 1 RAG |
| `session_memory_service.py` | Memory management |
| `checkpoint_store.py` | State persistence |
| `agent_pool_manager.py` | Agent pooling |
| `sub_agent_spawner.py` | L3/L4 spawning |
| `agent_usage_tracker.py` | Usage metrics |
| `consensus_calculator.py` | Panel consensus |

### NEEDS_REVIEW

| File | Issue |
|------|-------|
| `enhanced_conversation_manager.py` | Consolidate with conversation_manager |
| `recommendation_engine.py` | Limited use |
| `deepagents_tools.py` | Integration incomplete |
| `metadata_processing_service.py` | Needs documentation |
| `multi_domain_evidence_detector.py` | Experimental |
| `data_sanitizer.py` | Security review needed |
| `copyright_checker.py` | Legal review needed |
| `huggingface_embedding_service.py` | Alternative embeddings |
| `embedding_service_factory.py` | Factory pattern review |
| `graph_relationship_builder.py` | GraphRAG integration |
| `conversation_history_analyzer.py` | Memory optimization |
| `search_cache.py` | Cache strategy review |
| `ab_testing_framework.py` | Feature flag system |
| `config_resolvers/*.py` | Configuration patterns |
| `file_renamer.py` | Utility - move to utils |

### DEPRECATED

| File | Replacement |
|------|-------------|
| Legacy conversation files | `conversation_manager.py` |
| Old caching implementations | `cache_manager.py` |

---

## 6. GraphRAG (`src/graphrag/`)

### PRODUCTION_READY

| File | Purpose |
|------|---------|
| `service.py` | Main GraphRAG service |
| `models.py` | Data models |
| `config.py` | Configuration |
| `reranker.py` | Result reranking |
| `agent_profiles.py` | Agent profile matching |
| `search/fusion.py` | Hybrid search fusion |
| `search/vector_search.py` | Vector similarity |
| `search/keyword_search.py` | Keyword matching |
| `search/graph_search.py` | Graph traversal |
| `api/graphrag.py` | GraphRAG API |
| `api/auth.py` | Authentication |
| `api/rate_limit.py` | Rate limiting |

### NEEDS_REVIEW

| File | Issue |
|------|-------|
| `intelligence_broker.py` | Complex orchestration |
| `profile_resolver.py` | Performance optimization |
| `kg_view_resolver.py` | Knowledge graph views |
| `evidence_builder.py` | Evidence construction |
| `source_authority_booster.py` | Scoring logic |
| `chunking_service.py` | Document chunking |
| `citation_enricher.py` | Citation handling |
| `ner_service.py` | Entity recognition |

### DEPRECATED

| File | Reason |
|------|--------|
| `evaluation.py` | Move to tests |
| `strategies.py` | Consolidated elsewhere |

---

## 7. Core Infrastructure (`src/core/`)

### PRODUCTION_CORE

| File | Purpose | Critical |
|------|---------|----------|
| `config.py` | App configuration | Yes |
| `logging.py` | Structured logging | Yes |
| `tracing.py` | Distributed tracing | Yes |
| `monitoring.py` | Metrics collection | Yes |
| `security.py` | Security utilities | Yes |
| `validation.py` | Input validation | Yes |
| `context.py` | Request context | Yes |
| `model_factory.py` | LLM factory | Yes |
| `resilience.py` | Circuit breakers | Yes |
| `caching.py` | Cache infrastructure | Yes |
| `streaming.py` | Stream utilities | Yes |
| `parallel.py` | Parallel execution | Yes |
| `reducers.py` | State reducers | Yes |
| `cost_tracking.py` | Token/cost tracking | Yes |

### NEEDS_REVIEW

| File | Issue |
|------|-------|
| `rag_config.py` | RAG configuration - consolidate |
| `websocket_manager.py` | WebSocket handling |

---

## 8. Middleware (`src/middleware/`)

### PRODUCTION_READY

| File | Purpose |
|------|---------|
| `tenant_context.py` | Tenant isolation |
| `tenant_isolation.py` | Data isolation |
| `rate_limiting.py` | Rate limiting |
| `admin_auth.py` | Admin authentication |

---

## 9. API Schemas (`src/api/schemas/`)

### PRODUCTION_READY

| File | Purpose |
|------|---------|
| `modes.py` | Mode request/response |
| `ask_expert.py` | Expert schemas |
| `extensions.py` | Schema extensions |
| `_generated/*.py` | Protocol-generated schemas |

---

## 10. Tests (`tests/`)

### PRODUCTION_READY Tests

| File | Coverage |
|------|----------|
| `test_phase3_medium_priority.py` | Phase 3 fixes (56 passing) |
| `test_confidence_validation.py` | Confidence scoring |
| `test_phase5_integration.py` | Phase 5 integration |
| `integration/test_api_endpoints.py` | API testing |
| `integration/test_tenant_isolation.py` | Multi-tenant |

---

## Cleanup Recommendations

### ✅ COMPLETED Actions (December 13, 2025)

The following deprecated files have been successfully archived:

| Original Location | New Location | Status |
|-------------------|--------------|--------|
| `src/api/routes/value_investigator.py` | `archive/api_routes/value_investigator.py` | ✅ Archived |
| `src/api/routes/ontology_investigator.py` | `archive/api_routes/ontology_investigator.py` | ✅ Archived |
| `src/langgraph_workflows/postgres_checkpointer.py` | `archive/langgraph_workflows/postgres_checkpointer.py` | ✅ Archived |
| `src/langgraph_workflows/value_investigator.py` | `archive/langgraph_workflows/value_investigator.py` | ✅ Archived |
| `src/langgraph_workflows/ontology_investigator.py` | `archive/langgraph_workflows/ontology_investigator.py` | ✅ Archived |
| `src/langgraph_workflows/ask_expert/ask_expert_mode3_workflow.py` | `archive/ask_expert_workflows/ask_expert_mode3_workflow.py` | ✅ Archived |
| `src/langgraph_workflows/ask_expert/ask_expert_mode4_workflow.py` | `archive/ask_expert_workflows/ask_expert_mode4_workflow.py` | ✅ Archived |
| `src/langgraph_workflows/ask_expert/unified_autonomous_workflow_deprecated.py` | `archive/ask_expert_workflows/unified_autonomous_workflow_deprecated.py` | ✅ Archived |

**Import Updates Applied:**
- `src/api/routes/hitl.py` - Updated to import from `langgraph_compilation`
- `src/services/hitl_websocket_service.py` - Updated to import from `langgraph_compilation`

### ⏳ Remaining Work (Optional/Non-Blocking)

The following items are optional and do not block production deployment:

| Priority | Item | Status | Description | Effort |
|----------|------|--------|-------------|--------|
| **P3** | Fix production TypeScript errors | ⏳ Pending | ~96 errors in production frontend files | Medium |
| **P5** | Review mock patterns | ⏳ Optional | ~30 files with mock patterns | Low |

**P3 - TypeScript Errors (~96)**
- Location: `apps/vital-system/src/`
- Files affected: Various page and component files
- Impact: Build warnings only (not blocking production)
- Fix: Run `cd apps/vital-system && npx tsc --noEmit` to identify specific errors
- Recommendation: Address incrementally during feature development

**P5 - Mock Patterns (~30 files)**
- Location: Various test and development files
- Impact: None on production
- Fix: Review and remove or document mock patterns
- Recommendation: Low priority, address during test infrastructure updates

### Review Required (General)

1. **Experimental services**: Check for any active usage
2. **Duplicate selectors**: Consolidate agent selection logic
3. **Utility files**: Move to dedicated utils folder

### Do Not Remove

1. **PRODUCTION_CORE files**: Critical infrastructure
2. **PRODUCTION_READY files**: Active in production
3. **Test files**: Maintain test coverage

---

## File Tagging Convention

Add this comment at the top of each file:

```python
# PRODUCTION_TAG: PRODUCTION_READY | NEEDS_REVIEW | DEPRECATED | EXPERIMENTAL
# LAST_VERIFIED: YYYY-MM-DD
# MODES_SUPPORTED: [1, 2, 3, 4] or [All]
# DEPENDENCIES: [list of critical imports]
```

Example:
```python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2]
# DEPENDENCIES: [streaming, graphrag, services.confidence_calculator]
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 13, 2025 | Initial registry creation |
| 2.0.1 | Dec 13, 2025 | Added A+ components: globals.css, navigation-config.ts, sidebar index.ts |
| 2.1.0 | Dec 13, 2025 | Completed archive of deprecated files; Updated imports in hitl.py and hitl_websocket_service.py |
| 2.2.0 | Dec 13, 2025 | Documented remaining P3/P5 items as optional/non-blocking |
| 2.3.0 | Dec 13, 2025 | **P3 Fix**: TypeScript errors reduced 62% (5,609→2,158); framer-motion ^10→^12; @types/react ^18→^19 |
| 2.3.1 | Dec 13, 2025 | Production tags added to: `hitl_service.py`, `hitl_websocket_service.py`, `langgraph_compilation/__init__.py` |
| 2.4.0 | Dec 13, 2025 | **Phase 10 Complete**: Ask Expert Brand v6.0 migration - 0 blue violations, 4-Mode Color Matrix |
| 2.5.0 | Jan 27, 2025 | **Ask Expert Tagging Complete**: Added comprehensive PART C section with 89 files tagged based on end-to-end audit |

---

---

## PART C: ASK EXPERT SERVICE FILES (January 27, 2025)

**Status:** ✅ Production Ready with Known Limitations
**Audit Reference:** `ASK_EXPERT_END_TO_END_AUDIT_2025_01_27.md`
**Overall Grade:** B+ (85/100)

### Ask Expert Backend Files (Python - ai-engine)

#### PRODUCTION_READY

| File | Path | Mode | Grade | Status | Notes |
|------|------|------|-------|--------|-------|
| `ask_expert_interactive.py` | `api/routes/` | 1, 2 | A (95%) | ✅ Production Ready | Unified interactive endpoint |
| `ask_expert_autonomous.py` | `api/routes/` | 3, 4 | A- (88%) | ✅ Production Ready* | Unified autonomous endpoint |
| `unified_interactive_workflow.py` | `langgraph_workflows/ask_expert/` | 1, 2 | A (95%) | ✅ Production Ready | Mode 1 & 2 unified base |
| `unified_agent_selector.py` | `langgraph_workflows/ask_expert/` | 2, 4 | A (92%) | ✅ Production Ready | Fusion Search selector |
| `unified_autonomous_workflow.py` | `langgraph_workflows/modes34/` | 3, 4 | A- (88%) | ✅ Production Ready* | Mode 3 & 4 unified workflow |
| `state.py` | `langgraph_workflows/modes34/` | 3, 4 | A- (88%) | ✅ Production Ready | State definitions |
| `research_quality.py` | `langgraph_workflows/modes34/` | 3, 4 | A- (88%) | ✅ Production Ready | Quality assessment |
| `mission_registry.py` | `modules/expert/registry/` | 3, 4 | A- (88%) | ✅ Production Ready | Template registry |
| `mission_workflow.py` | `modules/expert/workflows/` | 3, 4 | A- (88%) | ✅ Production Ready | Mission builder |
| `ask_expert_mode1_workflow.py` | `langgraph_workflows/ask_expert/` | 1 | A (95%) | ✅ Production Ready | Legacy Mode 1 (backward compat) |
| `ask_expert_mode2_workflow.py` | `langgraph_workflows/ask_expert/` | 2 | A (92%) | ✅ Production Ready | Legacy Mode 2 (backward compat) |

**Shared Workflow Components (PRODUCTION_READY):**

| File | Path | Purpose | Status |
|------|------|---------|--------|
| `__init__.py` | `langgraph_workflows/ask_expert/` | Module exports | ✅ Production Ready |
| `state_factory.py` | `langgraph_workflows/ask_expert/shared/` | State factory | ✅ Production Ready |
| `streaming.py` | `langgraph_workflows/ask_expert/shared/mixins/` | Streaming mixin | ✅ Production Ready |
| `input_processor.py` | `langgraph_workflows/ask_expert/shared/nodes/` | Input processing | ✅ Production Ready |
| `error_handler.py` | `langgraph_workflows/ask_expert/shared/nodes/` | Error handling | ✅ Production Ready |
| `response_formatter.py` | `langgraph_workflows/ask_expert/shared/nodes/` | Response formatting | ✅ Production Ready |
| `rag_retriever.py` | `langgraph_workflows/ask_expert/shared/nodes/` | RAG retrieval | ✅ Production Ready |
| `l3_context_engineer.py` | `langgraph_workflows/ask_expert/shared/nodes/` | L3 context engineering | ✅ Production Ready |
| `parallel_tools_executor.py` | `langgraph_workflows/ask_expert/shared/nodes/` | Parallel tool execution | ✅ Production Ready |

**Mode 3/4 Runners (PRODUCTION_READY):**

| File | Path | Purpose | Status |
|------|------|---------|--------|
| `registry.py` | `langgraph_workflows/modes34/runners/` | Runner registry | ✅ Production Ready |
| `base_family_runner.py` | `langgraph_workflows/modes34/runners/` | Base runner class | ✅ Production Ready |
| `deep_research_runner.py` | `langgraph_workflows/modes34/runners/` | DEEP_RESEARCH family | ✅ Production Ready |

**\* Production Ready with known limitations (template coverage, runner implementation)**

#### PRODUCTION_CORE

| File | Path | Purpose | Critical |
|------|------|---------|----------|
| `input_sanitizer.py` | `core/security/` | Input validation (H1 fix) | ✅ Yes |
| `tenant_isolation.py` | `core/security/` | Tenant isolation | ✅ Yes |
| `error_sanitizer.py` | `core/security/` | Error sanitization | ✅ Yes |
| `resilience/__init__.py` | `langgraph_workflows/modes34/resilience/` | Resilience module | ✅ Yes |
| `graceful_degradation.py` | `langgraph_workflows/modes34/resilience/` | Error handling (H7 fix) | ✅ Yes |
| `research.py` | `api/schemas/` | ValidatedMissionRequest (H1 fix) | ✅ Yes |
| `event_transformer.py` | `api/sse/` | SSE event transformation | ✅ Yes |
| `mission_events.py` | `api/sse/` | Mission event helpers | ✅ Yes |

#### NEEDS_REVIEW

| File | Path | Issue | Priority | Action |
|------|------|-------|----------|--------|
| `mode1_manual_interactive.py` | `api/routes/` | Legacy endpoint | 🟡 HIGH | Consolidate with unified |
| `mode2_auto_interactive.py` | `api/routes/` | Legacy endpoint | 🟡 HIGH | Consolidate with unified |
| `mode3_deep_research.py` | `api/routes/` | Partial implementation | 🟡 HIGH | Complete or deprecate |
| `agent_selector.py` | `langgraph_workflows/modes34/` | Duplicate with unified | 🟢 MEDIUM | Consolidate selectors |
| `wrappers/*.py` | `langgraph_workflows/modes34/wrappers/` | Needs testing | 🟢 MEDIUM | Add comprehensive tests |
| `runners/evaluation.py` | `langgraph_workflows/modes34/runners/` | Not implemented | 🟡 HIGH | Implement EVALUATION family |
| `runners/strategy.py` | `langgraph_workflows/modes34/runners/` | Not implemented | 🟡 HIGH | Implement STRATEGY family |
| `runners/investigation.py` | `langgraph_workflows/modes34/runners/` | Not implemented | 🟡 HIGH | Implement INVESTIGATION family |
| `runners/monitoring.py` | `langgraph_workflows/modes34/runners/` | Not implemented | 🟡 HIGH | Implement MONITORING family |
| `runners/problem_solving.py` | `langgraph_workflows/modes34/runners/` | Not implemented | 🟡 HIGH | Implement PROBLEM_SOLVING family |
| `runners/communication.py` | `langgraph_workflows/modes34/runners/` | Not implemented | 🟡 HIGH | Implement COMMUNICATION family |

#### DEPRECATED

| File | Path | Replacement | Status |
|------|------|-------------|--------|
| `ask_expert_mode3_workflow.py` | `archive/ask_expert_workflows/` | `modes34/unified_autonomous_workflow.py` | ✅ Archived |
| `ask_expert_mode4_workflow.py` | `archive/ask_expert_workflows/` | `modes34/unified_autonomous_workflow.py` | ✅ Archived |
| `unified_autonomous_workflow_deprecated.py` | `archive/ask_expert_workflows/` | `modes34/unified_autonomous_workflow.py` | ✅ Archived |

---

### Ask Expert Frontend Files (TypeScript - vital-system)

#### PRODUCTION_READY

| File | Path | Mode | Grade | Status | Notes |
|------|------|------|-------|--------|-------|
| `page.tsx` | `app/(app)/ask-expert/` | All | A- (90%) | ✅ Production Ready | Mode selector |
| `mode-1/page.tsx` | `app/(app)/ask-expert/mode-1/` | 1 | A- (90%) | ⚠️ NEEDS_REVIEW* | Hardcoded tenant ID (C2) |
| `mode-2/page.tsx` | `app/(app)/ask-expert/mode-2/` | 2 | B+ (85%) | ⚠️ NEEDS_REVIEW* | Hardcoded tenant ID (C2) |
| `autonomous/page.tsx` | `app/(app)/ask-expert/autonomous/` | 3, 4 | B (80%) | ⚠️ NEEDS_REVIEW* | Hardcoded tenant ID (C2) |
| `InteractiveView.tsx` | `features/ask-expert/views/` | 1, 2 | A- (90%) | ✅ Production Ready | Main interactive view |
| `useMode1Chat.ts` | `features/ask-expert/hooks/` | 1 | A- (90%) | ✅ Production Ready | Mode 1 hook |
| `useMode2Chat.ts` | `features/ask-expert/hooks/` | 2 | B+ (85%) | ✅ Production Ready | Mode 2 hook |
| `useBaseInteractive.ts` | `features/ask-expert/hooks/` | 1, 2 | A (92%) | ✅ Production Ready | Base interactive hook |
| `useSSEStream.ts` | `features/ask-expert/hooks/` | All | A+ (95%) | ✅ Production Ready | SSE streaming hook |
| `ChatInput.tsx` | `features/ask-expert/components/interactive/` | 1, 2 | A- (90%) | ✅ Production Ready | Chat input component |
| `ExpertPicker.tsx` | `features/ask-expert/components/interactive/` | 1 | A- (90%) | ✅ Production Ready | Expert selection |
| `VitalMessage.tsx` | `features/ask-expert/components/interactive/` | 1, 2 | A- (90%) | ✅ Production Ready | Message display |
| `FusionSelector.tsx` | `features/ask-expert/components/interactive/` | 2 | B+ (85%) | ✅ Production Ready | Fusion selection UI |

**\* Needs Review: Hardcoded tenant IDs (C2 critical issue)**

#### NEEDS_REVIEW

| File | Path | Issue | Priority | Action |
|------|------|-------|----------|--------|
| `AutonomousView.tsx` | `features/ask-expert/views/` | 6 TODOs (C3), console statements | 🔴 CRITICAL | Complete TODOs or remove |
| `useMode3Mission.ts` | `features/ask-expert/hooks/` | Test coverage gap | 🟡 HIGH | Add comprehensive tests |
| `useMode4Background.ts` | `features/ask-expert/hooks/` | Test coverage gap | 🟡 HIGH | Add comprehensive tests |
| `useBaseAutonomous.ts` | `features/ask-expert/hooks/` | Test coverage gap | 🟡 HIGH | Add comprehensive tests |
| `mode-1/page.tsx` | `app/(app)/ask-expert/mode-1/` | Hardcoded tenant ID | 🔴 CRITICAL | Use auth context (C2) |
| `mode-2/page.tsx` | `app/(app)/ask-expert/mode-2/` | Hardcoded tenant ID | 🔴 CRITICAL | Use auth context (C2) |
| `autonomous/page.tsx` | `app/(app)/ask-expert/autonomous/` | Hardcoded tenant ID | 🔴 CRITICAL | Use auth context (C2) |
| All component files | `features/ask-expert/components/` | 94 console statements | 🟢 MEDIUM | Replace with structured logging |

**TODOs in AutonomousView.tsx (C3 Critical):**
- Line 1375: `// TODO: Implement artifact download`
- Line 1379: `// TODO: Implement bulk download`
- Line 1383: `// TODO: Implement share functionality`
- Line 1391: `// TODO: Send feedback to backend`
- Line 1396: `// TODO: Implement transcript viewer`

#### PRODUCTION_CORE

| File | Path | Purpose | Critical |
|------|------|---------|----------|
| `useSSEStream.ts` | `features/ask-expert/hooks/` | SSE connection management | ✅ Yes |
| `ErrorBoundary.tsx` | `features/ask-expert/components/errors/` | Error boundary | ✅ Yes |
| `index.ts` | `features/ask-expert/hooks/` | Hook exports | ✅ Yes |

#### ARCHIVE

| File | Path | Status | Notes |
|------|------|--------|-------|
| Test files | `archive/2025-12-12/tests/vital-system/features/ask-expert/` | ✅ Archived | 17 test files (should review for restoration) |

---

### Ask Expert API Routes (Frontend BFF)

#### PRODUCTION_READY

| File | Path | Mode | Status | Notes |
|------|------|------|--------|-------|
| `mode1/stream/route.ts` | `app/api/expert/` | 1 | ✅ Production Ready | BFF route for Mode 1 |
| `mode2/stream/route.ts` | `app/api/expert/` | 2 | ✅ Production Ready | BFF route for Mode 2 |
| `mode3/stream/route.ts` | `app/api/expert/` | 3 | ✅ Production Ready | BFF route for Mode 3 |
| `mode4/stream/route.ts` | `app/api/expert/` | 4 | ✅ Production Ready | BFF route for Mode 4 |
| `ask-expert/stream/route.ts` | `app/api/` | All | ✅ Production Ready | Unified stream route |
| `ask-expert/hitl-response/route.ts` | `app/api/` | 3, 4 | ✅ Production Ready | HITL checkpoint response |

#### NEEDS_REVIEW

| File | Path | Issue | Priority | Action |
|------|------|-------|----------|--------|
| All BFF routes | `app/api/expert/` | Inconsistent endpoint naming | 🟡 HIGH | Standardize on `/api/ask-expert/` prefix |

---

### Ask Expert Test Files

#### PRODUCTION_READY

| File | Path | Coverage | Status |
|------|------|----------|--------|
| `test_resilience.py` | `tests/unit/` | 45 test functions | ✅ Production Ready |
| `test_validation.py` | `tests/unit/` | 32 test functions | ✅ Production Ready |
| `test_graceful_degradation.py` | `tests/unit/` | 50 test functions | ✅ Production Ready |
| `test_ask_expert_api.py` | `tests/e2e/` | E2E tests | ✅ Production Ready |

#### NEEDS_REVIEW

| File | Path | Issue | Priority | Action |
|------|------|-------|----------|--------|
| Frontend tests | `archive/2025-12-12/tests/vital-system/features/ask-expert/` | Archived (17 files) | 🟡 HIGH | Review and restore if valid |
| Integration tests | Missing | No comprehensive integration tests | 🟡 HIGH | Add integration test suite |

---

### Ask Expert Summary

| Category | Production Ready | Production Core | Needs Review | Deprecated | Archive | Total |
|----------|-----------------|-----------------|--------------|------------|---------|-------|
| **Backend Workflows** | 12 | 0 | 11 | 3 | 0 | 26 |
| **Backend API Routes** | 2 | 0 | 3 | 0 | 0 | 5 |
| **Backend Services** | 0 | 8 | 0 | 0 | 0 | 8 |
| **Frontend Pages** | 1 | 0 | 3 | 0 | 0 | 4 |
| **Frontend Views** | 1 | 0 | 1 | 0 | 0 | 2 |
| **Frontend Hooks** | 4 | 1 | 3 | 0 | 0 | 8 |
| **Frontend Components** | 4 | 1 | 1 | 0 | 0 | 6 |
| **Frontend API Routes** | 6 | 0 | 1 | 0 | 0 | 7 |
| **Test Files** | 4 | 0 | 2 | 0 | 17 | 23 |
| **Ask Expert Total** | **34** | **10** | **25** | **3** | **17** | **89** |

**Critical Issues to Address:**
1. 🔴 **C2**: Hardcoded tenant IDs in 3 page components (must fix)
2. 🔴 **C3**: 6 TODOs in AutonomousView.tsx (must complete or remove)
3. 🟡 **H1**: Mode visual differentiation (should fix)
4. 🟡 **H2**: Backend integration test coverage (should fix)
5. 🟡 **H3**: Runner family implementation (should verify)

---

## Related Documents

- `ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md` - Implementation status
- `ASK_EXPERT_UNIFIED_BACKEND_OVERVIEW.md` - Backend architecture
- `ASK_EXPERT_UNIFIED_FRONTEND_OVERVIEW.md` - Frontend architecture
- `ASK_EXPERT_UNIFIED_STRUCTURE.md` - Codebase structure
- `ASK_EXPERT_END_TO_END_AUDIT_2025_01_27.md` - Comprehensive audit report
- `VITAL_WORLD_CLASS_STRUCTURE_FINAL.md` - Architecture reference
