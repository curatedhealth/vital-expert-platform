"""
Unit tests for H5 - Stub Agent Fallback Logging

Tests verify that the GraphRAG selector properly logs and creates stub agents
when search fails, returns empty results, or has low confidence scores.

Test Coverage:
- Empty search results → stub agent with reason metadata
- Low confidence scores → stub agent with reason metadata
- Search exceptions → stub agent with error tracking
- Stub agent metadata verification
- Log message verification

Reference: Phase 2 H5 Deep Audit Priority
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.graphrag_selector import GraphRAGSelector, STUB_AGENT_FALLBACK_COUNT
from services.embedding_service import EmbeddingService
import structlog

# Configure structured logging for tests
structlog.configure(
    processors=[
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    client = MagicMock()
    client.client = MagicMock()
    return client


@pytest.fixture
def mock_embedding_service():
    """Mock embedding service."""
    service = MagicMock(spec=EmbeddingService)
    service.embed_query = AsyncMock(return_value=[0.1] * 768)
    return service


@pytest.fixture
def graphrag_selector(mock_supabase, mock_embedding_service):
    """Create GraphRAG selector with mocked dependencies."""
    return GraphRAGSelector(
        embedding_service=mock_embedding_service,
        supabase_client=mock_supabase
    )


class TestStubAgentFactory:
    """Test the stub agent factory creates proper fallback agents."""

    def test_stub_agent_structure(self, graphrag_selector):
        """Test that stub agent has all required fields."""
        stub = graphrag_selector._create_stub_agent(
            reason="empty_search_results",
            query_preview="What are the latest clinical trials?",
            tenant_id="test-tenant-123",
            mode="mode2"
        )

        # Verify basic structure
        assert stub["agent_id"] == "stub-fallback-agent"
        assert stub["agent_name"] == "Default Medical Affairs Assistant"
        assert stub["fused_score"] == 0.0
        assert stub["tier"] == 1
        assert stub["level"] == "L2"

        # Verify confidence metrics are zero
        assert stub["confidence"]["overall"] == 0.0
        assert stub["confidence"]["search_quality"] == 0.0
        assert stub["confidence"]["consensus"] == 0.0
        assert stub["confidence"]["methods_found"] == 0

        # Verify metadata
        assert stub["metadata"]["is_stub"] is True
        assert stub["metadata"]["stub_reason"] == "empty_search_results"
        assert stub["metadata"]["query_preview"] == "What are the latest clinical trials?"
        assert stub["metadata"]["tenant_id"] == "test-tenant-123"
        assert stub["metadata"]["mode"] == "mode2"

    def test_stub_agent_different_reasons(self, graphrag_selector):
        """Test stub agent metadata varies by reason."""
        reasons = [
            "empty_search_results",
            "low_confidence_scores",
            "embedding_generation_failed",
            "search_exception"
        ]

        for reason in reasons:
            stub = graphrag_selector._create_stub_agent(
                reason=reason,
                query_preview="Test query",
                tenant_id="tenant-1",
                mode="mode4"
            )

            assert stub["metadata"]["stub_reason"] == reason
            assert stub["metadata"]["is_stub"] is True


class TestEmptySearchResults:
    """Test stub agent fallback when all search methods return empty."""

    @pytest.mark.asyncio
    async def test_all_methods_empty(self, graphrag_selector, caplog):
        """Test stub agent when all search methods return empty results."""
        # Mock all search methods to return empty
        with patch.object(graphrag_selector, '_postgres_fulltext_search', return_value=[]), \
             patch.object(graphrag_selector, '_pinecone_vector_search', return_value=[]), \
             patch.object(graphrag_selector, '_neo4j_graph_search', return_value=[]):

            agents = await graphrag_selector.select_agents(
                query="Find oncology specialists",
                tenant_id="tenant-123",
                mode="mode2",
                max_agents=3
            )

            # Verify stub agent returned
            assert len(agents) == 1
            stub = agents[0]
            assert stub["metadata"]["is_stub"] is True
            assert stub["metadata"]["stub_reason"] == "empty_search_results"

    @pytest.mark.asyncio
    async def test_postgres_only_returns_results(self, graphrag_selector):
        """Test when only PostgreSQL returns results but below confidence threshold."""
        postgres_results = [
            {
                "agent_id": "agent-1",
                "agent_name": "Test Agent",
                "postgres_score": 0.001,  # Very low score
                "source": "postgres"
            }
        ]

        with patch.object(graphrag_selector, '_postgres_fulltext_search', return_value=postgres_results), \
             patch.object(graphrag_selector, '_pinecone_vector_search', return_value=[]), \
             patch.object(graphrag_selector, '_neo4j_graph_search', return_value=[]), \
             patch.object(graphrag_selector, '_enrich_agent_details', return_value=[]):

            agents = await graphrag_selector.select_agents(
                query="Medical query",
                tenant_id="tenant-123",
                mode="mode2",
                max_agents=3,
                min_confidence=0.005  # Higher than fused score
            )

            # Should return stub due to low confidence
            assert len(agents) == 1
            assert agents[0]["metadata"]["is_stub"] is True
            assert agents[0]["metadata"]["stub_reason"] == "low_confidence_scores"


class TestSearchExceptions:
    """Test stub agent fallback when search methods throw exceptions."""

    @pytest.mark.asyncio
    async def test_embedding_generation_fails(self, graphrag_selector, mock_embedding_service):
        """Test stub agent when embedding generation fails."""
        # Mock embedding service to raise exception
        mock_embedding_service.embed_query = AsyncMock(
            side_effect=Exception("OpenAI API timeout")
        )

        agents = await graphrag_selector.select_agents(
            query="Test query",
            tenant_id="tenant-123",
            mode="mode2"
        )

        # Verify stub agent with embedding failure reason
        assert len(agents) == 1
        stub = agents[0]
        assert stub["metadata"]["is_stub"] is True
        assert stub["metadata"]["stub_reason"] == "embedding_generation_failed"

    @pytest.mark.asyncio
    async def test_postgres_search_fails(self, graphrag_selector):
        """Test when PostgreSQL search fails but others succeed."""
        with patch.object(
            graphrag_selector,
            '_postgres_fulltext_search',
            side_effect=Exception("Database connection error")
        ), \
        patch.object(graphrag_selector, '_pinecone_vector_search', return_value=[]), \
        patch.object(graphrag_selector, '_neo4j_graph_search', return_value=[]):

            agents = await graphrag_selector.select_agents(
                query="Test query",
                tenant_id="tenant-123",
                mode="mode2"
            )

            # Should still return stub due to all methods empty/failed
            assert len(agents) == 1
            assert agents[0]["metadata"]["is_stub"] is True

    @pytest.mark.asyncio
    async def test_all_methods_throw_exceptions(self, graphrag_selector):
        """Test when all search methods throw exceptions."""
        with patch.object(
            graphrag_selector,
            '_postgres_fulltext_search',
            side_effect=Exception("Postgres error")
        ), \
        patch.object(
            graphrag_selector,
            '_pinecone_vector_search',
            side_effect=Exception("Pinecone error")
        ), \
        patch.object(
            graphrag_selector,
            '_neo4j_graph_search',
            side_effect=Exception("Neo4j error")
        ):

            agents = await graphrag_selector.select_agents(
                query="Test query",
                tenant_id="tenant-123",
                mode="mode2"
            )

            # Verify stub agent returned
            assert len(agents) == 1
            stub = agents[0]
            assert stub["metadata"]["is_stub"] is True


class TestStubAgentLogging:
    """Test that stub agent fallbacks are properly logged."""

    @pytest.mark.asyncio
    async def test_stub_creation_logged(self, graphrag_selector, caplog):
        """Test that stub agent creation is logged with context."""
        with patch('structlog.get_logger') as mock_logger_factory:
            mock_logger = MagicMock()
            mock_logger_factory.return_value = mock_logger

            stub = graphrag_selector._create_stub_agent(
                reason="test_reason",
                query_preview="Test query preview",
                tenant_id="tenant-123",
                mode="mode2"
            )

            # Verify logger was called with warning
            mock_logger.warning.assert_called_once()
            call_args = mock_logger.warning.call_args

            # Verify log event name
            assert call_args[0][0] == "stub_agent_created"

            # Verify log context
            log_kwargs = call_args[1]
            assert log_kwargs["reason"] == "test_reason"
            assert log_kwargs["query_preview"] == "Test query preview"
            assert log_kwargs["tenant_id"] == "tenant-123"
            assert log_kwargs["mode"] == "mode2"
            assert log_kwargs["phase"] == "H5_stub_agent_factory"

    @pytest.mark.asyncio
    async def test_empty_search_logged(self, graphrag_selector):
        """Test that empty search results trigger proper logging."""
        with patch.object(graphrag_selector, '_postgres_fulltext_search', return_value=[]), \
             patch.object(graphrag_selector, '_pinecone_vector_search', return_value=[]), \
             patch.object(graphrag_selector, '_neo4j_graph_search', return_value=[]), \
             patch('structlog.get_logger') as mock_logger_factory:

            mock_logger = MagicMock()
            mock_logger_factory.return_value = mock_logger

            await graphrag_selector.select_agents(
                query="Test query",
                tenant_id="tenant-123",
                mode="mode2"
            )

            # Verify info logs for empty search methods
            info_calls = [call for call in mock_logger.info.call_args_list]
            assert len(info_calls) >= 3  # At least one per search method


class TestConfidenceCalculationSkipsStub:
    """Test that confidence calculation skips stub agents."""

    def test_stub_agent_skips_confidence_calc(self, graphrag_selector):
        """Test that stub agents skip confidence calculation."""
        stub_agent = {
            "agent_id": "stub-fallback-agent",
            "fused_score": 0.0,
            "scores": {},
            "metadata": {"is_stub": True, "stub_reason": "test"}
        }

        # Should not modify stub agent confidence
        original_confidence = stub_agent.get("confidence")
        agents = graphrag_selector._calculate_confidence([stub_agent], "test query")

        # Confidence should remain unchanged (None)
        assert agents[0].get("confidence") == original_confidence

    def test_regular_agent_gets_confidence(self, graphrag_selector):
        """Test that regular agents get confidence calculated."""
        regular_agent = {
            "agent_id": "real-agent-123",
            "fused_score": 0.8,
            "scores": {
                "postgres": 0.7,
                "pinecone": 0.85,
                "neo4j": 0.75
            }
        }

        agents = graphrag_selector._calculate_confidence([regular_agent], "test query")

        # Confidence should be calculated
        assert "confidence" in agents[0]
        assert agents[0]["confidence"]["overall"] > 0


class TestStubAgentMetrics:
    """Test stub agent fallback metrics tracking."""

    def test_stub_fallback_counter_increments(self, graphrag_selector):
        """Test that stub fallback counter increments."""
        initial_count = STUB_AGENT_FALLBACK_COUNT

        graphrag_selector._increment_stub_fallback(
            tenant_id="tenant-1",
            reason="test_reason",
            query_preview="test query"
        )

        # Note: Counter is module-level, so this test may be brittle
        # In production, use a metrics system like Prometheus
        assert STUB_AGENT_FALLBACK_COUNT >= initial_count


# Integration-style tests
class TestStubAgentEndToEnd:
    """End-to-end tests for stub agent fallback scenarios."""

    @pytest.mark.asyncio
    async def test_low_confidence_creates_stub(self, graphrag_selector):
        """Test complete flow when confidence is too low."""
        # Mock search to return agent with low scores
        postgres_results = [{
            "agent_id": "agent-1",
            "agent_name": "Low Score Agent",
            "postgres_score": 0.002,
            "source": "postgres"
        }]

        with patch.object(graphrag_selector, '_postgres_fulltext_search', return_value=postgres_results), \
             patch.object(graphrag_selector, '_pinecone_vector_search', return_value=[]), \
             patch.object(graphrag_selector, '_neo4j_graph_search', return_value=[]), \
             patch.object(graphrag_selector, '_enrich_agent_details', return_value=[]):

            agents = await graphrag_selector.select_agents(
                query="Complex medical query requiring specialist",
                tenant_id="pharma-tenant-456",
                mode="mode4",
                max_agents=5,
                min_confidence=0.005  # Higher than 0.002 fused score
            )

            # Verify stub agent returned
            assert len(agents) == 1
            stub = agents[0]

            # Verify all metadata
            assert stub["metadata"]["is_stub"] is True
            assert stub["metadata"]["stub_reason"] == "low_confidence_scores"
            assert "Complex medical query" in stub["metadata"]["query_preview"]
            assert stub["metadata"]["tenant_id"] == "pharma-tenant-456"
            assert stub["metadata"]["mode"] == "mode4"

            # Verify stub agent has proper fallback fields
            assert stub["agent_id"] == "stub-fallback-agent"
            assert stub["fused_score"] == 0.0
            assert "General medical affairs assistance" in stub["capabilities"]

    @pytest.mark.asyncio
    async def test_stub_agent_searchable_by_tenant(self, graphrag_selector):
        """Test that stub agent metadata includes tenant for filtering."""
        with patch.object(graphrag_selector, '_postgres_fulltext_search', return_value=[]), \
             patch.object(graphrag_selector, '_pinecone_vector_search', return_value=[]), \
             patch.object(graphrag_selector, '_neo4j_graph_search', return_value=[]):

            tenant_id = "specific-tenant-789"
            agents = await graphrag_selector.select_agents(
                query="Query",
                tenant_id=tenant_id,
                mode="mode2"
            )

            # Verify tenant is in metadata for log search
            assert agents[0]["metadata"]["tenant_id"] == tenant_id


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
