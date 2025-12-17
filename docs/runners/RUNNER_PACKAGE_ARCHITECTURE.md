# VITAL Platform: World-Class Runner Package Architecture
## Comprehensive Methodology for 88 Cognitive Runners

**Version:** 1.0
**Date:** December 2025
**Status:** Gold Standard Implementation Guide
**Classification:** INTERNAL

---

# Executive Summary

This document defines the **world-class package architecture** for VITAL's 88 cognitive task runners. Based on comprehensive research of 2024-2025 AI agent frameworks, prompt engineering patterns, and enterprise architectures, this guide provides a scalable, consistent methodology for building production-ready runners.

**Key Standards Adopted:**
- **LangGraph** - Production standard for AI agent workflows
- **MCP (Model Context Protocol)** - Universal integration standard
- **Pydantic** - Structured I/O validation
- **RAGAS + DeepEval** - Evaluation frameworks
- **Semantic Versioning** - Prompt management

---

# Part 1: Runner Package Structure

## 1.1 Standard Package Layout

Every runner package follows this **13-component structure**:

```
runners/
└── {category}/                      # e.g., UNDERSTAND, EVALUATE, DECIDE
    └── {runner_code}/               # e.g., scan_001, critique_001
        │
        ├── runner_manifest.yaml     # Core identity & metadata
        ├── prompt_strategy.yaml     # Prompting pattern configuration
        ├── workflow.py              # LangGraph state machine
        ├── schemas.py               # Pydantic I/O schemas
        ├── tools.yaml               # MCP tool dependencies
        ├── evaluation.yaml          # RAGAS/DeepEval metrics
        ├── hitl_config.yaml         # Human-in-the-loop rules
        ├── model_config.yaml        # LLM selection & parameters
        ├── monitoring.yaml          # Observability & alerting
        ├── governance.yaml          # Compliance & security
        │
        ├── prompts/                 # Versioned prompt templates
        │   ├── v1.0.0.txt
        │   ├── v1.1.0.txt
        │   └── changelog.md
        │
        ├── tests/                   # Test suite
        │   ├── unit/
        │   ├── integration/
        │   └── fixtures/
        │
        └── README.md                # Documentation
```

## 1.2 Component Descriptions

| Component | Purpose | Required |
|-----------|---------|----------|
| `runner_manifest.yaml` | Identity, version, category mapping | Yes |
| `prompt_strategy.yaml` | Prompting pattern & template config | Yes |
| `workflow.py` | LangGraph state machine definition | Yes |
| `schemas.py` | Pydantic I/O schemas | Yes |
| `tools.yaml` | MCP tool dependencies | No |
| `evaluation.yaml` | Quality metrics & thresholds | Yes |
| `hitl_config.yaml` | Human review triggers | Conditional |
| `model_config.yaml` | LLM selection & parameters | Yes |
| `monitoring.yaml` | Observability config | Yes |
| `governance.yaml` | Compliance controls | Conditional |
| `prompts/` | Versioned prompt templates | Yes |
| `tests/` | Unit, integration, fixtures | Yes |
| `README.md` | Documentation | Yes |

---

# Part 2: Cognitive Category to Pattern Mapping

## 2.1 The Five Prompt Patterns

Based on 2024-2025 research, we adopt **five core prompting patterns**:

### Pattern 1: Chain-of-Thought (CoT)

**Definition:** Encourages LLMs to break down complex problems into intermediate reasoning steps.

**Implementation:**
```
"Let's think step-by-step:
1. First, I will...
2. Then, I will...
3. Finally, I will..."
```

**Best for:** Factual analysis, structured evaluation, sequential reasoning

**Research Citation:** Wei et al. (2022). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." NeurIPS. +40% accuracy on reasoning tasks.

### Pattern 2: Tree-of-Thought (ToT)

**Definition:** Extension of CoT allowing models to explore multiple reasoning paths simultaneously, backtrack, and evaluate branches.

**Implementation:**
```
"Consider multiple approaches:
Branch A: [approach]
  - Pros: ...
  - Cons: ...
Branch B: [approach]
  - Pros: ...
  - Cons: ...
Evaluation: Based on criteria X, Y, Z, select Branch [A/B]"
```

**Best for:** Complex decisions, strategic planning, problem solving

**Research Citation:** Yao et al. (2023). "Tree of Thoughts: Deliberate Problem Solving with Large Language Models." NeurIPS. +74% on complex problem solving.

### Pattern 3: ReAct (Reasoning + Acting)

**Definition:** Combines reasoning traces with action steps, allowing models to interact with external tools/environments.

**Implementation:**
```
Loop:
1. Thought: [reason about current situation]
2. Action: [choose action - search, lookup, calculate]
3. Observation: [result of action]
4. Repeat until task complete
```

**Best for:** Investigation, monitoring, execution, discovery

**Research Citation:** Yao et al. (2023). "ReAct: Synergizing Reasoning and Acting in Language Models." ICLR. +55% on knowledge-intensive tasks.

### Pattern 4: Self-Critique (Reflexion)

**Definition:** Generator-Critic loop where output is evaluated and refined iteratively.

**Implementation:**
```
1. Generate: Produce initial output
2. Critique: Evaluate against criteria
3. If unsatisfactory: Refine and repeat
4. Iterate until quality threshold met
```

**Best for:** Refinement, validation, alignment, quality assurance

**Research Citation:** Shinn et al. (2023). "Reflexion: Language Agents with Verbal Reinforcement Learning." NeurIPS.

### Pattern 5: Meta-Prompting

**Definition:** Emphasizes structural and syntactical aspects by prioritizing format and pattern over specific content.

**Implementation:**
```
"Follow this structure:
[SECTION 1: Context Analysis]
- Key entities: ...
- Relationships: ...

[SECTION 2: Synthesis]
- Theme 1: ...
- Theme 2: ...

[SECTION 3: Conclusions]
- Primary finding: ...
- Supporting evidence: ..."
```

**Best for:** Creative generation, synthesis, design

**Research Citation:** 2025 research shows meta-prompting outperforms role-prompting ("You are an expert...") by focusing on structure rather than persona.

## 2.2 Category-to-Pattern Mapping Matrix

| Category | Primary Pattern | Secondary Pattern | Bloom Level | HITL Priority |
|----------|-----------------|-------------------|-------------|---------------|
| **UNDERSTAND** | Chain-of-Thought | - | 2 | Low |
| **EVALUATE** | Chain-of-Thought | Self-Critique | 5 | Medium |
| **DECIDE** | Tree-of-Thought | Self-Critique | 5 | **High** |
| **INVESTIGATE** | ReAct | Chain-of-Thought | 4 | Medium |
| **WATCH** | ReAct | - | 1 | Low |
| **SOLVE** | Tree-of-Thought | ReAct | 4 | Medium |
| **PREPARE** | Chain-of-Thought | - | 3 | Low |
| **CREATE** | Meta-Prompting | Self-Critique | 6 | Medium |
| **REFINE** | Self-Critique | Chain-of-Thought | 5 | Medium |
| **VALIDATE** | Self-Critique | Chain-of-Thought | 5 | **High** |
| **SYNTHESIZE** | Meta-Prompting | Chain-of-Thought | 6 | Medium |
| **PLAN** | Tree-of-Thought | Meta-Prompting | 6 | **High** |
| **PREDICT** | Chain-of-Thought | Tree-of-Thought | 4 | Medium |
| **ENGAGE** | Router Agent | Chain-of-Thought | 3 | Low |
| **ALIGN** | Self-Critique | Tree-of-Thought | 5 | **High** |
| **INFLUENCE** | Router Agent | Tree-of-Thought | 4 | Medium |
| **ADAPT** | ReAct | Chain-of-Thought | 5 | Medium |
| **DISCOVER** | ReAct | Tree-of-Thought | 6 | Low |
| **DESIGN** | Meta-Prompting | Self-Critique | 6 | **High** |
| **GOVERN** | Self-Critique | - | 5 | **Critical** |
| **SECURE** | Self-Critique | - | 5 | **Critical** |
| **EXECUTE** | ReAct | Self-Critique | 3 | **High** |

## 2.3 Bloom's Taxonomy Alignment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BLOOM'S TAXONOMY → RUNNER MAPPING                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Level 6: CREATE (Highest Complexity)                                       │
│  ═══════════════════════════════════                                        │
│  Categories: CREATE, SYNTHESIZE, DESIGN, DISCOVER, PLAN                     │
│  Pattern: Meta-Prompting, Tree-of-Thought                                   │
│  Model: GPT-4, Claude-3-Opus (Tier 3)                                       │
│                                                                              │
│  Level 5: EVALUATE                                                           │
│  ═════════════════                                                           │
│  Categories: EVALUATE, DECIDE, VALIDATE, REFINE, ALIGN, GOVERN, SECURE     │
│  Pattern: Chain-of-Thought, Self-Critique                                   │
│  Model: GPT-4 (Tier 2-3)                                                    │
│                                                                              │
│  Level 4: ANALYZE                                                            │
│  ════════════════                                                            │
│  Categories: INVESTIGATE, SOLVE, PREDICT, INFLUENCE, ADAPT                  │
│  Pattern: Tree-of-Thought, ReAct                                            │
│  Model: GPT-4 (Tier 2)                                                      │
│                                                                              │
│  Level 3: APPLY                                                              │
│  ═════════════                                                               │
│  Categories: PREPARE, ENGAGE, EXECUTE                                        │
│  Pattern: Chain-of-Thought, ReAct                                           │
│  Model: GPT-3.5-Turbo, GPT-4 (Tier 1-2)                                    │
│                                                                              │
│  Level 2: UNDERSTAND                                                         │
│  ══════════════════                                                          │
│  Categories: UNDERSTAND                                                      │
│  Pattern: Chain-of-Thought                                                  │
│  Model: GPT-3.5-Turbo (Tier 1)                                              │
│                                                                              │
│  Level 1: REMEMBER                                                           │
│  ═════════════════                                                           │
│  Categories: WATCH                                                           │
│  Pattern: ReAct (monitoring)                                                │
│  Model: GPT-3.5-Turbo (Tier 1)                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Part 3: LangGraph Workflow Archetypes

## 3.1 The Six Workflow Archetypes

Based on LangGraph 2025 best practices, we define **six workflow archetypes**:

### Archetype 1: Pipeline (Sequential)

**Pattern:** Linear sequential operations with unconditional edges.

**Best for:** UNDERSTAND, PREPARE categories

```python
# workflows/pipeline.py

from langgraph.graph import StateGraph, START, END

class PipelineState(TypedDict):
    input: str
    preprocessed: str
    processed: str
    output: str

def build_pipeline_workflow() -> CompiledGraph:
    workflow = StateGraph(PipelineState)

    # Add nodes
    workflow.add_node("preprocess", preprocess_node)
    workflow.add_node("process", process_node)
    workflow.add_node("postprocess", postprocess_node)

    # Linear edges
    workflow.add_edge(START, "preprocess")
    workflow.add_edge("preprocess", "process")
    workflow.add_edge("process", "postprocess")
    workflow.add_edge("postprocess", END)

    return workflow.compile()
```

**Diagram:**
```
START → preprocess → process → postprocess → END
```

### Archetype 2: Conditional Routing

**Pattern:** Branch based on state using conditional edges.

**Best for:** DECIDE, EVALUATE, PREDICT categories

```python
# workflows/conditional.py

def route_based_on_confidence(state: ConditionalState) -> str:
    """Routing function inspects state and returns next node name."""
    if state["confidence_score"] > 0.8:
        return "finalize"
    elif state["confidence_score"] > 0.5:
        return "refine"
    else:
        return "escalate"

def build_conditional_workflow() -> CompiledGraph:
    workflow = StateGraph(ConditionalState)

    workflow.add_node("analyze", analyze_node)
    workflow.add_node("evaluate", evaluate_node)
    workflow.add_node("refine", refine_node)
    workflow.add_node("escalate", escalate_node)
    workflow.add_node("finalize", finalize_node)

    workflow.add_edge(START, "analyze")
    workflow.add_edge("analyze", "evaluate")

    # Conditional routing
    workflow.add_conditional_edges(
        "evaluate",
        route_based_on_confidence,
        {
            "finalize": "finalize",
            "refine": "refine",
            "escalate": "escalate"
        }
    )

    workflow.add_edge("refine", "evaluate")  # Loop back
    workflow.add_edge("escalate", END)
    workflow.add_edge("finalize", END)

    return workflow.compile()
```

**Diagram:**
```
START → analyze → evaluate ─┬─(confidence > 0.8)─→ finalize → END
                            ├─(confidence > 0.5)─→ refine ──┘ (loop)
                            └─(confidence ≤ 0.5)─→ escalate → END
```

### Archetype 3: Iteration Loop (Refinement)

**Pattern:** Create loops where LLMs refine responses until desired outcome.

**Best for:** REFINE, SOLVE, INVESTIGATE categories

```python
# workflows/iteration.py

class IterationState(TypedDict):
    input: str
    current_output: str
    iteration_count: int
    max_iterations: int
    quality_score: float
    quality_threshold: float

def should_continue(state: IterationState) -> str:
    """Determine if we should continue iterating or finalize."""
    if state["iteration_count"] >= state["max_iterations"]:
        return "finalize"  # Safety limit
    if state["quality_score"] >= state["quality_threshold"]:
        return "finalize"
    return "refine"

def build_iteration_workflow() -> CompiledGraph:
    workflow = StateGraph(IterationState)

    workflow.add_node("generate", generate_node)
    workflow.add_node("evaluate", evaluate_node)
    workflow.add_node("refine", refine_node)
    workflow.add_node("finalize", finalize_node)

    workflow.add_edge(START, "generate")
    workflow.add_edge("generate", "evaluate")

    workflow.add_conditional_edges(
        "evaluate",
        should_continue,
        {
            "refine": "refine",
            "finalize": "finalize"
        }
    )

    workflow.add_edge("refine", "evaluate")  # Loop back
    workflow.add_edge("finalize", END)

    return workflow.compile()
```

**Diagram:**
```
START → generate → evaluate ─┬─(quality met OR max iterations)─→ finalize → END
                             └─(quality not met)─→ refine ──────┘ (loop)
```

**Safety Requirements:**
- Always include `max_iterations` limit (prevent infinite loops)
- Use `iteration_count` in state
- Log intermediate steps for debugging

### Archetype 4: Map-Reduce

**Pattern:** Fan-out to process multiple items, then aggregate results.

**Best for:** SYNTHESIZE, PLAN categories

```python
# workflows/map_reduce.py

from langgraph.types import Send

class MapReduceState(TypedDict):
    items: List[str]
    processed_items: List[dict]
    aggregated_result: str

def fan_out(state: MapReduceState) -> List[Send]:
    """Generate parallel processing tasks."""
    return [
        Send("process_item", {"item": item, "index": i})
        for i, item in enumerate(state["items"])
    ]

def build_map_reduce_workflow() -> CompiledGraph:
    workflow = StateGraph(MapReduceState)

    workflow.add_node("distribute", distribute_node)
    workflow.add_node("process_item", process_item_node)
    workflow.add_node("aggregate", aggregate_node)

    workflow.add_edge(START, "distribute")

    # Fan-out with Send
    workflow.add_conditional_edges(
        "distribute",
        fan_out,
        ["process_item"]
    )

    workflow.add_edge("process_item", "aggregate")
    workflow.add_edge("aggregate", END)

    return workflow.compile()
```

**Diagram:**
```
START → distribute ─┬─→ process_item[0] ─┐
                    ├─→ process_item[1] ─┼─→ aggregate → END
                    └─→ process_item[N] ─┘
```

### Archetype 5: Generator-Critic

**Pattern:** Generate output, critique it, refine if needed.

**Best for:** CREATE, DESIGN categories

```python
# workflows/generator_critic.py

class GeneratorCriticState(TypedDict):
    input: str
    generated_content: str
    critique: dict
    refined_content: str
    iteration_count: int
    accepted: bool

def critique_decision(state: GeneratorCriticState) -> str:
    """Decide based on critique results."""
    if state["accepted"]:
        return "finalize"
    if state["iteration_count"] >= 3:  # Max 3 refinements
        return "finalize"
    return "refine"

def build_generator_critic_workflow() -> CompiledGraph:
    workflow = StateGraph(GeneratorCriticState)

    workflow.add_node("generate", generate_node)
    workflow.add_node("critique", critique_node)
    workflow.add_node("refine", refine_node)
    workflow.add_node("finalize", finalize_node)

    workflow.add_edge(START, "generate")
    workflow.add_edge("generate", "critique")

    workflow.add_conditional_edges(
        "critique",
        critique_decision,
        {
            "refine": "refine",
            "finalize": "finalize"
        }
    )

    workflow.add_edge("refine", "critique")  # Critique the refinement
    workflow.add_edge("finalize", END)

    return workflow.compile()
```

**Diagram:**
```
START → generate → critique ─┬─(accepted)─→ finalize → END
                             └─(rejected)─→ refine ───┘ (loop)
```

### Archetype 6: HITL Gate (Human-in-the-Loop)

**Pattern:** Pause workflow for human approval at critical points.

**Best for:** GOVERN, SECURE, DECIDE, EXECUTE categories

```python
# workflows/hitl_gate.py

from langgraph.checkpoint import MemorySaver
from langgraph.graph import interrupt

class HITLState(TypedDict):
    input: str
    analysis: dict
    human_approved: Optional[bool]
    human_feedback: Optional[str]
    final_output: str

def check_approval(state: HITLState) -> str:
    """Check if human has approved."""
    if state.get("human_approved") is None:
        return "await_approval"
    if state["human_approved"]:
        return "execute"
    return "revise"

def await_approval_node(state: HITLState):
    """Interrupt and wait for human input."""
    interrupt("Awaiting human approval for: " + str(state["analysis"]))
    return state

def build_hitl_workflow() -> CompiledGraph:
    workflow = StateGraph(HITLState)

    workflow.add_node("analyze", analyze_node)
    workflow.add_node("await_approval", await_approval_node)
    workflow.add_node("revise", revise_node)
    workflow.add_node("execute", execute_node)

    workflow.add_edge(START, "analyze")
    workflow.add_edge("analyze", "await_approval")

    workflow.add_conditional_edges(
        "await_approval",
        check_approval,
        {
            "await_approval": "await_approval",
            "execute": "execute",
            "revise": "revise"
        }
    )

    workflow.add_edge("revise", "await_approval")  # Re-request approval
    workflow.add_edge("execute", END)

    # Enable checkpointing for resume capability
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)
```

**Diagram:**
```
START → analyze → await_approval ─┬─(approved)─→ execute → END
                                  ├─(rejected)─→ revise ──┘ (loop)
                                  └─(pending)───┘ (wait)
```

## 3.2 Archetype Selection Guide

| Category | Primary Archetype | Secondary Archetype |
|----------|-------------------|---------------------|
| UNDERSTAND | Pipeline | - |
| EVALUATE | Conditional Routing | - |
| DECIDE | Conditional Routing | HITL Gate |
| INVESTIGATE | Iteration Loop | - |
| WATCH | Pipeline | - |
| SOLVE | Iteration Loop | Conditional Routing |
| PREPARE | Pipeline | - |
| CREATE | Generator-Critic | - |
| REFINE | Iteration Loop | - |
| VALIDATE | Iteration Loop | HITL Gate |
| SYNTHESIZE | Map-Reduce | - |
| PLAN | Map-Reduce | Conditional Routing |
| PREDICT | Conditional Routing | - |
| ENGAGE | Conditional Routing | - |
| ALIGN | Iteration Loop | HITL Gate |
| INFLUENCE | Conditional Routing | - |
| ADAPT | Conditional Routing | - |
| DISCOVER | Iteration Loop | - |
| DESIGN | Generator-Critic | HITL Gate |
| GOVERN | HITL Gate | - |
| SECURE | HITL Gate | - |
| EXECUTE | Conditional Routing | HITL Gate |

---

# Part 4: Pydantic Schema Standards

## 4.1 Base Schema Classes

All runners inherit from these base classes:

```python
# schemas/base.py

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class ConfidenceLevel(str, Enum):
    HIGH = "high"      # > 0.8
    MEDIUM = "medium"  # 0.5 - 0.8
    LOW = "low"        # < 0.5

class RunnerInputBase(BaseModel):
    """Base input schema for all runners."""

    # Context
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context for the runner"
    )

    # Constraints
    max_tokens: Optional[int] = Field(
        default=2000,
        description="Maximum tokens for output"
    )

    # Tracing
    trace_id: Optional[str] = Field(
        default=None,
        description="Distributed tracing ID"
    )

    class Config:
        extra = "allow"  # Allow additional fields

class ReasoningStep(BaseModel):
    """Single step in reasoning trace."""
    step_number: int
    thought: str
    action: Optional[str] = None
    observation: Optional[str] = None

class RunnerOutputBase(BaseModel):
    """Base output schema for all runners."""

    # Identity
    runner_id: str = Field(..., description="Runner identifier")
    runner_version: str = Field(..., description="Runner version")

    # Result
    success: bool = Field(..., description="Whether execution succeeded")

    # Confidence
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score 0-1"
    )
    confidence_level: ConfidenceLevel = Field(
        ...,
        description="Confidence level category"
    )

    # Reasoning
    reasoning_steps: List[ReasoningStep] = Field(
        default_factory=list,
        description="Reasoning trace"
    )

    # Metadata
    execution_time_ms: int = Field(..., description="Execution time in ms")
    token_count: int = Field(..., description="Tokens used")
    cost_usd: float = Field(..., description="Execution cost in USD")

    # Timestamps
    started_at: datetime = Field(..., description="Start timestamp")
    completed_at: datetime = Field(..., description="Completion timestamp")

    # Errors
    error_message: Optional[str] = Field(
        default=None,
        description="Error message if failed"
    )

    class Config:
        extra = "allow"
```

## 4.2 Category-Specific Schemas

### UNDERSTAND Category

```python
# schemas/understand.py

class ComprehensionInput(RunnerInputBase):
    """Input for comprehension runners."""
    document: str = Field(..., description="Document to comprehend")
    focus_areas: Optional[List[str]] = Field(
        default=None,
        description="Specific areas to focus on"
    )
    extract_entities: bool = Field(
        default=True,
        description="Whether to extract entities"
    )

class Entity(BaseModel):
    """Extracted entity."""
    name: str
    type: str
    confidence: float
    context: Optional[str] = None

class Relationship(BaseModel):
    """Relationship between entities."""
    source: str
    target: str
    relationship_type: str
    confidence: float

class ComprehensionResult(BaseModel):
    """Comprehension results."""
    summary: str
    key_entities: List[Entity]
    main_points: List[str]
    relationships: List[Relationship]
    themes: List[str]

class ComprehensionOutput(RunnerOutputBase):
    """Output for comprehension runners."""
    result: ComprehensionResult
```

### EVALUATE Category

```python
# schemas/evaluate.py

class CriterionScore(BaseModel):
    """Score for a single criterion."""
    criterion: str
    score: float  # 0-10
    weight: float  # 0-1
    weighted_score: float
    rationale: str

class EvaluationInput(RunnerInputBase):
    """Input for evaluation runners."""
    artifact: str = Field(..., description="Content to evaluate")
    rubric: Dict[str, float] = Field(
        ...,
        description="Evaluation criteria with weights"
    )
    benchmark: Optional[str] = Field(
        default=None,
        description="Benchmark to compare against"
    )

class EvaluationResult(BaseModel):
    """Evaluation results."""
    overall_score: float  # 0-10
    criterion_scores: List[CriterionScore]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    comparison_notes: Optional[str] = None

class EvaluationOutput(RunnerOutputBase):
    """Output for evaluation runners."""
    result: EvaluationResult
```

### DECIDE Category

```python
# schemas/decide.py

class Option(BaseModel):
    """Decision option."""
    id: str
    name: str
    description: str
    pros: List[str]
    cons: List[str]
    risk_level: str  # low, medium, high
    confidence: float

class Tradeoff(BaseModel):
    """Tradeoff between options."""
    option_a: str
    option_b: str
    tradeoff_dimension: str
    analysis: str

class DecisionInput(RunnerInputBase):
    """Input for decision runners."""
    decision_context: str = Field(..., description="Decision context")
    constraints: List[str] = Field(
        default_factory=list,
        description="Decision constraints"
    )
    criteria: Dict[str, float] = Field(
        ...,
        description="Decision criteria with weights"
    )
    options: Optional[List[str]] = Field(
        default=None,
        description="Pre-defined options to evaluate"
    )

class DecisionResult(BaseModel):
    """Decision results."""
    recommended_option: str
    recommendation_rationale: str
    options: List[Option]
    tradeoffs: List[Tradeoff]
    risk_assessment: str
    implementation_notes: str

class DecisionOutput(RunnerOutputBase):
    """Output for decision runners."""
    result: DecisionResult
    requires_human_approval: bool = Field(
        default=False,
        description="Whether decision needs human approval"
    )
```

## 4.3 Validation Patterns

```python
# schemas/validation.py

from pydantic import validator, root_validator

class ValidatedOutput(RunnerOutputBase):
    """Output with built-in validation."""

    @validator('confidence_score')
    def confidence_in_range(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('confidence_score must be between 0 and 1')
        return v

    @validator('confidence_level', pre=True, always=True)
    def set_confidence_level(cls, v, values):
        score = values.get('confidence_score', 0)
        if score > 0.8:
            return ConfidenceLevel.HIGH
        elif score > 0.5:
            return ConfidenceLevel.MEDIUM
        return ConfidenceLevel.LOW

    @root_validator
    def check_error_on_failure(cls, values):
        if not values.get('success') and not values.get('error_message'):
            raise ValueError('error_message required when success is False')
        return values
```

---

# Part 5: Evaluation & Quality Assurance

## 5.1 Evaluation Frameworks

### RAGAS (RAG Assessment Suite)

**Purpose:** Evaluate faithfulness, relevance, and context quality.

**Metrics:**

| Metric | Description | Threshold |
|--------|-------------|-----------|
| Faithfulness | Output grounded in retrieved context | ≥ 0.8 |
| Answer Relevance | Answer directly addresses query | ≥ 0.75 |
| Context Relevance | Retrieved context is pertinent | ≥ 0.7 |
| Context Precision | Precision of context retrieval | ≥ 0.7 |
| Context Recall | Recall of relevant context | ≥ 0.7 |

**Best for:** UNDERSTAND, INVESTIGATE, SYNTHESIZE categories

### DeepEval

**Purpose:** General-purpose LLM evaluation (like Pytest for LLMs).

**Metrics:**

| Metric | Description | Threshold |
|--------|-------------|-----------|
| Hallucination | Fabricated content detection | ≤ 0.1 |
| Coherence | Logical consistency | ≥ 0.8 |
| Toxicity | Safety screening | ≤ 0.05 |
| Latency | Response time | ≤ 5000ms |
| Cost | Execution cost | ≤ $0.50 |

**Best for:** VALIDATE, GOVERN, SECURE categories

## 5.2 Evaluation Configuration Template

```yaml
# evaluation.yaml

evaluation_framework: "ragas"  # ragas, deepeval, custom

metrics:
  # RAGAS metrics
  - name: "faithfulness"
    framework: "ragas"
    weight: 0.3
    threshold: 0.8
    alert_below: 0.6

  - name: "answer_relevance"
    framework: "ragas"
    weight: 0.3
    threshold: 0.75
    alert_below: 0.5

  # DeepEval metrics
  - name: "hallucination_score"
    framework: "deepeval"
    weight: 0.2
    threshold: 0.1  # Lower is better
    alert_above: 0.2

  - name: "coherence"
    framework: "deepeval"
    weight: 0.2
    threshold: 0.8
    alert_below: 0.6

confidence_scoring:
  method: "ensemble"  # softmax, calibrated, ensemble, monte_carlo
  threshold_for_hitl: 0.7  # Below this, trigger human review
  uncertainty_type: "epistemic"

benchmarks:
  - name: "internal_test_set_v1"
    dataset_path: "./tests/fixtures/benchmark_data.json"
    gold_standard: true
    last_score: 0.87
    target_score: 0.90
    run_frequency: "weekly"

regression_testing:
  enabled: true
  baseline_version: "0.9.0"
  comparison_metrics:
    - "confidence_score"
    - "execution_time_ms"
    - "cost_per_run_usd"
  alert_on_regression: true
  regression_threshold: 0.05  # 5% degradation
```

## 5.3 Confidence Scoring

```python
# evaluation/confidence.py

from typing import List
import numpy as np

class ConfidenceScorer:
    """
    Calculate confidence scores using ensemble method.

    Methods:
    - softmax: Neural network output probabilities
    - calibrated: Temperature-scaled softmax
    - ensemble: Multiple model agreement
    - monte_carlo: Dropout-based uncertainty
    """

    def __init__(self, method: str = "ensemble"):
        self.method = method

    def score(
        self,
        outputs: List[dict],
        model_probs: List[float] = None
    ) -> float:
        """
        Calculate confidence score.

        Args:
            outputs: List of model outputs (for ensemble)
            model_probs: Model probability outputs (for softmax)

        Returns:
            Confidence score between 0 and 1
        """
        if self.method == "softmax":
            return self._softmax_confidence(model_probs)
        elif self.method == "ensemble":
            return self._ensemble_confidence(outputs)
        elif self.method == "calibrated":
            return self._calibrated_confidence(model_probs)
        else:
            raise ValueError(f"Unknown method: {self.method}")

    def _ensemble_confidence(self, outputs: List[dict]) -> float:
        """Calculate confidence based on output agreement."""
        if len(outputs) < 2:
            return 0.5  # Cannot calculate agreement

        # Compare outputs pairwise
        agreements = []
        for i, out1 in enumerate(outputs):
            for out2 in outputs[i+1:]:
                agreement = self._compare_outputs(out1, out2)
                agreements.append(agreement)

        return np.mean(agreements)

    def _compare_outputs(self, out1: dict, out2: dict) -> float:
        """Compare two outputs for agreement (0-1)."""
        # Implementation depends on output structure
        # Example: Jaccard similarity of key fields
        pass
```

---

# Part 6: MCP Tool Integration

## 6.1 Model Context Protocol Overview

**MCP (Model Context Protocol)** is the universal standard for AI tool integration, adopted by:
- Anthropic (creator, 2024)
- OpenAI (March 2025)
- Google (April 2025)
- Linux Foundation (December 2025)

**Benefits:**
- Standardized tool discovery
- Dynamic capability announcement
- Secure tool execution
- Multi-tool workflows

## 6.2 Tool Configuration Template

```yaml
# tools.yaml

required_tools:
  - tool_name: "text_preprocessor"
    mcp_server: "text-processing-mcp"
    version: ">=1.2.0"
    description: "Cleans and normalizes text"
    capabilities:
      - "tokenize"
      - "normalize"
      - "clean_html"
    timeout_ms: 5000

  - tool_name: "entity_extractor"
    mcp_server: "nlp-mcp"
    version: ">=2.0.0"
    description: "Extracts named entities"
    capabilities:
      - "extract_entities"
      - "classify_entities"
    timeout_ms: 10000

optional_tools:
  - tool_name: "knowledge_graph_lookup"
    mcp_server: "knowledge-base-mcp"
    version: ">=1.5.0"
    description: "Enriches entities with KB data"
    fallback_behavior: "skip"  # skip | error | default_value

  - tool_name: "web_search"
    mcp_server: "web-search-mcp"
    version: ">=1.0.0"
    description: "Real-time web search"
    fallback_behavior: "skip"

tool_composition:
  # Define tool chains
  - sequence: "text_preprocessor -> entity_extractor"
    name: "entity_extraction_pipeline"

  - sequence: "entity_extractor -> knowledge_graph_lookup"
    name: "enriched_entities_pipeline"
    optional: true

security:
  # MCP security settings
  authentication: "oauth2"
  authorization_model: "permit.io"
  prompt_injection_protection: "model_armor"
  input_sanitization: true
  output_filtering: true
```

## 6.3 Tool Registry

```python
# tools/registry.py

from typing import Dict, List, Optional
from dataclasses import dataclass
from mcp import MCPClient

@dataclass
class ToolInfo:
    name: str
    server: str
    version: str
    capabilities: List[str]
    timeout_ms: int
    required: bool

class ToolRegistry:
    """
    Registry for MCP tools available to runners.
    """

    _tools: Dict[str, ToolInfo] = {}
    _clients: Dict[str, MCPClient] = {}

    @classmethod
    def register_tool(cls, tool: ToolInfo):
        """Register a tool."""
        cls._tools[tool.name] = tool

    @classmethod
    def get_tool(cls, name: str) -> Optional[ToolInfo]:
        """Get tool info by name."""
        return cls._tools.get(name)

    @classmethod
    def get_client(cls, server: str) -> MCPClient:
        """Get or create MCP client for server."""
        if server not in cls._clients:
            cls._clients[server] = MCPClient(server)
        return cls._clients[server]

    @classmethod
    async def execute_tool(
        cls,
        tool_name: str,
        input_data: dict,
        timeout_ms: int = None
    ) -> dict:
        """Execute a tool via MCP."""
        tool = cls.get_tool(tool_name)
        if not tool:
            raise ValueError(f"Unknown tool: {tool_name}")

        client = cls.get_client(tool.server)
        timeout = timeout_ms or tool.timeout_ms

        result = await client.call_tool(
            tool_name,
            input_data,
            timeout_ms=timeout
        )

        return result
```

---

# Part 7: Human-in-the-Loop (HITL) Configuration

## 7.1 HITL Patterns

### Pattern 1: Approval Checkpoint

**Use when:** High-stakes decisions before execution

```yaml
pattern_type: "approval_checkpoint"
trigger: "confidence_score < 0.7"
checkpoint_node: "validate"
approval_required_for: "execute"
approvers:
  - role: "domain_expert"
    required: true
  - role: "qa_reviewer"
    required: false
timeout_hours: 24
escalation_on_timeout: "supervisor"
```

### Pattern 2: Risk-Based Routing

**Use when:** Variable risk levels need different handling

```yaml
pattern_type: "risk_based_routing"
risk_assessment_field: "risk_level"
routing_rules:
  low_risk:
    threshold: "risk_level == 'low'"
    action: "auto_approve"
  medium_risk:
    threshold: "risk_level == 'medium'"
    action: "flag_for_review"
    reviewer: "team_lead"
  high_risk:
    threshold: "risk_level == 'high'"
    action: "require_approval"
    reviewer: "director"
    escalation: "cio"
```

### Pattern 3: Audit Logging

**Use when:** Traceability without hard stops

```yaml
pattern_type: "audit_logging"
log_all: true
log_destination: "audit_db"
log_fields:
  - "input"
  - "output"
  - "reasoning_steps"
  - "confidence_score"
  - "model_used"
  - "user_id"
retention_days: 365
pii_masking: true
```

## 7.2 HITL Configuration Template

```yaml
# hitl_config.yaml

hitl_enabled: true

patterns:
  - pattern_type: "approval_checkpoint"
    trigger: "confidence_score < 0.7"
    checkpoint_node: "validate"
    approval_required_for: "finalize"
    approvers:
      - role: "domain_expert"
        required: true
    notification:
      channel: "slack"
      urgency: "medium"
    timeout_hours: 24
    timeout_action: "escalate"

  - pattern_type: "risk_based_routing"
    risk_assessment_field: "risk_level"
    routing_rules:
      low_risk:
        confidence_threshold: 0.8
        action: "auto_approve"
      medium_risk:
        confidence_threshold: 0.5
        action: "flag_for_review"
      high_risk:
        confidence_threshold: 0.0
        action: "require_approval"

  - pattern_type: "audit_logging"
    log_all: true
    log_destination: "audit_db"
    retention_days: 365

fallback_strategy:
  on_rejection: "route_to_human_operator"
  on_timeout: "escalate_to_supervisor"
  on_error: "pause_and_alert"

user_interface:
  approval_ui: "web_dashboard"  # web_dashboard, slack, email
  show_reasoning: true
  allow_feedback: true
  feedback_required: false
```

## 7.3 HITL Priority by Category

| Category | HITL Priority | Rationale |
|----------|---------------|-----------|
| GOVERN | **Critical** | Compliance decisions require human oversight |
| SECURE | **Critical** | Security decisions require human oversight |
| DECIDE | **High** | Strategic decisions benefit from human judgment |
| VALIDATE | **High** | Validation results may need human verification |
| EXECUTE | **High** | Actions in real world require approval |
| PLAN | **High** | Plans affect downstream work |
| ALIGN | **High** | Alignment requires stakeholder buy-in |
| DESIGN | **High** | Design decisions have long-term impact |
| EVALUATE | Medium | Evaluations inform decisions |
| REFINE | Medium | Refinements may need direction |
| CREATE | Medium | Creative outputs benefit from feedback |
| SYNTHESIZE | Medium | Synthesis may miss nuances |
| Others | Low | Lower risk, higher automation |

---

# Part 8: Model Configuration

## 8.1 Tier-Based Model Selection

| Tier | Models | Use Case | Cost/Query |
|------|--------|----------|------------|
| **Tier 3** (Ultra-Specialist) | GPT-4, Claude-3-Opus | Business-critical, >95% accuracy | $0.35-0.40 |
| **Tier 2** (Specialist) | GPT-4-Turbo, GPT-4 | Domain expertise, 90-95% accuracy | $0.10-0.12 |
| **Tier 1** (Foundational) | GPT-3.5-Turbo | High-volume, 85-90% accuracy | $0.015 |

## 8.2 Model Configuration Template

```yaml
# model_config.yaml

primary_model:
  provider: "openai"
  model_name: "gpt-4-turbo"
  temperature: 0.3  # Lower for factual tasks
  max_tokens: 2000
  top_p: 0.9

  # Category-specific adjustments
  category_overrides:
    CREATE:
      temperature: 0.7  # Higher for creativity
    VALIDATE:
      temperature: 0.1  # Lower for precision

fallback_models:
  - provider: "anthropic"
    model_name: "claude-3-opus-20240229"
    trigger: "primary_unavailable OR error_rate > 0.1"

  - provider: "openai"
    model_name: "gpt-3.5-turbo"
    trigger: "cost_optimization AND confidence_expected > 0.9"

cost_optimization:
  enabled: true
  prefer_cheaper_for_confidence_above: 0.9
  max_cost_per_run_usd: 0.50
  budget_alerts:
    daily_limit_usd: 100
    alert_at_percent: 80

  # Bloom level model mapping
  bloom_model_mapping:
    level_6: "gpt-4"      # CREATE
    level_5: "gpt-4"      # EVALUATE
    level_4: "gpt-4-turbo"  # ANALYZE
    level_3: "gpt-4-turbo"  # APPLY
    level_2: "gpt-3.5-turbo"  # UNDERSTAND
    level_1: "gpt-3.5-turbo"  # REMEMBER

retry_config:
  max_retries: 3
  retry_delay_seconds: 1
  exponential_backoff: true
  retry_on_errors:
    - "rate_limit"
    - "timeout"
    - "server_error"
```

---

# Part 9: Monitoring & Observability

## 9.1 Metrics to Track

| Metric | Type | Alert Threshold | Description |
|--------|------|-----------------|-------------|
| `execution_time_ms` | Histogram | > 5000ms | Time to complete |
| `confidence_score` | Histogram | < 0.6 | Output confidence |
| `token_count` | Counter | > 4000 | Tokens used |
| `cost_per_run_usd` | Gauge | > $0.50 | Execution cost |
| `error_rate` | Counter | > 5% | Error percentage |
| `hitl_trigger_rate` | Counter | > 20% | Human review rate |

## 9.2 Monitoring Configuration Template

```yaml
# monitoring.yaml

logging:
  level: "INFO"  # DEBUG, INFO, WARN, ERROR
  log_reasoning_steps: true
  log_tool_calls: true
  log_intermediate_states: true
  log_destination: "cloudwatch"  # cloudwatch, datadog, custom

metrics:
  - metric_name: "execution_time_ms"
    type: "histogram"
    buckets: [100, 500, 1000, 2000, 5000, 10000]
    alert_threshold: 5000
    alert_channel: "pagerduty"

  - metric_name: "confidence_score"
    type: "histogram"
    buckets: [0.2, 0.4, 0.6, 0.8, 1.0]
    alert_threshold: 0.6
    alert_condition: "below"

  - metric_name: "cost_per_run_usd"
    type: "gauge"
    alert_threshold: 0.50
    aggregation: "daily_sum"

  - metric_name: "error_rate"
    type: "counter"
    alert_threshold: 0.05
    window_minutes: 15

observability_platform: "langsmith"  # langsmith, weights_and_biases, datadog

tracing:
  enabled: true
  sample_rate: 1.0  # 100% for debugging, lower in production
  span_attributes:
    - "runner_id"
    - "cognitive_category"
    - "prompt_version"
    - "model_name"
    - "confidence_score"

dashboards:
  - name: "runner_performance"
    metrics:
      - "execution_time_ms"
      - "confidence_score"
      - "error_rate"
    refresh_seconds: 60

  - name: "cost_tracking"
    metrics:
      - "cost_per_run_usd"
      - "token_count"
    refresh_seconds: 300

alerts:
  channels:
    - name: "slack"
      webhook: "${SLACK_WEBHOOK_URL}"
      severity: ["warn", "error"]

    - name: "pagerduty"
      service_key: "${PAGERDUTY_SERVICE_KEY}"
      severity: ["critical"]
```

---

# Part 10: Governance & Compliance

## 10.1 Compliance Frameworks

| Framework | Applicable | Requirements |
|-----------|------------|--------------|
| **HIPAA** | If handling PHI | Encryption, access control, audit trails |
| **GDPR** | If EU data subjects | Data retention, consent, right to erasure |
| **SOC2** | Enterprise deployments | Security controls, audit trails |
| **FDA 21 CFR Part 11** | Pharma regulated | Electronic signatures, validation |

## 10.2 Governance Configuration Template

```yaml
# governance.yaml

compliance_requirements:
  - framework: "HIPAA"
    applicable: true
    controls:
      - encryption_at_rest: true
      - encryption_in_transit: true
      - access_logging: true
      - phi_detection: true
    data_retention_days: 90

  - framework: "GDPR"
    applicable: true
    controls:
      - consent_tracking: true
      - data_subject_access: true
      - right_to_erasure: true
    data_retention_days: 90

  - framework: "SOC2"
    applicable: true
    controls:
      - audit_trail_required: true
      - change_management: true
      - incident_response: true

security_controls:
  input_sanitization:
    enabled: true
    methods:
      - "regex_filtering"
      - "llm_validation"
    block_patterns:
      - "prompt_injection"
      - "jailbreak_attempts"

  prompt_injection_detection:
    enabled: true
    framework: "model_armor"  # Google Model Armor
    action_on_detect: "block_and_log"

  output_filtering:
    enabled: true
    filter_pii: true
    filter_toxicity: true
    filter_hallucination: true
    confidence_threshold: 0.8

access_controls:
  allowed_roles:
    - "researcher"
    - "analyst"
    - "admin"
  denied_roles:
    - "guest"
  requires_approval: false
  audit_all_usage: true

data_classification:
  default: "internal"  # public, internal, confidential, restricted
  phi_handling: "encrypted"
  pii_handling: "masked"
```

---

# Part 11: Testing Strategy

## 11.1 Test Types

| Test Type | Purpose | When to Run |
|-----------|---------|-------------|
| **Unit Tests** | Individual functions | Every commit |
| **Integration Tests** | End-to-end workflow | Every PR |
| **Performance Tests** | Latency, throughput | Weekly |
| **Regression Tests** | Quality maintenance | Weekly |
| **Benchmark Tests** | Against gold standard | Monthly |

## 11.2 Testing Configuration Template

```yaml
# testing.yaml

test_suite:
  unit_tests:
    - test_name: "test_input_validation"
      file: "./tests/unit/test_schemas.py"
      coverage_target: 90

    - test_name: "test_prompt_rendering"
      file: "./tests/unit/test_prompts.py"
      coverage_target: 95

  integration_tests:
    - test_name: "test_end_to_end_workflow"
      file: "./tests/integration/test_workflow.py"
      fixtures: "./tests/fixtures/e2e_data.json"
      success_criteria:
        - "confidence_score > 0.8"
        - "execution_time_ms < 5000"
        - "error_count == 0"

  performance_tests:
    - test_name: "test_concurrent_runs"
      file: "./tests/performance/test_concurrency.py"
      concurrent_runs: 10
      success_criteria:
        - "avg_execution_time_ms < 4000"
        - "p99_execution_time_ms < 8000"
        - "error_rate < 0.01"

    - test_name: "test_load"
      file: "./tests/performance/test_load.py"
      requests_per_second: 50
      duration_seconds: 300
      success_criteria:
        - "success_rate > 0.99"
        - "avg_latency_ms < 2000"

regression_tests:
  enabled: true
  baseline_version: "0.9.0"
  comparison_metrics:
    - metric: "confidence_score"
      threshold: 0.05  # 5% degradation
    - metric: "execution_time_ms"
      threshold: 0.20  # 20% degradation
    - metric: "cost_per_run_usd"
      threshold: 0.10  # 10% increase

benchmark_tests:
  - name: "internal_benchmark_v1"
    dataset: "./tests/benchmarks/gold_standard.json"
    metrics:
      - "faithfulness"
      - "answer_relevance"
      - "coherence"
    target_scores:
      faithfulness: 0.85
      answer_relevance: 0.80
      coherence: 0.85
    run_frequency: "monthly"

fixtures:
  location: "./tests/fixtures/"
  types:
    - "input_samples.json"
    - "expected_outputs.json"
    - "benchmark_data.json"
    - "edge_cases.json"
```

---

# Part 12: Prompt Versioning

## 12.1 Semantic Versioning for Prompts

**Format:** X.Y.Z

| Component | Description | Example |
|-----------|-------------|---------|
| **Major (X)** | Breaking structural changes | 1.0.0 → 2.0.0 |
| **Minor (Y)** | New features, non-breaking | 1.0.0 → 1.1.0 |
| **Patch (Z)** | Bug fixes, wording tweaks | 1.0.0 → 1.0.1 |

## 12.2 Prompt Template Structure

```
# prompts/v1.0.0.txt

# Prompt Version: 1.0.0
# Category: UNDERSTAND
# Pattern: Chain-of-Thought
# Author: AI Team
# Created: 2025-01-15
# Last Modified: 2025-01-15

## SYSTEM PROMPT

You are a document comprehension specialist. Your task is to analyze documents and extract key information.

## REASONING STRUCTURE

Let's think step-by-step:

1. **Document Analysis**
   - Identify document type and structure
   - Note the main sections and their purposes

2. **Entity Extraction**
   - Extract key entities (people, organizations, concepts)
   - Classify entities by type
   - Note confidence levels

3. **Relationship Mapping**
   - Identify relationships between entities
   - Note the nature of each relationship

4. **Summary Generation**
   - Synthesize main points
   - Create concise summary

## INPUT FORMAT

Document to analyze:
{document}

Focus areas (if specified):
{focus_areas}

## OUTPUT FORMAT

Provide your analysis in the following JSON structure:
{
  "summary": "...",
  "key_entities": [...],
  "main_points": [...],
  "relationships": [...],
  "themes": [...]
}

## CONSTRAINTS

- Maximum summary length: 500 words
- Confidence scores required for all entities
- Must cite specific document sections
```

## 12.3 Changelog Template

```markdown
# prompts/changelog.md

# Prompt Changelog: understand_001

## [1.1.0] - 2025-02-01

### Added
- Confidence score requirement for entities
- Citation requirement for claims

### Changed
- Improved reasoning structure clarity
- Updated output format with themes

### Performance
- Faithfulness: 0.82 → 0.87
- Answer Relevance: 0.78 → 0.82

## [1.0.0] - 2025-01-15

### Initial Release
- Chain-of-Thought reasoning pattern
- Document comprehension focus
- Entity extraction capability
```

---

# Part 13: Implementation Checklist

## 13.1 Runner Package Checklist

Before releasing a runner, verify:

### Identity & Metadata
- [ ] `runner_manifest.yaml` complete
- [ ] Version follows SemVer
- [ ] Category correctly assigned
- [ ] Bloom level mapped

### Prompting
- [ ] `prompt_strategy.yaml` complete
- [ ] Prompt pattern appropriate for category
- [ ] Prompt template versioned
- [ ] Changelog started

### Workflow
- [ ] `workflow.py` implemented
- [ ] Archetype appropriate for category
- [ ] Loop prevention implemented (if loops exist)
- [ ] Checkpointing enabled (if stateful)

### Schemas
- [ ] `schemas.py` with Pydantic models
- [ ] Input schema validates correctly
- [ ] Output schema includes all required fields
- [ ] Confidence scoring implemented

### Evaluation
- [ ] `evaluation.yaml` configured
- [ ] Metrics selected (RAGAS/DeepEval)
- [ ] Thresholds defined
- [ ] Benchmarks created

### HITL
- [ ] `hitl_config.yaml` if required
- [ ] Triggers defined
- [ ] Approvers assigned
- [ ] Fallback strategy defined

### Models
- [ ] `model_config.yaml` complete
- [ ] Primary model selected
- [ ] Fallback models configured
- [ ] Cost limits set

### Monitoring
- [ ] `monitoring.yaml` configured
- [ ] Metrics defined
- [ ] Alerts configured
- [ ] Dashboards created

### Governance
- [ ] `governance.yaml` if required
- [ ] Compliance frameworks identified
- [ ] Security controls configured
- [ ] Access controls defined

### Testing
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests written
- [ ] Fixtures created
- [ ] Performance tests defined

### Documentation
- [ ] `README.md` complete
- [ ] Input/output documented
- [ ] Examples provided
- [ ] Changelog maintained

---

# Part 14: Reference Templates

## 14.1 Runner Manifest Template

```yaml
# runner_manifest.yaml

# Identity
runner_id: "{category}_{number}"  # e.g., understand_001
runner_name: "{Human Readable Name}"
version: "1.0.0"
status: "active"  # active, deprecated, experimental

# Classification
cognitive_category: "{CATEGORY}"  # UNDERSTAND, EVALUATE, etc.
bloom_level: 2  # 1-6
complexity: "medium"  # simple, medium, complex

# Description
description: |
  One paragraph description of what this runner does,
  when to use it, and what it produces.

# Capabilities
capabilities:
  - "capability_1"
  - "capability_2"
  - "capability_3"

# Dependencies
depends_on:
  runners: []  # Other runners this depends on
  tools: []    # MCP tools required

# Performance
estimated_duration_seconds: 60
max_duration_seconds: 300

# Metadata
created_date: "2025-01-15"
last_updated: "2025-01-15"
author: "AI Team"
tags:
  - "comprehension"
  - "analysis"
```

## 14.2 Prompt Strategy Template

```yaml
# prompt_strategy.yaml

# Pattern Selection
prompting_pattern: "chain_of_thought"  # CoT, ToT, ReAct, self_critique, meta_prompting
secondary_pattern: null

# Reasoning Structure
reasoning_structure:
  - step: 1
    name: "Context Analysis"
    description: "Analyze the input context"
  - step: 2
    name: "Processing"
    description: "Apply the cognitive operation"
  - step: 3
    name: "Synthesis"
    description: "Synthesize results"
  - step: 4
    name: "Validation"
    description: "Validate output quality"

# Template Configuration
prompt_template:
  version: "1.0.0"
  path: "./prompts/v1.0.0.txt"

  parameters:
    - name: "input"
      type: "string"
      required: true
      description: "Primary input"

    - name: "context"
      type: "object"
      required: false
      description: "Additional context"

    - name: "constraints"
      type: "array"
      required: false
      description: "Constraints to apply"

# Output Requirements
output_requirements:
  format: "json"
  schema_path: "./schemas.py"
  confidence_required: true
  reasoning_required: true
```

---

# Summary

This document defines the **world-class package architecture** for VITAL's 88 cognitive runners. Key standards:

1. **13-Component Package Structure** - Consistent, scalable organization
2. **5 Prompt Patterns** - CoT, ToT, ReAct, Self-Critique, Meta-Prompting
3. **6 LangGraph Archetypes** - Pipeline, Conditional, Iteration, Map-Reduce, Generator-Critic, HITL
4. **Pydantic Schemas** - Type-safe I/O validation
5. **RAGAS + DeepEval** - Quality assurance
6. **MCP Integration** - Universal tool standard
7. **HITL Patterns** - Human oversight where needed
8. **Semantic Versioning** - Prompt management

---

# Appendix A: Academic Sources

| Topic | Source | Citation |
|-------|--------|----------|
| Chain-of-Thought | NeurIPS 2022 | Wei et al. "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" |
| Tree-of-Thought | NeurIPS 2023 | Yao et al. "Tree of Thoughts: Deliberate Problem Solving with Large Language Models" |
| ReAct | ICLR 2023 | Yao et al. "ReAct: Synergizing Reasoning and Acting in Language Models" |
| Reflexion | NeurIPS 2023 | Shinn et al. "Reflexion: Language Agents with Verbal Reinforcement Learning" |
| RAGAS | 2024 | Shahul Es et al. "RAGAS: Automated Evaluation of Retrieval Augmented Generation" |
| LangGraph | LangChain 2024-2025 | Official documentation and best practices |
| MCP | Anthropic 2024 | Model Context Protocol specification |
| Bloom's Taxonomy | 1956/2001 | Bloom, Anderson & Krathwohl |

---

**Version History:**
- v1.0 (December 2025): Initial world-class architecture document

---

*End of Document*
