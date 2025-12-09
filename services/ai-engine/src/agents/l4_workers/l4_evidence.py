"""
VITAL Path AI Services - VITAL L4 Evidence Workers

Evidence Synthesis Workers: Literature Searcher, Evidence Synthesizer,
Meta-Analyst, Systematic Reviewer, Quality Rater
5 workers for evidence gathering and synthesis.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: EvidenceL4Worker
- Factory: create_evidence_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
EVIDENCE_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "literature_searcher": WorkerConfig(
        id="L4-LS",
        name="Literature Searcher",
        description="Execute literature searches across multiple databases",
        category=WorkerCategory.EVIDENCE_SYNTHESIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "cochrane", "clinicaltrials",
            "arxiv", "google_scholar", "openalex"
        ],
        task_types=[
            "search_pubmed", "search_cochrane", "search_trials",
            "search_preprints", "multi_database_search", "citation_search"
        ],
    ),

    "evidence_synthesizer": WorkerConfig(
        id="L4-ES",
        name="Evidence Synthesizer",
        description="Synthesize evidence from multiple sources",
        category=WorkerCategory.EVIDENCE_SYNTHESIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["pubmed", "cochrane", "calculator"],
        task_types=[
            "synthesize_findings", "compare_studies", "identify_gaps",
            "create_evidence_table", "summarize_evidence"
        ],
    ),

    "meta_analyst": WorkerConfig(
        id="L4-MA",
        name="Meta-Analyst",
        description="Perform meta-analysis calculations and forest plots",
        category=WorkerCategory.EVIDENCE_SYNTHESIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["calculator", "r_stats"],
        task_types=[
            "calculate_pooled_effect", "heterogeneity_analysis",
            "subgroup_analysis", "sensitivity_analysis", "publication_bias"
        ],
    ),

    "systematic_reviewer": WorkerConfig(
        id="L4-SR",
        name="Systematic Reviewer",
        description="Support systematic review methodology",
        category=WorkerCategory.EVIDENCE_SYNTHESIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["pubmed", "cochrane", "clinicaltrials"],
        task_types=[
            "develop_search_strategy", "screen_titles", "screen_abstracts",
            "extract_data", "assess_risk_of_bias", "prisma_flow"
        ],
    ),

    "quality_rater": WorkerConfig(
        id="L4-QR",
        name="Quality Rater",
        description="Rate evidence quality using GRADE and other frameworks",
        category=WorkerCategory.EVIDENCE_SYNTHESIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["calculator"],
        task_types=[
            "grade_assessment", "rob_assessment", "certainty_rating",
            "jadad_score", "newcastle_ottawa", "quality_checklist"
        ],
    ),
}


class EvidenceL4Worker(L4BaseWorker):
    """L4 Worker class for evidence synthesis tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in EVIDENCE_WORKER_CONFIGS:
            raise ValueError(f"Unknown evidence worker: {worker_key}")
        
        config = EVIDENCE_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_search_pubmed(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute PubMed search."""
        query = params.get("query", "")
        max_results = params.get("max_results", 50)
        
        result = await self.call_l5_tool("pubmed", {
            "query": query,
            "max_results": max_results,
        })
        
        return {
            "source": "pubmed",
            "query": query,
            "results": result.get("data", {}).get("articles", []),
            "total_found": result.get("data", {}).get("total", 0),
        }
    
    async def _task_search_cochrane(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute Cochrane Library search."""
        query = params.get("query", "")
        
        result = await self.call_l5_tool("cochrane", {
            "query": query,
            "review_type": params.get("review_type", "systematic_reviews"),
        })
        
        return {
            "source": "cochrane",
            "query": query,
            "results": result.get("data", {}).get("reviews", []),
        }
    
    async def _task_multi_database_search(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Search across multiple databases."""
        query = params.get("query", "")
        databases = params.get("databases", ["pubmed", "cochrane"])
        
        all_results = []
        for db in databases:
            tool_result = await self.call_l5_tool(db, {
                "query": query,
                "max_results": params.get("max_results", 20),
            })
            
            if tool_result.get("success"):
                all_results.append({
                    "database": db,
                    "results": tool_result.get("data", {}).get("articles", [])
                                 or tool_result.get("data", {}).get("reviews", []),
                })
        
        return {
            "query": query,
            "databases_searched": databases,
            "results_by_database": all_results,
            "total_results": sum(len(r["results"]) for r in all_results),
        }
    
    async def _task_calculate_pooled_effect(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate pooled effect size for meta-analysis."""
        studies = params.get("studies", [])
        effect_type = params.get("effect_type", "OR")  # OR, RR, MD, SMD
        
        # Simple fixed-effects pooling
        if not studies:
            return {"error": "No studies provided"}
        
        # Use calculator for computations
        calc_result = await self.call_l5_tool("calculator", {
            "operation": "meta_analysis",
            "studies": studies,
            "effect_type": effect_type,
        })
        
        return calc_result.get("data", {})
    
    async def _task_grade_assessment(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform GRADE evidence assessment."""
        outcome = params.get("outcome", "")
        studies = params.get("studies", [])
        
        # GRADE domains
        domains = {
            "risk_of_bias": params.get("risk_of_bias", "not_serious"),
            "inconsistency": params.get("inconsistency", "not_serious"),
            "indirectness": params.get("indirectness", "not_serious"),
            "imprecision": params.get("imprecision", "not_serious"),
            "publication_bias": params.get("publication_bias", "not_suspected"),
        }
        
        # Calculate downgrades
        downgrades = 0
        for domain, rating in domains.items():
            if rating == "serious":
                downgrades += 1
            elif rating == "very_serious":
                downgrades += 2
        
        # Starting certainty
        start_certainty = 4 if params.get("study_design") == "rct" else 2
        final_certainty = max(1, start_certainty - downgrades)
        
        certainty_labels = {4: "High", 3: "Moderate", 2: "Low", 1: "Very Low"}
        
        return {
            "outcome": outcome,
            "study_design": params.get("study_design", "observational"),
            "starting_certainty": certainty_labels.get(start_certainty),
            "domains": domains,
            "downgrades": downgrades,
            "final_certainty": certainty_labels.get(final_certainty),
            "certainty_score": final_certainty,
        }
    
    async def _task_develop_search_strategy(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Develop systematic review search strategy."""
        pico = params.get("pico", {})
        
        # Build search terms
        population_terms = pico.get("population", [])
        intervention_terms = pico.get("intervention", [])
        comparison_terms = pico.get("comparison", [])
        outcome_terms = pico.get("outcome", [])
        
        # Combine with Boolean operators
        def build_block(terms: List[str]) -> str:
            if not terms:
                return ""
            return "(" + " OR ".join(f'"{t}"' for t in terms) + ")"
        
        blocks = []
        if population_terms:
            blocks.append(build_block(population_terms))
        if intervention_terms:
            blocks.append(build_block(intervention_terms))
        if comparison_terms:
            blocks.append(build_block(comparison_terms))
        if outcome_terms:
            blocks.append(build_block(outcome_terms))
        
        search_strategy = " AND ".join(blocks)
        
        return {
            "pico": pico,
            "search_strategy": search_strategy,
            "recommended_databases": ["PubMed", "Cochrane", "EMBASE"],
            "filters_suggested": ["Humans", "English", "Date range: last 10 years"],
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_evidence_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> EvidenceL4Worker:
    return EvidenceL4Worker(worker_key, l5_tools)

EVIDENCE_WORKER_KEYS = list(EVIDENCE_WORKER_CONFIGS.keys())


# ---------------------------------------------------------------------------
# Mission-focused Evidence Synthesizer (production L5 IDs)
# ---------------------------------------------------------------------------


class L4EvidenceSynthesizer(L4BaseWorker):
    """
    Mission-focused evidence synthesizer.
    Uses production L5 tool IDs: L5-PM, L5-CT, L5-OPENFDA, L5-WEB, L5-RAG.
    Supports deep mode (higher limits) and keyword injection from L3 strategy.

    Architecture Pattern:
    - model, temperature, max_tokens come from L4 env defaults (WorkerConfig)
    - Worker-specific overrides should be stored in PostgreSQL tools table
    """

    def __init__(self):
        super().__init__(
            WorkerConfig(
                id="L4-ES",
                name="Evidence Synthesizer",
                description="Deep evidence retrieval and synthesis",
                category=WorkerCategory.EVIDENCE_SYNTHESIS,
                # model, temperature, max_tokens inherit from L4 env defaults
                allowed_l5_tools=["L5-PM", "L5-CT", "L5-OPENFDA", "L5-WEB", "L5-RAG"],
            )
        )
        self._llm = None
        self._init_llm()

    def _init_llm(self):
        """Initialize LLM for synthesis using config from env/database."""
        try:
            from langchain_openai import ChatOpenAI
            self._llm = ChatOpenAI(
                model=self.config.model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
            )
            logger.info("l4_evidence_synthesizer_llm_initialized", model=self.config.model)
        except ImportError:
            logger.warning("l4_evidence_synthesizer_llm_not_available")
            self._llm = None

    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        # Not used; use execute below
        return {}

    async def execute(self, task: str, params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        mode = params.get("mode", "fast")
        sources = params.get("sources", ["L5-PM"])
        keywords = params.get("keywords", [])
        query = " OR ".join(keywords) if keywords else context.get("goal") or task

        limit = 20 if mode == "deep" else 3

        results = []
        citations: List[Dict[str, Any]] = []

        for source in sources:
            if source not in self.config.allowed_l5_tools:
                continue
            tool_params = {"query": query, "max_results": limit}
            tool_result = await self.call_l5_tool(source, tool_params)
            results.append(tool_result)
            data = tool_result.get("data") if isinstance(tool_result, dict) else None
            if data and isinstance(data, dict):
                citations.extend(data.get("citations", []))

        synthesis = await self._synthesize(task, query, results)

        return {
            "success": True,
            "output": synthesis,
            "citations": citations,
            "tools_used": sources,
            "mode": mode,
        }

    async def _synthesize(self, task: str, query: str, results: List[Dict[str, Any]]) -> str:
        """
        Synthesize evidence results using LLM.
        Formats gathered evidence into a coherent, evidence-based response.
        """
        # Gather evidence snippets from results
        evidence_snippets = []
        for i, res in enumerate(results, 1):
            data = res.get("data") if isinstance(res, dict) else None
            if not data:
                continue

            # Handle different data formats
            if isinstance(data, dict):
                # Extract articles/citations from common formats
                articles = data.get("articles", []) or data.get("citations", []) or data.get("results", [])
                if articles and isinstance(articles, list):
                    for art in articles[:5]:  # Limit per source
                        if isinstance(art, dict):
                            title = art.get("title", "Unknown")
                            snippet = art.get("snippet", art.get("abstract", art.get("text", "")))[:300]
                            source = art.get("source", res.get("source", f"Source {i}"))
                            evidence_snippets.append(f"- [{source}] {title}: {snippet}...")
                else:
                    evidence_snippets.append(f"- Source {i}: {str(data)[:300]}")
            else:
                evidence_snippets.append(f"- Source {i}: {str(data)[:300]}")

        if not evidence_snippets:
            return f"No evidence found for query: {query}"

        # Build evidence context
        evidence_text = "\n".join(evidence_snippets[:20])  # Limit total evidence

        # If no LLM, return formatted evidence
        if not self._llm:
            return f"## Evidence Summary for: {query}\n\n{evidence_text}"

        # Use LLM for synthesis
        try:
            from langchain_core.messages import SystemMessage, HumanMessage

            system_prompt = """You are an expert evidence synthesizer for pharmaceutical and medical research.
Your task is to synthesize the gathered evidence into a clear, structured summary.

Guidelines:
- Organize findings by theme or topic
- Highlight key findings with supporting evidence
- Note any conflicting evidence or gaps
- Be concise but comprehensive
- Cite sources when making claims
- Use markdown formatting for readability"""

            human_prompt = f"""Synthesize the following evidence for the query: "{query}"

## Gathered Evidence:
{evidence_text}

Provide a structured synthesis of these findings."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt),
            ]

            response = await self._llm.ainvoke(messages)
            logger.info("l4_evidence_synthesis_complete", query=query, evidence_count=len(evidence_snippets))
            return response.content

        except Exception as exc:
            logger.error("l4_evidence_synthesis_failed", error=str(exc))
            return f"## Evidence Summary for: {query}\n\n{evidence_text}"
