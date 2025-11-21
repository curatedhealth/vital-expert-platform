"""
Panel Registry System
Enables dynamic registration and discovery of panel workflow types
"""

from typing import Dict, Type, Optional, List, Any
from .base_panel import BasePanelWorkflow
from .base import PanelType


class PanelRegistry:
    """
    Registry for panel workflow types.
    Allows dynamic registration of new panel types.
    """
    
    _instance: Optional['PanelRegistry'] = None
    _panels: Dict[str, Type[BasePanelWorkflow]] = {}
    _panel_metadata: Dict[str, Dict[str, Any]] = {}
    
    def __new__(cls):
        """Singleton pattern"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def register(
        self,
        panel_type: PanelType,
        panel_class: Type[BasePanelWorkflow],
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Register a panel workflow type
        
        Args:
            panel_type: PanelType enum value
            panel_class: Class that implements BasePanelWorkflow
            metadata: Optional metadata about the panel type
        """
        type_key = panel_type.value
        self._panels[type_key] = panel_class
        self._panel_metadata[type_key] = metadata or {
            "name": panel_type.value,
            "description": f"{panel_type.value} panel workflow"
        }
    
    def get(self, panel_type: str) -> Optional[Type[BasePanelWorkflow]]:
        """
        Get panel class by type string
        
        Args:
            panel_type: Panel type string (e.g., "structured", "open")
            
        Returns:
            Panel class or None if not found
        """
        return self._panels.get(panel_type)
    
    def create(
        self,
        panel_type: str,
        openai_api_key: Optional[str] = None,
        task_executor: Optional[Any] = None,
        log_callback: Optional[callable] = None
    ) -> Optional[BasePanelWorkflow]:
        """
        Create panel workflow instance
        
        Args:
            panel_type: Panel type string
            openai_api_key: OpenAI API key
            task_executor: Task executor instance
            log_callback: Logging callback
            
        Returns:
            Panel workflow instance or None if type not found
        """
        panel_class = self.get(panel_type)
        if panel_class:
            return panel_class(
                openai_api_key=openai_api_key,
                task_executor=task_executor,
                log_callback=log_callback
            )
        return None
    
    def list_types(self) -> List[str]:
        """
        List all registered panel types
        
        Returns:
            List of panel type strings
        """
        return list(self._panels.keys())
    
    def get_metadata(self, panel_type: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a panel type
        
        Args:
            panel_type: Panel type string
            
        Returns:
            Metadata dictionary or None
        """
        return self._panel_metadata.get(panel_type)
    
    def get_all_metadata(self) -> Dict[str, Dict[str, Any]]:
        """
        Get metadata for all registered panel types
        
        Returns:
            Dictionary mapping panel types to their metadata
        """
        return self._panel_metadata.copy()


# Global registry instance
panel_registry = PanelRegistry()


def register_panel(
    panel_type: PanelType,
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Decorator to register a panel workflow class
    
    Usage:
        @register_panel(PanelType.STRUCTURED, {"name": "Structured Panel", "description": "..."})
        class StructuredPanelWorkflow(BasePanelWorkflow):
            ...
    """
    def decorator(panel_class: Type[BasePanelWorkflow]):
        panel_registry.register(panel_type, panel_class, metadata)
        return panel_class
    return decorator

