"""
NarrativeStorylineConstructorRunner - Construct narrative storylines.

Algorithmic Core: Narrative Generation
- Constructs compelling narrative storylines
- Weaves evidence and insights into stories
- Creates engaging communication narratives
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class NarrativeElement(TaskRunnerOutput):
    """Narrative element."""
    element_id: str = Field(default="")
    element_type: str = Field(default="", description="hook | context | challenge | solution | evidence | call_to_action")
    content: str = Field(default="")
    supporting_data: List[str] = Field(default_factory=list)
    emotional_tone: str = Field(default="", description="inspiring | urgent | reassuring | empowering")
    sequence_order: int = Field(default=0)


class NarrativeConstructorInput(TaskRunnerInput):
    """Input schema for NarrativeStorylineConstructorRunner."""
    key_messages: List[str] = Field(default_factory=list, description="Key messages to convey")
    evidence: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting evidence")
    target_audience: str = Field(default="", description="Target audience")
    narrative_style: str = Field(default="professional", description="professional | conversational | academic | compelling")


class NarrativeConstructorOutput(TaskRunnerOutput):
    """Output schema for NarrativeStorylineConstructorRunner."""
    narrative_elements: List[NarrativeElement] = Field(default_factory=list, description="Narrative elements")
    storyline: str = Field(default="", description="Complete storyline")
    key_quotes: List[str] = Field(default_factory=list, description="Key quotable statements")
    visual_suggestions: List[str] = Field(default_factory=list, description="Visual support suggestions")


@register_task_runner
class NarrativeStorylineConstructorRunner(TaskRunner[NarrativeConstructorInput, NarrativeConstructorOutput]):
    """Construct narrative storylines."""

    runner_id = "narrative_storyline_constructor"
    category = TaskRunnerCategory.CREATE
    algorithmic_core = "narrative_generation"
    max_duration_seconds = 120
    temperature = 0.5

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=4000)

    async def execute(self, input_data: NarrativeConstructorInput) -> NarrativeConstructorOutput:
        logger.info("Executing NarrativeStorylineConstructorRunner")
        prompt = f"""Construct narrative storyline:
Messages: {input_data.key_messages}
Evidence: {input_data.evidence[:10]}
Audience: {input_data.target_audience}
Style: {input_data.narrative_style}

Return JSON:
- narrative_elements[]: element_id, element_type, content, supporting_data[], emotional_tone, sequence_order
- storyline (complete narrative)
- key_quotes[]
- visual_suggestions[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a narrative and storytelling expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return NarrativeConstructorOutput(
                narrative_elements=[NarrativeElement(**e) for e in result.get("narrative_elements", [])],
                storyline=result.get("storyline", ""),
                key_quotes=result.get("key_quotes", []),
                visual_suggestions=result.get("visual_suggestions", []),
                quality_score=0.8 if result.get("storyline") else 0.4,
            )
        except Exception as e:
            logger.error(f"NarrativeStorylineConstructorRunner failed: {e}")
            return NarrativeConstructorOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["NarrativeStorylineConstructorRunner", "NarrativeConstructorInput", "NarrativeConstructorOutput", "NarrativeElement"]
