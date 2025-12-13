# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [4]
# DEPENDENCIES: [services.graphrag_selector, services.hybrid_agent_search, services.runner_registry]
"""
Mode 4 Agent Selector - Production GraphRAG Integration

Phase 2 Complete: Real GraphRAG/HybridSearch integration for intelligent
agent selection using 3-method weighted fusion:
- PostgreSQL fulltext (30%)
- Pinecone vector (50%)
- Neo4j graph (20%)

Reference: ARD v2.0 Specification
"""

from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Optional
import structlog

from services.runner_registry import runner_registry

# GraphRAG integration
try:
    from services.graphrag_selector import (
        get_graphrag_selector,
        GraphRAGSelector,
    )
    GRAPHRAG_AVAILABLE = True
except ImportError:
    GRAPHRAG_AVAILABLE = False
    GraphRAGSelector = None  # type: ignore

# Hybrid search fallback
try:
    from services.hybrid_agent_search import HybridAgentSearch
    HYBRID_SEARCH_AVAILABLE = True
except ImportError:
    HYBRID_SEARCH_AVAILABLE = False
    HybridAgentSearch = None  # type: ignore

logger = structlog.get_logger()


# =============================================================================
# GraphRAG-Powered Agent Selection (Primary)
# =============================================================================


async def select_team_graphrag(
    goal: str,
    tenant_id: str,
    metadata: Optional[Dict[str, Any]] = None,
    max_agents: int = 3,
    min_confidence: float = 0.005,
) -> List[Dict[str, Any]]:
    """
    Production agent selection using GraphRAG 3-method fusion.

    This is the primary agent selection method for Mode 3/4 missions.
    Uses weighted RRF (Reciprocal Rank Fusion) across:
    - PostgreSQL fulltext search (30% weight)
    - Pinecone vector similarity (50% weight)
    - Neo4j graph traversal (20% weight)

    Args:
        goal: Mission goal/query for semantic matching
        tenant_id: Tenant UUID for multi-tenant isolation
        metadata: Optional metadata (template_cat, domain hints, etc.)
        max_agents: Maximum agents to select (default 3)
        min_confidence: Minimum fused confidence threshold

    Returns:
        List of selected agents with scores, confidence, and metadata
    """
    if not GRAPHRAG_AVAILABLE:
        logger.warning(
            "graphrag_not_available_falling_back",
            fallback="hybrid_search" if HYBRID_SEARCH_AVAILABLE else "legacy",
        )
        if HYBRID_SEARCH_AVAILABLE:
            return await select_team_hybrid(goal, tenant_id, metadata, max_agents)
        return select_team(goal, metadata)

    try:
        selector = get_graphrag_selector()

        # Determine mode based on metadata
        mode = metadata.get("mode", "mode4") if metadata else "mode4"

        agents = await selector.select_agents(
            query=goal,
            tenant_id=tenant_id,
            mode=mode,
            max_agents=max_agents,
            min_confidence=min_confidence,
        )

        # Transform to standard team format
        team = []
        for agent in agents:
            team.append({
                "id": agent.get("agent_id"),
                "name": agent.get("agent_name", "Unknown"),
                "level": f"L{agent.get('tier', 2)}",
                "tier": agent.get("tier", 2),
                "description": agent.get("description", ""),
                "capabilities": agent.get("capabilities", []),
                "specialization": agent.get("specialization", ""),
                # GraphRAG-specific scoring
                "fused_score": agent.get("fused_score", 0.0),
                "confidence": agent.get("confidence", {}),
                "scores": agent.get("scores", {}),
                "ranks": agent.get("ranks", {}),
                # Performance metrics
                "performance": agent.get("performance", {}),
            })

        logger.info(
            "graphrag_team_selected",
            team_size=len(team),
            top_agent=team[0]["name"] if team else "None",
            top_score=round(team[0]["fused_score"], 4) if team else 0.0,
            goal_preview=goal[:120],
            mode=mode,
        )

        # Fallback if GraphRAG returns empty
        if not team:
            logger.warning("graphrag_empty_result_falling_back")
            return select_team(goal, metadata)

        return team

    except asyncio.CancelledError:
        # CRITICAL C5 FIX: NEVER swallow CancelledError - propagate for graceful shutdown
        logger.warning(
            "graphrag_selection_cancelled",
            goal_preview=goal[:100],
        )
        raise
    except Exception as exc:
        logger.error(
            "graphrag_selection_failed",
            error=str(exc)[:200],
            error_type=type(exc).__name__,
            goal_preview=goal[:100],
        )
        # Graceful fallback to legacy selection
        return select_team(goal, metadata)


# =============================================================================
# Hybrid Search Fallback (Secondary)
# =============================================================================


async def select_team_hybrid(
    goal: str,
    tenant_id: str,
    metadata: Optional[Dict[str, Any]] = None,
    max_agents: int = 3,
) -> List[Dict[str, Any]]:
    """
    Fallback agent selection using HybridAgentSearch.

    Uses PostgreSQL (60%) + Graph relations (40%) for agent discovery.
    Falls back to this when GraphRAG is unavailable or fails.

    Args:
        goal: Mission goal/query
        tenant_id: Tenant UUID (used for domain filtering if available)
        metadata: Optional metadata hints
        max_agents: Maximum agents to return

    Returns:
        List of selected agents with hybrid scores
    """
    if not HYBRID_SEARCH_AVAILABLE:
        logger.warning("hybrid_search_not_available_falling_back_to_legacy")
        return select_team(goal, metadata)

    try:
        search = HybridAgentSearch()
        await search.connect()

        try:
            # Extract domain/capability hints from metadata
            domains = metadata.get("domains") if metadata else None
            capabilities = metadata.get("capabilities") if metadata else None

            results = await search.search(
                query=goal,
                domains=domains,
                capabilities=capabilities,
                min_level=2,  # L2+ for Mode 3/4
                max_level=3,  # L2-L3 experts
                similarity_threshold=0.65,
                max_results=max_agents,
            )

            team = []
            for result in results:
                team.append({
                    "id": result.agent_id,
                    "name": result.agent_name,
                    "level": f"L{result.agent_level}",
                    "tier": result.agent_level,
                    # Hybrid scoring breakdown
                    "fused_score": result.hybrid_score,
                    "vector_score": result.vector_score,
                    "domain_score": result.domain_score,
                    "capability_score": result.capability_score,
                    "graph_score": result.graph_score,
                    # Graph relationships
                    "matched_domains": result.matched_domains,
                    "matched_capabilities": result.matched_capabilities,
                    "escalation_available": result.escalation_available,
                    "collaboration_partners": result.collaboration_partners,
                    # Performance
                    "search_latency_ms": result.search_latency_ms,
                })

            logger.info(
                "hybrid_team_selected",
                team_size=len(team),
                top_agent=team[0]["name"] if team else "None",
                latency_ms=team[0]["search_latency_ms"] if team else 0,
                goal_preview=goal[:120],
            )

            if not team:
                return select_team(goal, metadata)

            return team

        finally:
            await search.close()

    except Exception as exc:
        logger.error(
            "hybrid_selection_failed",
            error=str(exc)[:200],
            goal_preview=goal[:100],
        )
        return select_team(goal, metadata)


# =============================================================================
# Legacy Selection (Fallback)
# =============================================================================


def _pick_top_l2(limit: int = 2) -> List[Dict[str, Any]]:
    """Legacy: Pick top L2 agents by compat score."""
    compat = runner_registry.load_compat()
    runners = runner_registry.load_all()
    if not compat or not runners:
        return []
    compat_sorted = sorted(compat, key=lambda c: c.get("match_score") or 0, reverse=True)
    team = []
    for row in compat_sorted:
        if row.get("agent_lvl") != 2:
            continue
        code = row.get("run_code")
        if code and code in runners:
            team.append(
                {
                    "id": code,
                    "name": runners[code].get("name") or code,
                    "level": "L2",
                    "cat": runners[code].get("cat_code"),
                    "stage": runners[code].get("stage"),
                }
            )
        if len(team) >= limit:
            break
    return team


def select_team(goal: str, metadata: Dict[str, Any] | None = None) -> List[Dict[str, Any]]:
    """
    Legacy synchronous team selection (final fallback).

    Strategy: prefer template category (if provided), else top L2 by compat score.
    This is used when both GraphRAG and HybridSearch are unavailable.
    """
    metadata = metadata or {}
    preferred_cat = metadata.get("template_cat") or metadata.get("template_family")

    runners = runner_registry.load_all()
    team: List[Dict[str, Any]] = []

    # If we have a preferred category, try to pick two L2 from that category
    if preferred_cat and runners:
        for code, row in runners.items():
            if row.get("cat_code") and str(row.get("cat_code")).lower() == str(preferred_cat).lower():
                team.append(
                    {
                        "id": code,
                        "name": row.get("name") or code,
                        "level": "L2",
                        "cat": row.get("cat_code"),
                        "stage": row.get("stage"),
                    }
                )
            if len(team) >= 2:
                break

    # Fallback to top-scoring L2 from compat table
    if len(team) < 2:
        team.extend([m for m in _pick_top_l2(limit=2 - len(team)) if m not in team])

    # Final fallback: if still empty, return a stub entry
    if not team:
        team = [{"id": "l2_generalist", "name": "Generalist Expert", "level": "L2"}]

    logger.info("legacy_team_selected", team=team, goal_preview=goal[:120])
    return team


# =============================================================================
# Unified Selection Interface
# =============================================================================


async def select_team_async(
    goal: str,
    tenant_id: str = "default",
    metadata: Optional[Dict[str, Any]] = None,
    max_agents: int = 3,
    use_graphrag: bool = True,
) -> List[Dict[str, Any]]:
    """
    Unified async team selection interface.

    Tries selection methods in priority order:
    1. GraphRAG (if use_graphrag=True and available)
    2. HybridSearch (if GraphRAG fails/unavailable)
    3. Legacy sync selection (final fallback)

    Args:
        goal: Mission goal/query
        tenant_id: Tenant UUID for isolation
        metadata: Optional metadata hints
        max_agents: Maximum agents to select
        use_graphrag: Whether to attempt GraphRAG first

    Returns:
        List of selected agents
    """
    if use_graphrag and GRAPHRAG_AVAILABLE:
        return await select_team_graphrag(goal, tenant_id, metadata, max_agents)
    elif HYBRID_SEARCH_AVAILABLE:
        return await select_team_hybrid(goal, tenant_id, metadata, max_agents)
    else:
        return select_team(goal, metadata)


# Feature flags for monitoring
__all__ = [
    "select_team",
    "select_team_async",
    "select_team_graphrag",
    "select_team_hybrid",
    "GRAPHRAG_AVAILABLE",
    "HYBRID_SEARCH_AVAILABLE",
]
