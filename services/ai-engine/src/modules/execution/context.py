"""
VITAL Path - Execution Context

Runtime context for workflow execution.
Carries state, configuration, and services through the execution lifecycle.
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional, List, Callable
from uuid import uuid4

from core.context import get_request_context, RequestContext
from domain.services.budget_service import BudgetService
from domain.value_objects.token_usage import TokenUsage

logger = logging.getLogger(__name__)


@dataclass
class ExecutionMetrics:
    """Metrics collected during workflow execution."""
    
    started_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # Token tracking
    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    
    # Node tracking
    nodes_executed: int = 0
    nodes_failed: int = 0
    nodes_skipped: int = 0
    
    # Timing
    node_timings: Dict[str, float] = field(default_factory=dict)
    
    @property
    def total_tokens(self) -> int:
        return self.total_prompt_tokens + self.total_completion_tokens
    
    @property
    def duration_seconds(self) -> Optional[float]:
        if self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    def record_node_execution(
        self,
        node_id: str,
        duration_ms: float,
        success: bool = True,
    ) -> None:
        """Record metrics for a single node execution."""
        self.node_timings[node_id] = duration_ms
        if success:
            self.nodes_executed += 1
        else:
            self.nodes_failed += 1
    
    def record_token_usage(self, usage: TokenUsage) -> None:
        """Accumulate token usage from an LLM call."""
        self.total_prompt_tokens += usage.prompt_tokens
        self.total_completion_tokens += usage.completion_tokens
    
    def complete(self) -> None:
        """Mark execution as complete."""
        self.completed_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary for serialization."""
        return {
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration_seconds": self.duration_seconds,
            "total_tokens": self.total_tokens,
            "prompt_tokens": self.total_prompt_tokens,
            "completion_tokens": self.total_completion_tokens,
            "nodes_executed": self.nodes_executed,
            "nodes_failed": self.nodes_failed,
            "nodes_skipped": self.nodes_skipped,
            "node_timings": self.node_timings,
        }


@dataclass
class ExecutionContext:
    """
    Runtime context for workflow execution.
    
    Provides access to:
    - Request context (tenant, user)
    - Budget service for token tracking
    - Execution state and variables
    - Event callbacks for streaming
    """
    
    # Identifiers
    execution_id: str = field(default_factory=lambda: str(uuid4()))
    workflow_id: Optional[str] = None
    job_id: Optional[str] = None
    
    # Request context (from middleware)
    request_context: Optional[RequestContext] = None
    
    # Services
    budget_service: Optional[BudgetService] = None
    
    # Execution configuration
    max_iterations: int = 100  # Prevent infinite loops
    timeout_seconds: int = 300  # 5 minute default
    stream_enabled: bool = False
    
    # Runtime state
    variables: Dict[str, Any] = field(default_factory=dict)
    iteration_count: int = 0
    is_cancelled: bool = False
    
    # Metrics
    metrics: ExecutionMetrics = field(default_factory=ExecutionMetrics)
    
    # Event callbacks
    _event_handlers: Dict[str, List[Callable]] = field(default_factory=dict)
    
    def __post_init__(self):
        """Initialize context with request context if not provided."""
        if self.request_context is None:
            self.request_context = get_request_context()
        
        # Note: budget_service should be injected, not auto-created
        # This allows for testing without a database connection
    
    @property
    def organization_id(self) -> Optional[str]:
        """Get organization ID from request context (matches RLS)."""
        return self.request_context.organization_id if self.request_context else None
    
    @property
    def tenant_id(self) -> Optional[str]:
        """DEPRECATED: Use organization_id instead. Returns organization_id for compatibility."""
        return self.organization_id
    
    @property
    def user_id(self) -> Optional[str]:
        """Get user ID from request context."""
        return self.request_context.user_id if self.request_context else None
    
    def set_variable(self, name: str, value: Any) -> None:
        """Set a workflow variable."""
        self.variables[name] = value
    
    def get_variable(self, name: str, default: Any = None) -> Any:
        """Get a workflow variable."""
        return self.variables.get(name, default)
    
    def increment_iteration(self) -> bool:
        """
        Increment iteration count and check limit.
        
        Returns False if max iterations exceeded.
        """
        self.iteration_count += 1
        if self.iteration_count > self.max_iterations:
            logger.warning(
                f"Execution {self.execution_id} exceeded max iterations "
                f"({self.max_iterations})"
            )
            return False
        return True
    
    def cancel(self) -> None:
        """Request cancellation of execution."""
        self.is_cancelled = True
        logger.info(f"Execution {self.execution_id} cancellation requested")
    
    async def check_budget(self, estimated_tokens: int = 1000) -> bool:
        """
        Check if we have budget for more LLM calls.
        
        Returns True if within budget.
        """
        if not self.budget_service or not self.organization_id:
            return True  # No budget enforcement without context
        
        try:
            result = await self.budget_service.check_budget(
                organization_id=self.organization_id,
                user_id=self.user_id,
                estimated_tokens=estimated_tokens,
            )
            return result.can_proceed
        except Exception as e:
            logger.warning(f"Budget check failed: {str(e)}")
            return True  # Allow on budget check failure
    
    async def record_usage(
        self,
        usage: TokenUsage,
        model: str,
        operation: str,
    ) -> None:
        """Record token usage to budget service."""
        self.metrics.record_token_usage(usage)
        
        if self.budget_service and self.organization_id:
            try:
                await self.budget_service.record_usage(
                    organization_id=self.organization_id,
                    user_id=self.user_id,
                    model=model,
                    usage=usage,
                    operation=operation,
                    metadata={
                        "execution_id": self.execution_id,
                        "workflow_id": self.workflow_id,
                    },
                )
            except Exception as e:
                logger.warning(f"Failed to record usage: {str(e)}")
    
    # Event handling
    def on(self, event: str, handler: Callable) -> None:
        """Register an event handler."""
        if event not in self._event_handlers:
            self._event_handlers[event] = []
        self._event_handlers[event].append(handler)
    
    async def emit(self, event: str, data: Any = None) -> None:
        """Emit an event to all registered handlers."""
        handlers = self._event_handlers.get(event, [])
        for handler in handlers:
            try:
                if callable(handler):
                    result = handler(event, data)
                    if hasattr(result, "__await__"):
                        await result
            except Exception as e:
                logger.warning(f"Event handler error for {event}: {str(e)}")
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize context state for debugging/logging."""
        return {
            "execution_id": self.execution_id,
            "workflow_id": self.workflow_id,
            "job_id": self.job_id,
            "organization_id": self.organization_id,
            "user_id": self.user_id,
            "iteration_count": self.iteration_count,
            "is_cancelled": self.is_cancelled,
            "variables": self.variables,
            "metrics": self.metrics.to_dict(),
        }










