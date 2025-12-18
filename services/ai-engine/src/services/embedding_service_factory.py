"""
Redirect module for backwards compatibility.
The actual implementation is in services.shared.embedding_service_factory.
"""

from services.shared.embedding_service_factory import (
    EmbeddingService,
    OpenAIEmbeddingServiceAdapter,
    EmbeddingServiceFactory,
)

__all__ = [
    "EmbeddingService",
    "OpenAIEmbeddingServiceAdapter",
    "EmbeddingServiceFactory",
]
