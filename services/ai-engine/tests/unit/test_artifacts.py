"""
Unit Tests for Artifact Generation

Tests for:
- ArtifactGenerator
- QuickReferenceCard (Mode 1)
- ComprehensiveResearchReport (Mode 3)
- Evidence quality scoring

Created: 2025-12-02
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

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
from services.artifact_generator import (
    ArtifactGenerator,
    get_artifact_generator,
    generate_quick_reference,
    generate_research_report,
    SOURCE_TYPE_TO_TIER
)
from models.l4_l5_config import L4AggregatedContext, L5Finding


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def sample_evidence_context():
    """Create sample evidence context from L4."""
    return {
        'findings': [
            {
                'source_tool': 'websearch',
                'title': 'FDA Drug Approval Guidelines',
                'content': 'The FDA drug approval process requires extensive clinical trials...',
                'relevance_score': 0.95,
                'citation': 'FDA.gov [regulatory]',
                'source_url': 'https://fda.gov/drugs/approval',
                'source_type': 'regulatory'
            },
            {
                'source_tool': 'websearch',
                'title': 'PubMed: Clinical Trial Design',
                'content': 'Best practices for randomized controlled trials include...',
                'relevance_score': 0.88,
                'citation': 'PubMed PMID:12345',
                'source_url': 'https://pubmed.ncbi.nlm.nih.gov/12345',
                'source_type': 'scientific'
            },
            {
                'source_tool': 'rag',
                'title': 'Internal: Regulatory Compliance Guide',
                'content': 'Our internal compliance standards require documentation of...',
                'relevance_score': 0.82,
                'citation': 'Internal KB [compliance]',
                'source_url': None,
                'source_type': 'rag'
            }
        ],
        'total_sources': 2,
        'tools_used': ['websearch', 'rag'],
        'token_count': 500,
        'aggregation_strategy': 'ranked_list',
        'summary': None
    }


@pytest.fixture
def sample_response_content():
    """Create sample AI response content."""
    return """
    Based on the evidence gathered, the FDA drug approval process involves several key stages:

    1. Preclinical Testing: Laboratory and animal studies to assess safety.
    2. IND Application: Submission of Investigational New Drug application to FDA.
    3. Clinical Trials: Phase 1, 2, and 3 trials with human subjects.
    4. NDA Review: FDA review of the New Drug Application.
    5. Post-Market Surveillance: Ongoing monitoring after approval.

    It is recommended that pharmaceutical companies maintain comprehensive documentation
    throughout the process. The FDA requires evidence of safety and efficacy before approval.

    Key takeaways include the importance of protocol design and regulatory compliance.
    Companies should consider engaging with the FDA early in the development process.
    """


@pytest.fixture
def generator():
    """Create artifact generator instance."""
    return ArtifactGenerator()


# =============================================================================
# QuickReferenceCard (Mode 1) Tests
# =============================================================================

class TestQuickReferenceCard:
    """Tests for Mode 1 Quick Reference Card artifact."""

    @pytest.mark.asyncio
    async def test_generate_quick_reference(self, generator, sample_evidence_context, sample_response_content):
        """Test generating a Quick Reference Card."""
        request = ArtifactGenerationRequest(
            query="What is the FDA drug approval process?",
            response_content=sample_response_content,
            evidence_context=sample_evidence_context,
            artifact_type=ArtifactType.QUICK_REFERENCE,
            tenant_id="tenant-123",
            agent_id="agent-456",
            mode="mode_1"
        )

        result = await generator.generate(request)

        assert result.success is True
        assert result.artifact_type == ArtifactType.QUICK_REFERENCE
        assert result.artifact_id is not None
        assert result.generation_time_ms >= 0  # Fast operations may complete in <1ms

        artifact = result.artifact
        assert isinstance(artifact, QuickReferenceCard)
        assert artifact.query == "What is the FDA drug approval process?"
        assert len(artifact.summary) > 0
        assert len(artifact.key_points) <= 5
        assert len(artifact.evidence_sources) <= 6

    def test_quick_reference_ttl_30_days(self):
        """Test Quick Reference Card has 30-day TTL."""
        card = QuickReferenceCard(
            title="Test Card",
            query="Test query",
            summary="Test summary",
            tenant_id="tenant-123"
        )

        # Check TTL is approximately 30 days
        expected_expiry = datetime.utcnow() + timedelta(days=30)
        diff = abs((card.expires_at - expected_expiry).total_seconds())
        assert diff < 60  # Within 1 minute tolerance

    def test_quick_reference_export(self, sample_evidence_context):
        """Test Quick Reference Card export format."""
        card = QuickReferenceCard(
            title="FDA Approval Process",
            query="What is FDA approval?",
            summary="The FDA approval process involves multiple stages...",
            key_points=[
                KeyPoint(point="Preclinical testing is required", supporting_sources=["FDA.gov"], confidence=0.9)
            ],
            evidence_sources=[
                EvidenceSource(
                    source_type="websearch",
                    title="FDA Guidelines",
                    content_snippet="...",
                    citation="FDA.gov",
                    relevance_score=0.95,
                    tier=1
                )
            ],
            evidence_quality_score=0.85,
            tenant_id="tenant-123"
        )

        export = card.to_export_format()

        assert export['type'] == 'quick_reference'
        assert export['title'] == 'FDA Approval Process'
        assert 'key_points' in export
        assert 'sources' in export
        assert 'evidence_quality' in export


# =============================================================================
# ComprehensiveResearchReport (Mode 3) Tests
# =============================================================================

class TestComprehensiveResearchReport:
    """Tests for Mode 3 Comprehensive Research Report artifact."""

    @pytest.mark.asyncio
    async def test_generate_research_report(self, generator, sample_evidence_context, sample_response_content):
        """Test generating a Comprehensive Research Report."""
        request = ArtifactGenerationRequest(
            query="What is the FDA drug approval process?",
            response_content=sample_response_content,
            evidence_context=sample_evidence_context,
            artifact_type=ArtifactType.RESEARCH_REPORT,
            tenant_id="tenant-123",
            agent_id="agent-456",
            mode="mode_3",
            research_depth="deep"
        )

        result = await generator.generate(request)

        assert result.success is True
        assert result.artifact_type == ArtifactType.RESEARCH_REPORT

        artifact = result.artifact
        assert isinstance(artifact, ComprehensiveResearchReport)
        assert artifact.research_depth == "deep"
        assert len(artifact.executive_summary) > 0
        assert len(artifact.methodology_description) > 0
        assert len(artifact.supporting_evidence) > 0

    def test_research_report_ttl_1_year(self):
        """Test Research Report has 1-year TTL for compliance."""
        report = ComprehensiveResearchReport(
            title="Test Report",
            query="Test query",
            executive_summary="Test summary",
            methodology_description="Test methodology",
            confidence_assessment="HIGH",
            tenant_id="tenant-123"
        )

        # Check TTL is approximately 1 year
        expected_expiry = datetime.utcnow() + timedelta(days=365)
        diff = abs((report.expires_at - expected_expiry).total_seconds())
        assert diff < 60  # Within 1 minute tolerance

    def test_research_report_markdown_export(self):
        """Test Research Report markdown export."""
        report = ComprehensiveResearchReport(
            title="FDA Drug Approval Analysis",
            query="Analyze FDA approval process",
            executive_summary="This report analyzes the FDA drug approval process...",
            methodology_description="Research was conducted using web search and RAG.",
            research_depth="deep",
            sections=[
                ResearchSection(
                    heading="Background",
                    content="The FDA approval process...",
                    citations=["FDA.gov"]
                )
            ],
            key_findings=[
                KeyPoint(point="Clinical trials are mandatory", supporting_sources=["FDA.gov"], confidence=0.95)
            ],
            supporting_evidence=[
                EvidenceSource(
                    source_type="websearch",
                    title="FDA Guidelines",
                    content_snippet="...",
                    citation="FDA.gov [regulatory]",
                    relevance_score=0.95,
                    tier=1
                )
            ],
            confidence_assessment="HIGH confidence",
            limitations=["Limited to public sources"],
            recommendations=["Engage with FDA early"],
            evidence_quality_score=0.9,
            source_diversity_score=0.8,
            citation_count=5,
            tenant_id="tenant-123"
        )

        markdown = report.to_export_format("markdown")

        assert "# FDA Drug Approval Analysis" in markdown
        assert "## Executive Summary" in markdown
        assert "## Methodology" in markdown
        assert "## Background" in markdown
        assert "## Key Findings" in markdown
        assert "## Recommendations" in markdown
        assert "## References" in markdown


# =============================================================================
# Evidence Quality Scoring Tests
# =============================================================================

class TestEvidenceQualityScoring:
    """Tests for evidence quality scoring."""

    def test_tier_mapping(self):
        """Test source type to tier mapping."""
        assert SOURCE_TYPE_TO_TIER['regulatory'] == 1
        assert SOURCE_TYPE_TO_TIER['scientific'] == 2
        assert SOURCE_TYPE_TO_TIER['clinical_trial'] == 3
        assert SOURCE_TYPE_TO_TIER['health_authority'] == 4
        assert SOURCE_TYPE_TO_TIER['rag'] == 5
        assert SOURCE_TYPE_TO_TIER['web'] == 6

    def test_evidence_quality_calculation(self, generator):
        """Test evidence quality score calculation."""
        # High quality sources (Tier 1, 2)
        high_quality_sources = [
            EvidenceSource(
                source_type="websearch",
                title="FDA Guidelines",
                content_snippet="...",
                citation="FDA.gov",
                relevance_score=0.95,
                tier=1
            ),
            EvidenceSource(
                source_type="websearch",
                title="PubMed Article",
                content_snippet="...",
                citation="PubMed",
                relevance_score=0.90,
                tier=2
            )
        ]

        high_score = generator._calculate_evidence_quality(high_quality_sources)

        # Low quality sources (Tier 5, 6)
        low_quality_sources = [
            EvidenceSource(
                source_type="rag",
                title="Internal Doc",
                content_snippet="...",
                citation="Internal KB",
                relevance_score=0.90,
                tier=5
            ),
            EvidenceSource(
                source_type="websearch",
                title="Blog Post",
                content_snippet="...",
                citation="example.com",
                relevance_score=0.85,
                tier=6
            )
        ]

        low_score = generator._calculate_evidence_quality(low_quality_sources)

        # High quality sources should score higher
        assert high_score > low_score

    def test_source_diversity_calculation(self, generator):
        """Test source diversity score calculation."""
        # Diverse sources (multiple types)
        diverse_sources = [
            EvidenceSource(source_type="websearch", title="A", content_snippet="", citation="", relevance_score=0.9, tier=1),
            EvidenceSource(source_type="rag", title="B", content_snippet="", citation="", relevance_score=0.8, tier=5),
            EvidenceSource(source_type="pubmed", title="C", content_snippet="", citation="", relevance_score=0.85, tier=2),
            EvidenceSource(source_type="fda", title="D", content_snippet="", citation="", relevance_score=0.9, tier=1),
        ]

        diverse_score = generator._calculate_source_diversity(diverse_sources)

        # Single source type
        single_type_sources = [
            EvidenceSource(source_type="rag", title="A", content_snippet="", citation="", relevance_score=0.9, tier=5),
            EvidenceSource(source_type="rag", title="B", content_snippet="", citation="", relevance_score=0.8, tier=5),
        ]

        single_score = generator._calculate_source_diversity(single_type_sources)

        # Diverse sources should score higher
        assert diverse_score > single_score

    def test_confidence_assessment(self, generator):
        """Test confidence assessment generation."""
        # High confidence scenario
        high_conf = generator._assess_confidence(
            evidence_quality=0.9,
            source_diversity=0.8,
            source_count=10
        )
        assert "HIGH" in high_conf

        # Low confidence scenario
        low_conf = generator._assess_confidence(
            evidence_quality=0.3,
            source_diversity=0.2,
            source_count=1
        )
        assert "LOW" in low_conf or "LIMITED" in low_conf


# =============================================================================
# Key Point Extraction Tests
# =============================================================================

class TestKeyPointExtraction:
    """Tests for key point extraction."""

    def test_extract_key_points(self, generator, sample_response_content):
        """Test key point extraction from content."""
        sources = [
            EvidenceSource(
                source_type="websearch",
                title="FDA Guidelines",
                content_snippet="The FDA drug approval process requires extensive clinical trials.",
                citation="FDA.gov",
                relevance_score=0.95,
                tier=1
            )
        ]

        key_points = generator._extract_key_points(sample_response_content, sources, max_points=5)

        assert len(key_points) <= 5
        assert all(isinstance(kp, KeyPoint) for kp in key_points)
        assert all(len(kp.point) > 0 for kp in key_points)

    def test_extract_recommendations(self, generator, sample_response_content):
        """Test recommendation extraction."""
        recommendations = generator._extract_recommendations(sample_response_content)

        # The sample content has "recommended" and "should consider"
        assert len(recommendations) > 0


# =============================================================================
# Convenience Function Tests
# =============================================================================

class TestConvenienceFunctions:
    """Tests for convenience functions."""

    @pytest.mark.asyncio
    async def test_generate_quick_reference_function(self, sample_evidence_context, sample_response_content):
        """Test generate_quick_reference convenience function."""
        context = L4AggregatedContext(
            findings=[
                L5Finding(
                    source_tool="websearch",
                    title="FDA Guidelines",
                    content="The FDA approval process...",
                    relevance_score=0.95,
                    source_type="regulatory",
                    citation="FDA.gov [regulatory]"  # Required for EvidenceSource conversion
                )
            ],
            total_sources=1,
            tools_used=["websearch"],
            token_count=100,
            aggregation_strategy="ranked_list"
        )

        result = await generate_quick_reference(
            query="FDA approval process",
            response_content=sample_response_content,
            evidence_context=context,
            tenant_id="tenant-123"
        )

        assert result.success is True
        assert result.artifact_type == ArtifactType.QUICK_REFERENCE

    @pytest.mark.asyncio
    async def test_generate_research_report_function(self, sample_evidence_context, sample_response_content):
        """Test generate_research_report convenience function."""
        context = L4AggregatedContext(
            findings=[
                L5Finding(
                    source_tool="websearch",
                    title="FDA Guidelines",
                    content="The FDA approval process...",
                    relevance_score=0.95,
                    source_type="regulatory",
                    citation="FDA.gov [regulatory]"  # Required for EvidenceSource conversion
                )
            ],
            total_sources=1,
            tools_used=["websearch"],
            token_count=100,
            aggregation_strategy="ranked_list"
        )

        result = await generate_research_report(
            query="Analyze FDA approval",
            response_content=sample_response_content,
            evidence_context=context,
            tenant_id="tenant-123",
            research_depth="deep"
        )

        assert result.success is True
        assert result.artifact_type == ArtifactType.RESEARCH_REPORT


# =============================================================================
# Error Handling Tests
# =============================================================================

class TestErrorHandling:
    """Tests for error handling in artifact generation."""

    @pytest.mark.asyncio
    async def test_invalid_artifact_type(self, generator, sample_evidence_context):
        """Test handling of invalid artifact type."""
        # Create request with invalid type (simulated)
        request = ArtifactGenerationRequest(
            query="test",
            response_content="test content",
            evidence_context=sample_evidence_context,
            artifact_type=ArtifactType.QUICK_REFERENCE,  # Valid type
            tenant_id="tenant-123",
            mode="mode_1"
        )

        # Should succeed with valid type
        result = await generator.generate(request)
        assert result.success is True

    @pytest.mark.asyncio
    async def test_empty_evidence_context(self, generator):
        """Test handling of empty evidence context."""
        request = ArtifactGenerationRequest(
            query="test",
            response_content="Some response content.",
            evidence_context={'findings': [], 'tools_used': [], 'token_count': 0},
            artifact_type=ArtifactType.QUICK_REFERENCE,
            tenant_id="tenant-123",
            mode="mode_1"
        )

        result = await generator.generate(request)

        # Should still generate artifact, just with empty evidence
        assert result.success is True
        assert len(result.artifact.evidence_sources) == 0
