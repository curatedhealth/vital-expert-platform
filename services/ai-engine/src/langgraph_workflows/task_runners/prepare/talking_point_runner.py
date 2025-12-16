"""
TalkingPointRunner - Extract key messages using salience extraction.

Algorithmic Core: Salience Extraction
- Identifies most important messages from brief
- Distills into memorable talking points
- Prioritizes for different scenarios

Use Cases:
- Speech preparation
- Media talking points
- Investor pitch points
- Internal communication
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

class TalkingPointInput(TaskRunnerInput):
    """Input schema for TalkingPointRunner."""

    brief: Dict[str, Any] = Field(
        ...,
        description="Brief output from BriefRunner"
    )
    scenario: str = Field(
        default="general",
        description="Scenario: general | media | investor | internal | regulatory"
    )
    time_limit: str = Field(
        default="3_minutes",
        description="Speaking time: 30_seconds | 1_minute | 3_minutes | 5_minutes"
    )
    audience_familiarity: str = Field(
        default="moderate",
        description="Audience familiarity: none | moderate | expert"
    )
    emphasis: List[str] = Field(
        default_factory=list,
        description="Topics to emphasize"
    )


class TalkingPoint(TaskRunnerOutput):
    """A single talking point."""

    point_id: str = Field(default="", description="Unique point ID")
    message: str = Field(default="", description="The talking point")
    supporting_fact: str = Field(default="", description="Supporting evidence")
    elaboration: str = Field(default="", description="If asked to expand")
    time_to_deliver: int = Field(default=15, description="Seconds to deliver")
    priority: int = Field(default=1, description="Priority 1-5 (1=highest)")
    scenario_fit: List[str] = Field(
        default_factory=list,
        description="Scenarios where this fits"
    )
    emotional_tone: str = Field(
        default="confident",
        description="confident | cautious | enthusiastic | measured"
    )
    transition_phrase: str = Field(default="", description="How to transition to this")


class TalkingPointOutput(TaskRunnerOutput):
    """Output schema for TalkingPointRunner."""

    talking_points: List[TalkingPoint] = Field(
        default_factory=list,
        description="All talking points"
    )
    must_say: List[TalkingPoint] = Field(
        default_factory=list,
        description="Essential points (top 3)"
    )
    nice_to_say: List[TalkingPoint] = Field(
        default_factory=list,
        description="If time permits"
    )
    elevator_pitch: str = Field(
        default="",
        description="30-second version"
    )
    one_minute_version: str = Field(
        default="",
        description="1-minute version"
    )
    full_version: str = Field(
        default="",
        description="Full talking points script"
    )
    total_time_seconds: int = Field(default=0, description="Total delivery time")
    bridge_phrases: List[str] = Field(
        default_factory=list,
        description="Phrases to redirect conversation"
    )
    things_to_avoid: List[str] = Field(
        default_factory=list,
        description="What not to say"
    )


# =============================================================================
# TalkingPointRunner Implementation
# =============================================================================

@register_task_runner
class TalkingPointRunner(TaskRunner[TalkingPointInput, TalkingPointOutput]):
    """
    Salience extraction talking point runner.

    This runner extracts the most important messages from a brief
    and formats them as deliverable talking points.

    Algorithmic Pattern:
        1. Analyze brief for key messages
        2. Apply salience scoring:
           - Importance to objective
           - Memorability
           - Audience relevance
        3. Prioritize and rank points
        4. Add supporting facts
        5. Generate time-based versions
        6. Create bridge phrases

    Best Used For:
        - Speech preparation
        - Media appearances
        - Pitch preparation
        - Communication training
    """

    runner_id = "talking_point"
    name = "Talking Point Runner"
    description = "Extract key messages using salience extraction"
    category = TaskRunnerCategory.PREPARE
    algorithmic_core = "salience_extraction"
    max_duration_seconds = 90

    InputType = TalkingPointInput
    OutputType = TalkingPointOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize TalkingPointRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=3000,
        )

    async def execute(self, input: TalkingPointInput) -> TalkingPointOutput:
        """
        Execute talking point extraction.

        Args:
            input: Talking point parameters

        Returns:
            TalkingPointOutput with talking points
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            brief_text = json.dumps(input.brief, indent=2, default=str)[:2500]

            time_budget = self._get_time_budget(input.time_limit)

            emphasis_text = ""
            if input.emphasis:
                emphasis_text = f"\nEmphasize: {', '.join(input.emphasis)}"

            scenario_instruction = self._get_scenario_instruction(input.scenario)

            system_prompt = f"""You are an expert at crafting compelling talking points.

Your task is to extract the most salient messages from a brief.

Scenario: {input.scenario}
Time limit: {input.time_limit} ({time_budget} seconds)
Audience familiarity: {input.audience_familiarity}

{scenario_instruction}

Salience extraction approach:
1. Identify the 5-7 most important messages
2. Score each by:
   - Importance to objective (weight: 40%)
   - Memorability (weight: 30%)
   - Audience relevance (weight: 30%)
3. Prioritize top messages
4. For each talking point:
   - Craft a clear, memorable statement
   - Add one supporting fact
   - Write an elaboration (if asked)
   - Suggest emotional tone
   - Add transition phrase
5. Create time-based versions:
   - Elevator pitch (30s): Just the BLUF
   - One minute: Top 3 points
   - Full version: All points with elaboration

Return a structured JSON response with:
- talking_points: Array with:
  - point_id: TP1, TP2, etc.
  - message: The talking point (1-2 sentences)
  - supporting_fact: Evidence
  - elaboration: If asked to expand
  - time_to_deliver: Seconds
  - priority: 1-5
  - scenario_fit: Where this fits
  - emotional_tone: confident | cautious | enthusiastic | measured
  - transition_phrase: How to lead in
- elevator_pitch: 30-second version (text)
- one_minute_version: 1-minute script (text)
- full_version: Full script (text)
- total_time_seconds: Sum of delivery times
- bridge_phrases: Phrases to redirect
- things_to_avoid: What not to say"""

            user_prompt = f"""Extract talking points from this brief:

BRIEF:
{brief_text}
{emphasis_text}

Extract talking points and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_talking_point_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build talking points
            points_data = result.get("talking_points", [])
            talking_points = [
                TalkingPoint(
                    point_id=p.get("point_id", f"TP{i+1}"),
                    message=p.get("message", ""),
                    supporting_fact=p.get("supporting_fact", ""),
                    elaboration=p.get("elaboration", ""),
                    time_to_deliver=int(p.get("time_to_deliver", 15)),
                    priority=int(p.get("priority", i+1)),
                    scenario_fit=p.get("scenario_fit", []),
                    emotional_tone=p.get("emotional_tone", "confident"),
                    transition_phrase=p.get("transition_phrase", ""),
                )
                for i, p in enumerate(points_data)
            ]

            # Sort by priority
            talking_points.sort(key=lambda x: x.priority)

            # Split must-say vs nice-to-say
            must_say = [p for p in talking_points if p.priority <= 3]
            nice_to_say = [p for p in talking_points if p.priority > 3]

            total_time = sum(p.time_to_deliver for p in talking_points)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return TalkingPointOutput(
                success=True,
                talking_points=talking_points,
                must_say=must_say,
                nice_to_say=nice_to_say,
                elevator_pitch=result.get("elevator_pitch", ""),
                one_minute_version=result.get("one_minute_version", ""),
                full_version=result.get("full_version", ""),
                total_time_seconds=result.get("total_time_seconds", total_time),
                bridge_phrases=result.get("bridge_phrases", []),
                things_to_avoid=result.get("things_to_avoid", []),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"TalkingPointRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return TalkingPointOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_time_budget(self, time_limit: str) -> int:
        """Get time budget in seconds."""
        budgets = {
            "30_seconds": 30,
            "1_minute": 60,
            "3_minutes": 180,
            "5_minutes": 300,
        }
        return budgets.get(time_limit, 180)

    def _get_scenario_instruction(self, scenario: str) -> str:
        """Get scenario-specific instruction."""
        instructions = {
            "general": "General scenario: Balanced, professional talking points.",
            "media": "Media scenario: Quotable, sound-bite ready. Avoid jargon. Be concise.",
            "investor": "Investor scenario: Focus on value, growth, risk mitigation. Confident tone.",
            "internal": "Internal scenario: Can be more detailed. Include context team needs.",
            "regulatory": "Regulatory scenario: Precise, factual. Avoid speculation. Cite evidence.",
        }
        return instructions.get(scenario, instructions["general"])

    def _parse_talking_point_response(self, content: str) -> Dict[str, Any]:
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
                "talking_points": [],
                "elevator_pitch": "",
                "one_minute_version": "",
                "full_version": content,
                "total_time_seconds": 0,
                "bridge_phrases": [],
                "things_to_avoid": [],
            }
