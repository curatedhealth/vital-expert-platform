"""
ProfileRunner - Profile stakeholder using attribute extraction.

Algorithmic Core: Attribute Extraction / Stakeholder Profiling
- Extracts key attributes from stakeholder information
- Builds comprehensive stakeholder profile
- Identifies communication preferences

Use Cases:
- Stakeholder analysis
- Customer profiling
- Audience segmentation
- Relationship management
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

class ProfileInput(TaskRunnerInput):
    """Input schema for ProfileRunner."""

    stakeholder_info: Dict[str, Any] = Field(
        ...,
        description="Raw stakeholder information"
    )
    profile_depth: str = Field(
        default="standard",
        description="Depth: basic | standard | comprehensive"
    )
    profile_focus: List[str] = Field(
        default_factory=lambda: ["demographics", "role", "preferences", "influence"],
        description="Areas to focus on"
    )
    context: Optional[str] = Field(
        default=None,
        description="Context for profiling"
    )


class StakeholderProfile(TaskRunnerOutput):
    """Complete stakeholder profile."""

    profile_id: str = Field(default="", description="Profile ID")
    name: str = Field(default="", description="Stakeholder name")
    role: str = Field(default="", description="Role/title")
    organization: str = Field(default="", description="Organization")
    stakeholder_type: str = Field(
        default="internal",
        description="internal | external | partner | customer | regulator"
    )
    seniority_level: str = Field(
        default="mid",
        description="entry | mid | senior | executive | c-suite"
    )
    influence_level: str = Field(
        default="medium",
        description="low | medium | high | critical"
    )
    decision_authority: str = Field(
        default="influencer",
        description="approver | decision_maker | influencer | gatekeeper | end_user"
    )
    communication_style: str = Field(
        default="balanced",
        description="analytical | driver | expressive | amiable | balanced"
    )
    preferred_channels: List[str] = Field(
        default_factory=list,
        description="Preferred communication channels"
    )
    key_motivations: List[str] = Field(
        default_factory=list,
        description="What motivates them"
    )
    concerns: List[str] = Field(
        default_factory=list,
        description="Key concerns or pain points"
    )
    relationship_status: str = Field(
        default="neutral",
        description="champion | supporter | neutral | skeptic | detractor"
    )


class ProfileOutput(TaskRunnerOutput):
    """Output schema for ProfileRunner."""

    profile: StakeholderProfile = Field(
        default_factory=StakeholderProfile,
        description="Stakeholder profile"
    )
    key_attributes: Dict[str, Any] = Field(
        default_factory=dict,
        description="Key extracted attributes"
    )
    engagement_recommendations: List[str] = Field(
        default_factory=list,
        description="How to engage this stakeholder"
    )
    potential_allies: List[str] = Field(
        default_factory=list,
        description="Potential aligned stakeholders"
    )
    potential_blockers: List[str] = Field(
        default_factory=list,
        description="Potential conflicts"
    )
    profile_completeness: float = Field(
        default=0,
        description="Profile completeness 0-100"
    )
    information_gaps: List[str] = Field(
        default_factory=list,
        description="Missing information"
    )
    profile_summary: str = Field(default="", description="Summary")


# =============================================================================
# ProfileRunner Implementation
# =============================================================================

@register_task_runner
class ProfileRunner(TaskRunner[ProfileInput, ProfileOutput]):
    """
    Attribute extraction stakeholder profiling runner.

    This runner builds comprehensive stakeholder profiles
    from available information.

    Algorithmic Pattern:
        1. Parse raw stakeholder info
        2. Extract key attributes:
           - Demographics/role
           - Influence and authority
           - Communication preferences
           - Motivations and concerns
        3. Classify stakeholder type
        4. Assess relationship status
        5. Generate engagement recommendations

    Best Used For:
        - Stakeholder analysis
        - Customer profiling
        - Relationship management
        - Engagement planning
    """

    runner_id = "profile"
    name = "Profile Runner"
    description = "Profile stakeholder using attribute extraction"
    category = TaskRunnerCategory.ENGAGE
    algorithmic_core = "attribute_extraction"
    max_duration_seconds = 120

    InputType = ProfileInput
    OutputType = ProfileOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ProfileRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=3500,
        )

    async def execute(self, input: ProfileInput) -> ProfileOutput:
        """
        Execute stakeholder profiling.

        Args:
            input: Profiling parameters

        Returns:
            ProfileOutput with stakeholder profile
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            info_text = json.dumps(input.stakeholder_info, indent=2, default=str)[:2500]

            focus_text = ", ".join(input.profile_focus)
            depth_instruction = self._get_depth_instruction(input.profile_depth)

            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            system_prompt = f"""You are an expert at stakeholder profiling using attribute extraction.

Your task is to build a comprehensive stakeholder profile.

Profile depth: {input.profile_depth}
{depth_instruction}
Profile focus areas: {focus_text}

Attribute extraction approach:
1. Extract basic info:
   - Name, role, organization
   - Stakeholder type (internal/external/partner/customer/regulator)
   - Seniority level
2. Assess influence:
   - Influence level (low/medium/high/critical)
   - Decision authority (approver/decision_maker/influencer/gatekeeper/end_user)
3. Communication profile:
   - Style (analytical/driver/expressive/amiable/balanced)
   - Preferred channels
4. Motivations and concerns:
   - What drives them
   - What worries them
5. Relationship status:
   - champion: Strong advocate
   - supporter: Generally positive
   - neutral: No strong opinion
   - skeptic: Has doubts
   - detractor: Opposes
6. Identify gaps in information

Return a structured JSON response with:
- profile:
  - profile_id: P1
  - name: Name
  - role: Title/role
  - organization: Organization
  - stakeholder_type: internal | external | partner | customer | regulator
  - seniority_level: entry | mid | senior | executive | c-suite
  - influence_level: low | medium | high | critical
  - decision_authority: approver | decision_maker | influencer | gatekeeper | end_user
  - communication_style: analytical | driver | expressive | amiable | balanced
  - preferred_channels: [email, phone, in-person, etc.]
  - key_motivations: [motivations]
  - concerns: [concerns]
  - relationship_status: champion | supporter | neutral | skeptic | detractor
- key_attributes: {{key: value}} extracted attributes
- engagement_recommendations: How to engage
- potential_allies: Potential aligned stakeholders
- potential_blockers: Potential conflicts
- profile_completeness: 0-100
- information_gaps: Missing info
- profile_summary: 2-3 sentence summary"""

            user_prompt = f"""Profile this stakeholder:

STAKEHOLDER INFORMATION:
{info_text}
{context_text}

Build profile and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_profile_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build profile
            profile_data = result.get("profile", {})
            profile = StakeholderProfile(
                profile_id=profile_data.get("profile_id", "P1"),
                name=profile_data.get("name", ""),
                role=profile_data.get("role", ""),
                organization=profile_data.get("organization", ""),
                stakeholder_type=profile_data.get("stakeholder_type", "internal"),
                seniority_level=profile_data.get("seniority_level", "mid"),
                influence_level=profile_data.get("influence_level", "medium"),
                decision_authority=profile_data.get("decision_authority", "influencer"),
                communication_style=profile_data.get("communication_style", "balanced"),
                preferred_channels=profile_data.get("preferred_channels", []),
                key_motivations=profile_data.get("key_motivations", []),
                concerns=profile_data.get("concerns", []),
                relationship_status=profile_data.get("relationship_status", "neutral"),
            )

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ProfileOutput(
                success=True,
                profile=profile,
                key_attributes=result.get("key_attributes", {}),
                engagement_recommendations=result.get("engagement_recommendations", []),
                potential_allies=result.get("potential_allies", []),
                potential_blockers=result.get("potential_blockers", []),
                profile_completeness=float(result.get("profile_completeness", 70)),
                information_gaps=result.get("information_gaps", []),
                profile_summary=result.get("profile_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ProfileRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ProfileOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "basic": "Basic: Key attributes only - name, role, influence.",
            "standard": "Standard: Full profile with motivations and preferences.",
            "comprehensive": "Comprehensive: Deep analysis with all dimensions.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_profile_response(self, content: str) -> Dict[str, Any]:
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
                "profile": {},
                "key_attributes": {},
                "engagement_recommendations": [],
                "potential_allies": [],
                "potential_blockers": [],
                "profile_completeness": 0,
                "information_gaps": [],
                "profile_summary": content[:200],
            }
