"""
MessageRunner - Craft message using audience adaptation.

Algorithmic Core: Audience Adaptation / Message Tailoring
- Adapts message to specific audience
- Aligns with communication preferences
- Optimizes for engagement goal

Use Cases:
- Personalized communication
- Stakeholder messaging
- Sales pitch customization
- Change communication
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

class MessageInput(TaskRunnerInput):
    """Input schema for MessageRunner."""

    audience: Dict[str, Any] = Field(
        ...,
        description="Audience profile (stakeholder)"
    )
    message_goal: str = Field(
        ...,
        description="Goal of the message"
    )
    key_points: List[str] = Field(
        default_factory=list,
        description="Key points to convey"
    )
    channel: str = Field(
        default="email",
        description="Channel: email | phone | presentation | document | chat"
    )
    message_type: str = Field(
        default="inform",
        description="Type: inform | request | persuade | thank | remind | escalate"
    )
    tone: str = Field(
        default="professional",
        description="Tone: formal | professional | friendly | urgent | empathetic"
    )
    length: str = Field(
        default="medium",
        description="Length: brief | medium | detailed"
    )


class TailoredMessage(TaskRunnerOutput):
    """A tailored message."""

    message_id: str = Field(default="", description="Message ID")
    subject: str = Field(default="", description="Subject line (if applicable)")
    opening: str = Field(default="", description="Opening/greeting")
    body: str = Field(default="", description="Main message body")
    closing: str = Field(default="", description="Closing")
    call_to_action: str = Field(default="", description="Call to action")
    full_message: str = Field(default="", description="Complete message")


class MessageOutput(TaskRunnerOutput):
    """Output schema for MessageRunner."""

    message: TailoredMessage = Field(
        default_factory=TailoredMessage,
        description="The tailored message"
    )
    audience_adaptations: List[str] = Field(
        default_factory=list,
        description="How message was adapted for audience"
    )
    key_points_covered: List[str] = Field(
        default_factory=list,
        description="Key points addressed"
    )
    persuasion_elements: List[str] = Field(
        default_factory=list,
        description="Persuasion techniques used"
    )
    tone_markers: List[str] = Field(
        default_factory=list,
        description="Elements establishing tone"
    )
    word_count: int = Field(default=0, description="Word count")
    readability_level: str = Field(
        default="professional",
        description="basic | professional | technical | executive"
    )
    alternative_versions: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Alternative versions [{variant, message}]"
    )
    message_summary: str = Field(default="", description="Summary")


# =============================================================================
# MessageRunner Implementation
# =============================================================================

@register_task_runner
class MessageRunner(TaskRunner[MessageInput, MessageOutput]):
    """
    Audience adaptation message crafting runner.

    This runner creates tailored messages adapted
    to specific audiences.

    Algorithmic Pattern:
        1. Analyze audience profile
        2. Align with communication preferences
        3. Structure message:
           - Opening (personalized greeting)
           - Body (key points, adapted language)
           - Closing (appropriate sign-off)
           - Call to action
        4. Apply tone and length constraints
        5. Add persuasion elements if needed
        6. Generate alternatives if useful

    Best Used For:
        - Personalized communication
        - Stakeholder messaging
        - Sales communication
        - Executive briefings
    """

    runner_id = "message"
    name = "Message Runner"
    description = "Craft message using audience adaptation"
    category = TaskRunnerCategory.ENGAGE
    algorithmic_core = "audience_adaptation"
    max_duration_seconds = 120

    InputType = MessageInput
    OutputType = MessageOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize MessageRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.5,  # Creative for messaging
            max_tokens=3500,
        )

    async def execute(self, input: MessageInput) -> MessageOutput:
        """
        Execute message crafting.

        Args:
            input: Message crafting parameters

        Returns:
            MessageOutput with tailored message
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            audience_text = json.dumps(input.audience, indent=2, default=str)[:2000]

            key_points_text = ""
            if input.key_points:
                key_points_text = "\nKey points to convey:\n" + "\n".join(
                    f"- {p}" for p in input.key_points
                )

            length_instruction = self._get_length_instruction(input.length)

            system_prompt = f"""You are an expert at audience-adapted communication.

Your task is to craft a tailored message for a specific audience.

Channel: {input.channel}
Message type: {input.message_type}
Tone: {input.tone}
{length_instruction}

Audience adaptation approach:
1. Analyze audience:
   - Communication style preference
   - Seniority level
   - Decision authority
   - Key motivations
2. Adapt language:
   - Vocabulary level
   - Technical vs. business language
   - Formality level
3. Structure for channel:
   - Email: Subject, greeting, body, closing
   - Presentation: Headlines, bullets
   - Phone: Opening, key points, ask
4. Message types:
   - inform: Clear, factual, organized
   - request: Clear ask, benefit to them, easy to respond
   - persuade: Problem, solution, evidence, call to action
   - thank: Specific appreciation, impact
   - remind: Context, ask, deadline
   - escalate: Urgency, issue, ask, consequences
5. Apply tone appropriately
6. Include clear call to action

Return a structured JSON response with:
- message:
  - message_id: M1
  - subject: Subject line (if applicable)
  - opening: Opening/greeting
  - body: Main message
  - closing: Closing
  - call_to_action: What you want them to do
  - full_message: Complete assembled message
- audience_adaptations: How message was adapted
- key_points_covered: Points addressed
- persuasion_elements: Techniques used (if persuade)
- tone_markers: What establishes the tone
- word_count: Word count
- readability_level: basic | professional | technical | executive
- alternative_versions: [{{variant: "shorter", message: "..."}}] (optional)
- message_summary: What this message achieves"""

            user_prompt = f"""Craft a message for this audience:

AUDIENCE:
{audience_text}

MESSAGE GOAL: {input.message_goal}
{key_points_text}

Craft tailored message and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_message_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build message
            msg_data = result.get("message", {})
            message = TailoredMessage(
                message_id=msg_data.get("message_id", "M1"),
                subject=msg_data.get("subject", ""),
                opening=msg_data.get("opening", ""),
                body=msg_data.get("body", ""),
                closing=msg_data.get("closing", ""),
                call_to_action=msg_data.get("call_to_action", ""),
                full_message=msg_data.get("full_message", ""),
            )

            duration = (datetime.utcnow() - start_time).total_seconds()

            return MessageOutput(
                success=True,
                message=message,
                audience_adaptations=result.get("audience_adaptations", []),
                key_points_covered=result.get("key_points_covered", []),
                persuasion_elements=result.get("persuasion_elements", []),
                tone_markers=result.get("tone_markers", []),
                word_count=result.get("word_count", len(message.full_message.split())),
                readability_level=result.get("readability_level", "professional"),
                alternative_versions=result.get("alternative_versions", []),
                message_summary=result.get("message_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"MessageRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return MessageOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_length_instruction(self, length: str) -> str:
        """Get length instruction."""
        instructions = {
            "brief": "Brief: 50-100 words. Get to the point quickly.",
            "medium": "Medium: 150-250 words. Balanced coverage.",
            "detailed": "Detailed: 300-500 words. Comprehensive coverage.",
        }
        return instructions.get(length, instructions["medium"])

    def _parse_message_response(self, content: str) -> Dict[str, Any]:
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
                "message": {"full_message": content},
                "audience_adaptations": [],
                "key_points_covered": [],
                "persuasion_elements": [],
                "tone_markers": [],
                "word_count": len(content.split()),
                "readability_level": "professional",
                "alternative_versions": [],
                "message_summary": "",
            }
