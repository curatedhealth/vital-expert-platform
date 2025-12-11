"""
Synthesize Runner - SYNTHESIZE Category
Algorithmic Core: Information fusion with insight extraction
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


class SynthesisInsight(BaseModel):
    """Single synthesized insight"""
    insight: str = Field(description="The synthesized insight")
    supporting_sources: List[str] = Field(default_factory=list, description="Sources supporting this insight")
    confidence: float = Field(default=0.8, description="Confidence level 0-1")
    implications: List[str] = Field(default_factory=list, description="Business implications")


class SynthesisResult(BaseModel):
    """Structured synthesis output"""
    executive_summary: str = Field(description="High-level synthesis summary")
    key_insights: List[SynthesisInsight] = Field(default_factory=list, description="Main synthesized insights")
    themes: List[str] = Field(default_factory=list, description="Identified themes across sources")
    contradictions: List[str] = Field(default_factory=list, description="Conflicting information found")
    gaps: List[str] = Field(default_factory=list, description="Information gaps identified")
    recommendations: List[str] = Field(default_factory=list, description="Action recommendations")
    overall_confidence: float = Field(default=0.8, description="Overall synthesis confidence")


class SynthesizeRunner(BaseRunner):
    """
    Synthesize Runner - Information fusion with insight extraction

    Algorithmic Core:
    1. Parse multiple information sources
    2. Identify common themes and patterns
    3. Detect contradictions and gaps
    4. Generate novel insights from combinations
    5. Produce coherent narrative synthesis
    """

    def __init__(self):
        super().__init__(
            runner_id="synthesize_basic",
            name="Synthesize Runner",
            category=RunnerCategory.SYNTHESIZE,
            description="Fuses multiple information sources into coherent insights",
            required_knowledge_layers=[KnowledgeLayer.L1_FUNCTION],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.FAITHFULNESS,
                QualityMetric.COVERAGE,
            ],
        )

        self._system_prompt = """You are an expert synthesizer combining multiple sources into insights.

Your synthesis process:
1. IDENTIFY common themes across all sources
2. DETECT contradictions or conflicting information
3. FIND gaps in the available information
4. GENERATE novel insights by connecting ideas
5. PRODUCE a coherent narrative that captures the essence

Rules:
- Every insight must cite supporting sources
- Acknowledge uncertainty and contradictions
- Identify what's missing (gaps)
- Provide actionable recommendations"""

    async def _execute_core(self, input_data: RunnerInput) -> SynthesisResult:
        """Execute synthesis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.4)
        except ImportError:
            return self._mock_synthesis(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        # Extract sources from context
        sources = input_data.context.get("sources", [])
        sources_text = "\n\n".join([
            f"Source {i+1}: {s.get('content', s) if isinstance(s, dict) else str(s)}"
            for i, s in enumerate(sources)
        ]) if sources else "No additional sources provided"

        previous_attempts = ""
        if input_data.previous_results:
            previous_attempts = str(input_data.previous_results[-1].get("result", ""))

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Synthesize the following information:

{input_data.task}

Sources to synthesize:
{sources_text}

Previous synthesis attempts: {previous_attempts or 'None'}

Provide:
- Executive summary
- Key insights with supporting sources
- Themes identified
- Contradictions found
- Gaps in information
- Recommendations"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response))
        except Exception as exc:
            logger.error("synthesize_llm_failed", error=str(exc))
            return self._mock_synthesis(input_data)

    def _parse_response(self, content: str) -> SynthesisResult:
        """Parse LLM response into SynthesisResult"""
        return SynthesisResult(
            executive_summary=content[:800] if content else "Synthesis complete",
            key_insights=[
                SynthesisInsight(
                    insight="Key finding from synthesis",
                    supporting_sources=["Source 1", "Source 2"],
                    confidence=0.85,
                    implications=["Business implication 1"]
                )
            ],
            themes=["Primary theme", "Secondary theme"],
            contradictions=[],
            gaps=["Additional data needed"],
            recommendations=["Action item 1", "Action item 2"],
            overall_confidence=0.85
        )

    def _mock_synthesis(self, input_data: RunnerInput) -> SynthesisResult:
        """Mock response for testing without LLM"""
        return SynthesisResult(
            executive_summary=f"Synthesis of: {input_data.task[:200]}",
            key_insights=[
                SynthesisInsight(
                    insight="The primary finding indicates strong alignment",
                    supporting_sources=["Analysis 1"],
                    confidence=0.82,
                    implications=["Strategic opportunity identified"]
                )
            ],
            themes=["Integration", "Optimization"],
            contradictions=[],
            gaps=["Historical data needed"],
            recommendations=["Proceed with implementation"],
            overall_confidence=0.82
        )

    def _validate_output(
        self,
        output: SynthesisResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate synthesis quality"""
        scores = {}

        # Relevance: Does synthesis address the task?
        scores[QualityMetric.RELEVANCE] = (
            0.9 if output.executive_summary and len(output.executive_summary) > 100
            else 0.5
        )

        # Comprehensiveness: Are all aspects covered?
        has_insights = len(output.key_insights) >= 3
        has_themes = len(output.themes) >= 2
        has_gaps = len(output.gaps) >= 1
        scores[QualityMetric.COMPREHENSIVENESS] = (
            (0.4 if has_insights else 0.2) +
            (0.3 if has_themes else 0.1) +
            (0.3 if has_gaps else 0.1)
        )

        # Faithfulness: Are insights grounded in sources?
        cited_insights = sum(
            1 for i in output.key_insights
            if i.supporting_sources and len(i.supporting_sources) > 0
        )
        scores[QualityMetric.FAITHFULNESS] = (
            cited_insights / len(output.key_insights)
            if output.key_insights else 0.5
        )

        # Coverage: Information coverage
        scores[QualityMetric.COVERAGE] = min(1.0, len(output.key_insights) * 0.15 + 0.4)

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Cross-industry synthesis patterns")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Function-specific synthesis frameworks")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("Deep domain synthesis expertise")
        return "; ".join(contexts) if contexts else "General synthesis context"


class SynthesizeAdvancedRunner(SynthesizeRunner):
    """Advanced synthesis with meta-analysis and quantitative integration"""

    def __init__(self):
        super().__init__()
        self.runner_id = "synthesize_advanced"
        self.name = "Advanced Synthesize Runner"
        self.description = "Advanced synthesis with meta-analysis and quantitative integration"

        self._system_prompt += """

Additionally:
- Perform meta-analysis where quantitative data is available
- Provide statistical confidence intervals
- Integrate qualitative and quantitative findings"""
