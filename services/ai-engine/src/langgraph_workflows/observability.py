"""
LangGraph Observability & Monitoring

Integrates LangSmith tracing and custom metrics for LangGraph workflows.
Provides comprehensive observability for debugging and performance monitoring.

Features:
- LangSmith integration for workflow tracing
- Custom metrics collection
- Performance monitoring
- Error tracking
- Workflow visualization support
- Tenant-aware logging

Reference: https://docs.smith.langchain.com/
"""

import os
import time
from typing import Dict, Any, Optional, Callable
from datetime import datetime
from functools import wraps
import structlog

# LangSmith imports
try:
    from langsmith import Client as LangSmithClient
    from langsmith.run_helpers import traceable
    LANGSMITH_AVAILABLE = True
except ImportError:
    logger = structlog.get_logger()
    logger.warning("LangSmith not available - tracing disabled")
    LANGSMITH_AVAILABLE = False
    LangSmithClient = None
    traceable = lambda *args, **kwargs: lambda f: f  # No-op decorator

from core.config import get_settings

logger = structlog.get_logger()


class LangGraphObservability:
    """
    Observability manager for LangGraph workflows.
    
    Features:
    - LangSmith tracing integration
    - Custom metrics collection
    - Performance monitoring
    - Error tracking
    - Tenant-aware logging
    
    Usage:
        >>> observability = LangGraphObservability()
        >>> await observability.initialize()
        >>> 
        >>> # Trace workflow execution
        >>> @observability.trace_workflow("mode1_workflow")
        >>> async def execute_workflow(state):
        ...     return result
    """
    
    def __init__(self):
        """Initialize observability manager"""
        self.settings = get_settings()
        self.langsmith_client: Optional[LangSmithClient] = None
        self.enabled = False
        
        # Metrics storage
        self._metrics: Dict[str, Any] = {
            "workflows_executed": 0,
            "workflows_failed": 0,
            "total_processing_time_ms": 0.0,
            "cache_hits": 0,
            "node_executions": {},
            "error_types": {}
        }
    
    async def initialize(self):
        """
        Initialize observability services.
        
        Sets up LangSmith if API key is available.
        """
        try:
            # Check for LangSmith API key
            langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
            
            if LANGSMITH_AVAILABLE and langsmith_api_key:
                self.langsmith_client = LangSmithClient(
                    api_key=langsmith_api_key
                )
                self.enabled = True
                
                logger.info(
                    "✅ LangSmith observability enabled",
                    project=os.getenv("LANGSMITH_PROJECT", "vital-ai-engine")
                )
            else:
                logger.info("ℹ️ LangSmith not configured - using local observability only")
            
        except Exception as e:
            logger.error("Failed to initialize observability", error=str(e))
            self.enabled = False
    
    def trace_workflow(self, workflow_name: str):
        """
        Decorator to trace workflow execution.
        
        Args:
            workflow_name: Name of workflow
            
        Returns:
            Decorated function with tracing
            
        Example:
            >>> @observability.trace_workflow("mode1_manual")
            >>> async def execute_mode1(state):
            ...     return result
        """
        def decorator(func: Callable):
            if not self.enabled:
                # No tracing - return original function
                return func
            
            @traceable(
                name=workflow_name,
                run_type="chain",
                project=os.getenv("LANGSMITH_PROJECT", "vital-ai-engine")
            )
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                
                try:
                    result = await func(*args, **kwargs)
                    
                    # Track metrics
                    execution_time = (time.time() - start_time) * 1000
                    self._track_workflow_execution(
                        workflow_name=workflow_name,
                        success=True,
                        execution_time_ms=execution_time
                    )
                    
                    return result
                    
                except Exception as e:
                    execution_time = (time.time() - start_time) * 1000
                    self._track_workflow_execution(
                        workflow_name=workflow_name,
                        success=False,
                        execution_time_ms=execution_time,
                        error_type=type(e).__name__
                    )
                    raise
            
            return wrapper
        return decorator
    
    def trace_node(self, node_name: str):
        """
        Decorator to trace node execution.
        
        Args:
            node_name: Name of node
            
        Returns:
            Decorated function with tracing
        """
        def decorator(func: Callable):
            if not self.enabled:
                return func
            
            @traceable(
                name=node_name,
                run_type="tool",
                project=os.getenv("LANGSMITH_PROJECT", "vital-ai-engine")
            )
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                
                try:
                    result = await func(*args, **kwargs)
                    
                    # Track node execution
                    execution_time = (time.time() - start_time) * 1000
                    self._track_node_execution(
                        node_name=node_name,
                        success=True,
                        execution_time_ms=execution_time
                    )
                    
                    return result
                    
                except Exception as e:
                    execution_time = (time.time() - start_time) * 1000
                    self._track_node_execution(
                        node_name=node_name,
                        success=False,
                        execution_time_ms=execution_time,
                        error_type=type(e).__name__
                    )
                    raise
            
            return wrapper
        return decorator
    
    def _track_workflow_execution(
        self,
        workflow_name: str,
        success: bool,
        execution_time_ms: float,
        error_type: Optional[str] = None
    ):
        """Track workflow execution metrics"""
        if success:
            self._metrics["workflows_executed"] += 1
        else:
            self._metrics["workflows_failed"] += 1
            
            if error_type:
                self._metrics["error_types"][error_type] = (
                    self._metrics["error_types"].get(error_type, 0) + 1
                )
        
        self._metrics["total_processing_time_ms"] += execution_time_ms
        
        logger.info(
            "Workflow execution tracked",
            workflow=workflow_name,
            success=success,
            execution_time_ms=execution_time_ms,
            error_type=error_type
        )
    
    def _track_node_execution(
        self,
        node_name: str,
        success: bool,
        execution_time_ms: float,
        error_type: Optional[str] = None
    ):
        """Track node execution metrics"""
        if node_name not in self._metrics["node_executions"]:
            self._metrics["node_executions"][node_name] = {
                "count": 0,
                "failures": 0,
                "total_time_ms": 0.0
            }
        
        node_metrics = self._metrics["node_executions"][node_name]
        node_metrics["count"] += 1
        node_metrics["total_time_ms"] += execution_time_ms
        
        if not success:
            node_metrics["failures"] += 1
        
        logger.debug(
            "Node execution tracked",
            node=node_name,
            success=success,
            execution_time_ms=execution_time_ms
        )
    
    def track_cache_hit(self):
        """Track cache hit"""
        self._metrics["cache_hits"] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get current metrics.
        
        Returns:
            Dictionary with all metrics
        """
        workflows_executed = self._metrics["workflows_executed"]
        total_time = self._metrics["total_processing_time_ms"]
        
        return {
            "workflows": {
                "executed": workflows_executed,
                "failed": self._metrics["workflows_failed"],
                "success_rate": (
                    1.0 - (self._metrics["workflows_failed"] / workflows_executed)
                    if workflows_executed > 0 else 1.0
                ),
                "avg_processing_time_ms": (
                    total_time / workflows_executed
                    if workflows_executed > 0 else 0.0
                )
            },
            "cache": {
                "hits": self._metrics["cache_hits"],
                "hit_rate": (
                    self._metrics["cache_hits"] / workflows_executed
                    if workflows_executed > 0 else 0.0
                )
            },
            "nodes": self._metrics["node_executions"],
            "errors": self._metrics["error_types"],
            "langsmith_enabled": self.enabled
        }
    
    def reset_metrics(self):
        """Reset all metrics"""
        self._metrics = {
            "workflows_executed": 0,
            "workflows_failed": 0,
            "total_processing_time_ms": 0.0,
            "cache_hits": 0,
            "node_executions": {},
            "error_types": {}
        }
        logger.info("Metrics reset")


# =============================================================================
# GLOBAL OBSERVABILITY INSTANCE
# =============================================================================

_observability: Optional[LangGraphObservability] = None


async def initialize_observability() -> LangGraphObservability:
    """
    Initialize global observability manager.
    
    Returns:
        Initialized observability manager
    """
    global _observability
    
    _observability = LangGraphObservability()
    await _observability.initialize()
    
    return _observability


def get_observability() -> Optional[LangGraphObservability]:
    """Get global observability manager"""
    return _observability


# =============================================================================
# CONVENIENCE DECORATORS
# =============================================================================

def trace_workflow(workflow_name: str):
    """
    Convenience decorator for workflow tracing.
    
    Uses global observability instance.
    """
    obs = get_observability()
    if obs:
        return obs.trace_workflow(workflow_name)
    else:
        # No-op decorator if observability not initialized
        return lambda f: f


def trace_node(node_name: str):
    """
    Convenience decorator for node tracing.
    
    Uses global observability instance.
    """
    obs = get_observability()
    if obs:
        return obs.trace_node(node_name)
    else:
        # No-op decorator if observability not initialized
        return lambda f: f

