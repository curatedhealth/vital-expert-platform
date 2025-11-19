"""
Discussion Round Node
Moderated discussion round with expert responses
Supports Round 1 (Exploration), Round 2 (Deep Analysis), Round 3 (Resolution)
"""

import json
from datetime import datetime
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class DiscussionRoundNode(PanelNode):
    """Discussion round phase - moderated discussion with experts"""
    
    async def execute(self, state: PanelState) -> PanelState:
        current_round = state.get("current_round", 0) + 1
        state["current_round"] = current_round
        state["current_phase"] = f"round_{current_round}"
        
        # Determine round type based on round number
        if current_round == 1:
            round_type = "exploration"
            round_description = "Round 1: Exploration (3-4 minutes)"
        elif current_round == 2:
            round_type = "deep_analysis"
            round_description = "Round 2: Deep Analysis (3-4 minutes)"
        else:
            round_type = "resolution"
            round_description = f"Round 3: Resolution (2-3 minutes)"
        
        self._log(f"🔵 Phase: {round_description}")
        self._emit_event(state, "log", {"message": f"🔵 Phase: {round_description}", "level": "info"})
        self._emit_event(state, "phase_start", {"phase": f"round_{current_round}", "round_type": round_type})
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        expert_tasks = state.get("expert_tasks", [])
        workflow_prompt = state.get("workflow_system_prompt")
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Moderator: {msg}", "level": level})
        
        # Round 1: Exploration - Multiple questions, probes, follow-ups
        if current_round == 1:
            await self._execute_round_1_exploration(
                state, moderator_config, expert_tasks, workflow_prompt, log_callback
            )
        
        # Round 2: Deep Analysis - Targeted questions, stress testing, challenges
        elif current_round == 2:
            await self._execute_round_2_deep_analysis(
                state, moderator_config, expert_tasks, workflow_prompt, log_callback
            )
        
        # Round 3: Resolution - Final positions, decision framing
        else:
            await self._execute_round_3_resolution(
                state, moderator_config, expert_tasks, workflow_prompt, log_callback
            )
        
        state["rounds_completed"] = current_round
        
        # Moderator summary of round
        self._log(f"🎤 Moderator summarizing Round {current_round}...")
        self._emit_event(state, "log", {"message": f"🎤 Moderator summarizing Round {current_round}...", "level": "info"})
        
        round_summary = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Summarize Round {current_round} discussion for query: {state['query']}. Key points: {json.dumps(state.get('dialogue_turns', [])[-len(expert_tasks)*2:])}. Identify gaps, agreements, and areas needing further discussion.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        state["dialogue_turns"].append({
            "speaker": moderator_task.get("name", "Moderator"),
            "content": round_summary,
            "type": "summary",
            "round": current_round
        })
        self._emit_event(state, "moderator_speaking", {"content": round_summary, "type": "summary"})
        
        self._log(f"✅ Round {current_round} complete")
        self._emit_event(state, "phase_complete", {"phase": f"round_{current_round}"})
        
        return state
    
    async def _execute_round_1_exploration(
        self, state: PanelState, moderator_config: dict, expert_tasks: list,
        workflow_prompt: str, log_callback: callable
    ):
        """Round 1: Exploration - Multiple questions, probes, follow-ups"""
        self._log("🔍 Round 1: Exploration phase")
        
        # Moderator analyzes openings and plans questions
        opening_statements = state.get("opening_statements", [])
        moderator_analysis = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Analyze the opening statements for query: {state['query']}. Statements: {json.dumps(opening_statements)}. Identify 3-5 key themes and questions to explore in Round 1.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        
        # Execute 3-5 question cycles
        num_questions = min(5, max(3, len(expert_tasks)))
        for q_num in range(1, num_questions + 1):
            # Moderator poses question
            self._log(f"🎤 Moderator posing Question {q_num}/{num_questions}...")
            moderator_question = await self.task_executor.execute_moderator_task(
                moderator_config,
                f"Round 1, Question {q_num} for query: {state['query']}. Previous discussion: {json.dumps(state.get('dialogue_turns', [])[-10:])}. Pose a focused question to explore this topic.",
                state.get("context", {}),
                workflow_prompt,
                log_callback
            )
            state["dialogue_turns"].append({
                "speaker": "Moderator",
                "content": moderator_question,
                "type": "question",
                "round": 1,
                "question_num": q_num
            })
            self._emit_event(state, "moderator_speaking", {"content": moderator_question})
            
            # Experts respond sequentially
            for idx, expert_task in enumerate(expert_tasks, 1):
                expert_name = expert_task.get("name", f"Expert {idx}")
                expert_config = expert_task.get("config", {})
                
                self._log(f"👤 Expert {expert_name} responding to Q{q_num}...")
                expert_response = await self.task_executor.execute_expert_task(
                    expert_config,
                    expert_name,
                    f"Respond to Question {q_num}: {moderator_question}. Consider previous discussion: {json.dumps(state.get('dialogue_turns', [])[-5:])}",
                    expert_task.get("context", {}),
                    [d["content"] for d in state.get("dialogue_turns", [])],
                    workflow_prompt,
                    lambda msg, level="info": self._log(f"  → Expert {expert_name}: {msg}", level)
                )
                state["dialogue_turns"].append({
                    "speaker": expert_name,
                    "content": expert_response,
                    "type": "response",
                    "round": 1,
                    "question_num": q_num
                })
                self._emit_event(state, "expert_speaking", {
                    "expert_name": expert_name,
                    "content": expert_response
                })
            
            # Moderator follow-up probe (optional, every other question)
            if q_num % 2 == 0:
                follow_up = await self.task_executor.execute_moderator_task(
                    moderator_config,
                    f"Probe deeper on Question {q_num} responses: {json.dumps(state.get('dialogue_turns', [])[-len(expert_tasks):])}. Ask a clarifying or challenging follow-up.",
                    state.get("context", {}),
                    workflow_prompt,
                    log_callback
                )
                state["dialogue_turns"].append({
                    "speaker": "Moderator",
                    "content": follow_up,
                    "type": "probe",
                    "round": 1
                })
                self._emit_event(state, "moderator_speaking", {"content": follow_up, "type": "probe"})
    
    async def _execute_round_2_deep_analysis(
        self, state: PanelState, moderator_config: dict, expert_tasks: list,
        workflow_prompt: str, log_callback: callable
    ):
        """Round 2: Deep Analysis - Targeted questions, stress testing, challenges"""
        self._log("🔬 Round 2: Deep Analysis phase")
        
        # Identify gaps from Round 1
        round_1_dialogue = [d for d in state.get("dialogue_turns", []) if d.get("round") == 1]
        gap_analysis = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Analyze Round 1 discussion for query: {state['query']}. Dialogue: {json.dumps(round_1_dialogue)}. Identify unresolved conflicts, technical uncertainties, and risk areas not addressed.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        
        # Targeted questions addressing gaps
        for gap_num in range(1, 3):  # 2-3 targeted questions
            targeted_question = await self.task_executor.execute_moderator_task(
                moderator_config,
                f"Round 2, Targeted Question {gap_num} addressing gaps. Query: {state['query']}. Previous discussion: {json.dumps(state.get('dialogue_turns', [])[-5:])}. Pose a targeted question to address a specific gap or conflict.",
                state.get("context", {}),
                workflow_prompt,
                log_callback
            )
            state["dialogue_turns"].append({
                "speaker": "Moderator",
                "content": targeted_question,
                "type": "targeted_question",
                "round": 2
            })
            self._emit_event(state, "moderator_speaking", {"content": targeted_question})
            
            # Expert deep dive
            for expert_task in expert_tasks:
                expert_name = expert_task.get("name", "Expert")
                expert_response = await self.task_executor.execute_expert_task(
                    expert_task.get("config", {}),
                    expert_name,
                    f"Provide a deep dive response to: {targeted_question}",
                    expert_task.get("context", {}),
                    [d["content"] for d in state.get("dialogue_turns", [])],
                    workflow_prompt,
                    lambda msg, level="info": self._log(f"  → {msg}", level)
                )
                state["dialogue_turns"].append({
                    "speaker": expert_name,
                    "content": expert_response,
                    "type": "deep_dive",
                    "round": 2
                })
                self._emit_event(state, "expert_speaking", {
                    "expert_name": expert_name,
                    "content": expert_response
                })
            
            # Moderator challenge/stress test
            challenge = await self.task_executor.execute_moderator_task(
                moderator_config,
                f"Challenge the responses to Question {gap_num}: {json.dumps(state.get('dialogue_turns', [])[-len(expert_tasks):])}. Play devil's advocate or stress test the leading recommendation.",
                state.get("context", {}),
                workflow_prompt,
                log_callback
            )
            state["dialogue_turns"].append({
                "speaker": "Moderator",
                "content": challenge,
                "type": "challenge",
                "round": 2
            })
            self._emit_event(state, "moderator_speaking", {"content": challenge, "type": "challenge"})
    
    async def _execute_round_3_resolution(
        self, state: PanelState, moderator_config: dict, expert_tasks: list,
        workflow_prompt: str, log_callback: callable
    ):
        """Round 3: Resolution - Final positions, decision framing"""
        self._log("🎯 Round 3: Resolution phase")
        
        # Moderator frames decision
        decision_frame = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Frame the final decision for query: {state['query']}. Previous discussion: {json.dumps(state.get('dialogue_turns', [])[-10:])}. Present 2-3 clear options and request final positions from each expert.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        state["dialogue_turns"].append({
            "speaker": "Moderator",
            "content": decision_frame,
            "type": "decision_frame",
            "round": 3
        })
        self._emit_event(state, "moderator_speaking", {"content": decision_frame})
        
        # Experts provide final positions
        for idx, expert_task in enumerate(expert_tasks, 1):
            expert_name = expert_task.get("name", f"Expert {idx}")
            final_position = await self.task_executor.execute_expert_task(
                expert_task.get("config", {}),
                expert_name,
                f"Provide your final position and recommendation for: {state['query']}. Consider all previous discussion: {json.dumps(state.get('dialogue_turns', [])[-15:])}. State your clear recommendation and rationale.",
                expert_task.get("context", {}),
                [d["content"] for d in state.get("dialogue_turns", [])],
                workflow_prompt,
                lambda msg, level="info": self._log(f"  → Expert {expert_name}: {msg}", level)
            )
            state["dialogue_turns"].append({
                "speaker": expert_name,
                "content": final_position,
                "type": "final_position",
                "round": 3
            })
            self._emit_event(state, "expert_speaking", {
                "expert_name": expert_name,
                "content": final_position
            })
