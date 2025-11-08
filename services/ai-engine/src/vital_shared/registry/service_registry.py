"""
Service Registry for Dependency Injection

Centralized service management for all VITAL workflows.
Provides singleton access to all shared services.

Benefits:
- Single source of truth for service instances
- Easy to swap implementations (testing, different environments)
- Consistent service configuration across workflows
- Lazy initialization support

Usage:
    # Initialize once at app startup
    db_client = get_supabase_client()
    pinecone_client = get_pinecone_client()
    
    ServiceRegistry.initialize(
        db_client=db_client,
        pinecone_client=pinecone_client,
        cache_manager=cache_manager
    )
    
    # Use in workflows
    workflow = Mode1ManualWorkflow(
        agent_service=ServiceRegistry.get_agent_service(),
        rag_service=ServiceRegistry.get_rag_service(),
        # ...
    )
"""

from typing import Optional, Dict, Any
import structlog

from vital_shared.services.agent_service import AgentService
from vital_shared.services.unified_rag_service import UnifiedRAGService
from vital_shared.services.tool_service import ToolService
from vital_shared.services.memory_service import MemoryService
from vital_shared.services.streaming_service import StreamingService
from vital_shared.services.artifact_service import ArtifactService

logger = structlog.get_logger()


class ServiceRegistry:
    """
    Singleton registry for all VITAL services.
    
    Manages service lifecycle and provides dependency injection.
    """
    
    _instance: Optional["ServiceRegistry"] = None
    _initialized: bool = False
    
    def __init__(self):
        """Private constructor. Use initialize() instead."""
        self._services: Dict[str, Any] = {}
        self._config: Dict[str, Any] = {}
    
    @classmethod
    def get_instance(cls) -> "ServiceRegistry":
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    @classmethod
    def initialize(
        cls,
        db_client,
        pinecone_client=None,
        cache_manager=None,
        embedding_model: Optional[str] = None
    ) -> "ServiceRegistry":
        """
        Initialize service registry with dependencies.
        
        Args:
            db_client: Supabase client
            pinecone_client: Optional Pinecone client
            cache_manager: Optional cache manager
            embedding_model: Optional embedding model name
            
        Returns:
            ServiceRegistry instance
            
        Example:
            >>> registry = ServiceRegistry.initialize(
            ...     db_client=supabase_client,
            ...     pinecone_client=pinecone,
            ...     cache_manager=redis_cache
            ... )
        """
        registry = cls.get_instance()
        
        if registry._initialized:
            logger.warning("service_registry_already_initialized")
            return registry
        
        logger.info("initializing_service_registry")
        
        try:
            # Store config
            registry._config = {
                "db_client": db_client,
                "pinecone_client": pinecone_client,
                "cache_manager": cache_manager,
                "embedding_model": embedding_model
            }
            
            # Initialize services
            registry._services = {
                "agent": AgentService(db_client),
                "rag": UnifiedRAGService(
                    db_client,
                    cache_manager=cache_manager,
                    embedding_model=embedding_model
                ),
                "tool": ToolService(db_client),
                "memory": MemoryService(db_client),
                "streaming": StreamingService(),
                "artifact": ArtifactService(db_client)
            }
            
            registry._initialized = True
            
            logger.info(
                "service_registry_initialized",
                service_count=len(registry._services)
            )
            
            return registry
            
        except Exception as e:
            logger.error("service_registry_initialization_failed", error=str(e))
            raise
    
    @classmethod
    def get_agent_service(cls) -> AgentService:
        """Get AgentService instance."""
        registry = cls.get_instance()
        cls._ensure_initialized()
        return registry._services["agent"]
    
    @classmethod
    def get_rag_service(cls) -> UnifiedRAGService:
        """Get UnifiedRAGService instance."""
        registry = cls.get_instance()
        cls._ensure_initialized()
        return registry._services["rag"]
    
    @classmethod
    def get_tool_service(cls) -> ToolService:
        """Get ToolService instance."""
        registry = cls.get_instance()
        cls._ensure_initialized()
        return registry._services["tool"]
    
    @classmethod
    def get_memory_service(cls) -> MemoryService:
        """Get MemoryService instance."""
        registry = cls.get_instance()
        cls._ensure_initialized()
        return registry._services["memory"]
    
    @classmethod
    def get_streaming_service(cls) -> StreamingService:
        """Get StreamingService instance."""
        registry = cls.get_instance()
        cls._ensure_initialized()
        return registry._services["streaming"]
    
    @classmethod
    def get_artifact_service(cls) -> ArtifactService:
        """Get ArtifactService instance."""
        registry = cls.get_instance()
        cls._ensure_initialized()
        return registry._services["artifact"]
    
    @classmethod
    def get_all_services(cls) -> Dict[str, Any]:
        """
        Get all services as dictionary.
        
        Returns:
            Dict mapping service names to instances
        """
        registry = cls.get_instance()
        cls._ensure_initialized()
        return registry._services.copy()
    
    @classmethod
    def is_initialized(cls) -> bool:
        """Check if registry is initialized."""
        registry = cls.get_instance()
        return registry._initialized
    
    @classmethod
    def reset(cls):
        """Reset registry (for testing)."""
        registry = cls.get_instance()
        registry._services = {}
        registry._config = {}
        registry._initialized = False
        logger.info("service_registry_reset")
    
    @classmethod
    def _ensure_initialized(cls):
        """Ensure registry is initialized."""
        if not cls.is_initialized():
            raise RuntimeError(
                "ServiceRegistry not initialized. Call ServiceRegistry.initialize() first."
            )


# Convenience function for initialization
def initialize_services(
    db_client,
    pinecone_client=None,
    cache_manager=None,
    embedding_model: Optional[str] = None
) -> ServiceRegistry:
    """
    Initialize service registry (convenience function).
    
    Args:
        db_client: Supabase client
        pinecone_client: Optional Pinecone client
        cache_manager: Optional cache manager
        embedding_model: Optional embedding model
        
    Returns:
        ServiceRegistry instance
        
    Example:
        >>> from vital_shared import initialize_services
        >>> registry = initialize_services(
        ...     db_client=supabase,
        ...     pinecone_client=pinecone
        ... )
    """
    return ServiceRegistry.initialize(
        db_client=db_client,
        pinecone_client=pinecone_client,
        cache_manager=cache_manager,
        embedding_model=embedding_model
    )

