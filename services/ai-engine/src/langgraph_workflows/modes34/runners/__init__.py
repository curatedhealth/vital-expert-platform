# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [3, 4]
"""
Family Runners Module - LangGraph StateGraph Implementations

This module provides specialized runners for each logic family:
- DEEP_RESEARCH: Tree-of-Thought → Chain-of-Thought → Reflection
- MONITORING: Polling → Delta Detection → Alert Generation
- EVALUATION: Multi-Criteria Decision Analysis scoring
- STRATEGY: Scenario Planning → SWOT → Roadmap
- INVESTIGATION: Root Cause Analysis → Bayesian reasoning
- PROBLEM_SOLVING: Hypothesis → Test → Iterate
- COMMUNICATION: Audience → Format → Review
- FORESIGHT: Signal → Impact → Disrupt → Gap → Invest
- BRAND_STRATEGY: 10 Ps → Positioning → Portfolio Architecture
- GENERIC: Standard step-by-step execution

Usage:
    from langgraph_workflows.modes34.runners import (
        FAMILY_RUNNERS,
        FamilyType,
        get_family_runner,
        get_runner_for_template,
        DeepResearchRunner,
    )

    # Get runner class by family type
    runner_class = get_family_runner(FamilyType.DEEP_RESEARCH)

    # Instantiate and execute
    runner = runner_class()
    result = await runner.execute(query="...", session_id="...")

    # Or get by template family string
    runner_class = get_runner_for_template("DEEP_RESEARCH")
"""

# Base classes and types
from .base_family_runner import (
    # Enums
    FamilyType,
    ExecutionPhase,
    SSEEventType,
    # State classes
    BaseFamilyState,
    FamilyResult,
    SSEEvent,
    # Base runner
    BaseFamilyRunner,
    # Registry
    FAMILY_RUNNERS,
    register_family_runner,
    get_family_runner,
    get_runner_for_template,
)

# Concrete runner implementations
from .deep_research_runner import (
    DeepResearchRunner,
    DeepResearchState,
    ResearchBranch,
)
from .strategy_runner import StrategyRunner, StrategyState
from .monitoring_runner import MonitoringRunner, MonitoringState
from .evaluation_runner import EvaluationRunner, EvaluationState
from .investigation_runner import InvestigationRunner, InvestigationState
from .problem_solving_runner import ProblemSolvingRunner, ProblemSolvingState
from .communication_runner import CommunicationRunner, CommunicationState
from .generic_runner import GenericRunner, GenericState
from .foresight_runner import ForesightRunner, ForesightState
from .brand_strategy_runner import BrandStrategyRunner, BrandStrategyState

# Export all public symbols
__all__ = [
    # Enums
    "FamilyType",
    "ExecutionPhase",
    "SSEEventType",
    # State classes
    "BaseFamilyState",
    "FamilyResult",
    "SSEEvent",
    # Base runner
    "BaseFamilyRunner",
    # Registry functions
    "FAMILY_RUNNERS",
    "register_family_runner",
    "get_family_runner",
    "get_runner_for_template",
    # Deep Research
    "DeepResearchRunner",
    "DeepResearchState",
    "ResearchBranch",
    # Strategy
    "StrategyRunner",
    "StrategyState",
    # Monitoring
    "MonitoringRunner",
    "MonitoringState",
    # Evaluation
    "EvaluationRunner",
    "EvaluationState",
    # Investigation
    "InvestigationRunner",
    "InvestigationState",
    # Problem Solving
    "ProblemSolvingRunner",
    "ProblemSolvingState",
    # Communication
    "CommunicationRunner",
    "CommunicationState",
    # Generic
    "GenericRunner",
    "GenericState",
    # Foresight
    "ForesightRunner",
    "ForesightState",
    # Brand Strategy
    "BrandStrategyRunner",
    "BrandStrategyState",
]


def get_available_families() -> list[str]:
    """Get list of available family runner types."""
    return [family.value for family in FamilyType]


def get_registered_runners() -> dict[str, str]:
    """Get mapping of family types to runner class names."""
    return {
        family.value: runner.__name__
        for family, runner in FAMILY_RUNNERS.items()
    }
