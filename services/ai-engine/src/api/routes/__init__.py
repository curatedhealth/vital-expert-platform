# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: []
"""
VITAL Path - API Routes

FastAPI route modules organized by domain:
- jobs: Async job status and results
- expert: Ask Expert endpoints (Modes 1-4)
- panel: Ask Panel endpoints
- workflow: Custom workflow execution
- streaming: SSE streaming endpoints
- health: Health checks

Phase 4: Added Mode 4 auto-autonomous route

NOTE: Mode-specific routers are imported lazily via register.py to avoid
import errors blocking server startup. Individual routes may fail gracefully.
"""

# Core routes that should always work
try:
    from .streaming import streaming_router
except ImportError:
    streaming_router = None

try:
    from .jobs import router as jobs_router
except ImportError:
    jobs_router = None

try:
    from .health import router as health_router
except ImportError:
    health_router = None

# Mode-specific routers imported lazily (may have missing dependencies)
# These are registered via register.py with proper error handling
mode1_router = None
mode2_router = None
mode3_router = None
mode4_router = None
hitl_router = None

__all__ = [
    "jobs_router",
    "health_router",
    "streaming_router",
]
