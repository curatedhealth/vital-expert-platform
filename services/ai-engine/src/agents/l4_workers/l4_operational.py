"""
VITAL Path AI Services - VITAL L4 Operational Excellence Workers

Operational Excellence Workers: Process Optimizer, Lean Analyst,
Quality Controller, Capacity Planner, Continuous Improvement Lead
5 workers for process optimization and operational excellence tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: OperationalL4Worker
- Factory: create_operational_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
OPERATIONAL_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "process_optimizer": WorkerConfig(
        id="L4-PRO",
        name="Process Optimizer",
        description="Analyze and optimize business processes",
        category=WorkerCategory.OPERATIONAL_EXCELLENCE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "process_mapping", "bottleneck_analysis", "waste_identification",
            "value_stream_mapping", "process_redesign", "automation_assessment",
            "time_motion_study", "standardization_analysis"
        ],
    ),

    "lean_analyst": WorkerConfig(
        id="L4-LEA",
        name="Lean Analyst",
        description="Apply lean methodologies to improve efficiency",
        category=WorkerCategory.OPERATIONAL_EXCELLENCE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "five_s_assessment", "kanban_design", "takt_time_calculation",
            "muda_identification", "kaizen_planning", "poka_yoke_design",
            "andon_system_design", "gemba_analysis"
        ],
    ),

    "quality_controller": WorkerConfig(
        id="L4-QCO",
        name="Quality Controller",
        description="Monitor and improve quality metrics",
        category=WorkerCategory.OPERATIONAL_EXCELLENCE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "spc_analysis", "capability_analysis", "defect_analysis",
            "pareto_analysis", "control_chart_interpretation", "six_sigma_metrics",
            "dpmo_calculation", "sigma_level_calculation"
        ],
    ),

    "capacity_planner": WorkerConfig(
        id="L4-CPL",
        name="Capacity Planner",
        description="Plan and optimize resource capacity",
        category=WorkerCategory.OPERATIONAL_EXCELLENCE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "capacity_modeling", "demand_forecasting", "resource_allocation",
            "bottleneck_prediction", "throughput_optimization", "utilization_analysis",
            "queue_analysis", "workload_balancing"
        ],
    ),

    "continuous_improvement_lead": WorkerConfig(
        id="L4-CIL",
        name="Continuous Improvement Lead",
        description="Lead continuous improvement initiatives",
        category=WorkerCategory.OPERATIONAL_EXCELLENCE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "dmaic_planning", "a3_problem_solving", "root_cause_analysis",
            "ishikawa_analysis", "five_whys", "improvement_prioritization",
            "pdca_cycle", "kpi_dashboard_design"
        ],
    ),
}


class OperationalL4Worker(L4BaseWorker):
    """L4 Worker class for operational excellence tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in OPERATIONAL_WORKER_CONFIGS:
            raise ValueError(f"Unknown operational worker: {worker_key}")
        
        config = OPERATIONAL_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_value_stream_mapping(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create value stream map for a process."""
        process_name = params.get("process_name", "")
        steps = params.get("steps", [])
        
        if not steps:
            return {"error": "No process steps provided"}
        
        value_stream = {
            "process_name": process_name,
            "steps": [],
            "summary": {},
        }
        
        total_cycle_time = 0
        total_wait_time = 0
        value_add_time = 0
        non_value_add_time = 0
        
        for step in steps:
            cycle_time = step.get("cycle_time_min", 0)
            wait_time = step.get("wait_time_min", 0)
            is_value_add = step.get("value_add", True)
            
            step_data = {
                "name": step.get("name", ""),
                "cycle_time_min": cycle_time,
                "wait_time_min": wait_time,
                "value_add": is_value_add,
                "operator_count": step.get("operators", 1),
                "defect_rate_pct": step.get("defect_rate", 0),
            }
            
            value_stream["steps"].append(step_data)
            
            total_cycle_time += cycle_time
            total_wait_time += wait_time
            
            if is_value_add:
                value_add_time += cycle_time
            else:
                non_value_add_time += cycle_time
        
        lead_time = total_cycle_time + total_wait_time
        pce = (value_add_time / lead_time * 100) if lead_time > 0 else 0
        
        value_stream["summary"] = {
            "total_cycle_time_min": total_cycle_time,
            "total_wait_time_min": total_wait_time,
            "lead_time_min": lead_time,
            "value_add_time_min": value_add_time,
            "non_value_add_time_min": non_value_add_time,
            "process_cycle_efficiency_pct": round(pce, 1),
        }
        
        value_stream["improvement_opportunities"] = []
        if pce < 25:
            value_stream["improvement_opportunities"].append(
                f"PCE is {round(pce,1)}% - significant opportunity to reduce wait times"
            )
        if total_wait_time > total_cycle_time:
            value_stream["improvement_opportunities"].append(
                "Wait time exceeds process time - focus on flow improvement"
            )
        
        return value_stream
    
    async def _task_takt_time_calculation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate takt time for production planning."""
        available_time_min = params.get("available_time_min", 480)  # 8 hour shift
        demand_units = params.get("demand_units", 0)
        breaks_min = params.get("breaks_min", 30)
        
        if demand_units == 0:
            return {"error": "Demand units cannot be zero"}
        
        net_available_time = available_time_min - breaks_min
        takt_time = net_available_time / demand_units
        
        return {
            "available_time_min": available_time_min,
            "breaks_min": breaks_min,
            "net_available_time_min": net_available_time,
            "demand_units": demand_units,
            "takt_time_min": round(takt_time, 2),
            "takt_time_sec": round(takt_time * 60, 1),
            "interpretation": f"Each unit must be completed every {round(takt_time, 2)} minutes to meet demand",
        }
    
    async def _task_five_s_assessment(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct 5S assessment of a work area."""
        area_name = params.get("area_name", "")
        scores = params.get("scores", {})
        
        five_s = {
            "sort": {
                "name": "Sort (Seiri)",
                "description": "Remove unnecessary items",
                "score": scores.get("sort", 0),
                "max_score": 5,
                "questions": [
                    "Are unnecessary items removed from the area?",
                    "Is there a clear red-tag process?",
                ],
            },
            "set_in_order": {
                "name": "Set in Order (Seiton)",
                "description": "Organize remaining items",
                "score": scores.get("set_in_order", 0),
                "max_score": 5,
                "questions": [
                    "Is there a place for everything?",
                    "Are items labeled and easy to find?",
                ],
            },
            "shine": {
                "name": "Shine (Seiso)",
                "description": "Clean the work area",
                "score": scores.get("shine", 0),
                "max_score": 5,
                "questions": [
                    "Is the area clean?",
                    "Are cleaning schedules in place?",
                ],
            },
            "standardize": {
                "name": "Standardize (Seiketsu)",
                "description": "Maintain consistency",
                "score": scores.get("standardize", 0),
                "max_score": 5,
                "questions": [
                    "Are there visual standards in place?",
                    "Is there a documented procedure?",
                ],
            },
            "sustain": {
                "name": "Sustain (Shitsuke)",
                "description": "Make 5S a habit",
                "score": scores.get("sustain", 0),
                "max_score": 5,
                "questions": [
                    "Are regular audits conducted?",
                    "Is there management commitment?",
                ],
            },
        }
        
        total_score = sum(s["score"] for s in five_s.values())
        max_total = sum(s["max_score"] for s in five_s.values())
        overall_pct = (total_score / max_total * 100) if max_total > 0 else 0
        
        # Rating
        if overall_pct >= 90:
            rating = "World Class"
        elif overall_pct >= 80:
            rating = "Excellent"
        elif overall_pct >= 70:
            rating = "Good"
        elif overall_pct >= 60:
            rating = "Fair"
        else:
            rating = "Needs Improvement"
        
        return {
            "area_name": area_name,
            "assessment": five_s,
            "summary": {
                "total_score": total_score,
                "max_score": max_total,
                "percentage": round(overall_pct, 1),
                "rating": rating,
            },
            "lowest_scores": sorted(
                [(k, v["score"]) for k, v in five_s.items()],
                key=lambda x: x[1]
            )[:2],
        }
    
    async def _task_six_sigma_metrics(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Six Sigma quality metrics."""
        units_produced = params.get("units_produced", 0)
        defects = params.get("defects", 0)
        opportunities_per_unit = params.get("opportunities_per_unit", 1)
        
        if units_produced == 0 or opportunities_per_unit == 0:
            return {"error": "Units and opportunities must be greater than zero"}
        
        total_opportunities = units_produced * opportunities_per_unit
        
        # DPU - Defects Per Unit
        dpu = defects / units_produced
        
        # DPO - Defects Per Opportunity
        dpo = defects / total_opportunities
        
        # DPMO - Defects Per Million Opportunities
        dpmo = dpo * 1_000_000
        
        # Yield
        first_pass_yield = (1 - dpu) * 100
        
        # Sigma level approximation
        import math
        if dpmo > 0 and dpmo < 1_000_000:
            # Approximation using inverse normal distribution concept
            sigma_level = self._dpmo_to_sigma(dpmo)
        else:
            sigma_level = 0 if dpmo >= 1_000_000 else 6
        
        return {
            "inputs": {
                "units_produced": units_produced,
                "defects": defects,
                "opportunities_per_unit": opportunities_per_unit,
            },
            "metrics": {
                "dpu": round(dpu, 4),
                "dpo": round(dpo, 6),
                "dpmo": round(dpmo, 0),
                "first_pass_yield_pct": round(first_pass_yield, 2),
                "sigma_level": round(sigma_level, 2),
            },
            "interpretation": self._interpret_sigma(sigma_level),
        }
    
    def _dpmo_to_sigma(self, dpmo: float) -> float:
        """Convert DPMO to sigma level (approximation)."""
        sigma_table = [
            (6.68, 6.0), (233, 5.0), (6210, 4.0),
            (66807, 3.0), (308537, 2.0), (691462, 1.0),
        ]
        for threshold, sigma in sigma_table:
            if dpmo <= threshold:
                return sigma
        return 1.0
    
    def _interpret_sigma(self, sigma: float) -> str:
        """Interpret sigma level."""
        if sigma >= 6:
            return "World class quality (3.4 DPMO)"
        elif sigma >= 5:
            return "Excellent quality"
        elif sigma >= 4:
            return "Good quality - industry average"
        elif sigma >= 3:
            return "Below average - improvement needed"
        else:
            return "Poor quality - urgent action required"
    
    async def _task_ishikawa_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create Ishikawa (fishbone) diagram structure."""
        problem = params.get("problem", "")
        causes = params.get("causes", {})
        
        categories = {
            "man": {
                "name": "Man (People)",
                "causes": causes.get("man", []),
                "prompt_questions": [
                    "Training issues?",
                    "Skill gaps?",
                    "Communication problems?",
                ],
            },
            "machine": {
                "name": "Machine (Equipment)",
                "causes": causes.get("machine", []),
                "prompt_questions": [
                    "Equipment failures?",
                    "Maintenance issues?",
                    "Calibration problems?",
                ],
            },
            "method": {
                "name": "Method (Process)",
                "causes": causes.get("method", []),
                "prompt_questions": [
                    "Procedure issues?",
                    "Standardization gaps?",
                    "Process variability?",
                ],
            },
            "material": {
                "name": "Material",
                "causes": causes.get("material", []),
                "prompt_questions": [
                    "Quality issues?",
                    "Supplier problems?",
                    "Specification gaps?",
                ],
            },
            "measurement": {
                "name": "Measurement",
                "causes": causes.get("measurement", []),
                "prompt_questions": [
                    "Measurement errors?",
                    "Instrument issues?",
                    "Data quality problems?",
                ],
            },
            "environment": {
                "name": "Environment",
                "causes": causes.get("environment", []),
                "prompt_questions": [
                    "Temperature/humidity?",
                    "Workplace conditions?",
                    "External factors?",
                ],
            },
        }
        
        return {
            "problem_statement": problem,
            "categories": categories,
            "total_causes_identified": sum(len(c["causes"]) for c in categories.values()),
            "next_steps": [
                "Validate causes with data",
                "Prioritize using Pareto analysis",
                "Apply 5 Whys to top causes",
                "Develop countermeasures",
            ],
        }
    
    async def _task_five_whys(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Guide 5 Whys root cause analysis."""
        problem = params.get("problem", "")
        whys = params.get("whys", [])
        
        analysis = {
            "problem": problem,
            "why_chain": [],
            "root_cause_identified": False,
        }
        
        for i, why in enumerate(whys[:5], 1):
            analysis["why_chain"].append({
                "level": i,
                "why": f"Why {i}",
                "answer": why,
            })
        
        if len(whys) >= 5:
            analysis["root_cause_identified"] = True
            analysis["root_cause"] = whys[-1]
            analysis["countermeasure_guidance"] = [
                "Address root cause, not symptoms",
                "Implement mistake-proofing where possible",
                "Verify effectiveness with data",
            ]
        else:
            analysis["guidance"] = f"Continue asking 'Why?' ({5 - len(whys)} more levels recommended)"
        
        return analysis
    
    async def _task_capacity_modeling(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Model capacity and identify constraints."""
        workstations = params.get("workstations", [])
        
        if not workstations:
            return {"error": "No workstations provided"}
        
        analysis = []
        min_capacity = float('inf')
        bottleneck = None
        
        for ws in workstations:
            name = ws.get("name", "")
            cycle_time_min = ws.get("cycle_time_min", 0)
            availability_pct = ws.get("availability_pct", 100)
            operators = ws.get("operators", 1)
            
            if cycle_time_min > 0:
                # Units per hour = (60 / cycle_time) * availability * operators
                capacity = (60 / cycle_time_min) * (availability_pct / 100) * operators
            else:
                capacity = float('inf')
            
            analysis.append({
                "workstation": name,
                "cycle_time_min": cycle_time_min,
                "availability_pct": availability_pct,
                "operators": operators,
                "capacity_units_per_hour": round(capacity, 1),
            })
            
            if capacity < min_capacity:
                min_capacity = capacity
                bottleneck = name
        
        return {
            "workstation_analysis": analysis,
            "bottleneck": bottleneck,
            "system_capacity_per_hour": round(min_capacity, 1),
            "recommendations": [
                f"Focus improvement efforts on bottleneck: {bottleneck}",
                "Consider adding capacity at constraint",
                "Reduce cycle time or increase availability at constraint",
            ],
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_operational_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> OperationalL4Worker:
    return OperationalL4Worker(worker_key, l5_tools)

OPERATIONAL_WORKER_KEYS = list(OPERATIONAL_WORKER_CONFIGS.keys())
