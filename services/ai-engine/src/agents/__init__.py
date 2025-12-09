"""
VITAL Path AI Services - Agents Module (Shared)

Central module for all AI agents in the VITAL platform.
Contains reusable components across all services.

5-Level Agent Hierarchy:
- L1: Master Orchestrators (strategic coordination)
- L2: Domain Experts (domain-specific reasoning)
- L3: Task Specialists (focused task execution)
- L4: Context Workers (103 workers, 21 domains)
- L5: Tools (64+ tools, 17 domains - no LLM cost)

Usage:
    # L1 Orchestrators
    from agents.l1_orchestrators import L1MasterOrchestrator
    
    # L2 Experts
    from agents.l2_experts import L2RegulatoryExpert
    
    # L3 Specialists
    from agents.l3_specialists import L3TaskSpecialist
    
    # L4 Workers
    from agents.l4_workers import create_l4_worker
    
    # L5 Tools
    from agents.l5_tools import create_l5_tool
"""

# L1 Orchestrator exports
from .l1_orchestrators import (
    L1MasterOrchestrator,
    TeamSelectionEvidence,
    MissionTask,
)

# L2 Expert exports
from .l2_experts import (
    L2DomainExpert,
    L2RegulatoryExpert,
    L2ClinicalExpert,
    L2SafetyExpert,
)

# L3 Specialist exports
from .l3_specialists import (
    L3TaskSpecialist,
)

# L4 Worker exports
from .l4_workers import (
    create_l4_worker,
    get_worker_config,
    list_workers_by_category,
    list_all_workers,
    get_worker_count,
    get_workers_for_task_type,
    get_workers_with_l5_tool,
    L4BaseWorker,
    WorkerConfig,
    WorkerCategory,
    L4WorkerResult,
)

# L5 Tool exports
from .l5_tools import (
    create_l5_tool,
    get_tool_config,
    list_tools_by_category,
    list_tools_by_tier,
    list_all_tools,
    get_tool_count,
    L5BaseTool,
    ToolConfig,
    L5Result,
    ToolTier,
    AdapterType,
    AuthType,
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
    
    # L4 Worker functions
    "create_l4_worker",
    "get_worker_config",
    "list_workers_by_category",
    "list_all_workers",
    "get_worker_count",
    "get_workers_for_task_type",
    "get_workers_with_l5_tool",
    
    # L4 Worker classes
    "L4BaseWorker",
    "WorkerConfig",
    "WorkerCategory",
    "L4WorkerResult",
    
    # L5 Tool functions
    "create_l5_tool",
    "get_tool_config",
    "list_tools_by_category",
    "list_tools_by_tier",
    "list_all_tools",
    "get_tool_count",
    
    # L5 Tool classes
    "L5BaseTool",
    "ToolConfig",
    "L5Result",
    "ToolTier",
    "AdapterType",
    "AuthType",
]
