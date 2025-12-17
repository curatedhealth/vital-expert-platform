"""
NegotiateRunner - Plan negotiation using BATNA analysis.

Algorithmic Core: BATNA Analysis / Negotiation Planning
- Identifies BATNA (Best Alternative to Negotiated Agreement)
- Maps ZOPA (Zone of Possible Agreement)
- Plans negotiation strategy

Use Cases:
- Contract negotiation
- Salary negotiation
- Partnership deals
- Conflict resolution
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

class NegotiateInput(TaskRunnerInput):
    """Input schema for NegotiateRunner."""

    negotiation_topic: str = Field(
        ...,
        description="What is being negotiated"
    )
    your_position: Dict[str, Any] = Field(
        ...,
        description="Your interests and constraints"
    )
    counterparty_profile: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Counterparty information"
    )
    issues: List[str] = Field(
        default_factory=list,
        description="Issues to negotiate"
    )
    negotiation_style: str = Field(
        default="collaborative",
        description="competitive | collaborative | compromising | accommodating"
    )


class NegotiationIssue(TaskRunnerOutput):
    """An issue in negotiation."""

    issue_id: str = Field(default="", description="Issue ID")
    issue_name: str = Field(default="", description="Issue name")
    your_ideal: str = Field(default="", description="Your ideal outcome")
    your_reservation: str = Field(default="", description="Walk-away point")
    estimated_counterparty_ideal: str = Field(default="", description="Their ideal")
    estimated_counterparty_reservation: str = Field(default="", description="Their walk-away")
    zopa_exists: bool = Field(default=True, description="Is ZOPA possible?")
    priority: str = Field(
        default="medium",
        description="low | medium | high"
    )
    tradeoff_potential: str = Field(
        default="",
        description="Can this be traded?"
    )


class NegotiateOutput(TaskRunnerOutput):
    """Output schema for NegotiateRunner."""

    your_batna: str = Field(
        default="",
        description="Your best alternative if no deal"
    )
    batna_strength: str = Field(
        default="moderate",
        description="weak | moderate | strong"
    )
    estimated_counterparty_batna: str = Field(
        default="",
        description="Their likely BATNA"
    )
    issues_analysis: List[NegotiationIssue] = Field(
        default_factory=list,
        description="Analysis per issue"
    )
    overall_zopa: str = Field(
        default="",
        description="Overall zone of possible agreement"
    )
    opening_position: str = Field(
        default="",
        description="Recommended opening"
    )
    concession_strategy: List[str] = Field(
        default_factory=list,
        description="Planned concessions"
    )
    leverage_points: List[str] = Field(
        default_factory=list,
        description="Your leverage"
    )
    tactics: List[str] = Field(
        default_factory=list,
        description="Recommended tactics"
    )
    potential_impasses: List[str] = Field(
        default_factory=list,
        description="Where deadlock might occur"
    )
    negotiation_summary: str = Field(default="", description="Summary")


# =============================================================================
# NegotiateRunner Implementation
# =============================================================================

@register_task_runner
class NegotiateRunner(TaskRunner[NegotiateInput, NegotiateOutput]):
    """
    BATNA analysis negotiation planning runner.

    This runner plans negotiations using principled
    negotiation concepts.

    Algorithmic Pattern:
        1. Identify your BATNA
        2. Estimate counterparty BATNA
        3. For each issue:
           - Define ideal and reservation points
           - Estimate counterparty points
           - Identify ZOPA
        4. Plan opening position
        5. Design concession strategy
        6. Identify leverage and tactics

    Best Used For:
        - Contract negotiation
        - Deal structuring
        - Conflict resolution
        - Partnership discussions
    """

    runner_id = "negotiate"
    name = "Negotiate Runner"
    description = "Plan negotiation using BATNA analysis"
    category = TaskRunnerCategory.INFLUENCE
    algorithmic_core = "batna_analysis"
    max_duration_seconds = 150

    InputType = NegotiateInput
    OutputType = NegotiateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize NegotiateRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: NegotiateInput) -> NegotiateOutput:
        """
        Execute negotiation planning.

        Args:
            input: Negotiation planning parameters

        Returns:
            NegotiateOutput with negotiation plan
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            position_text = json.dumps(input.your_position, indent=2, default=str)[:1500]

            counterparty_text = ""
            if input.counterparty_profile:
                counterparty_text = "\nCounterparty profile:\n" + json.dumps(
                    input.counterparty_profile, indent=2, default=str
                )[:1500]

            issues_text = ""
            if input.issues:
                issues_text = "\nIssues to negotiate:\n" + "\n".join(
                    f"- {i}" for i in input.issues
                )

            style_instruction = self._get_style_instruction(input.negotiation_style)

            system_prompt = f"""You are an expert negotiator skilled in principled negotiation.

Your task is to plan a negotiation strategy.

Topic: {input.negotiation_topic}
{style_instruction}

Key concepts:
1. BATNA (Best Alternative to Negotiated Agreement):
   - Your plan if no deal is reached
   - Stronger BATNA = more negotiating power
2. Reservation Point:
   - Your walk-away point
   - The minimum you'll accept
3. ZOPA (Zone of Possible Agreement):
   - Overlap between your reservation and theirs
   - If no ZOPA, deal is unlikely
4. Opening Position:
   - Where to start negotiation
   - Usually more ambitious than reservation

Negotiation styles:
- competitive: Win-lose, claim value
- collaborative: Win-win, create value
- compromising: Split difference
- accommodating: Prioritize relationship

Return a structured JSON response with:
- your_batna: Your best alternative
- batna_strength: weak | moderate | strong
- estimated_counterparty_batna: Their likely alternative
- issues_analysis: Array with:
  - issue_id: I1, I2, etc.
  - issue_name: Issue name
  - your_ideal: Best outcome for you
  - your_reservation: Walk-away point
  - estimated_counterparty_ideal: Their best outcome
  - estimated_counterparty_reservation: Their walk-away
  - zopa_exists: true/false
  - priority: low | medium | high
  - tradeoff_potential: Can be traded?
- overall_zopa: Description of overlap
- opening_position: Recommended opening
- concession_strategy: [planned concessions in order]
- leverage_points: [your sources of leverage]
- tactics: [recommended tactics]
- potential_impasses: [where deadlock might occur]
- negotiation_summary: 2-3 sentence summary"""

            user_prompt = f"""Plan negotiation for:

TOPIC: {input.negotiation_topic}

YOUR POSITION:
{position_text}
{counterparty_text}
{issues_text}

Develop negotiation plan and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_negotiate_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build issues analysis
            issues_data = result.get("issues_analysis", [])
            issues_analysis = [
                NegotiationIssue(
                    issue_id=i.get("issue_id", f"I{idx+1}"),
                    issue_name=i.get("issue_name", ""),
                    your_ideal=i.get("your_ideal", ""),
                    your_reservation=i.get("your_reservation", ""),
                    estimated_counterparty_ideal=i.get("estimated_counterparty_ideal", ""),
                    estimated_counterparty_reservation=i.get("estimated_counterparty_reservation", ""),
                    zopa_exists=i.get("zopa_exists", True),
                    priority=i.get("priority", "medium"),
                    tradeoff_potential=i.get("tradeoff_potential", ""),
                )
                for idx, i in enumerate(issues_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return NegotiateOutput(
                success=True,
                your_batna=result.get("your_batna", ""),
                batna_strength=result.get("batna_strength", "moderate"),
                estimated_counterparty_batna=result.get("estimated_counterparty_batna", ""),
                issues_analysis=issues_analysis,
                overall_zopa=result.get("overall_zopa", ""),
                opening_position=result.get("opening_position", ""),
                concession_strategy=result.get("concession_strategy", []),
                leverage_points=result.get("leverage_points", []),
                tactics=result.get("tactics", []),
                potential_impasses=result.get("potential_impasses", []),
                negotiation_summary=result.get("negotiation_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"NegotiateRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return NegotiateOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_style_instruction(self, style: str) -> str:
        """Get style instruction."""
        instructions = {
            "competitive": "Style: Competitive - Focus on claiming value, firm positions.",
            "collaborative": "Style: Collaborative - Focus on creating value, explore interests.",
            "compromising": "Style: Compromising - Split the difference, find middle ground.",
            "accommodating": "Style: Accommodating - Prioritize relationship, flexible on terms.",
        }
        return instructions.get(style, instructions["collaborative"])

    def _parse_negotiate_response(self, content: str) -> Dict[str, Any]:
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
                "your_batna": "",
                "batna_strength": "moderate",
                "estimated_counterparty_batna": "",
                "issues_analysis": [],
                "overall_zopa": "",
                "opening_position": "",
                "concession_strategy": [],
                "leverage_points": [],
                "tactics": [],
                "potential_impasses": [],
                "negotiation_summary": content[:200],
            }
