"""
Q&A Node
Question and Answer phase for structured panel
Allows moderator to field questions and experts to respond
"""

import json
from datetime import datetime
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class QANode(PanelNode):
    """Q&A phase - moderator fields questions, experts respond"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Q&A Session")
        self._emit_event(state, "log", {"message": "🔵 Phase: Q&A Session", "level": "info"})
        state["current_phase"] = "qna"
        
        self._emit_event(state, "phase_start", {"phase": "qna"})
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        expert_tasks = state.get("expert_tasks", [])
        workflow_prompt = state.get("workflow_system_prompt")
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Moderator: {msg}", "level": level})
        
        # Moderator opens Q&A session
        self._log("🎤 Moderator opening Q&A session...")
        self._emit_event(state, "log", {"message": "🎤 Moderator opening Q&A session...", "level": "info"})
        
        qna_opening = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Open the Q&A session for query: {state['query']}. "
            f"Previous discussion summary: {json.dumps(state.get('dialogue_turns', [])[-5:])}. "
            f"Invite questions from participants/audience and explain that experts will address them.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        self._emit_event(state, "moderator_speaking", {"content": qna_opening, "type": "qna_opening"})
        
        # Generate 2-4 questions (simulating audience questions)
        # In a real implementation, these could come from user input or be generated based on gaps
        num_questions = min(4, max(2, len(expert_tasks)))
        
        qna_questions = []
        for q_num in range(1, num_questions + 1):
            # Moderator poses/fields a question
            self._log(f"❓ Fielding Question {q_num}/{num_questions}...")
            self._emit_event(state, "log", {
                "message": f"❓ Fielding Question {q_num}/{num_questions}...",
                "level": "info"
            })
            
            # Generate question based on discussion gaps or common concerns
            question = await self.task_executor.execute_moderator_task(
                moderator_config,
                f"Generate a relevant question {q_num} for the Q&A session based on: "
                f"Query: {state['query']}. "
                f"Previous discussion: {json.dumps(state.get('dialogue_turns', [])[-10:])}. "
                f"Identify a gap, clarification need, or follow-up question that would be valuable. "
                f"Frame it as if coming from an audience member or participant.",
                state.get("context", {}),
                workflow_prompt,
                log_callback
            )
            
            qna_questions.append({
                "question_num": q_num,
                "question": question,
                "timestamp": datetime.now().isoformat()
            })
            
            state["dialogue_turns"].append({
                "speaker": "Moderator",
                "content": question,
                "type": "qna_question",
                "question_num": q_num
            })
            self._emit_event(state, "moderator_speaking", {
                "content": question,
                "type": "qna_question"
            })
            
            # Select 1-2 relevant experts to respond
            # In a real implementation, this could be based on question topic matching
            responding_experts = expert_tasks[:min(2, len(expert_tasks))]
            
            for expert_task in responding_experts:
                expert_name = expert_task.get("name", "Expert")
                expert_config = expert_task.get("config", {})
                
                self._log(f"👤 {expert_name} responding to Q&A question {q_num}...")
                self._emit_event(state, "log", {
                    "message": f"👤 {expert_name} responding to Q&A question {q_num}...",
                    "level": "info"
                })
                
                def expert_log_callback(msg, level="info"):
                    self._log(f"    → {expert_name}: {msg}", level)
                    self._emit_event(state, "log", {
                        "message": f"Expert {expert_name}: {msg}",
                        "level": level
                    })
                
                response = await self.task_executor.execute_expert_task(
                    expert_config,
                    expert_name,
                    f"Respond to this Q&A question: {question}. "
                    f"Query: {state['query']}. "
                    f"Previous discussion: {json.dumps(state.get('dialogue_turns', [])[-5:])}. "
                    f"Provide a clear, concise answer addressing the question.",
                    expert_task.get("context", {}),
                    [d["content"] for d in state.get("dialogue_turns", [])],
                    workflow_prompt,
                    expert_log_callback
                )
                
                state["dialogue_turns"].append({
                    "speaker": expert_name,
                    "content": response,
                    "type": "qna_response",
                    "question_num": q_num
                })
                self._emit_event(state, "expert_speaking", {
                    "expert_name": expert_name,
                    "content": response,
                    "type": "qna_response"
                })
            
            # Optional: Moderator follow-up or synthesis
            if q_num < num_questions:
                follow_up = await self.task_executor.execute_moderator_task(
                    moderator_config,
                    f"Briefly acknowledge the responses to question {q_num} and transition to the next question.",
                    state.get("context", {}),
                    workflow_prompt,
                    log_callback
                )
                if follow_up:
                    self._emit_event(state, "moderator_speaking", {
                        "content": follow_up,
                        "type": "qna_transition"
                    })
        
        # Store Q&A session data
        state["qna_session"] = {
            "questions": qna_questions,
            "total_questions": num_questions,
            "timestamp": datetime.now().isoformat()
        }
        
        # Moderator closes Q&A session
        self._log("🎤 Moderator closing Q&A session...")
        self._emit_event(state, "log", {"message": "🎤 Moderator closing Q&A session...", "level": "info"})
        
        qna_closing = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Close the Q&A session. Summarize that {num_questions} questions were addressed. "
            f"Thank participants and transition to the next phase.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        self._emit_event(state, "moderator_speaking", {
            "content": qna_closing,
            "type": "qna_closing"
        })
        
        self._log("✅ Q&A session complete")
        self._emit_event(state, "phase_complete", {"phase": "qna"})
        
        return state


