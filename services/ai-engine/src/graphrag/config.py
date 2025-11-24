"""
Configuration for GraphRAG service
Uses pydantic-settings for environment variable loading
"""

from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
import structlog

logger = structlog.get_logger()


class GraphRAGConfig(BaseSettings):
    """
    GraphRAG service configuration
    
    Environment variables are loaded automatically:
    - DATABASE_URL
    - PINECONE_API_KEY
    - PINECONE_ENVIRONMENT
    - NEO4J_URI
    - NEO4J_USERNAME
    - NEO4J_PASSWORD
    - ELASTICSEARCH_HOSTS
    - ELASTICSEARCH_API_KEY
    """
    
    # Database
    database_url: str
    
    # Vector Database (Pinecone)
    pinecone_api_key: Optional[str] = None
    pinecone_environment: Optional[str] = "us-west1-gcp"
    pinecone_index_name: str = "vital-medical"
    vector_provider: str = "pinecone"  # or "pgvector"
    
    # Neo4j
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_username: str = "neo4j"
    neo4j_password: Optional[str] = None
    neo4j_database: str = "neo4j"
    
    # Elasticsearch
    elasticsearch_hosts: List[str] = ["http://localhost:9200"]
    elasticsearch_api_key: Optional[str] = None
    elasticsearch_index_name: str = "vital-medical-docs"
    elasticsearch_enabled: bool = False  # Set to True when deployed
    
    # OpenAI (for embeddings)
    openai_api_key: Optional[str] = None
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536
    
    # Cohere (for reranking)
    cohere_api_key: Optional[str] = None
    rerank_model: str = "rerank-english-v2.0"
    
    # Connection Pooling
    postgres_pool_min_size: int = 5
    postgres_pool_max_size: int = 20
    postgres_command_timeout: float = 30.0
    
    # Search Defaults
    default_top_k: int = 10
    default_similarity_threshold: float = 0.7
    default_max_hops: int = 2
    default_graph_limit: int = 50
    
    # Performance
    enable_result_caching: bool = True
    cache_ttl_seconds: int = 3600
    max_concurrent_searches: int = 10
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    def validate_config(self) -> bool:
        """
        Validate configuration
        
        Returns:
            True if configuration is valid
        """
        issues = []
        
        # Check required fields
        if not self.database_url:
            issues.append("DATABASE_URL is required")
        
        # Check vector provider
        if self.vector_provider == "pinecone":
            if not self.pinecone_api_key:
                issues.append("PINECONE_API_KEY is required for Pinecone provider")
        
        # Check Neo4j
        if not self.neo4j_password:
            logger.warning("neo4j_password_not_set")
        
        # Check OpenAI (for embeddings)
        if not self.openai_api_key:
            issues.append("OPENAI_API_KEY is required for embeddings")
        
        if issues:
            for issue in issues:
                logger.error("config_validation_failed", issue=issue)
            return False
        
        logger.info(
            "config_validated",
            vector_provider=self.vector_provider,
            elasticsearch_enabled=self.elasticsearch_enabled,
            neo4j_uri=self.neo4j_uri
        )
        
        return True


# Singleton instance
_config: Optional[GraphRAGConfig] = None


def get_graphrag_config() -> GraphRAGConfig:
    """Get or create GraphRAG configuration singleton"""
    global _config
    
    if _config is None:
        _config = GraphRAGConfig()
        _config.validate_config()
    
    return _config

