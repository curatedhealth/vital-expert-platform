"""
VITAL Platform - Unified Tool Registry
=======================================
Integrates L5 Tools with Supabase tools database for dynamic configuration.
Supports syncing tools from database, caching, and hierarchical tool access.

Architecture:
    Supabase (tools table) ← Source of Truth for tool metadata
         ↓ Sync
    L5 Tools Registry ← Python implementations
         ↓ Used by
    L4 Workers ← Evidence preparation

Usage:
    from integrations.tool_registry import ToolRegistry
    
    registry = ToolRegistry()
    tool = await registry.get_tool("pubmed")
    result = await tool.execute({"query": "cancer immunotherapy"})
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import asyncio
import json
import structlog

logger = structlog.get_logger()


# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class ToolRecord:
    """Tool record from Supabase tools table."""
    id: str
    tenant_id: str
    name: str
    slug: str
    description: str
    tool_type: str
    category: str
    agent_level: int
    priority: str
    vendor: str
    license: str
    tags: List[str]
    is_active: bool
    is_enterprise: bool
    safety_level: Optional[str]
    requires_human_approval: bool
    allowed_failure_rate: float
    max_retries: int
    idempotent: bool
    has_side_effects: bool
    metadata: Dict[str, Any]
    
    @classmethod
    def from_supabase(cls, data: dict) -> "ToolRecord":
        """Create from Supabase row."""
        metadata = data.get("metadata", {})
        if isinstance(metadata, str):
            metadata = json.loads(metadata)
        
        tags = data.get("tags", [])
        if isinstance(tags, str):
            tags = json.loads(tags)
        
        return cls(
            id=data.get("id", ""),
            tenant_id=data.get("tenant_id", ""),
            name=data.get("name", ""),
            slug=data.get("slug", ""),
            description=data.get("description", ""),
            tool_type=data.get("tool_type", ""),
            category=data.get("category", ""),
            agent_level=metadata.get("tier", metadata.get("agent_level", 2)),
            priority=metadata.get("priority", "medium"),
            vendor=metadata.get("vendor", ""),
            license=metadata.get("license", ""),
            tags=tags,
            is_active=data.get("is_active", True),
            is_enterprise=data.get("is_enterprise", False),
            safety_level=data.get("safety_level"),
            requires_human_approval=data.get("requires_human_approval", False),
            allowed_failure_rate=data.get("allowed_failure_rate", 0.1),
            max_retries=data.get("max_retries", 3),
            idempotent=data.get("idempotent", True),
            has_side_effects=data.get("has_side_effects", False),
            metadata=metadata,
        )


# =============================================================================
# SUPABASE TOOL CLIENT
# =============================================================================

class SupabaseToolClient:
    """Client for tool CRUD operations in Supabase."""
    
    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None
    ):
        import os
        self.supabase_url = supabase_url or os.getenv(
            "SUPABASE_URL",
            "https://bomltkhixeatxuoxmolq.supabase.co"
        )
        self.supabase_key = supabase_key or os.getenv("SUPABASE_SERVICE_KEY", "")
        
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
        }
    
    async def get_all_tools(self, tenant_id: Optional[str] = None) -> List[ToolRecord]:
        """Get all tools, optionally filtered by tenant."""
        import httpx
        
        url = f"{self.supabase_url}/rest/v1/tools"
        params = {"select": "*", "is_active": "eq.true"}
        
        if tenant_id:
            params["tenant_id"] = f"eq.{tenant_id}"
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, params=params)
            
            if resp.status_code == 200:
                return [ToolRecord.from_supabase(t) for t in resp.json()]
        
        return []
    
    async def get_tool_by_slug(self, slug: str) -> Optional[ToolRecord]:
        """Get tool by slug."""
        import httpx
        
        url = f"{self.supabase_url}/rest/v1/tools?slug=eq.{slug}&select=*"
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers)
            
            if resp.status_code == 200 and resp.json():
                return ToolRecord.from_supabase(resp.json()[0])
        
        return None
    
    async def get_tools_by_level(self, level: int) -> List[ToolRecord]:
        """Get tools by level (legacy alias: tier)."""
        tools = await self.get_all_tools()
        return [t for t in tools if t.agent_level == level]
    
    async def get_tools_by_category(self, category: str) -> List[ToolRecord]:
        """Get tools by category."""
        import httpx
        
        url = f"{self.supabase_url}/rest/v1/tools?category=eq.{category}&select=*"
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers)
            
            if resp.status_code == 200:
                return [ToolRecord.from_supabase(t) for t in resp.json()]
        
        return []
    
    async def update_tool_stats(
        self,
        tool_id: str,
        usage_count_increment: int = 1,
        response_time_ms: Optional[float] = None,
        success: bool = True
    ) -> bool:
        """Update tool usage statistics."""
        import httpx
        
        url = f"{self.supabase_url}/rest/v1/tools?id=eq.{tool_id}"
        
        # Get current stats
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code != 200 or not resp.json():
                return False
            
            current = resp.json()[0]
            
            # Calculate new values
            new_count = (current.get("usage_count") or 0) + usage_count_increment
            
            if response_time_ms is not None:
                old_avg = current.get("average_response_time_ms") or 0
                old_count = current.get("usage_count") or 0
                if old_count > 0:
                    new_avg = ((old_avg * old_count) + response_time_ms) / (old_count + 1)
                else:
                    new_avg = response_time_ms
            else:
                new_avg = current.get("average_response_time_ms")
            
            # Update success rate
            old_rate = current.get("success_rate") or 1.0
            old_count = current.get("usage_count") or 0
            if old_count > 0:
                successes = old_rate * old_count
                new_successes = successes + (1 if success else 0)
                new_rate = new_successes / (old_count + 1)
            else:
                new_rate = 1.0 if success else 0.0
            
            # Update
            update_data = {
                "usage_count": new_count,
                "average_response_time_ms": new_avg,
                "success_rate": new_rate,
                "updated_at": datetime.utcnow().isoformat(),
            }
            
            resp = await client.patch(
                url,
                headers=self.headers,
                json=update_data
            )
            
            return resp.status_code == 200


# =============================================================================
# UNIFIED TOOL REGISTRY
# =============================================================================

class ToolRegistry:
    """
    Unified Tool Registry combining Supabase metadata with L5 implementations.
    
    Features:
    - Sync tools from Supabase
    - Cache tool configs
    - Provide L5 tool instances
    - Track usage statistics
    """
    
    def __init__(self, supabase_client: Optional[SupabaseToolClient] = None):
        self.supabase = supabase_client or SupabaseToolClient()
        self._cache: Dict[str, ToolRecord] = {}
        self._l5_tools: Dict[str, Any] = {}
        self._last_sync: Optional[datetime] = None
        self._sync_interval_seconds = 300  # 5 minutes
    
    async def sync_from_database(self, force: bool = False) -> int:
        """
        Sync tool configurations from Supabase.
        Returns number of tools synced.
        """
        if not force and self._last_sync:
            elapsed = (datetime.utcnow() - self._last_sync).total_seconds()
            if elapsed < self._sync_interval_seconds:
                return len(self._cache)
        
        try:
            tools = await self.supabase.get_all_tools()
            
            self._cache.clear()
            for tool in tools:
                self._cache[tool.slug] = tool
            
            self._last_sync = datetime.utcnow()
            
            logger.info(
                "ask_expert_tool_registry_synced",
                tool_count=len(tools),
            )
            
            return len(tools)
            
        except Exception as e:
            logger.error("ask_expert_tool_registry_sync_failed", error=str(e))
            return 0
    
    async def get_tool(self, slug: str) -> Optional[Any]:
        """
        Get L5 tool instance by slug.
        Creates tool if not cached, syncing config from Supabase.
        """
        # Ensure we have fresh config
        if not self._cache:
            await self.sync_from_database()
        
        # Check if tool exists in L5 implementation
        if slug not in self._l5_tools:
            try:
                from modules.ask_expert.agents.tools import create_l5_tool
                self._l5_tools[slug] = create_l5_tool(slug)
            except ValueError:
                # Tool not in L5 implementation
                logger.warning(
                    "ask_expert_tool_not_implemented",
                    slug=slug,
                )
                return None
        
        return self._l5_tools[slug]
    
    async def execute_tool(
        self,
        slug: str,
        params: Dict[str, Any],
        track_stats: bool = True
    ) -> Dict[str, Any]:
        """
        Execute a tool and optionally track statistics.
        """
        import time
        
        tool = await self.get_tool(slug)
        if not tool:
            return {"error": f"Tool not found: {slug}", "success": False}
        
        start_time = time.time()
        
        try:
            result = await tool.execute(params)
            execution_time = (time.time() - start_time) * 1000
            
            if track_stats and slug in self._cache:
                await self.supabase.update_tool_stats(
                    self._cache[slug].id,
                    response_time_ms=execution_time,
                    success=True,
                )
            
            return result.to_dict() if hasattr(result, 'to_dict') else result
            
        except Exception as e:
            if track_stats and slug in self._cache:
                await self.supabase.update_tool_stats(
                    self._cache[slug].id,
                    success=False,
                )
            
            return {"error": str(e), "success": False}
    
    def get_tool_config(self, slug: str) -> Optional[ToolRecord]:
        """Get tool configuration from cache."""
        return self._cache.get(slug)
    
    def list_tools(
        self,
        agent_level: Optional[int] = None,
        tags: Optional[List[str]] = None,
        category: Optional[str] = None,
    ) -> List[ToolRecord]:
        """List tools with optional filters."""
        tools = list(self._cache.values())
        
        if agent_level is not None:
            tools = [t for t in tools if t.agent_level == agent_level]
        
        if category:
            tools = [t for t in tools if t.category == category]
        
        if tags:
            tools = [t for t in tools if any(tag in t.tags for tag in tags)]
        
        return tools
    
    def list_critical_tools(self) -> List[ToolRecord]:
        """List level 1 (critical) tools."""
        return self.list_tools(agent_level=1)
    
    def get_tools_for_worker(self, worker_id: str) -> List[str]:
        """
        Get list of tool slugs a worker is allowed to use.
        Maps worker IDs to their allowed tools.
        """
        from modules.ask_expert.agents.workers import get_worker_config
        
        try:
            config = get_worker_config(worker_id)
            return config.allowed_l5_tools
        except ValueError:
            return []
    
    def get_stats(self) -> Dict[str, Any]:
        """Get registry statistics."""
        tools = list(self._cache.values())
        
        level_counts = {1: 0, 2: 0, 3: 0}
        for tool in tools:
            level_counts[tool.agent_level] = level_counts.get(tool.agent_level, 0) + 1
        
        return {
            "total_tools": len(tools),
            "by_level": level_counts,
            "last_sync": self._last_sync.isoformat() if self._last_sync else None,
            "cached_l5_tools": len(self._l5_tools),
        }


# =============================================================================
# L4 WORKER INTEGRATION
# =============================================================================

class L4WorkerToolBridge:
    """
    Bridge between L4 Workers and L5 Tools with permission checking.
    """
    
    def __init__(self, registry: ToolRegistry):
        self.registry = registry
    
    async def call_tool(
        self,
        worker_id: str,
        tool_slug: str,
        params: Dict[str, Any],
        tenant_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Call L5 tool from L4 worker with permission checking.
        """
        # Check permission
        allowed_tools = self.registry.get_tools_for_worker(worker_id)
        
        if tool_slug not in allowed_tools:
            logger.warning(
                "ask_expert_tool_permission_denied",
                worker_id=worker_id,
                tool_slug=tool_slug,
            )
            return {
                "error": f"Tool {tool_slug} not allowed for worker {worker_id}",
                "success": False,
            }
        
        # Execute tool
        result = await self.registry.execute_tool(tool_slug, params)
        
        logger.info(
            "ask_expert_l4_tool_call",
            worker_id=worker_id,
            tool_slug=tool_slug,
            success=result.get("success", False),
        )
        
        return result


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

# Global registry instance
_registry: Optional[ToolRegistry] = None


async def get_tool_registry() -> ToolRegistry:
    """Get or create the global tool registry."""
    global _registry
    
    if _registry is None:
        _registry = ToolRegistry()
        await _registry.sync_from_database()
    
    return _registry


async def execute_l5_tool(slug: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Quick function to execute an L5 tool.
    
    Example:
        result = await execute_l5_tool("pubmed", {"query": "cancer"})
    """
    registry = await get_tool_registry()
    return await registry.execute_tool(slug, params)


async def list_available_tools(agent_level: Optional[int] = None) -> List[str]:
    """
    List available tool slugs.
    
    Example:
        critical_tools = await list_available_tools(agent_level=1)
    """
    registry = await get_tool_registry()
    tools = registry.list_tools(agent_level=agent_level)
    return [t.slug for t in tools]


# =============================================================================
# CLI TEST
# =============================================================================

if __name__ == "__main__":
    async def main():
        print("Testing Tool Registry Integration...")
        print("=" * 60)
        
        registry = ToolRegistry()
        
        # Sync from database
        count = await registry.sync_from_database()
        print(f"\n1. Synced {count} tools from Supabase")
        
        # List critical tools
        critical = registry.list_critical_tools()
        print(f"\n2. Critical tools (level 1): {len(critical)}")
        for t in critical[:5]:
            print(f"   - {t.name} ({t.slug})")
        
        # Get stats
        stats = registry.get_stats()
        print(f"\n3. Registry stats: {stats}")
        
        # Test tool execution
        print("\n4. Testing PubMed tool...")
        result = await registry.execute_tool("pubmed-medline", {
            "query": "cancer immunotherapy",
            "max_results": 3,
        })
        if result.get("success"):
            articles = result.get("data", {}).get("articles", [])
            print(f"   Found {len(articles)} articles")
        else:
            print(f"   Error: {result.get('error')}")
        
        print("\n" + "=" * 60)
        print("Tool Registry test complete.")
    
    asyncio.run(main())
