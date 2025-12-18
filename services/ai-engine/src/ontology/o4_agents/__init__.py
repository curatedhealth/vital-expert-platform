"""
L4: Agent Coordination Layer

Agent registry, JTBD mapping, selection strategies, and multi-agent orchestration.
"""

from .models import (
    AgentDefinition,
    AgentCapability,
    AgentJTBDMapping,
    AgentContext,
)
from .service import L4AgentService

__all__ = [
    "L4AgentService",
    "AgentDefinition",
    "AgentCapability",
    "AgentJTBDMapping",
    "AgentContext",
]


# Migrated services (Phase 4)
# from .hierarchy_service import *  # TODO: Define specific exports
# from .service import *  # TODO: Define specific exports
# from .pool_manager import *  # TODO: Define specific exports
# from .agent_registry import *  # TODO: Define specific exports
# from .models import *  # TODO: Define specific exports
# from .unified_loader import *  # TODO: Define specific exports
# from .instantiation_service import *  # TODO: Define specific exports
# from .orchestration import *  # TODO: Define specific exports
# from .enrichment_service import *  # TODO: Define specific exports
