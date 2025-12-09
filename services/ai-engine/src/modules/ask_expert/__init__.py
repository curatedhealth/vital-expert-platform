"""
VITAL Path AI Services - Ask Expert Module

Ask Expert service-specific configuration and workflows.
Uses shared agents and fusion from:
- agents/ (L1-L5 agent hierarchy)
- fusion/ (Fusion Intelligence)

This module re-exports shared components for backwards compatibility.
"""

# Re-export from shared agents
from agents import (
    # L1 Orchestrators
    L1MasterOrchestrator,
    TeamSelectionEvidence,
    MissionTask,
    # L2 Experts
    L2DomainExpert,
    L2RegulatoryExpert,
    L2ClinicalExpert,
    L2SafetyExpert,
    # L3 Specialists
    L3TaskSpecialist,
    # L4 Workers
    create_l4_worker,
    get_worker_config,
    L4BaseWorker,
    WorkerConfig,
    WorkerCategory,
    # L5 Tools
    create_l5_tool,
    get_tool_config,
    L5BaseTool,
    ToolConfig,
    L5Result,
)

# Re-export from shared fusion
from fusion import (
    FusionEngine,
    FusionResult,
    RankedItem,
    reciprocal_rank_fusion,
    weighted_rrf,
    normalize_to_percentage,
    VectorRetriever,
    GraphRetriever,
    RelationalRetriever,
)

__all__ = [
    # L1 Orchestrators
    "L1MasterOrchestrator",
    "TeamSelectionEvidence",
    "MissionTask",
    # L2 Experts
    "L2DomainExpert",
    "L2RegulatoryExpert",
    "L2ClinicalExpert",
    "L2SafetyExpert",
    # L3 Specialists
    "L3TaskSpecialist",
    # L4 Workers
    "create_l4_worker",
    "get_worker_config",
    "L4BaseWorker",
    "WorkerConfig",
    "WorkerCategory",
    # L5 Tools
    "create_l5_tool",
    "get_tool_config",
    "L5BaseTool",
    "ToolConfig",
    "L5Result",
    # Fusion Intelligence
    "FusionEngine",
    "FusionResult",
    "RankedItem",
    "reciprocal_rank_fusion",
    "weighted_rrf",
    "normalize_to_percentage",
    "VectorRetriever",
    "GraphRetriever",
    "RelationalRetriever",
]
