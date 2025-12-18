"""
VITAL Platform Runners - World-Class Cognitive Operations

The unified runner architecture supporting the Task Formula:
    TASK = AGENT + RUNNER + SKILL + KNOWLEDGE + PROMPT

Runner Types:
- base_runner_core.py: Abstract BaseRunner class with RunnerCategory, PharmaDomain
- base/: Additional base classes (BaseFamilyRunner for Mode 3/4)
- jobs/: 20 JTBD-aligned job runners (8 core + 12 domain)
- cognitive/: 88+ atomic task runners in 22 categories
- core/: Core utility runners (critique, synthesize, etc.)

Total: 189+ runner files

Usage:
    from runners import RunnerRegistry, BaseRunner
    from runners.jobs import DeepResearchRunner
    from runners.cognitive.understand import ScanRunner

Note: Job runners have heavy dependencies on langgraph_workflows.
Import them explicitly when needed:
    from runners.base.family_runner import BaseFamilyRunner
    from runners.jobs import DeepResearchRunner, StrategyRunner
"""

# Registry
from .registry import RunnerRegistry, RunnerMetadata, runner_registry

# Base classes (core runner infrastructure - no heavy dependencies)
from .base import (
    BaseRunner,
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
    RunnerInput,
    RunnerOutput,
)

# Note: Family runners and BaseFamilyRunner have heavy dependencies on
# langgraph_workflows. Import them explicitly when needed:
#   from runners.base.family_runner import BaseFamilyRunner
#   from runners.families import DeepResearchRunner, StrategyRunner, etc.

__all__ = [
    # Registry
    "RunnerRegistry",
    "RunnerMetadata",
    "runner_registry",
    # Base classes
    "BaseRunner",
    "RunnerCategory",
    "PharmaDomain",
    "KnowledgeLayer",
    "QualityMetric",
    "RunnerInput",
    "RunnerOutput",
]

__version__ = "2.0.0"
