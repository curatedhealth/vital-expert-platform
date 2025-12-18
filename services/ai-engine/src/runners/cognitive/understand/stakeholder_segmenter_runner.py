"""
StakeholderSegmenterRunner - Segment stakeholders by characteristics.

Algorithmic Core: Stakeholder Segmentation
- Segments stakeholders by behavior, needs, and value
- Creates actionable segment profiles
- Identifies segment-specific strategies
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class StakeholderSegment(TaskRunnerOutput):
    """Stakeholder segment definition."""
    segment_id: str = Field(default="")
    segment_name: str = Field(default="")
    description: str = Field(default="")
    size_estimate: int = Field(default=0)
    key_characteristics: List[str] = Field(default_factory=list)
    needs: List[str] = Field(default_factory=list)
    engagement_preferences: List[str] = Field(default_factory=list)
    value_potential: str = Field(default="medium", description="low | medium | high")
    recommended_approach: str = Field(default="")


class StakeholderSegmenterInput(TaskRunnerInput):
    """Input schema for StakeholderSegmenterRunner."""
    stakeholders: List[Dict[str, Any]] = Field(default_factory=list, description="Stakeholders to segment")
    segmentation_criteria: List[str] = Field(default_factory=list, description="Criteria for segmentation")
    business_objectives: List[str] = Field(default_factory=list, description="Business objectives")


class StakeholderSegmenterOutput(TaskRunnerOutput):
    """Output schema for StakeholderSegmenterRunner."""
    segments: List[StakeholderSegment] = Field(default_factory=list, description="Defined segments")
    segmentation_matrix: Dict[str, Any] = Field(default_factory=dict, description="Segmentation matrix")
    segment_priorities: List[str] = Field(default_factory=list, description="Prioritized segments")
    coverage_analysis: Dict[str, Any] = Field(default_factory=dict, description="Coverage by segment")


@register_task_runner
class StakeholderSegmenterRunner(TaskRunner[StakeholderSegmenterInput, StakeholderSegmenterOutput]):
    """Segment stakeholders by characteristics."""

    runner_id = "stakeholder_segmenter"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "stakeholder_segmentation"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: StakeholderSegmenterInput) -> StakeholderSegmenterOutput:
        logger.info("Executing StakeholderSegmenterRunner")
        prompt = f"""Segment stakeholders using: {input_data.segmentation_criteria}
Stakeholders: {input_data.stakeholders[:10]}
Objectives: {input_data.business_objectives}

Return JSON: segments[], segmentation_matrix{{}}, segment_priorities[], coverage_analysis{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a stakeholder segmentation expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return StakeholderSegmenterOutput(
                segments=[StakeholderSegment(**s) for s in result.get("segments", [])],
                segmentation_matrix=result.get("segmentation_matrix", {}),
                segment_priorities=result.get("segment_priorities", []),
                coverage_analysis=result.get("coverage_analysis", {}),
                quality_score=0.8 if result.get("segments") else 0.4,
            )
        except Exception as e:
            logger.error(f"StakeholderSegmenterRunner failed: {e}")
            return StakeholderSegmenterOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["StakeholderSegmenterRunner", "StakeholderSegmenterInput", "StakeholderSegmenterOutput", "StakeholderSegment"]
