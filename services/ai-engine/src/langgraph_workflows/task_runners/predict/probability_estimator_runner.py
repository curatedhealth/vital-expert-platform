"""
ProbabilityEstimatorRunner - Estimate scenario probabilities.

Algorithmic Core: Bayesian Probability Estimation
- Estimates scenario likelihood using Bayesian methods
- Incorporates evidence and prior knowledge
- Provides confidence intervals
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class ProbabilityEstimate(TaskRunnerOutput):
    scenario_name: str = Field(default="")
    probability: float = Field(default=0.0, description="Probability 0-1")
    confidence_interval: Dict[str, float] = Field(default_factory=dict, description="low/high bounds")
    key_assumptions: List[str] = Field(default_factory=list)
    evidence_quality: str = Field(default="medium", description="low | medium | high")


class ProbabilityEstimatorInput(TaskRunnerInput):
    scenarios: List[Dict[str, Any]] = Field(default_factory=list, description="Scenarios to estimate")
    evidence: List[Dict[str, Any]] = Field(default_factory=list, description="Available evidence")
    prior_beliefs: Dict[str, float] = Field(default_factory=dict, description="Prior probabilities")


class ProbabilityEstimatorOutput(TaskRunnerOutput):
    estimates: List[ProbabilityEstimate] = Field(default_factory=list)
    probability_distribution: Dict[str, float] = Field(default_factory=dict)
    most_likely_scenario: str = Field(default="")
    estimation_methodology: str = Field(default="")


@register_task_runner
class ProbabilityEstimatorRunner(TaskRunner[ProbabilityEstimatorInput, ProbabilityEstimatorOutput]):
    runner_id = "probability_estimator"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "bayesian_estimation"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: ProbabilityEstimatorInput) -> ProbabilityEstimatorOutput:
        logger.info("Executing ProbabilityEstimatorRunner")
        prompt = f"Estimate probabilities for scenarios: {input_data.scenarios}. Evidence: {input_data.evidence[:3]}. Priors: {input_data.prior_beliefs}. Return JSON: estimates[], probability_distribution{{}}, most_likely_scenario, estimation_methodology"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You estimate probabilities using Bayesian reasoning."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ProbabilityEstimatorOutput(
                estimates=[ProbabilityEstimate(**e) for e in result.get("estimates", [])],
                probability_distribution=result.get("probability_distribution", {}),
                most_likely_scenario=result.get("most_likely_scenario", ""),
                estimation_methodology=result.get("estimation_methodology", ""),
                quality_score=0.8 if result.get("estimates") else 0.4,
            )
        except Exception as e:
            logger.error(f"ProbabilityEstimatorRunner failed: {e}")
            return ProbabilityEstimatorOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["ProbabilityEstimatorRunner", "ProbabilityEstimatorInput", "ProbabilityEstimatorOutput", "ProbabilityEstimate"]
