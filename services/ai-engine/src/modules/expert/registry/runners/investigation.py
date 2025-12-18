"""
Investigation runner for root cause analysis and competitive intelligence.

Handles: investigate_root_cause, investigate_competitive, investigate_landscape
Uses L3 Context Specialist + L4 Evidence workers with deep search patterns.
"""

from typing import Any, Dict, List

from ...schemas.mission_state import MissionState
from ..base_runner import BaseMissionRunner
from agents.workers.worker_factory import WorkerFactory


class InvestigationRunner(BaseMissionRunner):
    """
    Investigation missions requiring systematic evidence gathering and analysis.
    Pattern: Hypothesis formation → Multi-source evidence collection → Root cause synthesis.
    """

    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        goal = state.get("goal", "")
        user_context = state.get("user_context", {})
        investigation_type = user_context.get("investigation_type", "root_cause")

        # Base plan for all investigation types
        plan = [
            {
                "id": "step_1",
                "name": "Problem Definition & Hypothesis",
                "description": f"Define investigation scope and initial hypotheses for: {goal}",
                "worker": "L4-AN",  # Analysis Worker
                "tools": ["L5-RAG"],
                "params": {"phase": "hypothesis_generation"},
            },
        ]

        # Add type-specific evidence gathering steps
        if investigation_type == "competitive":
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Competitor Data Collection",
                    "description": "Gather competitive intelligence from multiple sources.",
                    "worker": "L4-MI",
                    "tools": ["L5-WEB", "L5-PM", "L5-CT"],
                    "params": {"focus": "competitive_landscape"},
                },
                {
                    "id": "step_3",
                    "name": "Competitive Analysis",
                    "description": "Analyze competitive positioning and strategies.",
                    "worker": "L4-CS",
                    "tools": ["L5-CALC"],
                    "params": {"output": "competitive_matrix"},
                },
            ])
        elif investigation_type == "landscape":
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Landscape Mapping",
                    "description": "Map the complete landscape of stakeholders and forces.",
                    "worker": "L4-ES",  # Evidence Synthesizer
                    "tools": ["L5-WEB", "L5-PM", "L5-CT", "L5-OPENFDA"],
                    "params": {"mode": "comprehensive"},
                },
                {
                    "id": "step_3",
                    "name": "Trend Analysis",
                    "description": "Identify key trends and emerging patterns.",
                    "worker": "L4-AN",
                    "tools": ["L5-WEB"],
                    "params": {"focus": "trend_identification"},
                },
            ])
        else:  # root_cause (default)
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Evidence Collection",
                    "description": "Systematically gather evidence related to the problem.",
                    "worker": "L4-ES",
                    "tools": ["L5-PM", "L5-CT", "L5-RAG"],
                    "params": {"mode": "deep"},
                },
                {
                    "id": "step_3",
                    "name": "Causal Chain Analysis",
                    "description": "Trace causal relationships and contributing factors.",
                    "worker": "L4-AN",
                    "tools": ["L5-CALC"],
                    "params": {"method": "5_whys"},
                },
                {
                    "id": "step_4",
                    "name": "Root Cause Identification",
                    "description": "Identify and validate root causes with evidence.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT"],
                    "params": {"output": "root_cause_report"},
                },
            ])

        # Add synthesis step for all types
        plan.append({
            "id": f"step_{len(plan) + 1}",
            "name": "Investigation Synthesis",
            "description": "Compile findings into actionable investigation report.",
            "worker": "L4-CS",
            "tools": ["L5-FMT"],
            "params": {"format": "investigation_report"},
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

        # Build rich context from previous findings
        artifacts = state.get("artifacts", [])
        previous_findings = [a.get("content", "") for a in artifacts[-3:]]  # Last 3 artifacts

        context = {
            "goal": state.get("goal"),
            "previous_artifacts": artifacts,
            "previous_findings_summary": "\n".join(previous_findings),
            "investigation_type": state.get("user_context", {}).get("investigation_type", "root_cause"),
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
            "findings": result.get("findings", []),  # Investigation-specific
            "confidence": result.get("confidence", 0.75),
        }

    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        SynthClass = WorkerFactory.get_worker("L4-CS")
        synthesizer = SynthClass()

        artifacts = state.get("artifacts", [])
        investigation_type = state.get("user_context", {}).get("investigation_type", "root_cause")

        # Determine report structure based on investigation type
        report_sections = {
            "root_cause": ["executive_summary", "problem_statement", "evidence", "causal_analysis", "root_causes", "recommendations"],
            "competitive": ["executive_summary", "landscape", "competitor_profiles", "competitive_analysis", "strategic_implications"],
            "landscape": ["executive_summary", "landscape_map", "key_players", "trends", "opportunities_threats"],
        }

        summary = await synthesizer.execute(
            task=f"Create {investigation_type} investigation report",
            params={
                "format": "markdown",
                "sections": report_sections.get(investigation_type, report_sections["root_cause"]),
            },
            context={
                "goal": state.get("goal"),
                "artifacts": artifacts,
                "investigation_type": investigation_type,
            },
        )

        # Aggregate all findings and citations
        all_findings = []
        all_citations = []
        for artifact in artifacts:
            all_findings.extend(artifact.get("findings", []))
            all_citations.extend(artifact.get("citations", []))
        all_citations.extend(summary.get("citations", []))

        return {
            "type": f"{investigation_type}_investigation_report",
            "content": summary.get("output"),
            "citations": all_citations,
            "findings": all_findings,
            "metadata": {
                "investigation_type": investigation_type,
                "evidence_count": len(all_citations),
                "findings_count": len(all_findings),
            },
        }

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        investigation_type = state.get("user_context", {}).get("investigation_type", "root_cause")

        estimates = {
            "root_cause": {"cost": 6.0, "time_minutes": 15, "complexity": "high"},
            "competitive": {"cost": 7.0, "time_minutes": 18, "complexity": "high"},
            "landscape": {"cost": 8.0, "time_minutes": 20, "complexity": "high"},
        }

        return estimates.get(investigation_type, estimates["root_cause"])
