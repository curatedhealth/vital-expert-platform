"""
Transform backend SSE events to frontend-expected Anthropic-style format.

The frontend (React) expects events in Anthropic's streaming format:
- message_start, content_block_start, content_block_delta, content_block_stop, message_stop
- tool_use, tool_result
- source_found, artifact_created
- mission_started, task_started, task_progress, task_completed
- checkpoint_reached, checkpoint_resolved

The backend currently emits:
- thinking, token, sources, tool, done, status, step
"""

from typing import Dict, Any, List, Optional
import json
import uuid


class SSEEventTransformer:
    """
    Transform internal backend events to Anthropic-style SSE format
    that the frontend expects (message_start, content_block_delta, etc.)
    """

    def __init__(self, message_id: Optional[str] = None):
        self.message_id = message_id or f"msg_{uuid.uuid4().hex[:12]}"
        self.message_index = 0
        self.block_index = 0
        self.has_started = False

    def transform(self, event_type: str, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Transform a backend event to one or more frontend events.
        Returns list because some events expand to multiple frontend events.
        """
        # Normalize event type
        event_type = event_type.lower().replace("-", "_")

        transformer = getattr(self, f"_transform_{event_type}", None)
        if transformer:
            return transformer(data)

        # Pass through unknown events with some normalization
        return [{"event": event_type, "data": data}]

    def _transform_thinking(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'thinking' -> Frontend 'content_block_start' + 'content_block_delta' (thinking type)"""
        events = []

        if not self.has_started:
            # First thinking = message start + block start
            self.has_started = True
            events.append({
                "event": "message_start",
                "data": {
                    "type": "message_start",
                    "message_id": self.message_id
                }
            })
            events.append({
                "event": "content_block_start",
                "data": {
                    "type": "content_block_start",
                    "index": self.block_index,
                    "content_block": {"type": "thinking"}
                }
            })

        # Emit thinking delta
        thinking_content = data.get("content") or data.get("thinking") or data.get("text") or ""
        events.append({
            "event": "content_block_delta",
            "data": {
                "type": "content_block_delta",
                "index": self.block_index,
                "delta": {
                    "type": "thinking_delta",
                    "thinking": thinking_content
                }
            }
        })
        return events

    def _transform_token(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'token' -> Frontend 'content_block_delta' with text_delta"""
        events = []

        if not self.has_started:
            # First token = message start + block start
            self.has_started = True
            events.append({
                "event": "message_start",
                "data": {
                    "type": "message_start",
                    "message_id": self.message_id
                }
            })
            events.append({
                "event": "content_block_start",
                "data": {
                    "type": "content_block_start",
                    "index": self.block_index,
                    "content_block": {"type": "text"}
                }
            })

        text_content = data.get("token") or data.get("text") or data.get("content") or ""
        events.append({
            "event": "content_block_delta",
            "data": {
                "type": "content_block_delta",
                "index": self.block_index,
                "delta": {
                    "type": "text_delta",
                    "text": text_content
                }
            }
        })
        return events

    def _transform_text(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Alias for token transform"""
        return self._transform_token(data)

    def _transform_content(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Alias for token transform"""
        return self._transform_token(data)

    def _transform_tool(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'tool' -> Frontend 'tool_use' or 'tool_result'"""
        status = data.get("status", "").lower()
        tool_type = data.get("type", "").lower()

        if status == "started" or tool_type == "call" or status == "calling":
            return [{
                "event": "tool_use",
                "data": {
                    "type": "tool_use",
                    "tool_use_id": data.get("tool_id") or data.get("id") or f"tool_{uuid.uuid4().hex[:8]}",
                    "tool_name": data.get("tool_name") or data.get("name"),
                    "input": data.get("input") or data.get("parameters") or {}
                }
            }]
        else:  # completed, success, result
            return [{
                "event": "tool_result",
                "data": {
                    "type": "tool_result",
                    "tool_use_id": data.get("tool_id") or data.get("id"),
                    "result": data.get("result") or data.get("output"),
                    "success": data.get("success", True),
                    "duration_ms": data.get("duration_ms")
                }
            }]

    def _transform_tool_use(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Pass through tool_use events"""
        return [{"event": "tool_use", "data": data}]

    def _transform_tool_result(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Pass through tool_result events"""
        return [{"event": "tool_result", "data": data}]

    def _transform_sources(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'sources' -> Frontend multiple 'source_found' events"""
        events = []

        # Handle both array of sources and single source
        sources = data.get("sources", [])
        if not sources and isinstance(data, dict) and "title" in data:
            sources = [data]

        for i, source in enumerate(sources):
            events.append({
                "event": "source_found",
                "data": {
                    "source_id": source.get("id") or f"src_{uuid.uuid4().hex[:8]}",
                    "title": source.get("title"),
                    "url": source.get("url"),
                    "type": source.get("type", "document"),
                    "relevance_score": source.get("relevance_score") or source.get("score", 0.8),
                    "citation": source.get("citation")
                }
            })
        return events

    def _transform_rag_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'rag_results' -> Frontend 'rag_search_result'"""
        return [{
            "event": "rag_search_result",
            "data": {
                "query": data.get("query"),
                "results": data.get("results", []),
                "total_found": data.get("total_found", len(data.get("results", []))),
                "search_time_ms": data.get("search_time_ms")
            }
        }]

    def _transform_rag_search(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'rag_search' -> Frontend 'rag_search_start'"""
        return [{
            "event": "rag_search_start",
            "data": {
                "query": data.get("query"),
                "namespaces": data.get("namespaces", [])
            }
        }]

    def _transform_done(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'done' -> Frontend 'content_block_stop' + 'message_stop'"""
        return [
            {
                "event": "content_block_stop",
                "data": {
                    "type": "content_block_stop",
                    "index": self.block_index
                }
            },
            {
                "event": "message_stop",
                "data": {
                    "type": "message_stop",
                    "message_id": self.message_id,
                    "stop_reason": data.get("stop_reason", "end_turn")
                }
            }
        ]

    def _transform_complete(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Alias for done transform"""
        return self._transform_done(data)

    def _transform_finish(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Alias for done transform"""
        return self._transform_done(data)

    def _transform_status(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'status' -> Frontend 'mission_started' or task events"""
        status = data.get("status", "").lower()
        node = str(data.get("node", "")).lower()

        if status == "started" or "mission" in node:
            return [{
                "event": "mission_started",
                "data": {
                    "mission_id": data.get("mission_id"),
                    "template_id": data.get("template_id"),
                    "template_name": data.get("template_name"),
                    "estimated_duration_minutes": data.get("estimated_duration_minutes", 30)
                }
            }]
        elif status == "running":
            return [{
                "event": "task_started",
                "data": {
                    "task_id": data.get("current_task") or data.get("task_id"),
                    "task_name": data.get("task_name") or data.get("node", "Processing"),
                    "level": data.get("level", "L2")
                }
            }]
        elif status == "completed":
            return [{
                "event": "mission_completed",
                "data": {
                    "mission_id": data.get("mission_id"),
                    "outputs": data.get("outputs", {}),
                    "total_cost": data.get("total_cost", 0),
                    "total_tokens": data.get("total_tokens", 0),
                    "quality_score": data.get("quality_score")
                }
            }]
        elif status == "failed":
            return [{
                "event": "mission_failed",
                "data": {
                    "mission_id": data.get("mission_id"),
                    "error": data.get("error"),
                    "error_code": data.get("error_code")
                }
            }]

        # Pass through unknown status
        return [{"event": "status", "data": data}]

    def _transform_step(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Backend 'step' -> Frontend 'task_progress' or 'reasoning'"""
        step_type = str(data.get("type", "")).lower()

        if "reasoning" in data or "analysis" in step_type:
            return [{
                "event": "reasoning",
                "data": {
                    "step": data.get("step", 0),
                    "type": data.get("type", "analysis"),
                    "content": data.get("content") or data.get("message", ""),
                    "confidence": data.get("confidence")
                }
            }]

        return [{
            "event": "task_progress",
            "data": {
                "task_id": data.get("task_id"),
                "progress": data.get("progress", 50),
                "message": data.get("message") or data.get("content", "")
            }
        }]

    def _transform_checkpoint_reached(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Pass through checkpoint_reached events with normalization"""
        return [{
            "event": "checkpoint_reached",
            "data": {
                "checkpoint_id": data.get("checkpoint_id"),
                "checkpoint_name": data.get("checkpoint_name") or data.get("name"),
                "type": data.get("type", "approval"),
                "requires_approval": data.get("requires_approval", True),
                "description": data.get("description"),
                "context": data.get("context", {}),
                "options": data.get("options"),
                "timeout_seconds": data.get("timeout_seconds"),
                "auto_approve": data.get("auto_approve", False)
            }
        }]

    def _transform_error(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Pass through error events"""
        return [{
            "event": "error",
            "data": {
                "error": data.get("error") or data.get("message"),
                "error_code": data.get("error_code") or data.get("code"),
                "details": data.get("details")
            }
        }]

    def _transform_usage(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Transform usage/cost events"""
        return [{
            "event": "usage",
            "data": {
                "input_tokens": data.get("input_tokens", 0),
                "output_tokens": data.get("output_tokens", 0),
                "total_tokens": data.get("total_tokens", 0),
                "cost": data.get("cost")
            }
        }]

    def _transform_cost(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Transform cost events"""
        return [{
            "event": "cost",
            "data": {
                "cost": data.get("cost", 0),
                "model": data.get("model"),
                "tokens": data.get("tokens")
            }
        }]


def format_sse_event(event_name: str, data: Dict[str, Any]) -> str:
    """Format a single event as SSE text."""
    return f"event: {event_name}\ndata: {json.dumps(data)}\n\n"


def transform_and_format(
    event_type: str,
    data: Dict[str, Any],
    transformer: SSEEventTransformer
) -> str:
    """Transform backend event and format as SSE string."""
    transformed_events = transformer.transform(event_type, data)
    result = ""
    for evt in transformed_events:
        result += format_sse_event(evt["event"], evt["data"])
    return result
