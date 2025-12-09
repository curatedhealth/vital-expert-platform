"""
VITAL Path AI Services - VITAL L4 Agile Workers

Agile & Project Management Workers: Sprint Planner, Backlog Manager,
Velocity Tracker, Retrospective Facilitator, Dependency Mapper
5 workers for agile methodology and project management tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: AgileL4Worker
- Factory: create_agile_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
AGILE_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "sprint_planner": WorkerConfig(
        id="L4-SPP",
        name="Sprint Planner",
        description="Plan and optimize sprint capacity and commitments",
        category=WorkerCategory.AGILE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "calculate_capacity", "plan_sprint", "estimate_story_points",
            "balance_workload", "identify_risks", "create_sprint_goal",
            "pi_planning", "release_planning"
        ],
    ),

    "backlog_manager": WorkerConfig(
        id="L4-BLM",
        name="Backlog Manager",
        description="Manage and prioritize product backlogs",
        category=WorkerCategory.AGILE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "prioritize_backlog", "size_stories", "split_stories",
            "create_acceptance_criteria", "refine_backlog", "moscow_prioritization",
            "wsjf_calculation", "dependency_identification"
        ],
    ),

    "velocity_tracker": WorkerConfig(
        id="L4-VEL",
        name="Velocity Tracker",
        description="Track and forecast team velocity and performance",
        category=WorkerCategory.AGILE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "calculate_velocity", "forecast_completion", "burndown_analysis",
            "burnup_analysis", "cycle_time_analysis", "throughput_tracking",
            "monte_carlo_forecast", "trend_analysis"
        ],
    ),

    "retrospective_facilitator": WorkerConfig(
        id="L4-RTR",
        name="Retrospective Facilitator",
        description="Facilitate retrospectives and continuous improvement",
        category=WorkerCategory.AGILE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[],
        task_types=[
            "design_retrospective", "categorize_feedback", "identify_action_items",
            "track_improvements", "root_cause_analysis", "team_health_check",
            "starfish_analysis", "4ls_retrospective"
        ],
    ),

    "dependency_mapper": WorkerConfig(
        id="L4-DPM",
        name="Dependency Mapper",
        description="Map and manage dependencies across teams and projects",
        category=WorkerCategory.AGILE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "map_dependencies", "critical_path_analysis", "risk_assessment",
            "coordination_planning", "integration_planning", "conflict_resolution",
            "program_board", "dependency_matrix"
        ],
    ),
}


class AgileL4Worker(L4BaseWorker):
    """L4 Worker class for agile and project management tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in AGILE_WORKER_CONFIGS:
            raise ValueError(f"Unknown agile worker: {worker_key}")
        
        config = AGILE_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_calculate_capacity(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate team capacity for sprint."""
        team_members = params.get("team_members", [])
        sprint_days = params.get("sprint_days", 10)
        focus_factor = params.get("focus_factor", 0.7)
        
        total_capacity = 0
        member_capacities = []
        
        for member in team_members:
            name = member.get("name", "")
            availability = member.get("availability", 1.0)  # 1.0 = 100%
            pto_days = member.get("pto_days", 0)
            
            available_days = (sprint_days - pto_days) * availability
            capacity_points = available_days * focus_factor * 8  # 8 hours per day
            
            member_capacities.append({
                "name": name,
                "available_days": round(available_days, 1),
                "capacity_hours": round(capacity_points, 1),
            })
            
            total_capacity += capacity_points
        
        return {
            "sprint_days": sprint_days,
            "focus_factor": focus_factor,
            "team_size": len(team_members),
            "member_capacities": member_capacities,
            "total_capacity_hours": round(total_capacity, 1),
            "recommended_commitment": f"{round(total_capacity * 0.85, 1)} hours (85% of capacity)",
        }
    
    async def _task_wsjf_calculation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Weighted Shortest Job First (WSJF) for prioritization."""
        items = params.get("items", [])
        
        if not items:
            return {"error": "No items provided"}
        
        prioritized = []
        
        for item in items:
            name = item.get("name", "")
            business_value = item.get("business_value", 1)
            time_criticality = item.get("time_criticality", 1)
            risk_reduction = item.get("risk_reduction", 1)
            job_size = item.get("job_size", 1)
            
            # WSJF = (Business Value + Time Criticality + Risk Reduction) / Job Size
            cost_of_delay = business_value + time_criticality + risk_reduction
            wsjf = cost_of_delay / job_size if job_size > 0 else 0
            
            prioritized.append({
                "name": name,
                "business_value": business_value,
                "time_criticality": time_criticality,
                "risk_reduction": risk_reduction,
                "cost_of_delay": cost_of_delay,
                "job_size": job_size,
                "wsjf": round(wsjf, 2),
            })
        
        # Sort by WSJF descending
        prioritized.sort(key=lambda x: x["wsjf"], reverse=True)
        
        # Add rank
        for i, item in enumerate(prioritized):
            item["rank"] = i + 1
        
        return {
            "total_items": len(items),
            "prioritized_backlog": prioritized,
            "top_priority": prioritized[0]["name"] if prioritized else None,
        }
    
    async def _task_calculate_velocity(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate team velocity from historical sprints."""
        sprints = params.get("sprints", [])
        
        if not sprints:
            return {"error": "No sprint data provided"}
        
        velocities = [s.get("completed_points", 0) for s in sprints]
        
        avg_velocity = sum(velocities) / len(velocities)
        min_velocity = min(velocities)
        max_velocity = max(velocities)
        
        # Calculate standard deviation
        variance = sum((v - avg_velocity) ** 2 for v in velocities) / len(velocities)
        std_dev = variance ** 0.5
        
        # Trend analysis
        if len(velocities) >= 3:
            recent_avg = sum(velocities[-3:]) / 3
            trend = "improving" if recent_avg > avg_velocity else "declining" if recent_avg < avg_velocity else "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "sprints_analyzed": len(sprints),
            "sprint_velocities": velocities,
            "average_velocity": round(avg_velocity, 1),
            "min_velocity": min_velocity,
            "max_velocity": max_velocity,
            "std_deviation": round(std_dev, 1),
            "velocity_range": f"{round(avg_velocity - std_dev, 1)} - {round(avg_velocity + std_dev, 1)}",
            "trend": trend,
            "recommended_commitment": round(avg_velocity * 0.9, 1),
        }
    
    async def _task_forecast_completion(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Forecast project completion based on velocity."""
        remaining_points = params.get("remaining_points", 0)
        velocity = params.get("velocity", 0)
        velocity_std = params.get("velocity_std", 0)
        sprint_length_days = params.get("sprint_length_days", 14)
        
        if velocity == 0:
            return {"error": "Velocity cannot be zero"}
        
        # Calculate forecasts
        optimistic = remaining_points / (velocity + velocity_std) if velocity + velocity_std > 0 else float('inf')
        most_likely = remaining_points / velocity
        pessimistic = remaining_points / (velocity - velocity_std) if velocity - velocity_std > 0 else float('inf')
        
        # Convert to dates
        import datetime
        today = datetime.date.today()
        
        def add_sprints(sprints):
            if sprints == float('inf'):
                return "Cannot estimate"
            days = int(sprints * sprint_length_days)
            return (today + datetime.timedelta(days=days)).isoformat()
        
        return {
            "remaining_points": remaining_points,
            "velocity": velocity,
            "velocity_std": velocity_std,
            "sprints_forecast": {
                "optimistic": round(optimistic, 1) if optimistic != float('inf') else "N/A",
                "most_likely": round(most_likely, 1),
                "pessimistic": round(pessimistic, 1) if pessimistic != float('inf') else "N/A",
            },
            "date_forecast": {
                "optimistic": add_sprints(optimistic),
                "most_likely": add_sprints(most_likely),
                "pessimistic": add_sprints(pessimistic),
            },
            "confidence_note": "Based on historical velocity with normal distribution assumption",
        }
    
    async def _task_design_retrospective(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Design retrospective format and questions."""
        format_type = params.get("format", "4ls")
        team_size = params.get("team_size", 8)
        focus_area = params.get("focus_area", "general")
        
        formats = {
            "4ls": {
                "name": "4Ls Retrospective",
                "categories": ["Liked", "Learned", "Lacked", "Longed For"],
                "duration_minutes": 60,
                "best_for": "General sprint retrospective",
            },
            "starfish": {
                "name": "Starfish Retrospective",
                "categories": ["Keep Doing", "Less Of", "More Of", "Stop Doing", "Start Doing"],
                "duration_minutes": 75,
                "best_for": "Process improvement focus",
            },
            "sailboat": {
                "name": "Sailboat Retrospective",
                "categories": ["Wind (helps)", "Anchor (holds back)", "Rocks (risks)", "Island (goal)"],
                "duration_minutes": 60,
                "best_for": "Visual teams, goal-oriented",
            },
            "mad_sad_glad": {
                "name": "Mad Sad Glad",
                "categories": ["Mad", "Sad", "Glad"],
                "duration_minutes": 45,
                "best_for": "Quick emotional check-in",
            },
        }
        
        selected_format = formats.get(format_type, formats["4ls"])
        
        agenda = [
            {"activity": "Set the stage", "duration": 5, "description": "Review purpose, set safety"},
            {"activity": "Gather data", "duration": int(selected_format["duration_minutes"] * 0.4), "description": f"Collect input for each category"},
            {"activity": "Generate insights", "duration": int(selected_format["duration_minutes"] * 0.25), "description": "Discuss patterns and themes"},
            {"activity": "Decide what to do", "duration": int(selected_format["duration_minutes"] * 0.2), "description": "Select action items"},
            {"activity": "Close", "duration": 5, "description": "Summarize and thank team"},
        ]
        
        return {
            "format": selected_format,
            "team_size": team_size,
            "focus_area": focus_area,
            "agenda": agenda,
            "facilitation_tips": [
                "Ensure psychological safety",
                "Give equal voice to all participants",
                "Focus on behaviors, not people",
                "Limit action items to 2-3",
                "Follow up on previous action items",
            ],
        }
    
    async def _task_map_dependencies(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Map dependencies between teams/features."""
        items = params.get("items", [])
        
        dependency_matrix = []
        blocked_items = []
        
        for item in items:
            name = item.get("name", "")
            depends_on = item.get("depends_on", [])
            blocking = item.get("blocking", [])
            status = item.get("status", "not_started")
            
            dependency_matrix.append({
                "item": name,
                "depends_on": depends_on,
                "blocking": blocking,
                "dependency_count": len(depends_on),
                "blocks_count": len(blocking),
                "status": status,
            })
            
            if depends_on and status == "not_started":
                blocked_items.append({
                    "item": name,
                    "blocked_by": depends_on,
                })
        
        # Find critical path (items with most downstream dependencies)
        critical_items = sorted(dependency_matrix, key=lambda x: x["blocks_count"], reverse=True)[:3]
        
        return {
            "total_items": len(items),
            "dependency_matrix": dependency_matrix,
            "blocked_items": blocked_items,
            "blocked_count": len(blocked_items),
            "critical_path_items": [c["item"] for c in critical_items],
            "recommendations": [
                "Prioritize critical path items",
                "Schedule dependency sync meetings",
                "Identify mitigation for blocked items",
            ],
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_agile_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> AgileL4Worker:
    return AgileL4Worker(worker_key, l5_tools)

AGILE_WORKER_KEYS = list(AGILE_WORKER_CONFIGS.keys())
