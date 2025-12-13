# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [ask_expert_mode1_workflow, ask_expert_mode2_workflow, unified_interactive_workflow, modes34]
"""
VITAL Path AI Services - Ask Expert Workflows

Ask Expert 4-Mode Matrix (December 12, 2025 - Unified Architecture):

MODE ARCHITECTURE:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Mode │ Type        │ Agent Selection    │ Safety/HITL Nodes                     │
├──────┼─────────────┼────────────────────┼───────────────────────────────────────┤
│  1   │ Interactive │ MANUAL (user)      │ Basic flow ONLY                       │
│  2   │ Interactive │ AUTOMATIC (Fusion) │ Basic flow ONLY                       │
├──────┼─────────────┼────────────────────┼───────────────────────────────────────┤
│  3   │ Autonomous  │ MANUAL (user)      │ FULL: check_budget, self_correct,     │
│      │             │                    │ circuit_breaker, hitl_plan_approval,  │
│      │             │                    │ hitl_step_review                      │
│  4   │ Autonomous  │ AUTOMATIC (Fusion) │ FULL: check_budget, self_correct,     │
│      │             │                    │ circuit_breaker, hitl_plan_approval,  │
│      │             │                    │ hitl_step_review                      │
└─────────────────────────────────────────────────────────────────────────────────┘

KEY FACTS:
1. Mode 1 & Mode 2 are IDENTICAL except for agent selection method
2. Mode 3 & Mode 4 are IDENTICAL except for agent selection method
3. Safety Nodes belong to AUTONOMOUS modes (3 & 4) ONLY
4. Agent Selection is the ONLY differentiator within each mode pair

UNIFIED ARCHITECTURE:
- unified_interactive_workflow.py: Mode 1 & 2 (Interactive pair)
- unified_autonomous_workflow.py: Mode 3 & 4 (Autonomous pair)
"""

# Legacy imports (Mode 1 & 2 - still separate files for now)
from .ask_expert_mode1_workflow import AskExpertMode1Workflow
from .ask_expert_mode2_workflow import AskExpertMode2Workflow

# Unified workflows (Mode 1 & 2 - Interactive)
from .unified_interactive_workflow import (
    UnifiedInteractiveWorkflow,
    create_mode1_workflow,
    create_mode2_workflow,
    AgentSelectionStrategy,
    AgentSelector,
    AgentSelectionResult,
)

# Unified workflows (Mode 3 & 4 - Autonomous)
# Import from modes34 package which contains the production implementation
from langgraph_workflows.modes34.unified_autonomous_workflow import (
    build_master_graph as UnifiedAutonomousWorkflow,  # Alias for backward compatibility
    stream_mission_events,
    resume_mission_with_input,
    create_hitl_checkpoint_node,
)

# Factory functions for creating Mode 3/4 workflows
def create_mode3_workflow(**kwargs):
    """Create Mode 3 workflow (manual agent selection, autonomous execution)."""
    return build_master_graph

def create_mode4_workflow(**kwargs):
    """Create Mode 4 workflow (auto agent selection, autonomous execution)."""
    return build_master_graph

# Re-import build_master_graph for direct access
build_master_graph = UnifiedAutonomousWorkflow

# Unified agent selector (Mode 2 & Mode 4 automatic selection)
from .unified_agent_selector import (
    FusionSearchSelector,
    create_fusion_search_selector,
    get_default_selector,
    GRAPHRAG_AVAILABLE,
    HYBRID_SEARCH_AVAILABLE,
)

# Shared components
from .shared import (
    AskExpertStateFactory,
    ask_expert_process_input_node,
    ask_expert_rag_retriever_node,
    ask_expert_format_response_node,
    AskExpertStreamingMixin,
)

# DEPRECATED: These are aliased for backward compatibility
# Use create_mode3_workflow() and create_mode4_workflow() instead
AskExpertMode3Workflow = UnifiedAutonomousWorkflow  # Alias for compatibility
AskExpertMode4Workflow = UnifiedAutonomousWorkflow  # Alias for compatibility

__all__ = [
    # Legacy mode workflows (for backward compatibility)
    "AskExpertMode1Workflow",
    "AskExpertMode2Workflow",
    "AskExpertMode3Workflow",  # DEPRECATED - use create_mode3_workflow()
    "AskExpertMode4Workflow",  # DEPRECATED - use create_mode4_workflow()
    # Unified workflows (RECOMMENDED)
    "UnifiedInteractiveWorkflow",
    "UnifiedAutonomousWorkflow",
    "build_master_graph",  # Production Mode 3/4 workflow
    "create_mode1_workflow",
    "create_mode2_workflow",
    "create_mode3_workflow",
    "create_mode4_workflow",
    "AgentSelectionStrategy",
    # Mode 3/4 utilities (from modes34)
    "stream_mission_events",
    "resume_mission_with_input",
    "create_hitl_checkpoint_node",
    # Agent selection (Mode 2 & Mode 4)
    "AgentSelector",
    "AgentSelectionResult",
    "FusionSearchSelector",
    "create_fusion_search_selector",
    "get_default_selector",
    "GRAPHRAG_AVAILABLE",
    "HYBRID_SEARCH_AVAILABLE",
    # Shared components
    "AskExpertStateFactory",
    "ask_expert_process_input_node",
    "ask_expert_rag_retriever_node",
    "ask_expert_format_response_node",
    "AskExpertStreamingMixin",
]

# Mode registry for dynamic lookup
# Note: Mode 3 & 4 now use UnifiedAutonomousWorkflow
ASK_EXPERT_MODE_REGISTRY = {
    1: AskExpertMode1Workflow,
    2: AskExpertMode2Workflow,
    3: UnifiedAutonomousWorkflow,  # Use unified workflow
    4: UnifiedAutonomousWorkflow,  # Use unified workflow
    "mode1": AskExpertMode1Workflow,
    "mode2": AskExpertMode2Workflow,
    "mode3": UnifiedAutonomousWorkflow,
    "mode4": UnifiedAutonomousWorkflow,
    "manual_interactive": AskExpertMode1Workflow,
    "automatic_interactive": AskExpertMode2Workflow,
    "manual_autonomous": UnifiedAutonomousWorkflow,
    "automatic_autonomous": UnifiedAutonomousWorkflow,
}

# Factory registry for creating workflows with proper configuration
ASK_EXPERT_FACTORY_REGISTRY = {
    1: create_mode1_workflow,
    2: create_mode2_workflow,
    3: create_mode3_workflow,
    4: create_mode4_workflow,
    "mode1": create_mode1_workflow,
    "mode2": create_mode2_workflow,
    "mode3": create_mode3_workflow,
    "mode4": create_mode4_workflow,
}


def get_ask_expert_workflow(mode):
    """
    Get Ask Expert workflow class by mode.

    DEPRECATED for Mode 3/4: Use get_ask_expert_workflow_factory() instead
    to get properly configured workflow instances.

    Args:
        mode: Mode identifier (1-4, "mode1"-"mode4", or full name)

    Returns:
        Workflow class

    Raises:
        ValueError: If mode not found
    """
    workflow_class = ASK_EXPERT_MODE_REGISTRY.get(mode)
    if not workflow_class:
        raise ValueError(f"Unknown Ask Expert mode: {mode}")
    return workflow_class


def get_ask_expert_workflow_factory(mode):
    """
    Get Ask Expert workflow factory function by mode.

    RECOMMENDED: This returns a factory function that creates properly
    configured workflow instances with the correct agent selection strategy.

    Args:
        mode: Mode identifier (1-4 or "mode1"-"mode4")

    Returns:
        Factory function that creates workflow instances

    Raises:
        ValueError: If mode not found

    Example:
        factory = get_ask_expert_workflow_factory(3)
        workflow = factory(
            supabase_client=client,
            rag_service=rag,
            agent_orchestrator=orchestrator,
            hitl_service=hitl,
        )
    """
    factory = ASK_EXPERT_FACTORY_REGISTRY.get(mode)
    if not factory:
        raise ValueError(f"Unknown Ask Expert mode: {mode}")
    return factory
