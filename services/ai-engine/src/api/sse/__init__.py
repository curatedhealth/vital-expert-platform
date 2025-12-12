"""
SSE Event Transformer Module

This module provides transformation utilities to convert backend SSE events
to the Anthropic-style format expected by the frontend.
"""

from .event_transformer import (
    SSEEventTransformer,
    format_sse_event,
    transform_and_format,
)
from .mission_events import (
    mission_queues,
    get_or_create_queue,
    cleanup_queue,
    cleanup_queue_sync,
    emit_mission_event,
    emit_task_started,
    emit_task_progress,
    emit_task_completed,
    emit_reasoning,
    emit_delegation,
    emit_checkpoint_reached,
    emit_artifact_created,
    emit_source_found,
    emit_quality_score,
    emit_budget_warning,
    emit_mission_completed,
    emit_mission_failed,
    emit_mission_paused,
    emit_tool_use,
    emit_tool_result,
    # Stream synchronization (race condition prevention)
    stream_ready_events,
    early_event_buffers,
    create_stream_ready_event,
    wait_for_stream_ready,
    signal_stream_ready,
    is_stream_ready,
    cleanup_stream_sync,
)

__all__ = [
    "SSEEventTransformer",
    "format_sse_event",
    "transform_and_format",
    "mission_queues",
    "get_or_create_queue",
    "cleanup_queue",
    "cleanup_queue_sync",
    "emit_mission_event",
    "emit_task_started",
    "emit_task_progress",
    "emit_task_completed",
    "emit_reasoning",
    "emit_delegation",
    "emit_checkpoint_reached",
    "emit_artifact_created",
    "emit_source_found",
    "emit_quality_score",
    "emit_budget_warning",
    "emit_mission_completed",
    "emit_mission_failed",
    "emit_mission_paused",
    "emit_tool_use",
    "emit_tool_result",
    # Stream synchronization (race condition prevention)
    "stream_ready_events",
    "early_event_buffers",
    "create_stream_ready_event",
    "wait_for_stream_ready",
    "signal_stream_ready",
    "is_stream_ready",
    "cleanup_stream_sync",
]
