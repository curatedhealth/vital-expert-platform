"""
Agent Selector Service for VITAL Path
Enterprise-grade agent selection with query analysis and intelligent matching

This service provides:
- Query analysis using LLM (intent, domains, complexity, keywords)
- Agent matching using embeddings and domain filtering
- Multi-criteria ranking (similarity, domain, tier, capabilities)
- Comprehensive error handling and observability

Following industry best practices:
- SOLID principles (Single Responsibility, Dependency Inversion)
- Clean Architecture with proper abstractions
- Structured logging and metrics
- Type safety with Pydantic models
- Error classification and handling
"""

import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog
from openai import OpenAI
from pydantic import BaseModel, Field

from core.config import get_settings
from services.supabase_client import SupabaseClient
from services.graphrag_selector import GraphRAGSelector, get_graphrag_selector

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class QueryAnalysisRequest(BaseModel):
    """Request model for query analysis"""
    query: str = Field(..., min_length=1, max_length=2000, description="User query to analyze")
    user_id: Optional[str] = Field(None, description="User identifier for context")
    tenant_id: Optional[str] = Field(None, description="Tenant/organization identifier")
    correlation_id: Optional[str] = Field(None, description="Correlation ID for tracing")


class QueryAnalysisResponse(BaseModel):
    """Response model for query analysis"""
    intent: str = Field(..., description="Primary intent (diagnosis, treatment, research, consultation, education, etc.)")
    domains: List[str] = Field(..., description="Array of medical domains (cardiology, oncology, neurology, etc.)")
    complexity: str = Field(..., description="Complexity level (low, medium, high)")
    keywords: List[str] = Field(..., description="Key medical terms and concepts")
    medical_terms: List[str] = Field(..., description="Specific medical terminology")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1) in the analysis")
    correlation_id: Optional[str] = Field(None, description="Correlation ID for tracing")


class AgentSelectionRequest(BaseModel):
    """Request model for complete agent selection"""
    query: str = Field(..., min_length=1, max_length=2000, description="User query")
    user_id: Optional[str] = Field(None, description="User identifier")
    tenant_id: Optional[str] = Field(None, description="Tenant/organization identifier")
    correlation_id: Optional[str] = Field(None, description="Correlation ID for tracing")
    max_candidates: int = Field(10, ge=1, le=50, description="Maximum candidate agents to consider")


# ============================================================================
# AGENT SELECTOR SERVICE
# ============================================================================

class AgentSelectorService:
    """
    Enterprise-grade agent selector service
    
    Features:
    - LLM-powered query analysis
    - Embedding-based agent matching
    - Multi-criteria ranking
    - Comprehensive error handling
    - Structured logging and metrics
    """
    
    def __init__(
        self,
        openai_client: Optional[OpenAI] = None,
        supabase_client: Optional[SupabaseClient] = None,
        graphrag_selector: Optional[GraphRAGSelector] = None,
        use_graphrag: bool = True
    ):
        """
        Initialize agent selector service

        Args:
            openai_client: OpenAI client instance (for dependency injection)
            supabase_client: Supabase client instance (for dependency injection)
            graphrag_selector: GraphRAG selector for 3-method hybrid selection
            use_graphrag: Enable GraphRAG hybrid selection (default True)
        """
        self.settings = get_settings()
        self.openai_client = openai_client or OpenAI(api_key=self.settings.openai_api_key)
        self.supabase_client = supabase_client
        self.use_graphrag = use_graphrag
        # Pass supabase_client to GraphRAGSelector to ensure it has a properly initialized DB client
        self.graphrag_selector = graphrag_selector or (get_graphrag_selector(supabase_client=supabase_client) if use_graphrag else None)
        
    async def analyze_query(
        self,
        query: str,
        correlation_id: Optional[str] = None
    ) -> QueryAnalysisResponse:
        """
        Analyze query to extract intent, domains, complexity, and keywords
        
        Uses OpenAI GPT-4 for structured query analysis following medical/healthcare context.
        
        Args:
            query: User query text
            correlation_id: Optional correlation ID for tracing
            
        Returns:
            QueryAnalysisResponse with extracted metadata
            
        Raises:
            ValueError: If query is invalid
            Exception: If LLM analysis fails (with fallback)
        """
        operation_id = f"analysis_{datetime.now().timestamp()}_{hash(query) % 10000}"
        start_time = datetime.now()
        
        logger.info(
            "query_analysis_started",
            operation="analyzeQuery",
            operation_id=operation_id,
            correlation_id=correlation_id,
            query_length=len(query),
            query_preview=query[:100]
        )
        
        try:
            # Validate input
            if not query or not query.strip():
                raise ValueError("Query cannot be empty")
            
            # Prepare system prompt for structured analysis
            system_prompt = """You are a medical/healthcare query analysis assistant. 
Analyze queries and extract structured information about intent, medical domains, complexity, and key terms.

Return a JSON object with:
- intent: Primary intent (diagnosis, treatment, research, consultation, education, regulation, compliance, etc.)
- domains: Array of medical domains (cardiology, oncology, neurology, immunology, etc.)
- complexity: Complexity level (low, medium, high)
- keywords: Key medical terms and concepts (array of strings)
- medicalTerms: Specific medical terminology found in the query (array of strings)
- confidence: Confidence score (0-1) in your analysis

Focus on medical/healthcare context. If not medical, still analyze for general intent.
Be precise with domain classification and keyword extraction."""

            # Call OpenAI API
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=500,
                timeout=30.0  # 30 second timeout
            )
            
            # Parse response
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from LLM")
            
            analysis_data = json.loads(content)
            
            # Build response with validation
            analysis = QueryAnalysisResponse(
                intent=analysis_data.get("intent", "general"),
                domains=analysis_data.get("domains", []),
                complexity=analysis_data.get("complexity", "medium"),
                keywords=analysis_data.get("keywords", []),
                medical_terms=analysis_data.get("medicalTerms", []),
                confidence=min(max(float(analysis_data.get("confidence", 0.7)), 0.0), 1.0),
                correlation_id=correlation_id
            )
            
            # Log success with metrics
            duration_ms = (datetime.now() - start_time).total_seconds() * 1000
            logger.info(
                "query_analysis_completed",
                operation="analyzeQuery",
                operation_id=operation_id,
                correlation_id=correlation_id,
                intent=analysis.intent,
                domains=analysis.domains,
                complexity=analysis.complexity,
                confidence=analysis.confidence,
                duration_ms=duration_ms,
                token_usage={
                    "prompt_tokens": response.usage.prompt_tokens if hasattr(response, 'usage') else 0,
                    "completion_tokens": response.usage.completion_tokens if hasattr(response, 'usage') else 0,
                    "total_tokens": response.usage.total_tokens if hasattr(response, 'usage') else 0
                }
            )
            
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(
                "query_analysis_json_parse_failed",
                operation="analyzeQuery",
                operation_id=operation_id,
                correlation_id=correlation_id,
                error=str(e),
                content_preview=content[:200] if 'content' in locals() else None
            )
            # Fallback to basic analysis
            return self._fallback_analysis(query, correlation_id)
            
        except Exception as e:
            duration_ms = (datetime.now() - start_time).total_seconds() * 1000
            logger.error(
                "query_analysis_failed",
                operation="analyzeQuery",
                operation_id=operation_id,
                correlation_id=correlation_id,
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=duration_ms
            )
            # Fallback to basic analysis
            return self._fallback_analysis(query, correlation_id)
    
    def _fallback_analysis(
        self,
        query: str,
        correlation_id: Optional[str] = None
    ) -> QueryAnalysisResponse:
        """
        Fallback analysis when LLM call fails
        
        Provides basic analysis using keyword extraction and pattern matching.
        
        Args:
            query: User query text
            correlation_id: Optional correlation ID
            
        Returns:
            QueryAnalysisResponse with fallback values
        """
        logger.warn(
            "using_fallback_analysis",
            correlation_id=correlation_id,
            query_preview=query[:100]
        )
        
        # Basic keyword extraction
        keywords = [
            word.lower() 
            for word in query.split() 
            if len(word) > 3 and word.isalnum()
        ][:10]
        
        # Simple domain detection from keywords
        medical_keywords = {
            'cardiology': ['heart', 'cardiac', 'cardiovascular', 'ecg', 'echocardiography'],
            'oncology': ['cancer', 'tumor', 'oncology', 'chemotherapy', 'radiation'],
            'neurology': ['brain', 'neurological', 'stroke', 'epilepsy', 'dementia'],
            'immunology': ['immune', 'allergy', 'immunotherapy', 'autoimmune'],
            'endocrinology': ['diabetes', 'thyroid', 'hormone', 'metabolic'],
        }
        
        detected_domains = []
        for domain, domain_keywords in medical_keywords.items():
            if any(keyword in query.lower() for keyword in domain_keywords):
                detected_domains.append(domain)
        
        # Determine intent from keywords
        intent_keywords = {
            'diagnosis': ['diagnose', 'symptom', 'sign', 'condition', 'disease'],
            'treatment': ['treat', 'therapy', 'medication', 'intervention', 'cure'],
            'research': ['study', 'trial', 'research', 'evidence', 'publication'],
            'consultation': ['advice', 'recommendation', 'consult', 'opinion'],
            'education': ['learn', 'understand', 'explain', 'information', 'guide'],
            'regulation': ['fda', 'ema', 'regulatory', 'compliance', 'guideline'],
        }
        
        detected_intent = 'general'
        for intent, intent_keywords_list in intent_keywords.items():
            if any(keyword in query.lower() for keyword in intent_keywords_list):
                detected_intent = intent
                break
        
        return QueryAnalysisResponse(
            intent=detected_intent,
            domains=detected_domains[:3] if detected_domains else [],
            complexity='medium',
            keywords=keywords[:5],
            medical_terms=keywords[:3],
            confidence=0.5,
            correlation_id=correlation_id
        )

    async def select_agents_hybrid(
        self,
        query: str,
        tenant_id: str,
        mode: str = "mode2",
        max_agents: int = 3,
        min_confidence: float = 0.70,
        correlation_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Select agents using GraphRAG 3-method hybrid search.

        This is the primary agent selection method that uses:
        - PostgreSQL full-text search (30% weight)
        - Pinecone vector search (50% weight)
        - Neo4j graph traversal (20% weight)

        Combined using weighted Reciprocal Rank Fusion (RRF).

        Args:
            query: User query text
            tenant_id: Tenant identifier for multi-tenant isolation
            mode: Ask Expert mode (mode1-mode4)
            max_agents: Maximum number of agents to return
            min_confidence: Minimum confidence threshold
            correlation_id: Optional correlation ID for tracing

        Returns:
            List of selected agents with confidence scores
        """
        logger.info(
            "hybrid_agent_selection_started",
            query_preview=query[:100],
            tenant_id=tenant_id,
            mode=mode,
            max_agents=max_agents,
            use_graphrag=self.use_graphrag,
            correlation_id=correlation_id
        )

        # Use GraphRAG if enabled and available
        if self.use_graphrag and self.graphrag_selector:
            try:
                agents = await self.graphrag_selector.select_agents(
                    query=query,
                    tenant_id=tenant_id,
                    mode=mode,
                    max_agents=max_agents,
                    min_confidence=min_confidence
                )

                logger.info(
                    "hybrid_agent_selection_completed",
                    method="graphrag",
                    agents_selected=len(agents),
                    correlation_id=correlation_id
                )

                return agents

            except Exception as e:
                logger.error(
                    "graphrag_selection_failed_fallback",
                    error=str(e),
                    error_type=type(e).__name__,
                    correlation_id=correlation_id
                )
                # Fall through to legacy method

        # Fallback to legacy embedding-based selection
        return await self._select_agents_legacy(
            query=query,
            tenant_id=tenant_id,
            max_agents=max_agents,
            correlation_id=correlation_id
        )

    async def _select_agents_legacy(
        self,
        query: str,
        tenant_id: str,
        max_agents: int = 3,
        correlation_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Legacy agent selection using query analysis and simple scoring.
        Used as fallback when GraphRAG is unavailable.
        """
        # Analyze the query
        analysis = await self.analyze_query(query, correlation_id)

        if not self.supabase_client:
            logger.warning(
                "legacy_selection_unavailable",
                reason="no_supabase_client",
                correlation_id=correlation_id
            )
            return []

        # Get active agents for tenant - CRITICAL: Use limit to prevent fetching 100+ agents
        # Fetch 3x max_agents to have enough candidates for scoring
        candidate_limit = max_agents * 3
        agents = await self.supabase_client.get_all_agents(
            tenant_id=tenant_id,
            status="active",
            limit=candidate_limit
        )

        # Score agents based on query analysis
        scored_agents = []
        for agent in agents:
            score = 0.5  # Base score
            agent_domains = agent.get("knowledge_domains", [])

            # Domain match scoring
            for domain in analysis.domains:
                if domain.lower() in [d.lower() for d in agent_domains]:
                    score += 0.3

            # Tier weighting
            tier = agent.get("tier", 2)
            if analysis.complexity == "high" and tier == 3:
                score += 0.2
            elif analysis.complexity == "medium" and tier == 2:
                score += 0.1

            scored_agents.append({
                **agent,
                "fused_score": min(score, 1.0),
                "confidence": {
                    "overall": min(score * 100, 95),
                    "methods_found": 1,
                    "breakdown": {"legacy": score * 100}
                }
            })

        # Sort by score and return top-k
        scored_agents.sort(key=lambda x: x["fused_score"], reverse=True)

        logger.info(
            "legacy_agent_selection_completed",
            agents_selected=len(scored_agents[:max_agents]),
            correlation_id=correlation_id
        )

        return scored_agents[:max_agents]

    async def select_multiple_experts_diverse(
        self,
        query: str,
        max_agents: int = 3,
        tenant_id: Optional[str] = None,
        mode: str = "mode4"
    ) -> List[Dict[str, Any]]:
        """
        Select multiple diverse experts for a query (Mode 4 compatibility).

        Uses GraphRAG hybrid selection if available, otherwise falls back
        to legacy selection.

        Args:
            query: User query to analyze
            max_agents: Maximum number of agents to select
            tenant_id: Optional tenant ID for filtering
            mode: Ask Expert mode (default mode4)

        Returns:
            List of selected agent dictionaries
        """
        if not tenant_id:
            tenant_id = self.settings.default_tenant_id if hasattr(self.settings, 'default_tenant_id') else "platform"

        return await self.select_agents_hybrid(
            query=query,
            tenant_id=tenant_id,
            mode=mode,
            max_agents=max_agents,
            min_confidence=0.60  # Lower threshold for Mode 4 diversity
        )


# ============================================================================
# SERVICE FACTORY
# ============================================================================

_agent_selector_service: Optional[AgentSelectorService] = None


def get_agent_selector_service(
    supabase_client: Optional[SupabaseClient] = None
) -> AgentSelectorService:
    """
    Get or create agent selector service instance (singleton pattern)

    Args:
        supabase_client: Optional Supabase client for dependency injection.
                        If provided and the singleton exists without a client,
                        the client will be injected.

    Returns:
        AgentSelectorService instance
    """
    global _agent_selector_service

    if _agent_selector_service is None:
        _agent_selector_service = AgentSelectorService(
            supabase_client=supabase_client
        )
    elif supabase_client is not None and _agent_selector_service.supabase_client is None:
        # Inject supabase_client if the singleton was created without one
        _agent_selector_service.supabase_client = supabase_client
        # Also update the graphrag_selector if it exists
        if _agent_selector_service.graphrag_selector:
            _agent_selector_service.graphrag_selector.supabase = supabase_client

    return _agent_selector_service


def reset_agent_selector_service():
    """Reset the singleton for testing purposes."""
    global _agent_selector_service
    _agent_selector_service = None
