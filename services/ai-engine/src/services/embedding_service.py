"""
Redirect module for backwards compatibility.
The actual implementation is in services.shared.embedding_service.
"""

from services.shared.embedding_service import (
    EmbeddingResult,
    EmbeddingService,
    get_embedding_service,
)

__all__ = [
    "EmbeddingResult",
    "EmbeddingService",
    "get_embedding_service",
]
