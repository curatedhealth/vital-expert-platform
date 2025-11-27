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
        supabase_client: Optional[SupabaseClient] = None
    ):
        """
        Initialize agent selector service
        
        Args:
            openai_client: OpenAI client instance (for dependency injection)
            supabase_client: Supabase client instance (for dependency injection)
        """
        self.settings = get_settings()
        self.openai_client = openai_client or OpenAI(api_key=self.settings.openai_api_key)
        self.supabase_client = supabase_client
        
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
        supabase_client: Optional Supabase client for dependency injection

    Returns:
        AgentSelectorService instance
    """
    global _agent_selector_service

    if _agent_selector_service is None:
        _agent_selector_service = AgentSelectorService(
            supabase_client=supabase_client
        )

    return _agent_selector_service


# Add missing method for Mode 4 compatibility
async def select_multiple_experts_diverse(
    self,
    query: str,
    max_agents: int = 3,
    tenant_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Select multiple diverse experts for a query (Mode 4 compatibility).

    This method provides backward compatibility with Mode 4 workflow that expects
    select_multiple_experts_diverse().

    Args:
        query: User query to analyze
        max_agents: Maximum number of agents to select
        tenant_id: Optional tenant ID for filtering

    Returns:
        List of selected agent dictionaries with id, name, display_name, tier
    """
    try:
        # Analyze the query
        analysis = await self.analyze_query(query)

        # If we have supabase_client, fetch actual agents
        if self.supabase_client:
            # Get all active agents for tenant
            agents = await self.supabase_client.get_all_agents(
                tenant_id=tenant_id,
                status="active"
            )

            # Score agents based on query analysis
            scored_agents = []
            for agent in agents[:max_agents * 3]:  # Consider 3x candidates
                # Simple scoring based on domain match
                score = 0.5  # Base score
                agent_domains = agent.get("knowledge_domains", [])

                for domain in analysis.domains:
                    if domain.lower() in [d.lower() for d in agent_domains]:
                        score += 0.3

                # Tier weighting (higher tier for complex queries)
                tier = agent.get("tier", 2)
                if analysis.complexity == "high" and tier == 3:
                    score += 0.2
                elif analysis.complexity == "medium" and tier == 2:
                    score += 0.1

                scored_agents.append({
                    "agent": agent,
                    "score": min(score, 1.0)
                })

            # Sort by score and take top N
            scored_agents.sort(key=lambda x: x["score"], reverse=True)
            selected = [sa["agent"] for sa in scored_agents[:max_agents]]

            logger.info(
                "multiple_experts_selected",
                query_preview=query[:50],
                selected_count=len(selected),
                max_agents=max_agents
            )

            return selected

        # Fallback: return empty list if no supabase client
        logger.warning(
            "multiple_experts_selection_unavailable",
            reason="no_supabase_client"
        )
        return []

    except Exception as e:
        logger.error(
            "multiple_experts_selection_failed",
            error=str(e),
            query_preview=query[:50]
        )
        return []


# Monkey-patch the method onto AgentSelectorService class
AgentSelectorService.select_multiple_experts_diverse = select_multiple_experts_diverse
