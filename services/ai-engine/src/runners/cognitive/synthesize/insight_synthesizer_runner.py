"""
InsightSynthesizerRunner - Synthesize insights from multiple sources

This runner synthesizes insights from diverse research inputs,
identifying patterns, themes, and actionable conclusions.

Algorithmic Core: insight_synthesis
Temperature: 0.4 (analytical with creativity for connections)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class SynthesizedInsight(BaseModel):
    """Synthesized insight."""
    insight_id: str = Field(..., description="Unique identifier")
    insight_title: str = Field(..., description="Insight title")
    insight_statement: str = Field(..., description="Clear insight statement")
    insight_type: Literal[
        "pattern", "contradiction", "opportunity", "risk", "trend"
    ] = Field(..., description="Type of insight")
    supporting_evidence: List[str] = Field(
        default_factory=list, description="Evidence supporting this"
    )
    confidence: Literal["low", "medium", "high"] = Field("medium")
    actionability: Literal["low", "medium", "high"] = Field("medium")
    implications: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)


class InsightSynthesizerInput(BaseModel):
    """Input for insight synthesis."""
    research_context: str = Field(..., description="Research context")
    input_sources: List[str] = Field(
        default_factory=list, description="Source data/findings"
    )
    synthesis_focus: Optional[str] = Field(
        None, description="What to focus synthesis on"
    )
    questions_to_answer: Optional[List[str]] = Field(
        None, description="Questions synthesis should address"
    )
    existing_hypotheses: Optional[List[str]] = Field(
        None, description="Hypotheses to validate/invalidate"
    )


class InsightSynthesizerOutput(BaseModel):
    """Output from insight synthesis."""
    synthesis_summary: str = Field(..., description="Executive summary")
    synthesized_insights: List[SynthesizedInsight] = Field(default_factory=list)
    key_patterns: List[str] = Field(default_factory=list)
    contradictions_found: List[str] = Field(default_factory=list)
    knowledge_gaps: List[str] = Field(default_factory=list)
    hypotheses_validated: List[str] = Field(default_factory=list)
    hypotheses_invalidated: List[str] = Field(default_factory=list)
    strategic_implications: List[str] = Field(default_factory=list)
    recommended_next_steps: List[str] = Field(default_factory=list)
    confidence_assessment: str = Field(
        default="", description="Overall confidence in synthesis"
    )


@register_task_runner
class InsightSynthesizerRunner(TaskRunner[InsightSynthesizerInput, InsightSynthesizerOutput]):
    """
    Synthesizes insights from multiple research sources.

    Identifies patterns, contradictions, and actionable
    conclusions from diverse inputs.
    """

    runner_id = "insight_synthesizer"
    name = "Insight Synthesizer Runner"
    description = "Synthesize insights from multiple sources"
    algorithmic_core = "insight_synthesis"
    category = TaskRunnerCategory.SYNTHESIZE
    temperature = 0.4
    max_tokens = 4000

    async def execute(self, input_data: InsightSynthesizerInput) -> InsightSynthesizerOutput:
        """Execute insight synthesis."""
        prompt = f"""Synthesize insights from the following research.

CONTEXT: {input_data.research_context}

INPUT SOURCES:
{chr(10).join(input_data.input_sources or ['No sources provided'])}

SYNTHESIS FOCUS: {input_data.synthesis_focus or 'General synthesis'}

QUESTIONS TO ANSWER:
{chr(10).join(input_data.questions_to_answer or ['Generate key questions'])}

HYPOTHESES TO VALIDATE:
{chr(10).join(input_data.existing_hypotheses or ['None specified'])}

Synthesize insights:

1. EXECUTIVE SUMMARY (2-3 sentences)

2. SYNTHESIZED INSIGHTS:
   - Title and statement
   - Type (pattern/contradiction/opportunity/risk/trend)
   - Supporting evidence
   - Confidence and actionability
   - Implications and recommended actions

3. KEY PATTERNS identified

4. CONTRADICTIONS found in the data

5. KNOWLEDGE GAPS remaining

6. HYPOTHESES validated/invalidated

7. STRATEGIC IMPLICATIONS

8. RECOMMENDED NEXT STEPS

9. CONFIDENCE ASSESSMENT

Return as JSON matching the InsightSynthesizerOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, InsightSynthesizerOutput)
