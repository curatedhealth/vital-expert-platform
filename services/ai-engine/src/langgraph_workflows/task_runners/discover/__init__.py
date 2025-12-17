"""
DISCOVER Task Runners - Discovery & Innovation.

This module provides task runners for discovery and innovation (7 total):
- OpportunityRunner: Find opportunities using opportunity scanning
- HypothesisRunner: Form hypothesis using scientific method
- ExperimentRunner: Design experiment using experimental design
- InsightRunner: Generate insights using pattern recognition
- DrivingForceIdentifierRunner: Identify strategic driving forces
- WhitespaceIdentifierRunner: Identify market whitespace
- EvidenceGapIdentifierRunner: Identify evidence gaps

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


# =============================================================================
# DRIVING FORCE IDENTIFIER - Strategic Force Analysis
# =============================================================================

class DrivingForce(TaskRunnerOutput):
    force_id: str = Field(default="")
    force_name: str = Field(default="")
    force_type: str = Field(default="", description="technology | economic | social | political | environmental")
    description: str = Field(default="")
    certainty: str = Field(default="medium", description="low | medium | high")
    impact: str = Field(default="medium", description="low | medium | high")
    trajectory: str = Field(default="stable", description="accelerating | stable | decelerating")

class DrivingForceIdentifierInput(TaskRunnerInput):
    strategic_context: str = Field(default="", description="Strategic question context")
    time_horizon: str = Field(default="5 years")
    focus_areas: List[str] = Field(default_factory=list)

class DrivingForceIdentifierOutput(TaskRunnerOutput):
    driving_forces: List[DrivingForce] = Field(default_factory=list)
    force_map: Dict[str, Any] = Field(default_factory=dict)
    key_uncertainties: List[str] = Field(default_factory=list)
    predetermined_elements: List[str] = Field(default_factory=list)

@register_task_runner
class DrivingForceIdentifierRunner(TaskRunner[DrivingForceIdentifierInput, DrivingForceIdentifierOutput]):
    runner_id = "driving_force_identifier"
    category = TaskRunnerCategory.DISCOVER
    algorithmic_core = "force_field_analysis"
    max_duration_seconds = 90

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=3000)

    async def execute(self, input: DrivingForceIdentifierInput) -> DrivingForceIdentifierOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Identify driving forces for: {input.strategic_context}. Horizon: {input.time_horizon}. Focus: {input.focus_areas}. Return JSON: driving_forces[], force_map{{}}, key_uncertainties[], predetermined_elements[]"
            response = await self.llm.ainvoke([SystemMessage(content="You identify strategic driving forces."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return DrivingForceIdentifierOutput(
                success=True,
                driving_forces=[DrivingForce(**f) for f in result.get("driving_forces", [])],
                force_map=result.get("force_map", {}),
                key_uncertainties=result.get("key_uncertainties", []),
                predetermined_elements=result.get("predetermined_elements", []),
                quality_score=0.8 if result.get("driving_forces") else 0.4,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            return DrivingForceIdentifierOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# WHITESPACE IDENTIFIER - Market Whitespace Analysis
# =============================================================================

class Whitespace(TaskRunnerOutput):
    whitespace_id: str = Field(default="")
    whitespace_name: str = Field(default="")
    whitespace_type: str = Field(default="", description="unserved_segment | unmet_need | adjacency | innovation")
    description: str = Field(default="")
    market_size_potential: str = Field(default="medium", description="small | medium | large")
    competitive_intensity: str = Field(default="low", description="low | medium | high")
    entry_barriers: List[str] = Field(default_factory=list)
    strategic_fit: str = Field(default="medium", description="low | medium | high")

class WhitespaceIdentifierInput(TaskRunnerInput):
    market_definition: str = Field(default="", description="Market to analyze")
    current_offerings: List[Dict[str, Any]] = Field(default_factory=list)
    competitor_landscape: List[Dict[str, Any]] = Field(default_factory=list)

class WhitespaceIdentifierOutput(TaskRunnerOutput):
    whitespaces: List[Whitespace] = Field(default_factory=list)
    whitespace_map: Dict[str, Any] = Field(default_factory=dict)
    priority_whitespaces: List[str] = Field(default_factory=list)
    entry_recommendations: List[str] = Field(default_factory=list)

@register_task_runner
class WhitespaceIdentifierRunner(TaskRunner[WhitespaceIdentifierInput, WhitespaceIdentifierOutput]):
    runner_id = "whitespace_identifier"
    category = TaskRunnerCategory.DISCOVER
    algorithmic_core = "whitespace_analysis"
    max_duration_seconds = 90

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=3000)

    async def execute(self, input: WhitespaceIdentifierInput) -> WhitespaceIdentifierOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Identify whitespace in: {input.market_definition}. Current: {input.current_offerings[:3]}. Competitors: {input.competitor_landscape[:3]}. Return JSON: whitespaces[], whitespace_map{{}}, priority_whitespaces[], entry_recommendations[]"
            response = await self.llm.ainvoke([SystemMessage(content="You identify market whitespace opportunities."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return WhitespaceIdentifierOutput(
                success=True,
                whitespaces=[Whitespace(**w) for w in result.get("whitespaces", [])],
                whitespace_map=result.get("whitespace_map", {}),
                priority_whitespaces=result.get("priority_whitespaces", []),
                entry_recommendations=result.get("entry_recommendations", []),
                quality_score=0.8 if result.get("whitespaces") else 0.4,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            return WhitespaceIdentifierOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# EVIDENCE GAP IDENTIFIER - Evidence Gap Analysis
# =============================================================================

class EvidenceGap(TaskRunnerOutput):
    gap_id: str = Field(default="")
    gap_name: str = Field(default="")
    gap_type: str = Field(default="", description="clinical | economic | real_world | comparative | safety")
    description: str = Field(default="")
    severity: str = Field(default="medium", description="low | medium | high | critical")
    stakeholder_impact: List[str] = Field(default_factory=list)
    recommended_studies: List[str] = Field(default_factory=list)
    priority: int = Field(default=0)

class EvidenceGapIdentifierInput(TaskRunnerInput):
    evidence_portfolio: List[Dict[str, Any]] = Field(default_factory=list, description="Current evidence")
    stakeholder_needs: List[Dict[str, Any]] = Field(default_factory=list, description="Stakeholder evidence needs")
    strategic_priorities: List[str] = Field(default_factory=list)

class EvidenceGapIdentifierOutput(TaskRunnerOutput):
    evidence_gaps: List[EvidenceGap] = Field(default_factory=list)
    gap_matrix: Dict[str, Any] = Field(default_factory=dict)
    priority_gaps: List[str] = Field(default_factory=list)
    gap_closure_recommendations: List[Dict[str, Any]] = Field(default_factory=list)

@register_task_runner
class EvidenceGapIdentifierRunner(TaskRunner[EvidenceGapIdentifierInput, EvidenceGapIdentifierOutput]):
    runner_id = "evidence_gap_identifier"
    category = TaskRunnerCategory.DISCOVER
    algorithmic_core = "evidence_gap_analysis"
    max_duration_seconds = 90

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=3000)

    async def execute(self, input: EvidenceGapIdentifierInput) -> EvidenceGapIdentifierOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Identify evidence gaps. Current evidence: {input.evidence_portfolio[:5]}. Needs: {input.stakeholder_needs[:5]}. Priorities: {input.strategic_priorities}. Return JSON: evidence_gaps[], gap_matrix{{}}, priority_gaps[], gap_closure_recommendations[]"
            response = await self.llm.ainvoke([SystemMessage(content="You identify evidence gaps in portfolios."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return EvidenceGapIdentifierOutput(
                success=True,
                evidence_gaps=[EvidenceGap(**g) for g in result.get("evidence_gaps", [])],
                gap_matrix=result.get("gap_matrix", {}),
                priority_gaps=result.get("priority_gaps", []),
                gap_closure_recommendations=result.get("gap_closure_recommendations", []),
                quality_score=0.8 if result.get("evidence_gaps") else 0.4,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            return EvidenceGapIdentifierOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

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
    "DrivingForceIdentifierRunner", "DrivingForceIdentifierInput", "DrivingForceIdentifierOutput", "DrivingForce",
    "WhitespaceIdentifierRunner", "WhitespaceIdentifierInput", "WhitespaceIdentifierOutput", "Whitespace",
    "EvidenceGapIdentifierRunner", "EvidenceGapIdentifierInput", "EvidenceGapIdentifierOutput", "EvidenceGap",
]
