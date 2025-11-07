"""
Prompt Service - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

Manages prompts for AI agents with support for templates, variables, and optimization.

Features:
- Prompt template management
- Variable interpolation
- Prompt optimization
- Version control
- A/B testing support

Usage:
    from vital_ai_services.prompt import PromptService
    
    prompt_service = PromptService()
    
    # Get prompt template
    template = await prompt_service.get_prompt(
        prompt_id="agent_system_prompt",
        agent_id="regulatory_expert"
    )
    
    # Render with variables
    rendered = prompt_service.render(
        template=template,
        variables={
            "agent_name": "Regulatory Expert",
            "domains": ["regulatory", "clinical_trials"]
        }
    )
"""

from typing import Dict, Any, Optional
import structlog
from string import Template

logger = structlog.get_logger()


class PromptService:
    """
    Service for managing and rendering AI prompts.
    
    TAG: PROMPT_SERVICE
    
    Features:
    - Template management
    - Variable interpolation
    - Prompt caching
    - Version control
    """
    
    def __init__(self, supabase_client=None, cache_manager=None):
        """
        Initialize prompt service.
        
        Args:
            supabase_client: Optional Supabase client for prompt storage
            cache_manager: Optional cache manager for prompt caching
        """
        self.supabase = supabase_client
        self.cache = cache_manager
        self._prompt_cache: Dict[str, str] = {}
        logger.info("✅ PromptService initialized")
    
    async def get_prompt(
        self,
        prompt_id: str,
        agent_id: Optional[str] = None,
        version: Optional[str] = None
    ) -> str:
        """
        Get prompt template by ID.
        
        Args:
            prompt_id: Prompt identifier
            agent_id: Optional agent-specific override
            version: Optional version (default: latest)
            
        Returns:
            Prompt template string
        """
        # Check cache
        cache_key = f"{prompt_id}:{agent_id or 'default'}:{version or 'latest'}"
        if cache_key in self._prompt_cache:
            return self._prompt_cache[cache_key]
        
        # Fetch from database
        if self.supabase:
            try:
                # Try agent-specific prompt first
                if agent_id:
                    result = await self.supabase.client.table('agent_prompts') \
                        .select('prompt_template') \
                        .eq('agent_id', agent_id) \
                        .eq('prompt_id', prompt_id) \
                        .eq('is_active', True) \
                        .single() \
                        .execute()
                    
                    if result.data:
                        template = result.data['prompt_template']
                        self._prompt_cache[cache_key] = template
                        return template
                
                # Fall back to default prompt
                result = await self.supabase.client.table('prompts') \
                    .select('template') \
                    .eq('id', prompt_id) \
                    .eq('is_active', True) \
                    .single() \
                    .execute()
                
                if result.data:
                    template = result.data['template']
                    self._prompt_cache[cache_key] = template
                    return template
            
            except Exception as e:
                logger.error(f"Failed to fetch prompt from database", prompt_id=prompt_id, error=str(e))
        
        # Return default fallback
        return self._get_default_prompt(prompt_id)
    
    def render(
        self,
        template: str,
        variables: Dict[str, Any]
    ) -> str:
        """
        Render prompt template with variables.
        
        Args:
            template: Prompt template with ${variable} placeholders
            variables: Dictionary of variable values
            
        Returns:
            Rendered prompt string
        """
        try:
            # Use Python's Template for safe substitution
            t = Template(template)
            return t.safe_substitute(variables)
        
        except Exception as e:
            logger.error(f"Failed to render prompt template", error=str(e))
            return template
    
    async def save_prompt(
        self,
        prompt_id: str,
        template: str,
        agent_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Save prompt template to database.
        
        Args:
            prompt_id: Prompt identifier
            template: Prompt template string
            agent_id: Optional agent-specific prompt
            metadata: Optional metadata (tags, description, etc.)
            
        Returns:
            Success status
        """
        if not self.supabase:
            logger.warning("Cannot save prompt: Supabase client not available")
            return False
        
        try:
            table_name = 'agent_prompts' if agent_id else 'prompts'
            data = {
                "prompt_id": prompt_id if not agent_id else None,
                "id": prompt_id if not agent_id else None,
                "agent_id": agent_id,
                "prompt_template" if agent_id else "template": template,
                "metadata": metadata or {},
                "is_active": True
            }
            
            await self.supabase.client.table(table_name).upsert(data).execute()
            
            # Clear cache
            cache_key_prefix = f"{prompt_id}:{agent_id or 'default'}"
            self._prompt_cache = {
                k: v for k, v in self._prompt_cache.items()
                if not k.startswith(cache_key_prefix)
            }
            
            logger.info(f"✅ Prompt saved", prompt_id=prompt_id, agent_id=agent_id)
            return True
        
        except Exception as e:
            logger.error(f"Failed to save prompt", prompt_id=prompt_id, error=str(e))
            return False
    
    def _get_default_prompt(self, prompt_id: str) -> str:
        """Get hardcoded default prompt as fallback."""
        defaults = {
            "agent_system_prompt": (
                "You are ${agent_name}, a specialized AI assistant.\n\n"
                "Your expertise areas: ${domains}\n\n"
                "Provide accurate, evidence-based responses with citations."
            ),
            "query_analysis_prompt": (
                "Analyze the following query:\n\n${query}\n\n"
                "Extract: intent, domains, complexity, keywords"
            ),
            "rag_context_prompt": (
                "Based on the following context:\n\n${context}\n\n"
                "Answer the query: ${query}"
            )
        }
        
        return defaults.get(prompt_id, "No default prompt available for: " + prompt_id)

