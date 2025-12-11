"""
VITAL Path - Stream Manager

Handles Server-Sent Events (SSE) for real-time workflow updates.
Formats events for frontend consumption.
"""

import json
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional, AsyncGenerator
from enum import Enum

logger = logging.getLogger(__name__)


class SSEEventType(str, Enum):
    """Types of SSE events emitted during execution."""
    
    # Execution lifecycle
    EXECUTION_STARTED = "execution_started"
    EXECUTION_COMPLETED = "execution_completed"
    EXECUTION_FAILED = "execution_failed"
    EXECUTION_CANCELLED = "execution_cancelled"
    
    # Node events
    NODE_STARTED = "node_started"
    NODE_COMPLETED = "node_completed"
    NODE_FAILED = "node_failed"
    
    # Streaming events
    TOKEN_GENERATED = "token_generated"
    CHUNK_GENERATED = "chunk_generated"
    
    # Progress events
    PROGRESS_UPDATE = "progress_update"
    
    # Result events
    RESULT = "result"
    ERROR = "error"
    
    # Keep-alive
    HEARTBEAT = "heartbeat"


@dataclass
class SSEEvent:
    """Server-Sent Event structure."""
    
    event_type: SSEEventType
    data: Dict[str, Any]
    id: Optional[str] = None
    retry: Optional[int] = None
    
    def format(self) -> str:
        """
        Format event for SSE protocol.
        
        Returns:
            SSE-formatted string ready for streaming
        """
        lines = []
        
        if self.id:
            lines.append(f"id: {self.id}")
        
        lines.append(f"event: {self.event_type.value}")
        
        # Serialize data as JSON
        data_str = json.dumps(self.data, default=str)
        
        # SSE data field (handle multiline)
        for line in data_str.split("\n"):
            lines.append(f"data: {line}")
        
        if self.retry:
            lines.append(f"retry: {self.retry}")
        
        # SSE requires double newline to end event
        return "\n".join(lines) + "\n\n"


class StreamManager:
    """
    Manages SSE streaming for workflow execution.
    
    Responsibilities:
    - Format events for SSE protocol
    - Track event sequence
    - Handle heartbeat for connection keep-alive
    - Buffer events for replay
    
    Usage:
        manager = StreamManager()
        
        # Format an event
        formatted = manager.format_event({
            "type": "node_completed",
            "data": {"node_id": "expert_1", "output": "..."}
        })
        
        # Send heartbeat
        heartbeat = manager.create_heartbeat()
    """
    
    def __init__(
        self,
        retry_ms: int = 3000,
        buffer_size: int = 100,
    ):
        self.retry_ms = retry_ms
        self.buffer_size = buffer_size
        
        self._event_counter = 0
        self._event_buffer: list = []
    
    def format_event(
        self,
        event: Dict[str, Any],
        include_timestamp: bool = True,
    ) -> str:
        """
        Format an event dictionary for SSE streaming.
        
        Args:
            event: Dictionary with 'type' and 'data' keys
            include_timestamp: Whether to add timestamp to data
        
        Returns:
            SSE-formatted string
        """
        event_type = self._resolve_event_type(event.get("type", "progress_update"))
        data = event.get("data", event)
        
        # Add timestamp if requested
        if include_timestamp and isinstance(data, dict):
            data = {**data, "timestamp": datetime.utcnow().isoformat()}
        
        # Create SSE event
        self._event_counter += 1
        sse_event = SSEEvent(
            event_type=event_type,
            data=data,
            id=str(self._event_counter),
            retry=self.retry_ms,
        )
        
        # Buffer for replay
        self._add_to_buffer(sse_event)
        
        return sse_event.format()
    
    def create_heartbeat(self) -> str:
        """
        Create a heartbeat event for connection keep-alive.
        
        Returns:
            SSE-formatted heartbeat
        """
        event = SSEEvent(
            event_type=SSEEventType.HEARTBEAT,
            data={"timestamp": datetime.utcnow().isoformat()},
        )
        return event.format()
    
    def create_error_event(
        self,
        error: str,
        error_code: str = None,
        recoverable: bool = False,
    ) -> str:
        """
        Create an error event.
        
        Args:
            error: Error message
            error_code: Optional error code
            recoverable: Whether the error is recoverable
        
        Returns:
            SSE-formatted error event
        """
        self._event_counter += 1
        event = SSEEvent(
            event_type=SSEEventType.ERROR,
            data={
                "error": error,
                "error_code": error_code,
                "recoverable": recoverable,
                "timestamp": datetime.utcnow().isoformat(),
            },
            id=str(self._event_counter),
        )
        return event.format()
    
    def create_progress_event(
        self,
        current_step: int,
        total_steps: int = None,
        description: str = None,
        percent: float = None,
    ) -> str:
        """
        Create a progress update event.
        
        Args:
            current_step: Current step number
            total_steps: Total number of steps (optional)
            description: Description of current step
            percent: Completion percentage (0-100)
        
        Returns:
            SSE-formatted progress event
        """
        data = {
            "currentStep": current_step,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if total_steps is not None:
            data["totalSteps"] = total_steps
        
        if description:
            data["description"] = description
        
        if percent is not None:
            data["percentComplete"] = percent
        elif total_steps:
            data["percentComplete"] = (current_step / total_steps) * 100
        
        self._event_counter += 1
        event = SSEEvent(
            event_type=SSEEventType.PROGRESS_UPDATE,
            data=data,
            id=str(self._event_counter),
        )
        return event.format()
    
    def create_token_event(
        self,
        token: str,
        node_id: str = None,
        is_final: bool = False,
    ) -> str:
        """
        Create a token generation event for streaming LLM output.
        
        Args:
            token: The generated token/chunk
            node_id: ID of the node generating the token
            is_final: Whether this is the final token
        
        Returns:
            SSE-formatted token event
        """
        self._event_counter += 1
        event = SSEEvent(
            event_type=SSEEventType.TOKEN_GENERATED,
            data={
                "token": token,
                "node_id": node_id,
                "is_final": is_final,
            },
            id=str(self._event_counter),
        )
        return event.format()
    
    def get_buffered_events(self, since_id: int = 0) -> list:
        """
        Get buffered events since a specific ID.
        
        Useful for replay after reconnection.
        
        Args:
            since_id: Event ID to start from
        
        Returns:
            List of buffered events
        """
        return [
            e for e in self._event_buffer
            if e.id and int(e.id) > since_id
        ]
    
    def replay_events(self, since_id: int = 0) -> str:
        """
        Generate SSE stream of buffered events.
        
        Args:
            since_id: Event ID to start from
        
        Returns:
            Concatenated SSE events
        """
        events = self.get_buffered_events(since_id)
        return "".join(e.format() for e in events)
    
    def _resolve_event_type(self, type_str: str) -> SSEEventType:
        """Resolve string to SSEEventType enum."""
        try:
            return SSEEventType(type_str)
        except ValueError:
            # Map common variations
            mapping = {
                "started": SSEEventType.EXECUTION_STARTED,
                "completed": SSEEventType.EXECUTION_COMPLETED,
                "failed": SSEEventType.EXECUTION_FAILED,
                "cancelled": SSEEventType.EXECUTION_CANCELLED,
                "progress": SSEEventType.PROGRESS_UPDATE,
                "token": SSEEventType.TOKEN_GENERATED,
                "chunk": SSEEventType.CHUNK_GENERATED,
            }
            return mapping.get(type_str, SSEEventType.PROGRESS_UPDATE)
    
    def _add_to_buffer(self, event: SSEEvent) -> None:
        """Add event to buffer, maintaining size limit."""
        self._event_buffer.append(event)
        
        # Trim buffer if needed
        if len(self._event_buffer) > self.buffer_size:
            self._event_buffer = self._event_buffer[-self.buffer_size:]
    
    def clear_buffer(self) -> None:
        """Clear the event buffer."""
        self._event_buffer.clear()
        self._event_counter = 0






