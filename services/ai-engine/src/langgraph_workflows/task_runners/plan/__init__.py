"""
PLAN Category - Scheduling Runners

This category contains atomic cognitive operations for project planning
using scheduling algorithms and optimization.

Runners:
    - DecomposeRunner: Break down goal (HTN decomposition)
    - DependencyRunner: Map dependencies (DAG construction)
    - ScheduleRunner: Generate schedule (Critical Path Method)
    - ResourceRunner: Allocate resources (Constraint optimization)

Core Logic: Critical Path Method / Hierarchical Task Networks (HTN)

Planning Pipeline:
    1. DECOMPOSE: Break goal into task hierarchy
    2. DEPENDENCY: Map task dependencies as DAG
    3. SCHEDULE: Calculate timing with CPM
    4. RESOURCE: Allocate resources with constraints

Each runner is designed for:
    - 60-150 second execution time
    - Single planning operation
    - Stateless operation (no memory between invocations)
    - Composable pipeline: Decompose → Dependency → Schedule → Resource
"""

from .decompose_runner import (
    DecomposeRunner,
    DecomposeInput,
    DecomposeOutput,
    DecomposedTask,
)
from .dependency_runner import (
    DependencyRunner,
    DependencyInput,
    DependencyOutput,
    Dependency,
    TaskItem,
)
from .schedule_runner import (
    ScheduleRunner,
    ScheduleInput,
    ScheduleOutput,
    ScheduledTask,
)
from .resource_runner import (
    ResourceRunner,
    ResourceInput,
    ResourceOutput,
    Resource,
    TaskAllocation,
    ResourceUtilization,
)

__all__ = [
    # Runners
    "DecomposeRunner",
    "DependencyRunner",
    "ScheduleRunner",
    "ResourceRunner",
    # Decompose schemas
    "DecomposeInput",
    "DecomposeOutput",
    "DecomposedTask",
    # Dependency schemas
    "DependencyInput",
    "DependencyOutput",
    "Dependency",
    "TaskItem",
    # Schedule schemas
    "ScheduleInput",
    "ScheduleOutput",
    "ScheduledTask",
    # Resource schemas
    "ResourceInput",
    "ResourceOutput",
    "Resource",
    "TaskAllocation",
    "ResourceUtilization",
]
