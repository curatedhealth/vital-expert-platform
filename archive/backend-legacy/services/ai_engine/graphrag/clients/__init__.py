"""
GraphRAG Database Clients Package

Provides unified access to all database clients:
- PostgreSQL (control plane, metadata)
- Neo4j (knowledge graph)
- Pinecone (vector search)
- Elasticsearch (keyword search, placeholder)
"""

from .postgres_client import (
    PostgresClient,
    get_postgres_client,
    close_postgres_client
)
from .neo4j_client import (
    Neo4jClient,
    get_neo4j_client,
    close_neo4j_client
)
from .vector_db_client import (
    VectorDBClient,
    PineconeClient,
    PgVectorClient,
    VectorSearchQuery,
    get_vector_client,
    close_vector_client,
    create_vector_client
)
from .elastic_client import (
    ElasticsearchClient,
    KeywordSearchQuery,
    get_elasticsearch_client,
    close_elasticsearch_client
)

__all__ = [
    # PostgreSQL
    'PostgresClient',
    'get_postgres_client',
    'close_postgres_client',
    
    # Neo4j
    'Neo4jClient',
    'get_neo4j_client',
    'close_neo4j_client',
    
    # Vector DB
    'VectorDBClient',
    'PineconeClient',
    'PgVectorClient',
    'VectorSearchQuery',
    'get_vector_client',
    'close_vector_client',
    'create_vector_client',
    
    # Elasticsearch
    'ElasticsearchClient',
    'KeywordSearchQuery',
    'get_elasticsearch_client',
    'close_elasticsearch_client',
]


# Convenience function to initialize all clients
async def initialize_all_clients():
    """Initialize all database clients"""
    await get_postgres_client()
    await get_neo4j_client()
    await get_vector_client()
    await get_elasticsearch_client()


# Convenience function to close all clients
async def close_all_clients():
    """Close all database clients"""
    await close_postgres_client()
    await close_neo4j_client()
    await close_vector_client()
    await close_elasticsearch_client()

