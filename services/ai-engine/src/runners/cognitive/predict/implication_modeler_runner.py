"""
ImplicationModelerRunner - Model strategic implications.

Algorithmic Core: Implication Modeling
- Models first, second, and third-order implications
- Maps cascading effects across domains
- Identifies opportunity and risk implications
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class Implication(TaskRunnerOutput):
    """Individual implication."""
    implication_id: str = Field(default="")
    description: str = Field(default="")
    order: str = Field(default="first", description="first | second | third")
    domain: str = Field(default="", description="Affected domain")
    impact_type: str = Field(default="opportunity", description="opportunity | risk | neutral")
    likelihood: float = Field(default=0.5, description="Probability 0-1")
    timeframe: str = Field(default="", description="When impact occurs")


class ImplicationModelerInput(TaskRunnerInput):
    """Input schema for ImplicationModelerRunner."""
    change_event: Dict[str, Any] = Field(default_factory=dict, description="Change/scenario to model")
    context: str = Field(default="", description="Business context")
    focus_domains: List[str] = Field(default_factory=list, description="Domains to analyze")


class ImplicationModelerOutput(TaskRunnerOutput):
    """Output schema for ImplicationModelerRunner."""
    implications: List[Implication] = Field(default_factory=list, description="All implications")
    first_order: List[Implication] = Field(default_factory=list)
    second_order: List[Implication] = Field(default_factory=list)
    third_order: List[Implication] = Field(default_factory=list)
    implication_map: Dict[str, Any] = Field(default_factory=dict, description="Cascade relationships")


@register_task_runner
class ImplicationModelerRunner(TaskRunner[ImplicationModelerInput, ImplicationModelerOutput]):
    """Model strategic implications of scenarios."""

    runner_id = "implication_modeler"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "implication_modeling"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: ImplicationModelerInput) -> ImplicationModelerOutput:
        logger.info("Executing ImplicationModelerRunner")
        prompt = f"Model implications of: {input_data.change_event}. Context: {input_data.context}. Domains: {input_data.focus_domains}. Return JSON: implications[], first_order[], second_order[], third_order[], implication_map{{}}"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You model cascading implications."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ImplicationModelerOutput(
                implications=[Implication(**i) for i in result.get("implications", [])],
                first_order=[Implication(**i) for i in result.get("first_order", [])],
                second_order=[Implication(**i) for i in result.get("second_order", [])],
                third_order=[Implication(**i) for i in result.get("third_order", [])],
                implication_map=result.get("implication_map", {}),
                quality_score=0.8 if result.get("implications") else 0.4,
            )
        except Exception as e:
            logger.error(f"ImplicationModelerRunner failed: {e}")
            return ImplicationModelerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["ImplicationModelerRunner", "ImplicationModelerInput", "ImplicationModelerOutput", "Implication"]
