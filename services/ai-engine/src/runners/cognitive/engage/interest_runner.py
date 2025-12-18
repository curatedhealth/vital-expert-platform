"""
InterestRunner - Map interests using interest analysis.

Algorithmic Core: Interest Analysis / Motivation Mapping
- Identifies stakeholder interests and motivations
- Maps alignment with project/initiative
- Identifies potential conflicts

Use Cases:
- Stakeholder mapping
- Coalition building
- Negotiation prep
- Change management
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

class InterestInput(TaskRunnerInput):
    """Input schema for InterestRunner."""

    profile: Dict[str, Any] = Field(
        ...,
        description="Stakeholder profile"
    )
    initiative: Optional[str] = Field(
        default=None,
        description="Initiative/project to analyze interests against"
    )
    interest_dimensions: List[str] = Field(
        default_factory=lambda: ["professional", "personal", "organizational", "political"],
        description="Dimensions to analyze"
    )
    depth: str = Field(
        default="standard",
        description="Depth: quick | standard | deep"
    )


class Interest(TaskRunnerOutput):
    """A stakeholder interest."""

    interest_id: str = Field(default="", description="Interest ID")
    interest_name: str = Field(default="", description="Interest name")
    dimension: str = Field(
        default="professional",
        description="professional | personal | organizational | political | financial"
    )
    importance: str = Field(
        default="medium",
        description="low | medium | high | critical"
    )
    description: str = Field(default="", description="Interest description")
    underlying_need: str = Field(default="", description="Underlying need")
    alignment_with_initiative: str = Field(
        default="neutral",
        description="aligned | neutral | conflicting"
    )
    leverage_opportunity: Optional[str] = Field(
        default=None,
        description="How to leverage this interest"
    )


class InterestOutput(TaskRunnerOutput):
    """Output schema for InterestRunner."""

    interests: List[Interest] = Field(
        default_factory=list,
        description="Identified interests"
    )
    primary_interests: List[Interest] = Field(
        default_factory=list,
        description="Top priority interests"
    )
    interest_map: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Interests by dimension {dimension: [interest_names]}"
    )
    alignment_score: float = Field(
        default=0,
        description="Overall alignment with initiative 0-100"
    )
    aligned_interests: List[str] = Field(
        default_factory=list,
        description="Interests aligned with initiative"
    )
    conflicting_interests: List[str] = Field(
        default_factory=list,
        description="Interests conflicting with initiative"
    )
    negotiation_levers: List[str] = Field(
        default_factory=list,
        description="Levers for negotiation"
    )
    win_win_opportunities: List[str] = Field(
        default_factory=list,
        description="Win-win opportunities"
    )
    interest_summary: str = Field(default="", description="Summary")


# =============================================================================
# InterestRunner Implementation
# =============================================================================

@register_task_runner
class InterestRunner(TaskRunner[InterestInput, InterestOutput]):
    """
    Interest analysis motivation mapping runner.

    This runner analyzes stakeholder interests and
    maps alignment with initiatives.

    Algorithmic Pattern:
        1. Parse stakeholder profile
        2. Identify interests across dimensions:
           - Professional (career, expertise)
           - Personal (values, work-life)
           - Organizational (company goals)
           - Political (power, relationships)
           - Financial (budget, resources)
        3. Assess each interest:
           - Importance level
           - Underlying need
           - Alignment with initiative
        4. Identify negotiation levers
        5. Find win-win opportunities

    Best Used For:
        - Stakeholder mapping
        - Coalition building
        - Negotiation prep
        - Influence strategy
    """

    runner_id = "interest"
    name = "Interest Runner"
    description = "Map interests using interest analysis"
    category = TaskRunnerCategory.ENGAGE
    algorithmic_core = "interest_analysis"
    max_duration_seconds = 120

    InputType = InterestInput
    OutputType = InterestOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize InterestRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=3500,
        )

    async def execute(self, input: InterestInput) -> InterestOutput:
        """
        Execute interest analysis.

        Args:
            input: Interest analysis parameters

        Returns:
            InterestOutput with interest map
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            profile_text = json.dumps(input.profile, indent=2, default=str)[:2500]

            initiative_text = ""
            if input.initiative:
                initiative_text = f"\nInitiative to analyze against: {input.initiative}"

            dimensions_text = ", ".join(input.interest_dimensions)
            depth_instruction = self._get_depth_instruction(input.depth)

            system_prompt = f"""You are an expert at stakeholder interest analysis.

Your task is to map stakeholder interests and motivations.

Interest dimensions: {dimensions_text}
{depth_instruction}

Interest analysis approach:
1. For each dimension, identify interests:
   - professional: Career goals, expertise, reputation
   - personal: Values, work-life balance, recognition
   - organizational: Company goals, team success
   - political: Power, relationships, influence
   - financial: Budget, resources, ROI
2. For each interest:
   - Assess importance
   - Identify underlying need
   - If initiative provided, assess alignment
3. Identify:
   - Primary (critical) interests
   - Aligned interests (leverage these)
   - Conflicting interests (address these)
4. Find:
   - Negotiation levers (what to offer)
   - Win-win opportunities

Return a structured JSON response with:
- interests: Array with:
  - interest_id: I1, I2, etc.
  - interest_name: Name
  - dimension: professional | personal | organizational | political | financial
  - importance: low | medium | high | critical
  - description: Description
  - underlying_need: What need does this serve
  - alignment_with_initiative: aligned | neutral | conflicting
  - leverage_opportunity: How to leverage
- interest_map: {{dimension: [interest_names]}}
- alignment_score: 0-100 (if initiative provided)
- aligned_interests: Interest names that align
- conflicting_interests: Interest names that conflict
- negotiation_levers: Things to offer
- win_win_opportunities: Mutual benefit opportunities
- interest_summary: 2-3 sentence summary"""

            user_prompt = f"""Analyze interests for this stakeholder:

STAKEHOLDER PROFILE:
{profile_text}
{initiative_text}

Map interests and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_interest_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build interests
            interests_data = result.get("interests", [])
            interests = [
                Interest(
                    interest_id=i.get("interest_id", f"I{idx+1}"),
                    interest_name=i.get("interest_name", ""),
                    dimension=i.get("dimension", "professional"),
                    importance=i.get("importance", "medium"),
                    description=i.get("description", ""),
                    underlying_need=i.get("underlying_need", ""),
                    alignment_with_initiative=i.get("alignment_with_initiative", "neutral"),
                    leverage_opportunity=i.get("leverage_opportunity"),
                )
                for idx, i in enumerate(interests_data)
            ]

            # Filter primary interests
            primary = [i for i in interests if i.importance in ["high", "critical"]]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return InterestOutput(
                success=True,
                interests=interests,
                primary_interests=primary,
                interest_map=result.get("interest_map", {}),
                alignment_score=float(result.get("alignment_score", 50)),
                aligned_interests=result.get("aligned_interests", []),
                conflicting_interests=result.get("conflicting_interests", []),
                negotiation_levers=result.get("negotiation_levers", []),
                win_win_opportunities=result.get("win_win_opportunities", []),
                interest_summary=result.get("interest_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"InterestRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return InterestOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "quick": "Quick: Top 3-5 interests only.",
            "standard": "Standard: Comprehensive interest mapping.",
            "deep": "Deep: Detailed analysis with underlying needs.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_interest_response(self, content: str) -> Dict[str, Any]:
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
                "interests": [],
                "interest_map": {},
                "alignment_score": 0,
                "aligned_interests": [],
                "conflicting_interests": [],
                "negotiation_levers": [],
                "win_win_opportunities": [],
                "interest_summary": content[:200],
            }
