"""
Communication runner for preparation and communication deliverables.

Handles: prepare_plan, prepare_brief, prepare_materials, communicate_report, communicate_presentation
Uses L4 workers focused on content generation and formatting.
"""

from typing import Any, Dict, List

from ...schemas.mission_state import MissionState
from ..base_runner import BaseMissionRunner
from agents.workers.worker_factory import WorkerFactory


class CommunicationRunner(BaseMissionRunner):
    """
    Communication/preparation missions requiring structured content generation.
    Pattern: Audience analysis → Content gathering → Drafting → Formatting/Polish.
    """

    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        goal = state.get("goal", "")
        user_context = state.get("user_context", {})
        comm_type = user_context.get("communication_type", "report")
        audience = user_context.get("audience", "general")

        plan = [
            {
                "id": "step_1",
                "name": "Audience & Purpose Analysis",
                "description": f"Analyze audience needs and communication objectives for: {goal}",
                "worker": "L4-AN",
                "tools": ["L5-RAG"],
                "params": {
                    "focus": "audience_analysis",
                    "audience": audience,
                },
            },
        ]

        # Type-specific content generation
        if comm_type in ["brief", "prepare_brief"]:
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Key Points Extraction",
                    "description": "Extract and prioritize key points for briefing.",
                    "worker": "L4-ES",
                    "tools": ["L5-RAG", "L5-PM"],
                    "params": {"mode": "key_points"},
                },
                {
                    "id": "step_3",
                    "name": "Brief Drafting",
                    "description": "Draft concise briefing document.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT"],
                    "params": {"format": "executive_brief"},
                },
            ])
        elif comm_type in ["presentation", "communicate_presentation"]:
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Content Research",
                    "description": "Gather supporting content and data for presentation.",
                    "worker": "L4-ES",
                    "tools": ["L5-WEB", "L5-PM", "L5-RAG"],
                    "params": {"mode": "presentation_content"},
                },
                {
                    "id": "step_3",
                    "name": "Narrative Development",
                    "description": "Develop presentation narrative and flow.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT"],
                    "params": {"format": "presentation_outline"},
                },
                {
                    "id": "step_4",
                    "name": "Slide Content Generation",
                    "description": "Generate slide-by-slide content with speaker notes.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT", "L5-VIZ"],
                    "params": {"format": "slides"},
                },
            ])
        elif comm_type in ["plan", "prepare_plan"]:
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Requirements Analysis",
                    "description": "Analyze requirements and constraints for plan.",
                    "worker": "L4-AN",
                    "tools": ["L5-RAG"],
                    "params": {"focus": "requirements"},
                },
                {
                    "id": "step_3",
                    "name": "Plan Structure Development",
                    "description": "Develop plan structure with timeline and milestones.",
                    "worker": "L4-DS",
                    "tools": ["L5-CALC"],
                    "params": {"output": "project_plan"},
                },
                {
                    "id": "step_4",
                    "name": "Plan Documentation",
                    "description": "Create comprehensive plan document.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT"],
                    "params": {"format": "plan_document"},
                },
            ])
        elif comm_type in ["materials", "prepare_materials"]:
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Content Gathering",
                    "description": "Gather all source content and references.",
                    "worker": "L4-ES",
                    "tools": ["L5-RAG", "L5-PM", "L5-WEB"],
                    "params": {"mode": "comprehensive"},
                },
                {
                    "id": "step_3",
                    "name": "Materials Drafting",
                    "description": "Draft materials with appropriate formatting.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT"],
                    "params": {"format": "materials_package"},
                },
            ])
        else:  # report (default)
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Data & Evidence Collection",
                    "description": "Collect data and evidence for report.",
                    "worker": "L4-ES",
                    "tools": ["L5-PM", "L5-CT", "L5-RAG"],
                    "params": {"mode": "report_content"},
                },
                {
                    "id": "step_3",
                    "name": "Analysis & Insights",
                    "description": "Analyze data and generate insights.",
                    "worker": "L4-AN",
                    "tools": ["L5-CALC"],
                    "params": {"method": "insight_generation"},
                },
                {
                    "id": "step_4",
                    "name": "Report Drafting",
                    "description": "Draft comprehensive report with sections.",
                    "worker": "L4-CS",
                    "tools": ["L5-FMT", "L5-VIZ"],
                    "params": {"format": "full_report"},
                },
            ])

        # Final polish step
        plan.append({
            "id": f"step_{len(plan) + 1}",
            "name": "Final Review & Polish",
            "description": "Review, polish, and finalize deliverable.",
            "worker": "L4-CS",
            "tools": ["L5-FMT"],
            "params": {"action": "final_review"},
        })

        return plan

    async def execute_step(self, step: Dict[str, Any], state: MissionState) -> Dict[str, Any]:
        worker_id = step.get("worker", "L4-CS")

        try:
            worker_class = WorkerFactory.get_worker(worker_id)
            worker = worker_class()
        except (KeyError, ValueError):
            worker_class = WorkerFactory.get_worker("L4-CS")
            worker = worker_class()

        user_context = state.get("user_context", {})

        context = {
            "goal": state.get("goal"),
            "previous_artifacts": state.get("artifacts", []),
            "audience": user_context.get("audience", "general"),
            "tone": user_context.get("tone", "professional"),
            "format_preferences": user_context.get("format_preferences", {}),
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
            "deliverable_section": result.get("section", step.get("name")),
        }

    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        SynthClass = WorkerFactory.get_worker("L4-CS")
        synthesizer = SynthClass()

        artifacts = state.get("artifacts", [])
        user_context = state.get("user_context", {})
        comm_type = user_context.get("communication_type", "report")

        # Determine deliverable format
        deliverable_types = {
            "brief": "executive_brief",
            "prepare_brief": "executive_brief",
            "presentation": "presentation_deck",
            "communicate_presentation": "presentation_deck",
            "plan": "project_plan",
            "prepare_plan": "project_plan",
            "materials": "materials_package",
            "prepare_materials": "materials_package",
            "report": "comprehensive_report",
            "communicate_report": "comprehensive_report",
        }

        # Aggregate all content
        all_citations = []
        sections = []

        for artifact in artifacts:
            all_citations.extend(artifact.get("citations", []))
            if artifact.get("content"):
                sections.append({
                    "name": artifact.get("deliverable_section", artifact.get("name")),
                    "content": artifact.get("content"),
                })

        summary = await synthesizer.execute(
            task=f"Compile and polish {comm_type} deliverable",
            params={
                "format": "markdown",
                "output_type": deliverable_types.get(comm_type, "report"),
                "audience": user_context.get("audience", "general"),
            },
            context={
                "goal": state.get("goal"),
                "artifacts": artifacts,
                "sections": sections,
            },
        )

        all_citations.extend(summary.get("citations", []))

        return {
            "type": deliverable_types.get(comm_type, "report"),
            "content": summary.get("output"),
            "citations": all_citations,
            "metadata": {
                "communication_type": comm_type,
                "audience": user_context.get("audience", "general"),
                "sections_count": len(sections),
                "word_count": len(summary.get("output", "").split()),
            },
        }

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        comm_type = state.get("user_context", {}).get("communication_type", "report")

        estimates = {
            "brief": {"cost": 3.0, "time_minutes": 8, "complexity": "medium"},
            "prepare_brief": {"cost": 3.0, "time_minutes": 8, "complexity": "medium"},
            "presentation": {"cost": 6.0, "time_minutes": 15, "complexity": "high"},
            "communicate_presentation": {"cost": 6.0, "time_minutes": 15, "complexity": "high"},
            "plan": {"cost": 5.0, "time_minutes": 12, "complexity": "high"},
            "prepare_plan": {"cost": 5.0, "time_minutes": 12, "complexity": "high"},
            "materials": {"cost": 4.0, "time_minutes": 10, "complexity": "medium"},
            "prepare_materials": {"cost": 4.0, "time_minutes": 10, "complexity": "medium"},
            "report": {"cost": 5.0, "time_minutes": 12, "complexity": "high"},
            "communicate_report": {"cost": 5.0, "time_minutes": 12, "complexity": "high"},
        }

        return estimates.get(comm_type, estimates["report"])
