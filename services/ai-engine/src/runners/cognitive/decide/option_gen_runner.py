"""
OptionGenRunner - Generate alternatives using divergent exploration.

Algorithmic Core: Divergent Exploration
- Generates diverse set of alternatives
- Uses multiple ideation strategies
- Ensures coverage of solution space

Use Cases:
- Strategy option generation
- Product feature ideation
- Market entry alternatives
- Partnership opportunity identification
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

class OptionGenInput(TaskRunnerInput):
    """Input schema for OptionGenRunner."""

    goal: str = Field(..., description="Goal or objective to achieve")
    constraints: List[str] = Field(
        default_factory=list,
        description="Constraints options must satisfy"
    )
    resources: Dict[str, Any] = Field(
        default_factory=dict,
        description="Available resources (budget, time, people)"
    )
    min_options: int = Field(default=5, description="Minimum options to generate")
    max_options: int = Field(default=10, description="Maximum options to generate")
    diversity_mode: str = Field(
        default="balanced",
        description="Mode: conservative | balanced | radical"
    )
    existing_options: List[str] = Field(
        default_factory=list,
        description="Existing options to build upon or differentiate from"
    )


class GeneratedOption(TaskRunnerOutput):
    """A generated strategic option."""

    option_id: str = Field(default="", description="Unique option identifier")
    name: str = Field(default="", description="Option name")
    description: str = Field(default="", description="Detailed description")
    category: str = Field(default="", description="Option category/type")
    approach: str = Field(default="", description="How this option works")
    key_assumptions: List[str] = Field(default_factory=list, description="Key assumptions")
    resource_requirements: Dict[str, Any] = Field(
        default_factory=dict,
        description="Required resources"
    )
    risk_level: str = Field(default="medium", description="low | medium | high")
    time_to_value: str = Field(default="", description="Time to realize value")
    novelty_score: float = Field(default=0.5, description="How novel 0-1")


class OptionGenOutput(TaskRunnerOutput):
    """Output schema for OptionGenRunner."""

    options: List[GeneratedOption] = Field(
        default_factory=list,
        description="Generated options"
    )
    option_categories: List[str] = Field(
        default_factory=list,
        description="Categories represented"
    )
    coverage_assessment: str = Field(
        default="",
        description="How well options cover solution space"
    )
    recommended_shortlist: List[str] = Field(
        default_factory=list,
        description="Top options to evaluate further"
    )
    ideation_methods_used: List[str] = Field(
        default_factory=list,
        description="Methods used for generation"
    )
    gaps_identified: List[str] = Field(
        default_factory=list,
        description="Gaps in option coverage"
    )


# =============================================================================
# OptionGenRunner Implementation
# =============================================================================

@register_task_runner
class OptionGenRunner(TaskRunner[OptionGenInput, OptionGenOutput]):
    """
    Divergent exploration option generation runner.

    This runner generates diverse strategic alternatives using
    multiple ideation strategies to ensure solution space coverage.

    Algorithmic Pattern:
        1. Parse goal and constraints
        2. Apply multiple ideation lenses:
           - Incremental: improve current state
           - Transformative: fundamental change
           - Adjacent: borrow from other domains
           - Contrarian: opposite of conventional
        3. Generate options per lens
        4. Ensure diversity across categories
        5. Assess coverage and identify gaps

    Best Used For:
        - Strategy development
        - Feature ideation
        - Problem solving
        - Opportunity exploration
    """

    runner_id = "option_gen"
    name = "Option Generation Runner"
    description = "Generate alternatives using divergent exploration"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "divergent_exploration"
    max_duration_seconds = 120

    InputType = OptionGenInput
    OutputType = OptionGenOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize OptionGenRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7,  # Higher temperature for creativity
            max_tokens=3000,
        )

    async def execute(self, input: OptionGenInput) -> OptionGenOutput:
        """
        Execute divergent option generation.

        Args:
            input: Generation parameters including goal and constraints

        Returns:
            OptionGenOutput with diverse options
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build context
            constraints_text = ""
            if input.constraints:
                constraints_text = f"\nConstraints:\n" + "\n".join(f"- {c}" for c in input.constraints)

            resources_text = ""
            if input.resources:
                resources_text = f"\nAvailable resources: {input.resources}"

            existing_text = ""
            if input.existing_options:
                existing_text = f"\nExisting options to differentiate from:\n" + "\n".join(
                    f"- {o}" for o in input.existing_options
                )

            diversity_instruction = self._get_diversity_instruction(input.diversity_mode)

            system_prompt = f"""You are an expert strategist generating diverse alternatives.

Your task is to generate {input.min_options}-{input.max_options} distinct options.

{diversity_instruction}

Ideation approach - use multiple lenses:
1. INCREMENTAL: Improve/optimize current state
2. TRANSFORMATIVE: Fundamental change or disruption
3. ADJACENT: Borrow ideas from other industries/domains
4. CONTRARIAN: Opposite of conventional wisdom
5. COMBINATION: Merge multiple approaches

For each option, consider:
- Feasibility given constraints
- Resource requirements
- Risk level
- Time to value
- Novelty/differentiation

Return a structured JSON response with:
- options: Array with:
  - option_id: O1, O2, etc.
  - name: Concise name
  - description: 2-3 sentence description
  - category: incremental | transformative | adjacent | contrarian | combination
  - approach: How it works
  - key_assumptions: List of assumptions
  - resource_requirements: {{budget, time, people, etc.}}
  - risk_level: low | medium | high
  - time_to_value: short-term | medium-term | long-term
  - novelty_score: 0.0-1.0
- option_categories: Categories represented
- coverage_assessment: How well options cover solution space
- recommended_shortlist: Top 3 option IDs for further evaluation
- ideation_methods_used: Methods used
- gaps_identified: Areas not covered"""

            user_prompt = f"""Generate options for this goal:

GOAL: {input.goal}
{constraints_text}
{resources_text}
{existing_text}

Generate {input.min_options}-{input.max_options} diverse options and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_optiongen_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build options
            options_data = result.get("options", [])
            options = [
                GeneratedOption(
                    option_id=o.get("option_id", f"O{i+1}"),
                    name=o.get("name", ""),
                    description=o.get("description", ""),
                    category=o.get("category", ""),
                    approach=o.get("approach", ""),
                    key_assumptions=o.get("key_assumptions", []),
                    resource_requirements=o.get("resource_requirements", {}),
                    risk_level=o.get("risk_level", "medium"),
                    time_to_value=o.get("time_to_value", "medium-term"),
                    novelty_score=float(o.get("novelty_score", 0.5)),
                )
                for i, o in enumerate(options_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return OptionGenOutput(
                success=True,
                options=options,
                option_categories=result.get("option_categories", []),
                coverage_assessment=result.get("coverage_assessment", ""),
                recommended_shortlist=result.get("recommended_shortlist", []),
                ideation_methods_used=result.get("ideation_methods_used", []),
                gaps_identified=result.get("gaps_identified", []),
                confidence_score=0.8,
                quality_score=len(options) / input.max_options,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"OptionGenRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return OptionGenOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_diversity_instruction(self, mode: str) -> str:
        """Get diversity mode instructions."""
        mode_map = {
            "conservative": "Focus on feasible, lower-risk options. Prioritize proven approaches.",
            "balanced": "Mix of safe and innovative options. Balance feasibility with novelty.",
            "radical": "Emphasize breakthrough ideas. Include unconventional, high-risk/high-reward options.",
        }
        return mode_map.get(mode, mode_map["balanced"])

    def _parse_optiongen_response(self, content: str) -> Dict[str, Any]:
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
                "options": [],
                "option_categories": [],
                "coverage_assessment": content[:200],
                "recommended_shortlist": [],
                "ideation_methods_used": [],
                "gaps_identified": [],
            }
