"""
PromotionPlannerRunner - Plan promotion campaigns using campaign planning methodology.

Algorithmic Core: Campaign Planning
- Develops integrated promotion plans
- Allocates media mix and budget
- Creates messaging frameworks
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class Campaign(TaskRunnerOutput):
    """Campaign definition."""
    campaign_name: str = Field(default="", description="Campaign name")
    campaign_type: str = Field(default="awareness", description="awareness | consideration | conversion | loyalty")
    target_segment: str = Field(default="", description="Target segment")
    key_message: str = Field(default="", description="Core message")
    channels: List[str] = Field(default_factory=list, description="Media channels")
    budget_allocation: float = Field(default=0.0, description="Budget allocation %")


class PromotionPlannerInput(TaskRunnerInput):
    """Input schema for PromotionPlannerRunner."""
    objectives: List[str] = Field(default_factory=list, description="Promotion objectives")
    target_audience: Dict[str, Any] = Field(default_factory=dict, description="Target audience")
    budget: Optional[float] = Field(default=None, description="Total budget")
    timeline: str = Field(default="12 months", description="Campaign timeline")


class PromotionPlannerOutput(TaskRunnerOutput):
    """Output schema for PromotionPlannerRunner."""
    promotion_plan: Dict[str, Any] = Field(default_factory=dict, description="Overall plan")
    campaigns: List[Campaign] = Field(default_factory=list, description="Campaign strategies")
    media_mix: Dict[str, float] = Field(default_factory=dict, description="Media allocation")
    messaging_framework: Dict[str, Any] = Field(default_factory=dict, description="Messaging framework")


@register_task_runner
class PromotionPlannerRunner(TaskRunner[PromotionPlannerInput, PromotionPlannerOutput]):
    """Plan promotion campaigns."""

    runner_id = "promotion_planner"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "campaign_planning"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: PromotionPlannerInput) -> PromotionPlannerOutput:
        """Execute promotion planning."""
        logger.info("Executing PromotionPlannerRunner")

        prompt = """Create integrated promotion plan.
1. PROMOTION_PLAN: objectives, total_budget, timeline, key_milestones[]
2. CAMPAIGNS: campaign_name, campaign_type, target_segment, key_message, channels[], budget_allocation
3. MEDIA_MIX: allocation % by channel (tv, digital, print, social, pr, events)
4. MESSAGING_FRAMEWORK: key_messages by audience, proof_points[], tone_of_voice
Return JSON: promotion_plan{}, campaigns[], media_mix{}, messaging_framework{}"""

        context = f"Objectives: {input_data.objectives}\nAudience: {input_data.target_audience}\nBudget: {input_data.budget}\nTimeline: {input_data.timeline}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return PromotionPlannerOutput(
                promotion_plan=result.get("promotion_plan", {}),
                campaigns=[Campaign(**c) for c in result.get("campaigns", [])],
                media_mix=result.get("media_mix", {}),
                messaging_framework=result.get("messaging_framework", {}),
                quality_score=0.8 if result.get("campaigns") else 0.4,
            )
        except Exception as e:
            logger.error(f"PromotionPlannerRunner failed: {e}")
            return PromotionPlannerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["PromotionPlannerRunner", "PromotionPlannerInput", "PromotionPlannerOutput", "Campaign"]
