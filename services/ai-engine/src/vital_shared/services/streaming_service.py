"""
Streaming Service Implementation

Implements IStreamingService for SSE formatting and streaming.
"""

import json
from typing import Dict, Any, AsyncGenerator, Optional
import structlog

from vital_shared.interfaces.streaming_service import IStreamingService

logger = structlog.get_logger()


class StreamingService(IStreamingService):
    """
    Production implementation of IStreamingService.
    
    Formats Server-Sent Events (SSE) for streaming responses.
    """
    
    def __init__(self):
        self.logger = logger.bind(service="StreamingService")
    
    def format_sse_event(
        self,
        event_type: str,
        data: Dict[str, Any]
    ) -> str:
        """
        Format data as SSE event.
        
        Args:
            event_type: Event type
            data: Event data
            
        Returns:
            SSE-formatted string
        """
        try:
            # SSE format: event: type\ndata: json\n\n
            json_data = json.dumps(data, ensure_ascii=False)
            return f"event: {event_type}\ndata: {json_data}\n\n"
            
        except Exception as e:
            self.logger.error("format_sse_failed", error=str(e))
            return self.create_error_event(f"Format error: {str(e)}")
    
    async def stream_response(
        self,
        generator: AsyncGenerator[Dict[str, Any], None]
    ) -> AsyncGenerator[str, None]:
        """
        Convert async generator to SSE stream.
        
        Args:
            generator: Source data generator
            
        Yields:
            SSE-formatted strings
        """
        try:
            async for data in generator:
                event_type = data.get("type", "message")
                yield self.format_sse_event(event_type, data)
                
        except Exception as e:
            self.logger.error("stream_failed", error=str(e))
            yield self.create_error_event(str(e))
    
    def create_error_event(
        self,
        error_message: str,
        error_code: Optional[str] = None
    ) -> str:
        """
        Create SSE error event.
        
        Args:
            error_message: Error description
            error_code: Optional error code
            
        Returns:
            SSE error event
        """
        data = {
            "error": error_message,
            "error_code": error_code
        }
        return self.format_sse_event("error", data)
    
    def create_completion_event(
        self,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create SSE completion event.
        
        Args:
            metadata: Optional metadata (tokens, cost, etc.)
            
        Returns:
            SSE completion event
        """
        data = metadata or {}
        data["completed"] = True
        return self.format_sse_event("completion", data)

