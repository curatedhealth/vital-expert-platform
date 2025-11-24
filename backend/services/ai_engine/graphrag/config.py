"""
GraphRAG Service Configuration
Manages all configuration for the GraphRAG service including database connections,
RAG profiles, and service parameters.
"""

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import Optional, Dict, List
from enum import Enum


class RAGStrategyType(str, Enum):
    """RAG strategy types matching database enum."""
    SEMANTIC = "semantic"
    HYBRID = "hybrid"
    GRAPHRAG = "graphrag"
    AGENT_OPTIMIZED = "agent_optimized"


class DatabaseConfig(BaseSettings):
    """Database connection configuration."""
    
    # Postgres (Control Plane)
    postgres_host: str
    postgres_port: int = 5432
    postgres_db: str
    postgres_user: str
    postgres_password: str
    postgres_pool_size: int = 20
    
    # Neo4j (Knowledge Plane - Graph)
    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    neo4j_database: str = "neo4j"
    neo4j_pool_size: int = 50
    
    # Vector DB (Knowledge Plane - Embeddings)
    vector_db_type: str = "pgvector"  # pgvector or pinecone
    
    # pgvector (if using Supabase pgvector)
    pgvector_table: str = "embeddings"
    pgvector_dimension: int = 1536
    
    # Pinecone (alternative)
    pinecone_api_key: Optional[str] = None
    pinecone_environment: Optional[str] = None
    pinecone_index_name: Optional[str] = None
    
    # Elasticsearch (Knowledge Plane - Keyword Search)
    elasticsearch_url: str
    elasticsearch_api_key: Optional[str] = None
    elasticsearch_index: str = "vital_documents"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


class EmbeddingConfig(BaseSettings):
    """Embedding model configuration."""
    
    provider: str = "openai"  # openai, cohere, huggingface
    embedding_model: str = "text-embedding-ada-002"
    embedding_dimension: int = 1536
    embedding_batch_size: int = 100
    
    # OpenAI
    openai_api_key: Optional[str] = None
    
    # Cohere
    cohere_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


class RerankerConfig(BaseSettings):
    """Reranker configuration."""
    
    enabled: bool = True
    provider: str = "cohere"  # cohere, openai, sentence-transformers
    reranker_model: str = "rerank-english-v2.0"
    top_n: int = 20
    
    # Cohere
    cohere_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


class FusionWeights(BaseModel):
    """Weights for hybrid fusion by RAG strategy."""
    
    vector: float = Field(..., ge=0.0, le=1.0)
    keyword: float = Field(..., ge=0.0, le=1.0)
    graph: float = Field(..., ge=0.0, le=1.0)
    
    def validate_sum(self) -> bool:
        """Ensure weights sum to 1.0."""
        return abs(sum([self.vector, self.keyword, self.graph]) - 1.0) < 0.01


class RAGProfileDefaults(BaseModel):
    """Default RAG profile configurations mapped from database."""
    
    semantic_standard: FusionWeights = FusionWeights(vector=1.0, keyword=0.0, graph=0.0)
    hybrid_enhanced: FusionWeights = FusionWeights(vector=0.6, keyword=0.4, graph=0.0)
    graphrag_entity: FusionWeights = FusionWeights(vector=0.4, keyword=0.2, graph=0.4)
    agent_optimized: FusionWeights = FusionWeights(vector=0.5, keyword=0.3, graph=0.2)  # Base, can be ML-tuned


class SearchConfig(BaseSettings):
    """Search configuration parameters."""
    
    # Vector search
    vector_top_k: int = 50
    vector_similarity_threshold: float = 0.7
    
    # Keyword search
    keyword_top_k: int = 50
    keyword_min_score: float = 1.0
    
    # Graph search
    graph_max_hops: int = 3
    graph_limit: int = 50
    graph_timeout_seconds: int = 30
    
    # Context building
    max_context_tokens: int = 4000
    max_chunks: int = 20
    
    # Fusion
    rrf_k: int = 60  # Reciprocal Rank Fusion constant
    
    class Config:
        env_file = ".env"
        case_sensitive = False


class CacheConfig(BaseSettings):
    """Caching configuration."""
    
    enabled: bool = True
    ttl_seconds: int = 3600  # 1 hour
    max_size: int = 1000
    
    # Profile cache
    profile_cache_ttl: int = 7200  # 2 hours
    
    # KG view cache
    kg_view_cache_ttl: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = False


class MonitoringConfig(BaseSettings):
    """Monitoring and observability configuration."""
    
    # Prometheus
    prometheus_enabled: bool = True
    prometheus_port: int = 9090
    
    # Langfuse
    langfuse_enabled: bool = True
    langfuse_public_key: Optional[str] = None
    langfuse_secret_key: Optional[str] = None
    langfuse_host: Optional[str] = None
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"  # json or text
    
    class Config:
        env_file = ".env"
        case_sensitive = False


class GraphRAGConfig(BaseSettings):
    """Main GraphRAG service configuration."""
    
    # Service settings
    max_concurrent_queries: int = 100
    query_timeout_seconds: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @classmethod
    def load(cls) -> "GraphRAGConfig":
        """Load complete configuration from environment variables."""
        return cls()
    
    @classmethod
    def from_yaml(cls, path: str) -> "GraphRAGConfig":
        """Load configuration from YAML file."""
        import yaml
        with open(path, 'r') as f:
            config_dict = yaml.safe_load(f)
        return cls(**config_dict)


# Singleton config instances
_graphrag_config: Optional[GraphRAGConfig] = None
_database_config: Optional[DatabaseConfig] = None
_embedding_config: Optional[EmbeddingConfig] = None
_reranker_config: Optional[RerankerConfig] = None
_search_config: Optional[SearchConfig] = None
_cache_config: Optional[CacheConfig] = None
_monitoring_config: Optional[MonitoringConfig] = None


def get_config() -> GraphRAGConfig:
    """Get the global GraphRAG configuration instance."""
    global _graphrag_config
    if _graphrag_config is None:
        _graphrag_config = GraphRAGConfig.load()
    return _graphrag_config


def get_database_config() -> DatabaseConfig:
    """Get the database configuration instance."""
    global _database_config
    if _database_config is None:
        _database_config = DatabaseConfig()
    return _database_config


def get_embedding_config() -> EmbeddingConfig:
    """Get the embedding configuration instance."""
    global _embedding_config
    if _embedding_config is None:
        _embedding_config = EmbeddingConfig()
    return _embedding_config


def get_search_config() -> SearchConfig:
    """Get the search configuration instance."""
    global _search_config
    if _search_config is None:
        _search_config = SearchConfig()
    return _search_config


def get_cache_config() -> CacheConfig:
    """Get the cache configuration instance."""
    global _cache_config
    if _cache_config is None:
        _cache_config = CacheConfig()
    return _cache_config


def get_monitoring_config() -> MonitoringConfig:
    """Get the monitoring configuration instance."""
    global _monitoring_config
    if _monitoring_config is None:
        _monitoring_config = MonitoringConfig()
    return _monitoring_config


def set_config(config: GraphRAGConfig):
    """Set the global configuration instance."""
    global _graphrag_config
    _graphrag_config = config

