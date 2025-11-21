"""
Free Dialogue Node
Free-form collaborative dialogue (Open Panel)
"""

import json
from datetime import datetime
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class FreeDialogueNode(PanelNode):
    """Free-form dialogue phase for open panel"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Free-Form Dialogue")
        self._emit_event(state, "log", {"message": "🔵 Phase: Free-Form Dialogue", "level": "info"})
        state["current_phase"] = "free_dialogue"
        state["current_round"] = state.get("current_round", 0) + 1
        
        self._emit_event(state, "phase_start", {"phase": "free_dialogue"})
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        expert_tasks = state.get("expert_tasks", [])
        workflow_prompt = state.get("workflow_system_prompt")
        
        # Moderator synthesizes opening and sets up free dialogue
        self._log("🎤 Moderator synthesizing opening statements and initiating free dialogue...")
        self._emit_event(state, "log", {"message": "🎤 Moderator synthesizing opening statements and initiating free dialogue...", "level": "info"})
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Moderator: {msg}", "level": level})
        
        initial_synthesis = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Synthesize the following opening statements for query: {state['query']}. Then, open the floor for free-form discussion, encouraging experts to build on each other's ideas. Statements: {json.dumps(state['opening_statements'])}",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        self._emit_event(state, "moderator_speaking", {"content": initial_synthesis})
        self._log("✅ Moderator initiated free dialogue")
        
        dialogue_turns = state.get("dialogue_turns", [])
        
        # Simulate a few turns of free dialogue
        num_dialogue_turns = self.config.get("num_turns", 3)
        for i in range(num_dialogue_turns):
            self._log(f"💬 Simulating dialogue turn {i+1}/{num_dialogue_turns}...")
            self._emit_event(state, "log", {"message": f"💬 Simulating dialogue turn {i+1}/{num_dialogue_turns}...", "level": "info"})
            
            # Select an expert to speak (simple round-robin for now)
            speaker_idx = i % len(expert_tasks)
            current_expert_task = expert_tasks[speaker_idx]
            expert_name = current_expert_task.get("name", f"Expert {speaker_idx+1}")
            expert_config = current_expert_task.get("config", {})
            
            self._log(f"👤 Expert {expert_name} contributing to dialogue...")
            self._emit_event(state, "log", {"message": f"👤 Expert {expert_name} contributing to dialogue...", "level": "info"})
            
            def expert_log_callback(msg, level="info"):
                self._log(f"  → Expert {expert_name}: {msg}", level)
                self._emit_event(state, "log", {"message": f"Expert {expert_name}: {msg}", "level": level})
            
            expert_contribution = await self.task_executor.execute_expert_task(
                expert_config,
                expert_name,
                f"Contribute to the ongoing discussion about: {state['query']}. Current discussion: {json.dumps(dialogue_turns)}. Build on previous ideas or introduce a new perspective.",
                current_expert_task.get("context", {}),
                [d["content"] for d in dialogue_turns],
                workflow_prompt,
                expert_log_callback
            )
            dialogue_turns.append({"speaker": expert_name, "content": expert_contribution, "type": "dialogue"})
            self._emit_event(state, "expert_speaking", {"expert_name": expert_name, "content": expert_contribution})
            self._log(f"✅ Expert {expert_name} completed dialogue contribution")
            self._emit_event(state, "log", {"message": f"✅ Expert {expert_name} completed dialogue contribution", "level": "success"})
        
        state["dialogue_turns"] = dialogue_turns
        self._emit_event(state, "phase_complete", {"phase": "free_dialogue"})
        self._log("✅ Free-Form Dialogue completed")
        return state

