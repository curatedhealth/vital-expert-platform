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
- mode1_interactive_auto_workflow: Mode 1 implementation
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

# Workflow implementations
from langgraph_workflows.mode1_interactive_auto_workflow import (
    Mode1InteractiveAutoWorkflow
)

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
    "Mode1InteractiveAutoWorkflow",
]

__version__ = "1.0.0"

