"""
DecisionDriverAnalyzerRunner - Analyze what drives stakeholder decisions.

Algorithmic Core: Decision Driver Analysis
- Identifies key decision drivers for any stakeholder type
- Maps driver weights and interdependencies
- Surfaces hidden/unstated decision criteria

Use Cases: Payer decisions, HCP adoption, regulatory approval, buyer procurement
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class DecisionDriver(TaskRunnerOutput):
    """Individual decision driver."""
    driver_id: str = Field(default="")
    driver_name: str = Field(default="")
    driver_category: str = Field(default="", description="clinical | economic | operational | strategic | regulatory")
    description: str = Field(default="")
    importance_weight: float = Field(default=0.0, description="Weight 0-1")
    is_stated: bool = Field(default=True, description="Explicitly stated vs hidden driver")
    evidence_required: List[str] = Field(default_factory=list)
    threshold_criteria: str = Field(default="", description="What meets this driver")


class DecisionDriverAnalyzerInput(TaskRunnerInput):
    """Input schema for DecisionDriverAnalyzerRunner."""
    stakeholder_type: str = Field(default="", description="Type of decision-maker (payer, HCP, regulator, buyer)")
    decision_context: str = Field(default="", description="What decision is being made")
    known_drivers: List[str] = Field(default_factory=list, description="Already known drivers")
    market_context: Optional[str] = Field(default=None, description="Market/geography context")


class DecisionDriverAnalyzerOutput(TaskRunnerOutput):
    """Output schema for DecisionDriverAnalyzerRunner."""
    drivers: List[DecisionDriver] = Field(default_factory=list, description="All decision drivers")
    driver_hierarchy: Dict[str, Any] = Field(default_factory=dict, description="Driver relationships")
    stated_drivers: List[DecisionDriver] = Field(default_factory=list)
    hidden_drivers: List[DecisionDriver] = Field(default_factory=list)
    critical_drivers: List[str] = Field(default_factory=list, description="Must-have drivers")
    driver_gaps: List[str] = Field(default_factory=list, description="Drivers we can't address")


@register_task_runner
class DecisionDriverAnalyzerRunner(TaskRunner[DecisionDriverAnalyzerInput, DecisionDriverAnalyzerOutput]):
    """Analyze decision drivers for any stakeholder type."""

    runner_id = "decision_driver_analyzer"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "decision_driver_analysis"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: DecisionDriverAnalyzerInput) -> DecisionDriverAnalyzerOutput:
        logger.info("Executing DecisionDriverAnalyzerRunner")
        prompt = f"""Analyze decision drivers for: {input_data.stakeholder_type}
Decision Context: {input_data.decision_context}
Known Drivers: {input_data.known_drivers}
Market: {input_data.market_context}

Return JSON:
- drivers[]: driver_id, driver_name, driver_category (clinical|economic|operational|strategic|regulatory), description, importance_weight (0-1), is_stated (bool), evidence_required[], threshold_criteria
- driver_hierarchy: relationships between drivers
- stated_drivers[]: explicitly mentioned drivers
- hidden_drivers[]: unstated but important drivers
- critical_drivers[]: must-have drivers
- driver_gaps[]: drivers we may not be able to address"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You analyze stakeholder decision-making criteria across industries."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            drivers = [DecisionDriver(**d) for d in result.get("drivers", [])]
            stated = [DecisionDriver(**d) for d in result.get("stated_drivers", [])]
            hidden = [DecisionDriver(**d) for d in result.get("hidden_drivers", [])]
            return DecisionDriverAnalyzerOutput(
                drivers=drivers,
                driver_hierarchy=result.get("driver_hierarchy", {}),
                stated_drivers=stated,
                hidden_drivers=hidden,
                critical_drivers=result.get("critical_drivers", []),
                driver_gaps=result.get("driver_gaps", []),
                quality_score=0.8 if drivers else 0.4,
            )
        except Exception as e:
            logger.error(f"DecisionDriverAnalyzerRunner failed: {e}")
            return DecisionDriverAnalyzerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["DecisionDriverAnalyzerRunner", "DecisionDriverAnalyzerInput", "DecisionDriverAnalyzerOutput", "DecisionDriver"]
