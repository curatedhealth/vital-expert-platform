# PRODUCTION_TAG: DEVELOPMENT
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [ontology.*]
"""
Ontology API Routes

8-layer semantic architecture API endpoints for the VITAL platform.
(See VITAL_PLATFORM_TAXONOMY.md for naming conventions)

Layers:
- O3 JTBD: Jobs-to-be-Done operations, pain points, outcomes, ODI scoring
- O7 Value: VPANES scoring, ROI estimation, value realization tracking
- Resolver: Cross-layer context resolution
"""

from .o3_jtbd import router as o3_jtbd_router
from .o7_value import router as o7_value_router
from .resolver import router as resolver_router

__all__ = [
    "o3_jtbd_router",
    "o7_value_router",
    "resolver_router",
]
