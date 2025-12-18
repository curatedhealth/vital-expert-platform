"""
VITAL Path AI Services - VITAL Reciprocal Rank Fusion (RRF)

RRF algorithm for combining multiple ranked lists into a single fused ranking.
Based on the original paper: "Reciprocal Rank Fusion outperforms Condorcet and
individual Rank Learning Methods" (Cormack et al., 2009)

Formula: RRF(d) = Σ 1/(k + rank(d)) for each list containing document d

Naming Convention:
- Class: RankedItem
- Functions: vital_{rrf_function}
- Logs: vital_rrf_{action}
"""

from typing import List, Dict, Any, Tuple
from dataclasses import dataclass, field
import structlog

logger = structlog.get_logger()


@dataclass
class RankedItem:
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


def vital_normalize_scores(
    items: List[RankedItem],
) -> List[RankedItem]:
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
        normalized.append(RankedItem(
            id=item.id,
            rank=item.rank,
            score=normalized_score,
            source=item.source,
            metadata=item.metadata,
        ))
    
    return normalized


def vital_reciprocal_rank_fusion(
    ranked_lists: List[List[RankedItem]],
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
        "vital_rrf_fusion_started",
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
        "vital_rrf_fusion_completed",
        result_count=len(results),
        top_score=results[0][1] if results else 0,
    )
    
    return results


def vital_weighted_rrf(
    ranked_lists: List[List[RankedItem]],
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
        "vital_weighted_rrf_started",
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
        "vital_weighted_rrf_completed",
        result_count=len(results),
        top_score=results[0][1] if results else 0,
    )
    
    return results


def explain_rrf_score(
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


def normalize_to_percentage(
    results: List[Tuple[str, float, Dict[str, Any]]],
    max_theoretical_score: float = None,
) -> List[Tuple[str, int, Dict[str, Any]]]:
    """
    Convert raw RRF scores to human-readable 0-100 percentage scale.
    
    RRF scores are typically small decimals (0.01-0.05). This function
    translates them directly into a 0-100 scale based on the theoretical
    maximum possible RRF score.
    
    Theoretical maximum RRF score for an item ranked #1 in N lists:
        max_score = N * (1 / (k + 1))
        
    For k=60 (default) and 3 retrieval sources:
        max_score = 3 * (1/61) ≈ 0.0492
        
    Algorithm:
        percentage = (raw_score / max_theoretical_score) * 100
    
    Args:
        results: List of (item_id, raw_score, metadata) from RRF
        max_theoretical_score: Maximum possible RRF score. If None, 
                              calculated as 3 * (1/61) ≈ 0.0492 for
                              3 sources with k=60
        
    Returns:
        List of (item_id, percentage_score, metadata) with scores 0-100
        
    Example:
        Raw score 0.0325 with max 0.0492 → 66/100
        Raw score 0.0164 with max 0.0492 → 33/100
    """
    if not results:
        return []
    
    # Calculate theoretical maximum if not provided
    # Default: 3 sources (vector, graph, relational), k=60
    # Max = 3 * (1 / (60 + 1)) = 3/61 ≈ 0.0492
    if max_theoretical_score is None:
        num_sources = 3  # vector, graph, relational
        k = 60  # RRF smoothing constant
        max_theoretical_score = num_sources * (1.0 / (k + 1))
    
    normalized_results = []
    
    for item_id, raw_score, metadata in results:
        # Direct percentage calculation
        percentage = (raw_score / max_theoretical_score) * 100
        
        # Cap at 100 (in case score exceeds theoretical max)
        percentage = min(100, percentage)
        
        # Round to integer
        final_score = round(percentage)
        
        # Add scores to metadata
        metadata['raw_rrf_score'] = raw_score
        metadata['score'] = final_score
        metadata['max_theoretical'] = max_theoretical_score
        
        # Confidence based on absolute score
        if final_score >= 80:
            metadata['confidence'] = 'high'
        elif final_score >= 60:
            metadata['confidence'] = 'medium'
        elif final_score >= 40:
            metadata['confidence'] = 'low'
        else:
            metadata['confidence'] = 'very_low'
        
        normalized_results.append((item_id, final_score, metadata))
    
    logger.debug(
        "vital_rrf_normalized_to_percentage",
        result_count=len(normalized_results),
        max_theoretical=max_theoretical_score,
        top_score=normalized_results[0][1] if normalized_results else 0,
    )
    
    return normalized_results


# Convenience aliases for clean API
normalize_scores = vital_normalize_scores
reciprocal_rank_fusion = vital_reciprocal_rank_fusion
weighted_rrf = vital_weighted_rrf
