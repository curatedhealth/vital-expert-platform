"""
Hybrid Agent Search Service

Combines vector similarity search with graph-based relationship traversal
for intelligent agent discovery.

Architecture:
- 60% Vector Similarity (semantic matching)
- 40% Graph Relationships (domain proficiency, collaborations, escalations)

Target Performance: P90 <300ms
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import time

import asyncpg
from langchain_openai import OpenAIEmbeddings
import numpy as np


logger = logging.getLogger(__name__)


@dataclass
class AgentSearchResult:
    """Agent search result with scoring breakdown"""
    agent_id: str
    agent_name: str
    agent_tier: int

    # Scoring components
    vector_score: float  # 0.0 to 1.0
    domain_score: float  # 0.0 to 1.0
    capability_score: float  # 0.0 to 1.0
    graph_score: float  # 0.0 to 1.0

    # Final scores
    hybrid_score: float  # 0.0 to 1.0
    ranking_position: int

    # Metadata
    matched_domains: List[str]
    matched_capabilities: List[str]
    escalation_available: bool
    collaboration_partners: List[str]

    # Performance
    search_latency_ms: float


class HybridAgentSearch:
    """
    Hybrid agent search combining vector embeddings and graph relationships
    """

    def __init__(self, database_url: Optional[str] = None):
        self.database_url = database_url or "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
        self.db_pool: Optional[asyncpg.Pool] = None

        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-large",
            dimensions=1536
        )

        # Scoring weights
        self.weights = {
            "vector": 0.60,  # 60% from vector similarity
            "domain": 0.25,  # 25% from domain proficiency
            "capability": 0.10,  # 10% from capability match
            "graph": 0.05    # 5% from graph relationships (collaborations, escalations)
        }

    async def connect(self):
        """Connect to database"""
        if not self.db_pool:
            self.db_pool = await asyncpg.create_pool(
                self.database_url,
                min_size=2,
                max_size=20,
                command_timeout=60
            )
            logger.info("Connected to PostgreSQL")

    async def close(self):
        """Close database connection"""
        if self.db_pool:
            await self.db_pool.close()
            logger.info("Closed PostgreSQL connection")

    async def search(
        self,
        query: str,
        domains: Optional[List[str]] = None,
        capabilities: Optional[List[str]] = None,
        min_tier: Optional[int] = None,
        max_tier: Optional[int] = None,
        similarity_threshold: float = 0.70,
        max_results: int = 10
    ) -> List[AgentSearchResult]:
        """
        Hybrid search for agents combining vector and graph approaches.

        Args:
            query: Natural language query
            domains: Optional domain filters
            capabilities: Optional capability filters
            min_tier: Minimum agent tier (1, 2, or 3)
            max_tier: Maximum agent tier
            similarity_threshold: Minimum vector similarity (0.0 to 1.0)
            max_results: Maximum number of results

        Returns:
            List of AgentSearchResult sorted by hybrid score
        """
        start_time = time.perf_counter()

        if not self.db_pool:
            await self.connect()

        # Step 1: Generate query embedding (target: <200ms)
        query_embedding = await self.embeddings.aembed_query(query)

        # Step 2: Run hybrid search query (target: <100ms)
        results = await self._execute_hybrid_search(
            query_embedding=query_embedding,
            query_domains=domains or [],
            query_capabilities=capabilities or [],
            min_tier=min_tier,
            max_tier=max_tier,
            similarity_threshold=similarity_threshold,
            max_results=max_results
        )

        # Step 3: Enrich results with graph data (target: <50ms)
        enriched_results = await self._enrich_with_graph_data(results)

        # Calculate total latency
        total_latency_ms = (time.perf_counter() - start_time) * 1000

        # Add latency to each result
        for result in enriched_results:
            result.search_latency_ms = total_latency_ms

        logger.info(f"Hybrid search completed in {total_latency_ms:.2f}ms, found {len(enriched_results)} agents")

        return enriched_results

    async def _execute_hybrid_search(
        self,
        query_embedding: List[float],
        query_domains: List[str],
        query_capabilities: List[str],
        min_tier: Optional[int],
        max_tier: Optional[int],
        similarity_threshold: float,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """Execute hybrid search SQL query"""

        # Build tier filter
        tier_filter = ""
        if min_tier is not None and max_tier is not None:
            tier_filter = f"AND COALESCE((a.metadata->>'tier')::INTEGER, 2) BETWEEN {min_tier} AND {max_tier}"
        elif min_tier is not None:
            tier_filter = f"AND COALESCE((a.metadata->>'tier')::INTEGER, 2) >= {min_tier}"
        elif max_tier is not None:
            tier_filter = f"AND COALESCE((a.metadata->>'tier')::INTEGER, 2) <= {max_tier}"

        query_sql = f"""
        WITH vector_results AS (
            -- Vector similarity search using HNSW index
            SELECT
                ae.agent_id,
                (1 - (ae.embedding <=> $1::vector))::DECIMAL(5,4) AS vector_score
            FROM agent_embeddings ae
            WHERE
                ae.embedding_type = 'agent_profile'
                AND (1 - (ae.embedding <=> $1::vector)) >= $2
        ),
        domain_results AS (
            -- Domain proficiency matching
            SELECT
                ad.agent_id,
                COUNT(DISTINCT d.id) AS domain_match_count,
                AVG(ad.proficiency_score)::DECIMAL(3,2) AS avg_domain_proficiency,
                array_agg(DISTINCT d.name) AS matched_domains
            FROM agent_domains ad
            JOIN domains d ON ad.domain_id = d.id
            WHERE
                (ARRAY_LENGTH($3::TEXT[], 1) IS NULL OR d.name = ANY($3::TEXT[]))
                AND ad.proficiency_score >= 0.50
            GROUP BY ad.agent_id
        ),
        capability_results AS (
            -- Capability matching
            SELECT
                ac.agent_id,
                COUNT(DISTINCT c.id) AS capability_match_count,
                AVG(ac.proficiency_score)::DECIMAL(3,2) AS avg_capability_proficiency,
                array_agg(DISTINCT c.name) AS matched_capabilities
            FROM agent_capabilities ac
            JOIN capabilities c ON ac.capability_id = c.id
            WHERE
                (ARRAY_LENGTH($4::TEXT[], 1) IS NULL OR c.name = ANY($4::TEXT[]))
                AND ac.proficiency_score >= 0.50
            GROUP BY ac.agent_id
        ),
        graph_results AS (
            -- Graph relationships (collaborations + escalations)
            SELECT
                a.id AS agent_id,
                (
                    COUNT(DISTINCT col.id) * 0.005 +  -- Each collaboration adds 0.5%
                    COUNT(DISTINCT esc.id) * 0.003     -- Each escalation path adds 0.3%
                )::DECIMAL(3,2) AS graph_bonus
            FROM agents a
            LEFT JOIN agent_collaborations col ON (a.id = col.agent1_id OR a.id = col.agent2_id)
            LEFT JOIN agent_escalations esc ON a.id = esc.from_agent_id
            GROUP BY a.id
        )
        SELECT
            a.id AS agent_id,
            a.name AS agent_name,
            COALESCE((a.metadata->>'tier')::INTEGER, 2) AS agent_tier,

            -- Component scores
            COALESCE(vr.vector_score, 0.0)::DECIMAL(5,4) AS vector_score,
            COALESCE(dr.avg_domain_proficiency, 0.0)::DECIMAL(3,2) AS domain_score,
            COALESCE(cr.avg_capability_proficiency, 0.0)::DECIMAL(3,2) AS capability_score,
            COALESCE(gr.graph_bonus, 0.0)::DECIMAL(3,2) AS graph_score,

            -- Match details
            COALESCE(dr.domain_match_count, 0) AS domain_match_count,
            COALESCE(dr.matched_domains, ARRAY[]::TEXT[]) AS matched_domains,
            COALESCE(cr.capability_match_count, 0) AS capability_match_count,
            COALESCE(cr.matched_capabilities, ARRAY[]::TEXT[]) AS matched_capabilities,

            -- Hybrid score calculation
            (
                COALESCE(vr.vector_score, 0.0) * $5 +  -- vector weight
                COALESCE(dr.avg_domain_proficiency, 0.0) * $6 +  -- domain weight
                COALESCE(cr.avg_capability_proficiency, 0.0) * $7 +  -- capability weight
                COALESCE(gr.graph_bonus, 0.0) * $8  -- graph weight
            )::DECIMAL(5,4) AS hybrid_score

        FROM agents a
        LEFT JOIN vector_results vr ON a.id = vr.agent_id
        LEFT JOIN domain_results dr ON a.id = dr.agent_id
        LEFT JOIN capability_results cr ON a.id = cr.agent_id
        LEFT JOIN graph_results gr ON a.id = gr.agent_id
        WHERE
            a.is_active = true
            {tier_filter}
            AND (
                vr.vector_score IS NOT NULL OR
                dr.domain_match_count > 0 OR
                cr.capability_match_count > 0
            )
        ORDER BY hybrid_score DESC
        LIMIT $9
        """

        results = await self.db_pool.fetch(
            query_sql,
            query_embedding,  # $1
            similarity_threshold,  # $2
            query_domains,  # $3
            query_capabilities,  # $4
            self.weights["vector"],  # $5
            self.weights["domain"],  # $6
            self.weights["capability"],  # $7
            self.weights["graph"],  # $8
            max_results  # $9
        )

        return [dict(r) for r in results]

    async def _enrich_with_graph_data(self, results: List[Dict[str, Any]]) -> List[AgentSearchResult]:
        """Enrich results with additional graph relationship data"""
        enriched = []

        for idx, result in enumerate(results):
            agent_id = result['agent_id']

            # Check for escalation paths
            escalation_count = await self.db_pool.fetchval("""
                SELECT COUNT(*)
                FROM agent_escalations
                WHERE from_agent_id = $1
            """, agent_id)

            # Get collaboration partners
            collaboration_partners = await self.db_pool.fetch("""
                SELECT
                    CASE
                        WHEN agent1_id = $1 THEN a2.name
                        ELSE a1.name
                    END AS partner_name
                FROM agent_collaborations ac
                JOIN agents a1 ON ac.agent1_id = a1.id
                JOIN agents a2 ON ac.agent2_id = a2.id
                WHERE
                    (agent1_id = $1 OR agent2_id = $1)
                    AND strength >= 0.50
                ORDER BY strength DESC
                LIMIT 3
            """, agent_id)

            partner_names = [p['partner_name'] for p in collaboration_partners]

            enriched.append(AgentSearchResult(
                agent_id=str(agent_id),
                agent_name=result['agent_name'],
                agent_tier=result['agent_tier'],
                vector_score=float(result['vector_score']),
                domain_score=float(result['domain_score']),
                capability_score=float(result['capability_score']),
                graph_score=float(result['graph_score']),
                hybrid_score=float(result['hybrid_score']),
                ranking_position=idx + 1,
                matched_domains=result['matched_domains'],
                matched_capabilities=result['matched_capabilities'],
                escalation_available=escalation_count > 0,
                collaboration_partners=partner_names,
                search_latency_ms=0.0  # Will be set later
            ))

        return enriched

    async def search_similar_agents(
        self,
        agent_id: str,
        similarity_threshold: float = 0.80,
        max_results: int = 5
    ) -> List[AgentSearchResult]:
        """
        Find agents similar to a given agent (useful for agent recommendations).

        Args:
            agent_id: Source agent ID
            similarity_threshold: Minimum similarity score
            max_results: Maximum results to return

        Returns:
            List of similar agents
        """
        if not self.db_pool:
            await self.connect()

        # Get source agent's embedding
        source_embedding = await self.db_pool.fetchval("""
            SELECT embedding
            FROM agent_embeddings
            WHERE agent_id = $1 AND embedding_type = 'agent_profile'
        """, agent_id)

        if not source_embedding:
            logger.warning(f"No embedding found for agent {agent_id}")
            return []

        # Search for similar agents
        similar = await self.db_pool.fetch("""
            SELECT
                ae.agent_id,
                a.name AS agent_name,
                COALESCE((a.metadata->>'tier')::INTEGER, 2) AS agent_tier,
                (1 - (ae.embedding <=> $1::vector))::DECIMAL(5,4) AS similarity_score
            FROM agent_embeddings ae
            JOIN agents a ON ae.agent_id = a.id
            WHERE
                ae.embedding_type = 'agent_profile'
                AND ae.agent_id != $2
                AND a.is_active = true
                AND (1 - (ae.embedding <=> $1::vector)) >= $3
            ORDER BY ae.embedding <=> $1::vector
            LIMIT $4
        """, source_embedding, agent_id, similarity_threshold, max_results)

        results = []
        for idx, row in enumerate(similar):
            results.append(AgentSearchResult(
                agent_id=str(row['agent_id']),
                agent_name=row['agent_name'],
                agent_tier=row['agent_tier'],
                vector_score=float(row['similarity_score']),
                domain_score=0.0,
                capability_score=0.0,
                graph_score=0.0,
                hybrid_score=float(row['similarity_score']),
                ranking_position=idx + 1,
                matched_domains=[],
                matched_capabilities=[],
                escalation_available=False,
                collaboration_partners=[],
                search_latency_ms=0.0
            ))

        return results

    async def get_agent_graph_stats(self, agent_id: str) -> Dict[str, Any]:
        """Get graph statistics for an agent"""
        if not self.db_pool:
            await self.connect()

        stats = await self.db_pool.fetchrow("""
            SELECT
                COUNT(DISTINCT ad.domain_id) AS domain_count,
                AVG(ad.proficiency_score)::DECIMAL(3,2) AS avg_domain_proficiency,
                COUNT(DISTINCT ac.capability_id) AS capability_count,
                AVG(ac.proficiency_score)::DECIMAL(3,2) AS avg_capability_proficiency,
                COUNT(DISTINCT ae_from.id) AS escalation_paths_from,
                COUNT(DISTINCT ae_to.id) AS escalation_paths_to,
                COUNT(DISTINCT col.id) AS collaboration_count,
                COUNT(DISTINCT emb.id) AS embedding_count
            FROM agents a
            LEFT JOIN agent_domains ad ON a.id = ad.agent_id
            LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
            LEFT JOIN agent_escalations ae_from ON a.id = ae_from.from_agent_id
            LEFT JOIN agent_escalations ae_to ON a.id = ae_to.to_agent_id
            LEFT JOIN agent_collaborations col ON (a.id = col.agent1_id OR a.id = col.agent2_id)
            LEFT JOIN agent_embeddings emb ON a.id = emb.agent_id
            WHERE a.id = $1
            GROUP BY a.id
        """, agent_id)

        return dict(stats) if stats else {}


# ============================================================================
# CLI Interface
# ============================================================================

async def main():
    """CLI entry point for testing hybrid search"""
    import sys

    search_service = HybridAgentSearch()

    await search_service.connect()

    try:
        # Test query
        if len(sys.argv) > 1:
            query = " ".join(sys.argv[1:])
        else:
            query = "What are the FDA requirements for Class II medical devices?"

        print(f"\nSearching for: {query}\n")

        results = await search_service.search(
            query=query,
            max_results=5
        )

        print("="*80)
        print(f"HYBRID SEARCH RESULTS ({len(results)} agents)")
        print("="*80)
        print(f"Search latency: {results[0].search_latency_ms if results else 0:.2f}ms\n")

        for result in results:
            print(f"#{result.ranking_position}: {result.agent_name} (Tier {result.agent_tier})")
            print(f"  Hybrid Score:     {result.hybrid_score:.4f}")
            print(f"  Vector Score:     {result.vector_score:.4f} (60% weight)")
            print(f"  Domain Score:     {result.domain_score:.4f} (25% weight)")
            print(f"  Capability Score: {result.capability_score:.4f} (10% weight)")
            print(f"  Graph Score:      {result.graph_score:.4f} (5% weight)")
            print(f"  Matched Domains:  {', '.join(result.matched_domains) if result.matched_domains else 'None'}")
            print(f"  Matched Capabilities: {', '.join(result.matched_capabilities) if result.matched_capabilities else 'None'}")
            print(f"  Escalation Available: {result.escalation_available}")
            print(f"  Collaboration Partners: {', '.join(result.collaboration_partners) if result.collaboration_partners else 'None'}")
            print()

        print("="*80)

    finally:
        await search_service.close()


if __name__ == "__main__":
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    asyncio.run(main())
