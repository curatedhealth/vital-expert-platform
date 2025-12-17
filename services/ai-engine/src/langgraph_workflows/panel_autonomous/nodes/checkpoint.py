"""
Panel Autonomous Workflow - Checkpoint Node

Handles HITL checkpoints for human approval.
"""

from typing import Any, Dict
import structlog

from ..state import PanelMissionState

logger = structlog.get_logger(__name__)


async def checkpoint_node(state: PanelMissionState) -> Dict[str, Any]:
    """
    Handle HITL checkpoint for human approval.

    In autonomous mode (without interrupt_before), this auto-approves and continues.
    The checkpoint info is logged and can be used for audit purposes.
    """
    checkpoint_resolved = state.get("checkpoint_resolution")

    if checkpoint_resolved:
        action = checkpoint_resolved.get("action", "approve")
        if action == "reject":
            return {
                "status": "failed",
                "error": "Panel rejected by user",
                "error_code": "USER_REJECTED",
            }
        elif action == "modify":
            # Go back to execute another round
            return {
                "status": "executing",
                "checkpoint_pending": False,
                "current_checkpoint": None,
                "checkpoint_resolution": None,
            }
        else:
            # Approved - continue to synthesis
            return {
                "status": "synthesizing",
                "checkpoint_pending": False,
                "current_checkpoint": None,
            }

    # Create checkpoint info for logging/audit
    round_consensus = state.get("round_consensus", [])
    final_consensus = round_consensus[-1] if round_consensus else {}
    consensus_score = final_consensus.get("consensus_score", 0) if final_consensus else 0

    checkpoint = {
        "id": f"cp_panel_{state.get('mission_id', 'unknown')}_{state.get('current_round', 0)}",
        "type": "approval",
        "title": "Panel Discussion Complete",
        "description": f"Consensus score: {consensus_score:.0%}. Auto-approved in autonomous mode.",
        "options": ["approve", "modify", "reject"],
        "consensus_score": consensus_score,
        "round_count": state.get("current_round", 0),
        "expert_count": state.get("expert_count", 0),
    }

    logger.info(
        "panel_checkpoint_auto_approved",
        checkpoint_id=checkpoint["id"],
        consensus_score=consensus_score,
        mode="autonomous",
    )

    # In autonomous mode, immediately approve and continue to synthesis
    return {
        "current_checkpoint": checkpoint,
        "checkpoint_pending": False,
        "status": "synthesizing",
    }
