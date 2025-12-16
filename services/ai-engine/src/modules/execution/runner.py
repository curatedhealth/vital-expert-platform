"""
VITAL Path - Workflow Runner

Main execution orchestrator for compiled LangGraph workflows.
Handles both sync and async execution patterns.
"""

import logging
import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional, AsyncGenerator, List
from enum import Enum

from langgraph.graph import StateGraph

from modules.translator import (
    parse_react_flow_json,
    validate_workflow_graph,
    WorkflowCompiler,
    ParsedWorkflow,
    ValidationResult,
)
from .context import ExecutionContext, ExecutionMetrics
from .result_collector import ResultCollector
from .stream_manager import StreamManager

logger = logging.getLogger(__name__)


class ExecutionStatus(str, Enum):
    """Status of workflow execution."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


@dataclass
class ExecutionResult:
    """Result of workflow execution."""
    
    execution_id: str
    status: ExecutionStatus
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metrics: Optional[ExecutionMetrics] = None
    node_results: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_success(self) -> bool:
        return self.status == ExecutionStatus.COMPLETED
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "execution_id": self.execution_id,
            "status": self.status.value,
            "output": self.output,
            "error": self.error,
            "metrics": self.metrics.to_dict() if self.metrics else None,
            "node_results": self.node_results,
        }


class WorkflowRunner:
    """
    Orchestrates workflow execution.
    
    Responsibilities:
    - Load and compile workflows
    - Execute with proper context
    - Handle streaming events
    - Track metrics and budget
    - Support cancellation
    
    Usage:
        runner = WorkflowRunner()
        
        # Sync execution
        result = await runner.execute(workflow_id, input_data)
        
        # Streaming execution
        async for event in runner.execute_stream(workflow_id, input_data):
            print(event)
    """
    
    def __init__(
        self,
        compiler: WorkflowCompiler = None,
    ):
        # Parser and validator are now functions, not classes
        self._parse = parse_react_flow_json
        self._validate = validate_workflow_graph
        self.compiler = compiler or WorkflowCompiler()
        
        # Cache compiled workflows
        self._compiled_cache: Dict[str, StateGraph] = {}
    
    async def execute(
        self,
        workflow_definition: Dict[str, Any],
        input_data: Dict[str, Any],
        context: ExecutionContext = None,
    ) -> ExecutionResult:
        """
        Execute a workflow synchronously.
        
        Args:
            workflow_definition: React Flow JSON or workflow dict
            input_data: Input data for the workflow
            context: Execution context (created if not provided)
        
        Returns:
            ExecutionResult with output and metrics
        """
        context = context or ExecutionContext()
        collector = ResultCollector()
        
        try:
            # Compile workflow
            compiled = await self._compile_workflow(workflow_definition)
            
            if not compiled:
                return ExecutionResult(
                    execution_id=context.execution_id,
                    status=ExecutionStatus.FAILED,
                    error="Workflow compilation failed",
                    metrics=context.metrics,
                )
            
            # Check budget before execution
            if not await context.check_budget(estimated_tokens=2000):
                return ExecutionResult(
                    execution_id=context.execution_id,
                    status=ExecutionStatus.FAILED,
                    error="Token budget exceeded",
                    metrics=context.metrics,
                )
            
            # Emit start event
            await context.emit("execution_started", {
                "execution_id": context.execution_id,
                "workflow_id": context.workflow_id,
            })
            
            # Execute the compiled graph
            logger.info(f"Starting execution {context.execution_id}")
            
            # Prepare initial state
            initial_state = {
                "input": input_data,
                "messages": [],
                "context": context.variables,
                "metadata": {
                    "execution_id": context.execution_id,
                    "tenant_id": context.tenant_id,
                    "user_id": context.user_id,
                },
            }
            
            # Run with timeout
            try:
                result = await asyncio.wait_for(
                    self._run_graph(compiled, initial_state, context, collector),
                    timeout=context.timeout_seconds,
                )
            except asyncio.TimeoutError:
                logger.warning(f"Execution {context.execution_id} timed out")
                context.metrics.complete()
                return ExecutionResult(
                    execution_id=context.execution_id,
                    status=ExecutionStatus.TIMEOUT,
                    error=f"Execution timed out after {context.timeout_seconds}s",
                    metrics=context.metrics,
                    node_results=collector.get_all_results(),
                )
            
            # Check for cancellation
            if context.is_cancelled:
                context.metrics.complete()
                return ExecutionResult(
                    execution_id=context.execution_id,
                    status=ExecutionStatus.CANCELLED,
                    metrics=context.metrics,
                    node_results=collector.get_all_results(),
                )
            
            # Success
            context.metrics.complete()
            
            await context.emit("execution_completed", {
                "execution_id": context.execution_id,
                "output": result,
            })
            
            return ExecutionResult(
                execution_id=context.execution_id,
                status=ExecutionStatus.COMPLETED,
                output=result,
                metrics=context.metrics,
                node_results=collector.get_all_results(),
            )
            
        except Exception as e:
            logger.exception(f"Execution {context.execution_id} failed: {str(e)}")
            context.metrics.complete()
            
            await context.emit("execution_failed", {
                "execution_id": context.execution_id,
                "error": str(e),
            })
            
            return ExecutionResult(
                execution_id=context.execution_id,
                status=ExecutionStatus.FAILED,
                error=str(e),
                metrics=context.metrics,
                node_results=collector.get_all_results(),
            )
    
    async def execute_stream(
        self,
        workflow_definition: Dict[str, Any],
        input_data: Dict[str, Any],
        context: ExecutionContext = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute a workflow with streaming events.
        
        Yields SSE-compatible events during execution.
        
        Args:
            workflow_definition: React Flow JSON or workflow dict
            input_data: Input data for the workflow
            context: Execution context
        
        Yields:
            Event dictionaries with type and data
        """
        context = context or ExecutionContext(stream_enabled=True)
        stream_manager = StreamManager()
        
        # Register event handlers to capture events
        event_queue: asyncio.Queue = asyncio.Queue()
        
        async def queue_event(event_type: str, data: Any):
            await event_queue.put({"type": event_type, "data": data})
        
        context.on("execution_started", lambda e, d: asyncio.create_task(queue_event(e, d)))
        context.on("node_started", lambda e, d: asyncio.create_task(queue_event(e, d)))
        context.on("node_completed", lambda e, d: asyncio.create_task(queue_event(e, d)))
        context.on("token_generated", lambda e, d: asyncio.create_task(queue_event(e, d)))
        context.on("execution_completed", lambda e, d: asyncio.create_task(queue_event(e, d)))
        context.on("execution_failed", lambda e, d: asyncio.create_task(queue_event(e, d)))
        
        # Start execution in background
        execution_task = asyncio.create_task(
            self.execute(workflow_definition, input_data, context)
        )
        
        # Yield events as they come in
        try:
            while not execution_task.done():
                try:
                    event = await asyncio.wait_for(event_queue.get(), timeout=0.1)
                    yield stream_manager.format_event(event)
                except asyncio.TimeoutError:
                    continue
            
            # Drain remaining events
            while not event_queue.empty():
                event = await event_queue.get()
                yield stream_manager.format_event(event)
            
            # Get final result
            result = await execution_task
            yield stream_manager.format_event({
                "type": "result",
                "data": result.to_dict(),
            })
            
        except Exception as e:
            yield stream_manager.format_event({
                "type": "error",
                "data": {"error": str(e)},
            })
    
    async def _compile_workflow(
        self,
        workflow_definition: Dict[str, Any],
    ) -> Optional[StateGraph]:
        """
        Compile workflow definition to executable graph.
        
        Uses caching to avoid recompilation of unchanged workflows.
        """
        # Check cache by workflow ID if available
        workflow_id = workflow_definition.get("id")
        if workflow_id and workflow_id in self._compiled_cache:
            return self._compiled_cache[workflow_id]
        
        try:
            # Parse
            parsed = self._parse(workflow_definition)
            
            # Validate
            validation = self._validate(parsed)
            if not validation.is_valid:
                logger.error(f"Workflow validation failed: {validation.errors}")
                return None
            
            # Compile
            compilation = self.compiler.compile(parsed)
            if not compilation.success:
                logger.error(f"Workflow compilation failed: {compilation.error}")
                return None
            
            # Cache
            if workflow_id:
                self._compiled_cache[workflow_id] = compilation.compiled
            
            return compilation.compiled
            
        except Exception as e:
            logger.exception(f"Workflow compilation error: {str(e)}")
            return None
    
    async def _run_graph(
        self,
        graph: StateGraph,
        initial_state: Dict[str, Any],
        context: ExecutionContext,
        collector: ResultCollector,
    ) -> Dict[str, Any]:
        """
        Run the compiled LangGraph.
        
        Handles node-by-node execution with event emission.
        """
        state = initial_state.copy()
        
        # Get the compiled runnable
        runnable = graph.compile()
        
        # Execute with streaming if supported
        if context.stream_enabled and hasattr(runnable, 'astream'):
            async for chunk in runnable.astream(state):
                # Check cancellation
                if context.is_cancelled:
                    break
                
                # Check iteration limit
                if not context.increment_iteration():
                    raise RuntimeError("Max iterations exceeded")
                
                # Emit progress
                await context.emit("node_completed", {
                    "iteration": context.iteration_count,
                    "state_keys": list(chunk.keys()) if isinstance(chunk, dict) else None,
                })
                
                # Collect result
                if isinstance(chunk, dict):
                    for key, value in chunk.items():
                        collector.add_result(f"iter_{context.iteration_count}_{key}", value)
                    state.update(chunk)
        else:
            # Non-streaming execution
            result = await runnable.ainvoke(state)
            if isinstance(result, dict):
                state.update(result)
                collector.add_result("final", result)
        
        return state
    
    def clear_cache(self, workflow_id: str = None) -> None:
        """
        Clear compiled workflow cache.
        
        Args:
            workflow_id: Specific workflow to clear, or None for all
        """
        if workflow_id:
            self._compiled_cache.pop(workflow_id, None)
        else:
            self._compiled_cache.clear()










