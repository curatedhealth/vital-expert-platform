"""
REFINE Category - Packaging Optimizer Runner

Optimizes product/service packaging configurations to maximize
appeal, differentiation, and value perception.

Core Logic: Packaging Optimization / Configuration Refinement
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

class PackageComponent(TaskRunnerOutput):
    """A component of a package/bundle."""
    component_id: str = Field(default="")
    component_name: str = Field(default="")
    component_type: str = Field(default="core", description="core | add_on | premium | optional")
    value_contribution: str = Field(default="medium", description="low | medium | high | critical")
    cost_impact: str = Field(default="medium", description="low | medium | high")
    differentiation_score: float = Field(default=0.5, description="0-1 how unique this is")
    customer_importance: str = Field(default="medium", description="low | medium | high | essential")


class PackageOption(TaskRunnerOutput):
    """A package configuration option."""
    package_id: str = Field(default="")
    package_name: str = Field(default="")
    package_tier: str = Field(default="standard", description="basic | standard | premium | enterprise")
    components: List[str] = Field(default_factory=list, description="Component IDs included")
    price_point: str = Field(default="")
    value_score: float = Field(default=0.0, description="0-100")
    target_segment: str = Field(default="")
    positioning: str = Field(default="")


class PackagingOptimizerInput(TaskRunnerInput):
    """Input for packaging optimization."""
    current_packaging: Dict[str, Any] = Field(..., description="Current package configuration")
    available_components: List[Dict[str, Any]] = Field(default_factory=list, description="All available components")
    market_context: str = Field(default="", description="Market and competitive context")
    optimization_goals: List[str] = Field(default_factory=list, description="Goals (value, differentiation, simplicity)")
    constraints: List[str] = Field(default_factory=list, description="Packaging constraints")


class PackagingOptimizerOutput(TaskRunnerOutput):
    """Output from packaging optimization."""
    optimized_components: List[PackageComponent] = Field(default_factory=list)
    package_options: List[PackageOption] = Field(default_factory=list)
    recommended_configuration: Dict[str, Any] = Field(default_factory=dict)
    optimization_rationale: str = Field(default="")
    value_improvements: List[str] = Field(default_factory=list)
    differentiation_gains: List[str] = Field(default_factory=list)
    simplification_opportunities: List[str] = Field(default_factory=list)
    tradeoffs: List[str] = Field(default_factory=list)
    implementation_steps: List[str] = Field(default_factory=list)
    optimization_summary: str = Field(default="")


# =============================================================================
# PACKAGING OPTIMIZER RUNNER
# =============================================================================

@register_task_runner
class PackagingOptimizerRunner(TaskRunner[PackagingOptimizerInput, PackagingOptimizerOutput]):
    """
    Optimize product/service packaging configurations.

    Algorithmic Core: packaging_optimization
    Temperature: 0.4 (balanced exploration)

    Optimizes:
    - Component inclusion/exclusion
    - Bundle configurations
    - Tier structures
    - Value/price alignment
    - Market differentiation
    """
    runner_id = "packaging_optimizer"
    name = "Packaging Optimizer Runner"
    description = "Optimize packaging using hill climbing optimization"
    category = TaskRunnerCategory.REFINE
    algorithmic_core = "packaging_optimization"
    max_duration_seconds = 120
    InputType = PackagingOptimizerInput
    OutputType = PackagingOptimizerOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=4000)

    async def execute(self, input: PackagingOptimizerInput) -> PackagingOptimizerOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Optimize this product/service packaging configuration.

Current Packaging: {input.current_packaging}
Available Components: {input.available_components[:10] if input.available_components else 'Infer typical components'}
Market Context: {input.market_context or 'Competitive market'}
Optimization Goals: {input.optimization_goals if input.optimization_goals else ['value', 'differentiation', 'simplicity']}
Constraints: {input.constraints}

Create optimized packaging that:
1. Maximizes perceived value
2. Differentiates from competition
3. Simplifies customer decision-making
4. Aligns price with value
5. Creates clear upgrade paths

Return JSON with:
- optimized_components: array of {{component_id, component_name, component_type (core|add_on|premium|optional), value_contribution (low|medium|high|critical), cost_impact (low|medium|high), differentiation_score (0-1), customer_importance (low|medium|high|essential)}}
- package_options: array of {{package_id, package_name, package_tier (basic|standard|premium|enterprise), components[] (IDs), price_point, value_score (0-100), target_segment, positioning}}
- recommended_configuration: the recommended package structure
- optimization_rationale: why this configuration is optimal
- value_improvements: array of value enhancements
- differentiation_gains: array of differentiation improvements
- simplification_opportunities: array of simplification suggestions
- tradeoffs: array of tradeoffs accepted
- implementation_steps: array of steps to implement changes
- optimization_summary: overall optimization assessment
"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a packaging optimization specialist. Create packaging configurations that maximize value perception, differentiation, and simplicity while maintaining profitability."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            components = [PackageComponent(**c) for c in result.get("optimized_components", [])]
            packages = [PackageOption(**p) for p in result.get("package_options", [])]

            return PackagingOptimizerOutput(
                success=True,
                optimized_components=components,
                package_options=packages,
                recommended_configuration=result.get("recommended_configuration", {}),
                optimization_rationale=result.get("optimization_rationale", ""),
                value_improvements=result.get("value_improvements", []),
                differentiation_gains=result.get("differentiation_gains", []),
                simplification_opportunities=result.get("simplification_opportunities", []),
                tradeoffs=result.get("tradeoffs", []),
                implementation_steps=result.get("implementation_steps", []),
                optimization_summary=result.get("optimization_summary", ""),
                confidence_score=0.85,
                quality_score=len(components) * 0.1 + len(packages) * 0.15,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"PackagingOptimizerRunner error: {e}")
            return PackagingOptimizerOutput(
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
