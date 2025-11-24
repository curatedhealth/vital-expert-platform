"""
Router, Tool, and Human Node Compilers

Compiles router, tool, and human-in-the-loop nodes.

Router Nodes:
- Conditional routing based on state evaluation
- Route to different paths based on logic

Tool Nodes:
- Execute external tools or APIs
- Store results in state

Human Nodes:
- Pause execution for human review
- Mark state for human oversight
"""

from typing import Dict, Any, Callable, Optional
from uuid import UUID
import json

from ..compiler import AgentState
from ...graphrag.clients import get_postgres_client
from ...graphrag.utils.logger import get_logger

logger = get_logger(__name__)


class RouterNodeCompiler:
    """Compiles router nodes for conditional routing"""
    
    def __init__(self):
        self.pg_client = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize dependencies"""
        if self._initialized:
            return
        self.pg_client = await get_postgres_client()
        self._initialized = True
        
    async def compile(self, node: Dict[str, Any]) -> Callable:
        """
        Compile router node.
        
        Router logic is defined in node['config']['routing_logic'].
        """
        if not self._initialized:
            await self.initialize()
            
        logger.info(f"Compiling router node: {node['name']}")
        
        config = node.get('config', {})
        routing_logic = config.get('routing_logic', {})
        
        async def router_node(state: AgentState) -> AgentState:
            logger.info(f"Executing router: {node['name']}")
            
            # Evaluate routing logic
            next_node = self._evaluate_routing_logic(
                routing_logic, state
            )
            
            state['next_node'] = next_node
            state['current_node'] = node['name']
            
            logger.info(
                f"Router {node['name']} directing to: {next_node}"
            )
            
            return state
            
        return router_node
        
    def _evaluate_routing_logic(
        self,
        logic: Dict[str, Any],
        state: AgentState
    ) -> str:
        """
        Evaluate routing logic against state.
        
        TODO: Implement full JSON logic evaluation
        For now, simple key-based routing.
        """
        # Check for simple key-based routing
        if 'key' in logic:
            key = logic['key']
            value = state.get(key)
            
            # Map value to target
            routes = logic.get('routes', {})
            return routes.get(str(value), logic.get('default', 'default'))
            
        # Check for confidence-based routing
        if 'confidence_threshold' in logic:
            threshold = logic['confidence_threshold']
            confidence = state.get('confidence', 0)
            
            if confidence >= threshold:
                return logic.get('high_confidence_route', 'high')
            else:
                return logic.get('low_confidence_route', 'low')
                
        # Default routing
        return state.get('next_node', 'default')


class ToolNodeCompiler:
    """Compiles tool nodes for external tool execution"""
    
    def __init__(self):
        self.pg_client = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize dependencies"""
        if self._initialized:
            return
        self.pg_client = await get_postgres_client()
        self._initialized = True
        
    async def compile(self, node: Dict[str, Any]) -> Callable:
        """
        Compile tool node.
        
        Tool configuration is in node['config']:
        - tool_name: Name of tool to execute
        - tool_params: Parameters to pass
        """
        if not self._initialized:
            await self.initialize()
            
        logger.info(f"Compiling tool node: {node['name']}")
        
        config = node.get('config', {})
        tool_name = config.get('tool_name', node['name'])
        
        async def tool_node(state: AgentState) -> AgentState:
            logger.info(f"Executing tool: {tool_name}")
            
            try:
                # TODO: Implement actual tool execution in Phase 2.4
                # For now, placeholder
                result = {
                    "tool": tool_name,
                    "status": "success",
                    "output": f"Tool {tool_name} executed (placeholder)"
                }
                
                # Store result
                if 'tool_results' not in state:
                    state['tool_results'] = {}
                state['tool_results'][tool_name] = result
                
                state['current_node'] = node['name']
                
                logger.info(f"Tool {tool_name} completed successfully")
                
            except Exception as e:
                logger.error(f"Error in tool {tool_name}: {e}")
                state['tool_results'] = state.get('tool_results', {})
                state['tool_results'][tool_name] = {
                    "tool": tool_name,
                    "status": "error",
                    "error": str(e)
                }
                state['escalation_reason'] = "tool_error"
                
            return state
            
        return tool_node


class HumanNodeCompiler:
    """Compiles human-in-the-loop nodes"""
    
    def __init__(self):
        self.pg_client = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize dependencies"""
        if self._initialized:
            return
        self.pg_client = await get_postgres_client()
        self._initialized = True
        
    async def compile(self, node: Dict[str, Any]) -> Callable:
        """
        Compile human node.
        
        Human nodes pause execution and wait for human input.
        """
        if not self._initialized:
            await self.initialize()
            
        logger.info(f"Compiling human node: {node['name']}")
        
        config = node.get('config', {})
        review_type = config.get('review_type', 'approval')
        
        async def human_node(state: AgentState) -> AgentState:
            logger.info(
                f"Executing human node: {node['name']} "
                f"(review_type={review_type})"
            )
            
            # Mark state for human review
            state['requires_human_review'] = True
            state['human_review_type'] = review_type
            state['human_review_node'] = node['name']
            state['current_node'] = node['name']
            
            # Add context for human reviewer
            if 'human_review_context' not in state:
                state['human_review_context'] = {}
                
            state['human_review_context'][node['name']] = {
                "query": state.get('query'),
                "response": state.get('response'),
                "confidence": state.get('confidence'),
                "evidence_count": len(state.get('evidence_chain', [])),
                "review_type": review_type
            }
            
            logger.info(
                f"Human review required at node: {node['name']}"
            )
            
            # In actual implementation, this would pause the graph
            # execution until human provides input via API
            
            return state
            
        return human_node


# Singletons
_router_compiler: Optional['RouterNodeCompiler'] = None
_tool_compiler: Optional['ToolNodeCompiler'] = None
_human_compiler: Optional['HumanNodeCompiler'] = None


async def get_router_node_compiler() -> RouterNodeCompiler:
    """Get or create router node compiler singleton"""
    global _router_compiler
    if _router_compiler is None:
        _router_compiler = RouterNodeCompiler()
        await _router_compiler.initialize()
    return _router_compiler


async def get_tool_node_compiler() -> ToolNodeCompiler:
    """Get or create tool node compiler singleton"""
    global _tool_compiler
    if _tool_compiler is None:
        _tool_compiler = ToolNodeCompiler()
        await _tool_compiler.initialize()
    return _tool_compiler


async def get_human_node_compiler() -> HumanNodeCompiler:
    """Get or create human node compiler singleton"""
    global _human_compiler
    if _human_compiler is None:
        _human_compiler = HumanNodeCompiler()
        await _human_compiler.initialize()
    return _human_compiler

