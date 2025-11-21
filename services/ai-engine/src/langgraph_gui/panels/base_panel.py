"""
Base Panel Workflow Interface
Abstract base class for all panel workflow types
Enables extensible panel system for adding new panel types
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, AsyncGenerator
from .base import PanelType, PanelConfig


class BasePanelWorkflow(ABC):
    """
    Abstract base class for all panel workflow implementations.
    All panel types must inherit from this class and implement the required methods.
    """
    
    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        task_executor: Optional[Any] = None,
        log_callback: Optional[callable] = None
    ):
        """
        Initialize base panel workflow
        
        Args:
            openai_api_key: OpenAI API key for LLM calls
            task_executor: Task executor instance
            log_callback: Optional callback for logging messages
        """
        self.openai_api_key = openai_api_key
        self.task_executor = task_executor
        self.log_callback = log_callback
    
    @abstractmethod
    async def execute(
        self,
        config: Dict[str, Any],
        tenant_id: str = "default"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute panel workflow with streaming
        
        Args:
            config: Panel configuration dictionary
            tenant_id: Tenant identifier
            
        Yields:
            SSE events as dictionaries
        """
        pass
    
    @abstractmethod
    def get_panel_type(self) -> PanelType:
        """
        Return the panel type this workflow implements
        
        Returns:
            PanelType enum value
        """
        pass
    
    def validate_config(self, config: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate panel configuration
        
        Args:
            config: Configuration dictionary to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Basic validation - can be overridden by subclasses
        if not config.get("query"):
            return False, "Query is required"
        
        if not config.get("panel_type"):
            return False, "Panel type is required"
        
        return True, None
    
    def get_config_schema(self) -> Dict[str, Any]:
        """
        Get configuration schema for this panel type
        
        Returns:
            Dictionary describing the expected configuration structure
        """
        return {
            "query": {
                "type": "string",
                "required": True,
                "description": "The question or topic for the panel discussion"
            },
            "panel_type": {
                "type": "string",
                "required": True,
                "description": "Type of panel workflow"
            },
            "nodes": {
                "type": "array",
                "required": False,
                "description": "Custom node configurations"
            },
            "edges": {
                "type": "array",
                "required": False,
                "description": "Custom edge configurations"
            }
        }
    
    def _log(self, message: str, level: str = "info"):
        """Log message using callback or print"""
        if self.log_callback:
            self.log_callback(message, level)
        else:
            print(f"[{self.get_panel_type().value.upper()}Panel] {message}")




