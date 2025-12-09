"""
VITAL Path AI Services - VITAL L4 Regulatory Workers

Regulatory Workers: FDA Compliance Checker, Drug Label Analyzer,
Clinical Trial Validator, Adverse Event Processor, Terminology Mapper
5 workers for regulatory and compliance tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: RegulatoryL4Worker
- Factory: create_regulatory_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
REGULATORY_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "fda_compliance_checker": WorkerConfig(
        id="L4-FDA",
        name="FDA Compliance Checker",
        description="Check FDA regulatory compliance and label requirements",
        category=WorkerCategory.REGULATORY,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["openfda", "drugbank", "orange_book"],
        task_types=[
            "check_label_compliance", "verify_ndc", "check_warnings",
            "check_contraindications", "verify_approval_status"
        ],
    ),

    "drug_label_analyzer": WorkerConfig(
        id="L4-DLA",
        name="Drug Label Analyzer",
        description="Analyze drug labels and SPL documents",
        category=WorkerCategory.REGULATORY,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["openfda", "drugbank", "rxnorm"],
        task_types=[
            "extract_indications", "extract_dosing", "extract_warnings",
            "extract_interactions", "compare_labels", "summarize_label"
        ],
    ),

    "clinical_trial_validator": WorkerConfig(
        id="L4-CTV",
        name="Clinical Trial Validator",
        description="Validate clinical trial data and registrations",
        category=WorkerCategory.REGULATORY,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["clinicaltrials", "pubmed"],
        task_types=[
            "validate_registration", "check_results_posting",
            "verify_endpoints", "compare_protocol_results", "identify_discrepancies"
        ],
    ),

    "adverse_event_processor": WorkerConfig(
        id="L4-AEP",
        name="Adverse Event Processor",
        description="Process and analyze adverse event reports",
        category=WorkerCategory.REGULATORY,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["openfda", "meddra", "faers"],
        task_types=[
            "code_adverse_event", "analyze_signals", "calculate_pro",
            "identify_trends", "generate_safety_summary"
        ],
    ),

    "terminology_mapper": WorkerConfig(
        id="L4-TM",
        name="Terminology Mapper",
        description="Map between medical terminologies",
        category=WorkerCategory.REGULATORY,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["umls", "meddra", "snomed", "rxnorm", "who_atc"],
        task_types=[
            "map_to_meddra", "map_to_snomed", "map_to_icd10",
            "map_drugs", "validate_coding", "translate_terminology"
        ],
    ),
}


class RegulatoryL4Worker(L4BaseWorker):
    """L4 Worker class for regulatory and compliance tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in REGULATORY_WORKER_CONFIGS:
            raise ValueError(f"Unknown regulatory worker: {worker_key}")
        
        config = REGULATORY_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_check_label_compliance(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Check drug label FDA compliance."""
        drug_name = params.get("drug_name", "")
        sections_to_check = params.get("sections", [
            "warnings", "contraindications", "adverse_reactions", 
            "drug_interactions", "dosage_administration"
        ])
        
        # Get label from OpenFDA
        label_result = await self.call_l5_tool("openfda", {
            "endpoint": "drug/label",
            "params": {"search": f'openfda.brand_name:"{drug_name}"'},
        })
        
        compliance_results = []
        for section in sections_to_check:
            has_section = section in label_result.get("data", {})
            compliance_results.append({
                "section": section,
                "present": has_section,
                "compliant": has_section,
            })
        
        return {
            "drug_name": drug_name,
            "sections_checked": len(sections_to_check),
            "compliance_results": compliance_results,
            "overall_compliant": all(r["compliant"] for r in compliance_results),
        }
    
    async def _task_extract_indications(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Extract indications from drug label."""
        drug_name = params.get("drug_name", "")
        
        result = await self.call_l5_tool("openfda", {
            "endpoint": "drug/label",
            "params": {"search": f'openfda.brand_name:"{drug_name}"'},
        })
        
        label_data = result.get("data", {})
        
        return {
            "drug_name": drug_name,
            "indications_and_usage": label_data.get("indications_and_usage", []),
            "extracted_from": "openfda_label",
        }
    
    async def _task_code_adverse_event(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Code adverse event to MedDRA."""
        event_description = params.get("description", "")
        
        # Use MedDRA for coding
        result = await self.call_l5_tool("meddra", {
            "query": event_description,
            "operation": "search_pt",
        })
        
        meddra_terms = result.get("data", {}).get("terms", [])
        
        # Select best match
        if meddra_terms:
            best_match = meddra_terms[0]
            return {
                "description": event_description,
                "meddra_pt": best_match.get("pt_name"),
                "meddra_code": best_match.get("pt_code"),
                "soc": best_match.get("soc_name"),
                "hlgt": best_match.get("hlgt_name"),
                "hlt": best_match.get("hlt_name"),
                "confidence": best_match.get("score", 0),
            }
        
        return {
            "description": event_description,
            "error": "No MedDRA term found",
        }
    
    async def _task_map_to_meddra(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Map term to MedDRA hierarchy."""
        term = params.get("term", "")
        
        result = await self.call_l5_tool("meddra", {
            "query": term,
            "operation": "search_pt",
        })
        
        return {
            "input_term": term,
            "meddra_mappings": result.get("data", {}).get("terms", []),
        }
    
    async def _task_validate_registration(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate clinical trial registration."""
        nct_id = params.get("nct_id", "")
        
        result = await self.call_l5_tool("clinicaltrials", {
            "nct_ids": [nct_id],
        })
        
        trial = result.get("data", {}).get("studies", [{}])[0]
        
        # Required fields for FDAAA 801
        required_fields = [
            "brief_title", "official_title", "conditions",
            "interventions", "primary_outcome", "eligibility_criteria",
            "enrollment", "start_date", "completion_date"
        ]
        
        validation_results = []
        for field in required_fields:
            has_field = bool(trial.get(field))
            validation_results.append({
                "field": field,
                "present": has_field,
            })
        
        return {
            "nct_id": nct_id,
            "registration_status": trial.get("overall_status"),
            "fields_checked": len(required_fields),
            "validation_results": validation_results,
            "missing_fields": [r["field"] for r in validation_results if not r["present"]],
            "compliant": all(r["present"] for r in validation_results),
        }
    
    async def _task_analyze_signals(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze safety signals from FAERS data."""
        drug_name = params.get("drug_name", "")
        
        result = await self.call_l5_tool("openfda", {
            "endpoint": "drug/event",
            "params": {
                "search": f'patient.drug.medicinalproduct:"{drug_name}"',
                "count": "patient.reaction.reactionmeddrapt.exact",
            },
        })
        
        reactions = result.get("data", {}).get("results", [])
        
        return {
            "drug_name": drug_name,
            "total_reports": sum(r.get("count", 0) for r in reactions),
            "top_reactions": reactions[:10],
            "signal_analysis_date": "pending",  # Would calculate PRR, ROR etc.
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_regulatory_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> RegulatoryL4Worker:
    return RegulatoryL4Worker(worker_key, l5_tools)

REGULATORY_WORKER_KEYS = list(REGULATORY_WORKER_CONFIGS.keys())
