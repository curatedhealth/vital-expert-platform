# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-17
# PURPOSE: Panel Autonomous Workflow - Mode 4 for Ask Panel
"""
Panel Autonomous Workflow Module

Provides LangGraph-based autonomous execution for Ask Panel with:
- Dynamic graph generation from YAML panel definitions
- Turn-based debate execution for adversarial panels
- Parallel execution for structured/open panels
- HITL checkpoints and quality gates

Architecture:
- definitions/: YAML-based panel definitions (source of truth)
  - panel_types/*.yaml: Panel type configs and prompts
  - loader.py: Loads YAML with DB override support
- graphs/: Dynamic graph builders
  - factory.py: Builds appropriate graph from YAML
  - debate.py: Turn-based debate graph (PRO → CON → MODERATOR)
  - parallel.py: Parallel execution graph
  - streaming.py: Rich event streaming
- state.py: Typed state definitions
- config.py: Runtime configuration (legacy)

NEW Usage (Recommended):
    from langgraph_workflows.panel_autonomous.graphs import (
        build_panel_graph,
        stream_panel_events,
    )

    # Build graph dynamically from YAML
    graph, state = build_panel_graph(
        panel_type="adversarial",
        mission_id="debate_123",
        goal="Should we adopt AI in healthcare?",
        experts=selected_experts,
    )

    # Stream events with rich debate context
    async for event in stream_panel_events(graph, state):
        if event["type"] == "rebuttal":
            print(f"{event['expert_name']} rebuts: {event['content'][:100]}...")

Legacy Usage (Deprecated):
    from langgraph_workflows.panel_autonomous import (
        build_panel_autonomous_graph,
        stream_panel_mission_events,
    )
"""

# State definitions
from .state import (
    PanelMissionState,
    PanelType,
    PanelMissionStatus,
    ExpertPosition,
    ExpertInfo,
    ExpertResponse,
    ConsensusResult,
    Checkpoint,
    FinalOutput,
    create_initial_state,
)

# Configuration
from .config import (
    PanelTypeEnum,
    PanelTypeConfig,
    PositionConfig,
    ModelCostConfig,
    PANEL_TYPE_CONFIGS,
    ADVERSARIAL_POSITIONS,
    MODEL_COSTS,
    get_panel_config,
    get_all_panel_types,
    get_position_config,
    get_model_cost_config,
)

# YAML-based definitions
from .definitions import (
    PanelDefinition,
    PanelDefinitionLoader,
    get_panel_definition,
    get_panel_definition_sync,
)

# Graph and streaming (legacy - use graphs/ module for new code)
from .graph import (
    build_panel_autonomous_graph,
    build_panel_autonomous_graph_legacy,
    stream_panel_mission_events,
)

# New dynamic graph system (recommended)
from .graphs import (
    build_panel_graph,
    stream_panel_events,
    PanelGraphFactory,
    GraphTopology,
    DebateState,
    ParallelState,
)

__all__ = [
    # State
    "PanelMissionState",
    "PanelType",
    "PanelMissionStatus",
    "ExpertPosition",
    "ExpertInfo",
    "ExpertResponse",
    "ConsensusResult",
    "Checkpoint",
    "FinalOutput",
    "create_initial_state",
    # Config
    "PanelTypeEnum",
    "PanelTypeConfig",
    "PositionConfig",
    "ModelCostConfig",
    "PANEL_TYPE_CONFIGS",
    "ADVERSARIAL_POSITIONS",
    "MODEL_COSTS",
    "get_panel_config",
    "get_all_panel_types",
    "get_position_config",
    "get_model_cost_config",
    # Definitions (YAML)
    "PanelDefinition",
    "PanelDefinitionLoader",
    "get_panel_definition",
    "get_panel_definition_sync",
    # New Graph System (recommended)
    "build_panel_graph",
    "stream_panel_events",
    "PanelGraphFactory",
    "GraphTopology",
    "DebateState",
    "ParallelState",
    # Legacy Graph (deprecated)
    "build_panel_autonomous_graph",
    "build_panel_autonomous_graph_legacy",
    "stream_panel_mission_events",
]
