"""
Neo4j Graph Database Client for VITAL Agent Relationships

This service manages agent relationships and graph-based agent discovery
using Neo4j graph database.

Features:
- Agent node management (create, update, query)
- Relationship management (RELATES_TO, CO_OCCURS_WITH, COMPLEMENTS, ESCALATES_TO, SPAWNS)
- Graph traversal search for agent discovery
- Performance tracking and analytics
- Multi-tenant isolation

Performance Targets:
- Graph query P95 latency: <100ms
- Connection pool: 50 concurrent connections
- Query timeout: 30 seconds
"""

try:
    from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    # Create dummy types for type hints
    AsyncGraphDatabase = None
    AsyncDriver = None
    AsyncSession = None

from typing import List, Dict, Optional, Any
import structlog
import time
from datetime import datetime

logger = structlog.get_logger()


class Neo4jClient:
    """Neo4j graph database client for agent relationships."""

    def __init__(self, uri: str, user: str, password: str):
        """
        Initialize Neo4j client with connection pooling.

        Args:
            uri: Neo4j connection URI (e.g., neo4j+s://xxx.databases.neo4j.io)
            user: Database username
            password: Database password
        """
        if not NEO4J_AVAILABLE:
            raise ImportError("neo4j package is not installed. Install it with: pip install neo4j")
        
        self.uri = uri
        self.driver: AsyncDriver = AsyncGraphDatabase.driver(
            uri,
            auth=(user, password),
            max_connection_pool_size=50,
            connection_timeout=30,
            max_transaction_retry_time=15
        )
        logger.info("Neo4j client initialized", uri=uri)

    async def close(self):
        """Close database connection and cleanup resources."""
        if self.driver:
            await self.driver.close()
            logger.info("Neo4j client closed")

    async def verify_connection(self) -> bool:
        """Verify database connection is working."""
        try:
            async with self.driver.session(database="neo4j") as session:
                result = await session.run("RETURN 1 as test")
                record = await result.single()
                return record["test"] == 1
        except Exception as e:
            logger.error("Neo4j connection verification failed", error=str(e))
            return False

    # ==================== Agent Node Management ====================

    async def create_agent_node(
        self,
        agent_id: str,
        name: str,
        capabilities: List[str],
        domains: List[str],
        tenant_id: str,
        agent_level: int = 2,
        embedding: Optional[List[float]] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Create agent node in graph database.

        Args:
            agent_id: Unique agent identifier (UUID)
            name: Agent display name
            capabilities: List of agent capabilities
            domains: List of domain expertise areas
            tenant_id: Tenant identifier for multi-tenant isolation
            agent_level: Agent level (1=Master, 2=Expert, 3=Specialist, 4=Worker, 5=Tool)
            embedding: Optional embedding vector (1536 dimensions)
            metadata: Additional metadata

        Returns:
            Created agent node properties
        """
        async with self.driver.session(database="neo4j") as session:
            result = await session.run("""
                CREATE (a:Agent {
                    id: $agent_id,
                    name: $name,
                    capabilities: $capabilities,
                    domains: $domains,
                    tenant_id: $tenant_id,
                    agent_level: $agent_level,
                    embedding: $embedding,
                    metadata: $metadata,
                    total_queries: 0,
                    success_count: 0,
                    avg_confidence: 0.0,
                    avg_rating: 0.0,
                    rating_count: 0,
                    is_active: true,
                    created_at: datetime(),
                    last_used: datetime()
                })
                RETURN a
            """,
                agent_id=agent_id,
                name=name,
                capabilities=capabilities,
                domains=domains,
                tenant_id=tenant_id,
                agent_level=agent_level,
                embedding=embedding,
                metadata=metadata or {}
            )

            record = await result.single()
            node_data = dict(record["a"])

            logger.info(
                "Agent node created",
                agent_id=agent_id,
                name=name,
                agent_level=agent_level,
                tenant_id=tenant_id
            )

            return node_data

    async def get_agent_node(self, agent_id: str) -> Optional[Dict]:
        """Get agent node by ID."""
        async with self.driver.session(database="neo4j") as session:
            result = await session.run("""
                MATCH (a:Agent {id: $agent_id})
                RETURN a
            """, agent_id=agent_id)

            record = await result.single()
            if record:
                return dict(record["a"])
            return None

    async def update_agent_embedding(
        self,
        agent_id: str,
        embedding: List[float]
    ):
        """Update agent embedding vector."""
        async with self.driver.session(database="neo4j") as session:
            await session.run("""
                MATCH (a:Agent {id: $agent_id})
                SET a.embedding = $embedding
            """, agent_id=agent_id, embedding=embedding)

            logger.info("Agent embedding updated", agent_id=agent_id)

    async def deactivate_agent(self, agent_id: str):
        """Mark agent as inactive (soft delete)."""
        async with self.driver.session(database="neo4j") as session:
            await session.run("""
                MATCH (a:Agent {id: $agent_id})
                SET a.is_active = false
            """, agent_id=agent_id)

            logger.info("Agent deactivated", agent_id=agent_id)

    # ==================== Relationship Management ====================

    async def create_relationship(
        self,
        from_agent_id: str,
        to_agent_id: str,
        relationship_type: str,
        weight: float = 1.0,
        metadata: Optional[Dict] = None
    ):
        """
        Create relationship between agents.

        Relationship Types:
        - RELATES_TO: General semantic relationship
        - CO_OCCURS_WITH: Agents frequently used together
        - COMPLEMENTS: Capabilities that complement each other
        - ESCALATES_TO: Confidence-based escalation path
        - SPAWNS: Sub-agent spawning relationship

        Args:
            from_agent_id: Source agent ID
            to_agent_id: Target agent ID
            relationship_type: Relationship type (see above)
            weight: Relationship strength (0.0-1.0)
            metadata: Additional relationship properties
        """
        async with self.driver.session(database="neo4j") as session:
            # Use parameterized query with relationship type
            query = f"""
                MATCH (a1:Agent {{id: $from_id}})
                MATCH (a2:Agent {{id: $to_id}})
                CREATE (a1)-[r:{relationship_type} {{
                    weight: $weight,
                    metadata: $metadata,
                    created_at: datetime()
                }}]->(a2)
                RETURN r
            """

            await session.run(
                query,
                from_id=from_agent_id,
                to_id=to_agent_id,
                weight=weight,
                metadata=metadata or {}
            )

            logger.info(
                "Relationship created",
                from_agent=from_agent_id,
                to_agent=to_agent_id,
                type=relationship_type,
                weight=weight
            )

    async def update_relationship_weight(
        self,
        from_agent_id: str,
        to_agent_id: str,
        relationship_type: str,
        new_weight: float
    ):
        """Update relationship weight (for learning/optimization)."""
        async with self.driver.session(database="neo4j") as session:
            query = f"""
                MATCH (a1:Agent {{id: $from_id}})-[r:{relationship_type}]-(a2:Agent {{id: $to_id}})
                SET r.weight = $weight
            """

            await session.run(
                query,
                from_id=from_agent_id,
                to_id=to_agent_id,
                weight=new_weight
            )

    # ==================== Graph Traversal Search ====================

    async def graph_traversal_search(
        self,
        query_embedding: List[float],
        tenant_id: str,
        max_depth: int = 3,
        limit: int = 10
    ) -> List[Dict]:
        """
        Graph-based agent discovery using relationship traversal.

        Algorithm:
        1. Find seed agents matching query via cosine similarity
        2. Traverse relationships (RELATES_TO, CO_OCCURS_WITH, COMPLEMENTS)
        3. Calculate graph-based scores combining:
           - Similarity to query (40%)
           - Average relationship weight (30%)
           - Distance from seed (20%)
           - Number of seed connections (10%)
        4. Return top-k agents by graph score

        Performance Target: <100ms P95 latency

        Args:
            query_embedding: Query embedding vector (1536 dimensions)
            tenant_id: Tenant ID for multi-tenant isolation
            max_depth: Maximum traversal depth (default: 3)
            limit: Maximum number of results (default: 10)

        Returns:
            List of agent dictionaries with graph scores
        """
        start_time = time.time()

        # NOTE: Neo4j 5+ does not support parameters in variable-length path patterns
        # We must construct the query with a literal depth value
        # Validate max_depth to prevent injection (must be 1-5)
        safe_depth = max(1, min(5, int(max_depth)))

        async with self.driver.session(database="neo4j") as session:
            # Build query with literal depth value (Neo4j 5+ requirement)
            query = f"""
                // Find seed agents matching query
                MATCH (seed:Agent {{tenant_id: $tenant_id}})
                WHERE seed.embedding IS NOT NULL
                  AND seed.is_active = true

                // Calculate similarity (cosine distance)
                WITH seed,
                     gds.similarity.cosine(seed.embedding, $query_embedding) as similarity
                WHERE similarity > 0.7
                ORDER BY similarity DESC
                LIMIT 5

                // Traverse relationships (depth is literal due to Neo4j 5+ limitation)
                MATCH path = (seed)-[r:RELATES_TO|CO_OCCURS_WITH|COMPLEMENTS*1..{safe_depth}]-(related:Agent)
                WHERE related.tenant_id = $tenant_id
                  AND related.is_active = true

                // Calculate graph-based score
                WITH related,
                     seed,
                     path,
                     similarity,
                     [rel in relationships(path) | rel.weight] as weights

                WITH related,
                     similarity,
                     reduce(s = 0.0, w in weights | s + w) / size(weights) as avg_relationship_weight,
                     length(path) as distance,
                     count(DISTINCT seed) as seed_count

                // Combine scores with weighted formula
                WITH related,
                     (similarity * 0.4 +
                      avg_relationship_weight * 0.3 +
                      (1.0 / distance) * 0.2 +
                      (seed_count / 5.0) * 0.1) as graph_score,
                     similarity,
                     avg_relationship_weight,
                     distance,
                     seed_count

                RETURN DISTINCT
                    related.id as agent_id,
                    related.name as name,
                    related.capabilities as capabilities,
                    related.domains as domains,
                    coalesce(related.agent_level, related.tier, 2) as agent_level,
                    graph_score,
                    similarity,
                    avg_relationship_weight,
                    distance,
                    seed_count
                ORDER BY graph_score DESC
                LIMIT $limit
            """
            result = await session.run(
                query,
                tenant_id=tenant_id,
                query_embedding=query_embedding,
                limit=limit
            )

            agents = []
            async for record in result:
                agents.append({
                    "agent_id": record["agent_id"],
                    "name": record["name"],
                    "capabilities": record["capabilities"],
                    "domains": record["domains"],
                    "agent_level": record["agent_level"],
                    "graph_score": float(record["graph_score"]),
                    "similarity": float(record.get("similarity", 0.0)),
                    "avg_relationship_weight": float(record.get("avg_relationship_weight", 0.0)),
                    "distance": int(record["distance"]),
                    "seed_count": int(record["seed_count"])
                })

        latency_ms = int((time.time() - start_time) * 1000)

        logger.info(
            "Graph traversal search completed",
            latency_ms=latency_ms,
            agents_found=len(agents),
            tenant_id=tenant_id
        )

        # Alert if latency exceeds P95 target
        if latency_ms > 100:
            logger.warning(
                "Graph search latency exceeded P95 target",
                latency_ms=latency_ms,
                target=100
            )

        return agents

    async def text_based_graph_search(
        self,
        query: str,
        tenant_id: str,
        max_depth: int = 2,
        limit: int = 10
    ) -> List[Dict]:
        """
        Text-based graph search for agent discovery (no embeddings required).

        Uses keyword matching on agent name/description and traverses relationships
        to find related agents based on graph structure.

        Algorithm:
        1. Find seed agents matching query keywords in name/description
        2. Traverse relationships (PERFORMS, IN_DEPARTMENT, IN_FUNCTION, etc.)
        3. Calculate graph-based scores combining:
           - Text match quality (40%)
           - Relationship weight (30%)
           - Distance from seed (20%)
           - Connection count (10%)

        Args:
            query: Search query text
            tenant_id: Tenant ID for multi-tenant isolation
            max_depth: Maximum traversal depth (default: 2)
            limit: Maximum number of results (default: 10)

        Returns:
            List of agent dictionaries with graph scores
        """
        start_time = time.time()

        # Extract keywords from query
        keywords = [w.lower() for w in query.split() if len(w) > 2]
        keyword_pattern = "|".join(keywords) if keywords else query.lower()

        # Validate max_depth
        safe_depth = max(1, min(3, int(max_depth)))

        async with self.driver.session(database="neo4j") as session:
            # Text-based search query
            query_cypher = f"""
                // Find seed agents matching query keywords
                MATCH (seed:Agent)
                WHERE seed.tenant_id = $tenant_id
                  AND seed.is_active = true
                  AND (
                    toLower(seed.name) CONTAINS $keyword_pattern
                    OR toLower(seed.display_name) CONTAINS $keyword_pattern
                    OR toLower(coalesce(seed.description, '')) CONTAINS $keyword_pattern
                  )

                // Calculate text match score
                WITH seed,
                     CASE
                         WHEN toLower(seed.name) CONTAINS $keyword_pattern THEN 0.9
                         WHEN toLower(seed.display_name) CONTAINS $keyword_pattern THEN 0.8
                         ELSE 0.6
                     END as text_score
                ORDER BY text_score DESC
                LIMIT 10

                // Also get related agents via relationships
                OPTIONAL MATCH path = (seed)-[r*1..{safe_depth}]-(related:Agent)
                WHERE related.tenant_id = $tenant_id
                  AND related.is_active = true
                  AND related <> seed

                WITH seed, text_score, related, path,
                     CASE WHEN path IS NOT NULL THEN length(path) ELSE 0 END as distance

                // Combine seed and related agents
                WITH collect(DISTINCT {{
                    agent: seed,
                    score: text_score,
                    distance: 0,
                    is_seed: true
                }}) + collect(DISTINCT {{
                    agent: related,
                    score: text_score * (1.0 / (1 + coalesce(distance, 1))),
                    distance: coalesce(distance, 1),
                    is_seed: false
                }}) as all_results

                UNWIND all_results as result
                WITH result.agent as agent,
                     max(result.score) as graph_score,
                     min(result.distance) as distance,
                     max(CASE WHEN result.is_seed THEN 1 ELSE 0 END) as is_seed
                WHERE agent IS NOT NULL

                RETURN DISTINCT
                    agent.id as agent_id,
                    agent.name as name,
                    agent.display_name as display_name,
                    agent.description as description,
                    coalesce(agent.level, 2) as agent_level,
                    graph_score,
                    distance,
                    is_seed
                ORDER BY graph_score DESC, distance ASC
                LIMIT $limit
            """

            result = await session.run(
                query_cypher,
                tenant_id=tenant_id,
                keyword_pattern=keywords[0] if keywords else query.lower(),
                limit=limit
            )

            agents = []
            async for record in result:
                agents.append({
                    "agent_id": record["agent_id"],
                    "name": record["name"] or record["display_name"],
                    "description": record.get("description", ""),
                    "agent_level": record["agent_level"],
                    "graph_score": float(record["graph_score"]),
                    "distance": int(record["distance"]),
                    "is_seed": bool(record["is_seed"])
                })

        latency_ms = int((time.time() - start_time) * 1000)

        logger.info(
            "Text-based graph search completed",
            latency_ms=latency_ms,
            agents_found=len(agents),
            tenant_id=tenant_id,
            query_keywords=keywords[:3]
        )

        return agents

    # ==================== Performance Tracking ====================

    async def update_agent_performance(
        self,
        agent_id: str,
        success: bool,
        confidence: float,
        user_rating: Optional[float] = None
    ):
        """
        Update agent node with performance metrics.

        This tracks:
        - Total queries handled
        - Success count
        - Average confidence
        - Average user rating
        - Last used timestamp

        Args:
            agent_id: Agent identifier
            success: Whether the query was successful
            confidence: Confidence score (0.0-1.0)
            user_rating: Optional user rating (1-5)
        """
        async with self.driver.session(database="neo4j") as session:
            await session.run("""
                MATCH (a:Agent {id: $agent_id})
                SET a.total_queries = coalesce(a.total_queries, 0) + 1,
                    a.success_count = coalesce(a.success_count, 0) + CASE WHEN $success THEN 1 ELSE 0 END,
                    a.avg_confidence = (coalesce(a.avg_confidence, 0) * coalesce(a.total_queries, 0) + $confidence) / (coalesce(a.total_queries, 0) + 1),
                    a.avg_rating = CASE
                        WHEN $user_rating IS NOT NULL
                        THEN (coalesce(a.avg_rating, 0) * coalesce(a.rating_count, 0) + $user_rating) / (coalesce(a.rating_count, 0) + 1)
                        ELSE a.avg_rating
                    END,
                    a.rating_count = CASE WHEN $user_rating IS NOT NULL THEN coalesce(a.rating_count, 0) + 1 ELSE coalesce(a.rating_count, 0) END,
                    a.last_used = datetime()
            """,
                agent_id=agent_id,
                success=success,
                confidence=confidence,
                user_rating=user_rating
            )

            logger.debug(
                "Agent performance updated",
                agent_id=agent_id,
                success=success,
                confidence=confidence
            )

    async def record_agent_collaboration(
        self,
        agent_id_1: str,
        agent_id_2: str,
        success: bool
    ):
        """
        Record collaboration between agents and update CO_OCCURS_WITH relationship.

        If relationship doesn't exist, create it.
        If it exists, increment co-occurrence count and update weight.
        """
        async with self.driver.session(database="neo4j") as session:
            await session.run("""
                MATCH (a1:Agent {id: $agent_id_1})
                MATCH (a2:Agent {id: $agent_id_2})
                MERGE (a1)-[r:CO_OCCURS_WITH]-(a2)
                ON CREATE SET
                    r.co_occurrence_count = 1,
                    r.success_count = CASE WHEN $success THEN 1 ELSE 0 END,
                    r.weight = CASE WHEN $success THEN 0.8 ELSE 0.5 END,
                    r.created_at = datetime()
                ON MATCH SET
                    r.co_occurrence_count = r.co_occurrence_count + 1,
                    r.success_count = r.success_count + CASE WHEN $success THEN 1 ELSE 0 END,
                    r.weight = (r.success_count + CASE WHEN $success THEN 1 ELSE 0 END) / (r.co_occurrence_count + 1.0)
            """,
                agent_id_1=agent_id_1,
                agent_id_2=agent_id_2,
                success=success
            )

    # ==================== Analytics & Insights ====================

    async def get_agent_analytics(
        self,
        agent_id: str
    ) -> Dict:
        """Get comprehensive analytics for an agent."""
        async with self.driver.session(database="neo4j") as session:
            result = await session.run("""
                MATCH (a:Agent {id: $agent_id})
                OPTIONAL MATCH (a)-[r_out]->()
                OPTIONAL MATCH (a)<-[r_in]-()
                WITH a,
                     count(DISTINCT r_out) as outgoing_relationships,
                     count(DISTINCT r_in) as incoming_relationships
                RETURN
                    a.total_queries as total_queries,
                    a.success_count as success_count,
                    a.avg_confidence as avg_confidence,
                    a.avg_rating as avg_rating,
                    a.rating_count as rating_count,
                    outgoing_relationships,
                    incoming_relationships,
                    CASE
                        WHEN a.total_queries > 0
                        THEN (a.success_count * 1.0) / a.total_queries
                        ELSE 0.0
                    END as success_rate
            """, agent_id=agent_id)

            record = await result.single()
            if record:
                return dict(record)
            return {}

    async def get_top_performing_agents(
        self,
        tenant_id: str,
        limit: int = 10
    ) -> List[Dict]:
        """Get top performing agents by success rate and rating."""
        async with self.driver.session(database="neo4j") as session:
            result = await session.run("""
                MATCH (a:Agent {tenant_id: $tenant_id, is_active: true})
                WHERE a.total_queries > 10  // Minimum query threshold
                WITH a,
                     (a.success_count * 1.0) / a.total_queries as success_rate,
                     coalesce(a.avg_rating, 0) as avg_rating,
                     coalesce(a.avg_confidence, 0) as avg_confidence
                RETURN
                    a.id as agent_id,
                    a.name as name,
                    a.total_queries as total_queries,
                    success_rate,
                    avg_rating,
                    avg_confidence,
                    (success_rate * 0.5 + (avg_rating / 5.0) * 0.3 + avg_confidence * 0.2) as overall_score
                ORDER BY overall_score DESC
                LIMIT $limit
            """, tenant_id=tenant_id, limit=limit)

            return [dict(record) async for record in result]

    # ==================== Utilities ====================

    async def get_statistics(self) -> Dict:
        """Get database statistics."""
        async with self.driver.session(database="neo4j") as session:
            result = await session.run("""
                MATCH (a:Agent)
                OPTIONAL MATCH ()-[r]->()
                RETURN
                    count(DISTINCT a) as total_agents,
                    count(DISTINCT CASE WHEN a.is_active THEN a END) as active_agents,
                    count(DISTINCT r) as total_relationships,
                    count(DISTINCT CASE WHEN coalesce(a.agent_level, a.tier) = 1 THEN a END) as master_agents,
                    count(DISTINCT CASE WHEN coalesce(a.agent_level, a.tier) = 2 THEN a END) as expert_agents,
                    count(DISTINCT CASE WHEN coalesce(a.agent_level, a.tier) = 3 THEN a END) as specialist_agents
            """)

            record = await result.single()
            return dict(record) if record else {}


# Singleton instance (initialized by dependency injection)
_neo4j_client: Optional[Neo4jClient] = None


def get_neo4j_client() -> Neo4jClient:
    """Get Neo4j client instance (dependency injection)."""
    global _neo4j_client
    if _neo4j_client is None:
        raise RuntimeError("Neo4j client not initialized. Call initialize_neo4j_client() first.")
    return _neo4j_client


def initialize_neo4j_client(uri: str, user: str, password: str) -> Neo4jClient:
    """Initialize Neo4j client singleton."""
    global _neo4j_client
    _neo4j_client = Neo4jClient(uri, user, password)
    return _neo4j_client


async def close_neo4j_client():
    """Close Neo4j client connection."""
    global _neo4j_client
    if _neo4j_client:
        await _neo4j_client.close()
        _neo4j_client = None
