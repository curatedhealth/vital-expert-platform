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

# Module-level metrics counter for stub agent fallbacks
STUB_AGENT_FALLBACK_COUNT = 0


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

        try:
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_query(query)
        except Exception as e:
            # H5: Log embedding failure
            logger.error(
                "graphrag_embedding_failed",
                error=str(e)[:200],
                error_type=type(e).__name__,
                query_preview=query[:100],
                tenant_id=tenant_id,
                mode=mode,
                phase="H5_stub_agent_logging"
            )

            # H5: Log stub agent fallback with full context
            logger.warning(
                "graphrag_returning_stub_agent",
                reason="embedding_generation_failed",
                methods_tried=["embedding_service"],
                fallback_type="stub_agent",
                stub_agent_id="stub-fallback-agent",
                stub_agent_name="Default Medical Affairs Assistant",
                tenant_id=tenant_id,
                query_preview=query[:50],
                mode=mode,
                error_type=type(e).__name__,
                phase="H5_stub_fallback_logging"
            )

            # Increment stub fallback counter
            self._increment_stub_fallback(tenant_id, "embedding_generation_failed", query[:50])

            # Return stub agent on critical failure
            stub_agent = self._create_stub_agent(
                reason="embedding_generation_failed",
                query_preview=query[:100],
                tenant_id=tenant_id,
                mode=mode
            )
            return [stub_agent]

        # Parallel execution of all 3 methods
        # Note: Neo4j uses text-based search (not embedding) since agents don't have embeddings in graph
        results = await asyncio.gather(
            self._postgres_fulltext_search(query, tenant_id),
            self._pinecone_vector_search(query_embedding, tenant_id),
            self._neo4j_graph_search(query, tenant_id),  # Pass query text, not embedding
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

        # H5: Check if all search methods failed
        all_methods_failed = (
            len(postgres_results) == 0 and
            len(pinecone_results) == 0 and
            len(neo4j_results) == 0
        )

        if all_methods_failed:
            # Determine which methods actually failed vs. returned empty
            methods_tried = []
            failed_methods = []
            if isinstance(results[0], Exception):
                failed_methods.append("PostgreSQL")
            methods_tried.append("PostgreSQL")

            if isinstance(results[1], Exception):
                failed_methods.append("Pinecone")
            methods_tried.append("Pinecone")

            if isinstance(results[2], Exception):
                failed_methods.append("Neo4j")
            methods_tried.append("Neo4j")

            logger.error(
                "graphrag_all_search_methods_failed",
                query_preview=query[:100],
                tenant_id=tenant_id,
                mode=mode,
                methods_tried=methods_tried,
                failed_methods=failed_methods,
                postgres_error=isinstance(results[0], Exception),
                pinecone_error=isinstance(results[1], Exception),
                neo4j_error=isinstance(results[2], Exception),
                impact="will_return_stub_agent_after_fusion",
                phase="H5_stub_agent_logging"
            )

            # H5: Log stub agent fallback with full details
            logger.warning(
                "graphrag_returning_stub_agent",
                reason="all_search_methods_failed",
                methods_tried=methods_tried,
                failed_methods=failed_methods,
                fallback_type="stub_agent",
                stub_agent_id="stub-fallback-agent",
                stub_agent_name="Default Medical Affairs Assistant",
                tenant_id=tenant_id,
                query_preview=query[:50],
                mode=mode,
                postgres_error_type=type(results[0]).__name__ if isinstance(results[0], Exception) else None,
                pinecone_error_type=type(results[1]).__name__ if isinstance(results[1], Exception) else None,
                neo4j_error_type=type(results[2]).__name__ if isinstance(results[2], Exception) else None,
                phase="H5_stub_fallback_logging"
            )

            # Increment stub fallback counter
            self._increment_stub_fallback(tenant_id, "all_search_methods_failed", query[:50])

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

        # Phase 2 H5: Stub agent fallback when no agents found after fusion
        if not selected:
            # Determine the reason for no results
            stub_reason = "empty_search_results" if not fused_agents else "no_agents_above_threshold"

            # Determine which methods contributed
            methods_tried = ["PostgreSQL", "Pinecone", "Neo4j"]
            contributing_methods = []
            if len(postgres_results) > 0:
                contributing_methods.append("PostgreSQL")
            if len(pinecone_results) > 0:
                contributing_methods.append("Pinecone")
            if len(neo4j_results) > 0:
                contributing_methods.append("Neo4j")

            # Log detailed diagnostic information
            logger.warning(
                "graphrag_no_agents_after_fusion",
                query_preview=query[:100],
                tenant_id=tenant_id,
                mode=mode,
                postgres_count=len(postgres_results),
                pinecone_count=len(pinecone_results),
                neo4j_count=len(neo4j_results),
                contributing_methods=contributing_methods,
                min_confidence=min_confidence,
                total_fused=len(fused_agents),
                agents_filtered_out=len(fused_agents) - len(filtered_agents),
                top_fused_score=round(fused_agents[0]["fused_score"], 4) if fused_agents else 0.0,
                recommendation="Consider lowering min_confidence or using fallback agent pool",
                phase="H5_stub_agent_logging"
            )

            # H5: Log stub agent fallback with comprehensive context
            logger.warning(
                "graphrag_returning_stub_agent",
                reason=stub_reason,
                methods_tried=methods_tried,
                contributing_methods=contributing_methods,
                fallback_type="stub_agent",
                stub_agent_id="stub-fallback-agent",
                stub_agent_name="Default Medical Affairs Assistant",
                tenant_id=tenant_id,
                query_preview=query[:50],
                mode=mode,
                postgres_count=len(postgres_results),
                pinecone_count=len(pinecone_results),
                neo4j_count=len(neo4j_results),
                total_fused=len(fused_agents),
                filtered_out=len(fused_agents) - len(filtered_agents),
                min_confidence_threshold=min_confidence,
                top_fused_score=round(fused_agents[0]["fused_score"], 4) if fused_agents else 0.0,
                phase="H5_stub_fallback_logging"
            )

            # Increment stub fallback counter
            self._increment_stub_fallback(tenant_id, stub_reason, query[:50])

            # Create and return stub agent with reason metadata
            stub_agent = self._create_stub_agent(
                reason=stub_reason,
                query_preview=query[:100],
                tenant_id=tenant_id,
                mode=mode
            )
            selected = [stub_agent]

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
        query: str,
        tenant_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """
        Neo4j graph traversal search (20% weight).

        Uses text-based keyword matching and graph relationships to find:
        - Directly matching agents by name/description
        - Related agents via graph relationships
        - Complementary agents in same department/function

        Note: Uses text-based search since agent nodes don't have embeddings stored.

        Returns:
            List of agents with graph scores
        """
        try:
            neo4j = self._get_neo4j()

            # Use text-based search instead of embedding-based
            results = await neo4j.text_based_graph_search(
                query=query,
                tenant_id=tenant_id,
                max_depth=2,
                limit=limit
            )

            agents = [
                {
                    "agent_id": r["agent_id"],
                    "agent_name": r["name"],
                    "neo4j_score": float(r["graph_score"]),
                    "source": "neo4j",
                    "is_seed": r.get("is_seed", False),
                    "distance": r.get("distance", 0)
                }
                for r in results
            ]

            logger.info(
                "Neo4j graph search completed",
                agents_found=len(agents),
                sample_agents=[a["agent_name"] for a in agents[:3]] if agents else [],
                search_type="text_based"
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
            # H5: Skip confidence calculation for stub agents (already have confidence set)
            if agent.get("metadata", {}).get("is_stub", False):
                logger.debug(
                    "skipping_confidence_calculation_for_stub",
                    agent_id=agent.get("agent_id"),
                    stub_reason=agent.get("metadata", {}).get("stub_reason")
                )
                continue

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

    def _create_stub_agent(
        self,
        reason: str,
        query_preview: str,
        tenant_id: str,
        mode: str
    ) -> Dict:
        """
        Create a stub agent with metadata tracking why it was used (H5 Enhanced).

        This stub agent is returned when no suitable agents are found,
        allowing the system to degrade gracefully with full observability.

        The stub agent serves as a last-resort fallback and logs detailed
        diagnostic information to help identify and resolve search issues.

        Args:
            reason: Why the stub agent was created:
                - "embedding_generation_failed" - Could not generate query embedding
                - "all_search_methods_failed" - All 3 search methods returned errors
                - "empty_search_results" - All search methods returned no results
                - "no_agents_above_threshold" - Agents found but below min_confidence
            query_preview: Preview of the query (first 100 chars)
            tenant_id: Tenant identifier
            mode: Ask Expert mode (mode1, mode2, mode3, mode4)

        Returns:
            Dict representing a stub agent with fallback metadata
        """
        stub_agent = {
            "agent_id": "stub-fallback-agent",
            "agent_name": "Default Medical Affairs Assistant",
            "description": "Fallback agent used when no suitable specialized agents are found",
            "fused_score": 0.0,
            "confidence": {
                "overall": 0.0,
                "search_quality": 0.0,
                "consensus": 0.0,
                "methods_found": 0,
                "breakdown": {
                    "postgres": 0.0,
                    "pinecone": 0.0,
                    "neo4j": 0.0
                }
            },
            "scores": {},
            "ranks": {},
            "tier": 1,
            "level": "L2",
            "capabilities": ["General medical affairs assistance"],
            "domain_expertise": ["Medical Affairs"],
            "metadata": {
                "is_stub": True,
                "stub_reason": reason,
                "query_preview": query_preview,
                "tenant_id": tenant_id,
                "mode": mode,
                "recommendation": "Review agent database and search configuration",
                "fallback_count": STUB_AGENT_FALLBACK_COUNT + 1  # Include anticipated count
            },
            "performance": {
                "total_queries": 0,
                "avg_rating": 0.0,
                "success_rate": 0.0
            }
        }

        logger.warning(
            "stub_agent_created",
            reason=reason,
            query_preview=query_preview,
            tenant_id=tenant_id,
            mode=mode,
            agent_id=stub_agent["agent_id"],
            agent_name=stub_agent["agent_name"],
            impact="using_fallback_agent_with_no_specialization",
            recommendation="Investigate search configuration, agent database, or lower confidence threshold",
            anticipated_fallback_count=STUB_AGENT_FALLBACK_COUNT + 1,
            phase="H5_stub_agent_factory"
        )

        return stub_agent

    def _increment_stub_fallback(self, tenant_id: str, reason: str, query_preview: str):
        """
        Increment stub agent fallback counter and log metrics.

        This helps track how often the system falls back to stub agents,
        which is a key reliability metric.

        Args:
            tenant_id: Tenant identifier
            reason: Why stub agent was returned
            query_preview: Preview of the query that triggered fallback
        """
        global STUB_AGENT_FALLBACK_COUNT
        STUB_AGENT_FALLBACK_COUNT += 1

        logger.info(
            "graphrag_stub_fallback_count",
            count=STUB_AGENT_FALLBACK_COUNT,
            tenant_id=tenant_id,
            reason=reason,
            query_preview=query_preview,
            metric_type="counter",
            phase="H5_stub_metrics"
        )

    def _handle_search_error(
        self,
        result: any,
        method_name: str,
        default: List
    ) -> List:
        """
        Handle search method exceptions gracefully (Phase 2 H5 Enhanced).

        Now includes explicit logging when a method returns empty or fails,
        which helps diagnose stub agent fallback scenarios. This is critical
        for monitoring search reliability and identifying when stub agents
        are being used due to search failures.

        Args:
            result: Result from search method (or Exception if failed)
            method_name: Name of the search method (PostgreSQL, Pinecone, Neo4j)
            default: Default value to return on error

        Returns:
            List of search results or empty list on failure
        """
        if isinstance(result, Exception):
            # H5: Explicit error logging with structured fields for monitoring
            logger.error(
                "graphrag_search_method_failed",
                method=method_name,
                error=str(result)[:200],
                error_type=type(result).__name__,
                fallback_action="returning_empty_list",
                impact="may_trigger_stub_agent_fallback_if_all_methods_fail",
                recommendation=f"Investigate {method_name} connectivity and configuration",
                phase="H5_enhanced_stub_logging"
            )
            return default

        # H5: Log when method returns empty results (helps diagnose selection issues)
        if isinstance(result, list) and len(result) == 0:
            logger.info(
                "graphrag_search_method_empty",
                method=method_name,
                result_count=0,
                note="Method returned no results, will not contribute to fusion",
                impact="reduced_search_coverage"
            )

        return result

    async def _enrich_agent_details(
        self,
        agents: List[Dict],
        tenant_id: str
    ) -> List[Dict]:
        """
        Enrich agent results with full details from database.

        IMPORTANT: Filters out agents that don't exist in the database.
        This handles stale Pinecone IDs that no longer exist in PostgreSQL.

        Fetches:
        - Full agent metadata
        - Capabilities
        - Domain expertise
        - Performance stats

        Args:
            agents: List of agents with basic info
            tenant_id: Tenant identifier

        Returns:
            Agents with enriched details (only those that exist in database)
        """
        if not agents:
            return []

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

            # Log any stale IDs (exist in Pinecone but not in PostgreSQL)
            found_ids = set(agent_details_map.keys())
            requested_ids = set(agent_ids)
            stale_ids = requested_ids - found_ids

            if stale_ids:
                logger.warning(
                    "Stale agent IDs filtered out (exist in Pinecone but not in PostgreSQL)",
                    stale_count=len(stale_ids),
                    stale_ids=list(stale_ids),
                    note="Consider re-indexing Pinecone to remove stale vectors"
                )

            # Enrich agents - ONLY include those that exist in database
            enriched_agents = []
            for agent in agents:
                agent_id = agent["agent_id"]
                details = agent_details_map.get(agent_id)

                # Skip agents that don't exist in the database
                if not details:
                    logger.debug(
                        "Skipping stale agent",
                        agent_id=agent_id,
                        agent_name=agent.get("agent_name", "Unknown")
                    )
                    continue

                # Map agent_level_id to level string (L1-L5)
                level_id = details.get("agent_level_id")
                level_map = {
                    "5e27905e-6f58-462e-93a4-6fad5388ebaf": "L1",  # Master
                    "a6e394b0-6ca1-4cb1-8097-719523ee6782": "L2",  # Expert
                    "5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb": "L3",  # Specialist
                    "c6f7eec5-3fc5-4f10-b030-bce0d22480e8": "L4",  # Worker
                    "45420d67-67bf-44cf-a842-44bbaf3145e7": "L5",  # Tool
                }
                agent_level = level_map.get(level_id, "L2")  # Default to L2 (Expert)

                agent.update({
                    "description": details.get("description", ""),
                    "capabilities": details.get("capabilities", []),
                    "domain_expertise": details.get("domain_expertise", []),
                    "tier": details.get("tier", 2),
                    "level": agent_level,  # Add proper level
                    "agent_level_id": level_id,  # Include for reference
                    "specialization": details.get("specialization", ""),
                    "performance": {
                        "total_queries": details.get("total_queries", 0),
                        "avg_rating": details.get("avg_rating", 0.0),
                        "success_rate": details.get("success_rate", 0.0)
                    }
                })
                enriched_agents.append(agent)

            logger.info(
                "Agent enrichment completed",
                requested=len(agents),
                found=len(enriched_agents),
                filtered_stale=len(stale_ids)
            )

            return enriched_agents

        except Exception as e:
            logger.error(
                "Failed to enrich agent details",
                error=str(e)
            )
            return agents  # Return un-enriched agents on error

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


# ==================== Fusion Engine Adapter ====================
# Adapter that wraps GraphRAGSelector to provide FusionEngine-compatible interface


from dataclasses import dataclass, field
from typing import Tuple


@dataclass
class FusionResult:
    """Compatible with fusion.fusion_engine.FusionResult for L1 orchestrator."""
    fused_rankings: List[Tuple[str, float, Dict]] = field(default_factory=list)
    vector_results: List[Dict] = field(default_factory=list)
    graph_results: List[Dict] = field(default_factory=list)
    relational_results: List[Dict] = field(default_factory=list)
    vector_scores: Dict[str, float] = field(default_factory=dict)
    graph_paths: List[Dict] = field(default_factory=list)
    relational_patterns: Dict = field(default_factory=dict)
    retrieval_time_ms: float = 0.0
    sources_used: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class GraphRAGFusionAdapter:
    """
    Adapter that wraps GraphRAGSelector to provide FusionEngine-compatible interface.

    This allows the L1MasterOrchestrator to use GraphRAGSelector through
    the standard fusion_engine.retrieve() interface.

    Key mapping:
    - GraphRAGSelector.select_agents() -> FusionEngine.retrieve()
    - Returns FusionResult with fused_rankings as List[Tuple[id, score, metadata]]
    """

    def __init__(self, graphrag_selector: GraphRAGSelector):
        """
        Initialize adapter with GraphRAGSelector instance.

        Args:
            graphrag_selector: GraphRAGSelector instance to wrap
        """
        self.selector = graphrag_selector
        logger.info("GraphRAGFusionAdapter initialized")

    async def retrieve(
        self,
        query: str,
        tenant_id: str,
        top_k: int = 10,
        context: Optional[Dict] = None
    ) -> FusionResult:
        """
        Retrieve agents using GraphRAG and return in FusionEngine-compatible format.

        Args:
            query: User query
            tenant_id: Tenant identifier
            top_k: Number of results to return
            context: Optional additional context (ignored, for compatibility)

        Returns:
            FusionResult with fused_rankings as List[Tuple[agent_id, score, metadata]]
        """
        import time
        start_time = time.time()

        try:
            # Call GraphRAGSelector.select_agents()
            # Mode "mode2" for single expert selection
            agents = await self.selector.select_agents(
                query=query,
                tenant_id=tenant_id,
                mode="mode2",
                max_agents=top_k,
                min_confidence=0.001  # Lower threshold to get more candidates
            )

            retrieval_time_ms = (time.time() - start_time) * 1000

            # Convert to FusionResult format
            # fused_rankings: List[Tuple[agent_id, score, metadata]]
            fused_rankings = []
            sources_used = set()

            for agent in agents:
                agent_id = agent.get("agent_id", "")
                score = agent.get("fused_score", 0.0)

                # Build metadata dict
                metadata = {
                    "name": agent.get("agent_name", "Unknown"),
                    "level": agent.get("level", "L2"),  # Default to L2 Expert
                    "role": agent.get("role", "Expert"),
                    "description": agent.get("description", ""),
                    "capabilities": agent.get("capabilities", []),
                    "tier": agent.get("tier", 2),
                    "specialization": agent.get("specialization", ""),
                    "confidence": agent.get("confidence", {}),
                    "scores": agent.get("scores", {}),
                    "ranks": agent.get("ranks", {}),
                }

                fused_rankings.append((agent_id, score, metadata))

                # Track which sources contributed
                if agent.get("scores"):
                    sources_used.update(agent["scores"].keys())

            logger.info(
                "GraphRAGFusionAdapter.retrieve completed",
                num_results=len(fused_rankings),
                retrieval_time_ms=round(retrieval_time_ms, 2),
                sources_used=list(sources_used),
                top_agent=fused_rankings[0][2]["name"] if fused_rankings else "None"
            )

            return FusionResult(
                fused_rankings=fused_rankings,
                sources_used=list(sources_used),
                retrieval_time_ms=retrieval_time_ms,
            )

        except Exception as e:
            logger.error(
                "GraphRAGFusionAdapter.retrieve failed",
                error=str(e),
                error_type=type(e).__name__
            )
            return FusionResult(
                errors=[str(e)],
                retrieval_time_ms=(time.time() - start_time) * 1000
            )

    def search_agents(
        self,
        query: str,
        tenant_id: str,
        top_k: int = 5,
        filters: Optional[Dict] = None
    ) -> Dict:
        """
        Synchronous search_agents method for ask_expert_interactive routes.

        This is a convenience wrapper that runs the async select_agents
        in a new event loop for synchronous callers.

        Args:
            query: User query
            tenant_id: Tenant identifier
            top_k: Number of results to return
            filters: Optional filters (level, department, etc.)

        Returns:
            Dict with 'agents' list containing matched agents
        """
        import asyncio

        try:
            # Run async method in event loop
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If already in async context, create new loop
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        asyncio.run,
                        self.selector.select_agents(
                            query=query,
                            tenant_id=tenant_id or "00000000-0000-0000-0000-000000000001",
                            mode="mode2",
                            max_agents=top_k,
                            min_confidence=0.001
                        )
                    )
                    agents = future.result(timeout=30)
            else:
                agents = loop.run_until_complete(
                    self.selector.select_agents(
                        query=query,
                        tenant_id=tenant_id or "00000000-0000-0000-0000-000000000001",
                        mode="mode2",
                        max_agents=top_k,
                        min_confidence=0.001
                    )
                )

            # Format response
            formatted_agents = []
            for agent in agents:
                formatted_agents.append({
                    "id": agent.get("agent_id", ""),
                    "name": agent.get("agent_name", "Unknown"),
                    "score": agent.get("fused_score", 0.0),
                    "level": agent.get("level", "L2"),
                    "description": agent.get("description", ""),
                    "capabilities": agent.get("capabilities", []),
                    "confidence": agent.get("confidence", {}),
                })

            logger.info(
                "GraphRAGFusionAdapter.search_agents completed",
                num_agents=len(formatted_agents),
                query_preview=query[:50],
                tenant_id=tenant_id
            )

            return {"agents": formatted_agents}

        except Exception as e:
            logger.error(
                "GraphRAGFusionAdapter.search_agents failed",
                error=str(e),
                error_type=type(e).__name__
            )
            return {"agents": [], "error": str(e)}


def get_graphrag_fusion_adapter(supabase_client=None) -> GraphRAGFusionAdapter:
    """
    Get GraphRAGFusionAdapter instance for use with L1MasterOrchestrator.

    This is the recommended way to get a fusion engine for Mode 2 and Mode 4.

    Args:
        supabase_client: Optional pre-initialized Supabase client

    Returns:
        GraphRAGFusionAdapter wrapping the GraphRAGSelector singleton
    """
    selector = get_graphrag_selector(supabase_client)
    return GraphRAGFusionAdapter(selector)
