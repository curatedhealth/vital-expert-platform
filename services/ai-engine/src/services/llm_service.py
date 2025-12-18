"""
Redirect module for backwards compatibility.
The actual implementation is in services.shared.llm_service.
"""

from services.shared.llm_service import (
    LLMService,
    get_llm_service,
    initialize_llm_service,
)

__all__ = [
    "LLMService",
    "get_llm_service",
    "initialize_llm_service",
]
