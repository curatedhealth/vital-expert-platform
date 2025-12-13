# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [2, 4]
# DEPENDENCIES: [services.graphrag_selector, services.hybrid_agent_search]
"""
VITAL Path AI Services - Unified Agent Selector

Unified agent selection for Mode 2 (Interactive) and Mode 4 (Autonomous).

================================================================================
CRITICAL ARCHITECTURE (December 12, 2025)
================================================================================

AGENT SELECTION MATRIX:
┌─────────────────────────────────────────────────────────────────────────────┐
│ Mode │ Type        │ Agent Selection    │ Uses This Module                  │
├──────┼─────────────┼────────────────────┼───────────────────────────────────┤
│  1   │ Interactive │ MANUAL (user)      │ ❌ NO - user provides agent_id    │
│  2   │ Interactive │ AUTOMATIC (Fusion) │ ✅ YES - FusionSearchSelector     │
│  3   │ Autonomous  │ MANUAL (user)      │ ❌ NO - user provides agent_id    │
│  4   │ Autonomous  │ AUTOMATIC (Fusion) │ ✅ YES - FusionSearchSelector     │
└─────────────────────────────────────────────────────────────────────────────┘

KEY FACTS:
1. Only Mode 2 and Mode 4 use automatic agent selection
2. Fusion Search uses 3-method weighted RRF (PostgreSQL 30%, Pinecone 50%, Neo4j 20%)
3. This module adapts GraphRAGSelector to the AgentSelector protocol

MISSIONS AND RUNNERS:
- Missions/Runners are ONLY used by Mode 3 & Mode 4 (Autonomous modes)
- Mode 1 & Mode 2 (Interactive) do NOT use missions/runners
- This selector is mode-agnostic - it just selects the best agent for a query

================================================================================

Reference: ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import structlog

# Import the protocol from unified_interactive_workflow
from .unified_interactive_workflow import (
    AgentSelector,
    AgentSelectionResult,
    AgentSelectionStrategy,
)

# GraphRAG integration
try:
    from services.graphrag_selector import (
        GraphRAGSelector,
        get_graphrag_selector,
        GraphRAGFusionAdapter,
        get_graphrag_fusion_adapter,
    )
    GRAPHRAG_AVAILABLE = True
except ImportError:
    GRAPHRAG_AVAILABLE = False
    GraphRAGSelector = None  # type: ignore
    GraphRAGFusionAdapter = None  # type: ignore

# Hybrid search fallback
try:
    from services.hybrid_agent_search import HybridAgentSearch
    HYBRID_SEARCH_AVAILABLE = True
except ImportError:
    HYBRID_SEARCH_AVAILABLE = False
    HybridAgentSearch = None  # type: ignore

logger = structlog.get_logger()


# =============================================================================
# FUSION SEARCH SELECTOR (PRIMARY)
# =============================================================================

class FusionSearchSelector:
    """
    Fusion Search agent selector using GraphRAG 3-method hybrid search.

    Implements the AgentSelector protocol for use with:
    - UnifiedInteractiveWorkflow (Mode 2)
    - UnifiedAutonomousWorkflow (Mode 4)

    Fusion Algorithm: Weighted Reciprocal Rank Fusion (RRF)
    - PostgreSQL Full-Text: 30% weight
    - Pinecone Vector: 50% weight
    - Neo4j Graph: 20% weight

    Performance Targets:
    - P95 latency: <450ms
    - Top-3 accuracy: 92-95%
    - Cache hit rate: >85%
    """

    # ARD v2.0 Specification weights
    WEIGHTS = {
        "postgres_fulltext": 0.30,
        "pinecone_vector": 0.50,
        "neo4j_graph": 0.20,
    }

    def __init__(
        self,
        supabase_client=None,
        graphrag_selector: Optional[GraphRAGSelector] = None,
        min_confidence: float = 0.005,
        max_candidates: int = 5,
    ):
        """
        Initialize FusionSearchSelector.

        Args:
            supabase_client: Supabase client for database fallback
            graphrag_selector: Pre-configured GraphRAGSelector (recommended)
            min_confidence: Minimum fused confidence threshold
            max_candidates: Maximum candidates to consider
        """
        self.supabase = supabase_client
        self.min_confidence = min_confidence
        self.max_candidates = max_candidates

        # Use provided selector or create one
        if graphrag_selector:
            self._graphrag = graphrag_selector
        elif GRAPHRAG_AVAILABLE:
            self._graphrag = get_graphrag_selector(supabase_client)
        else:
            self._graphrag = None

        logger.info(
            "fusion_search_selector_initialized",
            graphrag_available=GRAPHRAG_AVAILABLE,
            has_graphrag_selector=self._graphrag is not None,
            min_confidence=min_confidence,
            max_candidates=max_candidates,
        )

    async def select_agent(
        self,
        query: str,
        tenant_id: str,
        **kwargs
    ) -> AgentSelectionResult:
        """
        Select best agent using Fusion Search.

        Implements AgentSelector protocol.

        Args:
            query: User query for semantic matching
            tenant_id: Tenant UUID for multi-tenant isolation
            **kwargs: Additional context (mode, domain hints, etc.)

        Returns:
            AgentSelectionResult with agent_id, confidence, reasoning, and scores
        """
        mode = kwargs.get('mode', 'mode2')

        logger.info(
            "fusion_search_select_agent_started",
            tenant_id=tenant_id,
            query_preview=query[:50],
            mode=mode,
        )

        # Try GraphRAG first (primary method)
        if self._graphrag:
            try:
                agents = await self._graphrag.select_agents(
                    query=query,
                    tenant_id=tenant_id,
                    mode=mode,
                    max_agents=self.max_candidates,
                    min_confidence=self.min_confidence,
                )

                if agents:
                    best = agents[0]

                    # H5: Check if the returned agent is a stub
                    is_stub = best.get('metadata', {}).get('is_stub', False)
                    if is_stub:
                        stub_reason = best.get('metadata', {}).get('stub_reason', 'unknown')
                        logger.warning(
                            "fusion_search_received_stub_agent",
                            stub_reason=stub_reason,
                            query_preview=query[:100],
                            tenant_id=tenant_id,
                            mode=mode,
                            impact="returning_stub_to_caller",
                            phase="H5_stub_agent_logging"
                        )

                    # Build scores dict from GraphRAG response
                    scores = best.get('scores', {})
                    if not scores:
                        scores = {
                            'fused': best.get('fused_score', 0.0),
                            'postgres': best.get('confidence', {}).get('breakdown', {}).get('postgres', 0.0),
                            'pinecone': best.get('confidence', {}).get('breakdown', {}).get('pinecone', 0.0),
                            'neo4j': best.get('confidence', {}).get('breakdown', {}).get('neo4j', 0.0),
                        }

                    # H5: Add stub metadata to scores if present
                    if is_stub:
                        scores['is_stub'] = True
                        scores['stub_reason'] = best.get('metadata', {}).get('stub_reason')

                    result = AgentSelectionResult(
                        agent_id=best.get('agent_id', ''),
                        confidence=best.get('fused_score', 0.0),
                        reasoning=self._build_reasoning(best),
                        method='graphrag_fusion' if not is_stub else 'graphrag_stub_fallback',
                        scores=scores,
                    )

                    logger.info(
                        "fusion_search_agent_selected",
                        agent_id=result.agent_id,
                        confidence=result.confidence,
                        method=result.method,
                        mode=mode,
                        is_stub=is_stub,
                    )

                    return result
                else:
                    # H5: Log when GraphRAG returns empty list (shouldn't happen with stub factory)
                    logger.warning(
                        "fusion_search_graphrag_empty_response",
                        query_preview=query[:100],
                        tenant_id=tenant_id,
                        mode=mode,
                        recommendation="Check stub agent factory in GraphRAGSelector",
                        phase="H5_stub_agent_logging"
                    )

            except Exception as e:
                logger.error(
                    "fusion_search_graphrag_failed",
                    error=str(e)[:200],
                    error_type=type(e).__name__,
                    query_preview=query[:100],
                    tenant_id=tenant_id,
                    mode=mode,
                    phase="H5_stub_agent_logging"
                )

        # Fallback: Hybrid search
        if HYBRID_SEARCH_AVAILABLE:
            try:
                return await self._select_via_hybrid_search(query, tenant_id, **kwargs)
            except Exception as e:
                logger.error("fusion_search_hybrid_failed", error=str(e)[:200])

        # Ultimate fallback: Database RPC
        if self.supabase:
            try:
                return await self._select_via_database_rpc(query, tenant_id, **kwargs)
            except Exception as e:
                logger.error("fusion_search_database_failed", error=str(e)[:200])

        # Return default agent (H5: Enhanced stub fallback logging)
        logger.warning(
            "fusion_search_all_methods_failed",
            query_preview=query[:100],
            tenant_id=tenant_id,
            mode=mode,
            graphrag_available=self._graphrag is not None,
            hybrid_available=HYBRID_SEARCH_AVAILABLE,
            supabase_available=self.supabase is not None,
            impact="using_default_stub_agent",
            phase="H5_stub_agent_logging"
        )

        return AgentSelectionResult(
            agent_id='default-agent',
            confidence=0.0,
            reasoning='All selection methods failed, using default agent',
            method='fallback_stub',
            scores={
                'stub_reason': 'all_methods_failed',
                'graphrag_attempted': self._graphrag is not None,
                'hybrid_attempted': HYBRID_SEARCH_AVAILABLE,
                'database_attempted': self.supabase is not None,
            },
        )

    async def select_team(
        self,
        query: str,
        tenant_id: str,
        max_agents: int = 3,
        **kwargs
    ) -> List[AgentSelectionResult]:
        """
        Select multiple agents for Mode 4 autonomous missions.

        Mode 4 missions may require a team of agents for complex tasks.

        Args:
            query: Mission goal/query
            tenant_id: Tenant UUID
            max_agents: Maximum team size
            **kwargs: Additional context

        Returns:
            List of AgentSelectionResult for team members
        """
        mode = kwargs.get('mode', 'mode4')

        if not self._graphrag:
            single = await self.select_agent(query, tenant_id, **kwargs)
            return [single]

        try:
            agents = await self._graphrag.select_agents(
                query=query,
                tenant_id=tenant_id,
                mode=mode,
                max_agents=max_agents,
                min_confidence=self.min_confidence,
            )

            team = []
            for agent in agents:
                scores = agent.get('scores', {})
                team.append(AgentSelectionResult(
                    agent_id=agent.get('agent_id', ''),
                    confidence=agent.get('fused_score', 0.0),
                    reasoning=self._build_reasoning(agent),
                    method='graphrag_fusion_team',
                    scores=scores,
                ))

            logger.info(
                "fusion_search_team_selected",
                team_size=len(team),
                mode=mode,
            )

            return team

        except Exception as e:
            logger.error("fusion_search_team_selection_failed", error=str(e)[:200])
            single = await self.select_agent(query, tenant_id, **kwargs)
            return [single]

    def _build_reasoning(self, agent: Dict[str, Any]) -> str:
        """Build human-readable reasoning for selection."""
        agent_name = agent.get('agent_name', 'Unknown')
        fused_score = agent.get('fused_score', 0.0)
        confidence = agent.get('confidence', {})
        methods_found = confidence.get('methods_found', 0)

        reasoning_parts = [
            f"Selected '{agent_name}' with {fused_score:.2%} confidence."
        ]

        if methods_found:
            reasoning_parts.append(f"Found in {methods_found}/3 search methods.")

        breakdown = confidence.get('breakdown', {})
        if breakdown:
            scores_str = ", ".join([
                f"{k}: {v:.1f}%" for k, v in breakdown.items() if v > 0
            ])
            if scores_str:
                reasoning_parts.append(f"Scores: {scores_str}")

        return " ".join(reasoning_parts)

    async def _select_via_hybrid_search(
        self,
        query: str,
        tenant_id: str,
        **kwargs
    ) -> AgentSelectionResult:
        """Fallback selection via HybridAgentSearch."""
        search = HybridAgentSearch()
        await search.connect()

        try:
            results = await search.search(
                query=query,
                min_level=2,
                max_level=3,
                similarity_threshold=0.65,
                max_results=1,
            )

            if results:
                best = results[0]
                return AgentSelectionResult(
                    agent_id=best.agent_id,
                    confidence=best.hybrid_score,
                    reasoning=f"Selected via hybrid search (vector: {best.vector_score:.2f}, graph: {best.graph_score:.2f})",
                    method='hybrid_search',
                    scores={
                        'hybrid': best.hybrid_score,
                        'vector': best.vector_score,
                        'graph': best.graph_score,
                    },
                )

        finally:
            await search.close()

        raise ValueError("Hybrid search returned no results")

    async def _select_via_database_rpc(
        self,
        query: str,
        tenant_id: str,
        **kwargs
    ) -> AgentSelectionResult:
        """Fallback selection via database RPC function."""
        result = self.supabase.rpc('select_agent_for_query', {
            'query_text': query,
            'tenant_uuid': tenant_id,
        }).execute()

        if result.data and len(result.data) > 0:
            agent = result.data[0]
            return AgentSelectionResult(
                agent_id=agent['id'],
                confidence=agent.get('score', 0.5),
                reasoning=f"Selected via database RPC (score: {agent.get('score', 0.5):.2f})",
                method='database_rpc',
                scores={'rpc_score': agent.get('score', 0.5)},
            )

        raise ValueError("Database RPC returned no results")


# =============================================================================
# FACTORY FUNCTIONS
# =============================================================================

def create_fusion_search_selector(
    supabase_client=None,
    min_confidence: float = 0.005,
    max_candidates: int = 5,
) -> FusionSearchSelector:
    """
    Create FusionSearchSelector for Mode 2 and Mode 4.

    Usage for Mode 2 (Interactive):
        selector = create_fusion_search_selector(supabase_client)
        workflow = create_mode2_workflow(supabase_client, selector)

    Usage for Mode 4 (Autonomous):
        selector = create_fusion_search_selector(supabase_client)
        workflow = create_mode4_workflow(supabase_client, selector)

    Args:
        supabase_client: Supabase client for database operations
        min_confidence: Minimum confidence threshold
        max_candidates: Maximum candidates to consider

    Returns:
        FusionSearchSelector instance
    """
    return FusionSearchSelector(
        supabase_client=supabase_client,
        min_confidence=min_confidence,
        max_candidates=max_candidates,
    )


def get_default_selector(supabase_client=None) -> FusionSearchSelector:
    """
    Get a default selector with production settings.

    This is a convenience function for common use cases.

    Args:
        supabase_client: Optional Supabase client

    Returns:
        FusionSearchSelector with production defaults
    """
    return create_fusion_search_selector(
        supabase_client=supabase_client,
        min_confidence=0.005,
        max_candidates=5,
    )


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    # Primary class
    'FusionSearchSelector',
    # Factory functions
    'create_fusion_search_selector',
    'get_default_selector',
    # Re-exports for convenience
    'AgentSelector',
    'AgentSelectionResult',
    'AgentSelectionStrategy',
    # Feature flags
    'GRAPHRAG_AVAILABLE',
    'HYBRID_SEARCH_AVAILABLE',
]
