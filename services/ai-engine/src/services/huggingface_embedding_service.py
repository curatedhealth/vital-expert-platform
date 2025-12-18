"""
Redirect module for backwards compatibility.
The actual implementation is in services.shared.huggingface_embedding_service.
"""

from services.shared.huggingface_embedding_service import (
    HuggingFaceEmbeddingService,
    create_huggingface_embedding_service,
)

__all__ = [
    "HuggingFaceEmbeddingService",
    "create_huggingface_embedding_service",
]
