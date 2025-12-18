"""
Problem-solving runner for troubleshooting, optimization, and mitigation missions.

Handles: solve_troubleshoot, solve_optimize, solve_mitigate
Uses systematic problem-solving patterns with L4 workers.
"""

from typing import Any, Dict, List

from ...schemas.mission_state import MissionState
from ..base_runner import BaseMissionRunner
from agents.workers.worker_factory import WorkerFactory


class ProblemSolvingRunner(BaseMissionRunner):
    """
    Problem-solving missions requiring systematic analysis and solution generation.
    Pattern: Problem definition → Solution generation → Evaluation → Implementation plan.
    """

    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        goal = state.get("goal", "")
        user_context = state.get("user_context", {})
        solve_type = user_context.get("solve_type", "troubleshoot")

        plan = [
            {
                "id": "step_1",
                "name": "Problem Analysis",
                "description": f"Analyze and structure the problem: {goal}",
                "worker": "L4-AN",
                "tools": ["L5-RAG"],
                "params": {"method": "problem_structuring"},
            },
        ]

        # Type-specific solution paths
        if solve_type == "optimize":
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Current State Assessment",
                    "description": "Assess current state and identify optimization opportunities.",
                    "worker": "L4-DE",
                    "tools": ["L5-RAG", "L5-CALC"],
                    "params": {"focus": "baseline_metrics"},
                },
                {
                    "id": "step_3",
                    "name": "Optimization Options",
                    "description": "Generate optimization strategies with projected impact.",
                    "worker": "L4-DS",
                    "tools": ["L5-CALC"],
                    "params": {"output": "optimization_options"},
                },
                {
                    "id": "step_4",
                    "name": "ROI Analysis",
                    "description": "Calculate ROI and prioritize optimization initiatives.",
                    "worker": "L4-AN",
                    "tools": ["L5-CALC", "L5-VIZ"],
                    "params": {"method": "roi_analysis"},
                },
            ])
        elif solve_type == "mitigate":
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Risk Identification",
                    "description": "Identify and categorize risks requiring mitigation.",
                    "worker": "L4-AN",
                    "tools": ["L5-RAG", "L5-PM"],
                    "params": {"method": "risk_identification"},
                },
                {
                    "id": "step_3",
                    "name": "Mitigation Strategy Development",
                    "description": "Develop mitigation strategies for each risk category.",
                    "worker": "L4-DS",
                    "tools": ["L5-RAG"],
                    "params": {"output": "mitigation_strategies"},
                },
                {
                    "id": "step_4",
                    "name": "Contingency Planning",
                    "description": "Create contingency plans for high-priority risks.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT"],
                    "params": {"format": "contingency_plan"},
                },
            ])
        else:  # troubleshoot (default)
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Symptom Analysis",
                    "description": "Collect and analyze symptoms and error patterns.",
                    "worker": "L4-ES",
                    "tools": ["L5-RAG", "L5-PM"],
                    "params": {"mode": "diagnostic"},
                },
                {
                    "id": "step_3",
                    "name": "Hypothesis Testing",
                    "description": "Generate and test hypotheses for root cause.",
                    "worker": "L4-AN",
                    "tools": ["L5-CALC"],
                    "params": {"method": "hypothesis_testing"},
                },
                {
                    "id": "step_4",
                    "name": "Solution Development",
                    "description": "Develop and validate solution approaches.",
                    "worker": "L4-DS",
                    "tools": ["L5-RAG"],
                    "params": {"output": "solution_options"},
                },
            ])

        # Implementation planning step
        plan.append({
            "id": f"step_{len(plan) + 1}",
            "name": "Implementation Plan",
            "description": "Create actionable implementation plan with timeline.",
            "worker": "L4-CS",
            "tools": ["L5-FMT"],
            "params": {"format": "implementation_plan"},
        })

        return plan

    async def execute_step(self, step: Dict[str, Any], state: MissionState) -> Dict[str, Any]:
        worker_id = step.get("worker", "L4-AN")

        try:
            worker_class = WorkerFactory.get_worker(worker_id)
            worker = worker_class()
        except (KeyError, ValueError):
            worker_class = WorkerFactory.get_worker("L4-CS")
            worker = worker_class()

        # Rich context for problem-solving
        artifacts = state.get("artifacts", [])
        user_context = state.get("user_context", {})

        context = {
            "goal": state.get("goal"),
            "previous_artifacts": artifacts,
            "solve_type": user_context.get("solve_type", "troubleshoot"),
            "constraints": user_context.get("constraints", []),
            "success_criteria": user_context.get("success_criteria", []),
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
            "solutions": result.get("solutions", []),
            "recommendations": result.get("recommendations", []),
            "confidence": result.get("confidence", 0.8),
        }

    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        SynthClass = WorkerFactory.get_worker("L4-CS")
        synthesizer = SynthClass()

        artifacts = state.get("artifacts", [])
        solve_type = state.get("user_context", {}).get("solve_type", "troubleshoot")

        # Aggregate solutions and recommendations
        all_solutions = []
        all_recommendations = []
        all_citations = []

        for artifact in artifacts:
            all_solutions.extend(artifact.get("solutions", []))
            all_recommendations.extend(artifact.get("recommendations", []))
            all_citations.extend(artifact.get("citations", []))

        # Report structure by type
        report_types = {
            "troubleshoot": "troubleshooting_report",
            "optimize": "optimization_report",
            "mitigate": "mitigation_plan",
        }

        summary = await synthesizer.execute(
            task=f"Create {solve_type} solution report",
            params={
                "format": "markdown",
                "sections": ["summary", "analysis", "solutions", "implementation", "success_metrics"],
            },
            context={
                "goal": state.get("goal"),
                "artifacts": artifacts,
                "solutions": all_solutions,
                "recommendations": all_recommendations,
            },
        )

        all_citations.extend(summary.get("citations", []))

        return {
            "type": report_types.get(solve_type, "problem_solving_report"),
            "content": summary.get("output"),
            "citations": all_citations,
            "solutions": all_solutions,
            "recommendations": all_recommendations,
            "metadata": {
                "solve_type": solve_type,
                "solutions_count": len(all_solutions),
                "recommendations_count": len(all_recommendations),
            },
        }

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        solve_type = state.get("user_context", {}).get("solve_type", "troubleshoot")

        estimates = {
            "troubleshoot": {"cost": 5.0, "time_minutes": 12, "complexity": "high"},
            "optimize": {"cost": 6.0, "time_minutes": 15, "complexity": "high"},
            "mitigate": {"cost": 7.0, "time_minutes": 18, "complexity": "high"},
        }

        return estimates.get(solve_type, estimates["troubleshoot"])
