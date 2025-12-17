"""
SECURE Task Runners - Security & Risk.

- ThreatRunner: Identify threats using threat modeling
- VulnerabilityRunner: Assess vulnerabilities using vulnerability scanning
- MitigationRunner: Plan mitigation using risk mitigation
- IncidentRunner: Handle incident using incident response

Core Logic: Security Assessment / Risk Management
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

# THREAT RUNNER
class ThreatInput(TaskRunnerInput):
    asset: str = Field(..., description="Asset to protect")
    threat_categories: List[str] = Field(default_factory=lambda: ["external", "internal", "technical", "physical"])
    context: Optional[str] = Field(default=None)

class Threat(TaskRunnerOutput):
    threat_id: str = Field(default="")
    threat_name: str = Field(default="")
    category: str = Field(default="")
    threat_actor: str = Field(default="")
    attack_vector: str = Field(default="")
    likelihood: str = Field(default="medium")
    impact: str = Field(default="medium")
    countermeasures: List[str] = Field(default_factory=list)

class ThreatOutput(TaskRunnerOutput):
    threats: List[Threat] = Field(default_factory=list)
    threat_matrix: Dict[str, List[str]] = Field(default_factory=dict)
    critical_threats: List[str] = Field(default_factory=list)
    threat_summary: str = Field(default="")

@register_task_runner
class ThreatRunner(TaskRunner[ThreatInput, ThreatOutput]):
    runner_id = "threat"
    name = "Threat Runner"
    description = "Identify threats using threat modeling"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "threat_modeling"
    max_duration_seconds = 150
    InputType = ThreatInput
    OutputType = ThreatOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: ThreatInput) -> ThreatOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Model threats for {input.asset}. Categories: {input.threat_categories}. Return JSON with threats."
            response = await self.llm.ainvoke([SystemMessage(content="You model security threats using STRIDE."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            threats = [Threat(**t) for t in result.get("threats", [])]
            return ThreatOutput(success=True, threats=threats, critical_threats=result.get("critical", []), threat_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return ThreatOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# VULNERABILITY RUNNER
class VulnerabilityInput(TaskRunnerInput):
    system: str = Field(..., description="System to assess")
    scan_type: str = Field(default="comprehensive", description="quick | standard | comprehensive")
    focus_areas: List[str] = Field(default_factory=list)

class Vulnerability(TaskRunnerOutput):
    vuln_id: str = Field(default="")
    name: str = Field(default="")
    severity: str = Field(default="medium", description="low | medium | high | critical")
    cvss_score: float = Field(default=0)
    affected_component: str = Field(default="")
    description: str = Field(default="")
    remediation: str = Field(default="")

class VulnerabilityOutput(TaskRunnerOutput):
    vulnerabilities: List[Vulnerability] = Field(default_factory=list)
    critical_count: int = Field(default=0)
    high_count: int = Field(default=0)
    overall_risk: str = Field(default="medium")
    remediation_priority: List[str] = Field(default_factory=list)
    vulnerability_summary: str = Field(default="")

@register_task_runner
class VulnerabilityRunner(TaskRunner[VulnerabilityInput, VulnerabilityOutput]):
    runner_id = "vulnerability"
    name = "Vulnerability Runner"
    description = "Assess vulnerabilities using vulnerability scanning"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "vulnerability_scanning"
    max_duration_seconds = 150
    InputType = VulnerabilityInput
    OutputType = VulnerabilityOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.1, max_tokens=4000)

    async def execute(self, input: VulnerabilityInput) -> VulnerabilityOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Scan {input.system} for vulnerabilities. Type: {input.scan_type}. Focus: {input.focus_areas}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You assess security vulnerabilities."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            vulns = [Vulnerability(**v) for v in result.get("vulnerabilities", [])]
            return VulnerabilityOutput(success=True, vulnerabilities=vulns, critical_count=result.get("critical_count", 0), overall_risk=result.get("risk", "medium"), vulnerability_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return VulnerabilityOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# MITIGATION RUNNER
class MitigationInput(TaskRunnerInput):
    risks: List[str] = Field(..., description="Risks to mitigate")
    budget_constraint: Optional[str] = Field(default=None)
    timeline: str = Field(default="medium_term")

class MitigationAction(TaskRunnerOutput):
    action_id: str = Field(default="")
    risk_addressed: str = Field(default="")
    action_type: str = Field(default="reduce", description="avoid | reduce | transfer | accept")
    description: str = Field(default="")
    effort: str = Field(default="medium")
    effectiveness: str = Field(default="medium")
    cost_estimate: str = Field(default="")

class MitigationOutput(TaskRunnerOutput):
    mitigation_actions: List[MitigationAction] = Field(default_factory=list)
    residual_risks: List[str] = Field(default_factory=list)
    implementation_sequence: List[str] = Field(default_factory=list)
    total_effort: str = Field(default="")
    mitigation_summary: str = Field(default="")

@register_task_runner
class MitigationRunner(TaskRunner[MitigationInput, MitigationOutput]):
    runner_id = "mitigation"
    name = "Mitigation Runner"
    description = "Plan mitigation using risk mitigation"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "risk_mitigation"
    max_duration_seconds = 120
    InputType = MitigationInput
    OutputType = MitigationOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=3500)

    async def execute(self, input: MitigationInput) -> MitigationOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Plan mitigation for risks: {input.risks}. Budget: {input.budget_constraint}. Timeline: {input.timeline}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You plan risk mitigation strategies."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            actions = [MitigationAction(**a) for a in result.get("actions", [])]
            return MitigationOutput(success=True, mitigation_actions=actions, residual_risks=result.get("residual", []), mitigation_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return MitigationOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# INCIDENT RUNNER
class IncidentInput(TaskRunnerInput):
    incident_description: str = Field(..., description="Incident to handle")
    severity: str = Field(default="medium", description="low | medium | high | critical")
    affected_systems: List[str] = Field(default_factory=list)

class IncidentAction(TaskRunnerOutput):
    action_id: str = Field(default="")
    phase: str = Field(default="", description="detection | containment | eradication | recovery | lessons")
    action: str = Field(default="")
    responsible: str = Field(default="")
    timeline: str = Field(default="")

class IncidentOutput(TaskRunnerOutput):
    incident_classification: str = Field(default="")
    response_actions: List[IncidentAction] = Field(default_factory=list)
    containment_strategy: str = Field(default="")
    communication_plan: str = Field(default="")
    lessons_learned: List[str] = Field(default_factory=list)
    incident_summary: str = Field(default="")

@register_task_runner
class IncidentRunner(TaskRunner[IncidentInput, IncidentOutput]):
    runner_id = "incident"
    name = "Incident Runner"
    description = "Handle incident using incident response"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "incident_response"
    max_duration_seconds = 120
    InputType = IncidentInput
    OutputType = IncidentOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: IncidentInput) -> IncidentOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Handle incident: {input.incident_description}. Severity: {input.severity}. Systems: {input.affected_systems}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You respond to security incidents using NIST framework."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            actions = [IncidentAction(**a) for a in result.get("actions", [])]
            return IncidentOutput(success=True, incident_classification=result.get("classification", ""), response_actions=actions, containment_strategy=result.get("containment", ""), incident_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return IncidentOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

__all__ = [
    "ThreatRunner", "ThreatInput", "ThreatOutput", "Threat",
    "VulnerabilityRunner", "VulnerabilityInput", "VulnerabilityOutput", "Vulnerability",
    "MitigationRunner", "MitigationInput", "MitigationOutput", "MitigationAction",
    "IncidentRunner", "IncidentInput", "IncidentOutput", "IncidentAction",
]
