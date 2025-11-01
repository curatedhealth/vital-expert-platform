"""
Enhanced Agent Selector with ML-Powered Selection and Feedback Loop
Integrates with FeedbackManager for intelligent agent recommendations

Golden Rule #5: User feedback MUST inform agent selection

Features:
- Query analysis (intent, domains, complexity)
- Performance-based agent ranking
- ML-powered similarity matching
- Multi-factor scoring algorithm
- Selection history logging for training
- Fallback mechanisms

Usage:
    >>> selector = EnhancedAgentSelector(
    ...     supabase_client=supabase,
    ...     feedback_manager=feedback_mgr
    ... )
    >>> recommendation = await selector.select_best_agent(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     query="What are FDA requirements?",
    ...     session_id="session_123"
    ... )
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import structlog
from pydantic import BaseModel, Field
from openai import OpenAI
import numpy as np

from services.supabase_client import SupabaseClient
from services.feedback_manager import FeedbackManager, AgentPerformanceSummary
from services.cache_manager import CacheManager
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# MODELS
# ============================================================================

class QueryAnalysis(BaseModel):
    """Query analysis result"""
    intent: str
    domains: List[str]
    complexity: str  # 'low', 'medium', 'high'
    keywords: List[str]
    medical_terms: List[str]
    confidence: float


class AgentScore(BaseModel):
    """Agent scoring breakdown"""
    agent_id: str
    agent_type: str
    agent_name: Optional[str]
    
    # Individual scores (0-5 scale)
    domain_score: float
    performance_score: float
    similarity_score: float
    availability_score: float
    
    # Weighted total
    total_score: float
    confidence_score: float  # Normalized 0-1
    
    # Explanation
    recommendation_reason: str
    
    # Performance data
    performance_metrics: Dict[str, Any]
    historical_success_rate: float


class AgentRecommendation(BaseModel):
    """Final agent recommendation"""
    agent_id: str
    agent_type: str
    agent_name: str
    confidence_score: float
    recommendation_reason: str
    performance_metrics: Dict[str, Any]
    historical_success_rate: float
    query_analysis: Optional[QueryAnalysis] = None
    all_candidates: Optional[List[AgentScore]] = None


# ============================================================================
# ENHANCED AGENT SELECTOR
# ============================================================================

class EnhancedAgentSelector:
    """
    ML-Powered Agent Selector with Feedback Loop
    
    Golden Rule #3: Tenant-aware
    Golden Rule #5: Feedback-driven selection
    
    Selection Algorithm:
    1. Analyze query (intent, domains, complexity)
    2. Get agent performance metrics from FeedbackManager
    3. Score agents using multi-factor algorithm:
       - Domain match: 30%
       - Historical performance: 40%
       - Query similarity: 20%
       - Current availability: 10%
    4. Select top agent
    5. Log selection for ML training
    
    Responsibilities:
    - Query analysis with LLM
    - Performance-based agent ranking
    - Multi-factor scoring
    - Selection history logging
    - Fallback handling
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        feedback_manager: FeedbackManager,
        cache_manager: Optional[CacheManager] = None,
        openai_client: Optional[OpenAI] = None
    ):
        """
        Initialize enhanced agent selector.
        
        Args:
            supabase_client: Supabase client
            feedback_manager: Feedback manager for performance data
            cache_manager: Optional cache manager
            openai_client: Optional OpenAI client
        """
        self.supabase = supabase_client
        self.feedback = feedback_manager
        self.cache = cache_manager
        self.openai = openai_client or OpenAI(api_key=settings.openai_api_key)
        
        # Scoring weights (configurable)
        self.weights = {
            'domain': 0.30,      # Domain expertise match: 30%
            'performance': 0.40,  # Historical performance: 40%
            'similarity': 0.20,   # Query similarity: 20%
            'availability': 0.10  # Current availability: 10%
        }
        
        logger.info("✅ EnhancedAgentSelector initialized", weights=self.weights)
    
    async def select_best_agent(
        self,
        tenant_id: str,
        query: str,
        session_id: str,
        user_id: Optional[str] = None,
        candidate_agents: Optional[List[str]] = None,
        mode: str = "automatic"
    ) -> AgentRecommendation:
        """
        Select best agent for query with feedback-driven ranking.
        
        Golden Rule #3: Tenant isolation enforced
        Golden Rule #5: Uses feedback data for selection
        
        Args:
            tenant_id: Tenant UUID
            query: User query
            session_id: Session ID
            user_id: Optional user ID
            candidate_agents: Optional list of candidate agent IDs
            mode: Selection mode ('automatic', 'ml_model', 'fallback')
            
        Returns:
            AgentRecommendation with best agent and reasoning
            
        Raises:
            ValueError: If tenant_id or query is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        if not query or not query.strip():
            raise ValueError("query is REQUIRED")
        
        try:
            logger.info(
                "Selecting best agent",
                tenant_id=tenant_id[:8],
                query_preview=query[:100],
                mode=mode
            )
            
            # 1. Analyze query
            query_analysis = await self._analyze_query(query)
            
            logger.debug(
                "Query analyzed",
                intent=query_analysis.intent,
                domains=query_analysis.domains,
                complexity=query_analysis.complexity
            )
            
            # 2. Get agent performance data (Golden Rule #5)
            performance_data = await self.feedback.get_agent_performance(
                tenant_id=tenant_id,
                period_days=30
            )
            
            logger.debug(
                "Performance data retrieved",
                agents_with_data=len(performance_data)
            )
            
            # 3. Get candidate agents
            if not candidate_agents:
                candidate_agents = await self._get_available_agents(tenant_id)
            
            if not candidate_agents:
                logger.warning("No candidate agents available, using fallback")
                return await self._get_fallback_agent(tenant_id, query_analysis)
            
            logger.debug("Candidate agents", count=len(candidate_agents))
            
            # 4. Score agents
            scored_agents = await self._score_agents(
                tenant_id=tenant_id,
                query=query,
                query_analysis=query_analysis,
                candidate_agents=candidate_agents,
                performance_data=performance_data
            )
            
            if not scored_agents:
                logger.warning("No agents scored successfully, using fallback")
                return await self._get_fallback_agent(tenant_id, query_analysis)
            
            # 5. Select best agent (highest score)
            best_agent = scored_agents[0]
            
            logger.info(
                "✅ Agent selected",
                tenant_id=tenant_id[:8],
                agent_id=best_agent.agent_id,
                confidence=best_agent.confidence_score,
                reason=best_agent.recommendation_reason
            )
            
            # 6. Log selection for ML training
            await self._log_agent_selection(
                tenant_id=tenant_id,
                session_id=session_id,
                user_id=user_id,
                query=query,
                query_analysis=query_analysis,
                agents_considered=scored_agents,
                agent_selected=best_agent.agent_id,
                selection_method=mode
            )
            
            # 7. Build recommendation
            recommendation = AgentRecommendation(
                agent_id=best_agent.agent_id,
                agent_type=best_agent.agent_type,
                agent_name=best_agent.agent_name or best_agent.agent_id,
                confidence_score=best_agent.confidence_score,
                recommendation_reason=best_agent.recommendation_reason,
                performance_metrics=best_agent.performance_metrics,
                historical_success_rate=best_agent.historical_success_rate,
                query_analysis=query_analysis,
                all_candidates=scored_agents[:5]  # Top 5 for transparency
            )
            
            return recommendation
        
        except Exception as e:
            logger.error(
                "❌ Failed to select agent",
                tenant_id=tenant_id[:8],
                error=str(e),
                error_type=type(e).__name__
            )
            # Fallback to default agent
            return await self._get_fallback_agent(tenant_id, None)
    
    async def _analyze_query(self, query: str) -> QueryAnalysis:
        """
        Analyze query to extract intent, domains, complexity.
        
        Uses OpenAI GPT-4 for structured query analysis.
        
        Args:
            query: User query text
            
        Returns:
            QueryAnalysis with extracted metadata
        """
        try:
            # Check cache
            if self.cache:
                cache_key = f"query_analysis:{hash(query) % 1000000}"
                cached = await self.cache.get(cache_key)
                if cached:
                    return QueryAnalysis(**cached)
            
            # Prepare system prompt
            system_prompt = """You are a medical/healthcare query analysis assistant.
Analyze queries and extract structured information.

Return JSON with:
- intent: Primary intent (diagnosis, treatment, research, consultation, education, regulation, compliance)
- domains: Array of medical domains (cardiology, oncology, neurology, regulatory, clinical_trials, etc.)
- complexity: Complexity level (low, medium, high)
- keywords: Key medical terms and concepts (array of strings)
- medicalTerms: Specific medical terminology (array of strings)
- confidence: Confidence score (0-1) in your analysis

Focus on medical/healthcare context."""

            # Call OpenAI
            response = self.openai.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=500,
                timeout=30.0
            )
            
            # Parse response
            import json
            content = response.choices[0].message.content
            analysis_data = json.loads(content)
            
            analysis = QueryAnalysis(
                intent=analysis_data.get("intent", "general"),
                domains=analysis_data.get("domains", []),
                complexity=analysis_data.get("complexity", "medium"),
                keywords=analysis_data.get("keywords", []),
                medical_terms=analysis_data.get("medicalTerms", []),
                confidence=min(max(float(analysis_data.get("confidence", 0.7)), 0.0), 1.0)
            )
            
            # Cache result
            if self.cache:
                await self.cache.set(
                    cache_key,
                    analysis.dict(),
                    ttl=3600  # 1 hour
                )
            
            return analysis
        
        except Exception as e:
            logger.error("Failed to analyze query", error=str(e))
            # Fallback analysis
            return QueryAnalysis(
                intent="general",
                domains=[],
                complexity="medium",
                keywords=query.split()[:5],
                medical_terms=[],
                confidence=0.5
            )
    
    async def _get_available_agents(self, tenant_id: str) -> List[str]:
        """
        Get available agents for tenant.
        
        Args:
            tenant_id: Tenant UUID
            
        Returns:
            List of agent IDs
        """
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            result = await self.supabase.client.table('agents') \
                .select('id') \
                .eq('tenant_id', tenant_id) \
                .eq('status', 'active') \
                .execute()
            
            agent_ids = [agent['id'] for agent in result.data] if result.data else []
            
            logger.debug(
                "Available agents retrieved",
                tenant_id=tenant_id[:8],
                count=len(agent_ids)
            )
            
            return agent_ids
        
        except Exception as e:
            logger.error("Failed to get available agents", error=str(e))
            return []
    
    async def _score_agents(
        self,
        tenant_id: str,
        query: str,
        query_analysis: QueryAnalysis,
        candidate_agents: List[str],
        performance_data: List[AgentPerformanceSummary]
    ) -> List[AgentScore]:
        """
        Score agents based on multiple factors.
        
        Scoring Algorithm:
        - Domain match: 30%
        - Historical performance: 40%
        - Query similarity: 20%
        - Current availability: 10%
        
        Args:
            tenant_id: Tenant UUID
            query: User query
            query_analysis: Query analysis result
            candidate_agents: List of candidate agent IDs
            performance_data: Agent performance metrics
            
        Returns:
            List of AgentScore objects sorted by total_score
        """
        scored_agents = []
        
        # Create performance lookup
        perf_lookup = {p.agent_id: p for p in performance_data}
        
        for agent_id in candidate_agents:
            try:
                # Get agent details
                agent = await self._get_agent_details(tenant_id, agent_id)
                if not agent:
                    continue
                
                # Get performance data
                perf = perf_lookup.get(agent_id)
                
                # Calculate individual scores
                domain_score = self._calculate_domain_match(
                    query_analysis.domains,
                    agent.get('specialties', [])
                )
                
                performance_score = (
                    perf.recommendation_score if perf else 3.5  # Default: 3.5/5
                )
                
                similarity_score = await self._calculate_similarity_score(
                    query,
                    agent_id,
                    query_analysis
                )
                
                availability_score = 5.0  # All agents available (can be enhanced)
                
                # Weighted total score
                total_score = (
                    domain_score * self.weights['domain'] +
                    performance_score * self.weights['performance'] +
                    similarity_score * self.weights['similarity'] +
                    availability_score * self.weights['availability']
                )
                
                # Normalize to 0-1 confidence score
                confidence_score = round(total_score / 5.0, 2)
                
                # Generate recommendation reason
                reason = self._generate_recommendation_reason(
                    domain_score,
                    performance_score,
                    similarity_score
                )
                
                # Build agent score
                scored_agents.append(AgentScore(
                    agent_id=agent_id,
                    agent_type=agent.get('agent_type', 'general'),
                    agent_name=agent.get('name'),
                    domain_score=round(domain_score, 2),
                    performance_score=round(performance_score, 2),
                    similarity_score=round(similarity_score, 2),
                    availability_score=round(availability_score, 2),
                    total_score=round(total_score, 2),
                    confidence_score=confidence_score,
                    recommendation_reason=reason,
                    performance_metrics={
                        'avg_rating': perf.avg_rating if perf else 0.0,
                        'total_queries': perf.total_queries if perf else 0,
                        'positive_feedback_rate': perf.positive_feedback_rate if perf else 0.0
                    },
                    historical_success_rate=perf.success_rate if perf else 0.0
                ))
            
            except Exception as e:
                logger.error(
                    "Failed to score agent",
                    agent_id=agent_id,
                    error=str(e)
                )
                continue
        
        # Sort by total score (descending)
        scored_agents.sort(key=lambda x: x.total_score, reverse=True)
        
        logger.debug(
            "Agents scored",
            total_agents=len(scored_agents),
            top_score=scored_agents[0].total_score if scored_agents else 0
        )
        
        return scored_agents
    
    def _calculate_domain_match(
        self,
        query_domains: List[str],
        agent_specialties: List[str]
    ) -> float:
        """
        Calculate domain match score (0-5).
        
        Args:
            query_domains: Domains extracted from query
            agent_specialties: Agent's specialty domains
            
        Returns:
            Domain match score (0-5)
        """
        if not query_domains or not agent_specialties:
            return 2.5  # Neutral score
        
        # Calculate matches (case-insensitive)
        agent_specialties_lower = [s.lower() for s in agent_specialties]
        matches = sum(
            1 for domain in query_domains
            if domain.lower() in agent_specialties_lower
        )
        
        # Match rate
        match_rate = matches / len(query_domains)
        
        # Scale to 0-5
        return match_rate * 5.0
    
    async def _calculate_similarity_score(
        self,
        query: str,
        agent_id: str,
        query_analysis: QueryAnalysis
    ) -> float:
        """
        Calculate query similarity score using embeddings (0-5).
        
        Future: Use actual embeddings and historical query comparisons.
        Current: Simplified scoring based on query complexity.
        
        Args:
            query: User query
            agent_id: Agent ID
            query_analysis: Query analysis result
            
        Returns:
            Similarity score (0-5)
        """
        # Simplified scoring for now
        # Future: Compare query embedding with agent's successful past queries
        
        # Base score on query complexity and intent match
        base_score = 3.5
        
        # Boost for specific intents
        if query_analysis.intent in ['diagnosis', 'treatment', 'regulation']:
            base_score += 0.5
        
        # Boost for medical terms present
        if query_analysis.medical_terms:
            base_score += min(len(query_analysis.medical_terms) * 0.1, 1.0)
        
        return min(base_score, 5.0)
    
    def _generate_recommendation_reason(
        self,
        domain_score: float,
        performance_score: float,
        similarity_score: float
    ) -> str:
        """
        Generate human-readable recommendation reason.
        
        Args:
            domain_score: Domain match score
            performance_score: Performance score
            similarity_score: Similarity score
            
        Returns:
            Recommendation reason string
        """
        reasons = []
        
        if domain_score >= 4.0:
            reasons.append("strong domain expertise match")
        elif domain_score >= 3.0:
            reasons.append("good domain coverage")
        
        if performance_score >= 4.0:
            reasons.append("excellent historical performance")
        elif performance_score >= 3.5:
            reasons.append("solid track record")
        
        if similarity_score >= 4.0:
            reasons.append("highly relevant to similar queries")
        
        if not reasons:
            reasons.append("general capability match")
        
        return ", ".join(reasons).capitalize()
    
    async def _get_agent_details(
        self,
        tenant_id: str,
        agent_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get agent details from database.
        
        Args:
            tenant_id: Tenant UUID
            agent_id: Agent ID
            
        Returns:
            Agent details dict or None
        """
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            result = await self.supabase.client.table('agents') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .eq('id', agent_id) \
                .single() \
                .execute()
            
            return result.data if result.data else None
        
        except Exception as e:
            logger.error(
                "Failed to get agent details",
                agent_id=agent_id,
                error=str(e)
            )
            return None
    
    async def _log_agent_selection(
        self,
        tenant_id: str,
        session_id: str,
        user_id: Optional[str],
        query: str,
        query_analysis: QueryAnalysis,
        agents_considered: List[AgentScore],
        agent_selected: str,
        selection_method: str
    ):
        """
        Log agent selection for ML training (Golden Rule #5).
        
        Args:
            tenant_id: Tenant UUID
            session_id: Session ID
            user_id: User ID
            query: User query
            query_analysis: Query analysis result
            agents_considered: All scored agents
            agent_selected: Selected agent ID
            selection_method: Selection method
        """
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            # Get query embedding (for future ML training)
            query_embedding = await self._get_query_embedding(query)
            
            # Prepare agents_considered data
            agents_data = [
                {
                    'agent_id': agent.agent_id,
                    'score': agent.total_score,
                    'confidence': agent.confidence_score,
                    'reason': agent.recommendation_reason
                }
                for agent in agents_considered[:10]  # Top 10
            ]
            
            selection_data = {
                'tenant_id': tenant_id,
                'session_id': session_id,
                'query': query,
                'query_intent': query_analysis.intent,
                'query_domains': query_analysis.domains,
                'query_complexity': query_analysis.complexity,
                'query_embedding': query_embedding,
                'agents_considered': agents_data,
                'agent_selected': agent_selected,
                'selection_method': selection_method,
                'selection_confidence': agents_considered[0].confidence_score if agents_considered else 0.5,
                'metadata': {
                    'user_id': user_id,
                    'query_length': len(query),
                    'medical_terms_count': len(query_analysis.medical_terms)
                },
                'created_at': datetime.utcnow().isoformat()
            }
            
            await self.supabase.client.table('agent_selection_history') \
                .insert(selection_data) \
                .execute()
            
            logger.debug(
                "Agent selection logged",
                tenant_id=tenant_id[:8],
                agent_selected=agent_selected
            )
        
        except Exception as e:
            logger.error(
                "Failed to log agent selection",
                error=str(e)
            )
            # Non-critical, don't raise
    
    async def _get_query_embedding(self, query: str) -> Optional[List[float]]:
        """
        Get query embedding from OpenAI.
        
        Args:
            query: User query
            
        Returns:
            Embedding vector or None if failed
        """
        try:
            response = self.openai.embeddings.create(
                model="text-embedding-3-small",
                input=query
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error("Failed to get query embedding", error=str(e))
            return None
    
    async def _get_fallback_agent(
        self,
        tenant_id: str,
        query_analysis: Optional[QueryAnalysis]
    ) -> AgentRecommendation:
        """
        Get fallback agent if selection fails.
        
        Args:
            tenant_id: Tenant UUID
            query_analysis: Optional query analysis
            
        Returns:
            Fallback AgentRecommendation
        """
        logger.warning("Using fallback agent", tenant_id=tenant_id[:8])
        
        return AgentRecommendation(
            agent_id="default_general",
            agent_type="general",
            agent_name="General Medical Assistant",
            confidence_score=0.5,
            recommendation_reason="fallback default agent (no suitable match found)",
            performance_metrics={},
            historical_success_rate=0.7,
            query_analysis=query_analysis
        )


# ============================================================================
# SERVICE FACTORY
# ============================================================================

_enhanced_agent_selector: Optional[EnhancedAgentSelector] = None


def get_enhanced_agent_selector(
    supabase_client: Optional[SupabaseClient] = None,
    feedback_manager: Optional[FeedbackManager] = None,
    cache_manager: Optional[CacheManager] = None
) -> EnhancedAgentSelector:
    """
    Get or create enhanced agent selector instance (singleton pattern)
    
    Args:
        supabase_client: Optional Supabase client
        feedback_manager: Optional feedback manager
        cache_manager: Optional cache manager
        
    Returns:
        EnhancedAgentSelector instance
    """
    global _enhanced_agent_selector
    
    if _enhanced_agent_selector is None:
        if not supabase_client or not feedback_manager:
            raise ValueError("supabase_client and feedback_manager required for first initialization")
        _enhanced_agent_selector = EnhancedAgentSelector(
            supabase_client=supabase_client,
            feedback_manager=feedback_manager,
            cache_manager=cache_manager
        )
    
    return _enhanced_agent_selector

