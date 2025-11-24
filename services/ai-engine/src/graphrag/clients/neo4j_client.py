"""
Neo4j Client for GraphRAG
Handles connections to Neo4j graph database for knowledge graph queries
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import structlog

from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


@dataclass
class GraphPath:
    """Result from graph traversal"""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    path_score: float
    path_id: str


class Neo4jClient:
    """
    Production-ready Neo4j client
    
    Features:
    - Connection pooling (built into Neo4j driver)
    - Async Cypher execution
    - Transaction support
    - Health checks
    - Automatic retry
    """
    
    def __init__(
        self,
        uri: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        database: str = "neo4j"
    ):
        """
        Initialize Neo4j client
        
        Args:
            uri: Neo4j connection URI (bolt://...)
            username: Database username
            password: Database password
            database: Database name
        """
        self.uri = uri or getattr(settings, 'neo4j_uri', 'bolt://localhost:7687')
        self.username = username or getattr(settings, 'neo4j_username', 'neo4j')
        self.password = password or getattr(settings, 'neo4j_password', None)
        self.database = database
        self._driver = None
        
        logger.info(
            "neo4j_client_initialized",
            uri=self.uri,
            database=database
        )
    
    async def connect(self):
        """Initialize Neo4j driver"""
        try:
            from neo4j import AsyncGraphDatabase
            
            self._driver = AsyncGraphDatabase.driver(
                self.uri,
                auth=(self.username, self.password)
            )
            
            # Verify connectivity
            await self._driver.verify_connectivity()
            
            logger.info("neo4j_connected", database=self.database)
            
        except ImportError:
            logger.error("neo4j_library_not_installed")
            raise ImportError("Install neo4j driver: pip install neo4j")
        except Exception as e:
            logger.error("neo4j_connection_failed", error=str(e))
            raise
    
    async def disconnect(self):
        """Close Neo4j driver"""
        if self._driver:
            await self._driver.close()
            self._driver = None
            logger.info("neo4j_disconnected")
    
    async def health_check(self) -> bool:
        """
        Check if Neo4j is healthy
        
        Returns:
            True if database is responsive
        """
        try:
            result = await self.run_query("RETURN 1 AS health")
            return len(result) > 0 and result[0].get('health') == 1
        except Exception as e:
            logger.error("neo4j_health_check_failed", error=str(e))
            return False
    
    async def run_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        database: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute Cypher query
        
        Args:
            query: Cypher query string
            parameters: Query parameters
            database: Optional database name override
            
        Returns:
            List of result records as dictionaries
        """
        if not self._driver:
            await self.connect()
        
        db = database or self.database
        
        try:
            async with self._driver.session(database=db) as session:
                result = await session.run(query, parameters or {})
                records = await result.data()
                
                logger.debug(
                    "neo4j_query_success",
                    query=query[:100],
                    record_count=len(records)
                )
                
                return records
                
        except Exception as e:
            logger.error(
                "neo4j_query_failed",
                query=query[:100],
                error=str(e)
            )
            raise
    
    async def run_write_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        database: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute write Cypher query
        
        Args:
            query: Cypher query string
            parameters: Query parameters
            database: Optional database name override
            
        Returns:
            List of result records
        """
        if not self._driver:
            await self.connect()
        
        db = database or self.database
        
        async def write_transaction(tx):
            result = await tx.run(query, parameters or {})
            return await result.data()
        
        try:
            async with self._driver.session(database=db) as session:
                records = await session.execute_write(write_transaction)
                
                logger.debug(
                    "neo4j_write_success",
                    query=query[:100],
                    record_count=len(records)
                )
                
                return records
                
        except Exception as e:
            logger.error(
                "neo4j_write_failed",
                query=query[:100],
                error=str(e)
            )
            raise
    
    async def find_entities(
        self,
        entity_names: List[str],
        entity_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Find entities by name and optional type
        
        Args:
            entity_names: List of entity names to search
            entity_types: Optional list of node labels to filter
            
        Returns:
            List of matching nodes
        """
        # Build label filter
        label_filter = ""
        if entity_types:
            labels = ":".join(entity_types)
            label_filter = f":{labels}"
        
        query = f"""
        UNWIND $entity_names AS name
        MATCH (n{label_filter})
        WHERE n.name = name OR n.id = name
        RETURN n, labels(n) AS labels
        """
        
        results = await self.run_query(
            query,
            parameters={'entity_names': entity_names}
        )
        
        logger.info(
            "neo4j_entities_found",
            search_count=len(entity_names),
            found_count=len(results)
        )
        
        return results
    
    async def traverse_graph(
        self,
        seed_ids: List[str],
        allowed_nodes: Optional[List[str]] = None,
        allowed_edges: Optional[List[str]] = None,
        max_hops: int = 2,
        limit: int = 50
    ) -> List[GraphPath]:
        """
        Traverse graph from seed nodes
        
        Args:
            seed_ids: Starting node IDs
            allowed_nodes: Node labels to include
            allowed_edges: Relationship types to traverse
            max_hops: Maximum traversal depth
            limit: Maximum paths to return
            
        Returns:
            List of graph paths
        """
        # Build filters
        node_filter = ""
        if allowed_nodes:
            node_filter = "|".join(allowed_nodes)
        
        edge_filter = ""
        if allowed_edges:
            edge_filter = "|".join(allowed_edges)
        
        # Cypher query with path expansion
        query = f"""
        MATCH (seed)
        WHERE id(seed) IN $seed_ids
        CALL apoc.path.expandConfig(seed, {{
            relationshipFilter: '{edge_filter}',
            labelFilter: '{node_filter}',
            maxLevel: $max_hops,
            limit: $limit
        }})
        YIELD path
        RETURN 
            nodes(path) AS nodes,
            relationships(path) AS edges,
            length(path) AS path_length,
            toString(id(path)) AS path_id
        ORDER BY path_length ASC
        LIMIT $limit
        """
        
        try:
            results = await self.run_query(
                query,
                parameters={
                    'seed_ids': seed_ids,
                    'max_hops': max_hops,
                    'limit': limit
                }
            )
            
            paths = []
            for record in results:
                # Calculate path score (shorter paths = higher score)
                path_length = record.get('path_length', 1)
                score = 1.0 / (1.0 + path_length)
                
                paths.append(GraphPath(
                    nodes=record.get('nodes', []),
                    edges=record.get('edges', []),
                    path_score=score,
                    path_id=record.get('path_id', '')
                ))
            
            logger.info(
                "neo4j_traversal_success",
                seed_count=len(seed_ids),
                paths_found=len(paths),
                max_hops=max_hops
            )
            
            return paths
            
        except Exception as e:
            logger.warning(
                "neo4j_traversal_failed_fallback_to_simple",
                error=str(e)
            )
            
            # Fallback: Simple expansion without APOC
            return await self._traverse_graph_simple(
                seed_ids, allowed_edges, max_hops, limit
            )
    
    async def _traverse_graph_simple(
        self,
        seed_ids: List[str],
        allowed_edges: Optional[List[str]],
        max_hops: int,
        limit: int
    ) -> List[GraphPath]:
        """Fallback traversal without APOC plugin"""
        edge_filter = ""
        if allowed_edges:
            edge_types = "|".join(allowed_edges)
            edge_filter = f":{edge_types}"
        
        query = f"""
        MATCH path = (seed)-[{edge_filter}*1..{max_hops}]-(connected)
        WHERE id(seed) IN $seed_ids
        RETURN 
            nodes(path) AS nodes,
            relationships(path) AS edges,
            length(path) AS path_length,
            toString(id(path)) AS path_id
        ORDER BY path_length ASC
        LIMIT $limit
        """
        
        results = await self.run_query(
            query,
            parameters={'seed_ids': seed_ids, 'limit': limit}
        )
        
        paths = []
        for record in results:
            path_length = record.get('path_length', 1)
            score = 1.0 / (1.0 + path_length)
            
            paths.append(GraphPath(
                nodes=record.get('nodes', []),
                edges=record.get('edges', []),
                path_score=score,
                path_id=record.get('path_id', '')
            ))
        
        return paths


# Singleton instance
_neo4j_client: Optional[Neo4jClient] = None


async def get_neo4j_client() -> Neo4jClient:
    """Get or create Neo4j client singleton"""
    global _neo4j_client
    
    if _neo4j_client is None:
        _neo4j_client = Neo4jClient()
        await _neo4j_client.connect()
    
    return _neo4j_client

