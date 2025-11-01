"""
Feedback Manager Service for VITAL Path AI Engine
Collects and analyzes user feedback on agent responses

Golden Rule #5: User feedback MUST inform agent selection and improvement

Features:
- Collect user feedback (ratings, comments, tags)
- Track agent performance metrics
- Analyze feedback patterns
- Generate agent recommendations
- Detect quality issues
- Support continuous improvement

Usage:
    >>> feedback_manager = FeedbackManager(supabase_client, cache_manager)
    >>> await feedback_manager.submit_feedback(feedback_request)
    >>> performance = await feedback_manager.get_agent_performance(tenant_id)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from enum import Enum
import structlog
from pydantic import BaseModel, Field
from services.supabase_client import SupabaseClient
from services.cache_manager import CacheManager

logger = structlog.get_logger()


# ============================================================================
# ENUMS
# ============================================================================

class FeedbackType(str, Enum):
    """Feedback type enumeration"""
    HELPFUL = "helpful"
    NOT_HELPFUL = "not_helpful"
    INCORRECT = "incorrect"
    INCOMPLETE = "incomplete"
    EXCELLENT = "excellent"


class SelectionMethod(str, Enum):
    """Agent selection method"""
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    ML_MODEL = "ml_model"
    FALLBACK = "fallback"


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class FeedbackRequest(BaseModel):
    """User feedback request model"""
    tenant_id: str = Field(..., description="Tenant UUID")
    session_id: str = Field(..., description="Session identifier")
    turn_id: Optional[str] = Field(None, description="Conversation turn ID")
    user_id: Optional[str] = Field(None, description="User ID")
    
    # Agent context
    agent_id: str = Field(..., description="Agent that generated response")
    agent_type: str = Field(..., description="Agent type")
    query: str = Field(..., max_length=5000, description="User query")
    response: str = Field(..., max_length=10000, description="Agent response")
    
    # Feedback
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    feedback_type: FeedbackType = Field(..., description="Feedback category")
    feedback_text: Optional[str] = Field(None, max_length=2000, description="Free-form feedback")
    feedback_tags: List[str] = Field(default_factory=list, description="Feedback tags")
    
    # Metadata
    response_time_ms: Optional[int] = Field(None, description="Response time")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score")
    rag_enabled: bool = Field(False, description="Was RAG enabled")
    tools_enabled: bool = Field(False, description="Were tools enabled")
    model_used: Optional[str] = Field(None, description="Model used")
    
    # Analytics
    was_edited: bool = Field(False, description="Did user edit the response")
    user_continued: bool = Field(True, description="Did user continue conversation")
    session_abandoned: bool = Field(False, description="Did user abandon session")


class FeedbackResponse(BaseModel):
    """Feedback submission response"""
    feedback_id: str
    status: str
    message: str
    agent_metrics_updated: bool = False


class AgentPerformanceSummary(BaseModel):
    """Agent performance summary model"""
    agent_id: str
    agent_type: str
    agent_name: Optional[str] = None
    total_queries: int
    avg_rating: float
    success_rate: float
    avg_response_time_ms: float
    positive_feedback_rate: float
    recommendation_score: float
    last_updated: datetime


class FeedbackAnalytics(BaseModel):
    """Feedback analytics summary"""
    total_feedback: int
    avg_rating: float
    positive_count: int
    negative_count: int
    common_tags: List[str]
    improvement_areas: List[str]
    top_performing_agents: List[str]
    bottom_performing_agents: List[str]


# ============================================================================
# FEEDBACK MANAGER SERVICE
# ============================================================================

class FeedbackManager:
    """
    User Feedback Collection and Analysis System
    
    Golden Rule #3: Tenant-aware
    Golden Rule #5: Feedback-driven improvement
    
    Responsibilities:
    - Collect user feedback on agent responses
    - Track agent performance metrics
    - Analyze feedback patterns
    - Generate agent recommendations
    - Detect quality issues
    - Support continuous improvement
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None
    ):
        """
        Initialize feedback manager.
        
        Args:
            supabase_client: Supabase client for database access
            cache_manager: Optional cache manager for performance
        """
        self.supabase = supabase_client
        self.cache = cache_manager
        logger.info("✅ FeedbackManager initialized")
    
    async def submit_feedback(
        self,
        feedback: FeedbackRequest
    ) -> FeedbackResponse:
        """
        Submit user feedback for an agent response.
        
        Golden Rule #3: Tenant isolation enforced
        Golden Rule #5: Feedback captured for improvement
        
        Args:
            feedback: Feedback request data
            
        Returns:
            Feedback submission result with ID
            
        Raises:
            ValueError: If tenant_id is missing or invalid
            Exception: If feedback submission fails
        """
        if not feedback.tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            logger.info(
                "Submitting user feedback",
                tenant_id=feedback.tenant_id[:8],
                agent_id=feedback.agent_id,
                rating=feedback.rating,
                feedback_type=feedback.feedback_type.value
            )
            
            # Ensure tenant context
            await self.supabase.set_tenant_context(feedback.tenant_id)
            
            # Prepare feedback data
            feedback_data = {
                'tenant_id': feedback.tenant_id,
                'session_id': feedback.session_id,
                'turn_id': feedback.turn_id,
                'user_id': feedback.user_id,
                'agent_id': feedback.agent_id,
                'agent_type': feedback.agent_type,
                'query': feedback.query,
                'response': feedback.response,
                'rating': feedback.rating,
                'feedback_type': feedback.feedback_type.value,
                'feedback_text': feedback.feedback_text,
                'feedback_tags': feedback.feedback_tags,
                'response_time_ms': feedback.response_time_ms,
                'confidence_score': feedback.confidence_score,
                'rag_enabled': feedback.rag_enabled,
                'tools_enabled': feedback.tools_enabled,
                'model_used': feedback.model_used,
                'was_edited': feedback.was_edited,
                'user_continued': feedback.user_continued,
                'session_abandoned': feedback.session_abandoned,
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Insert feedback
            result = await self.supabase.client.table('user_feedback') \
                .insert(feedback_data) \
                .execute()
            
            if not result.data:
                raise Exception("Failed to insert feedback - no data returned")
            
            feedback_id = result.data[0]['id']
            
            # Invalidate cache for agent recommendations
            if self.cache:
                await self.cache.delete(
                    f"agent_recommendations:{feedback.tenant_id}"
                )
                await self.cache.delete(
                    f"agent_performance:{feedback.tenant_id}:{feedback.agent_id}"
                )
            
            logger.info(
                "✅ Feedback submitted successfully",
                tenant_id=feedback.tenant_id[:8],
                feedback_id=feedback_id,
                agent_id=feedback.agent_id,
                rating=feedback.rating
            )
            
            return FeedbackResponse(
                feedback_id=feedback_id,
                status='submitted',
                message='Thank you for your feedback!',
                agent_metrics_updated=True
            )
        
        except Exception as e:
            logger.error(
                "❌ Failed to submit feedback",
                tenant_id=feedback.tenant_id[:8],
                agent_id=feedback.agent_id,
                error=str(e),
                error_type=type(e).__name__
            )
            raise
    
    async def get_agent_performance(
        self,
        tenant_id: str,
        agent_id: Optional[str] = None,
        period_days: int = 30
    ) -> List[AgentPerformanceSummary]:
        """
        Get agent performance metrics.
        
        Golden Rule #3: Tenant isolation enforced
        
        Args:
            tenant_id: Tenant UUID
            agent_id: Optional specific agent ID
            period_days: Number of days to analyze (default: 30)
            
        Returns:
            List of agent performance summaries sorted by recommendation score
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            # Check cache first
            cache_key = f"agent_performance:{tenant_id}:{agent_id or 'all'}:{period_days}"
            if self.cache:
                cached = await self.cache.get(cache_key)
                if cached:
                    logger.debug(
                        "Agent performance retrieved from cache",
                        tenant_id=tenant_id[:8],
                        agent_id=agent_id
                    )
                    return cached
            
            # Ensure tenant context
            await self.supabase.set_tenant_context(tenant_id)
            
            # Calculate period
            period_start = datetime.utcnow() - timedelta(days=period_days)
            
            # Query feedback
            query = self.supabase.client.table('user_feedback') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .gte('created_at', period_start.isoformat())
            
            if agent_id:
                query = query.eq('agent_id', agent_id)
            
            result = await query.execute()
            
            if not result.data:
                logger.info(
                    "No feedback data found",
                    tenant_id=tenant_id[:8],
                    agent_id=agent_id,
                    period_days=period_days
                )
                return []
            
            # Group by agent
            agent_data = {}
            for feedback in result.data:
                aid = feedback['agent_id']
                if aid not in agent_data:
                    agent_data[aid] = {
                        'agent_id': aid,
                        'agent_type': feedback['agent_type'],
                        'ratings': [],
                        'response_times': [],
                        'positive_count': 0,
                        'negative_count': 0,
                        'total_count': 0,
                        'success_count': 0
                    }
                
                agent_data[aid]['ratings'].append(feedback['rating'])
                if feedback.get('response_time_ms'):
                    agent_data[aid]['response_times'].append(feedback['response_time_ms'])
                
                agent_data[aid]['total_count'] += 1
                
                if feedback['rating'] >= 4:
                    agent_data[aid]['positive_count'] += 1
                    agent_data[aid]['success_count'] += 1
                elif feedback['rating'] <= 2:
                    agent_data[aid]['negative_count'] += 1
                else:
                    agent_data[aid]['success_count'] += 1  # Neutral is still successful
            
            # Calculate summaries
            summaries = []
            for aid, data in agent_data.items():
                avg_rating = sum(data['ratings']) / len(data['ratings'])
                avg_response_time = (
                    sum(data['response_times']) / len(data['response_times'])
                    if data['response_times'] else 0
                )
                positive_rate = data['positive_count'] / data['total_count']
                success_rate = data['success_count'] / data['total_count']
                
                # Calculate recommendation score (weighted average)
                # Rating: 40%, Success rate: 30%, Positive feedback: 30%
                recommendation_score = (
                    avg_rating * 0.4 +  # Rating contribution
                    success_rate * 5 * 0.3 +  # Success rate (normalized to 5)
                    positive_rate * 5 * 0.3  # Positive feedback (normalized to 5)
                )
                
                summaries.append(AgentPerformanceSummary(
                    agent_id=aid,
                    agent_type=data['agent_type'],
                    agent_name=None,  # Will be populated from agents table if needed
                    total_queries=data['total_count'],
                    avg_rating=round(avg_rating, 2),
                    success_rate=round(success_rate, 2),
                    avg_response_time_ms=round(avg_response_time, 0),
                    positive_feedback_rate=round(positive_rate, 2),
                    recommendation_score=round(recommendation_score, 2),
                    last_updated=datetime.utcnow()
                ))
            
            # Sort by recommendation score (descending)
            summaries.sort(key=lambda x: x.recommendation_score, reverse=True)
            
            # Cache results
            if self.cache:
                await self.cache.set(
                    cache_key,
                    summaries,
                    ttl=3600  # 1 hour
                )
            
            logger.info(
                "Agent performance calculated",
                tenant_id=tenant_id[:8],
                agents_analyzed=len(summaries),
                period_days=period_days
            )
            
            return summaries
        
        except Exception as e:
            logger.error(
                "❌ Failed to get agent performance",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                error=str(e),
                error_type=type(e).__name__
            )
            return []
    
    async def get_feedback_analytics(
        self,
        tenant_id: str,
        period_days: int = 30
    ) -> FeedbackAnalytics:
        """
        Get comprehensive feedback analytics.
        
        Args:
            tenant_id: Tenant UUID
            period_days: Number of days to analyze
            
        Returns:
            Feedback analytics summary
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            # Ensure tenant context
            await self.supabase.set_tenant_context(tenant_id)
            
            # Calculate period
            period_start = datetime.utcnow() - timedelta(days=period_days)
            
            # Query feedback
            result = await self.supabase.client.table('user_feedback') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .gte('created_at', period_start.isoformat()) \
                .execute()
            
            if not result.data:
                return FeedbackAnalytics(
                    total_feedback=0,
                    avg_rating=0.0,
                    positive_count=0,
                    negative_count=0,
                    common_tags=[],
                    improvement_areas=[],
                    top_performing_agents=[],
                    bottom_performing_agents=[]
                )
            
            # Calculate analytics
            total_feedback = len(result.data)
            avg_rating = sum(f['rating'] for f in result.data) / total_feedback
            positive_count = sum(1 for f in result.data if f['rating'] >= 4)
            negative_count = sum(1 for f in result.data if f['rating'] <= 2)
            
            # Aggregate tags
            all_tags = []
            for f in result.data:
                if f.get('feedback_tags'):
                    all_tags.extend(f['feedback_tags'])
            
            from collections import Counter
            tag_counts = Counter(all_tags)
            common_tags = [tag for tag, _ in tag_counts.most_common(10)]
            
            # Identify improvement areas (from negative feedback)
            improvement_areas = []
            negative_feedback = [f for f in result.data if f['rating'] <= 2]
            for f in negative_feedback:
                if f.get('feedback_type') == 'incorrect':
                    improvement_areas.append('accuracy')
                elif f.get('feedback_type') == 'incomplete':
                    improvement_areas.append('completeness')
                elif f.get('feedback_type') == 'not_helpful':
                    improvement_areas.append('relevance')
            
            improvement_areas = list(set(improvement_areas))
            
            # Get top/bottom performing agents
            performance = await self.get_agent_performance(tenant_id, period_days=period_days)
            top_performing = [p.agent_id for p in performance[:3]]
            bottom_performing = [p.agent_id for p in performance[-3:]] if len(performance) > 3 else []
            
            logger.info(
                "Feedback analytics calculated",
                tenant_id=tenant_id[:8],
                total_feedback=total_feedback,
                avg_rating=round(avg_rating, 2),
                period_days=period_days
            )
            
            return FeedbackAnalytics(
                total_feedback=total_feedback,
                avg_rating=round(avg_rating, 2),
                positive_count=positive_count,
                negative_count=negative_count,
                common_tags=common_tags,
                improvement_areas=improvement_areas,
                top_performing_agents=top_performing,
                bottom_performing_agents=bottom_performing
            )
        
        except Exception as e:
            logger.error(
                "❌ Failed to get feedback analytics",
                tenant_id=tenant_id[:8],
                error=str(e)
            )
            raise
    
    async def get_agent_feedback_history(
        self,
        tenant_id: str,
        agent_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get feedback history for a specific agent.
        
        Args:
            tenant_id: Tenant UUID
            agent_id: Agent ID
            limit: Maximum number of feedback entries to return
            
        Returns:
            List of feedback entries
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            # Ensure tenant context
            await self.supabase.set_tenant_context(tenant_id)
            
            # Query feedback
            result = await self.supabase.client.table('user_feedback') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .eq('agent_id', agent_id) \
                .order('created_at', desc=True) \
                .limit(limit) \
                .execute()
            
            logger.info(
                "Agent feedback history retrieved",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                count=len(result.data) if result.data else 0
            )
            
            return result.data if result.data else []
        
        except Exception as e:
            logger.error(
                "❌ Failed to get agent feedback history",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                error=str(e)
            )
            return []


# ============================================================================
# SERVICE FACTORY
# ============================================================================

_feedback_manager: Optional[FeedbackManager] = None


def get_feedback_manager(
    supabase_client: Optional[SupabaseClient] = None,
    cache_manager: Optional[CacheManager] = None
) -> FeedbackManager:
    """
    Get or create feedback manager instance (singleton pattern)
    
    Args:
        supabase_client: Optional Supabase client for dependency injection
        cache_manager: Optional cache manager for dependency injection
        
    Returns:
        FeedbackManager instance
    """
    global _feedback_manager
    
    if _feedback_manager is None:
        if not supabase_client:
            raise ValueError("supabase_client is required for first initialization")
        _feedback_manager = FeedbackManager(
            supabase_client=supabase_client,
            cache_manager=cache_manager
        )
    
    return _feedback_manager

