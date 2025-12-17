# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [3, 4]
"""
Base classes for unified runner architecture.

This module exports the base classes for both runner types:
- TaskRunner: Atomic cognitive operations (30s-3min)
- BaseFamilyRunner: Complex multi-step workflows (5-30min)

Both runner types share common interfaces but serve different purposes:
- TaskRunner: Single LLM call, typed I/O, used for atomic operations
- BaseFamilyRunner: Multi-node LangGraph, streaming SSE, used for missions
"""

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)

__all__ = [
    "TaskRunner",
    "TaskRunnerCategory",
    "TaskRunnerInput",
    "TaskRunnerOutput",
]
