"""
VITAL Mission Runner Library - 207 Runners

TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT

This module provides:
- 88 Core Cognitive Runners (22 categories x 4 variants)
- 119 Pharmaceutical Domain Runners (6 families)
- Quality gate patterns with iterative refinement
- Task assembly from the four libraries
"""

from .base import (
    BaseRunner,
    RunnerInput,
    RunnerOutput,
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
)
from .registry import RunnerRegistry, runner_registry
from .assembler import TaskAssembler, AssembledTask, PersonaConfig, KnowledgeConfig, ContextConfig
from .executor import RunnerExecutor, runner_executor

__all__ = [
    # Base classes
    "BaseRunner",
    "RunnerInput",
    "RunnerOutput",
    # Enums
    "RunnerCategory",
    "PharmaDomain",
    "KnowledgeLayer",
    "QualityMetric",
    # Registry
    "RunnerRegistry",
    "runner_registry",
    # Assembler
    "TaskAssembler",
    "AssembledTask",
    "PersonaConfig",
    "KnowledgeConfig",
    "ContextConfig",
    # Executor
    "RunnerExecutor",
    "runner_executor",
]
