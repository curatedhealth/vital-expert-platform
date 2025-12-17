# VITAL Platform: Recommended Project Structure
## Complete Architecture for Runner-Based AI Services

**Version:** 1.0
**Date:** December 2025
**Status:** Implementation Guide

---

# Executive Summary

This document defines the recommended project structure to support all VITAL AI services through a unified runner architecture. The structure follows clean architecture principles with clear separation between:

- **Domain Layer**: Core business logic (runners, services)
- **Infrastructure Layer**: External dependencies (database, LLM, vector stores)
- **API Layer**: HTTP endpoints and streaming
- **Libraries**: Reusable assets (prompts, skills, knowledge, workflows)

---

# Complete Project Structure

```
/services/ai-engine/
│
├── src/
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   CORE LAYER (Business Logic)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                    # Environment configuration
│   │   ├── constants.py                 # System-wide constants
│   │   ├── exceptions.py                # Custom exception classes
│   │   ├── logging.py                   # Structured logging setup
│   │   └── types.py                     # Shared type definitions
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   DOMAIN LAYER (Business Entities)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── domain/
│   │   ├── __init__.py
│   │   │
│   │   ├── entities/                    # Core domain models
│   │   │   ├── __init__.py
│   │   │   ├── agent.py                 # Agent entity (WHO)
│   │   │   ├── skill.py                 # Skill entity (HOW)
│   │   │   ├── knowledge.py             # Knowledge domain entity (WHAT)
│   │   │   ├── workflow.py              # Workflow template entity
│   │   │   ├── task.py                  # Task definition (Agent + Skill)
│   │   │   ├── mission.py               # Mission entity (Mode 3/4)
│   │   │   └── panel.py                 # Panel session entity
│   │   │
│   │   ├── value_objects/               # Immutable domain values
│   │   │   ├── __init__.py
│   │   │   ├── runner_input.py          # Runner input types
│   │   │   ├── runner_output.py         # Runner output types
│   │   │   ├── execution_context.py     # Execution context
│   │   │   └── quality_result.py        # Quality check results
│   │   │
│   │   └── events/                      # Domain events
│   │       ├── __init__.py
│   │       ├── mission_events.py        # Mission lifecycle events
│   │       ├── workflow_events.py       # Workflow execution events
│   │       └── panel_events.py          # Panel session events
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   RUNNERS (Cognitive Operations)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── runners/
│   │   ├── __init__.py                  # Main exports
│   │   ├── registry.py                  # UnifiedRunnerRegistry
│   │   ├── validation.py                # Output validation utilities
│   │   ├── streaming.py                 # SSE streaming helpers
│   │   │
│   │   ├── base/                        # Base classes
│   │   │   ├── __init__.py
│   │   │   ├── task_runner.py           # TaskRunner[InputT, OutputT]
│   │   │   ├── family_runner.py         # BaseFamilyRunner[StateT]
│   │   │   ├── interfaces.py            # Protocols & abstract interfaces
│   │   │   └── mixins.py                # Reusable behavior mixins
│   │   │
│   │   ├── families/                    # Complex Mission Workflows (8)
│   │   │   ├── __init__.py              # Family registry exports
│   │   │   ├── deep_research.py         # ToT → CoT → Reflection
│   │   │   ├── strategy.py              # SWOT, Scenarios, Roadmaps
│   │   │   ├── investigation.py         # Bayesian root cause
│   │   │   ├── communication.py         # Audience-led messaging
│   │   │   ├── monitoring.py            # Signal monitoring
│   │   │   ├── evaluation.py            # MCDA decision analysis
│   │   │   ├── problem_solving.py       # Decision matrix
│   │   │   └── generic.py               # Flexible fallback
│   │   │
│   │   ├── cognitive/                   # Cognitive Task Runners (88)
│   │   │   ├── __init__.py
│   │   │   │
│   │   │   ├── understand/              # Knowledge Acquisition (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── scan.py              # Broad landscape scan
│   │   │   │   ├── explore.py           # Deep dive analysis
│   │   │   │   ├── gap_detect.py        # Find missing info
│   │   │   │   └── extract.py           # Extract specific info
│   │   │   │
│   │   │   ├── evaluate/                # Quality Assessment (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── critique.py          # Apply rubric (MCDA)
│   │   │   │   ├── compare.py           # Side-by-side comparison
│   │   │   │   ├── score.py             # Calculate weighted score
│   │   │   │   └── benchmark.py         # Compare to reference
│   │   │   │
│   │   │   ├── decide/                  # Strategic Choice (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── frame.py             # Structure decision
│   │   │   │   ├── option_gen.py        # Generate alternatives
│   │   │   │   ├── tradeoff.py          # Analyze trade-offs
│   │   │   │   └── recommend.py         # Make recommendation
│   │   │   │
│   │   │   ├── investigate/             # Causal Analysis (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── detect.py            # Detect anomalies
│   │   │   │   ├── hypothesize.py       # Generate hypotheses
│   │   │   │   ├── evidence.py          # Gather evidence
│   │   │   │   └── conclude.py          # Draw conclusions
│   │   │   │
│   │   │   ├── watch/                   # Monitoring (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── baseline.py          # Establish baseline
│   │   │   │   ├── delta.py             # Detect changes
│   │   │   │   ├── alert.py             # Evaluate alerts
│   │   │   │   └── trend.py             # Extrapolate trends
│   │   │   │
│   │   │   ├── solve/                   # Problem Resolution (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── diagnose.py          # Identify blockers
│   │   │   │   ├── pathfind.py          # Find solution path
│   │   │   │   ├── alternative.py       # Generate alternatives
│   │   │   │   └── unblock.py           # Resolve blockers
│   │   │   │
│   │   │   ├── prepare/                 # Readiness (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── context.py           # Gather context
│   │   │   │   ├── anticipate.py        # Predict Q&A
│   │   │   │   ├── brief.py             # Generate brief
│   │   │   │   └── talking_point.py     # Extract key messages
│   │   │   │
│   │   │   ├── create/                  # Generation (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── draft.py             # Generate draft
│   │   │   │   ├── expand.py            # Expand section
│   │   │   │   ├── format.py            # Apply formatting
│   │   │   │   └── citation.py          # Add citations
│   │   │   │
│   │   │   ├── refine/                  # Optimization (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── critic.py            # Identify weaknesses
│   │   │   │   ├── mutate.py            # Generate variations
│   │   │   │   ├── verify.py            # Test improvement
│   │   │   │   └── select.py            # Choose best
│   │   │   │
│   │   │   ├── validate/                # Verification (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── compliance_check.py  # Check against rules
│   │   │   │   ├── fact_check.py        # Verify claims
│   │   │   │   ├── citation_check.py    # Verify citations
│   │   │   │   └── consistency_check.py # Check consistency
│   │   │   │
│   │   │   ├── synthesize/              # Integration (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── collect.py           # Gather sources
│   │   │   │   ├── theme.py             # Extract themes
│   │   │   │   ├── resolve.py           # Resolve conflicts
│   │   │   │   └── narrate.py           # Build narrative
│   │   │   │
│   │   │   ├── plan/                    # Scheduling (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── decompose.py         # Break down goal
│   │   │   │   ├── dependency.py        # Map dependencies
│   │   │   │   ├── schedule.py          # Generate schedule
│   │   │   │   └── resource.py          # Allocate resources
│   │   │   │
│   │   │   ├── predict/                 # Forecasting (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── trend_analyze.py     # Analyze trends
│   │   │   │   ├── scenario.py          # Generate scenarios
│   │   │   │   ├── project.py           # Project future
│   │   │   │   └── uncertainty.py       # Quantify uncertainty
│   │   │   │
│   │   │   ├── engage/                  # Stakeholder (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── profile.py           # Profile stakeholder
│   │   │   │   ├── interest.py          # Map interests
│   │   │   │   ├── touchpoint.py        # Design engagement
│   │   │   │   └── message.py           # Craft message
│   │   │   │
│   │   │   ├── align/                   # Consensus (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── position.py          # Map positions
│   │   │   │   ├── common_ground.py     # Find common ground
│   │   │   │   ├── objection.py         # Identify objections
│   │   │   │   └── consensus.py         # Propose consensus
│   │   │   │
│   │   │   ├── influence/               # Persuasion (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── audience_analyze.py  # Analyze counterpart
│   │   │   │   ├── position_calc.py     # Calculate BATNA/ZOPA
│   │   │   │   ├── argument.py          # Construct argument
│   │   │   │   └── counter.py           # Generate counter
│   │   │   │
│   │   │   ├── adapt/                   # Transformation (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── localize.py          # Localize content
│   │   │   │   ├── audience_adapt.py    # Adapt for audience
│   │   │   │   ├── format_convert.py    # Convert format
│   │   │   │   └── reg_adapt.py         # Regulatory adapt
│   │   │   │
│   │   │   ├── discover/                # Opportunity (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── white_space.py       # Find white space
│   │   │   │   ├── differentiate.py     # Find differentiation
│   │   │   │   ├── repurpose.py         # Find new uses
│   │   │   │   └── opportunity_score.py # Score opportunity
│   │   │   │
│   │   │   ├── design/                  # Structure Work (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── panel_design.py      # Design panel interview
│   │   │   │   ├── workflow_design.py   # Design workflow
│   │   │   │   ├── eval_design.py       # Design evaluation
│   │   │   │   └── research_design.py   # Design research
│   │   │   │
│   │   │   ├── govern/                  # Compliance (4)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── policy_check.py      # Check against policy
│   │   │   │   ├── sanitize.py          # Remove sensitive data
│   │   │   │   ├── audit_log.py         # Log for audit
│   │   │   │   └── permission_check.py  # Check permissions
│   │   │   │
│   │   │   └── execute/                 # Operations (4)
│   │   │       ├── __init__.py
│   │   │       ├── state_read.py        # Read current state
│   │   │       ├── transition.py        # Determine next state
│   │   │       ├── action.py            # Execute state action
│   │   │       └── escalate.py          # Escalate to human
│   │   │
│   │   └── pharma/                      # Pharmaceutical Domain (119)
│   │       ├── __init__.py
│   │       │
│   │       ├── foresight/               # Strategic Foresight (15)
│   │       │   ├── __init__.py
│   │       │   ├── portfolio/           # Portfolio Foresight (5)
│   │       │   ├── scenario/            # Scenario Development (5)
│   │       │   └── disruption/          # Disruption Warning (5)
│   │       │
│   │       ├── brand_strategy/          # Brand Planning (22)
│   │       │   ├── __init__.py
│   │       │   ├── brand_plan/          # 10 Ps Framework (10)
│   │       │   ├── positioning/         # Positioning Strategy (6)
│   │       │   └── portfolio/           # Portfolio Architecture (6)
│   │       │
│   │       ├── digital_health/          # Digital Strategy (20)
│   │       │   ├── __init__.py
│   │       │   ├── opportunity/         # Opportunity Assessment (6)
│   │       │   ├── partnership/         # Partnership Strategy (7)
│   │       │   └── dtx_gtm/             # DTx Go-to-Market (7)
│   │       │
│   │       ├── medical_affairs/         # Medical Affairs (21)
│   │       │   ├── __init__.py
│   │       │   ├── kol/                 # KOL Ecosystem (7)
│   │       │   ├── evidence/            # Evidence Generation (7)
│   │       │   └── msl/                 # MSL Excellence (7)
│   │       │
│   │       ├── market_access/           # Market Access (21)
│   │       │   ├── __init__.py
│   │       │   ├── value_narrative/     # Value Narrative (7)
│   │       │   ├── payer_strategy/      # Payer Strategy (7)
│   │       │   └── reimbursement/       # Reimbursement Dossier (7)
│   │       │
│   │       └── design_thinking/         # Design Thinking (20)
│   │           ├── __init__.py
│   │           ├── patient_journey/     # Patient Journey (7)
│   │           ├── hcp_experience/      # HCP Experience (6)
│   │           └── service_innovation/  # Service Innovation (7)
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   SERVICES (Business Logic Orchestration)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   │
│   │   ├── ask_expert/                  # L1: Ask Expert (Modes 1-4)
│   │   │   ├── __init__.py
│   │   │   ├── service.py               # Main service class
│   │   │   ├── mode_router.py           # Route to appropriate mode
│   │   │   ├── agent_selector.py        # GraphRAG agent selection
│   │   │   │
│   │   │   ├── modes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── interactive.py       # Mode 1: Interactive chat
│   │   │   │   ├── auto_select.py       # Mode 2: Auto-select expert
│   │   │   │   ├── deep_research.py     # Mode 3: Deep research
│   │   │   │   └── background.py        # Mode 4: Background mission
│   │   │   │
│   │   │   └── handlers/
│   │   │       ├── __init__.py
│   │   │       ├── streaming.py         # SSE streaming handler
│   │   │       ├── artifacts.py         # Artifact management
│   │   │       └── citations.py         # Citation extraction
│   │   │
│   │   ├── ask_panel/                   # L2: Ask Panel
│   │   │   ├── __init__.py
│   │   │   ├── service.py               # Main panel service
│   │   │   ├── orchestrator.py          # Panel orchestration logic
│   │   │   ├── round_executor.py        # Execute panel rounds
│   │   │   └── synthesizer.py           # Synthesize panel output
│   │   │
│   │   ├── workflows/                   # L3: Workflows
│   │   │   ├── __init__.py
│   │   │   ├── service.py               # Workflow service
│   │   │   ├── engine.py                # Workflow execution engine
│   │   │   ├── task_executor.py         # Execute individual tasks
│   │   │   ├── state_manager.py         # Workflow state management
│   │   │   ├── hitl_handler.py          # Human-in-the-loop checkpoints
│   │   │   └── graph_builder.py         # Build workflow DAG
│   │   │
│   │   ├── solutions/                   # L4: Solutions
│   │   │   ├── __init__.py
│   │   │   ├── service.py               # Solution service
│   │   │   ├── orchestrator.py          # Multi-workflow orchestration
│   │   │   ├── phase_executor.py        # Execute solution phases
│   │   │   └── integrator.py            # Integrate workflow outputs
│   │   │
│   │   ├── strategic_advisor/           # L5: Strategic Advisor
│   │   │   ├── __init__.py
│   │   │   ├── service.py               # Strategic advisor service
│   │   │   ├── engagement_manager.py    # Long-running engagements
│   │   │   └── memory_manager.py        # Persistent context
│   │   │
│   │   └── shared/                      # Shared service utilities
│   │       ├── __init__.py
│   │       ├── task_assembler.py        # Assemble Task = Agent + Skill
│   │       ├── knowledge_injector.py    # Inject knowledge context
│   │       ├── quality_checker.py       # Output quality validation
│   │       └── cost_tracker.py          # Token/cost tracking
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   LIBRARIES (Reusable Assets)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── libraries/
│   │   ├── __init__.py
│   │   │
│   │   ├── prompts/                     # Prompt Library (WHO)
│   │   │   ├── __init__.py
│   │   │   ├── loader.py                # Load prompts from DB/files
│   │   │   ├── composer.py              # Compose multi-part prompts
│   │   │   │
│   │   │   └── templates/               # Prompt templates (version controlled)
│   │   │       ├── agents/              # Agent system prompts
│   │   │       │   ├── personas/        # Expert personas
│   │   │       │   ├── panel_agents/    # Panel facilitators
│   │   │       │   └── orchestrators/   # Service orchestrators
│   │   │       │
│   │   │       └── tasks/               # Task prompt templates
│   │   │           ├── skill_prompts/   # Skill execution prompts
│   │   │           └── panel_prompts/   # Panel round prompts
│   │   │
│   │   ├── skills/                      # Skills Library (HOW)
│   │   │   ├── __init__.py
│   │   │   ├── loader.py                # Load skill definitions
│   │   │   ├── matcher.py               # Match skill to request
│   │   │   │
│   │   │   └── definitions/             # Skill definitions (YAML/JSON)
│   │   │       ├── cognitive/           # Maps to cognitive runners
│   │   │       └── pharma/              # Maps to pharma runners
│   │   │
│   │   ├── knowledge/                   # Knowledge Library (WHAT)
│   │   │   ├── __init__.py
│   │   │   ├── loader.py                # Load knowledge domains
│   │   │   ├── retriever.py             # RAG retrieval
│   │   │   ├── injector.py              # Inject into prompts
│   │   │   │
│   │   │   └── domains/                 # Knowledge domain files
│   │   │       ├── therapeutic_areas/   # L0: Disease knowledge
│   │   │       ├── regulatory/          # L0: Regulatory frameworks
│   │   │       ├── payer/               # L0: Payer landscape
│   │   │       ├── scientific/          # L0: Scientific standards
│   │   │       ├── products/            # L1: Product-specific
│   │   │       └── competitive/         # L1: Competitive intel
│   │   │
│   │   └── workflows/                   # Workflow Library (WHY)
│   │       ├── __init__.py
│   │       ├── loader.py                # Load workflow templates
│   │       ├── validator.py             # Validate workflow definitions
│   │       │
│   │       └── templates/               # Workflow templates
│   │           ├── market_access/       # Market access workflows
│   │           ├── medical_affairs/     # Medical affairs workflows
│   │           ├── brand_strategy/      # Brand strategy workflows
│   │           └── solutions/           # Multi-workflow solutions
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   INFRASTRUCTURE (External Dependencies)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   │
│   │   ├── database/                    # PostgreSQL/Supabase
│   │   │   ├── __init__.py
│   │   │   ├── connection.py            # Connection pool
│   │   │   ├── migrations/              # Schema migrations
│   │   │   │
│   │   │   └── repositories/            # Data access layer
│   │   │       ├── __init__.py
│   │   │       ├── agent_repository.py
│   │   │       ├── skill_repository.py
│   │   │       ├── knowledge_repository.py
│   │   │       ├── workflow_repository.py
│   │   │       ├── mission_repository.py
│   │   │       └── panel_repository.py
│   │   │
│   │   ├── llm/                         # LLM Integration
│   │   │   ├── __init__.py
│   │   │   ├── provider.py              # LLM provider abstraction
│   │   │   ├── openai_client.py         # OpenAI/Azure OpenAI
│   │   │   ├── anthropic_client.py      # Anthropic Claude
│   │   │   ├── token_counter.py         # Token counting
│   │   │   └── rate_limiter.py          # Rate limiting
│   │   │
│   │   ├── vector_stores/               # Vector Databases
│   │   │   ├── __init__.py
│   │   │   ├── pinecone_client.py       # Pinecone for agents
│   │   │   ├── pgvector_client.py       # pgvector for knowledge
│   │   │   └── embeddings.py            # Embedding generation
│   │   │
│   │   ├── graph/                       # Neo4j Graph Database
│   │   │   ├── __init__.py
│   │   │   ├── neo4j_client.py          # Neo4j connection
│   │   │   └── queries.py               # Cypher queries
│   │   │
│   │   ├── cache/                       # Caching Layer
│   │   │   ├── __init__.py
│   │   │   ├── redis_client.py          # Redis cache
│   │   │   └── memory_cache.py          # In-memory fallback
│   │   │
│   │   └── messaging/                   # Background Jobs
│   │       ├── __init__.py
│   │       ├── task_queue.py            # Task queue (Celery/etc)
│   │       └── webhooks.py              # Webhook delivery
│   │
│   ├── ══════════════════════════════════════════════════════════════════════
│   │   API LAYER (HTTP Endpoints)
│   │   ══════════════════════════════════════════════════════════════════════
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py                      # FastAPI app entry
│   │   │
│   │   ├── routes/                      # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── health.py                # Health checks
│   │   │   ├── ask_expert.py            # /api/ask-expert/*
│   │   │   ├── ask_panel.py             # /api/ask-panel/*
│   │   │   ├── missions.py              # /api/missions/*
│   │   │   ├── workflows.py             # /api/workflows/*
│   │   │   ├── solutions.py             # /api/solutions/*
│   │   │   ├── agents.py                # /api/agents/*
│   │   │   └── knowledge.py             # /api/knowledge/*
│   │   │
│   │   ├── middleware/                  # Request middleware
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                  # Authentication
│   │   │   ├── tenant.py                # Multi-tenancy
│   │   │   ├── logging.py               # Request logging
│   │   │   └── rate_limit.py            # Rate limiting
│   │   │
│   │   ├── schemas/                     # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── request/                 # Request schemas
│   │   │   └── response/                # Response schemas
│   │   │
│   │   └── dependencies/                # FastAPI dependencies
│   │       ├── __init__.py
│   │       ├── database.py              # DB session dependency
│   │       ├── auth.py                  # Auth dependency
│   │       └── services.py              # Service injection
│   │
│   └── ══════════════════════════════════════════════════════════════════════
│       LANGGRAPH WORKFLOWS (Complex Orchestration)
│       ══════════════════════════════════════════════════════════════════════
│
│   └── langgraph_workflows/
│       ├── __init__.py
│       │
│       ├── shared/                      # Shared workflow utilities
│       │   ├── __init__.py
│       │   ├── events.py                # SSE event definitions
│       │   ├── state.py                 # Shared state schemas
│       │   ├── checkpointing.py         # State checkpointing
│       │   └── tools.py                 # Shared LangGraph tools
│       │
│       ├── mode3/                       # Mode 3 specific
│       │   ├── __init__.py
│       │   ├── graph.py                 # Mode 3 graph builder
│       │   └── nodes.py                 # Mode 3 specific nodes
│       │
│       ├── mode4/                       # Mode 4 specific
│       │   ├── __init__.py
│       │   ├── worker.py                # Background worker
│       │   └── graph.py                 # Mode 4 graph builder
│       │
│       └── wrappers/                    # Agent level wrappers
│           ├── __init__.py
│           ├── l2_wrapper.py            # L2 (reasoning) wrapper
│           ├── l3_wrapper.py            # L3 (synthesis) wrapper
│           ├── l4_wrapper.py            # L4 (execution) wrapper
│           └── l5_tool_mapper.py        # L5 tool mapping
│
├── ══════════════════════════════════════════════════════════════════════════
│   TESTS
│   ══════════════════════════════════════════════════════════════════════════
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                      # Shared fixtures
│   │
│   ├── unit/
│   │   ├── runners/                     # Runner unit tests
│   │   │   ├── test_registry.py
│   │   │   ├── test_families/
│   │   │   └── test_cognitive/
│   │   │
│   │   ├── services/                    # Service unit tests
│   │   └── libraries/                   # Library unit tests
│   │
│   ├── integration/
│   │   ├── test_mode3_execution.py      # Mode 3 integration
│   │   ├── test_panel_execution.py      # Panel integration
│   │   └── test_workflow_execution.py   # Workflow integration
│   │
│   └── e2e/
│       ├── test_ask_expert_api.py       # E2E API tests
│       └── test_streaming.py            # SSE streaming tests
│
├── ══════════════════════════════════════════════════════════════════════════
│   CONFIGURATION
│   ══════════════════════════════════════════════════════════════════════════
│
├── config/
│   ├── settings.yaml                    # Application settings
│   ├── logging.yaml                     # Logging configuration
│   └── models.yaml                      # LLM model configuration
│
├── scripts/
│   ├── seed_runners.py                  # Seed runner registry
│   ├── seed_skills.py                   # Seed skills library
│   ├── load_knowledge.py                # Load knowledge domains
│   └── sync_agents.py                   # Sync agents to vector DB
│
├── requirements.txt
├── pyproject.toml
└── README.md
```

---

# Key Architectural Patterns

## 1. Runner Registration Pattern

```python
# runners/cognitive/evaluate/critique.py

from runners.base.task_runner import TaskRunner
from runners.registry import registry

@registry.register_task("evaluate", "critique")
class CritiqueRunner(TaskRunner[CritiqueInput, CritiqueOutput]):
    """MCDA-based artifact evaluation."""

    category = "EVALUATE"
    algorithmic_core = "MCDA"

    async def execute(self, input: CritiqueInput) -> CritiqueOutput:
        # Implementation
        pass
```

## 2. Service Layer Pattern

```python
# services/ask_expert/modes/deep_research.py

from runners.registry import registry
from services.shared.task_assembler import TaskAssembler

class DeepResearchMode:
    """Mode 3: Deep Research using Family Runners."""

    def __init__(self, assembler: TaskAssembler):
        self.assembler = assembler

    async def execute(
        self,
        mission: Mission,
        template: MissionTemplate
    ) -> AsyncGenerator[SSEEvent, None]:

        # Get family runner for template
        runner_class = registry.get_runner_for_template(template.family)
        runner = runner_class(llm=self._get_llm(template.tier))

        # Execute with streaming
        async for event in runner.execute_stream(
            query=mission.goal,
            template=template
        ):
            yield event
```

## 3. Task Assembly Pattern

```python
# services/shared/task_assembler.py

class TaskAssembler:
    """
    Assembles executable tasks from four libraries:
    TASK = AGENT (WHO) + SKILL (HOW) + KNOWLEDGE (WHAT) + CONTEXT
    """

    def __init__(
        self,
        prompt_library: PromptLibrary,
        skill_library: SkillLibrary,
        knowledge_library: KnowledgeLibrary
    ):
        self.prompts = prompt_library
        self.skills = skill_library
        self.knowledge = knowledge_library

    async def assemble(
        self,
        agent_code: str,
        skill_code: str,
        knowledge_domains: List[str],
        context: dict
    ) -> ExecutableTask:
        # Load components
        agent = await self.prompts.get_agent(agent_code)
        skill = await self.skills.get_skill(skill_code)
        knowledge = await self.knowledge.get_domains(knowledge_domains)

        # Compose prompt
        composed_prompt = self._compose(agent, skill, knowledge, context)

        return ExecutableTask(
            prompt=composed_prompt,
            runner=registry.get_task_runner(f"{skill.category}/{skill.runner}"),
            output_schema=skill.output_schema,
            quality_checks=skill.quality_checks
        )
```

## 4. Workflow Execution Pattern

```python
# services/workflows/engine.py

class WorkflowEngine:
    """Executes workflow DAGs using task runners."""

    def __init__(
        self,
        task_executor: TaskExecutor,
        state_manager: StateManager,
        hitl_handler: HITLHandler
    ):
        self.executor = task_executor
        self.state = state_manager
        self.hitl = hitl_handler

    async def execute(
        self,
        workflow: Workflow,
        input: dict
    ) -> AsyncGenerator[WorkflowEvent, None]:

        # Build execution DAG
        dag = self._build_dag(workflow.tasks)

        # Execute tasks respecting dependencies
        while not dag.is_complete():
            ready_tasks = dag.get_ready_tasks()

            # Check for HITL checkpoints
            for task in ready_tasks:
                if task.requires_approval:
                    yield HITLCheckpointEvent(task)
                    await self.hitl.wait_for_approval(task)

            # Execute ready tasks in parallel
            results = await asyncio.gather(*[
                self.executor.execute(task, self.state)
                for task in ready_tasks
            ])

            # Update state
            for task, result in zip(ready_tasks, results):
                self.state.set(task.output_key, result)
                dag.mark_complete(task.task_id)
                yield TaskCompletedEvent(task, result)

        yield WorkflowCompletedEvent(self.state.get_output())
```

---

# Runner Category Summary

| Location | Count | Description |
|----------|-------|-------------|
| `runners/families/` | 8 | Complex mission workflows |
| `runners/cognitive/` | 88 | 22 categories × 4 runners |
| `runners/pharma/` | 119 | 6 families of domain runners |
| **TOTAL** | **215** | Complete runner library |

---

# Service Layer Summary

| Service | Location | Runner Usage |
|---------|----------|--------------|
| Ask Expert Mode 1-2 | `services/ask_expert/modes/` | Direct agent chat |
| Ask Expert Mode 3 | `services/ask_expert/modes/deep_research.py` | Family Runners |
| Ask Expert Mode 4 | `services/ask_expert/modes/background.py` | Family Runners |
| Ask Panel | `services/ask_panel/` | Task Runners |
| Workflows | `services/workflows/` | Task Runners |
| Solutions | `services/solutions/` | Multi-Workflow |
| Strategic Advisor | `services/strategic_advisor/` | All |

---

# Library Summary

| Library | Location | Purpose |
|---------|----------|---------|
| Prompts | `libraries/prompts/` | WHO (agent system prompts) |
| Skills | `libraries/skills/` | HOW (task methodologies) |
| Knowledge | `libraries/knowledge/` | WHAT (domain expertise) |
| Workflows | `libraries/workflows/` | WHY (workflow templates) |

---

*End of Document*
