"""
Consensus Assessment Node
Assesses consensus after each round and decides whether to skip next round
"""

import json
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class ConsensusAssessmentNode(PanelNode):
    """Assess consensus after a discussion round and decide next steps"""
    
    async def execute(self, state: PanelState) -> PanelState:
        current_round = state.get("current_round", 0)
        consensus_level = state.get("consensus_level", 0.0)
        
        self._log(f"📊 Assessing consensus after Round {current_round}...")
        self._emit_event(state, "log", {"message": f"📊 Assessing consensus after Round {current_round}...", "level": "info"})
        self._emit_event(state, "phase_start", {"phase": "consensus_assessment"})
        
        # Get all expert positions from dialogue
        expert_positions = []
        for dialogue in state.get("dialogue_turns", []):
            if dialogue.get("type") == "response":
                expert_positions.append({
                    "expert": dialogue.get("speaker"),
                    "content": dialogue.get("content")
                })
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        workflow_prompt = state.get("workflow_system_prompt")
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Assessment: {msg}", "level": level})
        
        # Calculate consensus
        consensus_result = await self.task_executor.execute_consensus_calculation(
            moderator_config,
            expert_positions,
            workflow_prompt
        )
        
        consensus_level = consensus_result.get("consensus_level", 0.0)
        state["consensus_level"] = consensus_level
        state["consensus_history"].append(consensus_level)
        
        # Decision logic based on round and consensus level
        should_skip_next_round = False
        next_action = "continue"
        
        if current_round == 1:
            # After Round 1: Skip Round 2 if consensus > 85%
            if consensus_level > 0.85:
                should_skip_next_round = True
                next_action = "skip_to_final"
                self._log(f"✅ Strong consensus ({consensus_level:.1%}) after Round 1 - may skip Round 2")
                self._emit_event(state, "log", {
                    "message": f"✅ Strong consensus ({consensus_level:.1%}) after Round 1 - may skip Round 2",
                    "level": "success"
                })
            elif consensus_level >= 0.60:
                next_action = "continue_to_round_2"
                self._log(f"📊 Partial consensus ({consensus_level:.1%}) - proceeding to Round 2")
            else:
                next_action = "continue_to_round_2_deep"
                self._log(f"⚠️ Low consensus ({consensus_level:.1%}) - deep dive Round 2 needed")
        
        elif current_round == 2:
            # After Round 2: Skip Round 3 if consensus > 80%
            if consensus_level > 0.80:
                should_skip_next_round = True
                next_action = "skip_to_consensus"
                self._log(f"✅ High consensus ({consensus_level:.1%}) after Round 2 - may skip Round 3")
                self._emit_event(state, "log", {
                    "message": f"✅ High consensus ({consensus_level:.1%}) after Round 2 - may skip Round 3",
                    "level": "success"
                })
            elif consensus_level >= 0.65:
                next_action = "continue_to_round_3"
                self._log(f"📊 Medium consensus ({consensus_level:.1%}) - proceeding to Round 3")
            else:
                next_action = "continue_to_round_3_forced"
                self._log(f"⚠️ Low consensus ({consensus_level:.1%}) - forced decision Round 3 needed")
        
        elif current_round >= 3:
            # After Round 3: Always proceed to consensus building
            next_action = "proceed_to_consensus"
            self._log(f"✅ Round 3 complete - proceeding to consensus building")
        
        # Store assessment results
        state["consensus_assessment"] = {
            "round": current_round,
            "consensus_level": consensus_level,
            "should_skip_next_round": should_skip_next_round,
            "next_action": next_action,
            "expert_positions_count": len(expert_positions)
        }
        
        self._emit_event(state, "consensus_assessment", {
            "round": current_round,
            "consensus_level": consensus_level,
            "should_skip_next_round": should_skip_next_round,
            "next_action": next_action
        })
        
        self._emit_event(state, "consensus_update", {
            "consensus_level": consensus_level,
            "round": current_round
        })
        
        self._log(f"✅ Consensus assessment complete: {next_action}")
        self._emit_event(state, "phase_complete", {
            "phase": "consensus_assessment",
            "consensus": consensus_level,
            "next_action": next_action
        })
        
        return state


