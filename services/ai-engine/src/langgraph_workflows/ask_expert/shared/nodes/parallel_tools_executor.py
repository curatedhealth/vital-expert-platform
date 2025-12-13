# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [agents.l5_tools, structlog]
"""
VITAL Path AI Services - Parallel L5 Tool Executor

Enables Mode 1 (and other modes) to execute multiple L5 tools in parallel
based on query intent classification.

Architecture:
- Intent Classification → Tool Selection → Parallel Execution → Context Fusion (RRF)

Example Flow:
- Query: "What are the latest clinical trials for pembrolizumab?"
- Intent: RESEARCH_QUERY
- Selected Tools: [pubmed, clinicaltrials, rag]
- Parallel Execution: asyncio.gather(*tool_tasks)
- Fusion: RRF merges results by relevance score

Naming Convention:
- Module: parallel_tools_executor.py
- Class: ParallelToolExecutor
- Factory: create_parallel_executor()
- Logs: ask_expert_parallel_{action}
"""

import asyncio
from typing import Dict, Any, List, Optional, Set, Tuple
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
import structlog

# L5 Tool imports
from agents.l5_tools import (
    create_l5_tool,
    create_literature_tool,
    create_general_tool,
    create_regulatory_tool,
    L5Result,
    ALL_TOOL_CONFIGS,
)

logger = structlog.get_logger()


# ============================================================================
# INTENT CLASSIFICATION
# ============================================================================

class QueryIntent(Enum):
    """Query intent types for tool selection."""
    LITERATURE_RESEARCH = "literature_research"  # PubMed, Cochrane, etc.
    CLINICAL_TRIALS = "clinical_trials"          # ClinicalTrials.gov
    REGULATORY_QUERY = "regulatory_query"        # FDA, EMA, ICH
    DRUG_INFO = "drug_info"                      # OpenFDA, DailyMed, DrugBank
    MEDICAL_TERMINOLOGY = "medical_terminology"  # UMLS, SNOMED, MedDRA
    DATA_ANALYSIS = "data_analysis"              # Statistics, HEOR
    GENERAL_KNOWLEDGE = "general_knowledge"      # RAG, Web search
    MULTI_SOURCE = "multi_source"                # Needs multiple tool types


# Intent to tool mapping
INTENT_TOOL_MAP: Dict[QueryIntent, List[str]] = {
    QueryIntent.LITERATURE_RESEARCH: ["pubmed", "cochrane", "clinicaltrials"],
    QueryIntent.CLINICAL_TRIALS: ["clinicaltrials", "pubmed"],
    QueryIntent.REGULATORY_QUERY: ["openfda", "dailymed", "rag"],
    QueryIntent.DRUG_INFO: ["openfda", "dailymed", "drugbank", "pubmed"],
    QueryIntent.MEDICAL_TERMINOLOGY: ["umls", "snomed", "meddra"],
    QueryIntent.DATA_ANALYSIS: ["calculator", "scipy", "statsmodels"],
    QueryIntent.GENERAL_KNOWLEDGE: ["rag", "web_search"],
    QueryIntent.MULTI_SOURCE: ["rag", "pubmed", "clinicaltrials", "web_search"],
}


# Intent classification keywords
INTENT_KEYWORDS: Dict[QueryIntent, Set[str]] = {
    QueryIntent.LITERATURE_RESEARCH: {
        "study", "research", "trial", "publication", "paper", "article",
        "evidence", "systematic review", "meta-analysis", "pubmed", "cochrane",
        "literature", "findings", "published"
    },
    QueryIntent.CLINICAL_TRIALS: {
        "clinical trial", "trial", "nct", "phase", "enrollment", "recruiting",
        "ongoing", "completed", "clinicaltrials.gov", "study design"
    },
    QueryIntent.REGULATORY_QUERY: {
        "fda", "ema", "approved", "approval", "indication", "label",
        "regulatory", "submission", "compliance", "guidance", "ich"
    },
    QueryIntent.DRUG_INFO: {
        "drug", "medication", "dosage", "adverse event", "side effect",
        "interaction", "contraindication", "pharmacology", "mechanism"
    },
    QueryIntent.MEDICAL_TERMINOLOGY: {
        "code", "icd", "snomed", "meddra", "umls", "terminology",
        "classification", "ontology", "definition"
    },
    QueryIntent.DATA_ANALYSIS: {
        "calculate", "statistics", "p-value", "confidence interval",
        "mean", "median", "standard deviation", "regression", "correlation"
    },
    QueryIntent.GENERAL_KNOWLEDGE: {
        "what is", "explain", "how does", "overview", "summary",
        "background", "introduction", "basics"
    },
}


def classify_query_intent(query: str, agent_config: Optional[Dict] = None) -> QueryIntent:
    """
    Classify query intent for tool selection.

    Args:
        query: User query string
        agent_config: Optional agent configuration with domain hints

    Returns:
        QueryIntent enum value
    """
    query_lower = query.lower()

    # Score each intent based on keyword matches
    scores: Dict[QueryIntent, int] = {intent: 0 for intent in QueryIntent}

    for intent, keywords in INTENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in query_lower:
                scores[intent] += 1

    # Get max scoring intent
    max_score = max(scores.values())

    if max_score == 0:
        # Default to multi-source for ambiguous queries
        return QueryIntent.MULTI_SOURCE

    # Multiple high scores → multi-source
    high_scoring = [i for i, s in scores.items() if s == max_score]
    if len(high_scoring) > 1:
        return QueryIntent.MULTI_SOURCE

    return high_scoring[0]


# ============================================================================
# PARALLEL TOOL EXECUTOR
# ============================================================================

@dataclass
class ToolExecutionResult:
    """Result from a single tool execution."""
    tool_key: str
    success: bool
    results: List[Dict[str, Any]] = field(default_factory=list)
    error: Optional[str] = None
    execution_time_ms: int = 0
    result_count: int = 0


@dataclass
class FusedContext:
    """Fused context from multiple tool results."""
    documents: List[Dict[str, Any]]
    sources: List[str]
    total_results: int
    fusion_method: str
    execution_time_ms: int
    tool_results: List[ToolExecutionResult]


class ParallelToolExecutor:
    """
    Execute multiple L5 tools in parallel and fuse results.

    Supports:
    - Intent-based tool selection
    - Agent-specific tool configuration
    - Parallel async execution
    - RRF (Reciprocal Rank Fusion) for result merging
    """

    def __init__(
        self,
        supabase_client=None,
        max_concurrent_tools: int = 5,
        default_max_results: int = 10,
        rrf_k: int = 60,  # RRF constant
    ):
        self.supabase = supabase_client
        self.max_concurrent = max_concurrent_tools
        self.default_max_results = default_max_results
        self.rrf_k = rrf_k

        # Tool cache
        self._tool_cache: Dict[str, Any] = {}

        logger.info(
            "ask_expert_parallel_executor_initialized",
            max_concurrent=max_concurrent_tools,
        )

    async def execute_for_query(
        self,
        query: str,
        agent_config: Optional[Dict] = None,
        tenant_id: Optional[str] = None,
        max_results_per_tool: int = 10,
        enabled_tools: Optional[List[str]] = None,
        timeout_seconds: float = 30.0,
    ) -> FusedContext:
        """
        Execute relevant tools for a query and fuse results.

        Args:
            query: User query
            agent_config: Optional agent configuration with tool preferences
            tenant_id: Tenant ID for RAG queries
            max_results_per_tool: Max results from each tool
            enabled_tools: Override automatic tool selection
            timeout_seconds: Timeout for parallel execution

        Returns:
            FusedContext with merged results
        """
        start_time = datetime.now()

        # 1. Determine which tools to run
        if enabled_tools:
            tools_to_run = enabled_tools
        else:
            tools_to_run = self._select_tools_for_query(query, agent_config)

        # Limit concurrent tools
        tools_to_run = tools_to_run[:self.max_concurrent]

        logger.info(
            "ask_expert_parallel_tools_selected",
            query_preview=query[:50],
            tools=tools_to_run,
            tool_count=len(tools_to_run),
        )

        # 2. Execute tools in parallel
        tool_results = await self._execute_tools_parallel(
            tools=tools_to_run,
            query=query,
            tenant_id=tenant_id,
            max_results=max_results_per_tool,
            timeout=timeout_seconds,
        )

        # 3. Fuse results using RRF
        fused_docs = self._fuse_results_rrf(tool_results)

        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)

        logger.info(
            "ask_expert_parallel_execution_complete",
            total_results=len(fused_docs),
            execution_time_ms=execution_time,
            successful_tools=[r.tool_key for r in tool_results if r.success],
        )

        return FusedContext(
            documents=fused_docs,
            sources=list(set(d.get('source', '') for d in fused_docs)),
            total_results=len(fused_docs),
            fusion_method="rrf",
            execution_time_ms=execution_time,
            tool_results=tool_results,
        )

    def _select_tools_for_query(
        self,
        query: str,
        agent_config: Optional[Dict] = None,
    ) -> List[str]:
        """Select appropriate tools based on query and agent."""
        # Classify intent
        intent = classify_query_intent(query, agent_config)

        # Get base tools for intent
        base_tools = list(INTENT_TOOL_MAP.get(intent, ["rag", "pubmed"]))

        # Agent-specific tools override
        if agent_config:
            agent_tools = agent_config.get('tools', [])
            if agent_tools:
                # Use agent's configured tools, ensuring they exist
                valid_tools = [t for t in agent_tools if t in ALL_TOOL_CONFIGS or t in ["rag", "web_search"]]
                if valid_tools:
                    base_tools = valid_tools

        # Always include RAG if available
        if "rag" not in base_tools:
            base_tools.insert(0, "rag")

        return base_tools

    async def _execute_tools_parallel(
        self,
        tools: List[str],
        query: str,
        tenant_id: Optional[str],
        max_results: int,
        timeout: float,
    ) -> List[ToolExecutionResult]:
        """Execute multiple tools in parallel with timeout."""
        tasks = []

        for tool_key in tools:
            task = asyncio.create_task(
                self._execute_single_tool(
                    tool_key=tool_key,
                    query=query,
                    tenant_id=tenant_id,
                    max_results=max_results,
                )
            )
            tasks.append((tool_key, task))

        # Wait with timeout
        results = []
        try:
            done, pending = await asyncio.wait(
                [t[1] for t in tasks],
                timeout=timeout,
            )

            # Cancel pending tasks
            for task in pending:
                task.cancel()

            # Collect results
            task_map = {t[1]: t[0] for t in tasks}
            for task in done:
                tool_key = task_map[task]
                try:
                    result = task.result()
                    results.append(result)
                except Exception as e:
                    results.append(ToolExecutionResult(
                        tool_key=tool_key,
                        success=False,
                        error=str(e),
                    ))

            # Add timeout results for pending
            for task in pending:
                tool_key = task_map[task]
                results.append(ToolExecutionResult(
                    tool_key=tool_key,
                    success=False,
                    error="Timeout",
                ))

        except Exception as e:
            logger.error("ask_expert_parallel_execution_failed", error=str(e))

        return results

    async def _execute_single_tool(
        self,
        tool_key: str,
        query: str,
        tenant_id: Optional[str],
        max_results: int,
    ) -> ToolExecutionResult:
        """Execute a single L5 tool."""
        start_time = datetime.now()

        try:
            # Handle special tools
            if tool_key == "rag":
                results = await self._execute_rag(query, tenant_id, max_results)
            elif tool_key == "web_search":
                results = await self._execute_web_search(query, max_results)
            else:
                # Standard L5 tool
                results = await self._execute_l5_tool(tool_key, query, max_results)

            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)

            return ToolExecutionResult(
                tool_key=tool_key,
                success=True,
                results=results,
                execution_time_ms=execution_time,
                result_count=len(results),
            )

        except Exception as e:
            logger.error(
                "ask_expert_parallel_tool_failed",
                tool_key=tool_key,
                error=str(e),
            )
            return ToolExecutionResult(
                tool_key=tool_key,
                success=False,
                error=str(e),
            )

    async def _execute_rag(
        self,
        query: str,
        tenant_id: Optional[str],
        max_results: int,
    ) -> List[Dict[str, Any]]:
        """Execute RAG search."""
        tool = create_general_tool(
            "rag",
            supabase_client=self.supabase,
        )

        results = await tool.search(
            query=query,
            max_results=max_results,
            tenant_id=tenant_id or "",
        )

        return [
            {
                "id": r.id,
                "title": r.title,
                "content": r.content,
                "source": "rag",
                "score": r.score,
                "url": r.url,
                "metadata": r.metadata,
            }
            for r in results
        ]

    async def _execute_web_search(
        self,
        query: str,
        max_results: int,
    ) -> List[Dict[str, Any]]:
        """Execute web search."""
        import os
        tool = create_general_tool(
            "web_search",
            tavily_key=os.getenv("TAVILY_API_KEY"),
        )

        results = await tool.search(
            query=query,
            max_results=max_results,
        )

        return [
            {
                "id": r.id,
                "title": r.title,
                "content": r.content,
                "source": "web_search",
                "score": r.score,
                "url": r.url,
                "snippet": r.snippet,
            }
            for r in results
        ]

    async def _execute_l5_tool(
        self,
        tool_key: str,
        query: str,
        max_results: int,
    ) -> List[Dict[str, Any]]:
        """Execute a standard L5 tool."""
        # Literature tools
        if tool_key in ["pubmed", "cochrane", "clinicaltrials"]:
            tool = create_literature_tool(tool_key)

            if tool_key == "pubmed":
                result = await tool._execute_pubmed({
                    "query": query,
                    "max_results": max_results,
                })
                return [
                    {
                        "id": a.get("pmid", ""),
                        "title": a.get("title", ""),
                        "content": a.get("abstract", ""),
                        "source": "pubmed",
                        "score": 1.0 / (i + 1),  # Rank-based score
                        "url": a.get("url", ""),
                        "authors": a.get("authors", []),
                        "journal": a.get("journal", ""),
                        "publication_date": a.get("publication_date", ""),
                        "doi": a.get("doi"),
                        "mesh_terms": a.get("mesh_terms", []),
                    }
                    for i, a in enumerate(result.get("articles", []))
                ]

            elif tool_key == "clinicaltrials":
                result = await tool._execute_clinicaltrials({
                    "query": query,
                    "max_results": max_results,
                })
                return [
                    {
                        "id": t.get("nct_id", ""),
                        "title": t.get("title", ""),
                        "content": t.get("brief_summary", ""),
                        "source": "clinicaltrials",
                        "score": 1.0 / (i + 1),
                        "url": t.get("url", ""),
                        "status": t.get("status", ""),
                        "phase": t.get("phase", []),
                        "conditions": t.get("conditions", []),
                        "interventions": t.get("interventions", []),
                    }
                    for i, t in enumerate(result.get("trials", []))
                ]

            elif tool_key == "cochrane":
                result = await tool._execute_cochrane({
                    "query": query,
                    "max_results": max_results,
                })
                return [
                    {
                        "id": r.get("id", ""),
                        "title": r.get("title", ""),
                        "content": r.get("abstract", ""),
                        "source": "cochrane",
                        "score": 1.0 / (i + 1),
                        "url": r.get("url", ""),
                        "doi": r.get("doi"),
                    }
                    for i, r in enumerate(result.get("reviews", []))
                ]

        # Regulatory tools
        if tool_key in ["openfda", "dailymed"]:
            tool = create_regulatory_tool(tool_key)
            result = await tool.execute({"query": query, "max_results": max_results})

            if result.success:
                return [
                    {
                        "id": str(i),
                        "title": item.get("title", item.get("brand_name", "")),
                        "content": item.get("content", item.get("description", "")),
                        "source": tool_key,
                        "score": 1.0 / (i + 1),
                        "url": item.get("url", ""),
                        "metadata": item,
                    }
                    for i, item in enumerate(result.data if isinstance(result.data, list) else [result.data])
                ]
            return []

        # Generic fallback
        try:
            tool = create_l5_tool(tool_key)
            if hasattr(tool, 'search'):
                results = await tool.search(query=query, max_results=max_results)
                return [
                    {
                        "id": r.id if hasattr(r, 'id') else str(i),
                        "title": r.title if hasattr(r, 'title') else "",
                        "content": r.content if hasattr(r, 'content') else str(r),
                        "source": tool_key,
                        "score": r.score if hasattr(r, 'score') else 1.0 / (i + 1),
                        "url": r.url if hasattr(r, 'url') else "",
                    }
                    for i, r in enumerate(results)
                ]
            elif hasattr(tool, 'execute'):
                result = await tool.execute({"query": query, "max_results": max_results})
                if result.success and result.data:
                    data = result.data if isinstance(result.data, list) else [result.data]
                    return [
                        {
                            "id": str(i),
                            "title": item.get("title", ""),
                            "content": item.get("content", str(item)),
                            "source": tool_key,
                            "score": 1.0 / (i + 1),
                        }
                        for i, item in enumerate(data)
                    ]
        except Exception as e:
            logger.warning(f"ask_expert_parallel_l5_tool_fallback_failed", tool=tool_key, error=str(e))

        return []

    def _fuse_results_rrf(
        self,
        tool_results: List[ToolExecutionResult],
    ) -> List[Dict[str, Any]]:
        """
        Fuse results from multiple tools using Reciprocal Rank Fusion (RRF).

        RRF Score = Σ 1 / (k + rank)
        where k is a constant (default 60) and rank is the position in each list.

        This gives balanced weight to results from different sources while
        preferring items that appear in multiple result sets.
        """
        # Collect all results with their ranks
        doc_scores: Dict[str, Tuple[float, Dict[str, Any]]] = {}

        for tool_result in tool_results:
            if not tool_result.success:
                continue

            for rank, doc in enumerate(tool_result.results):
                # Create unique key (prefer URL, fallback to title hash)
                doc_key = doc.get("url") or doc.get("id") or hash(doc.get("title", ""))
                doc_key = str(doc_key)

                # RRF score contribution
                rrf_score = 1.0 / (self.rrf_k + rank + 1)

                if doc_key in doc_scores:
                    # Add to existing score (appears in multiple sources)
                    existing_score, existing_doc = doc_scores[doc_key]
                    # Merge sources
                    existing_sources = existing_doc.get("_sources", [existing_doc.get("source")])
                    new_source = doc.get("source")
                    if new_source not in existing_sources:
                        existing_sources.append(new_source)
                    existing_doc["_sources"] = existing_sources
                    doc_scores[doc_key] = (existing_score + rrf_score, existing_doc)
                else:
                    doc["_sources"] = [doc.get("source")]
                    doc_scores[doc_key] = (rrf_score, doc)

        # Sort by fused score
        sorted_docs = sorted(
            doc_scores.values(),
            key=lambda x: x[0],
            reverse=True
        )

        # Return documents with their fused scores
        result = []
        for score, doc in sorted_docs:
            doc["_rrf_score"] = score
            doc["_multi_source"] = len(doc.get("_sources", [])) > 1
            result.append(doc)

        return result


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_parallel_executor(
    supabase_client=None,
    **kwargs
) -> ParallelToolExecutor:
    """Create a parallel tool executor instance."""
    return ParallelToolExecutor(supabase_client=supabase_client, **kwargs)


# ============================================================================
# LANGGRAPH NODE
# ============================================================================

async def ask_expert_parallel_tools_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for parallel L5 tool execution.

    Input state:
        - query: User query
        - tenant_id: Tenant ID
        - agent_config: Agent configuration (optional)
        - enable_tools: Whether to run tools (default True)
        - tool_selection: Override tool selection (optional)

    Output state:
        - retrieved_documents: Fused documents from tools
        - tool_execution_results: Details of each tool execution
        - parallel_execution_time_ms: Total execution time
    """
    if not state.get('enable_tools', True):
        return {
            'retrieved_documents': state.get('retrieved_documents', []),
            'nodes_executed': ['ask_expert_parallel_tools'],
        }

    query = state.get('query', '')
    tenant_id = state.get('tenant_id')
    agent_config = state.get('agent_config')
    enabled_tools = state.get('tool_selection')

    # Get supabase client from state or create new
    supabase = state.get('supabase_client')

    executor = create_parallel_executor(supabase_client=supabase)

    try:
        fused_context = await executor.execute_for_query(
            query=query,
            agent_config=agent_config,
            tenant_id=tenant_id,
            enabled_tools=enabled_tools,
        )

        # Merge with existing RAG results if any
        existing_docs = state.get('retrieved_documents', [])
        all_docs = existing_docs + fused_context.documents

        # De-duplicate by URL/ID
        seen = set()
        unique_docs = []
        for doc in all_docs:
            key = doc.get('url') or doc.get('id') or hash(doc.get('title', ''))
            if key not in seen:
                seen.add(key)
                unique_docs.append(doc)

        return {
            'retrieved_documents': unique_docs[:20],  # Limit to top 20
            'tool_execution_results': [
                {
                    'tool': r.tool_key,
                    'success': r.success,
                    'count': r.result_count,
                    'time_ms': r.execution_time_ms,
                    'error': r.error,
                }
                for r in fused_context.tool_results
            ],
            'parallel_execution_time_ms': fused_context.execution_time_ms,
            'nodes_executed': ['ask_expert_parallel_tools'],
        }

    except Exception as e:
        logger.error("ask_expert_parallel_tools_node_failed", error=str(e))
        return {
            'retrieved_documents': state.get('retrieved_documents', []),
            'errors': [f"Parallel tool execution failed: {str(e)}"],
            'nodes_executed': ['ask_expert_parallel_tools'],
        }
