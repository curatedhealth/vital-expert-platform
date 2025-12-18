"""
ADAPT Task Runners - Adaptation & Learning.

This module provides task runners for adaptation and learning:
- ContextSenseRunner: Sense context using environmental scanning
- PivotRunner: Generate pivot options using strategic pivoting
- ResilienceRunner: Build resilience using stress testing
- LearnRunner: Extract lessons using after-action review

Core Logic: Adaptive Systems / Organizational Learning

Adaptation Pipeline:
    ContextSense → Pivot → Resilience → Learn

Example:
    >>> from langgraph_workflows.task_runners.adapt import (
    ...     ContextSenseRunner, PivotRunner, ResilienceRunner, LearnRunner,
    ...     ContextSenseInput, PivotInput, ResilienceInput, LearnInput,
    ... )
    >>> runner = ContextSenseRunner()
    >>> result = await runner.execute(ContextSenseInput(
    ...     domain="Healthcare AI",
    ...     scan_dimensions=["political", "economic", "social", "technological"]
    ... ))
"""

# ContextSenseRunner - Environmental scanning context sensing
from .context_sense_runner import (
    ContextSenseRunner,
    ContextSenseInput,
    ContextSenseOutput,
    ContextFactor,
)

# PivotRunner - Strategic pivoting option generation
from .pivot_runner import (
    PivotRunner,
    PivotInput,
    PivotOutput,
    PivotOption,
)

# ResilienceRunner - Stress testing resilience assessment
from .resilience_runner import (
    ResilienceRunner,
    ResilienceInput,
    ResilienceOutput,
    StressScenario,
)

# LearnRunner - After-action review lessons learned
from .learn_runner import (
    LearnRunner,
    LearnInput,
    LearnOutput,
    Lesson,
)

__all__ = [
    # ContextSenseRunner
    "ContextSenseRunner",
    "ContextSenseInput",
    "ContextSenseOutput",
    "ContextFactor",
    # PivotRunner
    "PivotRunner",
    "PivotInput",
    "PivotOutput",
    "PivotOption",
    # ResilienceRunner
    "ResilienceRunner",
    "ResilienceInput",
    "ResilienceOutput",
    "StressScenario",
    # LearnRunner
    "LearnRunner",
    "LearnInput",
    "LearnOutput",
    "Lesson",
]
