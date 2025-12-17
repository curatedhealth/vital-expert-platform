"""
StakeholderRunner - Identify stakeholders using power/interest grid.

Algorithmic Core: Stakeholder Analysis / Power-Interest Grid
- Maps stakeholders by power and interest
- Identifies key players and their influence
- Categorizes stakeholder engagement strategies

Use Cases:
- Project stakeholder mapping
- Change management
- Strategic initiative planning
- Organizational alignment
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

class StakeholderInput(TaskRunnerInput):
    """Input schema for StakeholderRunner."""

    initiative: str = Field(
        ...,
        description="Initiative or project to analyze"
    )
    known_stakeholders: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of known stakeholders"
    )
    organizational_context: Optional[str] = Field(
        default=None,
        description="Organizational context"
    )
    analysis_depth: str = Field(
        default="standard",
        description="Depth: quick | standard | comprehensive"
    )


class Stakeholder(TaskRunnerOutput):
    """A stakeholder with power/interest analysis."""

    stakeholder_id: str = Field(default="", description="ID")
    name: str = Field(default="", description="Name")
    role: str = Field(default="", description="Role/title")
    organization: Optional[str] = Field(default=None, description="Organization")
    power_level: str = Field(
        default="medium",
        description="low | medium | high"
    )
    power_score: int = Field(default=50, description="Power score 0-100")
    interest_level: str = Field(
        default="medium",
        description="low | medium | high"
    )
    interest_score: int = Field(default=50, description="Interest score 0-100")
    quadrant: str = Field(
        default="keep_informed",
        description="manage_closely | keep_satisfied | keep_informed | monitor"
    )
    influence_type: str = Field(
        default="neutral",
        description="champion | supporter | neutral | critic | blocker"
    )
    engagement_strategy: str = Field(default="", description="Strategy")
    key_concerns: List[str] = Field(default_factory=list, description="Concerns")


class StakeholderOutput(TaskRunnerOutput):
    """Output schema for StakeholderRunner."""

    stakeholders: List[Stakeholder] = Field(
        default_factory=list,
        description="All identified stakeholders"
    )
    power_interest_grid: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Stakeholders by quadrant"
    )
    key_players: List[str] = Field(
        default_factory=list,
        description="High power, high interest stakeholders"
    )
    potential_champions: List[str] = Field(
        default_factory=list,
        description="Supportive stakeholders to cultivate"
    )
    risk_stakeholders: List[str] = Field(
        default_factory=list,
        description="High power critics/blockers"
    )
    coverage_gaps: List[str] = Field(
        default_factory=list,
        description="Missing stakeholder groups"
    )
    stakeholder_summary: str = Field(default="", description="Summary")


# =============================================================================
# StakeholderRunner Implementation
# =============================================================================

@register_task_runner
class StakeholderRunner(TaskRunner[StakeholderInput, StakeholderOutput]):
    """
    Power/interest grid stakeholder analysis runner.

    This runner maps stakeholders using the classic
    power-interest grid framework.

    Algorithmic Pattern:
        1. Identify all stakeholders
        2. Assess each stakeholder:
           - Power (ability to influence)
           - Interest (level of concern)
        3. Place in quadrant:
           - Manage Closely (high power, high interest)
           - Keep Satisfied (high power, low interest)
           - Keep Informed (low power, high interest)
           - Monitor (low power, low interest)
        4. Define engagement strategy
        5. Identify coverage gaps

    Best Used For:
        - Project planning
        - Change management
        - Strategic initiatives
        - Coalition building
    """

    runner_id = "stakeholder"
    name = "Stakeholder Runner"
    description = "Identify stakeholders using power/interest grid"
    category = TaskRunnerCategory.ALIGN
    algorithmic_core = "power_interest_grid"
    max_duration_seconds = 120

    InputType = StakeholderInput
    OutputType = StakeholderOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize StakeholderRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: StakeholderInput) -> StakeholderOutput:
        """
        Execute stakeholder analysis.

        Args:
            input: Stakeholder analysis parameters

        Returns:
            StakeholderOutput with power-interest mapping
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            known_text = ""
            if input.known_stakeholders:
                known_text = "\nKnown stakeholders:\n" + json.dumps(
                    input.known_stakeholders, indent=2, default=str
                )[:2000]

            context_text = ""
            if input.organizational_context:
                context_text = f"\nOrganizational context: {input.organizational_context}"

            depth_instruction = self._get_depth_instruction(input.analysis_depth)

            system_prompt = f"""You are an expert at stakeholder analysis using the power-interest grid.

Your task is to identify and map stakeholders for an initiative.

{depth_instruction}

Power-Interest Grid Framework:
1. Power = Ability to influence the initiative (resources, authority, expertise)
2. Interest = Level of concern about the initiative (affected by outcomes)

Quadrants:
- manage_closely: High power, high interest - Key players, engage deeply
- keep_satisfied: High power, low interest - Important but not engaged, keep happy
- keep_informed: Low power, high interest - Affected but limited influence, communicate
- monitor: Low power, low interest - Minimal engagement needed

For each stakeholder assess:
- Power level (low/medium/high) and score (0-100)
- Interest level (low/medium/high) and score (0-100)
- Influence type: champion | supporter | neutral | critic | blocker
- Key concerns
- Engagement strategy

Return a structured JSON response with:
- stakeholders: Array with:
  - stakeholder_id: S1, S2, etc.
  - name: Name
  - role: Role/title
  - organization: Organization (if applicable)
  - power_level: low | medium | high
  - power_score: 0-100
  - interest_level: low | medium | high
  - interest_score: 0-100
  - quadrant: manage_closely | keep_satisfied | keep_informed | monitor
  - influence_type: champion | supporter | neutral | critic | blocker
  - engagement_strategy: How to engage
  - key_concerns: [concerns]
- power_interest_grid: {{quadrant: [stakeholder_names]}}
- key_players: Names of high power, high interest
- potential_champions: Supportive stakeholders to cultivate
- risk_stakeholders: High power critics/blockers
- coverage_gaps: Missing stakeholder groups
- stakeholder_summary: 2-3 sentence summary"""

            user_prompt = f"""Analyze stakeholders for this initiative:

INITIATIVE: {input.initiative}
{known_text}
{context_text}

Map stakeholders and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_stakeholder_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build stakeholders
            stakeholders_data = result.get("stakeholders", [])
            stakeholders = [
                Stakeholder(
                    stakeholder_id=s.get("stakeholder_id", f"S{idx+1}"),
                    name=s.get("name", ""),
                    role=s.get("role", ""),
                    organization=s.get("organization"),
                    power_level=s.get("power_level", "medium"),
                    power_score=int(s.get("power_score", 50)),
                    interest_level=s.get("interest_level", "medium"),
                    interest_score=int(s.get("interest_score", 50)),
                    quadrant=s.get("quadrant", "keep_informed"),
                    influence_type=s.get("influence_type", "neutral"),
                    engagement_strategy=s.get("engagement_strategy", ""),
                    key_concerns=s.get("key_concerns", []),
                )
                for idx, s in enumerate(stakeholders_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return StakeholderOutput(
                success=True,
                stakeholders=stakeholders,
                power_interest_grid=result.get("power_interest_grid", {}),
                key_players=result.get("key_players", []),
                potential_champions=result.get("potential_champions", []),
                risk_stakeholders=result.get("risk_stakeholders", []),
                coverage_gaps=result.get("coverage_gaps", []),
                stakeholder_summary=result.get("stakeholder_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"StakeholderRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return StakeholderOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "quick": "Quick: Key stakeholders only (5-8).",
            "standard": "Standard: Comprehensive mapping (8-15).",
            "comprehensive": "Comprehensive: Full analysis (15+).",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_stakeholder_response(self, content: str) -> Dict[str, Any]:
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
                "stakeholders": [],
                "power_interest_grid": {},
                "key_players": [],
                "potential_champions": [],
                "risk_stakeholders": [],
                "coverage_gaps": [],
                "stakeholder_summary": content[:200],
            }
