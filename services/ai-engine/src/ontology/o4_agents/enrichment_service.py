"""
Agent Enrichment Service
Automatically captures and enriches agent knowledge from tool outputs and feedback

Golden Rule #4: Automatically save tool outputs to knowledge base
Golden Rule #5: Learn from user feedback

Features:
- Auto-save tool outputs (web search, API calls, etc.)
- Extract knowledge from user feedback
- Structured knowledge storage
- Verification workflow
- Usage tracking
- Quality scoring

Usage:
    >>> enrichment = AgentEnrichmentService(supabase_client)
    >>> await enrichment.enrich_from_tool_output(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     agent_id="agent_regulatory",
    ...     query="What are FDA requirements?",
    ...     tool_name="web_search",
    ...     tool_output="FDA requires IND submission..."
    ... )
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import structlog
from pydantic import BaseModel, Field
from openai import OpenAI

from services.supabase_client import SupabaseClient
from services.cache_manager import CacheManager
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# LLM MODEL SELECTION
# ============================================================================

class LLMModel(str, Enum):
    """Available LLM models"""
    GPT4_TURBO = "gpt-4-turbo-preview"
    GPT4 = "gpt-4"
    GPT35_TURBO = "gpt-3.5-turbo"
    GPT4_MINI = "gpt-4o-mini"
    CLAUDE_OPUS = "claude-3-opus"
    CLAUDE_SONNET = "claude-3-sonnet"
    
class ModelSelector:
    """
    Intelligent LLM model selection based on content and domain.
    
    Selection Criteria:
    - Content complexity (simple, moderate, complex)
    - Domain type (medical, regulatory, technical, general)
    - Task type (extraction, analysis, generation)
    - Cost vs Quality tradeoff
    """
    
    # Model capabilities and costs (relative scale)
    MODEL_PROFILES = {
        LLMModel.GPT4_TURBO: {
            "capability": 10,
            "cost": 10,
            "speed": 6,
            "best_for": ["complex_medical", "regulatory", "research"]
        },
        LLMModel.GPT4: {
            "capability": 10,
            "cost": 15,
            "speed": 5,
            "best_for": ["complex_medical", "regulatory"]
        },
        LLMModel.GPT35_TURBO: {
            "capability": 7,
            "cost": 1,
            "speed": 10,
            "best_for": ["general", "simple_extraction"]
        },
        LLMModel.GPT4_MINI: {
            "capability": 8,
            "cost": 2,
            "speed": 9,
            "best_for": ["moderate_medical", "general_extraction"]
        }
    }
    
    @staticmethod
    def select_model(
        content_type: str,
        domain: Optional[str] = None,
        complexity: Optional[str] = "moderate",
        task_type: str = "extraction",
        prefer_cost: bool = False
    ) -> str:
        """
        Select best LLM model based on content and context.
        
        Args:
            content_type: Type of content (fact, procedure, guideline, etc.)
            domain: Domain type (medical, regulatory, technical, general)
            complexity: Content complexity (simple, moderate, complex)
            task_type: Task type (extraction, analysis, generation)
            prefer_cost: Whether to prefer cost over quality
            
        Returns:
            Selected model name
        """
        # High complexity or critical domains → GPT-4 Turbo
        if complexity == "complex" or domain in ["medical", "regulatory", "clinical"]:
            if content_type in ["regulation", "guideline", "procedure"]:
                logger.debug("Selected GPT-4 Turbo for complex/critical content")
                return LLMModel.GPT4_TURBO
        
        # Moderate complexity with medical/technical domain → GPT-4 Mini
        if complexity == "moderate" and domain in ["medical", "technical"]:
            logger.debug("Selected GPT-4 Mini for moderate medical content")
            return LLMModel.GPT4_MINI
        
        # Simple extraction or general domain → GPT-3.5 Turbo (cost-effective)
        if complexity == "simple" or domain == "general" or prefer_cost:
            logger.debug("Selected GPT-3.5 Turbo for simple/general content")
            return LLMModel.GPT35_TURBO
        
        # Default: GPT-4 Mini (good balance)
        logger.debug("Selected GPT-4 Mini as default")
        return LLMModel.GPT4_MINI
    
    @staticmethod
    def get_model_config(model: str) -> Dict[str, Any]:
        """
        Get configuration for selected model.
        
        Args:
            model: Model name
            
        Returns:
            Model configuration (temperature, max_tokens, timeout)
        """
        base_config = {
            "temperature": 0.3,
            "max_tokens": 600,
            "timeout": 30.0
        }
        
        # Adjust based on model
        if model in [LLMModel.GPT4_TURBO, LLMModel.GPT4]:
            base_config["max_tokens"] = 800  # More tokens for complex models
            base_config["timeout"] = 60.0     # More time for complex models
        elif model == LLMModel.GPT35_TURBO:
            base_config["max_tokens"] = 500  # Fewer tokens for simple tasks
            base_config["timeout"] = 20.0     # Faster timeout
        
        return base_config


# ============================================================================
# ENUMS
# ============================================================================

class SourceType(str):
    """Knowledge source type"""
    FEEDBACK = "feedback"
    TOOL_RESULT = "tool_result"
    WEB_SEARCH = "web_search"
    MANUAL = "manual"
    RAG_MISS = "rag_miss"


class ContentType(str):
    """Knowledge content type"""
    FACT = "fact"
    PROCEDURE = "procedure"
    GUIDELINE = "guideline"
    CASE_STUDY = "case_study"
    DEFINITION = "definition"
    REGULATION = "regulation"


# ============================================================================
# MODELS
# ============================================================================

class KnowledgeEnrichmentRequest(BaseModel):
    """Knowledge enrichment request"""
    tenant_id: str = Field(..., description="Tenant UUID")
    agent_id: str = Field(..., description="Agent ID")
    source_type: str = Field(..., description="Source type")
    source_query: str = Field(..., description="Original query")
    content: str = Field(..., max_length=5000, description="Knowledge content")
    content_type: str = Field(..., description="Content type")
    session_id: Optional[str] = Field(None, description="Session ID")
    turn_id: Optional[str] = Field(None, description="Turn ID")
    confidence: Optional[float] = Field(0.8, ge=0.0, le=1.0, description="Confidence score")


class ExtractedKnowledge(BaseModel):
    """Extracted knowledge from text"""
    content: str
    content_type: str
    entities: Dict[str, List[str]]
    relevance_score: float
    confidence: float
    key_terms: List[str]


class EnrichmentResult(BaseModel):
    """Knowledge enrichment result"""
    enrichment_id: str
    status: str
    content_type: str
    confidence: float
    entities_extracted: int
    message: str


# ============================================================================
# AGENT ENRICHMENT SERVICE
# ============================================================================

class AgentEnrichmentService:
    """
    Agent Knowledge Enrichment Service
    
    Golden Rule #3: Tenant-aware
    Golden Rule #4: Auto-save tool outputs
    Golden Rule #5: Learn from feedback
    
    Features:
    - Auto-capture knowledge from tool outputs
    - Extract structured knowledge from text
    - Store with entity extraction
    - Track usage and effectiveness
    - Verification workflow
    - Quality scoring
    
    Responsibilities:
    - Enrich agent knowledge from tools
    - Extract knowledge from feedback
    - Validate and verify knowledge
    - Track knowledge usage
    - Measure knowledge effectiveness
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None,
        openai_client: Optional[OpenAI] = None
    ):
        """
        Initialize agent enrichment service.
        
        Args:
            supabase_client: Supabase client for database access
            cache_manager: Optional cache manager
            openai_client: Optional OpenAI client
        """
        self.supabase = supabase_client
        self.cache = cache_manager
        self.openai = openai_client or OpenAI(api_key=settings.openai_api_key)
        
        logger.info("✅ AgentEnrichmentService initialized")
    
    async def enrich_from_tool_output(
        self,
        tenant_id: str,
        agent_id: str,
        query: str,
        tool_name: str,
        tool_output: str,
        session_id: Optional[str] = None,
        turn_id: Optional[str] = None
    ) -> EnrichmentResult:
        """
        Enrich agent knowledge from tool output (Golden Rule #4).
        
        Automatically saves retrieved content to knowledge base.
        
        Args:
            tenant_id: Tenant UUID
            agent_id: Agent ID
            query: Original query
            tool_name: Tool used (e.g., 'web_search', 'api_call')
            tool_output: Tool output content
            session_id: Optional session ID
            turn_id: Optional turn ID
            
        Returns:
            EnrichmentResult with status and details
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            logger.info(
                "Enriching from tool output",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                tool_name=tool_name,
                output_length=len(tool_output)
            )
            
            # Extract structured knowledge from tool output
            extracted = await self._extract_knowledge_from_text(
                tool_output,
                query
            )
            
            if not extracted or extracted.relevance_score < 0.6:
                logger.debug(
                    "Tool output not relevant enough for enrichment",
                    relevance_score=extracted.relevance_score if extracted else 0
                )
                return EnrichmentResult(
                    enrichment_id="",
                    status="skipped",
                    content_type="",
                    confidence=0.0,
                    entities_extracted=0,
                    message="Content not relevant enough for enrichment"
                )
            
            # Store enriched knowledge
            enrichment_request = KnowledgeEnrichmentRequest(
                tenant_id=tenant_id,
                agent_id=agent_id,
                source_type=SourceType.TOOL_RESULT if tool_name != 'web_search' else SourceType.WEB_SEARCH,
                source_query=query,
                content=extracted.content,
                content_type=extracted.content_type,
                session_id=session_id,
                turn_id=turn_id,
                confidence=extracted.confidence
            )
            
            result = await self.store_enriched_knowledge(enrichment_request, extracted.entities)
            
            logger.info(
                "✅ Tool output enrichment completed",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                tool_name=tool_name,
                enrichment_id=result.enrichment_id
            )
            
            return result
        
        except Exception as e:
            logger.error(
                "❌ Failed to enrich from tool output",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                tool_name=tool_name,
                error=str(e),
                error_type=type(e).__name__
            )
            return EnrichmentResult(
                enrichment_id="",
                status="failed",
                content_type="",
                confidence=0.0,
                entities_extracted=0,
                message=f"Enrichment failed: {str(e)}"
            )
    
    async def enrich_from_feedback(
        self,
        tenant_id: str,
        agent_id: str,
        query: str,
        user_feedback: str,
        feedback_type: str,
        session_id: Optional[str] = None
    ) -> EnrichmentResult:
        """
        Enrich agent knowledge from user feedback (Golden Rule #5).
        
        Learns from user corrections and suggestions.
        
        Args:
            tenant_id: Tenant UUID
            agent_id: Agent ID
            query: Original query
            user_feedback: User's feedback text
            feedback_type: Type of feedback ('incorrect', 'incomplete', etc.)
            session_id: Optional session ID
            
        Returns:
            EnrichmentResult with status and details
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            logger.info(
                "Enriching from user feedback",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                feedback_type=feedback_type
            )
            
            # Only enrich from actionable feedback types
            if feedback_type not in ['incorrect', 'incomplete']:
                logger.debug("Feedback type not actionable for enrichment")
                return EnrichmentResult(
                    enrichment_id="",
                    status="skipped",
                    content_type="",
                    confidence=0.0,
                    entities_extracted=0,
                    message="Feedback type not actionable"
                )
            
            # Extract knowledge from feedback
            extracted = await self._extract_knowledge_from_text(
                user_feedback,
                query
            )
            
            if not extracted or extracted.relevance_score < 0.7:
                logger.debug("Feedback not relevant enough for enrichment")
                return EnrichmentResult(
                    enrichment_id="",
                    status="skipped",
                    content_type="",
                    confidence=0.0,
                    entities_extracted=0,
                    message="Feedback not relevant enough"
                )
            
            # Store enriched knowledge with lower initial confidence
            # (requires verification since it comes from user feedback)
            enrichment_request = KnowledgeEnrichmentRequest(
                tenant_id=tenant_id,
                agent_id=agent_id,
                source_type=SourceType.FEEDBACK,
                source_query=query,
                content=extracted.content,
                content_type=extracted.content_type,
                session_id=session_id,
                confidence=extracted.confidence * 0.8  # Lower confidence for user feedback
            )
            
            result = await self.store_enriched_knowledge(enrichment_request, extracted.entities)
            
            logger.info(
                "✅ Feedback enrichment completed",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                enrichment_id=result.enrichment_id
            )
            
            return result
        
        except Exception as e:
            logger.error(
                "❌ Failed to enrich from feedback",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                error=str(e)
            )
            return EnrichmentResult(
                enrichment_id="",
                status="failed",
                content_type="",
                confidence=0.0,
                entities_extracted=0,
                message=f"Enrichment failed: {str(e)}"
            )
    
    async def store_enriched_knowledge(
        self,
        request: KnowledgeEnrichmentRequest,
        entities: Optional[Dict[str, List[str]]] = None
    ) -> EnrichmentResult:
        """
        Store enriched knowledge in database.
        
        Golden Rule #3: Tenant isolation enforced
        
        Args:
            request: Enrichment request data
            entities: Optional extracted entities
            
        Returns:
            EnrichmentResult with status
        """
        try:
            # Ensure tenant context
            await self.supabase.set_tenant_context(request.tenant_id)
            
            # Prepare enrichment data
            enrichment_data = {
                'tenant_id': request.tenant_id,
                'agent_id': request.agent_id,
                'source_type': request.source_type,
                'source_query': request.source_query,
                'source_session_id': request.session_id,
                'source_turn_id': request.turn_id,
                'content': request.content,
                'content_type': request.content_type,
                'extracted_entities': entities or {},
                'confidence': request.confidence,
                'relevance_score': None,  # Can be updated later
                'verified': False,  # Requires manual verification
                'times_referenced': 0,
                'effectiveness_score': None,  # Calculated based on usage
                'metadata': {
                    'created_from': 'auto_enrichment',
                    'content_length': len(request.content)
                },
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Insert enrichment
            result = await self.supabase.client.table('agent_knowledge_enrichment') \
                .insert(enrichment_data) \
                .execute()
            
            if not result.data:
                raise Exception("Failed to insert enrichment")
            
            enrichment_id = result.data[0]['id']
            
            # Invalidate cache for agent knowledge
            if self.cache:
                await self.cache.delete(f"agent_knowledge:{request.tenant_id}:{request.agent_id}")
            
            logger.info(
                "✅ Enriched knowledge stored",
                tenant_id=request.tenant_id[:8],
                agent_id=request.agent_id,
                enrichment_id=enrichment_id,
                content_type=request.content_type,
                entities_count=len(entities) if entities else 0
            )
            
            return EnrichmentResult(
                enrichment_id=enrichment_id,
                status="stored",
                content_type=request.content_type,
                confidence=request.confidence,
                entities_extracted=sum(len(v) for v in entities.values()) if entities else 0,
                message="Knowledge enrichment stored successfully"
            )
        
        except Exception as e:
            logger.error(
                "❌ Failed to store enriched knowledge",
                tenant_id=request.tenant_id[:8],
                error=str(e)
            )
            raise
    
    async def _extract_knowledge_from_text(
        self,
        text: str,
        context_query: str,
        domain: Optional[str] = None,
        prefer_cost: bool = False
    ) -> Optional[ExtractedKnowledge]:
        """
        Extract structured knowledge from text using intelligently selected LLM.
        
        Uses ModelSelector to choose optimal model based on:
        - Content complexity (inferred from text)
        - Domain type (medical, regulatory, technical, general)
        - Cost vs Quality tradeoff
        
        Args:
            text: Text to extract knowledge from
            context_query: Context query for relevance
            domain: Optional domain hint (medical, regulatory, technical, general)
            prefer_cost: Whether to prefer cost-effective models
            
        Returns:
            ExtractedKnowledge or None if extraction fails
        """
        try:
            # Limit text length for token efficiency
            text_sample = text[:2000]
            
            # Infer complexity from text characteristics
            complexity = self._infer_complexity(text_sample, context_query)
            
            # Infer domain if not provided
            if not domain:
                domain = self._infer_domain(text_sample, context_query)
            
            # Select optimal model
            selected_model = ModelSelector.select_model(
                content_type="extraction",  # Will be refined after extraction
                domain=domain,
                complexity=complexity,
                task_type="extraction",
                prefer_cost=prefer_cost
            )
            
            # Get model-specific configuration
            model_config = ModelSelector.get_model_config(selected_model)
            
            logger.info(
                "Extracting knowledge with intelligent model selection",
                model=selected_model,
                domain=domain,
                complexity=complexity,
                config=model_config
            )
            
            prompt = f"""Extract key knowledge from this text relevant to the query: "{context_query}"

Text:
{text_sample}

Extract and return JSON with:
- content: The key factual content (concise summary, not full text, max 500 chars)
- content_type: Type ('fact', 'procedure', 'guideline', 'case_study', 'definition', 'regulation')
- entities: Extracted entities, e.g., {{"drugs": ["aspirin"], "conditions": ["headache"], "regulations": ["FDA"]}}
- relevance_score: Relevance to query (0-1)
- confidence: Confidence in extraction (0-1)
- key_terms: Important terms (array of strings, max 10)
- complexity: Assessed complexity ('simple', 'moderate', 'complex')
- domain: Assessed domain ('medical', 'regulatory', 'technical', 'general')

Only extract if relevance >= 0.6. Return ONLY valid JSON."""

            response = self.openai.chat.completions.create(
                model=selected_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a knowledge extraction assistant. Extract and structure medical/healthcare information with high precision."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                **model_config  # Apply model-specific config
            )
            
            import json
            knowledge = json.loads(response.choices[0].message.content)
            
            # Validate relevance threshold
            relevance = knowledge.get('relevance_score', 0)
            if relevance < 0.6:
                logger.debug(
                    "Extracted knowledge not relevant enough",
                    relevance_score=relevance
                )
                return None
            
            return ExtractedKnowledge(
                content=knowledge.get('content', '')[:500],  # Limit length
                content_type=knowledge.get('content_type', 'fact'),
                entities=knowledge.get('entities', {}),
                relevance_score=relevance,
                confidence=min(max(float(knowledge.get('confidence', 0.8)), 0.0), 1.0),
                key_terms=knowledge.get('key_terms', [])[:10]
            )
        
        except Exception as e:
            logger.error(
                "Failed to extract knowledge from text",
                error=str(e),
                error_type=type(e).__name__
            )
            return None
    
    def _infer_complexity(self, text: str, query: str) -> str:
        """
        Infer content complexity from text characteristics.
        
        Heuristics:
        - Length (longer = more complex)
        - Technical terms density
        - Sentence structure
        - Medical terminology presence
        
        Args:
            text: Text sample
            query: Context query
            
        Returns:
            Complexity level ('simple', 'moderate', 'complex')
        """
        # Simple heuristics for now (can be enhanced with ML)
        text_lower = text.lower()
        
        # Check for complex medical/regulatory terms
        complex_indicators = [
            'pharmacokinetic', 'bioavailability', 'adverse event', 'clinical trial',
            'randomized', 'double-blind', 'placebo-controlled', 'efficacy',
            'regulatory', 'compliance', 'validation', 'ich-gcp', 'cfr', '21 cfr',
            'statistical significance', 'confidence interval', 'hazard ratio'
        ]
        
        moderate_indicators = [
            'treatment', 'diagnosis', 'symptom', 'condition', 'medication',
            'procedure', 'guideline', 'protocol', 'recommendation'
        ]
        
        complex_count = sum(1 for term in complex_indicators if term in text_lower)
        moderate_count = sum(1 for term in moderate_indicators if term in text_lower)
        
        # Length factor
        word_count = len(text.split())
        
        # Decision logic
        if complex_count >= 3 or word_count > 1000:
            return "complex"
        elif moderate_count >= 2 or word_count > 400:
            return "moderate"
        else:
            return "simple"
    
    def _infer_domain(self, text: str, query: str) -> str:
        """
        Infer domain from text and query content.
        
        Args:
            text: Text sample
            query: Context query
            
        Returns:
            Domain ('medical', 'regulatory', 'technical', 'general')
        """
        combined = (text + " " + query).lower()
        
        # Domain keywords
        medical_keywords = [
            'patient', 'diagnosis', 'treatment', 'drug', 'medication', 'symptom',
            'condition', 'disease', 'clinical', 'medical', 'health', 'therapeutic'
        ]
        
        regulatory_keywords = [
            'fda', 'ema', 'regulatory', 'compliance', 'validation', 'audit',
            'gcp', 'gmp', 'glp', 'cfr', 'guideline', 'regulation', 'approval'
        ]
        
        technical_keywords = [
            'algorithm', 'implementation', 'system', 'process', 'technical',
            'methodology', 'analysis', 'calculation', 'measurement'
        ]
        
        # Count matches
        medical_count = sum(1 for kw in medical_keywords if kw in combined)
        regulatory_count = sum(1 for kw in regulatory_keywords if kw in combined)
        technical_count = sum(1 for kw in technical_keywords if kw in combined)
        
        # Select domain with highest match
        max_count = max(medical_count, regulatory_count, technical_count)
        
        if max_count == 0:
            return "general"
        elif medical_count == max_count:
            return "medical"
        elif regulatory_count == max_count:
            return "regulatory"
        else:
            return "technical"
    
    async def get_agent_enrichments(
        self,
        tenant_id: str,
        agent_id: str,
        limit: int = 50,
        verified_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get enriched knowledge for an agent.
        
        Args:
            tenant_id: Tenant UUID
            agent_id: Agent ID
            limit: Maximum number of enrichments to return
            verified_only: Whether to return only verified knowledge
            
        Returns:
            List of enrichment records
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            query = self.supabase.client.table('agent_knowledge_enrichment') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .eq('agent_id', agent_id) \
                .order('created_at', desc=True) \
                .limit(limit)
            
            if verified_only:
                query = query.eq('verified', True)
            
            result = await query.execute()
            
            logger.info(
                "Agent enrichments retrieved",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                count=len(result.data) if result.data else 0
            )
            
            return result.data if result.data else []
        
        except Exception as e:
            logger.error(
                "Failed to get agent enrichments",
                tenant_id=tenant_id[:8],
                agent_id=agent_id,
                error=str(e)
            )
            return []
    
    async def verify_enrichment(
        self,
        tenant_id: str,
        enrichment_id: str,
        verified_by: str,
        verification_notes: Optional[str] = None
    ) -> bool:
        """
        Manually verify enriched knowledge.
        
        Args:
            tenant_id: Tenant UUID
            enrichment_id: Enrichment ID
            verified_by: User ID who verified
            verification_notes: Optional verification notes
            
        Returns:
            True if successful
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            result = await self.supabase.client.table('agent_knowledge_enrichment') \
                .update({
                    'verified': True,
                    'verified_by': verified_by,
                    'verification_date': datetime.utcnow().isoformat(),
                    'verification_notes': verification_notes,
                    'updated_at': datetime.utcnow().isoformat()
                }) \
                .eq('tenant_id', tenant_id) \
                .eq('id', enrichment_id) \
                .execute()
            
            logger.info(
                "✅ Enrichment verified",
                tenant_id=tenant_id[:8],
                enrichment_id=enrichment_id,
                verified_by=verified_by
            )
            
            return True
        
        except Exception as e:
            logger.error(
                "Failed to verify enrichment",
                tenant_id=tenant_id[:8],
                enrichment_id=enrichment_id,
                error=str(e)
            )
            return False
    
    async def track_enrichment_usage(
        self,
        tenant_id: str,
        enrichment_id: str
    ) -> bool:
        """
        Track when enriched knowledge is used in a response.
        
        Args:
            tenant_id: Tenant UUID
            enrichment_id: Enrichment ID
            
        Returns:
            True if successful
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            # Increment times_referenced and update last_referenced
            result = await self.supabase.client.rpc(
                'increment_enrichment_usage',
                {
                    'p_tenant_id': tenant_id,
                    'p_enrichment_id': enrichment_id
                }
            ).execute()
            
            logger.debug(
                "Enrichment usage tracked",
                tenant_id=tenant_id[:8],
                enrichment_id=enrichment_id
            )
            
            return True
        
        except Exception as e:
            logger.error(
                "Failed to track enrichment usage",
                tenant_id=tenant_id[:8],
                enrichment_id=enrichment_id,
                error=str(e)
            )
            return False


# ============================================================================
# SERVICE FACTORY
# ============================================================================

_agent_enrichment_service: Optional[AgentEnrichmentService] = None


def get_agent_enrichment_service(
    supabase_client: Optional[SupabaseClient] = None,
    cache_manager: Optional[CacheManager] = None
) -> AgentEnrichmentService:
    """
    Get or create agent enrichment service instance (singleton pattern)
    
    Args:
        supabase_client: Optional Supabase client
        cache_manager: Optional cache manager
        
    Returns:
        AgentEnrichmentService instance
    """
    global _agent_enrichment_service
    
    if _agent_enrichment_service is None:
        if not supabase_client:
            raise ValueError("supabase_client required for first initialization")
        _agent_enrichment_service = AgentEnrichmentService(
            supabase_client=supabase_client,
            cache_manager=cache_manager
        )
    
    return _agent_enrichment_service

