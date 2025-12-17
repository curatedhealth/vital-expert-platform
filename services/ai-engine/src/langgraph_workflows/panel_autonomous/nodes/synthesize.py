"""
Panel Autonomous Workflow - Synthesize Node

Synthesizes all responses into final output.
"""

from typing import Any, Dict
from datetime import datetime, timezone
import structlog

from ..state import PanelMissionState

logger = structlog.get_logger(__name__)


async def synthesize_node(state: PanelMissionState) -> Dict[str, Any]:
    """
    Synthesize all responses into final output.

    Creates a comprehensive report from all expert responses
    and consensus analysis.
    """
    all_responses = state.get("all_responses", [])
    round_consensus = state.get("round_consensus", [])
    final_consensus = round_consensus[-1] if round_consensus else {}
    goal = state.get("goal", "")
    panel_type = state.get("panel_type", "structured")

    logger.info(
        "panel_synthesis_starting",
        response_count=len(all_responses),
        consensus_score=final_consensus.get("consensus_score", 0) if final_consensus else 0,
    )

    # Build comprehensive report
    report_sections = []

    # Executive Summary
    report_sections.append(f"# Panel Discussion Report: {goal[:100]}")
    report_sections.append("")
    report_sections.append("## Executive Summary")
    report_sections.append(f"**Panel Type:** {panel_type.title()}")
    report_sections.append(f"**Experts Consulted:** {state.get('expert_count', len(set(r.get('expert_id') for r in all_responses)))}")
    report_sections.append(f"**Rounds Completed:** {state.get('current_round', 0)}")

    if final_consensus:
        report_sections.append(f"**Consensus Score:** {final_consensus.get('consensus_score', 0):.0%}")
        report_sections.append(f"**Consensus Level:** {final_consensus.get('consensus_level', 'N/A')}")
    report_sections.append("")

    # Expert Responses
    report_sections.append("## Expert Perspectives")
    report_sections.append("")

    # Group by expert
    experts_seen = {}
    for response in all_responses:
        expert_name = response.get("expert_name", "Expert")
        if expert_name not in experts_seen:
            experts_seen[expert_name] = []
        experts_seen[expert_name].append(response)

    for expert_name, responses in experts_seen.items():
        report_sections.append(f"### {expert_name}")
        for resp in responses:
            position = resp.get("position")
            position_label = f" ({position.upper()})" if position else ""
            report_sections.append(f"**Round {resp.get('round', 1)}{position_label}:**")
            report_sections.append(resp.get("content", "No response"))
            report_sections.append(f"*Confidence: {resp.get('confidence', 0):.0%}*")
            report_sections.append("")

    # Consensus Analysis
    if final_consensus:
        report_sections.append("## Consensus Analysis")
        report_sections.append("")

        if final_consensus.get("agreement_points"):
            report_sections.append("### Areas of Agreement")
            for point in final_consensus.get("agreement_points", []):
                report_sections.append(f"- {point}")
            report_sections.append("")

        if final_consensus.get("divergent_points"):
            report_sections.append("### Areas of Divergence")
            for point in final_consensus.get("divergent_points", []):
                report_sections.append(f"- {point}")
            report_sections.append("")

        if final_consensus.get("key_themes"):
            report_sections.append("### Key Themes")
            for theme in final_consensus.get("key_themes", []):
                report_sections.append(f"- {theme}")
            report_sections.append("")

        if final_consensus.get("recommendation"):
            report_sections.append("### Recommendation")
            report_sections.append(final_consensus.get("recommendation", ""))
            report_sections.append("")

    content = "\n".join(report_sections)

    # Build final output
    final_output = {
        "content": content,
        "consensus": final_consensus,
        "expert_count": state.get("expert_count", 0),
        "round_count": state.get("current_round", 0),
        "responses": all_responses,
    }

    # Create artifact
    artifacts = list(state.get("artifacts", []))
    artifacts.append({
        "id": f"report_{state.get('mission_id', 'unknown')}",
        "type": "panel_report",
        "title": f"Panel Report: {goal[:50]}",
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    logger.info(
        "panel_synthesis_complete",
        content_length=len(content),
        artifact_count=len(artifacts),
    )

    return {
        "final_output": final_output,
        "synthesis_content": content,
        "artifacts": artifacts,
        "status": "quality_check",
    }
