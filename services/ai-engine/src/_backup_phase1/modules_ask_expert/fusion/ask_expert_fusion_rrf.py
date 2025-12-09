"""
VITAL Path AI Services - Ask Expert Reciprocal Rank Fusion (RRF)

RRF algorithm for combining multiple ranked lists into a single fused ranking.
Based on the original paper: "Reciprocal Rank Fusion outperforms Condorcet and
individual Rank Learning Methods" (Cormack et al., 2009)

Formula: RRF(d) = Σ 1/(k + rank(d)) for each list containing document d

Naming Convention:
- Class: AskExpertRankedItem
- Functions: ask_expert_{rrf_function}
- Logs: ask_expert_rrf_{action}
"""

from typing import List, Dict, Any, Tuple
from dataclasses import dataclass, field
import structlog

logger = structlog.get_logger()


@dataclass
class AskExpertRankedItem:
    """
    Item with its rank from a retrieval source.
    
    Used across all three Fusion Intelligence retrievers:
    - Vector (pgvector/Pinecone)
    - Graph (Neo4j)
    - Relational (PostgreSQL)
    """
    id: str
    rank: int
    score: float
    source: str  # 'vector', 'graph', 'relational'
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate rank is positive."""
        if self.rank < 1:
            self.rank = 1


def ask_expert_normalize_scores(
    items: List[AskExpertRankedItem],
) -> List[AskExpertRankedItem]:
    """
    Normalize scores to 0-1 range within a ranked list.
    
    Uses min-max normalization:
    normalized = (score - min) / (max - min)
    
    Args:
        items: List of ranked items from a single source
        
    Returns:
        Same items with normalized scores
    """
    if not items:
        return []
    
    scores = [item.score for item in items]
    min_score = min(scores)
    max_score = max(scores)
    
    # Avoid division by zero
    score_range = max_score - min_score
    if score_range == 0:
        return items
    
    normalized = []
    for item in items:
        normalized_score = (item.score - min_score) / score_range
        normalized.append(AskExpertRankedItem(
            id=item.id,
            rank=item.rank,
            score=normalized_score,
            source=item.source,
            metadata=item.metadata,
        ))
    
    return normalized


def ask_expert_reciprocal_rank_fusion(
    ranked_lists: List[List[AskExpertRankedItem]],
    k: int = 60,
) -> List[Tuple[str, float, Dict[str, Any]]]:
    """
    Combine multiple ranked lists using Reciprocal Rank Fusion.
    
    RRF Score = Σ (1 / (k + rank_i)) for each list containing the item
    
    Args:
        ranked_lists: List of ranked results from different retrievers
        k: Smoothing constant (default 60, from original RRF paper)
           - Higher k = more weight to lower-ranked items
           - Lower k = more weight to top-ranked items
    
    Returns:
        List of (item_id, fused_score, combined_metadata) sorted by fused_score desc
    """
    logger.debug(
        "ask_expert_rrf_fusion_started",
        list_count=len(ranked_lists),
        k=k,
    )
    
    if not ranked_lists:
        return []
    
    # Accumulate RRF scores
    rrf_scores: Dict[str, float] = {}
    combined_metadata: Dict[str, Dict[str, Any]] = {}
    source_contributions: Dict[str, Dict[str, float]] = {}
    
    for ranked_list in ranked_lists:
        if not ranked_list:
            continue
            
        for item in ranked_list:
            item_id = item.id
            rrf_contribution = 1.0 / (k + item.rank)
            
            # Accumulate score
            if item_id not in rrf_scores:
                rrf_scores[item_id] = 0.0
                combined_metadata[item_id] = {}
                source_contributions[item_id] = {}
            
            rrf_scores[item_id] += rrf_contribution
            
            # Track source contribution
            source_contributions[item_id][item.source] = rrf_contribution
            
            # Merge metadata (later sources override)
            combined_metadata[item_id].update(item.metadata)
            combined_metadata[item_id][f'{item.source}_score'] = item.score
            combined_metadata[item_id][f'{item.source}_rank'] = item.rank
    
    # Add source contributions to metadata
    for item_id, contributions in source_contributions.items():
        combined_metadata[item_id]['source_contributions'] = contributions
    
    # Sort by RRF score descending
    sorted_results = sorted(
        rrf_scores.items(),
        key=lambda x: x[1],
        reverse=True,
    )
    
    results = [
        (item_id, score, combined_metadata[item_id])
        for item_id, score in sorted_results
    ]
    
    logger.debug(
        "ask_expert_rrf_fusion_completed",
        result_count=len(results),
        top_score=results[0][1] if results else 0,
    )
    
    return results


def ask_expert_weighted_rrf(
    ranked_lists: List[List[AskExpertRankedItem]],
    weights: Dict[str, float],
    k: int = 60,
) -> List[Tuple[str, float, Dict[str, Any]]]:
    """
    Weighted RRF for adjustable source importance.
    
    Weighted RRF Score = Σ (weight_source * 1 / (k + rank_i))
    
    Args:
        ranked_lists: List of ranked results from different retrievers
        weights: Source weights, e.g., {'vector': 0.4, 'graph': 0.35, 'relational': 0.25}
                 Weights don't need to sum to 1 (will be normalized)
        k: Smoothing constant
    
    Returns:
        List of (item_id, fused_score, combined_metadata) sorted by fused_score desc
    """
    logger.debug(
        "ask_expert_weighted_rrf_started",
        list_count=len(ranked_lists),
        weights=weights,
        k=k,
    )
    
    if not ranked_lists:
        return []
    
    # Normalize weights
    total_weight = sum(weights.values())
    if total_weight == 0:
        total_weight = 1.0
    normalized_weights = {
        source: w / total_weight
        for source, w in weights.items()
    }
    
    # Accumulate weighted RRF scores
    rrf_scores: Dict[str, float] = {}
    combined_metadata: Dict[str, Dict[str, Any]] = {}
    source_contributions: Dict[str, Dict[str, float]] = {}
    
    for ranked_list in ranked_lists:
        if not ranked_list:
            continue
            
        for item in ranked_list:
            item_id = item.id
            
            # Get weight for this source
            weight = normalized_weights.get(item.source, 1.0 / len(weights) if weights else 1.0)
            
            # Calculate weighted RRF contribution
            rrf_contribution = weight * (1.0 / (k + item.rank))
            
            # Accumulate score
            if item_id not in rrf_scores:
                rrf_scores[item_id] = 0.0
                combined_metadata[item_id] = {}
                source_contributions[item_id] = {}
            
            rrf_scores[item_id] += rrf_contribution
            
            # Track source contribution
            source_contributions[item_id][item.source] = {
                'contribution': rrf_contribution,
                'weight': weight,
                'rank': item.rank,
                'original_score': item.score,
            }
            
            # Merge metadata
            combined_metadata[item_id].update(item.metadata)
            combined_metadata[item_id][f'{item.source}_score'] = item.score
            combined_metadata[item_id][f'{item.source}_rank'] = item.rank
    
    # Add source contributions to metadata
    for item_id, contributions in source_contributions.items():
        combined_metadata[item_id]['source_contributions'] = contributions
        combined_metadata[item_id]['sources_found'] = list(contributions.keys())
        combined_metadata[item_id]['source_count'] = len(contributions)
    
    # Sort by weighted RRF score descending
    sorted_results = sorted(
        rrf_scores.items(),
        key=lambda x: x[1],
        reverse=True,
    )
    
    results = [
        (item_id, score, combined_metadata[item_id])
        for item_id, score in sorted_results
    ]
    
    logger.debug(
        "ask_expert_weighted_rrf_completed",
        result_count=len(results),
        top_score=results[0][1] if results else 0,
    )
    
    return results


def ask_expert_explain_rrf_score(
    item_id: str,
    metadata: Dict[str, Any],
) -> str:
    """
    Generate human-readable explanation for an RRF score.
    
    Args:
        item_id: The item ID
        metadata: Metadata from RRF fusion
        
    Returns:
        Human-readable explanation
    """
    contributions = metadata.get('source_contributions', {})
    sources_found = metadata.get('sources_found', [])
    
    explanation_parts = [f"Agent '{item_id}' was selected because:"]
    
    for source in sources_found:
        contrib = contributions.get(source, {})
        if isinstance(contrib, dict):
            rank = contrib.get('rank', 'unknown')
            weight = contrib.get('weight', 0)
            original = contrib.get('original_score', 0)
            explanation_parts.append(
                f"  - {source.title()}: Ranked #{rank} (score: {original:.3f}, weight: {weight:.2f})"
            )
        else:
            explanation_parts.append(f"  - {source.title()}: Contributed {contrib:.4f}")
    
    if len(sources_found) > 1:
        explanation_parts.append(f"  → Found in {len(sources_found)} sources (higher confidence)")
    
    return "\n".join(explanation_parts)
