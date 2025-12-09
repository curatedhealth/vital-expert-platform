"""
VITAL Path AI Services - Ask Expert Agent Hierarchy

5-Level Agent Hierarchy for Ask Expert:
- L1: Master Orchestrator (Claude Opus 4) - Strategic orchestration
- L2: Domain Experts (Claude Sonnet 4) - Domain-specific analysis
- L3: Task Specialists (Claude Sonnet 4) - Focused task execution
- L4: Context Workers (Claude Haiku 4) - Evidence preparation (shared)
- L5: Tools (APIs) - External data access (shared, no LLM cost)

Note: L4 Workers and L5 Tools are now shared across all services.
Import from `agents.l4_workers` and `agents.l5_tools` for direct access.

Naming Convention:
- Files: ask_expert_l{n}_{type}.py
- Classes: AskExpertL{N}{Type}
- Logs: ask_expert_l{n}_{action}

Phase 2: Agent Hierarchy & Fusion Intelligence
"""

from .ask_expert_l1_master import (
    AskExpertL1MasterOrchestrator,
    AskExpertTeamSelectionEvidence,
)
from .l2_experts import (
    AskExpertL2DomainExpert,
    AskExpertL2RegulatoryExpert,
    AskExpertL2ClinicalExpert,
    AskExpertL2SafetyExpert,
)
from .l3_specialists import AskExpertL3TaskSpecialist

# Re-export shared L4 Workers for convenience
from agents.l4_workers import (
    create_l4_worker,
    get_worker_config,
    L4BaseWorker,
    WorkerConfig,
    WorkerCategory,
)

# Re-export shared L5 Tools for convenience
from agents.l5_tools import (
    create_l5_tool,
    get_tool_config,
    L5BaseTool,
    ToolConfig,
    L5Result,
)

__all__ = [
    # L1
    "AskExpertL1MasterOrchestrator",
    "AskExpertTeamSelectionEvidence",
    # L2
    "AskExpertL2DomainExpert",
    "AskExpertL2RegulatoryExpert",
    "AskExpertL2ClinicalExpert",
    "AskExpertL2SafetyExpert",
    # L3
    "AskExpertL3TaskSpecialist",
    # L4 (shared)
    "create_l4_worker",
    "get_worker_config",
    "L4BaseWorker",
    "WorkerConfig",
    "WorkerCategory",
    # L5 (shared)
    "create_l5_tool",
    "get_tool_config",
    "L5BaseTool",
    "ToolConfig",
    "L5Result",
]
