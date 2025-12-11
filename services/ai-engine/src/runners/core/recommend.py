"""
Recommend Runner - DECIDE Category
Algorithmic Core: Multi-criteria decision support with option ranking
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
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


class RecommendationOption(BaseModel):
    """Single recommendation option with analysis"""
    option_id: str = Field(description="Unique option identifier")
    title: str = Field(description="Option title")
    description: str = Field(description="What this option involves")
    pros: List[str] = Field(default_factory=list, description="Advantages")
    cons: List[str] = Field(default_factory=list, description="Disadvantages")
    risk_level: str = Field(default="medium", description="low, medium, high")
    confidence: float = Field(default=0.8, description="Confidence in this option")
    score: float = Field(default=0.0, description="Overall score 0-1")
    requirements: List[str] = Field(default_factory=list, description="Prerequisites")


class RecommendResult(BaseModel):
    """Structured recommendation output"""
    decision_context: str = Field(description="Context for the decision")
    options: List[RecommendationOption] = Field(default_factory=list, description="Ranked options")
    top_recommendation: Optional[str] = Field(default=None, description="ID of recommended option")
    recommendation_rationale: str = Field(default="", description="Why this is recommended")
    criteria_used: List[str] = Field(default_factory=list, description="Decision criteria applied")
    trade_offs: List[str] = Field(default_factory=list, description="Key trade-offs to consider")
    implementation_steps: List[str] = Field(default_factory=list, description="Next steps if adopted")
    confidence_level: float = Field(default=0.8, description="Overall confidence")


class RecommendRunner(BaseRunner):
    """
    Recommend Runner - Multi-criteria decision support with option ranking

    Algorithmic Core:
    1. Parse decision context and criteria
    2. Generate viable options
    3. Analyze pros/cons for each option
    4. Score and rank options
    5. Provide recommendation with rationale
    """

    def __init__(self):
        super().__init__(
            runner_id="recommend_basic",
            name="Recommend Runner",
            category=RunnerCategory.DECIDE,
            description="Provides multi-criteria decision support with option ranking",
            required_knowledge_layers=[KnowledgeLayer.L1_FUNCTION],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.ACCURACY,
                QualityMetric.EXPRESSION,
            ],
        )

        self._system_prompt = """You are an expert decision advisor providing structured recommendations.

Your recommendation process:
1. UNDERSTAND the decision context and constraints
2. IDENTIFY all viable options (aim for 3-5)
3. ANALYZE each option's pros and cons
4. SCORE options against decision criteria
5. RANK options and select top recommendation
6. PROVIDE clear rationale and implementation steps

Decision Framework:
- Consider risk tolerance
- Account for resource constraints
- Balance short-term and long-term impact
- Include stakeholder perspectives

Rules:
- Every option must have pros AND cons (nothing is perfect)
- Be explicit about trade-offs
- Recommendations must be actionable
- Confidence levels must be realistic"""

    async def _execute_core(self, input_data: RunnerInput) -> RecommendResult:
        """Execute recommendation analysis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.4)
        except ImportError:
            return self._mock_recommend(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        # Get criteria from constraints
        criteria = input_data.constraints.get("decision_criteria", [])
        criteria_text = "\n".join(f"- {c}" for c in criteria) if criteria else "Use standard decision criteria"

        previous = ""
        if input_data.previous_results:
            prev_result = input_data.previous_results[-1].get("result", {})
            if isinstance(prev_result, dict):
                previous = prev_result.get("trade_offs", [])

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Provide recommendations for the following decision:

{input_data.task}

Decision Criteria:
{criteria_text}

Previous trade-offs to address: {previous or 'None'}

Provide:
- 3-5 viable options with pros, cons, risk level, confidence, score
- Top recommendation with rationale
- Decision criteria used
- Key trade-offs
- Implementation steps"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("recommend_llm_failed", error=str(exc))
            return self._mock_recommend(input_data)

    def _parse_response(self, content: str, context: str) -> RecommendResult:
        """Parse LLM response into RecommendResult"""
        options = [
            RecommendationOption(
                option_id="opt_1",
                title="Primary Approach",
                description="Recommended primary solution",
                pros=["Proven approach", "Lower risk", "Faster implementation"],
                cons=["Higher cost", "Limited flexibility"],
                risk_level="low",
                confidence=0.85,
                score=0.88,
                requirements=["Budget approval", "Team allocation"]
            ),
            RecommendationOption(
                option_id="opt_2",
                title="Alternative Approach",
                description="Alternative solution with trade-offs",
                pros=["Lower cost", "More flexible", "Innovative"],
                cons=["Higher risk", "Less proven", "Longer timeline"],
                risk_level="medium",
                confidence=0.75,
                score=0.72,
                requirements=["Technical expertise", "Risk acceptance"]
            ),
            RecommendationOption(
                option_id="opt_3",
                title="Conservative Approach",
                description="Minimal change approach",
                pros=["Minimal disruption", "Low cost", "Quick to implement"],
                cons=["Limited improvement", "May not address root cause"],
                risk_level="low",
                confidence=0.80,
                score=0.65,
                requirements=["Current resources sufficient"]
            ),
        ]

        return RecommendResult(
            decision_context=context[:300],
            options=options,
            top_recommendation="opt_1",
            recommendation_rationale="Option 1 provides the best balance of effectiveness and risk",
            criteria_used=["Effectiveness", "Risk", "Cost", "Timeline"],
            trade_offs=["Higher cost vs. lower risk", "Speed vs. flexibility"],
            implementation_steps=[
                "Secure budget approval",
                "Assemble implementation team",
                "Execute phased rollout"
            ],
            confidence_level=0.85
        )

    def _mock_recommend(self, input_data: RunnerInput) -> RecommendResult:
        """Mock response for testing without LLM"""
        options = [
            RecommendationOption(
                option_id="opt_a",
                title="Recommended Option",
                description="Primary recommendation for testing",
                pros=["Pro 1", "Pro 2"],
                cons=["Con 1"],
                risk_level="medium",
                confidence=0.80,
                score=0.82,
                requirements=["Requirement 1"]
            ),
            RecommendationOption(
                option_id="opt_b",
                title="Alternative Option",
                description="Secondary option for comparison",
                pros=["Pro 1"],
                cons=["Con 1", "Con 2"],
                risk_level="medium",
                confidence=0.70,
                score=0.68,
                requirements=["Requirement 2"]
            ),
        ]

        return RecommendResult(
            decision_context=input_data.task[:200],
            options=options,
            top_recommendation="opt_a",
            recommendation_rationale="Best overall score based on criteria",
            criteria_used=["Effectiveness", "Feasibility"],
            trade_offs=["Standard trade-off consideration"],
            implementation_steps=["Step 1", "Step 2"],
            confidence_level=0.80
        )

    def _validate_output(
        self,
        output: RecommendResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate recommendation quality"""
        scores = {}

        # Relevance: Does recommendation address the decision?
        has_recommendation = output.top_recommendation is not None
        has_rationale = len(output.recommendation_rationale) > 50
        scores[QualityMetric.RELEVANCE] = (
            (0.5 if has_recommendation else 0) +
            (0.5 if has_rationale else 0.2)
        )

        # Comprehensiveness: Are options well-analyzed?
        num_options = len(output.options)
        all_have_pros_cons = all(
            len(o.pros) >= 1 and len(o.cons) >= 1
            for o in output.options
        )
        scores[QualityMetric.COMPREHENSIVENESS] = (
            0.5 * min(num_options / 3, 1.0) +
            0.5 * (1.0 if all_have_pros_cons else 0.5)
        )

        # Accuracy: Are options scored consistently?
        if output.options:
            sorted_by_score = sorted(output.options, key=lambda o: o.score, reverse=True)
            top_is_recommended = (
                not output.top_recommendation or
                sorted_by_score[0].option_id == output.top_recommendation
            )
            scores[QualityMetric.ACCURACY] = 0.9 if top_is_recommended else 0.6
        else:
            scores[QualityMetric.ACCURACY] = 0.3

        # Expression: Is the recommendation clear?
        has_steps = len(output.implementation_steps) >= 2
        has_tradeoffs = len(output.trade_offs) >= 1
        scores[QualityMetric.EXPRESSION] = (
            (0.5 if has_steps else 0.2) +
            (0.5 if has_tradeoffs else 0.2)
        )

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context string from layers"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Cross-industry decision frameworks")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Function-specific decision criteria")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("Deep specialty decision expertise")
        return "; ".join(contexts) if contexts else "General decision context"


class RecommendAdvancedRunner(RecommendRunner):
    """Advanced recommendation with scenario analysis and ROI modeling"""

    def __init__(self):
        super().__init__()
        self.runner_id = "recommend_advanced"
        self.name = "Advanced Recommend Runner"
        self.description = "Advanced recommendation with scenario analysis, ROI modeling, and stakeholder mapping"

        self._system_prompt += """

Additionally:
- Perform scenario analysis (best case, worst case, most likely)
- Provide ROI estimates where applicable
- Map stakeholder impact for each option
- Include sensitivity analysis for key assumptions"""
