"""
ContextRunner - Gather context using information aggregation.

Algorithmic Core: Information Aggregation
- Collects and organizes relevant context
- Identifies key facts, relationships, and history
- Structures context for downstream consumption

Use Cases:
- Meeting preparation
- Stakeholder briefing context
- Project situation awareness
- Decision context gathering
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

class ContextInput(TaskRunnerInput):
    """Input schema for ContextRunner."""

    event_description: str = Field(
        ...,
        description="Description of event/meeting/situation"
    )
    purpose: str = Field(
        default="",
        description="Purpose of gathering context"
    )
    stakeholders: List[str] = Field(
        default_factory=list,
        description="Key stakeholders involved"
    )
    background_info: Dict[str, Any] = Field(
        default_factory=dict,
        description="Available background information"
    )
    time_horizon: str = Field(
        default="recent",
        description="Time focus: recent | historical | future"
    )
    context_depth: str = Field(
        default="standard",
        description="Depth: quick | standard | comprehensive"
    )


class Stakeholder(TaskRunnerOutput):
    """Information about a stakeholder."""

    name: str = Field(default="", description="Stakeholder name/role")
    role: str = Field(default="", description="Role in this context")
    interests: List[str] = Field(default_factory=list, description="Key interests")
    concerns: List[str] = Field(default_factory=list, description="Likely concerns")
    relationship: str = Field(default="", description="Relationship to situation")
    influence_level: str = Field(default="medium", description="low | medium | high")


class ContextFact(TaskRunnerOutput):
    """A single contextual fact."""

    fact: str = Field(default="", description="The fact")
    category: str = Field(
        default="",
        description="background | current | relationship | constraint | opportunity"
    )
    relevance: str = Field(default="high", description="low | medium | high")
    source: str = Field(default="", description="Source of this fact")
    time_reference: str = Field(default="", description="When this applies")


class ContextOutput(TaskRunnerOutput):
    """Output schema for ContextRunner."""

    context_summary: str = Field(default="", description="Executive summary")
    facts: List[ContextFact] = Field(
        default_factory=list,
        description="Key contextual facts"
    )
    stakeholder_profiles: List[Stakeholder] = Field(
        default_factory=list,
        description="Stakeholder analysis"
    )
    timeline: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Relevant timeline [{date, event}]"
    )
    relationships: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Key relationships [{from, to, nature}]"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Constraints identified"
    )
    opportunities: List[str] = Field(
        default_factory=list,
        description="Opportunities identified"
    )
    gaps_in_context: List[str] = Field(
        default_factory=list,
        description="Information gaps noted"
    )
    context_package: Dict[str, Any] = Field(
        default_factory=dict,
        description="Structured context for downstream use"
    )


# =============================================================================
# ContextRunner Implementation
# =============================================================================

@register_task_runner
class ContextRunner(TaskRunner[ContextInput, ContextOutput]):
    """
    Information aggregation context gathering runner.

    This runner collects and organizes relevant context for
    meetings, decisions, and stakeholder interactions.

    Algorithmic Pattern:
        1. Parse event/situation description
        2. Identify relevant context dimensions
        3. Extract and organize facts
        4. Profile stakeholders
        5. Build timeline and relationships
        6. Package for downstream use

    Best Used For:
        - Meeting preparation
        - Briefing context
        - Situation awareness
        - Stakeholder engagement prep
    """

    runner_id = "context"
    name = "Context Runner"
    description = "Gather context using information aggregation"
    category = TaskRunnerCategory.PREPARE
    algorithmic_core = "information_aggregation"
    max_duration_seconds = 90

    InputType = ContextInput
    OutputType = ContextOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ContextRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: ContextInput) -> ContextOutput:
        """
        Execute context gathering.

        Args:
            input: Context parameters

        Returns:
            ContextOutput with aggregated context
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            purpose_text = ""
            if input.purpose:
                purpose_text = f"\nPurpose: {input.purpose}"

            stakeholders_text = ""
            if input.stakeholders:
                stakeholders_text = f"\nStakeholders: {', '.join(input.stakeholders)}"

            background_text = ""
            if input.background_info:
                import json
                background_text = f"\nBackground:\n{json.dumps(input.background_info, indent=2, default=str)[:1500]}"

            depth_instruction = self._get_depth_instruction(input.context_depth)

            system_prompt = f"""You are an expert at gathering and organizing context.

Your task is to aggregate relevant context for a situation.

Time focus: {input.time_horizon}
{depth_instruction}

Context gathering approach:
1. Identify key contextual dimensions:
   - Background: History, precedents
   - Current: Present state, active issues
   - Relationships: Who connects to whom, how
   - Constraints: Limitations, requirements
   - Opportunities: Openings, leverage points
2. Profile each stakeholder:
   - Their role and interests
   - Likely concerns
   - Influence level
3. Build timeline of relevant events
4. Map key relationships
5. Note information gaps

Return a structured JSON response with:
- context_summary: 3-4 sentence executive summary
- facts: Array with:
  - fact: The fact
  - category: background | current | relationship | constraint | opportunity
  - relevance: low | medium | high
  - source: Where this comes from
  - time_reference: When applicable
- stakeholder_profiles: Array with:
  - name: Name/role
  - role: Role in context
  - interests: List
  - concerns: List
  - relationship: To situation
  - influence_level: low | medium | high
- timeline: Array of {{date, event}}
- relationships: Array of {{from, to, nature}}
- constraints: List of constraints
- opportunities: List of opportunities
- gaps_in_context: What information is missing
- context_package: Structured summary {{situation, key_players, status, risks, next_steps}}"""

            user_prompt = f"""Gather context for this situation:

EVENT/SITUATION:
{input.event_description}
{purpose_text}
{stakeholders_text}
{background_text}

Aggregate context and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_context_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build facts
            facts_data = result.get("facts", [])
            facts = [
                ContextFact(
                    fact=f.get("fact", ""),
                    category=f.get("category", "background"),
                    relevance=f.get("relevance", "medium"),
                    source=f.get("source", ""),
                    time_reference=f.get("time_reference", ""),
                )
                for f in facts_data
            ]

            # Build stakeholder profiles
            profiles_data = result.get("stakeholder_profiles", [])
            profiles = [
                Stakeholder(
                    name=p.get("name", ""),
                    role=p.get("role", ""),
                    interests=p.get("interests", []),
                    concerns=p.get("concerns", []),
                    relationship=p.get("relationship", ""),
                    influence_level=p.get("influence_level", "medium"),
                )
                for p in profiles_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ContextOutput(
                success=True,
                context_summary=result.get("context_summary", ""),
                facts=facts,
                stakeholder_profiles=profiles,
                timeline=result.get("timeline", []),
                relationships=result.get("relationships", []),
                constraints=result.get("constraints", []),
                opportunities=result.get("opportunities", []),
                gaps_in_context=result.get("gaps_in_context", []),
                context_package=result.get("context_package", {}),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ContextRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ContextOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get instruction based on context depth."""
        instructions = {
            "quick": "Quick context: Focus on 3-5 most critical facts. Essential stakeholders only.",
            "standard": "Standard context: 8-12 facts across categories. Full stakeholder profiles.",
            "comprehensive": "Comprehensive context: 15+ facts, deep stakeholder analysis, full timeline.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_context_response(self, content: str) -> Dict[str, Any]:
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
                "context_summary": content[:200],
                "facts": [],
                "stakeholder_profiles": [],
                "timeline": [],
                "relationships": [],
                "constraints": [],
                "opportunities": [],
                "gaps_in_context": [],
                "context_package": {},
            }
