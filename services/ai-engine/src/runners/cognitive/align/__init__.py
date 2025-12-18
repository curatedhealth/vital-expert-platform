"""
ALIGN Task Runners - Organizational Alignment.

This module provides task runners for organizational alignment:
- StakeholderRunner: Identify stakeholders using power/interest grid
- ObjectiveRunner: Define objectives using goal tree decomposition
- AlignmentRunner: Assess alignment using alignment matrix
- ConsensusRunner: Build consensus using Delphi method

Core Logic: Organizational Alignment / Stakeholder Orchestration

Alignment Pipeline:
    Stakeholder → Objective → Alignment → Consensus

Example:
    >>> from langgraph_workflows.task_runners.align import (
    ...     StakeholderRunner, ObjectiveRunner, AlignmentRunner, ConsensusRunner,
    ...     StakeholderInput, ObjectiveInput, AlignmentInput, ConsensusInput,
    ... )
    >>> runner = StakeholderRunner()
    >>> result = await runner.execute(StakeholderInput(
    ...     initiative="Digital transformation",
    ...     analysis_depth="standard"
    ... ))
"""

# StakeholderRunner - Power/interest grid stakeholder analysis
from .stakeholder_runner import (
    StakeholderRunner,
    StakeholderInput,
    StakeholderOutput,
    Stakeholder,
)

# ObjectiveRunner - Goal tree objective decomposition
from .objective_runner import (
    ObjectiveRunner,
    ObjectiveInput,
    ObjectiveOutput,
    Objective,
    KeyResult,
)

# AlignmentRunner - Alignment matrix gap analysis
from .alignment_runner import (
    AlignmentRunner,
    AlignmentInput,
    AlignmentOutput,
    AlignmentGap,
)

# ConsensusRunner - Delphi method consensus building
from .consensus_runner import (
    ConsensusRunner,
    ConsensusInput,
    ConsensusOutput,
    ViewpointAnalysis,
)

__all__ = [
    # StakeholderRunner
    "StakeholderRunner",
    "StakeholderInput",
    "StakeholderOutput",
    "Stakeholder",
    # ObjectiveRunner
    "ObjectiveRunner",
    "ObjectiveInput",
    "ObjectiveOutput",
    "Objective",
    "KeyResult",
    # AlignmentRunner
    "AlignmentRunner",
    "AlignmentInput",
    "AlignmentOutput",
    "AlignmentGap",
    # ConsensusRunner
    "ConsensusRunner",
    "ConsensusInput",
    "ConsensusOutput",
    "ViewpointAnalysis",
]
