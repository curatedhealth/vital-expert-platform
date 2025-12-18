"""
Base Runner Infrastructure

Exports the core runner classes, enums, and dataclasses from the
runner architecture.

Note: BaseFamilyRunner is available via explicit import:
    from runners.base.family_runner import BaseFamilyRunner
This avoids circular import issues with the langgraph_workflows module.
"""

# Core runner infrastructure from base_runner_core.py
from ..base_runner_core import (
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
    RunnerInput,
    RunnerOutput,
    BaseRunner,
)

# Note: BaseFamilyRunner and output_validation have heavy dependencies
# Import them explicitly when needed:
#   from runners.base.family_runner import BaseFamilyRunner
#   from runners.base.output_validation import validate_runner_output

__all__ = [
    # Enums
    "RunnerCategory",
    "PharmaDomain",
    "KnowledgeLayer",
    "QualityMetric",
    # Dataclasses
    "RunnerInput",
    "RunnerOutput",
    # Base class
    "BaseRunner",
]
