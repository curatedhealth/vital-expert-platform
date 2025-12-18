"""
FramingRunner - Frame message using framing theory.

Algorithmic Core: Framing Theory / Message Framing
- Frames messages for different perspectives
- Applies gain/loss framing
- Adjusts emphasis and narrative

Use Cases:
- Marketing messages
- Change communication
- Policy communication
- Crisis communication
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

class FramingInput(TaskRunnerInput):
    """Input schema for FramingRunner."""

    message: str = Field(
        ...,
        description="Core message to frame"
    )
    audience: str = Field(
        ...,
        description="Target audience"
    )
    framing_goal: str = Field(
        default="persuade",
        description="Goal: inform | persuade | motivate | reassure"
    )
    frame_types: List[str] = Field(
        default_factory=lambda: ["gain", "loss"],
        description="Frame types to generate"
    )
    context: Optional[str] = Field(
        default=None,
        description="Context for framing"
    )


class FramedMessage(TaskRunnerOutput):
    """A framed version of the message."""

    frame_id: str = Field(default="", description="Frame ID")
    frame_type: str = Field(
        default="neutral",
        description="gain | loss | neutral | aspirational | fear"
    )
    framed_message: str = Field(default="", description="The framed message")
    key_emphasis: List[str] = Field(
        default_factory=list,
        description="What is emphasized"
    )
    psychological_appeal: str = Field(default="", description="Appeal type")
    effectiveness_prediction: str = Field(
        default="moderate",
        description="low | moderate | high"
    )
    best_context: str = Field(default="", description="When to use")


class FramingOutput(TaskRunnerOutput):
    """Output schema for FramingRunner."""

    original_message: str = Field(default="", description="Original message")
    framed_messages: List[FramedMessage] = Field(
        default_factory=list,
        description="Different framed versions"
    )
    recommended_frame: str = Field(
        default="",
        description="Recommended frame for audience"
    )
    recommendation_rationale: str = Field(
        default="",
        description="Why this frame is recommended"
    )
    audience_analysis: str = Field(
        default="",
        description="Analysis of audience"
    )
    framing_techniques: List[str] = Field(
        default_factory=list,
        description="Techniques used"
    )
    framing_summary: str = Field(default="", description="Summary")


# =============================================================================
# FramingRunner Implementation
# =============================================================================

@register_task_runner
class FramingRunner(TaskRunner[FramingInput, FramingOutput]):
    """
    Framing theory message framing runner.

    This runner applies framing theory to create
    multiple versions of a message.

    Algorithmic Pattern:
        1. Analyze core message
        2. Analyze audience
        3. Apply frame types:
           - Gain frame (benefits of action)
           - Loss frame (costs of inaction)
           - Neutral frame (balanced)
           - Aspirational frame (ideal state)
           - Fear frame (risks/consequences)
        4. Adjust emphasis
        5. Recommend optimal frame

    Best Used For:
        - Marketing
        - Change communication
        - Policy messaging
        - Crisis communication
    """

    runner_id = "framing"
    name = "Framing Runner"
    description = "Frame message using framing theory"
    category = TaskRunnerCategory.INFLUENCE
    algorithmic_core = "framing_theory"
    max_duration_seconds = 120

    InputType = FramingInput
    OutputType = FramingOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize FramingRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.5,  # Creative for framing
            max_tokens=3500,
        )

    async def execute(self, input: FramingInput) -> FramingOutput:
        """
        Execute message framing.

        Args:
            input: Framing parameters

        Returns:
            FramingOutput with framed messages
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            frames_text = ", ".join(input.frame_types)

            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            system_prompt = f"""You are an expert at message framing using framing theory.

Your task is to create different framed versions of a message.

Framing goal: {input.framing_goal}
Frame types to generate: {frames_text}

Framing theory approach:
1. Frame types:
   - gain: Emphasize benefits of taking action
   - loss: Emphasize costs of not taking action
   - neutral: Balanced, factual presentation
   - aspirational: Focus on ideal future state
   - fear: Highlight risks and consequences
2. Each frame:
   - Rewrite message with frame emphasis
   - Identify psychological appeal
   - Predict effectiveness for audience
   - Note best context for use
3. Audience analysis:
   - What motivates them?
   - Risk tolerance?
   - Decision style?
4. Recommend best frame for audience

Return a structured JSON response with:
- original_message: The original
- framed_messages: Array with:
  - frame_id: F1, F2, etc.
  - frame_type: gain | loss | neutral | aspirational | fear
  - framed_message: The reframed message
  - key_emphasis: [what is emphasized]
  - psychological_appeal: Appeal type (e.g., "security", "growth")
  - effectiveness_prediction: low | moderate | high
  - best_context: When to use this frame
- recommended_frame: Which frame_id is best
- recommendation_rationale: Why
- audience_analysis: Analysis of audience
- framing_techniques: [techniques used]
- framing_summary: 2-3 sentence summary"""

            user_prompt = f"""Frame this message for the audience:

MESSAGE: {input.message}

AUDIENCE: {input.audience}
{context_text}

Create framed versions and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_framing_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build framed messages
            frames_data = result.get("framed_messages", [])
            framed_messages = [
                FramedMessage(
                    frame_id=f.get("frame_id", f"F{idx+1}"),
                    frame_type=f.get("frame_type", "neutral"),
                    framed_message=f.get("framed_message", ""),
                    key_emphasis=f.get("key_emphasis", []),
                    psychological_appeal=f.get("psychological_appeal", ""),
                    effectiveness_prediction=f.get("effectiveness_prediction", "moderate"),
                    best_context=f.get("best_context", ""),
                )
                for idx, f in enumerate(frames_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return FramingOutput(
                success=True,
                original_message=result.get("original_message", input.message),
                framed_messages=framed_messages,
                recommended_frame=result.get("recommended_frame", ""),
                recommendation_rationale=result.get("recommendation_rationale", ""),
                audience_analysis=result.get("audience_analysis", ""),
                framing_techniques=result.get("framing_techniques", []),
                framing_summary=result.get("framing_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"FramingRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return FramingOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_framing_response(self, content: str) -> Dict[str, Any]:
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
                "original_message": "",
                "framed_messages": [],
                "recommended_frame": "",
                "recommendation_rationale": "",
                "audience_analysis": "",
                "framing_techniques": [],
                "framing_summary": content[:200],
            }
