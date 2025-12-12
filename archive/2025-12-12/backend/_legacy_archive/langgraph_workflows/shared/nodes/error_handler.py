"""
VITAL Path AI Services - Error Handler Node

Centralized error handling for all LangGraph workflow modes.
Provides consistent error types, logging, and recovery patterns.

Phase 1 Refactoring: Task 1.2.6
"""

from typing import Dict, Any, Optional, Callable, Awaitable
from datetime import datetime
from enum import Enum
from functools import wraps
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState, ExecutionStatus

logger = structlog.get_logger()


class WorkflowErrorType(Enum):
    """Types of workflow errors."""
    VALIDATION_ERROR = "validation_error"
    RAG_ERROR = "rag_error"
    LLM_ERROR = "llm_error"
    TIMEOUT_ERROR = "timeout_error"
    TENANT_ERROR = "tenant_error"
    BUDGET_EXCEEDED = "budget_exceeded"
    TOOL_ERROR = "tool_error"
    AGENT_ERROR = "agent_error"
    CHECKPOINT_ERROR = "checkpoint_error"
    UNKNOWN_ERROR = "unknown_error"


class WorkflowError(Exception):
    """Base exception for workflow errors."""
    
    def __init__(
        self,
        error_type: WorkflowErrorType,
        message: str,
        recoverable: bool = False,
        retry_after: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None,
    ):
        """
        Initialize workflow error.
        
        Args:
            error_type: Type of error
            message: Error message
            recoverable: Whether the error can be recovered from
            retry_after: Seconds to wait before retry (if recoverable)
            context: Additional error context
        """
        self.error_type = error_type
        self.message = message
        self.recoverable = recoverable
        self.retry_after = retry_after
        self.context = context or {}
        super().__init__(message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary."""
        return {
            "error_type": self.error_type.value,
            "message": self.message,
            "recoverable": self.recoverable,
            "retry_after": self.retry_after,
            "context": self.context,
            "timestamp": datetime.utcnow().isoformat(),
        }


async def error_handler_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Handle errors in workflow execution.
    
    Examines the current state for errors and determines:
    - Whether to retry
    - Whether to fail gracefully
    - What error response to return
    
    Args:
        state: Current workflow state with potential errors
        
    Returns:
        State updates with error handling result
    """
    tenant_id = state.get("tenant_id")
    request_id = state.get("request_id", "unknown")
    errors = state.get("errors", [])
    retry_count = state.get("retry_count", 0)
    
    logger.info(
        "error_handler_node_started",
        tenant_id=tenant_id,
        request_id=request_id,
        error_count=len(errors),
        retry_count=retry_count,
    )
    
    if not errors:
        # No errors to handle
        return {
            "nodes_executed": ["error_handler"],
            "updated_at": datetime.utcnow(),
        }
    
    # Analyze errors
    error_analysis = _analyze_errors(errors)
    
    # Determine if retry is appropriate
    if error_analysis["recoverable"] and retry_count < 3:
        logger.info(
            "error_handler_node_retry",
            tenant_id=tenant_id,
            request_id=request_id,
            retry_count=retry_count + 1,
        )
        return {
            "retry_count": retry_count + 1,
            "status": ExecutionStatus.IN_PROGRESS,
            "nodes_executed": ["error_handler"],
            "updated_at": datetime.utcnow(),
        }
    
    # Fail gracefully
    logger.error(
        "error_handler_node_failed",
        tenant_id=tenant_id,
        request_id=request_id,
        errors=errors,
        error_analysis=error_analysis,
    )
    
    return {
        "status": ExecutionStatus.FAILED,
        "response": _create_error_response(errors, error_analysis),
        "nodes_executed": ["error_handler"],
        "updated_at": datetime.utcnow(),
    }


def create_error_boundary(
    node_func: Callable[[UnifiedWorkflowState], Awaitable[Dict[str, Any]]],
    error_type: WorkflowErrorType = WorkflowErrorType.UNKNOWN_ERROR,
) -> Callable[[UnifiedWorkflowState], Awaitable[Dict[str, Any]]]:
    """
    Decorator to wrap nodes with error handling.
    
    Catches exceptions and converts them to WorkflowErrors,
    adding them to the state errors list.
    
    Args:
        node_func: Node function to wrap
        error_type: Error type to use for caught exceptions
        
    Returns:
        Wrapped node function
        
    Example:
        >>> @create_error_boundary(WorkflowErrorType.RAG_ERROR)
        >>> async def retrieve_documents(state):
        >>>     # ... retrieval logic
    """
    @wraps(node_func)
    async def wrapper(state: UnifiedWorkflowState) -> Dict[str, Any]:
        tenant_id = state.get("tenant_id")
        request_id = state.get("request_id", "unknown")
        
        try:
            return await node_func(state)
        except WorkflowError as e:
            # Already a workflow error, just log and add to state
            logger.error(
                f"{node_func.__name__}_workflow_error",
                tenant_id=tenant_id,
                request_id=request_id,
                error_type=e.error_type.value,
                error=e.message,
            )
            return {
                "errors": [e.to_dict()],
                "updated_at": datetime.utcnow(),
            }
        except Exception as e:
            # Wrap in WorkflowError
            logger.error(
                f"{node_func.__name__}_error",
                tenant_id=tenant_id,
                request_id=request_id,
                error_type=error_type.value,
                error=str(e),
            )
            workflow_error = WorkflowError(
                error_type=error_type,
                message=str(e),
                recoverable=_is_recoverable(error_type),
            )
            return {
                "errors": [workflow_error.to_dict()],
                "updated_at": datetime.utcnow(),
            }
    
    return wrapper


def _analyze_errors(errors: list) -> Dict[str, Any]:
    """
    Analyze errors to determine recovery strategy.
    
    Args:
        errors: List of error messages or dicts
        
    Returns:
        Error analysis with recovery recommendation
    """
    recoverable = True
    error_types = set()
    
    for error in errors:
        if isinstance(error, dict):
            error_type = error.get("error_type", "unknown_error")
            recoverable = recoverable and error.get("recoverable", False)
        else:
            error_type = "unknown_error"
            recoverable = False
        error_types.add(error_type)
    
    return {
        "error_count": len(errors),
        "error_types": list(error_types),
        "recoverable": recoverable,
        "severity": "high" if not recoverable else "medium",
    }


def _is_recoverable(error_type: WorkflowErrorType) -> bool:
    """
    Determine if an error type is recoverable.
    
    Args:
        error_type: Type of error
        
    Returns:
        Whether the error is recoverable
    """
    recoverable_types = {
        WorkflowErrorType.TIMEOUT_ERROR,
        WorkflowErrorType.RAG_ERROR,
        WorkflowErrorType.TOOL_ERROR,
    }
    return error_type in recoverable_types


def _create_error_response(errors: list, analysis: Dict[str, Any]) -> str:
    """
    Create user-friendly error response.
    
    Args:
        errors: List of errors
        analysis: Error analysis
        
    Returns:
        User-friendly error message
    """
    if analysis["severity"] == "high":
        return (
            "I apologize, but I encountered an error that prevented me from "
            "completing your request. Please try again or contact support if "
            "the issue persists."
        )
    else:
        return (
            "I encountered a temporary issue while processing your request. "
            "The system is retrying automatically."
        )
