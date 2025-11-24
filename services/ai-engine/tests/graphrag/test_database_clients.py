"""
Test Database Clients
Tests for PostgreSQL, Vector DB, Neo4j clients with mocks
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID

from src.graphrag.clients.postgres_client import PostgresClient
from src.graphrag.clients.vector_db_client import VectorDBClient, VectorSearchResult
from src.graphrag.clients.neo4j_client import Neo4jClient, GraphPath


@pytest.mark.asyncio
class TestPostgresClient:
    """Test suite for PostgresClient"""
    
    async def test_postgres_initialization(self):
        """Test PostgreSQL client initialization"""
        client = PostgresClient(
            connection_string="postgresql://test:test@localhost:5432/test",
            min_size=2,
            max_size=5
        )
        
        assert client.min_size == 2
        assert client.max_size == 5
        assert client._pool is None
    
    @patch('src.graphrag.clients.postgres_client.asyncpg.create_pool')
    async def test_postgres_connect(self, mock_create_pool):
        """Test connection pool creation"""
        mock_pool = AsyncMock()
        mock_create_pool.return_value = mock_pool
        
        client = PostgresClient()
        await client.connect()
        
        assert client._pool == mock_pool
        mock_create_pool.assert_called_once()
    
    @patch('src.graphrag.clients.postgres_client.asyncpg.create_pool')
    async def test_postgres_health_check(self, mock_create_pool):
        """Test health check"""
        mock_pool = AsyncMock()
        mock_conn = AsyncMock()
        mock_conn.fetchval = AsyncMock(return_value=1)
        mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
        mock_create_pool.return_value = mock_pool
        
        client = PostgresClient()
        await client.connect()
        
        health = await client.health_check()
        assert health is True
    
    @patch('src.graphrag.clients.postgres_client.asyncpg.create_pool')
    async def test_postgres_fetch(self, mock_create_pool):
        """Test fetch query"""
        mock_pool = AsyncMock()
        mock_conn = AsyncMock()
        mock_row = MagicMock()
        mock_row.__getitem__ = lambda self, key: "value"
        mock_row.keys.return_value = ["col1", "col2"]
        mock_conn.fetch = AsyncMock(return_value=[mock_row])
        mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
        mock_create_pool.return_value = mock_pool
        
        client = PostgresClient()
        await client.connect()
        
        results = await client.fetch("SELECT * FROM test")
        assert len(results) == 1
    
    @patch('src.graphrag.clients.postgres_client.asyncpg.create_pool')
    async def test_postgres_execute(self, mock_create_pool):
        """Test execute query"""
        mock_pool = AsyncMock()
        mock_conn = AsyncMock()
        mock_conn.execute = AsyncMock(return_value="INSERT 0 1")
        mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
        mock_create_pool.return_value = mock_pool
        
        client = PostgresClient()
        await client.connect()
        
        result = await client.execute("INSERT INTO test VALUES ($1)", "value")
        assert result == "INSERT 0 1"


@pytest.mark.asyncio
class TestVectorDBClient:
    """Test suite for VectorDBClient"""
    
    def test_vector_db_initialization(self):
        """Test vector DB client initialization"""
        client = VectorDBClient(
            provider="pinecone",
            index_name="test-index"
        )
        
        assert client.provider == "pinecone"
        assert client.index_name == "test-index"
        assert client._client is None
    
    @patch('src.graphrag.clients.vector_db_client.pinecone')
    async def test_pinecone_connect(self, mock_pinecone):
        """Test Pinecone connection"""
        mock_index = MagicMock()
        mock_pinecone.Index.return_value = mock_index
        mock_pinecone.list_indexes.return_value = ["test-index"]
        
        client = VectorDBClient(provider="pinecone", index_name="test-index")
        await client.connect()
        
        assert client._index == mock_index
    
    @patch('src.graphrag.clients.vector_db_client.pinecone')
    async def test_pinecone_search(self, mock_pinecone):
        """Test Pinecone search"""
        mock_index = MagicMock()
        mock_index.query.return_value = {
            'matches': [
                {
                    'id': 'doc1',
                    'score': 0.9,
                    'metadata': {'text': 'test document', 'title': 'Test'}
                }
            ]
        }
        mock_pinecone.Index.return_value = mock_index
        mock_pinecone.list_indexes.return_value = ["test-index"]
        
        client = VectorDBClient(provider="pinecone", index_name="test-index")
        await client.connect()
        
        embedding = [0.1] * 1536
        results = await client.search(embedding, top_k=10, min_score=0.7)
        
        assert len(results) == 1
        assert results[0].id == 'doc1'
        assert results[0].score == 0.9
        assert results[0].text == 'test document'
    
    async def test_pgvector_connect(self):
        """Test pgvector connection"""
        with patch('src.graphrag.clients.vector_db_client.get_postgres_client') as mock_pg:
            mock_pg_client = AsyncMock()
            mock_pg_client.fetchval = AsyncMock(return_value=1)
            mock_pg.return_value = mock_pg_client
            
            client = VectorDBClient(provider="pgvector")
            await client.connect()
            
            mock_pg_client.fetchval.assert_called_once()


@pytest.mark.asyncio
class TestNeo4jClient:
    """Test suite for Neo4jClient"""
    
    def test_neo4j_initialization(self):
        """Test Neo4j client initialization"""
        client = Neo4jClient(
            uri="bolt://localhost:7687",
            username="neo4j",
            password="test"
        )
        
        assert client.uri == "bolt://localhost:7687"
        assert client.username == "neo4j"
        assert client._driver is None
    
    @patch('src.graphrag.clients.neo4j_client.AsyncGraphDatabase')
    async def test_neo4j_connect(self, mock_graph_db):
        """Test Neo4j connection"""
        mock_driver = AsyncMock()
        mock_driver.verify_connectivity = AsyncMock()
        mock_graph_db.driver.return_value = mock_driver
        
        client = Neo4jClient()
        await client.connect()
        
        assert client._driver == mock_driver
        mock_driver.verify_connectivity.assert_called_once()
    
    @patch('src.graphrag.clients.neo4j_client.AsyncGraphDatabase')
    async def test_neo4j_health_check(self, mock_graph_db):
        """Test Neo4j health check"""
        mock_driver = AsyncMock()
        mock_driver.verify_connectivity = AsyncMock()
        mock_graph_db.driver.return_value = mock_driver
        
        client = Neo4jClient()
        await client.connect()
        
        # Mock session and result
        mock_session = AsyncMock()
        mock_result = AsyncMock()
        mock_result.data = AsyncMock(return_value=[{'health': 1}])
        mock_session.run = AsyncMock(return_value=mock_result)
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        
        health = await client.health_check()
        assert health is True
    
    @patch('src.graphrag.clients.neo4j_client.AsyncGraphDatabase')
    async def test_neo4j_find_entities(self, mock_graph_db):
        """Test entity finding"""
        mock_driver = AsyncMock()
        mock_driver.verify_connectivity = AsyncMock()
        mock_graph_db.driver.return_value = mock_driver
        
        client = Neo4jClient()
        await client.connect()
        
        # Mock session and result
        mock_session = AsyncMock()
        mock_result = AsyncMock()
        mock_node = MagicMock()
        mock_node.id = 123
        mock_result.data = AsyncMock(return_value=[{'n': mock_node, 'labels': ['Drug']}])
        mock_session.run = AsyncMock(return_value=mock_result)
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        
        results = await client.find_entities(['metformin'], ['Drug'])
        
        assert len(results) == 1
        assert results[0]['n'] == mock_node
    
    @patch('src.graphrag.clients.neo4j_client.AsyncGraphDatabase')
    async def test_neo4j_traverse_graph(self, mock_graph_db):
        """Test graph traversal"""
        mock_driver = AsyncMock()
        mock_driver.verify_connectivity = AsyncMock()
        mock_graph_db.driver.return_value = mock_driver
        
        client = Neo4jClient()
        await client.connect()
        
        # Mock session and result
        mock_session = AsyncMock()
        mock_result = AsyncMock()
        mock_result.data = AsyncMock(return_value=[
            {
                'nodes': [{'id': 'n1', 'name': 'Metformin'}],
                'edges': [{'type': 'TREATS'}],
                'path_length': 1,
                'path_id': 'path1'
            }
        ])
        mock_session.run = AsyncMock(return_value=mock_result)
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        
        paths = await client.traverse_graph(
            seed_ids=['123'],
            max_hops=2,
            limit=10
        )
        
        assert len(paths) == 1
        assert paths[0].path_id == 'path1'

