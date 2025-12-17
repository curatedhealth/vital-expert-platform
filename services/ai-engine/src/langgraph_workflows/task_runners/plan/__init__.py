"""
PLAN Category - Scheduling Runners

This category contains atomic cognitive operations for project planning
using scheduling algorithms and optimization.

Runners:
    - DecomposeRunner: Break down goal (HTN decomposition)
    - DependencyRunner: Map dependencies (DAG construction)
    - ScheduleRunner: Generate schedule (Critical Path Method)
    - ResourceRunner: Allocate resources (Constraint optimization)
    - IndicatorSetterRunner: Set monitoring indicators
    - ThresholdManagerRunner: Configure alert thresholds
    - StrategicObjectiveSetterRunner: Set strategic objectives
    - PromotionPlannerRunner: Plan promotion campaigns
    - MigrationPlannerRunner: Plan portfolio migration
    - SequencingStrategistRunner: Optimize launch sequencing

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
from .indicator_setter_runner import (
    IndicatorSetterRunner,
    IndicatorSetterInput,
    IndicatorSetterOutput,
    Indicator,
)
from .threshold_manager_runner import (
    ThresholdManagerRunner,
    ThresholdManagerInput,
    ThresholdManagerOutput,
    ThresholdConfig,
)
from .strategic_objective_runner import (
    StrategicObjectiveSetterRunner,
    StrategicObjectiveInput,
    StrategicObjectiveOutput,
    StrategicObjective,
)
from .promotion_planner_runner import (
    PromotionPlannerRunner,
    PromotionPlannerInput,
    PromotionPlannerOutput,
    Campaign,
)
from .migration_planner_runner import (
    MigrationPlannerRunner,
    MigrationPlannerInput,
    MigrationPlannerOutput,
    MigrationPhase,
)
from .sequencing_strategist_runner import (
    SequencingStrategistRunner,
    SequencingStrategistInput,
    SequencingStrategistOutput,
    LaunchItem,
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
    # Indicator Setter
    "IndicatorSetterRunner",
    "IndicatorSetterInput",
    "IndicatorSetterOutput",
    "Indicator",
    # Threshold Manager
    "ThresholdManagerRunner",
    "ThresholdManagerInput",
    "ThresholdManagerOutput",
    "ThresholdConfig",
    # Strategic Objective
    "StrategicObjectiveSetterRunner",
    "StrategicObjectiveInput",
    "StrategicObjectiveOutput",
    "StrategicObjective",
    # Promotion Planner
    "PromotionPlannerRunner",
    "PromotionPlannerInput",
    "PromotionPlannerOutput",
    "Campaign",
    # Migration Planner
    "MigrationPlannerRunner",
    "MigrationPlannerInput",
    "MigrationPlannerOutput",
    "MigrationPhase",
    # Sequencing Strategist
    "SequencingStrategistRunner",
    "SequencingStrategistInput",
    "SequencingStrategistOutput",
    "LaunchItem",
]
