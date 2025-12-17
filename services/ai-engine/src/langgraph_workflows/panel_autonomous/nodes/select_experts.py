"""
Panel Autonomous Workflow - Select Experts Node

Selects experts for the panel using Fusion Intelligence or provided list.
"""

from typing import Any, Dict
import structlog

from ..state import PanelMissionState
from ..config import get_panel_config

logger = structlog.get_logger(__name__)


async def select_experts_node(state: PanelMissionState) -> Dict[str, Any]:
    """
    Select experts for the panel.

    Uses provided experts if available, otherwise auto-selects using
    Fusion Intelligence.
    """
    existing_experts = state.get("selected_experts", [])
    panel_type = state.get("panel_type", "structured")
    config = get_panel_config(panel_type)

    # If enough experts already provided, use them
    if existing_experts and len(existing_experts) >= config.min_experts:
        logger.info(
            "panel_experts_provided",
            expert_count=len(existing_experts),
            selection_method="manual",
        )
        return {
            "selected_experts": existing_experts,
            "expert_count": len(existing_experts),
            "selection_method": "manual",
            "status": "executing",
        }

    # Auto-select experts using Fusion Intelligence
    goal = state.get("goal", "")
    tenant_id = state.get("tenant_id", "default")
    team = []

    try:
        from langgraph_workflows.modes34.agent_selector import (
            select_team_async,
            GRAPHRAG_AVAILABLE,
        )

        metadata = {
            "panel_type": panel_type,
            "context": state.get("context"),
        }

        team = await select_team_async(
            goal=goal,
            tenant_id=tenant_id,
            metadata=metadata,
            max_agents=config.default_expert_count,
            use_graphrag=GRAPHRAG_AVAILABLE,
        )

        logger.info(
            "panel_experts_selected_fusion",
            expert_count=len(team),
            selection_method="fusion" if GRAPHRAG_AVAILABLE else "hybrid",
            top_expert=team[0]["name"] if team else "None",
        )

    except Exception as exc:
        logger.error(
            "panel_expert_selection_failed",
            error=str(exc)[:200],
        )

    # If we have less than min_experts, fail explicitly - no fallbacks
    if len(team) < config.min_experts:
        raise ValueError(
            f"Insufficient experts selected: got {len(team)}, need at least {config.min_experts}. "
            f"Expert selection failed for panel type '{panel_type}'. "
            "Ensure agents are available in the database for selection."
        )

    return {
        "selected_experts": team,
        "expert_count": len(team),
        "selection_method": "fusion",
        "status": "executing",
    }
