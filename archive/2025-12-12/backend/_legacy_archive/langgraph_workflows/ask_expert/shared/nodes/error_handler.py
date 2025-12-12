"""
VITAL Path AI Services - Ask Expert Error Handler Node

Error handling for Ask Expert Mode 1-4 workflows.

Naming Convention:
- Function: ask_expert_error_handler_node
- Class: AskExpertWorkflowError
- Enum: AskExpertErrorType
- Logs: ask_expert_error_{action}
"""

from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState, ExecutionStatus

logger = structlog.get_logger()


class AskExpertErrorType(Enum):
    """Ask Expert specific error types."""
    VALIDATION_ERROR = "ask_expert_validation_error"
    RAG_ERROR = "ask_expert_rag_error"
    LLM_ERROR = "ask_expert_llm_error"
    TIMEOUT_ERROR = "ask_expert_timeout_error"
    TENANT_ERROR = "ask_expert_tenant_error"
    AGENT_ERROR = "ask_expert_agent_error"
    HITL_ERROR = "ask_expert_hitl_error"
    BUDGET_ERROR = "ask_expert_budget_error"


class AskExpertWorkflowError(Exception):
    """Ask Expert workflow error."""
    
    def __init__(
        self,
        error_type: AskExpertErrorType,
        message: str,
        recoverable: bool = False,
        mode: Optional[str] = None,
    ):
        self.error_type = error_type
        self.message = message
        self.recoverable = recoverable
        self.mode = mode
        super().__init__(message)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "error_type": self.error_type.value,
            "message": self.message,
            "recoverable": self.recoverable,
            "mode": self.mode,
            "timestamp": datetime.utcnow().isoformat(),
        }


async def ask_expert_error_handler_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Handle errors in Ask Expert workflows.
    
    Used by: Mode 1, 2, 3, 4
    """
    tenant_id = state.get("tenant_id")
    request_id = state.get("request_id", "unknown")
    errors = state.get("errors", [])
    retry_count = state.get("retry_count", 0)
    mode = state.get("mode", "unknown")
    
    logger.info(
        "ask_expert_error_handler_started",
        tenant_id=tenant_id,
        request_id=request_id,
        mode=str(mode),
        error_count=len(errors),
    )
    
    if not errors:
        return {
            "nodes_executed": ["ask_expert_error_handler"],
        }
    
    # Check if recoverable
    recoverable = _is_ask_expert_error_recoverable(errors)
    
    if recoverable and retry_count < 3:
        logger.info(
            "ask_expert_error_retry",
            request_id=request_id,
            retry_count=retry_count + 1,
        )
        return {
            "retry_count": retry_count + 1,
            "status": ExecutionStatus.IN_PROGRESS,
            "nodes_executed": ["ask_expert_error_handler"],
        }
    
    # Fail
    logger.error(
        "ask_expert_error_failed",
        tenant_id=tenant_id,
        request_id=request_id,
        errors=errors,
    )
    
    return {
        "status": ExecutionStatus.FAILED,
        "response": _create_ask_expert_error_message(mode),
        "nodes_executed": ["ask_expert_error_handler"],
    }


def _is_ask_expert_error_recoverable(errors: list) -> bool:
    """Check if errors are recoverable."""
    recoverable_types = {"timeout", "rag", "connection"}
    for error in errors:
        if isinstance(error, dict):
            error_type = error.get("error_type", "").lower()
            if any(t in error_type for t in recoverable_types):
                return True
    return False


def _create_ask_expert_error_message(mode) -> str:
    """Create user-friendly error message."""
    mode_str = str(mode) if mode else "unknown"
    return (
        f"I apologize, but Ask Expert ({mode_str}) encountered an error. "
        "Please try again or contact support if the issue persists."
    )
