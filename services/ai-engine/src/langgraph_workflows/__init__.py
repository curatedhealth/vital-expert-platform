# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [state_schemas, checkpoint_manager, base_workflow, observability, ask_expert.*, modes34.*]
"""
LangGraph Workflows Package

Provides LangGraph-based workflows for VITAL Path AI Services.

Golden Rules Compliance:
- ✅ ALL workflows use LangGraph StateGraph
- ✅ Caching integrated into workflow nodes
- ✅ Tenant validation enforced in all workflows

Components:
- state_schemas: TypedDict state classes (NO Dict[str, Any])
- checkpoint_manager: State persistence
- base_workflow: Base class for all workflows
- observability: LangSmith integration and metrics
- ask_expert/: Mode 1-4 workflow implementations
"""

from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
    AgentType,
    create_initial_state,
    validate_state
)

from langgraph_workflows.checkpoint_manager import (
    CheckpointManager,
    initialize_checkpoint_manager,
    get_checkpoint_manager
)

from langgraph_workflows.base_workflow import (
    BaseWorkflow,
    create_node_with_error_handling,
    create_caching_wrapper
)

from langgraph_workflows.observability import (
    LangGraphObservability,
    initialize_observability,
    get_observability,
    trace_workflow,
    trace_node
)

# Workflow implementations - All modes use unified workflows now
from langgraph_workflows.ask_expert.unified_interactive_workflow import UnifiedInteractiveWorkflow
from langgraph_workflows.modes34.unified_autonomous_workflow import build_master_graph as UnifiedAutonomousWorkflow

# Backward compatibility aliases
AskExpertMode1Workflow = UnifiedInteractiveWorkflow
AskExpertMode2Workflow = UnifiedInteractiveWorkflow
AskExpertMode3Workflow = UnifiedAutonomousWorkflow
AskExpertMode4Workflow = UnifiedAutonomousWorkflow

__all__ = [
    # State schemas
    "UnifiedWorkflowState",
    "WorkflowMode",
    "ExecutionStatus",
    "AgentType",
    "create_initial_state",
    "validate_state",

    # Checkpoint management
    "CheckpointManager",
    "initialize_checkpoint_manager",
    "get_checkpoint_manager",

    # Base workflow
    "BaseWorkflow",
    "create_node_with_error_handling",
    "create_caching_wrapper",

    # Observability
    "LangGraphObservability",
    "initialize_observability",
    "get_observability",
    "trace_workflow",
    "trace_node",

    # Workflow implementations
    "AskExpertMode1Workflow",
    "AskExpertMode2Workflow",
    "AskExpertMode3Workflow",
    "AskExpertMode4Workflow",
]

__version__ = "1.0.0"
