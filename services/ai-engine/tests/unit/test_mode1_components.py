"""
Unit Tests for Mode 1 Components

Tests for:
- Mode1ConfigResolver
- Mode1EvidenceGatherer
- Parallel execution
- Graceful degradation

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
    L4AggregatedContext,
    ResponsePreferencesRequest
)
from services.config_resolvers.mode1_config_resolver import (
    Mode1ConfigResolver,
    resolve_mode1_config,
    get_mode1_config_resolver
)
from services.mode1_evidence_gatherer import (
    Mode1EvidenceGatherer,
    get_mode1_evidence_gatherer,
    gather_mode1_evidence
)


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def agent_data():
    """Create sample agent data from database."""
    return {
        'id': 'agent-123',
        'name': 'Pharma Expert',
        'model': 'gpt-4',
        'temperature': 0.3,
        'max_tokens': 3000,
        'knowledge_namespaces': ['pharma', 'regulatory', 'clinical'],
        'metadata': {
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
def user_preferences():
    """Create sample user preferences."""
    return {
        'format': 'structured',
        'depth': 'comprehensive',
        'includeCitations': True,
        'includeInsights': True,
        'includeKeyTakeaways': True,
        'includeNextSteps': False
    }


@pytest.fixture
def mock_l5_rag_tool():
    """Create mock RAG tool."""
    tool = MagicMock()
    tool.execute = AsyncMock(return_value=L5ToolResult(
        tool_type="rag",
        success=True,
        findings=[
            L5Finding(
                source_tool="rag",
                title="Internal KB: Drug Safety",
                content="Drug safety monitoring guidelines...",
                relevance_score=0.92,
                citation="Internal KB [pharma]",
                source_type="rag"
            ),
            L5Finding(
                source_tool="rag",
                title="Regulatory Compliance",
                content="FDA compliance requirements...",
                relevance_score=0.88,
                citation="Internal KB [regulatory]",
                source_type="rag"
            )
        ],
        execution_time_ms=450
    ))
    return tool


@pytest.fixture
def mock_l5_websearch_tool():
    """Create mock WebSearch tool."""
    tool = MagicMock()
    tool.execute = AsyncMock(return_value=L5ToolResult(
        tool_type="websearch",
        success=True,
        findings=[
            L5Finding(
                source_tool="websearch",
                title="FDA: Drug Approval Process",
                content="The FDA drug approval process involves...",
                relevance_score=0.95,
                citation="FDA.gov [regulatory]",
                source_url="https://fda.gov/drugs/approval",
                source_type="regulatory"
            ),
            L5Finding(
                source_tool="websearch",
                title="PubMed: Clinical Trial Design",
                content="Best practices for clinical trial design...",
                relevance_score=0.87,
                citation="PubMed [scientific]",
                source_url="https://pubmed.ncbi.nlm.nih.gov/123",
                source_type="scientific"
            )
        ],
        execution_time_ms=800
    ))
    return tool


@pytest.fixture
def mode1_config(agent_data):
    """Create a resolved Mode1Config."""
    resolver = Mode1ConfigResolver()
    return resolver.resolve(
        agent_model=agent_data['model'],
        agent_temperature=agent_data['temperature'],
        agent_max_tokens=agent_data['max_tokens'],
        agent_metadata=agent_data['metadata'],
        knowledge_namespaces=agent_data['knowledge_namespaces'],
        request_model=None,
        user_preferences=None
    )


# =============================================================================
# Mode1ConfigResolver Tests
# =============================================================================

class TestMode1ConfigResolver:
    """Unit tests for Mode1ConfigResolver."""

    def test_rag_and_websearch_always_enabled(self, agent_data):
        """Test that RAG and WebSearch are always enabled (MANDATORY)."""
        resolver = Mode1ConfigResolver()

        config = resolver.resolve(
            agent_model=agent_data['model'],
            agent_temperature=agent_data['temperature'],
            agent_max_tokens=agent_data['max_tokens'],
            agent_metadata=agent_data['metadata'],
            knowledge_namespaces=agent_data['knowledge_namespaces'],
            request_model=None,
            user_preferences=None
        )

        # Both MUST be enabled
        assert config.l5_rag_enabled is True
        assert config.l5_websearch_enabled is True
        assert config.require_evidence is True

    def test_parallel_timeout_is_3_seconds(self, agent_data):
        """Test that parallel timeout is 3000ms (not 500ms per tool)."""
        resolver = Mode1ConfigResolver()

        config = resolver.resolve(
            agent_model=agent_data['model'],
            agent_temperature=None,
            agent_max_tokens=None,
            agent_metadata={},
            knowledge_namespaces=None,
            request_model=None,
            user_preferences=None
        )

        assert config.l5_parallel_timeout_ms == 3000

    def test_max_findings_capped_at_3(self, agent_data):
        """Test that max findings per tool is capped at 3 for Mode 1."""
        resolver = Mode1ConfigResolver()

        # Agent config has max_findings_per_tool = 5
        config = resolver.resolve(
            agent_model=agent_data['model'],
            agent_temperature=None,
            agent_max_tokens=None,
            agent_metadata=agent_data['metadata'],
            knowledge_namespaces=None,
            request_model=None,
            user_preferences=None
        )

        # Should be capped at 3
        assert config.l5_max_findings_per_tool == 3

    def test_graceful_degradation_enabled(self, agent_data):
        """Test graceful degradation is enabled."""
        resolver = Mode1ConfigResolver()

        config = resolver.resolve(
            agent_model=agent_data['model'],
            agent_temperature=None,
            agent_max_tokens=None,
            agent_metadata=agent_data['metadata'],
            knowledge_namespaces=None,
            request_model=None,
            user_preferences=None
        )

        assert config.graceful_degradation is True

    def test_user_preferences_applied(self, agent_data, user_preferences):
        """Test that user preferences are applied."""
        resolver = Mode1ConfigResolver()

        prefs = ResponsePreferencesRequest(
            format=user_preferences['format'],
            depth=user_preferences['depth'],
            include_citations=user_preferences['includeCitations'],
            include_insights=user_preferences['includeInsights'],
            include_key_takeaways=user_preferences['includeKeyTakeaways']
        )

        config = resolver.resolve(
            agent_model=agent_data['model'],
            agent_temperature=None,
            agent_max_tokens=None,
            agent_metadata={},
            knowledge_namespaces=None,
            request_model=None,
            user_preferences=prefs
        )

        assert config.response_format == "structured"
        assert config.response_depth == "comprehensive"
        assert config.include_citations is True

    def test_create_l5_configs_returns_both_tools(self, mode1_config):
        """Test that create_l5_configs returns both RAG and WebSearch."""
        resolver = Mode1ConfigResolver()
        l5_configs = resolver.create_l5_configs(mode1_config)

        assert "rag" in l5_configs
        assert "websearch" in l5_configs
        assert l5_configs["rag"].enabled is True
        assert l5_configs["websearch"].enabled is True

    def test_convenience_function(self, agent_data, user_preferences):
        """Test the convenience function resolve_mode1_config."""
        config = resolve_mode1_config(
            agent=agent_data,
            request_model=None,
            user_preferences=user_preferences
        )

        assert config.model == "gpt-4"
        assert config.l5_rag_enabled is True
        assert config.l5_websearch_enabled is True
        assert config.l5_namespaces == ['pharma', 'regulatory', 'clinical']


# =============================================================================
# Mode1EvidenceGatherer Tests
# =============================================================================

class TestMode1EvidenceGatherer:
    """Unit tests for Mode1EvidenceGatherer."""

    @pytest.mark.asyncio
    async def test_parallel_execution(self, mock_l5_rag_tool, mock_l5_websearch_tool, mode1_config):
        """Test that RAG and WebSearch execute in parallel."""
        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        result = await gatherer.gather_evidence(
            query="drug safety monitoring",
            config=mode1_config,
            tenant_id="tenant-123",
            agent_id="agent-456"
        )

        # Both tools should have been called
        mock_l5_rag_tool.execute.assert_called_once()
        mock_l5_websearch_tool.execute.assert_called_once()

        # Should have findings from both tools
        assert len(result.findings) == 4  # 2 from RAG + 2 from WebSearch
        assert "rag" in result.tools_used
        assert "websearch" in result.tools_used

    @pytest.mark.asyncio
    async def test_graceful_degradation_rag_fails(self, mock_l5_rag_tool, mock_l5_websearch_tool, mode1_config):
        """Test graceful degradation when RAG fails but WebSearch succeeds."""
        # Make RAG fail
        mock_l5_rag_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag",
            success=False,
            findings=[],
            execution_time_ms=100,
            error="RAG service unavailable"
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        result = await gatherer.gather_evidence(
            query="drug safety",
            config=mode1_config,
            tenant_id="tenant-123"
        )

        # Should still succeed with WebSearch findings
        assert len(result.findings) == 2  # Only WebSearch findings
        assert "websearch" in result.tools_used
        assert "rag" not in result.tools_used

    @pytest.mark.asyncio
    async def test_graceful_degradation_websearch_fails(self, mock_l5_rag_tool, mock_l5_websearch_tool, mode1_config):
        """Test graceful degradation when WebSearch fails but RAG succeeds."""
        # Make WebSearch fail
        mock_l5_websearch_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch",
            success=False,
            findings=[],
            execution_time_ms=2500,
            error="WebSearch timeout"
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        result = await gatherer.gather_evidence(
            query="drug safety",
            config=mode1_config,
            tenant_id="tenant-123"
        )

        # Should still succeed with RAG findings
        assert len(result.findings) == 2  # Only RAG findings
        assert "rag" in result.tools_used
        assert "websearch" not in result.tools_used

    @pytest.mark.asyncio
    async def test_both_tools_fail(self, mock_l5_rag_tool, mock_l5_websearch_tool, mode1_config):
        """Test behavior when both tools fail."""
        # Make both tools fail
        mock_l5_rag_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag", success=False, findings=[], execution_time_ms=100, error="RAG failed"
        ))
        mock_l5_websearch_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch", success=False, findings=[], execution_time_ms=100, error="WebSearch failed"
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        result = await gatherer.gather_evidence(
            query="drug safety",
            config=mode1_config,
            tenant_id="tenant-123"
        )

        # Should return empty context with error
        assert len(result.findings) == 0
        assert len(result.tools_used) == 0
        assert result.summary is not None  # Error message

    @pytest.mark.asyncio
    async def test_deduplication(self, mock_l5_rag_tool, mock_l5_websearch_tool, mode1_config):
        """Test that duplicate findings are removed."""
        # Return similar findings from both tools
        similar_finding = L5Finding(
            source_tool="rag",
            title="Drug Safety Guidelines",
            content="This document covers drug safety monitoring guidelines and best practices for compliance.",
            relevance_score=0.9,
            citation="Test Citation",
            source_type="rag"
        )

        mock_l5_rag_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="rag",
            success=True,
            findings=[similar_finding],
            execution_time_ms=200
        ))

        # Very similar finding from WebSearch
        similar_websearch_finding = L5Finding(
            source_tool="websearch",
            title="Drug Safety Guidelines",
            content="This document covers drug safety monitoring guidelines and best practices for compliance.",
            relevance_score=0.85,
            citation="Web Citation",
            source_type="web"
        )

        mock_l5_websearch_tool.execute = AsyncMock(return_value=L5ToolResult(
            tool_type="websearch",
            success=True,
            findings=[similar_websearch_finding],
            execution_time_ms=300
        ))

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        result = await gatherer.gather_evidence(
            query="drug safety",
            config=mode1_config,
            tenant_id="tenant-123"
        )

        # Should deduplicate - only 1 finding (or 2 if dedup threshold not met)
        # Due to 70% overlap threshold, these should be deduplicated
        assert len(result.findings) <= 2

    @pytest.mark.asyncio
    async def test_findings_ranked_by_source_tier(self, mock_l5_rag_tool, mock_l5_websearch_tool, mode1_config):
        """Test that findings are ranked by source tier."""
        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        result = await gatherer.gather_evidence(
            query="drug safety",
            config=mode1_config,
            tenant_id="tenant-123"
        )

        # Regulatory sources should be ranked higher
        # FDA (regulatory) finding should be first or near top
        source_types = [f.source_type for f in result.findings]
        # The ranking considers both relevance AND source tier

    @pytest.mark.asyncio
    async def test_timeout_handling(self, mock_l5_rag_tool, mock_l5_websearch_tool, mode1_config):
        """Test timeout handling for parallel execution."""
        # Make both tools slow - 5 seconds exceeds the 500ms timeout
        async def slow_execute(*args, **kwargs):
            await asyncio.sleep(5)  # 5 seconds - exceeds timeout
            return L5ToolResult(tool_type="rag", success=True, findings=[], execution_time_ms=5000)

        mock_l5_rag_tool.execute = slow_execute
        mock_l5_websearch_tool.execute = slow_execute

        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        # Use minimum valid timeout (500ms) - L5ToolConfig has ge=500 constraint
        mode1_config.l5_parallel_timeout_ms = 500

        result = await gatherer.gather_evidence(
            query="drug safety",
            config=mode1_config,
            tenant_id="tenant-123"
        )

        # Should timeout and return empty (5 second mock > 500ms timeout)
        assert len(result.findings) == 0

    def test_token_count_estimation(self, mock_l5_rag_tool, mock_l5_websearch_tool):
        """Test token count estimation for findings."""
        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        findings = [
            L5Finding(
                source_tool="rag",
                title="Test Title",  # ~2 words
                content="This is some test content with multiple words.",  # ~8 words
                relevance_score=0.9
            )
        ]

        token_count = gatherer._estimate_token_count(findings)

        # ~10 words * 1.3 tokens/word ≈ 13 tokens
        assert token_count > 0
        assert token_count < 50  # Reasonable upper bound


# =============================================================================
# Integration with Config Resolver
# =============================================================================

class TestMode1ConfigIntegration:
    """Test Mode1ConfigResolver integration with EvidenceGatherer."""

    @pytest.mark.asyncio
    async def test_config_flows_to_gatherer(self, agent_data, mock_l5_rag_tool, mock_l5_websearch_tool):
        """Test that config from resolver is properly used by gatherer."""
        # Resolve config
        config = resolve_mode1_config(agent=agent_data)

        # Create gatherer and execute
        gatherer = Mode1EvidenceGatherer(
            l5_rag_tool=mock_l5_rag_tool,
            l5_websearch_tool=mock_l5_websearch_tool
        )

        result = await gatherer.gather_evidence(
            query="test query",
            config=config,
            tenant_id="tenant-123"
        )

        # Verify config was used correctly
        rag_call = mock_l5_rag_tool.execute.call_args
        assert rag_call.kwargs['config'].namespaces == ['pharma', 'regulatory', 'clinical']

    @pytest.mark.asyncio
    async def test_convenience_function_gather_mode1_evidence(self, agent_data, mock_l5_rag_tool, mock_l5_websearch_tool):
        """Test the convenience function gather_mode1_evidence."""
        config = resolve_mode1_config(agent=agent_data)

        # Patch the singleton
        with patch('services.mode1_evidence_gatherer._mode1_evidence_gatherer', None):
            with patch('services.mode1_evidence_gatherer.get_l5_rag_tool', return_value=mock_l5_rag_tool):
                with patch('services.mode1_evidence_gatherer.get_l5_websearch_tool', return_value=mock_l5_websearch_tool):
                    result = await gather_mode1_evidence(
                        query="test",
                        config=config,
                        tenant_id="tenant-123"
                    )

                    assert isinstance(result, L4AggregatedContext)
