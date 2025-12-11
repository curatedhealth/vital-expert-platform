"""
L5 Tool Mapper - Maps runner codes and plan tools to L5 tool slugs.

Bridges the gap between:
- Runner codes from vital_runners (e.g., "scan", "synthesize")
- Plan tool names (e.g., "pubmed_search", "clinical_trials")
- L5 tool slugs used by create_l5_tool() (e.g., "rag", "web_search", "pubmed")

Also handles L5 execution and cost rollup.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

# Import the existing L5 factory (absolute import to avoid package resolution issues)
from agents.l5_tools import create_l5_tool, get_tool_config

logger = logging.getLogger(__name__)


# ============================================================================
# MAPPING TABLES
# ============================================================================

# Runner code -> L5 tool slugs (one runner may invoke multiple tools)
RUNNER_TO_L5_TOOLS: Dict[str, List[str]] = {
    # UNDERSTAND category
    "scan": ["rag", "web_search"],
    "map": ["rag"],
    "decompose": [],  # No direct L5 tool, handled by LLM
    "identify_gaps": ["rag"],
    "contextualize": ["rag"],

    # INVESTIGATE category
    "deep_dive": ["rag", "pubmed", "web_search", "clinicaltrials"],
    "research": ["pubmed", "web_search", "rag", "clinicaltrials"],
    "evidence": ["pubmed", "clinicaltrials", "rag", "web_search"],  # Added evidence runner
    "trace_lineage": ["rag"],
    "benchmark": ["web_search", "rag"],

    # SYNTHESIZE category
    "synthesize": [],  # LLM synthesis, no L5 tool
    "integrate": [],
    "distill": [],
    "summarize": [],

    # EVALUATE category
    "evaluate": ["rag"],
    "critique": [],
    "assess_risk": ["rag", "regulatory"],
    "score": [],

    # VALIDATE category
    "validate": ["rag"],
    "fact_check": ["web_search", "pubmed"],
    "compliance_check": ["regulatory", "rag"],
    "cross_reference": ["rag", "pubmed"],

    # WATCH category
    "monitor": ["web_search"],
    "alert": [],
    "competitor_track": ["web_search"],

    # CREATE category
    "draft": [],
    "generate": [],
    "template_fill": [],

    # REFINE category
    "edit": [],
    "optimize": [],
    "polish": [],

    # DECIDE category
    "recommend": ["rag"],
    "prioritize": [],
    "triage": [],
}

# Plan tool names -> L5 tool slug (direct mapping)
PLAN_TOOL_TO_L5: Dict[str, str] = {
    # Literature & Research
    "pubmed_search": "pubmed",
    "literature_search": "pubmed",
    "literature_review": "pubmed",

    # Clinical
    "clinical_trials": "clinical_trials",
    "clinical_trials_gov": "clinical_trials",

    # Regulatory
    "regulatory_lookup": "regulatory",
    "fda_guidance": "regulatory",
    "ema_guidance": "regulatory",

    # RAG & Knowledge Base
    "rag_search": "rag",
    "knowledge_base": "rag",
    "internal_docs": "rag",

    # Web
    "web_search": "web_search",
    "google_search": "web_search",

    # HEOR
    "heor_analysis": "heor",
    "cost_effectiveness": "heor",

    # General
    "general_search": "general",
    "context_analysis": "rag",
}

# L5 tool slug -> category (for grouping)
L5_TOOL_CATEGORIES: Dict[str, str] = {
    "rag": "knowledge",
    "pubmed": "literature",
    "web_search": "web",
    "clinical_trials": "clinical",
    "regulatory": "regulatory",
    "heor": "heor",
    "general": "general",
}


# ============================================================================
# EXECUTION RESULT
# ============================================================================

@dataclass
class L5ExecutionSummary:
    """Aggregated result from L5 tool execution(s)."""
    tool_slugs_called: List[str] = field(default_factory=list)
    total_cost_usd: float = 0.0
    total_execution_time_ms: int = 0
    total_api_calls: int = 0

    # Aggregated outputs
    combined_output: str = ""
    all_sources: List[Dict] = field(default_factory=list)
    raw_results: List[Dict] = field(default_factory=list)

    # Status
    success_count: int = 0
    error_count: int = 0
    errors: List[str] = field(default_factory=list)

    # Token tracking (if available)
    tokens_used: int = 0


# ============================================================================
# L5 TOOL EXECUTOR
# ============================================================================

class L5ToolExecutor:
    """
    Executes L5 tools based on runner codes or plan tool names.

    Handles:
    - Mapping runner/tool names to L5 slugs
    - Executing L5 tools via create_l5_tool()
    - Aggregating costs and results
    - Extracting sources/citations from results
    """

    def __init__(self):
        self._tool_cache: Dict[str, Any] = {}

    def map_runner_to_l5_tools(self, runner_code: str) -> List[str]:
        """Map a runner code to L5 tool slugs."""
        return RUNNER_TO_L5_TOOLS.get(runner_code, [])

    def map_plan_tool_to_l5(self, plan_tool: str) -> Optional[str]:
        """Map a plan tool name to L5 tool slug."""
        slug = PLAN_TOOL_TO_L5.get(plan_tool.lower().replace(" ", "_"))
        return slug

    async def _get_tool(self, slug: str) -> Optional[Any]:
        """Get or create L5 tool instance."""
        if slug not in self._tool_cache:
            try:
                tool = create_l5_tool(slug)
                self._tool_cache[slug] = tool
            except Exception as e:
                logger.error(f"Failed to create L5 tool '{slug}': {e}")
                return None
        return self._tool_cache.get(slug)

    async def execute_tool(
        self,
        slug: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Execute a single L5 tool.
        Returns dict with success, data, cost_usd, execution_time_ms, sources, error.
        """
        tool = await self._get_tool(slug)
        if not tool:
            return {
                "success": False,
                "error": f"Tool '{slug}' not available",
                "data": None,
                "cost_usd": 0.0,
                "execution_time_ms": 0,
                "sources": [],
            }

        start_time = datetime.utcnow()
        try:
            result = await tool.execute(params)
            execution_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Cost from tool config
            cost_usd = 0.0
            try:
                config = get_tool_config(slug)
                if config and hasattr(config, "cost_per_call"):
                    cost_usd = config.cost_per_call or 0.0
            except Exception:
                pass

            # If result carries execution_time_ms, prefer it
            if hasattr(result, "execution_time_ms") and result.execution_time_ms:
                execution_time_ms = result.execution_time_ms

            sources = self._extract_sources(result, slug)

            return {
                "success": getattr(result, "success", True),
                "tool_id": getattr(result, "tool_id", slug),
                "data": getattr(result, "data", result),
                "cost_usd": cost_usd,
                "execution_time_ms": execution_time_ms,
                "sources": sources,
                "cached": getattr(result, "cached", False),
                "metadata": getattr(result, "metadata", {}),
                "error": getattr(result, "error", None),
            }
        except Exception as e:
            execution_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            logger.error(f"L5 tool '{slug}' execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None,
                "cost_usd": 0.0,
                "execution_time_ms": execution_time_ms,
                "sources": [],
            }

    async def execute_for_runner(
        self,
        runner_code: str,
        query: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> L5ExecutionSummary:
        """Execute all L5 tools mapped to a runner code."""
        slugs = self.map_runner_to_l5_tools(runner_code)
        if not slugs:
            return L5ExecutionSummary()
        return await self._execute_multiple(slugs, query, params)

    async def execute_for_plan_tools(
        self,
        plan_tools: List[str],
        query: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> L5ExecutionSummary:
        """Execute L5 tools for a list of plan tool names."""
        slugs: List[str] = []
        for tool_name in plan_tools:
            slug = self.map_plan_tool_to_l5(tool_name)
            if slug and slug not in slugs:
                slugs.append(slug)
        if not slugs:
            return L5ExecutionSummary()
        return await self._execute_multiple(slugs, query, params)

    async def _execute_multiple(
        self,
        slugs: List[str],
        query: str,
        params: Optional[Dict[str, Any]],
    ) -> L5ExecutionSummary:
        summary = L5ExecutionSummary()
        params = params or {}
        tool_params = {"query": query, **params}
        outputs = []

        for slug in slugs:
            result = await self.execute_tool(slug, tool_params)
            summary.tool_slugs_called.append(slug)
            summary.total_execution_time_ms += result.get("execution_time_ms", 0)
            summary.total_cost_usd += result.get("cost_usd", 0.0)
            summary.total_api_calls += 1

            if result.get("success"):
                summary.success_count += 1
                summary.all_sources.extend(result.get("sources", []))
                summary.raw_results.append(
                    {
                        "tool": slug,
                        "data": result.get("data"),
                        "cached": result.get("cached", False),
                    }
                )
                data = result.get("data")
                if data:
                    if isinstance(data, str):
                        outputs.append(f"[{slug}]: {data}")
                    elif isinstance(data, dict):
                        if "response" in data:
                            outputs.append(f"[{slug}]: {data['response']}")
                        elif "results" in data:
                            outputs.append(f"[{slug}]: {len(data['results'])} results found")
                        elif "text" in data:
                            outputs.append(f"[{slug}]: {data['text']}")
            else:
                summary.error_count += 1
                error_msg = result.get("error", "Unknown error")
                summary.errors.append(f"{slug}: {error_msg}")

        summary.combined_output = "\n\n".join(outputs)

        # Deduplicate sources by URL
        seen = set()
        uniq_sources = []
        for source in summary.all_sources:
            url = source.get("url") or source.get("title") or ""
            if url not in seen:
                seen.add(url)
                uniq_sources.append(source)
        summary.all_sources = uniq_sources

        return summary

    def _extract_sources(self, result: Any, tool_slug: str) -> List[Dict]:
        """Extract sources/citations from L5 result data."""
        sources: List[Dict] = []
        data = getattr(result, "data", None)
        if not data:
            return sources

        if isinstance(data, dict):
            if "sources" in data:
                sources.extend(self._normalize_sources(data["sources"], tool_slug))
            if "citations" in data:
                sources.extend(self._normalize_sources(data["citations"], tool_slug))
            if "references" in data:
                sources.extend(self._normalize_sources(data["references"], tool_slug))
            if "results" in data and isinstance(data["results"], list):
                for item in data["results"]:
                    if isinstance(item, dict):
                        source = self._item_to_source(item, tool_slug)
                        if source:
                            sources.append(source)
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    source = self._item_to_source(item, tool_slug)
                    if source:
                        sources.append(source)
        return sources

    def _normalize_sources(self, items: Any, tool_slug: str) -> List[Dict]:
        if not isinstance(items, list):
            return []
        sources: List[Dict] = []
        for item in items:
            if isinstance(item, dict):
                src = self._item_to_source(item, tool_slug)
                if src:
                    sources.append(src)
            elif isinstance(item, str):
                sources.append({"title": item, "source_type": tool_slug})
        return sources

    def _item_to_source(self, item: Dict, tool_slug: str) -> Optional[Dict]:
        title = item.get("title") or item.get("name") or item.get("headline") or item.get("citation")
        if not title:
            return None
        return {
            "title": title,
            "url": item.get("url") or item.get("link") or item.get("href"),
            "source_type": tool_slug,
            "relevance_score": item.get("score") or item.get("relevance") or item.get("rank"),
            "snippet": item.get("snippet") or item.get("abstract") or item.get("description"),
            "metadata": {
                "published": item.get("published") or item.get("date"),
                "authors": item.get("authors") or item.get("author"),
            },
        }


# Convenience accessor
_executor_singleton: Optional[L5ToolExecutor] = None


def get_l5_executor() -> L5ToolExecutor:
    global _executor_singleton
    if _executor_singleton is None:
        _executor_singleton = L5ToolExecutor()
    return _executor_singleton
