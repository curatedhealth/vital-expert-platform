"""
Shared Services - Cross-Cutting Utilities

Common services used across all VITAL platform features.
These are orchestration wrappers with DI, distinct from Runners (pure cognitive ops).

Categories:
- Database clients (Supabase, Neo4j, Pinecone)
- Embedding services (RAG services moved to services.rag/)
- Session and conversation management
- Caching and streaming
- Quality and scoring (evidence, faithfulness)
- Monitoring and analytics
"""

# Database clients
from .supabase_client import SupabaseClient
from .tenant_aware_supabase import TenantAwareSupabase
from .neo4j_client import Neo4jClient
from .neo4j_sync_service import Neo4jSyncService
from .pinecone_sync_service import PineconeSyncService

# Embedding (RAG services moved to services.rag/)
from .embedding_service import EmbeddingService
from .embedding_service_factory import EmbeddingServiceFactory
from .huggingface_embedding_service import HuggingFaceEmbeddingService

# Session and conversation
from .session_manager import SessionManager
from .session_memory_service import SessionMemoryService
from .session_analytics_service import SessionAnalyticsService
from .conversation_manager import ConversationManager
from .conversation_history_analyzer import ConversationHistoryAnalyzer
from .enhanced_conversation_manager import EnhancedConversationManager

# Caching and streaming
from .cache_manager import CacheManager
from .streaming_manager import StreamingManager
from .checkpoint_store import CheckpointStore

# Quality and Scoring
from .evidence_scoring_service import EvidenceScoringService
from .faithfulness_scorer import FaithfulnessScorer

# Utilities
from .llm_service import LLMService
from .data_sanitizer import DataSanitizer
from .feedback_manager import FeedbackManager
from .publisher import Publisher
from .resilience import CircuitBreaker
from .langfuse_monitor import LangfuseMonitor
from .metadata_processing_service import MetadataProcessingService
from .smart_metadata_extractor import SmartMetadataExtractor
from .skills_loader_service import SkillsLoaderService
from .tool_registry_service import ToolRegistryService
from .graph_relationship_builder import GraphRelationshipBuilder
from .real_worker_pool_manager import RealWorkerPoolManager

__all__ = [
    # Database clients
    "SupabaseClient",
    "TenantAwareSupabase",
    "Neo4jClient",
    "Neo4jSyncService",
    "PineconeSyncService",
    # Embedding (RAG services in services.rag/)
    "EmbeddingService",
    "EmbeddingServiceFactory",
    "HuggingFaceEmbeddingService",
    # Session and conversation
    "SessionManager",
    "SessionMemoryService",
    "SessionAnalyticsService",
    "ConversationManager",
    "ConversationHistoryAnalyzer",
    "EnhancedConversationManager",
    # Caching and streaming
    "CacheManager",
    "StreamingManager",
    "CheckpointStore",
    # Quality and Scoring
    "EvidenceScoringService",
    "FaithfulnessScorer",
    # Utilities
    "LLMService",
    "DataSanitizer",
    "FeedbackManager",
    "Publisher",
    "CircuitBreaker",
    "LangfuseMonitor",
    "MetadataProcessingService",
    "SmartMetadataExtractor",
    "SkillsLoaderService",
    "ToolRegistryService",
    "GraphRelationshipBuilder",
    "RealWorkerPoolManager",
]
