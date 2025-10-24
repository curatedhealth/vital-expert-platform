"""
Personalized Agent Recommendation Engine

Generates personalized agent recommendations using:
- Collaborative filtering (user-user similarity)
- Content-based filtering (agent similarity)
- Hybrid approach combining both methods
- Real-time learning from user behavior

Created: 2025-10-25
Phase: 4 Week 1 - Session Persistence
"""

import asyncio
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict
from datetime import datetime, timedelta

import asyncpg
from asyncpg.pool import Pool

from services.session_manager import SessionManager, RecommendationType


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class AgentRecommendation:
    """Recommendation result"""
    agent_id: str
    agent_name: str
    agent_display_name: Optional[str]
    recommendation_type: RecommendationType
    relevance_score: float  # 0.0-1.0
    confidence_score: float  # 0.0-1.0
    reason: str
    factors: Dict[str, float]


# ============================================================================
# RECOMMENDATION ENGINE
# ============================================================================

class RecommendationEngine:
    """
    Generates personalized agent recommendations

    Methods:
    - Collaborative filtering: Recommend agents used by similar users
    - Content-based filtering: Recommend similar agents to favorites
    - Hybrid: Combine both approaches
    - Trending: Popular agents trending in the platform
    - New: Recently added agents matching user preferences
    """

    def __init__(
        self,
        db_pool: Pool,
        session_manager: SessionManager,
        min_interactions: int = 3,
        similarity_threshold: float = 0.5
    ):
        """
        Initialize recommendation engine

        Args:
            db_pool: Database connection pool
            session_manager: Session manager instance
            min_interactions: Minimum interactions for collaborative filtering
            similarity_threshold: Minimum similarity for recommendations
        """
        self.db_pool = db_pool
        self.session_manager = session_manager
        self.min_interactions = min_interactions
        self.similarity_threshold = similarity_threshold

    # ========================================================================
    # MAIN RECOMMENDATION METHODS
    # ========================================================================

    async def generate_recommendations(
        self,
        user_id: str,
        max_recommendations: int = 10,
        include_types: Optional[List[RecommendationType]] = None
    ) -> List[AgentRecommendation]:
        """
        Generate personalized recommendations for user

        Args:
            user_id: User ID
            max_recommendations: Maximum number of recommendations
            include_types: Types of recommendations to include

        Returns:
            List of recommendations sorted by relevance
        """
        # Get user preferences
        preferences = await self.session_manager.get_preferences(user_id)

        # Get user's search and interaction history
        search_history = await self.session_manager.get_user_search_history(user_id, limit=100)
        top_agents = await self.session_manager.get_user_top_agents(user_id, limit=20)

        # Generate different types of recommendations
        all_recommendations = []

        # 1. Content-based recommendations (similar to favorites)
        if not include_types or RecommendationType.SIMILAR_TO_FAVORITES in include_types:
            content_recs = await self._generate_content_based_recommendations(
                user_id, preferences, top_agents
            )
            all_recommendations.extend(content_recs)

        # 2. Collaborative filtering recommendations
        if not include_types or RecommendationType.COLLABORATIVE in include_types:
            collab_recs = await self._generate_collaborative_recommendations(
                user_id, top_agents
            )
            all_recommendations.extend(collab_recs)

        # 3. Trending agents
        if not include_types or RecommendationType.TRENDING in include_types:
            trending_recs = await self._generate_trending_recommendations(
                user_id, preferences
            )
            all_recommendations.extend(trending_recs)

        # 4. New agents matching preferences
        if not include_types or RecommendationType.NEW in include_types:
            new_recs = await self._generate_new_agent_recommendations(
                user_id, preferences
            )
            all_recommendations.extend(new_recs)

        # 5. Frequently used (boost)
        if not include_types or RecommendationType.FREQUENT in include_types:
            frequent_recs = await self._generate_frequent_recommendations(
                top_agents
            )
            all_recommendations.extend(frequent_recs)

        # Remove duplicates (keep highest scoring)
        unique_recommendations = self._deduplicate_recommendations(all_recommendations)

        # Sort by relevance and confidence
        sorted_recommendations = sorted(
            unique_recommendations,
            key=lambda r: (r.relevance_score * 0.7 + r.confidence_score * 0.3),
            reverse=True
        )

        # Limit to max_recommendations
        final_recommendations = sorted_recommendations[:max_recommendations]

        # Save recommendations to database
        await self._save_recommendations(user_id, final_recommendations)

        return final_recommendations

    # ========================================================================
    # CONTENT-BASED FILTERING
    # ========================================================================

    async def _generate_content_based_recommendations(
        self,
        user_id: str,
        preferences: Optional[Any],
        top_agents: List[Dict[str, Any]],
        max_recommendations: int = 5
    ) -> List[AgentRecommendation]:
        """
        Generate recommendations based on agent similarity

        Recommends agents similar to user's favorite/frequently used agents
        """
        if not top_agents:
            return []

        recommendations = []

        # Get favorite agent IDs
        favorite_agent_ids = [agent['agent_id'] for agent in top_agents[:5]]

        async with self.db_pool.acquire() as conn:
            # For each favorite, find similar agents
            for agent_id in favorite_agent_ids:
                similar_agents = await conn.fetch("""
                    WITH agent_embeddings AS (
                        SELECT embedding
                        FROM agent_embeddings
                        WHERE agent_id = $1 AND embedding_type = 'profile'
                        LIMIT 1
                    )
                    SELECT
                        a.id,
                        a.name,
                        a.display_name,
                        COALESCE((a.metadata->>'tier')::INTEGER, 2) AS tier,
                        a.metadata->'domains' AS domains,
                        1 - (ae.embedding <=> (SELECT embedding FROM agent_embeddings)) AS similarity
                    FROM agents a
                    JOIN agent_embeddings ae ON a.id = ae.agent_id
                    WHERE a.status = 'active'
                        AND a.id != $1
                        AND ae.embedding_type = 'profile'
                    ORDER BY ae.embedding <=> (SELECT embedding FROM agent_embeddings)
                    LIMIT $2
                """, agent_id, 3)

                for similar_agent in similar_agents:
                    similarity = similar_agent['similarity']

                    if similarity >= self.similarity_threshold:
                        # Calculate relevance based on similarity and user preferences
                        relevance = similarity

                        # Boost if domains match preferences
                        if preferences and preferences.preferred_domains:
                            agent_domains = similar_agent['domains'] or []
                            domain_match = len(set(agent_domains) & set(preferences.preferred_domains))
                            if domain_match > 0:
                                relevance = min(1.0, relevance * 1.2)

                        recommendation = AgentRecommendation(
                            agent_id=str(similar_agent['id']),
                            agent_name=similar_agent['name'],
                            agent_display_name=similar_agent['display_name'],
                            recommendation_type=RecommendationType.SIMILAR_TO_FAVORITES,
                            relevance_score=float(relevance),
                            confidence_score=float(similarity),
                            reason=f"Similar to agents you frequently use",
                            factors={
                                "similarity": float(similarity),
                                "domain_match": float(domain_match) if preferences and preferences.preferred_domains else 0.0
                            }
                        )

                        recommendations.append(recommendation)

        return recommendations[:max_recommendations]

    # ========================================================================
    # COLLABORATIVE FILTERING
    # ========================================================================

    async def _generate_collaborative_recommendations(
        self,
        user_id: str,
        top_agents: List[Dict[str, Any]],
        max_recommendations: int = 5
    ) -> List[AgentRecommendation]:
        """
        Generate recommendations based on similar users

        Find users with similar agent usage patterns and recommend their agents
        """
        if not top_agents or len(top_agents) < self.min_interactions:
            return []

        user_agent_ids = [agent['agent_id'] for agent in top_agents]

        async with self.db_pool.acquire() as conn:
            # Find similar users based on agent overlap
            similar_users = await conn.fetch("""
                WITH user_agents AS (
                    SELECT $1::text AS user_id, $2::uuid[] AS agent_ids
                ),
                other_users AS (
                    SELECT
                        i.user_id,
                        array_agg(DISTINCT i.agent_id) AS agent_ids
                    FROM agent_interactions i
                    WHERE i.user_id != $1
                        AND i.interaction_type IN ('select', 'chat')
                    GROUP BY i.user_id
                    HAVING COUNT(DISTINCT i.agent_id) >= $3
                )
                SELECT
                    ou.user_id,
                    ou.agent_ids,
                    (
                        SELECT COUNT(*)
                        FROM unnest(ua.agent_ids) AS ua_agent
                        WHERE ua_agent = ANY(ou.agent_ids)
                    ) AS overlap_count,
                    array_length(ou.agent_ids, 1) AS total_agents
                FROM other_users ou, user_agents ua
                WHERE (
                    SELECT COUNT(*)
                    FROM unnest(ua.agent_ids) AS ua_agent
                    WHERE ua_agent = ANY(ou.agent_ids)
                ) >= $3
                ORDER BY overlap_count DESC
                LIMIT 10
            """, user_id, user_agent_ids, self.min_interactions)

            recommendations = []

            for similar_user in similar_users:
                # Calculate user similarity (Jaccard similarity)
                overlap = similar_user['overlap_count']
                union_size = len(user_agent_ids) + similar_user['total_agents'] - overlap
                user_similarity = overlap / union_size if union_size > 0 else 0

                # Get agents used by similar user but not by current user
                other_user_agents = set(similar_user['agent_ids']) - set(user_agent_ids)

                for agent_id in list(other_user_agents)[:3]:  # Top 3 per similar user
                    # Get agent details
                    agent = await conn.fetchrow("""
                        SELECT
                            id,
                            name,
                            display_name,
                            COALESCE((metadata->>'tier')::INTEGER, 2) AS tier
                        FROM agents
                        WHERE id = $1 AND status = 'active'
                    """, agent_id)

                    if agent:
                        # Get interaction stats for this agent
                        agent_stats = await conn.fetchrow("""
                            SELECT
                                COUNT(*) AS interaction_count,
                                AVG(rating) AS avg_rating
                            FROM agent_interactions
                            WHERE agent_id = $1
                                AND user_id = $2
                                AND interaction_type IN ('select', 'chat')
                        """, agent_id, similar_user['user_id'])

                        interaction_count = agent_stats['interaction_count']
                        avg_rating = agent_stats['avg_rating'] or 0

                        # Calculate relevance
                        relevance = user_similarity * 0.5 + (interaction_count / 10) * 0.3 + (avg_rating / 5) * 0.2
                        relevance = min(1.0, relevance)

                        recommendation = AgentRecommendation(
                            agent_id=str(agent['id']),
                            agent_name=agent['name'],
                            agent_display_name=agent['display_name'],
                            recommendation_type=RecommendationType.COLLABORATIVE,
                            relevance_score=float(relevance),
                            confidence_score=float(user_similarity),
                            reason=f"Used by similar users ({overlap} shared preferences)",
                            factors={
                                "user_similarity": float(user_similarity),
                                "usage_frequency": float(interaction_count / 10),
                                "avg_rating": float(avg_rating / 5)
                            }
                        )

                        recommendations.append(recommendation)

            return sorted(recommendations, key=lambda r: r.relevance_score, reverse=True)[:max_recommendations]

    # ========================================================================
    # TRENDING RECOMMENDATIONS
    # ========================================================================

    async def _generate_trending_recommendations(
        self,
        user_id: str,
        preferences: Optional[Any],
        max_recommendations: int = 3,
        lookback_days: int = 7
    ) -> List[AgentRecommendation]:
        """
        Generate recommendations for trending agents

        Agents with increasing usage in the past week
        """
        async with self.db_pool.acquire() as conn:
            trending_agents = await conn.fetch("""
                WITH recent_interactions AS (
                    SELECT
                        agent_id,
                        COUNT(DISTINCT user_id) AS user_count,
                        COUNT(*) AS interaction_count,
                        AVG(rating) FILTER (WHERE rating IS NOT NULL) AS avg_rating
                    FROM agent_interactions
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                        AND interaction_type IN ('select', 'chat')
                    GROUP BY agent_id
                    HAVING COUNT(DISTINCT user_id) >= 5
                ),
                previous_interactions AS (
                    SELECT
                        agent_id,
                        COUNT(DISTINCT user_id) AS user_count
                    FROM agent_interactions
                    WHERE created_at >= NOW() - INTERVAL '14 days'
                        AND created_at < NOW() - INTERVAL '7 days'
                        AND interaction_type IN ('select', 'chat')
                    GROUP BY agent_id
                )
                SELECT
                    a.id,
                    a.name,
                    a.display_name,
                    COALESCE((a.metadata->>'tier')::INTEGER, 2) AS tier,
                    a.metadata->'domains' AS domains,
                    ri.user_count,
                    ri.interaction_count,
                    ri.avg_rating,
                    COALESCE(pi.user_count, 0) AS prev_user_count,
                    CASE
                        WHEN COALESCE(pi.user_count, 0) > 0
                        THEN (ri.user_count::FLOAT - pi.user_count) / pi.user_count
                        ELSE 1.0
                    END AS growth_rate
                FROM agents a
                JOIN recent_interactions ri ON a.id = ri.agent_id
                LEFT JOIN previous_interactions pi ON a.id = pi.agent_id
                WHERE a.status = 'active'
                    AND a.id NOT IN (
                        SELECT agent_id
                        FROM agent_interactions
                        WHERE user_id = $1
                            AND interaction_type IN ('select', 'chat')
                        LIMIT 20
                    )
                ORDER BY growth_rate DESC, ri.user_count DESC
                LIMIT $2
            """, user_id, max_recommendations)

            recommendations = []

            for agent in trending_agents:
                growth_rate = agent['growth_rate']
                user_count = agent['user_count']
                avg_rating = agent['avg_rating'] or 0

                # Calculate relevance
                trending_score = min(1.0, growth_rate / 2)  # Normalize growth rate
                popularity_score = min(1.0, user_count / 50)  # Normalize user count
                quality_score = avg_rating / 5 if avg_rating else 0.5

                relevance = trending_score * 0.4 + popularity_score * 0.3 + quality_score * 0.3

                # Boost if domains match preferences
                if preferences and preferences.preferred_domains:
                    agent_domains = agent['domains'] or []
                    if any(domain in preferences.preferred_domains for domain in agent_domains):
                        relevance = min(1.0, relevance * 1.3)

                recommendation = AgentRecommendation(
                    agent_id=str(agent['id']),
                    agent_name=agent['name'],
                    agent_display_name=agent['display_name'],
                    recommendation_type=RecommendationType.TRENDING,
                    relevance_score=float(relevance),
                    confidence_score=float(popularity_score),
                    reason=f"Trending ({int(growth_rate * 100)}% growth, {user_count} users)",
                    factors={
                        "growth_rate": float(growth_rate),
                        "popularity": float(popularity_score),
                        "quality": float(quality_score)
                    }
                )

                recommendations.append(recommendation)

            return recommendations

    # ========================================================================
    # NEW AGENT RECOMMENDATIONS
    # ========================================================================

    async def _generate_new_agent_recommendations(
        self,
        user_id: str,
        preferences: Optional[Any],
        max_recommendations: int = 2,
        new_agent_days: int = 30
    ) -> List[AgentRecommendation]:
        """
        Generate recommendations for new agents matching user preferences
        """
        if not preferences or not preferences.preferred_domains:
            return []

        async with self.db_pool.acquire() as conn:
            new_agents = await conn.fetch("""
                SELECT
                    a.id,
                    a.name,
                    a.display_name,
                    COALESCE((a.metadata->>'tier')::INTEGER, 2) AS tier,
                    a.metadata->'domains' AS domains,
                    a.created_at
                FROM agents a
                WHERE a.status = 'active'
                    AND a.created_at >= NOW() - INTERVAL '30 days'
                    AND a.metadata->'domains' ?| $1  -- Any domain matches
                    AND a.id NOT IN (
                        SELECT agent_id
                        FROM agent_interactions
                        WHERE user_id = $2
                        LIMIT 20
                    )
                ORDER BY a.created_at DESC
                LIMIT $3
            """, preferences.preferred_domains, user_id, max_recommendations)

            recommendations = []

            for agent in new_agents:
                agent_domains = agent['domains'] or []
                domain_matches = len(set(agent_domains) & set(preferences.preferred_domains))
                domain_score = domain_matches / len(preferences.preferred_domains)

                # Freshness score (newer = higher)
                days_old = (datetime.utcnow() - agent['created_at'].replace(tzinfo=None)).days
                freshness_score = 1.0 - (days_old / new_agent_days)

                relevance = domain_score * 0.6 + freshness_score * 0.4

                recommendation = AgentRecommendation(
                    agent_id=str(agent['id']),
                    agent_name=agent['name'],
                    agent_display_name=agent['display_name'],
                    recommendation_type=RecommendationType.NEW,
                    relevance_score=float(relevance),
                    confidence_score=float(domain_score),
                    reason=f"New agent matching your interests ({days_old} days old)",
                    factors={
                        "domain_match": float(domain_score),
                        "freshness": float(freshness_score)
                    }
                )

                recommendations.append(recommendation)

            return recommendations

    # ========================================================================
    # FREQUENT AGENT BOOST
    # ========================================================================

    async def _generate_frequent_recommendations(
        self,
        top_agents: List[Dict[str, Any]],
        max_recommendations: int = 3
    ) -> List[AgentRecommendation]:
        """
        Boost frequently used agents as recommendations
        """
        if not top_agents:
            return []

        recommendations = []

        for i, agent in enumerate(top_agents[:max_recommendations]):
            interaction_count = agent['interaction_count']
            avg_rating = agent.get('avg_rating') or 0

            # Calculate relevance based on usage frequency and rating
            frequency_score = min(1.0, interaction_count / 20)
            rating_score = avg_rating / 5 if avg_rating else 0.5

            relevance = frequency_score * 0.6 + rating_score * 0.4

            recommendation = AgentRecommendation(
                agent_id=str(agent['agent_id']),
                agent_name=agent['agent_name'],
                agent_display_name=agent.get('agent_display_name'),
                recommendation_type=RecommendationType.FREQUENT,
                relevance_score=float(relevance),
                confidence_score=float(frequency_score),
                reason=f"You've used this agent {interaction_count} times",
                factors={
                    "usage_frequency": float(frequency_score),
                    "avg_rating": float(rating_score)
                }
            )

            recommendations.append(recommendation)

        return recommendations

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _deduplicate_recommendations(
        self,
        recommendations: List[AgentRecommendation]
    ) -> List[AgentRecommendation]:
        """
        Remove duplicate agent recommendations, keeping highest scoring
        """
        best_recommendations = {}

        for rec in recommendations:
            if rec.agent_id not in best_recommendations:
                best_recommendations[rec.agent_id] = rec
            else:
                existing = best_recommendations[rec.agent_id]
                # Keep higher scoring recommendation
                if rec.relevance_score > existing.relevance_score:
                    best_recommendations[rec.agent_id] = rec

        return list(best_recommendations.values())

    async def _save_recommendations(
        self,
        user_id: str,
        recommendations: List[AgentRecommendation]
    ) -> None:
        """
        Save recommendations to database
        """
        for rec in recommendations:
            await self.session_manager.create_recommendation(
                user_id=user_id,
                agent_id=rec.agent_id,
                recommendation_type=rec.recommendation_type,
                relevance_score=rec.relevance_score,
                confidence_score=rec.confidence_score,
                reason=rec.reason,
                factors=rec.factors,
                ttl_hours=24
            )


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_recommendation_engine_instance: Optional[RecommendationEngine] = None


def get_recommendation_engine(
    db_pool: Pool,
    session_manager: SessionManager
) -> RecommendationEngine:
    """
    Get singleton recommendation engine instance

    Args:
        db_pool: Database pool
        session_manager: Session manager

    Returns:
        RecommendationEngine instance
    """
    global _recommendation_engine_instance

    if _recommendation_engine_instance is None:
        _recommendation_engine_instance = RecommendationEngine(
            db_pool=db_pool,
            session_manager=session_manager
        )

    return _recommendation_engine_instance
