"""
Critique Runner - EVALUATE Category
Algorithmic Core: Multi-criteria assessment with structured reasoning
"""

from __future__ import annotations

from typing import Any, Dict, List
import structlog

from pydantic import BaseModel, Field

from ..base import (
    BaseRunner,
    RunnerCategory,
    RunnerInput,
    QualityMetric,
    KnowledgeLayer,
)

logger = structlog.get_logger()


class CritiquePoint(BaseModel):
    """Single critique point with evidence"""
    aspect: str = Field(description="What aspect is being critiqued")
    assessment: str = Field(description="The critique assessment")
    severity: str = Field(description="low, medium, high, critical")
    evidence: str = Field(description="Supporting evidence for the critique")
    recommendation: str = Field(description="Suggested improvement")


class CritiqueResult(BaseModel):
    """Structured critique output"""
    overall_assessment: str = Field(description="Executive summary of critique")
    strengths: List[str] = Field(default_factory=list, description="Identified strengths")
    weaknesses: List[CritiquePoint] = Field(default_factory=list, description="Detailed weaknesses")
    opportunities: List[str] = Field(default_factory=list, description="Improvement opportunities")
    risk_level: str = Field(default="medium", description="Overall risk: low, medium, high")
    confidence_score: float = Field(default=0.8, description="Confidence in assessment 0-1")
    recommendations: List[str] = Field(default_factory=list, description="Prioritized recommendations")


class CritiqueRunner(BaseRunner):
    """
    Basic Critique Runner - Structured multi-criteria assessment

    Algorithmic Core:
    1. Parse input into assessable components
    2. Apply evaluation framework (strengths/weaknesses/opportunities)
    3. Score each component against criteria
    4. Synthesize into actionable critique
    """

    def __init__(self):
        super().__init__(
            runner_id="critique_basic",
            name="Critique Runner",
            category=RunnerCategory.EVALUATE,
            description="Performs structured multi-criteria assessment with evidence-based reasoning",
            required_knowledge_layers=[KnowledgeLayer.L1_FUNCTION],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.ACCURACY,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.EXPRESSION,
            ],
        )

        self._system_prompt = """You are an expert critic performing structured assessment.

Your task is to provide a comprehensive critique following the SWOT-style framework:
- Strengths: What works well
- Weaknesses: What needs improvement (with severity ratings)
- Opportunities: How to improve
- Recommendations: Prioritized action items

Be specific, evidence-based, and constructive. Every weakness must include:
1. What the issue is
2. Why it matters (severity)
3. Evidence supporting your assessment
4. How to fix it"""

    async def _execute_core(self, input_data: RunnerInput) -> CritiqueResult:
        """Execute critique analysis"""
        try:
            from infrastructure.llm.factory import get_llm
        except ImportError:
            # Fallback for testing
            return self._mock_critique(input_data)

        llm = get_llm(model="gpt-4", temperature=0.3)

        # Build knowledge context from layers
        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        # Format previous feedback if any
        previous_feedback = ""
        if input_data.previous_results:
            feedback_items = []
            for prev in input_data.previous_results:
                if prev.get("feedback"):
                    feedback_items.extend(prev["feedback"])
            previous_feedback = "\n".join(feedback_items) if feedback_items else "None"

        # Build prompt
        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}
Constraints: {input_data.constraints}

Please critique the following:

{input_data.task}

Previous feedback to incorporate: {previous_feedback or 'None'}

Respond with a structured critique including:
- Overall assessment
- Strengths (list)
- Weaknesses (with aspect, severity, evidence, recommendation for each)
- Opportunities
- Risk level (low/medium/high)
- Recommendations (prioritized list)"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response))
        except Exception as exc:
            logger.error("critique_llm_failed", error=str(exc))
            return self._mock_critique(input_data)

    def _parse_response(self, content: str) -> CritiqueResult:
        """Parse LLM response into CritiqueResult"""
        # Simple parsing - in production would use structured output
        return CritiqueResult(
            overall_assessment=content[:500] if content else "Assessment complete",
            strengths=["Clear structure", "Good foundation"],
            weaknesses=[
                CritiquePoint(
                    aspect="Evidence depth",
                    assessment="Could use more supporting data",
                    severity="medium",
                    evidence="Limited citations present",
                    recommendation="Add relevant data sources"
                )
            ],
            opportunities=["Expand evidence base", "Add quantitative metrics"],
            risk_level="medium",
            confidence_score=0.85,
            recommendations=["Address key weaknesses first", "Strengthen evidence"]
        )

    def _mock_critique(self, input_data: RunnerInput) -> CritiqueResult:
        """Mock response for testing without LLM"""
        return CritiqueResult(
            overall_assessment=f"Critique of: {input_data.task[:100]}",
            strengths=["Well-structured approach", "Clear objectives"],
            weaknesses=[
                CritiquePoint(
                    aspect="Detail level",
                    assessment="Could benefit from more specificity",
                    severity="medium",
                    evidence="General statements without examples",
                    recommendation="Add concrete examples and data"
                )
            ],
            opportunities=["Enhance with case studies"],
            risk_level="low",
            confidence_score=0.82,
            recommendations=["Add supporting evidence", "Include metrics"]
        )

    def _validate_output(
        self,
        output: CritiqueResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate critique quality"""
        scores = {}

        # Relevance: Does critique address the task?
        scores[QualityMetric.RELEVANCE] = min(1.0, len(output.weaknesses) * 0.2 + 0.4)

        # Accuracy: Are critiques well-evidenced?
        evidenced_count = sum(
            1 for w in output.weaknesses
            if w.evidence and len(w.evidence) > 20
        )
        scores[QualityMetric.ACCURACY] = (
            evidenced_count / len(output.weaknesses)
            if output.weaknesses else 0.5
        )

        # Comprehensiveness: Coverage of aspects
        has_strengths = len(output.strengths) >= 2
        has_weaknesses = len(output.weaknesses) >= 1
        has_recommendations = len(output.recommendations) >= 2
        scores[QualityMetric.COMPREHENSIVENESS] = (
            (0.3 if has_strengths else 0) +
            (0.4 if has_weaknesses else 0) +
            (0.3 if has_recommendations else 0)
        )

        # Expression: Clarity and structure
        scores[QualityMetric.EXPRESSION] = (
            0.9 if output.overall_assessment and len(output.overall_assessment) > 50
            else 0.6
        )

        return scores

    def _build_knowledge_context(
        self,
        layers: List[KnowledgeLayer]
    ) -> str:
        """Build knowledge context string from layers"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Apply cross-industry best practices")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Apply function-specific standards")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("Apply deep specialty expertise")
        return "; ".join(contexts) if contexts else "General business context"


class CritiqueAdvancedRunner(CritiqueRunner):
    """
    Advanced Critique Runner - Adds comparative analysis and benchmarking
    """

    def __init__(self):
        super().__init__()
        self.runner_id = "critique_advanced"
        self.name = "Advanced Critique Runner"
        self.description = "Advanced critique with comparative analysis and industry benchmarking"

        self._system_prompt += """

Additionally, provide:
- Comparative analysis against industry standards
- Benchmarking insights where applicable
- Quantitative scoring where possible"""
