"""
VITAL Path AI Services - VITAL L4 Design Workers

Design Workers: Trial Designer, Protocol Builder,
Study Optimizer, Endpoint Selector, Sample Size Calculator
5 workers for clinical trial and study design tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: DesignL4Worker
- Factory: create_design_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
DESIGN_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "trial_designer": WorkerConfig(
        id="L4-TRD",
        name="Trial Designer",
        description="Design clinical trial frameworks and architectures",
        category=WorkerCategory.DESIGN,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "clinicaltrials", "pubmed", "cochrane", "calculator"
        ],
        task_types=[
            "design_rct", "design_adaptive", "design_platform",
            "design_basket", "design_umbrella", "design_crossover",
            "design_factorial", "recommend_design"
        ],
    ),

    "protocol_builder": WorkerConfig(
        id="L4-PRB",
        name="Protocol Builder",
        description="Build clinical trial protocol sections",
        category=WorkerCategory.DESIGN,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "clinicaltrials", "pubmed", "openfda", "meddra"
        ],
        task_types=[
            "build_synopsis", "build_eligibility", "build_endpoints",
            "build_schedule", "build_statistics", "build_safety_section",
            "ich_e6_compliance", "protocol_amendment"
        ],
    ),

    "study_optimizer": WorkerConfig(
        id="L4-STO",
        name="Study Optimizer",
        description="Optimize study designs for efficiency and feasibility",
        category=WorkerCategory.DESIGN,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "clinicaltrials", "calculator", "r_stats"
        ],
        task_types=[
            "optimize_duration", "optimize_visits", "reduce_burden",
            "adaptive_enrichment", "interim_analysis_timing",
            "operational_feasibility"
        ],
    ),

    "endpoint_selector": WorkerConfig(
        id="L4-EPS",
        name="Endpoint Selector",
        description="Select and validate clinical trial endpoints",
        category=WorkerCategory.DESIGN,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "clinicaltrials", "cochrane"
        ],
        task_types=[
            "recommend_primary_endpoint", "recommend_secondary_endpoints",
            "validate_surrogate", "assess_clinical_meaningfulness",
            "regulatory_acceptability", "endpoint_benchmarking"
        ],
    ),

    "sample_size_calculator": WorkerConfig(
        id="L4-SSC",
        name="Sample Size Calculator",
        description="Calculate sample sizes for various study designs",
        category=WorkerCategory.DESIGN,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "r_stats"
        ],
        task_types=[
            "calculate_continuous", "calculate_binary", "calculate_survival",
            "calculate_non_inferiority", "calculate_equivalence",
            "dropout_adjustment", "interim_sample_reestimation"
        ],
    ),
}


class DesignL4Worker(L4BaseWorker):
    """L4 Worker class for study design tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in DESIGN_WORKER_CONFIGS:
            raise ValueError(f"Unknown design worker: {worker_key}")
        
        config = DESIGN_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_recommend_design(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend optimal trial design."""
        indication = params.get("indication", "")
        phase = params.get("phase", "phase3")
        objectives = params.get("objectives", [])
        constraints = params.get("constraints", {})
        
        # Design recommendations based on context
        recommendations = []
        
        if "rare_disease" in indication.lower() or constraints.get("small_population"):
            recommendations.append({
                "design": "Adaptive",
                "rationale": "Allows sample size re-estimation and efficacy assessment with smaller populations",
                "pros": ["Flexibility", "Smaller initial sample size", "Early stopping options"],
                "cons": ["Complexity", "Regulatory scrutiny"],
            })
        
        if "oncology" in indication.lower():
            recommendations.append({
                "design": "Basket/Umbrella",
                "rationale": "Tests drug across multiple tumor types or biomarker subgroups",
                "pros": ["Efficient for biomarker-driven therapies", "Multiple opportunities for success"],
                "cons": ["Complex analysis", "Regulatory complexity"],
            })
        
        if len(objectives) > 2 or "multiple_doses" in constraints:
            recommendations.append({
                "design": "Factorial",
                "rationale": "Evaluates multiple factors simultaneously",
                "pros": ["Efficient", "Interaction assessment"],
                "cons": ["Larger sample size", "Complex interpretation"],
            })
        
        # Default recommendation
        if not recommendations:
            recommendations.append({
                "design": "Parallel-Group RCT",
                "rationale": "Gold standard for efficacy assessment",
                "pros": ["Regulatory acceptance", "Clear interpretation", "Well-established methods"],
                "cons": ["Larger sample size than crossover", "May miss individual responses"],
            })
        
        return {
            "indication": indication,
            "phase": phase,
            "objectives": objectives,
            "recommendations": recommendations,
            "primary_recommendation": recommendations[0]["design"],
        }
    
    async def _task_calculate_continuous(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate sample size for continuous endpoint."""
        effect_size = params.get("effect_size", 0)
        std_dev = params.get("std_dev", 1)
        alpha = params.get("alpha", 0.05)
        power = params.get("power", 0.80)
        allocation_ratio = params.get("allocation_ratio", 1)  # 1:1
        two_sided = params.get("two_sided", True)
        
        # Z-values
        z_alpha = 1.96 if alpha == 0.05 and two_sided else 1.645 if alpha == 0.05 else 2.576 if alpha == 0.01 else 1.96
        z_beta = 0.84 if power == 0.80 else 1.28 if power == 0.90 else 0.84
        
        if effect_size == 0:
            return {"error": "Effect size cannot be zero"}
        
        # Standardized effect
        delta = effect_size / std_dev
        
        # Sample size per group for 1:1 allocation
        n_per_group = 2 * ((z_alpha + z_beta) / delta) ** 2
        
        # Adjust for allocation ratio
        if allocation_ratio != 1:
            n_treatment = n_per_group * (1 + allocation_ratio) / (2 * allocation_ratio)
            n_control = n_per_group * (1 + allocation_ratio) / 2
        else:
            n_treatment = n_per_group
            n_control = n_per_group
        
        return {
            "effect_size": effect_size,
            "std_dev": std_dev,
            "standardized_effect": round(delta, 3),
            "alpha": alpha,
            "power": power,
            "two_sided": two_sided,
            "allocation_ratio": f"1:{allocation_ratio}",
            "n_treatment": int(round(n_treatment)) + 1,  # Round up
            "n_control": int(round(n_control)) + 1,
            "total_n": int(round(n_treatment)) + int(round(n_control)) + 2,
        }
    
    async def _task_calculate_binary(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate sample size for binary endpoint."""
        p_treatment = params.get("p_treatment", 0)
        p_control = params.get("p_control", 0)
        alpha = params.get("alpha", 0.05)
        power = params.get("power", 0.80)
        
        if p_treatment == p_control:
            return {"error": "Treatment and control proportions must differ"}
        
        # Z-values
        z_alpha = 1.96 if alpha == 0.05 else 2.576 if alpha == 0.01 else 1.645
        z_beta = 0.84 if power == 0.80 else 1.28 if power == 0.90 else 0.84
        
        # Pooled proportion
        p_pooled = (p_treatment + p_control) / 2
        
        # Sample size formula (Fleiss)
        effect = abs(p_treatment - p_control)
        n_per_group = (
            ((z_alpha * (2 * p_pooled * (1 - p_pooled)) ** 0.5 +
              z_beta * (p_treatment * (1 - p_treatment) + p_control * (1 - p_control)) ** 0.5) ** 2) /
            (effect ** 2)
        )
        
        return {
            "p_treatment": p_treatment,
            "p_control": p_control,
            "absolute_difference": round(effect, 4),
            "relative_risk": round(p_treatment / p_control, 2) if p_control > 0 else None,
            "alpha": alpha,
            "power": power,
            "n_per_group": int(round(n_per_group)) + 1,
            "total_n": 2 * (int(round(n_per_group)) + 1),
        }
    
    async def _task_calculate_survival(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate sample size for survival/time-to-event endpoint."""
        hazard_ratio = params.get("hazard_ratio", 0.7)
        median_control = params.get("median_control", 12)  # months
        alpha = params.get("alpha", 0.05)
        power = params.get("power", 0.80)
        accrual_time = params.get("accrual_time", 24)  # months
        follow_up_time = params.get("follow_up_time", 12)  # months
        
        # Z-values
        z_alpha = 1.96 if alpha == 0.05 else 2.576
        z_beta = 0.84 if power == 0.80 else 1.28
        
        # Number of events needed (Schoenfeld formula)
        log_hr = abs(log(hazard_ratio)) if hazard_ratio > 0 else 0
        
        def log(x):
            import math
            return math.log(x) if x > 0 else 0
        
        d = 4 * ((z_alpha + z_beta) ** 2) / (log_hr ** 2) if log_hr > 0 else float('inf')
        
        # Estimate total N based on event probability
        # Simplified - real calculation would consider accrual pattern
        lambda_control = 0.693 / median_control  # ln(2) / median
        avg_follow_up = follow_up_time + accrual_time / 2
        event_prob_control = 1 - 2.718 ** (-lambda_control * avg_follow_up)  # 1 - e^(-λt)
        event_prob_treatment = 1 - 2.718 ** (-lambda_control * hazard_ratio * avg_follow_up)
        avg_event_prob = (event_prob_control + event_prob_treatment) / 2
        
        n_total = d / avg_event_prob if avg_event_prob > 0 else float('inf')
        
        return {
            "hazard_ratio": hazard_ratio,
            "median_control_months": median_control,
            "alpha": alpha,
            "power": power,
            "accrual_time_months": accrual_time,
            "follow_up_time_months": follow_up_time,
            "events_required": int(round(d)) + 1 if d != float('inf') else "Not calculable",
            "estimated_event_probability": round(avg_event_prob, 3),
            "estimated_total_n": int(round(n_total)) + 1 if n_total != float('inf') else "Not calculable",
            "n_per_group": int(round(n_total/2)) + 1 if n_total != float('inf') else "Not calculable",
        }
    
    async def _task_dropout_adjustment(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Adjust sample size for anticipated dropout."""
        base_sample_size = params.get("base_sample_size", 0)
        dropout_rate = params.get("dropout_rate", 0.15)
        
        adjusted_n = base_sample_size / (1 - dropout_rate)
        additional_needed = adjusted_n - base_sample_size
        
        return {
            "base_sample_size": base_sample_size,
            "dropout_rate": dropout_rate,
            "adjusted_sample_size": int(round(adjusted_n)) + 1,
            "additional_subjects_needed": int(round(additional_needed)) + 1,
            "inflation_factor": round(1 / (1 - dropout_rate), 3),
        }
    
    async def _task_build_eligibility(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Build eligibility criteria section."""
        indication = params.get("indication", "")
        age_range = params.get("age_range", {"min": 18, "max": 75})
        required_diagnosis = params.get("required_diagnosis", "")
        
        # Standard inclusion criteria
        inclusion = [
            f"Age ≥ {age_range['min']} and ≤ {age_range['max']} years",
            f"Confirmed diagnosis of {required_diagnosis or indication}",
            "Ability to provide written informed consent",
            "Willing and able to comply with study procedures",
        ]
        
        # Add indication-specific criteria
        if "oncology" in indication.lower():
            inclusion.extend([
                "ECOG performance status 0-1",
                "Adequate organ function as defined by protocol",
                "Measurable disease per RECIST 1.1",
            ])
        
        # Standard exclusion criteria
        exclusion = [
            "Pregnant or breastfeeding females",
            "Known hypersensitivity to study drug or excipients",
            "Participation in another interventional clinical trial within 30 days",
            "Any condition that would interfere with study participation",
        ]
        
        if "oncology" in indication.lower():
            exclusion.extend([
                "Active CNS metastases (unless treated and stable)",
                "Prior therapy with [specify similar agents]",
                "Active autoimmune disease requiring systemic treatment",
            ])
        
        return {
            "indication": indication,
            "inclusion_criteria": inclusion,
            "exclusion_criteria": exclusion,
            "inclusion_count": len(inclusion),
            "exclusion_count": len(exclusion),
            "note": "Template criteria - customize for specific protocol",
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_design_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> DesignL4Worker:
    return DesignL4Worker(worker_key, l5_tools)

DESIGN_WORKER_KEYS = list(DESIGN_WORKER_CONFIGS.keys())
