"""
VITAL Path AI Services - VITAL L4 Analysis Workers

Analysis Workers: Comparative Synthesizer, Trend Liaison,
Protocol Mapper, Guidance Distiller, Clinical Analyzer
5 workers for analysis and synthesis tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: AnalysisL4Worker
- Factory: create_analysis_worker(worker_key)
"""

from typing import Dict, Any, List
import structlog
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
ANALYSIS_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "comparative_synthesizer": WorkerConfig(
        id="L4-CS",
        name="Comparative Synthesizer",
        description="Synthesize and compare evidence from multiple sources",
        category=WorkerCategory.ANALYSIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["L5-PM", "L5-CT", "L5-WEB", "L5-CALC"],
        task_types=["compare_studies", "synthesize_evidence", "meta_summary", "forest_plot_data"],
    ),

    "trend_liaison": WorkerConfig(
        id="L4-TL",
        name="Trend Liaison",
        description="Identify and analyze trends in data and literature",
        category=WorkerCategory.ANALYSIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["L5-PM", "L5-CT", "L5-WEB"],
        task_types=["identify_trends", "temporal_analysis", "market_trends", "publication_trends"],
    ),

    "protocol_mapper": WorkerConfig(
        id="L4-PM",
        name="Protocol Mapper",
        description="Map and analyze clinical trial protocols",
        category=WorkerCategory.ANALYSIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["L5-CT", "L5-OPENFDA", "L5-WEB"],
        task_types=["extract_endpoints", "map_inclusion_criteria", "compare_protocols", "design_analysis"],
    ),

    "guidance_distiller": WorkerConfig(
        id="L4-GD",
        name="Guidance Distiller",
        description="Extract and summarize regulatory guidance",
        category=WorkerCategory.ANALYSIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["L5-OPENFDA", "L5-WEB"],
        task_types=["extract_requirements", "summarize_guidance", "identify_changes", "compliance_check"],
    ),

    "clinical_analyzer": WorkerConfig(
        id="L4-CA",
        name="Clinical Analyzer",
        description="Analyze clinical data and outcomes",
        category=WorkerCategory.ANALYSIS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=["L5-CALC", "L5-RAG"],
        task_types=["efficacy_analysis", "safety_analysis", "survival_analysis", "subgroup_analysis"],
    ),
}


class AnalysisL4Worker(L4BaseWorker):
    """L4 Worker class for analysis tasks with LLM synthesis."""

    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in ANALYSIS_WORKER_CONFIGS:
            raise ValueError(f"Unknown analysis worker: {worker_key}")

        config = ANALYSIS_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
        self._llm = None
        self._init_llm()

    def _init_llm(self):
        """Initialize LLM for synthesis tasks."""
        try:
            from langchain_openai import ChatOpenAI
            self._llm = ChatOpenAI(
                model=self.config.model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
            )
            logger.info("l4_analysis_worker_llm_initialized",
                       worker=self.worker_key, model=self.config.model)
        except ImportError:
            logger.warning("l4_analysis_worker_llm_not_available", worker=self.worker_key)
            self._llm = None

    async def execute(self, task: str, params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Override execute to accept context parameter for synthesis tasks.
        Context contains goal and artifacts from previous steps.
        """
        # Merge context into params for synthesis
        if context:
            params = {**params, **context}

        logger.info(f"vital_l4_{self.config.id.lower()}_execute_started", task=task)

        try:
            result = await self._execute_task(task, params)

            return {
                "success": True,
                "worker_id": self.config.id,
                "task": task,
                "output": result.get("output", result),
                "citations": result.get("citations", []),
            }

        except Exception as e:
            logger.error(f"vital_l4_{self.config.id.lower()}_execute_failed", task=task, error=str(e))
            return {
                "success": False,
                "worker_id": self.config.id,
                "task": task,
                "error": str(e),
            }

    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_compare_studies(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Compare multiple clinical studies."""
        study_ids = params.get("study_ids", [])
        comparison_aspects = params.get("aspects", ["endpoints", "population", "design"])
        
        # Fetch study details
        studies = []
        for study_id in study_ids[:5]:  # Limit
            if study_id.startswith("NCT"):
                result = await self.call_l5_tool("L5-CT", {
                    "query": study_id,
                    "max_results": 1,
                })
                if result.get("data", {}).get("trials"):
                    studies.append(result["data"]["trials"][0])
        
        return {
            "studies_found": len(studies),
            "comparison_aspects": comparison_aspects,
            "studies": studies,
        }
    
    async def _task_efficacy_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze efficacy endpoints."""
        control_rate = params.get("control_rate")
        treatment_rate = params.get("treatment_rate")
        
        if control_rate and treatment_rate:
            result = await self.call_l5_tool("L5-CALC", {
                "calculation": "relative_risk",
                "a": int(treatment_rate * 100),
                "b": int((1 - treatment_rate) * 100),
                "c": int(control_rate * 100),
                "d": int((1 - control_rate) * 100),
            })
            return result.get("data", {})
        
        return {"error": "Control and treatment rates required"}
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler with LLM synthesis."""
        if not self._llm:
            return {
                "task": task,
                "status": "executed",
                "params_received": list(params.keys()),
                "output": "LLM not available for synthesis.",
            }

        # Build context from params
        context_parts = []
        if params.get("goal"):
            context_parts.append(f"Goal: {params['goal']}")
        if params.get("artifacts"):
            context_parts.append("Previous findings:")
            for art in params.get("artifacts", []):
                if isinstance(art, dict):
                    content = art.get("content", art.get("output", str(art)))[:500]
                    context_parts.append(f"- {content}")

        try:
            from langchain_core.messages import SystemMessage, HumanMessage

            system_prompt = f"""You are a {self.config.name} - {self.config.description}.

Your role is to analyze, synthesize, and provide insights based on the provided context.

Guidelines:
- Be comprehensive yet concise
- Use markdown formatting for readability
- Cite sources when available
- Highlight key findings and recommendations
- Note any limitations or areas needing further investigation"""

            human_prompt = f"""Task: {task}

{chr(10).join(context_parts) if context_parts else 'No additional context provided.'}

Provide your analysis and synthesis."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt),
            ]

            response = await self._llm.ainvoke(messages)
            logger.info("l4_analysis_synthesis_complete", worker=self.worker_key, task=task)

            return {
                "task": task,
                "status": "executed",
                "output": response.content,
            }

        except Exception as exc:
            logger.error("l4_analysis_synthesis_failed", worker=self.worker_key, error=str(exc))
            return {
                "task": task,
                "status": "error",
                "error": str(exc),
                "output": f"Analysis synthesis failed: {str(exc)}",
            }


def create_analysis_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> AnalysisL4Worker:
    return AnalysisL4Worker(worker_key, l5_tools)

ANALYSIS_WORKER_KEYS = list(ANALYSIS_WORKER_CONFIGS.keys())
