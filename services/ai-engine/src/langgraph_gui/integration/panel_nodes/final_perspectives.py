"""
Final Perspectives Node
Collect final perspectives from experts (Open Panel)
"""

import json
from datetime import datetime
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class FinalPerspectivesNode(PanelNode):
    """Final perspectives phase for open panel"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Final Perspectives")
        self._emit_event(state, "log", {"message": "🔵 Phase: Final Perspectives", "level": "info"})
        state["current_phase"] = "final_perspectives"
        
        self._emit_event(state, "phase_start", {"phase": "final_perspectives"})
        
        expert_tasks = state.get("expert_tasks", [])
        workflow_prompt = state.get("workflow_system_prompt")
        final_perspectives = []
        
        for idx, expert_task in enumerate(expert_tasks, 1):
            expert_name = expert_task.get("name", f"Expert {idx}")
            expert_config = expert_task.get("config", {})
            
            self._log(f"👤 Expert {idx}/{len(expert_tasks)}: {expert_name} providing final perspective...")
            self._emit_event(state, "log", {"message": f"👤 Expert {idx}/{len(expert_tasks)}: {expert_name} providing final perspective...", "level": "info"})
            
            def expert_log_callback(msg, level="info"):
                self._log(f"  → {msg}", level)
                self._emit_event(state, "log", {"message": f"Expert {expert_name}: {msg}", "level": level})
            
            perspective = await self.task_executor.execute_expert_task(
                expert_config,
                expert_name,
                f"Provide your final perspective on the innovation approaches for query: {state['query']}. Consider the identified themes: {json.dumps(state['themes'])} and clusters: {json.dumps(state['clusters'])}",
                expert_task.get("context", {}),
                [],
                workflow_prompt,
                expert_log_callback
            )
            final_perspectives.append({"expert": expert_name, "perspective": perspective})
            self._emit_event(state, "expert_speaking", {"expert_name": expert_name, "content": perspective})
            self._log(f"✅ Expert {expert_name} completed final perspective")
            self._emit_event(state, "log", {"message": f"✅ Expert {expert_name} completed final perspective", "level": "success"})
        
        state["final_perspectives"] = final_perspectives
        self._emit_event(state, "phase_complete", {"phase": "final_perspectives"})
        self._log("✅ Final Perspectives completed")
        return state

