"""
VITAL Path AI Services - Ask Expert Workflows

Ask Expert 4-Mode Matrix:
- Mode 1: Manual Interactive (Expert Chat)
- Mode 2: Automatic Interactive (Smart Copilot)
- Mode 3: Manual Autonomous (Mission Control)
- Mode 4: Automatic Autonomous (Background Mission)

Naming Convention:
- Files: ask_expert_mode{N}_workflow.py
- Classes: AskExpertMode{N}Workflow
- Logs: ask_expert_mode{N}_{action}

Phase 1 Refactoring: Proper taxonomy implementation
"""

from .ask_expert_mode1_workflow import AskExpertMode1Workflow
from .ask_expert_mode2_workflow import AskExpertMode2Workflow
from .ask_expert_mode3_workflow import AskExpertMode3Workflow
from .ask_expert_mode4_workflow import AskExpertMode4Workflow

# Shared components
from .shared import (
    AskExpertStateFactory,
    ask_expert_process_input_node,
    ask_expert_rag_retriever_node,
    ask_expert_format_response_node,
    AskExpertStreamingMixin,
)

__all__ = [
    # Mode workflows
    "AskExpertMode1Workflow",
    "AskExpertMode2Workflow", 
    "AskExpertMode3Workflow",
    "AskExpertMode4Workflow",
    # Shared components
    "AskExpertStateFactory",
    "ask_expert_process_input_node",
    "ask_expert_rag_retriever_node",
    "ask_expert_format_response_node",
    "AskExpertStreamingMixin",
]

# Mode registry for dynamic lookup
ASK_EXPERT_MODE_REGISTRY = {
    1: AskExpertMode1Workflow,
    2: AskExpertMode2Workflow,
    3: AskExpertMode3Workflow,
    4: AskExpertMode4Workflow,
    "mode1": AskExpertMode1Workflow,
    "mode2": AskExpertMode2Workflow,
    "mode3": AskExpertMode3Workflow,
    "mode4": AskExpertMode4Workflow,
    "manual_interactive": AskExpertMode1Workflow,
    "automatic_interactive": AskExpertMode2Workflow,
    "manual_autonomous": AskExpertMode3Workflow,
    "automatic_autonomous": AskExpertMode4Workflow,
}


def get_ask_expert_workflow(mode):
    """
    Get Ask Expert workflow class by mode.
    
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
