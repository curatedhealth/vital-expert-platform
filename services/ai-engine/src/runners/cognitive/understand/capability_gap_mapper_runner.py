"""
CapabilityGapMapperRunner - Map capability gaps for strategic planning.

Algorithmic Core: Capability Gap Analysis
- Maps current vs required capabilities
- Identifies priority gaps for investment
- Provides gap closure recommendations
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class CapabilityGap(TaskRunnerOutput):
    """Individual capability gap."""
    capability_name: str = Field(default="", description="Capability name")
    current_state: str = Field(default="", description="Current state description")
    required_state: str = Field(default="", description="Required state description")
    gap_size: str = Field(default="medium", description="small | medium | large | critical")
    priority: str = Field(default="medium", description="low | medium | high | critical")
    closure_approach: str = Field(default="", description="build | buy | partner")
    estimated_effort: str = Field(default="", description="Effort estimate")


class CapabilityGapMapperInput(TaskRunnerInput):
    """Input schema for CapabilityGapMapperRunner."""
    strategic_needs: List[str] = Field(default_factory=list, description="Strategic capability needs")
    current_capabilities: Dict[str, Any] = Field(default_factory=dict, description="Current capabilities")
    technology_context: List[Dict[str, Any]] = Field(default_factory=list, description="Technology context")


class CapabilityGapMapperOutput(TaskRunnerOutput):
    """Output schema for CapabilityGapMapperRunner."""
    capability_gaps: List[CapabilityGap] = Field(default_factory=list, description="Identified gaps")
    gap_map: Dict[str, Any] = Field(default_factory=dict, description="Gap visualization data")
    priority_gaps: List[str] = Field(default_factory=list, description="Priority gaps to address")
    total_gaps: int = Field(default=0, description="Total gaps identified")


@register_task_runner
class CapabilityGapMapperRunner(TaskRunner[CapabilityGapMapperInput, CapabilityGapMapperOutput]):
    """Map capability gaps for strategic planning."""

    runner_id = "capability_gap_mapper"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "capability_gap_analysis"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: CapabilityGapMapperInput) -> CapabilityGapMapperOutput:
        """Execute capability gap mapping."""
        logger.info("Executing CapabilityGapMapperRunner")

        prompt = """Map capability gaps between current and required state.
Per gap: capability_name, current_state, required_state, gap_size (small|medium|large|critical), priority, closure_approach (build|buy|partner), estimated_effort
Create gap_map showing relationships, identify priority_gaps.
Return JSON: capability_gaps[], gap_map{}, priority_gaps[]"""

        context = f"Strategic Needs: {input_data.strategic_needs}\nCurrent: {input_data.current_capabilities}\nTech Context: {input_data.technology_context[:3]}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            gaps = [CapabilityGap(**g) for g in result.get("capability_gaps", [])]
            return CapabilityGapMapperOutput(
                capability_gaps=gaps,
                gap_map=result.get("gap_map", {}),
                priority_gaps=result.get("priority_gaps", []),
                total_gaps=len(gaps),
                quality_score=0.8 if gaps else 0.4,
            )
        except Exception as e:
            logger.error(f"CapabilityGapMapperRunner failed: {e}")
            return CapabilityGapMapperOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["CapabilityGapMapperRunner", "CapabilityGapMapperInput", "CapabilityGapMapperOutput", "CapabilityGap"]
