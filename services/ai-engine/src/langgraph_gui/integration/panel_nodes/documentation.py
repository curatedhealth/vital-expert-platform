"""
Documentation Node
Generate final panel documentation and report
"""

from .base import PanelNode
from langgraph_gui.panels.base import PanelState, PanelStatus


class DocumentationNode(PanelNode):
    """Documentation phase - generate final report"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Documentation Generation")
        self._emit_event(state, "log", {"message": "🔵 Phase: Documentation Generation", "level": "info"})
        state["current_phase"] = "documentation"
        
        self._emit_event(state, "phase_start", {"phase": "documentation"})
        
        # Prepare panel data for documentation
        panel_data = {
            "query": state["query"],
            "experts": [t.get("name", "Expert") for t in state.get("expert_tasks", [])],
            "opening_statements": state.get("opening_statements", []),
            "dialogue_turns": state.get("dialogue_turns", []),
            "final_consensus_statement": state.get("final_consensus_statement", "N/A"),
            "consensus_level": state.get("consensus_level", 0.0),
            "rounds_completed": state.get("rounds_completed", 0),
            "max_rounds": state.get("max_rounds", 3),
            "consensus_threshold": state.get("consensus_threshold", 0.75),
            "workflow_system_prompt": state.get("workflow_system_prompt")
        }
        
        # Use documentation generator task
        self._log("📄 Executing documentation generator task...")
        self._emit_event(state, "log", {"message": "📄 Executing documentation generator task...", "level": "info"})
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        workflow_prompt = state.get("workflow_system_prompt")
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"DocGen: {msg}", "level": level})
        
        final_report = await self.task_executor.execute_documentation_generation(
            moderator_config,
            panel_data,
            workflow_prompt,
            log_callback
        )
        state["final_report"] = final_report
        state["status"] = PanelStatus.COMPLETED.value
        
        self._log("✅ Documentation generation completed")
        self._emit_event(state, "log", {"message": "✅ Documentation generation completed", "level": "success"})
        self._emit_event(state, "panel_complete", {
            "final_report": final_report,
            "consensus_level": state.get("consensus_level", 0.0),
            "status": state["status"],
            "duration": f"{state.get('rounds_completed', 0)} rounds"
        })
        self._emit_event(state, "phase_complete", {"phase": "documentation"})
        
        return state

