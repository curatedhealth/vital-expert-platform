"""
VALIDATE Category - Plan Validator Runner

Validates strategic plans against constraints, feasibility requirements,
resource availability, and alignment with objectives.

Core Logic: Plan Verification / Feasibility Assessment
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

class ValidationIssue(TaskRunnerOutput):
    """An issue found during plan validation."""
    issue_id: str = Field(default="")
    issue_type: str = Field(default="feasibility", description="feasibility | resource | timeline | alignment | dependency | risk")
    severity: str = Field(default="medium", description="low | medium | high | critical")
    description: str = Field(default="")
    affected_elements: List[str] = Field(default_factory=list)
    recommendation: str = Field(default="")
    effort_to_fix: str = Field(default="medium", description="low | medium | high")


class ValidationCheck(TaskRunnerOutput):
    """A validation check performed."""
    check_id: str = Field(default="")
    check_name: str = Field(default="")
    check_category: str = Field(default="")
    passed: bool = Field(default=False)
    score: float = Field(default=0.0, description="0-100")
    details: str = Field(default="")
    evidence: List[str] = Field(default_factory=list)


class PlanValidatorInput(TaskRunnerInput):
    """Input for plan validation."""
    plan_content: Dict[str, Any] = Field(..., description="Plan to validate")
    objectives: List[str] = Field(default_factory=list, description="Strategic objectives to check alignment")
    constraints: List[str] = Field(default_factory=list, description="Constraints the plan must satisfy")
    resources_available: Dict[str, Any] = Field(default_factory=dict, description="Available resources")
    validation_criteria: List[str] = Field(default_factory=list, description="Specific criteria to validate")
    validation_depth: str = Field(default="standard", description="quick | standard | thorough")


class PlanValidatorOutput(TaskRunnerOutput):
    """Output from plan validation."""
    is_valid: bool = Field(default=False)
    overall_score: float = Field(default=0.0, description="0-100")
    checks_performed: List[ValidationCheck] = Field(default_factory=list)
    issues_found: List[ValidationIssue] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    critical_blockers: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    validation_summary: str = Field(default="")


# =============================================================================
# PLAN VALIDATOR RUNNER
# =============================================================================

@register_task_runner
class PlanValidatorRunner(TaskRunner[PlanValidatorInput, PlanValidatorOutput]):
    """
    Validate strategic plans against constraints and objectives.

    Algorithmic Core: plan_verification
    Temperature: 0.2 (precise validation)

    Validates:
    - Feasibility of plan elements
    - Resource availability and allocation
    - Timeline realism
    - Alignment with strategic objectives
    - Dependency chains
    - Risk exposure
    """
    runner_id = "plan_validator"
    name = "Plan Validator Runner"
    description = "Validate plans using plan verification protocol"
    category = TaskRunnerCategory.VALIDATE
    algorithmic_core = "plan_verification"
    max_duration_seconds = 150
    InputType = PlanValidatorInput
    OutputType = PlanValidatorOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: PlanValidatorInput) -> PlanValidatorOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Validate this strategic plan comprehensively.

Plan Content: {input.plan_content}
Strategic Objectives: {input.objectives}
Constraints: {input.constraints}
Available Resources: {input.resources_available}
Validation Criteria: {input.validation_criteria if input.validation_criteria else 'Standard validation'}
Validation Depth: {input.validation_depth}

Perform validation checks for:
1. Feasibility - Can this plan realistically be executed?
2. Resource adequacy - Are resources sufficient?
3. Timeline realism - Are timelines achievable?
4. Objective alignment - Does it support stated objectives?
5. Dependency validity - Are dependencies properly sequenced?
6. Risk exposure - Are risks identified and mitigated?

Return JSON with:
- is_valid: boolean (true if plan passes all critical checks)
- overall_score: 0-100
- checks_performed: array of {{check_id, check_name, check_category, passed, score, details, evidence[]}}
- issues_found: array of {{issue_id, issue_type (feasibility|resource|timeline|alignment|dependency|risk), severity (low|medium|high|critical), description, affected_elements[], recommendation, effort_to_fix}}
- strengths: array of plan strengths
- critical_blockers: array of issues that must be resolved
- recommendations: array of improvement recommendations
- validation_summary: overall assessment
"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a strategic plan validator. Rigorously assess plans for feasibility, alignment, and completeness. Be thorough but fair in your assessment."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            checks = [ValidationCheck(**c) for c in result.get("checks_performed", [])]
            issues = [ValidationIssue(**i) for i in result.get("issues_found", [])]

            return PlanValidatorOutput(
                success=True,
                is_valid=result.get("is_valid", False),
                overall_score=float(result.get("overall_score", 0)),
                checks_performed=checks,
                issues_found=issues,
                strengths=result.get("strengths", []),
                critical_blockers=result.get("critical_blockers", []),
                recommendations=result.get("recommendations", []),
                validation_summary=result.get("validation_summary", ""),
                confidence_score=0.85,
                quality_score=len(checks) * 0.1 + (1.0 if result.get("is_valid") else 0.5),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"PlanValidatorRunner error: {e}")
            return PlanValidatorOutput(
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
