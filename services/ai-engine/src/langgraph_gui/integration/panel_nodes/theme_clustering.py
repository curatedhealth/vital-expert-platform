"""
Theme Clustering Node
Identify themes and innovation clusters (Open Panel)
"""

import json
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class ThemeClusteringNode(PanelNode):
    """Theme identification and clustering phase"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Theme Identification & Clustering")
        self._emit_event(state, "log", {"message": "🔵 Phase: Theme Identification & Clustering", "level": "info"})
        state["current_phase"] = "theme_clustering"
        
        self._emit_event(state, "phase_start", {"phase": "theme_clustering"})
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        workflow_prompt = state.get("workflow_system_prompt")
        
        self._log("🎤 Moderator analyzing dialogue for themes and clusters...")
        self._emit_event(state, "log", {"message": "🎤 Moderator analyzing dialogue for themes and clusters...", "level": "info"})
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Moderator: {msg}", "level": level})
        
        # Use moderator to identify themes and clusters
        theme_analysis_result = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Analyze the following discussion for query: {state['query']}. Identify key themes, innovation clusters, convergence points, and divergence points. Discussion: {json.dumps(state['dialogue_turns'])}",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        
        # Parse the result (assuming it's JSON for themes/clusters)
        try:
            parsed_analysis = json.loads(theme_analysis_result)
            state["themes"] = parsed_analysis.get("themes", [])
            state["clusters"] = parsed_analysis.get("clusters", [])
            state["convergence_points"] = parsed_analysis.get("convergence_points", [])
            state["divergence_points"] = parsed_analysis.get("divergence_points", [])
            self._log("✅ Theme analysis completed and parsed successfully")
            self._emit_event(state, "log", {"message": "✅ Theme analysis completed and parsed successfully", "level": "success"})
        except json.JSONDecodeError:
            self._log(f"⚠️ Failed to parse theme analysis result as JSON: {theme_analysis_result}", "warning")
            self._emit_event(state, "log", {"message": f"⚠️ Failed to parse theme analysis result as JSON: {theme_analysis_result}", "level": "warning"})
            state["themes"] = [{"name": "Unstructured Ideas", "description": theme_analysis_result}]
            state["clusters"] = []
        
        self._emit_event(state, "theme_analysis", {
            "themes": state["themes"],
            "clusters": state["clusters"],
            "convergence": state["convergence_points"],
            "divergence": state["divergence_points"]
        })
        self._emit_event(state, "phase_complete", {"phase": "theme_clustering"})
        self._log("✅ Theme Identification & Clustering completed")
        return state

