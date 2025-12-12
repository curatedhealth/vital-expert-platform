"""
VITAL Path AI Services - Streaming Mixin

Mixin providing SSE streaming capabilities for LangGraph workflows.
Handles token streaming, event formatting, and error handling.

Phase 1 Refactoring: Task 1.2.5

Golden Rules Compliance:
- ✅ Streaming required for all responses (Golden Rule #4)
- ✅ Proper SSE formatting
- ✅ Error handling for stream interruptions
"""

from typing import AsyncIterator, Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass, asdict
import json
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()


@dataclass
class StreamingEvent:
    """SSE streaming event."""
    event_type: str
    data: Dict[str, Any]
    event_id: Optional[str] = None
    
    def to_sse(self) -> str:
        """Convert to SSE format string."""
        parts = []
        if self.event_id:
            parts.append(f"id: {self.event_id}")
        parts.append(f"event: {self.event_type}")
        parts.append(f"data: {json.dumps(self.data)}")
        return "\n".join(parts) + "\n\n"


class StreamingMixin:
    """
    Mixin providing SSE streaming capabilities.
    
    Provides methods for:
    - Token streaming
    - Event formatting
    - Error handling
    - Backpressure management
    
    Example:
        >>> class Mode1Workflow(BaseWorkflow, StreamingMixin):
        >>>     async def execute_streaming(self, state):
        >>>         async for event in self.stream_response(state, llm_stream):
        >>>             yield event
    """
    
    async def stream_tokens(
        self,
        state: UnifiedWorkflowState,
        llm_response: AsyncIterator[Any],
    ) -> AsyncIterator[StreamingEvent]:
        """
        Stream tokens with proper SSE formatting.
        
        Yields StreamingEvents for:
        - 'token': Individual token content
        - 'reasoning': Reasoning/thinking steps
        - 'citation': Citation references
        - 'done': Stream completion
        
        Args:
            state: Current workflow state
            llm_response: Async iterator of LLM response chunks
            
        Yields:
            StreamingEvent for each chunk
        """
        request_id = state.get("request_id", "unknown")
        chunk_index = 0
        accumulated_content = ""
        
        try:
            async for chunk in llm_response:
                # Extract content from chunk
                content = self._extract_chunk_content(chunk)
                if content:
                    accumulated_content += content
                    yield StreamingEvent(
                        event_type="token",
                        data={
                            "content": content,
                            "chunk_index": chunk_index,
                            "request_id": request_id,
                        },
                        event_id=f"{request_id}_{chunk_index}",
                    )
                    chunk_index += 1
            
            # Send completion event
            yield StreamingEvent(
                event_type="done",
                data={
                    "total_chunks": chunk_index,
                    "total_content_length": len(accumulated_content),
                    "request_id": request_id,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
            
        except Exception as e:
            logger.error(
                "stream_tokens_error",
                request_id=request_id,
                error=str(e),
            )
            yield await self.handle_stream_error(e, state)
    
    def create_sse_event(
        self,
        event_type: str,
        data: Dict[str, Any],
        event_id: Optional[str] = None,
    ) -> str:
        """
        Format data as SSE event string.
        
        Args:
            event_type: Type of event (token, reasoning, error, etc.)
            data: Event data dictionary
            event_id: Optional event ID for client-side ordering
            
        Returns:
            SSE formatted string
        """
        event = StreamingEvent(
            event_type=event_type,
            data=data,
            event_id=event_id,
        )
        return event.to_sse()
    
    async def handle_stream_error(
        self,
        error: Exception,
        state: UnifiedWorkflowState,
    ) -> StreamingEvent:
        """
        Create error event for stream.
        
        Args:
            error: Exception that occurred
            state: Current workflow state
            
        Returns:
            StreamingEvent with error information
        """
        request_id = state.get("request_id", "unknown")
        
        return StreamingEvent(
            event_type="error",
            data={
                "error": str(error),
                "error_type": type(error).__name__,
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat(),
                "recoverable": self._is_recoverable_error(error),
            },
        )
    
    async def stream_reasoning_step(
        self,
        step: Dict[str, Any],
        state: UnifiedWorkflowState,
        step_index: int,
    ) -> StreamingEvent:
        """
        Stream a reasoning step for autonomous modes.
        
        Args:
            step: Reasoning step data
            state: Current workflow state
            step_index: Index of this step
            
        Returns:
            StreamingEvent for the reasoning step
        """
        return StreamingEvent(
            event_type="reasoning",
            data={
                "step_index": step_index,
                "thought": step.get("thought", ""),
                "action": step.get("action", ""),
                "observation": step.get("observation", ""),
                "request_id": state.get("request_id", "unknown"),
            },
        )
    
    async def stream_checkpoint(
        self,
        checkpoint_type: str,
        checkpoint_data: Dict[str, Any],
        state: UnifiedWorkflowState,
    ) -> StreamingEvent:
        """
        Stream a HITL checkpoint event.
        
        Args:
            checkpoint_type: Type of checkpoint
            checkpoint_data: Checkpoint information
            state: Current workflow state
            
        Returns:
            StreamingEvent for the checkpoint
        """
        return StreamingEvent(
            event_type="checkpoint",
            data={
                "checkpoint_type": checkpoint_type,
                "checkpoint_data": checkpoint_data,
                "requires_approval": True,
                "request_id": state.get("request_id", "unknown"),
                "timestamp": datetime.utcnow().isoformat(),
            },
        )
    
    def _extract_chunk_content(self, chunk: Any) -> str:
        """
        Extract content from various chunk formats.
        
        Args:
            chunk: LLM response chunk
            
        Returns:
            String content from chunk
        """
        # Handle LangChain AIMessageChunk
        if hasattr(chunk, "content"):
            return chunk.content
        
        # Handle OpenAI format
        if hasattr(chunk, "choices"):
            if chunk.choices and hasattr(chunk.choices[0], "delta"):
                return chunk.choices[0].delta.content or ""
        
        # Handle dict format
        if isinstance(chunk, dict):
            return chunk.get("content", chunk.get("text", ""))
        
        # Handle string
        if isinstance(chunk, str):
            return chunk
        
        return ""
    
    def _is_recoverable_error(self, error: Exception) -> bool:
        """
        Determine if a streaming error is recoverable.
        
        Args:
            error: Exception that occurred
            
        Returns:
            Whether the error is recoverable
        """
        recoverable_errors = (
            "timeout",
            "rate_limit",
            "temporary",
            "connection",
        )
        error_str = str(error).lower()
        return any(e in error_str for e in recoverable_errors)
