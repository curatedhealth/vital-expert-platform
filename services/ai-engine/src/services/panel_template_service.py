"""
Panel Template Service
Loads panel templates dynamically from Supabase template_library table
"""

from typing import List, Dict, Any, Optional
import structlog
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class PanelTemplateService:
    """Service for managing panel templates from Supabase"""

    def __init__(self, supabase_client: SupabaseClient):
        self.supabase = supabase_client
        self._templates_cache: Optional[List[Dict[str, Any]]] = None

    async def get_all_panel_templates(self, tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch all Ask Panel templates from Supabase template_library table

        Args:
            tenant_id: Optional tenant filter for multi-tenancy

        Returns:
            List of panel template dictionaries with metadata
        """
        try:
            logger.info("Fetching panel templates from Supabase", tenant_id=tenant_id)

            # Query template_library for panel templates
            query = self.supabase.client.table('template_library')\
                .select('*')\
                .eq('template_category', 'panel_discussion')\
                .eq('framework', 'langgraph')\
                .eq('is_public', True)

            # Add tenant filter if provided
            if tenant_id:
                query = query.eq('tenant_id', tenant_id)

            response = await query.execute()

            if not response.data:
                logger.warning("No panel templates found in database")
                return []

            templates = response.data
            logger.info(f"✅ Loaded {len(templates)} panel templates from Supabase")

            # Cache templates
            self._templates_cache = templates

            return templates

        except Exception as e:
            logger.error(f"Failed to load panel templates: {e}", error=str(e))
            return []

    async def get_template_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific panel template by slug

        Args:
            slug: Template slug (e.g., 'ap_mode_1', 'ap_mode_2')

        Returns:
            Template dictionary or None if not found
        """
        try:
            response = await self.supabase.client.table('template_library')\
                .select('*')\
                .eq('template_slug', slug)\
                .single()\
                .execute()

            if response.data:
                logger.info(f"✅ Found template: {slug}")
                return response.data
            else:
                logger.warning(f"Template not found: {slug}")
                return None

        except Exception as e:
            logger.error(f"Failed to get template {slug}: {e}")
            return None

    async def get_template_by_mode_code(self, mode_code: str) -> Optional[Dict[str, Any]]:
        """
        Get panel template by mode code from metadata

        Args:
            mode_code: Mode code (e.g., 'ap_mode_1')

        Returns:
            Template dictionary or None if not found
        """
        templates = await self.get_all_panel_templates()

        for template in templates:
            metadata = template.get('content', {}).get('metadata', {})
            if metadata.get('mode_code') == mode_code:
                return template

        return None

    def get_cached_templates(self) -> Optional[List[Dict[str, Any]]]:
        """Get cached templates without fetching from database"""
        return self._templates_cache

    async def get_template_metadata(self, template_slug: str) -> Dict[str, Any]:
        """
        Extract metadata from template for workflow execution

        Args:
            template_slug: Template slug

        Returns:
            Dictionary with execution metadata
        """
        template = await self.get_template_by_slug(template_slug)

        if not template:
            return {}

        content = template.get('content', {})
        metadata = content.get('metadata', {})

        return {
            'template_name': template.get('template_name'),
            'display_name': template.get('display_name'),
            'description': template.get('description'),
            'max_agents': metadata.get('max_agents', 6),
            'panel_type': metadata.get('panel_type', 'open'),
            'mode_code': metadata.get('mode_code'),
            'voting_enabled': metadata.get('voting_enabled', False),
            'enable_tools': metadata.get('enable_tools', False),
            'rounds': metadata.get('rounds', 1),
            'depth': metadata.get('depth', 'standard'),
            'nodes': content.get('nodes', []),
            'edges': content.get('edges', [])
        }


# Global instance
_panel_template_service: Optional[PanelTemplateService] = None


async def initialize_panel_template_service(supabase_client: SupabaseClient) -> PanelTemplateService:
    """Initialize the panel template service"""
    global _panel_template_service
    _panel_template_service = PanelTemplateService(supabase_client)
    logger.info("✅ Panel template service initialized")
    return _panel_template_service


def get_panel_template_service() -> Optional[PanelTemplateService]:
    """Get the global panel template service instance"""
    return _panel_template_service
