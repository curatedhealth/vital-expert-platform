"""
PivotRunner - Generate pivot options using strategic pivoting.

Algorithmic Core: Strategic Pivoting / Option Generation
- Generates pivot alternatives
- Assesses feasibility and impact
- Recommends pivot direction

Use Cases:
- Strategy pivots
- Business model change
- Product repositioning
- Crisis response
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

class PivotInput(TaskRunnerInput):
    """Input schema for PivotRunner."""

    current_state: Dict[str, Any] = Field(
        ...,
        description="Current situation"
    )
    trigger: str = Field(
        ...,
        description="What is triggering the need to pivot"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Constraints to respect"
    )
    pivot_scope: str = Field(
        default="moderate",
        description="Scope: incremental | moderate | radical"
    )
    preserve: List[str] = Field(
        default_factory=list,
        description="What to preserve"
    )


class PivotOption(TaskRunnerOutput):
    """A pivot option."""

    pivot_id: str = Field(default="", description="Pivot ID")
    pivot_name: str = Field(default="", description="Pivot name")
    pivot_type: str = Field(
        default="positioning",
        description="Type: customer | product | channel | positioning | model"
    )
    description: str = Field(default="", description="Description")
    key_changes: List[str] = Field(
        default_factory=list,
        description="What changes"
    )
    preserved_elements: List[str] = Field(
        default_factory=list,
        description="What stays"
    )
    feasibility: str = Field(
        default="medium",
        description="low | medium | high"
    )
    impact_potential: str = Field(
        default="medium",
        description="low | medium | high"
    )
    risk_level: str = Field(
        default="moderate",
        description="low | moderate | high"
    )
    time_to_implement: str = Field(default="", description="Timeline")
    resource_requirements: str = Field(default="", description="Resources")


class PivotOutput(TaskRunnerOutput):
    """Output schema for PivotRunner."""

    pivot_options: List[PivotOption] = Field(
        default_factory=list,
        description="Generated options"
    )
    recommended_pivot: str = Field(
        default="",
        description="Recommended option"
    )
    recommendation_rationale: str = Field(
        default="",
        description="Why recommended"
    )
    pivot_matrix: Dict[str, str] = Field(
        default_factory=dict,
        description="Options by type"
    )
    common_risks: List[str] = Field(
        default_factory=list,
        description="Risks across options"
    )
    success_factors: List[str] = Field(
        default_factory=list,
        description="Critical success factors"
    )
    pivot_summary: str = Field(default="", description="Summary")


# =============================================================================
# PivotRunner Implementation
# =============================================================================

@register_task_runner
class PivotRunner(TaskRunner[PivotInput, PivotOutput]):
    """
    Strategic pivoting option generation runner.

    This runner generates and evaluates pivot options.

    Algorithmic Pattern:
        1. Analyze current state and trigger
        2. Identify pivot types:
           - Customer pivot (different segment)
           - Product pivot (different offering)
           - Channel pivot (different distribution)
           - Positioning pivot (different value prop)
           - Model pivot (different business model)
        3. Generate options per type
        4. Assess feasibility and impact
        5. Recommend best pivot

    Best Used For:
        - Strategy adaptation
        - Business model innovation
        - Product pivots
        - Crisis response
    """

    runner_id = "pivot"
    name = "Pivot Runner"
    description = "Generate pivot options using strategic pivoting"
    category = TaskRunnerCategory.ADAPT
    algorithmic_core = "strategic_pivoting"
    max_duration_seconds = 150

    InputType = PivotInput
    OutputType = PivotOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize PivotRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.5,  # Creative for options
            max_tokens=4000,
        )

    async def execute(self, input: PivotInput) -> PivotOutput:
        """
        Execute pivot option generation.

        Args:
            input: Pivot parameters

        Returns:
            PivotOutput with pivot options
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            state_text = json.dumps(input.current_state, indent=2, default=str)[:2000]

            constraints_text = ""
            if input.constraints:
                constraints_text = "\nConstraints:\n" + "\n".join(
                    f"- {c}" for c in input.constraints
                )

            preserve_text = ""
            if input.preserve:
                preserve_text = "\nElements to preserve:\n" + "\n".join(
                    f"- {p}" for p in input.preserve
                )

            scope_instruction = self._get_scope_instruction(input.pivot_scope)

            system_prompt = f"""You are an expert at strategic pivoting and business adaptation.

Your task is to generate pivot options in response to a trigger.

Trigger: {input.trigger}
{scope_instruction}
{constraints_text}
{preserve_text}

Pivot types to consider:
1. customer: Serve a different customer segment
2. product: Offer a different product/service
3. channel: Use different distribution channels
4. positioning: Change value proposition
5. model: Change business/revenue model

For each option:
- Define what changes
- What stays the same
- Assess feasibility (low/medium/high)
- Assess impact potential (low/medium/high)
- Assess risk level (low/moderate/high)
- Estimate timeline
- Resource requirements

Return a structured JSON response with:
- pivot_options: Array with:
  - pivot_id: PV1, PV2, etc.
  - pivot_name: Descriptive name
  - pivot_type: customer | product | channel | positioning | model
  - description: What this pivot involves
  - key_changes: [what changes]
  - preserved_elements: [what stays]
  - feasibility: low | medium | high
  - impact_potential: low | medium | high
  - risk_level: low | moderate | high
  - time_to_implement: Timeline
  - resource_requirements: Resources needed
- recommended_pivot: Which pivot_id
- recommendation_rationale: Why
- pivot_matrix: {{type: pivot_id}}
- common_risks: [risks across options]
- success_factors: [critical success factors]
- pivot_summary: 2-3 sentence summary"""

            user_prompt = f"""Generate pivot options for:

CURRENT STATE:
{state_text}

TRIGGER: {input.trigger}

Generate options and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_pivot_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build pivot options
            options_data = result.get("pivot_options", [])
            pivot_options = [
                PivotOption(
                    pivot_id=o.get("pivot_id", f"PV{idx+1}"),
                    pivot_name=o.get("pivot_name", ""),
                    pivot_type=o.get("pivot_type", "positioning"),
                    description=o.get("description", ""),
                    key_changes=o.get("key_changes", []),
                    preserved_elements=o.get("preserved_elements", []),
                    feasibility=o.get("feasibility", "medium"),
                    impact_potential=o.get("impact_potential", "medium"),
                    risk_level=o.get("risk_level", "moderate"),
                    time_to_implement=o.get("time_to_implement", ""),
                    resource_requirements=o.get("resource_requirements", ""),
                )
                for idx, o in enumerate(options_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return PivotOutput(
                success=True,
                pivot_options=pivot_options,
                recommended_pivot=result.get("recommended_pivot", ""),
                recommendation_rationale=result.get("recommendation_rationale", ""),
                pivot_matrix=result.get("pivot_matrix", {}),
                common_risks=result.get("common_risks", []),
                success_factors=result.get("success_factors", []),
                pivot_summary=result.get("pivot_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"PivotRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return PivotOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_scope_instruction(self, scope: str) -> str:
        """Get scope instruction."""
        instructions = {
            "incremental": "Scope: Incremental. Small adjustments within current model.",
            "moderate": "Scope: Moderate. Significant changes but retain core.",
            "radical": "Scope: Radical. Major transformation acceptable.",
        }
        return instructions.get(scope, instructions["moderate"])

    def _parse_pivot_response(self, content: str) -> Dict[str, Any]:
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
                "pivot_options": [],
                "recommended_pivot": "",
                "recommendation_rationale": "",
                "pivot_matrix": {},
                "common_risks": [],
                "success_factors": [],
                "pivot_summary": content[:200],
            }
