"""
Panel Autonomous Workflow - Build Consensus Node

Analyzes expert responses and builds consensus metrics.
"""

from typing import Any, Dict
import structlog

from ..state import PanelMissionState, ConsensusResult

logger = structlog.get_logger(__name__)


async def build_consensus_node(state: PanelMissionState) -> Dict[str, Any]:
    """
    Analyze responses and build consensus.

    Uses the consensus analyzer service to evaluate agreement
    among expert responses.
    """
    current_round = state.get("current_round", 0)
    round_responses = state.get("round_responses", [])
    max_rounds = state.get("max_rounds", 3)
    round_consensus_list = state.get("round_consensus", [])
    consensus_threshold = state.get("consensus_threshold", 0.7)

    if not round_responses or current_round == 0:
        return {"status": "executing"}

    # Get latest round responses
    latest_responses = round_responses[-1] if round_responses else []

    if not latest_responses:
        return {"status": "executing"}

    # Build consensus analysis
    try:
        from services.consensus_analyzer import create_consensus_analyzer
        from services.llm_service import get_llm_service

        llm_service = get_llm_service()
        analyzer = create_consensus_analyzer(llm_service)

        response_dicts = [
            {
                "agent_name": r.get("expert_name"),
                "content": r.get("content"),
                "confidence": r.get("confidence", 0.7),
            }
            for r in latest_responses
        ]

        consensus = await analyzer.analyze_consensus(
            state.get("goal", ""),
            response_dicts,
        )

        consensus_result = {
            "consensus_score": consensus.consensus_score,
            "consensus_level": consensus.consensus_level,
            "agreement_points": consensus.agreement_points[:5],
            "divergent_points": consensus.divergent_points[:5],
            "key_themes": consensus.key_themes[:5],
            "recommendation": consensus.recommendation,
        }

    except Exception as exc:
        logger.error(
            "panel_consensus_analysis_failed",
            error=str(exc)[:200],
        )
        raise RuntimeError(
            f"Consensus analysis failed: {str(exc)[:200]}. "
            "Ensure LLM service and consensus analyzer are available."
        )

    # Update consensus list
    new_round_consensus = list(round_consensus_list) + [consensus_result]

    logger.info(
        "panel_consensus_complete",
        round=current_round,
        consensus_score=consensus_result.get("consensus_score", 0),
        consensus_level=consensus_result.get("consensus_level", "unknown"),
    )

    # Determine next step
    consensus_met = consensus_result.get("consensus_score", 0) >= consensus_threshold
    more_rounds = current_round < max_rounds

    if consensus_met or not more_rounds:
        # Consensus achieved or max rounds reached
        next_status = "checkpoint"
    else:
        # Need more rounds
        next_status = "executing"

    return {
        "round_consensus": new_round_consensus,
        "status": next_status,
    }
