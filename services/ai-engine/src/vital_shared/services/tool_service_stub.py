"""
Tool Service Implementation (Stub for Testing)

This is a minimal implementation to support testing.
Full implementation pending as part of tool orchestration TODO.
"""

from typing import Dict, Any, List
from vital_shared.interfaces.tool_service import IToolService
import structlog

logger = structlog.get_logger(__name__)


class ToolService(IToolService):
    """
    Tool Service implementation.
    
    TODO: Full implementation pending (Phase 1 Week 2 TODO: phase1-tool-orchestration)
    This stub allows tests to run while we complete the architecture review.
    """
    
    async def suggest_tools(
        self,
        tenant_id: str,
        query: str,
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Suggest tools based on query.
        
        Stub implementation - always returns empty list.
        """
        logger.debug("tool_suggestion_stub", tenant_id=tenant_id[:8])
        return []
    
    async def execute_tool(
        self,
        tenant_id: str,
        tool_name: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a specific tool.
        
        Stub implementation - returns mock result.
        """
        logger.debug("tool_execution_stub", tenant_id=tenant_id[:8], tool=tool_name)
        return {"result": "stub_result", "tool": tool_name}
    
    async def get_available_tools(self, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Get list of available tools.
        
        Stub implementation - returns empty list.
        """
        return []

