"""
ScenarioRunner - Generate scenario using scenario construction.

Algorithmic Core: Scenario Construction / What-If Analysis
- Builds coherent future scenarios
- Identifies key drivers and uncertainties
- Creates plausible narrative arcs

Use Cases:
- Strategic planning
- Risk assessment
- Contingency planning
- Investment analysis
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

class ScenarioInput(TaskRunnerInput):
    """Input schema for ScenarioRunner."""

    context: str = Field(
        ...,
        description="Context for scenario generation"
    )
    key_drivers: List[str] = Field(
        default_factory=list,
        description="Key drivers/variables to consider"
    )
    time_horizon: str = Field(
        default="1_year",
        description="Horizon: 3_months | 6_months | 1_year | 3_years | 5_years"
    )
    scenario_types: List[str] = Field(
        default_factory=lambda: ["optimistic", "pessimistic", "baseline"],
        description="Types: optimistic | pessimistic | baseline | disruptive"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Constraints to maintain"
    )
    focus_areas: List[str] = Field(
        default_factory=list,
        description="Areas to emphasize"
    )


class Scenario(TaskRunnerOutput):
    """A generated scenario."""

    scenario_id: str = Field(default="", description="Scenario ID")
    scenario_name: str = Field(default="", description="Scenario name")
    scenario_type: str = Field(
        default="baseline",
        description="optimistic | pessimistic | baseline | disruptive"
    )
    narrative: str = Field(default="", description="Scenario narrative")
    key_assumptions: List[str] = Field(
        default_factory=list,
        description="Key assumptions"
    )
    driver_values: Dict[str, str] = Field(
        default_factory=dict,
        description="{driver: expected_value/state}"
    )
    probability: float = Field(default=0.33, description="Estimated probability 0-1")
    impact_level: str = Field(
        default="medium",
        description="low | medium | high | critical"
    )
    key_indicators: List[str] = Field(
        default_factory=list,
        description="Early warning indicators"
    )
    implications: List[str] = Field(
        default_factory=list,
        description="Strategic implications"
    )


class ScenarioOutput(TaskRunnerOutput):
    """Output schema for ScenarioRunner."""

    scenarios: List[Scenario] = Field(
        default_factory=list,
        description="Generated scenarios"
    )
    baseline_scenario: Optional[Scenario] = Field(
        default=None,
        description="Most likely scenario"
    )
    scenario_matrix: Dict[str, Dict[str, str]] = Field(
        default_factory=dict,
        description="Matrix comparing scenarios across drivers"
    )
    critical_uncertainties: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Key uncertainties affecting scenarios"
    )
    scenario_summary: str = Field(default="", description="Summary")
    recommended_focus: str = Field(
        default="",
        description="Which scenario to focus planning on"
    )
    common_elements: List[str] = Field(
        default_factory=list,
        description="Elements common to all scenarios"
    )
    divergent_elements: List[str] = Field(
        default_factory=list,
        description="Elements that differ significantly"
    )


# =============================================================================
# ScenarioRunner Implementation
# =============================================================================

@register_task_runner
class ScenarioRunner(TaskRunner[ScenarioInput, ScenarioOutput]):
    """
    Scenario construction runner.

    This runner generates plausible future scenarios
    for strategic planning and analysis.

    Algorithmic Pattern:
        1. Identify key drivers and uncertainties
        2. Define scenario archetypes
        3. For each scenario type:
           - Set driver values
           - Build coherent narrative
           - Assess probability
           - Identify implications
        4. Find common and divergent elements
        5. Create comparison matrix

    Best Used For:
        - Strategic planning
        - Risk assessment
        - Investment analysis
        - Contingency planning
    """

    runner_id = "scenario"
    name = "Scenario Runner"
    description = "Generate scenario using scenario construction"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "scenario_construction"
    max_duration_seconds = 150

    InputType = ScenarioInput
    OutputType = ScenarioOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ScenarioRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.5,  # Creative for scenarios
            max_tokens=4000,
        )

    async def execute(self, input: ScenarioInput) -> ScenarioOutput:
        """
        Execute scenario generation.

        Args:
            input: Scenario parameters

        Returns:
            ScenarioOutput with scenarios
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            drivers_text = ""
            if input.key_drivers:
                drivers_text = "\nKey drivers:\n" + "\n".join(
                    f"- {d}" for d in input.key_drivers
                )

            constraints_text = ""
            if input.constraints:
                constraints_text = "\nConstraints:\n" + "\n".join(
                    f"- {c}" for c in input.constraints
                )

            focus_text = ""
            if input.focus_areas:
                focus_text = "\nFocus areas: " + ", ".join(input.focus_areas)

            types_text = ", ".join(input.scenario_types)

            system_prompt = f"""You are an expert scenario planner using structured scenario construction.

Your task is to generate plausible future scenarios.

Time horizon: {input.time_horizon}
Scenario types to generate: {types_text}

Scenario construction approach:
1. Identify critical uncertainties:
   - What could go different ways?
   - What has high impact?
2. For each scenario type:
   - optimistic: Best plausible case
   - pessimistic: Worst plausible case
   - baseline: Most likely case
   - disruptive: Black swan / unexpected
3. Build each scenario:
   - Set driver values (how each driver plays out)
   - Create coherent narrative
   - List key assumptions
   - Estimate probability (must sum to ~1)
   - Assess impact level
   - Identify early indicators
   - Note strategic implications
4. Compare scenarios:
   - Find common elements (likely regardless)
   - Find divergent elements (scenario-dependent)
   - Create comparison matrix

Return a structured JSON response with:
- scenarios: Array with:
  - scenario_id: SC1, SC2, etc.
  - scenario_name: Descriptive name
  - scenario_type: optimistic | pessimistic | baseline | disruptive
  - narrative: 3-5 sentence narrative
  - key_assumptions: Assumptions this requires
  - driver_values: {{driver: expected_value}}
  - probability: 0-1 (all should sum to ~1)
  - impact_level: low | medium | high | critical
  - key_indicators: Early warning signs
  - implications: Strategic implications
- scenario_matrix: {{scenario_id: {{driver: value}}}}
- critical_uncertainties: [{{uncertainty, range, impact}}]
- scenario_summary: 2-3 sentence overview
- recommended_focus: Which scenario to plan for
- common_elements: Likely in all scenarios
- divergent_elements: Differ between scenarios"""

            user_prompt = f"""Generate scenarios for this context:

CONTEXT:
{input.context}
{drivers_text}
{constraints_text}
{focus_text}

Generate scenarios and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_scenario_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build scenarios
            scenarios_data = result.get("scenarios", [])
            scenarios = [
                Scenario(
                    scenario_id=s.get("scenario_id", f"SC{idx+1}"),
                    scenario_name=s.get("scenario_name", ""),
                    scenario_type=s.get("scenario_type", "baseline"),
                    narrative=s.get("narrative", ""),
                    key_assumptions=s.get("key_assumptions", []),
                    driver_values=s.get("driver_values", {}),
                    probability=float(s.get("probability", 0.33)),
                    impact_level=s.get("impact_level", "medium"),
                    key_indicators=s.get("key_indicators", []),
                    implications=s.get("implications", []),
                )
                for idx, s in enumerate(scenarios_data)
            ]

            # Find baseline
            baseline = next(
                (s for s in scenarios if s.scenario_type == "baseline"),
                scenarios[0] if scenarios else None
            )

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ScenarioOutput(
                success=True,
                scenarios=scenarios,
                baseline_scenario=baseline,
                scenario_matrix=result.get("scenario_matrix", {}),
                critical_uncertainties=result.get("critical_uncertainties", []),
                scenario_summary=result.get("scenario_summary", ""),
                recommended_focus=result.get("recommended_focus", ""),
                common_elements=result.get("common_elements", []),
                divergent_elements=result.get("divergent_elements", []),
                confidence_score=0.8,
                quality_score=0.8,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ScenarioRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ScenarioOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_scenario_response(self, content: str) -> Dict[str, Any]:
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
                "scenarios": [],
                "scenario_matrix": {},
                "critical_uncertainties": [],
                "scenario_summary": content[:200],
                "recommended_focus": "",
                "common_elements": [],
                "divergent_elements": [],
            }
