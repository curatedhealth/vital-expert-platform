"""
Panel Autonomous Workflow - Dynamic Graph Builders

This module provides dynamic graph builders that generate LangGraph
structures based on YAML panel definitions. Each panel type gets
its own optimized graph topology.

Key Architecture:
- Graph structure is derived from YAML definitions
- No hardcoded panel-specific logic in graph code
- Turn-based execution for debate panels
- Parallel execution for consensus panels

Usage:
    from langgraph_workflows.panel_autonomous.graphs import (
        build_panel_graph,
        stream_panel_events,
    )

    # Build graph dynamically from YAML definition
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
"""

from .factory import (
    build_panel_graph,
    PanelGraphFactory,
    GraphTopology,
)

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

from .streaming import (
    stream_panel_events,
)

__all__ = [
    # Factory (main entry point)
    "build_panel_graph",
    "PanelGraphFactory",
    "GraphTopology",
    # Streaming
    "stream_panel_events",
    # Debate
    "build_debate_graph",
    "create_debate_initial_state",
    "DebateState",
    # Parallel
    "build_parallel_graph",
    "create_parallel_initial_state",
    "ParallelState",
]
