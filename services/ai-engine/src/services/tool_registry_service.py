"""
Tool Registry Service with Supabase Backend
Manages tools, agent-tool linking, and execution logging
"""

import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog
from uuid import UUID

from services.supabase_client import SupabaseClient
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class ToolRegistryService:
    """
    Service for managing tools and agent-tool relationships via Supabase.
    
    Features:
    - Get tools from database
    - Link tools to agents
    - Log tool executions
    - Query tool analytics
    - LangGraph integration
    """
    
    def __init__(self, supabase_client: SupabaseClient):
        self.supabase = supabase_client
        self._tool_cache: Dict[str, Dict[str, Any]] = {}
        
    async def get_tool_by_code(self, tool_code: str) -> Optional[Dict[str, Any]]:
        """
        Get tool configuration by tool_code.
        
        Args:
            tool_code: Tool identifier (e.g., 'web_search', 'rag_search')
            
        Returns:
            Tool configuration or None if not found
        """
        # Check cache first
        if tool_code in self._tool_cache:
            return self._tool_cache[tool_code]
        
        try:
            response = await self.supabase.table("tools").select("*").eq("tool_code", tool_code).eq("status", "active").execute()
            
            if response.data and len(response.data) > 0:
                tool = response.data[0]
                self._tool_cache[tool_code] = tool
                return tool
            
            logger.warning("Tool not found", tool_code=tool_code)
            return None
            
        except Exception as e:
            logger.error("Failed to fetch tool", tool_code=tool_code, error=str(e))
            return None
    
    async def get_agent_tools(
        self,
        agent_id: str,
        context: Optional[str] = None,
        enabled_only: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get all tools available to an agent.
        
        Args:
            agent_id: Agent identifier
            context: Optional context filter (e.g., 'autonomous', 'interactive')
            enabled_only: Only return enabled tools
            
        Returns:
            List of tool configurations with agent-specific settings
        """
        try:
            # Use the database function for efficient querying
            response = await self.supabase.rpc(
                "get_agent_tools",
                {"p_agent_id": agent_id, "p_context": context}
            ).execute()
            
            tools = response.data if response.data else []
            
            logger.info(
                "✅ Retrieved agent tools",
                agent_id=agent_id[:8],
                tools_count=len(tools),
                context=context
            )
            
            return tools
            
        except Exception as e:
            logger.error("Failed to fetch agent tools", agent_id=agent_id, error=str(e))
            return []
    
    async def link_tool_to_agent(
        self,
        agent_id: str,
        tool_code: str,
        priority: int = 50,
        custom_config: Optional[Dict[str, Any]] = None,
        auto_approve: bool = False,
        allowed_contexts: Optional[List[str]] = None
    ) -> bool:
        """
        Link a tool to an agent.
        
        Args:
            agent_id: Agent identifier
            tool_code: Tool code to link
            priority: Tool priority (1-100, higher = preferred)
            custom_config: Agent-specific tool configuration
            auto_approve: Whether agent can use tool without confirmation
            allowed_contexts: Contexts where tool is allowed
            
        Returns:
            Success status
        """
        try:
            # Get tool_id from tool_code
            tool = await self.get_tool_by_code(tool_code)
            if not tool:
                logger.error("Cannot link unknown tool", tool_code=tool_code)
                return False
            
            tool_id = tool["tool_id"]
            
            # Insert or update agent_tools
            data = {
                "agent_id": agent_id,
                "tool_id": tool_id,
                "priority": priority,
                "custom_config": custom_config or {},
                "auto_approve": auto_approve,
                "allowed_contexts": allowed_contexts,
                "is_enabled": True,
            }
            
            response = await self.supabase.table("agent_tools").upsert(data, on_conflict="agent_id,tool_id").execute()
            
            logger.info(
                "✅ Tool linked to agent",
                agent_id=agent_id[:8],
                tool_code=tool_code,
                priority=priority
            )
            
            return True
            
        except Exception as e:
            logger.error("Failed to link tool to agent", agent_id=agent_id, tool_code=tool_code, error=str(e))
            return False
    
    async def log_tool_execution(
        self,
        tool_code: str,
        agent_id: str,
        tenant_id: str,
        input_params: Dict[str, Any],
        output_result: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        status: str = "success",
        execution_time_ms: Optional[int] = None,
        session_id: Optional[str] = None,
        workflow_run_id: Optional[str] = None,
        node_name: Optional[str] = None
    ) -> Optional[str]:
        """
        Log a tool execution to the database.
        
        Args:
            tool_code: Tool identifier
            agent_id: Agent that used the tool
            tenant_id: Tenant ID for isolation
            input_params: Tool input parameters
            output_result: Tool output
            error_message: Error message if failed
            status: Execution status (success, failed, timeout)
            execution_time_ms: Execution time in milliseconds
            session_id: Session ID
            workflow_run_id: LangGraph workflow run ID
            node_name: LangGraph node name
            
        Returns:
            Execution ID or None if failed
        """
        try:
            # Use the database function for atomic logging
            response = await self.supabase.rpc(
                "log_tool_execution",
                {
                    "p_tool_code": tool_code,
                    "p_agent_id": agent_id,
                    "p_tenant_id": tenant_id,
                    "p_input_params": input_params,
                    "p_output_result": output_result,
                    "p_error_message": error_message,
                    "p_status": status,
                    "p_execution_time_ms": execution_time_ms,
                    "p_session_id": session_id,
                    "p_workflow_run_id": workflow_run_id
                }
            ).execute()
            
            execution_id = response.data if response.data else None
            
            logger.info(
                "✅ Tool execution logged",
                tool_code=tool_code,
                agent_id=agent_id[:8],
                status=status,
                execution_id=str(execution_id)[:8] if execution_id else None
            )
            
            return str(execution_id) if execution_id else None
            
        except Exception as e:
            logger.error("Failed to log tool execution", tool_code=tool_code, error=str(e))
            return None
    
    async def get_tool_analytics(
        self,
        tool_code: Optional[str] = None,
        agent_id: Optional[str] = None,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get tool usage analytics.
        
        Args:
            tool_code: Optional tool filter
            agent_id: Optional agent filter
            days: Number of days to analyze
            
        Returns:
            Analytics data
        """
        try:
            # Query materialized view
            query = self.supabase.table("tool_analytics").select("*")
            
            if tool_code:
                query = query.eq("tool_code", tool_code)
            
            response = await query.execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error("Failed to fetch tool analytics", error=str(e))
            return []
    
    async def refresh_analytics(self):
        """Refresh the tool analytics materialized view"""
        try:
            await self.supabase.rpc("refresh_tool_analytics").execute()
            logger.info("✅ Tool analytics refreshed")
        except Exception as e:
            logger.error("Failed to refresh tool analytics", error=str(e))
    
    async def create_langgraph_tools(
        self,
        agent_id: str,
        context: Optional[str] = None
    ) -> List[Any]:
        """
        Create LangChain-compatible tools for LangGraph workflows.
        
        This dynamically loads tools from the database and creates
        LangChain StructuredTool instances.
        
        Args:
            agent_id: Agent identifier
            context: Optional context (autonomous, interactive, etc.)
            
        Returns:
            List of LangChain Tool instances
        """
        from langchain.tools import StructuredTool
        from pydantic import BaseModel, Field, create_model
        
        tools = await self.get_agent_tools(agent_id, context)
        langgraph_tools = []
        
        for tool_config in tools:
            tool_code = tool_config["tool_code"]
            tool_name = tool_config["tool_name"]
            tool_description = tool_config["tool_description"]
            input_schema = tool_config.get("input_schema", {})
            
            try:
                # Import the tool function dynamically
                module_path = tool_config["implementation_path"]
                function_name = tool_config.get("function_name", tool_code)
                
                # Dynamic import
                module = __import__(module_path, fromlist=[function_name])
                tool_function = getattr(module, function_name)
                
                # Create Pydantic model from JSON schema
                # For now, use a simple dict input model
                # TODO: Generate proper Pydantic model from JSON schema
                
                # Create LangChain StructuredTool
                structured_tool = StructuredTool.from_function(
                    func=tool_function,
                    name=tool_code,
                    description=tool_description,
                    # args_schema=InputModel,  # TODO: Generate from input_schema
                )
                
                langgraph_tools.append(structured_tool)
                
                logger.debug(
                    "✅ Created LangGraph tool",
                    tool_code=tool_code,
                    agent_id=agent_id[:8]
                )
                
            except Exception as e:
                logger.error(
                    "Failed to create LangGraph tool",
                    tool_code=tool_code,
                    error=str(e)
                )
                continue
        
        logger.info(
            "✅ Created LangGraph tools",
            agent_id=agent_id[:8],
            tools_count=len(langgraph_tools)
        )
        
        return langgraph_tools
    
    def clear_cache(self):
        """Clear the tool cache"""
        self._tool_cache.clear()
        logger.info("Tool cache cleared")


# Global instance
_tool_registry: Optional[ToolRegistryService] = None


def get_tool_registry() -> Optional[ToolRegistryService]:
    """Get global tool registry instance"""
    return _tool_registry


async def initialize_tool_registry(supabase_client: SupabaseClient) -> ToolRegistryService:
    """
    Initialize global tool registry service.
    
    Args:
        supabase_client: Initialized Supabase client
        
    Returns:
        Tool registry service
    """
    global _tool_registry
    
    _tool_registry = ToolRegistryService(supabase_client)
    
    logger.info("✅ Tool registry service initialized")
    
    return _tool_registry

