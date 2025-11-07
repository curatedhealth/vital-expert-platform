"""
Prompt Enhancement Service - Python Backend
AI-powered prompt enhancement with intelligent template matching
"""

import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from enum import Enum
import structlog
import json

# LLM imports
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage  # ✅ LangChain 1.0

from services.supabase_client import SupabaseClient
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# MODELS & ENUMS
# ============================================================================

class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    

class IntentOption(BaseModel):
    """Intent clarification option"""
    id: int
    title: str
    description: str
    focus: str
    keywords: List[str]


class IntentClarificationRequest(BaseModel):
    """Request for intent clarification"""
    prompt: str
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    domain: Optional[str] = None
    tenant_id: Optional[str] = None


class IntentClarificationResponse(BaseModel):
    """Response with intent options"""
    success: bool
    prompt: str
    options: List[IntentOption]
    metadata: Dict[str, Any]


class TemplateEnhancementRequest(BaseModel):
    """Request for template-based enhancement"""
    original_prompt: str
    selected_intent: IntentOption
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    tenant_id: Optional[str] = None


class TemplateEnhancementResponse(BaseModel):
    """Response with enhanced prompt"""
    success: bool
    enhanced_prompt: str
    original_prompt: str
    selected_intent: IntentOption
    template_used: Dict[str, Any]  # Changed to Any to include more details
    explanation: str
    improvements: List[str]
    metadata: Dict[str, Any]
    relevance_score: Optional[float] = None  # NEW: Template relevance score
    

class TemplateMatch(BaseModel):
    """Scored template match"""
    template: Dict[str, Any]
    score: float
    match_reasons: List[str]


# ============================================================================
# PROMPT ENHANCEMENT SERVICE
# ============================================================================

class PromptEnhancementService:
    """
    AI-powered prompt enhancement service
    
    Features:
    - Intent clarification with 4 options
    - Template matching from PRISM library
    - Intelligent customization
    - Multi-LLM support (OpenAI, Anthropic, Google)
    """
    
    def __init__(self, supabase_client: SupabaseClient):
        self.supabase = supabase_client
        self.settings = settings
        
    # ========================================================================
    # LLM INITIALIZATION
    # ========================================================================
    
    def _get_llm(self, provider: str = None, model: str = None, temperature: float = 0.7):
        """
        Get LLM instance based on provider and model
        
        Args:
            provider: LLM provider (openai, anthropic, google)
            model: Specific model name
            temperature: Generation temperature
            
        Returns:
            LLM instance
        """
        # Get from settings/config if not provided
        if not provider:
            provider = self._get_configured_provider()
        if not model:
            model = self._get_configured_model(provider)
            
        logger.info("Initializing LLM", provider=provider, model=model)
        
        try:
            if provider == LLMProvider.OPENAI:
                return ChatOpenAI(
                    model=model or "gpt-4-turbo-preview",
                    temperature=temperature,
                    max_tokens=2048,
                    openai_api_key=self.settings.openai_api_key
                )
            elif provider == LLMProvider.ANTHROPIC:
                return ChatAnthropic(
                    model=model or "claude-3-5-sonnet-20241022",
                    temperature=temperature,
                    max_tokens=2048,
                    anthropic_api_key=self.settings.anthropic_api_key
                )
            elif provider == LLMProvider.GOOGLE:
                return ChatGoogleGenerativeAI(
                    model=model or "gemini-pro",
                    temperature=temperature,
                    max_output_tokens=2048,
                    google_api_key=self.settings.google_api_key or self.settings.gemini_api_key
                )
            else:
                raise ValueError(f"Unsupported LLM provider: {provider}")
                
        except Exception as e:
            logger.error("Failed to initialize LLM", error=str(e), provider=provider)
            raise
    
    def _get_configured_provider(self) -> str:
        """Get configured LLM provider from database or environment"""
        try:
            # Try to get from database config
            result = self.supabase.client.table("prompt_enhancement_config")\
                .select("llm_provider")\
                .eq("is_active", True)\
                .order("updated_at", desc=True)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]["llm_provider"]
        except Exception as e:
            logger.warning("Could not get provider from database", error=str(e))
        
        # Fallback: check which API keys are available
        if self.settings.anthropic_api_key:
            return LLMProvider.ANTHROPIC
        elif self.settings.openai_api_key:
            return LLMProvider.OPENAI
        elif self.settings.google_api_key or self.settings.gemini_api_key:
            return LLMProvider.GOOGLE
        else:
            raise ValueError("No LLM API keys configured")
    
    def _get_configured_model(self, provider: str) -> str:
        """Get configured model for provider from database or defaults"""
        try:
            # Try to get from database config
            result = self.supabase.client.table("prompt_enhancement_config")\
                .select("llm_model")\
                .eq("is_active", True)\
                .eq("llm_provider", provider)\
                .order("updated_at", desc=True)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]["llm_model"]
        except Exception as e:
            logger.warning("Could not get model from database", error=str(e))
        
        # Fallback to defaults
        defaults = {
            LLMProvider.OPENAI: "gpt-4-turbo-preview",
            LLMProvider.ANTHROPIC: "claude-3-5-sonnet-20241022",
            LLMProvider.GOOGLE: "gemini-pro"
        }
        return defaults.get(provider, "gpt-4-turbo-preview")
    
    # ========================================================================
    # INTENT CLARIFICATION
    # ========================================================================
    
    async def clarify_intent(
        self,
        request: IntentClarificationRequest
    ) -> IntentClarificationResponse:
        """
        Analyze user prompt and generate 4 intent clarification options
        
        Args:
            request: Intent clarification request
            
        Returns:
            Response with 4 intent options
        """
        try:
            logger.info("Clarifying intent", prompt=request.prompt[:50])
            
            # Get LLM
            llm = self._get_llm(temperature=0.8)
            
            # Build context
            context = self._build_context(request.agent_name, request.domain)
            
            # System prompt
            system_prompt = self._build_intent_system_prompt(context)
            
            # User prompt
            user_prompt = f"""User's prompt: "{request.prompt}"

Generate exactly 4 intent clarification options that will help understand:
1. What they're trying to achieve
2. What output/result they need
3. The context and goals
4. Any specific requirements

Each option should be:
- A clear, specific interpretation of their intent
- Written as a complete goal statement
- Focused on a different aspect or approach
- 2-3 sentences maximum
- Actionable and specific

Return as JSON array:
{{
  "options": [
    {{
      "id": 1,
      "title": "Short title (5-7 words)",
      "description": "Detailed description",
      "focus": "regulatory|clinical|market_access|etc",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object."""
            
            # Call LLM
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = llm.invoke(messages)
            response_text = response.content
            
            # Parse JSON
            options = self._parse_intent_response(response_text, request.prompt, request.domain)
            
            return IntentClarificationResponse(
                success=True,
                prompt=request.prompt,
                options=options,
                metadata={
                    "agent_id": request.agent_id,
                    "agent_name": request.agent_name,
                    "domain": request.domain,
                    "provider": self._get_configured_provider(),
                    "model": self._get_configured_model(self._get_configured_provider())
                }
            )
            
        except Exception as e:
            logger.error("Failed to clarify intent", error=str(e))
            # Return fallback options
            options = self._generate_fallback_options(request.prompt, request.domain)
            return IntentClarificationResponse(
                success=True,
                prompt=request.prompt,
                options=options,
                metadata={"fallback": True}
            )
    
    # ========================================================================
    # TEMPLATE ENHANCEMENT
    # ========================================================================
    
    async def enhance_with_template(
        self,
        request: TemplateEnhancementRequest
    ) -> TemplateEnhancementResponse:
        """
        Find best template and customize for user's needs
        
        Args:
            request: Template enhancement request
            
        Returns:
            Enhanced prompt with template info
        """
        try:
            logger.info("Enhancing with template", 
                       intent=request.selected_intent.title)
            
            # Find and rank matching templates
            template_matches = await self._find_and_rank_templates(
                request.selected_intent.focus,
                request.selected_intent.keywords,
                request.original_prompt,
                request.agent_id,
                request.tenant_id
            )
            
            # Get top templates
            top_templates = [match.template for match in template_matches[:5]]
            best_match = template_matches[0] if template_matches else None
            
            # Get LLM
            llm = self._get_llm(temperature=0.7)
            
            # Customize prompt
            result = await self._customize_with_llm(
                llm,
                request.original_prompt,
                request.selected_intent,
                top_templates,
                request.agent_name,
                best_match
            )
            
            # Track usage analytics
            await self._track_template_usage(
                template_id=result.get("template_id"),
                agent_id=request.agent_id,
                tenant_id=request.tenant_id,
                intent_focus=request.selected_intent.focus,
                relevance_score=best_match.score if best_match else None
            )
            
            return TemplateEnhancementResponse(
                success=True,
                enhanced_prompt=result["enhanced"],
                original_prompt=request.original_prompt,
                selected_intent=request.selected_intent,
                template_used=result["template_info"],
                explanation=result["explanation"],
                improvements=result["improvements"],
                relevance_score=best_match.score if best_match else None,
                metadata={
                    "agent_id": request.agent_id,
                    "agent_name": request.agent_name,
                    "templates_considered": len(template_matches),
                    "best_match_score": best_match.score if best_match else None,
                    "match_reasons": best_match.match_reasons if best_match else [],
                    "provider": self._get_configured_provider(),
                    "model": self._get_configured_model(self._get_configured_provider())
                }
            )
            
        except Exception as e:
            logger.error("Failed to enhance with template", error=str(e))
            # Return fallback
            fallback = self._generate_fallback_enhancement(
                request.original_prompt,
                request.selected_intent
            )
            return TemplateEnhancementResponse(
                success=True,
                enhanced_prompt=fallback["enhanced"],
                original_prompt=request.original_prompt,
                selected_intent=request.selected_intent,
                template_used=fallback["template_info"],
                explanation=fallback["explanation"],
                improvements=fallback["improvements"],
                metadata={"fallback": True}
            )
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    async def _find_and_rank_templates(
        self,
        focus: str,
        keywords: List[str],
        user_prompt: str,
        agent_id: Optional[str],
        tenant_id: Optional[str]
    ) -> List[TemplateMatch]:
        """
        Find and rank templates using multiple signals
        
        Ranking factors:
        1. Domain match (0-30 points)
        2. Keyword overlap (0-25 points)
        3. Semantic similarity (0-25 points) - if embeddings available
        4. Usage stats (0-10 points)
        5. Agent affinity (0-10 points)
        """
        try:
            # Query templates from PRISM library
            query = self.supabase.client.table("prompts").select("*")
            
            # Domain mapping
            domain_mapping = {
                "regulatory_affairs": "regulatory_affairs",
                "clinical_research": "clinical_research",
                "market_access": "market_access",
                "business_strategy": "business_strategy",
                "medical_affairs": "medical_affairs",
                "quality_assurance": "quality_assurance",
                "pharmacovigilance": "pharmacovigilance",
                "manufacturing": "manufacturing"
            }
            
            # Filter by domain if available
            if focus in domain_mapping:
                query = query.eq("domain", domain_mapping[focus])
            
            # Execute query
            result = query.execute()
            templates = result.data or []
            
            if not templates:
                logger.warning("No templates found", focus=focus)
                return []
            
            # Get usage stats for templates
            usage_stats = await self._get_template_usage_stats(
                [t["id"] for t in templates]
            )
            
            # Score each template
            scored_templates = []
            for template in templates:
                score, reasons = self._score_template(
                    template,
                    focus,
                    keywords,
                    user_prompt,
                    agent_id,
                    usage_stats.get(template["id"], {})
                )
                
                scored_templates.append(TemplateMatch(
                    template=template,
                    score=score,
                    match_reasons=reasons
                ))
            
            # Sort by score descending
            scored_templates.sort(key=lambda x: x.score, reverse=True)
            
            logger.info(
                "Ranked templates",
                total=len(scored_templates),
                top_score=scored_templates[0].score if scored_templates else 0,
                top_template=scored_templates[0].template.get("display_name") if scored_templates else None
            )
            
            return scored_templates
            
        except Exception as e:
            logger.error("Failed to rank templates", error=str(e))
            return []
    
    def _score_template(
        self,
        template: Dict[str, Any],
        focus: str,
        keywords: List[str],
        user_prompt: str,
        agent_id: Optional[str],
        usage_stats: Dict[str, Any]
    ) -> tuple[float, List[str]]:
        """
        Score a single template
        
        Returns:
            (score, reasons) - Score 0-100 and list of match reasons
        """
        score = 0.0
        reasons = []
        
        # 1. Domain match (0-30 points)
        domain_mapping = {
            "regulatory_affairs": "regulatory_affairs",
            "clinical_research": "clinical_research",
            "market_access": "market_access",
            "business_strategy": "business_strategy",
            "medical_affairs": "medical_affairs",
            "quality_assurance": "quality_assurance",
            "pharmacovigilance": "pharmacovigilance",
            "manufacturing": "manufacturing"
        }
        
        if focus in domain_mapping and template.get("domain") == domain_mapping[focus]:
            score += 30
            reasons.append(f"Perfect domain match: {template.get('domain')}")
        elif template.get("domain"):
            # Partial credit for related domains
            score += 15
            reasons.append(f"Related domain: {template.get('domain')}")
        
        # 2. Keyword overlap (0-25 points)
        template_keywords = []
        if template.get("tags"):
            if isinstance(template["tags"], list):
                template_keywords = template["tags"]
            elif isinstance(template["tags"], str):
                template_keywords = template["tags"].split(",")
        
        template_keywords = [k.strip().lower() for k in template_keywords]
        user_keywords = [k.lower() for k in keywords]
        
        keyword_overlap = len(set(template_keywords) & set(user_keywords))
        if keyword_overlap > 0:
            keyword_score = min(25, keyword_overlap * 8)
            score += keyword_score
            reasons.append(f"{keyword_overlap} keyword matches")
        
        # 3. Text similarity (0-25 points) - simple keyword matching
        template_text = " ".join([
            template.get("display_name", ""),
            template.get("description", ""),
            template.get("user_prompt_template", "")[:200]
        ]).lower()
        
        user_text = user_prompt.lower()
        user_words = set(user_text.split())
        template_words = set(template_text.split())
        
        common_words = user_words & template_words
        # Remove common stop words
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        meaningful_overlap = common_words - stop_words
        
        if len(meaningful_overlap) > 3:
            text_score = min(25, len(meaningful_overlap) * 2)
            score += text_score
            reasons.append(f"{len(meaningful_overlap)} relevant terms found")
        
        # 4. Usage stats (0-10 points)
        success_rate = usage_stats.get("success_rate", 0)
        usage_count = usage_stats.get("usage_count", 0)
        
        if usage_count > 0:
            # Weight by both success rate and usage count
            stats_score = min(10, (success_rate * 5) + min(5, usage_count / 10))
            score += stats_score
            reasons.append(f"Popular template ({usage_count} uses, {success_rate*100:.0f}% success)")
        
        # 5. Agent affinity (0-10 points)
        if agent_id and usage_stats.get("agent_affinity", {}).get(agent_id, 0) > 0:
            affinity_score = min(10, usage_stats["agent_affinity"][agent_id] * 10)
            score += affinity_score
            reasons.append("Frequently used with this agent")
        
        # Bonus: Complexity match (0-5 points)
        complexity_level = template.get("complexity_level", "").lower()
        if complexity_level == "intermediate":
            score += 3
            reasons.append("Balanced complexity level")
        elif complexity_level == "advanced":
            score += 2
        
        return score, reasons
    
    async def _get_template_usage_stats(
        self,
        template_ids: List[str]
    ) -> Dict[str, Dict[str, Any]]:
        """Get usage statistics for templates"""
        try:
            result = self.supabase.client.table("prompt_enhancement_analytics")\
                .select("template_id, agent_id, user_applied, relevance_score")\
                .in_("template_id", template_ids)\
                .execute()
            
            stats = {}
            for template_id in template_ids:
                template_uses = [r for r in result.data if r["template_id"] == template_id]
                
                total = len(template_uses)
                applied = sum(1 for r in template_uses if r.get("user_applied"))
                success_rate = applied / total if total > 0 else 0
                
                # Agent affinity
                agent_affinity = {}
                for use in template_uses:
                    agent_id = use.get("agent_id")
                    if agent_id:
                        agent_affinity[agent_id] = agent_affinity.get(agent_id, 0) + 1
                
                stats[template_id] = {
                    "usage_count": total,
                    "success_rate": success_rate,
                    "agent_affinity": agent_affinity
                }
            
            return stats
            
        except Exception as e:
            logger.error("Failed to get usage stats", error=str(e))
            return {}
    
    async def _track_template_usage(
        self,
        template_id: Optional[str],
        agent_id: Optional[str],
        tenant_id: Optional[str],
        intent_focus: str,
        relevance_score: Optional[float]
    ):
        """Track template usage for analytics"""
        try:
            if not template_id:
                return
            
            self.supabase.client.table("prompt_enhancement_analytics").insert({
                "template_id": template_id,
                "agent_id": agent_id,
                "tenant_id": tenant_id,
                "intent_focus": intent_focus,
                "relevance_score": relevance_score,
                "user_applied": False,  # Will be updated when user applies
                "created_at": "now()"
            }).execute()
            
        except Exception as e:
            logger.error("Failed to track usage", error=str(e))
    
    def _build_context(self, agent_name: Optional[str], domain: Optional[str]) -> str:
        """Build context information"""
        context = "Healthcare and life sciences professional environment."
        if agent_name:
            context += f" User is interacting with \"{agent_name}\" agent."
        if domain:
            context += f" Context: {domain.replace('_', ' ')} domain."
        return context
    
    def _build_intent_system_prompt(self, context: str) -> str:
        """Build system prompt for intent clarification"""
        return f"""You are an expert prompt engineer specializing in healthcare and life sciences. 
Your role is to analyze user prompts and generate 4 distinct clarification options that help 
understand their true intent and goals.

Context: {context}

For each user prompt, generate 4 options that represent different possible interpretations or approaches:

**Option Types to Consider:**
1. **Exploratory**: Understanding a concept, learning, or getting overview
2. **Strategic**: Planning, strategy development, decision-making
3. **Operational**: Step-by-step guidance, implementation, how-to
4. **Analytical**: Deep analysis, evaluation, assessment, problem-solving

**Healthcare Domain Focus Areas:**
- Regulatory Affairs (FDA, EMA, compliance, submissions)
- Clinical Research (trials, study design, protocols)
- Market Access (pricing, reimbursement, payers)
- Pharmacovigilance (safety, adverse events, risk management)
- Digital Health (DTx, SaMD, innovation)
- Data Analytics (insights, analysis, reporting)
- Medical Writing (documentation, scientific communication)

Generate 4 options that help clarify what the user really wants to achieve."""
    
    def _parse_intent_response(self, response_text: str, prompt: str, domain: Optional[str]) -> List[IntentOption]:
        """Parse LLM response into intent options"""
        try:
            # Extract JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                data = json.loads(json_match.group(0))
                options = data.get("options", [])
                return [IntentOption(**opt) for opt in options[:4]]
        except Exception as e:
            logger.warning("Failed to parse intent response", error=str(e))
        
        # Fallback
        return self._generate_fallback_options(prompt, domain)
    
    def _generate_fallback_options(self, prompt: str, domain: Optional[str]) -> List[IntentOption]:
        """Generate fallback options when LLM fails"""
        return [
            IntentOption(
                id=1,
                title="Comprehensive Strategic Guidance",
                description=f"I want to develop a complete strategy for: {prompt}. I need a structured approach covering planning, implementation, and success criteria.",
                focus=domain or "general",
                keywords=["strategy", "planning", "comprehensive"]
            ),
            IntentOption(
                id=2,
                title="Step-by-Step Implementation Plan",
                description=f"I need practical, actionable steps to: {prompt}. I want a detailed roadmap with timelines and milestones.",
                focus="operational",
                keywords=["implementation", "step-by-step", "actionable"]
            ),
            IntentOption(
                id=3,
                title="Expert Analysis & Best Practices",
                description=f"I want expert analysis on: {prompt}. I need to understand best practices, standards, and what leading organizations do.",
                focus="analytical",
                keywords=["analysis", "best practices", "expert insight"]
            ),
            IntentOption(
                id=4,
                title="Quick Overview & Key Considerations",
                description=f"I need a clear overview of: {prompt}. I want to understand key concepts and important factors.",
                focus="exploratory",
                keywords=["overview", "introduction", "concepts"]
            )
        ]
    
    async def _find_matching_templates(
        self,
        focus: str,
        keywords: List[str],
        tenant_id: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Find matching templates from PRISM library"""
        try:
            query = self.supabase.client.table("prompts").select("*").limit(10)
            
            # Map focus to domain
            domain_mapping = {
                "regulatory_affairs": "regulatory_affairs",
                "regulatory": "regulatory_affairs",
                "clinical_research": "clinical_research",
                "clinical": "clinical_research",
                "market_access": "market_access",
                "pharmacovigilance": "pharmacovigilance",
                "digital_health": "digital_health",
                "data_analytics": "data_analytics",
            }
            
            if focus in domain_mapping:
                query = query.eq("domain", domain_mapping[focus])
            
            result = query.execute()
            return result.data or []
            
        except Exception as e:
            logger.warning("Failed to find templates", error=str(e))
            return []
    
    async def _customize_with_llm(
        self,
        llm,
        original_prompt: str,
        selected_intent: IntentOption,
        templates: List[Dict[str, Any]],
        agent_name: Optional[str],
        best_match: Optional[TemplateMatch] = None
    ) -> Dict[str, Any]:
        """Use LLM to customize prompt with best template"""
        # Prepare templates info with Suite/Subsuite
        templates_info = "\n---\n".join([
            f"Template {i+1}:\n"
            f"Name: {t.get('display_name')}\n"
            f"Suite: {t.get('suite', 'N/A')}\n"
            f"Subsuite: {t.get('subsuite', 'N/A')}\n"
            f"Domain: {t.get('domain')}\n"
            f"Description: {t.get('description')}\n"
            f"Structure Preview: {t.get('user_prompt_template', '')[:300]}..."
            for i, t in enumerate(templates)
        ]) if templates else "No templates available."
        
        # Build prompt
        system_prompt = f"""You are an expert prompt engineer for healthcare and life sciences."""
        if agent_name:
            system_prompt += f" The user is working with the \"{agent_name}\" AI agent."
        
        user_prompt = f"""Create the perfect prompt for this user.

**Original Prompt:** "{original_prompt}"

**User's Intent:** {selected_intent.title}
{selected_intent.description}

**Available PRISM Templates:**
{templates_info}

**Instructions:**
1. Select the BEST matching template from above (or create new if none fit well)
2. Customize it for the user's specific needs
3. Make it comprehensive, clear, and actionable
4. Use professional healthcare terminology
5. Structure with numbered sections

**Return JSON:**
{{
  "template_id": "id_of_selected_template_or_custom",
  "template_name": "name_of_template",
  "suite": "PRISM_SUITE_NAME",
  "subsuite": "SUBSUITE_NAME",
  "enhanced": "The complete enhanced prompt here...",
  "explanation": "Why this template/approach is perfect for their needs",
  "improvements": ["Specific improvement 1", "Improvement 2", "Improvement 3"]
}}"""
        
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = llm.invoke(messages)
            response_text = response.content
            
            # Parse JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result = json.loads(json_match.group(0))
                return result
            
        except Exception as e:
            logger.warning("LLM customization failed", error=str(e))
        
        # Fallback
        if templates and len(templates) > 0:
            template = templates[0]
            return {
                "template_id": template.get("id", "fallback"),
                "template_name": template.get("display_name", "Generic Template"),
                "suite": template.get("suite", "Unknown"),
                "subsuite": template.get("subsuite", "Unknown"),
                "enhanced": f"{original_prompt}\n\nContext: {selected_intent.description}",
                "explanation": "Using default template due to processing issue",
                "improvements": ["Added context", "Structured format"]
            }
        else:
            return {
                "template_id": "custom",
                "template_name": "Custom Prompt",
                "suite": "Custom",
                "subsuite": "N/A",
                "enhanced": f"{original_prompt}\n\nContext: {selected_intent.description}",
                "explanation": "Created custom prompt",
                "improvements": ["Added clarity"]
            }
    
    def _generate_fallback_enhancement(
        self,
        original_prompt: str,
        selected_intent: IntentOption
    ) -> Dict[str, Any]:
        """Generate fallback enhancement when LLM fails"""
        enhanced = f"""### {selected_intent.title}

**Objective:**
{original_prompt}

**Context:**
{selected_intent.description}

**Approach:**
1. Understand the current situation and requirements
2. Analyze key factors and considerations
3. Develop actionable recommendations
4. Identify potential challenges and mitigation strategies

**Expected Deliverables:**
- Clear, structured response addressing the core question
- Evidence-based recommendations
- Practical next steps

**Focus Areas:**
{', '.join(selected_intent.keywords)}"""
        
        return {
            "template_id": "fallback",
            "template_name": "Structured Inquiry Template",
            "suite": "Core",
            "subsuite": "General",
            "enhanced": enhanced,
            "explanation": "Generated structured prompt based on your intent",
            "improvements": [
                "Added clear structure",
                "Defined objectives and deliverables",
                "Incorporated focus keywords"
            ]
        }
