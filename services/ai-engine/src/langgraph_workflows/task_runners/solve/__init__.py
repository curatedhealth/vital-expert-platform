"""
SOLVE Category - Problem Resolution Runners

This category contains atomic cognitive operations for diagnosing problems,
finding solution paths, generating alternatives, and unblocking progress.

Runners:
    - DiagnoseRunner: Identify blockers (root cause analysis)
    - PathfindRunner: Find solution path (A* search)
    - AlternativeRunner: Generate alternatives (lateral thinking)
    - UnblockRunner: Resolve blocker (constraint relaxation)

Core Logic: Constraint Satisfaction / A* Search / Pathfinding

Each runner is designed for:
    - 60-120 second execution time
    - Single problem-solving operation
    - Stateless operation (no memory between invocations)
    - Composable: Diagnose → Pathfind → Alternative → Unblock
"""

from .diagnose_runner import (
    DiagnoseRunner,
    DiagnoseInput,
    DiagnoseOutput,
    Blocker,
)
from .pathfind_runner import (
    PathfindRunner,
    PathfindInput,
    PathfindOutput,
    PathStep,
)
from .alternative_runner import (
    AlternativeRunner,
    AlternativeInput,
    AlternativeOutput,
    Alternative,
)
from .unblock_runner import (
    UnblockRunner,
    UnblockInput,
    UnblockOutput,
    Resolution,
    ConstraintRelaxation,
)

__all__ = [
    # Runners
    "DiagnoseRunner",
    "PathfindRunner",
    "AlternativeRunner",
    "UnblockRunner",
    # Diagnose schemas
    "DiagnoseInput",
    "DiagnoseOutput",
    "Blocker",
    # Pathfind schemas
    "PathfindInput",
    "PathfindOutput",
    "PathStep",
    # Alternative schemas
    "AlternativeInput",
    "AlternativeOutput",
    "Alternative",
    # Unblock schemas
    "UnblockInput",
    "UnblockOutput",
    "Resolution",
    "ConstraintRelaxation",
]
