"""
Panel Workflow Nodes Package
Each node type is in its own file for better organization
"""

from .base import PanelNode
from .initialize import InitializeNode
from .opening_statements import OpeningStatementsNode
from .discussion_round import DiscussionRoundNode
from .consensus_building import ConsensusBuildingNode
from .consensus_assessment import ConsensusAssessmentNode
from .qna import QANode
from .documentation import DocumentationNode
from .opening_round import OpeningRoundNode
from .free_dialogue import FreeDialogueNode
from .theme_clustering import ThemeClusteringNode
from .final_perspectives import FinalPerspectivesNode
from .synthesis import SynthesisNode

from typing import Dict, Type

# Node Registry
NODE_REGISTRY: Dict[str, Type[PanelNode]] = {
    "initialize": InitializeNode,
    "opening_statements": OpeningStatementsNode,
    "discussion_round": DiscussionRoundNode,
    "consensus_building": ConsensusBuildingNode,
    "consensus_assessment": ConsensusAssessmentNode,
    "qna": QANode,
    "documentation": DocumentationNode,
    "opening_round": OpeningRoundNode,
    "free_dialogue": FreeDialogueNode,
    "theme_clustering": ThemeClusteringNode,
    "final_perspectives": FinalPerspectivesNode,
    "synthesis": SynthesisNode,
}


def create_panel_node(
    node_type: str,
    node_id: str,
    config: Dict,
    task_executor,
    log_callback=None
) -> PanelNode:
    """Factory function to create a panel node instance"""
    from typing import Optional, Callable, Any
    from langgraph_gui.integration.panel_tasks import PanelTaskExecutor
    
    node_class = NODE_REGISTRY.get(node_type)
    if not node_class:
        raise ValueError(f"Unknown panel node type: {node_type}. Available types: {list(NODE_REGISTRY.keys())}")
    
    return node_class(node_id, config, task_executor, log_callback)


__all__ = [
    "PanelNode",
    "InitializeNode",
    "OpeningStatementsNode",
    "DiscussionRoundNode",
    "ConsensusBuildingNode",
    "ConsensusAssessmentNode",
    "QANode",
    "DocumentationNode",
    "OpeningRoundNode",
    "FreeDialogueNode",
    "ThemeClusteringNode",
    "FinalPerspectivesNode",
    "SynthesisNode",
    "NODE_REGISTRY",
    "create_panel_node",
]

