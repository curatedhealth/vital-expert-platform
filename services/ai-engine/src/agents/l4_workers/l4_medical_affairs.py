"""
VITAL Path AI Services - VITAL L4 Medical Affairs Workers

Medical Affairs Workers: MSL Content Generator, KOL Mapper,
Medical Information Responder, Publication Planner, Congress Analyzer
5 workers for medical affairs and field medical tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: MedicalAffairsL4Worker
- Factory: create_medical_affairs_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
MEDICAL_AFFAIRS_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "msl_content_generator": WorkerConfig(
        id="L4-MSL",
        name="MSL Content Generator",
        description="Generate scientific content for MSL field activities",
        category=WorkerCategory.MEDICAL_AFFAIRS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "clinicaltrials", "cochrane",
            "openfda", "calculator"
        ],
        task_types=[
            "generate_slide_deck", "create_scientific_narrative",
            "develop_faq", "create_objection_handler", "summarize_for_hcp",
            "create_leave_behind", "develop_training_material"
        ],
    ),

    "kol_mapper": WorkerConfig(
        id="L4-KOL",
        name="KOL Mapper",
        description="Map and analyze Key Opinion Leaders",
        category=WorkerCategory.MEDICAL_AFFAIRS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "clinicaltrials", "google_scholar", "openalex"
        ],
        task_types=[
            "identify_kols", "analyze_publication_record",
            "map_influence_network", "rank_by_expertise",
            "identify_rising_stars", "congress_participation"
        ],
    ),

    "medical_information_responder": WorkerConfig(
        id="L4-MIR",
        name="Medical Information Responder",
        description="Generate medical information responses",
        category=WorkerCategory.MEDICAL_AFFAIRS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "openfda", "drugbank", "clinicaltrials"
        ],
        task_types=[
            "draft_response", "cite_evidence", "check_label_consistency",
            "identify_off_label", "create_standard_response", "validate_claims"
        ],
    ),

    "publication_planner": WorkerConfig(
        id="L4-PUB",
        name="Publication Planner",
        description="Plan and track scientific publications",
        category=WorkerCategory.MEDICAL_AFFAIRS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "clinicaltrials", "cochrane"
        ],
        task_types=[
            "identify_publication_gaps", "recommend_journals",
            "create_timeline", "track_submissions", "analyze_impact",
            "suggest_authors", "icmje_compliance_check"
        ],
    ),

    "congress_analyzer": WorkerConfig(
        id="L4-CON",
        name="Congress Analyzer",
        description="Analyze medical congress presentations and trends",
        category=WorkerCategory.MEDICAL_AFFAIRS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "clinicaltrials", "web_search"
        ],
        task_types=[
            "summarize_abstracts", "identify_trends", "competitive_analysis",
            "extract_key_findings", "create_congress_report", "track_presentations"
        ],
    ),
}


class MedicalAffairsL4Worker(L4BaseWorker):
    """L4 Worker class for medical affairs tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in MEDICAL_AFFAIRS_WORKER_CONFIGS:
            raise ValueError(f"Unknown medical affairs worker: {worker_key}")
        
        config = MEDICAL_AFFAIRS_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_identify_kols(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Identify Key Opinion Leaders in a therapeutic area."""
        therapeutic_area = params.get("therapeutic_area", "")
        geography = params.get("geography", "global")
        min_publications = params.get("min_publications", 10)
        
        # Search PubMed for prolific authors
        pubmed_result = await self.call_l5_tool("pubmed", {
            "query": therapeutic_area,
            "max_results": 500,
        })
        
        # Extract and count authors
        author_counts = {}
        articles = pubmed_result.get("data", {}).get("articles", [])
        
        for article in articles:
            for author in article.get("authors", []):
                name = author.get("name", "")
                if name:
                    author_counts[name] = author_counts.get(name, 0) + 1
        
        # Filter by minimum publications and sort
        kols = [
            {"name": name, "publication_count": count}
            for name, count in author_counts.items()
            if count >= min_publications
        ]
        kols.sort(key=lambda x: x["publication_count"], reverse=True)
        
        return {
            "therapeutic_area": therapeutic_area,
            "geography": geography,
            "total_articles_analyzed": len(articles),
            "kols_identified": len(kols),
            "top_kols": kols[:20],
        }
    
    async def _task_draft_response(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Draft medical information response."""
        question = params.get("question", "")
        drug_name = params.get("drug_name", "")
        response_type = params.get("response_type", "standard")
        
        # Get label information
        label_result = await self.call_l5_tool("openfda", {
            "endpoint": "drug/label",
            "params": {"search": f'openfda.brand_name:"{drug_name}"'},
        })
        
        # Search literature
        lit_result = await self.call_l5_tool("pubmed", {
            "query": f"{drug_name} {question}",
            "max_results": 10,
        })
        
        label_data = label_result.get("data", {})
        citations = lit_result.get("data", {}).get("articles", [])
        
        return {
            "question": question,
            "drug_name": drug_name,
            "response_type": response_type,
            "label_relevant_sections": {
                "indications": label_data.get("indications_and_usage", []),
                "warnings": label_data.get("warnings", []),
                "dosage": label_data.get("dosage_and_administration", []),
            },
            "supporting_literature": [
                {
                    "title": c.get("title"),
                    "pmid": c.get("pmid"),
                    "year": c.get("year"),
                }
                for c in citations[:5]
            ],
            "draft_status": "requires_medical_review",
        }
    
    async def _task_recommend_journals(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend journals for manuscript submission."""
        topic = params.get("topic", "")
        study_type = params.get("study_type", "")
        target_audience = params.get("target_audience", "specialists")
        
        # Journal recommendations based on topic
        journal_profiles = {
            "oncology": [
                {"name": "Journal of Clinical Oncology", "impact_factor": 45.3, "review_time": "6-8 weeks"},
                {"name": "Lancet Oncology", "impact_factor": 41.3, "review_time": "4-6 weeks"},
                {"name": "JAMA Oncology", "impact_factor": 28.4, "review_time": "6-8 weeks"},
            ],
            "cardiology": [
                {"name": "JACC", "impact_factor": 24.0, "review_time": "4-6 weeks"},
                {"name": "Circulation", "impact_factor": 23.6, "review_time": "6-8 weeks"},
                {"name": "European Heart Journal", "impact_factor": 22.7, "review_time": "4-6 weeks"},
            ],
            "default": [
                {"name": "NEJM", "impact_factor": 91.2, "review_time": "4-6 weeks"},
                {"name": "Lancet", "impact_factor": 79.3, "review_time": "4-6 weeks"},
                {"name": "JAMA", "impact_factor": 63.1, "review_time": "6-8 weeks"},
            ],
        }
        
        # Match topic to journals
        matched_journals = journal_profiles.get(topic.lower(), journal_profiles["default"])
        
        return {
            "topic": topic,
            "study_type": study_type,
            "recommended_journals": matched_journals,
            "recommendation_criteria": [
                "Impact factor",
                "Audience alignment",
                "Review timeline",
                "Open access options",
            ],
        }
    
    async def _task_summarize_abstracts(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize congress abstracts."""
        abstracts = params.get("abstracts", [])
        focus_areas = params.get("focus_areas", [])
        
        summaries = []
        for abstract in abstracts:
            summary = {
                "title": abstract.get("title", ""),
                "authors": abstract.get("authors", [])[:3],
                "key_findings": abstract.get("conclusions", ""),
                "relevance": "high" if any(f in abstract.get("title", "").lower() for f in focus_areas) else "standard",
            }
            summaries.append(summary)
        
        return {
            "total_abstracts": len(abstracts),
            "focus_areas": focus_areas,
            "summaries": summaries,
            "high_relevance_count": len([s for s in summaries if s["relevance"] == "high"]),
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_medical_affairs_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> MedicalAffairsL4Worker:
    return MedicalAffairsL4Worker(worker_key, l5_tools)

MEDICAL_AFFAIRS_WORKER_KEYS = list(MEDICAL_AFFAIRS_WORKER_CONFIGS.keys())
