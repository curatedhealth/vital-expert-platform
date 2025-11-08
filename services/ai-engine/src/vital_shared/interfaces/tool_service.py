"""
Tool Service Interface

Defines the contract for tool management and execution.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class IToolService(ABC):
    """Interface for tool operations."""
    
    @abstractmethod
    async def decide_tools(
        self,
        query: str,
        requested_tools: Optional[List[str]] = None,
        agent_capabilities: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Decide which tools to use for a query.
        
        Args:
            query: User's query
            requested_tools: Tools explicitly requested by user
            agent_capabilities: Tools available to agent
            
        Returns:
            Dict with suggested_tools, reasoning, needs_confirmation
        """
        pass
    
    @abstractmethod
    async def execute_tools(
        self,
        tools: List[str],
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Execute multiple tools in parallel.
        
        Args:
            tools: List of tool names to execute
            context: Execution context (query, parameters, etc.)
            
        Returns:
            List of tool results with status, output, duration
        """
        pass
    
    @abstractmethod
    async def get_tool_metadata(
        self,
        tool_name: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a tool.
        
        Args:
            tool_name: Tool identifier
            
        Returns:
            Tool metadata or None if not found
        """
        pass
    
    @abstractmethod
    async def list_available_tools(
        self,
        agent_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List all available tools.
        
        Args:
            agent_id: Filter by agent capabilities
            
        Returns:
            List of tool metadata
        """
        pass

