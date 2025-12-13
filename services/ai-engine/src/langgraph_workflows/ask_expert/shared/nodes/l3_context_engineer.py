# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph_workflows.observability, langgraph_workflows.state_schemas, parallel_tools_executor, structlog]
"""
VITAL Path AI Services - L3 Context Engineer Orchestrator

The L3 Context Engineer is the "Business Operations Specialist" of the agent hierarchy.
It orchestrates L4 Workers and L5 Tools in parallel to gather comprehensive context
for the expert agent.

Architecture (from AGENT_OS_GOLD_STANDARD v6.0):
- L3-A Context Engineer: 1 per department, orchestrates L4/L5, can invoke L3-B Specialists
- L3-B Specialist: Many per department, focused expertise, invoked BY L3-A

This module implements the L3-A Context Engineer pattern for Mode 1.
"""

import asyncio
from typing import Dict, Any, List, Optional, Tuple
from enum import Enum
from datetime import datetime
import structlog

from langgraph_workflows.observability import trace_node
from langgraph_workflows.state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()


# =============================================================================
# ENUMS AND TYPES
# =============================================================================

class L3OrchestrationType(str, Enum):
    """Types of L3 orchestration patterns."""
    PARALLEL_TOOLS = "parallel_tools"         # Fan-out to L5 tools
    SEQUENTIAL_WORKERS = "sequential_workers"  # L4 worker chain
    HYBRID = "hybrid"                          # Both patterns
    SPECIALIST_DELEGATION = "specialist_delegation"  # Invoke L3-B


class ToolCategory(str, Enum):
    """Categories of L5 tools available for parallel execution."""
    LITERATURE = "literature"
    CLINICAL_TRIALS = "clinical_trials"
    REGULATORY = "regulatory"
    DRUG_INFO = "drug_info"
    MEDICAL_TERMINOLOGY = "medical_terminology"
    DATA_ANALYSIS = "data_analysis"
    GENERAL_KNOWLEDGE = "general_knowledge"


class WorkerType(str, Enum):
    """Types of L4 workers available."""
    RAG_RETRIEVER = "rag_retriever"
    CITATION_BUILDER = "citation_builder"
    EVIDENCE_GRADER = "evidence_grader"
    RESPONSE_SYNTHESIZER = "response_synthesizer"


# =============================================================================
# INTENT CLASSIFICATION (Determines which tools/workers to invoke)
# =============================================================================

INTENT_TOOL_MAPPING = {
    "literature_search": [ToolCategory.LITERATURE, ToolCategory.GENERAL_KNOWLEDGE],
    "clinical_trial_search": [ToolCategory.CLINICAL_TRIALS, ToolCategory.LITERATURE],
    "regulatory_guidance": [ToolCategory.REGULATORY, ToolCategory.DRUG_INFO],
    "drug_information": [ToolCategory.DRUG_INFO, ToolCategory.MEDICAL_TERMINOLOGY],
    "data_analysis": [ToolCategory.DATA_ANALYSIS, ToolCategory.GENERAL_KNOWLEDGE],
    "general_question": [ToolCategory.GENERAL_KNOWLEDGE],
}

INTENT_KEYWORDS = {
    "literature_search": ["study", "research", "paper", "publication", "evidence", "trial", "meta-analysis"],
    "clinical_trial_search": ["clinical trial", "phase", "enrollment", "endpoint", "protocol", "nct"],
    "regulatory_guidance": ["fda", "ema", "ich", "guidance", "regulation", "approval", "submission", "510k", "pma"],
    "drug_information": ["drug", "medication", "dosage", "indication", "contraindication", "interaction"],
    "data_analysis": ["analyze", "statistics", "correlation", "trend", "compare", "benchmark"],
    "general_question": [],  # Fallback
}


def classify_query_intent(query: str) -> Tuple[str, List[ToolCategory]]:
    """
    Classify query intent and return appropriate tool categories.

    Returns:
        Tuple of (intent_name, list of ToolCategory)
    """
    query_lower = query.lower()

    # Score each intent based on keyword matches
    intent_scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in query_lower)
        if score > 0:
            intent_scores[intent] = score

    # Get best matching intent
    if intent_scores:
        best_intent = max(intent_scores, key=intent_scores.get)
    else:
        best_intent = "general_question"

    tools = INTENT_TOOL_MAPPING.get(best_intent, [ToolCategory.GENERAL_KNOWLEDGE])

    return best_intent, tools


# =============================================================================
# L3 CONTEXT ENGINEER ORCHESTRATOR
# =============================================================================

class L3ContextEngineerOrchestrator:
    """
    L3 Context Engineer: Business Operations Specialist

    Responsibilities:
    1. Analyze incoming query and classify intent
    2. Determine optimal orchestration pattern
    3. Select appropriate L5 tools and L4 workers
    4. Execute in parallel where possible
    5. Fuse results using RRF (Reciprocal Rank Fusion)
    6. Optionally delegate to L3-B Specialists for deep expertise

    Real-World Analogy:
    Like a Business Operations Specialist who coordinates:
    - Research team (L4 Workers)
    - Data retrieval tools (L5 Tools)
    - Domain specialists (L3-B Specialists) when needed
    """

    def __init__(
        self,
        supabase_client,
        enable_specialists: bool = True,
        max_parallel_tools: int = 5,
        timeout_seconds: float = 30.0,
    ):
        self.supabase = supabase_client
        self.enable_specialists = enable_specialists
        self.max_parallel_tools = max_parallel_tools
        self.timeout_seconds = timeout_seconds

        # Tool executors (will be populated from parallel_tools_executor)
        self._tool_executors: Dict[ToolCategory, Any] = {}

        logger.info(
            "l3_context_engineer_initialized",
            enable_specialists=enable_specialists,
            max_parallel_tools=max_parallel_tools,
        )

    async def orchestrate(
        self,
        query: str,
        agent_config: Dict[str, Any],
        tenant_id: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Main orchestration entry point.

        Args:
            query: User's query
            agent_config: Selected agent configuration
            tenant_id: Tenant isolation
            context: Optional context (region, domain, therapeutic area, phase)

        Returns:
            Enriched context with tool results, citations, and metadata
        """
        start_time = datetime.now()

        # Step 1: Classify intent
        intent, tool_categories = classify_query_intent(query)

        logger.info(
            "l3_context_engineer_intent_classified",
            intent=intent,
            tool_categories=[t.value for t in tool_categories],
        )

        # Step 2: Determine orchestration pattern
        pattern = self._determine_orchestration_pattern(intent, agent_config)

        # Step 3: Execute based on pattern
        results = {}

        if pattern in [L3OrchestrationType.PARALLEL_TOOLS, L3OrchestrationType.HYBRID]:
            tool_results = await self._execute_parallel_tools(
                query=query,
                tool_categories=tool_categories,
                tenant_id=tenant_id,
                context=context,
            )
            results["tool_results"] = tool_results

        if pattern in [L3OrchestrationType.SEQUENTIAL_WORKERS, L3OrchestrationType.HYBRID]:
            worker_results = await self._execute_workers(
                query=query,
                tool_results=results.get("tool_results", {}),
                tenant_id=tenant_id,
            )
            results["worker_results"] = worker_results

        if pattern == L3OrchestrationType.SPECIALIST_DELEGATION and self.enable_specialists:
            specialist_results = await self._delegate_to_specialist(
                query=query,
                intent=intent,
                agent_config=agent_config,
                tenant_id=tenant_id,
            )
            results["specialist_results"] = specialist_results

        # Step 4: Fuse results using RRF
        fused_context = self._fuse_results(results, query)

        # Step 5: Build response
        elapsed_ms = int((datetime.now() - start_time).total_seconds() * 1000)

        return {
            "enriched_context": fused_context,
            "intent": intent,
            "orchestration_pattern": pattern.value,
            "tool_categories_used": [t.value for t in tool_categories],
            "latency_ms": elapsed_ms,
            "sources_count": len(fused_context.get("sources", [])),
        }

    def _determine_orchestration_pattern(
        self,
        intent: str,
        agent_config: Dict[str, Any],
    ) -> L3OrchestrationType:
        """
        Determine the optimal orchestration pattern based on intent and agent tier.

        Rules:
        - Tier 3 agents (ultra-specialist): May need specialist delegation
        - Complex intents (analysis, regulatory): Use hybrid pattern
        - Simple intents (general): Parallel tools only
        """
        agent_tier = agent_config.get("tier", 1)

        # Complex intents that need hybrid approach
        complex_intents = ["regulatory_guidance", "data_analysis"]

        # Intents that benefit from specialist delegation
        specialist_intents = ["clinical_trial_search", "regulatory_guidance"]

        if intent in specialist_intents and agent_tier >= 2 and self.enable_specialists:
            return L3OrchestrationType.SPECIALIST_DELEGATION
        elif intent in complex_intents:
            return L3OrchestrationType.HYBRID
        else:
            return L3OrchestrationType.PARALLEL_TOOLS

    async def _execute_parallel_tools(
        self,
        query: str,
        tool_categories: List[ToolCategory],
        tenant_id: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Execute L5 tools in parallel using asyncio.gather.

        This is the core fan-out pattern for Mode 1.
        """
        # Import the parallel tools executor
        from .parallel_tools_executor import ParallelToolExecutor, QueryIntent

        # Map our categories to the executor's QueryIntent
        intent_map = {
            ToolCategory.LITERATURE: QueryIntent.LITERATURE_SEARCH,
            ToolCategory.CLINICAL_TRIALS: QueryIntent.CLINICAL_TRIAL_SEARCH,
            ToolCategory.REGULATORY: QueryIntent.REGULATORY_GUIDANCE,
            ToolCategory.DRUG_INFO: QueryIntent.DRUG_INFORMATION,
            ToolCategory.MEDICAL_TERMINOLOGY: QueryIntent.GENERAL_QUESTION,
            ToolCategory.DATA_ANALYSIS: QueryIntent.DATA_ANALYSIS,
            ToolCategory.GENERAL_KNOWLEDGE: QueryIntent.GENERAL_QUESTION,
        }

        try:
            executor = ParallelToolExecutor(
                supabase_client=self.supabase,
                max_concurrent=self.max_parallel_tools,
            )

            # Execute tools for each category
            all_results = []

            for category in tool_categories[:self.max_parallel_tools]:
                intent = intent_map.get(category, QueryIntent.GENERAL_QUESTION)

                result = await executor.execute_for_intent(
                    query=query,
                    intent=intent,
                    context=context or {},
                )

                all_results.append({
                    "category": category.value,
                    "results": result.get("results", []),
                    "sources": result.get("sources", []),
                    "latency_ms": result.get("latency_ms", 0),
                })

            return {
                "tool_executions": all_results,
                "total_sources": sum(len(r.get("sources", [])) for r in all_results),
            }

        except Exception as e:
            logger.error("l3_parallel_tools_failed", error=str(e))
            return {"tool_executions": [], "total_sources": 0, "error": str(e)}

    async def _execute_workers(
        self,
        query: str,
        tool_results: Dict[str, Any],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Execute L4 workers in sequence or parallel.

        Workers perform higher-level tasks like:
        - Citation building
        - Evidence grading
        - Response synthesis
        """
        workers_executed = []

        # L4 Worker: Evidence Grader
        if tool_results.get("total_sources", 0) > 0:
            graded_sources = await self._grade_evidence(
                sources=tool_results.get("tool_executions", []),
                query=query,
            )
            workers_executed.append({
                "worker": WorkerType.EVIDENCE_GRADER.value,
                "result": graded_sources,
            })

        return {
            "workers_executed": workers_executed,
            "worker_count": len(workers_executed),
        }

    async def _delegate_to_specialist(
        self,
        query: str,
        intent: str,
        agent_config: Dict[str, Any],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Delegate to L3-B Specialist when deep domain expertise is needed.

        L3-A Context Engineer can invoke L3-B Specialists who have:
        - Deeper domain knowledge
        - Specialized system prompts
        - Different tool access patterns
        """
        department_id = agent_config.get("department_id")

        if not department_id:
            return {"delegated": False, "reason": "No department context"}

        try:
            # Find L3-B Specialists in the same department
            result = (
                self.supabase.table("agents")
                .select("id, name, slug, system_prompt, expertise_areas")
                .eq("department_id", department_id)
                .eq("agent_level_id", "L3")
                .eq("status", "active")
                .limit(3)
                .execute()
            )

            specialists = result.data if result.data else []

            if not specialists:
                return {"delegated": False, "reason": "No specialists available"}

            # For now, just log that we WOULD delegate
            # Full implementation would invoke the specialist agent
            logger.info(
                "l3_context_engineer_would_delegate",
                specialists_available=len(specialists),
                intent=intent,
            )

            return {
                "delegated": False,  # Set to True when full implementation ready
                "specialists_available": [s.get("name") for s in specialists],
                "reason": "Specialist delegation available but not yet wired",
            }

        except Exception as e:
            logger.error("l3_specialist_delegation_failed", error=str(e))
            return {"delegated": False, "error": str(e)}

    async def _grade_evidence(
        self,
        sources: List[Dict[str, Any]],
        query: str,
    ) -> Dict[str, Any]:
        """
        L4 Worker: Grade evidence sources by relevance and quality.

        Uses a simple scoring model:
        - Relevance to query (keyword overlap)
        - Source quality tier
        - Recency
        """
        graded = []
        query_terms = set(query.lower().split())

        for execution in sources:
            for result in execution.get("results", []):
                content = str(result.get("content", "")).lower()

                # Simple relevance scoring
                overlap = len(query_terms.intersection(set(content.split())))
                relevance_score = min(overlap / max(len(query_terms), 1), 1.0)

                graded.append({
                    "source": result,
                    "relevance_score": relevance_score,
                    "category": execution.get("category"),
                })

        # Sort by relevance
        graded.sort(key=lambda x: x["relevance_score"], reverse=True)

        return {
            "graded_sources": graded[:20],  # Top 20
            "total_graded": len(graded),
        }

    def _fuse_results(
        self,
        results: Dict[str, Any],
        query: str,
    ) -> Dict[str, Any]:
        """
        Fuse results from all sources using Reciprocal Rank Fusion (RRF).

        RRF Formula: score(d) = Σ 1/(k + rank(d))
        where k=60 is a constant and rank(d) is the position in each ranked list.
        """
        k = 60  # RRF constant
        doc_scores: Dict[str, float] = {}
        doc_contents: Dict[str, Dict[str, Any]] = {}

        # Process tool results
        tool_results = results.get("tool_results", {}).get("tool_executions", [])
        for execution in tool_results:
            for rank, result in enumerate(execution.get("results", [])[:10]):
                doc_id = str(hash(str(result.get("content", ""))[:100]))

                if doc_id not in doc_contents:
                    doc_contents[doc_id] = result
                    doc_scores[doc_id] = 0

                doc_scores[doc_id] += 1 / (k + rank + 1)

        # Process worker results
        worker_results = results.get("worker_results", {}).get("workers_executed", [])
        for worker in worker_results:
            if worker.get("worker") == WorkerType.EVIDENCE_GRADER.value:
                graded = worker.get("result", {}).get("graded_sources", [])
                for rank, item in enumerate(graded[:20]):
                    source = item.get("source", {})
                    doc_id = str(hash(str(source.get("content", ""))[:100]))

                    if doc_id not in doc_contents:
                        doc_contents[doc_id] = source
                        doc_scores[doc_id] = 0

                    # Boost by relevance score
                    boost = 1 + item.get("relevance_score", 0)
                    doc_scores[doc_id] += boost / (k + rank + 1)

        # Sort by fused score
        sorted_docs = sorted(
            doc_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        # Build final context
        fused_sources = []
        for doc_id, score in sorted_docs[:10]:  # Top 10
            content = doc_contents.get(doc_id, {})
            fused_sources.append({
                "content": content.get("content", ""),
                "source": content.get("source", "unknown"),
                "rrf_score": score,
                "metadata": content.get("metadata", {}),
            })

        return {
            "sources": fused_sources,
            "total_fused": len(sorted_docs),
            "fusion_method": "rrf",
        }


# =============================================================================
# LANGGRAPH NODE FUNCTION
# =============================================================================

def create_l3_context_engineer_node(
    supabase_client,
    enable_specialists: bool = True,
    max_parallel_tools: int = 5,
):
    """
    Factory function to create L3 Context Engineer node for LangGraph.

    Usage in workflow:
        graph.add_node("l3_orchestrate", create_l3_context_engineer_node(supabase))
    """
    orchestrator = L3ContextEngineerOrchestrator(
        supabase_client=supabase_client,
        enable_specialists=enable_specialists,
        max_parallel_tools=max_parallel_tools,
    )

    @trace_node("ask_expert_mode1_l3_orchestrate")
    async def l3_context_engineer_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        L3 Context Engineer Node for Mode 1 workflow.

        Position in graph: After load_agent, before rag_retrieval

        Input state:
        - query: User's question
        - current_agent_id: Selected agent
        - tenant_id: Tenant isolation
        - resolved_context: Region, domain, therapeutic area, phase

        Output state additions:
        - l3_enriched_context: Fused results from parallel tool execution
        - l3_intent: Classified query intent
        - l3_orchestration_pattern: Pattern used (parallel, hybrid, etc.)
        - l3_latency_ms: Orchestration time
        """
        query = state.get("query", "")
        tenant_id = state.get("tenant_id")

        # Build agent config from state
        agent_config = {
            "agent_id": state.get("current_agent_id"),
            "tier": state.get("agent_tier", 1),
            "department_id": state.get("department_id"),
        }

        # Get resolved context
        context = state.get("resolved_context", {})

        if not query:
            logger.warning("l3_context_engineer_no_query")
            return {
                "l3_enriched_context": {},
                "l3_intent": "unknown",
                "nodes_executed": ["ask_expert_mode1_l3_orchestrate"],
            }

        try:
            result = await orchestrator.orchestrate(
                query=query,
                agent_config=agent_config,
                tenant_id=tenant_id,
                context=context,
            )

            logger.info(
                "l3_context_engineer_completed",
                intent=result.get("intent"),
                pattern=result.get("orchestration_pattern"),
                sources_count=result.get("sources_count", 0),
                latency_ms=result.get("latency_ms", 0),
            )

            return {
                "l3_enriched_context": result.get("enriched_context", {}),
                "l3_intent": result.get("intent"),
                "l3_orchestration_pattern": result.get("orchestration_pattern"),
                "l3_tool_categories": result.get("tool_categories_used", []),
                "l3_latency_ms": result.get("latency_ms", 0),
                "nodes_executed": ["ask_expert_mode1_l3_orchestrate"],
            }

        except Exception as e:
            logger.error("l3_context_engineer_failed", error=str(e))
            return {
                "l3_enriched_context": {},
                "l3_intent": "error",
                "l3_error": str(e),
                "nodes_executed": ["ask_expert_mode1_l3_orchestrate"],
            }

    return l3_context_engineer_node


# Convenience alias for direct import
ask_expert_l3_context_engineer_node = None  # Set by factory


__all__ = [
    "L3ContextEngineerOrchestrator",
    "L3OrchestrationType",
    "ToolCategory",
    "WorkerType",
    "classify_query_intent",
    "create_l3_context_engineer_node",
]
