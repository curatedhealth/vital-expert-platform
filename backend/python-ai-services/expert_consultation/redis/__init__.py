"""
Redis Management Package for VITAL Expert Consultation

Provides pub/sub capabilities, real-time execution state tracking,
and distributed session management.
"""

from .redis_manager import RedisManager, ExecutionState

__all__ = ["RedisManager", "ExecutionState"]
