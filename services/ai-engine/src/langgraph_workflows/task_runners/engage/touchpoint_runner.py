"""
TouchpointRunner - Design engagement using journey mapping.

Algorithmic Core: Journey Mapping / Engagement Design
- Maps stakeholder engagement journey
- Designs touchpoints for each stage
- Optimizes engagement sequence

Use Cases:
- Customer journey design
- Stakeholder engagement planning
- Change management communication
- Sales engagement strategy
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

class TouchpointInput(TaskRunnerInput):
    """Input schema for TouchpointRunner."""

    profile: Dict[str, Any] = Field(
        ...,
        description="Stakeholder profile"
    )
    engagement_goal: str = Field(
        ...,
        description="Goal of engagement"
    )
    journey_stages: List[str] = Field(
        default_factory=lambda: ["awareness", "interest", "consideration", "decision", "action"],
        description="Journey stages"
    )
    available_channels: List[str] = Field(
        default_factory=lambda: ["email", "phone", "meeting", "presentation", "document"],
        description="Available channels"
    )
    timeline: str = Field(
        default="1_month",
        description="Timeline: 1_week | 2_weeks | 1_month | 3_months"
    )


class Touchpoint(TaskRunnerOutput):
    """A single engagement touchpoint."""

    touchpoint_id: str = Field(default="", description="Touchpoint ID")
    stage: str = Field(default="", description="Journey stage")
    sequence: int = Field(default=0, description="Order in sequence")
    channel: str = Field(default="", description="Channel to use")
    touchpoint_type: str = Field(
        default="inform",
        description="inform | engage | persuade | ask | confirm"
    )
    objective: str = Field(default="", description="Touchpoint objective")
    key_message: str = Field(default="", description="Key message")
    call_to_action: str = Field(default="", description="Desired next step")
    timing: str = Field(default="", description="When to execute")
    success_indicator: str = Field(default="", description="How to measure success")
    fallback_action: str = Field(default="", description="If no response")


class TouchpointOutput(TaskRunnerOutput):
    """Output schema for TouchpointRunner."""

    touchpoints: List[Touchpoint] = Field(
        default_factory=list,
        description="All touchpoints"
    )
    journey_map: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Touchpoints by stage {stage: [touchpoint_ids]}"
    )
    engagement_sequence: List[str] = Field(
        default_factory=list,
        description="Touchpoints in execution order"
    )
    critical_touchpoints: List[str] = Field(
        default_factory=list,
        description="Must-hit touchpoints"
    )
    channel_mix: Dict[str, int] = Field(
        default_factory=dict,
        description="Channel usage {channel: count}"
    )
    estimated_duration: str = Field(default="", description="Total duration")
    engagement_summary: str = Field(default="", description="Summary")
    risk_points: List[str] = Field(
        default_factory=list,
        description="Points where engagement might fail"
    )
    success_criteria: List[str] = Field(
        default_factory=list,
        description="Overall success criteria"
    )


# =============================================================================
# TouchpointRunner Implementation
# =============================================================================

@register_task_runner
class TouchpointRunner(TaskRunner[TouchpointInput, TouchpointOutput]):
    """
    Journey mapping engagement design runner.

    This runner designs touchpoint sequences for
    stakeholder engagement journeys.

    Algorithmic Pattern:
        1. Analyze profile and goal
        2. Map journey stages
        3. For each stage:
           - Design appropriate touchpoints
           - Select optimal channels
           - Define objectives and messages
        4. Sequence touchpoints
        5. Identify critical points
        6. Define success criteria

    Best Used For:
        - Customer journeys
        - Stakeholder engagement
        - Change communication
        - Sales strategy
    """

    runner_id = "touchpoint"
    name = "Touchpoint Runner"
    description = "Design engagement using journey mapping"
    category = TaskRunnerCategory.ENGAGE
    algorithmic_core = "journey_mapping"
    max_duration_seconds = 150

    InputType = TouchpointInput
    OutputType = TouchpointOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize TouchpointRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.4,
            max_tokens=4000,
        )

    async def execute(self, input: TouchpointInput) -> TouchpointOutput:
        """
        Execute touchpoint design.

        Args:
            input: Touchpoint design parameters

        Returns:
            TouchpointOutput with engagement plan
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            profile_text = json.dumps(input.profile, indent=2, default=str)[:2000]

            stages_text = " → ".join(input.journey_stages)
            channels_text = ", ".join(input.available_channels)

            system_prompt = f"""You are an expert at stakeholder engagement journey mapping.

Your task is to design an engagement touchpoint plan.

Engagement goal: {input.engagement_goal}
Journey stages: {stages_text}
Available channels: {channels_text}
Timeline: {input.timeline}

Journey mapping approach:
1. For each journey stage:
   - Define appropriate touchpoints
   - Select channel based on stakeholder preferences
   - Set clear objective
2. Touchpoint types:
   - inform: Share information
   - engage: Build relationship
   - persuade: Influence thinking
   - ask: Request action/input
   - confirm: Verify understanding/agreement
3. For each touchpoint:
   - Define key message
   - Set call to action
   - Plan timing
   - Define success indicator
   - Plan fallback if no response
4. Sequence touchpoints logically
5. Identify critical touchpoints (must succeed)
6. Note risk points

Return a structured JSON response with:
- touchpoints: Array with:
  - touchpoint_id: TP1, TP2, etc.
  - stage: Journey stage
  - sequence: Order (1, 2, 3...)
  - channel: Channel to use
  - touchpoint_type: inform | engage | persuade | ask | confirm
  - objective: What to achieve
  - key_message: Message to convey
  - call_to_action: Desired next step
  - timing: When (Day 1, Week 2, etc.)
  - success_indicator: How to measure
  - fallback_action: If no response
- journey_map: {{stage: [touchpoint_ids]}}
- engagement_sequence: Touchpoint IDs in order
- critical_touchpoints: Must-hit touchpoints
- channel_mix: {{channel: count}}
- estimated_duration: Total time
- engagement_summary: 2-3 sentence summary
- risk_points: Where engagement might fail
- success_criteria: Overall success measures"""

            user_prompt = f"""Design engagement touchpoints for this stakeholder:

STAKEHOLDER PROFILE:
{profile_text}

ENGAGEMENT GOAL: {input.engagement_goal}

Design touchpoint plan and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_touchpoint_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build touchpoints
            touchpoints_data = result.get("touchpoints", [])
            touchpoints = [
                Touchpoint(
                    touchpoint_id=t.get("touchpoint_id", f"TP{idx+1}"),
                    stage=t.get("stage", ""),
                    sequence=int(t.get("sequence", idx+1)),
                    channel=t.get("channel", "email"),
                    touchpoint_type=t.get("touchpoint_type", "inform"),
                    objective=t.get("objective", ""),
                    key_message=t.get("key_message", ""),
                    call_to_action=t.get("call_to_action", ""),
                    timing=t.get("timing", ""),
                    success_indicator=t.get("success_indicator", ""),
                    fallback_action=t.get("fallback_action", ""),
                )
                for idx, t in enumerate(touchpoints_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return TouchpointOutput(
                success=True,
                touchpoints=touchpoints,
                journey_map=result.get("journey_map", {}),
                engagement_sequence=result.get("engagement_sequence", []),
                critical_touchpoints=result.get("critical_touchpoints", []),
                channel_mix=result.get("channel_mix", {}),
                estimated_duration=result.get("estimated_duration", input.timeline),
                engagement_summary=result.get("engagement_summary", ""),
                risk_points=result.get("risk_points", []),
                success_criteria=result.get("success_criteria", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"TouchpointRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return TouchpointOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_touchpoint_response(self, content: str) -> Dict[str, Any]:
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
                "touchpoints": [],
                "journey_map": {},
                "engagement_sequence": [],
                "critical_touchpoints": [],
                "channel_mix": {},
                "estimated_duration": "",
                "engagement_summary": content[:200],
                "risk_points": [],
                "success_criteria": [],
            }
