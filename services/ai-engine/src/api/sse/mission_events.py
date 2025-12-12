"""
Mission Event Emitters for SSE Streaming.

This module provides helper functions to emit structured SSE events
during mission execution. Events are pushed to per-session queues
that the streaming endpoint consumes.
"""

from typing import Dict, Any, Optional, List, Tuple
import asyncio
import uuid
from datetime import datetime
import structlog

logger = structlog.get_logger()


# Global registry of mission queues: session_id -> asyncio.Queue
mission_queues: Dict[str, asyncio.Queue] = {}

# Global registry of stream ready events: session_id -> asyncio.Event
# Used to synchronize background execution with stream connection
stream_ready_events: Dict[str, asyncio.Event] = {}

# Buffer for early events (emitted before stream connects)
# session_id -> list of (event_type, data) tuples
early_event_buffers: Dict[str, List[Tuple[str, Dict[str, Any]]]] = {}


def get_or_create_queue(session_id: str) -> asyncio.Queue:
    """Get existing queue or create new one for session."""
    if session_id not in mission_queues:
        mission_queues[session_id] = asyncio.Queue()
    return mission_queues[session_id]


async def cleanup_queue(session_id: str, drain_timeout: float = 0.1) -> int:
    """
    Remove queue when session ends, properly draining remaining events.

    This prevents memory leaks by ensuring all queued events are consumed
    before the queue reference is deleted. Events may hold references to
    large objects (LLM responses, artifacts) that won't be GC'd otherwise.

    Args:
        session_id: The session identifier to clean up
        drain_timeout: Max time to wait for each drain operation (default 0.1s)

    Returns:
        Number of events drained from the queue
    """
    if session_id not in mission_queues:
        return 0

    queue = mission_queues[session_id]
    drained_count = 0

    # Drain the queue to release memory held by pending events
    while True:
        try:
            # Use get_nowait for non-blocking drain
            queue.get_nowait()
            drained_count += 1
        except asyncio.QueueEmpty:
            break

    # Remove the queue reference
    del mission_queues[session_id]

    return drained_count


def cleanup_queue_sync(session_id: str) -> int:
    """
    Synchronous version of cleanup_queue for use in non-async contexts.

    Note: Prefer cleanup_queue (async) when possible for proper event loop handling.
    """
    if session_id not in mission_queues:
        return 0

    queue = mission_queues[session_id]
    drained_count = 0

    while True:
        try:
            queue.get_nowait()
            drained_count += 1
        except asyncio.QueueEmpty:
            break

    del mission_queues[session_id]
    return drained_count


# ============================================================================
# Stream Synchronization (Race Condition Prevention)
# ============================================================================

def create_stream_ready_event(session_id: str) -> asyncio.Event:
    """
    Create a stream ready event for synchronization.

    Call this when creating a mission BEFORE starting the background task.
    The background task should await wait_for_stream_ready() before emitting.
    """
    if session_id not in stream_ready_events:
        stream_ready_events[session_id] = asyncio.Event()
        early_event_buffers[session_id] = []
    return stream_ready_events[session_id]


async def wait_for_stream_ready(session_id: str, timeout: float = 30.0) -> bool:
    """
    Wait for stream to be ready before emitting events.

    Called by background tasks to wait for client to connect.
    Returns True if stream became ready, False if timed out.

    Args:
        session_id: The session/mission identifier
        timeout: Max time to wait in seconds (default 30s)

    Returns:
        True if stream is ready, False if timed out
    """
    event = stream_ready_events.get(session_id)
    if not event:
        # No synchronization set up - proceed immediately
        return True

    try:
        await asyncio.wait_for(event.wait(), timeout=timeout)
        return True
    except asyncio.TimeoutError:
        logger.warning("stream_ready_timeout", session_id=session_id, timeout=timeout)
        return False


def signal_stream_ready(session_id: str) -> int:
    """
    Signal that stream is connected and ready to receive events.

    Called by the streaming endpoint after establishing connection.
    Flushes any buffered early events to the queue.

    Returns:
        Number of buffered events flushed
    """
    # Set the ready event
    event = stream_ready_events.get(session_id)
    if event:
        event.set()

    # Flush buffered events to the queue
    flushed_count = 0
    if session_id in early_event_buffers:
        queue = get_or_create_queue(session_id)
        for event_type, event_data in early_event_buffers[session_id]:
            event_dict = {
                "event": event_type,
                "data": {
                    **event_data,
                    "timestamp": event_data.get("timestamp", datetime.utcnow().isoformat())
                }
            }
            try:
                queue.put_nowait(event_dict)
                flushed_count += 1
            except asyncio.QueueFull:
                logger.warning("queue_full_during_flush", session_id=session_id)
                break

        # Clear the buffer
        early_event_buffers[session_id] = []

    logger.debug("stream_ready_signaled", session_id=session_id, flushed=flushed_count)
    return flushed_count


def is_stream_ready(session_id: str) -> bool:
    """Check if stream is ready without blocking."""
    event = stream_ready_events.get(session_id)
    return event is not None and event.is_set()


def cleanup_stream_sync(session_id: str) -> None:
    """Clean up stream synchronization state for a session."""
    if session_id in stream_ready_events:
        del stream_ready_events[session_id]
    if session_id in early_event_buffers:
        del early_event_buffers[session_id]


# ============================================================================
# Event Emission
# ============================================================================

async def emit_mission_event(
    session_id: str,
    event_type: str,
    data: Dict[str, Any],
    buffer_if_not_ready: bool = True
) -> None:
    """
    Emit a generic mission event to the session's queue.

    If stream is not yet ready and buffer_if_not_ready is True, the event
    is stored in an early buffer to be flushed when stream connects.

    Args:
        session_id: The session identifier
        event_type: The SSE event type (e.g., 'task_started', 'checkpoint_reached')
        data: The event payload
        buffer_if_not_ready: If True, buffer event when stream not connected (default True)
    """
    timestamp = datetime.utcnow().isoformat()
    event_data = {**data, "timestamp": timestamp}

    # If stream synchronization is active and stream not ready, buffer the event
    if buffer_if_not_ready and session_id in stream_ready_events and not is_stream_ready(session_id):
        if session_id not in early_event_buffers:
            early_event_buffers[session_id] = []
        early_event_buffers[session_id].append((event_type, event_data))
        logger.debug("event_buffered", session_id=session_id, event_type=event_type)
        return

    # Stream is ready or no sync required - emit directly
    queue = get_or_create_queue(session_id)
    event = {
        "event": event_type,
        "data": event_data
    }
    await queue.put(event)


async def emit_task_started(
    session_id: str,
    task_id: str,
    task_name: str,
    level: str = "L3",
    agent_id: Optional[str] = None,
    agent_name: Optional[str] = None,
    description: Optional[str] = None
) -> None:
    """Emit when a task begins execution."""
    await emit_mission_event(session_id, "task_started", {
        "task_id": task_id,
        "task_name": task_name,
        "level": level,
        "agent_id": agent_id,
        "agent_name": agent_name,
        "description": description
    })


async def emit_task_progress(
    session_id: str,
    task_id: str,
    progress: int,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """Emit task progress update (0-100%)."""
    await emit_mission_event(session_id, "task_progress", {
        "task_id": task_id,
        "progress": min(100, max(0, progress)),  # Clamp to 0-100
        "message": message,
        "details": details or {}
    })


async def emit_task_completed(
    session_id: str,
    task_id: str,
    result: Optional[Dict[str, Any]] = None,
    duration_ms: Optional[int] = None,
    tokens_used: Optional[int] = None,
    cost: Optional[float] = None
) -> None:
    """Emit when a task completes successfully."""
    await emit_mission_event(session_id, "task_completed", {
        "task_id": task_id,
        "result": result or {},
        "duration_ms": duration_ms,
        "tokens_used": tokens_used,
        "cost": cost
    })


async def emit_reasoning(
    session_id: str,
    step: int,
    reasoning_type: str,
    content: str,
    confidence: Optional[float] = None,
    evidence: Optional[List[str]] = None
) -> None:
    """Emit reasoning/thinking step for extended thinking display."""
    await emit_mission_event(session_id, "reasoning", {
        "step": step,
        "type": reasoning_type,  # e.g., 'analysis', 'synthesis', 'evaluation'
        "content": content,
        "confidence": confidence,
        "evidence": evidence or []
    })


async def emit_delegation(
    session_id: str,
    from_agent_id: str,
    from_agent_name: str,
    to_agent_id: str,
    to_agent_name: str,
    task_description: str,
    reason: str
) -> None:
    """Emit when one agent delegates to another."""
    await emit_mission_event(session_id, "delegation", {
        "from_agent": {
            "id": from_agent_id,
            "name": from_agent_name
        },
        "to_agent": {
            "id": to_agent_id,
            "name": to_agent_name
        },
        "task_description": task_description,
        "reason": reason
    })


async def emit_checkpoint_reached(
    session_id: str,
    checkpoint_id: str,
    checkpoint_name: str,
    checkpoint_type: str = "approval",
    requires_approval: bool = True,
    description: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None,
    options: Optional[List[Dict[str, str]]] = None,
    timeout_seconds: Optional[int] = None,
    auto_approve: bool = False
) -> None:
    """
    Emit when a HITL checkpoint is reached.

    Args:
        checkpoint_type: 'approval', 'review', 'decision', 'confirmation'
        options: List of {id, label, description} for decision checkpoints
    """
    await emit_mission_event(session_id, "checkpoint_reached", {
        "checkpoint_id": checkpoint_id or f"cp_{uuid.uuid4().hex[:8]}",
        "checkpoint_name": checkpoint_name,
        "type": checkpoint_type,
        "requires_approval": requires_approval,
        "description": description,
        "context": context or {},
        "options": options,
        "timeout_seconds": timeout_seconds,
        "auto_approve": auto_approve
    })


async def emit_artifact_created(
    session_id: str,
    artifact_id: str,
    artifact_type: str,
    title: str,
    content: Optional[str] = None,
    url: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """
    Emit when an artifact (document, chart, table) is created.

    Args:
        artifact_type: 'document', 'chart', 'table', 'code', 'image', 'pdf'
    """
    await emit_mission_event(session_id, "artifact_created", {
        "artifact_id": artifact_id or f"art_{uuid.uuid4().hex[:8]}",
        "type": artifact_type,
        "title": title,
        "content": content,
        "url": url,
        "metadata": metadata or {}
    })


async def emit_source_found(
    session_id: str,
    source_id: str,
    title: str,
    url: Optional[str] = None,
    source_type: str = "document",
    relevance_score: float = 0.8,
    citation: Optional[str] = None,
    snippet: Optional[str] = None
) -> None:
    """
    Emit when a relevant source is found during research.

    Args:
        source_type: 'document', 'web', 'database', 'api', 'knowledge_base'
    """
    await emit_mission_event(session_id, "source_found", {
        "source_id": source_id or f"src_{uuid.uuid4().hex[:8]}",
        "title": title,
        "url": url,
        "type": source_type,
        "relevance_score": relevance_score,
        "citation": citation,
        "snippet": snippet
    })


async def emit_quality_score(
    session_id: str,
    task_id: str,
    score: float,
    dimensions: Optional[Dict[str, float]] = None,
    feedback: Optional[str] = None
) -> None:
    """
    Emit quality assessment for a task output.

    Args:
        dimensions: e.g., {'accuracy': 0.9, 'completeness': 0.85, 'clarity': 0.95}
    """
    await emit_mission_event(session_id, "quality_score", {
        "task_id": task_id,
        "score": min(1.0, max(0.0, score)),  # Clamp to 0-1
        "dimensions": dimensions or {},
        "feedback": feedback
    })


async def emit_budget_warning(
    session_id: str,
    current_cost: float,
    budget_limit: float,
    warning_type: str = "approaching",
    message: Optional[str] = None
) -> None:
    """
    Emit budget warning during mission execution.

    Args:
        warning_type: 'approaching' (80%), 'exceeded', 'critical' (95%)
    """
    percentage = (current_cost / budget_limit * 100) if budget_limit > 0 else 0
    await emit_mission_event(session_id, "budget_warning", {
        "current_cost": current_cost,
        "budget_limit": budget_limit,
        "percentage_used": percentage,
        "warning_type": warning_type,
        "message": message or f"Budget {warning_type}: {percentage:.1f}% used"
    })


async def emit_mission_completed(
    session_id: str,
    mission_id: str,
    outputs: Optional[Dict[str, Any]] = None,
    artifacts: Optional[List[Dict[str, Any]]] = None,
    total_cost: float = 0.0,
    total_tokens: int = 0,
    duration_seconds: Optional[int] = None,
    quality_score: Optional[float] = None,
    summary: Optional[str] = None
) -> None:
    """Emit when mission completes successfully."""
    await emit_mission_event(session_id, "mission_completed", {
        "mission_id": mission_id,
        "status": "completed",
        "outputs": outputs or {},
        "artifacts": artifacts or [],
        "total_cost": total_cost,
        "total_tokens": total_tokens,
        "duration_seconds": duration_seconds,
        "quality_score": quality_score,
        "summary": summary
    })


async def emit_mission_failed(
    session_id: str,
    mission_id: str,
    error: str,
    error_code: Optional[str] = None,
    recoverable: bool = False,
    suggestion: Optional[str] = None,
    partial_outputs: Optional[Dict[str, Any]] = None
) -> None:
    """Emit when mission fails."""
    await emit_mission_event(session_id, "mission_failed", {
        "mission_id": mission_id,
        "status": "failed",
        "error": error,
        "error_code": error_code,
        "recoverable": recoverable,
        "suggestion": suggestion,
        "partial_outputs": partial_outputs or {}
    })


async def emit_mission_paused(
    session_id: str,
    mission_id: str,
    reason: str,
    checkpoint_id: Optional[str] = None,
    resume_instructions: Optional[str] = None
) -> None:
    """Emit when mission is paused (e.g., waiting for HITL)."""
    await emit_mission_event(session_id, "mission_paused", {
        "mission_id": mission_id,
        "status": "paused",
        "reason": reason,
        "checkpoint_id": checkpoint_id,
        "resume_instructions": resume_instructions
    })


async def emit_tool_use(
    session_id: str,
    tool_id: str,
    tool_name: str,
    input_params: Optional[Dict[str, Any]] = None
) -> None:
    """Emit when a tool is being invoked."""
    await emit_mission_event(session_id, "tool_use", {
        "tool_use_id": tool_id or f"tool_{uuid.uuid4().hex[:8]}",
        "tool_name": tool_name,
        "input": input_params or {}
    })


async def emit_tool_result(
    session_id: str,
    tool_id: str,
    result: Any,
    success: bool = True,
    duration_ms: Optional[int] = None,
    error: Optional[str] = None
) -> None:
    """Emit tool execution result."""
    await emit_mission_event(session_id, "tool_result", {
        "tool_use_id": tool_id,
        "result": result,
        "success": success,
        "duration_ms": duration_ms,
        "error": error
    })
