"""
DISCOVER Task Runners - Discovery & Innovation.

This module provides task runners for discovery and innovation:
- OpportunityRunner: Find opportunities using opportunity scanning
- HypothesisRunner: Form hypothesis using scientific method
- ExperimentRunner: Design experiment using experimental design
- InsightRunner: Generate insights using pattern recognition

Core Logic: Innovation Process / Discovery Science

Discovery Pipeline:
    Opportunity → Hypothesis → Experiment → Insight

Example:
    >>> from langgraph_workflows.task_runners.discover import (
    ...     OpportunityRunner, HypothesisRunner, ExperimentRunner, InsightRunner,
    ... )
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
# OPPORTUNITY RUNNER
# =============================================================================

class OpportunityInput(TaskRunnerInput):
    domain: str = Field(..., description="Domain to scan")
    current_offerings: List[str] = Field(default_factory=list)
    scanning_scope: str = Field(default="medium", description="narrow | medium | wide")

class Opportunity(TaskRunnerOutput):
    opportunity_id: str = Field(default="")
    opportunity_name: str = Field(default="")
    opportunity_type: str = Field(default="market", description="market | technology | process | partnership")
    description: str = Field(default="")
    potential_impact: str = Field(default="medium", description="low | medium | high")
    feasibility: str = Field(default="medium", description="low | medium | high")
    time_sensitivity: str = Field(default="medium", description="low | medium | high | urgent")
    next_steps: List[str] = Field(default_factory=list)

class OpportunityOutput(TaskRunnerOutput):
    opportunities: List[Opportunity] = Field(default_factory=list)
    opportunity_by_type: Dict[str, List[str]] = Field(default_factory=dict)
    top_opportunities: List[str] = Field(default_factory=list)
    opportunity_summary: str = Field(default="")

@register_task_runner
class OpportunityRunner(TaskRunner[OpportunityInput, OpportunityOutput]):
    runner_id = "opportunity"
    name = "Opportunity Runner"
    description = "Find opportunities using opportunity scanning"
    category = TaskRunnerCategory.DISCOVER
    algorithmic_core = "opportunity_scanning"
    max_duration_seconds = 120
    InputType = OpportunityInput
    OutputType = OpportunityOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5, max_tokens=3500)

    async def execute(self, input: OpportunityInput) -> OpportunityOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Scan for opportunities in {input.domain}. Scope: {input.scanning_scope}. Current offerings: {input.current_offerings}. Return JSON with opportunities array."
            response = await self.llm.ainvoke([SystemMessage(content="You find strategic opportunities."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            opportunities = [Opportunity(**o) for o in result.get("opportunities", [])]
            return OpportunityOutput(success=True, opportunities=opportunities, opportunity_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return OpportunityOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# HYPOTHESIS RUNNER
# =============================================================================

class HypothesisInput(TaskRunnerInput):
    observation: str = Field(..., description="Observation to explain")
    context: Optional[str] = Field(default=None)
    hypothesis_count: int = Field(default=3)

class Hypothesis(TaskRunnerOutput):
    hypothesis_id: str = Field(default="")
    statement: str = Field(default="")
    rationale: str = Field(default="")
    testability: str = Field(default="medium", description="low | medium | high")
    falsifiability: str = Field(default="")
    test_approach: str = Field(default="")

class HypothesisOutput(TaskRunnerOutput):
    hypotheses: List[Hypothesis] = Field(default_factory=list)
    recommended_hypothesis: str = Field(default="")
    hypothesis_summary: str = Field(default="")

@register_task_runner
class HypothesisRunner(TaskRunner[HypothesisInput, HypothesisOutput]):
    runner_id = "hypothesis"
    name = "Hypothesis Runner"
    description = "Form hypothesis using scientific method"
    category = TaskRunnerCategory.DISCOVER
    algorithmic_core = "scientific_method"
    max_duration_seconds = 120
    InputType = HypothesisInput
    OutputType = HypothesisOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=3500)

    async def execute(self, input: HypothesisInput) -> HypothesisOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Generate {input.hypothesis_count} hypotheses for: {input.observation}. Context: {input.context}. Return JSON with hypotheses array."
            response = await self.llm.ainvoke([SystemMessage(content="You form scientific hypotheses."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            hypotheses = [Hypothesis(**h) for h in result.get("hypotheses", [])]
            return HypothesisOutput(success=True, hypotheses=hypotheses, recommended_hypothesis=result.get("recommended", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return HypothesisOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# EXPERIMENT RUNNER
# =============================================================================

class ExperimentInput(TaskRunnerInput):
    hypothesis: str = Field(..., description="Hypothesis to test")
    constraints: List[str] = Field(default_factory=list)
    experiment_type: str = Field(default="ab_test", description="ab_test | survey | prototype | pilot")

class Experiment(TaskRunnerOutput):
    experiment_id: str = Field(default="")
    experiment_name: str = Field(default="")
    design: str = Field(default="")
    variables: Dict[str, str] = Field(default_factory=dict)
    metrics: List[str] = Field(default_factory=list)
    sample_size: str = Field(default="")
    duration: str = Field(default="")
    success_criteria: str = Field(default="")

class ExperimentOutput(TaskRunnerOutput):
    experiment: Experiment = Field(default_factory=Experiment)
    experiment_plan: str = Field(default="")
    risks: List[str] = Field(default_factory=list)
    experiment_summary: str = Field(default="")

@register_task_runner
class ExperimentRunner(TaskRunner[ExperimentInput, ExperimentOutput]):
    runner_id = "experiment"
    name = "Experiment Runner"
    description = "Design experiment using experimental design"
    category = TaskRunnerCategory.DISCOVER
    algorithmic_core = "experimental_design"
    max_duration_seconds = 120
    InputType = ExperimentInput
    OutputType = ExperimentOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=3500)

    async def execute(self, input: ExperimentInput) -> ExperimentOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Design {input.experiment_type} experiment for: {input.hypothesis}. Constraints: {input.constraints}. Return JSON with experiment design."
            response = await self.llm.ainvoke([SystemMessage(content="You design rigorous experiments."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            exp_data = result.get("experiment", {})
            experiment = Experiment(**exp_data) if exp_data else Experiment()
            return ExperimentOutput(success=True, experiment=experiment, experiment_plan=result.get("plan", ""), risks=result.get("risks", []), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return ExperimentOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# INSIGHT RUNNER
# =============================================================================

class InsightInput(TaskRunnerInput):
    data_description: str = Field(..., description="Data to analyze")
    patterns_observed: List[str] = Field(default_factory=list)
    insight_depth: str = Field(default="standard", description="quick | standard | deep")

class Insight(TaskRunnerOutput):
    insight_id: str = Field(default="")
    insight_type: str = Field(default="pattern", description="pattern | anomaly | correlation | trend")
    title: str = Field(default="")
    description: str = Field(default="")
    confidence: str = Field(default="medium", description="low | medium | high")
    actionability: str = Field(default="medium", description="low | medium | high")
    implications: List[str] = Field(default_factory=list)

class InsightOutput(TaskRunnerOutput):
    insights: List[Insight] = Field(default_factory=list)
    key_insight: str = Field(default="")
    recommended_actions: List[str] = Field(default_factory=list)
    insight_summary: str = Field(default="")

@register_task_runner
class InsightRunner(TaskRunner[InsightInput, InsightOutput]):
    runner_id = "insight"
    name = "Insight Runner"
    description = "Generate insights using pattern recognition"
    category = TaskRunnerCategory.DISCOVER
    algorithmic_core = "pattern_recognition"
    max_duration_seconds = 120
    InputType = InsightInput
    OutputType = InsightOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=3500)

    async def execute(self, input: InsightInput) -> InsightOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Generate insights from: {input.data_description}. Patterns: {input.patterns_observed}. Depth: {input.insight_depth}. Return JSON with insights array."
            response = await self.llm.ainvoke([SystemMessage(content="You extract actionable insights."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            insights = [Insight(**i) for i in result.get("insights", [])]
            return InsightOutput(success=True, insights=insights, key_insight=result.get("key_insight", ""), recommended_actions=result.get("actions", []), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return InsightOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


__all__ = [
    "OpportunityRunner", "OpportunityInput", "OpportunityOutput", "Opportunity",
    "HypothesisRunner", "HypothesisInput", "HypothesisOutput", "Hypothesis",
    "ExperimentRunner", "ExperimentInput", "ExperimentOutput", "Experiment",
    "InsightRunner", "InsightInput", "InsightOutput", "Insight",
]
