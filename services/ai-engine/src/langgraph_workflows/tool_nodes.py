"""
Tool Nodes for Mode 1 Workflow

Adds tool suggestion, confirmation, and execution capabilities to Mode 1.

Nodes:
- tool_suggestion_node: Analyzes query and suggests tools
- tool_execution_node: Executes approved tools
"""

import structlog
from typing import Dict, Any, List
from datetime import datetime

from services.tool_suggestion_service import (
    SmartToolSuggestionService,
    ToolSuggestionResult
)
from services.tool_execution_service import (
    ToolExecutionService,
    ToolResult
)
from langgraph_workflows.state_schemas import UnifiedWorkflowState

logger = structlog.get_logger(__name__)


class ToolWorkflowNodes:
    """Tool-related nodes for LangGraph workflows"""
    
    def __init__(self):
        self.suggestion_service = SmartToolSuggestionService()
        self.execution_service = ToolExecutionService()
    
    async def tool_suggestion_node(
        self,
        state: UnifiedWorkflowState
    ) -> UnifiedWorkflowState:
        """
        Analyze query and suggest appropriate tools
        
        Outputs:
        - tool_suggestions: List of suggested tools
        - needs_tool_confirmation: Whether user approval needed
        - tool_confirmation_message: Message to show user
        """
        
        query = state.get("query", "")
        enable_tools = state.get("enable_tools", True)  # Default: enabled
        requested_tools = state.get("requested_tools", [])
        
        logger.info(
            "🔧 Tool suggestion node",
            enable_tools=enable_tools,
            has_requested_tools=bool(requested_tools)
        )
        
        # If tools disabled, skip
        if not enable_tools:
            logger.info("⏭️  Tools disabled, skipping")
            return {
                **state,
                "tool_suggestions": [],
                "needs_tool_confirmation": False,
                "tools_to_execute": [],
                "current_node": "tool_suggestion"
            }
        
        try:
            # Get tool suggestions
            if requested_tools:
                # User explicitly requested tools
                logger.info("👤 User requested tools", tools=requested_tools)
                result = await self.suggestion_service.suggest_from_user_request(
                    requested_tools=requested_tools,
                    query=query
                )
            else:
                # Analyze query and suggest
                logger.info("🤖 Analyzing query for tool suggestions")
                result = await self.suggestion_service.suggest_tools(
                    query=query,
                    context={
                        "agent_id": state.get("selected_agents", [None])[0],
                        "tenant_id": state.get("tenant_id"),
                        "session_id": state.get("session_id")
                    }
                )
            
            # Log result
            logger.info(
                "✅ Tool suggestion complete",
                needs_tools=result.needs_tools,
                tool_count=len(result.suggested_tools),
                needs_confirmation=result.needs_confirmation
            )
            
            # If no tools needed, continue without tools
            if not result.needs_tools:
                return {
                    **state,
                    "tool_suggestions": [],
                    "needs_tool_confirmation": False,
                    "tools_to_execute": [],
                    "tool_suggestion_reasoning": result.overall_reasoning,
                    "current_node": "tool_suggestion"
                }
            
            # Tools suggested
            tool_suggestions_dict = [
                {
                    "tool_name": t.tool_name,
                    "confidence": t.confidence,
                    "reasoning": t.reasoning,
                    "parameters": t.parameters
                }
                for t in result.suggested_tools
            ]
            
            # If confirmation needed, emit event and wait
            if result.needs_confirmation:
                logger.info(
                    "⚠️  Tool confirmation required",
                    tools=[t.tool_name for t in result.suggested_tools]
                )
                
                return {
                    **state,
                    "tool_suggestions": tool_suggestions_dict,
                    "needs_tool_confirmation": True,
                    "tool_confirmation_message": result.confirmation_message,
                    "tools_to_execute": [],  # Will be set after confirmation
                    "tool_suggestion_reasoning": result.overall_reasoning,
                    "pending_tool_suggestions": result.suggested_tools,  # Store for later
                    "current_node": "tool_suggestion"
                }
            
            # No confirmation needed, proceed to execution
            logger.info(
                "✅ No confirmation needed, proceeding to execution",
                tools=[t.tool_name for t in result.suggested_tools]
            )
            
            return {
                **state,
                "tool_suggestions": tool_suggestions_dict,
                "needs_tool_confirmation": False,
                "tools_to_execute": result.suggested_tools,
                "tool_suggestion_reasoning": result.overall_reasoning,
                "current_node": "tool_suggestion"
            }
            
        except Exception as e:
            logger.error("❌ Tool suggestion failed", error=str(e), exc_info=True)
            
            # Don't fail the workflow, just skip tools
            return {
                **state,
                "tool_suggestions": [],
                "needs_tool_confirmation": False,
                "tools_to_execute": [],
                "tool_error": str(e),
                "current_node": "tool_suggestion"
            }
    
    async def tool_execution_node(
        self,
        state: UnifiedWorkflowState
    ) -> UnifiedWorkflowState:
        """
        Execute approved tools
        
        Inputs:
        - tools_to_execute: List of ToolSuggestion objects
        
        Outputs:
        - tool_results: List of ToolResult objects
        - tools_used: List of tool names that executed successfully
        """
        
        tools_to_execute = state.get("tools_to_execute", [])
        
        if not tools_to_execute:
            logger.info("⏭️  No tools to execute")
            return {
                **state,
                "tool_results": [],
                "tools_used": [],
                "current_node": "tool_execution"
            }
        
        logger.info(
            "🔧 Executing tools",
            tool_count=len(tools_to_execute),
            tools=[
                t.tool_name if hasattr(t, 'tool_name') else t.get('tool_name')
                for t in tools_to_execute
            ]
        )
        
        try:
            # Execute tools
            results = await self.execution_service.execute_tools(
                suggestions=tools_to_execute,
                context={
                    "tenant_id": state.get("tenant_id"),
                    "session_id": state.get("session_id"),
                    "agent_id": state.get("selected_agents", [None])[0]
                }
            )
            
            # Convert results to dict for state
            tool_results_dict = [
                {
                    "tool_name": r.tool_name,
                    "display_name": r.display_name,
                    "status": r.status,
                    "result": r.result,
                    "error": r.error,
                    "duration_seconds": r.duration_seconds,
                    "timestamp": r.timestamp,
                    "cost": r.cost
                }
                for r in results
            ]
            
            # Get list of successful tools
            tools_used = [
                r.tool_name 
                for r in results 
                if r.status == "success"
            ]
            
            # Calculate total cost
            total_cost = sum(r.cost for r in results)
            
            # Log summary
            successful = sum(1 for r in results if r.status == "success")
            failed = sum(1 for r in results if r.status == "error")
            
            logger.info(
                "✅ Tool execution complete",
                total=len(results),
                successful=successful,
                failed=failed,
                total_cost=total_cost,
                tools_used=tools_used
            )
            
            return {
                **state,
                "tool_results": tool_results_dict,
                "tools_used": tools_used,
                "tool_execution_cost": total_cost,
                "current_node": "tool_execution"
            }
            
        except Exception as e:
            logger.error("❌ Tool execution failed", error=str(e), exc_info=True)
            
            # Return error state but don't fail workflow
            return {
                **state,
                "tool_results": [],
                "tools_used": [],
                "tool_error": str(e),
                "current_node": "tool_execution"
            }
    
    def should_execute_tools(self, state: UnifiedWorkflowState) -> str:
        """
        Conditional edge: Should we execute tools?
        
        Returns:
        - "execute_tools" if tools ready to execute
        - "wait_confirmation" if waiting for user approval
        - "skip_tools" if no tools or confirmation declined
        """
        
        needs_confirmation = state.get("needs_tool_confirmation", False)
        tools_to_execute = state.get("tools_to_execute", [])
        tool_confirmation_approved = state.get("tool_confirmation_approved", None)
        
        # If confirmation needed and not yet answered
        if needs_confirmation and tool_confirmation_approved is None:
            logger.info("⏸️  Waiting for tool confirmation")
            return "wait_confirmation"
        
        # If confirmation needed and declined
        if needs_confirmation and tool_confirmation_approved is False:
            logger.info("🚫 Tool confirmation declined")
            return "skip_tools"
        
        # If tools ready to execute
        if tools_to_execute and len(tools_to_execute) > 0:
            logger.info("▶️  Executing tools")
            return "execute_tools"
        
        # No tools to execute
        logger.info("⏭️  No tools to execute")
        return "skip_tools"


# Singleton instance for use in workflows
_tool_nodes = ToolWorkflowNodes()

# Export convenience functions
async def tool_suggestion_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Tool suggestion node"""
    return await _tool_nodes.tool_suggestion_node(state)


async def tool_execution_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Tool execution node"""
    return await _tool_nodes.tool_execution_node(state)


def should_execute_tools(state: UnifiedWorkflowState) -> str:
    """Conditional edge function"""
    return _tool_nodes.should_execute_tools(state)

