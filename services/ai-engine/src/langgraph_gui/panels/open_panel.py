"""
Open Panel Workflow (Type 2)
Parallel collaborative exploration for innovation and brainstorming
Uses flexible node-based system controlled from frontend
"""

from typing import Dict, Any, Optional, AsyncGenerator
from .base import PanelType
from .base_panel import BasePanelWorkflow
from .flexible_workflow import FlexiblePanelWorkflow
from .registry import register_panel


@register_panel(
    PanelType.OPEN,
    {
        "name": "Open Panel",
        "description": "Parallel collaborative exploration for innovation and brainstorming",
        "features": ["free_dialogue", "theme_clustering", "innovation_exploration"]
    }
)
class OpenPanelWorkflow(BasePanelWorkflow):
    """
    Open Panel workflow implementation using flexible node system
    Can be configured from frontend or uses default structure
    """
    
    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        task_executor: Optional[Any] = None,
        log_callback: Optional[callable] = None
    ):
        """Initialize open panel workflow"""
        super().__init__(openai_api_key, task_executor, log_callback)
        self.flexible_workflow = FlexiblePanelWorkflow(
            openai_api_key,
            task_executor,
            log_callback
        )
    
    def get_panel_type(self) -> PanelType:
        """Return panel type"""
        return PanelType.OPEN
    
    async def execute(
        self,
        config: Dict[str, Any],
        tenant_id: str = "default"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute open panel workflow with streaming
        
        Args:
            config: Panel configuration (may include nodes/edges from frontend)
            tenant_id: Tenant identifier
            
        Yields:
            SSE events as dictionaries
        """
        # Ensure panel type is set
        config["panel_type"] = PanelType.OPEN.value
        
        # Delegate to flexible workflow
        async for event in self.flexible_workflow.execute(config, tenant_id):
            yield event
    
    def get_config_schema(self) -> Dict[str, Any]:
        """Get configuration schema for open panel"""
        schema = super().get_config_schema()
        schema.update({
            "innovation_focus": {
                "type": "string",
                "required": False,
                "description": "Focus area for innovation exploration"
            },
            "theme_clustering": {
                "type": "boolean",
                "required": False,
                "default": True,
                "description": "Enable automatic theme clustering"
            }
        })
        return schema
