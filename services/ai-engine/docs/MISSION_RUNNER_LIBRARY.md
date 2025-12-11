# Mission Runner Library Documentation

## Overview

The Mission Runner Library implements the core formula for autonomous mission execution:

```
TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT
```

This library provides **24 specialized runners** (12 core cognitive + 12 pharmaceutical domain) that transform mission stages into executable LangGraph nodes with quality validation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Mission Runner Library                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  BaseRunner  │───▶│RunnerRegistry│───▶│RunnerExecutor│       │
│  │  (Abstract)  │    │ (Singleton)  │    │   (Bridge)   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Runner Categories                      │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  PLAN        │ INVESTIGATE │ EVALUATE  │ VALIDATE       │    │
│  │  SYNTHESIZE  │ DECIDE      │ CRITIQUE  │ CREATE         │    │
│  │  TRANSFORM   │ COMMUNICATE │ DESIGN    │ OPTIMIZE       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐        │
│  │   Core     │      │   Pharma   │      │  Database  │        │
│  │  Runners   │      │  Runners   │      │  Runners   │        │
│  │   (12)     │      │   (12)     │      │   (88+)    │        │
│  └────────────┘      └────────────┘      └────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
services/ai-engine/src/runners/
├── __init__.py              # Main exports
├── base.py                  # BaseRunner abstract class
├── registry.py              # RunnerRegistry singleton
├── assembler.py             # RunnerAssembler (stage→runner mapping)
├── executor.py              # RunnerExecutor (bridge to database)
├── core/                    # Core cognitive runners
│   ├── __init__.py
│   ├── decompose.py         # Task decomposition
│   ├── investigate.py       # Research & evidence gathering
│   ├── critique.py          # Critical analysis
│   ├── validate.py          # Validation & verification
│   ├── synthesize.py        # Information synthesis
│   └── recommend.py         # Recommendation generation
└── pharma/                  # Pharmaceutical domain runners
    ├── __init__.py
    ├── market_access.py     # HEOR, pricing, reimbursement
    ├── medical_affairs.py   # KOL, MSL, scientific comms
    ├── foresight.py         # Trends, competitive intelligence
    ├── brand_strategy.py    # Commercial positioning
    ├── digital_health.py    # DTx, RWE, patient engagement
    └── design_thinking.py   # Human-centered design
```

## Core Components

### 1. BaseRunner (Abstract Base Class)

Located: `runners/base.py`

```python
class BaseRunner(ABC):
    """Abstract base class for all runners"""

    def __init__(
        self,
        runner_id: str,
        name: str,
        category: RunnerCategory,
        description: str,
        required_knowledge_layers: List[KnowledgeLayer],
        quality_metrics: List[QualityMetric],
        domain: Optional[PharmaDomain] = None,
    ):
        ...

    async def execute(self, input_data: RunnerInput) -> RunnerOutput:
        """Main execution with quality gate"""
        ...

    @abstractmethod
    async def _execute_core(self, input_data: RunnerInput) -> Any:
        """Subclass implementation"""
        ...

    @abstractmethod
    def _validate_output(self, output: Any, input_data: RunnerInput) -> Dict[QualityMetric, float]:
        """Quality validation"""
        ...

    def to_langgraph_node(self) -> Callable:
        """Convert runner to LangGraph node"""
        ...
```

**Key Features:**
- Quality gate pattern with iterative refinement (max 3 iterations)
- Quality threshold: 0.80 minimum average score
- LangGraph node conversion for workflow integration
- Structured input/output with Pydantic models

### 2. RunnerRegistry (Singleton)

Located: `runners/registry.py`

```python
class RunnerRegistry:
    """Singleton registry for all runners"""

    _instance: Optional['RunnerRegistry'] = None
    _runners: Dict[str, BaseRunner]
    _by_category: Dict[RunnerCategory, List[str]]
    _by_domain: Dict[PharmaDomain, List[str]]

    @classmethod
    def get_instance(cls) -> 'RunnerRegistry':
        """Get singleton instance"""
        ...

    def register(self, runner: BaseRunner) -> None:
        """Register a runner"""
        ...

    def get_runner(self, runner_id: str) -> Optional[BaseRunner]:
        """Get runner by ID"""
        ...

    def get_by_category(self, category: RunnerCategory) -> List[BaseRunner]:
        """Get all runners in a category"""
        ...

    def get_by_domain(self, domain: PharmaDomain) -> List[BaseRunner]:
        """Get all runners for a pharma domain"""
        ...
```

### 3. RunnerAssembler (Stage Mapping)

Located: `runners/assembler.py`

Maps mission stages to appropriate runners:

```python
STAGE_TO_RUNNER_MAP = {
    "planning": "decompose_basic",
    "evidence": "investigate_basic",
    "analysis": "critique_basic",
    "synthesis": "synthesize_basic",
    "validation": "validate_basic",
    "recommendations": "recommend_basic",
}
```

### 4. RunnerExecutor (Database Bridge)

Located: `runners/executor.py`

Bridges database runner metadata with cognitive runners:

```python
class RunnerExecutor:
    """Executes runners with database integration"""

    async def execute_runner(
        self,
        runner_metadata: Dict,
        mission_context: Dict,
        stage: str
    ) -> AsyncIterator[Dict]:
        """Execute runner with streaming output"""
        ...
```

## Runner Categories (22 Types)

| Category | Description | Example Runners |
|----------|-------------|-----------------|
| PLAN | Strategic planning, decomposition | DecomposeRunner |
| INVESTIGATE | Research, evidence gathering | InvestigateRunner, ForesightRunner |
| EVALUATE | Assessment, scoring | CritiqueRunner |
| VALIDATE | Verification, compliance | ValidateRunner |
| SYNTHESIZE | Integration, summarization | SynthesizeRunner |
| DECIDE | Decision support | RecommendRunner |
| CRITIQUE | Critical analysis | CritiqueRunner |
| CREATE | Content generation | BrandStrategyRunner |
| TRANSFORM | Data transformation | - |
| COMMUNICATE | Messaging, reports | - |
| DESIGN | Human-centered design | DesignThinkingRunner, DigitalHealthRunner |
| OPTIMIZE | Efficiency improvement | - |

## Core Cognitive Runners (12)

### DecomposeRunner
- **Category:** PLAN
- **Purpose:** Break complex tasks into subtasks
- **Output:** DecomposeResult with subtasks, dependencies, priorities

### InvestigateRunner
- **Category:** INVESTIGATE
- **Purpose:** Research and evidence gathering
- **Output:** InvestigationResult with findings, sources, confidence

### CritiqueRunner
- **Category:** CRITIQUE
- **Purpose:** Critical analysis and gap identification
- **Output:** CritiqueResult with issues, strengths, recommendations

### ValidateRunner
- **Category:** VALIDATE
- **Purpose:** Verification and compliance checking
- **Output:** ValidationResult with passed/failed checks

### SynthesizeRunner
- **Category:** SYNTHESIZE
- **Purpose:** Integrate multiple sources into coherent output
- **Output:** SynthesisResult with summary, themes, conflicts

### RecommendRunner
- **Category:** DECIDE
- **Purpose:** Generate actionable recommendations
- **Output:** RecommendResult with recommendations, rationale, priority

## Pharmaceutical Domain Runners (12)

### 1. FORESIGHT Family

**ForesightRunner** & **ForesightAdvancedRunner**
- Trend analysis and signal detection
- Competitive intelligence
- Scenario planning
- Strategic forecasting

```python
class ForesightResult(BaseModel):
    trends: List[TrendSignal]
    competitive_landscape: List[CompetitorInsight]
    scenarios: List[str]
    opportunities: List[str]
    risks: List[str]
    recommendations: List[str]
```

### 2. BRAND_STRATEGY Family

**BrandStrategyRunner** & **BrandStrategyAdvancedRunner**
- Brand positioning and differentiation
- Customer segmentation
- Commercial launch planning
- Messaging strategy

```python
class BrandStrategyResult(BaseModel):
    positioning: List[BrandPositioning]
    customer_segments: List[CustomerSegment]
    key_messages: List[str]
    competitive_advantages: List[str]
    launch_considerations: List[str]
```

### 3. DIGITAL_HEALTH Family

**DigitalHealthRunner** & **DigitalHealthAdvancedRunner**
- Digital therapeutics (DTx) strategy
- Real-world evidence (RWE) generation
- Patient engagement platforms
- Connected health solutions

```python
class DigitalHealthResult(BaseModel):
    digital_solutions: List[DigitalSolution]
    rwe_strategy: List[str]
    data_sources: List[DataSource]
    patient_engagement: List[str]
    regulatory_considerations: List[str]
```

### 4. MEDICAL_AFFAIRS Family

**MedicalAffairsRunner** & **MedicalAffairsAdvancedRunner**
- KOL engagement strategy
- MSL activity planning
- Scientific communications
- Medical education

```python
class MedicalAffairsResult(BaseModel):
    kol_strategy: List[KOLInsight]
    msl_recommendations: List[str]
    scientific_evidence: List[str]
    communication_plan: List[str]
```

### 5. MARKET_ACCESS Family

**MarketAccessRunner** & **MarketAccessAdvancedRunner**
- HEOR strategy
- Pricing and reimbursement
- HTA submissions
- Payer engagement

```python
class MarketAccessResult(BaseModel):
    heor_strategy: List[str]
    pricing_analysis: List[PricingInsight]
    reimbursement_landscape: List[str]
    access_barriers: List[str]
```

### 6. DESIGN_THINKING Family

**DesignThinkingRunner** & **DesignThinkingAdvancedRunner**
- Human-centered design
- User research and journey mapping
- Service design and innovation
- Ideation and concept development

```python
class DesignThinkingResult(BaseModel):
    problem_statement: str
    user_insights: List[UserInsight]
    journey_map: List[JourneyStage]
    design_concepts: List[DesignConcept]
    design_principles: List[str]
```

## Quality Gate System

Each runner implements a quality gate pattern:

```python
async def execute(self, input_data: RunnerInput) -> RunnerOutput:
    """Execute with quality gate"""

    for iteration in range(self.max_iterations):
        # Execute core logic
        result = await self._execute_core(input_data)

        # Validate quality
        quality_scores = self._validate_output(result, input_data)
        avg_score = sum(quality_scores.values()) / len(quality_scores)

        # Check threshold
        if avg_score >= self.quality_threshold:
            return RunnerOutput(
                result=result,
                quality_scores=quality_scores,
                iterations=iteration + 1
            )

        # Refine for next iteration
        input_data = self._refine_input(input_data, quality_scores)

    return RunnerOutput(
        result=result,
        quality_scores=quality_scores,
        iterations=self.max_iterations,
        needs_review=True
    )
```

**Quality Metrics:**
- RELEVANCE: Output addresses the task requirements
- COMPREHENSIVENESS: All aspects covered
- ACCURACY: Factual correctness
- TIMELINESS: Time-sensitive factors addressed
- EXPRESSION: Clear and well-articulated
- COVERAGE: Breadth of analysis

## LangGraph Integration

Runners can be converted to LangGraph nodes:

```python
# Convert runner to LangGraph node
runner = registry.get_runner("investigate_basic")
node_func = runner.to_langgraph_node()

# Use in StateGraph
from langgraph.graph import StateGraph

graph = StateGraph(MissionState)
graph.add_node("investigate", node_func)
```

## Usage Examples

### Basic Runner Execution

```python
from runners import RunnerRegistry
from runners.base import RunnerInput, KnowledgeLayer

# Get registry
registry = RunnerRegistry.get_instance()

# Get runner
runner = registry.get_runner("investigate_basic")

# Create input
input_data = RunnerInput(
    task="Analyze competitive landscape for oncology market",
    context={"therapeutic_area": "oncology"},
    constraints=["Focus on US market", "Include pipeline drugs"],
    knowledge_layers=[KnowledgeLayer.L0_INDUSTRY, KnowledgeLayer.L1_FUNCTION]
)

# Execute
output = await runner.execute(input_data)
print(f"Quality: {output.average_quality_score}")
print(f"Iterations: {output.iterations}")
```

### Pharma Domain Runner

```python
from runners.pharma import ForesightRunner
from runners.base import RunnerInput, KnowledgeLayer, PharmaDomain

# Create runner
runner = ForesightRunner()

# Execute foresight analysis
input_data = RunnerInput(
    task="Identify emerging trends in cell and gene therapy",
    context={"focus_areas": ["CAR-T", "gene editing"]},
    knowledge_layers=[KnowledgeLayer.L0_INDUSTRY]
)

output = await runner.execute(input_data)
result = output.result  # ForesightResult

for trend in result.trends:
    print(f"Trend: {trend.trend_name}")
    print(f"Signal Strength: {trend.signal_strength}")
    print(f"Time Horizon: {trend.time_horizon}")
```

### Stage-Based Execution

```python
from runners import RunnerAssembler

# Get runner for stage
assembler = RunnerAssembler()
runner = assembler.get_runner_for_stage("evidence")  # Returns InvestigateRunner

# Execute
output = await runner.execute(input_data)
```

## Code Review Summary

### Grade: B+ (87/100)

**Strengths:**
- Clean architecture with proper separation of concerns
- Well-structured Pydantic models for type safety
- Quality gate pattern for iterative refinement
- Good domain coverage for pharmaceutical industry

**Critical Issues to Address:**

| Priority | Issue | Status |
|----------|-------|--------|
| CRITICAL | Zero test coverage | Pending |
| CRITICAL | LangGraph StateGraph construction missing | Pending |
| CRITICAL | SSE streaming not wired | Pending |
| CRITICAL | Prompt injection protection missing | Pending |
| HIGH | HIPAA audit logging missing | Pending |
| HIGH | Circuit breakers/rate limiting | Pending |
| MEDIUM | TypedDict for LangGraph state | Pending |

### Recommended Next Steps

1. **Add comprehensive test suite** (pytest, 80%+ coverage)
2. **Implement LangGraph StateGraph construction**
3. **Wire SSE streaming to executor**
4. **Add security controls** (prompt injection, rate limiting)
5. **Add HIPAA audit logging** for healthcare compliance
6. **Implement circuit breakers** for LLM calls

## Configuration

### Environment Variables

```bash
# LLM Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Quality Gate Settings
RUNNER_QUALITY_THRESHOLD=0.80
RUNNER_MAX_ITERATIONS=3

# Timeouts
RUNNER_LLM_TIMEOUT=60
RUNNER_TOTAL_TIMEOUT=300
```

### Runner Registration

Runners are auto-registered on import:

```python
# In runners/__init__.py
from .core import (
    DecomposeRunner, DecomposeAdvancedRunner,
    InvestigateRunner, InvestigateAdvancedRunner,
    # ... all runners
)

# Register all runners
registry = RunnerRegistry.get_instance()
for runner_class in ALL_RUNNERS:
    registry.register(runner_class())
```

## Database Integration

The RunnerExecutor bridges with the `vital_runners` table:

```sql
-- 88 database-backed runners
SELECT COUNT(*) FROM vital_runners;

-- Runner compatibility mappings
SELECT COUNT(*) FROM runner_compatibility_mapping;
-- 440 mappings (88 runners × 5 compatible categories)
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-11 | Initial implementation with 24 runners |

---

*Documentation generated: December 11, 2025*
*Grade: B+ (87/100) - See Code Review Summary for improvement areas*
