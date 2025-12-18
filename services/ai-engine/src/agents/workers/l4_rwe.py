"""
VITAL Path AI Services - VITAL L4 RWE Workers

Real-World Evidence Workers: OMOP Converter, Cohort Builder,
Claims Analyst, Registry Processor, Outcomes Researcher
5 workers for real-world evidence and observational research tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: RWEL4Worker
- Factory: create_rwe_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
RWE_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "omop_converter": WorkerConfig(
        id="L4-OMC",
        name="OMOP Converter",
        description="Convert data to OMOP Common Data Model",
        category=WorkerCategory.RWE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "omop", "white_rabbit", "rabbit_in_a_hat", "umls"
        ],
        task_types=[
            "map_to_omop", "validate_mapping", "generate_etl_spec",
            "check_vocabulary", "convert_concepts", "generate_cdm_report"
        ],
    ),

    "cohort_builder": WorkerConfig(
        id="L4-COB",
        name="Cohort Builder",
        description="Build and validate patient cohorts",
        category=WorkerCategory.RWE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "omop", "hades", "cohort_diagnostics", "achilles"
        ],
        task_types=[
            "define_cohort", "build_phenotype", "validate_cohort",
            "characterize_cohort", "compare_cohorts", "generate_attrition"
        ],
    ),

    "claims_analyst": WorkerConfig(
        id="L4-CLA",
        name="Claims Analyst",
        description="Analyze healthcare claims data",
        category=WorkerCategory.RWE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "cms_medicare", "omop", "calculator"
        ],
        task_types=[
            "analyze_utilization", "calculate_costs", "identify_patterns",
            "segment_patients", "predict_outcomes", "benchmark_providers"
        ],
    ),

    "registry_processor": WorkerConfig(
        id="L4-REG",
        name="Registry Processor",
        description="Process disease and treatment registries",
        category=WorkerCategory.RWE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "omop", "clinicaltrials", "pubmed"
        ],
        task_types=[
            "extract_registry_data", "link_registries", "validate_entries",
            "calculate_metrics", "generate_reports", "track_outcomes"
        ],
    ),

    "outcomes_researcher": WorkerConfig(
        id="L4-OUT",
        name="Outcomes Researcher",
        description="Conduct outcomes research analyses",
        category=WorkerCategory.RWE,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "omop", "hades", "r_stats", "calculator", "pubmed"
        ],
        task_types=[
            "comparative_effectiveness", "propensity_matching",
            "survival_analysis", "risk_adjustment", "causal_inference"
        ],
    ),
}


class RWEL4Worker(L4BaseWorker):
    """L4 Worker class for real-world evidence tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in RWE_WORKER_CONFIGS:
            raise ValueError(f"Unknown RWE worker: {worker_key}")
        
        config = RWE_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_map_to_omop(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Map source data to OMOP CDM concepts."""
        source_code = params.get("source_code", "")
        source_vocabulary = params.get("source_vocabulary", "")
        target_domain = params.get("target_domain", "")
        
        result = await self.call_l5_tool("omop", {
            "operation": "map_concept",
            "source_code": source_code,
            "source_vocabulary": source_vocabulary,
            "target_domain": target_domain,
        })
        
        mappings = result.get("data", {}).get("mappings", [])
        
        return {
            "source_code": source_code,
            "source_vocabulary": source_vocabulary,
            "target_domain": target_domain,
            "mappings_found": len(mappings),
            "mappings": mappings,
            "recommended_mapping": mappings[0] if mappings else None,
        }
    
    async def _task_define_cohort(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Define a patient cohort based on criteria."""
        cohort_name = params.get("name", "")
        inclusion_criteria = params.get("inclusion", [])
        exclusion_criteria = params.get("exclusion", [])
        index_event = params.get("index_event", {})
        
        # Build cohort definition in OHDSI format
        cohort_definition = {
            "name": cohort_name,
            "description": params.get("description", ""),
            "expressionType": "SIMPLE_EXPRESSION",
            "expression": {
                "PrimaryCriteria": {
                    "CriteriaList": [self._build_criterion(index_event)],
                    "ObservationWindow": {
                        "PriorDays": params.get("prior_days", 0),
                        "PostDays": params.get("post_days", 0),
                    },
                },
                "AdditionalCriteria": {
                    "InclusionRules": [
                        {"name": f"Inclusion {i+1}", "expression": self._build_criterion(c)}
                        for i, c in enumerate(inclusion_criteria)
                    ],
                    "ExclusionRules": [
                        {"name": f"Exclusion {i+1}", "expression": self._build_criterion(c)}
                        for i, c in enumerate(exclusion_criteria)
                    ],
                },
            },
        }
        
        return {
            "cohort_name": cohort_name,
            "inclusion_count": len(inclusion_criteria),
            "exclusion_count": len(exclusion_criteria),
            "cohort_definition": cohort_definition,
            "format": "OHDSI Atlas",
        }
    
    def _build_criterion(self, criterion: Dict[str, Any]) -> Dict[str, Any]:
        """Build OHDSI criterion from simple definition."""
        return {
            "Type": criterion.get("type", "ConditionOccurrence"),
            "ConceptSets": criterion.get("concept_sets", []),
            "OccurrenceStartDate": criterion.get("start_date"),
            "OccurrenceEndDate": criterion.get("end_date"),
        }
    
    async def _task_validate_cohort(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate cohort using CohortDiagnostics."""
        cohort_id = params.get("cohort_id", "")
        
        result = await self.call_l5_tool("cohort_diagnostics", {
            "operation": "run_diagnostics",
            "cohort_id": cohort_id,
        })
        
        diagnostics = result.get("data", {})
        
        return {
            "cohort_id": cohort_id,
            "diagnostics": {
                "cohort_count": diagnostics.get("cohort_count"),
                "incidence_rate": diagnostics.get("incidence_rate"),
                "time_distribution": diagnostics.get("time_distribution"),
                "concept_prevalence": diagnostics.get("concept_prevalence"),
                "visit_context": diagnostics.get("visit_context"),
            },
            "quality_metrics": {
                "completeness": diagnostics.get("completeness_score"),
                "validity": diagnostics.get("validity_score"),
            },
        }
    
    async def _task_analyze_utilization(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze healthcare utilization patterns."""
        patient_ids = params.get("patient_ids", [])
        time_period = params.get("time_period", "1y")
        categories = params.get("categories", ["inpatient", "outpatient", "er", "pharmacy"])
        
        result = await self.call_l5_tool("omop", {
            "operation": "utilization_analysis",
            "patient_ids": patient_ids,
            "time_period": time_period,
            "categories": categories,
        })
        
        utilization = result.get("data", {})
        
        return {
            "patient_count": len(patient_ids),
            "time_period": time_period,
            "utilization_by_category": utilization.get("by_category", {}),
            "total_encounters": utilization.get("total_encounters", 0),
            "average_per_patient": utilization.get("average_per_patient", 0),
            "top_diagnoses": utilization.get("top_diagnoses", []),
            "top_procedures": utilization.get("top_procedures", []),
        }
    
    async def _task_propensity_matching(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform propensity score matching."""
        treatment_cohort = params.get("treatment_cohort", [])
        control_cohort = params.get("control_cohort", [])
        covariates = params.get("covariates", [])
        caliper = params.get("caliper", 0.2)
        ratio = params.get("ratio", 1)  # 1:1 matching
        
        # Use R stats for propensity matching
        result = await self.call_l5_tool("r_stats", {
            "operation": "propensity_matching",
            "treatment": treatment_cohort,
            "control": control_cohort,
            "covariates": covariates,
            "caliper": caliper,
            "ratio": ratio,
        })
        
        matching_result = result.get("data", {})
        
        return {
            "treatment_size": len(treatment_cohort),
            "control_size": len(control_cohort),
            "matched_pairs": matching_result.get("matched_pairs", 0),
            "matching_ratio": ratio,
            "caliper": caliper,
            "balance_before": matching_result.get("smd_before", {}),
            "balance_after": matching_result.get("smd_after", {}),
            "matched_treatment_ids": matching_result.get("matched_treatment_ids", []),
            "matched_control_ids": matching_result.get("matched_control_ids", []),
        }
    
    async def _task_survival_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform survival analysis."""
        cohort_data = params.get("cohort_data", [])
        time_variable = params.get("time_variable", "time_to_event")
        event_variable = params.get("event_variable", "event")
        group_variable = params.get("group_variable", None)
        
        result = await self.call_l5_tool("r_stats", {
            "operation": "kaplan_meier",
            "data": cohort_data,
            "time_var": time_variable,
            "event_var": event_variable,
            "group_var": group_variable,
        })
        
        survival_result = result.get("data", {})
        
        return {
            "n_subjects": len(cohort_data),
            "n_events": survival_result.get("n_events", 0),
            "median_survival": survival_result.get("median_survival"),
            "survival_at_1_year": survival_result.get("survival_1y"),
            "survival_at_3_year": survival_result.get("survival_3y"),
            "survival_at_5_year": survival_result.get("survival_5y"),
            "log_rank_p": survival_result.get("log_rank_p") if group_variable else None,
            "hazard_ratio": survival_result.get("hazard_ratio") if group_variable else None,
            "hazard_ratio_ci": survival_result.get("hr_ci") if group_variable else None,
        }
    
    async def _task_comparative_effectiveness(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct comparative effectiveness analysis."""
        treatment_a = params.get("treatment_a", {})
        treatment_b = params.get("treatment_b", {})
        outcome = params.get("outcome", "")
        adjustment_method = params.get("adjustment", "propensity_matching")
        
        # Run analysis using HADES
        result = await self.call_l5_tool("hades", {
            "operation": "comparative_effectiveness",
            "target_cohort": treatment_a.get("cohort_id"),
            "comparator_cohort": treatment_b.get("cohort_id"),
            "outcome": outcome,
            "adjustment": adjustment_method,
        })
        
        ce_result = result.get("data", {})
        
        return {
            "treatment_a": treatment_a.get("name"),
            "treatment_b": treatment_b.get("name"),
            "outcome": outcome,
            "adjustment_method": adjustment_method,
            "results": {
                "relative_risk": ce_result.get("rr"),
                "odds_ratio": ce_result.get("or"),
                "hazard_ratio": ce_result.get("hr"),
                "confidence_interval": ce_result.get("ci"),
                "p_value": ce_result.get("p_value"),
            },
            "n_treated": ce_result.get("n_treated"),
            "n_comparator": ce_result.get("n_comparator"),
            "events_treated": ce_result.get("events_treated"),
            "events_comparator": ce_result.get("events_comparator"),
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_rwe_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> RWEL4Worker:
    return RWEL4Worker(worker_key, l5_tools)

RWE_WORKER_KEYS = list(RWE_WORKER_CONFIGS.keys())
