"""
GOVERN Task Runners - Governance & Compliance.

- PolicyRunner: Draft policy using policy analysis
- ComplianceRunner: Assess compliance using regulatory frameworks
- AuditRunner: Conduct audit using audit methodology
- EthicsRunner: Evaluate ethics using ethical frameworks

Core Logic: Regulatory Compliance / Policy Management
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

# POLICY RUNNER
class PolicyInput(TaskRunnerInput):
    policy_topic: str = Field(..., description="Policy topic")
    scope: str = Field(default="organization", description="team | department | organization")
    existing_policies: List[str] = Field(default_factory=list)

class PolicySection(TaskRunnerOutput):
    section_id: str = Field(default="")
    title: str = Field(default="")
    content: str = Field(default="")
    rationale: str = Field(default="")

class PolicyOutput(TaskRunnerOutput):
    policy_title: str = Field(default="")
    sections: List[PolicySection] = Field(default_factory=list)
    enforcement_mechanism: str = Field(default="")
    review_cycle: str = Field(default="")
    policy_summary: str = Field(default="")

@register_task_runner
class PolicyRunner(TaskRunner[PolicyInput, PolicyOutput]):
    runner_id = "policy"
    name = "Policy Runner"
    description = "Draft policy using policy analysis"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "policy_analysis"
    max_duration_seconds = 150
    InputType = PolicyInput
    OutputType = PolicyOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: PolicyInput) -> PolicyOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Draft {input.scope} policy for: {input.policy_topic}. Existing: {input.existing_policies}. Return JSON with sections."
            response = await self.llm.ainvoke([SystemMessage(content="You draft organizational policies."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            sections = [PolicySection(**s) for s in result.get("sections", [])]
            return PolicyOutput(success=True, policy_title=result.get("title", ""), sections=sections, policy_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return PolicyOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# COMPLIANCE RUNNER
class ComplianceInput(TaskRunnerInput):
    subject: str = Field(..., description="Subject to assess")
    frameworks: List[str] = Field(default_factory=lambda: ["gdpr", "sox", "hipaa"])
    assessment_depth: str = Field(default="standard")

class ComplianceGap(TaskRunnerOutput):
    gap_id: str = Field(default="")
    framework: str = Field(default="")
    requirement: str = Field(default="")
    current_state: str = Field(default="")
    gap_description: str = Field(default="")
    severity: str = Field(default="medium")
    remediation: str = Field(default="")

class ComplianceOutput(TaskRunnerOutput):
    compliance_score: float = Field(default=0)
    gaps: List[ComplianceGap] = Field(default_factory=list)
    compliant_areas: List[str] = Field(default_factory=list)
    priority_actions: List[str] = Field(default_factory=list)
    compliance_summary: str = Field(default="")

@register_task_runner
class ComplianceRunner(TaskRunner[ComplianceInput, ComplianceOutput]):
    runner_id = "compliance"
    name = "Compliance Runner"
    description = "Assess compliance using regulatory frameworks"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "regulatory_frameworks"
    max_duration_seconds = 150
    InputType = ComplianceInput
    OutputType = ComplianceOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.1, max_tokens=4000)

    async def execute(self, input: ComplianceInput) -> ComplianceOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Assess compliance of {input.subject} against {input.frameworks}. Return JSON with gaps and score."
            response = await self.llm.ainvoke([SystemMessage(content="You assess regulatory compliance."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            gaps = [ComplianceGap(**g) for g in result.get("gaps", [])]
            return ComplianceOutput(success=True, compliance_score=float(result.get("score", 70)), gaps=gaps, priority_actions=result.get("actions", []), compliance_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return ComplianceOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# AUDIT RUNNER
class AuditInput(TaskRunnerInput):
    audit_subject: str = Field(..., description="Subject to audit")
    audit_type: str = Field(default="operational", description="financial | operational | compliance | performance")
    audit_scope: List[str] = Field(default_factory=list)

class AuditFinding(TaskRunnerOutput):
    finding_id: str = Field(default="")
    category: str = Field(default="")
    description: str = Field(default="")
    evidence: str = Field(default="")
    risk_rating: str = Field(default="medium")
    recommendation: str = Field(default="")

class AuditOutput(TaskRunnerOutput):
    audit_opinion: str = Field(default="")
    findings: List[AuditFinding] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    audit_summary: str = Field(default="")

@register_task_runner
class AuditRunner(TaskRunner[AuditInput, AuditOutput]):
    runner_id = "audit"
    name = "Audit Runner"
    description = "Conduct audit using audit methodology"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "audit_methodology"
    max_duration_seconds = 150
    InputType = AuditInput
    OutputType = AuditOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.1, max_tokens=4000)

    async def execute(self, input: AuditInput) -> AuditOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Conduct {input.audit_type} audit of {input.audit_subject}. Scope: {input.audit_scope}. Return JSON with findings."
            response = await self.llm.ainvoke([SystemMessage(content="You conduct rigorous audits."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            findings = [AuditFinding(**f) for f in result.get("findings", [])]
            return AuditOutput(success=True, audit_opinion=result.get("opinion", ""), findings=findings, recommendations=result.get("recommendations", []), audit_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return AuditOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# ETHICS RUNNER
class EthicsInput(TaskRunnerInput):
    situation: str = Field(..., description="Situation to evaluate")
    ethical_frameworks: List[str] = Field(default_factory=lambda: ["utilitarian", "deontological", "virtue"])
    stakeholders: List[str] = Field(default_factory=list)

class EthicalConsideration(TaskRunnerOutput):
    consideration_id: str = Field(default="")
    framework: str = Field(default="")
    principle: str = Field(default="")
    analysis: str = Field(default="")
    verdict: str = Field(default="")

class EthicsOutput(TaskRunnerOutput):
    ethical_assessment: str = Field(default="", description="ethical | questionable | unethical")
    considerations: List[EthicalConsideration] = Field(default_factory=list)
    stakeholder_impacts: Dict[str, str] = Field(default_factory=dict)
    recommendation: str = Field(default="")
    ethics_summary: str = Field(default="")

@register_task_runner
class EthicsRunner(TaskRunner[EthicsInput, EthicsOutput]):
    runner_id = "ethics"
    name = "Ethics Runner"
    description = "Evaluate ethics using ethical frameworks"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "ethical_frameworks"
    max_duration_seconds = 120
    InputType = EthicsInput
    OutputType = EthicsOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: EthicsInput) -> EthicsOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Evaluate ethics of: {input.situation}. Frameworks: {input.ethical_frameworks}. Stakeholders: {input.stakeholders}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You evaluate ethical implications."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            considerations = [EthicalConsideration(**c) for c in result.get("considerations", [])]
            return EthicsOutput(success=True, ethical_assessment=result.get("assessment", ""), considerations=considerations, recommendation=result.get("recommendation", ""), ethics_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return EthicsOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

__all__ = [
    "PolicyRunner", "PolicyInput", "PolicyOutput", "PolicySection",
    "ComplianceRunner", "ComplianceInput", "ComplianceOutput", "ComplianceGap",
    "AuditRunner", "AuditInput", "AuditOutput", "AuditFinding",
    "EthicsRunner", "EthicsInput", "EthicsOutput", "EthicalConsideration",
]
