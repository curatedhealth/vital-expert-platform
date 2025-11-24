"""
Knowledge Graph View Resolver
Loads agent-specific KG view constraints from PostgreSQL
"""

from typing import Optional
from uuid import UUID
import structlog

from .models import AgentKGView
from .clients.postgres_client import get_postgres_client

logger = structlog.get_logger()


class KGViewResolver:
    """
    Resolves Knowledge Graph views for agents
    
    Features:
    - Load agent-specific KG constraints
    - Node/edge type filtering
    - Default fallback views
    - Caching (optional)
    """
    
    def __init__(self):
        self._cache: dict[UUID, AgentKGView] = {}
    
    async def resolve_kg_view(self, agent_id: UUID) -> Optional[AgentKGView]:
        """
        Resolve KG view for agent
        
        Args:
            agent_id: Agent UUID
            
        Returns:
            AgentKGView if configured, None otherwise
        """
        try:
            pg = await get_postgres_client()
            
            query = """
            SELECT
                id,
                agent_id,
                include_nodes,
                include_edges,
                exclude_nodes,
                exclude_edges,
                max_hops,
                graph_limit,
                is_active,
                metadata
            FROM agent_kg_views
            WHERE agent_id = $1
                AND is_active = true
            LIMIT 1
            """
            
            row = await pg.fetchrow(query, agent_id)
            
            if row:
                kg_view = AgentKGView(**row)
                
                logger.info(
                    "kg_view_resolved",
                    agent_id=str(agent_id),
                    include_nodes=kg_view.include_nodes,
                    include_edges=kg_view.include_edges,
                    max_hops=kg_view.max_hops
                )
                
                return kg_view
            
            logger.info(
                "no_kg_view_configured",
                agent_id=str(agent_id),
                fallback="unrestricted"
            )
            
            return None  # No KG view = no restrictions
            
        except Exception as e:
            logger.error(
                "kg_view_resolution_failed",
                agent_id=str(agent_id),
                error=str(e)
            )
            return None
    
    async def get_all_node_types(self) -> list[str]:
        """
        Get all available node types from KG metadata
        
        Returns:
            List of node type names
        """
        try:
            pg = await get_postgres_client()
            
            query = """
            SELECT name
            FROM kg_node_types
            WHERE is_active = true
            ORDER BY name
            """
            
            rows = await pg.fetch(query)
            node_types = [row['name'] for row in rows]
            
            logger.debug("node_types_loaded", count=len(node_types))
            
            return node_types
            
        except Exception as e:
            logger.error("failed_to_load_node_types", error=str(e))
            return []
    
    async def get_all_edge_types(self) -> list[str]:
        """
        Get all available edge types from KG metadata
        
        Returns:
            List of edge type names
        """
        try:
            pg = await get_postgres_client()
            
            query = """
            SELECT name
            FROM kg_edge_types
            WHERE is_active = true
            ORDER BY name
            """
            
            rows = await pg.fetch(query)
            edge_types = [row['name'] for row in rows]
            
            logger.debug("edge_types_loaded", count=len(edge_types))
            
            return edge_types
            
        except Exception as e:
            logger.error("failed_to_load_edge_types", error=str(e))
            return []
    
    async def get_node_type_description(self, node_type: str) -> Optional[str]:
        """
        Get description for a node type
        
        Args:
            node_type: Node type name
            
        Returns:
            Description if available
        """
        try:
            pg = await get_postgres_client()
            
            query = """
            SELECT description
            FROM kg_node_types
            WHERE name = $1
            """
            
            description = await pg.fetchval(query, node_type)
            
            return description
            
        except Exception as e:
            logger.error(
                "failed_to_load_node_type_description",
                node_type=node_type,
                error=str(e)
            )
            return None
    
    async def get_edge_type_description(self, edge_type: str) -> Optional[str]:
        """
        Get description for an edge type
        
        Args:
            edge_type: Edge type name
            
        Returns:
            Description if available
        """
        try:
            pg = await get_postgres_client()
            
            query = """
            SELECT description
            FROM kg_edge_types
            WHERE name = $1
            """
            
            description = await pg.fetchval(query, edge_type)
            
            return description
            
        except Exception as e:
            logger.error(
                "failed_to_load_edge_type_description",
                edge_type=edge_type,
                error=str(e)
            )
            return None
    
    def clear_cache(self):
        """Clear cached KG views"""
        self._cache.clear()
        logger.info("kg_view_cache_cleared")


# Singleton instance
_resolver: Optional[KGViewResolver] = None


def get_kg_view_resolver() -> KGViewResolver:
    """Get or create KG view resolver singleton"""
    global _resolver
    
    if _resolver is None:
        _resolver = KGViewResolver()
    
    return _resolver

