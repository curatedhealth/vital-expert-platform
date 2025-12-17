"""
Panel Autonomous Workflow - Graph Factory

Dynamically builds the appropriate LangGraph structure based on
the panel type YAML definition. No hardcoded panel logic.

Usage:
    from langgraph_workflows.panel_autonomous.graphs import build_panel_graph

    # Build graph from YAML definition
    graph, initial_state = build_panel_graph(
        panel_type="adversarial",
        mission_id="mission_123",
        goal="Should we adopt AI in healthcare?",
        experts=selected_experts,
    )

    # Execute
    async for event in graph.astream_events(initial_state):
        print(event)
"""

from typing import Any, Dict, List, Optional, Tuple, Union
from enum import Enum
import structlog

from langgraph.graph.state import CompiledStateGraph

from ..definitions import PanelDefinition, get_panel_definition_sync
from .debate import (
    build_debate_graph,
    create_debate_initial_state,
    DebateState,
)
from .parallel import (
    build_parallel_graph,
    create_parallel_initial_state,
    ParallelState,
)

logger = structlog.get_logger(__name__)


class GraphTopology(str, Enum):
    """Types of graph topologies derived from YAML config."""
    DEBATE = "debate"      # Turn-based with positions (adversarial)
    PARALLEL = "parallel"  # Concurrent execution (structured, open, delphi)
    SOCRATIC = "socratic"  # Question-driven (special case)


def _infer_topology(panel_def: PanelDefinition) -> GraphTopology:
    """
    Infer the graph topology from panel definition.

    Rules (derived from YAML config):
    - requires_positions=True → DEBATE topology
    - Panel type "socratic" → SOCRATIC topology (TODO: implement)
    - Otherwise → PARALLEL topology
    """
    if panel_def.config.requires_positions:
        return GraphTopology.DEBATE

    if panel_def.id == "socratic":
        # For now, use parallel. TODO: implement socratic graph
        return GraphTopology.PARALLEL

    return GraphTopology.PARALLEL


def _partition_experts_by_position(
    experts: List[Dict[str, Any]],
    panel_def: PanelDefinition,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Partition experts into positions based on panel definition.

    For adversarial panels with 5 experts:
    - 2 PRO, 2 CON, 1 MODERATOR (based on YAML position.expert_count)
    """
    positions = panel_def.positions
    if not positions:
        return {"all": experts}

    # Get target counts from YAML
    target_counts = {}
    for pos_id, pos_config in positions.items():
        target_counts[pos_id] = pos_config.expert_count

    # Partition experts
    result = {pos_id: [] for pos_id in positions}
    expert_index = 0

    # Fill positions in order defined in YAML
    for pos_id, count in target_counts.items():
        for _ in range(count):
            if expert_index < len(experts):
                expert = experts[expert_index].copy()
                expert["position"] = pos_id
                result[pos_id].append(expert)
                expert_index += 1

    # Log partition
    partition_summary = {k: len(v) for k, v in result.items()}
    logger.info(
        "experts_partitioned_by_position",
        total_experts=len(experts),
        partition=partition_summary,
    )

    return result


class PanelGraphFactory:
    """
    Factory for building panel graphs from YAML definitions.

    This class encapsulates the logic for:
    1. Loading the panel definition from YAML
    2. Inferring the appropriate graph topology
    3. Building the LangGraph StateGraph
    4. Creating the initial state
    """

    def __init__(self, panel_type: str, tenant_id: Optional[str] = None):
        self.panel_type = panel_type
        self.tenant_id = tenant_id
        self.panel_def = get_panel_definition_sync(panel_type)
        self.topology = _infer_topology(self.panel_def)

    def build(
        self,
        mission_id: str,
        goal: str,
        context: str = "",
        experts: List[Dict[str, Any]] = None,
        max_rounds: Optional[int] = None,
        consensus_threshold: Optional[float] = None,
    ) -> Tuple[CompiledStateGraph, Union[DebateState, ParallelState]]:
        """
        Build the graph and create initial state.

        Returns:
            Tuple of (compiled_graph, initial_state)
        """
        experts = experts or []

        # Use defaults from YAML if not provided
        if max_rounds is None:
            max_rounds = self.panel_def.config.default_rounds
        if consensus_threshold is None:
            consensus_threshold = self.panel_def.config.default_consensus_threshold

        if self.topology == GraphTopology.DEBATE:
            return self._build_debate(
                mission_id=mission_id,
                goal=goal,
                context=context,
                experts=experts,
                max_rounds=max_rounds,
            )
        else:
            return self._build_parallel(
                mission_id=mission_id,
                goal=goal,
                context=context,
                experts=experts,
                max_rounds=max_rounds,
                consensus_threshold=consensus_threshold,
            )

    def _build_debate(
        self,
        mission_id: str,
        goal: str,
        context: str,
        experts: List[Dict[str, Any]],
        max_rounds: int,
    ) -> Tuple[CompiledStateGraph, DebateState]:
        """Build debate graph with position-partitioned experts."""
        # Partition experts by position
        partitioned = _partition_experts_by_position(experts, self.panel_def)

        graph = build_debate_graph(self.panel_def)

        state = create_debate_initial_state(
            mission_id=mission_id,
            goal=goal,
            panel_type=self.panel_type,
            context=context,
            pro_experts=partitioned.get("pro", []),
            con_experts=partitioned.get("con", []),
            moderator_experts=partitioned.get("moderator", []),
            max_rounds=max_rounds,
            tenant_id=self.tenant_id,
        )

        logger.info(
            "debate_graph_built",
            panel_type=self.panel_type,
            pro_count=len(partitioned.get("pro", [])),
            con_count=len(partitioned.get("con", [])),
            moderator_count=len(partitioned.get("moderator", [])),
            max_rounds=max_rounds,
        )

        return graph, state

    def _build_parallel(
        self,
        mission_id: str,
        goal: str,
        context: str,
        experts: List[Dict[str, Any]],
        max_rounds: int,
        consensus_threshold: float,
    ) -> Tuple[CompiledStateGraph, ParallelState]:
        """Build parallel execution graph."""
        graph = build_parallel_graph(self.panel_def)

        state = create_parallel_initial_state(
            mission_id=mission_id,
            goal=goal,
            panel_type=self.panel_type,
            context=context,
            experts=experts,
            max_rounds=max_rounds,
            consensus_threshold=consensus_threshold,
            tenant_id=self.tenant_id,
        )

        logger.info(
            "parallel_graph_built",
            panel_type=self.panel_type,
            expert_count=len(experts),
            max_rounds=max_rounds,
            consensus_threshold=consensus_threshold,
        )

        return graph, state


# =============================================================================
# CONVENIENCE FUNCTION
# =============================================================================

def build_panel_graph(
    panel_type: str,
    mission_id: str,
    goal: str,
    context: str = "",
    experts: List[Dict[str, Any]] = None,
    max_rounds: Optional[int] = None,
    consensus_threshold: Optional[float] = None,
    tenant_id: Optional[str] = None,
) -> Tuple[CompiledStateGraph, Union[DebateState, ParallelState]]:
    """
    Build a panel graph from YAML definition.

    This is the main entry point for the panel graph system.

    Args:
        panel_type: Panel type ID from YAML (adversarial, structured, etc.)
        mission_id: Unique mission identifier
        goal: The question/goal for the panel
        context: Additional context for the panel
        experts: List of expert configurations
        max_rounds: Override for max rounds (uses YAML default if not provided)
        consensus_threshold: Override for consensus threshold
        tenant_id: Optional tenant ID for tenant-specific overrides

    Returns:
        Tuple of (compiled_graph, initial_state)

    Example:
        graph, state = build_panel_graph(
            panel_type="adversarial",
            mission_id="debate_123",
            goal="Should pharmaceutical companies be allowed to advertise directly to consumers?",
            experts=selected_experts,
        )

        async for event in graph.astream_events(state, version="v2"):
            if event["event"] == "on_chain_end":
                print(f"Node {event['name']} completed")
    """
    factory = PanelGraphFactory(panel_type, tenant_id)
    return factory.build(
        mission_id=mission_id,
        goal=goal,
        context=context,
        experts=experts,
        max_rounds=max_rounds,
        consensus_threshold=consensus_threshold,
    )
