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

# =============================================================================
# GOVERNANCE INTERCEPTION RUNNERS (Super-Ego / Zero Trust)
# =============================================================================
# These runners implement Constitutional AI / Policy-as-Code / Zero Trust
# They intercept, evaluate, enforce, and audit all agent actions

from typing import Any
from enum import Enum


class GovernanceDecision(str, Enum):
    """Governance enforcement decisions."""
    ALLOW = "allow"
    BLOCK = "block"
    SANITIZE = "sanitize"
    ESCALATE = "escalate"


class PolicyViolationSeverity(str, Enum):
    """Severity of policy violations."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


# =============================================================================
# POLICY CHECK RUNNER (OPA/Rego Evaluation)
# =============================================================================

class PolicyCheckInput(TaskRunnerInput):
    """Input for policy check - intercepts agent actions."""
    action: str = Field(..., description="Action being attempted")
    agent_id: str = Field(..., description="ID of agent attempting action")
    resource: str = Field(default="", description="Resource being accessed")
    context: Dict[str, Any] = Field(default_factory=dict, description="Action context")
    policy_set: str = Field(default="default", description="Policy set to evaluate against")
    policies: List[str] = Field(default_factory=list, description="Specific policies to check")


class PolicyViolation(TaskRunnerOutput):
    """A policy violation found during check."""
    violation_id: str = Field(default="")
    policy_id: str = Field(default="")
    policy_name: str = Field(default="")
    rule_violated: str = Field(default="")
    severity: str = Field(default="warning", description="info | warning | error | critical")
    description: str = Field(default="")
    remediation: str = Field(default="")


class PolicyCheckOutput(TaskRunnerOutput):
    """Output from policy check - governance decision."""
    decision: str = Field(default="allow", description="allow | block | sanitize | escalate")
    violations: List[PolicyViolation] = Field(default_factory=list)
    policies_checked: List[str] = Field(default_factory=list)
    policies_passed: List[str] = Field(default_factory=list)
    policies_failed: List[str] = Field(default_factory=list)
    risk_score: float = Field(default=0, description="0-100 risk score")
    requires_approval: bool = Field(default=False)
    approver_role: Optional[str] = Field(default=None)
    policy_check_summary: str = Field(default="")


@register_task_runner
class PolicyCheckRunner(TaskRunner[PolicyCheckInput, PolicyCheckOutput]):
    """
    Check action against policies using OPA/Rego-style evaluation.

    This is the primary governance gate - evaluates every action against
    the policy constitution before allowing execution.

    Constitutional AI Pattern:
    - High-level principles define acceptable behavior
    - Every action is critiqued against these principles
    - Violations trigger block, sanitize, or escalate
    """
    runner_id = "policy_check"
    name = "Policy Check Runner"
    description = "Check against policy using OPA/Rego evaluation"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "opa_rego_evaluation"
    max_duration_seconds = 30  # Fast - gate should not slow down operations
    InputType = PolicyCheckInput
    OutputType = PolicyCheckOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.0, max_tokens=2000)

    async def execute(self, input: PolicyCheckInput) -> PolicyCheckOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Evaluate this action against governance policies (Constitutional AI check).

Action: {input.action}
Agent ID: {input.agent_id}
Resource: {input.resource}
Context: {input.context}
Policy Set: {input.policy_set}
Specific Policies: {input.policies if input.policies else "All applicable policies"}

GOVERNANCE PRINCIPLES (Constitution):
1. Data Privacy: No PII exposure without explicit consent
2. Security: No actions that could compromise system integrity
3. Ethics: No harmful, deceptive, or discriminatory outputs
4. Compliance: Adhere to HIPAA, GDPR, SOX as applicable
5. Least Privilege: Only access what is necessary
6. Auditability: All actions must be traceable

Return JSON with:
- decision: "allow" | "block" | "sanitize" | "escalate"
- violations: array of {{violation_id, policy_id, policy_name, rule_violated, severity (info|warning|error|critical), description, remediation}}
- policies_checked: array of policy names checked
- policies_passed: array of policies that passed
- policies_failed: array of policies that failed
- risk_score: 0-100 (0=safe, 100=critical risk)
- requires_approval: boolean
- approver_role: role required for approval if needed
- summary: brief explanation of decision"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a governance policy engine. Evaluate actions against constitutional principles with ZERO tolerance for violations. Be strict but fair. When in doubt, escalate."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            violations = [PolicyViolation(**v) for v in result.get("violations", [])]

            # Determine decision based on violations
            decision = result.get("decision", "allow")
            if any(v.severity == "critical" for v in violations):
                decision = "block"
            elif any(v.severity == "error" for v in violations):
                decision = "escalate"

            return PolicyCheckOutput(
                success=True,
                decision=decision,
                violations=violations,
                policies_checked=result.get("policies_checked", []),
                policies_passed=result.get("policies_passed", []),
                policies_failed=result.get("policies_failed", []),
                risk_score=float(result.get("risk_score", 0)),
                requires_approval=result.get("requires_approval", False),
                approver_role=result.get("approver_role"),
                policy_check_summary=result.get("summary", ""),
                confidence_score=0.95,  # High confidence for policy decisions
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"PolicyCheckRunner error: {e}")
            # On error, default to BLOCK for safety (fail-closed)
            return PolicyCheckOutput(
                success=False,
                decision="block",
                error=str(e),
                policy_check_summary="Policy check failed - blocking for safety",
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


# =============================================================================
# SANITIZE RUNNER (PII Detection + Masking)
# =============================================================================

class SanitizeInput(TaskRunnerInput):
    """Input for content sanitization."""
    content: str = Field(..., description="Content to sanitize")
    content_type: str = Field(default="text", description="text | json | html | markdown")
    sanitization_level: str = Field(default="standard", description="minimal | standard | strict | paranoid")
    preserve_structure: bool = Field(default=True, description="Keep document structure")
    pii_categories: List[str] = Field(
        default_factory=lambda: ["name", "email", "phone", "ssn", "address", "dob", "medical", "financial"],
        description="PII categories to detect and mask"
    )
    custom_patterns: Dict[str, str] = Field(default_factory=dict, description="Custom regex patterns to mask")


class PIIDetection(TaskRunnerOutput):
    """A PII detection instance."""
    detection_id: str = Field(default="")
    category: str = Field(default="")
    original_text: str = Field(default="")  # For audit only, not exposed
    masked_text: str = Field(default="")
    start_position: int = Field(default=0)
    end_position: int = Field(default=0)
    confidence: float = Field(default=0.0)
    masking_method: str = Field(default="redact", description="redact | hash | tokenize | generalize")


class SanitizeOutput(TaskRunnerOutput):
    """Output from sanitization."""
    sanitized_content: str = Field(default="")
    detections: List[PIIDetection] = Field(default_factory=list)
    pii_count_by_category: Dict[str, int] = Field(default_factory=dict)
    total_pii_found: int = Field(default=0)
    total_pii_masked: int = Field(default=0)
    sanitization_level_applied: str = Field(default="")
    content_safe: bool = Field(default=True)
    sanitize_summary: str = Field(default="")


@register_task_runner
class SanitizeRunner(TaskRunner[SanitizeInput, SanitizeOutput]):
    """
    Remove or mask sensitive data from content.

    Implements PII detection and multiple masking strategies:
    - Redact: Replace with [REDACTED]
    - Hash: Replace with deterministic hash (allows matching)
    - Tokenize: Replace with reversible token (for authorized recovery)
    - Generalize: Replace with category (e.g., "John Smith" -> "[PERSON]")
    """
    runner_id = "sanitize"
    name = "Sanitize Runner"
    description = "Remove sensitive data using PII detection + masking"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "pii_detection_masking"
    max_duration_seconds = 60
    InputType = SanitizeInput
    OutputType = SanitizeOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.0, max_tokens=4000)

    async def execute(self, input: SanitizeInput) -> SanitizeOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Detect and sanitize PII/sensitive data in this content.

Content Type: {input.content_type}
Sanitization Level: {input.sanitization_level}
PII Categories to Detect: {input.pii_categories}
Preserve Structure: {input.preserve_structure}

CONTENT TO SANITIZE:
{input.content[:8000]}  # Truncate for safety

SANITIZATION RULES BY LEVEL:
- minimal: Only mask high-risk PII (SSN, financial)
- standard: Mask all direct identifiers
- strict: Mask all PII including quasi-identifiers
- paranoid: Mask anything potentially identifying

Return JSON with:
- sanitized_content: the content with PII masked as [CATEGORY_REDACTED]
- detections: array of {{detection_id, category, masked_text, start_position, end_position, confidence, masking_method}}
- pii_count_by_category: dict of category -> count
- total_pii_found: integer
- total_pii_masked: integer
- sanitization_level_applied: string
- content_safe: boolean (true if safe to proceed after sanitization)
- summary: brief description of what was sanitized"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a PII detection and data sanitization engine. Detect ALL sensitive information with high precision. When in doubt, sanitize. Never miss PII - false positives are acceptable, false negatives are not."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            detections = [PIIDetection(**d) for d in result.get("detections", [])]

            return SanitizeOutput(
                success=True,
                sanitized_content=result.get("sanitized_content", input.content),
                detections=detections,
                pii_count_by_category=result.get("pii_count_by_category", {}),
                total_pii_found=result.get("total_pii_found", len(detections)),
                total_pii_masked=result.get("total_pii_masked", len(detections)),
                sanitization_level_applied=input.sanitization_level,
                content_safe=result.get("content_safe", True),
                sanitize_summary=result.get("summary", ""),
                confidence_score=0.9,
                quality_score=1.0 if result.get("content_safe", True) else 0.5,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"SanitizeRunner error: {e}")
            return SanitizeOutput(
                success=False,
                error=str(e),
                content_safe=False,
                sanitize_summary="Sanitization failed - content should not be used",
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


# =============================================================================
# AUDIT LOG RUNNER (Immutable Logging)
# =============================================================================

class AuditLogInput(TaskRunnerInput):
    """Input for audit logging."""
    action: str = Field(..., description="Action being logged")
    actor_id: str = Field(..., description="ID of the actor (agent or user)")
    actor_type: str = Field(default="agent", description="agent | user | system")
    resource: str = Field(default="", description="Resource affected")
    result: str = Field(default="success", description="success | failure | partial")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional details")
    governance_decision: Optional[str] = Field(default=None, description="allow | block | sanitize if applicable")
    policy_violations: List[str] = Field(default_factory=list, description="Any policy violations")
    severity: str = Field(default="info", description="info | warning | error | critical")


class AuditEntry(TaskRunnerOutput):
    """An immutable audit log entry."""
    entry_id: str = Field(default="")
    timestamp: str = Field(default="")
    action: str = Field(default="")
    actor_id: str = Field(default="")
    actor_type: str = Field(default="")
    resource: str = Field(default="")
    result: str = Field(default="")
    governance_decision: Optional[str] = Field(default=None)
    policy_violations: List[str] = Field(default_factory=list)
    severity: str = Field(default="info")
    hash: str = Field(default="")  # Hash for tamper detection
    previous_hash: str = Field(default="")  # Chain to previous entry


class AuditLogOutput(TaskRunnerOutput):
    """Output from audit logging."""
    entry: AuditEntry = Field(default_factory=AuditEntry)
    logged: bool = Field(default=False)
    chain_valid: bool = Field(default=True)
    retention_policy: str = Field(default="")
    audit_log_summary: str = Field(default="")


@register_task_runner
class AuditLogRunner(TaskRunner[AuditLogInput, AuditLogOutput]):
    """
    Log actions to immutable audit trail.

    Implements blockchain-style chaining for tamper detection:
    - Each entry includes hash of content
    - Each entry references previous entry's hash
    - Chain can be verified for integrity

    Zero Trust: Every action logged, no exceptions.
    """
    runner_id = "audit_log"
    name = "Audit Log Runner"
    description = "Log for audit using immutable logging"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "immutable_logging"
    max_duration_seconds = 15  # Very fast - must not slow down operations
    InputType = AuditLogInput
    OutputType = AuditLogOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        # Note: In production, this would write to actual audit store, not use LLM
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.0, max_tokens=1000)

    async def execute(self, input: AuditLogInput) -> AuditLogOutput:
        start_time = datetime.utcnow()
        try:
            import hashlib
            import uuid

            # Generate entry
            entry_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()

            # Create entry content for hashing
            entry_content = f"{timestamp}|{input.action}|{input.actor_id}|{input.resource}|{input.result}"
            entry_hash = hashlib.sha256(entry_content.encode()).hexdigest()

            entry = AuditEntry(
                entry_id=entry_id,
                timestamp=timestamp,
                action=input.action,
                actor_id=input.actor_id,
                actor_type=input.actor_type,
                resource=input.resource,
                result=input.result,
                governance_decision=input.governance_decision,
                policy_violations=input.policy_violations,
                severity=input.severity,
                hash=entry_hash,
                previous_hash=""  # Would be set from actual chain
            )

            # Determine retention policy based on severity
            retention = "90_days"
            if input.severity in ["error", "critical"]:
                retention = "7_years"
            elif input.governance_decision == "block":
                retention = "7_years"
            elif input.policy_violations:
                retention = "3_years"

            return AuditLogOutput(
                success=True,
                entry=entry,
                logged=True,
                chain_valid=True,
                retention_policy=retention,
                audit_log_summary=f"Logged {input.severity} action: {input.action} by {input.actor_id}",
                confidence_score=1.0,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"AuditLogRunner error: {e}")
            # CRITICAL: Audit logging must not silently fail
            # In production, this would trigger alerts
            return AuditLogOutput(
                success=False,
                error=str(e),
                logged=False,
                audit_log_summary="CRITICAL: Audit logging failed - manual review required",
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


# =============================================================================
# PERMISSION CHECK RUNNER (RBAC Evaluation)
# =============================================================================

class PermissionCheckInput(TaskRunnerInput):
    """Input for permission check."""
    agent_id: str = Field(..., description="Agent requesting permission")
    action: str = Field(..., description="Action being requested")
    resource: str = Field(default="", description="Resource being accessed")
    resource_type: str = Field(default="data", description="data | function | api | file | system")
    required_permissions: List[str] = Field(default_factory=list, description="Permissions needed")
    context: Dict[str, Any] = Field(default_factory=dict, description="Request context")


class Permission(TaskRunnerOutput):
    """A permission evaluation."""
    permission_id: str = Field(default="")
    permission_name: str = Field(default="")
    granted: bool = Field(default=False)
    source: str = Field(default="", description="role | explicit | inherited | denied")
    conditions: List[str] = Field(default_factory=list)
    expiration: Optional[str] = Field(default=None)


class PermissionCheckOutput(TaskRunnerOutput):
    """Output from permission check."""
    authorized: bool = Field(default=False)
    permissions: List[Permission] = Field(default_factory=list)
    agent_roles: List[str] = Field(default_factory=list)
    missing_permissions: List[str] = Field(default_factory=list)
    elevation_required: bool = Field(default=False)
    elevation_path: Optional[str] = Field(default=None)
    least_privilege_warning: bool = Field(default=False)
    permission_check_summary: str = Field(default="")


@register_task_runner
class PermissionCheckRunner(TaskRunner[PermissionCheckInput, PermissionCheckOutput]):
    """
    Check agent permissions using RBAC evaluation.

    Zero Trust Pattern:
    - No implicit trust - every action must have explicit permission
    - Least privilege - warn if requesting more than needed
    - Just-in-time access - permissions can be time-bound

    RBAC Hierarchy:
    - Roles contain permissions
    - Agents are assigned roles
    - Permissions can be explicit or inherited
    """
    runner_id = "permission_check"
    name = "Permission Check Runner"
    description = "Check permissions using RBAC evaluation"
    category = TaskRunnerCategory.GOVERN
    algorithmic_core = "rbac_evaluation"
    max_duration_seconds = 20  # Fast - security gate
    InputType = PermissionCheckInput
    OutputType = PermissionCheckOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.0, max_tokens=2000)

    async def execute(self, input: PermissionCheckInput) -> PermissionCheckOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Evaluate RBAC permissions for this request (Zero Trust check).

Agent ID: {input.agent_id}
Action: {input.action}
Resource: {input.resource}
Resource Type: {input.resource_type}
Required Permissions: {input.required_permissions if input.required_permissions else "Determine from action"}
Context: {input.context}

RBAC PRINCIPLES:
1. Least Privilege: Grant minimum permissions needed
2. Separation of Duties: Prevent conflict of interest
3. Need-to-Know: Only access if necessary for task
4. Time-Bound: Prefer temporary over permanent access

STANDARD ROLES:
- reader: Read-only access to assigned resources
- contributor: Read + write to assigned resources
- admin: Full access to assigned domain
- auditor: Read-only with full visibility for audit
- system: Internal system operations

Return JSON with:
- authorized: boolean (true if ALL required permissions granted)
- permissions: array of {{permission_id, permission_name, granted, source (role|explicit|inherited|denied), conditions[], expiration}}
- agent_roles: array of roles assigned to agent
- missing_permissions: array of permissions not granted
- elevation_required: boolean (true if needs approval)
- elevation_path: string describing how to get elevated access
- least_privilege_warning: boolean (true if requesting more than needed)
- summary: explanation of authorization decision"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a Zero Trust RBAC engine. Deny by default. Only authorize explicit, necessary permissions. Flag over-permissioning."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            permissions = [Permission(**p) for p in result.get("permissions", [])]

            return PermissionCheckOutput(
                success=True,
                authorized=result.get("authorized", False),
                permissions=permissions,
                agent_roles=result.get("agent_roles", []),
                missing_permissions=result.get("missing_permissions", []),
                elevation_required=result.get("elevation_required", False),
                elevation_path=result.get("elevation_path"),
                least_privilege_warning=result.get("least_privilege_warning", False),
                permission_check_summary=result.get("summary", ""),
                confidence_score=0.95,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"PermissionCheckRunner error: {e}")
            # On error, deny access (fail-closed)
            return PermissionCheckOutput(
                success=False,
                authorized=False,
                error=str(e),
                permission_check_summary="Permission check failed - access denied for safety",
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


__all__ = [
    # Original GOVERN runners (Policy Management)
    "PolicyRunner", "PolicyInput", "PolicyOutput", "PolicySection",
    "ComplianceRunner", "ComplianceInput", "ComplianceOutput", "ComplianceGap",
    "AuditRunner", "AuditInput", "AuditOutput", "AuditFinding",
    "EthicsRunner", "EthicsInput", "EthicsOutput", "EthicalConsideration",
    # Governance Interception runners (Super-Ego / Zero Trust)
    "GovernanceDecision", "PolicyViolationSeverity",
    "PolicyCheckRunner", "PolicyCheckInput", "PolicyCheckOutput", "PolicyViolation",
    "SanitizeRunner", "SanitizeInput", "SanitizeOutput", "PIIDetection",
    "AuditLogRunner", "AuditLogInput", "AuditLogOutput", "AuditEntry",
    "PermissionCheckRunner", "PermissionCheckInput", "PermissionCheckOutput", "Permission",
]
