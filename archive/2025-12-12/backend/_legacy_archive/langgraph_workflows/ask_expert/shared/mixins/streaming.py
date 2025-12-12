"""
VITAL Path AI Services - Ask Expert Streaming Mixin

SSE streaming capabilities for Ask Expert Mode 1-4 workflows.

Naming Convention:
- Class: AskExpertStreamingMixin
- Methods: ask_expert_stream_{action}
- Logs: ask_expert_streaming_{action}
"""

from typing import AsyncIterator, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import json
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()


@dataclass
class AskExpertStreamEvent:
    """Ask Expert SSE event."""
    event_type: str
    data: Dict[str, Any]
    event_id: Optional[str] = None
    
    def to_sse(self) -> str:
        """Convert to SSE format."""
        parts = []
        if self.event_id:
            parts.append(f"id: {self.event_id}")
        parts.append(f"event: {self.event_type}")
        parts.append(f"data: {json.dumps(self.data)}")
        return "\n".join(parts) + "\n\n"


class AskExpertStreamingMixin:
    """
    SSE streaming mixin for Ask Expert workflows.
    
    Provides:
    - Token streaming
    - Reasoning step streaming (Mode 3/4)
    - HITL checkpoint streaming (Mode 3)
    - Progress streaming (Mode 4)
    """
    
    async def ask_expert_stream_tokens(
        self,
        state: UnifiedWorkflowState,
        llm_response: AsyncIterator[Any],
    ) -> AsyncIterator[AskExpertStreamEvent]:
        """Stream LLM tokens."""
        request_id = state.get("request_id", "unknown")
        mode = state.get("mode", "unknown")
        chunk_index = 0
        
        logger.info(
            "ask_expert_streaming_started",
            request_id=request_id,
            mode=str(mode),
        )
        
        try:
            async for chunk in llm_response:
                content = self._extract_content(chunk)
                if content:
                    yield AskExpertStreamEvent(
                        event_type="ask_expert_token",
                        data={
                            "content": content,
                            "chunk_index": chunk_index,
                            "mode": str(mode),
                        },
                        event_id=f"{request_id}_{chunk_index}",
                    )
                    chunk_index += 1
            
            yield AskExpertStreamEvent(
                event_type="ask_expert_done",
                data={
                    "total_chunks": chunk_index,
                    "mode": str(mode),
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
            
        except Exception as e:
            logger.error(
                "ask_expert_streaming_error",
                request_id=request_id,
                error=str(e),
            )
            yield AskExpertStreamEvent(
                event_type="ask_expert_error",
                data={
                    "error": str(e),
                    "mode": str(mode),
                },
            )
    
    async def ask_expert_stream_reasoning(
        self,
        step: Dict[str, Any],
        state: UnifiedWorkflowState,
    ) -> AskExpertStreamEvent:
        """Stream reasoning step (Mode 3/4)."""
        return AskExpertStreamEvent(
            event_type="ask_expert_reasoning",
            data={
                "step": step,
                "mode": str(state.get("mode", "unknown")),
                "iteration": state.get("goal_loop_iteration", 0),
            },
        )
    
    async def ask_expert_stream_checkpoint(
        self,
        checkpoint_type: str,
        state: UnifiedWorkflowState,
    ) -> AskExpertStreamEvent:
        """Stream HITL checkpoint (Mode 3)."""
        return AskExpertStreamEvent(
            event_type="ask_expert_checkpoint",
            data={
                "checkpoint_type": checkpoint_type,
                "mode": str(state.get("mode", "unknown")),
                "requires_approval": True,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )
    
    def _extract_content(self, chunk: Any) -> str:
        """Extract content from chunk."""
        if hasattr(chunk, "content"):
            return chunk.content
        if isinstance(chunk, dict):
            return chunk.get("content", "")
        if isinstance(chunk, str):
            return chunk
        return ""
