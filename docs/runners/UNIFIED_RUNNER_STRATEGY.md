# VITAL Platform: Unified Runner Strategy
## Cross-Service Runner Architecture for AI Services

**Version:** 1.0
**Date:** December 2025
**Status:** Strategic Implementation Guide
**Classification:** INTERNAL

---

# Executive Summary

This document defines the unified runner architecture that powers all VITAL AI services. Runners are the **atomic cognitive operations** that enable intelligent workflows across:

| Service | Runner Usage | Description |
|---------|--------------|-------------|
| **Ask Expert Mode 3** | Family Runners | Deep research with ToT/CoT/Reflection |
| **Ask Expert Mode 4** | Family Runners | Background autonomous missions |
| **Ask Panel** | Task Runners + Orchestration | Multi-expert consultation |
| **Workflows** | Task Runners | Connected task sequences |
| **Solutions** | Composite Runners | Multi-workflow compositions |

**Total Runner Library:** 207+ runners (88 cognitive + 119 pharmaceutical domain)

---

# Part 1: The Two Runner Architectures

## 1.1 Runner Type Comparison

VITAL employs **two complementary runner types** that serve different purposes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TWO RUNNER ARCHITECTURES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TASK RUNNERS (Atomic Operations)                                           │
│  ════════════════════════════════                                           │
│                                                                              │
│  • Single cognitive operation                                               │
│  • Input → Process → Output                                                 │
│  • 30 seconds - 3 minutes                                                   │
│  • Used in: Workflows, Ask Panel                                            │
│                                                                              │
│      ┌─────────┐      ┌─────────────┐      ┌──────────┐                    │
│      │ INPUT   │ ───► │ TASK RUNNER │ ───► │  OUTPUT  │                    │
│      └─────────┘      └─────────────┘      └──────────┘                    │
│                                                                              │
│  FAMILY RUNNERS (Complex Workflows)                                         │
│  ══════════════════════════════════                                         │
│                                                                              │
│  • Multi-step LangGraph workflows                                           │
│  • ToT → CoT → Reflection patterns                                          │
│  • 5-30 minutes                                                             │
│  • Used in: Ask Expert Mode 3 & 4                                           │
│                                                                              │
│      ┌─────────┐      ┌─────────────────────────────────┐      ┌──────────┐│
│      │ QUERY   │ ───► │      FAMILY RUNNER GRAPH        │ ───► │  REPORT  ││
│      └─────────┘      │  ┌─────┐ ┌─────┐ ┌─────┐       │      └──────────┘│
│                       │  │ ToT │→│ CoT │→│Refl.│       │                   │
│                       │  └─────┘ └─────┘ └─────┘       │                   │
│                       └─────────────────────────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Architectural Decision

| Aspect | Task Runners | Family Runners |
|--------|--------------|----------------|
| **Base Class** | `TaskRunner[I, O]` | `BaseFamilyRunner[State]` |
| **Complexity** | Single LLM call | Multi-node LangGraph |
| **Duration** | 30s - 3min | 5min - 30min |
| **State** | Stateless | Stateful (LangGraph) |
| **Composition** | Via workflows | Self-contained |
| **Streaming** | Simple chunks | Rich SSE events |
| **Use Case** | Atomic operations | Complex research |

---

# Part 2: Unified Repository Structure

## 2.1 Directory Organization

All runners consolidated under `/langgraph_workflows/task_runners/`:

```
/services/ai-engine/src/langgraph_workflows/task_runners/
│
├── base/                              # Core base classes
│   ├── __init__.py
│   ├── task_runner.py                 # TaskRunner[InputT, OutputT]
│   ├── family_runner.py               # BaseFamilyRunner[StateT]
│   └── interfaces.py                  # Shared protocols & types
│
├── families/                          # Complex mission workflows (Mode 3/4)
│   ├── __init__.py                    # Family registry + exports
│   ├── deep_research.py               # ToT → CoT → Reflection (~50KB)
│   ├── strategy.py                    # SWOT, Scenarios, Roadmaps (~22KB)
│   ├── investigation.py               # Bayesian root cause (~45KB)
│   ├── communication.py               # Audience-led messaging (~36KB)
│   ├── monitoring.py                  # Signal monitoring (~35KB)
│   ├── evaluation.py                  # MCDA decision analysis (~33KB)
│   ├── problem_solving.py             # Decision matrix (~36KB)
│   └── generic.py                     # Flexible fallback (~34KB)
│
├── tasks/                             # Atomic task runners (Workflows, Panel)
│   ├── understand/                    # Knowledge acquisition
│   │   ├── scan_runner.py
│   │   ├── explore_runner.py
│   │   ├── gap_detect_runner.py
│   │   └── extract_runner.py
│   │
│   ├── evaluate/                      # Quality assessment
│   │   ├── critique_runner.py
│   │   ├── compare_runner.py
│   │   ├── score_runner.py
│   │   └── benchmark_runner.py
│   │
│   ├── decide/                        # Strategic choice
│   │   ├── frame_runner.py
│   │   ├── option_gen_runner.py
│   │   ├── tradeoff_runner.py
│   │   └── recommend_runner.py
│   │
│   ├── investigate/                   # Causal analysis
│   │   ├── detect_runner.py
│   │   ├── hypothesize_runner.py
│   │   ├── evidence_runner.py
│   │   └── conclude_runner.py
│   │
│   ├── watch/                         # Monitoring
│   │   ├── baseline_runner.py
│   │   ├── delta_runner.py
│   │   ├── alert_runner.py
│   │   └── trend_runner.py
│   │
│   ├── solve/                         # Problem resolution
│   │   ├── diagnose_runner.py
│   │   ├── pathfind_runner.py
│   │   ├── alternative_runner.py
│   │   └── unblock_runner.py
│   │
│   ├── prepare/                       # Readiness
│   │   ├── context_runner.py
│   │   ├── anticipate_runner.py
│   │   ├── brief_runner.py
│   │   └── talking_point_runner.py
│   │
│   ├── create/                        # Generation
│   │   ├── draft_runner.py
│   │   ├── expand_runner.py
│   │   ├── format_runner.py
│   │   └── citation_runner.py
│   │
│   ├── refine/                        # Optimization (Reflexion loop)
│   │   ├── critic_runner.py
│   │   ├── mutate_runner.py
│   │   ├── verify_runner.py
│   │   └── select_runner.py
│   │
│   ├── validate/                      # Verification
│   │   ├── compliance_check_runner.py
│   │   ├── fact_check_runner.py
│   │   ├── citation_check_runner.py
│   │   └── consistency_check_runner.py
│   │
│   ├── synthesize/                    # Integration
│   │   ├── collect_runner.py
│   │   ├── theme_runner.py
│   │   ├── resolve_runner.py
│   │   └── narrate_runner.py
│   │
│   ├── plan/                          # Scheduling
│   │   ├── decompose_runner.py
│   │   ├── dependency_runner.py
│   │   ├── schedule_runner.py
│   │   └── resource_runner.py
│   │
│   ├── predict/                       # Forecasting
│   │   ├── trend_analyze_runner.py
│   │   ├── scenario_runner.py
│   │   ├── project_runner.py
│   │   └── uncertainty_runner.py
│   │
│   ├── engage/                        # Stakeholder
│   │   ├── profile_runner.py
│   │   ├── interest_runner.py
│   │   ├── touchpoint_runner.py
│   │   └── message_runner.py
│   │
│   ├── align/                         # Consensus
│   │   ├── position_runner.py
│   │   ├── common_ground_runner.py
│   │   ├── objection_runner.py
│   │   └── consensus_runner.py
│   │
│   ├── influence/                     # Persuasion
│   │   ├── audience_analyze_runner.py
│   │   ├── position_calc_runner.py
│   │   ├── argument_runner.py
│   │   └── counter_runner.py
│   │
│   ├── adapt/                         # Transformation
│   │   ├── localize_runner.py
│   │   ├── audience_adapt_runner.py
│   │   ├── format_convert_runner.py
│   │   └── reg_adapt_runner.py
│   │
│   ├── discover/                      # Opportunity
│   │   ├── white_space_runner.py
│   │   ├── differentiate_runner.py
│   │   ├── repurpose_runner.py
│   │   └── opportunity_score_runner.py
│   │
│   ├── design/                        # Structure Work
│   │   ├── panel_design_runner.py
│   │   ├── workflow_design_runner.py
│   │   ├── eval_design_runner.py
│   │   └── research_design_runner.py
│   │
│   ├── govern/                        # Compliance
│   │   ├── policy_check_runner.py
│   │   ├── sanitize_runner.py
│   │   ├── audit_log_runner.py
│   │   └── permission_check_runner.py
│   │
│   └── execute/                       # Operations
│       ├── state_read_runner.py
│       ├── transition_runner.py
│       ├── action_runner.py
│       └── escalate_runner.py
│
├── pharma/                            # Pharmaceutical domain runners (119)
│   ├── foresight/                     # 15 runners
│   ├── brand_strategy/                # 22 runners
│   ├── digital_health/                # 20 runners
│   ├── medical_affairs/               # 21 runners
│   ├── market_access/                 # 21 runners
│   └── design_thinking/               # 20 runners
│
├── registry.py                        # Unified runner registry
├── validation.py                      # Output validation utilities
├── streaming.py                       # SSE streaming helpers
└── __init__.py                        # Main exports
```

## 2.2 Runner Count Summary

| Category | Runners | Description |
|----------|---------|-------------|
| **Family Runners** | 8 | Complex mission workflows |
| **Cognitive Task Runners** | 88 | Atomic cognitive operations |
| **Pharma Domain Runners** | 119 | Pharmaceutical-specific |
| **TOTAL** | **215** | Complete runner library |

---

# Part 3: Service Integration Patterns

## 3.1 Ask Expert Mode 3 (Deep Research)

**Pattern:** Single Family Runner execution with streaming

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ASK EXPERT MODE 3: DEEP RESEARCH                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Query                                                                  │
│      │                                                                       │
│      ▼                                                                       │
│  ┌────────────────────┐                                                     │
│  │   AI WIZARD        │  ← Parse goals, generate plan                       │
│  │   (Goal Parser)    │                                                     │
│  └─────────┬──────────┘                                                     │
│            │                                                                 │
│            ▼                                                                 │
│  ┌────────────────────┐     ┌───────────────────────────┐                  │
│  │  Template Matcher  │ ──► │ get_runner_for_template() │                  │
│  │  (family type)     │     │     ↓                     │                  │
│  └────────────────────┘     │ DEEP_RESEARCH → DeepResearchRunner           │
│                             │ STRATEGY → StrategyRunner                     │
│                             │ INVESTIGATION → InvestigationRunner           │
│                             └───────────────────────────┘                  │
│                                         │                                   │
│                                         ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      FAMILY RUNNER EXECUTION                          │  │
│  │                                                                        │  │
│  │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐          │  │
│  │   │  ToT    │ ─► │  CoT    │ ─► │ Reflect │ ─► │Synthesize│          │  │
│  │   │Branching│    │Reasoning│    │  Loop   │    │ Report  │          │  │
│  │   └─────────┘    └─────────┘    └─────────┘    └─────────┘          │  │
│  │                                                                        │  │
│  │   Streams SSE events: thinking, progress, artifacts, citations        │  │
│  │                                                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                         │                                   │
│                                         ▼                                   │
│  ┌────────────────────┐                                                     │
│  │   Executive Report │  ← Full markdown report with citations             │
│  │   + Artifacts      │                                                     │
│  └────────────────────┘                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```python
# missions.py - Mode 3 execution
async def execute_mode3_mission(
    mission_id: str,
    template: MissionTemplate,
    goal: str
) -> AsyncGenerator[SSEEvent, None]:

    # 1. Get family runner based on template
    template_family = template.family  # e.g., "DEEP_RESEARCH"
    runner_class = get_runner_for_template(template_family)

    if not runner_class:
        # Fallback to generic runner
        runner_class = GenericRunner

    # 2. Instantiate and configure runner
    runner = runner_class(
        llm=get_llm_for_tier(template.tier),
        max_iterations=template.max_iterations,
        streaming=True
    )

    # 3. Execute with streaming
    async for event in runner.execute_stream(
        query=goal,
        template=template,
        mission_id=mission_id
    ):
        yield event
```

## 3.2 Ask Expert Mode 4 (Background Missions)

**Pattern:** Same as Mode 3, but runs in background with webhooks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  ASK EXPERT MODE 4: BACKGROUND MISSION                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User submits mission ──► Immediate response with mission_id                │
│                                │                                             │
│                                ▼                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    BACKGROUND WORKER                                │    │
│  │                                                                      │    │
│  │  1. Load mission from database                                      │    │
│  │  2. Get family runner for template                                  │    │
│  │  3. Execute runner.execute_async()                                  │    │
│  │  4. Persist results to database                                     │    │
│  │  5. Send webhook notification                                       │    │
│  │                                                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                │                                             │
│                                ▼                                             │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐            │
│  │  mission_events │    │ mission_results │    │   Webhook     │            │
│  │     (SSE)       │    │   (artifacts)  │    │  Notification │            │
│  └────────────────┘    └────────────────┘    └────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.3 Ask Panel (Multi-Expert Consultation)

**Pattern:** Orchestration layer using Task Runners

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ASK PANEL: MULTI-EXPERT CONSULTATION                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Topic + Selected Experts                                              │
│      │                                                                       │
│      ▼                                                                       │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      PANEL ORCHESTRATOR                             │    │
│  │                                                                      │    │
│  │  Step 1: Panel Design (uses panel_design_runner.py)                │    │
│  │  ─────────────────────────────────────────────────                 │    │
│  │      ┌─────────────────┐                                           │    │
│  │      │ PanelDesignRunner│ → Discussion structure, rounds, prompts  │    │
│  │      └─────────────────┘                                           │    │
│  │                                                                      │    │
│  │  Step 2: Expert Rounds (uses critique_runner.py per expert)        │    │
│  │  ─────────────────────────────────────────────────────             │    │
│  │      ┌───────────┐  ┌───────────┐  ┌───────────┐                  │    │
│  │      │  Expert A │  │  Expert B │  │  Expert C │                  │    │
│  │      │  Critique │  │  Critique │  │  Critique │  ← Parallel      │    │
│  │      └───────────┘  └───────────┘  └───────────┘                  │    │
│  │                                                                      │    │
│  │  Step 3: Synthesis (uses narrate_runner.py)                        │    │
│  │  ──────────────────────────────────────────                        │    │
│  │      ┌─────────────────┐                                           │    │
│  │      │  NarrateRunner  │ → Consolidated panel output               │    │
│  │      └─────────────────┘                                           │    │
│  │                                                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Output: Multi-perspective analysis with consensus/divergence summary       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```python
# ask_panel_service.py
class AskPanelService:
    async def execute(
        self,
        topic: str,
        experts: List[Agent],
        knowledge_domains: List[str]
    ) -> PanelResponse:

        # 1. Design panel structure
        design_runner = registry.get_task_runner("design/panel_design")
        structure = await design_runner.execute(
            PanelDesignInput(
                topic=topic,
                experts=[e.code for e in experts],
                knowledge_domains=knowledge_domains
            )
        )

        # 2. Execute rounds (parallel per expert)
        contributions = []
        for round in structure.rounds:
            round_results = await asyncio.gather(*[
                self._execute_expert_round(expert, round, topic, knowledge_domains)
                for expert in experts
            ])
            contributions.extend(round_results)

        # 3. Synthesize
        narrate_runner = registry.get_task_runner("synthesize/narrate")
        synthesis = await narrate_runner.execute(
            NarrateInput(contributions=contributions)
        )

        return PanelResponse(
            topic=topic,
            experts=experts,
            contributions=contributions,
            synthesis=synthesis
        )
```

## 3.4 Workflows (Connected Task Sequences)

**Pattern:** DAG of Task Runners with state management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      WORKFLOW: CONNECTED TASK SEQUENCE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Example: Market Access Strategy Workflow                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       WORKFLOW ENGINE                                │   │
│  │                                                                       │   │
│  │   Task 1: Landscape Scan                                             │   │
│  │   ┌────────────────────┐                                            │   │
│  │   │  Agent: Analyst    │                                            │   │
│  │   │  Runner: ScanRunner│ ──► landscape_data                        │   │
│  │   └────────────────────┘                                            │   │
│  │              │                                                        │   │
│  │              ▼                                                        │   │
│  │   Task 2: Frame Decision                                             │   │
│  │   ┌────────────────────┐                                            │   │
│  │   │  Agent: Strategist │                                            │   │
│  │   │  Runner: FrameRunner│ ──► decision_frame                        │   │
│  │   └────────────────────┘                                            │   │
│  │              │                                                        │   │
│  │              ▼                                                        │   │
│  │   Task 3: Panel Evaluation (embedded Ask Panel)                     │   │
│  │   ┌────────────────────┐                                            │   │
│  │   │  Type: ask_panel   │                                            │   │
│  │   │  Experts: 3        │ ──► multi_perspective_eval                 │   │
│  │   └────────────────────┘                                            │   │
│  │              │                                                        │   │
│  │              ▼                                                        │   │
│  │   ═══════════════════════════════════════════════════════════       │   │
│  │   [HITL CHECKPOINT: Approve strategic direction]                     │   │
│  │   ═══════════════════════════════════════════════════════════       │   │
│  │              │                                                        │   │
│  │              ▼                                                        │   │
│  │   Task 4: Draft Strategy                                             │   │
│  │   ┌────────────────────┐                                            │   │
│  │   │  Agent: Writer     │                                            │   │
│  │   │  Runner: DraftRunner│ ──► strategy_draft                        │   │
│  │   └────────────────────┘                                            │   │
│  │              │                                                        │   │
│  │              ▼                                                        │   │
│  │   Task 5: Compliance Validation                                     │   │
│  │   ┌─────────────────────────┐                                       │   │
│  │   │  Agent: Compliance      │                                       │   │
│  │   │  Runner: ComplianceCheck│ ──► validation_report                 │   │
│  │   └─────────────────────────┘                                       │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Output: Complete strategy document with audit trail                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.5 Solutions (Multi-Workflow Compositions)

**Pattern:** Orchestrated execution of multiple workflows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   SOLUTION: MULTI-WORKFLOW COMPOSITION                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Example: Complete Brand Launch Solution                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SOLUTION ORCHESTRATOR                            │   │
│  │                                                                       │   │
│  │  Phase 1: Market Intelligence (Parallel)                            │   │
│  │  ───────────────────────────────────────                            │   │
│  │      ┌──────────────────┐    ┌──────────────────┐                   │   │
│  │      │ Competitive Intel│    │ Payer Landscape  │                   │   │
│  │      │    Workflow      │    │    Workflow      │                   │   │
│  │      └────────┬─────────┘    └────────┬─────────┘                   │   │
│  │               │                        │                             │   │
│  │               └───────────┬────────────┘                             │   │
│  │                           ▼                                          │   │
│  │  Phase 2: Strategy Development                                       │   │
│  │  ─────────────────────────────                                       │   │
│  │      ┌──────────────────────────────────────┐                       │   │
│  │      │   Market Access Strategy Workflow    │                       │   │
│  │      │   (uses outputs from Phase 1)        │                       │   │
│  │      └────────────────┬─────────────────────┘                       │   │
│  │                       │                                              │   │
│  │                       ▼                                              │   │
│  │  Phase 3: Tactical Planning (Parallel)                              │   │
│  │  ─────────────────────────────────────                              │   │
│  │      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │   │
│  │      │KOL Engagement│ │Evidence Plan │ │Launch Plan   │            │   │
│  │      │  Workflow    │ │  Workflow    │ │  Workflow    │            │   │
│  │      └──────┬───────┘ └──────┬───────┘ └──────┬───────┘            │   │
│  │             │                │                │                      │   │
│  │             └────────────────┼────────────────┘                      │   │
│  │                              ▼                                       │   │
│  │  Phase 4: Integration                                                │   │
│  │  ────────────────────                                                │   │
│  │      ┌──────────────────────────────────────┐                       │   │
│  │      │   Solution Synthesis Workflow        │                       │   │
│  │      │   (consolidates all outputs)         │                       │   │
│  │      └──────────────────────────────────────┘                       │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Output: Integrated brand launch package with all deliverables              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Part 4: Unified Registry Architecture

## 4.1 Registry Design

```python
# /task_runners/registry.py

from enum import Enum
from typing import Dict, Type, Optional, Union
from .base.task_runner import TaskRunner
from .base.family_runner import BaseFamilyRunner

class RunnerType(Enum):
    TASK = "task"          # Atomic operations
    FAMILY = "family"      # Complex workflows

class UnifiedRunnerRegistry:
    """
    Single registry for both Task Runners and Family Runners.

    Provides:
    - Type-safe runner lookup
    - Lazy loading for performance
    - Template-to-runner mapping for Mode 3/4
    - Category-based discovery for workflows
    """

    _task_runners: Dict[str, Type[TaskRunner]] = {}
    _family_runners: Dict[str, Type[BaseFamilyRunner]] = {}
    _template_mapping: Dict[str, str] = {
        # Template family → Family runner
        "DEEP_RESEARCH": "deep_research",
        "STRATEGY": "strategy",
        "INVESTIGATION": "investigation",
        "COMMUNICATION": "communication",
        "MONITORING": "monitoring",
        "EVALUATION": "evaluation",
        "PROBLEM_SOLVING": "problem_solving",
        "GENERIC": "generic",
    }

    # === Registration ===

    @classmethod
    def register_task(cls, category: str, name: str):
        """Decorator to register a task runner."""
        def decorator(runner_cls: Type[TaskRunner]) -> Type[TaskRunner]:
            key = f"{category}/{name}"
            cls._task_runners[key] = runner_cls
            return runner_cls
        return decorator

    @classmethod
    def register_family(cls, family_type: str):
        """Decorator to register a family runner."""
        def decorator(runner_cls: Type[BaseFamilyRunner]) -> Type[BaseFamilyRunner]:
            cls._family_runners[family_type] = runner_cls
            return runner_cls
        return decorator

    # === Lookup ===

    @classmethod
    def get_task_runner(cls, key: str) -> Optional[Type[TaskRunner]]:
        """Get task runner by category/name key."""
        return cls._task_runners.get(key)

    @classmethod
    def get_family_runner(cls, family_type: str) -> Optional[Type[BaseFamilyRunner]]:
        """Get family runner by type."""
        return cls._family_runners.get(family_type)

    @classmethod
    def get_runner_for_template(cls, template_family: str) -> Optional[Type[BaseFamilyRunner]]:
        """Map template family to appropriate family runner."""
        runner_key = cls._template_mapping.get(template_family.upper())
        if runner_key:
            return cls._family_runners.get(runner_key)
        return cls._family_runners.get("generic")  # Fallback

    @classmethod
    def get_task_runners_by_category(cls, category: str) -> Dict[str, Type[TaskRunner]]:
        """Get all task runners in a category."""
        return {
            k: v for k, v in cls._task_runners.items()
            if k.startswith(f"{category}/")
        }

    # === Discovery ===

    @classmethod
    def list_task_runners(cls) -> Dict[str, Type[TaskRunner]]:
        """List all registered task runners."""
        return cls._task_runners.copy()

    @classmethod
    def list_family_runners(cls) -> Dict[str, Type[BaseFamilyRunner]]:
        """List all registered family runners."""
        return cls._family_runners.copy()

    @classmethod
    def get_runner_info(cls, key: str, runner_type: RunnerType) -> dict:
        """Get metadata about a runner."""
        if runner_type == RunnerType.TASK:
            runner = cls._task_runners.get(key)
        else:
            runner = cls._family_runners.get(key)

        if not runner:
            return None

        return {
            "key": key,
            "type": runner_type.value,
            "class": runner.__name__,
            "description": runner.__doc__,
            "input_schema": getattr(runner, "input_schema", None),
            "output_schema": getattr(runner, "output_schema", None),
        }

# Singleton instance
registry = UnifiedRunnerRegistry()
```

## 4.2 Registration Example

```python
# /task_runners/tasks/evaluate/critique_runner.py

from ..base.task_runner import TaskRunner, TaskRunnerInput, TaskRunnerOutput
from ..registry import registry

class CritiqueInput(TaskRunnerInput):
    artifact: str
    rubric: dict
    context: Optional[dict] = None

class CritiqueOutput(TaskRunnerOutput):
    scores: dict
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    overall_score: float

@registry.register_task("evaluate", "critique")
class CritiqueRunner(TaskRunner[CritiqueInput, CritiqueOutput]):
    """
    Evaluates artifacts against a rubric using MCDA.

    Algorithmic Core: Multi-Criteria Decision Analysis
    Duration: 60-90 seconds
    """

    category = "EVALUATE"
    algorithmic_core = "MCDA"
    max_duration_seconds = 90

    async def execute(self, input: CritiqueInput) -> CritiqueOutput:
        # Implementation...
        pass
```

```python
# /task_runners/families/deep_research.py

from ..base.family_runner import BaseFamilyRunner
from ..registry import registry

@registry.register_family("deep_research")
class DeepResearchRunner(BaseFamilyRunner[DeepResearchState]):
    """
    Complex research workflow with Tree-of-Thought, Chain-of-Thought,
    and Reflection patterns.

    Duration: 10-30 minutes
    """

    family_type = "DEEP_RESEARCH"

    def build_graph(self) -> CompiledGraph:
        # Build LangGraph workflow...
        pass
```

---

# Part 5: Service Layer Summary

## 5.1 Complete Service Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VITAL SERVICE LAYER ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  L1: ASK EXPERT (Modes 1-4)                                                 │
│  ═══════════════════════════                                                │
│      ┌────────────────────────────────────────────────────────────────┐    │
│      │ Mode 1: Interactive Chat     │ Direct agent conversation      │    │
│      │ Mode 2: Auto-Select Expert   │ Agent selection + response     │    │
│      │ Mode 3: Deep Research        │ FAMILY RUNNER (streaming)      │    │
│      │ Mode 4: Background Mission   │ FAMILY RUNNER (background)     │    │
│      └────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  L2: ASK PANEL (Multi-Expert)                                               │
│  ═════════════════════════════                                              │
│      ┌────────────────────────────────────────────────────────────────┐    │
│      │ Panel Agent orchestrates multiple expert agents                │    │
│      │ Uses: panel_design_runner, critique_runner, narrate_runner     │    │
│      │ Pattern: Design → Parallel Expert Rounds → Synthesize         │    │
│      └────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  L3: WORKFLOWS (Connected Tasks)                                            │
│  ═══════════════════════════════                                            │
│      ┌────────────────────────────────────────────────────────────────┐    │
│      │ DAG of Agent + Runner tasks with state management              │    │
│      │ Uses: Any TASK RUNNER from the 88 cognitive library           │    │
│      │ Features: HITL checkpoints, parallel execution, branching      │    │
│      └────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  L4: SOLUTIONS (Multi-Workflow)                                             │
│  ═══════════════════════════════                                            │
│      ┌────────────────────────────────────────────────────────────────┐    │
│      │ Orchestrates multiple workflows into cohesive solutions        │    │
│      │ Phases: Intelligence → Strategy → Tactical → Integration      │    │
│      │ Uses: Multiple workflows + synthesis                           │    │
│      └────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  L5: STRATEGIC ADVISOR (Enterprise)                                         │
│  ═══════════════════════════════════                                        │
│      ┌────────────────────────────────────────────────────────────────┐    │
│      │ Long-running strategic engagements                             │    │
│      │ Combines: Expert consultations + Panel reviews + Solutions    │    │
│      │ Memory: Persistent context across sessions                     │    │
│      └────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Runner Usage by Service

| Service | Primary Runner Type | Runners Used | Orchestration |
|---------|---------------------|--------------|---------------|
| **Mode 3** | Family Runner | 1 (based on template) | Self-contained graph |
| **Mode 4** | Family Runner | 1 (based on template) | Background worker |
| **Ask Panel** | Task Runners | 3-5 per panel | Panel orchestrator |
| **Workflows** | Task Runners | 5-15 per workflow | Workflow engine |
| **Solutions** | Mixed | 20-50 across workflows | Solution orchestrator |

---

# Part 6: Implementation Roadmap

## 6.1 Migration Plan

### Phase 1: Consolidation (Week 1-2)

1. **Create unified directory structure**
   - Create `/task_runners/` hierarchy
   - Move family runners from `/modes34/runners/`
   - Keep task runners in existing categories

2. **Implement unified registry**
   - Create `UnifiedRunnerRegistry` class
   - Add registration decorators
   - Implement template mapping

3. **Update imports**
   - Update all references to runner imports
   - Update workflow executor imports
   - Update API route imports

### Phase 2: Integration (Week 3-4)

1. **Wire Mode 3/4 to registry**
   - Update `missions.py` to use `get_runner_for_template()`
   - Remove hardcoded runner selection
   - Add logging for runner selection

2. **Wire Ask Panel to registry**
   - Update panel service to use task runners
   - Implement runner composition pattern

3. **Wire Workflows to registry**
   - Update workflow executor
   - Add runner validation

### Phase 3: Validation (Week 5-6)

1. **Integration tests**
   - Test Mode 3 with each family runner
   - Test Ask Panel with task runners
   - Test workflow execution

2. **Performance benchmarking**
   - Measure runner execution times
   - Optimize slow runners
   - Add caching where appropriate

## 6.2 Success Criteria

| Metric | Target |
|--------|--------|
| Family runners wired | 8/8 (100%) |
| Task runners registered | 88/88 (100%) |
| Mode 3 uses correct runner | All templates |
| Ask Panel uses task runners | All rounds |
| Workflows execute correctly | All pre-defined |

---

# Summary

## Key Decisions

1. **Two Runner Types**: Task Runners (atomic) and Family Runners (complex workflows)
2. **Unified Registry**: Single source of truth for all runner lookup
3. **Template Mapping**: Template family determines which family runner executes
4. **Service Integration**: Each service layer uses runners appropriately

## Runner Distribution

| Category | Count | Primary Service |
|----------|-------|-----------------|
| Family Runners | 8 | Mode 3/4 |
| Cognitive Task Runners | 88 | Panel, Workflows |
| Pharma Domain Runners | 119 | Workflows, Solutions |
| **TOTAL** | **215** | All services |

## Next Steps

1. Create unified registry implementation
2. Migrate family runners to new location
3. Wire Mode 3 execution to use registry
4. Test end-to-end flow
5. Document runner API contracts

---

## Related Documents

- **[RUNNER_PACKAGE_ARCHITECTURE.md](./RUNNER_PACKAGE_ARCHITECTURE.md)** - 13-component runner package, 5 prompt patterns, 6 LangGraph archetypes
- **[TASK_COMPOSITION_ARCHITECTURE.md](./TASK_COMPOSITION_ARCHITECTURE.md)** - 8 workflow orchestration patterns (Sequential, Fan-out/Fan-in, Monitoring, Conditional, Iterative Refinement, Generator-Critic, Saga, Event-Driven)
- **[JTBD_RUNNER_MAPPING.md](./JTBD_RUNNER_MAPPING.md)** - JTBD to Runner routing guide
- **[USER_TEMPLATE_EDITOR_ARCHITECTURE.md](./USER_TEMPLATE_EDITOR_ARCHITECTURE.md)** - Database-First template customization
- **[CONCEPTUAL_DESIGN_INDEX.md](./CONCEPTUAL_DESIGN_INDEX.md)** - Master index of all documents

---

*End of Document*
