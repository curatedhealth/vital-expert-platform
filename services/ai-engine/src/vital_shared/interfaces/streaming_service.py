"""
Streaming Service Interface

Defines the contract for Server-Sent Events (SSE) streaming.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator


class IStreamingService(ABC):
    """Interface for SSE streaming operations."""
    
    @abstractmethod
    def format_sse_event(
        self,
        event_type: str,
        data: Dict[str, Any]
    ) -> str:
        """
        Format data as SSE event.
        
        Args:
            event_type: Event type (content, reasoning, tool_suggestion, etc.)
            data: Event data dictionary
            
        Returns:
            Formatted SSE string
            
        Example:
            >>> service.format_sse_event("content", {"text": "Hello"})
            'event: content\\ndata: {"text":"Hello"}\\n\\n'
        """
        pass
    
    @abstractmethod
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
        pass
    
    @abstractmethod
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
        pass
    
    @abstractmethod
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
        pass

