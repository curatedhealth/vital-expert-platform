"""
VITAL Path - Execution Module

Orchestrates workflow execution using compiled LangGraph graphs.
Handles both synchronous and asynchronous execution patterns.

Components:
- WorkflowRunner: Main execution orchestrator
- ExecutionContext: Runtime context for workflow state
- ResultCollector: Aggregates results from workflow nodes
- StreamManager: Handles SSE streaming during execution

Usage:
    from modules.execution import WorkflowRunner
    
    runner = WorkflowRunner()
    result = await runner.execute(workflow_id, input_data, stream=True)
"""

from .runner import WorkflowRunner, ExecutionResult
from .context import ExecutionContext
from .stream_manager import StreamManager
from .result_collector import ResultCollector

__all__ = [
    "WorkflowRunner",
    "ExecutionResult",
    "ExecutionContext",
    "StreamManager",
    "ResultCollector",
]










