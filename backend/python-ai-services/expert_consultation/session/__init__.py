"""
Session Management Package for VITAL Expert Consultation

Provides persistent session management with PostgreSQL checkpointing,
session state preservation, and resume capabilities.
"""

from .session_manager import SessionManager, SessionMetadata

__all__ = ["SessionManager", "SessionMetadata"]
