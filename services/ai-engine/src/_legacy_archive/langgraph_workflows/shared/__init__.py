"""
VITAL Path AI Services - Shared Kernel

Shared components for LangGraph workflows to reduce code duplication
across Mode 1-4 implementations.

Phase 1 Refactoring: Task 1.2 - Create Shared Kernel
Target: Extract 40% → 80% shared code from mode workflows

Components:
- state_factory: Unified state creation and validation
- nodes/: Shared node implementations
- mixins/: Reusable workflow mixins
- edges/: Shared routing logic
"""

from .state_factory import StateFactory
from .nodes import (
    process_input_node,
    create_rag_retriever_node,
    format_response_node,
    error_handler_node,
)
from .mixins.streaming import StreamingMixin
from .nodes.error_handler import (
    WorkflowError,
    WorkflowErrorType,
    create_error_boundary,
)

__all__ = [
    "StateFactory",
    "process_input_node",
    "create_rag_retriever_node", 
    "format_response_node",
    "error_handler_node",
    "StreamingMixin",
    "WorkflowError",
    "WorkflowErrorType",
    "create_error_boundary",
]
