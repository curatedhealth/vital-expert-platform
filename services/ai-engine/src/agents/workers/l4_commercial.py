"""
VITAL Path AI Services - VITAL L4 Commercial Workers

Commercial Workers: Market Analyzer, Sales Forecaster,
Pricing Strategist, Launch Planner, Territory Optimizer
5 workers for commercial and market access tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: CommercialL4Worker
- Factory: create_commercial_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
COMMERCIAL_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "market_analyzer": WorkerConfig(
        id="L4-MKT",
        name="Market Analyzer",
        description="Analyze pharmaceutical markets and competitive landscape",
        category=WorkerCategory.COMMERCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "cms_medicare", "openfda", "clinicaltrials",
            "pubmed", "iqvia_heor", "web_search"
        ],
        task_types=[
            "market_size_estimation", "competitive_landscape",
            "market_share_analysis", "trend_analysis",
            "patient_population_sizing", "unmet_need_assessment"
        ],
    ),

    "sales_forecaster": WorkerConfig(
        id="L4-SFC",
        name="Sales Forecaster",
        description="Forecast pharmaceutical sales and revenue",
        category=WorkerCategory.COMMERCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "cms_medicare", "iqvia_heor"
        ],
        task_types=[
            "revenue_forecast", "unit_forecast", "scenario_modeling",
            "launch_curve_projection", "market_penetration_estimate",
            "seasonal_adjustment"
        ],
    ),

    "pricing_strategist": WorkerConfig(
        id="L4-PRC",
        name="Pricing Strategist",
        description="Develop pricing strategies and analyze price sensitivity",
        category=WorkerCategory.COMMERCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "cms_medicare", "openfda", "calculator", "nice_dsu"
        ],
        task_types=[
            "price_benchmarking", "value_based_pricing",
            "rebate_analysis", "gross_to_net_calculation",
            "international_reference_pricing", "price_elasticity"
        ],
    ),

    "launch_planner": WorkerConfig(
        id="L4-LNC",
        name="Launch Planner",
        description="Plan pharmaceutical product launches",
        category=WorkerCategory.COMMERCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "clinicaltrials", "openfda", "cms_medicare", "calculator"
        ],
        task_types=[
            "launch_sequencing", "market_readiness_assessment",
            "channel_strategy", "inventory_planning",
            "stakeholder_mapping", "launch_timeline"
        ],
    ),

    "territory_optimizer": WorkerConfig(
        id="L4-TER",
        name="Territory Optimizer",
        description="Optimize sales territories and resource allocation",
        category=WorkerCategory.COMMERCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "cms_medicare", "calculator"
        ],
        task_types=[
            "territory_design", "call_planning",
            "resource_allocation", "workload_balancing",
            "coverage_optimization", "performance_benchmarking"
        ],
    ),
}


class CommercialL4Worker(L4BaseWorker):
    """L4 Worker class for commercial tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in COMMERCIAL_WORKER_CONFIGS:
            raise ValueError(f"Unknown commercial worker: {worker_key}")
        
        config = COMMERCIAL_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_market_size_estimation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Estimate market size for a therapeutic area."""
        therapeutic_area = params.get("therapeutic_area", "")
        geography = params.get("geography", "US")
        prevalence_rate = params.get("prevalence_rate", 0)
        treatment_rate = params.get("treatment_rate", 0.5)
        average_price = params.get("average_price", 0)
        
        # Get population data
        population_estimates = {
            "US": 330_000_000,
            "EU5": 320_000_000,
            "Japan": 125_000_000,
            "China": 1_400_000_000,
        }
        
        population = population_estimates.get(geography, 330_000_000)
        
        # Calculate market size
        patient_pool = population * prevalence_rate
        treated_patients = patient_pool * treatment_rate
        market_size = treated_patients * average_price
        
        return {
            "therapeutic_area": therapeutic_area,
            "geography": geography,
            "population": population,
            "prevalence_rate": prevalence_rate,
            "patient_pool": int(patient_pool),
            "treatment_rate": treatment_rate,
            "treated_patients": int(treated_patients),
            "average_price": average_price,
            "total_market_size": round(market_size, 2),
            "market_size_formatted": f"${market_size/1_000_000_000:.2f}B" if market_size >= 1_000_000_000 else f"${market_size/1_000_000:.1f}M",
        }
    
    async def _task_revenue_forecast(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Forecast revenue over time horizon."""
        base_revenue = params.get("base_revenue", 0)
        growth_rate = params.get("growth_rate", 0.1)
        time_horizon = params.get("time_horizon", 5)
        market_events = params.get("market_events", [])
        
        forecasts = []
        cumulative = 0
        current_revenue = base_revenue
        
        for year in range(1, time_horizon + 1):
            # Apply growth
            current_revenue *= (1 + growth_rate)
            
            # Apply market events (e.g., LOE, new competitor)
            for event in market_events:
                if event.get("year") == year:
                    impact = event.get("impact", 0)
                    current_revenue *= (1 + impact)
            
            cumulative += current_revenue
            
            forecasts.append({
                "year": year,
                "revenue": round(current_revenue, 2),
                "growth_yoy": growth_rate * 100,
            })
        
        return {
            "base_revenue": base_revenue,
            "growth_rate": growth_rate,
            "time_horizon": time_horizon,
            "yearly_forecasts": forecasts,
            "cumulative_revenue": round(cumulative, 2),
            "cagr": round(((forecasts[-1]["revenue"] / base_revenue) ** (1/time_horizon) - 1) * 100, 2) if base_revenue > 0 else 0,
        }
    
    async def _task_price_benchmarking(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Benchmark pricing against competitors."""
        drug_name = params.get("drug_name", "")
        competitors = params.get("competitors", [])
        price_type = params.get("price_type", "WAC")
        
        # Get drug information from OpenFDA
        drug_result = await self.call_l5_tool("openfda", {
            "endpoint": "drug/ndc",
            "params": {"search": f'brand_name:"{drug_name}"'},
        })
        
        benchmarks = []
        for competitor in competitors:
            comp_result = await self.call_l5_tool("openfda", {
                "endpoint": "drug/ndc",
                "params": {"search": f'brand_name:"{competitor.get("name", "")}"'},
            })
            
            benchmarks.append({
                "competitor": competitor.get("name"),
                "price": competitor.get("price", 0),
                "price_per_unit": competitor.get("price_per_unit", 0),
                "indication": competitor.get("indication", ""),
            })
        
        return {
            "drug_name": drug_name,
            "price_type": price_type,
            "competitor_benchmarks": benchmarks,
            "pricing_recommendation": "Based on competitive analysis",
        }
    
    async def _task_launch_timeline(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create launch timeline and milestones."""
        drug_name = params.get("drug_name", "")
        approval_date = params.get("approval_date", "")
        launch_markets = params.get("markets", ["US"])
        
        # Standard launch milestones
        milestones = [
            {"milestone": "Regulatory Approval", "timing": "T+0", "status": "completed" if approval_date else "pending"},
            {"milestone": "Pricing & Reimbursement Negotiations", "timing": "T+0 to T+3 months", "status": "in_progress"},
            {"milestone": "Supply Chain Readiness", "timing": "T+1 month", "status": "pending"},
            {"milestone": "Sales Force Training", "timing": "T+2 months", "status": "pending"},
            {"milestone": "KOL Engagement", "timing": "T+1 to T+3 months", "status": "in_progress"},
            {"milestone": "Formulary Submissions", "timing": "T+1 to T+6 months", "status": "pending"},
            {"milestone": "Commercial Launch", "timing": "T+3 months", "status": "pending"},
            {"milestone": "Full Distribution", "timing": "T+6 months", "status": "pending"},
        ]
        
        return {
            "drug_name": drug_name,
            "approval_date": approval_date,
            "launch_markets": launch_markets,
            "milestones": milestones,
            "critical_path_items": [
                "Pricing negotiations",
                "Formulary access",
                "Supply chain readiness",
            ],
        }
    
    async def _task_territory_design(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Design sales territories."""
        total_reps = params.get("total_reps", 0)
        territories = params.get("territories", [])
        optimization_criteria = params.get("criteria", "workload_balance")
        
        if not territories:
            return {"error": "No territories provided"}
        
        # Calculate metrics per territory
        total_potential = sum(t.get("potential", 0) for t in territories)
        avg_potential_per_rep = total_potential / total_reps if total_reps > 0 else 0
        
        territory_assignments = []
        for territory in territories:
            potential = territory.get("potential", 0)
            recommended_reps = max(1, round(potential / avg_potential_per_rep)) if avg_potential_per_rep > 0 else 1
            
            territory_assignments.append({
                "territory_name": territory.get("name"),
                "potential": potential,
                "recommended_reps": recommended_reps,
                "potential_per_rep": potential / recommended_reps if recommended_reps > 0 else 0,
            })
        
        return {
            "total_reps": total_reps,
            "total_potential": total_potential,
            "average_potential_per_rep": round(avg_potential_per_rep, 2),
            "territory_assignments": territory_assignments,
            "optimization_criteria": optimization_criteria,
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_commercial_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> CommercialL4Worker:
    return CommercialL4Worker(worker_key, l5_tools)

COMMERCIAL_WORKER_KEYS = list(COMMERCIAL_WORKER_CONFIGS.keys())
