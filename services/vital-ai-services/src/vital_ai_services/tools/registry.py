"""
Tool Registry - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

Centralized tool management and execution orchestration.

Features:
- Tool registration and discovery
- Tool execution with tracking
- Tool statistics and analytics
- Category-based filtering
- Tenant-aware access control

Usage:
    from vital_ai_services.tools import ToolRegistry, BaseTool
    from vital_ai_services.core.models import ToolInput, ToolOutput
    
    # Create registry
    registry = ToolRegistry()
    
    # Register tools
    registry.register(WebSearchTool())
    registry.register(RAGTool(rag_service))
    
    # Execute tool
    output = await registry.execute(
        tool_name="web_search",
        input_data="What are FDA IND requirements?",
        context={"max_results": 5}
    )
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import structlog

from vital_ai_services.tools.base import BaseTool
from vital_ai_services.core.models import ToolInput, ToolOutput, ToolExecution
from vital_ai_services.core.exceptions import ToolExecutionError

logger = structlog.get_logger()


class ToolRegistry:
    """
    Centralized registry for tool management and execution.
    
    TAG: TOOL_REGISTRY
    
    Provides:
    - Tool registration and discovery
    - Tool execution orchestration
    - Execution history tracking
    - Statistics aggregation
    - Category-based filtering
    """
    
    def __init__(self):
        """Initialize empty tool registry."""
        self._tools: Dict[str, BaseTool] = {}
        self._execution_history: List[ToolExecution] = []
        logger.info("✅ ToolRegistry initialized")
    
    def register(self, tool: BaseTool) -> None:
        """
        Register a tool.
        
        Args:
            tool: Tool instance to register
            
        Raises:
            ToolExecutionError: If tool name already registered
        """
        if tool.name in self._tools:
            raise ToolExecutionError(
                f"Tool '{tool.name}' is already registered",
                details={"tool_name": tool.name}
            )
        
        self._tools[tool.name] = tool
        logger.info(f"✅ Tool registered: {tool.name}", category=tool.category)
    
    def unregister(self, tool_name: str) -> bool:
        """
        Unregister a tool.
        
        Args:
            tool_name: Name of tool to unregister
            
        Returns:
            True if unregistered, False if not found
        """
        if tool_name in self._tools:
            del self._tools[tool_name]
            logger.info(f"Tool unregistered: {tool_name}")
            return True
        return False
    
    def get_tool(self, tool_name: str) -> Optional[BaseTool]:
        """
        Get a registered tool by name.
        
        Args:
            tool_name: Tool name
            
        Returns:
            Tool instance or None if not found
        """
        return self._tools.get(tool_name)
    
    def has_tool(self, tool_name: str) -> bool:
        """
        Check if tool is registered.
        
        Args:
            tool_name: Tool name
            
        Returns:
            True if registered, False otherwise
        """
        return tool_name in self._tools
    
    def list_tools(
        self,
        category: Optional[str] = None,
        tenant_aware_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        List all registered tools.
        
        Args:
            category: Optional category filter
            tenant_aware_only: Only return tenant-aware tools
            
        Returns:
            List of tool metadata dictionaries
        """
        tools = []
        for tool in self._tools.values():
            # Apply filters
            if category and tool.category != category:
                continue
            if tenant_aware_only and not tool.requires_tenant_access:
                continue
            
            tools.append({
                "name": tool.name,
                "description": tool.description,
                "category": tool.category,
                "requires_tenant_access": tool.requires_tenant_access,
                "stats": tool.get_stats()
            })
        
        return tools
    
    def get_categories(self) -> List[str]:
        """
        Get all unique tool categories.
        
        Returns:
            List of category strings
        """
        return list(set(tool.category for tool in self._tools.values()))
    
    async def execute(
        self,
        tool_name: str,
        input_data: Any,
        context: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> ToolOutput:
        """
        Execute a tool by name.
        
        Args:
            tool_name: Name of tool to execute
            input_data: Tool input data
            context: Optional execution context
            tenant_id: Optional tenant ID for tenant-aware tools
            user_id: Optional user ID
            session_id: Optional session ID
            
        Returns:
            ToolOutput with execution results
            
        Raises:
            ToolExecutionError: If tool not found or execution fails
        """
        # Get tool
        tool = self.get_tool(tool_name)
        if not tool:
            raise ToolExecutionError(
                f"Tool '{tool_name}' not found",
                details={"tool_name": tool_name, "available_tools": list(self._tools.keys())}
            )
        
        # Check tenant access
        if tool.requires_tenant_access and not tenant_id:
            raise ToolExecutionError(
                f"Tool '{tool_name}' requires tenant_id",
                details={"tool_name": tool_name}
            )
        
        # Build tool input
        tool_input = ToolInput(
            tool_name=tool_name,
            data=input_data,
            context=context or {},
            tenant_id=tenant_id,
            user_id=user_id,
            session_id=session_id
        )
        
        # Execute with tracking
        start_time = datetime.utcnow()
        try:
            output = await tool.execute_with_tracking(tool_input)
            
            # Log execution
            execution = ToolExecution(
                tool_name=tool_name,
                input_data=input_data,
                output_data=output.data,
                success=output.success,
                error_message=output.error_message,
                execution_time_ms=output.execution_time_ms or 0.0,
                cost_usd=output.cost_usd,
                timestamp=start_time
            )
            self._execution_history.append(execution)
            
            # Limit history size
            if len(self._execution_history) > 1000:
                self._execution_history = self._execution_history[-1000:]
            
            return output
        
        except Exception as e:
            logger.error(f"Tool execution failed: {tool_name}", error=str(e))
            raise ToolExecutionError(
                f"Tool execution failed: {str(e)}",
                details={"tool_name": tool_name, "error": str(e)}
            )
    
    def get_execution_history(
        self,
        tool_name: Optional[str] = None,
        limit: int = 100
    ) -> List[ToolExecution]:
        """
        Get recent tool execution history.
        
        Args:
            tool_name: Optional tool name filter
            limit: Maximum number of executions to return
            
        Returns:
            List of ToolExecution records
        """
        history = self._execution_history
        
        if tool_name:
            history = [e for e in history if e.tool_name == tool_name]
        
        return history[-limit:]
    
    def get_stats(
        self,
        tool_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get aggregated statistics.
        
        Args:
            tool_name: Optional tool name filter (if None, returns all tools)
            
        Returns:
            Statistics dictionary
        """
        if tool_name:
            tool = self.get_tool(tool_name)
            if not tool:
                return {}
            return tool.get_stats()
        
        # Aggregate stats for all tools
        total_executions = sum(t.execution_count for t in self._tools.values())
        total_successes = sum(t.success_count for t in self._tools.values())
        total_failures = sum(t.failure_count for t in self._tools.values())
        total_cost = sum(t.total_cost_usd for t in self._tools.values())
        
        return {
            "total_tools": len(self._tools),
            "categories": self.get_categories(),
            "total_executions": total_executions,
            "total_successes": total_successes,
            "total_failures": total_failures,
            "overall_success_rate": total_successes / total_executions if total_executions > 0 else 0.0,
            "total_cost_usd": total_cost,
            "tool_stats": {name: tool.get_stats() for name, tool in self._tools.items()}
        }
    
    def reset_all_stats(self) -> None:
        """Reset statistics for all tools."""
        for tool in self._tools.values():
            tool.reset_stats()
        self._execution_history.clear()
        logger.info("All tool statistics reset")
    
    def __repr__(self) -> str:
        """String representation."""
        return f"ToolRegistry(tools={len(self._tools)}, categories={len(self.get_categories())})"

