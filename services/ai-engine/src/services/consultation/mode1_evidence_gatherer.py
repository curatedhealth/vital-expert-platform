"""
Mode 1 Evidence Gatherer - Parallel L5 Execution for Evidence-Based Responses

A lightweight orchestrator for Mode 1 that:
- Executes L5 RAG and L5 WebSearch in parallel
- Enforces 3-second total timeout (shared budget)
- Implements graceful degradation (continue if one tool fails)
- FALLBACK: If RAG returns empty, uses PubMed for scientific citations
- Deduplicates and ranks findings
- Returns evidence for grounding LLM responses (no hallucination)

This is optimized for Mode 1's 3-5 second response time requirement.
For full L4 Context Engineer with ReAct loops, see l4_context_engineer.py.

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md

Created: 2025-12-02
Updated: 2025-12-03 - Added PubMed fallback when RAG returns empty
"""

from typing import List, Dict, Any, Optional, Tuple
import asyncio
import time
import structlog

from models.l4_l5_config import (
    Mode1Config,
    L5ToolConfig,
    L5Finding,
    L5ToolResult,
    L4AggregatedContext
)
# Import L5 Tools from the shared agents module
from agents.tools import (
    L5BaseTool,
    create_l5_tool,
    LITERATURE_TOOL_CONFIGS,
    GENERAL_TOOL_CONFIGS,
)
from agents.tools.l5_general import GeneralL5Tool
from agents.tools.l5_literature import LiteratureL5Tool

logger = structlog.get_logger()


class Mode1EvidenceGatherer:
    """
    Lightweight evidence gatherer for Mode 1 (Manual-Interactive).

    Executes L5 RAG and L5 WebSearch in PARALLEL with shared timeout.
    Optimized for speed while ensuring evidence-based responses.

    YOU ARE: A fast evidence collector for Mode 1 chat
    YOU DO:
    1. Execute RAG + WebSearch in parallel (asyncio.gather)
    2. Apply shared 3-second timeout budget
    3. Implement graceful degradation (one can fail)
    4. Deduplicate findings by content similarity
    5. Rank findings by relevance and source authority
    6. Return combined evidence for LLM grounding

    YOU NEVER:
    1. Block on sequential execution (always parallel)
    2. Exceed the timeout budget (fail gracefully)
    3. Return duplicate findings
    4. Proceed without any evidence (require minimum 1 source)
    """

    # Evidence source weights for ranking (by level of trust)
    SOURCE_LEVEL_WEIGHTS = {
        "regulatory": 1.0,       # FDA, EMA, WHO
        "scientific": 0.95,      # PubMed, peer-reviewed
        "clinical_trial": 0.90,  # ClinicalTrials.gov
        "health_authority": 0.85,# CDC, NIH
        "rag": 0.80,             # Internal knowledge base
        "web": 0.70              # General web sources
    }

    def __init__(
        self,
        l5_rag_tool: Optional[L5BaseTool] = None,
        l5_websearch_tool: Optional[L5BaseTool] = None,
        l5_pubmed_tool: Optional[L5BaseTool] = None
    ):
        """
        Initialize Mode 1 Evidence Gatherer.

        Args:
            l5_rag_tool: L5 RAG tool agent (uses factory if not provided)
            l5_websearch_tool: L5 WebSearch tool agent (uses factory if not provided)
            l5_pubmed_tool: L5 PubMed tool agent for fallback (uses factory if not provided)
        """
        # Use the shared L5 tool factory from agents module
        self.l5_rag_tool = l5_rag_tool or create_l5_tool("rag")
        self.l5_websearch_tool = l5_websearch_tool or create_l5_tool("web_search")
        self.l5_pubmed_tool = l5_pubmed_tool or create_l5_tool("pubmed")
        self.execution_count = 0
        self.total_execution_time_ms = 0

        logger.info(
            "mode1_evidence_gatherer.initialized",
            has_rag_tool=bool(self.l5_rag_tool),
            has_websearch_tool=bool(self.l5_websearch_tool),
            has_pubmed_tool=bool(self.l5_pubmed_tool)
        )

    async def gather_evidence(
        self,
        query: str,
        config: Mode1Config,
        tenant_id: str,
        agent_id: Optional[str] = None
    ) -> L4AggregatedContext:
        """
        Gather evidence from RAG and WebSearch in parallel.

        Both tools are MANDATORY. They execute in parallel with a shared
        3-second timeout. Implements graceful degradation - if one tool
        fails but the other succeeds, we continue with partial evidence.

        Args:
            query: User query to search for
            config: Mode 1 configuration
            tenant_id: Tenant ID for RAG namespace filtering
            agent_id: Agent ID for logging

        Returns:
            L4AggregatedContext with deduplicated, ranked findings

        Raises:
            EvidenceNotFoundError: If both tools fail and no evidence available
        """
        start_time = time.time()
        self.execution_count += 1

        logger.info(
            "mode1_evidence_gatherer.gather_start",
            query=query[:100],
            tenant_id=tenant_id,
            agent_id=agent_id,
            timeout_ms=config.l5_parallel_timeout_ms,
            require_evidence=config.require_evidence
        )

        # Create L5 tool configs
        rag_config = L5ToolConfig(
            tool_type="rag",
            enabled=True,
            max_findings=config.l5_max_findings_per_tool,
            timeout_ms=config.l5_parallel_timeout_ms,
            namespaces=config.l5_namespaces
        )

        websearch_config = L5ToolConfig(
            tool_type="websearch",
            enabled=True,
            max_findings=config.l5_max_findings_per_tool,
            timeout_ms=config.l5_parallel_timeout_ms
        )

        # Execute both tools in parallel with shared timeout
        try:
            rag_result, websearch_result = await asyncio.wait_for(
                self._execute_parallel(
                    query=query,
                    rag_config=rag_config,
                    websearch_config=websearch_config,
                    tenant_id=tenant_id,
                    agent_id=agent_id
                ),
                timeout=config.l5_parallel_timeout_ms / 1000.0
            )
        except asyncio.TimeoutError:
            execution_time_ms = int((time.time() - start_time) * 1000)
            logger.warning(
                "mode1_evidence_gatherer.timeout",
                timeout_ms=config.l5_parallel_timeout_ms,
                actual_time_ms=execution_time_ms
            )

            # Return empty context if timeout (no partial results in this case)
            return self._create_empty_context(
                error=f"Evidence gathering timed out after {config.l5_parallel_timeout_ms}ms"
            )

        # Check if we have any evidence (graceful degradation)
        rag_success = rag_result.success and len(rag_result.findings) > 0
        websearch_success = websearch_result.success and len(websearch_result.findings) > 0

        # =============================================================
        # FALLBACK: If RAG + WebSearch both return empty, use PubMed
        # =============================================================
        pubmed_result: Optional[L5ToolResult] = None
        pubmed_success = False

        if not rag_success and not websearch_success:
            logger.warning(
                "mode1_evidence_gatherer.primary_sources_empty",
                rag_error=rag_result.error,
                websearch_error=websearch_result.error,
                triggering_fallback="pubmed"
            )

            # Execute PubMed fallback search
            try:
                # Create config for PubMed fallback
                from agents.tools.l5_base import ToolConfig
                pubmed_tool_config = ToolConfig(
                    id="pubmed_fallback",
                    slug="pubmed",
                    name="PubMed Literature Search",
                    description="Scientific literature fallback search"
                )

                pubmed_result = await asyncio.wait_for(
                    self.l5_pubmed_tool.execute(
                        query=query,
                        config=pubmed_config,
                        tenant_id=tenant_id,
                        parent_agent_id=agent_id
                    ),
                    timeout=2.0  # 2 second hard limit
                )

                pubmed_success = pubmed_result.success and len(pubmed_result.findings) > 0

                logger.info(
                    "mode1_evidence_gatherer.pubmed_fallback",
                    success=pubmed_success,
                    findings_count=len(pubmed_result.findings) if pubmed_result else 0
                )

            except asyncio.TimeoutError:
                logger.warning("mode1_evidence_gatherer.pubmed_fallback_timeout")
                pubmed_result = L5ToolResult(
                    tool_type="pubmed",
                    success=False,
                    findings=[],
                    execution_time_ms=2000,
                    error="PubMed fallback timed out"
                )
            except Exception as e:
                logger.error("mode1_evidence_gatherer.pubmed_fallback_error", error=str(e))
                pubmed_result = L5ToolResult(
                    tool_type="pubmed",
                    success=False,
                    findings=[],
                    execution_time_ms=0,
                    error=f"PubMed fallback failed: {str(e)}"
                )

        # If ALL sources failed (including fallback), handle error
        if not rag_success and not websearch_success and not pubmed_success:
            execution_time_ms = int((time.time() - start_time) * 1000)
            logger.error(
                "mode1_evidence_gatherer.no_evidence_all_sources",
                rag_error=rag_result.error,
                websearch_error=websearch_result.error,
                pubmed_error=pubmed_result.error if pubmed_result else "not attempted",
                execution_time_ms=execution_time_ms
            )

            if config.require_evidence:
                # Return context with error - let caller decide how to handle
                return self._create_empty_context(
                    error="No evidence found from any source (RAG, WebSearch, PubMed). Cannot provide evidence-based response."
                )

        # Collect all findings from all sources
        all_findings: List[L5Finding] = []
        tools_used: List[str] = []

        if rag_success:
            all_findings.extend(rag_result.findings)
            tools_used.append("rag")

        if websearch_success:
            all_findings.extend(websearch_result.findings)
            tools_used.append("websearch")

        # Include PubMed fallback results
        if pubmed_success and pubmed_result:
            all_findings.extend(pubmed_result.findings)
            tools_used.append("pubmed")

        # Deduplicate findings
        deduped_findings = self._deduplicate_findings(all_findings)

        # Rank findings by relevance and source authority
        ranked_findings = self._rank_findings(deduped_findings)

        # Calculate execution time
        execution_time_ms = int((time.time() - start_time) * 1000)
        self.total_execution_time_ms += execution_time_ms

        logger.info(
            "mode1_evidence_gatherer.gather_complete",
            total_findings=len(ranked_findings),
            rag_findings=len(rag_result.findings) if rag_success else 0,
            websearch_findings=len(websearch_result.findings) if websearch_success else 0,
            pubmed_findings=len(pubmed_result.findings) if pubmed_success and pubmed_result else 0,
            tools_used=tools_used,
            execution_time_ms=execution_time_ms,
            used_pubmed_fallback=pubmed_success
        )

        return L4AggregatedContext(
            findings=ranked_findings,
            total_sources=len(tools_used),
            tools_used=tools_used,
            token_count=self._estimate_token_count(ranked_findings),
            aggregation_strategy="ranked_list",
            summary=None  # Mode 1 doesn't generate summaries (too slow)
        )

    async def _execute_parallel(
        self,
        query: str,
        rag_config: L5ToolConfig,
        websearch_config: L5ToolConfig,
        tenant_id: str,
        agent_id: Optional[str]
    ) -> Tuple[L5ToolResult, L5ToolResult]:
        """
        Execute RAG and WebSearch tools in parallel.

        Uses asyncio.gather with return_exceptions=True to allow
        graceful degradation if one tool fails.

        Args:
            query: Search query
            rag_config: RAG tool configuration
            websearch_config: WebSearch tool configuration
            tenant_id: Tenant ID
            agent_id: Agent ID for logging

        Returns:
            Tuple of (rag_result, websearch_result)
        """
        # Create coroutines for parallel execution
        rag_coro = self.l5_rag_tool.execute(
            query=query,
            config=rag_config,
            tenant_id=tenant_id,
            parent_agent_id=agent_id
        )

        websearch_coro = self.l5_websearch_tool.execute(
            query=query,
            config=websearch_config,
            tenant_id=tenant_id,
            parent_agent_id=agent_id
        )

        # Execute in parallel with exception handling
        results = await asyncio.gather(
            rag_coro,
            websearch_coro,
            return_exceptions=True
        )

        # Process results, converting exceptions to error results
        rag_result = self._process_result(results[0], "rag")
        websearch_result = self._process_result(results[1], "websearch")

        return rag_result, websearch_result

    def _process_result(
        self,
        result: Any,
        tool_type: str
    ) -> L5ToolResult:
        """
        Process a result from asyncio.gather, handling exceptions.

        Args:
            result: Result or exception from gather
            tool_type: Tool type for error reporting

        Returns:
            L5ToolResult (success or error)
        """
        if isinstance(result, Exception):
            logger.error(
                f"mode1_evidence_gatherer.{tool_type}_exception",
                error=str(result),
                error_type=type(result).__name__
            )
            return L5ToolResult(
                tool_type=tool_type,
                success=False,
                findings=[],
                execution_time_ms=0,
                error=f"{tool_type} failed: {str(result)}"
            )
        return result

    def _deduplicate_findings(
        self,
        findings: List[L5Finding]
    ) -> List[L5Finding]:
        """
        Deduplicate findings based on content similarity.

        Uses simple word overlap for speed (Mode 1 constraint).
        For more accurate deduplication, see L4 Context Engineer.

        Args:
            findings: List of findings to deduplicate

        Returns:
            Deduplicated list of findings
        """
        if len(findings) <= 1:
            return findings

        deduped: List[L5Finding] = []
        seen_content_hashes: set = set()

        for finding in findings:
            # Create simple hash from content words
            content_words = set(finding.content.lower().split()[:50])
            content_hash = frozenset(content_words)

            # Check for significant overlap with existing findings
            is_duplicate = False
            for seen_hash in seen_content_hashes:
                overlap = len(content_hash & seen_hash)
                total = len(content_hash | seen_hash)
                if total > 0 and overlap / total > 0.7:  # 70% overlap threshold
                    is_duplicate = True
                    break

            if not is_duplicate:
                deduped.append(finding)
                seen_content_hashes.add(content_hash)

        logger.debug(
            "mode1_evidence_gatherer.deduplicated",
            original_count=len(findings),
            deduped_count=len(deduped)
        )

        return deduped

    def _rank_findings(
        self,
        findings: List[L5Finding]
    ) -> List[L5Finding]:
        """
        Rank findings by relevance score and source authority.

        Scoring formula:
        final_score = relevance_score * source_level_weight

        Args:
            findings: Deduplicated findings to rank

        Returns:
            Findings sorted by final score (descending)
        """
        def get_final_score(finding: L5Finding) -> float:
            source_type = finding.source_type or "web"
            level_weight = self.SOURCE_LEVEL_WEIGHTS.get(source_type, 0.5)
            return finding.relevance_score * level_weight

        return sorted(findings, key=get_final_score, reverse=True)

    def _estimate_token_count(
        self,
        findings: List[L5Finding]
    ) -> int:
        """
        Estimate token count for findings.

        Uses simple word count approximation: ~1.3 tokens per word.

        Args:
            findings: List of findings

        Returns:
            Estimated token count
        """
        total_words = sum(
            len(f.title.split()) + len(f.content.split())
            for f in findings
        )
        return int(total_words * 1.3)

    def _create_empty_context(
        self,
        error: Optional[str] = None
    ) -> L4AggregatedContext:
        """
        Create empty context for error cases.

        Args:
            error: Error message

        Returns:
            Empty L4AggregatedContext
        """
        return L4AggregatedContext(
            findings=[],
            total_sources=0,
            tools_used=[],
            token_count=0,
            aggregation_strategy="none",
            summary=error
        )

    def get_stats(self) -> Dict[str, Any]:
        """Get execution statistics."""
        return {
            'execution_count': self.execution_count,
            'total_execution_time_ms': self.total_execution_time_ms,
            'avg_execution_time_ms': (
                self.total_execution_time_ms / self.execution_count
                if self.execution_count > 0 else 0
            )
        }


# =============================================================================
# Factory Function
# =============================================================================

_mode1_evidence_gatherer: Optional[Mode1EvidenceGatherer] = None


def get_mode1_evidence_gatherer() -> Mode1EvidenceGatherer:
    """Get or create Mode1EvidenceGatherer singleton."""
    global _mode1_evidence_gatherer
    if _mode1_evidence_gatherer is None:
        _mode1_evidence_gatherer = Mode1EvidenceGatherer()
    return _mode1_evidence_gatherer


async def gather_mode1_evidence(
    query: str,
    config: Mode1Config,
    tenant_id: str,
    agent_id: Optional[str] = None
) -> L4AggregatedContext:
    """
    Convenience function to gather evidence for Mode 1.

    Args:
        query: User query
        config: Mode 1 configuration
        tenant_id: Tenant ID
        agent_id: Agent ID for logging

    Returns:
        L4AggregatedContext with evidence
    """
    gatherer = get_mode1_evidence_gatherer()
    return await gatherer.gather_evidence(
        query=query,
        config=config,
        tenant_id=tenant_id,
        agent_id=agent_id
    )
