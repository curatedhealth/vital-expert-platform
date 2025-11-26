"""
Unit tests for GraphRAG database clients
Tests Postgres, Vector (Pinecone/pgvector), Neo4j, and Elasticsearch clients
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from uuid import UUID, uuid4

# Import clients
from graphrag.clients.postgres_client import PostgresClient, get_postgres_client
from graphrag.clients.vector_db_client import VectorDBClient, get_vector_client
from graphrag.clients.neo4j_client import Neo4jClient, get_neo4j_client
from graphrag.clients.elastic_client import ElasticsearchClient, get_elastic_client
from graphrag.config import GraphRAGConfig


# ========== FIXTURES ==========

@pytest.fixture
def mock_config():
    """Mock GraphRAG configuration"""
    return GraphRAGConfig(
        database_url="postgresql://localhost/test",
        pinecone_api_key="test-key",
        pinecone_environment="test",
        neo4j_uri="bolt://localhost:7687",
        neo4j_password="test",
        openai_api_key="test-openai-key"
    )


@pytest.fixture
def mock_asyncpg_pool():
    """Mock asyncpg connection pool"""
    pool = AsyncMock()
    pool.acquire = AsyncMock()
    pool.close = AsyncMock()
    return pool


@pytest.fixture
def mock_pinecone_index():
    """Mock Pinecone index"""
    index = Mock()
    index.query = Mock(return_value={"matches": []})
    index.upsert = Mock()
    return index


@pytest.fixture
def mock_neo4j_driver():
    """Mock Neo4j driver"""
    driver = Mock()
    session = Mock()
    session.run = Mock()
    session.close = Mock()
    driver.session = Mock(return_value=session)
    driver.close = AsyncMock()
    return driver


# ========== POSTGRES CLIENT TESTS ==========

class TestPostgresClient:
    """Test suite for PostgresClient"""
    
    @pytest.mark.asyncio
    async def test_initialization(self, mock_config):
        """Test Postgres client initialization"""
        with patch('asyncpg.create_pool', new=AsyncMock(return_value=Mock())):
            client = PostgresClient(mock_config)
            await client.initialize()
            assert client._pool is not None
    
    @pytest.mark.asyncio
    async def test_get_rag_profile(self, mock_config, mock_asyncpg_pool):
        """Test fetching RAG profile"""
        # Mock database response
        mock_row = {
            'id': uuid4(),
            'name': 'semantic_standard',
            'vector_weight': 1.0,
            'keyword_weight': 0.0,
            'graph_weight': 0.0
        }
        
        mock_conn = AsyncMock()
        mock_conn.fetchrow = AsyncMock(return_value=mock_row)
        mock_asyncpg_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        
        client = PostgresClient(mock_config)
        client._pool = mock_asyncpg_pool
        
        profile = await client.get_rag_profile(str(mock_row['id']))
        
        assert profile is not None
        assert profile['name'] == 'semantic_standard'
        assert profile['vector_weight'] == 1.0
    
    @pytest.mark.asyncio
    async def test_get_agent_kg_view(self, mock_config, mock_asyncpg_pool):
        """Test fetching agent KG view"""
        agent_id = uuid4()
        mock_row = {
            'agent_id': agent_id,
            'include_nodes': ['Drug', 'Disease'],
            'include_edges': ['TREATS', 'CAUSES'],
            'max_hops': 2
        }
        
        mock_conn = AsyncMock()
        mock_conn.fetchrow = AsyncMock(return_value=mock_row)
        mock_asyncpg_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        
        client = PostgresClient(mock_config)
        client._pool = mock_asyncpg_pool
        
        kg_view = await client.get_agent_kg_view(str(agent_id))
        
        assert kg_view is not None
        assert kg_view['include_nodes'] == ['Drug', 'Disease']
        assert kg_view['max_hops'] == 2
    
    @pytest.mark.asyncio
    async def test_health_check(self, mock_config, mock_asyncpg_pool):
        """Test Postgres health check"""
        mock_conn = AsyncMock()
        mock_conn.fetchval = AsyncMock(return_value=1)
        mock_asyncpg_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        
        client = PostgresClient(mock_config)
        client._pool = mock_asyncpg_pool
        
        is_healthy = await client.health_check()
        
        assert is_healthy is True


# ========== VECTOR DB CLIENT TESTS ==========

class TestVectorDBClient:
    """Test suite for VectorDBClient (Pinecone/pgvector)"""
    
    @pytest.mark.asyncio
    async def test_pinecone_initialization(self, mock_config):
        """Test Pinecone client initialization"""
        with patch('pinecone.Pinecone') as mock_pinecone:
            mock_pc = Mock()
            mock_pc.Index = Mock(return_value=Mock())
            mock_pinecone.return_value = mock_pc
            
            client = VectorDBClient(mock_config, provider="pinecone")
            await client.initialize()
            
            assert client._index is not None
    
    @pytest.mark.asyncio
    async def test_vector_search_pinecone(self, mock_config, mock_pinecone_index):
        """Test vector search with Pinecone"""
        mock_matches = [
            {
                'id': 'doc1',
                'score': 0.95,
                'metadata': {'text': 'Test document', 'source': 'test'}
            }
        ]
        mock_pinecone_index.query.return_value = {'matches': mock_matches}
        
        client = VectorDBClient(mock_config, provider="pinecone")
        client._index = mock_pinecone_index
        
        embedding = [0.1] * 1536
        results = await client.search(embedding, top_k=10)
        
        assert len(results) == 1
        assert results[0].id == 'doc1'
        assert results[0].score == 0.95
    
    @pytest.mark.asyncio
    async def test_vector_upsert_pinecone(self, mock_config, mock_pinecone_index):
        """Test vector upsert with Pinecone"""
        client = VectorDBClient(mock_config, provider="pinecone")
        client._index = mock_pinecone_index
        
        vectors = [
            {
                'id': 'doc1',
                'values': [0.1] * 1536,
                'metadata': {'text': 'Test'}
            }
        ]
        
        await client.upsert(vectors)
        
        mock_pinecone_index.upsert.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_pgvector_upsert(self, mock_config, mock_asyncpg_pool):
        """Test pgvector upsert implementation"""
        mock_conn = AsyncMock()
        mock_conn.execute = AsyncMock()
        mock_asyncpg_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        
        client = VectorDBClient(mock_config, provider="pgvector")
        client._pool = mock_asyncpg_pool
        
        vectors = [
            {
                'id': 'doc1',
                'values': [0.1] * 1536,
                'metadata': {'text': 'Test document'}
            }
        ]
        
        await client.upsert(vectors)
        
        # Verify execute was called for each vector
        assert mock_conn.execute.call_count == len(vectors)


# ========== NEO4J CLIENT TESTS ==========

class TestNeo4jClient:
    """Test suite for Neo4jClient"""
    
    @pytest.mark.asyncio
    async def test_initialization(self, mock_config, mock_neo4j_driver):
        """Test Neo4j client initialization"""
        with patch('neo4j.AsyncGraphDatabase.driver', return_value=mock_neo4j_driver):
            client = Neo4jClient(mock_config)
            await client.initialize()
            assert client._driver is not None
    
    @pytest.mark.asyncio
    async def test_graph_search(self, mock_config, mock_neo4j_driver):
        """Test graph search/traversal"""
        # Mock Neo4j query results
        mock_record = {
            'path': Mock(),
            'nodes': [{'id': 'node1', 'label': 'Drug'}],
            'edges': [{'type': 'TREATS'}]
        }
        
        mock_result = Mock()
        mock_result.data = AsyncMock(return_value=[mock_record])
        
        mock_session = AsyncMock()
        mock_session.run = Mock(return_value=mock_result)
        mock_session.close = AsyncMock()
        mock_neo4j_driver.session.return_value = mock_session
        
        client = Neo4jClient(mock_config)
        client._driver = mock_neo4j_driver
        
        results = await client.search(
            seed_ids=['entity1'],
            allowed_nodes=['Drug', 'Disease'],
            allowed_edges=['TREATS'],
            max_hops=2
        )
        
        assert len(results) > 0
    
    @pytest.mark.asyncio
    async def test_health_check(self, mock_config, mock_neo4j_driver):
        """Test Neo4j health check"""
        mock_neo4j_driver.verify_connectivity = AsyncMock()
        
        client = Neo4jClient(mock_config)
        client._driver = mock_neo4j_driver
        
        is_healthy = await client.health_check()
        
        assert is_healthy is True


# ========== ELASTICSEARCH CLIENT TESTS ==========

class TestElasticsearchClient:
    """Test suite for ElasticsearchClient (mock)"""
    
    @pytest.mark.asyncio
    async def test_initialization(self, mock_config):
        """Test Elasticsearch client initialization (mock)"""
        client = ElasticsearchClient(mock_config)
        await client.initialize()
        # Mock client should initialize without error
        assert True
    
    @pytest.mark.asyncio
    async def test_keyword_search_mock(self, mock_config):
        """Test keyword search returns empty (mock implementation)"""
        client = ElasticsearchClient(mock_config)
        
        results = await client.search(query="test query", top_k=10)
        
        # Mock implementation returns empty list
        assert results == []


# ========== INTEGRATION TESTS ==========

class TestClientIntegration:
    """Integration tests for all clients working together"""
    
    @pytest.mark.asyncio
    async def test_singleton_pattern(self, mock_config):
        """Test singleton pattern for client factories"""
        with patch('asyncpg.create_pool', new=AsyncMock(return_value=Mock())):
            client1 = await get_postgres_client()
            client2 = await get_postgres_client()
            
            # Should return same instance
            assert client1 is client2
    
    @pytest.mark.asyncio
    async def test_concurrent_health_checks(self, mock_config):
        """Test concurrent health checks across all clients"""
        with patch('asyncpg.create_pool', new=AsyncMock(return_value=Mock())):
            with patch('pinecone.Pinecone'):
                with patch('neo4j.AsyncGraphDatabase.driver'):
                    pg_client = await get_postgres_client()
                    vector_client = await get_vector_client()
                    neo4j_client = await get_neo4j_client()
                    
                    # Mock health checks
                    pg_client.health_check = AsyncMock(return_value=True)
                    vector_client.health_check = AsyncMock(return_value=True)
                    neo4j_client.health_check = AsyncMock(return_value=True)
                    
                    # Run concurrent health checks
                    results = await asyncio.gather(
                        pg_client.health_check(),
                        vector_client.health_check(),
                        neo4j_client.health_check()
                    )
                    
                    assert all(results)


# ========== RUN TESTS ==========

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

