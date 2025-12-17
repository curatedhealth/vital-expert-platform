"""
VALIDATE Category - Expert Position Validator Runner

Validates positioning strategies against expert/stakeholder perspectives,
ensuring claims are supportable and messaging aligns with credible evidence.

Core Logic: Expert Validation / Credibility Assessment
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

class ExpertValidation(TaskRunnerOutput):
    """Validation from an expert perspective."""
    expert_type: str = Field(default="", description="Type of expert (clinical, scientific, commercial, regulatory)")
    perspective_name: str = Field(default="")
    support_level: str = Field(default="neutral", description="strong_support | support | neutral | skeptical | opposed")
    rationale: str = Field(default="")
    key_concerns: List[str] = Field(default_factory=list)
    evidence_requirements: List[str] = Field(default_factory=list)
    credibility_score: float = Field(default=0.5, description="0-1 how credible this positioning is to this expert")


class ClaimValidation(TaskRunnerOutput):
    """Validation of a positioning claim."""
    claim_id: str = Field(default="")
    claim_text: str = Field(default="")
    is_supportable: bool = Field(default=False)
    evidence_strength: str = Field(default="moderate", description="weak | moderate | strong | definitive")
    evidence_gaps: List[str] = Field(default_factory=list)
    expert_consensus: str = Field(default="mixed", description="unanimous | majority | mixed | divided | minority")
    risk_of_challenge: str = Field(default="medium", description="low | medium | high")
    recommended_modifications: List[str] = Field(default_factory=list)


class ExpertPositionValidatorInput(TaskRunnerInput):
    """Input for expert position validation."""
    positioning_statement: str = Field(..., description="Positioning statement to validate")
    claims: List[str] = Field(default_factory=list, description="Key claims in the positioning")
    target_experts: List[str] = Field(default_factory=list, description="Expert types to validate against")
    supporting_evidence: List[Dict[str, Any]] = Field(default_factory=list, description="Evidence supporting claims")
    competitive_context: str = Field(default="", description="Competitive positioning context")
    validation_stringency: str = Field(default="standard", description="lenient | standard | stringent")


class ExpertPositionValidatorOutput(TaskRunnerOutput):
    """Output from expert position validation."""
    overall_validity: str = Field(default="mixed", description="strong | moderate | weak | invalid")
    validity_score: float = Field(default=0.0, description="0-100")
    expert_validations: List[ExpertValidation] = Field(default_factory=list)
    claim_validations: List[ClaimValidation] = Field(default_factory=list)
    unsupportable_claims: List[str] = Field(default_factory=list)
    evidence_gaps: List[str] = Field(default_factory=list)
    positioning_risks: List[str] = Field(default_factory=list)
    recommended_adjustments: List[str] = Field(default_factory=list)
    validation_summary: str = Field(default="")


# =============================================================================
# EXPERT POSITION VALIDATOR RUNNER
# =============================================================================

@register_task_runner
class ExpertPositionValidatorRunner(TaskRunner[ExpertPositionValidatorInput, ExpertPositionValidatorOutput]):
    """
    Validate positioning against expert/stakeholder perspectives.

    Algorithmic Core: expert_credibility_validation
    Temperature: 0.3 (balanced analysis)

    Validates:
    - Claim supportability with evidence
    - Expert consensus alignment
    - Evidence strength assessment
    - Risk of credibility challenges
    - Stakeholder acceptance likelihood
    """
    runner_id = "expert_position_validator"
    name = "Expert Position Validator Runner"
    description = "Validate positioning using expert credibility assessment"
    category = TaskRunnerCategory.VALIDATE
    algorithmic_core = "expert_credibility_validation"
    max_duration_seconds = 120
    InputType = ExpertPositionValidatorInput
    OutputType = ExpertPositionValidatorOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=4000)

    async def execute(self, input: ExpertPositionValidatorInput) -> ExpertPositionValidatorOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Validate this positioning statement from expert perspectives.

Positioning Statement: {input.positioning_statement}
Key Claims: {input.claims}
Target Expert Types: {input.target_experts if input.target_experts else ['clinical', 'scientific', 'commercial']}
Supporting Evidence: {input.supporting_evidence[:5] if input.supporting_evidence else 'Not provided'}
Competitive Context: {input.competitive_context or 'Not specified'}
Validation Stringency: {input.validation_stringency}

Assess from each expert perspective:
1. Would this expert support/endorse this positioning?
2. What evidence would they require?
3. What are their likely concerns?

For each claim assess:
1. Is it supportable with available evidence?
2. What is the evidence strength?
3. What is the expert consensus?
4. What is the risk of challenge?

Return JSON with:
- overall_validity: strong | moderate | weak | invalid
- validity_score: 0-100
- expert_validations: array of {{expert_type, perspective_name, support_level (strong_support|support|neutral|skeptical|opposed), rationale, key_concerns[], evidence_requirements[], credibility_score (0-1)}}
- claim_validations: array of {{claim_id, claim_text, is_supportable, evidence_strength (weak|moderate|strong|definitive), evidence_gaps[], expert_consensus (unanimous|majority|mixed|divided|minority), risk_of_challenge (low|medium|high), recommended_modifications[]}}
- unsupportable_claims: array of claims that cannot be supported
- evidence_gaps: array of missing evidence
- positioning_risks: array of credibility risks
- recommended_adjustments: array of positioning changes
- validation_summary: overall assessment
"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are an expert validation specialist. Assess positioning statements critically from multiple expert perspectives. Be rigorous about evidence requirements and credibility."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            expert_validations = [ExpertValidation(**e) for e in result.get("expert_validations", [])]
            claim_validations = [ClaimValidation(**c) for c in result.get("claim_validations", [])]

            return ExpertPositionValidatorOutput(
                success=True,
                overall_validity=result.get("overall_validity", "mixed"),
                validity_score=float(result.get("validity_score", 0)),
                expert_validations=expert_validations,
                claim_validations=claim_validations,
                unsupportable_claims=result.get("unsupportable_claims", []),
                evidence_gaps=result.get("evidence_gaps", []),
                positioning_risks=result.get("positioning_risks", []),
                recommended_adjustments=result.get("recommended_adjustments", []),
                validation_summary=result.get("validation_summary", ""),
                confidence_score=0.85,
                quality_score=len(expert_validations) * 0.15 + len(claim_validations) * 0.1,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"ExpertPositionValidatorRunner error: {e}")
            return ExpertPositionValidatorOutput(
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
