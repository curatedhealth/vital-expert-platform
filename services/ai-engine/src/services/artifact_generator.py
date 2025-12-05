"""
Artifact Generator Service

Generates artifacts from AI responses and evidence:
- Mode 1: Quick Reference Cards (inline, fast generation)
- Mode 3: Comprehensive Research Reports (async, detailed)

Both modes create exportable, citable artifacts for user reference.

Created: 2025-12-02
"""

from typing import List, Dict, Any, Optional
import time
import structlog

from models.artifacts import (
    ArtifactType,
    ArtifactGenerationRequest,
    ArtifactGenerationResult,
    QuickReferenceCard,
    ComprehensiveResearchReport,
    EvidenceSource,
    KeyPoint,
    ResearchSection
)
from models.l4_l5_config import L5Finding, L4AggregatedContext

logger = structlog.get_logger()


# Evidence tier mapping
SOURCE_TYPE_TO_TIER = {
    "regulatory": 1,
    "scientific": 2,
    "clinical_trial": 3,
    "health_authority": 4,
    "rag": 5,
    "web": 6,
    "mock": 6
}


class ArtifactGenerator:
    """
    Generates artifacts from AI responses and evidence context.

    Mode 1: Quick Reference Cards
    - Generated inline during response streaming
    - Compact format (title, summary, 5 key points, top sources)
    - 30-day TTL

    Mode 3: Comprehensive Research Reports
    - Generated after response completion
    - Full research document format
    - 1-year TTL for compliance
    """

    def __init__(self):
        """Initialize the artifact generator."""
        self.generation_count = 0
        self.total_generation_time_ms = 0

        logger.info("artifact_generator.initialized")

    async def generate(
        self,
        request: ArtifactGenerationRequest
    ) -> ArtifactGenerationResult:
        """
        Generate an artifact based on the request type.

        Args:
            request: Artifact generation request

        Returns:
            ArtifactGenerationResult with the generated artifact
        """
        start_time = time.time()
        self.generation_count += 1

        logger.info(
            "artifact_generator.generate_start",
            artifact_type=request.artifact_type.value,
            mode=request.mode,
            tenant_id=request.tenant_id
        )

        try:
            if request.artifact_type == ArtifactType.QUICK_REFERENCE:
                artifact = await self._generate_quick_reference(request)
            elif request.artifact_type == ArtifactType.RESEARCH_REPORT:
                artifact = await self._generate_research_report(request)
            else:
                raise ValueError(f"Unsupported artifact type: {request.artifact_type}")

            generation_time_ms = int((time.time() - start_time) * 1000)
            self.total_generation_time_ms += generation_time_ms

            logger.info(
                "artifact_generator.generate_success",
                artifact_type=request.artifact_type.value,
                artifact_id=artifact.id,
                generation_time_ms=generation_time_ms
            )

            return ArtifactGenerationResult(
                success=True,
                artifact_id=artifact.id,
                artifact_type=request.artifact_type,
                artifact=artifact,
                generation_time_ms=generation_time_ms
            )

        except Exception as e:
            generation_time_ms = int((time.time() - start_time) * 1000)

            logger.error(
                "artifact_generator.generate_error",
                artifact_type=request.artifact_type.value,
                error=str(e),
                error_type=type(e).__name__
            )

            return ArtifactGenerationResult(
                success=False,
                artifact_type=request.artifact_type,
                generation_time_ms=generation_time_ms,
                error=str(e)
            )

    async def _generate_quick_reference(
        self,
        request: ArtifactGenerationRequest
    ) -> QuickReferenceCard:
        """
        Generate a Mode 1 Quick Reference Card.

        Fast generation for inline display during chat.
        """
        evidence = request.evidence_context
        findings = evidence.get('findings', [])
        tools_used = evidence.get('tools_used', [])

        # Convert findings to EvidenceSource objects
        evidence_sources = self._convert_findings_to_evidence_sources(findings, max_sources=6)

        # Extract key points from response content
        key_points = self._extract_key_points(request.response_content, evidence_sources, max_points=5)

        # Generate summary
        summary = self._generate_summary(request.query, request.response_content)

        # Calculate evidence quality score
        evidence_quality = self._calculate_evidence_quality(evidence_sources)

        # Create title
        title = self._generate_title(request.query)

        return QuickReferenceCard(
            title=title,
            query=request.query,
            summary=summary,
            key_points=key_points,
            evidence_sources=evidence_sources,
            evidence_quality_score=evidence_quality,
            tenant_id=request.tenant_id,
            agent_id=request.agent_id,
            conversation_id=request.conversation_id,
            tools_used=tools_used
        )

    async def _generate_research_report(
        self,
        request: ArtifactGenerationRequest
    ) -> ComprehensiveResearchReport:
        """
        Generate a Mode 3 Comprehensive Research Report.

        Detailed generation for thorough analysis.
        """
        evidence = request.evidence_context
        findings = evidence.get('findings', [])
        tools_used = evidence.get('tools_used', [])
        token_count = evidence.get('token_count', 0)

        # Convert all findings to evidence sources
        supporting_evidence = self._convert_findings_to_evidence_sources(findings)

        # Extract key findings
        key_findings = self._extract_key_points(request.response_content, supporting_evidence, max_points=10)

        # Generate executive summary
        executive_summary = self._generate_executive_summary(request.query, request.response_content, supporting_evidence)

        # Generate methodology description
        methodology = self._generate_methodology_description(
            tools_used=tools_used,
            research_depth=request.research_depth or "standard",
            source_count=len(supporting_evidence)
        )

        # Generate report sections
        sections = self._generate_report_sections(request.response_content, supporting_evidence)

        # Generate recommendations
        recommendations = self._extract_recommendations(request.response_content)

        # Calculate quality metrics
        evidence_quality = self._calculate_evidence_quality(supporting_evidence)
        source_diversity = self._calculate_source_diversity(supporting_evidence)

        # Generate confidence assessment
        confidence = self._assess_confidence(evidence_quality, source_diversity, len(supporting_evidence))

        # Generate title
        title = f"Research Report: {self._generate_title(request.query)}"

        return ComprehensiveResearchReport(
            title=title,
            query=request.query,
            executive_summary=executive_summary,
            research_depth=request.research_depth or "standard",
            methodology_description=methodology,
            iterations_performed=1,  # TODO: Get from mode 3 context
            tools_invoked=tools_used,
            sections=sections,
            key_findings=key_findings,
            supporting_evidence=supporting_evidence,
            conflicting_evidence=[],  # TODO: Implement conflict detection
            confidence_assessment=confidence,
            limitations=self._generate_limitations(tools_used, supporting_evidence),
            recommendations=recommendations,
            evidence_quality_score=evidence_quality,
            source_diversity_score=source_diversity,
            citation_count=len(supporting_evidence),
            tenant_id=request.tenant_id,
            agent_id=request.agent_id,
            conversation_id=request.conversation_id
        )

    def _convert_findings_to_evidence_sources(
        self,
        findings: List[Dict[str, Any]],
        max_sources: Optional[int] = None
    ) -> List[EvidenceSource]:
        """Convert L5 findings to EvidenceSource objects."""
        sources = []

        for finding in findings:
            if max_sources and len(sources) >= max_sources:
                break

            source_type = finding.get('source_type', 'web')
            tier = SOURCE_TYPE_TO_TIER.get(source_type, 6)

            sources.append(EvidenceSource(
                source_type=finding.get('source_tool', 'unknown'),
                title=finding.get('title', 'Untitled'),
                content_snippet=finding.get('content', '')[:300],
                url=finding.get('source_url'),
                citation=finding.get('citation', ''),
                relevance_score=finding.get('relevance_score', 0.0),
                tier=tier
            ))

        # Sort by tier (lower is better)
        sources.sort(key=lambda s: (s.tier, -s.relevance_score))

        return sources

    def _extract_key_points(
        self,
        content: str,
        sources: List[EvidenceSource],
        max_points: int = 5
    ) -> List[KeyPoint]:
        """Extract key points from response content."""
        # Simple extraction: Split by sentences and take most relevant
        # In production, this would use NLP or the LLM to extract key points
        sentences = content.replace('\n', ' ').split('. ')
        sentences = [s.strip() + '.' for s in sentences if len(s.strip()) > 30]

        key_points = []
        for i, sentence in enumerate(sentences[:max_points]):
            # Assign supporting sources based on content matching
            supporting = []
            for source in sources[:3]:
                # Simple matching - in production use semantic similarity
                if any(word in source.content_snippet.lower() for word in sentence.lower().split()[:5]):
                    supporting.append(source.citation)

            key_points.append(KeyPoint(
                point=sentence,
                supporting_sources=supporting[:2],  # Max 2 citations per point
                confidence=0.8 if supporting else 0.6
            ))

        return key_points

    def _generate_summary(self, query: str, content: str) -> str:
        """Generate a 2-3 sentence summary."""
        # Take first 2-3 sentences as summary
        # In production, use LLM to generate proper summary
        sentences = content.replace('\n', ' ').split('. ')
        summary_sentences = []

        for sentence in sentences:
            if len(sentence.strip()) > 20:
                summary_sentences.append(sentence.strip())
            if len(summary_sentences) >= 3:
                break

        return '. '.join(summary_sentences) + '.' if summary_sentences else content[:300]

    def _generate_executive_summary(
        self,
        query: str,
        content: str,
        sources: List[EvidenceSource]
    ) -> str:
        """Generate executive summary for research report."""
        # In production, use LLM to generate proper executive summary
        summary = self._generate_summary(query, content)

        # Add source statistics
        tier_counts = {}
        for source in sources:
            tier_name = {1: "regulatory", 2: "scientific", 3: "clinical", 4: "health authority", 5: "internal", 6: "web"}.get(source.tier, "unknown")
            tier_counts[tier_name] = tier_counts.get(tier_name, 0) + 1

        source_summary = ", ".join([f"{count} {tier}" for tier, count in tier_counts.items()])

        return f"{summary}\n\nThis analysis is based on {len(sources)} evidence sources ({source_summary})."

    def _generate_title(self, query: str) -> str:
        """Generate a title from the query."""
        # Capitalize and truncate
        title = query.strip()
        if len(title) > 100:
            title = title[:97] + "..."
        return title.title()

    def _generate_methodology_description(
        self,
        tools_used: List[str],
        research_depth: str,
        source_count: int
    ) -> str:
        """Generate methodology description."""
        tool_names = {
            "rag": "internal knowledge base search",
            "websearch": "live web search with authoritative sources",
            "pubmed": "PubMed scientific literature search",
            "fda": "FDA regulatory database search"
        }

        tools_desc = ", ".join([tool_names.get(t, t) for t in tools_used])

        depth_desc = {
            "quick": "rapid initial assessment",
            "standard": "balanced analysis with moderate depth",
            "deep": "thorough investigation with extensive source review",
            "exhaustive": "comprehensive analysis with maximum depth"
        }.get(research_depth, "standard analysis")

        return f"This research was conducted using {tools_desc}. " \
               f"The analysis approach was {depth_desc}, reviewing {source_count} sources " \
               f"to ensure evidence-based findings."

    def _generate_report_sections(
        self,
        content: str,
        sources: List[EvidenceSource]
    ) -> List[ResearchSection]:
        """Generate report sections from content."""
        # Simple sectioning - in production use LLM to structure properly
        sections = []

        # Background section
        if len(content) > 200:
            sections.append(ResearchSection(
                heading="Background",
                content=content[:500] + "..." if len(content) > 500 else content,
                citations=[s.citation for s in sources[:2]]
            ))

        # Analysis section
        if len(content) > 500:
            sections.append(ResearchSection(
                heading="Analysis",
                content=content[500:1500] if len(content) > 1500 else content[500:],
                citations=[s.citation for s in sources[2:5]]
            ))

        return sections

    def _extract_recommendations(self, content: str) -> List[str]:
        """Extract recommendations from content."""
        # Simple extraction - look for recommendation patterns
        # In production, use NLP or LLM
        recommendations = []

        patterns = ["recommend", "suggest", "should", "consider"]
        sentences = content.split('. ')

        for sentence in sentences:
            if any(pattern in sentence.lower() for pattern in patterns):
                clean = sentence.strip()
                if len(clean) > 20 and len(clean) < 200:
                    recommendations.append(clean + '.')

        return recommendations[:5]

    def _calculate_evidence_quality(self, sources: List[EvidenceSource]) -> float:
        """Calculate overall evidence quality score (0-1)."""
        if not sources:
            return 0.0

        # Weight by tier (lower tier = higher quality)
        tier_weights = {1: 1.0, 2: 0.95, 3: 0.90, 4: 0.85, 5: 0.75, 6: 0.60}

        total_weight = 0
        weighted_score = 0

        for source in sources:
            weight = tier_weights.get(source.tier, 0.5)
            weighted_score += weight * source.relevance_score
            total_weight += weight

        return weighted_score / total_weight if total_weight > 0 else 0.0

    def _calculate_source_diversity(self, sources: List[EvidenceSource]) -> float:
        """Calculate source diversity score (0-1)."""
        if not sources:
            return 0.0

        # Count unique source types
        source_types = set(s.source_type for s in sources)

        # More diverse = higher score
        # Max score at 4+ different source types
        return min(len(source_types) / 4.0, 1.0)

    def _assess_confidence(
        self,
        evidence_quality: float,
        source_diversity: float,
        source_count: int
    ) -> str:
        """Generate confidence assessment text."""
        combined_score = (evidence_quality * 0.5) + (source_diversity * 0.3) + (min(source_count / 10, 1) * 0.2)

        if combined_score >= 0.8:
            return "HIGH confidence. Findings are well-supported by high-quality, diverse evidence sources."
        elif combined_score >= 0.6:
            return "MODERATE confidence. Findings are supported by reasonable evidence but may benefit from additional sources."
        elif combined_score >= 0.4:
            return "LIMITED confidence. Evidence is sparse or from lower-tier sources. Results should be verified."
        else:
            return "LOW confidence. Limited evidence available. Findings are preliminary and require further investigation."

    def _generate_limitations(
        self,
        tools_used: List[str],
        sources: List[EvidenceSource]
    ) -> List[str]:
        """Generate list of research limitations."""
        limitations = []

        # Check for tool coverage
        all_tools = {"rag", "websearch", "pubmed", "fda"}
        missing_tools = all_tools - set(tools_used)
        if missing_tools:
            limitations.append(f"Analysis did not include searches from: {', '.join(missing_tools)}")

        # Check for source diversity
        source_types = set(s.source_type for s in sources)
        if len(source_types) < 3:
            limitations.append("Limited diversity in evidence sources")

        # Check for tier coverage
        tiers = set(s.tier for s in sources)
        if 1 not in tiers and 2 not in tiers:
            limitations.append("No regulatory or peer-reviewed scientific sources found")

        if not limitations:
            limitations.append("No significant limitations identified in this analysis")

        return limitations

    def get_stats(self) -> Dict[str, Any]:
        """Get generation statistics."""
        return {
            'generation_count': self.generation_count,
            'total_generation_time_ms': self.total_generation_time_ms,
            'avg_generation_time_ms': (
                self.total_generation_time_ms / self.generation_count
                if self.generation_count > 0 else 0
            )
        }


# =============================================================================
# Factory Function
# =============================================================================

_artifact_generator: Optional[ArtifactGenerator] = None


def get_artifact_generator() -> ArtifactGenerator:
    """Get or create ArtifactGenerator singleton."""
    global _artifact_generator
    if _artifact_generator is None:
        _artifact_generator = ArtifactGenerator()
    return _artifact_generator


async def generate_quick_reference(
    query: str,
    response_content: str,
    evidence_context: L4AggregatedContext,
    tenant_id: str,
    agent_id: Optional[str] = None,
    conversation_id: Optional[str] = None
) -> ArtifactGenerationResult:
    """
    Convenience function to generate a Mode 1 Quick Reference Card.

    Args:
        query: User query
        response_content: AI response
        evidence_context: L4AggregatedContext with evidence
        tenant_id: Tenant ID
        agent_id: Agent ID
        conversation_id: Conversation ID

    Returns:
        ArtifactGenerationResult
    """
    generator = get_artifact_generator()

    request = ArtifactGenerationRequest(
        query=query,
        response_content=response_content,
        evidence_context=evidence_context.model_dump() if hasattr(evidence_context, 'model_dump') else evidence_context,
        artifact_type=ArtifactType.QUICK_REFERENCE,
        tenant_id=tenant_id,
        agent_id=agent_id,
        conversation_id=conversation_id,
        mode="mode_1"
    )

    return await generator.generate(request)


async def generate_research_report(
    query: str,
    response_content: str,
    evidence_context: L4AggregatedContext,
    tenant_id: str,
    research_depth: str = "standard",
    agent_id: Optional[str] = None,
    conversation_id: Optional[str] = None
) -> ArtifactGenerationResult:
    """
    Convenience function to generate a Mode 3 Comprehensive Research Report.

    Args:
        query: User query
        response_content: AI response
        evidence_context: L4AggregatedContext with evidence
        tenant_id: Tenant ID
        research_depth: Research depth level
        agent_id: Agent ID
        conversation_id: Conversation ID

    Returns:
        ArtifactGenerationResult
    """
    generator = get_artifact_generator()

    request = ArtifactGenerationRequest(
        query=query,
        response_content=response_content,
        evidence_context=evidence_context.model_dump() if hasattr(evidence_context, 'model_dump') else evidence_context,
        artifact_type=ArtifactType.RESEARCH_REPORT,
        tenant_id=tenant_id,
        agent_id=agent_id,
        conversation_id=conversation_id,
        mode="mode_3",
        research_depth=research_depth
    )

    return await generator.generate(request)
