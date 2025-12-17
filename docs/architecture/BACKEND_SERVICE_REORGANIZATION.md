# Backend Service Reorganization Guide

> **Version**: 1.1.0
> **Created**: December 17, 2025
> **Updated**: December 17, 2025
> **Status**: Migration Guide

## Related Documents

| Document | Description |
|----------|-------------|
| [ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md](./ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md) | Main analysis and proposed structure |
| [UNIFIED_AI_COMPANION_SERVICE.md](./UNIFIED_AI_COMPANION_SERVICE.md) | Unified AI Companion architecture |
| [UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md](./UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md) | AI Companion backend patterns |
| [UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md](./UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md) | Ontology integration analysis |

---

## Purpose

This document provides a detailed mapping of the current 85 files in `services/ai-engine/src/services/` to the proposed ontology-aligned structure. Use this as a migration reference.

---

## Current Services Inventory

### Category 1: Agent Services (15 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `agent_db_skills_service.py` | `ontology/l4_agents/skills.py` | L4 |
| `agent_enrichment_service.py` | `ontology/l4_agents/enrichment.py` | L4 |
| `agent_hierarchy_service.py` | `ontology/l4_agents/hierarchy.py` | L4 |
| `agent_instantiation_service.py` | `ontology/l4_agents/instantiation.py` | L4 |
| `agent_orchestrator.py` | `ontology/l4_agents/orchestration.py` | L4 |
| `agent_pool_manager.py` | `ontology/l4_agents/pool_manager.py` | L4 |
| `agent_service.py` | `ontology/l4_agents/registry.py` | L4 |
| `agent_usage_tracker.py` | `ontology/l6_analytics/agent_usage.py` | L6 |
| `hybrid_agent_search.py` | `ontology/l4_agents/search.py` | L4 |
| `medical_affairs_agent_selector.py` | `ontology/l4_agents/selectors/medical_affairs.py` | L4 |
| `sub_agent_spawner.py` | `ontology/l4_agents/spawner.py` | L4 |
| `unified_agent_loader.py` | `ontology/l4_agents/loader.py` | L4 |
| `tool_registry_service.py` | `ontology/l4_agents/tool_registry.py` | L4 |
| `deepagents_tools.py` | `agents/tools/deepagents.py` | Agents |
| `skills_loader_service.py` | `ontology/l4_agents/skills_loader.py` | L4 |

### Category 2: Evidence & RAG Services (12 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `evidence_based_selector.py` | `ontology/l0_domain/evidence_selector.py` | L0 |
| `evidence_detector.py` | `ontology/l0_domain/evidence_types.py` | L0 |
| `evidence_scoring_service.py` | `ontology/l0_domain/evidence_scoring.py` | L0 |
| `multi_domain_evidence_detector.py` | `ontology/l0_domain/multi_domain.py` | L0 |
| `medical_rag.py` | `graphrag/ontology_aware/medical.py` | L0 |
| `unified_rag_service.py` | `graphrag/unified_service.py` | L0 |
| `graphrag_selector.py` | `graphrag/ontology_aware/selector.py` | L0 |
| `graphrag_diagnostics.py` | `graphrag/diagnostics.py` | L0 |
| `mode1_evidence_gatherer.py` | `ontology/l5_execution/evidence_gatherer.py` | L5 |
| `citation_prompt_enhancer.py` | `ontology/l0_domain/citations.py` | L0 |
| `faithfulness_scorer.py` | `ontology/l6_analytics/faithfulness.py` | L6 |
| `local_reranker.py` | `graphrag/reranker.py` | L0 |

### Category 3: Session & Conversation Services (8 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `session_manager.py` | `ontology/l5_execution/session_manager.py` | L5 |
| `session_memory_service.py` | `ontology/l5_execution/session_memory.py` | L5 |
| `session_analytics_service.py` | `ontology/l6_analytics/session_analytics.py` | L6 |
| `conversation_manager.py` | `ontology/l5_execution/conversation.py` | L5 |
| `enhanced_conversation_manager.py` | `ontology/l5_execution/conversation_enhanced.py` | L5 |
| `conversation_history_analyzer.py` | `ontology/l6_analytics/conversation_analysis.py` | L6 |
| `streaming_manager.py` | `streaming/manager.py` | Infra |
| `checkpoint_store.py` | `ontology/l5_execution/checkpoints.py` | L5 |

### Category 4: Panel & Consensus Services (8 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `panel_orchestrator.py` | `modules/panels/orchestrator.py` | Modules |
| `panel_template_service.py` | `modules/panels/templates.py` | Modules |
| `panel_type_handlers.py` | `modules/panels/type_handlers.py` | Modules |
| `unified_panel_service.py` | `modules/panels/unified.py` | Modules |
| `consensus_analyzer.py` | `modules/panels/consensus_analyzer.py` | Modules |
| `consensus_calculator.py` | `modules/panels/consensus_calculator.py` | Modules |
| `ask_panel_config.py` | `modules/panels/config.py` | Modules |
| `comparison_matrix_builder.py` | `modules/panels/comparison_matrix.py` | Modules |

### Category 5: Value & Analytics Services (7 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `roi_calculator_service.py` | `ontology/l7_value/roi_calculator.py` | L7 |
| `confidence_calculator.py` | `ontology/l6_analytics/confidence.py` | L6 |
| `response_quality.py` | `ontology/l6_analytics/response_quality.py` | L6 |
| `ab_testing_framework.py` | `ontology/l6_analytics/ab_testing.py` | L6 |
| `feedback_manager.py` | `ontology/l6_analytics/feedback.py` | L6 |
| `recommendation_engine.py` | `ontology/l4_agents/recommendation.py` | L4 |
| `langfuse_monitor.py` | `monitoring/langfuse.py` | Infra |

### Category 6: Infrastructure Services (12 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `supabase_client.py` | `infrastructure/database/supabase.py` | Infra |
| `tenant_aware_supabase.py` | `infrastructure/database/tenant_aware.py` | Infra |
| `neo4j_client.py` | `infrastructure/database/neo4j.py` | Infra |
| `neo4j_sync_service.py` | `infrastructure/database/neo4j_sync.py` | Infra |
| `pinecone_sync_service.py` | `infrastructure/database/pinecone_sync.py` | Infra |
| `embedding_service.py` | `infrastructure/llm/embeddings.py` | Infra |
| `embedding_service_factory.py` | `infrastructure/llm/embedding_factory.py` | Infra |
| `huggingface_embedding_service.py` | `infrastructure/llm/huggingface_embeddings.py` | Infra |
| `llm_service.py` | `infrastructure/llm/service.py` | Infra |
| `cache_manager.py` | `core/caching.py` (merge) | Core |
| `search_cache.py` | `core/search_cache.py` | Core |
| `resilience.py` | `core/resilience.py` (merge) | Core |

### Category 7: Domain Knowledge Services (8 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `query_classifier.py` | `ontology/l0_domain/query_classifier.py` | L0 |
| `smart_metadata_extractor.py` | `ontology/l0_domain/metadata_extractor.py` | L0 |
| `metadata_processing_service.py` | `ontology/l0_domain/metadata_processor.py` | L0 |
| `compliance_service.py` | `ontology/l0_domain/compliance.py` | L0 |
| `copyright_checker.py` | `ontology/l0_domain/copyright.py` | L0 |
| `data_sanitizer.py` | `ontology/l0_domain/sanitizer.py` | L0 |
| `graph_relationship_builder.py` | `graphrag/relationship_builder.py` | L0 |
| `knowledge/` directory | `ontology/l0_domain/knowledge/` | L0 |

### Category 8: Artifact & Content Services (5 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `artifact_generator.py` | `ontology/l5_execution/artifact_generator.py` | L5 |
| `autonomous_controller.py` | `ontology/l5_execution/autonomous_controller.py` | L5 |
| `autonomous_enhancements.py` | `ontology/l5_execution/autonomous_enhancements.py` | L5 |
| `file_renamer.py` | `utils/file_renamer.py` | Utils |
| `publisher.py` | `ontology/l5_execution/publisher.py` | L5 |

### Category 9: Mission & Execution Services (5 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `mission_repository.py` | `ontology/l5_execution/mission_repository.py` | L5 |
| `mission_service.py` | `ontology/l5_execution/mission_service.py` | L5 |
| `runner_registry.py` | `runners/registry.py` | Runners |
| `real_worker_pool_manager.py` | `workers/pool_manager.py` | Workers |
| `config_resolvers/` | `ontology/l2_process/config_resolvers/` | L2 |

### Category 10: HITL Services (2 files)

| Current File | Proposed Location | Layer |
|--------------|-------------------|-------|
| `hitl_service.py` | `ontology/l5_execution/hitl.py` | L5 |
| `hitl_websocket_service.py` | `ontology/l5_execution/hitl_websocket.py` | L5 |

---

## Migration Summary by Layer

### L0 Domain Knowledge (14 files)
```
ontology/l0_domain/
├── __init__.py
├── evidence_types.py          # From evidence_detector.py
├── evidence_selector.py       # From evidence_based_selector.py
├── evidence_scoring.py        # From evidence_scoring_service.py
├── multi_domain.py            # From multi_domain_evidence_detector.py
├── citations.py               # From citation_prompt_enhancer.py
├── query_classifier.py        # From query_classifier.py
├── metadata_extractor.py      # From smart_metadata_extractor.py
├── metadata_processor.py      # From metadata_processing_service.py
├── compliance.py              # From compliance_service.py
├── copyright.py               # From copyright_checker.py
├── sanitizer.py               # From data_sanitizer.py
└── knowledge/                 # From knowledge/ directory
```

### L4 Agent Coordination (14 files)
```
ontology/l4_agents/
├── __init__.py
├── registry.py                # From agent_service.py
├── hierarchy.py               # From agent_hierarchy_service.py
├── instantiation.py           # From agent_instantiation_service.py
├── orchestration.py           # From agent_orchestrator.py
├── pool_manager.py            # From agent_pool_manager.py
├── enrichment.py              # From agent_enrichment_service.py
├── skills.py                  # From agent_db_skills_service.py
├── skills_loader.py           # From skills_loader_service.py
├── search.py                  # From hybrid_agent_search.py
├── spawner.py                 # From sub_agent_spawner.py
├── loader.py                  # From unified_agent_loader.py
├── tool_registry.py           # From tool_registry_service.py
├── recommendation.py          # From recommendation_engine.py
└── selectors/
    └── medical_affairs.py     # From medical_affairs_agent_selector.py
```

### L5 Execution (15 files)
```
ontology/l5_execution/
├── __init__.py
├── session_manager.py         # From session_manager.py
├── session_memory.py          # From session_memory_service.py
├── conversation.py            # From conversation_manager.py
├── conversation_enhanced.py   # From enhanced_conversation_manager.py
├── checkpoints.py             # From checkpoint_store.py
├── mission_repository.py      # From mission_repository.py
├── mission_service.py         # From mission_service.py
├── artifact_generator.py      # From artifact_generator.py
├── autonomous_controller.py   # From autonomous_controller.py
├── autonomous_enhancements.py # From autonomous_enhancements.py
├── evidence_gatherer.py       # From mode1_evidence_gatherer.py
├── publisher.py               # From publisher.py
├── hitl.py                    # From hitl_service.py
└── hitl_websocket.py          # From hitl_websocket_service.py
```

### L6 Analytics (8 files)
```
ontology/l6_analytics/
├── __init__.py
├── session_analytics.py       # From session_analytics_service.py
├── conversation_analysis.py   # From conversation_history_analyzer.py
├── agent_usage.py             # From agent_usage_tracker.py
├── confidence.py              # From confidence_calculator.py
├── response_quality.py        # From response_quality.py
├── faithfulness.py            # From faithfulness_scorer.py
├── ab_testing.py              # From ab_testing_framework.py
└── feedback.py                # From feedback_manager.py
```

### L7 Value Transformation (1 file + new)
```
ontology/l7_value/
├── __init__.py
├── roi_calculator.py          # From roi_calculator_service.py
├── value_drivers.py           # NEW
├── vpanes_scorer.py           # NEW
├── odi_calculator.py          # NEW
└── value_realization.py       # NEW
```

---

## Migration Script Template

```python
# scripts/migrate_services_to_ontology.py
"""
Migration script to reorganize services into ontology layers.
Run with: python scripts/migrate_services_to_ontology.py --dry-run
"""

import os
import shutil
from pathlib import Path

MIGRATIONS = {
    # L0 Domain
    "services/evidence_detector.py": "ontology/l0_domain/evidence_types.py",
    "services/evidence_based_selector.py": "ontology/l0_domain/evidence_selector.py",
    # ... add all mappings
}

def migrate(dry_run: bool = True):
    base = Path("services/ai-engine/src")

    for src, dst in MIGRATIONS.items():
        src_path = base / src
        dst_path = base / dst

        if not src_path.exists():
            print(f"SKIP: {src} not found")
            continue

        if dry_run:
            print(f"WOULD MOVE: {src} -> {dst}")
        else:
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(src_path, dst_path)
            print(f"MOVED: {src} -> {dst}")

            # Update __init__.py
            # Update imports in other files
            # ...

if __name__ == "__main__":
    import sys
    dry_run = "--dry-run" in sys.argv
    migrate(dry_run=dry_run)
```

---

## Import Update Guide

After moving files, update imports using this pattern:

### Before
```python
from services.agent_enrichment_service import AgentEnrichmentService
from services.evidence_detector import EvidenceDetector
from services.roi_calculator_service import ROICalculator
```

### After
```python
from ontology.l4_agents.enrichment import AgentEnrichmentService
from ontology.l0_domain.evidence_types import EvidenceDetector
from ontology.l7_value.roi_calculator import ROICalculator
```

### Backward Compatibility (Transition Period)

```python
# services/__init__.py (deprecation wrapper)
import warnings

def __getattr__(name):
    deprecation_map = {
        "AgentEnrichmentService": "ontology.l4_agents.enrichment",
        "EvidenceDetector": "ontology.l0_domain.evidence_types",
        "ROICalculator": "ontology.l7_value.roi_calculator",
    }
    if name in deprecation_map:
        warnings.warn(
            f"{name} has moved to {deprecation_map[name]}. "
            "Update your imports.",
            DeprecationWarning,
            stacklevel=2
        )
        module = __import__(deprecation_map[name], fromlist=[name])
        return getattr(module, name)
    raise AttributeError(f"module 'services' has no attribute '{name}'")
```

---

## Runners Reorganization

### Current State (3 Fragmented Locations)

| Location | Contents | Files |
|----------|----------|-------|
| `runners/` | Framework + Core + Pharma | 12 |
| `langgraph_workflows/task_runners/` | 28 Task Families | ~100 |
| `langgraph_workflows/modes34/runners/` | Mode 3/4 Specific | ~10 |

### Proposed Consolidation

```
ontology/l5_execution/
├── runners/                              # Consolidated runners
│   ├── framework/                        # From runners/
│   │   ├── base.py                       # BaseRunner class
│   │   ├── executor.py                   # Runner execution
│   │   ├── assembler.py                  # Runner assembly
│   │   └── registry.py                   # Registration
│   │
│   ├── core/                             # From runners/core/
│   │   ├── critique.py
│   │   ├── decompose.py
│   │   ├── investigate.py
│   │   ├── recommend.py
│   │   ├── synthesize.py
│   │   └── validate.py
│   │
│   ├── pharma/                           # From runners/pharma/
│   │   ├── brand_strategy.py
│   │   ├── market_access.py
│   │   └── medical_affairs.py
│   │
│   └── families/                         # From langgraph_workflows/task_runners/
│       ├── investigate/
│       ├── synthesize/
│       ├── validate/
│       ├── create/
│       ├── design/
│       └── ... (22 more families)
```

### Runner Migration Mapping

| Current Path | Proposed Path |
|--------------|---------------|
| `runners/base.py` | `ontology/l5_execution/runners/framework/base.py` |
| `runners/executor.py` | `ontology/l5_execution/runners/framework/executor.py` |
| `runners/core/*.py` | `ontology/l5_execution/runners/core/*.py` |
| `runners/pharma/*.py` | `ontology/l5_execution/runners/pharma/*.py` |
| `langgraph_workflows/task_runners/*` | `ontology/l5_execution/runners/families/*` |
| `langgraph_workflows/modes34/runners/*` | `ontology/l5_execution/runners/modes34/*` |

---

## Workflows Reorganization

### Current State (2 Locations)

| Location | Contents | Files |
|----------|----------|-------|
| `workflows/` | Legacy panel workflow | 1 |
| `langgraph_workflows/` | All LangGraph workflows | 50+ |

### Proposed Structure

```
ontology/l2_process/
├── workflows/                            # Workflow definitions
│   ├── templates/                        # DB-driven templates
│   │   ├── ask_expert_template.py
│   │   ├── ask_panel_template.py
│   │   └── autonomous_template.py
│   │
│   └── engine/                           # Workflow engine
│       ├── base_workflow.py              # From langgraph_workflows/
│       ├── checkpoint_manager.py
│       └── state_schemas.py

langgraph_workflows/                       # KEEP - LangGraph implementations
├── ask_expert/                           # Mode 1/2 (keep)
├── ask_panel_enhanced/                   # Panel (keep)
├── modes34/                              # Mode 3/4 (keep)
│   ├── unified_autonomous_workflow.py
│   ├── agent_selector.py
│   ├── research_quality.py
│   └── wrappers/
└── shared/                               # Shared utilities (keep)
```

### Workflow Migration Notes

1. **Keep `langgraph_workflows/`** - This is the main workflow implementation location
2. **Remove `workflows/`** - Migrate `simple_panel_workflow.py` or delete if unused
3. **Add `ontology/l2_process/workflows/`** - For DB-driven workflow templates
4. **Link workflows to JTBDs** - New `workflow_jtbd_mapping` in `ontology/l3_jtbd/`

---

## Agents Reorganization

### Current Naming (Conflicts with Ontology)

```
agents/
├── l1_orchestrators/    # Conflicts with L0-L7 ontology layers
├── l2_experts/
├── l3_specialists/
├── l4_workers/
└── l5_tools/
```

### Proposed Naming (Semantic)

```
agents/
├── orchestrators/       # Was l1_orchestrators
├── experts/             # Was l2_experts
├── specialists/         # Was l3_specialists
├── workers/             # Was l4_workers
└── tools/               # Was l5_tools
```

### Agent Migration Commands

```bash
# Rename directories (preserve git history)
git mv agents/l1_orchestrators agents/orchestrators
git mv agents/l2_experts agents/experts
git mv agents/l3_specialists agents/specialists
git mv agents/l4_workers agents/workers
git mv agents/l5_tools agents/tools

# Update imports across codebase
find . -name "*.py" -exec sed -i '' 's/agents.l1_orchestrators/agents.orchestrators/g' {} \;
find . -name "*.py" -exec sed -i '' 's/agents.l2_experts/agents.experts/g' {} \;
find . -name "*.py" -exec sed -i '' 's/agents.l3_specialists/agents.specialists/g' {} \;
find . -name "*.py" -exec sed -i '' 's/agents.l4_workers/agents.workers/g' {} \;
find . -name "*.py" -exec sed -i '' 's/agents.l5_tools/agents.tools/g' {} \;
```

---

## Complete Migration Summary

| Component | Current | Proposed | Action |
|-----------|---------|----------|--------|
| **Services (85)** | `services/*.py` | `ontology/l0-l7/` | Reorganize by layer |
| **Runners (120+)** | 3 locations | `ontology/l5_execution/runners/` | Consolidate |
| **Workflows** | 2 locations | `langgraph_workflows/` + `ontology/l2_process/` | Keep + add templates |
| **Agents** | `agents/l1-l5/` | `agents/{semantic}/` | Rename directories |
| **Empty Modules** | `modules/{empty}/` | Remove or populate | Clean up |

---

## Validation Checklist

After migration, verify:

- [ ] All imports resolve correctly
- [ ] Tests pass
- [ ] API endpoints work
- [ ] No circular imports
- [ ] Documentation updated
- [ ] IDE autocomplete works
- [ ] Deprecation warnings fire for old imports

---

*Last Updated: December 17, 2025*
