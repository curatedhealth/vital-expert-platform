# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [l2_wrapper, l3_wrapper, l4_wrapper, l5_tool_mapper, registry]
"""
Wrappers for existing L2/L3/L4 agents (Phase 2 scaffolding).

Phase 2 Enhanced: Database-driven agent tool assignments.
- L5ToolExecutor supports execute_for_agent() for database-driven tool permissions
- L2/L4 wrappers automatically use agent_id from context when available
"""

from .l2_wrapper import delegate_to_l2, delegate_to_l2_streaming
from .l3_wrapper import delegate_to_l3
from .l4_wrapper import delegate_to_l4, L4WorkerResult
from .l5_tool_mapper import (
    get_l5_executor,
    L5ExecutionSummary,
    L5ToolExecutor,
    TOOL_REGISTRY_AVAILABLE,
    RUNNER_TO_L5_TOOLS,
    PLAN_TOOL_TO_L5,
)
from .registry import get_l2_class, get_l3_class, get_l4_class

__all__ = [
    # L2 wrapper
    "delegate_to_l2",
    "delegate_to_l2_streaming",
    # L3 wrapper
    "delegate_to_l3",
    # L4 wrapper
    "delegate_to_l4",
    "L4WorkerResult",
    # L5 tool mapper
    "get_l5_executor",
    "L5ExecutionSummary",
    "L5ToolExecutor",
    "TOOL_REGISTRY_AVAILABLE",
    "RUNNER_TO_L5_TOOLS",
    "PLAN_TOOL_TO_L5",
    # Registry
    "get_l2_class",
    "get_l3_class",
    "get_l4_class",
]
