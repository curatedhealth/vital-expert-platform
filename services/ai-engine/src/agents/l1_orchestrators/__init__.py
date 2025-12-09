"""
VITAL Path AI Services - L1 Master Orchestrators (Shared)

L1 Orchestrators are the highest-level intelligence in the agent hierarchy.
They coordinate teams of L2 Experts using Fusion Intelligence.

Responsibilities:
- Team selection using Fusion Intelligence (Vector + Graph + Relational)
- Mission decomposition into executable tasks
- Quality assurance and review
- Cost optimization

Model: Claude Opus 4 (highest intelligence)
"""

from .l1_master import (
    L1MasterOrchestrator,
    TeamSelectionEvidence,
    MissionTask,
)

__all__ = [
    "L1MasterOrchestrator",
    "TeamSelectionEvidence",
    "MissionTask",
]
