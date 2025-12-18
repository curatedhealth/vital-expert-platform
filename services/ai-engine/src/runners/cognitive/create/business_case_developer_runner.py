"""
BusinessCaseDeveloperRunner - Develop business cases for initiatives

This runner creates comprehensive business cases for proposed
initiatives, including financial projections and strategic rationale.

Algorithmic Core: business_case_analysis
Temperature: 0.3 (analytical precision for business analysis)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class FinancialProjection(BaseModel):
    """Financial projections for the business case."""
    investment_required: str = Field(..., description="Total investment needed")
    revenue_year1: str = Field(default="0", description="Year 1 revenue")
    revenue_year3: str = Field(default="0", description="Year 3 revenue")
    revenue_year5: str = Field(default="0", description="Year 5 revenue")
    cost_structure: Dict[str, str] = Field(
        default_factory=dict, description="Cost category -> amount"
    )
    break_even_timeline: str = Field(..., description="Time to break even")
    roi_estimate: str = Field(..., description="Expected ROI")
    npv_estimate: str = Field(default="TBD", description="Net Present Value")
    assumptions: List[str] = Field(
        default_factory=list, description="Financial assumptions"
    )


class RiskAssessment(BaseModel):
    """Risk assessment for the business case."""
    risk_name: str = Field(..., description="Risk name")
    risk_type: Literal[
        "market", "technical", "financial", "operational", "regulatory"
    ] = Field(..., description="Type of risk")
    likelihood: Literal["low", "medium", "high"] = Field(
        ..., description="Likelihood"
    )
    impact: Literal["low", "medium", "high"] = Field(
        ..., description="Impact if occurs"
    )
    mitigation: str = Field(..., description="Mitigation strategy")


class BusinessCase(BaseModel):
    """Complete business case."""
    case_id: str = Field(..., description="Unique identifier")
    initiative_name: str = Field(..., description="Initiative name")
    executive_summary: str = Field(..., description="Executive summary")
    problem_statement: str = Field(..., description="Problem being solved")
    proposed_solution: str = Field(..., description="Proposed solution")
    strategic_alignment: List[str] = Field(
        default_factory=list, description="How it aligns with strategy"
    )
    target_outcomes: List[str] = Field(
        default_factory=list, description="Expected outcomes"
    )
    financials: FinancialProjection = Field(
        ..., description="Financial projections"
    )
    risks: List[RiskAssessment] = Field(
        default_factory=list, description="Risk assessment"
    )
    success_criteria: List[str] = Field(
        default_factory=list, description="Success criteria"
    )
    implementation_approach: str = Field(
        ..., description="How it will be implemented"
    )
    timeline: str = Field(..., description="Implementation timeline")
    resource_requirements: Dict[str, str] = Field(
        default_factory=dict, description="Resource type -> requirement"
    )
    recommendation: Literal["proceed", "proceed_with_conditions", "defer", "reject"] = Field(
        ..., description="Recommendation"
    )


class BusinessCaseDeveloperInput(BaseModel):
    """Input for business case development."""
    initiative_description: str = Field(..., description="Initiative to build case for")
    problem_context: str = Field(..., description="Problem/opportunity context")
    strategic_priorities: Optional[List[str]] = Field(
        None, description="Strategic priorities to align with"
    )
    financial_parameters: Optional[Dict[str, str]] = Field(
        None, description="Financial parameters/constraints"
    )
    available_resources: Optional[Dict[str, str]] = Field(
        None, description="Available resources"
    )
    known_risks: Optional[List[str]] = Field(
        None, description="Already identified risks"
    )


class BusinessCaseDeveloperOutput(BaseModel):
    """Output from business case development."""
    business_case: BusinessCase = Field(
        ..., description="Complete business case"
    )
    key_decision_factors: List[str] = Field(
        default_factory=list, description="Key factors for decision"
    )
    alternatives_considered: List[str] = Field(
        default_factory=list, description="Alternatives considered"
    )
    sensitivity_analysis: Dict[str, str] = Field(
        default_factory=dict, description="Variable -> sensitivity"
    )
    go_no_go_summary: str = Field(
        ..., description="Summary for decision makers"
    )


@register_task_runner("business_case_developer", TaskRunnerCategory.CREATE)
class BusinessCaseDeveloperRunner(TaskRunner[BusinessCaseDeveloperInput, BusinessCaseDeveloperOutput]):
    """
    Develops comprehensive business cases for initiatives.

    Creates structured business cases with strategic rationale,
    financial projections, and risk assessment.

    Algorithmic approach:
    1. Define problem and solution
    2. Align with strategy
    3. Project financials
    4. Assess risks
    5. Define success criteria
    6. Make recommendation
    """

    name = "business_case_developer"
    description = "Develop comprehensive business cases for initiatives"
    algorithmic_core = "business_case_analysis"
    category = TaskRunnerCategory.CREATE
    temperature = 0.3
    max_tokens = 4000

    async def execute(self, input_data: BusinessCaseDeveloperInput) -> BusinessCaseDeveloperOutput:
        """Execute business case development."""
        prompt = f"""Develop a business case for the following initiative.

INITIATIVE: {input_data.initiative_description}

PROBLEM/OPPORTUNITY CONTEXT: {input_data.problem_context}

STRATEGIC PRIORITIES:
{chr(10).join(input_data.strategic_priorities or ['Not specified'])}

FINANCIAL PARAMETERS: {input_data.financial_parameters or 'Not specified'}

AVAILABLE RESOURCES: {input_data.available_resources or 'Not specified'}

KNOWN RISKS:
{chr(10).join(input_data.known_risks or ['None identified'])}

Develop a comprehensive business case including:

1. EXECUTIVE SUMMARY (compelling 2-3 sentences)

2. PROBLEM STATEMENT

3. PROPOSED SOLUTION

4. STRATEGIC ALIGNMENT (how it supports strategy)

5. TARGET OUTCOMES (measurable)

6. FINANCIAL PROJECTIONS:
   - Investment required
   - Revenue projections (Y1, Y3, Y5)
   - Cost structure
   - Break-even timeline
   - ROI estimate
   - Key assumptions

7. RISK ASSESSMENT (for each risk):
   - Type (market/technical/financial/operational/regulatory)
   - Likelihood and impact
   - Mitigation strategy

8. SUCCESS CRITERIA

9. IMPLEMENTATION APPROACH and TIMELINE

10. RESOURCE REQUIREMENTS

11. RECOMMENDATION (proceed/proceed_with_conditions/defer/reject)

Also provide:
- Key decision factors
- Alternatives considered
- Sensitivity analysis
- Go/No-Go summary for decision makers

Return as JSON matching the BusinessCaseDeveloperOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, BusinessCaseDeveloperOutput)
