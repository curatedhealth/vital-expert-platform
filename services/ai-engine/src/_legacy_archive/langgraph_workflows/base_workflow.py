"""
Base Workflow Class for LangGraph

Provides common functionality for all LangGraph workflows following
industry best practices and golden rules.

Features:
- TypedDict state management
- Tenant validation (Golden Rule #3)
- Caching integration (Golden Rule #2)
- Error handling and recovery
- Observability and tracing
- Checkpoint management
- Node composition patterns

Reference: https://langchain-ai.github.io/langgraph/tutorials/
"""

import uuid
import asyncio
from typing import Dict, Any, Optional, Callable, List
from datetime import datetime
import structlog
from abc import ABC, abstractmethod

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.base import BaseCheckpointSaver

# Internal imports
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
    validate_state,
    create_initial_state
)
from langgraph_workflows.checkpoint_manager import get_checkpoint_manager
from services.cache_manager import get_cache_manager
from services.resilience import timeout_handler

logger = structlog.get_logger()


class BaseWorkflow(ABC):
    """
    Base class for all LangGraph workflows.
    
    Golden Rules Compliance:
    - ✅ ALL workflows use LangGraph StateGraph
    - ✅ Caching integrated into nodes
    - ✅ Tenant validation enforced
    
    Best Practices:
    - ✅ TypedDict state (not Dict[str, Any])
    - ✅ Single responsibility per node
    - ✅ Error handling in all nodes
    - ✅ Observability built-in
    - ✅ Checkpoint support
    - ✅ Clean separation of concerns
    
    Usage:
        class Mode1Workflow(BaseWorkflow):
            def build_graph(self):
                # Build workflow graph
                
            async def execute(self, state):
                # Execute workflow
    """
    
    def __init__(
        self,
        workflow_name: str,
        mode: WorkflowMode,
        enable_checkpoints: bool = True
    ):
        """
        Initialize base workflow.
        
        Args:
            workflow_name: Human-readable workflow name
            mode: Workflow mode
            enable_checkpoints: Enable state persistence
        """
        self.workflow_name = workflow_name
        self.mode = mode
        self.enable_checkpoints = enable_checkpoints
        
        # Services
        self.cache_manager = get_cache_manager()
        self.checkpoint_manager = get_checkpoint_manager()
        
        # Graph
        self.graph: Optional[StateGraph] = None
        self.compiled_graph = None
        
        # Metrics
        self._execution_count = 0
        self._error_count = 0
        self._cache_hit_count = 0
    
    @abstractmethod
    def build_graph(self) -> StateGraph:
        """
        Build the LangGraph workflow graph.
        
        Must be implemented by subclasses.
        
        Returns:
            Configured StateGraph
            
        Example:
            def build_graph(self):
                graph = StateGraph(UnifiedWorkflowState)
                graph.add_node("process_query", self.process_query_node)
                graph.add_node("execute_agent", self.execute_agent_node)
                graph.set_entry_point("process_query")
                graph.add_edge("process_query", "execute_agent")
                graph.add_edge("execute_agent", END)
                return graph
        """
        pass
    
    async def initialize(self):
        """
        Initialize workflow.
        
        Builds graph and compiles with checkpointer.
        """
        try:
            # Build graph
            self.graph = self.build_graph()
            
            # Get checkpointer if enabled
            checkpointer = None
            if self.enable_checkpoints and self.checkpoint_manager:
                # Will use tenant-specific checkpointer at runtime
                pass
            
            # Compile graph
            # Note: Checkpointer is set per-execution for tenant isolation
            self.compiled_graph = self.graph.compile()
            
            logger.info(
                "✅ Workflow initialized",
                workflow=self.workflow_name,
                mode=self.mode.value,
                checkpoints=self.enable_checkpoints
            )
            
        except Exception as e:
            logger.error(
                "❌ Failed to initialize workflow",
                workflow=self.workflow_name,
                error=str(e)
            )
            raise
    
    async def execute(
        self,
        tenant_id: str,
        query: str,
        request_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute workflow with tenant isolation.
        
        Golden Rule #3: tenant_id is REQUIRED
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            query: User query
            request_id: Optional request ID
            user_id: Optional user ID
            session_id: Optional session ID
            **kwargs: Additional configuration
            
        Returns:
            Workflow output state
            
        Raises:
            ValueError: If tenant_id is missing
            
        Example:
            >>> workflow = Mode1Workflow()
            >>> await workflow.initialize()
            >>> result = await workflow.execute(
            ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
            ...     query="What are FDA IND requirements?"
            ... )
        """
        # GOLDEN RULE #3: Validate tenant_id
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        # Generate request ID if not provided
        request_id = request_id or f"req_{uuid.uuid4().hex[:12]}"
        
        # Create initial state
        initial_state = create_initial_state(
            tenant_id=tenant_id,
            query=query,
            mode=self.mode,
            request_id=request_id,
            user_id=user_id,
            session_id=session_id,
            **kwargs
        )
        
        # Validate state
        validate_state(initial_state)
        
        # Track execution
        self._execution_count += 1
        
        start_time = datetime.utcnow()
        
        try:
            logger.info(
                "🚀 Starting workflow execution",
                workflow=self.workflow_name,
                tenant_id=tenant_id[:8],
                request_id=request_id
            )
            
            # Get tenant-specific checkpointer
            checkpointer = None
            if self.enable_checkpoints and self.checkpoint_manager:
                checkpointer = await self.checkpoint_manager.get_checkpointer(
                    tenant_id=tenant_id,
                    workflow_id=request_id
                )
            
            # Execute workflow with timeout
            config = {
                "configurable": {
                    "thread_id": request_id,
                    "tenant_id": tenant_id
                },
                "checkpointer": checkpointer
            }
            
            # Run graph with timeout (prevent hanging)
            result = await timeout_handler(
                self.compiled_graph.ainvoke(initial_state, config),
                timeout=300.0,  # 5 minutes max
                timeout_message=f"Workflow {self.workflow_name} timed out"
            )
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            result['processing_time_ms'] = processing_time
            
            logger.info(
                "✅ Workflow completed successfully",
                workflow=self.workflow_name,
                tenant_id=tenant_id[:8],
                request_id=request_id,
                processing_time_ms=processing_time,
                cache_hits=result.get('cache_hits', 0)
            )
            
            return result
            
        except Exception as e:
            self._error_count += 1
            
            logger.error(
                "❌ Workflow execution failed",
                workflow=self.workflow_name,
                tenant_id=tenant_id[:8],
                request_id=request_id,
                error=str(e),
                error_type=type(e).__name__
            )
            
            # Return error state
            return {
                **initial_state,
                'status': ExecutionStatus.FAILED,
                'errors': [str(e)],
                'error_type': type(e).__name__
            }
    
    # =========================================================================
    # COMMON NODE PATTERNS
    # =========================================================================
    
    async def validate_tenant_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Validate tenant context.
        
        Golden Rule #3: Tenant validation in workflow
        
        This node should be first in all workflows.
        """
        tenant_id = state.get('tenant_id')
        
        if not tenant_id:
            logger.error("Tenant validation failed - no tenant_id")
            return {
                **state,
                'status': ExecutionStatus.FAILED,
                'errors': state.get('errors', []) + ["tenant_id is required"]
            }
        
        logger.debug("Tenant validated", tenant_id=tenant_id[:8])
        
        return {
            **state,
            'status': ExecutionStatus.IN_PROGRESS,
            'current_node': 'validate_tenant'
        }
    
    async def cache_check_node(
        self,
        state: UnifiedWorkflowState,
        cache_key_fn: Callable[[UnifiedWorkflowState], str]
    ) -> UnifiedWorkflowState:
        """
        Node: Check cache for existing result.
        
        Golden Rule #2: Caching integration
        
        Args:
            state: Current workflow state
            cache_key_fn: Function to generate cache key from state
            
        Returns:
            Updated state (with cached result if found)
        """
        if not self.cache_manager or not self.cache_manager.enabled:
            return state
        
        try:
            tenant_id = state['tenant_id']
            cache_key = cache_key_fn(state)
            
            # Try to get cached result
            cached_result = await self.cache_manager.get(cache_key)
            
            if cached_result:
                self._cache_hit_count += 1
                
                logger.info(
                    "✅ Cache hit",
                    tenant_id=tenant_id[:8],
                    cache_key=cache_key[:32]
                )
                
                return {
                    **state,
                    'response': cached_result.get('response'),
                    'confidence': cached_result.get('confidence'),
                    'citations': cached_result.get('citations', []),
                    'cache_hits': state.get('cache_hits', 0) + 1,
                    'response_cached': True
                }
            
            return state
            
        except Exception as e:
            logger.warning("Cache check failed", error=str(e))
            return state
    
    async def error_handler_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Handle errors gracefully.
        
        This node processes errors and determines recovery strategy.
        """
        errors = state.get('errors', [])
        
        if not errors:
            return state
        
        logger.warning(
            "Error handler activated",
            errors=errors,
            retry_count=state.get('retry_count', 0)
        )
        
        # Determine if retry is appropriate
        retry_count = state.get('retry_count', 0)
        max_retries = 3
        
        if retry_count < max_retries:
            # Can retry
            return {
                **state,
                'retry_count': retry_count + 1,
                'status': ExecutionStatus.IN_PROGRESS
            }
        else:
            # Max retries exceeded
            return {
                **state,
                'status': ExecutionStatus.FAILED
            }
    
    # =========================================================================
    # CONDITIONAL EDGE FUNCTIONS
    # =========================================================================
    
    def should_use_cache(self, state: UnifiedWorkflowState) -> str:
        """
        Conditional edge: Check if cache should be used.
        
        Returns:
            "use_cache" or "skip_cache"
        """
        if not self.cache_manager or not self.cache_manager.enabled:
            return "skip_cache"
        
        enable_rag = state.get('enable_rag', True)
        return "use_cache" if enable_rag else "skip_cache"
    
    def should_retry(self, state: UnifiedWorkflowState) -> str:
        """
        Conditional edge: Check if workflow should retry.
        
        Returns:
            "retry" or "fail"
        """
        retry_count = state.get('retry_count', 0)
        max_retries = 3
        
        if retry_count < max_retries:
            return "retry"
        else:
            return "fail"
    
    # =========================================================================
    # UTILITY METHODS
    # =========================================================================
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get workflow execution metrics"""
        return {
            "workflow_name": self.workflow_name,
            "mode": self.mode.value,
            "execution_count": self._execution_count,
            "error_count": self._error_count,
            "cache_hit_count": self._cache_hit_count,
            "cache_hit_rate": (
                self._cache_hit_count / self._execution_count 
                if self._execution_count > 0 else 0.0
            )
        }
    
    async def cleanup(self):
        """Cleanup workflow resources"""
        logger.info("🧹 Workflow cleanup completed", workflow=self.workflow_name)


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_node_with_error_handling(
    node_fn: Callable,
    node_name: str
) -> Callable:
    """
    Wrap node function with error handling.
    
    Args:
        node_fn: Node function to wrap
        node_name: Name of node for logging
        
    Returns:
        Wrapped node function
    """
    async def wrapped_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        try:
            logger.debug(f"Executing node: {node_name}")
            result = await node_fn(state)
            return result
        except Exception as e:
            logger.error(
                f"Node execution failed: {node_name}",
                error=str(e),
                error_type=type(e).__name__
            )
            return {
                **state,
                'errors': state.get('errors', []) + [f"{node_name}: {str(e)}"],
                'status': ExecutionStatus.FAILED
            }
    
    return wrapped_node


def create_caching_wrapper(
    node_fn: Callable,
    cache_key_fn: Callable[[UnifiedWorkflowState], str],
    cache_manager
) -> Callable:
    """
    Wrap node function with caching.
    
    Golden Rule #2: Cache integration
    
    Args:
        node_fn: Node function to wrap
        cache_key_fn: Function to generate cache key
        cache_manager: Cache manager instance
        
    Returns:
        Wrapped node function with caching
    """
    async def wrapped_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        if not cache_manager or not cache_manager.enabled:
            return await node_fn(state)
        
        # Generate cache key
        cache_key = cache_key_fn(state)
        
        # Check cache
        cached_result = await cache_manager.get(cache_key)
        if cached_result:
            logger.debug("Cache hit for node", cache_key=cache_key[:32])
            return {
                **state,
                **cached_result,
                'cache_hits': state.get('cache_hits', 0) + 1
            }
        
        # Execute node
        result = await node_fn(state)
        
        # Cache result
        await cache_manager.set(cache_key, result, ttl=3600)
        
        return result
    
    return wrapped_node

