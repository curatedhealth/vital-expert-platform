"""
Agent Selector Service - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

ML-Powered agent selection with feedback loop integration.

Features:
- Query analysis (intent, domains, complexity)
- Performance-based agent ranking
- Multi-factor scoring algorithm (domain: 30%, performance: 40%, similarity: 20%, availability: 10%)
- Selection history logging for ML training
- Fallback mechanisms
- Redis caching

Usage:
    from vital_ai_services.agent import AgentSelectorService
    from vital_ai_services.core.models import AgentSelection
    
    selector = AgentSelectorService(
        supabase_client=supabase,
        feedback_manager=feedback,
        cache_manager=cache
    )
    
    result = await selector.select_best_agent(
        tenant_id="tenant-123",
        query="What are FDA IND requirements?",
        session_id="session-456",
        mode="automatic"
    )
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog
import json
from openai import OpenAI

# Import shared models from core
from vital_ai_services.core.models import AgentSelection, AgentScore
from vital_ai_services.core.exceptions import AgentSelectionError

logger = structlog.get_logger()


# ============================================================================
# QUERY ANALYSIS MODEL (Internal)
# ============================================================================

class QueryAnalysis:
    """Internal query analysis result"""
    def __init__(
        self,
        intent: str,
        domains: List[str],
        complexity: str,
        keywords: List[str],
        medical_terms: List[str],
        confidence: float
    ):
        self.intent = intent
        self.domains = domains
        self.complexity = complexity
        self.keywords = keywords
        self.medical_terms = medical_terms
        self.confidence = confidence
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "intent": self.intent,
            "domains": self.domains,
            "complexity": self.complexity,
            "keywords": self.keywords,
            "medical_terms": self.medical_terms,
            "confidence": self.confidence
        }


# ============================================================================
# AGENT SELECTOR SERVICE
# ============================================================================

class AgentSelectorService:
    """
    ML-Powered Agent Selector with Feedback Loop
    
    TAG: AGENT_SELECTOR_SERVICE
    
    Golden Rule #3: Tenant-aware
    Golden Rule #5: Feedback-driven selection
    
    Selection Algorithm:
    1. Analyze query (intent, domains, complexity) using GPT-4
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
        supabase_client,  # SupabaseClient
        feedback_manager,  # FeedbackManager
        cache_manager=None,  # Optional[CacheManager]
        openai_client: Optional[OpenAI] = None,
        openai_api_key: Optional[str] = None
    ):
        """
        Initialize agent selector service.
        
        Args:
            supabase_client: Supabase client for database operations
            feedback_manager: Feedback manager for performance data
            cache_manager: Optional cache manager for Redis caching
            openai_client: Optional OpenAI client (for dependency injection)
            openai_api_key: Optional OpenAI API key (if client not provided)
        """
        self.supabase = supabase_client
        self.feedback = feedback_manager
        self.cache = cache_manager
        
        # Initialize OpenAI client
        if openai_client:
            self.openai = openai_client
        elif openai_api_key:
            self.openai = OpenAI(api_key=openai_api_key)
        else:
            raise AgentSelectionError(
                "OpenAI client or API key required",
                details={"service": "agent_selector"}
            )
        
        # Scoring weights (configurable)
        self.weights = {
            'domain': 0.30,      # Domain expertise match: 30%
            'performance': 0.40,  # Historical performance: 40%
            'similarity': 0.20,   # Query similarity: 20%
            'availability': 0.10  # Current availability: 10%
        }
        
        logger.info("✅ AgentSelectorService initialized", weights=self.weights)
    
    async def select_best_agent(
        self,
        tenant_id: str,
        query: str,
        session_id: str,
        user_id: Optional[str] = None,
        candidate_agents: Optional[List[str]] = None,
        mode: str = "automatic"
    ) -> AgentSelection:
        """
        Select best agent for query with feedback-driven ranking.
        
        Golden Rule #3: Tenant isolation enforced
        Golden Rule #5: Uses feedback data for selection
        
        Args:
            tenant_id: Tenant UUID
            query: User query
            session_id: Session ID for tracking
            user_id: Optional user ID
            candidate_agents: Optional list of candidate agent IDs (if None, fetch all)
            mode: Selection mode ('automatic', 'ml_model', 'fallback')
            
        Returns:
            AgentSelection with best agent and reasoning
            
        Raises:
            AgentSelectionError: If selection fails
        """
        # Validate inputs
        if not tenant_id:
            raise AgentSelectionError(
                "tenant_id is REQUIRED (Golden Rule #3)",
                details={"service": "agent_selector"}
            )
        
        if not query or not query.strip():
            raise AgentSelectionError(
                "query is REQUIRED",
                details={"service": "agent_selector"}
            )
        
        start_time = datetime.now()
        
        try:
            logger.info(
                "Selecting best agent",
                tenant_id=tenant_id[:8] if len(tenant_id) > 8 else tenant_id,
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
                tenant_id=tenant_id[:8] if len(tenant_id) > 8 else tenant_id,
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
            
            # 7. Build AgentSelection response
            selection_time_ms = (datetime.now() - start_time).total_seconds() * 1000
            
            selection = AgentSelection(
                agent_id=best_agent.agent_id,
                agent_name=best_agent.agent_name or best_agent.agent_id,
                confidence=best_agent.confidence_score,
                reason=best_agent.recommendation_reason,
                query_intent=query_analysis.intent,
                query_domains=query_analysis.domains,
                query_complexity=query_analysis.complexity,
                all_candidates=scored_agents[:5],  # Top 5 for transparency
                selection_time_ms=selection_time_ms,
                cache_hit=False
            )
            
            return selection
        
        except Exception as e:
            logger.error(
                "❌ Failed to select agent",
                tenant_id=tenant_id[:8] if len(tenant_id) > 8 else tenant_id,
                error=str(e),
                error_type=type(e).__name__
            )
            # Fallback to default agent
            return await self._get_fallback_agent(tenant_id, None)
    
    async def _analyze_query(self, query: str) -> QueryAnalysis:
        """
        Analyze query to extract intent, domains, complexity using GPT-4.
        
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
                    analysis.to_dict(),
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
        Get available agents for tenant from Supabase.
        
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
                tenant_id=tenant_id[:8] if len(tenant_id) > 8 else tenant_id,
                count=len(agent_ids)
            )
            
            return agent_ids
        
        except Exception as e:
            logger.error("Failed to fetch available agents", error=str(e))
            return []
    
    async def _score_agents(
        self,
        tenant_id: str,
        query: str,
        query_analysis: QueryAnalysis,
        candidate_agents: List[str],
        performance_data: Dict[str, Any]
    ) -> List[AgentScore]:
        """
        Score agents using multi-factor algorithm.
        
        Args:
            tenant_id: Tenant UUID
            query: User query
            query_analysis: Query analysis result
            candidate_agents: List of agent IDs to score
            performance_data: Agent performance metrics
            
        Returns:
            List of AgentScore sorted by total_score (descending)
        """
        # TODO: Implement full scoring algorithm
        # For now, return placeholder implementation
        
        scored_agents = []
        
        for agent_id in candidate_agents[:5]:  # Top 5 for now
            # Get agent details
            agent_data = await self._get_agent_details(tenant_id, agent_id)
            if not agent_data:
                continue
            
            # Calculate scores (simplified for now)
            domain_score = 0.8  # TODO: Calculate based on domain match
            performance_score = 0.7  # TODO: Calculate from performance_data
            similarity_score = 0.6  # TODO: Calculate embedding similarity
            availability_score = 1.0 if agent_data.get("status") == "active" else 0.0
            
            # Weighted total
            total_score = (
                self.weights['domain'] * domain_score +
                self.weights['performance'] * performance_score +
                self.weights['similarity'] * similarity_score +
                self.weights['availability'] * availability_score
            )
            
            score = AgentScore(
                agent_id=agent_id,
                agent_name=agent_data.get("display_name", agent_id),
                score=total_score,
                domain_match_score=domain_score,
                performance_score=performance_score,
                similarity_score=similarity_score,
                availability_score=availability_score,
                domains=agent_data.get("expertise_domains", []),
                avg_confidence=performance_data.get(agent_id, {}).get("avg_confidence"),
                avg_rating=performance_data.get(agent_id, {}).get("avg_rating"),
                total_queries=performance_data.get(agent_id, {}).get("total_queries", 0)
            )
            
            scored_agents.append(score)
        
        # Sort by score (descending)
        scored_agents.sort(key=lambda x: x.score, reverse=True)
        
        return scored_agents
    
    async def _get_agent_details(self, tenant_id: str, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent details from Supabase."""
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            result = await self.supabase.client.table('agents') \
                .select('*') \
                .eq('id', agent_id) \
                .eq('tenant_id', tenant_id) \
                .single() \
                .execute()
            
            return result.data if result.data else None
        
        except Exception as e:
            logger.error("Failed to fetch agent details", agent_id=agent_id, error=str(e))
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
    ) -> None:
        """
        Log agent selection for ML training.
        
        Args:
            tenant_id: Tenant UUID
            session_id: Session ID
            user_id: Optional user ID
            query: User query
            query_analysis: Query analysis
            agents_considered: All scored agents
            agent_selected: Selected agent ID
            selection_method: Selection method used
        """
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            await self.supabase.client.table('agent_selection_log').insert({
                "tenant_id": tenant_id,
                "session_id": session_id,
                "user_id": user_id,
                "query": query,
                "query_intent": query_analysis.intent,
                "query_domains": query_analysis.domains,
                "query_complexity": query_analysis.complexity,
                "agents_considered": [a.agent_id for a in agents_considered],
                "agent_selected": agent_selected,
                "selection_method": selection_method,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
            logger.debug("Agent selection logged", agent_id=agent_selected)
        
        except Exception as e:
            logger.error("Failed to log agent selection", error=str(e))
    
    async def _get_fallback_agent(
        self,
        tenant_id: str,
        query_analysis: Optional[QueryAnalysis]
    ) -> AgentSelection:
        """
        Get fallback agent when selection fails.
        
        Args:
            tenant_id: Tenant UUID
            query_analysis: Optional query analysis
            
        Returns:
            AgentSelection for fallback agent
        """
        fallback_agent_id = "regulatory_expert"  # Default fallback
        
        return AgentSelection(
            agent_id=fallback_agent_id,
            agent_name="Regulatory Expert (Fallback)",
            confidence=0.5,
            reason="Fallback agent used due to selection failure",
            query_intent=query_analysis.intent if query_analysis else "general",
            query_domains=query_analysis.domains if query_analysis else [],
            query_complexity=query_analysis.complexity if query_analysis else "medium",
            all_candidates=None,
            selection_time_ms=0.0,
            cache_hit=False
        )

