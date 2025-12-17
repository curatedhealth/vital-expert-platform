"""
Panel Autonomous Workflow - Execute Round Node

Executes a single round of expert responses using YAML-based panel definitions.
"""

from typing import Any, Dict, List
from datetime import datetime, timezone
from uuid import uuid4
import asyncio
import structlog

from ..state import PanelMissionState
from ..definitions import get_panel_definition_sync

logger = structlog.get_logger(__name__)


def _format_previous_responses(
    responses: List[Dict[str, Any]],
    panel_definition,
    current_position: str = None,
) -> str:
    """Format previous responses based on panel type configuration."""
    if not responses:
        return ""

    response_formatting = panel_definition.response_formatting or {}

    # For adversarial panels, group by position
    if panel_definition.config.requires_positions and response_formatting.get("group_by_position", False):
        pro_responses = []
        con_responses = []
        moderator_responses = []

        for resp in responses:
            position = resp.get("position", "").lower()
            content = resp.get("content", "")
            name = resp.get("expert_name", "Expert")

            if position == "pro":
                pro_responses.append(f"{name}: {content}")
            elif position == "con":
                con_responses.append(f"{name}: {content}")
            else:
                moderator_responses.append(f"{name}: {content}")

        parts = []

        # Show opposing side's arguments prominently for rebuttals
        opposing_label = response_formatting.get("label_arguments_section", "=== ARGUMENTS YOU MUST RESPOND TO ===")
        own_side_label = response_formatting.get("label_own_side_section", "=== YOUR SIDE'S PREVIOUS ARGUMENTS ===")

        if current_position == "pro":
            parts.append(f"\n\n{opposing_label} (CON/CRITIC POSITION)\n")
            if con_responses:
                for resp in con_responses:
                    parts.append(f"\n{resp}\n")
            else:
                parts.append("\n(No CON arguments yet)\n")

            parts.append(f"\n\n{own_side_label} (PRO/ADVOCATE)\n")
            if pro_responses:
                for resp in pro_responses:
                    parts.append(f"\n{resp}\n")

        elif current_position == "con":
            parts.append(f"\n\n{opposing_label} (PRO/ADVOCATE POSITION)\n")
            if pro_responses:
                for resp in pro_responses:
                    parts.append(f"\n{resp}\n")
            else:
                parts.append("\n(No PRO arguments yet)\n")

            parts.append(f"\n\n{own_side_label} (CON/CRITIC)\n")
            if con_responses:
                for resp in con_responses:
                    parts.append(f"\n{resp}\n")

        else:  # moderator
            parts.append("\n\n=== PRO/ADVOCATE ARGUMENTS ===\n")
            for resp in pro_responses:
                parts.append(f"\n{resp}\n")
            parts.append("\n\n=== CON/CRITIC ARGUMENTS ===\n")
            for resp in con_responses:
                parts.append(f"\n{resp}\n")

        return "".join(parts)

    # For Delphi panels, anonymize and show statistics
    if response_formatting.get("anonymize_responses", False):
        parts = ["\n\nANONYMOUS PREVIOUS ROUND RESPONSES:\n"]

        # Show vote statistics if available
        if response_formatting.get("show_vote_statistics", False):
            votes = [r.get("vote") for r in responses if r.get("vote") is not None]
            if votes:
                avg_vote = sum(votes) / len(votes)
                min_vote = min(votes)
                max_vote = max(votes)
                stats_format = response_formatting.get("statistics_format", "Average={avg}, Range={min}-{max}")
                stats = stats_format.format(avg=f"{avg_vote:.1f}", min=f"{min_vote:.1f}", max=f"{max_vote:.1f}")
                parts.append(f"\nVOTE STATISTICS: {stats}\n")

        for i, resp in enumerate(responses):
            content = resp.get("content", "")[:1500]
            if len(resp.get("content", "")) > 1500:
                content += "..."
            vote = resp.get("vote")
            confidence = resp.get("confidence", 0)

            parts.append(f"\n--- Expert {i + 1} ---")
            if vote is not None:
                parts.append(f"\nPosition Rating: {vote}/10")
            parts.append(f"\nConfidence: {confidence:.0%}")
            parts.append(f"\n{content}\n")

        return "".join(parts)

    # Default: standard formatting
    parts = ["\n\nPREVIOUS ROUND RESPONSES:\n"]
    for resp in responses:
        content = resp.get("content", "")[:2000]
        if len(resp.get("content", "")) > 2000:
            content += "..."
        parts.append(f"\n{resp.get('expert_name', 'Expert')}: {content}\n")

    return "".join(parts)


async def execute_round_node(state: PanelMissionState) -> Dict[str, Any]:
    """
    Execute a single round of expert responses.

    Uses YAML-based panel definitions for prompts and configuration.
    """
    current_round = state.get("current_round", 0)
    experts = state.get("selected_experts", [])
    goal = state.get("goal", "")
    context = state.get("context", "")
    panel_type = state.get("panel_type", "structured")
    all_responses = state.get("all_responses", [])
    round_responses = state.get("round_responses", [])
    tenant_id = state.get("tenant_id")

    logger.info(
        "panel_round_starting",
        round=current_round + 1,
        expert_count=len(experts),
        panel_type=panel_type,
    )

    # Load panel definition from YAML (with potential DB overrides)
    panel_definition = get_panel_definition_sync(panel_type)

    # Import LLM service
    try:
        from services.llm_service import get_llm_service
        llm_service = get_llm_service()
    except Exception:
        llm_service = None

    # Get previous responses for context
    prev_responses = []
    if current_round > 0 and round_responses:
        prev_responses = round_responses[-1] if round_responses else []

    async def get_expert_response(expert: Dict[str, Any], index: int) -> Dict[str, Any]:
        """Generate a response from a single expert."""
        expert_id = expert.get("id", str(uuid4()))
        expert_name = expert.get("name", "Expert")
        system_prompt = expert.get("system_prompt", "You are a helpful expert.")
        model = expert.get("model", "gpt-4-turbo")

        # Get position for this expert using panel definition
        position = panel_definition.get_position(index, len(experts))

        # Build context section
        context_section = f"CONTEXT: {context}" if context else ""

        # Format previous responses based on panel type
        previous_responses_section = _format_previous_responses(
            prev_responses,
            panel_definition,
            position,
        )

        # Get prompt from YAML definition
        prompt_template = panel_definition.get_prompt(
            position=position,
            round_number=current_round + 1,
        )

        # Fill in placeholders
        prompt = prompt_template.replace("{goal}", goal)
        prompt = prompt.replace("{context_section}", context_section)
        prompt = prompt.replace("{round_number}", str(current_round + 1))
        prompt = prompt.replace("{previous_responses_section}", previous_responses_section)
        prompt = prompt.replace("{previous_responses}", previous_responses_section)

        try:
            if not llm_service:
                raise RuntimeError("LLM service not available - cannot generate expert response")

            content = await llm_service.generate(
                prompt=f"{system_prompt}\n\n{prompt}",
                model=model,
                temperature=0.7,
                max_tokens=1500,
            )

            return {
                "expert_id": expert_id,
                "expert_name": expert_name,
                "content": content,
                "confidence": 0.8,
                "round": current_round + 1,
                "position": position,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "cost": 0.0,
            }

        except Exception as exc:
            logger.error(
                "panel_expert_response_failed",
                expert_name=expert_name,
                error=str(exc)[:100],
            )
            return {
                "expert_id": expert_id,
                "expert_name": expert_name,
                "content": f"Error generating response: {str(exc)[:100]}",
                "confidence": 0.0,
                "round": current_round + 1,
                "position": position,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "cost": 0.0,
            }

    # Execute all experts concurrently
    responses = await asyncio.gather(*[
        get_expert_response(expert, idx) for idx, expert in enumerate(experts)
    ])

    # Update state
    new_round_responses = list(round_responses) + [list(responses)]
    new_all_responses = list(all_responses) + list(responses)

    # Estimate cost
    cost_per_response = 0.03  # Approximate cost
    new_cost = state.get("current_cost", 0.0) + (len(responses) * cost_per_response)

    logger.info(
        "panel_round_complete",
        round=current_round + 1,
        response_count=len(responses),
        total_responses=len(new_all_responses),
    )

    return {
        "round_responses": new_round_responses,
        "all_responses": new_all_responses,
        "current_round": current_round + 1,
        "current_cost": new_cost,
        "status": "consensus",
    }
