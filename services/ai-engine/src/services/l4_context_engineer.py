"""
L4 Context Engineer - Level 4 Worker Agent for Context Aggregation

The L4 Context Engineer is a critical component that:
- Orchestrates multiple L5 tools in parallel
- Aggregates and deduplicates findings
- Compresses context to fit token budget
- Formats findings for parent agent (L1/L2/L3) consumption

Used in Mode 3 (Manual-Autonomous) for thorough research.
Skipped in Mode 1 (Manual-Interactive) for speed.

Configuration Sources:
- Agent metadata: agents.metadata.l4_config
- User input: ResponsePreferences, Mode3UserInput
- Request: token_budget, max_l5_tools overrides

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md

Created: 2025-12-02
"""

from typing import List, Dict, Any, Optional
import asyncio
import time
import structlog

from models.l4_l5_config import (
    L4ContextEngineerConfig,
    L5ToolConfig,
    L5Finding,
    L5ToolResult,
    L4AggregatedContext,
    AggregationStrategy
)
from services.l5_rag_tool import L5RAGToolAgent, get_l5_rag_tool
from services.l5_websearch_tool import L5WebSearchToolAgent, get_l5_websearch_tool

logger = structlog.get_logger()


class L4ContextEngineer:
    """
    Level 4 Context Engineer - Worker agent for context aggregation.

    YOU ARE: An L4 Worker agent (Entry Level) responsible for orchestrating
    L5 tools and aggregating their findings for parent agents.

    YOU DO:
    1. Invoke 2-5 L5 tools in parallel based on config
    2. Aggregate findings from all L5 tools
    3. Deduplicate findings using semantic similarity (threshold from config)
    4. Rank findings by relevance score
    5. Compress context to fit token_budget from config
    6. Format output based on aggregation_strategy from config

    YOU NEVER:
    1. Exceed max_l5_tools from config
    2. Return more than token_budget allows
    3. Include duplicate findings (similarity > deduplication_threshold)
    4. Skip any enabled L5 tools

    LEVEL: 4 (Worker/Entry Level)
    SENIORITY: Entry
    """

    LEVEL = 4
    SENIORITY = "entry"
    AGENT_TYPE = "context_engineer"

    # L5 tool registry
    L5_TOOL_REGISTRY = {
        "rag": "L5RAGToolAgent",
        "websearch": "L5WebSearchToolAgent",
        # Future: "pubmed", "fda", "clinicaltrials"
    }

    def __init__(
        self,
        rag_tool: Optional[L5RAGToolAgent] = None,
        websearch_tool: Optional[L5WebSearchToolAgent] = None
    ):
        """
        Initialize L4 Context Engineer.

        Args:
            rag_tool: L5 RAG tool instance (injected or singleton)
            websearch_tool: L5 WebSearch tool instance (injected or singleton)
        """
        self.rag_tool = rag_tool or get_l5_rag_tool()
        self.websearch_tool = websearch_tool or get_l5_websearch_tool()
        self.execution_count = 0
        self.total_execution_time_ms = 0

        logger.info(
            "l4_context_engineer.initialized",
            level=self.LEVEL,
            available_tools=list(self.L5_TOOL_REGISTRY.keys())
        )

    async def execute(
        self,
        query: str,
        config: L4ContextEngineerConfig,
        l5_configs: Dict[str, L5ToolConfig],
        tenant_id: str,
        parent_agent_id: Optional[str] = None
    ) -> L4AggregatedContext:
        """
        Execute L4 Context Engineer - orchestrate L5 tools and aggregate findings.

        Args:
            query: Search query from parent agent
            config: L4 Context Engineer configuration
            l5_configs: Configuration for each L5 tool (keyed by tool type)
            tenant_id: Tenant ID for scoped search
            parent_agent_id: Parent agent ID for logging

        Returns:
            L4AggregatedContext with deduplicated, ranked findings
        """
        start_time = time.time()
        self.execution_count += 1

        logger.info(
            "l4_context_engineer.execute_start",
            query=query[:100],
            max_l5_tools=config.max_l5_tools,
            token_budget=config.token_budget,
            aggregation_strategy=config.aggregation_strategy.value,
            enabled_l5_tools=list(l5_configs.keys()),
            parent_agent=parent_agent_id
        )

        try:
            # Step 1: Execute L5 tools in parallel
            l5_results = await self._execute_l5_tools_parallel(
                query=query,
                l5_configs=l5_configs,
                tenant_id=tenant_id,
                max_tools=config.max_l5_tools
            )

            # Step 2: Collect all findings from L5 results
            all_findings = self._collect_findings(l5_results)

            logger.info(
                "l4_context_engineer.findings_collected",
                total_findings=len(all_findings),
                by_tool={tool: len([f for f in all_findings if f.source_tool == tool])
                        for tool in l5_configs.keys()}
            )

            # Step 3: Deduplicate findings
            deduplicated = self._deduplicate_findings(
                findings=all_findings,
                threshold=config.deduplication_threshold
            )

            logger.info(
                "l4_context_engineer.findings_deduplicated",
                before=len(all_findings),
                after=len(deduplicated)
            )

            # Step 4: Rank findings by relevance
            ranked = self._rank_findings(deduplicated)

            # Step 5: Compress to token budget
            compressed = self._compress_to_budget(
                findings=ranked,
                token_budget=config.token_budget
            )

            logger.info(
                "l4_context_engineer.findings_compressed",
                before=len(ranked),
                after=len(compressed)
            )

            # Step 6: Generate summary if synthesized strategy
            summary = None
            if config.aggregation_strategy == AggregationStrategy.SYNTHESIZED:
                summary = self._generate_summary(compressed, query)

            # Build aggregated context
            execution_time_ms = int((time.time() - start_time) * 1000)
            self.total_execution_time_ms += execution_time_ms

            # Estimate token count
            token_count = self._estimate_token_count(compressed, summary)

            result = L4AggregatedContext(
                findings=compressed,
                total_sources=len(l5_results),
                tools_used=[tool for tool, result in l5_results.items() if result.success],
                token_count=token_count,
                aggregation_strategy=config.aggregation_strategy.value,
                summary=summary
            )

            logger.info(
                "l4_context_engineer.execute_success",
                num_findings=len(compressed),
                token_count=token_count,
                tools_used=result.tools_used,
                execution_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return result

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)

            logger.error(
                "l4_context_engineer.execute_error",
                error=str(e),
                error_type=type(e).__name__,
                execution_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            # Return empty context on error
            return L4AggregatedContext(
                findings=[],
                total_sources=0,
                tools_used=[],
                token_count=0,
                aggregation_strategy=config.aggregation_strategy.value,
                summary=f"Error aggregating context: {str(e)}"
            )

    async def _execute_l5_tools_parallel(
        self,
        query: str,
        l5_configs: Dict[str, L5ToolConfig],
        tenant_id: str,
        max_tools: int
    ) -> Dict[str, L5ToolResult]:
        """
        Execute L5 tools in parallel.

        Args:
            query: Search query
            l5_configs: Tool configurations
            tenant_id: Tenant ID
            max_tools: Max tools to execute

        Returns:
            Dict mapping tool type to result
        """
        # Limit to max_tools
        enabled_tools = {k: v for k, v in l5_configs.items() if v.enabled}
        tools_to_execute = list(enabled_tools.items())[:max_tools]

        logger.info(
            "l4_context_engineer.executing_l5_tools",
            tools=list(dict(tools_to_execute).keys())
        )

        # Create tasks for parallel execution
        tasks = []
        tool_order = []

        for tool_type, config in tools_to_execute:
            if tool_type == "rag":
                task = self.rag_tool.execute(
                    query=query,
                    config=config,
                    tenant_id=tenant_id,
                    parent_agent_id=f"l4_context_engineer_{self.execution_count}"
                )
            elif tool_type == "websearch":
                task = self.websearch_tool.execute(
                    query=query,
                    config=config,
                    tenant_id=tenant_id,
                    parent_agent_id=f"l4_context_engineer_{self.execution_count}"
                )
            else:
                # Skip unknown tools
                logger.warning(
                    "l4_context_engineer.unknown_tool",
                    tool_type=tool_type
                )
                continue

            tasks.append(task)
            tool_order.append(tool_type)

        # Execute all tasks in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        tool_results: Dict[str, L5ToolResult] = {}
        for i, result in enumerate(results):
            tool_type = tool_order[i]

            if isinstance(result, Exception):
                logger.error(
                    "l4_context_engineer.l5_tool_exception",
                    tool=tool_type,
                    error=str(result)
                )
                tool_results[tool_type] = L5ToolResult(
                    tool_type=tool_type,
                    success=False,
                    findings=[],
                    execution_time_ms=0,
                    error=str(result)
                )
            else:
                tool_results[tool_type] = result

        return tool_results

    def _collect_findings(
        self,
        l5_results: Dict[str, L5ToolResult]
    ) -> List[L5Finding]:
        """Collect all findings from L5 results."""
        all_findings: List[L5Finding] = []

        for tool_type, result in l5_results.items():
            if result.success:
                all_findings.extend(result.findings)
            else:
                logger.warning(
                    "l4_context_engineer.tool_failed",
                    tool=tool_type,
                    error=result.error
                )

        return all_findings

    def _deduplicate_findings(
        self,
        findings: List[L5Finding],
        threshold: float
    ) -> List[L5Finding]:
        """
        Deduplicate findings using simple text similarity.

        For production, consider using embedding-based semantic similarity.

        Args:
            findings: List of findings to deduplicate
            threshold: Similarity threshold (0-1)

        Returns:
            Deduplicated findings
        """
        if not findings:
            return []

        deduplicated: List[L5Finding] = []
        seen_content_hashes = set()

        for finding in findings:
            # Simple content hash for deduplication
            content_hash = self._content_hash(finding.title, finding.content)

            # Check for similar content
            is_duplicate = False
            for seen_hash in seen_content_hashes:
                if self._simple_similarity(content_hash, seen_hash) >= threshold:
                    is_duplicate = True
                    break

            if not is_duplicate:
                deduplicated.append(finding)
                seen_content_hashes.add(content_hash)

        return deduplicated

    def _content_hash(self, title: str, content: str) -> str:
        """Create a simple content hash for deduplication."""
        # Normalize and create key words
        text = f"{title} {content}".lower()
        words = set(text.split())
        # Remove common words
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for'}
        words = words - stopwords
        return ' '.join(sorted(words)[:20])  # Use top 20 words

    def _simple_similarity(self, hash1: str, hash2: str) -> float:
        """Calculate simple word overlap similarity."""
        words1 = set(hash1.split())
        words2 = set(hash2.split())

        if not words1 or not words2:
            return 0.0

        intersection = len(words1 & words2)
        union = len(words1 | words2)

        return intersection / union if union > 0 else 0.0

    def _rank_findings(self, findings: List[L5Finding]) -> List[L5Finding]:
        """Rank findings by relevance score (descending)."""
        return sorted(findings, key=lambda f: f.relevance_score, reverse=True)

    def _compress_to_budget(
        self,
        findings: List[L5Finding],
        token_budget: int
    ) -> List[L5Finding]:
        """
        Compress findings to fit within token budget.

        Args:
            findings: Ranked findings
            token_budget: Maximum token budget

        Returns:
            Findings that fit within budget
        """
        compressed: List[L5Finding] = []
        current_tokens = 0

        for finding in findings:
            # Estimate tokens for this finding
            finding_tokens = self._estimate_finding_tokens(finding)

            if current_tokens + finding_tokens <= token_budget:
                compressed.append(finding)
                current_tokens += finding_tokens
            else:
                # Try to fit with truncated content
                remaining_budget = token_budget - current_tokens
                if remaining_budget > 100:  # Minimum useful content
                    truncated = self._truncate_finding(finding, remaining_budget)
                    compressed.append(truncated)
                break

        return compressed

    def _estimate_finding_tokens(self, finding: L5Finding) -> int:
        """Estimate token count for a finding (rough: ~4 chars per token)."""
        text_length = len(finding.title) + len(finding.content) + len(finding.citation or "")
        return int(text_length / 4)

    def _estimate_token_count(
        self,
        findings: List[L5Finding],
        summary: Optional[str]
    ) -> int:
        """Estimate total token count."""
        finding_tokens = sum(self._estimate_finding_tokens(f) for f in findings)
        summary_tokens = len(summary) // 4 if summary else 0
        return finding_tokens + summary_tokens

    def _truncate_finding(self, finding: L5Finding, max_tokens: int) -> L5Finding:
        """Truncate finding content to fit token limit."""
        max_chars = max_tokens * 4
        truncated_content = finding.content[:max_chars]
        if len(finding.content) > max_chars:
            truncated_content = truncated_content + "..."

        return L5Finding(
            source_tool=finding.source_tool,
            title=finding.title,
            content=truncated_content,
            relevance_score=finding.relevance_score,
            citation=finding.citation,
            source_url=finding.source_url,
            source_type=finding.source_type,
            metadata={**finding.metadata, 'truncated': True}
        )

    def _generate_summary(
        self,
        findings: List[L5Finding],
        query: str
    ) -> str:
        """
        Generate a brief summary of findings.

        For production, consider using LLM for better synthesis.

        Args:
            findings: Compressed findings
            query: Original query

        Returns:
            Summary string
        """
        if not findings:
            return f"No relevant findings for: {query}"

        summary_parts = [
            f"Found {len(findings)} relevant sources for: \"{query[:100]}\"",
            ""
        ]

        # Group by source tool
        by_tool: Dict[str, List[L5Finding]] = {}
        for f in findings:
            tool = f.source_tool
            if tool not in by_tool:
                by_tool[tool] = []
            by_tool[tool].append(f)

        for tool, tool_findings in by_tool.items():
            summary_parts.append(f"**{tool.upper()}** ({len(tool_findings)} results):")
            for f in tool_findings[:3]:  # Top 3 per tool
                summary_parts.append(f"  - {f.title} (relevance: {f.relevance_score:.2f})")

        return "\n".join(summary_parts)

    def get_stats(self) -> Dict[str, Any]:
        """Get L4 Context Engineer execution statistics."""
        return {
            'agent_type': self.AGENT_TYPE,
            'level': self.LEVEL,
            'execution_count': self.execution_count,
            'total_execution_time_ms': self.total_execution_time_ms,
            'avg_execution_time_ms': (
                self.total_execution_time_ms / self.execution_count
                if self.execution_count > 0 else 0
            ),
            'available_l5_tools': list(self.L5_TOOL_REGISTRY.keys())
        }


# =============================================================================
# Factory Functions
# =============================================================================

_l4_context_engineer: Optional[L4ContextEngineer] = None


def get_l4_context_engineer() -> L4ContextEngineer:
    """Get or create L4 Context Engineer singleton."""
    global _l4_context_engineer
    if _l4_context_engineer is None:
        _l4_context_engineer = L4ContextEngineer()
    return _l4_context_engineer


def create_l4_config_from_agent(
    agent_metadata: Dict[str, Any],
    user_depth: str = "standard"
) -> L4ContextEngineerConfig:
    """
    Create L4ContextEngineerConfig from agent metadata.

    Args:
        agent_metadata: Agent's metadata JSONB field
        user_depth: User's response depth preference (for budget scaling)

    Returns:
        L4ContextEngineerConfig with resolved values
    """
    l4_config = agent_metadata.get('l4_config', {})

    # Get base token budget from agent config
    base_budget = l4_config.get('token_budget', 4000)

    # Scale by user depth preference
    depth_multipliers = {
        "concise": 0.5,
        "standard": 1.0,
        "comprehensive": 1.5
    }
    multiplier = depth_multipliers.get(user_depth, 1.0)
    token_budget = int(base_budget * multiplier)

    # Get aggregation strategy
    strategy_str = l4_config.get('aggregation_strategy', 'synthesized')
    try:
        aggregation_strategy = AggregationStrategy(strategy_str)
    except ValueError:
        aggregation_strategy = AggregationStrategy.SYNTHESIZED

    return L4ContextEngineerConfig(
        enabled=l4_config.get('enabled', True),
        max_l5_tools=l4_config.get('max_l5_tools', 3),
        token_budget=token_budget,
        aggregation_strategy=aggregation_strategy,
        deduplication_threshold=l4_config.get('deduplication_threshold', 0.85)
    )


def create_l5_configs_from_agent(
    agent_metadata: Dict[str, Any],
    knowledge_namespaces: Optional[List[str]] = None,
    user_enabled_tools: Optional[List[str]] = None,
    mode1: bool = False
) -> Dict[str, L5ToolConfig]:
    """
    Create L5ToolConfig dict from agent metadata.

    Args:
        agent_metadata: Agent's metadata JSONB field
        knowledge_namespaces: Agent's assigned RAG namespaces
        user_enabled_tools: User-selected L5 tools (overrides agent config)
        mode1: Whether this is Mode 1 (applies speed limits)

    Returns:
        Dict mapping tool type to L5ToolConfig
    """
    l5_config = agent_metadata.get('l5_config', {})
    configs: Dict[str, L5ToolConfig] = {}

    # Get max_findings (Mode 1 capped at 3)
    max_findings = l5_config.get('max_findings_per_tool', 5)
    if mode1:
        max_findings = min(max_findings, 3)

    # Get timeout (Mode 1: 500ms)
    timeout_ms = l5_config.get('timeout_ms', 3000)
    if mode1:
        timeout_ms = 500

    # Determine which tools are enabled
    if user_enabled_tools:
        # User override
        enabled_tools = user_enabled_tools
    else:
        # From agent config
        enabled_tools = []
        if l5_config.get('rag_enabled', True):
            enabled_tools.append('rag')
        if l5_config.get('websearch_enabled', True):
            enabled_tools.append('websearch')
        if l5_config.get('pubmed_enabled', False):
            enabled_tools.append('pubmed')
        if l5_config.get('fda_enabled', False):
            enabled_tools.append('fda')

    # Create configs for each enabled tool
    if 'rag' in enabled_tools:
        configs['rag'] = L5ToolConfig(
            tool_type='rag',
            enabled=True,
            max_findings=max_findings,
            timeout_ms=timeout_ms,
            namespaces=knowledge_namespaces or []
        )

    if 'websearch' in enabled_tools:
        configs['websearch'] = L5ToolConfig(
            tool_type='websearch',
            enabled=True,
            max_findings=max_findings,
            timeout_ms=timeout_ms
        )

    # Future tools (disabled by default)
    if 'pubmed' in enabled_tools:
        configs['pubmed'] = L5ToolConfig(
            tool_type='pubmed',
            enabled=True,
            max_findings=max_findings,
            timeout_ms=timeout_ms
        )

    if 'fda' in enabled_tools:
        configs['fda'] = L5ToolConfig(
            tool_type='fda',
            enabled=True,
            max_findings=max_findings,
            timeout_ms=timeout_ms
        )

    return configs
