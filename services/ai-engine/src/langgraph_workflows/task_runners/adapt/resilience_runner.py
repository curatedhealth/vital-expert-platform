"""
ResilienceRunner - Build resilience using stress testing.

Algorithmic Core: Stress Testing / Resilience Assessment
- Tests system against stress scenarios
- Identifies vulnerabilities
- Recommends resilience measures

Use Cases:
- Business continuity
- Risk management
- System resilience
- Crisis preparedness
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

class ResilienceInput(TaskRunnerInput):
    """Input schema for ResilienceRunner."""

    system_description: str = Field(
        ...,
        description="System/organization to test"
    )
    critical_functions: List[str] = Field(
        default_factory=list,
        description="Critical functions to protect"
    )
    stress_scenarios: List[str] = Field(
        default_factory=list,
        description="Scenarios to test (or auto-generate)"
    )
    resilience_dimensions: List[str] = Field(
        default_factory=lambda: ["operational", "financial", "reputational", "technical"],
        description="Dimensions to assess"
    )


class StressScenario(TaskRunnerOutput):
    """A stress test scenario."""

    scenario_id: str = Field(default="", description="Scenario ID")
    scenario_name: str = Field(default="", description="Scenario name")
    scenario_type: str = Field(
        default="operational",
        description="operational | financial | reputational | technical | external"
    )
    description: str = Field(default="", description="Description")
    likelihood: str = Field(
        default="possible",
        description="unlikely | possible | likely | highly_likely"
    )
    impact_severity: str = Field(
        default="moderate",
        description="minor | moderate | major | catastrophic"
    )
    functions_affected: List[str] = Field(
        default_factory=list,
        description="Which functions impacted"
    )
    current_resilience: str = Field(
        default="moderate",
        description="low | moderate | high"
    )
    vulnerabilities: List[str] = Field(
        default_factory=list,
        description="Exposed vulnerabilities"
    )


class ResilienceOutput(TaskRunnerOutput):
    """Output schema for ResilienceRunner."""

    stress_scenarios: List[StressScenario] = Field(
        default_factory=list,
        description="Tested scenarios"
    )
    overall_resilience_score: float = Field(
        default=0,
        description="Overall score 0-100"
    )
    resilience_by_dimension: Dict[str, float] = Field(
        default_factory=dict,
        description="Score per dimension"
    )
    critical_vulnerabilities: List[str] = Field(
        default_factory=list,
        description="High-priority vulnerabilities"
    )
    resilience_strengths: List[str] = Field(
        default_factory=list,
        description="Current strengths"
    )
    recommended_measures: List[str] = Field(
        default_factory=list,
        description="Resilience measures"
    )
    priority_actions: List[str] = Field(
        default_factory=list,
        description="Top actions to take"
    )
    resilience_summary: str = Field(default="", description="Summary")


# =============================================================================
# ResilienceRunner Implementation
# =============================================================================

@register_task_runner
class ResilienceRunner(TaskRunner[ResilienceInput, ResilienceOutput]):
    """
    Stress testing resilience assessment runner.

    This runner tests systems against stress scenarios
    and recommends resilience measures.

    Algorithmic Pattern:
        1. Identify critical functions
        2. Generate/use stress scenarios
        3. Test each scenario:
           - Impact on functions
           - Current resilience
           - Vulnerabilities exposed
        4. Score overall resilience
        5. Identify priority improvements
        6. Recommend measures

    Best Used For:
        - Business continuity
        - Risk management
        - Crisis preparedness
        - System design
    """

    runner_id = "resilience"
    name = "Resilience Runner"
    description = "Build resilience using stress testing"
    category = TaskRunnerCategory.ADAPT
    algorithmic_core = "stress_testing"
    max_duration_seconds = 150

    InputType = ResilienceInput
    OutputType = ResilienceOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ResilienceRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4500,
        )

    async def execute(self, input: ResilienceInput) -> ResilienceOutput:
        """
        Execute resilience assessment.

        Args:
            input: Resilience assessment parameters

        Returns:
            ResilienceOutput with stress test results
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            functions_text = ""
            if input.critical_functions:
                functions_text = "\nCritical functions:\n" + "\n".join(
                    f"- {f}" for f in input.critical_functions
                )

            scenarios_text = ""
            if input.stress_scenarios:
                scenarios_text = "\nScenarios to test:\n" + "\n".join(
                    f"- {s}" for s in input.stress_scenarios
                )
            else:
                scenarios_text = "\nGenerate 4-6 relevant stress scenarios."

            dimensions_text = ", ".join(input.resilience_dimensions)

            system_prompt = f"""You are an expert at resilience assessment and stress testing.

Your task is to test a system against stress scenarios.

Resilience dimensions: {dimensions_text}

Stress testing approach:
1. Scenario types:
   - operational: Process failures, capacity issues
   - financial: Cash flow, market shocks
   - reputational: PR crisis, customer trust
   - technical: System failures, cyber attacks
   - external: Regulatory, market, environmental
2. For each scenario:
   - Assess likelihood
   - Assess impact severity
   - Identify affected functions
   - Rate current resilience
   - Identify vulnerabilities
3. Score overall resilience:
   - 80-100: High resilience
   - 60-79: Moderate resilience
   - 40-59: Low resilience
   - <40: Critical vulnerability
4. Recommend measures

Return a structured JSON response with:
- stress_scenarios: Array with:
  - scenario_id: SS1, SS2, etc.
  - scenario_name: Name
  - scenario_type: operational | financial | reputational | technical | external
  - description: Description
  - likelihood: unlikely | possible | likely | highly_likely
  - impact_severity: minor | moderate | major | catastrophic
  - functions_affected: [functions]
  - current_resilience: low | moderate | high
  - vulnerabilities: [vulnerabilities exposed]
- overall_resilience_score: 0-100
- resilience_by_dimension: {{dimension: score}}
- critical_vulnerabilities: [high priority]
- resilience_strengths: [current strengths]
- recommended_measures: [resilience measures]
- priority_actions: [top 3-5 actions]
- resilience_summary: 2-3 sentence summary"""

            user_prompt = f"""Assess resilience for:

SYSTEM: {input.system_description}
{functions_text}
{scenarios_text}

Perform stress testing and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_resilience_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build stress scenarios
            scenarios_data = result.get("stress_scenarios", [])
            stress_scenarios = [
                StressScenario(
                    scenario_id=s.get("scenario_id", f"SS{idx+1}"),
                    scenario_name=s.get("scenario_name", ""),
                    scenario_type=s.get("scenario_type", "operational"),
                    description=s.get("description", ""),
                    likelihood=s.get("likelihood", "possible"),
                    impact_severity=s.get("impact_severity", "moderate"),
                    functions_affected=s.get("functions_affected", []),
                    current_resilience=s.get("current_resilience", "moderate"),
                    vulnerabilities=s.get("vulnerabilities", []),
                )
                for idx, s in enumerate(scenarios_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ResilienceOutput(
                success=True,
                stress_scenarios=stress_scenarios,
                overall_resilience_score=float(result.get("overall_resilience_score", 60)),
                resilience_by_dimension=result.get("resilience_by_dimension", {}),
                critical_vulnerabilities=result.get("critical_vulnerabilities", []),
                resilience_strengths=result.get("resilience_strengths", []),
                recommended_measures=result.get("recommended_measures", []),
                priority_actions=result.get("priority_actions", []),
                resilience_summary=result.get("resilience_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ResilienceRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ResilienceOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_resilience_response(self, content: str) -> Dict[str, Any]:
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
                "stress_scenarios": [],
                "overall_resilience_score": 0,
                "resilience_by_dimension": {},
                "critical_vulnerabilities": [],
                "resilience_strengths": [],
                "recommended_measures": [],
                "priority_actions": [],
                "resilience_summary": content[:200],
            }
