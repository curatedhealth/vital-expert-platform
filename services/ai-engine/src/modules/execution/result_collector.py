"""
VITAL Path - Result Collector

Aggregates results from workflow node executions.
Provides a unified view of all outputs during and after execution.
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, List, Optional
from collections import OrderedDict

logger = logging.getLogger(__name__)


@dataclass
class NodeResult:
    """Result from a single node execution."""
    
    node_id: str
    node_type: str
    output: Any
    timestamp: datetime = field(default_factory=datetime.utcnow)
    duration_ms: Optional[float] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_success(self) -> bool:
        return self.error is None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "node_type": self.node_type,
            "output": self.output,
            "timestamp": self.timestamp.isoformat(),
            "duration_ms": self.duration_ms,
            "error": self.error,
            "is_success": self.is_success,
            "metadata": self.metadata,
        }


class ResultCollector:
    """
    Collects and aggregates results from workflow execution.
    
    Features:
    - Ordered storage of node results
    - Filter by node type or status
    - Aggregate statistics
    - Final output extraction
    
    Usage:
        collector = ResultCollector()
        
        # During execution
        collector.add_node_result(
            node_id="expert_1",
            node_type="expert",
            output={"response": "..."},
            duration_ms=1234.5,
        )
        
        # After execution
        final_output = collector.get_final_output()
        all_results = collector.get_all_results()
    """
    
    def __init__(self):
        self._results: OrderedDict[str, NodeResult] = OrderedDict()
        self._generic_results: Dict[str, Any] = {}
        self._final_output: Optional[Any] = None
    
    def add_node_result(
        self,
        node_id: str,
        node_type: str,
        output: Any,
        duration_ms: float = None,
        error: str = None,
        metadata: Dict[str, Any] = None,
    ) -> None:
        """
        Add a result from a node execution.
        
        Args:
            node_id: Unique identifier for the node
            node_type: Type of the node (expert, router, etc.)
            output: Output data from the node
            duration_ms: Execution duration in milliseconds
            error: Error message if failed
            metadata: Additional metadata
        """
        result = NodeResult(
            node_id=node_id,
            node_type=node_type,
            output=output,
            duration_ms=duration_ms,
            error=error,
            metadata=metadata or {},
        )
        
        self._results[node_id] = result
        
        logger.debug(
            f"Collected result from {node_type} node {node_id}: "
            f"success={result.is_success}, duration={duration_ms}ms"
        )
    
    def add_result(self, key: str, value: Any) -> None:
        """
        Add a generic result (not tied to a specific node).
        
        Useful for intermediate state or aggregated data.
        """
        self._generic_results[key] = value
    
    def set_final_output(self, output: Any) -> None:
        """Set the final workflow output."""
        self._final_output = output
    
    def get_node_result(self, node_id: str) -> Optional[NodeResult]:
        """Get result for a specific node."""
        return self._results.get(node_id)
    
    def get_results_by_type(self, node_type: str) -> List[NodeResult]:
        """Get all results for a specific node type."""
        return [
            r for r in self._results.values()
            if r.node_type == node_type
        ]
    
    def get_successful_results(self) -> List[NodeResult]:
        """Get all successful node results."""
        return [r for r in self._results.values() if r.is_success]
    
    def get_failed_results(self) -> List[NodeResult]:
        """Get all failed node results."""
        return [r for r in self._results.values() if not r.is_success]
    
    def get_all_results(self) -> Dict[str, Any]:
        """
        Get all collected results as a dictionary.
        
        Returns:
            Dictionary with node_results, generic_results, and final_output
        """
        return {
            "node_results": {
                node_id: result.to_dict()
                for node_id, result in self._results.items()
            },
            "generic_results": self._generic_results,
            "final_output": self._final_output,
        }
    
    def get_final_output(self) -> Any:
        """
        Get the final workflow output.
        
        If no explicit final output is set, attempts to extract
        from the last 'end' node or the last node executed.
        """
        if self._final_output is not None:
            return self._final_output
        
        # Try to find end node result
        end_results = self.get_results_by_type("end")
        if end_results:
            return end_results[-1].output
        
        # Return last node's output
        if self._results:
            last_result = list(self._results.values())[-1]
            return last_result.output
        
        return None
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get execution statistics.
        
        Returns:
            Dictionary with counts, timings, and success rates
        """
        results = list(self._results.values())
        
        if not results:
            return {
                "total_nodes": 0,
                "successful_nodes": 0,
                "failed_nodes": 0,
                "success_rate": 0.0,
                "total_duration_ms": 0,
                "average_duration_ms": 0,
            }
        
        successful = [r for r in results if r.is_success]
        failed = [r for r in results if not r.is_success]
        durations = [r.duration_ms for r in results if r.duration_ms is not None]
        
        return {
            "total_nodes": len(results),
            "successful_nodes": len(successful),
            "failed_nodes": len(failed),
            "success_rate": len(successful) / len(results) if results else 0.0,
            "total_duration_ms": sum(durations),
            "average_duration_ms": sum(durations) / len(durations) if durations else 0,
            "nodes_by_type": self._count_by_type(),
        }
    
    def _count_by_type(self) -> Dict[str, int]:
        """Count results by node type."""
        counts: Dict[str, int] = {}
        for result in self._results.values():
            counts[result.node_type] = counts.get(result.node_type, 0) + 1
        return counts
    
    def clear(self) -> None:
        """Clear all collected results."""
        self._results.clear()
        self._generic_results.clear()
        self._final_output = None
    
    def merge_messages(self) -> List[Dict[str, Any]]:
        """
        Merge all message outputs into a conversation history.
        
        Useful for chat-based workflows.
        """
        messages = []
        
        for result in self._results.values():
            output = result.output
            
            if isinstance(output, dict):
                # Check for message-like structure
                if "messages" in output:
                    messages.extend(output["messages"])
                elif "content" in output and "role" in output:
                    messages.append(output)
                elif "response" in output:
                    messages.append({
                        "role": "assistant",
                        "content": output["response"],
                        "metadata": {
                            "node_id": result.node_id,
                            "node_type": result.node_type,
                        }
                    })
            elif isinstance(output, str):
                messages.append({
                    "role": "assistant",
                    "content": output,
                    "metadata": {
                        "node_id": result.node_id,
                        "node_type": result.node_type,
                    }
                })
        
        return messages











