"""
VITAL Path AI Services - VITAL L4 HEOR Workers

Health Economics & Outcomes Research Workers: Cost-Effectiveness Modeler,
Budget Impact Analyst, QALY Calculator, Market Access Strategist, Value Dossier Builder
5 workers for health economics and value demonstration tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: HEORL4Worker
- Factory: create_heor_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
HEOR_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "cost_effectiveness_modeler": WorkerConfig(
        id="L4-CEM",
        name="Cost-Effectiveness Modeler",
        description="Build and analyze cost-effectiveness models (CEA, CUA)",
        category=WorkerCategory.HEOR,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "r_stats", "cms_medicare",
            "nice_dsu", "stata", "excel_heor"
        ],
        task_types=[
            "build_markov_model", "build_decision_tree", "calculate_icer",
            "run_psa", "run_dsa", "tornado_analysis", "ceac_curve"
        ],
    ),

    "budget_impact_analyst": WorkerConfig(
        id="L4-BIA",
        name="Budget Impact Analyst",
        description="Analyze budget impact of new treatments",
        category=WorkerCategory.HEOR,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "cms_medicare", "excel_heor"
        ],
        task_types=[
            "estimate_eligible_population", "calculate_market_share",
            "project_budget_impact", "scenario_analysis", "sensitivity_analysis"
        ],
    ),

    "qaly_calculator": WorkerConfig(
        id="L4-QAL",
        name="QALY Calculator",
        description="Calculate QALYs and utility values",
        category=WorkerCategory.HEOR,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "r_stats", "pubmed"
        ],
        task_types=[
            "calculate_qaly", "estimate_utility", "apply_disutility",
            "map_eq5d", "calculate_lys", "apply_discounting"
        ],
    ),

    "market_access_strategist": WorkerConfig(
        id="L4-MAS",
        name="Market Access Strategist",
        description="Develop market access and reimbursement strategies",
        category=WorkerCategory.HEOR,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "cms_medicare", "nice_dsu", "iqvia_heor", "pubmed"
        ],
        task_types=[
            "analyze_payer_landscape", "identify_reimbursement_pathway",
            "assess_formulary_status", "benchmark_pricing", "develop_value_story"
        ],
    ),

    "value_dossier_builder": WorkerConfig(
        id="L4-VDB",
        name="Value Dossier Builder",
        description="Build AMCP format value dossiers and payer submissions",
        category=WorkerCategory.HEOR,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "cochrane", "clinicaltrials",
            "cms_medicare", "nice_dsu", "calculator"
        ],
        task_types=[
            "build_clinical_section", "build_economic_section",
            "summarize_evidence", "create_executive_summary",
            "format_amcp_dossier", "create_slide_deck"
        ],
    ),
}


class HEORL4Worker(L4BaseWorker):
    """L4 Worker class for health economics and outcomes research tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in HEOR_WORKER_CONFIGS:
            raise ValueError(f"Unknown HEOR worker: {worker_key}")
        
        config = HEOR_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_calculate_icer(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Incremental Cost-Effectiveness Ratio."""
        intervention_cost = params.get("intervention_cost", 0)
        comparator_cost = params.get("comparator_cost", 0)
        intervention_qalys = params.get("intervention_qalys", 0)
        comparator_qalys = params.get("comparator_qalys", 0)
        
        incremental_cost = intervention_cost - comparator_cost
        incremental_qalys = intervention_qalys - comparator_qalys
        
        if incremental_qalys == 0:
            icer = float('inf') if incremental_cost > 0 else 0
            interpretation = "Dominated" if incremental_cost > 0 else "Equal effectiveness"
        else:
            icer = incremental_cost / incremental_qalys
            
            # Interpret against common thresholds
            if icer < 0:
                interpretation = "Dominant (more effective, less costly)"
            elif icer <= 50000:
                interpretation = "Cost-effective at $50,000/QALY threshold"
            elif icer <= 100000:
                interpretation = "Cost-effective at $100,000/QALY threshold"
            elif icer <= 150000:
                interpretation = "Cost-effective at $150,000/QALY threshold"
            else:
                interpretation = "Not cost-effective at standard thresholds"
        
        return {
            "intervention_cost": intervention_cost,
            "comparator_cost": comparator_cost,
            "intervention_qalys": intervention_qalys,
            "comparator_qalys": comparator_qalys,
            "incremental_cost": incremental_cost,
            "incremental_qalys": incremental_qalys,
            "icer": icer if icer != float('inf') else "Dominated",
            "interpretation": interpretation,
            "currency": params.get("currency", "USD"),
        }
    
    async def _task_calculate_qaly(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Quality-Adjusted Life Years."""
        life_years = params.get("life_years", 0)
        utility = params.get("utility", 1.0)
        discount_rate = params.get("discount_rate", 0.03)
        apply_discounting = params.get("apply_discounting", True)
        
        # Simple QALY calculation
        undiscounted_qaly = life_years * utility
        
        # Apply discounting if requested
        if apply_discounting and discount_rate > 0:
            # Continuous discounting approximation
            if discount_rate > 0:
                discounted_qaly = undiscounted_qaly * (
                    (1 - (1 + discount_rate) ** -life_years) / 
                    (discount_rate * life_years)
                ) if life_years > 0 else 0
            else:
                discounted_qaly = undiscounted_qaly
        else:
            discounted_qaly = undiscounted_qaly
        
        return {
            "life_years": life_years,
            "utility": utility,
            "discount_rate": discount_rate,
            "undiscounted_qaly": round(undiscounted_qaly, 3),
            "discounted_qaly": round(discounted_qaly, 3),
        }
    
    async def _task_project_budget_impact(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Project budget impact over time horizon."""
        eligible_population = params.get("eligible_population", 0)
        market_share_year1 = params.get("market_share_year1", 0.1)
        market_share_growth = params.get("market_share_growth", 0.1)
        time_horizon = params.get("time_horizon", 3)
        intervention_cost = params.get("intervention_cost", 0)
        comparator_cost = params.get("comparator_cost", 0)
        
        yearly_impacts = []
        cumulative_impact = 0
        
        for year in range(1, time_horizon + 1):
            market_share = min(
                market_share_year1 + (market_share_growth * (year - 1)),
                1.0
            )
            treated_patients = eligible_population * market_share
            
            intervention_spend = treated_patients * intervention_cost
            comparator_spend = treated_patients * comparator_cost
            net_impact = intervention_spend - comparator_spend
            cumulative_impact += net_impact
            
            yearly_impacts.append({
                "year": year,
                "market_share": round(market_share, 3),
                "treated_patients": int(treated_patients),
                "intervention_spend": round(intervention_spend, 2),
                "comparator_spend": round(comparator_spend, 2),
                "net_budget_impact": round(net_impact, 2),
            })
        
        return {
            "eligible_population": eligible_population,
            "time_horizon": time_horizon,
            "yearly_impacts": yearly_impacts,
            "cumulative_impact": round(cumulative_impact, 2),
            "average_annual_impact": round(cumulative_impact / time_horizon, 2),
        }
    
    async def _task_build_markov_model(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Build Markov model structure."""
        health_states = params.get("health_states", [])
        transition_probabilities = params.get("transitions", {})
        cycle_length = params.get("cycle_length", 1)  # years
        time_horizon = params.get("time_horizon", 10)
        
        # Validate state definitions
        model_structure = {
            "states": [],
            "transitions": [],
            "cycle_length_years": cycle_length,
            "time_horizon_years": time_horizon,
            "total_cycles": int(time_horizon / cycle_length),
        }
        
        for state in health_states:
            model_structure["states"].append({
                "name": state.get("name"),
                "utility": state.get("utility", 1.0),
                "cost": state.get("cost", 0),
                "is_absorbing": state.get("is_absorbing", False),
            })
        
        for from_state, to_states in transition_probabilities.items():
            for to_state, prob in to_states.items():
                model_structure["transitions"].append({
                    "from": from_state,
                    "to": to_state,
                    "probability": prob,
                })
        
        return model_structure
    
    async def _task_analyze_payer_landscape(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze payer landscape for market access."""
        therapeutic_area = params.get("therapeutic_area", "")
        geography = params.get("geography", "US")
        
        # Get CMS data for Medicare landscape
        cms_result = await self.call_l5_tool("cms_medicare", {
            "query": therapeutic_area,
            "data_type": "coverage",
        })
        
        return {
            "therapeutic_area": therapeutic_area,
            "geography": geography,
            "payer_analysis": {
                "medicare": cms_result.get("data", {}),
                "medicaid": {"status": "requires_separate_analysis"},
                "commercial": {"status": "requires_claims_data"},
            },
            "recommendations": [
                "Conduct payer advisory boards",
                "Develop pharmacoeconomic evidence",
                "Create value dossier",
            ],
        }
    
    async def _task_format_amcp_dossier(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Format content for AMCP dossier structure."""
        product_name = params.get("product_name", "")
        sections = params.get("sections", {})
        
        amcp_structure = {
            "product_name": product_name,
            "sections": {
                "1_product_info": {
                    "title": "Product Information",
                    "content": sections.get("product_info", ""),
                },
                "2_clinical_overview": {
                    "title": "Clinical Overview",
                    "content": sections.get("clinical", ""),
                },
                "3_pharmacoeconomics": {
                    "title": "Pharmacoeconomic Analysis",
                    "content": sections.get("economics", ""),
                },
                "4_budget_impact": {
                    "title": "Budget Impact Analysis",
                    "content": sections.get("budget_impact", ""),
                },
                "5_clinical_guidelines": {
                    "title": "Clinical Guidelines",
                    "content": sections.get("guidelines", ""),
                },
                "6_supporting_evidence": {
                    "title": "Supporting Evidence",
                    "content": sections.get("evidence", ""),
                },
            },
            "format": "AMCP Format Dossier 4.1",
        }
        
        return amcp_structure
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_heor_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> HEORL4Worker:
    return HEORL4Worker(worker_key, l5_tools)

HEOR_WORKER_KEYS = list(HEOR_WORKER_CONFIGS.keys())
