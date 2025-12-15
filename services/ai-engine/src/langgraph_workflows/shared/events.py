# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [json]
"""
Shared SSE event formatter for LangGraph missions (Modes 3/4).
"""

from __future__ import annotations

import json
from typing import Any, Dict


def sse_event(event: str, data: Dict[str, Any]) -> bytes:
    """Standard SSE event formatter."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n".encode("utf-8")


def plan_event(plan: list, confidence: float | None = None) -> bytes:
    return sse_event(
        "plan",
        {
            "plan": plan,
            "plan_confidence": confidence,
            "status": "planning",
            "message": "Plan ready",
        },
    )


def progress_event(
    step: str,
    step_number: int,
    total_steps: int,
    percentage: int,
    stage: str = "execution",
    message: str | None = None,
) -> bytes:
    return sse_event(
        "progress",
        {
            "step": step,
            "step_number": step_number,
            "currentStep": step_number,
            "total_steps": total_steps,
            "percentage": percentage,
            "status": "running" if percentage < 100 else "complete",
            "stage": stage,
            "message": message or "",
        },
    )


def thinking_event(step: str, content: str) -> bytes:
    return sse_event("thinking", {"step": step, "status": "running", "content": content})


def checkpoint_event(cp: Dict[str, Any]) -> bytes:
    return sse_event("checkpoint", cp)


# Step-to-artifact-type mapping for frontend compatibility
STEP_TO_ARTIFACT_TYPE = {
    'scope_definition': 'document',
    'research': 'raw_data',
    'literature_search': 'raw_data',
    'evidence_synthesis': 'summary',
    'competitive_analysis': 'raw_data',
    'synthesis': 'summary',
    'synthesis_report': 'document',
    'panel_review': 'summary',
    'final_synthesis': 'document',
    'query_decomposition': 'document',
}


def artifact_event(
    artifact_id: str,
    summary: str,
    artifact_path: str | None = None,
    citations: list | None = None,
    step: str | None = None,
    status: str = "completed",
    **extra_data,
) -> bytes:
    """
    Emit artifact event with proper type mapping for frontend.

    Maps workflow step names to frontend-expected artifact types.
    Falls back to 'other' for unknown steps.
    """
    # Map step to artifact type for frontend compatibility
    artifact_type = STEP_TO_ARTIFACT_TYPE.get(step or '', 'other')

    data = {
        "id": artifact_id,
        "type": artifact_type,  # Required by frontend
        "summary": summary,
        "artifactPath": artifact_path,
        "citations": citations or [],
        "step": step,  # Keep for debugging
        "status": status,
        **extra_data,
    }
    return sse_event("artifact", data)


def done_event(final: Dict[str, Any], artifacts: list) -> bytes:
    # Ensure all artifacts in done event have type field
    typed_artifacts = []
    for artifact in artifacts:
        if isinstance(artifact, dict):
            if 'type' not in artifact:
                step = artifact.get('step', '')
                artifact['type'] = STEP_TO_ARTIFACT_TYPE.get(step, 'other')
            typed_artifacts.append(artifact)
        else:
            typed_artifacts.append(artifact)

    return sse_event(
        "done",
        {
            "final": final,
            "artifacts": typed_artifacts,
            "status": "completed",
            "message": "Mission completed",
        },
    )


def tool_event(payload: Dict[str, Any]) -> bytes:
    return sse_event("tool_call", payload)


def sources_event(citations: list) -> bytes:
    return sse_event("sources", {"count": len(citations), "items": citations})


# --------------------------------------------------------------------------- New SSE events for frontend contract


def reasoning_event(
    content: str,
    agent_id: str | None = None,
    agent_level: int | None = None,
    step: str | None = None,
) -> bytes:
    """Emit reasoning content with agent context for Glass Box transparency."""
    return sse_event(
        "reasoning",
        {
            "content": content,
            "agentId": agent_id,
            "agentLevel": agent_level,
            "step": step,
        },
    )


def token_event(content: str, token_index: int = 0) -> bytes:
    """Emit streaming token for real-time text display."""
    return sse_event(
        "token",
        {
            "content": content,
            "tokenIndex": token_index,
            "status": "streaming",
        },
    )


def agent_selected_event(
    agent_id: str,
    name: str,
    reason: str | None = None,
    confidence: float | None = None,
    level: int | None = None,
    avatar_url: str | None = None,
) -> bytes:
    """Emit when an agent is selected for a task (Mode 2/3/4)."""
    return sse_event(
        "agent_selected",
        {
            "agentId": agent_id,
            "name": name,
            "reason": reason,
            "confidence": confidence,
            "level": level,
            "avatarUrl": avatar_url,
        },
    )


def delegation_event(
    from_agent: str,
    to_agent: str,
    task: str,
    from_level: int | None = None,
    to_level: int | None = None,
    context: Dict[str, Any] | None = None,
) -> bytes:
    """Emit when an agent delegates to another (L2->L3, L3->L4, etc.)."""
    return sse_event(
        "delegation",
        {
            "from": from_agent,
            "to": to_agent,
            "task": task,
            "fromLevel": from_level,
            "toLevel": to_level,
            "context": context or {},
        },
    )


def thinking_start_event(agent_id: str, step: str | None = None) -> bytes:
    """Emit when agent begins thinking/reasoning phase."""
    return sse_event(
        "thinking_start",
        {
            "agentId": agent_id,
            "step": step,
            "status": "thinking",
        },
    )


def thinking_end_event(agent_id: str, step: str | None = None) -> bytes:
    """Emit when agent completes thinking/reasoning phase."""
    return sse_event(
        "thinking_end",
        {
            "agentId": agent_id,
            "step": step,
            "status": "complete",
        },
    )


def hitl_checkpoint_event(
    checkpoint_id: str,
    checkpoint_type: str,
    title: str,
    description: str,
    options: list,
    timeout: int = 300,
    urgency: str = "medium",
    context: Dict[str, Any] | None = None,
) -> bytes:
    """
    Emit HITL checkpoint request matching frontend 5-type contract.

    Types: plan, tool, subagent, critical, final
    """
    return sse_event(
        "checkpoint",
        {
            "id": checkpoint_id,
            "type": checkpoint_type,
            "title": title,
            "description": description,
            "options": options,
            "timeout": timeout,
            "urgency": urgency,
            "context": context or {},
        },
    )
