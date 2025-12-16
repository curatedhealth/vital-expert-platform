"""
ComplianceCheckRunner - Check against rules using rule engine.

Algorithmic Core: Rule Engine / Constraint Checking
- Validates content against defined rules
- Identifies violations and severity
- Provides remediation guidance

Use Cases:
- Regulatory compliance
- Policy adherence
- Style guide compliance
- Brand guideline checking
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class ComplianceRule(TaskRunnerOutput):
    """A compliance rule to check against."""

    rule_id: str = Field(default="", description="Rule identifier")
    rule_name: str = Field(default="", description="Rule name")
    rule_text: str = Field(default="", description="Rule description")
    category: str = Field(default="", description="Rule category")
    severity_if_violated: str = Field(
        default="medium",
        description="critical | high | medium | low"
    )


class ComplianceCheckInput(TaskRunnerInput):
    """Input schema for ComplianceCheckRunner."""

    content: str = Field(
        ...,
        description="Content to check for compliance"
    )
    ruleset: List[Dict[str, Any]] = Field(
        ...,
        description="Rules to check [{rule_id, rule_name, rule_text, category, severity}]"
    )
    content_type: str = Field(
        default="document",
        description="Type: document | code | email | marketing | legal"
    )
    check_mode: str = Field(
        default="strict",
        description="Mode: lenient | standard | strict"
    )
    context: Optional[str] = Field(
        default=None,
        description="Additional context for interpretation"
    )


class RuleViolation(TaskRunnerOutput):
    """A single rule violation."""

    violation_id: str = Field(default="", description="Violation ID")
    rule_id: str = Field(default="", description="Rule violated")
    rule_name: str = Field(default="", description="Rule name")
    severity: str = Field(default="medium", description="critical | high | medium | low")
    location: str = Field(default="", description="Where in content")
    violation_text: str = Field(default="", description="The violating content")
    explanation: str = Field(default="", description="Why this violates rule")
    remediation: str = Field(default="", description="How to fix")
    auto_fixable: bool = Field(default=False, description="Can be auto-fixed")


class ComplianceCheckOutput(TaskRunnerOutput):
    """Output schema for ComplianceCheckRunner."""

    is_compliant: bool = Field(default=False, description="Overall compliance")
    compliance_score: float = Field(default=0.0, description="Compliance score 0-100")
    violations: List[RuleViolation] = Field(
        default_factory=list,
        description="All violations found"
    )
    critical_violations: List[RuleViolation] = Field(
        default_factory=list,
        description="Critical/high severity violations"
    )
    rules_checked: int = Field(default=0, description="Number of rules checked")
    rules_passed: int = Field(default=0, description="Rules with no violations")
    rules_failed: int = Field(default=0, description="Rules with violations")
    compliance_summary: str = Field(default="", description="Executive summary")
    category_breakdown: Dict[str, Dict[str, int]] = Field(
        default_factory=dict,
        description="Violations by category {category: {passed, failed}}"
    )
    remediation_priority: List[str] = Field(
        default_factory=list,
        description="Violation IDs in remediation priority order"
    )


# =============================================================================
# ComplianceCheckRunner Implementation
# =============================================================================

@register_task_runner
class ComplianceCheckRunner(TaskRunner[ComplianceCheckInput, ComplianceCheckOutput]):
    """
    Rule engine compliance checking runner.

    This runner validates content against a defined ruleset
    and reports violations with remediation guidance.

    Algorithmic Pattern:
        1. Parse content and ruleset
        2. For each rule:
           - Check if content violates rule
           - Identify specific violations
           - Rate severity
           - Suggest remediation
        3. Calculate compliance score
        4. Prioritize remediations

    Best Used For:
        - Regulatory compliance
        - Policy enforcement
        - Quality assurance
        - Standards adherence
    """

    runner_id = "compliance_check"
    name = "Compliance Check Runner"
    description = "Check against rules using rule engine"
    category = TaskRunnerCategory.VALIDATE
    algorithmic_core = "rule_engine"
    max_duration_seconds = 120

    InputType = ComplianceCheckInput
    OutputType = ComplianceCheckOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ComplianceCheckRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Precision for compliance
            max_tokens=3500,
        )

    async def execute(self, input: ComplianceCheckInput) -> ComplianceCheckOutput:
        """
        Execute compliance check.

        Args:
            input: Compliance check parameters

        Returns:
            ComplianceCheckOutput with violations and score
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            rules_text = json.dumps(input.ruleset, indent=2)[:2500]

            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            mode_instruction = self._get_mode_instruction(input.check_mode)

            system_prompt = f"""You are an expert compliance checker using a rule engine.

Your task is to check content against a ruleset and identify violations.

Content type: {input.content_type}
Check mode: {input.check_mode}
{mode_instruction}

Rule engine approach:
1. For each rule:
   - Parse rule requirements
   - Scan content for violations
   - If violation found:
     * Locate specific text
     * Explain why it violates
     * Suggest remediation
     * Assess if auto-fixable
2. Categorize violations by severity:
   - critical: Must fix before use
   - high: Should fix urgently
   - medium: Should fix
   - low: Nice to fix
3. Calculate compliance score:
   - 100 = fully compliant
   - Deduct based on severity and count
4. Prioritize remediation

Return a structured JSON response with:
- is_compliant: boolean (no critical/high violations)
- compliance_score: 0-100
- violations: Array with:
  - violation_id: V1, V2, etc.
  - rule_id: Rule identifier
  - rule_name: Rule name
  - severity: critical | high | medium | low
  - location: Where in content
  - violation_text: The violating text
  - explanation: Why it violates
  - remediation: How to fix
  - auto_fixable: boolean
- rules_checked: Total rules
- rules_passed: Rules with no violations
- rules_failed: Rules with violations
- compliance_summary: 2-3 sentence summary
- category_breakdown: {{category: {{passed: X, failed: Y}}}}
- remediation_priority: Violation IDs in priority order"""

            user_prompt = f"""Check compliance for this content:

CONTENT:
{input.content[:2500]}

RULESET:
{rules_text}
{context_text}

Check compliance and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_compliance_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build violations
            viol_data = result.get("violations", [])
            violations = [
                RuleViolation(
                    violation_id=v.get("violation_id", f"V{i+1}"),
                    rule_id=v.get("rule_id", ""),
                    rule_name=v.get("rule_name", ""),
                    severity=v.get("severity", "medium"),
                    location=v.get("location", ""),
                    violation_text=v.get("violation_text", ""),
                    explanation=v.get("explanation", ""),
                    remediation=v.get("remediation", ""),
                    auto_fixable=v.get("auto_fixable", False),
                )
                for i, v in enumerate(viol_data)
            ]

            # Filter critical violations
            critical = [v for v in violations if v.severity in ["critical", "high"]]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ComplianceCheckOutput(
                success=True,
                is_compliant=result.get("is_compliant", len(critical) == 0),
                compliance_score=float(result.get("compliance_score", 80)),
                violations=violations,
                critical_violations=critical,
                rules_checked=result.get("rules_checked", len(input.ruleset)),
                rules_passed=result.get("rules_passed", 0),
                rules_failed=result.get("rules_failed", 0),
                compliance_summary=result.get("compliance_summary", ""),
                category_breakdown=result.get("category_breakdown", {}),
                remediation_priority=result.get("remediation_priority", []),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ComplianceCheckRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ComplianceCheckOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_mode_instruction(self, mode: str) -> str:
        """Get mode instruction."""
        instructions = {
            "lenient": "Lenient: Only flag clear violations. Give benefit of doubt.",
            "standard": "Standard: Flag violations with reasonable confidence.",
            "strict": "Strict: Flag any potential violation. Conservative interpretation.",
        }
        return instructions.get(mode, instructions["standard"])

    def _parse_compliance_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "is_compliant": False,
                "compliance_score": 0,
                "violations": [],
                "rules_checked": 0,
                "rules_passed": 0,
                "rules_failed": 0,
                "compliance_summary": content[:200],
                "category_breakdown": {},
                "remediation_priority": [],
            }
