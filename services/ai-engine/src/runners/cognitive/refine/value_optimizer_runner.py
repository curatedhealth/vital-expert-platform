"""
REFINE Category - Value Optimizer Runner

Optimizes value proposition and value delivery to maximize
customer perceived value and competitive positioning.

Core Logic: Value Optimization / Proposition Refinement
"""

from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

from typing import Any, Dict, List, Optional
from pydantic import Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# DATA SCHEMAS
# =============================================================================

class ValueDriver(TaskRunnerOutput):
    """A driver of value perception."""
    driver_id: str = Field(default="")
    driver_name: str = Field(default="")
    driver_type: str = Field(default="functional", description="functional | emotional | social | economic")
    current_score: float = Field(default=0.0, description="0-100 current performance")
    target_score: float = Field(default=0.0, description="0-100 target performance")
    improvement_potential: str = Field(default="medium", description="low | medium | high")
    optimization_actions: List[str] = Field(default_factory=list)


class ValueGap(TaskRunnerOutput):
    """A gap in value delivery."""
    gap_id: str = Field(default="")
    gap_description: str = Field(default="")
    gap_type: str = Field(default="delivery", description="perception | delivery | communication | capability")
    severity: str = Field(default="medium", description="low | medium | high | critical")
    root_cause: str = Field(default="")
    resolution_approach: str = Field(default="")
    effort_to_close: str = Field(default="medium", description="low | medium | high")


class ValueOptimizerInput(TaskRunnerInput):
    """Input for value optimization."""
    current_value_proposition: str = Field(..., description="Current value proposition")
    value_drivers: List[Dict[str, Any]] = Field(default_factory=list, description="Current value drivers")
    customer_feedback: List[Dict[str, Any]] = Field(default_factory=list, description="Customer feedback on value")
    competitive_value: Dict[str, Any] = Field(default_factory=dict, description="Competitor value propositions")
    optimization_focus: List[str] = Field(default_factory=list, description="Focus areas for optimization")


class ValueOptimizerOutput(TaskRunnerOutput):
    """Output from value optimization."""
    optimized_value_proposition: str = Field(default="")
    value_drivers_analysis: List[ValueDriver] = Field(default_factory=list)
    value_gaps: List[ValueGap] = Field(default_factory=list)
    quick_wins: List[str] = Field(default_factory=list)
    strategic_improvements: List[str] = Field(default_factory=list)
    value_differentiators: List[str] = Field(default_factory=list)
    competitive_advantages: List[str] = Field(default_factory=list)
    value_communication_improvements: List[str] = Field(default_factory=list)
    implementation_priority: List[Dict[str, Any]] = Field(default_factory=list)
    optimization_summary: str = Field(default="")


# =============================================================================
# VALUE OPTIMIZER RUNNER
# =============================================================================

@register_task_runner
class ValueOptimizerRunner(TaskRunner[ValueOptimizerInput, ValueOptimizerOutput]):
    """
    Optimize value proposition and delivery.

    Algorithmic Core: value_optimization
    Temperature: 0.4 (balanced exploration)

    Optimizes:
    - Value proposition clarity
    - Value driver performance
    - Value perception gaps
    - Competitive differentiation
    - Value communication
    """
    runner_id = "value_optimizer"
    name = "Value Optimizer Runner"
    description = "Optimize value using hill climbing optimization"
    category = TaskRunnerCategory.REFINE
    algorithmic_core = "value_optimization"
    max_duration_seconds = 120
    InputType = ValueOptimizerInput
    OutputType = ValueOptimizerOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=4000)

    async def execute(self, input: ValueOptimizerInput) -> ValueOptimizerOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Optimize this value proposition and value delivery.

Current Value Proposition: {input.current_value_proposition}
Value Drivers: {input.value_drivers[:5] if input.value_drivers else 'Not specified'}
Customer Feedback: {input.customer_feedback[:5] if input.customer_feedback else 'Not available'}
Competitive Value: {input.competitive_value or 'Not specified'}
Optimization Focus: {input.optimization_focus if input.optimization_focus else ['all areas']}

Create optimized value that:
1. Clarifies and strengthens the value proposition
2. Improves underperforming value drivers
3. Closes perception-delivery gaps
4. Enhances competitive differentiation
5. Improves value communication

Return JSON with:
- optimized_value_proposition: the improved value proposition statement
- value_drivers_analysis: array of {{driver_id, driver_name, driver_type (functional|emotional|social|economic), current_score (0-100), target_score (0-100), improvement_potential (low|medium|high), optimization_actions[]}}
- value_gaps: array of {{gap_id, gap_description, gap_type (perception|delivery|communication|capability), severity (low|medium|high|critical), root_cause, resolution_approach, effort_to_close (low|medium|high)}}
- quick_wins: array of easy improvements
- strategic_improvements: array of longer-term improvements
- value_differentiators: array of unique value differentiators
- competitive_advantages: array of competitive advantages
- value_communication_improvements: array of communication improvements
- implementation_priority: array of {{action, priority, effort, impact}}
- optimization_summary: overall value optimization assessment
"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a value optimization specialist. Create optimized value propositions that maximize customer perceived value, address gaps, and create sustainable competitive differentiation."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            drivers = [ValueDriver(**d) for d in result.get("value_drivers_analysis", [])]
            gaps = [ValueGap(**g) for g in result.get("value_gaps", [])]

            return ValueOptimizerOutput(
                success=True,
                optimized_value_proposition=result.get("optimized_value_proposition", ""),
                value_drivers_analysis=drivers,
                value_gaps=gaps,
                quick_wins=result.get("quick_wins", []),
                strategic_improvements=result.get("strategic_improvements", []),
                value_differentiators=result.get("value_differentiators", []),
                competitive_advantages=result.get("competitive_advantages", []),
                value_communication_improvements=result.get("value_communication_improvements", []),
                implementation_priority=result.get("implementation_priority", []),
                optimization_summary=result.get("optimization_summary", ""),
                confidence_score=0.85,
                quality_score=len(drivers) * 0.1 + len(gaps) * 0.1 + (0.3 if result.get("optimized_value_proposition") else 0),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"ValueOptimizerRunner error: {e}")
            return ValueOptimizerOutput(
                success=False,
                error=str(e),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}
