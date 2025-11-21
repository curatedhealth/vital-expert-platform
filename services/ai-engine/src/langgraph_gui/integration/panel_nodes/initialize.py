"""
Initialize Panel Node
Extracts tasks and sets up initial panel state
"""

from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class InitializeNode(PanelNode):
    """Initialize panel - extracts tasks and sets up state"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Initializing panel...")
        self._emit_event(state, "log", {"message": "🔵 Initializing panel...", "level": "info"})
        
        from langgraph_gui.panels.base import PanelStatus
        state["status"] = PanelStatus.EXECUTING.value
        state["current_round"] = 0
        state["rounds_completed"] = 0
        state["current_phase"] = "initialization"
        state["events_emitted"] = []
        state["last_event_id"] = 0
        state["opening_statements"] = []
        state["dialogue_turns"] = []
        state["consensus_history"] = []
        state["dissenting_opinions"] = []
        state["action_items"] = []
        
        # Extract tasks from state
        tasks = state.get("tasks", [])
        self._log(f"📋 Extracting tasks from workflow... Found {len(tasks)} total tasks")
        self._emit_event(state, "log", {"message": f"📋 Extracting tasks from workflow... Found {len(tasks)} total tasks", "level": "info"})
        
        expert_tasks = [t for t in tasks if t.get("task_id") == "expert_agent"]
        moderator_task = next((t for t in tasks if t.get("task_id") == "moderator"), None)
        
        if not expert_tasks:
            self._log(f"⚠️ WARNING: No expert tasks found. Total tasks: {len(tasks)}", "warning")
            self._emit_event(state, "log", {"message": f"⚠️ WARNING: No expert tasks found. Total tasks: {len(tasks)}", "level": "warning"})
        else:
            self._log(f"✅ Found {len(expert_tasks)} expert task(s)")
            self._emit_event(state, "log", {"message": f"✅ Found {len(expert_tasks)} expert task(s)", "level": "info"})
        
        if not moderator_task:
            self._log(f"⚠️ WARNING: No moderator task found. Total tasks: {len(tasks)}", "warning")
            self._emit_event(state, "log", {"message": f"⚠️ WARNING: No moderator task found. Total tasks: {len(tasks)}", "level": "warning"})
        else:
            self._log(f"✅ Found moderator task")
            self._emit_event(state, "log", {"message": "✅ Found moderator task", "level": "info"})
        
        state["expert_tasks"] = expert_tasks
        state["moderator_task"] = moderator_task
        state["speaking_order"] = [t.get("id", f"expert_{i}") for i, t in enumerate(expert_tasks)]
        state["current_speaker"] = 0
        
        self._emit_event(state, "panel_initialized", {
            "experts": len(expert_tasks),
            "rounds": state.get("max_rounds", 3),
            "threshold": state.get("consensus_threshold", 0.75)
        })
        
        self._log("✅ Panel initialized successfully")
        self._emit_event(state, "log", {"message": "✅ Panel initialized successfully", "level": "success"})
        return state

