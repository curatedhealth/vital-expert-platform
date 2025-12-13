# PRODUCTION_TAG: DEPRECATED
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [langgraph_compilation.checkpointer, langgraph.checkpoint.memory]
"""
Postgres Checkpointer stub for legacy compatibility.

DEPRECATED: This module re-exports from langgraph_compilation for backward compatibility.
New code should use langgraph_compilation.checkpointer directly.
"""

import warnings
from typing import Optional

# Try to import from the actual implementation in langgraph_compilation
try:
    from langgraph_compilation.checkpointer import get_postgres_checkpointer
except ImportError:
    # Fallback stub if langgraph_compilation is not available
    from langgraph.checkpoint.memory import MemorySaver

    _checkpointer_instance: Optional[MemorySaver] = None

    async def get_postgres_checkpointer():
        """
        Get checkpointer instance (stub returns MemorySaver).

        DEPRECATED: Use langgraph_compilation.checkpointer.get_postgres_checkpointer instead.
        """
        global _checkpointer_instance

        warnings.warn(
            "langgraph_workflows.postgres_checkpointer is deprecated. "
            "Use langgraph_compilation.checkpointer instead.",
            DeprecationWarning,
            stacklevel=2
        )

        if _checkpointer_instance is None:
            _checkpointer_instance = MemorySaver()

        return _checkpointer_instance


__all__ = ["get_postgres_checkpointer"]
