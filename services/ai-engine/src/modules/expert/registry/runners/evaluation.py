"""
Evaluation runner stub for evaluation/benchmark missions.
"""

from typing import Any, Dict, List

from ...schemas.mission_state import MissionState
from ..base_runner import BaseMissionRunner
from agents.l4_workers.worker_factory import WorkerFactory


class EvaluationRunner(BaseMissionRunner):
    """Covers critique/benchmark/go-no-go style missions."""

    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        goal = state.get("goal", "")
        return [
            {
                "id": "step_1",
                "name": "Criteria Setup",
                "description": f"Define evaluation criteria for: {goal}",
                "worker": "L4-PM",
                "tools": ["L5-RAG"],
            },
            {
                "id": "step_2",
                "name": "Evidence Review",
                "description": "Collect evidence against criteria.",
                "worker": "L4-DE",
                "tools": ["L5-PM", "L5-CT"],
            },
            {
                "id": "step_3",
                "name": "Scoring & Recommendation",
                "description": "Score options and propose recommendation.",
                "worker": "L4-CS",
                "tools": ["L5-FMT"],
            },
        ]

    async def execute_step(self, step: Dict[str, Any], state: MissionState) -> Dict[str, Any]:
        worker_class = WorkerFactory.get_worker(step.get("worker"))
        worker = worker_class()
        result = await worker.execute(
            task=step.get("description", ""),
            params={"tools": step.get("tools", [])},
            context={"goal": state.get("goal"), "artifacts": state.get("artifacts", [])},
        )
        return {
            "step_id": step.get("id"),
            "name": step.get("name"),
            "worker": step.get("worker"),
            "content": result.get("output"),
            "citations": result.get("citations", []),
            "tools_used": result.get("tools_used", step.get("tools", [])),
        }

    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        SynthClass = WorkerFactory.get_worker("L4-CS")
        synthesizer = SynthClass()
        summary = await synthesizer.execute(
            task="Create evaluation report",
            params={"format": "markdown"},
            context={"goal": state.get("goal"), "artifacts": state.get("artifacts", [])},
        )
        return {
            "type": "evaluation_report",
            "content": summary.get("output"),
            "citations": summary.get("citations", []),
        }

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        return {"cost": 3.0, "time_minutes": 10, "complexity": "medium"}
