"""
Embedding Service Factory

Auto-detects available provider (HuggingFace or OpenAI) and creates appropriate service
"""

from typing import Optional, Union, Protocol
import structlog
from langchain_openai import OpenAIEmbeddings

from services.huggingface_embedding_service import HuggingFaceEmbeddingService, create_huggingface_embedding_service
from core.config import get_settings

logger = structlog.get_logger()

class EmbeddingService(Protocol):
    """Protocol for embedding services"""
    async def generate_embedding(self, text: str, **kwargs) -> list:
        """Generate embedding for text"""
        ...
    
    async def generate_embeddings_batch(self, texts: list, **kwargs) -> list:
        """Generate embeddings for multiple texts"""
        ...
    
    def get_dimensions(self) -> int:
        """Get embedding dimensions"""
        ...

class OpenAIEmbeddingServiceAdapter:
    """Adapter to make OpenAIEmbeddings compatible with our interface"""
    
    def __init__(self, embeddings: OpenAIEmbeddings):
        self.embeddings = embeddings
        self.dimensions = 3072  # text-embedding-3-large default
    
    async def generate_embedding(self, text: str, **kwargs) -> list:
        """Generate embedding using OpenAI"""
        return await self.embeddings.aembed_query(text)
    
    async def generate_embeddings_batch(self, texts: list, **kwargs) -> list:
        """Generate embeddings for multiple texts"""
        return await self.embeddings.aembed_documents(texts)
    
    def get_dimensions(self) -> int:
        """Get embedding dimensions"""
        return self.dimensions

class EmbeddingServiceFactory:
    """Factory for creating embedding services"""
    
    @staticmethod
    def create(
        provider: Optional[str] = None,
        model_name: Optional[str] = None,
        **kwargs
    ) -> Union[HuggingFaceEmbeddingService, OpenAIEmbeddingServiceAdapter]:
        """
        Create embedding service
        
        Args:
            provider: 'huggingface' or 'openai' (auto-detects if None)
            model_name: Model name to use (provider-specific)
            **kwargs: Additional arguments for service initialization
        
        Returns:
            Embedding service instance
        """
        settings = get_settings()
        
        # Determine provider
        if not provider:
            provider = settings.embedding_provider.lower()
        
        # Auto-detect if not specified
        if provider == 'auto':
            if settings.huggingface_api_key:
                provider = 'huggingface'
                logger.info("🤗 Auto-detected HuggingFace (API key found)")
            elif not settings.openai_api_key:
                provider = 'huggingface'
                logger.info("🤗 Auto-detected HuggingFace (OpenAI key not found)")
            else:
                provider = 'openai'
                logger.info("🔵 Auto-detected OpenAI")
        
        # Create service based on provider
        if provider == 'huggingface':
            model = model_name or settings.huggingface_embedding_model
            logger.info("🤗 Creating HuggingFace embedding service", model=model)
            
            service = create_huggingface_embedding_service(
                model_name=model,
                use_api=settings.use_huggingface_api,
                api_key=settings.huggingface_api_key,
                **kwargs
            )
            
            logger.info("✅ HuggingFace embedding service created",
                       model=service.get_model_name(),
                       dimensions=service.get_dimensions())
            
            return service
        
        elif provider == 'openai':
            model = model_name or settings.openai_embedding_model
            logger.info("🔵 Creating OpenAI embedding service", model=model)
            
            embeddings = OpenAIEmbeddings(
                openai_api_key=settings.openai_api_key,
                model=model,
            )
            
            # Determine dimensions based on model
            if '3-large' in model:
                dimensions = 3072
            elif '3-small' in model:
                dimensions = 1536
            else:
                dimensions = 1536  # Default for older models
            
            service = OpenAIEmbeddingServiceAdapter(embeddings)
            service.dimensions = dimensions
            
            logger.info("✅ OpenAI embedding service created",
                       model=model,
                       dimensions=service.get_dimensions())
            
            return service
        
        else:
            raise ValueError(f"Unknown embedding provider: {provider}. Use 'huggingface' or 'openai'")
    
    @staticmethod
    def create_from_config() -> Union[HuggingFaceEmbeddingService, OpenAIEmbeddingServiceAdapter]:
        """Create embedding service from configuration"""
        return EmbeddingServiceFactory.create()

