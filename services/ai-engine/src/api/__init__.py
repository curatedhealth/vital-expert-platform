"""
API package for VITAL AI Engine.

Provides REST API endpoints for metrics, monitoring, and management.
"""

from api.metrics_api import metrics_router

__all__ = [
    "metrics_router",
]

