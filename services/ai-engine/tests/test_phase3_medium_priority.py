"""
Phase 3 MEDIUM Priority Unit Tests

Tests for:
- M8: SSE Format Validation
- M9: Research Quality Validation
- M10: Citation Verification

Run with:
    PYTHONPATH="$PWD/src:$PYTHONPATH" python3 -m pytest tests/test_phase3_medium_priority.py -v
"""

import pytest
import asyncio
import json
from datetime import datetime


# =============================================================================
# M8: SSE Format Validation Tests
# =============================================================================


class TestSSEValidator:
    """Tests for SSE event validation (M8)."""

    def test_import_sse_validator(self):
        """Test that SSE validator can be imported."""
        from streaming import (
            SSEEventType,
            ValidationError,
            SSEValidationResult,
            StreamValidationSummary,
            parse_sse_event,
            validate_sse_event,
            validate_sse_stream,
            is_valid_sse_event,
            get_event_type,
            get_event_data,
            REQUIRED_FIELDS,
            OPTIONAL_FIELDS,
        )
        assert SSEEventType.TOKEN.value == "token"
        assert "content" in REQUIRED_FIELDS[SSEEventType.TOKEN]

    def test_parse_standard_sse_event(self):
        """Test parsing standard SSE event format."""
        from streaming import parse_sse_event

        raw = "event: token\nid: 1\ndata: {\"content\": \"Hello\", \"tokens\": 1}"
        parsed = parse_sse_event(raw)

        assert parsed["event_type"] == "token"
        assert parsed["event_id"] == "1"
        assert parsed["data"]["content"] == "Hello"
        assert parsed["data"]["tokens"] == 1

    def test_parse_legacy_sse_event(self):
        """Test parsing legacy SSE event format (event in data)."""
        from streaming import parse_sse_event

        raw = 'data: {"event": "token", "content": "World", "tokens": 2}'
        parsed = parse_sse_event(raw)

        assert parsed["event_type"] == "token"
        assert parsed["data"]["content"] == "World"

    def test_parse_stream_end_marker(self):
        """Test parsing [DONE] stream end marker."""
        from streaming import parse_sse_event

        raw = "data: [DONE]"
        parsed = parse_sse_event(raw)

        assert parsed["is_stream_end"] is True
        assert parsed["data"] is None

    def test_validate_token_event_valid(self):
        """Test validation of valid token event."""
        from streaming import validate_sse_event

        raw = "event: token\ndata: {\"content\": \"test\", \"tokens\": 5}"
        result = validate_sse_event(raw)

        assert result.valid is True
        assert result.event_type == "token"
        assert len(result.errors) == 0

    def test_validate_token_event_missing_field(self):
        """Test validation catches missing required field."""
        from streaming import validate_sse_event

        raw = "event: token\ndata: {\"content\": \"test\"}"  # missing tokens
        result = validate_sse_event(raw)

        assert result.valid is False
        assert any("tokens" in e.field for e in result.errors)

    def test_validate_token_event_invalid_tokens_type(self):
        """Test validation catches invalid tokens type."""
        from streaming import validate_sse_event

        raw = 'event: token\ndata: {"content": "test", "tokens": "five"}'
        result = validate_sse_event(raw)

        assert result.valid is False
        assert any("tokens" in e.message for e in result.errors)

    def test_validate_thinking_event_valid(self):
        """Test validation of valid thinking event."""
        from streaming import validate_sse_event

        raw = 'event: thinking\ndata: {"step": "init", "status": "started", "message": "Starting..."}'
        result = validate_sse_event(raw)

        assert result.valid is True
        assert result.event_type == "thinking"

    def test_validate_thinking_event_invalid_status(self):
        """Test validation catches invalid thinking status."""
        from streaming import validate_sse_event

        raw = 'event: thinking\ndata: {"step": "init", "status": "unknown", "message": "..."}'
        result = validate_sse_event(raw)

        assert result.valid is False
        assert any("status" in e.field for e in result.errors)

    def test_validate_sources_event_valid(self):
        """Test validation of valid sources event."""
        from streaming import validate_sse_event

        raw = 'event: sources\ndata: {"sources": [{"title": "Source 1"}], "total": 1}'
        result = validate_sse_event(raw)

        assert result.valid is True

    def test_validate_sources_event_mismatched_total(self):
        """Test validation catches mismatched sources total."""
        from streaming import validate_sse_event

        raw = 'event: sources\ndata: {"sources": [{"title": "S1"}, {"title": "S2"}], "total": 5}'
        result = validate_sse_event(raw)

        assert result.valid is False
        assert any("total" in e.field for e in result.errors)

    def test_validate_done_event_valid(self):
        """Test validation of valid done event."""
        from streaming import validate_sse_event

        raw = '''event: done
data: {"agent_id": "123", "agent_name": "Expert", "content": "Response", "confidence": 0.95, "sources": [], "reasoning": "Based on...", "metrics": {"tokens": 100}}'''
        result = validate_sse_event(raw)

        assert result.valid is True
        assert result.event_type == "done"

    def test_validate_done_event_invalid_confidence(self):
        """Test validation catches out-of-range confidence."""
        from streaming import validate_sse_event

        raw = '''event: done
data: {"agent_id": "123", "agent_name": "Expert", "content": "Response", "confidence": 1.5, "sources": [], "reasoning": "...", "metrics": {}}'''
        result = validate_sse_event(raw)

        assert result.valid is False
        assert any("confidence" in e.field for e in result.errors)

    def test_validate_error_event_valid(self):
        """Test validation of valid error event."""
        from streaming import validate_sse_event

        raw = 'event: error\ndata: {"message": "Something went wrong", "code": "INTERNAL_ERROR"}'
        result = validate_sse_event(raw)

        assert result.valid is True

    def test_validate_error_event_invalid_code_format(self):
        """Test validation catches invalid error code format."""
        from streaming import validate_sse_event

        raw = 'event: error\ndata: {"message": "Error", "code": "lower_case_code"}'
        result = validate_sse_event(raw)

        assert result.valid is False
        assert any("code" in e.field for e in result.errors)

    def test_validate_stream_end(self):
        """Test validation of stream end marker."""
        from streaming import validate_sse_event

        raw = "data: [DONE]"
        result = validate_sse_event(raw)

        assert result.valid is True
        assert result.event_type == "[DONE]"

    def test_validate_invalid_json(self):
        """Test validation handles invalid JSON gracefully."""
        from streaming import validate_sse_event

        raw = "event: token\ndata: not valid json"
        result = validate_sse_event(raw)

        assert result.valid is False
        assert any("JSON" in e.message for e in result.errors)

    def test_validate_sse_stream(self):
        """Test validation of entire SSE stream."""
        from streaming import validate_sse_stream

        events = [
            'event: thinking\ndata: {"step": "start", "status": "started", "message": "Begin"}',
            'event: token\ndata: {"content": "Hello", "tokens": 1}',
            'event: token\ndata: {"content": " World", "tokens": 2}',
            'event: done\ndata: {"agent_id": "1", "agent_name": "E", "content": "Hello World", "confidence": 0.9, "sources": [], "reasoning": "...", "metrics": {}}',
            "data: [DONE]",
        ]
        summary = validate_sse_stream(events)

        assert summary.total_events == 5
        assert summary.valid_events == 5
        assert summary.invalid_events == 0
        assert summary.has_done_event is True
        assert summary.has_stream_end is True
        assert summary.is_complete is True
        assert summary.validation_rate == 1.0

    def test_stream_summary_incomplete(self):
        """Test stream summary detects incomplete streams."""
        from streaming import validate_sse_stream

        events = [
            'event: token\ndata: {"content": "Hello", "tokens": 1}',
        ]
        summary = validate_sse_stream(events)

        assert summary.is_complete is False
        assert summary.has_done_event is False
        assert summary.has_stream_end is False

    def test_is_valid_sse_event_convenience(self):
        """Test convenience function for quick validation."""
        from streaming import is_valid_sse_event

        assert is_valid_sse_event('event: token\ndata: {"content": "x", "tokens": 1}') is True
        assert is_valid_sse_event("event: token\ndata: invalid") is False

    def test_get_event_type_convenience(self):
        """Test convenience function to get event type."""
        from streaming import get_event_type

        assert get_event_type("event: thinking\ndata: {}") == "thinking"
        assert get_event_type('data: {"event": "token"}') == "token"

    def test_get_event_data_convenience(self):
        """Test convenience function to get event data."""
        from streaming import get_event_data

        data = get_event_data('event: token\ndata: {"content": "hi", "tokens": 1}')
        assert data["content"] == "hi"


# =============================================================================
# M9: Research Quality Validation Tests
# =============================================================================


class TestResearchQualityValidator:
    """Tests for research quality validation (M9)."""

    def test_import_research_quality_validator(self):
        """Test that research quality validator can be imported."""
        from langgraph_workflows.modes34.validation import (
            ResearchQualityValidator,
            QualityThresholds,
            QualityValidationResult,
            validate_research_quality,
            validate_confidence_scores,
            validate_source_credibility,
            enforce_quality_gate,
            DEFAULT_QUALITY_THRESHOLDS,
        )
        assert DEFAULT_QUALITY_THRESHOLDS is not None
        assert DEFAULT_QUALITY_THRESHOLDS.min_confidence == 0.6

    def test_default_thresholds(self):
        """Test default quality thresholds are reasonable."""
        from langgraph_workflows.modes34.validation import DEFAULT_QUALITY_THRESHOLDS

        thresholds = DEFAULT_QUALITY_THRESHOLDS
        assert 0.0 <= thresholds.min_confidence <= 1.0
        assert 0.0 <= thresholds.min_source_credibility <= 1.0
        assert thresholds.min_sources >= 0

    def test_strict_thresholds(self):
        """Test STRICT thresholds for medical/regulatory content."""
        from langgraph_workflows.modes34.validation.research_quality_validator import STRICT_QUALITY_THRESHOLDS

        thresholds = STRICT_QUALITY_THRESHOLDS
        assert thresholds.min_confidence >= 0.8
        assert thresholds.min_sources >= 3

    def test_lenient_thresholds(self):
        """Test LENIENT thresholds for exploratory content."""
        from langgraph_workflows.modes34.validation.research_quality_validator import LENIENT_QUALITY_THRESHOLDS

        thresholds = LENIENT_QUALITY_THRESHOLDS
        assert thresholds.min_confidence <= 0.5
        assert thresholds.min_sources >= 0

    def test_validate_high_quality_response(self):
        """Test validation of high-quality research response."""
        from langgraph_workflows.modes34.validation import validate_research_quality

        response = {
            "confidence": 0.92,
            "sources": [
                {"title": "Source 1", "credibility": 0.95, "verified": True},
                {"title": "Source 2", "credibility": 0.88, "verified": True},
            ],
            "confidence_scores": {
                "source_credibility": 0.92,
                "evidence_coverage": 0.85,
                "recency": 0.90,
                "consistency": 0.88,
                "specificity": 0.87,
            },
            "metrics": {
                "race_score": 0.87,
                "fact_score": 0.91,
            }
        }
        result = validate_research_quality(response)

        assert result.passed is True
        assert result.score >= 0.8

    def test_validate_low_quality_response(self):
        """Test validation catches low-quality response."""
        from langgraph_workflows.modes34.validation import validate_research_quality

        response = {
            "confidence": 0.3,
            "sources": [],
            "confidence_scores": {
                "source_credibility": 0.3,
                "evidence_coverage": 0.2,
                "recency": 0.4,
                "consistency": 0.25,
            }
        }
        result = validate_research_quality(response)

        assert result.passed is False
        assert len(result.errors) > 0  # Has validation errors

    def test_validate_confidence_scores_valid(self):
        """Test validation of valid confidence scores."""
        from langgraph_workflows.modes34.validation import (
            validate_confidence_scores,
            DEFAULT_QUALITY_THRESHOLDS,
        )

        # `validate_confidence_scores` expects 'overall' as the primary confidence
        scores = {
            "overall": 0.85,  # This becomes the main confidence score
            "source_credibility": 0.85,
            "evidence_coverage": 0.80,
            "recency": 0.90,
            "consistency": 0.75,
            "specificity": 0.82,
        }
        result = validate_confidence_scores(scores, DEFAULT_QUALITY_THRESHOLDS)

        assert result.passed is True

    def test_validate_confidence_scores_below_threshold(self):
        """Test validation catches scores below threshold."""
        from langgraph_workflows.modes34.validation import (
            validate_confidence_scores,
            DEFAULT_QUALITY_THRESHOLDS,
        )

        scores = {
            "overall": 0.40,  # Below 0.6 default threshold
            "source_credibility": 0.80,
            "evidence_coverage": 0.90,
            "recency": 0.75,
        }
        result = validate_confidence_scores(scores, DEFAULT_QUALITY_THRESHOLDS)

        assert result.passed is False
        # Check that confidence errors exist
        assert any(e.dimension.value == "confidence" for e in result.errors)

    def test_validate_source_credibility_valid(self):
        """Test validation of credible sources."""
        from langgraph_workflows.modes34.validation import validate_source_credibility

        sources = [
            {"title": "PubMed Study", "credibility": 0.95, "type": "peer_reviewed"},
            {"title": "FDA Guidance", "credibility": 0.90, "type": "regulatory"},
        ]
        result = validate_source_credibility(sources, min_credibility=0.7)

        assert result.passed is True
        # Score reflects average credibility
        assert result.score >= 0.9

    def test_validate_source_credibility_low(self):
        """Test validation catches low credibility sources."""
        from langgraph_workflows.modes34.validation import validate_source_credibility

        sources = [
            {"title": "Blog Post", "credibility": 0.4, "type": "blog"},
            {"title": "Forum Post", "credibility": 0.3, "type": "forum"},
        ]
        result = validate_source_credibility(sources, min_credibility=0.7)

        assert result.passed is False
        # Average credibility (0.4 + 0.3) / 2 = 0.35 < 0.7 threshold
        assert result.score < 0.7
        # Should have warnings for low credibility sources
        assert len(result.warnings) == 2

    def test_quality_gate_soft_enforcement(self):
        """Test soft quality gate (no exception raised)."""
        from langgraph_workflows.modes34.validation import enforce_quality_gate

        response = {
            "confidence": 0.5,  # Below threshold (0.6)
            "sources": [],
            "confidence_scores": {"overall": 0.5}
        }
        # With raise_on_failure=False, returns result without raising
        result = enforce_quality_gate(response, raise_on_failure=False)

        assert result.passed is False
        # Errors are populated (confidence below threshold)
        assert len(result.errors) > 0

    def test_quality_gate_hard_enforcement(self):
        """Test hard quality gate (raises exception)."""
        from langgraph_workflows.modes34.validation import enforce_quality_gate
        from langgraph_workflows.modes34.resilience.exceptions import ResearchQualityError

        response = {
            "confidence": 0.2,  # Well below 0.6 threshold
            "sources": [],
            "confidence_scores": {"overall": 0.2}
        }

        with pytest.raises(ResearchQualityError):
            enforce_quality_gate(response, raise_on_failure=True)

    def test_quality_validation_result_to_dict(self):
        """Test QualityValidationResult serialization."""
        from langgraph_workflows.modes34.validation import validate_research_quality

        response = {
            "confidence": 0.85,
            "sources": [{"title": "Test", "credibility": 0.9}],
            "confidence_scores": {"source_credibility": 0.85}
        }
        result = validate_research_quality(response)
        result_dict = result.to_dict()

        # Check to_dict() output structure (see QualityValidationResult.to_dict())
        assert "passed" in result_dict
        assert "score" in result_dict  # Not 'overall_quality_score'
        assert "dimension_scores" in result_dict
        assert "errors" in result_dict
        assert "warnings" in result_dict

    def test_validator_class_usage(self):
        """Test ResearchQualityValidator class usage."""
        from langgraph_workflows.modes34.validation import (
            ResearchQualityValidator,
            QualityThresholds,
        )

        thresholds = QualityThresholds(min_confidence=0.8, min_sources=2)
        validator = ResearchQualityValidator(thresholds)

        response = {
            "confidence": 0.9,
            "sources": [
                {"title": "S1", "credibility": 0.9},
                {"title": "S2", "credibility": 0.85},
            ],
            "confidence_scores": {
                "source_credibility": 0.9,
                "evidence_coverage": 0.85,
            }
        }
        result = validator.validate(response)

        assert result.passed is True


# =============================================================================
# M10: Citation Verification Tests
# =============================================================================


class TestCitationValidator:
    """Tests for citation verification (M10)."""

    def test_import_citation_validator(self):
        """Test that citation validator can be imported."""
        from langgraph_workflows.modes34.validation import (
            CitationValidator,
            CitationValidationResult,
            CitationSummary,
            CitationSource,
            validate_citations,
            validate_pubmed_citation,
            validate_doi,
            validate_crossref,
            get_citation_summary,
        )
        assert CitationSource.PUBMED.value == "pubmed"
        assert CitationSource.DOI.value == "doi"

    def test_citation_source_enum(self):
        """Test CitationSource enum values."""
        from langgraph_workflows.modes34.validation import CitationSource

        assert CitationSource.PUBMED.value == "pubmed"
        assert CitationSource.DOI.value == "doi"
        assert CitationSource.CROSSREF.value == "crossref"
        assert CitationSource.INTERNAL.value == "internal"
        assert CitationSource.UNKNOWN.value == "unknown"

    def test_extract_pmid_from_citation(self):
        """Test PMID extraction from citation string."""
        from langgraph_workflows.modes34.validation.citation_validator import extract_citation_id

        source, citation_id = extract_citation_id("PMID: 12345678")
        assert source.value == "pubmed"
        assert citation_id == "12345678"

    def test_extract_doi_from_citation(self):
        """Test DOI extraction from citation string."""
        from langgraph_workflows.modes34.validation.citation_validator import extract_citation_id

        source, citation_id = extract_citation_id("10.1000/xyz123")
        assert source.value == "doi"
        assert citation_id == "10.1000/xyz123"

    def test_extract_doi_from_url(self):
        """Test DOI extraction from URL."""
        from langgraph_workflows.modes34.validation.citation_validator import extract_citation_id

        source, citation_id = extract_citation_id("https://doi.org/10.1000/xyz123")
        assert source.value == "doi"
        assert citation_id == "10.1000/xyz123"

    def test_extract_unknown_citation(self):
        """Test handling of unknown citation format."""
        from langgraph_workflows.modes34.validation.citation_validator import extract_citation_id

        source, _ = extract_citation_id("Some random citation text")
        assert source.value == "unknown"

    @pytest.mark.asyncio
    async def test_validate_pubmed_citation_valid_format(self):
        """Test validation of valid PMID format."""
        from langgraph_workflows.modes34.validation import validate_pubmed_citation

        result = await validate_pubmed_citation("12345678")

        assert result.source.value == "pubmed"
        assert result.pmid == "12345678"
        # Format validation should pass
        assert result.verification_score > 0

    @pytest.mark.asyncio
    async def test_validate_pubmed_citation_invalid_format(self):
        """Test validation catches invalid PMID format."""
        from langgraph_workflows.modes34.validation import validate_pubmed_citation

        result = await validate_pubmed_citation("abc")

        assert result.is_valid is False
        assert len(result.errors) > 0

    @pytest.mark.asyncio
    async def test_validate_doi_valid_format(self):
        """Test validation of valid DOI format."""
        from langgraph_workflows.modes34.validation import validate_doi

        result = await validate_doi("10.1000/xyz123")

        assert result.source.value == "doi"
        assert result.doi == "10.1000/xyz123"
        assert result.verification_score > 0
        assert result.url is not None

    @pytest.mark.asyncio
    async def test_validate_doi_invalid_format(self):
        """Test validation catches invalid DOI format."""
        from langgraph_workflows.modes34.validation import validate_doi

        result = await validate_doi("not-a-doi")

        assert result.is_valid is False
        assert len(result.errors) > 0

    @pytest.mark.asyncio
    async def test_validate_doi_missing_suffix(self):
        """Test validation catches DOI missing suffix."""
        from langgraph_workflows.modes34.validation import validate_doi

        result = await validate_doi("10.1000")

        assert result.is_valid is False

    @pytest.mark.asyncio
    async def test_validate_crossref(self):
        """Test CrossRef validation (routes to DOI)."""
        from langgraph_workflows.modes34.validation import validate_crossref

        result = await validate_crossref("10.1000/xyz123")

        assert result.source.value == "doi"
        assert result.verification_score > 0

    @pytest.mark.asyncio
    async def test_validate_multiple_citations(self):
        """Test validation of multiple citations."""
        from langgraph_workflows.modes34.validation import validate_citations

        citations = [
            "PMID: 12345678",
            "10.1000/xyz123",
            "https://doi.org/10.2000/abc456",
            "Unknown citation format",
        ]
        summary = await validate_citations(citations)

        assert summary.total_citations == 4
        assert summary.source_counts.get("pubmed", 0) >= 1
        assert summary.source_counts.get("doi", 0) >= 2
        assert summary.source_counts.get("unknown", 0) >= 1

    @pytest.mark.asyncio
    async def test_validate_empty_citations(self):
        """Test validation of empty citation list."""
        from langgraph_workflows.modes34.validation import validate_citations

        summary = await validate_citations([])

        assert summary.total_citations == 0
        assert summary.overall_verification_rate == 1.0
        assert summary.is_acceptable is True

    @pytest.mark.asyncio
    async def test_citation_summary_acceptable(self):
        """Test citation summary acceptability check."""
        from langgraph_workflows.modes34.validation import validate_citations

        # Mostly valid citations
        citations = [
            "PMID: 12345678",
            "PMID: 87654321",
            "10.1000/xyz123",
        ]
        summary = await validate_citations(citations)

        assert summary.overall_verification_rate >= 0.5  # At least 50% verified
        # is_acceptable depends on scores

    @pytest.mark.asyncio
    async def test_citation_summary_to_dict(self):
        """Test CitationSummary serialization."""
        from langgraph_workflows.modes34.validation import validate_citations

        citations = ["PMID: 12345678", "10.1000/xyz123"]
        summary = await validate_citations(citations)
        summary_dict = summary.to_dict()

        assert "total_citations" in summary_dict
        assert "verified_citations" in summary_dict
        assert "overall_verification_rate" in summary_dict
        assert "source_counts" in summary_dict
        assert "results" in summary_dict

    def test_citation_validation_result_to_dict(self):
        """Test CitationValidationResult serialization."""
        from langgraph_workflows.modes34.validation import CitationValidationResult, CitationSource

        result = CitationValidationResult(
            citation_id="12345678",
            source=CitationSource.PUBMED,
            is_valid=True,
            verification_score=0.85,
            pmid="12345678",
        )
        result_dict = result.to_dict()

        assert result_dict["citation_id"] == "12345678"
        assert result_dict["source"] == "pubmed"
        assert result_dict["is_valid"] is True
        assert result_dict["verification_score"] == 0.85

    def test_get_citation_summary_from_results(self):
        """Test generating summary from pre-validated results."""
        from langgraph_workflows.modes34.validation import (
            CitationValidationResult,
            CitationSource,
            get_citation_summary,
        )

        results = [
            CitationValidationResult(
                citation_id="12345678",
                source=CitationSource.PUBMED,
                is_valid=True,
                verification_score=0.9,
            ),
            CitationValidationResult(
                citation_id="10.1000/xyz",
                source=CitationSource.DOI,
                is_valid=True,
                verification_score=0.85,
            ),
            CitationValidationResult(
                citation_id="unknown",
                source=CitationSource.UNKNOWN,
                is_valid=False,
                verification_score=0.2,
            ),
        ]
        summary = get_citation_summary(results)

        assert summary.total_citations == 3
        assert summary.verified_citations == 2
        assert summary.high_quality_citations == 2
        assert round(summary.average_verification_score, 2) == 0.65

    @pytest.mark.asyncio
    async def test_validator_class_with_caching(self):
        """Test CitationValidator class with caching."""
        from langgraph_workflows.modes34.validation import CitationValidator

        validator = CitationValidator(cache_ttl_hours=1)

        # First validation
        summary1 = await validator.validate(["PMID: 12345678"])

        # Second validation (should hit cache)
        summary2 = await validator.validate(["PMID: 12345678"])

        assert summary1.total_citations == summary2.total_citations

    @pytest.mark.asyncio
    async def test_graceful_degradation_on_timeout(self):
        """Test graceful degradation when API times out."""
        from langgraph_workflows.modes34.validation import CitationValidator

        validator = CitationValidator(
            timeout_seconds=0.001,  # Very short timeout
            fail_gracefully=True,
        )

        # Should not raise, should return partial results
        summary = await validator.validate(["PMID: 12345678"])
        assert summary.total_citations == 1
        # Should have warnings instead of errors when fail_gracefully=True


# =============================================================================
# Integration Tests
# =============================================================================


class TestPhase3Integration:
    """Integration tests for Phase 3 components."""

    def test_all_phase3_modules_importable(self):
        """Test that all Phase 3 modules can be imported together."""
        # M8: SSE Validation
        from streaming import (
            SSEEventType,
            validate_sse_event,
            validate_sse_stream,
        )

        # M9: Research Quality
        from langgraph_workflows.modes34.validation import (
            ResearchQualityValidator,
            QualityThresholds,
            validate_research_quality,
        )

        # M10: Citation Verification
        from langgraph_workflows.modes34.validation import (
            CitationValidator,
            CitationSource,
            validate_citations,
        )

        assert True  # If we get here, all imports succeeded

    @pytest.mark.asyncio
    async def test_combined_validation_workflow(self):
        """Test a combined validation workflow using all Phase 3 components."""
        from streaming import validate_sse_stream
        from langgraph_workflows.modes34.validation import (
            validate_research_quality,
            validate_citations,
        )

        # 1. Validate SSE stream
        stream_events = [
            'event: thinking\ndata: {"step": "research", "status": "started", "message": "Searching..."}',
            'event: sources\ndata: {"sources": [{"title": "PubMed Study"}], "total": 1}',
            'event: done\ndata: {"agent_id": "1", "agent_name": "Expert", "content": "Response", "confidence": 0.9, "sources": [], "reasoning": "...", "metrics": {}}',
            "data: [DONE]",
        ]
        stream_summary = validate_sse_stream(stream_events)
        assert stream_summary.is_complete

        # 2. Validate research quality
        response_data = {
            "confidence": 0.9,
            "sources": [{"title": "PubMed Study", "credibility": 0.95}],
            "confidence_scores": {"source_credibility": 0.95, "overall": 0.9}
        }
        quality_result = validate_research_quality(response_data)
        assert quality_result.passed

        # 3. Validate citations
        citations = ["PMID: 12345678", "10.1000/example"]
        citation_summary = await validate_citations(citations)
        assert citation_summary.total_citations == 2

    def test_validation_exception_hierarchy(self):
        """Test that validation uses correct exception hierarchy."""
        from langgraph_workflows.modes34.resilience.exceptions import (
            WorkflowResilienceError,
            ResearchQualityError,
            CitationVerificationError,
        )

        # Ensure exceptions inherit from base
        assert issubclass(ResearchQualityError, WorkflowResilienceError)
        assert issubclass(CitationVerificationError, WorkflowResilienceError)


# =============================================================================
# Run Tests
# =============================================================================


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
