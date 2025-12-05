"""
L5 RAG Tool Agent - Level 5 Knowledge Base Retrieval

A specialized L5 (Tool/Intern level) agent that:
- Fetches from parent agent's assigned RAG namespaces
- Returns top N formatted findings with citations (not raw chunks)
- Respects configurable timeout (500ms for Mode 1, 3000ms for Mode 3)
- Can be invoked in parallel with other L5 tools by L4 Context Engineer
- Implements retry logic with tenacity for resilience

Configuration Sources:
- Agent metadata: agents.metadata.l5_config, agents.knowledge_namespaces
- User input: ResponsePreferences, enable_rag
- Request: max_findings, timeout_ms overrides

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md

Created: 2025-12-02
Updated: 2025-12-02 - Added tenacity retry logic for RAG service resilience
"""

from typing import List, Dict, Any, Optional, Union
import asyncio
import time
import structlog
from pydantic import UUID4
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    RetryError
)

from models.l4_l5_config import L5Finding, L5ToolResult, L5ToolConfig
from services.unified_rag_service import UnifiedRAGService

logger = structlog.get_logger()


# Retry configuration for RAG service calls
RAG_RETRY_CONFIG = {
    "stop": stop_after_attempt(3),  # Max 3 attempts
    "wait": wait_exponential(multiplier=0.3, min=0.3, max=1.5),  # 0.3s, 0.6s, 1.2s backoff
    "retry": retry_if_exception_type((ConnectionError, TimeoutError, Exception)),
    "before_sleep": before_sleep_log(logger, log_level=20)  # INFO level
}


class L5RAGToolAgent:
    """
    Level 5 RAG Tool Agent - Single-function knowledge retrieval utility.

    YOU ARE: An L5 Tool agent specialized in retrieving relevant documents
    from the internal knowledge base using RAG (Retrieval Augmented Generation).

    YOU DO:
    1. Search assigned namespaces from parent agent's knowledge_namespaces
    2. Return top N findings (configurable, default 5) with formatted citations
    3. Score findings by relevance
    4. Respect timeout limits (500ms Mode 1, configurable Mode 3)
    5. Format output for parent agent consumption (not raw chunks)

    YOU NEVER:
    1. Search namespaces not assigned to parent agent
    2. Return more findings than max_findings config
    3. Exceed timeout_ms - fail gracefully instead
    4. Return raw document chunks - always format with citations
    """

    TOOL_TYPE = "rag"
    LEVEL = 5
    SENIORITY = "intern"

    def __init__(
        self,
        rag_service: Optional[UnifiedRAGService] = None
    ):
        """
        Initialize L5 RAG Tool Agent.

        Args:
            rag_service: UnifiedRAGService instance (injected).
                        For production use, inject via dependency injection.
                        For tests, mock the service.
        """
        self.rag_service = rag_service
        self.execution_count = 0
        self.total_execution_time_ms = 0

        logger.info(
            "l5_rag_tool.initialized",
            tool_type=self.TOOL_TYPE,
            level=self.LEVEL,
            has_rag_service=rag_service is not None
        )

    async def execute(
        self,
        query: str,
        config: L5ToolConfig,
        tenant_id: str,
        parent_agent_id: Optional[str] = None
    ) -> L5ToolResult:
        """
        Execute RAG search and return formatted findings.

        Args:
            query: Search query from parent agent
            config: L5 tool configuration (from agent metadata + user input)
            tenant_id: Tenant ID for scoped search
            parent_agent_id: Parent agent ID for logging

        Returns:
            L5ToolResult with formatted findings and execution metadata
        """
        start_time = time.time()
        self.execution_count += 1

        logger.info(
            "l5_rag_tool.execute_start",
            query=query[:100],
            namespaces=config.namespaces,
            max_findings=config.max_findings,
            timeout_ms=config.timeout_ms,
            parent_agent=parent_agent_id
        )

        try:
            # Execute with timeout
            findings = await asyncio.wait_for(
                self._search_and_format(query, config, tenant_id),
                timeout=config.timeout_ms / 1000.0  # Convert to seconds
            )

            execution_time_ms = int((time.time() - start_time) * 1000)
            self.total_execution_time_ms += execution_time_ms

            logger.info(
                "l5_rag_tool.execute_success",
                num_findings=len(findings),
                execution_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return L5ToolResult(
                tool_type=self.TOOL_TYPE,
                success=True,
                findings=findings,
                execution_time_ms=execution_time_ms
            )

        except asyncio.TimeoutError:
            execution_time_ms = int((time.time() - start_time) * 1000)

            logger.warning(
                "l5_rag_tool.timeout",
                timeout_ms=config.timeout_ms,
                actual_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return L5ToolResult(
                tool_type=self.TOOL_TYPE,
                success=False,
                findings=[],
                execution_time_ms=execution_time_ms,
                error=f"RAG search timed out after {config.timeout_ms}ms"
            )

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)

            logger.error(
                "l5_rag_tool.execute_error",
                error=str(e),
                error_type=type(e).__name__,
                execution_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return L5ToolResult(
                tool_type=self.TOOL_TYPE,
                success=False,
                findings=[],
                execution_time_ms=execution_time_ms,
                error=f"RAG search failed: {str(e)}"
            )

    async def _search_and_format(
        self,
        query: str,
        config: L5ToolConfig,
        tenant_id: str
    ) -> List[L5Finding]:
        """
        Execute RAG search and format results as L5Finding objects.

        Uses retry logic for resilience against transient failures.

        Args:
            query: Search query
            config: Tool configuration
            tenant_id: Tenant ID

        Returns:
            List of formatted L5Finding objects
        """
        # Convert tenant_id to UUID if string
        if isinstance(tenant_id, str):
            try:
                tenant_uuid = UUID4(tenant_id)
            except Exception:
                tenant_uuid = tenant_id
        else:
            tenant_uuid = tenant_id

        # Execute RAG search with retry logic
        try:
            results = await self._execute_rag_search_with_retry(
                query=query,
                tenant_uuid=tenant_uuid,
                namespaces=config.namespaces,
                max_findings=config.max_findings
            )
        except RetryError as e:
            logger.error(
                "l5_rag_tool.retry_exhausted",
                error=str(e.last_attempt.exception()) if e.last_attempt.exception() else "Unknown",
                attempts=e.last_attempt.attempt_number
            )
            return []

        documents = results.get('documents', [])

        # Format as L5Finding objects
        findings: List[L5Finding] = []
        for doc in documents[:config.max_findings]:
            finding = self._format_document_to_finding(doc)
            findings.append(finding)

        # Sort by relevance score
        findings.sort(key=lambda f: f.relevance_score, reverse=True)

        return findings

    @retry(**RAG_RETRY_CONFIG)
    async def _execute_rag_search_with_retry(
        self,
        query: str,
        tenant_uuid: Any,
        namespaces: Optional[List[str]],
        max_findings: int
    ) -> Dict[str, Any]:
        """
        Internal method with retry decorator for RAG service calls.

        Retries up to 3 times with exponential backoff (0.3s, 0.6s, 1.2s).

        Uses UnifiedRAGService.query() with "true_hybrid" strategy:
        - Pinecone for vector similarity
        - Postgres for metadata and full-text search
        - Neo4j for knowledge graph relationships
        """
        result = await self.rag_service.query(
            query_text=query,
            tenant_id=str(tenant_uuid) if tenant_uuid else None,
            domain_ids=namespaces,
            max_results=max_findings,
            strategy="true_hybrid",  # Use full hybrid: Neo4j + Pinecone + Postgres
            similarity_threshold=0.7
        )

        # UnifiedRAGService returns {'sources': [...], 'context': '...', 'metadata': {...}}
        # Convert to format expected by _search_and_format: {'documents': [...]}
        return {
            'documents': result.get('sources', []),
            'context': result.get('context', ''),
            'metadata': result.get('metadata', {})
        }

    def _format_document_to_finding(self, doc: Dict[str, Any]) -> L5Finding:
        """
        Format a RAG document into a standardized L5Finding.

        Args:
            doc: Raw document from RAG service (UnifiedRAGService format)
                 Format: {'page_content': '...', 'metadata': {...}}

        Returns:
            Formatted L5Finding with citation
        """
        # UnifiedRAGService returns {'page_content': '...', 'metadata': {...}}
        metadata = doc.get('metadata', {})

        # Extract document fields from metadata
        title = metadata.get('title', doc.get('title', 'Untitled Document'))
        content = doc.get('page_content', doc.get('content', ''))
        relevance = metadata.get('score', metadata.get('relevance', doc.get('score', 0.8)))
        source_type = metadata.get('source_type', metadata.get('type', 'rag'))
        source_url = metadata.get('url', metadata.get('source_url', doc.get('url')))
        doc_id = metadata.get('id', metadata.get('document_id', doc.get('id')))

        # Truncate content for context efficiency
        max_content_length = 500
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."

        # Format citation
        citation = self._format_citation(doc, metadata)

        # Extract metadata for L5Finding
        finding_metadata = {
            'document_id': doc_id,
            'namespace': metadata.get('namespace', metadata.get('domain', doc.get('namespace'))),
            'created_at': metadata.get('created_at', doc.get('created_at')),
            'author': metadata.get('author', doc.get('author')),
            'page_number': metadata.get('page_number', doc.get('page_number')),
            'source': metadata.get('source', 'Internal KB'),
        }
        # Remove None values
        finding_metadata = {k: v for k, v in finding_metadata.items() if v is not None}

        return L5Finding(
            source_tool=self.TOOL_TYPE,
            title=title,
            content=content,
            relevance_score=float(relevance) if relevance else 0.8,
            citation=citation,
            source_url=source_url,
            source_type=source_type,
            metadata=finding_metadata
        )

    def _format_citation(self, doc: Dict[str, Any], metadata: Dict[str, Any]) -> str:
        """
        Format a citation string for the document.

        Args:
            doc: Document data (may have page_content/metadata structure)
            metadata: Pre-extracted metadata dict

        Returns:
            Formatted citation string
        """
        title = metadata.get('title', doc.get('title', 'Untitled'))
        author = metadata.get('author', doc.get('author'))
        year = metadata.get('year', metadata.get('publication_year', doc.get('year')))
        source = metadata.get('source', metadata.get('namespace', 'Internal KB'))
        page = metadata.get('page_number', doc.get('page_number'))

        parts = [f'"{title}"']

        if author:
            parts.append(f"by {author}")

        if year:
            parts.append(f"({year})")

        parts.append(f"[{source}]")

        if page:
            parts.append(f"p.{page}")

        return " ".join(parts)

    def get_stats(self) -> Dict[str, Any]:
        """Get tool execution statistics."""
        return {
            'tool_type': self.TOOL_TYPE,
            'level': self.LEVEL,
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

_l5_rag_tool: Optional[L5RAGToolAgent] = None


def get_l5_rag_tool(rag_service: Optional[UnifiedRAGService] = None) -> L5RAGToolAgent:
    """
    Get or create L5 RAG Tool Agent singleton.

    Args:
        rag_service: Optional UnifiedRAGService to inject on first creation.
                    Subsequent calls ignore this parameter.

    Returns:
        L5RAGToolAgent singleton instance
    """
    global _l5_rag_tool
    if _l5_rag_tool is None:
        _l5_rag_tool = L5RAGToolAgent(rag_service=rag_service)
    return _l5_rag_tool


def create_l5_rag_tool(rag_service: UnifiedRAGService) -> L5RAGToolAgent:
    """
    Create a new L5 RAG Tool Agent instance (non-singleton).

    Use this for testing or when you need a fresh instance with
    a specific RAG service.

    Args:
        rag_service: UnifiedRAGService instance to use

    Returns:
        New L5RAGToolAgent instance
    """
    return L5RAGToolAgent(rag_service=rag_service)


def create_l5_rag_config_from_agent(
    agent_metadata: Dict[str, Any],
    knowledge_namespaces: Optional[List[str]] = None,
    mode1: bool = True
) -> L5ToolConfig:
    """
    Create L5ToolConfig from agent metadata.

    Args:
        agent_metadata: Agent's metadata JSONB field
        knowledge_namespaces: Agent's assigned RAG namespaces
        mode1: Whether this is Mode 1 (applies speed limits)

    Returns:
        L5ToolConfig with resolved values
    """
    l5_config = agent_metadata.get('l5_config', {})

    # Get max_findings from agent config
    max_findings = l5_config.get('max_findings_per_tool', 5)

    # Mode 1 cap: max 3 findings for speed
    if mode1:
        max_findings = min(max_findings, 3)

    # Get timeout from agent config (Mode 1 override: 500ms)
    timeout_ms = l5_config.get('timeout_ms', 3000)
    if mode1:
        timeout_ms = 500  # Hard limit for chat responsiveness

    return L5ToolConfig(
        tool_type="rag",
        enabled=l5_config.get('rag_enabled', True),
        max_findings=max_findings,
        timeout_ms=timeout_ms,
        namespaces=knowledge_namespaces or []
    )
