"""
SequencingStrategistRunner - Optimize launch sequencing using critical path analysis.

Algorithmic Core: Launch Sequence Optimization
- Optimizes product/initiative launch order
- Balances resource constraints and market timing
- Manages dependencies between launches
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class LaunchItem(TaskRunnerOutput):
    """Launch sequence item."""
    launch_name: str = Field(default="", description="Product/initiative name")
    launch_order: int = Field(default=0, description="Order in sequence")
    launch_date: str = Field(default="", description="Target launch date")
    launch_type: str = Field(default="new_product", description="new_product | line_extension | rebrand | sunset")
    dependencies: List[str] = Field(default_factory=list, description="Dependencies")
    resources_required: List[str] = Field(default_factory=list, description="Resources needed")
    success_criteria: List[str] = Field(default_factory=list, description="Success measures")


class SequencingStrategistInput(TaskRunnerInput):
    """Input schema for SequencingStrategistRunner."""
    launch_candidates: List[Dict[str, Any]] = Field(default_factory=list, description="Items to sequence")
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, description="Resource constraints")
    market_windows: List[Dict[str, Any]] = Field(default_factory=list, description="Market timing windows")
    planning_horizon: str = Field(default="3 years", description="Planning horizon")


class SequencingStrategistOutput(TaskRunnerOutput):
    """Output schema for SequencingStrategistRunner."""
    launch_sequence: List[LaunchItem] = Field(default_factory=list, description="Optimized sequence")
    sequencing_rationale: str = Field(default="", description="Why this sequence")
    timeline: Dict[str, Any] = Field(default_factory=dict, description="Timeline by year")
    key_gates: List[Dict[str, Any]] = Field(default_factory=list, description="Decision gates")


@register_task_runner
class SequencingStrategistRunner(TaskRunner[SequencingStrategistInput, SequencingStrategistOutput]):
    """Optimize launch sequencing."""

    runner_id = "sequencing_strategist"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "launch_sequence_optimization"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: SequencingStrategistInput) -> SequencingStrategistOutput:
        """Execute launch sequencing."""
        logger.info("Executing SequencingStrategistRunner")

        prompt = """Optimize launch sequence considering resources and market timing.
1. LAUNCH_SEQUENCE: launch_name, launch_order (1-N), launch_date, launch_type, dependencies[], resources_required[], success_criteria[]
2. SEQUENCING_RATIONALE: Why this order is optimal
3. TIMELINE: year_1[], year_2[], year_3[] activities
4. KEY_GATES: gate_name, timing, decision_criteria, go/no-go factors
Return JSON: launch_sequence[], sequencing_rationale, timeline{}, key_gates[]"""

        context = f"Candidates: {input_data.launch_candidates}\nConstraints: {input_data.resource_constraints}\nWindows: {input_data.market_windows}\nHorizon: {input_data.planning_horizon}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return SequencingStrategistOutput(
                launch_sequence=[LaunchItem(**l) for l in result.get("launch_sequence", [])],
                sequencing_rationale=result.get("sequencing_rationale", ""),
                timeline=result.get("timeline", {}),
                key_gates=result.get("key_gates", []),
                quality_score=0.8 if result.get("launch_sequence") else 0.4,
            )
        except Exception as e:
            logger.error(f"SequencingStrategistRunner failed: {e}")
            return SequencingStrategistOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["SequencingStrategistRunner", "SequencingStrategistInput", "SequencingStrategistOutput", "LaunchItem"]
