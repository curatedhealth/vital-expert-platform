"""
TradeoffRunner - Analyze trade-offs using Pareto frontier analysis.

Algorithmic Core: Pareto Frontier Analysis
- Identifies trade-offs between competing objectives
- Maps Pareto-optimal options
- Quantifies what must be sacrificed for gains

Use Cases:
- Cost vs. quality trade-offs
- Speed vs. accuracy decisions
- Risk vs. return analysis
- Resource allocation trade-offs
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

class TradeoffInput(TaskRunnerInput):
    """Input schema for TradeoffRunner."""

    options: List[Dict[str, Any]] = Field(
        ...,
        description="Options to analyze [{name, attributes}]"
    )
    criteria: List[Dict[str, Any]] = Field(
        ...,
        description="Criteria with optimization direction [{name, direction: maximize|minimize}]"
    )
    weights: Optional[Dict[str, float]] = Field(
        default=None,
        description="Optional criteria weights for utility calculation"
    )
    context: Optional[str] = Field(
        default=None,
        description="Decision context for trade-off analysis"
    )


class OptionTradeoff(TaskRunnerOutput):
    """Trade-off profile for a single option."""

    option_name: str = Field(default="", description="Option name")
    criteria_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Score per criterion (normalized 0-1)"
    )
    is_pareto_optimal: bool = Field(default=False, description="On Pareto frontier")
    dominated_by: List[str] = Field(
        default_factory=list,
        description="Options that dominate this one"
    )
    dominates: List[str] = Field(
        default_factory=list,
        description="Options dominated by this one"
    )
    trade_off_summary: str = Field(default="", description="Key trade-offs for this option")


class TradeoffOutput(TaskRunnerOutput):
    """Output schema for TradeoffRunner."""

    tradeoff_matrix: Dict[str, Dict[str, float]] = Field(
        default_factory=dict,
        description="Matrix: {option: {criterion: score}}"
    )
    option_profiles: List[OptionTradeoff] = Field(
        default_factory=list,
        description="Trade-off profile per option"
    )
    pareto_frontier: List[str] = Field(
        default_factory=list,
        description="Pareto-optimal options"
    )
    key_tradeoffs: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Key trade-offs identified"
    )
    criteria_correlations: Dict[str, str] = Field(
        default_factory=dict,
        description="Correlations between criteria"
    )
    sweet_spot_options: List[str] = Field(
        default_factory=list,
        description="Options with balanced trade-offs"
    )
    analysis_summary: str = Field(default="", description="Executive summary")


# =============================================================================
# TradeoffRunner Implementation
# =============================================================================

@register_task_runner
class TradeoffRunner(TaskRunner[TradeoffInput, TradeoffOutput]):
    """
    Pareto frontier trade-off analysis runner.

    This runner analyzes trade-offs between options across multiple
    criteria, identifying Pareto-optimal solutions.

    Algorithmic Pattern:
        1. Normalize scores across criteria
        2. For each option pair, check dominance
        3. Identify Pareto frontier (non-dominated)
        4. Analyze trade-off relationships
        5. Identify criteria correlations
        6. Find balanced "sweet spot" options

    Best Used For:
        - Multi-criteria decisions
        - Resource allocation
        - Portfolio optimization
        - Strategy selection
    """

    runner_id = "tradeoff"
    name = "Trade-off Runner"
    description = "Analyze trade-offs using Pareto frontier analysis"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "pareto_frontier_analysis"
    max_duration_seconds = 120

    InputType = TradeoffInput
    OutputType = TradeoffOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize TradeoffRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: TradeoffInput) -> TradeoffOutput:
        """
        Execute Pareto frontier trade-off analysis.

        Args:
            input: Trade-off parameters including options and criteria

        Returns:
            TradeoffOutput with matrix, Pareto frontier, and analysis
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build context
            options_text = self._format_options(input.options)
            criteria_text = self._format_criteria(input.criteria)

            weights_text = ""
            if input.weights:
                weights_text = f"\nCriteria weights: {input.weights}"

            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            system_prompt = f"""You are an expert analyst performing Pareto frontier analysis.

Your task is to analyze trade-offs between options across multiple criteria.

CRITERIA:
{criteria_text}
{weights_text}

Trade-off analysis approach:
1. Score each option on each criterion (0-1 scale, respecting direction)
2. For each option pair, determine dominance:
   - A dominates B if A is >= B on ALL criteria and > B on at least one
3. Identify Pareto frontier (non-dominated options)
4. Analyze key trade-offs:
   - What do you gain/lose by choosing each option?
   - Which criteria are in tension?
5. Find "sweet spot" options (balanced across criteria)
6. Identify correlations between criteria

Return a structured JSON response with:
- tradeoff_matrix: {{option_name: {{criterion_name: score}}}}
- option_profiles: Array with:
  - option_name: Name
  - criteria_scores: {{criterion: score}}
  - is_pareto_optimal: boolean
  - dominated_by: List of dominating options
  - dominates: List of dominated options
  - trade_off_summary: Key trade-offs for this option
- pareto_frontier: List of Pareto-optimal option names
- key_tradeoffs: Array of {{tradeoff, options_involved, magnitude}}
- criteria_correlations: {{criterion_pair: positive|negative|neutral}}
- sweet_spot_options: Balanced options
- analysis_summary: 2-3 sentence summary"""

            user_prompt = f"""Analyze trade-offs for these options:
{context_text}

OPTIONS:
{options_text}

Perform Pareto analysis and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_tradeoff_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build option profiles
            profiles_data = result.get("option_profiles", [])
            option_profiles = [
                OptionTradeoff(
                    option_name=p.get("option_name", ""),
                    criteria_scores=p.get("criteria_scores", {}),
                    is_pareto_optimal=p.get("is_pareto_optimal", False),
                    dominated_by=p.get("dominated_by", []),
                    dominates=p.get("dominates", []),
                    trade_off_summary=p.get("trade_off_summary", ""),
                )
                for p in profiles_data
            ]

            pareto_frontier = result.get("pareto_frontier", [])

            duration = (datetime.utcnow() - start_time).total_seconds()

            return TradeoffOutput(
                success=True,
                tradeoff_matrix=result.get("tradeoff_matrix", {}),
                option_profiles=option_profiles,
                pareto_frontier=pareto_frontier,
                key_tradeoffs=result.get("key_tradeoffs", []),
                criteria_correlations=result.get("criteria_correlations", {}),
                sweet_spot_options=result.get("sweet_spot_options", []),
                analysis_summary=result.get("analysis_summary", ""),
                confidence_score=0.85,
                quality_score=len(pareto_frontier) / max(len(input.options), 1),
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"TradeoffRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return TradeoffOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_options(self, options: List[Dict[str, Any]]) -> str:
        """Format options for prompt."""
        lines = []
        for i, opt in enumerate(options):
            name = opt.get("name", f"Option {i+1}")
            lines.append(f"**{name}**")
            for key, value in opt.items():
                if key != "name":
                    lines.append(f"  - {key}: {value}")
            lines.append("")
        return "\n".join(lines)

    def _format_criteria(self, criteria: List[Dict[str, Any]]) -> str:
        """Format criteria for prompt."""
        lines = []
        for c in criteria:
            name = c.get("name", "Criterion")
            direction = c.get("direction", "maximize")
            desc = c.get("description", "")
            lines.append(f"- **{name}** ({direction}): {desc}")
        return "\n".join(lines)

    def _parse_tradeoff_response(self, content: str) -> Dict[str, Any]:
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
                "tradeoff_matrix": {},
                "option_profiles": [],
                "pareto_frontier": [],
                "key_tradeoffs": [],
                "criteria_correlations": {},
                "sweet_spot_options": [],
                "analysis_summary": content[:300],
            }
