"""
Monitoring runner for tracking, surveillance, and signal detection missions.

Handles: monitor_signals, monitor_risks, monitor_performance
Uses L4 workers with alerting and threshold-based detection patterns.
"""

from typing import Any, Dict, List

from ...schemas.mission_state import MissionState
from ..base_runner import BaseMissionRunner
from agents.l4_workers.worker_factory import WorkerFactory


class MonitoringRunner(BaseMissionRunner):
    """
    Monitoring missions requiring systematic surveillance and alert generation.
    Pattern: Define thresholds → Scan sources → Detect signals → Generate alerts.
    """

    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        goal = state.get("goal", "")
        user_context = state.get("user_context", {})
        monitor_type = user_context.get("monitor_type", "signals")

        # Monitoring configuration from context
        thresholds = user_context.get("thresholds", {})
        sources = user_context.get("sources", ["L5-WEB", "L5-PM", "L5-CT"])

        plan = [
            {
                "id": "step_1",
                "name": "Monitoring Setup",
                "description": f"Configure monitoring parameters for: {goal}",
                "worker": "L4-AN",
                "tools": ["L5-RAG"],
                "params": {
                    "phase": "setup",
                    "thresholds": thresholds,
                    "monitor_type": monitor_type,
                },
            },
        ]

        # Type-specific scanning steps
        if monitor_type == "risks":
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Risk Landscape Scan",
                    "description": "Scan for emerging risks and threats.",
                    "worker": "L4-ES",
                    "tools": sources,
                    "params": {"mode": "risk_focused"},
                },
                {
                    "id": "step_3",
                    "name": "Risk Assessment",
                    "description": "Assess identified risks by likelihood and impact.",
                    "worker": "L4-AN",
                    "tools": ["L5-CALC"],
                    "params": {"method": "risk_matrix"},
                },
            ])
        elif monitor_type == "performance":
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Performance Data Collection",
                    "description": "Gather performance metrics from relevant sources.",
                    "worker": "L4-DE",  # Data Extraction
                    "tools": sources,
                    "params": {"mode": "metrics_focused"},
                },
                {
                    "id": "step_3",
                    "name": "Trend Analysis",
                    "description": "Analyze performance trends against benchmarks.",
                    "worker": "L4-AN",
                    "tools": ["L5-CALC", "L5-VIZ"],
                    "params": {"analysis_type": "trend"},
                },
            ])
        else:  # signals (default)
            plan.extend([
                {
                    "id": "step_2",
                    "name": "Signal Scanning",
                    "description": "Scan multiple sources for relevant signals.",
                    "worker": "L4-ES",
                    "tools": sources,
                    "params": {"mode": "signal_detection"},
                },
                {
                    "id": "step_3",
                    "name": "Signal Validation",
                    "description": "Validate and prioritize detected signals.",
                    "worker": "L4-AN",
                    "tools": ["L5-RAG"],
                    "params": {"method": "signal_triage"},
                },
            ])

        # Alert generation step
        plan.append({
            "id": f"step_{len(plan) + 1}",
            "name": "Alert Generation",
            "description": "Generate alerts and monitoring report.",
            "worker": "L4-CS",
            "tools": ["L5-FMT"],
            "params": {"output": "monitoring_report"},
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

        # Include monitoring context
        user_context = state.get("user_context", {})

        context = {
            "goal": state.get("goal"),
            "previous_artifacts": state.get("artifacts", []),
            "thresholds": user_context.get("thresholds", {}),
            "monitor_type": user_context.get("monitor_type", "signals"),
        }

        result = await worker.execute(
            task=step.get("description", ""),
            params={
                "tools": step.get("tools", []),
                **step.get("params", {}),
            },
            context=context,
        )

        # Extract signals/alerts from result
        signals = result.get("signals", [])
        alerts = result.get("alerts", [])

        return {
            "step_id": step.get("id"),
            "name": step.get("name"),
            "worker": worker_id,
            "content": result.get("output"),
            "citations": result.get("citations", []),
            "tools_used": result.get("tools_used", step.get("tools", [])),
            "signals": signals,
            "alerts": alerts,
            "metrics": result.get("metrics", {}),
        }

    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        SynthClass = WorkerFactory.get_worker("L4-CS")
        synthesizer = SynthClass()

        artifacts = state.get("artifacts", [])
        monitor_type = state.get("user_context", {}).get("monitor_type", "signals")

        # Aggregate all signals and alerts
        all_signals = []
        all_alerts = []
        all_metrics = {}
        all_citations = []

        for artifact in artifacts:
            all_signals.extend(artifact.get("signals", []))
            all_alerts.extend(artifact.get("alerts", []))
            all_metrics.update(artifact.get("metrics", {}))
            all_citations.extend(artifact.get("citations", []))

        summary = await synthesizer.execute(
            task=f"Create {monitor_type} monitoring report with alerts",
            params={
                "format": "markdown",
                "include_alerts": True,
                "alert_count": len(all_alerts),
            },
            context={
                "goal": state.get("goal"),
                "artifacts": artifacts,
                "signals": all_signals,
                "alerts": all_alerts,
                "metrics": all_metrics,
            },
        )

        all_citations.extend(summary.get("citations", []))

        return {
            "type": f"{monitor_type}_monitoring_report",
            "content": summary.get("output"),
            "citations": all_citations,
            "signals": all_signals,
            "alerts": all_alerts,
            "metrics": all_metrics,
            "metadata": {
                "monitor_type": monitor_type,
                "signals_detected": len(all_signals),
                "alerts_generated": len(all_alerts),
            },
        }

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        user_context = state.get("user_context", {})
        sources = user_context.get("sources", ["L5-WEB", "L5-PM"])

        # Cost scales with number of sources
        base_cost = 3.0
        cost_per_source = 1.0

        return {
            "cost": base_cost + (len(sources) * cost_per_source),
            "time_minutes": 10 + (len(sources) * 2),
            "complexity": "medium",
            "sources_count": len(sources),
        }
