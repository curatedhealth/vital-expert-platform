"""
EmpathyResearcherRunner - Conduct empathy research to understand user needs

This runner performs structured empathy research by analyzing user contexts,
behaviors, emotions, and unmet needs to generate deep user insights.

Algorithmic Core: empathy_mapping
Temperature: 0.5 (balanced creativity for insight generation)
"""

from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class EmpathyInsight(BaseModel):
    """Individual empathy insight from research."""
    insight_id: str = Field(..., description="Unique identifier")
    insight_type: Literal["say", "think", "do", "feel"] = Field(
        ..., description="Empathy map quadrant"
    )
    description: str = Field(..., description="Insight description")
    user_quote: Optional[str] = Field(None, description="Direct quote if available")
    emotional_intensity: Literal["low", "medium", "high"] = Field(
        "medium", description="Emotional intensity level"
    )
    frequency: Literal["rare", "occasional", "common", "universal"] = Field(
        "common", description="How often this occurs"
    )
    implications: List[str] = Field(default_factory=list, description="Design implications")


class UserNeed(BaseModel):
    """Identified user need from empathy research."""
    need_id: str = Field(..., description="Unique identifier")
    need_statement: str = Field(..., description="Need statement in user voice")
    need_type: Literal["functional", "emotional", "social", "aspirational"] = Field(
        ..., description="Type of need"
    )
    intensity: Literal["nice_to_have", "important", "critical", "desperate"] = Field(
        ..., description="Need intensity"
    )
    currently_addressed: bool = Field(False, description="Is need currently met")
    supporting_insights: List[str] = Field(
        default_factory=list, description="Insight IDs supporting this need"
    )


class EmpathyResearcherInput(BaseModel):
    """Input for empathy research."""
    research_subject: str = Field(..., description="Who we're researching (persona/segment)")
    context: str = Field(..., description="Context/situation being studied")
    research_data: Optional[List[str]] = Field(
        None, description="Raw research data (interviews, observations)"
    )
    focus_areas: Optional[List[str]] = Field(
        None, description="Specific areas to focus empathy research"
    )
    existing_assumptions: Optional[List[str]] = Field(
        None, description="Current assumptions to validate/challenge"
    )


class EmpathyResearcherOutput(BaseModel):
    """Output from empathy research."""
    empathy_map: dict = Field(
        ..., description="Empathy map with say/think/do/feel quadrants"
    )
    insights: List[EmpathyInsight] = Field(
        default_factory=list, description="Empathy insights"
    )
    user_needs: List[UserNeed] = Field(
        default_factory=list, description="Identified user needs"
    )
    pains: List[str] = Field(default_factory=list, description="User pains identified")
    gains: List[str] = Field(default_factory=list, description="User gains sought")
    assumptions_validated: List[str] = Field(
        default_factory=list, description="Assumptions confirmed by research"
    )
    assumptions_challenged: List[str] = Field(
        default_factory=list, description="Assumptions contradicted by research"
    )
    research_gaps: List[str] = Field(
        default_factory=list, description="Areas needing more research"
    )


@register_task_runner("empathy_researcher", TaskRunnerCategory.UNDERSTAND)
class EmpathyResearcherRunner(TaskRunner[EmpathyResearcherInput, EmpathyResearcherOutput]):
    """
    Conducts empathy research to understand user perspectives and needs.

    Uses empathy mapping methodology to systematically analyze what users
    say, think, do, and feel to uncover deep insights and unmet needs.

    Algorithmic approach:
    1. Parse research data into empathy map quadrants
    2. Identify patterns across quadrants
    3. Extract user needs from patterns
    4. Validate/challenge existing assumptions
    5. Identify research gaps
    """

    name = "empathy_researcher"
    description = "Conduct empathy research to understand user needs and perspectives"
    algorithmic_core = "empathy_mapping"
    category = TaskRunnerCategory.UNDERSTAND
    temperature = 0.5
    max_tokens = 3000

    async def execute(self, input_data: EmpathyResearcherInput) -> EmpathyResearcherOutput:
        """Execute empathy research analysis."""
        prompt = f"""Conduct empathy research for the following subject and context.

RESEARCH SUBJECT: {input_data.research_subject}
CONTEXT: {input_data.context}

RESEARCH DATA:
{chr(10).join(input_data.research_data or ['No raw data provided - use context to infer'])}

FOCUS AREAS: {', '.join(input_data.focus_areas or ['General empathy mapping'])}

EXISTING ASSUMPTIONS TO VALIDATE:
{chr(10).join(input_data.existing_assumptions or ['None provided'])}

Create a comprehensive empathy analysis including:
1. EMPATHY MAP with quadrants:
   - SAY: Direct quotes and statements
   - THINK: Internal thoughts and beliefs
   - DO: Observable behaviors and actions
   - FEEL: Emotions and feelings

2. INSIGHTS: Deep observations from the empathy map
3. USER NEEDS: Functional, emotional, social, and aspirational needs
4. PAINS: Frustrations, obstacles, risks
5. GAINS: Wants, needs, measures of success
6. ASSUMPTION VALIDATION: Which assumptions are confirmed vs challenged
7. RESEARCH GAPS: What we still need to learn

Return as JSON matching the EmpathyResearcherOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, EmpathyResearcherOutput)
