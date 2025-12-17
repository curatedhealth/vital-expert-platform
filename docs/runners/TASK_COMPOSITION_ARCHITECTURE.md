# VITAL Platform: Task Composition Architecture
## Orchestrating Runners into Business Workflows

**Version:** 1.0
**Date:** December 2025
**Status:** Gold Standard Design Document
**Classification:** INTERNAL

---

# Executive Summary

This document defines the **Task Composition Architecture** for VITAL platform. Task Composition is the orchestration layer that transforms individual runners into complete business workflows.

**Key Principle:** Runners are atomic cognitive operations. Task Composition combines them into value-delivering workflows.

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPOSITION HIERARCHY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   RUNNER LAYER                    COMPOSITION LAYER              │
│   ════════════                    ═════════════════              │
│                                                                  │
│   ┌─────────────┐                ┌─────────────────────────┐    │
│   │   Runner    │──┐             │  Workflow Composition   │    │
│   │ (Atomic Op) │  │             │  ─────────────────────  │    │
│   └─────────────┘  │             │  • TaskDefinition[]     │    │
│                    │             │  • Dependencies (DAG)   │    │
│   ┌─────────────┐  │ ─────────►  │  • Orchestration Pattern│    │
│   │   Runner    │──┤             │  • HITL Checkpoints     │    │
│   │ (Atomic Op) │  │             └─────────────────────────┘    │
│   └─────────────┘  │                         │                   │
│                    │                         ▼                   │
│   ┌─────────────┐  │             ┌─────────────────────────┐    │
│   │   Runner    │──┘             │   LangGraph Workflow    │    │
│   │ (Atomic Op) │                │   (Executable Graph)    │    │
│   └─────────────┘                └─────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Business Value:**
- **Reusability** - Define once, execute many times
- **Flexibility** - Users can select runner subsets
- **Traceability** - Full audit trail of task executions
- **Scalability** - Parallel execution where possible

---

# Part 1: TaskDefinition Schema

## 1.1 Core Schema

```python
from pydantic import BaseModel, Field
from typing import Optional, Any
from enum import Enum

class TaskStatus(str, Enum):
    """Task execution status."""
    PENDING = "pending"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

class TaskDefinition(BaseModel):
    """Definition of a task in a workflow composition."""

    # ═══════════════════════════════════════════════════════════
    # IDENTITY
    # ═══════════════════════════════════════════════════════════
    task_id: str = Field(
        ...,
        description="Unique identifier for this task within the workflow",
        example="competitive_analysis_001"
    )
    name: str = Field(
        ...,
        description="Human-readable task name",
        example="Competitive Landscape Analysis"
    )
    description: str = Field(
        ...,
        description="Detailed description of what this task does",
        example="Analyzes competitive landscape using SWOT framework"
    )

    # ═══════════════════════════════════════════════════════════
    # EXECUTION CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    agent_type: str = Field(
        ...,
        description="Agent/Persona ID or 'panel_agent' for multi-expert",
        example="competitive_intelligence_analyst"
    )
    runner: str = Field(
        ...,
        description="Runner code from the unified registry",
        example="evaluate_004"  # SWOT runner
    )

    # Optional: Override runner template
    template_id: Optional[str] = Field(
        None,
        description="Custom template ID to use instead of default"
    )

    # ═══════════════════════════════════════════════════════════
    # INPUT/OUTPUT MAPPING
    # ═══════════════════════════════════════════════════════════
    input_mapping: dict[str, Any] = Field(
        default_factory=dict,
        description="Maps workflow state keys to runner input parameters",
        example={
            "document": "$.research_context.market_data",
            "focus_areas": ["competitors", "market_share", "positioning"]
        }
    )
    output_key: str = Field(
        ...,
        description="Key in workflow state where output is stored",
        example="competitive_analysis_result"
    )

    # ═══════════════════════════════════════════════════════════
    # FLOW CONTROL
    # ═══════════════════════════════════════════════════════════
    depends_on: list[str] = Field(
        default_factory=list,
        description="Task IDs that must complete before this task runs",
        example=["market_research_001", "data_collection_001"]
    )
    condition: Optional[str] = Field(
        None,
        description="JSONPath condition to evaluate. Task runs only if true.",
        example="$.competitive_analysis_result.competitor_count > 3"
    )

    # ═══════════════════════════════════════════════════════════
    # HUMAN-IN-THE-LOOP (HITL)
    # ═══════════════════════════════════════════════════════════
    requires_approval: bool = Field(
        False,
        description="Whether task output requires human approval before continuing"
    )
    approval_prompt: Optional[str] = Field(
        None,
        description="Message shown to approver when review is needed",
        example="Please review the competitive analysis before proceeding to positioning."
    )
    approval_timeout_minutes: int = Field(
        60,
        description="How long to wait for approval before timeout"
    )
    on_rejection: str = Field(
        "pause",
        description="Action on rejection: 'pause', 'retry', 'skip', 'fail'"
    )

    # ═══════════════════════════════════════════════════════════
    # EXECUTION CONSTRAINTS
    # ═══════════════════════════════════════════════════════════
    timeout_seconds: int = Field(
        300,
        description="Maximum execution time for this task"
    )
    retry_count: int = Field(
        2,
        description="Number of retries on failure"
    )
    retry_delay_seconds: int = Field(
        5,
        description="Delay between retries"
    )

    # ═══════════════════════════════════════════════════════════
    # METADATA
    # ═══════════════════════════════════════════════════════════
    estimated_duration_minutes: int = Field(
        15,
        description="Expected execution time for UI display"
    )
    tags: list[str] = Field(
        default_factory=list,
        description="Tags for filtering and categorization"
    )
```

## 1.2 Input Mapping Patterns

The `input_mapping` field uses JSONPath expressions to extract data from workflow state:

| Pattern | Example | Description |
|---------|---------|-------------|
| Direct mapping | `"document": "$.context.document"` | Map state key to input |
| Nested access | `"data": "$.results.analysis.findings"` | Access nested objects |
| Array index | `"first": "$.items[0]"` | Access array element |
| Filter | `"approved": "$.items[?(@.status=='approved')]"` | Filter array |
| Wildcard | `"all_names": "$.items[*].name"` | Extract from all items |
| Literal | `"constant": {"_literal": "fixed_value"}` | Pass literal value |
| Combine | `"merged": {"_merge": ["$.a", "$.b"]}` | Merge multiple sources |

**Example Complex Mapping:**

```python
input_mapping = {
    # Direct mapping from workflow state
    "market_data": "$.research_context.market_data",

    # Filtered results from previous task
    "approved_competitors": "$.competitive_scan.competitors[?(@.relevance > 0.7)]",

    # Literal configuration
    "analysis_depth": {"_literal": "comprehensive"},

    # Merged context from multiple sources
    "full_context": {
        "_merge": [
            "$.research_context",
            "$.user_preferences",
            "$.tenant_settings"
        ]
    }
}
```

---

# Part 2: Orchestration Patterns

## 2.1 Pattern Overview

| # | Pattern | Use Case | Complexity | Parallelism |
|---|---------|----------|------------|-------------|
| 1 | Sequential Pipeline | Linear analysis | Low | None |
| 2 | Fan-out / Fan-in | Parallel analysis | Medium | High |
| 3 | Continuous Monitoring | Ongoing tracking | High | Medium |
| 4 | Conditional Branching | Adaptive workflows | Medium | Varies |
| 5 | Iterative Refinement | Quality improvement | Medium | None |
| 6 | Generator-Critic Loop | Content creation | Medium | None |
| 7 | Saga (Compensating) | Transactional workflows | High | Low |
| 8 | Event-Driven | Reactive automation | High | High |

## 2.2 Pattern 1: Sequential Pipeline

**Definition:** Linear progression where each task depends on the previous task's output.

**Best For:** Structured deliverables, staged analysis, document generation.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Task A          │────►│ Task B          │────►│ Task C          │
│ (Research)      │     │ (Analysis)      │     │ (Synthesis)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Schema Example: Positioning Strategy**

```python
positioning_workflow = WorkflowComposition(
    composition_id="positioning_strategy_001",
    name="Positioning Strategy Development",
    pattern="sequential_pipeline",
    tasks=[
        TaskDefinition(
            task_id="competitive_analysis",
            name="Competitive Analysis",
            agent_type="competitive_intelligence_analyst",
            runner="evaluate_004",  # SWOT
            input_mapping={"document": "$.context.market_data"},
            output_key="competitive_result",
            depends_on=[]  # First task
        ),
        TaskDefinition(
            task_id="whitespace_identification",
            name="Whitespace Identifier",
            agent_type="market_strategist",
            runner="discover_002",  # Gap Analysis
            input_mapping={
                "competitive_landscape": "$.competitive_result",
                "market_data": "$.context.market_data"
            },
            output_key="whitespace_result",
            depends_on=["competitive_analysis"]
        ),
        TaskDefinition(
            task_id="concept_generation",
            name="Concept Generator",
            agent_type="brand_strategist",
            runner="create_003",  # Ideation
            input_mapping={
                "whitespaces": "$.whitespace_result.opportunities",
                "constraints": "$.context.brand_guidelines"
            },
            output_key="concepts",
            depends_on=["whitespace_identification"]
        ),
        TaskDefinition(
            task_id="evidence_mapping",
            name="Evidence Mapper",
            agent_type="medical_affairs_specialist",
            runner="synthesize_002",  # Evidence Synthesis
            input_mapping={
                "concepts": "$.concepts",
                "clinical_data": "$.context.clinical_evidence"
            },
            output_key="evidence_map",
            depends_on=["concept_generation"]
        ),
        TaskDefinition(
            task_id="kol_validation",
            name="KOL Position Validator",
            agent_type="kol_engagement_specialist",
            runner="validate_003",  # Expert Validation
            input_mapping={
                "positioning": "$.concepts",
                "evidence": "$.evidence_map"
            },
            output_key="kol_validation",
            depends_on=["evidence_mapping"],
            requires_approval=True,
            approval_prompt="Review KOL alignment before finalizing positioning."
        ),
        TaskDefinition(
            task_id="positioning_finalization",
            name="Positioning Finalizer",
            agent_type="brand_strategist",
            runner="create_005",  # Document Generation
            input_mapping={
                "concepts": "$.concepts",
                "evidence": "$.evidence_map",
                "kol_feedback": "$.kol_validation"
            },
            output_key="final_positioning",
            depends_on=["kol_validation"]
        )
    ]
)
```

**LangGraph Translation:**

```python
def build_sequential_pipeline(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for sequential pipeline pattern."""

    graph = StateGraph(CompositionState)

    # Add nodes for each task
    for task in composition.tasks:
        graph.add_node(
            task.task_id,
            create_task_node(task)
        )

    # Add edges following dependency order
    graph.add_edge(START, composition.tasks[0].task_id)

    for i, task in enumerate(composition.tasks[:-1]):
        next_task = composition.tasks[i + 1]

        if next_task.requires_approval:
            # Insert HITL checkpoint
            graph.add_node(f"{task.task_id}_approval", create_hitl_node(next_task))
            graph.add_edge(task.task_id, f"{task.task_id}_approval")
            graph.add_edge(f"{task.task_id}_approval", next_task.task_id)
        else:
            graph.add_edge(task.task_id, next_task.task_id)

    graph.add_edge(composition.tasks[-1].task_id, END)

    return graph.compile()
```

## 2.3 Pattern 2: Fan-out / Fan-in (Parallel with Merge)

**Definition:** Multiple independent tasks run in parallel, then results are merged.

**Best For:** Multi-dimensional analysis, comprehensive assessments, brand planning.

```
                    ┌─────────────────┐
                    │ Setup Task      │
                    │ (Diagnostics)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Parallel A    │   │ Parallel B    │   │ Parallel C    │
│ (Product)     │   │ (Price)       │   │ (Place)       │
└───────────────┘   └───────────────┘   └───────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Merge Task      │
                    │ (Validator)     │
                    └─────────────────┘
```

**Schema Example: Brand Plan (10 Ps)**

```python
brand_plan_workflow = WorkflowComposition(
    composition_id="brand_plan_10p_001",
    name="Comprehensive Brand Plan (10 Ps)",
    pattern="fan_out_fan_in",
    tasks=[
        # Setup task
        TaskDefinition(
            task_id="market_diagnostics",
            name="Market Diagnostician",
            agent_type="market_analyst",
            runner="understand_001",  # Market Scan
            input_mapping={"context": "$.input_context"},
            output_key="market_diagnostics",
            depends_on=[]
        ),

        # Parallel tasks - The 10 Ps
        TaskDefinition(
            task_id="product_positioning",
            name="Product Positioner",
            agent_type="product_strategist",
            runner="evaluate_001",  # Product Analysis
            input_mapping={"diagnostics": "$.market_diagnostics"},
            output_key="product_analysis",
            depends_on=["market_diagnostics"]
        ),
        TaskDefinition(
            task_id="price_strategy",
            name="Price Strategist",
            agent_type="pricing_analyst",
            runner="evaluate_002",  # Pricing Analysis
            input_mapping={"diagnostics": "$.market_diagnostics"},
            output_key="pricing_analysis",
            depends_on=["market_diagnostics"]
        ),
        TaskDefinition(
            task_id="place_channel",
            name="Place Channel Analyst",
            agent_type="channel_strategist",
            runner="evaluate_003",  # Channel Analysis
            input_mapping={"diagnostics": "$.market_diagnostics"},
            output_key="channel_analysis",
            depends_on=["market_diagnostics"]
        ),
        TaskDefinition(
            task_id="promotion_planning",
            name="Promotion Planner",
            agent_type="marketing_strategist",
            runner="plan_001",  # Campaign Planning
            input_mapping={"diagnostics": "$.market_diagnostics"},
            output_key="promotion_plan",
            depends_on=["market_diagnostics"]
        ),
        TaskDefinition(
            task_id="people_capability",
            name="People Capability Analyst",
            agent_type="org_development_specialist",
            runner="evaluate_005",  # Capability Assessment
            input_mapping={"diagnostics": "$.market_diagnostics"},
            output_key="capability_analysis",
            depends_on=["market_diagnostics"]
        ),
        TaskDefinition(
            task_id="packaging_optimization",
            name="Packaging Optimizer",
            agent_type="packaging_specialist",
            runner="design_001",  # Package Design
            input_mapping={"diagnostics": "$.market_diagnostics"},
            output_key="packaging_design",
            depends_on=["market_diagnostics"]
        ),
        # Additional Ps: Process, Physical Evidence, Partners, Performance
        # ... (similar pattern)

        # Merge task
        TaskDefinition(
            task_id="plan_validation",
            name="Plan Validator",
            agent_type="brand_manager",
            runner="validate_001",  # Plan Validation
            input_mapping={
                "product": "$.product_analysis",
                "price": "$.pricing_analysis",
                "place": "$.channel_analysis",
                "promotion": "$.promotion_plan",
                "people": "$.capability_analysis",
                "packaging": "$.packaging_design"
            },
            output_key="validated_plan",
            depends_on=[
                "product_positioning",
                "price_strategy",
                "place_channel",
                "promotion_planning",
                "people_capability",
                "packaging_optimization"
            ],
            requires_approval=True,
            approval_prompt="Review integrated brand plan before finalization."
        )
    ]
)
```

**LangGraph Translation:**

```python
def build_fan_out_fan_in(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for fan-out/fan-in pattern."""

    graph = StateGraph(CompositionState)

    # Identify setup, parallel, and merge tasks
    setup_tasks = [t for t in composition.tasks if not t.depends_on]
    merge_tasks = [t for t in composition.tasks if len(t.depends_on) > 1]
    parallel_tasks = [
        t for t in composition.tasks
        if t not in setup_tasks and t not in merge_tasks
    ]

    # Add all nodes
    for task in composition.tasks:
        graph.add_node(task.task_id, create_task_node(task))

    # Setup → Parallel (using Send for parallelism)
    def fan_out(state: CompositionState) -> list[Send]:
        return [
            Send(task.task_id, state)
            for task in parallel_tasks
        ]

    graph.add_edge(START, setup_tasks[0].task_id)
    graph.add_conditional_edges(
        setup_tasks[0].task_id,
        fan_out,
        [t.task_id for t in parallel_tasks]
    )

    # Parallel → Merge (all must complete)
    for parallel_task in parallel_tasks:
        graph.add_edge(parallel_task.task_id, merge_tasks[0].task_id)

    graph.add_edge(merge_tasks[0].task_id, END)

    return graph.compile()
```

## 2.4 Pattern 3: Continuous Monitoring

**Definition:** Setup followed by ongoing monitoring loop with periodic updates.

**Best For:** Signal tracking, early warning systems, competitive intelligence.

```
┌─────────────────┐     ┌─────────────────┐
│ Signal Setup    │────►│ Monitoring      │
│ (Define)        │     │ Executor        │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │   MONITORING   │◄───┐
                        │     LOOP       │    │
                        └────────┬───────┘    │
                                 │            │
                    ┌────────────┼────────────┤
                    │            │            │
                    ▼            ▼            │
           ┌─────────────┐ ┌─────────────┐   │
           │ Analyzer    │ │ Threshold   │───┘
           │ (Evaluate)  │ │ Manager     │
           └─────────────┘ └─────────────┘
                    │
                    ▼
           ┌─────────────┐
           │ Alert       │
           │ Generator   │
           └─────────────┘
```

**Schema Example: Disruption Early Warning**

```python
disruption_monitoring = WorkflowComposition(
    composition_id="disruption_early_warning_001",
    name="Disruption Early Warning System",
    pattern="continuous_monitoring",
    monitoring_config=MonitoringConfig(
        interval_minutes=60,
        max_iterations=168,  # 1 week
        stop_condition="$.alert_triggered == true"
    ),
    tasks=[
        TaskDefinition(
            task_id="signal_definition",
            name="Signal Definer",
            agent_type="competitive_intelligence_analyst",
            runner="plan_002",  # Signal Definition
            input_mapping={"context": "$.input_context"},
            output_key="signal_definitions",
            depends_on=[],
            is_setup=True  # Runs once
        ),
        TaskDefinition(
            task_id="monitoring_setup",
            name="Monitoring Setup Executor",
            agent_type="data_engineer",
            runner="execute_001",  # Setup Execution
            input_mapping={"signals": "$.signal_definitions"},
            output_key="monitoring_config",
            depends_on=["signal_definition"],
            is_setup=True
        ),
        # Loop tasks
        TaskDefinition(
            task_id="signal_scan",
            name="Signal Scanner",
            agent_type="market_analyst",
            runner="watch_001",  # Signal Detection
            input_mapping={
                "signals": "$.signal_definitions",
                "config": "$.monitoring_config"
            },
            output_key="current_signals",
            depends_on=["monitoring_setup"],
            is_loop=True
        ),
        TaskDefinition(
            task_id="probability_estimation",
            name="Probability Estimator",
            agent_type="risk_analyst",
            runner="predict_001",  # Probability Estimation
            input_mapping={"signals": "$.current_signals"},
            output_key="probability_estimates",
            depends_on=["signal_scan"],
            is_loop=True
        ),
        TaskDefinition(
            task_id="threshold_check",
            name="Threshold Manager",
            agent_type="alert_manager",
            runner="validate_002",  # Threshold Validation
            input_mapping={
                "estimates": "$.probability_estimates",
                "thresholds": "$.monitoring_config.thresholds"
            },
            output_key="threshold_status",
            depends_on=["probability_estimation"],
            is_loop=True
        ),
        TaskDefinition(
            task_id="alert_generation",
            name="Alert Generator",
            agent_type="notification_specialist",
            runner="execute_002",  # Alert Execution
            input_mapping={"status": "$.threshold_status"},
            output_key="alerts",
            depends_on=["threshold_check"],
            condition="$.threshold_status.breached == true",
            is_loop=True
        )
    ]
)
```

**LangGraph Translation:**

```python
def build_continuous_monitoring(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for continuous monitoring pattern."""

    graph = StateGraph(CompositionState)

    setup_tasks = [t for t in composition.tasks if getattr(t, 'is_setup', False)]
    loop_tasks = [t for t in composition.tasks if getattr(t, 'is_loop', False)]

    # Add nodes
    for task in composition.tasks:
        graph.add_node(task.task_id, create_task_node(task))

    # Setup phase
    graph.add_edge(START, setup_tasks[0].task_id)
    for i, task in enumerate(setup_tasks[:-1]):
        graph.add_edge(task.task_id, setup_tasks[i + 1].task_id)

    # Enter loop
    graph.add_edge(setup_tasks[-1].task_id, loop_tasks[0].task_id)

    # Loop connections
    for i, task in enumerate(loop_tasks[:-1]):
        next_task = loop_tasks[i + 1]
        if next_task.condition:
            graph.add_conditional_edges(
                task.task_id,
                create_condition_checker(next_task.condition),
                {True: next_task.task_id, False: "loop_continue"}
            )
        else:
            graph.add_edge(task.task_id, next_task.task_id)

    # Loop continuation check
    graph.add_node("loop_continue", create_loop_checker(composition.monitoring_config))
    graph.add_conditional_edges(
        "loop_continue",
        should_continue_loop,
        {True: loop_tasks[0].task_id, False: END}
    )

    # Alert exits loop
    graph.add_edge(loop_tasks[-1].task_id, END)

    return graph.compile()
```

## 2.5 Pattern 4: Conditional Branching

**Definition:** Analysis output determines which path to take next.

**Best For:** Adaptive workflows, decision trees, recommendation engines.

```
┌─────────────────┐     ┌─────────────────┐
│ Initial         │────►│ Decision        │
│ Analysis        │     │ Point           │
└─────────────────┘     └────────┬────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │ IF: Condition │   │ IF: Condition │   │ IF: Condition │
    │ A → Path A    │   │ B → Path B    │   │ C → Path C    │
    └───────────────┘   └───────────────┘   └───────────────┘
```

**Schema Example: Digital Health Opportunity**

```python
digital_health_workflow = WorkflowComposition(
    composition_id="digital_health_opportunity_001",
    name="Digital Health Opportunity Assessment",
    pattern="conditional_branching",
    tasks=[
        TaskDefinition(
            task_id="journey_mapping",
            name="Patient Journey Mapper",
            agent_type="patient_experience_analyst",
            runner="understand_002",  # Journey Mapping
            input_mapping={"context": "$.input_context"},
            output_key="patient_journey",
            depends_on=[]
        ),
        TaskDefinition(
            task_id="modality_comparison",
            name="Modality Comparator",
            agent_type="digital_health_analyst",
            runner="evaluate_006",  # Modality Comparison
            input_mapping={"journey": "$.patient_journey"},
            output_key="modality_assessment",
            depends_on=["journey_mapping"]
        ),

        # Decision node
        TaskDefinition(
            task_id="decision_point",
            name="Opportunity Router",
            agent_type="router_agent",
            runner="decide_001",  # Decision Router
            input_mapping={"assessment": "$.modality_assessment"},
            output_key="decision",
            depends_on=["modality_comparison"],
            is_decision_point=True,
            branches={
                "dtx": "$.modality_assessment.recommended_modality == 'DTx'",
                "remote_monitoring": "$.modality_assessment.recommended_modality == 'Remote Monitoring'",
                "ai_ml": "$.modality_assessment.recommended_modality == 'AI/ML'"
            }
        ),

        # Branch A: Digital Therapeutics
        TaskDefinition(
            task_id="dtx_regulatory",
            name="DTx Regulatory Analyst",
            agent_type="dtx_regulatory_specialist",
            runner="validate_004",  # Regulatory Validation
            input_mapping={"assessment": "$.modality_assessment"},
            output_key="dtx_regulatory",
            depends_on=["decision_point"],
            condition="$.decision.branch == 'dtx'"
        ),
        TaskDefinition(
            task_id="dtx_development",
            name="DTx Development Planner",
            agent_type="dtx_product_manager",
            runner="plan_003",  # Development Planning
            input_mapping={"regulatory": "$.dtx_regulatory"},
            output_key="dtx_plan",
            depends_on=["dtx_regulatory"]
        ),

        # Branch B: Remote Monitoring
        TaskDefinition(
            task_id="remote_device_selection",
            name="Remote Device Selector",
            agent_type="biomedical_engineer",
            runner="evaluate_007",  # Device Evaluation
            input_mapping={"assessment": "$.modality_assessment"},
            output_key="device_selection",
            depends_on=["decision_point"],
            condition="$.decision.branch == 'remote_monitoring'"
        ),
        TaskDefinition(
            task_id="remote_integration",
            name="Remote Integration Planner",
            agent_type="integration_specialist",
            runner="plan_004",  # Integration Planning
            input_mapping={"devices": "$.device_selection"},
            output_key="integration_plan",
            depends_on=["remote_device_selection"]
        ),

        # Branch C: AI/ML Analytics
        TaskDefinition(
            task_id="ml_use_case",
            name="ML Use Case Definer",
            agent_type="data_scientist",
            runner="design_002",  # ML Design
            input_mapping={"assessment": "$.modality_assessment"},
            output_key="ml_use_cases",
            depends_on=["decision_point"],
            condition="$.decision.branch == 'ai_ml'"
        ),
        TaskDefinition(
            task_id="ml_data_strategy",
            name="ML Data Strategist",
            agent_type="data_engineer",
            runner="plan_005",  # Data Strategy
            input_mapping={"use_cases": "$.ml_use_cases"},
            output_key="data_strategy",
            depends_on=["ml_use_case"]
        ),

        # Convergence point
        TaskDefinition(
            task_id="final_recommendation",
            name="Final Recommendation Generator",
            agent_type="digital_health_strategist",
            runner="synthesize_003",  # Recommendation Synthesis
            input_mapping={
                "dtx_plan": "$.dtx_plan",
                "integration_plan": "$.integration_plan",
                "data_strategy": "$.data_strategy"
            },
            output_key="final_recommendation",
            depends_on=["dtx_development", "remote_integration", "ml_data_strategy"],
            requires_approval=True,
            approval_prompt="Review digital health recommendation before finalizing."
        )
    ]
)
```

**LangGraph Translation:**

```python
def build_conditional_branching(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for conditional branching pattern."""

    graph = StateGraph(CompositionState)

    # Find decision points
    decision_points = [t for t in composition.tasks if getattr(t, 'is_decision_point', False)]

    # Add all nodes
    for task in composition.tasks:
        graph.add_node(task.task_id, create_task_node(task))

    # Build edges
    for task in composition.tasks:
        if not task.depends_on:
            graph.add_edge(START, task.task_id)

        if task.is_decision_point:
            # Create conditional routing
            def route_decision(state: CompositionState, branches=task.branches):
                for branch_name, condition in branches.items():
                    if evaluate_condition(state, condition):
                        return branch_name
                return "default"

            branch_targets = {}
            for branch_name, condition in task.branches.items():
                # Find first task in this branch
                branch_tasks = [
                    t for t in composition.tasks
                    if t.condition and branch_name in t.condition
                ]
                if branch_tasks:
                    branch_targets[branch_name] = branch_tasks[0].task_id

            graph.add_conditional_edges(
                task.task_id,
                route_decision,
                branch_targets
            )
        else:
            # Standard dependency edges
            for dep in task.depends_on:
                if not any(t.is_decision_point for t in composition.tasks if t.task_id == dep):
                    graph.add_edge(dep, task.task_id)

    # Find final task
    final_tasks = [t for t in composition.tasks if not any(
        t.task_id in other.depends_on for other in composition.tasks
    )]
    for ft in final_tasks:
        graph.add_edge(ft.task_id, END)

    return graph.compile()
```

## 2.6 Pattern 5: Iterative Refinement

**Definition:** Loop that executes until a quality threshold is met or max iterations reached.

**Best For:** Document polishing, content improvement, incremental optimization.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Initial         │────►│ Quality         │────►│ Meets Threshold?│
│ Generation      │     │ Assessment      │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    │ NO                 │ YES                │
                                    ▼                    │                    ▼
                           ┌─────────────────┐          │           ┌─────────────────┐
                           │ Refinement      │          │           │ Final Output    │
                           │ Task            │──────────┘           │                 │
                           └─────────────────┘                      └─────────────────┘
                                    │
                                    └─────────► (back to Quality Assessment)
```

**Schema Example: Executive Summary Refinement**

```python
executive_summary_refinement = WorkflowComposition(
    composition_id="executive_summary_refinement_001",
    name="Executive Summary Iterative Refinement",
    pattern="iterative_refinement",
    refinement_config=RefinementConfig(
        max_iterations=5,
        quality_threshold=0.85,
        quality_metric="$.quality_score.overall"
    ),
    tasks=[
        TaskDefinition(
            task_id="initial_draft",
            name="Initial Draft Generator",
            agent_type="content_strategist",
            runner="create_001",  # Draft Generation
            input_mapping={"context": "$.input_context"},
            output_key="current_draft",
            depends_on=[],
            is_initial=True
        ),
        TaskDefinition(
            task_id="quality_assessment",
            name="Quality Assessor",
            agent_type="editor",
            runner="evaluate_008",  # Quality Scoring
            input_mapping={
                "document": "$.current_draft",
                "criteria": "$.input_context.quality_criteria"
            },
            output_key="quality_score",
            depends_on=["initial_draft"],
            is_loop=True
        ),
        TaskDefinition(
            task_id="refinement",
            name="Document Refiner",
            agent_type="content_editor",
            runner="refine_001",  # Refinement
            input_mapping={
                "document": "$.current_draft",
                "feedback": "$.quality_score.improvements"
            },
            output_key="current_draft",  # Overwrites previous draft
            depends_on=["quality_assessment"],
            condition="$.quality_score.overall < 0.85",
            is_loop=True
        )
    ]
)
```

**LangGraph Translation:**

```python
def build_iterative_refinement(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for iterative refinement pattern."""

    graph = StateGraph(CompositionState)
    config = composition.refinement_config

    # Add nodes
    initial_task = next(t for t in composition.tasks if getattr(t, 'is_initial', False))
    loop_tasks = [t for t in composition.tasks if getattr(t, 'is_loop', False)]

    graph.add_node(initial_task.task_id, create_task_node(initial_task))
    for task in loop_tasks:
        graph.add_node(task.task_id, create_task_node(task))

    # Quality check node
    def check_quality(state: CompositionState) -> str:
        quality = evaluate_jsonpath(state, config.quality_metric)
        iterations = state.get("iteration_count", 0)

        if quality >= config.quality_threshold:
            return "complete"
        elif iterations >= config.max_iterations:
            return "max_iterations"
        else:
            return "continue"

    graph.add_node("quality_gate", check_quality)

    # Edges
    graph.add_edge(START, initial_task.task_id)
    graph.add_edge(initial_task.task_id, loop_tasks[0].task_id)  # quality_assessment
    graph.add_edge(loop_tasks[0].task_id, "quality_gate")

    graph.add_conditional_edges(
        "quality_gate",
        lambda state: check_quality(state),
        {
            "complete": END,
            "max_iterations": END,
            "continue": loop_tasks[1].task_id  # refinement
        }
    )

    graph.add_edge(loop_tasks[1].task_id, loop_tasks[0].task_id)  # Back to assessment

    return graph.compile()
```

## 2.7 Pattern 6: Generator-Critic Loop

**Definition:** One task generates content, another critiques it, then generation improves based on critique.

**Best For:** High-quality content creation, review processes, academic writing.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Generator       │────►│ Critic          │────►│ Acceptable?     │
│ (Creates)       │     │ (Evaluates)     │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        ▲                                                │
        │                           ┌────────────────────┼────────────────────┐
        │                           │ NO                 │ YES                │
        │                           ▼                    │                    ▼
        │                  ┌─────────────────┐          │           ┌─────────────────┐
        └──────────────────│ Revision        │          │           │ Final Output    │
           (with critique) │ Instructions    │──────────┘           │                 │
                           └─────────────────┘                      └─────────────────┘
```

**Schema Example: Medical Writing with Review**

```python
medical_writing_workflow = WorkflowComposition(
    composition_id="medical_writing_review_001",
    name="Medical Writing with Critic Review",
    pattern="generator_critic_loop",
    critic_config=CriticConfig(
        max_revisions=3,
        acceptance_threshold=0.9,
        critic_criteria=["accuracy", "clarity", "compliance", "citations"]
    ),
    tasks=[
        TaskDefinition(
            task_id="content_generator",
            name="Medical Content Generator",
            agent_type="medical_writer",
            runner="create_002",  # Medical Writing
            input_mapping={
                "topic": "$.input_context.topic",
                "guidelines": "$.input_context.style_guide",
                "previous_critique": "$.critic_feedback"  # Empty on first pass
            },
            output_key="generated_content",
            depends_on=[],
            is_generator=True
        ),
        TaskDefinition(
            task_id="content_critic",
            name="Medical Content Critic",
            agent_type="medical_reviewer",
            runner="validate_005",  # Medical Review
            input_mapping={
                "content": "$.generated_content",
                "criteria": "$.input_context.review_criteria"
            },
            output_key="critic_feedback",
            depends_on=["content_generator"],
            is_critic=True
        ),
        TaskDefinition(
            task_id="revision_decision",
            name="Revision Decision Maker",
            agent_type="editor",
            runner="decide_002",  # Decision
            input_mapping={
                "content": "$.generated_content",
                "critique": "$.critic_feedback"
            },
            output_key="revision_decision",
            depends_on=["content_critic"],
            is_decision_point=True,
            branches={
                "revise": "$.critic_feedback.score < 0.9",
                "accept": "$.critic_feedback.score >= 0.9"
            }
        )
    ]
)
```

**LangGraph Translation:**

```python
def build_generator_critic_loop(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for generator-critic loop pattern."""

    graph = StateGraph(CompositionState)
    config = composition.critic_config

    generator = next(t for t in composition.tasks if getattr(t, 'is_generator', False))
    critic = next(t for t in composition.tasks if getattr(t, 'is_critic', False))

    graph.add_node("generator", create_task_node(generator))
    graph.add_node("critic", create_task_node(critic))

    def should_revise(state: CompositionState) -> str:
        score = state["workflow_outputs"].get("critic_feedback", {}).get("score", 0)
        revisions = state.get("revision_count", 0)

        if score >= config.acceptance_threshold:
            return "accept"
        elif revisions >= config.max_revisions:
            return "accept_with_notes"
        else:
            return "revise"

    # Edges
    graph.add_edge(START, "generator")
    graph.add_edge("generator", "critic")

    graph.add_conditional_edges(
        "critic",
        should_revise,
        {
            "accept": END,
            "accept_with_notes": END,
            "revise": "generator"  # Loop back with critique
        }
    )

    return graph.compile()
```

## 2.8 Pattern 7: Saga (Compensating Transactions)

**Definition:** Multi-step workflow where each step has a compensation action to rollback on failure.

**Best For:** Complex business transactions, regulatory submissions, multi-system integrations.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Step 1          │────►│ Step 2          │────►│ Step 3          │
│ (Action A)      │     │ (Action B)      │     │ (Action C)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ On Failure            │ On Failure            │ On Failure
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Compensate A    │◄────│ Compensate B    │◄────│ Compensate C    │
│ (Rollback)      │     │ (Rollback)      │     │ (Rollback)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Schema Example: Regulatory Submission Process**

```python
regulatory_submission = WorkflowComposition(
    composition_id="regulatory_submission_001",
    name="Regulatory Submission Saga",
    pattern="saga_compensating",
    saga_config=SagaConfig(
        rollback_on_failure=True,
        compensation_timeout_minutes=30,
        notify_on_rollback=True
    ),
    tasks=[
        # Forward actions
        TaskDefinition(
            task_id="document_preparation",
            name="Document Preparation",
            agent_type="regulatory_specialist",
            runner="prepare_001",
            input_mapping={"submission": "$.input_context"},
            output_key="prepared_documents",
            depends_on=[],
            compensation_task_id="rollback_document_preparation"
        ),
        TaskDefinition(
            task_id="compliance_validation",
            name="Compliance Validation",
            agent_type="compliance_officer",
            runner="validate_006",
            input_mapping={"documents": "$.prepared_documents"},
            output_key="validation_result",
            depends_on=["document_preparation"],
            compensation_task_id="rollback_compliance_validation"
        ),
        TaskDefinition(
            task_id="submission_execution",
            name="Submission Execution",
            agent_type="regulatory_submitter",
            runner="execute_003",
            input_mapping={
                "documents": "$.prepared_documents",
                "validation": "$.validation_result"
            },
            output_key="submission_confirmation",
            depends_on=["compliance_validation"],
            compensation_task_id="rollback_submission"
        ),

        # Compensation actions (only run on failure)
        TaskDefinition(
            task_id="rollback_submission",
            name="Rollback Submission",
            agent_type="regulatory_specialist",
            runner="compensate_001",
            input_mapping={"submission": "$.submission_confirmation"},
            output_key="submission_rollback",
            is_compensation=True
        ),
        TaskDefinition(
            task_id="rollback_compliance_validation",
            name="Rollback Compliance Validation",
            agent_type="compliance_officer",
            runner="compensate_002",
            input_mapping={"validation": "$.validation_result"},
            output_key="validation_rollback",
            is_compensation=True
        ),
        TaskDefinition(
            task_id="rollback_document_preparation",
            name="Rollback Document Preparation",
            agent_type="regulatory_specialist",
            runner="compensate_003",
            input_mapping={"documents": "$.prepared_documents"},
            output_key="document_rollback",
            is_compensation=True
        )
    ]
)
```

**LangGraph Translation:**

```python
def build_saga_pattern(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for saga pattern with compensation."""

    graph = StateGraph(CompositionState)
    config = composition.saga_config

    forward_tasks = [t for t in composition.tasks if not getattr(t, 'is_compensation', False)]
    compensation_tasks = {
        t.task_id: t for t in composition.tasks if getattr(t, 'is_compensation', False)
    }

    # Add forward nodes with error handling
    for task in forward_tasks:
        graph.add_node(task.task_id, create_saga_node(task, compensation_tasks))

    # Add compensation nodes
    for task_id, task in compensation_tasks.items():
        graph.add_node(task_id, create_task_node(task))

    # Forward edges
    graph.add_edge(START, forward_tasks[0].task_id)
    for i, task in enumerate(forward_tasks[:-1]):
        graph.add_conditional_edges(
            task.task_id,
            lambda state, t=task: "continue" if not state.get("saga_failed") else "compensate",
            {
                "continue": forward_tasks[i + 1].task_id,
                "compensate": task.compensation_task_id
            }
        )

    # Last forward task
    graph.add_conditional_edges(
        forward_tasks[-1].task_id,
        lambda state: "complete" if not state.get("saga_failed") else "compensate",
        {
            "complete": END,
            "compensate": forward_tasks[-1].compensation_task_id
        }
    )

    # Compensation chain (reverse order)
    for i in range(len(forward_tasks) - 1, 0, -1):
        current_comp = forward_tasks[i].compensation_task_id
        prev_comp = forward_tasks[i - 1].compensation_task_id
        graph.add_edge(current_comp, prev_comp)

    graph.add_edge(forward_tasks[0].compensation_task_id, END)

    return graph.compile()

def create_saga_node(task: TaskDefinition, compensations: dict) -> Callable:
    """Create a saga node that tracks state for compensation."""

    async def saga_node(state: CompositionState) -> CompositionState:
        try:
            # Execute the actual task
            result = await execute_task(task, state)
            state["workflow_outputs"][task.output_key] = result
            state["completed_saga_steps"].append(task.task_id)
            return state
        except Exception as e:
            state["saga_failed"] = True
            state["saga_failure_point"] = task.task_id
            state["errors"].append({"task": task.task_id, "error": str(e)})
            return state

    return saga_node
```

## 2.9 Pattern 8: Event-Driven

**Definition:** Tasks triggered by events rather than explicit dependencies.

**Best For:** Reactive workflows, notification systems, async integrations.

```
┌─────────────────────────────────────────────────────────────────┐
│                         EVENT BUS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ┌─────────────────┐                                         │
│     │ Event: document │                                         │
│     │ _uploaded       │                                         │
│     └────────┬────────┘                                         │
│              │                                                   │
│     ┌────────┴────────┬────────────────┬────────────────┐       │
│     │                 │                │                │       │
│     ▼                 ▼                ▼                ▼       │
│ ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐    │
│ │Extractor│     │Validator│     │Notifier │     │Archiver │    │
│ │(Async)  │     │(Async)  │     │(Async)  │     │(Async)  │    │
│ └────┬────┘     └────┬────┘     └─────────┘     └─────────┘    │
│      │               │                                          │
│      │ Emits:        │ Emits:                                   │
│      │ extraction    │ validation                               │
│      │ _complete     │ _complete                                │
│      ▼               ▼                                          │
│ ┌─────────┐     ┌─────────┐                                    │
│ │Analyzer │     │Approver │                                    │
│ │(Async)  │     │(Async)  │                                    │
│ └─────────┘     └─────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Schema Example: Document Processing Pipeline**

```python
document_processing = WorkflowComposition(
    composition_id="document_processing_001",
    name="Event-Driven Document Processing",
    pattern="event_driven",
    event_config=EventConfig(
        event_bus="internal",  # or "kafka", "rabbitmq"
        timeout_minutes=60,
        dead_letter_queue=True
    ),
    tasks=[
        # Trigger task
        TaskDefinition(
            task_id="document_receiver",
            name="Document Receiver",
            agent_type="document_processor",
            runner="receive_001",
            input_mapping={"event": "$.trigger_event"},
            output_key="received_document",
            depends_on=[],
            emits_event="document_received"
        ),

        # Event listeners (triggered by events, not dependencies)
        TaskDefinition(
            task_id="content_extractor",
            name="Content Extractor",
            agent_type="extraction_specialist",
            runner="extract_001",
            input_mapping={"document": "$.received_document"},
            output_key="extracted_content",
            listens_to="document_received",
            emits_event="extraction_complete"
        ),
        TaskDefinition(
            task_id="compliance_validator",
            name="Compliance Validator",
            agent_type="compliance_checker",
            runner="validate_007",
            input_mapping={"document": "$.received_document"},
            output_key="compliance_status",
            listens_to="document_received",
            emits_event="validation_complete"
        ),
        TaskDefinition(
            task_id="stakeholder_notifier",
            name="Stakeholder Notifier",
            agent_type="notification_agent",
            runner="notify_001",
            input_mapping={"document": "$.received_document"},
            output_key="notification_status",
            listens_to="document_received"
        ),
        TaskDefinition(
            task_id="content_analyzer",
            name="Content Analyzer",
            agent_type="content_analyst",
            runner="analyze_001",
            input_mapping={"content": "$.extracted_content"},
            output_key="analysis_result",
            listens_to="extraction_complete"
        ),
        TaskDefinition(
            task_id="approval_router",
            name="Approval Router",
            agent_type="approval_manager",
            runner="route_001",
            input_mapping={"compliance": "$.compliance_status"},
            output_key="approval_route",
            listens_to="validation_complete",
            requires_approval=True,
            approval_prompt="Document compliance check complete. Route to appropriate approver?"
        )
    ]
)
```

**LangGraph Translation:**

```python
from langgraph.graph import Send

def build_event_driven(composition: WorkflowComposition) -> StateGraph:
    """Build LangGraph for event-driven pattern."""

    graph = StateGraph(CompositionState)
    config = composition.event_config

    # Build event → listener mapping
    event_listeners = {}
    for task in composition.tasks:
        event = getattr(task, 'listens_to', None)
        if event:
            if event not in event_listeners:
                event_listeners[event] = []
            event_listeners[event].append(task)

    # Add all task nodes
    for task in composition.tasks:
        graph.add_node(task.task_id, create_event_node(task))

    # Add event dispatcher nodes
    for event_name, listeners in event_listeners.items():
        dispatcher_id = f"dispatch_{event_name}"

        def create_dispatcher(listeners=listeners):
            async def dispatcher(state: CompositionState) -> list[Send]:
                # Fan out to all listeners
                return [Send(listener.task_id, state) for listener in listeners]
            return dispatcher

        graph.add_node(dispatcher_id, create_dispatcher())

    # Find trigger task
    trigger_task = next(t for t in composition.tasks if not getattr(t, 'listens_to', None))
    graph.add_edge(START, trigger_task.task_id)

    # Wire emitting tasks to dispatchers
    for task in composition.tasks:
        emits = getattr(task, 'emits_event', None)
        if emits and emits in event_listeners:
            graph.add_edge(task.task_id, f"dispatch_{emits}")

    # Wire dispatchers to listeners using Send
    for event_name, listeners in event_listeners.items():
        dispatcher_id = f"dispatch_{event_name}"
        graph.add_conditional_edges(
            dispatcher_id,
            lambda state, ls=listeners: [l.task_id for l in ls],
            {l.task_id: l.task_id for l in listeners}
        )

    # Terminal tasks (no emits_event and no listeners waiting)
    terminal_tasks = [
        t for t in composition.tasks
        if not getattr(t, 'emits_event', None) or
           getattr(t, 'emits_event', None) not in event_listeners
    ]

    for task in terminal_tasks:
        if getattr(task, 'listens_to', None):  # Is a listener
            graph.add_edge(task.task_id, END)

    return graph.compile()

def create_event_node(task: TaskDefinition) -> Callable:
    """Create a node that can emit events."""

    async def event_node(state: CompositionState) -> CompositionState:
        result = await execute_task(task, state)
        state["workflow_outputs"][task.output_key] = result

        # Track emitted event
        if hasattr(task, 'emits_event'):
            if "emitted_events" not in state:
                state["emitted_events"] = []
            state["emitted_events"].append({
                "event": task.emits_event,
                "source": task.task_id,
                "timestamp": datetime.utcnow().isoformat()
            })

        return state

    return event_node
```

---

# Part 3: Database Schema

## 3.1 Entity Relationship Diagram

```
┌────────────────────────┐       ┌────────────────────────┐
│  workflow_compositions │       │   composition_tasks    │
├────────────────────────┤       ├────────────────────────┤
│  id (PK)               │◄──┐   │  id (PK)               │
│  composition_code      │   │   │  composition_id (FK)   │──┘
│  name                  │   │   │  task_id               │
│  description           │   │   │  name                  │
│  pattern               │   │   │  description           │
│  category              │   │   │  agent_type            │
│  status                │   │   │  runner_code (FK)      │──┐
│  version               │   │   │  template_id           │  │
│  estimated_duration    │   │   │  input_mapping         │  │
│  tags                  │   │   │  output_key            │  │
│  monitoring_config     │   │   │  condition             │  │
│  tenant_id (FK)        │   │   │  requires_approval     │  │
│  created_by            │   │   │  approval_prompt       │  │
│  created_at            │   │   │  timeout_seconds       │  │
│  updated_at            │   │   │  sequence_order        │  │
└────────────────────────┘   │   │  metadata              │  │
                             │   └────────────────────────┘  │
                             │                               │
┌────────────────────────┐   │   ┌────────────────────────┐  │
│   task_dependencies    │   │   │   runner_templates     │  │
├────────────────────────┤   │   ├────────────────────────┤  │
│  id (PK)               │   │   │  id (PK)               │◄─┘
│  task_id (FK)          │───┘   │  run_code              │
│  depends_on_task_id    │       │  template_name         │
│  dependency_type       │       │  ...                   │
└────────────────────────┘       └────────────────────────┘
```

## 3.2 Migration SQL

```sql
-- ============================================================
-- TASK COMPOSITION DATABASE SCHEMA
-- Version: 1.0
-- Date: December 2025
-- ============================================================

-- ============================================================
-- PART 1: WORKFLOW COMPOSITIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS workflow_compositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    composition_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Classification
    pattern VARCHAR(50) NOT NULL CHECK (pattern IN (
        'sequential_pipeline',
        'fan_out_fan_in',
        'continuous_monitoring',
        'conditional_branching',
        'hybrid'
    )),
    category VARCHAR(100),  -- e.g., 'brand_strategy', 'market_access'

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'deprecated', 'archived'
    )),
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',

    -- Estimation
    estimated_duration_minutes INT,
    complexity VARCHAR(20) DEFAULT 'medium' CHECK (complexity IN (
        'simple', 'medium', 'complex', 'enterprise'
    )),

    -- Configuration
    monitoring_config JSONB,  -- For continuous_monitoring pattern
    default_hitl_enabled BOOLEAN DEFAULT FALSE,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Multi-tenancy
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT FALSE,  -- System templates vs user-created

    -- Audit
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workflow_compositions_pattern ON workflow_compositions(pattern);
CREATE INDEX idx_workflow_compositions_status ON workflow_compositions(status);
CREATE INDEX idx_workflow_compositions_tenant ON workflow_compositions(tenant_id);
CREATE INDEX idx_workflow_compositions_category ON workflow_compositions(category);

-- ============================================================
-- PART 2: COMPOSITION TASKS
-- ============================================================

CREATE TABLE IF NOT EXISTS composition_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent composition
    composition_id UUID NOT NULL REFERENCES workflow_compositions(id) ON DELETE CASCADE,

    -- Task identity (within composition)
    task_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Execution configuration
    agent_type VARCHAR(100) NOT NULL,  -- Persona ID or 'panel_agent'
    runner_code VARCHAR(100) NOT NULL,  -- References runner_templates
    template_id UUID,  -- Optional custom template override

    -- I/O mapping
    input_mapping JSONB NOT NULL DEFAULT '{}',
    output_key VARCHAR(100) NOT NULL,

    -- Flow control
    condition VARCHAR(500),  -- JSONPath condition
    is_setup BOOLEAN DEFAULT FALSE,
    is_loop BOOLEAN DEFAULT FALSE,
    is_decision_point BOOLEAN DEFAULT FALSE,
    branches JSONB,  -- For decision points: {"branch_name": "condition"}

    -- HITL configuration
    requires_approval BOOLEAN DEFAULT FALSE,
    approval_prompt TEXT,
    approval_timeout_minutes INT DEFAULT 60,
    on_rejection VARCHAR(50) DEFAULT 'pause' CHECK (on_rejection IN (
        'pause', 'retry', 'skip', 'fail'
    )),

    -- Execution constraints
    timeout_seconds INT DEFAULT 300,
    retry_count INT DEFAULT 2,
    retry_delay_seconds INT DEFAULT 5,

    -- Ordering
    sequence_order INT NOT NULL DEFAULT 0,

    -- Estimation
    estimated_duration_minutes INT DEFAULT 15,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(composition_id, task_id)
);

-- Indexes
CREATE INDEX idx_composition_tasks_composition ON composition_tasks(composition_id);
CREATE INDEX idx_composition_tasks_runner ON composition_tasks(runner_code);
CREATE INDEX idx_composition_tasks_order ON composition_tasks(composition_id, sequence_order);

-- ============================================================
-- PART 3: TASK DEPENDENCIES (DAG EDGES)
-- ============================================================

CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The task that has the dependency
    task_id UUID NOT NULL REFERENCES composition_tasks(id) ON DELETE CASCADE,

    -- The task that must complete first
    depends_on_task_id UUID NOT NULL REFERENCES composition_tasks(id) ON DELETE CASCADE,

    -- Dependency type
    dependency_type VARCHAR(50) DEFAULT 'required' CHECK (dependency_type IN (
        'required',      -- Must complete successfully
        'optional',      -- Can proceed if failed
        'conditional'    -- Based on condition
    )),

    -- For conditional dependencies
    condition VARCHAR(500),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(task_id, depends_on_task_id),
    CHECK(task_id != depends_on_task_id)  -- No self-dependencies
);

-- Indexes
CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- ============================================================
-- PART 4: COMPOSITION EXECUTIONS (RUNTIME)
-- ============================================================

CREATE TABLE IF NOT EXISTS composition_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference
    composition_id UUID NOT NULL REFERENCES workflow_compositions(id),

    -- Execution identity
    execution_code VARCHAR(100) NOT NULL UNIQUE,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'running',
        'paused',
        'waiting_approval',
        'completed',
        'failed',
        'cancelled'
    )),

    -- Progress
    total_tasks INT NOT NULL,
    completed_tasks INT DEFAULT 0,
    current_task_id VARCHAR(100),
    progress_percentage DECIMAL(5,2) DEFAULT 0,

    -- State
    workflow_state JSONB DEFAULT '{}',

    -- Input/Output
    input_context JSONB,
    final_output JSONB,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_completion_at TIMESTAMPTZ,

    -- Error handling
    error_message TEXT,
    error_details JSONB,

    -- Multi-tenancy
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES auth.users(id),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_composition_executions_composition ON composition_executions(composition_id);
CREATE INDEX idx_composition_executions_status ON composition_executions(status);
CREATE INDEX idx_composition_executions_user ON composition_executions(user_id);
CREATE INDEX idx_composition_executions_tenant ON composition_executions(tenant_id);

-- ============================================================
-- PART 5: TASK EXECUTIONS (RUNTIME)
-- ============================================================

CREATE TABLE IF NOT EXISTS task_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent execution
    execution_id UUID NOT NULL REFERENCES composition_executions(id) ON DELETE CASCADE,

    -- Task reference
    task_id VARCHAR(100) NOT NULL,
    task_name VARCHAR(255),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'running',
        'waiting_approval',
        'approved',
        'rejected',
        'completed',
        'failed',
        'skipped'
    )),

    -- Runner execution
    runner_code VARCHAR(100),
    runner_execution_id UUID,  -- Reference to runner's internal execution ID

    -- I/O
    input_data JSONB,
    output_data JSONB,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INT,

    -- HITL
    approval_requested_at TIMESTAMPTZ,
    approval_resolved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    approval_notes TEXT,

    -- Retry tracking
    attempt_number INT DEFAULT 1,
    previous_attempt_id UUID REFERENCES task_executions(id),

    -- Error handling
    error_message TEXT,
    error_details JSONB,

    -- Quality metrics
    confidence_score DECIMAL(4,3),
    quality_metrics JSONB,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_task_executions_execution ON task_executions(execution_id);
CREATE INDEX idx_task_executions_status ON task_executions(status);
CREATE INDEX idx_task_executions_task_id ON task_executions(task_id);

-- ============================================================
-- PART 6: PRE-COMPOSED WORKFLOWS (SEED DATA REFERENCE)
-- ============================================================

CREATE TABLE IF NOT EXISTS precomposed_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference to composition
    composition_id UUID NOT NULL REFERENCES workflow_compositions(id),

    -- Preset identity
    preset_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Configuration
    runner_count INT NOT NULL,
    estimated_duration_minutes INT NOT NULL,
    complexity VARCHAR(20),

    -- Subset specification
    included_tasks TEXT[] NOT NULL,  -- Array of task_ids to include
    excluded_tasks TEXT[] DEFAULT '{}',

    -- Ordering for UI
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Status
    status VARCHAR(50) DEFAULT 'active',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 7: HELPER FUNCTIONS
-- ============================================================

-- Get task dependencies as adjacency list
CREATE OR REPLACE FUNCTION get_task_dag(p_composition_id UUID)
RETURNS TABLE (
    task_id VARCHAR(100),
    depends_on VARCHAR(100)[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ct.task_id,
        COALESCE(
            ARRAY_AGG(dep_ct.task_id) FILTER (WHERE dep_ct.task_id IS NOT NULL),
            '{}'::VARCHAR[]
        ) as depends_on
    FROM composition_tasks ct
    LEFT JOIN task_dependencies td ON td.task_id = ct.id
    LEFT JOIN composition_tasks dep_ct ON dep_ct.id = td.depends_on_task_id
    WHERE ct.composition_id = p_composition_id
    GROUP BY ct.task_id
    ORDER BY ct.sequence_order;
END;
$$ LANGUAGE plpgsql;

-- Get execution progress
CREATE OR REPLACE FUNCTION get_execution_progress(p_execution_id UUID)
RETURNS TABLE (
    total_tasks INT,
    completed_tasks INT,
    failed_tasks INT,
    pending_tasks INT,
    current_task VARCHAR(100),
    progress_percentage DECIMAL(5,2),
    estimated_remaining_minutes INT
) AS $$
DECLARE
    v_total INT;
    v_completed INT;
    v_failed INT;
    v_pending INT;
    v_current VARCHAR(100);
    v_avg_duration INT;
BEGIN
    SELECT COUNT(*) INTO v_total FROM task_executions WHERE execution_id = p_execution_id;
    SELECT COUNT(*) INTO v_completed FROM task_executions WHERE execution_id = p_execution_id AND status = 'completed';
    SELECT COUNT(*) INTO v_failed FROM task_executions WHERE execution_id = p_execution_id AND status = 'failed';
    SELECT COUNT(*) INTO v_pending FROM task_executions WHERE execution_id = p_execution_id AND status IN ('pending', 'running');
    SELECT task_id INTO v_current FROM task_executions WHERE execution_id = p_execution_id AND status = 'running' LIMIT 1;

    -- Calculate average duration from completed tasks
    SELECT COALESCE(AVG(duration_ms) / 60000, 15) INTO v_avg_duration
    FROM task_executions
    WHERE execution_id = p_execution_id AND status = 'completed';

    RETURN QUERY SELECT
        v_total,
        v_completed,
        v_failed,
        v_pending,
        v_current,
        CASE WHEN v_total > 0 THEN (v_completed::DECIMAL / v_total * 100) ELSE 0 END,
        (v_pending * v_avg_duration)::INT;
END;
$$ LANGUAGE plpgsql;

-- Validate composition DAG (no cycles)
CREATE OR REPLACE FUNCTION validate_composition_dag(p_composition_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_cycle BOOLEAN := FALSE;
BEGIN
    -- Using recursive CTE to detect cycles
    WITH RECURSIVE path AS (
        SELECT
            ct.id as task_uuid,
            ct.task_id,
            ARRAY[ct.task_id] as path,
            FALSE as has_cycle
        FROM composition_tasks ct
        WHERE ct.composition_id = p_composition_id

        UNION ALL

        SELECT
            dep_ct.id,
            dep_ct.task_id,
            p.path || dep_ct.task_id,
            dep_ct.task_id = ANY(p.path)
        FROM path p
        JOIN task_dependencies td ON td.task_id = p.task_uuid
        JOIN composition_tasks dep_ct ON dep_ct.id = td.depends_on_task_id
        WHERE NOT p.has_cycle
    )
    SELECT EXISTS(SELECT 1 FROM path WHERE has_cycle) INTO v_has_cycle;

    RETURN NOT v_has_cycle;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PART 8: TRIGGERS
-- ============================================================

-- Auto-update progress on task completion
CREATE OR REPLACE FUNCTION update_execution_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE composition_executions
    SET
        completed_tasks = (
            SELECT COUNT(*)
            FROM task_executions
            WHERE execution_id = NEW.execution_id AND status = 'completed'
        ),
        current_task_id = (
            SELECT task_id
            FROM task_executions
            WHERE execution_id = NEW.execution_id AND status = 'running'
            LIMIT 1
        ),
        progress_percentage = (
            SELECT (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*) * 100)
            FROM task_executions
            WHERE execution_id = NEW.execution_id
        ),
        status = CASE
            WHEN NEW.status = 'failed' THEN 'failed'
            WHEN NEW.status = 'waiting_approval' THEN 'waiting_approval'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = NEW.execution_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_execution_progress
    AFTER INSERT OR UPDATE OF status ON task_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_execution_progress();

-- Validate DAG on task dependency insert
CREATE OR REPLACE FUNCTION validate_dependency_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_composition_id UUID;
BEGIN
    SELECT composition_id INTO v_composition_id
    FROM composition_tasks
    WHERE id = NEW.task_id;

    IF NOT validate_composition_dag(v_composition_id) THEN
        RAISE EXCEPTION 'Dependency would create a cycle in the task DAG';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_dependency
    AFTER INSERT ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION validate_dependency_insert();

-- ============================================================
-- PART 9: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE workflow_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE composition_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE composition_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE precomposed_workflows ENABLE ROW LEVEL SECURITY;

-- Compositions: Read system + own tenant
CREATE POLICY compositions_select ON workflow_compositions
    FOR SELECT
    USING (is_system = TRUE OR tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Compositions: Modify only own tenant
CREATE POLICY compositions_modify ON workflow_compositions
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Tasks: Follow composition access
CREATE POLICY tasks_access ON composition_tasks
    FOR ALL
    USING (
        composition_id IN (
            SELECT id FROM workflow_compositions
            WHERE is_system = TRUE OR tenant_id = current_setting('app.current_tenant_id')::UUID
        )
    );

-- Executions: Own tenant only
CREATE POLICY executions_access ON composition_executions
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Task executions: Follow execution access
CREATE POLICY task_executions_access ON task_executions
    FOR ALL
    USING (
        execution_id IN (
            SELECT id FROM composition_executions
            WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
        )
    );
```

---

# Part 4: LangGraph Integration

## 4.1 Composition State

```python
from typing import TypedDict, Any, Optional
from langgraph.graph import StateGraph

class CompositionState(TypedDict):
    """State schema for workflow compositions."""

    # Execution tracking
    execution_id: str
    composition_id: str
    current_task_id: Optional[str]
    completed_tasks: list[str]
    failed_tasks: list[str]

    # I/O
    input_context: dict[str, Any]
    workflow_outputs: dict[str, Any]  # task_id -> output

    # HITL
    pending_approvals: list[str]
    approval_results: dict[str, dict]  # task_id -> {approved, notes, approved_by}

    # Metadata
    messages: list[dict]  # For LangGraph message passing
    errors: list[dict]
```

## 4.2 Task Node Factory

```python
from typing import Callable
from jsonpath_ng import parse

class TaskNodeFactory:
    """Factory for creating LangGraph nodes from TaskDefinitions."""

    def __init__(self, runner_registry: RunnerRegistry, template_loader: TemplateLoader):
        self.runner_registry = runner_registry
        self.template_loader = template_loader

    def create_task_node(self, task: TaskDefinition) -> Callable:
        """Create a LangGraph node function for a task."""

        async def task_node(state: CompositionState) -> CompositionState:
            # Check condition
            if task.condition:
                if not self._evaluate_condition(state, task.condition):
                    state["completed_tasks"].append(task.task_id)
                    state["workflow_outputs"][task.output_key] = None
                    return state

            # Map inputs
            inputs = self._map_inputs(state, task.input_mapping)

            # Load runner and template
            runner = self.runner_registry.get_runner(task.runner)
            template = await self.template_loader.load_template(
                task.runner,
                template_id=task.template_id
            )

            # Execute runner
            try:
                result = await runner.execute(
                    inputs=inputs,
                    template=template,
                    agent_type=task.agent_type
                )

                # Store output
                state["workflow_outputs"][task.output_key] = result
                state["completed_tasks"].append(task.task_id)

            except Exception as e:
                state["failed_tasks"].append(task.task_id)
                state["errors"].append({
                    "task_id": task.task_id,
                    "error": str(e)
                })

            return state

        return task_node

    def _map_inputs(self, state: CompositionState, mapping: dict) -> dict:
        """Map workflow state to runner inputs using JSONPath."""
        result = {}

        for key, path_or_value in mapping.items():
            if isinstance(path_or_value, str) and path_or_value.startswith("$"):
                # JSONPath expression
                jsonpath_expr = parse(path_or_value)
                matches = jsonpath_expr.find({
                    **state["input_context"],
                    **state["workflow_outputs"]
                })
                result[key] = matches[0].value if matches else None
            elif isinstance(path_or_value, dict) and "_literal" in path_or_value:
                # Literal value
                result[key] = path_or_value["_literal"]
            elif isinstance(path_or_value, dict) and "_merge" in path_or_value:
                # Merge multiple sources
                merged = {}
                for source_path in path_or_value["_merge"]:
                    jsonpath_expr = parse(source_path)
                    matches = jsonpath_expr.find({
                        **state["input_context"],
                        **state["workflow_outputs"]
                    })
                    if matches:
                        merged.update(matches[0].value)
                result[key] = merged
            else:
                result[key] = path_or_value

        return result

    def _evaluate_condition(self, state: CompositionState, condition: str) -> bool:
        """Evaluate a JSONPath condition against state."""
        # Parse condition like "$.competitive_result.score > 0.5"
        # This is simplified - real implementation would use proper expression parsing
        jsonpath_expr = parse(condition.split()[0])
        matches = jsonpath_expr.find({
            **state["input_context"],
            **state["workflow_outputs"]
        })

        if not matches:
            return False

        # Evaluate comparison
        value = matches[0].value
        parts = condition.split()
        if len(parts) == 3:
            op, threshold = parts[1], parts[2]
            threshold = float(threshold) if '.' in threshold else int(threshold)
            if op == '>': return value > threshold
            if op == '<': return value < threshold
            if op == '>=': return value >= threshold
            if op == '<=': return value <= threshold
            if op == '==': return value == threshold

        return bool(value)
```

## 4.3 HITL Node Factory

```python
from langgraph.prebuilt import interrupt

class HITLNodeFactory:
    """Factory for creating Human-in-the-Loop checkpoint nodes."""

    def create_hitl_node(self, task: TaskDefinition) -> Callable:
        """Create a HITL checkpoint node."""

        async def hitl_node(state: CompositionState) -> CompositionState:
            # Get the output that needs approval
            output_to_review = state["workflow_outputs"].get(task.output_key)

            # Create approval request
            approval_request = {
                "task_id": task.task_id,
                "task_name": task.name,
                "prompt": task.approval_prompt,
                "output_preview": self._create_preview(output_to_review),
                "timeout_minutes": task.approval_timeout_minutes
            }

            # Use LangGraph interrupt for human approval
            approval_result = interrupt(approval_request)

            if approval_result["approved"]:
                state["approval_results"][task.task_id] = {
                    "approved": True,
                    "notes": approval_result.get("notes"),
                    "approved_by": approval_result.get("approved_by")
                }
            else:
                state["approval_results"][task.task_id] = {
                    "approved": False,
                    "reason": approval_result.get("reason")
                }

                # Handle rejection
                if task.on_rejection == "fail":
                    state["failed_tasks"].append(task.task_id)
                elif task.on_rejection == "skip":
                    state["completed_tasks"].append(task.task_id)
                    state["workflow_outputs"][task.output_key] = None
                # "pause" and "retry" are handled by the orchestrator

            return state

        return hitl_node

    def _create_preview(self, output: Any, max_length: int = 500) -> str:
        """Create a preview of the output for approval display."""
        if output is None:
            return "No output generated"

        preview = str(output)
        if len(preview) > max_length:
            preview = preview[:max_length] + "..."

        return preview
```

## 4.4 Composition Builder

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

class CompositionBuilder:
    """Builds LangGraph workflows from WorkflowComposition definitions."""

    def __init__(
        self,
        task_factory: TaskNodeFactory,
        hitl_factory: HITLNodeFactory
    ):
        self.task_factory = task_factory
        self.hitl_factory = hitl_factory

    def build(self, composition: WorkflowComposition) -> StateGraph:
        """Build a LangGraph from a composition definition."""

        pattern = composition.pattern

        if pattern == "sequential_pipeline":
            return self._build_sequential(composition)
        elif pattern == "fan_out_fan_in":
            return self._build_parallel(composition)
        elif pattern == "continuous_monitoring":
            return self._build_monitoring(composition)
        elif pattern == "conditional_branching":
            return self._build_conditional(composition)
        else:
            raise ValueError(f"Unknown pattern: {pattern}")

    def _build_sequential(self, composition: WorkflowComposition) -> StateGraph:
        """Build sequential pipeline graph."""
        graph = StateGraph(CompositionState)

        # Sort tasks by dependency order
        sorted_tasks = self._topological_sort(composition.tasks)

        # Add nodes
        for task in sorted_tasks:
            graph.add_node(task.task_id, self.task_factory.create_task_node(task))

            if task.requires_approval:
                graph.add_node(
                    f"{task.task_id}_approval",
                    self.hitl_factory.create_hitl_node(task)
                )

        # Add edges
        graph.add_edge(START, sorted_tasks[0].task_id)

        for i, task in enumerate(sorted_tasks[:-1]):
            next_task = sorted_tasks[i + 1]

            if task.requires_approval:
                graph.add_edge(task.task_id, f"{task.task_id}_approval")
                graph.add_edge(f"{task.task_id}_approval", next_task.task_id)
            else:
                graph.add_edge(task.task_id, next_task.task_id)

        # Handle last task
        last_task = sorted_tasks[-1]
        if last_task.requires_approval:
            graph.add_edge(last_task.task_id, f"{last_task.task_id}_approval")
            graph.add_edge(f"{last_task.task_id}_approval", END)
        else:
            graph.add_edge(last_task.task_id, END)

        return graph.compile(checkpointer=MemorySaver())

    def _topological_sort(self, tasks: list[TaskDefinition]) -> list[TaskDefinition]:
        """Sort tasks by dependency order using Kahn's algorithm."""
        task_map = {t.task_id: t for t in tasks}
        in_degree = {t.task_id: len(t.depends_on) for t in tasks}
        queue = [t for t in tasks if not t.depends_on]
        result = []

        while queue:
            task = queue.pop(0)
            result.append(task)

            for other in tasks:
                if task.task_id in other.depends_on:
                    in_degree[other.task_id] -= 1
                    if in_degree[other.task_id] == 0:
                        queue.append(other)

        if len(result) != len(tasks):
            raise ValueError("Cycle detected in task dependencies")

        return result
```

---

# Part 5: API Design

## 5.1 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/compositions` | Create new composition |
| `GET` | `/api/v1/compositions` | List compositions |
| `GET` | `/api/v1/compositions/{id}` | Get composition details |
| `PUT` | `/api/v1/compositions/{id}` | Update composition |
| `DELETE` | `/api/v1/compositions/{id}` | Delete composition |
| `POST` | `/api/v1/compositions/{id}/execute` | Start execution |
| `GET` | `/api/v1/executions/{id}` | Get execution status |
| `GET` | `/api/v1/executions/{id}/stream` | Stream execution progress |
| `POST` | `/api/v1/executions/{id}/approve/{task_id}` | Approve HITL checkpoint |
| `POST` | `/api/v1/executions/{id}/reject/{task_id}` | Reject HITL checkpoint |
| `POST` | `/api/v1/executions/{id}/cancel` | Cancel execution |

## 5.2 Request/Response Schemas

```python
from pydantic import BaseModel
from typing import Optional

# Create Composition
class CreateCompositionRequest(BaseModel):
    composition_code: str
    name: str
    description: Optional[str]
    pattern: str  # sequential_pipeline, fan_out_fan_in, etc.
    category: Optional[str]
    tasks: list[TaskDefinition]
    monitoring_config: Optional[dict]
    tags: list[str] = []

class CompositionResponse(BaseModel):
    id: str
    composition_code: str
    name: str
    description: Optional[str]
    pattern: str
    status: str
    version: str
    task_count: int
    estimated_duration_minutes: int
    created_at: str

# Execute Composition
class ExecuteCompositionRequest(BaseModel):
    input_context: dict  # Initial workflow state
    selected_tasks: Optional[list[str]]  # Subset of tasks (for precomposed)
    hitl_enabled: bool = True

class ExecutionResponse(BaseModel):
    execution_id: str
    status: str
    total_tasks: int
    completed_tasks: int
    progress_percentage: float
    current_task: Optional[str]
    estimated_completion_at: Optional[str]

# Streaming Progress
class TaskProgressEvent(BaseModel):
    event_type: str  # task_started, task_completed, approval_needed, etc.
    task_id: str
    task_name: str
    status: str
    output_preview: Optional[str]
    timestamp: str

# HITL Approval
class ApprovalRequest(BaseModel):
    approved: bool
    notes: Optional[str]

class ApprovalResponse(BaseModel):
    task_id: str
    approved: bool
    next_task: Optional[str]
```

## 5.3 API Implementation

```python
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
import asyncio

router = APIRouter(prefix="/api/v1", tags=["compositions"])

@router.post("/compositions", response_model=CompositionResponse)
async def create_composition(
    request: CreateCompositionRequest,
    db: Database = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new workflow composition."""

    # Validate DAG
    if not _validate_task_dag(request.tasks):
        raise HTTPException(400, "Task dependencies contain a cycle")

    # Create composition
    composition = await db.workflow_compositions.create(
        composition_code=request.composition_code,
        name=request.name,
        description=request.description,
        pattern=request.pattern,
        category=request.category,
        monitoring_config=request.monitoring_config,
        tags=request.tags,
        tenant_id=current_user.tenant_id,
        created_by=current_user.id
    )

    # Create tasks
    for i, task in enumerate(request.tasks):
        await db.composition_tasks.create(
            composition_id=composition.id,
            task_id=task.task_id,
            name=task.name,
            description=task.description,
            agent_type=task.agent_type,
            runner_code=task.runner,
            input_mapping=task.input_mapping,
            output_key=task.output_key,
            condition=task.condition,
            requires_approval=task.requires_approval,
            approval_prompt=task.approval_prompt,
            timeout_seconds=task.timeout_seconds,
            sequence_order=i
        )

        # Create dependencies
        for dep_task_id in task.depends_on:
            await db.task_dependencies.create(
                task_id=task.task_id,
                depends_on_task_id=dep_task_id
            )

    return CompositionResponse(
        id=str(composition.id),
        composition_code=composition.composition_code,
        name=composition.name,
        description=composition.description,
        pattern=composition.pattern,
        status=composition.status,
        version=composition.version,
        task_count=len(request.tasks),
        estimated_duration_minutes=sum(t.estimated_duration_minutes for t in request.tasks),
        created_at=composition.created_at.isoformat()
    )

@router.post("/compositions/{composition_id}/execute", response_model=ExecutionResponse)
async def execute_composition(
    composition_id: str,
    request: ExecuteCompositionRequest,
    db: Database = Depends(get_db),
    current_user: User = Depends(get_current_user),
    composition_builder: CompositionBuilder = Depends(get_composition_builder)
):
    """Start executing a workflow composition."""

    # Load composition
    composition = await db.workflow_compositions.get(composition_id)
    if not composition:
        raise HTTPException(404, "Composition not found")

    tasks = await db.composition_tasks.list(composition_id=composition_id)

    # Filter tasks if subset specified
    if request.selected_tasks:
        tasks = [t for t in tasks if t.task_id in request.selected_tasks]

    # Create execution record
    execution = await db.composition_executions.create(
        composition_id=composition_id,
        execution_code=f"exec_{uuid.uuid4().hex[:8]}",
        total_tasks=len(tasks),
        input_context=request.input_context,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id
    )

    # Create task execution records
    for task in tasks:
        await db.task_executions.create(
            execution_id=execution.id,
            task_id=task.task_id,
            task_name=task.name,
            runner_code=task.runner_code
        )

    # Build and start graph
    workflow = composition_builder.build(composition)

    # Run in background
    asyncio.create_task(
        _run_workflow(workflow, execution.id, request.input_context)
    )

    return ExecutionResponse(
        execution_id=str(execution.id),
        status="running",
        total_tasks=len(tasks),
        completed_tasks=0,
        progress_percentage=0,
        current_task=tasks[0].task_id if tasks else None,
        estimated_completion_at=None
    )

@router.get("/executions/{execution_id}/stream")
async def stream_execution_progress(
    execution_id: str,
    db: Database = Depends(get_db)
):
    """Stream execution progress via Server-Sent Events."""

    async def event_generator():
        while True:
            execution = await db.composition_executions.get(execution_id)

            if execution.status in ["completed", "failed", "cancelled"]:
                yield f"data: {json.dumps({'event': 'complete', 'status': execution.status})}\n\n"
                break

            progress = await db.get_execution_progress(execution_id)

            yield f"data: {json.dumps({
                'event': 'progress',
                'completed_tasks': progress.completed_tasks,
                'total_tasks': progress.total_tasks,
                'progress_percentage': progress.progress_percentage,
                'current_task': progress.current_task
            })}\n\n"

            await asyncio.sleep(2)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

@router.post("/executions/{execution_id}/approve/{task_id}")
async def approve_task(
    execution_id: str,
    task_id: str,
    request: ApprovalRequest,
    db: Database = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a HITL checkpoint."""

    task_execution = await db.task_executions.get_by_task_id(execution_id, task_id)

    if task_execution.status != "waiting_approval":
        raise HTTPException(400, "Task is not waiting for approval")

    await db.task_executions.update(
        task_execution.id,
        status="approved" if request.approved else "rejected",
        approved_by=current_user.id,
        approval_notes=request.notes,
        approval_resolved_at=datetime.utcnow()
    )

    # Resume workflow with approval result
    await _resume_workflow_with_approval(execution_id, task_id, request.approved, request.notes)

    return {"success": True, "task_id": task_id, "approved": request.approved}
```

---

# Part 6: Pre-Composed Workflows

## 6.1 Workflow Catalog

| Workflow | Runners | Duration | Pattern | Use Case |
|----------|---------|----------|---------|----------|
| Quick Positioning | 3 | 45 min | Sequential | Rapid positioning assessment |
| Payer Strategy | 7 | 60 min | Fan-out/Fan-in | Market access planning |
| Full Brand Plan | 10 | 120 min | Fan-out/Fan-in | Comprehensive 10P analysis |
| Complete Go-to-Market | 15 | 180 min | Hybrid | Full GTM strategy |
| KOL Ecosystem | 7 | 60 min | Sequential | KOL mapping and engagement |
| Evidence Planning | 7 | 60 min | Sequential | Clinical evidence strategy |
| Competitive Intelligence | 5 | 45 min | Sequential | Market landscape analysis |
| Digital Health Assessment | 8 | 75 min | Conditional | Digital opportunity evaluation |
| Disruption Monitoring | 4 | Ongoing | Monitoring | Early warning system |

## 6.2 Seed Data

```sql
-- Pre-composed workflow seeds
INSERT INTO precomposed_workflows (preset_code, name, description, composition_id, runner_count, estimated_duration_minutes, complexity, included_tasks, display_order, is_featured)
VALUES
-- Quick Positioning (3 runners, 45 min)
('quick_positioning', 'Quick Positioning', 'Rapid positioning assessment with competitive analysis, whitespace identification, and concept generation',
 (SELECT id FROM workflow_compositions WHERE composition_code = 'positioning_strategy_001'),
 3, 45, 'simple',
 ARRAY['competitive_analysis', 'whitespace_identification', 'concept_generation'],
 1, TRUE),

-- Payer Strategy (7 runners, 60 min)
('payer_strategy', 'Payer Strategy', 'Comprehensive market access and payer engagement strategy',
 (SELECT id FROM workflow_compositions WHERE composition_code = 'market_access_001'),
 7, 60, 'medium',
 ARRAY['market_landscape', 'payer_segmentation', 'value_proposition', 'pricing_analysis', 'contracting_strategy', 'access_barriers', 'action_plan'],
 2, TRUE),

-- Full Brand Plan (10 runners, 120 min)
('full_brand_plan', 'Full Brand Plan (10 Ps)', 'Complete brand planning across all 10 P dimensions',
 (SELECT id FROM workflow_compositions WHERE composition_code = 'brand_plan_10p_001'),
 10, 120, 'complex',
 ARRAY['market_diagnostics', 'product_positioning', 'price_strategy', 'place_channel', 'promotion_planning', 'people_capability', 'packaging_optimization', 'process_optimization', 'physical_evidence', 'plan_validation'],
 3, TRUE),

-- Complete Go-to-Market (15 runners, 180 min)
('complete_gtm', 'Complete Go-to-Market', 'Full go-to-market strategy covering all aspects',
 (SELECT id FROM workflow_compositions WHERE composition_code = 'gtm_strategy_001'),
 15, 180, 'enterprise',
 NULL, -- All tasks
 4, FALSE),

-- KOL Ecosystem (7 runners, 60 min)
('kol_ecosystem', 'KOL Ecosystem Analysis', 'Key Opinion Leader mapping, profiling, and engagement strategy',
 (SELECT id FROM workflow_compositions WHERE composition_code = 'kol_strategy_001'),
 7, 60, 'medium',
 ARRAY['kol_identification', 'influence_mapping', 'profile_development', 'gap_analysis', 'engagement_planning', 'content_strategy', 'measurement_framework'],
 5, TRUE),

-- Evidence Planning (7 runners, 60 min)
('evidence_planning', 'Evidence Planning', 'Clinical evidence generation and communication strategy',
 (SELECT id FROM workflow_compositions WHERE composition_code = 'evidence_strategy_001'),
 7, 60, 'medium',
 ARRAY['evidence_gap_analysis', 'study_prioritization', 'endpoint_selection', 'publication_planning', 'data_dissemination', 'value_communication', 'stakeholder_alignment'],
 6, FALSE);
```

## 6.3 UI Presentation

```typescript
// Frontend workflow selector component
interface PrecomposedWorkflow {
  preset_code: string;
  name: string;
  description: string;
  runner_count: number;
  estimated_duration_minutes: number;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  is_featured: boolean;
}

const WorkflowSelector: React.FC = () => {
  const [workflows, setWorkflows] = useState<PrecomposedWorkflow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="workflow-selector">
      <h2>Select a Workflow</h2>

      {/* Featured workflows */}
      <section className="featured">
        <h3>Featured</h3>
        <div className="workflow-grid">
          {workflows.filter(w => w.is_featured).map(workflow => (
            <WorkflowCard
              key={workflow.preset_code}
              workflow={workflow}
              selected={selected === workflow.preset_code}
              onSelect={() => setSelected(workflow.preset_code)}
            />
          ))}
        </div>
      </section>

      {/* All workflows */}
      <section className="all-workflows">
        <h3>All Workflows</h3>
        <WorkflowTable workflows={workflows} />
      </section>

      {/* Execute button */}
      {selected && (
        <Button onClick={() => executeWorkflow(selected)}>
          Start Workflow
        </Button>
      )}
    </div>
  );
};

const WorkflowCard: React.FC<{
  workflow: PrecomposedWorkflow;
  selected: boolean;
  onSelect: () => void;
}> = ({ workflow, selected, onSelect }) => (
  <div
    className={`workflow-card ${selected ? 'selected' : ''}`}
    onClick={onSelect}
  >
    <div className="header">
      <h4>{workflow.name}</h4>
      <ComplexityBadge complexity={workflow.complexity} />
    </div>
    <p>{workflow.description}</p>
    <div className="metrics">
      <span>{workflow.runner_count} runners</span>
      <span>{workflow.estimated_duration_minutes} min</span>
    </div>
  </div>
);
```

---

# Part 7: Implementation Checklist

## 7.1 Database Layer

- [ ] Create `workflow_compositions` table
- [ ] Create `composition_tasks` table
- [ ] Create `task_dependencies` table
- [ ] Create `composition_executions` table
- [ ] Create `task_executions` table
- [ ] Create `precomposed_workflows` table
- [ ] Implement helper functions (get_task_dag, get_execution_progress)
- [ ] Add DAG validation trigger
- [ ] Add progress update trigger
- [ ] Configure RLS policies

## 7.2 Pydantic Layer

- [ ] Create `TaskDefinition` model
- [ ] Create `WorkflowComposition` model
- [ ] Create `MonitoringConfig` model
- [ ] Create API request/response schemas
- [ ] Add input mapping validation

## 7.3 LangGraph Layer

- [ ] Implement `CompositionState` schema
- [ ] Implement `TaskNodeFactory`
- [ ] Implement `HITLNodeFactory`
- [ ] Implement `CompositionBuilder`
- [ ] Build sequential pipeline builder
- [ ] Build fan-out/fan-in builder
- [ ] Build continuous monitoring builder
- [ ] Build conditional branching builder
- [ ] Add checkpointing support

## 7.4 API Layer

- [ ] Implement composition CRUD endpoints
- [ ] Implement execution endpoints
- [ ] Implement streaming progress endpoint
- [ ] Implement HITL approval endpoints
- [ ] Add authentication/authorization
- [ ] Add rate limiting

## 7.5 Frontend Layer

- [ ] Create WorkflowSelector component
- [ ] Create WorkflowCard component
- [ ] Create ExecutionProgress component
- [ ] Create HITLApprovalModal component
- [ ] Implement SSE streaming client
- [ ] Add workflow visualization (DAG display)

## 7.6 Testing

- [ ] Unit tests for TaskDefinition validation
- [ ] Unit tests for DAG validation
- [ ] Integration tests for composition CRUD
- [ ] Integration tests for execution flow
- [ ] E2E tests for all patterns
- [ ] Load tests for parallel execution

---

# Summary

Task Composition Architecture enables:

1. **Declarative Workflow Definition** - Define workflows as TaskDefinition arrays
2. **Four Orchestration Patterns** - Sequential, Parallel, Monitoring, Conditional
3. **Database-Backed Execution** - Full audit trail and recovery
4. **LangGraph Integration** - Automatic graph building from compositions
5. **HITL Checkpoints** - Human approval at critical points
6. **Pre-Composed Templates** - Ready-to-use workflow subsets

---

# Appendix A: Pattern Selection Guide

| Scenario | Pattern | Reasoning |
|----------|---------|-----------|
| Document generation pipeline | Sequential | Linear dependencies |
| Multi-dimensional analysis | Fan-out/Fan-in | Independent parallel tasks |
| Ongoing signal tracking | Continuous Monitoring | Periodic polling |
| Decision-dependent paths | Conditional Branching | Dynamic routing |
| Complex enterprise workflow | Hybrid | Combination of patterns |

---

# Appendix B: References

| Topic | Source |
|-------|--------|
| LangGraph | LangChain Documentation (2024-2025) |
| JSONPath | RFC 9535 - JSONPath Standard |
| DAG Scheduling | Kahn's Algorithm (1962) |
| HITL Patterns | LangGraph Interrupt API |
| Pydantic | Pydantic v2 Documentation |

---

**Version History:**
- v1.1 (December 2025): Added 4 additional orchestration patterns (Iterative Refinement, Generator-Critic, Saga, Event-Driven)
- v1.0 (December 2025): Initial task composition architecture

---

*End of Document*
