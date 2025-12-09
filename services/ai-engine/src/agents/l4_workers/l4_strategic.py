"""
VITAL Path AI Services - VITAL L4 Strategic Workers

Strategic Workers: Hypothesis Generator, Strategy Calibrator,
Opportunity Explorer, Competitive Tracker, Outcome Forecaster
5 workers for strategic analysis and planning.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: StrategicL4Worker
- Factory: create_strategic_worker(worker_key)
"""

from typing import Dict, Any
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
STRATEGIC_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "hypothesis_generator": WorkerConfig(
        id="L4-HG",
        name="Hypothesis Generator",
        description="Generate research hypotheses from data patterns",
        category=WorkerCategory.STRATEGIC,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["pubmed", "clinicaltrials", "omop"],
        task_types=["generate_hypotheses", "identify_gaps", "propose_studies", "mechanism_inference"],
    ),

    "strategy_calibrator": WorkerConfig(
        id="L4-SC",
        name="Strategy Calibrator",
        description="Calibrate and validate strategic recommendations",
        category=WorkerCategory.STRATEGIC,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["clinicaltrials", "cms_medicare", "nice_dsu"],
        task_types=["validate_strategy", "assess_feasibility", "benchmark_approach", "risk_adjust"],
    ),

    "opportunity_explorer": WorkerConfig(
        id="L4-OE",
        name="Opportunity Explorer",
        description="Explore market and research opportunities",
        category=WorkerCategory.STRATEGIC,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["clinicaltrials", "pubmed", "cms_medicare"],
        task_types=["identify_opportunities", "market_gaps", "unmet_needs", "competitive_landscape"],
    ),

    "competitive_tracker": WorkerConfig(
        id="L4-CT",
        name="Competitive Tracker",
        description="Track and analyze competitive activity",
        category=WorkerCategory.STRATEGIC,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["clinicaltrials", "openfda", "pubmed"],
        task_types=["track_competitors", "pipeline_analysis", "patent_landscape", "regulatory_filings"],
    ),

    "outcome_forecaster": WorkerConfig(
        id="L4-OF",
        name="Outcome Forecaster",
        description="Forecast clinical and business outcomes",
        category=WorkerCategory.STRATEGIC,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["calculator", "r_stats", "cms_medicare"],
        task_types=["forecast_outcomes", "scenario_analysis", "probability_success", "timeline_estimation"],
    ),
}


class StrategicL4Worker(L4BaseWorker):
    """L4 Worker class for strategic analysis tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in STRATEGIC_WORKER_CONFIGS:
            raise ValueError(f"Unknown strategic worker: {worker_key}")
        
        config = STRATEGIC_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_identify_opportunities(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Identify market opportunities in a therapeutic area."""
        therapeutic_area = params.get("therapeutic_area", "")
        
        if not therapeutic_area:
            return {"error": "Therapeutic area required"}
        
        # Search for active trials
        trials_result = await self.call_l5_tool("clinicaltrials", {
            "condition": therapeutic_area,
            "status": ["RECRUITING", "NOT_YET_RECRUITING"],
            "max_results": 50,
        })
        
        trials = trials_result.get("data", {}).get("trials", [])
        
        # Analyze phases
        phase_counts = {}
        for trial in trials:
            for phase in trial.get("phase", ["Unknown"]):
                phase_counts[phase] = phase_counts.get(phase, 0) + 1
        
        return {
            "therapeutic_area": therapeutic_area,
            "active_trials": len(trials),
            "phase_distribution": phase_counts,
            "top_sponsors": self._count_sponsors(trials),
        }
    
    def _count_sponsors(self, trials: list) -> dict:
        """Count trials by sponsor."""
        sponsors = {}
        for trial in trials:
            sponsor = trial.get("sponsor", "Unknown")
            if isinstance(sponsor, dict):
                sponsor = sponsor.get("name", "Unknown")
            sponsors[sponsor] = sponsors.get(sponsor, 0) + 1
        
        # Return top 10
        return dict(sorted(sponsors.items(), key=lambda x: x[1], reverse=True)[:10])
    
    async def _task_track_competitors(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Track competitor pipeline activity."""
        competitor = params.get("competitor", "")
        drug_class = params.get("drug_class")
        
        if not competitor:
            return {"error": "Competitor name required"}
        
        # Search trials by sponsor
        result = await self.call_l5_tool("clinicaltrials", {
            "query": competitor,
            "max_results": 20,
        })
        
        return {
            "competitor": competitor,
            "trials_found": result.get("data", {}).get("total", 0),
            "trials": result.get("data", {}).get("trials", [])[:10],
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_strategic_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> StrategicL4Worker:
    return StrategicL4Worker(worker_key, l5_tools)

STRATEGIC_WORKER_KEYS = list(STRATEGIC_WORKER_CONFIGS.keys())
