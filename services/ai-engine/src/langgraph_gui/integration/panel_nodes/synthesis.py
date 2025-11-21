"""
Synthesis Node
Generate final synthesis report (Open Panel)
"""

from .base import PanelNode
from langgraph_gui.panels.base import PanelState, PanelStatus


class SynthesisNode(PanelNode):
    """Final synthesis phase"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Final Synthesis & Report Generation")
        self._emit_event(state, "log", {"message": "🔵 Phase: Final Synthesis & Report Generation", "level": "info"})
        state["current_phase"] = "synthesis"
        
        self._emit_event(state, "phase_start", {"phase": "synthesis"})
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        workflow_prompt = state.get("workflow_system_prompt")
        
        self._log("🎤 Moderator generating final synthesis report...")
        self._emit_event(state, "log", {"message": "🎤 Moderator generating final synthesis report...", "level": "info"})
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Moderator: {msg}", "level": level})
        
        # Use documentation generator task for final report
        panel_data = {
            "query": state["query"],
            "opening_statements": state["opening_statements"],
            "dialogue_turns": state["dialogue_turns"],
            "themes": state["themes"],
            "clusters": state["clusters"],
            "final_perspectives": state["final_perspectives"],
            "convergence_points": state["convergence_points"],
            "divergence_points": state["divergence_points"],
            "workflow_system_prompt": state["workflow_system_prompt"]
        }
        
        final_report = await self.task_executor.execute_documentation_generation(
            moderator_config,
            panel_data,
            workflow_prompt,
            log_callback
        )
        state["final_report"] = final_report
        state["status"] = PanelStatus.COMPLETED.value
        
        self._log("✅ Final synthesis and report generation completed")
        self._emit_event(state, "log", {"message": "✅ Final synthesis and report generation completed", "level": "success"})
        self._emit_event(state, "synthesis_complete", {
            "final_report": final_report,
            "status": state["status"],
            "duration": f"{state.get('current_round', 0)} dialogue turns"
        })
        self._emit_event(state, "panel_complete", {
            "final_report": final_report,
            "status": state["status"],
            "duration": f"{state.get('current_round', 0)} dialogue turns"
        })
        self._emit_event(state, "phase_complete", {"phase": "synthesis"})
        
        return state

