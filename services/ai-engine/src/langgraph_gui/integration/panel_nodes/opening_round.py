"""
Opening Round Node
Initial perspectives from experts (Open Panel)
"""

from datetime import datetime
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class OpeningRoundNode(PanelNode):
    """Opening round for open panel - initial perspectives"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Opening Round")
        self._emit_event(state, "log", {"message": "🔵 Phase: Opening Round", "level": "info"})
        state["current_phase"] = "opening_round"
        
        self._emit_event(state, "phase_start", {"phase": "opening_round"})
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        workflow_prompt = state.get("workflow_system_prompt")
        
        self._log("🎤 Moderator introducing opening round...")
        self._emit_event(state, "log", {"message": "🎤 Moderator introducing opening round...", "level": "info"})
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Moderator: {msg}", "level": level})
        
        moderator_intro = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Introduce the open panel discussion for query: {state['query']}. Encourage experts to provide initial, diverse perspectives.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        self._emit_event(state, "moderator_speaking", {"content": moderator_intro})
        
        expert_tasks = state.get("expert_tasks", [])
        opening_statements = []
        
        for idx, expert_task in enumerate(expert_tasks, 1):
            expert_name = expert_task.get("name", f"Expert {idx}")
            expert_config = expert_task.get("config", {})
            
            self._log(f"👤 Expert {idx}/{len(expert_tasks)}: {expert_name} providing opening statement...")
            self._emit_event(state, "log", {"message": f"👤 Expert {idx}/{len(expert_tasks)}: {expert_name} providing opening statement...", "level": "info"})
            
            def expert_log_callback(msg, level="info"):
                self._log(f"  → Expert {expert_name}: {msg}", level)
                self._emit_event(state, "log", {"message": f"Expert {expert_name}: {msg}", "level": level})
            
            statement = await self.task_executor.execute_expert_task(
                expert_config,
                expert_name,
                f"Provide your initial perspective on the query: {state['query']}",
                expert_task.get("context", {}),
                [],
                workflow_prompt,
                expert_log_callback
            )
            opening_statements.append({"expert": expert_name, "statement": statement})
            self._emit_event(state, "expert_speaking", {"expert_name": expert_name, "content": statement})
            self._log(f"✅ Expert {expert_name} completed opening statement")
            self._emit_event(state, "log", {"message": f"✅ Expert {expert_name} completed opening statement", "level": "success"})
        
        state["opening_statements"] = opening_statements
        self._emit_event(state, "phase_complete", {"phase": "opening_round"})
        self._log("✅ Opening Round completed")
        return state

