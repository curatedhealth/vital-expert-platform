"""
Strategy runner for strategic planning missions.

Handles: develop_strategy, decide_positioning, decide_allocation
Uses L3 Strategic Analyst + L4 Market Intelligence + L4 Decision Support workers.
"""

from typing import Any, Dict, List

from ...schemas.mission_state import MissionState
from ..base_runner import BaseMissionRunner
from agents.workers.worker_factory import WorkerFactory


class StrategyRunner(BaseMissionRunner):
    """
    Strategic planning missions requiring market analysis and decision frameworks.
    Pattern: L3 strategic framing → L4 market intel → L4 decision synthesis.
    """

    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        goal = state.get("goal", "")
        user_context = state.get("user_context", {})

        # Determine if this is positioning, allocation, or general strategy
        mission_type = user_context.get("strategy_type", "general")

        base_plan = [
            {
                "id": "step_1",
                "name": "Strategic Context Analysis",
                "description": f"Analyze strategic context and constraints for: {goal}",
                "worker": "L4-SA",  # Strategic Analyst
                "tools": ["L5-WEB", "L5-RAG"],
                "params": {"focus": "context_mapping"},
            },
            {
                "id": "step_2",
                "name": "Market Intelligence Gathering",
                "description": "Collect competitive and market intelligence relevant to strategic decision.",
                "worker": "L4-MI",  # Market Intelligence
                "tools": ["L5-WEB", "L5-PM", "L5-CT"],
                "params": {"depth": "comprehensive"},
            },
            {
                "id": "step_3",
                "name": "Options Generation",
                "description": "Generate strategic options with trade-off analysis.",
                "worker": "L4-DS",  # Decision Support
                "tools": ["L5-CALC", "L5-RAG"],
                "params": {"format": "options_matrix"},
            },
            {
                "id": "step_4",
                "name": "Strategic Recommendation",
                "description": "Synthesize findings into actionable strategic recommendation.",
                "worker": "L4-CS",  # Comparative Synthesizer
                "tools": ["L5-FMT"],
                "params": {"output_type": "strategic_brief"},
            },
        ]

        # Add positioning-specific step if needed
        if mission_type == "positioning":
            base_plan.insert(2, {
                "id": "step_2b",
                "name": "Competitive Positioning Analysis",
                "description": "Map competitive landscape and identify positioning opportunities.",
                "worker": "L4-MI",
                "tools": ["L5-WEB"],
                "params": {"focus": "positioning_map"},
            })

        return base_plan

    async def execute_step(self, step: Dict[str, Any], state: MissionState) -> Dict[str, Any]:
        worker_id = step.get("worker", "L4-SA")

        try:
            worker_class = WorkerFactory.get_worker(worker_id)
            worker = worker_class()
        except (KeyError, ValueError):
            # Fallback to generic comparative synthesizer
            worker_class = WorkerFactory.get_worker("L4-CS")
            worker = worker_class()

        context = {
            "goal": state.get("goal"),
            "previous_artifacts": state.get("artifacts", []),
            "user_context": state.get("user_context", {}),
        }

        result = await worker.execute(
            task=step.get("description", ""),
            params={
                "tools": step.get("tools", []),
                **step.get("params", {}),
            },
            context=context,
        )

        return {
            "step_id": step.get("id"),
            "name": step.get("name"),
            "worker": worker_id,
            "content": result.get("output"),
            "citations": result.get("citations", []),
            "tools_used": result.get("tools_used", step.get("tools", [])),
            "metadata": {
                "confidence": result.get("confidence", 0.8),
                "strategy_type": state.get("user_context", {}).get("strategy_type", "general"),
            },
        }

    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        SynthClass = WorkerFactory.get_worker("L4-CS")
        synthesizer = SynthClass()

        artifacts = state.get("artifacts", [])
        goal = state.get("goal", "")

        summary = await synthesizer.execute(
            task=f"Create strategic recommendation brief for: {goal}",
            params={
                "format": "markdown",
                "sections": ["executive_summary", "context", "options", "recommendation", "implementation"],
            },
            context={
                "goal": goal,
                "artifacts": artifacts,
                "deliverable_type": "strategic_brief",
            },
        )

        # Aggregate citations from all artifacts
        all_citations = []
        for artifact in artifacts:
            all_citations.extend(artifact.get("citations", []))
        all_citations.extend(summary.get("citations", []))

        return {
            "type": "strategic_brief",
            "content": summary.get("output"),
            "citations": all_citations,
            "metadata": {
                "options_count": len([a for a in artifacts if "options" in a.get("name", "").lower()]),
                "total_steps": len(artifacts),
            },
        }

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        return {
            "cost": 8.0,
            "time_minutes": 20,
            "complexity": "high",
            "reasoning": "Strategic missions require comprehensive market analysis and multi-source synthesis.",
        }
