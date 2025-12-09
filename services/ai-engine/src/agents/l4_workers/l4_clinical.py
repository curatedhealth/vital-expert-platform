"""
VITAL Path AI Services - VITAL L4 Clinical Workers

Clinical Workers: Protocol Analyzer, Eligibility Screener,
Endpoint Evaluator, Biomarker Processor, Clinical Calculator
5 workers for clinical trial and patient data tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: ClinicalL4Worker
- Factory: create_clinical_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
CLINICAL_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "protocol_analyzer": WorkerConfig(
        id="L4-PA",
        name="Protocol Analyzer",
        description="Analyze clinical trial protocols and study designs",
        category=WorkerCategory.CLINICAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["clinicaltrials", "pubmed", "calculator"],
        task_types=[
            "analyze_design", "extract_endpoints", "identify_bias_risks",
            "compare_protocols", "check_feasibility", "estimate_timeline"
        ],
    ),

    "eligibility_screener": WorkerConfig(
        id="L4-ELS",
        name="Eligibility Screener",
        description="Screen patients against trial eligibility criteria",
        category=WorkerCategory.CLINICAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["clinicaltrials", "snomed", "calculator"],
        task_types=[
            "parse_criteria", "screen_patient", "identify_exclusions",
            "calculate_eligibility_score", "suggest_alternatives"
        ],
    ),

    "endpoint_evaluator": WorkerConfig(
        id="L4-EE",
        name="Endpoint Evaluator",
        description="Evaluate clinical trial endpoints and outcomes",
        category=WorkerCategory.CLINICAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["pubmed", "calculator", "r_stats"],
        task_types=[
            "validate_primary_endpoint", "assess_secondary_endpoints",
            "evaluate_surrogacy", "calculate_mcid", "compare_endpoints"
        ],
    ),

    "biomarker_processor": WorkerConfig(
        id="L4-BM",
        name="Biomarker Processor",
        description="Process biomarker data and validate assays",
        category=WorkerCategory.CLINICAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["biopython", "blast", "ensembl", "calculator"],
        task_types=[
            "analyze_biomarker", "validate_assay", "calculate_cutoff",
            "assess_performance", "identify_companion_diagnostic"
        ],
    ),

    "clinical_calculator": WorkerConfig(
        id="L4-CC",
        name="Clinical Calculator",
        description="Perform clinical calculations and scoring",
        category=WorkerCategory.CLINICAL,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["calculator", "r_stats"],
        task_types=[
            "calculate_gfr", "calculate_bmi", "calculate_bsa",
            "risk_score", "prognostic_score", "dose_calculation"
        ],
    ),
}


class ClinicalL4Worker(L4BaseWorker):
    """L4 Worker class for clinical tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in CLINICAL_WORKER_CONFIGS:
            raise ValueError(f"Unknown clinical worker: {worker_key}")
        
        config = CLINICAL_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_analyze_design(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze clinical trial design."""
        nct_id = params.get("nct_id", "")
        
        result = await self.call_l5_tool("clinicaltrials", {
            "nct_ids": [nct_id],
        })
        
        study = result.get("data", {}).get("studies", [{}])[0]
        
        design = study.get("design_info", {})
        
        return {
            "nct_id": nct_id,
            "title": study.get("brief_title"),
            "phase": study.get("phase"),
            "design": {
                "allocation": design.get("allocation"),
                "intervention_model": design.get("intervention_model"),
                "primary_purpose": design.get("primary_purpose"),
                "masking": design.get("masking"),
            },
            "enrollment": study.get("enrollment"),
            "primary_outcome": study.get("primary_outcome"),
            "secondary_outcomes": study.get("secondary_outcome", []),
            "analysis_recommendations": self._analyze_design_quality(design),
        }
    
    def _analyze_design_quality(self, design: Dict[str, Any]) -> List[str]:
        """Analyze design and provide recommendations."""
        recommendations = []
        
        if design.get("allocation") == "Non-Randomized":
            recommendations.append("Consider randomization to reduce selection bias")
        
        if design.get("masking") == "None (Open Label)":
            recommendations.append("Consider blinding to reduce performance/detection bias")
        
        return recommendations
    
    async def _task_parse_criteria(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Parse eligibility criteria into structured format."""
        criteria_text = params.get("criteria", "")
        
        # Simple parsing
        inclusion = []
        exclusion = []
        
        lines = criteria_text.split("\n")
        current_section = "inclusion"
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if "exclusion" in line.lower():
                current_section = "exclusion"
                continue
            if "inclusion" in line.lower():
                current_section = "inclusion"
                continue
            
            if current_section == "inclusion":
                inclusion.append(line)
            else:
                exclusion.append(line)
        
        return {
            "inclusion_criteria": inclusion,
            "exclusion_criteria": exclusion,
            "total_criteria": len(inclusion) + len(exclusion),
        }
    
    async def _task_screen_patient(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Screen patient against eligibility criteria."""
        patient_data = params.get("patient", {})
        criteria = params.get("criteria", {})
        
        inclusion_results = []
        exclusion_results = []
        
        # Check inclusion criteria
        for criterion in criteria.get("inclusion", []):
            met = self._check_criterion(patient_data, criterion)
            inclusion_results.append({
                "criterion": criterion.get("description"),
                "met": met,
            })
        
        # Check exclusion criteria
        for criterion in criteria.get("exclusion", []):
            met = self._check_criterion(patient_data, criterion)
            exclusion_results.append({
                "criterion": criterion.get("description"),
                "met": met,  # If exclusion criterion is met, patient is excluded
            })
        
        all_inclusion_met = all(r["met"] for r in inclusion_results)
        no_exclusion_met = not any(r["met"] for r in exclusion_results)
        
        return {
            "patient_id": patient_data.get("id"),
            "eligible": all_inclusion_met and no_exclusion_met,
            "inclusion_results": inclusion_results,
            "exclusion_results": exclusion_results,
            "failed_inclusion": [r for r in inclusion_results if not r["met"]],
            "triggered_exclusions": [r for r in exclusion_results if r["met"]],
        }
    
    def _check_criterion(self, patient: Dict[str, Any], criterion: Dict[str, Any]) -> bool:
        """Check if patient meets a criterion."""
        field = criterion.get("field")
        operator = criterion.get("operator", "==")
        value = criterion.get("value")
        
        patient_value = patient.get(field)
        if patient_value is None:
            return False
        
        if operator == ">=":
            return patient_value >= value
        elif operator == "<=":
            return patient_value <= value
        elif operator == ">":
            return patient_value > value
        elif operator == "<":
            return patient_value < value
        elif operator == "==":
            return patient_value == value
        elif operator == "in":
            return patient_value in value
        
        return False
    
    async def _task_calculate_gfr(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate eGFR using CKD-EPI equation."""
        creatinine = params.get("creatinine")  # mg/dL
        age = params.get("age")
        sex = params.get("sex", "male").lower()
        
        if not all([creatinine, age]):
            return {"error": "Missing required parameters: creatinine, age"}
        
        result = await self.call_l5_tool("calculator", {
            "operation": "egfr",
            "creatinine": creatinine,
            "age": age,
            "sex": sex,
        })
        
        return result.get("data", {})
    
    async def _task_calculate_bmi(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate BMI."""
        weight = params.get("weight")  # kg
        height = params.get("height")  # cm
        
        if not all([weight, height]):
            return {"error": "Missing required parameters: weight, height"}
        
        result = await self.call_l5_tool("calculator", {
            "operation": "bmi",
            "weight": weight,
            "height": height,
        })
        
        return result.get("data", {})
    
    async def _task_dose_calculation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate drug dose based on patient parameters."""
        dose_per_unit = params.get("dose_per_unit")
        unit = params.get("unit", "mg/kg")
        patient_weight = params.get("weight")
        patient_bsa = params.get("bsa")
        max_dose = params.get("max_dose")
        
        calculated_dose = None
        
        if "kg" in unit and patient_weight:
            calculated_dose = dose_per_unit * patient_weight
        elif "m2" in unit and patient_bsa:
            calculated_dose = dose_per_unit * patient_bsa
        
        if calculated_dose and max_dose:
            calculated_dose = min(calculated_dose, max_dose)
        
        return {
            "dose_per_unit": dose_per_unit,
            "unit": unit,
            "patient_weight": patient_weight,
            "patient_bsa": patient_bsa,
            "calculated_dose": calculated_dose,
            "capped_at_max": calculated_dose == max_dose if max_dose else False,
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_clinical_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> ClinicalL4Worker:
    return ClinicalL4Worker(worker_key, l5_tools)

CLINICAL_WORKER_KEYS = list(CLINICAL_WORKER_CONFIGS.keys())
