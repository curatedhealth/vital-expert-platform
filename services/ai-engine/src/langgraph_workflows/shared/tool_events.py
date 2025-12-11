from __future__ import annotations

from typing import Any, Dict
import json


def tool_event_payload(
    *,
    tool_id: str,
    tool_name: str,
    tool_type: str,
    status: str,
    input_data: Dict[str, Any] | None = None,
    output_data: Any = None,
    duration_ms: int | None = None,
    error: str | None = None,
) -> Dict[str, Any]:
    return {
        "id": tool_id,
        "tool_id": tool_id,
        "tool_name": tool_name,
        "tool_type": tool_type,
        "status": status,
        "input": input_data,
        "output": output_data,
        "duration_ms": duration_ms,
        "error": error,
    }


def sse_tool_event(payload: Dict[str, Any]) -> bytes:
    return f"event: tool_call\ndata: {json.dumps(payload)}\n\n".encode("utf-8")
