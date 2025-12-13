# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: []
# PHASE: M8 MEDIUM Priority
"""
SSE Event Validation (M8 MEDIUM Priority Fix)

Provides validation for Server-Sent Events to ensure:
- Event format compliance (data:, event:, id: fields)
- Required fields per event type
- Timestamp and payload structure
- Protocol compatibility

This addresses M8: Response streaming SSE format validation
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Set
import structlog

logger = structlog.get_logger(__name__)


# =============================================================================
# Event Type Definitions
# =============================================================================


class SSEEventType(str, Enum):
    """Standard SSE event types for Ask Expert streaming."""
    TOKEN = "token"
    THINKING = "thinking"
    SOURCES = "sources"
    TOOL = "tool"
    CUSTOM = "custom"
    DONE = "done"
    ERROR = "error"


# Required fields per event type
REQUIRED_FIELDS: Dict[SSEEventType, Set[str]] = {
    SSEEventType.TOKEN: {"content", "tokens"},
    SSEEventType.THINKING: {"step", "status", "message"},
    SSEEventType.SOURCES: {"sources", "total"},
    SSEEventType.TOOL: {"tool", "status"},
    SSEEventType.CUSTOM: {"key", "value"},
    SSEEventType.DONE: {
        "agent_id", "agent_name", "content", "confidence",
        "sources", "reasoning", "metrics"
    },
    SSEEventType.ERROR: {"message", "code"},
}


# Optional fields per event type
OPTIONAL_FIELDS: Dict[SSEEventType, Set[str]] = {
    SSEEventType.TOKEN: {"metadata", "timestamp"},
    SSEEventType.THINKING: {"detail", "timestamp"},
    SSEEventType.SOURCES: {"timestamp"},
    SSEEventType.TOOL: {"input", "output", "error", "timestamp"},
    SSEEventType.CUSTOM: {"metadata", "timestamp"},
    SSEEventType.DONE: {"metadata", "citations", "response_source", "timestamp"},
    SSEEventType.ERROR: {"details", "timestamp"},
}


# =============================================================================
# Validation Results
# =============================================================================


@dataclass
class ValidationError:
    """Single validation error."""
    field: str
    message: str
    severity: str = "error"  # error, warning, info


@dataclass
class SSEValidationResult:
    """Result of SSE event validation."""
    valid: bool
    event_type: Optional[str] = None
    errors: List[ValidationError] = field(default_factory=list)
    warnings: List[ValidationError] = field(default_factory=list)
    raw_event: str = ""
    parsed_data: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "valid": self.valid,
            "event_type": self.event_type,
            "errors": [{"field": e.field, "message": e.message} for e in self.errors],
            "warnings": [{"field": w.field, "message": w.message} for w in self.warnings],
        }


@dataclass
class StreamValidationSummary:
    """Summary of validation for entire stream."""
    total_events: int = 0
    valid_events: int = 0
    invalid_events: int = 0
    event_type_counts: Dict[str, int] = field(default_factory=dict)
    errors_by_type: Dict[str, List[str]] = field(default_factory=dict)
    has_done_event: bool = False
    has_stream_end: bool = False

    @property
    def validation_rate(self) -> float:
        """Percentage of valid events."""
        if self.total_events == 0:
            return 1.0
        return self.valid_events / self.total_events

    @property
    def is_complete(self) -> bool:
        """Stream is complete if it has done event and stream end."""
        return self.has_done_event and self.has_stream_end

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_events": self.total_events,
            "valid_events": self.valid_events,
            "invalid_events": self.invalid_events,
            "validation_rate": round(self.validation_rate, 3),
            "event_type_counts": self.event_type_counts,
            "is_complete": self.is_complete,
            "errors_by_type": self.errors_by_type,
        }


# =============================================================================
# SSE Format Parser
# =============================================================================


def parse_sse_event(raw_event: str) -> Dict[str, Any]:
    """
    Parse raw SSE event string into structured data.

    Standard SSE format:
        event: token
        id: 1
        data: {"content": "Hello", "tokens": 1}

    Legacy format:
        data: {"event": "token", "content": "Hello", "tokens": 1}

    Args:
        raw_event: Raw SSE event string

    Returns:
        Dict with event_type, event_id, data keys
    """
    result = {
        "event_type": None,
        "event_id": None,
        "retry": None,
        "data": None,
        "is_stream_end": False,
    }

    lines = raw_event.strip().split("\n")

    for line in lines:
        if line.startswith("event:"):
            result["event_type"] = line[6:].strip()
        elif line.startswith("id:"):
            result["event_id"] = line[3:].strip()
        elif line.startswith("retry:"):
            try:
                result["retry"] = int(line[6:].strip())
            except ValueError:
                pass
        elif line.startswith("data:"):
            data_str = line[5:].strip()

            # Check for stream end marker
            if data_str == "[DONE]":
                result["is_stream_end"] = True
                continue

            # Parse JSON data
            try:
                data = json.loads(data_str)
                result["data"] = data

                # Handle legacy format where event type is in data
                if result["event_type"] is None and "event" in data:
                    result["event_type"] = data["event"]

            except json.JSONDecodeError:
                result["data"] = {"_raw": data_str, "_parse_error": True}

    return result


# =============================================================================
# Validation Functions
# =============================================================================


def validate_sse_event(
    raw_event: str,
    strict: bool = False,
) -> SSEValidationResult:
    """
    Validate a single SSE event.

    Args:
        raw_event: Raw SSE event string
        strict: If True, treat warnings as errors

    Returns:
        SSEValidationResult with validation status and errors
    """
    errors: List[ValidationError] = []
    warnings: List[ValidationError] = []

    # Parse the event
    parsed = parse_sse_event(raw_event)

    # Check for stream end marker (always valid)
    if parsed["is_stream_end"]:
        return SSEValidationResult(
            valid=True,
            event_type="[DONE]",
            raw_event=raw_event,
            parsed_data={"stream_end": True},
        )

    # Check for valid data
    if parsed["data"] is None:
        errors.append(ValidationError(
            field="data",
            message="SSE event must have a data field",
        ))
        return SSEValidationResult(
            valid=False,
            event_type=parsed["event_type"],
            errors=errors,
            raw_event=raw_event,
        )

    # Check for parse errors
    if isinstance(parsed["data"], dict) and parsed["data"].get("_parse_error"):
        errors.append(ValidationError(
            field="data",
            message="Data field is not valid JSON",
        ))
        return SSEValidationResult(
            valid=False,
            event_type=parsed["event_type"],
            errors=errors,
            raw_event=raw_event,
        )

    # Determine event type
    event_type_str = parsed["event_type"]
    if event_type_str is None:
        warnings.append(ValidationError(
            field="event",
            message="No explicit event type; defaulting to 'message'",
            severity="warning",
        ))
        event_type_str = "message"

    # Validate known event types
    try:
        event_type = SSEEventType(event_type_str)
        required = REQUIRED_FIELDS.get(event_type, set())
        optional = OPTIONAL_FIELDS.get(event_type, set())
        data = parsed["data"]

        # Check required fields
        for req_field in required:
            if req_field not in data:
                errors.append(ValidationError(
                    field=req_field,
                    message=f"Required field '{req_field}' missing for {event_type.value} event",
                ))

        # Check for unknown fields (warning only)
        known_fields = required | optional | {"event"}
        for data_field in data.keys():
            if data_field not in known_fields:
                warnings.append(ValidationError(
                    field=data_field,
                    message=f"Unknown field '{data_field}' in {event_type.value} event",
                    severity="warning",
                ))

        # Type-specific validation
        type_errors = _validate_event_type_specific(event_type, data)
        errors.extend(type_errors)

    except ValueError:
        # Unknown event type - warn but don't fail
        warnings.append(ValidationError(
            field="event",
            message=f"Unknown event type: {event_type_str}",
            severity="warning",
        ))

    # Determine validity
    is_valid = len(errors) == 0
    if strict and warnings:
        is_valid = False
        errors.extend(warnings)
        warnings = []

    return SSEValidationResult(
        valid=is_valid,
        event_type=event_type_str,
        errors=errors,
        warnings=warnings,
        raw_event=raw_event,
        parsed_data=parsed["data"],
    )


def _validate_event_type_specific(
    event_type: SSEEventType,
    data: Dict[str, Any],
) -> List[ValidationError]:
    """Validate type-specific constraints."""
    errors = []

    if event_type == SSEEventType.TOKEN:
        # tokens should be non-negative integer
        tokens = data.get("tokens")
        if tokens is not None and (not isinstance(tokens, int) or tokens < 0):
            errors.append(ValidationError(
                field="tokens",
                message="tokens must be a non-negative integer",
            ))

    elif event_type == SSEEventType.THINKING:
        # status should be one of: started, in_progress, completed
        status = data.get("status")
        valid_statuses = {"started", "in_progress", "completed", "error"}
        if status and status not in valid_statuses:
            errors.append(ValidationError(
                field="status",
                message=f"status should be one of: {valid_statuses}",
            ))

    elif event_type == SSEEventType.SOURCES:
        # sources should be a list
        sources = data.get("sources")
        if sources is not None and not isinstance(sources, list):
            errors.append(ValidationError(
                field="sources",
                message="sources must be a list",
            ))
        # total should match sources length
        total = data.get("total")
        if sources and total and total != len(sources):
            errors.append(ValidationError(
                field="total",
                message=f"total ({total}) doesn't match sources length ({len(sources)})",
            ))

    elif event_type == SSEEventType.DONE:
        # confidence should be 0-1
        confidence = data.get("confidence")
        if confidence is not None:
            if not isinstance(confidence, (int, float)):
                errors.append(ValidationError(
                    field="confidence",
                    message="confidence must be a number",
                ))
            elif not 0.0 <= confidence <= 1.0:
                errors.append(ValidationError(
                    field="confidence",
                    message="confidence must be between 0.0 and 1.0",
                ))

        # metrics should be a dict
        metrics = data.get("metrics")
        if metrics is not None and not isinstance(metrics, dict):
            errors.append(ValidationError(
                field="metrics",
                message="metrics must be a dictionary",
            ))

    elif event_type == SSEEventType.ERROR:
        # code should be uppercase with underscores
        code = data.get("code")
        if code and not re.match(r'^[A-Z][A-Z0-9_]*$', code):
            errors.append(ValidationError(
                field="code",
                message="error code should be UPPER_SNAKE_CASE",
            ))

    return errors


def validate_sse_stream(
    events: List[str],
    strict: bool = False,
) -> StreamValidationSummary:
    """
    Validate an entire SSE event stream.

    Args:
        events: List of raw SSE event strings
        strict: If True, treat warnings as errors

    Returns:
        StreamValidationSummary with overall validation results
    """
    summary = StreamValidationSummary()

    for raw_event in events:
        if not raw_event.strip():
            continue

        result = validate_sse_event(raw_event, strict=strict)
        summary.total_events += 1

        if result.valid:
            summary.valid_events += 1
        else:
            summary.invalid_events += 1
            event_type = result.event_type or "unknown"
            if event_type not in summary.errors_by_type:
                summary.errors_by_type[event_type] = []
            summary.errors_by_type[event_type].extend(
                [e.message for e in result.errors]
            )

        # Track event types
        event_type = result.event_type or "unknown"
        summary.event_type_counts[event_type] = (
            summary.event_type_counts.get(event_type, 0) + 1
        )

        # Check for completion markers
        if event_type == "done":
            summary.has_done_event = True
        if event_type == "[DONE]":
            summary.has_stream_end = True

    logger.info(
        "sse_stream_validated",
        total_events=summary.total_events,
        valid_events=summary.valid_events,
        validation_rate=summary.validation_rate,
        is_complete=summary.is_complete,
        phase="M8_streaming_validation",
    )

    return summary


# =============================================================================
# Convenience Functions
# =============================================================================


def is_valid_sse_event(raw_event: str) -> bool:
    """Quick check if an SSE event is valid."""
    result = validate_sse_event(raw_event)
    return result.valid


def get_event_type(raw_event: str) -> Optional[str]:
    """Extract event type from raw SSE event."""
    parsed = parse_sse_event(raw_event)
    return parsed["event_type"]


def get_event_data(raw_event: str) -> Optional[Dict[str, Any]]:
    """Extract data payload from raw SSE event."""
    parsed = parse_sse_event(raw_event)
    return parsed["data"]


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    # Types
    "SSEEventType",
    "ValidationError",
    "SSEValidationResult",
    "StreamValidationSummary",
    # Parsing
    "parse_sse_event",
    # Validation
    "validate_sse_event",
    "validate_sse_stream",
    # Convenience
    "is_valid_sse_event",
    "get_event_type",
    "get_event_data",
    # Constants
    "REQUIRED_FIELDS",
    "OPTIONAL_FIELDS",
]
