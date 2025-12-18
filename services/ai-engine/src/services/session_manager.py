"""
Redirect module for backwards compatibility.
The actual implementation is in services.shared.session_manager.
"""

from services.shared.session_manager import (
    InteractionType,
    RecommendationType,
    UserSession,
    SearchRecord,
    UserPreferences,
    SessionManager,
    get_session_manager,
)

__all__ = [
    "InteractionType",
    "RecommendationType",
    "UserSession",
    "SearchRecord",
    "UserPreferences",
    "SessionManager",
    "get_session_manager",
]
