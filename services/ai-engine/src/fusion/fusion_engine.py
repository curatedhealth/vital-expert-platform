"""
VITAL Path AI Services - VITAL Fusion Engine

Main Fusion Intelligence engine that combines:
- Vector retrieval (pgvector/Pinecone)
- Graph retrieval (Neo4j)
- Relational retrieval (PostgreSQL)

Using Reciprocal Rank Fusion (RRF) for evidence-backed agent selection.

Naming Convention:
- Class: FusionEngine
- Methods: retrieve, explain_selection
- Logs: vital_fusion_engine_{action}

Phase 2: Agent Hierarchy & Fusion Intelligence
"""

from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime
import asyncio
import time
import structlog

from .fusion_rrf import (
    RankedItem,
    vital_weighted_rrf,
    explain_rrf_score,
)
from .retrievers import (
    VectorRetriever,
    GraphRetriever,
    RelationalRetriever,
)

logger = structlog.get_logger()


@dataclass
class FusionResult:
    """Complete result from Fusion Intelligence retrieval."""
    fused_rankings: List[Tuple[str, float, Dict[str, Any]]] = field(default_factory=list)
    vector_results: List[RankedItem] = field(default_factory=list)
    graph_results: List[RankedItem] = field(default_factory=list)
    relational_results: List[RankedItem] = field(default_factory=list)
    vector_scores: Dict[str, float] = field(default_factory=dict)
    graph_paths: List[Dict[str, Any]] = field(default_factory=list)
    relational_patterns: Dict[str, Any] = field(default_factory=dict)
    retrieval_time_ms: float = 0.0
    sources_used: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class FusionEngine:
    """
    VITAL Fusion Intelligence Engine.
    
    Combines Vector + Graph + Relational retrieval using RRF
    for evidence-backed agent selection.
    
    Features:
    - Parallel retrieval from all sources
    - Graceful degradation (works with 1-3 sources)
    - Configurable weights per source
    - Detailed evidence for L1 Master reasoning
    """
    
    # Default weights for RRF fusion
    DEFAULT_WEIGHTS = {
        'vector': 0.40,     # Semantic similarity
        'graph': 0.35,      # Relationship paths
        'relational': 0.25, # Historical patterns
    }
    
    def __init__(
        self,
        vector_retriever: Optional[VectorRetriever] = None,
        graph_retriever: Optional[GraphRetriever] = None,
        relational_retriever: Optional[RelationalRetriever] = None,
        weights: Optional[Dict[str, float]] = None,
        timeout_seconds: float = 5.0,
    ):
        """
        Initialize Fusion Engine.
        
        Args:
            vector_retriever: Vector retrieval component
            graph_retriever: Graph retrieval component
            relational_retriever: Relational retrieval component
            weights: Custom weights for RRF fusion
            timeout_seconds: Timeout for parallel retrieval
        """
        self.vector = vector_retriever
        self.graph = graph_retriever
        self.relational = relational_retriever
        self.weights = weights or self.DEFAULT_WEIGHTS
        self.timeout = timeout_seconds
        
        # Track which retrievers are available
        self.available_retrievers = []
        if self.vector:
            self.available_retrievers.append('vector')
        if self.graph:
            self.available_retrievers.append('graph')
        if self.relational:
            self.available_retrievers.append('relational')
        
        logger.info(
            "vital_fusion_engine_initialized",
            available_retrievers=self.available_retrievers,
            weights=self.weights,
            timeout_seconds=timeout_seconds,
        )
    
    async def retrieve(
        self,
        query: str,
        tenant_id: str,
        top_k: int = 10,
    ) -> FusionResult:
        """
        Perform triple retrieval and fuse with RRF.
        
        Args:
            query: User's query
            tenant_id: Tenant UUID for isolation
            top_k: Number of final results
            
        Returns:
            FusionResult with fused rankings and evidence
        """
        logger.info(
            "vital_fusion_engine_retrieve_started",
            tenant_id=tenant_id,
            top_k=top_k,
            query_preview=query[:100],
        )
        
        start_time = time.time()
        result = FusionResult()
        
        try:
            # Create retrieval tasks
            tasks = []
            task_names = []
            
            if self.vector:
                tasks.append(self._safe_retrieve(
                    self.vector.retrieve, query, tenant_id, top_k * 2
                ))
                task_names.append('vector')
            
            if self.graph:
                tasks.append(self._safe_retrieve(
                    self.graph.retrieve, query, tenant_id, top_k * 2
                ))
                task_names.append('graph')
            
            if self.relational:
                tasks.append(self._safe_retrieve(
                    self.relational.retrieve, query, tenant_id, top_k * 2
                ))
                task_names.append('relational')
            
            if not tasks:
                logger.warning("vital_fusion_engine_no_retrievers")
                result.errors.append("No retrievers available")
                return result
            
            # Execute retrievals in parallel with timeout
            try:
                results = await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True),
                    timeout=self.timeout,
                )
            except asyncio.TimeoutError:
                logger.warning(
                    "vital_fusion_engine_timeout",
                    timeout=self.timeout,
                )
                results = [[] for _ in tasks]
                result.errors.append(f"Retrieval timeout ({self.timeout}s)")
            
            # Process results
            ranked_lists = []
            
            for name, res in zip(task_names, results):
                if isinstance(res, Exception):
                    logger.error(
                        f"vital_fusion_engine_{name}_failed",
                        error=str(res),
                    )
                    result.errors.append(f"{name}: {str(res)}")
                    continue
                
                if res:
                    ranked_lists.append(res)
                    result.sources_used.append(name)
                    
                    # Store individual results
                    if name == 'vector':
                        result.vector_results = res
                        result.vector_scores = {r.id: r.score for r in res}
                    elif name == 'graph':
                        result.graph_results = res
                        result.graph_paths = [r.metadata for r in res]
                    elif name == 'relational':
                        result.relational_results = res
                        result.relational_patterns = {
                            r.id: r.metadata for r in res
                        }
            
            # Apply weighted RRF fusion
            if ranked_lists:
                result.fused_rankings = vital_weighted_rrf(
                    ranked_lists,
                    weights=self.weights,
                    k=60,
                )[:top_k]
            
            result.retrieval_time_ms = (time.time() - start_time) * 1000
            
            logger.info(
                "vital_fusion_engine_retrieve_completed",
                tenant_id=tenant_id,
                result_count=len(result.fused_rankings),
                sources_used=result.sources_used,
                retrieval_time_ms=result.retrieval_time_ms,
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "vital_fusion_engine_retrieve_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            result.errors.append(f"Fusion failed: {str(e)}")
            result.retrieval_time_ms = (time.time() - start_time) * 1000
            return result
    
    async def _safe_retrieve(
        self,
        retriever_func,
        query: str,
        tenant_id: str,
        top_k: int,
    ) -> List[RankedItem]:
        """
        Safely execute a retriever with error handling.
        """
        try:
            return await retriever_func(query, tenant_id, top_k)
        except Exception as e:
            logger.error(
                "vital_fusion_engine_retriever_error",
                error=str(e),
            )
            return []
    
    def explain_selection(
        self,
        agent_id: str,
        fusion_result: FusionResult,
    ) -> Dict[str, Any]:
        """
        Generate human-readable explanation for agent selection.
        
        Args:
            agent_id: The selected agent ID
            fusion_result: Full fusion result
            
        Returns:
            Explanation with evidence from each source
        """
        # Find the agent in fused rankings
        agent_data = None
        agent_score = 0.0
        
        for aid, score, metadata in fusion_result.fused_rankings:
            if aid == agent_id:
                agent_data = metadata
                agent_score = score
                break
        
        if not agent_data:
            return {
                'agent_id': agent_id,
                'explanation': 'Agent not found in fusion results',
                'evidence': {},
            }
        
        # Generate explanation
        explanation = explain_rrf_score(agent_id, agent_data)
        
        # Build evidence summary
        evidence = {
            'fused_score': agent_score,
            'sources_found': agent_data.get('sources_found', []),
            'source_count': agent_data.get('source_count', 0),
        }
        
        # Add source-specific evidence
        if 'vector_score' in agent_data:
            evidence['vector'] = {
                'score': agent_data['vector_score'],
                'rank': agent_data.get('vector_rank'),
            }
        
        if 'graph_score' in agent_data:
            evidence['graph'] = {
                'score': agent_data['graph_score'],
                'rank': agent_data.get('graph_rank'),
                'path_distance': agent_data.get('path_distance'),
            }
        
        if 'relational_score' in agent_data:
            evidence['relational'] = {
                'score': agent_data['relational_score'],
                'rank': agent_data.get('relational_rank'),
                'success_rate': agent_data.get('success_rate'),
                'usage_count': agent_data.get('usage_count'),
            }
        
        return {
            'agent_id': agent_id,
            'explanation': explanation,
            'evidence': evidence,
            'confidence': self._calculate_selection_confidence(agent_data),
        }
    
    def _calculate_selection_confidence(
        self,
        metadata: Dict[str, Any],
    ) -> str:
        """
        Calculate confidence level for a selection.
        
        Returns: 'high', 'medium', or 'low'
        """
        source_count = metadata.get('source_count', 0)
        
        if source_count >= 3:
            return 'high'
        elif source_count == 2:
            return 'medium'
        else:
            return 'low'
    
    async def retrieve_with_synergy(
        self,
        query: str,
        tenant_id: str,
        selected_agents: Optional[List[str]] = None,
        synergy_boost_factor: float = 0.15,
        top_k: int = 10,
        supabase_client=None,
    ) -> FusionResult:
        """
        Perform triple retrieval with synergy boost for team building.
        
        NEW (Phase 2.5): When building teams in Mode 3/4, agents with high
        synergy scores to already-selected agents receive a score boost.
        This encourages selecting complementary teams.
        
        Args:
            query: User's query
            tenant_id: Tenant UUID for isolation
            selected_agents: Already selected agent IDs (for team building)
            synergy_boost_factor: How much to boost synergistic agents (0.0-1.0)
            top_k: Number of final results
            supabase_client: Supabase client for synergy lookups
            
        Returns:
            FusionResult with synergy-boosted rankings
        """
        # Get base rankings
        result = await self.retrieve(query, tenant_id, top_k * 2)
        
        if not selected_agents or not supabase_client or not result.fused_rankings:
            return result
        
        logger.info(
            "vital_fusion_engine_synergy_boost_started",
            selected_agents_count=len(selected_agents),
            synergy_boost_factor=synergy_boost_factor,
        )
        
        try:
            # Apply synergy boost to fused rankings
            boosted_rankings = []
            
            for agent_id, score, metadata in result.fused_rankings:
                synergy_bonus = 0.0
                synergy_details = {}
                
                # Calculate synergy with each selected agent
                for selected_id in selected_agents:
                    if agent_id == selected_id:
                        continue  # Skip self
                    
                    try:
                        # Query synergy score from database
                        synergy_result = supabase_client.rpc(
                            'get_agent_synergy',
                            {'a_id': agent_id, 'b_id': selected_id}
                        ).execute()
                        
                        synergy_score = synergy_result.data if synergy_result.data else 0.0
                        
                        # Add weighted bonus
                        agent_bonus = synergy_score * synergy_boost_factor
                        synergy_bonus += agent_bonus
                        synergy_details[selected_id] = {
                            'synergy_score': synergy_score,
                            'bonus_applied': agent_bonus,
                        }
                        
                    except Exception as e:
                        logger.warning(
                            "vital_fusion_engine_synergy_lookup_failed",
                            agent_id=agent_id,
                            selected_id=selected_id,
                            error=str(e),
                        )
                
                # Apply bonus to score
                boosted_score = score + synergy_bonus
                
                # Add synergy metadata
                boosted_metadata = metadata.copy()
                boosted_metadata['synergy_bonus'] = synergy_bonus
                boosted_metadata['synergy_details'] = synergy_details
                boosted_metadata['original_score'] = score
                
                boosted_rankings.append((agent_id, boosted_score, boosted_metadata))
            
            # Re-sort by boosted scores
            boosted_rankings.sort(key=lambda x: x[1], reverse=True)
            result.fused_rankings = boosted_rankings[:top_k]
            
            logger.info(
                "vital_fusion_engine_synergy_boost_completed",
                boosted_count=len([r for r in boosted_rankings if r[2].get('synergy_bonus', 0) > 0]),
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "vital_fusion_engine_synergy_boost_failed",
                error=str(e),
            )
            # Return unboosted results on error
            return result
    
    def get_team_synergy_summary(
        self,
        team_agents: List[str],
        fusion_result: FusionResult,
    ) -> Dict[str, Any]:
        """
        Generate a summary of team synergy for selected agents.
        
        Args:
            team_agents: List of selected agent IDs
            fusion_result: Result from retrieve_with_synergy
            
        Returns:
            Summary with overall team synergy score and details
        """
        if not team_agents:
            return {'team_synergy_score': 0.0, 'agents': []}
        
        agent_summaries = []
        total_synergy_bonus = 0.0
        
        for agent_id in team_agents:
            for aid, score, metadata in fusion_result.fused_rankings:
                if aid == agent_id:
                    synergy_bonus = metadata.get('synergy_bonus', 0.0)
                    total_synergy_bonus += synergy_bonus
                    
                    agent_summaries.append({
                        'agent_id': agent_id,
                        'base_score': metadata.get('original_score', score),
                        'synergy_bonus': synergy_bonus,
                        'final_score': score,
                        'synergy_partners': list(metadata.get('synergy_details', {}).keys()),
                    })
                    break
        
        # Calculate average synergy
        avg_synergy = total_synergy_bonus / len(team_agents) if team_agents else 0.0
        
        return {
            'team_synergy_score': avg_synergy,
            'total_synergy_bonus': total_synergy_bonus,
            'team_size': len(team_agents),
            'agents': agent_summaries,
            'recommendation': 'high_synergy' if avg_synergy > 0.1 else 'normal' if avg_synergy > 0.05 else 'low_synergy',
        }


# Factory function for easy instantiation
def create_fusion_engine(
    supabase_client=None,
    neo4j_driver=None,
    embedding_service=None,
    weights: Optional[Dict[str, float]] = None,
) -> FusionEngine:
    """
    Factory function to create a FusionEngine with all retrievers.
    
    Args:
        supabase_client: Supabase client for vector + relational
        neo4j_driver: Neo4j driver for graph
        embedding_service: Service for generating embeddings
        weights: Custom RRF weights
        
    Returns:
        Configured FusionEngine
    """
    vector_retriever = None
    graph_retriever = None
    relational_retriever = None
    
    if supabase_client:
        vector_retriever = VectorRetriever(
            supabase_client=supabase_client,
            embedding_service=embedding_service,
        )
        relational_retriever = RelationalRetriever(
            supabase_client=supabase_client,
        )
    
    if neo4j_driver:
        graph_retriever = GraphRetriever(
            neo4j_driver=neo4j_driver,
        )
    
    return FusionEngine(
        vector_retriever=vector_retriever,
        graph_retriever=graph_retriever,
        relational_retriever=relational_retriever,
        weights=weights,
    )
