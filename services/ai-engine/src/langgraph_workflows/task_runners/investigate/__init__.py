"""
INVESTIGATE Task Runners - Investigation & Analysis.

- RootCauseRunner: Find root cause using root cause analysis (5 Whys, Fishbone)
- EvidenceRunner: Gather evidence using evidence collection
- CorrelateRunner: Find correlations using correlation analysis
- ConcludeRunner: Draw conclusions using inference engine

Core Logic: Root Cause Analysis / Investigative Methods
"""

from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner
from typing import Dict, List, Optional
from pydantic import Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ROOT CAUSE RUNNER
class RootCauseInput(TaskRunnerInput):
    problem: str = Field(..., description="Problem to analyze")
    symptoms: List[str] = Field(default_factory=list)
    method: str = Field(default="5_whys", description="5_whys | fishbone | fault_tree")

class CauseAnalysis(TaskRunnerOutput):
    cause_id: str = Field(default="")
    cause_type: str = Field(default="", description="immediate | contributing | root")
    description: str = Field(default="")
    evidence: str = Field(default="")
    confidence: str = Field(default="medium")

class RootCauseOutput(TaskRunnerOutput):
    root_causes: List[str] = Field(default_factory=list)
    cause_chain: List[CauseAnalysis] = Field(default_factory=list)
    contributing_factors: List[str] = Field(default_factory=list)
    corrective_actions: List[str] = Field(default_factory=list)
    preventive_actions: List[str] = Field(default_factory=list)
    root_cause_summary: str = Field(default="")

@register_task_runner
class RootCauseRunner(TaskRunner[RootCauseInput, RootCauseOutput]):
    runner_id = "root_cause"
    name = "Root Cause Runner"
    description = "Find root cause using root cause analysis"
    category = TaskRunnerCategory.INVESTIGATE
    algorithmic_core = "root_cause_analysis"
    max_duration_seconds = 150
    InputType = RootCauseInput
    OutputType = RootCauseOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: RootCauseInput) -> RootCauseOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Analyze root cause of: {input.problem}. Symptoms: {input.symptoms}. Method: {input.method}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You perform root cause analysis using 5 Whys and Fishbone."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            causes = [CauseAnalysis(**c) for c in result.get("cause_chain", [])]
            return RootCauseOutput(success=True, root_causes=result.get("root_causes", []), cause_chain=causes, corrective_actions=result.get("corrective", []), preventive_actions=result.get("preventive", []), root_cause_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return RootCauseOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# EVIDENCE RUNNER
class EvidenceInput(TaskRunnerInput):
    claim: str = Field(..., description="Claim to find evidence for")
    evidence_types: List[str] = Field(default_factory=lambda: ["documentary", "testimonial", "statistical"])
    sources: List[str] = Field(default_factory=list)

class Evidence(TaskRunnerOutput):
    evidence_id: str = Field(default="")
    evidence_type: str = Field(default="")
    description: str = Field(default="")
    source: str = Field(default="")
    credibility: str = Field(default="medium")
    supports_claim: bool = Field(default=True)
    weight: str = Field(default="medium")

class EvidenceOutput(TaskRunnerOutput):
    evidence_items: List[Evidence] = Field(default_factory=list)
    supporting_evidence: List[str] = Field(default_factory=list)
    contradicting_evidence: List[str] = Field(default_factory=list)
    evidence_strength: str = Field(default="moderate")
    gaps: List[str] = Field(default_factory=list)
    evidence_summary: str = Field(default="")

@register_task_runner
class EvidenceRunner(TaskRunner[EvidenceInput, EvidenceOutput]):
    runner_id = "evidence"
    name = "Evidence Runner"
    description = "Gather evidence using evidence collection"
    category = TaskRunnerCategory.INVESTIGATE
    algorithmic_core = "evidence_collection"
    max_duration_seconds = 120
    InputType = EvidenceInput
    OutputType = EvidenceOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: EvidenceInput) -> EvidenceOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Gather evidence for: {input.claim}. Types: {input.evidence_types}. Sources: {input.sources}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You gather and evaluate evidence."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            items = [Evidence(**e) for e in result.get("evidence", [])]
            return EvidenceOutput(success=True, evidence_items=items, supporting_evidence=result.get("supporting", []), contradicting_evidence=result.get("contradicting", []), evidence_strength=result.get("strength", "moderate"), evidence_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return EvidenceOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# CORRELATE RUNNER
class CorrelateInput(TaskRunnerInput):
    variables: List[str] = Field(..., description="Variables to correlate")
    data_description: Optional[str] = Field(default=None)
    correlation_type: str = Field(default="general", description="temporal | causal | statistical")

class Correlation(TaskRunnerOutput):
    correlation_id: str = Field(default="")
    variable_a: str = Field(default="")
    variable_b: str = Field(default="")
    correlation_type: str = Field(default="")
    strength: str = Field(default="moderate", description="weak | moderate | strong")
    direction: str = Field(default="positive", description="positive | negative | none")
    confidence: str = Field(default="medium")
    explanation: str = Field(default="")

class CorrelateOutput(TaskRunnerOutput):
    correlations: List[Correlation] = Field(default_factory=list)
    strong_correlations: List[str] = Field(default_factory=list)
    potential_causal: List[str] = Field(default_factory=list)
    spurious_correlations: List[str] = Field(default_factory=list)
    correlate_summary: str = Field(default="")

@register_task_runner
class CorrelateRunner(TaskRunner[CorrelateInput, CorrelateOutput]):
    runner_id = "correlate"
    name = "Correlate Runner"
    description = "Find correlations using correlation analysis"
    category = TaskRunnerCategory.INVESTIGATE
    algorithmic_core = "correlation_analysis"
    max_duration_seconds = 120
    InputType = CorrelateInput
    OutputType = CorrelateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: CorrelateInput) -> CorrelateOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Find correlations between: {input.variables}. Data: {input.data_description}. Type: {input.correlation_type}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You analyze correlations."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            correlations = [Correlation(**c) for c in result.get("correlations", [])]
            return CorrelateOutput(success=True, correlations=correlations, strong_correlations=result.get("strong", []), potential_causal=result.get("causal", []), correlate_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return CorrelateOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# CONCLUDE RUNNER
class ConcludeInput(TaskRunnerInput):
    evidence: List[str] = Field(..., description="Evidence to analyze")
    question: str = Field(..., description="Question to answer")
    confidence_threshold: float = Field(default=0.7)

class Conclusion(TaskRunnerOutput):
    conclusion_id: str = Field(default="")
    statement: str = Field(default="")
    confidence: float = Field(default=0)
    supporting_evidence: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)

class ConcludeOutput(TaskRunnerOutput):
    primary_conclusion: str = Field(default="")
    conclusions: List[Conclusion] = Field(default_factory=list)
    confidence_level: str = Field(default="moderate")
    alternative_interpretations: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    conclude_summary: str = Field(default="")

@register_task_runner
class ConcludeRunner(TaskRunner[ConcludeInput, ConcludeOutput]):
    runner_id = "conclude"
    name = "Conclude Runner"
    description = "Draw conclusions using inference engine"
    category = TaskRunnerCategory.INVESTIGATE
    algorithmic_core = "inference_engine"
    max_duration_seconds = 120
    InputType = ConcludeInput
    OutputType = ConcludeOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: ConcludeInput) -> ConcludeOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Draw conclusions from: {input.evidence}. Question: {input.question}. Threshold: {input.confidence_threshold}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You draw evidence-based conclusions."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            conclusions = [Conclusion(**c) for c in result.get("conclusions", [])]
            return ConcludeOutput(success=True, primary_conclusion=result.get("primary", ""), conclusions=conclusions, confidence_level=result.get("confidence_level", "moderate"), alternative_interpretations=result.get("alternatives", []), conclude_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return ConcludeOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

__all__ = [
    "RootCauseRunner", "RootCauseInput", "RootCauseOutput", "CauseAnalysis",
    "EvidenceRunner", "EvidenceInput", "EvidenceOutput", "Evidence",
    "CorrelateRunner", "CorrelateInput", "CorrelateOutput", "Correlation",
    "ConcludeRunner", "ConcludeInput", "ConcludeOutput", "Conclusion",
]
