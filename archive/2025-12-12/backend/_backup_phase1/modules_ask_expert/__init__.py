"""
VITAL Path AI Services - Ask Expert Module

Complete Ask Expert implementation with:
- 4-Mode Workflow Matrix (Mode 1-4)
- 5-Level Agent Hierarchy (L1-L5)
- Fusion Intelligence (Triple Retrieval + RRF)

Architecture:
- L1-L3: Ask Expert specific agents (in this module)
- L4-L5: Shared agents (in agents.l4_workers and agents.l5_tools)

Phase 2: Agent Hierarchy & Fusion Intelligence
"""

# Agent Hierarchy - L1-L3 (Ask Expert specific)
from .agents import (
    AskExpertL1MasterOrchestrator,
    AskExpertTeamSelectionEvidence,
)
from .agents.l2_experts import (
    AskExpertL2DomainExpert,
    AskExpertL2RegulatoryExpert,
    AskExpertL2ClinicalExpert,
    AskExpertL2SafetyExpert,
)
from .agents.l3_specialists import AskExpertL3TaskSpecialist

# Agent Hierarchy - L4-L5 (Shared across all services)
from agents.l4_workers import (
    create_l4_worker,
    get_worker_config,
    L4BaseWorker,
    WorkerConfig,
    WorkerCategory,
)
from agents.l5_tools import (
    create_l5_tool,
    get_tool_config,
    L5BaseTool,
    ToolConfig,
    L5Result,
)

# Fusion Intelligence
from .fusion import (
    AskExpertFusionEngine,
    AskExpertFusionResult,
    AskExpertRankedItem,
    ask_expert_reciprocal_rank_fusion,
    ask_expert_weighted_rrf,
    AskExpertVectorRetriever,
    AskExpertGraphRetriever,
    AskExpertRelationalRetriever,
)

__all__ = [
    # L1 Master Orchestrator
    "AskExpertL1MasterOrchestrator",
    "AskExpertTeamSelectionEvidence",
    # L2 Domain Experts
    "AskExpertL2DomainExpert",
    "AskExpertL2RegulatoryExpert",
    "AskExpertL2ClinicalExpert",
    "AskExpertL2SafetyExpert",
    # L3 Task Specialists
    "AskExpertL3TaskSpecialist",
    # L4 Context Workers (shared)
    "create_l4_worker",
    "get_worker_config",
    "L4BaseWorker",
    "WorkerConfig",
    "WorkerCategory",
    # L5 Tools (shared)
    "create_l5_tool",
    "get_tool_config",
    "L5BaseTool",
    "ToolConfig",
    "L5Result",
    # Fusion Intelligence
    "AskExpertFusionEngine",
    "AskExpertFusionResult",
    "AskExpertRankedItem",
    "ask_expert_reciprocal_rank_fusion",
    "ask_expert_weighted_rrf",
    "AskExpertVectorRetriever",
    "AskExpertGraphRetriever",
    "AskExpertRelationalRetriever",
]
