"""
Panel Autonomous Workflow - Quality Gate Node

Assesses quality of panel output.
"""

from typing import Any, Dict
from datetime import datetime, timezone
import structlog

from ..state import PanelMissionState

logger = structlog.get_logger(__name__)


async def quality_gate_node(state: PanelMissionState) -> Dict[str, Any]:
    """
    Assess quality of panel output.

    Evaluates the final output based on content length,
    consensus score, and response count.
    """
    final_output = state.get("final_output", {})
    content = final_output.get("content", "") if final_output else ""
    round_consensus = state.get("round_consensus", [])
    consensus = round_consensus[-1] if round_consensus else {}

    # Quality scoring
    quality_score = 0.0
    recommendations = []

    # Check content length
    if len(content) > 500:
        quality_score += 0.3
    else:
        recommendations.append("Output is brief - consider more detailed analysis")

    # Check consensus
    consensus_score = consensus.get("consensus_score", 0) if consensus else 0
    if consensus_score >= 0.7:
        quality_score += 0.4
    elif consensus_score >= 0.5:
        quality_score += 0.2
        recommendations.append("Moderate consensus - review divergent points")
    else:
        recommendations.append("Low consensus - expert opinions significantly differ")

    # Check response count
    response_count = len(state.get("all_responses", []))
    if response_count >= 3:
        quality_score += 0.3
    else:
        recommendations.append("Limited expert input - consider more perspectives")

    quality_passed = quality_score >= 0.6

    logger.info(
        "panel_quality_gate_complete",
        quality_score=quality_score,
        passed=quality_passed,
        recommendations=len(recommendations),
    )

    return {
        "status": "completed",
    }
