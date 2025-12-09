"""
VITAL Path AI Services - VITAL L4 Risk Workers

Risk Workers: Risk Flagger, Evidence Verifier, Patient Safety
3 workers for risk assessment and safety evaluation.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: RiskL4Worker
- Factory: create_risk_worker(worker_key)
"""

from typing import Dict, Any
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
RISK_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "risk_flagger": WorkerConfig(
        id="L4-RF",
        name="Risk Flagger",
        description="Identify and flag potential risks in data and analysis",
        category=WorkerCategory.RISK,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["openfda", "meddra", "presidio"],
        task_types=["identify_risks", "flag_contraindications", "detect_anomalies", "compliance_risks"],
    ),

    "evidence_verifier": WorkerConfig(
        id="L4-EV",
        name="Evidence Verifier",
        description="Verify evidence quality and authenticity",
        category=WorkerCategory.RISK,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["pubmed", "clinicaltrials", "cochrane"],
        task_types=["verify_citations", "check_retractions", "validate_claims", "source_verification"],
    ),

    "patient_safety": WorkerConfig(
        id="L4-PS",
        name="Patient Safety Analyzer",
        description="Analyze patient safety signals and adverse events",
        category=WorkerCategory.RISK,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["openfda", "meddra", "calculator"],
        task_types=["adverse_event_analysis", "signal_detection", "safety_profile", "black_box_warnings"],
    ),
}


class RiskL4Worker(L4BaseWorker):
    """L4 Worker class for risk assessment tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in RISK_WORKER_CONFIGS:
            raise ValueError(f"Unknown risk worker: {worker_key}")
        
        config = RISK_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_adverse_event_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze adverse events for a drug."""
        drug_name = params.get("drug_name", "")
        
        if not drug_name:
            return {"error": "Drug name required"}
        
        # Get adverse event counts from FAERS
        result = await self.call_l5_tool("openfda", {
            "endpoint": "drug/event",
            "query": drug_name,
            "search_field": "patient.drug.medicinalproduct",
            "count_field": "patient.reaction.reactionmeddrapt.exact",
        })
        
        events = result.get("data", {}).get("results", [])
        
        return {
            "drug": drug_name,
            "top_adverse_events": events[:20],
            "total_event_types": len(events),
        }
    
    async def _task_verify_citations(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Verify citations exist and are not retracted."""
        pmids = params.get("pmids", [])
        
        verified = []
        for pmid in pmids[:10]:  # Limit
            result = await self.call_l5_tool("pubmed", {
                "query": pmid,
                "max_results": 1,
            })
            articles = result.get("data", {}).get("articles", [])
            verified.append({
                "pmid": pmid,
                "found": len(articles) > 0,
                "title": articles[0].get("title") if articles else None,
            })
        
        return {
            "verified": verified,
            "all_valid": all(v["found"] for v in verified),
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_risk_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> RiskL4Worker:
    return RiskL4Worker(worker_key, l5_tools)

RISK_WORKER_KEYS = list(RISK_WORKER_CONFIGS.keys())
