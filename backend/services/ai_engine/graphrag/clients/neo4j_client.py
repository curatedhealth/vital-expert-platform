"""
Neo4j Client for GraphRAG Service

Provides async Neo4j driver wrapper for:
- Graph traversal with agent KG view filters
- Entity search and relationship queries
- Cypher query execution
- Connection pooling
"""

from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession
from typing import List, Dict, Optional, Any
from uuid import UUID

from ..config import get_config
from ..models import GraphPath, GraphNode, GraphRelationship
from ..utils.logger import get_logger

logger = get_logger(__name__)


class Neo4jClient:
    """Async Neo4j client with connection pooling"""
    
    def __init__(self):
        self.config = get_config()
        self.driver: Optional[AsyncDriver] = None
        
    async def connect(self) -> None:
        """Initialize Neo4j driver"""
        if self.driver is not None:
            logger.warning("Neo4j driver already initialized")
            return
            
        try:
            self.driver = AsyncGraphDatabase.driver(
                self.config.database.neo4j_uri,
                auth=(
                    self.config.database.neo4j_user,
                    self.config.database.neo4j_password
                ),
                max_connection_pool_size=self.config.database.neo4j_pool_size,
                connection_timeout=30.0,
                max_transaction_retry_time=15.0
            )
            
            # Verify connectivity
            await self.driver.verify_connectivity()
            logger.info(f"Neo4j driver initialized (uri={self.config.database.neo4j_uri})")
        except Exception as e:
            logger.error(f"Failed to initialize Neo4j driver: {e}")
            raise
            
    async def disconnect(self) -> None:
        """Close Neo4j driver"""
        if self.driver is not None:
            await self.driver.close()
            self.driver = None
            logger.info("Neo4j driver closed")
            
    async def health_check(self) -> bool:
        """Check Neo4j connectivity"""
        try:
            if self.driver is None:
                return False
            await self.driver.verify_connectivity()
            return True
        except Exception as e:
            logger.error(f"Neo4j health check failed: {e}")
            return False
            
    async def execute_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        database: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Execute a Cypher query and return results"""
        if self.driver is None:
            raise RuntimeError("Neo4j driver not initialized. Call connect() first.")
            
        db = database or self.config.database.neo4j_database
        
        try:
            async with self.driver.session(database=db) as session:
                result = await session.run(query, parameters or {})
                records = [dict(record) async for record in result]
                return records
        except Exception as e:
            logger.error(f"Error executing Neo4j query: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Parameters: {parameters}")
            raise
            
    # ========================================================================
    # GRAPH TRAVERSAL QUERIES
    # ========================================================================
    
    async def graph_search(
        self,
        seed_entity_ids: List[str],
        allowed_node_labels: List[str],
        allowed_edge_types: List[str],
        max_hops: int = 3,
        limit: int = 100
    ) -> List[GraphPath]:
        """
        Execute graph traversal from seed entities with filters
        
        Args:
            seed_entity_ids: Starting node IDs
            allowed_node_labels: Allowed node types (e.g., ['Drug', 'Disease'])
            allowed_edge_types: Allowed relationship types (e.g., ['TREATS', 'INDICATED_FOR'])
            max_hops: Maximum traversal depth
            limit: Maximum number of paths to return
            
        Returns:
            List of GraphPath objects containing nodes and relationships
        """
        # Build label filter for APOC
        label_filter = '|'.join(allowed_node_labels) if allowed_node_labels else ''
        
        # Build relationship filter for APOC
        rel_filter = '|'.join(allowed_edge_types) if allowed_edge_types else ''
        
        query = """
        // Find seed nodes
        MATCH (seed)
        WHERE seed.id IN $seed_ids
        
        // Use APOC path expansion with filters
        CALL apoc.path.expandConfig(seed, {
            relationshipFilter: $rel_filter,
            labelFilter: $label_filter,
            maxLevel: $max_hops,
            limit: $limit,
            uniqueness: 'NODE_GLOBAL'
        })
        YIELD path
        
        // Return path components
        WITH path,
             nodes(path) as path_nodes,
             relationships(path) as path_rels
        
        RETURN 
            [node in path_nodes | {
                id: node.id,
                labels: labels(node),
                properties: properties(node)
            }] as nodes,
            [rel in path_rels | {
                type: type(rel),
                start_node_id: startNode(rel).id,
                end_node_id: endNode(rel).id,
                properties: properties(rel)
            }] as relationships,
            length(path) as path_length
        ORDER BY path_length ASC
        LIMIT $limit
        """
        
        parameters = {
            'seed_ids': seed_entity_ids,
            'rel_filter': rel_filter,
            'label_filter': label_filter,
            'max_hops': max_hops,
            'limit': limit
        }
        
        try:
            results = await self.execute_query(query, parameters)
            
            paths = []
            for record in results:
                nodes = [GraphNode(**node_data) for node_data in record['nodes']]
                relationships = [GraphRelationship(**rel_data) for rel_data in record['relationships']]
                
                paths.append(GraphPath(
                    nodes=nodes,
                    relationships=relationships,
                    length=record['path_length']
                ))
                
            logger.info(f"Graph search returned {len(paths)} paths from {len(seed_entity_ids)} seeds")
            return paths
            
        except Exception as e:
            logger.error(f"Graph search failed: {e}")
            raise
            
    async def find_entities_by_text(
        self,
        search_text: str,
        node_labels: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[GraphNode]:
        """
        Find entities by text search on name/description properties
        
        Args:
            search_text: Text to search for
            node_labels: Optional filter for node types
            limit: Maximum number of results
            
        Returns:
            List of matching GraphNode objects
        """
        # Build label filter
        label_clause = ""
        if node_labels:
            labels_str = '|'.join([f':{label}' for label in node_labels])
            label_clause = f"WHERE n{labels_str}"
        
        query = f"""
        MATCH (n)
        {label_clause}
        WHERE n.name CONTAINS $search_text
           OR n.description CONTAINS $search_text
        RETURN 
            n.id as id,
            labels(n) as labels,
            properties(n) as properties
        LIMIT $limit
        """
        
        try:
            results = await self.execute_query(
                query,
                {'search_text': search_text, 'limit': limit}
            )
            
            nodes = [GraphNode(
                id=r['id'],
                labels=r['labels'],
                properties=r['properties']
            ) for r in results]
            
            logger.info(f"Text search for '{search_text}' returned {len(nodes)} entities")
            return nodes
            
        except Exception as e:
            logger.error(f"Entity text search failed: {e}")
            raise
            
    async def get_entity_neighborhood(
        self,
        entity_id: str,
        allowed_edge_types: Optional[List[str]] = None,
        max_degree: int = 1
    ) -> List[GraphPath]:
        """
        Get immediate neighborhood of an entity
        
        Args:
            entity_id: Entity node ID
            allowed_edge_types: Optional filter for relationship types
            max_degree: Number of hops (default 1 for immediate neighbors)
            
        Returns:
            List of GraphPath objects
        """
        # Build relationship type filter
        rel_type_clause = ""
        if allowed_edge_types:
            rel_types_str = '|'.join(allowed_edge_types)
            rel_type_clause = f":{rel_types_str}"
        
        query = f"""
        MATCH (start {{id: $entity_id}})
        MATCH path = (start)-[r{rel_type_clause}*1..{max_degree}]-(connected)
        WITH path,
             nodes(path) as path_nodes,
             relationships(path) as path_rels
        RETURN 
            [node in path_nodes | {{
                id: node.id,
                labels: labels(node),
                properties: properties(node)
            }}] as nodes,
            [rel in path_rels | {{
                type: type(rel),
                start_node_id: startNode(rel).id,
                end_node_id: endNode(rel).id,
                properties: properties(rel)
            }}] as relationships,
            length(path) as path_length
        ORDER BY path_length ASC
        LIMIT 50
        """
        
        try:
            results = await self.execute_query(query, {'entity_id': entity_id})
            
            paths = []
            for record in results:
                nodes = [GraphNode(**node_data) for node_data in record['nodes']]
                relationships = [GraphRelationship(**rel_data) for rel_data in record['relationships']]
                
                paths.append(GraphPath(
                    nodes=nodes,
                    relationships=relationships,
                    length=record['path_length']
                ))
                
            logger.info(f"Entity neighborhood for '{entity_id}' returned {len(paths)} paths")
            return paths
            
        except Exception as e:
            logger.error(f"Entity neighborhood query failed: {e}")
            raise
            
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    async def get_node_counts_by_label(self) -> Dict[str, int]:
        """Get count of nodes by label for monitoring"""
        query = """
        CALL db.labels() YIELD label
        CALL apoc.cypher.run(
            'MATCH (n:`' + label + '`) RETURN count(n) as count',
            {}
        ) YIELD value
        RETURN label, value.count as count
        """
        
        try:
            results = await self.execute_query(query)
            return {r['label']: r['count'] for r in results}
        except Exception as e:
            logger.error(f"Failed to get node counts: {e}")
            return {}
            
    async def get_relationship_counts_by_type(self) -> Dict[str, int]:
        """Get count of relationships by type for monitoring"""
        query = """
        CALL db.relationshipTypes() YIELD relationshipType
        CALL apoc.cypher.run(
            'MATCH ()-[r:`' + relationshipType + '`]->() RETURN count(r) as count',
            {}
        ) YIELD value
        RETURN relationshipType, value.count as count
        """
        
        try:
            results = await self.execute_query(query)
            return {r['relationshipType']: r['count'] for r in results}
        except Exception as e:
            logger.error(f"Failed to get relationship counts: {e}")
            return {}


# Singleton instance
_neo4j_client: Optional[Neo4jClient] = None


async def get_neo4j_client() -> Neo4jClient:
    """Get or create Neo4j client singleton"""
    global _neo4j_client
    if _neo4j_client is None:
        _neo4j_client = Neo4jClient()
        await _neo4j_client.connect()
    return _neo4j_client


async def close_neo4j_client() -> None:
    """Close Neo4j client"""
    global _neo4j_client
    if _neo4j_client is not None:
        await _neo4j_client.disconnect()
        _neo4j_client = None

