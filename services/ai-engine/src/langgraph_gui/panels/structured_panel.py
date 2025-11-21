"""
Structured Panel Workflow (Type 1)
Sequential, moderated discussion for formal decisions
Uses flexible node-based system controlled from frontend
"""

from typing import Dict, Any, Optional, AsyncGenerator
from .base import PanelType
from .base_panel import BasePanelWorkflow
from .flexible_workflow import FlexiblePanelWorkflow
from .registry import register_panel


@register_panel(
    PanelType.STRUCTURED,
    {
        "name": "Structured Panel",
        "description": "Sequential, moderated discussion for formal decisions",
        "features": ["agenda_management", "moderated_discussion", "consensus_building"]
    }
)
class StructuredPanelWorkflow(BasePanelWorkflow):
    """
    Structured Panel workflow implementation using flexible node system
    Can be configured from frontend or uses default structure
    """
    
    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        task_executor: Optional[Any] = None,
        log_callback: Optional[callable] = None
    ):
        """Initialize structured panel workflow"""
        super().__init__(openai_api_key, task_executor, log_callback)
        self.flexible_workflow = FlexiblePanelWorkflow(
            openai_api_key,
            task_executor,
            log_callback
        )
    
    def get_panel_type(self) -> PanelType:
        """Return panel type"""
        return PanelType.STRUCTURED
    
    async def execute(
        self,
        config: Dict[str, Any],
        tenant_id: str = "default"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute structured panel workflow with streaming
        
        Args:
            config: Panel configuration (may include nodes/edges from frontend)
            tenant_id: Tenant identifier
            
        Yields:
            SSE events as dictionaries
        """
        # Ensure panel type is set
        config["panel_type"] = PanelType.STRUCTURED.value
        
        # Delegate to flexible workflow
        async for event in self.flexible_workflow.execute(config, tenant_id):
            yield event
    
    def get_config_schema(self) -> Dict[str, Any]:
        """Get configuration schema for structured panel"""
        schema = super().get_config_schema()
        schema.update({
            "agenda_items": {
                "type": "array",
                "required": False,
                "description": "Agenda items for structured discussion"
            },
            "rounds": {
                "type": "integer",
                "required": False,
                "default": 3,
                "description": "Number of discussion rounds"
            }
        })
        return schema
