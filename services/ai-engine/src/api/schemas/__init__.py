"""
API Schema Exports.

This module exports all Pydantic validation schemas for API endpoints.

PRODUCTION_TAG: PRODUCTION_READY
LAST_VERIFIED: 2025-12-13
"""

# Research/Mission schemas (Mode 3/4)
from .research import (
    # Request schemas
    ResearchQueryRequest,
    MissionCreateRequest,
    MissionUpdateRequest,
    RunnerExecuteRequest,
    MissionStreamRequest,

    # Response schemas
    ValidationErrorDetail,
    ValidationErrorResponse,

    # Enums
    ResearchMode,

    # Utilities
    InputValidationError,
    sanitize_research_query,
)

# TODO: Add Ask Expert schemas when available
# from .ask_expert import AskExpertRequest, AskExpertResponse

# TODO: Add mode-specific schemas when available
# from .modes import Mode1Request, Mode2Request

__all__ = [
    # Research schemas
    "ResearchQueryRequest",
    "MissionCreateRequest",
    "MissionUpdateRequest",
    "RunnerExecuteRequest",
    "MissionStreamRequest",
    "ValidationErrorDetail",
    "ValidationErrorResponse",
    "ResearchMode",
    "InputValidationError",
    "sanitize_research_query",

    # TODO: Add other schema exports as they are implemented
]
