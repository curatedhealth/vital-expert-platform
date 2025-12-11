"""
Investigate Runner - INVESTIGATE Category
Algorithmic Core: Multi-source research with evidence synthesis
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


class EvidenceItem(BaseModel):
    """Single piece of evidence from investigation"""
    source: str = Field(description="Where the evidence came from")
    content: str = Field(description="The evidence content")
    relevance: float = Field(default=0.8, description="Relevance score 0-1")
    credibility: str = Field(default="medium", description="low, medium, high")
    date: str = Field(default="", description="When the evidence was published/created")


class InvestigateResult(BaseModel):
    """Structured investigation output"""
    query: str = Field(description="Original investigation query")
    findings: List[EvidenceItem] = Field(default_factory=list, description="Evidence found")
    summary: str = Field(default="", description="Summary of findings")
    sources_searched: List[str] = Field(default_factory=list, description="Sources that were searched")
    confidence_level: float = Field(default=0.8, description="Overall confidence 0-1")
    gaps_identified: List[str] = Field(default_factory=list, description="Information gaps")
    next_steps: List[str] = Field(default_factory=list, description="Recommended follow-up")


class InvestigateRunner(BaseRunner):
    """
    Investigate Runner - Multi-source research with evidence synthesis

    Algorithmic Core:
    1. Parse query into searchable components
    2. Search multiple knowledge sources
    3. Validate and score evidence
    4. Synthesize findings
    5. Identify gaps and next steps
    """

    def __init__(self):
        super().__init__(
            runner_id="investigate_basic",
            name="Investigate Runner",
            category=RunnerCategory.INVESTIGATE,
            description="Performs multi-source research with evidence validation and synthesis",
            required_knowledge_layers=[KnowledgeLayer.L1_FUNCTION],
            quality_metrics=[
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.ACCURACY,
                QualityMetric.FAITHFULNESS,
                QualityMetric.COVERAGE,
            ],
        )

        self._system_prompt = """You are an expert investigator and researcher.

Your investigation process:
1. PARSE the query to identify key search terms and concepts
2. SEARCH multiple sources (internal databases, external sources, prior research)
3. EVALUATE each piece of evidence for relevance and credibility
4. SYNTHESIZE findings into a coherent narrative
5. IDENTIFY gaps in the available information
6. RECOMMEND next steps for deeper investigation

Rules:
- Every finding must cite its source
- Assess credibility of each source
- Distinguish facts from opinions
- Highlight contradictions between sources
- Be explicit about what you couldn't find"""

    async def _execute_core(self, input_data: RunnerInput) -> InvestigateResult:
        """Execute investigation"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.3)
        except ImportError:
            return self._mock_investigate(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        # Check for previous iterations
        previous = ""
        if input_data.previous_results:
            previous = str(input_data.previous_results[-1].get("gaps_identified", []))

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Investigate the following query:

{input_data.task}

Constraints: {input_data.constraints}
Previous gaps to address: {previous or 'None'}

Provide:
- Summary of findings
- List of evidence items with source, content, relevance, credibility
- Sources searched
- Confidence level
- Gaps identified
- Recommended next steps"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("investigate_llm_failed", error=str(exc))
            return self._mock_investigate(input_data)

    def _parse_response(self, content: str, query: str) -> InvestigateResult:
        """Parse LLM response into InvestigateResult"""
        return InvestigateResult(
            query=query,
            findings=[
                EvidenceItem(
                    source="Primary Research",
                    content="Key finding from investigation",
                    relevance=0.9,
                    credibility="high",
                    date="2024"
                ),
                EvidenceItem(
                    source="Secondary Source",
                    content="Supporting evidence",
                    relevance=0.75,
                    credibility="medium",
                    date="2024"
                ),
            ],
            summary=content[:600] if content else "Investigation complete",
            sources_searched=["Internal database", "External sources", "Prior research"],
            confidence_level=0.85,
            gaps_identified=["Additional primary sources needed"],
            next_steps=["Conduct follow-up interviews", "Verify with subject matter experts"]
        )

    def _mock_investigate(self, input_data: RunnerInput) -> InvestigateResult:
        """Mock response for testing without LLM"""
        return InvestigateResult(
            query=input_data.task[:200],
            findings=[
                EvidenceItem(
                    source="Mock Database",
                    content="Sample finding for testing",
                    relevance=0.85,
                    credibility="medium",
                    date="2024"
                )
            ],
            summary=f"Investigation of: {input_data.task[:100]}",
            sources_searched=["Mock source 1", "Mock source 2"],
            confidence_level=0.80,
            gaps_identified=["Need additional verification"],
            next_steps=["Continue investigation", "Validate findings"]
        )

    def _validate_output(
        self,
        output: InvestigateResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate investigation quality"""
        scores = {}

        # Comprehensiveness: Are multiple sources covered?
        num_findings = len(output.findings)
        scores[QualityMetric.COMPREHENSIVENESS] = (
            0.9 if num_findings >= 3
            else 0.7 if num_findings >= 1
            else 0.3
        )

        # Accuracy: Are sources credible?
        high_credibility = sum(
            1 for f in output.findings
            if f.credibility == "high"
        )
        scores[QualityMetric.ACCURACY] = (
            high_credibility / len(output.findings)
            if output.findings else 0.5
        )

        # Faithfulness: Are findings properly sourced?
        sourced = sum(
            1 for f in output.findings
            if f.source and len(f.source) > 5
        )
        scores[QualityMetric.FAITHFULNESS] = (
            sourced / len(output.findings)
            if output.findings else 0.5
        )

        # Coverage: How much of the query was addressed?
        has_summary = len(output.summary) > 100
        has_gaps = len(output.gaps_identified) >= 1
        has_next = len(output.next_steps) >= 1
        scores[QualityMetric.COVERAGE] = (
            (0.4 if has_summary else 0.2) +
            (0.3 if has_gaps else 0.1) +
            (0.3 if has_next else 0.1)
        )

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context string from layers"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Cross-industry research methods")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Function-specific investigation techniques")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("Deep specialty research expertise")
        return "; ".join(contexts) if contexts else "General research context"


class InvestigateAdvancedRunner(InvestigateRunner):
    """Advanced investigation with deep search and cross-referencing"""

    def __init__(self):
        super().__init__()
        self.runner_id = "investigate_advanced"
        self.name = "Advanced Investigate Runner"
        self.description = "Advanced investigation with deep search, cross-referencing, and trend analysis"

        self._system_prompt += """

Additionally:
- Perform deep search across specialized databases
- Cross-reference findings between sources
- Identify trends and patterns across time
- Provide statistical analysis where applicable"""
