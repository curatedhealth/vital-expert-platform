"""
Deep Research runner covering missions: Deep Dive, Knowledge Harvest, Gap Discovery.
Uses L3 Context Specialist (strategy) + L4 Evidence Synthesizer (execution) + L4 Analysis (synthesis).
"""

from typing import Any, Dict, List

from ...schemas.mission_state import MissionState
from ..base_runner import BaseMissionRunner
from agents.base_agent import AgentConfig
from agents.l3_specialists import L3ContextSpecialist
from agents.l4_workers.l4_evidence import L4EvidenceSynthesizer
from agents.l4_workers.l4_analysis import AnalysisL4Worker


class DeepResearchRunner(BaseMissionRunner):
    """
    L3 strategy + L4 execution pattern for UNDERSTAND missions.
    Uses production L5 tool IDs: L5-PM, L5-CT, L5-OPENFDA, L5-WEB (optionally L5-RAG).
    """

    def __init__(self):
        default_cfg = AgentConfig(
            id="l3-context-default",
            name="L3Context",
            base_system_prompt="",
            metadata={},
        )
        self.context_specialist = L3ContextSpecialist(default_cfg)
        self.evidence_synthesizer = L4EvidenceSynthesizer()
        self.analyst = AnalysisL4Worker("comparative_synthesizer")

    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        goal = state.get("goal", "")
        strategy = await self.context_specialist.analyze_query(goal)
        entities = strategy.get("entities") or []
        desc = f"Map key themes for: {', '.join(entities)}" if entities else f"Map key themes for: {goal}"

        recommended_tools = strategy.get("recommended_tools") or ["L5-PM", "L5-CT", "L5-OPENFDA", "L5-WEB"]
        expanded_terms = strategy.get("expanded_terms") or [goal]

        return [
            {
                "id": "step_1",
                "name": "Landscape Mapping",
                "description": desc,
                "worker": "L3-CS",
                "tools": [],
                "params": {"strategy": strategy},
            },
            {
                "id": "step_2",
                "name": "Deep Evidence Retrieval",
                "description": "Deep search across academic/clinical/regulatory sources.",
                "worker": "L4-ES",
                "tools": recommended_tools,
                "params": {"keywords": expanded_terms},
            },
            {
                "id": "step_3",
                "name": "Synthesis",
                "description": "Compile findings into a structured report.",
                "worker": "L4-AN",
                "tools": [],
            },
        ]

    async def execute_step(self, step: Dict[str, Any], state: MissionState) -> Dict[str, Any]:
        worker_id = step.get("worker")
        context = {
            "goal": state.get("goal"),
            "step_instruction": step.get("description", ""),
            "previous_artifacts": state.get("artifacts", []),
        }

        if worker_id == "L3-CS":
            result = await self.context_specialist.execute(
                task=step.get("description", ""),
                params={"query": state.get("goal")},
                context=context,
            )
        elif worker_id == "L4-ES":
            result = await self.evidence_synthesizer.execute(
                task=step.get("description", ""),
                params={
                    "sources": step.get("tools", []),
                    "max_results": 20,
                    "mode": "deep",
                    "keywords": step.get("params", {}).get("keywords"),
                },
                context=context,
            )
        elif worker_id == "L4-AN":
            result = await self.analyst.execute(
                task=step.get("description", ""),
                params={"format": "markdown", "type": "synthesis"},
                context=context,
            )
        else:
            raise ValueError(f"Unknown worker: {worker_id}")

        return {
            "step_id": step.get("id"),
            "name": step.get("name"),
            "worker": worker_id,
            "content": result.get("output"),
            "citations": result.get("citations", []),
            "tools_used": result.get("tools_used", step.get("tools", [])),
        }

    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        summary = await self.analyst.execute(
            task="Create executive deep dive report with citations",
            params={"format": "markdown"},
            context={"goal": state.get("goal"), "artifacts": state.get("artifacts", [])},
        )
        return {
            "type": "deep_research_report",
            "content": summary.get("output"),
            "citations": summary.get("citations", []),
        }

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        return {"cost": 5.0, "time_minutes": 15, "complexity": "medium"}
