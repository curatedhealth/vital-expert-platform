"""
ProjectRunner - Project future using Monte Carlo simulation.

Algorithmic Core: Monte Carlo Simulation / Probabilistic Projection
- Generates multiple projection paths
- Accounts for uncertainty in inputs
- Produces probability distributions

Use Cases:
- Financial forecasting
- Project timeline estimation
- Risk quantification
- Demand forecasting
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class ProjectInput(TaskRunnerInput):
    """Input schema for ProjectRunner."""

    scenario: Dict[str, Any] = Field(
        ...,
        description="Scenario to project from"
    )
    model_parameters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Model parameters {variable: {base, min, max, distribution}}"
    )
    projection_periods: int = Field(
        default=12,
        description="Number of periods to project"
    )
    num_simulations: int = Field(
        default=100,
        description="Number of Monte Carlo iterations (conceptual)"
    )
    output_metrics: List[str] = Field(
        default_factory=list,
        description="Metrics to project"
    )


class ProjectionPath(TaskRunnerOutput):
    """A single projection path."""

    path_id: str = Field(default="", description="Path ID")
    path_type: str = Field(
        default="median",
        description="p10 | p25 | median | p75 | p90"
    )
    values: List[float] = Field(
        default_factory=list,
        description="Projected values by period"
    )
    cumulative: float = Field(default=0, description="Cumulative total")
    end_value: float = Field(default=0, description="Final period value")
    growth_rate: float = Field(default=0, description="CAGR or growth rate")


class MetricProjection(TaskRunnerOutput):
    """Projection for a single metric."""

    metric_name: str = Field(default="", description="Metric name")
    base_value: float = Field(default=0, description="Starting value")
    paths: List[ProjectionPath] = Field(
        default_factory=list,
        description="Projection paths (p10, median, p90)"
    )
    expected_value: float = Field(default=0, description="Expected final value")
    standard_deviation: float = Field(default=0, description="Std dev at end")
    key_drivers: List[str] = Field(
        default_factory=list,
        description="Key drivers affecting this metric"
    )


class ProjectOutput(TaskRunnerOutput):
    """Output schema for ProjectRunner."""

    projections: List[MetricProjection] = Field(
        default_factory=list,
        description="Projections by metric"
    )
    projection_summary: Dict[str, Dict[str, float]] = Field(
        default_factory=dict,
        description="{metric: {p10, median, p90, expected}}"
    )
    key_assumptions: List[str] = Field(
        default_factory=list,
        description="Key assumptions"
    )
    sensitivity_factors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Most sensitive parameters"
    )
    risk_factors: List[str] = Field(
        default_factory=list,
        description="Risk factors to monitor"
    )
    projection_confidence: str = Field(
        default="medium",
        description="low | medium | high"
    )
    methodology_notes: str = Field(default="", description="Methodology")
    forecast_summary: str = Field(default="", description="Summary")


# =============================================================================
# ProjectRunner Implementation
# =============================================================================

@register_task_runner
class ProjectRunner(TaskRunner[ProjectInput, ProjectOutput]):
    """
    Monte Carlo projection runner.

    This runner generates probabilistic projections
    using simulation concepts.

    Algorithmic Pattern:
        1. Parse scenario and parameters
        2. For each metric:
           - Define probability distributions
           - Generate projection paths
           - Calculate percentiles (p10, p50, p90)
        3. Identify sensitivities
        4. Note risk factors
        5. Summarize projections

    Best Used For:
        - Financial forecasting
        - Timeline estimation
        - Demand planning
        - Risk quantification
    """

    runner_id = "project"
    name = "Project Runner"
    description = "Project future using Monte Carlo simulation"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "monte_carlo"
    max_duration_seconds = 150

    InputType = ProjectInput
    OutputType = ProjectOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ProjectRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: ProjectInput) -> ProjectOutput:
        """
        Execute Monte Carlo projection.

        Args:
            input: Projection parameters

        Returns:
            ProjectOutput with projections
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            scenario_text = json.dumps(input.scenario, indent=2, default=str)[:2000]

            params_text = ""
            if input.model_parameters:
                params_text = f"\nModel parameters:\n{json.dumps(input.model_parameters, indent=2, default=str)[:1000]}"

            metrics_text = ""
            if input.output_metrics:
                metrics_text = "\nMetrics to project: " + ", ".join(input.output_metrics)

            system_prompt = f"""You are an expert forecaster using Monte Carlo simulation concepts.

Your task is to generate probabilistic projections for a scenario.

Projection periods: {input.projection_periods}
Simulation iterations (conceptual): {input.num_simulations}

Monte Carlo projection approach:
1. For each metric:
   - Start with base value
   - Apply growth/change rates with uncertainty
   - Generate projection paths:
     * p10: Pessimistic (10th percentile)
     * p25: Conservative
     * median: Most likely (50th percentile)
     * p75: Optimistic
     * p90: Best case (90th percentile)
2. For each path:
   - Project values for each period
   - Calculate cumulative and final values
   - Compute growth rate (CAGR)
3. Identify:
   - Key assumptions
   - Sensitivity factors (which inputs matter most)
   - Risk factors to monitor
4. Assess confidence based on:
   - Data quality
   - Assumption reliability
   - External uncertainty

Return a structured JSON response with:
- projections: Array with:
  - metric_name: Name
  - base_value: Starting value
  - paths: Array with:
    - path_id: P1, P2, etc.
    - path_type: p10 | p25 | median | p75 | p90
    - values: [value_period_1, value_period_2, ...]
    - cumulative: Total over all periods
    - end_value: Final period value
    - growth_rate: CAGR
  - expected_value: Expected final value
  - standard_deviation: Uncertainty at end
  - key_drivers: What drives this metric
- projection_summary: {{metric: {{p10, median, p90, expected}}}}
- key_assumptions: List
- sensitivity_factors: [{{parameter, sensitivity, direction}}]
- risk_factors: Risks to monitor
- projection_confidence: low | medium | high
- methodology_notes: How projections were generated
- forecast_summary: 2-3 sentence summary"""

            user_prompt = f"""Generate projections for this scenario:

SCENARIO:
{scenario_text}
{params_text}
{metrics_text}

Generate projections and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_project_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build projections
            projections_data = result.get("projections", [])
            projections = []
            for p in projections_data:
                paths_data = p.get("paths", [])
                paths = [
                    ProjectionPath(
                        path_id=path.get("path_id", f"P{idx+1}"),
                        path_type=path.get("path_type", "median"),
                        values=path.get("values", []),
                        cumulative=float(path.get("cumulative", 0)),
                        end_value=float(path.get("end_value", 0)),
                        growth_rate=float(path.get("growth_rate", 0)),
                    )
                    for idx, path in enumerate(paths_data)
                ]
                projections.append(
                    MetricProjection(
                        metric_name=p.get("metric_name", ""),
                        base_value=float(p.get("base_value", 0)),
                        paths=paths,
                        expected_value=float(p.get("expected_value", 0)),
                        standard_deviation=float(p.get("standard_deviation", 0)),
                        key_drivers=p.get("key_drivers", []),
                    )
                )

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ProjectOutput(
                success=True,
                projections=projections,
                projection_summary=result.get("projection_summary", {}),
                key_assumptions=result.get("key_assumptions", []),
                sensitivity_factors=result.get("sensitivity_factors", []),
                risk_factors=result.get("risk_factors", []),
                projection_confidence=result.get("projection_confidence", "medium"),
                methodology_notes=result.get("methodology_notes", ""),
                forecast_summary=result.get("forecast_summary", ""),
                confidence_score=0.8,
                quality_score=0.8,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ProjectRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ProjectOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_project_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "projections": [],
                "projection_summary": {},
                "key_assumptions": [],
                "sensitivity_factors": [],
                "risk_factors": [],
                "projection_confidence": "unknown",
                "methodology_notes": "",
                "forecast_summary": content[:200],
            }
