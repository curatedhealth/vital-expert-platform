"""
Base Panel Node Class
All panel workflow nodes inherit from this base class
"""

from typing import Dict, Any, Callable, Optional
from abc import ABC, abstractmethod
from langgraph_gui.panels.base import PanelState
from langgraph_gui.integration.panel_tasks import PanelTaskExecutor


class PanelNode(ABC):
    """Base class for panel workflow nodes"""
    
    def __init__(
        self,
        node_id: str,
        config: Dict[str, Any],
        task_executor: PanelTaskExecutor,
        log_callback: Optional[Callable] = None
    ):
        self.node_id = node_id
        self.config = config
        self.task_executor = task_executor
        self.log_callback = log_callback
    
    def _log(self, message: str, level: str = "info"):
        """Log message using callback or print"""
        if self.log_callback:
            self.log_callback(message, level)
        else:
            print(f"[{self.node_id}] {message}")
    
    def _emit_event(self, state: PanelState, event_type: str, data: Dict[str, Any]):
        """Emit SSE event"""
        from datetime import datetime
        events = state.get("events_emitted", [])
        event_id = state.get("last_event_id", 0) + 1
        
        event = {
            "id": event_id,
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        events.append(event)
        state["events_emitted"] = events
        state["last_event_id"] = event_id
    
    @abstractmethod
    async def execute(self, state: PanelState) -> PanelState:
        """Execute this node"""
        pass

