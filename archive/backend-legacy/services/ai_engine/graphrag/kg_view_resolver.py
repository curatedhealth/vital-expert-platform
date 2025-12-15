"""
Knowledge Graph View Resolver for GraphRAG Service

Loads agent-specific KG views from Postgres.
Provides node/edge filters and traversal parameters for Neo4j queries.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID

from .clients import get_postgres_client
from .models import AgentKGView, KGNodeType, KGEdgeType
from .utils.logger import get_logger

logger = get_logger(__name__)


class KGViewResolver:
    """Resolves agent-specific knowledge graph views"""
    
    def __init__(self):
        self.pg_client = None
        self._node_type_cache: Dict[UUID, KGNodeType] = {}
        self._edge_type_cache: Dict[UUID, KGEdgeType] = {}
        
    async def initialize(self):
        """Initialize PostgreSQL client and load KG metadata"""
        self.pg_client = await get_postgres_client()
        await self._load_kg_metadata()
        logger.info("KGViewResolver initialized")
        
    async def _load_kg_metadata(self):
        """Load and cache all node and edge types"""
        try:
            # Load node types
            node_types = await self.pg_client.fetch("""
                SELECT id, name, description, properties, is_active
                FROM kg_node_types
                WHERE is_active = true
                ORDER BY name
            """)
            
            for row in node_types:
                node = KGNodeType(**dict(row))
                self._node_type_cache[node.id] = node
                
            logger.info(f"Loaded {len(node_types)} KG node types")
            
            # Load edge types
            edge_types = await self.pg_client.fetch("""
                SELECT id, name, description, properties, is_active
                FROM kg_edge_types
                WHERE is_active = true
                ORDER BY name
            """)
            
            for row in edge_types:
                edge = KGEdgeType(**dict(row))
                self._edge_type_cache[edge.id] = edge
                
            logger.info(f"Loaded {len(edge_types)} KG edge types")
            
        except Exception as e:
            logger.error(f"Error loading KG metadata: {e}")
            # Non-fatal, graph search will just not have filters
            
    async def get_kg_view(
        self,
        agent_id: UUID,
        skill_id: Optional[UUID] = None
    ) -> Optional[AgentKGView]:
        """
        Get agent-specific KG view
        
        Args:
            agent_id: Agent UUID
            skill_id: Optional skill for skill-specific views
            
        Returns:
            AgentKGView or None if no custom view defined
        """
        try:
            query = """
                SELECT 
                    akv.id,
                    akv.agent_id,
                    akv.rag_profile_id,
                    akv.name,
                    akv.description,
                    akv.include_nodes,
                    akv.include_edges,
                    akv.max_hops,
                    akv.graph_limit,
                    akv.depth_strategy,
                    akv.is_active,
                    akv.created_at,
                    akv.updated_at
                FROM agent_kg_views akv
                WHERE akv.agent_id = $1
                  AND akv.is_active = true
                ORDER BY akv.created_at DESC
                LIMIT 1
            """
            
            row = await self.pg_client.fetchrow(query, agent_id)
            
            if not row:
                logger.info(f"No KG view found for agent={agent_id}, will use unrestricted graph search")
                return None
                
            kg_view = AgentKGView(**dict(row))
            
            logger.info(
                f"Loaded KG view for agent={agent_id}: "
                f"{len(kg_view.include_nodes or [])} node types, "
                f"{len(kg_view.include_edges or [])} edge types, "
                f"max_hops={kg_view.max_hops}"
            )
            
            return kg_view
            
        except Exception as e:
            logger.error(f"Error loading KG view for agent {agent_id}: {e}")
            return None
            
    def get_node_labels(self, kg_view: Optional[AgentKGView]) -> List[str]:
        """
        Get Neo4j node labels from KG view
        
        Args:
            kg_view: Agent KG view or None for unrestricted
            
        Returns:
            List of node label strings (e.g., ['Drug', 'Disease'])
        """
        if not kg_view or not kg_view.include_nodes:
            # No filter, return empty list (means all nodes allowed)
            return []
            
        labels = []
        for node_id in kg_view.include_nodes:
            node_type = self._node_type_cache.get(node_id)
            if node_type:
                labels.append(node_type.name)
            else:
                logger.warning(f"Node type {node_id} not found in cache")
                
        return labels
        
    def get_edge_types(self, kg_view: Optional[AgentKGView]) -> List[str]:
        """
        Get Neo4j relationship types from KG view
        
        Args:
            kg_view: Agent KG view or None for unrestricted
            
        Returns:
            List of relationship type strings (e.g., ['TREATS', 'CAUSED_BY'])
        """
        if not kg_view or not kg_view.include_edges:
            # No filter, return empty list (means all edges allowed)
            return []
            
        edge_types = []
        for edge_id in kg_view.include_edges:
            edge_type = self._edge_type_cache.get(edge_id)
            if edge_type:
                edge_types.append(edge_type.name)
            else:
                logger.warning(f"Edge type {edge_id} not found in cache")
                
        return edge_types
        
    def get_max_hops(self, kg_view: Optional[AgentKGView]) -> int:
        """Get max traversal hops (default 2)"""
        if kg_view and kg_view.max_hops:
            return kg_view.max_hops
        return 2  # Safe default
        
    def get_graph_limit(self, kg_view: Optional[AgentKGView]) -> int:
        """Get max graph results (default 50)"""
        if kg_view and kg_view.graph_limit:
            return kg_view.graph_limit
        return 50  # Safe default
        
    def build_cypher_filters(self, kg_view: Optional[AgentKGView]) -> Dict[str, Any]:
        """
        Build Cypher query filters from KG view
        
        Returns:
            Dict with 'node_labels', 'edge_types', 'max_hops', 'limit'
        """
        return {
            'node_labels': self.get_node_labels(kg_view),
            'edge_types': self.get_edge_types(kg_view),
            'max_hops': self.get_max_hops(kg_view),
            'limit': self.get_graph_limit(kg_view),
            'depth_strategy': kg_view.depth_strategy if kg_view else 'breadth-first'
        }
        
    async def get_all_node_types(self) -> List[KGNodeType]:
        """Get all available node types (for admin/debugging)"""
        if not self._node_type_cache:
            await self._load_kg_metadata()
        return list(self._node_type_cache.values())
        
    async def get_all_edge_types(self) -> List[KGEdgeType]:
        """Get all available edge types (for admin/debugging)"""
        if not self._edge_type_cache:
            await self._load_kg_metadata()
        return list(self._edge_type_cache.values())


# Singleton instance
_kg_view_resolver: Optional[KGViewResolver] = None


async def get_kg_view_resolver() -> KGViewResolver:
    """Get or create KGViewResolver singleton"""
    global _kg_view_resolver
    if _kg_view_resolver is None:
        _kg_view_resolver = KGViewResolver()
        await _kg_view_resolver.initialize()
    return _kg_view_resolver

