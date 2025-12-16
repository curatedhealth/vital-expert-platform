# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# PURPOSE: Panel Autonomous Workflow - Mode 4 for Ask Panel
"""
Panel Autonomous Workflow Module

Provides LangGraph-based autonomous execution for Ask Panel with:
- Multi-expert parallel execution
- Iterative consensus building
- HITL checkpoints
- Quality gates and confidence scoring
"""

from .workflow import (
    build_panel_autonomous_graph,
    stream_panel_mission_events,
    PanelMissionState,
)

__all__ = [
    "build_panel_autonomous_graph",
    "stream_panel_mission_events",
    "PanelMissionState",
]
