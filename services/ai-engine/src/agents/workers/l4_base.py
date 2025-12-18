"""
VITAL Path AI Services - L4 Worker Base

Base class for all L4 Context Workers following configuration-driven pattern.
L4 workers use cheap/fast LLMs for cost-effective evidence preparation.
Reusable across all services (Ask Expert, Panel, etc.)

Architecture Pattern:
- PostgreSQL agents table: Agent-specific config (model, temperature, max_tokens)
- Environment variables: Level-specific defaults (L4_LLM_MODEL, etc.)
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: L4BaseWorker, WorkerConfig
- Logs: vital_l4_{worker_key}_{action}
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from enum import Enum
import structlog

# Import config service for dynamic configuration
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()


# Get L4 defaults from environment (NOT hardcoded)
_L4_DEFAULTS = get_llm_config_for_level("L4")


class WorkerCategory(Enum):
    """L4 Worker categories."""
    DATA_PROCESSING = "data_processing"
    ANALYSIS = "analysis"
    RISK = "risk"
    STRATEGIC = "strategic"
    EVIDENCE_SYNTHESIS = "evidence_synthesis"
    REGULATORY = "regulatory"
    CLINICAL = "clinical"
    HEOR = "heor"
    BIOINFORMATICS = "bioinformatics"
    DIGITAL_HEALTH = "digital_health"
    RWE = "rwe"
    MEDICAL_AFFAIRS = "medical_affairs"
    COMMERCIAL = "commercial"
    DECISION_MAKING = "decision_making"
    FINANCIAL = "financial"
    DESIGN = "design"
    COMMUNICATION = "communication"
    DESIGN_THINKING = "design_thinking"
    INNOVATION = "innovation"
    AGILE = "agile"
    OPERATIONAL_EXCELLENCE = "operational_excellence"


@dataclass
class WorkerConfig:
    """
    Configuration for an L4 worker.

    Model configuration comes from:
    1. Database (agents table) - preferred
    2. Environment variables (L4_LLM_MODEL, etc.) - fallback
    3. NO hardcoded values in Python code
    """

    # Identity
    id: str                           # L4-DE, L4-QA, etc.
    name: str
    description: str = ""
    category: WorkerCategory = WorkerCategory.DATA_PROCESSING

    # Model configuration - defaults from env vars via config service
    # Individual workers can override, but default comes from L4_LLM_* env vars
    model: str = field(default_factory=lambda: _L4_DEFAULTS.model)
    temperature: float = field(default_factory=lambda: _L4_DEFAULTS.temperature)
    max_tokens: int = field(default_factory=lambda: _L4_DEFAULTS.max_tokens)

    # L5 tools this worker can use
    allowed_l5_tools: List[str] = field(default_factory=list)

    # Task types this worker handles
    task_types: List[str] = field(default_factory=list)

    # Performance
    timeout: int = 60
    max_retries: int = 2

    # Cost tracking
    cost_per_execution: float = 0.005

    # Config source tracking
    config_source: str = "env"  # "database", "env", or "override"


class L4BaseWorker(ABC):
    """
    Abstract base class for L4 Context Workers.
    
    L4 workers:
    - Use Claude Haiku for cost-effective processing
    - Orchestrate L5 tool calls
    - Prepare evidence for L2/L3 consumption
    - NO direct user interaction
    """
    
    def __init__(self, config: WorkerConfig, l5_tools: Optional[Dict[str, Any]] = None):
        self.config = config
        self.l5_tools = l5_tools or {}
        
        logger.info(
            f"vital_l4_{config.id.lower()}_initialized",
            worker_id=config.id,
            allowed_tools=config.allowed_l5_tools,
        )
    
    async def execute(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute worker task with error handling."""
        logger.info(
            f"vital_l4_{self.config.id.lower()}_execute_started",
            task=task,
        )
        
        try:
            result = await self._execute_task(task, params)
            
            logger.info(
                f"vital_l4_{self.config.id.lower()}_execute_completed",
                task=task,
            )
            
            return {
                "success": True,
                "worker_id": self.config.id,
                "task": task,
                "result": result,
            }
            
        except Exception as e:
            logger.error(
                f"vital_l4_{self.config.id.lower()}_execute_failed",
                task=task,
                error=str(e),
            )
            
            return {
                "success": False,
                "worker_id": self.config.id,
                "task": task,
                "error": str(e),
            }
    
    @abstractmethod
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Implement task execution logic."""
        pass
    
    async def call_l5_tool(self, tool_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Call an L5 tool if allowed."""
        if tool_id not in self.config.allowed_l5_tools:
            return {"error": f"Tool {tool_id} not allowed for this worker"}
        
        if tool_id not in self.l5_tools:
            # Try to create tool dynamically
            try:
                from ..l5_tools import create_l5_tool
                tool = create_l5_tool(tool_id.replace("L5-", "").lower())
                result = await tool.execute(params)
                return result.to_dict() if hasattr(result, 'to_dict') else result
            except Exception as e:
                return {"error": f"Failed to execute tool {tool_id}: {str(e)}"}
        
        tool = self.l5_tools[tool_id]
        return await tool.execute(params)
    
    def can_handle_task(self, task: str) -> bool:
        """Check if worker can handle this task type."""
        return task in self.config.task_types


@dataclass
class L4WorkerResult:
    """Result from L4 worker execution."""
    success: bool
    worker_id: str
    task: str
    data: Any = None
    error: Optional[str] = None
    l5_calls: List[Dict] = field(default_factory=list)
    execution_time_ms: float = 0.0
