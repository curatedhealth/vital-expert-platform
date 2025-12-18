"""
Redirect module for backwards compatibility.

The actual implementation is in services.shared.cache_manager.
This module re-exports everything for imports that use `from services.cache_manager import ...`
"""

from services.shared.cache_manager import (
    CacheManager,
    get_cache_manager,
    initialize_cache_manager,
)

__all__ = [
    "CacheManager",
    "get_cache_manager",
    "initialize_cache_manager",
]
