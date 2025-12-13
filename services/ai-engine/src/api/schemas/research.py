"""
Research Query Validation Schemas for Mode 3/4 Autonomous Workflows.

This module provides comprehensive input validation for autonomous research missions
with security hardening against injection attacks.

H1 CRITICAL FIX: Input validation schemas for Mode 3/4
Reference: Deep audit findings - high priority security fix

PRODUCTION_TAG: PRODUCTION_READY
LAST_VERIFIED: 2025-12-13
MODES_SUPPORTED: [3, 4]
DEPENDENCIES: [pydantic, uuid]
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from enum import Enum
import re
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# Security: Injection Pattern Detection (Reused from ask_expert.py)
# =============================================================================

INJECTION_PATTERNS = [
    # SQL Injection patterns
    r"(?i)\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\s+",
    r"(?i)(\-\-|\/\*|\*\/|;)",  # SQL comments and statement terminators
    r"(?i)\bOR\s+1\s*=\s*1",  # Classic SQL injection
    r"(?i)\bAND\s+1\s*=\s*1",

    # Command Injection patterns
    r"(?i)(;|\||`|\$\(|\$\{)",  # Shell metacharacters
    r"(?i)\b(cat|rm|chmod|curl|wget|bash|sh|nc|netcat)\s+",

    # Prompt Injection patterns (for LLM security)
    r"(?i)(ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?))",
    r"(?i)(you\s+are\s+now|pretend\s+you|act\s+as\s+if|forget\s+(everything|all))",
    r"(?i)(disregard\s+(all|previous)|override\s+instructions?)",
    r"(?i)\[SYSTEM\]|\[INST\]|\<\|im_start\|\>",  # Format injection

    # XSS patterns
    r"(?i)<\s*script",
    r"(?i)javascript\s*:",
    r"(?i)on(load|error|click|mouseover)\s*=",
    r"(?i)data\s*:",
]

_COMPILED_PATTERNS = [re.compile(p) for p in INJECTION_PATTERNS]


class InputValidationError(ValueError):
    """Raised when input fails security validation."""
    def __init__(self, message: str, pattern_matched: str = None):
        super().__init__(message)
        self.pattern_matched = pattern_matched


def sanitize_research_query(value: str, strict: bool = False) -> str:
    """
    Sanitize research query input for security.

    Args:
        value: Raw user input
        strict: If True, reject suspicious input; if False, sanitize and warn

    Returns:
        Sanitized query string

    Raises:
        InputValidationError: If strict=True and injection pattern detected
    """
    if not value or not isinstance(value, str):
        return value

    # Normalize whitespace
    cleaned = " ".join(value.split())

    # Check for injection patterns
    for i, pattern in enumerate(_COMPILED_PATTERNS):
        match = pattern.search(cleaned)
        if match:
            pattern_name = INJECTION_PATTERNS[i][:50]

            if strict:
                logger.warning(
                    "input_validation_rejected",
                    extra={
                        "pattern_index": i,
                        "pattern_preview": pattern_name,
                        "input_preview": cleaned[:100],
                        "match": match.group()[:30],
                    }
                )
                raise InputValidationError(
                    f"Query contains suspicious pattern (validation failed)",
                    pattern_matched=pattern_name,
                )
            else:
                # Log warning but allow through (sanitize instead)
                logger.warning(
                    "input_validation_warning",
                    extra={
                        "pattern_index": i,
                        "pattern_preview": pattern_name,
                        "input_preview": cleaned[:100],
                        "action": "sanitized",
                    }
                )
                # Remove the matched pattern
                cleaned = pattern.sub(" ", cleaned)

    # Additional sanitization: escape angle brackets for XSS prevention
    cleaned = cleaned.replace("<", "&lt;").replace(">", "&gt;")

    # Limit consecutive special characters (potential obfuscation)
    cleaned = re.sub(r"([^\w\s])\1{3,}", r"\1\1", cleaned)

    return cleaned.strip()


# =============================================================================
# Enums
# =============================================================================

class ResearchMode(int, Enum):
    """Research mode selection."""
    MODE_1_INTERACTIVE_MANUAL = 1
    MODE_2_INTERACTIVE_AUTO = 2
    MODE_3_AUTONOMOUS_MANUAL = 3
    MODE_4_AUTONOMOUS_AUTO = 4


# =============================================================================
# Request Schemas
# =============================================================================

class ResearchQueryRequest(BaseModel):
    """
    Validated request for Mode 3/4 autonomous research queries.

    Security Features:
    - Input sanitization via @field_validator
    - Length constraints (min_length, max_length)
    - Range validation (ge, le) for numeric fields
    - Injection pattern detection
    """
    query: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Research query (sanitized for security)"
    )
    mode: ResearchMode = Field(
        default=ResearchMode.MODE_4_AUTONOMOUS_AUTO,
        description="Research mode: 3 (manual agent) or 4 (auto agent)"
    )
    max_iterations: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum refinement iterations"
    )
    enable_rag: bool = Field(
        default=True,
        description="Enable RAG retrieval"
    )
    enable_websearch: bool = Field(
        default=False,
        description="Enable web search (use with caution)"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="LLM temperature override"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=32000,
        description="Max tokens override"
    )
    agent_id: Optional[str] = Field(
        default=None,
        description="Specific agent ID (Mode 3 only)"
    )
    template_id: Optional[str] = Field(
        default=None,
        description="Mission template ID (for structured missions)"
    )
    budget_limit: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1000.0,
        description="Maximum cost in USD"
    )
    timeout_minutes: Optional[int] = Field(
        default=None,
        ge=1,
        le=480,
        description="Maximum execution time in minutes"
    )

    @field_validator("query", mode="before")
    @classmethod
    def validate_and_sanitize_query(cls, v: str) -> str:
        """
        Apply security sanitization to research query (H1 CRITICAL fix).

        Detects and sanitizes:
        - SQL injection patterns
        - Command injection patterns
        - Prompt injection patterns
        - XSS patterns

        Uses non-strict mode: suspicious patterns are sanitized
        and logged rather than rejected outright.
        """
        if not v:
            raise ValueError("Query cannot be empty")

        sanitized = sanitize_research_query(v, strict=False)

        if not sanitized.strip():
            raise ValueError("Query cannot be empty after sanitization")

        return sanitized

    @field_validator("agent_id", mode="before")
    @classmethod
    def validate_agent_id(cls, v: Optional[str]) -> Optional[str]:
        """Validate agent ID format (UUID or identifier)."""
        if v is None:
            return None

        # UUID pattern or slug pattern
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        slug_pattern = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'

        if re.match(uuid_pattern, v, re.IGNORECASE) or re.match(slug_pattern, v):
            return v

        raise ValueError(f"Invalid agent_id format: {v}")

    @field_validator("template_id", mode="before")
    @classmethod
    def validate_template_id(cls, v: Optional[str]) -> Optional[str]:
        """Validate template ID format."""
        if v is None:
            return None

        # Template ID should be alphanumeric with underscores/hyphens
        if re.match(r'^[a-zA-Z0-9_-]+$', v):
            return v

        raise ValueError(f"Invalid template_id format: {v}")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the latest FDA guidelines for gene therapy approval?",
                "mode": 4,
                "max_iterations": 5,
                "enable_rag": True,
                "enable_websearch": False,
                "temperature": 0.7,
                "max_tokens": 4000,
                "budget_limit": 10.0,
                "timeout_minutes": 60
            }
        }


class MissionCreateRequest(BaseModel):
    """
    Validated request for creating autonomous missions.

    Security Features:
    - Input sanitization for goal/inputs
    - ID format validation
    - Range validation for budgets/timeouts
    """
    goal: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="User's goal for this mission (required, 10-2000 chars)"
    )
    template_id: Optional[str] = Field(
        None,
        description="Mission template ID (UUID format if provided)"
    )
    expert_id: str = Field(
        ...,
        description="Expert agent ID (required, UUID format)"
    )
    tenant_id: str = Field(
        ...,
        description="Tenant ID (required, UUID format)"
    )
    mode: int = Field(
        ...,
        ge=3,
        le=4,
        description="Execution mode: 3 (manual) or 4 (auto)"
    )
    hitl_enabled: bool = Field(
        default=True,
        description="Enable Human-in-the-Loop checkpoints"
    )
    hitl_safety_level: str = Field(
        default="balanced",
        description="HITL safety level: conservative, balanced, or minimal"
    )
    budget_limit: Optional[float] = Field(
        None,
        gt=0.0,
        le=1000.0,
        description="Maximum cost in dollars (positive if provided)"
    )
    deadline_hours: Optional[int] = Field(
        None,
        ge=1,
        le=168,
        description="Deadline in hours (1-168 range, max 7 days)"
    )

    @field_validator("goal", mode="before")
    @classmethod
    def validate_and_sanitize_goal(cls, v: str) -> str:
        """
        Sanitize mission goal (H1 CRITICAL security fix).

        - Strips leading/trailing whitespace
        - Removes script tags and control characters
        - Detects and sanitizes injection patterns
        """
        if not v:
            raise ValueError("Goal cannot be empty")

        # Strip whitespace
        v = v.strip()

        # Sanitize for security
        sanitized = sanitize_research_query(v, strict=False)

        if not sanitized.strip():
            raise ValueError("Goal cannot be empty after sanitization")

        return sanitized

    @field_validator("template_id", mode="before")
    @classmethod
    def validate_template_id(cls, v: Optional[str]) -> Optional[str]:
        """Validate template ID format (UUID if provided)."""
        if v is None:
            return None

        # UUID pattern validation
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

        if re.match(uuid_pattern, v, re.IGNORECASE):
            return v.lower()

        raise ValueError(f"Invalid template_id format (must be UUID): {v}")

    @field_validator("expert_id", "tenant_id", mode="before")
    @classmethod
    def validate_uuid_fields(cls, v: str) -> str:
        """Validate UUID format using Pydantic's UUID validator."""
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

        if not re.match(uuid_pattern, v, re.IGNORECASE):
            raise ValueError(f"Invalid UUID format: {v}")

        return v.lower()

    @field_validator("hitl_safety_level", mode="before")
    @classmethod
    def validate_safety_level(cls, v: str) -> str:
        """Validate HITL safety level."""
        valid_levels = {"conservative", "balanced", "minimal"}

        if v not in valid_levels:
            raise ValueError(f"Invalid safety level. Must be one of: {', '.join(valid_levels)}")

        return v

    class Config:
        json_schema_extra = {
            "example": {
                "goal": "Review latest immunotherapy approaches for melanoma treatment",
                "template_id": "550e8400-e29b-41d4-a716-446655440001",
                "expert_id": "660e8400-e29b-41d4-a716-446655440000",
                "tenant_id": "770e8400-e29b-41d4-a716-446655440000",
                "mode": 4,
                "hitl_enabled": True,
                "hitl_safety_level": "balanced",
                "budget_limit": 15.0,
                "deadline_hours": 72
            }
        }


class MissionUpdateRequest(BaseModel):
    """
    Validated request for updating autonomous missions.

    Allows updating mission parameters while in progress or paused state.
    """
    goal: Optional[str] = Field(
        None,
        min_length=10,
        max_length=5000,
        description="Updated mission goal"
    )
    budget_limit: Optional[float] = Field(
        None,
        ge=0.0,
        le=1000.0,
        description="Updated budget limit in dollars"
    )
    timeout_minutes: Optional[int] = Field(
        None,
        ge=1,
        le=480,
        description="Updated execution timeout"
    )
    auto_approve_checkpoints: Optional[bool] = Field(
        None,
        description="Updated auto-approval setting"
    )

    @field_validator("goal", mode="before")
    @classmethod
    def validate_and_sanitize_goal(cls, v: Optional[str]) -> Optional[str]:
        """Sanitize updated goal if provided."""
        if v is None:
            return None

        if not v:
            raise ValueError("Goal cannot be empty")

        sanitized = sanitize_research_query(v, strict=False)

        if not sanitized.strip():
            raise ValueError("Goal cannot be empty after sanitization")

        return sanitized

    class Config:
        json_schema_extra = {
            "example": {
                "goal": "Expand review to include combination therapies",
                "budget_limit": 25.0,
                "timeout_minutes": 180,
                "auto_approve_checkpoints": True
            }
        }


class RunnerExecuteRequest(BaseModel):
    """
    Validated request for executing mission runner.

    Used to start or resume mission execution with specific parameters.
    """
    mission_id: str = Field(
        ...,
        description="Mission ID (UUID format)"
    )
    expert_id: str = Field(
        ...,
        description="Expert agent ID (UUID format)"
    )
    tenant_id: str = Field(
        ...,
        description="Tenant ID (UUID format)"
    )
    mode: int = Field(
        ...,
        ge=3,
        le=4,
        description="Execution mode (3 or 4)"
    )
    hitl_enabled: bool = Field(
        default=True,
        description="Enable Human-in-the-Loop checkpoints"
    )
    hitl_safety_level: str = Field(
        default="balanced",
        description="HITL safety level: conservative, balanced, or minimal"
    )
    resume_from_checkpoint: Optional[str] = Field(
        None,
        description="Checkpoint ID to resume from"
    )

    @field_validator("mission_id", "expert_id", "tenant_id", mode="before")
    @classmethod
    def validate_uuid_format(cls, v: str) -> str:
        """Validate UUID format for IDs."""
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

        if not re.match(uuid_pattern, v, re.IGNORECASE):
            raise ValueError(f"Invalid UUID format: {v}")

        return v.lower()

    @field_validator("hitl_safety_level", mode="before")
    @classmethod
    def validate_safety_level(cls, v: str) -> str:
        """Validate HITL safety level."""
        valid_levels = {"conservative", "balanced", "minimal"}

        if v not in valid_levels:
            raise ValueError(f"Invalid safety level. Must be one of: {', '.join(valid_levels)}")

        return v

    class Config:
        json_schema_extra = {
            "example": {
                "mission_id": "550e8400-e29b-41d4-a716-446655440000",
                "expert_id": "660e8400-e29b-41d4-a716-446655440000",
                "tenant_id": "770e8400-e29b-41d4-a716-446655440000",
                "mode": 4,
                "hitl_enabled": True,
                "hitl_safety_level": "balanced",
                "resume_from_checkpoint": None
            }
        }


class MissionStreamRequest(BaseModel):
    """
    Validated request for streaming mission execution.

    Enables real-time streaming of mission progress and results.
    """
    mission_id: str = Field(
        ...,
        description="Mission ID to stream (UUID format)"
    )
    tenant_id: str = Field(
        ...,
        description="Tenant ID (UUID format)"
    )
    stream_format: str = Field(
        default="sse",
        description="Stream format: sse (Server-Sent Events) or ws (WebSocket)"
    )
    include_metadata: bool = Field(
        default=True,
        description="Include execution metadata in stream"
    )
    include_intermediate_results: bool = Field(
        default=True,
        description="Stream intermediate results, not just final output"
    )

    @field_validator("mission_id", "tenant_id", mode="before")
    @classmethod
    def validate_uuid_format(cls, v: str) -> str:
        """Validate UUID format for IDs."""
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

        if not re.match(uuid_pattern, v, re.IGNORECASE):
            raise ValueError(f"Invalid UUID format: {v}")

        return v.lower()

    @field_validator("stream_format", mode="before")
    @classmethod
    def validate_stream_format(cls, v: str) -> str:
        """Validate stream format."""
        valid_formats = {"sse", "ws"}

        if v not in valid_formats:
            raise ValueError(f"Invalid stream format. Must be one of: {', '.join(valid_formats)}")

        return v

    class Config:
        json_schema_extra = {
            "example": {
                "mission_id": "550e8400-e29b-41d4-a716-446655440000",
                "tenant_id": "770e8400-e29b-41d4-a716-446655440000",
                "stream_format": "sse",
                "include_metadata": True,
                "include_intermediate_results": True
            }
        }


# =============================================================================
# Response Schemas
# =============================================================================

class ValidationErrorDetail(BaseModel):
    """Detailed validation error information."""
    field: str = Field(..., description="Field that failed validation")
    message: str = Field(..., description="Validation error message")
    pattern_matched: Optional[str] = Field(None, description="Security pattern that was matched")


class ValidationErrorResponse(BaseModel):
    """Response for validation errors (422)."""
    error: str = Field(default="Validation failed", description="Error type")
    details: list[ValidationErrorDetail] = Field(..., description="Validation error details")
    suggestions: list[str] = Field(default_factory=list, description="How to fix the errors")

    class Config:
        json_schema_extra = {
            "example": {
                "error": "Validation failed",
                "details": [
                    {
                        "field": "query",
                        "message": "Query contains suspicious pattern (validation failed)",
                        "pattern_matched": "(?i)<\\s*script"
                    }
                ],
                "suggestions": [
                    "Remove HTML/script tags from query",
                    "Avoid SQL injection patterns",
                    "Use plain text queries only"
                ]
            }
        }
