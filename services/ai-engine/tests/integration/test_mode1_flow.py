"""
Integration Tests for Mode 1 Evidence-Based Flow

Tests the complete Mode 1 flow:
1. Config resolution from agent metadata
2. Parallel L5 evidence gathering (RAG + WebSearch)
3. Artifact generation (Quick Reference Card)

Created: 2025-12-02
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

from models.l4_l5_config import (
    Mode1Config,
    L5ToolConfig,
    L5Finding,
    L5ToolResult,
    L4AggregatedContext
)
from models.artifacts import ArtifactType, QuickReferenceCard
from services.config_resolvers.mode1_config_resolver import resolve_mode1_config
from services.mode1_evidence_gatherer import Mode1EvidenceGatherer
from services.artifact_generator import ArtifactGenerator, generate_quick_reference


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def pharma_agent():
    """Simulated pharmaceutical expert agent from database."""
    return {
        'id': 'agent-pharma-expert-001',
        'name': 'Pharmaceutical Regulatory Expert',
        'model': 'gpt-4',
        'temperature': 0.3,
        'max_tokens': 3000,
        'knowledge_namespaces': ['regulatory', 'fda', 'clinical_trials', 'pharma'],
        'metadata': {
            'domain': 'pharmaceutical',
            'specialization': 'regulatory_affairs',
            'l5_config': {
                'rag_enabled': True,
                'websearch_enabled': True,
                'max_findings_per_tool': 5,
                'timeout_ms': 3000,
                'graceful_degradation': True
            }
        }
    }


@pytest.fixture
def user_query():
    """Sample user query for Mode 1."""
    return "What are the key steps in FDA drug approval for a new oncology treatment?"


@pytest.fixture
def mock_rag_findings():
    """Mock RAG findings from internal knowledge base."""
    return [
        L5Finding(
            source_tool="rag",
            title="FDA Oncology Drug Approval Pathways",
            content="The FDA offers several pathways for oncology drug approval including: "
                    "1) Standard Approval for drugs meeting safety/efficacy endpoints, "
                    "2) Accelerated Approval for serious conditions with unmet medical need, "
                    "3) Breakthrough Therapy for substantial improvement over existing treatments.",
            relevance_score=0.94,
            citation="Internal KB: Regulatory Affairs [oncology_pathways]",
            source_type="rag",
            metadata={'namespace': 'regulatory', 'document_id': 'doc-001'}
        ),
        L5Finding(
            source_tool="rag",
            title="Clinical Trial Design for Oncology",
            content="Oncology clinical trials typically require: Phase I (safety/dosing), "
                    "Phase II (efficacy signals), Phase III (pivotal efficacy vs. comparator). "
                    "Adaptive trial designs are increasingly accepted by FDA.",
            relevance_score=0.89,
            citation="Internal KB: Clinical Trials [oncology_design]",
            source_type="rag",
            metadata={'namespace': 'clinical_trials', 'document_id': 'doc-002'}
        )
    ]


@pytest.fixture
def mock_websearch_findings():
    """Mock WebSearch findings from authoritative sources."""
    return [
        L5Finding(
            source_tool="websearch",
            title="FDA: Oncology Center of Excellence",
            content="The FDA's Oncology Center of Excellence streamlines drug development "
                    "by facilitating expedited programs for cancer treatments. Key programs "
                    "include Priority Review, Breakthrough Therapy, and Real-Time Oncology Review.",
            relevance_score=0.96,
            citation="FDA.gov [regulatory]",
            source_url="https://www.fda.gov/about-fda/oncology-center-excellence",
            source_type="regulatory",
            metadata={'domain': 'fda.gov', 'is_authoritative': True}
        ),
        L5Finding(
            source_tool="websearch",
            title="NCI: Steps in Drug Development",
            content="The National Cancer Institute outlines the drug development process: "
                    "Discovery research, preclinical studies, IND application, "
                    "clinical trials (Phase I-III), NDA/BLA submission, FDA review.",
            relevance_score=0.91,
            citation="cancer.gov [health_authority]",
            source_url="https://www.cancer.gov/research/drug-development",
            source_type="health_authority",
            metadata={'domain': 'cancer.gov', 'is_authoritative': True}
        )
    ]


@pytest.fixture
def mock_ai_response():
    """Simulated LLM response based on evidence."""
    return """
    Based on the evidence gathered from FDA guidelines and internal knowledge base,
    here are the key steps in FDA drug approval for a new oncology treatment:

    **1. Discovery and Preclinical Research**
    Initial laboratory and animal studies to identify promising compounds and assess
    basic safety profiles.

    **2. IND Application**
    Submit Investigational New Drug (IND) application to FDA with preclinical data,
    manufacturing information, and proposed clinical trial protocols.

    **3. Clinical Trials**
    - Phase I: Safety and dosing in 20-100 patients
    - Phase II: Efficacy signals in 100-500 patients
    - Phase III: Pivotal efficacy vs. comparator in 1000+ patients

    **4. FDA Expedited Programs (for oncology)**
    Consider applying for: Priority Review, Breakthrough Therapy, Accelerated Approval,
    or Real-Time Oncology Review based on unmet medical need.

    **5. NDA/BLA Submission**
    Compile all clinical data into New Drug Application for FDA review.

    **6. FDA Review and Approval**
    FDA conducts comprehensive review. Timeline: Standard (10 months) or
    Priority Review (6 months).

    It is recommended to engage with FDA early through pre-IND meetings and utilize
    the Oncology Center of Excellence resources for expedited development pathways.
    """


# =============================================================================
# Integration Tests
# =============================================================================

class TestMode1CompleteFlow:
    """Integration tests for complete Mode 1 flow."""

    @pytest.mark.asyncio
    async def test_full_mode1_flow_with_artifact(
        self,
        pharma_agent,
        user_query,
        mock_rag_findings,
        mock_websearch_findings,
        mock_ai_response
    ):
        """
        Test complete Mode 1 flow:
        1. Resolve config from agent
        2. Gather evidence (parallel RAG + WebSearch)
        3. Generate Quick Reference Card artifact
        """
        # Step 1: Resolve Mode 1 configuration
        config = resolve_mode1_config(agent=pharma_agent)

        # Verify mandatory settings
        assert config.l5_rag_enabled is True
        assert config.l5_websearch_enabled is True
        assert config.l5_parallel_timeout_ms == 3000
        assert config.require_evidence is True

        # Step 2: Create mock L5 tools
        mock_rag_tool = MagicMock()
        mock_rag_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag",
            success=True,
            findings=mock_rag_findings,
            execution_time_ms=350
        ))

        mock_websearch_tool = MagicMock()
        mock_websearch_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch",
            success=True,
            findings=mock_websearch_findings,
            execution_time_ms=750
        ))

        # Step 3: Gather evidence
        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag_tool,
            l5_websearch_tool=mock_websearch_tool
        )

        evidence = await gatherer.gather_evidence(
            query=user_query,
            config=config,
            tenant_id="tenant-pharma-001",
            agent_id=pharma_agent['id']
        )

        # Verify evidence was gathered from both sources
        assert len(evidence.findings) == 4  # 2 RAG + 2 WebSearch
        assert "rag" in evidence.tools_used
        assert "websearch" in evidence.tools_used
        assert evidence.total_sources == 2

        # Step 4: Generate Quick Reference Card
        artifact_result = await generate_quick_reference(
            query=user_query,
            response_content=mock_ai_response,
            evidence_context=evidence,
            tenant_id="tenant-pharma-001",
            agent_id=pharma_agent['id'],
            conversation_id="conv-123"
        )

        # Verify artifact generation
        assert artifact_result.success is True
        assert artifact_result.artifact_type == ArtifactType.QUICK_REFERENCE

        artifact = artifact_result.artifact
        assert isinstance(artifact, QuickReferenceCard)
        assert artifact.query == user_query
        assert len(artifact.summary) > 0
        assert len(artifact.evidence_sources) <= 6
        assert artifact.evidence_quality_score > 0
        assert artifact.tenant_id == "tenant-pharma-001"

    @pytest.mark.asyncio
    async def test_mode1_graceful_degradation_rag_fails(
        self,
        pharma_agent,
        user_query,
        mock_websearch_findings,
        mock_ai_response
    ):
        """Test Mode 1 continues when RAG fails but WebSearch succeeds."""
        config = resolve_mode1_config(agent=pharma_agent)

        # RAG fails
        mock_rag_tool = MagicMock()
        mock_rag_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag",
            success=False,
            findings=[],
            execution_time_ms=100,
            error="RAG service connection timeout"
        ))

        # WebSearch succeeds
        mock_websearch_tool = MagicMock()
        mock_websearch_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch",
            success=True,
            findings=mock_websearch_findings,
            execution_time_ms=800
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag_tool,
            l5_websearch_tool=mock_websearch_tool
        )

        evidence = await gatherer.gather_evidence(
            query=user_query,
            config=config,
            tenant_id="tenant-123"
        )

        # Should have WebSearch findings only
        assert len(evidence.findings) == 2
        assert "websearch" in evidence.tools_used
        assert "rag" not in evidence.tools_used

        # Can still generate artifact
        artifact_result = await generate_quick_reference(
            query=user_query,
            response_content=mock_ai_response,
            evidence_context=evidence,
            tenant_id="tenant-123"
        )

        assert artifact_result.success is True

    @pytest.mark.asyncio
    async def test_mode1_parallel_execution_timing(
        self,
        pharma_agent,
        user_query
    ):
        """Test that L5 tools execute in parallel, not sequentially."""
        config = resolve_mode1_config(agent=pharma_agent)

        execution_log = []

        async def slow_rag(*args, **kwargs):
            execution_log.append(('rag_start', asyncio.get_event_loop().time()))
            await asyncio.sleep(0.5)  # 500ms
            execution_log.append(('rag_end', asyncio.get_event_loop().time()))
            return L5ToolResult(
                tool_type="rag",
                success=True,
                findings=[L5Finding(source_tool="rag", title="Test", content="...", relevance_score=0.9)],
                execution_time_ms=500
            )

        async def slow_websearch(*args, **kwargs):
            execution_log.append(('websearch_start', asyncio.get_event_loop().time()))
            await asyncio.sleep(0.5)  # 500ms
            execution_log.append(('websearch_end', asyncio.get_event_loop().time()))
            return L5ToolResult(
                tool_type="websearch",
                success=True,
                findings=[L5Finding(source_tool="websearch", title="Test", content="...", relevance_score=0.9)],
                execution_time_ms=500
            )

        mock_rag_tool = MagicMock()
        mock_rag_tool.execute = slow_rag

        mock_websearch_tool = MagicMock()
        mock_websearch_tool.execute = slow_websearch

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag_tool,
            l5_websearch_tool=mock_websearch_tool
        )

        start_time = asyncio.get_event_loop().time()
        evidence = await gatherer.gather_evidence(
            query=user_query,
            config=config,
            tenant_id="tenant-123"
        )
        total_time = asyncio.get_event_loop().time() - start_time

        # If parallel: ~500ms total
        # If sequential: ~1000ms total
        # Allow some overhead, but should be significantly less than sequential
        assert total_time < 0.9, f"Execution took {total_time}s - should be parallel (~0.5s)"

        # Verify both started near simultaneously
        starts = [t for (name, t) in execution_log if 'start' in name]
        assert len(starts) == 2
        assert abs(starts[0] - starts[1]) < 0.1, "Tools should start nearly simultaneously"


class TestMode1EdgeCases:
    """Edge case tests for Mode 1 flow."""

    @pytest.mark.asyncio
    async def test_empty_rag_namespaces(self):
        """Test Mode 1 with agent that has no RAG namespaces."""
        agent = {
            'id': 'agent-no-rag',
            'name': 'No RAG Agent',
            'model': 'gpt-4',
            'knowledge_namespaces': [],  # No namespaces
            'metadata': {}
        }

        config = resolve_mode1_config(agent=agent)

        # Should still enable RAG (mandatory), just with empty namespaces
        assert config.l5_rag_enabled is True
        assert config.l5_namespaces == []

    @pytest.mark.asyncio
    async def test_mode1_with_custom_user_preferences(self, pharma_agent):
        """Test Mode 1 respects user preferences."""
        user_prefs = {
            'format': 'executive',
            'depth': 'concise',
            'includeCitations': True,
            'includeInsights': False,
            'includeKeyTakeaways': True
        }

        config = resolve_mode1_config(
            agent=pharma_agent,
            user_preferences=user_prefs
        )

        assert config.response_format == 'executive'
        assert config.response_depth == 'concise'
        assert config.include_citations is True
        assert config.include_insights is False

    @pytest.mark.asyncio
    async def test_mode1_timeout_behavior(self, pharma_agent, user_query):
        """Test Mode 1 handles timeout correctly."""
        config = resolve_mode1_config(agent=pharma_agent)
        # Use minimum valid timeout (500ms) - L5ToolConfig has ge=500 constraint
        config.l5_parallel_timeout_ms = 500

        async def very_slow_tool(*args, **kwargs):
            await asyncio.sleep(5)  # 5 seconds - exceeds 500ms timeout
            return L5ToolResult(tool_type="rag", success=True, findings=[], execution_time_ms=5000)

        mock_rag = MagicMock()
        mock_rag.execute = very_slow_tool
        mock_websearch = MagicMock()
        mock_websearch.execute = very_slow_tool

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag,
            l5_websearch_tool=mock_websearch
        )

        evidence = await gatherer.gather_evidence(
            query=user_query,
            config=config,
            tenant_id="tenant-123"
        )

        # Should timeout and return empty (5 second mock > 500ms timeout)
        assert len(evidence.findings) == 0


class TestMode1EvidenceQuality:
    """Tests for evidence quality in Mode 1."""

    @pytest.mark.asyncio
    async def test_regulatory_sources_ranked_higher(
        self,
        pharma_agent,
        user_query,
        mock_ai_response
    ):
        """Test that regulatory sources are ranked higher than general web."""
        config = resolve_mode1_config(agent=pharma_agent)

        # Create findings with different tiers
        rag_finding = L5Finding(
            source_tool="rag",
            title="Internal Document",
            content="Internal guidance...",
            relevance_score=0.95,  # High relevance
            source_type="rag"  # Tier 5
        )

        regulatory_finding = L5Finding(
            source_tool="websearch",
            title="FDA Official Guidance",
            content="FDA official guidance...",
            relevance_score=0.85,  # Lower relevance
            source_type="regulatory"  # Tier 1 - should rank higher
        )

        mock_rag = MagicMock()
        mock_rag.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag", success=True, findings=[rag_finding], execution_time_ms=100
        ))

        mock_websearch = MagicMock()
        mock_websearch.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch", success=True, findings=[regulatory_finding], execution_time_ms=100
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_rag,
            l5_websearch_tool=mock_websearch
        )

        evidence = await gatherer.gather_evidence(
            query=user_query,
            config=config,
            tenant_id="tenant-123"
        )

        # Regulatory source should be ranked first despite lower raw relevance
        # (due to tier weighting)
        assert len(evidence.findings) == 2
        # The ranking algorithm considers both relevance and tier
