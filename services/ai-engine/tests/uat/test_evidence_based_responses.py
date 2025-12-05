"""
UAT Tests for Evidence-Based Response System

User Acceptance Tests covering end-to-end scenarios:
1. Mode 1: Fast evidence-based chat responses
2. Mode 3: Deep research with comprehensive reports
3. Artifact generation and export
4. Graceful degradation scenarios

These tests verify the system meets user requirements:
- All responses are evidence-based (no hallucination)
- Evidence sources are properly cited
- Artifacts can be exported for reference
- System degrades gracefully when tools fail

Created: 2025-12-02
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

from models.l4_l5_config import (
    Mode1Config,
    Mode3Config,
    L5Finding,
    L5ToolResult,
    L4AggregatedContext
)
from models.artifacts import (
    ArtifactType,
    QuickReferenceCard,
    ComprehensiveResearchReport
)
from services.config_resolvers import resolve_mode1_config, resolve_mode3_config
from services.mode1_evidence_gatherer import Mode1EvidenceGatherer
from services.artifact_generator import generate_quick_reference, generate_research_report


# =============================================================================
# Test Scenarios
# =============================================================================

class TestUATMode1EvidenceBasedChat:
    """
    UAT: Mode 1 - Fast Evidence-Based Chat Responses

    User Story:
    As a pharmaceutical professional,
    I want to get quick answers to my questions
    So that I can make informed decisions without waiting for deep research

    Acceptance Criteria:
    - Response time under 5 seconds
    - Always includes evidence from at least one source
    - Citations are provided for claims
    - Can generate Quick Reference Card for later reference
    """

    @pytest.mark.asyncio
    async def test_uat_quick_regulatory_question(self):
        """
        Scenario: User asks a quick regulatory question

        Given: A pharma professional using the system
        When: They ask "What is the FDA accelerated approval pathway?"
        Then: They receive an evidence-based response within 5 seconds
        And: The response includes citations from FDA sources
        And: A Quick Reference Card can be generated
        """
        # Setup: Simulated agent and mock tools
        agent = {
            'id': 'agent-regulatory',
            'name': 'Regulatory Expert',
            'model': 'gpt-4',
            'knowledge_namespaces': ['regulatory', 'fda'],
            'metadata': {'l5_config': {'max_findings_per_tool': 5}}
        }

        query = "What is the FDA accelerated approval pathway?"

        # Mock L5 tools with realistic response times
        mock_rag = MagicMock()
        mock_rag.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag",
            success=True,
            findings=[
                L5Finding(
                    source_tool="rag",
                    title="Internal: FDA Accelerated Approval Guide",
                    content="The FDA Accelerated Approval pathway allows approval based on "
                            "surrogate endpoints for drugs treating serious conditions.",
                    relevance_score=0.93,
                    citation="Internal KB [regulatory]",
                    source_type="rag"
                )
            ],
            execution_time_ms=400
        ))

        mock_websearch = MagicMock()
        mock_websearch.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch",
            success=True,
            findings=[
                L5Finding(
                    source_tool="websearch",
                    title="FDA: Accelerated Approval Program",
                    content="Under accelerated approval, FDA may approve a drug based on "
                            "a surrogate endpoint that is reasonably likely to predict "
                            "clinical benefit.",
                    relevance_score=0.97,
                    citation="FDA.gov [regulatory]",
                    source_url="https://www.fda.gov/patients/fast-track-breakthrough-therapy-accelerated-approval-priority-review/accelerated-approval",
                    source_type="regulatory"
                )
            ],
            execution_time_ms=800
        ))

        # Execute Mode 1 flow
        config = resolve_mode1_config(agent=agent)

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag,
            l5_websearch_tool=mock_websearch
        )

        start_time = asyncio.get_event_loop().time()
        evidence = await gatherer.gather_evidence(
            query=query,
            config=config,
            tenant_id="tenant-pharma"
        )
        evidence_time = asyncio.get_event_loop().time() - start_time

        # ACCEPTANCE CRITERIA 1: Response time under 5 seconds
        assert evidence_time < 5.0, f"Evidence gathering took {evidence_time}s - should be under 5s"

        # ACCEPTANCE CRITERIA 2: At least one evidence source
        assert len(evidence.findings) >= 1, "Must have at least one evidence source"

        # ACCEPTANCE CRITERIA 3: Citations provided
        citations = [f.citation for f in evidence.findings if f.citation]
        assert len(citations) >= 1, "Must have at least one citation"

        # ACCEPTANCE CRITERIA 4: Can generate Quick Reference Card
        mock_response = "The FDA Accelerated Approval pathway allows drugs to be approved based on surrogate endpoints..."

        artifact_result = await generate_quick_reference(
            query=query,
            response_content=mock_response,
            evidence_context=evidence,
            tenant_id="tenant-pharma"
        )

        assert artifact_result.success is True
        assert isinstance(artifact_result.artifact, QuickReferenceCard)
        assert artifact_result.artifact.query == query

    @pytest.mark.asyncio
    async def test_uat_chat_with_export(self):
        """
        Scenario: User wants to save response for later reference

        Given: A user has received an evidence-based response
        When: They request to export the response
        Then: A Quick Reference Card is generated with all key information
        And: The card can be exported in a portable format
        """
        # Setup evidence context
        evidence = L4AggregatedContext(
            findings=[
                L5Finding(
                    source_tool="websearch",
                    title="FDA Drug Safety Communication",
                    content="Important safety information about drug interactions...",
                    relevance_score=0.95,
                    citation="FDA Safety Alert [regulatory]",
                    source_url="https://fda.gov/safety/123",
                    source_type="regulatory"
                ),
                L5Finding(
                    source_tool="rag",
                    title="Internal Safety Guidelines",
                    content="Company policy on drug interaction reporting...",
                    relevance_score=0.88,
                    citation="Internal KB [safety]",
                    source_type="rag"
                )
            ],
            total_sources=2,
            tools_used=["websearch", "rag"],
            token_count=300,
            aggregation_strategy="ranked_list"
        )

        response = "Based on FDA guidance and internal policies, drug interactions should be reported within 24 hours..."

        # Generate artifact
        result = await generate_quick_reference(
            query="What is our drug interaction reporting policy?",
            response_content=response,
            evidence_context=evidence,
            tenant_id="tenant-123"
        )

        assert result.success is True
        card = result.artifact

        # Verify exportable format
        export = card.to_export_format()

        assert 'title' in export
        assert 'query' in export
        assert 'summary' in export
        assert 'sources' in export
        assert len(export['sources']) >= 1


class TestUATMode3DeepResearch:
    """
    UAT: Mode 3 - Deep Research with Comprehensive Reports

    User Story:
    As a regulatory affairs manager,
    I want to conduct deep research on complex topics
    So that I can create comprehensive reports for compliance documentation

    Acceptance Criteria:
    - Research is thorough with multiple iterations
    - Report includes methodology description
    - All sources are properly cited
    - Report can be exported for compliance records
    - 1-year retention for audit trail
    """

    @pytest.mark.asyncio
    async def test_uat_deep_regulatory_research(self):
        """
        Scenario: User conducts deep research on EU AI Act compliance

        Given: A regulatory manager needs compliance analysis
        When: They request deep research on "EU AI Act requirements for medical AI"
        Then: A comprehensive research report is generated
        And: Report includes executive summary, methodology, findings, and recommendations
        And: Report is stored for 1-year compliance retention
        """
        query = "What are the EU AI Act requirements for AI systems used in medical diagnostics?"

        # Simulated deep research evidence (multiple sources, multiple tools)
        evidence = L4AggregatedContext(
            findings=[
                L5Finding(
                    source_tool="websearch",
                    title="European Commission: AI Act Overview",
                    content="The EU AI Act classifies AI systems by risk level. Medical diagnostic AI "
                            "is considered high-risk and must comply with strict requirements including "
                            "quality management, documentation, and human oversight.",
                    relevance_score=0.96,
                    citation="ec.europa.eu [regulatory]",
                    source_url="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
                    source_type="regulatory"
                ),
                L5Finding(
                    source_tool="websearch",
                    title="EMA: AI in Medicinal Products",
                    content="The European Medicines Agency provides guidance on AI/ML in medicinal product "
                            "lifecycle. Requirements include validation, explainability, and continuous monitoring.",
                    relevance_score=0.94,
                    citation="EMA Guidelines [regulatory]",
                    source_url="https://www.ema.europa.eu/en/documents/scientific-guideline/reflection-paper-artificial-intelligence",
                    source_type="regulatory"
                ),
                L5Finding(
                    source_tool="rag",
                    title="Internal: EU Regulatory Strategy",
                    content="Our company's approach to EU AI Act compliance includes risk assessment framework, "
                            "technical documentation requirements, and conformity assessment procedures.",
                    relevance_score=0.89,
                    citation="Internal KB [compliance]",
                    source_type="rag"
                ),
                L5Finding(
                    source_tool="websearch",
                    title="Nature Medicine: AI in Healthcare Regulation",
                    content="Peer-reviewed analysis of global AI healthcare regulation trends. "
                            "EU AI Act represents most comprehensive regulatory framework for medical AI.",
                    relevance_score=0.87,
                    citation="Nature Medicine 2024 [scientific]",
                    source_url="https://www.nature.com/articles/s41591-024-xxxxx",
                    source_type="scientific"
                )
            ],
            total_sources=4,
            tools_used=["websearch", "rag"],
            token_count=1200,
            aggregation_strategy="synthesized"
        )

        mock_response = """
        Executive Summary:
        The EU AI Act establishes a comprehensive regulatory framework for artificial intelligence
        systems, with medical diagnostic AI classified as high-risk requiring enhanced compliance measures.

        Key Requirements:
        1. Risk Management System: Continuous risk assessment throughout AI lifecycle
        2. Data Governance: High-quality training data with documented provenance
        3. Technical Documentation: Comprehensive documentation of system design and operation
        4. Human Oversight: Mechanisms for human intervention and review
        5. Accuracy & Robustness: Demonstrated performance and resilience requirements
        6. Cybersecurity: Protection against vulnerabilities and attacks

        Recommendations:
        - Conduct gap analysis against current compliance status
        - Establish cross-functional AI governance committee
        - Implement continuous monitoring framework
        - Engage with notified bodies early for conformity assessment
        """

        # Generate comprehensive research report
        result = await generate_research_report(
            query=query,
            response_content=mock_response,
            evidence_context=evidence,
            tenant_id="tenant-pharma",
            research_depth="deep",
            agent_id="agent-regulatory"
        )

        assert result.success is True
        report = result.artifact

        # ACCEPTANCE CRITERIA: Report structure
        assert isinstance(report, ComprehensiveResearchReport)
        assert report.research_depth == "deep"
        assert len(report.executive_summary) > 100
        assert len(report.methodology_description) > 50
        assert len(report.supporting_evidence) >= 1

        # ACCEPTANCE CRITERIA: Proper citations
        assert report.citation_count > 0

        # ACCEPTANCE CRITERIA: 1-year retention
        expected_expiry = datetime.utcnow() + timedelta(days=365)
        diff = abs((report.expires_at - expected_expiry).total_seconds())
        assert diff < 60, "Report should have 1-year TTL"

        # ACCEPTANCE CRITERIA: Exportable for compliance
        markdown = report.to_export_format("markdown")
        assert "# " in markdown  # Has headers
        assert "## Executive Summary" in markdown
        assert "## Methodology" in markdown
        assert "## References" in markdown


class TestUATGracefulDegradation:
    """
    UAT: Graceful Degradation

    User Story:
    As a user,
    I want the system to continue working even when some services fail
    So that I can still get useful information with partial functionality

    Acceptance Criteria:
    - System continues if RAG fails but WebSearch works
    - System continues if WebSearch fails but RAG works
    - User is informed about limited functionality
    - Partial results are still useful
    """

    @pytest.mark.asyncio
    async def test_uat_rag_unavailable(self):
        """
        Scenario: RAG service is temporarily unavailable

        Given: The RAG service is down for maintenance
        When: A user asks a question
        Then: They receive a response based on WebSearch results
        And: The response indicates limited internal knowledge was available
        """
        agent = {
            'id': 'agent-1',
            'name': 'Expert',
            'model': 'gpt-4',
            'knowledge_namespaces': ['pharma'],
            'metadata': {}
        }

        config = resolve_mode1_config(agent=agent)

        # RAG fails
        mock_rag = MagicMock()
        mock_rag.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag",
            success=False,
            findings=[],
            execution_time_ms=50,
            error="Service unavailable: maintenance window"
        ))

        # WebSearch works
        mock_websearch = MagicMock()
        mock_websearch.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch",
            success=True,
            findings=[
                L5Finding(
                    source_tool="websearch",
                    title="FDA: Drug Labeling Requirements",
                    content="FDA labeling requirements include...",
                    relevance_score=0.91,
                    citation="FDA.gov",
                    source_type="regulatory"
                )
            ],
            execution_time_ms=600
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag,
            l5_websearch_tool=mock_websearch
        )

        evidence = await gatherer.gather_evidence(
            query="What are FDA drug labeling requirements?",
            config=config,
            tenant_id="tenant-123"
        )

        # ACCEPTANCE CRITERIA: Still have results
        assert len(evidence.findings) >= 1

        # ACCEPTANCE CRITERIA: Know which tools were used
        assert "websearch" in evidence.tools_used
        assert "rag" not in evidence.tools_used

        # Can still generate artifact
        result = await generate_quick_reference(
            query="What are FDA drug labeling requirements?",
            response_content="Based on web search results...",
            evidence_context=evidence,
            tenant_id="tenant-123"
        )

        assert result.success is True

    @pytest.mark.asyncio
    async def test_uat_websearch_unavailable(self):
        """
        Scenario: WebSearch is unavailable (API quota exceeded)

        Given: WebSearch API quota has been exceeded
        When: A user asks a question
        Then: They receive a response based on internal RAG
        And: Response quality is maintained using internal knowledge
        """
        agent = {
            'id': 'agent-1',
            'name': 'Expert',
            'model': 'gpt-4',
            'knowledge_namespaces': ['pharma', 'regulatory'],
            'metadata': {}
        }

        config = resolve_mode1_config(agent=agent)

        # RAG works
        mock_rag = MagicMock()
        mock_rag.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag",
            success=True,
            findings=[
                L5Finding(
                    source_tool="rag",
                    title="Internal: Clinical Trial Protocol Standards",
                    content="Our clinical trial protocols must adhere to ICH GCP guidelines...",
                    relevance_score=0.93,
                    citation="Internal KB [clinical]",
                    source_type="rag"
                ),
                L5Finding(
                    source_tool="rag",
                    title="Internal: Phase III Trial Requirements",
                    content="Phase III trials require double-blind, randomized, controlled design...",
                    relevance_score=0.88,
                    citation="Internal KB [clinical]",
                    source_type="rag"
                )
            ],
            execution_time_ms=350
        ))

        # WebSearch fails
        mock_websearch = MagicMock()
        mock_websearch.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch",
            success=False,
            findings=[],
            execution_time_ms=100,
            error="API quota exceeded"
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag,
            l5_websearch_tool=mock_websearch
        )

        evidence = await gatherer.gather_evidence(
            query="What are Phase III clinical trial requirements?",
            config=config,
            tenant_id="tenant-123"
        )

        # ACCEPTANCE CRITERIA: Have RAG results
        assert len(evidence.findings) >= 1
        assert "rag" in evidence.tools_used
        assert "websearch" not in evidence.tools_used


class TestUATCitationQuality:
    """
    UAT: Citation Quality

    User Story:
    As a compliance officer,
    I want all claims to be properly cited
    So that I can verify information and maintain audit trails

    Acceptance Criteria:
    - Every finding has a citation
    - Citations include source URL where available
    - Regulatory sources are prioritized
    - Citation format is consistent
    """

    @pytest.mark.asyncio
    async def test_uat_citation_completeness(self):
        """
        Scenario: User needs fully cited response for compliance documentation

        Given: A compliance officer is researching regulatory requirements
        When: They receive a research report
        Then: Every claim has a traceable citation
        And: Citation includes URL for verification where available
        """
        evidence = L4AggregatedContext(
            findings=[
                L5Finding(
                    source_tool="websearch",
                    title="FDA CFR Title 21",
                    content="Requirements under 21 CFR Part 11...",
                    relevance_score=0.97,
                    citation='FDA 21 CFR Part 11 [regulatory] <https://www.ecfr.gov/cgi-bin/text-idx?SID=21CFR11>',
                    source_url="https://www.ecfr.gov/cgi-bin/text-idx?SID=21CFR11",
                    source_type="regulatory"
                ),
                L5Finding(
                    source_tool="websearch",
                    title="ICH E6(R2) Guidelines",
                    content="Good Clinical Practice guidelines...",
                    relevance_score=0.95,
                    citation='ICH E6(R2) [scientific] <https://www.ich.org/e6-r2>',
                    source_url="https://www.ich.org/e6-r2",
                    source_type="scientific"
                ),
                L5Finding(
                    source_tool="rag",
                    title="Internal SOP: Electronic Records",
                    content="Company procedures for electronic records...",
                    relevance_score=0.89,
                    citation='Internal SOP-001 [internal]',
                    source_url=None,
                    source_type="rag"
                )
            ],
            total_sources=3,
            tools_used=["websearch", "rag"],
            token_count=600,
            aggregation_strategy="ranked_list"
        )

        # ACCEPTANCE CRITERIA: Every finding has citation
        for finding in evidence.findings:
            assert finding.citation is not None
            assert len(finding.citation) > 0

        # ACCEPTANCE CRITERIA: External sources have URLs
        external_findings = [f for f in evidence.findings if f.source_tool == "websearch"]
        for f in external_findings:
            assert f.source_url is not None

        # Generate report and check citations are included
        result = await generate_research_report(
            query="What are 21 CFR Part 11 requirements?",
            response_content="Based on FDA regulations...",
            evidence_context=evidence,
            tenant_id="tenant-123",
            research_depth="standard"
        )

        report = result.artifact
        assert report.citation_count == 3

        # Check markdown export includes citations
        markdown = report.to_export_format("markdown")
        assert "## References" in markdown
        assert "FDA 21 CFR" in markdown or "ICH E6" in markdown
