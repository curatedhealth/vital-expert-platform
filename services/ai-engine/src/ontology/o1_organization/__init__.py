"""
L1: Organizational Structure Layer

Organizational hierarchy including business functions, departments, roles,
teams, and geographic structures.
"""

from .models import (
    BusinessFunction,
    Department,
    Role,
    Team,
    Geography,
    OrganizationContext,
)
from .service import L1OrganizationService

__all__ = [
    "L1OrganizationService",
    "BusinessFunction",
    "Department",
    "Role",
    "Team",
    "Geography",
    "OrganizationContext",
]


# Migrated services (Phase 4)
# from .service import *  # TODO: Define specific exports
# from .models import *  # TODO: Define specific exports
# from .tenant_service import *  # TODO: Define specific exports
