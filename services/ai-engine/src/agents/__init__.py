"""
VITAL Path AI Services - Agents Module (Shared)

Central module for all AI agents in the VITAL platform.
Contains reusable components across all services.

5-Level Agent Hierarchy (Semantic Naming):
- orchestrators/: Master Orchestrators (L1 - strategic coordination)
- experts/: Domain Experts (L2 - domain-specific reasoning)
- specialists/: Task Specialists (L3 - focused task execution)
- workers/: Context Workers (L4 - 103 workers, 21 domains)
- tools/: External Tools (L5 - 64+ tools, no LLM cost)

Usage:
    # Orchestrators
    from agents.orchestrators import L1MasterOrchestrator

    # Experts
    from agents.experts import L2RegulatoryExpert

    # Specialists
    from agents.specialists import L3TaskSpecialist

    # Workers
    from agents.workers import create_l4_worker

    # Tools
    from agents.tools import create_l5_tool
"""

# L1 Orchestrator exports
from .orchestrators import (
    L1MasterOrchestrator,
    TeamSelectionEvidence,
    MissionTask,
)

# L2 Expert exports
from .experts import (
    L2DomainExpert,
    L2RegulatoryExpert,
    L2ClinicalExpert,
    L2SafetyExpert,
)

# L3 Specialist exports
from .specialists import (
    L3TaskSpecialist,
)

# L4 Worker exports
from .workers import (
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
from .tools import (
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
