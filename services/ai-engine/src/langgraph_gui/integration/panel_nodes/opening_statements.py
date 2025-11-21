"""
Opening Statements Node
Sequential opening statements from all experts
"""

import json
from datetime import datetime
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class OpeningStatementsNode(PanelNode):
    """Opening statements phase - all experts provide initial statements"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Opening Statements")
        self._emit_event(state, "log", {"message": "🔵 Phase: Opening Statements", "level": "info"})
        state["current_phase"] = "opening_statements"
        
        self._emit_event(state, "phase_start", {"phase": "opening"})
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        workflow_prompt = state.get("workflow_system_prompt")
        
        # Moderator introduction - Analyze query and plan discussion
        self._log("🎤 Moderator analyzing query and planning discussion...")
        self._emit_event(state, "log", {"message": "🎤 Moderator analyzing query and planning discussion...", "level": "info"})
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Moderator: {msg}", "level": level})
        
        moderator_intro = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Welcome experts to this structured panel discussion. Today we're addressing: {state['query']}. "
            f"Analyze the query, identify key questions, and plan the discussion structure. "
            f"Then introduce the opening statements phase, explaining that each expert will have 60-90 seconds to present their initial perspective.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        
        self._log("✅ Moderator introduction completed")
        self._emit_event(state, "moderator_speaking", {"content": moderator_intro, "type": "introduction"})
        
        # Get expert tasks
        expert_tasks = state.get("expert_tasks", [])
        if not expert_tasks:
            self._log("⚠️ No expert tasks found, using default expert", "warning")
            self._emit_event(state, "log", {"message": "No expert tasks found, using default expert"})
            expert_tasks = [{"name": "Default Expert", "config": moderator_config}]
        
        opening_statements = []
        
        # Execute opening statements sequentially with moderator transitions
        for idx, expert_task in enumerate(expert_tasks, 1):
            expert_name = expert_task.get("name", f"Expert {idx}")
            expert_config = expert_task.get("config", {})
            
            # Moderator transition (except for first expert)
            if idx > 1:
                previous_expert = expert_tasks[idx - 2].get("name", f"Expert {idx - 1}")
                transition = await self.task_executor.execute_moderator_task(
                    moderator_config,
                    f"Thank {previous_expert} for their opening statement. "
                    f"Now transition to {expert_name}, providing brief context from previous statements if relevant.",
                    state.get("context", {}),
                    workflow_prompt,
                    log_callback
                )
                self._emit_event(state, "moderator_speaking", {
                    "content": transition,
                    "type": "transition"
                })
            
            self._log(f"👤 Expert {idx}/{len(expert_tasks)}: {expert_name} providing opening statement (60-90 seconds)...")
            self._emit_event(state, "log", {
                "message": f"👤 Expert {idx}/{len(expert_tasks)}: {expert_name} providing opening statement (60-90 seconds)...",
                "level": "info"
            })
            
            # Build context for expert (include previous statements)
            previous_statements = [s["statement"] for s in opening_statements]
            expert_query = f"Provide your opening statement for query: {state['query']}. "
            if previous_statements:
                expert_query += f"Previous experts have mentioned: {', '.join(previous_statements[:2])}. "
            expert_query += "Focus on your domain perspective. Keep it concise (60-90 seconds equivalent)."
            
            def expert_log_callback(msg, level="info"):
                self._log(f"  → Expert {expert_name}: {msg}", level)
                self._emit_event(state, "log", {"message": f"Expert {expert_name}: {msg}", "level": level})
            
            statement = await self.task_executor.execute_expert_task(
                expert_config,
                expert_name,
                expert_query,
                expert_task.get("context", {}),
                previous_statements,
                workflow_prompt,
                expert_log_callback
            )
            
            self._log(f"✅ Expert {expert_name} completed opening statement")
            self._emit_event(state, "log", {
                "message": f"✅ Expert {expert_name} completed opening statement",
                "level": "success"
            })
            opening_statements.append({
                "expert": expert_name,
                "statement": statement,
                "timestamp": datetime.now().isoformat()
            })
            
            self._emit_event(state, "expert_speaking", {
                "expert_name": expert_name,
                "content": statement,
                "type": "opening_statement"
            })
        
        state["opening_statements"] = opening_statements
        
        # Moderator synthesis - Analyze themes and plan Round 1
        self._log("🎤 Moderator synthesizing opening statements and planning Round 1...")
        self._emit_event(state, "log", {
            "message": "🎤 Moderator synthesizing opening statements and planning Round 1...",
            "level": "info"
        })
        moderator_synthesis = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"All opening statements are complete. Synthesize the following opening statements for query: {state['query']}. "
            f"Statements: {json.dumps(opening_statements)}. "
            f"Identify key themes, note agreements/disagreements, and preview the Round 1 discussion topics. "
            f"Say: 'Thank you all. I'm hearing several key themes: [Theme1], [Theme2], [Theme3]. Let's explore these systematically.'",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        self._log("✅ Moderator synthesis completed")
        self._emit_event(state, "moderator_speaking", {
            "content": moderator_synthesis,
            "type": "synthesis"
        })
        self._emit_event(state, "phase_complete", {"phase": "opening"})
        
        return state

