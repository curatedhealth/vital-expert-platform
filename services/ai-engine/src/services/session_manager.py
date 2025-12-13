# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [asyncpg]
"""
Session Management Service

Manages server-side user sessions with:
- Session creation and validation
- Search history tracking
- Agent interaction recording
- User preference management
- Personalized recommendations

Created: 2025-10-25
Phase: 4 Week 1 - Session Persistence
"""

import asyncio
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

import asyncpg
from asyncpg.pool import Pool


# ============================================================================
# DATA MODELS
# ============================================================================

class InteractionType(Enum):
    """Types of agent interactions"""
    VIEW = "view"
    SELECT = "select"
    CHAT = "chat"
    RATE = "rate"
    FEEDBACK = "feedback"
    ESCALATE = "escalate"


class RecommendationType(Enum):
    """Types of recommendations"""
    FREQUENT = "frequent"
    SIMILAR_TO_FAVORITES = "similar_to_favorites"
    TRENDING = "trending"
    NEW = "new"
    COLLABORATIVE = "collaborative"
    CONTENT_BASED = "content_based"


@dataclass
class UserSession:
    """User session data model"""
    id: str
    user_id: str
    session_token: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    last_activity_at: datetime
    expires_at: datetime
    is_active: bool
    total_searches: int
    total_agent_selections: int


@dataclass
class SearchRecord:
    """Search history record"""
    id: str
    session_id: str
    user_id: str
    query: str
    total_results: int
    selected_agent_id: Optional[str]
    search_time_ms: Optional[float]
    cache_hit: bool
    created_at: datetime


@dataclass
class UserPreferences:
    """User preferences data model"""
    user_id: str
    preferred_domains: List[str]
    preferred_tier: Optional[int]
    default_max_results: int
    show_graph_context: bool
    enable_recommendations: bool
    favorite_agents: List[str]


# ============================================================================
# SESSION MANAGER
# ============================================================================

class SessionManager:
    """
    Manages user sessions, search history, and interactions

    Features:
    - Session lifecycle management
    - Search history tracking
    - Agent interaction recording
    - User preferences
    - Personalized recommendations
    """

    def __init__(self, db_pool: Optional[Pool] = None, database_url: Optional[str] = None):
        """
        Initialize session manager

        Args:
            db_pool: Existing asyncpg connection pool
            database_url: Database URL if creating new pool
        """
        self.db_pool = db_pool
        self.database_url = database_url
        self._pool_owned = db_pool is None

    async def connect(self):
        """Create database connection pool"""
        if self.db_pool is None and self.database_url:
            self.db_pool = await asyncpg.create_pool(
                self.database_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )

    async def disconnect(self):
        """Close database connection pool"""
        if self._pool_owned and self.db_pool:
            await self.db_pool.close()

    # ========================================================================
    # SESSION MANAGEMENT
    # ========================================================================

    async def create_session(
        self,
        user_id: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        device_type: Optional[str] = None,
        session_duration_hours: int = 24
    ) -> UserSession:
        """
        Create a new user session

        Args:
            user_id: User identifier
            ip_address: Client IP address
            user_agent: User agent string
            device_type: Device type (mobile, tablet, desktop)
            session_duration_hours: Session expiry in hours

        Returns:
            UserSession object
        """
        # Generate secure session token
        session_token = self._generate_session_token(user_id)

        # Calculate expiry
        expires_at = datetime.utcnow() + timedelta(hours=session_duration_hours)

        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO user_sessions (
                    user_id,
                    session_token,
                    ip_address,
                    user_agent,
                    device_type,
                    expires_at
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                    id, user_id, session_token, ip_address, user_agent,
                    created_at, last_activity_at, expires_at, is_active,
                    total_searches, total_agent_selections
            """, user_id, session_token, ip_address, user_agent, device_type, expires_at)

            return self._row_to_session(row)

    async def get_session(
        self,
        session_token: str
    ) -> Optional[UserSession]:
        """
        Get session by token

        Args:
            session_token: Session token

        Returns:
            UserSession if found and valid, None otherwise
        """
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT
                    id, user_id, session_token, ip_address, user_agent,
                    created_at, last_activity_at, expires_at, is_active,
                    total_searches, total_agent_selections
                FROM user_sessions
                WHERE session_token = $1
                    AND is_active = TRUE
                    AND expires_at > NOW()
            """, session_token)

            if row:
                # Update last activity
                await conn.execute("""
                    UPDATE user_sessions
                    SET last_activity_at = NOW()
                    WHERE id = $1
                """, row['id'])

                return self._row_to_session(row)

            return None

    async def validate_session(
        self,
        session_token: str
    ) -> bool:
        """
        Validate session token

        Args:
            session_token: Session token to validate

        Returns:
            True if session is valid, False otherwise
        """
        session = await self.get_session(session_token)
        return session is not None

    async def end_session(
        self,
        session_token: str,
        reason: str = "manual"
    ) -> bool:
        """
        End a user session

        Args:
            session_token: Session token
            reason: Logout reason (manual, timeout, forced)

        Returns:
            True if session was ended, False if not found
        """
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE user_sessions
                SET is_active = FALSE,
                    ended_at = NOW(),
                    logout_reason = $2
                WHERE session_token = $1
                    AND is_active = TRUE
            """, session_token, reason)

            return result == "UPDATE 1"

    async def cleanup_expired_sessions(self) -> int:
        """
        Clean up expired sessions

        Returns:
            Number of sessions cleaned up
        """
        async with self.db_pool.acquire() as conn:
            return await conn.fetchval("SELECT cleanup_expired_sessions()")

    # ========================================================================
    # SEARCH HISTORY
    # ========================================================================

    async def record_search(
        self,
        session_id: str,
        user_id: str,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        results: Optional[List[Dict[str, Any]]] = None,
        total_results: int = 0,
        search_time_ms: Optional[float] = None,
        cache_hit: bool = False,
        experiment_variant: Optional[str] = None
    ) -> str:
        """
        Record a search event

        Args:
            session_id: Session ID
            user_id: User ID
            query: Search query
            filters: Applied filters
            results: Search results
            total_results: Total number of results
            search_time_ms: Search duration in milliseconds
            cache_hit: Whether result was from cache
            experiment_variant: A/B test variant

        Returns:
            Search record ID
        """
        import json

        async with self.db_pool.acquire() as conn:
            search_id = await conn.fetchval("""
                SELECT record_search_event(
                    $1::uuid, $2, $3,
                    $4::jsonb, $5::jsonb,
                    $6, $7, $8
                )
            """,
                session_id,
                user_id,
                query,
                json.dumps(filters or {}),
                json.dumps(results or []),
                total_results,
                search_time_ms,
                cache_hit
            )

            # Update experiment variant if provided
            if experiment_variant:
                await conn.execute("""
                    UPDATE search_history
                    SET experiment_variant = $2
                    WHERE id = $1
                """, search_id, experiment_variant)

            return str(search_id)

    async def update_search_selection(
        self,
        search_id: str,
        selected_agent_id: str,
        agent_rank: int,
        time_to_selection_ms: Optional[int] = None
    ) -> bool:
        """
        Update search record with agent selection

        Args:
            search_id: Search record ID
            selected_agent_id: Selected agent ID
            agent_rank: Position of agent in results (1-based)
            time_to_selection_ms: Time from search to selection

        Returns:
            True if updated successfully
        """
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE search_history
                SET selected_agent_id = $2,
                    selected_agent_rank = $3,
                    time_to_selection_ms = $4,
                    selected_at = NOW()
                WHERE id = $1
            """, search_id, selected_agent_id, agent_rank, time_to_selection_ms)

            return result == "UPDATE 1"

    async def get_user_search_history(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> List[SearchRecord]:
        """
        Get user's search history

        Args:
            user_id: User ID
            limit: Maximum number of records
            offset: Pagination offset

        Returns:
            List of search records
        """
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM get_user_search_history($1, $2, $3)
            """, user_id, limit, offset)

            return [self._row_to_search_record(row) for row in rows]

    # ========================================================================
    # AGENT INTERACTIONS
    # ========================================================================

    async def record_interaction(
        self,
        session_id: str,
        user_id: str,
        agent_id: str,
        interaction_type: InteractionType,
        search_id: Optional[str] = None,
        agent_rank: Optional[int] = None,
        rating: Optional[int] = None,
        feedback_text: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Record agent interaction

        Args:
            session_id: Session ID
            user_id: User ID
            agent_id: Agent ID
            interaction_type: Type of interaction
            search_id: Related search ID
            agent_rank: Position in search results
            rating: User rating (1-5)
            feedback_text: User feedback
            context: Additional context

        Returns:
            Interaction record ID
        """
        import json

        async with self.db_pool.acquire() as conn:
            interaction_id = await conn.fetchval("""
                SELECT record_agent_interaction(
                    $1::uuid, $2, $3::uuid, $4,
                    $5::uuid, $6, $7
                )
            """,
                session_id,
                user_id,
                agent_id,
                interaction_type.value,
                search_id,
                rating,
                feedback_text
            )

            # Update additional fields if provided
            if agent_rank is not None or context is not None:
                await conn.execute("""
                    UPDATE agent_interactions
                    SET agent_rank = COALESCE($2, agent_rank),
                        context = COALESCE($3::jsonb, context)
                    WHERE id = $1
                """, interaction_id, agent_rank, json.dumps(context or {}))

            return str(interaction_id)

    async def get_user_top_agents(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get user's most-used agents

        Args:
            user_id: User ID
            limit: Maximum number of agents

        Returns:
            List of top agents with usage stats
        """
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM get_user_top_agents($1, $2)
            """, user_id, limit)

            return [dict(row) for row in rows]

    # ========================================================================
    # USER PREFERENCES
    # ========================================================================

    async def get_preferences(
        self,
        user_id: str
    ) -> Optional[UserPreferences]:
        """
        Get user preferences

        Args:
            user_id: User ID

        Returns:
            UserPreferences object if found
        """
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT
                    user_id,
                    preferred_domains,
                    preferred_tier,
                    default_max_results,
                    show_graph_context,
                    enable_recommendations,
                    favorite_agents
                FROM user_preferences
                WHERE user_id = $1
            """, user_id)

            if row:
                return UserPreferences(
                    user_id=row['user_id'],
                    preferred_domains=row['preferred_domains'] or [],
                    preferred_tier=row['preferred_tier'],
                    default_max_results=row['default_max_results'],
                    show_graph_context=row['show_graph_context'],
                    enable_recommendations=row['enable_recommendations'],
                    favorite_agents=row['favorite_agents'] or []
                )

            return None

    async def upsert_preferences(
        self,
        user_id: str,
        **preferences
    ) -> UserPreferences:
        """
        Create or update user preferences

        Args:
            user_id: User ID
            **preferences: Preference fields to update

        Returns:
            Updated UserPreferences object
        """
        import json

        async with self.db_pool.acquire() as conn:
            # Build dynamic UPDATE statement
            set_clauses = []
            values = [user_id]
            param_index = 2

            for key, value in preferences.items():
                if key in [
                    'preferred_domains', 'preferred_tier', 'default_max_results',
                    'show_graph_context', 'enable_recommendations', 'favorite_agents'
                ]:
                    set_clauses.append(f"{key} = ${param_index}")
                    values.append(value)
                    param_index += 1

            if set_clauses:
                set_clause = ", ".join(set_clauses)

                await conn.execute(f"""
                    INSERT INTO user_preferences (user_id, {", ".join(preferences.keys())})
                    VALUES ($1, {", ".join([f"${i}" for i in range(2, param_index)])})
                    ON CONFLICT (user_id)
                    DO UPDATE SET {set_clause}
                """, *values)

            return await self.get_preferences(user_id)

    async def add_favorite_agent(
        self,
        user_id: str,
        agent_id: str
    ) -> bool:
        """
        Add agent to favorites

        Args:
            user_id: User ID
            agent_id: Agent ID to add

        Returns:
            True if added successfully
        """
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE user_preferences
                SET favorite_agents = array_append(favorite_agents, $2::uuid)
                WHERE user_id = $1
                    AND NOT ($2::uuid = ANY(favorite_agents))
            """, user_id, agent_id)

            return result == "UPDATE 1"

    async def remove_favorite_agent(
        self,
        user_id: str,
        agent_id: str
    ) -> bool:
        """
        Remove agent from favorites

        Args:
            user_id: User ID
            agent_id: Agent ID to remove

        Returns:
            True if removed successfully
        """
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE user_preferences
                SET favorite_agents = array_remove(favorite_agents, $2::uuid)
                WHERE user_id = $1
            """, user_id, agent_id)

            return result == "UPDATE 1"

    # ========================================================================
    # PERSONALIZED RECOMMENDATIONS
    # ========================================================================

    async def create_recommendation(
        self,
        user_id: str,
        agent_id: str,
        recommendation_type: RecommendationType,
        relevance_score: float,
        confidence_score: float,
        reason: Optional[str] = None,
        factors: Optional[Dict[str, float]] = None,
        ttl_hours: int = 24
    ) -> str:
        """
        Create personalized recommendation

        Args:
            user_id: User ID
            agent_id: Agent ID
            recommendation_type: Type of recommendation
            relevance_score: Relevance score (0-1)
            confidence_score: Confidence score (0-1)
            reason: Human-readable reason
            factors: Scoring factors
            ttl_hours: Time-to-live in hours

        Returns:
            Recommendation ID
        """
        import json

        expires_at = datetime.utcnow() + timedelta(hours=ttl_hours)

        async with self.db_pool.acquire() as conn:
            recommendation_id = await conn.fetchval("""
                INSERT INTO personalized_recommendations (
                    user_id,
                    agent_id,
                    recommendation_type,
                    relevance_score,
                    confidence_score,
                    reason,
                    factors,
                    expires_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
                RETURNING id
            """,
                user_id,
                agent_id,
                recommendation_type.value,
                relevance_score,
                confidence_score,
                reason,
                json.dumps(factors or {}),
                expires_at
            )

            return str(recommendation_id)

    async def get_recommendations(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get active recommendations for user

        Args:
            user_id: User ID
            limit: Maximum number of recommendations

        Returns:
            List of recommendations
        """
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT
                    r.id,
                    r.agent_id,
                    a.name AS agent_name,
                    a.display_name AS agent_display_name,
                    r.recommendation_type,
                    r.relevance_score,
                    r.confidence_score,
                    r.reason,
                    r.factors,
                    r.shown_count,
                    r.created_at
                FROM personalized_recommendations r
                JOIN agents a ON r.agent_id = a.id
                WHERE r.user_id = $1
                    AND r.expires_at > NOW()
                    AND r.clicked = FALSE
                ORDER BY r.relevance_score DESC, r.confidence_score DESC
                LIMIT $2
            """, user_id, limit)

            return [dict(row) for row in rows]

    async def mark_recommendation_shown(
        self,
        recommendation_id: str
    ) -> bool:
        """
        Mark recommendation as shown to user

        Args:
            recommendation_id: Recommendation ID

        Returns:
            True if updated successfully
        """
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE personalized_recommendations
                SET shown_count = shown_count + 1
                WHERE id = $1
            """, recommendation_id)

            return result == "UPDATE 1"

    async def mark_recommendation_clicked(
        self,
        recommendation_id: str
    ) -> bool:
        """
        Mark recommendation as clicked

        Args:
            recommendation_id: Recommendation ID

        Returns:
            True if updated successfully
        """
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE personalized_recommendations
                SET clicked = TRUE,
                    clicked_at = NOW()
                WHERE id = $1
            """, recommendation_id)

            return result == "UPDATE 1"

    # ========================================================================
    # ANALYTICS
    # ========================================================================

    async def get_user_activity_summary(
        self,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get user activity summary

        Args:
            user_id: User ID

        Returns:
            Activity summary dictionary
        """
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT * FROM v_user_activity_summary
                WHERE user_id = $1
            """, user_id)

            return dict(row) if row else None

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _generate_session_token(self, user_id: str) -> str:
        """
        Generate secure session token

        Args:
            user_id: User ID

        Returns:
            Session token
        """
        # Combine random bytes with user ID hash for uniqueness
        random_bytes = secrets.token_bytes(32)
        user_hash = hashlib.sha256(user_id.encode()).digest()
        combined = random_bytes + user_hash

        return hashlib.sha256(combined).hexdigest()

    def _row_to_session(self, row) -> UserSession:
        """Convert database row to UserSession object"""
        return UserSession(
            id=str(row['id']),
            user_id=row['user_id'],
            session_token=row['session_token'],
            ip_address=row['ip_address'],
            user_agent=row['user_agent'],
            created_at=row['created_at'],
            last_activity_at=row['last_activity_at'],
            expires_at=row['expires_at'],
            is_active=row['is_active'],
            total_searches=row['total_searches'],
            total_agent_selections=row['total_agent_selections']
        )

    def _row_to_search_record(self, row) -> SearchRecord:
        """Convert database row to SearchRecord object"""
        return SearchRecord(
            id=str(row['id']),
            session_id=str(row.get('session_id', '')),
            user_id=row['user_id'],
            query=row['query'],
            total_results=row['total_results'],
            selected_agent_id=str(row['selected_agent_id']) if row.get('selected_agent_id') else None,
            search_time_ms=float(row['search_time_ms']) if row.get('search_time_ms') else None,
            cache_hit=row['cache_hit'],
            created_at=row['created_at']
        )


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_session_manager_instance: Optional[SessionManager] = None


def get_session_manager(
    db_pool: Optional[Pool] = None,
    database_url: Optional[str] = None
) -> SessionManager:
    """
    Get singleton session manager instance

    Args:
        db_pool: Existing database pool
        database_url: Database URL if creating new pool

    Returns:
        SessionManager instance
    """
    global _session_manager_instance

    if _session_manager_instance is None:
        _session_manager_instance = SessionManager(
            db_pool=db_pool,
            database_url=database_url
        )

    return _session_manager_instance
