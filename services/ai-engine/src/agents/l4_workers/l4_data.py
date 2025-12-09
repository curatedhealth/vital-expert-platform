"""
VITAL Path AI Services - VITAL L4 Data Workers

Data Processing Workers: Data Extractor, Document Processor,
Citation Manager, Quality Assessor, NLP Processor
5 workers for data extraction and document processing.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: DataL4Worker
- Factory: create_data_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
DATA_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "data_extractor": WorkerConfig(
        id="L4-DE",
        name="Data Extractor",
        description="Extract structured data from documents and sources",
        category=WorkerCategory.DATA_PROCESSING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["pubmed", "clinicaltrials", "openfda", "scispacy"],
        task_types=["extract_entities", "extract_tables", "extract_figures", "parse_document"],
    ),

    "document_processor": WorkerConfig(
        id="L4-DP",
        name="Document Processor",
        description="Process, chunk, and summarize documents",
        category=WorkerCategory.DATA_PROCESSING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["scispacy", "presidio", "pandas_profiling"],
        task_types=["summarize", "chunk", "classify", "extract_metadata"],
    ),

    "citation_manager": WorkerConfig(
        id="L4-CM",
        name="Citation Manager",
        description="Manage citations, references, and bibliographies",
        category=WorkerCategory.DATA_PROCESSING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["pubmed", "cochrane"],
        task_types=["extract_citations", "format_citations", "validate_citations", "resolve_dois"],
    ),

    "quality_assessor": WorkerConfig(
        id="L4-QA",
        name="Quality Assessor",
        description="Assess quality and grade evidence",
        category=WorkerCategory.DATA_PROCESSING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["calculator"],
        task_types=["grade_evidence", "assess_completeness", "score_confidence", "check_consistency"],
    ),

    "nlp_processor": WorkerConfig(
        id="L4-NLP",
        name="NLP Processor",
        description="Advanced NLP tasks for biomedical text",
        category=WorkerCategory.DATA_PROCESSING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["scispacy", "umls", "clinicalbert", "presidio"],
        task_types=["ner", "relation_extraction", "sentiment", "classify", "deidentify"],
    ),
}


class DataL4Worker(L4BaseWorker):
    """L4 Worker class for data processing tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in DATA_WORKER_CONFIGS:
            raise ValueError(f"Unknown data worker: {worker_key}")
        
        config = DATA_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_extract_entities(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Extract named entities from text."""
        text = params.get("text", "")
        entity_types = params.get("entity_types", ["DRUG", "DISEASE", "GENE"])
        
        # Use scispaCy for NER
        nlp_result = await self.call_l5_tool("scispacy", {
            "text": text,
            "operations": ["ner"],
        })
        
        entities = nlp_result.get("data", {}).get("entities", [])
        
        return {
            "entities": entities,
            "count": len(entities),
            "entity_types_found": list(set(e.get("label") for e in entities)),
        }
    
    async def _task_summarize(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize document content."""
        text = params.get("text", "")
        max_length = params.get("max_length", 200)
        
        # Use LLM for summarization (via config model)
        return {
            "summary": text[:max_length] + "..." if len(text) > max_length else text,
            "original_length": len(text),
            "method": "truncation",  # Would use LLM in production
        }
    
    async def _task_extract_citations(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Extract citations from text."""
        text = params.get("text", "")
        
        import re
        
        # Simple citation patterns
        patterns = {
            "pmid": r'PMID[:\s]*(\d+)',
            "doi": r'10\.\d{4,}/[^\s]+',
            "author_year": r'\(([A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4})\)',
        }
        
        citations = []
        for cite_type, pattern in patterns.items():
            for match in re.finditer(pattern, text, re.IGNORECASE):
                citations.append({
                    "type": cite_type,
                    "value": match.group(1) if cite_type != "doi" else match.group(0),
                    "position": match.start(),
                })
        
        return {
            "citations": citations,
            "count": len(citations),
        }
    
    async def _task_deidentify(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """De-identify PHI from text."""
        text = params.get("text", "")
        
        result = await self.call_l5_tool("presidio", {
            "text": text,
            "operation": "both",
        })
        
        return result.get("data", {})
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_data_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> DataL4Worker:
    return DataL4Worker(worker_key, l5_tools)

DATA_WORKER_KEYS = list(DATA_WORKER_CONFIGS.keys())
