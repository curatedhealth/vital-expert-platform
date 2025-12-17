"""
Panel Autonomous Workflow - Plan Panel Node

Plans the panel discussion structure based on panel type.
"""

from typing import Any, Dict
import structlog

from ..state import PanelMissionState
from ..config import get_panel_config

logger = structlog.get_logger(__name__)


async def plan_panel_node(state: PanelMissionState) -> Dict[str, Any]:
    """
    Plan the panel discussion structure.

    Determines the number of rounds and other execution parameters
    based on panel type configuration.
    """
    panel_type = state.get("panel_type", "structured")
    goal = state.get("goal", "")

    # Get configuration for this panel type
    config = get_panel_config(panel_type)

    # Use user-provided max_rounds if available, otherwise default by panel type
    user_max_rounds = state.get("max_rounds")
    if user_max_rounds is not None:
        # Clamp to valid range
        max_rounds = max(config.min_rounds, min(user_max_rounds, config.max_rounds))
    else:
        max_rounds = config.default_rounds

    logger.info(
        "panel_mission_planned",
        panel_type=panel_type,
        max_rounds=max_rounds,
        user_specified=user_max_rounds is not None,
        goal_preview=goal[:100],
        default_expert_count=config.default_expert_count,
    )

    return {
        "max_rounds": max_rounds,
        "status": "selecting",
    }
