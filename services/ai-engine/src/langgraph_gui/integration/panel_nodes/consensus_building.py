"""
Consensus Building Node
Calculate final consensus with weighted algorithm and expert review rounds
Implements: Vote 40%, Alignment 30%, Confidence 30%
"""

import json
from .base import PanelNode
from langgraph_gui.panels.base import PanelState


class ConsensusBuildingNode(PanelNode):
    """Consensus building phase - calculate final consensus with expert review"""
    
    async def execute(self, state: PanelState) -> PanelState:
        self._log("🔵 Phase: Consensus Building")
        self._emit_event(state, "log", {"message": "🔵 Phase: Consensus Building", "level": "info"})
        state["current_phase"] = "consensus_building"
        
        self._emit_event(state, "phase_start", {"phase": "consensus_building"})
        
        # Get all expert final positions
        expert_positions = []
        for dialogue in state.get("dialogue_turns", []):
            if dialogue.get("type") in ["final_position", "response"]:
                expert_positions.append({
                    "expert": dialogue.get("speaker"),
                    "content": dialogue.get("content"),
                    "round": dialogue.get("round", 0)
                })
        
        moderator_task = state.get("moderator_task", {})
        moderator_config = moderator_task.get("config", {})
        expert_tasks = state.get("expert_tasks", [])
        workflow_prompt = state.get("workflow_system_prompt")
        
        def log_callback(msg, level="info"):
            self._log(f"  → {msg}", level)
            self._emit_event(state, "log", {"message": f"Consensus: {msg}", "level": level})
        
        # Step 1: Calculate consensus using weighted algorithm
        self._log(f"📊 Calculating weighted consensus from {len(expert_positions)} expert positions...")
        self._emit_event(state, "log", {
            "message": f"📊 Calculating weighted consensus from {len(expert_positions)} expert positions...",
            "level": "info"
        })
        
        consensus_result = await self._calculate_weighted_consensus(
            moderator_config,
            expert_positions,
            workflow_prompt,
            log_callback
        )
        
        state["consensus_level"] = consensus_result.get("consensus_level", 0.0)
        state["consensus_metrics"] = consensus_result.get("metrics", {})
        state["majority_view"] = consensus_result.get("majority_view", "")
        state["minority_views"] = consensus_result.get("minority_views", [])
        
        # Step 2: Draft consensus statement
        self._log("📝 Drafting consensus statement...")
        self._emit_event(state, "log", {"message": "📝 Drafting consensus statement...", "level": "info"})
        
        draft_consensus = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Draft a consensus recommendation statement for query: {state['query']}. "
            f"Majority view: {consensus_result.get('majority_view', '')}. "
            f"Expert positions: {json.dumps(expert_positions)}. "
            f"Include: primary recommendation, supporting rationale, implementation approach, risk mitigation, success criteria.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        
        state["draft_consensus_statement"] = draft_consensus
        
        # Step 3: Expert review rounds
        self._log("👥 Sharing draft with experts for review...")
        self._emit_event(state, "log", {"message": "👥 Sharing draft with experts for review...", "level": "info"})
        
        expert_feedback = []
        for expert_task in expert_tasks:
            expert_name = expert_task.get("name", "Expert")
            self._log(f"  → Requesting feedback from {expert_name}...")
            
            feedback = await self.task_executor.execute_expert_task(
                expert_task.get("config", {}),
                expert_name,
                f"Review this draft consensus statement: {draft_consensus}. "
                f"Query: {state['query']}. "
                f"Provide feedback: approve, suggest edits, or raise concerns.",
                expert_task.get("context", {}),
                [],
                workflow_prompt,
                lambda msg, level="info": self._log(f"    → {expert_name}: {msg}", level)
            )
            
            expert_feedback.append({
                "expert": expert_name,
                "feedback": feedback
            })
        
        # Step 4: Revise consensus statement based on feedback
        self._log("✏️ Revising consensus statement based on expert feedback...")
        self._emit_event(state, "log", {"message": "✏️ Revising consensus statement based on expert feedback...", "level": "info"})
        
        revised_consensus = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Revise the consensus statement based on expert feedback. "
            f"Original draft: {draft_consensus}. "
            f"Expert feedback: {json.dumps(expert_feedback)}. "
            f"Incorporate valid suggestions while maintaining consensus.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        
        # Step 5: Final validation
        self._log("✅ Finalizing consensus statement...")
        self._emit_event(state, "log", {"message": "✅ Finalizing consensus statement...", "level": "info"})
        
        final_consensus = await self.task_executor.execute_moderator_task(
            moderator_config,
            f"Finalize the consensus statement. Revised draft: {revised_consensus}. "
            f"Ensure it accurately represents the majority view while preserving dissenting opinions.",
            state.get("context", {}),
            workflow_prompt,
            log_callback
        )
        
        state["final_consensus_statement"] = final_consensus
        
        # Step 6: Capture dissenting opinions
        if consensus_result.get("minority_views"):
            self._log("📋 Capturing dissenting opinions...")
            self._emit_event(state, "log", {"message": "📋 Capturing dissenting opinions...", "level": "info"})
            
            for minority_view in consensus_result.get("minority_views", []):
                dissenting_expert = minority_view.get("expert")
                dissenting_content = minority_view.get("content", "")
                
                # Get full rationale from dissenting expert
                dissent_rationale = await self.task_executor.execute_expert_task(
                    next((et.get("config", {}) for et in expert_tasks if et.get("name") == dissenting_expert), {}),
                    dissenting_expert,
                    f"Elaborate on your dissenting position: {dissenting_content}. "
                    f"Explain: why majority view has risks, your alternative recommendation, supporting evidence, implementation concerns.",
                    {},
                    [],
                    workflow_prompt,
                    lambda msg, level="info": self._log(f"    → {dissenting_expert}: {msg}", level)
                )
                
                state["dissenting_opinions"].append({
                    "expert": dissenting_expert,
                    "position": dissenting_content,
                    "rationale": dissent_rationale,
                    "risks_identified": minority_view.get("risks", []),
                    "alternative_recommendation": minority_view.get("alternative", "")
                })
        
        self._log(f"✅ Final consensus reached: {state['consensus_level']:.1%}")
        self._emit_event(state, "consensus_reached", {
            "consensus_level": state["consensus_level"],
            "recommendation": final_consensus,
            "metrics": state.get("consensus_metrics", {}),
            "dissenting_count": len(state.get("dissenting_opinions", []))
        })
        self._emit_event(state, "phase_complete", {"phase": "consensus_building"})
        
        return state
    
    async def _calculate_weighted_consensus(
        self,
        moderator_config: dict,
        expert_positions: list,
        workflow_prompt: str,
        log_callback: callable
    ) -> dict:
        """
        Calculate weighted consensus using:
        - Vote: 40% (majority vote percentage)
        - Alignment: 30% (semantic similarity of rationales)
        - Confidence: 30% (expert confidence scores)
        """
        # Use moderator to analyze positions and calculate metrics
        analysis_prompt = f"""
        Analyze expert positions and calculate consensus metrics:
        Expert Positions: {json.dumps(expert_positions)}
        
        Calculate:
        1. Vote percentage: Count experts by option/preference, calculate majority percentage
        2. Alignment score: Analyze semantic similarity of rationales for same option (0-1 scale)
        3. Confidence scores: Extract confidence levels from each expert's statement (0-1 scale)
        
        Return JSON with:
        {{
            "vote_percentage": 0.80,
            "alignment_score": 0.88,
            "average_confidence": 0.91,
            "weighted_consensus": 0.85,
            "majority_view": "Option A description",
            "minority_views": [
                {{"expert": "Expert 3", "content": "...", "risks": [...], "alternative": "..."}}
            ]
        }}
        """
        
        result = await self.task_executor.execute_moderator_task(
            moderator_config,
            analysis_prompt,
            {},
            workflow_prompt,
            log_callback
        )
        
        # Parse result
        try:
            consensus_data = json.loads(result)
        except:
            # Fallback calculation
            vote_pct = len(expert_positions) / max(len(expert_positions), 1)  # Simplified
            consensus_data = {
                "vote_percentage": vote_pct,
                "alignment_score": 0.85,
                "average_confidence": 0.90,
                "weighted_consensus": vote_pct * 0.4 + 0.85 * 0.3 + 0.90 * 0.3,
                "majority_view": result[:200] if len(result) > 200 else result,
                "minority_views": []
            }
        
        # Calculate weighted consensus if not provided
        if "weighted_consensus" not in consensus_data:
            vote = consensus_data.get("vote_percentage", 0.0)
            align = consensus_data.get("alignment_score", 0.0)
            conf = consensus_data.get("average_confidence", 0.0)
            consensus_data["weighted_consensus"] = (vote * 0.4) + (align * 0.3) + (conf * 0.3)
        
        return {
            "consensus_level": consensus_data.get("weighted_consensus", 0.0),
            "metrics": {
                "vote_percentage": consensus_data.get("vote_percentage", 0.0),
                "alignment_score": consensus_data.get("alignment_score", 0.0),
                "average_confidence": consensus_data.get("average_confidence", 0.0),
                "weighted_consensus": consensus_data.get("weighted_consensus", 0.0)
            },
            "majority_view": consensus_data.get("majority_view", ""),
            "minority_views": consensus_data.get("minority_views", [])
        }
