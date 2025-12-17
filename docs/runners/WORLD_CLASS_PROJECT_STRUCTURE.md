# VITAL Platform: World-Class AI Engine Structure
## The Definitive Architecture for Runner-Based AI Services

**Version:** 1.1
**Date:** December 2025
**Status:** CANONICAL - All code restructuring should target this structure

---

# Executive Summary

This document defines the **canonical project structure** for the VITAL AI Engine. It synthesizes all architectural decisions from the runner documentation suite into a single, implementable directory structure.

**Core Principle:** The structure directly supports the **Task Formula**:

```
TASK = AGENT + RUNNER + SKILL + KNOWLEDGE + PROMPT
       ─────   ──────   ─────   ─────────   ──────
        WHO     WHAT     HOW      WITH      ABOUT
        │        │        │         │         │
        │        │        │         │         └── libraries/prompts/
        │        │        │         └──────────── libraries/knowledge/
        │        │        └────────────────────── libraries/skills/
        │        └─────────────────────────────── runners/
        └──────────────────────────────────────── domain/entities/agent.py
```

---

# The World-Class Structure

```
/services/ai-engine/
│
├── src/
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LAYER 1: RUNNERS (The Cognitive Operations)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── 📁 runners/                          # 215 Total Runners
│   │   ├── __init__.py                      # Public exports
│   │   ├── registry.py                      # UnifiedRunnerRegistry
│   │   │
│   │   ├── 📁 base/                         # Abstract base classes
│   │   │   ├── __init__.py
│   │   │   ├── task_runner.py               # TaskRunner[InputT, OutputT]
│   │   │   ├── family_runner.py             # BaseFamilyRunner[StateT]
│   │   │   ├── interfaces.py                # Protocols & ABCs
│   │   │   └── mixins.py                    # Streaming, HITL, Retry mixins
│   │   │
│   │   ├── 📁 families/                     # 8 Family Runners (Complex Workflows)
│   │   │   ├── __init__.py
│   │   │   ├── deep_research.py             # ToT → CoT → Reflection
│   │   │   ├── strategy.py                  # SWOT, Scenarios, Roadmaps
│   │   │   ├── evaluation.py                # MCDA Decision Analysis
│   │   │   ├── investigation.py             # Bayesian Root Cause
│   │   │   ├── problem_solving.py           # Hypothesis → Test → Iterate
│   │   │   ├── communication.py             # Audience-led Messaging
│   │   │   ├── monitoring.py                # Signal Tracking
│   │   │   └── generic.py                   # Flexible Fallback
│   │   │
│   │   ├── 📁 cognitive/                    # 88+ Task Runners (22 Categories)
│   │   │   ├── __init__.py
│   │   │   │
│   │   │   ├── 📁 understand/               # Knowledge Acquisition
│   │   │   │   ├── scan.py                  # scan_001: Broad landscape scan
│   │   │   │   ├── explore.py               # explore_001: Deep dive
│   │   │   │   ├── gap_detect.py            # gap_detect_001: Find missing
│   │   │   │   └── extract.py               # extract_001: Extract specific
│   │   │   │
│   │   │   ├── 📁 evaluate/                 # Quality Assessment
│   │   │   │   ├── critique.py              # critique_001: MCDA rubric
│   │   │   │   ├── compare.py               # compare_001: Side-by-side
│   │   │   │   ├── score.py                 # score_001: Weighted scoring
│   │   │   │   └── benchmark.py             # benchmark_001: Reference compare
│   │   │   │
│   │   │   ├── 📁 decide/                   # Strategic Choice
│   │   │   │   ├── frame.py                 # frame_001: Structure decision
│   │   │   │   ├── option_gen.py            # option_gen_001: Alternatives
│   │   │   │   ├── tradeoff.py              # tradeoff_001: Trade-off analysis
│   │   │   │   └── recommend.py             # recommend_001: Recommendation
│   │   │   │
│   │   │   ├── 📁 create/                   # Content Generation
│   │   │   │   ├── draft.py                 # draft_001: Generate draft
│   │   │   │   ├── expand.py                # expand_001: Expand section
│   │   │   │   ├── format.py                # format_001: Apply formatting
│   │   │   │   └── citation.py              # citation_001: Add citations
│   │   │   │
│   │   │   ├── 📁 synthesize/               # Integration
│   │   │   │   ├── collect.py               # collect_001: Gather sources
│   │   │   │   ├── theme.py                 # theme_001: Extract themes
│   │   │   │   ├── resolve.py               # resolve_001: Resolve conflicts
│   │   │   │   └── narrate.py               # narrate_001: Build narrative
│   │   │   │
│   │   │   ├── 📁 validate/                 # Verification
│   │   │   │   ├── compliance_check.py      # compliance_check_001
│   │   │   │   ├── fact_check.py            # fact_check_001
│   │   │   │   ├── citation_check.py        # citation_check_001
│   │   │   │   └── consistency_check.py     # consistency_check_001
│   │   │   │
│   │   │   ├── 📁 plan/                     # Scheduling
│   │   │   │   ├── decompose.py             # decompose_001: Break down
│   │   │   │   ├── dependency.py            # dependency_001: Map deps
│   │   │   │   ├── schedule.py              # schedule_001: Timeline
│   │   │   │   └── resource.py              # resource_001: Allocate
│   │   │   │
│   │   │   ├── 📁 watch/                    # Monitoring
│   │   │   │   ├── baseline.py              # baseline_001: Establish
│   │   │   │   ├── delta.py                 # delta_001: Detect changes
│   │   │   │   ├── alert.py                 # alert_001: Evaluate alerts
│   │   │   │   └── trend.py                 # trend_001: Extrapolate
│   │   │   │
│   │   │   ├── 📁 investigate/              # Causal Analysis
│   │   │   │   ├── detect.py                # detect_001: Anomalies
│   │   │   │   ├── hypothesize.py           # hypothesize_001: Generate
│   │   │   │   ├── evidence.py              # evidence_001: Gather
│   │   │   │   └── conclude.py              # conclude_001: Draw conclusions
│   │   │   │
│   │   │   ├── 📁 solve/                    # Problem Resolution
│   │   │   │   ├── diagnose.py              # diagnose_001: Identify blockers
│   │   │   │   ├── pathfind.py              # pathfind_001: Find path
│   │   │   │   ├── alternative.py           # alternative_001: Generate alts
│   │   │   │   └── unblock.py               # unblock_001: Resolve
│   │   │   │
│   │   │   ├── 📁 prepare/                  # Readiness
│   │   │   │   ├── context.py               # context_001: Gather context
│   │   │   │   ├── anticipate.py            # anticipate_001: Predict Q&A
│   │   │   │   ├── brief.py                 # brief_001: Generate brief
│   │   │   │   └── talking_point.py         # talking_point_001: Key messages
│   │   │   │
│   │   │   ├── 📁 refine/                   # Optimization
│   │   │   │   ├── critic.py                # critic_001: Identify weaknesses
│   │   │   │   ├── mutate.py                # mutate_001: Generate variations
│   │   │   │   ├── verify.py                # verify_001: Test improvement
│   │   │   │   └── select.py                # select_001: Choose best
│   │   │   │
│   │   │   ├── 📁 predict/                  # Forecasting
│   │   │   │   ├── trend_analyze.py         # trend_analyze_001
│   │   │   │   ├── scenario.py              # scenario_001: Generate scenarios
│   │   │   │   ├── project.py               # project_001: Project future
│   │   │   │   └── uncertainty.py           # uncertainty_001: Quantify
│   │   │   │
│   │   │   ├── 📁 engage/                   # Stakeholder
│   │   │   │   ├── profile.py               # profile_001: Profile stakeholder
│   │   │   │   ├── interest.py              # interest_001: Map interests
│   │   │   │   ├── touchpoint.py            # touchpoint_001: Design engagement
│   │   │   │   └── message.py               # message_001: Craft message
│   │   │   │
│   │   │   ├── 📁 align/                    # Consensus
│   │   │   │   ├── position.py              # position_001: Map positions
│   │   │   │   ├── common_ground.py         # common_ground_001: Find common
│   │   │   │   ├── objection.py             # objection_001: Identify objections
│   │   │   │   └── consensus.py             # consensus_001: Propose consensus
│   │   │   │
│   │   │   ├── 📁 influence/                # Persuasion
│   │   │   │   ├── audience_analyze.py      # audience_analyze_001
│   │   │   │   ├── position_calc.py         # position_calc_001: BATNA/ZOPA
│   │   │   │   ├── argument.py              # argument_001: Construct
│   │   │   │   └── counter.py               # counter_001: Generate counter
│   │   │   │
│   │   │   ├── 📁 adapt/                    # Transformation
│   │   │   │   ├── localize.py              # localize_001: Localize content
│   │   │   │   ├── audience_adapt.py        # audience_adapt_001: Adapt
│   │   │   │   ├── format_convert.py        # format_convert_001: Convert
│   │   │   │   └── reg_adapt.py             # reg_adapt_001: Regulatory adapt
│   │   │   │
│   │   │   ├── 📁 discover/                 # Opportunity
│   │   │   │   ├── white_space.py           # white_space_001: Find gaps
│   │   │   │   ├── differentiate.py         # differentiate_001: Find diff
│   │   │   │   ├── repurpose.py             # repurpose_001: Find new uses
│   │   │   │   └── opportunity_score.py     # opportunity_score_001
│   │   │   │
│   │   │   ├── 📁 design/                   # Structure Work
│   │   │   │   ├── panel_design.py          # panel_design_001
│   │   │   │   ├── workflow_design.py       # workflow_design_001
│   │   │   │   ├── eval_design.py           # eval_design_001
│   │   │   │   └── research_design.py       # research_design_001
│   │   │   │
│   │   │   ├── 📁 govern/                   # Compliance
│   │   │   │   ├── policy_check.py          # policy_check_001
│   │   │   │   ├── sanitize.py              # sanitize_001: Remove sensitive
│   │   │   │   ├── audit_log.py             # audit_log_001
│   │   │   │   └── permission_check.py      # permission_check_001
│   │   │   │
│   │   │   └── 📁 execute/                  # Operations
│   │   │       ├── state_read.py            # state_read_001
│   │   │       ├── transition.py            # transition_001: Next state
│   │   │       ├── action.py                # action_001: Execute
│   │   │       └── escalate.py              # escalate_001: To human
│   │   │
│   │   └── 📁 pharma/                       # 119 Pharmaceutical Domain Runners
│   │       ├── __init__.py
│   │       ├── 📁 foresight/                # Strategic Foresight (15)
│   │       ├── 📁 brand_strategy/           # Brand Planning (22)
│   │       ├── 📁 digital_health/           # Digital Strategy (20)
│   │       ├── 📁 medical_affairs/          # Medical Affairs (21)
│   │       ├── 📁 market_access/            # Market Access (21)
│   │       └── 📁 design_thinking/          # Design Thinking (20)
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LAYER 2: LIBRARIES (The Reusable Assets - Task Formula Support)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── 📁 libraries/
│   │   ├── __init__.py
│   │   │
│   │   ├── 📁 prompts/                      # WHO - Agent Prompts
│   │   │   ├── __init__.py
│   │   │   ├── loader.py                    # Load prompts from DB/files
│   │   │   ├── composer.py                  # Compose multi-part prompts
│   │   │   └── 📁 templates/
│   │   │       ├── 📁 agents/               # Agent system prompts
│   │   │       ├── 📁 runners/              # Runner-specific prompts
│   │   │       └── 📁 panels/               # Panel facilitator prompts
│   │   │
│   │   ├── 📁 skills/                       # HOW - Skill Definitions
│   │   │   ├── __init__.py
│   │   │   ├── loader.py                    # Load skill definitions
│   │   │   ├── matcher.py                   # Match skill to request
│   │   │   └── 📁 definitions/
│   │   │       ├── 📁 cognitive/            # Maps to cognitive runners
│   │   │       ├── 📁 family/               # Maps to family runners
│   │   │       └── 📁 pharma/               # Maps to pharma runners
│   │   │
│   │   ├── 📁 knowledge/                    # WITH - Knowledge Domains
│   │   │   ├── __init__.py
│   │   │   ├── loader.py                    # Load knowledge domains
│   │   │   ├── retriever.py                 # RAG retrieval
│   │   │   ├── injector.py                  # Inject into prompts
│   │   │   └── 📁 domains/
│   │   │       ├── 📁 therapeutic_areas/    # Disease knowledge
│   │   │       ├── 📁 regulatory/           # Regulatory frameworks
│   │   │       ├── 📁 payer/                # Payer landscape
│   │   │       ├── 📁 scientific/           # Scientific standards
│   │   │       └── 📁 competitive/          # Competitive intel
│   │   │
│   │   └── 📁 workflows/                    # Workflow Templates
│   │       ├── __init__.py
│   │       ├── loader.py                    # Load workflow templates
│   │       ├── validator.py                 # Validate definitions
│   │       ├── schema.py                    # TaskDefinition, WorkflowComposition
│   │       └── 📁 templates/
│   │           ├── 📁 research/             # Research workflow templates
│   │           ├── 📁 strategy/             # Strategy workflow templates
│   │           ├── 📁 operations/           # Operations workflow templates
│   │           └── 📁 precomposed/          # Pre-composed workflows
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LAYER 3: ORCHESTRATION (The 8 Patterns + Workflow Execution)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── 📁 orchestration/
│   │   ├── __init__.py
│   │   │
│   │   ├── 📁 patterns/                     # 8 Orchestration Patterns
│   │   │   ├── __init__.py
│   │   │   ├── base_pattern.py              # BaseOrchestrationPattern ABC
│   │   │   ├── sequential.py                # Pattern 1: Sequential Pipeline
│   │   │   ├── fan_out_fan_in.py            # Pattern 2: Parallel + Merge
│   │   │   ├── monitoring_loop.py           # Pattern 3: Continuous Monitoring
│   │   │   ├── conditional.py               # Pattern 4: Conditional Branching
│   │   │   ├── iterative_refinement.py      # Pattern 5: Quality Loops
│   │   │   ├── generator_critic.py          # Pattern 6: Create → Evaluate
│   │   │   ├── saga.py                      # Pattern 7: Compensating Transactions
│   │   │   └── event_driven.py              # Pattern 8: Reactive Automation
│   │   │
│   │   ├── 📁 execution/                    # Workflow Execution Engine
│   │   │   ├── __init__.py
│   │   │   ├── mission_executor.py          # Mission lifecycle management
│   │   │   ├── workflow_engine.py           # Execute workflow DAGs
│   │   │   ├── task_executor.py             # Execute individual tasks
│   │   │   ├── checkpoint_manager.py        # State persistence/recovery
│   │   │   └── graph_builder.py             # LangGraph compilation
│   │   │
│   │   ├── 📁 hitl/                         # Human-in-the-Loop
│   │   │   ├── __init__.py
│   │   │   ├── approval_handler.py          # Handle approval requests
│   │   │   ├── intervention_points.py       # Define HITL checkpoints
│   │   │   └── escalation.py                # Escalation logic
│   │   │
│   │   └── 📁 state/                        # State Management
│   │       ├── __init__.py
│   │       ├── schemas.py                   # WorkflowState, MissionState
│   │       ├── reducers.py                  # State reduction functions
│   │       └── persistence.py               # PostgreSQL checkpointing
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LAYER 4: SERVICES (Business Logic Orchestration)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── 📁 services/
│   │   ├── __init__.py
│   │   │
│   │   ├── 📁 ask_expert/                   # L1-L4: Ask Expert Service
│   │   │   ├── __init__.py
│   │   │   ├── service.py                   # Main service class
│   │   │   ├── mode_router.py               # Route to appropriate mode
│   │   │   ├── agent_selector.py            # GraphRAG agent selection
│   │   │   ├── autonomous_controller.py     # Mode 3/4 controller
│   │   │   ├── artifact_generator.py        # Generate artifacts
│   │   │   ├── history_analyzer.py          # Conversation history
│   │   │   └── 📁 modes/
│   │   │       ├── __init__.py
│   │   │       ├── mode1_interactive.py     # Mode 1: Interactive chat
│   │   │       ├── mode2_auto_select.py     # Mode 2: Auto-select expert
│   │   │       ├── mode3_deep_research.py   # Mode 3: Deep research
│   │   │       └── mode4_background.py      # Mode 4: Background mission
│   │   │
│   │   ├── 📁 ask_panel/                    # L2: Ask Panel Service
│   │   │   ├── __init__.py
│   │   │   ├── service.py                   # Main panel service
│   │   │   ├── orchestrator.py              # Panel orchestration logic
│   │   │   ├── round_executor.py            # Execute panel rounds
│   │   │   ├── synthesizer.py               # Synthesize panel output
│   │   │   ├── consensus_analyzer.py        # Analyze consensus
│   │   │   ├── consensus_calculator.py      # Calculate consensus scores
│   │   │   ├── comparison_matrix.py         # Build comparison matrices
│   │   │   └── config.py                    # Panel configuration
│   │   │
│   │   ├── 📁 agents/                       # Agent Management Services
│   │   │   ├── __init__.py
│   │   │   ├── service.py                   # Main agent service
│   │   │   ├── enrichment_service.py        # Agent enrichment
│   │   │   ├── hierarchy_service.py         # Agent hierarchy
│   │   │   ├── instantiation_service.py     # Agent instantiation
│   │   │   ├── orchestrator.py              # Agent orchestration
│   │   │   ├── pool_manager.py              # Agent pool management
│   │   │   └── db_skills_service.py         # Agent skills from DB
│   │   │
│   │   ├── 📁 workflows/                    # L3: Workflow Service
│   │   │   ├── __init__.py
│   │   │   ├── service.py                   # Workflow service
│   │   │   └── template_service.py          # User template management
│   │   │
│   │   ├── 📁 solutions/                    # L4: Solution Service
│   │   │   ├── __init__.py
│   │   │   ├── service.py                   # Solution service
│   │   │   ├── phase_executor.py            # Execute solution phases
│   │   │   └── integrator.py                # Integrate workflow outputs
│   │   │
│   │   ├── 📁 strategic_advisor/            # L5: Strategic Advisor
│   │   │   ├── __init__.py
│   │   │   ├── service.py                   # Strategic advisor service
│   │   │   └── memory_manager.py            # Persistent context
│   │   │
│   │   └── 📁 shared/                       # Shared Service Utilities
│   │       ├── __init__.py
│   │       ├── cache_manager.py             # Caching
│   │       ├── cost_tracker.py              # Token/cost tracking
│   │       ├── confidence_calculator.py     # Confidence scores
│   │       ├── quality_checker.py           # Output quality validation
│   │       ├── task_assembler.py            # Assemble Task = Agent + Skill
│   │       ├── knowledge_injector.py        # Inject knowledge context
│   │       ├── conversation_manager.py      # Conversation management
│   │       ├── compliance_service.py        # Compliance checks
│   │       ├── data_sanitizer.py            # Data sanitization
│   │       ├── copyright_checker.py         # Copyright checks
│   │       └── ab_testing.py                # A/B testing framework
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LAYER 5: DOMAIN (Core Entities & Value Objects)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── 📁 domain/
│   │   ├── __init__.py
│   │   │
│   │   ├── 📁 entities/                     # Core domain models
│   │   │   ├── agent.py                     # Agent entity (WHO)
│   │   │   ├── skill.py                     # Skill entity (HOW)
│   │   │   ├── knowledge.py                 # Knowledge domain (WITH)
│   │   │   ├── workflow.py                  # Workflow template
│   │   │   ├── task.py                      # Task definition
│   │   │   ├── mission.py                   # Mission entity (Mode 3/4)
│   │   │   └── panel.py                     # Panel session entity
│   │   │
│   │   ├── 📁 value_objects/                # Immutable domain values
│   │   │   ├── runner_input.py              # Runner input types
│   │   │   ├── runner_output.py             # Runner output types
│   │   │   ├── execution_context.py         # Execution context
│   │   │   └── quality_result.py            # Quality check results
│   │   │
│   │   └── 📁 events/                       # Domain events
│   │       ├── mission_events.py            # Mission lifecycle events
│   │       ├── workflow_events.py           # Workflow execution events
│   │       └── panel_events.py              # Panel session events
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LAYER 6: INFRASTRUCTURE (External Dependencies)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── 📁 infrastructure/
│   │   ├── __init__.py
│   │   │
│   │   ├── 📁 database/                     # PostgreSQL/Supabase
│   │   │   ├── connection.py                # Connection pool
│   │   │   └── 📁 repositories/
│   │   │       ├── agent_repository.py
│   │   │       ├── runner_repository.py
│   │   │       ├── workflow_repository.py
│   │   │       ├── mission_repository.py
│   │   │       └── template_repository.py
│   │   │
│   │   ├── 📁 llm/                          # LLM Integration
│   │   │   ├── provider.py                  # LLM provider abstraction
│   │   │   ├── openai_client.py             # OpenAI/Azure OpenAI
│   │   │   ├── anthropic_client.py          # Anthropic Claude
│   │   │   ├── token_counter.py             # Token counting
│   │   │   └── rate_limiter.py              # Rate limiting
│   │   │
│   │   ├── 📁 vector_stores/                # Vector Databases
│   │   │   ├── pinecone_client.py           # Pinecone for agents
│   │   │   ├── pgvector_client.py           # pgvector for knowledge
│   │   │   └── embeddings.py                # Embedding generation
│   │   │
│   │   ├── 📁 graph/                        # Neo4j Graph Database
│   │   │   ├── neo4j_client.py              # Neo4j connection
│   │   │   └── queries.py                   # Cypher queries
│   │   │
│   │   ├── 📁 cache/                        # Caching Layer
│   │   │   ├── redis_client.py              # Redis cache
│   │   │   └── memory_cache.py              # In-memory fallback
│   │   │
│   │   └── 📁 messaging/                    # Background Jobs
│   │       ├── task_queue.py                # Task queue
│   │       └── webhooks.py                  # Webhook delivery
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LAYER 7: API (HTTP Endpoints)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── 📁 api/
│   │   ├── __init__.py
│   │   ├── main.py                          # FastAPI app entry
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── health.py                    # Health checks
│   │   │   ├── ask_expert.py                # /api/ask-expert/*
│   │   │   ├── ask_panel.py                 # /api/ask-panel/*
│   │   │   ├── missions.py                  # /api/missions/*
│   │   │   ├── workflows.py                 # /api/workflows/*
│   │   │   ├── runners.py                   # /api/runners/*
│   │   │   ├── templates.py                 # /api/templates/*
│   │   │   └── streaming.py                 # SSE endpoints
│   │   │
│   │   ├── 📁 middleware/
│   │   │   ├── auth.py                      # Authentication
│   │   │   ├── tenant.py                    # Multi-tenancy
│   │   │   ├── logging.py                   # Request logging
│   │   │   └── rate_limit.py                # Rate limiting
│   │   │
│   │   ├── 📁 schemas/                      # Pydantic schemas
│   │   │   ├── 📁 request/
│   │   │   └── 📁 response/
│   │   │
│   │   └── 📁 dependencies/                 # FastAPI dependencies
│   │       ├── database.py
│   │       ├── auth.py
│   │       └── services.py
│   │
│   └── ══════════════════════════════════════════════════════════════════════
│       LAYER 8: MODULES (Workflow Designer Translation)
│       ══════════════════════════════════════════════════════════════════════
│
│   └── 📁 modules/
│       ├── __init__.py
│       │
│       └── 📁 translator/                   # ReactFlow → LangGraph
│           ├── __init__.py
│           ├── parser.py                    # JSON → Python objects
│           ├── validator.py                 # Graph structure validation
│           ├── registry.py                  # Node type → handler mapping
│           ├── compiler.py                  # LangGraph graph building
│           └── exceptions.py                # Translation errors
│
├── ══════════════════════════════════════════════════════════════════════════
│   TESTS
│   ══════════════════════════════════════════════════════════════════════════
│
├── 📁 tests/
│   ├── conftest.py                          # Shared fixtures
│   ├── 📁 unit/
│   │   ├── 📁 runners/
│   │   ├── 📁 libraries/
│   │   ├── 📁 orchestration/
│   │   └── 📁 services/
│   ├── 📁 integration/
│   │   ├── test_mode3_execution.py
│   │   ├── test_panel_execution.py
│   │   └── test_workflow_execution.py
│   └── 📁 e2e/
│       ├── test_ask_expert_api.py
│       └── test_streaming.py
│
├── 📁 config/
│   ├── settings.yaml
│   ├── logging.yaml
│   └── models.yaml
│
├── ══════════════════════════════════════════════════════════════════════════
│   SUPPORTING DIRECTORIES
│   ══════════════════════════════════════════════════════════════════════════
│
├── 📁 core/                                # Cross-cutting concerns
│   ├── __init__.py
│   ├── config.py                           # Configuration management
│   ├── logging.py                          # Logging setup
│   ├── context.py                          # Request context
│   ├── security.py                         # Security utilities
│   ├── validation.py                       # Input validation
│   ├── monitoring.py                       # Observability
│   ├── caching.py                          # Caching utilities
│   ├── resilience.py                       # Retry/circuit breaker
│   └── tracing.py                          # Distributed tracing
│
├── 📁 graphrag/                            # GraphRAG Integration
│   ├── __init__.py
│   ├── service.py                          # Main GraphRAG service
│   ├── intelligence_broker.py              # Intelligence routing
│   ├── reranker.py                         # Result reranking
│   ├── search/
│   │   ├── hybrid_search.py
│   │   └── semantic_search.py
│   └── clients/
│       ├── pinecone_client.py
│       └── neo4j_client.py
│
├── 📁 tools/                               # LLM Tools
│   ├── __init__.py
│   ├── base_tool.py                        # Base tool class
│   ├── rag_tool.py                         # RAG retrieval tool
│   ├── web_tools.py                        # Web search tools
│   ├── planning_tools.py                   # Planning tools
│   └── medical_research_tools.py           # Medical research tools
│
├── 📁 streaming/                           # Streaming Utilities
│   ├── __init__.py
│   ├── stream_manager.py                   # Main stream manager
│   ├── sse_formatter.py                    # SSE formatting
│   ├── sse_validator.py                    # SSE validation
│   ├── custom_writer.py                    # Custom stream writer
│   └── token_streamer.py                   # Token-by-token streaming
│
└── 📁 workers/                             # Background Workers
    ├── __init__.py
    ├── config.py                           # Worker configuration
    └── tasks/
        ├── mission_worker.py               # Mission background tasks
        ├── email_worker.py                 # Email notifications
        └── cleanup_worker.py               # Cleanup tasks
```

---

# Layer Summary

| Layer | Purpose | Key Components |
|-------|---------|----------------|
| **1. Runners** | Cognitive operations | 8 families + 88 cognitive + 119 pharma = 215 runners |
| **2. Libraries** | Task Formula assets | Prompts (WHO), Skills (HOW), Knowledge (WITH), Workflows |
| **3. Orchestration** | Workflow execution | 8 patterns, mission executor, HITL, state management |
| **4. Services** | Business logic | Ask Expert (L1-L4), Ask Panel, Workflows, Solutions |
| **5. Domain** | Core entities | Agent, Skill, Knowledge, Mission, Panel, Task |
| **6. Infrastructure** | External deps | Database, LLM, Vector stores, Cache, Messaging |
| **7. API** | HTTP layer | Routes, Middleware, Schemas, Dependencies |
| **8. Modules** | Translations | ReactFlow → LangGraph compiler |

---

# Runner Count Summary

| Category | Count | Location |
|----------|-------|----------|
| **Family Runners** | 8 | `runners/families/` |
| **Cognitive Runners** | 88+ | `runners/cognitive/` (22 categories × 4) |
| **Pharma Runners** | 119 | `runners/pharma/` (6 domains) |
| **TOTAL** | **215+** | |

---

# The 8 Orchestration Patterns

| # | Pattern | File | Use Case |
|---|---------|------|----------|
| 1 | Sequential Pipeline | `sequential.py` | Linear analysis flows |
| 2 | Fan-out/Fan-in | `fan_out_fan_in.py` | Parallel with merge |
| 3 | Continuous Monitoring | `monitoring_loop.py` | Ongoing tracking |
| 4 | Conditional Branching | `conditional.py` | Adaptive decisions |
| 5 | Iterative Refinement | `iterative_refinement.py` | Quality loops |
| 6 | Generator-Critic | `generator_critic.py` | Create → evaluate |
| 7 | Saga | `saga.py` | Transactional rollback |
| 8 | Event-Driven | `event_driven.py` | Reactive automation |

---

# How Workflow Designer Maps to This Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW DESIGNER → WORLD-CLASS STRUCTURE MAPPING                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ReactFlow Node                      Target Layer                            │
│  ══════════════                      ════════════                            │
│                                                                              │
│  type: "runner"                      runners/cognitive/* or runners/families/*
│  data.runCode: "critique_001"   →    runners/cognitive/evaluate/critique.py │
│  data.runCode: "deep_research"  →    runners/families/deep_research.py      │
│                                                                              │
│  type: "router"                 →    orchestration/patterns/conditional.py  │
│  type: "parallel"               →    orchestration/patterns/fan_out_fan_in.py
│  type: "transform"              →    libraries/skills/ (skill execution)    │
│                                                                              │
│  Workflow Template              →    libraries/workflows/templates/          │
│  User Template                  →    services/workflows/template_service.py │
│                                                                              │
│  Translation Pipeline           →    modules/translator/                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Import Examples

```python
# Import runners
from runners.families import DeepResearchRunner, StrategyRunner
from runners.cognitive.evaluate import CritiqueRunner, CompareRunner
from runners.cognitive.create import DraftRunner, ExpandRunner
from runners.pharma.market_access import ValueNarrativeRunner

# Import libraries
from libraries.prompts import PromptLoader, PromptComposer
from libraries.skills import SkillLoader, SkillMatcher
from libraries.knowledge import KnowledgeRetriever
from libraries.workflows import WorkflowLoader, TaskDefinition

# Import orchestration
from orchestration.patterns import SequentialPattern, FanOutFanInPattern
from orchestration.execution import MissionExecutor, WorkflowEngine

# Import services
from services.ask_expert import AskExpertService
from services.ask_expert.modes import Mode3DeepResearch

# Import domain
from domain.entities import Agent, Mission, Task
from domain.value_objects import RunnerInput, RunnerOutput
```

---

# Related Documentation

| Document | Purpose |
|----------|---------|
| `UNIFIED_CONCEPTUAL_MODEL.md` | Task Formula & Knowledge Stack |
| `RUNNER_PACKAGE_ARCHITECTURE.md` | 13-component runner package |
| `TASK_COMPOSITION_ARCHITECTURE.md` | 8 orchestration patterns |
| `WORKFLOW_DESIGNER_RUNNER_INTEGRATION.md` | ReactFlow integration |
| `USER_TEMPLATE_EDITOR_ARCHITECTURE.md` | Database-First templates |
| `GOLD_STANDARD_BACKEND_ARCHITECTURE.md` | Current state analysis & migration roadmap |
| `CONCEPTUAL_DESIGN_INDEX.md` | Master index of all design documents |

---

**Version History:**
- v1.1 (December 2025): Added supporting directories, expanded services, added GOLD_STANDARD reference
- v1.0 (December 2025): Initial world-class structure definition

---

*End of Document*
