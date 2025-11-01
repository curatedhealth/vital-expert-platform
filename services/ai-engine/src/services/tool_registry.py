"""
Gold Standard Tool Registry

Central management system for all tools in the autonomous agent platform.

Features:
- Tool registration with tenant access control
- Tool discovery by category, tenant, or capability
- Usage tracking and analytics
- Tool health monitoring
- Global and tenant-specific tool access
- Tool versioning support

Usage:
    >>> from services.tool_registry import get_tool_registry
    >>> from tools.rag_tool import RAGTool
    >>> 
    >>> # Get global registry
    >>> registry = get_tool_registry()
    >>> 
    >>> # Register tool
    >>> registry.register_tool(RAGTool(rag_service), is_global=True)
    >>> 
    >>> # Get tool
    >>> tool = registry.get_tool("rag_search")
    >>> 
    >>> # Get available tools for tenant
    >>> tools = registry.get_available_tools(tenant_id="tenant-123")
"""

from typing import Dict, List, Optional, Set
from collections import defaultdict
import structlog

from tools.base_tool import BaseTool

logger = structlog.get_logger()


# ============================================================================
# TOOL REGISTRY
# ============================================================================

class ToolRegistry:
    """
    Central registry for all available tools.
    
    Responsibilities:
    - Tool registration with access control
    - Tool discovery and retrieval
    - Usage tracking
    - Health monitoring
    - Analytics
    
    Features:
    - Multi-tenant support (tenant-specific tools)
    - Global tools (available to all tenants)
    - Category-based organization
    - Usage statistics
    - Tool versioning (future)
    """
    
    def __init__(self):
        """Initialize empty registry."""
        # Core storage
        self._tools: Dict[str, BaseTool] = {}
        
        # Access control
        self._tenant_tools: Dict[str, Set[str]] = defaultdict(set)
        self._global_tools: Set[str] = set()
        
        # Organization
        self._category_tools: Dict[str, Set[str]] = defaultdict(set)
        
        # Analytics
        self._tool_usage: Dict[str, int] = defaultdict(int)
        self._tool_errors: Dict[str, int] = defaultdict(int)
        
        logger.info("✅ ToolRegistry initialized")
    
    # ========================================================================
    # REGISTRATION
    # ========================================================================
    
    def register_tool(
        self,
        tool: BaseTool,
        allowed_tenants: Optional[List[str]] = None,
        is_global: bool = True
    ) -> None:
        """
        Register a tool in the registry.
        
        Args:
            tool: Tool instance to register
            allowed_tenants: List of tenant IDs with access (None = use is_global)
            is_global: If True, available to all tenants unless allowed_tenants specified
            
        Examples:
            >>> # Register global tool
            >>> registry.register_tool(RAGTool(), is_global=True)
            >>> 
            >>> # Register tenant-specific tool
            >>> registry.register_tool(CustomTool(), allowed_tenants=["tenant-1"], is_global=False)
            >>> 
            >>> # Register tool for specific tenants only
            >>> registry.register_tool(PremiumTool(), allowed_tenants=["premium-1", "premium-2"])
        """
        tool_name = tool.name
        
        # Check for conflicts
        if tool_name in self._tools:
            logger.warning(
                "Tool already registered, replacing",
                tool=tool_name,
                old_type=type(self._tools[tool_name]).__name__,
                new_type=type(tool).__name__
            )
        
        # Store tool
        self._tools[tool_name] = tool
        
        # Add to category index
        self._category_tools[tool.category].add(tool_name)
        
        # Set up access control
        if allowed_tenants:
            # Specific tenants only
            for tenant_id in allowed_tenants:
                self._tenant_tools[tenant_id].add(tool_name)
            
            logger.info(
                "Tool registered for specific tenants",
                tool=tool_name,
                category=tool.category,
                tenant_count=len(allowed_tenants)
            )
        elif is_global:
            # Available to all tenants
            self._global_tools.add(tool_name)
            
            logger.info(
                "Tool registered globally",
                tool=tool_name,
                category=tool.category
            )
        else:
            # Restricted (must be explicitly added to tenants later)
            logger.info(
                "Tool registered (restricted access)",
                tool=tool_name,
                category=tool.category
            )
    
    def unregister_tool(self, tool_name: str) -> bool:
        """
        Unregister a tool from the registry.
        
        Args:
            tool_name: Name of tool to unregister
            
        Returns:
            True if tool was unregistered, False if not found
        """
        if tool_name not in self._tools:
            logger.warning(f"Tool not found for unregistration: {tool_name}")
            return False
        
        # Remove from all indexes
        tool = self._tools[tool_name]
        del self._tools[tool_name]
        
        self._category_tools[tool.category].discard(tool_name)
        self._global_tools.discard(tool_name)
        
        for tenant_tools in self._tenant_tools.values():
            tenant_tools.discard(tool_name)
        
        logger.info(f"Tool unregistered: {tool_name}")
        return True
    
    def grant_tenant_access(self, tool_name: str, tenant_id: str) -> bool:
        """
        Grant a tenant access to a tool.
        
        Args:
            tool_name: Name of tool
            tenant_id: Tenant to grant access
            
        Returns:
            True if access granted, False if tool not found
        """
        if tool_name not in self._tools:
            logger.warning(f"Tool not found: {tool_name}")
            return False
        
        self._tenant_tools[tenant_id].add(tool_name)
        logger.info(f"Granted tenant access", tool=tool_name, tenant_id=tenant_id[:8])
        return True
    
    def revoke_tenant_access(self, tool_name: str, tenant_id: str) -> bool:
        """
        Revoke a tenant's access to a tool.
        
        Args:
            tool_name: Name of tool
            tenant_id: Tenant to revoke access
            
        Returns:
            True if access revoked, False if not found
        """
        if tenant_id not in self._tenant_tools:
            return False
        
        self._tenant_tools[tenant_id].discard(tool_name)
        logger.info(f"Revoked tenant access", tool=tool_name, tenant_id=tenant_id[:8])
        return True
    
    # ========================================================================
    # RETRIEVAL
    # ========================================================================
    
    def get_tool(self, name: str) -> Optional[BaseTool]:
        """
        Get tool by name.
        
        Args:
            name: Tool name
            
        Returns:
            Tool instance or None if not found
        """
        return self._tools.get(name)
    
    def get_available_tools(
        self,
        tenant_id: Optional[str] = None,
        category: Optional[str] = None,
        only_tenant_specific: bool = False
    ) -> List[BaseTool]:
        """
        Get available tools, optionally filtered by tenant and category.
        
        Args:
            tenant_id: Filter by tenant access (None = no tenant filter)
            category: Filter by tool category (None = all categories)
            only_tenant_specific: If True, exclude global tools
            
        Returns:
            List of available tools
            
        Examples:
            >>> # Get all global tools
            >>> tools = registry.get_available_tools()
            >>> 
            >>> # Get tools available to a tenant
            >>> tools = registry.get_available_tools(tenant_id="tenant-123")
            >>> 
            >>> # Get retrieval tools for a tenant
            >>> tools = registry.get_available_tools(tenant_id="tenant-123", category="retrieval")
        """
        # Start with all tools
        available_names = set(self._tools.keys())
        
        # Apply tenant filter
        if tenant_id:
            tenant_tools = self._tenant_tools.get(tenant_id, set())
            
            if only_tenant_specific:
                # Only tenant-specific tools
                available_names &= tenant_tools
            else:
                # Tenant-specific + global tools
                available_names &= (tenant_tools | self._global_tools)
        elif not only_tenant_specific:
            # No tenant filter, return global tools
            available_names &= self._global_tools
        else:
            # only_tenant_specific without tenant_id = no tools
            available_names = set()
        
        # Apply category filter
        if category and category in self._category_tools:
            available_names &= self._category_tools[category]
        
        # Convert to tool instances
        tools = [self._tools[name] for name in available_names if name in self._tools]
        
        # Sort by name for consistency
        tools.sort(key=lambda t: t.name)
        
        return tools
    
    def get_tool_names(
        self,
        tenant_id: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[str]:
        """
        Get names of available tools.
        
        Args:
            tenant_id: Filter by tenant
            category: Filter by category
            
        Returns:
            List of tool names
        """
        tools = self.get_available_tools(tenant_id, category)
        return [t.name for t in tools]
    
    def get_tool_descriptions(
        self,
        tenant_id: Optional[str] = None,
        category: Optional[str] = None,
        format: str = "markdown"
    ) -> str:
        """
        Get formatted descriptions for LLM tool selection.
        
        Args:
            tenant_id: Filter by tenant
            category: Filter by category
            format: Output format ("markdown", "plain", "json")
            
        Returns:
            Formatted string of tool descriptions
            
        Example output (markdown):
            **rag_search** (retrieval): Search internal knowledge base for FDA regulations...
            **web_search** (retrieval): Search the internet for current information...
        """
        tools = self.get_available_tools(tenant_id, category)
        
        if not tools:
            return "No tools available."
        
        if format == "markdown":
            descriptions = []
            for tool in tools:
                descriptions.append(
                    f"**{tool.name}** ({tool.category}): {tool.description}"
                )
            return "\n".join(descriptions)
        
        elif format == "plain":
            descriptions = []
            for tool in tools:
                descriptions.append(
                    f"{tool.name} ({tool.category}): {tool.description}"
                )
            return "\n".join(descriptions)
        
        elif format == "json":
            import json
            tool_data = [
                {
                    "name": t.name,
                    "category": t.category,
                    "description": t.description
                }
                for t in tools
            ]
            return json.dumps(tool_data, indent=2)
        
        else:
            raise ValueError(f"Unknown format: {format}")
    
    # ========================================================================
    # ANALYTICS
    # ========================================================================
    
    def record_usage(self, tool_name: str, success: bool = True) -> None:
        """
        Record tool usage for analytics.
        
        Args:
            tool_name: Name of tool used
            success: Whether execution was successful
        """
        self._tool_usage[tool_name] += 1
        
        if not success:
            self._tool_errors[tool_name] += 1
    
    def get_usage_stats(self, tool_name: Optional[str] = None) -> Dict:
        """
        Get tool usage statistics.
        
        Args:
            tool_name: Specific tool (None = all tools)
            
        Returns:
            Dictionary with usage statistics
        """
        if tool_name:
            tool = self.get_tool(tool_name)
            if not tool:
                return {}
            
            return {
                'tool_name': tool_name,
                'usage_count': self._tool_usage.get(tool_name, 0),
                'error_count': self._tool_errors.get(tool_name, 0),
                'tool_stats': tool.get_stats()
            }
        else:
            # All tools
            return {
                'total_tools': len(self._tools),
                'global_tools': len(self._global_tools),
                'total_usage': sum(self._tool_usage.values()),
                'total_errors': sum(self._tool_errors.values()),
                'tool_usage': dict(self._tool_usage),
                'tool_errors': dict(self._tool_errors),
                'by_category': self.get_stats_by_category()
            }
    
    def get_stats_by_category(self) -> Dict[str, Dict]:
        """
        Get usage statistics grouped by category.
        
        Returns:
            Dictionary with category-level stats
        """
        category_stats = {}
        
        for category, tool_names in self._category_tools.items():
            category_usage = sum(self._tool_usage.get(name, 0) for name in tool_names)
            category_errors = sum(self._tool_errors.get(name, 0) for name in tool_names)
            
            category_stats[category] = {
                'tool_count': len(tool_names),
                'total_usage': category_usage,
                'total_errors': category_errors,
                'error_rate': category_errors / category_usage if category_usage > 0 else 0.0
            }
        
        return category_stats
    
    def get_most_used_tools(self, limit: int = 10) -> List[tuple]:
        """
        Get most frequently used tools.
        
        Args:
            limit: Maximum number of tools to return
            
        Returns:
            List of (tool_name, usage_count) tuples
        """
        sorted_usage = sorted(
            self._tool_usage.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_usage[:limit]
    
    # ========================================================================
    # INSPECTION
    # ========================================================================
    
    def list_all_tools(self) -> List[str]:
        """Get names of all registered tools."""
        return sorted(self._tools.keys())
    
    def list_categories(self) -> List[str]:
        """Get all tool categories."""
        return sorted(self._category_tools.keys())
    
    def get_tenant_tool_count(self, tenant_id: str) -> int:
        """Get number of tools available to a tenant."""
        return len(self.get_available_tools(tenant_id))
    
    def is_tool_available(self, tool_name: str, tenant_id: Optional[str] = None) -> bool:
        """
        Check if tool is available.
        
        Args:
            tool_name: Name of tool
            tenant_id: Tenant ID (None = check if tool exists)
            
        Returns:
            True if tool is available
        """
        if tool_name not in self._tools:
            return False
        
        if tenant_id is None:
            return True
        
        # Check if tenant has access
        return (
            tool_name in self._global_tools or
            tool_name in self._tenant_tools.get(tenant_id, set())
        )
    
    # ========================================================================
    # UTILITIES
    # ========================================================================
    
    def __len__(self) -> int:
        """Return number of registered tools."""
        return len(self._tools)
    
    def __contains__(self, tool_name: str) -> bool:
        """Check if tool is registered."""
        return tool_name in self._tools
    
    def __repr__(self) -> str:
        """String representation of registry."""
        return (
            f"ToolRegistry("
            f"tools={len(self._tools)}, "
            f"global={len(self._global_tools)}, "
            f"categories={len(self._category_tools)})"
        )


# ============================================================================
# GLOBAL REGISTRY SINGLETON
# ============================================================================

_global_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    """
    Get the global tool registry instance.
    
    Returns:
        Global ToolRegistry singleton
        
    Usage:
        >>> from services.tool_registry import get_tool_registry
        >>> registry = get_tool_registry()
        >>> tool = registry.get_tool("rag_search")
    """
    global _global_registry
    
    if _global_registry is None:
        _global_registry = ToolRegistry()
        logger.info("Global tool registry created")
    
    return _global_registry


def reset_tool_registry() -> None:
    """
    Reset the global registry (mainly for testing).
    
    Creates a fresh registry instance.
    """
    global _global_registry
    _global_registry = ToolRegistry()
    logger.warning("Global tool registry reset")

