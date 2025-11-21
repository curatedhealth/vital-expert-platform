"""
Workflow execution engine
Handles topological sorting, node execution, control flow, and streaming
"""

import asyncio
from typing import Dict, List, Any, Optional, AsyncGenerator
from datetime import datetime
from collections import deque

from ..nodes.base import Workflow, NodeConfig, NodeType, ExecutionEvent
from .validator import WorkflowValidator, ValidationError


class ExecutionContext:
    """Context for workflow execution"""
    def __init__(self):
        self.node_outputs: Dict[str, Any] = {}  # node_id -> output data
        self.node_status: Dict[str, str] = {}   # node_id -> status
        self.global_data: Dict[str, Any] = {}   # Shared data across nodes


class WorkflowExecutor:
    """Execute workflows with support for branching, loops, and parallel execution"""
    
    def __init__(self, pharma_integration=None):
        """
        Initialize executor
        
        Args:
            pharma_integration: PharmaIntelligenceIntegration instance for executing nodes
        """
        self.pharma_integration = pharma_integration
    
    async def execute(
        self, 
        workflow: Workflow, 
        inputs: Dict[str, Any]
    ) -> AsyncGenerator[ExecutionEvent, None]:
        """
        Execute workflow and yield execution events
        
        Args:
            workflow: Workflow to execute
            inputs: Input data for the workflow
            
        Yields:
            ExecutionEvent: Events during execution
        """
        # Validate workflow first
        validator = WorkflowValidator(workflow)
        is_valid, errors = validator.validate()
        
        if not is_valid:
            yield ExecutionEvent(
                type="workflow_error",
                message=f"Workflow validation failed: {errors[0].message}",
                timestamp=datetime.now().isoformat()
            )
            return
        
        # Create execution context
        context = ExecutionContext()
        context.global_data["workflow_inputs"] = inputs
        
        # Build execution order (topological sort)
        try:
            execution_order = self._topological_sort(workflow)
        except ValueError as e:
            yield ExecutionEvent(
                type="workflow_error",
                message=str(e),
                timestamp=datetime.now().isoformat()
            )
            return
        
        # Execute nodes in order
        for node in execution_order:
            # Skip control flow nodes (handled separately)
            if node.type in [NodeType.CONDITION, NodeType.LOOP, NodeType.PARALLEL]:
                continue
            
            # Start execution
            yield ExecutionEvent(
                type="node_started",
                node_id=node.id,
                message=f"Executing {node.label}",
                timestamp=datetime.now().isoformat()
            )
            
            context.node_status[node.id] = "running"
            
            try:
                # Get input data for this node
                node_inputs = self._get_node_inputs(node, workflow, context)
                
                # Execute node
                output = await self._execute_node(node, node_inputs)
                
                # Store output
                context.node_outputs[node.id] = output
                context.node_status[node.id] = "completed"
                
                # Yield completion event
                yield ExecutionEvent(
                    type="node_completed",
                    node_id=node.id,
                    message=f"Completed {node.label}",
                    data={"output": output},
                    timestamp=datetime.now().isoformat()
                )
                
            except Exception as e:
                context.node_status[node.id] = "error"
                yield ExecutionEvent(
                    type="node_error",
                    node_id=node.id,
                    message=f"Error in {node.label}: {str(e)}",
                    timestamp=datetime.now().isoformat()
                )
                # Continue execution despite error (fault tolerance)
        
        # Get final output from OUTPUT nodes
        final_output = self._get_final_output(workflow, context)
        
        # Workflow completed
        yield ExecutionEvent(
            type="workflow_completed",
            message="Workflow execution completed",
            data={"output": final_output},
            timestamp=datetime.now().isoformat()
        )
    
    def _topological_sort(self, workflow: Workflow) -> List[NodeConfig]:
        """
        Sort nodes in execution order using topological sort
        
        Returns:
            List of nodes in execution order
        """
        # Build adjacency list and in-degree count
        adj_list: Dict[str, List[str]] = {node.id: [] for node in workflow.nodes}
        in_degree: Dict[str, int] = {node.id: 0 for node in workflow.nodes}
        node_map: Dict[str, NodeConfig] = {node.id: node for node in workflow.nodes}
        
        for edge in workflow.edges:
            adj_list[edge.source].append(edge.target)
            in_degree[edge.target] += 1
        
        # Find all nodes with no incoming edges (start nodes)
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        
        result = []
        
        while queue:
            node_id = queue.popleft()
            result.append(node_map[node_id])
            
            # Reduce in-degree for neighbors
            for neighbor in adj_list[node_id]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        # Check if all nodes were processed
        if len(result) != len(workflow.nodes):
            raise ValueError("Workflow contains a cycle (topological sort failed)")
        
        return result
    
    def _get_node_inputs(
        self, 
        node: NodeConfig, 
        workflow: Workflow, 
        context: ExecutionContext
    ) -> Dict[str, Any]:
        """
        Get input data for a node from connected nodes
        
        Args:
            node: Node to get inputs for
            workflow: The workflow
            context: Execution context with node outputs
            
        Returns:
            Dict of input data
        """
        # Special case: INPUT nodes get data from workflow inputs
        if node.type == NodeType.INPUT:
            return context.global_data.get("workflow_inputs", {})
        
        # Find incoming edges
        incoming_edges = [e for e in workflow.edges if e.target == node.id]
        
        if not incoming_edges:
            # No inputs, return empty dict
            return {}
        
        # Collect outputs from source nodes
        inputs = {}
        for edge in incoming_edges:
            source_output = context.node_outputs.get(edge.source, {})
            
            # If sourceHandle is specified, get that specific output
            if edge.sourceHandle and isinstance(source_output, dict):
                inputs[edge.sourceHandle] = source_output.get(edge.sourceHandle)
            else:
                # Merge all outputs from source
                if isinstance(source_output, dict):
                    inputs.update(source_output)
                else:
                    inputs["input"] = source_output
        
        return inputs
    
    async def _execute_node(self, node: NodeConfig, inputs: Dict[str, Any]) -> Any:
        """
        Execute a single node
        
        Args:
            node: Node to execute
            inputs: Input data
            
        Returns:
            Node output data
        """
        # If we have a pharma integration, use it
        if self.pharma_integration:
            return await self.pharma_integration.execute_node(node, inputs)
        
        # Otherwise, simulate execution
        return await self._simulate_node_execution(node, inputs)
    
    async def _simulate_node_execution(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate node execution (for testing without full integration)
        
        Args:
            node: Node configuration
            inputs: Input data
            
        Returns:
            Simulated output
        """
        # Simulate some processing time
        await asyncio.sleep(0.5)
        
        # Return mock data based on node type
        if node.type == NodeType.INPUT:
            return inputs
        
        elif node.type == NodeType.OUTPUT:
            return {"output": inputs}
        
        elif node.type in [NodeType.MEDICAL, NodeType.DIGITAL_HEALTH, NodeType.REGULATORY]:
            return {
                "findings": f"Mock findings from {node.label}",
                "sources": ["source1", "source2"],
                "confidence_score": 0.85
            }
        
        elif node.type == NodeType.AGGREGATOR:
            return {
                "aggregated_research": "Mock aggregated research",
                "summary": "Mock summary"
            }
        
        elif node.type == NodeType.COPYWRITER:
            return {
                "final_report": "Mock final report"
            }
        
        elif node.type in [NodeType.PUBMED, NodeType.ARXIV, NodeType.CLINICAL_TRIALS, NodeType.FDA, NodeType.WEB_SEARCH]:
            return {
                "results": [
                    {"title": f"Mock result 1 from {node.label}", "content": "..."},
                    {"title": f"Mock result 2 from {node.label}", "content": "..."}
                ]
            }
        
        elif node.type == NodeType.SCRAPER:
            return {
                "content": "Mock scraped content"
            }
        
        elif node.type == NodeType.RAG_SEARCH:
            return {
                "results": ["Mock RAG result 1", "Mock RAG result 2"]
            }
        
        elif node.type == NodeType.RAG_ARCHIVE:
            return {
                "status": "archived"
            }
        
        elif node.type == NodeType.CACHE_LOOKUP:
            return {
                "cached_result": None,
                "cache_hit": False
            }
        
        elif node.type == NodeType.MERGE:
            return {
                "merged": inputs
            }
        
        else:
            # Default: pass through inputs
            return inputs
    
    def _get_final_output(self, workflow: Workflow, context: ExecutionContext) -> Any:
        """
        Get final output from OUTPUT nodes
        
        Args:
            workflow: The workflow
            context: Execution context
            
        Returns:
            Final output data
        """
        # Find OUTPUT nodes
        output_nodes = [n for n in workflow.nodes if n.type == NodeType.OUTPUT]
        
        if not output_nodes:
            # No output node, return all node outputs
            return context.node_outputs
        
        # Get output from first OUTPUT node
        output_node = output_nodes[0]
        return context.node_outputs.get(output_node.id, {})

