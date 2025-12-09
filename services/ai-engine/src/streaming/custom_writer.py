"""
Custom Stream Writer - LangGraph get_stream_writer() integration.

Enables custom data streaming from within LangGraph nodes.
Supports progress updates, tool results, intermediate data, and more.

Based on: https://langchain-ai.github.io/langgraph/how-tos/streaming/#stream-custom-data

Usage in a node:
    from langgraph.config import get_stream_writer

    def my_node(state, config):
        writer = get_stream_writer(config)

        # Send custom data
        writer(("progress", {"step": 1, "message": "Processing..."}))

        # Do work...

        writer(("result", {"data": result}))

        return state
"""

from typing import Any, Callable, Dict, Optional, Tuple, Union
from dataclasses import dataclass
import structlog
import time

logger = structlog.get_logger()


@dataclass
class CustomStreamData:
    """
    Structured custom stream data.

    Provides type-safe custom streaming with validation.
    """
    key: str                          # Custom event type
    value: Any                        # Event payload
    metadata: Dict[str, Any] = None   # Optional metadata
    timestamp: float = None           # Auto-generated timestamp

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
        if self.metadata is None:
            self.metadata = {}

    def to_tuple(self) -> Tuple[str, Dict[str, Any]]:
        """Convert to tuple format for LangGraph stream writer."""
        return (self.key, {
            "value": self.value,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
        })

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict format."""
        return {
            "key": self.key,
            "value": self.value,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
        }


class CustomStreamWriter:
    """
    Wrapper around LangGraph's get_stream_writer() for structured custom streaming.

    Provides typed methods for common streaming patterns:
    - Progress updates
    - Tool execution results
    - Reasoning steps
    - Intermediate data
    - Metrics

    Example:
        def my_node(state, config):
            writer = CustomStreamWriter(config)

            writer.progress("Loading data", 0.1)
            # Do work...
            writer.progress("Processing", 0.5)
            # More work...
            writer.result({"key": "value"})

            return state
    """

    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize with LangGraph config.

        Args:
            config: LangGraph config dict (from node function parameter)
        """
        self._writer: Optional[Callable] = None
        self._events_sent = 0

        if config:
            try:
                from langgraph.config import get_stream_writer
                self._writer = get_stream_writer(config)
            except ImportError:
                logger.warning("langgraph_stream_writer_not_available")
            except Exception as e:
                logger.warning("stream_writer_init_failed", error=str(e))

    def _send(self, data: CustomStreamData) -> bool:
        """
        Send custom data via stream writer.

        Returns True if sent, False if writer not available.
        """
        if not self._writer:
            logger.debug("stream_writer_unavailable", key=data.key)
            return False

        try:
            self._writer(data.to_tuple())
            self._events_sent += 1
            return True
        except Exception as e:
            logger.warning("stream_write_failed", key=data.key, error=str(e))
            return False

    def progress(
        self,
        message: str,
        progress: float = 0.0,
        step: Optional[str] = None,
        total_steps: Optional[int] = None,
    ) -> bool:
        """
        Send progress update.

        Args:
            message: Progress message
            progress: Progress percentage (0.0 - 1.0)
            step: Current step name
            total_steps: Total number of steps

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(
            key="progress",
            value={
                "message": message,
                "progress": progress,
                "step": step,
                "total_steps": total_steps,
            }
        ))

    def thinking(
        self,
        step: str,
        message: str,
        detail: Optional[str] = None,
        status: str = "running",
    ) -> bool:
        """
        Send thinking/reasoning step.

        Args:
            step: Step identifier
            message: Step description
            detail: Additional detail
            status: Step status (running, completed, error)

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(
            key="thinking",
            value={
                "step": step,
                "message": message,
                "detail": detail,
                "status": status,
            }
        ))

    def tool_start(
        self,
        tool_name: str,
        input_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Signal tool execution start.

        Args:
            tool_name: Name of the tool being executed
            input_data: Tool input parameters

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(
            key="tool",
            value={
                "tool": tool_name,
                "status": "running",
                "input": input_data,
            }
        ))

    def tool_end(
        self,
        tool_name: str,
        output_data: Any = None,
        error: Optional[str] = None,
    ) -> bool:
        """
        Signal tool execution end.

        Args:
            tool_name: Name of the tool
            output_data: Tool output/result
            error: Error message if failed

        Returns:
            True if sent successfully
        """
        status = "error" if error else "completed"
        value = {
            "tool": tool_name,
            "status": status,
        }
        if output_data is not None:
            value["output"] = output_data
        if error:
            value["error"] = error

        return self._send(CustomStreamData(key="tool", value=value))

    def sources(
        self,
        sources: list,
        total: Optional[int] = None,
    ) -> bool:
        """
        Send retrieved sources/citations.

        Args:
            sources: List of source objects
            total: Total number of sources (may differ from len(sources) if truncated)

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(
            key="sources",
            value={
                "sources": sources,
                "total": total if total is not None else len(sources),
            }
        ))

    def result(
        self,
        data: Any,
        key: str = "result",
    ) -> bool:
        """
        Send result/intermediate data.

        Args:
            data: Result data
            key: Custom key (default: "result")

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(key=key, value=data))

    def metric(
        self,
        name: str,
        value: Union[int, float],
        unit: Optional[str] = None,
    ) -> bool:
        """
        Send a metric measurement.

        Args:
            name: Metric name
            value: Metric value
            unit: Optional unit (e.g., "ms", "tokens")

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(
            key="metric",
            value={
                "name": name,
                "value": value,
                "unit": unit,
            }
        ))

    def debug(
        self,
        message: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send debug information.

        Args:
            message: Debug message
            data: Debug data

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(
            key="debug",
            value={
                "message": message,
                "data": data,
            }
        ))

    def custom(
        self,
        key: str,
        value: Any,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send arbitrary custom data.

        Args:
            key: Custom event key
            value: Event value
            metadata: Optional metadata

        Returns:
            True if sent successfully
        """
        return self._send(CustomStreamData(key=key, value=value, metadata=metadata))

    @property
    def events_sent(self) -> int:
        """Number of events successfully sent."""
        return self._events_sent

    @property
    def is_available(self) -> bool:
        """Whether the stream writer is available."""
        return self._writer is not None


def create_custom_writer(config: Dict[str, Any] = None) -> CustomStreamWriter:
    """
    Factory function to create a CustomStreamWriter.

    Args:
        config: LangGraph config from node function

    Returns:
        CustomStreamWriter instance
    """
    return CustomStreamWriter(config)


# Convenience function for use in nodes without class instantiation
def write_custom_event(
    config: Dict[str, Any],
    key: str,
    value: Any,
    metadata: Optional[Dict[str, Any]] = None,
) -> bool:
    """
    Write a single custom event from within a node.

    Args:
        config: LangGraph config
        key: Event key
        value: Event value
        metadata: Optional metadata

    Returns:
        True if sent successfully
    """
    writer = CustomStreamWriter(config)
    return writer.custom(key, value, metadata)
