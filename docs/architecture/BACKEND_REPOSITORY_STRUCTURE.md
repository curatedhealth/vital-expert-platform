# VITAL Path Backend - Repository Structure Audit

**Version:** 1.1
**Date:** December 13, 2025
**Scope:** Full hierarchical audit from L0 (root) to lowest branch
**Updated:** Phase 2 HIGH Priority fixes (H1/H7) - resilience infrastructure and tests added

---

## Table of Contents

1. [L0: Root Level](#l0-root-level)
2. [L1: Primary Directories](#l1-primary-directories)
3. [L2-L6: Deep Directory Analysis](#l2-l6-deep-directory-analysis)
4. [File Size Analysis](#file-size-analysis)
5. [Structural Issues](#structural-issues)
6. [Recommendations](#recommendations)

---

## L0: Root Level

```
services/ai-engine/                    # Root of backend service
├── .env                               # Environment variables (10.7KB)
├── .env.local -> ../../.env.vercel    # Symlink to Vercel env
├── .dockerignore                      # Docker ignore rules
├── .gitignore                         # Git ignore rules
├── .railway.env.dev                   # Railway dev environment
├── .railway.env.preview               # Railway preview environment
├── .railway.env.production            # Railway production environment
├── Dockerfile                         # Production Docker config (2.3KB)
├── Dockerfile.backup                  # Backup Docker config
├── README.md                          # Documentation (9.5KB)
├── conftest.py                        # Pytest root config (3.7KB)
├── docker-build.sh                    # Docker build script
├── pyproject.toml                     # Python project config (1.3KB)
├── pytest.ini                         # Pytest configuration (1.2KB)
├── railway.env.template               # Railway env template
├── railway.toml                       # Railway deployment config
├── requirements.txt                   # Python dependencies (1.6KB)
├── runtime.txt                        # Python runtime version
├── start-ai-engine.sh                 # Startup script
├── start-backend.sh                   # Backend startup
├── start-dev.sh                       # Development startup
├── start.sh                           # Main startup script
├── start_debug.sh                     # Debug startup
└── start_with_debug.sh                # Debug with logging
```

### L0 Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| Multiple .env files | 🟡 Medium | 5 environment files at root |
| Duplicate Dockerfiles | 🟡 Medium | Dockerfile and Dockerfile.backup |
| Multiple start scripts | 🟡 Medium | 6 different start scripts |
| No setup.py | 🟡 Medium | Missing for proper package installation |

---

## L1: Primary Directories

```
services/ai-engine/
├── app/                    # Alternative app entry (DUPLICATE)
│   └── api/                # 2 files
├── data/                   # Runtime data storage
│   └── checkpoints/        # LangGraph checkpoints
├── docs/                   # API documentation
│   └── skills/             # Skills documentation
├── grafana-dashboards/     # Monitoring dashboards (4 JSON files)
├── scripts/                # Utility scripts (29 files)
├── src/                    # Main source code (195 files) ⭐
└── tests/                  # Test suite (87 files)
```

### L1 Issue Analysis

| Directory | Files | Size | Issue |
|-----------|-------|------|-------|
| `app/` | 2 | Small | DUPLICATE of src/api - should be removed |
| `src/` | 195 | 6.5MB | Primary source, needs restructuring |
| `tests/` | 87 | - | Duplicates tests in src/tests |
| `scripts/` | 29 | - | Mix of utility and one-off scripts |

---

## L2-L6: Deep Directory Analysis

### L2: src/ (Main Source Code)

```
src/                                    # L2: 195 Python files, 6.5MB
├── main.py                            # 3,370 lines ⚠️ GOD OBJECT
├── agents/                            # L3: 3 files, 32KB
│   ├── clinical_researcher.py         # 364 lines
│   ├── medical_specialist.py          # 277 lines
│   └── regulatory_expert.py           # 320 lines
├── api/                               # L3: 28 files, 608KB
│   ├── __init__.py
│   ├── auth.py                        # 448 lines - Authentication
│   ├── dependencies.py                # 211 lines - DI setup
│   ├── enhanced_features.py           # 1,036 lines ⚠️
│   ├── frameworks.py                  # 951 lines ⚠️
│   ├── main.py                        # 437 lines - Alt entry point
│   ├── graphql/                       # L4: GraphQL layer
│   │   └── enterprise_ontology/       # L5: 2 files
│   │       ├── __init__.py
│   │       └── schema.py              # GraphQL schema
│   ├── routers/                       # L4: Router definitions
│   │   └── enterprise_ontology/       # L5: 5 files
│   │       ├── __init__.py
│   │       ├── agents.py
│   │       ├── ontology.py
│   │       ├── ontology_extended.py   # 672 lines
│   │       ├── personas.py
│   │       └── workflow.py
│   ├── routes/                        # L4: API routes (12 files)
│   │   ├── __init__.py
│   │   ├── ask_expert.py              # 597 lines
│   │   ├── ask_panel_streaming.py     # 623 lines
│   │   ├── hitl.py                    # 306 lines
│   │   ├── hybrid_search.py           # 731 lines ⚠️
│   │   ├── knowledge_graph.py         # 1,137 lines ⚠️
│   │   ├── mode1_manual_interactive.py# 801 lines ⚠️
│   │   ├── mode3_deep_research.py     # 155 lines
│   │   ├── mode3_manual_autonomous.py # 458 lines
│   │   ├── ontology_investigator.py   # 642 lines
│   │   ├── panels.py                  # 468 lines
│   │   ├── value_framework.py         # 454 lines
│   │   └── value_investigator.py      # 314 lines
│   └── schemas/                       # L4: Pydantic schemas
│       └── ask_expert.py              # 267 lines
├── config/                            # L3: 2 files, 28KB
│   └── model_selection_config.py      # 266 lines
├── core/                              # L3: 4 files, 52KB
│   ├── config.py                      # 220 lines - Settings
│   ├── monitoring.py                  # 90 lines
│   ├── rag_config.py                  # 221 lines
│   └── websocket_manager.py           # 314 lines
├── domain/                            # L3: 2 files, 16KB ⚠️ INSUFFICIENT
│   ├── panel_models.py                # 261 lines
│   └── panel_types.py                 # 62 lines
├── graphrag/                          # L3: 21 files, 784KB
│   ├── __init__.py                    # 161 lines
│   ├── agent_profiles.py              # 579 lines
│   ├── chunking_service.py            # 371 lines
│   ├── citation_enricher.py           # 649 lines
│   ├── config.py                      # 111 lines
│   ├── evaluation.py                  # 666 lines
│   ├── evidence_builder.py            # 141 lines
│   ├── intelligence_broker.py         # 957 lines ⚠️
│   ├── kg_view_resolver.py            # 195 lines
│   ├── models.py                      # 204 lines
│   ├── namespace_config.py            # 492 lines
│   ├── ner_service.py                 # 276 lines
│   ├── profile_resolver.py            # 247 lines
│   ├── reranker.py                    # 120 lines
│   ├── service.py                     # 120 lines
│   ├── source_authority_booster.py    # 98 lines
│   ├── strategies.py                  # 313 lines
│   ├── api/                           # L4: 4 files
│   │   ├── __init__.py
│   │   ├── auth.py                    # 62 lines
│   │   ├── graphrag.py                # 705 lines ⚠️
│   │   └── rate_limit.py              # 57 lines
│   ├── clients/                       # L4: 5 files
│   │   ├── __init__.py
│   │   ├── elastic_client.py          # 197 lines
│   │   ├── neo4j_client.py            # 210 lines
│   │   ├── postgres_client.py         # 156 lines
│   │   └── vector_db_client.py        # 211 lines
│   └── search/                        # L4: 5 files
│       ├── __init__.py
│       ├── fusion.py                  # 140 lines
│       ├── graph_search.py            # 249 lines
│       ├── keyword_search.py          # 124 lines
│       └── vector_search.py           # 170 lines
├── integrations/                      # L3: 3 files, 44KB
│   ├── __init__.py
│   ├── agent_registry.py              # 457 lines
│   └── cdc_pipeline.py                # 514 lines
├── langgraph_compilation/             # L3: 12 files, 300KB
│   ├── __init__.py                    # 28 lines
│   ├── checkpointer.py                # 58 lines
│   ├── compiler.py                    # 229 lines
│   ├── panel_service.py               # 675 lines
│   ├── state.py                       # 127 lines
│   ├── nodes/                         # L4: 7 files
│   │   ├── __init__.py
│   │   ├── agent_nodes.py             # 280 lines
│   │   ├── human_nodes.py             # 86 lines
│   │   ├── panel_nodes.py             # 141 lines
│   │   ├── router_nodes.py            # 100 lines
│   │   ├── skill_nodes.py             # 167 lines
│   │   └── tool_nodes.py              # 133 lines
│   └── patterns/                      # L4: 4 files
│       ├── __init__.py
│       ├── constitutional_ai.py       # 225 lines
│       ├── react.py                   # 282 lines
│       └── tree_of_thoughts.py        # 294 lines
├── langgraph_workflows/               # L3: 30 files, 1.2MB ⚠️ LARGEST
│   ├── __init__.py                    # 85 lines
│   ├── ask_expert_unified.py          # 1,001 lines ⚠️
│   ├── ask_panel_enhanced.py          # 1,626 lines ⚠️
│   ├── ask_panel_workflow.py          # 421 lines
│   ├── base_workflow.py               # 478 lines
│   ├── checkpoint_manager.py          # 394 lines
│   ├── enrichment_nodes.py            # 540 lines
│   ├── feedback_nodes.py              # 559 lines
│   ├── graph_compiler.py              # 397 lines
│   ├── memory_integration_mixin.py    # 237 lines
│   ├── memory_nodes.py                # 521 lines
│   ├── mode1_manual_interactive.py    # 1,703 lines ⚠️
│   ├── mode2_automatic_interactive.py # 1,432 lines ⚠️
│   ├── mode3_deep_research.py         # 155 lines
│   ├── mode3_manual_autonomous.py     # 2,487 lines ⚠️ LARGEST FILE
│   ├── mode4_automatic_autonomous.py  # 1,785 lines ⚠️
│   ├── observability.py               # 392 lines
│   ├── ontology_investigator.py       # 1,713 lines ⚠️
│   ├── postgres_checkpointer.py       # 145 lines
│   ├── react_engine.py                # 794 lines ⚠️
│   ├── shared_nodes.py                # 28 lines
│   ├── state_schemas.py               # 725 lines ⚠️
│   ├── tool_chain_executor.py         # 747 lines ⚠️
│   ├── tool_chain_mixin.py            # 201 lines
│   ├── value_investigator.py          # 856 lines ⚠️
│   ├── enterprise_ontology/           # L4: 4 files
│   │   ├── __init__.py
│   │   ├── vital_graph.py             # 277 lines
│   │   ├── vital_nodes.py             # 535 lines
│   │   └── vital_state.py             # 193 lines
│   ├── jtbd_templates/                # L4: 10 files
│   │   ├── __init__.py                # 93 lines
│   │   ├── creative_ideation.py       # 119 lines
│   │   ├── decision_memo.py           # 138 lines
│   │   ├── deep_research.py           # 167 lines
│   │   ├── evaluation_critique.py     # 109 lines
│   │   ├── monitoring_alerting.py     # 176 lines
│   │   ├── risk_assessment.py         # 152 lines
│   │   ├── strategy_options.py        # 136 lines
│   │   ├── tactical_planning.py       # 139 lines
│   │   └── template_base.py           # 242 lines
│   ├── mixins/                        # L4: Empty
│   ├── modes/                         # L4: Empty
│   ├── modes34/                       # L4: Phase 2 Resilience ✅ NEW (Dec 2025)
│   │   ├── __init__.py                # ~15 lines
│   │   └── resilience/                # L5: Exception handling
│   │       ├── __init__.py            # ~40 lines (module exports)
│   │       └── graceful_degradation.py # ~200 lines (H7 decorator)
│   └── node_compilers/                # L4: 7 files
│       ├── __init__.py
│       ├── agent_node_compiler.py     # 127 lines
│       ├── human_node_compiler.py     # 55 lines
│       ├── panel_node_compiler.py     # 65 lines
│       ├── router_node_compiler.py    # 76 lines
│       ├── skill_node_compiler.py     # 78 lines
│       └── tool_node_compiler.py      # 93 lines
├── middleware/                        # L3: 5 files, 52KB
│   ├── __init__.py                    # 16 lines
│   ├── admin_auth.py                  # 530 lines
│   ├── rate_limiting.py               # 357 lines
│   ├── tenant_context.py              # 127 lines
│   └── tenant_isolation.py            # 225 lines
├── models/                            # L3: 6 files, 100KB
│   ├── __init__.py                    # 97 lines
│   ├── artifacts.py                   # 291 lines
│   ├── l4_l5_config.py                # 301 lines
│   ├── requests.py                    # 95 lines
│   ├── responses.py                   # 84 lines
│   └── tool_metadata.py               # 605 lines
├── monitoring/                        # L3: 8 files, 152KB
│   ├── __init__.py                    # 15 lines
│   ├── clinical_monitor.py            # 623 lines
│   ├── drift_detector.py              # 703 lines ⚠️
│   ├── fairness_monitor.py            # 545 lines
│   ├── langfuse_monitor.py            # 413 lines
│   ├── models.py                      # 235 lines
│   ├── performance_monitor.py         # 726 lines ⚠️
│   └── prometheus_metrics.py          # 461 lines
├── protocols/                         # L3: 5 files, 100KB
│   ├── __init__.py                    # 13 lines
│   ├── demo_protocols.py              # 303 lines
│   ├── pharma_protocol.py             # 503 lines
│   ├── protocol_manager.py            # 825 lines ⚠️
│   └── verify_protocol.py             # 669 lines
├── repositories/                      # L3: 1 file, 16KB ⚠️ INSUFFICIENT
│   └── panel_repository.py            # 426 lines
├── scripts/                           # L3: 2 files
│   └── setup_ab_experiments.py        # 466 lines
├── services/                          # L3: 68 files, 2.4MB ⚠️ LARGEST DIR
│   ├── ab_testing_framework.py        # 672 lines
│   ├── agent_db_skills_service.py     # 349 lines
│   ├── agent_enrichment_service.py    # 962 lines ⚠️
│   ├── agent_hierarchy_service.py     # 1,509 lines ⚠️
│   ├── agent_orchestrator.py          # 1,002 lines ⚠️
│   ├── agent_pool_manager.py          # 447 lines
│   ├── agent_selector_service.py      # 613 lines
│   ├── agent_usage_tracker.py         # 368 lines
│   ├── artifact_generator.py          # 595 lines
│   ├── autonomous_controller.py       # 498 lines
│   ├── autonomous_enhancements.py     # 1,085 lines ⚠️
│   ├── cache_manager.py               # 374 lines
│   ├── citation_prompt_enhancer.py    # 247 lines
│   ├── compliance_service.py          # 580 lines
│   ├── confidence_calculator.py       # 423 lines
│   ├── consensus_calculator.py        # 89 lines
│   ├── conversation_history_analyzer.py# 705 lines ⚠️
│   ├── conversation_manager.py        # 157 lines
│   ├── copyright_checker.py           # 52 lines
│   ├── data_sanitizer.py              # 48 lines
│   ├── deepagents_tools.py            # 292 lines
│   ├── embedding_service.py           # 225 lines
│   ├── embedding_service_factory.py   # 98 lines
│   ├── enhanced_agent_selector.py     # 824 lines ⚠️
│   ├── enhanced_conversation_manager.py# 734 lines ⚠️
│   ├── evidence_based_selector.py     # 1,211 lines ⚠️
│   ├── evidence_detector.py           # 1,146 lines ⚠️
│   ├── evidence_scoring_service.py    # 178 lines
│   ├── feedback_manager.py            # 615 lines
│   ├── file_renamer.py                # 104 lines
│   ├── graph_relationship_builder.py  # 634 lines
│   ├── graphrag_selector.py           # 711 lines ⚠️
│   ├── hitl_service.py                # 521 lines
│   ├── hitl_websocket_service.py      # 575 lines
│   ├── huggingface_embedding_service.py# 235 lines
│   ├── hybrid_agent_search.py         # 177 lines
│   ├── l4_context_engineer.py         # 668 lines
│   ├── l5_pubmed_tool.py              # 287 lines
│   ├── l5_rag_tool.py                 # 298 lines
│   ├── l5_websearch_tool.py           # 367 lines
│   ├── langfuse_monitor.py            # 665 lines
│   ├── medical_affairs_agent_selector.py# 388 lines
│   ├── medical_rag.py                 # 611 lines
│   ├── metadata_processing_service.py # 89 lines
│   ├── mode1_evidence_gatherer.py     # 281 lines
│   ├── multi_domain_evidence_detector.py# 36 lines (DEPRECATED)
│   ├── neo4j_client.py                # 604 lines
│   ├── panel_orchestrator.py          # 723 lines ⚠️
│   ├── panel_template_service.py      # 163 lines
│   ├── postgres_checkpointer.py       # 761 lines ⚠️
│   ├── real_worker_pool_manager.py    # 141 lines
│   ├── recommendation_engine.py       # 609 lines
│   ├── resilience.py                  # 119 lines
│   ├── roi_calculator_service.py      # 588 lines
│   ├── search_cache.py                # 509 lines
│   ├── session_manager.py             # 866 lines ⚠️
│   ├── session_memory_service.py      # 296 lines
│   ├── skills_loader_service.py       # 738 lines ⚠️
│   ├── smart_metadata_extractor.py    # 607 lines
│   ├── streaming_manager.py           # 829 lines ⚠️
│   ├── sub_agent_spawner.py           # 735 lines ⚠️
│   ├── supabase_client.py             # 756 lines ⚠️
│   ├── tenant_aware_supabase.py       # 82 lines
│   ├── tool_registry.py               # 129 lines
│   ├── tool_registry_service.py       # 430 lines
│   ├── unified_agent_loader.py        # 565 lines
│   ├── unified_rag_service.py         # 1,511 lines ⚠️
│   └── config_resolvers/              # L4: 3 files
│       ├── __init__.py                # 18 lines
│       ├── mode1_config_resolver.py   # 114 lines
│       └── mode3_config_resolver.py   # 122 lines
├── tests/                             # L3: 25 files (DUPLICATE)
│   └── [See tests/ section below]
├── tools/                             # L3: 6 files, 112KB
│   ├── __init__.py                    # 6 lines
│   ├── base_tool.py                   # 368 lines
│   ├── medical_research_tools.py      # 578 lines
│   ├── planning_tools.py              # 357 lines
│   ├── rag_tool.py                    # 334 lines
│   └── web_tools.py                   # 531 lines
├── utils/                             # L3: 2 files, 24KB
│   ├── __init__.py                    # 18 lines
│   └── optional_imports.py            # 146 lines
├── vital_shared/                      # L3: 8 dirs, mostly empty
│   ├── interfaces/                    # Empty
│   ├── models/                        # 1 file
│   │   └── workflow_io.py
│   ├── monitoring/                    # Empty
│   ├── observability/                 # Empty
│   ├── registry/                      # Empty
│   ├── services/                      # Empty
│   ├── utils/                         # Empty
│   └── workflows/                     # Empty
├── vital_shared_kernel/               # L3: 4 files
│   ├── __init__.py
│   └── multi_tenant/                  # L4: 4 files
│       ├── __init__.py
│       ├── errors.py                  # 114 lines
│       ├── tenant_context.py          # 79 lines
│       └── tenant_id.py               # 78 lines
└── workflows/                         # L3: 1 file
    └── simple_panel_workflow.py       # 330 lines
```

### L2: tests/ (Test Suite)

```
tests/                                  # L2: 87 test files
├── __init__.py
├── conftest.py                        # Test configuration
├── test_frameworks.py
├── test_mode_integration.py
├── test_react_agent.py
├── test_tree_of_thoughts.py
├── test_unified_rag_service.py
├── api/                               # L3: 3 files
│   ├── __init__.py
│   ├── test_endpoints.py
│   └── test_panel_routes.py
├── critical/                          # L3: 17 files ⚠️ POOR NAMING
│   ├── test_core_business_logic.py
│   ├── test_final_coverage_push.py
│   ├── test_health_endpoint.py
│   ├── test_high_value_services.py
│   ├── test_infrastructure_layer.py
│   ├── test_sprint2_coverage.py       # Sprint-based naming ❌
│   ├── test_sprint3_4_execution.py    # Sprint-based naming ❌
│   ├── test_sprint5_working.py        # Sprint-based naming ❌
│   ├── test_sprint6_20_percent.py     # Sprint-based naming ❌
│   ├── test_sprint7_healthcare_benchmark.py
│   ├── test_sprint8_push_to_20.py     # Sprint-based naming ❌
│   ├── test_sprint9_push_to_22.py     # Sprint-based naming ❌
│   ├── test_sprint10_push_to_25.py    # Sprint-based naming ❌
│   ├── test_sprint11_cross_20_push_22.py
│   ├── test_sprint12_massive_execution.py
│   ├── test_sprint13_final_push_to_25.py
│   ├── test_sprint14_fix_and_push_25.py
│   ├── test_sprint15_ultimate_push_25.py
│   └── test_sprint16_push_to_22.py
├── domain/                            # L3: 1 file
│   └── test_panel_models.py
├── enterprise_ontology/               # L3: 6 files
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api.py
│   ├── test_langgraph_workflow.py
│   ├── test_pinecone_integration.py
│   └── test_supabase_integration.py
├── fixtures/                          # L3: 2 files
│   ├── __init__.py
│   └── mock_services.py
├── graph_compilation/                 # L3: 6 files
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_checkpointer.py
│   ├── test_compiler.py
│   ├── test_hierarchical.py
│   └── test_node_compilers.py
├── graphrag/                          # L3: 9 files
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api_endpoints.py
│   ├── test_clients.py
│   ├── test_database_clients.py
│   ├── test_evidence_builder.py
│   ├── test_fusion.py
│   ├── test_graphrag_integration.py
│   └── test_integration.py
├── integration/                       # L3: 11 files
│   ├── __init__.py
│   ├── test_complete_agentos_flow.py
│   ├── test_core_services.py
│   ├── test_evidence_based_integration.py
│   ├── test_mode1_flow.py
│   ├── test_mode1_manual_interactive.py
│   ├── test_mode2_auto_agent_selection.py
│   ├── test_mode3_autonomous_auto.py
│   ├── test_mode4_autonomous_manual.py
│   ├── test_workflows_enhanced.py
│   └── test_workflows_simple.py
├── langgraph_compilation/             # L3: 6 files
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_compiler.py
│   ├── test_nodes.py
│   ├── test_panel_service.py
│   └── test_patterns.py
├── security/                          # L3: 2 files ⚠️ INSUFFICIENT
│   ├── test_anon_key_rls.py
│   └── test_tenant_isolation.py
├── services/                          # L3: 4 files ⚠️ INSUFFICIENT
│   ├── test_agent_usage_tracker.py
│   ├── test_consensus_calculator.py
│   ├── test_evidence_based_selector.py
│   └── test_tenant_aware_supabase.py
├── uat/                               # L3: 2 files
│   ├── __init__.py
│   └── test_evidence_based_responses.py
├── unit/                              # L3: 8 files ✅ Phase 2 Tests Added
│   ├── __init__.py
│   ├── test_artifacts.py
│   ├── test_compliance_service.py
│   ├── test_core_services.py
│   ├── test_graceful_degradation.py  # 509 lines, 29 tests ✅ NEW (H7)
│   ├── test_l5_tools.py
│   ├── test_mode1_components.py
│   └── test_validation.py            # 386 lines, 32 tests ✅ NEW (H1)
└── workflows/                         # L3: 1 file
    └── test_simple_panel_workflow.py
```

---

## File Size Analysis

### Top 20 Largest Files

| Rank | File | Lines | Issue |
|------|------|-------|-------|
| 1 | `main.py` | 3,370 | GOD OBJECT - Split immediately |
| 2 | `mode3_manual_autonomous.py` | 2,487 | Extract workflow nodes |
| 3 | `mode4_automatic_autonomous.py` | 1,785 | Extract workflow nodes |
| 4 | `mode1_manual_interactive.py` | 1,703 | Extract workflow nodes |
| 5 | `ontology_investigator.py` | 1,713 | Extract workflow nodes |
| 6 | `ask_panel_enhanced.py` | 1,626 | Extract workflow nodes |
| 7 | `unified_rag_service.py` | 1,511 | Split by responsibility |
| 8 | `agent_hierarchy_service.py` | 1,509 | 14 classes - split |
| 9 | `mode2_automatic_interactive.py` | 1,432 | Extract workflow nodes |
| 10 | `evidence_based_selector.py` | 1,211 | Split by concern |
| 11 | `evidence_detector.py` | 1,146 | Too many types |
| 12 | `knowledge_graph.py` (route) | 1,137 | Split by endpoint |
| 13 | `autonomous_enhancements.py` | 1,085 | Split by feature |
| 14 | `enhanced_features.py` (api) | 1,036 | Split by feature |
| 15 | `agent_orchestrator.py` | 1,002 | Extract concerns |
| 16 | `ask_expert_unified.py` | 1,001 | Extract workflow nodes |
| 17 | `intelligence_broker.py` | 957 | Split by concern |
| 18 | `frameworks.py` (api) | 951 | Split by framework |
| 19 | `agent_enrichment_service.py` | 962 | Split by concern |
| 20 | `session_manager.py` | 866 | Extract concerns |

### Size Distribution

```
Files > 1000 lines:  20 files (7.1%)    ⚠️ TOO MANY
Files 500-1000:      35 files (12.5%)   ⚠️ HIGH
Files 300-500:       45 files (16.1%)   🟡 MODERATE
Files 100-300:       90 files (32.1%)   ✅ GOOD
Files < 100:         90 files (32.1%)   ✅ GOOD
```

---

## Structural Issues

### 1. Directory Depth Analysis

| Max Depth | Path Example |
|-----------|--------------|
| L6 | `src/services/knowledge/search/sources/` |
| L5 | `src/api/graphql/enterprise_ontology/` |
| L5 | `src/api/routers/enterprise_ontology/` |
| L4 | `src/langgraph_workflows/jtbd_templates/` |
| L4 | `src/graphrag/clients/` |

### 2. Empty/Near-Empty Directories

```
src/vital_shared/interfaces/      # Empty
src/vital_shared/monitoring/      # Empty
src/vital_shared/observability/   # Empty
src/vital_shared/registry/        # Empty
src/vital_shared/services/        # Empty
src/vital_shared/utils/           # Empty
src/vital_shared/workflows/       # Empty
src/langgraph_workflows/mixins/   # Empty
src/langgraph_workflows/modes/    # Empty
```

### 3. Duplicate Locations

| Source | Duplicate | Issue |
|--------|-----------|-------|
| `src/` | `app/` | Alternative entry point |
| `tests/` | `src/tests/` | Duplicate test suites |
| `src/monitoring/langfuse_monitor.py` | `src/services/langfuse_monitor.py` | Same file in 2 places |

### 4. Missing Standard Directories

```
Missing:
├── src/exceptions/      # Custom exception classes
├── src/interfaces/      # Abstract base classes
├── src/schemas/         # Centralized Pydantic schemas
├── src/events/          # Event definitions
├── src/commands/        # Command handlers
└── src/queries/         # Query handlers
```

---

## Recommendations

### Immediate Actions (P0)

1. **Delete `app/` directory** - Duplicate of src/api
2. **Consolidate test locations** - Choose `tests/` or `src/tests/`, not both
3. **Remove empty directories** in `vital_shared/`
4. **Delete duplicate `langfuse_monitor.py`**

### Structural Refactoring (P1)

1. **Split `main.py`** into:
   ```
   src/
   ├── app.py              # FastAPI app creation only
   ├── __main__.py         # Entry point
   └── api/
       ├── app.py          # App configuration
       ├── middleware.py   # All middleware
       └── dependencies.py # DI container
   ```

2. **Restructure `services/`** (67 → ~25 files):
   ```
   src/services/
   ├── agents/             # Agent-related services
   ├── rag/                # RAG services
   ├── evidence/           # Evidence services
   ├── conversation/       # Conversation services
   └── infrastructure/     # DB, cache, etc.
   ```

3. **Extract workflow nodes** from mode files:
   ```
   src/langgraph_workflows/
   ├── modes/
   │   ├── mode1.py        # Mode 1 graph definition only
   │   ├── mode2.py        # Mode 2 graph definition only
   │   ├── mode3.py        # Mode 3 graph definition only
   │   └── mode4.py        # Mode 4 graph definition only
   └── nodes/
       ├── rag_nodes.py    # RAG-related nodes
       ├── agent_nodes.py  # Agent-related nodes
       ├── tool_nodes.py   # Tool execution nodes
       └── validation_nodes.py
   ```

### Long-term Architecture (P2)

Implement Clean Architecture:

```
src/
├── domain/               # Business logic, entities
│   ├── agents/
│   ├── conversations/
│   ├── evidence/
│   └── workflows/
├── application/          # Use cases
│   ├── commands/
│   └── queries/
├── infrastructure/       # External concerns
│   ├── persistence/
│   ├── messaging/
│   └── external_apis/
└── presentation/         # API layer
    ├── rest/
    ├── graphql/
    └── websocket/
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Directories | 78 |
| Total Python Files | 282 |
| Total Lines of Code | ~120,000 |
| Max Directory Depth | 6 levels |
| Empty Directories | 9 |
| Duplicate Locations | 4 |
| Files > 1000 lines | 20 |
| Files > 500 lines | 55 |

---

## Appendix A: Duplicate Backend Analysis

### Two Backend Locations Exist

```
/VITAL path/
├── backend/                      # 472KB - LEGACY DUPLICATE
│   └── services/ai_engine/       # 44 Python files, 10,487 lines
└── services/ai-engine/           # 1.0GB - ACTIVE CODEBASE
    └── src/                      # 195 Python files, ~120,000 lines
```

### backend/ (DUPLICATE - TO DELETE)

```
backend/services/ai_engine/        # 44 files, 10,487 lines total
├── api/routes/                    # 3 files
│   ├── __init__.py
│   ├── auth.py
│   └── graphrag.py
├── graphrag/                      # 17 files
│   ├── clients/                   # 5 files (DB clients)
│   ├── context/                   # 3 files (citation/evidence)
│   ├── search/                    # 5 files (search strategies)
│   ├── utils/                     # 2 files (logger)
│   ├── config.py
│   ├── kg_view_resolver.py
│   ├── models.py
│   ├── profile_resolver.py
│   └── service.py
├── langgraph_compiler/            # 19 files ⚠️
│   ├── hierarchy/                 # 5 files (UNIQUE CODE)
│   │   ├── deep_agent_factory.py  # 406 lines
│   │   ├── delegation_engine.py   # 386 lines
│   │   ├── memory_backend.py      # 286 lines
│   │   └── subagent_middleware.py # 265 lines
│   ├── nodes/                     # 6 files
│   │   ├── agent_nodes.py         # 470 lines
│   │   ├── hierarchical_agent_nodes.py  # 333 lines (UNIQUE)
│   │   ├── other_nodes.py         # 272 lines
│   │   ├── panel_nodes.py         # 564 lines
│   │   └── skill_nodes.py         # 216 lines
│   ├── patterns/                  # 4 files
│   │   ├── constitutional_ai.py   # 460 lines
│   │   ├── react_agent.py         # 406 lines
│   │   └── tree_of_thoughts.py    # 531 lines
│   ├── checkpointer.py            # 370 lines
│   └── compiler.py                # 442 lines
└── tests/langgraph_compiler/      # 2 files
    ├── conftest.py                # 311 lines
    └── test_compiler.py           # 400 lines
```

### Recommendation: Merge Before Delete

The `backend/services/ai_engine/langgraph_compiler/hierarchy/` folder contains **unique code** not present in `services/ai-engine/`:

| File | Lines | Status |
|------|-------|--------|
| `deep_agent_factory.py` | 406 | UNIQUE - Migrate |
| `delegation_engine.py` | 386 | UNIQUE - Migrate |
| `memory_backend.py` | 286 | UNIQUE - Migrate |
| `subagent_middleware.py` | 265 | UNIQUE - Migrate |
| `hierarchical_agent_nodes.py` | 333 | UNIQUE - Migrate |

**Action Required:**
1. Review the 5 unique files for valuable code
2. Migrate any needed functionality to `services/ai-engine/src/`
3. Delete entire `backend/` directory after migration

---

## Appendix B: Root Level File Cleanup

### Files to Remove from Monorepo Root

The monorepo root has **excessive files** (100+ loose files). Clean up:

```
TO DELETE (Temporary/Debug Files):
├── tmp_*.py                       # 6 temporary files
├── tmp_*.sh                       # 3 temporary scripts
├── check_*.sql                    # 14 check scripts
├── query*.sql                     # 4 query files
├── test_*.sh                      # 2 test scripts
├── apply_*.sql                    # 1 apply script
└── high-confidence-mappings.sql   # 1 mapping file

TO RELOCATE:
├── *.md (40+ files)              # Move to /docs/
├── Makefile                      # Move to /scripts/
└── *.json (config)               # Move to /config/
```

### Target State

```
/VITAL path/                       # Monorepo root
├── .claude/                       # AI assistant docs
├── .github/                       # GitHub workflows
├── apps/                          # Frontend applications
├── database/                      # Database migrations
├── docs/                          # All documentation
├── packages/                      # Shared packages
├── scripts/                       # All scripts
├── services/                      # Backend services (ONLY ONE)
│   └── ai-engine/                 # The active backend
├── supabase/                      # Supabase config
├── tests/                         # E2E tests
├── .env.example                   # Environment template
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

---

## Appendix C: Visual Directory Map

```
VITAL path/
│
├── 🗑️ backend/                    # DELETE (duplicate)
│   └── services/ai_engine/
│
├── 📁 services/
│   └── 📦 ai-engine/              # MAIN BACKEND
│       ├── 📄 main.py             # 3,370 lines (SPLIT)
│       │
│       ├── 📁 src/
│       │   ├── 🔴 agents/         # 3 files
│       │   ├── 🟠 api/            # 28 files
│       │   │   ├── graphql/
│       │   │   ├── routers/
│       │   │   ├── routes/        # 12 files
│       │   │   └── schemas/
│       │   ├── 🟡 config/         # 2 files
│       │   ├── 🟡 core/           # 4 files
│       │   ├── 🔴 domain/         # 2 files (EXPAND)
│       │   ├── 🟠 graphrag/       # 21 files
│       │   │   ├── api/
│       │   │   ├── clients/
│       │   │   └── search/
│       │   ├── 🟡 integrations/   # 3 files
│       │   ├── 🟠 langgraph_compilation/  # 12 files
│       │   │   ├── nodes/
│       │   │   └── patterns/
│       │   ├── 🔴 langgraph_workflows/    # 30 files (LARGEST)
│       │   │   ├── enterprise_ontology/
│       │   │   ├── jtbd_templates/
│       │   │   └── node_compilers/
│       │   ├── 🟡 middleware/     # 5 files
│       │   ├── 🟡 models/         # 6 files
│       │   ├── 🟠 monitoring/     # 8 files
│       │   ├── 🟡 protocols/      # 5 files
│       │   ├── 🔴 repositories/   # 1 file (EXPAND)
│       │   ├── 🔴 services/       # 68 files (CONSOLIDATE)
│       │   ├── 🟡 tools/          # 6 files
│       │   ├── 🟡 utils/          # 2 files
│       │   ├── ⚪ vital_shared/   # EMPTY (DELETE)
│       │   └── 🟡 vital_shared_kernel/  # 4 files
│       │
│       └── 📁 tests/              # 87 files
│           ├── api/
│           ├── critical/          # RENAME tests
│           ├── domain/
│           ├── enterprise_ontology/
│           ├── fixtures/
│           ├── graph_compilation/
│           ├── graphrag/
│           ├── integration/
│           ├── langgraph_compilation/
│           ├── security/
│           ├── services/
│           ├── uat/
│           ├── unit/
│           └── workflows/
│
Legend:
🔴 = Critical issues (restructure needed)
🟠 = Medium issues (review needed)
🟡 = Minor issues
⚪ = Empty/unused
```

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-05 | AI Engineering | Initial structure audit |
| 1.1 | 2025-12-05 | AI Engineering | Added duplicate backend analysis, cleanup recommendations |
