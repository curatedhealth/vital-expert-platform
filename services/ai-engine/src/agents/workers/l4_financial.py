"""
VITAL Path AI Services - VITAL L4 Financial Workers

Financial Workers: ROI Calculator, NPV Analyzer,
Portfolio Valuator, Cost Modeler, Investment Appraiser
5 workers for financial analysis and valuation tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: FinancialL4Worker
- Factory: create_financial_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
FINANCIAL_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "roi_calculator": WorkerConfig(
        id="L4-ROI",
        name="ROI Calculator",
        description="Calculate return on investment for pharma initiatives",
        category=WorkerCategory.FINANCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "calculate_roi", "payback_period", "break_even_analysis",
            "incremental_roi", "risk_adjusted_roi", "compare_investments"
        ],
    ),

    "npv_analyzer": WorkerConfig(
        id="L4-NPV",
        name="NPV Analyzer",
        description="Perform NPV and DCF analysis",
        category=WorkerCategory.FINANCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "calculate_npv", "calculate_irr", "dcf_valuation",
            "sensitivity_to_discount_rate", "scenario_npv", "risk_adjusted_npv"
        ],
    ),

    "portfolio_valuator": WorkerConfig(
        id="L4-PFV",
        name="Portfolio Valuator",
        description="Value pharmaceutical pipelines and portfolios",
        category=WorkerCategory.FINANCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "clinicaltrials"
        ],
        task_types=[
            "pipeline_valuation", "rnpv_calculation", "probability_weighting",
            "portfolio_optimization", "asset_valuation", "phase_transition_analysis"
        ],
    ),

    "cost_modeler": WorkerConfig(
        id="L4-CST",
        name="Cost Modeler",
        description="Model costs for clinical development and commercialization",
        category=WorkerCategory.FINANCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "clinicaltrials"
        ],
        task_types=[
            "development_cost_estimation", "trial_cost_modeling",
            "manufacturing_cost", "commercialization_cost",
            "cost_per_patient", "cost_breakdown"
        ],
    ),

    "investment_appraiser": WorkerConfig(
        id="L4-INV",
        name="Investment Appraiser",
        description="Appraise BD&L opportunities and M&A targets",
        category=WorkerCategory.FINANCIAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "clinicaltrials", "pubmed"
        ],
        task_types=[
            "deal_valuation", "synergy_analysis", "comparable_analysis",
            "accretion_dilution", "milestone_structuring", "risk_assessment"
        ],
    ),
}


class FinancialL4Worker(L4BaseWorker):
    """L4 Worker class for financial analysis tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in FINANCIAL_WORKER_CONFIGS:
            raise ValueError(f"Unknown financial worker: {worker_key}")
        
        config = FINANCIAL_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_calculate_roi(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Return on Investment."""
        investment = params.get("investment", 0)
        returns = params.get("returns", 0)
        time_period = params.get("time_period", 1)
        
        if investment == 0:
            return {"error": "Investment cannot be zero"}
        
        net_profit = returns - investment
        roi = (net_profit / investment) * 100
        annualized_roi = ((1 + roi/100) ** (1/time_period) - 1) * 100 if time_period > 0 else roi
        
        return {
            "investment": investment,
            "returns": returns,
            "net_profit": net_profit,
            "roi_percent": round(roi, 2),
            "time_period_years": time_period,
            "annualized_roi_percent": round(annualized_roi, 2),
            "interpretation": self._interpret_roi(roi),
        }
    
    def _interpret_roi(self, roi: float) -> str:
        """Interpret ROI value."""
        if roi > 100:
            return "Excellent return - doubles investment"
        elif roi > 50:
            return "Strong return"
        elif roi > 20:
            return "Good return - above industry average"
        elif roi > 0:
            return "Positive but modest return"
        else:
            return "Negative return - reconsider investment"
    
    async def _task_calculate_npv(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Net Present Value."""
        initial_investment = params.get("initial_investment", 0)
        cash_flows = params.get("cash_flows", [])
        discount_rate = params.get("discount_rate", 0.10)
        
        # Calculate NPV
        npv = -initial_investment
        discounted_cash_flows = []
        
        for i, cf in enumerate(cash_flows):
            year = i + 1
            discount_factor = 1 / ((1 + discount_rate) ** year)
            discounted_cf = cf * discount_factor
            npv += discounted_cf
            
            discounted_cash_flows.append({
                "year": year,
                "cash_flow": cf,
                "discount_factor": round(discount_factor, 4),
                "discounted_cash_flow": round(discounted_cf, 2),
            })
        
        return {
            "initial_investment": initial_investment,
            "discount_rate": discount_rate,
            "total_undiscounted": sum(cash_flows),
            "npv": round(npv, 2),
            "discounted_cash_flows": discounted_cash_flows,
            "decision": "Accept" if npv > 0 else "Reject",
            "profitability_index": round((npv + initial_investment) / initial_investment, 3) if initial_investment > 0 else 0,
        }
    
    async def _task_calculate_irr(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Internal Rate of Return."""
        initial_investment = params.get("initial_investment", 0)
        cash_flows = params.get("cash_flows", [])
        
        # IRR calculation using Newton-Raphson approximation
        def npv_at_rate(rate):
            npv = -initial_investment
            for i, cf in enumerate(cash_flows):
                npv += cf / ((1 + rate) ** (i + 1))
            return npv
        
        # Binary search for IRR
        low, high = -0.99, 10.0
        irr = None
        
        for _ in range(100):  # Max iterations
            mid = (low + high) / 2
            npv_mid = npv_at_rate(mid)
            
            if abs(npv_mid) < 0.01:  # Close enough to zero
                irr = mid
                break
            
            if npv_mid > 0:
                low = mid
            else:
                high = mid
        
        return {
            "initial_investment": initial_investment,
            "cash_flows": cash_flows,
            "irr": round(irr * 100, 2) if irr else "Not calculable",
            "irr_decimal": round(irr, 4) if irr else None,
        }
    
    async def _task_rnpv_calculation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Risk-adjusted NPV for drug development."""
        stages = params.get("stages", [])
        discount_rate = params.get("discount_rate", 0.10)
        
        # Standard phase success probabilities (can be overridden)
        default_success_rates = {
            "preclinical": 0.60,
            "phase1": 0.65,
            "phase2": 0.35,
            "phase3": 0.60,
            "approval": 0.85,
            "launch": 0.95,
        }
        
        rnpv = 0
        cumulative_probability = 1.0
        stage_results = []
        
        for i, stage in enumerate(stages):
            year = stage.get("year", i + 1)
            cost = stage.get("cost", 0)
            revenue = stage.get("revenue", 0)
            stage_name = stage.get("name", f"stage_{i+1}")
            success_rate = stage.get("success_rate", default_success_rates.get(stage_name.lower(), 0.5))
            
            # Update cumulative probability
            cumulative_probability *= success_rate
            
            # Discount factor
            discount_factor = 1 / ((1 + discount_rate) ** year)
            
            # Risk-adjusted values
            ra_cost = cost * discount_factor  # Costs are certain up to that stage
            ra_revenue = revenue * cumulative_probability * discount_factor
            net_value = ra_revenue - ra_cost
            rnpv += net_value
            
            stage_results.append({
                "stage": stage_name,
                "year": year,
                "cost": cost,
                "revenue": revenue,
                "success_rate": success_rate,
                "cumulative_probability": round(cumulative_probability, 4),
                "discount_factor": round(discount_factor, 4),
                "risk_adjusted_value": round(net_value, 2),
            })
        
        return {
            "discount_rate": discount_rate,
            "stages_analyzed": len(stages),
            "stage_results": stage_results,
            "rnpv": round(rnpv, 2),
            "final_cumulative_probability": round(cumulative_probability, 4),
            "decision": "Proceed" if rnpv > 0 else "Reconsider",
        }
    
    async def _task_development_cost_estimation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Estimate drug development costs."""
        therapeutic_area = params.get("therapeutic_area", "")
        modality = params.get("modality", "small_molecule")
        phases = params.get("phases", ["preclinical", "phase1", "phase2", "phase3"])
        
        # Industry benchmarks (millions USD)
        cost_benchmarks = {
            "small_molecule": {
                "preclinical": 30,
                "phase1": 25,
                "phase2": 60,
                "phase3": 200,
                "regulatory": 20,
            },
            "biologic": {
                "preclinical": 50,
                "phase1": 40,
                "phase2": 100,
                "phase3": 350,
                "regulatory": 30,
            },
            "gene_therapy": {
                "preclinical": 80,
                "phase1": 60,
                "phase2": 150,
                "phase3": 400,
                "regulatory": 40,
            },
        }
        
        base_costs = cost_benchmarks.get(modality, cost_benchmarks["small_molecule"])
        
        # Therapeutic area multipliers
        ta_multipliers = {
            "oncology": 1.5,
            "rare_disease": 0.7,
            "cardiovascular": 1.2,
            "neurology": 1.4,
            "infectious_disease": 1.0,
        }
        
        multiplier = ta_multipliers.get(therapeutic_area.lower(), 1.0)
        
        phase_costs = []
        total_cost = 0
        
        for phase in phases:
            base = base_costs.get(phase, 50)
            adjusted = base * multiplier
            phase_costs.append({
                "phase": phase,
                "base_cost_millions": base,
                "adjusted_cost_millions": round(adjusted, 1),
            })
            total_cost += adjusted
        
        return {
            "therapeutic_area": therapeutic_area,
            "modality": modality,
            "multiplier": multiplier,
            "phase_costs": phase_costs,
            "total_estimated_cost_millions": round(total_cost, 1),
            "cost_range": {
                "low": round(total_cost * 0.7, 1),
                "base": round(total_cost, 1),
                "high": round(total_cost * 1.5, 1),
            },
            "note": "Based on industry benchmarks; actual costs may vary",
        }
    
    async def _task_payback_period(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate payback period."""
        initial_investment = params.get("initial_investment", 0)
        annual_cash_flows = params.get("annual_cash_flows", [])
        
        if not annual_cash_flows:
            return {"error": "No cash flows provided"}
        
        cumulative = 0
        payback_year = None
        cumulative_by_year = []
        
        for i, cf in enumerate(annual_cash_flows):
            cumulative += cf
            cumulative_by_year.append({
                "year": i + 1,
                "cash_flow": cf,
                "cumulative": cumulative,
            })
            
            if cumulative >= initial_investment and payback_year is None:
                # Calculate exact payback period
                prior_cumulative = cumulative - cf
                remaining = initial_investment - prior_cumulative
                fraction = remaining / cf if cf > 0 else 0
                payback_year = i + fraction
        
        return {
            "initial_investment": initial_investment,
            "yearly_progression": cumulative_by_year,
            "payback_period_years": round(payback_year, 2) if payback_year else "Not achieved",
            "total_return": cumulative,
            "investment_recovered": cumulative >= initial_investment,
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_financial_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> FinancialL4Worker:
    return FinancialL4Worker(worker_key, l5_tools)

FINANCIAL_WORKER_KEYS = list(FINANCIAL_WORKER_CONFIGS.keys())
