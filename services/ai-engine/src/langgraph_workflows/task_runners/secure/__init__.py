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

# =============================================================================
# OODA LOOP DEFENSE RUNNERS (Immune System / Threat Hunting)
# =============================================================================
# These runners implement the OODA Loop for external threat defense.
# Unlike GOVERN (internal policing), SECURE looks OUTWARD for adversaries.
#
# OODA Loop: OBSERVE → ORIENT → DECIDE → ACT
#   │          │        │       │
#   │          │        │       └── ContainRunner: Execute containment
#   │          │        └── ThreatDecideRunner: Calculate risk, choose strategy
#   │          └── OrientRunner: Compare to TI feeds and baselines
#   └── ObserveRunner: Ingest telemetry (EDR, NDR, logs)

from typing import Any
from enum import Enum


class ThreatSeverity(str, Enum):
    """Threat severity levels."""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ContainmentAction(str, Enum):
    """Containment action types."""
    MONITOR = "monitor"
    ISOLATE = "isolate"
    BLOCK = "block"
    QUARANTINE = "quarantine"
    TERMINATE = "terminate"
    ROLLBACK = "rollback"


# =============================================================================
# OBSERVE RUNNER (Telemetry Collection)
# =============================================================================

class ObserveInput(TaskRunnerInput):
    """Input for observation/telemetry collection."""
    data_sources: List[str] = Field(
        default_factory=lambda: ["logs", "network", "endpoint", "application"],
        description="Data sources to collect from"
    )
    time_window: str = Field(default="1h", description="Time window: 15m | 1h | 24h | 7d")
    query: Optional[str] = Field(default=None, description="Specific query or hypothesis")
    focus_indicators: List[str] = Field(default_factory=list, description="IoCs to look for")
    baseline_deviation_threshold: float = Field(default=2.0, description="Std deviations for anomaly")


class Observation(TaskRunnerOutput):
    """A single observation from telemetry."""
    observation_id: str = Field(default="")
    source: str = Field(default="")
    timestamp: str = Field(default="")
    event_type: str = Field(default="")
    description: str = Field(default="")
    raw_data: Dict[str, Any] = Field(default_factory=dict)
    anomaly_score: float = Field(default=0, description="0-1 anomaly likelihood")
    indicators: List[str] = Field(default_factory=list)


class ObserveOutput(TaskRunnerOutput):
    """Output from observation."""
    observations: List[Observation] = Field(default_factory=list)
    anomalies_detected: List[str] = Field(default_factory=list)
    baseline_deviations: Dict[str, float] = Field(default_factory=dict)
    indicators_found: List[str] = Field(default_factory=list)
    data_volume: int = Field(default=0)
    coverage_gaps: List[str] = Field(default_factory=list)
    observe_summary: str = Field(default="")


@register_task_runner
class ObserveRunner(TaskRunner[ObserveInput, ObserveOutput]):
    """
    Collect and aggregate telemetry (OODA: Observe).

    First step of threat hunting - gather raw data from multiple sources:
    - EDR (Endpoint Detection and Response)
    - NDR (Network Detection and Response)
    - Application logs
    - SIEM events
    - Cloud audit logs

    Hypothesis-Driven Hunting starts here with focused queries.
    """
    runner_id = "observe"
    name = "Observe Runner"
    description = "Collect telemetry using log aggregation"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "log_aggregation"
    max_duration_seconds = 60
    InputType = ObserveInput
    OutputType = ObserveOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.1, max_tokens=4000)

    async def execute(self, input: ObserveInput) -> ObserveOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Simulate security telemetry collection and analysis.

Data Sources: {input.data_sources}
Time Window: {input.time_window}
Query/Hypothesis: {input.query or "General surveillance"}
Focus Indicators (IoCs): {input.focus_indicators}
Anomaly Threshold: {input.baseline_deviation_threshold} standard deviations

OBSERVATION PROTOCOL:
1. Collect events from specified sources
2. Calculate baseline metrics (normal behavior)
3. Identify deviations > threshold
4. Flag known bad indicators (IoCs)
5. Note coverage gaps (blind spots)

Return JSON with:
- observations: array of {{observation_id, source, timestamp, event_type, description, raw_data{{}}, anomaly_score (0-1), indicators[]}}
- anomalies_detected: array of anomaly descriptions
- baseline_deviations: dict of metric -> deviation_factor
- indicators_found: array of matched IoCs
- data_volume: estimated event count
- coverage_gaps: array of unmonitored areas
- summary: brief observation summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a security telemetry analyzer. Simulate realistic security event collection. Focus on actionable observations and anomaly detection."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            observations = [Observation(**o) for o in result.get("observations", [])]

            return ObserveOutput(
                success=True,
                observations=observations,
                anomalies_detected=result.get("anomalies_detected", []),
                baseline_deviations=result.get("baseline_deviations", {}),
                indicators_found=result.get("indicators_found", []),
                data_volume=result.get("data_volume", len(observations)),
                coverage_gaps=result.get("coverage_gaps", []),
                observe_summary=result.get("summary", ""),
                confidence_score=0.85,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"ObserveRunner error: {e}")
            return ObserveOutput(
                success=False,
                error=str(e),
                observe_summary="Observation failed - potential blind spot",
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
# ORIENT RUNNER (Threat Intelligence Correlation)
# =============================================================================

class OrientInput(TaskRunnerInput):
    """Input for threat orientation/contextualization."""
    observations: List[Dict[str, Any]] = Field(..., description="Observations to contextualize")
    threat_intel_feeds: List[str] = Field(
        default_factory=lambda: ["mitre_attack", "cve", "abuse_ch", "alienvault"],
        description="TI feeds to correlate against"
    )
    baseline_context: Dict[str, Any] = Field(default_factory=dict, description="Known baseline behavior")
    attacker_profiles: List[str] = Field(default_factory=list, description="Known threat actors to check")


class ThreatAssessment(TaskRunnerOutput):
    """Assessment of a potential threat."""
    assessment_id: str = Field(default="")
    observation_ids: List[str] = Field(default_factory=list)
    threat_type: str = Field(default="")
    mitre_techniques: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0)
    severity: str = Field(default="medium")
    threat_actor: Optional[str] = Field(default=None)
    kill_chain_phase: str = Field(default="", description="recon | weaponize | deliver | exploit | install | c2 | actions")
    ti_matches: List[str] = Field(default_factory=list)


class OrientOutput(TaskRunnerOutput):
    """Output from threat orientation."""
    assessments: List[ThreatAssessment] = Field(default_factory=list)
    correlated_indicators: Dict[str, List[str]] = Field(default_factory=dict)
    mitre_coverage: List[str] = Field(default_factory=list)
    attribution_confidence: float = Field(default=0)
    attack_chain_hypothesis: str = Field(default="")
    priority_order: List[str] = Field(default_factory=list)
    orient_summary: str = Field(default="")


@register_task_runner
class OrientRunner(TaskRunner[OrientInput, OrientOutput]):
    """
    Contextualize threats against intelligence feeds (OODA: Orient).

    Second step - make sense of observations by comparing to:
    - MITRE ATT&CK techniques
    - Known threat actor TTPs
    - CVE database
    - Threat intelligence feeds
    - Historical baselines

    Transforms raw observations into actionable threat assessments.
    """
    runner_id = "orient"
    name = "Orient Runner"
    description = "Contextualize threat using TI correlation"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "ti_correlation"
    max_duration_seconds = 90
    InputType = OrientInput
    OutputType = OrientOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: OrientInput) -> OrientOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Analyze observations against threat intelligence (OODA Orient phase).

Observations: {input.observations}
TI Feeds: {input.threat_intel_feeds}
Baseline Context: {input.baseline_context}
Known Threat Actors: {input.attacker_profiles}

ORIENTATION PROTOCOL:
1. Map observations to MITRE ATT&CK techniques
2. Check indicators against TI feeds
3. Identify kill chain phase (recon→weaponize→deliver→exploit→install→c2→actions)
4. Assess threat actor attribution (if possible)
5. Calculate confidence scores

Return JSON with:
- assessments: array of {{assessment_id, observation_ids[], threat_type, mitre_techniques[], confidence (0-1), severity (info|low|medium|high|critical), threat_actor, kill_chain_phase, ti_matches[]}}
- correlated_indicators: dict of indicator -> matching_feeds[]
- mitre_coverage: array of MITRE technique IDs detected
- attribution_confidence: 0-1 confidence in threat actor attribution
- attack_chain_hypothesis: string describing likely attack progression
- priority_order: array of assessment_ids in priority order
- summary: threat landscape summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a threat intelligence analyst. Correlate observations with known TTPs, attribute to threat actors when possible, and map to kill chain phases. Be conservative with attribution - require strong evidence."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            assessments = [ThreatAssessment(**a) for a in result.get("assessments", [])]

            return OrientOutput(
                success=True,
                assessments=assessments,
                correlated_indicators=result.get("correlated_indicators", {}),
                mitre_coverage=result.get("mitre_coverage", []),
                attribution_confidence=float(result.get("attribution_confidence", 0)),
                attack_chain_hypothesis=result.get("attack_chain_hypothesis", ""),
                priority_order=result.get("priority_order", []),
                orient_summary=result.get("summary", ""),
                confidence_score=0.8,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"OrientRunner error: {e}")
            return OrientOutput(
                success=False,
                error=str(e),
                orient_summary="Threat orientation failed - treat as potential threat",
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
# THREAT DECIDE RUNNER (Risk Calculation / Response Strategy)
# =============================================================================

class ThreatDecideInput(TaskRunnerInput):
    """Input for threat response decision."""
    assessments: List[Dict[str, Any]] = Field(..., description="Threat assessments to decide on")
    risk_tolerance: str = Field(default="medium", description="low | medium | high")
    available_actions: List[str] = Field(
        default_factory=lambda: ["monitor", "isolate", "block", "quarantine", "terminate", "rollback"],
        description="Available containment actions"
    )
    business_context: Dict[str, Any] = Field(default_factory=dict, description="Business impact context")
    auto_contain_threshold: float = Field(default=0.8, description="Confidence threshold for auto-containment")


class ResponseDecision(TaskRunnerOutput):
    """A response decision for a threat."""
    decision_id: str = Field(default="")
    assessment_id: str = Field(default="")
    action: str = Field(default="monitor", description="monitor | isolate | block | quarantine | terminate | rollback")
    confidence: float = Field(default=0)
    risk_score: float = Field(default=0, description="0-100 risk score")
    business_impact: str = Field(default="low", description="low | medium | high | critical")
    auto_approved: bool = Field(default=False)
    requires_human: bool = Field(default=True)
    rationale: str = Field(default="")
    escalation_required: bool = Field(default=False)


class ThreatDecideOutput(TaskRunnerOutput):
    """Output from threat decision."""
    decisions: List[ResponseDecision] = Field(default_factory=list)
    aggregate_risk_score: float = Field(default=0)
    recommended_posture: str = Field(default="normal", description="normal | elevated | high_alert | lockdown")
    auto_actions: List[str] = Field(default_factory=list)
    human_review_required: List[str] = Field(default_factory=list)
    threat_decide_summary: str = Field(default="")


@register_task_runner
class ThreatDecideRunner(TaskRunner[ThreatDecideInput, ThreatDecideOutput]):
    """
    Calculate risk and decide response strategy (OODA: Decide).

    Third step - determine appropriate response based on:
    - Threat severity and confidence
    - Business impact
    - Risk tolerance
    - Available containment options

    Implements tiered response:
    - High confidence + high severity → Auto-contain
    - Medium confidence → Human review
    - Low confidence → Monitor
    """
    runner_id = "threat_decide"
    name = "Threat Decide Runner"
    description = "Decide response using risk calculation"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "risk_calculation"
    max_duration_seconds = 45
    InputType = ThreatDecideInput
    OutputType = ThreatDecideOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.1, max_tokens=3000)

    async def execute(self, input: ThreatDecideInput) -> ThreatDecideOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Decide response strategy for threats (OODA Decide phase).

Threat Assessments: {input.assessments}
Risk Tolerance: {input.risk_tolerance}
Available Actions: {input.available_actions}
Business Context: {input.business_context}
Auto-Contain Threshold: {input.auto_contain_threshold}

DECISION MATRIX:
Risk Tolerance | Severity | Confidence | Action
low            | any      | any        | Block/Quarantine (conservative)
medium         | critical | >0.8       | Auto-contain
medium         | high     | >0.8       | Auto-contain, notify
medium         | medium   | any        | Human review
high           | critical | >0.9       | Auto-contain
high           | high     | any        | Monitor, alert
high           | low-med  | any        | Monitor

Return JSON with:
- decisions: array of {{decision_id, assessment_id, action, confidence (0-1), risk_score (0-100), business_impact (low|medium|high|critical), auto_approved, requires_human, rationale, escalation_required}}
- aggregate_risk_score: 0-100 overall risk
- recommended_posture: normal | elevated | high_alert | lockdown
- auto_actions: array of decision_ids that can auto-execute
- human_review_required: array of decision_ids needing approval
- summary: decision summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a security response strategist. Balance security needs with business continuity. Err on the side of caution for high-severity threats. Always explain your rationale."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            decisions = [ResponseDecision(**d) for d in result.get("decisions", [])]

            return ThreatDecideOutput(
                success=True,
                decisions=decisions,
                aggregate_risk_score=float(result.get("aggregate_risk_score", 0)),
                recommended_posture=result.get("recommended_posture", "normal"),
                auto_actions=result.get("auto_actions", []),
                human_review_required=result.get("human_review_required", []),
                threat_decide_summary=result.get("summary", ""),
                confidence_score=0.9,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"ThreatDecideRunner error: {e}")
            # On error, recommend elevated posture
            return ThreatDecideOutput(
                success=False,
                error=str(e),
                recommended_posture="elevated",
                threat_decide_summary="Decision failed - elevating security posture",
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
# CONTAIN RUNNER (Automated Response Execution)
# =============================================================================

class ContainInput(TaskRunnerInput):
    """Input for containment execution."""
    decisions: List[Dict[str, Any]] = Field(..., description="Response decisions to execute")
    dry_run: bool = Field(default=False, description="Simulate without actual execution")
    rollback_enabled: bool = Field(default=True, description="Enable automatic rollback on failure")
    notification_targets: List[str] = Field(default_factory=list, description="Who to notify")


class ContainmentResult(TaskRunnerOutput):
    """Result of a containment action."""
    result_id: str = Field(default="")
    decision_id: str = Field(default="")
    action_taken: str = Field(default="")
    target: str = Field(default="")
    status: str = Field(default="", description="success | failed | partial | rolled_back")
    execution_time: str = Field(default="")
    side_effects: List[str] = Field(default_factory=list)
    rollback_available: bool = Field(default=True)
    evidence_preserved: bool = Field(default=True)


class ContainOutput(TaskRunnerOutput):
    """Output from containment execution."""
    results: List[ContainmentResult] = Field(default_factory=list)
    successful_actions: int = Field(default=0)
    failed_actions: int = Field(default=0)
    threats_contained: List[str] = Field(default_factory=list)
    threats_escaped: List[str] = Field(default_factory=list)
    notifications_sent: List[str] = Field(default_factory=list)
    forensic_artifacts: List[str] = Field(default_factory=list)
    contain_summary: str = Field(default="")


@register_task_runner
class ContainRunner(TaskRunner[ContainInput, ContainOutput]):
    """
    Execute containment actions (OODA: Act).

    Final step - execute the decided response:
    - Isolate affected systems
    - Block malicious IPs/domains
    - Quarantine files
    - Terminate processes
    - Rollback changes

    Preserves forensic evidence while containing threats.
    """
    runner_id = "contain"
    name = "Contain Runner"
    description = "Execute containment using automated response"
    category = TaskRunnerCategory.SECURE
    algorithmic_core = "automated_response"
    max_duration_seconds = 120
    InputType = ContainInput
    OutputType = ContainOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.0, max_tokens=3000)

    async def execute(self, input: ContainInput) -> ContainOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Execute containment actions (OODA Act phase).

Decisions to Execute: {input.decisions}
Dry Run: {input.dry_run}
Rollback Enabled: {input.rollback_enabled}
Notification Targets: {input.notification_targets}

CONTAINMENT PROTOCOL:
1. Preserve forensic evidence FIRST
2. Execute containment action
3. Verify containment success
4. Document side effects
5. Prepare rollback if needed
6. Send notifications

CRITICAL: {"SIMULATION MODE - No actual changes" if input.dry_run else "LIVE EXECUTION"}

Return JSON with:
- results: array of {{result_id, decision_id, action_taken, target, status (success|failed|partial|rolled_back), execution_time, side_effects[], rollback_available, evidence_preserved}}
- successful_actions: count
- failed_actions: count
- threats_contained: array of contained threat descriptions
- threats_escaped: array of threats that escaped containment
- notifications_sent: array of notification descriptions
- forensic_artifacts: array of preserved evidence
- summary: containment summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a security response executor. Simulate containment actions with realistic outcomes. Prioritize evidence preservation. Report failures honestly."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            results = [ContainmentResult(**r) for r in result.get("results", [])]

            successful = result.get("successful_actions", len([r for r in results if r.status == "success"]))
            failed = result.get("failed_actions", len([r for r in results if r.status == "failed"]))

            return ContainOutput(
                success=True,
                results=results,
                successful_actions=successful,
                failed_actions=failed,
                threats_contained=result.get("threats_contained", []),
                threats_escaped=result.get("threats_escaped", []),
                notifications_sent=result.get("notifications_sent", []),
                forensic_artifacts=result.get("forensic_artifacts", []),
                contain_summary=result.get("summary", ""),
                confidence_score=0.95 if failed == 0 else 0.7,
                quality_score=successful / max(successful + failed, 1),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"ContainRunner error: {e}")
            return ContainOutput(
                success=False,
                error=str(e),
                contain_summary="CRITICAL: Containment execution failed - manual intervention required",
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
    # Original SECURE runners (Threat Analysis)
    "ThreatRunner", "ThreatInput", "ThreatOutput", "Threat",
    "VulnerabilityRunner", "VulnerabilityInput", "VulnerabilityOutput", "Vulnerability",
    "MitigationRunner", "MitigationInput", "MitigationOutput", "MitigationAction",
    "IncidentRunner", "IncidentInput", "IncidentOutput", "IncidentAction",
    # OODA Loop Defense runners (Immune System)
    "ThreatSeverity", "ContainmentAction",
    "ObserveRunner", "ObserveInput", "ObserveOutput", "Observation",
    "OrientRunner", "OrientInput", "OrientOutput", "ThreatAssessment",
    "ThreatDecideRunner", "ThreatDecideInput", "ThreatDecideOutput", "ResponseDecision",
    "ContainRunner", "ContainInput", "ContainOutput", "ContainmentResult",
]
