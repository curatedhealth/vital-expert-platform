"""
Panel Response Template Service
Loads expert response templates from Supabase panel_response_templates table

Replaces hardcoded mock responses with database-driven templates.
"""

from typing import Dict, Any, Optional, List
from functools import lru_cache
import structlog

from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class PanelResponseTemplateService:
    """
    Service for loading panel response templates from Supabase.

    Templates are cached to minimize database calls during panel execution.
    """

    def __init__(self, supabase_client: SupabaseClient):
        self.supabase = supabase_client
        self._templates_cache: Optional[Dict[str, Dict[str, Any]]] = None
        self._cache_loaded: bool = False

    async def load_templates(self, tenant_id: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """
        Load all active response templates from Supabase.

        Args:
            tenant_id: Optional tenant filter (includes platform templates)

        Returns:
            Dictionary mapping template_key to template data
        """
        try:
            logger.info("panel_response_templates_loading", tenant_id=tenant_id)

            # Query panel_response_templates
            query = self.supabase.client.table('panel_response_templates') \
                .select('*') \
                .eq('is_active', True) \
                .order('sort_order')

            response = query.execute()

            if not response.data:
                logger.warning("panel_response_templates_empty")
                return {}

            # Build template dictionary
            templates = {}
            for template in response.data:
                key = template.get('template_key')
                if key:
                    templates[key] = {
                        'id': template.get('id'),
                        'template_key': key,
                        'template_name': template.get('template_name'),
                        'expert_category': template.get('expert_category'),
                        'response_template': template.get('response_template'),
                        'default_confidence': float(template.get('default_confidence', 0.75)),
                        'confidence_min': float(template.get('confidence_min', 0.60)),
                        'confidence_max': float(template.get('confidence_max', 0.95)),
                        'display_name': template.get('display_name'),
                        'is_mock': template.get('is_mock', False),
                        'mock_delay_ms': template.get('mock_delay_ms', 500),
                        'panel_types': template.get('panel_types', []),
                        'metadata': template.get('metadata', {}),
                    }

            logger.info(
                "panel_response_templates_loaded",
                count=len(templates),
                template_keys=list(templates.keys())
            )

            # Cache templates
            self._templates_cache = templates
            self._cache_loaded = True

            return templates

        except Exception as e:
            logger.error("panel_response_templates_load_failed", error=str(e))
            return {}

    async def get_template(
        self,
        template_key: str,
        tenant_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific response template by key.

        Args:
            template_key: Template key (e.g., 'regulatory_expert')
            tenant_id: Optional tenant filter

        Returns:
            Template data or None if not found
        """
        # Load templates if not cached
        if not self._cache_loaded:
            await self.load_templates(tenant_id)

        return self._templates_cache.get(template_key) if self._templates_cache else None

    async def get_template_for_agent(
        self,
        agent_id: str,
        tenant_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get response template matching an agent ID.

        Tries to match agent_id to template_key directly,
        or falls back to generic_expert template.

        Args:
            agent_id: Agent identifier
            tenant_id: Optional tenant filter

        Returns:
            Template data or None
        """
        # Load templates if not cached
        if not self._cache_loaded:
            await self.load_templates(tenant_id)

        if not self._templates_cache:
            return None

        # Direct match
        if agent_id in self._templates_cache:
            return self._templates_cache[agent_id]

        # Try normalized key (replace spaces/dashes with underscores, lowercase)
        normalized_key = agent_id.lower().replace(' ', '_').replace('-', '_')
        if normalized_key in self._templates_cache:
            return self._templates_cache[normalized_key]

        # Fall back to generic template
        return self._templates_cache.get('generic_expert')

    async def generate_response(
        self,
        template_key: str,
        query: str,
        tenant_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a mock response using a template.

        Args:
            template_key: Template key
            query: User query to insert into template
            tenant_id: Optional tenant filter

        Returns:
            Response data with content and confidence
        """
        template = await self.get_template(template_key, tenant_id)

        if template:
            # Replace {query} placeholder in template
            content = template['response_template'].replace('{query}', query)
            return {
                'content': content,
                'confidence': template['default_confidence'],
                'confidence_min': template['confidence_min'],
                'confidence_max': template['confidence_max'],
                'mock_delay_ms': template['mock_delay_ms'],
                'template_key': template_key,
                'is_mock': template['is_mock'],
            }

        # Fallback response if no template found
        return {
            'content': f"Expert analysis of '{query}': This requires careful consideration of regulatory requirements, clinical evidence, and quality systems. Approval pathway depends on device classification and risk profile.",
            'confidence': 0.70,
            'confidence_min': 0.60,
            'confidence_max': 0.85,
            'mock_delay_ms': 500,
            'template_key': 'fallback',
            'is_mock': True,
        }

    async def generate_response_for_agent(
        self,
        agent_id: str,
        query: str,
        tenant_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a mock response for a specific agent.

        Args:
            agent_id: Agent identifier
            query: User query
            tenant_id: Optional tenant filter

        Returns:
            Response data with content and confidence
        """
        template = await self.get_template_for_agent(agent_id, tenant_id)

        if template:
            content = template['response_template'].replace('{query}', query)
            return {
                'content': content,
                'confidence': template['default_confidence'],
                'confidence_min': template['confidence_min'],
                'confidence_max': template['confidence_max'],
                'mock_delay_ms': template['mock_delay_ms'],
                'template_key': template['template_key'],
                'is_mock': template['is_mock'],
                'display_name': template.get('display_name', agent_id.replace('_', ' ').title()),
            }

        # Fallback
        return {
            'content': f"Expert analysis of '{query}': This requires careful consideration of regulatory requirements, clinical evidence, and quality systems. Approval pathway depends on device classification and risk profile.",
            'confidence': 0.70,
            'confidence_min': 0.60,
            'confidence_max': 0.85,
            'mock_delay_ms': 500,
            'template_key': 'fallback',
            'is_mock': True,
            'display_name': agent_id.replace('_', ' ').title(),
        }

    def get_cached_templates(self) -> Optional[Dict[str, Dict[str, Any]]]:
        """Get cached templates without database call."""
        return self._templates_cache

    def clear_cache(self):
        """Clear template cache to force reload."""
        self._templates_cache = None
        self._cache_loaded = False
        logger.info("panel_response_templates_cache_cleared")

    async def get_all_template_keys(self, tenant_id: Optional[str] = None) -> List[str]:
        """Get all available template keys."""
        if not self._cache_loaded:
            await self.load_templates(tenant_id)

        return list(self._templates_cache.keys()) if self._templates_cache else []


# Global instance
_panel_response_template_service: Optional[PanelResponseTemplateService] = None


async def initialize_panel_response_template_service(
    supabase_client: SupabaseClient
) -> PanelResponseTemplateService:
    """Initialize the panel response template service."""
    global _panel_response_template_service
    _panel_response_template_service = PanelResponseTemplateService(supabase_client)

    # Pre-load templates
    await _panel_response_template_service.load_templates()

    logger.info("panel_response_template_service_initialized")
    return _panel_response_template_service


def get_panel_response_template_service() -> Optional[PanelResponseTemplateService]:
    """Get the global panel response template service instance."""
    return _panel_response_template_service


__all__ = [
    'PanelResponseTemplateService',
    'initialize_panel_response_template_service',
    'get_panel_response_template_service',
]
