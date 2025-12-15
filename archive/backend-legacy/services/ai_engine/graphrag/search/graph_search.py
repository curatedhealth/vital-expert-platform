"""
Graph Search Implementation for GraphRAG

Performs knowledge graph traversal using Neo4j with agent-specific filters
"""

from typing import List, Optional, Dict, Any
from uuid import UUID

from ..clients import get_neo4j_client
from ..models import AgentKGView, GraphResult, GraphNode, GraphRelationship
from ..utils.logger import get_logger
from ..kg_view_resolver import get_kg_view_resolver

logger = get_logger(__name__)


class GraphSearch:
    """Knowledge graph traversal with agent-specific filters"""
    
    def __init__(self):
        self.neo4j_client = None
        self.kg_resolver = None
        
    async def initialize(self):
        """Initialize Neo4j client and KG view resolver"""
        self.neo4j_client = await get_neo4j_client()
        self.kg_resolver = await get_kg_view_resolver()
        logger.info("GraphSearch initialized")
        
    async def search(
        self,
        seed_entities: List[str],
        agent_id: UUID,
        kg_view: Optional[AgentKGView] = None,
        max_results: int = 50
    ) -> List[GraphResult]:
        """
        Perform graph traversal from seed entities
        
        Args:
            seed_entities: List of entity names to start traversal from
            agent_id: Agent UUID for KG view filters
            kg_view: Optional pre-loaded KG view
            max_results: Maximum graph results to return
            
        Returns:
            List of GraphResult objects
        """
        try:
            # 1. Load KG view if not provided
            if kg_view is None:
                kg_view = await self.kg_resolver.get_kg_view(agent_id)
                
            # 2. Build Cypher filters from KG view
            filters = self.kg_resolver.build_cypher_filters(kg_view)
            
            # 3. Find seed node IDs by entity names
            seed_ids = await self._find_seed_nodes(seed_entities, filters['node_labels'])
            
            if not seed_ids:
                logger.warning(f"No seed nodes found for entities: {seed_entities}")
                return []
                
            # 4. Execute graph traversal
            paths = await self._traverse_graph(seed_ids, filters, max_results)
            
            # 5. Build graph results from paths
            results = self._build_results(paths)
            
            logger.info(
                f"Graph search returned {len(results)} results "
                f"(seed_entities={len(seed_entities)}, max_hops={filters['max_hops']})"
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Graph search error: {e}")
            return []
            
    async def _find_seed_nodes(
        self,
        entity_names: List[str],
        allowed_labels: List[str]
    ) -> List[str]:
        """Find Neo4j node IDs matching entity names"""
        try:
            # Build label filter (if any)
            label_filter = ""
            if allowed_labels:
                label_filter = "AND any(label IN labels(n) WHERE label IN $labels)"
                
            query = f"""
                MATCH (n)
                WHERE n.name IN $names OR n.title IN $names
                {label_filter}
                RETURN elementId(n) as id
                LIMIT 50
            """
            
            result = await self.neo4j_client.execute_read(
                query,
                names=entity_names,
                labels=allowed_labels if allowed_labels else []
            )
            
            return [record['id'] for record in result]
            
        except Exception as e:
            logger.error(f"Error finding seed nodes: {e}")
            return []
            
    async def _traverse_graph(
        self,
        seed_ids: List[str],
        filters: Dict[str, Any],
        max_results: int
    ) -> List[Dict[str, Any]]:
        """Execute graph traversal with filters"""
        try:
            # Build relationship filter
            rel_filter = ""
            if filters['edge_types']:
                rel_types = "|".join(filters['edge_types'])
                rel_filter = f":{rel_types}"
            else:
                rel_filter = ""  # All relationship types
                
            # Build label filter for traversal
            label_constraint = ""
            if filters['node_labels']:
                label_constraint = """
                    WHERE all(node IN nodes(path) 
                         WHERE any(label IN labels(node) WHERE label IN $labels))
                """
                
            # Cypher query with variable-length pattern
            query = f"""
                MATCH path = (start)-[{rel_filter}*1..{filters['max_hops']}]-(end)
                WHERE elementId(start) IN $seed_ids
                {label_constraint}
                RETURN path
                LIMIT $limit
            """
            
            result = await self.neo4j_client.execute_read(
                query,
                seed_ids=seed_ids,
                labels=filters['node_labels'] if filters['node_labels'] else [],
                limit=max_results
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error traversing graph: {e}")
            return []
            
    def _build_results(self, paths: List[Dict[str, Any]]) -> List[GraphResult]:
        """Build GraphResult objects from Neo4j paths"""
        results = []
        seen_paths = set()
        
        for record in paths:
            path = record.get('path')
            if not path:
                continue
                
            # Extract nodes and relationships
            nodes = []
            for node in path.nodes:
                graph_node = GraphNode(
                    id=node.element_id,
                    labels=list(node.labels),
                    properties=dict(node)
                )
                nodes.append(graph_node)
                
            relationships = []
            for rel in path.relationships:
                graph_rel = GraphRelationship(
                    id=rel.element_id,
                    type=rel.type,
                    start_node=rel.start_node.element_id,
                    end_node=rel.end_node.element_id,
                    properties=dict(rel)
                )
                relationships.append(graph_rel)
                
            # Create path signature for deduplication
            path_sig = tuple(node.id for node in nodes)
            if path_sig in seen_paths:
                continue
            seen_paths.add(path_sig)
            
            # Build result
            graph_result = GraphResult(
                path_length=len(relationships),
                nodes=nodes,
                relationships=relationships,
                relevance_score=self._calculate_relevance(nodes, relationships)
            )
            results.append(graph_result)
            
        return results
        
    def _calculate_relevance(
        self,
        nodes: List[GraphNode],
        relationships: List[GraphRelationship]
    ) -> float:
        """
        Calculate relevance score for graph path
        
        Simple heuristic: shorter paths are more relevant
        """
        # Base score
        score = 1.0
        
        # Penalize longer paths
        path_length = len(relationships)
        score = score / (1 + path_length * 0.2)
        
        # Bonus for high-value node types (Drug, Disease, Clinical_Trial)
        high_value_labels = {'Drug', 'Disease', 'Clinical_Trial', 'Evidence'}
        for node in nodes:
            if any(label in high_value_labels for label in node.labels):
                score += 0.1
                
        return min(score, 1.0)  # Cap at 1.0


# Singleton instance
_graph_search: Optional[GraphSearch] = None


async def graph_search(
    seed_entities: List[str],
    agent_id: UUID,
    kg_view: Optional[AgentKGView] = None,
    max_results: int = 50
) -> List[GraphResult]:
    """
    Convenience function for graph search
    
    Args:
        seed_entities: List of entity names to start from
        agent_id: Agent UUID for KG view filters
        kg_view: Optional pre-loaded KG view
        max_results: Max graph results
        
    Returns:
        List of GraphResult objects
    """
    global _graph_search
    if _graph_search is None:
        _graph_search = GraphSearch()
        await _graph_search.initialize()
    return await _graph_search.search(seed_entities, agent_id, kg_view, max_results)

