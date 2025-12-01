"""
GraphRAG Hybrid Agent Selection Service

This service implements the gold standard 3-method hybrid search for agent selection:
- PostgreSQL full-text search (30%)
- Pinecone vector search (50%)
- Neo4j graph traversal (20%)

Using weighted reciprocal rank fusion (RRF) to combine results.

Performance Targets:
- P95 latency: <450ms
- Accuracy: 92-95%
- Top-3 accuracy: >92%

Architecture Requirements Document (ARD) v2.0 Compliant
"""

from typing import List, Dict, Optional
import asyncio
import time
import os
from services.supabase_client import get_supabase_client
from services.neo4j_client import get_neo4j_client
from services.embedding_service import EmbeddingService
import structlog

logger = structlog.get_logger()


class GraphRAGSelector:
    """
    GraphRAG hybrid agent selection with 3-method fusion.

    Weights (ARD v2.0 specification):
    - PostgreSQL full-text: 30%
    - Pinecone vector: 50%
    - Neo4j graph: 20%

    Performance targets:
    - P95 latency: <450ms
    - Top-3 accuracy: 92-95%
    - Cache hit rate: >85%
    """

    # ARD v2.0 Specification: 30/50/20 weight distribution
    WEIGHTS = {
        "postgres_fulltext": 0.30,
        "pinecone_vector": 0.50,
        "neo4j_graph": 0.20
    }

    # Reciprocal Rank Fusion constant
    RRF_K = 60

    def __init__(
        self,
        embedding_service: Optional[EmbeddingService] = None,
        supabase_client = None
    ):
        """Initialize GraphRAG selector with required services.

        Args:
            embedding_service: Optional embedding service instance
            supabase_client: Optional pre-initialized Supabase client (recommended)
                           If not provided, lazy initialization will be attempted
        """
        self.embedding_service = embedding_service or EmbeddingService()
        self.supabase = supabase_client  # Use provided client or None for lazy init
        self.neo4j = None  # Lazy initialization

    def _get_supabase(self):
        """Lazy load Supabase client."""
        if self.supabase is None:
            logger.warning("GraphRAGSelector using lazy Supabase init - consider passing client explicitly")
            self.supabase = get_supabase_client()
        return self.supabase

    def _get_neo4j(self):
        """Lazy load Neo4j client."""
        if self.neo4j is None:
            self.neo4j = get_neo4j_client()
        return self.neo4j

    async def select_agents(
        self,
        query: str,
        tenant_id: str,
        mode: str,
        max_agents: int = 3,
        min_confidence: float = 0.005  # Adjusted for RRF scores (typically 0.01-0.02)
    ) -> List[Dict]:
        """
        Hybrid agent selection using 3 methods with weighted fusion.

        Args:
            query: User query text
            tenant_id: Tenant identifier for multi-tenant isolation
            mode: Ask Expert mode (mode1, mode2, mode3, mode4)
            max_agents: Maximum number of agents to return
            min_confidence: Minimum confidence threshold

        Returns:
            List of selected agents with confidence scores and metadata
        """
        start_time = time.time()

        logger.info(
            "GraphRAG agent selection started",
            query_preview=query[:100],
            tenant_id=tenant_id,
            mode=mode,
            max_agents=max_agents
        )

        # Generate query embedding
        query_embedding = await self.embedding_service.embed_query(query)

        # Parallel execution of all 3 methods
        results = await asyncio.gather(
            self._postgres_fulltext_search(query, tenant_id),
            self._pinecone_vector_search(query_embedding, tenant_id),
            self._neo4j_graph_search(query_embedding, tenant_id),
            return_exceptions=True
        )

        postgres_results, pinecone_results, neo4j_results = results

        # Handle failures gracefully
        postgres_results = self._handle_search_error(
            postgres_results, "PostgreSQL", []
        )
        pinecone_results = self._handle_search_error(
            pinecone_results, "Pinecone", []
        )
        neo4j_results = self._handle_search_error(
            neo4j_results, "Neo4j", []
        )

        # Weighted score fusion using RRF
        fused_agents = self._fuse_scores(
            postgres=postgres_results,
            pinecone=pinecone_results,
            neo4j=neo4j_results
        )

        # Log pre-filter stats for debugging
        logger.info(
            "GraphRAG score fusion completed",
            total_unique_agents=len(fused_agents),
            top_fused_score=round(fused_agents[0]["fused_score"], 4) if fused_agents else 0.0,
            min_confidence_threshold=min_confidence
        )

        # Apply minimum confidence threshold
        filtered_agents = [
            agent for agent in fused_agents
            if agent.get("fused_score", 0) >= min_confidence
        ]

        logger.info(
            "GraphRAG confidence filtering",
            agents_before_filter=len(fused_agents),
            agents_after_filter=len(filtered_agents)
        )

        # Select top-k agents
        selected = filtered_agents[:max_agents]

        # Calculate confidence metrics
        selected = self._calculate_confidence(selected, query)

        # Enrich with agent details from database
        selected = await self._enrich_agent_details(selected, tenant_id)

        latency_ms = int((time.time() - start_time) * 1000)

        logger.info(
            "GraphRAG agent selection completed",
            latency_ms=latency_ms,
            agents_found=len(selected),
            postgres_count=len(postgres_results),
            pinecone_count=len(pinecone_results),
            neo4j_count=len(neo4j_results),
            mode=mode
        )

        # Performance monitoring
        if latency_ms > 450:
            logger.warning(
                "GraphRAG latency exceeded P95 target",
                latency_ms=latency_ms,
                target=450,
                mode=mode
            )

        return selected

    # ==================== Search Methods ====================

    async def _postgres_fulltext_search(
        self,
        query: str,
        tenant_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """
        PostgreSQL full-text search (30% weight).

        Uses pg_trgm and ts_vector for full-text matching on:
        - Agent name
        - Agent description
        - Capabilities
        - Domain expertise

        Returns:
            List of agents with text_rank scores
        """
        try:
            supabase = self._get_supabase()

            # Call PostgreSQL RPC function for full-text search
            # Note: supabase-py client is synchronous, so we run in thread pool
            def _run_rpc():
                return supabase.client.rpc(
                    "search_agents_fulltext",
                    {
                        "search_query": query,
                        "tenant_filter": tenant_id,
                        "result_limit": limit
                    }
                ).execute()

            result = await asyncio.to_thread(_run_rpc)

            agents = [
                {
                    "agent_id": r["id"],
                    "agent_name": r["name"],
                    # RPC function returns "rank" not "text_rank"
                    "postgres_score": float(r.get("rank", r.get("text_rank", 0.5))),
                    "source": "postgres"
                }
                for r in (result.data or [])
            ]

            logger.info(
                "PostgreSQL fulltext search completed",
                agents_found=len(agents),
                sample_agents=[a["agent_name"] for a in agents[:3]] if agents else []
            )

            return agents

        except Exception as e:
            logger.error(
                "PostgreSQL fulltext search failed",
                error=str(e),
                error_type=type(e).__name__
            )
            raise  # Re-raise to be handled by caller

    async def _pinecone_vector_search(
        self,
        query_embedding: List[float],
        tenant_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """
        Pinecone vector search (50% weight).

        Uses Pinecone serverless for semantic similarity search.
        Queries the "vital-agents" index with tenant namespaces.

        Returns:
            List of agents with vector similarity scores
        """
        try:
            from pinecone import Pinecone

            api_key = os.getenv("PINECONE_API_KEY")
            if not api_key:
                logger.warning("Pinecone API key not configured, skipping vector search")
                return []

            pc = Pinecone(api_key=api_key)

            # Use dedicated agent index (from env or default)
            # Note: The "ont-agents" namespace contains all agent embeddings (2,547 vectors)
            # Check both env var names for compatibility
            index_name = os.getenv("PINECONE_AGENTS_INDEX_NAME") or os.getenv("PINECONE_AGENT_INDEX", "vital-knowledge")
            agent_namespace = os.getenv("PINECONE_AGENT_NAMESPACE", "ont-agents")

            index = pc.Index(index_name)

            # Check embedding dimension compatibility
            # The current embedding service uses all-mpnet-base-v2 (768-dim)
            # but the Pinecone index was created with text-embedding-3-large (3072-dim)
            query_dim = len(query_embedding)
            expected_dim = int(os.getenv("PINECONE_INDEX_DIMENSION", "3072"))

            if query_dim != expected_dim:
                logger.warning(
                    "Pinecone dimension mismatch - skipping vector search",
                    query_embedding_dim=query_dim,
                    expected_index_dim=expected_dim,
                    recommendation="Either recreate Pinecone index with 768 dimensions or use OpenAI text-embedding-3-large"
                )
                return []

            # Query the ont-agents namespace which contains all agent vectors
            # Previously used tenant-{tenant_id} but that namespace is empty
            results = index.query(
                vector=query_embedding,
                top_k=limit,
                namespace=agent_namespace,
                include_metadata=True
                # Removed filter={"is_active": True} as metadata may not have this field
            )

            agents = [
                {
                    "agent_id": match.id,
                    "agent_name": match.metadata.get("name", "Unknown"),
                    "pinecone_score": float(match.score),
                    "source": "pinecone"
                }
                for match in results.matches
            ]

            logger.info(
                "Pinecone vector search completed",
                agents_found=len(agents),
                namespace=agent_namespace,
                index=index_name,
                sample_agents=[a["agent_name"] for a in agents[:3]] if agents else []
            )

            return agents

        except Exception as e:
            logger.error(
                "Pinecone vector search failed",
                error=str(e),
                error_type=type(e).__name__
            )
            raise

    async def _neo4j_graph_search(
        self,
        query_embedding: List[float],
        tenant_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """
        Neo4j graph traversal search (20% weight).

        Uses graph relationships to find:
        - Directly related agents
        - Frequently co-occurring agents
        - Complementary agents

        Returns:
            List of agents with graph scores
        """
        try:
            neo4j = self._get_neo4j()

            results = await neo4j.graph_traversal_search(
                query_embedding=query_embedding,
                tenant_id=tenant_id,
                max_depth=3,
                limit=limit
            )

            agents = [
                {
                    "agent_id": r["agent_id"],
                    "agent_name": r["name"],
                    "neo4j_score": float(r["graph_score"]),
                    "source": "neo4j"
                }
                for r in results
            ]

            logger.info(
                "Neo4j graph search completed",
                agents_found=len(agents),
                sample_agents=[a["agent_name"] for a in agents[:3]] if agents else []
            )

            return agents

        except Exception as e:
            logger.error(
                "Neo4j graph search failed",
                error=str(e),
                error_type=type(e).__name__
            )
            raise

    # ==================== Score Fusion ====================

    def _fuse_scores(
        self,
        postgres: List[Dict],
        pinecone: List[Dict],
        neo4j: List[Dict]
    ) -> List[Dict]:
        """
        Fuse scores from 3 methods using weighted reciprocal rank fusion (RRF).

        Formula:
            fused_score = Σ(weight_i × (1 / (rank_i + k)))

        Where:
            - k = 60 (standard RRF constant)
            - weight_i = method weight (30%, 50%, 20%)
            - rank_i = position in method results (0-indexed)

        This approach:
        - Normalizes scores across different scales
        - Gives more weight to top-ranked results
        - Handles missing results gracefully

        Args:
            postgres: PostgreSQL fulltext results
            pinecone: Pinecone vector results
            neo4j: Neo4j graph results

        Returns:
            List of agents sorted by fused score (descending)
        """
        agent_scores = {}

        # Process PostgreSQL results (30% weight)
        for rank, result in enumerate(postgres):
            agent_id = result["agent_id"]
            if agent_id not in agent_scores:
                agent_scores[agent_id] = {
                    "agent_id": agent_id,
                    "agent_name": result["agent_name"],
                    "scores": {},
                    "ranks": {},
                    "fused_score": 0.0
                }

            rrf_score = 1.0 / (rank + self.RRF_K)
            agent_scores[agent_id]["scores"]["postgres"] = result["postgres_score"]
            agent_scores[agent_id]["ranks"]["postgres"] = rank
            agent_scores[agent_id]["fused_score"] += self.WEIGHTS["postgres_fulltext"] * rrf_score

        # Process Pinecone results (50% weight)
        for rank, result in enumerate(pinecone):
            agent_id = result["agent_id"]
            if agent_id not in agent_scores:
                agent_scores[agent_id] = {
                    "agent_id": agent_id,
                    "agent_name": result["agent_name"],
                    "scores": {},
                    "ranks": {},
                    "fused_score": 0.0
                }

            rrf_score = 1.0 / (rank + self.RRF_K)
            agent_scores[agent_id]["scores"]["pinecone"] = result["pinecone_score"]
            agent_scores[agent_id]["ranks"]["pinecone"] = rank
            agent_scores[agent_id]["fused_score"] += self.WEIGHTS["pinecone_vector"] * rrf_score

        # Process Neo4j results (20% weight)
        for rank, result in enumerate(neo4j):
            agent_id = result["agent_id"]
            if agent_id not in agent_scores:
                agent_scores[agent_id] = {
                    "agent_id": agent_id,
                    "agent_name": result["agent_name"],
                    "scores": {},
                    "ranks": {},
                    "fused_score": 0.0
                }

            rrf_score = 1.0 / (rank + self.RRF_K)
            agent_scores[agent_id]["scores"]["neo4j"] = result["neo4j_score"]
            agent_scores[agent_id]["ranks"]["neo4j"] = rank
            agent_scores[agent_id]["fused_score"] += self.WEIGHTS["neo4j_graph"] * rrf_score

        # Sort by fused score (descending)
        sorted_agents = sorted(
            agent_scores.values(),
            key=lambda x: x["fused_score"],
            reverse=True
        )

        logger.debug(
            "Score fusion completed",
            total_unique_agents=len(sorted_agents),
            top_score=sorted_agents[0]["fused_score"] if sorted_agents else 0.0
        )

        return sorted_agents

    # ==================== Confidence Calculation ====================

    def _calculate_confidence(
        self,
        selected_agents: List[Dict],
        query: str
    ) -> List[Dict]:
        """
        Calculate multi-factor confidence metrics for selected agents.

        Confidence factors:
        1. Overall: Based on fused score (capped at 95%)
        2. Search quality: Agreement between methods
        3. Consensus: How many methods found the agent

        Args:
            selected_agents: List of agents from score fusion
            query: Original query (for future enhancements)

        Returns:
            Agents with confidence metrics added
        """
        for agent in selected_agents:
            scores = agent.get("scores", {})
            num_methods = len(scores)

            # Overall confidence (fused score mapped to percentage)
            overall = min(agent["fused_score"] * 100, 95)  # Cap at 95%

            # Search quality (average of raw scores)
            search_quality = (
                sum(scores.values()) / num_methods
                if num_methods > 0
                else 0.5
            )

            # Consensus (how many methods agreed)
            consensus = num_methods / 3.0  # 3 methods total

            # Combined confidence
            agent["confidence"] = {
                "overall": round(overall, 2),
                "search_quality": round(search_quality * 100, 2),
                "consensus": round(consensus * 100, 2),
                "methods_found": num_methods,
                "breakdown": {
                    "postgres": round(scores.get("postgres", 0) * 100, 2),
                    "pinecone": round(scores.get("pinecone", 0) * 100, 2),
                    "neo4j": round(scores.get("neo4j", 0) * 100, 2)
                }
            }

        return selected_agents

    # ==================== Utilities ====================

    def _handle_search_error(
        self,
        result: any,
        method_name: str,
        default: List
    ) -> List:
        """Handle search method exceptions gracefully."""
        if isinstance(result, Exception):
            logger.error(
                f"{method_name} search failed",
                error=str(result),
                error_type=type(result).__name__
            )
            return default
        return result

    async def _enrich_agent_details(
        self,
        agents: List[Dict],
        tenant_id: str
    ) -> List[Dict]:
        """
        Enrich agent results with full details from database.

        Fetches:
        - Full agent metadata
        - Capabilities
        - Domain expertise
        - Performance stats

        Args:
            agents: List of agents with basic info
            tenant_id: Tenant identifier

        Returns:
            Agents with enriched details
        """
        try:
            supabase = self._get_supabase()

            agent_ids = [agent["agent_id"] for agent in agents]

            # Batch fetch agent details
            # Note: supabase-py client is synchronous, so we run in thread pool
            def _fetch_agents():
                return supabase.client.table("agents").select("*").in_(
                    "id", agent_ids
                ).execute()

            result = await asyncio.to_thread(_fetch_agents)

            # Create lookup map
            agent_details_map = {
                agent["id"]: agent
                for agent in (result.data or [])
            }

            # Enrich agents
            for agent in agents:
                details = agent_details_map.get(agent["agent_id"], {})
                agent.update({
                    "description": details.get("description", ""),
                    "capabilities": details.get("capabilities", []),
                    "domain_expertise": details.get("domain_expertise", []),
                    "tier": details.get("tier", 2),
                    "specialization": details.get("specialization", ""),
                    "performance": {
                        "total_queries": details.get("total_queries", 0),
                        "avg_rating": details.get("avg_rating", 0.0),
                        "success_rate": details.get("success_rate", 0.0)
                    }
                })

            return agents

        except Exception as e:
            logger.error(
                "Failed to enrich agent details",
                error=str(e)
            )
            return agents  # Return un-enriched agents

    # ==================== Analytics ====================

    async def get_selection_analytics(
        self,
        tenant_id: str,
        time_range_hours: int = 24
    ) -> Dict:
        """
        Get analytics about agent selections.

        Returns:
            Statistics about GraphRAG performance
        """
        # TODO: Implement with time-series data from monitoring
        return {
            "total_selections": 0,
            "avg_latency_ms": 0,
            "p95_latency_ms": 0,
            "method_usage": {
                "postgres": 0,
                "pinecone": 0,
                "neo4j": 0
            },
            "accuracy_metrics": {
                "top1": 0.0,
                "top3": 0.0,
                "top5": 0.0
            }
        }


# Singleton instance
_graphrag_selector: Optional[GraphRAGSelector] = None


def get_graphrag_selector(supabase_client=None) -> GraphRAGSelector:
    """Get GraphRAG selector instance (dependency injection).

    Args:
        supabase_client: Optional pre-initialized Supabase client.
                        If provided and singleton doesn't exist, creates one with this client.
                        If singleton already exists, the existing instance is returned
                        (regardless of supabase_client parameter).

    Returns:
        GraphRAGSelector instance
    """
    global _graphrag_selector
    if _graphrag_selector is None:
        _graphrag_selector = GraphRAGSelector(supabase_client=supabase_client)
    return _graphrag_selector


def initialize_graphrag_selector(
    embedding_service: Optional[EmbeddingService] = None,
    supabase_client=None
) -> GraphRAGSelector:
    """Initialize GraphRAG selector singleton.

    Args:
        embedding_service: Optional embedding service instance
        supabase_client: Optional pre-initialized Supabase client (recommended)

    Returns:
        GraphRAGSelector instance
    """
    global _graphrag_selector
    _graphrag_selector = GraphRAGSelector(
        embedding_service=embedding_service,
        supabase_client=supabase_client
    )
    return _graphrag_selector
